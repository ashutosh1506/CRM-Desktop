const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "https://crm-desktop-blue.vercel.app"],
    credentials: true,
  })
);
app.use(express.json());

// MongoDB connection
mongoose.connect(
  process.env.MONGODB_URI || "mongodb://localhost:27017/xeno-crm",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

// Google OAuth client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Models
const Customer = require("./models/Customer");
const Order = require("./models/Order");
const Campaign = require("./models/Campaign");
const CommunicationLog = require("./models/CommunicationLog");

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET || "your-secret-key",
    (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    }
  );
};

// Routes

// Auth routes
app.post("/api/auth/google", async (req, res) => {
  try {
    const { credential } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    };

    const token = jwt.sign(user, process.env.JWT_SECRET || "your-secret-key");
    res.json({ token, user });
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ error: "Authentication failed" });
  }
});

app.get("/api/auth/verify", authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// Dashboard stats
app.get("/api/dashboard/stats", authenticateToken, async (req, res) => {
  try {
    const totalCustomers = await Customer.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalCampaigns = await Campaign.countDocuments();
    const recentActivity = await CommunicationLog.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    });

    res.json({
      totalCustomers,
      totalOrders,
      totalCampaigns,
      recentActivity,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Customer routes
app.post("/api/customers", authenticateToken, async (req, res) => {
  try {
    const customer = new Customer(req.body);
    await customer.save();
    res.status(201).json(customer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/api/customers", authenticateToken, async (req, res) => {
  try {
    const customers = await Customer.find();
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Order routes
app.post("/api/orders", authenticateToken, async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();

    // Update customer's total spends and visits
    const customer = await Customer.findOne({ email: req.body.customerEmail });
    if (customer) {
      customer.totalSpends += req.body.amount;
      customer.visits += 1;
      customer.lastVisit = new Date();
      await customer.save();
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/api/orders", authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find().sort({ date: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Campaign routes
app.post("/api/campaigns/preview", authenticateToken, async (req, res) => {
  try {
    const { rules } = req.body;
    const query = buildMongoQuery(rules);
    const count = await Customer.countDocuments(query);
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/campaigns", authenticateToken, async (req, res) => {
  try {
    const { name, message, rules, audienceSize } = req.body;

    const campaign = new Campaign({
      name,
      message,
      rules,
      audienceSize,
      status: "pending",
      sentCount: 0,
      failedCount: 0,
    });

    await campaign.save();

    // Start sending messages asynchronously
    sendCampaignMessages(campaign._id, rules, message);

    res.status(201).json(campaign);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/api/campaigns", authenticateToken, async (req, res) => {
  try {
    const campaigns = await Campaign.find().sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delivery receipt endpoint
app.post("/api/delivery-receipt", async (req, res) => {
  try {
    const { logId, status } = req.body;

    await CommunicationLog.findByIdAndUpdate(logId, { status });

    // Update campaign stats
    const log = await CommunicationLog.findById(logId);
    if (log) {
      const campaign = await Campaign.findById(log.campaignId);
      if (campaign) {
        if (status === "SENT") {
          campaign.sentCount += 1;
        } else {
          campaign.failedCount += 1;
        }

        // Check if campaign is complete
        if (
          campaign.sentCount + campaign.failedCount >=
          campaign.audienceSize
        ) {
          campaign.status = "completed";
        }

        await campaign.save();
      }
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper functions
function buildMongoQuery(rules) {
  if (rules.length === 0) return {};

  const conditions = rules.map((rule) => {
    const condition = {};

    if (rule.field === "lastVisit") {
      // Convert days to date comparison
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - Number.parseInt(rule.value));

      switch (rule.operator) {
        case ">":
          condition[rule.field] = { $lt: daysAgo };
          break;
        case "<":
          condition[rule.field] = { $gt: daysAgo };
          break;
        case ">=":
          condition[rule.field] = { $lte: daysAgo };
          break;
        case "<=":
          condition[rule.field] = { $gte: daysAgo };
          break;
        case "=":
          condition[rule.field] = daysAgo;
          break;
      }
    } else {
      const value = Number.parseFloat(rule.value);
      switch (rule.operator) {
        case ">":
          condition[rule.field] = { $gt: value };
          break;
        case "<":
          condition[rule.field] = { $lt: value };
          break;
        case ">=":
          condition[rule.field] = { $gte: value };
          break;
        case "<=":
          condition[rule.field] = { $lte: value };
          break;
        case "=":
          condition[rule.field] = value;
          break;
      }
    }

    return condition;
  });

  // Build query with AND/OR logic
  if (conditions.length === 1) {
    return conditions[0];
  }

  const query = { $and: [] };
  let currentGroup = [conditions[0]];

  for (let i = 1; i < conditions.length; i++) {
    const rule = rules[i];
    if (rule.logic === "OR") {
      if (currentGroup.length > 1) {
        query.$and.push({ $and: currentGroup });
      } else {
        query.$and.push(currentGroup[0]);
      }
      currentGroup = [conditions[i]];
    } else {
      currentGroup.push(conditions[i]);
    }
  }

  if (currentGroup.length > 1) {
    query.$and.push({ $and: currentGroup });
  } else {
    query.$and.push(currentGroup[0]);
  }

  return query;
}

async function sendCampaignMessages(campaignId, rules, messageTemplate) {
  try {
    // Update campaign status to sending
    await Campaign.findByIdAndUpdate(campaignId, { status: "sending" });

    const query = buildMongoQuery(rules);
    const customers = await Customer.find(query);

    for (const customer of customers) {
      // Create communication log entry
      const log = new CommunicationLog({
        campaignId,
        customerId: customer._id,
        customerEmail: customer.email,
        message: messageTemplate.replace("{name}", customer.name),
        status: "PENDING",
      });

      await log.save();

      // Simulate sending message to vendor API
      setTimeout(() => {
        sendToVendorAPI(
          log._id,
          customer,
          messageTemplate.replace("{name}", customer.name)
        );
      }, Math.random() * 5000); // Random delay up to 5 seconds
    }
  } catch (error) {
    console.error("Error sending campaign messages:", error);
  }
}

async function sendToVendorAPI(logId, customer, message) {
  try {
    // Simulate vendor API call with 90% success rate
    const isSuccess = Math.random() < 0.9;
    const status = isSuccess ? "SENT" : "FAILED";

    // Simulate API response delay
    setTimeout(async () => {
      // Call our delivery receipt endpoint
      await fetch("http://localhost:5000/api/delivery-receipt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          logId,
          status,
        }),
      });
    }, Math.random() * 2000 + 1000); // 1-3 second delay
  } catch (error) {
    console.error("Error calling vendor API:", error);
  }
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

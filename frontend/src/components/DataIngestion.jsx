import { useState } from "react";
import { Upload, Users, ShoppingCart } from "lucide-react";
import toast from "react-hot-toast";
import React from "react";


export default function DataIngestion() {
  const [activeTab, setActiveTab] = useState("customers");
  const [customerData, setCustomerData] = useState({
    name: "",
    email: "",
    phone: "",
    totalSpends: "",
    visits: "",
    lastVisit: "",
  });
  const [orderData, setOrderData] = useState({
    customerEmail: "",
    amount: "",
    date: "",
    items: "",
  });

  const handleCustomerSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/customers`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            ...customerData,
            totalSpends: Number.parseFloat(customerData.totalSpends),
            visits: Number.parseInt(customerData.visits),
            lastVisit: new Date(customerData.lastVisit),
          }),
        }
      );

      if (response.ok) {
        toast.success("Customer added successfully!");
        setCustomerData({
          name: "",
          email: "",
          phone: "",
          totalSpends: "",
          visits: "",
          lastVisit: "",
        });
      } else {
        toast.error("Failed to add customer");
      }
    } catch (error) {
      toast.error("Error adding customer");
    }
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            ...orderData,
            amount: Number.parseFloat(orderData.amount),
            date: new Date(orderData.date),
            items: orderData.items.split(",").map((item) => item.trim()),
          }),
        }
      );

      if (response.ok) {
        toast.success("Order added successfully!");
        setOrderData({
          customerEmail: "",
          amount: "",
          date: "",
          items: "",
        });
      } else {
        toast.error("Failed to add order");
      }
    } catch (error) {
      toast.error("Error adding order");
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Data Ingestion</h1>
          <p className="mt-2 text-gray-600">
            Import customer and order data into your CRM
          </p>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab("customers")}
                className={`${
                  activeTab === "customers"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm flex items-center`}
              >
                <Users className="w-4 h-4 mr-2" />
                Customers
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={`${
                  activeTab === "orders"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm flex items-center`}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Orders
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "customers" && (
              <form onSubmit={handleCustomerSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <input
                      type="text"
                      required
                      value={customerData.name}
                      onChange={(e) =>
                        setCustomerData({
                          ...customerData,
                          name: e.target.value,
                        })
                      }
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={customerData.email}
                      onChange={(e) =>
                        setCustomerData({
                          ...customerData,
                          email: e.target.value,
                        })
                      }
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={customerData.phone}
                      onChange={(e) =>
                        setCustomerData({
                          ...customerData,
                          phone: e.target.value,
                        })
                      }
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Total Spends (₹)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={customerData.totalSpends}
                      onChange={(e) =>
                        setCustomerData({
                          ...customerData,
                          totalSpends: e.target.value,
                        })
                      }
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Number of Visits
                    </label>
                    <input
                      type="number"
                      required
                      value={customerData.visits}
                      onChange={(e) =>
                        setCustomerData({
                          ...customerData,
                          visits: e.target.value,
                        })
                      }
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Last Visit
                    </label>
                    <input
                      type="date"
                      required
                      value={customerData.lastVisit}
                      onChange={(e) =>
                        setCustomerData({
                          ...customerData,
                          lastVisit: e.target.value,
                        })
                      }
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Add Customer
                </button>
              </form>
            )}

            {activeTab === "orders" && (
              <form onSubmit={handleOrderSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Customer Email
                    </label>
                    <input
                      type="email"
                      required
                      value={orderData.customerEmail}
                      onChange={(e) =>
                        setOrderData({
                          ...orderData,
                          customerEmail: e.target.value,
                        })
                      }
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Amount (₹)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={orderData.amount}
                      onChange={(e) =>
                        setOrderData({ ...orderData, amount: e.target.value })
                      }
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Order Date
                    </label>
                    <input
                      type="date"
                      required
                      value={orderData.date}
                      onChange={(e) =>
                        setOrderData({ ...orderData, date: e.target.value })
                      }
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Items (comma-separated)
                    </label>
                    <input
                      type="text"
                      required
                      value={orderData.items}
                      onChange={(e) =>
                        setOrderData({ ...orderData, items: e.target.value })
                      }
                      placeholder="Product A, Product B, Product C"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Add Order
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

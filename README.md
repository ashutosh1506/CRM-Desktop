# Xeno CRM Platform

A Mini CRM Platform. This application enables customer segmentation, personalized campaign delivery, and campaign tracking.

## Project Structure

\`\`\`
xeno-crm-platform/
├── frontend/ # React.js frontend
│ ├── src/
│ │ ├── components/ # React components
│ │ ├── contexts/ # React contexts (Auth)
│ │ └── App.jsx # Main app component
│ ├── package.json # Frontend dependencies
│ └── .env # Frontend environment variables
├── backend/ # Node.js backend
│ ├── models/ # MongoDB models
│ ├── server.js # Express server
│ ├── package.json # Backend dependencies
│ └── .env # Backend environment variables
└── README.md # This file
\`\`\`

## Features

### ✅ Core Features Implemented

1. **Data Ingestion APIs**

   - REST APIs for customers and orders data
   - Secure endpoints with JWT authentication
   - Input validation and error handling

2. **Campaign Creation UI**

   - Dynamic rule builder for audience segmentation
   - Flexible conditions with AND/OR logic
   - Real-time audience size preview
   - Intuitive web interface

3. **Campaign Delivery & Logging**

   - Automated message delivery simulation
   - Communication logging with delivery status
   - 90% success rate simulation as specified
   - Delivery receipt API for status updates

4. **Authentication**

   - Google OAuth 2.0 integration
   - JWT-based session management
   - Protected routes and API endpoints

5. **Campaign History**
   - List of all past campaigns
   - Delivery statistics (sent, failed, audience size)
   - Campaign status tracking
   - Most recent campaigns displayed first

## Tech Stack

- **Frontend**: React.js with React Router, Tailwind CSS, Lucide React icons
- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Google OAuth 2.0 + JWT tokens

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- Google OAuth 2.0 credentials

### Backend Setup

1. Navigate to the backend directory:
   \`\`\`bash
   cd backend
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Create a `.env` file with the required environment variables (see Environment Variables section below)

4. Start the backend server:
   \`\`\`bash
   npm run dev
   \`\`\`

### Frontend Setup

1. Navigate to the frontend directory:
   \`\`\`bash
   cd frontend
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Create a `.env` file with the required environment variables (see Environment Variables section below)

4. Start the React development server:
   \`\`\`bash
   npm start
   \`\`\`



## API Endpoints

### Authentication

- `POST /api/auth/google` - Google OAuth login
- `GET /api/auth/verify` - Verify JWT token

### Dashboard

- `GET /api/dashboard/stats` - Get dashboard statistics

### Customers

- `POST /api/customers` - Add new customer
- `GET /api/customers` - Get all customers

### Orders

- `POST /api/orders` - Add new order

### Campaigns -> Not implemented yet

- `POST /api/campaigns/preview` - Preview audience size
- `POST /api/campaigns` - Create new campaign
- `GET /api/campaigns` - Get campaign history

### Delivery -> Not implemented yet

- `POST /api/delivery-receipt` - Delivery status webhook

## Usage Guide

1. **Login**: Use Google OAuth to authenticate
2. **Add Data**: Navigate to "Data Ingestion" to add customers and orders
3. **Create Campaign**:
   - Go to "Create Campaign"
   - Define audience rules using the rule builder
   - Preview audience size
   - Add campaign name and message template
   - Launch campaign
4. **Track Performance**: View campaign history and delivery stats

## Key Features

### Dynamic Rule Builder

- Support for multiple conditions with AND/OR logic
- Fields: Total Spends, Number of Visits, Days Since Last Visit
- Operators: >, <, >=, <=, =
- Real-time audience preview

### Message Personalization

- Template variables (e.g., {name})
- Personalized messages for each customer

### Delivery Simulation

- 90% success rate as specified
- Asynchronous message processing
- Real-time status updates


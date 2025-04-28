# Newspaper Supply Chain Management System

A comprehensive system for managing newspaper distribution, subscriptions, and deliveries.

## Features

- **Owner Dashboard**
  - Manage employees and their assignments
  - Track newspaper inventory and pricing
  - Monitor customer subscriptions
  - View delivery analytics
  - Receive notifications and alerts

- **Employee Dashboard**
  - View assigned delivery routes
  - Track daily deliveries
  - Update delivery status

- **Database Features**
  - Secure user authentication
  - Automated notifications
  - Data integrity constraints
  - Efficient querying for analytics

## Tech Stack

- **Backend**: Node.js, Express, Sequelize
- **Database**: MySQL
- **Frontend**: React, Material-UI (to be implemented)
- **Authentication**: JWT

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   DB_HOST=localhost
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=newspaper_supply_chain
   PORT=5000
   JWT_SECRET=your_secret_key
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

## Database Schema

The system uses the following tables:
- `owner`: Store owner credentials and information
- `employee`: Delivery staff information
- `customer`: Subscriber details
- `newspaper`: Newspaper inventory and pricing
- `subscription`: Customer subscriptions
- `delivery`: Daily delivery records
- `notifications`: System alerts and updates

## API Endpoints

(To be implemented)
- Authentication
- Owner management
- Employee management
- Customer management
- Subscription handling
- Delivery tracking
- Analytics and reporting

## Security Features

- Password hashing
- JWT authentication
- Role-based access control
- Input validation
- SQL injection prevention

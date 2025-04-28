const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const sequelize = require('../config/sequelize');
const {Groq} = require('groq-sdk');
require('dotenv').config();

// Initialize Groq client
const groqClient = new Groq({
  apiKey: "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"
});

// Create a database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Newspaper delivery business specialized prompt
const NEWSPAPER_BUSINESS_PROMPT = `You are a specialized assistant for newspaper delivery business management. Your capabilities include:

1. Providing data-driven insights from the newspaper_supply_chain database
2. Answering questions about employee management, customer subscriptions, delivery routes, and newspapers
3. Offering business analytics and performance metrics for newspaper distribution
4. Suggesting optimization strategies for delivery operations
5. Monitoring payment statuses and subscription renewals
6. Tracking inventory and newspaper circulation
7. Assisting with customer relationship management
8. Providing delivery scheduling and route optimization advice
9. Helping with financial aspects like pricing, payment collection, and subscription fees
10. Offering market trends and competitive analysis for the newspaper industry

When accessing database information:
- Always verify you have owner context before providing specific data
- Present data in a clear, organized format
- Highlight actionable insights from the data
- Respect data privacy and only share information the owner has access to
- Provide appropriate visualizations when relevant (tables, lists)
- Indicate when data is unavailable or incomplete
- I have noticed that you answer incorrect information with respect to umbers present in dtabase,so verify it for 2 times atleast and inform the user.

You are a database assistant. Never make assumptions or guess information. Always fetch data from the database and respond based only on that. If data is missing, say you cannot find it. Do not infer or make up values. If there's a discrepancy between user input and database, ask the user if they want to update the database.
Your tone should be professional, data-focused, and business-oriented while remaining approachable and helpful.
`;

// Handle chat requests
router.post('/api/chat', async (req, res) => {
  try {
    const { message, history, ownerId } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Extract the user's query
    const userQuery = message.toLowerCase();
    console.log('Processing user query:', userQuery);
    
    // Check if this is the first message and insert our specialized prompt
    let updatedHistory = history || [];
    if (updatedHistory.length <= 1) { // Only system message or no messages yet
      updatedHistory = [{
        role: "system",
        content: NEWSPAPER_BUSINESS_PROMPT
      }];
      if (history && history.length > 0 && history[0].role === "user") {
        updatedHistory.push(history[0]);
      }
    }
    
    // Add user message to history if not already there
    const lastMessage = updatedHistory[updatedHistory.length - 1];
    if (lastMessage?.role !== "user" || lastMessage?.content !== message) {
      updatedHistory.push({ role: "user", content: message });
    }

    let dbContext = null;
    let result = null;
    
    // Connect to database and gather relevant data based on query
    try {
      const connection = await pool.getConnection();
      console.log('Database connection established successfully');
      
      try {
        // First, check table names to match your actual schema
        const [tables] = await connection.query('SHOW TABLES');
        console.log('Available tables:', tables.map(t => Object.values(t)[0]));
        
        // Determine the correct table names from the database
        const tableMap = {};
        tables.forEach(t => {
          const tableName = Object.values(t)[0].toLowerCase();
          if (tableName.includes('employee')) tableMap.employees = Object.values(t)[0];
          if (tableName.includes('customer')) tableMap.customers = Object.values(t)[0];
          if (tableName.includes('newspaper')) tableMap.newspapers = Object.values(t)[0];
          if (tableName.includes('subscription')) tableMap.subscriptions = Object.values(t)[0];
          if (tableName.includes('deliver')) tableMap.deliveries = Object.values(t)[0];
        });
        
        console.log('Table mapping:', tableMap);
        
        if (userQuery.includes('employee') || userQuery.includes('staff')) {
          // Employee information query
          const employeeTable = tableMap.employees || 'employee';
          console.log(`Using employee table: ${employeeTable}`);
          const [rows] = await connection.execute(
            `SELECT * FROM ${employeeTable} WHERE owner_id = ? LIMIT 5`,
            [ownerId || 1]
          );
          result = {
            type: 'employees',
            data: rows
          };
          dbContext = `Employee data: ${JSON.stringify(rows)}`;
          
        } else if (userQuery.includes('customer')) {
          // Customer information query
          const customerTable = tableMap.customers || 'customer';
          console.log(`Using customer table: ${customerTable}`);
          const [rows] = await connection.execute(
            `SELECT * FROM ${customerTable} LIMIT 5`
          );
          result = {
            type: 'customers',
            data: rows
          };
          dbContext = `Customer data: ${JSON.stringify(rows)}`;
          
        } else if (userQuery.includes('newspaper')) {
          // Newspaper information query
          const newspaperTable = tableMap.newspapers || 'newspaper';
          console.log(`Using newspaper table: ${newspaperTable}`);
          const [rows] = await connection.execute(
            `SELECT * FROM ${newspaperTable} WHERE owner_id = ? LIMIT 5`,
            [ownerId || 1]
          );
          result = {
            type: 'newspapers',
            data: rows
          };
          dbContext = `Newspaper data: ${JSON.stringify(rows)}`;
          
        } else if (userQuery.includes('subscription')) {
          // Subscription information query
          const subscriptionTable = tableMap.subscriptions || 'subscription';
          const customerTable = tableMap.customers || 'customer';
          const newspaperTable = tableMap.newspapers || 'newspaper';
          console.log(`Using subscription table: ${subscriptionTable}`);
          
          const [rows] = await connection.execute(
            `SELECT s.*, c.name as customer_name, n.title as newspaper_title 
             FROM ${subscriptionTable} s 
             JOIN ${customerTable} c ON s.customer_id = c.customer_id 
             JOIN ${newspaperTable} n ON s.newspaper_id = n.newspaper_id 
             LIMIT 5`
          );
          result = {
            type: 'subscriptions',
            data: rows
          };
          dbContext = `Subscription data: ${JSON.stringify(rows)}`;
          
        } else if (userQuery.includes('delivery') || userQuery.includes('route')) {
          // Delivery information query
          const deliveryTable = tableMap.deliveries || 'delivery';
          const employeeTable = tableMap.employees || 'employee';
          const customerTable = tableMap.customers || 'customer';
          const newspaperTable = tableMap.newspapers || 'newspaper';
          console.log(`Using delivery table: ${deliveryTable}`);
          
          const [rows] = await connection.execute(
            `SELECT d.*, e.name as employee_name, c.name as customer_name, 
             n.title as newspaper_title 
             FROM ${deliveryTable} d 
             JOIN ${employeeTable} e ON d.employee_id = e.employee_id 
             JOIN ${customerTable} c ON d.customer_id = c.customer_id 
             JOIN ${newspaperTable} n ON d.newspaper_id = n.newspaper_id 
             LIMIT 5`
          );
          result = {
            type: 'deliveries',
            data: rows
          };
          dbContext = `Delivery data: ${JSON.stringify(rows)}`;
          
        } else {
          // General business summary
          const employeeTable = tableMap.employees || 'employee';
          const customerTable = tableMap.customers || 'customer';
          const newspaperTable = tableMap.newspapers || 'newspaper';
          const subscriptionTable = tableMap.subscriptions || 'subscription';
          const deliveryTable = tableMap.deliveries || 'delivery';
          
          const [employeeCount] = await connection.execute(
            `SELECT COUNT(*) as count FROM ${employeeTable} WHERE owner_id = ?`,
            [ownerId || 1]
          );
          
          const [customerCount] = await connection.execute(
            `SELECT COUNT(*) as count FROM ${customerTable}`
          );
          
          const [newspaperCount] = await connection.execute(
            `SELECT COUNT(*) as count FROM ${newspaperTable} WHERE owner_id = ?`,
            [ownerId || 1]
          );
          
          const [activeSubscriptions] = await connection.execute(
            `SELECT COUNT(*) as count FROM ${subscriptionTable} s 
             JOIN ${newspaperTable} n ON s.newspaper_id = n.newspaper_id
             WHERE s.status = 'active' AND n.owner_id = ?`,
            [ownerId || 1]
          );
          
          const [pendingDeliveries] = await connection.execute(
            `SELECT COUNT(*) as count FROM ${deliveryTable} WHERE status = 'pending'`
          );
          
          result = {
            type: 'summary',
            data: {
              employeeCount: employeeCount[0].count,
              customerCount: customerCount[0].count,
              newspaperCount: newspaperCount[0].count,
              activeSubscriptions: activeSubscriptions[0].count,
              pendingDeliveries: pendingDeliveries[0].count
            }
          };
          
          dbContext = `Business summary: ${JSON.stringify(result.data)}`;
        }
      } catch (queryError) {
        console.error('Database query error:', queryError);
        throw queryError;
      } finally {
        connection.release();
      }
      
      // Add database context as a system message
      if (dbContext) {
        updatedHistory.push({
          role: "system",
          content: `Here is relevant information from the database: ${dbContext}`
        });
      }
      
      // Call Groq API for a more natural response
      try {
        console.log('Calling Groq API with messages:', updatedHistory);
        const groqResponse = await groqClient.chat.completions.create({
          messages: updatedHistory,
          model: "llama3-70b-8192",
          temperature: 0.4,
          max_tokens: 800,
        });
        
        // Get response from Groq
        const responseText = groqResponse.choices[0].message.content;
        console.log('Got Groq API response');
        
        // Send response back to client
        res.json({ message: responseText });
        
      } catch (groqError) {
        console.error('Error calling Groq API, falling back to local response:', groqError);
        
        // Format response based on the data (fallback to original logic)
        let response = "";
        if (result) {
          switch (result.type) {
            case 'employees':
              response = formatDataResponse('employees', result.data);
              break;
            case 'customers':
              response = formatDataResponse('customers', result.data);
              break;
            case 'newspapers':
              response = formatDataResponse('newspapers', result.data);
              break;
            case 'subscriptions':
              response = formatDataResponse('subscriptions', result.data);
              break;
            case 'deliveries':
              response = formatDataResponse('deliveries', result.data);
              break;
            case 'summary':
              response = `Here's a summary of your newspaper delivery business:
                
  - Employees: ${result.data.employeeCount}
  - Customers: ${result.data.customerCount}
  - Newspapers: ${result.data.newspaperCount}
  - Active Subscriptions: ${result.data.activeSubscriptions}
  - Pending Deliveries: ${result.data.pendingDeliveries}
  
  What specific information about your business would you like to know?`;
              break;
          }
        }
        
        // If response is still empty, provide a fallback
        if (!response) {
          response = `I understand you're interested in ${extractTopic(userQuery)} related to your newspaper delivery business. Could you please be more specific about what information you're looking for?`;
        }
        
        res.json({ message: response });
      }
      
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      
      // Try to use Groq without database context
      try {
        console.log('Trying Groq API without database context');
        const groqResponse = await groqClient.chat.completions.create({
          messages: updatedHistory,
          model: "llama3-70b-8192",
          temperature: 0.5,
          max_tokens: 800,
        });
        
        // Get response from Groq
        const responseText = groqResponse.choices[0].message.content;
        
        // Send response back to client
        res.json({ message: responseText });
        
      } catch (groqError) {
        console.error('Error calling Groq API:', groqError);
        
        // Final fallback response
        const response = `I couldn't connect to the database to get specific information about "${extractTopic(userQuery)}". Here's some general information instead:

If you're asking about employees, I can help you manage your delivery staff records, track performance, and optimize staffing.

For customers, I can assist with subscription management, tracking preferences, and managing customer relationships.

Regarding newspapers, I can help track inventory, manage publication details, and analyze circulation.

For deliveries, I can assist with route optimization, delivery scheduling, and tracking delivery status.

Please try again or let me know if you need help with something else!`;
        
        res.json({ message: response });
      }
    }
    
  } catch (error) {
    console.error('Error handling chat request:', error);
    res.status(500).json({ error: 'An error occurred while processing your request' });
  }
});

// Format data for different entity types
function formatDataResponse(type, data) {
  if (!data || data.length === 0) {
    return `I couldn't find any ${type} records in the database.`;
  }
  
  let response = '';
  
  switch (type) {
    case 'employees':
      response = `Here are your employees:\n\n`;
      data.forEach((emp, i) => {
        response += `${i+1}. ${emp.name} (${emp.role || 'Employee'})\n`;
        response += `   Email: ${emp.email}\n`;
        if (emp.phone) response += `   Phone: ${emp.phone}\n`;
        response += '\n';
      });
      break;
      
    case 'customers':
      response = `Here are the recent customers:\n\n`;
      data.forEach((cust, i) => {
        response += `${i+1}. ${cust.name}\n`;
        response += `   Email: ${cust.email}\n`;
        response += `   Address: ${cust.address}\n`;
        if (cust.phone) response += `   Phone: ${cust.phone}\n`;
        response += '\n';
      });
      break;
      
    case 'newspapers':
      response = `Here are your newspapers:\n\n`;
      data.forEach((paper, i) => {
        response += `${i+1}. ${paper.title || paper.name}\n`;
        if (paper.publisher) response += `   Publisher: ${paper.publisher}\n`;
        if (paper.frequency) response += `   Frequency: ${paper.frequency}\n`;
        response += `   Price: $${paper.price || paper.selling_price}\n`;
        response += '\n';
      });
      break;
      
    case 'subscriptions':
      response = `Here are recent subscriptions:\n\n`;
      data.forEach((sub, i) => {
        response += `${i+1}. ${sub.customer_name} - ${sub.newspaper_title}\n`;
        response += `   Status: ${sub.status}\n`;
        response += `   Monthly fee: $${sub.monthly_fee}\n`;
        const nextPaymentDate = sub.next_payment_date ? 
          new Date(sub.next_payment_date).toLocaleDateString() : 'Not set';
        response += `   Next payment: ${nextPaymentDate}\n`;
        response += '\n';
      });
      break;
      
    case 'deliveries':
      response = `Here are recent deliveries:\n\n`;
      data.forEach((del, i) => {
        response += `${i+1}. ${del.newspaper_title} to ${del.customer_name}\n`;
        response += `   Delivered by: ${del.employee_name}\n`;
        response += `   Date: ${new Date(del.delivery_date).toLocaleDateString()}\n`;
        response += `   Status: ${del.status}\n`;
        response += '\n';
      });
      break;
  }
  
  if (data.length === 5) {
    response += 'Only showing 5 records. You can ask for more specific information if needed.';
  }
  
  return response;
}

function extractTopic(query) {
  // Extract the main topic from the query
  const topics = ['employee', 'staff', 'customer', 'newspaper', 'subscription', 'payment', 'delivery', 'route'];
  
  for (const topic of topics) {
    if (query.includes(topic)) {
      return topic;
    }
  }
  
  return "information";
}

module.exports = router;
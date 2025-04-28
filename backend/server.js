const express = require('express');
const cors = require('cors');
const { initializeDatabase } = require('./config/database');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Add CORS headers middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Import routes
const routes = require('./routes');

// Safely import chat routes if file exists
let chatRoutes;
const chatRoutesPath = path.join(__dirname, 'routes', 'chatRoutes.js');
if (fs.existsSync(chatRoutesPath)) {
  try {
    chatRoutes = require('./routes/chatRoutes');
    console.log('Chat routes loaded successfully');
  } catch (error) {
    console.error('Failed to load chat routes:', error);
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Initialize database and start server
const startServer = async () => {
  try {
    // Initialize database
    const db = await initializeDatabase();
    console.log('Database initialized successfully');

    // Use routes
    app.use('/api', routes);
    
    // Safely use chat routes if loaded
    if (chatRoutes) {
      app.use(chatRoutes);
      console.log('Chat routes activated');
    }

    // Start server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
});

startServer();
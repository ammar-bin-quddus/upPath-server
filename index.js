// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();


// Allow requests from frontend
app.use(cors({
  origin: ['http://localhost:5173', 'https://uppath-dff52.web.app'],
  credentials: true,
}));

// Middleware to parse incoming JSON requests
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Connect to MongoDB using credentials from environment variables
mongoose.connect(
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.c6oz5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
).then(() => {
    console.log('✅ Connected to MongoDB');
}).catch((err) => {
    console.error('MongoDB connection error:', err);
});

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/roadmaps', require('./routes/roadmap'));

// for catch and debug 404 errors
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found', path: req.originalUrl });
});

// Start the server
app.listen(PORT, () => {
  console.log(`upPath Server is running on port: ${PORT}`);
});

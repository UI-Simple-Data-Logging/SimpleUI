// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan'); // Logging middleware

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev')); // Logs incoming HTTP requests

// MongoDB connection with logs
mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log('✅ MongoDB connection established');
})
.catch((err) => {
  console.error('❌ MongoDB connection failed:', err.message);
});

// Routes
app.use('/api/items', require('./routes/itemRoutes'));

// Fallback route
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

// Global error handler (optional)
app.use((err, req, res, next) => {
  console.error('🔥 Global Error:', err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
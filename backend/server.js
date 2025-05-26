// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());

// MongoDB connection with success/failure logs
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connection established');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
  });

// Routes
app.use('/api/items', require('./routes/itemRoutes'));

// Start server
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
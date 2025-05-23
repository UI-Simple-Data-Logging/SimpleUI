// backend/server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Initialize environment and app
dotenv.config();
const app = express();

/* app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
}); */


app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
// .then(() => console.log('✅ MongoDB connected')) // 🔇 remove or comment this
.catch((err) => console.error('MongoDB error:', err)); // Keep errors only

// Routes
app.use('/api/items', require('./routes/itemRoutes'));

// Start server
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  // console.log(`🚀 Server running on port ${PORT}`); // 🔇 silence this
});
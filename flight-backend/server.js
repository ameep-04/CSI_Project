const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const chatRoutes = require('./routes/chat');
const flightRoutes = require('./routes/flightRoutes');
const airportRoutes = require('./routes/airportRoutes');


dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Route logs
console.log("✅ Loading /api/chat route...");
app.use('/api/chat', chatRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/airports', airportRoutes);

// Test route
app.get('/test', (req, res) => {
  res.send('✅ Backend is working!');
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema({
  origin: String,
  destination: String,
  price: Number,
  airline: String,
  date: String
});

module.exports = mongoose.model('Flight', flightSchema);

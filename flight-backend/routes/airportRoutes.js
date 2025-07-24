// airportRoutes.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

router.get('/iata', async (req, res) => {
  const city = req.query.city?.toLowerCase();

  if (!city) {
    return res.status(400).json({ error: 'City name is required.' });
  }

  try {
    const dataPath = path.join(__dirname, '../data/iata-codes.json');
    const rawData = fs.readFileSync(dataPath);
    const codes = JSON.parse(rawData);

    const match = codes.find(item => item.city.toLowerCase() === city);

    if (match) {
      return res.json({ city: match.city, iata: match.iata });
    } else {
      return res.status(404).json({ error: `No IATA code found for ${city}` });
    }

  } catch (err) {
    console.error("❌ Failed to read IATA file:", err.message);
    return res.status(500).json({ error: "Server error while reading IATA code" });
  }
});

module.exports = router;



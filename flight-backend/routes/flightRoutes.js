// flightRoutes.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

const API_KEY = process.env.AVIATIONSTACK_API_KEY;

// Route: GET /api/flights/search?from=DEL&to=BOM&date=2025-07-20
router.get('/search', async (req, res) => {
  const { from, to, date } = req.query;

  if (!from || !to) {
    return res.status(400).json({ error: 'Both "from" and "to" IATA codes are required.' });
  }

  try {
    const response = await axios.get(`http://api.aviationstack.com/v1/flights`, {
      params: {
        access_key: API_KEY,
        dep_iata: from.toUpperCase(),
        arr_iata: to.toUpperCase(),
        flight_date: date, // Optional if provided
      },
    });

    const flights = response.data.data?.slice(0, 5) || [];

    const formatted = flights.map(f => `| ${f.airline.name.padEnd(20)} | ${f.flight.iata || 'N/A'} | ${f.departure.scheduled || 'N/A'} |`).join('\n');

    if (!formatted.length) {
      return res.json({ flights: [] });
    }

    const table = `| Airline               | Flight | Departure Time           |\n|----------------------|--------|---------------------------|\n${formatted}`;

    res.json({ flights: [table] });

  } catch (err) {
    console.error('Flight API error:', err.message);
    res.status(500).json({ error: 'Failed to fetch flights' });
  }
});

module.exports = router;
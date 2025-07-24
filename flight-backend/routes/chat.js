// chat.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const buildPrompt = (message) => `
You are a helpful flight booking assistant. From the user's message, extract this structured information as JSON:

{
  "from_city": "<departure city or null>",
  "to_city": "<destination city or null>",
  "date": "<date of travel in YYYY-MM-DD format or null>"
}

If any value is missing, return null for it. Do not include any explanation, only the JSON.
Message: "${message}"
`;

router.post('/', async (req, res) => {
  const userMessage = req.body.message;
  console.log("💬 User:", userMessage);

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(buildPrompt(userMessage));
    const responseText = result.response.text().replace(/```json|```/g, '').trim();

    let flightQuery;
    try {
      flightQuery = JSON.parse(responseText);
    } catch (err) {
      console.error("❌ Gemini JSON parsing failed:", responseText);
    }

    if (flightQuery?.from_city && flightQuery?.to_city) {
      const { from_city, to_city, date } = flightQuery;

      const fromRes = await axios.get('http://localhost:5000/api/airports/iata', {
        params: { city: from_city }
      });
      const toRes = await axios.get('http://localhost:5000/api/airports/iata', {
        params: { city: to_city }
      });

      const fromCode = fromRes.data.iata;
      const toCode = toRes.data.iata;

      if (!fromCode || !toCode) {
        return res.json({ reply: `❌ I couldn't find IATA codes for ${from_city} and/or ${to_city}.` });
      }

      const flightsRes = await axios.get('http://localhost:5000/api/flights/search', {
        params: { from: fromCode, to: toCode, date }
      });

      const flights = flightsRes.data.flights;

      const reply = flights.length
        ? `✅ Flights from ${from_city} (${fromCode}) to ${to_city} (${toCode})${date ? ` on ${date}` : ''}:

` + flights.join('\n')
        : `⚠️ No flights found from ${from_city} to ${to_city}.`;

      return res.json({ reply });
    }

    const fallbackResult = await model.generateContent(userMessage);
    const fallbackReply = fallbackResult.response.text();
    return res.json({ reply: fallbackReply });

  } catch (err) {
    console.error("🔥 Error in chatbot route:", err.message);
    return res.status(500).json({ reply: "Something went wrong while processing your request." });
  }
});

module.exports = router;

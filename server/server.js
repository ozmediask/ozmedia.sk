const express = require('express');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const CACHE_TTL_SECONDS = parseInt(process.env.CACHE_TTL_SECONDS || '300', 10);

if (!GOOGLE_API_KEY) {
  console.warn('WARNING: GOOGLE_API_KEY is not set. The /api/reviews endpoint will fail without it. Set it in .env.');
}

// Simple in-memory cache
const cache = new Map();

function setCache(key, value) {
  const expiresAt = Date.now() + CACHE_TTL_SECONDS * 1000;
  cache.set(key, { value, expiresAt });
}

function getCache(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

app.get('/api/reviews', async (req, res) => {
  const placeId = req.query.placeId || process.env.GOOGLE_PLACE_ID;
  if (!placeId) {
    return res.status(400).json({ error: 'placeId query parameter or GOOGLE_PLACE_ID env var required' });
  }

  const cacheKey = `reviews:${placeId}`;
  const cached = getCache(cacheKey);
  if (cached) return res.json(cached);

  if (!GOOGLE_API_KEY) {
    return res.status(500).json({ error: 'Server not configured with GOOGLE_API_KEY' });
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json`;
    const params = {
      place_id: placeId,
      key: GOOGLE_API_KEY,
      fields: 'name,rating,reviews,url,formatted_address,utc_offset' // limit the fields
    };

    const r = await axios.get(url, { params, timeout: 5000 });
    if (r.data.status !== 'OK') {
      return res.status(502).json({ error: 'Google Places API error', details: r.data });
    }

    const payload = {
      fetched_at: new Date().toISOString(),
      place: r.data.result
    };

    setCache(cacheKey, payload);
    res.json(payload);
  } catch (err) {
    console.error('Error fetching place details', err.message || err);
    res.status(502).json({ error: 'Failed to fetch place details', details: err.message });
  }
});

app.listen(PORT, () => console.log(`Reviews proxy running on port ${PORT}`));

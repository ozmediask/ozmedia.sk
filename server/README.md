# Google Reviews Proxy Server

This small Express app provides a single endpoint `/api/reviews` that securely calls the Google Places Details API server-side and returns the response to the client. It caches results in-memory to reduce API usage.

## Setup

1. Copy `.env.example` to `.env` and fill in `GOOGLE_API_KEY` and optional `GOOGLE_PLACE_ID`.

2. Install dependencies:

```
npm install
```

3. Run:

```
npm start
```

During development you can use:

```
npm run dev
```

Default server port is `8080`. Change via `PORT` env var.

## Endpoints

- `GET /api/reviews?placeId=PLACE_ID`
  - Returns JSON like `{ fetched_at, place: { name, rating, reviews, url, formatted_address, utc_offset } }`.
  - If `placeId` query parameter is omitted, `GOOGLE_PLACE_ID` env var will be used.

## Notes

- This proxy is intentionally minimal. For production, consider:
  - Adding authentication.
  - Persistent caching (redis, etc.)
  - Error monitoring and retry/backoff logic
  - Rate limiting per client

  ## Frontend integration

  - If you want the frontend to use the proxy, set `window.REVIEWS_PROXY` in your page before loading `js/google-reviews.js`.
    Example in `index.html`:

    <script>
      window.REVIEWS_PROXY = 'http://localhost:8080';
    </script>

  - You can omit `placeId` in the client if you have `GOOGLE_PLACE_ID` set on the server. Otherwise include `placeId` in `window.GOOGLE_REVIEWS_CONFIG`.

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

  - Deployment tip: for a frictionless setup "that works for everyone", consider hosting the proxy at the same origin (for example, mount the server behind your web server at `/api/`). The frontend will attempt to use the same origin by default (it sets `window.REVIEWS_PROXY = window.location.origin`), so if the proxy is accessible at `<your-site>/api/reviews` the reviews will work without further client changes.

  - Fallback: if you don't want to set a Place ID, you can set `GOOGLE_PLACE_ID` on the server or set `placeUrl` in `window.GOOGLE_REVIEWS_CONFIG` on the client (a Google share link) so the "Pozrieť viac na Google" button always points to your place.

  - Local JSON fallback: you can also provide a simple JSON file served with your site at `/data/reviews.json` (example included). Edit that file directly to add/remove reviews and the frontend will automatically use it when the proxy and Google API aren't available.

Local preview
-------------

If you want to open the site locally, use one of these options:

1) Open the file directly in the browser
   - Drag-and-drop `index.html` into your browser, or
   - Use the file URL format (Windows): `file:///C:/Users/ozibe/Documents/GitHub/ozmedia.sk/index.html` (note the three slashes).

2) Serve the site with a local static server (recommended)
   - Start a server from the project root:
     - `npx http-server -p 8080`
   - Open `http://localhost:8080` in your browser.

3) If you want the backend reviews proxy (in `server/`):
   - `cd server && npm install && npm start`
   - The proxy defaults to port 8080 (change with `PORT` env var).

Why you saw the DNS error
-------------------------
The browser was trying to resolve `c` as a hostname because the path was entered incorrectly in the address bar (e.g., `c/Users/...`). Use `file:///...` or serve the site to avoid this.
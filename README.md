# xPandorax Website

This is a static site for xPandorax. The repo contains HTML, CSS, JS assets and a small PWA service worker (`sw.js`).

## Run Locally (recommended)

Open PowerShell and run one of the following methods.

### 1) Quick: Python (no install other than Python required)
```powershell
cd 'C:\Users\DELL\OneDrive\Documents\GitHub\xpandorax.com'
python -m http.server 8000
# Open http://localhost:8000
```

Use `--bind 0.0.0.0` if you want to access the site from other devices on your LAN:
```powershell
python -m http.server 8000 --bind 0.0.0.0
# Open http://<your-machine-ip>:8000
```

### 2) Node (recommended if you already have Node.js)
```powershell
cd 'C:\Users\DELL\OneDrive\Documents\GitHub\xpandorax.com'
# If you installed dependencies
npm start
# Or use npx without installing
npx http-server -p 8000
# Open http://localhost:8000
```

### 3) Visual Studio Code Live Server
- Install Live Server extension in VS Code
- Right-click `index.html` -> Open with Live Server
- The site will be served on a local dev port

## Test Checklist
- Age gate
  - Clear Local Storage `ageVerified` and open the site at a non-localhost address (e.g., http://<machine-ip>:8000) to see the age gate overlay.
  - Confirm the age gate modal is visible and **no blur** is applied to the entire page.
  - Click "I am 18+ (ENTER)" and confirm the overlay hides.

- Interaction
  - Hamburger (mobile) menu opens and closes, Esc and outside click close it.
  - Search (type 3+ letters) shows autocomplete.
  - Load more buttons append more content.
  - Theme toggle and language menu work.

- Service worker
  - Run with `http://localhost` or on a secure site to test `sw.js` registration.

- Assets and meta
  - `og:image` and `twitter:image` should resolve: `assets/img/og-thumb.jpg`.

## Notes and Recommendations
- If pages show missing images or 404s, check the Network tab to find which paths are misconfigured.
- If you want a minimal script for local dev, run:
  - `npm i` to install dev dependencies (http-server)
  - `npm start` to start server

If you'd like, I can add a small script to automate local dev or add a Dockerfile for containerized serving.

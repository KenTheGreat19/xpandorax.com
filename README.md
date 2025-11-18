# xPandorax Website

This is a static site for xPandorax with a dedicated age verification landing page. The repo contains HTML, CSS, JS assets and a small PWA service worker (`sw.js`).

## Architecture

- **`index.html`** - Standalone age verification page (first page visitors see)
- **`home.html`** - Main website homepage (accessed after age verification)
- **Other pages** - Categories, videos, models, producers, contact, etc.

When visitors access `xpandorax.com`, they land on the age gate (`index.html`). After confirming they are 18+, they are redirected to `home.html` and the verification is stored in localStorage.

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

### Age Gate Flow
  - Open the site at `http://localhost:8000` (or your chosen URL)
  - Confirm you land on the age verification page (`index.html`)
  - The page should be **fully visible with no blur effects**
  - Click "I am 18+" to verify age
  - Confirm redirect to `home.html` (main site)
  - Refresh the page - you should stay on `home.html` (verification persisted in localStorage)
  - To test the age gate again: Clear localStorage `ageVerified` in DevTools -> Application -> Local Storage

### Interactive Elements
  - Hamburger (mobile) menu opens and closes, Esc and outside click close it
  - Search (type 3+ letters) shows autocomplete
  - Load more buttons append more content
  - Theme toggle and language menu work
  - All navigation links work correctly

### Service Worker
  - Run with `http://localhost` or on a secure site to test `sw.js` registration

### Assets and Meta
  - `og:image` and `twitter:image` should resolve: `assets/img/og-thumb.jpg`
  - Check Network tab for any 404 errors

## Notes and Recommendations
- The age gate is now a **separate landing page** instead of an overlay, eliminating blur effects and improving performance
- Age verification is stored in localStorage and persists across sessions
- To reset age verification for testing: Clear localStorage in DevTools
- If you want a minimal script for local dev, run:
  - `npm i` to install dev dependencies (http-server)
  - `npm start` to start server

If you'd like, I can add a small script to automate local dev or add a Dockerfile for containerized serving.

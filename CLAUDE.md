# Anantya 2026 — Claude Context & Guidelines

## Project Overview
- **Name:** Anantya 2026 (Janmashtami Festival Portal — Amrita Vishwa Vidyapeetham Chennai Campus)
- **Repository:** https://github.com/RITHWIK-DUDALA/Anantya.git
- **Stack:** Vite, React 18, Express.js (Node.js backend), Firebase Firestore, Custom CSS / Tailwind, Framer Motion, i18next.

## Key Development Commands
```bash
# Install dependencies
npm install

# Run local development (Frontend + Backend concurrently)
npm run dev

# Run frontend build
npm run build

# Start backend server independently
node server/index.js
```

## Architecture & Important Files
- `src/data/gamesData.js`: Central list of games, coordinators, venues, timings, posters, and participation rules.
- `server/utils/pricing.js`: Backend pricing calculation and discount engine. **Must remain synchronized with `gamesData.js`**.
- `src/data/timelineData.js`: Festival events schedule and timeline.
- `src/i18n/translations/`: Multi-language translations (`en.json`, `te.json`, `ta.json`, `ml.json`, `hi.json`).
- `src/config/config.js`: Global configuration, committee members, collaborating clubs, and contact info.
- `src/components/Registration.jsx`: Registration flow, token generation, and payment integration.
- `server/routes/register.js` & `server/routes/verify.js`: Backend API endpoints for registration and token verification.

## Core Rules & Conventions
1. **Pricing Sync:** When updating prices, always update both `src/data/gamesData.js` and `server/utils/pricing.js`.
2. **Assets:** Posters and photos are stored in `public/games/`, `public/photos/`, and `public/assets/`.
3. **Multilingual:** Update all translations when modifying core event times or descriptions.

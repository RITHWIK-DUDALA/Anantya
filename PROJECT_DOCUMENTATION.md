# Anantya 2026 — Master Project Architecture & Technical Guide

---

## 1. Executive Summary & Overview
**Anantya 2026** is a production-grade, full-stack event registration and management web application designed and built for the **Janmashtami 2026 celebrations at Amrita Vishwa Vidyapeetham, Chennai Campus**.

The platform provides a high-performance, cinematic user experience for event discovery, schedule tracking, movie screening reservations, multi-game registrations (solo & team), token generation, discount verification, real-time ticket check-in via QR scanners, and an administrative control panel.

- **Primary Repository:** `https://github.com/RITHWIK-DUDALA/Anantya.git`
- **Frontend URL / Dev Port:** `http://localhost:5173` (Vite)
- **Backend API Port:** `http://localhost:5000` (Node/Express)
- **Database:** Google Firebase Firestore
- **External Integrations:** Google Sheets Webhook, Razorpay Payment Gateway

---

## 2. High-Level System Architecture

```mermaid
graph TD
    Client["Client Browser (React 18 + Vite)"]
    
    subgraph Frontend ["Frontend Layer"]
        UI["Landing Page / Hero / Timeline"]
        Reg["Multi-Step Registration Flow"]
        Movie["Movie / Screen Seat Selection"]
        Venue["Venue QR Scanner / Check-in"]
        AdminUI["Admin Dashboard & Live Controls"]
    end

    subgraph Backend ["Node.js / Express Backend (Port 5000)"]
        Router["Express API Router (/api)"]
        AuthMiddleware["Admin Auth & Rate Limiter"]
        PriceEngine["Server Pricing & Discount Engine"]
        TokenGen["Atomic Token & QR Generator"]
    end

    subgraph Storage ["Database & External Services"]
        Firestore[("Firebase Firestore")]
        GSheets["Google Sheets Webhook"]
        Razorpay["Razorpay Gateway"]
    end

    Client --> Frontend
    Frontend --> Router
    Router --> AuthMiddleware
    Router --> PriceEngine
    Router --> TokenGen
    TokenGen --> Firestore
    Router --> GSheets
    Router --> Razorpay
```

---

## 3. Directory Structure & Key Files

```text
janmastami/
├── CLAUDE.md                    # Claude AI context file
├── PROJECT_DOCUMENTATION.md     # Master system architecture & technical guide
├── package.json                 # Project dependencies & scripts
├── vite.config.js               # Vite bundler configuration & proxy
├── server/                      # Express Backend
│   ├── index.js                 # Server entry point, middleware, routes mount
│   ├── firebase.js              # Firebase Admin SDK initialization
│   ├── middleware/              # Rate limiters, admin authenticators
│   ├── routes/                  # API route handlers
│   │   ├── register.js          # Main event registration endpoint
│   │   ├── verify.js            # Ticket verification and scan validation
│   │   ├── pricing.js           # Server discount code calculation
│   │   ├── admin.js             # Admin login, analytics, metrics, export
│   │   ├── settings.js          # Dynamic timeline & banner toggles
│   │   ├── movies.js            # Movie screenings, seats, snacks booking
│   │   ├── payment.js           # Razorpay order generation & HMAC verification
│   │   ├── events.js            # Live events CRUD
│   │   ├── status.js            # Registration status lookup
│   │   └── contact.js           # Contact form submissions
│   └── utils/
│       └── pricing.js           # Ground-truth game price list & discount logic
├── src/                         # React Frontend
│   ├── App.jsx                  # Main router, route definitions, layout
│   ├── main.jsx                 # React root render & i18n init
│   ├── index.css                # Global styles, variables, typography, animations
│   ├── config/
│   │   └── config.js            # Global constants, committee, clubs, contact info
│   ├── data/
│   │   ├── gamesData.js         # Frontend game metadata, posters, venues, timings
│   │   └── timelineData.js      # Static timeline schedule
│   ├── i18n/                    # Multilingual translation dictionaries
│   │   ├── i18n.js              # i18next configuration
│   │   └── translations/        # JSON files for en, te, ta, ml, hi
│   ├── pages/                   # Top-level Page Components
│   │   ├── Home.jsx             # Main landing page
│   │   ├── GamePage.jsx         # Detailed view for a single game
│   │   ├── RegisterPage.jsx     # Games catalog & selection grid
│   │   ├── RegistrationFormPage.jsx # Dedicated registration form page
│   │   ├── VenueVerifyPage.jsx  # QR Scanner UI for on-spot ticket checking
│   │   ├── StatusCheckPage.jsx  # Registration lookup by roll number
│   │   ├── MovieCheckoutPage.jsx# Movie booking & checkout
│   │   ├── MoviesSelectionPage.jsx # Movie screenings browser
│   │   ├── SeatSelectionPage.jsx# Interactive cinema seat map
│   │   ├── AdminEventsPage.jsx  # Admin live timeline & schedule management
│   │   ├── AdminPaymentsPage.jsx# Admin payment logs & revenue stats
│   │   ├── AdminVolunteersPage.jsx # Admin team management
│   │   └── MembersPage.jsx      # Committee & coordinators directory
│   └── components/              # UI & Micro-interaction Components
│       ├── Hero.jsx             # Cinematic hero section
│       ├── CinematicStory.jsx   # Janmashtami visual narrative scroll
│       ├── Timeline.jsx         # Interactive schedule (live + static fallback)
│       ├── Registration.jsx     # Multi-step registration modal & logic
│       ├── SpecialEventsBanner.jsx # Popup highlighting premium events
│       ├── CountdownTimer.jsx   # Event countdown component
│       ├── ImageScatter.jsx     # Interactive floating memories scatter
│       └── forgeui/             # Bespoke UI animations & cards
└── public/                      # Static assets (Posters, Audio, Badges)
    ├── games/                   # Game posters and cover photos (.webp / .jpg)
    ├── photos/                  # Committee photos (.webp)
    ├── assets/                  # Logos, banners, audio tracks
    └── clubs and their reps/    # Collaborating club logos and reps
```

---

## 4. Frontend Architecture & Workflow

### 4.1 Technology Stack
- **Framework:** React 18 with Vite 8.
- **Routing:** `react-router-dom` v6 with SPA navigation.
- **Internationalization (i18n):** `i18next` supporting 5 languages:
  - English (`en`)
  - Telugu (`te`)
  - Tamil (`ta`)
  - Malayalam (`ml`)
  - Hindi (`hi`)
- **Animation & FX:** `framer-motion`, Canvas particle engines, CSS 3D transforms, custom GLSL/WebGL ripples.
- **Styling:** Curated dark theme, glowing orange/gold accents (`#FF8C00`, `#FFD700`), custom typography (Cinzel, Outfit, Isabella).

### 4.2 Core Pages and Workflows

#### 1. Landing & Discovery (`src/pages/Home.jsx`)
- **Hero:** Dynamic date countdown, primary CTA buttons, particle effects.
- **Cinematic Story (`CinematicStory.jsx`):** Interactive scroll experience narrating Lord Krishna's stories and Janmashtami traditions.
- **Timeline (`Timeline.jsx`):** Dynamic schedule fetched from `/api/settings/timeline` with an automatic fallback to `src/data/timelineData.js`.
- **Special Events Banner (`SpecialEventsBanner.jsx`):** Automated modal showcasing premium competitions (Treasure Hunt, Cold Case).
- **Collaborators & Committee:** Interactive cards showing organizing clubs and student heads.

#### 2. Game Discovery & Details (`src/pages/GamePage.jsx`, `RegisterPage.jsx`)
- Displays games dynamically from `src/data/gamesData.js`.
- Shows participation limits, team sizes, prize pools, venues, and timings.
- Supports single-game deep links (`/games/:id`) and direct navigation to registration (`/form?game=:id`).

#### 3. Registration Flow (`src/components/Registration.jsx`)
- **Step 1: Student Information**
  - Name, Roll Number, Email, Department, Year, Section, Phone Number.
  - Validates Amrita roll number formats and duplicate entries.
- **Step 2: Game Selection & Team Setup**
  - Allows selecting multiple games.
  - If a team game is chosen (e.g. Cold Case, Treasure Hunt, Free Fire), expands dynamic fields for Team Name and Teammates' Roll Numbers/Names.
- **Step 3: Server Pricing & Discount Validation**
  - Calculates base price from selected games.
  - Validates discount codes securely against `/api/pricing/validate-discount`.
  - For free events (₹0 total), creates direct registration without payment.
- **Step 4: Token Generation & QR Code Display**
  - Displays token card with unique alphanumeric ID (e.g. `AN-2026-042`).
  - Generates downloadable QR code ticket containing cryptographically signed payload.

#### 4. Cinema & Movie Screening Flow (`src/pages/MovieCheckoutPage.jsx`, `SeatSelectionPage.jsx`)
- Full seat-mapping system supporting seat reservation, snack add-ons, and payment settlement.

#### 5. Venue Verification Scanner (`src/pages/VenueVerifyPage.jsx`)
- Mobile-friendly camera QR scanner using `html5-qrcode` or barcode detection.
- Scans user token, sends payload to `/api/verify`, displays instant green/red status badge, and marks ticket as `attended` in Firestore.

---

## 5. Backend Architecture & API Specifications

### 5.1 Technology Stack
- **Runtime:** Node.js (v18+) with Express.js.
- **Database:** Firebase Firestore (Google Cloud).
- **Security:** Helmet, CORS with strict origin validation, `express-rate-limit`, input sanitization, HMAC SHA-256 for payment and token integrity.

### 5.2 Complete API Route Registry

| Method | Endpoint | Description | Auth / Security |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/register` | Process game registration & token generation | Rate limited, input validated |
| `POST` | `/api/pricing/validate-discount` | Validate discount code & calculate discount amount | Server env discount lookup |
| `POST` | `/api/verify` | Verify QR token at venue and mark attended | Admin / Scanner Token |
| `GET` | `/api/status/:rollNo` | Look up registrations by student roll number | Public, sanitized |
| `GET` | `/api/settings/timeline` | Fetch live festival timeline | Public |
| `POST` | `/api/admin/login` | Admin credentials verification & session | Rate limited, hashed |
| `GET` | `/api/admin/registrations` | Fetch all registration records (with search/filters) | Admin Auth Header |
| `GET` | `/api/admin/export` | Download full registrations in Excel/CSV format | Admin Auth Header |
| `POST` | `/api/admin/timeline` | Update live schedule events dynamically | Admin Auth Header |
| `POST` | `/api/payment/create-order` | Create Razorpay order for paid games | Rate limited, server-verified amount |
| `POST` | `/api/payment/verify` | Verify Razorpay payment signature | HMAC SHA-256 verification |

---

## 6. Ground-Truth Data & Rules

### 6.1 Games, Venues, Timings & Pricing Matrix

| ID | Title | Venue | Timing | Price | Mode | Team Size | Prize Pool |
| :---: | :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| **6** | **Tambola** | AB 003 *(Academic Block)* | 03:45 PM – 05:00 PM | ₹10 | Solo | 1 | Based on participation |
| **7** | **Tug of War** | Near Flag Pole | 31 Aug • 05:00 PM – 05:30 PM | ₹0 | Team | On-spot | Glory & Medals |
| **8** | **Pot Painting** | Near ATM | 03:45 PM – 05:00 PM | ₹90 | Solo | 1 | Certificate & Prizes |
| **9** | **Treasure Hunt** | Near Flag Pole *(Start)* | 03:45 PM – 05:00 PM | ₹180 | Team | 4 | ₹800 Prize |
| **10** | **Mahabharatam Quiz** | AB 102 *(Academic Block)* | 03:45 PM – 05:00 PM | ₹50 | Solo | 1 | 1st: ₹300, 2nd: ₹150 |
| **11** | **Uriyadi** | Main Ground | 05:00 PM – 06:00 PM | ₹0 | Solo | Free | Traditional Event |
| **14** | **Free Fire** | Online | 03:45 PM – 05:00 PM | ₹100 | Team | 4 | 1st: ₹500, 2nd: ₹400 |
| **18** | **Minecraft** | AB 105 *(Academic Block)* | 03:45 PM – 05:00 PM | ₹80 | Team | Teams | ₹400 Prize |
| **20** | **Cold Case** | AB 004, AB 005 *(Academic Block)* | 03:45 PM – 05:00 PM | ₹140 | Team | 3 | ₹1000 Prize |
| **21** | **Guess** | TBD | 03:45 PM – 05:00 PM | ₹80 | Team | 2 | 1st: ₹400, 2nd: ₹300 |
| **22** | **Picture Hunt** | AB 104 *(Academic Block)* | 03:45 PM – 05:00 PM | ₹180 | Team | 3 | 1st: ₹500, 2nd: ₹300 |

> [!IMPORTANT]
> Whenever any price or game rule is updated, it **MUST** be updated simultaneously in:
> 1. `src/data/gamesData.js` (Frontend UI)
> 2. `server/utils/pricing.js` (Backend Validation Engine)

---

## 7. Database (Firestore) Schema

### Collection: `registrations`
```json
{
  "token": "AN-2026-089",
  "name": "Student Name",
  "rollNo": "CB.EN.U4AIE23001",
  "email": "student@cb.amrita.edu",
  "phone": "9876543210",
  "department": "AIE",
  "year": "3rd Year",
  "section": "A",
  "games": ["Free Fire", "Tambola"],
  "teamDetails": {
    "Free Fire": {
      "teamName": "Phoenix Squad",
      "members": ["Member 1", "Member 2", "Member 3"]
    }
  },
  "amountPaid": 110,
  "discountCode": "KRISHNA50",
  "paymentStatus": "COMPLETED",
  "paymentId": "pay_xyz123456",
  "attended": false,
  "attendedAt": null,
  "createdAt": "2026-08-31T10:30:00.000Z"
}
```

### Collection: `settings`
- Document `timeline`: Contains dynamic overrides for timeline events array.
- Document `announcements`: Controls top-bar announcements and emergency alerts.

---

## 8. Security & Production Controls

1. **Tamper-Proof Price Enforcement:** The frontend never sends a calculated total amount to be trusted by the server. The backend recalculates `amountPaid` strictly using `server/utils/pricing.js` based on the list of selected games.
2. **Environment-Protected Discount Codes:** Discount codes are loaded exclusively on the server from environment variables (`DISCOUNT_KRISHNA50=...`, `DISCOUNT_DEV100=...`). They are never exposed in client bundles.
3. **Anti-Inspect & DevTools Hardening:** In production builds, right-click context menu, developer shortcuts (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U), and debugger hooks are automatically neutralized.
4. **Atomic Token Generation:** Registration tokens use Firestore transactions to guarantee non-colliding sequential tokens under heavy concurrent load.

---

## 9. Development & Operations Guide

### Common Terminal Commands
```bash
# 1. Install all dependencies (Frontend + Backend)
npm install
cd server && npm install && cd ..

# 2. Start full development environment
npm run dev

# 3. Build frontend for production
npm run build

# 4. Run backend stress tests
node server/load_test.js
node server/all_out_stress_test.js
```

### Environment Variables (`server/.env`)
```ini
PORT=5000
NODE_ENV=production
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
GOOGLE_SHEETS_WEBHOOK=https://script.google.com/macros/s/.../exec
ADMIN_PASSWORD=your_secure_admin_password
DISCOUNT_KRISHNA50=KRISHNA50:percent:50
DISCOUNT_DEV100=DEV100:flat:100
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=...
```

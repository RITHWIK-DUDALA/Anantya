# Anantya 2025 (formerly Janmashtami)

Anantya 2025 is a feature-rich, high-performance web application built for managing college event registrations, payments, and schedules. It features a stunning cinematic dark theme with micro-animations, multi-language support, a secure payment gateway integration, and a dedicated admin dashboard.

---

## 🌟 Key Features

1. **Cinematic UI/UX:** Built with React and Framer Motion, featuring floating paths, galaxy backgrounds, spotlight navbars, and interactive bento grids.
2. **Registration & Payments:** Integrated with Razorpay for secure UPI/Card payments. Generates dynamic UPI QR codes and securely validates transactions.
3. **Admin Dashboard:** A password-secured portal (`/admin/payments`) for event organizers to view real-time registrations, verify payments, and reject/approve users.
4. **Automated Token Generation:** Upon successful registration, the app generates a unique 6-digit verification token, which the user can download as a text file for entry.
5. **Multi-Language Support (i18n):** Full support for English and Tamil translations, toggleable directly from the navigation bar.
6. **Real-time Database:** Powered by Firebase Firestore, ensuring that registrations and payment statuses are securely logged and instantly accessible to admins.
7. **Responsive Timeline:** An interactive timeline component charting out all 19 events chronologically.

---

## 🏗️ Architecture & Tech Stack

### Frontend (Client)
- **Framework:** React (Vite)
- **Styling:** CSS Modules, inline styles, custom variables (`index.css`), and Aceternity UI components.
- **Animations:** Framer Motion, Lucide Icons.
- **Internationalization:** `react-i18next`.
- **Routing:** `react-router-dom` (handles `/`, `/status`, and `/admin/payments`).

### Backend (Server)
- **Framework:** Node.js with Express (`/server`).
- **Payments:** Razorpay API for Order generation and Webhook signature verification (`/server/routes/payment.js`).
- **Security:** Helmet, CORS, and password-protected admin routes (`/server/routes/admin.js`).
- **Database:** Firebase Admin SDK (used in backend) and Firebase Client SDK (used in frontend) to store `users` and `payments`.

---

## 📂 Folder Structure

```
anantya/
├── server/                    # Node.js Express Backend
│   ├── routes/                # API Endpoints (payment.js, admin.js)
│   ├── server.js              # Entry point for backend
│   └── ...
├── src/                       # React Frontend
│   ├── components/            # Reusable UI Components
│   │   ├── forgeui/           # Advanced animated components (FraudCard, etc.)
│   │   ├── Registration.jsx   # Registration form & Razorpay flow
│   │   ├── Timeline.jsx       # Event schedule timeline
│   │   ├── Committee.jsx      # Committee member directory
│   │   └── ...
│   ├── config/                # Centralized Config
│   │   ├── config.js          # Committee members, global event details, social links
│   │   └── firebase.js        # Firebase initialization
│   ├── data/                  # Static Data
│   │   ├── gamesData.js       # Game descriptions and images
│   │   └── timelineData.js    # Chronological event schedule
│   ├── i18n/                  # Translation Files (English & Tamil)
│   ├── pages/                 # Full Page Layouts
│   │   ├── AdminPaymentsPage  # Secure Admin Dashboard
│   │   └── StatusPage         # Payment Success/Failure feedback
│   ├── App.jsx                # Main routing and layout
│   └── index.css              # Global styles, CSS variables, and animations
├── public/                    # Static assets (photos, videos, locales)
├── package.json               # Dependencies and scripts
└── README.md                  # This document
```

---

## 🚀 How It Works (The User Flow)

1. **Browsing:** Users land on the homepage, view the about section, explore the event timeline, and see the committee members.
2. **Registration:** 
   - The user fills out the registration form.
   - The React app pings the Node.js backend to create a Razorpay `order_id`.
   - The Razorpay checkout widget opens.
3. **Verification:**
   - Upon payment, Razorpay sends a success payload.
   - The backend verifies the cryptographic signature to ensure the payment is authentic.
   - The frontend stores the user data in Firebase Firestore along with a generated `token`.
4. **Success:** 
   - The user is redirected to the `/status` page.
   - They download a text file containing their unique 6-digit registration token.
5. **Administration:**
   - An admin logs into `/admin/payments` using the secret admin password (`<your-admin-password>`).
   - The admin views the database table, seeing who paid, who failed, and their tokens.
   - The admin can click "Verify" or "Revoke" on individual users to update their status in real-time.

---

## 💻 Running Locally

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Start the Frontend & Backend (Concurrently):**
   ```bash
   npm run dev
   ```
   *(This script launches Vite on port 5173 and the Express server on port 5000 simultaneously).*

3. **Environment Variables (.env):**
   Requires Razorpay keys and Firebase Admin credentials to function fully.

---

## 🎨 Customization Guide

- **Event Name:** Change the name globally via `src/config/config.js` and `package.json`.
- **Committee Members:** Edit `src/config/config.js` to add/remove members, update roles, or add phone numbers. Photos should be placed in `public/photos/`.
- **Timeline:** Edit `src/data/timelineData.js` and `src/i18n/translations/en.json` to modify the event schedule.
- **Translations:** Modify JSON files inside `src/i18n/translations/` for English and Tamil text updates.

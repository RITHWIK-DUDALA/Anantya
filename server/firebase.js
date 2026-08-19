const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
require('dotenv').config();

let app;
let db;

try {
  // Fix for newlines in private key from .env file
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : undefined;

  app = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey,
    })
  });
  console.log('Firebase Admin initialized');
  db = getFirestore();
} catch (error) {
  // M-5: A failed Firebase init means ALL requests will fail with 500.
  // Fail fast and loudly instead of serving broken requests silently.
  // On Render/Railway this triggers an alert and auto-restart.
  console.error('FATAL: Firebase admin initialization error:', error.message);
  process.exit(1);
}

module.exports = { app, db };

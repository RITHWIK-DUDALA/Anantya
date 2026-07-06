// =============================================================
// ANANTYA 2025 — AVV CHENNAI
// ⚙️  CONFIG FILE — Update ALL values here before going live
// =============================================================

const CONFIG = {
  // ── Event Details ──────────────────────────────────────────
  eventName: "Anantya 2025",
  collegeName: "Amrita Vishwa Vidyapeetham, Chennai Campus",
  eventDate: "2026-08-31T16:30:00", // ← Confirm and change this date/time
  eventVenue: "AVV Chennai Campus",
  committeeEmail: "events@avvchennai.edu.in", // ← Replace with real email


  // ── Google Sheets Webhook ──────────────────────────────────
  // 1. Open google-apps-script/Code.gs
  // 2. Deploy as Web App (Execute as: Me, Access: Anyone)
  // 3. Paste the generated URL below
  googleSheetsWebhook: "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL", // ← Replace

  // ── Paid Game Prices (₹) ──────────────────────────────────
  gamePrices: {
    "Dahi Handi (Team)": 100,
    "Rangoli (per team)": 0,
    "Fancy Dress": 0,
    "Antakshari": 100,
    "Flute Playing Competition": 0,
    "Skit / Drama": 0,
    "Free Fire": 100,
    "BGMI": 100,
    "Call of Duty": 100,
  },

  // ── Social Links ───────────────────────────────────────────
  socials: {
    instagram: "https://www.instagram.com/avv_janmashtami?igsh=bW9kcGNqdnJkbDBv", // ← Replace
    whatsapp: "https://chat.whatsapp.com/grouplink", // ← Replace
  },

  // ── Committee Members ──────────────────────────────────────
  // • photo: "" → auto-generates initials avatar
  // • photo: "./photos/name.jpg" → uses image (add to /public/photos/)
  // • comingSoon: true → shows "Coming Soon" card
  // • isCoHead: true → renders dual phone links
  // ⚠️  Roll numbers are NOT shown publicly — internal data only
  committee: [
    {
      role: "Event Head &\nStudent Stalls In-Charge",
      name: "Punith Vuppala",
      phone: "7989863060",
      year: "3rd Year",
      photo: "/photos/punith.jpeg",
      objectPosition: "center 20%",
      comingSoon: false,
    },
    {
      role: "Event Vice Head",
      name: "Dimple Hassini",
      phone: "9390252586",
      year: "3rd Year",
      photo: "/photos/Dimple Hassini.jpeg",
      objectPosition: "center 20%",
      comingSoon: false,
    },
    {
      role: "Cultural In-Charge",
      name: "Nagasai Sree",
      phone: "9100212289",
      year: "3rd Year",
      photo: "/photos/nagasaisree.jpeg",
      objectPosition: "center 20%",
      comingSoon: false,
    },
    {
      role: "Culturals In-Charge",
      name: "V R SRINITHI",
      phone: "0000000000",
      year: "3rd Year",
      photo: "/photos/V R SRINITHI.jpeg",
      objectPosition: "center 15%",
      comingSoon: false,
    },
    {
      role: "Games &\nDisciplinary In-Charge",
      name: "Rithwik Sathya",
      phone: "9346710580",
      year: "3rd Year",
      photo: "/photos/rith2.jpg",
      objectPosition: "center 20%",
      comingSoon: false,
    },
    {
      role: "Decoration In-Charge",
      name: "Bhargava Sai",
      phone: "9963374697",
      year: "3rd Year",
      photo: "/photos/bhargav.jpeg",
      objectPosition: "center 20%",
      comingSoon: false,
      isCoHead: true,
    },
    {
      role: "Decoration In-Charge",
      name: "Jyothsana",
      phone: "7670969647",
      year: "3rd Year",
      photo: "/photos/Jyothsana.jpeg",
      objectPosition: "center 20%",
      comingSoon: false,
      isCoHead: true,
    },
    {
      role: "Technical In-Charge",
      name: "Suryesh K K",
      phone: "6302062936",
      year: "3rd Year",
      photo: "/photos/surya.png",
      objectPosition: "center 20%",
      comingSoon: false,
    },
    {
      role: "Treasurer Coordinator",
      name: "Bhaanu tej",
      phone: "0000000000",
      year: "3rd Year",
      photo: "/photos/Bhanu.JPG.jpeg",
      objectPosition: "center 30%",
      transform: "scale(2.5) translateX(8%)",
      transformOrigin: "center top",
      comingSoon: false,
    },
    {
      role: "Visual Media In-Charge\n- Trinetra Multimedia",
      name: "Shreyas Reddy",
      phone: "9182263080",
      year: "3rd Year",
      photo: "/photos/Shreyas reddy.jpeg",
      objectPosition: "center 20%",
      comingSoon: false,
    },
  ],
};

export default CONFIG;

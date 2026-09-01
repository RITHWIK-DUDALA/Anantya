// =============================================================
// ANANTYA 2026 — AVV CHENNAI
// ⚙️  CONFIG FILE — Update ALL values here before going live
// =============================================================

const CONFIG = {
  // ── Event Details ──────────────────────────────────────────
  eventName: "Anantya 2026",
  collegeName: "Amrita Vishwa Vidyapeetham, Chennai Campus",
  eventDate: "2026-08-31T16:00:00", // ← Confirm and change this date/time
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
    // ── 1. Faculty ──────────────────────────────────────────────
    {
      role: "Faculty Mentor",
      name: "Prakash S",
      email: "s_prakesh@avvchennai.edu.in",
      year: "",
      photo: "/photos/prakash.webp",
      objectPosition: "center 15%",
      transform: "scale(1.2)",
      transformOrigin: "center 15%",
      comingSoon: false,
    },
    // ── 2. Event Heads ──────────────────────────────────────────
    {
      role: "Event Head &\nStudent Stalls In-Charge",
      name: "Punith Vuppala",
      phone: "7989863060",
      year: "3rd Year",
      photo: "/photos/punith.webp",
      objectPosition: "center 20%",
      comingSoon: false,
    },
    {
      role: "Event Vice Head",
      name: "Dimple Hassini",
      phone: "9390252586",
      year: "3rd Year",
      photo: "/photos/Dimple Hassini.webp",
      objectPosition: "center 50%",
      transform: "scale(1.6)",
      transformOrigin: "center",
      comingSoon: false,
    },
    // ── 3. Cultural ─────────────────────────────────────────────
    {
      role: "Cultural In-Charge",
      name: "Nagasai Sree",
      phone: "9100212289",
      year: "3rd Year",
      photo: "/assets/memo10.webp",
      objectPosition: "20% 20%",
      transform: "scale(1.5)",
      transformOrigin: "20% 30%",
      comingSoon: false,
    },
    {
      role: "Cultural In-Charge",
      name: "V R SRINITHI",
      phone: "8489957162",
      year: "3rd Year",
      photo: "/photos/V R SRINITHI.webp",
      objectPosition: "center 15%",
      comingSoon: false,
    },
    // ── 4. Games & Discipline ───────────────────────────────────
    {
      role: "Games &\nDisciplinary In-Charge",
      name: "RITHWIK SATYA D",
      phone: "9346710580",
      year: "3rd Year",
      photo: "/photos/rithmain1.webp",
      objectPosition: "center 10%",
      transform: "scale(2.0)",
      transformOrigin: "center 15%",
      comingSoon: false,
    },
    // ── 5. Decoration ───────────────────────────────────────────
    {
      role: "Decoration In-Charge",
      name: "Bhargava Sai",
      phone: "9963374697",
      year: "3rd Year",
      photo: "/photos/bhargav.webp",
      objectPosition: "center 20%",
      comingSoon: false,
      isCoHead: true,
    },
    {
      role: "Decoration In-Charge",
      name: "Jyothsana",
      phone: "7670969647",
      year: "3rd Year",
      photo: "/photos/Jyothsana.webp",
      objectPosition: "center 30%",
      transform: "scale(1.6)",
      transformOrigin: "center",
      comingSoon: false,
      isCoHead: true,
    },
    // ── 6. Technical ────────────────────────────────────────────
    {
      role: "Technical In-Charge",
      name: "Suryesh K K",
      phone: "6302062936",
      year: "3rd Year",
      photo: "/photos/surya.webp",
      objectPosition: "25% 5%",
      transform: "scale(1.8)",
      transformOrigin: "25% 10%",
      comingSoon: false,
    },
    // ── 7. Treasurer ────────────────────────────────────────────
    {
      role: "Treasurer",
      name: "Bhaanu tej",
      phone: "8790258289",
      year: "3rd Year",
      photo: "/photos/Bhanu.webp",
      objectPosition: "center 20%",
      transform: "scale(2.2)",
      transformOrigin: "center 25%",
      comingSoon: false,
    },
    // ── 8. Coordinators ─────────────────────────────────────────
    {
      role: "Decorations",
      name: "M. Dharani",
      photo: "/cordinators/M. Dharani.webp",
      objectPosition: "center 40%",
      transform: "scale(1.5)",
      transformOrigin: "center 40%",
      comingSoon: false,
      isCoordinator: true,
    },
    {
      role: "Decorations",
      name: "V Hansika",
      photo: "/cordinators/V Hansika.webp",
      objectPosition: "center 20%",
      comingSoon: false,
      isCoordinator: true,
    },
    {
      role: "Decorations",
      name: "Chetana Reddy",
      photo: "/cordinators/Chetana Reddy.webp",
      objectPosition: "center 20%",
      comingSoon: false,
      isCoordinator: true,
    },
    {
      role: "Decorations",
      name: "B.Keerthana",
      photo: "/cordinators/B.Keerthana.webp",
      objectPosition: "center 5%",
      comingSoon: false,
      isCoordinator: true,
    },
  ],

  // ── Collaborating Clubs ────────────────────────────────────
  collaborators: [
    {
      name: "Trinetra Multimedia",
      tagline: "where the third eye awakens",
      description: "Trinetra is the official professional multimedia club, capturing the essence and memories of every grand event with cinematic brilliance.",
      phone: "+91 91822 63080",
      logo: "/clubs and their reps/Trinetra.jpeg",
      repName: "Shreyas Reddy",
      repPhoto: "/photos/Shreyas reddy.webp",
      instagram: "https://www.instagram.com/trinetra.amrita?igsh=MTNtaDdnbGp2ZjF4MQ==&igsi=MTNtaDdnbGp2ZjF4MQ=="
    },
    {
      name: "Dhikrithi",
      tagline: "A Space to Grow Within",
      description: "Dhikrithi is a student initiative providing a space to explore meditation, yoga, emotional well-being, and holistic personal growth. Through activities like Vivada, heritage visits, and meaningful discussions, the club aims to create a mindful and supportive campus community.",
      phone: "+91 89850 59136",
      logo: "/clubs and their reps/dhikrithi-club.jpg",
      repName: "Poojitha Kanipakam",
      repPhoto: "/clubs and their reps/dkrithi rep.webp",
      instagram: "https://www.instagram.com/dhikrithi.amrita?igsh=MWNiaW9nc3BsNGN1cw=="
    },
    {
      name: "Aurora",
      tagline: "Rooted in Tradition, Rising with Rhythm.",
      description: "Aurora Amrita brings together Classical, Traditional Folk, Western and Freestyle dance, creating a space where passion, creativity and culture come alive. From graceful movements to powerful performances, we celebrate every form of expression through dance. 💫",
      logo: "/clubs and their reps/AURORA text.jpg (7).jpeg",
      logoBg: "#000",
      logoObjectFit: "contain",
      repName: "Nandhini",
      repPhoto: "/clubs and their reps/ARORA REP.webp",
      instagram: "https://www.instagram.com/aurora.amrita?igsh=MXI1dHR4NnF6YjNpYw=="
    },
    {
      name: "Amrita Raaga",
      tagline: "Where Every Note Finds Its Rhythm.",
      description: "Amrita Raaga is the music club of Amrita Vishwa Vidyapeetham, bringing together students who share a passion for music, performance, and creativity. From soulful melodies to energetic performances, the club provides a platform for students to explore their musical talents, collaborate with fellow musicians, and create memorable experiences through music. With performances, selections, and musical events throughout the year, Amrita Raaga aims to make every note count.",
      logo: "/clubs and their reps/AmritaRaaga_Black.png",
      repName: "Adithyan V J",
      repPhoto: "/clubs and their reps/AMRITA RAGA REP.webp",
      instagram: "https://www.instagram.com/raaga.amrita?utm_source=qr&igsh=MXRxdHU5ZHplMmRkag=="
    },
    {
      name: "Aalekh",
      tagline: "Where Art Finds Its Voice.",
      description: "Aalekh Fine Arts Club is a creative community that nurtures artistic talent through visual arts, workshops, competitions, exhibitions, and collaborative initiatives, empowering students to explore, develop, and showcase their artistic potential.",
      logo: "/clubs and their reps/alayek logo no bg.png",
      repName: "Sarvaajeth Periyasamy",
      repPhoto: "/clubs and their reps/Sarvaajeth Periyasamy.webp",
      repPhotoPosition: "35% center",
      instagram: "https://www.instagram.com/aalekh.amrita?igsh=MTBjdWEzZXE2dDl3dQ==&igsi=MTBjdWEzZXE2dDl3dQ=="
    }
  ]
};

export default CONFIG;

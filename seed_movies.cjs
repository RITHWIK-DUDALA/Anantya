require('dotenv').config({ path: './server/.env' });
const { db } = require('./server/firebase');

async function seed() {
  console.log('Seeding movies...');
  if (!db) {
    console.error('DB not initialized');
    process.exit(1);
  }

  // 1. Create a Screen
  const screenRef = db.collection('screens').doc('main-hall');
  await screenRef.set({
    name: 'Amritanandha Mai Hall',
    layout: {
      rows: 15,
      cols: 20,
      blankSpaces: [
        'A-10', 'A-11', 'B-10', 'B-11', 'C-10', 'C-11',
        'D-10', 'D-11', 'E-10', 'E-11', 'F-10', 'F-11'
      ]
    },
    categories: ['Regular', 'Premium']
  });
  console.log('Created screen layout');

  // 2. Create Showtimes
  const showtimes = [
    {
      id: 'show-1',
      movieId: 'movie-telugu',
      movieTitle: 'Telugu Movie Screening',
      screenId: 'main-hall',
      screenName: 'Amritanandha Mai Hall',
      date: '2026-08-31',
      time: '18:00',
      format: '2D',
      language: 'Telugu',
      status: 'active',
      priceMap: { Regular: 100 }
    },
    {
      id: 'show-2',
      movieId: 'movie-malayalam',
      movieTitle: 'Malayalam Movie Screening',
      screenId: 'main-hall',
      screenName: 'Amritanandha Mai Hall',
      date: '2026-08-31',
      time: '14:00',
      format: '2D',
      language: 'Malayalam',
      status: 'active',
      priceMap: { Regular: 100 }
    }
  ];

  for (const show of showtimes) {
    await db.collection('showtimes').doc(show.id).set(show);
  }
  console.log('Created showtimes');
  
  console.log('Seeding complete!');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});

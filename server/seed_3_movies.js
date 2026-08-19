const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { db } = require('./firebase');

async function seed() {
  console.log('Seeding 3 movies...');
  if (!db) {
    console.error('DB not initialized');
    process.exit(1);
  }

  // Create Showtimes
  const showtimes = [
    {
      id: 'show-telugu',
      movieId: 'movie-telugu',
      movieTitle: 'Telugu Movie Screening',
      screenId: 'main-hall',
      screenName: 'Amritanandha Mai Hall',
      date: '2026-08-15',
      time: '18:00',
      format: '2D',
      language: 'Telugu',
      status: 'active',
      priceMap: { Regular: 100 },
      image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=600'
    },
    {
      id: 'show-tamil',
      movieId: 'movie-tamil',
      movieTitle: 'Tamil Movie Screening',
      screenId: 'main-hall',
      screenName: 'Amritanandha Mai Hall',
      date: '2026-08-17',
      time: '18:00',
      format: '2D',
      language: 'Tamil',
      status: 'active',
      priceMap: { Regular: 100 },
      image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=600'
    },
    {
      id: 'show-malayalam',
      movieId: 'movie-malayalam',
      movieTitle: 'Malayalam Movie Screening',
      screenId: 'main-hall',
      screenName: 'Amritanandha Mai Hall',
      date: '2026-08-16',
      time: '14:00',
      format: '2D',
      language: 'Malayalam',
      status: 'active',
      priceMap: { Regular: 100 },
      image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&q=80&w=600'
    }
  ];

  for (const show of showtimes) {
    await db.collection('showtimes').doc(show.id).set(show);
  }
  console.log('Created 3 showtimes');
  
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});

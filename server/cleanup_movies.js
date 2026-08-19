const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { db } = require('./firebase');

async function cleanup() {
  console.log('Cleaning up extra movies...');
  if (!db) {
    console.error('DB not initialized');
    process.exit(1);
  }

  const snapshot = await db.collection('showtimes').get();
  let deletedCount = 0;

  for (const doc of snapshot.docs) {
    if (!['show-telugu', 'show-tamil', 'show-malayalam'].includes(doc.id)) {
      await db.collection('showtimes').doc(doc.id).delete();
      deletedCount++;
      console.log(`Deleted ${doc.id}`);
    }
  }

  console.log(`Cleanup complete! Deleted ${deletedCount} extra showtimes.`);
  process.exit(0);
}

cleanup().catch(err => {
  console.error(err);
  process.exit(1);
});

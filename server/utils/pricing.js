const gamePrices = {
  'Dahi Handi': 100,
  'Rangoli': 0,
  'Fancy Dress': 0,
  'Antakshari': 100,
  'Flute Playing': 0,
  'Skit / Drama': 0,
  'Tug of War': 0,
  'Pot Painting': 100,
  'Treasure Hunt': 100,
  'Hackathon / Quiz': 100,
  'Uriyadi': 0,
  'Cricket': 100,
  'Volleyball': 100,
  'Free Fire': 100,
  'BGMI': 100,
  'Call of Duty': 100,
  'Tambola': 50,
  'Minecraft': 100,
  'Cold Case': 100
};

/**
 * Calculates the total price for a given list of games and applies discount if valid.
 * @param {Array<string>} selectedGames Array of game titles
 * @param {string} secretCode The applied secret code (optional)
 * @returns {Object} { baseTotal, discountAmount, finalTotal }
 */
function calculateOrderAmount(selectedGames, secretCode) {
  if (!Array.isArray(selectedGames)) {
    selectedGames = [];
  }

  let baseTotal = 0;
  selectedGames.forEach(gameTitle => {
    // Default to 0 if the game is somehow not in the list to prevent NaN
    baseTotal += (gamePrices[gameTitle.trim()] || 0);
  });

  let discountAmount = 0;
  
  if (secretCode) {
    const code = secretCode.trim().toUpperCase();
    if (code === 'KRISHNA50') {
      discountAmount = baseTotal * 0.5; // 50% discount
    } else if (code === 'DEV100') {
      discountAmount = 100; // Flat Rs 100 off
    }
  }

  const finalTotal = Math.max(0, baseTotal - discountAmount);

  return {
    baseTotal,
    discountAmount,
    finalTotal
  };
}

module.exports = {
  gamePrices,
  calculateOrderAmount
};

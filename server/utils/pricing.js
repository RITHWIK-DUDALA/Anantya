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
  'Free Fire': 100,
  'BGMI': 100,
  'Call of Duty': 100,
  'Tambola': 50,
  'Minecraft': 100,
  'Cold Case': 100
};

// H-1: Discount codes are loaded exclusively from environment variables.
// They are NEVER sent to the browser — only the server applies discounts.
// To add/change codes, update the .env file and restart the server.
function getDiscountCodes() {
  const codes = {};
  // Format: DISCOUNT_CODE_<NAME>=<CODE>:<TYPE>:<VALUE>
  // e.g. DISCOUNT_KRISHNA50=KRISHNA50:percent:50
  //      DISCOUNT_DEV100=DEV100:flat:100
  if (process.env.DISCOUNT_KRISHNA50) codes['KRISHNA50'] = { type: 'percent', value: 50 };
  if (process.env.DISCOUNT_DEV100) codes['DEV100'] = { type: 'flat', value: 100 };
  return codes;
}

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
    const discountCodes = getDiscountCodes();
    const entry = discountCodes[code];

    if (entry) {
      if (entry.type === 'percent') {
        discountAmount = baseTotal * (entry.value / 100);
      } else if (entry.type === 'flat') {
        discountAmount = entry.value;
      }
      // Cap discount — can't reduce below zero
      discountAmount = Math.min(discountAmount, baseTotal);
    }
  }

  const finalTotal = Math.max(0, baseTotal - discountAmount);

  return {
    baseTotal,
    discountAmount,
    finalTotal
  };
}

/**
 * Applies a discount code to an already-computed base total.
 * Used by the /api/pricing/validate-discount endpoint.
 * @param {number} baseTotal Already-calculated base price
 * @param {string} secretCode The discount code to apply
 * @returns {{ valid: boolean, discountAmount: number, finalTotal: number }}
 */
function calculateOrderAmountFromBase(baseTotal, secretCode) {
  const base = Math.max(0, Number(baseTotal) || 0);
  let discountAmount = 0;
  let valid = false;

  if (secretCode) {
    const code = secretCode.trim().toUpperCase();
    const discountCodes = getDiscountCodes();
    const entry = discountCodes[code];

    if (entry) {
      valid = true;
      if (entry.type === 'percent') {
        discountAmount = base * (entry.value / 100);
      } else if (entry.type === 'flat') {
        discountAmount = entry.value;
      }
      discountAmount = Math.min(discountAmount, base);
    }
  }

  return {
    valid,
    discountAmount,
    finalTotal: Math.max(0, base - discountAmount),
  };
}

module.exports = {
  gamePrices,
  calculateOrderAmount,
  calculateOrderAmountFromBase,
};

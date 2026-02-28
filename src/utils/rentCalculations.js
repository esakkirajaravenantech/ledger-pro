import moment from 'moment';

/**
 * Calculate rent after applying 15% enhancement every 3 years.
 * @param {number} currentRent - base rent amount
 * @param {number} yearsElapsed - number of full years elapsed since agreement start
 * @returns {number} enhanced rent amount
 */
export const calculateNextRent = (currentRent, yearsElapsed) => {
  const enhancements = Math.floor(yearsElapsed / 3);
  let rent = currentRent;
  for (let i = 0; i < enhancements; i++) {
    rent = rent * 1.15;
  }
  return Math.round(rent);
};

/**
 * Returns months remaining until the agreement expires.
 * @param {string} agreementEndDate - ISO date string YYYY-MM-DD
 * @returns {number} months until expiry (negative if already expired)
 */
export const getMonthsUntilExpiry = agreementEndDate => {
  const end = moment(agreementEndDate);
  const now = moment();
  return end.diff(now, 'months');
};

/**
 * Returns rent enhancement history from start date.
 * @param {number} startRent - original rent amount
 * @param {string} startDate  - ISO date string YYYY-MM-DD
 * @returns {Array<{date: string, rent: number, enhancement: number}>}
 */
export const getRentEnhancementHistory = (startRent, startDate) => {
  const history = [];
  let rent = startRent;
  const start = moment(startDate);

  // Show history up to today + 9 more years
  const endYear = moment().add(9, 'years');
  let enhancementDate = start.clone().add(3, 'years');

  while (enhancementDate.isBefore(endYear)) {
    const newRent = Math.round(rent * 1.15);
    history.push({
      date: enhancementDate.format('YYYY-MM-DD'),
      previousRent: rent,
      newRent,
      enhancement: newRent - rent,
    });
    rent = newRent;
    enhancementDate = enhancementDate.clone().add(3, 'years');
  }

  return history;
};

/**
 * Returns current applicable rent based on start date and base rent.
 * @param {number} baseRent - original rent from agreement
 * @param {string} startDate - ISO date string
 * @returns {{currentRent: number, nextEnhancementDate: string, nextRent: number, yearsElapsed: number}}
 */
export const getCurrentRentInfo = (baseRent, startDate) => {
  const start = moment(startDate);
  const now = moment();
  const yearsElapsed = now.diff(start, 'years');

  const currentRent = calculateNextRent(baseRent, yearsElapsed);

  // Next enhancement
  const completedCycles = Math.floor(yearsElapsed / 3);
  const nextEnhancement = start.clone().add((completedCycles + 1) * 3, 'years');
  const nextRent = Math.round(currentRent * 1.15);

  return {
    currentRent,
    nextEnhancementDate: nextEnhancement.format('YYYY-MM-DD'),
    nextRent,
    yearsElapsed,
    completedCycles,
  };
};

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

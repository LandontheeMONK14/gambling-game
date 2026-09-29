import { payoutFromProfit } from './wager.js';

export const SLOT_SYMBOLS = ['🍒', '🍋', '🔔', '🍀', '7️⃣'];

export const SLOT_PAYTABLE = {
  '🍒🍒🍒': 3,
  '🍋🍋🍋': 2,
  '🔔🔔🔔': 5,
  '🍀🍀🍀': 8,
  '7️⃣7️⃣7️⃣': 10,
};

export function spinReels(rng = Math.random) {
  return [0, 1, 2].map(() => SLOT_SYMBOLS[Math.floor(rng() * SLOT_SYMBOLS.length)]);
}

export function evaluateSlots(symbols, stake) {
  const key = symbols.join('');
  const profitMultiplier = SLOT_PAYTABLE[key] ?? 0;
  const totalReturn = profitMultiplier > 0 ? payoutFromProfit(stake, profitMultiplier) : 0;

  return {
    symbols,
    key,
    profitMultiplier,
    totalReturn,
    won: profitMultiplier > 0,
  };
}

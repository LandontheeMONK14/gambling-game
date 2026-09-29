import { payoutFromProfit } from './wager.js';

export const DICE_PROFIT_STEPS = [0.2, 0.6, 1.2, 2, 3.5, 6];

export function bustThreshold(rollCount) {
  return Math.min(5, rollCount + 1);
}

export function startDiceRound(stake) {
  return {
    active: true,
    stake,
    rollCount: 0,
    profitMultiplier: 0,
    lastRoll: null,
    totalReturn: 0,
    outcome: null,
  };
}

export function rollDice(round, rng = Math.random) {
  if (!round || !round.active) return { ...round, ignored: true };

  const rolled = 1 + Math.floor(rng() * 6);
  const threshold = bustThreshold(round.rollCount);

  if (rolled <= threshold) {
    return {
      ...round,
      active: false,
      lastRoll: rolled,
      outcome: 'lose',
      totalReturn: 0,
      message: `Rolled ${rolled}. Bust at ≤ ${threshold}.`,
    };
  }

  const nextRollCount = round.rollCount + 1;
  const profitMultiplier = DICE_PROFIT_STEPS[Math.min(nextRollCount - 1, DICE_PROFIT_STEPS.length - 1)];
  const maxed = nextRollCount >= DICE_PROFIT_STEPS.length;

  return {
    ...round,
    active: !maxed,
    rollCount: nextRollCount,
    profitMultiplier,
    lastRoll: rolled,
    outcome: maxed ? 'win' : null,
    totalReturn: maxed ? payoutFromProfit(round.stake, profitMultiplier) : 0,
    message: maxed
      ? `Rolled ${rolled}. Jackpot tier reached and auto-banked!`
      : `Rolled ${rolled}. Safe! Profit now x${profitMultiplier.toFixed(1)}.`,
  };
}

export function bankDice(round) {
  if (!round || !round.active) return { ...round, ignored: true };

  return {
    ...round,
    active: false,
    outcome: 'win',
    totalReturn: payoutFromProfit(round.stake, round.profitMultiplier),
    message: `Banked with x${round.profitMultiplier.toFixed(1)} profit.`,
  };
}

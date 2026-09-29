export function normalizeBalance(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.round(value));
}

export function validateWager(rawWager, balance) {
  const wager = Number(rawWager);
  const normalizedBalance = normalizeBalance(balance);

  if (!Number.isFinite(wager) || !Number.isInteger(wager)) {
    return { ok: false, error: 'Wager must be a whole number of chips.' };
  }
  if (wager <= 0) {
    return { ok: false, error: 'Wager must be at least 1 chip.' };
  }
  if (wager > normalizedBalance) {
    return { ok: false, error: 'Not enough chips for that wager.' };
  }
  return { ok: true, wager };
}

export function placeWager(balance, wager) {
  const check = validateWager(wager, balance);
  if (!check.ok) return { ok: false, error: check.error, balance: normalizeBalance(balance) };
  return { ok: true, balance: normalizeBalance(balance - check.wager), wager: check.wager };
}

export function applyPayout(balance, amount) {
  const safeBalance = normalizeBalance(balance);
  if (!Number.isFinite(amount)) return safeBalance;
  return normalizeBalance(safeBalance + amount);
}

export function payoutFromProfit(stake, profitMultiplier) {
  const safeStake = Math.max(0, Math.round(stake));
  if (!Number.isFinite(profitMultiplier) || profitMultiplier < 0) return safeStake;
  return safeStake + Math.round(safeStake * profitMultiplier);
}

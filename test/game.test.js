import { describe, expect, it } from 'vitest';
import { applyPayout, placeWager, payoutFromProfit, validateWager } from '../src/game/wager.js';
import { evaluateSlots } from '../src/game/slots.js';
import {
  blackjackHit,
  blackjackStand,
  isNatural,
  resolveNaturals,
  scoreHand,
  settleBlackjack,
} from '../src/game/blackjack.js';
import { bankDice, rollDice, startDiceRound } from '../src/game/dice.js';
import { DEFAULT_PERSISTED_STATE, createPersistence } from '../src/game/persistence.js';

describe('wager and bankroll', () => {
  it('validates integer wager against balance', () => {
    expect(validateWager(10, 20).ok).toBe(true);
    expect(validateWager(2.5, 20).ok).toBe(false);
    expect(validateWager(30, 20).ok).toBe(false);
  });

  it('places wager and applies payout safely', () => {
    const placed = placeWager(100, 20);
    expect(placed).toEqual({ ok: true, balance: 80, wager: 20 });
    expect(applyPayout(80, payoutFromProfit(20, 2))).toBe(140);
  });
});

describe('slots payout', () => {
  it('awards configured combo multipliers', () => {
    const seven = evaluateSlots(['7️⃣', '7️⃣', '7️⃣'], 10);
    expect(seven.won).toBe(true);
    expect(seven.totalReturn).toBe(110);

    const miss = evaluateSlots(['🍒', '🍒', '🍋'], 10);
    expect(miss.won).toBe(false);
    expect(miss.totalReturn).toBe(0);
  });
});

describe('blackjack rules', () => {
  it('scores aces correctly and detects natural', () => {
    expect(scoreHand([1, 9]).total).toBe(20);
    expect(scoreHand([1, 9, 9]).total).toBe(19);
    expect(isNatural([1, 13])).toBe(true);
  });

  it('resolves naturals, busts, pushes, and duplicate protection', () => {
    const natural = resolveNaturals([1, 13], [10, 7], 11);
    expect(natural.done).toBe(true);
    expect(natural.totalReturn).toBe(28);

    const push = settleBlackjack([10, 7], [9, 8], 25);
    expect(push.outcome).toBe('push');
    expect(push.totalReturn).toBe(25);

    const busted = blackjackHit({ stake: 10, playerCards: [10, 9], dealerCards: [10, 2], finished: false }, () => 0.9);
    expect(busted.outcome).toBe('lose');
    expect(busted.finished).toBe(true);

    const ignored = blackjackStand({ finished: true, playerCards: [], dealerCards: [], stake: 10 });
    expect(ignored.ignored).toBe(true);
  });
});

describe('risk dice', () => {
  it('handles busting, banking, and duplicate action protection', () => {
    const start = startDiceRound(50);
    const bust = rollDice(start, () => 0);
    expect(bust.outcome).toBe('lose');
    expect(bust.totalReturn).toBe(0);

    const start2 = startDiceRound(50);
    const safe = rollDice(start2, () => 0.99);
    const banked = bankDice(safe);
    expect(banked.outcome).toBe('win');
    expect(banked.totalReturn).toBeGreaterThan(50);

    const ignored = rollDice({ ...banked, active: false }, () => 0.99);
    expect(ignored.ignored).toBe(true);
  });
});

describe('persistence recovery', () => {
  it('recovers from malformed/unavailable storage and avoids in-flight state', () => {
    const badStorage = {
      setItem() { throw new Error('nope'); },
      getItem() { return '{oops'; },
      removeItem() {},
    };
    const persistence = createPersistence(badStorage);
    const loaded = persistence.load();
    expect(loaded).toEqual(DEFAULT_PERSISTED_STATE);

    const memory = {
      data: new Map(),
      setItem(key, val) { this.data.set(key, val); },
      getItem(key) { return this.data.get(key) ?? null; },
      removeItem(key) { this.data.delete(key); },
    };

    const good = createPersistence(memory);
    good.save({
      ...DEFAULT_PERSISTED_STATE,
      balance: 100,
      recentResults: [{ game: 'Slots', outcome: 'win', delta: 20, text: 'ok', activeRound: true }],
      blackjackRound: { shouldNotPersist: true },
    });

    const loadedGood = good.load();
    expect(loadedGood.balance).toBe(100);
    expect(loadedGood.blackjackRound).toBeUndefined();
    expect(loadedGood.recentResults[0].game).toBe('Slots');
  });
});

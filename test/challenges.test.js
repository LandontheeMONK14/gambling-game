import { describe, expect, it } from 'vitest';
import {
  CHALLENGE_POOL,
  CHALLENGE_SET_SIZE,
  COSMETIC_THEMES,
  STARTER_CHALLENGE_IDS,
  STORAGE_KEY,
  STORAGE_VERSION,
  applyRoundToChallenges,
  bankDice,
  createDefaultAppState,
  createDefaultChallengeState,
  createPersistence,
  evaluateSlots,
  isChallengeSetComplete,
  migrateLegacySave,
  rollDice,
  sanitizeAppState,
  sanitizeChallengeState,
  sanitizeCosmetics,
  selectTheme,
  startDiceRound,
  startNewChallengeSet,
  summarizeRound,
  unlockedThemeIds,
} from '../src/game/casino-engine.js';

function memoryStorage() {
  return {
    data: new Map(),
    setItem(key, value) {
      this.data.set(key, String(value));
    },
    getItem(key) {
      return this.data.get(key) ?? null;
    },
    removeItem(key) {
      this.data.delete(key);
    },
  };
}

function withGoals(ids, extra = {}) {
  return { ...createDefaultChallengeState(), goals: ids.map((id) => ({ id, progress: 0, done: false, seen: [] })), ...extra };
}

function play(challenges, events) {
  let current = challenges;
  const results = [];
  for (const event of events) {
    const result = applyRoundToChallenges(current, {
      roundId: current.lastRoundId + 1,
      outcome: 'lose',
      stake: 5,
      totalReturn: 0,
      detail: {},
      ...event,
    });
    current = result.challenges;
    results.push(result);
  }
  return { challenges: current, results };
}

function goal(challenges, id) {
  return challenges.goals.find((entry) => entry.id === id);
}

describe('challenge definitions', () => {
  it('ships a varied pool with a starter set spanning several rooms', () => {
    expect(Object.keys(CHALLENGE_POOL).length).toBeGreaterThanOrEqual(10);
    expect(STARTER_CHALLENGE_IDS).toHaveLength(CHALLENGE_SET_SIZE);
    for (const definition of Object.values(CHALLENGE_POOL)) {
      expect(definition.title).toBeTruthy();
      expect(definition.description).toBeTruthy();
      expect(definition.target).toBeGreaterThanOrEqual(1);
      expect(definition.target).toBeLessThanOrEqual(4);
    }
    const state = createDefaultChallengeState();
    expect(state.goals.map((entry) => entry.id)).toEqual(STARTER_CHALLENGE_IDS);
    expect(state.lastRoundId).toBe(0);
  });
});

describe('challenge progress across games', () => {
  it('counts distinct games for the explorer goal and ignores repeats', () => {
    const { challenges } = play(createDefaultChallengeState(), [
      { gameKey: 'slots' },
      { gameKey: 'slots' },
      { gameKey: 'roulette', detail: { betType: 'color' } },
    ]);
    expect(goal(challenges, 'explorer')).toMatchObject({ progress: 2, done: false, seen: ['slots', 'roulette'] });

    const next = play(challenges, [{ gameKey: 'keno' }]).challenges;
    expect(goal(next, 'explorer')).toMatchObject({ progress: 3, done: true });
  });

  it('completes the blackjack goal on any finished hand, including a loss', () => {
    const { challenges, results } = play(createDefaultChallengeState(), [{ gameKey: 'blackjack', outcome: 'lose', stake: 1, totalReturn: 0 }]);
    expect(goal(challenges, 'blackjackFinish').done).toBe(true);
    expect(results[0].newlyCompleted).toContain('blackjackFinish');
  });

  it('only completes the dice goal when a round is banked with profit', () => {
    const bust = play(createDefaultChallengeState(), [{ gameKey: 'dice', outcome: 'lose', stake: 10, totalReturn: 0 }]).challenges;
    expect(goal(bust, 'diceProfit').done).toBe(false);

    // Banking before any safe roll returns the stake only; that is not a profitable bank.
    const zeroRollBank = bankDice(startDiceRound(10));
    const even = play(bust, [{ gameKey: 'dice', outcome: zeroRollBank.outcome, stake: 10, totalReturn: zeroRollBank.totalReturn }]).challenges;
    expect(goal(even, 'diceProfit').done).toBe(false);

    const rolled = rollDice(startDiceRound(10), () => 0.99);
    const banked = bankDice(rolled);
    expect(banked.totalReturn).toBe(12);
    const profit = play(even, [{ gameKey: 'dice', outcome: banked.outcome, stake: 10, totalReturn: banked.totalReturn }]).challenges;
    expect(goal(profit, 'diceProfit').done).toBe(true);
  });

  it('tracks detail-driven goals for poker, roulette, craps, baccarat, sportsbook and numbers', () => {
    const base = withGoals(['pokerHold', 'rouletteTypes', 'crapsSides']);
    const after = play(base, [
      { gameKey: 'poker', detail: { held: 0 } },
      { gameKey: 'roulette', detail: { betType: 'color' } },
      { gameKey: 'roulette', detail: { betType: 'color' } },
      { gameKey: 'craps', detail: { side: 'pass' } },
    ]).challenges;
    expect(goal(after, 'pokerHold').done).toBe(false);
    expect(goal(after, 'rouletteTypes').progress).toBe(1);
    expect(goal(after, 'crapsSides').progress).toBe(1);

    const finished = play(after, [
      { gameKey: 'poker', detail: { held: 2 } },
      { gameKey: 'roulette', detail: { betType: 'straight' } },
      { gameKey: 'craps', detail: { side: 'dont-pass' } },
    ]);
    expect(isChallengeSetComplete(finished.challenges)).toBe(true);
    expect(finished.results.at(-1).setCompleted).toBe(true);
    expect(finished.challenges.setsCompleted).toBe(1);
    expect(finished.challenges.completedTotal).toBe(3);

    const other = play(withGoals(['baccaratSides', 'sportsFan', 'numberCruncher']), [
      { gameKey: 'baccarat', detail: { betOn: 'banker' } },
      { gameKey: 'baccarat', detail: { betOn: 'bogus' } },
      { gameKey: 'baccarat', detail: { betOn: 'tie' } },
      { gameKey: 'horse' },
      { gameKey: 'sports' },
      { gameKey: 'keno' },
      { gameKey: 'bingo' },
    ]).challenges;
    expect(other.goals.every((entry) => entry.done)).toBe(true);
    expect(goal(other, 'baccaratSides').seen).toEqual(['banker', 'tie']);
  });

  it('never ties progress to stake size', () => {
    const tiny = play(withGoals(['reelCurious', 'scratchAll', 'roomHopper']), [
      { gameKey: 'slots', stake: 1 },
      { gameKey: 'slots', stake: 1 },
    ]).challenges;
    const huge = play(withGoals(['reelCurious', 'scratchAll', 'roomHopper']), [
      { gameKey: 'slots', stake: 5000 },
      { gameKey: 'slots', stake: 5000 },
    ]).challenges;
    expect(tiny.goals).toEqual(huge.goals);
  });
});

describe('completion and unlock idempotency', () => {
  it('ignores repeated or stale round ids so progress and unlocks happen exactly once', () => {
    const state = withGoals(['blackjackFinish', 'scratchAll', 'reelCurious'], { completedTotal: 1 });
    const event = { roundId: 7, gameKey: 'blackjack', outcome: 'win', stake: 10, totalReturn: 20 };
    const first = applyRoundToChallenges(state, event);
    expect(first.ignored).toBe(false);
    expect(first.newlyCompleted).toEqual(['blackjackFinish']);
    expect(first.unlockedThemes).toEqual(['sunset']);
    expect(first.challenges.completedTotal).toBe(2);

    const replay = applyRoundToChallenges(first.challenges, event);
    expect(replay.ignored).toBe(true);
    expect(replay.newlyCompleted).toEqual([]);
    expect(replay.unlockedThemes).toEqual([]);
    expect(replay.challenges.completedTotal).toBe(2);

    const stale = applyRoundToChallenges(first.challenges, { ...event, roundId: 3, gameKey: 'scratch' });
    expect(stale.ignored).toBe(true);
    expect(goal(stale.challenges, 'scratchAll').done).toBe(false);

    for (const bad of [undefined, null, 'x', 7.5, Number.NaN]) {
      expect(applyRoundToChallenges(first.challenges, { ...event, roundId: bad }).ignored).toBe(true);
    }
  });

  it('does not re-award completion after a save/load round trip', () => {
    const storage = memoryStorage();
    const persistence = createPersistence(storage);
    const app = createDefaultAppState();
    app.stats.rounds = 1;
    const settled = applyRoundToChallenges(app.challenges, { roundId: 1, gameKey: 'blackjack', outcome: 'lose', stake: 5, totalReturn: 0 });
    app.challenges = settled.challenges;
    expect(persistence.save(app)).toBe(true);

    const reloaded = persistence.load().state;
    expect(reloaded.challenges).toEqual(settled.challenges);
    const replay = applyRoundToChallenges(reloaded.challenges, { roundId: 1, gameKey: 'blackjack', outcome: 'lose', stake: 5, totalReturn: 0 });
    expect(replay.ignored).toBe(true);
    expect(replay.challenges.completedTotal).toBe(1);
  });

  it('completing an already complete goal does not add to the lifetime total', () => {
    let state = withGoals(['scratchAll', 'blackjackFinish', 'reelCurious']);
    state = applyRoundToChallenges(state, { roundId: 1, gameKey: 'scratch' }).challenges;
    state = applyRoundToChallenges(state, { roundId: 2, gameKey: 'scratch' }).challenges;
    expect(state.completedTotal).toBe(1);
  });
});

describe('new challenge sets', () => {
  it('draws a fresh, non-overlapping set on demand while keeping lifetime counters', () => {
    const played = play(createDefaultChallengeState(), [{ gameKey: 'blackjack' }]).challenges;
    const next = startNewChallengeSet(played, () => 0);
    expect(next.setNumber).toBe(2);
    expect(next.goals).toHaveLength(CHALLENGE_SET_SIZE);
    expect(new Set(next.goals.map((entry) => entry.id)).size).toBe(CHALLENGE_SET_SIZE);
    for (const entry of next.goals) {
      expect(STARTER_CHALLENGE_IDS).not.toContain(entry.id);
      expect(entry).toMatchObject({ progress: 0, done: false, seen: [] });
    }
    expect(next.completedTotal).toBe(played.completedTotal);
    expect(next.lastRoundId).toBe(played.lastRoundId);

    expect(startNewChallengeSet(played, () => 0)).toEqual(next);
  });
});

describe('save compatibility', () => {
  it('loads an existing v2 save without challenge or cosmetic fields using defaults', () => {
    const storage = memoryStorage();
    storage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: STORAGE_VERSION,
        state: { playerChips: 432, stats: { rounds: 12, wins: 5, losses: 6, pushes: 1, totalStaked: 120, totalReturned: 90 }, history: [] },
      }),
    );
    const { state } = createPersistence(storage).load();
    expect(state.playerChips).toBe(432);
    expect(state.stats.rounds).toBe(12);
    expect(state.challenges).toEqual(createDefaultChallengeState());
    expect(state.cosmetics).toEqual({ theme: 'neon', effects: true, sound: false });

    // New rounds after loading an old save still count.
    const next = applyRoundToChallenges(state.challenges, { roundId: 13, gameKey: 'blackjack' });
    expect(next.ignored).toBe(false);
  });

  it('gives legacy migrated saves challenge and cosmetic defaults', () => {
    const migrated = migrateLegacySave({ balance: 99 });
    expect(migrated.playerChips).toBe(99);
    expect(migrated.challenges).toEqual(createDefaultChallengeState());
    expect(migrated.cosmetics.theme).toBe('neon');
  });

  it('sanitizes malformed challenge and cosmetic data', () => {
    const state = sanitizeAppState({
      playerChips: 300,
      stats: { rounds: 4 },
      challenges: {
        setNumber: 'abc',
        lastRoundId: 999,
        completedTotal: -5,
        setsCompleted: Infinity,
        goals: [
          { id: 'explorer', seen: ['slots', 'slots', 'moon', 42, 'keno'], progress: 99 },
          { id: 'hack', progress: 1 },
          { id: 'reelCurious', progress: 99 },
          'nope',
          { id: 'explorer', progress: 3 },
          { id: 'scratchAll', progress: -1 },
        ],
      },
      cosmetics: { theme: 'gold', effects: 'yes', sound: 'true' },
    });
    expect(state.playerChips).toBe(300);
    expect(state.challenges.lastRoundId).toBe(4);
    expect(state.challenges.setNumber).toBe(1);
    expect(state.challenges.goals.map((entry) => entry.id)).toEqual(['explorer', 'reelCurious', 'scratchAll']);
    expect(goal(state.challenges, 'explorer')).toMatchObject({ seen: ['slots', 'keno'], progress: 2, done: false });
    expect(goal(state.challenges, 'reelCurious')).toMatchObject({ progress: 2, done: true });
    expect(goal(state.challenges, 'scratchAll')).toMatchObject({ progress: 0, done: false });
    expect(state.challenges.completedTotal).toBe(1);
    expect(state.cosmetics).toEqual({ theme: 'neon', effects: true, sound: false });

    for (const junk of [null, 'x', 5, [], { goals: 'bad' }, { goals: [{ id: 'explorer' }] }]) {
      expect(sanitizeChallengeState(junk).goals.map((entry) => entry.id)).toEqual(STARTER_CHALLENGE_IDS);
    }
  });

  it('recovers from corrupt JSON in storage', () => {
    const storage = memoryStorage();
    storage.setItem(STORAGE_KEY, '{not json');
    const loaded = createPersistence(storage).load();
    expect(loaded.state).toEqual(createDefaultAppState());
  });
});

describe('cosmetic themes', () => {
  it('unlocks themes by lifetime completed challenges', () => {
    expect(unlockedThemeIds(0)).toEqual(['neon']);
    expect(unlockedThemeIds(2)).toEqual(['neon', 'sunset']);
    expect(unlockedThemeIds(100)).toEqual(Object.keys(COSMETIC_THEMES));
  });

  it('rejects locked or unknown themes and persists unlocked selections', () => {
    expect(selectTheme(undefined, 'aurora', 3).ok).toBe(false);
    expect(selectTheme(undefined, 'constructor', 99).ok).toBe(false);
    expect(selectTheme(undefined, '__proto__', 99).ok).toBe(false);
    const chosen = selectTheme({ theme: 'neon', effects: false, sound: true }, 'aurora', 4);
    expect(chosen).toEqual({ ok: true, cosmetics: { theme: 'aurora', effects: false, sound: true } });

    const storage = memoryStorage();
    const app = createDefaultAppState();
    app.challenges.completedTotal = 4;
    app.cosmetics = chosen.cosmetics;
    createPersistence(storage).save(app);
    const reloaded = createPersistence(storage).load().state;
    expect(reloaded.cosmetics).toEqual({ theme: 'aurora', effects: false, sound: true });
    expect(sanitizeCosmetics({ theme: 'aurora' }, 1).theme).toBe('neon');
  });

  it('does not change balance, stats, or settlement math', () => {
    const plain = createDefaultAppState();
    const themed = sanitizeAppState({ ...plain, challenges: { ...plain.challenges, completedTotal: 9 }, cosmetics: { theme: 'gold' } });
    expect(themed.cosmetics.theme).toBe('gold');
    expect(themed.playerChips).toBe(plain.playerChips);
    expect(themed.stats).toEqual(plain.stats);
    expect(evaluateSlots(['crown', 'crown', 'crown'], 10).totalReturn).toBe(110);
  });
});

describe('round summaries', () => {
  it('labels results by net chips so a returned stake is never shown as a win', () => {
    expect(summarizeRound({ outcome: 'win', stake: 10, totalReturn: 20 })).toMatchObject({ kind: 'win', net: 10, label: 'Win +10', big: false });
    expect(summarizeRound({ outcome: 'win', stake: 10, totalReturn: 110 })).toMatchObject({ kind: 'win', big: true });
    expect(summarizeRound({ outcome: 'push', stake: 10, totalReturn: 10 })).toMatchObject({ kind: 'even', label: 'Push ±0' });
    expect(summarizeRound({ outcome: 'win', stake: 10, totalReturn: 10 })).toMatchObject({ kind: 'even', label: 'Stake back ±0' });
    expect(summarizeRound({ outcome: 'lose', stake: 25, totalReturn: 0 })).toMatchObject({
      kind: 'loss',
      net: -25,
      label: 'Loss −25',
      detail: 'Staked 25 · Returned 0 · Net −25 chips',
    });
  });
});

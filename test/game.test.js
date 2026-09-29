import { describe, expect, it } from 'vitest';
import {
  BACCARAT_PAYOUTS,
  STARTING_PLAYER_CHIPS,
  createDefaultAppState,
  createDefaultOwnerState,
  createPersistence,
  createScratchTicket,
  drawBingoBall,
  drawVideoPoker,
  establishCasino,
  evaluatePokerHand,
  evaluateSlots,
  hireStaff,
  migrateLegacySave,
  playBaccaratRound,
  purchaseInstallation,
  rollCraps,
  runCasinoDay,
  settleKeno,
  settleRouletteBet,
  settleScratchTicket,
  startCrapsRound,
  startVideoPokerRound,
  totalReturnFromProfit,
  transferPlayerToCasino,
  updateCasinoSetting,
  validateStake,
} from '../src/game/casino-engine.js';
import { buildStandaloneHtml } from '../src/build-standalone.js';

function card(rank, suit) {
  return { rank, suit, id: `${rank}-${suit}-${Math.random()}` };
}

function fillerCards(count) {
  const suits = ['spades', 'hearts', 'clubs', 'diamonds'];
  return Array.from({ length: count }, (_, index) => ({
    rank: (index % 13) + 1,
    suit: suits[index % suits.length],
    id: `fill-${index}`,
  }));
}

function rngFrom(values) {
  let index = 0;
  return () => {
    const value = values[index] ?? values[values.length - 1] ?? 0;
    index += 1;
    return value;
  };
}

describe('wager safeguards', () => {
  it('rejects invalid stakes and computes rounded profit returns', () => {
    expect(validateStake(10, 100).ok).toBe(true);
    expect(validateStake(2.5, 100).ok).toBe(false);
    expect(validateStake(Infinity, 100).ok).toBe(false);
    expect(validateStake(-4, 100).ok).toBe(false);
    expect(totalReturnFromProfit(11, 0.95)).toBe(21);
  });
});

describe('game settlements', () => {
  it('settles slot matches and roulette zero correctly', () => {
    const slotWin = evaluateSlots(['crown', 'crown', 'crown'], 10);
    expect(slotWin.won).toBe(true);
    expect(slotWin.totalReturn).toBe(110);

    const zeroLoss = settleRouletteBet({ type: 'color', value: 'red' }, { number: 0, color: 'green', parity: 'none' }, 25);
    expect(zeroLoss.won).toBe(false);
    expect(zeroLoss.totalReturn).toBe(0);

    const zeroStraight = settleRouletteBet({ type: 'straight', value: '0', number: '0' }, { number: 0, color: 'green', parity: 'none' }, 10);
    expect(zeroStraight.won).toBe(true);
    expect(zeroStraight.totalReturn).toBe(360);
  });

  it('applies baccarat banker commission and tie pushes', () => {
    const bankerShoe = [
      card(2, 'hearts'),
      card(4, 'clubs'),
      card(3, 'spades'),
      card(4, 'diamonds'),
      ...fillerCards(20),
    ];
    const bankerResult = playBaccaratRound(10, 'banker', bankerShoe, () => 0);
    expect(bankerResult.winner).toBe('banker');
    expect(bankerResult.profitMultiplier).toBe(BACCARAT_PAYOUTS.banker);
    expect(bankerResult.totalReturn).toBe(20);

    const tieShoe = [
      card(4, 'hearts'),
      card(4, 'clubs'),
      card(5, 'spades'),
      card(3, 'diamonds'),
      ...fillerCards(20),
    ];
    const tieResult = playBaccaratRound(10, 'player', tieShoe, () => 0);
    expect(tieResult.winner).toBe('tie');
    expect(tieResult.outcome).toBe('push');
    expect(tieResult.totalReturn).toBe(10);
  });

  it('handles craps point cycles and dont-pass bar 12', () => {
    const passStart = startCrapsRound(20, 'pass');
    const pointSet = rollCraps(passStart, rngFrom([0.4, 0.4]));
    expect(pointSet.point).toBe(6);
    expect(pointSet.finished).toBe(false);

    const passWin = rollCraps(pointSet, rngFrom([0.2, 0.6]));
    expect(passWin.finished).toBe(true);
    expect(passWin.outcome).toBe('win');
    expect(passWin.totalReturn).toBe(40);

    const dontPass = rollCraps(startCrapsRound(15, 'dont-pass'), rngFrom([0.99, 0.99]));
    expect(dontPass.finished).toBe(true);
    expect(dontPass.outcome).toBe('push');
    expect(dontPass.totalReturn).toBe(15);
  });

  it('evaluates video poker hands and enforces single-settlement scratch tickets', () => {
    const royal = evaluatePokerHand([
      card(1, 'hearts'),
      card(13, 'hearts'),
      card(12, 'hearts'),
      card(11, 'hearts'),
      card(10, 'hearts'),
    ]);
    expect(royal.name).toBe('Royal Flush');
    expect(royal.profitMultiplier).toBe(25);

    const round = startVideoPokerRound(10, [
      card(1, 'hearts'),
      card(13, 'hearts'),
      card(12, 'hearts'),
      card(11, 'hearts'),
      card(9, 'hearts'),
      card(10, 'hearts'),
      ...fillerCards(20),
    ]);
    const drawn = drawVideoPoker(round, [0, 1, 2, 3]);
    expect(drawn.handName).toBe('Royal Flush');
    expect(drawn.totalReturn).toBe(260);

    const settled = settleScratchTicket({
      ...createScratchTicket(10, () => 0),
      symbols: ['gold', 'gold', 'gold', 'coin', 'bar', 'star', 'coin', 'bar', 'star'],
      revealed: Array(9).fill(true),
    });
    expect(settled.totalReturn).toBe(90);
    const secondSettle = settleScratchTicket(settled);
    expect(secondSettle.ignored).toBe(true);
  });

  it('draws unique keno numbers and pays by hits', () => {
    const result = settleKeno([1, 2, 3, 4, 5], 10, () => 0);
    expect(new Set(result.draw).size).toBe(result.draw.length);
    expect(result.hits).toEqual([1, 2, 3, 4, 5]);
    expect(result.totalReturn).toBe(260);
  });

  it('lets bingo progress without duplicate draws', () => {
    let round = {
      active: true,
      finished: false,
      stake: 10,
      card: [
        [1, 2, 3, 4, 5],
        [16, 17, 18, 19, 20],
        [31, 32, 'FREE', 34, 35],
        [46, 47, 48, 49, 50],
        [61, 62, 63, 64, 65],
      ],
      drawnNumbers: [],
      calls: 0,
      totalReturn: 0,
      outcome: null,
      message: '',
    };

    round = drawBingoBall(round, () => 0);
    expect(round.drawnNumbers).toEqual([1]);
    round = drawBingoBall(round, () => 0);
    expect(round.drawnNumbers).toEqual([1, 2]);
    expect(new Set(round.drawnNumbers).size).toBe(2);
  });
});

describe('owner mode and persistence', () => {
  it('moves funds, buys attractions, and runs simulated days with settings effects', () => {
    const established = establishCasino(createDefaultOwnerState(), 'Casey', 'North Star').owner;
    const transferred = transferPlayerToCasino(STARTING_PLAYER_CHIPS, established, 250);
    expect(transferred.ok).toBe(true);
    expect(transferred.playerChips).toBe(STARTING_PLAYER_CHIPS - 250);

    let owner = transferred.owner;
    owner = purchaseInstallation(owner, 'slotsMachine').owner;
    owner = purchaseInstallation(owner, 'blackjackTable').owner;
    owner = hireStaff(owner, 'dealer').owner;
    owner = hireStaff(owner, 'host').owner;

    const lowMarketing = updateCasinoSetting(owner, 'marketing', 0);
    const highMarketing = updateCasinoSetting(owner, 'marketing', 3);
    const lowResult = runCasinoDay(lowMarketing, () => 0.5);
    const highResult = runCasinoDay(highMarketing, () => 0.5);

    expect(lowResult.ok).toBe(true);
    expect(highResult.ok).toBe(true);
    expect(highResult.summary.visitors).toBeGreaterThan(lowResult.summary.visitors);
    expect(highResult.owner.stats.daysRun).toBe(1);
  });

  it('migrates legacy saves and survives blocked storage', () => {
    const migrated = migrateLegacySave({
      balance: 321,
      stats: { rounds: 5, wins: 2, losses: 2, pushes: 1, totalWagered: 50, totalReturned: 55 },
      recentResults: [{ game: 'Slots', outcome: 'win', delta: 20, text: 'nice' }],
    });
    expect(migrated.playerChips).toBe(321);
    expect(migrated.stats.totalStaked).toBe(50);
    expect(migrated.history[0].game).toBe('Slots');

    const blocked = createPersistence({
      setItem() {
        throw new Error('blocked');
      },
      getItem() {
        return null;
      },
      removeItem() {},
    });
    const blockedLoad = blocked.load();
    expect(blockedLoad.storageAvailable).toBe(false);
    expect(blockedLoad.state).toEqual(createDefaultAppState());

    const memory = {
      data: new Map(),
      setItem(key, value) {
        this.data.set(key, value);
      },
      getItem(key) {
        return this.data.get(key) ?? null;
      },
      removeItem(key) {
        this.data.delete(key);
      },
    };
    memory.setItem('neon-lucky-arcade-v1', JSON.stringify({ version: 1, state: { balance: 222 } }));
    const migratedLoad = createPersistence(memory).load();
    expect(migratedLoad.migrated).toBe(true);
    expect(migratedLoad.state.playerChips).toBe(222);
  });
});

describe('standalone packaging', () => {
  it('inlines the full app without external runtime references', () => {
    const html = buildStandaloneHtml();
    expect(html).toContain('Download HTML');
    expect(html).toContain('window.__CASINO_RUNTIME_SOURCE__');
    expect(html).toContain('<style>');
    expect(html).not.toContain('<link rel="stylesheet"');
    expect(html).not.toContain('src="/src/');
    expect(html).not.toContain('type="module" src=');
  });
});

export const STARTING_PLAYER_CHIPS = 750;
export const STARTING_CASINO_FUNDS = 2500;
export const STORAGE_VERSION = 2;
export const STORAGE_KEY = `lucky-cascade-casino-v${STORAGE_VERSION}`;
export const LEGACY_STORAGE_KEYS = ['neon-lucky-arcade-v1'];

export const SLOT_SYMBOLS = ['crown', 'gem', 'bell', 'star', 'horseshoe'];
export const SLOT_PAYTABLE = {
  crown: 10,
  gem: 7,
  bell: 5,
  star: 3,
  horseshoe: 2,
};

export const DICE_PROFIT_STEPS = [0.2, 0.6, 1.2, 2, 3.5, 6];

export const ROULETTE_RED_NUMBERS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);

export const ROULETTE_BETS = {
  straight: { label: 'Straight up', profitMultiplier: 35 },
  color: { label: 'Color', profitMultiplier: 1 },
  parity: { label: 'Even / Odd', profitMultiplier: 1 },
  dozen: { label: 'Dozen', profitMultiplier: 2 },
};

export const BACCARAT_PAYOUTS = {
  player: 1,
  banker: 0.95,
  tie: 8,
};

export const KENO_PICK_COUNT = 5;
export const KENO_FIELD_SIZE = 20;
export const KENO_DRAW_COUNT = 10;
export const KENO_PAYTABLE = { 2: 1, 3: 3, 4: 10, 5: 25 };

export const BINGO_MAX_CALLS = 30;
export const BINGO_PAYTABLE = {
  fast: 4,
  standard: 2,
  late: 1,
};

export const SCRATCH_SYMBOLS = ['gold', 'ruby', 'coin', 'star', 'bar'];
export const SCRATCH_PAYTABLE = {
  gold: 8,
  ruby: 5,
  coin: 3,
  star: 2,
};

export const POKER_PAYTABLE = {
  'Royal Flush': 25,
  'Straight Flush': 9,
  'Four of a Kind': 5,
  'Full House': 3,
  Flush: 2,
  Straight: 2,
  'Three of a Kind': 1.5,
  'Two Pair': 1,
  'Jacks or Better': 1,
};

export const GAME_INSTALLATIONS = {
  slotsMachine: {
    label: 'Aurora Slots Bank',
    category: 'Machines',
    cost: 450,
    dailyRevenue: 220,
    upkeep: 22,
    visitors: 10,
    unlockLevel: 1,
  },
  blackjackTable: {
    label: 'Blackjack Table',
    category: 'Tables',
    cost: 600,
    dailyRevenue: 280,
    upkeep: 28,
    visitors: 11,
    unlockLevel: 1,
  },
  rouletteWheel: {
    label: 'Roulette Wheel',
    category: 'Tables',
    cost: 700,
    dailyRevenue: 320,
    upkeep: 30,
    visitors: 12,
    unlockLevel: 2,
  },
  baccaratSalon: {
    label: 'Baccarat Salon',
    category: 'Tables',
    cost: 850,
    dailyRevenue: 360,
    upkeep: 36,
    visitors: 13,
    unlockLevel: 2,
  },
  diceLounge: {
    label: 'Risk Dice Lounge',
    category: 'Experiences',
    cost: 380,
    dailyRevenue: 180,
    upkeep: 18,
    visitors: 8,
    unlockLevel: 1,
  },
  sportsbookStage: {
    label: 'Sportsbook Stage',
    category: 'Sportsbook',
    cost: 900,
    dailyRevenue: 390,
    upkeep: 40,
    visitors: 14,
    unlockLevel: 3,
  },
};

export const STAFF_ROLES = {
  dealer: {
    label: 'Dealer',
    hireCost: 180,
    dailyWage: 70,
    coverage: 2,
    visitorBonus: 0.04,
  },
  host: {
    label: 'Host',
    hireCost: 140,
    dailyWage: 50,
    coverage: 99,
    visitorBonus: 0.05,
  },
  technician: {
    label: 'Technician',
    hireCost: 160,
    dailyWage: 55,
    coverage: 99,
    visitorBonus: 0,
  },
  security: {
    label: 'Security',
    hireCost: 220,
    dailyWage: 75,
    coverage: 99,
    visitorBonus: 0.03,
  },
};

export const CASINO_UPGRADES = {
  facade: {
    label: 'Neon Facade',
    cost: 320,
    visitorMultiplier: 0.1,
    revenueMultiplier: 0,
    dailyFee: 4,
  },
  lounge: {
    label: 'VIP Lounge',
    cost: 640,
    visitorMultiplier: 0.06,
    revenueMultiplier: 0.12,
    dailyFee: 16,
  },
  analytics: {
    label: 'Analytics Suite',
    cost: 520,
    visitorMultiplier: 0,
    revenueMultiplier: 0.08,
    dailyFee: 8,
  },
  kitchen: {
    label: 'Snack Bar',
    cost: 280,
    visitorMultiplier: 0.03,
    revenueMultiplier: 0.04,
    dailyFee: 6,
  },
};

const SUITS = ['spades', 'hearts', 'clubs', 'diamonds'];
const RANK_LABELS = {
  1: 'A',
  11: 'J',
  12: 'Q',
  13: 'K',
};

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function normalizeWholeChips(value) {
  if (!Number.isFinite(Number(value))) return 0;
  return Math.max(0, Math.round(Number(value)));
}

export function sanitizeName(value, maxLength = 28) {
  return String(value ?? '')
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

export function validateStake(rawStake, balance) {
  const stake = Number(rawStake);
  const available = normalizeWholeChips(balance);

  if (!Number.isFinite(stake) || !Number.isInteger(stake)) {
    return { ok: false, error: 'Stake must be a finite whole number of chips.' };
  }
  if (stake <= 0) {
    return { ok: false, error: 'Stake must be at least 1 chip.' };
  }
  if (stake > available) {
    return { ok: false, error: 'You do not have enough chips for that stake.' };
  }
  return { ok: true, stake };
}

export function placeStake(balance, rawStake) {
  const result = validateStake(rawStake, balance);
  if (!result.ok) return { ok: false, error: result.error, balance: normalizeWholeChips(balance) };
  return {
    ok: true,
    stake: result.stake,
    balance: normalizeWholeChips(balance - result.stake),
  };
}

export function totalReturnFromProfit(stake, profitMultiplier) {
  const safeStake = normalizeWholeChips(stake);
  if (!Number.isFinite(profitMultiplier) || profitMultiplier < 0) return safeStake;
  return normalizeWholeChips(safeStake + safeStake * profitMultiplier);
}

export function applyReturn(balance, totalReturn) {
  return normalizeWholeChips(normalizeWholeChips(balance) + normalizeWholeChips(totalReturn));
}

export function randomInt(rng, min, max) {
  return min + Math.floor(rng() * (max - min + 1));
}

export function createDeck(deckCount = 1) {
  const cards = [];
  for (let deckIndex = 0; deckIndex < deckCount; deckIndex += 1) {
    for (const suit of SUITS) {
      for (let rank = 1; rank <= 13; rank += 1) {
        cards.push({
          suit,
          rank,
          id: `${deckIndex}-${suit}-${rank}-${cards.length}`,
        });
      }
    }
  }
  return cards;
}

export function shuffleDeck(cards, rng = Math.random) {
  const deck = [...cards];
  for (let index = deck.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(rng() * (index + 1));
    [deck[index], deck[swapIndex]] = [deck[swapIndex], deck[index]];
  }
  return deck;
}

export function createShoe(deckCount = 4, rng = Math.random) {
  return shuffleDeck(createDeck(deckCount), rng);
}

export function ensureShoe(shoe, deckCount = 4, rng = Math.random) {
  return Array.isArray(shoe) && shoe.length >= 20 ? [...shoe] : createShoe(deckCount, rng);
}

export function drawCards(shoe, count, deckCount = 4, rng = Math.random) {
  let nextShoe = ensureShoe(shoe, deckCount, rng);
  const cards = [];
  while (cards.length < count) {
    if (nextShoe.length === 0) nextShoe = createShoe(deckCount, rng);
    cards.push(nextShoe.shift());
  }
  return { cards, shoe: nextShoe };
}

export function cardRankLabel(rank) {
  return RANK_LABELS[rank] ?? String(rank);
}

export function cardLabel(card) {
  return `${cardRankLabel(card.rank)} ${card.suit}`;
}

export function spinSlots(rng = Math.random) {
  return Array.from({ length: 3 }, () => SLOT_SYMBOLS[Math.floor(rng() * SLOT_SYMBOLS.length)]);
}

export function evaluateSlots(symbols, stake) {
  const won = symbols.every((symbol) => symbol === symbols[0]);
  const profitMultiplier = won ? SLOT_PAYTABLE[symbols[0]] ?? 0 : 0;
  return {
    symbols,
    won,
    profitMultiplier,
    totalReturn: won ? totalReturnFromProfit(stake, profitMultiplier) : 0,
  };
}

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
    message: 'Roll or bank your profit.',
  };
}

export function rollDice(round, rng = Math.random) {
  if (!round || !round.active) return { ...round, ignored: true };
  const rolled = randomInt(rng, 1, 6);
  const threshold = bustThreshold(round.rollCount);
  if (rolled <= threshold) {
    return {
      ...round,
      active: false,
      lastRoll: rolled,
      outcome: 'lose',
      totalReturn: 0,
      message: `Rolled ${rolled}. Bust at ${threshold} or less.`,
    };
  }

  const rollCount = round.rollCount + 1;
  const profitMultiplier = DICE_PROFIT_STEPS[Math.min(rollCount - 1, DICE_PROFIT_STEPS.length - 1)];
  const maxed = rollCount >= DICE_PROFIT_STEPS.length;
  return {
    ...round,
    active: !maxed,
    rollCount,
    lastRoll: rolled,
    profitMultiplier,
    outcome: maxed ? 'win' : null,
    totalReturn: maxed ? totalReturnFromProfit(round.stake, profitMultiplier) : 0,
    message: maxed
      ? `Rolled ${rolled}. Top tier reached and auto-banked.`
      : `Rolled ${rolled}. Safe — profit is now x${profitMultiplier.toFixed(1)}.`,
  };
}

export function bankDice(round) {
  if (!round || !round.active) return { ...round, ignored: true };
  return {
    ...round,
    active: false,
    outcome: 'win',
    totalReturn: totalReturnFromProfit(round.stake, round.profitMultiplier),
    message: `Banked for x${round.profitMultiplier.toFixed(1)} profit.`,
  };
}

function blackjackCardValue(card) {
  if (card.rank === 1) return 11;
  if (card.rank >= 10) return 10;
  return card.rank;
}

export function scoreBlackjack(cards) {
  let total = cards.reduce((sum, card) => sum + blackjackCardValue(card), 0);
  let aces = cards.filter((card) => card.rank === 1).length;
  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }
  const hardTotal = cards.reduce((sum, card) => sum + (card.rank === 1 ? 1 : blackjackCardValue(card)), 0);
  return { total, isSoft: cards.some((card) => card.rank === 1) && hardTotal + 10 === total };
}

export function isBlackjackNatural(cards) {
  return cards.length === 2 && scoreBlackjack(cards).total === 21;
}

export function resolveBlackjackNaturals(playerCards, dealerCards, stake) {
  const playerNatural = isBlackjackNatural(playerCards);
  const dealerNatural = isBlackjackNatural(dealerCards);
  if (!playerNatural && !dealerNatural) return { done: false };
  if (playerNatural && dealerNatural) {
    return { done: true, outcome: 'push', totalReturn: stake, message: 'Both hands show blackjack. Push.' };
  }
  if (playerNatural) {
    return {
      done: true,
      outcome: 'win',
      totalReturn: totalReturnFromProfit(stake, 1.5),
      message: 'Natural blackjack pays 3:2.',
    };
  }
  return { done: true, outcome: 'lose', totalReturn: 0, message: 'Dealer blackjack.' };
}

export function startBlackjackRound(stake, shoe, rng = Math.random) {
  let nextShoe = ensureShoe(shoe, 4, rng);
  const playerDeal = drawCards(nextShoe, 2, 4, rng);
  nextShoe = playerDeal.shoe;
  const dealerDeal = drawCards(nextShoe, 2, 4, rng);
  nextShoe = dealerDeal.shoe;
  const natural = resolveBlackjackNaturals(playerDeal.cards, dealerDeal.cards, stake);
  return {
    active: !natural.done,
    finished: natural.done,
    stake,
    shoe: nextShoe,
    playerCards: playerDeal.cards,
    dealerCards: dealerDeal.cards,
    outcome: natural.done ? natural.outcome : null,
    totalReturn: natural.done ? natural.totalReturn : 0,
    message: natural.done ? natural.message : 'Choose hit or stand.',
  };
}

export function blackjackHit(round, rng = Math.random) {
  if (!round || round.finished) return { ...round, ignored: true };
  const draw = drawCards(round.shoe, 1, 4, rng);
  const playerCards = [...round.playerCards, draw.cards[0]];
  const scored = scoreBlackjack(playerCards);
  if (scored.total > 21) {
    return {
      ...round,
      shoe: draw.shoe,
      playerCards,
      active: false,
      finished: true,
      outcome: 'lose',
      totalReturn: 0,
      message: 'Bust — dealer wins.',
    };
  }
  return {
    ...round,
    shoe: draw.shoe,
    playerCards,
    message: 'Choose hit or stand.',
  };
}

export function dealerPlayBlackjack(dealerCards, shoe, rng = Math.random) {
  let cards = [...dealerCards];
  let nextShoe = [...shoe];
  while (scoreBlackjack(cards).total < 17) {
    const draw = drawCards(nextShoe, 1, 4, rng);
    nextShoe = draw.shoe;
    cards = [...cards, draw.cards[0]];
  }
  return { dealerCards: cards, shoe: nextShoe };
}

export function settleBlackjack(playerCards, dealerCards, stake) {
  const playerTotal = scoreBlackjack(playerCards).total;
  const dealerTotal = scoreBlackjack(dealerCards).total;
  if (dealerTotal > 21 || playerTotal > dealerTotal) {
    return { outcome: 'win', totalReturn: totalReturnFromProfit(stake, 1), message: 'Player wins.' };
  }
  if (dealerTotal > playerTotal) {
    return { outcome: 'lose', totalReturn: 0, message: 'Dealer wins.' };
  }
  return { outcome: 'push', totalReturn: stake, message: 'Push.' };
}

export function blackjackStand(round, rng = Math.random) {
  if (!round || round.finished) return { ...round, ignored: true };
  const dealerPlay = dealerPlayBlackjack(round.dealerCards, round.shoe, rng);
  const settled = settleBlackjack(round.playerCards, dealerPlay.dealerCards, round.stake);
  return {
    ...round,
    active: false,
    finished: true,
    shoe: dealerPlay.shoe,
    dealerCards: dealerPlay.dealerCards,
    outcome: settled.outcome,
    totalReturn: settled.totalReturn,
    message: settled.message,
  };
}

export function spinRoulette(rng = Math.random) {
  const number = randomInt(rng, 0, 36);
  const color = number === 0 ? 'green' : ROULETTE_RED_NUMBERS.has(number) ? 'red' : 'black';
  return { number, color, parity: number === 0 ? 'none' : number % 2 === 0 ? 'even' : 'odd' };
}

export function settleRouletteBet(bet, spin, stake) {
  let won = false;
  if (bet.type === 'straight') won = spin.number === Number(bet.number);
  if (bet.type === 'color') won = spin.color === bet.value;
  if (bet.type === 'parity') won = spin.parity === bet.value;
  if (bet.type === 'dozen') {
    const dozen = spin.number === 0 ? 0 : Math.ceil(spin.number / 12);
    won = dozen === Number(bet.value);
  }
  const profitMultiplier = won ? ROULETTE_BETS[bet.type].profitMultiplier : 0;
  return {
    won,
    spin,
    profitMultiplier,
    totalReturn: won ? totalReturnFromProfit(stake, profitMultiplier) : 0,
  };
}

function baccaratCardValue(card) {
  if (card.rank === 1) return 1;
  if (card.rank >= 10) return 0;
  return card.rank;
}

export function baccaratTotal(cards) {
  return cards.reduce((sum, card) => sum + baccaratCardValue(card), 0) % 10;
}

function baccaratThirdCardValue(card) {
  return card ? baccaratCardValue(card) : null;
}

export function playBaccaratRound(stake, betOn, shoe, rng = Math.random) {
  let nextShoe = ensureShoe(shoe, 6, rng);
  const playerFirst = drawCards(nextShoe, 2, 6, rng);
  nextShoe = playerFirst.shoe;
  const bankerFirst = drawCards(nextShoe, 2, 6, rng);
  nextShoe = bankerFirst.shoe;

  let playerCards = [...playerFirst.cards];
  let bankerCards = [...bankerFirst.cards];
  let playerTotal = baccaratTotal(playerCards);
  let bankerTotal = baccaratTotal(bankerCards);

  if (!(playerTotal >= 8 || bankerTotal >= 8)) {
    let playerThird = null;
    if (playerTotal <= 5) {
      const draw = drawCards(nextShoe, 1, 6, rng);
      nextShoe = draw.shoe;
      playerThird = draw.cards[0];
      playerCards = [...playerCards, playerThird];
      playerTotal = baccaratTotal(playerCards);
    }

    const playerThirdValue = baccaratThirdCardValue(playerThird);
    const bankerDraw =
      bankerTotal <= 2 ||
      (bankerTotal === 3 && playerThirdValue !== 8) ||
      (bankerTotal === 4 && playerThirdValue != null && playerThirdValue >= 2 && playerThirdValue <= 7) ||
      (bankerTotal === 5 && playerThirdValue != null && playerThirdValue >= 4 && playerThirdValue <= 7) ||
      (bankerTotal === 6 && playerThirdValue != null && (playerThirdValue === 6 || playerThirdValue === 7)) ||
      (playerThirdValue == null && bankerTotal <= 5);

    if (bankerDraw) {
      const draw = drawCards(nextShoe, 1, 6, rng);
      nextShoe = draw.shoe;
      bankerCards = [...bankerCards, draw.cards[0]];
      bankerTotal = baccaratTotal(bankerCards);
    }
  }

  const winner = playerTotal === bankerTotal ? 'tie' : playerTotal > bankerTotal ? 'player' : 'banker';
  const won = winner === betOn;
  const profitMultiplier = won ? BACCARAT_PAYOUTS[betOn] : 0;
  const totalReturn = won ? totalReturnFromProfit(stake, profitMultiplier) : winner === 'tie' && betOn !== 'tie' ? stake : 0;
  const outcome = winner === 'tie' && betOn !== 'tie' ? 'push' : won ? 'win' : 'lose';
  return {
    shoe: nextShoe,
    playerCards,
    bankerCards,
    playerTotal,
    bankerTotal,
    winner,
    betOn,
    outcome,
    profitMultiplier,
    totalReturn,
    message:
      winner === 'tie'
        ? betOn === 'tie'
          ? 'Tie bet wins at 8:1.'
          : 'Tie game — player and banker bets push.'
        : `${winner === 'banker' ? 'Banker' : 'Player'} wins${winner === 'banker' && won ? ' with 5% commission' : ''}.`,
  };
}

export function startCrapsRound(stake, side) {
  return {
    active: true,
    finished: false,
    stake,
    side,
    phase: 'come-out',
    point: null,
    outcome: null,
    totalReturn: 0,
    rolls: [],
    message: 'Roll the come-out.',
  };
}

export function rollCraps(round, rng = Math.random) {
  if (!round || round.finished) return { ...round, ignored: true };
  const dieOne = randomInt(rng, 1, 6);
  const dieTwo = randomInt(rng, 1, 6);
  const total = dieOne + dieTwo;
  const rolls = [...round.rolls, { dieOne, dieTwo, total }];

  if (round.phase === 'come-out') {
    if (round.side === 'pass') {
      if (total === 7 || total === 11) {
        return {
          ...round,
          rolls,
          active: false,
          finished: true,
          outcome: 'win',
          totalReturn: totalReturnFromProfit(round.stake, 1),
          message: `Come-out ${total}: pass line wins.`,
        };
      }
      if ([2, 3, 12].includes(total)) {
        return {
          ...round,
          rolls,
          active: false,
          finished: true,
          outcome: 'lose',
          totalReturn: 0,
          message: `Come-out ${total}: pass line loses.`,
        };
      }
    }

    if (round.side === 'dont-pass') {
      if (total === 7 || total === 11) {
        return {
          ...round,
          rolls,
          active: false,
          finished: true,
          outcome: 'lose',
          totalReturn: 0,
          message: `Come-out ${total}: don't pass loses.`,
        };
      }
      if (total === 12) {
        return {
          ...round,
          rolls,
          active: false,
          finished: true,
          outcome: 'push',
          totalReturn: round.stake,
          message: "Come-out 12: don't pass pushes.",
        };
      }
      if (total === 2 || total === 3) {
        return {
          ...round,
          rolls,
          active: false,
          finished: true,
          outcome: 'win',
          totalReturn: totalReturnFromProfit(round.stake, 1),
          message: `Come-out ${total}: don't pass wins.`,
        };
      }
    }

    return {
      ...round,
      rolls,
      phase: 'point',
      point: total,
      message: `Point is ${total}. Keep rolling.`,
    };
  }

  if (round.side === 'pass') {
    if (total === round.point) {
      return {
        ...round,
        rolls,
        active: false,
        finished: true,
        outcome: 'win',
        totalReturn: totalReturnFromProfit(round.stake, 1),
        message: `Point ${round.point} hit before 7: pass wins.`,
      };
    }
    if (total === 7) {
      return {
        ...round,
        rolls,
        active: false,
        finished: true,
        outcome: 'lose',
        totalReturn: 0,
        message: 'Seven-out: pass loses.',
      };
    }
  } else {
    if (total === 7) {
      return {
        ...round,
        rolls,
        active: false,
        finished: true,
        outcome: 'win',
        totalReturn: totalReturnFromProfit(round.stake, 1),
        message: 'Seven-out before the point: don\'t pass wins.',
      };
    }
    if (total === round.point) {
      return {
        ...round,
        rolls,
        active: false,
        finished: true,
        outcome: 'lose',
        totalReturn: 0,
        message: `Point ${round.point} hit first: don't pass loses.`,
      };
    }
  }

  return {
    ...round,
    rolls,
    message: `Rolled ${total}. Point is still ${round.point}.`,
  };
}

function sortRanks(cards) {
  return [...cards].map((card) => card.rank).sort((a, b) => a - b);
}

function isFlush(cards) {
  return cards.every((card) => card.suit === cards[0].suit);
}

function isStraight(ranks) {
  const unique = [...new Set(ranks)];
  if (unique.length !== 5) return false;
  const lowAce = [1, 2, 3, 4, 5].every((rank, index) => unique[index] === rank);
  if (lowAce) return true;
  const highRanks = unique.map((rank) => (rank === 1 ? 14 : rank)).sort((a, b) => a - b);
  return highRanks.every((rank, index) => (index === 0 ? true : rank === highRanks[index - 1] + 1));
}

export function evaluatePokerHand(cards) {
  const ranks = sortRanks(cards);
  const counts = new Map();
  for (const rank of ranks) counts.set(rank, (counts.get(rank) ?? 0) + 1);
  const grouped = [...counts.values()].sort((a, b) => b - a);
  const flush = isFlush(cards);
  const straight = isStraight(ranks);
  const highRanks = ranks.map((rank) => (rank === 1 ? 14 : rank)).sort((a, b) => a - b);
  const royal = flush && straight && highRanks.join(',') === '10,11,12,13,14';

  let name = 'No Win';
  if (royal) name = 'Royal Flush';
  else if (flush && straight) name = 'Straight Flush';
  else if (grouped[0] === 4) name = 'Four of a Kind';
  else if (grouped[0] === 3 && grouped[1] === 2) name = 'Full House';
  else if (flush) name = 'Flush';
  else if (straight) name = 'Straight';
  else if (grouped[0] === 3) name = 'Three of a Kind';
  else if (grouped[0] === 2 && grouped[1] === 2) name = 'Two Pair';
  else if (grouped[0] === 2) {
    const pairRank = [...counts.entries()].find(([, count]) => count === 2)?.[0] ?? 0;
    if (pairRank === 1 || pairRank >= 11) name = 'Jacks or Better';
  }

  return {
    name,
    profitMultiplier: POKER_PAYTABLE[name] ?? 0,
  };
}

export function startVideoPokerRound(stake, shoe, rng = Math.random) {
  const draw = drawCards(ensureShoe(shoe, 1, rng), 5, 1, rng);
  return {
    active: true,
    finished: false,
    stake,
    shoe: draw.shoe,
    cards: draw.cards,
    message: 'Choose cards to hold, then draw once.',
  };
}

export function drawVideoPoker(round, holdIndices, rng = Math.random) {
  if (!round || round.finished) return { ...round, ignored: true };
  const holdSet = new Set((holdIndices ?? []).filter((value) => Number.isInteger(value) && value >= 0 && value < 5));
  let nextShoe = [...round.shoe];
  const cards = round.cards.map((card, index) => {
    if (holdSet.has(index)) return card;
    const draw = drawCards(nextShoe, 1, 1, rng);
    nextShoe = draw.shoe;
    return draw.cards[0];
  });
  const evaluation = evaluatePokerHand(cards);
  return {
    ...round,
    active: false,
    finished: true,
    shoe: nextShoe,
    cards,
    handName: evaluation.name,
    outcome: evaluation.profitMultiplier > 0 ? 'win' : 'lose',
    totalReturn: evaluation.profitMultiplier > 0 ? totalReturnFromProfit(round.stake, evaluation.profitMultiplier) : 0,
    profitMultiplier: evaluation.profitMultiplier,
    message:
      evaluation.profitMultiplier > 0
        ? `${evaluation.name} pays x${evaluation.profitMultiplier}.`
        : 'No paying hand this round.',
  };
}

export function createNumberPool(size) {
  return Array.from({ length: size }, (_, index) => index + 1);
}

export function uniqueDraw(pool, count, rng = Math.random) {
  const numbers = [...pool];
  const picked = [];
  while (picked.length < count && numbers.length > 0) {
    const index = Math.floor(rng() * numbers.length);
    picked.push(numbers.splice(index, 1)[0]);
  }
  return picked;
}

export function settleKeno(picks, stake, rng = Math.random) {
  const sanitized = [...new Set((picks ?? []).map(Number).filter((value) => value >= 1 && value <= KENO_FIELD_SIZE))].slice(0, KENO_PICK_COUNT).sort((a, b) => a - b);
  const draw = uniqueDraw(createNumberPool(KENO_FIELD_SIZE), KENO_DRAW_COUNT, rng).sort((a, b) => a - b);
  const hits = sanitized.filter((value) => draw.includes(value));
  const profitMultiplier = KENO_PAYTABLE[hits.length] ?? 0;
  return {
    picks: sanitized,
    draw,
    hits,
    profitMultiplier,
    totalReturn: profitMultiplier > 0 ? totalReturnFromProfit(stake, profitMultiplier) : 0,
    outcome: profitMultiplier > 0 ? 'win' : 'lose',
  };
}

export function generateBingoCard(rng = Math.random) {
  const columns = [
    uniqueDraw(createNumberPool(15), 5, rng),
    uniqueDraw(Array.from({ length: 15 }, (_, index) => index + 16), 5, rng),
    uniqueDraw(Array.from({ length: 15 }, (_, index) => index + 31), 5, rng),
    uniqueDraw(Array.from({ length: 15 }, (_, index) => index + 46), 5, rng),
    uniqueDraw(Array.from({ length: 15 }, (_, index) => index + 61), 5, rng),
  ];
  columns[2][2] = 'FREE';
  return Array.from({ length: 5 }, (_, rowIndex) => Array.from({ length: 5 }, (_, columnIndex) => columns[columnIndex][rowIndex]));
}

export function bingoMarks(card, drawnNumbers) {
  const drawn = new Set(drawnNumbers);
  return card.map((row) => row.map((value) => value === 'FREE' || drawn.has(value)));
}

export function hasBingo(marks) {
  for (let index = 0; index < 5; index += 1) {
    if (marks[index].every(Boolean)) return true;
    if (marks.every((row) => row[index])) return true;
  }
  if (marks.every((row, index) => row[index])) return true;
  if (marks.every((row, index) => row[4 - index])) return true;
  return false;
}

export function startBingoRound(stake, rng = Math.random) {
  return {
    active: true,
    finished: false,
    stake,
    card: generateBingoCard(rng),
    drawnNumbers: [],
    calls: 0,
    totalReturn: 0,
    outcome: null,
    message: 'Draw balls until you hit bingo or the 30-call limit.',
  };
}

export function drawBingoBall(round, rng = Math.random) {
  if (!round || round.finished) return { ...round, ignored: true };
  const pool = createNumberPool(75).filter((value) => !round.drawnNumbers.includes(value));
  const [ball] = uniqueDraw(pool, 1, rng);
  const drawnNumbers = [...round.drawnNumbers, ball];
  const calls = round.calls + 1;
  const marks = bingoMarks(round.card, drawnNumbers);
  const bingo = hasBingo(marks);

  if (bingo) {
    const speed = calls <= 20 ? 'fast' : calls <= 26 ? 'standard' : 'late';
    const profitMultiplier = BINGO_PAYTABLE[speed];
    return {
      ...round,
      active: false,
      finished: true,
      drawnNumbers,
      calls,
      marks,
      outcome: 'win',
      profitMultiplier,
      totalReturn: totalReturnFromProfit(round.stake, profitMultiplier),
      message: `Bingo in ${calls} calls. ${speed === 'fast' ? 'Fast' : speed === 'standard' ? 'Standard' : 'Late'} payout applies.`,
    };
  }

  if (calls >= BINGO_MAX_CALLS) {
    return {
      ...round,
      active: false,
      finished: true,
      drawnNumbers,
      calls,
      marks,
      outcome: 'lose',
      profitMultiplier: 0,
      totalReturn: 0,
      message: 'No bingo before the 30-call limit.',
    };
  }

  return {
    ...round,
    drawnNumbers,
    calls,
    marks,
    message: `Ball ${ball} drawn. ${BINGO_MAX_CALLS - calls} calls remain.`,
  };
}

export function createScratchTicket(stake, rng = Math.random) {
  const symbols = Array.from({ length: 9 }, () => SCRATCH_SYMBOLS[Math.floor(rng() * SCRATCH_SYMBOLS.length)]);
  return {
    active: true,
    finished: false,
    claimed: false,
    stake,
    symbols,
    revealed: Array(9).fill(false),
    totalReturn: 0,
    outcome: null,
    message: 'Reveal all 9 panels. Highest triple wins.',
  };
}

export function revealScratchCell(ticket, index) {
  if (!ticket || ticket.finished) return { ...ticket, ignored: true };
  if (ticket.revealed[index]) return { ...ticket, ignored: true };
  const revealed = [...ticket.revealed];
  revealed[index] = true;
  const allRevealed = revealed.every(Boolean);
  if (!allRevealed) {
    return {
      ...ticket,
      revealed,
      message: `${revealed.filter(Boolean).length} of 9 panels revealed.`,
    };
  }
  return settleScratchTicket({ ...ticket, revealed });
}

export function settleScratchTicket(ticket) {
  if (!ticket || ticket.claimed) return { ...ticket, ignored: true };
  const counts = ticket.symbols.reduce((map, symbol) => map.set(symbol, (map.get(symbol) ?? 0) + 1), new Map());
  const winningSymbols = [...counts.entries()]
    .filter(([, count]) => count >= 3)
    .sort((a, b) => (SCRATCH_PAYTABLE[b[0]] ?? 0) - (SCRATCH_PAYTABLE[a[0]] ?? 0));
  const best = winningSymbols[0]?.[0] ?? null;
  const profitMultiplier = best ? SCRATCH_PAYTABLE[best] : 0;
  return {
    ...ticket,
    active: false,
    finished: true,
    claimed: true,
    profitMultiplier,
    outcome: profitMultiplier > 0 ? 'win' : 'lose',
    totalReturn: profitMultiplier > 0 ? totalReturnFromProfit(ticket.stake, profitMultiplier) : 0,
    message: best ? `Matched three ${best} symbols.` : 'No triple match on this ticket.',
  };
}

export function generateSportsEvent(kind = 'horse', rng = Math.random) {
  if (kind === 'sports') {
    const cities = ['Aurora', 'Cascade', 'Silver', 'Summit', 'Harbor', 'Radiant'];
    const mascots = ['Foxes', 'Comets', 'Owls', 'Jets', 'Blaze', 'Waves'];
    const home = `${cities[randomInt(rng, 0, cities.length - 1)]} ${mascots[randomInt(rng, 0, mascots.length - 1)]}`;
    let away = `${cities[randomInt(rng, 0, cities.length - 1)]} ${mascots[randomInt(rng, 0, mascots.length - 1)]}`;
    if (away === home) away = `${away} II`;
    const options = [
      { key: 'home', label: `${home} win`, weight: 0.45, profitMultiplier: 1.2 },
      { key: 'draw', label: 'Draw', weight: 0.2, profitMultiplier: 2.6 },
      { key: 'away', label: `${away} win`, weight: 0.35, profitMultiplier: 1.4 },
    ];
    return {
      id: `sports-${Date.now()}-${Math.floor(rng() * 100000)}`,
      kind,
      name: `${home} vs ${away}`,
      description: 'Fictional arena match. Winner market only.',
      options,
    };
  }

  const names = ['Starlight Run', 'Velvet Arrow', 'Lucky Current', 'Solar Drift', 'Marble Jet'];
  const weights = names.map(() => 0.15 + rng() * 0.25);
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  const options = names.map((name, index) => {
    const chance = weights[index] / totalWeight;
    const profitMultiplier = Math.max(1.5, Number((1 / chance - 1).toFixed(1)));
    return {
      key: `horse-${index}`,
      label: name,
      weight: chance,
      profitMultiplier,
    };
  });
  return {
    id: `horse-${Date.now()}-${Math.floor(rng() * 100000)}`,
    kind,
    name: 'Moonlight Derby',
    description: 'Fictional five-runner dash. Win market only.',
    options,
  };
}

export function settleSportsbookBet(event, optionKey, stake, rng = Math.random) {
  const totalWeight = event.options.reduce((sum, option) => sum + option.weight, 0);
  let threshold = rng() * totalWeight;
  let winningOption = event.options[event.options.length - 1];
  for (const option of event.options) {
    threshold -= option.weight;
    if (threshold <= 0) {
      winningOption = option;
      break;
    }
  }
  const selection = event.options.find((option) => option.key === optionKey) ?? event.options[0];
  const won = winningOption.key === selection.key;
  return {
    event,
    selection,
    winningOption,
    outcome: won ? 'win' : 'lose',
    profitMultiplier: won ? selection.profitMultiplier : 0,
    totalReturn: won ? totalReturnFromProfit(stake, selection.profitMultiplier) : 0,
    message: won ? `${selection.label} hits at x${selection.profitMultiplier}.` : `${winningOption.label} wins the event.`,
  };
}

export function createDefaultOwnerState() {
  return {
    established: false,
    ownerName: '',
    casinoName: '',
    funds: STARTING_CASINO_FUNDS,
    inventory: Object.fromEntries(Object.keys(GAME_INSTALLATIONS).map((key) => [key, 0])),
    staff: Object.fromEntries(Object.keys(STAFF_ROLES).map((key) => [key, 0])),
    upgrades: Object.fromEntries(Object.keys(CASINO_UPGRADES).map((key) => [key, false])),
    settings: {
      marketing: 1,
      hospitality: 1,
      maintenance: 1,
    },
    stats: {
      daysRun: 0,
      visitors: 0,
      revenue: 0,
      expenses: 0,
      profit: 0,
      lastDay: null,
    },
    level: 1,
  };
}

export const GAME_ROOMS = {
  slots: 'machines',
  scratch: 'machines',
  blackjack: 'cards',
  baccarat: 'cards',
  poker: 'cards',
  roulette: 'tables',
  dice: 'tables',
  craps: 'tables',
  keno: 'numbers',
  bingo: 'numbers',
  horse: 'sportsbook',
  sports: 'sportsbook',
};

export const CHALLENGE_SET_SIZE = 3;

// Goals reward exploring and learning each game. None depend on stake size,
// winning streaks, or long sessions: any 1-chip round counts.
// `track(event)` returns null (no progress), true (+1), or a key (distinct goals with `keys`).
export const CHALLENGE_POOL = {
  explorer: {
    title: 'Floor explorer',
    description: 'Finish a round in 3 different games.',
    target: 3,
    keys: Object.keys(GAME_ROOMS),
    track: (event) => event.gameKey,
  },
  roomHopper: {
    title: 'Room hopper',
    description: 'Play in 4 different rooms (Machines, Cards, Tables, Numbers, Sportsbook).',
    target: 4,
    keys: ['machines', 'cards', 'tables', 'numbers', 'sportsbook'],
    track: (event) => GAME_ROOMS[event.gameKey] ?? null,
  },
  blackjackFinish: {
    title: 'Card sharp',
    description: 'Complete a blackjack hand — any result counts.',
    target: 1,
    track: (event) => event.gameKey === 'blackjack' || null,
  },
  blackjackStand: {
    title: 'Hold your nerve',
    description: 'Stand in blackjack and watch the dealer play out their hand.',
    target: 1,
    track: (event) => (event.gameKey === 'blackjack' && event.detail?.stood) || null,
  },
  diceProfit: {
    title: 'Cash-out instinct',
    description: 'Bank a Risk Dice round with profit before busting.',
    target: 1,
    track: (event) => (event.gameKey === 'dice' && event.totalReturn > event.stake) || null,
  },
  pokerHold: {
    title: 'Keep the good ones',
    description: 'Draw in video poker while holding at least one card.',
    target: 1,
    track: (event) => (event.gameKey === 'poker' && event.detail?.held > 0) || null,
  },
  rouletteTypes: {
    title: 'Wheel scholar',
    description: 'Try 2 different roulette bet types.',
    target: 2,
    keys: Object.keys(ROULETTE_BETS),
    track: (event) => (event.gameKey === 'roulette' ? event.detail?.betType : null),
  },
  crapsSides: {
    title: 'Both sides of the rail',
    description: "Play a craps round on the pass line and one on don't pass.",
    target: 2,
    keys: ['pass', 'dont-pass'],
    track: (event) => (event.gameKey === 'craps' ? event.detail?.side : null),
  },
  baccaratSides: {
    title: 'Pick a side',
    description: 'Try 2 different baccarat bets (player, banker, or tie).',
    target: 2,
    keys: ['player', 'banker', 'tie'],
    track: (event) => (event.gameKey === 'baccarat' ? event.detail?.betOn : null),
  },
  numberCruncher: {
    title: 'Number cruncher',
    description: 'Finish a keno draw and a speed bingo card.',
    target: 2,
    keys: ['keno', 'bingo'],
    track: (event) => event.gameKey,
  },
  scratchAll: {
    title: 'Scratch it all',
    description: 'Reveal every panel on a scratch ticket.',
    target: 1,
    track: (event) => event.gameKey === 'scratch' || null,
  },
  sportsFan: {
    title: 'Fan of everything',
    description: 'Run a horse race and an arena match in the sportsbook.',
    target: 2,
    keys: ['horse', 'sports'],
    track: (event) => event.gameKey,
  },
  reelCurious: {
    title: 'Reel curious',
    description: 'Spin Crystal Slots twice.',
    target: 2,
    track: (event) => event.gameKey === 'slots' || null,
  },
};

export const STARTER_CHALLENGE_IDS = ['explorer', 'blackjackFinish', 'diceProfit'];

// Cosmetic only: themes never touch odds, paytables, or chip accounting.
export const COSMETIC_THEMES = {
  neon: { label: 'Neon Cascade', requires: 0 },
  sunset: { label: 'Sunset Strip', requires: 2 },
  aurora: { label: 'Aurora Lights', requires: 4 },
  synthwave: { label: 'Synthwave Grid', requires: 6 },
  gold: { label: 'Midnight Gold', requires: 9 },
};

export const DEFAULT_THEME = 'neon';

function createChallengeGoal(id) {
  return { id, progress: 0, done: false, seen: [] };
}

export function createDefaultChallengeState() {
  return {
    setNumber: 1,
    goals: STARTER_CHALLENGE_IDS.map(createChallengeGoal),
    lastRoundId: 0,
    completedTotal: 0,
    setsCompleted: 0,
  };
}

export function createDefaultCosmetics() {
  return { theme: DEFAULT_THEME, effects: true, sound: false };
}

export function sanitizeChallengeState(raw, roundsPlayed = Infinity) {
  const safe = createDefaultChallengeState();
  if (!raw || typeof raw !== 'object') return safe;

  const counter = (value) => clamp(normalizeWholeChips(value), 0, 100000);
  safe.completedTotal = counter(raw.completedTotal);
  safe.setsCompleted = counter(raw.setsCompleted);
  safe.setNumber = Math.max(1, counter(raw.setNumber));
  // Round ids come from stats.rounds, so a saved id can never be ahead of the round counter.
  safe.lastRoundId = Math.min(counter(raw.lastRoundId), Number.isFinite(roundsPlayed) ? normalizeWholeChips(roundsPlayed) : Infinity);

  const goals = [];
  if (Array.isArray(raw.goals)) {
    for (const entry of raw.goals) {
      if (!entry || typeof entry !== 'object') continue;
      const definition = CHALLENGE_POOL[entry.id];
      if (!definition || goals.some((goal) => goal.id === entry.id)) continue;
      const goal = createChallengeGoal(entry.id);
      if (definition.keys) {
        const seen = Array.isArray(entry.seen) ? entry.seen : [];
        goal.seen = [...new Set(seen.filter((key) => definition.keys.includes(key)))].slice(0, definition.target);
        goal.progress = goal.seen.length;
      } else {
        goal.progress = clamp(normalizeWholeChips(entry.progress), 0, definition.target);
      }
      goal.done = goal.progress >= definition.target;
      goals.push(goal);
      if (goals.length === CHALLENGE_SET_SIZE) break;
    }
  }
  if (goals.length === CHALLENGE_SET_SIZE) safe.goals = goals;
  safe.completedTotal = Math.max(safe.completedTotal, safe.goals.filter((goal) => goal.done).length);
  return safe;
}

export function isChallengeSetComplete(challenges) {
  return Boolean(challenges?.goals?.length) && challenges.goals.every((goal) => goal.done);
}

export function unlockedThemeIds(completedTotal) {
  return Object.entries(COSMETIC_THEMES)
    .filter(([, theme]) => theme.requires <= normalizeWholeChips(completedTotal))
    .map(([id]) => id);
}

export function isThemeUnlocked(themeId, completedTotal) {
  return Object.hasOwn(COSMETIC_THEMES, themeId) && unlockedThemeIds(completedTotal).includes(themeId);
}

export function sanitizeCosmetics(raw, completedTotal = 0) {
  const safe = createDefaultCosmetics();
  if (!raw || typeof raw !== 'object') return safe;
  if (isThemeUnlocked(raw.theme, completedTotal)) safe.theme = raw.theme;
  safe.effects = raw.effects !== false;
  safe.sound = raw.sound === true;
  return safe;
}

export function selectTheme(cosmetics, themeId, completedTotal) {
  const safe = sanitizeCosmetics(cosmetics, completedTotal);
  if (!Object.hasOwn(COSMETIC_THEMES, themeId)) return { ok: false, error: 'Unknown theme.', cosmetics: safe };
  if (!isThemeUnlocked(themeId, completedTotal)) {
    return { ok: false, error: `${COSMETIC_THEMES[themeId].label} is still locked.`, cosmetics: safe };
  }
  return { ok: true, cosmetics: { ...safe, theme: themeId } };
}

export function applyRoundToChallenges(rawChallenges, event) {
  const challenges = sanitizeChallengeState(rawChallenges);
  const roundId = Number(event?.roundId);
  const unchanged = { challenges, ignored: true, newlyCompleted: [], setCompleted: false, unlockedThemes: [] };
  // Each settled round has a unique, increasing id; replays and stale callbacks are ignored.
  if (!Number.isInteger(roundId) || roundId <= challenges.lastRoundId) return unchanged;

  const before = challenges.completedTotal;
  const wasComplete = isChallengeSetComplete(challenges);
  const newlyCompleted = [];
  challenges.lastRoundId = roundId;

  for (const goal of challenges.goals) {
    if (goal.done) continue;
    const definition = CHALLENGE_POOL[goal.id];
    const key = definition.track(event);
    if (key == null || key === false) continue;
    if (definition.keys) {
      if (!definition.keys.includes(key) || goal.seen.includes(key)) continue;
      goal.seen = [...goal.seen, key];
      goal.progress = goal.seen.length;
    } else {
      goal.progress = Math.min(definition.target, goal.progress + 1);
    }
    if (goal.progress >= definition.target) {
      goal.done = true;
      challenges.completedTotal += 1;
      newlyCompleted.push(goal.id);
    }
  }

  const setCompleted = !wasComplete && isChallengeSetComplete(challenges);
  if (setCompleted) challenges.setsCompleted += 1;
  const unlockedThemes = Object.entries(COSMETIC_THEMES)
    .filter(([, theme]) => theme.requires > before && theme.requires <= challenges.completedTotal)
    .map(([id]) => id);

  return { challenges, ignored: false, newlyCompleted, setCompleted, unlockedThemes };
}

export function startNewChallengeSet(rawChallenges, rng = Math.random) {
  const current = sanitizeChallengeState(rawChallenges);
  const currentIds = new Set(current.goals.map((goal) => goal.id));
  const fresh = Object.keys(CHALLENGE_POOL).filter((id) => !currentIds.has(id));
  const picked = uniqueDraw(fresh, CHALLENGE_SET_SIZE, rng);
  return {
    ...current,
    setNumber: current.setNumber + 1,
    goals: picked.map(createChallengeGoal),
  };
}

export const BIG_WIN_NET_MULTIPLIER = 5;

export function summarizeRound({ outcome, stake, totalReturn }) {
  const staked = normalizeWholeChips(stake);
  const returned = normalizeWholeChips(totalReturn);
  const net = returned - staked;
  // Result labels are net-based so a returned stake is never presented as a win.
  const kind = net > 0 ? 'win' : net < 0 ? 'loss' : 'even';
  const label =
    kind === 'win'
      ? `Win +${net}`
      : kind === 'loss'
        ? `Loss −${Math.abs(net)}`
        : outcome === 'push'
          ? 'Push ±0'
          : 'Stake back ±0';
  return {
    kind,
    net,
    staked,
    returned,
    label,
    big: kind === 'win' && net >= staked * BIG_WIN_NET_MULTIPLIER,
    detail: `Staked ${staked} · Returned ${returned} · Net ${net >= 0 ? '+' : '−'}${Math.abs(net)} chips`,
  };
}

export function createDefaultAppState() {
  return {
    playerChips: STARTING_PLAYER_CHIPS,
    stats: {
      rounds: 0,
      wins: 0,
      losses: 0,
      pushes: 0,
      totalStaked: 0,
      totalReturned: 0,
    },
    history: [],
    owner: createDefaultOwnerState(),
    challenges: createDefaultChallengeState(),
    cosmetics: createDefaultCosmetics(),
  };
}

export function determineCasinoLevel(owner) {
  return clamp(1 + Math.floor(owner.stats.daysRun / 3) + Math.floor(Math.max(0, owner.stats.profit) / 2500), 1, 5);
}

export function listUnlockedInstallations(owner) {
  return Object.entries(GAME_INSTALLATIONS)
    .filter(([, config]) => config.unlockLevel <= owner.level)
    .map(([key]) => key);
}

export function establishCasino(owner, ownerName, casinoName) {
  const safeOwner = sanitizeOwnerState(owner);
  const safeOwnerName = sanitizeName(ownerName, 24);
  const safeCasinoName = sanitizeName(casinoName, 32);
  if (!safeOwnerName || !safeCasinoName) {
    return { ok: false, error: 'Enter both an owner name and a casino name.' };
  }
  return {
    ok: true,
    owner: {
      ...safeOwner,
      established: true,
      ownerName: safeOwnerName,
      casinoName: safeCasinoName,
    },
  };
}

export function sanitizeOwnerState(rawOwner) {
  const safe = createDefaultOwnerState();
  if (!rawOwner || typeof rawOwner !== 'object') return safe;
  safe.established = Boolean(rawOwner.established);
  safe.ownerName = sanitizeName(rawOwner.ownerName, 24);
  safe.casinoName = sanitizeName(rawOwner.casinoName, 32);
  safe.funds = normalizeWholeChips(rawOwner.funds || STARTING_CASINO_FUNDS);
  for (const key of Object.keys(safe.inventory)) {
    safe.inventory[key] = clamp(normalizeWholeChips(rawOwner.inventory?.[key]), 0, 99);
  }
  for (const key of Object.keys(safe.staff)) {
    safe.staff[key] = clamp(normalizeWholeChips(rawOwner.staff?.[key]), 0, 99);
  }
  for (const key of Object.keys(safe.upgrades)) {
    safe.upgrades[key] = Boolean(rawOwner.upgrades?.[key]);
  }
  for (const key of Object.keys(safe.settings)) {
    safe.settings[key] = clamp(Number(rawOwner.settings?.[key] ?? safe.settings[key]), 0, 3);
  }
  for (const key of Object.keys(safe.stats)) {
    if (key === 'lastDay') continue;
    safe.stats[key] = normalizeWholeChips(rawOwner.stats?.[key]);
  }
  if (rawOwner.stats?.lastDay && typeof rawOwner.stats.lastDay === 'object') {
    safe.stats.lastDay = {
      visitors: normalizeWholeChips(rawOwner.stats.lastDay.visitors),
      revenue: normalizeWholeChips(rawOwner.stats.lastDay.revenue),
      expenses: normalizeWholeChips(rawOwner.stats.lastDay.expenses),
      profit: Math.round(Number(rawOwner.stats.lastDay.profit) || 0),
      note: sanitizeName(rawOwner.stats.lastDay.note, 80),
    };
  }
  safe.level = determineCasinoLevel({ ...safe, stats: safe.stats });
  return safe;
}

export function purchaseInstallation(owner, itemKey) {
  const safeOwner = sanitizeOwnerState(owner);
  const config = GAME_INSTALLATIONS[itemKey];
  if (!config) return { ok: false, error: 'Unknown installation.' };
  if (config.unlockLevel > safeOwner.level) return { ok: false, error: 'That installation is still locked.' };
  if (safeOwner.funds < config.cost) return { ok: false, error: 'Casino funds are too low for that purchase.' };
  return {
    ok: true,
    owner: {
      ...safeOwner,
      funds: safeOwner.funds - config.cost,
      inventory: {
        ...safeOwner.inventory,
        [itemKey]: safeOwner.inventory[itemKey] + 1,
      },
    },
  };
}

export function hireStaff(owner, roleKey) {
  const safeOwner = sanitizeOwnerState(owner);
  const config = STAFF_ROLES[roleKey];
  if (!config) return { ok: false, error: 'Unknown staff role.' };
  if (safeOwner.funds < config.hireCost) return { ok: false, error: 'Casino funds are too low to hire that role.' };
  return {
    ok: true,
    owner: {
      ...safeOwner,
      funds: safeOwner.funds - config.hireCost,
      staff: {
        ...safeOwner.staff,
        [roleKey]: safeOwner.staff[roleKey] + 1,
      },
    },
  };
}

export function buyUpgrade(owner, upgradeKey) {
  const safeOwner = sanitizeOwnerState(owner);
  const config = CASINO_UPGRADES[upgradeKey];
  if (!config) return { ok: false, error: 'Unknown upgrade.' };
  if (safeOwner.upgrades[upgradeKey]) return { ok: false, error: 'That upgrade is already installed.' };
  if (safeOwner.funds < config.cost) return { ok: false, error: 'Casino funds are too low for that upgrade.' };
  return {
    ok: true,
    owner: {
      ...safeOwner,
      funds: safeOwner.funds - config.cost,
      upgrades: {
        ...safeOwner.upgrades,
        [upgradeKey]: true,
      },
    },
  };
}

export function updateCasinoSetting(owner, key, value) {
  const safeOwner = sanitizeOwnerState(owner);
  if (!(key in safeOwner.settings)) return safeOwner;
  return {
    ...safeOwner,
    settings: {
      ...safeOwner.settings,
      [key]: clamp(Number(value), 0, 3),
    },
  };
}

export function transferPlayerToCasino(playerChips, owner, amount) {
  const chips = normalizeWholeChips(playerChips);
  const transfer = Number(amount);
  const safeOwner = sanitizeOwnerState(owner);
  if (!Number.isFinite(transfer) || !Number.isInteger(transfer) || transfer <= 0) {
    return { ok: false, error: 'Transfer must be a whole number of chips.' };
  }
  if (transfer > chips) return { ok: false, error: 'Player balance is too low for that transfer.' };
  return {
    ok: true,
    playerChips: chips - transfer,
    owner: { ...safeOwner, funds: safeOwner.funds + transfer },
  };
}

export function transferCasinoToPlayer(playerChips, owner, amount) {
  const safeOwner = sanitizeOwnerState(owner);
  const transfer = Number(amount);
  if (!Number.isFinite(transfer) || !Number.isInteger(transfer) || transfer <= 0) {
    return { ok: false, error: 'Transfer must be a whole number of chips.' };
  }
  if (transfer > safeOwner.funds) return { ok: false, error: 'Casino funds are too low for that transfer.' };
  return {
    ok: true,
    playerChips: normalizeWholeChips(playerChips) + transfer,
    owner: { ...safeOwner, funds: safeOwner.funds - transfer },
  };
}

export function runCasinoDay(owner, rng = Math.random) {
  const safeOwner = sanitizeOwnerState(owner);
  if (!safeOwner.established) return { ok: false, error: 'Establish your casino before running a day.' };

  const assetEntries = Object.entries(safeOwner.inventory);
  const installedCount = assetEntries.reduce((sum, [, count]) => sum + count, 0);
  if (installedCount === 0) return { ok: false, error: 'Install at least one game before opening for the day.' };

  const dealersNeeded = safeOwner.inventory.blackjackTable + safeOwner.inventory.rouletteWheel + safeOwner.inventory.baccaratSalon;
  const dealerCoverage = safeOwner.staff.dealer * STAFF_ROLES.dealer.coverage;
  const coveragePenalty = dealersNeeded === 0 ? 1 : clamp(0.6 + (dealerCoverage / Math.max(1, dealersNeeded)) * 0.4, 0.6, 1);

  const visitorBase = 20 + assetEntries.reduce((sum, [key, count]) => sum + GAME_INSTALLATIONS[key].visitors * count, 0);
  const staffVisitorBonus =
    safeOwner.staff.host * STAFF_ROLES.host.visitorBonus +
    safeOwner.staff.security * STAFF_ROLES.security.visitorBonus +
    safeOwner.staff.dealer * STAFF_ROLES.dealer.visitorBonus;
  const upgradeVisitorBonus = Object.entries(safeOwner.upgrades).reduce(
    (sum, [key, enabled]) => sum + (enabled ? CASINO_UPGRADES[key].visitorMultiplier : 0),
    0,
  );
  const revenueUpgradeBonus = Object.entries(safeOwner.upgrades).reduce(
    (sum, [key, enabled]) => sum + (enabled ? CASINO_UPGRADES[key].revenueMultiplier : 0),
    0,
  );

  const marketingFactor = 1 + safeOwner.settings.marketing * 0.12;
  const hospitalityFactor = 1 + safeOwner.settings.hospitality * 0.08;
  const maintenanceFactor = 0.88 + safeOwner.settings.maintenance * 0.05 + safeOwner.staff.technician * 0.02;
  const dayVariance = 0.92 + rng() * 0.16;

  const visitors = normalizeWholeChips(visitorBase * (1 + staffVisitorBonus + upgradeVisitorBonus) * marketingFactor * hospitalityFactor * maintenanceFactor * dayVariance);
  const baseRevenue = assetEntries.reduce((sum, [key, count]) => sum + GAME_INSTALLATIONS[key].dailyRevenue * count, 0);
  let revenue = normalizeWholeChips(baseRevenue * coveragePenalty * hospitalityFactor * (1 + revenueUpgradeBonus) * dayVariance + visitors * (1.2 + safeOwner.settings.marketing * 0.2));
  const assetUpkeep = assetEntries.reduce((sum, [key, count]) => sum + GAME_INSTALLATIONS[key].upkeep * count, 0);
  const wages = Object.entries(safeOwner.staff).reduce((sum, [key, count]) => sum + STAFF_ROLES[key].dailyWage * count, 0);
  const upgradeFees = Object.entries(safeOwner.upgrades).reduce((sum, [key, enabled]) => sum + (enabled ? CASINO_UPGRADES[key].dailyFee : 0), 0);
  let expenses = assetUpkeep + wages + safeOwner.settings.marketing * 45 + safeOwner.settings.maintenance * 35 + safeOwner.settings.hospitality * 25 + upgradeFees;
  let note = 'Smooth day.';

  if (safeOwner.settings.maintenance === 0 && installedCount >= 4 && rng() < 0.4) {
    const breakdownLoss = 140;
    revenue = Math.max(0, revenue - breakdownLoss);
    expenses += 30;
    note = 'Low maintenance caused an equipment slowdown.';
  } else if (safeOwner.settings.marketing === 3) {
    note = 'Heavy marketing boosted foot traffic.';
  } else if (coveragePenalty < 0.85) {
    note = 'Short staffing limited table performance.';
  }

  const profit = revenue - expenses;
  const nextOwner = {
    ...safeOwner,
    funds: Math.max(0, safeOwner.funds + profit),
    stats: {
      daysRun: safeOwner.stats.daysRun + 1,
      visitors: safeOwner.stats.visitors + visitors,
      revenue: safeOwner.stats.revenue + revenue,
      expenses: safeOwner.stats.expenses + expenses,
      profit: safeOwner.stats.profit + profit,
      lastDay: { visitors, revenue, expenses, profit, note },
    },
  };
  nextOwner.level = determineCasinoLevel(nextOwner);
  return { ok: true, owner: nextOwner, summary: nextOwner.stats.lastDay };
}

export function sanitizeHistory(rawHistory) {
  if (!Array.isArray(rawHistory)) return [];
  return rawHistory.slice(0, 20).map((entry) => ({
    game: sanitizeName(entry.game, 24) || 'Game',
    outcome: sanitizeName(entry.outcome, 12) || 'unknown',
    delta: Math.round(Number(entry.delta) || 0),
    text: sanitizeName(entry.text, 120),
  }));
}

export function sanitizeAppState(rawState) {
  const safe = createDefaultAppState();
  if (!rawState || typeof rawState !== 'object') return safe;
  safe.playerChips = normalizeWholeChips(rawState.playerChips ?? rawState.balance ?? STARTING_PLAYER_CHIPS);
  for (const key of Object.keys(safe.stats)) {
    safe.stats[key] = normalizeWholeChips(rawState.stats?.[key]);
  }
  safe.history = sanitizeHistory(rawState.history ?? rawState.recentResults);
  safe.owner = sanitizeOwnerState(rawState.owner);
  safe.challenges = sanitizeChallengeState(rawState.challenges, safe.stats.rounds);
  safe.cosmetics = sanitizeCosmetics(rawState.cosmetics, safe.challenges.completedTotal);
  return safe;
}

export function migrateLegacySave(rawLegacy) {
  const safe = createDefaultAppState();
  if (!rawLegacy || typeof rawLegacy !== 'object') return safe;
  safe.playerChips = normalizeWholeChips(rawLegacy.balance);
  safe.stats.rounds = normalizeWholeChips(rawLegacy.stats?.rounds);
  safe.stats.wins = normalizeWholeChips(rawLegacy.stats?.wins);
  safe.stats.losses = normalizeWholeChips(rawLegacy.stats?.losses);
  safe.stats.pushes = normalizeWholeChips(rawLegacy.stats?.pushes);
  safe.stats.totalStaked = normalizeWholeChips(rawLegacy.stats?.totalWagered);
  safe.stats.totalReturned = normalizeWholeChips(rawLegacy.stats?.totalReturned);
  safe.history = sanitizeHistory(rawLegacy.recentResults);
  return safe;
}

export function sanitizePersistedSnapshot(state) {
  const safe = sanitizeAppState(state);
  return {
    playerChips: safe.playerChips,
    stats: safe.stats,
    history: safe.history,
    owner: safe.owner,
    challenges: safe.challenges,
    cosmetics: safe.cosmetics,
  };
}

export function createPersistence(storage) {
  function safeStorage() {
    if (!storage) return null;
    try {
      const probe = '__casino_probe__';
      storage.setItem(probe, '1');
      storage.removeItem(probe);
      return storage;
    } catch {
      return null;
    }
  }

  return {
    load() {
      const store = safeStorage();
      if (!store) return { state: createDefaultAppState(), storageAvailable: false, migrated: false };
      try {
        const current = store.getItem(STORAGE_KEY);
        if (current) {
          const parsed = JSON.parse(current);
          if (parsed?.version === STORAGE_VERSION) {
            return { state: sanitizeAppState(parsed.state), storageAvailable: true, migrated: false };
          }
        }
        for (const key of LEGACY_STORAGE_KEYS) {
          const legacy = store.getItem(key);
          if (!legacy) continue;
          const parsedLegacy = JSON.parse(legacy);
          const migrated = parsedLegacy?.version === 1 ? migrateLegacySave(parsedLegacy.state) : migrateLegacySave(parsedLegacy);
          return { state: migrated, storageAvailable: true, migrated: true };
        }
        return { state: createDefaultAppState(), storageAvailable: true, migrated: false };
      } catch {
        return { state: createDefaultAppState(), storageAvailable: true, migrated: false };
      }
    },

    save(state) {
      const store = safeStorage();
      if (!store) return false;
      try {
        store.setItem(
          STORAGE_KEY,
          JSON.stringify({
            version: STORAGE_VERSION,
            state: sanitizePersistedSnapshot(state),
          }),
        );
        return true;
      } catch {
        return false;
      }
    },
  };
}

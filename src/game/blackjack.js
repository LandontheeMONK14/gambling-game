import { payoutFromProfit } from './wager.js';

export function drawCard(rng = Math.random) {
  return 1 + Math.floor(rng() * 13);
}

export function cardLabel(card) {
  if (card === 1) return 'A';
  if (card >= 11) return ['J', 'Q', 'K'][card - 11];
  return String(card);
}

function cardValue(card) {
  if (card === 1) return 11;
  if (card >= 10) return 10;
  return card;
}

export function scoreHand(cards) {
  let total = 0;
  let aces = 0;

  for (const card of cards) {
    total += cardValue(card);
    if (card === 1) aces += 1;
  }

  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }

  const isSoft = cards.includes(1) && total <= 21 && cards.reduce((sum, c) => sum + (c === 1 ? 1 : cardValue(c)), 0) + 10 <= 21;
  return { total, isSoft };
}

export function isNatural(cards) {
  return cards.length === 2 && scoreHand(cards).total === 21;
}

export function resolveNaturals(playerCards, dealerCards, stake) {
  const playerNatural = isNatural(playerCards);
  const dealerNatural = isNatural(dealerCards);

  if (!playerNatural && !dealerNatural) return { done: false };
  if (playerNatural && dealerNatural) {
    return { done: true, outcome: 'push', totalReturn: Math.round(stake), message: 'Both have blackjack. Push.' };
  }
  if (playerNatural) {
    return {
      done: true,
      outcome: 'win',
      totalReturn: payoutFromProfit(stake, 1.5),
      message: 'Blackjack! Natural 3:2 payout.',
      tags: ['blackjackNatural'],
    };
  }
  return { done: true, outcome: 'lose', totalReturn: 0, message: 'Dealer blackjack.' };
}

export function createBlackjackRound(stake, rng = Math.random) {
  const playerCards = [drawCard(rng), drawCard(rng)];
  const dealerCards = [drawCard(rng), drawCard(rng)];
  const naturalResolution = resolveNaturals(playerCards, dealerCards, stake);

  return {
    stake,
    playerCards,
    dealerCards,
    finished: naturalResolution.done,
    outcome: naturalResolution.done ? naturalResolution.outcome : null,
    totalReturn: naturalResolution.done ? naturalResolution.totalReturn : 0,
    message: naturalResolution.done ? naturalResolution.message : 'Hit or stand?',
    tags: naturalResolution.tags ?? [],
  };
}

export function blackjackHit(round, rng = Math.random) {
  if (!round || round.finished) return { ...round, ignored: true };

  const playerCards = [...round.playerCards, drawCard(rng)];
  const playerScore = scoreHand(playerCards).total;

  if (playerScore > 21) {
    return {
      ...round,
      playerCards,
      finished: true,
      outcome: 'lose',
      totalReturn: 0,
      message: 'Bust! Dealer wins.',
    };
  }

  return {
    ...round,
    playerCards,
    message: 'Hit or stand?',
  };
}

export function dealerPlay(dealerCards, rng = Math.random) {
  const cards = [...dealerCards];
  while (scoreHand(cards).total < 17) {
    cards.push(drawCard(rng));
  }
  return cards;
}

export function settleBlackjack(playerCards, dealerCards, stake) {
  const playerTotal = scoreHand(playerCards).total;
  const dealerTotal = scoreHand(dealerCards).total;

  if (dealerTotal > 21 || playerTotal > dealerTotal) {
    return { outcome: 'win', totalReturn: payoutFromProfit(stake, 1), message: 'You win!' };
  }
  if (dealerTotal > playerTotal) {
    return { outcome: 'lose', totalReturn: 0, message: 'Dealer wins.' };
  }
  return { outcome: 'push', totalReturn: Math.round(stake), message: 'Push.' };
}

export function blackjackStand(round, rng = Math.random) {
  if (!round || round.finished) return { ...round, ignored: true };

  const dealerCards = dealerPlay(round.dealerCards, rng);
  const settled = settleBlackjack(round.playerCards, dealerCards, round.stake);

  return {
    ...round,
    dealerCards,
    finished: true,
    outcome: settled.outcome,
    totalReturn: settled.totalReturn,
    message: settled.message,
  };
}

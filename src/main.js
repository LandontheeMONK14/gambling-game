import './styles.css';
import { applyPayout, placeWager } from './game/wager.js';
import { SLOT_PAYTABLE, SLOT_SYMBOLS, evaluateSlots, spinReels } from './game/slots.js';
import {
  blackjackHit,
  blackjackStand,
  cardLabel,
  createBlackjackRound,
  scoreHand,
} from './game/blackjack.js';
import { DICE_PROFIT_STEPS, bankDice, rollDice, startDiceRound, bustThreshold } from './game/dice.js';
import { STARTING_CHIPS, browserPersistence, DEFAULT_PERSISTED_STATE } from './game/persistence.js';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const state = {
  ...structuredClone(DEFAULT_PERSISTED_STATE),
  ...browserPersistence.load(),
  currentGame: 'slots',
  slotsRound: null,
  blackjackRound: null,
  diceRound: null,
};

const els = {
  balance: document.querySelector('#chip-balance'),
  wagerInput: document.querySelector('#wager-input'),
  refillBtn: document.querySelector('#refill-btn'),
  gameCards: [...document.querySelectorAll('.game-card')],
  panels: [...document.querySelectorAll('.game-panel')],
  globalStatus: document.querySelector('#global-status'),
  statsSummary: document.querySelector('#stats-summary'),
  achievements: document.querySelector('#achievements'),
  recentRounds: document.querySelector('#recent-rounds'),

  slotReels: document.querySelector('#slot-reels'),
  slotsStatus: document.querySelector('#slots-status'),
  slotsSpin: document.querySelector('#slots-spin'),
  slotsSkip: document.querySelector('#slots-skip'),
  slotsPaytable: document.querySelector('#slots-paytable'),

  dealerHand: document.querySelector('#dealer-hand'),
  playerHand: document.querySelector('#player-hand'),
  dealerScore: document.querySelector('#dealer-score'),
  playerScore: document.querySelector('#player-score'),
  blackjackStatus: document.querySelector('#blackjack-status'),
  blackjackDeal: document.querySelector('#blackjack-deal'),
  blackjackHit: document.querySelector('#blackjack-hit'),
  blackjackStand: document.querySelector('#blackjack-stand'),

  diceRound: document.querySelector('#dice-round'),
  diceStatus: document.querySelector('#dice-status'),
  diceStart: document.querySelector('#dice-start'),
  diceRoll: document.querySelector('#dice-roll'),
  diceBank: document.querySelector('#dice-bank'),
  dicePaytable: document.querySelector('#dice-paytable'),
};

function persist() {
  browserPersistence.save(state);
}

function announce(text) {
  els.globalStatus.textContent = text;
}

function registerRound({ game, outcome, stake, totalReturn, text, tags = [] }) {
  const delta = Math.round(totalReturn - stake);

  state.stats.rounds += 1;
  state.stats.totalWagered += stake;
  state.stats.totalReturned += Math.round(totalReturn);
  if (outcome === 'win') state.stats.wins += 1;
  else if (outcome === 'lose') state.stats.losses += 1;
  else state.stats.pushes += 1;

  if (outcome === 'win') {
    state.achievements.firstWin = true;
    if (delta >= 200) state.achievements.slotMaster = true;
    document.body.classList.add('celebrate');
    setTimeout(() => document.body.classList.remove('celebrate'), 500);
  }
  if (tags.includes('blackjackNatural')) state.achievements.blackjackNatural = true;
  if (tags.includes('diceDaredevil')) state.achievements.diceDaredevil = true;

  state.recentResults.unshift({ game, outcome, delta, text });
  state.recentResults = state.recentResults.slice(0, 10);

  persist();
  renderHud();
}

function renderHud() {
  els.balance.textContent = state.balance.toLocaleString();
  const { rounds, wins, losses, pushes } = state.stats;
  els.statsSummary.textContent =
    rounds === 0
      ? 'No rounds yet.'
      : `${rounds} rounds • ${wins} wins • ${losses} losses • ${pushes} pushes`;

  const items = [
    ['firstWin', '🏁 First Win'],
    ['slotMaster', '✨ Big Win (+200 chips)'],
    ['blackjackNatural', '🃏 Natural Blackjack'],
    ['diceDaredevil', '🎲 Dice Daredevil (bank after 3+ safe rolls)'],
  ];
  els.achievements.innerHTML = items
    .map(([key, label]) => `<li>${state.achievements[key] ? '✅' : '⬜'} ${label}</li>`)
    .join('');

  els.recentRounds.innerHTML = state.recentResults.length
    ? state.recentResults
        .map((entry) => `<li><strong>${entry.game}</strong> ${entry.text} (${entry.delta >= 0 ? '+' : ''}${entry.delta})</li>`)
        .join('')
    : '<li>No recent rounds.</li>';
}

function setGame(game) {
  state.currentGame = game;
  for (const card of els.gameCards) card.classList.toggle('active', card.dataset.game === game);
  for (const panel of els.panels) panel.hidden = panel.id !== game;
  announce(`${game} selected.`);
}

function tryStake() {
  const result = placeWager(state.balance, Number(els.wagerInput.value));
  if (!result.ok) {
    announce(result.error);
    return null;
  }
  state.balance = result.balance;
  persist();
  renderHud();
  return result.wager;
}

function refund(stake) {
  state.balance = applyPayout(state.balance, stake);
  persist();
  renderHud();
}

function renderSlotsPaytable() {
  els.slotsPaytable.innerHTML = Object.entries(SLOT_PAYTABLE)
    .map(([combo, mult]) => `<tr><td>${combo}</td><td>x${mult.toFixed(1)}</td></tr>`)
    .join('');
}

function updateSlotsReels(symbols, spinning = false) {
  els.slotReels.classList.toggle('spinning', spinning && !prefersReducedMotion);
  els.slotReels.innerHTML = symbols.map((symbol) => `<div class="reel">${symbol}</div>`).join('');
}

function spinSlots() {
  if (state.slotsRound?.spinning) return;

  const stake = tryStake();
  if (!stake) return;

  const symbols = spinReels();
  state.slotsRound = { spinning: true, stake, symbols };
  els.slotsSpin.disabled = true;
  els.slotsSkip.hidden = prefersReducedMotion;
  els.slotsStatus.textContent = 'Spinning...';

  const settle = () => {
    if (!state.slotsRound?.spinning) return;
    const round = state.slotsRound;
    const result = evaluateSlots(round.symbols, round.stake);
    updateSlotsReels(result.symbols, false);

    state.slotsRound = null;
    els.slotsSpin.disabled = false;
    els.slotsSkip.hidden = true;

    if (result.totalReturn > 0) {
      state.balance = applyPayout(state.balance, result.totalReturn);
      const text = `${result.symbols.join(' ')} pays x${result.profitMultiplier}.`;
      els.slotsStatus.textContent = `Win! ${text}`;
      registerRound({
        game: 'Slots',
        outcome: 'win',
        stake: round.stake,
        totalReturn: result.totalReturn,
        text,
      });
      announce(`Slots win. ${text}`);
    } else {
      const text = `${result.symbols.join(' ')} no payout.`;
      els.slotsStatus.textContent = `No win. ${text}`;
      registerRound({ game: 'Slots', outcome: 'lose', stake: round.stake, totalReturn: 0, text });
      announce('Slots loss.');
    }
  };

  updateSlotsReels(['❔', '❔', '❔'], true);

  if (prefersReducedMotion) {
    settle();
    return;
  }

  state.slotsRound.timer = setTimeout(settle, 1200);
}

function skipSlotsAnimation() {
  if (!state.slotsRound?.spinning) return;
  clearTimeout(state.slotsRound.timer);
  state.slotsRound.timer = null;
  const round = state.slotsRound;
  const result = evaluateSlots(round.symbols, round.stake);

  state.slotsRound = null;
  els.slotsSpin.disabled = false;
  els.slotsSkip.hidden = true;
  updateSlotsReels(result.symbols, false);

  if (result.totalReturn > 0) {
    state.balance = applyPayout(state.balance, result.totalReturn);
    const text = `${result.symbols.join(' ')} pays x${result.profitMultiplier}.`;
    els.slotsStatus.textContent = `Win! ${text}`;
    registerRound({ game: 'Slots', outcome: 'win', stake: round.stake, totalReturn: result.totalReturn, text });
  } else {
    const text = `${result.symbols.join(' ')} no payout.`;
    els.slotsStatus.textContent = `No win. ${text}`;
    registerRound({ game: 'Slots', outcome: 'lose', stake: round.stake, totalReturn: 0, text });
  }
}

function handText(cards, hideSecond = false) {
  if (!cards) return '—';
  return cards
    .map((card, index) => {
      if (hideSecond && index === 1) return '🂠';
      return cardLabel(card);
    })
    .join(' ');
}

function renderBlackjack() {
  const round = state.blackjackRound;
  if (!round) {
    els.playerHand.textContent = '—';
    els.dealerHand.textContent = '—';
    els.playerScore.textContent = '';
    els.dealerScore.textContent = '';
    els.blackjackHit.disabled = true;
    els.blackjackStand.disabled = true;
    return;
  }

  const revealDealer = round.finished;
  els.playerHand.textContent = handText(round.playerCards, false);
  els.dealerHand.textContent = handText(round.dealerCards, !revealDealer);
  els.playerScore.textContent = `Score: ${scoreHand(round.playerCards).total}`;
  els.dealerScore.textContent = revealDealer ? `Score: ${scoreHand(round.dealerCards).total}` : 'Score: ?';

  els.blackjackHit.disabled = round.finished;
  els.blackjackStand.disabled = round.finished;
}

function settleBlackjackRound(round) {
  if (!round.finished) return;
  if (round.totalReturn > 0) {
    state.balance = applyPayout(state.balance, round.totalReturn);
  }
  const text = `${round.message} (${handText(round.playerCards)} vs ${handText(round.dealerCards)})`;
  els.blackjackStatus.textContent = round.message;
  registerRound({
    game: 'Blackjack',
    outcome: round.outcome,
    stake: round.stake,
    totalReturn: round.totalReturn,
    text,
    tags: round.tags,
  });
  renderBlackjack();
}

function blackjackDeal() {
  if (state.blackjackRound && !state.blackjackRound.finished) return;
  const stake = tryStake();
  if (!stake) return;

  state.blackjackRound = createBlackjackRound(stake);
  renderBlackjack();
  els.blackjackStatus.textContent = state.blackjackRound.message;

  if (state.blackjackRound.finished) {
    settleBlackjackRound(state.blackjackRound);
  }
}

function blackjackHitAction() {
  const round = state.blackjackRound;
  if (!round || round.finished) return;
  state.blackjackRound = blackjackHit(round);
  renderBlackjack();
  els.blackjackStatus.textContent = state.blackjackRound.message;
  if (state.blackjackRound.finished) settleBlackjackRound(state.blackjackRound);
}

function blackjackStandAction() {
  const round = state.blackjackRound;
  if (!round || round.finished) return;
  state.blackjackRound = blackjackStand(round);
  renderBlackjack();
  els.blackjackStatus.textContent = state.blackjackRound.message;
  settleBlackjackRound(state.blackjackRound);
}

function renderDicePaytable() {
  els.dicePaytable.innerHTML = DICE_PROFIT_STEPS.map((mult, index) => {
    const threshold = bustThreshold(index);
    return `<tr><td>${index + 1}</td><td>Bust at ≤${threshold}</td><td>x${mult.toFixed(1)}</td></tr>`;
  }).join('');
}

function renderDice() {
  const round = state.diceRound;
  els.diceRoll.disabled = !round?.active;
  els.diceBank.disabled = !round?.active;
  els.diceStart.disabled = Boolean(round?.active);

  if (!round) {
    els.diceRound.textContent = 'Start a round to push your luck.';
    return;
  }

  els.diceRound.textContent = `Stake ${round.stake} • Safe rolls ${round.rollCount} • Profit x${round.profitMultiplier.toFixed(1)}`;
}

function finishDice(round) {
  if (!round || round.outcome == null) return;
  if (round.totalReturn > 0) state.balance = applyPayout(state.balance, round.totalReturn);

  const tags = [];
  if (round.outcome === 'win' && round.rollCount >= 3) tags.push('diceDaredevil');
  registerRound({
    game: 'Risk Dice',
    outcome: round.outcome,
    stake: round.stake,
    totalReturn: round.totalReturn,
    text: round.message,
    tags,
  });

  els.diceStatus.textContent = round.message;
  state.diceRound = null;
  renderDice();
}

function diceStartRound() {
  if (state.diceRound?.active) return;
  const stake = tryStake();
  if (!stake) return;
  state.diceRound = startDiceRound(stake);
  els.diceStatus.textContent = 'Roll or bank your current profit.';
  renderDice();
}

function diceRollAction() {
  if (!state.diceRound?.active) return;
  state.diceRound = rollDice(state.diceRound);
  renderDice();
  if (!state.diceRound.active) finishDice(state.diceRound);
}

function diceBankAction() {
  if (!state.diceRound?.active) return;
  state.diceRound = bankDice(state.diceRound);
  renderDice();
  finishDice(state.diceRound);
}

function cancelActiveRounds() {
  if (state.slotsRound?.spinning) {
    clearTimeout(state.slotsRound.timer);
    refund(state.slotsRound.stake);
    state.slotsRound = null;
    els.slotsStatus.textContent = 'Round canceled and stake refunded.';
  }
  if (state.blackjackRound && !state.blackjackRound.finished) {
    refund(state.blackjackRound.stake);
    state.blackjackRound = null;
    els.blackjackStatus.textContent = 'Round canceled and stake refunded.';
    renderBlackjack();
  }
  if (state.diceRound?.active) {
    refund(state.diceRound.stake);
    state.diceRound = null;
    els.diceStatus.textContent = 'Round canceled and stake refunded.';
    renderDice();
  }
}

function freeRefill() {
  cancelActiveRounds();
  state.balance = STARTING_CHIPS;
  persist();
  renderHud();
  announce('Chips reset to free starting balance.');
}

for (const card of els.gameCards) {
  card.addEventListener('click', () => setGame(card.dataset.game));
}
els.refillBtn.addEventListener('click', freeRefill);
els.slotsSpin.addEventListener('click', spinSlots);
els.slotsSkip.addEventListener('click', skipSlotsAnimation);
els.blackjackDeal.addEventListener('click', blackjackDeal);
els.blackjackHit.addEventListener('click', blackjackHitAction);
els.blackjackStand.addEventListener('click', blackjackStandAction);
els.diceStart.addEventListener('click', diceStartRound);
els.diceRoll.addEventListener('click', diceRollAction);
els.diceBank.addEventListener('click', diceBankAction);

renderSlotsPaytable();
renderDicePaytable();
renderHud();
renderBlackjack();
renderDice();
updateSlotsReels(['⭐', '⭐', '⭐']);
announce('Welcome to Neon Lucky Arcade. Free virtual chips only.');

const Engine = window.CasinoEngine;
const prefersReducedMotion = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function getBrowserStorage() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
const persistence = Engine.createPersistence(getBrowserStorage());
const loaded = persistence.load();

const state = {
  ...Engine.sanitizeAppState(loaded.state),
  ui: {
    currentGame: 'slots',
    storageAvailable: loaded.storageAvailable,
    migrated: loaded.migrated,
    slotsRound: null,
    blackjackRound: null,
    blackjackShoe: Engine.createShoe(4),
    baccaratShoe: Engine.createShoe(6),
    diceRound: null,
    crapsRound: null,
    pokerRound: null,
    pokerHold: new Set(),
    kenoPicks: [],
    bingoRound: null,
    scratchTicket: null,
    sportsbookEvent: Engine.generateSportsEvent('horse'),
    sportsbookBet: null,
  },
};

const els = {
  navButtons: [...document.querySelectorAll('.nav-btn')],
  panels: {
    slots: document.querySelector('#panel-slots'),
    blackjack: document.querySelector('#panel-blackjack'),
    roulette: document.querySelector('#panel-roulette'),
    keno: document.querySelector('#panel-keno'),
    sportsbook: document.querySelector('#panel-sportsbook'),
    owner: document.querySelector('#panel-owner'),
  },
  playerBalance: document.querySelector('#player-balance'),
  casinoFunds: document.querySelector('#casino-funds'),
  stakeInput: document.querySelector('#stake-input'),
  saveStatus: document.querySelector('#save-status'),
  refillPlayer: document.querySelector('#refill-player'),
  resetProgress: document.querySelector('#reset-progress'),
  downloadHtml: document.querySelector('#download-html'),
  statsSummary: document.querySelector('#stats-summary'),
  statsBreakdown: document.querySelector('#stats-breakdown'),
  historyList: document.querySelector('#history-list'),
  globalStatus: document.querySelector('#global-status'),

  slotReels: document.querySelector('#slot-reels'),
  slotsSpin: document.querySelector('#slots-spin'),
  slotsSkip: document.querySelector('#slots-skip'),
  slotsPaytable: document.querySelector('#slots-paytable'),
  slotsStatus: document.querySelector('#slots-status'),

  scratchBuy: document.querySelector('#scratch-buy'),
  scratchGrid: document.querySelector('#scratch-grid'),
  scratchPaytable: document.querySelector('#scratch-paytable'),
  scratchStatus: document.querySelector('#scratch-status'),

  blackjackDealer: document.querySelector('#blackjack-dealer'),
  blackjackDealerScore: document.querySelector('#blackjack-dealer-score'),
  blackjackPlayer: document.querySelector('#blackjack-player'),
  blackjackPlayerScore: document.querySelector('#blackjack-player-score'),
  blackjackDeal: document.querySelector('#blackjack-deal'),
  blackjackHit: document.querySelector('#blackjack-hit'),
  blackjackStand: document.querySelector('#blackjack-stand'),
  blackjackStatus: document.querySelector('#blackjack-status'),

  baccaratButtons: [...document.querySelectorAll('.baccarat-bet')],
  baccaratPlayer: document.querySelector('#baccarat-player'),
  baccaratPlayerScore: document.querySelector('#baccarat-player-score'),
  baccaratBanker: document.querySelector('#baccarat-banker'),
  baccaratBankerScore: document.querySelector('#baccarat-banker-score'),
  baccaratStatus: document.querySelector('#baccarat-status'),

  pokerCards: document.querySelector('#poker-cards'),
  pokerHolds: document.querySelector('#poker-holds'),
  pokerDeal: document.querySelector('#poker-deal'),
  pokerDraw: document.querySelector('#poker-draw'),
  pokerPaytable: document.querySelector('#poker-paytable'),
  pokerStatus: document.querySelector('#poker-status'),

  rouletteType: document.querySelector('#roulette-type'),
  rouletteValue: document.querySelector('#roulette-value'),
  rouletteSpin: document.querySelector('#roulette-spin'),
  rouletteResult: document.querySelector('#roulette-result'),
  rouletteStatus: document.querySelector('#roulette-status'),

  diceFace: document.querySelector('#dice-face'),
  diceStart: document.querySelector('#dice-start'),
  diceRoll: document.querySelector('#dice-roll'),
  diceBank: document.querySelector('#dice-bank'),
  dicePaytable: document.querySelector('#dice-paytable'),
  diceStatus: document.querySelector('#dice-status'),

  crapsButtons: [...document.querySelectorAll('.craps-start')],
  crapsRoll: document.querySelector('#craps-roll'),
  crapsDice: document.querySelector('#craps-dice'),
  crapsStatus: document.querySelector('#craps-status'),

  kenoGrid: document.querySelector('#keno-grid'),
  kenoDraw: document.querySelector('#keno-draw'),
  kenoClear: document.querySelector('#keno-clear'),
  kenoStatus: document.querySelector('#keno-status'),
  kenoResults: document.querySelector('#keno-results'),

  bingoCard: document.querySelector('#bingo-card'),
  bingoBuy: document.querySelector('#bingo-buy'),
  bingoDraw: document.querySelector('#bingo-draw'),
  bingoCalled: document.querySelector('#bingo-called'),
  bingoStatus: document.querySelector('#bingo-status'),

  sportsbookKind: document.querySelector('#sportsbook-kind'),
  sportsbookSelection: document.querySelector('#sportsbook-selection'),
  sportsbookTitle: document.querySelector('#sportsbook-title'),
  sportsbookDescription: document.querySelector('#sportsbook-description'),
  sportsbookOptions: document.querySelector('#sportsbook-options'),
  sportsbookNew: document.querySelector('#sportsbook-new'),
  sportsbookBet: document.querySelector('#sportsbook-bet'),
  sportsbookRun: document.querySelector('#sportsbook-run'),
  sportsbookStatus: document.querySelector('#sportsbook-status'),

  ownerName: document.querySelector('#owner-name'),
  casinoName: document.querySelector('#casino-name'),
  ownerEstablish: document.querySelector('#owner-establish'),
  transferAmount: document.querySelector('#transfer-amount'),
  transferToCasino: document.querySelector('#transfer-to-casino'),
  transferToPlayer: document.querySelector('#transfer-to-player'),
  ownerSummaryName: document.querySelector('#owner-summary-name'),
  ownerLastDay: document.querySelector('#owner-last-day'),
  ownerInstallations: document.querySelector('#owner-installations'),
  ownerStaff: document.querySelector('#owner-staff'),
  ownerUpgrades: document.querySelector('#owner-upgrades'),
  ownerMetrics: document.querySelector('#owner-metrics'),
  ownerRunDay: document.querySelector('#owner-run-day'),
  ownerStatus: document.querySelector('#owner-status'),
  ownerSettingMarketing: document.querySelector('#setting-marketing'),
  ownerSettingHospitality: document.querySelector('#setting-hospitality'),
  ownerSettingMaintenance: document.querySelector('#setting-maintenance'),
};

function announce(message) {
  els.globalStatus.textContent = message;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function persist() {
  const ok = persistence.save({
    playerChips: state.playerChips,
    stats: state.stats,
    history: state.history,
    owner: state.owner,
  });
  renderSaveStatus(ok);
}

function renderSaveStatus(saved = true) {
  if (!state.ui.storageAvailable) {
    els.saveStatus.textContent = 'Browser storage is unavailable. Progress will stay in memory for this session only.';
    return;
  }
  if (state.ui.migrated) {
    els.saveStatus.textContent = 'Legacy arcade progress was migrated into this save.';
    state.ui.migrated = false;
    return;
  }
  els.saveStatus.textContent = saved
    ? 'Progress saves locally in this browser. Downloaded copies start fresh unless that browser/location already has a save.'
    : 'Local save failed, but play continues in memory.';
}

function deltaText(totalReturn, stake) {
  const delta = Math.round(totalReturn - stake);
  return `${delta >= 0 ? '+' : ''}${delta}`;
}

function recordRound({ game, outcome, stake, totalReturn, text }) {
  state.stats.rounds += 1;
  state.stats.totalStaked += stake;
  state.stats.totalReturned += Math.round(totalReturn);
  if (outcome === 'win') state.stats.wins += 1;
  else if (outcome === 'push') state.stats.pushes += 1;
  else state.stats.losses += 1;

  state.history.unshift({
    game,
    outcome,
    delta: Math.round(totalReturn - stake),
    text,
  });
  state.history = Engine.sanitizeHistory(state.history);
  persist();
  renderSidebar();
}

function setStatus(element, message, type = '') {
  element.textContent = message;
  element.classList.toggle('good', type === 'good');
  element.classList.toggle('bad', type === 'bad');
}

function applyPlayerReturn(totalReturn) {
  state.playerChips = Engine.applyReturn(state.playerChips, totalReturn);
}

function tryStake() {
  const placed = Engine.placeStake(state.playerChips, Number(els.stakeInput.value));
  if (!placed.ok) {
    announce(placed.error);
    return null;
  }
  state.playerChips = placed.balance;
  persist();
  renderHud();
  return placed.stake;
}

function refundStake(stake) {
  state.playerChips = Engine.applyReturn(state.playerChips, stake);
  persist();
  renderHud();
}

function resetUiRounds() {
  if (state.ui.slotsRound?.timer) window.clearTimeout(state.ui.slotsRound.timer);
  state.ui.slotsRound = null;
  state.ui.blackjackRound = null;
  state.ui.diceRound = null;
  state.ui.crapsRound = null;
  state.ui.pokerRound = null;
  state.ui.pokerHold = new Set();
  state.ui.bingoRound = null;
  state.ui.scratchTicket = null;
  state.ui.sportsbookBet = null;
}

function cancelActiveRounds() {
  if (state.ui.slotsRound?.stake) refundStake(state.ui.slotsRound.stake);
  if (state.ui.blackjackRound?.active) refundStake(state.ui.blackjackRound.stake);
  if (state.ui.diceRound?.active) refundStake(state.ui.diceRound.stake);
  if (state.ui.crapsRound?.active) refundStake(state.ui.crapsRound.stake);
  if (state.ui.pokerRound?.active) refundStake(state.ui.pokerRound.stake);
  if (state.ui.bingoRound?.active) refundStake(state.ui.bingoRound.stake);
  if (state.ui.scratchTicket?.active) refundStake(state.ui.scratchTicket.stake);
  if (state.ui.sportsbookBet?.stake) refundStake(state.ui.sportsbookBet.stake);
  resetUiRounds();
}

function freeRefill() {
  cancelActiveRounds();
  state.playerChips = Engine.STARTING_PLAYER_CHIPS;
  persist();
  renderEverything();
  announce('Player chips reset to the free starting balance.');
}

function resetAllProgress() {
  cancelActiveRounds();
  const fresh = Engine.createDefaultAppState();
  state.playerChips = fresh.playerChips;
  state.stats = fresh.stats;
  state.history = fresh.history;
  state.owner = fresh.owner;
  state.ui.blackjackShoe = Engine.createShoe(4);
  state.ui.baccaratShoe = Engine.createShoe(6);
  state.ui.sportsbookEvent = Engine.generateSportsEvent('horse');
  persist();
  renderEverything();
  setStatus(els.ownerStatus, 'All play-money progress reset. Fresh start ready.', 'good');
  announce('All progress reset.');
}

const SCRIPT_CLOSE_TAG = '<' + '/script>';

function escapeInlineScript(source) {
  return source.replace(/<\/(script)/gi, '<\\/$1').replace(/<!--/g, '<\\!--');
}

function buildStandaloneHtmlDocument() {
  const bootstrap = [
    `window.__CASINO_HEAD_HTML__ = ${JSON.stringify(window.__CASINO_HEAD_HTML__)};`,
    `window.__CASINO_BODY_HTML__ = ${JSON.stringify(window.__CASINO_BODY_HTML__)};`,
    `window.__CASINO_STYLES__ = ${JSON.stringify(window.__CASINO_STYLES__)};`,
    `window.__CASINO_RUNTIME_SOURCE__ = ${JSON.stringify(window.__CASINO_RUNTIME_SOURCE__)};`,
    window.__CASINO_RUNTIME_SOURCE__,
  ].join('\n');

  return `<!doctype html>\n<html lang="en">\n  <head>\n${window.__CASINO_HEAD_HTML__}\n    <style>\n${window.__CASINO_STYLES__}\n    </style>\n  </head>\n  <body>\n${window.__CASINO_BODY_HTML__}\n    <script>\n${escapeInlineScript(bootstrap)}\n    ${SCRIPT_CLOSE_TAG}\n  </body>\n</html>\n`;
}

function downloadStandaloneHtml() {
  const blob = new Blob([buildStandaloneHtmlDocument()], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'casino.html';
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  announce('Standalone HTML downloaded.');
}

function setCurrentGame(game) {
  state.ui.currentGame = game;
  for (const [key, panel] of Object.entries(els.panels)) panel.hidden = key !== game;
  for (const button of els.navButtons) button.classList.toggle('active', button.dataset.game === game);
  announce(`${game} view selected.`);
}

function suitSvg(suit) {
  if (suit === 'hearts') return '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 21s-7-4.6-9.5-9C.5 8.9 2.2 5 5.9 5c2 0 3.5 1.1 4.1 2.6C10.6 6.1 12.1 5 14.1 5 17.8 5 19.5 8.9 21.5 12c-2.5 4.4-9.5 9-9.5 9Z"/></svg>';
  if (suit === 'diamonds') return '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2 21 12 12 22 3 12 12 2Z"/></svg>';
  if (suit === 'clubs') return '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3a4 4 0 0 1 3.5 5.9A4 4 0 1 1 17 16h-3v5h-4v-5H7a4 4 0 1 1 1.5-7.1A4 4 0 0 1 12 3Z"/></svg>';
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2c2.8 3.4 8 7.4 8 11.6A4 4 0 0 1 12 16a4 4 0 0 1-8-2.4C4 9.4 9.2 5.4 12 2Zm-2 14h4l1 5H9l1-5Z"/></svg>';
}

function renderCard(card, facedown = false) {
  if (facedown) {
    return '<div class="card-face back"><div class="card-rank">?</div><div class="card-suit"></div><div class="card-corner">?</div></div>';
  }
  const red = card.suit === 'hearts' || card.suit === 'diamonds';
  const rank = Engine.cardRankLabel(card.rank);
  return `
    <div class="card-face ${red ? 'red' : ''}">
      <div class="card-rank">${rank}</div>
      <div class="card-suit">${suitSvg(card.suit)}</div>
      <div class="card-corner">${suitSvg(card.suit)}</div>
    </div>
  `;
}

function renderCards(container, cards, hideSecond = false) {
  container.innerHTML = cards?.length
    ? cards
        .map((card, index) => renderCard(card, hideSecond && index === 1))
        .join('')
    : '<div class="muted">No cards yet.</div>';
}

function slotSymbolSvg(symbol) {
  const svgs = {
    crown: '<svg viewBox="0 0 64 64" aria-hidden="true"><path fill="#fbbf24" d="M10 48 16 18l16 14 16-14 6 30H10Z"/><rect x="10" y="48" width="44" height="8" rx="4" fill="#f59e0b"/></svg>',
    gem: '<svg viewBox="0 0 64 64" aria-hidden="true"><path fill="#60a5fa" d="M20 12h24l10 14-22 26L10 26l10-14Z"/></svg>',
    bell: '<svg viewBox="0 0 64 64" aria-hidden="true"><path fill="#fde68a" d="M32 12c-10 0-18 8-18 18v10l-4 8h44l-4-8V30c0-10-8-18-18-18Z"/><circle cx="32" cy="52" r="5" fill="#f59e0b"/></svg>',
    star: '<svg viewBox="0 0 64 64" aria-hidden="true"><path fill="#c4b5fd" d="m32 8 7.6 15.4L56 25.7 44 37.4l2.8 16.5L32 46 17.2 53.9 20 37.4 8 25.7l16.4-2.3L32 8Z"/></svg>',
    horseshoe: '<svg viewBox="0 0 64 64" aria-hidden="true"><path fill="#86efac" d="M18 20a14 14 0 1 1 28 0v24a6 6 0 0 0 6 6h4v8h-4a14 14 0 0 1-14-14V20a6 6 0 1 0-12 0v24A14 14 0 0 1 12 58H8v-8h4a6 6 0 0 0 6-6V20Z"/></svg>',
  };
  return `<div class="slot-reel">${svgs[symbol] ?? symbol}</div>`;
}

function renderDie(value) {
  const layouts = {
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8],
  };
  const active = new Set(layouts[value] ?? []);
  return `<div class="die">${Array.from({ length: 9 }, (_, index) => (active.has(index) ? '<span class="pip"></span>' : '<span></span>')).join('')}</div>`;
}

function renderHud() {
  els.playerBalance.textContent = state.playerChips.toLocaleString();
  els.casinoFunds.textContent = state.owner.funds.toLocaleString();
}

function renderSidebar() {
  const { rounds, wins, losses, pushes, totalStaked, totalReturned } = state.stats;
  els.statsSummary.textContent =
    rounds === 0
      ? 'No rounds played yet.'
      : `${rounds} rounds • ${wins} wins • ${losses} losses • ${pushes} pushes`;
  els.statsBreakdown.innerHTML = [
    `Total staked: ${totalStaked.toLocaleString()} chips`,
    `Total returned: ${totalReturned.toLocaleString()} chips`,
    `Net: ${(totalReturned - totalStaked >= 0 ? '+' : '') + (totalReturned - totalStaked).toLocaleString()} chips`,
    `Owner level: ${state.owner.level}`,
  ]
    .map((item) => `<li>${item}</li>`)
    .join('');

  els.historyList.innerHTML = state.history.length
    ? state.history
        .map((entry) => `<li><strong>${escapeHtml(entry.game)}</strong> ${escapeHtml(entry.text)} (${entry.delta >= 0 ? '+' : ''}${entry.delta})</li>`)
        .join('')
    : '<li>No recent results yet.</li>';
}

function renderSlots() {
  const round = state.ui.slotsRound;
  const symbols = round?.symbols ?? ['crown', 'gem', 'bell'];
  els.slotReels.classList.toggle('spinning', Boolean(round?.spinning) && !prefersReducedMotion);
  els.slotReels.innerHTML = symbols.map((symbol) => slotSymbolSvg(symbol)).join('');
  els.slotsSpin.disabled = Boolean(round?.spinning);
  els.slotsSkip.hidden = !round?.spinning || prefersReducedMotion;
}

function settleSlotRound(round) {
  if (!round) return;
  const result = Engine.evaluateSlots(round.symbols, round.stake);
  state.ui.slotsRound = null;
  renderSlots();
  if (result.won) {
    applyPlayerReturn(result.totalReturn);
    const text = `${result.symbols.join(', ')} matched for x${result.profitMultiplier}.`;
    recordRound({ game: 'Slots', outcome: 'win', stake: round.stake, totalReturn: result.totalReturn, text });
    setStatus(els.slotsStatus, `Win — ${text}`, 'good');
  } else {
    recordRound({ game: 'Slots', outcome: 'lose', stake: round.stake, totalReturn: 0, text: 'No symbols matched.' });
    setStatus(els.slotsStatus, 'No matching line this spin.', 'bad');
  }
  persist();
  renderHud();
}

function spinSlots() {
  if (state.ui.slotsRound?.spinning) return;
  const stake = tryStake();
  if (!stake) return;
  const symbols = Engine.spinSlots();
  state.ui.slotsRound = { spinning: true, stake, symbols, timer: null };
  renderSlots();
  setStatus(els.slotsStatus, 'Spinning reels...');
  if (prefersReducedMotion) {
    settleSlotRound(state.ui.slotsRound);
    return;
  }
  state.ui.slotsRound.timer = window.setTimeout(() => settleSlotRound(state.ui.slotsRound), 850);
}

function skipSlots() {
  if (!state.ui.slotsRound?.spinning) return;
  window.clearTimeout(state.ui.slotsRound.timer);
  settleSlotRound(state.ui.slotsRound);
}

function renderScratch() {
  const ticket = state.ui.scratchTicket;
  els.scratchGrid.innerHTML = ticket
    ? ticket.symbols
        .map((symbol, index) => {
          const revealed = ticket.revealed[index];
          return `<button class="scratch-cell ${revealed ? 'revealed' : ''}" data-index="${index}" ${ticket.finished ? 'disabled' : ''}>${
            revealed ? escapeHtml(symbol.toUpperCase()) : 'Reveal'
          }</button>`;
        })
        .join('')
    : '<p class="muted">Buy a scratch ticket to reveal nine panels.</p>';
}

function buyScratchTicket() {
  if (state.ui.scratchTicket?.active) return;
  const stake = tryStake();
  if (!stake) return;
  state.ui.scratchTicket = Engine.createScratchTicket(stake);
  renderScratch();
  setStatus(els.scratchStatus, 'Ticket ready. Reveal all 9 panels.');
}

function revealScratch(index) {
  const next = Engine.revealScratchCell(state.ui.scratchTicket, index);
  if (next?.ignored) return;
  state.ui.scratchTicket = next;
  renderScratch();
  if (next.finished) {
    if (next.totalReturn > 0) applyPlayerReturn(next.totalReturn);
    recordRound({
      game: 'Scratch Card',
      outcome: next.outcome,
      stake: next.stake,
      totalReturn: next.totalReturn,
      text: next.message,
    });
    setStatus(els.scratchStatus, next.message, next.totalReturn > 0 ? 'good' : 'bad');
    persist();
    renderHud();
  } else {
    setStatus(els.scratchStatus, next.message);
  }
}

function renderBlackjack() {
  const round = state.ui.blackjackRound;
  renderCards(els.blackjackPlayer, round?.playerCards ?? []);
  renderCards(els.blackjackDealer, round?.dealerCards ?? [], Boolean(round && !round.finished));
  els.blackjackPlayerScore.textContent = round ? `Player: ${Engine.scoreBlackjack(round.playerCards).total}` : '';
  els.blackjackDealerScore.textContent = round
    ? round.finished
      ? `Dealer: ${Engine.scoreBlackjack(round.dealerCards).total}`
      : 'Dealer: hidden'
    : '';
  els.blackjackHit.disabled = !round?.active;
  els.blackjackStand.disabled = !round?.active;
}

function settleBlackjackRound(round) {
  if (round.totalReturn > 0) applyPlayerReturn(round.totalReturn);
  recordRound({
    game: 'Blackjack',
    outcome: round.outcome,
    stake: round.stake,
    totalReturn: round.totalReturn,
    text: `${round.message} ${deltaText(round.totalReturn, round.stake)}`,
  });
  renderBlackjack();
  persist();
  renderHud();
  setStatus(els.blackjackStatus, round.message, round.totalReturn > 0 ? 'good' : round.outcome === 'push' ? '' : 'bad');
}

function blackjackDeal() {
  if (state.ui.blackjackRound?.active) return;
  const stake = tryStake();
  if (!stake) return;
  const round = Engine.startBlackjackRound(stake, state.ui.blackjackShoe);
  state.ui.blackjackRound = round;
  state.ui.blackjackShoe = round.shoe;
  renderBlackjack();
  setStatus(els.blackjackStatus, round.message, round.totalReturn > 0 ? 'good' : round.outcome === 'lose' ? 'bad' : '');
  if (round.finished) settleBlackjackRound(round);
}

function blackjackHit() {
  const next = Engine.blackjackHit(state.ui.blackjackRound);
  if (next?.ignored) return;
  state.ui.blackjackRound = next;
  state.ui.blackjackShoe = next.shoe;
  renderBlackjack();
  if (next.finished) settleBlackjackRound(next);
  else setStatus(els.blackjackStatus, next.message);
}

function blackjackStand() {
  const next = Engine.blackjackStand(state.ui.blackjackRound);
  if (next?.ignored) return;
  state.ui.blackjackRound = next;
  state.ui.blackjackShoe = next.shoe;
  settleBlackjackRound(next);
}

function renderBaccarat(result = null) {
  renderCards(els.baccaratPlayer, result?.playerCards ?? []);
  renderCards(els.baccaratBanker, result?.bankerCards ?? []);
  els.baccaratPlayerScore.textContent = result ? `Player total: ${result.playerTotal}` : '';
  els.baccaratBankerScore.textContent = result ? `Banker total: ${result.bankerTotal}` : '';
}

function playBaccarat(betOn) {
  const stake = tryStake();
  if (!stake) return;
  const result = Engine.playBaccaratRound(stake, betOn, state.ui.baccaratShoe);
  state.ui.baccaratShoe = result.shoe;
  renderBaccarat(result);
  if (result.totalReturn > 0) applyPlayerReturn(result.totalReturn);
  recordRound({ game: 'Baccarat', outcome: result.outcome, stake, totalReturn: result.totalReturn, text: result.message });
  persist();
  renderHud();
  setStatus(els.baccaratStatus, result.message, result.totalReturn > 0 ? 'good' : result.outcome === 'lose' ? 'bad' : '');
}

function renderPoker() {
  const round = state.ui.pokerRound;
  els.pokerCards.innerHTML = round?.cards?.length ? round.cards.map((card) => renderCard(card)).join('') : '<div class="muted">Deal to receive a 5-card hand.</div>';
  els.pokerHolds.innerHTML = round?.active
    ? round.cards
        .map((card, index) => `<button class="hold-btn ${state.ui.pokerHold.has(index) ? 'active' : ''}" data-index="${index}">Hold ${Engine.cardRankLabel(card.rank)}</button>`)
        .join('')
    : '';
  els.pokerDraw.disabled = !round?.active;
}

function dealPoker() {
  if (state.ui.pokerRound?.active) return;
  const stake = tryStake();
  if (!stake) return;
  const round = Engine.startVideoPokerRound(stake, state.ui.pokerDeck);
  state.ui.pokerRound = round;
  state.ui.pokerDeck = round.shoe;
  state.ui.pokerHold = new Set();
  renderPoker();
  setStatus(els.pokerStatus, round.message);
}

function togglePokerHold(index) {
  if (!state.ui.pokerRound?.active) return;
  if (state.ui.pokerHold.has(index)) state.ui.pokerHold.delete(index);
  else state.ui.pokerHold.add(index);
  renderPoker();
}

function drawPoker() {
  const next = Engine.drawVideoPoker(state.ui.pokerRound, [...state.ui.pokerHold]);
  if (next?.ignored) return;
  state.ui.pokerRound = next;
  state.ui.pokerDeck = next.shoe;
  if (next.totalReturn > 0) applyPlayerReturn(next.totalReturn);
  recordRound({ game: 'Video Poker', outcome: next.outcome, stake: next.stake, totalReturn: next.totalReturn, text: next.message });
  persist();
  renderHud();
  renderPoker();
  setStatus(els.pokerStatus, next.message, next.totalReturn > 0 ? 'good' : 'bad');
}

function updateRouletteValueOptions() {
  const type = els.rouletteType.value;
  const options = [];
  if (type === 'color') {
    options.push(['red', 'Red'], ['black', 'Black']);
  } else if (type === 'parity') {
    options.push(['even', 'Even'], ['odd', 'Odd']);
  } else if (type === 'dozen') {
    options.push(['1', '1-12'], ['2', '13-24'], ['3', '25-36']);
  } else {
    for (let index = 0; index <= 36; index += 1) options.push([String(index), String(index)]);
  }
  els.rouletteValue.innerHTML = options.map(([value, label]) => `<option value="${value}">${label}</option>`).join('');
}

function spinRoulette() {
  const stake = tryStake();
  if (!stake) return;
  const bet = {
    type: els.rouletteType.value,
    value: els.rouletteValue.value,
    number: els.rouletteValue.value,
  };
  const result = Engine.settleRouletteBet(bet, Engine.spinRoulette(), stake);
  if (result.totalReturn > 0) applyPlayerReturn(result.totalReturn);
  els.rouletteResult.innerHTML = `<div class="wheel-number ${result.spin.color}">${result.spin.number}</div>`;
  recordRound({
    game: 'Roulette',
    outcome: result.won ? 'win' : 'lose',
    stake,
    totalReturn: result.totalReturn,
    text: `Wheel landed on ${result.spin.number} ${result.spin.color}.`,
  });
  persist();
  renderHud();
  setStatus(
    els.rouletteStatus,
    result.won ? `Winning ${bet.type} bet paid x${result.profitMultiplier}.` : `Wheel landed on ${result.spin.number} ${result.spin.color}.`,
    result.won ? 'good' : 'bad',
  );
}

function renderDice() {
  const round = state.ui.diceRound;
  els.diceFace.innerHTML = round?.lastRoll ? renderDie(round.lastRoll) : '<div class="muted">Roll a die to begin.</div>';
  els.diceStart.disabled = Boolean(round?.active);
  els.diceRoll.disabled = !round?.active;
  els.diceBank.disabled = !round?.active;
}

function startDice() {
  if (state.ui.diceRound?.active) return;
  const stake = tryStake();
  if (!stake) return;
  state.ui.diceRound = Engine.startDiceRound(stake);
  renderDice();
  setStatus(els.diceStatus, 'Round started. Roll or bank.');
}

function rollDiceAction() {
  const next = Engine.rollDice(state.ui.diceRound);
  if (next?.ignored) return;
  state.ui.diceRound = next;
  renderDice();
  if (next.active) {
    setStatus(els.diceStatus, next.message);
    return;
  }
  if (next.totalReturn > 0) applyPlayerReturn(next.totalReturn);
  recordRound({ game: 'Risk Dice', outcome: next.outcome, stake: next.stake, totalReturn: next.totalReturn, text: next.message });
  persist();
  renderHud();
  setStatus(els.diceStatus, next.message, next.totalReturn > 0 ? 'good' : 'bad');
}

function bankDiceAction() {
  const next = Engine.bankDice(state.ui.diceRound);
  if (next?.ignored) return;
  state.ui.diceRound = next;
  if (next.totalReturn > 0) applyPlayerReturn(next.totalReturn);
  recordRound({ game: 'Risk Dice', outcome: next.outcome, stake: next.stake, totalReturn: next.totalReturn, text: next.message });
  persist();
  renderHud();
  renderDice();
  setStatus(els.diceStatus, next.message, next.totalReturn > 0 ? 'good' : 'bad');
}

function renderCraps() {
  const round = state.ui.crapsRound;
  const latest = round?.rolls?.[round.rolls.length - 1];
  els.crapsDice.innerHTML = latest ? `${renderDie(latest.dieOne)}${renderDie(latest.dieTwo)}` : '<div class="muted">Start a pass or don\'t pass line.</div>';
  els.crapsRoll.disabled = !round?.active;
}

function startCraps(side) {
  if (state.ui.crapsRound?.active) return;
  const stake = tryStake();
  if (!stake) return;
  state.ui.crapsRound = Engine.startCrapsRound(stake, side);
  renderCraps();
  setStatus(els.crapsStatus, state.ui.crapsRound.message);
}

function rollCrapsAction() {
  const next = Engine.rollCraps(state.ui.crapsRound);
  if (next?.ignored) return;
  state.ui.crapsRound = next;
  renderCraps();
  if (next.active) {
    setStatus(els.crapsStatus, next.message);
    return;
  }
  if (next.totalReturn > 0) applyPlayerReturn(next.totalReturn);
  recordRound({ game: 'Craps', outcome: next.outcome, stake: next.stake, totalReturn: next.totalReturn, text: next.message });
  persist();
  renderHud();
  setStatus(els.crapsStatus, next.message, next.totalReturn > 0 ? 'good' : next.outcome === 'push' ? '' : 'bad');
}

function renderKeno() {
  els.kenoGrid.innerHTML = Array.from({ length: Engine.KENO_FIELD_SIZE }, (_, index) => {
    const value = index + 1;
    return `<button class="number-cell ${state.ui.kenoPicks.includes(value) ? 'selected' : ''}" data-value="${value}">${value}</button>`;
  }).join('');
}

function toggleKenoPick(value) {
  const picks = [...state.ui.kenoPicks];
  if (picks.includes(value)) {
    state.ui.kenoPicks = picks.filter((entry) => entry !== value);
  } else if (picks.length < Engine.KENO_PICK_COUNT) {
    state.ui.kenoPicks = [...picks, value].sort((a, b) => a - b);
  }
  renderKeno();
}

function clearKeno() {
  state.ui.kenoPicks = [];
  els.kenoResults.innerHTML = '';
  renderKeno();
}

function drawKeno() {
  if (state.ui.kenoPicks.length !== Engine.KENO_PICK_COUNT) {
    setStatus(els.kenoStatus, `Pick exactly ${Engine.KENO_PICK_COUNT} numbers first.`, 'bad');
    return;
  }
  const stake = tryStake();
  if (!stake) return;
  const result = Engine.settleKeno(state.ui.kenoPicks, stake);
  if (result.totalReturn > 0) applyPlayerReturn(result.totalReturn);
  recordRound({
    game: 'Keno',
    outcome: result.outcome,
    stake,
    totalReturn: result.totalReturn,
    text: `${result.hits.length} hits from picks ${result.picks.join(', ')}.`,
  });
  persist();
  renderHud();
  els.kenoResults.innerHTML = result.draw.map((value) => `<span class="pill ${result.hits.includes(value) ? 'selected' : ''}">${value}</span>`).join('');
  setStatus(
    els.kenoStatus,
    result.totalReturn > 0 ? `${result.hits.length} hits paid x${result.profitMultiplier}.` : `${result.hits.length} hits. No payout.`,
    result.totalReturn > 0 ? 'good' : 'bad',
  );
}

function renderBingo() {
  const round = state.ui.bingoRound;
  if (!round) {
    els.bingoCard.innerHTML = '<div class="muted">Buy a card to generate a fresh 5x5 ticket.</div>';
    els.bingoCalled.innerHTML = '';
    els.bingoDraw.disabled = true;
    return;
  }
  const marks = round.marks ?? Engine.bingoMarks(round.card, round.drawnNumbers);
  els.bingoCard.innerHTML = [
    '<div class="bingo-header"><div class="bingo-cell">B</div><div class="bingo-cell">I</div><div class="bingo-cell">N</div><div class="bingo-cell">G</div><div class="bingo-cell">O</div></div>',
    ...round.card.map(
      (row, rowIndex) =>
        `<div class="bingo-row">${row
          .map((value, columnIndex) => `<div class="bingo-cell ${marks[rowIndex][columnIndex] ? 'marked' : ''}">${value}</div>`)
          .join('')}</div>`,
    ),
  ].join('');
  els.bingoCalled.innerHTML = round.drawnNumbers.map((value) => `<span class="pill">${value}</span>`).join('');
  els.bingoDraw.disabled = !round.active;
}

function buyBingo() {
  if (state.ui.bingoRound?.active) return;
  const stake = tryStake();
  if (!stake) return;
  state.ui.bingoRound = Engine.startBingoRound(stake);
  renderBingo();
  setStatus(els.bingoStatus, state.ui.bingoRound.message);
}

function drawBingo() {
  const next = Engine.drawBingoBall(state.ui.bingoRound);
  if (next?.ignored) return;
  state.ui.bingoRound = next;
  renderBingo();
  if (next.active) {
    setStatus(els.bingoStatus, next.message);
    return;
  }
  if (next.totalReturn > 0) applyPlayerReturn(next.totalReturn);
  recordRound({ game: 'Bingo', outcome: next.outcome, stake: next.stake, totalReturn: next.totalReturn, text: next.message });
  persist();
  renderHud();
  setStatus(els.bingoStatus, next.message, next.totalReturn > 0 ? 'good' : 'bad');
}

function renderSportsbook() {
  const event = state.ui.sportsbookEvent;
  els.sportsbookTitle.textContent = event.name;
  els.sportsbookDescription.textContent = event.description;
  els.sportsbookSelection.innerHTML = event.options.map((option) => `<option value="${option.key}">${escapeHtml(option.label)}</option>`).join('');
  if (state.ui.sportsbookBet) els.sportsbookSelection.value = state.ui.sportsbookBet.optionKey;
  els.sportsbookOptions.innerHTML = event.options
    .map((option) => `<span class="event-option">${escapeHtml(option.label)} · x${option.profitMultiplier}</span>`)
    .join('');
  els.sportsbookRun.disabled = !state.ui.sportsbookBet;
  els.sportsbookBet.disabled = Boolean(state.ui.sportsbookBet);
  els.sportsbookNew.disabled = Boolean(state.ui.sportsbookBet);
  els.sportsbookKind.disabled = Boolean(state.ui.sportsbookBet);
  els.sportsbookSelection.disabled = Boolean(state.ui.sportsbookBet);
}

function newSportsbookEvent() {
  if (state.ui.sportsbookBet) return;
  state.ui.sportsbookEvent = Engine.generateSportsEvent(els.sportsbookKind.value);
  renderSportsbook();
  setStatus(els.sportsbookStatus, 'New fictional event generated.');
}

function placeSportsbookBet() {
  if (state.ui.sportsbookBet) return;
  const stake = tryStake();
  if (!stake) return;
  state.ui.sportsbookBet = {
    stake,
    optionKey: els.sportsbookSelection.value,
    event: state.ui.sportsbookEvent,
  };
  renderSportsbook();
  setStatus(els.sportsbookStatus, 'Bet placed. Wagering is now closed until the event runs.');
}

function runSportsbookEvent() {
  const pending = state.ui.sportsbookBet;
  if (!pending) return;
  const result = Engine.settleSportsbookBet(pending.event, pending.optionKey, pending.stake);
  if (result.totalReturn > 0) applyPlayerReturn(result.totalReturn);
  recordRound({ game: pending.event.kind === 'horse' ? 'Horse Race' : 'Sports Match', outcome: result.outcome, stake: pending.stake, totalReturn: result.totalReturn, text: result.message });
  persist();
  renderHud();
  setStatus(els.sportsbookStatus, `${result.message} Winning side: ${result.winningOption.label}.`, result.totalReturn > 0 ? 'good' : 'bad');
  state.ui.sportsbookBet = null;
  state.ui.sportsbookEvent = Engine.generateSportsEvent(els.sportsbookKind.value);
  renderSportsbook();
}

function ownerStatus(message, type = '') {
  setStatus(els.ownerStatus, message, type);
  announce(message);
}

function renderOwner() {
  els.ownerName.value = state.owner.ownerName;
  els.casinoName.value = state.owner.casinoName;
  els.ownerSummaryName.textContent = state.owner.established
    ? `${state.owner.casinoName} is owned by ${state.owner.ownerName}.`
    : 'No casino established yet.';
  els.ownerLastDay.textContent = state.owner.stats.lastDay
    ? `${state.owner.stats.lastDay.visitors} visitors • revenue ${state.owner.stats.lastDay.revenue} • expenses ${state.owner.stats.lastDay.expenses} • profit ${state.owner.stats.lastDay.profit >= 0 ? '+' : ''}${state.owner.stats.lastDay.profit}. ${state.owner.stats.lastDay.note}`
    : 'Run your first day to see visitors, revenue, expenses, and profit.';

  els.ownerSettingMarketing.value = state.owner.settings.marketing;
  els.ownerSettingHospitality.value = state.owner.settings.hospitality;
  els.ownerSettingMaintenance.value = state.owner.settings.maintenance;

  els.ownerInstallations.innerHTML = Object.entries(Engine.GAME_INSTALLATIONS)
    .map(([key, config]) => {
      const locked = config.unlockLevel > state.owner.level;
      return `
        <div class="catalog-item ${locked ? 'locked' : ''}">
          <h4>${escapeHtml(config.label)}</h4>
          <p class="muted">Cost ${config.cost} • Daily revenue ${config.dailyRevenue} • Upkeep ${config.upkeep} • Unlock level ${config.unlockLevel}</p>
          <p class="muted">Owned: ${state.owner.inventory[key]}</p>
          <button data-kind="install" data-key="${key}" ${locked ? 'disabled' : ''}>Buy installation</button>
        </div>`;
    })
    .join('');

  els.ownerStaff.innerHTML = Object.entries(Engine.STAFF_ROLES)
    .map(([key, config]) => `
      <div class="catalog-item">
        <h4>${escapeHtml(config.label)}</h4>
        <p class="muted">Hire ${config.hireCost} • Daily wage ${config.dailyWage}</p>
        <p class="muted">Hired: ${state.owner.staff[key]}</p>
        <button data-kind="staff" data-key="${key}">Hire</button>
      </div>`)
    .join('');

  els.ownerUpgrades.innerHTML = Object.entries(Engine.CASINO_UPGRADES)
    .map(([key, config]) => `
      <div class="catalog-item ${state.owner.upgrades[key] ? 'locked' : ''}">
        <h4>${escapeHtml(config.label)}</h4>
        <p class="muted">Cost ${config.cost} • Daily fee ${config.dailyFee}</p>
        <p class="muted">Visitor +${Math.round(config.visitorMultiplier * 100)}% • Revenue +${Math.round(config.revenueMultiplier * 100)}%</p>
        <button data-kind="upgrade" data-key="${key}" ${state.owner.upgrades[key] ? 'disabled' : ''}>Install upgrade</button>
      </div>`)
    .join('');

  const inventoryCount = Object.values(state.owner.inventory).reduce((sum, count) => sum + count, 0);
  const staffCount = Object.values(state.owner.staff).reduce((sum, count) => sum + count, 0);
  const upgradeCount = Object.values(state.owner.upgrades).filter(Boolean).length;
  els.ownerMetrics.innerHTML = [
    `Level: ${state.owner.level}`,
    `Days run: ${state.owner.stats.daysRun}`,
    `Lifetime visitors: ${state.owner.stats.visitors}`,
    `Lifetime revenue: ${state.owner.stats.revenue}`,
    `Lifetime expenses: ${state.owner.stats.expenses}`,
    `Lifetime profit: ${state.owner.stats.profit >= 0 ? '+' : ''}${state.owner.stats.profit}`,
    `Installations owned: ${inventoryCount}`,
    `Staff hired: ${staffCount}`,
    `Upgrades installed: ${upgradeCount}`,
  ]
    .map((item) => `<li>${item}</li>`)
    .join('');
}

function establishOwner() {
  const result = Engine.establishCasino(state.owner, els.ownerName.value, els.casinoName.value);
  if (!result.ok) {
    ownerStatus(result.error, 'bad');
    return;
  }
  state.owner = result.owner;
  persist();
  renderOwner();
  renderHud();
  ownerStatus(`Established ${state.owner.casinoName}.`, 'good');
}

function transferToCasino() {
  const result = Engine.transferPlayerToCasino(state.playerChips, state.owner, Number(els.transferAmount.value));
  if (!result.ok) {
    ownerStatus(result.error, 'bad');
    return;
  }
  state.playerChips = result.playerChips;
  state.owner = result.owner;
  persist();
  renderHud();
  renderOwner();
  ownerStatus('Transferred chips into casino funds.', 'good');
}

function transferToPlayer() {
  const result = Engine.transferCasinoToPlayer(state.playerChips, state.owner, Number(els.transferAmount.value));
  if (!result.ok) {
    ownerStatus(result.error, 'bad');
    return;
  }
  state.playerChips = result.playerChips;
  state.owner = result.owner;
  persist();
  renderHud();
  renderOwner();
  ownerStatus('Transferred casino funds back to player chips.', 'good');
}

function ownerCatalogAction(kind, key) {
  let result = null;
  if (kind === 'install') result = Engine.purchaseInstallation(state.owner, key);
  if (kind === 'staff') result = Engine.hireStaff(state.owner, key);
  if (kind === 'upgrade') result = Engine.buyUpgrade(state.owner, key);
  if (!result?.ok) {
    ownerStatus(result?.error ?? 'Unable to complete that action.', 'bad');
    return;
  }
  state.owner = result.owner;
  persist();
  renderOwner();
  renderHud();
  ownerStatus('Casino management action completed.', 'good');
}

function updateOwnerSetting(key, value) {
  state.owner = Engine.updateCasinoSetting(state.owner, key, value);
  persist();
  renderOwner();
}

function runOwnerDay() {
  const result = Engine.runCasinoDay(state.owner);
  if (!result.ok) {
    ownerStatus(result.error, 'bad');
    return;
  }
  state.owner = result.owner;
  persist();
  renderOwner();
  renderHud();
  ownerStatus(`Day complete: ${result.summary.visitors} visitors and ${result.summary.profit >= 0 ? '+' : ''}${result.summary.profit} profit.`, result.summary.profit >= 0 ? 'good' : 'bad');
}

function renderPaytables() {
  els.slotsPaytable.innerHTML = Object.entries(Engine.SLOT_PAYTABLE)
    .map(([symbol, multiplier]) => `<tr><td>${escapeHtml(symbol)}</td><td>x${multiplier}</td></tr>`)
    .join('');
  els.dicePaytable.innerHTML = Engine.DICE_PROFIT_STEPS.map((multiplier, index) => `<tr><td>${index + 1} safe rolls</td><td>Bust on ${Engine.bustThreshold(index)} or less</td><td>x${multiplier}</td></tr>`).join('');
  els.scratchPaytable.innerHTML = Object.entries(Engine.SCRATCH_PAYTABLE)
    .map(([symbol, multiplier]) => `<tr><td>${escapeHtml(symbol)}</td><td>x${multiplier}</td></tr>`)
    .join('');
  els.pokerPaytable.innerHTML = Object.entries(Engine.POKER_PAYTABLE)
    .map(([hand, multiplier]) => `<tr><td>${escapeHtml(hand)}</td><td>x${multiplier}</td></tr>`)
    .join('');
}

function renderEverything() {
  renderSaveStatus();
  renderHud();
  renderSidebar();
  renderSlots();
  renderScratch();
  renderBlackjack();
  renderBaccarat();
  renderPoker();
  updateRouletteValueOptions();
  renderDice();
  renderCraps();
  renderKeno();
  renderBingo();
  renderSportsbook();
  renderOwner();
}

els.navButtons.forEach((button) => button.addEventListener('click', () => setCurrentGame(button.dataset.game)));
els.refillPlayer.addEventListener('click', freeRefill);
els.resetProgress.addEventListener('click', resetAllProgress);
els.downloadHtml.addEventListener('click', downloadStandaloneHtml);
els.slotsSpin.addEventListener('click', spinSlots);
els.slotsSkip.addEventListener('click', skipSlots);
els.scratchBuy.addEventListener('click', buyScratchTicket);
els.scratchGrid.addEventListener('click', (event) => {
  const button = event.target.closest('[data-index]');
  if (!button) return;
  revealScratch(Number(button.dataset.index));
});
els.blackjackDeal.addEventListener('click', blackjackDeal);
els.blackjackHit.addEventListener('click', blackjackHit);
els.blackjackStand.addEventListener('click', blackjackStand);
els.baccaratButtons.forEach((button) => button.addEventListener('click', () => playBaccarat(button.dataset.bet)));
els.pokerDeal.addEventListener('click', dealPoker);
els.pokerDraw.addEventListener('click', drawPoker);
els.pokerHolds.addEventListener('click', (event) => {
  const button = event.target.closest('[data-index]');
  if (!button) return;
  togglePokerHold(Number(button.dataset.index));
});
els.rouletteType.addEventListener('change', updateRouletteValueOptions);
els.rouletteSpin.addEventListener('click', spinRoulette);
els.diceStart.addEventListener('click', startDice);
els.diceRoll.addEventListener('click', rollDiceAction);
els.diceBank.addEventListener('click', bankDiceAction);
els.crapsButtons.forEach((button) => button.addEventListener('click', () => startCraps(button.dataset.side)));
els.crapsRoll.addEventListener('click', rollCrapsAction);
els.kenoGrid.addEventListener('click', (event) => {
  const button = event.target.closest('[data-value]');
  if (!button) return;
  toggleKenoPick(Number(button.dataset.value));
});
els.kenoDraw.addEventListener('click', drawKeno);
els.kenoClear.addEventListener('click', clearKeno);
els.bingoBuy.addEventListener('click', buyBingo);
els.bingoDraw.addEventListener('click', drawBingo);
els.sportsbookKind.addEventListener('change', newSportsbookEvent);
els.sportsbookNew.addEventListener('click', newSportsbookEvent);
els.sportsbookBet.addEventListener('click', placeSportsbookBet);
els.sportsbookRun.addEventListener('click', runSportsbookEvent);
els.ownerEstablish.addEventListener('click', establishOwner);
els.transferToCasino.addEventListener('click', transferToCasino);
els.transferToPlayer.addEventListener('click', transferToPlayer);
els.ownerInstallations.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-key]');
  if (!button) return;
  ownerCatalogAction(button.dataset.kind, button.dataset.key);
});
els.ownerStaff.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-key]');
  if (!button) return;
  ownerCatalogAction(button.dataset.kind, button.dataset.key);
});
els.ownerUpgrades.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-key]');
  if (!button) return;
  ownerCatalogAction(button.dataset.kind, button.dataset.key);
});
els.ownerSettingMarketing.addEventListener('input', (event) => updateOwnerSetting('marketing', event.target.value));
els.ownerSettingHospitality.addEventListener('input', (event) => updateOwnerSetting('hospitality', event.target.value));
els.ownerSettingMaintenance.addEventListener('input', (event) => updateOwnerSetting('maintenance', event.target.value));
els.ownerRunDay.addEventListener('click', runOwnerDay);

renderPaytables();
renderEverything();
setCurrentGame(state.ui.currentGame);
announce('Lucky Cascade Casino loaded. Free fictional chips only.');

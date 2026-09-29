import fs from 'node:fs';
import path from 'node:path';
import { JSDOM, VirtualConsole } from 'jsdom';
import { describe, expect, it } from 'vitest';
import { buildStandaloneHtml } from '../src/build-standalone.js';

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const builtHtml = buildStandaloneHtml();
const SAVE_KEY = 'lucky-cascade-casino-v2';

function inlineScriptSource(html) {
  const start = html.indexOf('<script>') + '<script>'.length;
  return html.slice(start, html.lastIndexOf('</script>'));
}

function openCasino(html = builtHtml, { reducedMotion = true, savedState = null, random = null } = {}) {
  const errors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', (error) => errors.push(error.message));
  const dom = new JSDOM(html, {
    url: 'http://localhost/',
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    virtualConsole,
    beforeParse(window) {
      window.matchMedia = () => ({ matches: reducedMotion, addEventListener() {}, removeEventListener() {} });
      if (savedState) window.localStorage.setItem(SAVE_KEY, typeof savedState === 'string' ? savedState : JSON.stringify({ version: 2, state: savedState }));
      if (random) window.Math.random = random;
    },
  });
  const { document } = dom.window;
  const $ = (selector) => document.querySelector(selector);
  const click = (selector) => $(selector).click();
  const balance = () => Number($('#player-balance').textContent.replace(/[^\d]/g, ''));
  const saved = () => JSON.parse(dom.window.localStorage.getItem(SAVE_KEY))?.state;
  const goal = (id) => $(`[data-challenge="${id}"]`);
  return { dom, window: dom.window, document, errors, $, click, balance, saved, goal };
}

describe('standalone casino.html', () => {
  it('committed casino.html and index.html match the build output', () => {
    expect(fs.readFileSync(path.join(repoRoot, 'casino.html'), 'utf8')).toBe(builtHtml);
    expect(fs.readFileSync(path.join(repoRoot, 'index.html'), 'utf8')).toBe(builtHtml);
  });

  it('keeps the whole runtime inside a single, parseable inline script', () => {
    expect(builtHtml.match(/<\/script/gi)).toHaveLength(1);
    expect(builtHtml).not.toMatch(/<script>[\s\S]*<!--[\s\S]*<\/script>/);
    expect(() => new Function(inlineScriptSource(builtHtml))).not.toThrow();
  });

  it('starts without script errors and exposes an intact engine', () => {
    const { window, document, errors } = openCasino();
    expect(errors).toEqual([]);
    expect(document.scripts).toHaveLength(1);
    const symbols = window.CasinoEngine.spinSlots(() => 0);
    expect(symbols).toHaveLength(3);
    expect(window.CasinoEngine.spinRoulette(() => 0)).toBeTypeOf('object');
  });

  it('wires navigation and game buttons with a single stake deduction per round', () => {
    const { $, click, balance, errors, document } = openCasino();
    for (const game of ['blackjack', 'roulette', 'keno', 'sportsbook', 'owner', 'slots']) {
      click(`.nav-btn[data-game="${game}"]`);
      expect($(`#panel-${game}`).hidden).toBe(false);
    }

    $('#stake-input').value = '10';
    const start = balance();
    click('#slots-spin');
    expect($('#slots-status').textContent).not.toBe('Spinning reels...');
    const afterSpin = balance();
    expect(afterSpin === start - 10 || afterSpin > start).toBe(true);

    click('.nav-btn[data-game="blackjack"]');
    expect($('#blackjack-hit').disabled).toBe(true);
    const beforeDeal = balance();
    click('#blackjack-deal');
    if (!$('#blackjack-hit').disabled) {
      expect(balance()).toBe(beforeDeal - 10);
      click('#blackjack-deal');
      expect(balance()).toBe(beforeDeal - 10);
      click('#refill-player');
      expect($('#blackjack-hit').disabled).toBe(true);
    }

    click('#poker-deal');
    click('#poker-holds [data-index="0"]');
    expect($('#poker-holds [data-index="0"]').classList.contains('active')).toBe(true);

    click('.nav-btn[data-game="keno"]');
    click('#keno-grid [data-value="1"]');
    click('#keno-grid [data-value="2"]');
    expect(document.querySelectorAll('#keno-grid .selected')).toHaveLength(2);
    click('#keno-clear');
    expect(document.querySelectorAll('#keno-grid .selected')).toHaveLength(0);

    click('#refill-player');
    expect(balance()).toBe(750);
    expect(errors).toEqual([]);
  });

  it('supports owner setup and reset', () => {
    const { $, click, errors } = openCasino();
    click('.nav-btn[data-game="owner"]');
    $('#owner-name').value = 'Tess';
    $('#casino-name').value = 'Test Palace';
    click('#owner-establish');
    expect($('#owner-summary-name').textContent).toContain('Test Palace');
    click('#reset-progress');
    expect($('#owner-summary-name').textContent).not.toContain('Test Palace');
    expect(errors).toEqual([]);
  });

  it('starts when browser storage access throws', () => {
    const errors = [];
    const virtualConsole = new VirtualConsole();
    virtualConsole.on('jsdomError', (error) => errors.push(error.message));
    const dom = new JSDOM(builtHtml, {
      url: 'http://localhost/',
      runScripts: 'dangerously',
      virtualConsole,
      beforeParse(window) {
        Object.defineProperty(window, 'localStorage', {
          get() {
            throw new window.DOMException('blocked', 'SecurityError');
          },
        });
      },
    });
    expect(errors).toEqual([]);
    expect(dom.window.document.querySelector('#save-status').textContent).toContain('unavailable');
  });

  it('generates a downloadable standalone document that re-opens and runs', () => {
    const { window } = openCasino();
    const downloaded = window.buildStandaloneHtmlDocument();
    expect(downloaded.match(/<\/script/gi)).toHaveLength(1);
    const reopened = openCasino(downloaded);
    expect(reopened.errors).toEqual([]);
    reopened.click('.nav-btn[data-game="roulette"]');
    const before = reopened.balance();
    reopened.click('#roulette-spin');
    expect(reopened.balance()).not.toBe(before);
    expect(reopened.errors).toEqual([]);
  });
});

describe('challenges, themes, and celebrations in the standalone app', () => {
  it('renders the starter challenge card and theme picker with native controls', () => {
    const { $, document, errors } = openCasino();
    expect(errors).toEqual([]);
    expect(document.querySelectorAll('#challenge-list li')).toHaveLength(3);
    expect(document.querySelectorAll('#challenge-list progress')).toHaveLength(3);
    expect($('#challenge-meter').textContent).toBe('0 / 3');
    const radios = [...document.querySelectorAll('#theme-picker input[type="radio"]')];
    expect(radios.map((radio) => radio.value)).toEqual(['neon', 'sunset', 'aurora', 'synthwave', 'gold']);
    expect(radios[0].checked).toBe(true);
    expect(radios.slice(1).every((radio) => radio.disabled)).toBe(true);
    expect(document.documentElement.dataset.theme).toBe('neon');
    expect($('#sound-toggle').checked).toBe(false);
    expect($('#effects-toggle').checked).toBe(true);
  });

  it('updates progress exactly once per settled round, even with repeated clicks', () => {
    const { $, click, goal, saved, window, errors } = openCasino();
    $('#stake-input').value = '1';

    click('.nav-btn[data-game="roulette"]');
    click('#roulette-spin');
    expect(goal('explorer').querySelector('progress').value).toBe(1);
    expect(saved().challenges.lastRoundId).toBe(1);

    // Blackjack: deal, then stand repeatedly; only one settlement may count.
    click('.nav-btn[data-game="blackjack"]');
    click('#blackjack-deal');
    click('#blackjack-stand');
    click('#blackjack-stand');
    click('#blackjack-hit');
    expect(saved().stats.rounds).toBe(2);
    expect(saved().challenges.lastRoundId).toBe(2);
    expect(goal('blackjackFinish').classList.contains('done')).toBe(true);
    expect(goal('explorer').querySelector('progress').value).toBe(2);
    expect(saved().challenges.completedTotal).toBe(1);
    expect(window.document.querySelector('#global-status').textContent).toContain('Challenge complete: Card sharp!');

    // Risk dice bust/bank buttons are disabled once settled; extra clicks are ignored.
    click('#dice-start');
    click('#dice-bank');
    click('#dice-bank');
    click('#dice-roll');
    expect(saved().stats.rounds).toBe(3);
    expect(saved().challenges.lastRoundId).toBe(3);
    expect($('#dice-status .result-badge').textContent).toBe('Stake back ±0');
    expect(goal('diceProfit').classList.contains('done')).toBe(false);
    expect(errors).toEqual([]);
  });

  it('does not duplicate completions or unlocks after a refresh', () => {
    const first = openCasino(builtHtml, {
      savedState: { playerChips: 400, stats: { rounds: 5 }, challenges: { completedTotal: 1, lastRoundId: 5, goals: [{ id: 'blackjackFinish' }, { id: 'scratchAll' }, { id: 'reelCurious' }] } },
    });
    first.$('#stake-input').value = '1';
    first.click('.nav-btn[data-game="blackjack"]');
    first.click('#blackjack-deal');
    first.click('#blackjack-stand');
    const afterFirst = first.saved();
    expect(afterFirst.challenges.completedTotal).toBe(2);
    expect(first.$('#global-status').textContent).toContain('New theme unlocked: Sunset Strip.');
    expect(first.$('#theme-picker input[value="sunset"]').disabled).toBe(false);

    const second = openCasino(builtHtml, { savedState: afterFirst });
    expect(second.errors).toEqual([]);
    expect(second.saved()).toEqual(afterFirst);
    expect(second.goal('blackjackFinish').classList.contains('done')).toBe(true);
    expect(second.$('#global-status').textContent).not.toContain('unlocked');
    second.click('.nav-btn[data-game="roulette"]');
    second.$('#stake-input').value = '1';
    second.click('#roulette-spin');
    expect(second.saved().challenges.completedTotal).toBe(2);
    expect(second.saved().stats.rounds).toBe(7);
  });

  it('loads old and malformed saves without losing chips', () => {
    const old = openCasino(builtHtml, { savedState: { playerChips: 321, stats: { rounds: 3 }, history: [] } });
    expect(old.errors).toEqual([]);
    expect(old.balance()).toBe(321);
    expect(old.$('#challenge-meter').textContent).toBe('0 / 3');

    const junk = openCasino(builtHtml, { savedState: { playerChips: 222, challenges: 'broken', cosmetics: { theme: '<script>' } } });
    expect(junk.errors).toEqual([]);
    expect(junk.balance()).toBe(222);
    expect(junk.document.documentElement.dataset.theme).toBe('neon');

    const corrupt = openCasino(builtHtml, { savedState: '{"version":2,' });
    expect(corrupt.errors).toEqual([]);
    expect(corrupt.balance()).toBe(750);
  });

  it('persists an unlocked theme selection and blocks locked ones', () => {
    const { $, document, saved, window } = openCasino(builtHtml, { savedState: { challenges: { completedTotal: 4 } } });
    expect($('#theme-picker input[value="aurora"]').disabled).toBe(false);
    expect($('#theme-picker input[value="synthwave"]').disabled).toBe(true);
    $('#theme-picker input[value="aurora"]').click();
    expect(document.documentElement.dataset.theme).toBe('aurora');
    expect(saved().cosmetics.theme).toBe('aurora');

    // A forged change event for a locked theme is rejected.
    const locked = $('#theme-picker input[value="gold"]');
    locked.disabled = false;
    locked.checked = true;
    locked.dispatchEvent(new window.Event('change', { bubbles: true }));
    expect(document.documentElement.dataset.theme).toBe('aurora');
    expect(saved().cosmetics.theme).toBe('aurora');
    expect($('#theme-picker input[value="gold"]').disabled).toBe(true);

    const reopened = openCasino(builtHtml, { savedState: saved() });
    expect(reopened.document.documentElement.dataset.theme).toBe('aurora');
    expect(reopened.$('#theme-picker input[value="aurora"]').checked).toBe(true);
  });

  it('keeps accounting identical across themes and shows clear win summaries', () => {
    const results = ['neon', 'gold'].map((theme) => {
      const casino = openCasino(builtHtml, { random: () => 0, savedState: { challenges: { completedTotal: 9 }, cosmetics: { theme } } });
      casino.$('#stake-input').value = '10';
      casino.click('#slots-spin');
      return casino;
    });
    for (const casino of results) {
      expect(casino.balance()).toBe(850);
      expect(casino.$('#slots-status .result-badge').textContent).toBe('Win +100');
      expect(casino.$('#slots-status').textContent).toContain('Staked 10 · Returned 110 · Net +100 chips');
      expect(casino.$('#slots-status').classList.contains('good')).toBe(true);
      const reels = [...casino.document.querySelectorAll('#slot-reels .slot-reel')].map((reel) => reel.getAttribute('aria-label'));
      expect(reels).toEqual(['crown', 'crown', 'crown']);
      expect(casino.saved().stats).toMatchObject({ rounds: 1, wins: 1, totalStaked: 10, totalReturned: 110 });
    }
  });

  it('marks losses clearly and never celebrates them', () => {
    const { $, click, document } = openCasino(builtHtml, { reducedMotion: false, random: () => 0.5 });
    $('#stake-input').value = '5';
    click('.nav-btn[data-game="keno"]');
    for (const value of [1, 2, 3, 4, 5]) click(`#keno-grid [data-value="${value}"]`);
    // With a constant RNG the draw picks the middle of the pool, which misses these picks.
    click('#keno-draw');
    expect($('#keno-status .result-badge').textContent).toBe('Loss −5');
    expect($('#keno-status').classList.contains('bad')).toBe(true);
    expect(document.querySelector('.confetti-layer')).toBeNull();
    expect($('#balance-delta').textContent).toBe('−5');
  });

  it('respects reduced motion and the effects toggle for celebrations', () => {
    const reduced = openCasino(builtHtml, { random: () => 0 });
    reduced.click('#slots-spin');
    expect(reduced.$('#slots-status .result-badge').textContent).toContain('Win');
    expect(reduced.document.querySelector('.confetti-layer')).toBeNull();
    expect(reduced.$('#slots-status').classList.contains('celebrate')).toBe(false);
    expect(reduced.$('#effects-note').textContent).toContain('reduced motion');

    const animated = openCasino(builtHtml, { reducedMotion: false, random: () => 0 });
    animated.click('#slots-spin');
    expect(animated.$('#slots-skip').hidden).toBe(false);
    animated.click('#slots-skip');
    const layer = animated.document.querySelector('#panel-slots .confetti-layer');
    expect(layer).not.toBeNull();
    expect(layer.getAttribute('aria-hidden')).toBe('true');
    expect(animated.$('#slots-status').classList.contains('celebrate')).toBe(true);
    animated.click('#slots-skip');
    expect(animated.saved().stats.rounds).toBe(1);

    const quiet = openCasino(builtHtml, { reducedMotion: false, random: () => 0 });
    quiet.click('#effects-toggle');
    expect(quiet.saved().cosmetics.effects).toBe(false);
    quiet.click('#slots-spin');
    quiet.click('#slots-skip');
    expect(quiet.document.querySelector('.confetti-layer')).toBeNull();
    expect(quiet.$('#slots-status .result-badge').textContent).toContain('Win');
  });

  it('keeps sound opt-in and safe when audio is unavailable', () => {
    const { $, click, saved, errors } = openCasino(builtHtml, { random: () => 0 });
    click('#sound-toggle');
    expect(saved().cosmetics.sound).toBe(true);
    click('#slots-spin');
    click('#sound-toggle');
    expect(saved().cosmetics.sound).toBe(false);
    expect($('#global-status').textContent).toContain('muted');
    expect(errors).toEqual([]);
  });

  it('lets the player start a new challenge set and resets challenges with all progress', () => {
    const { $, click, saved, document } = openCasino();
    const before = [...document.querySelectorAll('#challenge-list li')].map((item) => item.dataset.challenge);
    click('#challenge-new');
    const after = [...document.querySelectorAll('#challenge-list li')].map((item) => item.dataset.challenge);
    expect(after).toHaveLength(3);
    expect(after.some((id) => before.includes(id))).toBe(false);
    expect($('#challenge-set-label').textContent).toBe('Set 2');
    expect(saved().challenges.setNumber).toBe(2);

    click('#effects-toggle');
    click('#reset-progress');
    expect($('#challenge-set-label').textContent).toBe('Set 1');
    expect(saved().challenges.setNumber).toBe(1);
    expect(saved().cosmetics.effects).toBe(false);
  });

  it('free refill during an active round refunds once and does not count toward challenges', () => {
    const { $, click, saved, balance } = openCasino();
    $('#stake-input').value = '10';
    click('.nav-btn[data-game="roulette"]');
    click('#dice-start');
    expect(balance()).toBe(740);
    click('#refill-player');
    expect(balance()).toBe(750);
    expect(saved().stats.rounds).toBe(0);
    expect(saved().challenges.lastRoundId).toBe(0);
    expect($('#dice-roll').disabled).toBe(true);
  });
});

import fs from 'node:fs';
import path from 'node:path';
import { JSDOM, VirtualConsole } from 'jsdom';
import { describe, expect, it } from 'vitest';
import { buildStandaloneHtml } from '../src/build-standalone.js';

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const builtHtml = buildStandaloneHtml();

function inlineScriptSource(html) {
  const start = html.indexOf('<script>') + '<script>'.length;
  return html.slice(start, html.lastIndexOf('</script>'));
}

function openCasino(html = builtHtml) {
  const errors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', (error) => errors.push(error.message));
  const dom = new JSDOM(html, {
    url: 'http://localhost/',
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    virtualConsole,
    beforeParse(window) {
      window.matchMedia = () => ({ matches: true, addEventListener() {}, removeEventListener() {} });
    },
  });
  const { document } = dom.window;
  const $ = (selector) => document.querySelector(selector);
  const click = (selector) => $(selector).click();
  const balance = () => Number($('#player-balance').textContent.replace(/[^\d]/g, ''));
  return { dom, window: dom.window, document, errors, $, click, balance };
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

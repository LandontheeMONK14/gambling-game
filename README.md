# Lucky Cascade Casino (Play-Money Only)

A colorful, single-file browser casino arcade with **free fictional chips only**.

- No real-money wagers
- No purchases, wallets, or cash-out
- Chips have no monetary value; a free refill is always one click away

## Games

- **Machines:** Crystal Slots (3 uniform-random reels) and Scratch Cards (reveal 9 panels, best triple wins).
- **Cards:** Blackjack (dealer stands on 17, natural pays 3:2), Baccarat (standard draw rules, 5% banker commission, ties push non-tie bets), and Video Poker (five-card draw, Jacks or Better).
- **Tables:** Roulette (European single zero), Risk Dice (roll for rising multipliers or bank before busting), and Craps (pass / don't pass).
- **Numbers:** Keno (pick 5 of 20) and Speed Bingo (30-call limit; faster bingos pay more).
- **Sportsbook:** fictional horse races and arena matches.
- **Start My Casino:** an owner/management mode with a separate casino treasury.

## Fun extras

### Arcade challenge card (optional)

A short card of **3 goals** sits at the top of the sidebar (jump to it from the **Challenge card** meter in the header). Goals reward trying and learning the games, for example:

- Finish a round in 3 different games
- Complete a blackjack hand (any result counts)
- Bank a Risk Dice round with profit
- Try 2 different roulette bet types, both craps sides, or both sportsbook events
- Draw in video poker while holding at least one card

Any stake counts, even 1 chip. Progress does not depend on bet size, winning streaks, or long sessions. There are no timers, daily streaks, or expirations. Each goal shows a native progress bar and a ✓ when complete, and completions are announced to screen readers.

Press **Swap for a new challenge set** (or **Start new challenge set** once a card is cleared) whenever you like to draw 3 different goals from the pool of 13. Swapping an unfinished card discards that card's progress but keeps your lifetime total.

### Unlockable themes (cosmetic only)

Completing challenges unlocks visual themes. Pick one in **Style & effects**; your choice is saved.

| Theme | Unlocks after |
| --- | --- |
| Neon Cascade | default |
| Sunset Strip | 2 completed challenges |
| Aurora Lights | 4 |
| Synthwave Grid | 6 |
| Midnight Gold | 9 |

Themes only change colors. Odds, paytables, and chip accounting are identical in every theme, and no gameplay is ever locked.

### Round results and celebrations

- Every settled round shows a clear badge: **Win +N**, **Push ±0** / **Stake back ±0**, or **Loss −N**. Below it is the full math: `Staked · Returned · Net`. Labels are based on net chips, so getting your stake back is never shown as a win.
- The header shows a short balance change chip (+N / −N).
- Only rounds that finish ahead (or complete a challenge) get a brief confetti burst inside the game panel. It never flashes, never blocks clicks (`pointer-events: none`), and fades within about 1.5 s.
- **Celebration effects** can be switched off. With `prefers-reduced-motion`, confetti and pop animations are skipped automatically and results appear as static badges.
- **Sound effects** are **off by default**. Tick the checkbox to opt in; untick it to mute. Sound is never needed to understand a result.

## Economy rules

- Stakes must be whole-number chips and are deducted once when a round starts.
- Your player chip balance is shared across all games.
- Paytables show **profit multipliers**. On a win, total return is `stake + (stake × profit multiplier)`, rounded to the nearest chip where needed (e.g. blackjack natural 3:2, banker 0.95).
- Pushes return the original stake.
- **Free player refill** and **Reset all progress** always cancel and refund any active round safely.
- **Reset all progress** also resets the challenge card and theme unlocks (your effects/sound preferences are kept).

## Local persistence

The app stores a versioned save (`lucky-cascade-casino-v2`) in `localStorage`: chips, aggregate stats, recent results, owner mode, challenge progress, and cosmetic preferences. Older saves (including the legacy `neon-lucky-arcade-v1` arcade save) load with safe defaults for the newer fields. Malformed data is sanitized, and blocked storage falls back to in-memory play.

In-flight rounds are not persisted, which prevents reload-based duplicate payouts. Each settled round has an increasing id, so challenge progress and unlocks are applied exactly once, even after a refresh.

## Setup

```bash
npm install
npm run dev
```

## Build

Source lives in `src/` (`app-shell.html`, `styles.css`, `main.js`, `game/casino-engine.js`). The build inlines everything into identical standalone `index.html` and `casino.html` files. Do not edit those by hand.

```bash
npm run build
```

## Test

```bash
npm test
```

## Accessibility & controls

- Native buttons, radio buttons, checkboxes, and `<progress>` elements; everything works with the keyboard (Tab / Shift+Tab, Space / Enter, arrow keys inside the theme picker).
- ARIA live announcements for results, challenge completions, and theme unlocks.
- Respects `prefers-reduced-motion`; slot animation is skippable.
- Responsive layout down to small phones; works offline via `file://`.

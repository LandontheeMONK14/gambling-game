# Lucky Cascade Casino (Play-Money Only)

Lucky Cascade Casino is a **single-file, offline-capable casino simulator** built entirely around **free fictional chips**.

- No deposits
- No purchases
- No wallet connections
- No cash-out
- No real-money prizes

Everything in this repository is for local, fictional-chip play only.

## Download and run the standalone HTML

The full app is committed as:

- `/casino.html`
- `/index.html` (same standalone app)

To play offline:

1. Download `casino.html`
2. Open it directly in a browser with `file://`
3. No server, npm install, network access, sibling assets, or external fonts are required

Inside the app, the **Download HTML** button exports a fresh standalone `casino.html` document. It does **not** package your current save state into the download.

## Game catalog

The app includes these playable virtual-chip games:

### Machines
- **Crystal Slots** — 3 reels, uniform random symbols, transparent match-3 paytable
- **Scratch Cards** — reveal all 9 panels; highest triple pays once

### Card games
- **Blackjack** — finite shoe, dealer stands on all 17, no split/double/insurance, naturals pay 3:2
- **Baccarat** — standard drawing rules, player/banker/tie betting, banker commission, ties push non-tie bets
- **Video Poker** — simplified five-card draw / Jacks or Better, one draw only, visible paytable

### Table / dice games
- **Roulette** — single-zero wheel, straight/color/parity/dozen bets, correct zero behavior
- **Risk Dice** — press-your-luck progression with bank-or-bust flow
- **Craps** — pass line and don't pass only, correct come-out / point handling including bar-12 push

### Number games
- **Keno** — simplified pick-five format, 10 unique draws from 1–20
- **Speed Bingo** — 5×5 card, up to 30 calls, faster wins pay more

### Fictional event wagering
- **Sportsbook** — generated horse races and arena matches with fictional entrants/teams only; betting closes before outcomes run

## Owner mode: “Start My Casino”

The app includes a casino-owner simulation with separate business finances.

You can:

- establish an owner and casino name
- transfer chips explicitly between **player chips** and **casino funds**
- install attractions/tables/machines
- hire staff
- buy upgrades
- tune marketing, hospitality, and maintenance settings
- run simulated business days

Daily results show:

- visitors
- revenue
- expenses
- profit/loss
- lifetime progression
- unlock level

Purchases, staffing, upgrades, and settings all affect the business-day simulation. You cannot spend more chips than the player or casino currently has.

## Save behavior

The app attempts to save locally in `localStorage` using a versioned save.

- Existing legacy arcade saves are migrated when possible
- Corrupt or blocked storage falls back gracefully to memory-only play
- Active in-progress rounds are **not** saved, which avoids duplicate payouts on reload
- Saves are local to the specific browser/profile/location that opened the file

### `file://` note

Some browsers treat `localStorage` differently for local files. If storage is blocked for `file://`, the app still works, but progress only lasts for that open session.

## Accessibility and UI

- No emoji-based game visuals
- Inline SVG / CSS visuals for reels, cards, dice, and results
- Keyboard-focus styling and native controls
- Live result/status regions
- Responsive layout for desktop/mobile
- Reduced-motion support
- No required waiting for animations; slots can be skipped

## Development

Install dependencies:

```bash
npm install
```

Generate the standalone artifacts:

```bash
npm run build
```

This writes:

- `index.html`
- `casino.html`
- `dist/index.html`
- `dist/casino.html`

## Testing

Run the deterministic rules/build tests with:

```bash
npm test
```

The test suite covers:

- stake validation and payout rounding
- roulette zero handling
- baccarat commission and tie pushes
- craps point transitions
- video poker evaluation
- keno uniqueness
- scratch single-settlement protection
- owner-mode simulation and transfers
- persistence migration/fallback
- standalone HTML packaging checks

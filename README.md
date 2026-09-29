# Neon Lucky Arcade (Play-Money Only)

A colorful browser arcade with **free virtual chips only**.

- No real-money wagers
- No purchases, wallets, or cash-out
- Chips have no monetary value

## Games

1. **Neon Slots**: 3 uniform-random reels, transparent paytable.
2. **Blackjack**: hit/stand versus dealer, ace-aware scoring, naturals, busts, pushes.
3. **Risk Dice**: roll for increasing profit multipliers, or bank before busting.

## Economy rules

- Wagers must be whole-number chips.
- Your chip balance is shared across all games.
- Bets are deducted when a round starts.
- Paytables show **profit multipliers**.
- On a win, total return is: `stake + (stake × profit multiplier)` (rounded to nearest chip where needed, e.g. blackjack natural 3:2).
- Pushes return the original stake.
- Free refill/reset is always available and cancels/refunds any active round safely.

## Local persistence

The app stores a versioned local save (`balance`, aggregate stats, achievements, recent rounds) in `localStorage` with recovery for malformed/unavailable storage.
In-flight rounds are not persisted, preventing reload-based duplicate payouts.

## Setup

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Test

```bash
npm run test
```

## Accessibility

- Keyboard-friendly native controls
- ARIA live status announcements
- Respect for `prefers-reduced-motion`
- Skippable slot animation

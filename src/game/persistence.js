import { normalizeBalance } from './wager.js';

export const STORAGE_VERSION = 1;
export const STORAGE_KEY = `neon-lucky-arcade-v${STORAGE_VERSION}`;
export const STARTING_CHIPS = 500;

export const DEFAULT_PERSISTED_STATE = {
  balance: STARTING_CHIPS,
  stats: {
    rounds: 0,
    wins: 0,
    losses: 0,
    pushes: 0,
    totalWagered: 0,
    totalReturned: 0,
  },
  achievements: {
    firstWin: false,
    slotMaster: false,
    blackjackNatural: false,
    diceDaredevil: false,
  },
  recentResults: [],
};

function cloneDefault() {
  return JSON.parse(JSON.stringify(DEFAULT_PERSISTED_STATE));
}

export function sanitizePersistedState(raw) {
  const safe = cloneDefault();
  if (!raw || typeof raw !== 'object') return safe;

  safe.balance = normalizeBalance(raw.balance);

  const stats = raw.stats ?? {};
  for (const key of Object.keys(safe.stats)) {
    const value = Number(stats[key]);
    safe.stats[key] = Number.isFinite(value) && value >= 0 ? Math.round(value) : safe.stats[key];
  }

  const achievements = raw.achievements ?? {};
  for (const key of Object.keys(safe.achievements)) {
    safe.achievements[key] = Boolean(achievements[key]);
  }

  if (Array.isArray(raw.recentResults)) {
    safe.recentResults = raw.recentResults
      .slice(0, 10)
      .filter((entry) => entry && typeof entry === 'object')
      .map((entry) => ({
        game: String(entry.game ?? 'Unknown').slice(0, 20),
        outcome: String(entry.outcome ?? 'unknown').slice(0, 20),
        delta: Number.isFinite(Number(entry.delta)) ? Math.round(Number(entry.delta)) : 0,
        text: String(entry.text ?? '').slice(0, 120),
      }));
  }

  return safe;
}

export function createPersistence(storage) {
  function safeGetStorage() {
    if (!storage) return null;
    try {
      const probe = '__neon_probe__';
      storage.setItem(probe, '1');
      storage.removeItem(probe);
      return storage;
    } catch {
      return null;
    }
  }

  return {
    load() {
      const safeStorage = safeGetStorage();
      if (!safeStorage) return cloneDefault();

      try {
        const raw = safeStorage.getItem(STORAGE_KEY);
        if (!raw) return cloneDefault();
        const parsed = JSON.parse(raw);
        if (!parsed || parsed.version !== STORAGE_VERSION) return cloneDefault();
        return sanitizePersistedState(parsed.state);
      } catch {
        return cloneDefault();
      }
    },

    save(state) {
      const safeStorage = safeGetStorage();
      if (!safeStorage) return false;

      try {
        const payload = {
          version: STORAGE_VERSION,
          state: sanitizePersistedState(state),
        };
        safeStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        return true;
      } catch {
        return false;
      }
    },
  };
}

export const browserPersistence = createPersistence(
  typeof window !== 'undefined' ? window.localStorage : null,
);

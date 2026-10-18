// Local game history and personal best, stored in localStorage.
// All storage access lives here. No DOM; the store can be injected for tests.

import { TOTAL_LEVELS } from '../game/engine';

export const HISTORY_KEY = 'simon.gameHistory.v1';
export const BEST_SCORE_KEY = 'simon.bestScore.v1';

export type GameResult = 'won' | 'lost';

export interface GameRecord {
  id: string;
  endedAt: string; // ISO 8601
  score: number;
  finalLevel: number; // 10 on a win, the level of the mistake on a loss
  result: GameResult;
}

export type KeyValueStore = Pick<Storage, 'getItem' | 'setItem'>;

export type HistoryLoad = { ok: true; records: GameRecord[] } | { ok: false };

// Accessing window.localStorage itself can throw (e.g. blocked site data).
function defaultStore(): KeyValueStore {
  return globalThis.localStorage;
}

function isRecord(value: unknown): value is GameRecord {
  if (typeof value !== 'object' || value === null) return false;
  const r = value as Record<string, unknown>;
  return (
    typeof r.id === 'string' &&
    typeof r.endedAt === 'string' &&
    !Number.isNaN(Date.parse(r.endedAt)) &&
    Number.isInteger(r.score) &&
    (r.score as number) >= 0 &&
    Number.isInteger(r.finalLevel) &&
    (r.finalLevel as number) >= 1 &&
    (r.finalLevel as number) <= TOTAL_LEVELS &&
    (r.result === 'won' || r.result === 'lost')
  );
}

// Invalid JSON or a non-array value counts as empty history; malformed entries are dropped.
function parseHistory(raw: string | null): GameRecord[] {
  if (raw === null) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  return Array.isArray(parsed) ? parsed.filter(isRecord) : [];
}

function newestFirst(records: GameRecord[]): GameRecord[] {
  return [...records].sort((a, b) => Date.parse(b.endedAt) - Date.parse(a.endedAt));
}

function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function loadHistory(store?: KeyValueStore): HistoryLoad {
  try {
    const s = store ?? defaultStore();
    return { ok: true, records: newestFirst(parseHistory(s.getItem(HISTORY_KEY))) };
  } catch {
    return { ok: false };
  }
}

// Highest score among saved games (and the stored best); null when storage is unreachable.
export function loadBestScore(store?: KeyValueStore): number | null {
  try {
    const s = store ?? defaultStore();
    const stored = Number(s.getItem(BEST_SCORE_KEY));
    const fromHistory = parseHistory(s.getItem(HISTORY_KEY)).map((r) => r.score);
    const candidates = [...fromHistory, Number.isInteger(stored) && stored >= 0 ? stored : 0];
    return Math.max(0, ...candidates);
  } catch {
    return null;
  }
}

// Appends a finished game. Returns true only if the history was actually written.
export function saveGame(
  game: { score: number; finalLevel: number; result: GameResult; endedAt?: string },
  store?: KeyValueStore,
): boolean {
  try {
    const s = store ?? defaultStore();
    // A corrupted history value is replaced by a fresh list holding this game.
    const records = parseHistory(s.getItem(HISTORY_KEY));
    const record: GameRecord = {
      id: createId(),
      endedAt: game.endedAt ?? new Date().toISOString(),
      score: game.score,
      finalLevel: game.finalLevel,
      result: game.result,
    };
    s.setItem(HISTORY_KEY, JSON.stringify([...records, record]));

    try {
      const best = loadBestScore(s) ?? 0;
      if (record.score >= best) s.setItem(BEST_SCORE_KEY, String(record.score));
    } catch {
      // The game itself is saved; the best score is also derived from history.
    }
    return true;
  } catch {
    return false;
  }
}

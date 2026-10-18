import { describe, expect, it } from 'vitest';
import {
  BEST_SCORE_KEY,
  HISTORY_KEY,
  loadBestScore,
  loadHistory,
  saveGame,
  type KeyValueStore,
} from './history';

// In-memory store with the same getItem/setItem behaviour as localStorage.
function memoryStore(initial: Record<string, string> = {}): KeyValueStore & {
  data: Record<string, string>;
} {
  const data = { ...initial };
  return {
    data,
    getItem: (key) => (key in data ? data[key] : null),
    setItem: (key, value) => {
      data[key] = String(value);
    },
  };
}

const blockedStore: KeyValueStore = {
  getItem: () => {
    throw new Error('SecurityError');
  },
  setItem: () => {
    throw new Error('SecurityError');
  },
};

function fullStore(): KeyValueStore {
  const store = memoryStore();
  store.setItem = () => {
    throw new DOMException('quota', 'QuotaExceededError');
  };
  return store;
}

describe('saveGame', () => {
  it('stores a lost game with all required fields', () => {
    const store = memoryStore();
    const endedAt = '2026-10-18T14:32:00.000Z';
    expect(saveGame({ score: 7, finalLevel: 4, result: 'lost', endedAt }, store)).toBe(true);

    const load = loadHistory(store);
    expect(load.ok).toBe(true);
    if (!load.ok) return;
    expect(load.records).toHaveLength(1);
    expect(load.records[0]).toMatchObject({ score: 7, finalLevel: 4, result: 'lost', endedAt });
    expect(typeof load.records[0].id).toBe('string');
  });

  it('stores a won game at level 10', () => {
    const store = memoryStore();
    saveGame({ score: 55, finalLevel: 10, result: 'won' }, store);
    const load = loadHistory(store);
    expect(load.ok && load.records[0]).toMatchObject({ score: 55, finalLevel: 10, result: 'won' });
  });

  it('keeps a partial-level score as given', () => {
    const store = memoryStore();
    // Levels 1-2 complete (1 + 2) plus 2 correct presses in level 3.
    saveGame({ score: 5, finalLevel: 3, result: 'lost' }, store);
    expect(loadBestScore(store)).toBe(5);
  });

  it('updates the stored best only when the new score is higher', () => {
    const store = memoryStore();
    saveGame({ score: 6, finalLevel: 3, result: 'lost' }, store);
    expect(store.data[BEST_SCORE_KEY]).toBe('6');
    saveGame({ score: 2, finalLevel: 2, result: 'lost' }, store);
    expect(store.data[BEST_SCORE_KEY]).toBe('6');
    saveGame({ score: 10, finalLevel: 4, result: 'lost' }, store);
    expect(store.data[BEST_SCORE_KEY]).toBe('10');
    expect(loadBestScore(store)).toBe(10);
  });

  it('returns false when storage is blocked', () => {
    expect(saveGame({ score: 3, finalLevel: 2, result: 'lost' }, blockedStore)).toBe(false);
  });

  it('returns false when storage is full', () => {
    const store = fullStore();
    expect(saveGame({ score: 3, finalLevel: 2, result: 'lost' }, store)).toBe(false);
    const load = loadHistory(store);
    expect(load.ok && load.records).toEqual([]);
  });

  it('replaces corrupted history with a fresh list', () => {
    const store = memoryStore({ [HISTORY_KEY]: '{not json' });
    expect(saveGame({ score: 1, finalLevel: 1, result: 'lost' }, store)).toBe(true);
    const load = loadHistory(store);
    expect(load.ok && load.records).toHaveLength(1);
  });
});

describe('loadHistory', () => {
  it('returns an empty list when nothing is saved', () => {
    expect(loadHistory(memoryStore())).toEqual({ ok: true, records: [] });
    expect(loadBestScore(memoryStore())).toBe(0);
  });

  it('sorts newest first', () => {
    const store = memoryStore();
    saveGame({ score: 1, finalLevel: 1, result: 'lost', endedAt: '2026-01-01T10:00:00Z' }, store);
    saveGame({ score: 3, finalLevel: 2, result: 'lost', endedAt: '2026-03-01T10:00:00Z' }, store);
    saveGame({ score: 2, finalLevel: 2, result: 'lost', endedAt: '2026-02-01T10:00:00Z' }, store);
    const load = loadHistory(store);
    expect(load.ok && load.records.map((r) => r.score)).toEqual([3, 2, 1]);
  });

  it('ignores invalid JSON and non-array values', () => {
    expect(loadHistory(memoryStore({ [HISTORY_KEY]: '{oops' }))).toEqual({ ok: true, records: [] });
    expect(loadHistory(memoryStore({ [HISTORY_KEY]: '{"a":1}' }))).toEqual({ ok: true, records: [] });
  });

  it('drops malformed records', () => {
    const valid = { id: 'a', endedAt: '2026-01-01T10:00:00Z', score: 4, finalLevel: 3, result: 'lost' };
    const raw = JSON.stringify([
      valid,
      { ...valid, id: 'b', result: 'success' },
      { ...valid, id: 'c', score: -1 },
      { ...valid, id: 'd', finalLevel: 11 },
      { ...valid, id: 'e', endedAt: 'yesterday' },
      { ...valid, id: 'f', score: '9' },
      null,
    ]);
    const store = memoryStore({ [HISTORY_KEY]: raw, [BEST_SCORE_KEY]: 'abc' });
    const load = loadHistory(store);
    expect(load.ok && load.records.map((r) => r.id)).toEqual(['a']);
    expect(loadBestScore(store)).toBe(4);
  });

  it('reports unavailable storage', () => {
    expect(loadHistory(blockedStore)).toEqual({ ok: false });
    expect(loadBestScore(blockedStore)).toBeNull();
  });
});

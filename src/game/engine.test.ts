import { describe, expect, it } from 'vitest';
import {
  COLORS,
  TOTAL_LEVELS,
  createIdleState,
  finishShowing,
  nextLevel,
  pressColor,
  startGame,
  type Color,
  type GameState,
  type RandomFn,
} from './engine';

// Deterministic random: cycles through blue, red, yellow, green.
function cyclingRandom(): RandomFn {
  let i = 0;
  return () => (i++ % COLORS.length) / COLORS.length;
}

function wrongColor(color: Color): Color {
  return COLORS.find((c) => c !== color)!;
}

// Reproduces the whole sequence of the current level.
function playLevel(state: GameState) {
  let current = finishShowing(state);
  let outcome = 'ignored';
  for (const color of current.sequence) {
    ({ state: current, outcome } = pressColor(current, color));
  }
  return { state: current, outcome };
}

describe('startGame', () => {
  it('starts from a reset state with one color', () => {
    const state = startGame(cyclingRandom());
    expect(state).toEqual({
      phase: 'showing-sequence',
      sequence: ['blue'],
      level: 1,
      inputIndex: 0,
      score: 0,
    });
  });

  it('resets everything after a previous game', () => {
    const random = cyclingRandom();
    let state = startGame(random);
    state = playLevel(state).state;
    state = nextLevel(state, random);
    state = pressColor(finishShowing(state), 'green').state; // wrong press
    expect(state.phase).toBe('failed');

    const fresh = startGame(random);
    expect(fresh.score).toBe(0);
    expect(fresh.level).toBe(1);
    expect(fresh.sequence).toHaveLength(1);
  });

  it('idle state is empty', () => {
    expect(createIdleState()).toMatchObject({ phase: 'idle', sequence: [], score: 0 });
  });
});

describe('nextLevel', () => {
  it('adds exactly one color and keeps the previous ones in order', () => {
    const random = cyclingRandom();
    let state = startGame(random);
    for (let level = 1; level < 5; level++) {
      const before = playLevel(state).state;
      state = nextLevel(before, random);
      expect(state.sequence).toHaveLength(level + 1);
      expect(state.sequence.slice(0, level)).toEqual(before.sequence);
      expect(state.level).toBe(level + 1);
      expect(state.phase).toBe('showing-sequence');
    }
  });

  it('does nothing before the level is complete', () => {
    const state = finishShowing(startGame(cyclingRandom()));
    expect(nextLevel(state)).toBe(state);
  });
});

describe('pressColor', () => {
  it('ignores presses outside of awaiting-input', () => {
    const showing = startGame(cyclingRandom());
    expect(pressColor(showing, 'blue')).toEqual({ state: showing, outcome: 'ignored' });

    const idle = createIdleState();
    expect(pressColor(idle, 'blue').outcome).toBe('ignored');

    const failed = pressColor(finishShowing(showing), 'red').state;
    expect(pressColor(failed, 'blue')).toEqual({ state: failed, outcome: 'ignored' });
  });

  it('a correct press adds a point', () => {
    const random = cyclingRandom();
    let state = playLevel(startGame(random)).state;
    state = finishShowing(nextLevel(state, random));
    const result = pressColor(state, state.sequence[0]);
    expect(result.outcome).toBe('correct');
    expect(result.state.score).toBe(2);
  });

  it('a wrong press ends the game immediately', () => {
    const state = finishShowing(startGame(cyclingRandom()));
    const result = pressColor(state, wrongColor(state.sequence[0]));
    expect(result.outcome).toBe('failed');
    expect(result.state.phase).toBe('failed');
    expect(result.state.score).toBe(0);
  });

  it('counts correct presses in an unfinished level', () => {
    const random = cyclingRandom();
    let state = startGame(random);
    state = nextLevel(playLevel(state).state, random); // level 1 done: 1 point
    state = nextLevel(playLevel(state).state, random); // level 2 done: 2 points
    state = finishShowing(state); // level 3
    state = pressColor(state, state.sequence[0]).state;
    state = pressColor(state, state.sequence[1]).state;
    const result = pressColor(state, wrongColor(state.sequence[2]));
    expect(result.outcome).toBe('failed');
    expect(result.state.score).toBe(5);
    expect(result.state.level).toBe(3);
  });

  it('extra presses after the level is complete are ignored', () => {
    const { state, outcome } = playLevel(startGame(cyclingRandom()));
    expect(outcome).toBe('level-complete');
    expect(pressColor(state, 'blue')).toEqual({ state, outcome: 'ignored' });
  });
});

describe('full game', () => {
  it('wins after level 10 with 55 points and no level 11', () => {
    const random = cyclingRandom();
    let state = startGame(random);
    for (let level = 1; level <= TOTAL_LEVELS; level++) {
      const result = playLevel(state);
      if (level < TOTAL_LEVELS) {
        expect(result.outcome).toBe('level-complete');
        state = nextLevel(result.state, random);
      } else {
        expect(result.outcome).toBe('won');
        state = result.state;
      }
    }
    expect(state.phase).toBe('won');
    expect(state.level).toBe(10);
    expect(state.score).toBe(55);
    expect(nextLevel(state, random)).toBe(state);
  });
});

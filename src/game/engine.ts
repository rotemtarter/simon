// Pure Simon game rules: no DOM, no timers, no audio.
// Every function returns a new state and never mutates its input.

export const COLORS = ['blue', 'red', 'yellow', 'green'] as const;
export type Color = (typeof COLORS)[number];

export const TOTAL_LEVELS = 10;

export type Phase = 'idle' | 'showing-sequence' | 'awaiting-input' | 'failed' | 'won';

export interface GameState {
  readonly phase: Phase;
  readonly sequence: readonly Color[];
  readonly level: number;
  readonly inputIndex: number;
  readonly score: number;
}

export type PressOutcome = 'ignored' | 'correct' | 'level-complete' | 'won' | 'failed';

// Returns a number in [0, 1), like Math.random.
export type RandomFn = () => number;

function randomColor(random: RandomFn): Color {
  const index = Math.min(COLORS.length - 1, Math.floor(random() * COLORS.length));
  return COLORS[index];
}

export function createIdleState(): GameState {
  return { phase: 'idle', sequence: [], level: 0, inputIndex: 0, score: 0 };
}

export function startGame(random: RandomFn = Math.random): GameState {
  return {
    phase: 'showing-sequence',
    sequence: [randomColor(random)],
    level: 1,
    inputIndex: 0,
    score: 0,
  };
}

export function finishShowing(state: GameState): GameState {
  if (state.phase !== 'showing-sequence') return state;
  return { ...state, phase: 'awaiting-input', inputIndex: 0 };
}

export function pressColor(
  state: GameState,
  color: Color,
): { state: GameState; outcome: PressOutcome } {
  // Input is only accepted while the player reproduces the sequence and the level is not done yet.
  if (state.phase !== 'awaiting-input' || state.inputIndex >= state.sequence.length) {
    return { state, outcome: 'ignored' };
  }

  if (state.sequence[state.inputIndex] !== color) {
    return { state: { ...state, phase: 'failed' }, outcome: 'failed' };
  }

  const next: GameState = { ...state, inputIndex: state.inputIndex + 1, score: state.score + 1 };

  if (next.inputIndex < next.sequence.length) {
    return { state: next, outcome: 'correct' };
  }
  if (next.level >= TOTAL_LEVELS) {
    return { state: { ...next, phase: 'won' }, outcome: 'won' };
  }
  return { state: next, outcome: 'level-complete' };
}

export function nextLevel(state: GameState, random: RandomFn = Math.random): GameState {
  const levelDone =
    state.phase === 'awaiting-input' && state.inputIndex === state.sequence.length;
  if (!levelDone || state.level >= TOTAL_LEVELS) return state;
  return {
    ...state,
    phase: 'showing-sequence',
    sequence: [...state.sequence, randomColor(random)],
    level: state.level + 1,
    inputIndex: 0,
  };
}

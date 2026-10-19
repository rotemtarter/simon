import { icons } from '../ui/icons';
import { art } from '../ui/art';
import { ROUTES } from '../routes';
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
} from '../game/engine';
import { playColor, playFailure, playSuccess, playVictory, unlockAudio } from '../game/audio';
import { loadBestScore, saveGame } from '../storage/history';
import { setGameActive } from '../game/activity';
import type { Screen } from '../router';

// Timing (ms).
const SEQUENCE_START_DELAY = 600;
const SEQUENCE_LIGHT_ON = 550;
const SEQUENCE_GAP = 250;
const PRESS_LIGHT_ON = 250;
const RESULT_DELAY = 300;
const SUCCESS_DURATION = 1000;

const COLOR_LABELS: Record<Color, string> = {
  blue: 'כחול',
  red: 'אדום',
  yellow: 'צהוב',
  green: 'ירוק',
};

const boardMarkup = `
  <div class="board" role="group" aria-label="לוח המשחק">
    ${COLORS.map(
      (color) =>
        `<button class="tile tile--${color}" type="button" data-color="${color}" aria-label="${COLOR_LABELS[color]}" disabled></button>`,
    ).join('')}
  </div>`;

function feedbackMarkup(options: {
  kind: 'success' | 'failed' | 'won';
  icon: string;
  title: string;
  text: string;
  scoreLabel: string;
  score: number;
  withButton: boolean;
  note?: string;
}): string {
  const fireworks =
    options.kind === 'won'
      ? `<div class="fireworks" aria-hidden="true">${'<span></span>'.repeat(8)}</div>`
      : '';
  const button = options.withButton
    ? `<button class="btn-primary" type="button" data-action="start">התחל משחק חדש</button>`
    : '';
  return `
    <section class="feedback feedback--${options.kind}">
      ${fireworks}
      <div class="feedback__badge" aria-hidden="true">${options.icon}</div>
      <h2 class="feedback__title">${options.title}</h2>
      <p class="feedback__text">${options.text}</p>
      <hr class="feedback__divider" />
      <p class="feedback__label">${options.scoreLabel}</p>
      <p class="feedback__score">${options.score}</p>
      ${options.note ? `<p class="feedback__note" role="status">${options.note}</p>` : ''}
      ${button}
    </section>`;
}

const SAVE_FAILED_NOTE = 'לא ניתן לשמור את התוצאה במכשיר זה';
const NO_SOUND_NOTE = 'הצלילים אינם זמינים במכשיר זה';

export function renderHome(): Screen {
  const screen = document.createElement('div');
  screen.className = 'screen screen--home';
  screen.innerHTML = `
    <div class="home-decor" aria-hidden="true">
      <span class="planet planet--ringed home-decor__planet"></span>
      ${art.astronaut('home-decor__astronaut')}
    </div>

    <header class="top-bar">
      <a class="best-link" href="${ROUTES.aboutBest}">
        ${icons.trophy}
        <span class="best-link__text">
          <span class="best-link__label">השיא האישי</span>
          <span class="best-link__value"></span>
        </span>
      </a>
      <a class="icon-link icon-link--badge" href="${ROUTES.about}" aria-label="אודות">${icons.infoBadge}</a>
    </header>

    <main class="home-main">
      <h1 class="visually-hidden">סיימון</h1>
      <div class="game-area"></div>
      <p class="visually-hidden" aria-live="polite"></p>
    </main>

    <nav class="bottom-nav" aria-label="ניווט ראשי">
      <a class="bottom-nav__item" href="${ROUTES.about}">${icons.infoBadge}<span>אודות</span></a>
      <a class="bottom-nav__item" href="${ROUTES.aboutBest}">${icons.trophy}<span>השיא שלי</span></a>
    </nav>
  `;

  const area = screen.querySelector<HTMLElement>('.game-area')!;
  const announcer = screen.querySelector<HTMLElement>('[aria-live]')!;

  let state: GameState = createIdleState();
  // Guards against saving the same game twice.
  let resultSaved = false;
  let saveFailed = false;
  let soundAvailable = true;
  const timers = new Set<number>();

  function later(fn: () => void, ms: number): void {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  }

  function clearTimers(): void {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  }

  function announce(text: string): void {
    announcer.textContent = text;
  }

  function tile(color: Color): HTMLButtonElement | null {
    return area.querySelector<HTMLButtonElement>(`.tile[data-color="${color}"]`);
  }

  function lightTile(color: Color, ms: number): void {
    const el = tile(color);
    if (!el) return;
    el.classList.add('is-lit');
    later(() => el.classList.remove('is-lit'), ms);
  }

  // null = storage unavailable.
  function updateBestLink(best: number | null): void {
    const text = best === null ? '—' : String(best);
    screen.querySelector('.best-link__value')!.textContent = text;
    screen.querySelector('.best-link')!.setAttribute('aria-label', `השיא האישי: ${text}`);
  }

  function saveResult(): void {
    if (resultSaved) return;
    resultSaved = true;
    const saved = saveGame({
      score: state.score,
      finalLevel: state.level,
      result: state.phase === 'won' ? 'won' : 'lost',
    });
    saveFailed = !saved;
    if (saved) updateBestLink(loadBestScore());
  }

  function setPlaying(playing: boolean): void {
    screen.classList.toggle('is-playing', playing);
  }

  // ---------- Views ----------

  function showIdle(): void {
    setPlaying(false);
    area.innerHTML = `
      ${boardMarkup}
      <button class="btn-primary" type="button" data-action="start">
        ${icons.play}
        <span>התחל</span>
      </button>`;
  }

  // Board view used both while the sequence is shown and during the player's turn.
  function showBoard(): void {
    setPlaying(true);
    area.innerHTML = `
      <p class="level-label">שלב ${state.level} מתוך ${TOTAL_LEVELS}</p>
      ${boardMarkup}
      <p class="hint">${icons.speaker}<span class="hint__text"></span></p>
      ${soundAvailable ? '' : `<p class="sound-note" role="status">${NO_SOUND_NOTE}</p>`}`;
    updateBoard();
  }

  function updateBoard(): void {
    const listening = state.phase === 'showing-sequence';
    const board = area.querySelector<HTMLElement>('.board');
    board?.classList.toggle('board--input', !listening);
    area.querySelectorAll<HTMLButtonElement>('.tile').forEach((el) => {
      el.disabled = state.phase !== 'awaiting-input';
    });
    const hint = area.querySelector<HTMLElement>('.hint__text');
    const text = listening ? 'הקשב לצלילים ולצבעים' : 'שחזר את הרצף';
    if (hint) hint.textContent = text;
    announce(`שלב ${state.level} מתוך ${TOTAL_LEVELS}. ${text}`);
  }

  function showFeedback(kind: 'success' | 'failed' | 'won'): void {
    setPlaying(true);
    const content = {
      success: { icon: icons.check, title: 'כל הכבוד!', text: 'השלמת את השלב', scoreLabel: 'ניקוד נוכחי' },
      failed: { icon: icons.close, title: 'נסה שוב!', text: 'הסתיים המשחק', scoreLabel: 'ניקוד סופי' },
      won: { icon: icons.star, title: 'ניצחת!', text: `השלמת את כל ${TOTAL_LEVELS} השלבים`, scoreLabel: 'ניקוד סופי' },
    }[kind];
    area.innerHTML = feedbackMarkup({
      kind,
      ...content,
      score: state.score,
      withButton: kind !== 'success',
      note: kind !== 'success' && saveFailed ? SAVE_FAILED_NOTE : undefined,
    });
    const note = kind !== 'success' && saveFailed ? ` ${SAVE_FAILED_NOTE}` : '';
    announce(`${content.title} ${content.text}. ${content.scoreLabel}: ${state.score}.${note}`);
    area.querySelector<HTMLButtonElement>('[data-action="start"]')?.focus({ preventScroll: true });
  }

  // ---------- Game flow ----------

  function playSequence(): void {
    const step = SEQUENCE_LIGHT_ON + SEQUENCE_GAP;
    state.sequence.forEach((color, i) => {
      later(() => {
        lightTile(color, SEQUENCE_LIGHT_ON);
        playColor(color, SEQUENCE_LIGHT_ON);
      }, i * step);
    });
    later(() => {
      state = finishShowing(state);
      updateBoard();
    }, state.sequence.length * step - SEQUENCE_GAP);
  }

  function beginLevel(): void {
    showBoard();
    later(playSequence, SEQUENCE_START_DELAY);
  }

  function start(): void {
    soundAvailable = unlockAudio();
    setGameActive(true);
    clearTimers();
    state = startGame();
    resultSaved = false;
    saveFailed = false;
    beginLevel();
  }

  function press(color: Color): void {
    // Each tap is a user gesture: re-wake audio if the phone suspended it.
    unlockAudio();
    const result = pressColor(state, color);
    if (result.outcome === 'ignored') return;
    state = result.state;

    lightTile(color, PRESS_LIGHT_ON);
    playColor(color, PRESS_LIGHT_ON);

    if (result.outcome === 'correct') return;
    if (result.outcome === 'failed' || result.outcome === 'won') saveResult();

    // Level finished or game over: block further input until the result is shown.
    area.querySelectorAll<HTMLButtonElement>('.tile').forEach((el) => (el.disabled = true));

    later(() => {
      if (result.outcome === 'failed') {
        showFeedback('failed');
        playFailure();
        setGameActive(false);
      } else if (result.outcome === 'won') {
        showFeedback('won');
        playVictory();
        setGameActive(false);
      } else {
        showFeedback('success');
        playSuccess();
        later(() => {
          state = nextLevel(state);
          beginLevel();
        }, SUCCESS_DURATION);
      }
    }, RESULT_DELAY);
  }

  area.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    if (target.closest('[data-action="start"]')) {
      start();
      return;
    }
    const tileEl = target.closest<HTMLButtonElement>('.tile');
    if (tileEl && !tileEl.disabled) {
      press(tileEl.dataset.color as Color);
    }
  });

  updateBestLink(loadBestScore());
  showIdle();

  return {
    element: screen,
    destroy: () => {
      clearTimers();
      setGameActive(false);
    },
  };
}

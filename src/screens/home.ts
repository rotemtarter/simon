import { icons } from '../ui/icons';
import { art } from '../ui/art';
import { ROUTES } from '../routes';

// Placeholders until game state (Milestone 2) and storage (Milestone 3) exist.
const BEST_SCORE = 0;
const CURRENT_LEVEL = 1;
const TOTAL_LEVELS = 10;

export function renderHome(): HTMLElement {
  const screen = document.createElement('div');
  screen.className = 'screen screen--home';
  screen.innerHTML = `
    <div class="home-decor" aria-hidden="true">
      <span class="planet planet--ringed home-decor__planet"></span>
      ${art.astronaut('home-decor__astronaut')}
    </div>

    <header class="top-bar">
      <a class="best-link" href="${ROUTES.aboutBest}" aria-label="השיא האישי: ${BEST_SCORE}">
        ${icons.trophy}
        <span class="best-link__text">
          <span class="best-link__label">השיא האישי</span>
          <span class="best-link__value">${BEST_SCORE}</span>
        </span>
      </a>
      <a class="icon-link icon-link--badge" href="${ROUTES.about}" aria-label="אודות">${icons.infoBadge}</a>
    </header>

    <main class="home-main">
      <h1 class="visually-hidden">סיימון</h1>
      <p class="level-label">שלב ${CURRENT_LEVEL} מתוך ${TOTAL_LEVELS}</p>
      <div class="board" role="group" aria-label="לוח המשחק">
        <button class="tile tile--blue" type="button" aria-label="כחול" disabled></button>
        <button class="tile tile--red" type="button" aria-label="אדום" disabled></button>
        <button class="tile tile--yellow" type="button" aria-label="צהוב" disabled></button>
        <button class="tile tile--green" type="button" aria-label="ירוק" disabled></button>
      </div>
      <button class="btn-primary" type="button">
        ${icons.play}
        <span>התחל</span>
      </button>
    </main>

    <nav class="bottom-nav" aria-label="ניווט ראשי">
      <a class="bottom-nav__item" href="${ROUTES.about}">${icons.infoBadge}<span>אודות</span></a>
      <a class="bottom-nav__item" href="${ROUTES.aboutBest}">${icons.trophy}<span>השיא שלי</span></a>
    </nav>
  `;
  return screen;
}

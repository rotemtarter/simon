import { icons } from '../ui/icons';
import { art } from '../ui/art';
import { ROUTES } from '../routes';
import type { Screen } from '../router';

// Placeholder until the personal best is read from storage (Milestone 3).
const BEST_SCORE = 0;

export function renderAbout(): Screen {
  const screen = document.createElement('div');
  screen.className = 'screen screen--about';
  screen.innerHTML = `
    <header class="page-header">
      <h1>אודות</h1>
      <a class="icon-link" href="${ROUTES.home}" aria-label="חזרה למסך הבית">${icons.back}</a>
    </header>

    <main class="about-main">
      <section class="about-info">
        <div class="about-info__art" aria-hidden="true">
          <span class="planet planet--blue about-info__planet"></span>
          <span class="planet planet--tiny about-info__tiny"></span>
          <span class="planet planet--ringed about-info__ringed"></span>
          ${art.astronaut('about-info__astronaut')}
        </div>
        <h2>משחק זיכרון קלאסי</h2>
        <p>זכרו את הרצף, שחזרו אותו והגיעו לשיא!</p>
      </section>

      <section class="best-card" id="best-score" aria-label="השיא האישי">
        <div class="best-card__text">
          <span class="best-card__label">השיא האישי</span>
          <span class="best-card__value">${BEST_SCORE}</span>
        </div>
        ${icons.trophy}
      </section>

      <h2 class="section-title">היסטוריית המשחקים</h2>
      <section class="list-card" aria-label="היסטוריית המשחקים">
        <p class="empty-state">עדיין אין משחקים שמורים</p>
      </section>
    </main>
  `;
  return { element: screen };
}

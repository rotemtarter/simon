import { icons } from '../ui/icons';
import { art } from '../ui/art';
import { ROUTES } from '../routes';
import { loadBestScore, loadHistory, type GameRecord } from '../storage/history';
import type { Screen } from '../router';

const RESULT_LABELS: Record<GameRecord['result'], string> = {
  won: 'ניצחון',
  lost: 'כישלון',
};

const pad = (n: number): string => String(n).padStart(2, '0');

// Local date "DD.MM.YYYY" and time "HH:MM".
function formatDateTime(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  return {
    date: `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}

function span(className: string, text: string): HTMLSpanElement {
  const el = document.createElement('span');
  el.className = className;
  el.textContent = text;
  return el;
}

// Built with textContent so stored values are never parsed as HTML.
function historyRow(record: GameRecord): HTMLLIElement {
  const { date, time } = formatDateTime(record.endedAt);
  const result = `${RESULT_LABELS[record.result]} · שלב ${record.finalLevel}`;
  const row = document.createElement('li');
  row.className = 'history-row';
  row.setAttribute('aria-label', `ניקוד ${record.score}, ${result}, ${date} ${time}`);
  row.append(
    span('history-row__score', String(record.score)),
    span('history-row__result', result),
    span('history-row__date', date),
    span('history-row__time', time),
  );
  // Decorative chevron, as in the mockup; there is no game-details screen.
  row.insertAdjacentHTML('beforeend', icons.chevron);
  return row;
}

function emptyState(text: string): HTMLParagraphElement {
  const p = document.createElement('p');
  p.className = 'empty-state';
  p.textContent = text;
  return p;
}

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
          <span class="best-card__value"></span>
        </div>
        ${icons.trophy}
      </section>

      <h2 class="section-title">היסטוריית המשחקים</h2>
      <section class="list-card" aria-label="היסטוריית המשחקים"></section>
    </main>
  `;

  const best = loadBestScore();
  screen.querySelector('.best-card__value')!.textContent = best === null ? '—' : String(best);

  const list = screen.querySelector<HTMLElement>('.list-card')!;
  const history = loadHistory();
  if (!history.ok) {
    list.append(emptyState('לא ניתן לגשת להיסטוריה השמורה במכשיר זה'));
  } else if (history.records.length === 0) {
    list.append(emptyState('עדיין אין משחקים שמורים'));
  } else {
    const ol = document.createElement('ol');
    ol.className = 'history-list';
    ol.append(...history.records.map(historyRow));
    list.append(ol);
  }

  return { element: screen };
}

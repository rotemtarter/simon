import { registerSW } from 'virtual:pwa-register';
import { icons } from './ui/icons';
import { isGameActive, onGameIdle } from './game/activity';

// Registers the service worker that caches the app for offline use.
// If registration fails (unsupported browser, insecure origin), the site still works normally.
export function registerServiceWorker(): void {
  try {
    registerSW({ immediate: true });
  } catch {
    // Ignore: offline support is simply unavailable.
  }
}

// "No internet connection" notice (DESIGN state 10). Shown once per disconnect,
// never on top of a running game, and closed automatically when the connection returns.
export function watchConnection(): void {
  let notice: HTMLElement | null = null;
  let pending = false;
  let previousFocus: Element | null = null;

  function close(): void {
    if (!notice) return;
    notice.remove();
    notice = null;
    if (previousFocus instanceof HTMLElement && previousFocus.isConnected) {
      previousFocus.focus({ preventScroll: true });
    }
  }

  function open(): void {
    pending = false;
    if (notice || navigator.onLine) return;
    previousFocus = document.activeElement;
    notice = document.createElement('div');
    notice.className = 'offline-notice';
    notice.setAttribute('role', 'dialog');
    notice.setAttribute('aria-modal', 'true');
    notice.setAttribute('aria-labelledby', 'offline-notice-title');
    notice.innerHTML = `
      <div class="offline-notice__content">
        <div class="offline-notice__badge" aria-hidden="true">${icons.cloudOff}</div>
        <h2 class="offline-notice__title" id="offline-notice-title">אין חיבור לאינטרנט</h2>
        <p class="offline-notice__text">המשחק זמין גם במצב לא מקוון לאחר ההתקנה.</p>
        <button class="btn-primary" type="button">המשך</button>
      </div>`;
    notice.querySelector('button')!.addEventListener('click', close);
    document.body.append(notice);
    notice.querySelector('button')!.focus();
  }

  function handleOffline(): void {
    if (isGameActive()) {
      pending = true;
    } else {
      open();
    }
  }

  window.addEventListener('offline', handleOffline);
  window.addEventListener('online', () => {
    pending = false;
    close();
  });
  onGameIdle(() => {
    if (pending) open();
  });

  if (!navigator.onLine) handleOffline();
}

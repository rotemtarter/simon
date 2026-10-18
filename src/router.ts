import { renderHome } from './screens/home';
import { renderAbout } from './screens/about';
import { ROUTES } from './routes';

// A rendered screen; `destroy` is called before it is replaced (e.g. to stop game timers).
export interface Screen {
  element: HTMLElement;
  destroy?: () => void;
}

let current: Screen | null = null;

function show(root: HTMLElement, screen: Screen): void {
  current?.destroy?.();
  current = screen;
  root.replaceChildren(screen.element);
}

function render(root: HTMLElement): void {
  const raw = location.hash.replace(/^#/, '') || '/';
  const [path, query] = raw.split('?');

  if (path === '/about') {
    show(root, renderAbout());
    const target = query === 'best' ? document.getElementById('best-score') : null;
    if (target) {
      target.scrollIntoView({ block: 'start' });
    } else {
      window.scrollTo(0, 0);
    }
    return;
  }

  if (path !== '/') {
    // Unknown route: fall back to home without adding a history entry.
    location.replace(ROUTES.home);
    return;
  }

  show(root, renderHome());
  window.scrollTo(0, 0);
}

export function startRouter(root: HTMLElement): void {
  window.addEventListener('hashchange', () => render(root));
  render(root);
}

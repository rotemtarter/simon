import { renderHome } from './screens/home';
import { renderAbout } from './screens/about';
import { ROUTES } from './routes';

function render(root: HTMLElement): void {
  const raw = location.hash.replace(/^#/, '') || '/';
  const [path, query] = raw.split('?');

  if (path === '/about') {
    root.replaceChildren(renderAbout());
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

  root.replaceChildren(renderHome());
  window.scrollTo(0, 0);
}

export function startRouter(root: HTMLElement): void {
  window.addEventListener('hashchange', () => render(root));
  render(root);
}

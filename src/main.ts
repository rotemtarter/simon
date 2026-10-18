import '@fontsource/heebo/400.css';
import '@fontsource/heebo/500.css';
import '@fontsource/heebo/600.css';
import '@fontsource/heebo/700.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import { startRouter } from './router';
import { renderSpaceBackground } from './ui/background';
import { registerServiceWorker, watchConnection } from './pwa';

const background = document.querySelector<HTMLElement>('.space-bg');
if (background) {
  renderSpaceBackground(background);
}

const root = document.getElementById('app');
if (root) {
  startRouter(root);
}

registerServiceWorker();
watchConnection();

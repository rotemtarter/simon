// Illustration cut from the user-supplied reference image.
// Bundled locally by Vite (no external assets), so it works offline later.
import astronautUrl from '../assets/astronaut.webp';

const img = (src: string, className: string): string =>
  `<img class="${className}" src="${src}" alt="" aria-hidden="true" draggable="false" />`;

export const art = {
  astronaut: (className: string) => img(astronautUrl, className),
};

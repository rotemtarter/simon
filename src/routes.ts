// Hash-based routes: "#/" = home, "#/about" = about.
// "#/about?best" opens the about screen scrolled to the personal best card.
export const ROUTES = {
  home: '#/',
  about: '#/about',
  aboutBest: '#/about?best',
} as const;

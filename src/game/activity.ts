// Tracks whether a game round is in progress, so app-level notices can wait until it ends.
let active = false;
const idleListeners = new Set<() => void>();

export function setGameActive(value: boolean): void {
  if (active === value) return;
  active = value;
  if (!active) idleListeners.forEach((listener) => listener());
}

export function isGameActive(): boolean {
  return active;
}

export function onGameIdle(listener: () => void): void {
  idleListeners.add(listener);
}

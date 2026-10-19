// Game sounds generated with the Web Audio API (no audio files, works offline).
// If audio is unavailable or blocked, every function silently does nothing.
import type { Color } from './engine';

// Classic Simon-style pitches, one per color.
const COLOR_FREQUENCIES: Record<Color, number> = {
  green: 415.3,
  red: 310,
  yellow: 252,
  blue: 209,
};

let context: AudioContext | null = null;

// Must be called from a user gesture (e.g. the start button) so browsers allow sound.
// Returns false when the device has no usable audio engine.
export function unlockAudio(): boolean {
  try {
    if (!context) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return false;
      useMediaAudioSession();
      context = new Ctor();
      playSilence(context);
    }
    // iOS may report 'interrupted' after a call or after the app was in the background.
    if (context.state !== 'running') {
      void context.resume().catch(() => undefined);
    }
    return true;
  } catch {
    context = null;
    return false;
  }
}

// On iPhone, Web Audio is muted by the silent switch unless the page asks for a
// media ("playback") audio session (Safari 16.4+). Older browsers ignore this.
function useMediaAudioSession(): void {
  try {
    const session = (navigator as unknown as { audioSession?: { type: string } }).audioSession;
    if (session) session.type = 'playback';
  } catch {
    // Not supported: sound still works when the phone is not on silent.
  }
}

// Playing a tiny silent buffer inside the user's tap fully unlocks audio on older iOS.
function playSilence(ctx: AudioContext): void {
  try {
    const source = ctx.createBufferSource();
    source.buffer = ctx.createBuffer(1, 1, 22050);
    source.connect(ctx.destination);
    source.start(0);
  } catch {
    // Ignore.
  }
}

function tone(
  frequency: number,
  durationMs: number,
  options: { delayMs?: number; type?: OscillatorType; volume?: number } = {},
): void {
  if (!context) return;
  try {
    const { delayMs = 0, type = 'triangle', volume = 0.3 } = options;
    const start = context.currentTime + delayMs / 1000;
    const end = start + durationMs / 1000;

    const oscillator = context.createOscillator();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);

    // Short fade in/out to avoid clicks.
    const gain = context.createGain();
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(volume, start + 0.015);
    gain.gain.setValueAtTime(volume, Math.max(start + 0.015, end - 0.04));
    gain.gain.linearRampToValueAtTime(0, end);

    oscillator.connect(gain).connect(context.destination);
    oscillator.start(start);
    oscillator.stop(end + 0.02);
  } catch {
    // Ignore audio errors: the game keeps working without sound.
  }
}

export function playColor(color: Color, durationMs: number): void {
  tone(COLOR_FREQUENCIES[color], durationMs);
}

export function playSuccess(): void {
  tone(523.25, 110, { type: 'sine' });
  tone(659.25, 110, { type: 'sine', delayMs: 110 });
  tone(783.99, 200, { type: 'sine', delayMs: 220 });
}

export function playFailure(): void {
  tone(110, 450, { type: 'sawtooth', volume: 0.18 });
  tone(98, 450, { type: 'square', volume: 0.08 });
}

export function playVictory(): void {
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((frequency, i) => tone(frequency, 150, { type: 'sine', delayMs: i * 140 }));
  tone(1046.5, 500, { type: 'triangle', delayMs: notes.length * 140 });
  tone(783.99, 500, { type: 'triangle', delayMs: notes.length * 140, volume: 0.15 });
}

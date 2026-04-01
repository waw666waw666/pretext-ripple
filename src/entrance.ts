const DURATION = 3.0;
const STAGGER_PER_CHAR = 0.002;
const MAX_DELAY = 1.5;

export interface EntranceState {
  startTime: number;
  done: boolean;
}

export function createEntrance(time: number): EntranceState {
  return { startTime: time, done: false };
}

/**
 * Returns opacity and y-offset for a character during the entrance animation.
 * Characters fade in and drift up from below, staggered by their index.
 */
export function getEntranceEffect(
  state: EntranceState,
  charIndex: number,
  time: number
): { opacity: number; offsetY: number } {
  if (state.done) return { opacity: 1, offsetY: 0 };

  const elapsed = time - state.startTime;
  const delay = Math.min(charIndex * STAGGER_PER_CHAR, MAX_DELAY);
  const t = elapsed - delay;

  if (t < 0) return { opacity: 0, offsetY: 12 };

  const progress = Math.min(t / DURATION, 1);

  if (progress >= 1) {
    // Check if this is likely the last character to finish
    if (elapsed > MAX_DELAY + DURATION) {
      state.done = true;
    }
    return { opacity: 1, offsetY: 0 };
  }

  // Ease out cubic
  const ease = 1 - Math.pow(1 - progress, 3);

  return {
    opacity: ease,
    offsetY: (1 - ease) * 12,
  };
}

const WAVE_SPEED = 350;
const FREQUENCY = 0.04;
const DAMPENING = 1.5;
const MIN_AMPLITUDE = 0.1;

export interface Ripple {
  x: number;
  y: number;
  amplitude: number;
  startTime: number;
}

const activeRipples: Ripple[] = [];

export function addRipple(x: number, y: number, amplitude: number, time: number): void {
  activeRipples.push({ x, y, amplitude, startTime: time });
}

export function getRippleOffset(
  charX: number,
  charY: number,
  time: number
): number {
  let totalOffset = 0;

  for (let i = activeRipples.length - 1; i >= 0; i--) {
    const ripple = activeRipples[i];
    const elapsed = time - ripple.startTime;
    const decay = Math.exp(-elapsed * DAMPENING);

    if (ripple.amplitude * decay < MIN_AMPLITUDE) {
      activeRipples.splice(i, 1);
      continue;
    }

    const dx = charX - ripple.x;
    const dy = charY - ripple.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const wave =
      ripple.amplitude *
      Math.sin((distance - elapsed * WAVE_SPEED) * FREQUENCY * Math.PI * 2) *
      decay;

    const sign = dx === 0 ? 0 : (dx > 0 ? 1 : -1);
    totalOffset += wave * sign;
  }

  return totalOffset;
}

export function getActiveRipples(): readonly Ripple[] {
  return activeRipples;
}

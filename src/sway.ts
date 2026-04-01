const AMPLITUDE = 3;
const SPEED = 0.4;
const PHASE_OFFSET = 0.8;

export function getSwayOffset(time: number, lineIndex: number): number {
  return AMPLITUDE * Math.sin(time * SPEED * Math.PI * 2 + lineIndex * PHASE_OFFSET);
}

// 2D discrete wave equation simulation
// Two-buffer heightmap propagated each frame

const CELL_SIZE = 3; // pixels per grid cell
const DAMPING = 0.95;
const STEPS_PER_FRAME = 2; // wave propagation speed
const DROP_RADIUS = 7; // grid cells — wider spread, less concentrated
const DROP_STRENGTH = 30;
const DRAG_DROP_STRENGTH = 20;

let cols = 0;
let rows = 0;
let buf1: Float32Array = new Float32Array(0);
let buf2: Float32Array = new Float32Array(0);

// buf1 = current, buf2 = previous
export function initWave(w: number, h: number): void {
  cols = Math.ceil(w / CELL_SIZE) + 2;
  rows = Math.ceil(h / CELL_SIZE) + 2;
  const size = cols * rows;
  buf1 = new Float32Array(size);
  buf2 = new Float32Array(size);
}

export function stepWave(): void {
  for (let s = 0; s < STEPS_PER_FRAME; s++) {
    const curr = buf1;
    const prev = buf2;

    for (let y = 1; y < rows - 1; y++) {
      const rowOff = y * cols;
      for (let x = 1; x < cols - 1; x++) {
        const i = rowOff + x;
        const neighbors =
          curr[i - 1] + curr[i + 1] + curr[i - cols] + curr[i + cols];
        prev[i] = (neighbors * 0.5 - prev[i]) * DAMPING;
      }
    }

    // Swap: prev becomes current for next step
    buf1 = prev;
    buf2 = curr;
  }
}

export function dropAt(px: number, py: number, strength?: number): void {
  const s = strength ?? DROP_STRENGTH;
  const cx = Math.round(px / CELL_SIZE) + 1; // +1 for border
  const cy = Math.round(py / CELL_SIZE) + 1;

  for (let dy = -DROP_RADIUS; dy <= DROP_RADIUS; dy++) {
    for (let dx = -DROP_RADIUS; dx <= DROP_RADIUS; dx++) {
      const gx = cx + dx;
      const gy = cy + dy;
      if (gx < 1 || gx >= cols - 1 || gy < 1 || gy >= rows - 1) continue;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > DROP_RADIUS) continue;
      // Smooth cosine falloff
      const falloff = 0.5 * (1 + Math.cos((dist / DROP_RADIUS) * Math.PI));
      buf1[gy * cols + gx] -= s * falloff;
    }
  }
}

export function sampleWave(
  px: number,
  py: number
): { dx: number; dy: number; height: number } {
  const gx = px / CELL_SIZE + 1;
  const gy = py / CELL_SIZE + 1;
  const ix = Math.floor(gx);
  const iy = Math.floor(gy);

  if (ix < 1 || ix >= cols - 2 || iy < 1 || iy >= rows - 2) {
    return { dx: 0, dy: 0, height: 0 };
  }

  const i = iy * cols + ix;
  const h = buf1[i];

  // Gradient = surface normal → drives refraction displacement
  const gradX = (buf1[i + 1] - buf1[i - 1]) * 0.5;
  const gradY = (buf1[i + cols] - buf1[i - cols]) * 0.5;

  return { dx: gradX, dy: gradY, height: h };
}

// Re-export for input.ts convenience
export const DRAG_STRENGTH = DRAG_DROP_STRENGTH;

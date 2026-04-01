import { buildCharMap, FONT, type CharEntry } from "./text";
import { render } from "./renderer";
import { setupInput } from "./input";
import { createEntrance, type EntranceState } from "./entrance";
import { setupGyro } from "./gyro";
import { initWave, stepWave } from "./ripple";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

let charMap: CharEntry[] = [];
let startTime = 0;
let entrance: EntranceState;

function getTime(): number {
  return (performance.now() - startTime) / 1000;
}

function resize(): void {
  const dpr = window.devicePixelRatio || 1;
  const w = window.innerWidth;
  const h = window.innerHeight;

  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.font = FONT;

  charMap = buildCharMap(ctx, w);
  initWave(w, h);
}

function frame(): void {
  stepWave();
  const time = getTime();
  render(ctx, charMap, window.innerWidth, window.innerHeight, time, entrance);
  requestAnimationFrame(frame);
}

startTime = performance.now();
entrance = createEntrance(getTime());
resize();
setupInput(canvas, getTime);
setupGyro(canvas);
window.addEventListener("resize", resize);

requestAnimationFrame(frame);

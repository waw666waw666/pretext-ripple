import { buildCharMap, FONT, type CharEntry } from "./text";
import { render } from "./renderer";
import { setupInput } from "./input";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

let charMap: CharEntry[] = [];
let startTime = 0;

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
}

function frame(): void {
  const time = getTime();
  render(ctx, charMap, window.innerWidth, window.innerHeight, time);
  requestAnimationFrame(frame);
}

startTime = performance.now();
resize();
setupInput(canvas, getTime);
window.addEventListener("resize", resize);
requestAnimationFrame(frame);

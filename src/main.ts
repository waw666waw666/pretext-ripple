import { buildCharMap, FONT } from "./text";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

const dpr = window.devicePixelRatio || 1;
canvas.width = window.innerWidth * dpr;
canvas.height = window.innerHeight * dpr;
canvas.style.width = `${window.innerWidth}px`;
canvas.style.height = `${window.innerHeight}px`;
ctx.scale(dpr, dpr);

const charMap = buildCharMap(ctx, window.innerWidth);

ctx.fillStyle = "#e8e8e8";
ctx.font = FONT;
ctx.textBaseline = "top";

for (const entry of charMap) {
  ctx.fillText(entry.char, entry.x, entry.y);
}

console.log(`Character map built: ${charMap.length} characters`);

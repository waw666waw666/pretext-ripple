import type { CharEntry } from "./text";
import { FONT } from "./text";
import { getSwayOffset } from "./sway";
import { getRippleOffset } from "./ripple";

const BG_COLOR = "#0a0a0a";
const TEXT_COLOR = "#e8e8e8";

export function render(
  ctx: CanvasRenderingContext2D,
  charMap: CharEntry[],
  width: number,
  height: number,
  time: number
): void {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = TEXT_COLOR;
  ctx.font = FONT;
  ctx.textBaseline = "top";

  for (let i = 0; i < charMap.length; i++) {
    const entry = charMap[i];
    const sway = getSwayOffset(time, entry.lineIndex);
    const ripple = getRippleOffset(entry.x, entry.y, time);
    ctx.fillText(entry.char, entry.x + sway + ripple, entry.y);
  }
}

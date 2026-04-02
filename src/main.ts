import { buildCharMap, type CharEntry, getCurrentText, getFontStyle, getLineHeight, getFontSize } from "./text";
import { render } from "./renderer";
import { setupInput } from "./input";
import { createEntrance, type EntranceState } from "./entrance";
import { setupGyro } from "./gyro";
import { initWave, stepWave } from "./ripple";
import { setupUI } from "./ui";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

let charMap: CharEntry[] = [];
let startTime = 0;
let entrance: EntranceState;
let currentFontSize = getFontSize();

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
  ctx.font = getFontStyle(currentFontSize);

  charMap = buildCharMap(ctx, w, h, undefined, currentFontSize);
  initWave(w, h);
}

/** 计算内容高度 */
function getContentHeight(charMap: CharEntry[], lineHeight: number): number {
  if (charMap.length === 0) return window.innerHeight;
  const maxLineIndex = Math.max(...charMap.map(c => c.lineIndex));
  // 确保至少填满屏幕高度
  const contentHeight = (maxLineIndex + 2) * lineHeight + 40;
  return Math.max(window.innerHeight, contentHeight);
}

/** 更新文本并重建字符映射（带防抖） */
let updateTimeout: number | null = null;
function updateText(newText: string): void {
  // 清除之前的更新
  if (updateTimeout) {
    clearTimeout(updateTimeout);
  }

  // 延迟300ms执行，避免频繁更新
  updateTimeout = window.setTimeout(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    ctx.font = getFontStyle(currentFontSize);
    charMap = buildCharMap(ctx, w, h, newText, currentFontSize);
    // 重新触发入场动画
    entrance = createEntrance(getTime());
    updateTimeout = null;
  }, 300);
}

/** 更新字体大小 */
function updateFontSize(size: number): void {
  currentFontSize = size;
  const w = window.innerWidth;
  const h = window.innerHeight;
  ctx.font = getFontStyle(size);
  charMap = buildCharMap(ctx, w, h, undefined, size);
  entrance = createEntrance(getTime());
}

function frame(): void {
  stepWave();
  const time = getTime();

  // 计算内容高度
  const lineHeight = getLineHeight(currentFontSize);
  const contentHeight = getContentHeight(charMap, lineHeight);
  const viewportHeight = Math.max(window.innerHeight, contentHeight);

  // 如果内容高度变化，更新画布
  if (Math.abs(canvas.height / (window.devicePixelRatio || 1) - viewportHeight) > lineHeight) {
    const dpr = window.devicePixelRatio || 1;
    canvas.height = viewportHeight * dpr;
    canvas.style.height = `${viewportHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    initWave(window.innerWidth, viewportHeight);
  }

  render(ctx, charMap, window.innerWidth, viewportHeight, time, entrance, currentFontSize);
  requestAnimationFrame(frame);
}

startTime = performance.now();
entrance = createEntrance(getTime());
resize();
setupInput(canvas, getTime);
setupGyro(canvas);
window.addEventListener("resize", resize);

// 初始化UI
setupUI({
  onTextChange: updateText,
  onFontSizeChange: updateFontSize,
});

requestAnimationFrame(frame);

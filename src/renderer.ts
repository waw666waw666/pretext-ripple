import type { CharEntry } from "./text";
import { getFontStyle, DEFAULT_FONT_SIZE } from "./text";
import { getSwayOffset } from "./sway";
import { sampleWave } from "./ripple";
import { type EntranceState, getEntranceEffect } from "./entrance";
import { getTilt } from "./gyro";

const BG_COLOR = "#0a0a0a";

// 基础动画参数（基于5px字体）
const BASE_DISPLACE_SCALE = 6.0;
const BASE_BRIGHT_SCALE = 0.012;
const BASE_OPACITY_FALLOFF = 0.015;
const BASE_MAX_DISP = 8;
const BASE_SWAY_AMP = 0.5;

// 视口裁剪边距（考虑最大位移）
const CULL_MARGIN = 20;

/**
 * 获取动画缩放系数
 * 使用对数曲线，确保大字体时动画柔和自然
 * 字体越大，动画效果增长越缓慢
 */
function getAnimationScale(fontSize?: number): number {
  const size = fontSize ?? DEFAULT_FONT_SIZE;
  const ratio = size / DEFAULT_FONT_SIZE;
  // 使用对数缩放：小字体时接近线性，大字体时增长缓慢
  // 公式：1 + ln(ratio) / 2，确保10px时约1.25倍，20px时约1.5倍
  return 1 + Math.log(ratio) / 2;
}

export function render(
  ctx: CanvasRenderingContext2D,
  charMap: CharEntry[],
  width: number,
  height: number,
  time: number,
  entrance: EntranceState,
  fontSize?: number
): void {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, width, height);

  ctx.font = getFontStyle(fontSize);
  ctx.textBaseline = "top";

  const tilt = getTilt();

  // 计算动画缩放系数
  const animScale = getAnimationScale(fontSize);

  // 根据字体大小缩放动画参数
  const displaceScale = BASE_DISPLACE_SCALE * animScale;
  const brightScale = BASE_BRIGHT_SCALE / animScale; // 亮度变化与字体大小成反比
  const opacityFalloff = BASE_OPACITY_FALLOFF / animScale;
  const maxDisp = BASE_MAX_DISP * animScale;

  // 计算视口裁剪边界
  const minX = -CULL_MARGIN;
  const maxX = width + CULL_MARGIN;
  const minY = -CULL_MARGIN;
  const maxY = height + CULL_MARGIN;

  for (let i = 0; i < charMap.length; i++) {
    const entry = charMap[i];

    // 视口裁剪：跳过屏幕外的字符
    if (entry.x < minX || entry.x > maxX || entry.y < minY || entry.y > maxY) {
      continue;
    }

    // Entrance fade-in
    const ent = getEntranceEffect(entrance, i, time);
    if (ent.opacity < 0.01) continue;

    // 摇摆动画 - 幅度随字体缩放
    const sway = getSwayOffset(time, entry.lineIndex) * animScale;
    const wave = sampleWave(entry.x, entry.y);

    // Gyro tilt offset - 随字体缩放
    const gyroX = tilt.x * (entry.lineIndex * 0.15 * animScale);
    const gyroY = tilt.y * (entry.lineIndex * 0.08 * animScale);

    // Displacement from wave gradient — 随字体缩放
    const rawDispX = wave.dx * displaceScale;
    const rawDispY = wave.dy * displaceScale;
    const waveDispX = Math.max(-maxDisp, Math.min(maxDisp, rawDispX));
    const waveDispY = Math.max(-maxDisp, Math.min(maxDisp, rawDispY));

    // Brightness modulation - 随字体缩放调整
    const absH = Math.abs(wave.height);
    const waveBright = Math.max(0.15, Math.min(1, 1 - absH * brightScale));

    // Opacity fades on ripple edge - 随字体缩放调整
    const gradMag = Math.abs(wave.dx) + Math.abs(wave.dy);
    const rippleEdge = Math.min(gradMag * opacityFalloff, 0.5);
    const waveOpacity = Math.max(0.2, 1 - rippleEdge);

    // Combined alpha
    const alpha = ent.opacity * waveBright * waveOpacity;

    // Color — settled blue base that shifts like light through water
    const energy = Math.min(absH * 0.008, 1);

    // Ambient water tint — slow, gentle hue drift across the text
    const waterPhase = Math.sin(time * 0.3 + entry.x * 0.005 + entry.y * 0.008);
    const baseSat = 12 + waterPhase * 5;
    const baseHue = 210 + waterPhase * 10;

    if (energy < 0.02) {
      ctx.fillStyle = `hsla(${baseHue}, ${baseSat}%, 82%, ${alpha})`;
    } else {
      const hue = wave.height < 0 ? 215 : 195;
      const saturation = baseSat + energy * 50;
      const lightness = 78 - energy * 15;
      ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
    }

    ctx.fillText(
      entry.char,
      entry.x + sway + waveDispX + gyroX,
      entry.y + waveDispY + gyroY + ent.offsetY
    );
  }
}

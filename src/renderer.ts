import type { CharEntry } from "./text";
import { FONT } from "./text";
import { getSwayOffset } from "./sway";
import { sampleWave } from "./ripple";
import { type EntranceState, getEntranceEffect } from "./entrance";
import { getTilt } from "./gyro";

const BG_COLOR = "#0a0a0a";
const DISPLACE_SCALE = 6.0; // refraction displacement
const BRIGHT_SCALE = 0.012; // height → brightness
const OPACITY_FALLOFF = 0.015; // gradient → opacity fade on ripple edge

export function render(
  ctx: CanvasRenderingContext2D,
  charMap: CharEntry[],
  width: number,
  height: number,
  time: number,
  entrance: EntranceState
): void {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, width, height);

  ctx.font = FONT;
  ctx.textBaseline = "top";

  const tilt = getTilt();

  for (let i = 0; i < charMap.length; i++) {
    const entry = charMap[i];

    // Entrance fade-in
    const ent = getEntranceEffect(entrance, i, time);
    if (ent.opacity < 0.01) continue;

    const sway = getSwayOffset(time, entry.lineIndex);
    const wave = sampleWave(entry.x, entry.y);

    // Gyro tilt offset
    const gyroX = tilt.x * (entry.lineIndex * 0.15);
    const gyroY = tilt.y * (entry.lineIndex * 0.08);

    // Displacement from wave gradient — clamped to avoid chaos at epicenter
    const rawDispX = wave.dx * DISPLACE_SCALE;
    const rawDispY = wave.dy * DISPLACE_SCALE;
    const maxDisp = 8;
    const waveDispX = Math.max(-maxDisp, Math.min(maxDisp, rawDispX));
    const waveDispY = Math.max(-maxDisp, Math.min(maxDisp, rawDispY));

    // Brightness modulation
    const absH = Math.abs(wave.height);
    const waveBright = Math.max(0.15, Math.min(1, 1 - absH * BRIGHT_SCALE));

    // Opacity fades on ripple edge (steep gradient = ring passing through)
    const gradMag = Math.abs(wave.dx) + Math.abs(wave.dy); // cheaper than sqrt
    const rippleEdge = Math.min(gradMag * OPACITY_FALLOFF, 0.5);
    const waveOpacity = Math.max(0.2, 1 - rippleEdge);

    // Combined alpha
    const alpha = ent.opacity * waveBright * waveOpacity;

    // Color — settled blue base that shifts like light through water
    const energy = Math.min(absH * 0.008, 1);

    // Ambient water tint — slow, gentle hue drift across the text
    const waterPhase = Math.sin(time * 0.3 + entry.x * 0.005 + entry.y * 0.008);
    const baseSat = 12 + waterPhase * 5; // 7-17% saturation
    const baseHue = 210 + waterPhase * 10; // 200-220, blue range

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

import { dropAt, DRAG_STRENGTH } from "./ripple";
import { playBowl, playDragTone } from "./audio";

const DROP_BASE = undefined; // uses default DROP_STRENGTH
const DRAG_INTERVAL = 30; // ms between drops while dragging
const DRAG_SOUND_INTERVAL = 120; // ms between drag tones

export function setupInput(canvas: HTMLCanvasElement, _getTime: () => number): void {
  function canvasCoords(clientX: number, clientY: number): { x: number; y: number } {
    const rect = canvas.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }

  const lastDropTime = new Map<number, number>();
  let lastDragSound = 0;

  canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    const now = performance.now();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const coords = canvasCoords(touch.clientX, touch.clientY);
      const strength = touch.force > 0 ? 200 + touch.force * 200 : DROP_BASE;
      dropAt(coords.x, coords.y, strength);
      const yNorm = coords.y / window.innerHeight;
      playBowl(touch.force > 0 ? 0.5 + touch.force : 1, yNorm);
      lastDropTime.set(touch.identifier, now);
    }
  }, { passive: false });

  canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    const now = performance.now();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const last = lastDropTime.get(touch.identifier) || 0;
      if (now - last < DRAG_INTERVAL) continue;
      const coords = canvasCoords(touch.clientX, touch.clientY);
      dropAt(coords.x, coords.y, DRAG_STRENGTH);
      if (now - lastDragSound > DRAG_SOUND_INTERVAL) {
        const yNorm = coords.y / window.innerHeight;
        playDragTone(yNorm);
        lastDragSound = now;
      }
      lastDropTime.set(touch.identifier, now);
    }
  }, { passive: false });

  canvas.addEventListener("touchend", (e) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      lastDropTime.delete(e.changedTouches[i].identifier);
    }
  });

  canvas.addEventListener("touchcancel", (e) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      lastDropTime.delete(e.changedTouches[i].identifier);
    }
  });

  let mouseIsDown = false;
  let mouseLastDrop = 0;

  canvas.addEventListener("mousedown", (e) => {
    mouseIsDown = true;
    const coords = canvasCoords(e.clientX, e.clientY);
    dropAt(coords.x, coords.y);
    const yNorm = coords.y / window.innerHeight;
    playBowl(1, yNorm);
    mouseLastDrop = performance.now();
  });

  canvas.addEventListener("mousemove", (e) => {
    if (!mouseIsDown) return;
    const now = performance.now();
    if (now - mouseLastDrop < DRAG_INTERVAL) return;
    const coords = canvasCoords(e.clientX, e.clientY);
    dropAt(coords.x, coords.y, DRAG_STRENGTH);
    if (now - lastDragSound > DRAG_SOUND_INTERVAL) {
      const yNorm = coords.y / window.innerHeight;
      playDragTone(yNorm);
      lastDragSound = now;
    }
    mouseLastDrop = now;
  });

  canvas.addEventListener("mouseup", () => { mouseIsDown = false; });
  canvas.addEventListener("mouseleave", () => { mouseIsDown = false; });
}

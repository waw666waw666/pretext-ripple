import { addRipple } from "./ripple";

const MIN_AMPLITUDE = 3;
const MAX_AMPLITUDE = 20;
const MAX_DURATION_MS = 1000;

interface PendingTouch {
  startTime: number;
  x: number;
  y: number;
  force: number | null;
}

const pendingTouches = new Map<number, PendingTouch>();

export function setupInput(canvas: HTMLCanvasElement, getTime: () => number): void {
  const dpr = window.devicePixelRatio || 1;

  function canvasCoords(clientX: number, clientY: number): { x: number; y: number } {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left),
      y: (clientY - rect.top),
    };
  }

  function amplitudeFromDuration(durationMs: number): number {
    const t = Math.min(durationMs / MAX_DURATION_MS, 1);
    return MIN_AMPLITUDE + t * (MAX_AMPLITUDE - MIN_AMPLITUDE);
  }

  function amplitudeFromForce(force: number): number {
    return MIN_AMPLITUDE + force * (MAX_AMPLITUDE - MIN_AMPLITUDE);
  }

  // Touch events
  canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const coords = canvasCoords(touch.clientX, touch.clientY);
      pendingTouches.set(touch.identifier, {
        startTime: performance.now(),
        x: coords.x,
        y: coords.y,
        force: touch.force > 0 ? touch.force : null,
      });
    }
  }, { passive: false });

  canvas.addEventListener("touchend", (e) => {
    e.preventDefault();
    const time = getTime();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const pending = pendingTouches.get(touch.identifier);
      if (!pending) continue;

      let amplitude: number;
      if (pending.force !== null) {
        amplitude = amplitudeFromForce(pending.force);
      } else {
        const durationMs = performance.now() - pending.startTime;
        amplitude = amplitudeFromDuration(durationMs);
      }

      addRipple(pending.x, pending.y, amplitude, time);
      pendingTouches.delete(touch.identifier);
    }
  }, { passive: false });

  canvas.addEventListener("touchcancel", (e) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      pendingTouches.delete(e.changedTouches[i].identifier);
    }
  });

  // Mouse events (desktop fallback)
  let mouseDown: { startTime: number; x: number; y: number } | null = null;

  canvas.addEventListener("mousedown", (e) => {
    const coords = canvasCoords(e.clientX, e.clientY);
    mouseDown = { startTime: performance.now(), x: coords.x, y: coords.y };
  });

  canvas.addEventListener("mouseup", (e) => {
    if (!mouseDown) return;
    const time = getTime();
    const durationMs = performance.now() - mouseDown.startTime;
    const amplitude = amplitudeFromDuration(durationMs);
    addRipple(mouseDown.x, mouseDown.y, amplitude, time);
    mouseDown = null;
  });
}

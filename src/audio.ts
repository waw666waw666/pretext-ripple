// Meditation tones — position-mapped singing bowls
// Y position on screen controls pitch: top = high, bottom = low
// Like a vertical piano across the whole screen

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let convolver: ConvolverNode | null = null;
let dronePlaying = false;

// Singing bowl partials
const PARTIALS = [
  { ratio: 1, gain: 1.0 },
  { ratio: 2.71, gain: 0.35 },
  { ratio: 4.16, gain: 0.15 },
];

// D major pentatonic scale spanning ~3 octaves (low to high)
// Mapped bottom-to-top of screen
const SCALE = [
  73.42,  // D2
  82.41,  // E2
  92.50,  // F#2
  110.0,  // A2
  123.47, // B2
  146.83, // D3
  164.81, // E3
  185.0,  // F#3
  220.0,  // A3
  246.94, // B3
  293.66, // D4
  329.63, // E4
  369.99, // F#4
  440.0,  // A4
  493.88, // B4
  587.33, // D5
  659.25, // E5
  739.99, // F#5
  880.0,  // A5
];

function ensureContext(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.3;

    // Long reverb
    convolver = ctx.createConvolver();
    const rate = ctx.sampleRate;
    const length = rate * 5;
    const impulse = ctx.createBuffer(2, length, rate);
    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (rate * 1.4));
      }
    }
    convolver.buffer = impulse;

    const dryGain = ctx.createGain();
    dryGain.gain.value = 0.5;
    const wetGain = ctx.createGain();
    wetGain.gain.value = 0.5;

    masterGain.connect(dryGain).connect(ctx.destination);
    masterGain.connect(convolver).connect(wetGain).connect(ctx.destination);
  }
  if (ctx.state === "suspended") {
    ctx.resume();
  }
  return ctx;
}

function bowlStrike(freq: number, vol: number, decay: number, time: number): void {
  const ac = ctx!;
  for (const partial of PARTIALS) {
    const osc = ac.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq * partial.ratio;
    osc.detune.value = (Math.random() - 0.5) * 6;

    const env = ac.createGain();
    env.gain.setValueAtTime(0.001, time);
    env.gain.linearRampToValueAtTime(vol * partial.gain, time + 0.02);
    env.gain.exponentialRampToValueAtTime(0.0001, time + decay);

    osc.connect(env).connect(masterGain!);
    osc.start(time);
    osc.stop(time + decay + 0.1);
  }
}

function startDrone(): void {
  const ac = ctx!;
  const now = ac.currentTime;

  for (const f of [73.42, 73.6]) {
    const osc = ac.createOscillator();
    osc.type = "sine";
    osc.frequency.value = f;
    const env = ac.createGain();
    env.gain.setValueAtTime(0, now);
    env.gain.linearRampToValueAtTime(0.03, now + 6);
    osc.connect(env).connect(masterGain!);
    osc.start(now);
  }
}

/** Get note from Y position (0 = top/high, 1 = bottom/low) */
function noteFromPosition(yNorm: number): number {
  // Invert: top of screen = high pitch
  const idx = Math.floor((1 - yNorm) * (SCALE.length - 1));
  return SCALE[Math.max(0, Math.min(SCALE.length - 1, idx))];
}

/** Tap — pitch based on Y position, intensity from force */
export function playBowl(intensity: number = 1, yNorm: number = 0.5): void {
  ensureContext();
  const now = ctx!.currentTime;

  const freq = noteFromPosition(yNorm);
  const vol = 0.1 * Math.min(intensity, 1.5);

  bowlStrike(freq, vol, 4 + Math.random() * 2, now);
  // Quiet octave below for depth
  bowlStrike(freq / 2, vol * 0.2, 5, now + 0.03);

  if (!dronePlaying) {
    startDrone();
    dronePlaying = true;
  }
}

/** Drag — pitch from Y position, softer */
export function playDragTone(yNorm: number = 0.5): void {
  if (!ctx) return;
  const now = ctx.currentTime;

  const freq = noteFromPosition(yNorm);
  bowlStrike(freq, 0.04, 2, now);
}

// Lightweight UI sound effects synthesized with the Web Audio API.
// No audio files, no licensing concerns — the tones (and the reverb
// impulse response) are generated in code.

let ctx = null;
let reverbBus = null;
let lastHoverTime = 0;

function getCtx() {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  // Browsers start the context "suspended" until a user gesture occurs.
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
  return ctx;
}

// Generate a decaying-noise impulse response for a soft, spacious reverb.
function makeImpulse(audio, duration, decay) {
  const rate = audio.sampleRate;
  const len = Math.max(1, Math.floor(rate * duration));
  const buf = audio.createBuffer(2, len, rate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
  }
  return buf;
}

// Shared reverb bus: convolver -> destination. Sources connect a small
// "send" gain into this to add a subtle tail.
function getReverb(audio) {
  if (reverbBus) return reverbBus;
  const convolver = audio.createConvolver();
  convolver.buffer = makeImpulse(audio, 2.4, 2.6);
  convolver.connect(audio.destination);
  reverbBus = convolver;
  return reverbBus;
}

// Call once on the first user gesture so later hover sounds aren't blocked
// by the browser autoplay policy.
export function unlockAudio() {
  getCtx();
}

// Deep, resonant gravitational "whoomp" with a subtle reverb tail.
export function playBlackholeSound() {
  const audio = getCtx();
  if (!audio) return;
  const now = audio.currentTime;

  const master = audio.createGain();
  master.connect(audio.destination);
  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(0.05, now + 0.02);
  master.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);

  // Subtle tail: feed a quiet copy into the reverb bus.
  const send = audio.createGain();
  send.gain.value = 0.18;
  send.connect(getReverb(audio));

  const filter = audio.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(900, now);
  filter.frequency.exponentialRampToValueAtTime(160, now + 0.6);
  filter.connect(master);
  filter.connect(send);

  const osc = audio.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(190, now);
  osc.frequency.exponentialRampToValueAtTime(42, now + 0.55);

  const sub = audio.createOscillator();
  sub.type = 'triangle';
  sub.frequency.setValueAtTime(95, now);
  sub.frequency.exponentialRampToValueAtTime(28, now + 0.55);
  sub.detune.value = 6;

  osc.connect(filter);
  sub.connect(filter);

  osc.start(now);
  sub.start(now);
  osc.stop(now + 0.75);
  sub.stop(now + 0.75);
}

// Light, short "plop" for hovering a work card: a quick downward pitch
// drop with a snappy ~0.1s envelope. Quiet, with a hint of reverb for air.
// Throttled so quick passes don't stack.
export function playCardHoverSound() {
  const audio = getCtx();
  if (!audio) return;
  const now = audio.currentTime;
  if (now - lastHoverTime < 0.05) return;
  lastHoverTime = now;

  const gain = audio.createGain();
  gain.connect(audio.destination);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);

  // Gentle low-pass keeps it soft rather than clicky.
  const filter = audio.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 1200;
  filter.connect(gain);

  // Faint reverb send for a touch of air.
  const send = audio.createGain();
  send.gain.value = 0.06;
  send.connect(getReverb(audio));
  filter.connect(send);

  // Fast downward sweep = the "plop".
  const osc = audio.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(520, now);
  osc.frequency.exponentialRampToValueAtTime(130, now + 0.08);
  osc.connect(filter);

  osc.start(now);
  osc.stop(now + 0.11);
}

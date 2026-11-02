// Short answer sounds, generated with Web Audio (no files, works offline).
// "Chime" for a correct answer, a soft "boop" for a wrong one.

let ctx = null;

function audio() {
  if (!ctx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    ctx = new AudioContext();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

// iPadOS only starts audio from a tap: wake the audio context on the first one.
document.addEventListener('pointerdown', () => audio(), { once: true, capture: true });

function tone(freq, at, duration, gain) {
  const c = audio();
  if (!c) return;
  const start = c.currentTime + at;
  const osc = c.createOscillator();
  const volume = c.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, start);
  volume.gain.setValueAtTime(0, start);
  volume.gain.linearRampToValueAtTime(gain, start + 0.005);
  volume.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(volume).connect(c.destination);
  osc.start(start);
  osc.stop(start + duration + 0.05);
}

/** Two bell notes going up (about 0.8 s). */
export function playCorrect() {
  tone(1047, 0, 0.5, 0.22);
  tone(1568, 0.12, 0.7, 0.22);
  tone(3136, 0.12, 0.4, 0.04); // A little shine on top.
}

/** Two soft notes going down (about 0.55 s). */
export function playWrong() {
  tone(392, 0, 0.22, 0.2);
  tone(330, 0.18, 0.35, 0.2);
}

// Speaking (speechSynthesis) and listening (SpeechRecognition) in Flemish Dutch.

const LANG = 'nl-BE';

// ---------- Speaking ----------

let voicesReady = null;

let loadedVoices = [];

function loadVoices() {
  if (!('speechSynthesis' in window)) return Promise.resolve([]);
  if (voicesReady) return voicesReady;
  voicesReady = new Promise((resolve) => {
    const have = speechSynthesis.getVoices();
    if (have.length) return resolve(have);
    const done = () => resolve(speechSynthesis.getVoices());
    speechSynthesis.addEventListener('voiceschanged', done, { once: true });
    setTimeout(done, 1500); // Some browsers never fire voiceschanged.
  }).then((voices) => {
    if (voices.length) loadedVoices = voices;
    else voicesReady = null; // Try again next time instead of caching nothing.
    return voices;
  });
  return voicesReady;
}

/** Call at startup so the first word can be spoken straight from a tap. */
export function preloadVoices() {
  return loadVoices();
}

const isFlemish = (v) => v.lang.replace('_', '-').toLowerCase() === 'nl-be';

// Apple voices come in several qualities with the same name (e.g.
// com.apple.voice.compact.nl-BE.Ellen and com.apple.voice.enhanced.nl-BE.Ellen).
function quality(voice) {
  const uri = voice.voiceURI.toLowerCase();
  if (uri.includes('premium')) return 3;
  if (uri.includes('enhanced')) return 2;
  if (uri.includes('super-compact')) return 0;
  return 1;
}

/** Flemish voices, one per name, in the best quality that is installed. */
function flemish(voices) {
  const best = new Map();
  for (const voice of voices.filter(isFlemish)) {
    const current = best.get(voice.name);
    if (!current || quality(voice) > quality(current)) best.set(voice.name, voice);
  }
  return [...best.values()];
}

/**
 * The Flemish voices to choose from, and whether only a basic-quality version
 * is installed (worth suggesting the enhanced download).
 */
export async function flemishVoiceInfo() {
  const all = (await loadVoices()).filter(isFlemish);
  const voices = flemish(all);
  // Only Apple voice ids say their quality. Several versions of one voice
  // means a better one is installed already.
  const onlyBasic =
    voices.length > 0 &&
    voices.every((v) => v.voiceURI.startsWith('com.apple.') && quality(v) < 2) &&
    all.length === voices.length;
  return { voices, onlyBasic };
}

export function canSpeak() {
  return 'speechSynthesis' in window;
}

// Bumped by every speak() and stopSpeaking(), so a call that was waiting for
// voices doesn't start talking after the screen changed.
let generation = 0;

/**
 * Says `text` and resolves when finished (or when interrupted).
 * options: { voiceURI, rate }
 */
export async function speak(text, { voiceURI, rate = 0.9 } = {}) {
  if (!canSpeak()) return;
  const mine = ++generation;
  speechSynthesis.cancel();
  // Use voices that are already loaded, so speak() still runs inside the tap
  // that started it (iOS only allows speech from a tap).
  const voices = loadedVoices.length ? loadedVoices : await loadVoices();
  if (mine !== generation) return;
  const choices = flemish(voices);

  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = LANG;
    u.rate = rate;
    // Without a Flemish voice installed, lang=nl-BE lets the system pick one.
    u.voice = choices.find((v) => v.voiceURI === voiceURI) || choices[0] || null;
    const started = Date.now();
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      clearInterval(guard);
      resolve();
    };
    u.onend = finish;
    u.onerror = finish;
    // Safari sometimes never fires onend. Poll instead of guessing a duration,
    // so we never resolve (and open the microphone) while audio still plays.
    const guard = setInterval(() => {
      const idle = !speechSynthesis.speaking && !speechSynthesis.pending;
      if (mine !== generation || (idle && Date.now() - started > 500) || Date.now() - started > 20000) finish();
    }, 250);
    speechSynthesis.speak(u);
  });
}

export function stopSpeaking() {
  generation++;
  if (canSpeak()) speechSynthesis.cancel();
}

// ---------- Listening ----------

const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;

// ---------- Diagnostics ----------
// What the recogniser reported, newest last. Shown when the microphone badge
// is tapped, to find out why listening fails on a device.

const speechLog = [];
const logWatchers = new Set();
const started = performance.now();

function log(text) {
  const seconds = ((performance.now() - started) / 1000).toFixed(1).padStart(6);
  speechLog.push(`${seconds}s  ${text}`);
  if (speechLog.length > 60) speechLog.shift();
  logWatchers.forEach((fn) => fn());
}

export function speechDiagnostics() {
  const standalone = navigator.standalone === true || matchMedia('(display-mode: standalone)').matches;
  const header = [
    `beginscherm-app: ${standalone ? 'ja' : 'nee'}`,
    `herkenning: ${window.SpeechRecognition ? 'SpeechRecognition' : window.webkitSpeechRecognition ? 'webkitSpeechRecognition' : 'geen'}`,
    navigator.userAgent,
  ];
  return [...header, '', ...speechLog].join('\n');
}

/** Calls fn whenever the log changes; returns an unsubscribe function. */
export function watchSpeechLog(fn) {
  logWatchers.add(fn);
  return () => logWatchers.delete(fn);
}

// Once the microphone (or speech service) is refused, stop asking until the
// page is reloaded: 'denied', 'unavailable' or 'dictation-off'.
let micBlocked = null;

// Listeners that want to hear something (even if the microphone is blocked),
// for simulateSpeech().
const live = new Set();

/** Test hook: pretend the child said `text` (only exposed on localhost). */
export function simulateSpeech(text) {
  live.forEach((listener) => listener.onResult([text], true));
}

// The iPad stops the microphone when the app goes to the background: pause
// cleanly and pick up again when the app is back.
document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopSpeaking();
  live.forEach((listener) => {
    if (!listener.active) return;
    if (document.hidden) listener._pause();
    else if (!listener.rec) {
      listener.failures = 0;
      listener._spawn();
    }
  });
});

export function canListen() {
  return Boolean(Recognition);
}

/**
 * Keeps listening until stop() is called, restarting the recogniser when the
 * browser ends it on its own.
 *
 * onResult(alternatives: string[], isFinal: boolean)
 * onState('listening' | 'idle' | 'denied' | 'unavailable' | 'dictation-off')
 * interim: also report interim results (fast for short commands; off for
 * numbers, where "vijf" may still become "vijfentwintig").
 * continuous: keep one session open; off makes Safari deliver the final
 * result as soon as the child stops talking (it restarts by itself).
 */
export class Listener {
  constructor({ onResult, onState = () => {}, interim = true, continuous = true }) {
    this.onResult = onResult;
    this.onState = onState;
    this.interim = interim;
    this.continuous = continuous;
    this.active = false;
    this.rec = null;
  }

  start() {
    live.add(this);
    if (!Recognition) {
      this.onState('unavailable');
      return;
    }
    if (micBlocked) {
      this.onState(micBlocked);
      return;
    }
    if (this.active) return;
    this.active = true;
    this.failures = 0;
    this._spawn();
  }

  stop() {
    this.active = false;
    live.delete(this);
    if (this.rec) {
      const rec = this.rec;
      this.rec = null;
      rec.onend = null;
      try { rec.abort(); } catch { /* already stopped */ }
    }
    this.onState(micBlocked || 'idle');
  }

  _pause() {
    if (!this.rec) return;
    const rec = this.rec;
    this.rec = null;
    rec.onend = null;
    try { rec.abort(); } catch { /* already stopped */ }
    this.onState('idle');
  }

  _spawn() {
    if (document.hidden) return; // Resumed by the visibilitychange handler.
    const rec = new Recognition();
    rec.lang = LANG;
    rec.continuous = this.continuous;
    rec.interimResults = this.interim;
    rec.maxAlternatives = 3;

    rec.onstart = () => {
      log('start');
      this.onState('listening');
    };
    for (const name of ['audiostart', 'soundstart', 'speechstart', 'speechend', 'soundend', 'audioend', 'nomatch']) {
      rec.addEventListener(name, () => log(name));
    }
    rec.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const alternatives = Array.from(result, (alt) => alt.transcript.trim()).filter(Boolean);
        log(`result${result.isFinal ? ' (final)' : ''}: ${alternatives.map((a) => `"${a}"`).join(' | ') || '(leeg)'}`);
        if (alternatives.length) this.onResult(alternatives, result.isFinal);
      }
    };
    rec.onerror = (event) => {
      log(`error: ${event.error}${event.message ? ` – ${event.message}` : ''}`);
      // not-allowed: no microphone permission. service-not-allowed: speech
      // recognition is off (on a Mac: Siri/Dictation disabled).
      // iPadOS reports "aborted – Siri and Dictation are disabled" when
      // Dictation is off; retrying won't help.
      const dictationOff = /dictation/i.test(event.message || '');
      const blocked = dictationOff
        ? 'dictation-off'
        : { 'not-allowed': 'denied', 'service-not-allowed': 'unavailable' }[event.error];
      if (blocked) {
        micBlocked = blocked;
        this.active = false;
        this.onState(blocked);
      }
    };
    rec.onend = () => {
      log(`end (na ${((Date.now() - startedAt) / 1000).toFixed(1)}s)`);
      if (this.rec !== rec) return;
      this.rec = null;
      if (!this.active) {
        if (!micBlocked) this.onState('idle');
        return;
      }
      // Restart quickly after a normal end, slower when it keeps failing.
      const quickEnd = Date.now() - startedAt < 1000;
      this.failures = quickEnd ? this.failures + 1 : 0;
      if (this.failures >= 5) {
        log('opgegeven: 5 keer na elkaar meteen gestopt');
        this.active = false;
        this.onState('unavailable');
        return;
      }
      setTimeout(() => this.active && !this.rec && this._spawn(), 250 * 2 ** this.failures);
    };

    this.rec = rec;
    const startedAt = Date.now();
    log(`starten (continuous=${rec.continuous}, interim=${rec.interimResults})`);
    try {
      rec.start();
    } catch (error) {
      log(`start mislukt: ${error.message}`);
      this.rec = null;
      this.onState('unavailable');
    }
  }
}

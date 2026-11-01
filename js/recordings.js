// Words recorded in a parent's own voice. Stored only on this device
// (IndexedDB), never uploaded. Keyed by the spoken form of the word, so a
// word that appears in several packages is recorded once.

const DB_NAME = 'huiswerk';
const STORE = 'recordings';

export const recordingKey = (spoken) => spoken.trim().toLowerCase().replace(/\s+/g, ' ');

let dbPromise = null;

function db() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => request.result.createObjectStore(STORE);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    dbPromise.catch(() => { dbPromise = null; });
  }
  return dbPromise;
}

async function run(mode, action) {
  const database = await db();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(STORE, mode);
    const request = action(tx.objectStore(STORE));
    tx.oncomplete = () => resolve(request.result);
    tx.onerror = () => reject(tx.error);
  });
}

export async function saveRecording(spoken, blob) {
  await run('readwrite', (store) => store.put(blob, recordingKey(spoken)));
}

export async function deleteRecording(spoken) {
  await run('readwrite', (store) => store.delete(recordingKey(spoken)));
}

export async function getRecording(spoken) {
  try {
    return (await run('readonly', (store) => store.get(recordingKey(spoken)))) || null;
  } catch {
    return null;
  }
}

/** Keys of all recorded words, as a Set. Empty if storage is unavailable. */
export async function recordedKeys() {
  try {
    return new Set(await run('readonly', (store) => store.getAllKeys()));
  } catch {
    return new Set();
  }
}

/** Object URLs for the words of a round that have a recording: Map<key, url>. */
export async function loadUrls(spokenWords) {
  const urls = new Map();
  for (const spoken of spokenWords) {
    const key = recordingKey(spoken);
    if (urls.has(key)) continue;
    const blob = await getRecording(spoken);
    if (blob) urls.set(key, URL.createObjectURL(blob));
  }
  return urls;
}

export function revokeUrls(urls) {
  urls.forEach((url) => URL.revokeObjectURL(url));
}

// ---------- Playback ----------

// One shared element: once iOS has let it play from a tap, later plays
// (started by a voice command) are allowed too.
const player = new Audio();
let playToken = 0;

/**
 * Plays `url` and resolves when it ends or is interrupted. Call it without
 * awaiting anything first when it starts from a tap (iOS).
 */
export function playUrl(url) {
  const mine = ++playToken;
  player.pause();
  player.src = url;
  return new Promise((resolve) => {
    const started = Date.now();
    const finish = () => {
      clearInterval(guard);
      player.removeEventListener('ended', finish);
      player.removeEventListener('error', finish);
      resolve();
    };
    player.addEventListener('ended', finish);
    player.addEventListener('error', finish);
    // Also covers interruption by stopPlayback() or a newer playUrl().
    const guard = setInterval(() => {
      if (mine !== playToken || (player.paused && Date.now() - started > 500) || Date.now() - started > 15000) finish();
    }, 200);
    player.play().catch(finish);
  });
}

export function stopPlayback() {
  playToken++;
  player.pause();
}

// ---------- Recording ----------

export function canRecord() {
  return Boolean(navigator.mediaDevices?.getUserMedia && window.MediaRecorder);
}

function pickMimeType() {
  // Safari records mp4/AAC; Chrome and Firefox record webm/Opus.
  return ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm'].find((t) => MediaRecorder.isTypeSupported(t)) || '';
}

/**
 * Microphone session for the recording screen. open() asks for permission
 * once; record() returns a handle whose stop() resolves with the audio Blob.
 */
export class Recorder {
  async open() {
    if (this.stream) return;
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    });
  }

  record({ maxMs = 6000 } = {}) {
    const mimeType = pickMimeType();
    const recorder = new MediaRecorder(this.stream, mimeType ? { mimeType } : undefined);
    const chunks = [];
    recorder.ondataavailable = (event) => event.data.size && chunks.push(event.data);
    const done = new Promise((resolve) => {
      recorder.onstop = () => resolve(new Blob(chunks, { type: recorder.mimeType || mimeType }));
    });
    recorder.start();
    const limit = setTimeout(() => recorder.state === 'recording' && recorder.stop(), maxMs);
    return {
      done,
      stop() {
        clearTimeout(limit);
        if (recorder.state === 'recording') recorder.stop();
        return done;
      },
    };
  }

  close() {
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
  }
}

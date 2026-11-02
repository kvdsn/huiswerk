// Offline support. The app's own files come from the network when possible
// (so a new version always arrives as one consistent set) and from the cache
// when the iPad is offline. Other origins (Google Fonts) are left alone.

const CACHE = 'huiswerk-v1';
const FILES = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/style.css',
  'js/app.js',
  'js/settings.js',
  'js/speech.js',
  'js/recordings.js',
  'js/logic/commands.js',
  'js/logic/words.js',
  'js/logic/math.js',
  'js/ui/mascot.js',
  'js/ui/sounds.js',
  'js/ui/stickers.js',
  'js/logic/stickerbook.js',
  'js/stickerStore.js',
  'data/woordpakketten.json',
  'assets/icon.svg',
  'assets/sparkles.svg',
  'assets/icon-192.png',
  'assets/icon-512.png',
  'assets/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== location.origin) return;
  event.respondWith(networkFirst(event.request));
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetchWithTimeout(request, 4000);
    if (response.ok) await cache.put(request, response.clone());
    return response;
  } catch {
    return (await cache.match(request)) || (await cache.match('./')) || Response.error();
  }
}

function fetchWithTimeout(request, ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(request, { cache: 'no-cache', signal: controller.signal }).finally(() => clearTimeout(timer));
}

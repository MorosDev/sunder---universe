/* sonder. — service worker: permite instalar la app y abrirla sin internet.
   Estrategia "red primero": si hay internet siempre carga la versión más nueva;
   si no hay, usa la copia guardada. */
const CACHE = 'sonder-v1';
const SHELL = [
  './', 'index.html', 'manifest.webmanifest',
  'styles/main.css', 'styles/social.css', 'styles/universe.css', 'styles/forums.css',
  'scripts/core.js', 'scripts/storage.js', 'scripts/navigation.js', 'scripts/interactions.js',
  'scripts/social.js', 'scripts/profile.js', 'scripts/messages.js', 'scripts/universe.js',
  'scripts/forums.js', 'scripts/origin.js', 'scripts/app.js',
  'data/accounts.js', 'data/planets.js', 'data/discussions.js', 'data/responses.js',
  'assets/icons/icon-192.png', 'assets/icons/icon-512.png', 'assets/icons/favicon.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const isFont = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  if (url.origin !== self.location.origin && !isFont) return;
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res && (res.ok || res.type === 'opaque')) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req).then((r) => r || (req.mode === 'navigate' ? caches.match('index.html') : undefined)))
  );
});

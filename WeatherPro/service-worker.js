const CACHE_NAME = 'weatherpro-v2';
const ASSETS_TO_CACHE = [
  '.',
  'index.html',
  'manifest.json',
  'css/variables.css',
  'css/style.css',
  'css/responsive.css',
  'css/animations.css',
  'js/config.js',
  'js/api.js',
  'js/icons.js',
  'js/ui.js',
  'js/app.js',
  'assets/icons/weatherpro.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
    ))
  );
});

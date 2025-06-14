self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open('guvnl-cache-v1').then(cache => cache.addAll([
      '/',
      '/index.html',
    ]))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
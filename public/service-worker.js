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
  // Skip caching for API requests
  if (event.request.url.includes('127.0.0.1:5000')) {
    event.respondWith(
      fetch(event.request.clone())
        .catch(error => {
          console.error('Fetch failed:', error);
          throw error;
        })
    );
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
      .catch(error => {
        console.error('Cache match failed:', error);
        return fetch(event.request);
      })
  );
});
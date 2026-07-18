self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Pass-through fetch (network first)
  // For a true offline experience, we'd cache assets here
  // But for now, this satisfies the PWA installability requirements
  event.respondWith(fetch(event.request));
});

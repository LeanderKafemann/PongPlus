// Service Worker intentionally disabled in v1.4.2
// This file unregisters itself if installed, so no SW caching interferes with development or production.
self.addEventListener('install', (event) => {
    // unregister immediately
    self.registration.unregister().then(() => {
        // do nothing
    }).catch(() => { });
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    // no-op - do not control clients
    self.clients && self.clients.claim && self.clients.claim();
});

// fallback: respond with network (no caching)
self.addEventListener('fetch', (event) => {
    event.respondWith(fetch(event.request));
});
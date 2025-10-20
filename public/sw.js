/**
 * PongPlus Service Worker
 * @version 1.4.1
 *
 * Network-first for HTML, cache-first for assets.
 * GitHub Pages aware paths.
 */

const CACHE_NAME = 'pongplus-v1.4.1';
const ASSET_CACHE = 'pongplus-assets-v1.4.1';

const urlsToPrecache = [
    '/PongPlus/',
    '/PongPlus/index.html',
    '/PongPlus/manifest.json',
    '/PongPlus/public/favicon.svg',
    '/PongPlus/sw.js',
    '/PongPlus/src/style.css'
];

// Install: precache assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(ASSET_CACHE).then(cache => cache.addAll(urlsToPrecache))
    );
    self.skipWaiting();
});

// Activate: cleanup old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(keys => Promise.all(keys.map(k => {
            if (k !== CACHE_NAME && k !== ASSET_CACHE) return caches.delete(k);
            return Promise.resolve();
        })))
    );
    self.clients.claim();
});

// Fetch handler:
// - HTML pages: network-first (so we don't serve stale UI after updates)
// - assets: cache-first
self.addEventListener('fetch', (event) => {
    const req = event.request;
    const url = new URL(req.url);

    // only intercept same-origin requests for the app scope
    if (!url.pathname.startsWith('/PongPlus')) {
        return;
    }

    if (req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html')) {
        // network-first
        event.respondWith(
            fetch(req).then(response => {
                const copy = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
                return response;
            }).catch(() => caches.match('/PongPlus/index.html'))
        );
        return;
    }

    // for other assets: cache-first
    event.respondWith(
        caches.match(req).then(cached => cached || fetch(req).then(networkResp => {
            caches.open(ASSET_CACHE).then(cache => cache.put(req, networkResp.clone()));
            return networkResp;
        })).catch(() => fetch(req))
    );
});
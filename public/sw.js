/**
 * PongPlus Service Worker
 * @version 1.4.0
 *
 * GitHub Pages aware paths.
 */

const CACHE_NAME = 'pongplus-v1.4.0';
const urlsToCache = [
    '/PongPlus/',
    '/PongPlus/index.html',
    '/PongPlus/manifest.json',
    '/PongPlus/public/favicon.svg',
    '/PongPlus/sw.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(keys => Promise.all(keys.map(k => {
            if (k !== CACHE_NAME) return caches.delete(k);
            return Promise.resolve();
        })))
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then(resp => resp || fetch(event.request))
    );
});
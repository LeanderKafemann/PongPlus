/**
 * PongPlus Service Worker
 * @version 1.4.0
 *
 * Note: store the right URLs for GitHub Pages (repo hosted at /PongPlus/)
 */

const CACHE_NAME = 'pongplus-v1.4.0';
const urlsToCache = [
    '/PongPlus/',
    '/PongPlus/index.html',
    '/PongPlus/manifest.json',
    '/PongPlus/sw.js',
    '/PongPlus/public/favicon.svg'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
            .catch(err => console.error('Cache addAll failed:', err))
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(cacheNames.map(cacheName => {
                if (cacheName !== CACHE_NAME) {
                    return caches.delete(cacheName);
                }
            }));
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => response || fetch(event.request))
    );
});
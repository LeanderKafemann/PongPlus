/**
 * PongPlus Service Worker
 * @version 1.3.1
 */

const CACHE_NAME = 'pongplus-v1.3.1';
const urlsToCache = [
    '/',
    '/index.html',
    '/src/main.ts',
    '/src/style.css',
    '/src/game/PongGame.ts',
    '/src/game/Ball.ts',
    '/src/game/Paddle.ts',
    '/src/game/AbilitySystem.ts',
    '/src/game/types.ts',
    '/src/managers/SoundManager.ts',
    '/src/managers/MusicManager.ts',
    '/src/managers/LeaderboardManager.ts',
    '/public/favicon.svg'
];

// Install
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
    self.skipWaiting();
});

// Activate
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});
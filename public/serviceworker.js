const CACHE_NAME = 'ocr-v1';

const urlsToCache = ['index.html','offline.html'];

const self = this;

//Install ServiceWorker

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(urlsToCache);
            })
    );
})


self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then(() => {
                return fetch(event.request)
                    .catch((err) => caches.match('offline.html'));
            })
    )
})


self.addEventListener('activate', (event) => {
    const cacheWhitelist = []
    cacheWhitelist.push(CACHE_NAME);

    event.waitUntil(
        caches.keys()
            .then((cacheNames)  => Promise.all(
                cacheNames.map((cacheName) => {
                    if (!cacheWhitelist.includes(cacheName))
                        return caches.delete(cacheName);
                })
            ))
    )
})
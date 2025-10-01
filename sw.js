const CACHE_NAME = 'telugu-news-v1';
const urlsToCache = [
    '/',
    '/tns2/src/css/style.css',
    '/tns2/src/css/marketing.css',
    '/tns2/src/js/marketing.js',
    '/tns2/src/images/logo.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            }
        )
    );
});

self.addEventListener('push', (event) => {
    const options = {
        body: event.data.text(),
        icon: '/tns2/src/images/icon-192.png',
        badge: '/tns2/src/images/badge-72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: '2'
        },
        actions: [
            {
                action: 'explore',
                title: 'Read More',
                icon: '/tns2/src/images/icon-72.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/tns2/src/images/icon-72.png'
            },
        ]
    };

    event.waitUntil(
        self.registration.showNotification('తెలుగు వార్తలు', options)
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/tns2/src/latest-news')
        );
    }
});

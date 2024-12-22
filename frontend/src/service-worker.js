// This is your service worker file. Note that we don't use imports here
// because service workers need to be self-contained JavaScript files.

/* eslint-disable no-restricted-globals */

// These variables will be replaced by Workbox during build
const CACHE_NAME = 'my-app-cache-v1';
const PRECACHE_MANIFEST = self.__WB_MANIFEST || [];

self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_MANIFEST);
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.');
});

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('Push received:', event);

  const options = {
    body: event.data ? event.data.text() : 'No payload',
    icon: '/logo192.png',
    badge: '/logo192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      {
        action: 'explore',
        title: 'View'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('New Message', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received:', event);
  event.notification.close();

  event.waitUntil(
    clients.openWindow('/')
  );
});

// This allows the web app to trigger skipWaiting via registration.waiting.postMessage({type: 'SKIP_WAITING'})
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
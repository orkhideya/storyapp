import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import CONFIG from './config.js';

// Precache semua aset yang di-bundle oleh Webpack
precacheAndRoute(self.__WB_MANIFEST || []);

self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(self.clients.claim());
});

// Cache Google Fonts
registerRoute(
  ({ url }) => url.origin === 'https://fonts.googleapis.com' || 
               url.origin === 'https://fonts.gstatic.com',
  new CacheFirst({
    cacheName: 'google-fonts-v1',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  })
);

// Cache FontAwesome
registerRoute(
  ({ url }) => 
    url.origin === 'https://cdnjs.cloudflare.com' || 
    url.origin === 'https://kit.fontawesome.com' ||
    url.origin === 'https://ka-f.fontawesome.com' ||
    url.origin.includes('fontawesome'),
  new CacheFirst({
    cacheName: 'fontawesome-v1',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  })
);

// Cache Avatars API
registerRoute(
  ({ url }) => url.origin === 'https://ui-avatars.com',
  new CacheFirst({
    cacheName: 'avatars-api-v1',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  })
);

// Cache Story API (non-image)
registerRoute(
  ({ request, url }) => {
    try {
      const baseUrl = new URL(CONFIG.BASE_URL);
      return baseUrl.origin === url.origin && request.destination !== 'image';
    } catch (e) {
      return false;
    }
  },
  new NetworkFirst({
    cacheName: 'story-api-v1',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  })
);

// Cache Story API Images
registerRoute(
  ({ request, url }) => {
    try {
      const baseUrl = new URL(CONFIG.BASE_URL);
      return baseUrl.origin === url.origin && request.destination === 'image';
    } catch (e) {
      return false;
    }
  },
  new StaleWhileRevalidate({
    cacheName: 'story-api-images-v1',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  })
);

// Cache MapTiler
registerRoute(
  ({ url }) => url.origin.includes('maptiler'),
  new CacheFirst({
    cacheName: 'maptiler-api-v1',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  })
);

// Push Notification Handler
self.addEventListener('push', (event) => {
  let notificationData = {
    title: 'Story App',
    options: {
      body: 'You have a new notification',
      icon: '/images/logo.png',
      badge: '/favicon.png',
    },
    data: {},
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        title: data.title || notificationData.title,
        options: {
          ...notificationData.options,
          ...(data.options || {}),
        },
        data: data.data || {},
      };
    } catch {
      try {
        const text = event.data.text();
        notificationData.options.body = text;
      } catch {
        // ignore
      }
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData.options)
  );
});

// Notification Click Handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const notificationData = event.notification.data || {};
  const urlToOpen = notificationData.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
      return null;
    })
  );
});
// Kiosco10 Service Worker — PWA Cache & Offline Support
const CACHE_NAME = 'kiosco10-static-v1.0.0';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg'
];

// Instalación: Precargar recursos esenciales
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activación: Limpieza de cachés antiguas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estrategia de Fetch:
// - Para llamadas a Supabase (API / Realtime / Auth): Siempre Red primero (Network Only / Network First)
//   NUNCA devolver datos cacheados obsoletos en pedidos.
// - Para recursos estáticos (HTML, JS, CSS, imágenes): Cache First / Stale While Revalidate
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // No cachear peticiones POST/PUT/PATCH ni peticiones al backend de Supabase
  if (
    event.request.method !== 'GET' ||
    requestUrl.hostname.includes('supabase.co') ||
    requestUrl.pathname.includes('/rest/v1/') ||
    requestUrl.pathname.includes('/auth/v1/')
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // En segundo plano revalidar recursos estáticos
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
          }
        }).catch(() => {
          // Sin conexión: nada que actualizar, continúa con la caché
        });
        return cachedResponse;
      }

      // Si no está en caché, buscar en red
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      }).catch(() => {
        // Fallback offline para navegación HTML
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});


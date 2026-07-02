/// <reference lib="webworker" />

export {};

declare const self: ServiceWorkerGlobalScope & { __WB_MANIFEST: Array<{ url: string; revision: string | null }> };

const CACHE_NAME = 'innova-static-v1';
const PRECACHE_URLS = self.__WB_MANIFEST.map((entry) => entry.url);
const APP_SHELL = Array.from(new Set(['/', '/dashboard', '/manifest.webmanifest', '/icons/icon.svg', ...PRECACHE_URLS]));
const CRITICAL_API_PATTERNS = ['/api/auth', '/api/sales', '/api/cash', '/api/purchases', '/api/inventory/products/'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))).then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;
  if (url.pathname.startsWith('/api')) return;
  if (CRITICAL_API_PATTERNS.some((pattern) => url.pathname.includes(pattern))) return;

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match('/').then((response) => response ?? Response.error())));
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        const copy = response.clone();
        if (response.ok && ['style', 'script', 'image', 'font'].includes(request.destination)) {
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    }),
  );
});

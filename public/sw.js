const CACHE_NAME = "music-app-cache-v1";
const API_CACHE_NAME = "music-api-cache-v1";
const STATIC_FILES = [
  "/",
  "/offline",
  "/favicon.ico",
  "/manifest.json",
  "/lib/utils.js",
  "/_next/static/", // Cache Next.js static files
  "/_next/image", // Cache images
];

// Install event - Cache static files
self.addEventListener("install", (event) => {
  self.skipWaiting(); // Force new SW to take control immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_FILES);
    })
  );
});

// Fetch event - Serve cached content & cache API responses
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Handle API caching
  if (url.origin === "https://saavn.dev") {
    event.respondWith(
      caches.open(API_CACHE_NAME).then(async (cache) => {
        try {
          const response = await fetch(event.request);
          cache.put(event.request, response.clone()); // Cache API response
          return response;
        } catch (error) {
          return (
            cache.match(event.request) ||
            new Response("Offline", { status: 503 })
          );
        }
      })
    );
    return;
  }

  // Serve cached static assets
  event.respondWith(
    caches.match(event.request).then((response) => {
      return (
        response ||
        fetch(event.request)
          .then((fetchResponse) => {
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, fetchResponse.clone()); // Cache new response
              return fetchResponse;
            });
          })
          .catch(() => caches.match("/offline")) // Serve offline page if request fails
      );
    })
  );
});

// Activate event - Cleanup old caches & take control immediately
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cache) => {
          if (![CACHE_NAME, API_CACHE_NAME].includes(cache)) {
            return caches.delete(cache);
          }
        })
      )
    )
  );
  self.clients.claim(); // Claim active clients immediately
});

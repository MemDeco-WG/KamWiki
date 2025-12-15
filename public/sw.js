/*
  public/sw.js — Basic Service Worker for Kam Web UI

  - Provides a simple caching strategy:
    - Pre-caches critical assets (index.html, CSS, icons)
    - Uses cache-first for same-origin static assets
    - Uses network-first for navigation (SPA HTML) to keep latest content,
      falling back to cached index.html if offline
    - Caches runtime responses so subsequent loads are faster and available offline
    - Removes stale caches on activation
    - Supports `skipWaiting()` via postMessage from the client for safe SW updates
*/

const CACHE_VERSION = "v2";
const PRECACHE = `kam-precache-${CACHE_VERSION}`;
const RUNTIME = `kam-runtime-${CACHE_VERSION}`;

// Derive a base path at runtime so the service worker works correctly when the site
// is served from a sub-path (e.g. GitHub Pages project sites like /<user>/<repo>/).
// We derive the base from the SW's own location (self.location.href), which for a
// deployed site such as https://<user>.github.io/<repo>/sw.js resolves to the repo base.
const BASE = (function () {
  try {
    return new URL(".", self.location.href).pathname;
  } catch (e) {
    return "/";
  }
})();

// Files to pre-cache — keep this conservative and predictable across builds
// (Vite will replace hashed assets in production; this list focuses on canonical entry points)
const PRECACHE_URLS = [
  BASE, // HTML entry (base path)
  `${BASE}index.html`, // Base page
  `${BASE}favicon.ico`, // Small icon
  `${BASE}vite.svg`, // Dev / placeholder icon (if present)
  `${BASE}src/assets/main.css`, // Primary stylesheet (dev) — build will serve hashed CSS in production
];

// A tiny utility for logging that can be toggled off for release
const LOG = true;
const debug = (...args) => {
  if (LOG && typeof console !== "undefined") console.debug("[SW]", ...args);
};

self.addEventListener("install", (event) => {
  debug("install event — caching static assets");
  event.waitUntil(
    (async () => {
      const cache = await caches.open(PRECACHE);
      try {
        await cache.addAll(PRECACHE_URLS);
        debug("precache complete");
      } catch (err) {
        // If addAll fails (e.g., one file 404s), fallback to individually caching assets.
        debug("precache.addAll failed — trying individual cache", err);
        for (const url of PRECACHE_URLS) {
          try {
            await cache.add(url);
          } catch (e) {
            debug("Failed to cache", url, e);
          }
        }
      }
      // Ensure the service worker moves to active as soon as possible
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  debug("activate event — cleaning old caches");
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => {
          if (![PRECACHE, RUNTIME].includes(key)) {
            debug("deleting old cache", key);
            return caches.delete(key);
          }
        }),
      );
      // Take immediate control of all clients
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Only handle GET requests
  if (request.method !== "GET") {
    return; // Let the network handle non-GET requests (POST/PUT)
  }

  const url = new URL(request.url);

  // Handle navigation requests (SPA entry: serve the index page)
  const isNavigation =
    request.mode === "navigate" ||
    (request.headers.get("accept") &&
      request.headers.get("accept").includes("text/html"));

  if (isNavigation) {
    event.respondWith(
      (async () => {
        const INDEX = BASE + "index.html";
        try {
          // Network-first for HTML (so users get fresh app code)
          const response = await fetch(request);
          // Update the runtime cache with the latest index.html
          const cache = await caches.open(RUNTIME);
          // Note: for navigation, cache the response for offline fallback
          cache.put(INDEX, response.clone());
          return response;
        } catch (err) {
          // If offline, try to serve the cached index.html (precache or runtime)
          const cached = await caches.match(INDEX);
          if (cached) {
            return cached;
          }
          // If there is nothing cached, return a sensible fallback Response
          return new Response(
            "<h1>Offline</h1><p>The application is offline and not cached.</p>",
            {
              headers: { "Content-Type": "text/html" },
              status: 503,
              statusText: "Service Unavailable",
            },
          );
        }
      })(),
    );
    return;
  }

  // For same-origin requests, prefer cache-first to reduce latency and serve offline
  if (url.origin === location.origin) {
    event.respondWith(
      (async () => {
        // Try to find a cache match first
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }

        try {
          // Otherwise try the network and add the response to the runtime cache
          const networkResponse = await fetch(request);
          // Do not attempt to cache opaque responses (CORS) unless you intentionally want to
          const cache = await caches.open(RUNTIME);
          // Clone the response to avoid locking the stream
          cache.put(request, networkResponse.clone()).catch((e) => {
            // ignore caching errors; still return the networkResponse
            debug("Runtime cache put failed for", request.url, e);
          });
          return networkResponse;
        } catch (err) {
          // On network failure, try to return the offline fallback matched by route or the nearest cache
          const fallback = await caches.match(request);
          if (fallback) return fallback;
          // Otherwise, respond with 503 (Service unavailable)
          return new Response(null, {
            status: 503,
            statusText: "Service Unavailable",
          });
        }
      })(),
    );
    return;
  }

  // For cross-origin requests, use a network-first approach with fallback to cache (optional)
  event.respondWith(
    (async () => {
      try {
        const networkResponse = await fetch(request);
        return networkResponse;
      } catch (err) {
        const cacheResponse = await caches.match(request);
        if (cacheResponse) return cacheResponse;
        return new Response(null, {
          status: 503,
          statusText: "Service Unavailable",
        });
      }
    })(),
  );
});

/*
  SW message handlers for extra control:
  - Skip waiting on the next SW install (from the page)
*/
self.addEventListener("message", (event) => {
  if (!event.data) return;
  if (event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

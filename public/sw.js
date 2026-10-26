// Trybe service worker. Keeps an offline page ready, so opening the installed
// app with no connection shows a friendly screen instead of a browser error.
// Everything else goes to the network as usual.
const CACHE = "trybe-offline-v2";
const OFFLINE_URL = "/offline";
const PRECACHE = [OFFLINE_URL, "/brand/storm-icon.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.mode !== "navigate") return;
  event.respondWith(
    fetch(event.request).catch(() => caches.match(OFFLINE_URL).then((response) => response || Response.error())),
  );
});

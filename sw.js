// Service worker: page shell from cache (works offline), stats.json always from the network
// with the last good copy as a fallback.
const SHELL = "mayhem-shell-v3";
const FILES = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "icon-180.png"];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(SHELL).then((c) => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener("activate", (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== SHELL && k !== "mayhem-data").map((k) => caches.delete(k))))); self.clients.claim(); });
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  if (url.pathname.endsWith("/stats.json")) {
    e.respondWith(fetch(e.request).then((r) => { const copy = r.clone(); caches.open("mayhem-data").then((c) => c.put("stats.json", copy)); return r; })
      .catch(() => caches.match("stats.json")));
    return;
  }
  e.respondWith(fetch(e.request).then((r) => { const copy = r.clone(); caches.open(SHELL).then((c) => c.put(e.request, copy)); return r; }).catch(() => caches.match(e.request)));
});

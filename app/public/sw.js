const CACHE = "calendar-shell-v2";
const ASSETS = ["./", "./index.html", "./manifest.webmanifest"];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    const copy = response.clone();
    caches.open(CACHE).then(cache => cache.put(event.request, copy));
    return response;
  }).catch(() => caches.match("./index.html"))));
});
// Real Web Push payloads can be delivered here once a VAPID/Web Push backend is connected.
self.addEventListener("push", event => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch { data = { title: "Мой календарь" }; }
  event.waitUntil(self.registration.showNotification(data.title || "Мой календарь", {
    body: data.body || "У вас есть напоминание",
    icon: "./icon-192.svg",
    badge: "./icon-192.svg",
    tag: data.tag || "calendar-reminder",
    data: data.url || "./"
  }));
});
self.addEventListener("notificationclick", event => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data || "./"));
});

/* eslint-disable no-console */
/**
 * Service Worker for Push Notifications
 * Handles background push notifications for SkaiScrape
 */

// Cache name for offline assets
const CACHE_NAME = "skaiscrape-v1";
const OFFLINE_URL = "/offline";

// Install event - cache critical assets
self.addEventListener("install", (event) => {
  console.log("[SW] Installing Service Worker");
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.add(new Request(OFFLINE_URL, { cache: "reload" })))
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Service Worker activated");
  event.waitUntil(clients.claim());
});

// Push event - handle incoming push notifications
self.addEventListener("push", (event) => {
  console.log("[SW] Push received");

  let data = {
    title: "SkaiScrape",
    body: "You have a new notification",
    icon: "/images/icon-192x192.png",
    badge: "/images/badge-72x72.png",
    data: {},
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      console.error("[SW] Error parsing push data:", e);
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || "/images/icon-192x192.png",
    badge: data.badge || "/images/badge-72x72.png",
    image: data.image,
    data: data.data,
    actions: data.actions || [],
    tag: data.tag || "default",
    requireInteraction: data.requireInteraction || false,
    vibrate: [200, 100, 200],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Notification click event - handle user clicking notification
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked");

  event.notification.close();

  // Get the notification data
  const data = event.notification.data || {};

  // Determine the URL to open
  let urlToOpen = "/";

  if (data.type === "new_message" && data.conversationId) {
    urlToOpen = `/portal/messages/${data.conversationId}`;
  } else if (data.type === "new_connection" || data.type === "connection_accepted") {
    urlToOpen = "/portal/network";
  } else if (data.type === "claim_update" && data.claimId) {
    urlToOpen = `/claims/${data.claimId}`;
  } else if ((data.type === "like" || data.type === "comment") && data.postId) {
    urlToOpen = `/portal/feed?post=${data.postId}`;
  } else if (data.url) {
    urlToOpen = data.url;
  }

  // Handle action clicks
  if (event.action === "reply" && data.conversationId) {
    urlToOpen = `/portal/messages/${data.conversationId}`;
  } else if (event.action === "view") {
    // Use default urlToOpen
  } else if (event.action === "dismiss") {
    return; // Just close the notification
  }

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Check if app is already open
      for (const client of clientList) {
        if (client.url.includes(self.registration.scope) && "focus" in client) {
          client.navigate(urlToOpen);
          return client.focus();
        }
      }
      // Open new window if app is not open
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Notification close event - track dismissals
self.addEventListener("notificationclose", (event) => {
  console.log("[SW] Notification dismissed");
  // Could track dismissals for analytics here
});

// Fetch event - serve offline page when navigation fails
self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.open(CACHE_NAME).then((cache) => cache.match(OFFLINE_URL))
      )
    );
  }
});

// Background sync for offline support
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-messages") {
    console.log("[SW] Background sync: messages");
    // Could sync pending messages here
  }
});

// Handle messages from main thread
self.addEventListener("message", (event) => {
  console.log("[SW] Message received:", event.data);

  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

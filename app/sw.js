const UR_SW_VERSION = "ur-pwa-v1.0.18";
const UR_STATIC_CACHE = `${UR_SW_VERSION}-static`;
const UR_RUNTIME_CACHE = `${UR_SW_VERSION}-runtime`;

const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./offline.html",
  "./site.webmanifest",
  "./estilo_corrigido_questoes.css?v=76",
  "./app.js?v=108",
  "./banco_questoes.js?v=16",
  "./firebase-config.js?v=12",
  "./firebase-service.js?v=39",
  "./js/relatividade-trilha.js?v=3",
  "./style/relatividade-trilha.css?v=6",
  "./imagens/relatividade-especial/relogio-relatividade-card.jpg",
  "./js/vendor/gsap.min.js?v=1",
  "./js/vendor/ScrollTrigger.min.js?v=1",
  "./js/vendor/galaxyjs-animations.js?v=1",
  "./js/vendor/galaxyjs-main.js?v=1",
  "./js/ur-libraries.js?v=1",
  "./js/pwa-register.js?v=2",
  "./style/vendor/galaxyjs/animations.css?v=1",
  "./images/favicon/favicon-192.png",
  "./images/favicon/favicon-512.png",
  "./images/favicon/apple-touch-icon.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(UR_STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith("ur-pwa-") && !key.startsWith(UR_SW_VERSION))
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

function isSameOrigin(request) {
  return new URL(request.url).origin === self.location.origin;
}

function isHtmlRequest(request) {
  return request.mode === "navigate" || request.headers.get("accept")?.includes("text/html");
}

function isFreshAssetRequest(request) {
  const url = new URL(request.url);
  return ["script", "style", "worker", "manifest"].includes(request.destination) ||
    /\.(?:js|css|mjs|json)$/i.test(url.pathname);
}

async function networkFirst(request, options = {}) {
  const cache = await caches.open(UR_RUNTIME_CACHE);
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) return cached;
    if (options.offlineFallback) return caches.match("./offline.html");
    return Response.error();
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(UR_RUNTIME_CACHE);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response && response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached || Response.error());
  return cached || network;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || !isSameOrigin(request)) return;
  if (request.url.includes("/__/") || request.url.includes("firestore.googleapis.com")) return;

  if (isHtmlRequest(request)) {
    event.respondWith(networkFirst(request, { offlineFallback: true }));
    return;
  }

  if (isFreshAssetRequest(request)) {
    event.respondWith(networkFirst(request));
    return;
  }

  event.respondWith(staleWhileRevalidate(request));
});

// This is the service worker with the combined offline experience (Offline page + Offline copy of pages)

const CACHE = "offline-v1";
const FILES_OFFLINE = [
   "/index.html",
   "/css/main.css",
   "/css/OpenSans.ttf",
   "/icons/favicon.ico",
   "img/biohazard.svg",
   "img/champagneglasses.svg",
   "img/drum.svg",
   "img/fax.svg",
   "img/gauge-high.svg",
   "img/gopuram.svg",
   "img/hatcowboy.svg",
   "img/heartpulse.svg",
   "img/joint.svg",
   "img/music.svg",
   "img/mute.svg",
   "img/pause.svg",
   "img/pausecircle.svg",
   "img/play.svg",
   "img/play_white.svg",
   "img/playcircle.svg",
   "img/radio.svg",
   "img/spin.svg",
   "img/theme_white.svg",
   "img/tornado.svg",
   "img/volume.svg",
   "img/volume-high.svg",
   "img/volumemid.svg",
   "img/vynil.gif",
   "img/wand-sparkles.svg",
   "img/wavesquare.svg",
   "img/wind.svg",
   "img/zoomin.svg",
   "img/zoomout.svg",
   "js/lib/jquery.min.js",
   "js/lib/wavesurfer.regions-v1.2.3.min.js",
   "js/lib/wavesurfer-v1.2.3.min.js",
   "js/constants.js",
   "js/custom_styling.js",
   "js/local_storage.js",
   "js/main.js",
   "js/waveform.js",
   "music/track1.mp3",
   "music/track2.mp3",
   "music/track3.mp3",
   "music/track4.mp3",
   "music/track5.mp3",
   "music/track-instrumental1.mp3",
   "music/track-instrumental2.mp3",
   "music/track-instrumental3.mp3",
   "music/track-instrumental4.mp3",
   "music/track-instrumental5.mp3",
   "music/track-instrumental6.mp3",
   "music/track-instrumental7.mp3",
   "music/track-instrumental8.mp3",
   "music/track-instrumental9.mp3",
   "music/track-instrumental10.mp3",
   "music/track-instrumental11.mp3",
   "music/track-instrumental12.mp3",
   "music/track-loop1.mp3",
   "music/track-loop1-85.mp3",
   "music/track-loop2.mp3",
   "music/track-loop2-100.mp3",
   "music/track-loop3.mp3",
   "music/track-loop3-82.mp3",
   "music/track-loop4.mp3",
   "music/track-loop5.mp3",
   "music/track-loop5-125.mp3",
   "music/track-loop7-130.mp3",
   "music/track-loop10-83.mp3",
   "music/track-loop11-119.mp3",
   "music/track-loop12-127.mp3",
   "music/track-loop14-87.mp3",
   "music/track-loop15-123.mp3",
   "music/track-loop16-89.mp3",
   "music/track-loop18-125.mp3"
];
importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

// TODO: replace the following with the correct offline fallback page i.e.: const offlineFallbackPage = "offline.html";

self.addEventListener("message", (event) => {
   if (event.data && event.data.type === "SKIP_WAITING") {
      self.skipWaiting();
   }
});

self.addEventListener('install', async (event) => {
   event.waitUntil(
       (async () => {
          const cache = await caches.open(CACHE);
          console.log("[Service Worker] Caching all: app shell and content");
          await cache.addAll(FILES_OFFLINE);
       })(),
   );
});

if (workbox.navigationPreload.isSupported()) {
   workbox.navigationPreload.enable();
}

workbox.routing.registerRoute(
    new RegExp('/*'),
    new workbox.strategies.StaleWhileRevalidate({
       cacheName: CACHE
    })
);

self.addEventListener('fetch', (event) => {
   if (event.request.mode === 'navigate') {
      event.respondWith((async () => {
         try {
            const preloadResp = await event.preloadResponse;

            if (preloadResp) {
               return preloadResp;
            }

            const networkResp = await fetch(event.request);
            return networkResp;
         } catch (error) {

            const cache = await caches.open(CACHE);
            const cachedResp = await cache.match(offlineFallbackPage);
            return cachedResp;
         }
      })());
   }
});
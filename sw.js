/* Service worker · Bitácora ET — cache-first para uso offline */
const CACHE = 'bitacora-et-v4';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './icon-180.png'
];
self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch', e=>{
  const url = new URL(e.request.url);
  // nunca cachear la sincronización con Apps Script
  if (url.hostname.includes('script.google.com') || e.request.method!=='GET') return;
  e.respondWith(
    caches.match(e.request).then(hit=> hit || fetch(e.request).then(res=>{
      if(res.ok && url.origin===location.origin){ const cp=res.clone(); caches.open(CACHE).then(c=>c.put(e.request,cp)); }
      return res;
    }).catch(()=>hit))
  );
});

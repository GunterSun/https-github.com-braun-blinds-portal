const CACHE="braun-field-shell-v1";
const SHELL=["/field-offline","/favicon.svg","/manifest.webmanifest"];
self.addEventListener("install",event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener("activate",event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",event=>{
  const request=event.request,url=new URL(request.url);
  if(request.method!=="GET"||url.origin!==self.location.origin||url.pathname.startsWith("/api/")||url.pathname.startsWith("/login")||url.pathname.startsWith("/setup-owner"))return;
  if(request.mode==="navigate"){
    if(url.pathname!=="/field-offline")return;
    event.respondWith(fetch(request).then(response=>{if(response.ok){const copy=response.clone();void caches.open(CACHE).then(cache=>cache.put("/field-offline",copy))}return response}).catch(()=>caches.match("/field-offline")));
    return;
  }
  if(url.pathname.startsWith("/_next/static/")||url.pathname==="/favicon.svg"||url.pathname==="/manifest.webmanifest")event.respondWith(caches.match(request).then(cached=>cached||fetch(request).then(response=>{if(response.ok){const copy=response.clone();void caches.open(CACHE).then(cache=>cache.put(request,copy))}return response})));
});

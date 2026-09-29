/* Service worker: makes the app work offline after the first visit.
   Bump CACHE_VERSION whenever you replace index.html so phones pick up the new version. */
var CACHE_VERSION="khatm-zikr-v3";
var CORE=["./","index.html","manifest.webmanifest","icons/icon-192.png","icons/icon-512.png","icons/maskable-512.png","icons/apple-touch-icon.png","icons/favicon.png"];

self.addEventListener("install",function(e){
  e.waitUntil(caches.open(CACHE_VERSION).then(function(c){return c.addAll(CORE);}).then(function(){return self.skipWaiting();}));
});
self.addEventListener("activate",function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){return k!==CACHE_VERSION;}).map(function(k){return caches.delete(k);}));
  }).then(function(){return self.clients.claim();}));
});
self.addEventListener("fetch",function(e){
  var req=e.request;
  if(req.method!=="GET")return;
  var url=new URL(req.url);
  var isFont=url.hostname==="fonts.googleapis.com"||url.hostname==="fonts.gstatic.com";
  if(isFont){ /* fonts: cache after first use, refresh in the background */
    e.respondWith(caches.open(CACHE_VERSION).then(function(cache){
      return cache.match(req).then(function(hit){
        var net=fetch(req).then(function(res){cache.put(req,res.clone());return res;}).catch(function(){return hit;});
        return hit||net;
      });
    }));
    return;
  }
  if(url.origin===location.origin){ /* app files: cache first, fall back to network */
    e.respondWith(caches.match(req,{ignoreSearch:true}).then(function(hit){
      return hit||fetch(req).then(function(res){
        var copy=res.clone();caches.open(CACHE_VERSION).then(function(c){c.put(req,copy);});return res;
      }).catch(function(){return caches.match("index.html");});
    }));
  }
});

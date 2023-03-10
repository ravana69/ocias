// Generated by CoffeeScript 2.3.2
(function() {
  var cacheName, filesToCache;

  filesToCache = [
   'index.html'
   ];

  cacheName = "gameCache";

  // Listen for install event, set callback
  self.addEventListener('install', (event) => {
    console.log("service worker installed");
    return event.waitUntil(caches.open(cacheName).then((cache) => {
      return cache.addAll(filesToCache);
    }));
  });

  self.addEventListener('activate', (event) => {
    var cacheWhitelist;
    console.log("service worker activated");
    cacheWhitelist = [cacheName];
    return event.waitUntil(caches.keys().then((cacheNames) => {
      return Promise.all(cacheNames.map((cacheName) => {
        if (cacheWhitelist.indexOf(cacheName === -1)) {
          return caches.delete(cacheName);
        }
      }));
    }));
  });

  self.addEventListener('fetch', (event) => {
    console.log('Fetch event for ', event.request.url);
    return event.respondWith(caches.match(event.request).then((response) => {
      if (response) {
        console.log('Found ', event.request.url, ' in cache');
        return response;
      }
      console.log('Network request for ', event.request.url);
      return fetch(event.request);
    }).catch((error) => {
      console.log("uh oh! something went very wrong!");
      return console.log(error);
    }));
  });

}).call(this);

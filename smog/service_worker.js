const filesToCache = [
 'index.html',
 './'
 ];

const cacheName = "smog";

// Listen for install event, set callback
self.addEventListener('install', event => {
  console.log("service worker installed");
  event.waitUntil(
    caches.open(cacheName)
      .then(cache => cache.addAll(filesToCache))
  );
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

self.addEventListener('fetch', event => {
  console.log('Fetch event for ', event.request.url);
  event.respondWith(
    caches.open(cacheName).then(cache => {
      return cache.match(event.request)
        .then(response => {
          return response || fetch(event.request);
        });
    })
    // caches.match(event.request).then(response => {
    // if (response) {
    //   console.log('Found ', event.request.url, ' in cache');
    //   return response;
    // }
    // console.log('Network request for ', event.request.url);
    // return fetch(event.request);
  // }).catch(error => {
  //   console.log("uh oh! something went very wrong!");
  //   return console.log(error);
  // })
  );
});

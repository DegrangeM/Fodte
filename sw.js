self.addEventListener('install', (event) => {
	event.waitUntil(
	  caches.open('Fodte').then((cache) => {
		return cache.addAll([
			'./',
			'./index.html',
			'./style.css',
			'./fodte.js',
			'./Forms_Element.class.js',
			'./lib/jszip.min.js',
			'./lib/csv.min.js',
			'./icon.svg',
		]);
	  })
	);
});

self.addEventListener('fetch', function(event) {
	event.respondWith(
		fetch(event.request).catch(function() {
			return caches.match(event.request);
		})
	);
});

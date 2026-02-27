const CACHE_NAME = 'tnm-helper-v3';
const ASSETS = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './data.js',
    './manifest.json',
    './lib/tesseract/tesseract.min.js',
    './lib/tesseract/tesseract-core.wasm.js',
    './lib/tesseract/lang-data/chi_sim.traineddata.gz',
    './lib/tesseract/lang-data/eng.traineddata.gz'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((response) => response || fetch(e.request))
    );
});
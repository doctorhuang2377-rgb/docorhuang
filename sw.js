const CACHE_NAME = 'tnm-helper-v5';
const ASSETS = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './data.js',
    './manifest.json',
    './lib/tesseract/tesseract.min.js',
    './lib/tesseract/tesseract-core.wasm.js',
    './lib/tesseract/worker.min.js',
    // Removed language packs from precache to avoid install timeout
    // './lib/tesseract/lang-data/chi_sim.traineddata',
    // './lib/tesseract/lang-data/eng.traineddata',
    './lib/pdfjs/pdf.min.js',
    './lib/pdfjs/pdf.worker.min.js'
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
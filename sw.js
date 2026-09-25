/* ------------------------------------------------------------------ *
 * עיר החברזים — עבודה בלי אינטרנט
 *
 * כל העולם הוא קבצים סטטיים בלי שום קריאת רשת, אז שומרים את כולם
 * במטמון כבר בהתקנה — גם בניין שעוד לא ביקרו בו נפתח בלי קליטה.
 * עדכון הגרסה למטה מחליף את כל המטמון, בלי קבצים ישנים מאחור.
 *
 * כשמוסיפים קובץ למשחק, מוסיפים אותו גם לרשימה ומעלים את הגרסה.
 * ------------------------------------------------------------------ */

var CACHE = 'chavrezim-v3';

var SHELL = [
    './world.html', './world.css', './world.js', './kit.js', './pwa.js',
    './places.html', './places.css', './places.js',
    './bakery.html', './bakery.css', './bakery.js',
    './game.html',
    './game.css',
    './game.js',
    './manifest.json',
    './icons/icon-192.png',
    './icons/icon-512.png',
    './icons/icon-maskable-512.png'
];

self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(CACHE)
            .then(function (cache) { return cache.addAll(SHELL); })
            .then(function () { return self.skipWaiting(); })
    );
});

self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(function (names) {
            return Promise.all(names.map(function (name) {
                return name === CACHE ? null : caches.delete(name);
            }));
        }).then(function () { return self.clients.claim(); })
    );
});

self.addEventListener('fetch', function (event) {
    if (event.request.method !== 'GET') return;

    /* מטמון קודם: המשחק לא משתנה בין פתיחה לפתיחה, וילד באוטובוס
       בלי קליטה צריך שהוא ייפתח מיד. גרסה חדשה מגיעה דרך CACHE למעלה. */
    event.respondWith(
        caches.match(event.request).then(function (hit) {
            if (hit) return hit;
            return fetch(event.request).then(function (response) {
                if (!response || response.status !== 200 || response.type !== 'basic') return response;
                var copy = response.clone();
                caches.open(CACHE).then(function (cache) { cache.put(event.request, copy); });
                return response;
            }).catch(function () {
                return caches.match('./world.html');
            });
        })
    );
});

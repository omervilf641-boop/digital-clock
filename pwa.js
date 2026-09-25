/* ------------------------------------------------------------------ *
 * התקנה ועבודה בלי אינטרנט — לכל דף בעולם
 *
 * רושם את sw.js (רק ב-http/https; מקובץ מקומי זה פשוט לא קורה),
 * ואם בדף יש כפתור #installBtn — מציג אותו רק כשהדפדפן באמת מוכן
 * להתקין, כי על הבאנר של כרום אי אפשר לסמוך.
 * ------------------------------------------------------------------ */

(function () {
    'use strict';

    if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) {
        window.addEventListener('load', function () {
            navigator.serviceWorker.register('sw.js').catch(function () { /* המשחק לא תלוי בזה */ });
        });
    }

    var prompt = null;

    function installed() {
        return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    }

    function btn() { return document.getElementById('installBtn'); }

    window.addEventListener('beforeinstallprompt', function (e) {
        e.preventDefault();
        prompt = e;
        if (btn() && !installed()) btn().hidden = false;
    });

    window.addEventListener('appinstalled', function () {
        prompt = null;
        if (btn()) btn().hidden = true;
    });

    document.addEventListener('click', function (e) {
        if (!prompt || !e.target.closest || !e.target.closest('#installBtn')) return;
        prompt.prompt();
        prompt.userChoice.then(function () {
            prompt = null;
            if (btn()) btn().hidden = true;
        });
    });
})();

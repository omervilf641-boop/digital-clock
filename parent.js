/* ------------------------------------------------------------------ *
 * פינת ההורים — בכל דף בעולם
 *
 *   • סופר כמה זמן שיחקו היום (רק כשהמסך באמת פתוח ומוצג).
 *   • אם הורה קבע מגבלה — כשהיא מגיעה, מסך הפסקה נעים ולא נזיפה.
 *   • לוח הגדרות שנפתח רק בלחיצה ארוכה: מגבלת זמן, תזכורת שינה,
 *     צלילים והקראה.
 *
 * הכל נשמר רק במכשיר (parent.v1). שום דבר לא נשלח לשום מקום.
 * יציאה ממסך ההפסקה = לחיצה ארוכה: הורה עושה את זה בכוונה, ילד לא בטעות.
 * ------------------------------------------------------------------ */

(function () {
    'use strict';

    var KEY = 'parent.v1';
    var TICK = 5;                         /* שניות */
    var HOLD_MS = 1500;

    function today() {
        var d = new Date();
        return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
    }

    function read() {
        var p = {};
        try { p = JSON.parse(localStorage.getItem(KEY) || 'null') || {}; } catch (e) { /* ברירת מחדל */ }
        if (p.day !== today()) { p.day = today(); p.seconds = 0; p.extra = 0; }
        if (typeof p.limitMin !== 'number') p.limitMin = 0;
        if (typeof p.bedtime !== 'boolean') p.bedtime = true;
        return p;
    }

    function write(p) { try { localStorage.setItem(KEY, JSON.stringify(p)); } catch (e) { /* לא נורא */ } }

    function island() { try { return JSON.parse(localStorage.getItem('chavrezim.v1') || 'null'); } catch (e) { return null; } }
    function writeIsland(fn) {
        var s = island() || { players: [], active: 0 };
        fn(s);
        try { localStorage.setItem('chavrezim.v1', JSON.stringify(s)); } catch (e) { /* לא נורא */ }
    }

    /* ---------------- עיצוב, מוזרק כי כל דף עם סגנון אחר ---------------- */

    var css = '' +
        '.pc-veil{position:fixed;inset:0;z-index:90;display:grid;place-items:center;padding:16px;direction:rtl;' +
        'font-family:"Varela Round","Rubik",system-ui,sans-serif;color:#3e2c4a;background:rgba(40,30,60,.55);animation:pc-fade .3s ease both}' +
        '.pc-card{width:min(460px,100%);max-height:92vh;overflow:auto;padding:20px 18px;background:#fff;border-radius:24px;box-shadow:0 20px 50px rgba(0,0,0,.3)}' +
        '.pc-card h2{margin:0 0 4px;font-size:24px;text-align:center}' +
        '.pc-card .pc-sub{margin:0 0 16px;text-align:center;color:#7a6688;font-size:15px}' +
        '.pc-row{margin:14px 0}.pc-row b{display:block;margin-bottom:8px;font-size:16px}' +
        '.pc-opts{display:flex;flex-wrap:wrap;gap:8px}' +
        '.pc-opt{padding:8px 14px;font:inherit;font-size:15px;font-weight:700;color:#3e2c4a;background:#f3eef6;border:2px solid transparent;border-radius:14px;cursor:pointer}' +
        '.pc-opt.is-on{background:#e9fbf2;border-color:#6fd6b0}' +
        '.pc-time{font-size:36px;font-weight:900;text-align:center;color:#6d3fbf;font-variant-numeric:tabular-nums}' +
        '.pc-close{display:block;margin:18px auto 0;padding:10px 26px;font:inherit;font-size:17px;font-weight:800;color:#fff;background:#6d3fbf;border:none;border-radius:16px;cursor:pointer}' +
        '.pc-note{margin:14px 0 0;font-size:13px;color:#7a6688;text-align:center}' +
        '.pc-break{position:fixed;inset:0;z-index:95;display:grid;place-items:center;align-content:center;gap:8px;padding:20px;text-align:center;direction:rtl;' +
        'font-family:"Varela Round","Rubik",system-ui,sans-serif;color:#3e2c4a;background:linear-gradient(180deg,#bfe9ff,#fff4e3);animation:pc-fade .6s ease both}' +
        '.pc-break .pc-big{font-size:90px;animation:pc-bob 3s ease-in-out infinite}' +
        '.pc-break h2{margin:0;font-size:clamp(28px,7vw,40px)}.pc-break p{margin:0;font-size:clamp(17px,4.4vw,21px);color:#7a6688}' +
        '.pc-hold{position:relative;overflow:hidden;margin-top:34px;padding:8px 14px;font:inherit;font-size:13px;color:#9a88a8;background:transparent;border:1px dashed #cbbfd6;border-radius:12px;cursor:pointer}' +
        '.pc-hold::after{content:"";position:absolute;inset:auto 0 0 0;height:3px;background:currentColor;transform:scaleX(0);transform-origin:right center}' +
        '.pc-hold.is-holding::after{transition:transform ' + HOLD_MS + 'ms linear;transform:scaleX(1)}' +
        '.pc-lock.is-holding{outline:3px solid #6d3fbf;outline-offset:2px}' +
        '.pc-tip{position:fixed;z-index:80;padding:6px 10px;font:700 13px "Varela Round",system-ui,sans-serif;color:#fff;background:#3e2c4a;border-radius:10px;direction:rtl;animation:pc-fade .2s ease both}' +
        '@keyframes pc-fade{from{opacity:0}to{opacity:1}}' +
        '@keyframes pc-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}';

    function injectCSS() {
        if (document.getElementById('pc-css')) return;
        var st = document.createElement('style');
        st.id = 'pc-css';
        st.textContent = css;
        document.head.appendChild(st);
    }

    /* ---------------- לחיצה ארוכה ---------------- */

    function hold(el, fn) {
        var t = null;
        function start(e) {
            e.preventDefault();
            el.classList.add('is-holding');
            t = setTimeout(function () { el.classList.remove('is-holding'); fn(); }, HOLD_MS);
        }
        function stop() { el.classList.remove('is-holding'); clearTimeout(t); }
        el.addEventListener('pointerdown', start);
        el.addEventListener('pointerup', stop);
        el.addEventListener('pointerleave', stop);
        el.addEventListener('pointercancel', stop);
        el.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    }

    function tip(el, text) {
        var r = el.getBoundingClientRect();
        var t = document.createElement('div');
        t.className = 'pc-tip';
        t.textContent = text;
        t.style.top = (r.bottom + 6) + 'px';
        t.style.left = Math.max(8, r.left - 40) + 'px';
        document.body.appendChild(t);
        setTimeout(function () { t.remove(); }, 1800);
    }

    /* ---------------- לוח ההורים ---------------- */

    function minutes(sec) { return Math.floor(sec / 60); }

    function open() {
        injectCSS();
        if (document.getElementById('pc-panel')) return;
        var v = document.createElement('div');
        v.className = 'pc-veil';
        v.id = 'pc-panel';
        document.body.appendChild(v);

        function render() {
            var p = read(), s = island() || {};
            var limits = [0, 20, 30, 45, 60];
            v.innerHTML = '<div class="pc-card" role="dialog" aria-label="פינת ההורים">' +
                '<h2>🔒 פינת ההורים</h2><p class="pc-sub">רק מבוגרים מגיעים לכאן — בלחיצה ארוכה</p>' +
                '<div class="pc-time">' + minutes(p.seconds) + ' דק׳</div><p class="pc-sub">משחק היום</p>' +
                '<div class="pc-row"><b>מגבלת זמן ביום</b><div class="pc-opts">' + limits.map(function (m) {
                    return '<button type="button" class="pc-opt' + (p.limitMin === m ? ' is-on' : '') + '" data-limit="' + m + '">' + (m ? m + ' דק׳' : 'בלי מגבלה') + '</button>';
                }).join('') + '</div></div>' +
                '<div class="pc-row"><b>תזכורת שינה בלילה (אחרי 19:30)</b><div class="pc-opts">' +
                    '<button type="button" class="pc-opt' + (p.bedtime ? ' is-on' : '') + '" data-bed="1">פעילה</button>' +
                    '<button type="button" class="pc-opt' + (!p.bedtime ? ' is-on' : '') + '" data-bed="0">כבויה</button></div></div>' +
                '<div class="pc-row"><b>צלילים והקראה</b><div class="pc-opts">' +
                    '<button type="button" class="pc-opt' + (s.sound !== false ? ' is-on' : '') + '" data-sound="1">🔊 צלילים</button>' +
                    '<button type="button" class="pc-opt' + (s.voice !== false ? ' is-on' : '') + '" data-voice="1">🗣️ הקראה</button></div></div>' +
                '<button type="button" class="pc-close">סגירה</button>' +
                '<p class="pc-note">הכל נשמר רק במכשיר הזה. שום מידע לא נשלח לשום מקום.</p></div>';

            v.querySelectorAll('[data-limit]').forEach(function (b) {
                b.addEventListener('click', function () { var p = read(); p.limitMin = +b.dataset.limit; p.extra = 0; write(p); render(); });
            });
            v.querySelectorAll('[data-bed]').forEach(function (b) {
                b.addEventListener('click', function () { var p = read(); p.bedtime = b.dataset.bed === '1'; write(p); render(); });
            });
            v.querySelector('[data-sound]').addEventListener('click', function () {
                writeIsland(function (s) { s.sound = s.sound === false; }); render();
            });
            v.querySelector('[data-voice]').addEventListener('click', function () {
                writeIsland(function (s) { s.voice = s.voice === false; });
                if ('speechSynthesis' in window) speechSynthesis.cancel();
                render();
            });
            v.querySelector('.pc-close').addEventListener('click', function () { v.remove(); });
        }

        render();
        v.addEventListener('click', function (e) { if (e.target === v) v.remove(); });
    }

    /* ---------------- מסך הפסקה ---------------- */

    function showBreak() {
        injectCSS();
        if (document.getElementById('pc-break')) return;
        var b = document.createElement('div');
        b.className = 'pc-break';
        b.id = 'pc-break';
        b.innerHTML = '<div class="pc-big">🌈</div><h2>זְמַן לְהַפְסָקָה!</h2>' +
            '<p>הַחַבְרֵזִים הוֹלְכִים לָנוּחַ קְצָת.</p><p>בּוֹאוּ נַעֲשֶׂה מַשֶּׁהוּ אַחֵר, וְנַחֲזֹר אַחַר כָּךְ 💛</p>' +
            '<button type="button" class="pc-hold" id="pcMore">הורים: לחיצה ארוכה ל-15 דקות נוספות</button>';
        document.body.appendChild(b);
        try {
            if ('speechSynthesis' in window && (island() || {}).voice !== false) {
                speechSynthesis.cancel();
                var u = new SpeechSynthesisUtterance('זמן להפסקה! החברזים הולכים לנוח קצת. נחזור אחר כך');
                u.lang = 'he-IL'; u.rate = .92; u.pitch = 1.2;
                speechSynthesis.speak(u);
            }
        } catch (e) { /* בלי הקראה */ }
        hold(document.getElementById('pcMore'), function () {
            var p = read();
            p.extra = (p.extra || 0) + 15;
            write(p);
            b.remove();
        });
    }

    function over(p) {
        return p.limitMin > 0 && p.seconds >= (p.limitMin + (p.extra || 0)) * 60;
    }

    /* ---------------- ספירת זמן ---------------- */

    function tick() {
        if (document.visibilityState !== 'visible') return;
        var p = read();
        p.seconds += TICK;
        write(p);
        if (over(p)) showBreak();
    }

    function init() {
        injectCSS();
        document.querySelectorAll('[data-parent-lock]').forEach(function (el) {
            el.classList.add('pc-lock');
            hold(el, open);
            el.addEventListener('click', function () { tip(el, 'לחיצה ארוכה — להורים'); });
        });
        if (over(read())) showBreak();
        setInterval(tick, TICK * 1000);
    }

    window.Parent = { open: open, read: read, showBreak: showBreak };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();

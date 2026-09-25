/* ------------------------------------------------------------------ *
 * ערכת החברזים — מה שכל הבניינים בעיר צריכים
 *
 * ציור הדמות והחברזים (אותם פרמטרים כמו באי), צלילים והקראה,
 * אפקטים שעפים על המסך, וגישה לשמירה של אי החברזים — כך שחבר
 * שטופל במרפאה או תספורת מהמספרה נשארים גם באי.
 * ------------------------------------------------------------------ */

(function () {
    'use strict';

    var K = window.Kit = {};

    K.$ = function (id) { return document.getElementById(id); };
    K.rand = function (a, b) { return a + Math.floor(Math.random() * (b - a + 1)); };
    K.pick = function (l) { return l[Math.floor(Math.random() * l.length)]; };
    K.shuffle = function (l) {
        var o = l.slice();
        for (var i = o.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = o[i]; o[i] = o[j]; o[j] = t; }
        return o;
    };
    K.plain = function (t) { return String(t).replace(/[֑-ׇ]/g, ''); };
    K.later = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };

    /* ============================================================== *
     * הדמות — הועתק מ-game.js
     * ============================================================== */

    var LOOKS = {
        skin:  ['#f7d7c4', '#eab68f', '#c78a5e', '#8d5a3b'],
        hair:  ['short', 'long', 'curly', 'ponytail', 'bun', 'spiky', 'braids', 'wavy'],
        color: ['#3b2a20', '#7a4a24', '#d9a441', '#e86a4a', '#5b4a8f', '#3f9ad9'],
        shirt: ['#ff8fc4', '#4ea9ff', '#4fd6b0', '#ffd93d', '#a97bff', '#ff7a59']
    };

    function hairSVG(style, color) {
        var cap = '<path d="M50 18 C 26 18, 20 36, 22 52 C 25 38, 33 32, 50 32 ' +
                  'C 67 32, 75 38, 78 52 C 80 36, 74 18, 50 18 Z" fill="' + color + '"/>';
        switch (style) {
            case 'long':
                return '<path d="M20 44 q-2 30 4 44 h12 q-6 -22 -4 -44 z" fill="' + color + '"/>' +
                       '<path d="M80 44 q2 30 -4 44 h-12 q6 -22 4 -44 z" fill="' + color + '"/>' + cap;
            case 'curly':
                return cap +
                       '<g fill="' + color + '">' +
                       '<circle cx="28" cy="30" r="9"/><circle cx="42" cy="22" r="10"/>' +
                       '<circle cx="58" cy="22" r="10"/><circle cx="72" cy="30" r="9"/>' +
                       '</g>';
            case 'ponytail':
                return '<ellipse cx="84" cy="56" rx="9" ry="18" fill="' + color + '"/>' +
                       '<circle cx="80" cy="40" r="7" fill="' + color + '"/>' + cap;
            case 'bun':
                return '<circle cx="50" cy="14" r="11" fill="' + color + '"/>' + cap;
            case 'spiky':
                return cap +
                       '<path d="M28 32 L24 10 L40 26 L44 6 L54 24 L60 4 L66 24 L76 6 L80 26 ' +
                       'L96 10 L72 34 Z" fill="' + color + '"/>';
            case 'braids':
                return '<g fill="' + color + '">' +
                       '<circle cx="20" cy="60" r="8"/><circle cx="18" cy="74" r="7"/><circle cx="19" cy="86" r="6"/>' +
                       '<circle cx="80" cy="60" r="8"/><circle cx="82" cy="74" r="7"/><circle cx="81" cy="86" r="6"/>' +
                       '</g>' + cap;
            case 'wavy':
                return '<path d="M18 44 q6 16 -2 26 q10 6 6 22 h14 q-6 -26 2 -48 z" fill="' + color + '"/>' +
                       '<path d="M82 44 q-6 16 2 26 q-10 6 -6 22 h-14 q6 -26 -2 -48 z" fill="' + color + '"/>' + cap;
            default:
                return cap;
        }
    }

    function defaultHero() {
        return { name: 'חָבֵר', skin: 0, hair: 0, color: 0, shirt: 0 };
    }

    function heroSVG(hero, cls) {
        var h = hero || defaultHero();
        var skin = LOOKS.skin[h.skin % LOOKS.skin.length];
        var shirt = LOOKS.shirt[h.shirt % LOOKS.shirt.length];
        var hairColor = LOOKS.color[h.color % LOOKS.color.length];
        var hairStyle = LOOKS.hair[h.hair % LOOKS.hair.length];

        return '' +
        '<svg viewBox="0 0 100 148" class="' + (cls || '') + '" role="img" aria-label="' + h.name + '">' +
            /* נעליים ורגליים */
            '<ellipse cx="38" cy="138" rx="11" ry="7" fill="#3b4675"/>' +
            '<ellipse cx="62" cy="138" rx="11" ry="7" fill="#3b4675"/>' +
            '<rect x="33" y="106" width="12" height="28" rx="6" fill="#5a6796"/>' +
            '<rect x="55" y="106" width="12" height="28" rx="6" fill="#5a6796"/>' +
            /* גוף */
            '<rect x="27" y="74" width="46" height="40" rx="17" fill="' + shirt + '"/>' +
            /* ידיים */
            '<rect x="16" y="78" width="13" height="30" rx="6.5" fill="' + shirt + '"/>' +
            '<rect x="71" y="78" width="13" height="30" rx="6.5" fill="' + shirt + '"/>' +
            '<circle cx="22" cy="110" r="7" fill="' + skin + '"/>' +
            '<circle cx="78" cy="110" r="7" fill="' + skin + '"/>' +
            /* ראש */
            '<circle cx="26" cy="52" r="6" fill="' + skin + '"/>' +
            '<circle cx="74" cy="52" r="6" fill="' + skin + '"/>' +
            '<circle cx="50" cy="50" r="26" fill="' + skin + '"/>' +
            hairSVG(hairStyle, hairColor) +
            /* פנים */
            '<circle cx="41" cy="52" r="4" fill="#1f2a52"/>' +
            '<circle cx="59" cy="52" r="4" fill="#1f2a52"/>' +
            '<circle cx="39.6" cy="50.6" r="1.5" fill="#fff"/>' +
            '<circle cx="57.6" cy="50.6" r="1.5" fill="#fff"/>' +
            '<circle cx="34" cy="60" r="5" fill="#ff8fc4" opacity=".45"/>' +
            '<circle cx="66" cy="60" r="5" fill="#ff8fc4" opacity=".45"/>' +
            '<path d="M43 62 q7 7 14 0" stroke="#1f2a52" stroke-width="2.6" fill="none" stroke-linecap="round"/>' +
        '</svg>';
    }


    K.LOOKS = LOOKS;
    K.hairSVG = hairSVG;
    K.heroSVG = heroSVG;

    K.LOOKS_OF = {"galgali": {"nik": "גַּלְגַּלִּי", "name": "גלגלי", "body": "#4ea9ff", "belly": "#dcf1ff", "dark": "#2f7fd0", "ears": "floppy"}, "buali": {"nik": "בּוּעָלִי", "name": "בועלי", "body": "#7ee0e8", "belly": "#eafcff", "dark": "#3fb6c2", "ears": "round", "antenna": true}, "shonit": {"nik": "שׁוֹנִיתִי", "name": "שוניתי", "body": "#ff9ec4", "belly": "#ffe6f2", "dark": "#e2699d", "ears": "leaf"}, "alali": {"nik": "עַלְעָלִי", "name": "עלעלי", "body": "#5fd08a", "belly": "#e6ffe9", "dark": "#34a163", "ears": "leaf"}, "namnumi": {"nik": "נַמְנוּמִי", "name": "נמנומי", "body": "#b9e06a", "belly": "#f6ffd8", "dark": "#86ad3c", "ears": "floppy"}, "kokoni": {"nik": "קוֹקוֹנִי", "name": "קוקוני", "body": "#a97bff", "belly": "#efe6ff", "dark": "#7b4fd6", "ears": "pointy"}, "lohiti": {"nik": "לוֹהִיטִי", "name": "לוהיטי", "body": "#ff7a59", "belly": "#ffe0d3", "dark": "#d9502f", "ears": "pointy"}, "popi": {"nik": "פּוֹפִּי", "name": "פופי", "body": "#ffb03d", "belly": "#fff0d0", "dark": "#d98a1c", "ears": "round"}, "gechali": {"nik": "גֶּחָלִי", "name": "גחלי", "body": "#ff5f7e", "belly": "#ffdfe6", "dark": "#d43a5c", "ears": "floppy"}, "kochavi": {"nik": "כּוֹכָבִי", "name": "כוכבי", "body": "#ffd93d", "belly": "#fff6cf", "dark": "#d9ac16", "ears": "pointy", "antenna": true}, "zizi": {"nik": "זִיזִי", "name": "זיזי", "body": "#8ab6ff", "belly": "#e7f0ff", "dark": "#5a86d6", "ears": "round", "antenna": true}, "chalomi": {"nik": "חֲלוֹמִי", "name": "חלומי", "body": "#d59bff", "belly": "#f7e9ff", "dark": "#a865d6", "ears": "floppy", "antenna": true}, "gavishi": {"nik": "גָּבִישִׁי", "name": "גבישי", "body": "#7fe4ff", "belly": "#e8fbff", "dark": "#3aa8c9", "ears": "pointy"}, "nitznutzi": {"nik": "נִצְנוּצִי", "name": "נצנוצי", "body": "#b7c4ff", "belly": "#eef1ff", "dark": "#7f8fd6", "ears": "round"}, "mearoni": {"nik": "מְעָרוֹנִי", "name": "מערוני", "body": "#a0f0d8", "belly": "#eafff8", "dark": "#4fbf9e", "ears": "floppy"}, "sukariti": {"nik": "סֻכָּרִיתִי", "name": "סוכריתי", "body": "#ffc2e2", "belly": "#fff0f8", "dark": "#e884b8", "ears": "leaf"}, "anani": {"nik": "עֲנָנִי", "name": "ענני", "body": "#dbe7ff", "belly": "#ffffff", "dark": "#93a8cc", "ears": "floppy"}, "marshmelo": {"nik": "מַרְשְׁמֶלוֹ", "name": "מרשמלו", "body": "#ffe08a", "belly": "#fff8e0", "dark": "#d9b04c", "ears": "round", "antenna": true}, "bipi": {"nik": "בִּיפִּי", "name": "ביפי", "body": "#7ad9ff", "belly": "#e0f7ff", "dark": "#2f9ecf", "ears": "pointy", "antenna": true}, "borgi": {"nik": "בּוֹרְגִּי", "name": "בורגי", "body": "#ffa8a8", "belly": "#ffe8e8", "dark": "#d96b6b", "ears": "round"}, "chashmali": {"nik": "חַשְׁמַלִּי", "name": "חשמלי", "body": "#ffe14d", "belly": "#fffbd6", "dark": "#d9b81c", "ears": "pointy", "antenna": true}, "zehavhav": {"nik": "זְהַבְהָב", "name": "זהבהב", "body": "#ffd54a", "belly": "#fff6d4", "dark": "#d9a41c", "ears": "pointy", "antenna": true}, "kashtoni": {"nik": "קַשְׁתּוֹנִי", "name": "קשתוני", "body": "#ff9ad9", "belly": "#fff0fa", "dark": "#c95bab", "ears": "leaf"}, "layloni": {"nik": "לַיְלוֹנִי", "name": "לילוני", "body": "#5b6bb5", "belly": "#dbe3ff", "dark": "#39468a", "ears": "floppy"}};

    /* ============================================================== *
     * חברז, עם מצבי רוח
     * ============================================================== */

    K.creatureSVG = function (c, mood) {
        var b = c.body, d = c.dark, ears;
        if (c.ears === 'pointy') {
            ears = '<path d="M38 46 L28 6 L60 32 Z" fill="' + b + '"/><path d="M82 46 L92 6 L60 32 Z" fill="' + b + '"/>';
        } else if (c.ears === 'round') {
            ears = '<circle cx="28" cy="34" r="15" fill="' + b + '"/><circle cx="92" cy="34" r="15" fill="' + b + '"/>' +
                   '<circle cx="28" cy="34" r="8" fill="' + d + '" opacity=".35"/><circle cx="92" cy="34" r="8" fill="' + d + '" opacity=".35"/>';
        } else if (c.ears === 'leaf') {
            ears = '<path d="M40 44 C 18 28, 24 4, 44 14 C 56 20, 54 40, 40 44 Z" fill="' + b + '"/>' +
                   '<path d="M80 44 C 102 28, 96 4, 76 14 C 64 20, 66 40, 80 44 Z" fill="' + b + '"/>';
        } else {
            ears = '<ellipse cx="26" cy="42" rx="12" ry="24" fill="' + b + '" transform="rotate(-22 26 42)"/>' +
                   '<ellipse cx="94" cy="42" rx="12" ry="24" fill="' + b + '" transform="rotate(22 94 42)"/>';
        }

        var eyes = '<ellipse cx="46" cy="58" rx="11" ry="12.5" fill="#fff"/><ellipse cx="74" cy="58" rx="11" ry="12.5" fill="#fff"/>' +
                   '<circle cx="47" cy="60" r="6" fill="#1f2a52"/><circle cx="75" cy="60" r="6" fill="#1f2a52"/>' +
                   '<circle cx="45" cy="57" r="2.3" fill="#fff"/><circle cx="73" cy="57" r="2.3" fill="#fff"/>';
        var mouth = '<path d="M50 72 q10 10 20 0" stroke="' + d + '" stroke-width="3.4" fill="none" stroke-linecap="round"/>';
        var cheeks = '<circle cx="32" cy="74" r="7" fill="#ff8fc4" opacity=".55"/><circle cx="88" cy="74" r="7" fill="#ff8fc4" opacity=".55"/>';

        if (mood === 'joy') {
            eyes = '<path d="M38 60 q8 -9 16 0" stroke="#1f2a52" stroke-width="3.6" fill="none" stroke-linecap="round"/>' +
                   '<path d="M66 60 q8 -9 16 0" stroke="#1f2a52" stroke-width="3.6" fill="none" stroke-linecap="round"/>';
        } else if (mood === 'sick') {
            /* עפעפיים כבדים, לחיים סמוקות מדי, פה עקום — מסכן, לא מפחיד */
            eyes = '<ellipse cx="46" cy="60" rx="10" ry="8" fill="#fff"/><ellipse cx="74" cy="60" rx="10" ry="8" fill="#fff"/>' +
                   '<circle cx="47" cy="62" r="5" fill="#1f2a52"/><circle cx="75" cy="62" r="5" fill="#1f2a52"/>' +
                   /* גבות מודאגות: הקצה הפנימי למעלה. הפוך מזה נראה כועס, לא חולה */
                   '<path d="M36 52 L56 46 M64 46 L84 52" stroke="' + d + '" stroke-width="4" stroke-linecap="round"/>';
            mouth = '<path d="M52 78 q8 -5 16 0" stroke="' + d + '" stroke-width="3.4" fill="none" stroke-linecap="round"/>';
            cheeks = '<circle cx="32" cy="74" r="9" fill="#ff5f7e" opacity=".55"/><circle cx="88" cy="74" r="9" fill="#ff5f7e" opacity=".55"/>';
        } else if (mood === 'sing') {
            mouth = '<ellipse cx="60" cy="77" rx="7" ry="8" fill="#6b2a2a"/>';
        } else if (mood === 'eat') {
            mouth = '<ellipse cx="60" cy="76" rx="9" ry="7" fill="#6b2a2a"/><ellipse cx="60" cy="79" rx="5" ry="3" fill="#ff8fa3"/>';
        }

        return '<svg viewBox="0 0 120 120" role="img" aria-label="' + (c.name || '') + '">' + ears +
            (c.antenna ? '<path d="M60 34 C 58 22, 64 18, 62 10" stroke="' + d + '" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="62" cy="8" r="6" fill="#ffd93d"/>' : '') +
            '<ellipse cx="20" cy="78" rx="10" ry="8" fill="' + d + '"/><ellipse cx="100" cy="78" rx="10" ry="8" fill="' + d + '"/>' +
            '<ellipse cx="44" cy="104" rx="14" ry="9" fill="' + d + '"/><ellipse cx="76" cy="104" rx="14" ry="9" fill="' + d + '"/>' +
            '<ellipse cx="60" cy="68" rx="36" ry="34" fill="' + b + '"/>' +
            '<ellipse cx="60" cy="86" rx="21" ry="14" fill="' + c.belly + '"/>' +
            cheeks + eyes + '<ellipse cx="60" cy="68" rx="4" ry="3" fill="' + d + '"/>' + mouth + '</svg>';
    };

    /* ============================================================== *
     * השמירה של האי
     * ============================================================== */

    var ISLAND = 'chavrezim.v1';

    K.readStore = function () {
        try { return JSON.parse(localStorage.getItem(ISLAND) || 'null'); } catch (e) { return null; }
    };

    K.player = function () {
        var s = K.readStore();
        if (!s) return null;
        var p = Array.isArray(s.players) ? s.players[s.active | 0] : s;
        return p && p.hero ? p : null;
    };

    /* משנים את השחקן הפעיל ושומרים חזרה — בלי לגעת בשאר השחקנים */
    K.updatePlayer = function (fn) {
        var s = K.readStore();
        if (!s || !Array.isArray(s.players)) return false;
        var p = s.players[s.active | 0];
        if (!p || !p.hero) return false;
        fn(p);
        try { localStorage.setItem(ISLAND, JSON.stringify(s)); return true; } catch (e) { return false; }
    };

    K.hero = function () {
        var p = K.player();
        return (p && p.hero) || { name: 'חָבֵר', skin: 0, hair: 0, color: 0, shirt: 1 };
    };

    /* החברים של השחקן, או תושבי העיר אם עוד אין לו */
    K.friends = function (n) {
        var p = K.player();
        var ids = p ? p.caught.filter(function (id) { return K.LOOKS_OF[id]; }) : [];
        ['galgali', 'buali', 'popi', 'alali', 'kokoni', 'zizi'].forEach(function (id) {
            if (ids.length < (n || 4) && ids.indexOf(id) === -1) ids.push(id);
        });
        return K.shuffle(ids).slice(0, n || 4).map(function (id) {
            var c = K.LOOKS_OF[id];
            return { id: id, name: c.name, nik: c.nik, body: c.body, belly: c.belly, dark: c.dark, ears: c.ears, antenna: c.antenna };
        });
    };

    K.addTreasure = function (emoji, n) {
        return K.updatePlayer(function (p) {
            p.treasures = p.treasures || {};
            p.treasures[emoji] = (p.treasures[emoji] || 0) + n;
        });
    };

    /* ============================================================== *
     * צליל והקראה — לפי ההגדרות של האי
     * ============================================================== */

    var audio = null;

    function soundOn() { var s = K.readStore(); return !(s && s.sound === false); }
    function voiceOn() { var s = K.readStore(); return !(s && s.voice === false); }

    K.tone = function (f, at, dur, type, vol) {
        if (!soundOn()) return;
        try {
            if (!audio) audio = new (window.AudioContext || window.webkitAudioContext)();
            if (audio.state === 'suspended') audio.resume();
            var o = audio.createOscillator(), g = audio.createGain(), t0 = audio.currentTime + (at || 0);
            o.type = type || 'sine';
            o.frequency.setValueAtTime(f, t0);
            g.gain.setValueAtTime(.0001, t0);
            g.gain.exponentialRampToValueAtTime(vol || .14, t0 + .02);
            g.gain.exponentialRampToValueAtTime(.0001, t0 + dur);
            o.connect(g).connect(audio.destination);
            o.start(t0);
            o.stop(t0 + dur + .05);
        } catch (e) { /* בלי צליל */ }
    };

    var T = K.tone;
    K.sfx = {
        tap:   function () { T(660, 0, .08, 'triangle', .1); },
        pop:   function () { T(520 + Math.random() * 260, 0, .09, 'triangle', .13); },
        good:  function () { [523, 659, 784, 1047].forEach(function (f, i) { T(f, i * .08, .22, 'triangle', .13); }); },
        oops:  function () { T(330, 0, .15, 'sine', .1); T(262, .13, .2, 'sine', .1); },
        coin:  function () { T(988, 0, .08, 'square', .05); T(1319, .07, .2, 'square', .05); },
        snip:  function () { T(2400, 0, .03, 'square', .05); T(1800, .05, .03, 'square', .05); },
        water: function () { for (var i = 0; i < 6; i++) T(900 + Math.random() * 900, i * .05, .08, 'sine', .05); },
        whoosh:function () { T(200, 0, .3, 'sawtooth', .03); T(320, .05, .3, 'sawtooth', .02); },
        magic: function () { [784, 988, 1319, 1568].forEach(function (f, i) { T(f, i * .06, .3, 'sine', .09); }); }
    };

    K.say = function (text) {
        if (!voiceOn() || !('speechSynthesis' in window)) return;
        try {
            speechSynthesis.cancel();
            var u = new SpeechSynthesisUtterance(K.plain(text));
            u.lang = 'he-IL';
            u.rate = .92;
            u.pitch = 1.25;
            var he = (speechSynthesis.getVoices() || []).filter(function (v) { return /^he/i.test(v.lang); })[0];
            if (he) u.voice = he;
            speechSynthesis.speak(u);
        } catch (e) { /* בלי הקראה */ }
    };

    /* ============================================================== *
     * אפקטים
     * ============================================================== */

    function fx() {
        var box = K.$('fx');
        if (!box) { box = document.createElement('div'); box.id = 'fx'; box.className = 'fx'; document.body.appendChild(box); }
        return box;
    }

    K.center = function (el) {
        var r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2, r: r };
    };

    K.sparks = function (x, y, colors, n) {
        for (var i = 0; i < (n || 14); i++) {
            var s = document.createElement('span');
            s.className = 'k-spark';
            var a = Math.random() * Math.PI * 2, d = 40 + Math.random() * 70;
            s.style.left = x + 'px';
            s.style.top = y + 'px';
            s.style.setProperty('--dx', Math.cos(a) * d + 'px');
            s.style.setProperty('--dy', Math.sin(a) * d + 'px');
            s.style.setProperty('--c', K.pick(colors || ['#ff8fb8', '#ffcf4a', '#6fd6b0', '#8fd0ff']));
            fx().appendChild(s);
            setTimeout(s.remove.bind(s), 900);
        }
    };

    K.float = function (x, y, list, n) {
        for (var i = 0; i < (n || 6); i++) {
            (function (k) {
                setTimeout(function () {
                    var h = document.createElement('span');
                    h.className = 'k-float';
                    h.textContent = K.pick(list || ['💖', '💕', '⭐']);
                    h.style.left = (x - 14 + K.rand(-30, 30)) + 'px';
                    h.style.top = (y - 14) + 'px';
                    h.style.setProperty('--dx', K.rand(-60, 60) + 'px');
                    fx().appendChild(h);
                    setTimeout(h.remove.bind(h), 1500);
                }, k * 120);
            })(i);
        }
    };

    /* מעוף בקשת. מחזיר הבטחה שמתממשת בנחיתה */
    K.fly = function (html, from, to, opts) {
        opts = opts || {};
        var el = document.createElement('span');
        el.className = 'k-fly';
        el.innerHTML = html;
        fx().appendChild(el);
        var w = el.offsetWidth / 2, h = el.offsetHeight / 2;
        var x0 = from.x - w, y0 = from.y - h, x1 = to.x - w, y1 = to.y - h;
        var peak = Math.min(y0, y1) - (opts.arc == null ? 100 : opts.arc);
        var anim = el.animate([
            { transform: 'translate(' + x0 + 'px,' + y0 + 'px) scale(1) rotate(0deg)' },
            { transform: 'translate(' + ((x0 + x1) / 2) + 'px,' + peak + 'px) scale(' + (opts.mid || 1.25) + ') rotate(' + (opts.spin || 0) + 'deg)', offset: .5 },
            { transform: 'translate(' + x1 + 'px,' + y1 + 'px) scale(' + (opts.end || 1) + ') rotate(' + (opts.spin || 0) * 2 + 'deg)' }
        ], { duration: opts.duration || 600, easing: 'cubic-bezier(.45,.05,.4,1)', fill: 'forwards' });
        return new Promise(function (resolve) { anim.onfinish = function () { el.remove(); resolve(); }; });
    };

    /* ============================================================== *
     * דפי הצביעה של הסטודיו — כאן כי גם העיר מציירת אותם, בחלון הסטודיו
     * ============================================================== */

    var INK = 'stroke="#3e2c4a" stroke-width="4" stroke-linejoin="round"';

    K.PAGES = {
        friend: { nik: 'חַבְרֵז', svg: function (f) {
            return '<svg viewBox="0 0 200 200">' +
                '<rect class="r" data-r="bg" x="2" y="2" width="196" height="196" fill="' + f('bg') + '"/>' +
                '<ellipse class="r" data-r="earL" cx="52" cy="66" rx="18" ry="36" transform="rotate(-22 52 66)" fill="' + f('earL') + '" ' + INK + '/>' +
                '<ellipse class="r" data-r="earR" cx="148" cy="66" rx="18" ry="36" transform="rotate(22 148 66)" fill="' + f('earR') + '" ' + INK + '/>' +
                '<ellipse class="r" data-r="footL" cx="76" cy="176" rx="22" ry="13" fill="' + f('footL') + '" ' + INK + '/>' +
                '<ellipse class="r" data-r="footR" cx="124" cy="176" rx="22" ry="13" fill="' + f('footR') + '" ' + INK + '/>' +
                '<ellipse class="r" data-r="body" cx="100" cy="116" rx="58" ry="56" fill="' + f('body') + '" ' + INK + '/>' +
                '<ellipse class="r" data-r="belly" cx="100" cy="142" rx="32" ry="22" fill="' + f('belly') + '" ' + INK + '/>' +
                '<circle class="r" data-r="cheekL" cx="58" cy="124" r="10" fill="' + f('cheekL') + '" ' + INK + '/>' +
                '<circle class="r" data-r="cheekR" cx="142" cy="124" r="10" fill="' + f('cheekR') + '" ' + INK + '/>' +
                '<circle cx="80" cy="100" r="9" fill="#3e2c4a"/><circle cx="120" cy="100" r="9" fill="#3e2c4a"/>' +
                '<path d="M86 122 q14 14 28 0" stroke="#3e2c4a" stroke-width="4" fill="none" stroke-linecap="round"/>' +
                '</svg>';
        } },
        house: { nik: 'בַּיִת', svg: function (f) {
            return '<svg viewBox="0 0 200 200">' +
                '<rect class="r" data-r="sky" x="2" y="2" width="196" height="150" fill="' + f('sky') + '"/>' +
                '<rect class="r" data-r="grass" x="2" y="150" width="196" height="48" fill="' + f('grass') + '" ' + INK + '/>' +
                '<circle class="r" data-r="sun" cx="164" cy="36" r="20" fill="' + f('sun') + '" ' + INK + '/>' +
                '<path class="r" data-r="cloud" d="M22 44 q0 -16 18 -14 q8 -14 24 -4 q16 -2 16 14 z" fill="' + f('cloud') + '" ' + INK + '/>' +
                '<rect class="r" data-r="wall" x="44" y="92" width="112" height="72" fill="' + f('wall') + '" ' + INK + '/>' +
                '<path class="r" data-r="roof" d="M34 96 L100 46 L166 96 Z" fill="' + f('roof') + '" ' + INK + '/>' +
                '<rect class="r" data-r="door" x="88" y="118" width="26" height="46" fill="' + f('door') + '" ' + INK + '/>' +
                '<rect class="r" data-r="win1" x="56" y="106" width="22" height="22" fill="' + f('win1') + '" ' + INK + '/>' +
                '<rect class="r" data-r="win2" x="124" y="106" width="22" height="22" fill="' + f('win2') + '" ' + INK + '/>' +
                '</svg>';
        } },
        flower: { nik: 'פֶּרַח וּפַרְפַּר', svg: function (f) {
            var petals = '';
            for (var i = 0; i < 6; i++) {
                var a = i * 60, x = 70 + Math.cos(a * Math.PI / 180) * 30, y = 80 + Math.sin(a * Math.PI / 180) * 30;
                petals += '<ellipse class="r" data-r="p' + i + '" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" rx="20" ry="13" transform="rotate(' + a + ' ' + x.toFixed(1) + ' ' + y.toFixed(1) + ')" fill="' + f('p' + i) + '" ' + INK + '/>';
            }
            return '<svg viewBox="0 0 200 200">' +
                '<rect class="r" data-r="bg" x="2" y="2" width="196" height="196" fill="' + f('bg') + '"/>' +
                '<path class="r" data-r="stem" d="M66 108 q-6 44 4 88 h8 q-8 -44 -2 -88 z" fill="' + f('stem') + '" ' + INK + '/>' +
                '<path class="r" data-r="leaf" d="M72 160 q34 -28 50 -6 q-26 20 -50 6 z" fill="' + f('leaf') + '" ' + INK + '/>' +
                petals +
                '<circle class="r" data-r="mid" cx="70" cy="80" r="16" fill="' + f('mid') + '" ' + INK + '/>' +
                '<path class="r" data-r="wingL" d="M150 40 q-30 -24 -30 6 q0 22 30 6 z" fill="' + f('wingL') + '" ' + INK + '/>' +
                '<path class="r" data-r="wingR" d="M154 40 q30 -24 30 6 q0 22 -30 6 z" fill="' + f('wingR') + '" ' + INK + '/>' +
                '<rect x="148" y="28" width="8" height="34" rx="4" fill="#3e2c4a"/>' +
                '</svg>';
        } }
    };

    K.pageSVG = function (page, fills) {
        return K.PAGES[page].svg(function (r) { return fills[r] || '#ffffff'; });
    };

    K.restart = function (el, cls) {
        el.classList.remove(cls);
        void el.offsetWidth;
        el.classList.add(cls);
    };
})();

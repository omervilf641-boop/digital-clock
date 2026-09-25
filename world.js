/* ------------------------------------------------------------------ *
 * עיר החברזים — העולם הפתוח שמחבר את כל המשחקים
 *
 * רחוב אחד ארוך. הדמות של השחקן הפעיל (מאי החברזים) הולכת לאן
 * שלוחצים, החברזים שהוא תפס מטיילים ברחוב, ובניינים הם דלתות
 * למשחקים: הבית, המאפייה, החנות, האלבום והנמל לאי.
 *
 * העיר לא שומרת כלום משלה חוץ ממקום ההליכה ברחוב — הדמות והחברים
 * נקראים מהשמירה של אי החברזים, כך שמה שקורה שם מופיע כאן.
 * ------------------------------------------------------------------ */

(function () {
    'use strict';

    var $ = function (id) { return document.getElementById(id); };
    function rand(a, b) { return a + Math.random() * (b - a); }
    function pick(l) { return l[Math.floor(Math.random() * l.length)]; }
    function plain(t) { return t.replace(/[֑-ׇ]/g, ''); }

    /* ============================================================== *
     * ציורי הדמויות — אותם פרמטרים בדיוק כמו באי
     * ============================================================== */

    /* הועתק מ-game.js — אותם פרמטרים, אותה דמות */
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


    var LOOKS_OF = {"galgali": {"nik": "גַּלְגַּלִּי", "name": "גלגלי", "body": "#4ea9ff", "belly": "#dcf1ff", "dark": "#2f7fd0", "ears": "floppy"}, "buali": {"nik": "בּוּעָלִי", "name": "בועלי", "body": "#7ee0e8", "belly": "#eafcff", "dark": "#3fb6c2", "ears": "round", "antenna": true}, "shonit": {"nik": "שׁוֹנִיתִי", "name": "שוניתי", "body": "#ff9ec4", "belly": "#ffe6f2", "dark": "#e2699d", "ears": "leaf"}, "alali": {"nik": "עַלְעָלִי", "name": "עלעלי", "body": "#5fd08a", "belly": "#e6ffe9", "dark": "#34a163", "ears": "leaf"}, "namnumi": {"nik": "נַמְנוּמִי", "name": "נמנומי", "body": "#b9e06a", "belly": "#f6ffd8", "dark": "#86ad3c", "ears": "floppy"}, "kokoni": {"nik": "קוֹקוֹנִי", "name": "קוקוני", "body": "#a97bff", "belly": "#efe6ff", "dark": "#7b4fd6", "ears": "pointy"}, "lohiti": {"nik": "לוֹהִיטִי", "name": "לוהיטי", "body": "#ff7a59", "belly": "#ffe0d3", "dark": "#d9502f", "ears": "pointy"}, "popi": {"nik": "פּוֹפִּי", "name": "פופי", "body": "#ffb03d", "belly": "#fff0d0", "dark": "#d98a1c", "ears": "round"}, "gechali": {"nik": "גֶּחָלִי", "name": "גחלי", "body": "#ff5f7e", "belly": "#ffdfe6", "dark": "#d43a5c", "ears": "floppy"}, "kochavi": {"nik": "כּוֹכָבִי", "name": "כוכבי", "body": "#ffd93d", "belly": "#fff6cf", "dark": "#d9ac16", "ears": "pointy", "antenna": true}, "zizi": {"nik": "זִיזִי", "name": "זיזי", "body": "#8ab6ff", "belly": "#e7f0ff", "dark": "#5a86d6", "ears": "round", "antenna": true}, "chalomi": {"nik": "חֲלוֹמִי", "name": "חלומי", "body": "#d59bff", "belly": "#f7e9ff", "dark": "#a865d6", "ears": "floppy", "antenna": true}, "gavishi": {"nik": "גָּבִישִׁי", "name": "גבישי", "body": "#7fe4ff", "belly": "#e8fbff", "dark": "#3aa8c9", "ears": "pointy"}, "nitznutzi": {"nik": "נִצְנוּצִי", "name": "נצנוצי", "body": "#b7c4ff", "belly": "#eef1ff", "dark": "#7f8fd6", "ears": "round"}, "mearoni": {"nik": "מְעָרוֹנִי", "name": "מערוני", "body": "#a0f0d8", "belly": "#eafff8", "dark": "#4fbf9e", "ears": "floppy"}, "sukariti": {"nik": "סֻכָּרִיתִי", "name": "סוכריתי", "body": "#ffc2e2", "belly": "#fff0f8", "dark": "#e884b8", "ears": "leaf"}, "anani": {"nik": "עֲנָנִי", "name": "ענני", "body": "#dbe7ff", "belly": "#ffffff", "dark": "#93a8cc", "ears": "floppy"}, "marshmelo": {"nik": "מַרְשְׁמֶלוֹ", "name": "מרשמלו", "body": "#ffe08a", "belly": "#fff8e0", "dark": "#d9b04c", "ears": "round", "antenna": true}, "bipi": {"nik": "בִּיפִּי", "name": "ביפי", "body": "#7ad9ff", "belly": "#e0f7ff", "dark": "#2f9ecf", "ears": "pointy", "antenna": true}, "borgi": {"nik": "בּוֹרְגִּי", "name": "בורגי", "body": "#ffa8a8", "belly": "#ffe8e8", "dark": "#d96b6b", "ears": "round"}, "chashmali": {"nik": "חַשְׁמַלִּי", "name": "חשמלי", "body": "#ffe14d", "belly": "#fffbd6", "dark": "#d9b81c", "ears": "pointy", "antenna": true}, "zehavhav": {"nik": "זְהַבְהָב", "name": "זהבהב", "body": "#ffd54a", "belly": "#fff6d4", "dark": "#d9a41c", "ears": "pointy", "antenna": true}, "kashtoni": {"nik": "קַשְׁתּוֹנִי", "name": "קשתוני", "body": "#ff9ad9", "belly": "#fff0fa", "dark": "#c95bab", "ears": "leaf"}, "layloni": {"nik": "לַיְלוֹנִי", "name": "לילוני", "body": "#5b6bb5", "belly": "#dbe3ff", "dark": "#39468a", "ears": "floppy"}};

    function creatureSVG(c) {
        var b = c.body, d = c.dark, ears;
        if (c.ears === 'pointy') {
            ears = '<path d="M38 46 L28 6 L60 32 Z" fill="' + b + '"/><path d="M82 46 L92 6 L60 32 Z" fill="' + b + '"/>';
        } else if (c.ears === 'round') {
            ears = '<circle cx="28" cy="34" r="15" fill="' + b + '"/><circle cx="92" cy="34" r="15" fill="' + b + '"/>';
        } else if (c.ears === 'leaf') {
            ears = '<path d="M40 44 C 18 28, 24 4, 44 14 C 56 20, 54 40, 40 44 Z" fill="' + b + '"/>' +
                   '<path d="M80 44 C 102 28, 96 4, 76 14 C 64 20, 66 40, 80 44 Z" fill="' + b + '"/>';
        } else {
            ears = '<ellipse cx="26" cy="42" rx="12" ry="24" fill="' + b + '" transform="rotate(-22 26 42)"/>' +
                   '<ellipse cx="94" cy="42" rx="12" ry="24" fill="' + b + '" transform="rotate(22 94 42)"/>';
        }
        return '<svg viewBox="0 0 120 120" aria-hidden="true">' + ears +
            (c.antenna ? '<path d="M60 34 C 58 22, 64 18, 62 10" stroke="' + d + '" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="62" cy="8" r="6" fill="#ffd93d"/>' : '') +
            '<ellipse cx="20" cy="78" rx="10" ry="8" fill="' + d + '"/><ellipse cx="100" cy="78" rx="10" ry="8" fill="' + d + '"/>' +
            '<ellipse cx="44" cy="104" rx="14" ry="9" fill="' + d + '"/><ellipse cx="76" cy="104" rx="14" ry="9" fill="' + d + '"/>' +
            '<ellipse cx="60" cy="68" rx="36" ry="34" fill="' + b + '"/>' +
            '<ellipse cx="60" cy="86" rx="21" ry="14" fill="' + c.belly + '"/>' +
            '<circle cx="32" cy="74" r="7" fill="#ff8fc4" opacity=".55"/><circle cx="88" cy="74" r="7" fill="#ff8fc4" opacity=".55"/>' +
            '<ellipse cx="46" cy="58" rx="11" ry="12.5" fill="#fff"/><ellipse cx="74" cy="58" rx="11" ry="12.5" fill="#fff"/>' +
            '<circle cx="47" cy="60" r="6" fill="#1f2a52"/><circle cx="75" cy="60" r="6" fill="#1f2a52"/>' +
            '<circle cx="45" cy="57" r="2.3" fill="#fff"/><circle cx="73" cy="57" r="2.3" fill="#fff"/>' +
            '<ellipse cx="60" cy="68" rx="4" ry="3" fill="' + d + '"/>' +
            '<path d="M50 72 q10 10 20 0" stroke="' + d + '" stroke-width="3.4" fill="none" stroke-linecap="round"/>' +
            '</svg>';
    }

    /* ============================================================== *
     * מי משחק — נקרא מהשמירה של האי
     * ============================================================== */

    function readPlayer() {
        try {
            var s = JSON.parse(localStorage.getItem('chavrezim.v1') || 'null');
            if (!s) return null;
            var p = Array.isArray(s.players) ? s.players[s.active | 0] : s;   /* גם שמירה ישנה */
            return p && p.hero ? p : null;
        } catch (e) { return null; }
    }

    var player = readPlayer();
    var hero = (player && player.hero) || { name: 'חָבֵר', skin: 0, hair: 0, color: 0, shirt: 1 };

    var settings = { sound: true };
    try {
        var st = JSON.parse(localStorage.getItem('chavrezim.v1') || 'null');
        if (st && typeof st.sound === 'boolean') settings.sound = st.sound;
    } catch (e) { /* ברירת מחדל */ }

    /* ============================================================== *
     * צליל ודיבור
     * ============================================================== */

    var audio = null;

    function tone(f, at, dur, type, vol) {
        if (!settings.sound) return;
        try {
            if (!audio) audio = new (window.AudioContext || window.webkitAudioContext)();
            if (audio.state === 'suspended') audio.resume();
            var o = audio.createOscillator(), g = audio.createGain(), t0 = audio.currentTime + (at || 0);
            o.type = type || 'sine';
            o.frequency.setValueAtTime(f, t0);
            g.gain.setValueAtTime(.0001, t0);
            g.gain.exponentialRampToValueAtTime(vol || .12, t0 + .02);
            g.gain.exponentialRampToValueAtTime(.0001, t0 + dur);
            o.connect(g).connect(audio.destination);
            o.start(t0);
            o.stop(t0 + dur + .05);
        } catch (e) { /* בלי צליל */ }
    }

    var sfx = {
        step:  function () { tone(220 + Math.random() * 40, 0, .05, 'triangle', .035); },
        pop:   function () { tone(620 + Math.random() * 200, 0, .09, 'triangle', .12); },
        door:  function () { tone(1760, 0, .4, 'sine', .1); tone(2349, .1, .5, 'sine', .08); },
        splash:function () { [900, 1200, 1500].forEach(function (f, i) { tone(f, i * .05, .12, 'sine', .06); }); },
        whee:  function () { tone(400, 0, .5, 'sine', .1); tone(900, .05, .6, 'sine', .08); },
        rustle:function () { for (var i = 0; i < 5; i++) tone(2000 + Math.random() * 1500, i * .04, .05, 'sawtooth', .015); },
        horn:  function () { tone(196, 0, .6, 'sawtooth', .06); tone(247, 0, .6, 'sawtooth', .05); }
    };

    function say(text) {
        try {
            var s = JSON.parse(localStorage.getItem('chavrezim.v1') || 'null');
            if (s && s.voice === false) return;
        } catch (e) { /* ממשיכים */ }
        if (!('speechSynthesis' in window)) return;
        try {
            speechSynthesis.cancel();
            var u = new SpeechSynthesisUtterance(plain(text));
            u.lang = 'he-IL';
            u.rate = .92;
            u.pitch = 1.25;
            var he = (speechSynthesis.getVoices() || []).filter(function (v) { return /^he/i.test(v.lang); })[0];
            if (he) u.voice = he;
            speechSynthesis.speak(u);
        } catch (e) { /* בלי הקראה */ }
    }

    /* ============================================================== *
     * הציורים של הרחוב
     * ============================================================== */

    function door(x, y, w, h, color) {
        return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="6" fill="#5b3a22"/>' +
               '<rect class="door" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="6" fill="' + color + '"/>' +
               '<circle cx="' + (x + w - 10) + '" cy="' + (y + h / 2) + '" r="4" fill="#ffd84a"/>';
    }

    var ART = {
        home: function () {
            return '<svg viewBox="0 0 260 300">' +
                '<rect x="176" y="40" width="26" height="60" fill="#c0504d"/>' +
                '<rect x="30" y="120" width="200" height="180" fill="#ffe1c7"/>' +
                '<path d="M10 128 L130 30 L250 128 Z" fill="#ff8fb8"/>' +
                '<path d="M10 128 L130 30 L250 128 L234 128 L130 44 L26 128 Z" fill="#e0628f"/>' +
                '<rect class="win" x="48" y="150" width="54" height="50" rx="8" fill="#bfe9ff" stroke="#fff" stroke-width="6"/>' +
                '<rect class="win" x="158" y="150" width="54" height="50" rx="8" fill="#bfe9ff" stroke="#fff" stroke-width="6"/>' +
                '<path d="M48 200 h54 v10 h-54 z M158 200 h54 v10 h-54 z" fill="#8fd16a"/>' +
                '<text x="64" y="206" font-size="16">🌷🌼</text><text x="174" y="206" font-size="16">🌼🌷</text>' +
                door(105, 214, 50, 86, '#a26a3e') +
                '</svg>';
        },
        bakery: function () {
            var stripes = '';
            for (var i = 0; i < 9; i++) stripes += '<rect x="' + (10 + i * 28) + '" y="96" width="14" height="40" fill="#ff8fb8"/>';
            return '<svg viewBox="0 0 280 320">' +
                '<rect x="20" y="60" width="240" height="260" fill="#fff4e3"/>' +
                '<rect x="10" y="40" width="260" height="30" rx="8" fill="#a26a3e"/>' +
                '<rect x="10" y="96" width="260" height="40" fill="#fff"/>' + stripes +
                '<path d="M10 136 q14 14 28 0 q14 14 28 0 q14 14 28 0 q14 14 28 0 q14 14 28 0 q14 14 28 0 q14 14 28 0 q14 14 28 0 q14 14 28 0 q14 14 28 0" fill="#ff8fb8"/>' +
                '<rect class="win" x="36" y="170" width="116" height="90" rx="10" fill="#d9f3ff" stroke="#fff" stroke-width="6"/>' +
                '<text x="48" y="240" font-size="34">🎂🧁🍰</text>' +
                door(180, 196, 64, 124, '#e0628f') +
                '<text x="118" y="36" font-size="28">🧁</text>' +
                '</svg>';
        },
        shop: function () {
            return '<svg viewBox="0 0 260 300">' +
                '<rect x="20" y="70" width="220" height="230" fill="#d7ecff"/>' +
                '<path d="M8 76 L130 22 L252 76 Z" fill="#4ea9ff"/>' +
                '<rect x="8" y="76" width="244" height="16" fill="#2f7fd0"/>' +
                '<rect class="win" x="34" y="120" width="104" height="96" rx="10" fill="#fff" stroke="#ffd84a" stroke-width="6"/>' +
                '<text x="44" y="160" font-size="26">👑🎀</text><text x="44" y="200" font-size="26">🧸🎈</text>' +
                door(162, 180, 60, 120, '#ffd84a') +
                '<text x="112" y="62" font-size="26">🐚</text>' +
                '</svg>';
        },
        album: function () {
            var cols = '';
            [40, 90, 150, 200].forEach(function (x) { cols += '<rect x="' + x + '" y="110" width="20" height="150" fill="#fff"/>'; });
            return '<svg viewBox="0 0 260 300">' +
                '<rect x="20" y="100" width="220" height="200" fill="#f3e6ff"/>' +
                '<path d="M6 104 L130 34 L254 104 Z" fill="#a97bff"/>' +
                '<text x="112" y="92" font-size="26">⭐</text>' +
                cols +
                '<rect x="14" y="260" width="232" height="14" fill="#d8c3f7"/>' +
                door(106, 196, 48, 64, '#7b4fd6') +
                '<rect x="20" y="274" width="220" height="26" fill="#e6d6fb"/>' +
                '</svg>';
        },
        soon: function () {
            return '<svg viewBox="0 0 260 320">' +
                '<rect x="190" y="30" width="12" height="290" fill="#ffb03d"/>' +
                '<rect x="60" y="30" width="200" height="10" fill="#ffb03d"/>' +
                '<g class="hook"><rect x="96" y="40" width="3" height="90" fill="#555"/><path d="M90 130 q7 14 14 0" stroke="#555" stroke-width="4" fill="none"/>' +
                '<rect x="80" y="134" width="34" height="26" fill="#ff8fb8" stroke="#e0628f" stroke-width="3"/></g>' +
                '<rect x="10" y="240" width="170" height="80" fill="#ffe1c7" opacity=".7"/>' +
                '<path d="M10 240 h170" stroke="#c98b5a" stroke-width="6" stroke-dasharray="14 8"/>' +
                '<text x="20" y="312" font-size="30">🚧</text><text x="130" y="312" font-size="30">🚧</text>' +
                '<path d="M200 320 l12 -40 l12 40 z" fill="#ff7a59"/><rect x="202" y="298" width="20" height="5" fill="#fff"/>' +
                '</svg>';
        },
        tree: function () {
            return '<svg viewBox="0 0 120 200"><rect x="52" y="110" width="16" height="90" rx="6" fill="#a26a3e"/>' +
                '<circle cx="60" cy="70" r="50" fill="#6fbf4f"/><circle cx="34" cy="92" r="30" fill="#7cc25c"/><circle cx="88" cy="90" r="32" fill="#7cc25c"/>' +
                '<circle cx="46" cy="60" r="6" fill="#ff5f7e"/><circle cx="78" cy="80" r="6" fill="#ff5f7e"/><circle cx="62" cy="100" r="6" fill="#ff5f7e"/></svg>';
        },
        flowers: function () {
            return '<svg viewBox="0 0 90 70"><path d="M20 70 v-30 M45 70 v-40 M70 70 v-28" stroke="#4fae52" stroke-width="4"/>' +
                '<text x="4" y="46" font-size="30">🌷</text><text x="30" y="36" font-size="30">🌼</text><text x="56" y="48" font-size="30">🌸</text></svg>';
        },
        lamp: function () {
            return '<svg viewBox="0 0 50 200"><rect x="22" y="40" width="6" height="160" fill="#3e2c4a"/>' +
                '<path d="M10 44 h30 l-6 -24 h-18 z" fill="#3e2c4a"/><circle class="bulb" cx="25" cy="38" r="9" fill="#ffe066"/></svg>';
        },
        fountain: function () {
            return '<svg viewBox="0 0 180 150">' +
                '<path class="jet" d="M86 110 q-40 -70 -64 -10" stroke="#8fd8ff" stroke-width="6" fill="none" stroke-linecap="round"/>' +
                '<path class="jet j2" d="M90 110 v-90" stroke="#8fd8ff" stroke-width="8" fill="none" stroke-linecap="round"/>' +
                '<path class="jet j3" d="M94 110 q40 -70 64 -10" stroke="#8fd8ff" stroke-width="6" fill="none" stroke-linecap="round"/>' +
                '<rect x="80" y="80" width="20" height="40" fill="#cfd8ea"/>' +
                '<ellipse cx="90" cy="118" rx="84" ry="16" fill="#cfd8ea"/><ellipse cx="90" cy="114" rx="72" ry="10" fill="#6fcbf5"/>' +
                '<rect x="6" y="118" width="168" height="32" rx="8" fill="#cfd8ea"/></svg>';
        },
        swing: function () {
            return '<svg viewBox="0 0 180 180">' +
                '<path d="M20 180 L50 14 L130 14 L160 180" stroke="#ff7a59" stroke-width="10" fill="none" stroke-linejoin="round"/>' +
                '<g class="swing-seat"><path d="M74 20 v110 M106 20 v110" stroke="#777" stroke-width="3"/>' +
                '<rect x="66" y="128" width="48" height="10" rx="4" fill="#4ea9ff"/></g></svg>';
        },
        slide: function () {
            return '<svg viewBox="0 0 170 180">' +
                '<path d="M30 180 v-150 M58 180 v-150" stroke="#a97bff" stroke-width="8"/>' +
                '<path d="M30 60 h28 M30 90 h28 M30 120 h28 M30 150 h28" stroke="#a97bff" stroke-width="6"/>' +
                '<rect x="24" y="24" width="42" height="12" rx="4" fill="#7b4fd6"/>' +
                '<path d="M60 30 C 110 40, 110 170, 168 170 L168 180 C 100 180, 96 50, 60 40 Z" fill="#ffd84a"/></svg>';
        },
        dock: function () {
            return '<svg viewBox="0 0 220 60"><rect x="0" y="10" width="220" height="18" fill="#c98b5a"/>' +
                '<path d="M0 10 h220" stroke="#a26a3e" stroke-width="4"/>' +
                '<rect x="20" y="28" width="12" height="32" fill="#a26a3e"/><rect x="120" y="28" width="12" height="32" fill="#a26a3e"/>' +
                '<rect x="200" y="28" width="12" height="32" fill="#a26a3e"/></svg>';
        },
        boat: function () {
            return '<svg viewBox="0 0 200 180">' +
                '<rect x="96" y="10" width="6" height="120" fill="#a26a3e"/>' +
                '<path d="M102 16 L170 110 L102 110 Z" fill="#fff"/><path d="M96 26 L40 110 L96 110 Z" fill="#ff8fb8"/>' +
                '<path d="M10 124 h180 l-26 44 h-128 z" fill="#4ea9ff"/><rect x="10" y="118" width="180" height="10" rx="4" fill="#2f7fd0"/>' +
                '<circle cx="60" cy="146" r="7" fill="#fff"/><circle cx="100" cy="146" r="7" fill="#fff"/><circle cx="140" cy="146" r="7" fill="#fff"/>' +
                '<text x="118" y="14" font-size="22">🏝️</text></svg>';
        }
    };

    /* ============================================================== *
     * מפת הרחוב
     * כל x הוא מרכז הדבר, ביחידות "עולם" שמוכפלות בקנה המידה
     * ============================================================== */

    var PLACES = [
        { kind: 'tree',     x: 70,   w: 120 },
        { kind: 'home',     x: 300,  w: 260, doorX: 130, nik: 'הַבַּיִת שֶׁלִּי',        say: 'הבית שלי',          go: 'game.html#room',  emoji: '🏡' },
        { kind: 'flowers',  x: 490,  w: 90,  act: 'flower' },
        { kind: 'lamp',     x: 580,  w: 50 },
        { kind: 'fountain', x: 760,  w: 180, act: 'fountain', nik: 'הַמִּזְרָקָה',   say: 'המזרקה' },
        { kind: 'bakery',   x: 1060, w: 280, doorX: 212, nik: 'הַמַּאֲפִיָּה',       say: 'המאפייה',           go: 'bakery.html',     emoji: '🧁' },
        { kind: 'tree',     x: 1290, w: 120 },
        { kind: 'shop',     x: 1520, w: 260, doorX: 192, nik: 'הַחֲנוּת שֶׁל צִדְפּוֹנִי', say: 'החנות של צדפוני',   go: 'game.html#shop',  emoji: '🏪' },
        { kind: 'lamp',     x: 1720, w: 50 },
        { kind: 'swing',    x: 1880, w: 180, act: 'swing',  nik: 'גַּן הַשַּׁעֲשׁוּעִים', say: 'גן השעשועים' },
        { kind: 'slide',    x: 2080, w: 170, act: 'slide',  nik: 'גַּן הַשַּׁעֲשׁוּעִים', say: 'גן השעשועים' },
        { kind: 'flowers',  x: 2240, w: 90,  act: 'flower' },
        { kind: 'album',    x: 2440, w: 260, doorX: 130, nik: 'בֵּית הַחֲבֵרִים',      say: 'בית החברים',        go: 'game.html#album', emoji: '📔' },
        { kind: 'tree',     x: 2660, w: 120 },
        { kind: 'soon',     x: 2900, w: 260, act: 'soon',  nik: 'בִּנְיָן חָדָשׁ',       say: 'כאן ייבנה בניין חדש' },
        { kind: 'lamp',     x: 3100, w: 50 },
        { kind: 'dock',     x: 3260, w: 220, nik: 'הַנָּמָל', emoji: '⚓' },
        { kind: 'boat',     x: 3420, w: 200, act: 'boat', doorX: 100, nik: 'הַנָּמָל — לָאִי', say: 'הנמל. מפליגים לאי החברזים', go: 'game.html#map', emoji: '⛵' }
    ];

    var WORLD_W = 3620;
    var WATER_FROM = 3180;

    /* ============================================================== *
     * בנייה
     * ============================================================== */

    var k = 1;                       /* קנה מידה לפי גובה המסך */
    var world = $('world');
    var heroEl, heroX, targetX, onArrive = null;
    var cam = 0;
    var npcs = [];
    var busy = false;

    function scale() {
        var h = $('viewport').clientHeight;
        k = Math.max(.62, Math.min(1.35, h / 620));
    }

    function build() {
        scale();
        world.innerHTML = '';
        world.style.width = WORLD_W * k + 'px';

        var ground = document.createElement('div');
        ground.className = 'ground';
        ground.style.width = WATER_FROM * k + 'px';
        world.appendChild(ground);

        var water = document.createElement('div');
        water.className = 'water';
        water.style.left = WATER_FROM * k + 'px';
        water.style.width = (WORLD_W - WATER_FROM) * k + 'px';
        world.appendChild(water);

        PLACES.forEach(function (p, i) {
            var el = document.createElement('div');
            el.className = 'thing ' + p.kind + (p.go || p.act ? ' tap' : '') + (p.go && p.kind !== 'boat' ? ' building' : '');
            el.style.left = (p.x - p.w / 2) * k + 'px';
            el.style.width = p.w * k + 'px';
            el.innerHTML = ART[p.kind]();
            el.dataset.i = i;

            if (p.kind === 'boat') { el.style.bottom = 'calc(26% - ' + (40 * k) + 'px)'; }
            if (p.kind === 'dock') { el.style.bottom = 'calc(26% - ' + (40 * k) + 'px)'; }

            if (p.go && p.kind !== 'boat') {
                var sign = document.createElement('div');
                sign.className = 'sign';
                sign.style.fontSize = Math.round(19 * k) + 'px';
                sign.textContent = p.emoji + ' ' + p.nik;
                el.appendChild(sign);
            }
            if (p.kind === 'soon') {
                var soon = document.createElement('div');
                soon.className = 'soon-badge';
                soon.textContent = '🚧 בְּקָרוֹב';
                el.appendChild(soon);
            }
            if (p.kind === 'home') {
                for (var s = 0; s < 3; s++) {
                    var puff = document.createElement('span');
                    puff.className = 'smoke';
                    puff.style.left = 72 + '%';
                    puff.style.top = 10 + '%';
                    puff.style.animationDelay = s + 's';
                    el.appendChild(puff);
                }
            }
            p.el = el;
            world.appendChild(el);
        });

        /* הגבעות רחבות מספיק כדי לא להיגמר בזמן שהן זזות לאט */
        $('hills').style.width = (WORLD_W * k * .5 + window.innerWidth) + 'px';

        buildHero();
        buildNpcs();
    }

    function buildHero() {
        heroEl = document.createElement('div');
        heroEl.className = 'hero';
        heroEl.style.width = 96 * k + 'px';
        heroEl.innerHTML = '<span class="face" style="display:block">' + heroSVG(hero) + '</span>';
        world.appendChild(heroEl);

        var saved = null;
        try { saved = parseFloat(localStorage.getItem('world.x')); } catch (e) { /* התחלה */ }
        heroX = targetX = (saved && saved > 0 ? saved : 470) * k;
        placeHero();
    }

    function buildNpcs() {
        npcs = [];
        var ids = player ? player.caught.slice() : [];
        /* פחות משלושה חברים? תושבי העיר ממלאים את הרחוב */
        ['galgali', 'buali', 'popi', 'alali'].forEach(function (id) {
            if (ids.length < 3 && ids.indexOf(id) === -1) ids.push(id);
        });
        ids = ids.filter(function (id) { return LOOKS_OF[id]; }).sort(function () { return Math.random() - .5; }).slice(0, 7);

        ids.forEach(function (id) {
            var c = LOOKS_OF[id];
            var el = document.createElement('div');
            el.className = 'npc tap';
            el.style.width = 66 * k + 'px';
            el.innerHTML = '<span class="face" style="display:block">' + creatureSVG(c) + '</span>';
            world.appendChild(el);
            var n = { id: id, c: c, el: el, x: rand(200, WATER_FROM - 120) * k, target: 0, speed: rand(40, 70) * k, wait: rand(0, 3) };
            n.target = n.x;
            el.addEventListener('click', function (e) { e.stopPropagation(); greet(n); });
            npcs.push(n);
        });
    }

    /* ============================================================== *
     * תנועה
     * ============================================================== */

    function placeHero() {
        heroEl.style.left = heroX + 'px';
        var vw = $('viewport').clientWidth;
        var want = Math.max(0, Math.min(WORLD_W * k - vw, heroX - vw / 2));
        cam += (want - cam) * .12;                 /* המצלמה מדביקה בעדינות */
        world.style.transform = 'translateX(' + (-cam) + 'px)';
        $('hills').style.transform = 'translateX(' + (-cam * .35) + 'px)';
    }

    var lastT = 0, stepClock = 0;

    function frame(t) {
        var dt = Math.min(.05, (t - lastT) / 1000 || 0);
        lastT = t;

        var dx = targetX - heroX;
        var speed = 300 * k;
        if (Math.abs(dx) > 2) {
            heroX += Math.sign(dx) * Math.min(Math.abs(dx), speed * dt);
            heroEl.classList.add('is-walking');
            heroEl.classList.toggle('is-left', dx < 0);
            stepClock += dt;
            if (stepClock > .18) { sfx.step(); stepClock = 0; }
        } else if (heroEl.classList.contains('is-walking')) {
            heroX = targetX;
            heroEl.classList.remove('is-walking');
            if (onArrive) { var cb = onArrive; onArrive = null; cb(); }
        }
        placeHero();
        updatePlace();

        npcs.forEach(function (n) {
            if (n.wait > 0) { n.wait -= dt; n.el.classList.remove('is-walking'); }
            else {
                var d = n.target - n.x;
                if (Math.abs(d) < 3) {
                    n.wait = rand(1.5, 5);
                    n.target = Math.max(120 * k, Math.min((WATER_FROM - 100) * k, n.x + rand(-420, 420) * k));
                } else {
                    n.x += Math.sign(d) * Math.min(Math.abs(d), n.speed * dt);
                    n.el.classList.add('is-walking');
                    n.el.classList.toggle('is-left', d < 0);
                }
            }
            n.el.style.left = n.x + 'px';
        });

        requestAnimationFrame(frame);
    }

    function walkTo(x, then) {
        targetX = Math.max(60 * k, Math.min((WATER_FROM + 30) * k, x));
        onArrive = then || null;
        if (Math.abs(targetX - heroX) <= 2 && then) { onArrive = null; then(); }
    }

    var shownPlace = null;

    function updatePlace() {
        var hx = heroX / k, best = null, bestD = 200;
        PLACES.forEach(function (p) {
            if (!p.nik) return;
            var d = Math.abs(p.x - hx);
            if (d < bestD) { bestD = d; best = p; }
        });
        var label = best ? (best.emoji ? best.emoji + ' ' : '') + best.nik : 'עִיר הַחַבְרֵזִים';
        if (label !== shownPlace) { $('place').textContent = label; shownPlace = label; }
    }

    /* ============================================================== *
     * הקשות
     * ============================================================== */

    function worldX(clientX) {
        return clientX - $('viewport').getBoundingClientRect().left + cam;
    }

    function ripple(x) {
        var r = document.createElement('div');
        r.className = 'target';
        r.style.left = x + 'px';
        world.appendChild(r);
        setTimeout(r.remove.bind(r), 700);
    }

    function drops(el, n, color) {
        var r = el.getBoundingClientRect();
        for (var i = 0; i < n; i++) {
            var d = document.createElement('span');
            d.className = 'drop';
            d.style.left = (r.left + r.width / 2 + rand(-20, 20)) + 'px';
            d.style.top = (r.top + r.height * .3) + 'px';
            d.style.setProperty('--dx', rand(-110, 110) + 'px');
            d.style.setProperty('--dy', rand(-120, 40) + 'px');
            if (color) d.style.setProperty('--c', typeof color === 'function' ? color() : color);
            $('fx').appendChild(d);
            setTimeout(d.remove.bind(d), 950);
        }
    }

    function bubble(el, text, ms) {
        var old = el.querySelector('.bubble');
        if (old) old.remove();
        var b = document.createElement('div');
        b.className = 'bubble';
        b.textContent = text;
        el.appendChild(b);
        setTimeout(function () { b.remove(); }, ms || 1800);
    }

    function greet(n) {
        sfx.pop();
        n.el.classList.remove('is-jump');
        void n.el.offsetWidth;
        n.el.classList.add('is-jump');
        n.wait = 2;
        var line = pick(['שָׁלוֹם ', 'הַיי ', 'אֵיזֶה כֵּיף לִרְאוֹת אוֹתְךָ, ']) + plain(hero.name) + '!';
        bubble(n.el, n.c.nik + ': ' + line);
        say(n.c.name + ': ' + line);
        setTimeout(function () { n.el.classList.remove('is-jump'); }, 1300);
    }

    function enter(p) {
        busy = true;
        sfx.door();
        say(p.say);
        if (p.el.classList.contains('building')) p.el.classList.add('is-open');
        if (p.kind === 'boat') sfx.horn();
        try { localStorage.setItem('world.x', String(heroX / k)); } catch (e) { /* לא נורא */ }
        setTimeout(function () { heroEl.classList.add('is-entering'); }, 250);
        setTimeout(function () { $('curtain').classList.add('is-on'); }, 550);
        setTimeout(function () { location.href = p.go; }, 1000);
    }

    function act(p) {
        switch (p.act) {
            case 'fountain':
                sfx.splash();
                drops(p.el, 22);
                say('שפלאש!');
                break;
            case 'swing':
                sfx.whee();
                p.el.classList.remove('is-high');
                void p.el.offsetWidth;
                p.el.classList.add('is-high');
                setTimeout(function () { p.el.classList.remove('is-high'); }, 4900);
                say('ווּוּוּ!');
                break;
            case 'slide':
                slideDown(p);
                break;
            case 'flower':
                sfx.pop();
                p.el.classList.remove('is-spin');
                void p.el.offsetWidth;
                p.el.classList.add('is-spin');
                drops(p.el, 10, function () { return pick(['#ff8fb8', '#ffe066', '#fff']); });
                break;
            case 'soon':
                sfx.pop();
                bubble(p.el, 'פֹּה יִבָּנֶה בִּנְיָן חָדָשׁ! 🏗️', 2200);
                say('פה ייבנה בניין חדש!');
                break;
        }
    }

    /* חבר קרוב גולש במגלשה */
    function slideDown(p) {
        sfx.whee();
        say('ווּאִי!');
        var n = npcs.slice().sort(function (a, b) { return Math.abs(a.x - p.x * k) - Math.abs(b.x - p.x * k); })[0];
        var r = p.el.getBoundingClientRect();
        var art = n ? creatureSVG(n.c) : heroSVG(hero);
        var el = document.createElement('div');
        el.style.cssText = 'position:fixed;left:0;top:0;width:' + 56 * k + 'px';
        el.innerHTML = art;
        $('fx').appendChild(el);
        var x0 = r.left + r.width * .2, y0 = r.top - 30 * k;
        var x1 = r.left + r.width * .95, y1 = r.bottom - 60 * k;
        el.animate([
            { transform: 'translate(' + x0 + 'px,' + y0 + 'px) rotate(0)' },
            { transform: 'translate(' + (x0 + (x1 - x0) * .35) + 'px,' + (y0 + 20) + 'px) rotate(18deg)', offset: .3 },
            { transform: 'translate(' + (x0 + (x1 - x0) * .7) + 'px,' + (y1 - 10) + 'px) rotate(10deg)', offset: .75 },
            { transform: 'translate(' + (x1 + 30) + 'px,' + (y1 - 26) + 'px) rotate(-8deg)' }
        ], { duration: 1200, easing: 'ease-in' }).onfinish = function () { el.remove(); sfx.pop(); };
    }

    function onTap(e) {
        if (busy) return;
        var hit = e.target.closest('.thing.tap');
        if (hit) {
            var p = PLACES[+hit.dataset.i];
            var dx = (p.doorX != null ? (p.x - p.w / 2 + p.doorX) : p.x) * k;
            ripple(dx);
            walkTo(dx, function () { if (p.go) enter(p); else act(p); });
            return;
        }
        var x = worldX(e.clientX);
        ripple(x);
        walkTo(x);
    }

    /* חצים: להחזיק כדי ללכת, לעזוב כדי לעצור */
    function holdArrow(btn, dir) {
        function start(e) {
            e.preventDefault();
            if (busy) return;
            btn.classList.add('is-held');
            walkTo(dir < 0 ? 0 : WORLD_W * k);
        }
        function stop() {
            btn.classList.remove('is-held');
            if (!onArrive) targetX = heroX;
        }
        btn.addEventListener('pointerdown', start);
        btn.addEventListener('pointerup', stop);
        btn.addEventListener('pointerleave', stop);
        btn.addEventListener('pointercancel', stop);
    }

    function birds() {
        var b = document.createElement('span');
        b.className = 'bird';
        b.textContent = '🐦';
        b.style.top = rand(80, 200) + 'px';
        b.style.left = '105vw';
        $('viewport').appendChild(b);
        setTimeout(b.remove.bind(b), 14500);
    }

    /* ============================================================== *
     * התחלה
     * ============================================================== */

    function init() {
        $('who').innerHTML = heroSVG(hero) + '<span>' + hero.name + '</span>';
        $('soundBtn').setAttribute('aria-pressed', String(settings.sound));
        $('soundBtn').addEventListener('click', function () {
            settings.sound = !settings.sound;
            $('soundBtn').setAttribute('aria-pressed', String(settings.sound));
        });

        build();
        cam = Math.max(0, heroX - $('viewport').clientWidth / 2);
        $('viewport').addEventListener('click', onTap);
        holdArrow($('goLeft'), -1);
        holdArrow($('goRight'), 1);

        if (!player) {
            $('hint').textContent = 'עוֹד אֵין לָכֶם דְּמוּת — הִיא נִבְנֵית בַּנָּמָל, בָּאִי ⛵';
        }

        window.addEventListener('resize', function () {
            var at = heroX / k;
            build();
            heroX = targetX = at * k;
        });

        /* חזרה עם כפתור "אחורה" מבניין: הדפדפן משחזר את הדף כמו שהוא */
        window.addEventListener('pageshow', function () {
            busy = false;
            $('curtain').classList.remove('is-on');
            heroEl.classList.remove('is-entering');
            PLACES.forEach(function (p) { if (p.el) p.el.classList.remove('is-open'); });
        });

        setInterval(birds, 9000);
        birds();
        requestAnimationFrame(frame);

        setTimeout(function () { say('ברוכים הבאים לעיר החברזים!'); }, 400);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();

    window.Town = { PLACES: PLACES, npcs: function () { return npcs; }, hero: function () { return { x: heroX, target: targetX, k: k }; }, walkTo: walkTo };
})();

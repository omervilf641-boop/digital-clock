/* ------------------------------------------------------------------ *
 * המאפייה של החברזים — משחק לגיל 5-6
 *
 * חברז נכנס, מזמין עוגה בתמונה (ובקול), והילדה מכינה אותה בארבעה
 * שלבים: בצק, תנור, קרם, תוספות. אחר כך מגישים, והוא אוכל.
 *
 * אותם כללים כמו באי החברזים:
 *   • אי אפשר להפסיד. בחירה לא נכונה = הלקוח מהרהר וחוזר על ההזמנה,
 *     ובפעם השנייה הכפתור הנכון מתחיל לפעום.
 *   • אין שעון. גם התנור לא נשרף.
 *   • הכל מוקרא בקול, וההזמנה מצוירת — אפשר לשחק בלי לקרוא מילה.
 * ------------------------------------------------------------------ */

(function () {
    'use strict';

    /* ============================================================== *
     * מה יש במאפייה
     * ============================================================== */

    var BASES = [
        { id: 'vanilla', nik: 'וָנִיל',    say: 'וניל',    c: '#ffdd9e', top: '#ffeac4', dark: '#dcae62' },
        { id: 'choc',    nik: 'שׁוֹקוֹלָד', say: 'שוקולד',  c: '#8a5433', top: '#a86d45', dark: '#5b341e' },
        { id: 'berry',   nik: 'תּוּת',     say: 'תות',     c: '#ffb3c7', top: '#ffcdda', dark: '#e07f9b' }
    ];

    var FROSTS = [
        { id: 'white',  nik: 'לָבָן',   say: 'לבן',   c: '#fffaf1' },
        { id: 'pink',   nik: 'וָרֹד',   say: 'ורוד',  c: '#ff9ec9' },
        { id: 'blue',   nik: 'תְּכֵלֶת', say: 'תכלת',  c: '#8fd0ff' },
        { id: 'yellow', nik: 'צָהֹב',   say: 'צהוב',  c: '#ffe066' },
        { id: 'green',  nik: 'יָרֹק',   say: 'ירוק',  c: '#9ff0c8' }
    ];

    /* שלוש פתוחות מההתחלה; השאר נפתחות ככל שמגישים עוד עוגות */
    var TOPPINGS = [
        { id: 'straw',  e: '🍓', nik: 'תּוּתִים',      say: 'תותים',      one: 'תות אחד',       unlock: 0 },
        { id: 'cherry', e: '🍒', nik: 'דֻּבְדְּבָנִים', say: 'דובדבנים',   one: 'דובדבן אחד',    unlock: 0 },
        { id: 'star',   e: '⭐', nik: 'כּוֹכָבִים',     say: 'כוכבים',     one: 'כוכב אחד',      unlock: 0 },
        { id: 'blue',   e: '🫐', nik: 'אֻכְמָנִיּוֹת',   say: 'אוכמניות',   one: 'אוכמנייה אחת',  unlock: 3 },
        { id: 'candy',  e: '🍬', nik: 'סֻכָּרִיּוֹת',    say: 'סוכריות',    one: 'סוכרייה אחת',   unlock: 6 }
    ];

    /* איפה כל תוספת נוחתת על העוגה, באחוזים מקופסת העוגה */
    var SLOTS = [[50, 35], [32, 40], [68, 40], [41, 46], [59, 46], [50, 29]];

    var CUSTOMERS = [
        { name: 'גלגלי',   nik: 'גַּלְגַּלִּי',   body: '#4ea9ff', belly: '#dcf1ff', dark: '#2f7fd0', ears: 'floppy' },
        { name: 'בועלי',   nik: 'בּוּעָלִי',     body: '#7ee0e8', belly: '#eafcff', dark: '#3fb6c2', ears: 'round', antenna: true },
        { name: 'עלעלי',   nik: 'עַלְעָלִי',     body: '#5fd08a', belly: '#e6ffe9', dark: '#34a163', ears: 'leaf' },
        { name: 'קוקוני',  nik: 'קוֹקוֹנִי',     body: '#a97bff', belly: '#efe6ff', dark: '#7b4fd6', ears: 'pointy' },
        { name: 'פופי',    nik: 'פּוֹפִּי',       body: '#ffb03d', belly: '#fff0d0', dark: '#d98a1c', ears: 'round' },
        { name: 'לוהיטי',  nik: 'לוֹהִיטִי',     body: '#ff7a59', belly: '#ffe0d3', dark: '#d9502f', ears: 'pointy' },
        { name: 'כוכבי',   nik: 'כּוֹכָבִי',     body: '#ffd93d', belly: '#fff6cf', dark: '#d9ac16', ears: 'pointy', antenna: true },
        { name: 'סוכריתי', nik: 'סֻכָּרִיתִי',   body: '#ffc2e2', belly: '#fff0f8', dark: '#e884b8', ears: 'leaf' }
    ];

    /* ============================================================== *
     * שמירה
     * ============================================================== */

    var KEY = 'bakery.v1';
    var save = { served: 0, coins: 0, sound: true, voice: true };

    function load() {
        try {
            var s = JSON.parse(localStorage.getItem(KEY) || 'null');
            if (s) {
                if (typeof s.served === 'number') save.served = s.served;
                if (typeof s.coins === 'number') save.coins = s.coins;
                if (typeof s.sound === 'boolean') save.sound = s.sound;
                if (typeof s.voice === 'boolean') save.voice = s.voice;
            }
        } catch (e) { /* בלי שמירה — עדיין משחקים */ }
    }

    function store() {
        try { localStorage.setItem(KEY, JSON.stringify(save)); } catch (e) { /* לא נורא */ }
    }

    /* ============================================================== *
     * עזרים
     * ============================================================== */

    var $ = function (id) { return document.getElementById(id); };
    function rand(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
    function pick(list) { return list[rand(0, list.length - 1)]; }
    function shuffle(list) {
        var o = list.slice();
        for (var i = o.length - 1; i > 0; i--) { var j = rand(0, i); var t = o[i]; o[i] = o[j]; o[j] = t; }
        return o;
    }
    function byId(list, id) { return list.filter(function (x) { return x.id === id; })[0]; }
    function later(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
    function plain(t) { return t.replace(/[֑-ׇ]/g, ''); }

    function unlocked() {
        return TOPPINGS.filter(function (t) { return save.served >= t.unlock; });
    }

    /* ============================================================== *
     * צליל ודיבור
     * ============================================================== */

    var audio = null;

    function tone(freq, at, dur, type, vol) {
        if (!save.sound) return;
        try {
            if (!audio) audio = new (window.AudioContext || window.webkitAudioContext)();
            if (audio.state === 'suspended') audio.resume();
            var o = audio.createOscillator();
            var g = audio.createGain();
            var t0 = audio.currentTime + (at || 0);
            o.type = type || 'sine';
            o.frequency.setValueAtTime(freq, t0);
            g.gain.setValueAtTime(0.0001, t0);
            g.gain.exponentialRampToValueAtTime(vol || 0.15, t0 + 0.02);
            g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
            o.connect(g).connect(audio.destination);
            o.start(t0);
            o.stop(t0 + dur + 0.05);
        } catch (e) { /* בלי צליל */ }
    }

    var sfx = {
        bell:  function () { tone(1760, 0, .5, 'sine', .12); tone(2349, .12, .6, 'sine', .1); },
        pop:   function () { tone(520 + rand(0, 240), 0, .09, 'triangle', .14); },
        tap:   function () { tone(660, 0, .08, 'triangle', .1); },
        good:  function () { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, i * .08, .22, 'triangle', .14); }); },
        oops:  function () { tone(330, 0, .15, 'sine', .11); tone(262, .13, .2, 'sine', .11); },
        ding:  function () { tone(1568, 0, 1.1, 'sine', .16); tone(2093, .02, .9, 'sine', .07); },
        coin:  function () { tone(988, 0, .08, 'square', .06); tone(1319, .07, .2, 'square', .06); },
        swish: function () { tone(300 + rand(0, 200), 0, .06, 'sawtooth', .025); },
        tick:  function () { tone(1200, 0, .03, 'square', .03); },
        munch: function () { tone(180 + rand(0, 60), 0, .07, 'square', .05); }
    };

    function say(text) {
        if (!save.voice || !('speechSynthesis' in window)) return;
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

    function line(text) {
        var el = $('line');
        el.textContent = text;
        el.classList.remove('is-new');
        void el.offsetWidth;
        el.classList.add('is-new');
    }

    /* ============================================================== *
     * ציורים
     * ============================================================== */

    function creatureSVG(c, mood) {
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

        var mouth;
        if (mood === 'eat') {
            mouth = '<ellipse cx="60" cy="76" rx="9" ry="7" fill="#6b2a2a"/><ellipse cx="60" cy="79" rx="5" ry="3" fill="#ff8fa3"/>';
        } else if (mood === 'hmm') {
            mouth = '<path d="M52 76 q8 -4 16 0" stroke="' + d + '" stroke-width="3.4" fill="none" stroke-linecap="round"/>';
        } else {
            mouth = '<path d="M50 72 q10 10 20 0" stroke="' + d + '" stroke-width="3.4" fill="none" stroke-linecap="round"/>';
        }

        var eyes = mood === 'joy'
            ? '<path d="M38 60 q8 -9 16 0" stroke="#1f2a52" stroke-width="3.6" fill="none" stroke-linecap="round"/>' +
              '<path d="M66 60 q8 -9 16 0" stroke="#1f2a52" stroke-width="3.6" fill="none" stroke-linecap="round"/>'
            : '<ellipse cx="46" cy="58" rx="11" ry="12.5" fill="#fff"/><ellipse cx="74" cy="58" rx="11" ry="12.5" fill="#fff"/>' +
              '<circle cx="47" cy="60" r="6" fill="#1f2a52"/><circle cx="75" cy="60" r="6" fill="#1f2a52"/>' +
              '<circle cx="45" cy="57" r="2.3" fill="#fff"/><circle cx="73" cy="57" r="2.3" fill="#fff"/>';

        return '<svg viewBox="0 0 120 120" role="img" aria-label="' + c.name + '">' + ears +
            (c.antenna ? '<path d="M60 34 C 58 22, 64 18, 62 10" stroke="' + d + '" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="62" cy="8" r="6" fill="#ffd93d"/>' : '') +
            '<ellipse cx="20" cy="78" rx="10" ry="8" fill="' + d + '"/><ellipse cx="100" cy="78" rx="10" ry="8" fill="' + d + '"/>' +
            '<ellipse cx="44" cy="104" rx="14" ry="9" fill="' + d + '"/><ellipse cx="76" cy="104" rx="14" ry="9" fill="' + d + '"/>' +
            '<ellipse cx="60" cy="68" rx="36" ry="34" fill="' + b + '"/>' +
            '<ellipse cx="60" cy="86" rx="21" ry="14" fill="' + c.belly + '"/>' +
            '<circle cx="32" cy="74" r="7" fill="#ff8fc4" opacity=".55"/><circle cx="88" cy="74" r="7" fill="#ff8fc4" opacity=".55"/>' +
            eyes + '<ellipse cx="60" cy="68" rx="4" ry="3" fill="' + d + '"/>' + mouth +
            '</svg>';
    }

    /* עוגה. opts.rise / opts.frostIn מדליקים את האנימציה רק ברגע שזה קורה */
    function cakeSVG(base, frost, opts) {
        opts = opts || {};
        var B = byId(BASES, base) || BASES[0];
        var F = frost ? byId(FROSTS, frost) : null;

        var body =
            '<g class="cake-body">' +
                '<rect x="30" y="70" width="140" height="78" rx="14" fill="' + B.c + '"/>' +
                '<rect x="30" y="108" width="140" height="9" fill="' + B.dark + '" opacity=".35"/>' +
                '<rect x="140" y="72" width="26" height="74" rx="10" fill="' + B.dark + '" opacity=".18"/>' +
                '<ellipse cx="100" cy="70" rx="70" ry="17" fill="' + B.top + '"/>' +
            '</g>';

        var icing = '';
        if (F) {
            var drips = [[44, 20], [62, 30], [82, 16], [104, 26], [126, 18], [150, 28]];
            icing = '<g>' +
                '<rect class="' + (opts.frostIn ? 'frost-top' : '') + '" x="28" y="64" width="144" height="14" rx="7" fill="' + F.c + '"/>' +
                '<ellipse class="' + (opts.frostIn ? 'frost-top' : '') + '" cx="100" cy="67" rx="72" ry="18" fill="' + F.c + '"/>' +
                drips.map(function (d, i) {
                    return '<rect class="' + (opts.frostIn ? 'drip' : '') + '" style="animation-delay:' + (0.25 + i * 0.07).toFixed(2) + 's"' +
                           ' x="' + (d[0] - 6) + '" y="72" width="12" height="' + d[1] + '" rx="6" fill="' + F.c + '"/>';
                }).join('') +
                '<ellipse cx="78" cy="62" rx="16" ry="4" fill="#fff" opacity=".5"/>' +
            '</g>';
        }

        return '<svg viewBox="0 0 200 170" aria-hidden="true">' +
            '<ellipse cx="100" cy="152" rx="92" ry="14" fill="#fff" stroke="#f3d6e0" stroke-width="3"/>' +
            body + icing + '</svg>';
    }

    function panSVG(base) {
        var B = byId(BASES, base) || BASES[0];
        return '<svg viewBox="0 0 160 70" aria-hidden="true">' +
            '<path d="M12 22 L148 22 L136 64 L24 64 Z" fill="#b8c1d8"/>' +
            '<ellipse cx="80" cy="24" rx="66" ry="10" fill="' + B.c + '"/>' +
            '<ellipse cx="62" cy="22" rx="14" ry="3" fill="#fff" opacity=".45"/>' +
            '<rect x="4" y="18" width="152" height="8" rx="4" fill="#9aa4bf"/>' +
        '</svg>';
    }

    function bowlSVG(base) {
        var B = byId(BASES, base);
        return '<svg viewBox="0 0 80 56" aria-hidden="true">' +
            '<ellipse cx="40" cy="18" rx="34" ry="9" fill="#a9d6f7"/>' +
            '<ellipse cx="40" cy="18" rx="27" ry="6" fill="' + B.c + '"/>' +
            '<path d="M6 18 Q10 54 40 54 Q70 54 74 18 Z" fill="#8cc6f0"/>' +
        '</svg>';
    }

    var WHISK = '<svg viewBox="0 0 40 120" aria-hidden="true">' +
        '<rect x="16" y="0" width="8" height="54" rx="4" fill="#c98b5a"/>' +
        '<g fill="none" stroke="#b8c1d8" stroke-width="3">' +
        '<path d="M20 52 C 2 70, 4 108, 20 116 C 36 108, 38 70, 20 52"/>' +
        '<path d="M20 52 C 10 72, 12 106, 20 116 C 28 106, 30 72, 20 52"/>' +
        '<path d="M20 52 L20 116"/></g></svg>';

    /* ============================================================== *
     * אפקטים שעפים
     * ============================================================== */

    function center(el) {
        var r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2, r: r };
    }

    function sparks(x, y, colors, n) {
        for (var i = 0; i < (n || 14); i++) {
            var s = document.createElement('span');
            s.className = 'spark';
            var a = Math.random() * Math.PI * 2, d = 40 + Math.random() * 70;
            s.style.left = x + 'px';
            s.style.top = y + 'px';
            s.style.setProperty('--dx', Math.cos(a) * d + 'px');
            s.style.setProperty('--dy', Math.sin(a) * d + 'px');
            s.style.setProperty('--c', pick(colors || ['#ff8fb8', '#ffcf4a', '#6fd6b0', '#8fd0ff']));
            $('fx').appendChild(s);
            setTimeout(s.remove.bind(s), 900);
        }
    }

    function hearts(x, y, n) {
        for (var i = 0; i < (n || 6); i++) {
            (function (k) {
                setTimeout(function () {
                    var h = document.createElement('span');
                    h.className = 'heart';
                    h.textContent = pick(['💖', '💕', '💗', '⭐']);
                    h.style.left = (x - 14 + rand(-30, 30)) + 'px';
                    h.style.top = (y - 14) + 'px';
                    h.style.setProperty('--dx', rand(-60, 60) + 'px');
                    $('fx').appendChild(h);
                    setTimeout(h.remove.bind(h), 1500);
                }, k * 120);
            })(i);
        }
    }

    function crumbs(x, y, color) {
        for (var i = 0; i < 8; i++) {
            var c = document.createElement('span');
            c.className = 'crumb';
            c.style.left = (x + rand(-20, 20)) + 'px';
            c.style.top = y + 'px';
            c.style.setProperty('--dx', rand(-50, 50) + 'px');
            c.style.setProperty('--c', color);
            $('fx').appendChild(c);
            setTimeout(c.remove.bind(c), 1000);
        }
    }

    /* מעוף בקשת מנקודה לנקודה. החזרה: הבטחה שמתממשת בנחיתה */
    function fly(text, from, to, opts) {
        opts = opts || {};
        var el = document.createElement('span');
        el.className = 'fly';
        el.innerHTML = text;
        if (opts.size) el.style.fontSize = opts.size;
        $('fx').appendChild(el);

        var w = el.offsetWidth / 2, h = el.offsetHeight / 2;
        var x0 = from.x - w, y0 = from.y - h, x1 = to.x - w, y1 = to.y - h;
        var peak = Math.min(y0, y1) - (opts.arc || 110);
        var frames = [
            { transform: 'translate(' + x0 + 'px,' + y0 + 'px) scale(1) rotate(0deg)' },
            { transform: 'translate(' + ((x0 + x1) / 2) + 'px,' + peak + 'px) scale(' + (opts.midScale || 1.35) + ') rotate(' + (opts.spin || 200) + 'deg)', offset: .5 },
            { transform: 'translate(' + x1 + 'px,' + y1 + 'px) scale(' + (opts.endScale || 1) + ') rotate(' + ((opts.spin || 200) * 2) + 'deg)' }
        ];

        if (opts.bounceOff) {
            frames[2].offset = .62;
            frames.push({ transform: 'translate(' + (x1 + 70) + 'px,' + (y1 - 60) + 'px) scale(1) rotate(560deg)', offset: .78 });
            frames.push({ transform: 'translate(' + (x1 + 130) + 'px,' + (window.innerHeight + 60) + 'px) scale(.8) rotate(800deg)' });
        }

        var anim = el.animate(frames, {
            duration: opts.duration || (opts.bounceOff ? 1100 : 620),
            easing: 'cubic-bezier(.45,.05,.4,1)',
            fill: 'forwards'
        });

        return new Promise(function (resolve) {
            anim.onfinish = function () { el.remove(); resolve(); };
        });
    }

    /* ============================================================== *
     * מסכים
     * ============================================================== */

    function show(id) {
        ['sTitle', 'sShop'].forEach(function (s) { $(s).classList.toggle('is-on', s === id); });
        window.scrollTo(0, 0);
        if (id === 'sTitle') renderTitle();
    }

    function renderTitle() {
        $('winCakes').innerHTML =
            cakeSVG('vanilla', 'pink') + cakeSVG('choc', 'yellow') + cakeSVG('berry', 'white');
        var two = shuffle(CUSTOMERS).slice(0, 2);
        $('frontFriends').innerHTML = creatureSVG(two[0], 'happy') + creatureSVG(two[1], 'happy');
        $('titleStats').textContent = save.served
            ? 'הִגַּשְׁתֶּם ' + save.served + ' עוּגוֹת · 🪙' + save.coins
            : 'הַלָּקוֹחוֹת כְּבָר מְחַכִּים בַּחוּץ!';
        $('soundBtn').setAttribute('aria-pressed', String(save.sound));
        $('voiceBtn').setAttribute('aria-pressed', String(save.voice));
    }

    /* ============================================================== *
     * ההזמנה
     * ============================================================== */

    function makeOrder() {
        var kinds = unlocked();
        var tops = [];
        if (save.served < 3) {
            tops.push({ id: pick(kinds).id, n: rand(1, 2) });
        } else if (save.served < 8 || Math.random() < .5) {
            tops.push({ id: pick(kinds).id, n: rand(1, save.served < 8 ? 4 : 5) });
        } else {
            var two = shuffle(kinds).slice(0, 2);
            tops.push({ id: two[0].id, n: rand(1, 3) });
            tops.push({ id: two[1].id, n: rand(1, 2) });
        }
        return { base: pick(BASES).id, frost: pick(FROSTS).id, tops: tops };
    }

    function orderSpeech(o) {
        var B = byId(BASES, o.base), F = byId(FROSTS, o.frost);
        var parts = o.tops.map(function (t) {
            var T = byId(TOPPINGS, t.id);
            return t.n === 1 ? T.one : t.n + ' ' + T.say;
        });
        return 'אני רוצה עוגת ' + B.say + ', עם קרם ' + F.say + ', ו' + parts.join(' ו');
    }

    function renderBubble() {
        var box = $('bubble');
        if (!S.order) {
            box.innerHTML = '<div class="mini">' + cakeSVG('vanilla', 'pink') + '</div>' +
                            '<div class="want">🎁 <b>תַּפְתִּיעוּ אוֹתִי!</b></div>';
        } else {
            box.innerHTML = '<div class="mini">' + cakeSVG(S.order.base, S.order.frost) + '</div>' +
                '<div class="want">' + S.order.tops.map(function (t) {
                    return '<span>' + new Array(t.n + 1).join(byId(TOPPINGS, t.id).e) + '</span>';
                }).join('') + '</div>';
        }
        box.hidden = false;
        box.style.animation = 'none';
        void box.offsetWidth;
        box.style.animation = '';
    }

    /* ============================================================== *
     * המשחק עצמו
     * ============================================================== */

    var S = { mode: 'order', cust: null, order: null, cake: null, step: null, wrong: 0, busy: false };
    var lastCust = null;

    function setCustomer(cls, mood) {
        var el = $('customer');
        el.className = 'customer ' + (cls || '');
        el.innerHTML = creatureSVG(S.cust, mood || 'happy');
    }

    function setSteps(step) {
        var order = ['base', 'bake', 'frost', 'top'];
        var at = order.indexOf(step);
        Array.prototype.forEach.call($('steps').children, function (li, i) {
            li.className = i < at || step === 'serve' ? 'is-done' : (i === at ? 'is-now' : '');
        });
    }

    function tray(html) {
        var t = $('tray');
        t.innerHTML = '';
        if (html) t.innerHTML = html;
        return t;
    }

    function startShop(mode) {
        S.mode = mode;
        $('purse').textContent = '🪙' + save.coins;
        show('sShop');
        newCustomer();
    }

    async function newCustomer() {
        S.busy = true;
        S.cust = pick(CUSTOMERS.filter(function (c) { return c !== lastCust; }));
        lastCust = S.cust;
        S.order = S.mode === 'free' ? null : makeOrder();
        S.cake = { base: null, frost: null, tops: [] };
        S.step = null;
        S.wrong = 0;

        $('bubble').hidden = true;
        $('station').innerHTML = '';
        tray('');
        setSteps(null);
        line('');

        $('door').classList.add('is-open');
        sfx.bell();
        setCustomer('is-entering');
        await later(1300);
        $('door').classList.remove('is-open');
        setCustomer('is-idle');

        renderBubble();
        sfx.pop();
        var hello = 'שָׁלוֹם! אֲנִי ' + S.cust.nik + '.';
        if (S.order) {
            line(hello + ' 👆 זֹאת הָעוּגָה שֶׁלִּי');
            say('שלום! אני ' + S.cust.name + '. ' + orderSpeech(S.order));
        } else {
            line(hello + ' תַּכִינוּ לִי מָה שֶׁבָּא לָכֶם!');
            say('שלום! אני ' + S.cust.name + '. תכינו לי עוגה, מה שבא לכם!');
        }
        await later(600);
        S.busy = false;
        stepBase();
    }

    /* אותה תגובה לכל בחירה לא נכונה: הלקוח מהרהר, ובפעם השנייה — רמז */
    async function wrongPick(btn, correctBtn, text) {
        S.wrong++;
        sfx.oops();
        btn.classList.remove('is-no');
        void btn.offsetWidth;
        btn.classList.add('is-no');
        setCustomer('is-hmm', 'hmm');
        line(text);
        say(text);
        if (S.wrong >= 2 && correctBtn) correctBtn.classList.add('is-hint');
        await later(700);
        setCustomer('is-idle');
    }

    function makePick(inner, label, onClick) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'pick';
        b.innerHTML = inner + (label ? '<span class="lbl">' + label + '</span>' : '');
        b.setAttribute('aria-label', plain(label || ''));
        b.addEventListener('click', function () { if (!S.busy) onClick(b); });
        return b;
    }

    /* ---------------- שלב 1: בצק ---------------- */

    function stepBase() {
        S.step = 'base';
        S.wrong = 0;
        setSteps('base');
        $('station').innerHTML =
            '<div class="mix" id="mix"><div class="bowl-back"></div><div class="batter" id="batter" hidden></div>' +
            '<div class="bowl-front"></div><div class="whisk" hidden>' + WHISK + '</div></div>';

        var t = tray();
        var buttons = {};
        BASES.forEach(function (B) {
            var b = makePick(bowlSVG(B.id), B.nik, function (btn) { chooseBase(B, btn, buttons); });
            buttons[B.id] = b;
            t.appendChild(b);
        });
        line('אֵיזֶה בָּצֵק? 🥣');
    }

    async function chooseBase(B, btn, buttons) {
        if (S.order && S.order.base !== B.id) {
            var want = byId(BASES, S.order.base);
            return wrongPick(btn, buttons[want.id], 'הִמְמְ... אֲנִי רוֹצֶה עוּגַת ' + want.nik + '!');
        }
        S.busy = true;
        S.cake.base = B.id;
        sfx.good();

        /* הקערה עפה מהמגש לעמדה */
        var mix = $('mix');
        await fly('<div style="width:90px">' + bowlSVG(B.id) + '</div>', center(btn), center(mix), { arc: 80, spin: 0, midScale: 1.2 });
        tray('');

        mix.style.setProperty('--batter', B.c);
        $('batter').hidden = false;
        mix.querySelector('.whisk').hidden = false;
        mix.classList.add('is-mixing');
        line('מְעַרְבְּבִים... 🌀');
        say('מערבבים!');

        /* טיפות בלילה ניתזות בזמן הערבוב */
        var until = Date.now() + 1800;
        while (Date.now() < until) {
            sfx.swish();
            var s = document.createElement('span');
            s.className = 'splash';
            s.style.left = rand(30, 65) + '%';
            s.style.top = '38%';
            s.style.setProperty('--dx', rand(-50, 50) + 'px');
            s.style.setProperty('--dy', rand(-70, -30) + 'px');
            mix.appendChild(s);
            setTimeout(s.remove.bind(s), 650);
            await later(150);
        }
        mix.classList.remove('is-mixing');
        S.busy = false;
        stepBake();
    }

    /* ---------------- שלב 2: תנור ---------------- */

    function stepBake() {
        S.step = 'bake';
        setSteps('bake');
        $('station').innerHTML =
            '<div class="oven" id="oven">' +
                '<div class="knobs"><span class="knob"></span><span class="knob"></span></div>' +
                '<span class="heat h1"></span><span class="heat h2"></span>' +
                '<div class="oven-win" id="ovenWin"></div>' +
            '</div>' +
            '<div class="pan-outside" id="panOut">' + panSVG(S.cake.base) + '</div>';

        var t = tray();
        var go = document.createElement('button');
        go.type = 'button';
        go.className = 'big-btn go-btn';
        go.innerHTML = '🔥 לַתַּנּוּר!';
        go.addEventListener('click', function () { if (!S.busy) bake(); });
        t.appendChild(go);
        line('עַכְשָׁו לַתַּנּוּר!');
    }

    async function bake() {
        S.busy = true;
        tray('');
        sfx.tap();
        $('panOut').classList.add('is-going-in');
        await later(650);
        $('panOut').remove();
        $('ovenWin').innerHTML = '<div class="pan">' + panSVG(S.cake.base) + '</div>';

        var oven = $('oven');
        oven.classList.add('is-baking');
        var timer = document.createElement('div');
        timer.className = 'timer';
        oven.appendChild(timer);
        line('אוֹפִים... 🔥 הָעוּגָה תּוֹפַחַת');
        say('אופים!');

        /* שעון הביצוע מתמלא. זה לא לחץ — אין מה לעשות בזמן הזה חוץ מלהסתכל */
        var ms = 2600, t0 = performance.now();
        await new Promise(function (done) {
            var lastTick = 0;
            (function frame(now) {
                var p = Math.min(1, (now - t0) / ms);
                timer.style.setProperty('--t', (p * 100).toFixed(1));
                var pan = $('ovenWin').querySelector('.pan');
                if (pan) pan.style.transform = 'translateX(-50%) scaleY(' + (1 + p * .8) + ')';
                if (now - lastTick > 330) { sfx.tick(); lastTick = now; }
                if (p < 1) requestAnimationFrame(frame); else done();
            })(t0);
        });

        timer.remove();
        var ding = document.createElement('span');
        ding.className = 'ding';
        ding.textContent = '🛎️';
        oven.appendChild(ding);
        sfx.ding();
        line('דִּינְג! הָעוּגָה מוּכָנָה!');
        await later(900);

        S.busy = false;
        stepFrost(true);
    }

    /* ---------------- שלב 3: קרם ---------------- */

    function renderCake(opts) {
        $('station').innerHTML =
            '<div class="cake-box' + (opts && opts.rise ? ' is-rising' : '') + '" id="cakeBox">' +
            cakeSVG(S.cake.base, S.cake.frost, opts) +
            '<div class="toppings" id="tops"></div></div>';
        S.cake.tops.forEach(function (id, i) {
            placeTopping(byId(TOPPINGS, id), i, false);
        });
    }

    function stepFrost(fresh) {
        S.step = 'frost';
        S.wrong = 0;
        setSteps('frost');
        renderCake({ rise: fresh });
        if (fresh) {
            var c = center($('cakeBox'));
            setTimeout(function () { sparks(c.x, c.y - 20, ['#ffcf4a', '#fff'], 10); }, 700);
        }

        var options = S.order
            ? shuffle([byId(FROSTS, S.order.frost)].concat(shuffle(FROSTS.filter(function (f) { return f.id !== S.order.frost; })).slice(0, 2)))
            : FROSTS;

        var t = tray();
        var buttons = {};
        options.forEach(function (F) {
            var b = makePick('<span class="pot" style="--c:' + F.c + '"></span>', F.nik, function (btn) { chooseFrost(F, btn, buttons); });
            buttons[F.id] = b;
            t.appendChild(b);
        });
        line('אֵיזֶה קְרֶם? 🎂');
    }

    async function chooseFrost(F, btn, buttons) {
        if (S.order && S.order.frost !== F.id) {
            var want = byId(FROSTS, S.order.frost);
            return wrongPick(btn, buttons[want.id], 'לֹא לֹא... אֲנִי רוֹצֶה קְרֶם ' + want.nik + '!');
        }
        S.busy = true;
        S.cake.frost = F.id;
        sfx.good();
        await fly('<span class="pot" style="--c:' + F.c + ';display:block;width:46px;height:46px"></span>',
                  center(btn), center($('cakeBox')), { arc: 90, spin: 40, midScale: 1.1, endScale: .6 });
        tray('');
        renderCake({ frostIn: true });
        var c = center($('cakeBox'));
        sparks(c.x, c.y - 30, [F.c, '#fff', '#ffcf4a'], 16);
        line('וּוּאוּ, אֵיזֶה קְרֶם! ✨');
        await later(1000);
        S.busy = false;
        stepTop();
    }

    /* ---------------- שלב 4: תוספות ---------------- */

    function placeTopping(T, i, animate) {
        var slot = SLOTS[i % SLOTS.length];
        var el = document.createElement('span');
        el.className = 'topping' + (animate ? ' is-landing' : '');
        el.textContent = T.e;
        el.style.left = slot[0] + '%';
        el.style.top = slot[1] + '%';
        $('tops').appendChild(el);
    }

    function countOf(id) {
        return S.cake.tops.filter(function (x) { return x === id; }).length;
    }

    function orderDone() {
        return S.order.tops.every(function (t) { return countOf(t.id) === t.n; });
    }

    function stepTop() {
        S.step = 'top';
        S.wrong = 0;
        setSteps('top');

        var kinds;
        if (S.order) {
            var wanted = S.order.tops.map(function (t) { return byId(TOPPINGS, t.id); });
            var others = shuffle(unlocked().filter(function (k) { return wanted.indexOf(k) === -1; })).slice(0, wanted.length > 1 ? 1 : 2);
            kinds = shuffle(wanted.concat(others));
        } else {
            kinds = unlocked();
        }

        var t = tray();
        S.jars = {};
        kinds.forEach(function (T) {
            var b = makePick('<span class="ico">' + T.e + '</span>', T.nik, function (btn) { addTopping(T, btn); });
            S.jars[T.id] = b;
            t.appendChild(b);
        });

        if (!S.order) {
            var done = document.createElement('button');
            done.type = 'button';
            done.className = 'big-btn go-btn';
            done.innerHTML = '✔ סִיַּמְתִּי';
            done.addEventListener('click', function () { if (!S.busy) stepServe(); });
            t.appendChild(done);
            line('שִׂימוּ מָה שֶׁבָּא לָכֶם! 🍓');
        } else {
            line('עַכְשָׁו הַתּוֹסָפוֹת! סִפְרוּ יָפֶה 🍓');
            say('עכשיו התוספות. תספרו יפה!');
        }
    }

    async function addTopping(T, btn) {
        var box = $('cakeBox');
        var need = S.order ? S.order.tops.filter(function (t) { return t.id === T.id; })[0] : null;

        /* סוג שלא הוזמן — נוחת, קופץ ונופל. בלי עונש */
        if (S.order && !need) {
            S.busy = true;
            var slotC = center(box);
            fly(T.e, center(btn), { x: slotC.x, y: slotC.y - slotC.r.height * .15 }, { bounceOff: true });
            await later(650);
            S.busy = false;
            var first = S.order.tops.filter(function (t) { return countOf(t.id) < t.n; })[0];
            return wrongPick(btn, first && S.jars[first.id], 'אוּפְּס! לֹא הִזְמַנְתִּי ' + T.nik);
        }

        /* יש כבר מספיק מהסוג הזה */
        if (need && countOf(T.id) >= need.n) {
            S.busy = true;
            var c = center(box);
            fly(T.e, center(btn), { x: c.x, y: c.y - c.r.height * .15 }, { bounceOff: true });
            await later(650);
            S.busy = false;
            var left = S.order.tops.filter(function (t) { return countOf(t.id) < t.n; })[0];
            return wrongPick(btn, left && S.jars[left.id], 'כְּבָר יֵשׁ מַסְפִּיק ' + T.nik + '! 😊');
        }

        if (!S.order && S.cake.tops.length >= SLOTS.length) {
            line('הָעוּגָה מְלֵאָה! לַחֲצוּ "סִיַּמְתִּי" ✔');
            return;
        }

        S.busy = true;
        var i = S.cake.tops.length;
        var r = box.getBoundingClientRect();
        var slot = SLOTS[i % SLOTS.length];
        var target = { x: r.left + r.width * slot[0] / 100, y: r.top + r.height * slot[1] / 100 - 10 };
        sfx.tap();
        await fly(T.e, center(btn), target);
        S.cake.tops.push(T.id);
        placeTopping(T, i, true);
        sfx.pop();
        sparks(target.x, target.y, ['#fff', '#ffcf4a'], 6);

        if (S.order) {
            var n = countOf(T.id);
            line(n + ' ' + T.e);
            say(String(n));
        }

        await later(250);
        S.busy = false;

        if (S.order && orderDone()) {
            S.busy = true;
            box.classList.add('is-wobble');
            sfx.good();
            line('בְּדִיּוּק מָה שֶׁהִזְמַנְתִּי! 🤩');
            say('בדיוק מה שהזמנתי!');
            setCustomer('is-happy', 'joy');
            await later(1300);
            setCustomer('is-idle');
            S.busy = false;
            stepServe();
        }
    }

    /* ---------------- הגשה ---------------- */

    function stepServe() {
        S.step = 'serve';
        setSteps('serve');
        var t = tray();
        var go = document.createElement('button');
        go.type = 'button';
        go.className = 'big-btn go-btn';
        go.innerHTML = '🎁 לְהַגִּישׁ!';
        go.addEventListener('click', function () { if (!S.busy) serve(); });
        t.appendChild(go);
        line('הָעוּגָה מוּכָנָה! 🎂');
    }

    async function serve() {
        S.busy = true;
        tray('');
        var box = $('cakeBox');
        var from = center(box);
        var cust = $('customer');
        var to = center(cust);

        /* העוגה עצמה עפה ללקוח — עם התוספות */
        var art = box.outerHTML.replace('id="cakeBox"', '').replace('id="tops"', '');
        $('station').innerHTML = '';
        await fly('<div style="width:' + from.r.width + 'px">' + art + '</div>', from,
                  { x: to.x, y: to.y + to.r.height * .1 }, { arc: 60, spin: 0, midScale: 1.05, endScale: .45, duration: 800 });

        /* אוכלים */
        setCustomer('is-eating', 'eat');
        var baseColor = byId(BASES, S.cake.base).c;
        for (var i = 0; i < 5; i++) {
            sfx.munch();
            crumbs(to.x, to.y + to.r.height * .12, baseColor);
            await later(280);
        }

        setCustomer('is-happy', 'joy');
        sfx.good();
        hearts(to.x, to.y - to.r.height * .3, 7);
        var thanks = pick(['יַמִּי! הָעוּגָה הֲכִי טְעִימָה בָּעוֹלָם!', 'מַמְמְ! תּוֹדָה רַבָּה!', 'וָאוּ! אֲנִי אוֹהֵב אֶת הַמַּאֲפִיָּה הַזֹּאת!']);
        line(thanks);
        say(thanks);
        $('bubble').hidden = true;

        /* מטבעות עפים לארנק */
        var pay = 3;
        var purse = center($('purse'));
        for (var k = 0; k < pay; k++) {
            (function (d) {
                setTimeout(function () {
                    fly('🪙', { x: to.x, y: to.y - 20 }, purse, { arc: 70, spin: 360, duration: 700 }).then(function () {
                        save.coins++;
                        $('purse').textContent = '🪙' + save.coins;
                        $('purse').classList.remove('is-ping');
                        void $('purse').offsetWidth;
                        $('purse').classList.add('is-ping');
                        sfx.coin();
                    });
                }, d * 220);
            })(k);
        }

        var before = unlocked().length;
        save.served++;
        store();
        await later(1700);

        var fresh = unlocked().length > before ? unlocked()[unlocked().length - 1] : null;
        if (fresh) {
            var s = center($('scene'));
            sparks(s.x, s.y, null, 30);
            line('תּוֹסֶפֶת חֲדָשָׁה בַּמַּאֲפִיָּה: ' + fresh.e + ' ' + fresh.nik + '!');
            say('תוספת חדשה במאפייה: ' + fresh.say + '!');
            await later(1600);
        }

        $('door').classList.add('is-open');
        setCustomer('is-leaving', 'joy');
        await later(1200);
        $('door').classList.remove('is-open');
        $('customer').innerHTML = '';
        S.busy = false;
        newCustomer();
    }

    /* ============================================================== *
     * חיווט
     * ============================================================== */

    function init() {
        load();
        $('openBtn').addEventListener('click', function () { sfx.bell(); startShop('order'); });
        $('freeBtn').addEventListener('click', function () { sfx.bell(); startShop('free'); });
        $('homeBtn').addEventListener('click', function () {
            if (S.busy) return;
            sfx.tap();
            show('sTitle');
        });
        $('soundBtn').addEventListener('click', function () {
            save.sound = !save.sound; store(); renderTitle(); sfx.tap();
        });
        $('voiceBtn').addEventListener('click', function () {
            save.voice = !save.voice; store(); renderTitle();
            if (save.voice) say('שומעים אותי?'); else if ('speechSynthesis' in window) speechSynthesis.cancel();
        });
        renderTitle();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();

    /* לבדיקות מהקונסולה */
    window.Bakery = {
        S: S, save: save, BASES: BASES, FROSTS: FROSTS, TOPPINGS: TOPPINGS,
        makeOrder: makeOrder, orderSpeech: orderSpeech
    };
})();

/* ------------------------------------------------------------------ *
 * ארבעה בניינים חדשים בקצה הרחוב
 *
 * places.html#school  🏫 בית הספר — אותיות ומילים ראשונות, מדבקות למחברת
 * places.html#fire    🚒 הכבאים — מכבים אש חמודה ומצילים חתול מהעץ
 * places.html#luna    🎡 לונה פארק — קרוסלה, גלגל ענק, פחיות ובלונים
 * places.html#pool    🏊 בריכה וחוף — קפיצות למים, ארמון חול וצדפים
 *
 * נטען אחרי places.js ומשתמש באותם כלים (Places.ui). אותם כללים:
 * אין הפסד, אין שעון, כל הוראה מוקראת, טעות מקבלת רמז.
 * ------------------------------------------------------------------ */

(function () {
    'use strict';

    var K = window.Kit, $ = K.$, sfx = K.sfx, U = window.Places.ui;
    var line = U.line, stage = U.stage, tray = U.tray, pick = U.pick, bigBtn = U.bigBtn, row = U.row;
    var payShell = U.payShell, walkIn = U.walkIn, every = U.every, after = U.after;

    function load(key, def) { try { return JSON.parse(localStorage.getItem(key) || 'null') || def; } catch (e) { return def; } }
    function save(key, v) { try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) { /* לא נורא */ } }

    function div(cls, html, parent) {
        var d = document.createElement('div');
        d.className = cls;
        if (html) d.innerHTML = html;
        (parent || $('stage')).appendChild(d);
        return d;
    }

    /* הגיבור/ה עם תוספות לבוש לכל מקום */
    var WEAR = {
        teacher: '<g fill="none" stroke="#3e2c4a" stroke-width="2.2"><circle cx="41" cy="52" r="7.5"/><circle cx="59" cy="52" r="7.5"/><path d="M48.5 52 h3"/></g>' +
                 '<path d="M80 108 L97 66" stroke="#a26a3e" stroke-width="4" stroke-linecap="round"/><circle cx="97" cy="66" r="3.5" fill="#ff5f7e"/>',
        fire:    '<rect x="27" y="96" width="46" height="5" fill="#ffd84a"/>' +
                 '<path d="M20 44 C 22 14, 78 14, 80 44 Z" fill="#e8434f"/><rect x="14" y="40" width="72" height="8" rx="4" fill="#b52a35"/>' +
                 '<path d="M44 20 h12 v14 h-12 z" fill="#ffd84a"/>',
        swim:    '<g opacity=".88"><rect x="33" y="46" width="15" height="11" rx="5" fill="#8fe3ff" stroke="#1fa2e0" stroke-width="2.5"/>' +
                 '<rect x="52" y="46" width="15" height="11" rx="5" fill="#8fe3ff" stroke="#1fa2e0" stroke-width="2.5"/></g>' +
                 '<path d="M24 51 h9 M67 51 h9 M48 51 h4" stroke="#1fa2e0" stroke-width="2.5"/>' +
                 '<ellipse cx="50" cy="104" rx="38" ry="12" fill="none" stroke="#ff5f7e" stroke-width="11"/>' +
                 '<ellipse cx="50" cy="104" rx="38" ry="12" fill="none" stroke="#fff" stroke-width="11" stroke-dasharray="14 18"/>'
    };

    function dress(what) { return K.heroSVG(K.hero()).replace(/<\/svg>$/, (WEAR[what] || '') + '</svg>'); }

    function me(cls, what) { return div('who me ' + cls + ' is-idle', dress(what)); }

    /* חבר קופץ משמחה וחוזר לנשום */
    function face(c, mood, extra) { return K.creatureSVG(c, mood).replace(/<\/svg>$/, (extra || '') + '</svg>'); }

    function hop(w, c) {
        if (c) w.innerHTML = face(c, 'joy', w._extra);
        w.classList.remove('is-idle', 'is-hmm', 'is-enter');
        K.restart(w, 'is-happy');
        after(1800, function () {
            w.classList.remove('is-happy');
            w.classList.add('is-idle');
            if (c) w.innerHTML = face(c, null, w._extra);
        });
    }

    /* כל פינה חדשה מבטלת את הטיימרים של הקודמת באותו בניין */
    var SCENE = 0;
    function scene() { var my = ++SCENE; return function () { return my === SCENE; }; }

    function burst(el, colors, n) { var c = K.center(el); K.sparks(c.x, c.y, colors, n || 16); }

    var NUM_F = ['אֶפֶס', 'אַחַת', 'שְׁתַּיִם', 'שָׁלוֹשׁ', 'אַרְבַּע', 'חָמֵשׁ', 'שֵׁשׁ', 'שֶׁבַע', 'שְׁמוֹנֶה', 'תֵּשַׁע', 'עֶשֶׂר'];
    var NUM_M = ['אֶפֶס', 'אֶחָד', 'שְׁנַיִם', 'שְׁלוֹשָׁה', 'אַרְבָּעָה', 'חֲמִשָּׁה', 'שִׁשָּׁה', 'שִׁבְעָה', 'שְׁמוֹנָה', 'תִּשְׁעָה', 'עֲשָׂרָה'];

    /* שורת מעבר בין פינות של אותו בניין */
    function navRow(list, current) {
        var r = row('');
        r.classList.add('nav-row');
        list.forEach(function (it) {
            r.appendChild(pick('<span class="ico">' + it.e + '</span>', it.nik, function () { sfx.tap(); it.run(); }, it.id === current ? 'is-on mini' : 'mini'));
        });
        return r;
    }

    /* ============================================================== *
     * 🏫 בית הספר
     * ============================================================== */

    var ALEF = [
        ['א', 'אָלֶף', 'אַרְיֵה', '🦁'], ['ב', 'בֵּית', 'בָּנָנָה', '🍌'], ['ג', 'גִּימֶל', 'גָּמָל', '🐪'], ['ד', 'דָּלֶת', 'דָּג', '🐟'],
        ['ה', 'הֵא', 'הִיפּוֹפּוֹטָם', '🦛'], ['ו', 'וָו', 'וֶרֶד', '🌹'], ['ז', 'זַיִן', 'זֶבְּרָה', '🦓'], ['ח', 'חֵית', 'חָתוּל', '🐱'],
        ['ט', 'טֵית', 'טֶלֶפוֹן', '📞'], ['י', 'יוּד', 'יָד', '✋'], ['כ', 'כַּף', 'כֶּלֶב', '🐶'], ['ל', 'לָמֶד', 'לִימוֹן', '🍋'],
        ['מ', 'מֵם', 'מִטְרִיָּה', '☂️'], ['נ', 'נוּן', 'נָחָשׁ', '🐍'], ['ס', 'סָמֶךְ', 'סוּס', '🐴'], ['ע', 'עַיִן', 'עוּגָה', '🎂'],
        ['פ', 'פֵּא', 'פַּרְפַּר', '🦋'], ['צ', 'צָדִי', 'צָב', '🐢'], ['ק', 'קוֹף', 'קוֹף', '🐒'], ['ר', 'רֵישׁ', 'רַכֶּבֶת', '🚂'],
        ['ש', 'שִׁין', 'שֶׁמֶשׁ', '☀️'], ['ת', 'תָּו', 'תַּפּוּחַ', '🍎']
    ].map(function (a) { return { ch: a[0], name: a[1], word: a[2], e: a[3] }; });

    function letterOf(ch) { return ALEF.filter(function (l) { return l.ch === ch; })[0]; }

    var WORDS = [
        { w: 'אבא', nik: 'אַבָּא', e: '👨' }, { w: 'אמא', nik: 'אִמָּא', e: '👩' }, { w: 'דג', nik: 'דָּג', e: '🐟' },
        { w: 'אש', nik: 'אֵשׁ', e: '🔥' }, { w: 'עט', nik: 'עֵט', e: '🖊️' }, { w: 'בית', nik: 'בַּיִת', e: '🏠' },
        { w: 'סוס', nik: 'סוּס', e: '🐴' }, { w: 'כלב', nik: 'כֶּלֶב', e: '🐶' }, { w: 'תות', nik: 'תּוּת', e: '🍓' },
        { w: 'דוב', nik: 'דֹּב', e: '🐻' }, { w: 'שמש', nik: 'שֶׁמֶשׁ', e: '☀️' }, { w: 'פיל', nik: 'פִּיל', e: '🐘' },
        { w: 'גמל', nik: 'גָּמָל', e: '🐪' }, { w: 'ספר', nik: 'סֵפֶר', e: '📖' }, { w: 'חתול', nik: 'חָתוּל', e: '🐱' },
        { w: 'כדור', nik: 'כַּדּוּר', e: '⚽' }, { w: 'עוגה', nik: 'עוּגָה', e: '🎂' }
    ];

    var STICKERS = ['🦄', '🌈', '🚀', '🐬', '🦋', '🍩', '🌟', '🐙', '🎈', '🦖', '🍉', '🐝', '🌻', '🐼', '🦊', '🍭'];
    var SCHOOL_KEY = 'school.v1';

    /* האות הראשונה עם הניקוד שלה, צבועה */
    function markFirst(nik) {
        var m = nik.match(/^.[֑-ׇ]*/)[0];
        return '<span class="hl">' + m + '</span>' + nik.slice(m.length);
    }

    function school() {
        var st = load(SCHOOL_KEY, { stars: 0, stickers: [] });
        var level = Math.min(3, Math.floor(st.stickers.length / 2));
        var kids = K.friends(3);
        var mode = 'find', target = null, last = null, word = null, pos = 0, wrong = 0, busy = false;
        var buttons = [];

        stage('<div class="board" id="board"><div class="board-in" id="boardIn"></div><div class="chalk"></div></div>' +
              '<div class="stars" id="stars"></div><button type="button" class="notebook" id="nb" aria-label="המחברת">📒</button>');
        $('stage').classList.add('school-room');
        var teacher = me('teacher', 'teacher');
        var pupils = kids.map(function (c, i) {
            var w = walkIn(c, 'pupil p' + i);
            w.style.animationDelay = (i * .2) + 's';
            div('desk d' + i);
            w.addEventListener('click', function () { sfx.pop(); hop(w, c); K.say(K.plain(c.nik)); });
            return w;
        });
        $('nb').addEventListener('click', notebook);

        function stars() {
            var s = '';
            for (var i = 0; i < 5; i++) s += '<span class="' + (i < st.stars ? 'on' : '') + '">' + (i < st.stars ? '⭐' : '☆') + '</span>';
            $('stars').innerHTML = s;
        }

        function raise(i) {
            var h = div('hand', '🙋', pupils[i]);
            after(2400, function () { h.remove(); });
        }

        function lessons() {
            var r = row('');
            r.classList.add('nav-row');
            [['find', '🔤', 'מְצָאוּ אוֹת'], ['first', '🍎', 'אוֹת רִאשׁוֹנָה'], ['word', '✏️', 'כּוֹתְבִים מִלָּה']].forEach(function (L) {
                r.appendChild(pick('<span class="ico">' + L[1] + '</span>', L[2], function () {
                    if (busy) return;
                    sfx.tap(); mode = L[0]; ask();
                }, mode === L[0] ? 'is-on mini' : 'mini'));
            });
        }

        function letterBtn(ch, onClick) {
            var b = pick('<span class="letter">' + ch + '</span>', '', function () { onClick(b); }, 'card');
            b.setAttribute('aria-label', 'האות ' + K.plain(letterOf(ch) ? letterOf(ch).name : ch));
            b.dataset.ch = ch;
            return b;
        }

        function ask() {
            busy = false; wrong = 0;
            if (mode === 'word') return askWord();
            var pool = ALEF.slice(0, Math.min(ALEF.length, 8 + level * 5));
            target = K.pick(pool.filter(function (l) { return l !== last; }));
            last = target;
            var n = level ? 4 : 3;
            var opts = K.shuffle([target].concat(K.shuffle(pool.filter(function (l) { return l !== target; })).slice(0, n - 1)));
            var i = K.rand(0, 2);
            raise(i);
            var asker = K.plain(kids[i].nik) + ': ';

            if (mode === 'find') {
                $('boardIn').innerHTML = '<span class="q">?</span>';
                line(asker + 'אֵיפֹה הָאוֹת ' + target.name + '? 🙋');
            } else {
                $('boardIn').innerHTML = '<span class="pic">' + target.e + '</span><span class="word">' + target.word + '</span>';
                line(asker + 'בְּאֵיזוֹ אוֹת מַתְחִילָה הַמִּלָּה ' + target.word + '? 🙋');
            }
            K.restart($('boardIn'), 'is-new');

            tray();
            var r = row('');
            buttons = opts.map(function (o) {
                var b = letterBtn(o.ch, function (btn) { answer(o, btn); });
                r.appendChild(b);
                return b;
            });
            lessons();
        }

        async function answer(o, b) {
            if (busy) return;
            if (o !== target) {
                wrong++;
                sfx.oops();
                K.restart(b, 'is-no');
                pupils.forEach(function (p) { K.restart(p, 'is-hmm'); });
                line('זֹאת הָאוֹת ' + o.name + '. ' + (mode === 'find' ? 'אֵיפֹה הָאוֹת ' + target.name + '?' : 'שִׁמְעוּ טוֹב: ' + target.word));
                if (wrong >= 2) buttons.forEach(function (x) { if (x.dataset.ch === target.ch) x.classList.add('is-hint'); });
                return;
            }
            busy = true;
            b.classList.remove('is-hint');
            sfx.tap();
            K.restart(teacher, 'is-point');
            await K.fly('<span class="fly-letter">' + o.ch + '</span>', K.center(b), K.center($('board')), { arc: 60 });
            $('boardIn').innerHTML = '<span class="big-letter">' + target.ch + '</span><span class="pic">' + target.e + '</span>' +
                '<span class="word">' + markFirst(target.word) + '</span>';
            K.restart($('boardIn'), 'is-new');
            sfx.good();
            burst($('board'), ['#fff', '#ffd84a', '#9ff0c8']);
            pupils.forEach(function (p, i) { after(i * 120, function () { hop(p, kids[i]); }); });
            line('נָכוֹן! ' + target.ch + ' — כְּמוֹ ' + target.word + ' ' + target.e);
            star(function () { after(2300, ask); });
        }

        function askWord() {
            var pool = WORDS.filter(function (w) { return (level ? w.w.length <= 4 : w.w.length <= 3) && w !== word; });
            word = K.pick(pool);
            pos = 0;
            var slots = word.w.split('').map(function () { return '<span class="slot"></span>'; }).join('');
            $('boardIn').innerHTML = '<span class="pic">' + word.e + '</span><span class="slots" id="slots">' + slots + '</span>';
            K.restart($('boardIn'), 'is-new');
            raise(K.rand(0, 2));
            line('בּוֹאוּ נִכְתֹּב: ' + word.nik + ' ' + word.e + ' — מַתְחִילִים מִימִין');

            var extra = K.shuffle(ALEF.filter(function (l) { return word.w.indexOf(l.ch) === -1; })).slice(0, level ? 2 : 1);
            var letters = K.shuffle(word.w.split('').concat(extra.map(function (l) { return l.ch; })));
            tray();
            var r = row('');
            buttons = letters.map(function (ch) {
                var b = letterBtn(ch, function (btn) { place(ch, btn); });
                r.appendChild(b);
                return b;
            });
            lessons();
        }

        async function place(ch, b) {
            if (busy || b.classList.contains('is-used')) return;
            var want = word.w[pos];
            if (ch !== want) {
                wrong++;
                sfx.oops();
                K.restart(b, 'is-no');
                var L = letterOf(want);
                line(wrong >= 2 ? 'הָאוֹת הַבָּאָה הִיא ' + (L ? L.name : want) + ' ✨' : 'עוֹד לֹא... אֵיזוֹ אוֹת בָּאָה עַכְשָׁו?');
                if (wrong >= 2) {
                    var h = buttons.filter(function (x) { return x.dataset.ch === want && !x.classList.contains('is-used'); })[0];
                    if (h) h.classList.add('is-hint');
                }
                return;
            }
            busy = true;
            wrong = 0;
            sfx.tap();
            b.classList.remove('is-hint');
            b.classList.add('is-used');
            var slot = $('slots').children[pos];
            await K.fly('<span class="fly-letter">' + ch + '</span>', K.center(b), K.center(slot), { arc: 50, duration: 480 });
            slot.textContent = ch;
            K.restart(slot, 'is-on');
            sfx.pop();
            pos++;
            if (pos < word.w.length) { busy = false; return; }

            await K.later(300);
            $('boardIn').innerHTML = '<span class="pic">' + word.e + '</span><span class="word big">' + word.nik + '</span>';
            K.restart($('boardIn'), 'is-new');
            sfx.good();
            burst($('board'), ['#fff', '#ffd84a', '#ff8fb8'], 22);
            pupils.forEach(function (p, i) { after(i * 120, function () { hop(p, kids[i]); }); });
            line('כְּתַבְתֶּם ' + word.nik + '! ' + word.e + ' כׇּל הַכָּבוֹד!');
            star(function () { after(2400, ask); });
        }

        function star(then) {
            st.stars++;
            stars();
            K.restart($('stars').children[st.stars - 1], 'is-pop');
            if (st.stars < 5) { save(SCHOOL_KEY, st); then(); return; }

            st.stars = 0;
            var fresh = STICKERS.filter(function (s) { return st.stickers.indexOf(s) === -1; });
            var s = K.pick(fresh.length ? fresh : STICKERS);
            if (fresh.length) st.stickers.push(s);
            save(SCHOOL_KEY, st);
            level = Math.min(3, Math.floor(st.stickers.length / 2));

            after(1200, function () {
                var big = div('sticker-big', s);
                sfx.magic();
                line('חָמֵשׁ כּוֹכָבִים! מַדְבֵּקָה חֲדָשָׁה לַמַּחְבֶּרֶת ' + s);
                after(1600, function () {
                    K.fly(s, K.center(big), K.center($('nb')), { spin: 180, duration: 800 }).then(function () {
                        K.restart($('nb'), 'is-pop');
                        stars();
                        payShell($('nb'), 2);
                    });
                    big.remove();
                    after(1200, then);
                });
            });
        }

        function notebook() {
            if (busy || document.querySelector('.nb-page')) return;
            sfx.whoosh();
            var page = div('nb-page');
            page.innerHTML = '<h3>📒 הַמַּחְבֶּרֶת שֶׁלִּי</h3><div class="nb-grid">' + STICKERS.map(function (s, i) {
                var has = st.stickers.indexOf(s) !== -1;
                return '<span class="' + (has ? 'has' : '') + '" style="animation-delay:' + (i * .04) + 's">' + (has ? s : '❔') + '</span>';
            }).join('') + '</div><p>' + st.stickers.length + ' / ' + STICKERS.length + '</p>';
            var x = document.createElement('button');
            x.type = 'button';
            x.className = 'nb-close';
            x.textContent = '✖';
            x.setAttribute('aria-label', 'סגירה');
            x.addEventListener('click', function () { sfx.tap(); page.remove(); });
            page.appendChild(x);
            K.say(st.stickers.length ? 'יש במחברת ' + st.stickers.length + ' מדבקות' : 'המחברת עוד ריקה. כל חמישה כוכבים זה מדבקה');
        }

        stars();
        after(1300, ask);
        line('בָּרוּכִים הַבָּאִים לַכִּתָּה! 🏫');
        tray();
        lessons();
    }

    /* ============================================================== *
     * 🚒 הכבאים
     * ============================================================== */

    var FLAME = '<svg viewBox="0 0 60 80">' +
        '<path d="M30 3 C 44 22, 57 34, 55 54 C 53 70, 41 78, 30 78 C 18 78, 5 70, 5 54 C 5 40, 15 33, 18 20 C 22 29, 26 29, 30 3 Z" fill="#ff7a2f"/>' +
        '<path d="M30 28 C 38 40, 45 50, 43 62 C 41 73, 19 73, 17 62 C 15 52, 23 45, 30 28 Z" fill="#ffd84a"/>' +
        '<circle cx="24" cy="57" r="3.2" fill="#3e2c4a"/><circle cx="36" cy="57" r="3.2" fill="#3e2c4a"/>' +
        '<path d="M25 65 q5 5 10 0" stroke="#3e2c4a" stroke-width="2.4" fill="none" stroke-linecap="round"/></svg>';

    function houseSVG(wall, roof) {
        return '<svg viewBox="0 0 120 130" preserveAspectRatio="none">' +
            '<rect x="12" y="50" width="96" height="80" fill="' + wall + '"/>' +
            '<path d="M2 56 L60 6 L118 56 Z" fill="' + roof + '"/>' +
            '<rect x="24" y="66" width="28" height="24" rx="4" fill="#bfe9ff" stroke="#fff" stroke-width="4"/>' +
            '<rect x="70" y="84" width="26" height="46" rx="4" fill="#a26a3e"/></svg>';
    }

    var TREE = '<svg viewBox="0 0 140 220" preserveAspectRatio="none"><rect x="60" y="100" width="22" height="120" rx="8" fill="#a26a3e"/>' +
        '<path d="M72 120 L110 86" stroke="#a26a3e" stroke-width="10" stroke-linecap="round"/>' +
        '<circle cx="70" cy="70" r="56" fill="#6fbf4f"/><circle cx="36" cy="96" r="32" fill="#7cc25c"/><circle cx="106" cy="92" r="32" fill="#7cc25c"/></svg>';

    var TRUCK = '<svg viewBox="0 0 220 120">' +
        '<rect x="10" y="40" width="150" height="56" rx="10" fill="#e8434f"/>' +
        '<path d="M160 50 h30 l20 24 v22 h-50 z" fill="#e8434f"/><path d="M166 56 h22 l14 18 h-36 z" fill="#bfe9ff"/>' +
        '<rect x="20" y="26" width="130" height="8" rx="3" fill="#cfd8ea"/>' +
        '<path d="M26 26 v8 M42 26 v8 M58 26 v8 M74 26 v8 M90 26 v8 M106 26 v8 M122 26 v8 M138 26 v8" stroke="#8a94ad" stroke-width="3"/>' +
        '<rect x="20" y="60" width="130" height="6" fill="#fff"/>' +
        '<g class="lights"><rect x="164" y="36" width="14" height="12" rx="4" fill="#4ea9ff"/><rect x="182" y="36" width="14" height="12" rx="4" fill="#ff5f5f"/></g>' +
        '<circle cx="50" cy="98" r="16" fill="#3e2c4a"/><circle cx="50" cy="98" r="7" fill="#cfd8ea"/>' +
        '<circle cx="176" cy="98" r="16" fill="#3e2c4a"/><circle cx="176" cy="98" r="7" fill="#cfd8ea"/>' +
        '<circle cx="12" cy="70" r="8" fill="#ffd84a"/></svg>';

    var CAT = '<svg viewBox="0 0 60 56" class="cat-svg"><path d="M44 44 q16 -4 12 -20" stroke="#f29b3a" stroke-width="6" fill="none" stroke-linecap="round"/>' +
        '<ellipse cx="28" cy="42" rx="18" ry="13" fill="#ffb14e"/>' +
        '<path d="M10 22 L12 2 L24 12 Z M46 22 L44 2 L32 12 Z" fill="#ffb14e"/><path d="M14 16 L15 7 L21 12 Z M42 16 L41 7 L35 12 Z" fill="#ff8fa3"/>' +
        '<circle cx="28" cy="24" r="17" fill="#ffb14e"/><path d="M20 10 q8 4 16 0" stroke="#e0801f" stroke-width="3" fill="none"/>' +
        '<circle cx="21" cy="23" r="3.6" fill="#1f2a52"/><circle cx="35" cy="23" r="3.6" fill="#1f2a52"/><circle cx="20" cy="22" r="1.2" fill="#fff"/><circle cx="34" cy="22" r="1.2" fill="#fff"/>' +
        '<path d="M26 29 h4 l-2 2.5 z" fill="#ff5f7e"/><path d="M24 33 q4 3 8 0" stroke="#1f2a52" stroke-width="1.8" fill="none"/>' +
        '<path d="M4 26 h10 M4 31 h10 M42 26 h10 M42 31 h10" stroke="#e0801f" stroke-width="1.5"/></svg>';

    /* מקומות אפשריים לאש, באחוזים מהבמה */
    var SPOTS = [[37, 30], [37, 52], [57, 30], [57, 52], [88, 78]];

    function fire() {
        var round = 0, busy = false, flames = [], out = 0, live = scene();

        function build() {
            stage('<div class="house h0">' + houseSVG('#ffe1c7', '#ff8fb8') + '</div>' +
                  '<div class="house h1">' + houseSVG('#d9f1ff', '#4ea9ff') + '</div>' +
                  '<div class="tree">' + TREE + '</div>' +
                  '<div class="cat" id="cat">' + CAT + '</div>' +
                  '<div class="truck is-drive" id="truck">' + TRUCK + '<span class="nozzle" id="nozzle"></span></div>' +
                  '<svg class="hose" id="hose"><path id="jet" pathLength="1000" d=""/></svg>');
            $('stage').classList.add('fire-street');
        }

        function siren() {
            [0, .35, .7, 1.05].forEach(function (t, i) { K.tone(i % 2 ? 740 : 988, t, .32, 'square', .04); });
            K.restart($('truck'), 'is-flash');
        }

        function start() {
            busy = false; out = 0; flames = [];
            build();
            siren();
            var n = Math.min(2 + round, 5);
            K.shuffle(SPOTS).slice(0, n).forEach(function (s, i) {
                var f = div('flame', FLAME);
                f.style.left = s[0] + '%';
                f.style.top = s[1] + '%';
                f.style.animationDelay = (-i * .3) + 's';
                f._hp = 3;
                f.addEventListener('click', function () { spray(f); });
                flames.push(f);
            });
            after(900, function () {
                if (!live()) return;
                line('🚨 שְׂרֵפָה! לוֹחֲצִים עַל הָאֵשׁ כְּדֵי לְכַבּוֹת. יֵשׁ ' + NUM_F[n] + ' 🔥');
            });
            tray();
            var r = row('');
            r.appendChild(pick('<span class="ico">🚨</span>', 'סִירֵנָה', siren));
            r.appendChild(pick('<span class="ico">💦</span>', 'לְהַשְׁפְּרִיץ', function () {
                var f = flames.filter(function (x) { return x._hp > 0; })[0];
                if (f) spray(f); else if (!busy) splashAt(K.rand(30, 70), 20);
            }));
        }

        /* זרם מים מהצינור של המשאית אל נקודה */
        function jet(to, done) {
            var box = $('stage').getBoundingClientRect();
            var from = K.center($('nozzle'));
            var hose = $('hose');
            hose.setAttribute('viewBox', '0 0 ' + box.width + ' ' + box.height);
            var x0 = from.x - box.left, y0 = from.y - box.top, x1 = to.x - box.left, y1 = to.y - box.top;
            var cx = (x0 + x1) / 2, cy = Math.min(y0, y1) - 60;
            $('jet').setAttribute('d', 'M' + x0 + ' ' + y0 + ' Q' + cx + ' ' + cy + ' ' + x1 + ' ' + y1);
            K.restart(hose, 'is-on');
            sfx.water();
            after(380, function () {
                K.sparks(to.x, to.y, ['#6fd0ff', '#bfe9ff', '#fff'], 14);
                done && done();
            });
        }

        function splashAt(px, py) {
            var box = $('stage').getBoundingClientRect();
            jet({ x: box.left + box.width * px / 100, y: box.top + box.height * py / 100 });
        }

        function spray(f) {
            if (f._hp <= 0 || f._busy) return;
            f._busy = true;
            jet(K.center(f), function () {
                f._busy = false;
                f._hp--;
                f.style.setProperty('--s', (.35 + f._hp * .22).toFixed(2));
                K.restart(f, 'is-wet');
                if (f._hp > 0) return;
                f.classList.add('is-out');
                var c = K.center(f);
                K.float(c.x, c.y, ['💨', '☁️'], 4);
                sfx.magic();
                out++;
                var left = flames.length - out;
                after(700, function () { f.remove(); });
                if (left > 0) { line('כָּבְתָה! 💧 נִשְׁאֲרוּ עוֹד ' + NUM_F[left]); return; }
                after(900, catTime);
            });
        }

        function catTime() {
            line('כׇּל הָאֵשׁ כָּבְתָה! 🎉 אֲבָל... מִי שָׁם עַל הָעֵץ?');
            sfx.good();
            after(2000, function () {
                var cat = $('cat');
                cat.classList.add('is-scared');
                var b = div('meow', 'מְיָאוּ!', cat);
                [880, 660].forEach(function (f, i) { K.tone(f, i * .18, .22, 'triangle', .08); });
                after(1500, function () { b.remove(); });
                line('חָתוּל תָּקוּעַ עַל הָעֵץ! לוֹחֲצִים עַל הַסֻּלָּם 🪜');
                tray();
                var r = row('');
                var lb = pick('<span class="ico">🪜</span>', 'סֻלָּם', rescue, 'is-hint');
                r.appendChild(lb);
            });
        }

        async function rescue() {
            if (busy) return;
            busy = true;
            tray();
            sfx.whoosh();
            var lad = div('ladder');
            await K.later(50);
            lad.classList.add('is-up');
            await K.later(900);

            var ff = me('fighter', 'fire');
            var steps = [{ left: '14%', bottom: '10%' }, { left: '84%', bottom: '10%' }, { left: '84%', bottom: '36%' }];
            await ff.animate(steps.slice(0, 2), { duration: 1100, easing: 'ease-in-out', fill: 'forwards' }).finished;
            ff.classList.add('is-climb');
            await ff.animate(steps.slice(1), { duration: 1200, easing: 'ease-in-out', fill: 'forwards' }).finished;

            var cat = $('cat');
            cat.classList.remove('is-scared');
            var c0 = K.center(cat), c1 = K.center(ff);
            cat.style.visibility = 'hidden';
            await K.fly('<span class="fly-cat">' + CAT + '</span>', c0, { x: c1.x, y: c1.y + 10 }, { arc: 40, duration: 500 });
            cat.remove();
            var held = div('held', CAT, ff);
            sfx.pop();
            await ff.animate([steps[2], steps[1]], { duration: 1200, easing: 'ease-in-out', fill: 'forwards' }).finished;
            ff.classList.remove('is-climb');
            lad.classList.remove('is-up');

            var c = K.center(ff);
            K.float(c.x, c.y - 30, ['💖', '💕', '✨'], 8);
            [660, 880, 1100].forEach(function (f, i) { K.tone(f, i * .12, .2, 'triangle', .08); });
            held.classList.add('is-purr');
            line('הִצַּלְתֶּם אֶת הֶחָתוּל! 💖 גִּבּוֹרֵי הָעִיר!');
            payShell(ff, 2);
            round++;
            after(1400, function () {
                tray();
                var r = row('');
                r.appendChild(bigBtn('🚨 קְרִיאָה חֲדָשָׁה', function () { sfx.tap(); start(); }));
                busy = false;
            });
        }

        start();
    }

    /* ============================================================== *
     * 🎡 לונה פארק
     * ============================================================== */

    var LUNA_KEY = 'luna.v1';
    var PRIZES = [['🧸', 'דֻּבִּי'], ['🦄', 'חַד־קֶרֶן'], ['🐰', 'אַרְנָב'], ['🐶', 'כְּלַבְלַב'], ['🐼', 'פַּנְדָּה'], ['🦊', 'שׁוּעָל'],
                  ['🐸', 'צְפַרְדֵּעַ'], ['🐧', 'פִּינְגְּוִין'], ['🦁', 'אַרְיֵה'], ['🐨', 'קוֹאָלָה'], ['🐙', 'תְּמָנוּן'], ['🦖', 'דִּינוֹזָאוּר']];

    function tune(notes, step) {
        notes.forEach(function (f, i) { if (f) K.tone(f, i * step, step * .9, 'triangle', .07); });
        return notes.length * step * 1000;
    }
    var WALTZ = [523, 659, 784, 659, 523, 659, 784, 880, 784, 659, 587, 659, 523, 0, 392, 523];

    function luna() {
        var lp = load(LUNA_KEY, { prizes: [] });
        var ATTR = [
            { id: 'carousel', e: '🎠', nik: 'קָרוּסֶלָה', run: carousel },
            { id: 'wheel',    e: '🎡', nik: 'גַּלְגַּל עֲנָק', run: wheel },
            { id: 'cans',     e: '🥫', nik: 'פַּחִיּוֹת', run: cans },
            { id: 'balloons', e: '🎈', nik: 'בָּלוֹנִים', run: balloons }
        ];
        var music = null, alive = scene();
        function hush() { if (music) { clearInterval(music); music = null; } alive = scene(); }
        U.onLeave(hush);

        function shelf() {
            var l = document.createElement('p');
            l.className = 'row-label';
            l.textContent = 'הַפְּרָסִים שֶׁלִּי';
            $('tray').appendChild(l);
            var s = document.createElement('div');
            s.className = 'prize-shelf';
            s.innerHTML = lp.prizes.length ? lp.prizes.map(function (p) { return '<span>' + p + '</span>'; }).join('') : '<em>עוֹד אֵין — זוֹכִים בַּפַּחִיּוֹת וּבַבָּלוֹנִים</em>';
            $('tray').appendChild(s);
        }

        function hub() {
            hush();
            stage('<div class="fw mini-fw"><div class="fw-legs"></div><div class="fw-wheel spin-slow">' + wheelArt() + '</div></div>' +
                  '<div class="tent t1">🎪</div><div class="tent t2">🎠</div><div class="bunting"></div>');
            $('stage').classList.add('luna-hub');
            line('בְּרוּכִים הַבָּאִים לַלּוּנָה פַּארְק! לְאָן הוֹלְכִים? 🎡');
            tray();
            var r = row('');
            ATTR.forEach(function (a) { r.appendChild(pick('<span class="ico">' + a.e + '</span>', a.nik, function () { sfx.tap(); a.run(); })); });
            shelf();
        }

        function nav(current) {
            navRow([{ id: 'hub', e: '🎪', nik: 'לַכְּנִיסָה', run: hub }].concat(ATTR), current);
        }

        function prize(fromEl, then) {
            var p = K.pick(PRIZES);
            lp.prizes.push(p[0]);
            lp.prizes = lp.prizes.slice(-24);
            save(LUNA_KEY, lp);
            var card = div('prize-card', '<span class="p-e">' + p[0] + '</span><b>זְכִיתֶם בְּ' + p[1] + '!</b>');
            sfx.magic();
            burst(card, ['#ffd84a', '#ff8fb8', '#9ff0c8', '#8fd0ff'], 26);
            K.say('זכיתם ב' + K.plain(p[1]) + '!');
            payShell(fromEl || card, 1);
            var live = alive;
            after(2600, function () { card.classList.add('is-away'); after(500, function () { card.remove(); if (live() && then) then(); }); });
        }

        /* ---------------- 🎠 קרוסלה ---------------- */

        function carousel() {
            hush();
            var riders = [{ hero: true }].concat(K.friends(3));
            stage('<div class="canopy"></div><div class="c-pole"></div><div class="c-floor"></div>');
            $('stage').classList.add('carousel-scene');
            riders.forEach(function (c, i) {
                var r = div('rider');
                r.style.animationDelay = (-i * 2) + 's';
                var horse = ['#ff8fb8', '#8fd0ff', '#ffd84a', '#9ff0c8'][i];
                r.innerHTML = '<span class="r-pole"></span><span class="r-bob"><span class="r-who">' + (c.hero ? dress() : K.creatureSVG(c, 'joy')) + '</span>' +
                    '<svg class="horse" viewBox="0 0 100 70"><path d="M14 30 q0 -14 22 -14 h30 q10 -14 22 -10 l4 14 q-8 2 -10 8 v14 q0 10 -10 10 h-40 q-18 0 -18 -12 z" fill="' + horse + '"/>' +
                    '<path d="M22 48 l-6 20 M40 50 l0 18 M62 50 l4 18 M74 46 l8 20" stroke="' + horse + '" stroke-width="6" stroke-linecap="round"/>' +
                    '<circle cx="84" cy="14" r="3" fill="#3e2c4a"/><path d="M70 6 q-6 8 0 14" stroke="#fff" stroke-width="4" fill="none"/></svg></span>';
                r.addEventListener('click', function () { sfx.pop(); K.restart(r.querySelector('.r-who'), 'is-wave'); });
            });
            line('עוֹלִים עַל הַסּוּסִים! לוֹחֲצִים ״מַתְחִילִים״ 🎠');
            tray();
            var go = bigBtn('🎵 מַתְחִילִים!', spin);
            row('').appendChild(go);
            nav('carousel');

            function spin() {
                if (music) return;
                $('stage').classList.add('is-spin');
                sfx.good();
                var len = tune(WALTZ, .26);
                music = every(len, function () { tune(WALTZ, .26); });
                line('וּוּוּ! מִסְתּוֹבְבִים! 🎶');
                var live = alive;
                after(len * 2, function () {
                    if (!live()) return;
                    hush();
                    $('stage').classList.remove('is-spin');
                    line('אֵיזֶה כֵּיף! עוֹד סִבּוּב? 🎠');
                    burst($('stage'), null, 20);
                });
            }
        }

        /* ---------------- 🎡 גלגל ענק ---------------- */

        function wheelArt() {
            var s = '<svg viewBox="0 0 200 200" class="fw-frame"><circle cx="100" cy="100" r="84" stroke="#ff8fb8" stroke-width="7" fill="none"/>' +
                    '<circle cx="100" cy="100" r="60" stroke="#ffd84a" stroke-width="3" fill="none" stroke-dasharray="6 6"/>';
            for (var i = 0; i < 6; i++) {
                var a = i * Math.PI / 3 + Math.PI / 2;
                s += '<path d="M100 100 L' + (100 + Math.cos(a) * 84).toFixed(1) + ' ' + (100 + Math.sin(a) * 84).toFixed(1) + '" stroke="#ffd84a" stroke-width="4"/>';
                s += '<circle cx="' + (100 + Math.cos(a + Math.PI / 6) * 84).toFixed(1) + '" cy="' + (100 + Math.sin(a + Math.PI / 6) * 84).toFixed(1) + '" r="4" fill="#fff"/>';
            }
            return s + '<circle cx="100" cy="100" r="12" fill="#a97bff"/></svg>';
        }

        function wheel() {
            hush();
            var busyW = false;
            var riders = [{ hero: true }].concat(K.friends(5));
            stage('<div class="fw"><div class="fw-legs"></div><div class="fw-wheel" id="wheel">' + wheelArt() + '</div></div>');
            $('stage').classList.add('wheel-scene');
            var w = $('wheel');
            var cabs = riders.map(function (c, i) {
                var a = i * Math.PI / 3 + Math.PI / 2;
                var cab = div('cab', '<span class="cab-box" style="--c:' + ['#ff5f7e', '#4ea9ff', '#6fd6b0', '#a97bff', '#ffb03d', '#ff8fb8'][i] + '">' +
                    (c.hero ? dress() : K.creatureSVG(c, 'joy')) + '</span>', w);
                cab.style.left = (50 + Math.cos(a) * 42) + '%';
                cab.style.top = (50 + Math.sin(a) * 42) + '%';
                return cab;
            });
            line('נִכְנָסִים לַתָּא הַתַּחְתּוֹן וְעוֹלִים לְמַעְלָה! 🎡');
            tray();
            row('').appendChild(bigBtn('🎡 לְהִסְתּוֹבֵב!', go));
            nav('wheel');

            async function go() {
                if (busyW) return;
                busyW = true;
                sfx.whoosh();
                var len = tune(WALTZ, .3);
                var D = 9000;
                var opts = { duration: D, easing: 'ease-in-out' };
                var anims = [w.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], opts)];
                cabs.forEach(function (c) { anims.push(c.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(-360deg)' }], opts)); });
                var live = alive;
                after(len, function () { if (live()) tune(WALTZ, .3); });
                after(D * .45, function () {
                    if (!live()) return;
                    line('הַכִּי לְמַעְלָה! רוֹאִים אֶת כׇּל הָעִיר! 🌟');
                    sfx.magic();
                    var box = $('stage').getBoundingClientRect();
                    [0, 350, 700, 1050].forEach(function (t, i) {
                        after(t, function () {
                            K.sparks(box.left + box.width * (.2 + i * .2), box.top + box.height * (.15 + (i % 2) * .1), ['#ffd84a', '#ff5f7e', '#8fd0ff', '#fff'], 22);
                            K.tone(300 + i * 120, 0, .3, 'sawtooth', .03);
                        });
                    });
                });
                await anims[0].finished;
                if (!live()) return;
                line('אֵיזֶה סִבּוּב! עוֹד פַּעַם? 🎡');
                busyW = false;
            }
        }

        /* ---------------- 🥫 פחיות ---------------- */

        function cans() {
            hush();
            /* מי נשען על מי: 3 על 0 ו-1, 4 על 1 ו-2, 5 על 3 ו-4 */
            var ON = { 3: [0, 1], 4: [1, 2], 5: [3, 4] };
            var POS = [[0, 0], [33.33, 0], [66.67, 0], [16.67, 33.33], [50, 33.33], [33.33, 66.67]];
            var COL = ['#ff5f7e', '#4ea9ff', '#ffd84a', '#6fd6b0', '#a97bff', '#ffb03d'];
            var down = [], throws = 0, busyC = false;

            stage('<div class="booth"></div><div class="plank"></div><div class="cans" id="cans"></div><div class="ball-bin">⚾</div>');
            $('stage').classList.add('cans-scene');
            var box = $('cans');
            var els = POS.map(function (p, i) {
                var c = document.createElement('button');
                c.type = 'button';
                c.className = 'tin';
                c.setAttribute('aria-label', 'פחית');
                c.style.left = p[0] + '%';
                c.style.bottom = p[1] + '%';
                c.innerHTML = '<svg viewBox="0 0 40 52"><rect x="3" y="4" width="34" height="46" rx="6" fill="' + COL[i] + '"/>' +
                    '<rect x="3" y="4" width="34" height="8" rx="4" fill="#cfd8ea"/><rect x="3" y="42" width="34" height="8" rx="4" fill="#cfd8ea"/>' +
                    '<circle cx="20" cy="27" r="7" fill="#fff" opacity=".8"/></svg>';
                c.addEventListener('click', function () { throwAt(i); });
                box.appendChild(c);
                return c;
            });
            line('זוֹרְקִים כַּדּוּר! לוֹחֲצִים עַל פַּחִית 🥫 — אִם מַפִּילִים אֶת הַתַּחְתּוֹנוֹת, גַּם הָעֶלְיוֹנוֹת נוֹפְלוֹת!');
            tray();
            nav('cans');

            async function throwAt(i) {
                if (busyC || down[i]) return;
                busyC = true;
                throws++;
                sfx.whoosh();
                var sb = $('stage').getBoundingClientRect();
                await K.fly('⚾', { x: sb.left + sb.width / 2, y: sb.bottom - 20 }, K.center(els[i]), { arc: 80, duration: 460, spin: 360 });
                knock(i, 0);
                busyC = false;
                if (down.filter(Boolean).length === 6) {
                    var live = alive;
                    after(1100, function () {
                        if (!live()) return;
                        line(throws <= 2 ? 'וָואוּ! הִפַּלְתֶּם הַכֹּל בְּ' + (throws === 1 ? 'זְרִיקָה אַחַת' : 'שְׁתֵּי זְרִיקוֹת') + '! 🏆' : 'הַכֹּל נָפַל! 🎉');
                        prize(null, function () {
                            tray();
                            row('').appendChild(bigBtn('🥫 עוֹד סִבּוּב', function () { sfx.tap(); cans(); }));
                            nav('cans');
                        });
                    });
                }
            }

            function knock(i, delay) {
                if (down[i]) return;
                down[i] = true;
                after(delay, function () {
                    K.tone(300 + i * 60, 0, .12, 'square', .06);
                    var dir = K.pick([-1, 1]);
                    els[i].animate([
                        { transform: 'translate(0,0) rotate(0)' },
                        { transform: 'translate(' + dir * 30 + '%, -40%) rotate(' + dir * 40 + 'deg)', offset: .3 },
                        { transform: 'translate(' + dir * 90 + '%, 260%) rotate(' + dir * 200 + 'deg)', opacity: 0 }
                    ], { duration: 900, easing: 'ease-in', fill: 'forwards' });
                    els[i].disabled = true;
                    Object.keys(ON).forEach(function (j) { if (ON[j].indexOf(i) !== -1) knock(+j, 140); });
                });
            }
        }

        /* ---------------- 🎈 בלונים ---------------- */

        var COLORS = [
            { nik: 'אֲדֻמִּים', one: 'אָדֹם', c: '#ff4d6d' }, { nik: 'כְּחֻלִּים', one: 'כָּחֹל', c: '#4ea9ff' },
            { nik: 'צְהֻבִּים', one: 'צָהֹב', c: '#ffd23d' }, { nik: 'יְרֻקִּים', one: 'יָרֹק', c: '#4fc978' },
            { nik: 'סְגֻלִּים', one: 'סָגֹל', c: '#a97bff' }
        ];

        function balloons() {
            hush();
            var want = K.pick(COLORS), got = 0, GOAL = 5, done = false, live = alive;
            stage('<div class="b-count" id="bCount"></div>');
            $('stage').classList.add('balloon-scene');
            function count() {
                $('bCount').innerHTML = '<span class="dot" style="--c:' + want.c + '"></span> ' + got + ' / ' + GOAL;
            }
            count();
            line('מְפוֹצְצִים רַק בָּלוֹנִים ' + want.nik + '! 🎈');
            tray();
            nav('balloons');

            function spawn() {
                if (done || !live()) return;
                var col = Math.random() < .42 ? want : K.pick(COLORS);
                var b = document.createElement('button');
                b.type = 'button';
                b.className = 'balloon';
                b.setAttribute('aria-label', 'בלון ' + K.plain(col.one));
                b.style.left = K.rand(4, 82) + '%';
                b.style.animationDuration = (6 + Math.random() * 2.5).toFixed(1) + 's, 1.6s';
                b.innerHTML = '<svg viewBox="0 0 60 110"><path d="M30 76 q-4 14 2 34" stroke="#999" stroke-width="2" fill="none"/>' +
                    '<ellipse cx="30" cy="36" rx="26" ry="32" fill="' + col.c + '"/><path d="M26 68 h8 l-4 8 z" fill="' + col.c + '"/>' +
                    '<ellipse cx="20" cy="22" rx="6" ry="10" fill="#fff" opacity=".45"/></svg>';
                b.addEventListener('animationend', function (e) { if (e.animationName === 'rise') b.remove(); });
                b.addEventListener('click', function () { tapB(b, col); });
                $('stage').appendChild(b);
            }

            function tapB(b, col) {
                if (done || b.classList.contains('is-pop')) return;
                if (col !== want) {
                    sfx.oops();
                    K.restart(b.querySelector('svg'), 'is-no');
                    line('זֶה בָּלוֹן ' + col.one + '. מְחַפְּשִׂים ' + want.nik + ' 🎈');
                    return;
                }
                b.style.bottom = getComputedStyle(b).bottom;
                b.classList.add('is-pop');
                sfx.pop();
                burst(b, [want.c, '#fff'], 14);
                after(250, function () { b.remove(); });
                got++;
                count();
                K.restart($('bCount'), 'is-pop');
                K.say(K.plain(NUM_M[got]));
                if (got < GOAL) return;
                done = true;
                after(700, function () {
                    if (!live()) return;
                    line('חֲמִשָּׁה בָּלוֹנִים ' + want.nik + '! 🎉');
                    prize($('bCount'), function () {
                        tray();
                        row('').appendChild(bigBtn('🎈 עוֹד סִבּוּב', function () { sfx.tap(); balloons(); }));
                        nav('balloons');
                    });
                });
            }

            spawn();
            every(850, spawn);
        }

        hub();
    }

    /* ============================================================== *
     * 🏊 בריכה וחוף
     * ============================================================== */

    var POOL_KEY = 'pool.v1';
    var SPLASH = '<svg viewBox="0 0 120 90"><path d="M8 90 Q18 36 34 64 Q44 14 60 54 Q76 14 86 64 Q102 36 112 90 Z" fill="#8fe3ff"/>' +
        '<path d="M26 90 Q36 60 48 74 Q60 40 72 74 Q84 60 94 90 Z" fill="#fff" opacity=".8"/>' +
        '<circle cx="22" cy="22" r="6" fill="#8fe3ff"/><circle cx="60" cy="8" r="7" fill="#8fe3ff"/><circle cx="98" cy="22" r="6" fill="#8fe3ff"/>' +
        '<circle cx="40" cy="30" r="4" fill="#bfe9ff"/><circle cx="80" cy="30" r="4" fill="#bfe9ff"/></svg>';
    var RING = '<ellipse cx="60" cy="94" rx="46" ry="13" fill="none" stroke="#ffd84a" stroke-width="12"/>' +
               '<ellipse cx="60" cy="94" rx="46" ry="13" fill="none" stroke="#ff5f7e" stroke-width="12" stroke-dasharray="16 16"/>';

    function pool() {
        var SPOTS_POOL = [
            { id: 'dive',   e: '🤸', nik: 'קְפִיצוֹת', run: dive },
            { id: 'castle', e: '🏰', nik: 'אַרְמוֹן חוֹל', run: castle },
            { id: 'shells', e: '🐚', nik: 'צְדָפִים', run: shellsHunt }
        ];
        function nav(cur) { navRow(SPOTS_POOL, cur); }

        /* ---------------- 🤸 קפיצות למים ---------------- */

        function dive() {
            var busy = false, live = scene();
            var friends = K.friends(3);
            stage('<div class="p-sun">☀️</div><div class="tower"></div><div class="plank-d"></div>' +
                  '<div class="water"><svg viewBox="0 0 200 20" preserveAspectRatio="none"><path d="M0 10 q10 -8 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 v10 h-200 z" fill="#8fe3ff"/></svg></div>');
            $('stage').classList.add('pool-scene');
            var swimmers = friends.map(function (c, i) {
                var w = div('who swimmer s' + i + ' is-idle', face(c, null, RING));
                w._extra = RING;
                w.addEventListener('click', function () { sfx.water(); hop(w, c); burst(w, ['#8fe3ff', '#fff'], 10); });
                return w;
            });
            var hero = me('diver', 'swim');
            line('עוֹמְדִים עַל הַקֶּרֶשׁ! אֵיךְ קוֹפְצִים? 🤸');
            tray();
            var r = row('');
            [['bomb', '💣', 'פְּצָצָה'], ['flip', '🌀', 'סַלְטָה'], ['arrow', '🏹', 'חֵץ']].forEach(function (J) {
                r.appendChild(pick('<span class="ico">' + J[1] + '</span>', J[2], function () { jump(J[0]); }));
            });
            nav('dive');

            async function jump(kind) {
                if (busy) return;
                busy = true;
                sfx.tap();
                var spin = kind === 'flip' ? 360 : kind === 'arrow' ? 160 : 0;
                var sc = kind === 'bomb' ? .8 : 1;
                hero.classList.remove('is-idle', 'is-swim');
                await hero.animate([
                    { left: '18%', bottom: '66%', transform: 'rotate(0) scale(1)' },
                    { left: '19%', bottom: '62%', transform: 'rotate(0) scale(1.05,.9)', offset: .15 },
                    { left: '26%', bottom: '88%', transform: 'rotate(' + spin / 2 + 'deg) scale(' + sc + ')', offset: .5 },
                    { left: '40%', bottom: '6%', transform: 'rotate(' + spin + 'deg) scale(' + sc + ')' }
                ], { duration: 1300, easing: 'ease-in', fill: 'forwards' }).finished;

                var big = kind === 'bomb';
                var sp = div('splash' + (big ? ' big' : ''), SPLASH);
                sp.style.left = '46%';
                var ring = div('ripple-ring');
                ring.style.left = '46%';
                after(1200, function () { sp.remove(); ring.remove(); });
                var box = $('stage').getBoundingClientRect();
                K.sparks(box.left + box.width * .46, box.top + box.height * .7, ['#8fe3ff', '#bfe9ff', '#fff'], big ? 40 : kind === 'flip' ? 24 : 10);
                sfx.water();
                if (big) after(120, sfx.water);
                swimmers.forEach(function (w, i) { after(300 + i * 150, function () { hop(w, friends[i]); }); });

                await K.later(500);
                if (!live()) return;
                hero.getAnimations().forEach(function (a) { a.cancel(); });
                hero.style.left = '40%';
                hero.style.bottom = '24%';
                hero.classList.add('is-swim');

                var say = { bomb: 'פְּצָצָה עֲנָקִית! 💦 כֻּלָּם רְטֻבִּים!', flip: 'סַלְטָה מֻשְׁלֶמֶת! 🌀', arrow: 'כְּמוֹ חֵץ! כִּמְעַט בְּלִי הַתָּזָה 🏹' }[kind];
                line(say);
                swimmers.forEach(function (w, i) {
                    var sc2 = div('score', String(kind === 'bomb' ? 10 : K.rand(8, 10)), w);
                    sc2.style.animationDelay = (i * .2) + 's';
                    after(2400, function () { sc2.remove(); });
                });
                await K.later(2600);
                if (!live()) return;

                await hero.animate([
                    { left: '40%', bottom: '24%' }, { left: '6%', bottom: '24%', offset: .45 },
                    { left: '6%', bottom: '66%', offset: .8 }, { left: '18%', bottom: '66%' }
                ], { duration: 2400, easing: 'ease-in-out', fill: 'forwards' }).finished;
                if (!live()) return;
                hero.getAnimations().forEach(function (a) { a.cancel(); });
                hero.style.left = '';
                hero.style.bottom = '';
                hero.classList.remove('is-swim');
                hero.classList.add('is-idle');
                line('עוֹד קְפִיצָה? 🤸');
                busy = false;
            }
        }

        /* ---------------- 🏰 ארמון חול ---------------- */

        var FLAGS = [{ nik: 'אָדֹם', c: '#ff4d6d' }, { nik: 'כָּחֹל', c: '#4ea9ff' }, { nik: 'צָהֹב', c: '#ffd23d' }];
        var TOWERS_N = { 1: 'מִגְדָּל אֶחָד', 2: 'שְׁנֵי מִגְדָּלִים', 3: 'שְׁלוֹשָׁה מִגְדָּלִים', 4: 'אַרְבָּעָה מִגְדָּלִים' };
        var TOWER = '<svg viewBox="0 0 60 80"><path d="M6 80 L10 18 h40 l4 62 z" fill="#f2c774"/>' +
            '<path d="M8 18 v-10 h10 v10 h8 v-10 h8 v10 h8 v-10 h10 v10 z" fill="#f2c774"/>' +
            '<path d="M14 40 h6 M34 56 h8 M22 66 h6" stroke="#d9a44c" stroke-width="3" stroke-linecap="round"/>' +
            '<rect x="24" y="30" width="12" height="16" rx="6" fill="#c98b3a"/></svg>';

        function castle() {
            var friend = K.friends(1)[0];
            var N = K.rand(2, 4), want = K.pick(FLAGS);
            var towers = [], flag = null, wrongT = 0, wrongF = 0, finished = false, live = scene();

            stage('<div class="sea"><svg viewBox="0 0 200 20" preserveAspectRatio="none"><path d="M0 10 q10 -8 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 v10 h-200 z" fill="#fff" opacity=".7"/></svg></div>' +
                  '<div class="p-sun">☀️</div><div class="mound-base" id="base"></div><div class="slots4" id="tw"></div>');
            $('stage').classList.add('beach-scene');
            var fr = walkIn(friend, 'orderer');
            div('bubble order-b', '🏰 × ' + N + '<br><svg viewBox="0 0 30 30" width="30"><path d="M6 28 V4" stroke="#7d4f2c" stroke-width="3"/><path d="M7 4 h18 l-5 6 l5 6 h-18 z" fill="' + want.c + '"/></svg>');

            after(1100, function () {
                if (!live()) return;
                line(K.plain(friend.nik) + ': אֲנִי רוֹצֶה אַרְמוֹן עִם ' + TOWERS_N[N] + ' וְדֶגֶל ' + want.nik + '!');
            });

            var slots = $('tw');
            for (var i = 0; i < 4; i++) div('t-slot', '', slots);

            tray();
            var r = row('');
            var tBtn = pick('<span class="ico">🪣</span>', 'מִגְדָּל', addTower);
            r.appendChild(tBtn);
            var fBtns = FLAGS.map(function (F) {
                var b = pick('<svg viewBox="0 0 30 30" width="42"><path d="M6 28 V4" stroke="#7d4f2c" stroke-width="3"/><path d="M7 4 h18 l-5 6 l5 6 h-18 z" fill="' + F.c + '"/></svg>', 'דֶּגֶל ' + F.nik, function () { setFlag(F, b); });
                r.appendChild(b);
                return b;
            });
            var r2 = row('');
            r2.appendChild(pick('<span class="ico">🐚</span>', 'קִשּׁוּט', decorate, 'mini'));
            r2.appendChild(pick('<span class="ico">🌊</span>', 'גַּל!', wave, 'mini'));
            nav('castle');

            async function addTower() {
                if (finished) return;
                if (towers.length >= 4) { sfx.oops(); line('אֵין עוֹד מָקוֹם. לוֹחֲצִים עַל מִגְדָּל כְּדֵי לְהוֹרִיד אוֹתוֹ'); return; }
                var slot = slots.children[towers.length];
                sfx.tap();
                await K.fly('🪣', K.center(tBtn), K.center(slot), { arc: 70, spin: 180, duration: 520 });
                var t = div('tower-s', TOWER, slot);
                towers.push(t);
                t.addEventListener('click', function () { removeTower(t); });
                var c = K.center(t);
                K.sparks(c.x, c.y + 20, ['#f2c774', '#d9a44c', '#fff3c4'], 12);
                K.tone(220, 0, .15, 'sine', .12);
                if (flag) placeFlag();
                check();
            }

            function removeTower(t) {
                if (finished) return;
                var i = towers.indexOf(t);
                if (i < 0) return;
                sfx.whoosh();
                t.classList.add('is-crumble');
                towers.splice(i, 1);
                after(500, function () {
                    t.remove();
                    /* מסדרים מחדש משמאל לימין */
                    towers.forEach(function (x, k) { slots.children[k].appendChild(x); });
                    if (flag) placeFlag();
                    check();
                });
            }

            function placeFlag() {
                var old = document.querySelector('.flag-on');
                if (old) old.remove();
                if (!towers.length || !flag) return;
                var tallest = towers[Math.floor((towers.length - 1) / 2)];
                div('flag-on', '<svg viewBox="0 0 30 30"><path d="M6 28 V4" stroke="#7d4f2c" stroke-width="3"/><path d="M7 4 h18 l-5 6 l5 6 h-18 z" fill="' + flag.c + '"/></svg>', tallest);
            }

            function setFlag(F, b) {
                if (finished) return;
                if (!towers.length) { sfx.oops(); line('קֹדֶם בּוֹנִים מִגְדָּל 🪣'); tBtn.classList.add('is-hint'); return; }
                tBtn.classList.remove('is-hint');
                flag = F;
                sfx.pop();
                placeFlag();
                if (F !== want) {
                    wrongF++;
                    line('דֶּגֶל ' + F.nik + ' יָפֶה! אֲבָל בִּקַּשְׁתִּי ' + want.nik);
                    if (wrongF >= 2) fBtns[FLAGS.indexOf(want)].classList.add('is-hint');
                    return;
                }
                fBtns.forEach(function (x) { x.classList.remove('is-hint'); });
                check(true);
            }

            function check(loud) {
                if (finished || !flag) return;
                if (towers.length === N && flag === want) return win();
                if (!loud && flag !== want) return;
                if (towers.length !== N) {
                    wrongT++;
                    line('סוֹפְרִים: יֵשׁ כָּאן ' + (TOWERS_N[towers.length] || 'אֶפֶס מִגְדָּלִים') + '. בִּקַּשְׁתִּי ' + TOWERS_N[N] + ' 🤔');
                    if (wrongT >= 2) tBtn.classList.toggle('is-hint', towers.length < N);
                }
            }

            function decorate() {
                if (!towers.length) { sfx.oops(); line('קֹדֶם בּוֹנִים מִגְדָּל 🪣'); return; }
                sfx.pop();
                var t = K.pick(towers);
                var d = div('deco', K.pick(['🐚', '⭐', '🦀', '🌸']), t);
                d.style.left = K.rand(10, 60) + '%';
                d.style.top = K.rand(40, 70) + '%';
            }

            function wave() {
                sfx.whoosh();
                var w = div('big-wave', '<svg viewBox="0 0 200 60" preserveAspectRatio="none"><path d="M0 30 q25 -30 50 0 t50 0 t50 0 t50 0 v30 h-200 z" fill="#4fc3f7"/><path d="M0 30 q25 -30 50 0 t50 0 t50 0 t50 0" stroke="#fff" stroke-width="5" fill="none"/></svg>');
                after(700, function () {
                    towers.forEach(function (t) { t.remove(); });
                    towers = [];
                    flag = null;
                    var old = document.querySelector('.flag-on');
                    if (old) old.remove();
                    if (finished && live()) castle();
                });
                after(1600, function () { w.remove(); });
                line('שְׁפְּלָאשׁ! 🌊 בּוֹנִים מֵחָדָשׁ');
            }

            function win() {
                finished = true;
                sfx.good();
                burst($('tw'), ['#ffd84a', '#f2c774', '#ff8fb8', '#fff'], 26);
                hop(fr, friend);
                var flash = div('photo-flash');
                after(600, function () { flash.remove(); });
                after(250, function () { K.tone(1400, 0, .08, 'square', .05); });
                line('בְּדִיּוּק מָה שֶׁבִּקַּשְׁתִּי! ' + TOWERS_N[N] + ' וְדֶגֶל ' + want.nik + ' 🏰✨');
                payShell($('tw'), 2);
                after(1800, function () {
                    if (!live()) return;
                    tray();
                    row('').appendChild(bigBtn('🏰 אַרְמוֹן חָדָשׁ', function () { sfx.tap(); castle(); }));
                    var r3 = row('');
                    r3.appendChild(pick('<span class="ico">🌊</span>', 'גַּל!', wave, 'mini'));
                    nav('castle');
                });
            }
        }

        /* ---------------- 🐚 חיפוש צדפים ---------------- */

        var GOLD = '<svg viewBox="0 0 60 50" class="gold"><path d="M30 46 L4 20 Q30 -8 56 20 Z" fill="#ffd23d" stroke="#e0a800" stroke-width="3"/>' +
                   '<path d="M30 46 L16 12 M30 46 L30 6 M30 46 L44 12" stroke="#e0a800" stroke-width="3"/><rect x="24" y="42" width="12" height="7" rx="3" fill="#e0a800"/></svg>';

        function shellsHunt() {
            var ps = load(POOL_KEY, { gold: 0 });
            var GOAL = 5, got = 0, done = false, live = scene();
            var loot = ['shell', 'shell', 'shell', 'shell', 'shell', 'crab', 'star', 'sand', 'sand'];
            if (Math.random() < .2) loot[K.rand(0, 4)] = 'gold';
            loot = K.shuffle(loot);

            stage('<div class="sea"></div><div class="s-count" id="sCount"></div><div class="dig" id="dig"></div>');
            $('stage').classList.add('beach-scene', 'dig-scene');
            function count() { $('sCount').textContent = '🐚 ' + got + ' / ' + GOAL; }
            count();
            loot.forEach(function (what) {
                var m = document.createElement('button');
                m.type = 'button';
                m.className = 'mound';
                m.setAttribute('aria-label', 'לחפור');
                m.addEventListener('click', function () { dig(m, what); });
                $('dig').appendChild(m);
            });
            line('חוֹפְרִים בַּחוֹל וּמְחַפְּשִׂים ' + NUM_M[GOAL] + ' צְדָפִים! 🐚' + (ps.gold ? ' (צְדָפִים זְהֻבִּים: ' + ps.gold + ')' : ''));
            tray();
            nav('shells');

            function dig(m, what) {
                if (done || m.classList.contains('is-dug')) return;
                m.classList.add('is-dug');
                var c = K.center(m);
                K.sparks(c.x, c.y, ['#f2c774', '#ffe3a3', '#d9a44c'], 12);
                K.tone(180, 0, .12, 'sawtooth', .04);
                var item = div('found', { shell: '🐚', crab: '🦀', star: '⭐', sand: '💨', gold: GOLD }[what], m);

                if (what === 'crab') { item.classList.add('is-run'); line('סַרְטָן! הוּא בּוֹרֵחַ הַצִּדָּה 🦀'); sfx.pop(); return; }
                if (what === 'star') { line('כּוֹכַב יָם! ⭐ יָפֶה, אֲבָל מְחַפְּשִׂים צְדָפִים'); sfx.pop(); return; }
                if (what === 'sand') { line('רַק חוֹל... מְנַסִּים בְּמָקוֹם אַחֵר'); return; }

                got++;
                if (what === 'gold') {
                    ps.gold++;
                    save(POOL_KEY, ps);
                    item.classList.add('is-gold');
                    sfx.magic();
                    K.float(c.x, c.y, ['✨', '🌟'], 8);
                    line('צֶדֶף זָהָב נָדִיר!!! ✨🐚 שָׁוֶה חֲמִשָּׁה צְדָפִים!');
                    payShell(m, 5);
                } else {
                    sfx.coin();
                    K.say(K.plain(NUM_M[got]));
                    payShell(m, 1);
                }
                count();
                K.restart($('sCount'), 'is-pop');
                if (got < GOAL) return;
                done = true;
                after(1000, function () {
                    if (!live()) return;
                    sfx.good();
                    line('מְצָאתֶם ' + NUM_M[GOAL] + ' צְדָפִים! 🎉');
                    burst($('sCount'), null, 22);
                    tray();
                    row('').appendChild(bigBtn('🏖️ חוֹף חָדָשׁ', function () { sfx.tap(); shellsHunt(); }));
                    nav('shells');
                });
            }
        }

        dive();
    }

    /* ============================================================== *
     * רישום
     * ============================================================== */

    var PL = window.Places.PLACES;
    PL.school = { emoji: '🏫', nik: 'בֵּית הַסֵּפֶר',        run: school };
    PL.fire   = { emoji: '🚒', nik: 'תַּחֲנַת הַכַּבָּאִים',   run: fire };
    PL.luna   = { emoji: '🎡', nik: 'הַלּוּנָה פַּארְק',      run: luna };
    PL.pool   = { emoji: '🏊', nik: 'הַבְּרֵכָה וְהַחוֹף',    run: pool };
})();

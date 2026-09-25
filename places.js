/* ------------------------------------------------------------------ *
 * בנייני העיר — שישה מקומות, כל אחד מודול קטן
 *
 * places.html#clinic, #salon, #garden, #music, #icecream, #studio.
 * הכללים של כל המשחקים חלים גם כאן: אין הפסד, אין שעון שרודף,
 * כל הוראה מוקראת, וכל בחירה לא נכונה מקבלת רמז ולא עונש.
 * ------------------------------------------------------------------ */

(function () {
    'use strict';

    var K = window.Kit, $ = K.$, sfx = K.sfx;

    /* ============================================================== *
     * שלד משותף
     * ============================================================== */

    var cleanups = [];
    function onLeave(fn) { cleanups.push(fn); }
    function every(ms, fn) { var t = setInterval(fn, ms); onLeave(function () { clearInterval(t); }); return t; }
    function after(ms, fn) { var t = setTimeout(fn, ms); onLeave(function () { clearTimeout(t); }); return t; }

    function line(text, speak) {
        var el = $('line');
        el.textContent = text;
        K.restart(el, 'is-new');
        if (speak !== false) K.say(text);
    }

    function stage(html) { var s = $('stage'); s.className = 'stage'; s.innerHTML = html || ''; return s; }
    function tray() { var t = $('tray'); t.innerHTML = ''; return t; }

    function pick(inner, label, onClick, extra) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'pick' + (extra ? ' ' + extra : '');
        b.innerHTML = inner + (label ? '<span class="lbl">' + label + '</span>' : '');
        if (label) b.setAttribute('aria-label', K.plain(label));
        b.addEventListener('click', function () { onClick(b); });
        return b;
    }

    function bigBtn(html, onClick, soft) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'big' + (soft ? ' soft' : '');
        b.innerHTML = html;
        b.addEventListener('click', onClick);
        return b;
    }

    function row(label) {
        var r = document.createElement('div');
        r.className = 'row';
        if (label) {
            var l = document.createElement('p');
            l.className = 'row-label';
            l.textContent = label;
            $('tray').appendChild(l);
        }
        $('tray').appendChild(r);
        return r;
    }

    function shells() {
        var p = K.player();
        $('purse').textContent = p ? '🐚' + ((p.treasures && p.treasures['🐚']) || 0) : '';
    }

    function payShell(fromEl, n) {
        if (!K.player()) return;
        K.addTreasure('🐚', n || 1);
        var from = K.center(fromEl), to = K.center($('purse'));
        K.fly('🐚', from, to, { spin: 360, duration: 700 }).then(function () { sfx.coin(); shells(); });
    }

    /* חבר נכנס בהליכה ונעמד. מחזיר את האלמנט */
    function walkIn(c, cls, mood) {
        var el = document.createElement('div');
        el.className = 'who ' + cls + ' is-enter';
        el.innerHTML = K.creatureSVG(c, mood);
        $('stage').appendChild(el);
        after(1150, function () { el.classList.remove('is-enter'); el.classList.add('is-idle'); });
        return el;
    }

    function setMood(el, c, mood, cls) {
        el.innerHTML = K.creatureSVG(c, mood);
        if (cls) { el.classList.remove('is-idle', 'is-happy', 'is-hmm'); K.restart(el, cls); }
    }

    /* ============================================================== *
     * 🩺 מרפאה
     * ============================================================== */

    var TOOLS = {
        thermo:  { e: '🌡️', nik: 'מַדְחֹם' },
        ice:     { e: '🧊', nik: 'קֹמְפְּרֶס' },
        steth:   { e: '🩺', nik: 'לְהַקְשִׁיב' },
        syrup:   { e: '🥄', nik: 'סִירוֹפּ' },
        wash:    { e: '💧', nik: 'לִשְׁטֹף' },
        bandage: { e: '🩹', nik: 'פְּלַסְטֶר' }
    };

    var AILMENTS = [
        { id: 'fever',   intro: 'אֲנִי לֹא מַרְגִּישׁ טוֹב... חַם לִי',
          steps: [{ tool: 'thermo', ask: 'תִּמְדְּדוּ לִי חֹם?', done: 'יֵשׁ לִי חֹם! 38 מַעֲלוֹת...' },
                  { tool: 'ice',    ask: 'מַשֶּׁהוּ קַר לַמֵּצַח?', done: 'אָהּ... קָרִיר וְנָעִים' }] },
        { id: 'scratch', intro: 'נָפַלְתִּי וְשָׂרַטְתִּי אֶת הַבֶּרֶךְ',
          steps: [{ tool: 'wash',    ask: 'צָרִיךְ לִשְׁטֹף אֶת הַשְּׂרִיטָה', done: 'עַכְשָׁו זֶה נָקִי' },
                  { tool: 'bandage', ask: 'וְעַכְשָׁו פְּלַסְטֶר?',        done: 'אֵיזֶה פְּלַסְטֶר יָפֶה!' }] },
        { id: 'cough',   intro: 'אֲנִי מִשְׁתַּעֵל... אַחוּ! אַחוּ!',
          steps: [{ tool: 'steth', ask: 'תַּקְשִׁיבוּ לִי לַלֵּב?',          done: 'בּוּם-בּוּם, בּוּם-בּוּם' },
                  { tool: 'syrup', ask: 'וְעַכְשָׁו סִירוֹפּ נֶגֶד שִׁעוּל', done: 'מַמְמְ, זֶה טָעִים!' }] }
    ];

    function clinic() {
        var c = K.friends(1)[0];
        var ail = K.pick(AILMENTS);
        var step = 0, wrong = 0, busy = false;

        stage('<div class="cross"></div><div class="bed"></div>');
        var pat = walkIn(c, 'patient is-sick', 'sick');
        var box = $('stage');

        /* מה רואים על החולה */
        var marks = [];
        function mark(html, cls) {
            var m = document.createElement('div');
            m.className = 'ail ' + cls;
            m.innerHTML = html;
            pat.appendChild(m);
            marks.push(m);
            return m;
        }
        if (ail.id === 'fever') { mark('💦', 'sweat s1'); mark('💦', 'sweat s2'); }
        if (ail.id === 'scratch') {
            mark('<svg viewBox="0 0 40 20"><path d="M2 14 L10 4 L16 14 L24 4 L30 14 L38 6" stroke="#e8344e" stroke-width="4" fill="none" stroke-linecap="round"/></svg>', 'scratch');
        }
        if (ail.id === 'cough') { mark('💨', 'puff'); }

        after(1200, function () { line(K.plain(c.nik) + ': ' + ail.intro + '. ' + ail.steps[0].ask); });

        var t = tray();
        var buttons = {};
        K.shuffle(Object.keys(TOOLS)).forEach(function (id) {
            var b = pick('<span class="ico">' + TOOLS[id].e + '</span>', TOOLS[id].nik, function () { use(id, b); });
            buttons[id] = b;
            t.appendChild(b);
        });

        function spot(where) {
            var r = pat.getBoundingClientRect();
            var at = { head: [.5, .32], mouth: [.52, .62], chest: [.5, .74], knee: [.4, .84] }[where];
            return { x: r.left + r.width * at[0], y: r.top + r.height * at[1] };
        }

        async function use(id, btn) {
            if (busy) return;
            var want = ail.steps[step];
            if (id !== want.tool) {
                wrong++;
                sfx.oops();
                K.restart(btn, 'is-no');
                setMood(pat, c, 'sick', 'is-hmm');
                line('הִמְמְ... ' + want.ask);
                if (wrong >= 2) buttons[want.tool].classList.add('is-hint');
                return;
            }
            busy = true;
            wrong = 0;
            btn.classList.remove('is-hint');
            sfx.tap();

            var where = { thermo: 'mouth', ice: 'head', steth: 'chest', syrup: 'mouth', wash: 'knee', bandage: 'knee' }[id];
            var to = spot(where);
            await K.fly(TOOLS[id].e, K.center(btn), to, { spin: 20 });

            var pr = pat.getBoundingClientRect();
            var local = function (p) { return { left: (p.x - pr.left) / pr.width * 100 + '%', top: (p.y - pr.top) / pr.height * 100 + '%' }; };

            if (id === 'thermo') {
                var th = document.createElement('div');
                th.className = 'thermo';
                pat.appendChild(th);
                await K.later(1400);
                th.remove();
            } else if (id === 'ice' || id === 'bandage') {
                var pl = document.createElement('div');
                pl.className = 'placed';
                pl.textContent = TOOLS[id].e;
                var at = local(to);
                pl.style.left = 'calc(' + at.left + ' - 18px)';
                pl.style.top = 'calc(' + at.top + ' - 22px)';
                pat.appendChild(pl);
                sfx.pop();
                if (id === 'ice') marks.forEach(function (m) { if (m.classList.contains('sweat')) m.remove(); });
                if (id === 'bandage') marks.forEach(function (m) { m.remove(); });
                await K.later(500);
            } else if (id === 'wash') {
                sfx.water();
                K.sparks(to.x, to.y, ['#6fcbf5', '#bfe9ff', '#fff'], 16);
                marks.forEach(function (m) { m.classList.add('is-clean'); });
                await K.later(700);
            } else if (id === 'steth') {
                for (var i = 0; i < 4; i++) {
                    var h = document.createElement('div');
                    h.className = 'beat';
                    h.textContent = '💓';
                    h.style.left = local(to).left;
                    h.style.top = local(to).top;
                    pat.appendChild(h);
                    K.tone(110, 0, .12, 'sine', .2);
                    K.tone(95, .15, .12, 'sine', .18);
                    await K.later(520);
                    h.remove();
                }
            } else if (id === 'syrup') {
                setMood(pat, c, 'eat');
                K.tone(700, 0, .1, 'sine', .08); K.tone(900, .12, .12, 'sine', .08);
                await K.later(800);
                marks.forEach(function (m) { m.remove(); });
            }

            line(want.done);
            step++;

            if (step < ail.steps.length) {
                await K.later(1400);
                line(ail.steps[step].ask);
                busy = false;
                return;
            }

            /* הבריא */
            await K.later(1100);
            pat.classList.remove('is-sick');
            setMood(pat, c, 'joy', 'is-happy');
            sfx.good();
            var p = K.center(pat);
            K.float(p.x, p.r.top + 20, ['💖', '💕', '⭐'], 7);
            var st = document.createElement('div');
            st.className = 'sticker';
            st.textContent = '🏅';
            box.appendChild(st);
            line('תּוֹדָה, דּוֹקְטוֹר! אֲנִי מַרְגִּישׁ נֶהְדָּר!');

            /* חבר אמיתי מהאי יוצא מהמרפאה שמח ושבע */
            K.updatePlayer(function (pl) {
                if (pl.caught.indexOf(c.id) === -1) return;
                pl.care = pl.care || {};
                var cr = pl.care[c.id] || (pl.care[c.id] = { full: 3, joy: 3, rest: 3 });
                cr.joy = 5;
                cr.rest = Math.min(5, (cr.rest || 3) + 1);
                cr.seen = Date.now();
            });

            var tr = tray();
            tr.appendChild(bigBtn('🩺 הַחוֹלֶה הַבָּא', function () { sfx.tap(); clinic(); }));
        }
    }

    /* ============================================================== *
     * 💇 מספרה
     * ============================================================== */

    var HAIR_NIK = ['קְצָרָה', 'אֲרֻכָּה', 'מְתֻלְתֶּלֶת', 'קוּקוּ', 'פְּקַעַת', 'קוֹצִים', 'צַמּוֹת', 'גַּלִּי'];
    var PREMIUM = ['spiky', 'braids', 'wavy'];

    function salon() {
        var original = JSON.parse(JSON.stringify(K.hero()));
        var draft = JSON.parse(JSON.stringify(original));
        var p = K.player();
        var owned = (p && p.owned) || [];

        stage('<div class="pole"></div><div class="mirror" id="mirror"><div class="me" id="me"></div></div>');
        function draw(cls) {
            var me = $('me');
            me.innerHTML = K.heroSVG(draft);
            if (cls) K.restart(me, cls);
        }
        draw();

        function headPoint() {
            var r = $('mirror').getBoundingClientRect();
            return { x: r.left + r.width / 2, y: r.top + r.height * .35 };
        }

        function locked(i) {
            var s = K.LOOKS.hair[i];
            return PREMIUM.indexOf(s) !== -1 && owned.indexOf('hair:' + s) === -1;
        }

        async function cut(i) {
            var sc = document.createElement('div');
            sc.className = 'scissors';
            sc.textContent = '✂️';
            $('stage').appendChild(sc);
            var hp = headPoint(), sr = $('stage').getBoundingClientRect();
            for (var k = 0; k < 14; k++) {
                var bit = document.createElement('span');
                bit.className = 'snip-bit';
                bit.style.left = (hp.x - sr.left + K.rand(-60, 60)) + 'px';
                bit.style.top = (hp.y - sr.top + K.rand(-40, 10)) + 'px';
                bit.style.setProperty('--c', K.LOOKS.color[draft.color]);
                bit.style.setProperty('--dx', K.rand(-40, 40) + 'px');
                bit.style.animationDelay = (k * .05) + 's';
                $('stage').appendChild(bit);
                (function (b) { after(1800, function () { b.remove(); }); })(bit);
            }
            for (var s = 0; s < 5; s++) { sfx.snip(); await K.later(170); }
            sc.remove();
            draft.hair = i;
            draw('is-new');
            K.sparks(hp.x, hp.y, ['#fff', '#ffe066'], 10);
        }

        function paint(i) {
            var hp = headPoint();
            K.fly('🖌️', { x: hp.x - 90, y: hp.y }, { x: hp.x + 90, y: hp.y - 20 }, { arc: 40, duration: 500 }).then(function () {
                draft.color = i;
                draw('is-new');
                sfx.magic();
                K.sparks(hp.x, hp.y - 20, [K.LOOKS.color[i], '#fff'], 18);
            });
        }

        function wash() {
            sfx.water();
            var foam = document.createElement('div');
            foam.className = 'foam';
            [[10, 30, 34], [30, 5, 40], [55, 20, 36], [75, 35, 30], [40, 45, 28]].forEach(function (f) {
                var s = document.createElement('span');
                s.style.left = f[0] + '%'; s.style.top = f[1] + '%';
                s.style.width = f[2] + '%'; s.style.aspectRatio = '1';
                foam.appendChild(s);
            });
            $('stage').appendChild(foam);
            var bub = document.createElement('div');
            bub.className = 'bubbles';
            for (var k = 0; k < 8; k++) {
                var b = document.createElement('span');
                b.textContent = '🫧';
                b.style.left = K.rand(30, 66) + '%';
                b.style.top = K.rand(20, 40) + '%';
                b.style.animationDelay = (k * .12) + 's';
                bub.appendChild(b);
            }
            $('stage').appendChild(bub);
            after(1900, function () { foam.remove(); bub.remove(); });
            line('חֲפִיפָה עִם הַרְבֵּה קֶצֶף! 🫧');
        }

        function dry() {
            var w = document.createElement('div');
            w.className = 'wind';
            w.textContent = '💨';
            $('stage').appendChild(w);
            K.restart($('me'), 'is-wiggle');
            for (var k = 0; k < 6; k++) K.tone(180 + k * 5, k * .15, .16, 'sawtooth', .02);
            after(1900, function () { w.remove(); $('me').classList.remove('is-wiggle'); });
            line('פֶּן! פְׁשְׁשְׁשְׁ 💨');
        }

        function renderTray() {
            tray();
            var r1 = row('תִּסְפֹּרֶת');
            K.LOOKS.hair.forEach(function (style, i) {
                var lock = locked(i);
                var art = '<svg viewBox="0 0 100 80"><circle cx="50" cy="50" r="26" fill="' + K.LOOKS.skin[draft.skin] + '"/>' +
                          K.hairSVG(style, K.LOOKS.color[draft.color]) + '</svg>';
                var b = pick(art, HAIR_NIK[i] + (lock ? ' 🔒' : ''), function () {
                    if (lock) {
                        sfx.oops();
                        line('אֶת הַתִּסְפֹּרֶת הַזֹּאת קוֹנִים בַּחֲנוּת שֶׁל צִדְפּוֹנִי');
                        return;
                    }
                    if (i === draft.hair) return;
                    cut(i).then(renderTray);
                }, (i === draft.hair ? 'is-on' : '') + (lock ? ' is-locked' : ''));
                r1.appendChild(b);
            });

            var r2 = row('צֶבַע');
            K.LOOKS.color.forEach(function (col, i) {
                r2.appendChild(pick('<span class="swatch" style="--c:' + col + '"></span>', '', function () {
                    if (i === draft.color) return;
                    paint(i);
                    after(700, renderTray);
                }, i === draft.color ? 'is-on' : ''));
            });

            var r3 = row('');
            r3.appendChild(pick('<span class="ico">🫧</span>', 'חֲפִיפָה', wash));
            r3.appendChild(pick('<span class="ico">💨</span>', 'פֶּן', dry));

            var r4 = row('');
            r4.appendChild(bigBtn('✔ אֵיזֶה יֹפִי!', done));
            r4.appendChild(bigBtn('↩ כְּמוֹ קֹדֶם', function () {
                draft = JSON.parse(JSON.stringify(original));
                draw('is-new');
                renderTray();
            }, true));
        }

        function done() {
            var ok = K.updatePlayer(function (pl) { pl.hero.hair = draft.hair; pl.hero.color = draft.color; });
            sfx.good();
            K.restart($('mirror'), 'is-flash');
            var hp = headPoint();
            K.float(hp.x, hp.y, ['✨', '💖', '⭐'], 8);
            original = JSON.parse(JSON.stringify(draft));
            line(ok ? 'אֵיזֶה יֹפִי! הַמַּרְאֶה הֶחָדָשׁ נִשְׁמַר 💇' : 'אֵיזֶה יֹפִי! (כְּדֵי לִשְׁמֹר, צָרִיךְ קֹדֶם דְּמוּת בָּאִי)');
        }

        renderTray();
        line('בְּרוּכִים הַבָּאִים לַמִּסְפָּרָה! מָה עוֹשִׂים הַיּוֹם?');
    }

    /* ============================================================== *
     * 🌱 גינה — צומחת לפי הזמן האמיתי
     * ============================================================== */

    var GARDEN_KEY = 'garden.v1';
    var SEEDS = {
        straw: { e: '🍓', nik: 'תּוּת',          gives: '🍓', bloom: '#fff',    leaf: '#4fae52' },
        sun:   { e: '🌻', nik: 'חַמָּנִיָּה',     gives: '🌼', bloom: '#ffd84a', leaf: '#5bb85d' },
        mush:  { e: '🍄', nik: 'פִּטְרִיָּה',     gives: '🍄', bloom: '#ff7a59', leaf: '#7cc25c' },
        nut:   { e: '🌰', nik: 'עֵץ עַרְמוֹנִים', gives: '🌰', bloom: '#c98b5a', leaf: '#3f9a45' }
    };

    /* כמה צריך לחכות משלב לשלב (אחרי השקיה). הראשון קצר — כדי לראות משהו עוד באותו ביקור */
    var WAIT = [45e3, 10 * 60e3, 60 * 60e3, 3 * 60 * 60e3];

    function loadGarden() {
        try {
            var g = JSON.parse(localStorage.getItem(GARDEN_KEY) || 'null');
            if (g && Array.isArray(g.plots)) return g;
        } catch (e) { /* גינה חדשה */ }
        return { plots: [null, null, null, null] };
    }

    function saveGarden(g) { try { localStorage.setItem(GARDEN_KEY, JSON.stringify(g)); } catch (e) { /* לא נורא */ } }

    function plantSVG(seed, stage) {
        var S = SEEDS[seed];
        if (stage === 0) return '<svg viewBox="0 0 100 120"><ellipse cx="50" cy="112" rx="10" ry="6" fill="#5b3a22"/></svg>';
        var stem = [0, 30, 60, 80, 86][stage];
        var s = '<svg viewBox="0 0 100 120">' +
            '<path d="M50 118 V' + (118 - stem) + '" stroke="' + S.leaf + '" stroke-width="6" stroke-linecap="round"/>';
        if (stage >= 1) s += '<ellipse cx="38" cy="' + (118 - Math.min(stem, 30) + 6) + '" rx="12" ry="6" fill="' + S.leaf + '" transform="rotate(-25 38 ' + (118 - Math.min(stem, 30) + 6) + ')"/>' +
                            '<ellipse cx="62" cy="' + (118 - Math.min(stem, 30) + 6) + '" rx="12" ry="6" fill="' + S.leaf + '" transform="rotate(25 62 ' + (118 - Math.min(stem, 30) + 6) + ')"/>';
        if (stage >= 2) s += '<ellipse cx="32" cy="' + (118 - stem * .6) + '" rx="16" ry="8" fill="' + S.leaf + '" transform="rotate(-30 32 ' + (118 - stem * .6) + ')"/>' +
                            '<ellipse cx="68" cy="' + (118 - stem * .7) + '" rx="16" ry="8" fill="' + S.leaf + '" transform="rotate(30 68 ' + (118 - stem * .7) + ')"/>';
        if (stage === 3) s += '<circle cx="50" cy="' + (118 - stem - 6) + '" r="11" fill="' + S.bloom + '" stroke="' + S.leaf + '" stroke-width="3"/>';
        if (stage >= 4) s += '<text class="fruit" x="22" y="' + (118 - stem + 8) + '" font-size="26">' + S.e + '</text>' +
                            '<text class="fruit" x="50" y="' + (118 - stem - 4) + '" font-size="28" style="animation-delay:.5s">' + S.e + '</text>';
        return s + '</svg>';
    }

    function wait(ms) {
        if (ms < 90e3) return 'עוֹד רֶגַע קָטָן';
        if (ms < 45 * 60e3) return 'עוֹד קְצָת';
        if (ms < 3 * 60 * 60e3) return 'עוֹד כַּמָּה שָׁעוֹת';
        return 'מָחָר';
    }

    function garden() {
        var g = loadGarden();
        var sel = null;
        stage('<div class="sun"></div><div class="fence"></div><div class="basket" id="basket">🧺</div><div class="plots" id="plots"></div>');
        for (var b = 0; b < 3; b++) {
            var bf = document.createElement('div');
            bf.className = 'butterfly';
            bf.textContent = '🦋';
            bf.style.left = (8 + b * 28) + '%';
            bf.style.top = (14 + b * 8) + '%';
            bf.style.animationDelay = (-b * 3) + 's';
            $('stage').appendChild(bf);
        }

        function tick() {
            var now = Date.now(), grew = [];
            g.plots.forEach(function (p, i) {
                if (p && p.wet && p.stage < 4 && now - p.since >= WAIT[p.stage]) {
                    p.stage++;
                    p.since = now;
                    p.wet = false;
                    grew.push(i);
                }
            });
            if (grew.length) { saveGarden(g); render(grew); sfx.magic(); }
        }

        function render(grew) {
            var box = $('plots');
            box.innerHTML = '';
            g.plots.forEach(function (p, i) {
                var el = document.createElement('button');
                el.type = 'button';
                el.className = 'plot' + (p && p.wet ? ' is-wet' : '');
                var tag = '';
                if (!p) tag = '<span class="tag">➕🌱</span>';
                else if (p.stage >= 4) tag = '<span class="tag">✨ לִקְטֹף!</span>';
                else if (!p.wet) tag = '<span class="tag">💧</span>';
                else tag = '<span class="tag">⏳</span>';
                el.innerHTML = '<div class="soil"></div>' +
                    (p ? '<div class="plant' + (grew && grew.indexOf(i) !== -1 ? ' is-grow' : '') + '">' + plantSVG(p.seed, p.stage) + '</div>' : '') + tag;
                el.setAttribute('aria-label', !p ? 'ערוגה ריקה' : 'צמח');
                el.addEventListener('click', function () { tapPlot(i, el); });
                box.appendChild(el);
                if (grew && grew.indexOf(i) !== -1) {
                    var c = K.center(el);
                    after(200, function () { K.sparks(c.x, c.y, ['#ffe066', '#9ff0c8', '#fff'], 14); });
                }
            });
        }

        function seedTray(i) {
            sel = i;
            var t = tray();
            Object.keys(SEEDS).forEach(function (id) {
                var S = SEEDS[id];
                t.appendChild(pick('<span class="ico">' + S.e + '</span>', S.nik, function (btn) { plant(i, id, btn); }));
            });
            line('מָה נִשְׁתֹּל?');
        }

        async function plant(i, id, btn) {
            var el = $('plots').children[i];
            await K.fly(SEEDS[id].e, K.center(btn), K.center(el), { spin: 180 });
            g.plots[i] = { seed: id, stage: 0, since: Date.now(), wet: false };
            saveGarden(g);
            sfx.pop();
            render();
            tray();
            line('שָׁתַלְנוּ ' + K.plain(SEEDS[id].nik) + '! עַכְשָׁו צָרִיךְ לְהַשְׁקוֹת 💧');
        }

        function water(i, el) {
            var r = el.getBoundingClientRect(), sr = $('stage').getBoundingClientRect();
            var can = document.createElement('div');
            can.className = 'can';
            can.textContent = '🚿';
            can.style.left = (r.left - sr.left + r.width * .2) + 'px';
            can.style.top = (r.top - sr.top + r.height * .05) + 'px';
            $('stage').appendChild(can);
            sfx.water();
            for (var k = 0; k < 12; k++) {
                var d = document.createElement('span');
                d.className = 'drop';
                d.style.left = (r.left - sr.left + r.width * .45 + K.rand(-12, 12)) + 'px';
                d.style.top = (r.top - sr.top + r.height * .35) + 'px';
                d.style.setProperty('--dx', K.rand(-10, 10) + 'px');
                d.style.animationDelay = (.25 + k * .06) + 's';
                $('stage').appendChild(d);
                (function (x) { after(1400, function () { x.remove(); }); })(d);
            }
            after(1300, function () { can.remove(); });
            g.plots[i].wet = true;
            g.plots[i].since = Date.now();
            saveGarden(g);
            after(700, render);
            line('הִשְׁקִינוּ! עַכְשָׁו הוּא צוֹמֵחַ... ' + wait(WAIT[g.plots[i].stage]));
        }

        async function harvest(i, el) {
            var p = g.plots[i], S = SEEDS[p.seed];
            var from = K.center(el), to = K.center($('basket'));
            sfx.good();
            K.fly(S.e, from, to, { spin: 360 });
            await K.later(180);
            await K.fly(S.e, from, to, { spin: -360 });
            K.restart($('basket'), 'is-new');
            var had = K.player();
            if (had) {
                K.addTreasure(S.gives, 2);
                payShell(el, 1);
            }
            g.plots[i] = null;
            saveGarden(g);
            render();
            line(had ? 'קָטַפְנוּ! שְׁנַיִם ' + S.gives + ' נִכְנְסוּ לַתַּרְמִיל, אֶפְשָׁר לָשִׂים אוֹתָם בַּחֶדֶר'
                     : 'קָטַפְנוּ! ' + S.gives + S.gives);
        }

        function tapPlot(i, el) {
            var p = g.plots[i];
            if (!p) return seedTray(i);
            tray();
            if (p.stage >= 4) return harvest(i, el);
            if (!p.wet) return water(i, el);
            var plantEl = el.querySelector('.plant');
            if (plantEl) K.restart(plantEl, 'is-grow');
            sfx.tap();
            line('הוּא עוֹד צוֹמֵחַ. צָרִיךְ לְחַכּוֹת ' + wait(WAIT[p.stage] - (Date.now() - p.since)) + ' ⏳');
        }

        tick();
        render();
        every(3000, tick);
        tray();
        line(g.plots.some(Boolean) ? 'בּוֹאוּ נִרְאֶה מָה צָמַח! לַחֲצוּ עַל עֲרוּגָה' : 'לַחֲצוּ עַל עֲרוּגָה כְּדֵי לִשְׁתֹּל 🌱');
    }

    /* ============================================================== *
     * 🎵 אולם מוזיקה
     * ============================================================== */

    var INSTRUMENTS = [
        { e: '🥁', nik: 'תֹּף',       f: 196, type: 'triangle', glow: 'rgba(255,143,184,.8)' },
        { e: '🎹', nik: 'פְּסַנְתֵּר',  f: 330, type: 'sine',     glow: 'rgba(255,216,74,.8)' },
        { e: '🎺', nik: 'חֲצוֹצְרָה',   f: 392, type: 'square',   glow: 'rgba(111,214,176,.8)' },
        { e: '🎸', nik: 'גִּיטָרָה',    f: 523, type: 'sawtooth', glow: 'rgba(143,208,255,.8)' }
    ];

    function music() {
        var band = K.friends(4);
        var mode = 'free', seq = [], at = 0, len = 2, busy = false;

        stage('<div class="curtain-l"></div><div class="curtain-r"></div><div class="level" id="level"></div><div class="band" id="band"></div>');
        band.forEach(function (c, i) {
            var I = INSTRUMENTS[i];
            var b = document.createElement('button');
            b.type = 'button';
            b.className = 'player';
            b.style.setProperty('--glow', I.glow);
            b.innerHTML = '<span class="face-slot">' + K.creatureSVG(c, 'happy') + '</span><span class="inst">' + I.e + '</span>';
            b.setAttribute('aria-label', K.plain(c.nik) + ' ' + K.plain(I.nik));
            b.addEventListener('click', function () { press(i); });
            $('band').appendChild(b);
        });

        function play(i, long) {
            var I = INSTRUMENTS[i], el = $('band').children[i];
            if (i === 0) { K.tone(I.f, 0, .25, I.type, .25); K.tone(I.f / 2, 0, .2, 'sine', .25); }
            else K.tone(I.f, 0, long ? .6 : .4, I.type, I.type === 'sine' ? .2 : .07);
            el.querySelector('.face-slot').innerHTML = K.creatureSVG(band[i], 'sing');
            K.restart(el, 'is-play');
            var r = el.getBoundingClientRect(), sr = $('stage').getBoundingClientRect();
            var n = document.createElement('span');
            n.className = 'note';
            n.textContent = K.pick(['🎵', '🎶']);
            n.style.left = (r.left - sr.left + r.width / 2) + 'px';
            n.style.top = (r.top - sr.top) + 'px';
            n.style.setProperty('--dx', K.rand(-40, 40) + 'px');
            $('stage').appendChild(n);
            after(1300, function () { n.remove(); });
            after(380, function () {
                el.classList.remove('is-play');
                el.querySelector('.face-slot').innerHTML = K.creatureSVG(band[i], 'happy');
            });
        }

        async function playSeq() {
            busy = true;
            line('תַּקְשִׁיבוּ... 👂', false);
            await K.later(700);
            for (var i = 0; i < seq.length; i++) { play(seq[i]); await K.later(620); }
            at = 0;
            busy = false;
            line('עַכְשָׁו אַתֶּם! 🎶');
        }

        function newRound() {
            seq = [];
            for (var i = 0; i < len; i++) seq.push(K.rand(0, 3));
            $('level').textContent = new Array(len - 1).join('⭐');
            playSeq();
        }

        async function press(i) {
            if (busy) return;
            play(i);
            if (mode !== 'simon') return;
            if (seq[at] !== i) {
                busy = true;
                sfx.oops();
                line('כִּמְעַט! נִשְׁמַע שׁוּב 🔁');
                await K.later(1100);
                return playSeq();
            }
            at++;
            if (at === seq.length) {
                busy = true;
                await K.later(400);
                sfx.good();
                var c = K.center($('band'));
                K.sparks(c.x, c.y - 60, null, 26);
                if (len >= 6) {
                    line('אַלּוּפִים! זָכַרְתֶּם 6 צְלִילִים! 🏆');
                    len = 2;
                    await K.later(1500);
                    return show();
                }
                len++;
                line('נָכוֹן! עוֹד צְלִיל אֶחָד... 🎶');
                await K.later(1300);
                newRound();
            }
        }

        async function show() {
            if (busy && mode !== 'simon') return;
            busy = true;
            mode = 'show';
            $('stage').classList.add('is-disco');
            Array.prototype.forEach.call($('band').children, function (el) { el.classList.add('is-dance'); });
            line('הוֹפָעָה! 💃🕺', false);
            K.say('הופעה!');
            var tune = [0, 1, 2, 1, 3, 2, 1, 0, 1, 2, 3, 3, 2, 1, 0, 0];
            for (var t = 0; t < tune.length; t++) {
                var i = tune[t], el = $('band').children[i];
                el.classList.remove('is-dance');
                play(i);
                (function (e) { after(400, function () { e.classList.add('is-dance'); }); })(el);
                await K.later(330);
            }
            await K.later(500);
            $('stage').classList.remove('is-disco');
            Array.prototype.forEach.call($('band').children, function (el) { el.classList.remove('is-dance'); });
            sfx.good();
            busy = false;
            mode = 'free';
            line('בְּרָאבוֹ! 👏 לַחֲצוּ עַל חָבֵר כְּדֵי לְנַגֵּן');
        }

        var t = tray();
        t.appendChild(bigBtn('🎶 חִזְרוּ אַחֲרַי', function () { if (busy) return; mode = 'simon'; len = 2; newRound(); }));
        t.appendChild(bigBtn('💃 הוֹפָעָה!', show, true));
        line('לַחֲצוּ עַל חָבֵר כְּדֵי לְנַגֵּן 🎵');
    }

    /* ============================================================== *
     * 🍦 גלידרייה
     * ============================================================== */

    var FLAVORS = [
        { id: 'van',   nik: 'וָנִיל',     c: '#fff3c4' },
        { id: 'choc',  nik: 'שׁוֹקוֹלָד',  c: '#8a5433' },
        { id: 'straw', nik: 'תּוּת',      c: '#ffb3c7' },
        { id: 'mint',  nik: 'מֶנְטָה',     c: '#9ff0c8' },
        { id: 'blue',  nik: 'אֻכְמָנִיּוֹת', c: '#9fb4ff' }
    ];

    var TOPS = [
        { id: 'sprinkles', e: '🌈', nik: 'סֻכָּרִיּוֹת' },
        { id: 'cherry',    e: '🍒', nik: 'דֻּבְדְּבָן' },
        { id: 'fudge',     e: '🍫', nik: 'רֹטֶב שׁוֹקוֹלָד' }
    ];

    var CONE = '<svg viewBox="0 0 100 120"><path d="M10 10 L90 10 L50 118 Z" fill="#e9a55b"/>' +
        '<path d="M22 10 L58 96 M42 10 L70 70 M62 10 L80 36 M78 10 L42 96 M58 10 L30 70 M38 10 L20 36" stroke="#c98033" stroke-width="3"/>' +
        '<rect x="6" y="4" width="88" height="12" rx="6" fill="#f2b872"/></svg>';

    function iceCream() {
        var served = 0;
        try { served = +(localStorage.getItem('icecream.v1') || 0); } catch (e) { /* 0 */ }

        var c = K.friends(1)[0];
        var n = served < 3 ? K.rand(1, 2) : K.rand(1, 3);
        var order = { scoops: [], top: K.pick(TOPS).id };
        for (var i = 0; i < n; i++) order.scoops.push(K.pick(FLAVORS).id);
        var made = [], wrong = 0, busy = false;

        stage('<div class="stripes"></div><div class="counter-top"></div>' +
              '<div class="cone-spot" id="spot"><div class="cone" id="cone">' + CONE + '</div></div>');
        var cust = walkIn(c, 'customer', 'happy');

        function coneHTML(scoops, top, size) {
            var h = '<div style="position:relative;width:' + size + 'px;padding-top:' + (scoops.length * size * .55) + 'px">';
            scoops.forEach(function (id, k) {
                var F = FLAVORS.filter(function (f) { return f.id === id; })[0];
                h += '<div class="scoop" style="--c:' + F.c + ';bottom:' + (size * 1.05 + k * size * .55 - size * .45) + 'px"></div>';
            });
            var T = TOPS.filter(function (t) { return t.id === top; })[0];
            h += CONE + '</div>';
            return '<div class="cone-mini">' + h + '</div><div style="font-size:22px">' + (T ? T.e : '') + '</div>';
        }

        after(1150, function () {
            var o = document.createElement('div');
            o.className = 'bubble order';
            o.innerHTML = coneHTML(order.scoops, order.top, 54);
            $('stage').appendChild(o);
            var words = order.scoops.map(function (id) { return K.plain(FLAVORS.filter(function (f) { return f.id === id; })[0].nik); });
            var T = TOPS.filter(function (t) { return t.id === order.top; })[0];
            line('שָׁלוֹם! אֲנִי ' + K.plain(c.nik) + '. אֶפְשָׁר גְּלִידָה? ' + words.join(' ו') + ', עִם ' + K.plain(T.nik));
            flavorTray();
        });

        function stackBottom(k) {
            var w = $('spot').getBoundingClientRect().width;
            return w * 1.05 + k * w * .55 - w * .45;
        }

        var buttons = {};
        function flavorTray() {
            var t = tray();
            buttons = {};
            FLAVORS.forEach(function (F) {
                var b = pick('<span class="swatch" style="--c:' + F.c + ';width:50px;height:50px"></span>', F.nik, function () { scoop(F, b); });
                buttons[F.id] = b;
                t.appendChild(b);
            });
        }

        function scoop(F, btn) {
            if (busy) return;
            var want = order.scoops[made.length];
            var el = document.createElement('div');
            el.className = 'scoop';
            el.style.setProperty('--c', F.c);
            el.style.bottom = stackBottom(made.length) + 'px';
            $('spot').appendChild(el);

            if (F.id !== want) {
                wrong++;
                sfx.oops();
                K.restart(el, 'is-off');
                after(1000, function () { el.remove(); });
                setMood(cust, c, 'happy', 'is-hmm');
                var W = FLAVORS.filter(function (f) { return f.id === want; })[0];
                line('לֹא זֶה... עַכְשָׁו ' + K.plain(W.nik) + '!');
                if (wrong >= 2) buttons[want].classList.add('is-hint');
                return;
            }
            wrong = 0;
            btn.classList.remove('is-hint');
            K.restart(el, 'is-drop');
            K.tone(420 + made.length * 120, .35, .15, 'triangle', .14);
            made.push(F.id);
            if (made.length === order.scoops.length) {
                busy = true;
                after(700, function () { busy = false; toppingTray(); });
            }
        }

        function toppingTray() {
            var t = tray();
            wrong = 0;
            TOPS.forEach(function (T) {
                var b = pick('<span class="ico">' + T.e + '</span>', T.nik, function () { topping(T, b, t); });
                t.appendChild(b);
            });
            line('וְעַכְשָׁו קִשּׁוּט לְמַעְלָה!');
        }

        function topping(T, btn, t) {
            if (busy) return;
            if (T.id !== order.top) {
                wrong++;
                sfx.oops();
                K.restart(btn, 'is-no');
                setMood(cust, c, 'happy', 'is-hmm');
                line('הִמְמְ... אֲנִי רוֹצֶה ' + K.plain(TOPS.filter(function (x) { return x.id === order.top; })[0].nik));
                if (wrong >= 2) Array.prototype.forEach.call(t.children, function (b) {
                    if (b.getAttribute('aria-label') === K.plain(TOPS.filter(function (x) { return x.id === order.top; })[0].nik)) b.classList.add('is-hint');
                });
                return;
            }
            busy = true;
            var top = $('spot').lastElementChild;
            var tb = stackBottom(made.length - 1);
            var w = $('spot').getBoundingClientRect().width;
            if (T.id === 'sprinkles') {
                for (var k = 0; k < 14; k++) {
                    var s = document.createElement('span');
                    s.className = 'sprinkle';
                    s.style.setProperty('--c', K.pick(['#ff5f7e', '#ffd84a', '#4ea9ff', '#6fd6b0', '#a97bff']));
                    s.style.left = K.rand(20, 76) + '%';
                    s.style.bottom = (tb + w * K.rand(40, 85) / 100) + 'px';
                    s.style.transform = 'rotate(' + K.rand(0, 180) + 'deg)';
                    s.style.animationDelay = (k * .04) + 's';
                    $('spot').appendChild(s);
                }
            } else if (T.id === 'cherry') {
                var ch = document.createElement('span');
                ch.className = 'cherry-top';
                ch.textContent = '🍒';
                ch.style.bottom = (tb + w * .78) + 'px';
                $('spot').appendChild(ch);
            } else {
                var d = document.createElement('div');
                d.className = 'choc-drip';
                d.style.bottom = (tb + w * .5) + 'px';
                $('spot').appendChild(d);
            }
            sfx.magic();
            void top;
            tray();
            after(700, serveBtn);
        }

        function serveBtn() {
            busy = false;
            var t = tray();
            t.appendChild(bigBtn('🍦 לְהַגִּישׁ!', serve));
            line('הַגְּלִידָה מוּכָנָה!');
        }

        async function serve() {
            busy = true;
            tray();
            var spot = $('spot');
            var from = K.center(spot), to = K.center(cust);
            var art = spot.innerHTML;
            spot.innerHTML = '<div class="cone">' + CONE + '</div>';
            spot.style.visibility = 'hidden';
            await K.fly('<div style="position:relative;width:' + from.r.width + 'px;height:' + from.r.height + 'px">' + art + '</div>',
                        from, { x: to.x, y: to.y }, { arc: 50, end: .5, duration: 750 });
            setMood(cust, c, 'eat');
            cust.classList.add('is-eat');
            for (var k = 0; k < 4; k++) { K.tone(300 + k * 40, 0, .08, 'sine', .08); await K.later(300); }
            cust.classList.remove('is-eat');
            setMood(cust, c, 'joy', 'is-happy');
            sfx.good();
            K.float(to.x, to.r.top + 20, ['💖', '🍦', '⭐'], 7);
            line(K.pick(['יַמִּי! הֲכִי טָעִים!', 'בְּרְרְר, קַר וְטָעִים!', 'תּוֹדָה רַבָּה!']));
            payShell(cust, 1);
            served++;
            try { localStorage.setItem('icecream.v1', String(served)); } catch (e) { /* לא נורא */ }
            await K.later(2000);
            tray().appendChild(bigBtn('🔔 הַלָּקוֹחַ הַבָּא', function () { sfx.tap(); iceCream(); }));
        }
    }

    /* ============================================================== *
     * 🎨 סטודיו ציור
     * ============================================================== */

    var STUDIO_KEY = 'studio.v1';
    var PAGES = K.PAGES;

    var PAINTS = ['#ff5f5f', '#ff9f3d', '#ffd84a', '#6fd06f', '#6fd6c4', '#4ea9ff', '#a97bff', '#ff8fc4', '#9c6b45', '#ffffff'];

    function loadStudio() {
        try {
            var s = JSON.parse(localStorage.getItem(STUDIO_KEY) || 'null');
            if (s && Array.isArray(s.gallery)) return s;
        } catch (e) { /* סטודיו חדש */ }
        return { gallery: [] };
    }

    var pageSVG = K.pageSVG;

    function studio() {
        var st = loadStudio();
        var page = 'friend', fills = {}, color = PAINTS[5];

        stage('<div class="easel" id="easel"></div>');

        function paint() {
            $('easel').innerHTML = pageSVG(page, fills);
            Array.prototype.forEach.call($('easel').querySelectorAll('.r'), function (el) {
                el.addEventListener('click', function (e) {
                    var id = el.getAttribute('data-r');
                    fills[id] = color;
                    el.setAttribute('fill', color);
                    K.restart(el, 'is-fill');
                    sfx.pop();
                    K.sparks(e.clientX, e.clientY, [color, '#fff'], 8);
                });
            });
        }

        function surprise() {
            var regions = Array.prototype.slice.call($('easel').querySelectorAll('.r'));
            sfx.magic();
            regions.forEach(function (el, k) {
                after(k * 70, function () {
                    var c = K.pick(PAINTS.slice(0, 9));
                    fills[el.getAttribute('data-r')] = c;
                    el.setAttribute('fill', c);
                    K.restart(el, 'is-fill');
                    K.tone(500 + k * 40, 0, .06, 'triangle', .06);
                });
            });
            line('הַפְתָּעָה! 🎲');
        }

        function hang() {
            st.gallery.unshift({ page: page, fills: JSON.parse(JSON.stringify(fills)) });
            st.gallery = st.gallery.slice(0, 12);
            try { localStorage.setItem(STUDIO_KEY, JSON.stringify(st)); } catch (e) { /* לא נורא */ }
            sfx.good();
            var c = K.center($('easel'));
            K.float(c.x, c.y, ['🖼️', '✨', '⭐'], 6);
            line('הַצִּיּוּר נִתְלָה עַל הַקִּיר! רוֹאִים אוֹתוֹ גַּם בַּחַלּוֹן שֶׁל הַסְּטוּדְיוֹ בָּעִיר 🖼️');
            renderTray();
        }

        function renderTray() {
            tray();
            var pal = document.createElement('div');
            pal.className = 'palette';
            PAINTS.forEach(function (c) {
                var b = document.createElement('button');
                b.type = 'button';
                b.className = 'paint' + (c === color ? ' is-on' : '');
                b.style.setProperty('--c', c);
                b.setAttribute('aria-label', c === '#ffffff' ? 'מחק' : 'צבע');
                b.addEventListener('click', function () {
                    color = c;
                    sfx.tap();
                    Array.prototype.forEach.call(pal.children, function (x) { x.classList.toggle('is-on', x === b); });
                });
                pal.appendChild(b);
            });
            $('tray').appendChild(pal);

            var r1 = row('דַּף צְבִיעָה');
            Object.keys(PAGES).forEach(function (id) {
                r1.appendChild(pick(pageSVG(id, {}), PAGES[id].nik, function () {
                    page = id; fills = {}; sfx.tap(); paint(); renderTray();
                    line('צִבְעוּ אֶת ה' + K.plain(PAGES[id].nik) + '! בּוֹחֲרִים צֶבַע וְלוֹחֲצִים עַל הַצִּיּוּר');
                }, id === page ? 'is-on' : ''));
            });

            var r2 = row('');
            r2.appendChild(pick('<span class="ico">🎲</span>', 'הַפְתָּעָה', surprise));
            r2.appendChild(pick('<span class="ico">🧽</span>', 'לְנַקּוֹת', function () { fills = {}; sfx.whoosh(); paint(); }));
            r2.appendChild(pick('<span class="ico">🖼️</span>', 'לִתְלוֹת', hang));

            if (st.gallery.length) {
                var l = document.createElement('p');
                l.className = 'row-label';
                l.textContent = 'הַקִּיר שֶׁלִּי';
                $('tray').appendChild(l);
                var gal = document.createElement('div');
                gal.className = 'gallery';
                st.gallery.forEach(function (g) {
                    var fr = document.createElement('button');
                    fr.type = 'button';
                    fr.className = 'frame';
                    fr.innerHTML = pageSVG(g.page, g.fills);
                    fr.setAttribute('aria-label', 'ציור');
                    fr.addEventListener('click', function () {
                        page = g.page; fills = JSON.parse(JSON.stringify(g.fills)); sfx.tap(); paint(); renderTray();
                    });
                    gal.appendChild(fr);
                });
                $('tray').appendChild(gal);
            }
        }

        paint();
        renderTray();
        line('בּוֹחֲרִים צֶבַע וְלוֹחֲצִים עַל הַצִּיּוּר 🎨');
    }

    /* ============================================================== *
     * ניתוב
     * ============================================================== */

    var PLACES = {
        clinic:   { emoji: '🩺', nik: 'מִרְפְּאַת הַחַבְרֵזִים', run: clinic },
        salon:    { emoji: '💇', nik: 'הַמִּסְפָּרָה',          run: salon },
        garden:   { emoji: '🌱', nik: 'הַגִּנָּה',             run: garden },
        music:    { emoji: '🎵', nik: 'אוּלַם הַמּוּזִיקָה',     run: music },
        icecream: { emoji: '🍦', nik: 'הַגְּלִידָרִיָּה',        run: iceCream },
        studio:   { emoji: '🎨', nik: 'סְטוּדְיוֹ הַצִּיּוּר',     run: studio }
    };

    function route() {
        cleanups.forEach(function (f) { f(); });
        cleanups = [];
        var id = (location.hash || '').slice(1);
        if (!PLACES[id]) id = 'clinic';
        var P = PLACES[id];
        document.body.dataset.place = id;
        document.title = K.plain(P.nik);
        $('title').textContent = P.emoji + ' ' + P.nik;
        $('line').textContent = '';
        shells();
        window.scrollTo(0, 0);
        P.run();
    }

    window.addEventListener('hashchange', route);
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', route);
    else route();

    window.Places = { PLACES: PLACES, WAIT: WAIT, loadGarden: loadGarden, route: route };
})();

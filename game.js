/* ------------------------------------------------------------------ *
 * אי החברזים — משחק איסוף חברים לגיל 5-6
 *
 * עקרונות העיצוב (חשובים יותר מהקוד):
 *   • אי אפשר להפסיד. תשובה לא נכונה = "כמעט, נסו שוב" ותו לא.
 *   • אין טיימרים, אין לחץ, אין מסך "נגמר המשחק".
 *   • כל טקסט מוקרא בקול, כדי שילד שעדיין לא קורא יוכל לשחק לבד.
 *   • כל אינטראקציה היא הקשה אחת על כפתור ענק.
 * ------------------------------------------------------------------ */

(function () {
    'use strict';

    /* ============================================================== *
     * החברזים
     * ============================================================== */

    var TYPES = {
        water:   { label: 'מים',   emoji: '🌊', food: '🐟' },
        leaf:    { label: 'עלים',  emoji: '🌿', food: '🍓' },
        fire:    { label: 'אש',    emoji: '🔥', food: '🌶️' },
        star:    { label: 'כוכב',  emoji: '⭐', food: '🍯' },
        crystal: { label: 'גביש',  emoji: '💎', food: '🧊' },
        sweet:   { label: 'מתוק',  emoji: '🍬', food: '🍭' },
        spark:   { label: 'חשמל',  emoji: '⚡', food: '🔋' }
    };

    var CREATURES = [
        /* --- חוף הים --- */
        { id: 'galgali', nik: 'גַּלְגַּלִּי', name: 'גלגלי', area: 'beach', type: 'water',
          body: '#4ea9ff', belly: '#dcf1ff', dark: '#2f7fd0', ears: 'floppy', pattern: 'spots',
          fact: 'גלגלי אוהב לגלגל את עצמו על הגלים כמו כדור.' },
        { id: 'buali', nik: 'בּוּעָלִי', name: 'בועלי', area: 'beach', type: 'water',
          body: '#7ee0e8', belly: '#eafcff', dark: '#3fb6c2', ears: 'round', extra: 'antenna',
          fact: 'בועלי מכין בועות סבון בצורת לבבות.' },
        { id: 'shonit', nik: 'שׁוֹנִיתִי', name: 'שוניתי', area: 'beach', type: 'water',
          body: '#ff9ec4', belly: '#ffe6f2', dark: '#e2699d', ears: 'leaf', pattern: 'stripes',
          fact: 'שוניתי ישן בתוך צדף ורוד ונוחר בשקט.' },

        /* --- יער הג'ונגל --- */
        { id: 'alali', nik: 'עַלְעָלִי', name: 'עלעלי', area: 'jungle', type: 'leaf',
          body: '#5fd08a', belly: '#e6ffe9', dark: '#34a163', ears: 'leaf' ,
          fact: 'עלעלי מתחבא בין העלים ורק האוזניים מציצות.' },
        { id: 'namnumi', nik: 'נַמְנוּמִי', name: 'נמנומי', area: 'jungle', type: 'leaf',
          body: '#b9e06a', belly: '#f6ffd8', dark: '#86ad3c', ears: 'floppy', pattern: 'spots',
          fact: 'נמנומי ישן שתים עשרה שעות ביום, וגם אחר כך מפהק.' },
        { id: 'kokoni', nik: 'קוֹקוֹנִי', name: 'קוקוני', area: 'jungle', type: 'leaf',
          body: '#a97bff', belly: '#efe6ff', dark: '#7b4fd6', ears: 'pointy',
          fact: 'קוקוני מטפס על עצי קוקוס מהר יותר מכולם.' },

        /* --- הר האש --- */
        { id: 'lohiti', nik: 'לוֹהִיטִי', name: 'לוהיטי', area: 'volcano', type: 'fire',
          body: '#ff7a59', belly: '#ffe0d3', dark: '#d9502f', ears: 'pointy', pattern: 'stripes',
          fact: 'לוהיטי מחמם קקאו בעזרת העיטוש שלו.' },
        { id: 'popi', nik: 'פּוֹפִּי', name: 'פופי', area: 'volcano', type: 'fire',
          body: '#ffb03d', belly: '#fff0d0', dark: '#d98a1c', ears: 'round', extra: 'horn',
          fact: 'פופי מכין פופקורן בלי מיקרוגל, רק עם עיניים גדולות.' },
        { id: 'gechali', nik: 'גֶּחָלִי', name: 'גחלי', area: 'volcano', type: 'fire',
          body: '#ff5f7e', belly: '#ffdfe6', dark: '#d43a5c', ears: 'floppy',
          fact: 'גחלי זוהר בחושך, ולכן אף פעם לא מפחד בלילה.' },

        /* --- שביל הכוכבים --- */
        { id: 'kochavi', nik: 'כּוֹכָבִי', name: 'כוכבי', area: 'stars', type: 'star',
          body: '#ffd93d', belly: '#fff6cf', dark: '#d9ac16', ears: 'pointy', extra: 'antenna',
          fact: 'כוכבי אוסף כוכבים נופלים ומחזיר אותם לשמיים.' },
        { id: 'zizi', nik: 'זִיזִי', name: 'זיזי', area: 'stars', type: 'star',
          body: '#8ab6ff', belly: '#e7f0ff', dark: '#5a86d6', ears: 'round', pattern: 'spots', extra: 'antenna',
          fact: 'זיזי מדגדג עננים עד שהם צוחקים גשם.' },
        { id: 'chalomi', nik: 'חֲלוֹמִי', name: 'חלומי', area: 'stars', type: 'star',
          body: '#d59bff', belly: '#f7e9ff', dark: '#a865d6', ears: 'floppy', extra: 'antenna',
          fact: 'חלומי שומר על החלומות היפים שלכם עד הבוקר.' },

        /* --- מערת הגבישים --- */
        { id: 'gavishi', nik: 'גָּבִישִׁי', name: 'גבישי', area: 'cave', type: 'crystal',
          body: '#7fe4ff', belly: '#e8fbff', dark: '#3aa8c9', ears: 'pointy', extra: 'horn',
          fact: 'גבישי זוהר בחושך ומראה לכולם את הדרך החוצה.' },
        { id: 'nitznutzi', nik: 'נִצְנוּצִי', name: 'נצנוצי', area: 'cave', type: 'crystal',
          body: '#b7c4ff', belly: '#eef1ff', dark: '#7f8fd6', ears: 'round', pattern: 'spots',
          fact: 'נצנוצי אוסף אבנים מנצנצות ומסדר אותן לפי צבע.' },
        { id: 'mearoni', nik: 'מְעָרוֹנִי', name: 'מערוני', area: 'cave', type: 'crystal',
          body: '#a0f0d8', belly: '#eafff8', dark: '#4fbf9e', ears: 'floppy',
          fact: 'מערוני מכיר כל פינה במערה, גם בעיניים עצומות.' },

        /* --- ענני הסוכר --- */
        { id: 'sukariti', nik: 'סֻכָּרִיתִי', name: 'סוכריתי', area: 'clouds', type: 'sweet',
          body: '#ffc2e2', belly: '#fff0f8', dark: '#e884b8', ears: 'leaf',
          fact: 'סוכריתי מריח כמו תות בבוקר וכמו וניל בערב.' },
        { id: 'anani', nik: 'עֲנָנִי', name: 'ענני', area: 'clouds', type: 'sweet',
          body: '#dbe7ff', belly: '#ffffff', dark: '#93a8cc', ears: 'floppy',
          fact: 'ענני רך כמו כרית, ואוהב שמתכרבלים בו.' },
        { id: 'marshmelo', nik: 'מַרְשְׁמֶלוֹ', name: 'מרשמלו', area: 'clouds', type: 'sweet',
          body: '#ffe08a', belly: '#fff8e0', dark: '#d9b04c', ears: 'round', extra: 'antenna',
          fact: 'מרשמלו מתנפח כשהוא שמח, ואז הוא כמו בלון.' },

        /* --- עיר הרובוטים --- */
        { id: 'bipi', nik: 'בִּיפִּי', name: 'ביפי', area: 'robots', type: 'spark',
          body: '#7ad9ff', belly: '#e0f7ff', dark: '#2f9ecf', ears: 'pointy', extra: 'antenna',
          fact: 'ביפי מדבר בצפצופים, אבל מבין כל מילה שאומרים לו.' },
        { id: 'borgi', nik: 'בּוֹרְגִּי', name: 'בורגי', area: 'robots', type: 'spark',
          body: '#ffa8a8', belly: '#ffe8e8', dark: '#d96b6b', ears: 'round', pattern: 'stripes',
          fact: 'בורגי מסדר את כל הברגים בעיר לפי גודל.' },
        { id: 'chashmali', nik: 'חַשְׁמַלִּי', name: 'חשמלי', area: 'robots', type: 'spark',
          body: '#ffe14d', belly: '#fffbd6', dark: '#d9b81c', ears: 'pointy', extra: 'antenna',
          fact: 'חשמלי מטעין את כל הצעצועים בעיר בלחיצת יד.' }
    ];

    /* לכל אזור רשימת חידות משלו. אזור חדש מציג סוג חידה חדש וקשה יותר,
       ולוקח איתו אחד או שניים מהאזור הקודם כדי שלא ייפול בבת אחת. */
    var AREAS = [
        { id: 'beach',   nik: 'חוֹף הַיָּם',        name: 'חוף הים',       emoji: '🏖️',
          puzzles: ['same', 'count', 'color', 'size'] },
        { id: 'jungle',  nik: 'יַעַר הַגּ׳וּנְגֶּל',   name: 'יער הגונגל',    emoji: '🌴',
          puzzles: ['count', 'color', 'size', 'shape'] },
        { id: 'volcano', nik: 'הַר הָאֵשׁ',          name: 'הר האש',        emoji: '🌋',
          puzzles: ['shape', 'odd', 'count', 'color'] },
        { id: 'stars',   nik: 'שְׁבִיל הַכּוֹכָבִים',  name: 'שביל הכוכבים',  emoji: '🌟',
          puzzles: ['odd', 'shape', 'count', 'size'] },
        { id: 'cave',    nik: 'מְעָרַת הַגְּבִישִׁים',  name: 'מערת הגבישים',  emoji: '💎',
          puzzles: ['pattern', 'pattern', 'shape', 'odd'] },
        { id: 'clouds',  nik: 'עַנְנֵי הַסֻּכָּר',     name: 'ענני הסוכר',    emoji: '☁️',
          puzzles: ['plus', 'plus', 'count', 'pattern'] },
        { id: 'robots',  nik: 'עִיר הָרוֹבּוֹטִים',   name: 'עיר הרובוטים',  emoji: '🤖',
          puzzles: ['memory', 'letter', 'letter', 'plus'] }
    ];

    /* ============================================================== *
     * מצב המשחק
     * ============================================================== */

    var STORE_KEY = 'chavrezim.v1';

    /* care: לכל חברז שנאסף — כמה הוא שבע, שמח ונח, ומתי נבדק לאחרונה.
       הערכים 1..5. אף פעם לא 0: חברז לא יכול להיות אומלל, רק "צריך אותך". */
    var state = { caught: [], care: {}, sound: true, voice: true };

    function load() {
        try {
            var raw = localStorage.getItem(STORE_KEY);
            if (!raw) return;
            var saved = JSON.parse(raw);
            if (Array.isArray(saved.caught)) {
                state.caught = saved.caught.filter(function (id) { return byId(id); });
            }
            if (saved.care && typeof saved.care === 'object') state.care = saved.care;
            if (typeof saved.sound === 'boolean') state.sound = saved.sound;
            if (typeof saved.voice === 'boolean') state.voice = saved.voice;
        } catch (err) {
            /* אחסון חסום או פגום — משחקים בלי שמירה */
        }
        /* שמירות ישנות נאספו לפני שהייתה מערכת טיפול — נותנים להן מצב פתיחה טוב */
        state.caught.forEach(function (id) {
            if (!state.care[id]) state.care[id] = { full: 4, joy: 4, rest: 4, seen: Date.now() };
        });
    }

    function save() {
        try {
            localStorage.setItem(STORE_KEY, JSON.stringify(state));
        } catch (err) { /* לא נורא */ }
    }

    function byId(id) {
        return CREATURES.filter(function (c) { return c.id === id; })[0] || null;
    }

    function inArea(areaId) {
        return CREATURES.filter(function (c) { return c.area === areaId; });
    }

    function isCaught(id) { return state.caught.indexOf(id) !== -1; }

    function caughtInArea(areaId) {
        return inArea(areaId).filter(function (c) { return isCaught(c.id); }).length;
    }

    function areaUnlocked(index) {
        if (index === 0) return true;
        return caughtInArea(AREAS[index - 1].id) >= 2;
    }

    /* ============================================================== *
     * מערכת הטיפול
     *
     * שלושה צרכים, כל אחד 1..5, שיורדים לאט עם הזמן האמיתי.
     * שלושה כללים ששומרים על זה ידידותי לגיל חמש:
     *   1. צורך אף פעם לא יורד מתחת ל-1. אין רעב, אין מחלה, אין מוות.
     *   2. היעדרות ארוכה לא נצברת — מקסימום שלוש נקודות ירידה, גם אחרי חודש.
     *   3. אין ניסוח מאשים. הגרוע ביותר הוא "קצת רעב", לא "הזנחת אותי".
     * ============================================================== */

    var NEEDS = [
        { key: 'full', nik: 'שָׂבֵעַ',  emoji: '🍎' },
        { key: 'joy',  nik: 'שָׂמֵחַ',  emoji: '🎈' },
        { key: 'rest', nik: 'נָח',      emoji: '😴' }
    ];

    var HOURS_PER_POINT = 2;         /* כל שעתיים יורדת נקודה אחת */
    var MAX_DECAY = 3;               /* לא משנה כמה זמן עבר */

    function careOf(id) {
        if (!state.care[id]) {
            /* חברז טרי מגיע קצת רעב — יש מה לעשות בשבילו, בלי שהוא נחשב נזקק */
            state.care[id] = { full: 3, joy: 4, rest: 4, seen: Date.now() };
        }
        return state.care[id];
    }

    /* מיישם את הזמן שעבר מאז הביקור האחרון, ומקדם את השעון */
    function settle(id) {
        var care = careOf(id);
        var hours = (Date.now() - (care.seen || Date.now())) / 3600000;
        var drop = Math.min(MAX_DECAY, Math.floor(hours / HOURS_PER_POINT));
        if (drop > 0) {
            NEEDS.forEach(function (need) {
                care[need.key] = Math.max(1, (care[need.key] || 3) - drop);
            });
            care.seen = Date.now();
            save();
        }
        return care;
    }

    function settleAll() { state.caught.forEach(settle); }

    function feed(id, amount) {
        var care = settle(id);
        care.full = Math.min(5, care.full + amount);
        care.joy = Math.min(5, care.joy + 1);
        save();
    }

    function cheer(id) {
        var care = settle(id);
        care.joy = Math.min(5, care.joy + 1);
        save();
    }

    function rest(id) {
        var care = settle(id);
        care.rest = 5;
        care.joy = Math.min(5, care.joy + 1);
        save();
    }

    /* ממוצע הצרכים -> פרצוף. אין פרצוף עצוב, רק "צריך אותך". */
    function mood(id) {
        var care = settle(id);
        var avg = (care.full + care.joy + care.rest) / 3;
        if (avg >= 4.5) return { emoji: '😄', nik: 'מְאֻשָּׁר', say: 'מאושר' };
        if (avg >= 3.5) return { emoji: '🙂', nik: 'שָׂמֵחַ',  say: 'שמח' };
        if (avg >= 2.5) return { emoji: '😌', nik: 'בְּסֵדֶר',  say: 'בסדר' };
        return { emoji: '🥺', nik: 'צָרִיךְ אֶתְכֶם', say: 'צריך אתכם' };
    }

    /* מה הכי כדאי לעשות בשבילו עכשיו — הזמנה, לא אזהרה */
    function topNeed(id) {
        var care = settle(id);
        var worst = null;
        NEEDS.forEach(function (need) {
            if (care[need.key] > 3) return;
            if (!worst || care[need.key] < care[worst.key]) worst = need;
        });
        return worst;
    }

    /* מי באמת מבקש תשומת לב. סף נמוך יותר, כדי שהאלבום לא ינדנד על כולם בבת אחת */
    function isAsking(id) {
        var care = settle(id);
        return NEEDS.some(function (need) { return care[need.key] <= 2; });
    }

    function needsCare() {
        return state.caught.filter(isAsking).length;
    }

    /* רמת קושי עולה לאט לפי מספר החברים שנאספו */
    function level() {
        if (state.caught.length < 3) return 0;
        if (state.caught.length < 7) return 1;
        return 2;
    }

    /* ============================================================== *
     * כלי עזר
     * ============================================================== */

    var $ = function (id) { return document.getElementById(id); };

    function rand(min, max) {
        return min + Math.floor(Math.random() * (max - min + 1));
    }

    function pick(list) { return list[rand(0, list.length - 1)]; }

    function shuffle(list) {
        var out = list.slice();
        for (var i = out.length - 1; i > 0; i--) {
            var j = rand(0, i);
            var tmp = out[i]; out[i] = out[j]; out[j] = tmp;
        }
        return out;
    }

    /* בוחר n פריטים שונים מתוך רשימה */
    function sample(list, n) { return shuffle(list).slice(0, n); }

    /* ============================================================== *
     * ציור החברזים (SVG מקורי, נבנה מפרמטרים)
     * ============================================================== */

    function ears(c) {
        var b = c.body, d = c.dark;
        switch (c.ears) {
            case 'pointy':
                return '<path d="M38 46 L28 6 L60 32 Z" fill="' + b + '"/>' +
                       '<path d="M28 12 L34 40 L50 30 Z" fill="' + d + '" opacity=".45"/>' +
                       '<path d="M82 46 L92 6 L60 32 Z" fill="' + b + '"/>' +
                       '<path d="M92 12 L86 40 L70 30 Z" fill="' + d + '" opacity=".45"/>';
            case 'round':
                return '<circle cx="28" cy="34" r="15" fill="' + b + '"/>' +
                       '<circle cx="28" cy="34" r="8" fill="' + d + '" opacity=".35"/>' +
                       '<circle cx="92" cy="34" r="15" fill="' + b + '"/>' +
                       '<circle cx="92" cy="34" r="8" fill="' + d + '" opacity=".35"/>';
            case 'leaf':
                return '<path d="M40 44 C 18 28, 24 4, 44 14 C 56 20, 54 40, 40 44 Z" fill="' + b + '"/>' +
                       '<path d="M40 42 C 34 30, 36 18, 43 15" stroke="' + d + '" stroke-width="3" fill="none" opacity=".5"/>' +
                       '<path d="M80 44 C 102 28, 96 4, 76 14 C 64 20, 66 40, 80 44 Z" fill="' + b + '"/>' +
                       '<path d="M80 42 C 86 30, 84 18, 77 15" stroke="' + d + '" stroke-width="3" fill="none" opacity=".5"/>';
            default: /* floppy */
                return '<ellipse cx="26" cy="42" rx="12" ry="24" fill="' + b + '" transform="rotate(-22 26 42)"/>' +
                       '<ellipse cx="26" cy="46" rx="6" ry="15" fill="' + d + '" opacity=".35" transform="rotate(-22 26 46)"/>' +
                       '<ellipse cx="94" cy="42" rx="12" ry="24" fill="' + b + '" transform="rotate(22 94 42)"/>' +
                       '<ellipse cx="94" cy="46" rx="6" ry="15" fill="' + d + '" opacity=".35" transform="rotate(22 94 46)"/>';
        }
    }

    function extras(c) {
        if (c.extra === 'antenna') {
            return '<path d="M60 34 C 58 22, 64 18, 62 10" stroke="' + c.dark + '" stroke-width="4" fill="none" stroke-linecap="round"/>' +
                   '<circle cx="62" cy="8" r="6" fill="#ffd93d"/>' +
                   '<circle cx="60" cy="6" r="2" fill="#fff" opacity=".8"/>';
        }
        if (c.extra === 'horn') {
            return '<path d="M52 34 L60 12 L68 34 Z" fill="#fff4d6"/>' +
                   '<path d="M60 12 L68 34 L60 32 Z" fill="' + c.dark + '" opacity=".3"/>';
        }
        return '';
    }

    function pattern(c) {
        if (c.pattern === 'spots') {
            return '<g fill="' + c.dark + '" opacity=".3">' +
                   '<circle cx="34" cy="60" r="6"/><circle cx="88" cy="66" r="5"/><circle cx="42" cy="88" r="4"/>' +
                   '</g>';
        }
        if (c.pattern === 'stripes') {
            return '<g stroke="' + c.dark + '" stroke-width="5" fill="none" opacity=".3" stroke-linecap="round">' +
                   '<path d="M30 56 q10 8 8 20"/><path d="M92 56 q-10 8 -8 20"/>' +
                   '</g>';
        }
        return '';
    }

    /* עיניים עצומות + Zzz, לשעת השינה */
    function sleepingFace(c) {
        return '<path d="M38 58 q8 8 16 0" stroke="#1f2a52" stroke-width="3.4" fill="none" stroke-linecap="round"/>' +
               '<path d="M66 58 q8 8 16 0" stroke="#1f2a52" stroke-width="3.4" fill="none" stroke-linecap="round"/>' +
               '<ellipse cx="60" cy="68" rx="4" ry="3" fill="' + c.dark + '"/>' +
               '<ellipse cx="60" cy="76" rx="5" ry="4" fill="' + c.dark + '" opacity=".35"/>' +
               '<text x="98" y="34" font-size="16" fill="#4a5885" font-family="sans-serif">z</text>' +
               '<text x="106" y="20" font-size="11" fill="#4a5885" font-family="sans-serif">z</text>';
    }

    function awakeFace(c) {
        return '<ellipse cx="46" cy="58" rx="11" ry="12.5" fill="#fff"/>' +
               '<ellipse cx="74" cy="58" rx="11" ry="12.5" fill="#fff"/>' +
               '<circle cx="47" cy="60" r="6" fill="#1f2a52"/>' +
               '<circle cx="75" cy="60" r="6" fill="#1f2a52"/>' +
               '<circle cx="45" cy="57" r="2.3" fill="#fff"/>' +
               '<circle cx="73" cy="57" r="2.3" fill="#fff"/>' +
               '<ellipse cx="60" cy="68" rx="4" ry="3" fill="' + c.dark + '"/>' +
               '<path d="M50 72 q10 10 20 0" stroke="' + c.dark + '" stroke-width="3.4" fill="none" stroke-linecap="round"/>';
    }

    function creatureSVG(c, cls, asleep) {
        return '' +
        '<svg viewBox="0 0 120 120" class="' + (cls || '') + '" role="img" aria-label="' + c.name + '">' +
            ears(c) +
            extras(c) +
            /* ידיים ורגליים מאחורי הגוף */
            '<ellipse cx="20" cy="78" rx="10" ry="8" fill="' + c.dark + '"/>' +
            '<ellipse cx="100" cy="78" rx="10" ry="8" fill="' + c.dark + '"/>' +
            '<ellipse cx="44" cy="104" rx="14" ry="9" fill="' + c.dark + '"/>' +
            '<ellipse cx="76" cy="104" rx="14" ry="9" fill="' + c.dark + '"/>' +
            /* גוף */
            '<ellipse cx="60" cy="68" rx="36" ry="34" fill="' + c.body + '"/>' +
            pattern(c) +
            '<ellipse cx="60" cy="84" rx="21" ry="15" fill="' + c.belly + '"/>' +
            /* לחיים */
            '<circle cx="32" cy="74" r="7" fill="#ff8fc4" opacity=".55"/>' +
            '<circle cx="88" cy="74" r="7" fill="#ff8fc4" opacity=".55"/>' +
            /* פנים */
            (asleep ? sleepingFace(c) : awakeFace(c)) +
        '</svg>';
    }

    /* ============================================================== *
     * צליל ודיבור
     * ============================================================== */

    var audio = null;

    function ac() {
        if (!state.sound) return null;
        if (!audio) {
            var Ctx = window.AudioContext || window.webkitAudioContext;
            if (!Ctx) return null;
            audio = new Ctx();
        }
        if (audio.state === 'suspended') audio.resume();
        return audio;
    }

    function tone(freq, start, dur, type, vol) {
        var ctx = ac();
        if (!ctx) return;
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        var t0 = ctx.currentTime + start;
        osc.type = type || 'sine';
        osc.frequency.setValueAtTime(freq, t0);
        gain.gain.setValueAtTime(0.0001, t0);
        gain.gain.exponentialRampToValueAtTime(vol || 0.18, t0 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t0);
        osc.stop(t0 + dur + 0.05);
    }

    var sfx = {
        tap:   function () { tone(660, 0, 0.09, 'triangle', 0.12); },
        good:  function () { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, i * 0.09, 0.22, 'triangle', 0.16); }); },
        oops:  function () { tone(330, 0, 0.16, 'sine', 0.12); tone(262, 0.14, 0.22, 'sine', 0.12); },
        star:  function () { [784, 988, 1319, 1568, 2093].forEach(function (f, i) { tone(f, i * 0.07, 0.3, 'sine', 0.13); }); },
        page:  function () { tone(440, 0, 0.07, 'triangle', 0.1); tone(587, 0.06, 0.1, 'triangle', 0.1); }
    };

    var lastSpoken = '';

    function say(text) {
        lastSpoken = text;
        if (!state.voice || !('speechSynthesis' in window)) return;
        try {
            window.speechSynthesis.cancel();
            var u = new SpeechSynthesisUtterance(text);
            u.lang = 'he-IL';
            u.rate = 0.9;
            u.pitch = 1.25;
            var voices = window.speechSynthesis.getVoices() || [];
            var he = voices.filter(function (v) { return /^he/i.test(v.lang); })[0];
            if (he) u.voice = he;
            window.speechSynthesis.speak(u);
        } catch (err) { /* אין הקראה בדפדפן הזה */ }
    }

    /* ============================================================== *
     * אפקטים
     * ============================================================== */

    function confetti(count) {
        var box = $('confetti');
        var colors = ['#ff8fc4', '#ffd93d', '#4fd6b0', '#8ab6ff', '#a97bff', '#ff7a59'];
        for (var i = 0; i < (count || 26); i++) {
            var bit = document.createElement('span');
            bit.style.left = rand(2, 96) + 'vw';
            bit.style.background = pick(colors);
            bit.style.animationDelay = (Math.random() * 0.4) + 's';
            bit.style.transform = 'rotate(' + rand(0, 360) + 'deg)';
            box.appendChild(bit);
            (function (node) {
                setTimeout(function () { node.remove(); }, 2400);
            })(bit);
        }
    }

    /* ============================================================== *
     * ניווט בין מסכים
     * ============================================================== */

    var SCREENS = {
        title: 'screenTitle',
        map:   'screenMap',
        play:  'screenPlay',
        pet:   'screenPet',
        album: 'screenAlbum'
    };

    function show(name) {
        Object.keys(SCREENS).forEach(function (key) {
            $(SCREENS[key]).classList.toggle('is-on', key === name);
        });
        window.scrollTo(0, 0);
        if (name === 'map') renderMap();
        if (name === 'album') renderAlbum();
        if (name === 'title') renderTitle();
    }

    /* ============================================================== *
     * מסך פתיחה
     * ============================================================== */

    function renderTitle() {
        var stars = sample(CREATURES, 3);
        $('titleArt').innerHTML = stars.map(function (c) { return creatureSVG(c); }).join('');
        $('soundBtn').setAttribute('aria-pressed', String(state.sound));
        $('voiceBtn').setAttribute('aria-pressed', String(state.voice));
    }

    /* ============================================================== *
     * מפת האי
     * ============================================================== */

    function renderMap() {
        var grid = $('mapGrid');
        grid.innerHTML = '';

        AREAS.forEach(function (area, index) {
            var open = areaUnlocked(index);
            var members = inArea(area.id);
            var got = caughtInArea(area.id);

            var card = document.createElement('button');
            card.type = 'button';
            card.className = 'area-card' +
                (open ? '' : ' is-locked') +
                (got === members.length ? ' is-done' : '');

            var dots = members.map(function (c) {
                return isCaught(c.id) ? '⭐' : '◦';
            }).join('');

            card.innerHTML =
                '<span class="area-emoji" aria-hidden="true">' + (open ? area.emoji : '🔒') + '</span>' +
                '<span class="area-label">' + area.nik + '</span>' +
                '<span class="area-dots" aria-hidden="true">' + dots + '</span>' +
                (open ? '' : '<span class="lock-hint">צריך 2 חברים מ' + AREAS[index - 1].name + '</span>');

            card.addEventListener('click', function () {
                if (!open) {
                    sfx.oops();
                    say('קודם צריך שני חברים מ' + AREAS[index - 1].name);
                    return;
                }
                sfx.page();
                startEncounter(area);
            });

            grid.appendChild(card);
        });

        var total = CREATURES.length;
        var asking = needsCare();
        $('scoreLine').textContent = state.caught.length === total
            ? '🎉 אָסַפְתֶּם אֶת כָּל ' + total + ' הַחַבְרֵזִים! אַלּוּפִים!'
            : 'אָסַפְתֶּם ' + state.caught.length + ' מִתּוֹךְ ' + total + ' חַבְרֵזִים ⭐';
        $('careLine').textContent = asking
            ? (asking === 1 ? '💛 חָבֵר אֶחָד מְחַכֶּה לְטִפּוּל' : '💛 ' + asking + ' חֲבֵרִים מְחַכִּים לְטִפּוּל')
            : '';
    }

    /* ============================================================== *
     * חידות — כל חידה מחזירה { question, items, choices }
     * items   = מה מוצג בלוח העליון (מחרוזות HTML)
     * choices = כפתורי בחירה, אחד מהם correct: true
     * ============================================================== */

    var FOOD = ['🍎', '🍌', '🍓', '🍇', '🍊', '🥕', '🍪', '🐚', '⭐', '🌸', '🍄', '🐞'];
    var PALETTE = [
        { hex: '#ff5f5f', name: 'אדום', nik: 'אָדֹם' },
        { hex: '#4ea9ff', name: 'כחול', nik: 'כָּחֹל' },
        { hex: '#ffd93d', name: 'צהוב', nik: 'צָהֹב' },
        { hex: '#4fd6b0', name: 'ירוק', nik: 'יָרֹק' },
        { hex: '#ff9f3d', name: 'כתום', nik: 'כָּתֹם' },
        { hex: '#c07bff', name: 'סגול', nik: 'סָגֹל' },
        { hex: '#ff8fc4', name: 'ורוד', nik: 'וָרֹד' }
    ];

    function swatch(hex) {
        return '<span class="swatch" style="background:' + hex + '"></span>';
    }

    var SHAPES = {
        circle:   { name: 'עיגול',  d: '<circle cx="31" cy="31" r="26"/>' },
        square:   { name: 'ריבוע',  d: '<rect x="6" y="6" width="50" height="50" rx="6"/>' },
        triangle: { name: 'משולש',  d: '<polygon points="31,4 58,56 4,56"/>' },
        star:     { name: 'כוכב',   d: '<polygon points="31,3 39,23 60,24 43,37 49,58 31,45 13,58 19,37 2,24 23,23"/>' },
        heart:    { name: 'לב',     d: '<path d="M31 56 C 4 38, 4 14, 19 12 C 27 11, 31 18, 31 18 C 31 18, 35 11, 43 12 C 58 14, 58 38, 31 56 Z"/>' }
    };

    function shapeIcon(key, color) {
        return '<svg class="shape-ico" viewBox="0 0 62 62" aria-hidden="true"><g fill="' + color + '">' +
               SHAPES[key].d + '</g></svg>';
    }

    /* כמה? — ספירה */
    function puzzleCount(lv) {
        var max = lv === 0 ? 3 : (lv === 1 ? 5 : 7);
        var n = rand(1, max);
        var emoji = pick(FOOD);

        var options = [n];
        while (options.length < 3) {
            var guess = rand(1, Math.max(max, n + 1));
            if (options.indexOf(guess) === -1) options.push(guess);
        }

        var items = [];
        for (var i = 0; i < n; i++) items.push(emoji);

        return {
            question: 'כַּמָּה יֵשׁ כָּאן?',
            speak: 'כמה יש כאן? תספרו יחד איתי',
            items: items,
            choices: shuffle(options).map(function (val) {
                return { html: String(val), correct: val === n, label: String(val) };
            })
        };
    }

    /* אותו צבע */
    function puzzleColor() {
        var chosen = sample(PALETTE, 3);
        var target = chosen[0];
        return {
            question: 'אֵיזֶה עִגּוּל בְּצֶבַע ' + target.nik + '?',
            speak: 'איזה עיגול בצבע ' + target.name + '?',
            items: [swatch(target.hex)],
            choices: shuffle(chosen).map(function (col) {
                return { html: swatch(col.hex), correct: col.hex === target.hex, label: col.name };
            })
        };
    }

    /* אותה צורה */
    function puzzleShape() {
        var keys = sample(Object.keys(SHAPES), 3);
        var target = keys[0];
        var colors = ['#ff8fc4', '#4ea9ff', '#4fd6b0', '#ffd93d', '#a97bff'];
        return {
            question: 'אֵיזוֹ צוּרָה מַתְאִימָה?',
            speak: 'איזו צורה מתאימה? זה ' + SHAPES[target].name,
            items: [shapeIcon(target, '#4a5885')],
            choices: shuffle(keys).map(function (key, i) {
                return { html: shapeIcon(key, colors[i]), correct: key === target, label: SHAPES[key].name };
            })
        };
    }

    /* אותו פריט */
    function puzzleSame() {
        var chosen = sample(FOOD, 3);
        var target = chosen[0];
        return {
            question: 'מִצְאוּ אֶת אוֹתוֹ הַדָּבָר!',
            speak: 'מצאו את אותו הדבר',
            items: [target],
            choices: shuffle(chosen).map(function (emoji) {
                return { html: emoji, correct: emoji === target, label: emoji };
            })
        };
    }

    /* גדול או קטן */
    function puzzleSize() {
        var emoji = pick(FOOD);
        var wantBig = Math.random() < 0.5;
        var sizes = shuffle([30, 48, 74]);
        var target = wantBig ? 74 : 30;
        return {
            question: wantBig ? 'לַחֲצוּ עַל הַגָּדוֹל!' : 'לַחֲצוּ עַל הַקָּטָן!',
            speak: wantBig ? 'לחצו על הגדול' : 'לחצו על הקטן',
            items: [],
            choices: sizes.map(function (px) {
                return {
                    html: '<span style="font-size:' + px + 'px;line-height:1">' + emoji + '</span>',
                    correct: px === target,
                    label: px === 74 ? 'גדול' : (px === 30 ? 'קטן' : 'בינוני')
                };
            })
        };
    }

    /* מי שונה */
    function puzzleOdd() {
        var pair = sample(FOOD, 2);
        var same = pair[0];
        var odd = pair[1];
        return {
            question: 'מִי שׁוֹנֶה מִכֻּלָּם?',
            speak: 'מי שונה מכולם?',
            items: [],
            choices: shuffle([
                { html: same, correct: false, label: same },
                { html: same, correct: false, label: same },
                { html: odd, correct: true, label: odd }
            ])
        };
    }

    /* ---------------- החידות של האזורים החדשים ---------------- */

    var DOTS = ['🔴', '🔵', '🟡', '🟢', '🟣', '🟠'];

    /* מה בא אחר כך? — זיהוי חוקיות */
    function puzzlePattern(lv) {
        var colors = sample(DOTS, 3);
        var a = colors[0], b = colors[1], c = colors[2];

        /* חוקיות פשוטה בהתחלה, משולשת רק כשכבר יש ניסיון */
        var seq, answer;
        if (lv < 2) {
            seq = [a, b, a, b, a];
            answer = b;
        } else if (Math.random() < 0.5) {
            seq = [a, a, b, a, a];
            answer = b;
        } else {
            seq = [a, b, c, a, b];
            answer = c;
        }

        return {
            question: 'מָה בָּא אַחַר כָּךְ?',
            speak: 'תסתכלו על השורה. מה בא אחר כך?',
            layout: 'row',
            items: seq.concat(['<span class="blank">?</span>']),
            choices: shuffle([a, b, c]).map(function (dot) {
                return { html: dot, correct: dot === answer, label: dot };
            })
        };
    }

    /* כמה יש ביחד? — חיבור */
    function puzzlePlus(lv) {
        var top = lv === 0 ? 3 : (lv === 1 ? 4 : 5);
        var a = rand(1, top);
        var b = rand(1, top);
        var sum = a + b;
        var emoji = pick(['🍬', '🍭', '🧁', '🍩', '🍒']);

        var options = [sum];
        while (options.length < 3) {
            var guess = rand(2, top * 2);
            if (options.indexOf(guess) === -1) options.push(guess);
        }

        /* שתי קבוצות נפרדות, לא שורה אחת ארוכה: אחרת לא רואים מה ועוד מה */
        var group = function (n) {
            var html = '';
            for (var i = 0; i < n; i++) html += emoji;
            return '<span class="group">' + html + '</span>';
        };

        return {
            question: 'כַּמָּה יֵשׁ בְּיַחַד?',
            speak: 'כמה יש ביחד? ' + a + ' ועוד ' + b,
            layout: 'sum',
            items: [group(a), '<span class="op">➕</span>', group(b)],
            choices: shuffle(options).map(function (val) {
                return { html: String(val), correct: val === sum, label: String(val) };
            })
        };
    }

    /* מה נעלם? — זיכרון. הפריטים נראים, ואז אחד מהם נעלם. */
    function puzzleMemory(lv) {
        var count = lv < 2 ? 3 : 4;
        var chosen = sample(FOOD, count);
        var gone = pick(chosen);
        var stayed = chosen.filter(function (e) { return e !== gone; });

        return {
            question: 'מִי נֶעֱלַם?',
            speak: 'תסתכלו טוב על החברים. מי מהם נעלם?',
            revealItems: chosen,
            items: stayed,
            choices: shuffle([gone].concat(sample(stayed, 2))).map(function (e) {
                return { html: e, correct: e === gone, label: e };
            })
        };
    }

    /* באיזו אות מתחיל? — זיהוי אות ראשונה */
    var WORDS = [
        { emoji: '🍎', word: 'תפוח',   letter: 'ת' },
        { emoji: '🍌', word: 'בננה',   letter: 'ב' },
        { emoji: '🐟', word: 'דג',     letter: 'ד' },
        { emoji: '⭐', word: 'כוכב',   letter: 'כ' },
        { emoji: '🌸', word: 'פרח',    letter: 'פ' },
        { emoji: '🐰', word: 'ארנב',   letter: 'א' },
        { emoji: '🥕', word: 'גזר',    letter: 'ג' },
        { emoji: '🌳', word: 'עץ',     letter: 'ע' },
        { emoji: '🎈', word: 'בלון',   letter: 'ב' },
        { emoji: '🌙', word: 'ירח',    letter: 'י' },
        { emoji: '🍄', word: 'פטריה',  letter: 'פ' },
        { emoji: '🦋', word: 'פרפר',   letter: 'פ' },
        { emoji: '🐝', word: 'דבורה',  letter: 'ד' },
        { emoji: '🍇', word: 'ענבים',  letter: 'ע' }
    ];

    function puzzleLetter() {
        var target = pick(WORDS);
        var others = shuffle('אבגדהוזחטיכלמנספצקרשת'.split(''))
            .filter(function (ch) { return ch !== target.letter; })
            .slice(0, 2);

        return {
            question: 'בְּאֵיזוֹ אוֹת מַתְחִיל?',
            speak: 'באיזו אות מתחילה המילה ' + target.word + '?',
            items: [target.emoji],
            choices: shuffle([target.letter].concat(others)).map(function (ch) {
                return { html: ch, correct: ch === target.letter, label: 'האות ' + ch };
            })
        };
    }

    var MAKERS = {
        same:    puzzleSame,
        count:   puzzleCount,
        color:   puzzleColor,
        size:    puzzleSize,
        shape:   puzzleShape,
        odd:     puzzleOdd,
        pattern: puzzlePattern,
        plus:    puzzlePlus,
        memory:  puzzleMemory,
        letter:  puzzleLetter
    };

    /* כל אזור מגריל מתוך החידות שלו בלבד */
    function makePuzzle(area) {
        var names = (area && area.puzzles) || ['same', 'count', 'color', 'size'];
        return MAKERS[pick(names)](level());
    }

    /* ============================================================== *
     * מפגש עם חברז
     * ============================================================== */

    var current = { area: null, creature: null, puzzle: null, solved: false };

    function startEncounter(area) {
        var pool = inArea(area.id).filter(function (c) { return !isCaught(c.id); });
        var replay = pool.length === 0;
        var creature = replay ? pick(inArea(area.id)) : pick(pool);

        current = { area: area, creature: creature, puzzle: makePuzzle(area), solved: false, replay: replay };

        $('areaName').textContent = area.nik;
        $('catchZone').hidden = true;

        var slot = $('creatureSlot');
        slot.className = 'creature-slot';
        slot.innerHTML = creatureSVG(creature);

        var hello = replay
            ? 'שָׁלוֹם שׁוּב! אֲנִי ' + creature.nik + '. בּוֹאוּ נְשַׂחֵק!'
            : 'הַיי! אֲנִי ' + creature.nik + '!';
        $('speech').textContent = hello;

        show('play');
        renderPuzzle();

        var line = (replay ? 'שלום שוב! אני ' : 'היי! אני ') + creature.name + '. ' + current.puzzle.speak;
        say(line);
    }

    function drawItems(box, list) {
        box.innerHTML = '';
        list.forEach(function (html, i) {
            var el = document.createElement('span');
            el.className = 'item';
            el.style.animationDelay = (i * 0.08) + 's';
            el.innerHTML = html;
            box.appendChild(el);
        });
    }

    function renderPuzzle() {
        var p = current.puzzle;
        var box = $('puzzle');
        box.innerHTML = '';

        var q = document.createElement('p');
        q.className = 'puzzle-q';
        q.textContent = p.question;
        box.appendChild(q);

        var items = null;
        if (p.items.length || p.revealItems) {
            items = document.createElement('div');
            items.className = 'items' + (p.layout ? ' is-' + p.layout : '');
            drawItems(items, p.revealItems || p.items);
            box.appendChild(items);
        }

        var choices = document.createElement('div');
        choices.className = 'choices';
        p.choices.forEach(function (choice) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'choice';
            btn.innerHTML = choice.html;
            if (choice.label) btn.setAttribute('aria-label', choice.label);
            btn.addEventListener('click', function () { answer(choice, btn, choices); });
            choices.appendChild(btn);
        });

        /* חידת זיכרון: קודם מסתכלים, ואז אחד נעלם.
           זה השהיה של ההצגה, לא שעון על התשובה — לענות אפשר בלי הגבלה,
           ואפשר לבקש להסתכל שוב כמה פעמים שרוצים. */
        if (p.revealItems) {
            choices.classList.add('is-waiting');
            q.textContent = 'תִּסְתַּכְּלוּ טוֹב...';

            var peek = document.createElement('button');
            peek.type = 'button';
            peek.className = 'peek-btn';
            peek.textContent = '👀 לְהִסְתַּכֵּל שׁוּב';

            var hide = function () {
                drawItems(items, p.items);
                q.textContent = p.question;
                choices.classList.remove('is-waiting');
                peek.disabled = false;
                sfx.tap();
            };

            var look = function () {
                peek.disabled = true;
                choices.classList.add('is-waiting');
                q.textContent = 'תִּסְתַּכְּלוּ טוֹב...';
                drawItems(items, p.revealItems);
                setTimeout(hide, 3500);
            };

            peek.addEventListener('click', look);
            box.appendChild(peek);
            setTimeout(hide, 3500);
        }

        box.appendChild(choices);
    }

    function answer(choice, btn, choicesBox) {
        if (current.solved) return;

        if (!choice.correct) {
            /* אין עונש, אין הפסד — רק עידוד */
            sfx.oops();
            btn.classList.add('is-wrong');
            btn.disabled = true;
            $('creatureSlot').className = 'creature-slot is-shy';
            var cheer = pick(['כִּמְעַט! נַסּוּ עוֹד פַּעַם 😊', 'לֹא נוֹרָא, נַסּוּ שׁוּב!', 'עוֹד נִסָּיוֹן קָטָן!']);
            $('speech').textContent = cheer;
            say(cheer.replace(/[֑-ׇ]/g, ''));
            setTimeout(function () { $('creatureSlot').className = 'creature-slot'; }, 600);
            return;
        }

        current.solved = true;
        sfx.good();
        confetti(18);
        btn.classList.add('is-right');
        Array.prototype.forEach.call(choicesBox.children, function (node) { node.disabled = true; });
        $('creatureSlot').className = 'creature-slot is-happy';
        $('speech').textContent = 'יֵשׁ! נָכוֹן מְאוֹד!';

        $('catchZone').hidden = false;
        say('יש! נכון מאוד. עכשיו זרקו את כוכב החברות');
        setTimeout(function () {
            $('catchZone').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 300);
    }

    function throwStar() {
        var star = $('flyingStar');
        star.classList.remove('is-flying');
        void star.offsetWidth;      /* מאתחל את האנימציה */
        star.classList.add('is-flying');
        sfx.star();
        $('catchZone').hidden = true;

        setTimeout(function () {
            var c = current.creature;
            $('creatureSlot').className = 'creature-slot is-caught';
            confetti(40);

            var fresh = !isCaught(c.id);
            if (fresh) {
                state.caught.push(c.id);
                careOf(c.id);
                save();
            }

            var msg = fresh
                ? c.nik + ' הִצְטָרֵף אֲלֵיכֶם! 🎉'
                : c.nik + ' שִׂחֵק אִתְּכֶם וְשָׂמַח מְאוֹד! 🎉';
            $('speech').textContent = msg;
            say((fresh ? c.name + ' הצטרף אליכם!' : c.name + ' שמח מאוד!'));

            showAfterCatch();
        }, 700);
    }

    function showAfterCatch() {
        var box = $('puzzle');
        box.innerHTML = '';

        var again = document.createElement('button');
        again.type = 'button';
        again.className = 'big-btn';
        again.innerHTML = '<span class="btn-emoji">✨</span> עוֹד חָבֵר!';
        again.addEventListener('click', function () {
            sfx.tap();
            startEncounter(current.area);
        });

        var toMap = document.createElement('button');
        toMap.type = 'button';
        toMap.className = 'big-btn ghost-btn';
        toMap.innerHTML = '<span class="btn-emoji">🗺️</span> לַמַּפָּה';
        toMap.addEventListener('click', function () { sfx.page(); show('map'); });

        var toAlbum = document.createElement('button');
        toAlbum.type = 'button';
        toAlbum.className = 'big-btn ghost-btn';
        toAlbum.innerHTML = '<span class="btn-emoji">🍎</span> לְטַפֵּל בּוֹ';
        toAlbum.addEventListener('click', function () { sfx.page(); openPet(current.creature.id); });

        box.appendChild(again);
        box.appendChild(toMap);
        box.appendChild(toAlbum);
    }

    /* ============================================================== *
     * מסך הטיפול — האכלה, משחק ושינה
     * ============================================================== */

    var petId = null;
    var sleeping = false;

    function openPet(id) {
        petId = id;
        sleeping = false;
        var c = byId(id);
        $('petName').textContent = c.nik;
        $('carePanel').innerHTML = '';
        show('pet');

        var m = mood(id);
        var need = topNeed(id);
        var hello = need
            ? { full: 'אֲנִי קְצָת רָעֵב...', joy: 'בָּא לִי לְשַׂחֵק!', rest: 'אֲנִי קְצָת עָיֵף...' }[need.key]
            : 'אֲנִי מַרְגִּישׁ נֶהְדָּר! תּוֹדָה שֶׁאַתֶּם דּוֹאֲגִים לִי.';
        $('petSpeech').textContent = hello;
        say(c.name + '. ' + hello.replace(/[֑-ׇ]/g, ''));
        void m;
        renderPet();
    }

    function renderPet() {
        var c = byId(petId);
        var care = settle(petId);

        var slot = $('petSlot');
        slot.className = 'creature-slot' + (sleeping ? ' is-sleeping' : '');
        slot.innerHTML = creatureSVG(c, '', sleeping);

        var meters = $('petMeters');
        meters.innerHTML = '';
        NEEDS.forEach(function (need) {
            var row = document.createElement('div');
            row.className = 'meter';

            var pips = '';
            for (var i = 1; i <= 5; i++) {
                pips += '<span class="pip' + (i <= care[need.key] ? ' is-on' : '') + '"></span>';
            }

            row.innerHTML =
                '<span class="meter-emoji" aria-hidden="true">' + need.emoji + '</span>' +
                '<span class="meter-label">' + need.nik + '</span>' +
                '<span class="pips" role="img" aria-label="' + need.nik + ' ' + care[need.key] + ' מתוך 5">' +
                pips + '</span>';
            meters.appendChild(row);
        });

        var actions = $('careActions');
        actions.innerHTML = '';
        [
            { key: 'feed',  emoji: '🍎', nik: 'לְהַאֲכִיל', run: panelFeed },
            { key: 'play',  emoji: '🎈', nik: 'לְשַׂחֵק',   run: panelPlay },
            { key: 'sleep', emoji: '😴', nik: 'לִישֹׁן',    run: panelSleep }
        ].forEach(function (action) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'care-btn';
            btn.disabled = sleeping;
            btn.innerHTML = '<span class="care-emoji" aria-hidden="true">' + action.emoji + '</span>' +
                            '<span class="care-label">' + action.nik + '</span>';
            btn.addEventListener('click', function () { sfx.tap(); action.run(); });
            actions.appendChild(btn);
        });
    }

    /* --- האכלה: שלושה מאכלים, אחד מהם האהוב עליו.
           כל בחירה מאכילה — האהוב פשוט משמח יותר. אין בחירה שגויה. --- */
    function panelFeed() {
        var c = byId(petId);
        var favourite = TYPES[c.type].food;
        var others = shuffle(Object.keys(TYPES)
            .map(function (t) { return TYPES[t].food; })
            .filter(function (f) { return f !== favourite; })).slice(0, 2);

        var panel = $('carePanel');
        panel.innerHTML = '<p class="panel-q">מָה נוֹתְנִים לוֹ לֶאֱכֹל?</p>';
        say('מה נותנים ל' + c.name + ' לאכול?');

        var row = document.createElement('div');
        row.className = 'choices';
        shuffle([favourite].concat(others)).forEach(function (food) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'choice';
            btn.textContent = food;
            btn.addEventListener('click', function () {
                var loved = food === favourite;
                feed(petId, loved ? 2 : 1);
                sfx.good();
                if (loved) confetti(14);
                $('petSlot').className = 'creature-slot is-eating';
                var line = loved
                    ? 'מַמְמְ! זֶה הָאֹכֶל הָאָהוּב עָלַי!'
                    : 'תּוֹדָה! הָיָה טָעִים.';
                $('petSpeech').textContent = line;
                say(line.replace(/[֑-ׇ]/g, ''));
                panel.innerHTML = '';
                setTimeout(renderPet, 700);
            });
            row.appendChild(btn);
        });
        panel.appendChild(row);
    }

    /* --- משחק: שלוש דגדוגים על החברז --- */
    function panelPlay() {
        var c = byId(petId);
        var left = 3;
        var panel = $('carePanel');
        panel.innerHTML = '<p class="panel-q">לְדַגְדֵּג אוֹתוֹ שָׁלוֹשׁ פְּעָמִים!</p>' +
                          '<p class="panel-hint" id="tickleLeft"></p>';
        say('לדגדג את ' + c.name + ' שלוש פעמים! תלחצו עליו');

        var slot = $('petSlot');
        slot.classList.add('is-tickly');

        var count = function () {
            $('tickleLeft').textContent = left > 0 ? '⭐'.repeat(left) : '';
        };
        count();

        var tickle = function () {
            if (left <= 0) return;
            left--;
            count();
            sfx.tap();
            slot.className = 'creature-slot is-tickly is-happy';
            setTimeout(function () { slot.className = 'creature-slot is-tickly'; }, 400);

            if (left === 0) {
                slot.removeEventListener('click', tickle);
                slot.classList.remove('is-tickly');
                cheer(petId);
                sfx.good();
                confetti(16);
                var line = 'חִיחִי! זֶה מְדַגְדֵּג!';
                $('petSpeech').textContent = line;
                say(line.replace(/[֑-ׇ]/g, ''));
                panel.innerHTML = '';
                setTimeout(renderPet, 700);
            }
        };

        slot.addEventListener('click', tickle);
    }

    /* --- שינה: מחשיכים, שיר ערש קצר, והוא מתעורר רענן --- */
    function panelSleep() {
        var c = byId(petId);
        sleeping = true;
        renderPet();

        $('petStage').classList.add('is-night');
        $('petSpeech').textContent = 'לַיְלָה טוֹב... 💤';
        say('לילה טוב, ' + c.name);

        /* שיר ערש קצר ורך */
        [523, 440, 392, 349, 392, 440].forEach(function (f, i) {
            tone(f, 0.5 + i * 0.55, 0.7, 'sine', 0.09);
        });

        $('carePanel').innerHTML = '<p class="panel-hint">שְׁ... הוּא יָשֵׁן 💤</p>';

        setTimeout(function () {
            sleeping = false;
            rest(petId);
            $('petStage').classList.remove('is-night');
            var line = 'בֹּקֶר טוֹב! יָשַׁנְתִּי נֶהְדָּר.';
            $('petSpeech').textContent = line;
            say(line.replace(/[֑-ׇ]/g, ''));
            sfx.star();
            $('carePanel').innerHTML = '';
            renderPet();
        }, 4200);
    }

    /* ============================================================== *
     * אלבום החברזים
     * ============================================================== */

    function renderAlbum() {
        var grid = $('albumGrid');
        grid.innerHTML = '';
        settleAll();

        CREATURES.forEach(function (c) {
            var have = isCaught(c.id);
            var card = document.createElement('button');
            card.type = 'button';
            card.className = 'album-card' + (have ? '' : ' is-locked');

            var badge = '';
            if (have) {
                var m = mood(c.id);
                var asking = isAsking(c.id) && topNeed(c.id);
                badge = '<span class="mood' + (asking ? ' is-asking' : '') + '" aria-label="' + m.say + '">' +
                        (asking ? asking.emoji : m.emoji) + '</span>';
            }

            card.innerHTML = badge + creatureSVG(c) +
                '<span class="name">' + (have ? c.nik : '???') + '</span>' +
                '<span class="type">' + (have ? TYPES[c.type].emoji + ' ' + TYPES[c.type].label : '❔') + '</span>';

            card.addEventListener('click', function () {
                if (!have) {
                    sfx.oops();
                    var area = AREAS.filter(function (a) { return a.id === c.area; })[0];
                    $('albumNote').textContent = 'עוֹד לֹא פָּגַשְׁתֶּם אוֹתוֹ. חַפְּשׂוּ בְּ' + area.nik + '!';
                    say('עוד לא פגשתם אותו. חפשו ב' + area.name);
                    return;
                }
                sfx.tap();
                openPet(c.id);
            });

            grid.appendChild(card);
        });

        var asking = needsCare();
        $('albumNote').textContent = !state.caught.length
            ? 'עוֹד אֵין לָכֶם חֲבֵרִים — צְאוּ לְטַיֵּל וְתִמְצְאוּ אוֹתָם!'
            : asking
                ? (asking === 1 ? 'חָבֵר אֶחָד צָרִיךְ אֶתְכֶם 💛' : asking + ' חֲבֵרִים צְרִיכִים אֶתְכֶם 💛')
                : 'כֻּלָּם מְטֻפָּלִים וּמְאֻשָּׁרִים! 💛';
    }

    /* ============================================================== *
     * חיווט
     * ============================================================== */

    function init() {
        load();

        $('playBtn').addEventListener('click', function () {
            sfx.page();
            say('בואו נצא לטייל!');
            show('map');
        });

        $('albumBtnTitle').addEventListener('click', function () { sfx.page(); show('album'); });

        Array.prototype.forEach.call(document.querySelectorAll('[data-goto]'), function (btn) {
            btn.addEventListener('click', function () {
                sfx.page();
                show(btn.getAttribute('data-goto'));
            });
        });

        $('starBtn').addEventListener('click', throwStar);

        $('repeatBtn').addEventListener('click', function () {
            if (lastSpoken) say(lastSpoken);
        });

        $('soundBtn').addEventListener('click', function () {
            state.sound = !state.sound;
            save();
            $('soundBtn').setAttribute('aria-pressed', String(state.sound));
            if (state.sound) sfx.tap();
        });

        $('voiceBtn').addEventListener('click', function () {
            state.voice = !state.voice;
            save();
            $('voiceBtn').setAttribute('aria-pressed', String(state.voice));
            if (state.voice) say('שומעים אותי?');
            else if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        });

        $('resetBtn').addEventListener('click', function () {
            if (!window.confirm('להתחיל משחק חדש? כל החברזים שנאספו יימחקו.')) return;
            state.caught = [];
            save();
            sfx.page();
            renderTitle();
        });

        /* טעינת קולות ההקראה מתעדכנת מאוחר בחלק מהדפדפנים */
        if ('speechSynthesis' in window) {
            window.speechSynthesis.onvoiceschanged = function () { /* מרענן את הרשימה */ };
        }

        renderTitle();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    /* נחשף לבדיקות ידניות מהקונסולה */
    window.Chavrezim = {
        CREATURES: CREATURES, AREAS: AREAS, state: state,
        makePuzzle: makePuzzle, settle: settle, mood: mood, isAsking: isAsking, needsCare: needsCare
    };

})();

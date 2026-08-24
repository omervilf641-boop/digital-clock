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
        spark:   { label: 'חשמל',  emoji: '⚡', food: '🔋' },
        rare:    { label: 'נדיר',  emoji: '✨', food: '🍰' }
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
          fact: 'חשמלי מטעין את כל הצעצועים בעיר בלחיצת יד.' },

        /* --- נדירים: לא גרים באף אזור, ונפגשים רק במקרה בטיול --- */
        { id: 'zehavhav', nik: 'זְהַבְהָב', name: 'זהבהב', area: 'rare', type: 'rare',
          body: '#ffd54a', belly: '#fff6d4', dark: '#d9a41c', ears: 'pointy', extra: 'antenna',
          fact: 'זהבהב נוצץ בשמש, ולכן קשה מאוד למצוא אותו.' },
        { id: 'kashtoni', nik: 'קַשְׁתּוֹנִי', name: 'קשתוני', area: 'rare', type: 'rare',
          body: '#ff9ad9', belly: '#fff0fa', dark: '#c95bab', ears: 'leaf', pattern: 'stripes',
          fact: 'קשתוני מחליף צבע לפי מצב הרוח, ותמיד בצבעי הקשת.' },
        { id: 'layloni', nik: 'לַיְלוֹנִי', name: 'לילוני', area: 'rare', type: 'rare',
          body: '#5b6bb5', belly: '#dbe3ff', dark: '#39468a', ears: 'floppy', pattern: 'spots',
          fact: 'לילוני ישן כל היום ויוצא לטייל רק כשיש כוכבים.' }
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
     * אביזרים
     *
     * כל אביזר יודע לצייר את עצמו על גוף החברז (מערכת הצירים של
     * creatureSVG), ותופס משבצת אחת: ראש, פנים, צוואר או יד.
     * ============================================================== */

    var COIN = '🐚';

    var ACCESSORIES = [
        { id: 'crown', nik: 'כֶּתֶר', say: 'כתר', slot: 'head', price: 8,
          draw: function () {
              return '<path d="M40 32 L46 14 L53 26 L60 10 L67 26 L74 14 L80 32 Z" ' +
                     'fill="#ffd93d" stroke="#d9ac16" stroke-width="2.5" stroke-linejoin="round"/>' +
                     '<circle cx="60" cy="18" r="3" fill="#ff5f7e"/>';
          } },
        { id: 'cap', nik: 'כּוֹבַע', say: 'כובע', slot: 'head', price: 4,
          draw: function () {
              return '<path d="M36 32 a24 22 0 0 1 48 0 z" fill="#ff5f7e"/>' +
                     '<ellipse cx="60" cy="32" rx="31" ry="5" fill="#d43a5c"/>' +
                     '<circle cx="60" cy="12" r="4" fill="#ffd93d"/>';
          } },
        { id: 'ribbon', nik: 'סֶרֶט', say: 'סרט', slot: 'head', price: 3,
          draw: function () {
              return '<g transform="translate(86 34)">' +
                     '<path d="M0 0 L-14 -8 L-14 8 Z" fill="#ff8fc4"/>' +
                     '<path d="M0 0 L14 -8 L14 8 Z" fill="#ff8fc4"/>' +
                     '<circle cx="0" cy="0" r="5" fill="#e2699d"/></g>';
          } },
        { id: 'flower', nik: 'פֶּרַח', say: 'פרח', slot: 'head', price: 3,
          draw: function () {
              var petals = '';
              for (var i = 0; i < 5; i++) {
                  var a = (i / 5) * Math.PI * 2;
                  petals += '<circle cx="' + (34 + Math.cos(a) * 8).toFixed(1) +
                            '" cy="' + (34 + Math.sin(a) * 8).toFixed(1) +
                            '" r="6" fill="#ffb8d9" stroke="#e2699d" stroke-width="1.2"/>';
              }
              return petals + '<circle cx="34" cy="34" r="5" fill="#ffd93d"/>';
          } },
        { id: 'glasses', nik: 'מִשְׁקָפַיִם', say: 'משקפיים', slot: 'face', price: 6,
          draw: function () {
              return '<g fill="#2b3566" opacity=".88">' +
                     '<rect x="34" y="50" width="24" height="17" rx="8"/>' +
                     '<rect x="62" y="50" width="24" height="17" rx="8"/></g>' +
                     '<rect x="57" y="56" width="6" height="4" fill="#2b3566"/>';
          } },
        { id: 'scarf', nik: 'צָעִיף', say: 'צעיף', slot: 'neck', price: 5,
          draw: function () {
              return '<path d="M38 78 q22 11 44 0 v8 q-22 11 -44 0 z" fill="#4fd6b0"/>' +
                     '<path d="M76 84 q8 10 4 20 l-9 -2 q4 -10 1 -17 z" fill="#3bbd99"/>';
          } },
        { id: 'bowtie', nik: 'עֲנִיבַת פַּרְפַּר', say: 'עניבת פרפר', slot: 'neck', price: 4,
          draw: function () {
              return '<g transform="translate(60 82)">' +
                     '<path d="M0 0 L-13 -8 L-13 8 Z" fill="#a97bff"/>' +
                     '<path d="M0 0 L13 -8 L13 8 Z" fill="#a97bff"/>' +
                     '<circle cx="0" cy="0" r="4.5" fill="#7b4fd6"/></g>';
          } },
        { id: 'balloon', nik: 'בָּלוֹן', say: 'בלון', slot: 'hand', price: 6,
          draw: function () {
              return '<path d="M100 76 q6 -22 -2 -40" stroke="#9aa8c9" stroke-width="2" fill="none"/>' +
                     '<ellipse cx="97" cy="26" rx="13" ry="15" fill="#ff5f7e"/>' +
                     '<ellipse cx="93" cy="21" rx="4" ry="5" fill="#fff" opacity=".55"/>';
          } }
    ];

    /* בובה קטנה, בתיבת צירים 0..60, שאפשר לשתול על גוף החברז */
    function plush(opts) {
        var ears = opts.ears === 'long'
            ? '<ellipse cx="19" cy="9" rx="6" ry="13" fill="' + opts.body + '"/>' +
              '<ellipse cx="41" cy="9" rx="6" ry="13" fill="' + opts.body + '"/>'
            : '<circle cx="15" cy="17" r="9" fill="' + opts.body + '"/>' +
              '<circle cx="45" cy="17" r="9" fill="' + opts.body + '"/>';

        var body = opts.star
            ? '<polygon points="30,8 37,26 56,27 41,38 47,56 30,45 13,56 19,38 4,27 23,26" fill="' + opts.body + '"/>'
            : '<circle cx="30" cy="33" r="20" fill="' + opts.body + '"/>' +
              '<ellipse cx="30" cy="41" rx="11" ry="9" fill="' + opts.belly + '"/>';

        return (opts.star ? '' : ears) + body +
            '<circle cx="24" cy="29" r="3" fill="#1f2a52"/>' +
            '<circle cx="36" cy="29" r="3" fill="#1f2a52"/>' +
            '<path d="M26 37 q4 4 8 0" stroke="' + opts.dark +
            '" stroke-width="2.2" fill="none" stroke-linecap="round"/>';
    }

    /* בובות נמכרות בנפרד, אבל הן אביזר רגיל לכל דבר — משבצת יד */
    var DOLLS = [
        { id: 'doll_teddy',  nik: 'בֻּבַּת דֻּבִּי',   say: 'בובת דובי',  price: 6,
          look: { body: '#c9915f', belly: '#f0dcc4', dark: '#8d5a3b' } },
        { id: 'doll_bunny',  nik: 'בֻּבַּת אַרְנָב',  say: 'בובת ארנב',  price: 6,
          look: { body: '#ffb8d9', belly: '#fff0f7', dark: '#e2699d', ears: 'long' } },
        { id: 'doll_friend', nik: 'בֻּבַּת חַבְרֵז',  say: 'בובת חברז',  price: 7,
          look: { body: '#7ec8ff', belly: '#e8f6ff', dark: '#3a86c9' } },
        { id: 'doll_star',   nik: 'בֻּבַּת כּוֹכָב',  say: 'בובת כוכב',  price: 7,
          look: { body: '#ffd93d', belly: '#fff6cf', dark: '#d9ac16', star: true } }
    ].map(function (doll) {
        doll.slot = 'hand';
        doll.isDoll = true;
        doll.draw = function () {
            return '<g transform="translate(84 58) scale(0.5)">' + plush(doll.look) + '</g>';
        };
        return doll;
    });

    ACCESSORIES = ACCESSORIES.concat(DOLLS);

    var SLOTS = ['head', 'face', 'neck', 'hand'];

    function accessoryById(id) {
        return ACCESSORIES.filter(function (a) { return a.id === id; })[0] || null;
    }

    /* ============================================================== *
     * מצב המשחק
     * ============================================================== */

    var STORE_KEY = 'chavrezim.v1';
    var MAX_PLAYERS = 3;

    /* צלילים והקראה שייכים למכשיר, לא לשחקן */
    var settings = { sound: true, voice: true };

    /* כל שחקן והאי שלו: אוסף, כסף, קניות, חדר ורמת קושי משלו.
       state תמיד מצביע על השחקן הפעיל. */
    var players = [];
    var active = 0;
    var state = blankPlayer();

    function blankPlayer() {
        /* care: לכל חברז שנאסף — כמה הוא שבע, שמח ונח, ומתי נבדק לאחרונה.
           הערכים 1..5. אף פעם לא 0: חברז לא יכול להיות אומלל, רק "צריך אותך". */
        return {
            caught: [], care: {}, hero: null, treasures: {},
            owned: [],      /* אביזרים ותספורות שנקנו */
            worn: {},       /* מה כל חברז לובש: { id: { head: 'crown', ... } } */
            room: []        /* מה מונח על המדף בחדר */
        };
    }

    /* מנקה שמירה אחת, מאיזו גרסה שלא תהיה, לצורה הנוכחית */
    function cleanPlayer(saved) {
        var p = blankPlayer();
        if (!saved || typeof saved !== 'object') return p;

        if (Array.isArray(saved.caught)) {
            p.caught = saved.caught.filter(function (id) { return byId(id); });
        }
        if (saved.care && typeof saved.care === 'object') p.care = saved.care;
        if (saved.hero && typeof saved.hero === 'object') p.hero = saved.hero;
        if (saved.treasures && typeof saved.treasures === 'object') p.treasures = saved.treasures;
        if (Array.isArray(saved.owned)) p.owned = saved.owned;
        if (saved.worn && typeof saved.worn === 'object') p.worn = saved.worn;
        if (Array.isArray(saved.room)) p.room = saved.room;

        /* שמירות מלפני מערכת הטיפול — נותנים להן מצב פתיחה טוב */
        p.caught.forEach(function (id) {
            if (!p.care[id]) p.care[id] = { full: 4, joy: 4, rest: 4, seen: Date.now() };
        });
        return p;
    }

    function load() {
        var saved = null;
        try {
            saved = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
        } catch (err) {
            /* אחסון חסום או פגום — משחקים בלי שמירה */
        }

        if (saved && typeof saved.sound === 'boolean') settings.sound = saved.sound;
        if (saved && typeof saved.voice === 'boolean') settings.voice = saved.voice;

        if (saved && Array.isArray(saved.players)) {
            players = saved.players.slice(0, MAX_PLAYERS).map(cleanPlayer);
            active = Math.min(Math.max(saved.active | 0, 0), Math.max(players.length - 1, 0));
        } else if (saved) {
            /* שמירה מלפני שהיו פרופילים — הופכת לשחקן הראשון */
            players = [cleanPlayer(saved)];
            active = 0;
        }

        if (!players.length) players = [];
        state = players[active] || blankPlayer();
    }

    function save() {
        try {
            localStorage.setItem(STORE_KEY, JSON.stringify({
                players: players, active: active,
                sound: settings.sound, voice: settings.voice
            }));
        } catch (err) { /* לא נורא */ }
    }

    function switchTo(i) {
        active = i;
        state = players[i];
        save();
    }

    function addPlayer() {
        players.push(blankPlayer());
        switchTo(players.length - 1);
    }

    function byId(id) {
        return CREATURES.filter(function (c) { return c.id === id; })[0] || null;
    }

    function inArea(areaId) {
        return CREATURES.filter(function (c) { return c.area === areaId; });
    }

    function isRare(c) { return c.area === 'rare'; }

    function rarePool() {
        return CREATURES.filter(function (c) { return isRare(c) && !isCaught(c.id); });
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

    /* מה שהחברז לובש, מצויר מעל הגוף */
    function outfitSVG(c) {
        var worn = c.fixedOutfit || state.worn[c.id];
        if (!worn) return '';
        return SLOTS.map(function (slot) {
            var item = worn[slot] && accessoryById(worn[slot]);
            return item ? item.draw() : '';
        }).join('');
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
            outfitSVG(c) +
        '</svg>';
    }

    /* ============================================================== *
     * הדמות שלכם
     * ============================================================== */

    var LOOKS = {
        skin:  ['#f7d7c4', '#eab68f', '#c78a5e', '#8d5a3b'],
        hair:  ['short', 'long', 'curly', 'ponytail', 'bun', 'spiky', 'braids', 'wavy'],
        color: ['#3b2a20', '#7a4a24', '#d9a441', '#e86a4a', '#5b4a8f', '#3f9ad9'],
        shirt: ['#ff8fc4', '#4ea9ff', '#4fd6b0', '#ffd93d', '#a97bff', '#ff7a59']
    };

    /* התספורות האחרונות נמכרות בחנות */
    var HAIR_SHOP = {
        spiky:  { nik: 'תִּסְפֹּרֶת קוֹצִים', say: 'תספורת קוצים', price: 5 },
        braids: { nik: 'צַמּוֹת',            say: 'צמות',          price: 5 },
        wavy:   { nik: 'שֵׂעָר גַּלִּי',       say: 'שיער גלי',      price: 6 }
    };

    function hairLocked(index) {
        var style = LOOKS.hair[index];
        return !!HAIR_SHOP[style] && !owns('hair:' + style);
    }

    function defaultHero() {
        return { name: 'חָבֵר', skin: 0, hair: 0, color: 0, shirt: 0 };
    }

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

    function heroName() {
        return (state.hero && state.hero.name) || 'חָבֵר';
    }

    /* ============================================================== *
     * צליל ודיבור
     * ============================================================== */

    var audio = null;

    function ac() {
        if (!settings.sound) return null;
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
        if (!settings.voice || !('speechSynthesis' in window)) return;
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
        who:   'screenWho',
        title: 'screenTitle',
        hero:  'screenHero',
        map:   'screenMap',
        play:  'screenPlay',
        walk:  'screenWalk',
        shop:  'screenShop',
        room:  'screenRoom',
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
        if (name === 'hero') renderHero();
        if (name === 'who') renderWho();
        if (name === 'shop') renderShop();
        if (name === 'room') renderRoom();
        if (name !== 'walk') stopWalk();
    }

    /* ============================================================== *
     * מסך פתיחה
     * ============================================================== */

    function renderTitle() {
        var stars = sample(CREATURES, 2);
        $('titleArt').innerHTML = (state.hero ? heroSVG(state.hero, 'is-hero') : '') +
            stars.map(function (c) { return creatureSVG(c); }).join('');
        $('heroBtnLabel').textContent = state.hero ? heroName() : 'הַדְּמוּת שֶׁלִּי';
        $('soundBtn').setAttribute('aria-pressed', String(settings.sound));
        $('voiceBtn').setAttribute('aria-pressed', String(settings.voice));
    }

    /* ============================================================== *
     * התקנה למסך הבית
     *
     * כרום מציע התקנה לפי שיקולים משלו, ולפעמים פשוט לא מציע. אז אנחנו
     * תופסים את האירוע ומציגים כפתור משלנו במסך הפתיחה — בעברית, בגודל
     * שילד רואה. כשאין אירוע (המשחק כבר מותקן, או דפדפן שלא תומך)
     * הכפתור פשוט לא מופיע ושום דבר אחר לא משתנה.
     * ============================================================== */

    var installPrompt = null;

    function installed() {
        return window.matchMedia('(display-mode: standalone)').matches ||
               window.navigator.standalone === true;
    }

    function showInstall(on) {
        var btn = $('installBtn');
        if (btn) btn.hidden = !on;
    }

    function watchInstall() {
        window.addEventListener('beforeinstallprompt', function (event) {
            event.preventDefault();      /* לא נותנים לכרום להחליט מתי */
            installPrompt = event;
            if (!installed()) showInstall(true);
        });

        window.addEventListener('appinstalled', function () {
            installPrompt = null;
            showInstall(false);
            say('המשחק הותקן! אפשר לפתוח אותו מהמסך הראשי');
        });

        $('installBtn').addEventListener('click', function () {
            if (!installPrompt) return;
            sfx.tap();
            installPrompt.prompt();
            installPrompt.userChoice.then(function () {
                installPrompt = null;
                showInstall(false);
            });
        });
    }

    /* ============================================================== *
     * מי משחק
     *
     * עד שלושה שחקנים על אותו מכשיר. לכל אחד אוסף, כסף, קניות, חדר
     * ורמת קושי משלו — כדי ששני אחים לא ידרסו זה את זה.
     * ============================================================== */

    /* מי שנפתח ואז ננטש לפני שנבנתה לו דמות לא נשאר תקוע ברשימה */
    function prunePlayers() {
        var keep = players.filter(function (p) { return p.hero; });
        if (keep.length === players.length) return;
        var current = players[active];
        players = keep;
        active = Math.max(0, players.indexOf(current));
        state = players[active] || blankPlayer();
        save();
    }

    function renderWho() {
        prunePlayers();
        var grid = $('whoGrid');
        grid.innerHTML = '';

        players.forEach(function (p, i) {
            var card = document.createElement('button');
            card.type = 'button';
            card.className = 'who-card' + (i === active ? ' is-active' : '');

            var count = p.caught.length;
            card.innerHTML = heroSVG(p.hero) +
                '<span class="who-name">' + ((p.hero && p.hero.name) || 'חָבֵר') + '</span>' +
                '<span class="who-count">' + count + ' ' + (count === 1 ? 'חָבֵר' : 'חֲבֵרִים') + ' ⭐</span>';

            card.addEventListener('click', function () {
                sfx.page();
                switchTo(i);
                say('שלום, ' + ((p.hero && p.hero.name) || 'חבר').replace(/[֑-ׇ]/g, ''));
                show('title');
            });
            grid.appendChild(card);
        });

        if (players.length < MAX_PLAYERS) {
            var add = document.createElement('button');
            add.type = 'button';
            add.className = 'who-card who-add';
            add.innerHTML = '<span class="who-plus" aria-hidden="true">＋</span>' +
                            '<span class="who-name">שַׂחְקָן חָדָשׁ</span>';
            add.addEventListener('click', function () {
                sfx.page();
                addPlayer();
                draftHero = null;
                say('בואו נבנה דמות חדשה');
                show('hero');
            });
            grid.appendChild(add);
        }
    }

    /* ============================================================== *
     * מסך יצירת הדמות
     * ============================================================== */

    var draftHero = null;

    function renderHero() {
        if (!draftHero) draftHero = state.hero ? JSON.parse(JSON.stringify(state.hero)) : defaultHero();
        if (hairLocked(draftHero.hair)) draftHero.hair = 0;

        $('heroPreview').innerHTML = heroSVG(draftHero);
        var input = $('heroName');
        if (input.value !== draftHero.name) input.value = draftHero.name;

        var rows = [
            { key: 'skin',  nik: 'צֶבַע הָעוֹר',  kind: 'swatch', list: LOOKS.skin },
            { key: 'hair',  nik: 'הַתִּסְפֹּרֶת',   kind: 'hair',   list: LOOKS.hair },
            { key: 'color', nik: 'צֶבַע הַשֵּׂעָר', kind: 'swatch', list: LOOKS.color },
            { key: 'shirt', nik: 'הַחֻלְצָה',      kind: 'swatch', list: LOOKS.shirt }
        ];

        var box = $('heroPickers');
        box.innerHTML = '';
        rows.forEach(function (row) {
            var wrap = document.createElement('div');
            wrap.className = 'picker';
            wrap.innerHTML = '<p class="picker-label">' + row.nik + '</p>';

            var opts = document.createElement('div');
            opts.className = 'picker-opts';

            row.list.forEach(function (value, i) {
                var btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'opt' + (draftHero[row.key] === i ? ' is-on' : '');

                if (row.kind === 'swatch') {
                    btn.innerHTML = '<span class="swatch" style="background:' + value + '"></span>';
                    btn.setAttribute('aria-label', row.nik + ' ' + (i + 1));
                } else {
                    /* תצוגה מוקטנת של התספורת עצמה, לא שם באנגלית */
                    var locked = hairLocked(i);
                    if (locked) btn.classList.add('is-locked');
                    btn.innerHTML = '<svg viewBox="0 0 100 80" class="hair-ico">' +
                        '<circle cx="50" cy="50" r="26" fill="' + LOOKS.skin[draftHero.skin] + '"/>' +
                        hairSVG(value, LOOKS.color[draftHero.color]) + '</svg>' +
                        (locked ? '<span class="lock-pin">🔒</span>' : '');
                    btn.setAttribute('aria-label', 'תספורת ' + (i + 1) + (locked ? ', נמכרת בחנות' : ''));
                }

                btn.addEventListener('click', function () {
                    if (row.kind === 'hair' && hairLocked(i)) {
                        sfx.oops();
                        var info = HAIR_SHOP[LOOKS.hair[i]];
                        say(info.say + ' נמכרת בחנות של צדפוני, ב' + info.price + ' צדפים');
                        return;
                    }
                    draftHero[row.key] = i;
                    sfx.tap();
                    renderHero();
                });
                opts.appendChild(btn);
            });

            wrap.appendChild(opts);
            box.appendChild(wrap);
        });
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
        renderBag();
    }

    /* צדפים הם הכסף של האי */
    function coins() { return state.treasures[COIN] || 0; }

    function spend(n) {
        state.treasures[COIN] = Math.max(0, coins() - n);
        save();
    }

    function owns(id) { return state.owned.indexOf(id) !== -1; }

    /* מה שאספתם בטיולים */
    function renderBag() {
        var kinds = Object.keys(state.treasures).filter(function (e) { return state.treasures[e] > 0; });
        $('bagLine').innerHTML = kinds.length
            ? '🎒 ' + kinds.map(function (e) {
                  return '<span class="bag-item">' + e + '<b>' + state.treasures[e] + '</b></span>';
              }).join('')
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
        var names = (area && area.puzzles) || Object.keys(MAKERS);
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

        current = {
            area: area, creature: creature, puzzle: makePuzzle(area),
            solved: false, replay: replay, left: 1
        };

        $('areaName').textContent = area.nik;
        $('catchZone').hidden = true;

        var slot = $('creatureSlot');
        slot.className = 'creature-slot';
        slot.innerHTML = creatureSVG(creature);

        var hello = replay
            ? 'שָׁלוֹם שׁוּב! פִּתְרוּ חִידָה וַאֲנִי אֶתֵּן לָכֶם צְדָפִים.'
            : 'הַיי! אֲנִי ' + creature.nik + '!';
        $('speech').textContent = hello;

        show('play');
        renderPuzzle();

        var line = replay
            ? 'שלום שוב! פתרו חידה ואני אתן לכם צדפים. ' + current.puzzle.speak
            : 'היי! אני ' + creature.name + '. ' + current.puzzle.speak;
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
        if (choicesBox.classList.contains('is-waiting')) return;

        if (!choice.correct) {
            /* אין עונש, אין הפסד — רק עידוד */
            sfx.oops();
            btn.classList.add('is-wrong');
            btn.disabled = true;
            $('creatureSlot').className = 'creature-slot is-shy';
            var nudge = pick(['כִּמְעַט! נַסּוּ עוֹד פַּעַם 😊', 'לֹא נוֹרָא, נַסּוּ שׁוּב!', 'עוֹד נִסָּיוֹן קָטָן!']);
            $('speech').textContent = nudge;
            say(nudge.replace(/[֑-ׇ]/g, ''));
            setTimeout(function () { $('creatureSlot').className = 'creature-slot'; }, 600);
            return;
        }

        sfx.good();
        btn.classList.add('is-right');
        Array.prototype.forEach.call(choicesBox.children, function (node) { node.disabled = true; });
        $('creatureSlot').className = 'creature-slot is-happy';

        current.left--;

        /* חברז נדיר מבקש שתי חידות, לא אחת */
        if (current.left > 0) {
            confetti(12);
            $('speech').textContent = 'יָפֶה! וְעוֹד חִידָה אַחַת אַחֲרוֹנָה...';
            say('יפה מאוד! ועוד חידה אחת אחרונה');
            setTimeout(function () {
                current.puzzle = makePuzzle(current.area);
                renderPuzzle();
                say(current.puzzle.speak);
            }, 1400);
            return;
        }

        current.solved = true;
        confetti(18);

        /* אזור שכבר הושלם משלם בצדפים — כך שכל שבעת המקומות נשארים חיים */
        if (current.replay) {
            var reward = rand(2, 3);
            state.treasures[COIN] = coins() + reward;
            cheer(current.creature.id);
            save();
            sfx.star();
            $('speech').textContent = 'יֵשׁ! קִבַּלְתֶּם ' + reward + ' צְדָפִים 🐚';
            say('יש! נכון מאוד. קיבלתם ' + reward + ' צדפים');
            showAfterVisit();
            return;
        }

        $('speech').textContent = 'יֵשׁ! נָכוֹן מְאוֹד!';
        $('catchZone').hidden = false;
        say('יש! נכון מאוד. עכשיו זרקו את כוכב החברות');
        setTimeout(function () {
            $('catchZone').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 300);
    }

    function showAfterVisit() {
        var box = $('puzzle');
        box.innerHTML = '';

        var again = document.createElement('button');
        again.type = 'button';
        again.className = 'big-btn';
        again.innerHTML = '<span class="btn-emoji">🐚</span> עוֹד חִידָה';
        again.addEventListener('click', function () { sfx.tap(); startEncounter(current.area); });

        var toMap = document.createElement('button');
        toMap.type = 'button';
        toMap.className = 'big-btn ghost-btn';
        toMap.innerHTML = '<span class="btn-emoji">🗺️</span> לַמַּפָּה';
        toMap.addEventListener('click', function () { sfx.page(); show('map'); });

        var toShop = document.createElement('button');
        toShop.type = 'button';
        toShop.className = 'big-btn ghost-btn';
        toShop.innerHTML = '<span class="btn-emoji">🏪</span> לַחֲנוּת';
        toShop.addEventListener('click', function () { sfx.page(); show('shop'); });

        box.appendChild(again);
        box.appendChild(toMap);
        box.appendChild(toShop);
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

        var rare = isRare(current.creature);

        var again = document.createElement('button');
        again.type = 'button';
        again.className = 'big-btn';
        if (rare) {
            /* נדיר נפגש רק במקרה בטיול — אין "עוד אחד" ליד */
            again.innerHTML = '<span class="btn-emoji">🚶</span> עוֹד טִיּוּל';
            again.addEventListener('click', function () { sfx.tap(); openWalkPicker(); });
        } else {
            again.innerHTML = '<span class="btn-emoji">✨</span> עוֹד חָבֵר!';
            again.addEventListener('click', function () { sfx.tap(); startEncounter(current.area); });
        }

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
     * החנות של צדפוני
     *
     * צדפים שנאספו בטיולים הם הכסף. אין חוב, אין עונש על קנייה,
     * וכל דבר שנקנה נשאר לתמיד.
     * ============================================================== */

    /* בובת תצוגה ניטרלית, כדי לראות איך האביזר נראה על חברז */
    var MANNEQUIN = {
        id: '__shop__', name: 'בובה', nik: 'בּוּבָּה', type: 'water',
        body: '#cfd8ee', belly: '#eef2ff', dark: '#9aa8c9', ears: 'round'
    };

    /* המוכר: חברז ותיק עם כובע */
    var SHOPKEEPER = {
        id: '__keeper__', name: 'צדפוני', nik: 'צִדְפּוֹנִי', type: 'water',
        body: '#8fd6c4', belly: '#e9fbf6', dark: '#46a58e', ears: 'floppy',
        fixedOutfit: { head: 'cap', neck: 'bowtie' }
    };

    function previewSVG(item) {
        return '<svg viewBox="0 0 120 120" class="wear-preview" aria-hidden="true">' +
            '<ellipse cx="28" cy="34" rx="15" ry="15" fill="' + MANNEQUIN.body + '"/>' +
            '<ellipse cx="92" cy="34" rx="15" ry="15" fill="' + MANNEQUIN.body + '"/>' +
            '<ellipse cx="60" cy="68" rx="36" ry="34" fill="' + MANNEQUIN.body + '"/>' +
            '<ellipse cx="60" cy="84" rx="21" ry="15" fill="' + MANNEQUIN.belly + '"/>' +
            '<circle cx="47" cy="59" r="5" fill="#1f2a52"/>' +
            '<circle cx="75" cy="59" r="5" fill="#1f2a52"/>' +
            '<path d="M50 72 q10 9 20 0" stroke="' + MANNEQUIN.dark +
            '" stroke-width="3" fill="none" stroke-linecap="round"/>' +
            item.draw() +
        '</svg>';
    }

    function renderShop() {
        $('purse').textContent = COIN + coins();
        $('shopkeeper').innerHTML = creatureSVG(SHOPKEEPER);

        var line = coins() >= 3
            ? 'שָׁלוֹם! יֵשׁ לָכֶם ' + coins() + ' צְדָפִים. מָה בּוֹחֲרִים?'
            : 'שָׁלוֹם! צְאוּ לְטִיּוּל וְאִסְפוּ צְדָפִים, וְאָז נִסְתַּדֵּר.';
        $('shopSpeech').textContent = line;

        buildShelf($('shelfWear'), 'אֲבִיזָרִים לַחֲבֵרִים', ACCESSORIES.filter(function (item) {
            return !item.isDoll;
        }).map(function (item) {
            return {
                key: item.id,
                nik: item.nik,
                say: item.say,
                price: item.price,
                art: previewSVG(item)
            };
        }));

        buildShelf($('shelfDolls'), 'בֻּבּוֹת', DOLLS.map(function (item) {
            return { key: item.id, nik: item.nik, say: item.say, price: item.price, art: previewSVG(item) };
        }));

        buildShelf($('shelfHair'), 'תִּסְפֹּרֶת בִּשְׁבִילִי', Object.keys(HAIR_SHOP).map(function (style) {
            var info = HAIR_SHOP[style];
            var hero = state.hero || defaultHero();
            return {
                key: 'hair:' + style,
                nik: info.nik,
                say: info.say,
                price: info.price,
                art: '<svg viewBox="0 0 100 90" class="wear-preview">' +
                     '<circle cx="50" cy="50" r="26" fill="' + LOOKS.skin[hero.skin] + '"/>' +
                     '<circle cx="41" cy="52" r="4" fill="#1f2a52"/>' +
                     '<circle cx="59" cy="52" r="4" fill="#1f2a52"/>' +
                     hairSVG(style, LOOKS.color[hero.color]) + '</svg>'
            };
        }));
    }

    function buildShelf(box, title, items) {
        box.innerHTML = '<h2 class="shelf-title">' + title + '</h2>';

        var grid = document.createElement('div');
        grid.className = 'shelf-grid';

        items.forEach(function (item) {
            var have = owns(item.key);
            var afford = coins() >= item.price;

            var card = document.createElement('button');
            card.type = 'button';
            card.className = 'shop-card' + (have ? ' is-owned' : (afford ? '' : ' is-dear'));
            card.innerHTML = item.art +
                '<span class="shop-name">' + item.nik + '</span>' +
                '<span class="shop-price">' + (have ? '✔ יֵשׁ לָכֶם' : COIN + ' ' + item.price) + '</span>';
            card.setAttribute('aria-label', item.say + (have ? ', כבר שלכם' : ', ' + item.price + ' צדפים'));

            card.addEventListener('click', function () { buy(item, have); });
            grid.appendChild(card);
        });

        box.appendChild(grid);
    }

    function buy(item, have) {
        if (have) {
            sfx.tap();
            $('shopSpeech').textContent = 'זֶה כְּבָר שֶׁלָּכֶם! תִּלְבְּשׁוּ אוֹתוֹ אֵצֶל הַחֲבֵרִים.';
            say('זה כבר שלכם. תלבישו אותו אצל החברים');
            return;
        }

        if (coins() < item.price) {
            /* לא נזיפה — רק כמה עוד חסר */
            sfx.oops();
            var missing = item.price - coins();
            $('shopSpeech').textContent = 'חָסֵר עוֹד ' + missing + ' ' +
                (missing === 1 ? 'צֶדֶף' : 'צְדָפִים') + '. צְאוּ לְטִיּוּל!';
            say('חסר עוד ' + missing + (missing === 1 ? ' צדף' : ' צדפים') + '. צאו לטיול');
            return;
        }

        spend(item.price);
        state.owned.push(item.key);
        save();
        sfx.good();
        confetti(22);
        $('shopSpeech').textContent = 'קָנִיתֶם ' + item.nik + '! תֵּהָנוּ.';
        say('קניתם ' + item.say);
        renderShop();
    }

    /* ============================================================== *
     * החדר
     *
     * מה שנאסף בטיולים היה מספר קטן במפה. כאן מניחים אותו על מדף.
     * הנחה בהקשה, הורדה בהקשה — בלי גרירה, שילד בן חמש לא נלחם בממשק.
     * ============================================================== */

    var SHELF_SLOTS = 8;

    /* כל מה שאפשר להניח: מזכרות מטיולים ובובות שנקנו */
    function roomStock() {
        var stock = [];

        Object.keys(state.treasures).forEach(function (emoji) {
            if (emoji === COIN) return;      /* צדפים הם כסף, לא קישוט */
            var have = state.treasures[emoji];
            var placed = state.room.filter(function (x) { return x === emoji; }).length;
            var treasure = TREASURES.filter(function (t) { return t.emoji === emoji; })[0];
            if (have - placed > 0 && treasure) {
                stock.push({ key: emoji, nik: treasure.nik, say: treasure.say,
                             left: have - placed, html: emoji });
            }
        });

        DOLLS.forEach(function (doll) {
            if (!owns(doll.id)) return;
            if (state.room.indexOf(doll.id) !== -1) return;   /* בובה אחת, מקום אחד */
            stock.push({ key: doll.id, nik: doll.nik, say: doll.say, left: 1,
                         html: '<svg viewBox="0 0 60 60" class="doll-ico">' + plush(doll.look) + '</svg>' });
        });

        return stock;
    }

    function shelfArt(key) {
        var doll = DOLLS.filter(function (d) { return d.id === key; })[0];
        return doll
            ? '<svg viewBox="0 0 60 60" class="doll-ico">' + plush(doll.look) + '</svg>'
            : key;
    }

    function renderRoom() {
        $('roomTitle').textContent = 'הַחֶדֶר שֶׁל ' + heroName();
        $('roomHero').innerHTML = heroSVG(state.hero);

        var shelf = $('roomShelf');
        shelf.innerHTML = '';
        for (var i = 0; i < SHELF_SLOTS; i++) {
            (function (slot) {
                var cell = document.createElement('button');
                cell.type = 'button';
                cell.className = 'shelf-slot' + (state.room[slot] ? ' is-full' : '');
                cell.innerHTML = state.room[slot] ? shelfArt(state.room[slot]) : '';
                cell.setAttribute('aria-label', state.room[slot] ? 'להוריד מהמדף' : 'מקום פנוי');

                cell.addEventListener('click', function () {
                    if (!state.room[slot]) return;
                    state.room[slot] = null;          /* הקשה מורידה בחזרה למגירה */
                    save();
                    sfx.tap();
                    renderRoom();
                });
                shelf.appendChild(cell);
            })(i);
        }

        var stock = roomStock();
        var tray = $('roomTray');
        tray.innerHTML = '';

        $('roomHint').textContent = stock.length
            ? 'לַחֲצוּ עַל דָּבָר כְּדֵי לְהָנִיחַ אוֹתוֹ עַל הַמַּדָּף'
            : (state.room.filter(Boolean).length
                ? 'הַכֹּל מֻנָּח! לַחֲצוּ עַל חֵפֶץ בַּמַּדָּף כְּדֵי לְהוֹרִיד אוֹתוֹ.'
                : 'צְאוּ לְטִיּוּל וְאִסְפוּ דְּבָרִים יָפִים לַחֶדֶר.');

        stock.forEach(function (item) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'tray-item';
            btn.innerHTML = item.html + (item.left > 1 ? '<b>' + item.left + '</b>' : '');
            btn.setAttribute('aria-label', item.say);

            btn.addEventListener('click', function () {
                var free = -1;
                for (var k = 0; k < SHELF_SLOTS; k++) {
                    if (!state.room[k]) { free = k; break; }
                }
                if (free === -1) {
                    sfx.oops();
                    $('roomHint').textContent = 'הַמַּדָּף מָלֵא. הוֹרִידוּ מַשֶּׁהוּ קֹדֶם.';
                    say('המדף מלא. תורידו משהו קודם');
                    return;
                }
                state.room[free] = item.key;
                save();
                sfx.tap();
                say(item.say + ' על המדף');
                renderRoom();
            });
            tray.appendChild(btn);
        });
    }

    /* ============================================================== *
     * הטיול
     *
     * אתם והחברז שבחרתם הולכים יחד, דברים חמודים חולפים על פניכם,
     * ולוחצים על מה שרוצים לאסוף. אי אפשר לפספס ואי אפשר להפסיד:
     * דבר שלא נלחץ פשוט ממשיך הלאה, ואפשר לחזור הביתה בכל רגע.
     * ============================================================== */

    var TREASURES = [
        { emoji: '🌼', nik: 'פֶּרַח',    say: 'פרח' },
        { emoji: '🐚', nik: 'צֶדֶף',     say: 'צדף' },
        { emoji: '🦋', nik: 'פַּרְפַּר',   say: 'פרפר' },
        { emoji: '🍓', nik: 'תּוּת',     say: 'תות' },
        { emoji: '🍄', nik: 'פִּטְרִיָּה', say: 'פטריה' },
        { emoji: '⭐', nik: 'כּוֹכָב',    say: 'כוכב' },
        { emoji: '🪶', nik: 'נוֹצָה',    say: 'נוצה' },
        { emoji: '🐞', nik: 'חִפּוּשִׁית', say: 'חיפושית' },
        { emoji: '🌰', nik: 'עֲרְמוֹן',  say: 'ערמון' },
        { emoji: '💎', nik: 'גָּבִישׁ',   say: 'גביש' }
    ];

    var walk = { on: false, id: null, found: [], timer: null, chatter: null, rareAt: -1, seen: 0 };

    /* בוחרים חברז לטיול */
    function openWalkPicker() {
        if (!state.caught.length) {
            sfx.oops();
            say('קודם צריך למצוא חבר אחד. בואו נצא לטייל באי');
            return;
        }

        var box = $('mapGrid');
        show('map');
        box.innerHTML = '';
        $('scoreLine').textContent = 'עִם מִי יוֹצְאִים לְטִיּוּל?';
        $('careLine').textContent = '';

        state.caught.forEach(function (id) {
            var c = byId(id);
            var card = document.createElement('button');
            card.type = 'button';
            card.className = 'area-card';
            card.innerHTML = creatureSVG(c) + '<span class="area-label">' + c.nik + '</span>';
            card.addEventListener('click', function () { sfx.page(); startWalk(id); });
            box.appendChild(card);
        });

        var back = document.createElement('button');
        back.type = 'button';
        back.className = 'area-card';
        back.innerHTML = '<span class="area-emoji">🗺️</span><span class="area-label">חֲזָרָה</span>';
        back.addEventListener('click', function () { sfx.page(); renderMap(); });
        box.appendChild(back);

        say('עם מי יוצאים לטיול?');
    }

    function startWalk(id) {
        walk = { on: true, id: id, found: [], timer: null, chatter: null, rareAt: -1, seen: 0 };
        var c = byId(id);

        $('walkTitle').textContent = 'טִיּוּל עִם ' + c.nik;
        $('walkCount').textContent = '';
        $('walkEnd').innerHTML = '';
        $('walkItems').innerHTML = '';
        $('walkScene').classList.remove('is-picnic');
        $('walkers').classList.remove('is-sitting');
        var oldSpread = $('walkScene').querySelector('.picnic');
        if (oldSpread) oldSpread.remove();
        $('walkers').innerHTML =
            '<span class="walker walker-hero">' + heroSVG(state.hero) + '</span>' +
            '<span class="walker walker-pet">' + creatureSVG(c) + '</span>';
        $('walkSpeech').textContent = 'יָאלְלָה, הוֹלְכִים!';

        show('walk');
        say('יאללה, הולכים! תלחצו על מה שרוצים לאסוף');

        rollRare();
        walk.timer = setInterval(spawnTreasure, 1900);
        walk.chatter = setInterval(walkChatter, 9000);
        setTimeout(spawnTreasure, 700);
    }

    function stopWalk() {
        if (walk.timer) clearInterval(walk.timer);
        if (walk.chatter) clearInterval(walk.chatter);
        walk.timer = walk.chatter = null;
        walk.on = false;
    }

    function walkChatter() {
        if (!walk.on) return;
        var c = byId(walk.id);
        var lines = [
            'כָּאן יָפֶה!',
            'תִּרְאוּ מָה שָׁם!',
            'אֲנִי אוֹהֵב לְטַיֵּל אִתְּכֶם.',
            'עוֹד קְצָת וְנַגִּיעַ לַפִּיקְנִיק!'
        ];
        var line = pick(lines);
        $('walkSpeech').textContent = c.nik + ': ' + line;
        say(line.replace(/[֑-ׇ]/g, ''));
    }

    var RARE_CHANCE = 0.10;

    /* ההגרלה היא פעם אחת לכל טיול, לא לכל הופעה — עשרה אחוזים שהטיול
       הזה הוא הטיול שבו פוגשים נדיר. אם כן, מגרילים גם באיזה רגע בדיוק. */
    function rollRare() {
        walk.rareAt = (Math.random() < RARE_CHANCE && rarePool().length) ? rand(2, 6) : -1;
        walk.seen = 0;
    }

    function spawnTreasure() {
        if (!walk.on) return;

        walk.seen++;
        if (walk.seen === walk.rareAt && rarePool().length) {
            spawnRare();
            return;
        }

        /* צדפים הם הכסף, אז הם נופלים תכופות יותר משאר המזכרות */
        var treasure = Math.random() < 0.42
            ? TREASURES.filter(function (t) { return t.emoji === COIN; })[0]
            : pick(TREASURES);
        var node = document.createElement('button');
        node.type = 'button';
        node.className = 'treasure';
        node.textContent = treasure.emoji;
        node.setAttribute('aria-label', treasure.say);
        node.style.bottom = rand(18, 58) + '%';
        node.style.animationDuration = rand(52, 70) / 10 + 's';

        node.addEventListener('click', function () {
            if (node.classList.contains('is-taken')) return;
            node.classList.add('is-taken');
            collect(treasure);
        });

        /* מה שלא נלחץ פשוט ממשיך הלאה. אין הפסד. */
        node.addEventListener('animationend', function () { node.remove(); });

        $('walkItems').appendChild(node);
    }

    function spawnRare() {
        var creature = pick(rarePool());

        var node = document.createElement('button');
        node.type = 'button';
        node.className = 'treasure rare-sighting';
        node.innerHTML = '<span class="sparkle">✨</span>' + creatureSVG(creature);
        node.setAttribute('aria-label', 'חברז נדיר');
        node.style.bottom = rand(24, 44) + '%';
        node.style.animationDuration = '9s';        /* איטי, שיהיה זמן להבחין */

        node.addEventListener('click', function () {
            if (node.classList.contains('is-taken')) return;
            node.classList.add('is-taken');
            meetRare(creature);
        });
        node.addEventListener('animationend', function () { node.remove(); });

        sfx.star();
        $('walkSpeech').textContent = 'מָה זֶה שָׁם?! מַשֶּׁהוּ נוֹצֵץ...';
        say('מה זה שם? משהו נוצץ! מהרו ולחצו עליו');

        $('walkItems').appendChild(node);
    }

    /* פגישה עם נדיר: אותו מסך, אבל שתי חידות במקום אחת */
    function meetRare(creature) {
        stopWalk();

        current = {
            area: { id: 'rare', nik: 'מִפְגָּשׁ נָדִיר', name: 'מפגש נדיר', puzzles: null },
            creature: creature, puzzle: makePuzzle(null),
            solved: false, replay: false, left: 2
        };

        $('areaName').textContent = '✨ מִפְגָּשׁ נָדִיר ✨';
        $('catchZone').hidden = true;

        var slot = $('creatureSlot');
        slot.className = 'creature-slot';
        slot.innerHTML = creatureSVG(creature);

        $('speech').textContent = 'אֲנִי ' + creature.nik + ', וַאֲנִי נָדִיר מְאוֹד! ' +
                                  'פִּתְרוּ שְׁתֵּי חִידוֹת וְאָבוֹא אִתְּכֶם.';
        show('play');
        renderPuzzle();
        confetti(24);
        say('אני ' + creature.name + ', ואני נדיר מאוד! פתרו שתי חידות ואבוא איתכם. ' +
            current.puzzle.speak);
    }

    function collect(treasure) {
        walk.found.push(treasure);
        state.treasures[treasure.emoji] = (state.treasures[treasure.emoji] || 0) + 1;

        sfx.tap();
        tone(880, 0, 0.16, 'triangle', 0.14);
        tone(1319, 0.08, 0.22, 'sine', 0.12);

        $('walkCount').textContent = walk.found.length ? '🎒' + walk.found.length : '';
        $('walkSpeech').textContent = 'מָצָאתֶם ' + treasure.nik + '!';
        say('מצאתם ' + treasure.say);

        /* כל שני ממצאים משמחים את החברז */
        if (walk.found.length % 2 === 0) cheer(walk.id);
        save();

        if (walk.found.length >= 6) endWalk(true);
    }

    /* פורסים שמיכה, מוציאים סל, ומתיישבים */
    function layPicnic(c) {
        var scene = $('walkScene');
        scene.classList.add('is-picnic');

        var spread = document.createElement('div');
        spread.className = 'picnic';
        spread.innerHTML =
            '<div class="blanket"></div>' +
            '<div class="basket" aria-hidden="true">🧺</div>' +
            '<div class="picnic-food" aria-hidden="true">' +
            ['🍉', '🥪', '🍇', '🧃', '🍪'].map(function (food, i) {
                return '<span style="animation-delay:' + (i * 0.12) + 's">' + food + '</span>';
            }).join('') +
            '</div>';
        scene.appendChild(spread);

        /* היושבים עוברים למרכז ומפסיקים לצעוד */
        var walkers = $('walkers');
        walkers.classList.add('is-sitting');
        walkers.innerHTML =
            '<span class="walker walker-hero">' + heroSVG(state.hero) + '</span>' +
            '<span class="walker walker-pet">' + creatureSVG(c) + '</span>';
    }

    function endWalk(arrived) {
        if (!walk.on) return;
        stopWalk();

        var c = byId(walk.id);
        $('walkItems').innerHTML = '';
        confetti(arrived ? 34 : 12);
        if (arrived) sfx.good();

        if (arrived) {
            state.treasures[COIN] = coins() + 2;   /* בונוס הגעה, כדי שכל טיול משתלם */
            feed(walk.id, 2);                      /* בפיקניק באמת אוכלים */
            save();
            layPicnic(c);
        }

        var line = arrived
            ? 'פִּיקְנִיק! אָכַלְנוּ יַחַד וְקִבַּלְתֶּם 2 צְדָפִים.'
            : 'טִיּוּל נָעִים, תּוֹדָה!';
        $('walkSpeech').textContent = c.nik + ': ' + line;
        say(line.replace(/[֑-ׇ]/g, ''));

        var box = $('walkEnd');
        box.innerHTML = '';

        if (walk.found.length) {
            var bag = document.createElement('p');
            bag.className = 'walk-bag';
            bag.innerHTML = '🎒 ' + walk.found.map(function (t) { return t.emoji; }).join(' ');
            box.appendChild(bag);
        }

        var again = document.createElement('button');
        again.type = 'button';
        again.className = 'big-btn';
        again.innerHTML = '<span class="btn-emoji">🚶</span> עוֹד טִיּוּל';
        again.addEventListener('click', function () { sfx.page(); startWalk(walk.id); });

        var home = document.createElement('button');
        home.type = 'button';
        home.className = 'big-btn ghost-btn';
        home.innerHTML = '<span class="btn-emoji">🗺️</span> לַמַּפָּה';
        home.addEventListener('click', function () { sfx.page(); show('map'); });

        box.appendChild(again);
        box.appendChild(home);
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
            { key: 'sleep', emoji: '😴', nik: 'לִישֹׁן',    run: panelSleep },
            { key: 'wear',  emoji: '👑', nik: 'לְהַלְבִּישׁ', run: panelWear }
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

    /* --- הלבשה: לוחצים על אביזר כדי ללבוש, ושוב כדי להוריד --- */
    function panelWear() {
        var c = byId(petId);
        var panel = $('carePanel');
        var mine = ACCESSORIES.filter(function (a) { return owns(a.id); });

        if (!mine.length) {
            panel.innerHTML = '<p class="panel-q">עוֹד אֵין אֲבִיזָרִים</p>' +
                              '<p class="panel-hint">אֶפְשָׁר לִקְנוֹת בַּחֲנוּת שֶׁל צִדְפּוֹנִי 🏪</p>';
            say('עוד אין אביזרים. אפשר לקנות בחנות של צדפוני');
            return;
        }

        panel.innerHTML = '<p class="panel-q">מָה נִלְבַּשׁ?</p>';
        say('מה נלבש?');

        var worn = state.worn[c.id] || {};
        var row = document.createElement('div');
        row.className = 'choices';

        mine.forEach(function (item) {
            var on = worn[item.slot] === item.id;
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'choice wear-choice' + (on ? ' is-right' : '');
            btn.innerHTML = previewSVG(item);
            btn.setAttribute('aria-label', item.say + (on ? ', לבוש' : ''));

            btn.addEventListener('click', function () {
                var current = state.worn[c.id] || (state.worn[c.id] = {});
                if (current[item.slot] === item.id) {
                    delete current[item.slot];          /* לחיצה שנייה מורידה */
                    say('הורדנו את ה' + item.say);
                } else {
                    current[item.slot] = item.id;       /* משבצת אחת לכל סוג */
                    say(c.name + ' לובש ' + item.say);
                }
                save();
                sfx.tap();
                renderPet();
                panelWear();
            });

            row.appendChild(btn);
        });

        panel.appendChild(row);
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

        /* מקובץ לפי אזור — 24 כרטיסים בגלילה אחת היו ים בלי סימני דרך */
        var groups = AREAS.map(function (area) {
            return { nik: area.emoji + ' ' + area.nik, list: inArea(area.id) };
        });
        groups.push({ nik: '✨ נְדִירִים', list: inArea('rare') });

        groups.forEach(function (group) {
            var head = document.createElement('h2');
            head.className = 'album-group';
            var got = group.list.filter(function (c) { return isCaught(c.id); }).length;
            head.innerHTML = group.nik + ' <b>' + got + '/' + group.list.length + '</b>';
            grid.appendChild(head);

            var row = document.createElement('div');
            row.className = 'album-row';
            grid.appendChild(row);
            drawCards(row, group.list);
        });

        albumFooter();
    }

    function drawCards(grid, list) {
        list.forEach(function (c) {
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
                    if (!area) {
                        /* הנדירים לא גרים באף מקום */
                        $('albumNote').textContent = 'זֶה חַבְרֵז נָדִיר מְאוֹד. אוּלַי תִּפְגְּשׁוּ אוֹתוֹ בְּטִיּוּל... ✨';
                        say('זה חברז נדיר מאוד. אולי תפגשו אותו בטיול');
                        return;
                    }
                    $('albumNote').textContent = 'עוֹד לֹא פָּגַשְׁתֶּם אוֹתוֹ. חַפְּשׂוּ בְּ' + area.nik + '!';
                    say('עוד לא פגשתם אותו. חפשו ב' + area.name);
                    return;
                }
                sfx.tap();
                openPet(c.id);
            });

            grid.appendChild(card);
        });
    }

    function albumFooter() {
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
        watchInstall();

        $('playBtn').addEventListener('click', function () {
            sfx.page();
            /* בביקור הראשון בונים דמות לפני שיוצאים */
            if (!state.hero) { show('hero'); say('קודם נבנה את הדמות שלכם'); return; }
            say('בואו נצא לדרך!');
            show('map');
        });

        $('heroBtn').addEventListener('click', function () { sfx.page(); show('hero'); });

        $('heroName').addEventListener('input', function () {
            if (draftHero) draftHero.name = this.value.trim() || 'חָבֵר';
        });

        $('heroDone').addEventListener('click', function () {
            state.hero = draftHero || defaultHero();
            if (!state.hero.name) state.hero.name = 'חָבֵר';
            save();
            sfx.good();
            confetti(20);
            say('שלום, ' + heroName().replace(/[֑-ׇ]/g, '') + '! בואו נצא לדרך');
            show('map');
        });

        $('walkBtn').addEventListener('click', function () { sfx.page(); openWalkPicker(); });
        $('shopBtn').addEventListener('click', function () { sfx.page(); show('shop'); });
        $('roomBtn').addEventListener('click', function () { sfx.page(); show('room'); });

        $('diceBtn').addEventListener('click', function () {
            var open = AREAS.filter(function (a, i) { return areaUnlocked(i); });
            sfx.page();
            var area = pick(open);
            say('הפתעה! הולכים ל' + area.name);
            startEncounter(area);
        });
        $('walkHome').addEventListener('click', function () {
            sfx.page();
            if (walk.on) endWalk(false); else show('map');
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
            settings.sound = !settings.sound;
            save();
            $('soundBtn').setAttribute('aria-pressed', String(settings.sound));
            if (settings.sound) sfx.tap();
        });

        $('voiceBtn').addEventListener('click', function () {
            settings.voice = !settings.voice;
            save();
            $('voiceBtn').setAttribute('aria-pressed', String(settings.voice));
            if (settings.voice) say('שומעים אותי?');
            else if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        });

        $('whoBtn').addEventListener('click', function () { sfx.page(); show('who'); });

        $('resetBtn').addEventListener('click', function () {
            if (!window.confirm('להתחיל משחק חדש? כל החברזים של ' + heroName().replace(/[֑-ׇ]/g, '') + ' יימחקו.')) return;
            state.caught = [];
            state.care = {};
            state.treasures = {};
            state.owned = [];
            state.worn = {};
            state.hero = null;
            draftHero = null;
            save();
            sfx.page();
            renderTitle();
        });

        /* טעינת קולות ההקראה מתעדכנת מאוחר בחלק מהדפדפנים */
        if ('speechSynthesis' in window) {
            window.speechSynthesis.onvoiceschanged = function () { /* מרענן את הרשימה */ };
        }

        /* מי שכבר יש לו דמות רואה קודם את בחירת השחקן; מי שלא — בונה אחת */
        if (players.some(function (p) { return p.hero; })) {
            show('who');
        } else {
            if (!players.length) addPlayer();
            show('title');
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    /* נחשף לבדיקות ידניות מהקונסולה */
    window.Chavrezim = {
        CREATURES: CREATURES, AREAS: AREAS,
        makePuzzle: makePuzzle, settle: settle, mood: mood, isAsking: isAsking, needsCare: needsCare,
        TREASURES: TREASURES, heroSVG: heroSVG,
        ACCESSORIES: ACCESSORIES, DOLLS: DOLLS, HAIR_SHOP: HAIR_SHOP,
        coins: coins, owns: owns, rarePool: rarePool, meetRare: meetRare,
        RARE_CHANCE: RARE_CHANCE, save: save,
        players: function () { return players; }
    };

    /* state מוחלף בכל החלפת שחקן, אז הוא נחשף כמצביע חי ולא כהעתק */
    Object.defineProperty(window.Chavrezim, 'state', {
        get: function () { return state; }
    });

})();

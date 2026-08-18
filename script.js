'use strict';

/* ------------------------------------------------------------------ *
 * Global Time Planner
 * Live world clocks + a scrubbable timeline that finds the hours
 * every displayed city is inside its working day.
 * ------------------------------------------------------------------ */

const STORAGE_KEY = 'gtp.state.v1';
const SLOT_MINUTES = 15;
const SLOTS_PER_DAY = (24 * 60) / SLOT_MINUTES; // 96

const DEVICE_TZ = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
const DURATIONS = [15, 30, 45, 60, 90, 120];

/* ------------------------------------------------------------------ *
 * Places
 *
 * One row per country, generated from the IANA tz database:
 *   "<code> <country>|<zone>[=<label>]|<zone>…"
 * Most countries need a single clock. Countries wide enough that one clock
 * would hide a real difference carry several, each a distinct offset.
 * Zones come from tzdb's per-country table, so every country carries its own
 * zone id and its own city — Zimbabwe is Africa/Harare, not the Mozambican
 * zone it happens to share rules with.
 * ------------------------------------------------------------------ */

const COUNTRY_ZONES = [
    'AF Afghanistan|Asia/Kabul',
    'AL Albania|Europe/Tirane',
    'DZ Algeria|Africa/Algiers',
    'AS American Samoa|Pacific/Pago_Pago',
    'AD Andorra|Europe/Andorra',
    'AO Angola|Africa/Luanda',
    'AI Anguilla|America/Anguilla',
    'AQ Antarctica|Antarctica/McMurdo',
    'AG Antigua & Barbuda|America/Antigua',
    'AR Argentina|America/Argentina/Buenos_Aires',
    'AM Armenia|Asia/Yerevan',
    'AW Aruba|America/Aruba',
    'AU Australia|Australia/Sydney|Australia/Adelaide|Australia/Brisbane|Australia/Perth',
    'AT Austria|Europe/Vienna',
    'AZ Azerbaijan|Asia/Baku',
    'BS Bahamas|America/Nassau',
    'BH Bahrain|Asia/Bahrain',
    'BD Bangladesh|Asia/Dhaka',
    'BB Barbados|America/Barbados',
    'BY Belarus|Europe/Minsk',
    'BE Belgium|Europe/Brussels',
    'BZ Belize|America/Belize',
    'BJ Benin|Africa/Porto-Novo',
    'BM Bermuda|Atlantic/Bermuda',
    'BT Bhutan|Asia/Thimphu',
    'BO Bolivia|America/La_Paz',
    'BA Bosnia & Herzegovina|Europe/Sarajevo',
    'BW Botswana|Africa/Gaborone',
    'BR Brazil|America/Sao_Paulo|America/Manaus',
    'IO British Indian Ocean Territory|Indian/Chagos',
    'VG British Virgin Islands|America/Tortola',
    'BN Brunei|Asia/Brunei',
    'BG Bulgaria|Europe/Sofia',
    'BF Burkina Faso|Africa/Ouagadougou',
    'BI Burundi|Africa/Bujumbura',
    'KH Cambodia|Asia/Phnom_Penh',
    'CM Cameroon|Africa/Douala',
    'CA Canada|America/Toronto|America/Winnipeg|America/Edmonton|America/Vancouver|America/Halifax|America/St_Johns',
    'CV Cape Verde|Atlantic/Cape_Verde',
    'BQ Caribbean NL|America/Kralendijk',
    'KY Cayman Islands|America/Cayman',
    'CF Central African Rep.|Africa/Bangui',
    'TD Chad|Africa/Ndjamena',
    'CL Chile|America/Santiago|Pacific/Easter',
    'CN China|Asia/Shanghai',
    'CX Christmas Island|Indian/Christmas',
    'CC Cocos (Keeling) Islands|Indian/Cocos',
    'CO Colombia|America/Bogota',
    'KM Comoros|Indian/Comoro',
    'CK Cook Islands|Pacific/Rarotonga',
    'CR Costa Rica|America/Costa_Rica',
    'HR Croatia|Europe/Zagreb',
    'CU Cuba|America/Havana',
    'CW Curaçao|America/Curacao',
    'CY Cyprus|Asia/Nicosia',
    'CZ Czech Republic|Europe/Prague',
    'CI Côte d\'Ivoire|Africa/Abidjan',
    'CD DR Congo|Africa/Kinshasa|Africa/Lubumbashi',
    'DK Denmark|Europe/Copenhagen',
    'DJ Djibouti|Africa/Djibouti',
    'DO Dominican Republic|America/Santo_Domingo',
    'DM Dominica|America/Dominica',
    'TL East Timor|Asia/Dili',
    'EC Ecuador|America/Guayaquil|Pacific/Galapagos',
    'EG Egypt|Africa/Cairo',
    'SV El Salvador|America/El_Salvador',
    'GQ Equatorial Guinea|Africa/Malabo',
    'ER Eritrea|Africa/Asmara',
    'EE Estonia|Europe/Tallinn',
    'SZ Eswatini|Africa/Mbabane',
    'ET Ethiopia|Africa/Addis_Ababa',
    'FK Falkland Islands|Atlantic/Stanley',
    'FO Faroe Islands|Atlantic/Faroe',
    'FJ Fiji|Pacific/Fiji',
    'FI Finland|Europe/Helsinki',
    'FR France|Europe/Paris',
    'GF French Guiana|America/Cayenne',
    'PF French Polynesia|Pacific/Tahiti',
    'TF French S. Terr.|Indian/Kerguelen',
    'GA Gabon|Africa/Libreville',
    'GM Gambia|Africa/Banjul',
    'GE Georgia|Asia/Tbilisi',
    'DE Germany|Europe/Berlin',
    'GH Ghana|Africa/Accra',
    'GI Gibraltar|Europe/Gibraltar',
    'GR Greece|Europe/Athens',
    'GL Greenland|America/Nuuk',
    'GD Grenada|America/Grenada',
    'GP Guadeloupe|America/Guadeloupe',
    'GU Guam|Pacific/Guam',
    'GT Guatemala|America/Guatemala',
    'GG Guernsey|Europe/Guernsey',
    'GW Guinea-Bissau|Africa/Bissau',
    'GN Guinea|Africa/Conakry',
    'GY Guyana|America/Guyana',
    'HT Haiti|America/Port-au-Prince',
    'HN Honduras|America/Tegucigalpa',
    'HK Hong Kong|Asia/Hong_Kong',
    'HU Hungary|Europe/Budapest',
    'IS Iceland|Atlantic/Reykjavik',
    'IN India|Asia/Kolkata',
    'ID Indonesia|Asia/Jakarta|Asia/Makassar|Asia/Jayapura',
    'IR Iran|Asia/Tehran',
    'IQ Iraq|Asia/Baghdad',
    'IE Ireland|Europe/Dublin',
    'IM Isle of Man|Europe/Isle_of_Man',
    'IL Israel|Asia/Jerusalem',
    'IT Italy|Europe/Rome',
    'JM Jamaica|America/Jamaica',
    'JP Japan|Asia/Tokyo',
    'JE Jersey|Europe/Jersey',
    'JO Jordan|Asia/Amman',
    'KZ Kazakhstan|Asia/Almaty|Asia/Aqtobe',
    'KE Kenya|Africa/Nairobi',
    'KI Kiribati|Pacific/Tarawa',
    'KW Kuwait|Asia/Kuwait',
    'KG Kyrgyzstan|Asia/Bishkek',
    'LA Laos|Asia/Vientiane',
    'LV Latvia|Europe/Riga',
    'LB Lebanon|Asia/Beirut',
    'LS Lesotho|Africa/Maseru',
    'LR Liberia|Africa/Monrovia',
    'LY Libya|Africa/Tripoli',
    'LI Liechtenstein|Europe/Vaduz',
    'LT Lithuania|Europe/Vilnius',
    'LU Luxembourg|Europe/Luxembourg',
    'MO Macau|Asia/Macau',
    'MG Madagascar|Indian/Antananarivo',
    'MW Malawi|Africa/Blantyre',
    'MY Malaysia|Asia/Kuala_Lumpur',
    'MV Maldives|Indian/Maldives',
    'ML Mali|Africa/Bamako',
    'MT Malta|Europe/Malta',
    'MH Marshall Islands|Pacific/Majuro',
    'MQ Martinique|America/Martinique',
    'MR Mauritania|Africa/Nouakchott',
    'MU Mauritius|Indian/Mauritius',
    'YT Mayotte|Indian/Mayotte',
    'MX Mexico|America/Mexico_City|America/Tijuana',
    'FM Micronesia|Pacific/Chuuk',
    'MD Moldova|Europe/Chisinau',
    'MC Monaco|Europe/Monaco',
    'MN Mongolia|Asia/Ulaanbaatar',
    'ME Montenegro|Europe/Podgorica',
    'MS Montserrat|America/Montserrat',
    'MA Morocco|Africa/Casablanca',
    'MZ Mozambique|Africa/Maputo',
    'MM Myanmar|Asia/Yangon',
    'NA Namibia|Africa/Windhoek',
    'NR Nauru|Pacific/Nauru',
    'NP Nepal|Asia/Kathmandu',
    'NL Netherlands|Europe/Amsterdam',
    'NC New Caledonia|Pacific/Noumea',
    'NZ New Zealand|Pacific/Auckland',
    'NI Nicaragua|America/Managua',
    'NG Nigeria|Africa/Lagos',
    'NE Niger|Africa/Niamey',
    'NU Niue|Pacific/Niue',
    'NF Norfolk Island|Pacific/Norfolk',
    'KP North Korea|Asia/Pyongyang',
    'MK North Macedonia|Europe/Skopje',
    'MP Northern Mariana Islands|Pacific/Saipan',
    'NO Norway|Europe/Oslo',
    'OM Oman|Asia/Muscat',
    'PK Pakistan|Asia/Karachi',
    'PW Palau|Pacific/Palau',
    'PS Palestine|Asia/Gaza',
    'PA Panama|America/Panama',
    'PG Papua New Guinea|Pacific/Port_Moresby',
    'PY Paraguay|America/Asuncion',
    'PE Peru|America/Lima',
    'PH Philippines|Asia/Manila',
    'PN Pitcairn|Pacific/Pitcairn',
    'PL Poland|Europe/Warsaw',
    'PT Portugal|Europe/Lisbon|Atlantic/Azores',
    'PR Puerto Rico|America/Puerto_Rico',
    'QA Qatar|Asia/Qatar',
    'CG Republic of the Congo|Africa/Brazzaville',
    'RO Romania|Europe/Bucharest',
    'RU Russia|Europe/Moscow|Asia/Yekaterinburg|Asia/Novosibirsk|Asia/Vladivostok',
    'RW Rwanda|Africa/Kigali',
    'RE Réunion|Indian/Reunion',
    'MF Saint Martin|America/Marigot',
    'WS Samoa|Pacific/Apia',
    'SM San Marino|Europe/San_Marino',
    'ST Sao Tome & Principe|Africa/Sao_Tome',
    'SA Saudi Arabia|Asia/Riyadh',
    'SN Senegal|Africa/Dakar',
    'RS Serbia|Europe/Belgrade',
    'SC Seychelles|Indian/Mahe',
    'SL Sierra Leone|Africa/Freetown',
    'SG Singapore|Asia/Singapore',
    'SX Sint Maarten|America/Lower_Princes',
    'SK Slovakia|Europe/Bratislava',
    'SI Slovenia|Europe/Ljubljana',
    'SB Solomon Islands|Pacific/Guadalcanal',
    'SO Somalia|Africa/Mogadishu',
    'ZA South Africa|Africa/Johannesburg',
    'GS South Georgia & the South Sandwich Islands|Atlantic/South_Georgia',
    'KR South Korea|Asia/Seoul',
    'SS South Sudan|Africa/Juba',
    'ES Spain|Europe/Madrid|Atlantic/Canary',
    'LK Sri Lanka|Asia/Colombo',
    'BL St Barthelemy|America/St_Barthelemy',
    'SH St Helena|Atlantic/St_Helena',
    'KN St Kitts & Nevis|America/St_Kitts',
    'LC St Lucia|America/St_Lucia',
    'PM St Pierre & Miquelon|America/Miquelon',
    'VC St Vincent|America/St_Vincent',
    'SD Sudan|Africa/Khartoum',
    'SR Suriname|America/Paramaribo',
    'SJ Svalbard & Jan Mayen|Arctic/Longyearbyen',
    'SE Sweden|Europe/Stockholm',
    'CH Switzerland|Europe/Zurich',
    'SY Syria|Asia/Damascus',
    'TW Taiwan|Asia/Taipei',
    'TJ Tajikistan|Asia/Dushanbe',
    'TZ Tanzania|Africa/Dar_es_Salaam',
    'TH Thailand|Asia/Bangkok',
    'TG Togo|Africa/Lome',
    'TK Tokelau|Pacific/Fakaofo',
    'TO Tonga|Pacific/Tongatapu',
    'TT Trinidad & Tobago|America/Port_of_Spain',
    'TN Tunisia|Africa/Tunis',
    'TR Turkey|Europe/Istanbul',
    'TM Turkmenistan|Asia/Ashgabat',
    'TC Turks & Caicos Is|America/Grand_Turk',
    'TV Tuvalu|Pacific/Funafuti',
    'VI US Virgin Islands|America/St_Thomas',
    'UM US minor outlying islands|Pacific/Midway',
    'UG Uganda|Africa/Kampala',
    'UA Ukraine|Europe/Simferopol',
    'AE United Arab Emirates|Asia/Dubai',
    'GB United Kingdom|Europe/London',
    'US United States|America/New_York|America/Chicago|America/Denver|America/Los_Angeles|America/Anchorage|Pacific/Honolulu',
    'UY Uruguay|America/Montevideo',
    'UZ Uzbekistan|Asia/Samarkand',
    'VU Vanuatu|Pacific/Efate',
    'VA Vatican City|Europe/Vatican',
    'VE Venezuela|America/Caracas',
    'VN Vietnam|Asia/Ho_Chi_Minh=Ho Chi Minh City',
    'WF Wallis & Futuna|Pacific/Wallis',
    'EH Western Sahara|Africa/El_Aaiun',
    'YE Yemen|Asia/Aden',
    'ZM Zambia|Africa/Lusaka',
    'ZW Zimbabwe|Africa/Harare',
    'AX Åland Islands|Europe/Mariehamn',
];

const ALIASES = {
    'tel aviv': 'Asia/Jerusalem', 'israel': 'Asia/Jerusalem', 'jerusalem': 'Asia/Jerusalem',
    'nyc': 'America/New_York', 'new york city': 'America/New_York',
    'sf': 'America/Los_Angeles', 'san francisco': 'America/Los_Angeles',
    'bay area': 'America/Los_Angeles', 'seattle': 'America/Los_Angeles',
    'la': 'America/Los_Angeles', 'silicon valley': 'America/Los_Angeles',
    'bangalore': 'Asia/Kolkata', 'mumbai': 'Asia/Kolkata', 'delhi': 'Asia/Kolkata',
    'india': 'Asia/Kolkata', 'beijing': 'Asia/Shanghai', 'china': 'Asia/Shanghai',
    'uk': 'Europe/London', 'england': 'Europe/London', 'britain': 'Europe/London',
    'germany': 'Europe/Berlin', 'france': 'Europe/Paris', 'japan': 'Asia/Tokyo',
    'gmt': 'UTC', 'utc': 'UTC'
};

/** Regional-indicator pair — "IL" becomes the Israeli flag, for all 247. */
function flagOf(code) {
    return String.fromCodePoint(...[...code].map(c => 0x1f1e6 + c.charCodeAt(0) - 65));
}

/** Parse the table once into the places the app actually works with. */
function buildPlaces() {
    const places = [];
    for (const row of COUNTRY_ZONES) {
        const [head, ...zones] = row.split('|');
        const code = head.slice(0, 2);
        const country = head.slice(3);
        for (const entry of zones) {
            const [tz, label] = entry.split('=');
            if (!knownZone(tz)) continue;   // an old browser's tzdb may lag ours
            places.push({
                id: code + '@' + tz,
                tz,
                code,
                country,
                city: label || tz.split('/').pop().replace(/_/g, ' '),
                flag: flagOf(code)
            });
        }
    }
    return places;
}

const PLACES = buildPlaces();
const PLACE_BY_ID = new Map(PLACES.map(p => [p.id, p]));

/** First visit follows the reader's OS setting; after that their toggle wins. */
function prefersLight() {
    return typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: light)').matches;
}

/* ------------------------------------------------------------------ *
 * State
 * ------------------------------------------------------------------ */

const state = {
    places: [],   // place ids, e.g. 'IL@Asia/Jerusalem'
    hour12: false,
    theme: prefersLight() ? 'light' : 'dark',
    live: true,
    refZone: DEVICE_TZ,
    workStart: 9,
    workEnd: 17,
    duration: 60,
    planTs: Date.now()
};

const el = {};
const cards = new Map(); // tz -> { root, nodes… }

/* ------------------------------------------------------------------ *
 * Time helpers
 * ------------------------------------------------------------------ */

const partsFormatters = new Map();

function partsFormatter(tz) {
    let f = partsFormatters.get(tz);
    if (!f) {
        f = new Intl.DateTimeFormat('en-US', {
            timeZone: tz, hourCycle: 'h23',
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            weekday: 'short'
        });
        partsFormatters.set(tz, f);
    }
    return f;
}

/** Wall-clock fields for an instant in a zone. */
function zonedParts(ts, tz) {
    const out = {};
    for (const p of partsFormatter(tz).formatToParts(ts)) {
        if (p.type !== 'literal') out[p.type] = p.value;
    }
    return {
        year: +out.year, month: +out.month, day: +out.day,
        hour: +out.hour, minute: +out.minute, second: +out.second,
        weekday: out.weekday
    };
}

/** Zone offset from UTC, in minutes, at a given instant. */
function offsetMinutes(ts, tz) {
    const p = zonedParts(ts, tz);
    const asUTC = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
    return (asUTC - Math.floor(ts / 1000) * 1000) / 60000;
}

/** Inverse of zonedParts: the instant at which a zone shows this wall clock. */
function zonedToTs(year, month, day, hour, minute, tz) {
    const naive = Date.UTC(year, month - 1, day, hour, minute);
    let ts = naive - offsetMinutes(naive, tz) * 60000;
    ts = naive - offsetMinutes(ts, tz) * 60000; // second pass settles DST edges
    return ts;
}

function formatOffset(minutes) {
    const sign = minutes < 0 ? '-' : '+';
    const abs = Math.abs(minutes);
    const h = Math.floor(abs / 60);
    const m = abs % 60;
    return 'UTC' + sign + h + (m ? ':' + String(m).padStart(2, '0') : '');
}

function zoneAbbr(ts, tz) {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'short' })
        .formatToParts(ts);
    const found = parts.find(p => p.type === 'timeZoneName');
    return found ? found.value : '';
}

function formatClock(ts, tz, withSeconds) {
    const opts = { timeZone: tz, hour: 'numeric', minute: '2-digit', hour12: state.hour12 };
    if (!state.hour12) opts.hourCycle = 'h23';
    if (withSeconds) opts.second = '2-digit';
    return new Intl.DateTimeFormat('en-US', opts).format(ts);
}

function formatDate(ts, tz) {
    return new Intl.DateTimeFormat('en-US', {
        timeZone: tz, weekday: 'long', month: 'short', day: 'numeric'
    }).format(ts);
}

/* ------------------------------------------------------------------ *
 * Looking places up
 * ------------------------------------------------------------------ */

/** A zone with no country row of its own — still usable, just unlabelled. */
function adhocPlace(tz) {
    return {
        id: '@' + tz,
        tz,
        code: '',
        country: tz.includes('/') ? tz.split('/')[0].replace(/_/g, ' ') : '',
        city: tz.split('/').pop().replace(/_/g, ' '),
        flag: '\u{1f552}'
    };
}

/** The place a saved id, a share link or a bare zone refers to. */
function placeById(id) {
    const known = PLACE_BY_ID.get(id);
    if (known) return known;

    // Links and saved state from before countries existed hold a bare zone.
    const tz = id.includes('@') ? id.slice(id.indexOf('@') + 1) : id;
    if (!knownZone(tz)) return null;
    return PLACES.find(p => p.tz === tz) || adhocPlace(tz);
}

/** How a zone is named when it stands alone (the reference-zone menu). */
function zoneLabel(tz) {
    const place = PLACES.find(p => p.tz === tz);
    return place ? place.city : tz.split('/').pop().replace(/_/g, ' ');
}

/* ------------------------------------------------------------------ *
 * Working hours
 * ------------------------------------------------------------------ */

function inWorkHours(hour) {
    const { workStart: s, workEnd: e } = state;
    return s < e ? (hour >= s && hour < e) : (hour >= s || hour < e);
}

function hourCategory(hour) {
    if (inWorkHours(hour)) return 'work';
    if (hour < 7 || hour >= 23) return 'sleep';
    return 'awake';
}

/* ------------------------------------------------------------------ *
 * Persistence
 * ------------------------------------------------------------------ */

function knownZone(tz) {
    try {
        new Intl.DateTimeFormat('en-US', { timeZone: tz });
        return true;
    } catch {
        return false;
    }
}

function defaultPlaces() {
    const here = PLACES.find(p => p.tz === DEVICE_TZ) || adhocPlace(DEVICE_TZ);
    const wanted = [here.id, 'US@America/New_York', 'GB@Europe/London', 'JP@Asia/Tokyo'];
    return [...new Set(wanted)].filter(placeById);
}

function save() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            places: state.places, hour12: state.hour12, theme: state.theme,
            refZone: state.refZone, workStart: state.workStart, workEnd: state.workEnd,
            duration: state.duration
        }));
    } catch {
        /* private mode — run without persistence */
    }
}

function load() {
    let saved = null;
    try {
        saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    } catch {
        saved = null;
    }
    if (!saved) {
        state.places = defaultPlaces();
        return;
    }
    // saved.zones is the pre-countries format: bare IANA ids.
    const stored = Array.isArray(saved.places) ? saved.places
        : Array.isArray(saved.zones) ? saved.zones : [];
    state.places = stored.map(id => placeById(id)).filter(Boolean).map(p => p.id);
    if (!state.places.length) state.places = defaultPlaces();
    state.hour12 = !!saved.hour12;
    if (saved.theme === 'light' || saved.theme === 'dark') state.theme = saved.theme;
    state.refZone = knownZone(saved.refZone) ? saved.refZone : DEVICE_TZ;
    if (Number.isInteger(saved.workStart)) state.workStart = saved.workStart;
    if (Number.isInteger(saved.workEnd)) state.workEnd = saved.workEnd;
    if (DURATIONS.includes(saved.duration)) state.duration = saved.duration;
}

/* ------------------------------------------------------------------ *
 * Shareable links
 *
 * A link carries the plan, not the reader's preferences: cities, the
 * reference zone, the moment (or "live"), working hours and clock format.
 * Theme stays whatever the reader picked.
 * ------------------------------------------------------------------ */

/** Some embeds (sandboxed frames) refuse history writes — the link still works. */
function replaceUrl(url) {
    try {
        history.replaceState(null, '', url);
    } catch {
        /* not fatal: the URL bar just keeps whatever it had */
    }
}

function buildShareUrl() {
    const params = new URLSearchParams();
    params.set('z', state.places.join(','));
    params.set('ref', refTz());
    params.set('w', `${state.workStart}-${state.workEnd}`);
    params.set('f', state.hour12 ? '12' : '24');
    params.set('d', String(state.duration));
    if (state.live) params.set('live', '1');
    else params.set('t', String(Math.round(state.planTs / 1000)));
    return location.origin + location.pathname + location.search + '#' + params.toString();
}

/** Read a shared plan out of the URL hash. Returns true when one was applied. */
function applyHash() {
    const raw = location.hash.replace(/^#/, '');
    if (!raw) return false;

    const params = new URLSearchParams(raw);
    const shared = (params.get('z') || '').split(',')
        .map(id => placeById(id.trim()))
        .filter(Boolean)
        .map(p => p.id);
    if (!shared.length) return false;
    state.places = shared;

    const ref = params.get('ref');
    state.refZone = knownZone(ref) ? ref : DEVICE_TZ;

    const work = /^(\d{1,2})-(\d{1,2})$/.exec(params.get('w') || '');
    if (work) {
        const [, start, end] = work.map(Number);
        if (start < 24 && end < 24) {
            state.workStart = start;
            state.workEnd = end;
        }
    }

    if (params.get('f') === '12') state.hour12 = true;
    if (params.get('f') === '24') state.hour12 = false;

    const duration = Number(params.get('d'));
    if (DURATIONS.includes(duration)) state.duration = duration;

    const seconds = Number(params.get('t'));
    if (params.get('live') !== '1' && Number.isFinite(seconds) && seconds > 0) {
        state.planTs = seconds * 1000;
        state.live = false;
    }
    return true;
}

/* ------------------------------------------------------------------ *
 * Zone search
 * ------------------------------------------------------------------ */

/** Every zone the browser knows, so power users can type an IANA id. */
function allZones() {
    let list = [];
    if (typeof Intl.supportedValuesOf === 'function') {
        try {
            list = Intl.supportedValuesOf('timeZone');
        } catch {
            list = [];
        }
    }
    return [...new Set([...PLACES.map(p => p.tz), ...list])].filter(knownZone);
}

/**
 * Find what someone meant. Countries, cities, ISO codes and IANA ids all
 * work, exact matches beat prefixes, and prefixes beat "contains" — so
 * "Chad" is the country, not Chadron, and "IL" is Israel, not Illinois.
 */
function resolvePlace(raw) {
    const q = raw.trim().toLowerCase();
    if (!q) return null;

    if (ALIASES[q]) {
        const aliased = PLACES.find(p => p.tz === ALIASES[q]);
        if (aliased) return aliased;
    }

    const tests = [
        p => p.country.toLowerCase() === q || p.city.toLowerCase() === q,
        p => p.code.toLowerCase() === q || p.tz.toLowerCase() === q,
        p => p.country.toLowerCase().startsWith(q) || p.city.toLowerCase().startsWith(q),
        p => p.country.toLowerCase().includes(q) || p.city.toLowerCase().includes(q),
        p => p.tz.toLowerCase().includes(q)
    ];
    for (const test of tests) {
        const hit = PLACES.find(test);
        if (hit) return hit;
    }

    const aliasKey = Object.keys(ALIASES).find(k => k.startsWith(q));
    if (aliasKey) {
        const aliased = PLACES.find(p => p.tz === ALIASES[aliasKey]);
        if (aliased) return aliased;
    }

    // Fall back to any zone the browser knows, even without a country row.
    const zone = allZones().find(tz => tz.toLowerCase().includes(q));
    return zone ? (PLACES.find(p => p.tz === zone) || adhocPlace(zone)) : null;
}

function fillDatalist() {
    const frag = document.createDocumentFragment();
    for (const place of PLACES) {
        const option = document.createElement('option');
        option.value = place.city === place.country
            ? place.country
            : `${place.city} \u2014 ${place.country}`;
        option.label = place.tz;
        frag.appendChild(option);
    }
    el.zoneList.replaceChildren(frag);
}

/* ------------------------------------------------------------------ *
 * Planner
 * ------------------------------------------------------------------ */

function refTz() {
    return knownZone(state.refZone) ? state.refZone : DEVICE_TZ;
}

/** Rebuild planTs from the date input + slider (used when scrubbing). */
function planTsFromControls() {
    const [y, m, d] = el.planDate.value.split('-').map(Number);
    if (!y || !m || !d) return Date.now();
    const minutes = Number(el.planSlider.value) * SLOT_MINUTES;
    return zonedToTs(y, m, d, 0, minutes, refTz());
}

/** Push planTs back into the date input + slider (used when live or on zone change). */
function syncControlsFromPlanTs() {
    const p = zonedParts(state.planTs, refTz());
    el.planDate.value = [
        p.year,
        String(p.month).padStart(2, '0'),
        String(p.day).padStart(2, '0')
    ].join('-');
    el.planSlider.value = String(Math.round((p.hour * 60 + p.minute) / SLOT_MINUTES) % SLOTS_PER_DAY);
}

function setLive(live) {
    state.live = live;
    el.nowBtn.classList.toggle('is-live', live);
    el.nowBtn.textContent = live ? 'Live' : 'Back to live';
    document.body.classList.toggle('is-scrubbing', !live);
    if (live) state.planTs = Date.now();
    render();
}

/* ------------------------------------------------------------------ *
 * Overlap analysis
 * ------------------------------------------------------------------ */

/** For each hour of the planner day (in the reference zone): who is working. */
function overlapByHour() {
    const places = state.places.map(placeById).filter(Boolean);
    const rows = [];
    for (let hour = 0; hour < 24; hour++) {
        const ts = tsAtRefHour(hour);
        const working = places.filter(p => inWorkHours(zonedParts(ts, p.tz).hour));
        rows.push({ hour, ts, count: working.length, working });
    }
    return rows;
}

/** Longest contiguous runs at the best achievable coverage. */
function bestWindows(rows) {
    const best = rows.reduce((max, r) => Math.max(max, r.count), 0);
    if (!best) return { best: 0, windows: [] };

    const windows = [];
    let run = null;
    for (const row of rows) {
        if (row.count === best) {
            if (run) {
                run.end = row.hour + 1;
            } else {
                run = { start: row.hour, end: row.hour + 1, ts: row.ts, working: row.working };
            }
        } else if (run) {
            windows.push(run);
            run = null;
        }
    }
    if (run) windows.push(run);

    windows.sort((a, b) => (b.end - b.start) - (a.end - a.start));
    return { best, windows: windows.slice(0, 3) };
}

/* ------------------------------------------------------------------ *
 * Rendering
 * ------------------------------------------------------------------ */

function buildCard(place) {
    const root = document.createElement('article');
    root.className = 'clock-card';
    root.innerHTML = `
        <button class="remove" type="button" title="Remove" aria-label="Remove">×</button>
        <div class="card-head">
            <span class="card-emoji" aria-hidden="true"></span>
            <div class="card-titles">
                <h2 class="card-city"></h2>
                <p class="card-zone"></p>
            </div>
        </div>
        <p class="card-time"><span class="t-main"></span><span class="t-suffix"></span></p>
        <p class="card-date"><span class="d-text"></span><span class="d-diff"></span></p>
        <div class="card-strip" aria-hidden="true"></div>
        <p class="card-meta"><span class="m-offset"></span><span class="m-abbr"></span></p>
    `;

    const strip = root.querySelector('.card-strip');
    const cells = [];
    for (let hour = 0; hour < 24; hour++) {
        const cell = document.createElement('i');
        cell.className = 'cell';
        strip.appendChild(cell);
        cells.push(cell);
    }

    root.querySelector('.remove').addEventListener('click', () => removePlace(place.id));

    const node = {
        root,
        emoji: root.querySelector('.card-emoji'),
        city: root.querySelector('.card-city'),
        zone: root.querySelector('.card-zone'),
        main: root.querySelector('.t-main'),
        suffix: root.querySelector('.t-suffix'),
        date: root.querySelector('.d-text'),
        diff: root.querySelector('.d-diff'),
        offset: root.querySelector('.m-offset'),
        abbr: root.querySelector('.m-abbr'),
        cells
    };

    node.emoji.textContent = place.flag;
    node.city.textContent = place.city;
    node.zone.textContent = place.city === place.country
        ? place.tz
        : `${place.country} · ${place.tz}`;
    return node;
}

function renderCards() {
    for (const [id, node] of cards) {
        if (!state.places.includes(id)) {
            node.root.remove();
            cards.delete(id);
        }
    }
    for (const id of state.places) {
        if (!cards.has(id)) cards.set(id, buildCard(placeById(id)));
        el.clocks.appendChild(cards.get(id).root); // also fixes ordering
    }
    el.emptyState.hidden = state.places.length > 0;
}

function updateCards() {
    const ts = state.planTs;
    const refDay = zonedParts(ts, refTz());
    const withSeconds = state.live;

    for (const id of state.places) {
        const node = cards.get(id);
        const tz = placeById(id).tz;
        const p = zonedParts(ts, tz);
        const time = formatClock(ts, tz, withSeconds);
        const match = /\s*(AM|PM)$/i.exec(time);

        node.main.textContent = match ? time.slice(0, match.index) : time;
        node.suffix.textContent = match ? match[1].toLowerCase() : '';
        node.date.textContent = formatDate(ts, tz);

        const diff = calendarDayDelta(p, refDay);
        node.diff.textContent = diff === 0 ? '' : (diff > 0 ? '+1 day' : '−1 day');
        node.diff.className = 'd-diff' + (diff === 0 ? '' : ' is-shifted');

        node.offset.textContent = formatOffset(offsetMinutes(ts, tz));
        // Only show a real abbreviation (EDT, JST…) — "GMT+9" just repeats the offset.
        const abbr = zoneAbbr(ts, tz);
        node.abbr.textContent = /^(GMT|UTC)/.test(abbr) ? '' : abbr;

        for (let hour = 0; hour < 24; hour++) {
            const cell = node.cells[hour];
            const cls = 'cell ' + hourCategory(hour) + (hour === p.hour ? ' is-now' : '');
            if (cell.className !== cls) cell.className = cls;
        }

        node.root.classList.toggle('is-working', inWorkHours(p.hour));
        node.root.classList.toggle('is-night', hourCategory(p.hour) === 'sleep');
    }
}

/** Whole-day difference between two sets of wall-clock parts (-1, 0 or +1). */
function calendarDayDelta(parts, refParts) {
    const a = Date.UTC(parts.year, parts.month - 1, parts.day);
    const b = Date.UTC(refParts.year, refParts.month - 1, refParts.day);
    return Math.sign(a - b);
}

function renderOverlap() {
    const rows = overlapByHour();
    const total = state.places.length;
    const currentHour = zonedParts(state.planTs, refTz()).hour;

    if (el.overlapStrip.childElementCount !== 24) {
        const frag = document.createDocumentFragment();
        for (let hour = 0; hour < 24; hour++) {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'ocell';
            b.addEventListener('click', () => jumpToHour(hour));
            frag.appendChild(b);
        }
        el.overlapStrip.replaceChildren(frag);

        const labels = document.createDocumentFragment();
        for (let hour = 0; hour < 24; hour += 3) {
            const s = document.createElement('span');
            s.textContent = String(hour).padStart(2, '0');
            labels.appendChild(s);
        }
        el.overlapLabels.replaceChildren(labels);
    }

    rows.forEach((row, hour) => {
        const cell = el.overlapStrip.children[hour];
        const ratio = total ? row.count / total : 0;
        cell.style.setProperty('--fill', ratio.toFixed(3));
        cell.classList.toggle('is-full', total > 0 && row.count === total);
        cell.classList.toggle('is-empty', row.count === 0);
        cell.classList.toggle('is-current', hour === currentHour);
        cell.title = `${String(hour).padStart(2, '0')}:00 — ${row.count}/${total} in working hours`;
        cell.setAttribute('aria-label', cell.title);
    });

    const { best, windows } = bestWindows(rows);
    el.suggestions.replaceChildren();

    if (!total) {
        el.suggestions.append(hint('Add at least one city to see overlap.'));
        return;
    }

    const heading = document.createElement('span');
    heading.className = 'sug-label';
    heading.textContent = best === total
        ? 'Everyone is free:'
        : (best === 0 ? 'No working overlap today' : `Best possible — ${best}/${total} cities:`);
    el.suggestions.appendChild(heading);

    for (const w of windows) {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'chip' + (best === total ? ' is-good' : '');
        chip.textContent = `${formatClock(w.ts, refTz(), false)} – ${formatClock(tsAtRefHour(w.end), refTz(), false)}`;
        chip.title = 'Jump to this window';
        chip.addEventListener('click', () => jumpToHour(w.start));
        el.suggestions.appendChild(chip);
    }
}

/** The instant at `hour` on the planner day in the reference zone (24 rolls to the next day). */
function tsAtRefHour(hour) {
    const p = zonedParts(state.planTs, refTz());
    return zonedToTs(p.year, p.month, p.day, hour, 0, refTz());
}

function hint(text) {
    const s = document.createElement('span');
    s.className = 'sug-label';
    s.textContent = text;
    return s;
}

function jumpToHour(hour) {
    state.planTs = tsAtRefHour(hour);
    setLive(false);
    syncControlsFromPlanTs();
    render();
}

function renderReadout() {
    el.planTime.textContent = formatClock(state.planTs, refTz(), state.live);
    el.planZoneLabel.textContent = `${zoneLabel(refTz())} · ${formatDate(state.planTs, refTz())}`;
}

function renderRefOptions() {
    const zones = state.places.map(id => placeById(id).tz);
    const options = [...new Set([DEVICE_TZ, ...zones])];
    const frag = document.createDocumentFragment();
    for (const tz of options) {
        const option = document.createElement('option');
        option.value = tz;
        option.textContent = tz === DEVICE_TZ ? `${zoneLabel(tz)} (your device)` : zoneLabel(tz);
        frag.appendChild(option);
    }
    el.refZone.replaceChildren(frag);
    if (!options.includes(state.refZone)) state.refZone = DEVICE_TZ;
    el.refZone.value = state.refZone;
}

function render() {
    renderCards();
    updateCards();
    renderOverlap();
    renderReadout();
}

/* ------------------------------------------------------------------ *
 * Actions
 * ------------------------------------------------------------------ */

function addPlace(place) {
    if (state.places.includes(place.id)) {
        toast(`${place.city} is already on the board`);
        return;
    }
    state.places.push(place.id);
    save();
    renderRefOptions();
    render();
    toast(`Added ${place.city}${place.city === place.country ? '' : ', ' + place.country}`);
}

function removePlace(id) {
    state.places = state.places.filter(x => x !== id);
    save();
    renderRefOptions();
    render();
}

function copySummary() {
    if (!state.places.length) return;
    const places = state.places.map(placeById).filter(Boolean);
    const lines = [`Meeting time — ${formatDate(state.planTs, refTz())}`];
    const width = Math.max(...places.map(p => p.city.length));
    for (const place of places) {
        const p = zonedParts(state.planTs, place.tz);
        const note = inWorkHours(p.hour) ? '' : (hourCategory(p.hour) === 'sleep' ? '  (asleep)' : '  (off hours)');
        lines.push(`• ${place.city.padEnd(width)}  ${formatClock(state.planTs, place.tz, false)}  ${formatDate(state.planTs, place.tz)}${note}`);
    }
    const text = lines.join('\n');

    const done = () => toast('Summary copied to clipboard');
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done, () => fallbackCopy(text, done));
    } else {
        fallbackCopy(text, done);
    }
}

function fallbackCopy(text, done) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
        document.execCommand('copy');
        done();
    } catch {
        toast('Copy failed — select the text manually');
    }
    ta.remove();
}

/* ------------------------------------------------------------------ *
 * Calendar invite (RFC 5545)
 * ------------------------------------------------------------------ */

function icsStamp(ts) {
    return new Date(ts).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function icsEscape(text) {
    return text.replace(/([\\;,])/g, '\\$1').replace(/\n/g, '\\n');
}

/** Content lines must not exceed 75 octets; continuations start with a space. */
function icsFold(line) {
    const out = [];
    let rest = line;
    while (rest.length > 74) {
        out.push(rest.slice(0, 74));
        rest = ' ' + rest.slice(74);
    }
    out.push(rest);
    return out.join('\r\n');
}

function buildIcs() {
    const start = state.planTs;
    const end = start + state.duration * 60000;
    const places = state.places.map(placeById).filter(Boolean);
    const cities = places
        .map(p => `${p.city}: ${formatClock(start, p.tz, false)} ${formatDate(start, p.tz)}`)
        .join('\n');

    const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Global Time Planner//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:${start}-${Math.random().toString(36).slice(2, 10)}@global-time-planner`,
        `DTSTAMP:${icsStamp(Date.now())}`,
        `DTSTART:${icsStamp(start)}`,
        `DTEND:${icsStamp(end)}`,
        `SUMMARY:${icsEscape('Global sync — ' + places.map(p => p.city).join(', '))}`,
        `DESCRIPTION:${icsEscape('Local times\n' + cities)}`,
        'END:VEVENT',
        'END:VCALENDAR'
    ];
    return lines.map(icsFold).join('\r\n') + '\r\n';
}

function downloadIcs() {
    if (!state.places.length) {
        toast('Add a city first');
        return;
    }
    const p = zonedParts(state.planTs, refTz());
    const pad = n => String(n).padStart(2, '0');
    const name = `meeting-${p.year}-${pad(p.month)}-${pad(p.day)}-${pad(p.hour)}${pad(p.minute)}.ics`;

    const blob = new Blob([buildIcs()], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast(`Invite downloaded — ${state.duration} min`);
}

function shareLink() {
    if (!state.places.length) {
        toast('Add a city first');
        return;
    }
    const url = buildShareUrl();
    replaceUrl(url);
    const done = () => toast('Link copied — it reopens this exact plan');
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(url).then(done, () => fallbackCopy(url, done));
    } else {
        fallbackCopy(url, done);
    }
}

let toastTimer = null;
function toast(message) {
    el.toast.textContent = message;
    el.toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.toast.classList.remove('is-visible'), 2200);
}

function applyTheme() {
    document.documentElement.dataset.theme = state.theme;
    el.themeBtn.textContent = state.theme === 'dark' ? '☾' : '☀';
}

/* ------------------------------------------------------------------ *
 * Wiring
 * ------------------------------------------------------------------ */

function fillHourSelects() {
    for (const select of [el.workStart, el.workEnd]) {
        const frag = document.createDocumentFragment();
        for (let hour = 0; hour < 24; hour++) {
            const option = document.createElement('option');
            option.value = String(hour);
            option.textContent = String(hour).padStart(2, '0') + ':00';
            frag.appendChild(option);
        }
        select.replaceChildren(frag);
    }
    el.workStart.value = String(state.workStart);
    el.workEnd.value = String(state.workEnd);

    const frag = document.createDocumentFragment();
    for (const minutes of DURATIONS) {
        const option = document.createElement('option');
        option.value = String(minutes);
        option.textContent = minutes >= 60 && minutes % 60 === 0
            ? `${minutes / 60} hr`
            : `${minutes} min`;
        frag.appendChild(option);
    }
    el.duration.replaceChildren(frag);
    el.duration.value = String(state.duration);
}

function bind() {
    el.addForm.addEventListener('submit', e => {
        e.preventDefault();
        const place = resolvePlace(el.zoneInput.value);
        if (!place) {
            toast(`Nothing matches “${el.zoneInput.value.trim()}”`);
            return;
        }
        el.zoneInput.value = '';
        addPlace(place);
    });

    el.resetBtn.addEventListener('click', () => {
        state.places = defaultPlaces();
        state.refZone = DEVICE_TZ;
        save();
        renderRefOptions();
        setLive(true);
        syncControlsFromPlanTs();
        render();
        toast('Reset to defaults');
    });

    el.copyBtn.addEventListener('click', copySummary);
    el.shareBtn.addEventListener('click', shareLink);
    el.icsBtn.addEventListener('click', downloadIcs);

    el.duration.addEventListener('change', () => {
        state.duration = Number(el.duration.value);
        save();
    });

    el.formatBtn.addEventListener('click', () => {
        state.hour12 = !state.hour12;
        el.formatBtn.textContent = state.hour12 ? '12h' : '24h';
        save();
        render();
    });

    el.themeBtn.addEventListener('click', () => {
        state.theme = state.theme === 'dark' ? 'light' : 'dark';
        applyTheme();
        save();
    });

    el.refZone.addEventListener('change', () => {
        state.refZone = el.refZone.value;
        save();
        syncControlsFromPlanTs();
        render();
    });

    el.planSlider.addEventListener('input', () => {
        state.planTs = planTsFromControls();
        if (state.live) setLive(false);
        else render();
    });

    el.planDate.addEventListener('change', () => {
        state.planTs = planTsFromControls();
        if (state.live) setLive(false);
        else render();
    });

    el.nowBtn.addEventListener('click', () => {
        setLive(true);
        syncControlsFromPlanTs();
        render();
    });

    for (const select of [el.workStart, el.workEnd]) {
        select.addEventListener('change', () => {
            state.workStart = Number(el.workStart.value);
            state.workEnd = Number(el.workEnd.value);
            save();
            render();
        });
    }

    document.addEventListener('keydown', e => {
        if (e.target.matches('input, select, textarea')) return;
        if (e.key === 'n' || e.key === 'N') el.nowBtn.click();
        if (e.key === '/') {
            e.preventDefault();
            el.zoneInput.focus();
        }
    });
}

function tick() {
    if (!state.live) return;
    state.planTs = Date.now();
    syncControlsFromPlanTs();
    updateCards();
    renderReadout();
}

function init() {
    // script.js is also loaded by tests.html, which has none of this markup.
    if (!document.getElementById('clocks')) return;

    for (const id of ['refZone', 'planDate', 'planSlider', 'planTime', 'planZoneLabel', 'nowBtn',
        'overlapStrip', 'overlapLabels', 'suggestions', 'workStart', 'workEnd', 'duration',
        'addForm', 'zoneInput', 'zoneList', 'shareBtn', 'icsBtn', 'copyBtn', 'resetBtn',
        'formatBtn', 'themeBtn', 'clocks', 'emptyState', 'toast']) {
        el[id] = document.getElementById(id);
    }

    load();
    const shared = applyHash();
    if (shared) {
        // Leave the reader's saved plan untouched until they edit something,
        // and drop the hash so a later reload isn't pinned to a stale moment.
        replaceUrl(location.pathname + location.search);
    }
    applyTheme();
    el.formatBtn.textContent = state.hour12 ? '12h' : '24h';
    fillHourSelects();
    fillDatalist();
    renderRefOptions();
    bind();

    if (state.live) state.planTs = Date.now();
    syncControlsFromPlanTs();
    setLive(state.live);
    if (shared) toast('Opened a shared plan');

    setInterval(tick, 1000);
    // Overlap only shifts as the day moves — refresh it on the minute.
    setInterval(() => {
        if (state.live) renderOverlap();
    }, 60000);
}

document.addEventListener('DOMContentLoaded', init);

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

// A short curated list keeps search friendly; the full IANA list is added on top.
const CURATED = [
    ['America/Los_Angeles', 'Los Angeles', '🌴'],
    ['America/Denver', 'Denver', '🏔️'],
    ['America/Chicago', 'Chicago', '🌆'],
    ['America/New_York', 'New York', '🗽'],
    ['America/Toronto', 'Toronto', '🍁'],
    ['America/Mexico_City', 'Mexico City', '🌮'],
    ['America/Bogota', 'Bogotá', '☕'],
    ['America/Sao_Paulo', 'São Paulo', '🇧🇷'],
    ['America/Argentina/Buenos_Aires', 'Buenos Aires', '💃'],
    ['Atlantic/Reykjavik', 'Reykjavík', '🌋'],
    ['Europe/Dublin', 'Dublin', '☘️'],
    ['Europe/London', 'London', '🇬🇧'],
    ['Europe/Lisbon', 'Lisbon', '🐟'],
    ['Europe/Madrid', 'Madrid', '🇪🇸'],
    ['Europe/Paris', 'Paris', '🗼'],
    ['Europe/Amsterdam', 'Amsterdam', '🚲'],
    ['Europe/Berlin', 'Berlin', '🇩🇪'],
    ['Europe/Zurich', 'Zurich', '🏔️'],
    ['Europe/Stockholm', 'Stockholm', '🇸🇪'],
    ['Europe/Warsaw', 'Warsaw', '🇵🇱'],
    ['Europe/Athens', 'Athens', '🏛️'],
    ['Europe/Istanbul', 'Istanbul', '🕌'],
    ['Europe/Kyiv', 'Kyiv', '🌻'],
    ['Europe/Moscow', 'Moscow', '🇷🇺'],
    ['Africa/Lagos', 'Lagos', '🇳🇬'],
    ['Africa/Cairo', 'Cairo', '🏜️'],
    ['Africa/Nairobi', 'Nairobi', '🦁'],
    ['Africa/Johannesburg', 'Johannesburg', '🇿🇦'],
    ['Asia/Jerusalem', 'Tel Aviv', '🇮🇱'],
    ['Asia/Dubai', 'Dubai', '🏙️'],
    ['Asia/Karachi', 'Karachi', '🇵🇰'],
    ['Asia/Kolkata', 'Bengaluru', '🇮🇳'],
    ['Asia/Dhaka', 'Dhaka', '🇧🇩'],
    ['Asia/Bangkok', 'Bangkok', '🏝️'],
    ['Asia/Jakarta', 'Jakarta', '🇮🇩'],
    ['Asia/Singapore', 'Singapore', '🇸🇬'],
    ['Asia/Hong_Kong', 'Hong Kong', '🏮'],
    ['Asia/Shanghai', 'Shanghai', '🇨🇳'],
    ['Asia/Seoul', 'Seoul', '🇰🇷'],
    ['Asia/Tokyo', 'Tokyo', '🗾'],
    ['Australia/Perth', 'Perth', '🦈'],
    ['Australia/Sydney', 'Sydney', '🦘'],
    ['Pacific/Auckland', 'Auckland', '🥝'],
    ['Pacific/Honolulu', 'Honolulu', '🌺'],
    ['UTC', 'UTC', '🌐']
];

// Extra spellings people actually type.
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

const EMOJI = Object.fromEntries(CURATED.map(([tz, , emoji]) => [tz, emoji]));
const NICE_NAME = Object.fromEntries(CURATED.map(([tz, name]) => [tz, name]));

/** First visit follows the reader's OS setting; after that their toggle wins. */
function prefersLight() {
    return typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: light)').matches;
}

/* ------------------------------------------------------------------ *
 * State
 * ------------------------------------------------------------------ */

const state = {
    zones: [],
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

function zoneLabel(tz) {
    if (NICE_NAME[tz]) return NICE_NAME[tz];
    const tail = tz.split('/').pop() || tz;
    return tail.replace(/_/g, ' ');
}

function zoneRegion(tz) {
    const head = tz.split('/')[0];
    return tz.includes('/') ? head.replace(/_/g, ' ') : '';
}

function zoneEmoji(tz) {
    return EMOJI[tz] || '🕘';
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

function defaultZones() {
    const wanted = [DEVICE_TZ, 'America/New_York', 'Europe/London', 'Asia/Tokyo'];
    return [...new Set(wanted)].filter(knownZone);
}

function save() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            zones: state.zones, hour12: state.hour12, theme: state.theme,
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
        state.zones = defaultZones();
        return;
    }
    state.zones = Array.isArray(saved.zones) ? saved.zones.filter(knownZone) : defaultZones();
    if (!state.zones.length) state.zones = defaultZones();
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
    params.set('z', state.zones.join(','));
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
    const zones = (params.get('z') || '').split(',').map(s => s.trim()).filter(knownZone);
    if (!zones.length) return false;
    state.zones = zones;

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

function allZones() {
    let list = [];
    if (typeof Intl.supportedValuesOf === 'function') {
        try {
            list = Intl.supportedValuesOf('timeZone');
        } catch {
            list = [];
        }
    }
    if (!list.length) list = CURATED.map(([tz]) => tz);
    return [...new Set([...CURATED.map(([tz]) => tz), ...list])].filter(knownZone);
}

function resolveQuery(raw) {
    const q = raw.trim().toLowerCase();
    if (!q) return null;
    if (ALIASES[q] && knownZone(ALIASES[q])) return ALIASES[q];

    const zones = allZones();
    const exactId = zones.find(tz => tz.toLowerCase() === q);
    if (exactId) return exactId;

    const exactLabel = zones.find(tz => zoneLabel(tz).toLowerCase() === q);
    if (exactLabel) return exactLabel;

    const aliasKey = Object.keys(ALIASES).find(k => k.startsWith(q));
    const startsWith = zones.find(tz => zoneLabel(tz).toLowerCase().startsWith(q));
    if (startsWith) return startsWith;
    if (aliasKey) return ALIASES[aliasKey];

    return zones.find(tz => tz.toLowerCase().includes(q)) || null;
}

function fillDatalist() {
    const frag = document.createDocumentFragment();
    for (const tz of allZones()) {
        const option = document.createElement('option');
        option.value = zoneLabel(tz);
        option.label = tz;
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

/** For each hour of the planner day (in the reference zone): how many zones are working. */
function overlapByHour() {
    const rows = [];
    for (let hour = 0; hour < 24; hour++) {
        const ts = tsAtRefHour(hour);
        const working = state.zones.filter(tz => inWorkHours(zonedParts(ts, tz).hour));
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

function buildCard(tz) {
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

    root.querySelector('.remove').addEventListener('click', () => removeZone(tz));

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

    node.emoji.textContent = zoneEmoji(tz);
    node.city.textContent = zoneLabel(tz);
    node.zone.textContent = zoneRegion(tz) ? `${zoneRegion(tz)} · ${tz}` : tz;
    return node;
}

function renderCards() {
    for (const [tz, node] of cards) {
        if (!state.zones.includes(tz)) {
            node.root.remove();
            cards.delete(tz);
        }
    }
    for (const tz of state.zones) {
        if (!cards.has(tz)) cards.set(tz, buildCard(tz));
        el.clocks.appendChild(cards.get(tz).root); // also fixes ordering
    }
    el.emptyState.hidden = state.zones.length > 0;
}

function updateCards() {
    const ts = state.planTs;
    const refDay = zonedParts(ts, refTz());
    const withSeconds = state.live;

    for (const tz of state.zones) {
        const node = cards.get(tz);
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
    const total = state.zones.length;
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
    const options = [...new Set([DEVICE_TZ, ...state.zones])];
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

function addZone(tz) {
    if (state.zones.includes(tz)) {
        toast(`${zoneLabel(tz)} is already on the board`);
        return;
    }
    state.zones.push(tz);
    save();
    renderRefOptions();
    render();
    toast(`Added ${zoneLabel(tz)}`);
}

function removeZone(tz) {
    state.zones = state.zones.filter(z => z !== tz);
    save();
    renderRefOptions();
    render();
}

function copySummary() {
    if (!state.zones.length) return;
    const lines = [`Meeting time — ${formatDate(state.planTs, refTz())}`];
    const width = Math.max(...state.zones.map(tz => zoneLabel(tz).length));
    for (const tz of state.zones) {
        const p = zonedParts(state.planTs, tz);
        const flag = inWorkHours(p.hour) ? '' : (hourCategory(p.hour) === 'sleep' ? '  (asleep)' : '  (off hours)');
        lines.push(`• ${zoneLabel(tz).padEnd(width)}  ${formatClock(state.planTs, tz, false)}  ${formatDate(state.planTs, tz)}${flag}`);
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
    const cities = state.zones
        .map(tz => `${zoneLabel(tz)}: ${formatClock(start, tz, false)} ${formatDate(start, tz)}`)
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
        `SUMMARY:${icsEscape('Global sync — ' + state.zones.map(zoneLabel).join(', '))}`,
        `DESCRIPTION:${icsEscape('Local times\n' + cities)}`,
        'END:VEVENT',
        'END:VCALENDAR'
    ];
    return lines.map(icsFold).join('\r\n') + '\r\n';
}

function downloadIcs() {
    if (!state.zones.length) {
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
    if (!state.zones.length) {
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
        const tz = resolveQuery(el.zoneInput.value);
        if (!tz) {
            toast(`No time zone matches “${el.zoneInput.value.trim()}”`);
            return;
        }
        el.zoneInput.value = '';
        addZone(tz);
    });

    el.resetBtn.addEventListener('click', () => {
        state.zones = defaultZones();
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

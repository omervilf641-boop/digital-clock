# ◷ Global Time Planner

Live world clocks — plus a timeline that answers the question a world clock never does:
**when can all of us actually meet?**

Scrub the slider and every city moves together. The bar above the clocks shows, hour by hour,
how many of your cities are inside their working day, and the chips underneath jump straight to
the longest window where the most people are available.

No build step, no dependencies, no server. One HTML file, one stylesheet, one script.

---

## Quick start

```bash
git clone https://github.com/omervilf641-boop/digital-clock.git
cd digital-clock
open index.html          # or: python3 -m http.server 8000
```

Hosting it on GitHub Pages works as-is: Settings → Pages → deploy from the default branch, root folder.

---

## What it does

| | |
|---|---|
| **Live clocks** | Every city ticks in real time, with date, UTC offset and the local abbreviation (EDT, JST…) when there is a meaningful one. |
| **Scrubbable timeline** | Drag the slider (or pick a date) and every clock shows that moment instead of now. "Back to live" returns to real time. |
| **Overlap bar** | 24 columns for the reference day. Column height = how many cities are inside working hours. Click a column to jump to it. |
| **Best-window chips** | The longest runs at the best achievable coverage — "everyone is free 16:00–17:00", or the honest "best possible: 3/4 cities". |
| **Working hours** | Set once, applied to every city. A shift that wraps midnight (22:00–06:00) works too. |
| **Day strip per city** | A 24-hour bar under each clock: green = working, amber = awake, grey = asleep, with a marker on the shown hour. |
| **Share link** | Copies a URL that reopens the exact plan — same cities, same moment, same working hours — for whoever you send it to. |
| **Calendar invite** | Downloads a `.ics` for the selected moment and length, with every city's local time in the description. |
| **Copy summary** | A plain-text block for Slack or email: every city, its local time and whether that lands outside their day. |
| **12/24 hour, light/dark** | The theme follows your OS on a first visit and your toggle after that. Both remembered, along with your city list. |

Everything is stored in `localStorage` on your own machine. Nothing is sent anywhere.

### Keyboard

| Key | Action |
|---|---|
| `/` | focus the city search |
| `N` | back to live time |
| `←` `→` | move the timeline in 15-minute steps (while the slider is focused) |

---

## How to read the overlap bar

```
Best possible — 3/4 cities:   [ 16:00 – 17:00 ]
```

The bar is drawn in the **reference zone** — the dropdown on the left, defaulting to your own.
A full-height column means every city is inside its working day at that hour; a half-height column
means half of them are. When no hour works for everyone, the app says so and offers the best
compromise rather than pretending.

## Share links

`Share link` produces something like:

```
https://…/index.html#z=Asia%2FJerusalem,America%2FNew_York&ref=Asia%2FJerusalem&w=9-17&f=24&d=60&t=1787050800
```

The link carries the plan (cities, reference zone, moment, working hours, clock format, meeting
length) — not the reader's preferences: their theme stays theirs. Opening a link shows the shared
plan without overwriting the reader's own saved city list; the moment they change something, it
becomes theirs.

---

## Time zone handling

All conversion goes through the `Intl` API and the IANA database in the browser, so DST
transitions, half-hour zones (India, +5:30), quarter-hour zones (Nepal, +5:45) and
rule changes are handled by the platform rather than by hand-written offset tables.

Two cases the code handles explicitly:

- **Spring forward** — 02:30 on a US spring-forward day does not exist. `zonedToTs` resolves it to
  a real instant and stays stable if you resolve it again.
- **Fall back** — 01:30 happens twice on a US fall-back day. The earlier of the two is chosen.

## Tests

Open **`tests.html`** in a browser. It loads `script.js` (which no-ops without the planner markup)
and asserts the time math, overlap logic, calendar output and share-link round-trip — 21 cases,
including DST edges and 160 wall-clock round-trips across ten zones and four seasons.

Serving it works too — `python3 -m http.server 8000`, then open
`http://localhost:8000/tests.html`. The page also exposes `window.__testResults`, so a headless
runner can read the pass/fail count without scraping the DOM.

---

## Files

```
index.html    markup for the planner
style.css     theming (light/dark via CSS variables), layout, the strips
script.js     time math, overlap analysis, rendering, share links, .ics export
tests.html    browser-run assertions for everything in script.js that isn't DOM
```

## Browser support

Chrome, Firefox, Safari and Edge, current versions, desktop and mobile. The full IANA city list in
the search box comes from `Intl.supportedValuesOf('timeZone')`; where that is missing, the app falls
back to its curated list of ~45 cities.

## Ideas not built yet

- [ ] Per-city working hours (a 10–18 city next to an 8–16 one)
- [ ] Drag to reorder the clocks
- [ ] Sunrise/sunset shading instead of fixed sleep hours
- [ ] A "who's excluded" list next to each suggested window

## License

MIT.

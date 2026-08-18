# ◷ Global Time Planner

Live world clocks — plus a scrubbable timeline that tells you **which hours everyone can actually make**.

Most world-clock pages stop at "what time is it in Tokyo?". The hard question is the next one: *when can New York, London and Tokyo all take a call?* This page answers it, in the browser, with no build step and no server.

## Features

- **Live clocks** for any IANA time zone, ticking every second, with UTC offset and DST-aware abbreviations (EDT, JST…).
- **Time scrubber** — drag the slider or pick a date to see the same instant across every city at once. Cards switch from live to the scrubbed moment and back with one click.
- **Overlap bar** — 24 columns, one per hour of the reference day, each filled by how many of your cities are inside working hours. Click a column to jump there.
- **Best-window suggestions** — the longest runs where everyone is available, or the best you can do when nobody's schedule lines up. Click a chip to jump to that window.
- **Configurable working hours** (including overnight ranges like 22:00–06:00).
- **Day-shift badges** (`+1 day` / `−1 day`) so a 2 a.m. Wednesday in Sydney never gets mistaken for today.
- **Per-city day strip** — 24 blocks coloured working / awake / asleep, with a marker on the current hour.
- **Copy summary** — one click puts a paste-ready per-city breakdown of the selected moment on your clipboard.
- **12/24-hour and light/dark**, remembered along with your city list via `localStorage`.
- **Keyboard**: `/` focuses the search box, `n` jumps back to live.

## Run it

Open `index.html` in a browser. That's the whole setup.

For a local server (needed if your browser restricts `file://` storage):

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

## How to use

| Action | How |
| --- | --- |
| Add a city | Type a name (`Tel Aviv`, `Berlin`, `Asia/Seoul`) and press Enter |
| Remove a city | Hover the card, click `×` |
| Pick a meeting time | Drag the slider, or click any column in the overlap bar |
| Jump to a good window | Click one of the suggested time chips |
| Change the reference zone | Use the "Reference zone" dropdown — the slider, date and suggestions all follow it |
| Return to the current time | Click "Back to live" (or press `n`) |
| Share the plan | "Copy summary" |

Search accepts city names, full IANA identifiers, and common shorthands (`nyc`, `sf`, `bangalore`, `uk`, `gmt`). Everything `Intl.supportedValuesOf('timeZone')` reports is available, with ~45 major cities given friendly names and flags.

## How the time math works

All conversions go through `Intl.DateTimeFormat`, so DST rules come from the browser's own tz database rather than hardcoded offsets:

- `zonedParts(ts, tz)` reads the wall-clock fields a zone shows at an instant.
- `offsetMinutes(ts, tz)` derives the offset by comparing those fields back against UTC.
- `zonedToTs(y, m, d, h, min, tz)` is the inverse — it finds the instant at which a zone shows a given wall clock, with a second pass so DST transitions land correctly.

The overlap bar builds each column with `zonedToTs` on the reference day and then asks every city what hour it is at that instant, so a column is correct even when cities cross a DST boundary in different weeks.

## Files

```
digital-clock/
├── index.html    # markup
├── style.css     # theming, layout, the strips
├── script.js     # time math, planner state, rendering
└── README.md
```

No dependencies, no tracking, nothing leaves the browser.

## Ideas for later

- [ ] Shareable URL that encodes cities + selected moment
- [ ] Per-city working hours instead of one global range
- [ ] Drag to reorder cards
- [ ] `.ics` export for the chosen slot
- [ ] Sunrise/sunset shading on the day strip

## License

MIT.

# ◷ Global Time Planner

Live world clocks — plus a timeline that answers the question a world clock never does:
**when can all of us actually meet?**

Scrub the slider and every clock moves together. The bar above them shows, hour by hour, how many
of your places are inside their working day, and the chips underneath jump straight to the longest
window where the most people are available.

**Every country is in there** — 247 of them, 273 clocks, straight from the IANA time zone database,
each with its flag and its own zone. Type a country, a city, or an ISO code.

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
| **Every country** | 247 countries and 273 clocks, generated from the IANA tz database — flag, country, city and zone id for each. Search by country ("Kenya"), city ("Nairobi"), ISO code ("KE") or zone id ("Africa/Nairobi"). |
| **Live clocks** | Every place ticks in real time, with date, UTC offset and the local abbreviation (EDT, JST…) when there is a meaningful one. |
| **Scrubbable timeline** | Drag the slider (or pick a date) and every clock shows that moment instead of now. "Back to live" returns to real time. |
| **Overlap bar** | 24 columns for the reference day. Column height = how many places are inside working hours. Click a column to jump to it. |
| **Best-window chips** | The longest runs at the best achievable coverage — "everyone is free 16:00–17:00", or the honest "best possible: 3/4 cities". |
| **Working hours** | Set once, applied to every place. A shift that wraps midnight (22:00–06:00) works too. |
| **Day strip per clock** | A 24-hour bar under each clock: green = working, amber = awake, grey = asleep, with a marker on the shown hour. |
| **Share link** | Copies a URL that reopens the exact plan — same places, same moment, same working hours — for whoever you send it to. |
| **Calendar invite** | Downloads a `.ics` for the selected moment and length, with every city's local time in the description. |
| **Copy summary** | A plain-text block for Slack or email: every place, its local time and whether that lands outside their day. |
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
https://…/index.html#z=IL%40Asia%2FJerusalem%2CUS%40America%2FNew_York&ref=Asia%2FJerusalem&w=9-17&f=24&d=60&t=1787050800
```

The link carries the plan (places, reference zone, moment, working hours, clock format, meeting
length) — not the reader's preferences: their theme stays theirs. Opening a link shows the shared
plan without overwriting the reader's own saved places; the moment they change something, it
becomes theirs. Links from before countries existed, which carried bare zone ids, still open.

---

## Where the countries come from

The country list is generated from the tz database shipped with the system (`zone.tab` and
`iso3166.tab`), not hand-written. Each country gets **its own** zone id, which matters more than it
sounds: tzdb groups countries whose rules have matched since 1970, so a naive read files Zimbabwe
under Mozambique's zone, Angola under Nigeria's, and — as the tests caught — Germany under
Switzerland's. Every row here carries the country's own id and its own city.

A handful of countries are wide enough that one clock would hide a real difference; those carry
several, each a distinct offset: the US, Canada, Russia, Brazil, Australia, Mexico, Indonesia,
Kazakhstan, Chile, Portugal, Spain, Ecuador and DR Congo.

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
and asserts the time math, overlap logic, country table, calendar output and share-link
round-trip — 26 cases, including DST edges, 160 wall-clock round-trips across ten zones and four
seasons, and a check that no country borrows a neighbour's zone.

Serving it works too — `python3 -m http.server 8000`, then open
`http://localhost:8000/tests.html`. The page also exposes `window.__testResults`, so a headless
runner can read the pass/fail count without scraping the DOM.

---

## Files

```
index.html    markup for the planner
style.css     theming (light/dark via CSS variables), layout, the strips
script.js     the country table, time math, overlap analysis, rendering, sharing, .ics
tests.html    browser-run assertions for everything in script.js that isn't DOM
```

## Browser support

Chrome, Firefox, Safari and Edge, current versions, desktop and mobile. Search also accepts any
zone id the browser knows via `Intl.supportedValuesOf('timeZone')`, on top of the 273 built in.

## Ideas not built yet

- [ ] Per-place working hours (a 10–18 country next to an 8–16 one)
- [ ] Drag to reorder the clocks
- [ ] Sunrise/sunset shading instead of fixed sleep hours
- [ ] A "who's excluded" list next to each suggested window

## Also in this repo: אי החברזים (a game for ages 5–6)

`game.html` is a separate, self-contained little game in Hebrew — a creature-collecting island for a
five- or six-year-old. Open it directly:

```bash
open game.html      # or: python3 -m http.server 8000  →  localhost:8000/game.html
```

Twenty-four original creatures — twenty-one across seven areas, and three rare ones that live nowhere. Meeting one means solving a single tiny
puzzle and then throwing a friendship star. The rules that matter are the ones about being five:

- **Nothing can be lost.** A wrong tap is answered with "almost, try again", never with a failure.
- **No timers**, no score to beat, no game-over screen.
- **Everything is read aloud** (`speechSynthesis`, `he-IL`), so a child who can't read yet plays alone.
- Every control is a thumb-sized button; all text is vowelled for a parent reading along.

Each area brings its own puzzles, and the new ones ask for a bit more than the last:

| Area | Puzzles it introduces |
|---|---|
| 🏖️ חוף הים · 🌴 יער הג'ונגל | matching, counting to 5, colours, big/small |
| 🌋 הר האש · 🌟 שביל הכוכבים | shapes, odd-one-out |
| 💎 מערת הגבישים | **patterns** — ABAB, then AAB and ABC |
| ☁️ ענני הסוכר | **addition** — two groups, sums to 10 |
| 🤖 עיר הרובוטים | **memory** (what vanished) and **first letters** of Hebrew words |

Areas unlock as friends are collected, and the album — grouped by area, with a count per group —
keeps its silhouettes until you meet each one.

### Who's playing

Up to three players share the device, each with their own island: collection, character, shells,
purchases, room, and difficulty level. A picker on startup shows each player's character and how
many friends they've found; 👥 on the title screen switches between them. A save from before
profiles existed becomes player one.

Difficulty is per player, so an older sibling racing ahead doesn't hand the younger one level-3
puzzles.

### Who you are

The first time you play, you build a character: skin tone, one of five hairstyles, hair colour,
shirt colour, and a name you type in. Every option is a tap on a picture of itself — no English
words, no dropdowns — and the figure updates live as you choose. That character then walks around
the island with you and stands on the title screen.

### Going for a walk

The map has a **לָצֵאת לְטִיּוּל** button. Pick one of the friends you've caught and the two of you
set off across a scrolling landscape while flowers, butterflies, shells and crystals drift past.
Tap whatever you want to keep; it goes into your bag, which is shown on the map and kept forever.
Six finds and you arrive at a picnic. Anything you don't tap simply carries on by — nothing here
can be missed or lost, and you can turn back at any moment.

Walking together cheers the friend up, so it's the third way to look after them.

### Shells, and what to spend them on

Shells (🐚) are the island's money. They turn up on walks more often than the other keepsakes, and
arriving at the picnic pays two more, so no walk comes back empty-handed — about six a trip.

צִדְפּוֹנִי's shop sells eight accessories for your friends — crown, cap, ribbon, flower, glasses,
scarf, bow tie, balloon — priced 3 to 8 shells, plus three extra hairstyles for your own character
that stay locked in the builder until bought. Each accessory is drawn onto the creature itself and
occupies one slot (head, face, neck, hand), so a friend can wear a crown, glasses and a scarf at
once. Tap an item on their care screen to put it on, tap again to take it off; whatever they're
wearing follows them into the album, onto walks, and into every puzzle.

There are four **dolls** too — teddy, bunny, a little chavrez, a star — sold on their own shelf. A
doll is just an accessory that happens to be a plush, so a friend carries theirs everywhere.

Nothing here can go wrong either: prices are checked before a purchase, there's no debt, everything
bought is kept forever, and being short is answered with how many more shells to find rather than a
refusal.

### The picnic, and what might turn up on the way

Arriving lays an actual picnic: a checked blanket, a basket, food, and the two of you sitting down
to eat together — the friend you brought is fed, not just cheered.

And on any given walk there's a **10% chance** of meeting one of three creatures that live in no area
at all — זְהַבְהָב, קַשְׁתּוֹנִי, לַיְלוֹנִי. They drift past glowing, and befriending one takes **two puzzles
instead of one**, drawn from every type in the game. Their album cards say only that they might turn
up on a walk. Once all three are found, no more sightings occur.

### A room of your own

Everything found on a walk that isn't a shell used to become a number on the map and nothing more.
🏡 **הַחֶדֶר שֶׁלִּי** gives it somewhere to go: an eight-slot shelf where treasures and the dolls you
bought get displayed, with your character standing on the rug below. Tap something in the tray to
put it on the shelf, tap it on the shelf to take it back. No dragging — a five-year-old shouldn't
have to fight the interface. Shells stay out of it; money isn't an ornament.

### When an area is finished

Once every friend in an area is found, going back pays **2–3 shells** for a solved puzzle instead of
handing over a duplicate. All seven places stay worth visiting, and there's a second way to earn
besides walking. 🎲 **הַפְתִּיעוּ אוֹתִי** picks an unlocked area at random for when choosing is the
hard part.

### Looking after them

Every friend you catch has three needs — fed, happy, rested — that drift down slowly over real
time. Tapping a friend in the album opens their care screen: feed them (each type has a favourite
food, but any food works), tickle them three times, or put them to sleep, which dims the screen for
a short lullaby while they nap.

The Tamagotchi guilt loop is deliberately absent. A need never falls below 1, a week away costs no
more than a day away does, nothing ever gets sick or dies, and the worst thing a creature will say
is that it's a little hungry. The album nudges only when someone is genuinely low.

Progress — friends, their needs, your character, your bag and everything you've bought — is saved
in `localStorage`; the 🔊,
🗣️ and ↺ buttons on the title screen toggle sound, speech, and start over. No build step and no dependencies — `game.html`, `game.css`, `game.js`,
plus one webfont that falls back cleanly when offline.

## License

MIT.

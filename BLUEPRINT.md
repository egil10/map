# GeoQuest — Build Blueprint

A single reference for how this site is built: its architecture, styling, fonts,
colours, data format, and rendering pipeline. Use it to understand, maintain, or
rebuild GeoQuest from scratch.

---

## 1. What it is

**GeoQuest** is a client-side, zero-build world-map quiz. A world map is coloured
by one of 200+ country datasets and the player either:

- **Play mode** — guesses *which dataset* the colouring represents from four
  multiple-choice options (10 rounds, then a results screen).
- **Learn mode** — browses datasets freely with Previous / Next navigation and a
  searchable dataset browser.

It is pure HTML + CSS + vanilla JavaScript with two CDN libraries (Leaflet,
Lucide). There is **no build step, no framework, no bundler, no backend** — it is
served as static files and runs entirely in the browser. This makes it trivially
deployable to GitHub Pages or any static host.

---

## 2. Tech stack

| Concern | Choice | Notes |
|---|---|---|
| Map engine | [Leaflet](https://leafletjs.com/) `1.9.4` (CDN, SRI-pinned) | GeoJSON country polygons over a tile basemap |
| Basemap tiles | CartoDB **Positron** (`light_all`) | Clean, minimal, light-grey cartography |
| Country shapes | GeoJSON from `datasets/geo-countries` (+ holtzy world fallback) | Loaded at runtime; microstates patched in by code |
| Icons | [Lucide](https://lucide.dev/) `0.469.0` (CDN) | `<i data-lucide="...">` placeholders, hydrated by `lucide.createIcons()` |
| Font | **Space Grotesk** (Google Fonts, weights 300–700) | The single brand typeface |
| Data | Static JSON files in `/data` | Fetched in parallel at load |
| Language | Vanilla ES6 classes | No transpilation |

CDN connections are warmed with `<link rel="preconnect">` / `preload`, and all
scripts use `defer` so parsing never blocks.

---

## 3. File / folder map

```
map/
├── index.html              # Single page; markup shell + resource loading
├── css/
│   └── style.css           # All styling (≈1.8k lines, one file)
├── js/
│   ├── map.js              # WorldMap class — Leaflet, GeoJSON, colouring, legend
│   ├── quiz.js             # QuizGame class — dataset loading, game logic, modes
│   ├── app.js              # App class — orchestration, controls, CSV export
│   └── country_mapping.js  # Country-name alias data
├── data/                   # 200+ *_by_country.json datasets
├── assets/
│   └── favicon.ico
├── docs/                   # Extended guides (data, deployment, testing, etc.)
├── BLUEPRINT.md            # ← this file
└── README.md
```

### Responsibilities

- **`app.js` (`App`)** — boot orchestration. Waits for the map and quiz to be
  ready, hides the loading screen, wires the top-level controls (mode toggle,
  reset view, legend toggle, CSV download, clipboard copy, dataset browser),
  and manages the source-attribution / dataset-counter chips.
- **`map.js` (`WorldMap`)** — owns the Leaflet map. Loads country GeoJSON,
  builds the country layer, resolves dataset country names to GeoJSON names
  (`resolveToGeoName`), computes per-country fill colours, renders the rankings
  list and the colour bar, and handles hover tooltips.
- **`quiz.js` (`QuizGame`)** — loads every dataset in `/data`, normalises each
  into a common quiz object, runs Play and Learn modes, tracks score/streak/
  progress, and renders the multiple-choice UI and completion screen.
- **`country_mapping.js`** — static alias tables for country-name
  reconciliation between datasets and the GeoJSON.

Global handoff is via `window`: `window.mapInstance`, `window.quizGame`,
`window.app`. The map signals readiness with a `mapReadyForQuiz` CustomEvent.

---

## 4. Boot sequence / data flow

```
DOMContentLoaded
   │
   ├─ new WorldMap()         → init Leaflet, fetch country GeoJSON, build layer
   ├─ new QuizGame()         → fetch all /data JSON in parallel, normalise
   └─ new App()              → waitForMap() + waitForQuiz() (polling promises)
                                   │
                                   └─ showGame(): fade out loading screen,
                                      reveal .app-container, invalidateSize()

Each round / dataset change:
   QuizGame.startNewQuiz() / loadLearnModeDataset()
      → WorldMap.applyQuizConfiguration(quiz, mode)
            • resolveToGeoName() maps dataset keys → GeoJSON names
            • countriesLayer.setStyle(getCountryStyle)   ← colours every country
            • createLegend() → rankings list + colour bar
      → QuizGame.updateColorBar()  (min / Q1 / mid / Q3 / max labels)
```

### Colouring pipeline (`getCountryStyle` → `getColorForValue`)

- **Numeric datasets** → linear gradient between the dataset's `minColor` and
  `maxColor`, interpolated in RGB by `interpolateColor()`. The value range
  (min/max) is computed **once per quiz and cached on `quiz._valueRange`** —
  `getColorForValue` runs once per country on every restyle, so this avoids an
  O(n²) recompute. The cache is invalidated whenever the country set is rebuilt.
- **Categorical datasets** → each distinct category gets a fixed colour from a
  20-colour palette, stored on each country as `data.color`.
- Countries with **no data** stay white (`#ffffff`) with a light-grey border.

`getCountryStyle` is a hot path (called per country, per restyle) and is kept
allocation- and log-free for smoothness.

---

## 5. Data format

Datasets live in `/data/*.json`. The loader (`QuizGame.convertToQuizFormat`)
accepts several shapes and normalises them. Two canonical forms:

**Array form** (value key auto-detected if not named `value`):
```json
{
  "title": "Average Height by Country (2023)",
  "source": "https://...",
  "data": [
    { "country": "Netherlands", "average_height_cm": 177.1 },
    { "country": "Montenegro",  "average_height_cm": 176.6 }
  ]
}
```

**Object form** (explicit `value` / `unit`, supports categorical strings):
```json
{
  "title": "Countries by Continent",
  "description": "Geographic continent classification ...",
  "unit": "continent",
  "source": "https://...",
  "data": {
    "Afghanistan": { "Country Name": "Afghanistan", "value": "Asia",   "unit": "continent" },
    "Albania":     { "Country Name": "Albania",     "value": "Europe", "unit": "continent" }
  }
}
```

Normalisation produces the internal **quiz object**:
```js
{
  id, title, description, category, tags,
  answer_variations,        // accepted text answers (lower-cased)
  source,                   // attribution URL (optional)
  colorScheme,              // { type:'gradient', minColor, maxColor } | { type:'categorical', categories, ... }
  countries: { "<GeoJSON name>": { value, unit, color? } }
}
```

A dataset is **categorical** if every value is a string; otherwise it's
**numeric (gradient)**. Datasets with fewer than 4 valid sibling datasets, or
with no valid values, are skipped. To add a dataset: drop a JSON file in `/data`
and add its filename to the `dataFiles` array in `quiz.js`.

---

## 6. Layout

A full-viewport vertical flex split — **no scrolling of the shell**
(`body { overflow: hidden }`).

```
┌──────────────────────────────────────────────┐
│                                                │
│   MAP AREA            flex: 0 0 80vh           │  ← Leaflet map
│   · reset-view button (top-left, below zoom)   │
│   · rankings legend  (top-right, toggleable)   │
│   · progress circles (bottom-left, 10 dots)    │
│   · hover tooltip / answer title (top-centre)  │
│                                                │
├──────────────────────────────────────────────┤
│   FOOTER AREA         flex: 0 0 20vh           │
│   [mode toggle]   input / choices   [controls] │
│   source · feedback · COLOUR BAR (min→max)     │
└──────────────────────────────────────────────┘
```

- **Map area**: `flex: 0 0 80vh`, light background `#f8f9fa`.
- **Footer area**: `flex: 0 0 20vh`, frosted white
  (`rgba(255,255,255,.98)` + `backdrop-filter: blur(20px)`), `border-top`
  hairline, column flex with `justify-content: space-between`.
- Floating map widgets are absolutely positioned with `z-index` 1000–1001;
  modals (dataset browser, mode menu) sit at `z-index` 2000; the loading
  screen at `9999`.

### Responsive breakpoints

| Width | Map height | Key changes |
|---|---|---|
| Desktop (default) | `80vh` | Floating chips; 4-column choice grid |
| `≤ 768px` | `50vh` | Toggle/controls/counter become full-width stacked rows; legend docks bottom-right |
| `≤ 576px` | `40vh` | Tighter choice buttons; smaller legend |

The 4-option multiple-choice grid is `grid-template-columns: 1fr 1fr 1fr 1fr`
on desktop, kept width-aligned with the colour bar (both `max-width: 800px`,
centred).

---

## 7. Colour palette

Light theme only — `color-scheme: light` is forced. Tailwind-ish accents.

| Role | Hex | Usage |
|---|---|---|
| Background | `#ffffff` | Page, loading screen, surfaces |
| Map area | `#f8f9fa` | Behind the map |
| Text primary | `#1a1a1a` | Headings, body, dark buttons |
| Text muted | `#666666` | Secondary labels, captions |
| Hairline borders | `#e5e5e5`, `#e1e5e9` | Inputs, chips, cards |
| Country border / empty | `#cccccc`, `#d1d5db` | No-data countries, dashed circles |
| **Accent blue** | `#3b82f6` | Primary action, focus ring, active state |
| Accent blue (deep) | `#1d4ed8`, `#2563eb` | Tooltip value gradient, link hover |
| Legend value | `#007bff` | Rankings value text |
| Success green | `#16a34a` (fill `#22c55e`) | Correct answers, progress |
| Error red | `#dc2626` (fill `#ef4444`) | Wrong answers, progress |
| Hint amber | `#ffc107` / `#f59e0b` | Hint button & feedback |
| Surface grey | `#f5f5f5` | Idle buttons, toggle track |
| Hover surface | `#f8fafc`, `#ebebeb` | Button / item hover |

### Dataset gradient schemes (numeric)
Eight `minColor → maxColor` pairs are assigned at random per numeric dataset
(defined in `quiz.js`), e.g. `#fff3e0 → #e65100` (orange), `#e8f5e8 → #2e7d32`
(green), `#e3f2fd → #1976d2` (blue), plus pink, purple, amber, teal, lime.

### Categorical palette (20 colours)
`#e74c3c #3498db #2ecc71 #f39c12 #9b59b6 #1abc9c #e67e22 #34495e #95a5a6 #d35400
#c0392b #8e44ad #27ae60 #2980b9 #f1c40f #16a085 #e84393 #00b894 #6c5ce7 #fdcb6e`
— assigned to categories in order, wrapping with modulo.

---

## 8. Typography

- **Family:** `'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI',
  Roboto, sans-serif`.
- **Weights loaded:** 300, 400, 500, 600, 700.
- **Base:** `14px`, `line-height: 1.4`, weight 400 on `<body>`.
- **Scale in use:** loading/completion title `42px/700`; learn-mode title
  `18px/600`; section labels `11px/600` uppercase with `0.5px` letter-spacing;
  colour-bar labels `10–11px`; ranking rows `12–13px`.
- Headline tracking is tightened (`letter-spacing: -0.02em`) on the big title.

---

## 9. Component cheatsheet

| Component | Selector(s) | Notes |
|---|---|---|
| Loading screen | `.loading-screen`, `.logo-circle`, `.logo-inner` | Spinning ring + pulsing globe emoji; fades out (`0.5s`) in `App.showGame()` |
| Mode toggle | `.game-mode-toggle`, `.toggle-option(.active)` | Learn / Play pill; active = black fill |
| Multiple choice | `.multiple-choice`, `.choice-btn(.correct/.incorrect)` | 4-up grid; green/red after answering, auto-advances after 2 s |
| Text guess (learn-ish) | `.guess-input`, `.submit-btn`, `.hint-btn` | 56 px tall; blue focus ring; amber hint |
| Rankings legend | `.new-legend`, `.legend-item`, `.sort-toggle-btn` | Top-right; click a row to flash that country; sort asc/desc |
| Colour bar | `.color-bar`, `.color-bar-gradient`, `.color-bar-*` labels | min / Q1 / mid / Q3 / max quartile labels (hidden for categorical) |
| Progress | `.progress-circles`, `.progress-circle.(current/correct/wrong/empty)` | 10 Lucide circles, bottom-left |
| Hover tooltip | `.country-tooltip`, `.country-hover-tooltip` | Country name + value; matches on GeoJSON `properties.name` |
| Control buttons | `.control-buttons`, `.control-btn(.active)` | Legend / download / copy / GitHub |
| Dataset browser | `.dataset-browser`, `.dataset-grid`, `.dataset-item` | Modal grid, Learn mode only |
| Completion | `.completion-backdrop`, `.completion-screen` | Blurred backdrop + score / answer breakdown |

Common visual language: `border-radius` 6–16px, hairline `1px` borders,
soft shadows (`0 2px 8px` → `0 20px 60px rgba(0,0,0,.x)`), frosted panels via
`backdrop-filter: blur(20px)`, and `0.15s–0.3s ease` transitions.

---

## 10. Accessibility & performance notes

- **Keyboard focus:** `:focus-visible` rings (blue, 2px) on all interactive
  controls — visible for keyboard users, not on mouse click.
- **Reduced motion:** `@media (prefers-reduced-motion: reduce)` disables the
  looping loader animations and neutralises transitions.
- **Production logging:** an inline guard in `<head>` no-ops
  `console.log/info/debug` on non-localhost hosts (keeps `warn`/`error`), so the
  console stays clean and logging overhead is removed in production.
- **Render hot paths** (`getCountryStyle`, `getColorForValue`) are kept free of
  logging and redundant allocation; the value range is memoised per quiz.
- **Loading:** `preconnect`/`preload` hints for fonts, tiles, and Leaflet;
  all scripts `defer`; datasets fetched in parallel with `Promise.all`.

---

## 11. Keyboard shortcuts

| Key | Action |
|---|---|
| `Enter` | Submit guess / advance to next question |
| `H` | Show hint |
| `S` | Skip current quiz |
| `N` | New quiz |
| `Esc` | Clear country selection |

(Disabled while typing in an input, except `Esc`.)

---

## 12. Rebuilding from scratch — checklist

1. **Shell:** one `index.html` — `<head>` loads Space Grotesk, Leaflet CSS/JS
   (SRI-pinned), Lucide, `css/style.css`, then the four `js/*` files with
   `defer`; add the production console guard. `<body>` holds the loading screen,
   `.app-container` (`.map-area` + `.footer-area`), tooltip, rankings, and the
   two modals.
2. **Map:** in `WorldMap.init()` create `L.map('map')`, set min/max zoom (1–4)
   and world `maxBounds`, add the CartoDB Positron tile layer, fetch country
   GeoJSON, build the GeoJSON layer with `getCountryStyle` + hover/click
   handlers, and patch in missing microstates.
3. **Data:** put `*_by_country.json` files in `/data`, list them in `quiz.js`,
   and let `convertToQuizFormat` normalise to the quiz object.
4. **Game:** `QuizGame` drives Play (multiple choice, 10 rounds, completion
   screen) and Learn (prev/next + browser) modes; `App` wires controls and
   reveals the UI once both are ready.
5. **Style:** one `style.css` — fixed 80/20 vertical split, light theme, Space
   Grotesk, the palette in §7, frosted footer/panels, and the responsive
   breakpoints in §6. Keep the accessibility block at the end.

---

*Single-page, static, no-build. Drop on any static host (e.g. GitHub Pages) and
it runs.*

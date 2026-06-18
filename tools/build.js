// Build step for static assets. Run after changing datasets or the base map:
//   node tools/build.js
//
// Produces two generated files the app loads at runtime:
//   1. data/datasets.bundle.json  — every dataset in one request (was 235 fetches)
//   2. data/world_countries.geojson — precision-reduced base map (was a 14.6 MB
//      remote download on every page load)

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');

/* ----------------------------- 1. DATASET BUNDLE ----------------------------- */

// Files in data/ that are not quiz datasets.
const NON_DATASETS = new Set([
  'country_mapping.json',
  'quiz_data.json',
  'datasets.bundle.json',
  'manifest.json',
]);

const datasetFiles = fs
  .readdirSync(DATA_DIR)
  .filter((f) => f.endsWith('.json') && !NON_DATASETS.has(f))
  .sort();

const bundle = {};
for (const file of datasetFiles) {
  bundle[file] = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'));
}
fs.writeFileSync(path.join(DATA_DIR, 'datasets.bundle.json'), JSON.stringify(bundle));
// Manifest is the fallback used when the bundle can't be fetched.
fs.writeFileSync(path.join(DATA_DIR, 'manifest.json'), JSON.stringify(datasetFiles));
console.log(`Bundle: ${datasetFiles.length} datasets -> data/datasets.bundle.json (+ manifest.json)`);

/* ----------------------------- 2. SIMPLIFIED GEOJSON ----------------------------- */

// Source: full-resolution world borders cached under tools/.cache. We only reduce
// coordinate precision and drop consecutive duplicate points — names/topology are
// preserved exactly, so country matching is unaffected.
const SRC = path.join(__dirname, '.cache', 'world.geojson');
if (!fs.existsSync(SRC)) {
  console.warn('Skipping GeoJSON: tools/.cache/world.geojson not found.');
  process.exit(0);
}

const PRECISION = 2;   // ~1.1 km at the equator; ample for a zoom 1–4 world map.
const TOLERANCE = 0.05; // Douglas–Peucker tolerance in degrees (~5 km).
const round = (n) => Number(n.toFixed(PRECISION));

function perpDist(p, a, b) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  if (dx === 0 && dy === 0) return Math.hypot(p[0] - a[0], p[1] - a[1]);
  const t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy);
  const px = a[0] + t * dx;
  const py = a[1] + t * dy;
  return Math.hypot(p[0] - px, p[1] - py);
}

// Iterative Douglas–Peucker (explicit stack) so very large rings don't overflow.
function douglasPeucker(points, tol) {
  if (points.length < 3) return points;
  const keep = new Uint8Array(points.length);
  keep[0] = keep[points.length - 1] = 1;
  const stack = [[0, points.length - 1]];
  while (stack.length) {
    const [first, last] = stack.pop();
    let maxD = 0;
    let idx = -1;
    for (let i = first + 1; i < last; i++) {
      const d = perpDist(points[i], points[first], points[last]);
      if (d > maxD) { maxD = d; idx = i; }
    }
    if (maxD > tol && idx !== -1) {
      keep[idx] = 1;
      stack.push([first, idx], [idx, last]);
    }
  }
  return points.filter((_, i) => keep[i]);
}

function roundRing(ring, prec) {
  const out = [];
  let prev = null;
  for (const pt of ring) {
    const r = [Number(pt[0].toFixed(prec)), Number(pt[1].toFixed(prec))];
    if (!prev || r[0] !== prev[0] || r[1] !== prev[1]) out.push(r);
    prev = r;
  }
  if (out.length >= 2 && (out[0][0] !== out[out.length - 1][0] || out[0][1] !== out[out.length - 1][1])) {
    out.push([out[0][0], out[0][1]]); // keep the ring closed
  }
  return out;
}

function simplifyRing(ring) {
  const simplified = roundRing(douglasPeucker(ring, TOLERANCE), PRECISION);
  if (simplified.length >= 4) return simplified;
  // Tiny feature (e.g. Monaco, Vatican, Tuvalu): keep its shape at higher
  // precision rather than letting it collapse and disappear from the map.
  const detailed = roundRing(ring, 4);
  return detailed.length >= 4 ? detailed : null;
}

function simplifyGeometry(geom) {
  if (!geom) return geom;
  if (geom.type === 'Polygon') {
    geom.coordinates = geom.coordinates.map(simplifyRing).filter(Boolean);
  } else if (geom.type === 'MultiPolygon') {
    geom.coordinates = geom.coordinates
      .map((poly) => poly.map(simplifyRing).filter(Boolean))
      .filter((poly) => poly.length > 0);
  }
  return geom;
}

const gj = JSON.parse(fs.readFileSync(SRC, 'utf8'));
for (const f of gj.features) {
  // Keep only the name property the app reads; drop the rest to shrink the file.
  f.properties = { name: f.properties.name };
  f.geometry = simplifyGeometry(f.geometry);
}
gj.features = gj.features.filter((f) => f.geometry && f.geometry.coordinates && f.geometry.coordinates.length);

const out = path.join(DATA_DIR, 'world_countries.geojson');
fs.writeFileSync(out, JSON.stringify(gj));
const srcMB = (fs.statSync(SRC).size / 1e6).toFixed(1);
const outMB = (fs.statSync(out).size / 1e6).toFixed(1);
console.log(`GeoJSON: ${gj.features.length} features, ${srcMB} MB -> ${outMB} MB (data/world_countries.geojson)`);

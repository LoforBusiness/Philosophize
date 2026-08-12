// Can the launch screen be read, and does its art obey its own rules?
//
//   node scripts/check-launch.mjs        (npm run check:launch)
//
// The launch screen inverted its legibility scheme: the foreground is now the
// DARK end and the quote is cream over a scrim, which is what let the art stop
// being a blank sheet below the horizon. That inversion is only safe if every
// element's background is decided by construction and then MEASURED. This is the
// measurement.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { coverage } from './lib/rasterpath.mjs';

const REPO = process.cwd();
const { transform } = await import(
  pathToFileURL(path.join(REPO, 'node_modules/sucrase/dist/index.js')).href,
);
const TMP = path.join(os.tmpdir(), 'deeply-launch-check');
fs.mkdirSync(TMP, { recursive: true });
function emit(rel, name) {
  const src = fs.readFileSync(path.join(REPO, rel), 'utf8')
    .replace(/from '@\/components\/lesson\/cinematic\/rig'/g, "from './rig.mjs'");
  fs.writeFileSync(path.join(TMP, name),
    transform(src, { transforms: ['typescript'] }).code);
  return pathToFileURL(path.join(TMP, name)).href;
}
// rig.mjs must exist on disk before launchArt.mjs is imported — launchArt's
// rig import is rewritten to './rig.mjs' above. Bound to `R` because the figure
// checks added in a later task solve the skeleton with it.
const R = await import(emit('components/lesson/cinematic/rig.ts', 'rig.mjs'));
const A = await import(emit('components/launch/launchArt.ts', 'launchArt.mjs'));

let bad = 0;
const ok = (cond, label, detail = '') => {
  if (!cond) bad++;
  console.log(`  ${cond ? 'ok  ' : 'FAIL'}  ${label}${detail ? '  — ' + detail : ''}`);
};

// ── WCAG luminance, the same arithmetic check-quickstart-contrast.mjs uses ────
const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
const hexRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lum = (hex) => { const [r, g, b] = hexRgb(hex); return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b); };
const ratio = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

// ── 1 · the palettes are real ramps, not near-flat ones ──────────────────────
// tone.ts shipped #FEFEFC→#DFDBD1 — a 7% range — and it read as flat at every
// size. It needed a real swing before it registered as shading at all. Anything
// narrower than 0.45 of luminance across six steps is that mistake again.
const MIN_SWING = 0.45;
ok(A.SCENE_KEYS.length === 6, 'six scenes', A.SCENE_KEYS.join(' '));
for (const key of A.SCENE_KEYS) {
  const p = A.PALETTES[key];
  ok(!!p, `${key}: has a palette`);
  if (!p) continue;
  ok(p.steps.length === 6, `${key}: six tonal steps`, String(p.steps.length));
  const L = p.steps.map(lum);
  const rising = L.every((v, i) => i === 0 || v > L[i - 1]);
  ok(rising, `${key}: steps run darkest → lightest`, L.map((v) => v.toFixed(2)).join(' '));
  ok(L[5] - L[0] >= MIN_SWING, `${key}: the ramp actually swings`,
    `${(L[5] - L[0]).toFixed(2)}, need ${MIN_SWING}`);
}

// ── 2 · chrome is legible on its own sky, whichever end that sky is ──────────
for (const key of A.SCENE_KEYS) {
  const c = A.chromeOn(key);
  ok(c === A.INK || c === A.CREAM, `${key}: chrome is ink or cream`, c);
  const sky = A.skyBandTone(key);
  ok(ratio(lum(c), lum(sky)) >= 4.5, `${key}: chrome reads on its sky`,
    `${ratio(lum(c), lum(sky)).toFixed(1)}:1 on ${sky}`);
}

// ── 3 · the planes recede, and are drawable offline ──────────────────────────
for (const key of A.SCENE_KEYS) {
  const planes = A.planesFor(key);
  ok(planes.length >= 4 && planes.length <= 6, `${key}: 4-6 depth planes`, String(planes.length));
  // Back to front means each plane is DARKER than the one behind it. Depth is
  // carried by value, not by detail — that is the whole trick of the references.
  const steps = planes.map((p) => p.step);
  ok(steps.every((v, i) => i === 0 || v < steps[i - 1]),
    `${key}: planes darken toward the viewer`, steps.join(' → '));
  for (const p of planes) {
    ok(!/[Aa]/.test(p.d), `${key}: no arc commands in a plane`,
      /[Aa]/.test(p.d) ? p.d.slice(0, 40) : '');
  }
  const disc = A.discFor(key);
  ok(!!disc && !/[Aa]/.test(disc.d), `${key}: exactly one celestial anchor, arc-free`);
}

// ── 4 · the crest is plain numbers, because a worklet cannot call a closure ──
for (const key of A.SCENE_KEYS) {
  const c = A.crestFor(key);
  const numeric = c && ['base', 'amp', 'off', 'per'].every((k) => typeof c[k] === 'number');
  ok(numeric, `${key}: crest is four plain numbers`, numeric ? '' : JSON.stringify(c));
  ok(c.per !== 0, `${key}: crest period is non-zero`, String(c.per));
}

console.log(bad === 0 ? '\nlaunch screen: all clear.' : `\n${bad} launch check(s) failed.`);
process.exit(bad === 0 ? 0 : 1);

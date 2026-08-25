// Can the launch screen be read, and does its art obey its own rules?
//
//   node scripts/check-launch.mjs        (npm run check:launch)
//
// The launch screen inverted its legibility scheme: the foreground is now the
// DARK end and the quote is cream over a scrim, which is what let the art stop
// being a blank sheet below the horizon. That inversion is only safe if every
// element's background is decided by construction and then MEASURED. This is the
// measurement — for the quote at the bottom (section 8) and, since the chrome
// stopped taking its contrast from the sky, for the masthead, the stroke and the
// percentage at the top (section 2).
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
    .replace(/from '@\/components\/lesson\/cinematic\/rig'/g, "from './rig.mjs'")
    // moves.ts (§5's launchStance loop-closure check pulls it in) imports rig
    // relatively rather than through the '@/...' alias, and launchMotion.ts now
    // imports moves.ts through the alias — both need the same on-disk rewrite
    // rig.ts already gets, or Node's ESM loader can't resolve the bare specifier.
    .replace(/from '@\/components\/lesson\/cinematic\/moves'/g, "from './moves.mjs'")
    .replace(/from '\.\/rig'/g, "from './rig.mjs'");
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
const lumRgb = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const lum = (hex) => lumRgb(hexRgb(hex));
const ratio = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

// The sky gradient's colour at a given y — shared by `renderScene` (2), the
// disc-tone check (3c) and the per-row figure backing (6), so the interpolation
// is written once.
function skyHexAt(key, y) {
  const stops = A.skyStops(key);
  const t = Math.min(1, Math.max(0, y) / (A.crestFor(key).base - 150));
  let a = stops[0], b = stops[stops.length - 1];
  for (let i = 1; i < stops.length; i++) {
    if (t <= stops[i].offset) { a = stops[i - 1]; b = stops[i]; break; }
  }
  const f = (t - a.offset) / Math.max(1e-6, b.offset - a.offset);
  const ca = hexRgb(a.color), cb = hexRgb(b.color);
  const byte = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return '#' + ca.map((v, i) => byte(v + (cb[i] - v) * f)).join('');
}

// LaunchScreen.tsx's own source — read once, up here, because section 2 (the
// masthead/stroke contrast) and section 7/8 (wordmark + hardcode checks) all
// need it. Read from the component rather than retyped here a second time,
// same reason skyHexAt reads launchArt's exports instead of a copy.
const screen = fs.readFileSync(path.join(REPO, 'components/launch/LaunchScreen.tsx'), 'utf8');

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

// ── 2 · the chrome band: where it LANDS, and whether it can be READ ──────────
//
// Three failures live here, and each one is why the next went unnoticed.
//
// WHERE IT LANDS. The masthead is positioned in SCREEN space
// (`insets.top + MAST_TOP_PAD`) and the stroke wants STAGE space
// (`offY + STROKE_STAGE_Y * fit`). Their separation is therefore fixed ONLY
// while `offY === 0`, which is true exactly when the device is 2:1 or taller.
// Below that `offY` goes negative and the stroke marches up through the
// masthead and then off the top of the display: at 820×1180 its ink laid out at
// screen y −43…−34 and the percentage at −19…−4, i.e. nothing visible at all.
// `app.json` ships `orientation: portrait` with `supportsTablet: true`, and
// Play excludes neither tablets nor foldables, so those are shipped form
// factors and not a thought experiment. LaunchScreen.tsx now clamps `strokeTop`
// against the masthead's own box; the assertions below lay the band out on
// EIGHT devices and check the clamp actually holds.
//
// WHY IT WENT UNNOTICED. This check used ONE reference device — 390×844 —
// which is precisely the aspect where `offY` is 0 and the two elements are in
// fixed relation. A single reference cannot see a defect whose whole mechanism
// is the relation between two coordinate spaces changing. One device measures
// one device.
//
// WHETHER IT CAN BE READ, ATTEMPT ONE. `chromeOn(key)` returned ink or cream by
// measuring the sky's top band, and this section measured that choice against
// `skyHexAt` — the sky GRADIENT's colour at the element's own rows. It cleared
// 4.5:1 on the 390×844 reference and it was never true anywhere else: below 2:1
// the cover-fit crops the sky's dark top away, and on a Z Fold's inner screen
// the whole band measured 3.2–3.6:1 with pure white reaching only 4.03:1. Those
// numbers were PRINTED here as an advisory note rather than asserted, on the
// grounds that no alpha could fix them and the honest fix was a scrim. It was.
//
// WHETHER IT CAN BE READ, ATTEMPT TWO — and this is the one to remember.
// `skyHexAt` returns the sky GRADIENT, and the sky is not the only thing drawn
// up there. `read`'s cold sun is a near-white disc (#F2F6F8) spanning stage y
// 172–263, and on 360×640, 820×1180 and 673×841 the chrome lands on it. Cream on
// that disc is 1.04:1. The masthead was invisible on three of eight shipped
// aspects while this file printed 3.62 and called it the worst case, because it
// was measuring a background the screen does not have. A proxy for the picture
// is not the picture.
//
// SO THIS SECTION COMPOSITES THE REAL ART. `renderScene` runs SceneArt's own
// paint order into an RGB buffer and every assertion below reads the LIGHTEST
// pixel the art can put under an element, on all eight devices, at both ends of
// the intro zoom — then puts the top scrim and one fixed CREAM over it. All
// three elements are cream at full opacity now, so the only thing that differs
// between them is the span of screen rows each one occupies.

/** A numeric constant read out of LaunchScreen.tsx, so the two cannot drift. */
function screenConst(name) {
  const m = screen.match(new RegExp(`\\b${name}\\s*=\\s*(-?[\\d.]+)\\s*;`));
  return m ? Number(m[1]) : null;
}
const CHROME_CONSTS = [
  'STROKE_STAGE_Y',
  'MAST_TOP_PAD', 'MAST_LINE_H', 'CHROME_GAP',
  'STROKE_W', 'STROKE_JITTER', 'STROKE_SVG_H', 'PCT_GAP', 'PCT_LINE_H',
];
const K = Object.fromEntries(CHROME_CONSTS.map((n) => [n, screenConst(n)]));
const missing = CHROME_CONSTS.filter((n) => K[n] === null);
ok(missing.length === 0,
  'LaunchScreen.tsx declares every chrome constant this check lays out',
  missing.length ? `not found: ${missing.join(' ')}` : CHROME_CONSTS.length + ' read');
for (const n of CHROME_CONSTS) if (K[n] === null) K[n] = 0;

/** Half the stroke's real ink height: the path's worst jitter plus half its width. */
const STROKE_INK_HALF = K.STROKE_JITTER + K.STROKE_W / 2;

/**
 * The reference devices. EVERY ONE OF THEM IS MEASURED, for geometry and for
 * contrast alike — there is no "measurement reference" any more.
 *
 * There used to be: the first entry carried `measure: true` and was the only
 * aspect the contrast assertions ran on, because on that one alone `offY` is 0
 * and nothing could be done about the rest anyway. Both halves of that were
 * wrong. 390×844 is the aspect where the composition is authored and therefore
 * the aspect least likely to be broken, and "nothing could be done" stopped
 * being true the moment the chrome got a scrim.
 *
 * The spread is the point. Six of the eight are below 2:1; on three of those the
 * stroke's ink laid out ABOVE y=0 before the clamp, and on two of those three
 * the percentage did as well. `inset` is the safe-area top each form factor
 * reports.
 */
const DEVICES = [
  { name: '390x844 phone  2.16:1', w: 390, h: 844, inset: 47 },
  { name: '360x640 16:9   1.78:1', w: 360, h: 640, inset: 24 },
  { name: '375x667 SE3    1.78:1', w: 375, h: 667, inset: 20 },
  { name: '411x731        1.78:1', w: 411, h: 731, inset: 24 },
  { name: '412x915 Pixel8 2.22:1', w: 412, h: 915, inset: 24 },
  { name: '744x1133 iPad  1.52:1', w: 744, h: 1133, inset: 24 },
  { name: '820x1180 iPad  1.44:1', w: 820, h: 1180, inset: 24 },
  { name: '673x841 ZFold  1.25:1', w: 673, h: 841, inset: 30 },
];

/** LaunchScreen's own arithmetic, run against one device. Screen px throughout. */
function layout(dev) {
  const fit = Math.max(dev.w / A.ART_W, dev.h / A.ART_H);
  const offY = (dev.h - A.ART_H * fit) / 2;
  const mastTop = dev.inset + K.MAST_TOP_PAD;
  const mastBot = mastTop + K.MAST_LINE_H;
  // The clamp under test.
  const strokeTop = Math.max(mastBot + K.CHROME_GAP, offY + K.STROKE_STAGE_Y * fit);
  const inkTop = strokeTop + K.STROKE_SVG_H / 2 - STROKE_INK_HALF;
  const inkBot = strokeTop + K.STROKE_SVG_H / 2 + STROKE_INK_HALF;
  const pctTop = strokeTop + K.STROKE_SVG_H + K.PCT_GAP;
  const pctBot = pctTop + K.PCT_LINE_H;
  const stage = (y) => (y - offY) / fit;
  return {
    fit, offY, h: dev.h, mastTop, mastBot, inkTop, inkBot, pctTop, pctBot,
    // The chrome's bottom, and the scrim sized from it by launchArt's own
    // function — not a copy of the arithmetic, the arithmetic itself.
    chromeBottom: pctBot,
    scrimH: A.topScrimHeight(pctBot),
    mast: [stage(mastTop), stage(mastBot)],
    stroke: [stage(inkTop), stage(inkBot)],
    pct: [stage(pctTop), stage(pctBot)],
  };
}

/**
 * SceneArt's own paint order, composited into an RGB buffer at stage size.
 *
 * Base fill → the sky gradient over its own rect → the disc → the sky bands at
 * their declared `fillOpacity` → the planes, back to front. That order is
 * load-bearing in launchScenes.tsx and it is load-bearing here: the disc is
 * painted BEFORE the bands and the planes, so what shows of it is whatever they
 * leave uncovered, and that is exactly the pixel the chrome has to be read
 * against. Costs about half a second for all six.
 */
function renderScene(key) {
  const W = A.ART_W, H = A.ART_H;
  const p = A.PALETTES[key];
  const stops = A.skyStops(key);
  const skyH = A.crestFor(key).base - 150;
  const buf = new Float64Array(W * H * 3);
  const base = hexRgb(p.steps[p.sky[1]]);
  for (let i = 0; i < W * H; i++) {
    buf[i * 3] = base[0]; buf[i * 3 + 1] = base[1]; buf[i * 3 + 2] = base[2];
  }
  for (let y = 0; y < Math.min(H, skyH); y++) {
    const c = hexRgb(skyHexAt(key, y));
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 3;
      buf[i] = c[0]; buf[i + 1] = c[1]; buf[i + 2] = c[2];
    }
  }
  const over = (d, hex, opacity) => {
    const cov = coverage(d, W, H), c = hexRgb(hex);
    for (let px = 0; px < W * H; px++) {
      const a = Math.min(1, cov[px]) * opacity;
      if (a <= 0) continue;
      const i = px * 3;
      for (let ch = 0; ch < 3; ch++) buf[i + ch] += (c[ch] - buf[i + ch]) * a;
    }
  };
  const disc = A.discFor(key);
  over(disc.d, disc.fill, 1);
  for (const b of A.skyBandsFor(key)) over(b.d, b.fill, b.opacity);
  for (const pl of A.planesFor(key)) over(pl.d, pl.fill, 1);
  return buf;
}
const COMPOSITE = Object.fromEntries(A.SCENE_KEYS.map((k) => [k, renderScene(k)]));

/**
 * A screen y as a stage y, at a given intro zoom.
 *
 * `sceneScale` runs 1 → 1.04 over 3800ms about the stage box's centre, so the
 * art SLIDES under the chrome while the screen is up: on the 390×844 reference
 * the stroke's row starts over stage y 89 and ends over stage y 101. The chrome
 * itself does not move — it is outside the animated box — so the zoom changes
 * nothing about the layout and everything about what is behind it. Both ends
 * are sampled below; measuring frame one only would be measuring a third of a
 * second of a 3.4-second screen.
 */
function stageRow(L, y, scale) {
  const boxTop = L.offY + (A.ART_H * L.fit) * (1 - scale) / 2;
  return (y - boxTop) / (L.fit * scale);
}

/**
 * The LIGHTEST pixel the art can put behind a span of screen rows.
 *
 * Sampled across the full stage width, which is conservative on purpose and
 * costs nothing: `offX = (w − 400·fit)/2` with `fit = max(w/400, h/800)` is
 * never positive, so the stage is always at least as wide as the screen and
 * stage x 0…399 is a superset of what is visible.
 */
function lightestUnder(key, L, y0, y1) {
  const W = A.ART_W, H = A.ART_H, buf = COMPOSITE[key];
  let best = -1, at = null;
  for (const scale of [1, 1.04]) {
    const r0 = Math.max(0, Math.floor(stageRow(L, y0, scale)));
    const r1 = Math.min(H - 1, Math.ceil(stageRow(L, y1, scale)));
    for (let sy = r0; sy <= r1; sy++) {
      for (let x = 0; x < W; x++) {
        const i = (sy * W + x) * 3;
        const l = lumRgb([buf[i], buf[i + 1], buf[i + 2]]);
        if (l > best) {
          best = l;
          at = { sy, scale, rgb: [buf[i], buf[i + 1], buf[i + 2]].map(Math.round) };
        }
      }
    }
  }
  return { lum: best, ...at };
}

/** CREAM on the top scrim on the worst pixel under a span. */
function chromeReads(key, L, [y0, y1]) {
  const w = lightestUnder(key, L, y0, y1);
  const mixed = w.rgb.map((v, i) => v + (A.SCRIM_RGB[i] - v) * A.TOP_SCRIM_ALPHA);
  return { ...w, r: ratio(lum(A.CREAM), lumRgb(mixed)) };
}

// ── 2a · geometry, and the scrim's reach, on every reference device ──────────
for (const dev of DEVICES) {
  const L = layout(dev);
  ok(L.inkTop > L.mastBot, `${dev.name}: stroke ink clears the masthead`,
    `masthead ends ${L.mastBot.toFixed(1)}, ink starts ${L.inkTop.toFixed(1)} ` +
    `(${(L.inkTop - L.mastBot).toFixed(1)}px clear, offY ${L.offY.toFixed(0)})`);
  ok(L.inkTop >= 0, `${dev.name}: the stroke is on screen`,
    `ink ${L.inkTop.toFixed(1)}..${L.inkBot.toFixed(1)}`);
  ok(L.pctTop >= 0, `${dev.name}: the percentage is on screen`,
    `pct ${L.pctTop.toFixed(1)}..${L.pctBot.toFixed(1)}`);
  // The whole guarantee in one line: full alpha has to reach the last row of
  // the percentage's line box. It does by construction — `topScrimHeight` is
  // `chromeBottom / TOP_SCRIM_HOLD` — and this is what fails if that stops
  // being true, e.g. if someone sizes the scrim as a percentage of the screen.
  const hold = L.scrimH * A.TOP_SCRIM_HOLD;
  ok(hold + 1e-9 >= L.pctBot, `${dev.name}: the top scrim's full alpha covers the chrome`,
    `hold ends ${hold.toFixed(1)}, chrome ends ${L.pctBot.toFixed(1)}; scrim ` +
    `${L.scrimH.toFixed(0)}px = ${(100 * L.scrimH / L.h).toFixed(0)}% of the screen`);
}

// ── 2b · the scrim's stops are the shape the guarantee assumes ───────────────
const TS = A.TOP_SCRIM_STOPS;
ok(TS.length >= 3, 'the top scrim has a hold, a fade and an end', `${TS.length} stops`);
ok(TS.every((s, i) => i === 0 || s.offset > TS[i - 1].offset),
  'the top scrim\'s stops run downward', TS.map((s) => s.offset).join(' → '));
ok(TS[0].offset === 0 && TS[0].opacity === A.TOP_SCRIM_ALPHA,
  'the top scrim starts at full alpha on the screen edge', `${TS[0].opacity} at ${TS[0].offset}`);
const holdStop = TS.find((s) => s.offset === A.TOP_SCRIM_HOLD);
ok(!!holdStop && holdStop.opacity === A.TOP_SCRIM_ALPHA,
  'the top scrim still holds full alpha at TOP_SCRIM_HOLD',
  `${A.TOP_SCRIM_ALPHA} at ${A.TOP_SCRIM_HOLD}`);
ok(TS[TS.length - 1].offset === 1 && TS[TS.length - 1].opacity === 0,
  'the top scrim fades to nothing rather than ending on an edge',
  `${TS[TS.length - 1].opacity} at ${TS[TS.length - 1].offset}`);

// ── 2c · contrast, every element, every device, worst of all six scenes ──────
//
// This used to be a printed advisory. It is assertions now, which is the whole
// point of the scrim: the floor is reached by construction rather than by which
// scene the shuffle happened to pick and which phone the reader happened to own.
const ELEMENTS = [
  ['masthead', (L) => L.mast],
  ['stroke', (L) => L.stroke],
  ['percentage', (L) => L.pct],
];
const GRID = {};
for (const dev of DEVICES) {
  const L = layout(dev);
  GRID[dev.name] = {};
  for (const [label, span] of ELEMENTS) {
    let worst = null, who = '';
    for (const key of A.SCENE_KEYS) {
      const c = chromeReads(key, L, span(L));
      if (!worst || c.r < worst.r) { worst = c; who = key; }
      const cell = GRID[dev.name][key];
      if (!cell || c.r < cell.r) GRID[dev.name][key] = { r: c.r, label };
    }
    ok(worst.r >= 4.5, `${dev.name}: ${label} reads on the top scrim`,
      `${worst.r.toFixed(2)}:1 worst of six scenes (${who}, rgb(${worst.rgb.join(',')}) ` +
      `at stage y${worst.sy} zoom ${worst.scale})`);
  }
}

// The same measurements per scene, printed. Nothing here can hide a failure —
// every cell is covered by an assertion above — but a grid says which scene is
// close to the floor, which the worst-of-six line cannot.
console.log('\n  note  worst chrome element per scene per device, cream on the top scrim:');
console.log('          ' + 'device'.padEnd(24) + A.SCENE_KEYS.map((k) => k.padStart(11)).join(''));
for (const dev of DEVICES) {
  console.log('          ' + dev.name.padEnd(24) +
    A.SCENE_KEYS.map((k) => `${GRID[dev.name][k].r.toFixed(2)}`.padStart(11)).join(''));
}
console.log('');

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

// ── 3b · the light is at the horizon, and the land has shapes in it ──────────
//
// The first contact sheet showed six flat stacked stripes with a bright seam at
// every horizon. Both were structural: the sky darkened DOWNWARD into a farthest
// plane that was lighter than it, and every plane was the same sine wave.
for (const key of A.SCENE_KEYS) {
  const p = A.PALETTES[key];
  const [top, horizon] = p.sky;
  const planes = A.planesFor(key);
  const farthest = planes[0].step;

  // The seam: the land at the horizon may not be lighter than the sky it meets.
  ok(farthest <= horizon, `${key}: farthest plane is no lighter than its horizon`,
    `plane step ${farthest} vs sky horizon step ${horizon}`);

  // Brightest at the horizon — except a night sky, which is allowed to run the
  // other way because its light comes from the disc, not the sky.
  //
  // `top === 0`, not `top < 2`. Four scenes are dusk with a DARK zenith, which
  // puts them at sky[0] = 1 — a looser test hands all four the night exemption
  // and then prints "(night, exempt)" next to a sunset. They pass the real rule
  // on their own; only stargazer is the night scene, so only stargazer is let off.
  const night = top === 0;
  ok(night || horizon > top, `${key}: sky brightens toward the horizon`,
    `top ${top} -> horizon ${horizon}${night ? ' (night, exempt)' : ''}`);

  // Shapes, not stripes. A bare ridge is ~24 commands; anything carrying a
  // silhouette is far denser. Measured against the flat version this replaces.
  for (const pl of planes) {
    const cmds = (pl.d.match(/[MLZ]/g) || []).length;
    ok(!/[Aa]/.test(pl.d), `${key}: plane step ${pl.step} is arc-free`);
    if (pl.step <= 4) {
      ok(cmds >= 40, `${key}: plane step ${pl.step} carries a silhouette`,
        `${cmds} commands`);
    }
  }

  // Sky detail.
  const bands = A.skyBandsFor(key);
  ok(bands.length >= 2 && bands.length <= 4, `${key}: 2-4 sky bands`, String(bands.length));
  for (const b of bands) {
    ok(!/[Aa]/.test(b.d), `${key}: sky band is arc-free`);
    ok(b.opacity > 0 && b.opacity <= 1, `${key}: sky band opacity in range`, String(b.opacity));
  }

  // Determinism — the same scene must draw identically every call.
  const again = A.planesFor(key);
  ok(again.every((q, i) => q.d === planes[i].d), `${key}: planes are deterministic`);
}

// ── 5 · every activity's loop closes ─────────────────────────────────────────
//
// The rule this file inherits from launchMotion.ts: whatever drives a pose must
// arrive back at its resting value before it wraps, so the modulo reset lands on
// a pose identical to the one it left.
//
// Compared as a CONTINUITY test, not an equality one. `stand()` rides two
// incommensurate sines so it never repeats exactly — that is deliberate, and an
// equality test would fail on it forever. What must not happen is a JUMP.
//
// Two separate assertions, not one, after a false pass slipped through the
// first version of this check. `lookout`'s hand used to hold up at the window's
// edge instead of lowering — a genuine 54.71-unit snap once per cycle — and it
// read as PASSING, because nothing tested that snap directly: it only fed into
// `ordinary`, the one number the wrap comparison was tolerant of, and a bigger
// `ordinary` just raised its own bar. An internal jump must fail on its own
// merits, so it gets its own ceiling below, independent of the wrap check.
//
// The wrap comparison itself was also comparing the wrong pair: `t = T − 1/60`
// against `t = 1/60` are a full PERIOD apart in wall-clock time, which the app
// never renders back to back — `clock.value` in LaunchFigure only ever
// accumulates, so nothing resets it. The two frames that are actually adjacent
// on screen, and that straddle wherever the internal `% period` folds, are
// `T − 1/60` and `T + 1/60`. Comparing `T − 1/60` to `1/60` demands that
// `stand()`'s idle be periodic in T, which rig.ts says on purpose it is not
// ("All on `life2`, so none of it repeats") — the old version was testing for
// something this file itself says never happens.
emit('components/lesson/cinematic/moves.ts', 'moves.mjs');
const LM = await import(emit('components/launch/launchMotion.ts', 'launchMotion.mjs'));

const KEYS = ['tilt', 'neck', 'bob'];
const PTS = ['footL', 'footR', 'fistL', 'fistR'];
const delta = (a, b) => {
  let d = 0;
  for (const k of KEYS) d = Math.max(d, Math.abs(a[k] - b[k]) * 20);
  for (const k of PTS) d = Math.max(d, Math.hypot(a[k].x - b[k].x, a[k].y - b[k].y));
  return d;
};

for (const act of ['walk', 'sip', 'read', 'thinker', 'stargazer', 'lookout']) {
  const T = LM.ACTIVITY_PERIOD[act];
  ok(typeof T === 'number' && T > 0, `${act}: declares a period`, String(T));
  if (!T) continue;

  // Every per-frame step across one period, sampled at 60fps — kept as an
  // array, not just a running max, so the wrap check below can be keyed off a
  // robust statistic instead of the single worst sample.
  const steps = [];
  for (let t = 0; t < T; t += 1 / 60) {
    steps.push(delta(LM.launchStance(act, t), LM.launchStance(act, t + 1 / 60)));
  }
  const worst = Math.max(...steps);
  // Asserted absolutely: an internal jump fails here, on its own, whatever the
  // wrap check below says. Today's genuine worst case is 2.70 (lookout, at the
  // peak of its hand-raise); 8 leaves ample room without being loose enough to
  // hide another hold-at-peak defect the way the missing version of this line
  // once did.
  ok(worst <= 8, `${act}: no jump inside the period`, `worst frame step ${worst.toFixed(2)}`);

  // The two frames straddling the fold, adjacent in real time.
  const atWrap = delta(LM.launchStance(act, T - 1 / 60), LM.launchStance(act, T + 1 / 60));
  // The 95th percentile of this period's own steps, not the max — so one
  // anomalous frame (an internal jump, or just the fastest instant of a
  // gesture) can never set its own tolerance the way `ordinary` used to.
  const sorted = [...steps].sort((a, b) => a - b);
  const p95 = sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))];
  // +6, not +0.5: `thinker`/`stargazer` deliberately retrigger `postureLive`'s
  // settle every cycle ("re-takes the settle each cycle rather than settling
  // once forever" — launchMotion.ts), and that settle's steepest instant sits
  // exactly at bt = 0, which is exactly where the fold lands — by construction,
  // not by which period is chosen. Its worst-case 2-frame contribution is
  // bounded by the settle's own known amplitude: `db = -settle × 1.2` for any
  // code without an override, and `settle`'s steepest slope is 2π at bt = 0, so
  // one 2-frame (1/30s) slice moves it at most ≈ 1.2 × 2π / 30 ≈ 0.25 raw units,
  // ×20 for the bob scale ≈ 5. 6 covers that with a small margin, while staying
  // well under the 8-unit absolute ceiling above for anything actually wrong.
  ok(atWrap <= p95 * 3 + 6, `${act}: no jump across the wrap`,
    `wrap ${atWrap.toFixed(2)} vs p95 ${p95.toFixed(2)}`);
}

// ── 3c · every disc is readable, by EDGE or by TONE ──────────────────────────
//
// A disc reads as an anchor one of two ways: the land cuts it and gives it an
// edge, or it carries enough contrast against its own sky to stand on its own.
//
// Measured, both scenes that prove it: `walk` at 1.61:1 reads ONLY because an
// 80-90px butte crosses it, and `read` at 2.87:1 reads with a 154px gap of clear
// sky beneath it. `sip` at 1.57:1 and uncut has neither, and `sip` is the one
// scene that came back soft from the art gate.
//
// The threshold is 2.5 rather than 2.0 deliberately. The ONLY evidence that an
// uncut disc reads is `read` at 2.87, so anything materially below that is an
// extrapolation past the data — a scene in between must earn it with an edge.
const DISC_TONE_MIN = 2.5;

for (const key of A.SCENE_KEYS) {
  const disc = A.discFor(key);
  const dc = coverage(disc.d, A.ART_W, A.ART_H);
  let top = A.ART_H, bot = -1, lx = A.ART_W, rx = -1;
  for (let y = 0; y < A.ART_H; y++) {
    for (let x = 0; x < A.ART_W; x++) {
      if (dc[y * A.ART_W + x] <= 0.5) continue;
      if (y < top) top = y;
      if (y > bot) bot = y;
      if (x < lx) lx = x;
      if (x > rx) rx = x;
    }
  }
  ok(bot > top, `${key}: the disc renders`, `y ${top}..${bot}`);

  // EDGE: a plane covering part of the disc's lower half. Counted in pixels off
  // the real path data, with a floor well above a stray antialiased edge.
  const midY = (top + bot) / 2;
  let cut = 0;
  for (const pl of A.planesFor(key)) {
    const pc = coverage(pl.d, A.ART_W, A.ART_H);
    for (let y = Math.ceil(midY); y <= bot; y++) {
      for (let x = lx; x <= rx; x++) {
        if (dc[y * A.ART_W + x] > 0.5 && pc[y * A.ART_W + x] > 0.5) cut++;
      }
    }
  }
  const edged = cut >= 200;

  // TONE: the disc against the sky gradient at the disc's OWN height, which is
  // what the eye actually compares — not against the sky's top or its horizon.
  const p = A.PALETTES[key];
  const tone = ratio(lum(p.disc), lum(skyHexAt(key, top + (bot - top) / 2)));

  ok(edged || tone >= DISC_TONE_MIN, `${key}: the disc reads`,
    `${cut}px cut, ${tone.toFixed(2)}:1 on its sky` +
    (edged ? ' (edged)' : tone >= DISC_TONE_MIN ? ' (tonal)' : ' — NEITHER'));
}

// ── 6 · equal visual mass, and the man does not vanish ───────────────────────
//
// Two rules in one pass, because both need the solved skeleton.
//
// MASS: a seated figure is far shorter than a standing one, so one shared k
// makes the seated scenes read smaller than the walking one on the launch right
// before. Each scene's k is tuned until crown-to-ground matches.
//
// LEGIBILITY: he is solid ink, head included, and stands in front of every
// layer. A near-black mass behind him is not drama, it is the man vanishing.
// Whatever is behind his BODY — crown to knee — must contrast against ink.
//
// `coverage` is imported and `R` is bound at the top of this file already; do
// not re-import them here.

const ACT_OF = {
  walk: 'walk', sip: 'sip', read: 'read',
  thinker: 'thinker', stargazer: 'stargazer', lookout: 'lookout',
};
const TARGET_H = 62;        // stage units, crown to ground — FIG_H(103) × 0.6
const MASS_TOL = 5;

for (const key of A.SCENE_KEYS) {
  const k = A.figureK(key);
  const fx = A.figureX(key);           // Task 3b's single source of truth — see above
  ok(typeof k === 'number' && k > 0, `${key}: declares a figure scale`, String(k));
  if (!k) continue;

  const c = A.crestFor(key);
  const groundY = A.crestY(c, fx);
  const s = LM.launchStance(ACT_OF[key], 2.0);
  const j = R.solve({ x: fx, groundY, k, dir: 1, ...s });

  const crown = j.head.y - R.STR.headR * k;
  const height = groundY - crown;
  ok(Math.abs(height - TARGET_H) <= MASS_TOL, `${key}: equal visual mass`,
    `${height.toFixed(0)} units, target ${TARGET_H}±${MASS_TOL}`);

  // What is behind the body? The darkest thing actually behind him on his
  // WORST row — not the whole-band union this replaces, which threw away the
  // plane calculation entirely the instant ANY pixel of the crown-to-knee band
  // touched the disc. On `stargazer` the disc backs only 24 of 56 rows (42%);
  // the other 58% sit against the step-3 plane, which is darker — so the old
  // check reported 14.8:1 (the disc, band-wide) when the true worst case is the
  // step-3 plane's 3.98:1, a 3.7x overstatement. The other five scenes are
  // unaffected: their disc never covers any row of the band, so their override
  // never fired.
  const knee = Math.max(j.kneeL.y, j.kneeR.y);
  const halfW = Math.max(18 * k, Math.abs(j.wrL.x - j.wrR.x) / 2 + 6);
  const planes = A.planesFor(key);
  const p = A.PALETTES[key];
  // Hoisted out of the row loop: coverage() rasterises a whole 400x800 path, so
  // each plane (and the disc) is rasterised once here, not once per row.
  const planeCovs = planes.map((pl) => ({ cov: coverage(pl.d, A.ART_W, A.ART_H), fill: pl.fill }));
  const dc = coverage(A.discFor(key).d, A.ART_W, A.ART_H);

  let worstLum = 1, worstHex = p.disc, worstRow = -1;
  for (let y = Math.floor(crown); y <= Math.floor(knee); y++) {
    let rowHex = null, rowLum = 1;
    for (const pl of planeCovs) {
      let hit = false;
      for (let x = Math.floor(fx - halfW); x <= Math.ceil(fx + halfW) && !hit; x++) {
        if (pl.cov[y * A.ART_W + x] > 0.5) hit = true;
      }
      if (!hit) continue;
      const l = lum(pl.fill);
      if (rowHex === null || l < rowLum) { rowHex = pl.fill; rowLum = l; }
    }
    if (rowHex === null) {                        // no plane on this row — sky or disc
      let onDiscRow = false;
      for (let x = Math.floor(fx - halfW); x <= Math.ceil(fx + halfW) && !onDiscRow; x++) {
        if (dc[y * A.ART_W + x] > 0.5) onDiscRow = true;
      }
      // The celestial disc counts as backing — that is exactly how the night
      // scene keeps its figure readable, and how the reference does it too.
      rowHex = onDiscRow ? p.disc : skyHexAt(key, y);
      rowLum = lum(rowHex);
    }
    if (rowLum < worstLum) { worstLum = rowLum; worstHex = rowHex; worstRow = y; }
  }
  ok(ratio(worstLum, lum(A.INK)) >= 3.0, `${key}: the figure does not vanish`,
    `${ratio(worstLum, lum(A.INK)).toFixed(1)}:1 on ${worstHex} (worst row y${worstRow})`);
}

// ── 7 · no colour is chosen in the renderer ──────────────────────────────────
//
// The whole guarantee is that every element's background is decided by
// construction. A hex literal typed into the renderer is a per-scene guess, and
// a per-scene guess is what let a pale quote vanish into pale art before.
//
// Widened twice over. It used to scan launchScenes.tsx alone for 6-digit hex —
// missing `#fff`, `rgb()` and `rgba()` entirely — and never looked at
// LaunchScreen.tsx at all, which is exactly where INK/CREAM shipped hardcoded
// as raw decimal rgba() (`rgba(26,26,26,0.62)`) instead of derived from the
// imported constants (#Defect one-liner 2). launchScenes.tsx still may not
// declare ANY colour of its own; LaunchScreen.tsx is allowed rgba()/hex for
// things that are not a scene colour (the drop-shadows, and the `rgb()` both
// scrims build from the imported SCRIM_RGB) — but INK's and CREAM's decimal
// triples typed literally is precisely how #2 shipped, so those two are
// checked for by name and must never reappear.
const scenes = fs.readFileSync(path.join(REPO, 'components/launch/launchScenes.tsx'), 'utf8');
const COLOUR_LITERAL = /#[0-9A-Fa-f]{6}\b|#[0-9A-Fa-f]{3}\b|\brgba?\([^)]*\)/g;
const sceneLiterals = (scenes.match(COLOUR_LITERAL) || []);
ok(sceneLiterals.length === 0, 'launchScenes.tsx declares no colour of its own',
  sceneLiterals.join(' ') || 'none');
ok(!/\bswing\b|\bkite\b|\bpicnic\b/.test(scenes),
  'launchScenes.tsx has no kite, swing or picnic left');

const INK_DECIMAL = /\b26\s*,\s*26\s*,\s*26\b/;
const CREAM_DECIMAL = /\b244\s*,\s*241\s*,\s*234\b/;
const screenLiterals = (screen.match(new RegExp(`${INK_DECIMAL.source}|${CREAM_DECIMAL.source}`, 'g')) || []);
ok(screenLiterals.length === 0, 'LaunchScreen.tsx does not hardcode INK/CREAM as decimals',
  screenLiterals.join(' ') || 'none');

// ── 8 · the quote is legible where it actually sits ──────────────────────────
//
// §19's rule: never take text contrast from the artwork. The quote takes it from
// a FIXED scrim and one fixed cream, and this is the arithmetic. The welcome end
// card measures 8.7:1 doing exactly this, so 7:1 is a floor, not an aspiration.
// (The chrome at the top of the screen is the same construction inverted, and it
// is measured in section 2 — against the composited art rather than against the
// darkest plane, because the top of the frame is where the bright things are.)
// THE MASTHEAD MUST NAME THE APP THE APP IS ACTUALLY CALLED.
//
// This asserted DEEPLY, and went on asserting it for the whole of build 21 —
// which is the rename to Ashmere. Every other surface followed the rename; the
// launch screen did not, because its wordmark is spaced ("D E E P L Y") and
// therefore matches no search for the name. A check that hard-codes the string
// it is checking cannot notice this: it was green the entire time the first
// screen of every launch showed the wrong brand.
//
// So it is derived from app.json's `expo.name` now — the one place the brand is
// declared, and the one that becomes the launcher label (§18).
const brand = JSON.parse(fs.readFileSync('app.json', 'utf8')).expo.name.toUpperCase();
const spaced = new RegExp(brand.split('').join('\\s*'));
ok(spaced.test(screen), `the masthead says ${brand}`, `app.json says ${brand}`);
ok(!/D\s*E\s*E\s*P\s*L\s*Y/.test(screen), 'the Deeply wordmark is gone');
// The pre-rename masthead was letter-spaced too ("P H I L O S O P H I Z E"),
// which `/PHILOSOPHIZE/` — a contiguous run — can never match; this assertion
// was permanently green. Matched the same way the DEEPLY check above does.
ok(!/P\s*H\s*I\s*L\s*O\s*S\s*O\s*P\s*H\s*I\s*Z\s*E/.test(screen), 'the old wordmark is gone');

// ── the hand-off from the native splash ──────────────────────────────────────
//
// The app's FIRST frame is the native splash, and the second is this screen. If
// they are different colours the reader gets a flash before anything has begun,
// because `hideAsync()` does not fade — and every one of the six scene grounds
// is near-black against a pale grey splash. LaunchScreen starts on SPLASH_BG and
// deepens into the scene, so the only thing that can put the flash back is the
// two constants drifting apart. They live in different files and only one of them
// can be changed over the air (§18), which is exactly when a pair drifts.
{
  const cfg = JSON.parse(fs.readFileSync('app.json', 'utf8')).expo;
  const plug = (cfg.plugins ?? []).find((p) => Array.isArray(p) && p[0] === 'expo-splash-screen');
  const declared = plug?.[1]?.backgroundColor ?? cfg.splash?.backgroundColor ?? null;
  ok(!!declared, 'app.json declares a splash background', String(declared));
  ok(
    !!declared && declared.toUpperCase() === A.SPLASH_BG.toUpperCase(),
    'the launch ground starts on the splash colour',
    `app.json ${declared} · launchArt ${A.SPLASH_BG}`,
  );
  // And the flash it prevents is real: say so with the numbers, so nobody
  // "simplifies" the interpolation away on the grounds that it looks like a no-op.
  const swing = A.SCENE_KEYS.map((k) => {
    const a = lum(declared);
    const b = lum(A.PALETTES[k].steps[0]);
    return ratio(a, b);
  });
  ok(Math.min(...swing) > 4,
    'and the cut it removes would have been a real one',
    `splash → scene ground is ${Math.min(...swing).toFixed(1)}:1 at its mildest`);
}

// Read from launchArt.ts, not typed here a second time — LaunchScreen.tsx
// builds its gradient <Stop>s from the same export, so this measures what
// actually renders rather than a copy that can drift out of step with it.
const SCRIM_RGB = A.SCRIM_RGB;
const SCRIM_ALPHA = A.SCRIM_STOPS[A.SCRIM_STOPS.length - 1].opacity;  // the alpha where the quote sits
for (const key of A.SCENE_KEYS) {
  // The quote sits over the darkest plane plus the scrim.
  const under = A.PALETTES[key].steps[0];
  const [r, g, b] = hexRgb(under);
  const over = [r, g, b].map((v, i) => v + (SCRIM_RGB[i] - v) * SCRIM_ALPHA);
  const bgLum = 0.2126 * lin(over[0]) + 0.7152 * lin(over[1]) + 0.0722 * lin(over[2]);
  ok(ratio(lum(A.CREAM), bgLum) >= 7.0, `${key}: the quote reads on its scrim`,
    `${ratio(lum(A.CREAM), bgLum).toFixed(1)}:1`);
}

console.log(bad === 0 ? '\nlaunch screen: all clear.' : `\n${bad} launch check(s) failed.`);
process.exit(bad === 0 ? 0 : 1);

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
const lum = (hex) => { const [r, g, b] = hexRgb(hex); return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b); };
const ratio = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

// The sky gradient's colour at a given y — shared by the disc-tone check (3c)
// and the per-row figure backing (6), so the interpolation is written once.
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
// Two failures live here, and the second one is why the first went unnoticed.
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
// WHETHER IT CAN BE READ. An older version measured `chromeOn(key)` at full
// opacity against the sky's colour at y=0, the very top of the gradient.
// Nothing renders at y=0. That was fixed, and then only half-fixed: the label
// said "stroke + percentage" but the sample was the STROKE's y alone, and the
// percentage is a sibling BELOW the stroke — `STROKE_SVG_H` + `PCT_GAP` + its
// own line box, so 26–41 screen px lower, stage y 115–129 on the reference —
// where the same chromeSoft measured 4.12:1 on `walk`. Every element is now
// measured over the EXTENT it occupies, at the worse of its two ends, and the
// percentage has its own assertion.
//
// Each element is also measured in the colour IT draws in: the percentage and
// the masthead in chromeSoft, and the stroke at FULL opacity, because
// `stroke={chrome}` is what LaunchScreen renders. Measuring the stroke soft
// under-rated it by ~0.9 of a ratio point — safe, but not true.

/** A numeric constant read out of LaunchScreen.tsx, so the two cannot drift. */
function screenConst(name) {
  const m = screen.match(new RegExp(`\\b${name}\\s*=\\s*(-?[\\d.]+)\\s*;`));
  return m ? Number(m[1]) : null;
}
const CHROME_CONSTS = [
  'STROKE_STAGE_Y', 'CHROME_SOFT_INK_ALPHA', 'CHROME_SOFT_CREAM_ALPHA',
  'MAST_TOP_PAD', 'MAST_LINE_H', 'CHROME_GAP',
  'STROKE_W', 'STROKE_JITTER', 'STROKE_SVG_H', 'PCT_GAP', 'PCT_LINE_H',
];
const K = Object.fromEntries(CHROME_CONSTS.map((n) => [n, screenConst(n)]));
const missing = CHROME_CONSTS.filter((n) => K[n] === null);
ok(missing.length === 0,
  'LaunchScreen.tsx declares every chrome constant this check lays out',
  missing.length ? `not found: ${missing.join(' ')}` : CHROME_CONSTS.length + ' read');
for (const n of CHROME_CONSTS) if (K[n] === null) K[n] = 0;

const INK_ALPHA = K.CHROME_SOFT_INK_ALPHA;
const CREAM_ALPHA = K.CHROME_SOFT_CREAM_ALPHA;
/** Half the stroke's real ink height: the path's worst jitter plus half its width. */
const STROKE_INK_HALF = K.STROKE_JITTER + K.STROKE_W / 2;

/**
 * The reference devices.
 *
 * The FIRST is the measurement reference — a mid-size phone, the aspect the
 * composition is authored against, and the one the contrast assertions use.
 * The rest exist so the geometry is checked where `offY` is NOT zero. Six of
 * the seven are below 2:1; on three of those the stroke's ink laid out ABOVE
 * y=0 before the clamp, and on two of those three the percentage did as well.
 * `inset` is the safe-area top each form factor reports.
 */
const DEVICES = [
  { name: '390x844 phone  2.16:1', w: 390, h: 844, inset: 47, measure: true },
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
    fit, offY, mastTop, mastBot, inkTop, inkBot, pctTop, pctBot,
    mast: [stage(mastTop), stage(mastBot)],
    stroke: [stage(inkTop), stage(inkBot)],
    pct: [stage(pctTop), stage(pctBot)],
  };
}

// Alpha-composite chrome over a background — the same maths an rgba() colour
// gets when React Native draws it over an opaque surface underneath.
const compositeLum = (chromeHex, alpha, bgHex) => {
  const c = hexRgb(chromeHex), bg = hexRgb(bgHex);
  const mix = c.map((v, i) => bg[i] + (v - bg[i]) * alpha);
  return 0.2126 * lin(mix[0]) + 0.7152 * lin(mix[1]) + 0.0722 * lin(mix[2]);
};
/** Contrast at ONE stage y, chrome composited at `alpha` over the sky there. */
function contrastAt(key, y, alpha) {
  const bg = skyHexAt(key, y);
  return { r: ratio(compositeLum(A.chromeOn(key), alpha, bg), lum(bg)), bg };
}
/** The WORSE end of an element's extent — never the anchor, never the midpoint. */
function worstOver(key, [y0, y1], alpha) {
  const a = contrastAt(key, y0, alpha), b = contrastAt(key, y1, alpha);
  return a.r <= b.r ? { ...a, y: y0 } : { ...b, y: y1 };
}

// ── 2a · geometry, on every reference device ─────────────────────────────────
for (const dev of DEVICES) {
  const L = layout(dev);
  ok(L.inkTop > L.mastBot, `${dev.name}: stroke ink clears the masthead`,
    `masthead ends ${L.mastBot.toFixed(1)}, ink starts ${L.inkTop.toFixed(1)} ` +
    `(${(L.inkTop - L.mastBot).toFixed(1)}px clear, offY ${L.offY.toFixed(0)})`);
  ok(L.inkTop >= 0, `${dev.name}: the stroke is on screen`,
    `ink ${L.inkTop.toFixed(1)}..${L.inkBot.toFixed(1)}`);
  ok(L.pctTop >= 0, `${dev.name}: the percentage is on screen`,
    `pct ${L.pctTop.toFixed(1)}..${L.pctBot.toFixed(1)}`);
}

// ── 2b · contrast, at the measurement reference, over each element's extent ──
const REF = DEVICES.find((d) => d.measure);
const RL = layout(REF);
for (const key of A.SCENE_KEYS) {
  const c = A.chromeOn(key);
  ok(c === A.INK || c === A.CREAM, `${key}: chrome is ink or cream`, c);
  const alpha = c === A.INK ? INK_ALPHA : CREAM_ALPHA;

  const m = worstOver(key, RL.mast, alpha);
  ok(m.r >= 4.5, `${key}: masthead reads over its own box (soft chrome)`,
    `${m.r.toFixed(2)}:1 at stage y${m.y.toFixed(0)} on ${m.bg}`);

  // Full opacity: `stroke={chrome}` is what renders, so that is what is measured.
  const s = worstOver(key, RL.stroke, 1);
  ok(s.r >= 4.5, `${key}: stroke reads over its own ink extent (full chrome)`,
    `${s.r.toFixed(2)}:1 at stage y${s.y.toFixed(0)} on ${s.bg}`);

  const p = worstOver(key, RL.pct, alpha);
  ok(p.r >= 4.5, `${key}: percentage reads over its own line box (soft chrome)`,
    `${p.r.toFixed(2)}:1 at stage y${p.y.toFixed(0)} on ${p.bg}`);
}

// ── 2c · what the clamp costs, printed rather than asserted ──────────────────
//
// NOT an assertion, and the reason is arithmetic rather than leniency. Below
// 2:1 the cover-fit crops the sky's DARK end off the top of the frame: on a Z
// Fold's inner screen the topmost visible row is already stage y 150, and the
// masthead — which has always been in screen space and is not what this fix
// moved — sits at stage 178-186 whatever anything else does.
//
// Measured on `walk` at the stroke's clamped span there (stage 195.2-200.0,
// sky #9E7453-#A07653): its cream chrome reads 3.67-3.57:1 at FULL opacity,
// and PURE WHITE reaches only 4.14-4.03:1. No value of CHROME_SOFT_CREAM_ALPHA
// can lift that over 4.5, so asserting the floor per-device would be asserting
// something unreachable. (Ink reads 4.21-4.32 across the same span, also short,
// and `chromeOn` derives the chrome from the sky's TOP band by construction
// rather than per device — see launchArt.ts.) The honest fix is a scrim under
// the chrome, the way §19 already does for the quote, and that is a design
// change rather than a layout one. Printed so the cost is visible and can be
// traded off deliberately — a number nobody prints is the state this whole
// section exists to end.
console.log('\n  note  chrome contrast off the measurement reference (worst scene, ' +
  'masthead / stroke / percentage):');
for (const dev of DEVICES) {
  const L = layout(dev);
  let wm = Infinity, ws = Infinity, wp = Infinity, low = Infinity, who = '';
  for (const key of A.SCENE_KEYS) {
    const alpha = A.chromeOn(key) === A.INK ? INK_ALPHA : CREAM_ALPHA;
    const m = worstOver(key, L.mast, alpha).r;
    const s = worstOver(key, L.stroke, 1).r;
    const p = worstOver(key, L.pct, alpha).r;
    wm = Math.min(wm, m); ws = Math.min(ws, s); wp = Math.min(wp, p);
    if (Math.min(m, s, p) < low) { low = Math.min(m, s, p); who = key; }
  }
  console.log(`          ${dev.name}  ${wm.toFixed(2)} / ${ws.toFixed(2)} / ${wp.toFixed(2)}` +
    `   (worst scene ${who}; stroke stage y ${L.stroke[0].toFixed(0)}-${L.stroke[1].toFixed(0)})`);
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
// things that are not a scene colour (the quote's drop-shadow, the scrim's own
// `rgb()` built from the imported SCRIM_RGB) — but INK's and CREAM's decimal
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

// ── 8 · the quote and the chrome are legible where they actually sit ─────────
//
// §19's rule: never take text contrast from the artwork. The quote takes it from
// a FIXED scrim and one fixed cream, and this is the arithmetic. The welcome end
// card measures 8.7:1 doing exactly this, so 7:1 is a floor, not an aspiration.
ok(/D\s*E\s*E\s*P\s*L\s*Y/.test(screen), 'the masthead says DEEPLY');
// The pre-rename masthead was letter-spaced too ("P H I L O S O P H I Z E"),
// which `/PHILOSOPHIZE/` — a contiguous run — can never match; this assertion
// was permanently green. Matched the same way the DEEPLY check above does.
ok(!/P\s*H\s*I\s*L\s*O\s*S\s*O\s*P\s*H\s*I\s*Z\s*E/.test(screen), 'the old wordmark is gone');

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

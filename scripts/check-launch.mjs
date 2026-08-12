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
  const stops = A.skyStops(key);
  const t = Math.min(1, Math.max(0, top + (bot - top) / 2) / (A.crestFor(key).base - 150));
  let a = stops[0], b = stops[stops.length - 1];
  for (let i = 1; i < stops.length; i++) {
    if (t <= stops[i].offset) { a = stops[i - 1]; b = stops[i]; break; }
  }
  const f = (t - a.offset) / Math.max(1e-6, b.offset - a.offset);
  const ca = hexRgb(a.color), cb = hexRgb(b.color);
  const sky = ca.map((v, i) => v + (cb[i] - v) * f);
  const skyLum = 0.2126 * lin(sky[0]) + 0.7152 * lin(sky[1]) + 0.0722 * lin(sky[2]);
  const tone = ratio(lum(p.disc), skyLum);

  ok(edged || tone >= DISC_TONE_MIN, `${key}: the disc reads`,
    `${cut}px cut, ${tone.toFixed(2)}:1 on its sky` +
    (edged ? ' (edged)' : tone >= DISC_TONE_MIN ? ' (tonal)' : ' — NEITHER'));
}

console.log(bad === 0 ? '\nlaunch screen: all clear.' : `\n${bad} launch check(s) failed.`);
process.exit(bad === 0 ? 0 : 1);

// Can the launch screen be read, and does it keep the boot contract?
//
//   node scripts/check-launch.mjs        (npm run check:launch)
//
// The launch screen was redesigned 2026-09-08 from six near-black illustrated
// landscapes to a TITLE PAGE: laurel + wordmark, a hand-drawn ink rule drawing
// itself as the progress line, one QuotePlate from the library, the tagline at
// the foot — all ink on paper. That deleted the two measured scrims and the
// figure, so this checker shrank with it. What is left to hold is exactly what
// the old one existed for, minus the art:
//
//   §1  the splash hand-off — SPLASH_BG equals app.json's splash colour, the
//       ground starts ON it, and the step from splash to paper is mild;
//   §2  the wordmark says what app.json says (the rule that caught this screen
//       still reading the previous brand for a whole rename);
//   §3  every text tone clears 4.5:1 on the paper it sits on, and the progress
//       stroke clears 3:1 as a mark — derived from constants/design.ts, never
//       retyped;
//   §4  the quotation rides the shared QuotePlate (whose tones check-ui already
//       holds), the pool is length-capped with a fallback, and skipAnimation
//       still stands the performance down;
//   §5  the status bar is dark-content and never flips — a paper ground start
//       to finish has no crossing left to time;
//   §6  the outro still carries its 1.04s welcome-cover budget, and the marker
//       check-ui §10 slices on is still present.
//
// The dormant landscape files (launchScenes, launchMotion, the art half of
// launchArt) are still drawn by sheet-launch.mjs but are no longer this
// screen's problem. LaunchFigure lives on in AuthPanel's mascot.

import fs from 'node:fs';

const read = (p) => fs.readFileSync(p, 'utf8');
const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const screenRaw = read('components/launch/LaunchScreen.tsx');
const screen = strip(screenRaw);
const artSrc = read('components/launch/launchArt.ts');
const designSrc = read('constants/design.ts');

let bad = 0;
const ok = (cond, label, detail = '') => {
  if (!cond) bad++;
  console.log(`  ${cond ? 'ok  ' : 'FAIL'}  ${label}${detail ? '  — ' + detail : ''}`);
};

// ── WCAG luminance, the same arithmetic check-ui.mjs uses ────────────────────
const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
const hexRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lum = (hex) => { const [r, g, b] = hexRgb(hex); return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b); };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)]; return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };

// Tokens, read from the one source of values rather than restated here.
const token = (name) => {
  const m = designSrc.match(new RegExp(`\\b${name}: '(#[0-9A-Fa-f]{6})'`));
  if (!m) { ok(false, `constants/design.ts declares ${name}`); return '#000000'; }
  return m[1];
};
const PAPER = token('paper');
const INK = token('ink');
const INK_SOFT = token('inkSoft');

console.log('check-launch: the title page');

// ── 1 · the hand-off from the native splash ──────────────────────────────────
//
// The app's FIRST frame is the native splash; the second is this screen. The
// splash colour is a COMPILED resource (§18) and SPLASH_BG in launchArt.ts is
// the OTA-updatable twin — the pair that can drift, so it is compared, not
// trusted. The ground must also START on it: paper is only a whisker from the
// splash grey, but "starts on the splash colour" is the rule that keeps the
// hand-off seamless whoever tunes either side next.
{
  const splashM = artSrc.match(/export const SPLASH_BG = '(#[0-9A-Fa-f]{6})'/);
  ok(!!splashM, 'launchArt declares SPLASH_BG', splashM?.[1] ?? 'missing');
  const SPLASH = splashM?.[1] ?? '#000000';

  const cfg = JSON.parse(read('app.json')).expo;
  const plug = (cfg.plugins ?? []).find((p) => Array.isArray(p) && p[0] === 'expo-splash-screen');
  const declared = plug?.[1]?.backgroundColor ?? cfg.splash?.backgroundColor ?? null;
  ok(!!declared, 'app.json declares a splash background', String(declared));
  ok(
    !!declared && declared.toLowerCase() === SPLASH.toLowerCase(),
    'SPLASH_BG equals the compiled splash colour',
    `app.json ${declared} · launchArt ${SPLASH}`
  );

  ok(/const GROUND = C\.paper;/.test(screen),
    'the ground is the design system’s paper, not a local hex');
  ok(/interpolateColor\(introFade\.value, \[0, 1\], \[SPLASH_BG, GROUND\]\)/.test(screen),
    'and it starts on the splash colour, settling on the intro curve');

  const step = ratio(SPLASH, PAPER);
  ok(step < 1.25,
    'splash → ground is a mild step, not a flash',
    `${step.toFixed(2)}:1 (the old near-black scenes were 10.7:1 at their mildest)`);
}

// ── 2 · the wordmark says what app.json says ─────────────────────────────────
//
// The brand lives in exactly one place. The old masthead spelled the previous
// name one letter at a time for a whole rename because it was written by hand
// and matched no search for the name itself; the expected string is derived,
// so a rename fails here instead of shipping.
{
  const brand = JSON.parse(read('app.json')).expo.name.toUpperCase();
  ok(new RegExp(`>${brand}<`).test(screenRaw),
    `the wordmark says ${brand}`, 'derived from app.json expo.name');
}

// ── 3 · every tone is measured on the ground it sits on ──────────────────────
//
// No scrims and no artwork: everything is on paper, so legibility is pure
// arithmetic — but only if the styles actually use the tokens the arithmetic
// checks. Each rule pins the STYLE to its token, then measures the token.
{
  ok(/wordmark: \{[^}]*color: C\.ink/s.test(screen), 'the wordmark is set in ink');
  ok(/<Pct progress=\{progress\} color=\{C\.inkSoft\} \/>/.test(screen),
    'the percentage is set in inkSoft');
  ok(/foot: \{[\s\S]*?color: C\.inkSoft/.test(screen), 'the foot line is set in inkSoft');
  ok(/stroke=\{C\.ink\}/.test(screen), 'the progress stroke is drawn in ink');

  const inkOnPaper = ratio(INK, PAPER);
  const softOnPaper = ratio(INK_SOFT, PAPER);
  ok(inkOnPaper >= 4.5, 'ink on paper clears 4.5:1', `${inkOnPaper.toFixed(2)}:1`);
  ok(softOnPaper >= 4.5, 'inkSoft on paper clears 4.5:1', `${softOnPaper.toFixed(2)}:1`);
  ok(inkOnPaper >= 3.0, 'the stroke clears the 3:1 mark floor', `${inkOnPaper.toFixed(2)}:1`);
}

// ── 4 · the quotation, and the paths that must not crash the boot ────────────
{
  ok(/import QuotePlate from '@\/components\/shared\/QuotePlate'/.test(screenRaw)
    && /<QuotePlate/.test(screenRaw) && /philosopherId=\{quote\.id\}/.test(screenRaw),
    'the quotation rides the shared QuotePlate, era spine and all',
    'its tones are tone.plate()’s, held by check-ui');
  ok(/\.filter\(\(q\) => q\.text\.length <= 90\)/.test(screen),
    'the pool is capped at 90 characters', 'readable in the ~3.4s the screen is up');
  ok(/const FALLBACK_QUOTE = \{/.test(screen) && /SHORT_QUOTES\.length > 0 \?/.test(screen),
    'an empty pool falls back instead of crashing the boot');

  const skip = screen.slice(screen.indexOf('if (skipAnimation)'), screen.indexOf('introFade.value = withTiming(1, { duration: 420 })'));
  ok(/progress\.value = 92;/.test(skip) && /setHeld\(true\);/.test(skip) && /return;/.test(skip),
    'skipAnimation stands the performance down',
    'straight to held — no second performance on a restarted cold start');
}

// ── 5 · the status bar never flips ───────────────────────────────────────────
//
// Paper from the splash hand-off to the welcome page's cream: dark icons the
// whole way, so the clock-and-battery blink the old dark screen had to time
// away cannot exist. A light-content anywhere in this file means somebody has
// put a dark ground back without reopening that question.
{
  ok(/barStyle="dark-content"/.test(screenRaw), 'the status bar is dark-content');
  ok(!/light-content/.test(screenRaw), 'and never light-content anywhere in the file');
}

// ── 6 · the outro budget, and the marker check-ui slices on ──────────────────
//
// check-ui §10 reads the three outro numbers from this file and holds them
// against the tab warm-up's SETTLE_MS. This end asserts the substance: the
// slice marker exists, onLift fires at the TOP of the outro, and the three
// numbers still cover the 1.03s the welcome's host needs to walk into frame.
{
  const at = screen.indexOf('lifted.current = true;');
  ok(at >= 0, 'the outro marker `lifted.current = true;` is present', 'check-ui §10 slices on it');
  const outro = screen.slice(at);
  ok(outro.indexOf('onLift?.()') >= 0 && outro.indexOf('onLift?.()') < outro.indexOf('withTiming(100'),
    'onLift fires before the finish begins', 'the screen underneath starts under cover');
  const durations = [...outro.matchAll(/duration: (\d+)/g)].map((m) => +m[1]);
  const delays = [...outro.matchAll(/withDelay\(\s*(\d+)/g)].map((m) => +m[1]);
  const total = [...durations.slice(0, 2), ...delays.slice(0, 1)].reduce((a, b) => a + b, 0);
  ok(total >= 1031, 'the outro covers the welcome host’s 1.03s walk-in', `${total}ms of cover`);
  ok(/runOnJS\(onDone\)\(\)/.test(outro), 'and onDone still fires at the end of the fade');
}

console.log(bad ? `\ncheck-launch: ${bad} FAILING` : '\ncheck-launch: all green');
process.exit(bad ? 1 : 0);

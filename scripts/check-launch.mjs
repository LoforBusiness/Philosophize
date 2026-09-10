// Can the launch screen be read, and does it keep the boot contract?
//
//   node scripts/check-launch.mjs        (npm run check:launch)
//
// The launch screen has been three things. Six near-black illustrated
// landscapes; then a TITLE PAGE — laurel, wordmark, a hand-drawn rule drawing
// itself as the progress line, one QuotePlate from the library; and now THE
// DRAWING: a white page on which one unbroken pen line scribbles itself into a
// ball of ink, crosses the page, becomes a light bulb, and lights.
//
// What survives every rewrite is the boot contract, and that is most of this
// file. What changes is the art, so the art rules are rewritten with it —
// deliberately, because a checker that describes a screen two designs ago is
// worse than no checker: it is green, and it is describing nothing.
//
//   §1  the splash hand-off — SPLASH_BG equals app.json's splash colour, the
//       ground starts ON it, and the step from splash to page is mild;
//   §2  the wordmark says what app.json says (the rule that caught this screen
//       still reading the previous brand for a whole rename);
//   §3  every tone clears its floor on the ground it actually sits on;
//   §4  the drawing is DRAWN rather than faded in, its data is whole, and its
//       phases are in the order the picture is about;
//   §4b the performance shape §17 rule 7 forces, held structurally;
//   §4c ONE clock — the pen, the light and the title cannot drift apart;
//   §5  the status bar is dark-content and never flips;
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
const drawRaw = read('components/launch/InkDrawing.tsx');
const draw = strip(drawRaw);
const artSrc = read('components/launch/inkArt.ts');
const launchArtSrc = read('components/launch/launchArt.ts');
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
const INK = token('ink');
const INK_SOFT = token('inkSoft');

console.log('check-launch: the drawing');

// ── 1 · the hand-off from the native splash ──────────────────────────────────
//
// The app's FIRST frame is the native splash; the second is this screen. The
// splash colour is a COMPILED resource (§18) and SPLASH_BG in launchArt.ts is
// the OTA-updatable twin — the pair that can drift, so it is compared, not
// trusted. The ground must also START on it, so the hand-off has no seam
// whoever tunes either side next.
let GROUND = '#FFFFFF';
{
  const splashM = launchArtSrc.match(/export const SPLASH_BG = '(#[0-9A-Fa-f]{6})'/);
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

  const gm = screen.match(/const GROUND = '(#[0-9A-Fa-f]{6})';/);
  ok(!!gm, 'the screen declares its ground as one constant', gm?.[1] ?? 'missing');
  GROUND = gm?.[1] ?? '#FFFFFF';
  ok(/interpolateColor\(introFade\.value, \[0, 1\], \[SPLASH_BG, GROUND\]\)/.test(screen),
    'and it starts on the splash colour, settling on the intro curve');

  // THE PAGE IS PURE WHITE AND THE SPLASH CANNOT BE, so this step is wider than
  // it was for paper. The splash is compiled into the binary and no OTA can
  // touch it, so the honest budget is "imperceptible", not "identical" — and
  // the number that matters is the one the old scenes had: 10.7:1.
  const step = ratio(SPLASH, GROUND);
  ok(step < 1.35,
    'splash → page is a mild step, not a flash',
    `${step.toFixed(2)}:1 (the old near-black scenes were 10.7:1 at their mildest)`);
}

// ── 2 · the wordmark says what app.json says ─────────────────────────────────
//
// The brand lives in exactly one place. The old masthead spelled the previous
// name one letter at a time for a whole rename because it was written by hand
// and matched no search for the name itself; the expected string is derived, so
// a rename fails here instead of shipping. Both halves are checked, because
// either alone is a hole: a constant nothing renders is decoration, and a
// `.split('')` over a hard-coded array is the old defect in the new shape.
{
  const brand = JSON.parse(read('app.json')).expo.name.toUpperCase();
  ok(new RegExp(`const WORDMARK = '${brand}'`).test(screen),
    `the wordmark constant says ${brand}`, 'derived from app.json expo.name');
  ok(/const LETTERS = WORDMARK\.split\(''\)/.test(screen) && /LETTERS\.map\(/.test(screen),
    'and the letters on the page are derived from that constant',
    'a per-letter title cannot drift from the brand it spells');
}

// ── 3 · every tone is measured on the ground it sits on ──────────────────────
//
// No scrims and no photography: everything is on the page, so legibility is
// pure arithmetic — but only if the styles actually use the tokens the
// arithmetic checks. Each rule pins the STYLE to its token, then measures the
// token against the ground §1 just read out of the file.
{
  ok(/letter: \{[^}]*color: C\.ink/s.test(screen), 'the title is set in ink');
  ok(/<Pct progress=\{progress\} color=\{C\.inkSoft\} \/>/.test(screen),
    'the percentage is set in inkSoft');
  ok(/colour=\{C\.ink\}/.test(draw), 'the pen draws in ink, not a local hex');

  const inkOnGround = ratio(INK, GROUND);
  const softOnGround = ratio(INK_SOFT, GROUND);
  ok(inkOnGround >= 4.5, 'ink on the page clears 4.5:1', `${inkOnGround.toFixed(2)}:1`);
  ok(softOnGround >= 4.5, 'inkSoft on the page clears 4.5:1', `${softOnGround.toFixed(2)}:1`);
  ok(inkOnGround >= 3.0, 'the pen clears the 3:1 mark floor', `${inkOnGround.toFixed(2)}:1`);
}

// ── 4 · the drawing is DRAWN, and its data is whole ──────────────────────────
//
// The reader asked for one thing above all else: "I want everything to be
// drawn, not just appear, but I want it to draw into form." An opacity fade
// would satisfy every other rule in this file and be the wrong screen, so the
// reveal mechanism is asserted directly — a dash offset running down each
// stroke's OWN measured length, which is the only reveal that is a pen moving.
{
  ok(/strokeDashoffset: s\.len \* \(1 - p\)/.test(draw),
    'every mark is revealed along its own length',
    'a dash reveal is a pen moving; an opacity fade is a thing appearing');
  ok(/strokeLinecap="round"/.test(drawRaw),
    'and round-capped',
    'a butt cap ends a dash reveal on a hard rectangle and reads as a vector wipe');

  const rows = [...artSrc.matchAll(/\{ d: '([^']*)', len: (\d+), x: (-?\d+), y: (-?\d+), w: (\d+), h: (\d+)/g)]
    .map((m) => ({ d: m[1], len: +m[2], x: +m[3], y: +m[4], w: +m[5], h: +m[6] }));
  ok(rows.length > 40, 'the art file holds the traced drawing', `${rows.length} strokes`);
  ok(rows.every((r) => r.len > 0 && r.w > 0 && r.h > 0 && r.d.startsWith('M')),
    'every stroke has a path, a positive length and a box',
    'the length is what the reveal maps onto — a zero would never draw');

  // THE PHASES ARE THE PICTURE'S OWN ARGUMENT. The tangle and the journey are
  // ONE unbroken run in the source and were cut apart on purpose: drawn in
  // traced order the bulb appears a third of the way in and the animation then
  // goes back to scribbling. If a regenerated art file ever lands with the
  // journey overlapping the ball of ink, the reveal stops telling the story.
  const grab = (name) => {
    const at = artSrc.indexOf(`export const ${name}: InkStroke[] = [`);
    const end = artSrc.indexOf('\n];', at);
    return [...artSrc.slice(at, end).matchAll(/x: (-?\d+), y: (-?\d+), w: (\d+), h: (\d+)/g)]
      .map((m) => ({ x: +m[1], w: +m[3] }));
  };
  const tangle = grab('TANGLE');
  const journey = grab('JOURNEY');
  const hatch = grab('HATCH');
  ok(tangle.length > 0 && journey.length > 0 && hatch.length > 0,
    'the three movements are all present',
    `${tangle.length} tangle · ${journey.length} journey · ${hatch.length} marker`);
  const tangleRight = Math.max(...tangle.map((s) => s.x + s.w));
  const journeyRight = Math.max(...journey.map((s) => s.x + s.w));
  ok(journeyRight > tangleRight,
    'the journey reaches past the ball of ink',
    `tangle ends at ${tangleRight}, the journey runs to ${journeyRight}`);
  const glass = artSrc.match(/GLASS = \{ cx: (\d+), cy: (\d+), r: (\d+) \}/);
  ok(!!glass, 'the glass is declared', glass ? `cx ${glass[1]} r ${glass[3]}` : 'missing');
  const hatchL = Math.min(...hatch.map((s) => s.x));
  const hatchR = Math.max(...hatch.map((s) => s.x + s.w));
  ok(!!glass && +glass[1] > hatchL && +glass[1] < hatchR,
    'and it is derived from the marker it lights, not typed in',
    'a hand-set centre drifts away from the thing it is supposed to be lighting');

  // The movements must run in the order the picture is about.
  const phase = (n) => +(draw.match(new RegExp(`const ${n} = ([0-9.]+);`))?.[1] ?? -1);
  const [tT, tJ, tH, tS] = ['T_TANGLE', 'T_JOURNEY', 'T_HATCH', 'T_STRIKE'].map(phase);
  ok(tT > 0 && tT < tJ && tJ < tH && tH <= 1,
    'the tangle, then the line, then the marker — in that order',
    `${tT} → ${tJ} → ${tH}`);
  ok(tS >= tJ && tS < 1, 'and the light strikes after the bulb exists', `strike at ${tS}`);
}

// ── 4b · the performance shape, held structurally ────────────────────────────
//
// §17 rule 7: what an animated SVG costs is the AREA it repaints. Measured on
// this drawing, one <Svg> holding all 52 paths would repaint 53.6% of a screen
// per frame AND re-stroke every path; tiled, the worst real window of live
// strokes repaints 22.3%, with six paths in it.
//
// None of that is visible in a screenshot and none of it is visible in a
// browser, which is where this project can actually look at itself — so it is
// held here, structurally, or it will be refactored away by somebody tidying.
{
  ok(/const LOOKAHEAD = \d+;/.test(draw),
    'the live window is a named constant',
    'strokes past it are not mounted; strokes before it do not animate');
  ok(/animatedProps=\{live \? drawing : undefined\}/.test(draw),
    'a finished stroke has no animated props attached',
    'setStrokeDashoffset ends in a bare invalidate() — an attached prop repaints its SvgView every frame');
  ok(/ALL\.slice\(0, mounted\)/.test(draw) && /Math\.min\(ALL\.length, done \+ LOOKAHEAD\)/.test(draw),
    'and only the window is mounted at all');
  // One <Svg> per stroke, sized to that stroke's own box — the tiling itself.
  ok(/width=\{s\.w \* scale\}/.test(draw) && /height=\{s\.h \* scale\}/.test(draw)
    && /viewBox=\{`\$\{s\.x\} \$\{s\.y\} \$\{s\.w\} \$\{s\.h\}`\}/.test(draw),
    'each stroke is drawn in an <Svg> no bigger than itself',
    'the repaint bill is the box, so the box is the art and nothing else');
  // Counted on the STRIPPED source: this file explains the tiling in prose, and
  // reading the raw text counts every `<Svg>` in a comment as another one on the
  // page. That is L8's lesson in miniature — strip before you detect.
  ok((draw.match(/<Svg/g) ?? []).length === 2,
    'there are exactly two kinds of <Svg> here: a stroke, and the inert lamp',
    'the light is carried by the View’s opacity and scale, never by SVG properties');
}

// ── 4c · ONE clock ───────────────────────────────────────────────────────────
//
// The pen, the marker, the light and the title are all functions of the same
// value. That is group L of the rule book in one line: two clocks that are
// supposed to agree will come apart under load, and this screen has already
// been bitten by it once — the status bar used to cross on the UNMOUNT rather
// than on the picture, so the icons blinked out over a cream page.
{
  ok(/const u = useDerivedValue\(\(\) => Math\.min\(progress\.value, 92\) \/ 92\)/.test(screen),
    'the drawing’s timeline is derived from the readout, not timed separately');
  ok(/<InkDrawing u=\{u\} width=\{width\} \/>/.test(screen), 'the drawing reads it');
  ok(/const set = useDerivedValue\(\(\) => \{[\s\S]*?u\.value - WORD_AT/.test(screen),
    'and so does the title', 'no second timing to fall out of step');
  ok(/const WORD_SPAN = \(LETTERS\.length \* LETTER_STAGGER\) \/ DRAW_MS;/.test(screen),
    'the title’s window is derived from its own rhythm and the draw length',
    'so a change to either cannot leave the name half-set when the page lifts');
  ok(/const LETTER_STAGGER = 140;/.test(screen),
    'the title sets at the 140ms pen-lift rhythm', 'from the signature-drawing literature');
  ok(/const Letter = memo\(/.test(screen) && /set\.value - index/.test(screen),
    'and all its letters read one driver', 'a stagger is a subtraction, not seven timings');

  // THE HALF THAT IS ABOUT SAFETY RATHER THAN TASTE. The walker died here once
  // on a defaulted gait that never reached the UI runtime's closure — fatal in
  // release, on every launch, invisible to tsc and invisible in a browser.
  const boot = screenRaw + drawRaw;
  ok(!/cinematic\/Stickman/.test(boot) && !/cinematic\/rig/.test(boot)
    && !/useFrameCallback/.test(strip(boot)),
    'no rig, figure or frame clock is on the boot path',
    'the walker crashed release here on a defaulted gait; nothing here can throw');

  const skip = screen.slice(screen.indexOf('if (skipAnimation)'), screen.indexOf('introFade.value = withTiming(1, { duration: 420 })'));
  ok(/progress\.value = 92;/.test(skip) && /setHeld\(true\);/.test(skip) && /return;/.test(skip),
    'skipAnimation stands the performance down',
    'straight to held — no second performance on a restarted cold start');
}

// ── 5 · the status bar never flips ───────────────────────────────────────────
//
// A white page from the splash hand-off to the welcome page's cream: dark icons
// the whole way, so the clock-and-battery blink the old dark screen had to time
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

  // THE DRAW LENGTH IS A FLOOR ON EVERY COLD START, so it is worth a rule of its
  // own rather than being tuned by feel until somebody notices the app is slow
  // to open.
  const ms = +(screen.match(/const DRAW_MS = (\d+);/)?.[1] ?? 0);
  ok(ms > 0 && ms <= 3200, 'the drawing does not overstay its welcome',
    `${ms}ms of drawing + ${total}ms of outro = ${((ms + total) / 1000).toFixed(2)}s per cold start`);
}

console.log(bad ? `\ncheck-launch: ${bad} FAILING` : '\ncheck-launch: all green');
process.exit(bad ? 1 : 0);

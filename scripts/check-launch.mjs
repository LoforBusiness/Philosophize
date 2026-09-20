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
// The two drawing files can be pointed elsewhere, so a counter-test can put a
// defect back without touching the working tree.
const drawRaw = read(process.env.LAUNCH_DRAW || 'components/launch/InkDrawing.tsx');
const draw = strip(drawRaw);
const artSrc = read(process.env.LAUNCH_ART || 'components/launch/inkArt.ts');
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

  // THE SPLASH CAN BE THE PAGE NOW, so the budget is "identical" rather than
  // "imperceptible". It could not be before: the splash is compiled into the
  // binary and no OTA can touch it, so while the page was pure white and the
  // splash was #E4E4DF the honest rule was a 1.35 ceiling, measured against the
  // 10.7:1 the old near-black scenes opened with. Build 22 repainted the
  // compiled half white, and the step went to nothing.
  //
  // EXACT, because the asymmetry has not gone away. An update can move GROUND
  // and can never move the splash, so a step reintroduced from this side is one
  // no OTA could take back out — it would be a flash on the first frame of the
  // app until somebody shipped a binary. This is the only place that can say so
  // before it ships.
  const step = ratio(SPLASH, GROUND);
  ok(SPLASH.toLowerCase() === GROUND.toLowerCase(),
    'splash → page is no step at all: the pen draws on the page already there',
    `splash ${SPLASH} · page ${GROUND} · ${step.toFixed(2)}:1`);
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
//
// THE WINDOW IS GONE, AND THIS IS WHY IT IS SAFE. Strokes used to be mounted six
// at a time from the JS thread, so a launch stall longer than the window left the
// pen drawing strokes that did not exist yet — the gaps a reader reported. Every
// stroke is mounted now and keeps its animated props, which is only cheap because
// Reanimated does not write a value that has not changed: a stroke before or
// after its slice returns the same number every frame and is never written. That
// is a property of a DEPENDENCY, so it is read out of node_modules here — an
// upgrade that drops it would make every stroke repaint on every frame.
{
  ok(!/runOnJS|useAnimatedReaction|useState/.test(draw),
    'nothing about the drawing waits on the JS thread',
    'a window advanced through runOnJS fell behind the pen whenever launch stalled');
  ok(/MARK\.map\(/.test(draw) && /INK\.map\(/.test(draw) && !/\.slice\(0, /.test(draw),
    'every stroke is mounted from the first frame');
  ok(/animatedProps=\{drawing\}/.test(draw) && /strokeDasharray=\{`\$\{s\.len\} \$\{s\.len \+ 2\}`\}/.test(draw),
    'and each keeps its dash and its animated props for the whole draw');
  const ras = read('node_modules/react-native-reanimated/src/hook/useAnimatedStyle.ts');
  const rap = read('node_modules/react-native-reanimated/src/hook/useAnimatedProps.ts');
  ok(/if \(!shallowEqual\(oldValues, newValues\) \|\| forceUpdate\) \{\s*updateProps\(/.test(ras)
    && /return \(useAnimatedStyle as UseAnimatedStyleInternal<Props>\)\(/.test(rap),
    'Reanimated still skips a prop that has not changed',
    'setStrokeDashoffset ends in a bare invalidate() — were every value written, every stroke would repaint every frame');
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

// ── 4d · one continuous line, nothing cut off ────────────────────────────────
//
//   "for the scribble … it seems to be cut off a little bit on the bottom. And
//    … there seems to be gaps in the scribble sometimes. Is there a way to fix
//    it so it's all one continuous line?"
//
// Both were true of the first trace and neither could be seen in its numbers:
// the tangle was 25 pieces with a pen lift between every two, 17 crossings were
// not drawn at all, and six lines stopped dead where the source JPEG is cropped.
// The rules below are the ones that picture breaks, and they are measured on the
// curves themselves rather than read off the stored boxes.
{
  const PEN_HALF = 3.6;               // InkDrawing's PEN_W / 2
  const MARK_HALF = 21 / 2;           // InkDrawing's MARK_W / 2, when a stroke declares no sw
  const section = (name) => {
    const at = artSrc.indexOf(`export const ${name}: InkStroke[] = [`);
    const end = artSrc.indexOf('\n];', at);
    return [...artSrc.slice(at, end).matchAll(/\{ d: '([^']*)', len: (\d+), x: (-?\d+), y: (-?\d+), w: (\d+), h: (\d+)(?:, sw: ([\d.]+))? \}/g)]
      .map((m) => ({ d: m[1], len: +m[2], x: +m[3], y: +m[4], w: +m[5], h: +m[6], sw: m[7] ? +m[7] : null }));
  };
  const bez = (p, t) => { const u = 1 - t; return [0, 1].map((k) => u*u*u*p[0][k] + 3*u*u*t*p[1][k] + 3*u*t*t*p[2][k] + t*t*t*p[3][k]); };
  /** start, end, arc length and sampled points of an M/C path. */
  const walk = (d) => {
    const tok = d.match(/[MC]|-?\d*\.?\d+/g);
    let i = 0, pen = null, start = null, len = 0, lifts = 0;
    const pts = [];
    while (i < tok.length) {
      const t = tok[i++];
      if (t === 'M') { if (pen) lifts++; pen = [+tok[i++], +tok[i++]]; start ??= pen; pts.push(pen); continue; }
      const c = [pen, [+tok[i++], +tok[i++]], [+tok[i++], +tok[i++]], [+tok[i++], +tok[i++]]];
      let prev = pen;
      for (let s = 1; s <= 48; s++) { const q = bez(c, s / 48); len += Math.hypot(q[0] - prev[0], q[1] - prev[1]); pts.push(q); prev = q; }
      pen = c[3];
    }
    return { start, end: pen, len, pts, lifts };
  };
  const tangle = section('TANGLE').map((s) => ({ ...s, w_: walk(s.d), half: PEN_HALF }));
  const journey = section('JOURNEY').map((s) => ({ ...s, w_: walk(s.d), half: PEN_HALF }));
  const hatch = section('HATCH').map((s) => ({ ...s, w_: walk(s.d), half: (s.sw ?? 21) / 2 || MARK_HALF }));
  const same = (a, b) => a && b && a[0] === b[0] && a[1] === b[1];

  const breaks = [];
  for (let i = 1; i < tangle.length; i++) if (!same(tangle[i - 1].w_.end, tangle[i].w_.start)) breaks.push(i);
  ok(tangle.length > 0 && breaks.length === 0,
    'the ball of ink is one line: every stroke starts where the last one ended',
    breaks.length ? `the pen lifts before stroke${breaks.length > 1 ? 's' : ''} ${breaks.slice(0, 6).join(', ')}${breaks.length > 6 ? ` and ${breaks.length - 6} more` : ''}` : `${tangle.length} strokes, 0 lifts`);
  ok(same(tangle[tangle.length - 1]?.w_.end, journey[0]?.w_.start),
    'and it carries straight on into the line to the bulb',
    `tangle ends at (${tangle[tangle.length - 1]?.w_.end}), the journey starts at (${journey[0]?.w_.start})`);
  const inner = [...tangle, ...journey].filter((s) => s.w_.lifts > 0).length;
  ok(inner === 0, 'no stroke lifts the pen inside itself', `${inner} do`);
  ok(journey.length === 2, 'the only lift in the whole pen line is the one the drawing has: onto the filament',
    `${journey.length} journey strokes`);
  ok(tangle[0]?.w_.start[0] <= 0.5,
    'the line comes in at the very edge of the page',
    `it starts at x ${tangle[0]?.w_.start[0]}`);

  // A trace that stops where its source is cropped is a line with an end in the
  // middle of the page, so the rule above already catches the old defect. This
  // one says it in the reader's words: the lowest ink sits below the source's
  // bottom edge (1128), because the lines that ran off it are closed there.
  const lowest = Math.max(...tangle.flatMap((s) => s.w_.pts.map((p) => p[1])));
  ok(lowest > 1128 + 10, 'the lines that ran off the source are closed below it, not sliced at it',
    `the tangle reaches y ${lowest.toFixed(0)}; the source ends at 1128`);

  // Each stroke is drawn in an <Svg> exactly its box: anything past the box is
  // clipped, which is precisely "cut off". And the dash must cover the curve, or
  // the stroke's last stretch never draws.
  const clipped = [], short = [];
  for (const [name, list] of [['TANGLE', tangle], ['JOURNEY', journey], ['HATCH', hatch]]) {
    list.forEach((s, i) => {
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      for (const [x, y] of s.w_.pts) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
      const over = Math.max(s.x - (x0 - s.half), s.y - (y0 - s.half), x1 + s.half - (s.x + s.w), y1 + s.half - (s.y + s.h));
      if (over > 0.05) clipped.push(`${name}[${i}] by ${over.toFixed(1)}`);
      if (s.w_.len > s.len + 0.01) short.push(`${name}[${i}] ${s.len} < ${s.w_.len.toFixed(1)}`);
    });
  }
  ok(clipped.length === 0, 'no stroke is clipped by its own <Svg>', clipped.slice(0, 4).join(' · ') || 'every curve sits inside its box, pen width included');
  ok(short.length === 0, 'every dash covers its whole curve', short.slice(0, 4).join(' · ') || 'a finished stroke keeps its dash, so this is what draws its end');

  const art = artSrc.match(/export const ART = \{ x: (-?\d+), y: (-?\d+), w: (\d+), h: (\d+) \}/);
  const all = [...tangle, ...journey, ...hatch];
  ok(!!art && all.every((s) => s.x >= +art[1] && s.y >= +art[2] && s.x + s.w <= +art[1] + +art[3] && s.y + s.h <= +art[2] + +art[4]),
    'and every box sits inside ART, so the page reserves room for all of it');
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

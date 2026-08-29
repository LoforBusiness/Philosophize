// THE THINGS A READER TAPS, AND WHETHER THEY LOOK LIKE WHAT THEY ARE.
//
//   node scripts/check-answers-shape.mjs          (npm run check:shape)
//   SHAPE_ALL=1 node scripts/check-answers-shape.mjs   every hit, with its line
//
// Two defects, both found by rebuilding metaphysics31 and both invisible to
// every other check in the repo, because both are about the AFFORDANCE rather
// than about the art or the words.
//
// ── 1 · A SQUARE RING ON A ROUND THING ──────────────────────────────────────
//
// `Target` draws a breathing ink ring on its own bounds, which is what tells a
// reader "this is the button". It takes a `radius` prop, and its own comment
// says what for: "Match the target's own corner, so the ring does not square off
// a round thing." Default 4.
//
// A target wrapping a CIRCLE and not passing it therefore arrives as a square
// ring around a round hole. In the cheese lesson that produced two nested
// squares around two nested circles, and the reader's words were "when you tap
// on an answer, it's kind of confusing, which when you actually tap".
//
// ── 2 · MORE OUTLINED PARTS THAN THERE ARE ANSWERS ──────────────────────────
//
// The question panel counts the mounted targets and says the number out loud —
// "Tap one of the 3 marked parts above". So a scene that offers the same answer
// twice (a labelled tab AND the thing it labels) tells the reader there are four
// choices when there are three, and two of the four do the same thing. That is
// what the cheese lesson did, and the panel printed "one of the 4 outlined parts"
// under a question with three answers.
//
// Offering one answer through two targets is not always wrong — a scene may
// deliberately let you tap either a label or the thing. It is wrong when the
// COUNT the panel prints stops matching the choices, which is every time.
import fs from 'node:fs';
import path from 'node:path';
import { collapsedTargetChildren } from './lib/tonenest.mjs';
import { scanAnsweredOpacities } from './lib/answerdim.mjs';

const CIN = path.join(process.cwd(), 'components', 'lesson', 'cinematic');
const ALL = !!process.env.SHAPE_ALL;

const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\n]*/g, '$1');

/** Every `<Target …>` element in a scene, as its own attribute text. */
function targetsOf(src) {
  const out = [];
  const re = /<Target\b/g;
  let m;
  while ((m = re.exec(src))) {
    // To the end of the opening tag, respecting braces so a style array with a
    // `>` inside a comparison does not end it early.
    let depth = 0;
    for (let k = m.index; k < src.length; k++) {
      const c = src[k];
      if (c === '{') depth++;
      else if (c === '}') depth--;
      else if (c === '>' && depth === 0) { out.push(src.slice(m.index, k + 1)); break; }
    }
  }
  return out;
}

/** The StyleSheet entry for a key, as text. */
function styleOf(src, key) {
  const m = new RegExp(`\\n  ${key}:\\s*\\{([\\s\\S]*?)\\n  \\},`).exec(src);
  return m ? m[1] : '';
}

/**
 * Is this style round?
 *
 * A React Native circle is `borderRadius` at half the box, so the test is the
 * RATIO rather than the raw number: `borderRadius: 4` on a 90-wide tab is a
 * soft corner and `borderRadius: 45` on the same box is a disc. Where the width
 * is an expression rather than a literal (`BIG_R * 2`) the radius is compared
 * against the same expression's name, which is how these scenes are written.
 */
function roundness(style) {
  const r = /borderRadius:\s*([A-Za-z_$][\w$]*|[\d.]+)/.exec(style);
  if (!r) return 0;
  const w = /(?:width|height):\s*([A-Za-z_$][\w$]*(?:\s*\*\s*2)?|[\d.]+)/.exec(style);
  if (!w) return 0;
  const rv = parseFloat(r[1]);
  const wv = parseFloat(w[1]);
  // Symbolic: `borderRadius: BIG_R` with `width: BIG_R * 2` is exactly a circle.
  if (Number.isNaN(rv) || Number.isNaN(wv)) {
    return w[1].replace(/\s*\*\s*2$/, '') === r[1] ? 1 : 0;
  }
  return wv > 0 ? (rv * 2) / wv : 0;
}

let bad = 0;
const square = [];
const doubled = [];
let targets = 0, scenes = 0;

for (const f of fs.readdirSync(CIN).filter((n) => n.endsWith('Scene.tsx')).sort()) {
  const raw = fs.readFileSync(path.join(CIN, f), 'utf8');
  const src = strip(raw);
  const name = f.replace('Scene.tsx', '');
  const tags = targetsOf(src);
  if (!tags.length) continue;
  scenes++;
  targets += tags.length;

  // ── 1 · square rings ──────────────────────────────────────────────────────
  for (const t of tags) {
    if (/\bradius=\{/.test(t)) continue;
    // Which style does it wear?
    const st = /style=\{(?:\[)?\s*styles\.(\w+)/.exec(t);
    if (!st) continue;
    const round = roundness(styleOf(src, st[1]));
    if (round >= 0.9) {
      square.push({ name, style: st[1], id: (/id=\{?'([\w-]+)'/.exec(t) || [])[1] || '?' });
    }
  }

  // ── 2 · one answer, two targets ───────────────────────────────────────────
  const ids = tags.map((t) => (/id=\{?'([\w-]+)'/.exec(t) || [])[1]).filter(Boolean);
  const seen = new Map();
  for (const id of ids) seen.set(id, (seen.get(id) || 0) + 1);
  const dupes = [...seen.entries()].filter(([, n]) => n > 1);
  if (dupes.length) {
    doubled.push({ name, dupes, total: ids.length, distinct: seen.size });
  }
}

console.log('\nTHE THINGS A READER TAPS\n');
console.log(`  ${scenes} scenes draw ${targets} tap targets\n`);

const ok = (msg, detail = '') => console.log(`  ok    ${msg}${detail ? `  — ${detail}` : ''}`);
const no = (msg, detail = '') => { bad++; console.log(`  FAIL  ${msg}${detail ? `  — ${detail}` : ''}`); };

if (!square.length) ok('every ring matches the shape it is drawn around');
else {
  no(`${square.length} round target(s) wear a square ring`,
    'Target takes `radius` for exactly this — see its own comment');
  const show = ALL ? square : square.slice(0, 12);
  for (const s of show) console.log(`          ${s.name.padEnd(16)} ${s.id.padEnd(12)} styles.${s.style}`);
  if (!ALL && square.length > show.length) console.log(`          …and ${square.length - show.length} more (SHAPE_ALL=1)`);
}

if (!doubled.length) ok('no scene offers one answer through two targets');
else {
  no(`${doubled.length} scene(s) count more outlined parts than there are answers`,
    'the question panel prints that count to the reader');
  const show = ALL ? doubled : doubled.slice(0, 12);
  for (const d of show) {
    console.log(`          ${d.name.padEnd(16)} ${d.total} targets, ${d.distinct} answers — ` +
      d.dupes.map(([id, n]) => `${id}×${n}`).join(' '));
  }
  if (!ALL && doubled.length > show.length) console.log(`          …and ${doubled.length - show.length} more (SHAPE_ALL=1)`);
}

// S10 — A CHILD OF A TARGET SIZED BY left/right RENDERS AT ZERO WIDTH.
//
// Target puts its children in a wrapper that carries the answer reaction, and
// that wrapper is an ordinary flex child: `alignItems` on the box handed to the
// Target makes it shrink to its content, so a child positioned with left:0
// right:0 resolves to nothing. ethics13's five rail labels rendered at 0 units.
//
// It belongs in THIS file because the failure is a tap target that does not look
// like what it is — but the reason it is checked at all is the second failure it
// caused. mustprobe drops anything under 1.5 units, so those five words were
// never recorded, the tour generator had no word to protect, and it framed a shot
// that pushed COWARD 73% off the screen while check:tour reported no station
// cutting any word. A layout fault made a camera fault invisible to the check
// that exists to prevent it.
const collapsed = [];
for (const f of fs.readdirSync(CIN).filter((x) => x.endsWith('Scene.tsx')).sort()) {
  collapsed.push(...collapsedTargetChildren(fs.readFileSync(path.join(CIN, f), 'utf8'), f));
}
if (!collapsed.length) ok('no child of a target is sized by left/right');
else {
  no(`${collapsed.length} target child(ren) sized by left/right instead of a width`,
    'the wrapper between them does not stretch — give it a width (S10)');
  for (const c of collapsed) console.log(`          ${c}`);
}

// S11 — A SCENE'S ANSWERED STYLE MAY NOT SET AN OPACITY.
//
// Target owns the opacity and the scale of the reply; the scene marks by form.
// A scene that also dims MULTIPLIES with it, and the branch it hits is the one
// under the reader's own finger — 0.5 x 0.45 = 0.225, measured on aesthetics14
// through a real answer while the untouched loser sat at the intended 0.7. It
// was the idiom in 113 places, because Target's own header used to say the
// component did not style the answered state at all.
//
// Same file as S10 for the same reason: it is a tap target that does not look
// like what it is. This one only shows up AFTER the tap.
const dimmed = scanAnsweredOpacities(CIN);
if (!dimmed.length) ok("no answered style dims on top of Target's own reaction");
else {
  no(`${dimmed.length} answered style(s) set an opacity Target has already set`,
    'mark by border, fill or dash — Target owns the fade (S11)');
  const shownDim = ALL ? dimmed : dimmed.slice(0, 12);
  for (const d of shownDim) {
    console.log(`          ${d.file.replace('Scene.tsx', '').padEnd(16)} ${d.name.padEnd(12)}`
      + `opacity ${d.opacity} -> lands at ${(d.opacity * 0.5).toFixed(2)} on the reader's own pick`);
  }
  if (!ALL && dimmed.length > shownDim.length) console.log(`          …and ${dimmed.length - shownDim.length} more (SHAPE_ALL=1)`);
}

console.log(bad ? `\n${bad} failing.\n` : '\nall clear.\n');
process.exit(bad ? 1 : 0);

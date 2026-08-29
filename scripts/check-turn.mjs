// A FIGURE THAT WALKS LEFT HAS TO TURN AND FACE LEFT.
//
//   node scripts/check-turn.mjs            (npm run check:turn)
//   TURN_ALL=1 node scripts/check-turn.mjs      every hit
//
// `pose()` takes the facing as its fifth argument. Hand it a literal 1 and the
// figure faces right for the whole lesson — so on any beat whose x DECREASES he
// slides backwards across the stage with his legs cycling forwards. A reader
// described it exactly: "the stickman will walk backwards while its legs are
// moving the wrong way. The stickman won't actually turn to walk a different
// way."
//
// The gait itself is not wrong. `strideStance` drives the feet from distance and
// is symmetric, so the legs do the right thing in the figure's OWN frame; it is
// the frame that is never flipped. Nothing in the rig can notice, because the rig
// is handed the direction rather than deriving it.
//
// ── WHAT RIGHT LOOKS LIKE ────────────────────────────────────────────────────
//
//   const DIR = dirsFrom(X, 1);
//   …
//   fig: pose(s, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG,
//             facing(DIR[p], DIR[n], bt.value), 1),
//
// `dirsFrom` reads the x track once on the JS thread: +1 where x rises, -1 where
// it falls, and HOLD while standing still, so a figure who walks left to a chart
// keeps facing the chart while he talks about it. `facing` then eases the sign
// through zero over 0.36s instead of flipping it between two frames — a raw flip
// mirrors the whole man at once, which is the 31-unit pop group L exists for.
//
// ── WHY THIS IS A SOURCE CHECK AND NOT A BROWSER ONE ─────────────────────────
//
// Both halves are static: the x track is a literal per beat, and the facing is an
// argument at one call site. check:smooth replays the figure at a FIXED x and
// measures joints against the pelvis, so the one thing it can never see is which
// way the whole man is pointing — the same blind spot that let L5 through.
import fs from 'node:fs';
import path from 'node:path';

const DIR_CIN = path.join('components', 'lesson', 'cinematic');
const ROUTE = path.join('app', '(app)', 'branches', '[branchSlug]', '[pathSlug]', 'lesson', '[lessonId].tsx');
const ALL = !!process.env.TURN_ALL;

/** Strip comments — a commented-out pose() call is not a call (L8). */
const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\n]*/g, '$1');

// ── lesson id → scene / script, from the route's own CINEMATIC map ───────────
const route = fs.readFileSync(ROUTE, 'utf8');
const comps = new Map([...route.matchAll(/^\s*'([a-z0-9-]+)':\s*(\w+),/gm)].map((m) => [m[1], m[2]]));
const base = (comp) => {
  const b = comp.replace(/Lesson$/, '');
  return b[0].toLowerCase() + b.slice(1);
};

/** Beat bodies, split the way validate-cinematic splits them. */
const BEATS_BLOCK = /BEATS[^=]*=\s*\[([\s\S]*)\n\];/;
const BEAT_SPLIT = /\n\s{2}\},?\s*\n?/;

let scanned = 0, walkers = 0;
const bad = [];
const noTrack = [];

for (const [id, comp] of comps) {
  const stem = base(comp);
  const sceneP = path.join(DIR_CIN, `${stem}Scene.tsx`);
  const scriptP = path.join(DIR_CIN, `${stem}Script.ts`);
  if (!fs.existsSync(sceneP) || !fs.existsSync(scriptP)) continue;
  const scene = strip(fs.readFileSync(sceneP, 'utf8'));
  const script = fs.readFileSync(scriptP, 'utf8');
  scanned += 1;

  // ── the x track ────────────────────────────────────────────────────────────
  // `const X = BEATS.map((b) => b.x ?? FIG_X);` — the fallback is a constant in
  // the scene, and a beat with no x of its own takes it.
  const decl = /const\s+X\s*=\s*BEATS\.map\(\(b\)\s*=>\s*b\.x\s*\?\?\s*([A-Za-z_$][\w$]*|-?[\d.]+)\)/.exec(scene);
  if (!decl) continue;
  let fallback = Number(decl[1]);
  if (Number.isNaN(fallback)) {
    const c = new RegExp('const\\s+' + decl[1] + '\\s*=\\s*(-?[\\d.]+)').exec(scene);
    if (!c) { noTrack.push(`${id} — cannot resolve ${decl[1]}`); continue; }
    fallback = Number(c[1]);
  }
  const body = script.match(BEATS_BLOCK);
  if (!body) { noTrack.push(`${id} — no BEATS block`); continue; }
  const chunks = body[1].split(BEAT_SPLIT).filter((c) => /\S/.test(c));
  const xs = chunks.map((c) => {
    const m = /(?:^|[^A-Za-z])x:\s*(-?[\d.]+)/.exec(c);
    return m ? Number(m[1]) : fallback;
  });

  // Does he ever walk LEFT? travelStance treats a move as a walk past 1 unit.
  const lefts = [];
  for (let k = 1; k < xs.length; k += 1) if (xs[k] < xs[k - 1] - 1) lefts.push(k);
  if (!lefts.length) continue;
  walkers += 1;

  // ── the facing handed to pose() ────────────────────────────────────────────
  // pose(stance, x, groundY, k, DIR, scale) — the fifth argument. Commas inside
  // nested calls make a plain split wrong, so walk the depth.
  // Every pose() in the file, as its argument list. A scene may pose a second,
  // static figure on purpose — a companion who always faces the narrator — so the
  // one that matters is the TRAVELLING figure, the call whose x argument is built
  // from the X track.
  const calls = [];
  for (let at = scene.indexOf('pose('); at >= 0; at = scene.indexOf('pose(', at + 5)) {
    // Not `keepPose(`, `emotePose(` etc.
    if (at > 0 && /[A-Za-z0-9_$]/.test(scene[at - 1])) continue;
    const args = [];
    let depth = 0, start = at + 5;
    for (let i = start; i < scene.length; i += 1) {
      const ch = scene[i];
      if (ch === '(' || ch === '[' || ch === '{') depth += 1;
      else if (ch === ')' || ch === ']' || ch === '}') {
        if (depth === 0) { args.push(scene.slice(start, i).trim()); break; }
        depth -= 1;
      } else if (ch === ',' && depth === 0) {
        args.push(scene.slice(start, i).trim());
        start = i + 1;
      }
    }
    if (args.length >= 5) calls.push(args);
  }
  const travelling = calls.filter((a) => /\bX\s*\[/.test(a[1]));
  if (!travelling.length) continue;
  // Turning is expressed one of three ways across the corpus: facing(), a DIR
  // array indexed by beat, or a per-beat sign the scene computed itself.
  const turns = (d) => /facing\s*\(/.test(d) || /\bDIRS?\b/.test(d) || /\bdir\b/.test(d);
  const pinned = travelling.map((a) => a[4]).filter((d) => !turns(d));
  if (pinned.length) bad.push({ id, stem, dir: pinned[0], lefts, xs });
}

console.log('\nWHICH WAY HE IS POINTING\n');
console.log(`  ${scanned} wired lessons · ${walkers} walk left at some point\n`);

const ok = (m) => console.log(`  ok    ${m}`);
const no = (m, d = '') => { console.log(`  FAIL  ${m}${d ? `  — ${d}` : ''}`); };

if (noTrack.length) for (const n of noTrack) console.log(`  note  ${n}`);

if (!bad.length) ok('every figure that walks left turns to face left');
else {
  no(`${bad.length} lesson(s) walk left with the facing pinned`,
    'pose()\'s fifth argument is a literal, so he moonwalks');
  const show = ALL ? bad : bad.slice(0, 20);
  for (const b of show) {
    console.log(`          ${b.id.padEnd(28)} dir=${b.dir}  left on beat(s) ${b.lefts.join(', ')}`);
  }
  if (!ALL && bad.length > show.length) console.log(`          …and ${bad.length - show.length} more (TURN_ALL=1)`);
  console.log('\n        The fix is two lines, and every scene that already does it writes them\n'
    + '        the same way:\n\n'
    + '          const DIR = dirsFrom(X, 1);\n'
    + '          …K_FIG, facing(DIR[p], DIR[n], bt.value), 1)\n');
}

console.log('');
process.exit(bad.length ? 1 : 0);

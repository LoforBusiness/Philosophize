// ─────────────────────────────────────────────────────────────────────────────
// THE CLOSING ENCOUNTER, HELD TO ITS SEAM (group AJ).
//
//   npm run check:coda
//
// A coda is a PHASE the player runs after the last tap, not a beat, and almost all
// of its safety comes from that: no script changes, no narration, no must-boxes, no
// neighbour rules. What is left is the seam itself, and the seam has exactly three
// ways to go wrong — each of which is silent.
//
//   1. A CODA FOR A LESSON THAT IS NOT THERE. The registry is keyed by lesson id and
//      nothing resolves it until a reader finishes that lesson, so a typo is a coda
//      that simply never runs and a renamed lesson is a coda that stops running.
//
//   2. A HARNESS THAT DOES NOT SWITCH IT OFF. Nine of them walk lessons in a browser
//      and record what is on the stage; `measure-must` writes the boxes that the
//      camera, the gaze, the thoughts and the movement layer are all derived from. A
//      harness that reaches the last tap with the coda live records its figures and
//      props as lesson art — a scene that only exists after the lesson is over —
//      and every table built on those boxes would steer round it. That is the
//      bubbles' own feedback loop with a bigger object, and CLAUDE.md records the
//      bubble version costing 29 lessons a re-measure.
//
//   3. A SCENE THAT IMPORTS ONE. The seam is one-way on purpose: the player knows
//      about codas and no scene does. A scene that reached into `coda/` would put
//      the encounter inside `muststamp`, which is the whole thing this design is
//      arranged to avoid.
//
// `node scripts/countertest-coda.mjs` stages all three.
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import path from 'node:path';

const DIR = 'components/lesson/cinematic';
const CODA_DIR = `${DIR}/coda`;
const ROUTE = 'app/(app)/branches/[branchSlug]/[pathSlug]/lesson/[lessonId].tsx';
const read = (p) => fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n');

const bad = [];
const note = (kind, msg) => bad.push({ kind, msg });

// ── 1 · EVERY CODA IS FOR A LESSON THE APP CAN ACTUALLY OPEN ─────────────────
const index = read(`${CODA_DIR}/index.ts`);
const entries = [...index.matchAll(/^\s*'([a-z0-9-]+)':\s*(\w+),/gm)].map((m) => [m[1], m[2]]);
const wired = new Set([...read(ROUTE).matchAll(/^\s*'([a-z0-9-]+)':\s*\w+,/gm)].map((m) => m[1]));
for (const [id, comp] of entries) {
  if (!wired.has(id)) note('LESSON', `'${id}' has a coda and is not in the CINEMATIC map`);
  if (!fs.existsSync(`${CODA_DIR}/${comp}.tsx`)) note('FILE', `'${id}' names ${comp}, which is not a file in coda/`);
}
// And every coda file is reachable: one written and never registered is dead weight
// that still typechecks, which is how an unused component survives a redesign.
for (const f of fs.readdirSync(CODA_DIR)) {
  if (!f.endsWith('.tsx') || f === 'codaKit.tsx' || f === 'CodaHost.tsx') continue;
  const stem = path.basename(f, '.tsx');
  if (!entries.some(([, c]) => c === stem)) note('ORPHAN', `${f} is not in the CODAS registry`);
}

// ── 2 · EVERY MEASURING HARNESS SWITCHES IT OFF ──────────────────────────────
//
// Keyed on `setWanderOff`, because that is the switch with exactly the same
// argument: a harness that must not see the figure walking about must not see the
// coda either, and the two will always be wanted together.
// NOT THIS FILE, AND NOT ITS COUNTER-TEST. Both quote the two calls in order to talk
// about them, so a scan of `scripts/` matches itself and reports a harness that does
// not exist — and `check:guide` has already been caught by exactly this, where the
// counter-test matching itself made all five staged defects fail for one shared
// reason and hid a rule that had never worked.
const SELF = new Set(['check-coda.mjs', 'countertest-coda.mjs']);
const harnesses = fs.readdirSync('scripts')
  .filter((f) => f.endsWith('.mjs') && !SELF.has(f))
  .filter((f) => read(`scripts/${f}`).includes('setWanderOff(true)'));
for (const f of harnesses) {
  if (!read(`scripts/${f}`).includes('setCodaOff(true)')) {
    note('HARNESS', `scripts/${f} stands the figure still for a measurement and leaves the coda live`);
  }
}
if (!harnesses.length) note('HARNESS', 'no harness sets setWanderOff(true) — this rule has stopped looking at anything');

// ── 3 · THE SEAM IS ONE-WAY ──────────────────────────────────────────────────
for (const f of fs.readdirSync(DIR)) {
  if (!f.endsWith('Scene.tsx')) continue;
  if (/from '\.\/coda/.test(read(`${DIR}/${f}`))) {
    note('SCENE', `${f} imports from coda/ — a scene that draws the encounter puts it inside muststamp`);
  }
}
// The player is the one caller, and it must gate on the flag rather than on the
// registry alone, or the harnesses above are switching off nothing.
const player = read(`${DIR}/CinematicPlayer.tsx`);
if (!/hasCoda\(lesson\.id\)\s*&&\s*!codaOff\(\)/.test(player)) {
  note('PLAYER', 'CinematicPlayer does not gate the coda on both hasCoda() and !codaOff()');
}
if (!/if \(last\) \{ if \(coda\)/.test(player)) {
  note('PLAYER', 'the last tap no longer routes through the coda');
}

// ── say so ───────────────────────────────────────────────────────────────────
console.log('THE CLOSING ENCOUNTER (group AJ)\n');
console.log(`  ${entries.length} lesson(s) end with an encounter · ${harnesses.length} harness(es) switch it off\n`);
if (!bad.length) {
  console.log('  ok    every coda names a wired lesson');
  console.log('  ok    every harness that stands the figure still also switches the coda off');
  console.log('  ok    no scene reaches into coda/, so the encounter stays outside muststamp');
  console.log('\nthe encounter is a phase, and nothing has made it a beat.');
  process.exit(0);
}
const byKind = new Map();
for (const b of bad) byKind.set(b.kind, [...(byKind.get(b.kind) || []), b.msg]);
console.log(`  ✗   ${bad.length} problem(s):\n`);
for (const [k, msgs] of byKind) {
  console.log(`      ${k}  ${msgs.length}`);
  for (const m of msgs) console.log(`        ${m}`);
}
console.log('\nfailed.');
process.exit(1);

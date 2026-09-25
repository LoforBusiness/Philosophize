// THE LAWN CHAIR AND THE MUG, HELD — `npm run check:chair`.
//
// The owner, 2026-09-25: *"All off these things are supposed to be made very natural
// and look very good … I dont want any of these really fast movements."* So this is
// mostly a REPLAY: every routine in `data/lessonChair.ts` is played through the real
// `chairRoutine.ts` and `chairPlay.ts` at 60fps in plain Node, the way a reader
// meets it — patiently, tapping early at every tenth of a second, and tapping back —
// and the worst one-frame move of the man and of the chair is held to a ceiling.
//
//   §1  the table is well formed: every part in order, every beat between the first
//       and the last owns one, the setup opens and the putaway closes, a sip only
//       with the mug in hand, and a question beat only ever SEAT_REST.
//   §2  where it may play: one figure, no visitor, never a grave lesson, never two
//       chair lessons within two of each other, no mug straight after another set piece.
//   §3  the table is the one `make:chair` would write today.
//   §4  the geometry the generator's room test assumes is TRUE: no part of the chair
//       or the package reaches past REACH_BACK / REACH_FRONT / CHAIR_H, and no part
//       ever goes below the ground line.
//   §5  continuity: no frame jumps, at any tap rate, in either direction.
//
// `node scripts/countertest-chair.mjs` stages the defects on a COPY (CHAIR_SRC), so
// the working tree is never edited (group AL's rule).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { loadTs } from './lib/loadts.mjs';
import { beatsOf, LESSONS, parseManifest } from './lib/narration.mjs';
import { grave } from './lib/liveliness.mjs';
import { soloFigure } from './lib/figroom.mjs';

const REPO = process.cwd();
const SRC = process.env.CHAIR_SRC || 'components/lesson/cinematic';
const TABLE = process.env.CHAIR_TABLE || 'data/lessonChair.ts';
const { transform } = await import(pathToFileURL(path.join(REPO, 'node_modules/sucrase/dist/index.js')).href);
const TMP = path.join(os.tmpdir(), `ph-check-chair-${path.basename(SRC)}`);
fs.mkdirSync(TMP, { recursive: true });
fs.writeFileSync(path.join(TMP, 'reanimated.mjs'), 'export const makeMutable = (v) => ({ value: v });\n');
const emit = (rel, name) => {
  const from = path.isAbsolute(rel) ? rel : path.join(REPO, rel);
  const js = transform(fs.readFileSync(from, 'utf8'), { transforms: ['typescript'] }).code
    .replace(/(from\s+['"])react-native-reanimated(['"])/g, '$1./reanimated.mjs$2')
    .replace(/(from\s+['"])\.\/([A-Za-z0-9_-]+)(['"])/g, '$1./$2.mjs$3');
  fs.writeFileSync(path.join(TMP, name), js);
  return pathToFileURL(path.join(TMP, name)).href;
};
const RIG = await import(emit(`${SRC}/rig.ts`, 'rig.mjs'));
const CH = await import(emit(`${SRC}/lawnChair.ts`, 'lawnChair.mjs'));
const RT = await import(emit(`${SRC}/chairRoutine.ts`, 'chairRoutine.mjs'));
const PLAY = await import(emit(`${SRC}/chairPlay.ts`, 'chairPlay.mjs'));
const { CHAIR_PLANS } = await loadTs(TABLE);
const { VISITOR } = await loadTs('data/lessonVisitor.ts');

const fails = [];
const fail = (s) => fails.push(s);
const SEATED_KINDS = new Set([RT.SEAT_CROSS, RT.SEAT_MUG, RT.SEAT_DRUM, RT.SEAT_SIP, RT.SEAT_REST]);
const quads = (p) => Array.from({ length: p.length / 4 }, (_, j) => p.slice(j * 4, j * 4 + 4));

// ── §1 THE TABLE IS WELL FORMED ─────────────────────────────────────────────
for (const [id, plan] of Object.entries(CHAIR_PLANS)) {
  if (plan.length % 4 || !plan.length) { fail(`§1 ${id}: a row is quads, got ${plan.length} numbers`); continue; }
  const Q = quads(plan);
  const file = LESSONS[id];
  const beats = file ? beatsOf(file) : [];
  const asked = (i) => !!(beats[i] && (beats[i].interact || beats[i].mc || beats[i].tap));
  if (Q.length === 1 && Q[0][1] === RT.CH_MUG_STAND) {
    if (asked(Q[0][0]) || beats[Q[0][0]]?.summary) fail(`§1 ${id}: the mug is on a question or the summary`);
    continue;
  }
  if (Q[0][1] !== RT.CH_SETUP) fail(`§1 ${id}: a stretch must open with the setup`);
  if (Q[Q.length - 1][1] !== RT.CH_PUTAWAY) fail(`§1 ${id}: a stretch must close with the putaway`);
  let crossed = 0; let mug = 0;
  for (let j = 0; j < Q.length; j += 1) {
    const [b, kind, c, m] = Q[j];
    if (j && (b < Q[j - 1][0] || b > Q[j - 1][0] + 1)) fail(`§1 ${id}: part ${j} skips or goes back a beat`);
    if (j > 0 && j < Q.length - 1 && !SEATED_KINDS.has(kind)) fail(`§1 ${id}: part ${j} is kind ${kind} in the middle`);
    if (c !== crossed || m !== mug) fail(`§1 ${id}: part ${j} says crossed ${c} mug ${m}, the stretch has ${crossed}/${mug}`);
    if (kind === RT.SEAT_SIP && !mug) fail(`§1 ${id}: a sip with no mug in hand`);
    if (asked(b) && SEATED_KINDS.has(kind) && kind !== RT.SEAT_REST) fail(`§1 ${id}: beat ${b} is a question and he is not just sitting`);
    if (asked(b) && (kind === RT.CH_SETUP || kind === RT.CH_PUTAWAY)) fail(`§1 ${id}: the setup or putaway lands on question beat ${b}`);
    if (beats[b]?.summary) fail(`§1 ${id}: part ${j} is on the summary`);
    if (kind === RT.SEAT_CROSS) crossed = 1;
    if (kind === RT.SEAT_MUG) mug = 1;
  }
}

// ── §2 WHERE IT MAY PLAY ────────────────────────────────────────────────────
const route = fs.readFileSync('app/(app)/branches/[branchSlug]/[pathSlug]/lesson/[lessonId].tsx', 'utf8');
const byBranch = {};
for (const m of route.matchAll(/'([a-z-]+-[a-z]+-(\d+))':\s*([A-Za-z0-9]+)/g)) {
  (byBranch[m[1].split('-')[0]] = byBranch[m[1].split('-')[0]] || []).push({ id: m[1], n: +m[2] });
}
const kindOf = (id) => {
  const p = CHAIR_PLANS[id];
  if (!p) return null;
  return p[1] === RT.CH_MUG_STAND ? 'mug' : 'chair';
};
const textOf = (id) => {
  const f = `${SRC}/${LESSONS[id]}`;
  if (!LESSONS[id] || !fs.existsSync(f)) return '';
  return [...fs.readFileSync(f, 'utf8').matchAll(/\b(?:text|explain|prompt|cite|reads):\s*(['"])((?:\\.|(?!\1)[^\\])*)\1/g)].map((m) => m[2]).join(' ');
};
for (const list of Object.values(byBranch)) {
  list.sort((a, b) => a.n - b.n);
  list.forEach(({ id }, i) => {
    const k = kindOf(id);
    if (!k) return;
    if (!soloFigure(id)) fail(`§2 ${id}: a set piece in a lesson with more than one figure`);
    if (VISITOR[id]) fail(`§2 ${id}: a set piece in a lesson a visitor walks into (N21)`);
    if (grave(textOf(id))) fail(`§2 ${id}: a lawn chair or a mug in a grave lesson (N11)`);
    const prev = list.slice(Math.max(0, i - 2), i).map((x) => kindOf(x.id));
    if (k === 'chair' && prev.includes('chair')) fail(`§2 ${id}: a chair within two lessons of the last one`);
    if (k === 'mug' && prev[prev.length - 1]) fail(`§2 ${id}: a mug straight after another set piece`);
  });
}

// ── §3 THE TABLE IS CURRENT ─────────────────────────────────────────────────
if (!process.env.CHAIR_TABLE) {
  const fresh = JSON.parse(execFileSync('node', ['scripts/make-chair.mjs', '--dry', '--json'], { encoding: 'utf8' }));
  if (JSON.stringify(fresh) !== JSON.stringify(CHAIR_PLANS)) {
    fail('§3 data/lessonChair.ts is not what `npm run make:chair` writes today — run it, then make:thoughts, make:wander, make:marks');
  }
}

// ── §4 THE REACH THE ROOM TEST ASSUMES ──────────────────────────────────────
const MC = fs.readFileSync('scripts/make-chair.mjs', 'utf8');
const num = (n) => Number(MC.match(new RegExp(`export const ${n} = ([\\d.]+);`))[1]);
const REACH_BACK = num('REACH_BACK'); const REACH_FRONT = num('REACH_FRONT');
const SEAT_FRONT = num('SEAT_FRONT'); const CHAIR_H = num('CHAIR_H');
let reach = { back: 0, front: 0, seatFront: 0, up: 0, below: -1e9 };
const sweep = (fr, part) => {
  if (fr.chair.on <= 0.01) return;
  for (const r of CH.chairRects(fr.chair.open, 'back').concat(CH.chairRects(fr.chair.open, 'front'))) {
    for (const [x, y] of CH.rectCorners(r)) {
      const gx = fr.chair.x + x; const gy = fr.chair.y + y;
      reach.back = Math.max(reach.back, -gx);
      reach.front = Math.max(reach.front, gx);
      if (SEATED_KINDS.has(part)) reach.seatFront = Math.max(reach.seatFront, gx);
      reach.up = Math.max(reach.up, -gy);
      reach.below = Math.max(reach.below, gy);
    }
  }
};
for (const kind of [RT.CH_SETUP, RT.CH_PUTAWAY, RT.SEAT_CROSS, RT.SEAT_MUG, RT.SEAT_DRUM, RT.SEAT_SIP, RT.SEAT_REST]) {
  for (let t = 0; t <= RT.partLen(kind) + 0.001; t += 1 / 60) {
    for (const [c, m] of [[0, 0], [1, 0], [1, 1]]) sweep(RT.chairFrame(kind, t, c, m, t), kind);
  }
}
// His own crossed foot counts toward the seated reach: it is on the floor he shares.
for (let t = 0; t <= 4.2; t += 1 / 60) {
  const J2 = RIG.solve({ x: 0, groundY: 0, k: 1, dir: 1, ...RT.chairFrame(RT.SEAT_CROSS, t, 0, 0, t).s });
  reach.seatFront = Math.max(reach.seatFront, J2.ankR.x + RIG.STR.limb / 2, J2.ankL.x + RIG.STR.limb / 2);
}
if (reach.back > REACH_BACK) fail(`§4 the chair reaches ${reach.back.toFixed(1)} behind him; make:chair assumes ${REACH_BACK}`);
if (reach.front > REACH_FRONT) fail(`§4 the chair reaches ${reach.front.toFixed(1)} in front; make:chair assumes ${REACH_FRONT}`);
if (reach.seatFront > SEAT_FRONT) fail(`§4 seated, the chair and his feet reach ${reach.seatFront.toFixed(1)}; make:chair assumes ${SEAT_FRONT}`);
if (reach.up > CHAIR_H) fail(`§4 the chair reaches ${reach.up.toFixed(1)} up; make:chair assumes ${CHAIR_H}`);
// The ground line is 0; a leg's own stroke width may sit half a unit over it.
if (reach.below > 1.5) fail(`§4 a part of the chair goes ${reach.below.toFixed(1)} below the ground line`);

// ── §5 CONTINUITY, THE WAY A READER MEETS IT ────────────────────────────────
//
// One reader, three habits: PATIENT (each beat as long as its line), EARLY (a tap
// every G seconds, G from 0.3 to 3.0 in tenths — the "tap every tenth of a second"
// sweep), and BACK (forward to the middle of the stretch, back two, forward again).
// Measured per frame: the largest move of any joint, and of any corner of the chair.
const NARRATION = Object.fromEntries(
  [...parseManifest(fs.readFileSync('lib/narration/manifest.ts', 'utf8')).lessons].map(([id, m]) => [id, Object.fromEntries(m)]),
);
const JOINTS = ['head', 'shB', 'pel', 'elL', 'elR', 'wrL', 'wrR', 'kneeL', 'kneeR', 'ankL', 'ankR'];
const worst = { fig: 0, chair: 0, figAt: '', chairAt: '' };
const patient = { fig: 0, chair: 0 };
let habit = '';
function replay(id, plan, schedule) {
  PLAY.chairReset(plan);
  let prevJ = null; let prevC = null;
  const dt = 1 / 60;
  let now = 0;
  for (const [beat, stay] of schedule) {
    PLAY.CHAIR.beat.value = beat;
    let bt = 0;
    for (let f = 0; f < Math.round(stay / dt); f += 1) {
      now += dt; bt += dt;
      const cu = PLAY.chairStep(now, bt);
      const base = RIG.stand(now);
      const fr = cu > 0 ? PLAY.frameAt(plan, PLAY.CHAIR.p.value, now) : null;
      const s = fr ? RIG.mixStance(base, fr.s, cu) : base;
      const J2 = RIG.solve({ x: 200, groundY: 500, k: 1, dir: 1, ...s });
      if (prevJ) {
        const d = Math.max(...JOINTS.map((n) => Math.hypot(J2[n].x - prevJ[n].x, J2[n].y - prevJ[n].y)));
        if (d > worst.fig) { worst.fig = d; worst.figAt = `${id} beat ${beat} t ${bt.toFixed(2)} ${habit}`; }
        if (habit === 'patient') patient.fig = Math.max(patient.fig, d);
      }
      prevJ = J2;
      const C = fr && fr.chair.on > 0.5
        ? CH.chairRects(fr.chair.open, 'back').map((r) => CH.rectCorners(r).map(([x, y]) => [fr.chair.x + x, fr.chair.y + y]))
        : null;
      if (C && prevC) {
        // EACH PART'S CORNERS AS A SET, not by index. A webbing face seen edge-on
        // flips the sign of its skew, which swaps which corner is which while the
        // shape does not move at all — by index that read as a 13-unit jump at 1×.
        const d = Math.max(...C.map((R, i) => Math.max(...R.map((q) => Math.min(
          ...prevC[i].map((o) => Math.hypot(q[0] - o[0], q[1] - o[1])))))));
        if (d > worst.chair) { worst.chair = d; worst.chairAt = `${id} beat ${beat} t ${bt.toFixed(2)} ${habit}`; }
        if (habit === 'patient') patient.chair = Math.max(patient.chair, d);
      }
      prevC = C;
    }
  }
}
let replays = 0;
for (const [id, plan] of Object.entries(CHAIR_PLANS)) {
  const first = plan[0]; const last = plan[plan.length - 4];
  const lines = NARRATION[id] || {};
  const dur = (i) => (lines[i]?.dur ?? 3.2) + 0.3;
  const beatsFwd = []; for (let b = first - 1; b <= last + 1; b += 1) beatsFwd.push(b);
  habit = 'patient';
  replay(id, plan, beatsFwd.map((b) => [b, b < first || b > last ? 3 : dur(b)]));
  for (let g = 0.3; g <= 3.001; g += 0.1) { habit = `tap every ${g.toFixed(1)}s`; replay(id, plan, beatsFwd.map((b) => [b, g])); replays += 1; }
  const mid = Math.floor((first + last) / 2);
  const back = [];
  for (let b = first - 1; b <= mid; b += 1) back.push([b, 1.6]);
  back.push([mid - 1, 1.2], [mid - 2, 2.5]);
  for (let b = mid - 1; b <= last + 1; b += 1) back.push([b, 2.2]);
  habit = 'tapping back';
  replay(id, plan, back);
  replays += 2;
}
// CEILINGS, measured and then held as high-water marks. Read patiently the worst
// frame is about 2.1 units; the hurry (chairPlay HURRY 1.8) is what sets these, and
// it is deliberately not 4× — the owner asked for nothing fast. The first replay
// measured 6.75 here: the arm crossed the body at shoulder height and two-bone IK
// threw the elbow over the top (chairRoutine ARM_DIP and roundShoulder fixed it).
const FIG_CEILING = 4.0;
const CHAIR_CEILING = 4.0;
if (worst.fig > FIG_CEILING) fail(`§5 the figure moves ${worst.fig.toFixed(2)} in one frame (ceiling ${FIG_CEILING}) — ${worst.figAt}`);
if (worst.chair > CHAIR_CEILING) fail(`§5 the chair moves ${worst.chair.toFixed(2)} in one frame (ceiling ${CHAIR_CEILING}) — ${worst.chairAt}`);

const chairs = Object.values(CHAIR_PLANS).filter((p) => p[1] !== RT.CH_MUG_STAND).length;
console.log(`check:chair — ${chairs} lawn-chair lessons · ${Object.keys(CHAIR_PLANS).length - chairs} with a standing mug`);
console.log(`  reach: ${reach.back.toFixed(1)} back · ${reach.front.toFixed(1)} front · ${reach.seatFront.toFixed(1)} seated · ${reach.up.toFixed(1)} up · lowest ${reach.below.toFixed(1)} (ground 0)`);
console.log(`  ${replays} replays at 60fps: worst frame — figure ${worst.fig.toFixed(2)} (${worst.figAt}) · chair ${worst.chair.toFixed(2)} (${worst.chairAt})`);
console.log(`  read patiently, the worst frame is figure ${patient.fig.toFixed(2)} · chair ${patient.chair.toFixed(2)}`);
if (fails.length) {
  console.log(`\n${fails.length} problem(s):`);
  for (const f of fails.slice(0, 40)) console.log(`  ✗ ${f}`);
  process.exit(1);
}
console.log('  clean');

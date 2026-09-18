// ─────────────────────────────────────────────────────────────────────────────
// THE MOVEMENT LAYER, HELD TO ITS OWN RULES (group AF).
//
//   npm run check:wander
//
// `data/lessonWander.ts` says where the figure walks, sits, crouches and looks on
// every beat of every lesson. Two halves, and they fail differently:
//
//   THE PLAN — re-derived from the boxes it was measured against. A plan that has
//   drifted walks him through a diagram, out of the shot, or over a word, and
//   nothing on screen would say so: he would simply be standing in front of the
//   thing the lesson is about.
//
//   THE MOTION — replayed through the real rig at 60fps, including a tap at every
//   tenth of a second. Group L's whole finding is that the defect lives BETWEEN
//   frames, and the layer's own first draft had three: a step that began with a
//   16-unit foot jump, a step interrupted by a tap that jumped 23, and a look that
//   moved the head 0.7 units against a breath of 2.6 — invisible, which is N12's
//   defect reached by obeying N12.
//
// Both halves are budgets on the numbers this file measured once they were fixed,
// so a new pattern cannot quietly reintroduce any of them. `node
// scripts/countertest-wander.mjs` puts each defect back.
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import { loadTs } from './lib/loadts.mjs';
import { loadRig } from './lib/loadrig.mjs';
import { corpus } from './lib/gestures.mjs';
import { sceneOf, walkOf } from './lib/scenefig.mjs';
import { windowOf } from './lib/tourrule.mjs';
import { LESSONS, beatsOf, parseManifest } from './lib/narration.mjs';
import { markBox } from './lib/marks.mjs';
import {
  W, KIND_NAME, GROUND_Y, SIT_REACH, poseTier, freeFloor, roomFor, movesOf, endState,
} from './lib/wanderrule.mjs';

const DIR = 'components/lesson/cinematic';
const J = JSON.parse(fs.readFileSync(`${DIR}/mustBoxes.ts.json`, 'utf8'));
// `WANDER_FILE` points the check at a copy of the table, so `countertest-wander`
// can damage one plan without touching the repo's own.
const { WANDER_PLANS } = await loadTs(process.env.WANDER_FILE || 'data/lessonWander.ts');
const { TOURS } = await loadTs(`${DIR}/tours.ts`);
const { VISITOR } = await loadTs('data/lessonVisitor.ts');
const { THOUGHTS } = await loadTs('data/lessonThoughts.ts');
const { MARKS } = await loadTs('data/lessonMarks.ts');
const NARRATION = Object.fromEntries(
  [...parseManifest(fs.readFileSync('lib/narration/manifest.ts', 'utf8')).lessons]
    .map(([id, m]) => [id, Object.fromEntries(m)]),
);
const { RIG, WANDER } = await loadRig();

const rows = corpus();
const CODES = new Map(rows.map((r) => [r.id, r.beats.map((b) => b.code)]));
const GRADED = new Map(rows.map((r) => [r.id, r.beats.map((b) => b.graded)]));

const bad = [];
const note = (id, kind, msg) => bad.push({ id, kind, msg });

const bandOf = (id) => {
  const s = sceneOf(id);
  const m = s && s.match(/band=\{\[\s*(-?\d+)\s*,\s*(-?\d+)\s*\]\}/);
  return m ? [+m[1], +m[2]] : [0, 560];
};
const leadBox = (items) => {
  const figs = (items || []).filter((it) => it.k === 'fig' && !it.v);
  if (!figs.length) return null;
  const groups = [];
  for (const it of figs) {
    const [x, , w] = it.b;
    const g = groups.find((q) => x <= q.x1 + 4 && x + w >= q.x0 - 4);
    if (g) { g.x0 = Math.min(g.x0, x); g.x1 = Math.max(g.x1, x + w); g.items.push(it); }
    else groups.push({ x0: x, x1: x + w, items: [it] });
  }
  if (groups.length !== 1) return null;
  const g = groups[0];
  const y0 = Math.min(...g.items.map((it) => it.b[1]));
  const y1 = Math.max(...g.items.map((it) => it.b[1] + it.b[3]));
  return { x: g.x0, y: y0, w: g.x1 - g.x0, h: y1 - y0, items: g.items };
};

// ── 1 · THE PLANS, AGAINST THE BOXES ─────────────────────────────────────────
let planned = 0;
let lessons = 0;
const kinds = new Map();
for (const [id, list] of Object.entries(WANDER_PLANS)) {
  lessons += 1;
  const file = LESSONS[id];
  if (!file) { note(id, 'UNKNOWN', 'a plan for a lesson with no script in the LESSONS table'); continue; }
  const beats = beatsOf(file);
  const items = J.words[id];
  if (!items) { note(id, 'UNMEASURED', 'a plan for a lesson with no must-boxes'); continue; }
  const band = bandOf(id);
  const codes = CODES.get(id) || [];
  const graded = GRADED.get(id) || [];
  const walk = await walkOf(id);
  const cue = VISITOR[id];
  const marks = MARKS[id] || {};
  const lines = NARRATION[id] || {};
  const thoughts = THOUGHTS[id]?.at || [];
  const src = sceneOf(id) ?? '';
  if ((src.match(/<Stickman\b/g) || []).length !== 1) {
    note(id, 'CROWD', 'a plan in a scene that mounts more than one figure: the layer is a singleton and would walk them in lockstep');
  }
  if (list.length !== beats.length) {
    note(id, 'LENGTH', `${list.length} plan slots against ${beats.length} beats — the table is stale, run make:wander`);
  }

  const toured = (k) => !graded[k] && (TOURS[id]?.[k]?.length ?? 0) > 0;
  const mustWin = (k) => (J.boxes[id]?.[k] ? windowOf(J.boxes[id][k], band, GROUND_Y) : null);
  const leaves = (k) => {
    if (toured(k)) {
      const last = TOURS[id][k][TOURS[id][k].length - 1];
      return windowOf(last.length === 10 ? last.slice(6, 10) : last.slice(0, 4), band, GROUND_Y);
    }
    if (k === 0 || graded[k]) return mustWin(k);
    return leaves(k - 1);
  };
  const windowsAt = (k) => {
    if (!/\bcamera=\{/.test(src)) return [];
    if (toured(k)) {
      return TOURS[id][k].flatMap((st) => [windowOf(st.slice(0, 4), band, GROUND_Y),
        ...(st.length === 10 ? [windowOf(st.slice(6, 10), band, GROUND_Y)] : [])]);
    }
    const w = k === 0 || graded[k] ? mustWin(k) : leaves(k - 1);
    return w ? [w] : [];
  };

  let lastKind = null;
  for (let i = 0; i < list.length; i += 1) {
    const plan = list[i];
    if (!plan) { lastKind = null; continue; }
    planned += 1;
    const b = beats[i] || {};
    const moves = movesOf(plan);
    const has = (k) => moves.some((m) => m.kind === k);

    // a · THE BEAT MAY HAVE ONE AT ALL
    if (b.interact || b.mc || b.tap || b.summary) note(id, 'GRADED', `beat ${i} is a question or the summary and carries a plan`);
    if (poseTier(codes[i] ?? 0) === 'bound') note(id, 'BOUND', `beat ${i} holds pose ${codes[i]}, which has his hands on something or is itself a movement`);
    if (walk && i > 0 && Math.abs((walk[i] ?? 0) - (walk[i - 1] ?? 0)) > 1) note(id, 'WALKS', `beat ${i} is a beat the scene already walks him through`);
    if (cue && i === cue.enter) note(id, 'VISITOR', `beat ${i} is the beat the second figure walks in on`);
    // b · A BUBBLE IS PLACED AGAINST HIS RESTING HEAD
    if (thoughts[i] && (has(W.STEP) || has(W.SIT) || has(W.CROUCH))) {
      note(id, 'BUBBLE', `beat ${i} draws a thought bubble and the plan moves his feet or his height`);
    }
    // c · THE ROOM, RE-DERIVED
    const lead = leadBox(items[i]);
    if (!lead) { note(id, 'CROWD', `beat ${i} records more than one figure`); continue; }
    const extra = [];
    const mk = marks[i];
    if (mk) extra.push({ b: markBox(mk.style ?? mk[0], mk.box ?? mk[1] ?? [0, 0, 0, 0]) });
    const floors = [freeFloor(items[i], lead, extra)];
    const nxt = items[i + 1];
    if (nxt) floors.push(freeFloor(nxt, leadBox(nxt) ?? lead, []));
    const room = roomFor(lead, floors, windowsAt(i)) ?? [0, 0];
    if (Math.abs(room[0] - plan[0]) > 0.25 || Math.abs(room[1] - plan[1]) > 0.25) {
      note(id, 'ROOM', `beat ${i} states room [${plan[0]}, ${plan[1]}] and the boxes give [${room[0]}, ${room[1]}] — run make:wander`);
    }
    if (plan[0] > 0 || plan[1] < 0) note(id, 'ROOM', `beat ${i} has a room that excludes where the scene stands him`);
    for (const m of moves) {
      if (m.kind === W.STEP && (m.to < room[0] - 0.25 || m.to > room[1] + 0.25)) {
        note(id, 'OUTSIDE', `beat ${i} steps to ${m.to}, outside its own room [${room[0]}, ${room[1]}]`);
      }
      // AGAINST THE PLAN'S OWN ROOM, not the re-derived one, because `wanderState`
      // clamps to the numbers in the plan: a plan claiming a narrow room and sitting
      // in it anyway puts his legs through whatever is beside him, and the rule that
      // ties the stated room to the boxes is a separate one above.
      if (m.kind === W.SIT && m.to > 0 && Math.max(-plan[0], plan[1]) < SIT_REACH - 0.5) {
        note(id, 'SIT', `beat ${i} sits with ${Math.max(-plan[0], plan[1]).toFixed(0)} units of floor, and the seated legs need ${SIT_REACH}`);
      }
      if (!KIND_NAME[m.kind]) note(id, 'KIND', `beat ${i} has a move of unknown kind ${m.kind}`);
      if (m.dur <= 0.05) note(id, 'DUR', `beat ${i} has a move ${m.dur}s long`);
    }
    // d · IT FITS INSIDE THE LINE
    const dur = (lines[i]?.dur ?? 3.2) + 0.3;
    const ends = moves.reduce((mx, m) => Math.max(mx, m.at + m.dur), 0);
    if (ends > dur - 0.1) note(id, 'LATE', `beat ${i} is still moving at ${ends.toFixed(2)}s of a ${dur.toFixed(2)}s line`);
    if (moves.some((m) => m.at < 0.5)) note(id, 'EARLY', `beat ${i} starts a move before 0.5s, over the top of the line's first words`);
    // e · HE IS HOME WHEN THE NEXT BEAT NEEDS HIM TO BE
    const end = endState(plan);
    const nb = beats[i + 1];
    const nextMoves = nb && walk && Math.abs((walk[i + 1] ?? 0) - (walk[i] ?? 0)) > 1;
    if (nb && (nb.interact || nb.mc || nb.tap || nextMoves) && Math.abs(end.dx) > 0.25) {
      note(id, 'AWAY', `beat ${i} leaves him ${end.dx} from where the scene puts him, and the next beat ${nextMoves ? 'walks him' : 'is a question'}`);
    }
    if (nb && Math.abs(end.sit) > 0.01) note(id, 'SEATED', `beat ${i} leaves him seated`);
    if (nb && Math.abs(end.crouch) > 0.01) note(id, 'CROUCHED', `beat ${i} leaves him crouched`);
    if (Math.abs(end.face - 1) > 0.01) note(id, 'TURNED', `beat ${i} leaves him facing the other way`);
    // f · AND IT IS NOT WHAT THE LAST BEAT DID
    const kind = moves.map((m) => KIND_NAME[m.kind]).join('+');
    kinds.set(kind, (kinds.get(kind) || 0) + 1);
    if (lastKind && kind === lastKind) note(id, 'ECHO', `beat ${i} repeats the previous planned beat's pattern (${kind})`);
    lastKind = kind;
  }
}

// ── 2 · THE MOTION, REPLAYED THROUGH THE RIG ─────────────────────────────────
//
// Sampled at 60fps, and at every tenth of a second a tap is simulated: the state
// the frame drew becomes the state the next plan is read from, which is exactly
// what `lookPose` does with `WANDER_MEM`. The three numbers are the ones that were
// wrong in the first draft.
const pts = (B) => [B.head[0].translateX, B.head[1].translateY, B.wrL[0].translateX, B.wrL[1].translateY,
  B.wrR[0].translateX, B.wrR[1].translateY, B.ankL[0].translateX, B.ankL[1].translateY,
  B.ankR[0].translateX, B.ankR[1].translateY, B.pel[0].translateX, B.pel[1].translateY];
const gap = (a, b) => Math.max(...a.map((v, i) => Math.abs(v - b[i])));
// `t` is the plan's own clock and `clock` is the SCENE's, and keeping them apart is
// load-bearing: at a tap the beat clock rewinds to zero and the scene clock does
// not. Passing one value for both reported a 3.3-unit jump at every tap that
// happened to land late in a line — the figure's own breath measured a second and a
// half apart, and nothing to do with the layer. An instrument that models the two
// clocks as one cannot check a system whose whole subject is that they differ.
const frame = (plan, t, start, clock) => {
  const st = WANDER.wanderState(plan, t, start ?? WANDER.wanderRest());
  const now = 3 + (clock === undefined ? t : clock);
  const base = RIG.emoteHold(0, now);
  const s = WANDER.wanderStance(base, st, now, 1);
  return { st, B: RIG.pose(s, 200 + st.dx, GROUND_Y, 1, WANDER.wanderDir(1, st), 1) };
};

// The bare breath, which is what "does it read" is measured against — `check:idle`'s
// own calibration, because `stand()` is never still.
let breath = 0;
{
  const a = pts(frame([], 0).B);
  for (let t = 0; t <= 8; t += 1 / 60) breath = Math.max(breath, gap(pts(frame([], t).B), a));
}

// THE THREE NUMBERS, MEASURED ONCE THEY WERE RIGHT.
//
//   jump   4.05 across 880 plans, all of it in the last frames of a step where
//          `settleStep` hands the walk back to the standing pose. Scene walks do
//          the same thing (`check:smooth` allows 8 mid-beat), so this is staging
//          rather than a defect.
//   tap    exact. The layer carries what the last frame drew into the new plan, so
//          a tap cannot move anything: the budget is a rounding allowance.
//   slide  3.06, and it is the shipped settle's own residue — the arrival foot is
//          world-pinned by an expression whose two halves (the shrinking remainder
//          and the rising blend) are not synchronous. Every walk in the app has it;
//          tightening it is a rig change, not a table change.
const BUDGET = { jump: 6.0, tap: 0.05, slide: 3.2, reads: breath * 1.4 };
const worst = { jump: 0, tap: 0, slide: 0, quiet: Infinity };
const where = { jump: '', tap: '', slide: '', quiet: '' };
let replayed = 0;
for (const [id, list] of Object.entries(WANDER_PLANS)) {
  for (const [i, plan] of list.entries()) {
    if (!plan) continue;
    replayed += 1;
    const total = movesOf(plan).reduce((mx, m) => Math.max(mx, m.at + m.dur), 1) + 0.6;
    const a0 = pts(frame(plan, 0).B);
    let prev = a0;
    let travel = 0;
    for (let t = 1 / 60; t <= total; t += 1 / 60) {
      const f = frame(plan, t);
      const p = pts(f.B);
      travel = Math.max(travel, gap(p, a0));
      const j = gap(p, prev);
      if (j > worst.jump) { worst.jump = j; where.jump = `${id} beat ${i} at ${t.toFixed(2)}s`; }
      for (const [ax, ay] of [[6, 7], [8, 9]]) {
        if (Math.abs(p[ay] - GROUND_Y) < 1.5 && Math.abs(prev[ay] - GROUND_Y) < 1.5) {
          const sl = Math.abs(p[ax] - prev[ax]);
          if (sl > worst.slide) { worst.slide = sl; where.slide = `${id} beat ${i} at ${t.toFixed(2)}s`; }
        }
      }
      prev = p;
    }
    if (travel < worst.quiet) { worst.quiet = travel; where.quiet = `${id} beat ${i}`; }
    if (travel < BUDGET.reads) {
      note(id, 'QUIET', `beat ${i} travels ${travel.toFixed(2)} units, and standing still travels ${breath.toFixed(2)}`);
    }
    // THE TAP, at every tenth of a second: the frame after must be the frame before.
    for (let cut = 0.1; cut <= total; cut += 0.1) {
      const a = frame(plan, cut);
      const b = frame(plan, 0, a.st, cut);
      const d = gap(pts(a.B), pts(b.B));
      if (d > worst.tap) { worst.tap = d; where.tap = `${id} beat ${i}, tapped ${cut.toFixed(1)}s in`; }
    }
  }
}

console.log('THE MOVEMENT LAYER (group AF)\n');
console.log(`  ${planned} plan(s) across ${lessons} lessons · ${kinds.size} distinct patterns`);
console.log(`  ${[...kinds.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k, n]) => `${k} ${n}`).join(' · ')}`);
console.log(`  standing still travels ${breath.toFixed(2)} units; a plan must beat ${BUDGET.reads.toFixed(2)}\n`);

const rule = (ok, msg) => console.log(`  ${ok ? 'ok ' : '✗  '} ${msg}`);
let fail = 0;
const budget = (name, val, cap, msg) => {
  if (val > cap) { fail += 1; console.log(`  ✗   ${msg}: ${val.toFixed(2)} against ${cap.toFixed(2)}  ${where[name]}`); }
  else console.log(`  ok  ${msg}: ${val.toFixed(2)} of ${cap.toFixed(2)}`);
};
budget('jump', worst.jump, BUDGET.jump, 'the worst one-frame move inside a plan');
budget('tap', worst.tap, BUDGET.tap, 'the worst one-frame move at a tap');
budget('slide', worst.slide, BUDGET.slide, 'the worst slide by a planted foot');
console.log(`  ok  the quietest plan travels ${worst.quiet === Infinity ? 0 : worst.quiet.toFixed(2)} units  ${where.quiet}`);

// A FLOOR ON THE VOCABULARY, for the reason group N had to learn twice: a corpus can
// be perfectly varied across three patterns, and the complaint this answers was that
// the figure repeats himself.
const PATTERN_FLOOR = 8;
if (kinds.size < PATTERN_FLOOR) {
  fail += 1;
  console.log(`  ✗   only ${kinds.size} distinct patterns in the corpus  floor ${PATTERN_FLOOR}`);
} else console.log(`  ok  ${kinds.size} distinct patterns in the corpus  floor ${PATTERN_FLOOR}`);

// AND A FLOOR ON HOW MUCH OF THE CORPUS MOVES, so the table cannot quietly empty.
const PLAN_FLOOR = 800;
if (planned < PLAN_FLOOR) {
  fail += 1;
  console.log(`  ✗   only ${planned} beats carry a plan  floor ${PLAN_FLOOR}`);
} else console.log(`  ok  ${planned} beats carry a plan  floor ${PLAN_FLOOR}`);

if (bad.length) {
  console.log(`\n  ✗   ${bad.length} plan(s) break a rule:`);
  const by = new Map();
  for (const b of bad) by.set(b.kind, [...(by.get(b.kind) || []), b]);
  for (const [kind, list] of by) {
    console.log(`\n      ${kind}  ${list.length}`);
    for (const b of list.slice(0, 6)) console.log(`        ${b.id}: ${b.msg}`);
    if (list.length > 6) console.log(`        …and ${list.length - 6} more`);
  }
  fail += 1;
} else {
  console.log(`\n  ok  every plan sits inside its own room, its line and its beat`);
}

console.log(fail ? '\nfailed.' : '\nall clear.');
process.exit(fail ? 1 : 0);

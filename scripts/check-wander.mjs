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
  W, KIND_NAME, GROUND_Y, SIT_REACH, poseTier, freeFloor, roomFor, movesOf, endState, facingOf,
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
const { RIG, MOVES, WANDER } = await loadRig();
const { GAZE } = await loadTs(`${DIR}/gazeTargets.ts`);

const rows = corpus();
// WHICH WAY EACH SCENE STANDS HIM, per beat, built once. Both halves need it: §3f
// reads it off the table and §2 replays with it. Replaying every lesson as if it
// faced right reported 1,389 perfectly good walks as backwards — 108 of the 244
// scenes walk him left at some point (`check:turn`).
const FACE = new Map();
for (const id of Object.keys(WANDER_PLANS)) FACE.set(id, facingOf(await walkOf(id)));
const faceAt = (id, i) => (FACE.get(id) ? (FACE.get(id)[i] ?? 1) : 1);
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
    // f · AND EVERY STEP TRAVELS THE WAY HE IS FACING (C18, one system out)
    //
    // `strideStance` drives the feet off the DISTANCE covered, in the figure's own
    // frame, and `pose` mirrors that frame off `dir` — so a leg whose travel
    // disagrees with the facing is a figure striding forwards while sliding
    // backwards. C18 is the same defect in the SCENES, where 55 of them handed
    // `pose` a literal 1 and moonwalked every beat whose x went down; `check:turn`
    // has held that since. Nothing held it here, and the generator only ever
    // reasoned about the leg OUT: 182 of 464 steps in the shipped table travelled
    // against the facing, in 120 lessons, every one of them a leg BACK.
    {
      const base = faceAt(id, i);
      let dx = 0;
      let mult = 1;
      for (const m of moves) {
        if (m.kind === W.TURN) { mult = m.to; continue; }
        if (m.kind !== W.STEP) continue;
        const span = m.to - dx;
        dx = m.to;
        if (Math.abs(span) < 0.5) continue;
        if (Math.sign(span) !== Math.sign(base * mult)) {
          note(id, 'MOONWALK', `beat ${i} steps ${span.toFixed(0)} units while facing ${base * mult > 0 ? 'right' : 'left'}`);
        }
      }
    }
    // g · AND IT IS NOT WHAT THE LAST BEAT DID
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
const mid = (st) => st.legU > 0 && st.legU < 1;
const inRoom = (plan, dx) => plan.length < 2 || (dx >= plan[0] - 0.01 && dx <= plan[1] + 0.01);
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
//
// AND IT IS `lookPose`'s WHOLE COMPOSITION, not `wanderStance` alone. The app never
// calls `wanderStance` by itself: `lookPose` runs the layer, then hands the neck
// over to the generated gaze by `gazeKeep`, then carries the lean off it. Replaying
// only the first of those three made everything the other two do invisible — and
// what they were doing was switching the gaze off between two frames on the frame a
// step began, worth 17 units of head across 206 plans in 129 lessons, while this
// file printed 4.16. A checker that models less than the screen cannot see the
// screen's defects, however exactly it measures what it does model.
const frame = (plan, t, start, clock, gaze, dir = 1) => {
  const st = WANDER.wanderState(plan, t, start ?? WANDER.wanderRest(), dir);
  const now = 3 + (clock === undefined ? t : clock);
  const base = RIG.emoteHold(0, now);
  const ws = WANDER.wanderStance(base, st, now, 1);
  const wx = 200 + st.dx;
  const wdir = WANDER.wanderDir(dir, st);
  const gw = gaze ? WANDER.gazeKeep(st) : 0;
  if (gw <= 0) return { st, B: RIG.pose(ws, wx, GROUND_Y, 1, wdir, 1) };
  const g = MOVES.gazeAt(ws, wx, GROUND_Y, 1, wdir, gaze[0], gaze[1], gw);
  const lean = (g.neck - ws.neck) * 0.5;
  return { st, B: RIG.pose({ ...g, tilt: g.tilt + lean }, wx, GROUND_Y, 1, wdir, 1) };
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
const BUDGET = { jump: 6.0, tap: 0.05, over: 6.0, warp: 0.05, slide: 3.2, home: 3.0, reads: breath * 1.4 };
const worst = { jump: 0, tap: 0, over: 0, warp: 0, slide: 0, home: 0, quiet: Infinity };
const where = { jump: '', tap: '', over: '', warp: '', slide: '', home: '', quiet: '' };
let replayed = 0;
for (const [id, list] of Object.entries(WANDER_PLANS)) {
  for (const [i, plan] of list.entries()) {
    if (!plan) continue;
    replayed += 1;
    // The beat's own gaze target, because `lookPose` is given one on 224 lessons and
    // the handover to it is half of what this replay is for.
    const gz = GAZE[id]?.[i] ?? null;
    const dirOf = faceAt(id, i);
    const total = movesOf(plan).reduce((mx, m) => Math.max(mx, m.at + m.dur), 1) + 0.6;
    // "DOES THE PLAN READ" IS MEASURED WITHOUT THE GAZE, and the continuity numbers
    // below are measured with it. They are different questions: the first asks what
    // the PLAN adds, and is calibrated against a bare breath that has no gaze
    // either; the second asks whether the COMPOSITION cuts. Measuring travel through
    // the gaze reported four plans as too quiet purely because a held gaze damps the
    // head it is pulling — a fact about the instrument, not about the plan.
    const a0 = pts(frame(plan, 0, undefined, undefined, null, dirOf).B);
    let prev = pts(frame(plan, 0, undefined, undefined, gz, dirOf).B);
    let travel = 0;
    for (let t = 1 / 60; t <= total; t += 1 / 60) {
      const f = frame(plan, t, undefined, undefined, gz, dirOf);
      const p = pts(f.B);
      travel = Math.max(travel, gap(pts(frame(plan, t, undefined, undefined, null, dirOf).B), a0));
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
    //
    // AND THE TAP GOES TO THE NEXT BEAT'S PLAN, which for the life of this file it
    // did not — it restarted the SAME plan, and the same plan has the same room and
    // the same turns, so the one handover this test exists to measure was the one it
    // never made. Measured properly it was never exact: the carried offset was
    // CLAMPED into the next beat's room, which teleported him up to 44 units
    // sideways in a single frame on 730 of the taps in the corpus, while this line
    // printed 0.00.
    const next = list[i + 1] ?? [];
    for (let cut = 0.1; cut <= total; cut += 0.1) {
      const a = frame(plan, cut, undefined, undefined, gz, dirOf);
      const b = frame(plan, 0, a.st, cut, gz, dirOf);
      const d = gap(pts(a.B), pts(b.B));
      if (d > worst.tap) { worst.tap = d; where.tap = `${id} beat ${i}, tapped ${cut.toFixed(1)}s in`; }
      // The same tap, carried into the beat the reader actually lands on — and the
      // gaze is held at the beat he is LEAVING, because that is where his eyes are
      // at the instant of the tap: the player eases the target over 560ms
      // (`CinematicPlayer`, gazeX/gazeY), so swapping it here would measure the
      // instrument's own cut rather than the layer's.
      // …at the facing the beat he is LEAVING has, for the same reason as the gaze:
      // a scene that turns him between beats eases that turn itself, so flipping it
      // here would measure the instrument rather than the layer (70 units of it).
      const c = frame(next, 0, a.st, cut, gz, dirOf);
      const dn = gap(pts(a.B), pts(c.B));
      if (dn > worst.over) { worst.over = dn; where.over = `${id} beat ${i}→${i + 1}, tapped ${cut.toFixed(1)}s in`; }
      const dxJump = Math.abs(c.st.dx - a.st.dx);
      if (dxJump > worst.warp) { worst.warp = dxJump; where.warp = `${id} beat ${i}→${i + 1}, tapped ${cut.toFixed(1)}s in`; }
      // AND HE ALWAYS COMES BACK ROUND. A tap can land between a stroll's turn out
      // and its turn back, so the beat he arrives on inherits a mirrored figure —
      // legitimately, and eased, but it must not be permanent. `homeFace` brings
      // him home wherever the new plan says nothing about the facing, and a plan
      // that does say something ends facing forward (the TURNED rule above). What
      // is left is how LONG a carried turn can last, which is bounded by the walk
      // back in delaying the plan's own restoring turn: no cut, but a figure facing
      // away from the lesson, so it is a number rather than a silence.
      //
      // ONLY WHERE THE TAP CHANGED ANYTHING. With `face` already home and no walk
      // back in owed, the beat runs exactly as it would untapped, which the TURNED
      // rule above already covers — and sweeping all of them anyway cost this file
      // 32 million extra evaluations and several minutes.
      if (Math.abs(a.st.face - 1) < 0.02 && !mid(a.st) && inRoom(next, a.st.dx)
) continue;
      // AND THE LEG THE LAYER GENERATES FOR ITSELF OBEYS §3f TOO. The MOONWALK rule
      // above reads the TABLE, so it cannot see a walk the layer invents to bring
      // him back into a beat's room — and that leg is walked at exactly the moment
      // a reader has just tapped, which is when they are looking.
      // At the facing the beat he LEAVES has — a scene that turns him between beats
      // eases that itself, so judging the walk back in by the next beat's facing
      // reported 271 correct walks as backwards.
      const dirNext = dirOf;
      let home = -1;
      let prevDx = a.st.dx;
      for (let u = 0; u <= 14; u += 1 / 20) {
        const st = WANDER.wanderState(next, u, a.st, dirNext);
        // THE FIRST TIME HE IS UPRIGHT AGAIN, not the last. Asking when he is home
        // FOR GOOD measures when the new plan finishes its own turns, which is near
        // the end of any stroll and has nothing to do with a carried one.
        if (home < 0 && Math.abs(st.face - 1) < 0.02) home = u;
        const moved = st.dx - prevDx;
        prevDx = st.dx;
        // A figure drawn in profile has no facing to disagree with — `pose` mirrors
        // off the sign of `dir`, so a `dir` passing through 0 IS the turn.
        const drawn = WANDER.wanderDir(dirNext, st);
        if (Math.abs(moved) > 0.2 && Math.abs(drawn) > 0.2 && Math.sign(moved) !== Math.sign(drawn)) {
          note(id, 'BACKWARDS', `a tap ${cut.toFixed(1)}s into beat ${i} walks him back in facing the other way`);
          break;
        }
      }
      if (home < 0) note(id, 'MIRRORED', `a tap ${cut.toFixed(1)}s into beat ${i} never turns him back`);
      else if (Math.abs(a.st.face - 1) > 0.02 && home > worst.home) {
        worst.home = home; where.home = `${id} beat ${i}→${i + 1}, tapped ${cut.toFixed(1)}s in`;
      }
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
budget('over', worst.over, BUDGET.over, 'the worst one-frame move at a tap into the NEXT beat');
budget('warp', worst.warp, BUDGET.warp, 'the furthest he is moved sideways by a beat change');
budget('slide', worst.slide, BUDGET.slide, 'the worst slide by a planted foot');
budget('home', worst.home, BUDGET.home, 'the longest a carried turn lasts before he is upright again, in seconds');
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

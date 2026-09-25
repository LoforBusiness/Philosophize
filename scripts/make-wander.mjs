// WHERE THE FIGURE MOVES HIMSELF — writes data/lessonWander.ts.
//
//   npm run make:wander            · --dry prints and writes nothing
//
// A reader, after the living holds had shipped: *"the stickman does not move a
// lot. I do not mean with its hands moving … instead, during the words that are
// being spoken, if there's nothing happening on screen, the stickman will look up
// and down a lot, move back and forth, maybe sit on the ground for a little bit …
// right now the stickman is too stationary."*
//
// ── WHY A TABLE AND NOT A SCENE EDIT ────────────────────────────────────────
//
// The same argument as the visitor, the thought bubble and the pen mark: 244
// scenes is 244 edits to files whose every byte is inside `muststamp`, and the
// movement is derived from what the scene DRAWS rather than from anything an
// author would type. The player reads this table; `wander.ts` is the maths.
//
// ── WHAT DECIDES A BEAT ─────────────────────────────────────────────────────
//
// 1. Is he free? A pose that works at a prop, is on the floor, or is itself a
//    whole-body movement gets nothing (`wanderrule.freePose`, which reads the same
//    classification `liveliness.mjs` makes for its own tables).
// 2. Is there room? `mustBoxes` records every item every beat draws, so the clear
//    floor is computable — his own beat's and the next one's, because a tap can
//    arrive at any moment.
// 3. Is he in the shot? The frames come out of `tours.ts`. THE CAMERA IS NEVER
//    TOUCHED: a step that would leave the picture is not offered.
// 4. When? The narration manifest gives every word's start, so a move begins in a
//    pause between clauses rather than on top of one.
// 5. And is it the same as last time? The pattern rotates per lesson, so a reader
//    does not meet the same walk-and-return eight beats running.
import fs from 'node:fs';
import { loadTs } from './lib/loadts.mjs';
import { corpus } from './lib/gestures.mjs';
import { walkOf } from './lib/scenefig.mjs';
import { soloFigure, leadBox, windowsFor } from './lib/figroom.mjs';
import { LESSONS, beatsOf, parseManifest } from './lib/narration.mjs';
import { markBox } from './lib/marks.mjs';
import {
  W, GROUND_Y, SIT_REACH, PLAY_SECONDS, poseTier, freeFloor, roomFor, stepSeconds, pausesOf,
  hash01, facingOf,
} from './lib/wanderrule.mjs';

const DRY = process.argv.includes('--dry');
const round = (v) => Math.round(v * 100) / 100;
const DIR = 'components/lesson/cinematic';
const OUT = 'data/lessonWander.ts';

const J = JSON.parse(fs.readFileSync(`${DIR}/mustBoxes.ts.json`, 'utf8'));
const { TOURS } = await loadTs(`${DIR}/tours.ts`);
const { VISITOR } = await loadTs('data/lessonVisitor.ts');
const { THOUGHTS } = await loadTs('data/lessonThoughts.ts');
const { MARKS } = await loadTs('data/lessonMarks.ts');
// THE CHAIR ROUTINE OWNS ITS BEATS, and the beat after its last one, while its
// putaway may still be hurrying to finish (chairPlay.ts): a plan there would walk
// him off with the chair still in his hands. `make:chair` runs first.
const { CHAIR_PLANS } = await loadTs('data/lessonChair.ts');
// THE MANIFEST IS PARSED, NOT IMPORTED. Every line in it is a `require()` of an
// mp3, so evaluating the module in Node is an ambiguous-module-syntax error — and
// `parseManifest` is the reader `check:narration` already holds it to.
const NARRATION = Object.fromEntries(
  [...parseManifest(fs.readFileSync('lib/narration/manifest.ts', 'utf8')).lessons]
    .map(([id, m]) => [id, Object.fromEntries(m)]),
);

const rows = corpus();
const CODES = new Map(rows.map((r) => [r.id, r.beats.map((b) => b.code)]));
const GRADED = new Map(rows.map((r) => [r.id, r.beats.map((b) => b.graded)]));

const plans = {};
const tally = { skipChair: 0, skipCode: 0, skipRoom: 0, skipWalk: 0, skipGraded: 0, solo: 0, lessons: 0 };
const used = {};
const spans = [];
let planned = 0;
let freeBeats = 0;

for (const [id, file] of Object.entries(LESSONS)) {
  const stem = file.replace(/Script\.ts$/, '');
  if (!fs.existsSync(`${DIR}/${stem}Scene.tsx`)) continue;
  if (!soloFigure(id)) { tally.solo += 1; continue; }
  const beats = beatsOf(file);
  const items = J.words[id];
  if (!items) continue;
  const codes = CODES.get(id) || [];
  const graded = GRADED.get(id) || [];
  const walk = await walkOf(id);
  const face = facingOf(walk);
  const cue = VISITOR[id];
  const marks = MARKS[id] || {};
  const lines = NARRATION[id] || {};
  const thoughts = THOUGHTS[id]?.at || [];

  const windowsAt = windowsFor(id, graded, TOURS, J);
  const chair = CHAIR_PLANS[id];
  const chairBeat = (k) => !!chair && k >= chair[0] && k <= chair[chair.length - 4] + 1;

  const out = new Array(beats.length).fill(null);
  let lastKind = '';
  let sits = 0;
  let crouches = 0;
  tally.lessons += 1;

  for (let i = 0; i < beats.length; i += 1) {
    const b = beats[i];
    if (b.interact || b.mc || b.tap || b.summary) { tally.skipGraded += 1; continue; }
    if (chairBeat(i)) { tally.skipChair += 1; continue; }
    const tier = poseTier(codes[i] ?? 0);
    if (tier === 'bound') { tally.skipCode += 1; continue; }
    // A beat the scene walks him through is already a walk, and the beat a second
    // figure walks in on is his moment rather than the lead's.
    if (walk && i > 0 && Math.abs((walk[i] ?? 0) - (walk[i - 1] ?? 0)) > 1) { tally.skipWalk += 1; continue; }
    if (cue && i === cue.enter) { tally.skipWalk += 1; continue; }
    const lead = leadBox(items[i]);
    if (!lead) { tally.skipRoom += 1; continue; }
    freeBeats += 1;

    // The pen mark is drawn round a label on this beat; his own box may not cross it.
    const extra = [];
    const mk = marks[i];
    if (mk) extra.push({ b: markBox(mk.style ?? mk[0], mk.box ?? mk[1] ?? [0, 0, 0, 0]) });

    const floors = [freeFloor(items[i], lead, extra)];
    const nxt = items[i + 1];
    if (nxt) {
      const leadNext = leadBox(nxt);
      floors.push(freeFloor(nxt, leadNext ?? lead, []));
    }
    // NO ROOM IS NOT NO MOVEMENT. `roomFor` returns null when his own box is not
    // inside any clear span — he is standing against the thing the beat is about,
    // which is most of these stages — and a look up or a weight shift moves him
    // nowhere along the ground. So those beats keep the in-place half rather than
    // being dropped: 343 of them, which is the difference between a figure who is
    // stationary in the crowded lessons and one who is not.
    const measured = roomFor(lead, floors, windowsAt(i));
    if (!measured) tally.skipRoom += 1;
    const room = measured ?? [0, 0];

    const dur = (lines[i]?.dur ?? 3.2) + 0.3;
    const pauses = pausesOf(lines[i], dur);
    const seed = hash01(`${id}:${i}:af`);
    // A bubble is placed against his RESTING head, so a beat that draws one may
    // only be given the moves that leave his feet and his height alone.
    // AND ONCE A VISITOR HAS WALKED IN HE IS IN A CONVERSATION (N21): no stroll, no
    // sit, no turn to look behind him — each one takes him away from, or turns his
    // back on, the person he is talking to, and the player may be holding him turned
    // to face that person (`VisitorCue.turn`). A look and a weight shift keep him alive.
    const still = !!thoughts[i] || tier === 'late' || !measured || (!!cue && i > cue.enter);
    const f = face ? face[i] : 1;
    const moves = choose({
      seed, dur, pauses, room, still, facing: f, lastKind,
      // A PLAYED ACTION OWNS THE FIRST SECOND AND A HALF, so the layer waits for it
      // rather than talking over it (moves.PLAY_SECONDS).
      after: tier === 'late' ? PLAY_SECONDS + 0.4 : 0,
      sitOk: sits < 2 && Math.max(-room[0], room[1]) >= SIT_REACH,
      crouchOk: crouches < 2,
    });
    if (!moves || !moves.list.length) continue;
    if (moves.kind === 'sit') sits += 1;
    if (moves.kind === 'crouch') crouches += 1;
    lastKind = moves.kind;
    used[moves.kind] = (used[moves.kind] || 0) + 1;
    planned += 1;
    const flat = [room[0], room[1]];
    for (const m of moves.list) flat.push(m.kind, round(m.at), round(m.dur), round(m.to));
    for (const m of moves.list) if (m.kind === W.STEP) spans.push(Math.abs(m.to));
    out[i] = flat;
  }
  if (out.some(Boolean)) plans[id] = out;
}

/**
 * THE CHOREOGRAPHY FOR ONE BEAT.
 *
 * Every pattern states what it needs — room, seconds, a free head — and the ones
 * that fit are drawn from in a fixed order shifted by the beat's own seed, with the
 * previous beat's pattern dropped. That is what stops a lesson reading as one loop:
 * the same rule group N had to learn twice, that variety is about the SUPPORT of
 * the distribution and not its shape.
 */
function choose({ seed, dur, pauses, room, still, facing, lastKind, after, sitOk, crouchOk }) {
  const at = (k) => (pauses.find((p) => p.at >= after)?.at ?? pauses[Math.min(k, pauses.length - 1)]?.at ?? 0.6);
  const first = Math.max(0.55, after, at(0));
  const ends = (list) => list.reduce((m, x) => Math.max(m, x.at + x.dur), 0);
  const fits = (list) => list.length && ends(list) <= dur - 0.12;

  const out = [];

  // ── A WALK AND BACK, which is the move the reader asked for by name ───────
  //
  // THE FACING FOLLOWS EVERY LEG, AND FOR A LONG TIME IT FOLLOWED ONLY THE FIRST.
  // This read `const turn = Math.sign(span) !== facing` once, at the top, and hung
  // both TURN moves on it — which is correct for the leg OUT and says nothing at
  // all about the leg BACK, whose direction is the opposite. So every round trip
  // whose outbound leg was already in his facing direction walked out correctly
  // and then moonwalked home: `strideStance` drives the feet off the DISTANCE
  // covered, in the figure's own frame, so a body sliding against its own facing
  // is a figure striding forwards while travelling backwards. Counted against the
  // shipped table, 182 of 464 steps did it, in 120 lessons — and a reader found it
  // in `aesthetics-aesthetics-13`, whose beat 0 walks him 46 units right and then
  // moonwalks all 46 back.
  //
  // `turnTo` is the fix and it is the whole of it: before every leg, face the way
  // that leg travels; after the last one, go back to the way the scene staged him,
  // so the beat hands on the facing it was given. `check:wander` §3 now re-derives
  // this from the table, so a pattern added later cannot reintroduce it.
  if (!still) {
    const away = room[1] >= 22 && (room[1] >= -room[0] || seed > 0.5) ? 1 : (-room[0] >= 22 ? -1 : 0);
    if (away !== 0) {
      const far = away > 0 ? room[1] : room[0];
      const span = Math.sign(far) * Math.min(Math.abs(far), 24 + Math.round(seed * 22));
      const st = stepSeconds(span);
      // `to` is a MULTIPLIER on the scene's own facing, so the multiplier that
      // makes him face stage-direction `d` is `d * facing` (both are ±1).
      const walkTurns = (list, t, d, mult) => {
        const want = d * facing;
        if (want === mult) return [t, mult];
        list.push({ kind: W.TURN, at: t, dur: 0.3, to: want });
        return [t + 0.36, want];
      };
      const out1 = Math.sign(span);

      const list = [];
      let t = first;
      let m = 1;
      [t, m] = walkTurns(list, t, out1, m);
      list.push({ kind: W.STEP, at: t, dur: st, to: span });
      t += st + 0.25;
      // He looks at what he walked away from — or up at it, which is where most of
      // these stages draw their art.
      list.push({ kind: W.LOOK, at: t, dur: 0.5, to: 1 });
      t += 0.5 + 0.5 + Math.round(seed * 60) / 100;
      list.push({ kind: W.LOOK, at: t, dur: 0.45, to: 0 });
      t += 0.5;
      [t, m] = walkTurns(list, t, -out1, m);
      list.push({ kind: W.STEP, at: t, dur: st, to: 0 });
      t += st + 0.2;
      [t, m] = walkTurns(list, t, facing, m);
      if (fits(list)) out.push({ kind: 'stroll', list });

      // The same walk without the look, for a shorter line.
      const brief = [];
      let u = first;
      let bm = 1;
      [u, bm] = walkTurns(brief, u, out1, bm);
      brief.push({ kind: W.STEP, at: u, dur: st, to: span });
      u += st + 0.4;
      [u, bm] = walkTurns(brief, u, -out1, bm);
      brief.push({ kind: W.STEP, at: u, dur: st, to: 0 });
      u += st + 0.2;
      [u, bm] = walkTurns(brief, u, facing, bm);
      if (fits(brief)) out.push({ kind: 'there-and-back', list: brief });
    }
  }

  // ── SITTING ON THE GROUND FOR A WHILE ─────────────────────────────────────
  //
  // HE TURNS TO THE SIDE HE HAS ROOM ON FIRST. The seated legs reach 42 units in
  // FRONT of him (`postureHold(3)` puts the feet at 31–35), so which way he faces
  // decides whether he fits — and requiring the room on both sides, which the first
  // draft did, allowed the sit in 17 beats of 895. Turning is also what a person
  // does before sitting down.
  if (!still && sitOk) {
    const down = 1.1;
    const up = 0.95;
    const side = room[1] >= SIT_REACH ? 1 : -1;
    const turn = side !== facing;
    let t = first;
    const list = [];
    if (turn) { list.push({ kind: W.TURN, at: t, dur: 0.34, to: -1 }); t += 0.4; }
    list.push({ kind: W.SIT, at: t, dur: down, to: 1 });
    list.push({ kind: W.LOOK, at: t + down + 0.3, dur: 0.5, to: 1 });
    list.push({ kind: W.LOOK, at: dur - up - 0.75, dur: 0.4, to: 0 });
    list.push({ kind: W.SIT, at: dur - up - 0.25, dur: up, to: 0 });
    if (turn) list.push({ kind: W.TURN, at: dur - 0.34, dur: 0.34, to: 1 });
    if (fits(list) && dur >= 4.8 + (turn ? 0.4 : 0)) out.push({ kind: 'sit', list });
  }

  // ── DOWN ON HIS HEELS TO LOOK AT SOMETHING ────────────────────────────────
  if (!still && crouchOk) {
    const list = [
      { kind: W.CROUCH, at: first, dur: 0.6, to: 1 },
      { kind: W.LOOK, at: first + 0.7, dur: 0.4, to: -1 },
      { kind: W.LOOK, at: first + 1.7, dur: 0.4, to: 0 },
      { kind: W.CROUCH, at: first + 2.1, dur: 0.6, to: 0 },
    ];
    if (fits(list)) out.push({ kind: 'crouch', list });
  }

  // ── A LOOK UP AND DOWN, which fits almost any line ────────────────────────
  {
    const up = seed > 0.42;
    const list = [
      { kind: W.LOOK, at: first, dur: 0.55, to: up ? 1 : -1 },
      { kind: W.LOOK, at: first + 1.15, dur: 0.5, to: up ? -0.55 : 0.6 },
      { kind: W.LOOK, at: first + 2.2, dur: 0.5, to: 0 },
    ];
    if (fits(list)) out.push({ kind: 'look', list });
    const one = [
      { kind: W.LOOK, at: first, dur: 0.5, to: up ? 1 : -1 },
      { kind: W.LOOK, at: first + 1.1, dur: 0.5, to: 0 },
    ];
    if (fits(one)) out.push({ kind: 'glance', list: one });
  }

  // ── A LOOK BEHIND HIM, which is a turn rather than a step ─────────────────
  if (!still) {
    const list = [
      { kind: W.TURN, at: first, dur: 0.32, to: -1 },
      { kind: W.LOOK, at: first + 0.4, dur: 0.4, to: -0.5 },
      { kind: W.LOOK, at: first + 1.1, dur: 0.4, to: 0 },
      { kind: W.TURN, at: first + 1.4, dur: 0.32, to: 1 },
    ];
    if (fits(list)) out.push({ kind: 'over-the-shoulder', list });
  }

  // ── AND THE WEIGHT SHIFT, for a line with no room for anything else ───────
  {
    const list = [
      { kind: W.LEAN, at: first, dur: 0.6, to: 1 },
      { kind: W.LEAN, at: Math.max(first + 0.9, dur - 0.9), dur: 0.6, to: 0 },
    ];
    if (fits(list)) out.push({ kind: 'lean', list });
  }

  // THE BIG MOVES COME FIRST, and that ordering is the whole answer to the reader's
  // note. Offered as a flat list and picked uniformly, the patterns that fit ANY
  // line — a look, a weight shift — won four beats in five, because they are the
  // ones that always fit. The reader asked for the opposite: *"move back and forth
  // … maybe sit on the ground"*, with the small ones as what happens when there is
  // no room or no time for those.
  const RANK = { sit: 0, stroll: 1, 'there-and-back': 2, crouch: 3, 'over-the-shoulder': 4, look: 5, glance: 6, lean: 7 };
  const pool = out.filter((o) => o.kind !== lastKind);
  const from = (pool.length ? pool : out).sort((a, b) => RANK[a.kind] - RANK[b.kind]);
  if (!from.length) return null;
  // Among the best two that fit, so a lesson with room for a walk on every beat
  // still varies — the seed decides, and it is stable per lesson and beat.
  const top = from.slice(0, 2);
  return top[Math.floor(seed * top.length) % top.length];
}

const body = Object.entries(plans).map(([id, list]) => {
  const cells = list.map((p) => (p ? `[${p.join(', ')}]` : 'null')).join(', ');
  return `  '${id}': [${cells}],`;
}).join('\n');

const HEAD = fs.readFileSync(OUT, 'utf8').split('export const WANDER_PLANS')[0];
const out = `${HEAD}export const WANDER_PLANS: Record<string, readonly (readonly number[] | null)[]> = {\n${body}\n};\n`;
if (!DRY) fs.writeFileSync(OUT, out);

const stat = (A) => {
  const s = [...A].sort((a, b) => a - b);
  const q = (p) => (s.length ? s[Math.floor(s.length * p)] : 0);
  return `median ${q(0.5)}  p90 ${q(0.9)}  worst ${s[s.length - 1] ?? 0}`;
};
console.log(`${tally.lessons} lessons with one figure  ·  ${tally.solo} left alone (a crowd, a pair, or two pose tracks)`);
console.log(`  ${planned} beat(s) given a plan, of ${freeBeats} where he is free to move`);
console.log(`  skipped: ${tally.skipGraded} graded or summary · ${tally.skipCode} at a prop or already moving · ${tally.skipWalk} the scene walks him · ${tally.skipRoom} no room · ${tally.skipChair} the chair's`);
console.log(`  ${Object.entries(used).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} ${n}`).join(' · ')}`);
console.log(`  a step is ${stat(spans)} stage units`);
console.log(`  ${Object.keys(plans).length} lessons in the table`);
if (DRY) console.log('\n--dry: nothing written');

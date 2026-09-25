// WHERE HE SITS DOWN IN A LAWN CHAIR, AND WHERE HE HAS A MUG — writes data/lessonChair.ts.
//
//   npm run make:chair            · --dry prints and writes nothing
//
// The owner, 2026-09-25: *"grab a chair out of noware, like a lawn chair, set it up,
// and then sit down, mabye fidget his hand and arms just a little, maybe pull out
// some coffee or tea, crossing his legs sometimes."* Decided with them: it spans
// several taps, it rotates — never two lessons running, about one in three — and
// the chair comes out from behind his back.
//
// A TABLE, NOT A SCENE EDIT, for the reason every player-drawn layer is one: the
// routine reaches the lead through `lookPose` (chairPlay.ts), so no scene changes
// and no must-box goes stale. This decides WHERE; `chairRoutine.ts` is the WHAT.
//
// ── WHAT A STRETCH NEEDS ────────────────────────────────────────────────────
//
// 1. One figure, no visitor. A second figure turns him into a conversation (N21),
//    and a man who sits down in the middle of one has walked out of it.
// 2. Not a grave lesson (N11). A lawn chair and a mug of tea is a gag.
// 3. Three to five beats running where he is FREE — no question, no summary, no
//    prop in his hands, no walk, no played action, no thought bubble (it is placed
//    against his standing head) and no pen mark (it is placed against his box).
// 4. ROOM, measured on every beat of it: the chair reaches 24 units behind his
//    pelvis and 60 in front while it is flicked open at his side (check:chair §4
//    re-derives both from the routine), all of it on
//    clear floor and inside every frame the camera shows (the camera is never
//    touched — the same rule the wander keeps).
// 5. Time: the setup and the putaway each want a line long enough to finish in,
//    because a tap hurries them (chairPlay HURRY) and the owner asked for nothing fast.
import fs from 'node:fs';
import { loadTs } from './lib/loadts.mjs';
import { corpus } from './lib/gestures.mjs';
import { walkOf, scaleOf } from './lib/scenefig.mjs';
import { LESSONS, beatsOf, parseManifest } from './lib/narration.mjs';
import { markBox } from './lib/marks.mjs';
import { grave } from './lib/liveliness.mjs';
import { poseTier, freeFloor, hash01, facingOf } from './lib/wanderrule.mjs';
import { soloFigure, leadBox, windowsFor, sceneExists } from './lib/figroom.mjs';

const DRY = process.argv.includes('--dry');
const DIR = 'components/lesson/cinematic';
const OUT = 'data/lessonChair.ts';

// The routine's own numbers, read out of its source rather than restated (the module
// imports rig.ts, which `loadTs` cannot follow).
const RT_SRC = fs.readFileSync(`${DIR}/chairRoutine.ts`, 'utf8');
const rt = (name) => {
  const m = RT_SRC.match(new RegExp(`export const ${name} = (-?[\\d.]+);`));
  if (!m) throw new Error(`make:chair: ${name} not found in chairRoutine.ts`);
  return Number(m[1]);
};
const SETUP_S = rt('SETUP_S'); const PUTAWAY_S = rt('PUTAWAY_S'); const MUG_STAND_S = rt('MUG_STAND_S');
const CH_SETUP = rt('CH_SETUP'); const CH_PUTAWAY = rt('CH_PUTAWAY'); const CH_MUG_STAND = rt('CH_MUG_STAND');
const SEAT_CROSS = rt('SEAT_CROSS'); const SEAT_MUG = rt('SEAT_MUG');
const SEAT_DRUM = rt('SEAT_DRUM'); const SEAT_SIP = rt('SEAT_SIP'); const SEAT_REST = rt('SEAT_REST');

/** How far the chair and the package reach from his pelvis, rig units (chairRoutine). */
export const REACH_BACK = 24;
export const REACH_FRONT = 60;
/** Seated, only the open chair and his crossed foot: the package is not in his hand. */
export const SEAT_FRONT = 32;
/** How high above the ground any part of the routine reaches (the back top, swung up over him). */
export const CHAIR_H = 66;

const J = JSON.parse(fs.readFileSync(`${DIR}/mustBoxes.ts.json`, 'utf8'));
const { TOURS } = await loadTs(`${DIR}/tours.ts`);
const { VISITOR } = await loadTs('data/lessonVisitor.ts');
const { THOUGHTS } = await loadTs('data/lessonThoughts.ts');
const { MARKS } = await loadTs('data/lessonMarks.ts');
const NARRATION = Object.fromEntries(
  [...parseManifest(fs.readFileSync('lib/narration/manifest.ts', 'utf8')).lessons]
    .map(([id, m]) => [id, Object.fromEntries(m)]),
);
const rows = corpus();
const CODES = new Map(rows.map((r) => [r.id, r.beats.map((b) => b.code)]));
const GRADED = new Map(rows.map((r) => [r.id, r.beats.map((b) => b.graded)]));

/** Everything a lesson says, so a grave word anywhere takes the whole lesson out. */
function textOf(file) {
  const p = `${DIR}/${file}`;
  if (!fs.existsSync(p)) return '';
  const src = fs.readFileSync(p, 'utf8');
  return [...src.matchAll(/\b(?:text|explain|prompt|cite|reads):\s*(['"])((?:\\.|(?!\1)[^\\])*)\1/g)]
    .map((m) => m[2]).join(' ');
}

// READING ORDER, the way `make:wardrobe` reads it: by branch, by lesson number.
const ROUTE = 'app/(app)/branches/[branchSlug]/[pathSlug]/lesson/[lessonId].tsx';
const route = fs.readFileSync(ROUTE, 'utf8');
const byBranch = {};
for (const m of route.matchAll(/'([a-z-]+-[a-z]+-(\d+))':\s*([A-Za-z0-9]+)/g)) {
  const b = m[1].split('-')[0];
  (byBranch[b] = byBranch[b] || []).push({ id: m[1], n: +m[2] });
}
for (const b of Object.keys(byBranch)) byBranch[b].sort((a, c) => a.n - c.n);

const WHY = {};
const FIT = { nospan: 0, span: 0, cam: 0, ok: 0 };
const RUNS = [];
/** Per lesson: which beats he is free on, and whether the chair fits on each. */
async function survey(id) {
  const file = LESSONS[id];
  if (!file || !sceneExists(id) || !soloFigure(id)) return null;
  const beats = beatsOf(file);
  const items = J.words[id];
  if (!items) return null;
  const codes = CODES.get(id) || [];
  const graded = GRADED.get(id) || [];
  const walk = await walkOf(id);
  const face = facingOf(walk);
  const k = scaleOf(id);
  const marks = MARKS[id] || {};
  const thoughts = THOUGHTS[id]?.at || [];
  const lines = NARRATION[id] || {};
  const windowsAt = windowsFor(id, graded, TOURS, J);

  const walked = (i) => !!walk && i > 0 && Math.abs((walk[i] ?? 0) - (walk[i - 1] ?? 0)) > 1;
  /**
   * `asked` lets a QUESTION beat through: he may stay sitting while the reader
   * answers (SEAT_REST — no fidget, no mug, nothing to look at but the question).
   * The setup and the putaway never land on one, because they are the beat's event.
   */
  const free = (i, asked = false) => {
    const b = beats[i];
    if (!b || b.summary) return false;
    if (!asked && (b.interact || b.mc || b.tap)) return false;
    // BOUND is out — a hand at a prop, or already on the floor, is a pose the
    // picture depends on. A played gesture or a living hold is not: the routine IS
    // this beat's action, and it replaces the whole stance while it plays.
    if (poseTier(codes[i] ?? 0) === 'bound') return false;
    // A THOUGHT BUBBLE is placed against his standing head, so `make:thoughts` runs
    // after this and leaves the chair's beats alone; it is not a reason to refuse.
    if (walked(i) || marks[i]) return false;
    return !!leadBox(items[i]);
  };
  /** Does the chair's whole reach sit on clear floor, in shot, on beat i? */
  const fits = (i, front = REACH_FRONT) => {
    const lead = leadBox(items[i]);
    if (!lead) return false;
    const px = walk ? walk[i] : lead.x + lead.w / 2;
    const f = face ? face[i] : 1;
    const lo = px - (f > 0 ? REACH_BACK : front) * k;
    const hi = px + (f > 0 ? front : REACH_BACK) * k;
    // ONLY THE CHAIR'S OWN HEIGHT IS ASKED ABOUT. Everything it is made of — the
    // package in his hand included — stays within CHAIR_H of the ground, so a plate
    // hung at his chest is no obstacle to a chair at his knees. Measured against
    // his whole height, as the wander does, it refused lessons for art the chair
    // could never touch.
    const ground = lead.y + lead.h;
    const band = { ...lead, y: ground - CHAIR_H * k, h: CHAIR_H * k };
    const spans = freeFloor(items[i], band, []);
    // The chair shares the floor with him, so it must fit the clear span he is in.
    const span = spans.find(([a, c]) => a <= lead.x + 1 && c >= lead.x + lead.w - 1);
    if (!span) { FIT.nospan += 1; return false; }
    if (lo < span[0] || hi > span[1]) { FIT.span += 1; return false; }
    for (const w of windowsAt(i)) if (lo < w.left + 2 || hi > w.right - 2) { FIT.cam += 1; return false; }
    FIT.ok += 1;
    return true;
  };
  const dur = (i) => (lines[i]?.dur ?? 3.2) + 0.3;
  if (process.env.CHAIR_WHY) {
    const why = { q: 0, tier: 0, walk: 0, thought: 0, mark: 0, lead: 0, room: 0, cam: 0, ok: 0 };
    for (let i = 0; i < beats.length; i += 1) {
      const b = beats[i];
      if (!b || b.interact || b.mc || b.tap || b.summary) { why.q += 1; continue; }
      if (poseTier(codes[i] ?? 0) === 'bound') { why.tier += 1; continue; }
      if (walked(i)) { why.walk += 1; continue; }
      if (thoughts[i]) { why.thought += 1; continue; }
      if (marks[i]) { why.mark += 1; continue; }
      const lead = leadBox(items[i]);
      if (!lead) { why.lead += 1; continue; }
      if (!fits(i)) { why.room += 1; continue; }
      why.ok += 1;
    }
    for (const [key, v] of Object.entries(why)) WHY[key] = (WHY[key] || 0) + v;
  }
  const asked = (i) => !!(beats[i] && (beats[i].interact || beats[i].mc || beats[i].tap));
  return { beats, free, fits, dur, walked, asked, graded: textOf(file) };
}

/**
 * The seated parts, in the order a stretch deals them. Rotated by the lesson's
 * seed, so two chair lessons do not do the same things in the same order.
 */
const SEAT_ORDERS = [
  [SEAT_CROSS, SEAT_MUG, SEAT_SIP, SEAT_DRUM],
  [SEAT_MUG, SEAT_DRUM, SEAT_CROSS, SEAT_SIP],
  [SEAT_DRUM, SEAT_CROSS, SEAT_MUG, SEAT_SIP],
  [SEAT_MUG, SEAT_CROSS, SEAT_SIP, SEAT_DRUM],
];
/** How long a seated part takes, stated as in chairRoutine.partLen. */
const SEAT_LEN = { [SEAT_CROSS]: 4.1, [SEAT_MUG]: 3.8, [SEAT_DRUM]: 4.3, [SEAT_SIP]: 4.0 };
/** Slack left at the end of a beat, so a reader who taps as the voice stops is not hurrying him. */
const SLACK = 0.3;

/**
 * THE PARTS FOR A STRETCH OF BEATS a…a+n−1, as quads, or null.
 *
 * Each beat gets as many parts as its own line has time for: the first opens with
 * the setup and the last closes with the putaway, and whatever time either has left
 * over — and every beat between — takes seated parts. A QUESTION beat is SEAT_REST
 * whatever was dealt: the reader is working, and a man fidgeting or sipping beside
 * the question is competing with it.
 */
function partsFor(S, a, n, order) {
  const out = [];
  let crossed = 0;
  let mug = 0;
  let q = 0;
  let own = 0;
  const seat = (beat, room) => {
    for (let tries = 0; tries < order.length; tries += 1) {
      let kind = order[(q + tries) % order.length];
      // A SIP needs the mug in his hand, and the legs only cross once.
      if (kind === SEAT_SIP && !mug) continue;
      if (kind === SEAT_MUG && mug) kind = SEAT_SIP;
      if (kind === SEAT_CROSS && crossed) continue;
      if (SEAT_LEN[kind] > room) continue;
      q += tries + 1;
      out.push(beat, kind, crossed, mug);
      if (kind === SEAT_CROSS) crossed = 1;
      if (kind === SEAT_MUG) mug = 1;
      own += 1;
      return SEAT_LEN[kind];
    }
    return 0;
  };
  for (let i = a; i < a + n; i += 1) {
    let room = S.dur(i) - SLACK;
    if (i === a) { out.push(i, CH_SETUP, 0, 0); room -= SETUP_S; }
    const last = i === a + n - 1;
    if (last) room -= PUTAWAY_S;
    if (room < 0) return null;
    if (S.asked(i)) out.push(i, SEAT_REST, crossed, mug);
    else {
      // Fill the line: one seated part, and a second if there is time for it.
      const used = seat(i, room);
      if (used && room - used >= 3.8) seat(i, room - used);
      // A beat between the ends must own something, or the timeline skips it.
      if (!used && i !== a && !last) out.push(i, SEAT_REST, crossed, mug);
    }
    if (last) out.push(i, CH_PUTAWAY, crossed, mug);
  }
  return own ? out : null;
}

/** The best stretch in a lesson, or null. */
function stretchIn(S, seed) {
  const order = SEAT_ORDERS[Math.floor(seed * SEAT_ORDERS.length) % SEAT_ORDERS.length];
  let best = null;
  for (let n = 2; n <= 4; n += 1) {
    for (let a = 0; a + n <= S.beats.length; a += 1) {
      let ok = true;
      for (let i = a; i < a + n && ok; i += 1) {
        const ends = i === a || i === a + n - 1;
        ok = S.free(i, !ends) && S.fits(i, ends ? REACH_FRONT : SEAT_FRONT);
      }
      if (!ok) continue;
      // The beat after it must not walk him, because an early tap hurries the
      // putaway into it.
      if (S.walked(a + n)) continue;
      const parts = partsFor(S, a, n, order);
      if (!parts) continue;
      // Sitting a while is the point: score the seated parts of his own, less the
      // questions he sits through.
      let score = 0;
      for (let q = 0; q < parts.length; q += 4) {
        const kind = parts[q + 1];
        if (SEAT_LEN[kind]) score += 2;
        if (kind === SEAT_REST) score -= 1;
      }
      score -= n * 0.5;
      if (!best || score > best.score) best = { score, parts };
    }
  }
  return best ? best.parts : null;
}

/** The standing mug: one free beat with a line long enough for the sip. */
function mugIn(S) {
  let best = null;
  for (let i = 0; i < S.beats.length; i += 1) {
    if (!S.free(i) || S.walked(i + 1)) continue;
    if (S.dur(i) < MUG_STAND_S + SLACK) continue;
    if (best === null || S.dur(i) > S.dur(best)) best = i;
  }
  return best === null ? null : [best, CH_MUG_STAND, 0, 0];
}

const plans = {};
const tally = { chair: 0, mug: 0, noRoom: 0, grave: 0, visitor: 0, solo: 0, spaced: 0 };
for (const list of Object.values(byBranch)) {
  const had = [];            // per lesson in reading order: 'chair' | 'mug' | null
  for (const { id } of list) {
    const S = await survey(id);
    let got = null;
    if (!S) tally.solo += 1;
    else if (VISITOR[id]) tally.visitor += 1;
    else if (grave(S.graded)) tally.grave += 1;
    else {
      const seed = hash01(`${id}:chair`);
      const recent = had.slice(-2);
      // NEVER TWO LESSONS RUNNING, and not in the lesson after next either, which is
      // what makes it about one in three rather than every other lesson.
      if (!recent.includes('chair')) {
        const plan = stretchIn(S, seed);
        if (plan) { plans[id] = plan; got = 'chair'; tally.chair += 1; } else tally.noRoom += 1;
      } else tally.spaced += 1;
      if (!got && had[had.length - 1] !== 'mug' && had[had.length - 1] !== 'chair' && seed < 0.55) {
        const plan = mugIn(S);
        if (plan) { plans[id] = plan; got = 'mug'; tally.mug += 1; }
      }
    }
    had.push(got);
  }
}

const HEAD = fs.readFileSync(OUT, 'utf8').split('export const CHAIR_PLANS')[0];
const body = Object.entries(plans).map(([id, p]) => `  '${id}': [${p.join(', ')}],`).join('\n');
const text = `${HEAD}export const CHAIR_PLANS: Record<string, readonly number[]> = {\n${body}\n};\n`;
if (!DRY) fs.writeFileSync(OUT, text);
// `--json` prints the table instead, so `check:chair` can ask whether the committed
// one is what the generator would write today.
if (process.argv.includes('--json')) { console.log(JSON.stringify(plans)); process.exit(0); }
const total = Object.values(byBranch).reduce((s, l) => s + l.length, 0);
console.log(`${tally.chair} lessons sit in a lawn chair · ${tally.mug} have a mug standing · of ${total}`);
console.log(`  left out: ${tally.solo} not one figure · ${tally.visitor} a visitor · ${tally.grave} grave · ${tally.noRoom} no stretch with room and time · ${tally.spaced} too soon after the last chair`);
if (process.env.CHAIR_WHY) console.log('  beats:', WHY, 'fit tests:', FIT);
if (process.env.CHAIR_RUNS) {
  const h = (j) => { const c = {}; for (const r of RUNS) c[r[j]] = (c[r[j]] || 0) + 1; return JSON.stringify(c); };
  console.log('  longest free run per lesson:', h(0));
  console.log('  …and with room for the seated chair:', h(1));
}
if (DRY) console.log('\n--dry: nothing written');

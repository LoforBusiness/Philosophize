// WHO WALKS IN, WHEN, AND WHERE THEY STAND — writes data/lessonVisitor.ts.
//
//   npm run make:visitor
//
// A reader asked for "a second or third stickman [to] come into a lesson dressed
// funny or dressed differently", and chose the version that keeps rule A1 true:
// **the visitor is the person who holds the OTHER position**, so he only appears
// where the lesson actually has two sides.
//
// ── WHICH LESSONS ───────────────────────────────────────────────────────────
//
// Not guessed from the prose — group Z's whole finding is that a keyword score
// disagrees with the examples whose answer you already know. Taken from the
// STRUCTURE instead: a `poll` literally lists named positions ("which would you
// defend") and a `cards` prints two of them side by side. Both are two-sided by
// construction. He enters on the beat BEFORE the question and is standing there
// when it is asked, which is what makes him an argument rather than a cameo.
//
// `split` WAS THE SECOND TRIGGER AND IS RETIRED (R20), and taking it out without
// putting anything back would have silently dropped the visitor from sixteen of
// the twenty-eight lessons that had one — a feature lost as collateral damage
// from a change about something else, which is the shape this repo keeps
// recording. `cards` is the honest replacement rather than a patch: a two-card
// deck is the most two-sided question in the app, and the reason `split`
// qualified was never the seam, it was that the claim had two named sides.
//
// `sort`, `order` and `odd` are deliberately NOT triggers. A sort's bins are
// categories rather than positions somebody holds, an order is a sequence, and
// an odd one out has three tiles that agree — none of the three gives a second
// figure anything to hold, and putting him there would be a cameo.
//
// Scenes that already stage two figures are skipped — they have their two sides.
//
// ── AND WHETHER THERE IS ANYWHERE TO PUT HIM ────────────────────────────────
//
// This is the half that decides the number, and it is measured rather than
// hoped: a figure is ~48 wide standing on the ground, and `mustBoxes` records
// every item every beat draws. So the clear floor is computable — the widest gap
// that exists on BOTH the entrance beat and the question beat, because a visitor
// who has to move out of the way between them is worse than no visitor.
//
// BLEED IS BACKGROUND, NOT AN OBSTACLE. The floor each scene lays down is a
// full-width View running past the stage edge; counting it as blocking reported
// 41 of 56 lessons as having no room, which is the whole stage in every lesson.
// `mustprobe` already marks anything drawn to be cut.
import fs from 'node:fs';
import path from 'node:path';

const DIR = 'components/lesson/cinematic';
const OUT = 'data/lessonVisitor.ts';
const STAGE_W = 400;
const FIG_W = 48;
/**
 * The band a standing figure occupies, in stage units.
 *
 * HIS WHOLE HEIGHT, NOT HIS FEET. This was 400…505 — the floor — and a figure's own
 * recorded box runs 378…506, so anything hanging between 378 and 400 was invisible to
 * the scan and he could be placed under it. ethics37 is the reader's case: the posts
 * of its frame run down to 392 and its tap target over them to 392, so the visitor was
 * put at 166 with his HAT inside the box the reader is asked to tap. On screen that is
 * an outlined rectangle drawn across a stickman's head — "a lot of overlapping happens
 * above the stickman".
 *
 * A taller band means fewer visitors, and that is the right trade: a second figure who
 * stands in the middle of the question is worse than no second figure, which is AA8's
 * own reasoning for refusing 40 lessons already.
 */
const FLOOR_TOP = 378;
const FLOOR_BOT = 506;

const side = JSON.parse(fs.readFileSync(path.join(DIR, 'mustBoxes.ts.json'), 'utf8'));
/** The lead's facing at rest per beat, from the real scenes (`REPLAY_FACING=… npm run check:replay`). */
const FACING = JSON.parse(fs.readFileSync(path.join(DIR, 'leadFacing.json'), 'utf8'));
const route = fs.readFileSync('app/(app)/branches/[branchSlug]/[pathSlug]/lesson/[lessonId].tsx', 'utf8');

const lessons = [];
for (const m of route.matchAll(/'([a-z-]+-[a-z]+-(\d+))':\s*([A-Za-z0-9]+)/g)) {
  const comp = m[3].replace(/Lesson$/, '');
  lessons.push({ id: m[1], n: +m[2], stem: `${comp[0].toLowerCase()}${comp.slice(1)}` });
}

function beatBlocks(script) {
  const body = script.slice(script.indexOf('export const BEATS'));
  const out = [];
  let depth = 0; let start = -1;
  const open = body.indexOf('= [') + 2;
  for (let i = open; i < body.length; i += 1) {
    const c = body[i];
    if (c === '{') { if (!depth) start = i; depth += 1; }
    else if (c === '}') { depth -= 1; if (!depth && start >= 0) { out.push(body.slice(start, i + 1)); start = -1; } }
    else if (c === ']' && !depth) break;
  }
  return out;
}

/**
 * The clear spans of floor on one beat.
 *
 * FIGURE BOXES ARE UN-GROWN FIRST. `make:wardrobe` grows every `fig` box by the
 * costume's reach and adds a synthetic box for the visitor himself, so reading
 * them raw makes this a feedback loop — the visitor's own body would count as an
 * obstacle to placing the visitor. Same failure the costume fit test already hit,
 * one file over.
 */
function freeFloor(items, reach) {
  const blocked = [];
  for (const it of items || []) {
    if (it.bleed) continue;
    if (it.v) continue;                       // a visitor box from a previous run
    let [x, y, w, h] = it.b;
    if (it.k === 'fig') {
      x += reach.side; y += reach.up; w -= 2 * reach.side; h -= reach.up;
    }
    if (y + h < FLOOR_TOP || y > FLOOR_BOT) continue;
    blocked.push([x - 8, x + w + 8]);
  }
  blocked.sort((a, b) => a[0] - b[0]);
  let cursor = 4;
  const free = [];
  for (const [a, b] of blocked) {
    if (a - cursor >= FIG_W) free.push([cursor, a]);
    cursor = Math.max(cursor, b);
  }
  if (STAGE_W - 4 - cursor >= FIG_W) free.push([cursor, STAGE_W - 4]);
  return free;
}

/** A lesson's declared band, read exactly the way `check-wardrobe` reads it. */
function bandOf(stem) {
  for (const f of [`${stem}Scene.tsx`, `${stem[0].toUpperCase()}${stem.slice(1)}Lesson.tsx`]) {
    const p = path.join(DIR, f);
    if (!fs.existsSync(p)) continue;
    const m = fs.readFileSync(p, 'utf8').match(/band=\{\[(\d+),\s*(\d+)\]\}/);
    if (m) return [+m[1], +m[2]];
  }
  return null;
}

const rows = {};
const skipped = { already: 0, noRoom: 0, noAsk: 0, noFit: 0, behind: 0 };

for (const L of lessons) {
  const sp = path.join(DIR, `${L.stem}Script.ts`);
  const sc = path.join(DIR, `${L.stem}Scene.tsx`);
  if (!fs.existsSync(sp) || !fs.existsSync(sc)) continue;
  const script = fs.readFileSync(sp, 'utf8');
  const scene = fs.readFileSync(sc, 'utf8');
  if (!/\n\s{6}(?:poll:|cards:)/.test(script)) continue;
  if (/<Stickman[^>]*role="second"/.test(scene)) { skipped.already += 1; continue; }

  const blocks = beatBlocks(script);
  const askAt = blocks.findIndex((b) => /\n\s{6}(?:poll:|cards:)/.test(b));
  if (askAt < 1) { skipped.noAsk += 1; continue; }
  const enterAt = askAt - 1;

  // THE MASCOT'S x ON EVERY BEAT, off the script the scene walks him by. A beat with
  // no x of its own keeps the one before it, which is what the scenes themselves do
  // (`BEATS.map((b) => b.x ?? FIG_X)`).
  const xTrack = (() => {
    let last = null;
    return blocks.map((b) => {
      const hit = /(?:^|[^A-Za-z])x:\s*(-?\d+(?:\.\d+)?)/.exec(b);
      if (hit) last = +hit[1];
      return last;
    });
  })();

  const reach = (side.wardrobeReach || {})[L.id] || { up: 0, side: 0 };
  // CLEAR ON EVERY BEAT HE IS STANDING THERE, NOT ON TWO OF THEM.
  //
  // This used to intersect the free floor of the entrance beat and the question
  // beat and nothing else — but he walks in and STAYS until the lesson ends, and a
  // scene keeps drawing after its question. aesthetics3 is the case that found it:
  // the floor at x 54 was clear on beats 5 and 6, so he was stood there, and on
  // beat 8 the scene wrote MUSIC ARRIVES BEFORE REASON along the foot of its bar
  // chart — straight through his shins. check:readable found it as a STRIKE, and a
  // reader saw it as a word cut off above the stickman.
  //
  // fitsAt, just below, already walked every beat from the entrance to the end; it
  // only ever asked about the stage edges. The floor scan now covers the same
  // span, so the two agree about how long he is there.
  const beatsOf = side.words[L.id] || [];
  let both = null;
  for (let bt = enterAt; bt < beatsOf.length; bt += 1) {
    const free = freeFloor(beatsOf[bt], reach);
    if (both === null) { both = free.filter(([lo, hi]) => hi - lo >= FIG_W); continue; }
    const next = [];
    for (const [p, q] of both) {
      for (const [r, s] of free) {
        const lo = Math.max(p, r); const hi = Math.min(q, s);
        if (hi - lo >= FIG_W) next.push([lo, hi]);
      }
    }
    both = next;
    if (!both.length) break;
  }
  if (!both || !both.length) { skipped.noRoom += 1; continue; }
  both.sort((x, y) => (y[1] - y[0]) - (x[1] - x[0]));

  // AND HE MUST FIT WHERE HE IS PUT — MEASURED THE WAY AA7 MEASURES IT.
  //
  // The scan above clears a FIG_W-wide slot, which is the figure at rest. AA7
  // asks a different question: it takes the LEAD's own recorded box, which spans
  // whatever gesture that beat holds, and asks whether a figure that wide fits at
  // the visitor's x. The two models disagreed, so the generator could place him
  // somewhere the checker rejects — and because both are deterministic, re-running
  // never converged. Five lessons sat like that, all of them in `plain`, so it was
  // not even a costume fault: the bare man did not fit.
  //
  // A generator and its checker measuring the same thing two ways is the failure
  // this repo keeps recording. The generator now asks AA7's question.
  const band = bandOf(L.stem);
  const fitsAt = (x) => {
    for (let b = enterAt; b < (side.words[L.id] || []).length; b += 1) {
      const lead = (side.words[L.id][b] || []).find((it) => it.k === 'fig' && !it.v);
      if (!lead) continue;
      const w = lead.b[2] - 2 * reach.side;          // the BARE width, ungrown
      const top = lead.b[1] + reach.up;
      if (x - w / 2 < 0.5) return false;
      if (x + w / 2 > STAGE_W - 0.5) return false;
      if (band && top < band[0] + 0.5) return false;  // his crown clears the band
    }
    return true;
  };

  // N21 — HE STANDS WHERE THE LEAD CAN SEE HIM. Placed by room alone, 19 of 32
  // visitors walked in behind the lead and argued with the back of his head. The
  // lead's facing at rest on every beat comes from the real scene, recorded by
  // `check:replay` (REPLAY_FACING → leadFacing.json); the visitor goes on the side
  // the lead faces on every beat he is there. Where the only room is behind him and
  // the lead never walks again, the player turns the lead round to face him
  // (`turn`); a lead who walks on is not turned, because a turn laid over a walk is
  // the moonwalk C18 forbids — and that lesson gets no visitor.
  const facingTab = FACING[L.id] || null;
  const restX0 = (() => {
    const m = /\bconst (?:FIG_X|FIGX|MAN_X|LEAD_X)\s*=\s*(-?\d+(?:\.\d+)?)/.exec(scene);
    return m ? +m[1] : null;
  })();
  const leadXAt = (b) => xTrack[Math.min(b, xTrack.length - 1)] ?? restX0 ?? STAGE_W / 2;
  const later = [];
  for (let b = enterAt + 1; b < blocks.length; b += 1) if (!/\bsummary:/.test(blocks[b])) later.push(b);
  const dirs = facingTab ? later.map((b) => facingTab[b]).filter((d) => d === 1 || d === -1) : [];
  const faceSide = dirs.length && dirs.every((d) => d === dirs[0]) ? dirs[0] : 0;
  const leadStill = later.every((b) => leadXAt(b) === leadXAt(enterAt));
  const seenFrom = (x) => faceSide !== 0 && later.every((b) => Math.sign(x - leadXAt(b)) === faceSide);

  const search = (ok) => {
    for (const [lo, hi] of both) {
      const mid = Math.round((lo + hi) / 2);
      // The centre of the widest gap first, then walk it for anywhere he fits.
      const tries = [mid];
      for (let d = 4; d <= (hi - lo) / 2; d += 4) { tries.push(mid - d, mid + d); }
      const found = tries.find((t) => t >= lo && t <= hi && fitsAt(Math.round(t)) && ok(Math.round(t)));
      if (found !== undefined) return Math.round(found);
    }
    return null;
  };
  let placed = search(seenFrom);
  let turn = 0;
  if (placed === null) {
    const anywhere = search(() => true);
    if (anywhere === null) { skipped.noFit += 1; continue; }
    if (!leadStill) { skipped.behind += 1; continue; }
    placed = anywhere;
    turn = Math.sign(anywhere - leadXAt(enterAt)) || 1;
  }
  const x = placed;

  // Where the LEAD is standing when the question is asked, so the visitor can be
  // put on the far side of him and turned to face him. Two figures facing the
  // same way are two bystanders; two facing each other are an argument.
  const fig = (side.words[L.id]?.[askAt] || []).find((it) => it.k === 'fig' && !it.v);
  const leadX = fig ? fig.b[0] + fig.b[2] / 2 : STAGE_W / 2;

  // AND WHERE HE IS STANDING WHEN THE VISITOR WALKS IN, which is a different beat and
  // often a different place. The entry side is decided against THIS one: the walk
  // happens on the enter beat, so it is the enter beat's mascot the path must miss.
  //
  // READ OFF THE SCRIPT'S OWN x TRACK, NOT THE MUST-BOX. A must-box is a MOMENT, not
  // a place — the probe reads the figure wherever it catches him, and CLAUDE.md
  // records 113 of 317 walking beats storing him 40 or more units from the x the
  // beat walks him to. Deciding the side off the recorded box put ethics14's visitor
  // on the wrong side of a mascot the box had caught mid-stride. The script's x is
  // where he comes to REST, which is where he is while the visitor crosses the stage.
  // Same correction `make:thoughts` already took (AB10).
  //
  // AND A SCRIPT WITH NO `x` AT ALL IS THE COMMON CASE, not an edge one: the mascot
  // stands still in most lessons, so the scene supplies his place as its own constant
  // and the beats never mention it (`b.x ?? FIG_X`). Falling back to the must-box
  // there put ethics14's visitor on the wrong side of a mascot who is at 40 and was
  // recorded mid-stride.
  const restX = (() => {
    const m = /\bconst (?:FIG_X|FIGX|MAN_X|LEAD_X)\s*=\s*(-?\d+(?:\.\d+)?)/.exec(scene);
    return m ? +m[1] : null;
  })();
  const leadIn = xTrack[Math.min(enterAt, xTrack.length - 1)] ?? restX ?? leadX;

  rows[L.id] = {
    enter: enterAt,
    x,
    // HE COMES ON FROM THE SIDE HE IS GOING TO STAND ON, so his path never crosses
    // the lead. The first rule here was "whichever edge he is nearer, so the walk is
    // short", and short is the wrong thing to optimise: in ethics37 he lands at 166
    // with the mascot at 54, so the nearer edge is the LEFT and he walked straight
    // through him. Measured live at the arrival beat, the two heads were NINE pixels
    // apart and a head is thirty-nine — the reader's "a lot of overlapping happens
    // above the stickman".
    //
    // Entering from behind the destination costs at most a stage's width of walking,
    // which `rig.moveTr` prices honestly, and it cannot put two figures in the same
    // place on the way.
    from: x >= leadIn ? STAGE_W + 60 : -60,
    // +1 faces right. He turns toward the lead once he has arrived; while he is
    // walking, Visitor.tsx faces him the way he is travelling (AF/C18).
    dir: leadX >= x ? 1 : -1,
    turn,
  };
}

const lines = Object.entries(rows)
  .map(([id, r]) => `  '${id}': { enter: ${r.enter}, x: ${r.x}, from: ${r.from}, dir: ${r.dir}${r.turn ? `, turn: ${r.turn}` : ''} },`);

fs.writeFileSync(OUT, `// GENERATED by scripts/make-visitor.mjs — do not edit by hand.
//
// The second figure who walks into a lesson: which beat he arrives on, where he
// stands, which edge he comes from, and which way he turns once he is there.
//
// Only lessons whose graded beat has two sides (a \`poll\` of named positions, or
// a \`cards\` deck of two) and which have measured floor space for him on BOTH the
// entrance beat and the question beat. See scripts/make-visitor.mjs, and group AA
// of docs/LESSON_RULES.md.

export interface VisitorCue {
  /** The beat he walks on. He is off-stage before it and standing after it. */
  enter: number;
  /** Where he stands, in stage units. */
  x: number;
  /** The off-stage x he walks in from. */
  from: number;
  /** Which way he faces once he has arrived: +1 right, −1 left. */
  dir: number;
  /**
   * Present when the lead has to be turned round to face him (N21): the side the
   * lead turns to, +1 right, −1 left. Only for a lead who never walks after he
   * arrives, so the turn cannot fight a walk.
   */
  turn?: number;
}

export const VISITOR: Record<string, VisitorCue> = {
${lines.join('\n')}
};
`);

console.log(`wrote ${OUT} — ${Object.keys(rows).length} lesson(s) get a visitor`);
console.log(`  ${skipped.already} already stage two figures`);
console.log(`  ${skipped.noRoom} have no clear floor wide enough on both beats`);
console.log(`  ${skipped.noFit} have floor, but nowhere the figure itself fits (AA7's own test)`);
console.log(`  ${skipped.behind} would stand behind a lead who walks on, so could never be faced (N21)`);
console.log(`  ${Object.values(rows).filter((r) => r.turn).length} of those placed have the lead turned round to face them`);

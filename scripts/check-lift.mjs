// GROUP E — WHAT MOVES WHEN AN ANSWER LANDS.
//
//   npm run check:lift
//
// E1: THE THING THAT MOVES MUST BE THE THING THAT WAS CHOSEN.
//
// `Target` animates its own CHILDREN — the right answer rises, a wrong pick
// recedes. So a scene that draws its art and its label as siblings and then lays
// an empty bordered rectangle on top gets the reaction applied to the RECTANGLE:
// the outline slides up off the words, which stay exactly where they were. The
// reader reported it in those terms —
//
//   "only the outline of the correct box goes out, not the entire box … and then
//    the rest of the words are staying there. It usually does not look good."
//
// — pointing at epistemology19's NUTRITION door, which was drawn in one loop and
// then covered by a second loop of bare hit-boxes.
//
// The fix is always the same shape and it SIMPLIFIES the scene: one loop instead
// of two, the art positioned relative to the Target's own box, and `hitBox`
// deleted. Nothing about the picture changes until an answer lands.
//
// A self-closing `<Target … />` is the same defect at its purest: the reaction has
// nothing at all to animate, so answering moves nothing. political7 — the lesson
// the reader holds up as the standard — was one of these.
//
// This is a HIGH-WATER MARK, like CARD_BUDGET and FLAT_BUDGET: it may only go
// down. Converting is per-scene work and is done a batch at a time; what the
// budget guarantees is that a new scene cannot arrive with the defect and that a
// converted one cannot slip back.
import fs from 'node:fs';
import path from 'node:path';

const DIR = 'components/lesson/cinematic';

// Every bare target still to convert. Lower it in the same commit as the work.
const BARE_BUDGET = 0;

const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

/** Every <Target …>…</Target> block in a file, plus self-closing ones. */
function targets(src) {
  const out = [];
  const re = /<Target\b/g; let m;
  while ((m = re.exec(src))) {
    let d = 0, j = m.index;
    for (; j < src.length; j++) {
      if (src[j] === '{') d++;
      else if (src[j] === '}') d--;
      else if (src[j] === '>' && d === 0) break;
    }
    const open = src.slice(m.index, j + 1);
    if (src[j - 1] === '/') { out.push({ open, body: '', selfClosing: true }); re.lastIndex = j; continue; }
    let depth = 1, k = j + 1;
    while (depth > 0 && k < src.length) {
      const o = src.indexOf('<Target', k), c = src.indexOf('</Target>', k);
      if (c < 0) break;
      if (o >= 0 && o < c) { depth++; k = o + 7; } else { depth--; k = c + 9; }
    }
    out.push({ open, body: src.slice(j + 1, k - 9), selfClosing: false });
    re.lastIndex = k;
  }
  return out;
}

/**
 * A target is BARE when the reaction has nothing worth moving: no words of its
 * own and at most one View, which is the invisible hit-overlay idiom. A target
 * holding real art — a face, a caption, a bar — has something to lift.
 */
function idOf(t) {
  const m = /id=\{?['"]([\w-]+)['"]/.exec(t.open);
  return m ? m[1] : null;
}

function isBare(t) {
  if (t.selfClosing) return true;
  // `<Animated.Text>` is still words. The first version of this matched `<Text`
  // only and reported ethics31's DUTY lamp — which holds two animated words that
  // cross-fade — as an empty hit-box. A detector that cannot see half the ways
  // this codebase writes a word will send someone to "fix" a scene that is right.
  if (/<(Animated\.)?Text\b/.test(t.body)) return false;
  return (t.body.match(/<(Animated\.)?View\b/g) ?? []).length <= 1;
}

const rows = [];
for (const f of fs.readdirSync(DIR).filter((x) => x.endsWith('.tsx'))) {
  if (f === 'Target.tsx' || f === 'ChoiceCards.tsx' || f === 'CinematicPlayer.tsx') continue;
  const src = strip(fs.readFileSync(path.join(DIR, f), 'utf8'));
  const ts = targets(src);
  if (!ts.length) continue;
  // A SCENE MAY FIX THIS THE OTHER WAY, AND THAT IS NOT A DEFECT.
  // Where the art must exist on every beat while the Target is mounted only for
  // the graded one, the art stays put and the scene folds the same curve into the
  // transform its own wrapper already carries (useAnswerLiftValues). political7 is
  // the worked example. Counting those as bare would report the fix as the fault.
  const lifted = new Set();
  for (const m of src.matchAll(/useAnswer(?:Lift|LiftValues|Rise)\(\s*picked\s*,\s*['"]([\w-]+)['"]/g)) lifted.add(m[1]);

  // AND A FEW TARGETS HAVE NOTHING TO LIFT, WHICH IS A REASON, NOT AN EXCUSE.
  // political7's charter is already dimmed by the scene's own `charterDim`, and
  // its wrapper is the full stage, so scaling it would slide the whole picture.
  // Without a way to say so the budget could never honestly reach zero, and a
  // ratchet with a permanent floor nobody can explain stops being read. Write:
  //     // LIFT-EXEMPT: paper — the charter dims via charterDim; wrapper is full-stage
  // The reason is required: the marker is grepped in review, not just counted.
  const exempt = new Set();
  for (const m of fs.readFileSync(path.join(DIR, f), 'utf8')
    .matchAll(/LIFT-EXEMPT:\s*([\w-]+)\s*—\s*\S/g)) exempt.add(m[1]);

  const open = ts.filter((t) => isBare(t) && !lifted.has(idOf(t)) && !exempt.has(idOf(t)));

  // THE CORRECT ONE IS THE RULE; THE OTHERS ARE A TIDINESS.
  //
  // What the reader described is the RIGHT answer failing to rise: "the entire
  // section of the right answer" must move. A wrong pick already replies without
  // being lifted — it takes the ✕ seal and the scene's own dashed border — so a
  // bare wrong target costs the reader nothing they can name. Counting the two
  // together would have hidden 44 real defects inside 63 mixed ones and made the
  // work impossible to prioritise.
  const isCorrect = (t) => /\bcorrect(\s*=\s*\{?\s*true|\s|>|\/)/.test(t.open) && !/correct=\{false\}/.test(t.open);
  const bare = open.filter(isCorrect).length;
  const other = open.length - bare;
  if (bare || other) rows.push({ id: f.replace(/(Scene)?\.tsx$/, ''), bare, other, total: ts.length });
}
rows.sort((a, b) => b.bare - a.bare || a.id.localeCompare(b.id));

const bare = rows.reduce((a, r) => a + r.bare, 0);
const other = rows.reduce((a, r) => a + r.other, 0);
const withBare = rows.filter((r) => r.bare);

console.log('\nGROUP E — WHAT MOVES WHEN AN ANSWER LANDS\n');
if (withBare.length) {
  console.log('  scenes where the RIGHT answer lifts an outline off its own words:');
  for (const r of withBare.slice(0, 14)) {
    console.log('      ' + r.id.padEnd(20) + r.bare + ' correct target(s) of ' + r.total);
  }
  if (withBare.length > 14) console.log('      … and ' + (withBare.length - 14) + ' more scene(s)');
  console.log('');
  console.log('  the fix: put the art INSIDE the Target and position it relative to');
  console.log('  the Target\'s own box, then delete hitBox. See epistemology19Scene.tsx.');
}
const over = bare > BARE_BUDGET;
console.log('');
console.log('  ' + (over ? 'FAIL' : 'ok  ') + '  bare CORRECT targets are a high-water mark  ' + bare + ' of ' + BARE_BUDGET);
console.log('        ' + other + ' wrong-answer target(s) are also bare — they reply with the ✕ and the');
console.log('        scene\'s own marking, so they are tracked, not gated.');
if (over) {
  console.log('\n  a new target arrived with no art in it, or a converted one slipped back (E1).');
} else if (bare < BARE_BUDGET) {
  console.log('\n  lower BARE_BUDGET to ' + bare + ' in scripts/check-lift.mjs — a budget that');
  console.log('  still says the old number is a debt.');
}
console.log('');
process.exit(over ? 1 : 0);

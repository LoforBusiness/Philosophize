// EVERY BEAT IN THE CORPUS, RANKED BY HOW MUCH IT NEEDS REWRITING.
//
//   node scripts/prose-worklist.mjs            the whole corpus, worst first
//   node scripts/prose-worklist.mjs aesthetics  one branch
//   node scripts/prose-worklist.mjs --json      machine-readable
//
// A reader asked for the narration across all 186 lessons to read like American
// History Tellers. Reading all 186 by hand mostly turns up prose that is already
// good — `aesthetics1` opens "Look at it. Beautiful, obviously." / "No rush." /
// "Convenient, isn't it.", which is the voice already — and rewriting good
// sentences makes them worse. So this is the shortlist step: score every beat on
// the measures that already exist in the suite, and work down the list.
//
// FIVE FAULTS, each one a thing the suite or group V already holds:
//
//   pointer   "that", "it", "this" doing a noun's job (check:clear's own rule).
//             A pointer costs the reader a lookup; AHT names things.
//   clause    commas, dashes and semicolons per sentence (check:clear). Three
//             clause marks is a sentence with two thoughts bolted together — J1's
//             finding was that 48 of 69 over-long sentences did exactly that.
//   hard      Flesch reading ease under 60, the standard's own line (J10).
//   voice     the narrator's first person outside quotation (V1).
//
// ── AND A FIFTH THAT WAS BUILT, RUN ONCE, AND DELETED ───────────────────────
//
// An EXHIBIT score meant to catch an opening that announces an inventory instead
// of starting something (V2). It flagged 72, and the first fourteen included:
//
//   political3     "A gun makes you obey. What makes you owe obedience?"
//   ethics6        "Five lives saved. So why does this one feel wrong?"
//   epistemology7  "The sun rose today. Will it rise tomorrow?"
//   ethics35       "Two men, one afternoon, one drowning child. The first reaches
//                   in and holds him under."
//
// Those are among the best openings in the corpus. The rule tested for an "event
// verb" against a keyword list, so `glance`, `reaches`, `holds`, `rose` and
// `makes` all read as no event at all — which is the SAME failure as the two
// metrics deleted before it (a keyword concreteness score, and a linking-verb
// exhibit score that could not see an imperative). Three for three.
//
// The lesson is group Z's and it is now unambiguous here: WHETHER A BEAT STARTS
// SOMETHING IS NOT COUNTABLE. A person reads the opening. What IS countable is
// whether a sentence is hard to get through, and that is what the four faults
// above measure — each one grounded in a rule the suite already enforces rather
// than invented for this pass.
//
// It is a SHORTLIST, not a verdict — the same discipline as scripts/survey-lessons.
// Several of the corpus's best lines score here (a deliberate short fragment reads
// as pointer-heavy) and must be left alone. Read before rewriting.
import fs from 'node:fs';
import path from 'node:path';

const DIR = 'components/lesson/cinematic';
const SIDE = path.join(DIR, 'mustBoxes.ts.json');
const ROUTE = 'app/(app)/branches/[branchSlug]/[pathSlug]/lesson/[lessonId].tsx';

const side = JSON.parse(fs.readFileSync(SIDE, 'utf8'));
const route = fs.readFileSync(ROUTE, 'utf8');
const focus = fs.readFileSync('data/lessonFocus.ts', 'utf8');

const order = [];
for (const m of route.matchAll(/'([a-z-]+-[a-z]+-(\d+))':\s*([A-Za-z0-9]+)/g)) {
  const comp = m[3].replace(/Lesson$/, '');
  order.push({
    id: m[1], n: +m[2], branch: m[1].split('-')[0],
    stem: `${comp[0].toLowerCase()}${comp.slice(1)}`,
  });
}

const POINTER = /\b(this|that|these|those|it|its|them|they|there)\b/gi;
const CLAUSE = /[,;—–:]/g;
const syllables = (w) => {
  const s = w.toLowerCase().replace(/[^a-z]/g, '');
  if (!s) return 0;
  const m = s.replace(/e$/, '').match(/[aeiouy]+/g);
  return Math.max(1, m ? m.length : 1);
};
function ease(text) {
  const sents = text.split(/[.!?]+/).filter((x) => x.trim());
  const words = text.match(/[A-Za-z']+/g) || [];
  if (!sents.length || !words.length) return 100;
  const syl = words.reduce((a, w) => a + syllables(w), 0);
  return 206.835 - 1.015 * (words.length / sents.length) - 84.6 * (syl / words.length);
}
const narratorVoice = (s) => s
  .replace(/[“"][^”"]*[”"]/g, ' ')
  .replace(/[‘'][^’']{6,}[’']/g, ' ');
const FIRST_ANY = /\b(we|our|us|my|me)\b/i;
const FIRST_I = /\bI\b/;


function beatsOf(src) {
  const body = src.slice(src.indexOf('export const BEATS'));
  const out = [];
  let depth = 0; let start = -1;
  const open = body.indexOf('= [') >= 0 ? body.indexOf('= [') + 2 : body.indexOf('[');
  for (let i = open; i < body.length; i += 1) {
    const c = body[i];
    if (c === '{') { if (!depth) start = i; depth += 1; }
    else if (c === '}') { depth -= 1; if (!depth && start >= 0) { out.push(body.slice(start, i + 1)); start = -1; } }
    else if (c === ']' && !depth) break;
  }
  return out;
}
const grab = (blk, key) => {
  const m = blk.match(new RegExp(`\\b${key}:\\s*(['"])((?:\\\\.|(?!\\1)[^\\\\])*)\\1`));
  return m ? m[2].replace(/\\'/g, "'").replace(/\\n/g, ' ') : null;
};

const only = process.argv.find((a) => !a.startsWith('-') && !a.endsWith('.mjs') && !a.includes('node'));
const JSONOUT = process.argv.includes('--json');

const rows = [];
for (const L of order) {
  if (only && L.branch !== only && L.stem !== only) continue;
  const p = path.join(DIR, `${L.stem}Script.ts`);
  if (!fs.existsSync(p)) continue;
  const src = fs.readFileSync(p, 'utf8');
  const blocks = beatsOf(src);
  const fm = focus.match(new RegExp(`'${L.id}':\\s*\\{ beat: (\\d+), phrase: '((?:\\\\.|[^'])*)' \\}`));
  const focusBeat = fm ? +fm[1] : -1;
  const focusPhrase = fm ? fm[2].replace(/\\'/g, "'") : null;
  const stageWords = side.words[L.id] || [];

  for (const [i, blk] of blocks.entries()) {
    const text = grab(blk, 'text');
    if (!text) continue;
    if (/quote:\s*\{/.test(blk)) continue;              // a quotation is the source's words

    const words = text.match(/[A-Za-z']+/g) || [];
    if (words.length < 4) continue;
    const sents = text.split(/[.!?]+/).filter((x) => x.trim());
    const ptr = ((text.match(POINTER) || []).length / words.length) * 100;
    const cl = (text.match(CLAUSE) || []).length / Math.max(1, sents.length);
    const e = ease(text);
    const voice = FIRST_ANY.test(narratorVoice(text)) || FIRST_I.test(narratorVoice(text));

    // A RATIO NEEDS A DENOMINATOR, AND J12 MADE THE DENOMINATORS TINY.
    //
    // The beat-splitting pass cut 466 packed beats into pieces, so a great many
    // beats are now three or four words. Flesch is built for passages and goes
    // haywire on a fragment: "Two completely different reasons." scores −9,
    // "Belief, truth, justification — all three." scores 33, and "Look at it.
    // Beautiful, obviously." scores 52. All three are exactly right as written.
    // One pointer in a five-word beat is 20% and means nothing.
    //
    // So the two RATIO faults need at least a dozen words under them. The other
    // `clauses` needs it too: three commas in a five-word LIST ("Belief, truth,
    // justification — all three.") is one clean thought, not two bolted together,
    // and J1's rule is about the second. Only first person is a fact
    // rather than a rate. This is the same calibration failure as the deleted
    // metrics, caught the same way — by checking the score against lines whose
    // answer was already known.
    const enough = words.length >= 12;
    const faults = [];
    if (enough && ptr >= 13) faults.push(`pointers ${ptr.toFixed(0)}%`);
    if (enough && cl >= 3) faults.push(`clauses ${cl.toFixed(1)}`);
    if (enough && e < 60) faults.push(`ease ${e.toFixed(0)}`);
    if (voice) faults.push('first person');
    if (!faults.length) continue;

    rows.push({
      branch: L.branch, stem: L.stem, i, faults,
      score: faults.length * 10 + Math.max(0, 60 - e) / 10 + ptr / 10,
      text,
      maxim: i === focusBeat ? focusPhrase : null,
      stage: (stageWords[i] || []).filter((w) => w.k === 'text' && w.t).map((w) => w.t.trim()),
    });
  }
}

if (JSONOUT) { console.log(JSON.stringify(rows, null, 1)); process.exit(0); }

rows.sort((a, b) => b.score - a.score);
const byLesson = {};
for (const r of rows) byLesson[r.stem] = (byLesson[r.stem] || 0) + 1;
console.log(`${rows.length} beat(s) worth looking at, across ${Object.keys(byLesson).length} lesson(s)\n`);
const tally = {};
for (const r of rows) for (const f of r.faults) { const k = f.split(' ')[0]; tally[k] = (tally[k] || 0) + 1; }
console.log('by fault:', tally, '\n');
for (const r of rows) {
  console.log(`${r.stem}#${r.i}  [${r.faults.join(' · ')}]`);
  console.log(`   ${r.text}`);
  if (r.maxim) console.log(`   MAXIM must survive: "${r.maxim}"`);
  if (r.stage.length) console.log(`   stage: ${r.stage.slice(0, 8).join(' · ')}`);
}

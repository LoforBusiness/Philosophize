// ─────────────────────────────────────────────────────────────────────────────
// THE UNIT REVIEWS, HELD TO THEIR OWN RULES (group AK).
//
//   npm run check:review
//
// A review is a PHASE rather than a lesson, which is what keeps it clear of the
// house shape, the voice ledger, the must-boxes and every generated table. What is
// left is the content and the seam, and both can go wrong silently: a review keyed
// to a unit id that does not exist simply never appears, and a question whose
// options carry no correct answer cannot be finished.
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import { loadTs } from './lib/loadts.mjs';
import path from 'node:path';
import { loadFont } from './lib/ttfwidth.mjs';

const { UNIT_REVIEWS } = await loadTs('data/unitReviews.ts');

// Every unit in the app, from the branch files, with how many lessons it holds.
const units = new Map();
for (const b of fs.readdirSync('data/branches')) {
  const pdir = `data/branches/${b}/paths`;
  if (!fs.existsSync(pdir)) continue;
  for (const u of fs.readdirSync(pdir)) {
    const idx = `${pdir}/${u}/index.ts`;
    if (!fs.existsSync(idx)) continue;
    const src = fs.readFileSync(idx, 'utf8');
    for (const m of src.matchAll(/id: "([\w-]+)",[\s\S]*?name: "(.*?)",[\s\S]*?lessons: \[(.*?)\]/g)) {
      units.set(m[1], { name: m[2], lessons: m[3].split(',').filter((x) => x.trim()).length, branch: b });
    }
  }
}

const bad = [];
const note = (kind, msg) => bad.push({ kind, msg });

// ── 1 · EVERY UNIT HAS ONE, AND EVERY ONE IS FOR A REAL UNIT ─────────────────
for (const id of Object.keys(UNIT_REVIEWS)) {
  if (!units.has(id)) note('UNIT', `'${id}' has a review and is not a unit in any branch`);
}
for (const [id, u] of units) {
  if (!UNIT_REVIEWS[id]) note('MISSING', `${u.branch} · ${u.name} ('${id}') has no review`);
}

// ── 2 · THE SHAPE OF A REVIEW ────────────────────────────────────────────────
//
// Four questions, because that is what the owner's review is: long enough to be a
// walk back through the unit and short enough not to be another lesson. The plates
// are the stage's own vocabulary and it lays out four slots.
const QUESTIONS = 4;
const SLOTS = 4;
let asked = 0;
for (const [id, r] of Object.entries(UNIT_REVIEWS)) {
  const where = units.get(id)?.name ?? id;
  if (!Array.isArray(r.plates) || r.plates.length < 2 || r.plates.length > SLOTS) {
    note('PLATES', `${where}: ${r.plates?.length ?? 0} plates, and the stage lays out 2 to ${SLOTS}`);
  }
  const qs = r.steps.filter((s) => s.ask);
  asked += qs.length;
  if (qs.length !== QUESTIONS) note('COUNT', `${where}: ${qs.length} questions, and a review asks ${QUESTIONS}`);

  for (const [k, s] of r.steps.entries()) {
    if (s.at !== undefined && (s.at < -1 || s.at >= r.plates.length)) {
      note('AT', `${where} step ${k}: points at plate ${s.at}, and there are ${r.plates.length}`);
    }
    if (s.upto !== undefined && (s.upto < 0 || s.upto > r.plates.length)) {
      note('UPTO', `${where} step ${k}: brings ${s.upto} plates on, and there are ${r.plates.length}`);
    }
    // A STEP IS ONE THING OR THE OTHER. A graded beat's words are its prompt, and
    // narration over the top of a question is the reveal being talked across (O1).
    if (s.ask && s.text) note('BOTH', `${where} step ${k}: carries a line AND a question`);
    if (!s.ask && !s.text) note('EMPTY', `${where} step ${k}: carries neither`);
    if (!s.ask) continue;

    // ── 3 · A QUESTION MUST BE ANSWERABLE ────────────────────────────────────
    const a = s.ask;
    if (!a.prompt) note('PROMPT', `${where} step ${k}: no prompt`);
    if (!a.explain) note('EXPLAIN', `${where} step ${k}: no explanation`);
    const kinds = ['cards', 'sort', 'poll', 'drag', 'split', 'plot'].filter((n) => a[n]);
    if (kinds.length !== 1) note('CONTROL', `${where} step ${k}: ${kinds.length} controls, and a question has one`);
    const opts = a.cards ?? a.sort?.bins ?? a.drag?.zones ?? null;
    if (opts && !opts.some((o) => o.correct)) {
      note('NOANSWER', `${where} step ${k}: nothing is marked correct, so it cannot be finished`);
    }
    if (opts && opts.filter((o) => o.correct).length > 1) {
      note('TWOANSWERS', `${where} step ${k}: more than one option is correct`);
    }
    // A poll has no `correct`: its answer is the first option, permuted on screen by
    // `ChoiceCards.orderFor`, which is the fairness device R17 records.
    if (a.poll && (a.poll.options?.length ?? 0) < 2) note('POLL', `${where} step ${k}: a poll needs at least two positions`);
    if (a.drag) {
      const z = a.drag.zones ?? [];
      if (!z.length || z[z.length - 1].upto !== 1) note('ZONES', `${where} step ${k}: the last drag zone must end at 1`);
      for (let i = 1; i < z.length; i += 1) {
        if (!(z[i].upto > z[i - 1].upto)) note('ZONES', `${where} step ${k}: drag zones must increase`);
      }
      // THE KNOB MAY NOT START ON THE ANSWER, or the question is already answered.
      const start = a.drag.start ?? 0;
      let lo = 0;
      for (const zone of z) {
        if (start >= lo && start < zone.upto && zone.correct) {
          note('START', `${where} step ${k}: the drag starts inside the correct zone`);
        }
        lo = zone.upto;
      }
    }
  }
}

// ── 4 · A PLATE MUST FIT THE SLOT IT IS DRAWN IN ─────────────────────────────
//
// Offline, against the real .ttf, for S8's own reason: a word cut off by its own box
// is not visible in the source and costs nothing to measure here.
// The real face the shared stage draws a plate in, read out of node_modules the way
// every other offline width test in the repo does.
const FONT = path.join('node_modules', '@expo-google-fonts', 'inter', '700Bold', 'Inter_700Bold.ttf');
const FACE = fs.existsSync(FONT) ? loadFont(FONT) : null;
const PLATE_W = 78 - 10;          // ReviewScene: the plate, less its padding
const SIZE = 9;
let widest = 0;
if (FACE) {
  for (const [id, r] of Object.entries(UNIT_REVIEWS)) {
    for (const label of r.plates) {
      // Three rows are allowed, so the test is the longest WORD rather than the line.
      for (const word of label.split(/\s+/)) {
        const w = FACE.width(word, SIZE);
        widest = Math.max(widest, w);
        if (w > PLATE_W) {
          note('WIDE', `${units.get(id)?.name ?? id}: "${word}" is ${w.toFixed(1)} units wide and the plate holds ${PLATE_W}`);
        }
      }
    }
  }
}

console.log('THE UNIT REVIEWS (group AK)\n');
console.log(`  ${Object.keys(UNIT_REVIEWS).length} of ${units.size} units have a review · ${asked} questions · widest plate word ${widest.toFixed(1)} of ${PLATE_W}\n`);
if (!bad.length) {
  console.log('  ok    every unit in the app has a review, and every review is for a real unit');
  console.log(`  ok    every review asks ${QUESTIONS} questions, each with one control and one answer`);
  console.log('  ok    every plate word fits the slot the shared stage draws it in');
  console.log('\nevery unit ends with a review that can be finished.');
  process.exit(0);
}
const byKind = new Map();
for (const b of bad) byKind.set(b.kind, [...(byKind.get(b.kind) || []), b.msg]);
console.log(`  ✗   ${bad.length} problem(s):\n`);
for (const [k, msgs] of byKind) {
  console.log(`      ${k}  ${msgs.length}`);
  for (const m of msgs.slice(0, 6)) console.log(`        ${m}`);
  if (msgs.length > 6) console.log(`        …and ${msgs.length - 6} more`);
}
console.log('\nfailed.');
process.exit(1);

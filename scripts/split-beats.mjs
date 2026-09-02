// ONE OR TWO SENTENCES A BEAT, WHICH IS WHAT A SEGMENT IS.
//
//   node scripts/split-beats.mjs --dry
//   node scripts/split-beats.mjs
//
// A beat's whole text is rendered as one block — CinematicPlayer draws
// `<Text style={styles.narr}>{beat.text}</Text>` — so a beat IS a segment in
// Mayer's sense: everything the reader receives before pressing to continue. The
// segmenting principle (10 of 10 experimental tests, median effect size 0.79)
// puts one or two sentences in a segment, and Mayer's own worked example splits a
// two-and-a-half-minute explanation into sixteen of them.
//
// The corpus had 466 of 872 narration beats carrying three or more.
//
// WHAT THIS DOES, AND WHAT IT REFUSES.
//
// It cuts an over-packed beat into beats of at most two sentences, greedily, so a
// three-sentence beat becomes 2 + 1 and the closing sentence lands on its own tap.
// Every other property is copied verbatim to each half — the same x, the same
// gesture, the same channel values — so THE PICTURE HOLDS STILL AND ONLY THE WORDS
// ADVANCE. That is the segmenting principle exactly: the scene is not re-cut, the
// reader is simply given it in the pieces they can hold.
//
// `cite` stays on the first piece only (a kicker heads a passage, it does not
// repeat), and `dur` is divided in proportion to the words, with a floor.
//
// It refuses a beat carrying `interact`, `quote` or `summary`. Those are not
// narration: splitting one would duplicate a question, put a quotation on a beat
// that is not a rest, or move the summary off the end — all three of which
// validate-cinematic would rightly reject.
//
// THE CAP, AND WHY IT MOVED. The first pass stopped at 13 to keep a micro-lesson
// micro, which left 70 beats packed. Measuring the rest changed the answer: those
// 70 sit in about twenty lessons that had already reached 13, so clearing ALL of
// them costs +75 beats across the whole corpus and moves the mean from 11.0 to
// 11.4. Twenty lessons go to 18 or 19 beats and nothing else moves. At that price
// the evidence wins — a reader takes the same words either way, and takes them in
// pieces they can hold. Beats are split most-packed-first, so a lower ceiling
// still spends its room where it buys the most.
import fs from 'node:fs';
import path from 'node:path';

const DIR = 'components/lesson/cinematic';
const DRY = process.argv.includes('--dry');
// How long a lesson is allowed to get. SPLIT_CEILING overrides it.
//
// 13 was the first pass, chosen to keep a micro-lesson micro. Measuring what the
// rest would cost changed the answer: the 70 beats it refused are concentrated in
// about twenty lessons that had already reached 13, so clearing ALL of them costs
// +75 beats corpus-wide and moves the mean from 11.0 to 11.4. Those twenty go to
// 18 or 19 beats; nothing else moves at all. At that price the segmenting evidence
// wins, and H52's range follows.
const CEILING = +(process.env.SPLIT_CEILING || 19);
const MAX_SENTENCES = 2;
/** No piece of a split beat gets less than this on the clock. */
const MIN_DUR = 1.8;

const BEAT_SPLIT = /\n {2}\{\n/;
const BEATS_BLOCK = /(export const BEATS[^=]*=\s*\[)([\s\S]*)(\n\];)/;

const wordsOf = (s) => s.split(/\s+/).filter(Boolean);
/** The same splitter check-words counts with, so the two can never disagree. */
const sentencesOf = (s) => s
  .replace(/\b(Mr|Mrs|Ms|Dr|St|e\.g|i\.e|vs|c)\./g, '$1<>')
  .split(/(?<=[.!?])["')\]]?\s+/)
  .map((x) => x.replace(/<>/g, '.'))
  .filter((x) => wordsOf(x).length > 1);

let changed = 0, splits = 0, added = 0;
const skipped = [];

for (const f of fs.readdirSync(DIR).filter((x) => x.endsWith('Script.ts')).sort()) {
  const p = path.join(DIR, f);
  const raw = fs.readFileSync(p, 'utf8');
  const m = raw.match(BEATS_BLOCK);
  if (!m) continue;

  const chunks = m[2].split(BEAT_SPLIT);
  // chunks[0] is whatever sits before the first beat (usually empty)
  const head = chunks[0];
  const beats = chunks.slice(1);
  let n = beats.length;

  // Which beats can be split, most-packed first so a capped budget buys most.
  const plan = [];
  beats.forEach((c, i) => {
    const tm = /^(\s*)text: '((?:[^'\\]|\\.)*)',$/m.exec(c);
    if (!tm) return;
    if (/^\s*(interact|quote|summary):/m.test(c)) return;
    const text = tm[2].replace(/\\'/g, "'");
    const ss = sentencesOf(text);
    if (ss.length <= MAX_SENTENCES) return;
    plan.push({ i, ss, indent: tm[1], line: tm[0] });
  });
  plan.sort((a, b) => b.ss.length - a.ss.length);

  const out = new Map();
  for (const job of plan) {
    const parts = [];
    for (let k = 0; k < job.ss.length; k += MAX_SENTENCES) parts.push(job.ss.slice(k, k + MAX_SENTENCES));
    if (n + parts.length - 1 > CEILING) { skipped.push(`${f.replace('Script.ts', '')} (would pass ${CEILING})`); continue; }
    n += parts.length - 1;
    added += parts.length - 1;
    splits += 1;
    out.set(job.i, parts);
  }
  if (!out.size) continue;

  const rebuilt = [];
  beats.forEach((c, i) => {
    const parts = out.get(i);
    if (!parts) { rebuilt.push(c); return; }
    const tm = /^(\s*)text: '((?:[^'\\]|\\.)*)',$/m.exec(c);
    const dm = /^(\s*)dur: ([0-9.]+),$/m.exec(c);
    const total = wordsOf(parts.flat().join(' ')).length;
    parts.forEach((part, k) => {
      const body = part.join(' ');
      const esc = body.replace(/'/g, "\\'");
      let piece = c.replace(tm[0], `${tm[1]}text: '${esc}',`);
      if (dm) {
        const share = Math.max(MIN_DUR, Math.round((+dm[2] * (wordsOf(body).length / total)) * 10) / 10);
        piece = piece.replace(dm[0], `${dm[1]}dur: ${share},`);
      }
      // A KICKER HEADS A PASSAGE; it does not repeat down the pieces of one.
      if (k > 0) piece = piece.replace(/^\s*cite: '(?:[^'\\]|\\.)*',\n/m, '');
      rebuilt.push(piece);
    });
  });

  const next = raw.replace(BEATS_BLOCK, (_, a, __, c2) => a + [head, ...rebuilt].join('\n  {\n') + c2);
  if (!DRY) fs.writeFileSync(p, next, { encoding: 'utf8' });
  changed += 1;
}

console.log(`${DRY ? 'would split' : 'split'} ${splits} beat(s) across ${changed} script(s), +${added} beats`);
if (skipped.length) {
  const by = new Map();
  for (const s of skipped) by.set(s, (by.get(s) ?? 0) + 1);
  console.log(`  left packed to stay inside ${CEILING} beats:`);
  for (const [k, v] of [...by].sort((a, b) => b[1] - a[1]).slice(0, 12)) console.log(`    ${k} x${v}`);
}

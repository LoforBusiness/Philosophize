// COUNTER-TEST `check:ear` — put each defect back and watch the right rule count
// it, and stage the shapes that must stay SILENT.
//
//   node scripts/countertest-ear.mjs
//
// U3: a checker is believed only after it has been seen to fail. Two ways this
// kind of test lies, both recorded elsewhere in the repo and both guarded here:
//
//   · A MUTATION THAT CHANGES NOTHING SCORES AS "UNCHANGED" and reads as the
//     checker being blind (countertest-stamp, §17). Every staged file is compared
//     with the clean one before its count is trusted.
//   · A DETECTOR THAT CANNOT TELL THE DESIGN FROM THE DEFECT is worse than none
//     (group Z). So the clean lesson deliberately carries the shapes each rule must
//     leave alone: a year, 350 BCE, "point A", a segment named "line AB", Hobbes's
//     own "nasty, brutish, and short", and a two-fragment opener.
//
// It writes a one-lesson corpus to a temporary folder and runs the real checker
// against it through EAR_DIR, so nothing in the repo is touched.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const CLEAN = [
  'Three people. One fence.',
  'You find a wallet on the pavement. Now what?',
  'Kant says to act only on a rule you could want everyone to follow.',
  'In 1917 a urinal was entered as art.',
  'Aristotle wrote the rule down around 350 BCE.',
  'Euclid marks point A, then point B.',
  'Draw line AB across the page.',
  'Hobbes calls that life “nasty, brutish, and short”.',
  'It’s the whole question, and nobody can see it.',
  'A. J. Ayer went furthest, and J. L. Austin answered him.',
];

/** A lesson script shaped like the real ones: beats at two spaces, fields at four. */
function scriptOf(texts, explain = 'The rule. Nothing else fits.') {
  const beats = texts.map((t) => `  {\n    p: 12,\n    text: '${t.replace(/'/g, "\\'")}',\n    dur: 2,\n  },`).join('\n');
  return `import type { BaseBeat } from './cinematicKit';\n\nexport const BEATS: BaseBeat[] = [\n${beats}\n  {\n    p: 8,\n    interact: {\n      prompt: 'Which one?',\n      explain: '${explain.replace(/'/g, "\\'")}',\n      xp: 5,\n    },\n    dur: 1,\n  },\n];\n`;
}

function counts(src) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ear-'));
  try {
    fs.writeFileSync(path.join(dir, 'probeScript.ts'), src);
    const out = execFileSync(process.execPath, ['scripts/check-ear.mjs', '--json'], {
      env: { ...process.env, EAR_DIR: dir }, encoding: 'utf8',
    });
    return JSON.parse(out.trim().split('\n').pop());
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

let fails = 0;
const ok = (m) => console.log(`  ok    ${m}`);
const bad = (m) => { fails += 1; console.log(`  FAIL  ${m}`); };

console.log('\ncountertest:ear — every rule fails when its defect is put back\n');

const cleanSrc = scriptOf(CLEAN);
const clean = counts(cleanSrc);
const GATED = ['caps', 'symbol', 'digits', 'letter-a', 'quotes', 'cut', 'expanded', 'unframed', 'ellipsis', 'semicolon', 'parens', 'two-dashes', 'dash', 'filler', 'tail', 'serves-as', 'vocab', 'unnamed', 'staged', 'attribution', 'adverb', 'fragments', 'tropes'];
const noisy = GATED.filter((k) => clean[k] > 0);
if (noisy.length) bad(`the clean lesson is not silent: ${noisy.map((k) => `${k} ${clean[k]}`).join(' · ')}`);
else ok('the clean lesson is silent — a year, 350 BCE, point A, line AB, a quoted triad and a two-fragment opener all pass');

const CASES = [
  ['caps', 'The argument is VALID.'],
  ['symbol', 'You are sure of most of it & more.'],
  ['digits', 'He listed 38 tricks.'],
  ['letter-a', 'Draw a circle around A through B.'],
  // Found by a rewriter, not by this file: a letter before a full stop was read
  // as an initial ("A. J. Ayer"), so this bare A was invisible.
  ['letter-a', 'Call it A. But it moves on.'],
  ['quotes', 'Aristotle asks “what do I do?'],
  ['cut', 'but who am I becoming?'],
  ['cut', 'The argument simply runs on'],
  ['expanded', 'The conclusion does not follow.'],
  ['unframed', 'For years “all swans are white” held up.'],
  ['ellipsis', 'And then… nothing.'],
  ['semicolon', 'Mind thinks; body takes up space.'],
  ['parens', 'The rule (as Kant put it) holds.'],
  ['two-dashes', 'One — then two — then more.'],
  ['dash', 'The claim holds — for now.'],
  ['filler', 'Um, look at the wall.'],
  ['tail', 'The case went to court, highlighting its weight.'],
  ['serves-as', 'The cave serves as a picture of ignorance.'],
  ['vocab', 'Plato delves into the cave.'],
  ['unnamed', 'Some philosophers argue it fails.'],
  ['staged', 'There are no easy answers here.'],
  ['attribution', 'Hume notes that the sun may not rise.'],
  ['adverb', 'The move is simply wrong.'],
  ['fragments', 'Openly. In print. As a priest.'],
  ['tropes', 'Here’s the thing: the rule breaks.'],
];

for (const [rule, defect] of CASES) {
  const src = scriptOf([...CLEAN, defect]);
  if (src === cleanSrc) { bad(`${rule}: the staged defect did not change the file`); continue; }
  const got = counts(src);
  if ((got[rule] ?? 0) > (clean[rule] ?? 0)) ok(`${rule.padEnd(11)} counts “${defect}”`);
  else bad(`${rule.padEnd(11)} did NOT count “${defect}” (${clean[rule]} → ${got[rule]})`);
}

// The contraction rule reaches the explanation too (AC4), and must.
const explainSrc = scriptOf(CLEAN, 'Neither does. The rule does not care.');
const ex = counts(explainSrc);
if (ex.expanded > clean.expanded) ok('expanded    reaches `explain`, not just the narration');
else bad('expanded    is blind to `explain`');

// A quotation block is the source's own words and must never be judged.
const quoted = cleanSrc.replace("  {\n    p: 8,", "  {\n    p: 0,\n    quote: {\n      id: 'lq-probe',\n      text: 'We do not; it is VALID … (sic) 38%.',\n      author: 'Somebody',\n    },\n    dur: 3,\n  },\n  {\n    p: 8,");
if (quoted === cleanSrc) bad('quote block: the staged quotation did not change the file');
else {
  const q = counts(quoted);
  const leaked = GATED.filter((k) => q[k] !== clean[k]);
  if (leaked.length) bad(`a quotation block was judged: ${leaked.join(' · ')}`);
  else ok('a `quote` block is never judged — six spaces of indent keep it out');
}

console.log(fails ? `\n${fails} failing.\n` : '\nthe checker can still see every defect it names.\n');
process.exit(fails ? 1 : 0);

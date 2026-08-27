// GROUP J — SAY IT IN WORDS A BEGINNER ALREADY OWNS.
//
//   npm run check:plainwords
//   PLAIN_REPORT=1 npm run check:plainwords     # rank every hard word, for curating
//
// J11: A WORD THE LESSON IS NOT TEACHING MUST BE ONE THE READER ALREADY HAS.
//
// check-words measures sentence LENGTH and is green. The reader's complaint was
// about something else and they were explicit about the difference:
//
//   "This does not just mean shorten the amount of words, but it means to make
//    the words that are shown easier to grasp and simpler."
//
// A long sentence and a hard word fail differently. A long sentence loses the
// thread; a hard word stops the reader dead on one token and there is nothing in
// the sentence to recover from it.
//
// THREE THINGS THIS DELIBERATELY DOES NOT FLAG, because getting any of them wrong
// would make the rule worse than nothing:
//
//  1. A QUOTATION. Bentham wrote "imprescriptible" and Plato "indissoluble".
//     §13 says the primary source is what makes a lesson feel worth paying for,
//     and rewriting a philosopher is the one edit this app must never make. Every
//     `quote:` block is stripped before a word is judged.
//  2. A TERM THE CURRICULUM EXISTS TO TEACH. "Consequentialism" IS the lesson.
//     §13 says so directly: a long WORD is fine, and naming it is the point.
//  3. SYLLABLE COUNT ON ITS OWN. The first draft of this ranked by syllables and
//     put "everything", "everybody" and "beautiful" at the top of the corpus —
//     three words every six-year-old owns. Length is not difficulty, and a
//     checker that says it is trains people to ignore it.
//
// So the list below is CURATED and each entry carries the plain word to use
// instead. That is what makes a finding actionable rather than a scolding.
import fs from 'node:fs';
import path from 'node:path';

const DIR = 'components/lesson/cinematic';
const HARD_BUDGET = 0;

/** hard word -> what to say instead. Add a pair, never a bare word. */
const PLAIN = new Map(Object.entries({
  antecedent: 'the "if" part',
  exculpating: 'excusing',
  intelligible: 'able to be understood',
  misrecognition: 'seeing someone wrongly',
  nonrecognition: 'not seeing someone at all',
  unrefutable: 'impossible to prove wrong',
  irrefutable: 'impossible to prove wrong',
  innocuous: 'harmless',
  pernicious: 'harmful',
  emanation: 'something given off',
  indissoluble: 'that cannot be broken up',
  manifoldness: 'a great many things at once',
  imprescriptible: 'that cannot be taken away',
  ascertain: 'find out',
  utilise: 'use',
  utilize: 'use',
  commence: 'begin',
  endeavour: 'try',
  elucidate: 'make clear',
  ameliorate: 'improve',
  efficacious: 'effective',
  ubiquitous: 'everywhere',
  disparate: 'different',
  salient: 'important',
  cogent: 'convincing',
  veracity: 'truth',
  culpability: 'blame',
  requisite: 'needed',
  myriad: 'many',
  paucity: 'too few',
  extant: 'still around',
  nascent: 'just beginning',
  tenable: 'defensible',
  untenable: 'impossible to defend',
  purport: 'claim',
  obviate: 'remove the need for',
  promulgate: 'announce',
  delineate: 'set out',
  juxtapose: 'set side by side',
  concomitant: 'that comes with it',
  heretofore: 'until now',
  notwithstanding: 'even so',
  aforementioned: 'the one above',
  vis: 'compared with',
  qua: 'as',
}));

/**
 * TERMS THE CURRICULUM EXISTS TO TEACH, and which the lesson introduces on the
 * spot. `logic6` says "P is the antecedent — the condition"; `strong4` says "A
 * strong argument that also has true premises has its own name: cogent." That is
 * the pattern working, not failing, and flagging it would tell an author to
 * delete the thing they are there to teach.
 *
 * The bar for adding a word here is that the lesson NAMES AND GLOSSES it in the
 * same breath. If it does not, the fix is to introduce it, not to exempt it.
 */
const TAUGHT = new Set(['antecedent', 'consequent', 'cogent']);

const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

/** Remove every `quote: { … }` block — a philosopher's own words are not ours. */
function withoutQuotes(src) {
  let out = '', i = 0;
  for (;;) {
    const q = src.indexOf('quote:', i);
    if (q < 0) { out += src.slice(i); break; }
    out += src.slice(i, q);
    const open = src.indexOf('{', q);
    if (open < 0) { out += src.slice(q); break; }
    let d = 0, j = open;
    for (; j < src.length; j++) {
      if (src[j] === '{') d++;
      else if (src[j] === '}') { d--; if (d === 0) { j++; break; } }
    }
    i = j;
  }
  return out;
}

const KEYS = ['text', 'prompt', 'explain', 'reads', 'lo', 'hi'];

const findings = [];
const seen = new Map();
for (const f of fs.readdirSync(DIR).filter((x) => x.endsWith('Script.ts'))) {
  const src = withoutQuotes(strip(fs.readFileSync(path.join(DIR, f), 'utf8')));
  const id = f.replace('Script.ts', '');
  for (const m of src.matchAll(/\b(text|prompt|explain|reads|lo|hi):\s*'((?:[^'\\]|\\.)*)'/g)) {
    if (!KEYS.includes(m[1])) continue;
    const line = m[2].replace(/\\'/g, "'");
    for (const w of line.split(/[^A-Za-z'’-]+/)) {
      const bare = w.replace(/['’].*$/, '').toLowerCase();
      if (!PLAIN.has(bare) || TAUGHT.has(bare)) continue;
      findings.push({ id, key: m[1], word: bare, say: PLAIN.get(bare), line });
      seen.set(bare, (seen.get(bare) ?? 0) + 1);
    }
  }
}

console.log('\nGROUP J — SAY IT IN WORDS A BEGINNER ALREADY OWNS\n');
if (findings.length) {
  console.log('  hard words in our own prose (quotations are exempt):');
  for (const x of findings.slice(0, 24)) {
    console.log('      ' + x.id.padEnd(16) + x.key.padEnd(8) + x.word);
    console.log('          say: ' + x.say);
    console.log('          "' + x.line.slice(0, 96) + (x.line.length > 96 ? '…' : '') + '"');
  }
  if (findings.length > 24) console.log('      … and ' + (findings.length - 24) + ' more');
  console.log('');
}
const over = findings.length > HARD_BUDGET;
console.log('  ' + (over ? 'FAIL' : 'ok  ') + '  hard words are a high-water mark  ' + findings.length + ' of ' + HARD_BUDGET);
if (over) console.log('\n  each one has a plain replacement in PLAIN — use it, or add the term to the\n  taught list if the lesson genuinely exists to teach that word (J11).');
else if (findings.length < HARD_BUDGET) console.log('\n  lower HARD_BUDGET to ' + findings.length + ' in scripts/check-plainwords.mjs.');
console.log('');
process.exit(over ? 1 : 0);

// ONE ID, ONE QUOTATION.
//
// A saveable quote is keyed by its `id`, and `userDataStore.saveQuote` dedups on
// that key and nothing else:
//
//     if (state.savedQuotes.some((x) => x.id === q.id)) return state;
//
// So two different quotations sharing an id is not a tidiness problem. The second
// one CANNOT BE COLLECTED — the store silently drops it — and it renders as
// already held, because every surface asks the same question of the same key. A
// reader sees a filled spine on a quotation they have never saved, taps it, and
// nothing happens.
//
// A cinematic script and its own data file SHARING an id is correct and expected:
// that is how the quote on the stage and the quote on the deck card are one
// object. What is checked here is that they are one QUOTATION as well.
//
// This was found the way most things here are found — by counting rather than by
// reading — after a scene quoted Aristotle under an id the deck was already using
// for Zagzebski. Nineteen older lessons have the same defect and they are a
// BUDGET rather than a failure, because changing a shipped quote's id is a
// migration: a reader who has already saved it keeps the old entry, and would be
// able to save the new one alongside it. Fix them when the collection is next
// touched; the budget may only go DOWN.
import fs from 'node:fs';
import path from 'node:path';

// The high-water mark. Lower it whenever one is fixed; never raise it.
const COLLISION_BUDGET = 6;

const files = [];
const walk = (d) => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const f = path.join(d, e.name);
    if (e.isDirectory()) walk(f);
    else if (e.name.endsWith('.ts')) files.push(f);
  }
};
walk('data/branches');
const CIN = 'components/lesson/cinematic';
for (const f of fs.readdirSync(CIN)) if (f.endsWith('Script.ts')) files.push(path.join(CIN, f));

/** Compare the sentence, not the punctuation: a re-cut dash is not a second quote. */
const norm = (t) => t.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80);

const byId = new Map();
for (const f of files) {
  const s = fs.readFileSync(f, 'utf8');
  const re = /id: '(lq-[a-z0-9-]+)'/g;
  let m;
  while ((m = re.exec(s))) {
    // The text follows the id inside the same object literal, under `text:` in a
    // script and `quote:` on a deck card.
    const tail = s.slice(m.index, m.index + 900);
    const t = /(?:text|quote): '((?:[^'\\]|\\.)*)'/.exec(tail);
    if (!t) continue;
    if (!byId.has(m[1])) byId.set(m[1], new Map());
    byId.get(m[1]).set(norm(t[1]), f);
  }
}

const clash = [...byId].filter(([, v]) => v.size > 1);
let bad = 0;
const say = (good, label, detail) => {
  if (!good) bad += 1;
  console.log(`  ${good ? 'ok  ' : 'FAIL'}  ${label}${detail ? `  ${detail}` : ''}`);
};

console.log('\nONE ID, ONE QUOTATION\n');
console.log(`  ${byId.size} saveable quote ids across ${files.length} files`);
console.log('  a script and its own data file sharing an id is the intended pattern\n');

say(
  clash.length <= COLLISION_BUDGET,
  `no more than ${COLLISION_BUDGET} ids carry two different quotations`,
  `${clash.length} do`,
);
if (clash.length < COLLISION_BUDGET) {
  console.log(`        ${clash.length} now — lower COLLISION_BUDGET to ${clash.length} to lock it in`);
}

for (const [id, v] of clash) {
  console.log(`\n  ${id}`);
  for (const [txt, f] of v) console.log(`     ${txt}…\n       ${f}`);
}

console.log(bad ? '\nan id is keying two quotations, and one of them can never be saved.\n' : '\nevery saveable id means one quotation.\n');
process.exit(bad ? 1 : 0);

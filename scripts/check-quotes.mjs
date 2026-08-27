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

// ─────────────────────────────────────────────────────────────────────────────
// AND EVERY QUOTATION MUST KNOW WHICH METAL IT IS STRUCK IN (Q4).
//
// The lesson deck used to draw its own bordered rectangle while every other
// surface used QuotePlate — the struck plate whose colour is the ERA its author
// wrote in. It is the same object on both now, and the reader asked for exactly
// that: a quote from Socrates in a lesson should look like the same quote in his
// profile.
//
// That only holds while the era is DERIVABLE. QuotePlate reads it from
// `philosopherId`, falling back to the quotation's own date. A quote with neither
// gets the structural accent — a grey plate on a shelf where everything else is
// coloured — and nothing about that failure is visible in the source. So it is
// counted here, offline, and it is a ratchet at zero.
const noEra = [];
for (const f of fs.readdirSync(CIN).filter((x) => x.endsWith("Script.ts"))) {
  const src = fs.readFileSync(path.join(CIN, f), "utf8");
  for (const m of src.matchAll(/quote:\s*\{/g)) {
    const open = src.indexOf('{', m.index);
    let d = 0, j = open;
    for (; j < src.length; j++) {
      if (src[j] === '{') d++;
      else if (src[j] === '}') { d--; if (d === 0) break; }
    }
    const block = src.slice(open, j + 1);
    if (/philosopherId\s*:\s*'[^']+'/.test(block)) continue;
    // no thinker — the date has to carry it. Same boundaries eraGroupOfDate uses.
    const era = /era:\s*'((?:[^'\\]|\\.)*)'/.exec(block)?.[1] ?? '';
    if (/\d/.test(era)) continue;
    const who = /author:\s*'((?:[^'\\]|\\.)*)'/.exec(block)?.[1] ?? '?';
    noEra.push(`${f.replace('Script.ts', '')}  ${who}  era='${era}'`);
  }
}
console.log('');
const eraBad = noEra.length > 0;
console.log(`  ${eraBad ? 'FAIL' : 'ok  '}  every lesson quote resolves to an era  ${noEra.length} without one`);
for (const n of noEra.slice(0, 12)) console.log('      ' + n);
if (eraBad) {
  console.log('\n  give it a philosopherId, or put a year in its `era` — otherwise the plate');
  console.log('  is struck in the structural accent and says nothing about who wrote it (Q4).');
}
console.log('');
process.exit(bad || eraBad ? 1 : 0);

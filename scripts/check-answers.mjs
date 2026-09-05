// ─────────────────────────────────────────────────────────────────────────────
// CAN A READER SCORE THE APP WITHOUT READING IT?
//
//   npm run check:answers
//
// They could. Every one of the 130 two-card questions was authored with the correct
// answer written FIRST, and nothing had ever shuffled them — so the true card was
// the left one 130 times out of 130. Not "usually left". Always. A reader who
// noticed could clear every graded beat in the app by tapping the same side, which
// is the entire lesson format defeated by a habit nobody chose and nobody checked.
//
// It went unseen because each script is right on its own: putting the answer first
// is the natural way to write a pair. Only the 130 together are a tell, and nothing
// had ever looked at the 130 together.
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import path from 'node:path';

const DIR = 'components/lesson/cinematic';
const ROUTE = 'app/(app)/branches/[branchSlug]/[pathSlug]/lesson/[lessonId].tsx';

let fails = 0;
const ok = (m, d) => console.log(`  ok    ${m}${d ? `  ${d}` : ''}`);
const bad = (m, d) => { fails++; console.log(`  FAIL  ${m}${d ? `  ${d}` : ''}`); };

// The SHIPPING function, kept in step by being read out of the component rather
// than retyped. A checker carrying its own copy of the shuffle would agree with
// itself forever and prove nothing about what a reader sees.
const src = fs.readFileSync(path.join(DIR, 'ChoiceCards.tsx'), 'utf8');
const body = src.match(/export function swapFor\(seed: string\): boolean \{([\s\S]*?)\n\}/);
if (!body) {
  console.log('\nANSWER BALANCE\n');
  bad('swapFor is not in ChoiceCards.tsx — the shuffle has been renamed or removed');
  process.exit(1);
}
// eslint-disable-next-line no-new-func
const swapFor = new Function('seed', body[1]);

// THE SEED FORMAT COMES FROM THE COMPONENT TOO. This file used to build
// `${id}#${k}` itself, which is one rule written in two places — and on the day the
// player stopped seeding on the beat index, this would have gone on measuring a
// shuffle the app no longer performs and reported it as fine.
const seedBody = src.match(/export function seedFor\([^)]*\): string \{([\s\S]*?)\n\}/);
if (!seedBody) {
  console.log('\nANSWER BALANCE\n');
  bad('seedFor is not in ChoiceCards.tsx — the seed format has been renamed or removed');
  process.exit(1);
}
// eslint-disable-next-line no-new-func
const seedFor = new Function('lessonId', 'cards', seedBody[1]);

const route = fs.readFileSync(ROUTE, 'utf8');
const comps = new Map();
for (const m of route.matchAll(/'([a-z0-9-]+)':\s*([A-Za-z0-9_]+)/g)) comps.set(m[1], m[2]);

const beatsOf = (comp) => {
  const base = comp.replace(/Lesson$/, '');
  const low = `${base[0].toLowerCase()}${base.slice(1)}`;
  for (const p of [path.join(DIR, `${low}Script.ts`), path.join(DIR, `${comp}.tsx`)]) {
    if (!fs.existsSync(p)) continue;
    const b = fs.readFileSync(p, 'utf8').match(/BEATS[^=]*=\s*\[([\s\S]*)\n\];/);
    if (b) return { chunks: b[1].split(/\n\s{2}\},?\s*\n?/).filter((c) => /\S/.test(c)), file: p };
  }
  return null;
};

console.log('\nANSWER BALANCE\n');

let authoredFirst = 0, shownLeft = 0, total = 0;
const sided = [];
const oneSided = [];

for (const [id, comp] of comps) {
  const found = beatsOf(comp);
  if (!found) continue;
  let lessonLeft = 0, lessonTotal = 0;
  found.chunks.forEach((ch, k) => {
    const m = ch.match(/cards:\s*\[([\s\S]*?)\]\s*,/);
    if (!m) return;
    const correct = [...m[1].matchAll(/correct:\s*(true|false)/g)].map((x) => x[1] === 'true');
    if (correct.length !== 2) return;
    // EXACTLY ONE TRUE CARD. Two makes both taps right and none makes the question
    // unanswerable, and either would read to a player as the app being broken.
    if (correct.filter(Boolean).length !== 1) {
      bad(`${id} beat ${k}: ${correct.filter(Boolean).length} correct cards, needs exactly 1`);
    }
    total++;
    lessonTotal++;
    if (correct[0]) authoredFirst++;
    // Seeded exactly as the player seeds it — on the question's own first card,
    // not on where the beat happens to sit.
    const texts = [...m[1].matchAll(/text:\s*'((?:[^'\\]|\\.)*)'/g)].map((x) => ({ text: x[1] }));
    const trueIsLeft = swapFor(seedFor(id, texts)) ? correct[1] : correct[0];
    if (trueIsLeft) { shownLeft++; lessonLeft++; }

    // NO EXPLANATION MAY NAME A SIDE. It was safe to say "the left card" while the
    // order was fixed; now the order is decided at run time, so a sentence like that
    // is wrong for half the readers who see it — and wrong in the way J9 records,
    // where the text points confidently at something that is not there.
    //
    // THE DEFINITE ARTICLE IS DOING REAL WORK IN THIS PATTERN. Without it the rule
    // fired on political-political-8 — "the identical crates … still LEFT ONE person
    // staring at wood" — where `left` is a verb and `one` is a person. Naming a
    // position takes a determiner ("the left card"); the bare words are ordinary
    // English and appear all over the explanations.
    const ex = ch.match(/explain:\s*'((?:[^'\\]|\\.)*)'/);
    if (ex && /\bthe\s+(left|right|first|second)\s+(card|one|option|box|answer)\b/i.test(ex[1])) {
      sided.push(`${id} beat ${k}: "${ex[1].slice(0, 60)}…"`);
    }
  });
  // A lesson whose every question lands on one side is still a pattern, even if the
  // app as a whole is even — a reader plays a LESSON, not a distribution.
  if (lessonTotal >= 3 && (lessonLeft === 0 || lessonLeft === lessonTotal)) {
    oneSided.push(`${id} (${lessonLeft}/${lessonTotal} left)`);
  }
}

if (!total) { bad('no two-card questions found — has the format changed?'); }
else {
  const pct = (100 * shownLeft) / total;
  console.log(`  ${total} two-card questions · authored with the answer first: ${authoredFirst}`);
  if (pct >= 35 && pct <= 65) {
    ok(`the true card shows on the left ${pct.toFixed(0)}% of the time`,
      `${shownLeft} left · ${total - shownLeft} right`);
  } else {
    bad(`the true card shows on the left ${pct.toFixed(0)}% of the time`, 'a reader can guess by position');
  }
  // The authored side is allowed to be lopsided — it is the SHOWN side that matters,
  // and saying so stops anyone "fixing" 130 scripts by hand for no benefit.
  if (authoredFirst > total * 0.9) {
    ok('the scripts are still lopsided, and that is fine',
      'the shuffle is what a reader sees; rewriting the scripts would buy nothing');
  }
}

if (oneSided.length) bad(`${oneSided.length} lesson(s) put every answer on one side`, oneSided.slice(0, 4).join(', '));
else ok('no lesson lands every one of its answers on the same side');

if (sided.length) {
  bad(`${sided.length} explanation(s) name a side, which the shuffle makes wrong half the time`);
  for (const s of sided.slice(0, 6)) console.log(`        ${s}`);
} else ok('no explanation names a side (J9)');

// ── AND EVERY OTHER CONTROL WITH SLOTS, WHICH NOTHING WAS LOOKING AT ─────────
//
// This file was written the day all 130 two-card questions turned out to put the
// true card on the left, and for its whole life it measured ONLY the deck. The
// lever and the pad carried the identical fault the entire time, worse and
// unwatched: the lever's answer was its LAST stop in 35 of 50 questions (70%) and
// the pad's was its FIRST quadrant in 15 of 22 (68%). Nothing failed, because
// nothing looked — the same shape as every other blind spot §21 records.
//
// Both are retired and their questions now run through `orderFor`, read out of
// ChoiceCards below rather than reimplemented here. What this adds is the
// MEASUREMENT, so the next control with slots cannot repeat it.
const orderSrc = src.match(/export function orderFor\([^)]*\): number\[\] \{([\s\S]*?)\n\}/);
if (!orderSrc) {
  bad('orderFor is not in ChoiceCards.tsx — the multi-slot shuffle has been renamed or removed');
} else {
  // eslint-disable-next-line no-new-func
  const orderFor = new Function('seed', 'n', orderSrc[1]);
  const slotted = { poll: [], sort: [] };
  for (const [id, comp] of comps) {
    const found = beatsOf(comp);
    if (!found) continue;
    for (const ch of found.chunks) {
      for (const kind of ['poll', 'sort']) {
        if (!new RegExp(`\\n\\s{6}${kind}:`).test(ch)) continue;
        const its = [...ch.matchAll(/\{[^{}]*?reads:[^{}]*?\}/g)].map((x) => x[0]);
        const authored = its.findIndex((x) => /correct:\s*true/.test(x));
        if (authored < 0 || its.length < 2) continue;
        // Seeded exactly as the player seeds it — on the question's own words,
        // which for a poll is its first position and for a sort is its chip.
        const firstRe = /reads:\s*'((?:[^'\\]|\\.)*)'/;
        const chipRe = /chip:\s*'((?:[^'\\]|\\.)*)'/;
        const first = kind === 'poll'
          ? (its[0].match(firstRe) || [, ''])[1]
          : (ch.match(chipRe) || [, ''])[1];
        const shown = orderFor(seedFor(id, [{ text: first }]), its.length);
        slotted[kind].push(shown.indexOf(authored) / (its.length - 1));
      }
    }
  }
  for (const kind of ['poll', 'sort']) {
    const xs = slotted[kind];
    if (!xs.length) continue;
    const mean = xs.reduce((a, b) => a + b, 0) / xs.length;
    // 0 = always the first slot, 1 = always the last. A control whose answer
    // reliably sits at one end is one a reader can score without reading.
    if (mean >= 0.3 && mean <= 0.7) {
      ok(`${kind}: the answer sits ${(mean * 100).toFixed(0)}% of the way along, on average`,
        `${xs.length} questions · no end to guess at`);
    } else {
      bad(`${kind}: the answer sits ${(mean * 100).toFixed(0)}% of the way along, on average`,
        `${xs.length} questions · a reader can guess by position`);
    }
  }
}

console.log(fails ? `\n${fails} failing.\n` : '\nall clear.\n');
process.exit(fails ? 1 : 0);

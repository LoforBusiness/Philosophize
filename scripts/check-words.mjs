// THE WORDS THE READER READS — group J of docs/LESSON_RULES.md.
//
// Every other check in this repo guards the PICTURE. Nothing guarded the prose,
// which is the thing a reader actually spends the lesson doing, and a reader
// said so: "it is sometimes difficult to understand because of the wording, and
// sometimes it is just too much to read."
//
// ── WHAT THE MEASUREMENT FOUND, BEFORE ANY RULE WAS WRITTEN ─────────────────
//
// The app's own voice is good and did not need fixing. Across 839 pieces of
// reader-facing text the median narration beat is 22 words at 9 words a sentence
// with 9% long words — which is roughly how a person explains something out loud.
//
// The damage is 69 sentences over 20 words, and THE FIRST THEORY ABOUT THEM WAS
// WRONG — which is worth recording, because it is the obvious theory. They look
// like lifted quotations: Nagel, Singer, Mill, Danto, Carlson and Burke really do
// appear verbatim in the narration slot. So the guess was "the app's voice is
// fine, somebody else's prose is not."
//
// Measured, that does not survive. Beats carrying a `cite` read BETTER than beats
// without one — 11 words a sentence against 11.5, 8% long words against 11%.
// Attribution was never the problem.
//
// What the 69 actually share is a DEVICE: 48 contain an em-dash, 14 a colon, 23
// two or more commas, and only 5 are plainly long with nothing joining them. The
// habit is to bolt a second complete thought onto the first with a dash instead
// of ending the sentence.
//
// ── SO THE RULES ARE ABOUT SENTENCES, NOT ABOUT VOCABULARY ──────────────────
//
// A long word is usually fine: "consequentialism" IS the lesson, not a failure.
// A long sentence is where a reader loses the thread — and in almost every case
// here the fix is a full stop where a dash is, not a rewrite.
//
// `quote` blocks are EXEMPT from all of this. That is what they are for: a
// primary source, framed as a quotation, attributed, saveable. §13 wants the
// reader to see the sentence Descartes actually wrote — in the quote card, where
// it is announced, not in the narration where it is disguised as the app.
//
// Run: node scripts/check-words.mjs
import fs from 'node:fs';
import path from 'node:path';

const CIN = path.join(process.cwd(), 'components', 'lesson', 'cinematic');

// ── the numbers, and where each came from ───────────────────────────────────
//
// J1  A SENTENCE THE READER MUST FOLLOW: 20 words. The median is 11 and the app's
//     own writing rarely reaches 20 unless a dash has joined two thoughts.
const MAX_SENTENCE = 20;
// J2  ONE BEAT OF NARRATION: 45 words. The median is 22 and the longest honest
//     beat is 44, so this bites only on something genuinely overstuffed.
const MAX_BEAT = 45;
// J3  AN EXPLANATION AFTER AN ANSWER: 50 words. It is the longest thing anybody
//     reads (median 34, p90 44) and it arrives at the moment attention is lowest,
//     right after the reader has already committed to a choice.
const MAX_EXPLAIN = 50;
// J4  LONG WORDS: 35% of a beat. Deliberately loose, and loosened once already.
//     At 30 it caught exactly one beat — "Philosophy means something completely
//     different by the word. An argument is a machine with parts." — which is
//     the plainest sentence in that lesson and carries the concrete image the
//     rule exists to protect. Every long word in it is load-bearing. A checker
//     that would have had THAT reworded is measuring the wrong thing, so the
//     number moved rather than the prose. It now catches only a beat with no
//     concrete noun in it at all.
const MAX_HARD_PCT = 35;

// ── AND THE SECOND MEASUREMENT, WHICH FOUND SOMETHING WORSE THAN LENGTH ─────
//
// Length was never the whole complaint. Read all 102 lessons end to end and there
// are plainly TWO VOICES in here: one that stages an idea and walks you through it,
// and one that reads like an encyclopaedia entry — names stacked three to a
// sentence, Greek dropped in untranslated, questions that ask what you remember
// rather than what you can work out.
//
// The bad voice tracks WHERE THE READER MEETS IT, and it is at the front door:
//
//              names crammed mid-sentence   trivia-recall questions
//   lessons 1-9        0.56 / beat                20 of 110
//   lessons 10+        0.16 / beat                 4 of 96
//
// Three and a half times the name density and four and a half times the trivia, in
// the lessons EVERY reader sees first. The cause is heritage: the low numbers were
// written as card decks and converted, so they kept a deck's voice, while the high
// numbers were authored for a stage. J6-J8 are that difference, made countable.
//
// J6  NAMES CRAMMED MID-SENTENCE: at most 2 in one beat. A name that starts its own
//     sentence is free — "Nozick reads only that strip" gives the man a clause and a
//     verb. What costs is three surnames riding along inside other clauses, which is
//     how "Plato and Aristotle: art is mimesis. Later Tolstoy and Collingwood: art is
//     the expression of feeling" got four names into 22 words and taught none of them.
//
//     A BUDGET, NOT A ZERO, AND FOR AN HONEST REASON: the count cannot tell a person
//     from a place. Of the four beats over the line today, three are false positives —
//     "in Greece, in India, in China", "Most Greeks eat olives; Socrates is Greek", and
//     "a Vermeer ... van Meegeren ... Europe" — and the fourth gives each of its three
//     thinkers a clause and a verb, which is the good pattern. Getting to a true zero
//     needs a name list nobody will maintain, so this is a high-water mark instead: it
//     may only fall, and a NEW roll-call beat pushes it over and fails the build.
const MAX_NAMES_MID = 2;
const NAME_STUFF_BUDGET = 4;
// J8  RECALL-SHAPED PROMPTS: a budget, falling. "Who said 'knowledge itself is power'?"
//     is a memory test of the previous slide, not a question about the idea.
const RECALL_BUDGET = 1;
// J9  AN EXPLANATION POINTS AT SOMETHING THE READER CAN SEE. This one is a zero, and
//     it is here because 27 explanations failed it silently. They said "the trap is B"
//     and "C over-corrects" and "Not B or D" — written when questions had four lettered
//     options, and left behind when the two-card answer replaced them. The reader now
//     sees two unlabelled cards, so every one of those letters named nothing at all.
//     Nothing failed, because a stale letter still typechecks and still renders.

// J1 IS A RATCHET, NOT A ZERO, and only J1. 69 sentences were over on the day the
// rule was written, and each is a judgement — a dash is usually two sentences, but
// sometimes it introduces an appositive and splitting it makes a fragment. So this
// is a high-water mark that may only ever go DOWN, exactly like CARD_BUDGET and
// MC_BUDGET. Writing a new over-long sentence raises it and fails the build.
// The other three are zeroes: they were nearly clean already.
const LONG_SENTENCE_BUDGET = 29;

let fails = 0;
const ok = (label, pass, detail) => {
  if (!pass) fails++;
  console.log(`  ${pass ? 'ok  ' : 'FAIL'}  ${label}${detail ? '  ' + detail : ''}`);
};

const SYL = (w) => {
  const s = w.toLowerCase().replace(/[^a-z]/g, '');
  if (!s) return 0;
  const g = s.replace(/e$/, '').match(/[aeiouy]+/g);
  return Math.max(1, g ? g.length : 1);
};
const wordsOf = (s) => s.trim().split(/\s+/).filter(Boolean);
/** Sentences, with the abbreviations that would otherwise split one in two. */
const sentencesOf = (s) => s
  .replace(/\b(Mr|Mrs|Ms|Dr|St|e\.g|i\.e|vs|c)\./g, '$1<>')
  .split(/(?<=[.!?])["')\]]?\s+/)
  .map((x) => x.replace(/<>/g, '.'))
  .filter((x) => wordsOf(x).length > 1);

const beatsOf = (src) => src.split('\n  {\n').slice(1).map((c) => c.split('\n  }')[0]);
const STR_S = /'((?:[^'\\]|\\.)*)'/;
const STR_D = /"((?:[^"\\]|\\.)*)"/;
const field = (blk, key) => {
  const m = new RegExp(`^\\s*${key}:\\s*(?:$\\s*)?(?=['"])`, 'm').exec(blk);
  if (!m) return null;
  const rest = blk.slice(m.index + m[0].length);
  const q = STR_S.exec(rest.startsWith("'") ? rest : '') || STR_D.exec(rest.startsWith('"') ? rest : '');
  return q ? q[1].replace(/\\'/g, "'").replace(/\\"/g, '"') : null;
};

/**
 * Names carried along INSIDE a sentence, which is the costly kind. A capitalised
 * word opening its own sentence is skipped deliberately (J6) — that is a thinker
 * being given a clause of their own, which is the pattern that reads well.
 */
const namesMidSentence = (t) => {
  const out = [];
  // Split after a full stop even when a closing quote follows it, or `Only` in
  // `"...he eats olives." Only probable` reads as a name riding mid-sentence.
  for (const s of t.split(/(?<=[.!?:—]["”')\]]?)\s+/)) {
    const w = wordsOf(s);
    let run = null;
    for (let i = 1; i < w.length; i++) {
      const raw = w[i].replace(/^[“"'(]+/, '').replace(/[.,;:!?”"')]+$/, '');
      // ALL-CAPS is the app's emphasis (TRUE · BELIEVE · JUSTIFICATION), not a person.
      const isName = /^[A-Z][a-z'’-]{2,}$/.test(raw);
      if (isName) run = run ? `${run} ${raw}` : raw;
      else if (run) { out.push(run); run = null; }
    }
    if (run) out.push(run);
  }
  return out;   // "Bernard Williams and Thomas Nagel" → 2 people, not 4 words
};

/**
 * A prompt that asks what you REMEMBER a named thinker said, rather than what you can
 * work out from the stage. The distinction is the SUBJECT: a recall prompt's subject is
 * a person or a named work. "Which single fact proves 'All cats are black' false?" opens
 * the same way and is real reasoning, so a bare What/Which opener proves nothing.
 */
const RECALL = [
  /^According to [A-Z]/,
  /^Who (said|wrote|held|called|argued)\b/,
  /^(What|Which|Why|How) did [A-Z]/,
  /^What did the [A-Z]/,
  /^For [A-Z][a-z]+,/,
  /^What (is|was) [A-Z][a-z]+(’|')s\b/,
  /^What (is|was) the .{0,40}\bof [A-Z][a-z]+(’|')s\b/,
  /^In (the )?[A-Z][a-z]+,/,
  /^On [A-Z][a-z]+(’|')s\b.{0,40}\bwhat\b/i,
];
const isRecall = (p) => !/\bTap\b/i.test(p) && RECALL.some((r) => r.test(p));

/**
 * A lettered option reference — "the trap is B", "C over-corrects", "Not B or D".
 * Only stale when the beat renders two unlabelled `cards`; a scene that genuinely
 * draws a plate marked A (epistemology9's maps) is entitled to say so.
 */
const OPTION_LETTER = /(?:^|[^A-Za-z])([ABCD])(?=\s+(?:is|tempts|over-|fails|explains|goes|cannot|was|and|of)|[,:.]\s)/;

const longSent = [], fatBeat = [], fatExplain = [], dense = [], nameStuffed = [], recalls = [], staleLetter = [];
let beats = 0, texts = 0, explains = 0, prompts = 0;

for (const f of fs.readdirSync(CIN).filter((n) => n.endsWith('Script.ts')).sort()) {
  const src = fs.readFileSync(path.join(CIN, f), 'utf8');
  const name = f.replace('Script.ts', '');
  for (const b of beatsOf(src)) {
    beats++;
    // A beat holding a `quote` is exempt: the quotation is the point, it is
    // attributed, and the reader is told it is somebody's words.
    const isQuote = /^\s*quote:\s*\{/m.test(b);

    const text = field(b, 'text');
    if (text && !isQuote) {
      texts++;
      const w = wordsOf(text);
      for (const s of sentencesOf(text)) {
        const n = wordsOf(s).length;
        if (n > MAX_SENTENCE) longSent.push({ name, n, s });
      }
      if (w.length > MAX_BEAT) fatBeat.push({ name, n: w.length, s: text });
      const hard = w.filter((x) => SYL(x) >= 3).length / Math.max(1, w.length) * 100;
      if (hard > MAX_HARD_PCT && w.length >= 12) dense.push({ name, pct: hard, s: text });
      const names = namesMidSentence(text);
      if (names.length > MAX_NAMES_MID) nameStuffed.push({ name, n: names.length, names, s: text });
    }

    const ex = field(b, 'explain');
    if (ex) {
      explains++;
      const n = wordsOf(ex).length;
      if (n > MAX_EXPLAIN) fatExplain.push({ name, n, s: ex });
      const stale = OPTION_LETTER.exec(ex);
      if (stale && /\n\s*cards:\s*\[/.test(b)) staleLetter.push({ name, letter: stale[1], s: ex });
    }

    const p = field(b, 'prompt');
    if (p) {
      prompts++;
      if (isRecall(p)) recalls.push({ name, s: p });
    }
  }
}

console.log('\nTHE WORDS THE READER READS\n');
console.log(`  ${beats} beats · ${texts} pieces of narration · ${explains} explanations\n`);

ok(`no MORE than ${LONG_SENTENCE_BUDGET} sentences past ${MAX_SENTENCE} words (J1)`,
  longSent.length <= LONG_SENTENCE_BUDGET,
  longSent.length
    ? `${longSent.length} over, budget ${LONG_SENTENCE_BUDGET}` +
      (longSent.length < LONG_SENTENCE_BUDGET ? ` — lower it to ${longSent.length}` : '') +
      ` · worst ${Math.max(...longSent.map((x) => x.n))}w in ${longSent.slice().sort((a, b) => b.n - a.n)[0].name}`
    : 'the longest sentence a reader meets is under twenty words');
ok(`no beat runs past ${MAX_BEAT} words (J2)`, fatBeat.length === 0,
  fatBeat.length ? `${fatBeat.length} over — ${fatBeat.map((x) => `${x.name} ${x.n}w`).slice(0, 4).join(', ')}` : 'no beat is a paragraph');
ok(`no explanation runs past ${MAX_EXPLAIN} words (J3)`, fatExplain.length === 0,
  fatExplain.length ? `${fatExplain.length} over — ${fatExplain.map((x) => `${x.name} ${x.n}w`).slice(0, 4).join(', ')}` : 'the payoff stays readable');
ok(`no beat is over ${MAX_HARD_PCT}% long words (J4)`, dense.length === 0,
  dense.length ? `${dense.length} over — ${dense.map((x) => `${x.name} ${x.pct.toFixed(0)}%`).slice(0, 4).join(', ')}` : 'nothing is wall-to-wall abstraction');
ok(`no MORE than ${NAME_STUFF_BUDGET} beats cram over ${MAX_NAMES_MID} names mid-sentence (J6)`,
  nameStuffed.length <= NAME_STUFF_BUDGET,
  nameStuffed.length
    ? `${nameStuffed.length}, budget ${NAME_STUFF_BUDGET}` +
      (nameStuffed.length < NAME_STUFF_BUDGET ? ` — lower it to ${nameStuffed.length}` : '') +
      ` · ${nameStuffed.map((x) => x.name).slice(0, 4).join(', ')}`
    : 'no beat is a roll-call');
ok(`no MORE than ${RECALL_BUDGET} prompts ask what you remember (J8)`,
  recalls.length <= RECALL_BUDGET,
  recalls.length
    ? `${recalls.length} of ${prompts}, budget ${RECALL_BUDGET}` +
      (recalls.length < RECALL_BUDGET ? ` — lower it to ${recalls.length}` : '')
    : 'every question asks what you can work out');
ok('no explanation points at a lettered option that is not there (J9)', staleLetter.length === 0,
  staleLetter.length
    ? `${staleLetter.length} stale — ${staleLetter.map((x) => `${x.name} [${x.letter}]`).slice(0, 5).join(', ')}`
    : 'every explanation points at something on the stage');

if (longSent.length) {
  console.log('\n  the sentences to fix, longest first (a dash joining two thoughts wants a full stop):');
  longSent.sort((a, b) => b.n - a.n).slice(0, 12)
    .forEach((x) => console.log(`    ${x.name.padEnd(15)} ${String(x.n).padStart(3)}w  "${x.s.slice(0, 96)}"`));
}
if (dense.length) {
  console.log('\n  the beats that are all abstraction:');
  dense.sort((a, b) => b.pct - a.pct).slice(0, 6)
    .forEach((x) => console.log(`    ${x.name.padEnd(15)} ${x.pct.toFixed(0)}%  "${x.s.slice(0, 110)}"`));
}
if (staleLetter.length) {
  console.log('\n  explanations naming an option the reader cannot see (say WHICH CARD instead):');
  staleLetter.slice(0, 8).forEach((x) => console.log(`    ${x.name.padEnd(15)} [${x.letter}]  "${x.s.slice(0, 86)}"`));
}
if (nameStuffed.length) {
  console.log('\n  the beats that are a roll-call (give a thinker their own sentence, or cut them):');
  nameStuffed.sort((a, b) => b.n - a.n).slice(0, 6)
    .forEach((x) => console.log(`    ${x.name.padEnd(15)} ${x.names.join(' · ')}\n      "${x.s.slice(0, 104)}"`));
}
if (recalls.length) {
  console.log('\n  the questions that test memory rather than understanding:');
  recalls.slice(0, 8).forEach((x) => console.log(`    ${x.name.padEnd(15)} "${x.s.slice(0, 88)}"`));
}
if (fatExplain.length) {
  console.log('\n  the explanations to trim:');
  fatExplain.sort((a, b) => b.n - a.n).slice(0, 8)
    .forEach((x) => console.log(`    ${x.name.padEnd(15)} ${String(x.n).padStart(3)}w  "${x.s.slice(0, 90)}"`));
}

console.log(fails ? `\n${fails} problem(s).\n` : '\nall clear.\n');
process.exit(fails ? 1 : 0);

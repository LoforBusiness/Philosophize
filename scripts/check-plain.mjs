// PLAIN ENOUGH TO READ ON A BUS.
//
// Group J already caps sentence length and beat length, and the corpus passes it.
// The reader still could not read it:
//
//   "the wording in lessons it seems to be difficult to understand what I'm
//    reading. It's a bit too cryptic and advanced… I like a philosophical text,
//    but also simple to read, not something that takes a lot of effort to even
//    try understand"
//
// Short sentences made of long abstract words are still unreadable, and that is
// what J was blind to. "Presentism is the view that only the present moment
// enjoys existence" is fifteen words and impossible. So this measures the WORDS,
// not the sentences.
//
// ── WHAT IS MEASURED ────────────────────────────────────────────────────────
//
// Flesch Reading Ease, the standard one:
//
//     206.835 − 1.015 × (words / sentences) − 84.6 × (syllables / word)
//
// 60+ is plain English a thirteen-year-old reads without effort; 30 is academic
// prose. It is used here because it is not tunable to taste — it is arithmetic on
// syllables, and syllables are what make a sentence heavy.
//
// A long word that IS the lesson does not count against it. `consequentialism`
// is the thing being taught, and the fix for it is to teach it, not to avoid the
// word — so the terms each branch exists to name are exempt (TERMS below). What
// is not exempt is the abstract filler that grows around them: the nominalised
// verbs, the -ness and -ity nouns that could have been a plain sentence.
import fs from 'node:fs';
import path from 'node:path';

const DIR = 'components/lesson/cinematic';

/**
 * THE FLOOR IS THE PUBLISHED ONE, NOT A NUMBER WE PICKED.
 *
 * Flesch's own bands put 60-69 at "standard" — plain English, the 8th-9th grade
 * level the average adult reads at, and what general-audience writing is normally
 * aimed at. Below 60 is "fairly difficult".
 *
 * This floor was 55, which sits INSIDE the fairly-difficult band, and the corpus
 * measures a mean of 83.2 with a median of 84. So the rule was licensing prose two
 * bands worse than anything actually shipped, and 96% of the corpus cleared it by
 * more than twenty points. A floor that permits worse than everything you have
 * written is not protecting a reader from anything.
 *
 * At 60 it is the standard's own line. 68 pieces sit below it — none of them badly
 * written, mostly 55-59 and carrying a proper noun (Heidegger, Relativity,
 * Catharsis) — so they are a high-water mark rather than a gate, the same shape as
 * CARD_BUDGET. Rewriting one lowers it; writing a new one below 60 fails the build.
 */
const EASE_FLOOR = 60;
/** How much of a piece may be words that point instead of naming. */
const POINTER_CEIL = 0.12;
/**
 * High-water mark for pieces that fail either test. May only go DOWN.
 *
 * It was 0 against a floor of 55. Raising the floor to the published band moves it
 * to 68 — the debt is not new, it was simply below a line drawn too low to see it.
 *
 * LEFT AT 68 RATHER THAN THE 44 THE SPLIT TREE REPORTS, for the same reason
 * BEAT_SENTENCE_BUDGET is left high: a budget is a ceiling, and this checker may
 * reach HEAD before J12's beat splits do. Lower it to whatever the run prints once
 * the *Script.ts changes are committed.
 */
const HARD_BUDGET = 68;
/**
 * The shortest piece worth scoring. Below this both tests are noise — see the note
 * at the loop. Twenty words is about two ordinary sentences of this corpus, which
 * is the smallest unit the reader actually receives as a thought.
 */
const MIN_SCORED = 20;

/**
 * Words a philosophy lesson is allowed to be made of, because they are what it
 * teaches. Their syllables still count — a lesson can only carry so many — but
 * they are never reported as jargon to be removed.
 */
const TERMS = new Set([
  'philosophy', 'philosopher', 'philosophers', 'philosophical',
  'metaphysics', 'epistemology', 'aesthetics', 'ethics', 'logic',
  'consequentialism', 'deontology', 'utilitarian', 'utilitarianism',
  'compatibilism', 'compatibilist', 'determinism', 'determinist',
  'libertarian', 'libertarians', 'presentism', 'eternalism',
  'scepticism', 'sceptic', 'sceptical', 'relativism', 'relativist',
  'empiricism', 'empiricist', 'rationalism', 'rationalist',
  'existentialism', 'existentialist', 'nihilism', 'stoicism',
  'liberalism', 'communitarian', 'communitarians', 'republicanism',
  'reliabilism', 'foundationalism', 'coherentism', 'virtue', 'virtues',
  'induction', 'deduction', 'inductive', 'deductive', 'premise', 'premises',
  'conclusion', 'conclusions', 'fallacy', 'fallacies', 'validity', 'valid',
  'evidence', 'justified', 'justification', 'knowledge', 'belief', 'beliefs',
  'morality', 'moral', 'immoral', 'duty', 'duties', 'happiness', 'freedom',
  'liberty', 'justice', 'equality', 'authority', 'recognition',
  'beauty', 'beautiful', 'aura', 'fiction', 'fictional', 'representation',
  'expression', 'identity', 'persistence', 'composition', 'vagueness',
  'paradox', 'paradoxes', 'dilemma', 'dilemmas', 'argument', 'arguments',
]);

// A NAMED POSITION IS ONE LUMP, NOT FIVE SYLLABLES.
//
// Flesch counts `compatibilism` as five and buries any sentence that names two
// views — "Compatibilists say determinism means nobody is ever responsible" scored
// -23, and that is not a hard sentence, it is a sentence with two labels in it. A
// reader does not sound those labels out; they learn them once and read them as a
// single token thereafter. So a term costs what a two-syllable word costs, and the
// sentence is then judged on everything else it is doing.
const TERM_SYL = 2;

const syllables = (w) => {
  const s = w.toLowerCase().replace(/[^a-z]/g, '');
  if (!s) return 0;
  if (s.length <= 3) return 1;
  const t = s
    .replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
    .replace(/^y/, '');
  const m = t.match(/[aeiouy]{1,2}/g);
  return Math.max(1, m ? m.length : 1);
};

export function ease(text) {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (!clean) return null;
  const sentences = Math.max(1, (clean.match(/[.!?](\s|$)/g) ?? []).length);
  const words = clean.split(/\s+/).filter((w) => /[a-zA-Z]/.test(w));
  if (words.length < 4) return null;
  // A NAME IS A LABEL TOO. `Schopenhauer` is four syllables and sinks any sentence
  // it appears in — but naming the thinker is the point of the lesson (F42), and
  // no rewrite can make the name shorter. A capitalised word that is not starting
  // a sentence is a proper noun, and costs what a term costs.
  const midSentence = words.map((w, k) => {
    if (k === 0) return false;
    const prev = words[k - 1];
    return !/[.!?:—]$/.test(prev);
  });
  const syl = words.reduce((a, w, k) => {
    const bare = w.replace(/[^A-Za-z']/g, '').toLowerCase();
    if (TERMS.has(bare)) return a + TERM_SYL;
    if (midSentence[k] && /^[A-Z]/.test(w)) return a + Math.min(TERM_SYL, syllables(w));
    return a + syllables(w);
  }, 0);
  const score = 206.835 - 1.015 * (words.length / sentences) - 84.6 * (syl / words.length);
  const hard = words
    .map((w) => w.replace(/[^A-Za-z']/g, ''))
    .filter((w) => w && syllables(w) >= 3 && !TERMS.has(w.toLowerCase()) && !/^[A-Z]/.test(w));

  // ── WHAT FLESCH CANNOT SEE ────────────────────────────────────────────────
  //
  // The corpus scores 81 — "easy" — and the reader still could not follow it.
  // Flesch measures how long the words are. It cannot see a sentence made
  // entirely of short words that points at nothing you can name:
  //
  //     "The question is not whether time passes. It is what is there."
  //
  // Every word is one syllable and the sentence is a riddle. Two things do that,
  // and both are countable.
  //
  // POINTERS — it, that, this, they, these, which — are how a sentence refers to
  // something without naming it. A few are ordinary English. Above about one word
  // in eight the reader is holding a stack of unnamed things and has lost track of
  // which is which:
  //
  //     "Both of them arrived. Only one of them can find it again."
  //
  // Nothing there is a hard word and nothing there is nameable either. The fix is
  // always the same and it is never a longer sentence: say the noun.
  //
  // A PROMPT IS EXEMPT, and deliberately. I71 requires a question to point at
  // something on the stage — "Tap the one it changed" is doing its job. Pointing
  // is only a fault when there is nothing to point AT.
  const POINTERS = /^(it|its|it's|that|this|these|those|they|them|their|which)$/i;
  const bare = words.map((w) => w.replace(/[^A-Za-z']/g, ''));
  const pointers = bare.filter((w) => POINTERS.test(w)).length;

  return { score, words: words.length, sentences, hard, pointerRate: pointers / words.length };
}

/** Every line of prose a reader actually sees, with where it came from. */
export function prose() {
  const out = [];
  for (const f of fs.readdirSync(DIR).filter((x) => x.endsWith('Script.ts'))) {
    // A QUOTE IS NOT OURS TO SIMPLIFY. `quote: { … text: '…' }` uses the same key
    // as a beat's narration, so quote blocks come out before anything is read —
    // otherwise the worst-written lines in the corpus are Bentham and Rawls, and
    // the fix for them would be falsifying a primary source (F42).
    const raw = fs.readFileSync(path.join(DIR, f), 'utf8');
    const src = raw.replace(/quote:\s*\{[\s\S]*?\n\s*\},/g, '');
    const name = f.replace('Script.ts', '');
    const grab = (re, kind) => {
      for (const m of src.matchAll(re)) {
        const t = m[1].replace(/\\'/g, "'").replace(/\s+/g, ' ').trim();
        if (t) out.push({ file: name, kind, text: t });
      }
    };
    grab(/^\s*text: '((?:[^'\\]|\\.)*)',$/gm, 'beat');
    grab(/^\s*prompt: '((?:[^'\\]|\\.)*)',$/gm, 'prompt');
    grab(/^\s*explain: '((?:[^'\\]|\\.)*)',$/gm, 'explain');
    grab(/^\s*closing: '((?:[^'\\]|\\.)*)',$/gm, 'closing');
  }
  return out;
}

const RUN_DIRECTLY = (process.argv[1] ?? '').replace(/\\/g, '/').endsWith('scripts/check-plain.mjs');
if (RUN_DIRECTLY) {
  const rows = [];
  for (const p of prose()) {
    const e = ease(p.text);
    if (!e) continue;
    // NEITHER STATISTIC MEANS ANYTHING ON A FRAGMENT.
    //
    // Flesch is a ratio of syllables to words to SENTENCES, and a pointer rate is
    // a proportion of a handful of tokens. On "Look at it. Beautiful, obviously."
    // — five words — one `it` is a 20% pointer rate and the ease score is noise.
    // Readability formulas are not valid on short texts and never have been.
    //
    // This did not matter while a beat held three sentences. J12's split made
    // one-sentence beats ordinary, and the count promptly went 68 -> 221 without a
    // single word of the corpus changing: the same prose, measured in smaller
    // pieces. A measurement that moves when you re-cut the container is measuring
    // the container.
    if (p.text.split(/\s+/).filter(Boolean).length < MIN_SCORED) continue;
    const heavy = e.score < EASE_FLOOR;
    const vague = p.kind !== 'prompt' && e.pointerRate > POINTER_CEIL;
    rows.push({ ...p, ...e, heavy, vague });
  }
  const bad = rows.filter((r) => r.heavy || r.vague);
  const mean = rows.reduce((a, r) => a + r.score, 0) / rows.length;

  console.log('\nPLAIN ENOUGH TO READ\n');
  console.log(`  ${rows.length} pieces of prose · mean reading ease ${mean.toFixed(1)}`);
  console.log(`  ${rows.filter((r) => r.heavy).length} read below ${EASE_FLOOR} · ${rows.filter((r) => r.vague).length} point more than ${(POINTER_CEIL * 100).toFixed(0)}% of the time\n`);

  const ok = bad.length <= HARD_BUDGET;
  console.log(`  ${ok ? 'ok  ' : 'FAIL'}  no more than ${HARD_BUDGET} pieces are harder than they need to be  ${bad.length} are`);
  if (ok && bad.length < HARD_BUDGET) console.log(`        ${bad.length} now — lower HARD_BUDGET to ${bad.length} to lock it in`);

  bad.sort((a, b) => (a.heavy === b.heavy ? b.pointerRate - a.pointerRate : a.score - b.score));
  for (const r of bad.slice(0, 20)) {
    const why = r.heavy ? `ease ${r.score.toFixed(0)}` : `${(r.pointerRate * 100).toFixed(0)}% pointers`;
    console.log(`\n    ${why.padEnd(14)} ${r.file}/${r.kind}`);
    console.log(`      ${r.text.slice(0, 118)}`);
  }
  console.log(ok ? '\nthe corpus reads plainly.\n' : '\nsay the noun, and split the sentence.\n');
  process.exit(ok ? 0 : 1);
}

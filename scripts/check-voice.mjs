// GROUP V — THE NARRATOR IS NOT IN THE ROOM.
//
//   node scripts/check-voice.mjs
//
// American History Tellers is the show a reader asked these lessons to sound
// like, and its writer states the voice rule outright: "The voice in my shows is
// removed. There's no first-person personal pronouns." A narrator who says "we
// forget that a photographer did" has stopped telling a story and started taking
// a seminar — he is agreeing with the reader about what they both think, which
// is the register of a lecture and the opposite of one where things happen to
// somebody.
//
// V1 · NO SEMINAR "WE". A beat may not put the narrator and the reader in the
//      same pronoun. The fix is almost always to hand the sentence to the reader
//      — "we go anyway" → "you go anyway" — which is the move AHT makes anyway,
//      and it costs the picture nothing (A1 is untouched: nobody on stage moves).
//
// THREE KINDS ARE NOT THE DEFECT, and a check that cannot tell them apart is the
// broken-metric failure this repo keeps recording. Left alone on purpose:
//
//   · A PHILOSOPHER'S OWN CLAIM, REPORTED. "Hobbes said we laugh at someone
//     beneath us" is Hobbes's first person. Rewriting it would misquote him.
//   · SPEECH IN QUOTATION MARKS. 'you say "I promise to repay"' is the reader
//     talking, and the pronoun is the whole point of the example.
//   · A "US" THAT NAMES A REAL GROUP the lesson is actually about.
//
// So this is a HIGH-WATER MARK, not a zero. The budget exists so that a NEW one
// fails the build while the legitimate ones stay legible as a decision rather
// than a backlog.
//
// ── IT COVERS FOUR FIELDS, AND `explain` WAS THE ONE THAT MATTERED ──────────
//
// It scanned `text` alone at first, which left the narration clean and the rest
// of what a reader reads untouched. `explain` is the worst place to leave it:
// that is the sentence shown in the second AFTER answering, when the reader is
// paying more attention than at any other point in the lesson, and it was saying
// things like "we would not accept 'too demanding' from somebody refusing to wade
// into the pond".
//
// Counted across `text` + `explain` + `prompt` + `reads`: 21 more were the
// narrator and were rewritten (13 explanations, 3 prompts, 3 readouts, and 2 that
// turned up in the same sweep). What is left is quoted speech and readouts
// deliberately written in the reader's own voice.
//
// TWO EXCLUSIONS, both load-bearing:
//
//   · `cite` IS NOT PROSE and is not scanned at all. "Descartes, Meditations I,
//     1641" and "Aristotle, Metaphysics I" end in Roman NUMERALS, which any
//     first-person rule reads as "I". Widening to it reports the bibliography.
//   · A PHILOSOPHER'S QUOTATION is excluded by INDENT, not by a word list — see
//     FIELDS below. Those 75 are the source's own words and must not be touched.
//
// Whoever widens this further: `check:clear` and `check:plain` sit EXACTLY on
// their budgets, so every sentence rewritten has to be measured.
//
// ── WHAT DELIBERATELY IS NOT CHECKED ────────────────────────────────────────
//
// Not the AHT cold open, and this is the finding rather than an omission. That
// show opens by building a scene in words — a date, a place, a broken radio, a
// double martini — because audio has no picture. THESE LESSONS HAVE A PICTURE.
// A beat that sets the scene in prose is describing what the reader is already
// looking at, which is A1 read backwards, and it spends a beat's ~11 words (J12)
// on the one thing the stage does for free. The transferable half of AHT is the
// VOICE and the EVENT; the scene-painting half is already the scene's job.
//
// Two metrics were built for this and both deleted, for the reason group Z gives:
// a keyword "concreteness" score called "Two canvases. One is a Vermeer." abstract
// (it was scoring its own word list), and a linking-verb "exhibit" score ranked
// `epistemology31` — which opens "You are already down the road when it hits you:
// did you lock the door?" — among the worst in the corpus, because its action-verb
// test could not see an imperative. Both disagreed with lessons whose answer was
// already known, so neither is in this file.
import fs from 'node:fs';
import path from 'node:path';

const DIR = 'components/lesson/cinematic';

/** The high-water mark. May only go DOWN. */
const VOICE_BUDGET = 43;

/**
 * EVERY FIELD THE READER READS, AND NOT ONE MORE.
 *
 * `text` is matched at FOUR SPACES on purpose: that is beat level, and a
 * philosopher's quotation sits deeper, inside `quote: { text: … }`. Those 75 are
 * the source's own words — Hume's "we", Tolstoy's "us" — and rewriting them
 * would be misquoting. The indent is what separates them, so do not loosen it.
 *
 * `explain`, `prompt` and `reads` are matched at any depth because they are
 * nested inside `interact: {}` and never inside a quotation. They matter more
 * than they look: `explain` is what a reader sees in the second after answering,
 * which is the most attentive moment in the lesson.
 *
 * `cite` IS DELIBERATELY ABSENT. It is a bibliography, not prose, and
 * "Descartes, Meditations I, 1641" contains a Roman numeral that any first-person
 * rule reads as "I".
 */
const FIELDS = [
  /(?:^|\n)\s{4}text:\s*(['"])((?:\\.|(?!\1)[^\\])*)\1/g,
  /\bexplain:\s*(['"])((?:\\.|(?!\1)[^\\])*)\1/g,
  /\bprompt:\s*(['"])((?:\\.|(?!\1)[^\\])*)\1/g,
  /\breads:\s*(['"])((?:\\.|(?!\1)[^\\])*)\1/g,
];

function beatsOf(src) {
  const out = [];
  for (const re of FIELDS) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(src))) out.push(m[2].replace(/\\'/g, "'"));
  }
  return out;
}

/**
 * Strip what the narrator is not saying in his own voice.
 *
 * The long-single-quote rule has a floor of six characters on purpose: an
 * apostrophe is the same glyph, so a shorter span happily eats "Aristotle's
 * point is that we" and reports a clean corpus.
 */
function narratorVoice(s) {
  return s
    .replace(/[“"][^”"]*[”"]/g, ' ')
    .replace(/[‘'][^’']{6,}[’']/g, ' ');
}

/**
 * TWO PATTERNS, BECAUSE CASE MEANS DIFFERENT THINGS FOR DIFFERENT PRONOUNS.
 *
 * `we|our|us|my|me` are matched case-INSENSITIVELY: a beat almost always opens
 * its sentence, so the commonest form of this defect is a capital "We" — and a
 * single case-sensitive alternation, which is what this was first written as,
 * cannot see one. The counter-test caught it: a "We see the needle…" spliced into
 * logic18 left the count sitting at exactly the budget, which reads as a clean
 * corpus rather than a blind checker.
 *
 * `I` is matched case-SENSITIVELY, because lower-case "i" is not a pronoun and
 * folding it flags every "i" that survives tokenising.
 */
const FIRST_ANY = /\b(we|our|us|my|me)\b/i;
const FIRST_I = /\bI\b/;
const isFirstPerson = (s) => FIRST_ANY.test(s) || FIRST_I.test(s);

const hits = [];
for (const f of fs.readdirSync(DIR).filter((x) => x.endsWith('Script.ts'))) {
  const src = fs.readFileSync(path.join(DIR, f), 'utf8');
  const id = f.replace('Script.ts', '');
  for (const [i, b] of beatsOf(src).entries()) {
    if (isFirstPerson(narratorVoice(b))) hits.push({ id, i, b: b.trim() });
  }
}

console.log(`check:voice — V1, the narrator's own pronouns\n`);
console.log(`${hits.length} beat(s) carry a first-person pronoun outside quotation (budget ${VOICE_BUDGET})`);

if (hits.length > VOICE_BUDGET) {
  console.log('\nover budget — these are the candidates; a narrator\'s "we" must go, a philosopher\'s stays:');
  for (const h of hits) console.log(`  ${h.id}#${h.i}  ${h.b.slice(0, 96)}`);
  console.log(`\n✗ ${hits.length} against a budget of ${VOICE_BUDGET}`);
  process.exit(1);
}
if (hits.length < VOICE_BUDGET) {
  console.log(`\nBudget is stale: lower VOICE_BUDGET to ${hits.length} in scripts/check-voice.mjs.`);
  process.exit(1);
}
console.log('\nok — no new seminar "we"');

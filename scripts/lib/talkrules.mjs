// ─────────────────────────────────────────────────────────────────────────────
// SAID THE WAY PEOPLE TALK (LESSON_RULES AP20) — the countable half.
//
// The owner, 2026-10-02: *"sometimes the words chosen in the lessons kind of seem
// robotic, not as human-like and not as conversational … the words that are created in
// lessons [must not be] robotic sounding and [must be] very natural sounding words."*
//
// A dialogue line is a person talking to another person, out loud. What makes one sound
// like a machine reading a textbook is mostly the REGISTER — the connective a person
// writes and never says ("therefore", "moreover"), the official word where an everyday
// one exists ("purchase", "obtain", "require"), the textbook formula ("refers to", "is
// defined as", "in other words") — and the teacher NAMING things over and over ("X is
// called Y" in every other line). Those are countable, so they are zeros here, read by
// check:dialogue on every spoken dialogue line. The rest of AP20 (answer the line before,
// react before you explain, say it about the thing in front of you) is judgement and
// lives in the rule book.
//
// ZERO IMPORTS: plain data and one function, so the check and any script read the same list.
// ─────────────────────────────────────────────────────────────────────────────

/** Words and phrases a person writes and does not say, each with what a person says. */
export const BOOKISH = [
  [/\btherefore\b/i, 'so'],
  [/\bthus\b/i, 'so'],
  [/\bhence\b/i, 'so'],
  [/\bmoreover\b/i, 'and / also'],
  [/\bfurthermore\b/i, 'and / also'],
  [/\badditionally\b/i, 'and / also'],
  [/\bconsequently\b/i, 'so'],
  [/\bnevertheless\b/i, 'still / even so'],
  [/\bnonetheless\b/i, 'still / even so'],
  [/\bwhereas\b/i, 'but / while'],
  [/\bwhilst\b/i, 'while'],
  [/\bthereby\b/i, 'and so'],
  [/\bsubsequently\b/i, 'then / later'],
  [/\baccordingly\b/i, 'so'],
  [/\bin order to\b/i, 'to'],
  [/\bprior to\b/i, 'before'],
  [/\bin other words\b/i, 'say it again, plainer, with no announcement'],
  [/\bthis means that\b/i, 'so'],
  [/\bit(?: is|’s|'s) important to\b/i, 'say the thing itself'],
  [/\bone (?:must|should|can|could|might)\b/i, 'you'],
  [/\bindividuals?\b/i, 'people / a person'],
  [/\butili[sz](?:e|es|ed|ing)\b/i, 'use'],
  [/\bobtain(?:s|ed|ing)?\b/i, 'get'],
  [/\bpurchas(?:e|es|ed|ing)\b/i, 'buy'],
  [/\bcommenc(?:e|es|ed|ing)\b/i, 'start'],
  [/\bassist(?:s|ed|ing)?\b/i, 'help'],
  [/\brequir(?:e|es|ed|ing)\b/i, 'need'],
  [/\bapproximately\b/i, 'about'],
  [/\bregarding\b/i, 'about'],
  [/\bnumerous\b/i, 'lots of / many'],
  [/\bsufficient\b/i, 'enough'],
  [/\ba variety of\b/i, 'all sorts of / different'],
  [/\bthe (?:concept|notion|process) of\b/i, 'name the thing'],
  [/\brefers? to\b/i, 'means'],
  [/\bis defined as\b/i, 'means / is'],
  [/\bas you know\b/i, 'nobody tells somebody what both of them know'],
  [/\blet(?:’s|'s| us) (?:explore|examine|consider|delve)\b/i, 'just do it'],
];

/**
 * A line that NARRATES the scene back instead of saying something to somebody in it: the
 * caption formula ("Two pots, and two ideas of how change works.", "Same coffee, and a
 * different taste."), and the announcement ("What you're watching has a name.", "The
 * customer has just made an argument."). Six of the first 28 lessons opened the teacher's
 * first line this way, and it is the line that reads most like a machine summing up. Say
 * it TO them: "You've each got your own idea of how change works."
 */
export const NARRATES = [
  /^(?:Two|Three|Four|One|Same) [a-z]+(?: [a-z]+)?, (?:and |one |two |three )/,
  /\bwhat (?:you’re|you're|we’re|we're) (?:watching|seeing) (?:has|is)\b/i,
  /^The (?:customer|man|woman|taster|shopper|visitor|beginner|traveller|student) (?:has|have) just\b/,
  /\bhas a name\b/i,
];

/**
 * The teacher's formula for NAMING an idea. Naming it is his job (AP14, AS2), once a
 * lesson, on the beat the idea arrives; a lesson where "X is called Y" comes round again
 * and again is a glossary read aloud.
 */
export const NAMING = /\b(?:is|are|was|were) (?:called|known as)\b|\bcall(?:s|ed)? (?:it|that|this|them|what)\b|\bcall (?:the )?[a-z]+ (?:the )?[a-z]+\b(?= is)/i;
/** Beats a lesson may give to naming. */
export const NAMING_MAX = 1;

/** Every hit in one spoken line: [{ say, fix }]. */
export function bookish(text) {
  const out = [];
  for (const [re, fix] of BOOKISH) {
    const m = String(text).match(re);
    if (m) out.push({ say: m[0], fix });
  }
  return out;
}

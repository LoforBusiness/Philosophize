// ─────────────────────────────────────────────────────────────────────────────
// WHAT HE SAYS BACK WHEN YOU ANSWER
//
// A reader asked for it in these words: when you get one wrong the stickman
// *"makes fun of them"*, and when you get one right he *"says something passive
// aggressive that is somewhat encouraging"*. That is the whole brief, and the
// character already exists — §7's mascot is *"smug when you are winning, pointed
// when you are late, wounded once you have actually lost something"*.
//
// ── HE MOCKS THE ANSWER, NEVER THE ANSWERER, AND THAT IS A DECISION ─────────
//
// §7 records the rule the other three pools follow: **he needles ATTENDANCE,
// never ABILITY** — "you did not come" is a fact and fair game, "you are bad at
// this" is the sentence most likely to make a beginner leave, and `check:quips`
// makes it unsayable on the streak tab, the reward screen and the profile.
//
// "Make fun of them" runs straight at that rule, so it was put to the reader
// rather than guessed, and the answer was to keep it: **the joke is on the
// CHOICE, on the question, or on HIM.** Every wrong line here is one of
//
//   · he would have picked it too      "Ah. I'd have said that too."
//   · the question earned it           "That's the trap. Good trap."
//   · everybody picks it               "Everyone picks that one."
//
// which is teasing that costs the reader nothing, because the person who comes
// off worst in all three is the mascot. A beginner who has just been wrong is the
// single most likely reader to close the app, and the line that lands on them
// there is the one they remember.
//
// The RIGHT lines are the opposite problem: unqualified praise from a character
// this smug reads as sarcasm anyway, so they are written as grudging — he is
// pleased and will not quite say so.
//
// ── ZERO IMPORTS, FOR THE SAME REASON `rig.ts` HAS NONE ─────────────────────
//
// `check:thoughts` reads every line in plain Node, measures it against the real
// Inter `.ttf` at the real 12px in the real 130-wide box, and fails the build on
// one that would wrap to a third line or run past its edge. A pool that needs
// Metro to be checked is a pool nobody checks.
// ─────────────────────────────────────────────────────────────────────────────

/** He is pleased for you and refuses to make a thing of it. */
export const RIGHT: readonly string[] = [
  'Fine. That’s the one.',
  'Yes. I was about to say.',
  'Correct. Obviously.',
  'Right. Don’t gloat.',
  'That’s it. Well spotted.',
  'Yes. We both knew that.',
  'Correct. I knew that one.',
  'Right again. Show-off.',
  'Good. Keep that up.',
  'Yes. As I suspected.',
  'Fine. Well done.',
  'That’s the one. Naturally.',
  'Correct. No notes.',
  'Yes. Don’t let it settle.',
  'Right. I’ll allow it.',
  'Good. That was the hard one.',
];

/** The joke is on the choice, the question, or him. Never on the reader. */
export const WRONG: readonly string[] = [
  'Ah. I’d have said that too.',
  'That’s the trap. Good trap.',
  'Everyone picks that one.',
  'Tempting. And no.',
  'No — and it’s a fair mistake.',
  'I fell for that as well.',
  'Not it. Close, though.',
  'The obvious answer. Sadly.',
  'Nearly. That’s the decoy.',
  'Wrong, but in good company.',
  'That’s the one I’d have picked.',
  'No. The trick worked.',
  'It’s a good wrong answer.',
  'Missed it. So did I.',
  'That one catches everybody.',
  'No. Blame whoever wrote it.',
];

/**
 * A deterministic 0..1 from a string — Murmur's finaliser on the tail.
 *
 * §7's reason, and it is not superstition: a bare `h * 31 + c` leaves the low
 * bits dominated by the characters every seed shares, and every seed here shares
 * its lesson id. The reward cloud repeated 8% of the time before this was fixed
 * there, and two quips in a row on one lesson is a far smaller pool to repeat in.
 */
function hash01(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (Math.imul(h, 31) + s.charCodeAt(i)) >>> 0;
  h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b) >>> 0;
  h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35) >>> 0;
  h ^= h >>> 16;
  // `>>> 0` AND IT IS NOT DECORATION. `^` evaluates its operands as SIGNED
  // int32, so the final xor of a value above 2^31 comes back NEGATIVE — and this
  // result indexes an array. Without the clamp `quipFor` returned `undefined` for
  // roughly a third of all lesson-and-beat seeds, which would have shipped as an
  // empty bubble on a right answer. Found by the placement generator, which asked
  // for the exact string it was about to reserve room for and got nothing;
  // `check:thoughts` now asks the same question of every beat in the corpus.
  return (h >>> 0) / 4294967296;
}

/**
 * The line for one answer. DERIVED, never random — a reader who answers, thinks
 * better of it and comes back to the same lesson is talking to the same character,
 * not to two of them (§7's rule for the mascot, one surface over).
 */
export function quipFor(lessonId: string, beat: number, correct: boolean): string {
  const pool = correct ? RIGHT : WRONG;
  return pool[Math.floor(hash01(`${lessonId}:${beat}:${correct ? 'r' : 'w'}`) * pool.length) % pool.length];
}

// ─────────────────────────────────────────────────────────────────────────────
// AND WHAT THE SECOND FIGURE SAYS WHEN HE ARRIVES
//
// A reader asked to *"look like a conversation is happening between two sick
// men"*. The second figure already walks in on the beat before a two-sided
// question (AA8) — he is the person holding the OTHER position, which is what
// makes him an argument rather than a cameo. What was missing was that he never
// said anything, so two figures faced each other in silence.
//
// **THE LINE CAN BE POOLED HERE WHERE THE MASCOT'S THOUGHTS COULD NOT**, and the
// reason is structural rather than convenient: a `poll` lists named positions and
// a `split` divides one thing between two, so the visitor's meaning is fixed by
// the CONTROL — he disagrees — whatever the lesson is about. He is never made to
// have an opinion on the content, only a stance toward it.
//
// He arrives on the beat BEFORE the question and never speaks on the question
// itself (group O): a second figure staking a claim while the reader is choosing
// is a hint wearing a hat.
export const VISITOR_SAYS: readonly string[] = [
  'I’d say the other one.',
  'Not from where I stand.',
  'I read it differently.',
  'Hm. I’m not so sure.',
  'That’s not how I have it.',
  'I’d put it the other way.',
  'Careful. It cuts both ways.',
  'I’ve an argument with that.',
  'Say that again slowly.',
  'And yet — the opposite.',
  'I came to disagree.',
  'There’s another reading.',
];

/** The visitor's line for one lesson. Derived, so he is the same person twice. */
export function visitorSays(lessonId: string): string {
  return VISITOR_SAYS[Math.floor(hash01(`${lessonId}:visitor`) * VISITOR_SAYS.length) % VISITOR_SAYS.length];
}

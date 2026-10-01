import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic science-foundations-1, "What Is Science?" — the first lesson on the
// Science & Technology road, and a DIALOGUE lesson (LESSON_RULES group AP).
// Theme: A BACK YARD, A STEPLADDER, A HEAVY BALL AND A LIGHT ONE.
//
// Three people talk, and nobody narrates. The sceptic (the plain mascot) knows the
// heavy ball lands first, because everybody knows it; the helper (the newsboy cap)
// is up the ladder with one ball in each hand; the scientist (the top hat) asks the
// reader to guess before the drop, and says what the drop has settled.
//
// A FOUNDATION LESSON (AP3): what the subject is and why it is worth the reader's
// time, in three ideas and no more — a guess is tested against the world, the test beats the argument, and technology is tested knowledge put to work.
//
// Every line is written for the ear (groups AC/AD), from its speaker's character
// (cast.ts, AP14), and read in that speaker's voice. `markup` adds only pauses; the
// screen always shows `text`.
// ─────────────────────────────────────────────────────────────────────────────

export interface Sci1Beat extends BaseBeat {
  /**
   * What happens across this beat's line (the scene choreographs it):
   * claim — the sceptic points up at the heavy ball ·
   * climb — the helper, at the top of the ladder, holds the two balls out level ·
   * arrive — the scientist walks in, tips his hat and raises a finger: wait ·
   * drop — the helper lets go of both; they fall side by side and land together ·
   * excuse — the sceptic prods the light ball with his foot ·
   * settle — the scientist opens a hand to the two balls lying on the ground ·
   * risk — the scientist picks the heavy ball up and weighs it in his hand ·
   * build — the scientist lays a hand on the ladder; the helper climbs down it ·
   * rest — everyone at ease under the quotation.
   */
  act?: 'claim' | 'climb' | 'arrive' | 'drop' | 'excuse' | 'settle' | 'risk' | 'build' | 'rest';
  /** The scientist is on the stage. He walks in on `arrive`. */
  th?: boolean;
  /** The balls have been dropped and lie on the ground (from `drop` on). */
  fell?: boolean;
  /** Q1 on the stage: the heavy ball, the light ball, and the chalk mark on the ground between them (both together) — tap one. */
  q1?: boolean;
  /** Q2 on the stage: the slate leaning on the wall shows three chalk rows to tap. */
  q2?: boolean;
}

export const BEATS: Sci1Beat[] = [
  {
    act: 'claim',
    speaker: 'plain',
    text: 'The heavy ball lands first, of course. Everybody knows that.',
    pace: ['even', 'brisk'],
    dur: 1.8,
  },
  {
    act: 'climb',
    speaker: 'cap',
    text: 'Could be, mate. I’m up the ladder anyway, so I’ll drop them both and we’ll see.',
    pace: ['brisk', 'even'],
    dur: 1.8,
  },
  {
    act: 'arrive', th: true,
    speaker: 'tophat',
    text: 'Before he lets go, make your own guess. Science starts with a guess you’re willing to test.',
    pace: ['even', 'even'],
    dur: 2.1,
  },
  {
    th: true, q1: true,
    interact: {
      prompt: 'He lets go of both at once. Which lands first?',
      explain: 'They land together. Weight doesn’t decide how fast a thing falls. Only the air slows some things more than others, and one drop shows it.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    act: 'drop', th: true, fell: true,
    speaker: 'cap',
    text: 'There you go, both at once. Sorry, mate.',
    pace: ['brisk', 'even'],
    dur: 1.8,
  },
  {
    act: 'excuse', th: true, fell: true,
    speaker: 'plain',
    text: 'No, no, it’s fine. I’m sure heavy things fell faster when I was young.',
    pace: ['brisk', 'even'],
    dur: 1.8,
  },
  {
    act: 'settle', th: true, fell: true,
    speaker: 'tophat',
    text: 'Being certain didn’t save him, and one drop settled it. In science, the test beats the argument.',
    pace: ['even', 'even'],
    dur: 2.1,
  },
  {
    act: 'risk', th: true, fell: true,
    speaker: 'tophat',
    text: 'And a real test is one your guess could fail. That risk is what makes the answer worth trusting.',
    pace: ['even', 'even'],
    dur: 2.1,
  },
  {
    th: true, fell: true, q2: true,
    interact: {
      prompt: 'How does science settle an argument?',
      explain: 'Test it, and look. An argument can run all day and prove nothing. A test lets the world decide, and anyone can run it again.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    act: 'build', th: true, fell: true,
    speaker: 'tophat',
    text: 'Ideas that pass their tests get built on. That’s technology: tested knowledge put to work, like the ladder he’s standing on.',
    pace: ['even', 'even'],
    dur: 2.1,
  },
  {
    act: 'rest', th: true, fell: true,
    quote: {
      id: 'lq-science-foundations-1-1',
      text: 'If it disagrees with experiment it is wrong. In that simple statement is the key to science.',
      author: 'Richard Feynman',
      work: 'The Character of Physical Law',
      era: '1965',
      branchSlugs: ['science'],
    },
    dur: 3.0,
  },
  {
    th: true, fell: true,
    summary: {
      title: 'What Is Science?',
      points: [
        'Science tests its guesses against the world',
        'A test beats an argument',
        'Technology is tested knowledge, put to work',
      ],
      closing: 'Next time someone says everybody knows, ask how it was tested. That question is where science begins.',
    },
    dur: 2.8,
  },
];

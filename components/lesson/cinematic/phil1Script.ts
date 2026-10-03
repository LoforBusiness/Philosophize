import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic philosophy-foundations-1, "What Is Philosophy?" — the first lesson on the
// Philosophy road, and a DIALOGUE lesson (LESSON_RULES group AP).
// Theme: A BICYCLE REPAIR STAND, A CRATE OF OLD PARTS, AND A BICYCLE WITH NOTHING OLD LEFT ON IT.
//
// Three people talk, and nobody narrates. The owner (the plain mascot) brought in a
// bicycle with one squeaky wheel; the mechanic (the newsboy cap, kind to a fault) has
// replaced every part of it for nothing; the philosopher (the top hat) names the
// question they have walked into — is it the same bicycle? — and what kind of question
// that is.
//
// A FOUNDATION LESSON (AP3): what the subject is and why it is worth the reader's
// time, in three ideas and no more — a question the facts cannot settle, answered with reasons, and why that matters.
//
// Every line is written for the ear (groups AC/AD), from its speaker's character
// (cast.ts, AP14), and read in that speaker's voice. `markup` adds only pauses; the
// screen always shows `text`.
// ─────────────────────────────────────────────────────────────────────────────

export interface Phil1Beat extends BaseBeat {
  /**
   * What happens across this beat's line (the scene choreographs it):
   * enter — the owner walks up to the stand, where his bicycle hangs mended ·
   * parts — the mechanic shows the new frame and saddle, and the crate of old parts ·
   * doubt — the owner looks from the bicycle to the crate and back ·
   * arrive — the philosopher walks in and tips his hat ·
   * name — the philosopher points from the bicycle to the crate as he defines it ·
   * reasonA — the mechanic lays a hand on the bicycle and gives his reason ·
   * reasonB — the owner lifts the old wheel out of the crate and gives his ·
   * weigh — the philosopher turns from one to the other, a hand to each ·
   * live — the owner takes the bicycle by the handlebars; the mechanic hands him the bill ·
   * rest — everyone at ease under the quotation.
   */
  act?: 'enter' | 'parts' | 'doubt' | 'arrive' | 'name' | 'reasonA' | 'reasonB' | 'weigh' | 'live' | 'rest';
  /** The philosopher is on the stage. He walks in on `arrive`. */
  th?: boolean;
  /** Q1 on the stage: the crate, the bill and the bicycle each wear a question tag — tap one. */
  q1?: boolean;
  /** Q2 on the stage: the workshop board’s three chalk rows are the three things to tap. */
  q2?: boolean;
}

export const BEATS: Phil1Beat[] = [
  {
    bed: 'street',
    act: 'enter',
    speaker: 'plain',
    text: 'One squeaky wheel. That’s all I asked you to fix.',
    pace: 'even',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'chalk', at: 1.25, gain: 0.8 }, { id: 'paper', at: 4.24, gain: 0.8 }],
    act: 'parts',
    speaker: 'cap',
    text: 'Fixed it, and the frame was cracked, so I changed that and the saddle too. No charge, mate.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'doubt',
    speaker: 'plain',
    text: 'How generous. So is this still my bicycle, or a stranger’s?',
    pace: 'even',
    dur: 1.8,
  },
  {
    act: 'arrive', th: true,
    speaker: 'tophat',
    text: 'Now that’s a philosophy question. You two agree on every fact, and you still can’t agree on the answer.',
    pace: ['brisk', 'even'],
    dur: 2.1,
  },
  {
    act: 'name', th: true,
    speaker: 'tophat',
    text: 'Philosophy asks what we mean and what’s true, when looking harder won’t settle it.',
    pace: 'even',
    dur: 2.1,
  },
  {
    th: true, q1: true,
    interact: {
      prompt: 'Which question can’t be settled by looking?',
      explain: 'Whether it’s the same bicycle. You can count the old parts, and you can add up the bill. No amount of counting says what makes a thing the same thing.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    act: 'reasonA', th: true,
    speaker: 'cap',
    text: 'I’d call the bicycle yours. Same owner, same stand, and it never left my sight.',
    pace: 'even',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'crate', at: 0.91, gain: 0.8 }, { id: 'freewheel', at: 1.14, gain: 0.8 }],
    act: 'reasonB', th: true,
    speaker: 'plain',
    text: 'And I’d say mine is in that crate, in pieces. But do go on.',
    pace: ['even', 'brisk'],
    dur: 1.8,
  },
  {
    act: 'weigh', th: true,
    speaker: 'tophat',
    text: 'Nobody shouted, and nobody took a vote. Each of them gave a reason, and a reason can be tested.',
    pace: ['even', 'even'],
    dur: 2.1,
  },
  {
    th: true, q2: true,
    interact: {
      prompt: 'What settles a philosophy question?',
      explain: 'The best reason. In philosophy you give your reasons, and other people test them. A vote shows what’s popular, and a loud voice shows nothing at all.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    sfx: [{ id: 'crate', at: 0.93, gain: 0.8 }, { id: 'chalk', at: 2.39, gain: 0.8 }],
    act: 'live', th: true,
    speaker: 'tophat',
    text: 'You already live by answers like these: what’s fair, what’s real and what you owe. Philosophy is how you check them.',
    pace: ['brisk', 'even'],
    dur: 2.1,
  },
  {
    act: 'rest', th: true,
    quote: {
      id: 'lq-philosophy-foundations-1-1',
      text: 'The unexamined life is not worth living.',
      author: 'Socrates',
      work: 'Plato, Apology',
      era: '399 BC',
      branchSlugs: ['philosophy'],
    },
    dur: 3.0,
  },
  {
    th: true,
    summary: {
      title: 'What Is Philosophy?',
      points: [
        'Philosophy asks what facts alone can’t settle',
        'Its answers are reasons, which anyone can test',
        'You already live by answers you never examined',
      ],
      closing: 'Next time you feel sure of something, ask what your reason is. That question is where philosophy begins.',
    },
    dur: 2.8,
  },
];

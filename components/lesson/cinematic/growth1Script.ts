import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic personal-growth-foundations-1, "How Do People Change?" — the first lesson on the
// Personal Growth & Self-Help road, and a DIALOGUE lesson (LESSON_RULES group AP).
// Theme: A GARDEN PATH, TWO FLOWERPOTS, ONE WATERING CAN AND A MONTH OF MORNINGS.
//
// Three people talk, and nobody narrates. The beginner (the woman with the bun) wants a
// new self by teatime and pours a month of water into her pot at once; her neighbour
// (the plain mascot, dry as ever) gives his a cupful each morning; the teacher (the top
// hat) says which of them is doing what the subject recommends.
//
// A FOUNDATION LESSON (AP3): what the subject is and why it is worth the reader's
// time, in three ideas and no more — change is small and repeated, it is made easy rather than forced, and it adds up.
//
// Every line is written for the ear (groups AC/AD), from its speaker's character
// (cast.ts, AP14), and read in that speaker's voice. `markup` adds only pauses; the
// screen always shows `text`.
// ─────────────────────────────────────────────────────────────────────────────

export interface Growth1Beat extends BaseBeat {
  /**
   * What happens across this beat's line (the scene choreographs it):
   * plant — the beginner carries her pot out of her door, sets it down and presses a seed into it ·
   * ask — the neighbour looks over from his own pot ·
   * flood — the beginner tips the whole watering can into her pot until it overflows ·
   * cupful — the neighbour pours one cupful from his mug onto his pot ·
   * arrive — the teacher walks in and tips his hat ·
   * grown — a month on: a sunflower stands in the neighbour’s pot; the teacher opens a hand to it ·
   * forget — the beginner points away at the shed where the can is kept ·
   * easy — the teacher opens the shed, lifts the can off its hook and carries it across to her
   *   (he does NOT point at her door: that is the answer to the next question, group O) ·
   * daily — the beginner gives her pot one cupful and sets the can by her door ·
   * rest — everyone at ease under the quotation.
   */
  act?: 'plant' | 'ask' | 'flood' | 'cupful' | 'arrive' | 'grown' | 'forget' | 'easy' | 'daily' | 'rest';
  /** The teacher is on the stage. He walks in on `arrive`. */
  th?: boolean;
  /** A month has passed: the neighbour’s sunflower is grown, the beginner’s pot is a puddle. */
  month?: boolean;
  /** The watering can lives by the front door (from `daily` on). */
  door?: boolean;
  /** Q1 on the stage: the three pots — flooded, a cupful a day, and left dry — are the things to tap. */
  q1?: boolean;
  /** Q2 on the stage: three places the can could live — the shed, the top of the wall, the front door. */
  q2?: boolean;
}

export const BEATS: Growth1Beat[] = [
  {
    act: 'plant',
    speaker: 'bun',
    text: 'New me! I’m growing the tallest sunflower on the street, starting today.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'ask',
    speaker: 'plain',
    text: 'How lovely. And how often will you water it?',
    pace: 'even',
    dur: 1.8,
  },
  {
    act: 'flood',
    speaker: 'bun',
    text: 'No need to water it often. Here’s a whole month of water, all in one go!',
    pace: ['even', 'brisk'],
    dur: 1.8,
  },
  {
    act: 'cupful',
    speaker: 'plain',
    text: 'No, no, it’s fine, mine only gets a cupful each morning. I’m sure yours knows best.',
    pace: ['brisk', 'even'],
    dur: 1.8,
  },
  {
    act: 'arrive', th: true,
    speaker: 'tophat',
    text: 'Two pots, and two ideas of how change works. Personal growth is the study of how people change, on purpose.',
    pace: ['even', 'even'],
    dur: 2.1,
  },
  {
    th: true, q1: true,
    interact: {
      prompt: 'A month from now, which pot has the sunflower?',
      explain: 'The pot that got a cupful each morning. Change comes from a small thing done again and again. One huge effort drowns the seed, and no effort leaves it dry.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    act: 'grown', th: true, month: true,
    speaker: 'tophat',
    text: 'A little every day beats a lot all at once. The size of the step hardly matters, but coming back to it does.',
    pace: ['even', 'even'],
    dur: 2.1,
  },
  {
    act: 'forget', th: true, month: true,
    speaker: 'bun',
    text: 'But I always forget! The watering can lives in the shed, behind the bikes.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'easy', th: true, month: true,
    speaker: 'tophat',
    text: 'Then don’t try harder, make it easier. Put the can where you can’t miss it.',
    pace: ['even', 'even'],
    dur: 2.1,
  },
  {
    th: true, month: true, q2: true,
    interact: {
      prompt: 'Where should she keep the watering can?',
      explain: 'By the door she walks through every morning. A habit sticks when it’s easy to start. People who change don’t have more willpower. They make the right step the easy one.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    act: 'daily', th: true, month: true, door: true,
    speaker: 'plain',
    text: 'A cupful a day. It’s almost as if the boring way works.',
    pace: 'even',
    dur: 1.8,
  },
  {
    act: 'rest', th: true, month: true, door: true,
    quote: {
      id: 'lq-personal-growth-foundations-1-1',
      text: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.',
      author: 'Will Durant',
      work: 'The Story of Philosophy',
      era: '1926',
      branchSlugs: ['personal-growth'],
    },
    dur: 3.0,
  },
  {
    th: true, month: true, door: true,
    summary: {
      title: 'How Do People Change?',
      points: [
        'People change through small steps, repeated',
        'Make the right step the easy one',
        'You become what you keep doing',
      ],
      closing: 'Pick one small thing, and put it by your door tonight. That’s where change begins.',
    },
    dur: 2.8,
  },
];

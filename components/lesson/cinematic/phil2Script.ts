import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic philosophy-foundations-2, "What Makes an Argument Good?" — the second
// lesson on the Philosophy road, and a DIALOGUE lesson (LESSON_RULES group AP).
// Theme: A CAFÉ TABLE, A SLICE OF CARROT CAKE, AND A CHALKBOARD OF SPECIALS.
//
// Three people talk, and nobody narrates. The customer (the woman with the bun) orders
// carrot cake as a health food and is delighted with her reasoning; the man at the next
// table (the plain mascot) has views about the icing; the philosopher (the top hat)
// writes her argument up on the café's chalkboard and shows what makes one good.
//
// A FOUNDATION LESSON (AP3), three ideas and no more: an argument is reasons given for a
// conclusion · a good one needs true reasons AND a conclusion that follows from them ·
// an attack on the person is not an answer to the reason.
//
// Every line is written for the ear (groups AC/AD), from its speaker's character
// (cast.ts, AP14), and read in that speaker's voice at the pace its words ask for
// (AP17): its pauses come from its punctuation.
// ─────────────────────────────────────────────────────────────────────────────

export interface Phil2Beat extends BaseBeat {
  /**
   * What happens across this beat's line (the scene choreographs it):
   * order — the customer takes her slice from the café's serving hatch and carries it
   *   to her standing table; the man at the next table stirs his coffee ·
   * scoff — the man at the next table turns and counts the layers of icing with his spoon ·
   * arrive — the philosopher walks in, tips his hat and stands by the chalkboard ·
   * chalk — he wipes off the specials and chalks her three lines onto the board ·
   * follow — he ticks her two reasons, rules the line under them, and crosses the
   *   step down to her conclusion ·
   * jab — the man at the next table waves his spoon at her plate while she eats ·
   * person — the philosopher holds a palm up to the man, then taps the reasons, not her ·
   * concede — she points at the board, shrugs, and finishes the cake ·
   * rest — everyone at ease under the quotation; the man sips his coffee.
   */
  act?: 'order' | 'scoff' | 'arrive' | 'chalk' | 'follow' | 'jab' | 'person' | 'concede' | 'rest';
  /** The philosopher is on the stage. He walks in on `arrive`. */
  th?: boolean;
  /** The chalkboard: 0 today's specials · 1 her argument in three lines · 2 three replies to her (the second question). */
  board?: number;
  /** How much of the cake is left: 1 a whole slice · 0.5 half · 0 crumbs. */
  cake?: number;
  /** First question on the stage: the three lines of her argument are the things to tap. */
  link?: boolean;
  /** Second question on the stage: the three replies on the board are the things to tap. */
  reply?: boolean;
}

export const BEATS: Phil2Beat[] = [
  {
    act: 'order', board: 0, cake: 1,
    speaker: 'bun',
    text: 'One slice of carrot cake, please! Carrots are good for you, so carrot cake counts as healthy.',
    pace: ['brisk', 'even'],
    dur: 1.8,
  },
  {
    act: 'scoff', board: 0, cake: 1,
    speaker: 'plain',
    text: 'And butter, and sugar, and a thick layer of icing. Do enjoy your vegetables.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'arrive', th: true, board: 0, cake: 1,
    speaker: 'tophat',
    text: 'The customer has just made an argument. An argument is a set of reasons, given to support a conclusion.',
    pace: ['even', 'even'],
    dur: 2.1,
  },
  {
    act: 'chalk', th: true, board: 1, cake: 1,
    speaker: 'tophat',
    text: 'The customer’s argument goes up on the board. Carrots are healthy, and this cake has carrots, so this cake is healthy.',
    pace: ['brisk', 'even'],
    dur: 2.1,
  },
  {
    th: true, board: 1, cake: 1, link: true,
    interact: {
      prompt: 'Both of her reasons are true. Which line on the board lets the argument down?',
      explain: 'The last line. Her reasons are true, but the conclusion doesn’t follow from them. Having carrots in it doesn’t stop a cake being mostly sugar and butter.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    act: 'follow', th: true, board: 1, cake: 1,
    speaker: 'tophat',
    text: 'A good argument needs two things. True reasons, and a conclusion that follows from them.',
    pace: ['even', 'even'],
    dur: 2.1,
  },
  {
    act: 'jab', th: true, board: 1, cake: 0.5,
    speaker: 'plain',
    text: 'Well, she would say that. She has cake for breakfast.',
    pace: ['even', 'brisk'],
    dur: 1.8,
  },
  {
    act: 'person', th: true, board: 1, cake: 0.5,
    speaker: 'tophat',
    text: 'That’s an attack on the person, not on the reasons. What she eats for breakfast doesn’t change a word on that board.',
    pace: ['even', 'even'],
    dur: 2.1,
  },
  {
    th: true, board: 2, cake: 0.5, reply: true,
    interact: {
      prompt: 'Which reply on the board tests her argument, and not her?',
      explain: 'The one about the sugar. It goes after the step from her reasons to her conclusion. Her breakfast is about her, and what everyone else orders is a head count, not a reason.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    act: 'concede', th: true, board: 2, cake: 0,
    speaker: 'bun',
    text: 'Oh! So my reasons were fine, and my conclusion wasn’t. I’m still finishing the cake.',
    pace: ['brisk', 'even', 'brisk'],
    dur: 1.8,
  },
  {
    act: 'rest', th: true, board: 2, cake: 0,
    quote: {
      id: 'lq-philosophy-foundations-2-1',
      text: 'Both teachers and learners go to sleep at their post, as soon as there is no enemy in the field.',
      author: 'John Stuart Mill',
      work: 'On Liberty',
      era: '1859',
      branchSlugs: ['philosophy'],
    },
    dur: 3.0,
  },
  {
    th: true, board: 2, cake: 0,
    summary: {
      title: 'What Makes an Argument Good?',
      points: [
        'An argument is reasons given for a conclusion',
        'Good ones need true reasons that lead to the conclusion',
        'Attacking the person doesn’t answer the reasons',
      ],
      closing: 'Next time someone gives you a reason, check two things: is it true, and does the conclusion follow?',
    },
    dur: 2.8,
  },
];

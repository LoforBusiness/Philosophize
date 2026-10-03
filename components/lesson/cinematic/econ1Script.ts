import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic economics-foundations-1, "What Is Economics?" — the first lesson of
// Economics & Finance, and the first DIALOGUE lesson (LESSON_RULES group AP).
// Theme: A SATURDAY MARKET STALL, ONE TEN-POUND NOTE, AND THE LAST LOAF.
//
// Three people talk, and nobody narrates. The shopper (the plain mascot) has one
// ten-pound note and wants everything on the stall; the stall-holder (the newsboy
// cap, Australian) names the prices; the economist (the top hat) turns the moment
// into the subject — speaking to the reader, where the other two speak to each other.
//
// A FOUNDATION LESSON (AP3): what economics is and why it is worth the reader's time,
// in three ideas and no more — scarcity, opportunity cost, and prices as signals.
//
// Every line is written for the ear (groups AC/AD) and read in its speaker's voice
// (cast.ts). `markup` adds only pauses; the screen always shows `text`.
// ─────────────────────────────────────────────────────────────────────────────

export interface Econ1Beat extends BaseBeat {
  /**
   * What happens across this beat's line (the scene choreographs it):
   * enter — the shopper walks up to the counter holding his note ·
   * offer — the stall-holder lifts the pie and taps the book ·
   * arrive — the economist walks in and tips his hat ·
   * scarce — the stall-holder holds up the last loaf ·
   * buy — the note goes on the counter, the change comes back, the book goes to him ·
   * settle — the stall-holder takes the note, the shopper pockets the change ·
   * lastloaf — both customers reach for the last loaf ·
   * rest — everyone at ease under the quotation.
   */
  act?: 'enter' | 'offer' | 'arrive' | 'scarce' | 'buy' | 'settle' | 'lastloaf' | 'rest';
  /** The economist is on the stage. He walks in on `arrive`. */
  th?: boolean;
  /** Where the purchase stands: 0 before it · 1 note and change on the counter, the book in his hand · 2 the counter cleared. */
  sale?: number;
  /** The A-board: 0 the bread's price · 1 the three chalk choices (Q2) · 2 the new price. */
  board?: number;
  /** Q1 on the stage: the note, the change and the pie are the three things to tap. */
  q1?: boolean;
  /** Q2 on the stage: the A-board's three chalk rows are the three things to tap. */
  q2?: boolean;
}

export const BEATS: Econ1Beat[] = [
  {
    act: 'enter', sale: 0, board: 0,
    speaker: 'plain',
    text: 'One ten-pound note. And I want everything on this table.',
    pace: ['even', 'brisk'],
    dur: 1.8,
  },
  {
    act: 'offer', sale: 0, board: 0,
    speaker: 'cap',
    text: 'Everyone does, mate. The pie is six pounds, and the book is eight.',
    pace: ['brisk', 'even'],
    dur: 1.8,
  },
  {
    act: 'arrive', th: true, sale: 0, board: 0,
    speaker: 'tophat',
    text: 'You two are doing economics, you know. Economics is the study of how people choose, when they can’t have it all.',
    pace: ['even', 'even'],
    dur: 2.1,
  },
  {
    act: 'scarce', th: true, sale: 0, board: 0,
    speaker: 'tophat',
    text: 'Your wants never run out, but your money, your time and the bread on that stall all do. That gap is called scarcity.',
    pace: ['even', 'even'],
    dur: 2.1,
  },
  {
    act: 'buy', th: true, sale: 1, board: 0,
    speaker: 'plain',
    text: 'Then I’ll take the book.',
    pace: 'even',
    dur: 1.8,
  },
  {
    th: true, sale: 1, board: 0, q1: true,
    interact: {
      prompt: 'What did the book really cost him?',
      explain: 'The pie. A choice costs the best thing you gave up to make it, which economists call its opportunity cost. The eight pounds was only the price, and the change came back to him.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    act: 'settle', th: true, sale: 2, board: 0,
    speaker: 'tophat',
    text: 'Every choice has an opportunity cost. Spend an hour at this market, and you can’t spend that hour anywhere else.',
    pace: ['even', 'even'],
    dur: 2.1,
  },
  {
    act: 'lastloaf', th: true, sale: 2, board: 0,
    speaker: 'cap',
    text: 'One loaf left, and two hungry customers. Right, time to think about my price.',
    pace: ['even', 'brisk'],
    dur: 1.8,
  },
  {
    th: true, sale: 2, board: 1, q2: true,
    interact: {
      prompt: 'Two buyers, one loaf. What should the baker do with the price?',
      explain: 'Raise the price. When more people want bread than the stall has, the price of bread rises. The higher price is a signal: buyers learn the bread is scarce, and bakers learn to bake more.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    act: 'rest', th: true, sale: 2, board: 2,
    quote: {
      id: 'lq-economics-foundations-1-1',
      text: 'Economics is the science which studies human behaviour as a relationship between ends and scarce means which have alternative uses.',
      author: 'Lionel Robbins',
      work: 'An Essay on the Nature and Significance of Economic Science',
      era: '1932',
      branchSlugs: ['economics'],
    },
    dur: 3.0,
  },
  {
    th: true, sale: 2, board: 2,
    summary: {
      title: 'What Is Economics?',
      points: [
        'Wants are endless, and money, time and goods are scarce',
        'Every choice costs the best thing you gave up',
        'A price is a signal of how scarce something is',
      ],
      closing: 'Next time you pay for anything, ask what you gave up. That question is where economics begins.',
    },
    dur: 2.8,
  },
];

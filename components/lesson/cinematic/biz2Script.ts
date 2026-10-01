import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic business-foundations-2, "Who Is Your Customer?" — the second lesson on
// the Business road, and a DIALOGUE lesson (LESSON_RULES group AP).
// Theme: A BAKERY COUNTER AT DAWN, PINK MACARONS, AND A BUILDER WHO WANTS BREAKFAST.
//
// Three people talk, and nobody narrates. The baker (the woman with the bun) has filled
// her window with pastel macarons for the building site next door; her first customer
// (the plain mascot, on his way to a long shift) would like something to eat; the
// adviser (the top hat) shows her who her customer really is, and how to find out.
//
// A FOUNDATION LESSON (AP3), three ideas and no more: your customer is the person whose
// problem you solve · find them by who actually walks in, not who you imagined · watch
// what sells, and ask.
//
// Every line is written for the ear (groups AC/AD), from its speaker's character
// (cast.ts, AP14), and read in that speaker's voice at the pace its words ask for
// (AP17): its pauses come from its punctuation.
// ─────────────────────────────────────────────────────────────────────────────

export interface Biz2Beat extends BaseBeat {
  /**
   * What happens across this beat's line (the scene choreographs it):
   * display — the baker sets the last pink macaron on its tray and admires the row ·
   * builder — the customer comes in from the cold, rubbing his hands, and peers at the tray ·
   * arrive — the adviser walks in, tips his hat and looks from the tray to the customer ·
   * define — he opens a hand towards the customer, then rubs his own arms against the cold, while the baker lifts a cake up onto the counter ·
   * bake — the baker drops the oven door, slides the hot sausage rolls out and sets them at the front ·
   * guess — the adviser taps the side of his head, then points at the rolls; the baker pours the customer a small cup of tea ·
   * quiet — the customer holds up a small cup and spreads his hands to show a bigger one ·
   * serve — the baker hands over a roll and a large mug of tea, and holds up her notepad ·
   * rest — everyone at ease under the quotation.
   */
  act?: 'display' | 'builder' | 'arrive' | 'define' | 'bake' | 'guess' | 'quiet' | 'serve' | 'rest';
  /** The adviser is on the stage. He walks in on `arrive`. */
  th?: boolean;
  /** The counter: 0 a plate of macarons, sausage rolls baking in the lit oven · 1 a cake set out beside them (the first question) · 2 hot rolls out at the front. */
  tray?: number;
  /** Steam from the oven and the tea: 0 none · 1 rising. */
  steam?: number;
  /** First question on the stage: the macarons, the cake, and the sausage rolls in the oven are the things to tap. */
  fit?: boolean;
  /** Second question on the stage: her notepad, her recipe book and the crystal ball on the shelf are the things to tap. */
  learn?: boolean;
}

export const BEATS: Biz2Beat[] = [
  {
    act: 'display', tray: 0, steam: 0,
    speaker: 'bun',
    text: 'Fresh lavender macarons, all in pastel pink! The builders next door are going to love them.',
    pace: ['brisk', 'even'],
    dur: 1.8,
  },
  {
    act: 'builder', tray: 0, steam: 0,
    speaker: 'plain',
    text: 'Lovely and dainty. Got anything a person could eat at seven in the morning?',
    pace: 'even',
    dur: 1.8,
  },
  {
    act: 'arrive', th: true, tray: 0, steam: 0,
    speaker: 'tophat',
    text: 'The baker made what she likes, for a customer she imagined. A business starts with the customer at the counter.',
    pace: ['even', 'even'],
    dur: 2.1,
  },
  {
    act: 'define', th: true, tray: 1, steam: 0,
    speaker: 'tophat',
    text: 'Your customer is the person whose problem you solve. His problem is a cold morning, and a long shift ahead.',
    pace: ['even', 'even'],
    dur: 2.1,
  },
  {
    th: true, tray: 1, steam: 0, fit: true,
    interact: {
      prompt: 'What should she bake for the seven o’clock crowd from the building site?',
      explain: 'The hot sausage rolls. They solve his problem: something warm and filling to eat on the way to work. The macarons and the cake are lovely, but they’re for somebody who isn’t here.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    act: 'bake', th: true, tray: 2, steam: 1,
    speaker: 'bun',
    text: 'Sausage rolls, coming right up! Although I’m sure everyone secretly wants a macaron.',
    pace: ['brisk', 'even'],
    dur: 1.8,
  },
  {
    act: 'guess', th: true, tray: 2, steam: 1,
    speaker: 'tophat',
    text: 'That’s a guess, and a guess can be checked. Watch what sells, and ask the people buying it.',
    pace: ['even', 'even'],
    dur: 2.1,
  },
  {
    act: 'quiet', th: true, tray: 2, steam: 1,
    speaker: 'plain',
    text: 'Since nobody asked, a bigger cup of tea would be nice. Not that anyone ever asks.',
    pace: ['even', 'brisk'],
    dur: 1.8,
  },
  {
    th: true, tray: 2, steam: 1, learn: true,
    interact: {
      prompt: 'How should the baker find out what else her customers want?',
      explain: 'Her notepad. Asking customers, and writing down what they say, beats any recipe book and beats guessing. The tea was there to learn all along, and nobody had asked him.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    act: 'serve', th: true, tray: 2, steam: 1,
    speaker: 'bun',
    text: 'One sausage roll, and one very large tea. Oh, and I’ve written it all down!',
    pace: ['even', 'brisk'],
    dur: 1.8,
  },
  {
    act: 'rest', th: true, tray: 2, steam: 1,
    quote: {
      id: 'lq-business-foundations-2-1',
      text: 'You’ve got to start with the customer experience and work backwards to the technology.',
      author: 'Steve Jobs',
      work: 'Apple Worldwide Developers Conference',
      era: '1997',
      branchSlugs: ['business'],
    },
    dur: 3.0,
  },
  {
    th: true, tray: 2, steam: 1,
    summary: {
      title: 'Who Is Your Customer?',
      points: [
        'Your customer is the person whose problem you solve',
        'Serve who actually walks in, not who you imagined',
        'Watch what sells, and ask the people buying',
      ],
      closing: 'Before you make something for a customer, ask the customer what they need.',
    },
    dur: 2.8,
  },
];

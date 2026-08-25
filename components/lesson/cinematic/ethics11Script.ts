import type { BaseBeat } from './cinematicKit';

// Cinematic ethics-ethics-11, "Utilitarianism Up Close" — Bentham counts, Mill ranks.
//
// THE ONE PICTURE (H64): a counting table with three pleasure-tokens on it, all
// drawn the same size, because that is exactly what Bentham's felicific calculus
// says they are — same currency, add them up. Over the lesson a SECOND, HIGHER
// SHELF is built above the table, and on the reader's own answer one token rises
// onto it and is drawn LARGER. One row becomes two levels: quantity stops being
// the only dimension there is.
//
// Q1 is the nuanced one and lives in the deck (E34): does a bigger pile of cheap
// thrills beat a symphony for Mill? Q2 is the one the picture can put directly and
// is answered ON the stage (H65): tap the pleasure Mill lifts to the upper shelf.

export interface Ethics11Beat extends BaseBeat {
  /** Figure gesture (emote code). */ p?: number;
  /** Where the figure stands (stage x). 60 = downstage left, 126 = beside the table. */ x?: number;
  /** The three pleasure-tokens standing on the lower table: 0 absent · 1 present. */ tok?: number;
  /** The ledger card: 0 absent · 1 the sum, live · 2 the sum, overruled (dimmed). */ led?: number;
  /** The higher shelf above the table: 0 absent · 1 built, and standing empty. */ shelf?: number;
  /** Where the symphony token sits: 0 on the table · 1 up on the shelf, larger. */ up?: number;
  /** 1 = the three tokens are live tap targets (Q2). */ pick?: number;
}

export const BEATS: Ethics11Beat[] = [
  {
    p: 31, x: 60,
    text: 'Suppose happiness came in coins. Every pleasure you have ever had, poured onto one table and counted out like loose change.',
    dur: 4.0,
  },
  {
    p: 3, x: 60, tok: 1,
    text: 'Jeremy Bentham built that table. A bar game, a helping of dessert, a symphony. Three pleasures, drawn the same size, because to him they are the same stuff.',
    cite: 'The counting table',
    dur: 5.0,
  },
  {
    p: 21, x: 60, tok: 1, led: 1,
    text: 'His felicific calculus scored each one for intensity, duration, certainty and reach, then added the column up. Push-pin ranks with poetry, he said, if the totals come out level.',
    cite: 'The felicific calculus',
    dur: 5.4,
  },
  {
    p: 6, x: 126, tok: 1, led: 1, shelf: 1,
    text: 'Then his own student refused the arithmetic. Watch a second shelf go up above the table. John Stuart Mill would not leave a bar game and a symphony on one level.',
    cite: 'Mill puts up a shelf',
    dur: 5.4,
  },
  {
    p: 139, x: 126, tok: 1, led: 1, shelf: 1,
    quote: {
      id: 'lq-ethics-ethics-11-1',
      text: 'It is better to be a human being dissatisfied than a pig satisfied; better to be Socrates dissatisfied than a fool satisfied.',
      author: 'John Stuart Mill',
      work: 'Utilitarianism',
      era: '1863',
      philosopherId: 'john-stuart-mill',
      branchSlugs: ['ethics'],
    },
    dur: 4.0,
  },
  {
    p: 4, x: 126, tok: 1, led: 1, shelf: 1,
    interact: {
      prompt: 'Cheap thrills sum to more raw pleasure than one symphony. For Mill, have they beaten it?',
      split: {
        left: 'WHAT KIND', right: 'HOW MUCH',
        start: 0.5,
        zones: [
          { id: 'amount', upto: 0.34, reads: 'add the pleasure up and the bigger pile wins' },
          { id: 'both', upto: 0.66, reads: 'the amount matters, and so does the kind' },
          { id: 'kind', upto: 1, reads: 'some kinds outrank any amount of the others', correct: true },
        ],
      },
      explain: 'The trap: reading Mill as Bentham with better manners. He broke the ledger. Higher pleasures differ in KIND, and judges who have tasted both prefer them — so a taller pile of lower ones does not simply outvote them.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 30, x: 126, tok: 1, led: 1, shelf: 1, up: 1, pick: 1,
    interact: {
      prompt: 'Three pleasures, one table. Tap the one Mill lifts onto the higher shelf.',
      explain: 'The trap: intensity is not rank. The dessert and the bar game are real pleasures — push-pin was Bentham\'s own example — but neither had to be learned. Mill\'s higher pleasure is the one you trained yourself to hear, and nobody who can hear it trades it back.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 28, x: 126, tok: 1, led: 2, shelf: 1, up: 1,
    text: 'Two levels now, and the column below can no longer settle it. Mill\'s test is not the size of the total but the verdict of people who have honestly tasted both.',
    cite: 'Competent judges',
    dur: 5.0,
  },
  {
    p: 28, x: 126, tok: 1, led: 2, shelf: 1, up: 1,
    summary: {
      title: 'Counting, and Ranking',
      points: [
        'Utilitarianism judges an act by the happiness it produces',
        'Bentham counted pleasure by quantity alone',
        'Mill ranked some pleasures higher in kind, not amount',
        'Competent judges, not the raw total, decide',
      ],
      closing: 'Next time someone says just add up the happiness, ask Mill which kind.',
    },
    dur: 3.0,
  },
];

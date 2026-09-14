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
    text: 'Suppose every pleasure could be measured in one unit, like coins. Then all your pleasures could be added into a single total.',
    dur: 4.0,
  },
  {
    p: 168, x: 60, tok: 1,
    text: 'Jeremy Bentham, the founder of modern utilitarianism, treated pleasure this way. Consider three pleasures: a bar game, a dessert and a symphony.',
    cite: 'Pleasure as quantity',
    dur: 2.5,
  },
  {
    p: 168, x: 60, tok: 1,
    text: 'For Bentham, pleasures differ only in quantity, so no pleasure is better in itself than another.',
    dur: 2.5,
  },
  {
    p: 380, x: 60, tok: 1, led: 1,
    text: 'Bentham’s felicific calculus scores pleasures by how intense, lasting and certain they are. If the pleasure is equal, he held, push-pin is as good as poetry.',
    cite: 'The felicific calculus',
    dur: 5.4,
  },
  {
    p: 6, x: 126, tok: 1, led: 1, shelf: 1,
    text: 'John Stuart Mill was raised on Bentham’s ideas, yet he rejected this purely quantitative view of pleasure.',
    cite: 'Mill’s objection',
    dur: 2.8,
  },
  {
    p: 6, x: 126, tok: 1, led: 1, shelf: 1,
    text: 'Mill argued that pleasures differ in quality as well as quantity. Some are higher in kind than others.',
    dur: 2.6,
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
    p: 457, x: 126, tok: 1, led: 1, shelf: 1,
    interact: {
      prompt: 'If lower pleasures add up to more pleasure than a symphony, does Mill say they outweigh it?',
      split: {
        left: 'QUALITY', right: 'QUANTITY',
        start: 0.5,
        zones: [
          { id: 'amount', upto: 0.34, reads: 'only the total quantity of pleasure counts' },
          { id: 'both', upto: 0.66, reads: 'quality counts, yet enough quantity can win' },
          { id: 'kind', upto: 1, reads: 'higher quality outweighs any quantity of lower', correct: true },
        ],
      },
      explain: 'Higher quality outweighs any quantity of lower. Mill says competent judges wouldn’t give up a higher pleasure for any quantity of a lower one. He counts quantity too, but beside a difference in quality it’s “of small account”.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 169, x: 126, tok: 1, led: 1, shelf: 1, up: 1, pick: 1,
    interact: {
      prompt: 'Which of the three pleasures does Mill count as a higher pleasure?',
      explain: 'The symphony. For Mill, higher pleasures come from the mind, the feelings and the imagination, and need training to enjoy. The bar game and the dessert are real but lower pleasures, however intense.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 163, x: 126, tok: 1, led: 2, shelf: 1, up: 1,
    text: 'Once pleasures differ in kind, quantity alone can’t decide which pleasure is better. Mill’s test is the preference of competent judges who have experienced both.',
    cite: 'Competent judges',
    dur: 5.0,
  },
  {
    p: 163, x: 126, tok: 1, led: 2, shelf: 1, up: 1,
    summary: {
      title: 'Quantity and Quality of Pleasure',
      points: [
        'Utilitarianism judges an act by the happiness it produces',
        'Bentham counted pleasure by quantity alone',
        'Mill ranked some pleasures higher in quality',
        'Competent judges, not the total quantity, decide the ranking',
      ],
      closing: 'Mill remains a utilitarian, but he denies that pleasures differ only in amount.',
    },
    dur: 3.0,
  },
];

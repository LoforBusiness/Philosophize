import type { BaseBeat } from './cinematicKit';

// Cinematic aesthetics-aesthetics-32, "Why Do Endings Matter?"
//
// THE PICTURE: three charts with the same area under them. A mean line is then drawn
// across all three at the SAME height, which is the proof that the totals match — so
// the reader can see that nothing separates these lives except their order, and can
// still tell which one they would rather have (H64).
//
// STAGING: the answer targets are three CHARTS, and a correct pick inverts the whole
// chart to ink with its bars in paper — the biggest single answer state in the app,
// because here the target is the size of the argument (E33, H61).

export interface Aes32Beat extends BaseBeat {
  /** Figure gesture (emote code). */ g?: number;
  /** How many charts have risen, 0…3. */ rows?: number;
  /** 1 = the mean line is drawn across all three. */ mean?: number;
  /** 1 = the three charts are live targets (Q1). */ pick?: number;
}

export const BEATS: Aes32Beat[] = [
  {
    g: 5, rows: 1, mean: 0,
    dur: 4.0,
    text: 'Nine years of a life, one bar each. This one starts badly and ends well — the last years are the best it ever had.',
  },
  {
    g: 2, rows: 2, mean: 0,
    dur: 2.9,
    text: 'Here is the same life run backwards. Exactly the same nine years, in the opposite order.',
    cite: 'The same years, reversed',
  },
  {
    g: 2, rows: 2, mean: 0,
    dur: 1.8,
    text: 'Nothing has been added and nothing taken away.',
  },
  {
    g: 383, rows: 3, mean: 0,
    dur: 4.4,
    text: 'And a third, level throughout — never bad, never remarkable. Nine identical years that come to the same amount as the other two.',
    cite: 'And a flat one',
  },
  {
    g: 139, rows: 3, mean: 0,
    dur: 3.6,
    quote: {
      id: 'lq-aesthetics-aesthetics-32-1',
      text: 'Count no man happy until he is dead.',
      author: 'Solon',
      work: 'Herodotus, Histories',
      era: 'c. 430 BC',
      branchSlugs: ['aesthetics'],
    },
  },
  {
    g: 167, rows: 3, mean: 1,
    dur: 4.1,
    text: 'The line sits at the same height in all three, because all three hold the same amount of good. A ledger cannot tell them apart.',
    cite: 'Identical totals',
  },
  {
    g: 167, rows: 3, mean: 1,
    dur: 1.8,
    text: 'You can, instantly.',
  },
  {
    g: 4, rows: 3, mean: 1, pick: 1,
    dur: 1.0,
    interact: {
      prompt: 'Tap the life that goes better.',
      explain: 'The rising one. All three hold exactly the same amount of good — that is what the line shows. If a life were only a total, all three would be equally good and equally good to hear about.',
      xp: 5,
    },
  },
  {
    g: 11, rows: 3, mean: 1,
    dur: 1.0,
    interact: {
      prompt: 'Draw the shape of the life you would rather have lived.',
      plot: {
        axis: 'HOW WELL IT GOES',
        cols: ['YOUNG', 'THEN', 'LATER', 'OLD'],
        start: [0.5, 0.5, 0.5, 0.5],
        shapes: [
          { id: 'rise', profile: [0.15, 0.4, 0.7, 0.95], reads: 'it gets better as it goes', correct: true },
          { id: 'fall', profile: [0.95, 0.7, 0.4, 0.15], reads: 'it gets worse as it goes' },
          { id: 'flat', profile: [0.55, 0.55, 0.55, 0.55], reads: 'it stays about the same throughout' },
        ],
      },
      explain: 'The rising one, and almost everybody draws it. The totals are identical, so the strict view has to call the declining life exactly as good. Almost nobody can, and that reluctance is the evidence: the order carries a value of its own.',
      xp: 5,
    },
  },
  {
    summary: {
      title: 'The Shape of the Thing',
      points: [
        'Rearranging the same goods can change how good a life is',
        'Endings reach backwards and recolour what came before',
        'A total is blind to order; we plainly are not',
        'This is why stories have shapes and not only contents',
      ],
      closing: 'You are not living a pile of moments. You are living a shape, and you are somewhere in the middle of it.',
    },
    dur: 3.0,
  },
];

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
    g: 440, rows: 1, mean: 0,
    dur: 4.0,
    text: 'Consider nine years of a life, with one bar for how well each year goes. This life begins badly and ends with its best years.',
  },
  {
    g: 2, rows: 2, mean: 0,
    dur: 2.9,
    text: 'The second chart contains the same nine years in the opposite order. It begins well and ends badly.',
    cite: 'The same years, reversed',
  },
  {
    g: 2, rows: 2, mean: 0,
    dur: 1.8,
    text: 'The second life contains the same goods as the first, and only their order differs.',
  },
  {
    g: 383, rows: 3, mean: 0,
    dur: 4.4,
    text: 'A third life stays level, never bad and never remarkable. Its nine identical years add up to the same total as the other two.',
    cite: 'A level life',
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
    text: 'A line marks each life’s average year, and it sits at the same height in all three. Adding up well-being can’t tell the three lives apart.',
    cite: 'Identical totals',
  },
  {
    g: 167, rows: 3, mean: 1,
    dur: 1.8,
    text: 'The additive view holds that a life’s value is the sum of the well-being in its years. Yet the three lives don’t seem equally good.',
  },
  {
    g: 461, rows: 3, mean: 1, pick: 1,
    dur: 1.0,
    interact: {
      prompt: 'Which of the three lives goes better as a whole?',
      explain: 'The life that’s getting better. All three hold the same total, as the line shows. If a life’s value were only its total, the three lives would be equally good.',
      xp: 5,
    },
  },
  {
    g: 165, rows: 3, mean: 1,
    dur: 1.0,
    interact: {
      prompt: 'Which curve shows the life you would rather live, if the totals are equal?',
      plot: {
        axis: 'WELL-BEING',
        cols: ['YOUNG', 'THEN', 'LATER', 'OLD'],
        start: [0.5, 0.5, 0.5, 0.5],
        shapes: [
          { id: 'rise', profile: [0.15, 0.4, 0.7, 0.95], reads: 'well-being rises steadily to the end', correct: true },
          { id: 'fall', profile: [0.95, 0.7, 0.4, 0.15], reads: 'well-being falls steadily to the end' },
          { id: 'flat', profile: [0.55, 0.55, 0.55, 0.55], reads: 'well-being stays level throughout' },
        ],
      },
      explain: 'Well-being rising steadily to the end. The totals are equal, so the additive view must call the falling life just as good. David Velleman rejects that verdict. He argues that the direction of a life has value of its own.',
      xp: 5,
    },
  },
  {
    summary: {
      title: 'Why the Shape of a Life Matters',
      points: [
        'Rearranging the same goods can change how good a life is',
        'Later events can change what earlier years meant',
        'The additive view counts totals and ignores order',
        'Stories, too, are judged by their shape, not only their content',
      ],
      closing: 'Solon’s warning fits this view. A life can’t be fully judged until its shape is complete.',
    },
    dur: 3.0,
  },
];

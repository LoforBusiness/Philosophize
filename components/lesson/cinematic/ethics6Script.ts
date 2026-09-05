import type { BaseBeat } from './cinematicKit';

// Cinematic ethics-ethics-6, "The Trolley Problem and Its Cousins" — the footbridge.
// A trolley bears down on five; on a bridge above the track stand the decider and a
// large stranger. Shove him and his body stops the trolley — same math as the lever,
// but it feels monstrous. Questions are A/B/C/D (nuanced); the scene carries the pull.

export interface Ethics6Beat extends BaseBeat {
  /** Decider gesture. */ d?: number;
  /** The large stranger's gesture. */ str?: number;
  /** Trolley position along the track. */ tx?: number;
  /** The shove tension 0..1 — draws the fall line off the bridge. */ shove?: number;
  /**
   * Bars drawn into the WOULD YOU DO IT? chart, 0..2: the switch, then the
   * footbridge. Both bars sit over the same "SAME MATH — 1 FOR 5" footing and land
   * at opposite heights — the lesson, as a side-by-side you can read at a glance.
   */
  card?: number;
  /**
   * The USED AS A MEANS stamp, 0..1 — the crux Foot and the doctrine of double
   * effect both point at. It lands on the doing-vs-using beat and stays up.
   */
  stamp?: number;
}

export const BEATS: Ethics6Beat[] = [
  {
    d: 2, str: 0, tx: 70, card: 0,
    text: 'Five lives saved. So why does this one feel wrong?',
    dur: 1.8,
  },
  {
    d: 2, str: 0, tx: 70, card: 0,
    text: 'Same numbers, different hands — your gut splits where the math does not.',
    dur: 2,
  },
  {
    d: 383, str: 0, tx: 110, card: 1,
    text: 'Earlier you met the lever: divert the trolley, one dies instead of five. Philosophers then twisted it — each version keeps the five-for-one math but changes how the one dies.',
    cite: 'One dilemma, many versions',
    dur: 5.0,
  },
  {
    d: 13, str: 15, tx: 150, shove: 1, card: 2,
    text: 'Thomson’s 1985 twist: you stand on a bridge beside a large stranger. Shove him onto the track and his body stops the trolley, saving five.',
    cite: 'The footbridge twist',
    dur: 3.8,
  },
  {
    d: 13, str: 15, tx: 150, shove: 1, card: 2,
    text: 'Most who would pull the lever refuse to push.',
    dur: 1.8,
  },
  {
    d: 22, str: 18, tx: 180, card: 2, stamp: 1,
    text: 'The arithmetic is identical — five lives for one, which is all a utilitarian counts. Yet the switch and the shove split us.',
    cite: 'Doing vs using',
    dur: 3.2,
  },
  {
    d: 22, str: 18, tx: 180, card: 2, stamp: 1,
    text: 'Foot: diverting redirects a threat; shoving makes a person your instrument.',
    dur: 1.8,
  },
  {
    d: 0, str: 0, tx: 180, card: 2, stamp: 1,
    quote: {
      id: 'lq-ethics-ethics-6-1',
      text: 'It takes more to justify an interference than to justify the withholding of goods and service.',
      author: 'Philippa Foot',
      philosopherId: 'philippa-foot',
      work: 'Killing and Letting Die',
      era: '1984',
      branchSlugs: ['ethics'],
    },
    dur: 3.4,
  },
  {
    d: 4, str: 0, tx: 180, card: 2, stamp: 1,
    interact: {
      prompt: 'What actually changed between the two cases?',
      split: {
        left: 'HE IS USED AS A TOOL', right: 'THE NUMBER WHO DIE',
        start: 0.04,
        zones: [
          { id: 'count', upto: 0.3, reads: 'the numbers changed, and that is what moved you' },
          { id: 'both', upto: 0.66, reads: 'half the numbers, half the using' },
          { id: 'tool', upto: 1, reads: 'same numbers, you used him as a tool', correct: true },
        ],
      },
      explain: 'All of it on the using, because the numbers never moved: one life for five, in both. What changes is that the man on the bridge becomes the instrument — the thing the doctrine of double effect flags, and what Foot built the case to isolate.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    d: 21, str: 0, tx: 180, card: 2, stamp: 1,
    interact: {
      prompt: 'A strict utilitarian must judge the lever and footbridge cases exactly alike. True?',
      cards: [
        { text: 'True', correct: true },
        { text: 'False', correct: false },
      ],
      explain: 'True, and it feels wrong. Pure utilitarianism counts only outcomes: five saved for one lost is identical in both, so the cases get the same verdict.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'The Trolley Family',
      points: [
        'Switch and shove share the same math',
        'Our gut still treats them differently',
        'Means versus side effect drives the split',
        'Foot: not harming outweighs helping',
      ],
      closing: 'The puzzle is not what to do, but why our intuitions refuse to line up.',
    },
    dur: 2.8,
  },
];

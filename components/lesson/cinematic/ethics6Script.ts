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
  /**
   * A one-shot flash in the stamp's own (otherwise empty) column, timed to this
   * beat's own claim. 0 none · 1 two equal bars, LEVER = PUSH, both topped 5 —
   * the raw arithmetic, before intuition reverses it · 2 a check over LEVER and
   * a cross over PUSH — the surveyed verdict · 3 "(A SIDE EFFECT)" tagged above
   * the landed stamp, pairing with the "A MEANS" it already reads.
   */
  verdict?: number;
}

export const BEATS: Ethics6Beat[] = [
  {
    d: 2, str: 0, tx: 70, card: 0,
    text: 'Some acts that save five lives at the cost of one still strike most people as wrong.',
    dur: 1.8,
  },
  {
    d: 266, str: 158, tx: 70, card: 0, verdict: 1,
    text: 'The numbers can stay fixed while moral intuitions reverse. What changes is how the harm is brought about.',
    dur: 2,
  },
  {
    d: 383, str: 0, tx: 110, card: 1,
    text: 'Pulling a lever diverts the trolley to kill one instead of five. Later variants change only how the one dies.',
    cite: 'One dilemma, many versions',
    dur: 5.0,
  },
  {
    d: 13, str: 15, tx: 150, shove: 1, card: 2,
    text: 'In Judith Jarvis Thomson’s 1976 footbridge case, you stand on a bridge beside a large stranger. Pushing him onto the track would stop the trolley.',
    cite: 'The footbridge case',
    dur: 3.8,
  },
  {
    d: 266, str: 258, tx: 150, shove: 1, card: 2, verdict: 2,
    text: 'In surveys, most people who would pull the lever judge pushing impermissible.',
    dur: 1.8,
  },
  {
    d: 22, str: 18, tx: 180, card: 2, stamp: 1,
    text: 'Both cases trade one life for five, which is all a utilitarian counts. Yet people judge them differently.',
    cite: 'Side effect or means',
    dur: 3.2,
  },
  {
    d: 170, str: 18, tx: 180, card: 2, stamp: 1, verdict: 3,
    text: 'The doctrine of double effect offers an explanation. Diverting kills as a side effect, whereas shoving uses a person as a means.',
    dur: 1.8,
  },
  {
    d: 462, str: 0, tx: 180, card: 2, stamp: 1,
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
    d: 165, str: 0, tx: 180, card: 2, stamp: 1,
    interact: {
      prompt: 'What differs morally between the lever case and the footbridge case?',
      split: {
        left: 'USED AS A MEANS', right: 'THE NUMBER WHO DIE',
        start: 0.04,
        zones: [
          { id: 'count', upto: 0.3, reads: 'a different number of people die' },
          { id: 'both', upto: 0.66, reads: 'partly the numbers, partly the using' },
          { id: 'tool', upto: 1, reads: 'same numbers, yet one is used as a means', correct: true },
        ],
      },
      explain: 'Same numbers, but one is used as a means. One life is traded for five in both cases. What differs is that the man on the bridge is used to stop the trolley. The doctrine of double effect treats that difference as morally significant.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    d: 177, str: 0, tx: 180, card: 2, stamp: 1,
    interact: {
      prompt: 'Is it true that a strict utilitarian must judge the lever and footbridge cases alike?',
      cards: [
        { text: 'True', correct: true },
        { text: 'False', correct: false },
      ],
      explain: 'True. Strict utilitarianism counts only outcomes, and both cases save five lives at the cost of one. So it gives the same verdict in both, even though most people’s intuitions differ.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Variants of the Trolley Problem',
      points: [
        'The switch and the shove trade one life for five',
        'Most people nonetheless judge the two cases differently',
        'Double effect separates harm as a means from a side effect',
        'Foot: the duty not to harm outweighs the duty to help',
      ],
      closing: 'The central puzzle is to explain why intuitions differ when the outcomes are identical.',
    },
    dur: 2.8,
  },
];

import type { BaseBeat } from './cinematicKit';

// Cinematic metaphysics-being-6, "Can a Thing Survive Change?" — the Ship of Theseus.
// A shipwright swaps rotted planks for new ones, one by one, until no original wood
// remains. Then someone rebuilds a second ship from the old planks — and both have a
// claim. Questions stay A/B/C/D (they're nuanced), the SCENE carries the wonder.

export interface Meta6Beat extends BaseBeat {
  /** Shipwright gesture. */ p?: number;
  /** Plank-swapping intensity 0..1 — drives the working shimmer on the hull. */ swap?: number;
  /** The second ship (rebuilt from old planks) is shown 0..1. */ two?: number;
  /**
   * Fraction of ORIGINAL wood still in the sailing hull, 1 → 0. Drives the chart
   * across the top of the stage and how far each hull course has been re-planked.
   * Monotonically falling, so the graph only ever draws forward.
   */
  orig?: number;
  /**
   * Turns the chart onto the READER 0..1: a tag slides in beneath the plot saying
   * the same curve describes their own cells. Only the "you are the living proof"
   * beat sets it, so the annotation lands exactly when the line is read.
   */
  you?: number;
}

export const BEATS: Meta6Beat[] = [
  {
    p: 443, swap: 0, two: 0, orig: 1,
    text: 'Suppose every plank of a ship is replaced, one at a time. When no original wood remains, is it the same ship?',
    dur: 3.6,
  },
  {
    p: 269, swap: 1, orig: 0.06,
    text: 'Plutarch reports that the Athenians preserved the ship of Theseus, replacing decayed timbers with new ones.',
    cite: 'The Ship of Theseus',
    dur: 3.9,
  },
  {
    p: 269, swap: 1, orig: 0.06,
    text: 'Plutarch adds that philosophers disputed whether it remained the same ship.',
    dur: 1.8,
  },
  {
    p: 139, swap: 1, orig: 0,
    quote: {
      id: 'lq-metaphysics-being-6-1',
      text: 'All things move and nothing remains still; you cannot step twice into the same stream.',
      author: 'Heraclitus',
      philosopherId: 'heraclitus',
      work: 'Plato, Cratylus 402a',
      era: 'c. 500 BCE',
      branchSlugs: ['metaphysics'],
    },
    dur: 3.6,
  },
  {
    p: 459, swap: 1, orig: 0,
    text: 'Philosophers distinguish two senses of the word “same”. Two new coins can be qualitatively identical, sharing every feature.',
    cite: 'Two senses of sameness',
    dur: 2.5,
  },
  {
    p: 459, swap: 1, orig: 0,
    text: 'Numerical identity is being one and the same thing over time. The repaired ship seems to keep numerical identity even as its material changes.',
    dur: 2.7,
  },
  {
    p: 22, swap: 1, orig: 0, you: 1,
    text: 'The same puzzle applies to you. Most of your cells have been replaced since you were a young child.',
    cite: 'Personal identity',
    dur: 4.1,
  },
  {
    p: 403, swap: 1, orig: 0, you: 1,
    text: 'Yet you still regard that child as numerically identical to yourself.',
    dur: 1.8,
  },
  {
    p: 165, swap: 1, orig: 0,
    interact: {
      prompt: 'Why does the Ship of Theseus challenge identity over time?',
      cards: [
        { text: 'Every part is replaced', correct: true },
        { text: 'It no longer looks the same', correct: false },
      ],
      explain: 'Every part is replaced. If the ship survives the replacement, the ship’s identity can’t consist in its parts. The ship barely changes in appearance, so the puzzle isn’t about looking different.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 384, swap: 0.4, two: 1, orig: 0,
    interact: {
      prompt: 'When the old planks are rebuilt into a second ship, which ship is the original?',
      split: {
        left: 'UNBROKEN USE', right: 'THE ORIGINAL PLANKS',
        start: 0.04,
        zones: [
          { id: 'wood', upto: 0.3, reads: 'the rebuilt ship, made of the original planks' },
          { id: 'both', upto: 0.7, reads: 'each has a claim, depending on the criterion', correct: true },
          { id: 'use', upto: 1, reads: 'the ship in continuous use' },
        ],
      },
      explain: 'Each has a claim, depending on the criterion. The ship in continuous use has unbroken continuity, and the rebuilt ship has the original planks. Thomas Hobbes, who added the rebuilt ship, held that identity depends on the name under which a thing is considered.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'The Ship of Theseus',
      points: [
        'The Ship of Theseus: every part replaced',
        'Qualitative versus numerical identity',
        'Heraclitus: all things flow',
        'Your body’s matter changes, yet you persist',
      ],
      closing: 'On a continuity view, identity lies in the unbroken chain linking each stage to the next.',
    },
    dur: 2.8,
  },
];

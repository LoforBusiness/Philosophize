import type { BaseBeat } from './cinematicKit';

// Cinematic metaphysics-being-16, "Free Enough to Be Responsible?"
//
// THE PICTURE: two panels drawn identically — same craving, same act, same chemistry
// — with one arrow above each saying whether the man is behind his own wanting. In
// one panel that arrow points the same way as the craving. In the other it points
// straight back against it (H64).
//
// Frankfurt's move is the hardest in this branch to state without losing people,
// because "second-order desire" arrives as jargon. Drawn as an arrow ABOVE the
// arrow, it is not jargon at all: it is obviously a thing pointing at another thing,
// and obviously capable of pointing the other way.
//
// STAGING: the two panels are the Q1 targets, and everything inside them except
// that one arrow is identical — so the reader answers by finding the difference
// rather than by recalling a term.

export interface Met16Beat extends BaseBeat {
  /** Figure gesture (emote code). */ g?: number;
  /** How many panels are up, 0…2. */ panels?: number;
  /** The first-order craving arrows, 0…1. */ crave?: number;
  /** The second-order arrows above them, 0…1. */ second?: number;
  /** 1 = the two panels are live targets (Q1). */ pick?: number;
  /** Dashed spotlight: 0 none, 1 = the unwilling panel's whole arrow column
   *  (the craving overriding the hated second-order arrow), 2 = both panels'
   *  second-order arrow (naming it), 3 = the willing panel's whole arrow column
   *  (the endorsed desire that moves him), 4 = both panels' endorsement tag row. */
  spot?: number;
}

export const BEATS: Met16Beat[] = [
  {
    g: 379, panels: 2, crave: 1,
    dur: 4.6,
    text: 'Harry Frankfurt describes two addicts with the same craving, the same dose and the same physical dependence.',
  },
  {
    g: 465, panels: 2, crave: 1, second: 1,
    dur: 3,
    text: 'The two addicts differ only in their attitude to the craving. The willing addict endorses his desire for the drug.',
    cite: 'Attitudes to the craving',
  },
  {
    g: 465, panels: 2, crave: 1, second: 1, spot: 1,
    dur: 2,
    text: 'The unwilling addict hates his craving, yet it still moves him to take the drug.',
  },
  {
    g: 13, panels: 2, crave: 1, second: 1, spot: 2,
    dur: 3.3,
    text: 'Frankfurt calls a desire about a desire a second-order desire. A first-order desire is a desire to do something, such as take the drug.',
    cite: 'Second-order desires',
  },
  {
    g: 266, panels: 2, crave: 1, second: 1, spot: 3,
    dur: 1.8,
    text: 'Frankfurt’s central notion is a second-order volition, wanting a particular desire to be the one that moves you.',
  },
  {
    g: 456, panels: 2, crave: 1, second: 1,
    dur: 3.8,
    quote: {
      id: 'lq-metaphysics-being-16-1',
      text: 'It is in securing the conformity of his will to his second-order volitions, then, that a person exercises freedom of the will.',
      author: 'Harry Frankfurt',
      work: 'Freedom of the Will and the Concept of a Person',
      era: '1971',
      philosopherId: 'harry-frankfurt',
      branchSlugs: ['metaphysics'],
    },
  },
  {
    g: 399, panels: 2, crave: 1, second: 1, spot: 4,
    dur: 4.8,
    text: 'Freedom of the will, on this account, doesn’t depend on a desire’s origin. It depends on something beyond the desire itself, whether the agent endorses it.',
    cite: 'Freedom of the will',
  },
  {
    g: 165, panels: 2, crave: 1, second: 1, pick: 1,
    dur: 1.0,
    interact: {
      prompt: 'On Frankfurt’s account, which addict lacks freedom of the will?',
      explain: 'The unwilling addict. His dose and chemistry match the willing addict’s, so the difference isn’t in the act. The desire that moves him is one he doesn’t want to move him. The willing addict can’t stop either, but his will is his own.',
      xp: 5,
    },
  },
  {
    g: 442, panels: 2, crave: 1, second: 1,
    dur: 1.0,
    interact: {
      prompt: 'On Frankfurt’s account, what does a free choice require?',
      sort: {
        chip: 'a free choice',
        bins: [
          { id: 'uncaused', label: 'no cause', reads: 'a choice that nothing caused' },
          { id: 'unforced', label: 'nobody forced you', reads: 'a choice made without external force' },
          { id: 'endorsed', label: 'an endorsed desire', reads: 'acting on a desire you want to act on', correct: true },
        ],
      },
      explain: 'An endorsed desire. Frankfurt’s account is compatible with determinism, so a free choice may be fully caused. The unwilling addict acts without external force, yet isn’t free, because he doesn’t endorse the desire that moves him.',
      xp: 5,
    },
  },
  {
    summary: {
      title: 'Frankfurt’s Hierarchy of Desires',
      points: [
        'Second-order desires are desires about first-order desires',
        'Free will is acting on a desire you want to move you',
        'Both addicts are compelled, but only one endorses his craving',
        'Frankfurt’s account is compatible with determinism',
      ],
      closing: 'Gary Watson objected that second-order desires are themselves only desires, so their rank gives them no special authority.',
    },
    dur: 3.0,
  },
];

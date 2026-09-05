import type { BaseBeat } from './cinematicKit';

// Cinematic metaphysics-being-8, "Are You Free, or Wound Up?" — free will vs
// determinism, taught on a long run of toppling dominoes. The figure WALKS ahead
// of the falling wave, from the far end of the chain down to the one domino that
// carries their name, then turns and pushes the next one themselves. Q1 is
// answered by tapping a card in the scene; Q2 is A/B/C/D in the deck.
//
// Teaching order is strictly ask-before-tell: the reader watches the chain arrive,
// meets the two extremes (hard determinism, libertarian free will), is asked what
// a third camp could possibly mean by "free" BEFORE the word compatibilism is ever
// spoken, then gets the name and Hume's own sentence as the payoff.

export interface Metaphysics8Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** Where the figure stands (stage x). 300 = far end of the chain, 140 = under their own domino. */ x?: number;
  /** The whole domino run + its rail, 0..1. */ chain?: number;
  /**
   * The topple FRONT, as a domino index. Every domino with index >= this value is
   * down; the wave sweeps right-to-left, so this number only ever decreases.
   * 13 = all thirteen still standing · 3 = the wave has just taken YOUR CHOICE ·
   * 2 = the figure has pushed the next one over.
   */
  front?: number;
  /** The two end captions on the rail, 0..1. Dropped to 0 while Q1 is up. */ tags?: number;
  /** The YOUR CHOICE tag over domino 3, 0..1. Dropped to 0 while Q1 is up. */ mark?: number;
  /** 1 = the three answer cards are live in the scene (Q1). */ pick?: number;
}

export const BEATS: Metaphysics8Beat[] = [
  {
    p: 164, x: 300, chain: 1, front: 13,
    text: 'Think of the last thing you chose. Now picture it already on its way a thousand years before you were born.',
    dur: 3,
  },
  {
    p: 164, x: 300, chain: 1, front: 13,
    text: 'Every event gets pushed over by the one before it.',
    dur: 1.8,
  },
  {
    p: 159, x: 232, chain: 1, front: 9, tags: 1, mark: 1,
    text: 'The first domino went over long before you existed — your genes, your parents, the street you grew up on. That push has been travelling ever since.',
    cite: 'The first push',
    dur: 4.3,
  },
  {
    p: 159, x: 232, chain: 1, front: 9, tags: 1, mark: 1,
    text: 'Here it comes.',
    dur: 1.8,
  },
  {
    p: 173, x: 232, chain: 1, front: 5, tags: 1, mark: 1,
    text: 'Hard determinists take the conclusion on the chin. Given everything that came before, they say, you could not have done otherwise.',
    cite: 'Hard determinism',
    dur: 3.6,
  },
  {
    p: 173, x: 232, chain: 1, front: 5, tags: 1, mark: 1,
    text: 'Not once. Not in your entire life.',
    dur: 1.8,
  },
  {
    p: 15, x: 140, chain: 1, front: 3, tags: 1, mark: 1,
    text: 'And there is the one with your name on it. It goes over right on schedule.',
    cite: 'Your domino',
    dur: 2.8,
  },
  {
    p: 15, x: 140, chain: 1, front: 3, tags: 1, mark: 1,
    text: 'The choice you are proudest of was a sentence physics started centuries ago.',
    dur: 2.2,
  },
  {
    p: 33, x: 140, chain: 1, front: 3, tags: 1, mark: 1,
    text: 'One camp simply refuses. A real choice snaps the chain, they say — you begin a brand-new line that nothing before you set going.',
    cite: 'The refusal',
    dur: 4,
  },
  {
    p: 33, x: 140, chain: 1, front: 3, tags: 1, mark: 1,
    text: 'That is libertarian free will.',
    dur: 1.8,
  },
  {
    // 8 (shrug), not 4 (think): the line opens "A third camp shrugs".
    p: 8, x: 200, chain: 1, front: 3, tags: 1, mark: 1,
    text: 'A third camp shrugs at the whole fight. Both sides picked the wrong test, they think.',
    cite: 'A third way',
    dur: 2.6,
  },
  {
    // 8 (shrug), not 4 (think): the line opens "A third camp shrugs".
    p: 416, x: 200, chain: 1, front: 3, tags: 1, mark: 1,
    text: 'Freedom was never about escaping causes. So what else could a free choice be?',
    dur: 2.2,
  },
  {
    p: 21, x: 200, chain: 1, front: 3, tags: 0, mark: 0, pick: 1,
    interact: {
      prompt: 'This camp agrees every domino falls, yours included. Tap what they say makes a choice FREE.',
      explain: 'Free means the push came from inside you — your own wants — with nobody else’s hand on your arm. The chain is left standing exactly where it was.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 12, x: 200, chain: 1, front: 3, tags: 1, mark: 1,
    interact: {
      prompt: 'Where does the third camp actually stand?',
      poll: {
        options: [
          { id: 'gap', reads: 'the chain breaks, and freedom lives in the gap', holders: ['Kane'] },
          { id: 'hard', reads: 'every link holds, so nobody is free', holders: ['d\'Holbach'] },
          { id: 'compat', reads: 'every link holds, and people are free anyway', holders: ['Hume', 'Frankfurt'], correct: true },
          { id: 'lost', reads: 'the chain breaks and nobody is free either' },
        ],
      },
      explain: 'Every link holds, and people are free anyway. These are two questions, not one. Compatible with free will sounds like something was rescued from the causes. Nothing was. Every domino still falls. The camp only changed the test from was it uncaused to was it forced.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 29, x: 140, chain: 1, front: 2, tags: 1, mark: 1,
    text: 'That camp has a name: compatibilism. David Hume, and later Harry Frankfurt, keep every cause and change the test.',
    cite: 'Compatibilism · Hume, Frankfurt',
    dur: 2.7,
  },
  {
    p: 29, x: 140, chain: 1, front: 2, tags: 1, mark: 1,
    text: 'You act freely when the push comes from your own wants — not from a hand on your arm.',
    dur: 2.7,
  },
  {
    p: 141, x: 140, chain: 1, front: 2, tags: 1, mark: 1,
    quote: {
      id: 'lq-metaphysics-being-8-1',
      text: 'By liberty, then, we can only mean a power of acting or not acting, according to the determinations of the will.',
      author: 'David Hume',
      work: 'An Enquiry Concerning Human Understanding',
      era: '1748',
      philosopherId: 'david-hume',
      branchSlugs: ['metaphysics'],
    },
    dur: 3.8,
  },
  {
    summary: {
      title: 'Wound Up, and Still Yours',
      points: [
        'Every choice sits inside a chain of causes',
        'Hard determinism: you could not have done otherwise',
        'Libertarians say a real choice snaps the chain',
        'Compatibilism: free means unforced, not uncaused',
      ],
      closing: 'The dominoes may all be falling. The only question left is whose hand is on yours.',
    },
    dur: 3.0,
  },
];

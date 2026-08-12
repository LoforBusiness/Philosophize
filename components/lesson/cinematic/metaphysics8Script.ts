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
    p: 25, x: 300, chain: 1, front: 13,
    text: 'Think of the last thing you chose. Now picture it already on its way a thousand years before you were born. Every event gets pushed over by the one before it.',
    dur: 4.4,
  },
  {
    p: 45, x: 232, chain: 1, front: 9, tags: 1, mark: 1,
    text: 'The first domino went over long before you existed — your genes, your parents, the street you grew up on. That push has been travelling ever since. Here it comes.',
    cite: 'The first push',
    dur: 4.8,
  },
  {
    p: 46, x: 232, chain: 1, front: 5, tags: 1, mark: 1,
    text: 'Hard determinists take this on the chin. Given everything that came before, they say, you could not have done otherwise. Not once. Not in your entire life.',
    cite: 'Hard determinism',
    dur: 4.8,
  },
  {
    p: 15, x: 140, chain: 1, front: 3, tags: 1, mark: 1,
    text: 'And there is the one with your name on it. It goes over right on schedule. The choice you are proudest of was a sentence physics started centuries ago.',
    cite: 'Your domino',
    dur: 5.0,
  },
  {
    p: 33, x: 140, chain: 1, front: 3, tags: 1, mark: 1,
    text: 'One camp simply refuses. A real choice snaps the chain, they say — you begin a brand-new line that nothing before you set going. That is libertarian free will.',
    cite: 'The refusal',
    dur: 4.8,
  },
  {
    // 8 (shrug), not 4 (think): the line opens "A third camp shrugs".
    p: 8, x: 200, chain: 1, front: 3, tags: 1, mark: 1,
    text: 'A third camp shrugs at the whole fight. Both sides picked the wrong test, they think. Freedom was never about escaping causes. So what else could a free choice be?',
    cite: 'A third way',
    dur: 4.8,
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
      prompt: 'So what has that third camp actually done to the chain of causes?',
      cards: [
        { text: 'Kept every link, redefined free', correct: true },
        { text: 'Shown the chain stops', correct: false },
      ],
      explain: 'The trap: "it is compatible with free will" sounds like something got rescued from the causes. Nothing did. Every domino still falls; the camp only changed the test from "was it uncaused?" to "was it forced?"',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 29, x: 140, chain: 1, front: 2, tags: 1, mark: 1,
    text: 'That camp has a name: compatibilism. David Hume, and later Harry Frankfurt, keep every cause and change the test. You act freely when the push comes from your own wants — not from a hand on your arm.',
    cite: 'Compatibilism · Hume, Frankfurt',
    dur: 5.4,
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

import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic ethics-ethics-10, "Ethics in Practice" — Singer's drowning child.
// A shallow pond stage right with a child in it, and the reader's stand-in walking
// toward it. He goes IN; the shoes are not a consideration. Then a second child
// appears far off to the left, smaller and higher up the picture, standing at the
// end of a dotted line — the same child, the same drowning, nine thousand
// kilometres of nothing in between.
//
// Both graded questions come from
// data/branches/ethics/paths/what-is-ethics/lessons/ethics-in-practice.ts. Q1 —
// what the argument turns on — is answered on the stage by tapping the factor
// Singer says carries no moral weight; Q2 is the deck question about whether the
// argument needs utilitarianism.
// ─────────────────────────────────────────────────────────────────────────────

export interface Et10Beat extends BaseBeat {
  /** Narrator gesture (emote code). */ p?: number;
  /** Narrator mark on the ground. */ x?: number;
  /** He is standing IN the water, not beside it. */ wading?: boolean;
  /**
   * He REACHES for the near child, 0…1.
   *
   * The app's own ad reel of this lesson has him wade in and lift the child out,
   * and the lesson had him stand in the water beside it with his arms at his
   * sides — which is what a reader was comparing when they said the ads' objects
   * "interact with the stickman in a very clean and actual good looking way".
   * The narration on that beat is "So you are in the water, shoes and all", and
   * A1 says the picture has to do what the words say.
   */
  reach?: number;
  /** The far child, the dotted line and its label are on. */ far?: boolean;
  /** The three factors for the tap question. */ factors?: boolean;
}

export const BEATS: Et10Beat[] = [
  {
    p: 45, x: 88,
    text: 'You are walking past a shallow pond in good shoes. There is a small child face-down in it, and nobody else anywhere.',
    dur: 3.8,
  },
  {
    p: 14, x: 168,
    text: 'Nobody deliberates. You do not price the shoes against the child.',
    cite: 'Singer’s drowning child',
    dur: 1.8,
  },
  {
    p: 14, x: 168,
    text: 'There is no comparison to make. Peter Singer’s whole argument starts from the fact that you already know this.',
    dur: 3,
  },
  {
    p: 395, x: 268, wading: true, reach: 1,
    text: 'So you are in the water, shoes and all. Now Singer asks the awkward question: which part of that reasoning was about the child being NEAR you?',
    dur: 4.4,
  },
  {
    p: 137, x: 268, wading: true, reach: 0.55,
    quote: {
      id: 'lq-ethics-ethics-10-1',
      text: 'If it is in our power to prevent something bad from happening, without thereby sacrificing anything of comparable moral importance, then we ought, morally, to do it.',
      author: 'Peter Singer',
      work: 'Famine, Affluence, and Morality',
      era: '1972',
      philosopherId: 'singer',
      branchSlugs: ['ethics'],
    },
    dur: 3.8,
  },
  {
    p: 176, x: 268, wading: true, far: true,
    text: 'There is another child. Same danger, same small cost to you, nine thousand kilometres further off.',
    cite: 'Famine, Affluence, and Morality',
    dur: 2.1,
  },
  {
    p: 176, x: 268, wading: true, far: true,
    text: 'The argument that got you into the pond does not obviously stop at the bank. Effective altruism started right there.',
    dur: 3.1,
  },
  {
    p: 47, x: 268, wading: true, far: true, factors: true,
    interact: {
      prompt: 'One child is near, one far. Tap the difference Singer says carries no moral weight.',
      explain:
        'Distance. It changes how the case feels and nothing about what is at stake. The other two are not decoys — Singer’s principle needs both: help you can actually give, at a cost that is not itself serious.',
    },
    dur: 4.8,
  },
  {
    p: 8, x: 268, wading: true, far: true,
    interact: {
      prompt: 'How much must you accept for the argument to work?',
      drag: {
        lo: 'ONE MODEST PREMISE',
        hi: 'ALL OF SINGER’S ETHICS',
        start: 1,
        zones: [
          { id: 'modest', upto: 0.3, reads: 'prevent something terrible at small cost to yourself', correct: true },
          { id: 'mid', upto: 0.66, reads: 'weigh every consequence of everything you do' },
          { id: 'all', upto: 1, reads: 'maximise the happiness of everyone, always' },
        ],
      },
      explain: 'The near end, and it is why the argument is so hard to shake. Knowing Singer is a utilitarian makes it tempting to assume the argument must be one too. It needs far less than that, and almost nobody wants to deny the premise out loud.',
    },
    dur: 4.8,
  },
  {
    summary: {
      title: 'Bringing Ethics to Life',
      points: [
        'Distance need not weaken a moral duty',
        'Singer: the far child has the same claim',
        'Effective altruism asks where good goes furthest',
        'Critics: an ethics must stay livable',
      ],
      closing: 'Theory ends where action begins, and the hard part is what you do tomorrow.',
    },
    dur: 4.0,
  },
];

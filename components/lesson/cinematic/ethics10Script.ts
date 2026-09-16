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
    p: 447, x: 88,
    text: 'Suppose you pass a shallow pond, wearing expensive shoes, and see a child drowning. No one else is nearby.',
    dur: 3.8,
  },
  {
    p: 14, x: 168,
    text: 'Almost everyone judges that you must wade in. The cost of ruined shoes is trivial beside a child’s life.',
    cite: 'Singer’s drowning child',
    dur: 1.8,
  },
  {
    p: 266, x: 168,
    text: 'Peter Singer’s argument begins from that shared judgement. It then asks what principle explains the reaction.',
    dur: 3,
  },
  {
    p: 31, x: 268, wading: true, reach: 1,
    text: 'So you wade in, despite the shoes. Singer then asks an uncomfortable question: did your reason depend on the child being near you?',
    dur: 4.4,
  },
  {
    p: 456, x: 268, wading: true, reach: 0.55,
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
    p: 467, x: 268, wading: true, far: true,
    text: 'Now suppose another child faces the same danger nine thousand kilometres away, and helping costs you just as little.',
    cite: 'Famine, Affluence, and Morality',
    dur: 2.1,
  },
  {
    p: 467, x: 268, wading: true, far: true,
    text: 'If distance makes no moral difference, the duty extends to the distant child. The argument helped inspire effective altruism.',
    dur: 3.1,
  },
  {
    p: 440, x: 268, wading: true, far: true, factors: true,
    interact: {
      prompt: 'Which of these factors does Singer argue carries no moral weight?',
      explain:
        'How far away the child is. On Singer’s view, distance changes how a case feels but not what’s at stake. The other two factors matter to his principle: you must be able to help, at no comparable moral cost.',
    },
    dur: 4.8,
  },
  {
    p: 378, x: 268, wading: true, far: true,
    interact: {
      prompt: 'How much moral theory must you accept for Singer’s argument to succeed?',
      drag: {
        lo: 'ONE MODEST PREMISE',
        hi: 'ALL OF SINGER’S ETHICS',
        start: 1,
        zones: [
          { id: 'modest', upto: 0.3, reads: 'a duty to prevent grave harm at small cost', correct: true },
          { id: 'mid', upto: 0.66, reads: 'consequences are all that matter morally' },
          { id: 'all', upto: 1, reads: 'always maximise total happiness' },
        ],
      },
      explain: 'A duty to prevent grave harm at small cost. Singer is a utilitarian, so the argument is often assumed to be utilitarian too. Yet the argument needs only the modest premise, which few people will deny.',
    },
    dur: 4.8,
  },
  {
    summary: {
      title: 'Distance and the Duty to Help',
      points: [
        'Singer argues distance doesn’t weaken the duty to help',
        'Singer holds that the far child has the same claim',
        'Effective altruism asks where help does the most good',
        'Critics object that the duty becomes too demanding',
      ],
      closing: 'If Singer is right, the argument bears directly on how much you should give to distant strangers.',
    },
    dur: 4.0,
  },
];

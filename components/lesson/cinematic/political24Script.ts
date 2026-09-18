import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic political-political-24, "The Politics Of Recognition"
// Theme: A LANGUAGE ON THE PUBLIC SIGNS, AND FIVE GENERATIONS OF SPEAKERS.
//
// Recognition sounds like manners, and told as an argument about respect it will
// keep sounding like manners. The claim is stronger than that: without a place
// in public life, a way of life stops being handed on, and the counting is not
// symbolic.
//
// So the scene puts the demand and its consequence on one stage. The plates are
// where the language is allowed to appear; the bars are how many people still
// speak it. Dim the public plates and the bars fall on their own — the reader is
// not told that recognition matters, they watch the count.
//
// GAMIFIED SHAPE:
//   · beat 3  SCENE TARGETS — tap the place that cannot keep the language alive.
//     Private goodwill is the rival, and it is the one everybody offers (H66); it
//     is lit the whole lesson and the bars fall anyway.
//   · beat 7  a LEVER — three things a state can do about a difference, from
//     ignoring it to giving it a place. The stops are a ladder, which is what a
//     lever is for.
// ─────────────────────────────────────────────────────────────────────────────

export interface Pol24Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** The three place plates and the speaker bars, 0…1. */ signs?: number;
  /** How lit the two PUBLIC plates are, 0…1 — the bars follow it. */ pub?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
  /** 1 = an ink bridge marks the two public plates as one pair (group AH). */ link?: number;
  /** 1 = a dashed line marks the split between the public pair and the private plate (group AH). */ clash?: number;
}

export const BEATS: Pol24Beat[] = [
  {
    p: 462, x: 200, signs: 1, pub: 1,
    text: 'Consider a minority language used in the courts, taught in the schools and spoken at home.',
    dur: 4.8,
  },
  {
    p: 384, x: 200, signs: 1, pub: 1, link: 1,
    text: 'Charles Taylor holds that identity is formed in dialogue with others. So due recognition is a vital human need, not a courtesy.',
    cite: 'Identity is dialogical',
    dur: 4.8,
  },
  {
    p: 447, x: 132, signs: 1, pub: 0,
    text: 'Suppose the language is removed from courts and schools but tolerated at home. Over five generations, the number of speakers falls.',
    dur: 4.6,
  },
  {
    p: 457, x: 132, signs: 1, pub: 0, live: 1,
    interact: {
      prompt: 'Which setting can’t, on its own, keep the language in use?',
      explain: 'In private. People kept speaking it at home, yet the number of speakers still fell. Toleration at home costs the majority nothing. To outsiders, courts and schools can look like a privilege. To the minority, they’re how the language survives.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 380, x: 132, signs: 1, pub: 0,
    text: 'Taylor argues that a demeaning picture reflected back by society does real damage. People may come to accept that picture of themselves.',
    cite: 'Misrecognition',
    dur: 4.8,
  },
  {
    p: 144, x: 268, signs: 1, pub: 0,
    quote: {
      id: 'lq-political-political-24-2',
      text: 'Nonrecognition or misrecognition can inflict harm, can be a form of oppression, imprisoning someone in a false, distorted, and reduced mode of being.',
      author: 'Charles Taylor',
      philosopherId: 'charles-taylor',
      work: 'The Politics of Recognition',
      era: '1992',
      branchSlugs: ['political-philosophy'],
    },
    dur: 4.6,
  },
  {
    p: 383, x: 268, signs: 1, pub: 0, clash: 1,
    text: 'Taylor sees two demands in conflict. One is to treat everyone alike, and the other is to recognise each group’s way of life.',
    dur: 4.6,
  },
  {
    p: 41, x: 268, signs: 1, pub: 0,
    interact: {
      prompt: 'Which policy would have kept the language in use across the generations?',
      sort: {
        chip: 'a minority culture',
        bins: [
          { id: 'same', label: 'treat all alike', reads: 'treat everyone identically and ignore the difference' },
          { id: 'tolerate', label: 'tolerate privately', reads: 'permit the language at home only' },
          { id: 'public', label: 'public recognition', reads: 'give it a place in public life', correct: true },
        ],
      },
      explain: 'Public recognition. Equal treatment let the speakers vanish, and private toleration didn’t save the language.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'The Politics of Recognition',
      points: [
        'Identity is built partly out of how others recognise you',
        'Misrecognition is a harm, not a discourtesy',
        'A way of life needs public standing to be handed on',
        'The politics of dignity and of difference conflict',
      ],
      closing: 'For Taylor, nonrecognition is a real harm because identity depends on how others see you.',
    },
    dur: 3.6,
  },
];

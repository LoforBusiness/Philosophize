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
}

export const BEATS: Pol24Beat[] = [
  {
    p: 25, x: 200, signs: 1, pub: 1,
    text: 'A minority language. It is printed on the court papers and taught in the schools, and at home it is simply spoken.',
    dur: 4.8,
  },
  {
    p: 2, x: 200, signs: 1, pub: 1,
    text: 'Recognition is not a courtesy added on top. We become who we are through how the people around us see us.',
    cite: 'Identity is dialogical',
    dur: 4.8,
  },
  {
    p: 45, x: 132, signs: 1, pub: 0,
    text: 'Take it out of the public places and leave the goodwill. Five generations later, this is what is left.',
    dur: 4.6,
  },
  {
    p: 4, x: 132, signs: 1, pub: 0, live: 1,
    interact: {
      prompt: 'Tap the place that cannot keep the language alive.',
      explain: 'In private. It stayed lit the whole time and the bars fell anyway. That is why this looks like a special favour from outside and like survival from inside: goodwill at home is the one form of recognition that costs nobody anything.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 380, x: 132, signs: 1, pub: 0,
    text: 'Being mirrored back as lesser, or not at all, can trap people inside a picture of themselves they never made.',
    cite: 'Misrecognition',
    dur: 4.8,
  },
  {
    p: 137, x: 268, signs: 1, pub: 0,
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
    p: 13, x: 268, signs: 1, pub: 0,
    text: 'Two demands pull apart here. Treat everybody identically, or recognise what makes each way of life its own thing.',
    dur: 4.6,
  },
  {
    p: 41, x: 268, signs: 1, pub: 0,
    interact: {
      prompt: 'Set the lever to what would keep those bars standing.',
      lever: {
        start: 0,
        stops: [
          { id: 'same', reads: 'treat everyone identically, ignore it' },
          { id: 'tolerate', reads: 'let them keep it to themselves' },
          { id: 'public', reads: 'give it a place in public life', correct: true },
        ],
      },
      explain: 'Public use. Equal dignity says treat everyone the same, and that is the setting that emptied the bars. Tolerance at home was already there and did not help. The tension is real: treating people identically can erase them, and treating them differently can divide them.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Seen, Or Not Seen',
      points: [
        'Identity is built partly out of how others recognise you',
        'Misrecognition is a harm, not a discourtesy',
        'A way of life needs public standing to be handed on',
        'Equal dignity and equal difference pull against each other',
      ],
      closing: 'Being ignored can cost a people more than being argued with.',
    },
    dur: 3.6,
  },
];

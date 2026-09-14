import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic logic-arguments-36, "What Silence Proves"
// Theme: A GRID OF PLACES YOU COULD HAVE LOOKED, AND HOW MANY YOU DID.
//
// The lesson is a proportion, so the picture is a proportion: twenty-four squares
// and a count of how many have been searched. Every square comes back empty in
// every version of the story — what changes is only how much of the room the
// reader has covered, which is exactly the variable that decides what the silence
// is worth.
//
// GAMIFIED SHAPE:
//   · beat 2  a DRAG — search the room yourself. Squares tick off under the thumb
//     and the readout moves from "you have learned nothing" to "it is not here".
//     The reader discovers the rule by sliding rather than being handed it.
//   · beat 6  a SCENE TARGET — two real searches, side by side; tap the one whose
//     empty result is worth something. Both found nothing, which is the point.
// ─────────────────────────────────────────────────────────────────────────────

export interface Logic36Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** 1 = the twenty-four-square room is drawn. */ room?: number;
  /** How much of the room has been searched, 0…1. */ done?: number;
  /** 1 = the reader's thumb is driving the search. */ live_d?: number;
  /** 1 = the two case cards stand below the room. */ cases?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Logic36Beat[] = [
  {
    p: 379, x: 58, room: 1,
    text: 'Suppose someone claims there’s an elephant in a room. The room is divided into squares, so the extent of a search can be measured.',
    dur: 3.6,
  },
  {
    p: 461, x: 58, room: 1, live_d: 1, live: 1,
    interact: {
      prompt: 'How much of the room must be searched before an empty result shows there’s no elephant?',
      drag: {
        lo: 'LOOKED NOWHERE',
        hi: 'LOOKED EVERYWHERE',
        start: 0,
        zones: [
          { id: 'none', upto: 0.3, reads: 'the empty result shows almost nothing' },
          { id: 'part', upto: 0.66, reads: 'the elephant is probably absent' },
          { id: 'all', upto: 1, reads: 'the search shows there’s no elephant', correct: true },
        ],
      },
      explain: 'The search shows there’s no elephant. Every searched square was empty at every setting. Only the share of the room covered changed, and that share decides how much an empty result proves.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 168, x: 58, room: 1, done: 1,
    text: 'An argument from absence concludes that something isn’t there because a search found nothing. Its strength depends on the search’s chance of finding the thing, had it been there.',
    dur: 4.4,
  },
  {
    p: 415, x: 58, room: 1, done: 0.15,
    text: 'Suppose you search two squares of a forest for one beetle. The empty result is almost no evidence of absence, because the forest is large and the beetle small.',
    dur: 4.6,
  },
  {
    p: 385, x: 58, room: 1, done: 0.15,
    quote: {
      id: 'lq-logic-arguments-36-1',
      text: '…a proposition is true simply on the basis that it has not been proved false, or that it is false because it has not been proved true.',
      author: 'Irving Copi',
      work: 'Introduction to Logic',
      era: '1953',
      branchSlugs: ['logic'],
    },
    dur: 3.6,
  },
  {
    p: 160, x: 58, room: 1, done: 0.15, cases: 1, live: 1,
    interact: {
      prompt: 'Both studies found nothing. Which study’s empty result is real evidence of absence?',
      explain: 'The study of forty thousand people. An effect that occurs in one person in a thousand would appear about forty times there. So finding none is evidence of absence. Among forty people, the effect would usually not appear even if it were real.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 383, x: 104, room: 1, done: 1, cases: 1,
    text: 'The saying “absence of evidence is not evidence of absence” is therefore only partly true. It applies only to a search that would probably have missed the thing.',
    dur: 4.8,
  },
  {
    p: 45, x: 104, room: 1, done: 1,
    text: 'Applied to a thorough search, the saying dismisses a genuine result. So whenever someone uses it, ask how thorough the search was.',
    dur: 4.4,
  },
  {
    summary: {
      title: 'Arguments from Absence',
      points: [
        'An empty result is as strong as the search behind it',
        'A thorough search makes absence real evidence',
        'A cursory search shows almost nothing',
        'The saying holds only for weak searches',
      ],
      closing: 'The question is whether the search would have found the thing, had it been there. That probability can usually be estimated.',
    },
    dur: 3.2,
  },
];

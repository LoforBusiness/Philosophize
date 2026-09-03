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
    p: 25, x: 58, room: 1,
    text: 'Somebody claims there is an elephant in this room. Here is the room, marked out in squares.',
    dur: 3.6,
  },
  {
    p: 4, x: 58, room: 1, live_d: 1, live: 1,
    interact: {
      prompt: 'Search it. Every square comes back empty — stop when the emptiness means something.',
      drag: {
        lo: 'LOOKED NOWHERE',
        hi: 'LOOKED EVERYWHERE',
        start: 0,
        zones: [
          { id: 'none', upto: 0.3, reads: 'you have learned nothing' },
          { id: 'part', upto: 0.66, reads: 'probably not here' },
          { id: 'all', upto: 1, reads: 'there is no elephant', correct: true },
        ],
      },
      explain: 'Nothing was found at any point on that rail. What changed was how much of the room you had covered — and that is the only thing that ever decides what an empty result is worth.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 13, x: 58, room: 1, done: 1,
    text: 'So the rule. Finding nothing counts exactly as much as your search would have found the thing, had it been there.',
    dur: 4.4,
  },
  {
    p: 415, x: 58, room: 1, done: 0.15,
    text: 'Look in two squares of a forest for one beetle and the empty result tells you almost nothing. The forest is large and the beetle is small.',
    dur: 4.6,
  },
  {
    p: 47, x: 58, room: 1, done: 0.15,
    quote: {
      id: 'lq-logic-arguments-36-1',
      text: 'Absence of evidence is evidence of absence, if the evidence should have been found.',
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
      prompt: 'Two real searches, both found nothing. Tap the one whose silence is worth something.',
      explain: 'The forty-person trial cannot see a one-in-a-thousand effect whether or not it is there, so its silence sounds the same either way. Forty thousand people would have shown it, so their silence is a result.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 383, x: 104, room: 1, done: 1, cases: 1,
    text: 'This is why the famous line is only half true. "Absence of evidence is not evidence of absence" describes a bad search and nothing else.',
    dur: 4.8,
  },
  {
    p: 45, x: 104, room: 1, done: 1,
    text: 'Used on a careful one, it is a way of ignoring a result. Say the words out loud and then ask how hard anybody looked.',
    dur: 4.4,
  },
  {
    summary: {
      title: 'How Hard Did You Look?',
      points: [
        'Empty results weigh what the search was worth',
        'A thorough search makes absence real evidence',
        'A token search makes it worth nothing',
        'The slogan is true of bad searches only',
      ],
      closing: 'The question is never whether the searcher found the thing. The question is whether the searcher would have found it, and that question usually has an answer you can work out.',
    },
    dur: 3.2,
  },
];

import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic logic-arguments-18, "Feelings and the Crowd"
// Theme: A HANDLE THAT TURNS FREELY BECAUSE IT IS CONNECTED TO NOTHING.
//
// Two fallacies with one shape: how many people believe it, and how strongly it
// makes you feel, are both inputs that are not wired to the output. So the scene
// is a machine with a deliberate hole in its linkage — a crank, a shaft, a gap
// you can see daylight through, and a needle on the far side that measures
// whether the claim is TRUE.
//
// The gap is drawn from the third beat onward, before the reader is asked to do
// anything, because the lesson is not a trick. It is an invitation to try the
// handle anyway, which is what everybody does.
//
// GAMIFIED SHAPE:
//   · beat 4  a DRAG — the reader turns the crank themselves, from one person
//     saying so to everybody saying so, and the readout keeps telling them the
//     needle has not moved. Making them do it is the whole argument; being told
//     would be a sentence they agree with and forget.
//   · beat 7  two CARDS — and then the honest correction, because a rule that
//     bans feeling anything is worse than the fallacy (H66).
// ─────────────────────────────────────────────────────────────────────────────

export interface Log18Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** How full the crowd row above the machine is, 0…1. */ crowd?: number;
  /** The crank, shaft and the hole in the middle of it, 0…1. */ gap?: number;
  /** The second linkage — evidence, properly meshed — 0…1. */ meshed?: number;
  /** Where the needle sits on TRUE…FALSE, 0…1. */ needle?: number;
  /** 1 = the crank is the reader's to turn this beat. */ live_d?: number;
}

export const BEATS: Log18Beat[] = [
  {
    p: 172, x: 200, crowd: 0.12, needle: 0.5,
    text: 'Suppose one person tells you the town’s water is safe to drink, and you know nothing else about it.',
    dur: 3.8,
  },
  {
    p: 405, x: 200, crowd: 1, needle: 0.5,
    text: 'Now suppose the whole town says the same thing, and some residents are angry with you for doubting it.',
    dur: 4.6,
  },
  {
    p: 465, x: 128, crowd: 1, gap: 1, needle: 0.5,
    text: 'In this machine, the handle stands for the number of believers and the strength of their feeling. The needle shows whether the claim is true.',
    cite: 'Popularity and feeling',
    dur: 2.4,
  },
  {
    p: 465, x: 128, crowd: 1, gap: 1, needle: 0.5,
    text: 'Treating popularity as evidence is the bandwagon fallacy. Treating strong feeling as evidence is the appeal to emotion.',
    dur: 2,
  },
  {
    p: 383, x: 128, crowd: 1, gap: 1, needle: 0.5,
    text: 'The shaft between them is broken. Popularity and feeling have no bearing on whether a claim is true.',
    dur: 3.8,
  },
  {
    p: 165, x: 128, crowd: 1, gap: 1, needle: 0.5, live_d: 1,
    interact: {
      prompt: 'If everyone asserts that the water is safe, where does the needle point?',
      drag: {
        lo: 'ONE PERSON SAYS SO',
        hi: 'EVERYBODY SAYS SO',
        start: 0.08,
        zones: [
          { id: 'few', upto: 0.35, reads: 'few people agree, and the needle hasn’t moved' },
          { id: 'many', upto: 0.72, reads: 'most agree, and the needle still hasn’t moved' },
          { id: 'all', upto: 1, reads: 'everyone agrees, and the needle is where it began', correct: true },
        ],
      },
      explain: 'Everyone agrees, and the needle is where it began. How many people hold a view, and how strongly, are facts about them, not about the water. Only evidence, such as a test, can move the needle.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 467, x: 128, crowd: 1, gap: 1, meshed: 1, needle: 0.78,
    text: 'Evidence, unlike popularity, is connected to the truth of a claim. A test of the water bears on whether it’s safe.',
    cite: 'Evidence',
    dur: 4.2,
  },
  {
    p: 137, x: 268, crowd: 1, gap: 1, meshed: 1, needle: 0.78,
    quote: {
      id: 'lq-logic-arguments-18-1',
      text: 'The fact that an opinion has been widely held is no evidence whatever that it is not utterly absurd.',
      author: 'Bertrand Russell',
      work: 'Marriage and Morals',
      era: '1929',
      philosopherId: 'bertrand-russell',
      branchSlugs: ['logic'],
    },
    dur: 3.6,
  },
  {
    p: 442, x: 268, crowd: 1, gap: 1, meshed: 1, needle: 0.78,
    interact: {
      prompt: 'Is it always a fallacy to be persuaded by a moving story?',
      cards: [
        { text: 'No, the story may be evidence', correct: true },
        { text: 'Yes, stories are never evidence', correct: false },
      ],
      explain: 'A moving story may be evidence. One case can show that something is possible, or what a policy does to a person. The fallacy is letting the feeling replace the reasons, not being moved at all.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Popularity, Feeling and Truth',
      points: [
        'The bandwagon fallacy treats popularity as evidence of truth',
        'The appeal to emotion treats feeling as evidence of truth',
        'Both are facts about believers, not about the claim',
        'A story supports a claim only when it is evidence',
      ],
      closing: 'Before accepting a claim, ask whether the reason offered bears on its truth.',
    },
    dur: 3.2,
  },
];

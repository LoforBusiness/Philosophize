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
    p: 25, x: 200, crowd: 0.12, needle: 0.5,
    text: 'One person says the water here is safe. You have no idea whether it is.',
    dur: 3.8,
  },
  {
    p: 2, x: 200, crowd: 1, needle: 0.5,
    text: 'Now the whole town says the same thing. Every voice, loudly, and a few are upset with you for asking.',
    dur: 4.6,
  },
  {
    p: 45, x: 128, crowd: 1, gap: 1, needle: 0.5,
    text: 'Here is the machinery. The handle is what they turn. The needle is whether the water is safe.',
    cite: 'Look at the middle',
    dur: 4.4,
  },
  {
    p: 13, x: 128, crowd: 1, gap: 1, needle: 0.5,
    text: 'There is a hole in the shaft. Nothing that happens on the left reaches the right.',
    dur: 3.8,
  },
  {
    p: 4, x: 128, crowd: 1, gap: 1, needle: 0.5, live_d: 1,
    interact: {
      prompt: 'Turn it up. Take it all the way to everybody, and watch the needle.',
      drag: {
        lo: 'ONE PERSON SAYS SO',
        hi: 'EVERYBODY SAYS SO',
        start: 0.08,
        zones: [
          { id: 'few', upto: 0.35, reads: 'the needle has not moved' },
          { id: 'many', upto: 0.72, reads: 'the needle still has not moved' },
          { id: 'all', upto: 1, reads: 'exactly where it started', correct: true },
        ],
      },
      explain: 'Nothing happened, because nothing is connected. How many people hold a view, and how loudly, are facts about the people. The needle measures whether the claim is true, and no amount of turning that handle reaches it.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 21, x: 128, crowd: 1, gap: 1, meshed: 1, needle: 0.78,
    text: 'Here is the other kind of link. Somebody tested the water, and this shaft has no hole in it.',
    cite: 'What does reach it',
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
    p: 41, x: 268, crowd: 1, gap: 1, meshed: 1, needle: 0.78,
    interact: {
      prompt: 'So is it always wrong to be moved by a story?',
      cards: [
        { text: 'No, if the story is evidence', correct: true },
        { text: 'Yes, feelings are never relevant', correct: false },
      ],
      explain: 'No. A story can be real evidence. One case can show that a thing is possible, or what a policy does to a person. The fallacy is using the feeling instead of the reason, not feeling anything at all.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'The Handle and the Needle',
      points: [
        'Bandwagon treats how many believe it as evidence',
        'Appeal to emotion treats how it feels as evidence',
        'Both are facts about the audience, not about the claim',
        'A story counts when it is evidence, not when it is moving',
      ],
      closing: 'Ask what is on the other end of the handle before you pull it.',
    },
    dur: 3.2,
  },
];

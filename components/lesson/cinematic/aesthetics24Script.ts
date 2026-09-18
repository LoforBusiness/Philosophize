import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic aesthetics-aesthetics-24, "Does a Copy Kill the Magic?"
// Theme: ONE PANEL IN ONE ROOM, AND FOUR COPIES OF IT GETTING SMALLER.
//
// The aura is the easiest idea in this branch to get wrong in one direction:
// people hear it as "originals are better" and file it with snobbery. It is not
// a quality judgement. It is a claim about WHERE a thing is, and the copies in
// this scene are drawn perfectly faithfully on purpose — nothing is missing from
// them that a camera could have caught.
//
// It is also the easiest to get wrong in the other direction, by mourning. The
// argument has a second half: what withers releases the work from one room, and
// that is counted as a gain rather than a consolation.
//
// GAMIFIED SHAPE:
//   · beat 3  SCENE TARGETS — tap what a perfect scan does not copy. Both rivals
//     are things a scan copies beautifully, which is the point of choosing them
//     (H66); readers reach for something visual and there is nothing visual to
//     reach for.
//   · beat 7  a PLOT — the aura across five ways of meeting the same picture. It
//     is a curve, no pick can hold one, and the two wrong shapes are the two
//     ways the idea is usually misread.
// ─────────────────────────────────────────────────────────────────────────────

export interface Aes24Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** The original panel in its frame, 0…1. */ panel?: number;
  /** The four copies, 0…1. */ copies?: number;
  /** The three plates under the picture, 0…1. */ plates?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
  /** 1 = a line grows from the panel past the last copy — the work's reach, freed from the room. */ reach?: number;
}

export const BEATS: Aes24Beat[] = [
  {
    p: 172, x: 200, panel: 1,
    text: 'Consider a painted panel that has hung in one room for five hundred years. Visitors travel across the world to stand before it.',
    dur: 4.8,
  },
  {
    p: 2, x: 200, panel: 1, copies: 1,
    text: 'A print, a poster, a screen and a feed reproduce the picture everywhere at once. Yet none of them occupies the original’s place.',
    cite: 'Mechanical reproduction',
    dur: 4.8,
  },
  {
    p: 45, x: 132, panel: 1, copies: 1, plates: 1,
    text: 'Walter Benjamin called what the copies lack the aura. It concerns a work’s unique presence in time and space, not its quality.',
    cite: 'The aura',
    dur: 4.8,
  },
  {
    p: 165, x: 132, panel: 1, copies: 1, plates: 1, live: 1,
    interact: {
      prompt: 'Which feature of the panel does even a perfect scan fail to reproduce?',
      explain: 'The history of being here. A scan reproduces the brushstrokes and the colours in full detail, so neither visual answer is right. What no scan reproduces is the panel’s own history in its place.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 380, x: 132, panel: 1, copies: 1, plates: 1,
    text: 'An altarpiece stood in one church, and pilgrims travelled to see it. A film has no original print that viewers must travel to.',
    dur: 4.6,
  },
  {
    p: 137, x: 268, panel: 1, copies: 1, plates: 1,
    quote: {
      id: 'lq-aesthetics-aesthetics-24-2',
      text: 'That which withers in the age of mechanical reproduction is the aura of the work of art.',
      author: 'Walter Benjamin',
      philosopherId: 'walter-benjamin',
      work: 'The Work of Art in the Age of Mechanical Reproduction',
      era: '1935',
      branchSlugs: ['aesthetics'],
    },
    dur: 4.2,
  },
  {
    p: 13, x: 268, panel: 1, copies: 1, plates: 1, reach: 1,
    text: 'Benjamin also saw a gain in this loss. Freed from ritual, a work can reach everybody and take on a political function.',
    dur: 4.8,
  },
  {
    p: 383, x: 268, panel: 1, copies: 1, plates: 1,
    interact: {
      prompt: 'Which curve shows what happens to the aura as copies multiply?',
      plot: {
        axis: 'HOW MUCH AURA',
        cols: ['THE PANEL', 'A PRINT', 'A POSTER', 'A SCREEN', 'A FEED'],
        start: [0.5, 0.5, 0.5, 0.5, 0.5],
        shapes: [
          { id: 'withers', profile: [1, 0.44, 0.3, 0.18, 0.08], reads: 'it withers as copies multiply', correct: true },
          { id: 'holds', profile: [1, 0.92, 0.9, 0.88, 0.85], reads: 'it survives every copy' },
          { id: 'gone', profile: [1, 0.05, 0.04, 0.03, 0.02], reads: 'the first copy destroys it' },
        ],
      },
      explain: 'The aura withers as copies multiply. Benjamin’s verb, “withers”, describes a slow decline, so one copy doesn’t destroy the aura. A flat curve would mean copies leave the aura intact.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Benjamin and the Aura',
      points: [
        'The aura is a work’s unique presence in time and space',
        'A faithful copy still lacks the original’s aura',
        'Reproduction makes the aura wither gradually',
        'Art freed from ritual can reach the masses',
      ],
      closing: 'A work’s authenticity lies in its history in time and space. No reproduction, however exact, can copy that history.',
    },
    dur: 3.6,
  },
];

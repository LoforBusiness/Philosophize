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
}

export const BEATS: Aes24Beat[] = [
  {
    p: 25, x: 200, panel: 1,
    text: 'One panel, in one room, where it has hung for five hundred years. People cross oceans to stand in front of it.',
    dur: 4.8,
  },
  {
    p: 2, x: 200, panel: 1, copies: 1,
    text: 'A print, a poster, a screen, a feed. The same picture everywhere at once, and none of them is here.',
    cite: 'Mechanical reproduction',
    dur: 4.8,
  },
  {
    p: 45, x: 132, panel: 1, copies: 1, plates: 1,
    text: 'What the copies leave behind has a name. Walter Benjamin called it the aura, and it is not about quality.',
    cite: 'The aura',
    dur: 4.8,
  },
  {
    p: 4, x: 132, panel: 1, copies: 1, plates: 1, live: 1,
    interact: {
      prompt: 'Tap what a perfect scan does not copy.',
      explain: 'The history of being here. A scan takes the brushstrokes and the colours down to the cracks, so people reach for something visual and find nothing. What no scan can take is that this panel stood in this room through everything that happened.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 21, x: 132, panel: 1, copies: 1, plates: 1,
    text: 'An altarpiece sat in one church and pilgrims travelled to it. A film has no original print to travel to.',
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
    p: 13, x: 268, panel: 1, copies: 1, plates: 1,
    text: 'He was not only mourning. Cut loose from one room, a work reaches everybody, and it can argue rather than decorate.',
    dur: 4.8,
  },
  {
    p: 41, x: 268, panel: 1, copies: 1, plates: 1,
    interact: {
      prompt: 'Draw how the aura goes as the copies multiply.',
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
      explain: 'It withers, and the first copy does not finish it. Benjamin chose the word withering, not killing, and he was not mourning either. Cut loose from one room, art reaches everybody, and that is counted as a gain.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Here, Once, And Nowhere Else',
      points: [
        'The aura is a work being in one place and time',
        'Copies can be faithful and still not carry it',
        'Reproduction makes it wither rather than snap',
        'What is lost in ritual is gained in reach',
      ],
      closing: 'Authenticity is not in the pixels. It is in the object having stood somewhere.',
    },
    dur: 3.6,
  },
];

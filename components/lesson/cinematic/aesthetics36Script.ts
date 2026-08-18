import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic aesthetics-aesthetics-36, "Does a Photograph Tell the Truth?"
// Theme: ONE SQUARE, ONE VIEWFINDER, AND THE READER CHOOSING THE EDGES.
//
// The stage is a wide strip of a real place: a dense crowd at one end, a thinning
// middle, one man alone at the other. Above it a viewfinder the reader slides.
// Nothing inside it is ever altered — the marks do not move, appear or vanish —
// and the caption under the finder keeps changing anyway.
//
// That is the argument, and it cannot be made in a sentence as well as it can be
// made with a thumb. The reader produces three incompatible true photographs of
// one square in about four seconds.
//
// GAMIFIED SHAPE:
//   · beat 2  a DRAG — slide the frame. The readout is the headline the picture
//     would run under, so the reader watches themself write three of them.
//   · beat 6  two CARDS — whether heavy editing makes it something else. A card
//     question on purpose: it is the one beat here that is genuinely a fork
//     rather than something to be looked at.
// ─────────────────────────────────────────────────────────────────────────────

export interface Aesthetics36Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** 1 = the square and its people are drawn. */ square?: number;
  /** Where the viewfinder sits, 0 (the crowd) … 1 (the lone man). */ crop?: number;
  /** 1 = the reader's thumb is driving the viewfinder. */ live_d?: number;
  /** 1 = the two printed results hang below, both true. */ prints?: number;
}

export const BEATS: Aesthetics36Beat[] = [
  {
    p: 25, x: 54, square: 1,
    text: 'One square, one afternoon. Busy at this end, empty at that one. Everything you can see is really there.',
    dur: 3.8,
  },
  {
    p: 4, x: 54, square: 1, live_d: 1,
    interact: {
      prompt: 'Slide the viewfinder. Read what your photograph would be captioned.',
      drag: {
        lo: 'FRAME THE CROWD',
        hi: 'FRAME THE MAN',
        start: 0.5,
        zones: [
          { id: 'packed', upto: 0.3, reads: 'THOUSANDS TURN OUT' },
          { id: 'mid', upto: 0.68, reads: 'A MODEST TURNOUT', correct: true },
          { id: 'alone', upto: 1, reads: 'NOBODY CAME' },
        ],
      },
      explain: 'Three photographs of one square, and not one is faked. The middle scores because it is the only frame that takes no side. It is still a choice, made by you. The picture will not mention that.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 13, x: 54, square: 1, crop: 0.5, prints: 1,
    text: 'Nothing was altered. No pixel was moved. Both prints are accurate and they disagree about what happened.',
    dur: 4.4,
  },
  {
    p: 21, x: 54, square: 1, crop: 0.5, prints: 1,
    text: 'Photographs get this power from feeling transparent. Light came off the thing and landed here. So we say we are seeing the square, not a record of it.',
    dur: 4.8,
  },
  {
    p: 47, x: 54, square: 1, crop: 0.5, prints: 1,
    quote: {
      id: 'lq-aesthetics-aesthetics-36-1',
      text: 'The photograph is literally an emanation of the referent.',
      author: 'Roland Barthes',
      work: 'Camera Lucida',
      era: '1980',
      branchSlugs: ['aesthetics'],
    },
    dur: 3.6,
  },
  {
    p: 35, x: 128, square: 1, crop: 0.5, prints: 1,
    interact: {
      prompt: 'So does heavy editing turn a photograph into something else?',
      cards: [
        { text: 'No line — only the promise', correct: true },
        { text: 'Yes, any edit at all', correct: false },
      ],
      explain: 'Every photograph is processed. Exposure, contrast, and the crop you just chose. What changes between a news picture and an advertisement is not the pixels but what the viewer was promised about them, and breaking that is what counts as a lie.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 12, x: 128, square: 1, crop: 0.14, prints: 1,
    text: 'A painting nobody suspects of neutrality does less damage here. We know a painter chose. We forget that a photographer did.',
    dur: 4.6,
  },
  {
    summary: {
      title: 'Everything Here Is True',
      points: [
        'A photograph feels like seeing the thing itself',
        'That trust is what gives the frame its power',
        'A crop misleads with nothing fabricated',
        'The line is the promise made, not the pixels',
      ],
      closing: 'Do not ask whether the photograph is accurate. Ask what it was cropped away from, and who was holding the camera.',
    },
    dur: 3.2,
  },
];

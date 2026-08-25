import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic political-political-21, "Is Any State Legitimate?"
// Theme: A MAP WITH EVERY INCH CLAIMED, AND ONE CELL NOBODY WOULD WANT.
//
// Tacit consent is the argument almost everybody has heard and almost nobody has
// examined, because "you agreed by staying" sounds reasonable until you ask what
// leaving would involve. So the whole argument is a map: fifteen cells, fourteen
// of them somebody's, and an arrow that keeps trying to leave and keeps arriving
// somewhere just as governed.
//
// The fifteenth cell is the honest bit. There IS unclaimed ground, and it is the
// deep ocean, and the fact that the offer is technically open is exactly what
// makes it worthless as consent.
//
// GAMIFIED SHAPE:
//   · beat 5  SCENE TARGETS — four cells, tap the only ground no state claims.
//     The reader has to actually read the map, and the answer being real rather
//     than a trick is what sets up the argument that follows (H66).
//   · beat 7  two CARDS — what would be needed to make staying count as agreeing,
//     which is where philosophical anarchism actually bites.
// ─────────────────────────────────────────────────────────────────────────────

export interface Pol21Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** The map's cells, 0…1. */ map?: number;
  /** How many cells have been marked as claimed, 0…1. */ claimed?: number;
  /** The leaving arrow, hopping cell to cell, 0…1. */ exit?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Pol21Beat[] = [
  {
    p: 25, x: 200, map: 1,
    text: 'You never signed anything. No state has ever had your signature on a page.',
    dur: 3.8,
  },
  {
    p: 45, x: 200, map: 1, claimed: 1,
    text: 'The usual answer is that you agreed by staying. Carry on living here and you have accepted the terms.',
    cite: 'Tacit consent',
    dur: 4.6,
  },
  {
    p: 2, x: 132, map: 1, claimed: 1, exit: 1,
    text: 'So try leaving. Hop to the next square and somebody already governs it. And the next.',
    dur: 4.0,
  },
  {
    p: 13, x: 132, map: 1, claimed: 1, exit: 1,
    text: 'There is exactly one square nobody has claimed, and you cannot live on it.',
    cite: 'The open sea',
    dur: 3.8,
  },
  {
    p: 4, x: 132, map: 1, claimed: 1, exit: 1, live: 1,
    interact: {
      prompt: 'Tap the only ground no state claims.',
      explain: 'The open sea, and the sea is no comfort. A choice counts as agreement only when refusing was really open to you. Leaving takes money, papers, a new language and another state at the far end. So almost everybody stays, whatever they think.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 137, x: 268, map: 1, claimed: 1, exit: 1,
    quote: {
      id: 'lq-political-political-21-2',
      text: 'Can we seriously say that a poor peasant or artisan has a free choice to leave his country, when he knows no foreign language and lives from day to day by the small wages which he acquires?',
      author: 'David Hume',
      work: 'Of the Original Contract',
      era: '1748',
      philosopherId: 'david-hume',
      branchSlugs: ['political-philosophy'],
    },
    dur: 4.2,
  },
  {
    p: 21, x: 268, map: 1, claimed: 1, exit: 1,
    text: 'Philosophical anarchism stops right there. The view does not call for a riot. The view says the state never earned the authority it claims.',
    cite: 'The modest conclusion',
    dur: 4.8,
  },
  {
    p: 41, x: 268, map: 1, claimed: 1, exit: 1,
    interact: {
      prompt: 'Set the lever to what would make staying count as agreeing.',
      lever: {
        start: 0,
        stops: [
          { id: 'know', reads: 'knowing that the law exists' },
          { id: 'stay', reads: 'staying put rather than leaving' },
          { id: 'refuse', reads: 'having a refusal you could actually take', correct: true },
        ],
      },
      explain: 'The far setting. Consent gets its force from the alternative being genuinely open, which is why a signature under threat binds nobody. The first setting describes being informed, and being informed of a demand is not the same as accepting it.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'The Agreement Nobody Made',
      points: [
        'Consent theory grounds the state in an agreement you never signed',
        'Tacit consent says staying counts as agreeing',
        'Leaving is only consent-like if refusing is genuinely open',
        'Philosophical anarchism denies authority without demanding revolt',
      ],
      closing: 'Every square is spoken for except the water, and nobody lives there.',
    },
    dur: 3.4,
  },
];

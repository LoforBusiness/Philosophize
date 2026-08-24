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
      explain: 'The open sea, and it is not a consolation. A choice counts as agreement when refusing was genuinely available. Leaving means money, papers, a language and another state at the far end, so staying is what almost everybody does whatever they think.',
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
    text: 'Philosophical anarchism stops right there. It does not say to riot. It says the state has never earned the authority it claims.',
    cite: 'The modest conclusion',
    dur: 4.8,
  },
  {
    p: 41, x: 268, map: 1, claimed: 1, exit: 1,
    interact: {
      prompt: 'What would make staying somewhere count as agreeing to it?',
      cards: [
        { text: 'A real option to refuse', correct: true },
        { text: 'Knowing the law exists', correct: false },
      ],
      explain: 'A refusal you could actually take. Consent gets its force from the alternative being open, which is why a signature under threat binds nobody. The other card describes being informed, and being informed of a demand is not agreeing to it.',
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

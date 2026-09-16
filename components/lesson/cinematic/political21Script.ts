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
    p: 172, x: 200, map: 1,
    text: 'Consent theory holds that a state’s authority rests on the agreement of the people it governs. Yet you’ve never signed such an agreement.',
    dur: 3.8,
  },
  {
    p: 447, x: 200, map: 1, claimed: 1,
    text: 'One reply is tacit consent. John Locke argued that anyone who lives on a state’s territory thereby consents to obey its laws.',
    cite: 'Tacit consent',
    dur: 4.6,
  },
  {
    p: 2, x: 132, map: 1, claimed: 1, exit: 1,
    text: 'The argument assumes you stay by choice, because you could leave. But every place you could move to is governed by another state.',
    dur: 3.3,
  },
  {
    p: 266, x: 132, map: 1, claimed: 1, exit: 1,
    text: 'Leaving one state only places you under the authority of another.',
    dur: 1.8,
  },
  {
    p: 400, x: 132, map: 1, claimed: 1, exit: 1,
    text: 'Almost all habitable land is claimed by some state. The open sea is unclaimed, but no one can make a home there.',
    cite: 'The open sea',
    dur: 3.8,
  },
  {
    p: 165, x: 132, map: 1, claimed: 1, exit: 1, live: 1,
    interact: {
      prompt: 'Which ground could you move to without coming under another state’s claim?',
      explain: 'The open sea. Every other cell belongs to a state, and no one can make a home at sea. Staying counts as consent only if leaving is a real option. Yet emigrating takes money, documents and another state’s permission.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 465, x: 268, map: 1, claimed: 1, exit: 1,
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
    p: 176, x: 268, map: 1, claimed: 1, exit: 1,
    text: 'Philosophical anarchism draws a limited conclusion from such arguments. It does not call for revolt against the state.',
    cite: 'The modest conclusion',
    dur: 2.6,
  },
  {
    p: 176, x: 268, map: 1, claimed: 1, exit: 1,
    text: 'The view holds only that no existing state has earned the authority it claims. There may still be moral reasons to obey many particular laws.',
    dur: 2.2,
  },
  {
    p: 383, x: 268, map: 1, claimed: 1, exit: 1,
    interact: {
      prompt: 'What would it take for staying in a state to count as consent?',
      sort: {
        chip: 'consent to the state',
        bins: [
          { id: 'know', label: 'knowing the law', reads: 'being informed of what the law requires' },
          { id: 'stay', label: 'remaining resident', reads: 'continuing to live on the state’s territory' },
          { id: 'refuse', label: 'a feasible refusal', reads: 'a way to refuse that is open in practice', correct: true },
        ],
      },
      explain: 'A feasible refusal. Consent binds only when you could refuse in practice. That’s why a signature made under threat binds no one. Remaining resident shows nothing if you can’t leave. Knowing the law means knowing a demand, not accepting it.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Tacit Consent and Its Limits',
      points: [
        'Consent theory grounds authority in the agreement of the governed',
        'Tacit consent says staying counts as agreeing',
        'Staying counts as consent only if leaving is a real option',
        'Philosophical anarchism denies authority without demanding revolt',
      ],
      closing: 'Where nearly all habitable land is claimed and leaving is costly, staying can’t show consent to a state’s authority.',
    },
    dur: 3.4,
  },
];

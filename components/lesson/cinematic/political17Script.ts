import type { BaseBeat } from './cinematicKit';

// Cinematic political-political-17, "Why Should You Obey?"
//
// THE PICTURE: a village well, a rota with everybody's turns ticked off, and one
// row with no name on it. The newcomer never agreed to anything and drinks from the
// well every day (H64).
//
// This is the branch's second lesson about political obligation and it must not
// repeat the first. The contract lesson is a WALL built from surrendered liberty
// and the question is what you handed over. Here nothing is handed over and nobody
// agrees to anything — the duty comes out of the drinking, which is why the rota
// and not the well is where the argument lives.
//
// STAGING: the Q1 decoys are consent and majority rule — the two answers everybody
// gives first, and the two that fair play deliberately does without (H66).

export interface Pol17Beat extends BaseBeat {
  /** Figure gesture (emote code). */ g?: number;
  /** The well, 0…1. */ well?: number;
  /** How many turns are ticked on the rota, 0…4. */ turns?: number;
  /** The newcomer's blank row, 0…1. */ blank?: number;
  /** How full his cup is — how much he has taken, 0…1. */ taken?: number;
  /** 1 = the three boards are live targets (Q1). */ pick?: number;
  /** 1 = nobody else signed either: the blank is general, not his. */ nobody?: number;
  /** 1 = the signature board is ruled through: what counts is the benefit. */ owe?: number;
}

export const BEATS: Pol17Beat[] = [
  {
    g: 379, well: 1, turns: 4,
    dur: 4.6,
    text: 'Consider a village that digs a well together and keeps a rota for hauling water. Everyone takes a turn and everyone drinks, but no one signed an agreement.',
  },
  {
    g: 415, well: 1, turns: 4, blank: 1, taken: 1,
    dur: 4.8,
    text: 'A newcomer drinks from the well daily, but his row on the rota is empty. When his turn comes, he says he never agreed to haul.',
    cite: 'No agreement made',
  },
  {
    g: 432, well: 1, turns: 4, blank: 1, taken: 1,
    dur: 4.8,
    nobody: 1,
    text: 'The newcomer is right that he never consented. Almost no citizen has ever given express consent to the state either, which is a problem for consent theories.',
    cite: 'The problem for consent',
  },
  {
    g: 456, well: 1, turns: 4, blank: 1, taken: 1,
    dur: 3.8,
    quote: {
      id: 'lq-political-political-17-1',
      text: 'Can we seriously say, that a poor peasant or artizan has a free choice to leave his country, when he knows no foreign language or manners?',
      author: 'David Hume',
      work: 'Of the Original Contract',
      era: '1748',
      philosopherId: 'david-hume',
      branchSlugs: ['political-philosophy'],
    },
  },
  {
    g: 433, well: 1, turns: 4, blank: 1, taken: 1,
    dur: 5.0,
    owe: 1,
    text: 'So fair play stops asking about signatures. Hart argued that people who benefit from a shared scheme owe a share of the burdens.',
    cite: 'Fair play',
  },
  {
    g: 165, well: 1, turns: 4, blank: 1, taken: 1, pick: 1,
    dur: 1.0,
    interact: {
      prompt: 'On the principle of fair play, what creates the newcomer’s duty to haul?',
      explain: 'The water he drank. Fair play requires no signature and no vote, only that he accepted a benefit others work to provide. On this view, his empty row is a failure of duty, not an excuse.',
      xp: 5,
    },
  },
  {
    g: 442, well: 1, turns: 4, blank: 1, taken: 1,
    dur: 1.0,
    interact: {
      prompt: 'If no one consented, what could ground an obligation to take a turn?',
      sort: {
        chip: 'the duty to haul',
        bins: [
          { id: 'sign', label: 'a signature', reads: 'no duty exists without a signature' },
          { id: 'quiet', label: 'staying put', reads: 'tacit consent, given by staying put' },
          { id: 'benefit', label: 'taking the benefit', reads: 'accepting the benefit of the scheme', correct: true },
        ],
      },
      explain: 'Taking the benefit. Demanding a signature assumes consent is the only source of duty, and fair play rejects that assumption. Hume argued that staying put isn’t consent, since most people have no free choice to leave.',
      xp: 5,
    },
  },
  {
    summary: {
      title: 'The Principle of Fair Play',
      points: [
        'Consent theories need an agreement almost nobody made',
        'Fair play grounds the duty in benefits you accept',
        'Accepting the benefit creates a duty to contribute',
        'Free-riding is enjoying cooperation while refusing to cooperate',
      ],
      closing: 'On the fair-play view, accepting the benefits of a society can oblige you to share its burdens.',
    },
    dur: 3.0,
  },
];

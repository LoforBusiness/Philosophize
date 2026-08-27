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
}

export const BEATS: Pol17Beat[] = [
  {
    g: 25, well: 1, turns: 4,
    dur: 4.6,
    text: 'A village digs a well together and keeps a rota. Everyone hauls, everyone drinks, and nobody signed anything.',
  },
  {
    g: 45, well: 1, turns: 4, blank: 1, taken: 1,
    dur: 4.8,
    text: 'A newcomer drinks from it daily. His row on the rota is empty, and when his turn comes he points at that.',
    cite: 'I never signed up',
  },
  {
    g: 13, well: 1, turns: 4, blank: 1, taken: 1,
    dur: 4.8,
    text: 'He is right about the signature. Almost nobody has ever agreed to the state they live under either, which is the awkward part.',
    cite: 'And he is right',
  },
  {
    g: 137, well: 1, turns: 4, blank: 1, taken: 1,
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
    g: 5, well: 1, turns: 4, blank: 1, taken: 1,
    dur: 5.0,
    text: 'So fair play stops asking about signatures. If you take what a shared effort produces, you owe your share of producing it.',
    cite: 'Fair play',
  },
  {
    g: 4, well: 1, turns: 4, blank: 1, taken: 1, pick: 1,
    dur: 1.0,
    interact: {
      prompt: 'Tap what creates the newcomer\'s duty.',
      explain: 'The water he drank. Fair play needs no signature and no vote — it needs him to have taken the benefit of something other people are carrying. That is why the empty row is damning rather than an excuse: he is on the rota already, by drinking.',
      xp: 5,
    },
  },
  {
    g: 41, well: 1, turns: 4, blank: 1, taken: 1,
    dur: 1.0,
    interact: {
      prompt: 'Set the lever to where the duty comes from.',
      lever: {
        start: 0,
        stops: [
          { id: 'sign', reads: 'nowhere; without a signature there is no duty' },
          { id: 'quiet', reads: 'from consenting quietly, by staying put' },
          { id: 'benefit', reads: 'from taking the benefit, signature or not', correct: true },
        ],
      },
      explain: 'The far setting. The first assumes consent is the only place a duty could come from, and that assumption is exactly what fair play drops. Hume had already shown consent could not carry the weight, because nobody was ever offered a genuine choice to refuse.',
      xp: 5,
    },
  },
  {
    summary: {
      title: 'Why Obey',
      points: [
        'Consent theories need an agreement almost nobody made',
        'Fair play grounds the duty in benefits you accept',
        'Taking the water puts you on the rota',
        'Free-riding is enjoying cooperation while refusing to cooperate',
      ],
      closing: 'You never signed anything. You have been drinking from it your whole life.',
    },
    dur: 3.0,
  },
];

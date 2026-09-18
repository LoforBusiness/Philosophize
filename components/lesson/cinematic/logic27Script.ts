import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic logic-arguments-27, "This Sentence Is False"
// Theme: A CARD THAT POINTS AT ITSELF, AND TWO LAMPS THAT NEVER SETTLE.
//
// A paradox is a thing that will not come to rest, so the two lamps alternate on
// the scene clock and go on alternating whether or not the reader is touching
// anything (Z7). Nothing in the picture ever settles, which is the finding, and a
// still frame of it would look like an ordinary diagram of two options.
//
// The self-reference is drawn as a bracket that leaves the card and returns to the
// same card. It is one mark rather than an arrow to a second copy: the whole
// trouble is that there is no second sentence for it to be about.
//
// GAMIFIED SHAPE:
//   · beat 4  SCENE TARGETS — three plates, and the reader takes the first step
//     of the argument. On the stage because the lamps are already flipping above
//     them, which is where the step leads.
//   · beat 8  a POLL — what logic should do about it. The answer either darkens
//     both lamps, cuts the bracket, or lights both at once.
// ─────────────────────────────────────────────────────────────────────────────

export interface Logic27Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** 1 = the card carrying the sentence is drawn. */ card?: number;
  /** 1 = the bracket showing the sentence point at itself is drawn. */ loop?: number;
  /** 1 = the two truth lamps are under it, alternating. */ lamps?: number;
  /** 1 = the three plates the reader chooses between are up. */ plates?: number;
  /** 1 = a ring marks the FALSE lamp — the supposition being tested this beat. */ testFalse?: number;
  /** 1 = a tag below the lamps says the shape recurs beyond this one sentence. */ elsewhere?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Logic27Beat[] = [
  {
    p: 356, x: 28, card: 1,
    text: 'Consider the sentence “this sentence is false”. Is the sentence true, or is it false?',
    dur: 4.2,
  },
  {
    p: 169, x: 28, card: 1, lamps: 1,
    text: 'Suppose the sentence is true. Then what it says is the case, so it’s false.',
    dur: 4.0,
  },
  {
    p: 429, x: 28, card: 1, lamps: 1, testFalse: 1,
    text: 'Suppose instead that the sentence is false. Then what it says isn’t the case, so the sentence is true.',
    dur: 4.0,
  },
  {
    p: 259, x: 28, card: 1, loop: 1, lamps: 1,
    text: 'The source of the trouble is self-reference. An ordinary sentence describes the world, but this one describes itself.',
    dur: 5.0,
  },
  {
    p: 261, x: 28, card: 1, loop: 1, lamps: 1, plates: 1, live: 1,
    interact: {
      prompt: 'If a sentence that calls itself false is true, what follows?',
      explain: 'It is false. A true sentence describes the world accurately, and this sentence describes itself as false. Supposing the sentence false leads back to truth, so neither truth value is stable.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 421, x: 88, card: 1, loop: 1, lamps: 1,
    text: 'This is the liar paradox, often credited to Eubulides of Miletus. Epimenides, a Cretan, said that his own people always lie, though the claim can be false without contradiction.',
    dur: 4.6,
  },
  {
    p: 430, x: 88, card: 1, loop: 1, lamps: 1,
    quote: {
      id: 'lq-logic-arguments-27-1',
      text: 'The universality of colloquial language is presumably the primary source of all semantical antinomies.',
      author: 'Alfred Tarski',
      work: 'The Semantic Conception of Truth',
      era: '1944',
      branchSlugs: ['logic'],
    },
    dur: 4.8,
  },
  {
    p: 348, x: 88, card: 1, loop: 1, lamps: 1, elsewhere: 1,
    text: 'Bertrand Russell found a similar paradox in set theory. Kurt Gödel used self-reference to prove his incompleteness theorems.',
    dur: 5.0,
  },
  {
    p: 266, x: 88, card: 1, loop: 1, lamps: 1,
    interact: {
      prompt: 'Which response to the liar paradox also blocks its strengthened versions?',
      poll: {
        options: [
          { id: 'gap', reads: 'give it no truth value at all', holders: ['Saul Kripke'] },
          { id: 'ban', reads: 'express truth only in a richer language', holders: ['Alfred Tarski'], correct: true },
          { id: 'both', reads: 'accept that it’s both true and false', holders: ['Graham Priest'] },
        ],
      },
      explain: 'Express truth only in a richer language. A language’s truth predicate belongs to a metalanguage, so no sentence can call itself untrue. A gap fails against “this sentence is not true”, which would then be true.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 322, x: 88, card: 1, loop: 1, lamps: 1,
    summary: {
      title: 'No Stable Value',
      points: [
        'Each supposition about its truth leads to the other',
        'The cause is self-reference joined to a denial',
        'Eubulides discussed it in the fourth century BC',
        'The repairs reshaped logic and mathematics',
      ],
      closing: 'Paradoxes of self-reference reshaped set theory and underlie Gödel’s incompleteness theorems.',
    },
    dur: 4.8,
  },
];

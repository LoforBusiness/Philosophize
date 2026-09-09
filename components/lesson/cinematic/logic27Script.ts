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
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Logic27Beat[] = [
  {
    p: 356, x: 28, card: 1,
    text: 'Read the card, then try to decide whether it is telling the truth.',
    dur: 4.2,
  },
  {
    p: 169, x: 28, card: 1, lamps: 1,
    text: 'Suppose the card speaks true. Then what it says holds, and the card is false.',
    dur: 4.0,
  },
  {
    p: 429, x: 28, card: 1, lamps: 1,
    text: 'Suppose the card speaks false. Then what it says is wrong, and the card is true.',
    dur: 4.0,
  },
  {
    p: 259, x: 28, card: 1, loop: 1, lamps: 1,
    text: 'The culprit is the pointing. An ordinary sentence describes the world; this one describes itself.',
    dur: 5.0,
  },
  {
    p: 261, x: 28, card: 1, loop: 1, lamps: 1, plates: 1, live: 1,
    interact: {
      prompt: 'Suppose the card is true. Tap what follows.',
      explain: 'The card comes out FALSE. A true card says what it says, and what the card says is that the card is false. Every branch of the argument flips the same way, so nothing ever comes to rest.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 421, x: 88, card: 1, loop: 1, lamps: 1,
    text: 'Epimenides said it first, and he was a Cretan calling all Cretans liars.',
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
    p: 348, x: 88, card: 1, loop: 1, lamps: 1,
    text: 'Russell hit the same wall in set theory, and Kurt Gödel turned the trick into a theorem.',
    dur: 5.0,
  },
  {
    p: 266, x: 88, card: 1, loop: 1, lamps: 1,
    interact: {
      prompt: 'What should logic do with a sentence like this?',
      poll: {
        options: [
          { id: 'gap', reads: 'give it no truth value at all', holders: ['Saul Kripke'] },
          { id: 'ban', reads: 'stop a language naming its own truth', holders: ['Alfred Tarski'], correct: true },
          { id: 'both', reads: 'let it be true and false together', holders: ['Graham Priest'] },
        ],
      },
      explain: 'Cut the pointing. Tarski split the language in two, so truth for one level is only ever spoken at the next and the loop has nowhere to close. Leaving the card valueless works until somebody writes a card saying it is not true.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 322, x: 88, card: 1, loop: 1, lamps: 1,
    summary: {
      title: 'No Stable Value',
      points: [
        'Each branch of the argument flips into the other',
        'The cause is self-reference joined to a denial',
        'Epimenides voiced it more than two thousand years ago',
        'The repairs reshaped logic and mathematics',
      ],
      closing: 'A sentence biting its own tail rebuilt set theory and produced the incompleteness theorems. Hardly a party trick.',
    },
    dur: 4.8,
  },
];

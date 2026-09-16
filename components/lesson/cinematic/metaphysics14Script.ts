import type { BaseBeat } from './cinematicKit';

// Cinematic metaphysics-being-14, "Could The World Have Been Otherwise?"
//
// THE PICTURE: four claims, and beside each one a row of five worlds with a mark
// in every world the claim survives. A necessary truth is a full row. A contingent
// one has gaps, and you can count them (H64).
//
// "True in all possible worlds" is a phrase people can repeat without it meaning
// anything. As a row of marks it means something immediately, and it also sets up
// the lesson's real point: two of the rows are full, and only one of them could be
// filled in from an armchair.
//
// STAGING: the Q1 targets are the four claims. The trap is the triangle — also a
// full row, also necessary, and settled by meaning alone — so the question separates
// necessity from a priority instead of testing whether the reader can spot a full
// row (H66).

export interface Met14Beat extends BaseBeat {
  /** Figure gesture (emote code). */ g?: number;
  /** How many claim rows are down, 0…4. */ rows?: number;
  /** How far the world marks have been filled in, 0…1. */ marks?: number;
  /** 1 = the four claims are live targets (Q1). */ pick?: number;
}

export const BEATS: Met14Beat[] = [
  {
    g: 172, rows: 4,
    dur: 4.4,
    text: 'Consider four claims, each true in the actual world. Beside them are five possible worlds, consistent ways things could have been.',
  },
  {
    g: 463, rows: 4, marks: 1,
    dur: 3.4,
    text: 'Each claim is marked in every world where it’s true. Two of the claims are true in all five worlds.',
    cite: 'True in which worlds?',
  },
  {
    g: 463, rows: 4, marks: 1,
    dur: 1.8,
    text: 'The other two claims are true in some worlds and false in others.',
  },
  {
    g: 13, rows: 4, marks: 1,
    dur: 3.1,
    text: 'A claim true in every possible world is a necessary truth. It could not have been false.',
    cite: 'Necessary and contingent',
  },
  {
    g: 266, rows: 4, marks: 1,
    dur: 1.8,
    text: 'A claim true in only some worlds is a contingent truth. It’s true, but it might have been false.',
  },
  {
    g: 139, rows: 4, marks: 1,
    dur: 3.8,
    quote: {
      id: 'lq-metaphysics-being-14',
      text: 'There are infinite possible worlds in God\'s ideas, and as only one of them can exist, there must be a sufficient reason for God\'s choice.',
      author: 'Gottfried Wilhelm Leibniz',
      work: 'Monadology, §53',
      era: '1714',
      philosopherId: 'gottfried-leibniz',
      branchSlugs: ['metaphysics'],
    },
  },
  {
    g: 5, rows: 4, marks: 1,
    dur: 4.1,
    text: 'The two necessary truths differ in how they can be known. One is a priori, knowable by reason alone.',
    cite: 'Two ways of knowing',
  },
  {
    g: 259, rows: 4, marks: 1,
    dur: 1.8,
    text: 'The other is a posteriori, known only through watching and testing.',
  },
  {
    g: 4, rows: 4, marks: 1, pick: 1,
    dur: 1.0,
    interact: {
      prompt: 'Which necessary truth can be known only a posteriori?',
      explain: 'Water is H₂O. Chemists had to find out what water is made of, yet the claim is true in every possible world. The triangle claim is also necessary, but you can know it from the meaning of the word alone.',
      xp: 5,
    },
  },
  {
    g: 383, rows: 4, marks: 1,
    dur: 1.0,
    interact: {
      prompt: 'Which account of the truth “water is H₂O” is correct?',
      poll: {
        options: [
          { id: 'water', reads: 'necessary, yet knowable only by experience', holders: ['Saul Kripke', 'Hilary Putnam'], correct: true },
          { id: 'obvious', reads: 'necessary, as nothing could be otherwise', holders: ['Baruch Spinoza'] },
          { id: 'sure', reads: 'a matter of fact, so its opposite is possible', holders: ['Gottfried Leibniz', 'David Hume'] },
          { id: 'open', reads: 'a contingent identity, like lightning and electrical discharge', holders: ['U.T. Place', 'J.J.C. Smart'] },
        ],
      },
      explain: 'Necessary, yet knowable only by experience. Being H₂O is what makes a thing water, so no world could have water that isn’t H₂O.',
      xp: 5,
    },
  },
  {
    summary: {
      title: 'Necessary and Contingent Truths',
      points: [
        'A necessary truth holds in every possible world',
        'A contingent truth holds in some possible worlds but not all',
        'Some necessary truths can be known only a posteriori',
        'Possible worlds make claims about necessity precise',
      ],
      closing: 'Saul Kripke argued that necessity concerns how things are, while a priority concerns how they are known.',
    },
    dur: 3.0,
  },
];

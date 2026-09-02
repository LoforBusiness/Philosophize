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
    g: 25, rows: 4,
    dur: 4.4,
    text: 'Four claims, all of them true. And five columns, one for each of the ways the world could consistently have gone.',
  },
  {
    g: 45, rows: 4, marks: 1,
    dur: 3.4,
    text: 'Now mark each claim in every world it survives. Two of the rows fill completely.',
    cite: 'Fill in the rows',
  },
  {
    g: 45, rows: 4, marks: 1,
    dur: 1.8,
    text: 'Two of them come out patchy.',
  },
  {
    g: 13, rows: 4, marks: 1,
    dur: 3.1,
    text: 'A full row is a necessary truth. It could not have been otherwise, however you rearrange things.',
    cite: 'Necessary and contingent',
  },
  {
    g: 13, rows: 4, marks: 1,
    dur: 1.8,
    text: 'A patchy row just happens to be true here.',
  },
  {
    g: 137, rows: 4, marks: 1,
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
    text: 'The two full rows are not the same kind of thing. One of them you could have filled in without leaving your chair.',
    cite: 'Two full rows',
  },
  {
    g: 5, rows: 4, marks: 1,
    dur: 1.8,
    text: 'The other took a laboratory.',
  },
  {
    g: 4, rows: 4, marks: 1, pick: 1,
    dur: 1.0,
    interact: {
      prompt: 'Two of these hold in every world. Tap the one nobody could know without looking.',
      explain: 'Water is H₂O. Once you know what water actually is, there is no world where it is something else — but no amount of thinking about the word gets you to the chemistry. The triangle is the trap: also a full row, and settled entirely by what the word means.',
      xp: 5,
    },
  },
  {
    g: 41, rows: 4, marks: 1,
    dur: 1.0,
    interact: {
      prompt: 'Place the token on water being H2O.',
      field: {
        xLo: 'YOU COULD DOUBT IT', xHi: 'YOU COULD NOT DOUBT IT',
        yLo: 'FALSE IN SOME WORLD', yHi: 'TRUE IN EVERY WORLD',
        start: [0.76, 0.24],
        quads: [
          { id: 'water', x: 0, y: 1, reads: 'doubted for centuries, and true in every world', correct: true },
          { id: 'obvious', x: 1, y: 1, reads: 'nobody doubts it, and true in every world' },
          { id: 'sure', x: 1, y: 0, reads: 'nobody doubts the fact, and it could have differed' },
          { id: 'open', x: 0, y: 0, reads: 'doubtable, and it could have gone otherwise' },
        ],
      },
      explain: 'Top left, and the two axes are the whole lesson. One of them measures the world and the other measures you. Water was H2O in every world while people doubted it for centuries, and plenty of things nobody doubts could easily have gone another way.',
      xp: 5,
    },
  },
  {
    summary: {
      title: 'Every Way It Could Have Gone',
      points: [
        'A necessary truth holds in every possible world',
        'A contingent one holds here and not everywhere',
        'Some necessary truths had to be discovered by looking',
        'Modality turns "could have been otherwise" into a countable question',
      ],
      closing: 'You exist. Nothing on that row of worlds says you had to.',
    },
    dur: 3.0,
  },
];

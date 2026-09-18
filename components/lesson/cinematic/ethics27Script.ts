import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic ethics-ethics-27, "When You Say That Is Wrong"
// Theme: ONE SENTENCE ON A STAND, AND THREE THINGS IT MIGHT BE DOING.
//
// Metaethics is a question about the SENTENCE rather than about cruelty, so the
// sentence is drawn once, at the top, and never changes. What changes is the
// small object hanging under it: a fact, a border, or a burst. Three theories of
// one utterance, and the utterance itself is identical in all three.
//
// The three readings share one slot. Drawing them side by side would make them
// look like three claims a person could hold at once, and they are three accounts
// of what a single claim already is.
//
// GAMIFIED SHAPE:
//   · beat 4  SCENE TARGETS — three plates, and the reader taps the flaw critics
//     find in relativism. On the stage because the border reading is already
//     hanging under the sentence.
//   · beat 8  a POLL — which reading lets a whole culture be wrong. The answer
//     swaps the object under the sentence, so a position is a thing in the picture.
// ─────────────────────────────────────────────────────────────────────────────

export interface Ethics27Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** 1 = the sentence is on its stand. */ said?: number;
  /** Which reading hangs under it: 0 none, 1 a fact, 2 a border, 3 a feeling. */ reading?: number;
  /** 1 = the three plates the reader chooses between are up. */ plates?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
  /** 1 = a crack breaks the stem: every reading pays a cost somewhere. */ cost?: number;
}

export const BEATS: Ethics27Beat[] = [
  {
    p: 427, x: 24, said: 1,
    text: 'Suppose someone says that cruelty is wrong. Metaethics asks what such a sentence means, and whether it can be true or false.',
    dur: 4.8,
  },
  {
    p: 174, x: 24, said: 1, reading: 1,
    text: 'A moral realist takes it to state a fact, true whether or not anyone agrees.',
    dur: 4.2,
  },
  {
    p: 435, x: 24, said: 1, reading: 2,
    text: 'A cultural relativist takes it to be true within one culture, with no authority outside it.',
    dur: 4.4,
  },
  {
    p: 258, x: 24, said: 1, reading: 3,
    text: 'An expressivist takes it to express a feeling of disapproval, although it has the grammar of a statement.',
    dur: 4.6,
  },
  {
    p: 260, x: 24, said: 1, reading: 2, plates: 1, live: 1,
    interact: {
      prompt: 'Which feature of relativism do critics say makes it inconsistent?',
      explain: 'It is universal. Relativists often add that each culture must respect the others. Bernard Williams saw a rule for all in this demand, and the view says no such rule exists.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 451, x: 84, said: 1, reading: 3,
    text: 'Alfred Ayer defended an early form of this view, emotivism, in 1936. On his view, a moral sentence expresses an attitude and is neither true nor false.',
    dur: 5.0,
  },
  {
    p: 430, x: 84, said: 1, reading: 3,
    quote: {
      id: 'lq-ethics-ethics-27-1',
      text: 'There are no moral facts.',
      author: 'Friedrich Nietzsche',
      work: 'Twilight of the Idols',
      era: '1889',
      branchSlugs: ['ethics'],
    },
    dur: 4.0,
  },
  {
    p: 447, x: 84, said: 1, reading: 3, cost: 1,
    text: 'Each reading has a cost, which appears when two cultures disagree. Realism must explain what moral facts are, while the other two can’t call either culture mistaken.',
    dur: 4.8,
  },
  {
    p: 176, x: 84, said: 1, reading: 2,
    interact: {
      prompt: 'Which reading allows that a whole culture could be morally mistaken?',
      poll: {
        options: [
          { id: 'fact', reads: 'a fact, which a whole culture can miss', holders: ['G.E. Moore', 'Derek Parfit'], correct: true },
          { id: 'border', reads: 'true only within the culture that holds it', holders: ['Ruth Benedict', 'W.G. Sumner'] },
          { id: 'feeling', reads: 'an attitude, neither true nor false', holders: ['A.J. Ayer'] },
        ],
      },
      explain: 'A fact, which a whole culture can miss. A culture can be mistaken only about something that holds whatever it believes. If moral truth held only within each culture, nothing would stand outside to correct it.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 322, x: 84, said: 1, reading: 1,
    summary: {
      title: 'Three Readings of a Moral Claim',
      points: [
        'Metaethics asks what a moral sentence says',
        'Realism: it states a fact that holds everywhere',
        'Relativism: it is true only within one culture',
        'Expressivism: it expresses an attitude, not a fact',
      ],
      closing: 'Which reading is correct decides whether moral disagreement can have a right answer.',
    },
    dur: 4.8,
  },
];

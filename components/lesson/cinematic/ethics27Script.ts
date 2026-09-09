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
}

export const BEATS: Ethics27Beat[] = [
  {
    p: 427, x: 24, said: 1,
    text: 'Somebody says that cruelty is wrong and everyone nods. Now ask what they just did.',
    dur: 4.8,
  },
  {
    p: 174, x: 24, said: 1, reading: 1,
    text: 'A realist hears a plain fact, true whether or not anybody agrees.',
    dur: 4.2,
  },
  {
    p: 435, x: 24, said: 1, reading: 2,
    text: 'A relativist hears a rule of one culture, with no standing outside it.',
    dur: 4.4,
  },
  {
    p: 258, x: 24, said: 1, reading: 3,
    text: 'An expressivist hears a cry of disgust, wearing the grammar of a statement.',
    dur: 4.6,
  },
  {
    p: 260, x: 24, said: 1, reading: 2, plates: 1, live: 1,
    interact: {
      prompt: 'Tap the flaw critics find in relativism.',
      explain: 'The slogan is universal. No moral claim holds for everyone is itself a rule for everyone. Critics call that shape self-undermining. It does not hand the win to realism, because expressivism still stands.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 451, x: 84, said: 1, reading: 3,
    text: 'A. J. Ayer went furthest. A moral sentence is neither true nor false, and vents an attitude.',
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
    p: 447, x: 84, said: 1, reading: 3,
    text: 'Each reading costs something, and the bill falls due when two moralities collide.',
    dur: 4.8,
  },
  {
    p: 176, x: 84, said: 1, reading: 2,
    interact: {
      prompt: 'Which reading lets a whole culture be wrong?',
      poll: {
        options: [
          { id: 'fact', reads: 'a fact, so a culture can simply miss it', holders: ['Plato', 'G. E. Moore'], correct: true },
          { id: 'border', reads: 'a rule with no standing past the border', holders: ['cultural relativists'] },
          { id: 'feeling', reads: 'an attitude, which cannot be mistaken', holders: ['A. J. Ayer'] },
        ],
      },
      explain: 'Only the fact. If a moral claim stops at a border, no outsider can say a practice was wrong, only that it is not theirs. Expressivism voices disgust at slavery and cannot say the slaveholders got anything wrong, which is what dropping moral facts costs.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 322, x: 84, said: 1, reading: 1,
    summary: {
      title: 'What the Words Are Doing',
      points: [
        'Metaethics asks what a moral sentence is',
        'Realism makes it a fact that holds everywhere',
        'Relativism makes it true inside one culture',
        'Expressivism makes it an attitude, not a claim',
      ],
      closing: 'Before arguing about what is right, it is worth knowing what kind of thing right is meant to be.',
    },
    dur: 4.8,
  },
];

import type { BaseBeat } from './cinematicKit';

// Cinematic ethics-ethics-15, "Is Morality Real, Or Just How We Feel?"
//
// THE PICTURE: a balance that weighs FACTS, with a sentence in each pan. The left
// pan holds a plain report. The right pan holds the same report with a moral word
// added to it. The beam does not move (H64).
//
// That is Ayer's argument done as an object rather than a paragraph, and it is the
// only way to make it land: read as prose, "adds no fact" sounds like a quibble
// about words. Watched as a balance refusing to tip under a longer sentence, it is
// a claim with a shape.
//
// STAGING: the Q1 decoys are the two rival theories — realism (the word reports a
// fact about the ACT) and subjectivism (it reports a fact about the SPEAKER). The
// second one is the genuinely hard distinction and the one most readers collapse
// into emotivism, so the explanation names it rather than dismissing it (H66).

export interface Eth15Beat extends BaseBeat {
  /** Figure gesture (emote code). */ g?: number;
  /** The plain report, in the left pan, 0…1. */ plain?: number;
  /** The moral version, in the right pan, 0…1. */ moral?: number;
  /** The beam's tilt in degrees. It is 0 for the whole lesson, and that IS the point. */ tilt?: number;
  /** The doubt mark under the fulcrum — is a balance the right instrument? */ doubt?: number;
  /** 1 = the three boards are live targets (Q1). */ pick?: number;
}

export const BEATS: Eth15Beat[] = [
  {
    g: 462, plain: 1, tilt: 0,
    dur: 2.3,
    text: 'Consider a plain report, the sentence “You stole that money.”',
  },
  {
    g: 462, plain: 1, tilt: 0,
    dur: 1.9,
    text: 'The sentence is true or false, and anyone can check it against the world.',
  },
  {
    g: 465, plain: 1, moral: 1, tilt: 0,
    dur: 3.7,
    text: 'Now add a moral word: “You acted wrongly in stealing that money.”',
    cite: 'Adding a moral word',
  },
  {
    g: 465, plain: 1, moral: 1, tilt: 0,
    dur: 1.8,
    text: 'On a scale that weighs facts, the second sentence weighs no more than the first.',
  },
  {
    g: 13, plain: 1, moral: 1, tilt: 0,
    dur: 2.1,
    text: 'Ayer’s emotivism holds that a moral word adds no further fact to the sentence.',
    cite: 'Ayer’s emotivism',
  },
  {
    g: 13, plain: 1, moral: 1, tilt: 0,
    dur: 2.5,
    text: 'Instead, the word expresses disapproval. Ayer compares it to saying the sentence in a tone of horror.',
  },
  {
    g: 139, plain: 1, moral: 1, tilt: 0,
    dur: 3.8,
    quote: {
      id: 'lq-ethics-ethics-15-1',
      text: 'If I say to someone, "You acted wrongly in stealing that money," I am not stating anything more than if I had simply said, "You stole that money."',
      author: 'A.J. Ayer',
      work: 'Language, Truth and Logic',
      era: '1936',
      philosopherId: 'aj-ayer',
      branchSlugs: ['ethics'],
    },
  },
  {
    g: 5, plain: 1, moral: 1, tilt: 0, doubt: 1,
    dur: 3.3,
    text: 'Moral realists reply that the scale is the wrong instrument. If cruelty is wrong, that’s a fact about cruelty.',
    cite: 'The realist answers',
  },
  {
    g: 5, plain: 1, moral: 1, tilt: 0, doubt: 1,
    dur: 1.8,
    text: 'So a test for observable facts would miss moral facts, if they exist.',
  },
  {
    g: 4, plain: 1, moral: 1, tilt: 0, doubt: 1, pick: 1,
    dur: 1.0,
    interact: {
      prompt: 'What does emotivism say the moral word “wrongly” adds?',
      explain: 'A feeling, not a claim. The board about the speaker describes subjectivism. “I disapprove of stealing” is a claim about the speaker, which could be checked. Emotivism says the moral word expresses the disapproval rather than reporting it.',
      xp: 5,
    },
  },
  {
    g: 383, plain: 1, moral: 1, tilt: 0, doubt: 1,
    dur: 1.0,
    interact: {
      prompt: 'What does emotivism take “stealing is wrong” to be?',
      sort: {
        chip: '“stealing is wrong”',
        bins: [
          { id: 'fact', label: 'a fact', reads: 'a claim about the world, true or false' },
          { id: 'report', label: 'a self-report', reads: 'a report of the speaker’s feelings, true or false' },
          { id: 'boo', label: 'an attitude', reads: 'an expressed attitude, neither true nor false', correct: true },
        ],
      },
      explain: 'An attitude. The bin “a self-report” is a different theory, subjectivism. On that theory, the sentence is true or false, because it reports how the speaker feels. Emotivism denies this. An attitude can’t be true or false.',
      xp: 5,
    },
  },
  {
    summary: {
      title: 'Facts or Feelings',
      points: [
        'Realism says some moral claims are objectively true',
        'Emotivism says they express attitudes instead',
        'On emotivism, a moral word adds no further fact',
        'Expressing disapproval differs from reporting that you disapprove',
      ],
      closing: 'Whether this shows that there are no moral facts, or only that observation can’t detect them, remains disputed.',
    },
    dur: 3.0,
  },
];

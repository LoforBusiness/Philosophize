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
    g: 164, plain: 1, tilt: 0,
    dur: 2.3,
    text: 'Here is a plain report of something that happened. You stole that money.',
  },
  {
    g: 164, plain: 1, tilt: 0,
    dur: 1.9,
    text: 'Anyone can hold the sentence up against the world and check.',
  },
  {
    g: 159, plain: 1, moral: 1, tilt: 0,
    dur: 3.7,
    text: 'Now the same report with a moral word in it. You acted wrongly in stealing that money.',
    cite: 'Same weight',
  },
  {
    g: 159, plain: 1, moral: 1, tilt: 0,
    dur: 1.8,
    text: 'The beam does not move.',
  },
  {
    g: 13, plain: 1, moral: 1, tilt: 0,
    dur: 2.1,
    text: 'That is emotivism. The extra word carries no extra fact.',
    cite: 'Ayer\'s claim',
  },
  {
    g: 13, plain: 1, moral: 1, tilt: 0,
    dur: 2.5,
    text: 'It is a tone of voice, a wince set down in ink.',
  },
  {
    g: 137, plain: 1, moral: 1, tilt: 0,
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
    text: 'The other camp says the instrument is the problem. If cruelty really is wrong, that is a fact about cruelty.',
    cite: 'The realist answers',
  },
  {
    g: 5, plain: 1, moral: 1, tilt: 0, doubt: 1,
    dur: 1.8,
    text: 'A scale that cannot weigh it is a poor scale.',
  },
  {
    g: 4, plain: 1, moral: 1, tilt: 0, doubt: 1, pick: 1,
    dur: 1.0,
    interact: {
      prompt: 'Tap what emotivism says the moral word adds.',
      explain: 'A feeling, and not a claim at all. The board about the speaker is worth slowing down for: "I disapprove of stealing" IS a claim, and you could check it by watching me. Emotivism says the moral word does not report the disapproval. It performs it.',
      xp: 5,
    },
  },
  {
    g: 41, plain: 1, moral: 1, tilt: 0, doubt: 1,
    dur: 1.0,
    interact: {
      prompt: 'What kind of thing is "stealing is wrong"?',
      sort: {
        chip: '"stealing is wrong"',
        bins: [
          { id: 'fact', label: 'a fact', reads: 'a claim about the world, true or false' },
          { id: 'report', label: 'a report of feeling', reads: 'a report of how people feel, true or false' },
          { id: 'boo', label: 'a boo', reads: 'a boo, and a boo is neither', correct: true },
        ],
      },
      explain: 'A boo. The middle is a different theory wearing this one coat: it makes the sentence true or false depending on what people feel, so the sentence is still a report. Emotivism will not allow even that. A boo cannot be false, and it cannot be checked.',
      xp: 5,
    },
  },
  {
    summary: {
      title: 'Facts or Feelings',
      points: [
        'Realism says some moral claims are objectively true',
        'Emotivism says they voice attitudes instead',
        'The moral word adds tone, not information',
        'Venting is not reporting that you are venting',
      ],
      closing: 'The beam never moved. Whether that shows something about morality or about the scale is still being argued.',
    },
    dur: 3.0,
  },
];

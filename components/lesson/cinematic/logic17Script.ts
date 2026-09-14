import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic logic-arguments-17, "Who Said So, and Does It Matter?"
// Theme: A CLAIM THAT CAN BE LIFTED OFF WHOEVER SAID IT, AND ONE THAT CANNOT.
//
// Most lessons on ad hominem stop at "attacking the person is not an argument",
// which is true and leaves the reader worse off — because half the time the
// person IS the whole of your evidence, and a rule that says otherwise makes
// them credulous. So this one is built around the distinction rather than the
// prohibition, and the picture is a physical test for it: pick the claim up.
//
// An ARGUMENT has its reasons printed underneath, so it stands on the table by
// itself. A TESTIMONY has nothing under it but the speaker, so lifting it off is
// the same as dropping it. Both are said by the same disliked man, which is what
// makes the two columns comparable at all.
//
// GAMIFIED SHAPE:
//   · beat 5  SCENE TARGETS — both claims are lifted and the reader taps the one
//     still standing. The decoy is not a silly option: it is the claim you would
//     believe from a friend, and the lesson is about when you should not.
//   · beat 7  two CARDS — what you are actually relying on when an expert
//     asserts something and gives you no reasons (H66: the rival view is the
//     rational one, not a straw man).
// ─────────────────────────────────────────────────────────────────────────────

export interface Log17Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** Both columns — speaker, plinth, claim — are drawn, 0…1. */ pair?: number;
  /** The reasons printed under the left claim, 0…1. */ marks?: number;
  /** The insult struck across both speakers, 0…1. */ slur?: number;
  /** How far the claims have been lifted off their speakers, 0…1. */ lift?: number;
  /** The unsupported claim coming apart in mid-air, 0…1. */ falls?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Log17Beat[] = [
  {
    p: 172, x: 200, pair: 1,
    text: 'Suppose a man you know to be dishonest tells you, in two different ways, that the bridge will hold.',
    dur: 4.2,
  },
  {
    p: 2, x: 200, pair: 1, marks: 1,
    text: 'The left claim comes with its reasons, the steel’s rating and two load tests. It’s an argument.',
    cite: 'Argument and testimony',
    dur: 2.6,
  },
  {
    p: 2, x: 200, pair: 1, marks: 1,
    text: 'The right claim rests on nothing but the speaker’s word, which makes it testimony.',
    dur: 2,
  },
  {
    p: 465, x: 132, pair: 1, marks: 1, slur: 1,
    text: 'Suppose you reply by attacking the man: he lies, so no one should listen to him.',
    dur: 3.5,
  },
  {
    p: 465, x: 132, pair: 1, marks: 1, slur: 1,
    text: 'The reply feels decisive, but it addresses only the speaker.',
    dur: 1.8,
  },
  {
    p: 396, x: 132, pair: 1, marks: 1, slur: 1,
    text: 'Only the reasons escape the insult, which lands equally on both columns.',
    cite: 'Ad hominem',
    dur: 4.0,
  },
  {
    p: 137, x: 132, pair: 1, marks: 1, slur: 1,
    quote: {
      id: 'lq-logic-arguments-17-1',
      text: 'A last trick is to become personal, insulting and rude. It is very popular, because everyone is able to carry it into effect.',
      author: 'Arthur Schopenhauer',
      work: 'The Art of Being Right',
      era: '1831',
      philosopherId: 'arthur-schopenhauer',
      branchSlugs: ['logic'],
    },
    dur: 3.6,
  },
  {
    p: 165, x: 132, pair: 1, marks: 1, slur: 1, lift: 1, live: 1,
    interact: {
      prompt: 'Which claim still stands once the speaker is disregarded?',
      explain: 'The claim with reasons printed under it. An argument carries its own support, so the speaker’s character is irrelevant to it. The other claim is only the speaker’s word, and a liar’s word is worth less. Noticing that difference isn’t a fallacy.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 380, x: 268, pair: 1, marks: 1, lift: 1, falls: 1,
    text: 'An argument can be assessed by examining its reasons. Testimony falls with the speaker, because nothing else supports it.',
    dur: 4.6,
  },
  {
    p: 383, x: 268, pair: 1, marks: 1, lift: 1, falls: 1,
    interact: {
      prompt: 'When you accept a claim given without reasons, what are you relying on?',
      split: {
        left: 'WHO IS SPEAKING', right: 'THE REASONS GIVEN',
        start: 0.04,
        zones: [
          { id: 'reasons', upto: 0.3, reads: 'the reasons, which you could check yourself' },
          { id: 'both', upto: 0.66, reads: 'the reasons and the speaker equally' },
          { id: 'who', upto: 1, reads: 'the speaker, since no reasons were given', correct: true },
        ],
      },
      explain: 'Accepting a claim with no reasons relies wholly on the speaker’s word. For bare testimony, weighing the speaker makes sense. The mistake is weighing the speaker when reasons are there to weigh instead.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'The Man and the Argument',
      points: [
        'Ad hominem answers the speaker instead of the reasons',
        'An argument stands on the reasons it gives',
        'Testimony stands on the person, so the person is the evidence',
        'Ask whether you were given reasons or only testimony',
      ],
      closing: 'A sound argument remains sound even when a liar presents it.',
    },
    dur: 3.2,
  },
];

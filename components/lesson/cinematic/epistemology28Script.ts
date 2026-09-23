import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic epistemology-knowledge-28, "The Lawyer In Your Head"
// Theme: ONE STANDARD OF PROOF, AND TWO STUDIES ASKING TO CLEAR IT.
//
// Motivated reasoning is not a wrong conclusion, it is an UNEVEN standard — so
// the stage draws the standard as a hurdle and then draws two of them, one in
// front of each study. Nothing here is about the evidence: both sheets are the
// same sheet, and only the height of the bar in front of them differs.
//
// The two bars are fed by ONE value, because that is the honest picture: a
// reader who lowers the bar for the news they want has raised it for the news
// they do not, whether or not they noticed doing it.
//
// GAMIFIED SHAPE:
//   · beat 4  SCENE TARGETS — three plates, and the reader taps what a fair test
//     does to the bars. On the stage because both bars are standing there at
//     different heights, and the answer is a thing you can see happen to them.
//   · beat 8  a SPLIT — the seam is how much of the scrutiny goes to the news
//     you want. Every position on the bar draws itself, and the honest one is
//     the only place the two hurdles come out level.
// ─────────────────────────────────────────────────────────────────────────────

export interface Epistemology28Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** 1 = the track and the two names on it are drawn. */ track?: number;
  /** 1 = the two hurdles stand on the track. */ bars?: number;
  /** The share of the scrutiny aimed at the welcome study, 0…1. */ lean?: number;
  /** 1 = the three plates the reader chooses between are up. */ plates?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
  /** 1 = a dashed FAIR LINE crossing both hurdles at the unbiased height. */ fairLine?: number;
  /** 1 = a dashed arrow in the gap, pointing back at the low bar — reasons follow. */ reasonsFollow?: number;
};

export const BEATS: Epistemology28Beat[] = [
  {
    p: 425, x: 26, track: 1, lean: 0.5,
    text: 'Reasoning can work like a scientist testing a theory, or like a lawyer defending a verdict already chosen.',
    dur: 5.0,
  },
  {
    p: 172, x: 26, track: 1, bars: 1, lean: 0.5,
    text: 'Suppose a study finds your favourite habit harmful. You examine the sample size, the method and the funding.',
    dur: 5.0,
  },
  {
    p: 438, x: 26, track: 1, bars: 1, lean: 0.16,
    text: 'A second study of equal quality finds the habit harmless. You accept the result and share it without checking further.',
    dur: 5.0,
  },
  {
    p: 261, x: 26, track: 1, bars: 1, lean: 0.16, fairLine: 1,
    text: 'The evidence is of equal quality, but the standards differ. Your preference, not the data, set the standard.',
    dur: 5.0,
  },
  {
    p: 166, x: 26, track: 1, bars: 1, lean: 0.16, plates: 1, live: 1,
    interact: {
      prompt: 'What does a fair test do to the two bars?',
      explain: 'It levels the two bars. Motivated reasoning holds welcome evidence to a lower standard than unwelcome evidence. A fair test applies the same standard to both.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 454, x: 82, track: 1, bars: 1, lean: 0.16,
    text: 'Motivated reasoning feels like being right from the inside, which is why it is hard to detect.',
    dur: 4.8,
  },
  {
    p: 433, x: 82, track: 1, bars: 1, lean: 0.16,
    quote: {
      id: 'lq-epistemology-knowledge-28-1',
      text: 'The first principle is that you must not fool yourself—and you are the easiest person to fool.',
      author: 'Richard Feynman',
      work: '"Cargo Cult Science" address',
      era: '1974',
      branchSlugs: ['epistemology'],
    },
    dur: 4.8,
  },
  {
    p: 450, x: 82, track: 1, bars: 1, lean: 0.16, reasonsFollow: 1,
    text: 'In motivated reasoning the conclusion comes first, and reasons are gathered afterwards to support it.',
    dur: 5.0,
  },
  {
    p: 174, x: 82, track: 1, bars: 1,
    interact: {
      prompt: 'As the news gets more welcome, which shape should scrutiny take?',
      plot: {
        cols: ['UNWELCOME', 'NEITHER', 'WELCOME'],
        axis: 'HOW HARD YOU LOOK',
        start: [0.5, 0.5, 0.5],
        shapes: [
          { id: 'even', profile: [0.75, 0.75, 0.75, 0.75, 0.75], reads: 'one standard, whatever it says', correct: true },
          { id: 'soft', profile: [0.95, 0.8, 0.6, 0.4, 0.2], reads: 'easier on news you like' },
          { id: 'hard', profile: [0.2, 0.4, 0.6, 0.8, 0.95], reads: 'harder on news you like' },
        ],
      },
      explain: 'One standard, whatever it says. The flat line is the whole demand: a study doesn\'t become better evidence by agreeing with you. Asking whether welcome news may be believed, and whether unwelcome news must be, is the same failure twice.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 321, x: 82, track: 1, bars: 1, lean: 0.5,
    summary: {
      title: 'The Lawyer In Your Head',
      points: [
        'Motivated reasoning serves a conclusion chosen in advance',
        'It scrutinises unwelcome evidence more than welcome evidence',
        'From the inside it feels like honest reasoning',
        'Ask “Must I believe this?” rather than “Can I believe this?”',
      ],
      closing: 'Motivated reasoning is hard to catch, because it uses the same steps as honest reasoning.',
    },
    dur: 5.0,
  },
];

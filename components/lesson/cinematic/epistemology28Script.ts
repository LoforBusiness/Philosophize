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
};

export const BEATS: Epistemology28Beat[] = [
  {
    p: 425, x: 26, track: 1, lean: 0.5,
    text: 'Your mind is not always a scientist. Sometimes it is a lawyer with the verdict already chosen.',
    dur: 5.0,
  },
  {
    p: 172, x: 26, track: 1, bars: 1, lean: 0.5,
    text: 'A study says your favourite habit is harmful. You check the sample size, the method, the funding.',
    dur: 5.0,
  },
  {
    p: 438, x: 26, track: 1, bars: 1, lean: 0.16,
    text: 'A second study says the habit is fine. You nod and share it without a single question.',
    dur: 5.0,
  },
  {
    p: 261, x: 26, track: 1, bars: 1, lean: 0.16,
    text: 'Same quality of evidence, two different standards. What decided was not the data but the wanting.',
    dur: 5.0,
  },
  {
    p: 166, x: 26, track: 1, bars: 1, lean: 0.16, plates: 1, live: 1,
    interact: {
      prompt: 'Tap what a fair test does to the two bars.',
      explain: 'It levels the two bars. An easy bar for welcome news and a hard bar for unwelcome news is the disease. Raising both would only make you doubt everything.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 454, x: 82, track: 1, bars: 1, lean: 0.16,
    text: 'Motivated reasoning almost never announces itself. You do not feel biased, you feel right.',
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
    p: 450, x: 82, track: 1, bars: 1, lean: 0.16,
    text: 'The verdict came first, and the reasons were recruited afterwards. The search was rigged before it began.',
    dur: 5.0,
  },
  {
    p: 174, x: 82, track: 1, bars: 1,
    interact: {
      prompt: 'Where should the scrutiny sit between the two studies?',
      split: {
        left: 'NEWS YOU LIKE',
        right: 'NEWS YOU DO NOT',
        start: 0.12,
        zones: [
          { id: 'lawyer', upto: 0.35, reads: 'welcome news waltzes straight through' },
          { id: 'even', upto: 0.65, reads: 'one bar, and both studies must clear', correct: true },
          { id: 'contrarian', upto: 1, reads: 'only bad news gets waved through' },
        ],
      },
      explain: 'Right down the middle. Motivated reasoning is asymmetric scrutiny, so the cure is one standard applied both ways. Leaning the other way is the same fault reversed, punishing yourself with whatever you least want to hear.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 321, x: 82, track: 1, bars: 1, lean: 0.5,
    summary: {
      title: 'The Lawyer In Your Head',
      points: [
        'Motivated reasoning chases the conclusion you already wanted',
        'It grills unwelcome evidence and waves welcome evidence through',
        'From the inside it feels exactly like honest thinking',
        'Ask must I believe this, not can I believe this',
      ],
      closing: 'The hardest bias to catch is the one wearing your own reasoning as a disguise.',
    },
    dur: 5.0,
  },
];

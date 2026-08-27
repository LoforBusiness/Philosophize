import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic political-political-36, "Who Is Watching"
// Theme: A STREET OF LIT WINDOWS, AND HOW MANY STAY LIT.
//
// The chilling effect is a shrinkage, so the picture is a shrinkage. Twenty-four
// windows stand for the ordinary things people do; as the watching rises they go
// dark one by one. Nobody is arrested, nothing is banned, and the street is
// visibly emptier.
//
// Bentham's lamp is the second half. It swings whether or not anyone is behind
// it, and on the beat that says so it keeps swinging with the guard box drawn
// EMPTY — because the design's whole claim is that the guard need not be there.
//
// GAMIFIED SHAPE:
//   · beat 2  a DRAG — turn the watching up. Windows go dark under the thumb and
//     the readout counts what is left, so "chilling effect" stops being a phrase.
//   · beat 6  a SCENE TARGET — tap what actually did the shrinking. Three
//     candidates, and the right one is the least dramatic, which is the point.
// ─────────────────────────────────────────────────────────────────────────────

export interface Political36Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** 1 = the street of windows is drawn. */ street?: number;
  /** How much watching there is, 0…1 — how many windows have gone dark. */ watch?: number;
  /** 1 = the reader's thumb drives the watching. */ live_d?: number;
  /** 1 = the lamp is drawn above, sweeping. */ lamp?: number;
  /** 1 = the guard box is shown EMPTY behind the lamp. */ empty?: number;
  /** 1 = the three candidate causes stand below. */ picks?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Political36Beat[] = [
  {
    p: 25, x: 52, street: 1,
    text: 'A street at night. Behind every lit window a person is doing something plain and legal.',
    dur: 3.6,
  },
  {
    p: 4, x: 52, street: 1, lamp: 1, live_d: 1, live: 1,
    interact: {
      prompt: 'Turn the watching up. Nobody is arrested. Watch the street.',
      drag: {
        lo: 'NOBODY WATCHING',
        hi: 'ALWAYS WATCHED',
        start: 0,
        zones: [
          { id: 'off', upto: 0.24, reads: 'everything anyone would do' },
          { id: 'some', upto: 0.62, reads: 'a little more careful', correct: true },
          { id: 'all', upto: 1, reads: 'only what looks fine' },
        ],
      },
      explain: 'Nothing was banned and nobody was charged. The windows went out anyway, because people stopped doing things that would be awkward to explain. That is the whole mechanism, and it runs on innocent behaviour.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 13, x: 52, street: 1, watch: 0.6, lamp: 1,
    text: 'This is why "nothing to hide, nothing to fear" answers a question nobody asked. The cost lands on people doing nothing wrong.',
    dur: 4.6,
  },
  {
    p: 21, x: 52, street: 1, watch: 0.6, lamp: 1, empty: 1,
    text: 'Bentham drew a prison where one guard could see every cell and no prisoner could tell if he was looking. Look at the box. Nobody is in it.',
    dur: 4.8,
  },
  {
    p: 47, x: 52, street: 1, watch: 0.6, lamp: 1, empty: 1,
    quote: {
      id: 'lq-political-political-36-1',
      text: 'Visibility is a trap.',
      author: 'Michel Foucault',
      philosopherId: 'michel-foucault',
      work: 'Discipline and Punish',
      era: '1975',
      branchSlugs: ['political-philosophy'],
    },
    dur: 3.4,
  },
  {
    p: 4, x: 52, street: 1, watch: 0.6, lamp: 1, empty: 1, picks: 1, live: 1,
    interact: {
      prompt: 'Tap what actually turned the windows off.',
      explain: 'Not knowing. A law is arguable and an arrest is news. Uncertainty needs neither. If you cannot tell whether anyone is looking, the safe assumption is that they are — and that costs the watcher nothing.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 35, x: 126, street: 1, watch: 0.6, lamp: 1, picks: 1,
    text: 'Nothing here shows up in a statistic. No case was brought. What shrank was the range of things people were willing to try.',
    dur: 4.6,
  },
  {
    p: 45, x: 126, street: 1, watch: 0.6, lamp: 1,
    text: 'So privacy is not really about secrets. Privacy is how much room a person has when nobody is judging them.',
    dur: 4.8,
  },
  {
    summary: {
      title: 'What Being Seen Costs',
      points: [
        'The harm lands on innocent behaviour',
        'Uncertainty about being watched is enough',
        'It works with nobody behind the glass',
        'What shrinks is what people are willing to try',
      ],
      closing: 'A society can be free on paper and quietly narrower in daily life. The narrowing shows up in nobody\'s figures.',
    },
    dur: 3.2,
  },
];

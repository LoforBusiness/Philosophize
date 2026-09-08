import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic epistemology-knowledge-38, "How Nearly You Were Wrong"
// Theme: THREE TARGETS, AND THE ONE WHOSE HIT IS SURROUNDED BY MISSES.
//
// Safety is a claim about cases that did not happen, which is exactly what makes
// it hard to draw. So it is drawn as a scatter: the solid shot is what you
// actually believed, and the hollow ones around it are what the same method would
// have given a minute earlier or a minute later.
//
// Three roundels, and all three are on the stage at once, because the whole
// argument is a comparison. The first is right with its near cases right too.
// The second is right with its near cases flung to the rim. The third is wrong,
// and tidily so. Only the labels wait until after the reader has chosen.
//
// GAMIFIED SHAPE:
//   · beat 3  SCENE TARGETS — three roundels, and the reader picks the true
//     belief that is not knowledge. No words are needed to answer it, which is the
//     strongest thing a stage question can be.
//   · beat 7  a SPLIT — how the credit divides between the shooter and the luck.
//     The scatter IS the seam: give the shooter the bar and the near shots close
//     onto the bull, give it to luck and they fly to the rim.
// ─────────────────────────────────────────────────────────────────────────────

export interface Epistemology38Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** 1 = the three roundels stand on their rail. */ roundels?: number;
  /** 1 = the shots have arrived on the faces. */ shots?: number;
  /** How far the middle roundel's near shots sit from its bull, 0…1. */ wide?: number;
  /** 1 = the three verdicts are printed under them. */ names?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Epistemology38Beat[] = [
  {
    p: 172, x: 52, roundels: 1,
    text: 'Three people were asked the time. All three answered, and two of them were right.',
    dur: 3.8,
  },
  {
    p: 384, x: 52, roundels: 1, shots: 1, wide: 1,
    text: 'The solid mark is what each of them believed. The hollow ones are what the same method would have given a minute either side.',
    dur: 4.6,
  },
  {
    p: 47, x: 52, roundels: 1, shots: 1, wide: 1,
    text: 'So one face holds a hit and another holds an aim. Nothing on the stage tells a hit from an aim.',
    dur: 4.0,
  },
  {
    p: 165, x: 52, roundels: 1, shots: 1, wide: 1, live: 1,
    interact: {
      prompt: 'Tap the true belief that is not knowledge.',
      explain: 'The middle one. Its solid mark is on the bull, so the belief is true, and every near case it has is off the face. The third is wrong rather than lucky, which was never the puzzle: a plain mistake needs no theory.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 159, x: 52, roundels: 1, shots: 1, wide: 1, names: 1,
    text: 'A belief is safe when it would still have been true in the cases nearest to this one.',
    dur: 3.6,
  },
  {
    p: 35, x: 98, roundels: 1, shots: 1, wide: 1, names: 1,
    text: 'A clock in the hall stopped at ten past four, and you look at it at ten past four. Careful method, true belief, and wrong at almost every other moment of the day.',
    dur: 5.0,
  },
  {
    p: 433, x: 98, roundels: 1, shots: 1, wide: 1, names: 1,
    quote: {
      id: 'lq-epistemology-knowledge-38-1',
      text: 'They run away out of the human soul, and so are not of much value until they are fastened.',
      author: 'Plato',
      philosopherId: 'plato',
      work: 'Meno',
      era: 'c. 380 BC',
      branchSlugs: ['epistemology'],
    },
    dur: 4.4,
  },
  {
    p: 176, x: 98, roundels: 1, shots: 1, names: 1,
    interact: {
      prompt: 'Divide the credit for that hit.',
      split: {
        left: 'THE SHOOTER', right: 'THE LUCK',
        start: 0.9,
        zones: [
          { id: 'luck', upto: 0.32, reads: 'almost all luck, and the hit is not knowing', correct: true },
          { id: 'half', upto: 0.62, reads: 'half and half, and it is still not knowledge' },
          { id: 'skill', upto: 1, reads: 'the shooter earned it, so the misses were never near' },
        ],
      },
      explain: 'Almost all luck. Watch the near shots close onto the bull as you hand the bar to the shooter: that is a picture of a method that would have worked a minute earlier. The stopped clock has no such picture, which is why the true belief it produced buys nothing.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'The Near Misses',
      points: [
        'A true belief can still be an accident',
        'Safety asks what the nearby cases would give',
        'A hit surrounded by misses is luck, not knowing',
        'The one case you have cannot tell them apart',
      ],
      closing: 'Next time you are right about something, ask how much would have had to change for you to be wrong. If the answer is almost nothing, you got away with it.',
    },
    dur: 3.2,
  },
];

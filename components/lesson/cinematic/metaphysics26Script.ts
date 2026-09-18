import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic metaphysics-being-26, "Is the Whole More Than Its Parts?"
// Theme: A WAVE OF STOPPED CARS THAT TRAVELS WHILE EVERY CAR STAYS PUT.
//
// The jam is the argument, so the scene draws the jam and lets it behave. A run
// of cars goes dark, the run walks backwards down the road, and no single car
// does anything but brake a little behind the one in front. Every property the
// emergentist wants — a position, a speed, a direction — is visible, and so is
// the fact that nothing but cars is on the road.
//
// The jam DRIFTS on the monotonic clock rather than on the beat, because a jam
// that only moved when the reader tapped would be making the reductionist's case
// by accident (Z7).
//
// GAMIFIED SHAPE:
//   · beat 4  SCENE TARGETS — three plates, and the reader taps the test that
//     tells weak emergence from strong. On the stage because the surprising thing
//     is already travelling above the plates.
//   · beat 8  a SPLIT — the jam divided between the cars and something more. The
//     seam raises or removes a second band above the road, so claiming the jam is
//     extra puts an extra thing in the picture.
// ─────────────────────────────────────────────────────────────────────────────

export interface Metaphysics26Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** 1 = the road and its cars are drawn. */ road?: number;
  /** 1 = a run of cars is stopped, and the run is marked. */ jam?: number;
  /** 1 = the three plates the reader chooses between are up. */ plates?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
  /** 1 = a "WET" tag settles over the road — a property of the whole (group AH). */ wetTag?: number;
  /** 1 = a token runs once from the car ahead to the one responding (group AH). */ respFlow?: number;
  /** 1 = a dashed frame marks the space a strong emergent feature would occupy (group AH). */ extraFrame?: number;
}

export const BEATS: Metaphysics26Beat[] = [
  {
    p: 423, x: 28, road: 1,
    text: 'Hydrogen is flammable and oxygen supports burning, yet together they form water, which puts out fires.',
    dur: 4.0,
  },
  {
    p: 160, x: 28, road: 1, wetTag: 1,
    text: 'Neither gas is wet, yet water is. Wetness is a property of the whole that neither part has.',
    dur: 4.4,
  },
  {
    p: 435, x: 28, road: 1, jam: 1,
    text: 'Consider a simpler case, a traffic jam. No single car is a jam, yet the cars together make one.',
    dur: 3.8,
  },
  {
    p: 262, x: 28, road: 1, jam: 1, respFlow: 1,
    text: 'Each driver brakes in response to the car ahead. Yet the jam as a whole moves backwards along the road at its own speed.',
    dur: 4.8,
  },
  {
    p: 167, x: 28, road: 1, jam: 1, plates: 1, live: 1,
    interact: {
      prompt: 'Which test decides whether the jam is anything more than the cars?',
      explain: 'The parts fix it: the test is whether full knowledge of the parts settles the whole’s behaviour. Surprise is the wrong test, because a surprising result can still follow from the parts. A name settles nothing.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 451, x: 88, road: 1, jam: 1,
    text: 'Weak emergence is surprising behaviour that still follows from the parts. A traffic jam is weakly emergent.',
    dur: 4.0,
  },
  {
    p: 430, x: 88, road: 1, jam: 1,
    quote: {
      id: 'lq-metaphysics-being-26-1',
      text: 'The whole becomes not merely more, but very different from the sum of its parts.',
      author: 'Philip W. Anderson',
      work: 'More Is Different',
      era: '1972',
      branchSlugs: ['metaphysics'],
    },
    dur: 4.4,
  },
  {
    p: 447, x: 88, road: 1, jam: 1, extraFrame: 1,
    text: 'Strong emergence claims more: some features of a whole can’t be derived, even in principle, from its parts.',
    dur: 4.8,
  },
  {
    p: 176, x: 88, road: 1, jam: 1,
    interact: {
      prompt: 'How should the traffic jam be divided between the cars and anything beyond them?',
      split: {
        left: 'THE CARS',
        right: 'SOMETHING MORE',
        start: 0.05,
        zones: [
          { id: 'more', upto: 0.35, reads: 'mostly something beyond the cars' },
          { id: 'half', upto: 0.7, reads: 'partly the cars, partly something beyond them' },
          { id: 'cars', upto: 1, reads: 'nothing but the cars and their braking', correct: true },
        ],
      },
      explain: 'Nothing but the cars and their braking. The jam’s speed and direction follow from how each driver responds to the car ahead. So the jam is weakly emergent, and nothing beyond the cars is needed.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 437, x: 88, road: 1, jam: 1,
    summary: {
      title: 'Parts and Wholes',
      points: [
        'Reduction says a whole is nothing but its parts',
        'Emergence says some wholes gain features of their own',
        'Weak emergence: surprising, but derivable from the parts',
        'Strong emergence: not derivable from the parts, even in principle',
      ],
      closing: 'The difference isn’t whether a feature surprises anyone. It’s whether complete knowledge of the parts would settle it.',
    },
    dur: 4.6,
  },
];

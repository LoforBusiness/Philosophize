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
}

export const BEATS: Metaphysics26Beat[] = [
  {
    p: 423, x: 28, road: 1,
    text: 'Two flammable gases combine, and the result puts out fires.',
    dur: 4.0,
  },
  {
    p: 160, x: 28, road: 1,
    text: 'Nobody had wetness. Somewhere between the parts and the whole it arrived.',
    dur: 4.4,
  },
  {
    p: 435, x: 28, road: 1, jam: 1,
    text: 'Here is a smaller case. No single car is a traffic jam.',
    dur: 3.8,
  },
  {
    p: 262, x: 28, road: 1, jam: 1,
    text: 'Each driver only brakes a little behind the one ahead. The jam has a speed anyway.',
    dur: 4.8,
  },
  {
    p: 167, x: 28, road: 1, jam: 1, plates: 1, live: 1,
    interact: {
      prompt: 'Tap the test that tells the two apart.',
      explain: 'Whether the parts settle it. Surprise is the wrong test — nobody predicted wetness either, and chemistry explains it perfectly well. A name is no test at all. Strong emergence needs a feature the parts could not have given you, however well you knew them.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 451, x: 88, road: 1, jam: 1,
    text: 'Weak emergence is surprising and still follows from the parts.',
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
    p: 447, x: 88, road: 1, jam: 1,
    text: 'Strong emergence is the bold claim. Some feature the parts could never have given.',
    dur: 4.8,
  },
  {
    p: 176, x: 88, road: 1, jam: 1,
    interact: {
      prompt: 'Divide the jam between the cars and anything else.',
      split: {
        left: 'THE CARS',
        right: 'SOMETHING MORE',
        start: 0.05,
        zones: [
          { id: 'more', upto: 0.35, reads: 'the jam is not made of any one car' },
          { id: 'half', upto: 0.7, reads: 'half of the jam sits outside the cars' },
          { id: 'cars', upto: 1, reads: 'the jam is the cars, braking in order', correct: true },
        ],
      },
      explain: 'All of it is cars. The jam has a speed and a direction and is still nothing but braking, in order, on a road. Putting anything to the right of that seam adds a thing no traffic report has ever needed.',
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
        'Weak emergence surprises and still follows from below',
        'Strong emergence is the claim that has to be argued',
      ],
      closing: 'The line is not whether a thing surprised anybody. The line is whether the parts, fully known, would have told you.',
    },
    dur: 4.6,
  },
];

import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic metaphysics-being-41, "Is Space a Thing, or Just Distance?"
// Theme: THREE BODIES SLID SIDEWAYS, AND A SCALE THAT EITHER FOLLOWS OR DOES NOT.
//
// The shifted-universe argument turns entirely on whether there is anything left
// BEHIND to have moved against, so the scene draws the two candidates and moves
// one of them: three bodies, and a scale of ticks along the top of the frame.
// Slide the bodies and the whole question is whether the ticks come too.
//
// The gaps between the bodies are drawn as bars, and they never change length at
// any point in the lesson. That is the fact both sides agree on, so it has to be
// the one thing in the picture that visibly holds still.
//
// GAMIFIED SHAPE:
//   · beat 4  SCENE TARGETS — three plates, and the reader taps the step Leibniz
//     leans on. On the stage because the shift has already happened above it and
//     the reader can see for themselves that nothing looks different.
//   · beat 8  a SORT — what the shift amounts to. The reader's own chip decides
//     whether the scale stays put, travels with the bodies, or was never there.
// ─────────────────────────────────────────────────────────────────────────────

export interface Metaphysics41Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** How many of the three bodies are drawn, 0…1. */ bodies?: number;
  /** 1 = the scale of ticks along the frame is drawn. */ scale?: number;
  /** How far the whole arrangement has slid east, 0…1. */ shift?: number;
  /** 1 = the three plates the reader chooses between are up. */ plates?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Metaphysics41Beat[] = [
  {
    p: 349, x: 28,
    text: 'Move the whole universe three feet east. Everything in it, all at once.',
    dur: 4.2,
  },
  {
    p: 159, x: 28, bodies: 1,
    text: 'Newton thought space was a real container, there whether or not anything sat in it.',
    dur: 4.8,
  },
  {
    p: 321, x: 28, bodies: 1, scale: 1,
    text: 'Leibniz thought it was only the arrangement. No things, no space.',
    dur: 4.0,
  },
  {
    p: 165, x: 28, bodies: 1, scale: 1, shift: 1,
    text: 'So the two disagree about the shifted world, and about nothing you could measure.',
    dur: 4.6,
  },
  {
    p: 167, x: 28, bodies: 1, scale: 1, shift: 1, plates: 1, live: 1,
    interact: {
      prompt: 'Tap the step Leibniz leans on here.',
      explain: 'The missing reason. Leibniz holds that nothing happens without one, and a choice between two identical worlds has none to give. So there was never a choice. Being undetectable is weaker on its own: plenty of real things go undetected.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 324, x: 88, bodies: 1, scale: 1, shift: 1,
    text: 'Look at the gaps. Every distance between every pair is unchanged.',
    dur: 4.4,
  },
  {
    p: 344, x: 88, bodies: 1, scale: 1, shift: 1,
    quote: {
      id: 'lq-metaphysics-being-41-1',
      text: 'I hold space to be something merely relative, as time is; I hold it to be an order of coexistences, as time is an order of successions.',
      author: 'Gottfried Leibniz',
      philosopherId: 'gottfried-leibniz',
      work: 'Third Letter to Clarke',
      era: '1716',
      branchSlugs: ['metaphysics'],
    },
    dur: 5.0,
  },
  {
    p: 447, x: 88, bodies: 1, scale: 1, shift: 1,
    text: 'Newton had one reply left: spin a bucket of water and the surface climbs the wall.',
    dur: 4.8,
  },
  {
    p: 176, x: 88, bodies: 1, scale: 1, shift: 1,
    interact: {
      prompt: 'What is the shifted universe, then?',
      sort: {
        chip: 'the world, moved east',
        bins: [
          { id: 'real', label: 'a real change', reads: 'something happened that nobody could detect' },
          { id: 'same', label: 'the same world', reads: 'one world, described twice over', correct: true },
          { id: 'empty', label: 'an empty question', reads: 'words with nothing behind them either way' },
        ],
      },
      explain: 'One world, twice. If space is the arrangement, then the arrangement came along and nothing stayed behind for it to have moved against. Calling the question empty gives up too early. The bucket shows there’s something real to argue about.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 320, x: 88, bodies: 1, scale: 1, shift: 1,
    summary: {
      title: 'The Order of Things',
      points: [
        'Newton made space a container that could sit empty',
        'Leibniz made it the order of the things there are',
        'A shifted universe separates the two accounts',
        'Rotation was the hard case Leibniz still had to meet',
      ],
      closing: 'Physics ended up on the Leibniz side, and then made the whole thing stranger. But the question had to be asked well before anyone could measure an answer.',
    },
    dur: 4.6,
  },
];

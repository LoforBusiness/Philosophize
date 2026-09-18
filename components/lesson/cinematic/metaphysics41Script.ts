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
  /** 1 = Newton's spinning vessel is drawn, water risen up its sides. */ spin?: number;
}

export const BEATS: Metaphysics41Beat[] = [
  {
    p: 349, x: 28,
    text: 'Suppose the whole universe were shifted three feet east. Everything in it would move together, by the same distance.',
    dur: 4.2,
  },
  {
    p: 159, x: 28, bodies: 1,
    text: 'Newton held that space is absolute. Space exists in its own right, whether or not anything occupies it.',
    dur: 4.8,
  },
  {
    p: 321, x: 28, bodies: 1, scale: 1,
    text: 'Leibniz held that space is relational: nothing but the order among coexisting things. Without things, there would be no space.',
    dur: 4.0,
  },
  {
    p: 165, x: 28, bodies: 1, scale: 1, shift: 1,
    text: 'The two views therefore disagree about the shifted universe. On Newton’s view it’s a different world, yet no measurement could tell it apart from ours.',
    dur: 4.6,
  },
  {
    p: 167, x: 28, bodies: 1, scale: 1, shift: 1, plates: 1, live: 1,
    interact: {
      prompt: 'On what premise does Leibniz deny that a shifted universe would differ from ours?',
      explain: 'No reason. The principle of sufficient reason holds that nothing is the case without a reason. God could have had no reason to create the world here rather than three feet east. “Nothing shows” needs a further premise: that an undetectable difference is no difference.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 324, x: 88, bodies: 1, scale: 1, shift: 1,
    text: 'The shift leaves every distance between the bodies unchanged. For Leibniz, therefore, nothing about the world has changed.',
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
    p: 447, x: 88, bodies: 1, scale: 1, shift: 1, spin: 1,
    text: 'Newton’s case for absolute space rested on rotation. Water in a spinning vessel rises up the sides, even when it’s still relative to the vessel.',
    dur: 4.8,
  },
  {
    p: 176, x: 88, bodies: 1, scale: 1, shift: 1, spin: 1,
    interact: {
      prompt: 'On Leibniz’s view, what has really changed if the universe shifts three feet east?',
      sort: {
        chip: 'the universe, shifted east',
        bins: [
          { id: 'real', label: 'a real change', reads: 'a distinct world, differing only in position' },
          { id: 'same', label: 'the same world', reads: 'one and the same world, described twice', correct: true },
          { id: 'empty', label: 'an empty question', reads: 'a question with no fact to settle it' },
        ],
      },
      explain: 'The same world. For Leibniz, space is only the relations among things, and shifting the universe leaves every relation intact, so nothing changes. A real change would need space to exist apart from things, which is Newton’s view.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 320, x: 88, bodies: 1, scale: 1, shift: 1, spin: 1,
    summary: {
      title: 'Absolute and Relational Space',
      points: [
        'Newton held that space exists even if nothing occupies it',
        'Leibniz held that space is only the order among things',
        'Only on Newton’s view is a shifted universe a different world',
        'Rotation remained the hardest case for a relational view',
      ],
      closing: 'Modern physics changed the debate but didn’t end it. Philosophers of physics still argue over whether spacetime is a thing in its own right.',
    },
    dur: 4.6,
  },
];

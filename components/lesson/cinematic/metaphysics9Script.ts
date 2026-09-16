import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic metaphysics-being-9, "Is the Mind More Than the Brain?" — Descartes's
// dualism and the interaction problem. Two panels stand over the stage, MIND and
// BODY, with a strip of bare paper between them. A thought sets out across the
// gap to lift an arm and stops dead in the middle of it. Then the physicalist
// answer closes the gap and the two panels become one.
//
// Both graded questions come from data/branches/metaphysics/.../mind-and-body.ts:
// Q1 is the core claim of dualism (deck), Q2 is what the cogito actually gets you
// — the data asks it as a true/false about the Meditations, and here the reader
// taps the claim itself, which is the same substance (E37c).
// ─────────────────────────────────────────────────────────────────────────────

export interface M9Beat extends BaseBeat {
  /** Narrator gesture (emote code). */ p?: number;
  /** Narrator mark on the ground. */ x?: number;
  /** 0 both panels dark · 1 both lit · 2 fused into one. */ panels?: number;
  /** How far the thought has crossed the gap, 0→1. It never reaches 1. */ cross?: number;
  /** The "?" hanging over the gap. */ puzzle?: boolean;
  /** The three claim cards for the tap question. */ cards?: boolean;
}

export const BEATS: M9Beat[] = [
  {
    p: 379, x: 96, panels: 0,
    text: 'A human brain weighs about three pounds and occupies space. Does a thought, such as the one you’re having now, weigh anything?',
    dur: 3.6,
  },
  {
    p: 167, x: 96, panels: 1,
    text: 'Descartes argued that mind and body are distinct substances. Mind thinks and takes up no space, and body takes up space and doesn’t think.',
    cite: 'Cartesian dualism',
    dur: 4.6,
  },
  {
    p: 167, x: 96, panels: 1,
    text: 'This view is called substance dualism. On it, the mind could exist without the body.',
    dur: 1.8,
  },
  {
    p: 144, x: 160, panels: 1,
    quote: {
      id: 'lq-metaphysics-being-9-1',
      text: 'I am, then, in the strict sense only a thing that thinks; that is, I am a mind, or intelligence, or intellect, or reason.',
      author: 'Rene Descartes',
      work: 'Meditations on First Philosophy, II',
      era: '1641',
      philosopherId: 'descartes',
      branchSlugs: ['metaphysics'],
    },
    dur: 3.4,
  },
  {
    p: 13, x: 160, panels: 1, cross: 1, puzzle: true,
    text: 'Suppose you decide to lift your arm. Then something with no size or location must cause a physical limb to move.',
    cite: 'The interaction problem',
    dur: 2.5,
  },
  {
    p: 266, x: 160, panels: 1, cross: 1, puzzle: true,
    text: 'Descartes put the link in the pineal gland. Princess Elisabeth of Bohemia objected: moving a body takes contact, and a mind with no extension cannot touch it.',
    dur: 2.5,
  },
  {
    p: 33, x: 232, panels: 2,
    text: 'Physicalists hold that the mind is physical, so there’s no gap to cross. Brain damage can alter memory, mood and even character.',
    cite: 'The physicalist reply',
    dur: 2.5,
  },
  {
    p: 260, x: 232, panels: 2,
    text: 'This evidence suggests that the mind isn’t a separate substance. It is something the brain does, the way digestion is something the gut does.',
    dur: 2.7,
  },
  {
    p: 380, x: 232, panels: 2,
    interact: {
      prompt: 'What does substance dualism claim about the mind?',
      sort: {
        chip: 'the mind',
        bins: [
          { id: 'same', label: 'the brain itself', reads: 'the mind is identical to the brain' },
          { id: 'does', label: 'brain activity', reads: 'the mind is an activity of the brain' },
          { id: 'two', label: 'a distinct substance', reads: 'the mind is a substance distinct from matter', correct: true },
        ],
      },
      explain: 'A distinct substance. Substance dualism holds that mind and matter are two substances, not one. Brain activity may sound like mild dualism, but it’s a physicalist view that Descartes would reject.',
    },
    dur: 4.4,
  },
  {
    p: 440, x: 232, panels: 2, cards: true,
    interact: {
      prompt: 'What does Descartes’ “I think, therefore I am” establish on its own?',
      explain:
        'Something is thinking. The cogito shows that a thinker exists while it thinks. That the thinker is a separate substance needs a further argument, given in the Sixth Meditation. Nor does the cogito show that the body doesn’t exist.',
    },
    dur: 4.6,
  },
  {
    summary: {
      title: 'The Mind-Body Problem',
      points: [
        'Descartes: mind and body, two substances',
        'Mind thinks, and body takes up space',
        'Dualism faces the interaction problem',
        'Physicalists: mind is what a brain does',
      ],
      closing:
        'How thought relates to matter remains one of the central unsolved problems in philosophy.',
    },
    dur: 4.0,
  },
];

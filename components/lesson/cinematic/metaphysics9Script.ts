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
    p: 25, x: 96, panels: 0,
    text: 'Your brain weighs about three pounds and takes up space. Does the thought you are having right now weigh anything at all?',
    dur: 3.6,
  },
  {
    p: 167, x: 96, panels: 1,
    text: 'Descartes doubted everything he could, and could not doubt that he was thinking. So mind is a thing that thinks and takes up no space; body is a thing that takes up space and does not think.',
    cite: 'Cartesian dualism',
    dur: 4.6,
  },
  {
    p: 167, x: 96, panels: 1,
    text: 'Two separate substances.',
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
    text: 'Then decide to lift your arm. Something with no size and no position has to shove a physical limb.',
    cite: 'The interaction problem',
    dur: 2.5,
  },
  {
    p: 13, x: 160, panels: 1, cross: 1, puzzle: true,
    text: 'Descartes guessed the pineal gland; his critics answered that a mind with no size has nothing to push with.',
    dur: 2.5,
  },
  {
    p: 33, x: 232, panels: 2,
    text: 'So many philosophers close the gap instead. Damage a brain and the memory, the mood, even the character change with it.',
    cite: 'The physicalist reply',
    dur: 2.5,
  },
  {
    p: 33, x: 232, panels: 2,
    text: 'That suggests the mind is not another substance. It is something the brain does, the way digestion is something the gut does.',
    dur: 2.7,
  },
  {
    p: 4, x: 232, panels: 2,
    interact: {
      prompt: 'Set the lever to what Descartes claims about mind and body.',
      lever: {
        start: 0,
        stops: [
          { id: 'same', reads: 'the mind is the brain: one kind of stuff' },
          { id: 'does', reads: 'the mind is simply what the brain does' },
          { id: 'two', reads: 'the mind is a second kind of thing entirely', correct: true },
        ],
      },
      explain: 'The far setting. Two substances, not one. The trap is the setting next to it: the mind is what the brain does sounds like a modest version of the same idea, and it is exactly the view Descartes spent the Meditations arguing against.',
    },
    dur: 4.4,
  },
  {
    p: 47, x: 232, panels: 2, cards: true,
    interact: {
      prompt: '"I think, therefore I am." Tap the label for what that sentence really establishes.',
      explain:
        'A thinker, and no more: something is doing this thinking, so something exists. The trap is the second card. The leap from there to "and it is made of different stuff" is a further argument, and the one everybody has disputed since.',
    },
    dur: 4.6,
  },
  {
    summary: {
      title: 'The Mind-Body Knot',
      points: [
        'Descartes: mind and body, two substances',
        'Mind thinks; body merely takes up space',
        'The interaction problem dogs dualism',
        'Physicalists: mind is what a brain does',
      ],
      closing:
        'Whatever the mind turns out to be, the seam between thought and matter is still the hardest one in philosophy to close.',
    },
    dur: 4.0,
  },
];

import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'metaphysics-being-2',
  slug: 'something-vs-nothing',
  title: 'Something vs. Nothing',
  description: 'What do philosophers actually mean by "nothing" — and is true nothingness even conceivable?',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: '"Nothing" may be the most slippery word we own.',
      subtext: 'The instant you turn to look at it, it has already become something.',
      emoji: '⬛',
    },
    {
      type: 'concept',
      title: 'What Philosophers Mean by Nothing',
      body: 'In daily speech, "nothing" is an empty box, a blank page. Philosophers mean something far more severe: the absence of absolutely everything — no matter, no space, no time, no laws, not even unrealized possibilities. Think of it as the silent zero from which existence might never have departed. It is startlingly hard to picture.',
      visual: '🕳️',
      highlight: 'absolute nothingness',
    },
    {
      type: 'concept',
      title: 'The Conceivability Problem',
      body: 'Try to imagine true nothingness. You conjure a dark void — but a void is still space, still something. You imagine silence — yet silence is merely the hush where sound was. Each image quietly smuggles a something in through the back door. Perhaps the mind is simply not built to hold pure nothing at all.',
      visual: '🧠',
      highlight: 'conceivability',
    },
    {
      type: 'example',
      title: 'Physics Weighs In',
      scenario: 'In quantum physics, even "empty" space refuses to sit still. Particles flicker into being and vanish; energy trembles inside the perfect vacuum. Physicists call this restless emptiness the quantum vacuum, and it is anything but nothing. Some cosmologists suspect our whole universe erupted from such a near-nothing. Even science cannot lay its hands on a true zero.',
      source: 'Lawrence Krauss, A Universe from Nothing (2012)',
      emoji: '⚛️',
    },
    {
      type: 'question',
      prompt: 'Why is imagining true nothingness so difficult?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'We simply haven\'t studied enough physics', isCorrect: false },
          { id: 'b', text: 'Every mental image we form is itself a something', isCorrect: true },
          { id: 'c', text: 'Nothingness is too small to picture', isCorrect: false },
          { id: 'd', text: 'Our eyes need light in order to see', isCorrect: false },
        ],
        explanation: 'Any void or absence we conjure is itself a mental something. Imagination always reaches for content, so pure nothingness can never be glimpsed from within.',
      },
    },
    {
      type: 'question',
      prompt: 'In quantum physics, even empty space is actually full of something.',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: true,
        explanation: 'The quantum vacuum hums with fluctuating energy and fleeting particles. A true emptiness — zero energy, zero activity — appears nowhere in nature, not even in physics.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'You\'ve seen how "nothing" slips through the fingers the moment you grasp it.',
      body: 'Philosophers split everyday nothing — an empty box — from absolute nothing, the absence of all being. That second kind may resist clear thought entirely, which hints at something wild: perhaps nothingness was never a coherent option, and something simply had to be.',
      emoji: '💡',
    },
    {
      type: 'summary',
      title: 'The Puzzle of Nothingness',
      keyPoints: [
        'Absolute nothing leaves no space, time, or law',
        'Every picture of nothing smuggles in a something',
        'Even physics finds no truly empty space',
        'Nothingness may be no coherent idea at all',
      ],
      closingThought: 'Maybe being is no surprise — maybe nothing was never truly on the table.',
    },
  ],
};

export default lesson;

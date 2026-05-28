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
      headline: '"Nothing" is the most confusing word in any language.',
      subtext: 'The moment you think about it, it stops being nothing.',
      emoji: '⬛',
    },
    {
      type: 'concept',
      title: 'What Philosophers Mean by Nothing',
      body: 'In everyday life, "nothing" means an empty box or a blank page. But philosophers mean something far more radical: the total absence of everything — no matter, no space, no time, no laws, no possibilities. This absolute nothingness is called the "null hypothesis" of existence. It\'s surprisingly hard to even imagine.',
      visual: '🕳️',
      highlight: 'absolute nothingness',
    },
    {
      type: 'concept',
      title: 'The Conceivability Problem',
      body: 'Try imagining true nothingness. You\'ll picture a dark void — but a void is still something (space). You\'ll picture silence — but silence is an absence of sound, not an absence of everything. Every attempt to picture nothing secretly smuggles in something. This suggests our minds may be fundamentally unable to conceive of pure nothingness.',
      visual: '🧠',
      highlight: 'conceivability',
    },
    {
      type: 'example',
      title: 'Physics Weighs In',
      scenario: 'In quantum physics, even "empty" space seethes with activity. Virtual particles blink in and out of existence. Energy fluctuates even in a vacuum. Physicists call this the quantum vacuum — and it\'s anything but nothing. Some cosmologists propose our entire universe erupted from a quantum fluctuation of near-nothingness. Even science struggles to find a true zero.',
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
          { id: 'a', text: 'We haven\'t studied enough physics', isCorrect: false },
          { id: 'b', text: 'Every mental image we form is itself something', isCorrect: true },
          { id: 'c', text: 'Nothingness is too small to picture', isCorrect: false },
          { id: 'd', text: 'Our eyes need light to see anything', isCorrect: false },
        ],
        explanation: 'Any image, void, or absence we conjure is itself a mental something. Our imagination always works with content — making pure nothingness impossible to picture from the inside.',
      },
    },
    {
      type: 'question',
      prompt: 'In quantum physics, even empty space is actually full of something.',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: true,
        explanation: 'The quantum vacuum is filled with fluctuating energy and virtual particles. True emptiness — zero energy, zero activity — doesn\'t appear to exist even in physics.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'You\'ve seen that "nothing" is harder to define than it looks.',
      body: 'Philosophers distinguish everyday nothing (an empty box) from absolute nothing (zero existence). The second kind may be impossible to even think about clearly — which raises a wild possibility: maybe nothingness is not a coherent concept at all, and something had to exist.',
      emoji: '💡',
    },
    {
      type: 'summary',
      title: 'The Puzzle of Nothingness',
      keyPoints: [
        'Absolute nothing means no space, time, or laws',
        'Every attempt to picture nothing sneaks in something',
        'Quantum physics can\'t find a true empty space either',
        'Nothingness may not be a coherent concept',
      ],
      closingThought: 'Perhaps existence isn\'t surprising — perhaps nothing was never really an option.',
    },
  ],
};

export default lesson;

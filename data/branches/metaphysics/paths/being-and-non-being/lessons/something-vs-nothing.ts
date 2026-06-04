import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'metaphysics-being-2',
  slug: 'something-vs-nothing',
  title: 'Something vs. Nothing',
  description: 'What do philosophers mean by "nothing," and can we even imagine true nothingness?',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: '"Nothing" is a trickier word than it looks.',
      subtext: 'As soon as you try to think about it, it seems to turn into something.',
      emoji: '⬛',
    },
    {
      type: 'concept',
      title: 'What Philosophers Mean by Nothing',
      body: 'In everyday speech, "nothing" means an empty box or a blank page. Philosophers mean something stricter: the absence of absolutely everything. No matter, no space, no time, no laws of physics, not even possibilities. It\'s the idea of complete non-existence, and it turns out to be surprisingly hard to picture.',
      visual: '🕳️',
      highlight: 'absolute nothingness',
    },
    {
      type: 'concept',
      title: 'Why It\'s Hard to Imagine',
      body: 'Try to imagine true nothingness. If you picture a dark void, that\'s still empty space, which is something. If you imagine silence, that\'s still a place where sound could happen. Every mental image you form is made of something. So picturing pure nothing may be a task the mind just can\'t do.',
      visual: '🧠',
      highlight: 'conceivability',
    },
    {
      type: 'example',
      title: 'What Physics Says',
      scenario: 'In quantum physics, even "empty" space is never truly still. Tiny particles appear and vanish, and energy keeps shifting inside a vacuum. Physicists call this the quantum vacuum, and it is not really nothing. Some cosmologists think our universe began from a state like this. Even science can\'t find a true zero.',
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
        explanation: 'Any void or empty space we picture is still a mental image, which is itself something. Imagination always needs content, so pure nothing can\'t be pictured.',
      },
    },
    {
      type: 'question',
      prompt: 'In quantum physics, even empty space is actually full of something.',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: true,
        explanation: 'The quantum vacuum is full of shifting energy and brief particles. A true emptiness, with zero energy and zero activity, is not found anywhere in nature.',
      },
    },
    {
      type: 'reinforcement',
      callout: '"Nothing" keeps turning into something when you examine it.',
      body: 'Philosophers separate everyday nothing, like an empty box, from absolute nothing, the absence of all existence. The second kind may not even be a coherent idea. If so, that points to an interesting possibility: maybe nothing was never a real option, and something had to exist.',
      emoji: '💡',
    },
    {
      type: 'summary',
      title: 'The Puzzle of Nothingness',
      keyPoints: [
        'Absolute nothing has no space, time, or laws',
        'Every picture of nothing is still something',
        'Even physics finds no truly empty space',
        'Nothing may not be a coherent idea at all',
      ],
      closingThought: 'If true nothing isn\'t even possible, then maybe something always had to exist.',
    },
  ],
};

export default lesson;

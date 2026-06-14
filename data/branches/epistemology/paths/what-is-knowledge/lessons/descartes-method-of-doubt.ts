import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'epistemology-knowledge-13',
  slug: 'descartes-method-of-doubt',
  title: 'Doubting Everything To Find One Sure Thing',
  description: 'Descartes burns down his beliefs to see what survives. One thing does.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'What if you set fire to every belief you own?',
      subtext: 'One man tried. He wanted to see what would refuse to burn.',
      emoji: '🔥',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you saw doubt as a threat.',
      body: 'Back in the skepticism lesson, doubt looked like an enemy — proof we might know nothing. Descartes flips it. He wields doubt on purpose, as a tool to clear away anything shaky and find what stands.',
      emoji: '🛠️',
    },
    {
      type: 'concept',
      title: 'Methodical Doubt',
      body: 'Descartes refuses any belief that could possibly be false — even by a sliver. Senses deceive, dreams feel real, math could be tampered with. He throws it all out, hunting for one belief no doubt can touch.',
      visual: '🧹',
      highlight: 'methodical doubt',
    },
    {
      type: 'example',
      title: 'The Evil Demon',
      scenario: 'Imagine an all-powerful demon devoted to fooling you. The sky, your hands, even arithmetic — all fake, planted in your mind. Almost everything you believe could be its illusion. Descartes asks: is there anything the demon could NOT fake, even with infinite power?',
      source: 'Descartes, Meditations on First Philosophy',
      emoji: '😈',
    },
    {
      type: 'concept',
      title: 'The One Survivor',
      body: 'The demon can fake the world, but not the doubting. To be deceived, you must exist to be deceived. The moment you think — even a wrong thought — you prove a thinker is there. This is the cogito: it verifies itself.',
      visual: '💡',
      highlight: 'the cogito',
    },
    {
      type: 'quote',
      id: 'lq-epistemology-knowledge-13',
      quote: 'I think, therefore I am.',
      author: 'René Descartes',
      era: '1637',
      work: 'Discourse on the Method',
      philosopherId: 'rene-descartes',
    },
    {
      type: 'question',
      prompt: 'True or false: even your own existence could be the demon’s illusion, so the cogito fails.',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: false,
        explanation: 'False. The cogito is self-verifying. For the demon to deceive you, there must be a "you" being deceived. The very act of doubting requires a doubter — so doubting proves you exist. You can’t think yourself out of existence.',
      },
    },
    {
      type: 'summary',
      title: 'What You Now Know',
      keyPoints: [
        'Methodical doubt discards anything possibly false.',
        'One belief resists every doubt: that you think.',
        'The cogito proves itself — doubting needs a doubter.',
      ],
      closingThought: 'Descartes found bedrock. Next: could a demon — or a machine — fake the rest of your world?',
    },
  ],
};

export default lesson;

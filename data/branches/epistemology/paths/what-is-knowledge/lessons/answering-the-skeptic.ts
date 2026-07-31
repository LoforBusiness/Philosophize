import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'epistemology-knowledge-24',
  slug: 'answering-the-skeptic',
  title: 'Here Is One Hand',
  description: 'The skeptic says you know nothing. Can you answer without playing his game?',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'What if you cannot prove you are not dreaming right now?',
      subtext: 'The skeptic says you know nothing for certain. Two thinkers refuse to panic.',
      emoji: '✋',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you were trapped in a vat.',
      body: 'The brain-in-a-vat argument said: you cannot rule out being a brain fed fake experiences. If so, you do not know you have hands, a house, a body. The skeptic builds a tidy argument, and it is hard to escape on his terms. So maybe do not accept his terms.',
      emoji: '🧠',
    },
    {
      type: 'example',
      title: 'Moore Holds Up His Hand',
      scenario:
        'In a 1939 lecture, philosopher G.E. Moore raised one hand and said, "Here is one hand." He raised the other: "and here is another." He argued this proves an external world exists. Whatever clever premise the skeptic offers, Moore was more certain he had hands than he was of that premise.',
      source: 'G.E. Moore, "Proof of an External World"',
      emoji: '🖐️',
    },
    {
      type: 'concept',
      title: 'Moore’s Shift',
      body: 'The skeptic argues: if you cannot rule out a dream, you do not know you have hands. Moore flips it. You DO know you have hands—so something in his argument must be false. He keeps the obvious and rejects the clever premise, rather than the other way around.',
      visual: '🔃',
      highlight: 'Moore’s shift',
    },
    {
      type: 'quote',
      id: 'lq-epistemology-knowledge-24-1',
      quote: 'Here is one hand, and here is another.',
      author: 'G.E. Moore',
      era: '1939',
      work: 'Proof of an External World',
      philosopherId: 'ge-moore',
    },
    {
      type: 'concept',
      title: 'Contextualism',
      body: 'A second escape: "know" means different things in different contexts. In daily life, "I know I have hands" is true—everyday standards are met. In the philosophy seminar, standards skyrocket and the same sentence turns false. The skeptic is right only when the bar is impossibly high. He just quietly raised it.',
      visual: '🎚️',
      highlight: 'contextualism',
    },
    {
      type: 'question',
      prompt: 'Here is the skeptic’s argument. Which step would Moore refuse?',
      xpValue: 5,
      interaction: {
        type: 'tap-flaw',
        steps: [
          { id: 's1', text: 'You cannot rule out that you are dreaming.' },
          { id: 's2', text: 'If you cannot rule that out, you do not know you have hands.' },
          { id: 's3', text: 'So you do not know you have hands.' },
        ],
        flawedId: 's2',
        explanation: 'Step 2 — and notice that Moore never disputes step 1. He does not try to prove dreams impossible; that would be fighting on the skeptic’s ground. He asks instead which is more certain: "here is a hand," or an abstract premise about ruling things out. He keeps the obvious and lets the clever premise fall.',
      },
    },
    {
      type: 'summary',
      title: 'What You Now Know',
      keyPoints: [
        'Skepticism says certainty is unreachable',
        'Moore trusts the obvious over clever premises',
        'Moore’s shift reverses the skeptic’s argument',
        'Contextualism: "know" shifts with the standards',
      ],
      closingThought: 'You need not defeat every skeptical fantasy to live and learn. Sometimes the wiser move is to refuse the game.',
    },
  ],
};

export default lesson;

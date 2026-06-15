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
      callout: 'Lesson 14 trapped you in a vat.',
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
      prompt: 'A skeptic insists you don’t know you’re reading, since you can’t rule out a dream. What’s Moore’s strategy?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Trust the obvious fact more than the skeptic’s slippery premise', isCorrect: true },
          { id: 'b', text: 'Prove from scratch that dreams are impossible', isCorrect: false },
          { id: 'c', text: 'Agree he knows nothing and give up on certainty', isCorrect: false },
          { id: 'd', text: 'Argue that dreaming and waking feel exactly the same', isCorrect: false },
        ],
        explanation:
          'Option (b) is the tempting trap—it accepts the skeptic’s demand to win on his terms by defeating the dream scenario head-on. Moore refuses that game. His move is comparative: which is more certain, "here is a hand" or the abstract premise that I can’t rule out a dream? He keeps the obvious and lets the fancy premise fall.',
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

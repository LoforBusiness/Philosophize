import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'epistemology-knowledge-29',
  slug: 'knowledge-versus-understanding',
  title: 'Knowing That Versus Grasping Why',
  description: 'You can know a thousand facts and still not understand a thing.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'You can memorize every fact and still understand nothing.',
      subtext: 'Knowing that the sky is blue is not the same as grasping why it is.',
      emoji: '💡',
    },
    {
      type: 'example',
      title: 'The Recipe and the Cook',
      scenario:
        'Two people each know the recipe word for word. One can recite the steps but panics when the sauce splits—she does not know what the steps are for. The other grasps why you temper the eggs and rescue the sauce in seconds. Same facts in their heads. Only one truly understands the dish.',
      emoji: '🍳',
    },
    {
      type: 'concept',
      title: 'Knowing That vs Understanding Why',
      body: 'Knowledge often comes in isolated facts: knowing THAT something is so. Understanding is different—it is grasping WHY, seeing how the pieces connect into a coherent whole. You can know a hundred disconnected facts about an engine and still not understand how it runs.',
      visual: '🧩',
      highlight: 'understanding',
    },
    {
      type: 'concept',
      title: 'Why Understanding Goes Further',
      body: 'Understanding lets you do what mere facts cannot: explain, predict, and handle new cases. The cook who grasps why the sauce splits can fix a dish she has never made. Understanding is knowledge that has been woven into a structure—so it transfers, while a stack of facts just sits there.',
      visual: '🕸️',
      highlight: 'grasping connections',
    },
    {
      type: 'reinforcement',
      callout: 'Echoes of the regress and the web.',
      body: 'Earlier you pictured beliefs as a web held together by mutual support. Understanding is that web seen from the inside—knowing not just the nodes but how they hold each other up. It is why coherence matters: connection is the difference between a list and a grasp.',
      emoji: '🧶',
    },
    {
      type: 'quote',
      id: 'lq-epistemology-knowledge-29-1',
      quote: 'Wonder is the feeling of a philosopher, and philosophy begins in wonder.',
      author: 'Plato (Socrates speaking)',
      era: 'c. 369 BCE',
      work: 'Theaetetus',
      philosopherId: 'plato',
    },
    {
      type: 'question',
      prompt: 'A student aces a physics test by memorizing answers but can’t solve a new problem. What does she lack?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Understanding—she knows the facts but not how they connect', isCorrect: true },
          { id: 'b', text: 'Knowledge—she clearly knows none of the physics facts', isCorrect: false },
          { id: 'c', text: 'Nothing—a high score proves she fully understands', isCorrect: false },
          { id: 'd', text: 'Memory—she simply forgot the answers under pressure', isCorrect: false },
        ],
        explanation:
          'Option (c) is the tempting trap: it treats the test score as proof of understanding. But the score only measured recall of THAT—the right answers. Understanding shows up exactly where she failed: a novel problem, where you must see WHY the principles apply and connect them. Facts you can recite but not transfer are knowledge without understanding.',
      },
    },
    {
      type: 'summary',
      title: 'What You Now Know',
      keyPoints: [
        'Knowing-that is isolated facts',
        'Understanding is grasping why and how things connect',
        'Understanding transfers to brand-new cases',
        'A pile of facts is not yet a grasp',
      ],
      closingThought: 'Don’t just collect facts like souvenirs. Ask how they fit together—that is when knowledge turns into understanding.',
    },
  ],
};

export default lesson;

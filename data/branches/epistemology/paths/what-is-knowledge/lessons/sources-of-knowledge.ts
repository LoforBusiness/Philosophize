import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'epistemology-knowledge-12',
  slug: 'sources-of-knowledge',
  title: 'Where Does What You Know Come From?',
  description: 'Perception, testimony, and memory: the three great pipelines of belief.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Almost everything you know, you were told.',
      subtext: 'You have never seen an atom or your own birth. So how do you know them?',
      emoji: '📡',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you weighed empiricism against rationalism.',
      body: 'That asked the big question: do we learn from experience or from reason? Now we zoom in on the everyday channels that actually deliver beliefs into your head.',
      emoji: '🔍',
    },
    {
      type: 'concept',
      title: 'Three Sources',
      body: 'Most knowledge arrives by three routes. Perception: what you see, hear, and touch. Testimony: what others tell you. Memory: what you retain from before. Each is powerful, and each can fail.',
      visual: '👁️',
      highlight: 'perception, testimony, memory',
    },
    {
      type: 'example',
      title: 'The Quiet Giant',
      scenario:
        'You believe Antarctica exists, that water is H2O, and that Napoleon lost at Waterloo. You have witnessed none of these. They reached you through testimony: teachers, books, maps, experts. Testimony is the silent source behind the overwhelming majority of what any single person knows.',
      emoji: '🗺️',
    },
    {
      type: 'quote',
      id: 'lq-epistemology-knowledge-12-1',
      quote: 'There is no species of reasoning more common, more useful, and even necessary to human life, than that which is derived from the testimony of men.',
      author: 'David Hume',
      era: '1748',
      work: 'An Enquiry Concerning Human Understanding',
      philosopherId: 'david-hume',
    },
    {
      type: 'question',
      prompt: 'Sort these beliefs by which source you most directly rely on, from raw perception to pure testimony.',
      xpValue: 5,
      interaction: {
        type: 'sort',
        items: [
          { id: 'see', text: 'It is raining right now (you feel the drops)' },
          { id: 'mem', text: 'You ate toast for breakfast (you recall it)' },
          { id: 'told', text: 'The Great Wall of China exists (you were taught)' },
        ],
        correctOrder: ['see', 'mem', 'told'],
        explanation:
          'Perception is most direct (you sense it now), memory is one step removed (the experience is past), and testimony is most indirect (you trust someone else). All three are real sources, but they differ in how directly the world reaches you.',
      },
    },
    {
      type: 'summary',
      title: 'The Pipelines of Belief',
      keyPoints: [
        'Perception, testimony, and memory feed most knowledge',
        'Testimony carries the lion’s share of what we know',
        'Each source is powerful but fallible',
        'Hume saw testimony as necessary to human life',
      ],
      closingThought: 'You are not an island of knowledge. You are a node in a vast web of trust.',
    },
  ],
};

export default lesson;

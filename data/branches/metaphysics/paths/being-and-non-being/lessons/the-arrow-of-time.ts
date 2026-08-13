import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'metaphysics-being-33',
  slug: 'the-arrow-of-time',
  title: 'Why Does Time Only Go One Way?',
  description: 'Every collision runs backwards just as well. So why does the film never look right in reverse?',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'You can tell a film is running backwards. How?',
      subtext: 'Nothing in the physics tells you. Something else does.',
      emoji: '🧱',
    },
    {
      type: 'concept',
      title: 'The Laws Do Not Care',
      body: 'Take any collision between two blocks and film it. Run the film backwards and you get another collision that obeys exactly the same laws. The equations of motion work the same in both directions. Nothing in them points one way.',
      visual: '↔️',
      highlight: 'Reversible, every step',
    },
    {
      type: 'example',
      title: 'The Tower and the Rubble',
      scenario: 'A tower of nine blocks falls into a heap. Nobody has ever seen a heap leap back into a tower, though every collision in that leap would be legal. The difference is not in the rules. It is in the counting.',
      source: 'Boltzmann, on entropy',
    },
    {
      type: 'quote',
      id: 'lq-metaphysics-being-33',
      quote: 'The law that entropy always increases holds, I think, the supreme position among the laws of Nature.',
      author: 'Arthur Eddington',
      era: '1928',
    },
    {
      type: 'question',
      prompt: 'Why does the rubble never leap back into a tower?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'There is one way to be a tower and astronomically many ways to be a heap', isCorrect: true },
          { id: 'b', text: 'The laws of physics forbid the reverse collisions', isCorrect: false },
          { id: 'c', text: 'Energy is destroyed in the fall and cannot come back', isCorrect: false },
          { id: 'd', text: 'Time is a substance that flows in one direction only', isCorrect: false },
        ],
        explanation: 'Every reverse collision is legal. What is missing is not permission but numbers: the ordered arrangements are a vanishing fraction of all the arrangements, so a system wandering at random walks away from them and effectively never wanders back.',
      },
    },
    {
      type: 'question',
      prompt: 'So where does time\'s direction actually come from?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'From the universe having started in an extraordinarily ordered state', isCorrect: true },
          { id: 'b', text: 'From the equations of motion, which single out one direction', isCorrect: false },
          { id: 'c', text: 'From our memories, which only happen to run one way', isCorrect: false },
          { id: 'd', text: 'From nothing — the direction is an illusion with no basis at all', isCorrect: false },
        ],
        explanation: 'The equations are symmetric, so the asymmetry has to be in the starting conditions. A universe that began in a very low-entropy state has an overwhelmingly likely direction to move in — and that direction is what we call forward.',
      },
    },
    {
      type: 'summary',
      title: 'The Arrow Is In The Counting',
      keyPoints: [
        'Every microscopic collision runs backwards legally',
        'Ordered states are vastly outnumbered by messy ones',
        'So a system wanders away from order and never back',
        'The arrow comes from how the universe started',
      ],
      closingThought: 'Time does not push you forward. You are drifting into the far larger set of ways things can be.',
    },
  ],
};

export default lesson;

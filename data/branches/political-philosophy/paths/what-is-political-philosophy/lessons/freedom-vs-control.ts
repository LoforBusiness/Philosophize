import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'political-political-4',
  slug: 'freedom-vs-control',
  title: 'Freedom vs. Control',
  description: 'Unpack the tension between individual liberty and government authority.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Free because no one stops you, or because you can act?',
      subtext: 'Two visions of liberty, leading to two very different politics.',
      emoji: '🗽',
    },
    {
      type: 'concept',
      title: 'Negative Liberty: Freedom From',
      body: 'John Stuart Mill championed negative liberty — freedom from the interference of others, above all the state. You are free insofar as no one bars you from doing as you wish. Government may curb that freedom only to spare others harm. Here lies the famous "harm principle": your liberty ends where another\'s begins.',
      visual: '🚫',
      highlight: 'negative liberty',
    },
    {
      type: 'example',
      title: 'Mill\'s Harm Principle at Work',
      scenario: 'Mill held that if you choose a reckless diet, court danger, or cling to unpopular views, the state has no right to stop you — not even "for your own good." Paternalism, shielding people from themselves, tramples liberty. But should your choices wound others — poisoning their water, defrauding them, striking them — then the state may rightly intervene.',
      source: 'John Stuart Mill, On Liberty (1859)',
      emoji: '📖',
    },
    {
      type: 'concept',
      title: 'Positive Liberty: Freedom To',
      body: 'Isaiah Berlin named a second idea: positive liberty — the real power to act and reach your ends. You may be "free" from any government meddling, yet too poor, unschooled, or unwell to use that freedom for anything. Positive liberty asks a harder question: must the state empower people, not merely step aside?',
      visual: '💪',
      highlight: 'positive liberty',
    },
    {
      type: 'question',
      prompt: 'Which vision of liberty is about clearing away obstacles and interference?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Positive liberty — the power to reach your goals', isCorrect: false },
          { id: 'b', text: 'Negative liberty — freedom from the interference of others', isCorrect: true },
          { id: 'c', text: 'Natural liberty — the freedom we are born with', isCorrect: false },
          { id: 'd', text: 'Civil liberty — the freedom a constitution guarantees', isCorrect: false },
        ],
        explanation: 'Negative liberty is defined by the absence of outside constraint — no one stands in your way. Positive liberty, by contrast, asks whether you truly possess the power to act.',
      },
    },
    {
      type: 'example',
      title: 'One Freedom, Two Verdicts',
      scenario: 'Picture someone legally free to study at any university — no law bars the door. A thinker of negative liberty calls them free. Yet if they cannot afford the tuition and no help exists, a thinker of positive liberty insists they are not truly free at all. This quarrel quietly shapes our debates over schools, healthcare, and welfare.',
      source: 'Isaiah Berlin, Two Concepts of Liberty (1958)',
      emoji: '🎓',
    },
    {
      type: 'question',
      prompt: 'True or false: Mill thought the state should shield people from their own bad choices.',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: false,
        explanation: 'Mill set himself flatly against paternalism. His harm principle allows only one rightful reason to curb a person\'s liberty — to prevent harm to others, never to save the person from themselves.',
      },
    },
    {
      type: 'summary',
      title: 'Two Ways to Think About Freedom',
      keyPoints: [
        'Negative liberty: freedom from interference and coercion',
        'Mill\'s harm principle: curb liberty only to spare others',
        'Positive liberty: the real power to act, not just open doors',
        'Their tension shapes every debate about government',
      ],
      closingThought: 'How you define freedom quietly decides the society you hope to build.',
    },
  ],
};

export default lesson;

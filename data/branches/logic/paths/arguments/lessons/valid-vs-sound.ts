import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'logic-arguments-3',
  slug: 'how-arguments-work',
  title: 'How Arguments Work',
  description: 'Discover what makes reasoning powerful — when true premises and correct logic combine, the conclusion is guaranteed.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Good reasoning is a lock, and the conclusion is the only key.',
      subtext: 'When an argument truly works, the conclusion is not a choice — it is compelled.',
      emoji: '🔒',
    },
    {
      type: 'concept',
      title: 'How the Pieces Connect',
      body: 'An argument works when its premises are true and its reasoning sound. When both hold, the conclusion MUST follow — you cannot grant the reasons and still deny what they yield. That unbreakable link is the very source of logic\'s power.',
      visual: '⚙️',
      highlight: 'must follow',
    },
    {
      type: 'example',
      title: 'The Unstoppable Argument',
      scenario: 'Premise 1: All humans are mortal.\nPremise 2: Socrates is a human.\nConclusion: Socrates is mortal.\n\nBoth premises hold; the logic is airtight. There is simply no way out — the conclusion is sealed within them. Aristotle named this a syllogism, and it has held firm for some 2,400 years.',
      source: 'Aristotle, Prior Analytics',
      emoji: '🏛️',
    },
    {
      type: 'question',
      prompt: 'Arrange the classic argument into its proper logical order.',
      xpValue: 5,
      interaction: {
        type: 'sort',
        items: [
          { id: 'p1', text: 'All humans are mortal.' },
          { id: 'p2', text: 'Socrates is a human.' },
          { id: 'c', text: 'Therefore, Socrates is mortal.' },
        ],
        correctOrder: ['p1', 'p2', 'c'],
        explanation:
          'The two premises lay the groundwork, and the conclusion rises from them. Premises first, conclusion last — this is the shape of every deductive argument.',
      },
    },
    {
      type: 'question',
      prompt: 'If the premises are true and the reasoning sound, what MUST be true?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'The conclusion must be true', isCorrect: true },
          { id: 'b', text: 'The conclusion might happen to be true', isCorrect: false },
          { id: 'c', text: 'The argument is probably right', isCorrect: false },
          { id: 'd', text: 'We still need more evidence', isCorrect: false },
        ],
        explanation: 'When the premises are true and the logic sound, the conclusion is guaranteed — not probable, not likely, but certain. That certainty is logic\'s quiet power.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'You have learned that arguments are made of premises and conclusions.',
      body: 'Now you see what follows when those premises are true and rightly joined: the conclusion becomes unavoidable. This is the moment reasoning sheds its guesswork and turns into something like proof.',
      emoji: '💡',
    },
    {
      type: 'summary',
      title: 'Logic Clicks',
      keyPoints: [
        'True premises and sound logic guarantee the conclusion',
        'If the premises are true, the conclusion cannot be false',
        'This sealed-in certainty is the power of logic',
        'Aristotle\'s syllogism still holds firm today',
      ],
      closingThought: 'Master this, and you hold the most trustworthy instrument the human mind has ever made.',
    },
  ],
};

export default lesson;

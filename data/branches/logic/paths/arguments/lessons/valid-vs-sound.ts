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
      headline: 'Good reasoning is a lock. The conclusion has to open.',
      subtext: 'When an argument works correctly, the conclusion isn\'t optional — it\'s forced.',
      emoji: '🔒',
    },
    {
      type: 'concept',
      title: 'How the Pieces Connect',
      body: 'An argument works when the premises are true and the reasoning is correct. When both conditions hold, the conclusion MUST follow — you can\'t accept the reasons and reject the conclusion. That guaranteed link is what gives logic its power.',
      visual: '⚙️',
      highlight: 'must follow',
    },
    {
      type: 'example',
      title: 'The Unstoppable Argument',
      scenario: 'Premise 1: All humans are mortal.\nPremise 2: Socrates is a human.\nConclusion: Socrates is mortal.\n\nBoth premises are true. The logic is airtight. There is no escape — the conclusion is locked in. Aristotle called this a syllogism, and it still works 2,400 years later.',
      source: 'Aristotle, Prior Analytics',
      emoji: '🏛️',
    },
    {
      type: 'question',
      prompt: 'Build the classic argument in logical order.',
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
          'Two premises set up the reasoning, and the conclusion follows from them. Premises first, conclusion last — that is the shape of every deductive argument.',
      },
    },
    {
      type: 'question',
      prompt: 'If premises are true and the reasoning is correct, what MUST be true?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'The conclusion must be true', isCorrect: true },
          { id: 'b', text: 'The conclusion might be true', isCorrect: false },
          { id: 'c', text: 'The argument is probably right', isCorrect: false },
          { id: 'd', text: 'We need more evidence', isCorrect: false },
        ],
        explanation: 'When premises are true and logic is correct, the conclusion is guaranteed — not probable, not likely, but certain. That certainty is logic\'s superpower.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'You just learned that arguments have premises and conclusions.',
      body: 'Now you know what happens when those premises are true and connected correctly: the conclusion is unavoidable. This is the moment reasoning stops being guesswork and becomes proof.',
      emoji: '💡',
    },
    {
      type: 'summary',
      title: 'Logic Clicks',
      keyPoints: [
        'True premises + correct logic = guaranteed conclusion',
        'The conclusion cannot be false if premises are true',
        'This locked-in certainty is logic\'s power',
        'Aristotle\'s syllogism still works today',
      ],
      closingThought: 'Master this, and you hold the most reliable tool the human mind has ever built.',
    },
  ],
};

export default lesson;

import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'logic-arguments-3',
  slug: 'how-arguments-work',
  title: 'How Arguments Work',
  description: 'When the premises are true and the logic is correct, the conclusion is guaranteed.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'When an argument really works, the conclusion has to be true.',
      subtext: 'Accept true premises plus correct logic, and the conclusion follows.',
      emoji: '🔒',
    },
    {
      type: 'concept',
      title: 'How the Pieces Connect',
      body: 'An argument works when its premises are true and its logic is correct. When both hold, the conclusion MUST follow — you can\'t accept the reasons and still deny what they lead to. That tight connection is what gives logic its power.',
      visual: '⚙️',
      highlight: 'must follow',
    },
    {
      type: 'example',
      title: 'The Airtight Argument',
      scenario: 'Premise 1: All humans are mortal.\nPremise 2: Socrates is a human.\nConclusion: Socrates is mortal.\n\nBoth premises are true and the logic is correct, so the conclusion can\'t be false. Aristotle called this kind of argument a syllogism, and it has held up for about 2,400 years.',
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
          'The two premises come first and set up the conclusion that follows from them. Premises first, conclusion last — that\'s the shape of every deductive argument.',
      },
    },
    {
      type: 'question',
      prompt: 'If the premises are true and the logic is correct, what MUST be true?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'The conclusion must be true', isCorrect: true },
          { id: 'b', text: 'The conclusion might happen to be true', isCorrect: false },
          { id: 'c', text: 'The argument is probably right', isCorrect: false },
          { id: 'd', text: 'We still need more evidence', isCorrect: false },
        ],
        explanation: 'When the premises are true and the logic is correct, the conclusion is guaranteed — not just likely, but certain. That certainty is what makes logic powerful.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'You\'ve learned that arguments are made of premises and conclusions.',
      body: 'Now you can see what happens when the premises are true and the logic is correct: the conclusion has to be true. That\'s the point where reasoning stops being guesswork and becomes proof.',
      emoji: '💡',
    },
    {
      type: 'summary',
      title: 'Logic Clicks',
      keyPoints: [
        'True premises plus correct logic guarantee the conclusion',
        'If the premises are true, the conclusion can\'t be false',
        'That guaranteed result is the power of logic',
        'Aristotle\'s syllogism still holds up today',
      ],
      closingThought: 'This is one of the most reliable thinking tools we have.',
    },
  ],
};

export default lesson;

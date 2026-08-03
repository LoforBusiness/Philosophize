import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'political-political-31',
  slug: 'the-tragedy-of-the-commons',
  title: 'The Tragedy of the Commons',
  description: 'Four herders ruin a shared field, and not one of them does anything irrational.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Everyone acts sensibly. The field dies anyway.',
      subtext: 'Nobody here is greedy. The arithmetic is doing it.',
      emoji: '🌾',
    },
    {
      type: 'concept',
      title: 'Private Gain, Shared Cost',
      body: 'Put one more animal on the common field and the whole benefit is yours. The damage to the grass is spread across every herder, so you carry only a fraction of it. Adding the animal is the sensible move — and it is the sensible move for all of them.',
      visual: '➗',
      highlight: 'The gain is not divided; the cost is',
    },
    {
      type: 'example',
      title: 'Not a Story About Greed',
      scenario: 'The herder who shows restraint does not save the field. They simply take a smaller share of a field that dies anyway. That is what makes this structural: good character is not a solution when the payoffs are arranged this way.',
      source: 'Garrett Hardin, 1968',
    },
    {
      type: 'quote',
      id: 'lq-political-political-31',
      quote: 'That which is common to the greatest number has the least care bestowed upon it.',
      author: 'Aristotle',
      era: 'c. 350 BC',
    },
    {
      type: 'question',
      prompt: 'What makes ruining the field the sensible move for each of them?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'The cost is shared while the gain is not', isCorrect: true },
          { id: 'b', text: 'The gain from one more animal', isCorrect: false },
          { id: 'c', text: 'Their greed', isCorrect: false },
          { id: 'd', text: 'The grass, which was always going to run out', isCorrect: false },
        ],
        explanation: 'A gain of one against a cost of one is a bad trade and nobody makes it. A gain of one against a quarter of a cost is a good trade, and every herder does the same sum and reaches the same answer.',
      },
    },
    {
      type: 'question',
      prompt: 'So what actually fixes it?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Changing the arithmetic — a limit all are bound to, or ownership that returns the cost to the user', isCorrect: true },
          { id: 'b', text: 'Persuading people to be less selfish', isCorrect: false },
          { id: 'c', text: 'Nothing — a commons always collapses', isCorrect: false },
          { id: 'd', text: 'Abolishing the commons and letting the state own everything', isCorrect: false },
        ],
        explanation: 'B fails on its own terms: whoever complies simply loses, and the field dies regardless. C was Hardin\'s own pessimism — Elinor Ostrom won a Nobel documenting commons that never collapsed, each binding its users to a limit they helped set.',
      },
    },
    {
      type: 'summary',
      title: 'The Arithmetic Is Doing It',
      keyPoints: [
        'Private gain against shared cost ruins shared things',
        'Everyone can act rationally and still lose together',
        'Restraint alone does not save a commons',
        'Ostrom: real communities fix it by binding themselves',
      ],
      closingThought: 'When everyone behaves reasonably and the result is a disaster, stop looking at the people and look at the payoffs.',
    },
  ],
};

export default lesson;

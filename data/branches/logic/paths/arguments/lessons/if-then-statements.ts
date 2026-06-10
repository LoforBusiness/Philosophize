import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'logic-arguments-6',
  slug: 'if-then-statements',
  title: 'If, Then: The Conditional',
  description: 'The if-then statement is logic\'s most powerful building block.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Two tiny words run almost every argument.',
      subtext: 'Master "if" and "then" and you hold logic\'s favorite tool.',
      emoji: '🔀',
    },
    {
      type: 'concept',
      title: 'Antecedent and Consequent',
      body: 'A conditional says "if P, then Q." P is the antecedent (the condition); Q is the consequent (what follows). It promises nothing about P alone — only the link between them.',
      visual: '➡️',
      highlight: 'if P, then Q',
    },
    {
      type: 'example',
      title: 'A Promise, Not a Fact',
      scenario: '"If it rains, the streets get wet." This does not say it is raining. It only claims a link: should rain come, wet streets follow. Sunny day? The promise stays unbroken.',
      source: 'Internet Encyclopedia of Philosophy, "Propositional Logic"',
      emoji: '🌧️',
    },
    {
      type: 'quote',
      id: 'lq-logic-arguments-6',
      quote: 'If it was so, it might be; and if it were so, it would be; but as it isn\'t, it ain\'t. That\'s logic.',
      author: 'Lewis Carroll',
      era: '1871',
      work: 'Through the Looking-Glass',
    },
    {
      type: 'question',
      prompt: 'In "If you study, then you pass," which part is the antecedent?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: '"You study" — the condition after "if"', isCorrect: true },
          { id: 'b', text: '"You pass" — the result after "then"', isCorrect: false },
          { id: 'c', text: 'Both halves, equally', isCorrect: false },
          { id: 'd', text: 'Neither — conditionals have no parts', isCorrect: false },
        ],
        explanation: 'The antecedent is the condition introduced by "if"; the consequent is what "then" delivers.',
      },
    },
    {
      type: 'question',
      prompt: 'A conditional is true. Does that mean its antecedent is actually true?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'No — it only claims the link, not the condition', isCorrect: true },
          { id: 'b', text: 'Yes — a true "if-then" makes the "if" true', isCorrect: false },
          { id: 'c', text: 'Yes — otherwise the statement is meaningless', isCorrect: false },
          { id: 'd', text: 'Only if the consequent is also true', isCorrect: false },
        ],
        explanation: '"If pigs fly, the moon is cheese" can be accepted as true while pigs stay grounded — the conditional asserts only the connection.',
      },
    },
    {
      type: 'summary',
      title: 'The Conditional Unlocked',
      keyPoints: [
        '"If P, then Q" links a condition to a result',
        'P is the antecedent, Q the consequent',
        'It asserts the link, not that P is true',
        'Conditionals power deduction\'s strongest moves',
      ],
      closingThought: 'Grasp the if-then and the next moves of logic snap into place.',
    },
  ],
};

export default lesson;

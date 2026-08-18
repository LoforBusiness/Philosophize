import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'logic-arguments-35',
  slug: 'the-third-thing',
  title: 'The Third Thing Doing the Work',
  description: 'Two lines rise together. Neither is pushing the other.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Ice cream sales rise. So do drownings.',
      subtext: 'Nobody drowned from a cone.',
      emoji: '🍦',
    },
    {
      type: 'concept',
      title: 'The Confounder',
      body: 'When two things move together, a third can be moving both. Heat sells ice cream and heat fills the water. Take the summer out and the link between cone and drowning vanishes, because it was never there.',
      visual: '🌡️',
      highlight: 'a third can be moving both',
    },
    {
      type: 'example',
      title: 'It Is Rarely This Obvious',
      scenario: 'Children with bigger feet read better. Coffee drinkers get more heart disease. In the first, age is doing everything. In the second it was smoking, which travelled with coffee for decades and hid inside the result.',
      source: 'Pearl, "Causality" (2000)',
    },
    {
      type: 'quote',
      id: 'lq-logic-arguments-35',
      quote: 'Correlation does not imply causation, but it sure is a hint.',
      author: 'Edward Tufte',
      era: '1994',
    },
    {
      type: 'question',
      prompt: 'What makes something a confounder?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'It causes both of the things that appear linked', isCorrect: true },
          { id: 'b', text: 'It is any third thing measured at the same time', isCorrect: false },
          { id: 'c', text: 'It sits between the cause and the effect in a chain', isCorrect: false },
          { id: 'd', text: 'It is a variable nobody has measured yet', isCorrect: false },
        ],
        explanation: 'It has to feed BOTH. Something sitting in the middle of a real chain is a mechanism, not a confounder, and unmeasured is not the same as confounding — plenty of unmeasured things are irrelevant.',
      },
    },
    {
      type: 'question',
      prompt: 'What does a randomised trial actually do about this?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'It cuts every link into the treatment, including the ones nobody thought of', isCorrect: true },
          { id: 'b', text: 'It measures all the confounders and subtracts them', isCorrect: false },
          { id: 'c', text: 'It makes the sample big enough for the noise to cancel', isCorrect: false },
          { id: 'd', text: 'It proves the treatment works in every population', isCorrect: false },
        ],
        explanation: 'A coin flip decides who gets treated, so nothing else can be deciding. That is why randomising beats measuring: it handles the confounders you never listed, which are the ones that get you.',
      },
    },
    {
      type: 'summary',
      title: 'Look For The Third Thing',
      keyPoints: [
        'Two things moving together may share a cause',
        'A confounder feeds both, not one through the other',
        'Measuring only handles the ones you thought of',
        'Randomising cuts every incoming link at once',
      ],
      closingThought: 'The next time two lines rise together, ask what season they are both standing in.',
    },
  ],
};

export default lesson;

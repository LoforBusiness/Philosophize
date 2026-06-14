import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'political-political-18',
  slug: 'equality-of-what',
  title: 'Equality of What, Really?',
  description: 'Same resources can still mean unequal lives. Amartya Sen reframes the whole question.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Two people, same income. Are they really equal?',
      subtext: 'One walks to work. One cannot walk at all. Same money, different lives.',
      emoji: '🦽',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you asked: equality of what?',
      body: 'Lesson 8 left the question open: equal rights, opportunity, or outcome? Amartya Sen offers a fourth answer the others miss. Forget the things people hold for a moment, he says. Look at what their lives let them actually do.',
      emoji: '🧩',
    },
    {
      type: 'concept',
      title: 'Capabilities, Not Just Resources',
      body: 'Sen says equalize capabilities, the real freedoms people have to do and be: to be nourished, mobile, educated, to take part in their community. Income is only an input. The thing that matters is what each person can convert that income into.',
      visual: '🌱',
      highlight: 'capabilities',
    },
    {
      type: 'example',
      title: 'The Same Bicycle',
      scenario: 'Give two people an identical bicycle. One rides freely across the city. The other, who cannot use their legs, gains almost nothing in real mobility. Same resource, wildly unequal freedom. To Sen, the bicycle was never the point; getting where you want to go was.',
      source: 'Amartya Sen, Development as Freedom (1999)',
      emoji: '🚲',
    },
    {
      type: 'quote',
      id: 'lq-political-political-18-1',
      quote: 'What a person has the actual capability to achieve is influenced by economic opportunities, political liberties, social facilities, and the enabling conditions of good health.',
      author: 'Amartya Sen',
      era: '1999',
      work: 'Development as Freedom',
      philosopherId: 'amartya-sen',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you saw positive liberty.',
      body: 'Lesson 12 distinguished freedom-from interference and freedom-to act. Sen lands squarely on freedom-to: capabilities are positive liberty made measurable, the real power to live a life you have reason to value, not merely being left alone.',
      emoji: '🕊️',
    },
    {
      type: 'question',
      prompt: 'Give two people identical incomes and you have made them equal, full stop. Right?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Yes, equal income just is equality of freedom', isCorrect: false },
          { id: 'b', text: 'No, equal resources can convert into very unequal real freedom', isCorrect: true },
          { id: 'c', text: 'Yes, money is the only thing equality could mean', isCorrect: false },
          { id: 'd', text: 'No, because Sen rejects equality of any kind', isCorrect: false },
        ],
        explanation: 'The trap is the resourcist fallacy: mistaking the means for the end. For Sen, income is only an input. A person with a disability or in scarcity may need far more income to reach the same capabilities, so equal resources can leave real freedom deeply unequal.',
      },
    },
    {
      type: 'summary',
      title: 'Equality, Measured in Freedom',
      keyPoints: [
        'Sen equalizes capabilities, not just resources',
        'Resources are inputs; real freedom is the goal',
        'Equal income can still mean unequal lives',
        'Answers Lesson 8 and deepens positive liberty',
      ],
      closingThought: 'Stop asking what people have. Ask what their lives let them become.',
    },
  ],
};

export default lesson;

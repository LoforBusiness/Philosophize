import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'ethics-ethics-18',
  slug: 'animal-ethics',
  title: 'Do Animals Count?',
  description: 'If suffering is bad, does it matter whose suffering it is? Bentham asked first.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'A pig can suffer. Does that put it inside ethics?',
      subtext: 'We grant moral concern to humans freely. Where exactly is the edge of the circle?',
      emoji: '🐷',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you saw Singer push the moral circle outward.',
      body: 'In the drowning-child lesson, distance gave you no excuse to ignore a stranger. Singer now pushes the same circle further still, past the boundary of our own species.',
      emoji: '🌐',
    },
    {
      type: 'concept',
      title: 'Sentience, Not Species',
      body: 'Singer argues the trait that earns moral concern is sentience, the capacity to suffer, not intelligence or species. To discount a being just for being non-human is a bias he names speciesism, structurally like racism.',
      visual: '🐾',
      highlight: 'speciesism',
    },
    {
      type: 'quote',
      id: 'lq-ethics-ethics-18-1',
      quote: 'The question is not, Can they reason? nor, Can they talk? but, Can they suffer?',
      author: 'Jeremy Bentham',
      era: '1789',
      work: 'An Introduction to the Principles of Morals and Legislation',
      philosopherId: 'jeremy-bentham',
    },
    {
      type: 'reinforcement',
      callout: 'Remember Bentham’s hedonic calculus?',
      body: 'You measured right and wrong in units of pleasure and pain. If pain is the unit, an animal’s pain registers on the same scale. Singer simply refuses to zero it out because the sufferer is not human.',
      emoji: '⚖️',
    },
    {
      type: 'example',
      title: 'Rights, Not Just Interests',
      scenario: 'Tom Regan goes further than Singer. Many animals are subjects-of-a-life: they have beliefs, desires, and a welfare that matters to them. So they hold inherent rights, not merely interests to be weighed away when ours outweigh theirs.',
      source: 'Tom Regan, The Case for Animal Rights (1983)',
      emoji: '🦊',
    },
    {
      type: 'question',
      prompt: 'For Singer, what determines whether a being deserves moral consideration?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Whether the being can suffer', isCorrect: true },
          { id: 'b', text: 'Animals cannot reason or speak, so they fall outside ethics entirely', isCorrect: false },
          { id: 'c', text: 'Whether the being is useful to human beings', isCorrect: false },
          { id: 'd', text: 'Whether the being belongs to an endangered species', isCorrect: false },
        ],
        explanation: 'Option B commits the very speciesism Singer names, and it is a non sequitur: reasoning is irrelevant to suffering. Infants and the severely cognitively impaired cannot reason either, yet plainly count. The morally relevant capacity is the capacity to suffer.',
      },
    },
    {
      type: 'summary',
      title: 'The Circle Widens Again',
      keyPoints: [
        'Sentience, not species, grounds moral concern',
        'Discounting a being for its species is speciesism',
        'Bentham asked only whether they can suffer',
        'Regan grants animals inherent rights, not mere interests',
      ],
      closingThought: 'The next time you draw the moral circle, ask what trait you used and whether it really earns the line.',
    },
  ],
};

export default lesson;

import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'logic-arguments-33',
  slug: 'how-simple-should-an-explanation-be',
  title: 'How Simple Should an Explanation Be?',
  description: 'A theory that explains everything you have seen may explain nothing you have not.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Any set of dots has a line through every one of them.',
      subtext: 'That line is usually worthless.',
      emoji: '📈',
    },
    {
      type: 'concept',
      title: "Occam's Razor",
      body: 'Do not multiply entities beyond necessity. Between two accounts that fit the same evidence, take the one with fewer moving parts. It is not that nature is tidy — it is that every extra part is an extra thing that can be wrong.',
      visual: '✂️',
      highlight: 'Fewer moving parts',
    },
    {
      type: 'example',
      title: 'Fitting the Noise',
      scenario: 'Add enough bends to a curve and it will pass through every measurement exactly. It will also pass through every measurement error exactly, because it cannot tell them apart. Ask it about a new point and it is worse than a straight line.',
      source: 'Overfitting',
    },
    {
      type: 'quote',
      id: 'lq-logic-arguments-33',
      quote: 'Everything should be made as simple as possible, but not simpler.',
      author: 'Albert Einstein',
      era: 'attributed',
    },
    {
      type: 'question',
      prompt: 'Why prefer the simpler of two theories that fit equally well?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Every extra part is another thing that can be wrong, so it predicts worse', isCorrect: true },
          { id: 'b', text: 'Because nature has been shown to be simple', isCorrect: false },
          { id: 'c', text: 'Because simpler theories are easier to teach', isCorrect: false },
          { id: 'd', text: 'Because a simple theory is more likely to be true by definition', isCorrect: false },
        ],
        explanation: 'The razor is not a claim about how nature is built. It is about what a theory buys with its complexity: parts added to fit the data you already have are fitted to your errors too, and they carry that error into every new case.',
      },
    },
    {
      type: 'question',
      prompt: 'Can a theory be too simple?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Yes — a theory that misses real structure is wrong, not economical', isCorrect: true },
          { id: 'b', text: 'No, the simplest account is always the best one', isCorrect: false },
          { id: 'c', text: 'No, simplicity and truth are the same thing', isCorrect: false },
          { id: 'd', text: 'Yes, but only for theories nobody has tested', isCorrect: false },
        ],
        explanation: 'The razor cuts between accounts that fit EQUALLY WELL. A straight line through genuinely curved data is not admirably simple, it is false — which is why the rule ends "but not simpler".',
      },
    },
    {
      type: 'summary',
      title: 'As Simple As Possible',
      keyPoints: [
        'Any data can be fitted exactly by a complicated enough theory',
        'Extra parts fit the noise as well as the signal',
        'The razor chooses between equally good fits',
        'Too simple is a failure too, not a virtue',
      ],
      closingThought: 'Ask of any explanation: how much of this is doing work, and how much is here to cover one awkward fact?',
    },
  ],
};

export default lesson;

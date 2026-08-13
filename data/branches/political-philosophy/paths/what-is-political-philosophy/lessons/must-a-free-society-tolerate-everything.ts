import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'political-political-33',
  slug: 'must-a-free-society-tolerate-everything',
  title: 'Must a Free Society Tolerate Everything?',
  description: 'Tolerate the intolerant and they end tolerance. Refuse and you have already ended it.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Unlimited tolerance destroys tolerance.',
      subtext: 'And limited tolerance is not unlimited. Now what?',
      emoji: '🕊️',
    },
    {
      type: 'concept',
      title: 'The Paradox of Tolerance',
      body: 'Karl Popper set it out in 1945. A society that tolerates every movement, including those committed to ending toleration, hands them the means to win. But a society that suppresses movements it dislikes has stopped being tolerant in order to stay tolerant.',
      visual: '⚖️',
      highlight: 'Both horns hurt',
    },
    {
      type: 'example',
      title: "Popper's Own Answer Is Narrower Than Its Reputation",
      scenario: 'Popper did not say suppress the intolerant. He said meet them with argument and public opinion for as long as that works, and claim the right to suppress only when they refuse argument altogether and answer with fists.',
      source: 'Popper, The Open Society and Its Enemies (1945)',
    },
    {
      type: 'quote',
      id: 'lq-political-political-33',
      quote: 'We should claim the right to suppress them if necessary even by force; for it may easily turn out that they are not prepared to meet us on the level of rational argument.',
      author: 'Karl Popper',
      era: '1945',
    },
    {
      type: 'question',
      prompt: 'What does Popper actually recommend against intolerant movements?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Argument first, and force only once they have refused argument', isCorrect: true },
          { id: 'b', text: 'Immediate suppression of any intolerant doctrine', isCorrect: false },
          { id: 'c', text: 'Unlimited tolerance, whatever the consequences', isCorrect: false },
          { id: 'd', text: 'Leaving the question to majority vote', isCorrect: false },
        ],
        explanation: 'The paradox is usually quoted as a licence to ban things, and Popper is far more cautious than his reputation. The trigger is not the content of a doctrine but a refusal to argue at all — which is a much harder test to meet.',
      },
    },
    {
      type: 'question',
      prompt: 'Why is "we only suppress the intolerant" a dangerous rule in practice?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Whoever applies it decides who counts as intolerant', isCorrect: true },
          { id: 'b', text: 'Because intolerant movements are always harmless', isCorrect: false },
          { id: 'c', text: 'Because tolerance has no value worth protecting', isCorrect: false },
          { id: 'd', text: 'Because suppression never works at all', isCorrect: false },
        ],
        explanation: 'The rule sounds self-limiting and is not, because it hands someone the power to apply the label. Every government that has ever silenced an opposition has described it as a threat to the order it was protecting.',
      },
    },
    {
      type: 'summary',
      title: 'Where To Draw It',
      keyPoints: [
        'Unlimited tolerance can be used to end tolerance',
        'Limited tolerance has already conceded the principle',
        'Popper: argument first, force only against those refusing it',
        'Whoever draws the line also decides who is on which side',
      ],
      closingThought: 'The hard part was never agreeing there is a line. It is that someone has to hold the pen.',
    },
  ],
};

export default lesson;

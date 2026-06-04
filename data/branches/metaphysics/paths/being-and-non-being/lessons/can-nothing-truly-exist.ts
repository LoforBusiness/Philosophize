import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'metaphysics-being-4',
  slug: 'can-nothing-truly-exist',
  title: 'Can Nothing Truly Exist?',
  description: 'The moment you talk about nothing, you turn it into something. This paradox goes back to ancient Greece.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Saying "nothing exists" may already say too much.',
      subtext: 'Parmenides spotted this problem about 2,500 years ago, and it still holds up.',
      emoji: '🤯',
    },
    {
      type: 'concept',
      title: 'A Self-Defeating Paradox',
      body: 'Try to say that nothing exists. You\'ve made a statement, and a statement is something. You\'ve had a thought, and a thought is something. You\'ve used the word "nothing," and a word is something. Just by talking or thinking about nothing, you seem to turn it into a thing. That\'s the paradox.',
      visual: '♾️',
      highlight: 'self-defeating paradox',
    },
    {
      type: 'example',
      title: 'Parmenides: Non-Being Cannot Be',
      scenario: 'Around 475 BCE, the Greek thinker Parmenides argued: Being is, and Non-Being is not. You can\'t think about what doesn\'t exist, because a thought needs an object. You can\'t talk about it either, because words need something to refer to. So non-being can\'t be thought or spoken. Only Being exists, and change is just an illusion.',
      source: 'Parmenides, On Nature (c. 475 BCE)',
      emoji: '🏺',
    },
    {
      type: 'concept',
      title: 'What His Argument Implies',
      body: 'If Parmenides is right, change is impossible, because change means moving from being to non-being. Birth, death, and even motion would all be illusions. It sounds strange, but the logic is hard to escape. Thinkers struggled with it for centuries, until Aristotle showed that "being" and "not-being" have several different meanings.',
      visual: '⚡',
      highlight: 'change is impossible',
    },
    {
      type: 'question',
      prompt: 'Why did Parmenides claim that non-being cannot exist?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Scientists had proven empty space is full', isCorrect: false },
          { id: 'b', text: 'To think or speak of non-being is to make it something', isCorrect: true },
          { id: 'c', text: 'Nothingness is too small to measure', isCorrect: false },
          { id: 'd', text: 'God filled creation, leaving no room for nothing', isCorrect: false },
        ],
        explanation: 'Parmenides held that thought and language always need an object. You can\'t think about non-being without making it the object of a thought, which turns it into a something.',
      },
    },
    {
      type: 'question',
      prompt: 'According to Parmenides, change and movement are impossible.',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: true,
        explanation: 'Change means moving between being and non-being. Since non-being can\'t exist, there is nowhere for things to go, so change must be an illusion. Zeno\'s famous paradoxes were meant to defend this idea.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'Earlier we saw that nothing is hard to even imagine.',
      body: 'Parmenides turns that difficulty into an argument: we can\'t picture nothing, or even refer to it, without contradiction. It is one of philosophy\'s oldest arguments and still matters today. Logicians continue to work on how to talk about non-existence without running into paradoxes.',
      emoji: '🔗',
    },
    {
      type: 'summary',
      title: 'The Trap of Non-Being',
      keyPoints: [
        'Referring to nothing seems to make it something',
        'Parmenides: non-being can\'t be thought or said',
        'His logic implies change itself is impossible',
        'Aristotle later separated the meanings of being',
      ],
      closingThought: 'Nothing is one of the trickiest ideas in philosophy, even though it seems so simple.',
    },
  ],
};

export default lesson;

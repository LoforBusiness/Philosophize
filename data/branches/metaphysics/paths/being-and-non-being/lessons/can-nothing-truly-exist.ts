import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'metaphysics-being-4',
  slug: 'can-nothing-truly-exist',
  title: 'Can Nothing Truly Exist?',
  description: 'Speak of nothing and you smuggle in a something. Parmenides caught this trap 2,500 years ago, and it still bites.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Say "nothing exists" and you have already said too much.',
      subtext: 'Parmenides found this snag 2,500 years ago. Nobody has fully shaken it loose.',
      emoji: '🤯',
    },
    {
      type: 'concept',
      title: 'A Self-Defeating Paradox',
      body: 'Try it. Claim that nothing exists. You just made a statement, and a statement is something. You just had a thought, and a thought is something. You reached for the word "nothing," and a word is something. The instant you grab at nothing, it shape-shifts into a thing. That twist is the paradox.',
      visual: '♾️',
      highlight: 'self-defeating paradox',
    },
    {
      type: 'example',
      title: 'Parmenides: Non-Being Cannot Be',
      scenario: 'Around 475 BCE in southern Italy, Parmenides founded the Eleatic school and laid down a stark rule: Being is; Non-Being is not. A thought needs an object, and a word needs a referent. Non-being supplies neither, so it cannot be thought or named. Only Being is real. Change? A mere trick of the senses.',
      source: 'Parmenides, On Nature (c. 475 BCE)',
      emoji: '🏺',
    },
    {
      type: 'concept',
      title: 'What His Argument Implies',
      body: 'Follow it and the world freezes. Change means sliding from being into non-being, but non-being is off-limits. So birth, death, and motion all dissolve into illusion. Heraclitus had said everything flows; Parmenides fires back that nothing moves at all. The knot held for centuries, until Aristotle showed that "being" is said in many ways.',
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
          { id: 'b', text: 'To think or speak of non-being is to make it a something', isCorrect: true },
          { id: 'c', text: 'Nothingness is too small to measure', isCorrect: false },
          { id: 'd', text: 'The gods filled creation, leaving no room for nothing', isCorrect: false },
        ],
        explanation: 'For Parmenides, every thought and every word needs an object. Try to think non-being and you make it the object of a thought, which quietly converts it into a something.',
      },
    },
    {
      type: 'question',
      prompt: 'According to Parmenides, change and movement are impossible.',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: true,
        explanation: 'Change means crossing between being and non-being. Since non-being is barred, there is nowhere for anything to go, so motion must be an illusion. His follower Zeno built his famous paradoxes to defend exactly this.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'Nothing slips through every net you throw at it.',
      body: 'Parmenides turns that slipperiness into a weapon: we cannot picture nothing, or even point at it, without contradicting ourselves. It is one of philosophy\'s oldest arguments and still has teeth. Logicians keep wrestling with how to talk about non-existence without tumbling back into the trap.',
      emoji: '🔗',
    },
    {
      type: 'summary',
      title: 'The Trap of Non-Being',
      keyPoints: [
        'Naming nothing seems to turn it into something',
        'Parmenides: non-being cannot be thought or said',
        'His logic implies change itself is illusion',
        'Aristotle later split "being" into many senses',
      ],
      closingThought: 'Nothing looks like the simplest idea going, yet it stays one of philosophy\'s slipperiest.',
    },
  ],
};

export default lesson;

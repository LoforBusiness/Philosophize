import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'metaphysics-being-4',
  slug: 'can-nothing-truly-exist',
  title: 'Can Nothing Truly Exist?',
  description: 'Speak of nothing and you smuggle in a something. Parmenides caught this trap in the early 5th century BCE, and it still bites.',
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
      body: 'Try to deny non-being. The moment you think of nothing, you make it the object of a thought, and a thought needs something to be about. Name it, and a name needs a referent. Each time you grab at nothing, it shape-shifts into a thing. That semantic twist is the paradox.',
      visual: '♾️',
      highlight: 'self-defeating paradox',
    },
    {
      type: 'example',
      title: 'Parmenides: Non-Being Cannot Be',
      scenario: 'In the early 5th century BCE at Elea in southern Italy, Parmenides set out "two ways" of inquiry: that it is, and that it is not. He rejects the second, since what-is-not can be neither known nor spoken of. A thought needs an object; non-being supplies none. So only what-is is real, and change is a trick of the senses.',
      source: 'Parmenides, fragments of his poem (early 5th c. BCE)',
      emoji: '🏺',
    },
    {
      type: 'concept',
      title: 'What His Argument Implies',
      body: 'Follow it and the world freezes. Change would mean passing into or out of non-being, but that path is barred. So birth, death, and motion dissolve into illusion. Where Heraclitus said everything flows, the Eleatics insist nothing truly moves. The knot held for centuries, until Aristotle loosened it by showing that "being" is said in many ways.',
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
        explanation: 'For Parmenides, every thought and word needs an object. The way of "it is not" fails because what-is-not can be neither known nor said: try to think it and you make it the object of a thought, quietly converting it into a something.',
      },
    },
    {
      type: 'question',
      prompt: 'According to Parmenides, change and movement are impossible.',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: true,
        explanation: 'Change would mean crossing between being and non-being. Since non-being is barred, there is nowhere for anything to go, so motion must be an illusion. His pupil Zeno built his paradoxes of motion to defend exactly this Eleatic conclusion.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'Nothing slips through every net you throw at it.',
      body: 'Parmenides turns that slipperiness into a weapon: we cannot picture nothing, or even point at it, without contradicting ourselves. The puzzle still has teeth. Russell called it a paradox; Carnap replied that "nothing" is a quantifier, not a name, so the trap may be a trick of grammar.',
      emoji: '🔗',
    },
    {
      type: 'summary',
      title: 'The Trap of Non-Being',
      keyPoints: [
        'Naming nothing seems to turn it into something',
        'Parmenides: what-is-not cannot be thought or said',
        'His logic implies change itself is illusion',
        'Aristotle later split "being" into many senses',
      ],
      closingThought: 'Nothing looks like the simplest idea going, yet it stays one of philosophy\'s slipperiest.',
    },
  ],
};

export default lesson;

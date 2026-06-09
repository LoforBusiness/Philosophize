import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'metaphysics-being-4',
  slug: 'can-nothing-truly-exist',
  title: 'Can Nothing Truly Exist?',
  description: 'Speak of nothing and you smuggle in a something. Parmenides caught the trap.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Say "nothing exists" and you have said too much.',
      subtext: 'Parmenides found this snag 2,500 years ago. It still bites.',
      emoji: '🤯',
    },
    {
      type: 'concept',
      title: 'A Self-Defeating Paradox',
      body: 'Try to deny non-being. The moment you think of nothing, you make it the object of a thought — and a thought needs something to be about. Each grab at nothing turns it into a thing.',
      visual: '♾️',
      highlight: 'self-defeating paradox',
    },
    {
      type: 'example',
      title: 'Parmenides: Non-Being Cannot Be',
      scenario: 'At Elea he set out two ways: that it is, and that it is not. He rejects the second — what-is-not can be neither known nor spoken. So only what-is is real, and change is a trick of the senses.',
      source: 'Parmenides, On Nature (early 5th c. BCE)',
      emoji: '🏺',
    },
    {
      type: 'quote',
      id: 'lq-metaphysics-being-4-1',
      quote: 'You cannot know what is not — that is impossible — nor utter it.',
      author: 'Parmenides',
      era: 'c. 475 BCE',
      work: 'On Nature, fragment 2',
    },
    {
      type: 'concept',
      title: 'What His Argument Implies',
      body: 'Follow it and the world freezes. Change would mean passing into or out of non-being — but that path is barred. So motion dissolves into illusion. Aristotle later loosened the knot.',
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
        explanation: 'Every thought and word needs an object. "It is not" fails because what-is-not can be neither known nor said: try to think it, and you quietly convert it into a something.',
      },
    },
    {
      type: 'question',
      prompt: 'Physics talks about vacuums and empty space. Doesn\'t that prove "nothing" really exists?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Yes — a vacuum is a region of pure nothingness', isCorrect: false },
          { id: 'b', text: 'Yes — empty space is the "nothing" Parmenides denied', isCorrect: false },
          { id: 'c', text: 'No — a vacuum is still a something: a region with properties, not pure non-being', isCorrect: true },
          { id: 'd', text: 'No — because vacuums are impossible to create', isCorrect: false },
        ],
        explanation: 'A vacuum is empty space — still a something with dimensions and quantum fields. Parmenides\' "nothing" is the total absence of any thing, which a vacuum never delivers.',
      },
    },
    {
      type: 'summary',
      title: 'The Trap of Non-Being',
      keyPoints: [
        'Naming nothing seems to make it something',
        'Parmenides: what-is-not cannot be thought',
        'His logic implies change is illusion',
        'Aristotle split "being" into many senses',
      ],
      closingThought: 'Nothing looks like the simplest idea going, yet it stays one of philosophy\'s slipperiest.',
    },
  ],
};

export default lesson;

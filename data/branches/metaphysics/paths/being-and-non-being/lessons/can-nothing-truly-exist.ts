import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'metaphysics-being-4',
  slug: 'can-nothing-truly-exist',
  title: 'Can Nothing Truly Exist?',
  description: 'The moment you talk about nothing, you make it something — a paradox that puzzled ancient Greece.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Say "nothing exists" and you\'ve already said too much.',
      subtext: 'Parmenides spotted this trap 2,500 years ago.',
      emoji: '🤯',
    },
    {
      type: 'concept',
      title: 'The Self-Defeating Paradox',
      body: 'Try to assert that nothing exists. You just made a statement — which is something. You thought about nothing — thought is something. You used the word "nothing" — a word is something. Any attempt to talk about, think about, or point to nothingness immediately converts it into a subject of discussion. Nothing, the moment we engage with it, becomes something.',
      visual: '♾️',
      highlight: 'self-defeating paradox',
    },
    {
      type: 'example',
      title: 'Parmenides: Non-Being Cannot Be',
      scenario: 'Around 475 BCE, Parmenides of Elea argued that Being is, and Non-Being is not — and that\'s final. You cannot think of what does not exist, because thinking requires an object. You cannot speak of non-being, because speaking requires something to speak about. Therefore, non-being is literally unthinkable and unspeakable. Only Being exists; change and emptiness are illusions.',
      source: 'Parmenides, On Nature (c. 475 BCE)',
      emoji: '🏺',
    },
    {
      type: 'concept',
      title: 'What Parmenides\' Argument Implies',
      body: 'If Parmenides is right, change is impossible — because change requires something to move from being to non-being (or vice versa). Birth, death, movement — all illusions. This sounds absurd, yet the logical argument is airtight. Philosophers spent centuries wrestling with it. Aristotle eventually countered by distinguishing different senses of "being" and "not-being."',
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
          { id: 'a', text: 'Scientists proved empty space is full', isCorrect: false },
          { id: 'b', text: 'Thinking or speaking of non-being makes it something', isCorrect: true },
          { id: 'c', text: 'Nothingness is too small to measure', isCorrect: false },
          { id: 'd', text: 'God created everything, leaving no room for nothing', isCorrect: false },
        ],
        explanation: 'Parmenides argued that thought and language require objects. You cannot think of non-being without making it an object of thought — which means it becomes something, not nothing.',
      },
    },
    {
      type: 'question',
      prompt: 'According to Parmenides, change and movement are impossible.',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: true,
        explanation: 'Parmenides reasoned that change requires transition between being and non-being. Since non-being cannot exist, there is nowhere for things to go — so change is an illusion. (Zeno\'s paradoxes defended this same view.)',
      },
    },
    {
      type: 'reinforcement',
      callout: 'Recall that nothingness may be inconceivable.',
      body: 'Parmenides gives that intuition a formal argument. Not only can we not picture nothing — we can\'t logically refer to it either. This is one of the oldest philosophical arguments still actively debated. Modern logicians and metaphysicians still work on how to talk about non-existence without contradiction.',
      emoji: '🔗',
    },
    {
      type: 'summary',
      title: 'The Trap of Non-Being',
      keyPoints: [
        'Referring to nothing immediately makes it something',
        'Parmenides: non-being is unthinkable and unspeakable',
        'His argument implies change itself is impossible',
        'Aristotle later distinguished multiple senses of being',
      ],
      closingThought: 'Nothing might be the most dangerous idea in philosophy.',
    },
  ],
};

export default lesson;

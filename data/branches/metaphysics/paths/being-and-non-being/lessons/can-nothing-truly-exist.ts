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
      headline: 'Say "nothing exists" and you have already said too much.',
      subtext: 'Parmenides set this trap twenty-five centuries ago, and we are still caught in it.',
      emoji: '🤯',
    },
    {
      type: 'concept',
      title: 'The Self-Defeating Paradox',
      body: 'Try to declare that nothing exists. You have made a statement — and a statement is something. You have held a thought — and thought is something. You have spoken the word "nothing" — and a word is something. To name or even gesture toward nothingness is to hand it a seat at the table. The moment we engage it, nothing becomes something.',
      visual: '♾️',
      highlight: 'self-defeating paradox',
    },
    {
      type: 'example',
      title: 'Parmenides: Non-Being Cannot Be',
      scenario: 'Around 475 BCE, Parmenides of Elea drew a line in the sand: Being is, Non-Being is not, and there the matter ends. You cannot think what does not exist, since thought needs an object. You cannot speak of non-being, since speech needs a subject. Non-being is therefore literally unthinkable and unsayable. Only Being is; change and emptiness are illusions.',
      source: 'Parmenides, On Nature (c. 475 BCE)',
      emoji: '🏺',
    },
    {
      type: 'concept',
      title: 'What His Argument Implies',
      body: 'If Parmenides is right, change itself becomes impossible, for change means crossing between being and non-being. Birth, death, the simplest motion — all illusions. It sounds absurd, yet the logic grips like a vise. Thinkers wrestled with it for centuries until Aristotle loosened its hold by teasing apart the many senses of "being" and "not-being."',
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
        explanation: 'Thought and language, Parmenides held, always reach for an object. You cannot think of non-being without making it an object of thought — and so it turns into a something, never a nothing.',
      },
    },
    {
      type: 'question',
      prompt: 'According to Parmenides, change and movement are impossible.',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: true,
        explanation: 'Change demands passage between being and non-being. Since non-being cannot be, there is nowhere for things to travel, so change must be an illusion. Zeno\'s famous paradoxes were built to defend this very claim.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'Recall how nothingness slipped past every attempt to imagine it.',
      body: 'Parmenides hardens that hunch into a proof. We cannot picture nothing, nor even refer to it without contradiction. It is among philosophy\'s oldest arguments and still very much alive — logicians today still labour over how to speak of non-existence without tripping into paradox.',
      emoji: '🔗',
    },
    {
      type: 'summary',
      title: 'The Trap of Non-Being',
      keyPoints: [
        'To refer to nothing is to make it something',
        'Parmenides: non-being is unthinkable and unsayable',
        'His logic implies change itself is impossible',
        'Aristotle later teased apart the senses of being',
      ],
      closingThought: 'Nothing may be the most dangerous idea philosophy has ever handled.',
    },
  ],
};

export default lesson;

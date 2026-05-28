import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'political-political-5',
  slug: 'big-questions-of-society',
  title: 'The Big Questions of Society',
  description: 'Meet the enduring questions political philosophers have wrestled with for centuries.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'What do we owe each other as members of society?',
      subtext: 'Plato asked it 2,400 years ago. We\'re still answering.',
      emoji: '🏛️',
    },
    {
      type: 'concept',
      title: 'Plato\'s Ideal State',
      body: 'In The Republic, Plato asked: what is the perfectly just society? His answer was controversial — a city ruled by philosopher-kings, people wise enough to know what is truly good. Society should be organised by merit and function, not birth or wealth. Justice, Plato argued, is each part of society doing its proper role.',
      visual: '🏛️',
      highlight: 'just society',
    },
    {
      type: 'example',
      title: 'Plato\'s Three Classes',
      scenario: 'Plato divided his ideal city into three classes: rulers (philosopher-kings who govern), guardians (soldiers who defend), and producers (farmers, artisans, merchants who sustain). He compared this to the soul\'s three parts: reason, spirit, and appetite. Justice in the city — and in the person — meant harmony between these parts, each fulfilling its role.',
      source: 'Plato, The Republic (~375 BCE)',
      emoji: '🧠',
    },
    {
      type: 'concept',
      title: 'Rawls\' Veil of Ignorance',
      body: 'John Rawls asked: what rules would you choose for society if you didn\'t know your place in it? Imagine a "veil of ignorance" — you don\'t know whether you\'ll be rich or poor, healthy or sick, majority or minority. Rawls argued that behind this veil, rational people would choose a society that protects the worst-off, because they might be among them.',
      visual: '🎭',
      highlight: 'veil of ignorance',
    },
    {
      type: 'question',
      prompt: 'What is the purpose of Rawls\' "veil of ignorance" thought experiment?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'To show that justice is impossible to define', isCorrect: false },
          { id: 'b', text: 'To design fair principles without knowing your place in society', isCorrect: true },
          { id: 'c', text: 'To argue that society should be equal in every way', isCorrect: false },
          { id: 'd', text: 'To prove that the wealthy deserve their advantages', isCorrect: false },
        ],
        explanation: 'The veil of ignorance removes self-interest from the equation. By not knowing your social position, you are forced to reason fairly — choosing rules that could apply to anyone, including the least advantaged.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'You\'ve now seen how the big questions connect.',
      body: 'Hobbes asked why we have society at all. Locke and Rousseau asked what makes it legitimate. Mill asked how much it can constrain you. Plato and Rawls ask what a just society looks like. These aren\'t separate debates — they\'re one long conversation about how human beings should live together.',
      emoji: '🔗',
    },
    {
      type: 'question',
      prompt: 'According to Plato, what is justice in a society?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Equal distribution of wealth and resources to all citizens', isCorrect: false },
          { id: 'b', text: 'Freedom from government interference in private life', isCorrect: false },
          { id: 'c', text: 'Each part of society fulfilling its proper role in harmony', isCorrect: true },
          { id: 'd', text: 'A majority vote deciding what is right for everyone', isCorrect: false },
        ],
        explanation: 'Plato defined justice as harmony — each class and each part of the soul doing its appropriate job. A just city is like a well-functioning organism where every part serves the whole.',
      },
    },
    {
      type: 'summary',
      title: 'The Enduring Questions',
      keyPoints: [
        'Plato: justice means each part of society doing its proper role',
        'Rawls: fair rules are ones you\'d choose without knowing your position',
        'Political philosophy asks what we owe each other',
        'These questions shape every political debate today',
      ],
      closingThought: 'Political philosophy isn\'t just history — it\'s the operating system of every society.',
    },
  ],
};

export default lesson;

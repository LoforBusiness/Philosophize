import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'political-political-5',
  slug: 'big-questions-of-society',
  title: 'The Big Questions of Society',
  description: 'Meet the lasting questions political philosophers have debated for centuries.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'What do we owe each other as members of society?',
      subtext: 'Plato asked it 2,400 years ago. We still debate it.',
      emoji: '🏛️',
    },
    {
      type: 'concept',
      title: 'Plato\'s Ideal State',
      body: 'In The Republic, Plato asked what a perfectly just society would look like. His answer: a city led by philosopher-kings, rulers wise enough to know what is truly good. People would have roles based on merit and ability, not birth or wealth. For Plato, justice means each part doing its proper job.',
      visual: '🏛️',
      highlight: 'just society',
    },
    {
      type: 'example',
      title: 'Plato\'s Three Classes',
      scenario: 'Plato divided his ideal city into three groups: rulers (philosopher-kings who govern), guardians (soldiers who defend), and producers (farmers, workers, and merchants who supply goods). He compared this to three parts of the soul: reason, spirit, and appetite. Justice, in both the city and the person, meant each part doing its own job well.',
      source: 'Plato, The Republic (~375 BCE)',
      emoji: '🧠',
    },
    {
      type: 'concept',
      title: 'Rawls\' Veil of Ignorance',
      body: 'John Rawls asked what rules you would choose for society if you did not know your own place in it. Imagine a "veil of ignorance": you do not know if you will be rich or poor, healthy or sick. Behind it, Rawls argued, reasonable people protect the worst-off, because they might end up there.',
      visual: '🎭',
      highlight: 'veil of ignorance',
    },
    {
      type: 'question',
      prompt: 'What is the point of Rawls\' "veil of ignorance" thought experiment?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'To show that justice can never be defined', isCorrect: false },
          { id: 'b', text: 'To design fair rules without knowing your own place', isCorrect: true },
          { id: 'c', text: 'To argue that society must be equal in all things', isCorrect: false },
          { id: 'd', text: 'To prove the wealthy have earned every advantage', isCorrect: false },
        ],
        explanation: 'The veil of ignorance removes self-interest from your reasoning. Not knowing your own position, you have to choose rules that are fair for anyone, including the least advantaged.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'Notice how these big questions connect.',
      body: 'Hobbes asked why we form societies. Locke and Rousseau asked what makes them legitimate. Mill asked how far they can limit you. Plato and Rawls asked what justice looks like. These are not separate debates but one long conversation about how people should live together.',
      emoji: '🔗',
    },
    {
      type: 'question',
      prompt: 'For Plato, what does justice in a society actually mean?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Dividing wealth and resources equally among all citizens', isCorrect: false },
          { id: 'b', text: 'Freedom from government interference in private life', isCorrect: false },
          { id: 'c', text: 'Each part of society doing its proper job in harmony', isCorrect: true },
          { id: 'd', text: 'A majority vote deciding what is right for everyone', isCorrect: false },
        ],
        explanation: 'Plato saw justice as harmony: each class, and each part of the soul, doing its proper job. A just city is like a healthy body, where every part serves the whole.',
      },
    },
    {
      type: 'summary',
      title: 'The Lasting Questions',
      keyPoints: [
        'Plato: justice is each part doing its proper job',
        'Rawls: fair rules are ones you\'d pick while blind',
        'Political philosophy asks what we owe each other',
        'These questions still shape political debate today',
      ],
      closingThought: 'Political philosophy is not just history; it shapes society today.',
    },
  ],
};

export default lesson;

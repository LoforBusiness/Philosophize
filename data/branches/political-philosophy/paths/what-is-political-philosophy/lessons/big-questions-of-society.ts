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
      headline: 'What do we truly owe one another as members of society?',
      subtext: 'Plato asked it 2,400 years ago. We answer it still.',
      emoji: '🏛️',
    },
    {
      type: 'concept',
      title: 'Plato\'s Ideal State',
      body: 'In The Republic, Plato asked what a perfectly just society might be. His answer still provokes: a city led by philosopher-kings, souls wise enough to grasp the truly good. Let society be ordered by merit and calling, never by birth or wealth. Justice, Plato held, is each part playing its proper part.',
      visual: '🏛️',
      highlight: 'just society',
    },
    {
      type: 'example',
      title: 'Plato\'s Three Classes',
      scenario: 'Plato carved his ideal city into three orders: rulers (philosopher-kings who govern), guardians (soldiers who defend), and producers (farmers, artisans, merchants who sustain). He mirrored this in the soul\'s three parts — reason, spirit, appetite. Justice, in the city as in the self, was harmony among these parts, each content to fulfil its own role.',
      source: 'Plato, The Republic (~375 BCE)',
      emoji: '🧠',
    },
    {
      type: 'concept',
      title: 'Rawls\' Veil of Ignorance',
      body: 'John Rawls asked what rules you would choose for society if you knew nothing of your own place in it. Imagine a "veil of ignorance": you cannot tell whether you will be rich or poor, well or ailing, many or few. Behind it, Rawls argued, reasonable people protect the worst-off — for they might be them.',
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
          { id: 'a', text: 'To show that justice can never truly be defined', isCorrect: false },
          { id: 'b', text: 'To craft fair rules while blind to your own place', isCorrect: true },
          { id: 'c', text: 'To argue society must be made equal in all things', isCorrect: false },
          { id: 'd', text: 'To prove the wealthy have earned every advantage', isCorrect: false },
        ],
        explanation: 'The veil of ignorance strips self-interest from your reasoning. Blind to your own station, you are compelled to choose fairly — rules fit for anyone at all, the least advantaged included.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'See now how the great questions are woven together.',
      body: 'Hobbes asked why we gather into society. Locke and Rousseau asked what makes it legitimate. Mill asked how far it may bind you. Plato and Rawls ask what justice would look like. These are not scattered debates but one long conversation about how human beings ought to live together.',
      emoji: '🔗',
    },
    {
      type: 'question',
      prompt: 'For Plato, what does justice in a society actually mean?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Splitting wealth and resources equally among all citizens', isCorrect: false },
          { id: 'b', text: 'Freedom from government meddling in private life', isCorrect: false },
          { id: 'c', text: 'Each part of society fulfilling its proper role in harmony', isCorrect: true },
          { id: 'd', text: 'A majority vote deciding what is right for all', isCorrect: false },
        ],
        explanation: 'Plato cast justice as harmony — each class, and each part of the soul, attending to its rightful work. A just city is like a healthy body, where every part serves the whole.',
      },
    },
    {
      type: 'summary',
      title: 'The Enduring Questions',
      keyPoints: [
        'Plato: justice is each part playing its proper role',
        'Rawls: fair rules are those you\'d choose while blind',
        'Political philosophy asks what we owe one another',
        'These questions still shape every political debate today',
      ],
      closingThought: 'Political philosophy is no relic — it is the quiet code of every society.',
    },
  ],
};

export default lesson;

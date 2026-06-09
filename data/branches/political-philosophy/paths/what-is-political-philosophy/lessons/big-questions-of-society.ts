import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'political-political-5',
  slug: 'big-questions-of-society',
  title: 'The Big Questions of Society',
  description: 'The oldest argument alive: what does justice demand?',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'What makes a whole society just?',
      subtext: 'Plato asked it ~2,400 years ago. We are still arguing.',
      emoji: '🏛️',
    },
    {
      type: 'concept',
      title: 'Plato\'s Just City',
      body: 'In the Republic, Plato asks what a perfectly just city looks like. His answer: justice is each part doing its own work and not meddling. Rule goes to philosopher-kings, who alone know the good.',
      visual: '🏛️',
      highlight: 'doing its own work',
    },
    {
      type: 'quote',
      id: 'lq-political-political-5-1',
      quote: 'Man is by nature a political animal.',
      author: 'Aristotle',
      era: 'c. 350 BCE',
      work: 'Politics',
    },
    {
      type: 'concept',
      title: 'Rawls\' Veil of Ignorance',
      body: 'Rawls asks: what rules would you pick if you did not know who you would be? Behind a "veil of ignorance," your class, talents, and luck are hidden. Stripped of bias, people choose fair terms.',
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
          { id: 'a', text: 'To prove justice can never be pinned down at all', isCorrect: false },
          { id: 'b', text: 'To model fair rules by hiding who you happen to be', isCorrect: true },
          { id: 'c', text: 'To insist society must be identical in every way', isCorrect: false },
          { id: 'd', text: 'To show the wealthy have earned every advantage', isCorrect: false },
        ],
        explanation: 'The veil removes facts about your race, class, and talents, so your chosen principles stay impartial: equal liberties, plus inequalities allowed only if they help the least advantaged.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'Watch the big questions link up.',
      body: 'Hobbes asks why we build societies. Locke and Rousseau ask what makes them legitimate. Mill asks how far they may bind you. Plato and Rawls ask what justice demands.',
      emoji: '🔗',
    },
    {
      type: 'question',
      prompt: 'Plato\'s just city sounds fair, so surely "justice" for him meant splitting wealth equally among citizens. Right?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Yes, Plato demanded equal wealth for everyone', isCorrect: false },
          { id: 'b', text: 'No, justice is each part doing its proper job in harmony', isCorrect: true },
          { id: 'c', text: 'Yes, Plato wanted a majority vote to share resources', isCorrect: false },
          { id: 'd', text: 'No, Plato meant total freedom from any government', isCorrect: false },
        ],
        explanation: 'The trap: "fair" tempts us toward equal wealth. But for Plato justice is harmony, each class doing its own work, not equal shares or majority rule.',
      },
    },
    {
      type: 'summary',
      title: 'The Lasting Questions',
      keyPoints: [
        'Plato: justice is each part doing its work',
        'Rawls: fair rules are chosen behind the veil',
        'Rawls protects the worst-off',
        'These questions still fuel debate today',
      ],
      closingThought: 'Political philosophy is not dusty history; it shapes your world now.',
    },
  ],
};

export default lesson;

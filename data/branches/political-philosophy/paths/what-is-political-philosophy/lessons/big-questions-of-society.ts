import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'political-political-5',
  slug: 'big-questions-of-society',
  title: 'The Big Questions of Society',
  description: 'Step into the oldest argument alive: what does justice demand of a society?',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'What does it mean for a whole society to be just?',
      subtext: 'Plato asked it ~2,400 years ago. We are still arguing.',
      emoji: '🏛️',
    },
    {
      type: 'concept',
      title: 'Plato\'s Just City',
      body: 'In the Republic, Plato asks what a perfectly just city would look like. His answer: justice is each part doing its own work and not meddling. Rule goes to philosopher-kings, who alone know the good, and who rule reluctantly, by compulsion, not from ambition.',
      visual: '🏛️',
      highlight: 'doing its own work',
    },
    {
      type: 'example',
      title: 'Plato\'s Three Classes',
      scenario: 'Plato sorts his city into three classes: rulers (the philosopher-kings), auxiliaries (the soldiers who defend), and producers (farmers, craftsmen, merchants). Rulers and auxiliaries together are the "guardians." He mirrors this in the soul, reason, spirit, appetite, and calls it just when each part does its own job.',
      source: 'Plato, Republic (c. 375 BCE)',
      emoji: '🧠',
    },
    {
      type: 'concept',
      title: 'Rawls\' Veil of Ignorance',
      body: 'John Rawls asks: what rules would you pick if you did not know who you would be? Behind a "veil of ignorance," your class, talents, and luck are all hidden. Stripped of bias, Rawls argues, free and equal people would choose fair terms, including protection for the worst-off.',
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
        explanation: 'In A Theory of Justice, the veil removes facts about your race, class, and talents, things morally irrelevant to fairness, so the principles you choose are impartial: equal basic liberties, plus inequalities allowed only if they help the least advantaged (the difference principle).',
      },
    },
    {
      type: 'reinforcement',
      callout: 'Watch the big questions link up.',
      body: 'Hobbes asks why we build societies at all. Locke and Rousseau ask what makes them legitimate. Mill asks how far they may bind you. Plato and Rawls ask what justice demands. Not scattered debates, but one long, electric conversation about how humans should live together.',
      emoji: '🔗',
    },
    {
      type: 'question',
      prompt: 'For Plato, what does justice in a society actually mean?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Splitting all wealth and resources equally among citizens', isCorrect: false },
          { id: 'b', text: 'Freedom from any government meddling in private life', isCorrect: false },
          { id: 'c', text: 'Each part of society doing its proper job in harmony', isCorrect: true },
          { id: 'd', text: 'A majority vote deciding what is right for everyone', isCorrect: false },
        ],
        explanation: 'In the Republic, justice is harmony: each class, and each part of the soul, doing its own work and not meddling in another\'s. A just city runs like a healthy body, each part serving the whole, not equal wealth or majority rule.',
      },
    },
    {
      type: 'summary',
      title: 'The Lasting Questions',
      keyPoints: [
        'Plato: justice is each part doing its own work',
        'Rawls: fair rules are ones chosen behind the veil',
        'Rawls protects the worst-off via the difference principle',
        'These questions still fuel political debate today',
      ],
      closingThought: 'Political philosophy is not dusty history; it is shaping your world right now.',
    },
  ],
};

export default lesson;

import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'ethics-ethics-10',
  slug: 'ethics-in-practice',
  title: 'Ethics in Practice: From Theory to Action',
  description: 'A child drowns nearby. A child starves abroad. Are these really different?',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'You would ruin your shoes to save a drowning child.',
      subtext: 'So why not skip the coffee to save a child you will never see?',
      emoji: '🌊',
    },
    {
      type: 'concept',
      title: 'Singer’s Drowning Child',
      body: 'Peter Singer argues distance should not matter morally. If you would save a child drowning at your feet, the same logic obliges you to help dying children far away.',
      visual: '💧',
      highlight: 'the drowning child',
    },
    {
      type: 'quote',
      id: 'lq-ethics-ethics-10-1',
      quote: 'If it is in our power to prevent something bad from happening, without thereby sacrificing anything of comparable moral importance, then we ought, morally, to do it.',
      author: 'Peter Singer',
      era: '1972',
      work: 'Famine, Affluence, and Morality',
    },
    {
      type: 'example',
      title: 'Effective Altruism',
      scenario: 'Singer’s argument helped spark effective altruism: using evidence to do the most good per dollar. Followers pledge a share of income and ask coldly which charities actually save the most lives, not which feel most touching.',
      source: 'Peter Singer, The Life You Can Save (2009)',
      emoji: '📈',
    },
    {
      type: 'reinforcement',
      callout: 'Powerful, but not unanswerable.',
      body: 'Critics say Singer’s principle is too demanding. Bernard Williams argued a livable ethics must let you care specially about your own projects and people.',
      emoji: '🤔',
    },
    {
      type: 'question',
      prompt: 'What is the core of Singer’s drowning-child argument?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Physical distance does not lessen our duty to help the suffering', isCorrect: true },
          { id: 'b', text: 'You must give away every possession you own', isCorrect: false },
          { id: 'c', text: 'Only nearby strangers deserve any of your help', isCorrect: false },
          { id: 'd', text: 'Charity is purely optional and never a duty', isCorrect: false },
        ],
        explanation: 'Singer holds that if proximity makes no moral difference, the duty to rescue a child at your feet extends to distant children you could save by giving.',
      },
    },
    {
      type: 'question',
      prompt: 'Singer’s argument only works if you accept utilitarianism, so non-utilitarians can ignore it. True?',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: false,
        explanation: 'Cleverly, Singer rests on a modest premise almost anyone accepts, that preventing great harm at small cost is required, so it bites well beyond utilitarianism.',
      },
    },
    {
      type: 'summary',
      title: 'Bringing Ethics to Life',
      keyPoints: [
        'Distance need not weaken moral duty',
        'Singer demands we help the distant suffering',
        'Effective altruism asks where good goes furthest',
        'Critics: an ethics must remain livable',
      ],
      closingThought: 'Theory ends where action begins; the hard part is what you do tomorrow.',
    },
  ],
};

export default lesson;

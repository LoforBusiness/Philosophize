import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'ethics-ethics-13',
  slug: 'virtue-ethics-and-eudaimonia',
  title: 'Becoming Good, Not Just Doing Good',
  description: 'Aristotle asks not what to do, but who to become. Aim for the mean.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'What if ethics asks who to be, not what to do?',
      subtext: 'Rules and outcomes judge the act. Aristotle judges the person behind it.',
      emoji: '🌱',
    },
    {
      type: 'concept',
      title: 'A Life of Flourishing',
      body: 'Aristotle asked not which acts are right, but what kind of person to become. The goal is eudaimonia, a flourishing, well-lived life. We reach it by cultivating virtues, stable traits of good character built over time.',
      visual: '🏛️',
      highlight: 'eudaimonia',
    },
    {
      type: 'example',
      title: 'The Golden Mean',
      scenario: 'Take courage. Feel too little and you become a coward, fleeing every danger. Feel too much and you become reckless, charging into ruin. Virtue is the well-judged middle, the courage that faces the right fear at the right time. Both extremes are vices.',
      source: 'Aristotle, Nicomachean Ethics',
      emoji: '⚖️',
    },
    {
      type: 'quote',
      id: 'lq-ethics-ethics-13-1',
      quote: 'The good has rightly been declared to be that at which all things aim.',
      author: 'Aristotle',
      era: 'c. 340 BCE',
      work: 'Nicomachean Ethics',
      philosopherId: 'aristotle',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you saw consequences and duty. Here is the third lens.',
      body: 'Lessons 11 and 12 weighed outcomes and duties, judging the act. Virtue ethics, glimpsed back in the character lens, instead asks who the actor becomes. Three great approaches, now seen in depth.',
      emoji: '🔭',
    },
    {
      type: 'question',
      prompt: 'Sort the three states of courage from deficiency, through the golden mean, to excess.',
      xpValue: 5,
      interaction: {
        type: 'sort',
        items: [
          { id: 'cowardice', text: 'Cowardice: fleeing every danger' },
          { id: 'courage', text: 'Courage: facing the right fear well' },
          { id: 'recklessness', text: 'Recklessness: charging into needless ruin' },
        ],
        correctOrder: ['cowardice', 'courage', 'recklessness'],
        explanation: 'Virtue is not the maximum of a trait but the well-judged middle, relative to the situation. Cowardice feels too much fear, recklessness too little; courage sits between them. Both extremes are vices.',
      },
    },
    {
      type: 'summary',
      title: 'Character Over Conduct',
      keyPoints: [
        'Virtue ethics asks who to become',
        'Eudaimonia is a flourishing, well-lived life',
        'Each virtue is a mean between two vices',
        'Good character is built by habit',
      ],
      closingThought: 'You now hold all three great lenses: consequences, duty, and the person you are becoming.',
    },
  ],
};

export default lesson;

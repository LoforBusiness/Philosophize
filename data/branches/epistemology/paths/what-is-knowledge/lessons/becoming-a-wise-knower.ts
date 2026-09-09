import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'epistemology-knowledge-30',
  slug: 'becoming-a-wise-knower',
  title: 'Becoming A Wise Knower',
  description: 'Capstone: not what knowledge is, but the kind of mind that keeps finding it.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Thirty lessons in. The question quietly changed.',
      subtext: 'You stopped asking "what is knowledge?" and started asking "how do I know well?"',
      emoji: '🦉',
    },
    {
      type: 'reinforcement',
      callout: 'Look back at the path you walked.',
      body: 'You built the JTB recipe, then watched Gettier crack it. You faced the regress, the skeptic, the criterion. You met peer disagreement, epistemic injustice, and your own motivated reasoning. The lesson underneath them all: certainty is rare, but good knowing is a skill.',
      emoji: '🛤️',
    },
    {
      type: 'concept',
      title: 'Wisdom Over Information',
      body: 'A wise knower is not the one who has the most facts. It is the one with good intellectual character: humble about being wrong, curious enough to keep looking, courageous enough to follow evidence, and fair enough to credit others. Wisdom is knowing how to hold what you know.',
      visual: '🧭',
      highlight: 'intellectual character',
    },
    {
      type: 'quote',
      id: 'lq-epistemology-knowledge-30-1',
      quote: 'I am wiser than this man; it is likely that neither of us knows anything worthwhile, but he thinks he knows when he does not, whereas I do not think I know.',
      author: 'Plato (Socrates speaking)',
      era: 'c. 399 BCE',
      work: 'Apology',
      philosopherId: 'plato',
    },
    {
      type: 'concept',
      title: 'Socratic Humility',
      body: 'Socrates was called the wisest man in Athens—and his wisdom was knowing how little he knew. That is not false modesty or despair. It is the working posture of a good knower: confident enough to act, humble enough to keep questioning, and never mistaking the comfort of certainty for the truth.',
      visual: '🏛️',
      highlight: 'Socratic humility',
    },
    {
      type: 'question',
      prompt: 'What made Socrates wiser than the men he questioned?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'He knew where his own knowledge stopped', isCorrect: true },
          { id: 'b', text: 'He held more facts than any of them', isCorrect: false },
          { id: 'c', text: 'He was never wrong about anything', isCorrect: false },
          { id: 'd', text: 'He refused to believe anything at all', isCorrect: false },
        ],
        explanation: 'He knew where he stopped. Socrates claims no store of answers and no immunity from error, only an accurate view of his own limits. That is a working posture rather than modesty, and it is the opposite of refusing to believe anything.',
      },
    },
    {
      type: 'question',
      prompt: 'As a knower learns more, what happens to the questions they can see?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'The edge keeps opening as they learn', isCorrect: true },
          { id: 'b', text: 'The view stays the same from start to finish', isCorrect: false },
          { id: 'c', text: 'The puzzles get used up one by one', isCorrect: false },
          { id: 'd', text: 'One confusing stretch, and then clarity', isCorrect: false },
        ],
        explanation: 'It keeps opening. Every answer brings a question that could not have been asked before, so what somebody knows they do not know grows faster than what they know. A shrinking edge would mean philosophy eventually runs out of work.',
      },
    },
    {
      type: 'summary',
      title: 'What You Now Know',
      keyPoints: [
        'Good knowing is a skill and a character',
        'Wisdom is humility, curiosity, courage, and fairness',
        'Socratic wisdom: knowing what you don’t know',
        'Hold beliefs firmly enough to act, loosely enough to learn',
      ],
      closingThought: 'You set out to define knowledge. You leave with something rarer: a better way to think. That is where wisdom begins.',
    },
  ],
};

export default lesson;

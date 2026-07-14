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
      type: 'dilemma',
      scenario:
        'You finish this path and a friend asks what philosophy of knowledge gave you. You could point to facts you can now recite—Gettier, reliabilism, contextualism. Or you could point to a changed posture: how you now treat your own certainty and other people’s words. Which is the real prize of the journey?',
      prompt: 'What did the path actually give you?',
      choices: [
        { id: 'a', label: 'A toolkit of facts and theories to recite' },
        { id: 'b', label: 'A wiser way of holding beliefs and doubts' },
        { id: 'c', label: 'Proof that real knowledge is impossible' },
      ],
      views: [
        {
          thinker: 'Virtue Epistemologist',
          stance: 'The prize is character.',
          why: 'The theories matter, but their point is to reshape the knower. What lasts is the disposition: open, humble, careful, fair. That is what keeps finding truth long after the definitions blur.',
        },
        {
          thinker: 'Socratic',
          stance: 'The prize is humble curiosity.',
          why: 'Knowing what you do not know is where inquiry begins, not where it dies. The path’s gift is a mind that keeps asking instead of settling—wisdom as an ongoing practice.',
        },
        {
          thinker: 'Pragmatist',
          stance: 'The prize is better living.',
          why: 'Knowledge is not a trophy on a shelf but a tool for acting well. Its value shows in how you decide, whom you trust, and how you handle being wrong.',
        },
      ],
      xpValue: 5,
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

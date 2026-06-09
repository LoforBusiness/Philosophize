import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'epistemology-knowledge-2',
  slug: 'knowing-vs-guessing',
  title: 'Knowing vs. Guessing',
  description: 'Knowledge looked like justified true belief. Then Gettier broke it.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Right answer, wrong reason. Do you know?',
      subtext: 'A true belief built on luck is not knowledge. So what is?',
      emoji: '🎯',
    },
    {
      type: 'concept',
      title: 'Justified True Belief',
      body: 'The classic recipe: you believe it, it is true, and you have good reasons. Two people share one true belief, but only the justified one truly knows. Luck does not count.',
      visual: '🔑',
      highlight: 'Justified True Belief',
    },
    {
      type: 'example',
      title: 'Russell\'s Stopped Clock',
      scenario: 'You glance at a clock reading 3:15 and believe it is 3:15. It is — but the clock stopped twelve hours ago. Your belief is true, yet built on a broken source. A right answer is not knowledge.',
      source: 'Bertrand Russell, "Human Knowledge: Its Scope and Limits" (1948)',
      emoji: '🕰️',
    },
    {
      type: 'quote',
      id: 'lq-epistemology-knowledge-2-1',
      quote: 'Every case of knowledge is a case of true belief, but not vice versa.',
      author: 'Bertrand Russell',
      era: '1948',
      work: 'Human Knowledge: Its Scope and Limits',
    },
    {
      type: 'concept',
      title: 'The Gettier Problem',
      body: 'In 1963, Edmund Gettier published a three-page bombshell. He built beliefs that are justified, true, yet not knowledge — because luck links the believer to the truth. The triad was not enough.',
      visual: '💥',
      highlight: 'Gettier problem',
    },
    {
      type: 'question',
      prompt: 'What did Gettier\'s 1963 paper reveal about justified true belief?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'It is not always sufficient to count as knowledge', isCorrect: true },
          { id: 'b', text: 'It can never actually be achieved in real life', isCorrect: false },
          { id: 'c', text: 'Justification has nothing to do with knowledge', isCorrect: false },
          { id: 'd', text: 'Only scientists are capable of genuine knowledge', isCorrect: false },
        ],
        explanation: 'Gettier showed all three conditions can be met while knowledge is still absent, because luck can link a belief to the truth.',
      },
    },
    {
      type: 'question',
      prompt: 'A stopped clock shows 3:15. You look at exactly 3:15 and believe it. Do you KNOW the time?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Yes — your belief is true, so it counts as knowledge', isCorrect: false },
          { id: 'b', text: 'Yes — you had a clear reason: you read a clock', isCorrect: false },
          { id: 'c', text: 'No — being right by luck off a broken source is not knowing', isCorrect: true },
          { id: 'd', text: 'No — because a true belief can never be knowledge', isCorrect: false },
        ],
        explanation: 'The belief is true, but the broken clock gives no real justification. You got lucky, and luck is not knowledge.',
      },
    },
    {
      type: 'summary',
      title: 'Why Luck Is Not Knowledge',
      keyPoints: [
        'Classic recipe: knowledge is justified true belief',
        'Justification should link belief to truth',
        'Gettier cases show the triad falls short',
        'A truth reached by luck is not knowledge',
      ],
      closingThought: 'Three pages by Gettier reopened a question philosophers thought was settled. That is the power of one sharp counterexample.',
    },
  ],
};

export default lesson;

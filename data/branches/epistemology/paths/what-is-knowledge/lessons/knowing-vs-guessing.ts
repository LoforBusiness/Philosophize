import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'epistemology-knowledge-2',
  slug: 'knowing-vs-guessing',
  title: 'Knowing vs. Guessing',
  description: 'Many texts define knowledge as justified true belief. Then a three-page paper blew it open. Meet the Gettier problem.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Right answer, wrong reason. Do you actually know?',
      subtext: 'A true belief built on luck is not knowledge. So what is?',
      emoji: '🎯',
    },
    {
      type: 'concept',
      title: 'Justified True Belief',
      body: 'Twentieth-century epistemology analyzed knowledge as Justified True Belief: you believe it, it is true, and you have good reasons. Two people can hold the same true belief, yet only the one with solid justification truly knows. Luck does not count.',
      visual: '🔑',
      highlight: 'Justified True Belief',
    },
    {
      type: 'example',
      title: 'Russell\'s Stopped Clock',
      scenario: 'Bertrand Russell\'s case: you glance at a clock reading 3:15 and believe it is 3:15. It really is — but the clock stopped exactly twelve hours ago. Your belief is true, yet you trusted a broken clock, so it was never really justified. A right answer from a bad source is not knowledge.',
      source: 'Bertrand Russell, "Human Knowledge: Its Scope and Limits" (1948)',
      emoji: '🕰️',
    },
    {
      type: 'concept',
      title: 'The Gettier Problem',
      body: 'In 1963, Edmund Gettier published a three-page bombshell. He built cases where a belief is justified, true, and still not knowledge — because luck links the believer to the truth, often through a justified but false step. Justified true belief was not sufficient.',
      visual: '💥',
      highlight: 'Gettier problem',
    },
    {
      type: 'example',
      title: 'Gettier\'s Coins',
      scenario: 'Smith has strong evidence that Jones will get the job and that Jones has ten coins in his pocket. So Smith infers: the man who gets the job has ten coins. But Smith himself gets the job — and, by chance, he too has ten coins. His belief is justified and true. Knowledge? No.',
      source: 'Edmund Gettier, "Is Justified True Belief Knowledge?", Analysis (1963)',
      emoji: '🪙',
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
        explanation: 'Gettier showed all three conditions — justified, true, belief — can be met while knowledge is still absent, because luck can link a belief to the truth through a justified yet false step.',
      },
    },
    {
      type: 'question',
      prompt: 'Does a good reason for a belief always guarantee that you genuinely know it?',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: false,
        explanation: 'Gettier cases show a good reason can land on the truth by sheer luck. Knowledge seems to demand more: your reasons must connect to the truth in the right way, not by accident.',
      },
    },
    {
      type: 'summary',
      title: 'Why Luck Is Not Knowledge',
      keyPoints: [
        'A common analysis: knowledge is justified true belief',
        'Justification should reliably link belief to truth',
        'Gettier cases show the triad is not sufficient',
        'A truth reached by luck is not knowledge',
      ],
      closingThought: 'Three pages by Gettier reopened a question philosophers thought was settled. That is the power of one sharp counterexample.',
    },
  ],
};

export default lesson;

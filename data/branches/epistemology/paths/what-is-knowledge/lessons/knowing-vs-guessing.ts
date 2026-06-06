import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'epistemology-knowledge-2',
  slug: 'knowing-vs-guessing',
  title: 'Knowing vs. Guessing',
  description: 'Plato said knowledge is justified true belief. Then a three-page paper blew it open. Meet the Gettier problem.',
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
      body: 'Since Plato\'s Theaetetus, philosophers defined knowledge as Justified True Belief: you believe it, it is true, and you have good reasons. Two people can hold the same true belief, yet only the one with solid justification truly knows. Luck does not count.',
      visual: '🔑',
      highlight: 'Justified True Belief',
    },
    {
      type: 'example',
      title: 'Russell\'s Stopped Clock',
      scenario: 'Bertrand Russell\'s puzzle: you check a clock reading 3:15 and believe it is 3:15. It really is — but the clock froze exactly twelve hours ago. Reading clocks is a fine method, so your belief is justified and true. Yet you only landed on the truth by accident. Did you know?',
      emoji: '🕰️',
    },
    {
      type: 'concept',
      title: 'The Gettier Problem',
      body: 'In 1963, Edmund Gettier dropped a three-page bombshell. He built cases where belief is justified, true, and still not knowledge — because the believer reaches the truth by luck, through faulty reasoning. JTB was not enough. Epistemologists have been patching the definition ever since.',
      visual: '💥',
      highlight: 'Gettier problem',
    },
    {
      type: 'example',
      title: 'Gettier\'s Coins',
      scenario: 'Smith has strong evidence that Jones will get the job and that Jones has ten coins in his pocket. So Smith infers: the man who gets the job has ten coins. But Smith himself gets the job — and, by chance, he too has ten coins. His belief is justified and true. Knowledge? No.',
      source: 'Edmund Gettier, "Is Justified True Belief Knowledge?" (1963)',
      emoji: '🪙',
    },
    {
      type: 'question',
      prompt: 'What did Gettier\'s 1963 paper reveal about justified true belief?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'It is not always enough to count as knowledge', isCorrect: true },
          { id: 'b', text: 'It can never actually be achieved in real life', isCorrect: false },
          { id: 'c', text: 'Justification has nothing to do with knowledge', isCorrect: false },
          { id: 'd', text: 'Only scientists are capable of genuine knowledge', isCorrect: false },
        ],
        explanation: 'Gettier showed all three conditions — justified, true, belief — can be met while knowledge is still absent, because luck can link a belief to the truth through an unreliable path.',
      },
    },
    {
      type: 'question',
      prompt: 'Does a good reason for a belief always guarantee that you genuinely know it?',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: false,
        explanation: 'Gettier cases prove a good reason can hit the truth by sheer luck. Knowledge demands more: your reasons must connect to the truth in the right way, not by accident.',
      },
    },
    {
      type: 'summary',
      title: 'Why Luck Is Not Knowledge',
      keyPoints: [
        'Plato: knowledge is justified true belief',
        'Justification must reliably link belief to truth',
        'Gettier cases break the classic definition',
        'A truth reached by luck is not knowledge',
      ],
      closingThought: 'Three pages cracked an idea older than 2,000 years. That is the power of one sharp question.',
    },
  ],
};

export default lesson;

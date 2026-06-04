import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'epistemology-knowledge-2',
  slug: 'knowing-vs-guessing',
  title: 'Knowing vs. Guessing',
  description: 'Find out why a lucky true guess still is not knowledge, and meet the puzzle that surprised philosophers.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'What if you got the right answer for the wrong reason?',
      subtext: 'A true belief built on bad reasons does not count as knowing.',
      emoji: '🎯',
    },
    {
      type: 'concept',
      title: 'Justification Is the Key',
      body: 'Two people can hold the same true belief, but only one of them really knows. The difference is justification: how good the reasons are. When the reasons are solid and reliable, belief becomes knowledge. When you only got there by luck, it does not.',
      visual: '🔑',
      highlight: 'justification',
    },
    {
      type: 'example',
      title: 'The Lucky Stopped Clock',
      scenario: 'You glance at the wall clock. It reads 3:15, so you believe it is 3:15 — and it really is. But the clock actually stopped exactly twelve hours ago. Reading a clock seems like a good method, so your belief looks justified and true. Yet most people would say you did not really know.',
      emoji: '🕰️',
    },
    {
      type: 'concept',
      title: 'The Gettier Problem',
      body: 'In 1963, Edmund Gettier published a three-page paper that challenged the old definition. He described cases where a belief is justified, true, and still not knowledge, because the person got to the truth by luck through a faulty path. Philosophers have been trying to fix the definition ever since.',
      visual: '💥',
      highlight: 'Gettier problem',
    },
    {
      type: 'example',
      title: 'Gettier\'s Own Example',
      scenario: 'Smith has good reason to believe Jones will get the job and that Jones has ten coins in his pocket. So Smith concludes: the person who gets the job has ten coins. But Smith gets the job instead, and he happens to have ten coins too. His belief is true and justified, but he did not really know it.',
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
        explanation: 'Gettier showed that all three conditions can be met while knowledge is still missing, because luck can connect a belief to the truth through an unreliable path.',
      },
    },
    {
      type: 'question',
      prompt: 'Does having a good reason for a belief always guarantee that you genuinely know it?',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: false,
        explanation: 'Gettier cases show a good reason can still reach the truth by luck. Knowledge seems to need more: the reasons have to connect to the truth in the right way, not by accident.',
      },
    },
    {
      type: 'summary',
      title: 'Why Luck Is Not Knowledge',
      keyPoints: [
        'Justification must reliably connect belief to truth',
        'Gettier cases reveal a gap in the old definition',
        'A true belief reached by luck is not knowledge',
        'Philosophers still debate a complete definition',
      ],
      closingThought: 'A three-page paper changed the field, showing how one sharp question can reopen a settled idea.',
    },
  ],
};

export default lesson;

import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'epistemology-knowledge-2',
  slug: 'knowing-vs-guessing',
  title: 'Knowing vs. Guessing',
  description: 'Discover why a lucky true guess still isn\'t knowledge, and meet the puzzle that shook epistemology.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'What if you guessed the right answer for the wrong reason?',
      subtext: 'A true belief with bad justification broke the definition of knowledge.',
      emoji: '🎯',
    },
    {
      type: 'concept',
      title: 'Justification Is the Key',
      body: 'Two people can believe the same true thing, yet only one of them knows it. The difference is justification — the quality of the reasons behind the belief. If your reasons are solid and reliable, your belief counts as knowledge. If you just got lucky, it doesn\'t.',
      visual: '🔑',
      highlight: 'justification',
    },
    {
      type: 'example',
      title: 'The Lucky Stopped Clock',
      scenario: 'Imagine you glance at a clock on the wall. It reads 3:15. You form the belief "it is 3:15." That belief is true — but the clock stopped exactly 12 hours ago. Your justification (reading a clock) seems fine, yet something has gone wrong. You have a true, justified belief that isn\'t really knowledge.',
      emoji: '🕰️',
    },
    {
      type: 'concept',
      title: 'The Gettier Problem',
      body: 'In 1963, philosopher Edmund Gettier published a three-page paper that stunned philosophy. He showed cases where someone has a justified true belief yet clearly doesn\'t know. These "Gettier cases" revealed that the classic definition — justified true belief — is incomplete. Philosophers have been searching for a fix ever since.',
      visual: '💥',
      highlight: 'Gettier problem',
    },
    {
      type: 'example',
      title: 'Gettier\'s Own Example',
      scenario: 'Smith justifiably believes Jones will get the job and that Jones has ten coins in his pocket. So Smith believes "the man who gets the job has ten coins in his pocket." But Smith gets the job — and, unknown to Smith, he also has ten coins. The belief is justified and true, yet Smith doesn\'t know it. Justified true belief can fail.',
      source: 'Edmund Gettier, "Is Justified True Belief Knowledge?" (1963)',
      emoji: '🪙',
    },
    {
      type: 'question',
      prompt: 'What did Gettier\'s 1963 paper demonstrate about justified true belief?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'It is not always sufficient for knowledge', isCorrect: true },
          { id: 'b', text: 'It is impossible to achieve in real life', isCorrect: false },
          { id: 'c', text: 'Justification is irrelevant to knowledge', isCorrect: false },
          { id: 'd', text: 'Only scientists can have genuine knowledge', isCorrect: false },
        ],
        explanation: 'Gettier showed that justified true belief is not sufficient — you can have all three components yet still lack knowledge, because luck can connect the belief to the truth in the wrong way.',
      },
    },
    {
      type: 'question',
      prompt: 'Does having a good reason for a belief always guarantee that you know it?',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: false,
        explanation: 'Gettier cases show that even a good reason can lead to a true belief through luck. Philosophers now think knowledge requires something beyond mere justified true belief — the justification must connect to the truth in the right way.',
      },
    },
    {
      type: 'summary',
      title: 'Why Luck Isn\'t Knowledge',
      keyPoints: [
        'Justification must reliably connect belief to truth',
        'Gettier cases expose a gap in the classic definition',
        'A lucky true guess is not the same as knowing',
        'Philosophy is still debating a complete definition',
      ],
      closingThought: 'One short paper changed epistemology forever — proof that a single sharp question can shake centuries of certainty.',
    },
  ],
};

export default lesson;

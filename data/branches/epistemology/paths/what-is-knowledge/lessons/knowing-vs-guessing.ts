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
      headline: 'What if you reached the right answer along entirely the wrong path?',
      subtext: 'A true belief resting on flawed reasons quietly cracked the old definition.',
      emoji: '🎯',
    },
    {
      type: 'concept',
      title: 'Justification Is the Hinge',
      body: 'Two people can hold the very same true belief, yet only one of them truly knows. Everything turns on justification — the quality of the reasons beneath the belief. When those reasons are sound and dependable, belief ripens into knowledge. When luck did the work instead, it never does.',
      visual: '🔑',
      highlight: 'justification',
    },
    {
      type: 'example',
      title: 'The Lucky Stopped Clock',
      scenario: 'You glance at the wall clock. It reads 3:15, and so you believe it is 3:15 — and it is. But the clock died exactly twelve hours ago. Your method, reading a clock, looks impeccable; still, something has quietly gone wrong. Here sits a belief both true and justified that somehow is not knowledge.',
      emoji: '🕰️',
    },
    {
      type: 'concept',
      title: 'The Gettier Problem',
      body: 'In 1963, Edmund Gettier published three short pages that unsettled philosophy. He sketched cases where a belief is justified, true, and yet plainly not knowledge. These "Gettier cases" exposed the old formula as incomplete — truth reached by luck through a faulty path. Thinkers have hunted a repair ever since.',
      visual: '💥',
      highlight: 'Gettier problem',
    },
    {
      type: 'example',
      title: 'Gettier\'s Own Example',
      scenario: 'Smith reasonably believes Jones will get the job and that Jones carries ten coins. So he concludes: the man who gets the job has ten coins. But Smith himself gets the job — and, unknown to him, he too carries ten coins. The belief is true and justified, yet Smith plainly does not know it.',
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
        explanation: 'Gettier showed the three conditions can all be met and knowledge still missing, because luck may stitch belief to truth along a crooked, unreliable path.',
      },
    },
    {
      type: 'question',
      prompt: 'Does holding a good reason for a belief always guarantee that you genuinely know it?',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: false,
        explanation: 'Gettier cases show a good reason can still arrive at truth by sheer luck. Knowledge seems to ask more: that justification fasten to the truth in the right way, not by accident.',
      },
    },
    {
      type: 'summary',
      title: 'Why Luck Is Not Knowledge',
      keyPoints: [
        'Justification must bind belief to truth dependably',
        'Gettier cases lay bare a gap in the old definition',
        'A true belief reached by luck is not yet knowing',
        'Philosophy still argues over a complete definition',
      ],
      closingThought: 'Three short pages reshaped epistemology forever — a reminder that one sharp question can unsettle centuries of certainty.',
    },
  ],
};

export default lesson;

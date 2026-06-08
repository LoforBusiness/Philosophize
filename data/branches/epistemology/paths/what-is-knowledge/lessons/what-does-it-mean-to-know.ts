import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'epistemology-knowledge-1',
  slug: 'what-does-it-mean-to-know',
  title: 'What Does It Mean to Know Something?',
  description: 'Meet epistemology and the modern recipe for knowledge: justified true belief.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'You say you "know" it. But what is knowing?',
      subtext: 'Epistemology asks the question. Plato pressed it first, in the Theaetetus.',
      emoji: '💡',
    },
    {
      type: 'concept',
      title: 'Justified True Belief',
      body: 'Epistemology is the study of knowledge. The standard modern recipe has three parts. The claim must be TRUE. You must BELIEVE it. And you need JUSTIFICATION — solid reasons backing it up. Hit all three and you have knowledge. Miss one, and you do not.',
      visual: '🧠',
      highlight: 'justified true belief',
    },
    {
      type: 'concept',
      title: 'Why Justification Matters',
      body: 'Strip away the reasons and watch knowledge collapse. A true belief held for no reason is just luck wearing a disguise. Justification is the part that does the work — it ties your belief to the truth on purpose, so being right was earned, not an accident. No reasons, no knowing.',
      visual: '🔗',
      highlight: 'justification',
    },
    {
      type: 'example',
      title: 'Socrates Hunts for "Knowledge"',
      scenario: 'In Plato\'s Theaetetus, Socrates tests three definitions of knowledge and demolishes each, ending in puzzlement. His sharpest case: a jury swayed by a clever speaker to a true verdict still does not KNOW what happened — they never witnessed it, so they have true belief but no account, no logos. Truth alone is not enough.',
      source: 'Plato, Theaetetus, 201a–c (c. 369 BCE)',
      emoji: '🏛️',
    },
    {
      type: 'question',
      prompt: 'In the standard modern analysis, which THREE things does genuine knowledge require?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'A true belief held for good reasons — justified true belief', isCorrect: true },
          { id: 'b', text: 'A belief felt with total confidence and conviction', isCorrect: false },
          { id: 'c', text: 'A belief shared by experts and the crowd alike', isCorrect: false },
          { id: 'd', text: 'Any belief that simply turns out correct', isCorrect: false },
        ],
        explanation: 'The recipe is justified true belief: the claim is true, you believe it, and you can give reasons. Confidence and popularity are not justification, however convincing they feel.',
      },
    },
    {
      type: 'question',
      prompt: 'Is a lucky guess that happens to be right the same as genuine knowledge?',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: false,
        explanation: 'A guess can land on the truth, but it lacks justification — the reasons linking your belief to the truth. Plato\'s Theaetetus makes exactly this point: true belief without an account is not yet knowledge. You just got lucky.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'True belief can still be sheer luck.',
      body: 'Bertrand Russell pictured a stopped clock frozen at 3:00. Glance at it at exactly three and your belief about the time is TRUE — but you trusted a broken clock, so you had no real reason at all. Right by pure luck. That gap is why justification matters: it separates knowing from getting fortunate.',
      emoji: '🕰️',
    },
    {
      type: 'summary',
      title: 'Knowing vs. Believing',
      keyPoints: [
        'Epistemology is the study of knowledge',
        'The modern recipe: justified true belief',
        'Plato\'s Theaetetus first demanded an account',
        'Justification turns luck into knowing',
      ],
      closingThought: 'Next time you say "I know," ask what justification actually backs it up.',
    },
  ],
};

export default lesson;

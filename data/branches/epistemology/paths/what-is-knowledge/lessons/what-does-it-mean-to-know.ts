import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'epistemology-knowledge-1',
  slug: 'what-does-it-mean-to-know',
  title: 'What Does It Mean to Know Something?',
  description: 'Meet epistemology and the classic answer: knowledge is justified true belief.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'You say you "know" it. But what is knowing?',
      subtext: 'Epistemology asks the question. Plato gave the first famous answer.',
      emoji: '💡',
    },
    {
      type: 'concept',
      title: 'Justified True Belief',
      body: 'Epistemology is the study of knowledge. Its classic answer, traced to Plato, has three parts. The claim must be TRUE. You must BELIEVE it. And you need JUSTIFICATION — solid reasons backing it up. Hit all three and you have knowledge. Miss one, and you do not.',
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
      scenario: 'In Plato\'s dialogue the Theaetetus, Socrates corners a young mathematician: define knowledge. "Knowledge is perception," he tries. Socrates dismantles it. They circle toward a sharper idea — knowledge as true belief plus an account, a reason, a logos. The dialogue ends unresolved, but it plants the seed of justified true belief.',
      source: 'Plato, Theaetetus (~369 BCE)',
      emoji: '🏛️',
    },
    {
      type: 'question',
      prompt: 'According to the classic definition, which THREE things does genuine knowledge require?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'A true belief held for good reasons — justified true belief', isCorrect: true },
          { id: 'b', text: 'A belief felt with total confidence and conviction', isCorrect: false },
          { id: 'c', text: 'A belief shared by experts and the crowd alike', isCorrect: false },
          { id: 'd', text: 'Any belief that simply turns out correct', isCorrect: false },
        ],
        explanation: 'Plato\'s formula is justified true belief: the claim is true, you believe it, and you can give reasons. Confidence and popularity are not justification, however convincing they feel.',
      },
    },
    {
      type: 'question',
      prompt: 'Is a lucky guess that happens to be right the same as genuine knowledge?',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: false,
        explanation: 'A guess can land on the truth, but it lacks justification — the reasons linking your belief to the truth. Plato\'s point exactly: true belief without an account is not yet knowledge. You just got lucky.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'True belief can still be sheer luck.',
      body: 'Bertrand Russell pictured a stopped clock frozen at 3:00. Glance at it at exactly three, and your belief about the time is TRUE — but you trusted a broken clock. Right by pure luck. That gap is why justification matters: it separates knowing from getting fortunate.',
      emoji: '🕰️',
    },
    {
      type: 'summary',
      title: 'Knowing vs. Believing',
      keyPoints: [
        'Epistemology is the study of knowledge',
        'Knowledge = justified true belief',
        'Plato probed this in the Theaetetus',
        'Justification turns luck into knowing',
      ],
      closingThought: 'Next time you say "I know," ask what justification actually backs it up.',
    },
  ],
};

export default lesson;

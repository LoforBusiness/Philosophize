import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'logic-arguments-3',
  slug: 'valid-vs-sound',
  title: 'Valid vs. Sound',
  description: 'Not all arguments are equal. Learn the two qualities that make an argument truly powerful.',
  estimatedMinutes: 6,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'An argument can be perfectly logical and still be wrong.',
      subtext: 'Validity and soundness are different things — and the difference matters enormously.',
      emoji: '🎭',
    },
    {
      type: 'concept',
      title: 'Validity: Does the Logic Hold?',
      body: 'An argument is valid if the conclusion MUST follow from the premises — assuming the premises are true. Validity is about logical structure, not whether the premises are actually true.',
      visual: '⚙️',
      highlight: 'valid',
    },
    {
      type: 'example',
      title: 'A Valid But Weird Argument',
      scenario: 'Premise 1: All cats can fly.\nPremise 2: Whiskers is a cat.\nConclusion: Whiskers can fly.\n\nThis argument IS valid — the conclusion follows logically from the premises. But it\'s absurd because Premise 1 is false.',
      emoji: '🐱',
    },
    {
      type: 'concept',
      title: 'Soundness: Logic + Truth',
      body: 'A sound argument is valid AND has true premises. Soundness is the gold standard — it means the conclusion must be true. Only sound arguments can prove things in the real world.',
      visual: '🏅',
      highlight: 'sound',
    },
    {
      type: 'question',
      prompt: 'An argument is valid but has a false premise. Is it sound?',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: false,
        explanation: 'Soundness requires BOTH validity AND true premises. If any premise is false, the argument cannot be sound — even if the logic is perfect.',
      },
    },
    {
      type: 'question',
      prompt: 'Which type of argument can actually prove its conclusion is true?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'A sound argument', isCorrect: true },
          { id: 'b', text: 'A valid argument', isCorrect: false },
          { id: 'c', text: 'Any argument with premises', isCorrect: false },
          { id: 'd', text: 'A long argument', isCorrect: false },
        ],
        explanation: 'Only a sound argument (valid + true premises) guarantees a true conclusion. A valid argument with false premises can have a false conclusion.',
      },
    },
    {
      type: 'summary',
      title: 'Logic Leveled Up',
      keyPoints: [
        'Valid = conclusion follows from premises',
        'Sound = valid + all premises are true',
        'Valid arguments can have false conclusions',
        'Sound arguments always have true conclusions',
      ],
      closingThought: 'When you evaluate any argument, ask: is it valid? Are the premises true? If yes to both — it\'s sound.',
    },
  ],
};

export default lesson;

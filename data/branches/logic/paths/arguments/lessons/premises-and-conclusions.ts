import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'logic-arguments-2',
  slug: 'reasons-and-conclusions',
  title: 'Reasons and Conclusions',
  description: 'Learn how every argument is built from reasons that point toward a single conclusion.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Every argument has a skeleton. Learn to see it.',
      subtext: 'Once you spot reasons and conclusions, you\'ll find them everywhere.',
      emoji: '🔍',
    },
    {
      type: 'concept',
      title: 'What Is a Reason?',
      body: 'In logic, a reason — also called a premise — is a statement you offer as evidence. It\'s what you build on. Premises are the foundation. Without them, your conclusion has nothing to stand on. Watch for words like "because," "since," and "given that."',
      visual: '🧱',
      highlight: 'premise',
    },
    {
      type: 'concept',
      title: 'What Is a Conclusion?',
      body: 'The conclusion is the claim your reasons are trying to prove. It\'s the destination of the argument — everything else points toward it. Spot it with words like "therefore," "so," "thus," and "which means that."',
      visual: '🎯',
      highlight: 'conclusion',
    },
    {
      type: 'example',
      title: 'One Argument, Two Parts',
      scenario: '"Since it rained all night, the ground must be wet."\n\nReason: It rained all night.\nConclusion: The ground is wet.\n\nThe word "since" flags the reason. "Must be" points to the conclusion. Strip away the connective words and the bare structure is always the same.',
      emoji: '🌧️',
    },
    {
      type: 'question',
      prompt: 'True or false: a conclusion can stand alone without any reasons.',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: false,
        explanation: 'A statement without reasons is just an assertion — not an argument. Conclusions need premises to support them, otherwise there\'s no reason to accept the claim.',
      },
    },
    {
      type: 'summary',
      title: 'Structure Mastered',
      keyPoints: [
        'Premises are the reasons that support the conclusion',
        '"Because / since" signals a premise',
        '"Therefore / so / thus" signals a conclusion',
        'No reasons means no argument',
      ],
      closingThought: 'See the structure in every argument and you\'ll never be fooled again.',
    },
  ],
};

export default lesson;

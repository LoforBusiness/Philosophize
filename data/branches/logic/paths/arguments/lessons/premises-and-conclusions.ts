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
      headline: 'Beneath every argument lies a skeleton. Learn to see the bones.',
      subtext: 'Once you can name reasons and conclusions, you will glimpse them everywhere.',
      emoji: '🔍',
    },
    {
      type: 'concept',
      title: 'What Is a Reason?',
      body: 'A reason — what logicians call a premise — is a claim you put forward as support. It is the ground you build upon. Premises form the foundation, and without them a conclusion hangs in mid-air. Listen for their quiet signposts: because, since, given that.',
      visual: '🧱',
      highlight: 'premise',
    },
    {
      type: 'concept',
      title: 'What Is a Conclusion?',
      body: 'The conclusion is the claim your reasons labour to establish. It is the destination of the argument, the place every premise is quietly walking toward. Its signposts are familiar: therefore, so, thus, which means that.',
      visual: '🎯',
      highlight: 'conclusion',
    },
    {
      type: 'example',
      title: 'One Argument, Two Parts',
      scenario: '"Since it rained all night, the ground must be wet."\n\nReason: It rained all night.\nConclusion: The ground is wet.\n\nThe little word "since" betrays the reason; "must be" leans toward the conclusion. Peel away the connectives and the bare frame beneath is always the same.',
      emoji: '🌧️',
    },
    {
      type: 'question',
      prompt: 'True or false: a conclusion can stand on its own, with no reasons beneath it.',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: false,
        explanation: 'A claim with nothing to support it is a mere assertion, not an argument. A conclusion needs premises to hold it up; without them, we are given no reason to believe.',
      },
    },
    {
      type: 'summary',
      title: 'Structure Mastered',
      keyPoints: [
        'Premises are the reasons that hold a conclusion up',
        '"Because" and "since" announce a premise',
        '"Therefore," "so," "thus" announce a conclusion',
        'Without reasons, there is no argument at all',
      ],
      closingThought: 'Learn to see the bones of an argument, and you will not be easily deceived.',
    },
  ],
};

export default lesson;

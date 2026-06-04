import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'logic-arguments-2',
  slug: 'reasons-and-conclusions',
  title: 'Reasons and Conclusions',
  description: 'Every argument is built from reasons that support a single conclusion. Here\'s how to spot both.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Every argument has the same two parts. Learn to spot them.',
      subtext: 'Once you can name reasons and conclusions, you\'ll see them everywhere.',
      emoji: '🔍',
    },
    {
      type: 'concept',
      title: 'What Is a Reason?',
      body: 'A reason — logicians call it a premise — is a claim you offer as support. Premises are what the rest of the argument is built on. Without them, the conclusion has nothing holding it up. Watch for words like because, since, and given that.',
      visual: '🧱',
      highlight: 'premise',
    },
    {
      type: 'concept',
      title: 'What Is a Conclusion?',
      body: 'The conclusion is the claim the reasons are meant to support. It\'s the main point the argument is trying to establish. Watch for words that signal it: therefore, so, thus, and which means that.',
      visual: '🎯',
      highlight: 'conclusion',
    },
    {
      type: 'example',
      title: 'One Argument, Two Parts',
      scenario: '"Since it rained all night, the ground must be wet."\n\nReason: It rained all night.\nConclusion: The ground is wet.\n\nThe word "since" marks the reason, and "must be" points to the conclusion. Strip away those signal words and the same two-part structure is always underneath.',
      emoji: '🌧️',
    },
    {
      type: 'question',
      prompt: 'True or false: a conclusion can stand on its own, with no reasons behind it.',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: false,
        explanation: 'A claim with nothing to support it is just an assertion, not an argument. A conclusion needs premises behind it — otherwise you have no reason to believe it.',
      },
    },
    {
      type: 'summary',
      title: 'Structure Mastered',
      keyPoints: [
        'Premises are the reasons that support a conclusion',
        '"Because" and "since" signal a premise',
        '"Therefore," "so," "thus" signal a conclusion',
        'Without reasons, there is no argument',
      ],
      closingThought: 'Spot the reasons and the conclusion, and you can check any argument.',
    },
  ],
};

export default lesson;

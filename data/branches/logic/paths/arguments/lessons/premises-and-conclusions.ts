import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'logic-arguments-2',
  slug: 'reasons-and-conclusions',
  title: 'Premises and Conclusions',
  description: 'Aristotle systematized it: every argument has premises that drive toward one conclusion. Learn to spot both.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Every argument hides the same skeleton. Spot it.',
      subtext: 'Name premises and conclusions once, and you read minds forever.',
      emoji: '🦴',
    },
    {
      type: 'concept',
      title: 'What Is a Premise?',
      body: 'A premise is a claim offered as support — the evidence you put on the table. Logicians since Aristotle treat premises as the foundation an argument stands on. Pull them away and the whole structure topples. Hunt for the words because, since, and given that.',
      visual: '🧱',
      highlight: 'premise',
    },
    {
      type: 'concept',
      title: 'What Is a Conclusion?',
      body: 'The conclusion is the destination — the claim every premise is pushing you toward. In logic, this move from premises to conclusion is called inference. The conclusion is what the argument wants you to accept. Listen for therefore, so, thus, and hence.',
      visual: '🎯',
      highlight: 'conclusion',
    },
    {
      type: 'example',
      title: 'Aristotle\'s Famous Syllogism',
      scenario: '"All humans are mortal. Socrates is human. Therefore, Socrates is mortal."\n\nThe first two claims are premises. "Therefore" flags the conclusion. This is a syllogism — Aristotle\'s model of reasoning, where two premises lock together and force a third claim. The skeleton: premise, premise, conclusion.',
      emoji: '🏛️',
    },
    {
      type: 'question',
      prompt: 'True or false: a conclusion can stand on its own, with no premises behind it.',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: false,
        explanation: 'A claim with nothing behind it is a bare assertion, not an argument. Logic demands premises that support the conclusion through inference — strip them away and you have nothing to believe.',
      },
    },
    {
      type: 'summary',
      title: 'The Skeleton Revealed',
      keyPoints: [
        'Premises are the claims that support a conclusion',
        '"Because" and "since" flag a premise',
        '"Therefore" and "thus" flag a conclusion',
        'Aristotle\'s syllogism: premise, premise, conclusion',
      ],
      closingThought: 'Find the premises and the conclusion, and you can dissect any argument.',
    },
  ],
};

export default lesson;

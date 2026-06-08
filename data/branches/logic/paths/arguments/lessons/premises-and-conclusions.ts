import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'logic-arguments-2',
  slug: 'reasons-and-conclusions',
  title: 'Premises and Conclusions',
  description: 'Aristotle gave reasoning its skeleton: premises that lock together and force a conclusion. Learn to spot both.',
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
      body: 'A premise is a claim offered as a reason — the evidence you put on the table. In Aristotle\'s Prior Analytics, premises are the things "stated" from which something else must follow. Pull them away and the argument has nothing to stand on. Words like because, since, and given that often flag one.',
      visual: '🧱',
      highlight: 'premise',
    },
    {
      type: 'concept',
      title: 'What Is a Conclusion?',
      body: 'The conclusion is the claim the premises are meant to support — what Aristotle called the thing that "follows of necessity." The move from premises to conclusion is the inference. Words like therefore, so, thus, and hence often point to it, but plenty of real arguments use none.',
      visual: '🎯',
      highlight: 'conclusion',
    },
    {
      type: 'example',
      title: 'Logic\'s Most Famous Syllogism',
      scenario: '"All men are mortal. Socrates is a man. Therefore, Socrates is mortal."\n\nThe first two claims are premises; "therefore" flags the conclusion. This is the classic textbook syllogism. Aristotle invented the form — two premises forcing a third claim — but this exact wording comes from John Stuart Mill, centuries later.',
      emoji: '🏛️',
      source: 'John Stuart Mill, A System of Logic, Ratiocinative and Inductive (1843), Book II',
    },
    {
      type: 'question',
      prompt: 'True or false: a conclusion can stand on its own, with no premises behind it.',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: false,
        explanation: 'A claim with nothing behind it is a bare assertion, not an argument. As Aristotle framed it, a conclusion is what "follows of necessity" from premises that are stated — strip them away and there is no inference, and nothing to make you believe it.',
      },
    },
    {
      type: 'summary',
      title: 'The Skeleton Revealed',
      keyPoints: [
        'Premises are the claims offered to support a conclusion',
        '"Because" and "since" often flag a premise',
        '"Therefore" and "thus" often flag a conclusion',
        'Aristotle\'s syllogism: two premises force a third claim',
      ],
      closingThought: 'Find the premises and the conclusion, and you can dissect any argument.',
    },
  ],
};

export default lesson;

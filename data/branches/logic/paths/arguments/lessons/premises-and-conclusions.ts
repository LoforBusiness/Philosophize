import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'logic-arguments-2',
  slug: 'reasons-and-conclusions',
  title: 'Premises and Conclusions',
  description: 'Spot the premises and the conclusion in any argument.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Every argument hides the same skeleton.',
      subtext: 'Name premises and conclusions once, and you read minds forever.',
      emoji: '🦴',
    },
    {
      type: 'concept',
      title: 'What Is a Premise?',
      body: 'A premise is a claim offered as a reason — the evidence on the table. Pull the premises away and the argument has nothing to stand on. Words like because and since often flag one.',
      visual: '🧱',
      highlight: 'premise',
    },
    {
      type: 'concept',
      title: 'What Is a Conclusion?',
      body: 'The conclusion is the claim the premises support — what Aristotle called the thing that "follows of necessity." Words like therefore, so, and thus often point to it.',
      visual: '🎯',
      highlight: 'conclusion',
    },
    {
      type: 'example',
      title: 'Logic\'s Most Famous Syllogism',
      scenario: '"All men are mortal. Socrates is a man. Therefore, Socrates is mortal." The first two claims are premises; "therefore" flags the conclusion. Aristotle invented this form.',
      emoji: '🏛️',
      source: 'John Stuart Mill, A System of Logic (1843), Book II',
    },
    {
      type: 'quote',
      id: 'lq-logic-arguments-2',
      quote: 'A deduction is a discourse in which, certain things being stated, something other than what is stated follows of necessity.',
      author: 'Aristotle',
      era: 'c. 350 BCE',
      work: 'Prior Analytics',
    },
    {
      type: 'question',
      prompt: 'True or false: a conclusion can stand on its own, with no premises behind it.',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: false,
        explanation: 'A claim with nothing behind it is a bare assertion. Strip the premises and there is no inference, and no reason to believe it.',
      },
    },
    {
      type: 'question',
      prompt: '"Therefore, taxes should rise. After all, the deficit is growing." Which sentence is the conclusion?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: '"Taxes should rise" — flagged by "therefore"', isCorrect: true },
          { id: 'b', text: '"The deficit is growing" — it comes after "after all"', isCorrect: false },
          { id: 'c', text: 'Whichever sentence appears first', isCorrect: false },
          { id: 'd', text: 'Both — they each conclude something', isCorrect: false },
        ],
        explanation: 'A conclusion can come first. "Therefore" marks the claim being supported; "after all" introduces the premise backing it up.',
      },
    },
    {
      type: 'summary',
      title: 'The Skeleton Revealed',
      keyPoints: [
        'Premises are reasons offered for a conclusion',
        '"Because" and "since" often flag a premise',
        '"Therefore" and "thus" often flag a conclusion',
        'Position can fool you; read the role',
      ],
      closingThought: 'Find the premises and the conclusion, and you can dissect any argument.',
    },
  ],
};

export default lesson;

import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'epistemology-knowledge-1',
  slug: 'what-does-it-mean-to-know',
  title: 'What Does It Mean to Know Something?',
  description: 'Learn the classic definition of knowledge and why simply believing something is not enough.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'You say you "know" it. But how do you know?',
      subtext: 'Knowing something takes more than just believing it.',
      emoji: '💡',
    },
    {
      type: 'concept',
      title: 'The Classic Definition of Knowledge',
      body: 'Philosophers have a simple definition: knowledge is "justified true belief." To know something, three things must be true. The claim has to be true. You have to believe it. And you need good reasons to back it up. That last part — having good reasons — is called justification.',
      visual: '🧠',
      highlight: 'justified true belief',
    },
    {
      type: 'concept',
      title: 'Why Believing Is Not Enough',
      body: 'Guess that a coin will land heads, and you might be right. But you did not know it would. A true belief with no reasons behind it is just luck. Knowledge needs more than that: reasons good enough that being right was not an accident.',
      visual: '🪙',
      highlight: 'justification',
    },
    {
      type: 'example',
      title: 'Plato Questions a Slave Boy',
      scenario: 'In Plato\'s Meno, Socrates asks an untaught slave boy a series of geometry questions. With no lesson, just careful questions, the boy works out the right answer himself. Plato\'s point: knowledge is not simply poured into us. Sometimes we are guided, step by step, to figure things out on our own.',
      source: 'Plato, Meno (~380 BCE)',
      emoji: '🏛️',
    },
    {
      type: 'question',
      prompt: 'According to the classic definition, which THREE things does genuine knowledge require?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'A belief that is true and held for good reasons', isCorrect: true },
          { id: 'b', text: 'A belief felt with great confidence and emotion', isCorrect: false },
          { id: 'c', text: 'A belief that most people happen to share', isCorrect: false },
          { id: 'd', text: 'Any belief that simply turns out to be correct', isCorrect: false },
        ],
        explanation: 'Justified true belief means the claim is true, you believe it, and you have good reasons for it. Confidence and popularity are not reasons, even when they feel like it.',
      },
    },
    {
      type: 'question',
      prompt: 'Is a lucky guess that happens to be right the same as genuine knowledge?',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: false,
        explanation: 'A lucky guess can land on the truth, but you had no real reason for it. Without good reasons connecting your belief to the truth, you do not know it. You just got lucky.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'Belief by itself is not knowledge.',
      body: 'A stopped clock is right twice a day. If you happen to look at the right moment, your belief about the time is true, but you got there by chance. You do not actually know the time. Good reasons are what separate knowing from a lucky accident.',
      emoji: '🕰️',
    },
    {
      type: 'summary',
      title: 'Knowing vs. Believing',
      keyPoints: [
        'Knowledge needs truth, belief, and good reasons',
        'A right guess with no reasons is not knowledge',
        'Plato explored knowledge in the Meno',
        'Justification separates knowing from believing',
      ],
      closingThought: 'Next time you say "I know," ask yourself what good reasons actually back it up.',
    },
  ],
};

export default lesson;

import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'epistemology-knowledge-1',
  slug: 'what-does-it-mean-to-know',
  title: 'What Does It Mean to Know Something?',
  description: 'Explore the classic philosophical definition of knowledge and why belief alone is never enough.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'You believe things every day. But do you actually know them?',
      subtext: 'Philosophers drew a sharp line between believing and knowing.',
      emoji: '💡',
    },
    {
      type: 'concept',
      title: 'The Classic Definition of Knowledge',
      body: 'Philosophers define knowledge as "justified true belief." To know something, three conditions must hold: the thing must be true, you must believe it, and you must have good reasons — justification — for believing it. Belief alone is not enough. You also need truth and a solid reason behind it.',
      visual: '🧠',
      highlight: 'justified true belief',
    },
    {
      type: 'concept',
      title: 'Why Belief Is Not Enough',
      body: 'You might believe the next coin flip will be heads — and be right. But did you know it? No. A correct belief without justification is just a lucky guess. Knowledge requires that your belief is both true and backed by reasons strong enough to rule out mere coincidence.',
      visual: '🪙',
      highlight: 'justification',
    },
    {
      type: 'example',
      title: 'Plato Asks a Slave Boy',
      scenario: 'In Plato\'s Meno, Socrates questions an uneducated slave boy about geometry. By asking the right questions, the boy arrives at a correct answer. Plato uses this to argue that knowledge is not simply handed to us — it is something we must be guided to recognize through reason and reflection.',
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
          { id: 'a', text: 'True belief with justification', isCorrect: true },
          { id: 'b', text: 'Confident belief with strong emotion', isCorrect: false },
          { id: 'c', text: 'Belief that most people agree with', isCorrect: false },
          { id: 'd', text: 'Any belief that turns out to be correct', isCorrect: false },
        ],
        explanation: 'Justified true belief means the claim must be true, you must believe it, and you must have good reasons (justification) for that belief — emotion or popularity don\'t substitute for justification.',
      },
    },
    {
      type: 'question',
      prompt: 'Is a lucky correct guess the same as genuine knowledge?',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: false,
        explanation: 'A lucky guess may be true, but it lacks justification. Without good reasons behind your belief, philosophers say you don\'t genuinely know — you just got lucky.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you learned that belief alone is not knowledge.',
      body: 'Think of it this way: a stopped clock is correct twice a day. Someone who reads it at the right moment has a true belief — but no justification. They don\'t know the time; they\'re just lucky. Justification is what separates knowledge from coincidence.',
      emoji: '🕰️',
    },
    {
      type: 'summary',
      title: 'Knowing vs. Believing',
      keyPoints: [
        'Knowledge requires truth, belief, and justification',
        'A correct guess without reasons is not knowledge',
        'Plato explored the nature of knowledge in Meno',
        'Justification is what separates knowing from believing',
      ],
      closingThought: 'The next time you say "I know," ask yourself: do I have the reasons to back it up?',
    },
  ],
};

export default lesson;

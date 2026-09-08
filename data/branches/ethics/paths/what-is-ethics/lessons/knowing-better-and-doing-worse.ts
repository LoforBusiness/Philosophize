import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'ethics-ethics-39',
  slug: 'knowing-better-and-doing-worse',
  title: 'Knowing Better and Doing Worse',
  description: 'You knew the right thing and did the other one anyway. Socrates said that is impossible. Everyone else has had to explain it.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'You knew. You did the other thing anyway.',
      subtext: 'Philosophy has a name for that, and an argument that it cannot happen.',
      emoji: '🪜',
    },
    {
      type: 'concept',
      title: 'Akrasia',
      body: 'Weakness of will is acting against your own better judgement while you still hold it. Not a change of mind, and not ignorance. The judgement is live, you can state it, and you do the other thing.',
      visual: '🧗',
      highlight: 'acting against your own better judgement while you still hold it',
    },
    {
      type: 'example',
      title: 'Nobody Errs Willingly',
      scenario: 'Socrates argued that this never happens. To do a thing is to think it best right now, so anyone doing the worse thing must have got the sums wrong. Wrongdoing is a mistake about what is good, not a failure of nerve. Aristotle disagreed: the knowledge is there, he said, but asleep — held the way a sleeping man holds what he knows.',
      source: 'Aristotle, Nicomachean Ethics VII',
    },
    {
      type: 'quote',
      id: 'lq-ethics-ethics-39',
      quote: 'I see the better and approve it, and I follow the worse.',
      author: 'Ovid',
      era: 'c. 8 AD',
    },
    {
      type: 'question',
      prompt: 'Which step does the weak-willed person fail?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Acting on the judgement', isCorrect: true },
          { id: 'b', text: 'Working out which is better', isCorrect: false },
          { id: 'c', text: 'Wanting to be good at all', isCorrect: false },
          { id: 'd', text: 'Understanding the question', isCorrect: false },
        ],
        explanation: 'The last one. If he never worked out which was better, this is ignorance and not weakness. If he stopped wanting to be good, it is a change of heart. Weakness of will needs the judgement to be intact and the act to go the other way.',
      },
    },
    {
      type: 'question',
      prompt: 'You say "one more episode" at midnight. What is it?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Weakness of will — you still think stopping is better', isCorrect: true },
          { id: 'b', text: 'A change of mind — you decided watching was better', isCorrect: false },
          { id: 'c', text: 'A hidden preference you never admitted to', isCorrect: false },
          { id: 'd', text: 'Ignorance about what sleep does', isCorrect: false },
        ],
        explanation: 'Weakness of will, and the test is what you would say if asked. You would say stopping is better, and mean it, while your thumb is on the remote. A change of mind would answer differently, and a hidden preference would not be hidden from you.',
      },
    },
    {
      type: 'summary',
      title: 'The Last Step',
      keyPoints: [
        'Weakness of will keeps the judgement and drops the act',
        'Socrates denied it was possible at all',
        'Aristotle called the knowledge present but asleep',
        'Test it by asking what you would say right now',
      ],
      closingThought: 'It matters which one you are in, because the repairs are different. Ignorance wants an argument. Weakness wants a habit, or a locked door.',
    },
  ],
};

export default lesson;

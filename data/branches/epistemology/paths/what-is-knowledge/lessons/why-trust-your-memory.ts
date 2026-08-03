import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'epistemology-knowledge-31',
  slug: 'why-trust-your-memory',
  title: 'Why Trust Your Memory?',
  description: 'You are certain you locked the door. Every check you can run is another memory.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'You are sure you locked it. How would you check?',
      subtext: 'Every answer you reach for is another thing you remember.',
      emoji: '🔑',
    },
    {
      type: 'concept',
      title: 'A Cabinet That Only Opens Inward',
      body: 'Almost everything you believe about your own past rests on memory. Ask what justifies one memory and the honest answer is usually another one — you remember checking, you remember always doing it. The evidence never leaves the cabinet.',
      visual: '🗄️',
      highlight: 'Memory is checked by memory',
    },
    {
      type: 'example',
      title: 'The Regress',
      scenario: 'A witness is asked how they know the car was blue. They remember it clearly. How do they know their memory is reliable? They remember it being reliable before. Each check is drawn from the very faculty under suspicion.',
      source: 'The problem of memory justification',
    },
    {
      type: 'quote',
      id: 'lq-epistemology-knowledge-31',
      quote: 'Great is the power of memory, a fearful thing, O my God, a deep and boundless manifoldness.',
      author: 'Augustine of Hippo',
      era: '397 AD',
    },
    {
      type: 'question',
      prompt: 'What could check a memory from outside memory?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Going and looking at the door', isCorrect: true },
          { id: 'b', text: 'Recalling the moment more vividly', isCorrect: false },
          { id: 'c', text: 'Remembering that you have always locked it', isCorrect: false },
          { id: 'd', text: 'Remembering that you already checked', isCorrect: false },
        ],
        explanation: 'Only the world settles it. B, C and D are all drawn from the faculty under suspicion — open one drawer to certify the last and you have simply opened one more. And a minute after you look, that too is a memory.',
      },
    },
    {
      type: 'question',
      prompt: 'So how should you hold what you remember?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Trust it by default, and give it up only for a specific reason', isCorrect: true },
          { id: 'b', text: 'Distrust it until something independent confirms it', isCorrect: false },
          { id: 'c', text: 'Trust it completely — a vivid memory cannot be wrong', isCorrect: false },
          { id: 'd', text: 'Trust only memories from the last day or two', isCorrect: false },
        ],
        explanation: 'The trap is B, because nothing independent is available: the confirmation is remembered too. Memory is a floor rather than a conclusion, which is why the reasonable stance is trust until something specific goes wrong.',
      },
    },
    {
      type: 'summary',
      title: 'A Floor, Not a Conclusion',
      keyPoints: [
        'Nearly all of your past is held up by memory alone',
        'Checking a memory usually means consulting another one',
        'Only the world breaks the circle, and only for a moment',
        'Basic trust is not the same as blind trust',
      ],
      closingThought: 'Some beliefs are not conclusions you reached. They are the ground you were standing on.',
    },
  ],
};

export default lesson;

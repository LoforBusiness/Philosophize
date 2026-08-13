import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'metaphysics-being-34',
  slug: 'is-there-a-bottom-level',
  title: 'Is There a Bottom Level?',
  description: 'The table rests on its wood, the wood on its molecules. Does that ever stop?',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Everything real rests on something else. Everything?',
      subtext: 'Keep asking what holds this up and see where you end.',
      emoji: '🔬',
    },
    {
      type: 'concept',
      title: 'Grounding',
      body: 'A table is real because of the wood it is made of. The wood is real because of its fibres, and those because of their molecules. Philosophers call this relation grounding: not what caused what, but what holds what up right now.',
      visual: '⬇️',
      highlight: 'What holds this up?',
    },
    {
      type: 'example',
      title: 'Every Floor Has Been a Ceiling',
      scenario: 'Atoms were named for being uncuttable, then turned out to have parts. Those parts had parts. Every level anyone has called the bottom has, so far, been a floor with another room beneath it.',
      source: 'Schaffer, "On What Grounds What" (2009)',
    },
    {
      type: 'quote',
      id: 'lq-metaphysics-being-34',
      quote: 'The task of metaphysics is to say what grounds what.',
      author: 'Jonathan Schaffer',
      era: '2009',
    },
    {
      type: 'question',
      prompt: 'What is a "fundamental" level supposed to be?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'A level that holds everything else up and rests on nothing itself', isCorrect: true },
          { id: 'b', text: 'The smallest thing that exists, whatever its size turns out to be', isCorrect: false },
          { id: 'c', text: 'The earliest thing in time, from which everything later came', isCorrect: false },
          { id: 'd', text: 'The level physics is currently working on', isCorrect: false },
        ],
        explanation: 'Fundamentality is about dependence, not size or age. Something is fundamental if nothing else accounts for it — which is why "the smallest" is a different claim, and could easily be false.',
      },
    },
    {
      type: 'question',
      prompt: 'Must the chain of dependence end somewhere?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Not obviously — an endless descent is strange but not contradictory', isCorrect: true },
          { id: 'b', text: 'Yes, or nothing would be real at all', isCorrect: false },
          { id: 'c', text: 'No, because physics has already found the bottom', isCorrect: false },
          { id: 'd', text: 'Yes, because an infinite series cannot exist anywhere', isCorrect: false },
        ],
        explanation: 'The demand for a floor is an intuition, and a strong one, but nobody has turned it into a proof. A world of infinite descent — every level real, every level held up by the next — is odd to picture and has never been shown impossible.',
      },
    },
    {
      type: 'summary',
      title: 'All The Way Down?',
      keyPoints: [
        'Grounding asks what holds a thing up, not what caused it',
        'Fundamental means resting on nothing further',
        'Every proposed bottom has so far had a level beneath',
        'Infinite descent is strange but not ruled out',
      ],
      closingThought: 'Physics keeps finding a smaller room. Whether the building has a foundation is a question physics does not ask.',
    },
  ],
};

export default lesson;

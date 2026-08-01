import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'aesthetics-aesthetics-11',
  slug: 'can-a-machine-make-art',
  title: 'Can a Machine Make Art?',
  description: 'Two identical canvases, one maker each — and what the difference could possibly be.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Two identical pictures. One was painted. One was generated.',
      subtext: 'Nothing you can see tells them apart. Does anything else?',
      emoji: '🖼️',
    },
    {
      type: 'concept',
      title: 'The Difference You Cannot See',
      body: 'Every visible property is shared: the same marks, the same colours, the same size. So any difference between them is not in the object at all. It is in how the object came to exist.',
      visual: '🎨',
      highlight: 'Same surface, different history',
    },
    {
      type: 'example',
      title: 'The Plaques',
      scenario: 'A gallery hangs both and labels them honestly. Visitors linger at the painted one and walk past the generated one. Then the labels are swapped by mistake, and the lingering swaps with them. Nobody notices the pictures never moved.',
      source: 'A thought experiment after Arthur Danto',
    },
    {
      type: 'quote',
      id: 'lq-aesthetics-aesthetics-11',
      quote: 'Art is a human activity having for its purpose the transmission to others of the highest and best feelings to which men have risen.',
      author: 'Leo Tolstoy',
      era: '1897',
      work: 'What Is Art?',
    },
    {
      type: 'question',
      prompt: 'The two canvases are visually identical. What is actually different?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Who made it, and what they were doing in making it', isCorrect: true },
          { id: 'b', text: 'The brushwork — look closely enough and it shows', isCorrect: false },
          { id: 'c', text: 'The colours, which a machine mixes differently', isCorrect: false },
          { id: 'd', text: 'Nothing whatsoever, including the price', isCorrect: false },
        ],
        explanation: 'The trap is hunting for a visible tell. The premise rules one out: if any mark differed, the case would be uninteresting. What differs is the history behind the surface.',
      },
    },
    {
      type: 'question',
      prompt: 'If the canvases match exactly, what could the human maker be adding?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'An intention the work expresses — a feeling handed on', isCorrect: true },
          { id: 'b', text: 'Nothing — identical objects must have identical value', isCorrect: false },
          { id: 'c', text: 'Better technique, which you would eventually learn to see', isCorrect: false },
          { id: 'd', text: 'Rarity, which is about the price rather than the art', isCorrect: false },
        ],
        explanation: 'The trap: "identical objects, identical value" sounds like rigour. But it assumes art is only its surface — and Tolstoy\'s test is transmission, which needs someone with something to transmit.',
      },
    },
    {
      type: 'summary',
      title: 'The History Is Part Of It',
      keyPoints: [
        'Identical surfaces can differ in what they are',
        'The difference lives in how it was made',
        'Expression needs someone doing the expressing',
        'Formalists deny this — and that is the debate',
      ],
      closingThought: 'The question is not whether a machine can make an image. It is whether making needs a maker.',
    },
  ],
};

export default lesson;

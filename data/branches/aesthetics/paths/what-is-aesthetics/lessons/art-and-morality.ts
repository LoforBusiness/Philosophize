import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'aesthetics-aesthetics-10',
  slug: 'art-and-morality',
  title: 'Art and Morality',
  description: 'Can a beautiful work be evil? Should art answer to ethics at all?',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'A masterpiece that promotes something vile.',
      subtext: 'Is it still good art? Or does the wrong poison the work?',
      emoji: '⚖️',
    },
    {
      type: 'concept',
      title: 'Two Old Camps',
      body: 'Moralists like Plato and Tolstoy judge art by its effect on character and society. Aesthetes reply: judge art as art. Wilde insisted morality and beauty are separate questions entirely.',
      visual: '🎭',
      highlight: 'autonomism',
    },
    {
      type: 'quote',
      id: 'lq-aesthetics-aesthetics-10-1',
      quote: 'There is no such thing as a moral or an immoral book. Books are well written, or badly written. That is all.',
      author: 'Oscar Wilde',
      era: '1891',
      work: 'The Picture of Dorian Gray',
    },
    {
      type: 'example',
      title: 'The Propaganda Problem',
      scenario: 'A film is masterfully shot, scored, and edited — yet it glorifies cruelty. Moralists say its evil message ruins it as art. Autonomists say the craft is brilliant; the ethics are a separate matter.',
      source: 'A classic debate in aesthetics',
      emoji: '🎬',
    },
    {
      type: 'question',
      prompt: 'Which camp does each line belong to?',
      xpValue: 5,
      interaction: {
        type: 'two-camps',
        leftLabel: 'Wilde',
        rightLabel: 'Moralist',
        items: [
          { id: 'i1', text: 'A book is well or badly written, never moral or immoral.', side: 'left' },
          { id: 'i2', text: 'A work that glamorises cruelty is worse AS art.', side: 'right' },
          { id: 'i3', text: 'Judge the craft; leave the sermon out of it.', side: 'left' },
          { id: 'i4', text: 'What art teaches us to feel is part of its worth.', side: 'right' },
        ],
        explanation: 'Wilde the aesthete separates the two questions entirely: art is judged as art. The moralist answers that a work asks us to feel something, and that what it asks for can itself be a flaw in the work. Both agree the art is skilful — they disagree about whether skill is the end of the matter.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'A third path: ethicism.',
      body: 'Some philosophers, like Berys Gaut, argue a moral flaw can be an artistic flaw — if a work invites us to feel what we should not, that failure counts against it as art.',
      emoji: '🧭',
    },
    {
      type: 'question',
      prompt: '"Plato wanted to control art, so he must have valued beauty above moral concern." Assess this.',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Right — Plato prized beauty over the good of the city', isCorrect: false },
          { id: 'b', text: 'Wrong — Plato controlled art precisely because he put morality above it', isCorrect: true },
          { id: 'c', text: 'Right — for Plato beauty always outranked virtue', isCorrect: false },
          { id: 'd', text: 'Wrong — Plato thought art had no effect on character at all', isCorrect: false },
        ],
        explanation: 'The trap reverses Plato. He restrained art because he ranked moral and civic good above aesthetic appeal — fearing art could corrupt the soul.',
      },
    },
    {
      type: 'summary',
      title: 'Should Art Answer to Ethics?',
      keyPoints: [
        'Moralism: judge art by its effect',
        'Autonomism: judge art purely as art',
        'Ethicism: a moral flaw can be artistic',
      ],
      closingThought: 'Beauty and goodness may pull apart — and that unsettles us.',
    },
  ],
};

export default lesson;

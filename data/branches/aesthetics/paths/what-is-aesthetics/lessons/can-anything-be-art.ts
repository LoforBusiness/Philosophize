import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'aesthetics-aesthetics-4',
  slug: 'can-anything-be-art',
  title: 'Can Anything Be Art?',
  description: 'One urinal in a gallery blew up every theory of what art is.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'In 1917, a urinal was entered as a work of art.',
      subtext: 'No carving. No painting. Just a choice. So what on earth makes something art?',
      emoji: '🚽',
    },
    {
      type: 'concept',
      title: 'Two Old Answers',
      body: 'For centuries, two theories ruled. Plato and Aristotle said art is mimesis: skilled imitation of the world. Later, Tolstoy and Collingwood said art is expression: it transmits the maker\'s feeling. Both demand craft. So how could a plain factory urinal, untouched and unskilled, ever qualify as art?',
      visual: '🤔',
      highlight: 'mimesis',
    },
    {
      type: 'example',
      title: 'Duchamp\'s Fountain',
      scenario: 'Marcel Duchamp bought a porcelain urinal, tipped it on its back, signed it "R. Mutt," and entered it in a 1917 exhibition. The committee refused to display it. Duchamp fired back: choosing an object and naming it art is itself the creative act. The idea was the artwork. He called it a "readymade."',
      source: 'Marcel Duchamp, Fountain (1917)',
      emoji: '🎪',
    },
    {
      type: 'question',
      prompt: 'What was Duchamp\'s main claim about his "Fountain"?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Choosing an object and presenting it is what makes it art', isCorrect: true },
          { id: 'b', text: 'The urinal had a hidden beauty in its curves', isCorrect: false },
          { id: 'c', text: 'Craft and skill are the only real measure of art', isCorrect: false },
          { id: 'd', text: 'Art must imitate nature as accurately as possible', isCorrect: false },
        ],
        explanation: 'Duchamp\'s claim was that intention and context, not skill or beauty, make something art. Selecting an ordinary object and presenting it as art was, by itself, the whole creative act. The readymade was a deliberate dare to mimesis.',
      },
    },
    {
      type: 'concept',
      title: 'The Institutional Theory',
      body: 'Philosopher George Dickie offered a bold reply: something becomes art when the "artworld" confers that status. He means critics, curators, galleries, history. On this view, art is not a quality hiding inside an object but a role society grants it. Powerful, and a little unsettling: art stops being a thing and becomes a verdict.',
      visual: '🏛️',
      highlight: 'institutional theory',
    },
    {
      type: 'question',
      prompt: 'According to Dickie\'s institutional theory, what makes something count as art?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'The artworld conferring the status of art on it', isCorrect: true },
          { id: 'b', text: 'Being crafted with rare technical skill', isCorrect: false },
          { id: 'c', text: 'Expressing a powerful emotion to viewers', isCorrect: false },
          { id: 'd', text: 'Faithfully imitating something in nature', isCorrect: false },
        ],
        explanation: 'For Dickie, art status flows from the artworld of galleries, critics, and traditions, not from the object itself. That is exactly why a chosen urinal can become art while an identical one in a hardware store stays plumbing.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'Remember the expression theory?',
      body: 'Fountain ambushes it. The piece stirs mainly confusion and a question, not heartfelt emotion. Yet it changed art forever. Notice the move: asking "but is this art?" is itself philosophy. It forces you to drag your hidden definition of art into the open and defend it.',
      emoji: '💭',
    },
    {
      type: 'summary',
      title: 'Art Became a Question',
      keyPoints: [
        'Old theories: art as mimesis, or as expression',
        'Duchamp: intention and context can make anything art',
        'Dickie: the artworld confers the status of art',
      ],
      closingThought: 'Duchamp\'s urinal mattered most for the question it forced.',
    },
  ],
};

export default lesson;

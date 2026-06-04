import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'aesthetics-aesthetics-4',
  slug: 'can-anything-be-art',
  title: 'Can Anything Be Art?',
  description: 'In 1917, a urinal in a gallery changed how we define art.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'In 1917, a urinal was submitted as a work of art.',
      subtext: 'It forced people to ask a hard question: what actually makes something art?',
      emoji: '🚽',
    },
    {
      type: 'concept',
      title: 'The Definition Problem',
      body: 'For a long time the answer seemed obvious: art is skilled work made to be beautiful. But what if someone takes a plain factory object, signs it, and puts it in a gallery? If that alone can make a urinal art, then art may not be about skill or beauty after all. So what is it about?',
      visual: '🤔',
      highlight: 'readymade',
    },
    {
      type: 'example',
      title: 'Duchamp\'s Fountain',
      scenario: 'Marcel Duchamp bought a porcelain urinal, turned it on its back, signed it "R. Mutt," and submitted it to a 1917 art exhibition. The committee refused to show it. Duchamp\'s response: choosing an object and presenting it as art is itself the creative act. The idea was the artwork, not the object.',
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
          { id: 'd', text: 'Art should only copy nature accurately', isCorrect: false },
        ],
        explanation: 'Duchamp\'s claim was that intention and context, not skill or beauty, make something art. Choosing an ordinary object and presenting it as art was, by itself, the whole creative act.',
      },
    },
    {
      type: 'concept',
      title: 'The Institutional Theory of Art',
      body: 'The philosopher George Dickie offered an answer: something becomes art when the "artworld" treats it as art. That means critics, curators, galleries, and tradition. By this view, art is not a quality inside an object but a status society gives it. The idea is influential, and also a bit unsettling.',
      visual: '🏛️',
      highlight: 'institutional theory',
    },
    {
      type: 'question',
      prompt: 'According to the institutional theory, what makes something count as art?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'The artworld treating it as art', isCorrect: true },
          { id: 'b', text: 'Being made with rare technical skill', isCorrect: false },
          { id: 'c', text: 'Causing a strong emotion in viewers', isCorrect: false },
          { id: 'd', text: 'Being displayed in a public space', isCorrect: false },
        ],
        explanation: 'Dickie\'s institutional theory says art status comes from society, not from the object itself. The artworld of galleries, critics, and traditions decides. That is why a urinal can become art while your kitchen sink does not.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'You also learned that art carries emotion.',
      body: 'Duchamp challenges that idea. Fountain mainly creates confusion and provokes a question, so is that enough to count as art? Asking "is this art?" turns out to be a philosophical move in itself. It makes you spell out what you assumed art was for.',
      emoji: '💭',
    },
    {
      type: 'summary',
      title: 'Art Is Partly a Question',
      keyPoints: [
        'Duchamp: intention and context can make anything art',
        'Institutional theory: the artworld decides what counts as art',
        'Asking "is this art?" is already a philosophical question',
      ],
      closingThought: 'Duchamp\'s urinal mattered most for the question it raised.',
    },
  ],
};

export default lesson;

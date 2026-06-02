import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'aesthetics-aesthetics-4',
  slug: 'can-anything-be-art',
  title: 'Can Anything Be Art?',
  description: 'A urinal walked into a museum and broke philosophy. Here is the story.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'In 1917, a urinal was offered up as a masterpiece.',
      subtext: 'The art world never quite recovered — and that, exactly, was the point.',
      emoji: '🚽',
    },
    {
      type: 'concept',
      title: 'The Definition Problem',
      body: 'Before Duchamp, the answer felt settled: art is skilled craft in pursuit of beauty. But suppose someone takes an untouched factory object, signs it, and sets it in a gallery. If mere context can turn a urinal into art, then art was never really about skill or beauty at all — but about something stranger we had not yet named.',
      visual: '🤔',
      highlight: 'readymade',
    },
    {
      type: 'example',
      title: 'Duchamp\'s Fountain',
      scenario: 'Marcel Duchamp bought a porcelain urinal, laid it on its back, signed it "R. Mutt," and submitted it to the 1917 Society of Independent Artists. The committee refused to show it. Duchamp\'s reply was disarming: to choose an object and present it as art was already the artistic act. The idea, not the object, was the work.',
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
          { id: 'b', text: 'The urinal\'s smooth curves held a hidden beauty', isCorrect: false },
          { id: 'c', text: 'Craft and skill are art\'s only true measure', isCorrect: false },
          { id: 'd', text: 'Art should only render nature faithfully', isCorrect: false },
        ],
        explanation: 'Duchamp\'s radical claim was that intention and context — not craft or beauty — are what make a thing art. Selecting an ordinary object and offering it within an art-world setting was, in itself, the whole creative act.',
      },
    },
    {
      type: 'concept',
      title: 'The Institutional Theory of Art',
      body: 'The philosopher George Dickie answered Duchamp with a bold thought: a thing becomes art when the "artworld" — its critics, curators, galleries, its long memory — bestows that standing upon it. Art is no fixed quality lodged in objects, but a role society grants. It is a powerful idea, and an unsettling one in equal measure.',
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
          { id: 'a', text: 'The artworld\'s institutions granting it the standing of art', isCorrect: true },
          { id: 'b', text: 'Being wrought with rare technical skill', isCorrect: false },
          { id: 'c', text: 'Stirring a powerful emotion in those who see it', isCorrect: false },
          { id: 'd', text: 'Being set out in a public space', isCorrect: false },
        ],
        explanation: 'Dickie\'s institutional theory holds that the standing of art is conferred socially, never lodged in the object itself. The artworld — its galleries, critics, and traditions — decides. It explains why a urinal can become art while your kitchen sink cannot.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you learned that art carries emotion.',
      body: 'Duchamp throws that down like a gauntlet. Fountain transmits bewilderment, provocation, a question — and is that feeling enough? To ask "is this art?" turns out to be a philosophical act in itself. The question lays bare your own buried assumptions about what art is for.',
      emoji: '💭',
    },
    {
      type: 'summary',
      title: 'Art Is a Question, Not Just an Object',
      keyPoints: [
        'Duchamp: intention and context can make anything art',
        'Institutional theory: the artworld confers the standing of art',
        'To ask "is this art?" is already a philosophical move',
      ],
      closingThought: 'The truest thing Duchamp\'s urinal ever made was the question.',
    },
  ],
};

export default lesson;

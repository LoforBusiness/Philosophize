import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'aesthetics-aesthetics-2',
  slug: 'art-beauty-and-emotion',
  title: 'Art, Beauty, and Emotion',
  description: 'Expression theory: art as feeling transmitted, or clarified.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'A dead painter is making you feel something now.',
      subtext: 'How does one mind\'s feeling cross paint and centuries to reach yours?',
      emoji: '🖼️',
    },
    {
      type: 'concept',
      title: 'The Expression Theory of Art',
      body: 'Forget beauty and skill. Tolstoy says art is "infection": the maker relives a feeling and transmits it, so you feel the same. Collingwood adds — real art clarifies a feeling not yet understood.',
      visual: '📡',
      highlight: 'expression theory',
    },
    {
      type: 'example',
      title: 'Tolstoy\'s Boy and the Wolf',
      scenario: 'A boy who once met a wolf retells his terror so vividly his listeners feel it too. That transfer of a real feeling, Tolstoy wrote, is art — and sincerity matters most of all.',
      source: 'Leo Tolstoy, What Is Art? (1897)',
      emoji: '🐺',
    },
    {
      type: 'quote',
      id: 'lq-aesthetics-aesthetics-2-1',
      quote: 'Art is a human activity consisting in this, that one man hands on to others feelings he has lived through.',
      author: 'Leo Tolstoy',
      era: '1897',
      work: 'What Is Art?',
    },
    {
      type: 'question',
      prompt: 'What did Tolstoy believe was the primary purpose of art?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'To transmit the artist\'s feeling into the audience', isCorrect: true },
          { id: 'b', text: 'To copy nature as beautifully as possible', isCorrect: false },
          { id: 'c', text: 'To flaunt the artist\'s technical skill', isCorrect: false },
          { id: 'd', text: 'To deliver clear moral lessons', isCorrect: false },
        ],
        explanation: 'Tolstoy called art "infection": the maker passes on a feeling so the audience shares it. He rejected beauty, pleasure, and skill as the test.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'Feeling made portable.',
      body: 'If the expression theorists are right, emotion can be carried in lines, sounds, and words — and survive death, language, and centuries. Almost nothing else we build does that.',
      emoji: '⏳',
    },
    {
      type: 'question',
      prompt: 'Crying at a film about people you know never existed — what does this show?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'The emotion is fake, since the characters are fake', isCorrect: false },
          { id: 'b', text: 'Real feeling for known fictions — a live puzzle, the paradox of fiction', isCorrect: true },
          { id: 'c', text: 'You secretly believe the characters are real', isCorrect: false },
          { id: 'd', text: 'Only badly made fiction can move us this way', isCorrect: false },
        ],
        explanation: 'The trap: "fake people, so fake tears." Radford named this the paradox of fiction (1975) — the feeling is genuine, and explaining it is still debated.',
      },
    },
    {
      type: 'summary',
      title: 'Art Connects Minds',
      keyPoints: [
        'Tolstoy: art "infects" with the maker\'s feeling',
        'Collingwood: art clarifies a feeling',
        'Paradox of fiction: real tears, unreal people',
      ],
      closingThought: 'Expression theory: art\'s core is feeling, transmitted or clarified.',
    },
  ],
};

export default lesson;

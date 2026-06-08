import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'aesthetics-aesthetics-2',
  slug: 'art-beauty-and-emotion',
  title: 'Art, Beauty, and Emotion',
  description: 'Expression theory: art as feeling transmitted, or as feeling clarified.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'A dead painter is making you feel something right now.',
      subtext: 'How does one mind\'s feeling cross paint, language, and 400 years to reach yours?',
      emoji: '🖼️',
    },
    {
      type: 'concept',
      title: 'The Expression Theory of Art',
      body: 'Forget beauty and skill. In What Is Art?, Tolstoy says art is "infection": the maker relives a feeling and transmits it so you feel the same. Collingwood disagreed in part: real art isn\'t arousing a feeling but clarifying one the artist didn\'t yet understand.',
      visual: '📡',
      highlight: 'expression theory',
    },
    {
      type: 'example',
      title: 'Tolstoy\'s Boy and the Wolf',
      scenario: 'Tolstoy\'s own example: a boy who once met a wolf retells his terror so vividly that his listeners feel it too. That transfer of a real feeling, he wrote, is art, plain and sincere. He prized simple peasant song over refined "high" art, and ranked sincerity as the single most important condition.',
      source: 'Leo Tolstoy, What Is Art? (1897; Maude trans. 1898)',
      emoji: '🐺',
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
        explanation: 'Tolstoy called art "infection": the maker passes on a feeling so the audience shares it. He flatly rejected beauty, pleasure, and dazzling skill as the test, and rated the artist\'s sincerity above all.',
      },
    },
    {
      type: 'concept',
      title: 'Feeling Made Portable',
      body: 'Sit with how strange this is. Tolstoy and Collingwood both locate art\'s power in feeling, not in imitation or display. If they are right, emotion can be carried in lines, sounds, and words, and can survive death, language, and centuries. Almost nothing else we build does that.',
      visual: '⏳',
      highlight: 'feeling made portable',
    },
    {
      type: 'example',
      title: 'Vermeer\'s Light',
      scenario: 'Vermeer painted hushed instants: a woman reading a letter, a girl pouring milk. Three centuries on, viewers report the same stillness washing over them. He fixed a mood so precisely in light and shadow that it keeps detonating in strangers, long after his world had vanished. A vivid illustration of the expression theorists\' claim.',
      source: 'Example only: Johannes Vermeer, Dutch Golden Age (c. 1660s)',
      emoji: '🕯️',
    },
    {
      type: 'question',
      prompt: 'Can you feel genuine emotion in response to something you know is fictional?',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: true,
        explanation: 'Yes, and it puzzles philosophers. Colin Radford named this the paradox of fiction (1975): we are moved by people we know never existed. The debate is live, with named answers like Walton\'s "make-believe," not settled.',
      },
    },
    {
      type: 'summary',
      title: 'Art Connects Minds',
      keyPoints: [
        'Tolstoy: art "infects" the audience with the maker\'s feeling',
        'Collingwood: art clarifies a feeling, it isn\'t mere arousal',
        'The paradox of fiction: real tears for people who never lived',
      ],
      closingThought: 'Expression theory: art\'s core is feeling, transmitted or clarified.',
    },
  ],
};

export default lesson;

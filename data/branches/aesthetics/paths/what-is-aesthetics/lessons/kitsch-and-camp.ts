import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'aesthetics-aesthetics-26',
  slug: 'kitsch-and-camp',
  title: 'Loving Things Because They\'re Awful',
  description: 'A weeping-clown painting. A flamingo lawn ornament. Why do we adore bad taste?',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Some things are so bad they loop back around to wonderful.',
      subtext: 'Velvet Elvis. Plastic flamingos. We laugh — and we love them anyway.',
      emoji: '🦩',
    },
    {
      type: 'concept',
      title: 'Kitsch',
      body: 'Kitsch is art that hands you emotion pre-chewed — sentimental, easy, flattering. A kitten with huge teary eyes, a sunset with a soaring eagle. It doesn\'t challenge; it confirms what you already feel. Critic Clement Greenberg attacked it as the formulaic opposite of demanding, genuine art.',
      visual: '🐱',
      highlight: 'kitsch',
    },
    {
      type: 'example',
      title: 'Kundera\'s Definition',
      scenario: 'Novelist Milan Kundera offered a sharp test. Kitsch, he wrote, is "the second tear": you see children running on grass and feel moved — that\'s the first tear. The second tear says, "How nice to be moved, together with all mankind." Kitsch loves not the children, but its own reflection feeling.',
      source: 'Milan Kundera, The Unbearable Lightness of Being (1984)',
      emoji: '💧',
    },
    {
      type: 'concept',
      title: 'Camp',
      body: 'Camp is the knowing love of the over-the-top. Where kitsch is sincere, camp is a wink. It savours the failed-but-glorious — drag, B-movies, a chandelier in a diner — for their extravagance and artifice. Susan Sontag mapped it: camp finds delight precisely in things "so bad they\'re good."',
      visual: '🪩',
      highlight: 'camp',
    },
    {
      type: 'quote',
      id: 'lq-aesthetics-aesthetics-26-1',
      quote: 'The whole point of Camp is to dethrone the serious. Camp is playful, anti-serious.',
      author: 'Susan Sontag',
      era: '1964',
      work: 'Notes on "Camp"',
    },
    {
      type: 'question',
      prompt: 'You hang a gloriously tacky velvet painting and adore it with a grin. Your roommate says it proves you have bad taste. Best reply?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'You\'re right — I just can\'t tell good art from bad', isCorrect: false },
          { id: 'b', text: 'No — I love it as camp: knowingly, for its glorious excess, not sincerely as great art', isCorrect: true },
          { id: 'c', text: 'No — it secretly is a masterpiece and you can\'t see it', isCorrect: false },
          { id: 'd', text: 'You\'re right — anything I enjoy is automatically good art', isCorrect: false },
        ],
        explanation: 'The trap collapses two different attitudes. Sincerely mistaking kitsch for greatness would be bad taste. But camp is a knowing stance: you see the thing is "bad" and relish exactly that, ironically, for its extravagance. The awareness is the whole point.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'Kitsch is sincere; camp is in on the joke.',
      body: 'The same flamingo can be kitsch (someone genuinely thinks it\'s lovely) or camp (someone delights in how absurdly tacky it is). The object barely changes — the attitude does. Camp turns "bad" taste into a deliberate, sophisticated pleasure.',
      emoji: '🎭',
    },
    {
      type: 'summary',
      title: 'The Joy of Bad Taste',
      keyPoints: [
        'Kitsch: easy, sentimental art that flatters your feelings',
        'Kundera: kitsch is "the second tear" — moved by being moved',
        'Camp: knowingly loving the over-the-top and artificial',
        'Sontag: camp dethrones the serious, playfully',
      ],
      closingThought: 'Bad taste, embraced with open eyes, becomes a taste all its own.',
    },
  ],
};

export default lesson;

import type { Lesson } from '@/data/types';

// The first lesson of this road's second unit, a true story told in costume (LESSON_RULES
// AW), a DIALOGUE lesson (group AP): it plays as components/lesson/cinematic/fleming1Scene.tsx.
// These cards are the fallback the runner uses only if the CINEMATIC entry is ever removed.
const lesson: Lesson = {
  id: 'science-penicillin-1',
  slug: 'the-mould-on-the-plate',
  title: 'The Mould on the Plate',
  description: 'Fleming\'s cluttered London lab, a mouldy culture plate, flasks of broth, a trench plate and a silent lecture room.',
  estimatedMinutes: 6,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'A messy bench, a forgotten dish, and a mould killing germs',
      subtext: 'London, September 1928: Alexander Fleming comes back from holiday.',
      emoji: '🧫',
    },
    {
      type: 'concept',
      title: 'The clear ring',
      body: 'Fleming grew Staphylococcus colonies on agar plates. On one, a Penicillium mould had grown, and the colonies near it had died, leaving a clear ring. Its juice stopped some germs even watered down, but it faded fast and would not come pure.',
      visual: '💡',
      highlight: 'mould',
    },
    {
      type: 'question',
      prompt: 'What did Fleming see around the mould on his plate?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'A clear ring where the germs had died', isCorrect: true },
          { id: 'b', text: 'Extra germs growing faster', isCorrect: false },
          { id: 'c', text: 'A second mould spreading out', isCorrect: false },
        ],
        explanation: 'Near the mould, the Staphylococcus colonies had gone see-through and died. Something from the mould was killing them.',
      },
    },
    {
      type: 'quote',
      id: 'lq-science-penicillin-1-1',
      quote: 'It is suggested that it may be an efficient antiseptic for application to, or injection into, areas infected with penicillin-sensitive microbes.',
      author: 'Alexander Fleming',
      era: '1929',
      work: 'On the antibacterial action of cultures of a penicillium, British Journal of Experimental Pathology 10 (1929), summary',
    },
    {
      type: 'summary',
      title: 'The Mould on the Plate',
      keyPoints: [
        'A mould killed Staphylococcus on a dish Fleming nearly threw away',
        'Its juice stopped some germs, even watered down',
        'It faded fast, and nobody asked a single question',
      ],
      closingThought: 'Penicillin sat in a journal for nearly ten years. Then someone in Oxford opened it.',
    },
  ],
};

export default lesson;

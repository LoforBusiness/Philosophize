import type { Lesson } from '@/data/types';

// The first lesson of this road's second unit, a true story told in costume (LESSON_RULES
// AW), a DIALOGUE lesson (group AP): it plays as components/lesson/cinematic/amazon1Scene.tsx.
// These cards are the fallback the runner uses only if the CINEMATIC entry is ever removed.
const lesson: Lesson = {
  id: 'business-amazon-1',
  slug: 'cadabra-in-the-garage',
  title: 'Cadabra in the Garage',
  description: 'A Manhattan office at night, an old Chevy Blazer on the interstate and a Bellevue garage with desks made of doors.',
  estimatedMinutes: 6,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Why would anyone quit a great job to sell books?',
      subtext: 'New York, 1994: Jeff Bezos has seen a number he can\'t stop thinking about.',
      emoji: '📦',
    },
    {
      type: 'concept',
      title: 'Pick the right first product',
      body: 'Bezos listed twenty things he could sell online and chose books. There were millions of titles, far more than any shop could stock, and wholesalers already listed them all. A website could offer every one, which no shop could match.',
      visual: '💡',
      highlight: 'books',
    },
    {
      type: 'question',
      prompt: 'Why did Bezos choose books as Amazon\'s first product?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'No shop could stock all the millions of titles', isCorrect: true },
          { id: 'b', text: 'Books were the most expensive thing on his list', isCorrect: false },
          { id: 'c', text: 'Nobody else in America was selling books', isCorrect: false },
        ],
        explanation: 'There were over three million books in print, far more than any shop could hold, so an online shop could offer something no shop could. Books weren\'t the priciest item, and plenty of shops already sold them.',
      },
    },
    {
      type: 'quote',
      id: 'lq-business-amazon-1-1',
      quote: 'I knew that if I failed I wouldn’t regret that, but I knew the one thing I might regret is not ever having tried.',
      author: 'Jeff Bezos',
      era: '2001',
      work: 'Interview with the Academy of Achievement, 4 May 2001',
    },
    {
      type: 'summary',
      title: 'Cadabra in the Garage',
      keyPoints: [
        'In 1994 Bezos saw the web growing at astonishing speed',
        'He chose books, because no shop could stock them all',
        'He quit, drove west and started work in a Bellevue garage',
      ],
      closingThought: 'The shop needed a better name, and its very first order. Next, a bell rings every time someone buys a book.',
    },
  ],
};

export default lesson;

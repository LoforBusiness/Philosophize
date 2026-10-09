import type { Lesson } from '@/data/types';

// The first lesson of this road's second unit, a true story told in costume (LESSON_RULES
// AW), a DIALOGUE lesson (group AP): it plays as components/lesson/cinematic/milgram1Scene.tsx.
// These cards are the fallback the runner uses only if the CINEMATIC entry is ever removed.
const lesson: Lesson = {
  id: 'psychology-milgram-1',
  slug: 'the-memory-study-that-wasnt',
  title: 'The Memory Study That Wasn’t',
  description: 'A Yale office with the Eichmann trial in the paper, then a laboratory with a hat of slips, a strap chair, a one-way mirror and a shock generator.',
  estimatedMinutes: 6,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Would you hurt a stranger because a man in a lab coat said so?',
      subtext: 'Yale, 1961. An advert asks for volunteers for a study of memory. It isn\'t one.',
      emoji: '⚡',
    },
    {
      type: 'concept',
      title: 'Obedience to authority',
      body: 'In 1961 Stanley Milgram tested whether ordinary people would hurt a stranger on an authority\'s orders. Volunteers became \'teachers\' giving shocks to a \'learner\' who was really an actor. The draw was rigged, and no one was really shocked. Experts predicted almost nobody would go to the highest switch.',
      visual: '💡',
      highlight: 'obedience',
    },
    {
      type: 'question',
      prompt: 'How did Milgram make sure the real volunteer was always the teacher?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Both slips in the hat said teacher', isCorrect: true },
          { id: 'b', text: 'He picked the most nervous man', isCorrect: false },
          { id: 'c', text: 'The volunteer chose the role he wanted', isCorrect: false },
        ],
        explanation: 'Both slips said teacher. The volunteer read his, and the actor playing Mr Wallace pretended his said learner.',
      },
    },
    {
      type: 'quote',
      id: 'lq-psychology-milgram-1-1',
      quote: 'Obedience is as basic an element in the structure of social life as one can point to.',
      author: 'Stanley Milgram',
      era: '1974',
      work: 'Obedience to Authority: An Experimental View, ch. 1 (1974)',
    },
    {
      type: 'summary',
      title: 'The Memory Study That Wasn’t',
      keyPoints: [
        'Milgram asked if ordinary people would obey orders to hurt',
        'A rigged draw always made the real volunteer the teacher',
        'The learner was an actor, and his shocks were never real',
      ],
      closingThought: 'Experts expected almost nobody to reach the last switch. Next, the switches climb, and the experimenter says, please continue.',
    },
  ],
};

export default lesson;

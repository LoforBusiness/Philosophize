import type { Lesson } from '@/data/types';

// The second lesson on this subject's road, a DIALOGUE lesson (LESSON_RULES group AP):
// it plays as components/lesson/cinematic/phil2Scene.tsx. These cards are the
// fallback the runner uses only if the CINEMATIC entry is ever removed.
const lesson: Lesson = {
  id: 'philosophy-foundations-2',
  slug: 'what-makes-an-argument-good',
  title: 'What Makes an Argument Good?',
  description: 'A slice of carrot cake, a chalkboard, and a reason that does not quite lead where she says it does.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Carrots are healthy, so carrot cake is healthy. Spot the problem?',
      subtext: 'An argument can have true reasons and still go wrong.',
      emoji: '🍰',
    },
    {
      type: 'concept',
      title: 'Reasons and Conclusions',
      body: 'An argument is a set of reasons given to support a conclusion. A good one needs two things: reasons that are true, and a conclusion that really follows from them. Attacking the person who argues answers neither.',
      visual: '💡',
      highlight: 'follows',
    },
    {
      type: 'question',
      prompt: 'Both reasons are true: carrots are healthy, and the cake has carrots. What is wrong with the argument?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'The conclusion does not follow from the reasons', isCorrect: true },
          { id: 'b', text: 'One of the reasons is false', isCorrect: false },
          { id: 'c', text: 'She eats cake for breakfast', isCorrect: false },
        ],
        explanation: 'The conclusion does not follow. Carrots in a cake do not stop it being mostly sugar and butter, and what she eats for breakfast says nothing about the argument.',
      },
    },
    {
      type: 'quote',
      id: 'lq-philosophy-foundations-2-1',
      quote: 'Both teachers and learners go to sleep at their post, as soon as there is no enemy in the field.',
      author: 'John Stuart Mill',
      era: '1859',
      work: 'On Liberty',
    },
    {
      type: 'summary',
      title: 'What Makes an Argument Good?',
      keyPoints: [
        'An argument is reasons given for a conclusion',
        'Good ones need true reasons that lead to the conclusion',
        'Attacking the person doesn’t answer the reasons',
      ],
      closingThought: 'Next time someone gives you a reason, check two things: is it true, and does the conclusion follow?',
    },
  ],
};

export default lesson;

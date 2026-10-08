import type { Lesson } from '@/data/types';

// The RECAP of this subject's road so far (LESSON_RULES AV), a DIALOGUE lesson (group AP):
// it plays as components/lesson/cinematic/psych7Scene.tsx. These cards are the
// fallback the runner uses only if the CINEMATIC entry is ever removed.
const lesson: Lesson = {
  id: 'psychology-foundations-7',
  slug: 'psychology-recap',
  title: 'Psychology Recap: The Old Laboratory',
  description: 'An early laboratory with a brass reaction timer and two cups of coffee, then a busy railway concourse with a departures board and a chocolate machine: the first six findings, looked at again.',
  estimatedMinutes: 6,
  xpReward: 25,
  recap: true,
  cards: [
    {
      type: 'hook',
      headline: 'Six findings, one old laboratory, and a friend who was fooled by them all.',
      subtext: 'Psychology tests what people do.',
      emoji: '🧠',
    },
    {
      type: 'concept',
      title: 'The First Six Findings',
      body: 'Expectations change what people taste, see and remember, and nobody can watch their own mind at work, so psychologists test and count. People copy crowds, change the story when beliefs clash, and keep going for rewards they can\'t predict.',
      visual: '💡',
      highlight: 'test',
    },
    {
      type: 'question',
      prompt: 'How does a psychologist find out whether a label changed how something tasted?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Swap the labels and count what people pick', isCorrect: true },
          { id: 'b', text: 'Ask the taster what he thinks', isCorrect: false },
          { id: 'c', text: 'Check the coffee beans', isCorrect: false },
        ],
        explanation: 'Swap the labels and count. If the favourite follows the label, the label did it. The taster can\'t watch his own mind at work, and the beans are the same in both cups.',
      },
    },
    {
      type: 'quote',
      id: 'lq-psychology-foundations-7-1',
      quote: 'Psychology has a long past, but only a short history.',
      author: 'Hermann Ebbinghaus',
      era: '1908',
      work: 'Psychology: An Elementary Text-Book (Abriss der Psychologie)',
    },
    {
      type: 'summary',
      title: 'Psychology Recap: The Old Laboratory',
      keyPoints: [
        'Expectations change what you taste, see and remember',
        'People can’t watch their own minds, so test them',
        'Crowds, clashes and rewards steer what people do',
      ],
      closingThought: 'Next time you’re sure why you did something, ask what a psychologist would test.',
    },
  ],
};

export default lesson;

import type { Lesson } from '@/data/types';

// The fourth lesson on this subject's road, a DIALOGUE lesson (LESSON_RULES group AP):
// it plays as components/lesson/cinematic/sci4Scene.tsx. These cards are the
// fallback the runner uses only if the CINEMATIC entry is ever removed.
const lesson: Lesson = {
  id: 'science-foundations-4',
  slug: 'why-measure-more-than-once',
  title: 'Why Measure More Than Once?',
  description: 'A playground swing, a stopwatch, and four timings that don’t quite agree.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'One swing took three seconds. Is the experiment done?',
      subtext: 'One measurement is a start, not an answer.',
      emoji: '⏱️',
    },
    {
      type: 'concept',
      title: 'Repeat and Average',
      body: 'Every measurement has a small error. Measure several times and take the average, so the small errors cancel out. A result far from the others means something went wrong: check it, don’t hide it.',
      visual: '💡',
      highlight: 'average',
    },
    {
      type: 'question',
      prompt: 'Why did her three timings come out different?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Her stopwatch', isCorrect: true },
          { id: 'b', text: 'The swing', isCorrect: false },
          { id: 'c', text: 'The clipboard', isCorrect: false },
        ],
        explanation: 'Her stopwatch. Starting and stopping it by hand is never exact. The swing takes the same time on every swing, and the clipboard only records what she measured.',
      },
    },
    {
      type: 'quote',
      id: 'lq-science-foundations-4-1',
      quote: 'When you can measure what you are speaking about, and express it in numbers, you know something about it.',
      author: 'Lord Kelvin',
      era: '1883',
      work: 'Electrical Units of Measurement, a lecture',
    },
    {
      type: 'summary',
      title: 'Why Measure More Than Once?',
      keyPoints: [
        'Every measurement has a small error',
        'Measure several times and take the average',
        'Check a result that’s far from the others',
      ],
      closingThought: 'Next time you see a single result, ask how many times it was measured.',
    },
  ],
};

export default lesson;

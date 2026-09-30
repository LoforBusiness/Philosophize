import type { Lesson } from '@/data/types';

// The first lesson on this subject's road, a DIALOGUE lesson (LESSON_RULES group AP):
// it plays as components/lesson/cinematic/psych1Scene.tsx. These cards are the
// fallback the runner uses only if the CINEMATIC entry is ever removed.
const lesson: Lesson = {
  id: 'psychology-foundations-1',
  slug: 'what-is-psychology',
  title: 'What Is Psychology?',
  description: 'Two cups of coffee, two labels, and a taster who is quite sure of himself.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Same coffee in both cups. He swears one tastes better.',
      subtext: 'What changed was in his head, and that is where psychology looks.',
      emoji: '☕',
    },
    {
      type: 'concept',
      title: 'The Mind You Can’t See',
      body: 'Psychology studies how people think, feel and act. Its first finding is that people are poor witnesses of their own minds: a label can change a taste without the taster noticing. So psychologists test, and count what people do.',
      visual: '🧠',
      highlight: 'test',
    },
    {
      type: 'question',
      prompt: 'Both cups held the same coffee. Why did the gold one taste better to him?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'The label changed what he expected', isCorrect: true },
          { id: 'b', text: 'The coffee in it was better', isCorrect: false },
          { id: 'c', text: 'He got lucky with his guess', isCorrect: false },
        ],
        explanation: 'Expectation changes what people taste, see and remember, and they do not notice it happening. That is why psychology tests instead of asking.',
      },
    },
    {
      type: 'quote',
      id: 'lq-psychology-foundations-1-1',
      quote: 'Psychology is the Science of Mental Life, both of its phenomena and of their conditions.',
      author: 'William James',
      era: '1890',
      work: 'The Principles of Psychology',
    },
    {
      type: 'summary',
      title: 'Where Psychology Begins',
      keyPoints: [
        'It studies how people think, feel and act',
        'People can’t see their own minds clearly',
        'So psychologists test and count',
      ],
      closingThought: 'Next time you know why you like something, wonder what else is steering you.',
    },
  ],
};

export default lesson;

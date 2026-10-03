import type { Lesson } from '@/data/types';

// The fourth lesson on this subject's road, a DIALOGUE lesson (LESSON_RULES group AP):
// it plays as components/lesson/cinematic/phil4Scene.tsx. These cards are the
// fallback the runner uses only if the CINEMATIC entry is ever removed.
const lesson: Lesson = {
  id: 'philosophy-foundations-4',
  slug: 'how-do-you-know',
  title: 'How Do You Know?',
  description: 'A station clock that stopped last night, a traveller who is right by luck, and a departure board.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'The station clock says quarter past nine, and it is. But the clock stopped last night.',
      subtext: 'Being right isn’t the same as knowing.',
      emoji: '🕰️',
    },
    {
      type: 'concept',
      title: 'Knowledge Needs a Reason',
      body: 'To know something, your belief has to be true, and you need a good reason for it. A lucky guess can be true, but luck is not a reason, so a lucky guess is not knowledge.',
      visual: '💡',
      highlight: 'reason',
    },
    {
      type: 'question',
      prompt: 'His belief was true. What made it a lucky guess instead of knowledge?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'The stopped clock', isCorrect: true },
          { id: 'b', text: 'The departure board', isCorrect: false },
          { id: 'c', text: 'His ticket', isCorrect: false },
        ],
        explanation: 'The stopped clock. It says quarter past nine all day, so it gave him no real reason. The board and his ticket are good reasons, and he hadn’t looked at either.',
      },
    },
    {
      type: 'quote',
      id: 'lq-philosophy-foundations-4-1',
      quote: 'It is very easy to give examples of true beliefs that are not knowledge.',
      author: 'Bertrand Russell',
      era: '1948',
      work: 'Human Knowledge: Its Scope and Limits',
    },
    {
      type: 'summary',
      title: 'How Do You Know?',
      keyPoints: [
        'Knowing needs a belief that’s true',
        'It also needs a good reason behind it',
        'A lucky guess isn’t knowledge, even when it’s right',
      ],
      closingThought: 'Next time you’re sure of something, ask what your reason is.',
    },
  ],
};

export default lesson;

import type { Lesson } from '@/data/types';

// The RECAP of this subject's road so far (LESSON_RULES AV), a DIALOGUE lesson (group AP):
// it plays as components/lesson/cinematic/hist7Scene.tsx. These cards are the
// fallback the runner uses only if the CINEMATIC entry is ever removed.
const lesson: Lesson = {
  id: 'history-foundations-7',
  slug: 'history-recap',
  title: 'History Recap: The Archive and the Dig',
  description: 'A museum record room full of boxes about a town fire, then a dig among Greek ruins with a bronze ballot, an old well and a boastful carved stone.',
  estimatedMinutes: 6,
  xpReward: 25,
  recap: true,
  cards: [
    {
      type: 'hook',
      headline: 'Forty boxes of paper, one dig, and a volunteer who means well.',
      subtext: 'History works the past out from evidence.',
      emoji: '🏺',
    },
    {
      type: 'concept',
      title: 'The First Six Lessons',
      body: 'History works the past out from evidence. A primary source was made at the time, and every source was made by someone, for a reason. Events have long-term causes and triggers, some things change while others stay the same, and Athens picked its jurors by lottery.',
      visual: '💡',
      highlight: 'evidence',
    },
    {
      type: 'question',
      prompt: 'Which of these is a primary source for a town fire in 1890?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'A fireman’s notebook written that night', isCorrect: true },
          { id: 'b', text: 'A booklet printed fifty years later', isCorrect: false },
          { id: 'c', text: 'A painting made last year', isCorrect: false },
        ],
        explanation: 'The fireman’s notebook. He wrote it at the time, and he was there. The booklet and the painting came later, from other sources.',
      },
    },
    {
      type: 'quote',
      id: 'lq-history-foundations-7-1',
      quote: 'Misunderstanding of the present is the inevitable consequence of ignorance of the past.',
      author: 'Marc Bloch',
      era: '1949',
      work: 'The Historian’s Craft',
    },
    {
      type: 'summary',
      title: 'History Recap: The Archive and the Dig',
      keyPoints: [
        'History works the past out from evidence',
        'Ask who made each source, when, and why',
        'Look for every cause, and for what stayed the same',
      ],
      closingThought: 'Next time you find an old letter or photo, ask who made it, and when.',
    },
  ],
};

export default lesson;

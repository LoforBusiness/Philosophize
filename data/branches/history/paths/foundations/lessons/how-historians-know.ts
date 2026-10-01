import type { Lesson } from '@/data/types';

// The second lesson on this subject's road, a DIALOGUE lesson (LESSON_RULES group AP):
// it plays as components/lesson/cinematic/hist2Scene.tsx. These cards are the
// fallback the runner uses only if the CINEMATIC entry is ever removed.
const lesson: Lesson = {
  id: 'history-foundations-2',
  slug: 'how-historians-know',
  title: 'How Historians Know',
  description: 'A book that makes great-grandad a hero, and his own letter, which mentions potatoes.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'The book says he captured a castle. His letter says potatoes.',
      subtext: 'When two sources disagree, a historian knows what to ask.',
      emoji: '📜',
    },
    {
      type: 'concept',
      title: 'Primary and Secondary Sources',
      body: 'A primary source was made at the time, by someone who was there. A secondary source was written later, from other sources. A historian asks when, by whom and why each was made, and looks for a third source when two disagree.',
      visual: '💡',
      highlight: 'primary',
    },
    {
      type: 'question',
      prompt: 'Which of these is a primary source for a week in 1916?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'A letter written that week by a soldier', isCorrect: true },
          { id: 'b', text: 'A history book from 1985', isCorrect: false },
          { id: 'c', text: 'A museum leaflet from 2010', isCorrect: false },
        ],
        explanation: 'The letter. It was written at the time by someone who was there. The book and the leaflet came decades later, from other sources.',
      },
    },
    {
      type: 'quote',
      id: 'lq-history-foundations-2-1',
      quote: 'To such high offices this work does not aspire: it wants only to show what actually happened.',
      author: 'Leopold von Ranke',
      era: '1824',
      work: 'Histories of the Latin and Germanic Peoples',
    },
    {
      type: 'summary',
      title: 'How Historians Know',
      keyPoints: [
        'A primary source was made at the time',
        'A secondary source was written later, from others',
        'When sources disagree, find another from the time',
      ],
      closingThought: 'Next time you hear a family story, ask what was written down when it happened.',
    },
  ],
};

export default lesson;

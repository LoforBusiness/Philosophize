import type { Lesson } from '@/data/types';

// The fifth lesson on this subject's road, a DIALOGUE lesson (LESSON_RULES group AP) seen
// in FIRST PERSON (group AT): it plays as components/lesson/cinematic/hist5Scene.tsx.
// These cards are the fallback the runner uses only if the CINEMATIC entry is ever removed.
const lesson: Lesson = {
  id: 'history-foundations-5',
  slug: 'on-trial-in-athens',
  title: 'On Trial in Athens',
  description: 'You wake up, open your bedroom door, and walk into an Athenian law court where you are the defendant.',
  estimatedMinutes: 6,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'You open your bedroom door and walk into an Athenian court.',
      subtext: 'Five hundred jurors, a water clock, and nobody to speak for you.',
      emoji: '⚖️',
    },
    {
      type: 'concept',
      title: 'How Athens Judged',
      body: 'Athens picked hundreds of ordinary citizens as jurors by lottery, so nobody could bribe them in advance. There were no lawyers: you spoke for yourself, and a water clock gave both sides the same time.',
      visual: '💡',
      highlight: 'lottery',
    },
    {
      type: 'question',
      prompt: 'Why did Athens pick its jurors by lottery?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'So nobody could bribe them in advance', isCorrect: true },
          { id: 'b', text: 'So the cleverest citizens got picked', isCorrect: false },
        ],
        explanation: 'Nobody knew who would sit until the morning of the trial, so nobody could bribe the jury in advance.',
      },
    },
    {
      type: 'quote',
      id: 'lq-history-foundations-5-1',
      quote: 'When it is a question of settling private disputes, everyone is equal before the law.',
      author: 'Pericles, in Thucydides',
      era: 'c. 400 BC',
      work: 'History of the Peloponnesian War',
    },
    {
      type: 'summary',
      title: 'On Trial in Athens',
      keyPoints: [
        'Jurors were picked by lottery, so nobody could bribe them',
        'You spoke for yourself, timed by a water clock',
        'Jurors voted in secret with bronze discs',
      ],
      closingThought: 'Next time you see a jury, remember who did it first.',
    },
  ],
};

export default lesson;

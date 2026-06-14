import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'aesthetics-aesthetics-14',
  slug: 'humes-standard-of-taste',
  title: 'Is Anyone\'s Taste Actually Better?',
  description: 'Taste differs — but Hume thought practiced critics still judge better than the rest of us.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Everyone has taste. Does anyone have better taste?',
      subtext: 'Hume thought the answer was yes — and he could say exactly why.',
      emoji: '👁️',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you saw taste seems merely personal.',
      body: 'In the lesson on disagreement, beauty looked like opinion — we just differ. Hume agrees taste varies wildly. But he refuses to stop there. Variety, he insists, does not mean every verdict is equally good.',
      emoji: '🔁',
    },
    {
      type: 'concept',
      title: 'The True Judge',
      body: 'Hume\'s move: not everyone is qualified to rank art. A real standard comes from the joint verdict of "true judges" — rare people whose practiced, unbiased perception is more reliable than the careless crowd\'s.',
      visual: '⚖️',
      highlight: 'true judges',
    },
    {
      type: 'example',
      title: 'The Kinsmen and the Key',
      scenario: 'Cervantes tells of two wine experts. One detects leather, the other iron, in a cask others call flawless. They are mocked — until the barrel is drained and a key on a leather thong is found at the bottom. Their finer palates were right all along.',
      source: 'Hume, Of the Standard of Taste (retelling Cervantes)',
      emoji: '🍷',
    },
    {
      type: 'concept',
      title: 'Five Marks of a Critic',
      body: 'A true judge is built, not born: delicate sensibility, practice, comparison across many works, freedom from prejudice, and good sense. Their shared verdict, surviving across nations and ages, is Hume\'s standard of taste.',
      visual: '🧭',
      highlight: 'standard of taste',
    },
    {
      type: 'quote',
      id: 'lq-aesthetics-aesthetics-14-1',
      quote: 'Strong sense, united to delicate sentiment, improved by practice, perfected by comparison, and cleared of all prejudice, can alone entitle critics to this valuable character.',
      author: 'David Hume',
      era: '1757',
      work: 'Of the Standard of Taste',
      philosopherId: 'david-hume',
    },
    {
      type: 'quote',
      id: 'lq-aesthetics-aesthetics-14-1-2',
      quote: 'The same Homer, who pleased at Athens and Rome two thousand years ago, is still admired at Paris and at London.',
      author: 'David Hume',
      era: '1757',
      work: 'Of the Standard of Taste',
      philosopherId: 'david-hume',
    },
    {
      type: 'question',
      prompt: '"Because Hume admits taste differs from person to person, he concludes every judgment of taste is equally valid."',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: false,
        explanation: 'False. This is the relativist trap — sliding from descriptive variety ("tastes differ") to normative equality ("so all are equal"). Hume argues the reverse: the joint verdict of qualified true judges is a real standard, so some judgments genuinely are better.',
      },
    },
    {
      type: 'summary',
      title: 'What You Now Know',
      keyPoints: [
        'Taste varies, but verdicts are not all equal',
        'True judges supply Hume\'s standard',
        'Their mark: practice, comparison, no prejudice',
      ],
      closingThought: 'That tastes differ does not prove that all tastes are equally good.',
    },
  ],
};

export default lesson;

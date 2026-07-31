import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'aesthetics-aesthetics-7',
  slug: 'taste-and-disagreement',
  title: 'Taste and Disagreement',
  description: 'If beauty is just opinion, why are some judgments clearly better?',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Your favorite song. Is it actually any good?',
      subtext: 'We argue about taste constantly — as if someone could be wrong.',
      emoji: '🎧',
    },
    {
      type: 'concept',
      title: 'Beauty in the Eye?',
      body: 'Hume granted that beauty is no quality in the object; it lives in the mind that perceives it. So far this sounds like pure relativism: every taste equally right.',
      visual: '👁️',
      highlight: 'subjectivism',
    },
    {
      type: 'quote',
      id: 'lq-aesthetics-aesthetics-7-1',
      quote: 'Beauty is no quality in things themselves: it exists merely in the mind which contemplates them; and each mind perceives a different beauty.',
      author: 'David Hume',
      era: '1757',
      work: 'Of the Standard of Taste',
    },
    {
      type: 'concept',
      title: 'But Not All Tastes Are Equal',
      body: 'Yet ranking a great poet above a clumsy one feels right, not arbitrary. Hume\'s fix: a standard set by ideal critics — people with refined senses, practice, and freedom from prejudice.',
      visual: '⚖️',
      highlight: 'standard of taste',
    },
    {
      type: 'question',
      prompt: 'How did Hume resolve the tension between taste being personal yet some judgments seeming better?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'A standard fixed by the verdict of experienced, unprejudiced critics', isCorrect: true },
          { id: 'b', text: 'A scientific measurement of beauty in the object', isCorrect: false },
          { id: 'c', text: 'A vote in which every opinion counts equally', isCorrect: false },
          { id: 'd', text: 'Abandoning the idea that any art is better than other art', isCorrect: false },
        ],
        explanation: 'Hume located the standard not in the object but in ideal critics — trained, practiced, and free of bias — whose joint verdict refines and guides taste over time.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'Refined taste is earned, not just born.',
      body: 'For Hume, a good critic has compared many works and stilled personal prejudice. This is why a wine expert tastes notes you miss — practice sharpens perception itself.',
      emoji: '🍷',
    },
    {
      type: 'question',
      prompt: 'A reader sums Hume up like this. Tap the step he would reject.',
      xpValue: 5,
      interaction: {
        type: 'tap-flaw',
        steps: [
          { id: 's1', text: 'Hume says beauty exists in the mind, not the object.' },
          { id: 's2', text: 'So no judgement of art is better than another.' },
          { id: 's3', text: 'So a trained critic is worth no more than anyone.' },
        ],
        flawedId: 's2',
        explanation: 'Step 2. "In the mind" sounds like "anything goes," and that slide is the whole trap — Hume holds both halves at once. Beauty is a response, not a property of the canvas; yet responses can be better or worse informed, and the settled verdict of experienced, unprejudiced critics is a real standard.',
      },
    },
    {
      type: 'summary',
      title: 'Why Taste Can Be Better',
      keyPoints: [
        'Hume: beauty exists in the mind',
        'Yet not all tastes rank equally',
        'A standard comes from ideal critics',
      ],
      closingThought: 'Subjective does not have to mean every judgment is equal.',
    },
  ],
};

export default lesson;

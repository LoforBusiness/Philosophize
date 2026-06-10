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
      prompt: '"Hume said beauty is in the mind, so he must believe every opinion about art is equally correct."',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'True — subjectivism means all tastes are equally valid', isCorrect: false },
          { id: 'b', text: 'False — he kept a standard, ranking trained critics above the careless', isCorrect: true },
          { id: 'c', text: 'True — he denied that any critic could be more reliable', isCorrect: false },
          { id: 'd', text: 'False — he thought beauty was measurable in the object', isCorrect: false },
        ],
        explanation: 'The trap: "in the mind" sounds like "anything goes." Hume held both — beauty is subjective, yet the trained verdict of true critics sets a real standard.',
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

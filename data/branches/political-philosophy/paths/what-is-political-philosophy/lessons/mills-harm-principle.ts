import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'political-political-13',
  slug: 'mills-harm-principle',
  title: 'Where Your Freedom Ends',
  description: 'Mill draws one line: society may stop you only to prevent harm to others.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'When may others force you to stop?',
      subtext: 'Not when they dislike it. Not when it disgusts them. Mill draws one line.',
      emoji: '🚧',
    },
    {
      type: 'concept',
      title: 'One Line, and Only One',
      body: 'Mill\'s harm principle: the only legitimate reason to use power over someone against their will is to prevent harm to others. Your own good is never enough. Society may persuade you, but it may not coerce you for your sake alone.',
      visual: '⚖️',
      highlight: 'harm principle',
    },
    {
      type: 'quote',
      id: 'lq-political-political-13-1',
      quote: 'The only purpose for which power can be rightfully exercised over any member of a civilized community, against his will, is to prevent harm to others.',
      author: 'John Stuart Mill',
      era: '1859',
      work: 'On Liberty',
      philosopherId: 'john-stuart-mill',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you saw negative liberty and the majority\'s tyranny.',
      body: 'Berlin\'s negative liberty is a free area where no one may interfere. Mill\'s harm principle draws its border: the majority may cross only to stop real harm to others, never to enforce its tastes.',
      emoji: '🛡️',
    },
    {
      type: 'concept',
      title: 'Harm Is Not Offense',
      body: 'Here is the crux. Harm sets back someone else\'s real interests or rights. Offense is only being upset, disgusted, or disapproving. People may loathe what you say or how you live, yet feeling offended is not being harmed, so it cannot license force.',
      visual: '🗯️',
      highlight: 'harm is not offense',
    },
    {
      type: 'example',
      title: 'The Speech They Hate',
      scenario: 'A speaker voices an unpopular opinion that deeply offends most of the town. No one is assaulted, defrauded, or endangered, but feelings are wounded and tempers flare. The crowd demands the speech be banned. For Mill, wounded feelings are not harm, so the ban fails his test.',
      source: 'J. S. Mill, On Liberty',
      emoji: '🎙️',
    },
    {
      type: 'question',
      prompt: 'True or false: For Mill, the fact that speech deeply offends many people is itself enough harm to justify banning it.',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: false,
        explanation: 'False. This conflates offense with harm. For Mill, harm is a setback to others\' interests or rights; mere offense or distaste is not. Many being upset never licenses coercion, or the majority could silence anything it disliked.',
      },
    },
    {
      type: 'summary',
      title: 'What You Now Know',
      keyPoints: [
        'Power over the unwilling is justified only to prevent harm',
        'Your own good is never a sufficient reason',
        'Offense and disapproval are not harm',
        'The harm principle borders Berlin\'s protected free area',
      ],
      closingThought: 'Your freedom ends where another\'s harm begins, not where another\'s discomfort begins.',
    },
  ],
};

export default lesson;

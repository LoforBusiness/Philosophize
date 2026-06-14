import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'logic-arguments-18',
  slug: 'appeal-to-emotion-and-bandwagon',
  title: 'Feelings and the Crowd',
  description: "Fear, pity, and 'everyone agrees' can swing you without giving any real reason.",
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Scary music and "everyone agrees" are not reasons.',
      subtext: 'They move you powerfully while supplying zero logical support.',
      emoji: '😱',
    },
    {
      type: 'concept',
      title: 'Appeal to Emotion',
      body: 'Stirring fear, pity, or flattery in place of evidence. "Think of the frightened children — so the law must pass." The feeling is real, but it answers nothing about whether the claim is true.',
      visual: '💔',
      highlight: 'feeling in place of evidence',
    },
    {
      type: 'concept',
      title: 'The Bandwagon',
      body: 'Treating popularity as proof. "Millions already believe it, so it must be right." But a crowd can be wrong together. How many people hold a view is not evidence that the view is correct. Logicians call this ad populum.',
      visual: '📣',
      highlight: 'ad populum',
    },
    {
      type: 'quote',
      id: 'lq-logic-arguments-18',
      quote: 'The fact that an opinion has been widely held is no evidence whatever that it is not utterly absurd.',
      author: 'Bertrand Russell',
      era: '1929',
      work: 'Marriage and Morals',
      philosopherId: 'bertrand-russell',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you saw fallacies that dodge the argument.',
      body: 'Ad hominem attacked the speaker; the straw man attacked a fake version of the claim. Emotion and the crowd are the same move aimed at you — distractions that replace evidence about the content itself.',
      emoji: '🎭',
    },
    {
      type: 'dilemma',
      scenario: "A campaign ad pairs frightening music and a grieving family with the line: 'and millions already agree with us — don't be left behind.' You feel a surge of fear and a pull to belong.",
      prompt: 'Does any of this give you a reason to believe the claim?',
      choices: [
        { id: 'a', label: 'It is persuasive, so I should trust it' },
        { id: 'b', label: 'Moved, but given no actual reason' },
        { id: 'c', label: 'Depends on the claim being argued' },
      ],
      views: [
        {
          thinker: 'Bertrand Russell',
          stance: 'Popularity is no evidence of truth.',
          why: 'How many people hold an opinion says nothing about whether it is true. Set the crowd aside and judge the argument itself on its evidence.',
        },
        {
          thinker: 'David Hume',
          stance: 'Passion moves us to act, not to know.',
          why: 'For Hume, reason is "the slave of the passions" — passion drives action, but feeling fear cannot establish whether a factual claim is actually true.',
        },
        {
          thinker: 'Aristotle',
          stance: 'Pathos may accompany logos, never replace it.',
          why: 'Emotion is a fair tool of persuasion. But it must travel alongside real reasons (logos); used alone to skip the evidence, it is appeal to emotion.',
        },
      ],
      xpValue: 5,
    },
    {
      type: 'summary',
      title: 'Feelings and the Crowd, Named',
      keyPoints: [
        'Appeal to emotion swaps feeling for evidence',
        'Bandwagon treats popularity as proof (ad populum)',
        'Both move you while supplying no real reason',
        'Judge the argument, not the mood or the numbers',
      ],
      closingThought: 'Feel the pull, then ask: where is the actual reason?',
    },
  ],
};

export default lesson;

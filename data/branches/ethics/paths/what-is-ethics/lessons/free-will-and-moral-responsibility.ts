import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'ethics-ethics-16',
  slug: 'free-will-and-moral-responsibility',
  title: 'Could You Have Done Otherwise?',
  description: 'If every choice was caused, can anyone really be blamed? Enter compatibilism.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'If everything was caused, who is left to blame?',
      subtext: 'Your choices have causes. So does praise still belong to you, or to them?',
      emoji: '⛓️',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you saw blame start to wobble.',
      body: 'Moral luck showed outcomes we never controlled still sway judgment. Now go deeper: if causes reach all the way into the will itself, is anything left for us to own?',
      emoji: '🎲',
    },
    {
      type: 'concept',
      title: 'Three Answers to One Worry',
      body: 'Hard determinists say causation rules out free will, so no one is truly responsible. Libertarians keep responsibility by denying full causation. Compatibilists take a third road: causation is real, and yet freedom and responsibility survive.',
      visual: '🛤️',
      highlight: 'compatibilism',
    },
    {
      type: 'concept',
      title: 'Freedom Redefined',
      body: 'Hume offers a quieter freedom. To act freely is not to escape all causes — it is to act from your own desires, uncoerced. The prisoner is unfree; the unchained walker is free, even though both are caused.',
      visual: '🚶',
      highlight: 'acting without coercion',
    },
    {
      type: 'quote',
      id: 'lq-ethics-ethics-16-1',
      quote: 'By liberty, then, we can only mean a power of acting or not acting, according to the determinations of the will.',
      author: 'David Hume',
      era: '1748',
      work: 'An Enquiry Concerning Human Understanding',
      philosopherId: 'david-hume',
    },
    {
      type: 'example',
      title: 'Coercion Is the Real Enemy',
      scenario: 'You hand over your wallet because a robber holds a knife to you. Later you hand a friend the same cash to repay a loan. Both acts have causes. But only the first is forced. For Hume, the difference between unfree and free is not causation — it is the gun, the chains, the coercion.',
      source: 'Hume, Enquiry, Section VIII',
      emoji: '🔪',
    },
    {
      // The cinematic scene asks this one on the stage, by tapping the one thing
      // that differs between the two hand-overs (E37c).
      type: 'question',
      prompt: 'You hand over money at knifepoint, and later hand a friend the same sum to repay a loan. For a compatibilist, what makes only the second one free?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Nobody was coercing you', isCorrect: true },
          { id: 'b', text: 'The second act had no causes', isCorrect: false },
          { id: 'c', text: 'The two acts were different acts', isCorrect: false },
        ],
        explanation: 'Both acts are fully caused, so option B is not available to anyone — that is what makes compatibilism necessary in the first place. And the acts are the same act: same hand, same money. The only difference is the coercion, which is precisely why Hume relocates freedom from "uncaused" to "uncoerced".',
      },
    },
    {
      type: 'question',
      prompt: 'True or false: Compatibilists believe that because the universe is determined, no one is ever morally responsible.',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: false,
        explanation: 'False. That is hard determinism wearing the wrong name — a strawman of the view. Compatibilists accept determinism yet keep responsibility, redefining freedom as acting from your own uncoerced will. They part ways with hard determinists precisely on whether desert can survive causation.',
      },
    },
    {
      type: 'summary',
      title: 'What You Now Know',
      keyPoints: [
        'Responsibility seems to need some kind of freedom',
        'Hard determinism says causation kills both',
        'Compatibilists accept causation, keep responsibility',
        'For Hume, freedom means acting uncoerced',
      ],
      closingThought: 'Kant assumed a free, rational will. Hume answers: freedom was never the absence of causes — only the absence of chains.',
    },
  ],
};

export default lesson;

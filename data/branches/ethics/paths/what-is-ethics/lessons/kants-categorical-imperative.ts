import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'ethics-ethics-12',
  slug: 'kants-categorical-imperative',
  title: "Kant's One Rule For All Rules",
  description: 'Could your reason for acting become a law everyone follows? Kant dares you.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Before you act, ask: what if everyone did this?',
      subtext: 'Kant thought that single question could sort right from wrong, no calculator required.',
      emoji: '⚖️',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you saw duty versus results.',
      body: 'In the duty lens, an act is right because of the rule behind it, not its payoff. Kant takes that idea to its limit: a moral rule must hold for everyone, always, with no exceptions you sneak in for yourself.',
      emoji: '🧭',
    },
    {
      type: 'concept',
      title: 'The Universalizability Test',
      body: 'Kant calls your personal reason for acting a maxim. To test it, try to will it as a law everyone obeys. If the rule destroys itself when universalized, it fails. Lying fails: in a world where all may lie, promises mean nothing.',
      visual: '🌍',
      highlight: 'maxim',
    },
    {
      type: 'example',
      title: 'The Promise You Cannot Keep',
      scenario: 'You need money and consider promising to repay a loan you know you never can. Your maxim: break a promise when it suits me. Now universalize it. If everyone promised falsely whenever convenient, no one would trust a promise at all. The very act of promising would collapse. The maxim cannot become a universal law.',
      source: 'Kant, Groundwork of the Metaphysics of Morals (1785)',
      emoji: '🤝',
    },
    {
      type: 'quote',
      id: 'lq-ethics-ethics-12-1',
      quote: 'Act only according to that maxim whereby you can at the same time will that it should become a universal law.',
      author: 'Immanuel Kant',
      era: '1785',
      work: 'Groundwork of the Metaphysics of Morals',
      philosopherId: 'immanuel-kant',
    },
    {
      type: 'concept',
      title: 'Never Merely a Means',
      body: 'Kant gives the imperative a second form. Always treat humanity, in yourself and others, as an end in itself, never merely as a means. People are not tools for your goals. Deceiving the lender uses him as a mere instrument, ignoring his power to reason and consent.',
      visual: '👤',
      highlight: 'an end in itself',
    },
    {
      type: 'quote',
      id: 'lq-ethics-ethics-12-2',
      quote: 'So act that you treat humanity, whether in your own person or in that of another, always as an end and never merely as a means.',
      author: 'Immanuel Kant',
      era: '1785',
      work: 'Groundwork of the Metaphysics of Morals',
      philosopherId: 'immanuel-kant',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you weighed outcomes; Kant refuses to.',
      body: 'Last lesson, the utilitarian judged acts by their consequences. Kant judges the maxim itself. A good result cannot rescue a rule that contradicts itself when everyone follows it. Watch for results-reasoning sneaking back in.',
      emoji: '🔁',
    },
    {
      type: 'question',
      prompt: "True or false: Kant's rule says break a promise whenever the results are good.",
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: false,
        explanation: 'False. That smuggles in consequentialist thinking — judging by outcomes — which is exactly what Kant rejects. He tests the maxim, not the results. A universal license to break promises when convenient self-destructs: if all could break promises, promising would mean nothing.',
      },
    },
    {
      type: 'summary',
      title: 'What You Now Know',
      keyPoints: [
        'Test a maxim by willing it as universal law',
        'Rules that self-destruct when universalized fail',
        'Treat people as ends, never merely as means',
        'Kant judges the rule, not the outcome',
      ],
      closingThought: 'The strongest universalist asks one thing: could your reason for acting hold for everyone?',
    },
  ],
};

export default lesson;

import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'political-political-17',
  slug: 'why-obey-the-state',
  title: 'Why Should You Obey?',
  description: 'You never signed a contract. So what, if anything, obligates you to obey the law?',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'You never signed anything. So why obey?',
      subtext: 'No contract crossed your desk at birth — yet the law still binds you.',
      emoji: '✍️',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you saw when you may break the law.',
      body: 'Earlier you asked when civil disobedience is justified, and imagined a social contract. Now flip both: not when you may disobey, but why you owe obedience at all.',
      emoji: '🔁',
    },
    {
      type: 'concept',
      title: 'The Problem of Political Obligation',
      body: 'Political obligation asks why we must obey the state. The classic answer was consent: you agreed. But almost no one ever actually agreed to anything. So if consent never happened, where could a duty to obey come from?',
      visual: '🏛️',
      highlight: 'political obligation',
    },
    {
      type: 'quote',
      id: 'lq-political-political-17-1',
      quote: 'Can we seriously say, that a poor peasant or artizan has a free choice to leave his country, when he knows no foreign language or manners?',
      author: 'David Hume',
      era: '1748',
      work: 'Of the Original Contract',
      philosopherId: 'david-hume',
    },
    {
      type: 'concept',
      title: 'The Principle of Fair Play',
      body: 'Rawls and H.L.A. Hart offer another route. If you accept the benefits of a cooperative scheme — roads, courts, safety — you owe your share of its burdens. No signature, no consent. Taking the benefits is what generates the duty.',
      visual: '🤝',
      highlight: 'fair play',
    },
    {
      type: 'example',
      title: 'The Shared Well',
      scenario: 'A village digs a well together, taking turns hauling water. A newcomer never agreed to the arrangement, but drinks from the well daily. When his turn comes, he refuses: "I never signed up." Fair play says he free-rides — he enjoys the cooperation while dodging its cost. Accepting the benefit is what binds him.',
      source: 'After H.L.A. Hart and John Rawls',
      emoji: '🪣',
    },
    {
      // The cinematic scene asks this one on the stage, by tapping what puts the
      // newcomer on the rota (E37c).
      type: 'question',
      prompt: 'The newcomer never agreed to the well\'s rota but drinks from it daily. On fair-play theory, what creates his duty?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Accepting the benefit of what others produced', isCorrect: true },
          { id: 'b', text: 'His signature on the arrangement', isCorrect: false },
          { id: 'c', text: 'A majority of the village voting for it', isCorrect: false },
        ],
        explanation: 'Fair play deliberately does without both of the others. There is no signature — that is the whole point of the case — and a vote he lost would not by itself bind him either. What binds him is that he takes the water a cooperative scheme produces. Hume had already shown consent could not do this work, since almost nobody is ever genuinely free to refuse.',
      },
    },
    {
      type: 'question',
      prompt: "True or false: Because you never signed a social contract, fair-play theory says you have no obligation to obey any law.",
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: false,
        explanation: 'False. This is the tacit-consent assumption — and a non sequitur. Fair-play obligation never required a signature or even consent; accepting the benefits of a cooperative scheme is what generates the duty. That is exactly why Hume mocked resting obedience on "consent" no one truly gave.',
      },
    },
    {
      type: 'summary',
      title: 'What You Now Know',
      keyPoints: [
        'Political obligation asks why we must obey',
        'Consent theory fails: almost no one consents',
        'Fair play: accept benefits, owe your share',
        'No signature needed for the duty',
      ],
      closingThought: 'You may never have signed — but if you have taken the benefits, you may already owe your share.',
    },
  ],
};

export default lesson;

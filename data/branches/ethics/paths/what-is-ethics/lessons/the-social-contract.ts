import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'ethics-ethics-14',
  slug: 'the-social-contract',
  title: 'Why Obey Any Rules at All?',
  description: 'Imagine no laws, no police, no state. Would you invent them? Three thinkers did.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'No laws. No police. No state. Would you build one?',
      subtext: 'Strip away every rule, then ask which ones you would choose to bring back.',
      emoji: '📜',
    },
    {
      type: 'concept',
      title: 'The State of Nature',
      body: 'Imagine life before any government — the "state of nature." Social contract theory says rules are legitimate only because rational people would agree to leave that state behind, trading total freedom for the safety and order a shared authority provides.',
      visual: '🤝',
      highlight: 'the social contract',
    },
    {
      type: 'quote',
      id: 'lq-ethics-ethics-14-1',
      quote: 'Man is born free, and everywhere he is in chains.',
      author: 'Jean-Jacques Rousseau',
      era: '1762',
      work: 'The Social Contract',
      philosopherId: 'jean-jacques-rousseau',
    },
    {
      type: 'example',
      title: 'Three Thinkers, Three Bargains',
      scenario: 'Hobbes saw the state of nature as a war of all against all — life "nasty, brutish, and short" — so we hand a strong sovereign almost total power for peace. Locke saw it as freer, the deal made only to protect life, liberty, and property. Rousseau saw the bargain corrupted unless it expresses the people themselves.',
      source: 'Hobbes, Leviathan (1651)',
      emoji: '⚖️',
    },
    {
      type: 'dilemma',
      scenario:
        'Your society is offered lasting peace: surrender some liberties to a strong central authority and order is guaranteed. Refuse, and you keep every freedom but risk the chaos of having no enforced rules at all. The contract is on the table, waiting for your signature.',
      prompt: 'Do you sign the contract?',
      choices: [
        { id: 'sign', label: 'Sign — security is worth the cost' },
        { id: 'refuse', label: 'Refuse — liberty must not be sold' },
      ],
      views: [
        {
          thinker: 'Thomas Hobbes',
          stance: 'sign without hesitation',
          why: 'Without a sovereign, life is "nasty, brutish, and short." Almost any authority beats the war of all against all, so trade liberty for security and obey.',
        },
        {
          thinker: 'John Locke',
          stance: 'sign, but only conditionally',
          why: 'The contract exists to protect natural rights to life, liberty, and property. A state that violates them breaks the deal — and may rightfully be resisted.',
        },
        {
          thinker: 'Jean-Jacques Rousseau',
          stance: 'sign only if you remain the author',
          why: 'Legitimate authority must express the "general will" — the people ruling themselves. A master imposed from above is not a contract; it is chains.',
        },
      ],
      xpValue: 5,
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you met Rawls behind the veil of ignorance.',
      body: 'Rawls belongs to this same contractarian family. Where Hobbes, Locke, and Rousseau imagined a deal struck in the state of nature, Rawls updates it: choose the rules from an original position, blind to who you will become.',
      emoji: '🕶️',
    },
    {
      type: 'quote',
      id: 'lq-ethics-ethics-14-2',
      quote: 'The life of man, solitary, poor, nasty, brutish, and short.',
      author: 'Thomas Hobbes',
      era: '1651',
      work: 'Leviathan',
      philosopherId: 'thomas-hobbes',
    },
    {
      // The cinematic scene asks this one on the stage, by tapping what the wall is
      // made of (E37c) — same concept, re-cut for the staging.
      type: 'question',
      prompt: 'On the social contract picture, where does a legitimate government get its authority from?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Liberties the governed handed over', isCorrect: true },
          { id: 'b', text: 'Power the ruler holds in his own right', isCorrect: false },
          { id: 'c', text: 'The fear of punishment it can inflict', isCorrect: false },
        ],
        explanation: 'The whole force of the idea is that authority is BUILT from surrendered liberty, so it has exactly as much as was surrendered and no more. Option B is the older answer the contract was invented to replace, and it is the tempting one because it describes how most historical states actually behaved. Option C confuses what makes a state obeyed with what makes it legitimate.',
      },
    },
    {
      type: 'question',
      prompt: 'Both Hobbes and Locke endorse a social contract. What is their deepest disagreement?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Whether citizens may resist a state that abuses its power', isCorrect: true },
          { id: 'b', text: 'Whether any government should exist at all', isCorrect: false },
          { id: 'c', text: 'Whether the contract is an actual signed document', isCorrect: false },
          { id: 'd', text: 'Whether people lived in a state of nature before laws', isCorrect: false },
        ],
        explanation: 'Beware the false-dilemma trap of (b): both accept government, so "no state at all" misses the real split. Their clash is over limits — Locke says a state that violates your rights forfeits obedience; Hobbes fears that any right to resist invites the chaos the contract was meant to end.',
      },
    },
    {
      type: 'summary',
      title: 'What You Now Know',
      keyPoints: [
        'Rules gain authority from an imagined agreement',
        'Hobbes: trade liberty for security and peace',
        'Locke: obey only while rights are protected',
        'Rousseau: legitimacy means the people rule themselves',
      ],
      closingThought: 'The state you live in is, in a sense, a contract you never signed. Would you?',
    },
  ],
};

export default lesson;

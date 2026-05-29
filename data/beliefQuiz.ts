export interface BeliefOption {
  label: string; // a first-person belief statement, <= 14 words, plain language, no jargon
  philosopherIds: string[]; // 1–3 ids from the ALLOWED list that this answer aligns with
}

export interface BeliefQuestion {
  id: string; // kebab-case, e.g. 'free-will'
  prompt: string; // the question, <= 12 words
  options: BeliefOption[]; // EXACTLY 4 options
}

export const BELIEF_QUESTIONS: BeliefQuestion[] = [
  {
    id: 'morality',
    prompt: 'Where do right and wrong come from?',
    options: [
      {
        label: 'There are real moral rules everyone should follow, no matter what.',
        philosopherIds: ['immanuel-kant', 'thomas-aquinas'],
      },
      {
        label: 'What is right is whatever brings the most happiness to people.',
        philosopherIds: ['john-stuart-mill', 'epicurus'],
      },
      {
        label: 'Morality is just human invention that the powerful use to control us.',
        philosopherIds: ['friedrich-nietzsche', 'karl-marx'],
      },
      {
        label: 'Good behavior is learned through habit, balance, and good character.',
        philosopherIds: ['aristotle', 'confucius'],
      },
    ],
  },
  {
    id: 'free-will',
    prompt: 'Do we truly have free will?',
    options: [
      {
        label: 'Yes, I am completely free and fully responsible for my choices.',
        philosopherIds: ['jean-paul-sartre', 'simone-de-beauvoir'],
      },
      {
        label: 'No, everything follows from prior causes; freedom is an illusion.',
        philosopherIds: ['baruch-spinoza', 'david-hume'],
      },
      {
        label: 'My reason can rise above impulse and make me genuinely free.',
        philosopherIds: ['immanuel-kant', 'rene-descartes'],
      },
      {
        label: 'I cannot control events, only how I react to them.',
        philosopherIds: ['marcus-aurelius'],
      },
    ],
  },
  {
    id: 'meaning',
    prompt: 'What makes life meaningful?',
    options: [
      {
        label: 'Enjoying simple pleasures and calm friendships, free from needless fear.',
        philosopherIds: ['epicurus'],
      },
      {
        label: 'Living with virtue and accepting whatever fate hands me calmly.',
        philosopherIds: ['marcus-aurelius', 'aristotle'],
      },
      {
        label: 'Creating my own purpose, since life has no built-in meaning.',
        philosopherIds: ['jean-paul-sartre', 'friedrich-nietzsche'],
      },
      {
        label: 'Constantly questioning myself, because an unexamined life is not worth living.',
        philosopherIds: ['socrates'],
      },
    ],
  },
  {
    id: 'knowledge',
    prompt: 'Where does real knowledge come from?',
    options: [
      {
        label: 'From pure reason and ideas I can think through in my mind.',
        philosopherIds: ['rene-descartes', 'plato'],
      },
      {
        label: 'From my senses and experience; I learn by observing the world.',
        philosopherIds: ['john-locke', 'david-hume'],
      },
      {
        label: 'From both reason and experience working together to shape what I see.',
        philosopherIds: ['immanuel-kant'],
      },
      {
        label: 'From carefully studying real things in nature, not abstract ideals.',
        philosopherIds: ['aristotle'],
      },
    ],
  },
  {
    id: 'society',
    prompt: 'Who should hold power in society?',
    options: [
      {
        label: 'The wisest and most knowledgeable people should guide everyone else.',
        philosopherIds: ['plato', 'confucius'],
      },
      {
        label: 'The people themselves; government exists only with our consent.',
        philosopherIds: ['john-locke', 'jean-jacques-rousseau'],
      },
      {
        label: 'Workers should own things together, ending the divide between rich and poor.',
        philosopherIds: ['karl-marx'],
      },
      {
        label: 'Anyone, as long as people stay free to live their own way.',
        philosopherIds: ['john-stuart-mill'],
      },
    ],
  },
  {
    id: 'the-self',
    prompt: 'What stays the same as you change?',
    options: [
      {
        label: 'My thinking mind; the fact that I think proves I exist.',
        philosopherIds: ['rene-descartes'],
      },
      {
        label: 'Nothing fixed; the self is just a bundle of passing experiences.',
        philosopherIds: ['david-hume'],
      },
      {
        label: 'My soul, which is more real and lasting than my body.',
        philosopherIds: ['plato', 'thomas-aquinas'],
      },
      {
        label: 'I become who I am through my choices and how others see me.',
        philosopherIds: ['simone-de-beauvoir', 'georg-hegel'],
      },
    ],
  },
  {
    id: 'suffering',
    prompt: 'How should you handle suffering and desire?',
    options: [
      {
        label: 'Stay calm and accept what I cannot change with inner peace.',
        philosopherIds: ['marcus-aurelius'],
      },
      {
        label: 'Want less; most pain comes from chasing things I do not need.',
        philosopherIds: ['epicurus'],
      },
      {
        label: 'Embrace hardship; struggle makes me stronger and more fully myself.',
        philosopherIds: ['friedrich-nietzsche'],
      },
      {
        label: 'Treat my desires fairly so I never use other people as tools.',
        philosopherIds: ['immanuel-kant', 'confucius'],
      },
    ],
  },
  {
    id: 'reality',
    prompt: 'Can we truly know reality?',
    options: [
      {
        label: 'The world I see is just a shadow of a deeper, truer reality.',
        philosopherIds: ['plato'],
      },
      {
        label: 'I can only know how things appear to me, never the thing itself.',
        philosopherIds: ['immanuel-kant', 'david-hume'],
      },
      {
        label: 'Reality is one single connected whole, and I am a part of it.',
        philosopherIds: ['baruch-spinoza', 'georg-hegel'],
      },
      {
        label: 'Many of our deep questions are just confusions about how we use words.',
        philosopherIds: ['ludwig-wittgenstein'],
      },
    ],
  },
];

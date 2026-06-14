import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'epistemology-knowledge-18',
  slug: 'updating-beliefs-with-evidence',
  title: 'How Much Should One Fact Change Your Mind?',
  description: 'Thinking in probabilities, and the trap of ignoring the base rate.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'A positive test result need not mean you are sick.',
      subtext: 'Belief is not on or off. It comes in degrees, and evidence should nudge those degrees.',
      emoji: '🎚️',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you learned to hold beliefs without certainty.',
      body: 'Fallibilism let us know without being sure. Now we make that idea precise: treat each belief as a degree of confidence, and update it by how strongly fresh evidence actually speaks.',
      emoji: '📊',
    },
    {
      type: 'concept',
      title: 'Thinking in Probabilities',
      body: 'Bayesian thinking starts from a prior, how likely a claim was before, then revises it with new evidence. Strong evidence shifts you a lot; weak evidence, only a little. Crucially, you must weigh how common the claim was to begin with.',
      visual: '🔬',
      highlight: 'prior',
    },
    {
      type: 'example',
      title: 'The Rare Disease',
      scenario:
        'A disease affects 1 in 1,000 people. A test is 99% accurate. You test positive. It feels like near-certain bad news. But among 1,000 people, roughly 10 healthy people also test positive for every 1 who is truly sick. So a positive result still leaves you probably fine.',
      source: 'A classic base-rate puzzle',
      emoji: '🧬',
    },
    {
      type: 'quote',
      id: 'lq-epistemology-knowledge-18-1',
      quote: 'It is undesirable to believe a proposition when there is no ground whatever for supposing it true.',
      author: 'Bertrand Russell',
      era: '1928',
      work: 'On the Value of Scepticism',
      philosopherId: 'bertrand-russell',
    },
    {
      type: 'question',
      prompt: 'You test positive for a very rare disease on an accurate test and conclude you almost certainly have it. What error is this?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'The base-rate fallacy: ignoring how rare the disease is to begin with', isCorrect: true },
          { id: 'b', text: 'No error at all, since the test is highly accurate', isCorrect: false },
          { id: 'c', text: 'The gambler’s fallacy: expecting past results to balance out', isCorrect: false },
          { id: 'd', text: 'A straw man: distorting what the test is really claiming', isCorrect: false },
        ],
        explanation:
          'This is the base-rate fallacy. Option (b) is tempting because the test really is accurate, but it ignores the prior: when a disease is extremely rare, false positives can vastly outnumber true ones, so a single positive is far weaker evidence than it feels.',
      },
    },
    {
      type: 'summary',
      title: 'Belief by Degrees',
      keyPoints: [
        'Treat belief as a degree of confidence',
        'Update from a prior using new evidence',
        'Always weigh the base rate first',
        'Strong evidence moves you more than weak',
      ],
      closingThought: 'Changing your mind in proportion to the evidence is not weakness. It is exactly what careful thinking looks like.',
    },
  ],
};

export default lesson;

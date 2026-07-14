import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'logic-arguments-16',
  slug: 'correlation-vs-causation',
  title: 'After It Is Not Because Of It',
  description:
    'Two things moving together, or one following another, does not prove one caused the other.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Ice cream sales rise. So do drownings. Coincidence?',
      subtext: 'Two patterns climb together every summer. One does not cause the other.',
      emoji: '🍦',
    },
    {
      type: 'concept',
      title: 'When Sequence Pretends to Be Cause',
      body:
        'Because B follows A, we assume A caused B. The Latin name is post hoc ergo propter hoc — "after this, therefore because of this." But a hidden third factor, pure coincidence, or even reverse causation can explain the link just as well.',
      visual: '🔗',
      highlight: 'post hoc ergo propter hoc',
    },
    {
      type: 'example',
      title: 'The Lurking Variable',
      scenario:
        'Ice cream sales and drowning deaths both spike in the same months. Does ice cream drown people? No. Summer heat drives both: hot days sell more cones and send more swimmers into the water. The real cause hides behind the correlation — a lurking variable producing both effects at once.',
      emoji: '☀️',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you saw induction has limits.',
      body:
        'A small sample was the obvious trap. This one is subtler: even a real, repeated correlation across thousands of cases still does not prove cause. Reliable pattern, unreliable conclusion.',
      emoji: '📈',
    },
    {
      type: 'quote',
      id: 'lq-logic-arguments-16-1',
      quote:
        'There is no object which implies the existence of any other if we consider these objects in themselves.',
      author: 'David Hume',
      era: '1748',
      work: 'An Enquiry Concerning Human Understanding',
      philosopherId: 'david-hume',
    },
    {
      type: 'question',
      prompt: 'Rank these by strength of causal evidence — weakest first, strongest last.',
      xpValue: 5,
      interaction: {
        type: 'sort',
        items: [
          { id: 'correlation-only', text: 'Ice cream sales and drownings rise together.' },
          { id: 'post-hoc-single', text: 'He took the herb; his cold cleared in a week.' },
          {
            id: 'controlled-trial',
            text: 'A randomized trial isolated the drug as the only differing variable.',
          },
        ],
        correctOrder: ['post-hoc-single', 'correlation-only', 'controlled-trial'],
        explanation:
          'The herb case is weakest — post hoc ergo propter hoc: a single uncontrolled case where recovery merely followed treatment. The repeated correlation is a more reliable pattern, but a lurking variable (summer heat) could drive both. The randomized trial is strongest because it holds everything else fixed, so the drug is the only thing that could have made the difference.',
      },
    },
    {
      type: 'summary',
      title: 'What You Now Know',
      keyPoints: [
        'Correlation is not causation.',
        'Post hoc: cause inferred from mere sequence.',
        'Watch for the lurking third variable.',
        'Controlled trials isolate the real cause.',
      ],
      closingThought:
        'Next time two things move together, ask what unseen factor might be moving both.',
    },
  ],
};

export default lesson;

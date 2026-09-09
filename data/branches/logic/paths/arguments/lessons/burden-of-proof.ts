import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'logic-arguments-29',
  slug: 'burden-of-proof',
  title: 'Who Has to Prove It?',
  description: 'The burden of proof: why "you can\'t disprove it" is one of reasoning\'s sneakiest moves.',
  estimatedMinutes: 6,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'A teapot orbits the Sun. Prove me wrong.',
      subtext: 'You can\'t — but that doesn\'t make it true. Whoever makes the claim owes the evidence.',
      emoji: '🫖',
    },
    {
      type: 'concept',
      title: 'The Burden of Proof',
      body: 'The burden of proof is the obligation to back up a claim. It falls on whoever asserts something, not on whoever doubts it. A claim with no support isn\'t "true until disproven" — it\'s simply unsupported, and can be set aside until evidence arrives.',
      visual: '🏋️',
      highlight: 'falls on whoever asserts',
    },
    {
      type: 'concept',
      title: 'The Default Position',
      body: 'When no one has proven anything yet, we rest at the null position: withhold belief. "I haven\'t seen good reason to accept this" is the resting state, not a rival claim needing its own proof. Shifting the burden onto the doubter is a classic dodge.',
      visual: '⚪',
      highlight: 'withhold belief',
    },
    {
      type: 'quote',
      id: 'lq-logic-arguments-29-1',
      quote: 'If I were to assert that a china teapot revolves about the sun, nobody would be able to disprove my assertion.',
      author: 'Bertrand Russell',
      era: '1952',
      work: 'Is There a God?',
      philosopherId: 'bertrand-russell',
    },
    {
      type: 'question',
      prompt: 'Somebody keeps an invisible dragon in the garage and explains away every test. Where does the burden sit?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'On the claimant, who has to produce evidence', isCorrect: true },
          { id: 'b', text: 'On the doubter, who has to disprove it', isCorrect: false },
          { id: 'c', text: 'Split evenly, since neither side can prove it', isCorrect: false },
          { id: 'd', text: 'Nowhere, because the claim is unfalsifiable', isCorrect: false },
        ],
        explanation: 'On the claimant. Asserting is what creates the debt, and doubt takes on none of it. Splitting the burden evenly would make every unsupported claim halfway to true, and a claim no test can reach is the same picture as an empty garage.',
      },
    },
    {
      type: 'question',
      prompt: 'A friend argues, "Ghosts are real — you can\'t prove they aren\'t." What\'s wrong?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'They shift the burden; the claimant owes the evidence', isCorrect: true },
          { id: 'b', text: 'Nothing — unfalsifiable claims are true by default', isCorrect: false },
          { id: 'c', text: 'Nothing — you really should try to disprove it', isCorrect: false },
          { id: 'd', text: 'They committed a hasty generalization', isCorrect: false },
        ],
        explanation: 'It\'s tempting to feel cornered, as if you must now disprove ghosts. But that\'s the burden-shifting trick. The person asserting ghosts exist carries the burden; "you can\'t disprove it" never converts a guess into a fact.',
      },
    },
    {
      type: 'summary',
      title: 'Who Has to Prove It?',
      keyPoints: [
        'The burden falls on whoever makes the claim',
        'The default is to withhold belief, not assume truth',
        '"You can\'t disprove it" shifts the burden unfairly',
        'No evidence means unsupported, not proven',
      ],
      closingThought: 'Never let someone make their guess your problem to refute. Ask them for the proof.',
    },
  ],
};

export default lesson;

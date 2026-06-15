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
      type: 'dilemma',
      scenario: 'Someone claims an invisible dragon lives in their garage. Every test you propose, they explain away: it\'s heatless, floats above flour, gives off no sound. They insist that since you cannot prove it isn\'t there, you should believe it is.',
      prompt: 'Where does the burden of proof sit?',
      choices: [
        { id: 'a', label: 'On the claimant — they must show the dragon exists' },
        { id: 'b', label: 'On the doubter — disprove the dragon or accept it' },
        { id: 'c', label: 'Shared equally between both sides' },
      ],
      views: [
        {
          thinker: 'Carl Sagan',
          stance: 'The claimant must produce evidence.',
          why: 'A claim immune to every test is indistinguishable from no dragon at all. Extraordinary claims require extraordinary evidence — the absence of disproof is not presence of proof.',
        },
        {
          thinker: 'Bertrand Russell',
          stance: 'Unfalsifiable claims default to disbelief.',
          why: 'If a claim cannot in principle be checked, the rational resting point is to withhold assent. We are not obliged to believe everything we cannot refute, or belief becomes worthless.',
        },
        {
          thinker: 'W. K. Clifford',
          stance: 'It is wrong to believe on insufficient evidence.',
          why: 'Belief without proof corrupts the mind and society. Until the claimant meets their burden, suspending judgement is not just allowed — it is the honest duty of the inquirer.',
        },
      ],
      xpValue: 5,
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

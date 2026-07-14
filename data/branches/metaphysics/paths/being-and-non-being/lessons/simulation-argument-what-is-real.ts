import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'metaphysics-being-20',
  slug: 'simulation-argument-what-is-real',
  title: 'Is This Real? (And What Would That Mean?)',
  description: "If we might be in a simulation, what does 'real' even mean? A capstone.",
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'A clean statistical argument says you are probably simulated.',
      subtext: 'Not science fiction — a careful piece of probability reasoning.',
      emoji: '🖥️',
    },
    {
      type: 'concept',
      title: "Bostrom's Simulation Argument",
      body: 'If advanced civilizations can run vast numbers of detailed ancestor-simulations, then simulated minds would vastly outnumber original ones. So a random conscious being is far likelier to be simulated than not — unless such civilizations never come, or never bother.',
      visual: '🌐',
      highlight: 'ancestor-simulations',
    },
    {
      type: 'example',
      title: "The Trilemma, Not a Prediction",
      scenario: 'Bostrom does not flatly claim we are simulated. He argues one of three things must be true: almost no civilization reaches that power; or those that do run almost no such simulations; or we are almost certainly living in one. The interesting move is ruling out only two doors.',
      source: 'Bostrom, "Are You Living in a Computer Simulation?" (2003)',
      emoji: '🚪',
    },
    {
      type: 'quote',
      id: 'lq-metaphysics-being-20-1',
      quote: "A technologically mature 'posthuman' civilization would have enormous computing power... we are almost certainly living in a computer simulation.",
      author: 'Nick Bostrom',
      era: 'c. 2003',
      work: 'Are You Living in a Computer Simulation?',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you saw that "real" was never a simple word.',
      body: "You have asked what counts as real; met Descartes doubting everything but his own thinking; and seen that from the inside, experience is undeniable. The simulation question gathers all three threads at once.",
      emoji: '🧵',
    },
    {
      type: 'dilemma',
      scenario: 'Imagine a flawless lifelong simulation: physics, friends, pain, and beauty are all indistinguishable from base reality. You can never run a test that reveals the difference, because every test runs inside the system too. A thinker asks you, plainly: is the world you live in real?',
      prompt: 'Does being simulated make your world unreal?',
      choices: [
        { id: 'a', label: 'Yes — if it is simulated, none of it is truly real' },
        { id: 'b', label: 'No — a coherent, lived-in world is real enough' },
        { id: 'c', label: 'The probability and the realness are two separate questions' },
      ],
      views: [
        {
          thinker: 'Nick Bostrom',
          stance: 'One of three doors — and realness is a separate question.',
          why: 'His trilemma is about probability, not metaphysics. Even if we are simulated, the simulated world still has its own consistent laws and contents. How probable it is says nothing, by itself, about whether it counts as real.',
        },
        {
          thinker: 'Rene Descartes',
          stance: 'Even a deceiving demon cannot erase the thinker.',
          why: 'Suppose an evil genius fakes the whole world. The deception still requires someone being deceived. "I think, therefore I am" survives any simulation — your existence as a thinking thing is the one thing the trick cannot fake away.',
        },
        {
          thinker: 'Idealist (Berkeley)',
          stance: 'To be is to be perceived — so the world just is real.',
          why: 'If reality was always a matter of coherent, lawful experience rather than hidden stuff behind it, then a perfectly experienced world meets every test for being real. "Simulated" would name how it is run, not whether it counts.',
        },
      ],
      xpValue: 5,
    },
    {
      type: 'summary',
      title: 'What You Now Know',
      keyPoints: [
        'The simulation argument is a trilemma, not a prediction',
        'Probability of simulation differs from the question of realness',
        'Cartesian doubt leaves the thinker standing',
        'A fully lived world may just be real',
      ],
      closingThought: "You began this path asking what counts as real. You end it holding a sharper tool: whether the world is simulated, the question of what 'real' means is yours to answer from the inside.",
    },
  ],
};

export default lesson;

import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'metaphysics-being-26',
  slug: 'emergence-and-reduction',
  title: 'Is the Whole More Than Its Parts?',
  description: 'Water puts out fire, yet hydrogen burns and oxygen feeds flame. Where did wetness come from?',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Two flammable gases combine — and you can drink it.',
      subtext: 'Where did wetness come from? Neither gas had it.',
      emoji: '💧',
    },
    {
      type: 'concept',
      title: 'Reduction: Nothing But the Parts',
      body: 'The reductionist says a whole is fully explained by its parts and how they are arranged. Water just is H₂O molecules behaving as molecules do; "wetness" is shorthand for how trillions of them slide past one another. Nothing new is added — break it down far enough and the mystery dissolves.',
      visual: '🔬',
      highlight: 'nothing but the parts',
    },
    {
      type: 'concept',
      title: 'Emergence: Something Genuinely New',
      body: 'The emergentist says some wholes have features their parts lack and that you could not predict from the parts alone. Wetness, life, a traffic jam, perhaps consciousness — these arise from the parts yet seem to be new in their own right, with powers of their own.',
      visual: '🌀',
      highlight: 'something genuinely new',
    },
    {
      type: 'example',
      title: 'The Traffic Jam',
      scenario: 'No single car is a traffic jam. Each driver only brakes a little behind the car ahead. Yet a wave of stoppage ripples backward down the highway, sometimes with no crash or obstacle at all. The jam moves, has a speed and direction, and behaves by its own rules — though it is made of nothing but cars and brakes.',
      emoji: '🚗',
    },
    {
      type: 'quote',
      id: 'lq-metaphysics-being-26-1',
      quote: 'The whole becomes not merely more, but very different from the sum of its parts.',
      author: 'Philip W. Anderson',
      era: '1972',
      work: 'More Is Different (Science)',
    },
    {
      type: 'reinforcement',
      callout: 'Watch the two senses of "emergence."',
      body: 'Weak emergence: the whole has surprising features, but in principle they follow from the parts — like the traffic jam. Strong emergence: the whole has features that genuinely could not be derived from the parts, even in principle. The strong claim is the bold, contested one.',
      emoji: '⚖️',
    },
    {
      type: 'question',
      prompt: 'A friend says: "Water proves strong emergence — wetness is new, so reduction fails." Why is this too fast?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Wetness is fully derivable from molecular behaviour, so it is at most weak emergence', isCorrect: true },
          { id: 'b', text: 'Water is not really made of hydrogen and oxygen', isCorrect: false },
          { id: 'c', text: 'Wetness is an illusion with no basis at all', isCorrect: false },
          { id: 'd', text: 'Reduction was already proven impossible', isCorrect: false },
        ],
        explanation: 'This conflates "surprising" with "irreducible." Wetness was not obvious in advance, but chemistry does explain it from how H₂O molecules bond and flow — that is weak emergence. Strong emergence needs a feature that no amount of knowledge of the parts could derive. Water does not clearly give us that.',
      },
    },
    {
      type: 'dilemma',
      scenario: 'A neuroscientist maps every neuron firing while you taste coffee. She can predict your behaviour perfectly. Yet the felt taste — what it is like for you — seems absent from her wiring diagram.',
      prompt: 'Is conscious experience reducible to the neurons?',
      choices: [
        { id: 'a', label: 'Yes — it just is the neural activity, fully reducible' },
        { id: 'b', label: 'No — experience strongly emerges, new and irreducible' },
        { id: 'c', label: 'It weakly emerges; we just lack the full derivation' },
      ],
      views: [
        {
          thinker: 'Reductionist',
          stance: 'Experience is identical to brain activity.',
          why: 'There is no extra ingredient. The taste of coffee is a pattern of neural firing, described in two vocabularies. Once neuroscience is complete, nothing about the experience will be left unexplained.',
        },
        {
          thinker: 'Strong emergentist',
          stance: 'Consciousness is new and irreducible.',
          why: 'You can know every neuron and still not derive what the taste is like — recall the hard problem of Lesson 17. Experience arises from the brain yet has its own reality, not fixed in advance by the physical facts.',
        },
        {
          thinker: 'Weak emergentist',
          stance: 'It emerges but is in principle derivable.',
          why: 'Consciousness is surprising and high-level, like the traffic jam, but ultimately follows from the parts once we understand the organisation. The gap is in our knowledge, not in nature.',
        },
      ],
      xpValue: 5,
    },
    {
      type: 'summary',
      title: 'Parts, Wholes, and What Is New',
      keyPoints: [
        'Reduction: the whole is nothing but its parts',
        'Emergence: wholes can have genuinely new features',
        'Weak: surprising but derivable; strong: irreducible',
        'Consciousness is the hardest test case',
      ],
      closingThought: 'You now know the line that decides it: not "is it surprising?" but "could the parts have told us?"',
    },
  ],
};

export default lesson;

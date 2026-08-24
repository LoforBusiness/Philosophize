import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'ethics-ethics-20',
  slug: 'future-generations-and-the-environment',
  title: 'Ethics Beyond the Horizon',
  description: "The people most affected by your choices today aren't born yet. Capstone.",
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'The people you affect most have not been born.',
      subtext: 'They cannot vote, protest, or thank you. Do you still owe them anything?',
      emoji: '🌱',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you watched the moral circle keep widening.',
      body: 'You began with duties to yourself and your tribe. Then the social contract, then Singer’s circle reaching every sentient being alive. This capstone takes the final step: forward, across time, to people who do not yet exist.',
      emoji: '🔭',
    },
    {
      type: 'concept',
      title: 'The Imperative of Responsibility',
      body: 'Hans Jonas argued that our technological power now reaches centuries ahead, so ethics must too. We can poison a planet our great-grandchildren must inhabit. New power, he said, demands a new duty: to keep genuine human life possible at all.',
      visual: '⚖️',
      highlight: 'the imperative of responsibility',
    },
    {
      type: 'quote',
      id: 'lq-ethics-ethics-20-1',
      quote: 'Act so that the effects of your action are compatible with the permanence of genuine human life.',
      author: 'Hans Jonas',
      era: '1979',
      work: 'The Imperative of Responsibility',
    },
    {
      type: 'example',
      title: 'A Warning Across Ten Thousand Years',
      scenario: 'Nuclear waste stays deadly for millennia, far longer than any language has survived. Engineers seriously debate how to warn humans who will not speak English, or read at all. The task assumes a duty to strangers separated from us by a hundred centuries.',
      source: 'Hans Jonas, The Imperative of Responsibility (1979)',
      emoji: '☢️',
    },
    {
      type: 'question',
      prompt: 'Sort these frameworks by how far each extends the moral circle, from narrowest to widest reach.',
      xpValue: 5,
      interaction: {
        type: 'sort',
        items: [
          { id: 'contract', text: 'Social contract: binds present parties who can mutually agree' },
          { id: 'singer-circle', text: 'Singer’s expanding circle: every sentient being alive now' },
          { id: 'jonas', text: 'Jonas’s imperative: the unborn and the biosphere itself' },
        ],
        correctOrder: ['contract', 'singer-circle', 'jonas'],
        explanation:
          'Each step widens who counts. The contract reaches only those who can bargain today; Singer extends concern to all the living who can suffer; Jonas reaches furthest, to people not yet born, whom no contract or present-tense calculus can easily include. Seen together, this is the whole path’s arc.',
      },
    },
    {
      // (E37c) The scene asks two graded questions; the data file has to ask the
      // same two. This mirrors the deck question in components/lesson/cinematic.
      type: 'question',
      prompt: 'Should a government apply any discount at all to costs falling centuries from now?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Yes, for uncertainty and rising wealth — but not for the date itself', isCorrect: true },
          { id: 'b', text: 'No, never discount anything for any reason', isCorrect: false },
          { id: 'c', text: 'Yes, because distant people are less real to us', isCorrect: false },
          { id: 'd', text: 'Yes, because they cannot vote in this election', isCorrect: false },
        ],
        explanation: 'Some discounting is defensible: a distant benefit is less certain, and later people may be richer, so a pound buys less good. Those are reasons with numbers behind them. What nobody has defended is a PURE time preference — a rate applied to the date alone. Parfit’s point is that when the future arrives, those costs will be no less real.',
      },
    },
    {
      type: 'summary',
      title: 'How Far the Circle Has Widened',
      keyPoints: [
        'Our power now reaches centuries into the future',
        'Jonas: new power demands a new duty',
        'We can owe duties to people not yet born',
        'The moral circle widened from self to the unborn',
      ],
      closingThought: 'You began this path drawing a small circle. Look how far it now reaches, both in space and in time.',
    },
  ],
};

export default lesson;

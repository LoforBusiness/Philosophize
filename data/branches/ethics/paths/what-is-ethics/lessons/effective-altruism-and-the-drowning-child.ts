import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'ethics-ethics-23',
  slug: 'effective-altruism-and-the-drowning-child',
  title: 'The Child In The Pond',
  description: 'You would ruin your shoes to save a drowning child. Singer asks why distance changes that.',
  estimatedMinutes: 6,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'You would wreck your shoes to save a drowning child.',
      subtext: 'So why does a dying child a continent away feel like someone else’s problem?',
      emoji: '🌊',
    },
    {
      type: 'example',
      title: 'The Shallow Pond',
      scenario: 'You pass a shallow pond and see a small child drowning. You could wade in and save her, but you would ruin your expensive shoes and be late. Almost everyone agrees: you must save the child. A pair of shoes is nothing weighed against a life. The cost to you is trivial; the stakes for her are everything.',
      source: 'Peter Singer, Famine, Affluence, and Morality (1972)',
      emoji: '👞',
    },
    {
      type: 'concept',
      title: 'Distance Should Not Matter',
      body: 'Singer presses the analogy. A donation can save a child dying of preventable disease far away, at small cost to you. If physical distance and nationality are morally irrelevant, then failing to give is like walking past the pond. The obligation does not weaken just because the child is out of sight.',
      visual: '🌍',
      highlight: 'distance is morally irrelevant',
    },
    {
      type: 'quote',
      id: 'lq-ethics-ethics-23-1',
      quote: 'If it is in our power to prevent something bad from happening, without sacrificing anything of comparable moral importance, we ought, morally, to do it.',
      author: 'Peter Singer',
      era: '1972',
      work: 'Famine, Affluence, and Morality',
    },
    {
      type: 'concept',
      title: 'From Giving To Giving Well',
      body: 'Effective altruism adds a second step: use reason and evidence to do the most good per dollar. A bed net that prevents malaria may save far more lives than a flashier cause. The goal is not just to feel generous, but to actually help the most people you can.',
      visual: '📊',
      highlight: 'the most good per dollar',
    },
    {
      type: 'question',
      prompt: 'Someone replies: "But thousands of others could also help, so the duty isn’t mine alone." Does this defeat Singer’s argument?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Yes, shared responsibility means no individual is obligated', isCorrect: false },
          { id: 'b', text: 'No, the child still dies if everyone reasons this way; your power to help remains', isCorrect: true },
          { id: 'c', text: 'Yes, because morality only applies to people physically present', isCorrect: false },
          { id: 'd', text: 'No, because Singer thinks only governments have duties', isCorrect: false },
        ],
        explanation: 'Option A is the tempting trap — the diffusion of responsibility. It feels like a get-out, but Singer points out that if everyone uses it as an excuse, the child still drowns. The fact that others could also act does not cancel your power to act. At the pond, you would not stroll past just because a crowd was watching too.',
      },
    },
    {
      type: 'dilemma',
      scenario: 'You earn a comfortable salary. After rent and basics, you spend on dinners out, streaming, and travel. A reliable charity could turn a chunk of that into bed nets that prevent children from dying of malaria. Singer’s argument seems to demand you keep giving until giving more would cost you something of comparable importance.',
      prompt: 'How much are you obligated to give?',
      choices: [
        { id: 'a', label: 'Nothing required; charity is optional kindness' },
        { id: 'b', label: 'A fair, sustainable share of my income' },
        { id: 'c', label: 'Everything down to bare necessities' },
      ],
      views: [
        {
          thinker: 'Peter Singer',
          stance: 'Give until further giving really costs you.',
          why: 'If a luxury is not of "comparable moral importance" to a child’s life, keeping it is like sparing your shoes at the pond. The logic is demanding, though Singer accepts a realistic standard most can sustain.',
        },
        {
          thinker: 'Susan Wolf',
          stance: 'A life of total sacrifice is not ideal.',
          why: 'A "moral saint" with no projects, friendships, or joys of her own leads a strangely impoverished life. Ethics should leave room for personal commitments, not demand we become pure instruments of the good.',
        },
        {
          thinker: 'Common-sense view',
          stance: 'Strong duty not to harm, weaker duty to aid.',
          why: 'There is a difference between actively pushing someone into a pond and failing to fund a distant rescue. We owe much to those we directly harm, but positive duties to strangers are real yet limited.',
        },
      ],
      xpValue: 5,
    },
    {
      type: 'summary',
      title: 'What You Now Know',
      keyPoints: [
        'The pond case shows we must help at small cost',
        'Singer argues distance is morally irrelevant',
        'Effective altruism asks: do the most good per dollar',
        'Critics worry the demand swallows your whole life',
      ],
      closingThought: 'The hard part is not agreeing with the pond — it is admitting how often we walk past one.',
    },
  ],
};

export default lesson;

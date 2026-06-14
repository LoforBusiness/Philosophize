import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'political-political-19',
  slug: 'global-justice',
  title: 'Do We Owe Strangers Anything?',
  description: 'A child drowns nearby; a child starves far away. Singer and Pogge say distance is no excuse.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'You would ruin your shoes to save a drowning child. So?',
      subtext: 'A child is starving overseas right now. Does the border change what you owe?',
      emoji: '🌍',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you stepped behind Rawls’s veil and weighed capabilities.',
      body: 'Both kept justice inside one nation. Now push past the border: if fairness and a decent human life matter behind the veil, why should a passport decide who counts?',
      emoji: '🛂',
    },
    {
      type: 'concept',
      title: 'Justice Past the Border',
      body: 'Global justice asks whether our duties stop at the nation’s edge. Peter Singer says no: if we can prevent something very bad at little cost to ourselves, we must. Distance and nationality are morally irrelevant.',
      visual: '🧭',
      highlight: 'morally irrelevant',
    },
    {
      type: 'quote',
      id: 'lq-political-political-19-1',
      quote: 'If it is in our power to prevent something bad from happening, without thereby sacrificing anything of comparable moral importance, we ought, morally, to do it.',
      author: 'Peter Singer',
      era: '1972',
      work: 'Famine, Affluence, and Morality',
    },
    {
      type: 'concept',
      title: 'Not Charity — Repair',
      body: 'Thomas Pogge sharpens the claim. The wealthy are not innocent bystanders: they help impose trade and lending rules that keep others poor. So aid is not generosity. It is a negative duty — stop harming — not a kindness we may skip.',
      visual: '⛓️',
      highlight: 'negative duty',
    },
    {
      type: 'dilemma',
      scenario: 'You would wade in and ruin your shoes to save a child drowning at your feet. Yet a donation could save a distant starving child, and most of us scroll past. Same stakes, just farther away.',
      prompt: 'When the cost is small, what do you owe the distant child?',
      choices: [
        { id: 'a', label: 'The same as the child at my feet' },
        { id: 'b', label: 'Something, but my compatriots come first' },
        { id: 'c', label: 'Nothing required — helping is optional charity' },
      ],
      views: [
        {
          thinker: 'Peter Singer',
          stance: 'You owe the same; distance is irrelevant',
          why: 'If you can prevent a great evil at small cost, you must. Geography and nationality carry no moral weight, so the affluent have strong positive duties to give.',
        },
        {
          thinker: 'Thomas Pogge',
          stance: 'It is repair, not charity',
          why: 'The rich help impose an unjust global order. So this is a negative duty not to harm — stronger than mere generosity, and not something we are free to refuse.',
        },
        {
          thinker: 'Communitarian critic',
          stance: 'Special ties make compatriots come first',
          why: 'We are not abstract donors but members of communities. Shared history and mutual obligation can ground stronger duties to fellow citizens than to strangers abroad.',
        },
      ],
      xpValue: 5,
    },
    {
      type: 'question',
      prompt: 'Pogge calls helping the global poor a duty. Why does he say it is stronger than ordinary charity?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Because giving feels good and builds character', isCorrect: false },
          { id: 'b', text: 'Because the rich help impose the harmful order, so they must stop harming', isCorrect: true },
          { id: 'c', text: 'Because the poor are nearer than we assume', isCorrect: false },
          { id: 'd', text: 'Because charity always outweighs every other duty', isCorrect: false },
        ],
        explanation: 'The trap is the warm-glow framing: treating aid as a feel-good bonus. Pogge denies we are bystanders — the wealthy co-author an unjust global order, so this is a negative duty not to harm, which binds harder than optional charity.',
      },
    },
    {
      type: 'summary',
      title: 'What You Now Know',
      keyPoints: [
        'Global justice asks if duties stop at borders',
        'Singer: prevent great harm at small cost',
        'Pogge: repairing harm, not optional charity',
        'Critics: special ties favor compatriots',
      ],
      closingThought: 'The hardest part of justice may be the strangers you will never meet.',
    },
  ],
};

export default lesson;

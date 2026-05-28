import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'political-political-1',
  slug: 'why-societies-need-rules',
  title: 'Why Societies Need Rules',
  description: 'Discover why humans live under rules and governments rather than in isolation.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Without rules, life would be a war of all against all.',
      subtext: 'Thomas Hobbes imagined it — and it terrified him.',
      emoji: '⚔️',
    },
    {
      type: 'concept',
      title: 'The State of Nature',
      body: 'Philosopher Thomas Hobbes asked: what would life look like without any government? He called this the "state of nature." His answer was grim: without rules to protect us, everyone would compete for survival. Life would be "solitary, poor, nasty, brutish, and short." Rules exist because the alternative is chaos.',
      visual: '🌿',
      highlight: 'state of nature',
    },
    {
      type: 'example',
      title: 'Hobbes\' Nightmare Scenario',
      scenario: 'Imagine waking up tomorrow and every law, police force, and government has vanished overnight. Nothing stops your neighbour from taking your food, your home, or harming you — and nothing stops you from doing the same to them. Hobbes believed this mutual fear is exactly why rational people agree to hand power to a ruler: the alternative is worse.',
      source: 'Thomas Hobbes, Leviathan (1651)',
      emoji: '🏚️',
    },
    {
      type: 'concept',
      title: 'The Social Contract',
      body: 'The "social contract" is the idea that government isn\'t just imposed on us — we implicitly agree to it. We give up some freedoms (we can\'t just take what we want) and in return we gain security, cooperation, and civilisation. Rules enable strangers to trust each other enough to trade, build, and live together.',
      visual: '🤝',
      highlight: 'social contract',
    },
    {
      type: 'question',
      prompt: 'According to Hobbes, why do people accept rules and government?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Because rulers are morally superior to everyone else', isCorrect: false },
          { id: 'b', text: 'Because life without government would be dangerous and short', isCorrect: true },
          { id: 'c', text: 'Because humans are naturally kind and prefer order', isCorrect: false },
          { id: 'd', text: 'Because God commands obedience to earthly rulers', isCorrect: false },
        ],
        explanation: 'Hobbes argued that rational self-interest drives us to accept government — the "state of nature" without rules is so dangerous that almost any stable government is better than none.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'You just learned that rules solve the problem of distrust.',
      body: 'The social contract isn\'t a document you sign — it\'s a philosophical idea explaining why government makes rational sense. When we obey traffic lights or pay taxes, we\'re participating in a massive cooperation system that only works because everyone else does too.',
      emoji: '💡',
    },
    {
      type: 'question',
      prompt: 'True or false: Hobbes thought humans are naturally peaceful without government.',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: false,
        explanation: 'Hobbes believed the opposite — without government, humans compete violently for survival. That\'s precisely why he argued we need a powerful ruler to keep the peace.',
      },
    },
    {
      type: 'summary',
      title: 'Rules Make Civilisation Possible',
      keyPoints: [
        'The "state of nature" is life without any government or rules',
        'Hobbes said such life would be brutal and short',
        'The social contract: we trade some freedom for security',
        'Rules enable large-scale cooperation between strangers',
      ],
      closingThought: 'Every law you follow is a small vote for civilisation over chaos.',
    },
  ],
};

export default lesson;

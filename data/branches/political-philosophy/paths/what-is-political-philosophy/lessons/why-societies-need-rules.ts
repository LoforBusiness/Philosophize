import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'political-political-1',
  slug: 'why-societies-need-rules',
  title: 'Why Societies Need Rules',
  description: 'Learn why people live under rules and governments instead of on their own.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Why do we agree to follow rules at all?',
      subtext: 'Every society has them. Where do they get their authority?',
      emoji: '⚔️',
    },
    {
      type: 'concept',
      title: 'The State of Nature',
      body: 'Thomas Hobbes asked a simple question: what would life be like with no government at all? He called this the "state of nature." His answer was grim. Without rules, he thought, people would compete for survival and life would be "nasty, brutish, and short." Rules exist to prevent that.',
      visual: '🌿',
      highlight: 'state of nature',
    },
    {
      type: 'example',
      title: 'Imagining No Government',
      scenario: 'Imagine waking up to find every law and government gone. Nothing stops a neighbor from taking your food or home, and nothing stops you from doing the same. Hobbes argued that fear of this is exactly why reasonable people accept a government. Whatever a ruler costs you, having no order costs more.',
      source: 'Thomas Hobbes, Leviathan (1651)',
      emoji: '🏚️',
    },
    {
      type: 'concept',
      title: 'The Social Contract',
      body: 'The "social contract" is the idea that government is not just forced on us. We accept it. We give up certain freedoms, like the freedom to take whatever we want, and in return we get safety and cooperation. Rules let strangers trust each other enough to trade, build, and live together.',
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
          { id: 'a', text: 'Because rulers are morally better than the people they rule', isCorrect: false },
          { id: 'b', text: 'Because life without any government would be dangerous', isCorrect: true },
          { id: 'c', text: 'Because people are naturally gentle and want order', isCorrect: false },
          { id: 'd', text: 'Because they believe kings are chosen by God', isCorrect: false },
        ],
        explanation: 'For Hobbes, it is self-interest, not virtue, that leads us to accept government. A lawless "state of nature" is so dangerous that almost any steady government is better than none.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'You\'ve seen how rules solve the problem of distrust.',
      body: 'The social contract is not a document you signed. It is a way of explaining why government makes sense. Every time you stop at a red light, you take part in a system of cooperation that works only because other people follow it too.',
      emoji: '💡',
    },
    {
      type: 'question',
      prompt: 'True or false: Hobbes believed that without government, people live in peace.',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: false,
        explanation: 'Hobbes thought the opposite. Without government, he believed people would turn on each other to survive. That fear is why he argued for a strong ruler to keep the peace.',
      },
    },
    {
      type: 'summary',
      title: 'Rules Make Society Possible',
      keyPoints: [
        'The "state of nature" means life with no government',
        'Hobbes warned that life would be dangerous and short',
        'The social contract: we trade some freedom for safety',
        'Rules let strangers cooperate on a large scale',
      ],
      closingThought: 'Political philosophy asks who should hold power, and why we obey.',
    },
  ],
};

export default lesson;

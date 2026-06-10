import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'ethics-ethics-8',
  slug: 'ethics-of-care',
  title: 'The Ethics of Care',
  description: 'What if morality starts not with rules and rights, but with relationships?',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'What if morality begins with caring, not rules?',
      subtext: 'The great theories ask what is fair. Another voice asks who needs you.',
      emoji: '🤲',
    },
    {
      type: 'concept',
      title: 'A Different Voice',
      body: 'Psychologist Carol Gilligan found that many people, often women, reason morally through relationships and responsibility, not abstract rights. She called it a different voice, long ignored by theory.',
      visual: '🔉',
      highlight: 'the ethics of care',
    },
    {
      type: 'quote',
      id: 'lq-ethics-ethics-8-1',
      quote: 'The moral problem arises from conflicting responsibilities rather than from competing rights.',
      author: 'Carol Gilligan',
      era: '1982',
      work: 'In a Different Voice',
    },
    {
      type: 'example',
      title: 'Caring as a Practice',
      scenario: 'Nel Noddings developed care into a full ethics in 1984. Morality, she argued, grows from the bond between the one caring and the one cared-for. We learn right and wrong first at home, not from a rulebook.',
      source: 'Nel Noddings, Caring (1984)',
      emoji: '🏠',
    },
    {
      type: 'reinforcement',
      callout: 'Care completes the picture; it does not erase justice.',
      body: 'Critics warned care could trap women in self-sacrifice. Gilligan replied that care and justice are two lenses, not rivals. A mature ethics, she held, needs both voices speaking.',
      emoji: '⚖️',
    },
    {
      type: 'question',
      prompt: 'How does the ethics of care mainly differ from duty and consequence theories?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'It centers relationships and responsibility over abstract rules and rights', isCorrect: true },
          { id: 'b', text: 'It claims only feelings, never actions, can be moral', isCorrect: false },
          { id: 'c', text: 'It says rich people have no duties to strangers', isCorrect: false },
          { id: 'd', text: 'It rejects the idea that anyone is ever responsible', isCorrect: false },
        ],
        explanation: 'Care ethics reframes morality around concrete bonds and responsiveness to need, where Kant and Mill start from universal rules or impartial outcomes.',
      },
    },
    {
      type: 'question',
      prompt: 'The ethics of care is just emotion, so it cannot count as real moral reasoning. True?',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: false,
        explanation: 'A common put-down, but mistaken: care ethics is a developed theory with criteria and arguments. Responding well to need takes judgment, not mere feeling.',
      },
    },
    {
      type: 'summary',
      title: 'Morality as Relationship',
      keyPoints: [
        'Care ethics starts from bonds, not rules',
        'Gilligan named a long-ignored moral voice',
        'Noddings built it into a full theory',
        'Care and justice work as partners',
      ],
      closingThought: 'Before you ever weighed a rule, someone cared for you. Ethics may begin there.',
    },
  ],
};

export default lesson;

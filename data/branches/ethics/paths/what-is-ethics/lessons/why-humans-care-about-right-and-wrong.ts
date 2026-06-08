import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'ethics-ethics-1',
  slug: 'why-humans-care-about-right-and-wrong',
  title: 'Why Humans Care About Right and Wrong',
  description: 'We share the raw materials of morality with other social animals — but only we judge ourselves in words. This lesson asks why, and how ethics begins.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'You did something. Was it right?',
      subtext: 'Few animals replay a choice and ask whether it was wrong. You do, constantly.',
      emoji: '⚖️',
    },
    {
      type: 'concept',
      title: 'We Judge Our Own Actions',
      body: 'Darwin argued our moral sense grows from social instincts we share with other animals — empathy, fairness, care for our group. What humans add is language and reflective self-judgment: we step back, ask "was that right?", and give reasons. That inner trial is where ethics is born.',
      visual: '🧠',
      highlight: 'moral reasoning',
    },
    {
      type: 'concept',
      title: 'What Is a Conscience?',
      body: 'Conscience is that nagging sense something is wrong even when no one watches. Where it comes from is genuinely debated: Darwin traced it to evolved social instinct, Freud to society stamped inward as the superego, Kant to reason itself. The honest answer is that all three are still live.',
      visual: '💭',
      highlight: 'conscience',
    },
    {
      type: 'example',
      title: 'Aristotle\'s Question',
      scenario: 'Around 350 BCE, Aristotle asked what the good life for a human is. Our defining activity, he argued, is reason — so living well means exercising it with virtue across a whole life. Ethics was no rulebook to obey. It was the lifelong craft of becoming an excellent person.',
      source: 'Aristotle, Nicomachean Ethics (c. 350 BCE)',
      emoji: '🏛️',
    },
    {
      type: 'question',
      prompt: 'What most clearly sets human moral life apart from that of other social animals?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'We can step back, judge our own actions, and give reasons in words', isCorrect: true },
          { id: 'b', text: 'We run on raw instinct alone, never on thought', isCorrect: false },
          { id: 'c', text: 'Only humans show any trace of empathy or fairness', isCorrect: false },
          { id: 'd', text: 'We always grab whatever serves us best', isCorrect: false },
        ],
        explanation: 'Apes and monkeys show building blocks like empathy and fairness (Darwin 1871; de Waal). What humans add is language and reflective self-judgment — articulating reasons and asking "was that right?"',
      },
    },
    {
      type: 'reinforcement',
      callout: 'Ethics begins by judging yourself.',
      body: 'Aristotle named the goal of a good life eudaimonia — best rendered "flourishing," not feeling happy. It is not pleasure, comfort, or honor, all of which he weighs and rejects. It means living and acting well by using your powers with strong character over a lifetime.',
      emoji: '🌱',
    },
    {
      type: 'question',
      prompt: 'For Aristotle, ethics was above all about obeying a fixed set of rules.',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: false,
        explanation: 'Aristotle built his ethics on character and practical wisdom, not a fixed rulebook. He asked what kind of person you are becoming, not merely which acts you tick off.',
      },
    },
    {
      type: 'summary',
      title: 'Why Ethics Starts With You',
      keyPoints: [
        'We share moral building blocks with social animals',
        'Only we judge ourselves and give reasons',
        'Where conscience comes from is still debated',
        'Aristotle: ethics is flourishing, not rules',
      ],
      closingThought: 'Asking "was that right?" is where ethics begins.',
    },
  ],
};

export default lesson;

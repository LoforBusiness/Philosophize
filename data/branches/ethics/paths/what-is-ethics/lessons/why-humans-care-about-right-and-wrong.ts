import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'ethics-ethics-1',
  slug: 'why-humans-care-about-right-and-wrong',
  title: 'Why Humans Care About Right and Wrong',
  description: 'We share morality\'s raw materials with animals, but only we judge ourselves.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'You did something. Was it right?',
      subtext: 'Few animals replay a choice and ask if it was wrong. You do, constantly.',
      emoji: '⚖️',
    },
    {
      type: 'concept',
      title: 'We Judge Our Own Actions',
      body: 'Darwin argued our moral sense grows from social instincts we share with animals: empathy, fairness, care for our group. What humans add is language and self-judgment: we step back, ask "was that right?", and give reasons.',
      visual: '🧠',
      highlight: 'moral reasoning',
    },
    {
      type: 'concept',
      title: 'What Is a Conscience?',
      body: 'Conscience is the nagging sense something is wrong even when no one watches. Where it comes from is debated: Darwin traced it to evolved instinct, Freud to society stamped inward, Kant to reason itself. All three stay live.',
      visual: '💭',
      highlight: 'conscience',
    },
    {
      type: 'example',
      title: "Aristotle's Question",
      scenario: 'Around 350 BCE, Aristotle asked what the good life for a human is. Our defining activity, he argued, is reason, so living well means exercising it with virtue across a whole life. Ethics was no rulebook to obey.',
      source: 'Aristotle, Nicomachean Ethics (c. 350 BCE)',
      emoji: '🏛️',
    },
    {
      type: 'quote',
      id: 'lq-ethics-ethics-1-1',
      quote: 'The unexamined life is not worth living.',
      author: 'Socrates',
      era: 'c. 399 BCE',
      work: "Plato, Apology, 38a",
    },
    {
      type: 'question',
      prompt: 'What most clearly sets human moral life apart from other social animals?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'We can step back, judge our actions, and give reasons in words', isCorrect: true },
          { id: 'b', text: 'We run on raw instinct alone, never on thought', isCorrect: false },
          { id: 'c', text: 'Only humans show any trace of empathy or fairness', isCorrect: false },
          { id: 'd', text: 'We always grab whatever serves us best', isCorrect: false },
        ],
        explanation: 'Apes show building blocks like empathy and fairness (Darwin 1871; de Waal). What humans add is language and reflective self-judgment, asking "was that right?"',
      },
    },
    {
      type: 'question',
      prompt: 'Since apes show empathy and fairness, they must have a conscience just like ours. True?',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: false,
        explanation: 'They share the building blocks, but conscience adds reflective self-judgment in words, asking "was that right?", which is the distinctively human step.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'Ethics begins by judging yourself.',
      body: 'Aristotle named the goal eudaimonia, best rendered "flourishing," not feeling happy. It means living and acting well by using your powers with strong character over a lifetime.',
      emoji: '🌱',
    },
    {
      type: 'summary',
      title: 'Why Ethics Starts With You',
      keyPoints: [
        'We share moral building blocks with animals',
        'Only we judge ourselves and give reasons',
        'Where conscience comes from is still debated',
        'Aristotle: ethics is flourishing, not rules',
      ],
      closingThought: 'Asking "was that right?" is where ethics begins.',
    },
  ],
};

export default lesson;

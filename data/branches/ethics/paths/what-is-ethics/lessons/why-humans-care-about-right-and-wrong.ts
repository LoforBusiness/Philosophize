import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'ethics-ethics-1',
  slug: 'why-humans-care-about-right-and-wrong',
  title: 'Why Humans Care About Right and Wrong',
  description: 'No other animal puts its own actions on trial. This lesson asks why we do — and how ethics is born the moment we judge ourselves.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'You did something. Was it right?',
      subtext: 'No other animal puts its own actions on trial. You do, constantly.',
      emoji: '⚖️',
    },
    {
      type: 'concept',
      title: 'We Judge Our Own Actions',
      body: 'Animals chase, flee, feed. Humans do something stranger: we step outside the moment and ask, "was that right?" Philosophers call this moral reasoning. We burn with guilt, glow with pride, replay choices we wish we had made. That restless inner trial is where ethics is born.',
      visual: '🧠',
      highlight: 'moral reasoning',
    },
    {
      type: 'concept',
      title: 'What Is a Conscience?',
      body: 'Your conscience is that nagging sense that something is wrong even when no one watches and no one would ever catch you. It outruns fear of punishment. Its origin is fiercely debated: maybe we are born with it, maybe society stamps it in, maybe reason builds it. Either way, it steers a life.',
      visual: '💭',
      highlight: 'conscience',
    },
    {
      type: 'example',
      title: 'Aristotle\'s Question',
      scenario: 'Around 350 BCE, Aristotle fired off a question we still chase: what is the good life for a human? Our defining power, he argued, is reason — and living well means wielding it with virtue. Ethics, for him, was no rulebook to obey. It was the lifelong craft of becoming an excellent person.',
      source: 'Aristotle, Nicomachean Ethics (c. 350 BCE)',
      emoji: '🏛️',
    },
    {
      type: 'question',
      prompt: 'What most clearly sets human moral reasoning apart from the behavior of animals?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'We step back and put our own actions on trial as right or wrong', isCorrect: true },
          { id: 'b', text: 'We run on raw instinct alone, never on thought', isCorrect: false },
          { id: 'c', text: 'Animals feel guilt but cannot put it into words', isCorrect: false },
          { id: 'd', text: 'We always grab whatever serves us best', isCorrect: false },
        ],
        explanation: 'Moral reasoning means stepping back and judging your own actions as right or wrong. No other animal seems to hold this inner trial the way we do.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'Ethics begins by judging yourself.',
      body: 'Aristotle named the target of a good life eudaimonia — usually rendered "flourishing." It is not pleasure, comfort, or a full belly. It means living well by using your powers fully and acting with strong character. Every ethical question grows from one root: what would it take for you to flourish?',
      emoji: '🌱',
    },
    {
      type: 'question',
      prompt: 'For Aristotle, ethics was above all about obeying a fixed set of rules.',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: false,
        explanation: 'Aristotle built his ethics on character and the slow ripening of virtue, not a fixed rulebook. He asked what kind of person you are becoming, not merely which acts you tick off.',
      },
    },
    {
      type: 'summary',
      title: 'Why Ethics Starts With You',
      keyPoints: [
        'We step back and judge our own actions',
        'Conscience is your sense of right and wrong',
        'Aristotle asked what living well means',
        'For him, ethics is flourishing, not rules',
      ],
      closingThought: 'Asking "was that right?" is where ethics begins.',
    },
  ],
};

export default lesson;

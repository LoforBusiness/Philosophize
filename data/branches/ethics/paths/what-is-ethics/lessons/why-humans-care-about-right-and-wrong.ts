import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'ethics-ethics-1',
  slug: 'why-humans-care-about-right-and-wrong',
  title: 'Why Humans Care About Right and Wrong',
  description: 'Humans judge their own actions as right or wrong. This lesson looks at why we do that, and how ethics begins from it.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'You did something. Was it right?',
      subtext: 'Humans are unusual: we judge our own actions as right or wrong.',
      emoji: '⚖️',
    },
    {
      type: 'concept',
      title: 'We Judge Our Own Actions',
      body: 'Most animals act on instinct. Humans do something extra: we step back and ask whether what we did was right or wrong. This is called moral reasoning. We feel guilt over bad choices and pride over good ones, and we imagine what we could have done better. Ethics starts with this habit of judging ourselves.',
      visual: '🧠',
      highlight: 'moral reasoning',
    },
    {
      type: 'concept',
      title: 'What Is a Conscience?',
      body: 'Your conscience is the sense that some actions are wrong even when no one is watching and no one would catch you. It is more than fear of getting punished. Where it comes from is debated: maybe we are born with it, maybe society teaches it, maybe reason builds it. Either way, it strongly shapes how we live.',
      visual: '💭',
      highlight: 'conscience',
    },
    {
      type: 'example',
      title: 'Aristotle\'s Question',
      scenario: 'Around 350 BCE, Aristotle asked a question we still discuss: what is the good life for a human being? He thought our defining ability is reason, and that living well means using that reason to act with virtue. For Aristotle, ethics was not a list of rules to follow. It was the work of becoming a better person.',
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
          { id: 'a', text: 'We pause to ask whether our own actions were right or wrong', isCorrect: true },
          { id: 'b', text: 'We act only on raw instinct, never on thought', isCorrect: false },
          { id: 'c', text: 'Animals feel guilt but have no way to voice it', isCorrect: false },
          { id: 'd', text: 'We always choose whatever serves us best', isCorrect: false },
        ],
        explanation: 'Moral reasoning means stepping back and judging your own actions as right or wrong. No other animal seems to do this the way we do.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'Ethics begins with judging your own actions.',
      body: 'Aristotle had a name for the goal of a good life: eudaimonia, usually translated as flourishing. It does not mean pleasure or comfort. It means living well by using your abilities fully and acting with good character. Ethics starts from one question: what would it mean for you to flourish?',
      emoji: '🌱',
    },
    {
      type: 'question',
      prompt: 'For Aristotle, ethics was above all about obeying a fixed set of rules.',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: false,
        explanation: 'Aristotle focused on character and the slow growth of virtue, not on a fixed rulebook. His ethics asks what kind of person you are becoming, not just which acts you perform.',
      },
    },
    {
      type: 'summary',
      title: 'Why Ethics Starts With You',
      keyPoints: [
        'We pause to judge our own actions',
        'Conscience is your sense of right and wrong',
        'Aristotle asked what it means to live well',
        'For him, ethics is flourishing, not just rules',
      ],
      closingThought: 'Asking "was that right?" is where ethics begins.',
    },
  ],
};

export default lesson;

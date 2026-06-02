import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'ethics-ethics-1',
  slug: 'why-humans-care-about-right-and-wrong',
  title: 'Why Humans Care About Right and Wrong',
  description: 'Explore the strange human gift of moral reflection — and why some quiet part of us can never stop asking, "was that right?"',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'You just did something. But was it right?',
      subtext: 'Stones never wonder. Beasts rarely pause. Only we are haunted by that question.',
      emoji: '⚖️',
    },
    {
      type: 'concept',
      title: 'The Moral Animal',
      body: 'We are the creature that turns to look at itself. Alone among living things, we weigh our own deeds and ask if they were worthy. This power — moral reasoning — is no mere instinct. We judge, we ache with guilt, we glow with pride, we picture the better thing we might have done. That restless inner voice is where ethics begins.',
      visual: '🧠',
      highlight: 'moral reasoning',
    },
    {
      type: 'concept',
      title: 'What Is a Conscience?',
      body: 'Conscience is the quiet sense that some deeds are wrong even in an empty room, with no one to catch us. It is more than fear of punishment — it is a genuine awareness of right and wrong. Is it born in us, taught by society, or forged by reason? Philosophers still argue. None, though, deny how deeply it shapes a life.',
      visual: '💭',
      highlight: 'conscience',
    },
    {
      type: 'example',
      title: 'Aristotle\'s Question',
      scenario: 'Around 350 BCE, Aristotle posed a question that still echoes: what is the good life for a human being? Our gift, he said, is reason — and to live well is to exercise that reason with virtue. Ethics, for him, was never a rulebook to obey. It was the slow, deliberate art of becoming the finest version of yourself.',
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
        explanation: 'Moral reasoning is the power to step back and weigh our own deeds as right or wrong — a turning-inward no other creature seems to share.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'You have glimpsed why we are, uniquely, moral beings.',
      body: 'Aristotle gave the aim of the moral life a name: eudaimonia, often rendered as flourishing. It is not pleasure, nor comfort, but a life lived in full bloom of its highest powers. Ethics opens with a single, demanding question — what would it mean for you to truly flourish?',
      emoji: '🌱',
    },
    {
      type: 'question',
      prompt: 'For Aristotle, ethics was above all about obeying a fixed set of rules.',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: false,
        explanation: 'Aristotle fixed his gaze on character and the slow growth of virtue, not on a rigid code. His ethics asks what kind of person you are becoming, not merely what acts you perform.',
      },
    },
    {
      type: 'summary',
      title: 'Why Ethics Starts With You',
      keyPoints: [
        'Only we pause to judge our own actions',
        'Conscience is your inner moral awareness at work',
        'Aristotle asked what it means to live well',
        'Ethics is flourishing, not merely obeying rules',
      ],
      closingThought: 'Each time you ask whether you did the right thing, you are already a philosopher.',
    },
  ],
};

export default lesson;

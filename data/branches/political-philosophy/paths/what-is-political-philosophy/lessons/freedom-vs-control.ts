import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'political-political-4',
  slug: 'freedom-vs-control',
  title: 'Freedom vs. Control',
  description: 'Meet the two rival ideas of liberty that split politics in half.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Free because no one stops you, or because you can act?',
      subtext: 'Two ideas of freedom. Two completely different politics.',
      emoji: '🗽',
    },
    {
      type: 'concept',
      title: 'Negative Liberty: Freedom From',
      body: 'Isaiah Berlin called this negative liberty: freedom FROM interference. You are free so long as no one blocks your path. John Stuart Mill drew the line with his harm principle: society may stop you only to prevent harm to others, never "for your own good."',
      visual: '🚫',
      highlight: 'negative liberty',
    },
    {
      type: 'example',
      title: "Mill's Harm Principle in Action",
      scenario: 'Eat badly, take wild risks, preach unpopular views? Mill says: not the law\'s business. Punishing people for their own sake, he argued, tramples liberty. But poison a well, defraud a buyer, throw a punch? Now you harm others, and only now may power rightly step in.',
      source: 'John Stuart Mill, On Liberty (1859)',
      emoji: '📖',
    },
    {
      type: 'concept',
      title: 'Positive Liberty: Freedom To',
      body: 'Berlin named a rival ideal: positive liberty, the real power TO act and master yourself. You might face zero interference yet stay trapped, too poor, sick, or untaught to move. Positive liberty asks the harder question: should the state empower people, not merely leave them be?',
      visual: '💪',
      highlight: 'positive liberty',
    },
    {
      type: 'question',
      prompt: 'Which idea of liberty is about removing obstacles and interference?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Positive liberty, the power to master yourself and act', isCorrect: false },
          { id: 'b', text: 'Negative liberty, freedom from interference by others', isCorrect: true },
          { id: 'c', text: 'Natural liberty, the freedom we are born with', isCorrect: false },
          { id: 'd', text: 'Civil liberty, the freedom a constitution guarantees', isCorrect: false },
        ],
        explanation: 'Negative liberty means the absence of outside interference: no one stands in your way. Positive liberty asks something different, whether you truly have the power to act.',
      },
    },
    {
      type: 'example',
      title: "Berlin's Warning",
      scenario: 'Berlin loved positive liberty but feared it. Twist "your real freedom is self-mastery," and a ruler can claim to free you by force, controlling you for your "higher self." The Soviet state did exactly that. So Berlin defended a core of negative liberty: a space no power may invade.',
      source: 'Isaiah Berlin, Two Concepts of Liberty (1958)',
      emoji: '⚠️',
    },
    {
      type: 'question',
      prompt: 'True or false: Mill thought the government should protect people from their own bad choices.',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: false,
        explanation: 'Mill rejected this flatly. His harm principle permits only one ground for limiting liberty: preventing harm to others, never shielding a person from themselves.',
      },
    },
    {
      type: 'summary',
      title: 'Two Ways to Think About Freedom',
      keyPoints: [
        'Negative liberty: freedom from interference and force',
        "Mill's harm principle: limit liberty only to protect others",
        'Positive liberty: the real power to act, not mere permission',
        'Berlin warned: positive liberty can mask coercion',
      ],
      closingThought: 'How you define freedom decides the kind of society you build.',
    },
  ],
};

export default lesson;

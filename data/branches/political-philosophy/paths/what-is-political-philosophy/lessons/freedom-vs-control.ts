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
      subtext: 'Two ideas of freedom. Two very different politics.',
      emoji: '🗽',
    },
    {
      type: 'concept',
      title: 'Negative Liberty: Freedom From',
      body: 'Isaiah Berlin called this negative liberty: the area where you are left to act without interference by other people. John Stuart Mill drew the boundary with his harm principle: power may be used against you only to prevent harm to others, never "for your own good."',
      visual: '🚫',
      highlight: 'negative liberty',
    },
    {
      type: 'example',
      title: "Mill's Harm Principle in Action",
      scenario: 'Eat badly, take wild risks, preach unpopular views? Mill says that is your business: "Over himself, over his own body and mind, the individual is sovereign." But poison a well, defraud a buyer, throw a punch? Now you harm others, and only then may power rightly step in.',
      source: 'John Stuart Mill, On Liberty (1859)',
      emoji: '📖',
    },
    {
      type: 'concept',
      title: 'Positive Liberty: Freedom To',
      body: 'Berlin named a rival ideal: positive liberty, being your own master. You might face no interference yet still not direct your own life, too poor, sick, or untaught to act. Positive liberty asks the harder question: should the state empower people, not merely leave them alone?',
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
          { id: 'a', text: 'Positive liberty, being your own master and directing your own life', isCorrect: false },
          { id: 'b', text: 'Negative liberty, freedom from interference by others', isCorrect: true },
          { id: 'c', text: 'Natural liberty, the freedom we are born with', isCorrect: false },
          { id: 'd', text: 'Civil liberty, the freedom a constitution guarantees', isCorrect: false },
        ],
        explanation: 'For Berlin, negative liberty is the space where no other person blocks your way. Positive liberty asks something different: whether you truly have the power to be your own master.',
      },
    },
    {
      type: 'example',
      title: "Berlin's Warning",
      scenario: 'Berlin valued positive liberty but feared its abuse. Twist "real freedom is self-mastery," and a ruler can claim a "higher self" knows better, then coerce you in its name, free to "bully, oppress, torture." Soviet rule did exactly that. So Berlin guarded a core of negative liberty no power may invade.',
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
        explanation: 'Mill rejected this. His harm principle allows only one ground for coercing an adult: preventing harm to others. A person\'s own good is "not a sufficient warrant."',
      },
    },
    {
      type: 'summary',
      title: 'Two Ways to Think About Freedom',
      keyPoints: [
        'Negative liberty: freedom from interference by others',
        "Mill: coerce only to prevent harm to others, not for one's own good",
        'Positive liberty: being your own master, not mere permission',
        'Berlin valued both but warned positive liberty can mask coercion',
      ],
      closingThought: 'How you define freedom decides the kind of society you build.',
    },
  ],
};

export default lesson;

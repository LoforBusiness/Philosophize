import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'political-political-4',
  slug: 'freedom-vs-control',
  title: 'Freedom vs. Control',
  description: 'Two rival ideas of liberty that split politics in half.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Free because no one stops you, or because you can?',
      subtext: 'Two ideas of freedom. Two very different politics.',
      emoji: '🗽',
    },
    {
      type: 'concept',
      title: 'Negative Liberty: Freedom From',
      body: 'Berlin called this negative liberty: the area where others leave you alone. Mill drew the line with his harm principle: power may be used against you only to prevent harm to others.',
      visual: '🚫',
      highlight: 'negative liberty',
    },
    {
      type: 'example',
      title: 'Mill\'s Harm Principle in Action',
      scenario: 'Eat badly, take wild risks, preach unpopular views? Mill says that is your business. But poison a well, defraud a buyer, throw a punch? Now you harm others, and only then may power rightly step in.',
      source: 'John Stuart Mill, On Liberty (1859)',
      emoji: '📖',
    },
    {
      type: 'quote',
      id: 'lq-political-political-4-1',
      quote: 'Over himself, over his own body and mind, the individual is sovereign.',
      author: 'John Stuart Mill',
      era: '1859',
      work: 'On Liberty',
    },
    {
      type: 'concept',
      title: 'Positive Liberty: Freedom To',
      body: 'Berlin named a rival ideal: positive liberty, being your own master. You might face no interference yet still be too poor, sick, or untaught to act. Should the state empower people, not merely leave them alone?',
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
          { id: 'a', text: 'Positive liberty, being your own master and directing your life', isCorrect: false },
          { id: 'b', text: 'Negative liberty, freedom from interference by others', isCorrect: true },
          { id: 'c', text: 'Natural liberty, the freedom we are born with', isCorrect: false },
          { id: 'd', text: 'Civil liberty, the freedom a constitution guarantees', isCorrect: false },
        ],
        explanation: 'For Berlin, negative liberty is the space where no one blocks your way. Positive liberty asks instead whether you truly have the power to be your own master.',
      },
    },
    {
      type: 'question',
      prompt: 'Berlin championed positive liberty, so he surely thought the state should force people toward their "real" freedom. Right?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Yes, Berlin urged rulers to coerce people into self-mastery', isCorrect: false },
          { id: 'b', text: 'No, Berlin feared positive liberty could be twisted to justify coercion', isCorrect: true },
          { id: 'c', text: 'Yes, Berlin said a "higher self" should always overrule your choices', isCorrect: false },
          { id: 'd', text: 'No, because Berlin rejected positive liberty as meaningless', isCorrect: false },
        ],
        explanation: 'The trap: Berlin valued positive liberty but warned it can be twisted, letting rulers coerce you in the name of your "real self." He guarded a core of negative liberty.',
      },
    },
    {
      type: 'summary',
      title: 'Two Ways to Think About Freedom',
      keyPoints: [
        'Negative liberty: freedom from interference',
        'Mill: coerce only to prevent harm to others',
        'Positive liberty: being your own master',
        'Berlin warned positive liberty can mask coercion',
      ],
      closingThought: 'How you define freedom decides the kind of society you build.',
    },
  ],
};

export default lesson;

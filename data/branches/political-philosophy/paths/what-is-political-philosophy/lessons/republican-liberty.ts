import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'political-political-22',
  slug: 'republican-liberty',
  title: 'Freedom As Non-Domination',
  description: 'A kind master still leaves you a slave. Pettit offers a third concept of liberty.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'A slave with a kind master. Is that slave free?',
      subtext: 'No interference today, yet the chains are real. Pettit says freedom needs more.',
      emoji: '⛓️',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier Berlin split liberty into "freedom from" and "freedom to."',
      body: 'In Two Kinds of Freedom you met negative and positive liberty. Republican thinkers say both miss something: you can be free of interference yet still live entirely at another\'s mercy.',
      emoji: '🧭',
    },
    {
      type: 'concept',
      title: 'Domination, Not Just Interference',
      body: 'Negative liberty asks: is anyone interfering with me right now? Republican liberty asks a deeper question: does anyone have arbitrary power to interfere whenever they like? To be dominated is to live under that power, even if it sleeps.',
      visual: '👁️',
      highlight: 'arbitrary power',
    },
    {
      type: 'example',
      title: 'The Lucky Servant',
      scenario: 'A servant has a gentle, generous employer who never bosses her around. No interference. Yet she must flatter, stay watchful, and bend to his moods, because he could turn on her at any moment, and there would be nothing she could do. She is unfree, says Pettit, not because she is bossed, but because she could be.',
      source: 'Philip Pettit, Republicanism (1997)',
      emoji: '🙇',
    },
    {
      type: 'quote',
      id: 'lq-political-political-22-1',
      quote: 'Someone dominates another if they have the capacity to interfere on an arbitrary basis in certain choices the other is in a position to make.',
      author: 'Philip Pettit',
      era: '1997',
      work: 'Republicanism',
    },
    {
      type: 'concept',
      title: 'Why It Is a Third Concept',
      body: 'For Berlin, you are free so long as no obstacle blocks you now. For republicans, freedom means standing on your own two feet, unable to be pushed around at another\'s whim. The cure is not just less interference, but laws and rights that disable arbitrary power.',
      visual: '🛡️',
      highlight: 'non-domination',
    },
    {
      type: 'question',
      prompt: 'On the republican view, why is the kindly master\'s slave still unfree even when never interfered with?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Because the master retains arbitrary power to interfere at will', isCorrect: true },
          { id: 'b', text: 'Because the slave is secretly being interfered with constantly', isCorrect: false },
          { id: 'c', text: 'Because all kindness is really hidden cruelty', isCorrect: false },
          { id: 'd', text: 'Because the slave fails to master his own desires', isCorrect: false },
        ],
        explanation: 'Tempting answer (c) and (d) smuggle in other concepts. The republican point is precise: unfreedom here is not actual interference (negative liberty) nor failed self-mastery (positive liberty), but living under another\'s arbitrary capacity to interfere.',
      },
    },
    {
      type: 'dilemma',
      scenario: 'A benevolent dictator rules wisely, never abusing his power, leaving citizens free to live as they please. A neighboring republic is messier, with checks, courts, and rights, but no one holds unchecked power over anyone. Which land is freer?',
      prompt: 'Where do its people enjoy more freedom?',
      choices: [
        { id: 'a', label: 'The dictatorship, since no one interferes with them' },
        { id: 'b', label: 'The republic, since no one holds arbitrary power' },
        { id: 'c', label: 'Equal, since both leave people undisturbed' },
      ],
      views: [
        {
          thinker: 'Philip Pettit',
          stance: 'The republic; non-domination is freedom',
          why: 'Under the kindest dictator, citizens live by his grace; he could crush them tomorrow. Only laws and rights that strip anyone of arbitrary power let people look one another in the eye as equals.',
        },
        {
          thinker: 'Isaiah Berlin',
          stance: 'Measure freedom by actual interference',
          why: 'If the dictator truly never interferes, his subjects have wide negative liberty now. Berlin worries that demanding more invites grand theories that end up licensing fresh coercion in freedom\'s name.',
        },
      ],
      xpValue: 5,
    },
    {
      type: 'summary',
      title: 'A Third Concept Of Liberty',
      keyPoints: [
        'Freedom as non-domination, not just non-interference',
        'A kind master still dominates if power is arbitrary',
        'The cure is rights that disable arbitrary power',
        'Free people meet as equals, fearing no one',
      ],
      closingThought: 'Ask not only "is anyone stopping me?" but "could they, on a whim, and get away with it?"',
    },
  ],
};

export default lesson;

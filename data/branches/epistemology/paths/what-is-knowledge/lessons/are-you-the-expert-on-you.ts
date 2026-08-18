import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'epistemology-knowledge-36',
  slug: 'are-you-the-expert-on-you',
  title: 'Are You the Expert on You?',
  description: 'You always have a reason. It is not always the one that moved you.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Four identical items. Shoppers picked the one on the right.',
      subtext: 'Every one of them explained why.',
      emoji: '🧦',
    },
    {
      type: 'concept',
      title: 'Privileged Access',
      body: 'The old view says each of us has a special window onto our own mind: you may be wrong about the weather, never about what you want. The window turns out to be smaller than advertised, and the part it does not cover fills itself in.',
      visual: '🪟',
      highlight: 'the window fills itself in',
    },
    {
      type: 'example',
      title: 'The Stocking Counter',
      scenario: 'Nisbett and Wilson laid out four identical pairs of stockings. Shoppers strongly preferred the rightmost. Asked why, they described knit, sheerness and texture. Told that position might have mattered, they denied it — politely, and completely.',
      source: 'Nisbett & Wilson, "Telling More Than We Can Know" (1977)',
    },
    {
      type: 'quote',
      id: 'lq-epistemology-knowledge-36',
      quote: 'People may have little ability to report accurately on their own cognitive processes.',
      author: 'Richard Nisbett',
      era: '1977',
    },
    {
      type: 'question',
      prompt: 'What did the shoppers get wrong, exactly?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Not their preference — the cause of it', isCorrect: true },
          { id: 'b', text: 'They were lying about liking the stockings', isCorrect: false },
          { id: 'c', text: 'They could not tell which pair they had chosen', isCorrect: false },
          { id: 'd', text: 'They failed to notice the pairs were identical', isCorrect: false },
        ],
        explanation: 'They really did prefer that pair and they knew which one it was. What they had no access to was WHY, so they built a reason out of the only material available: the stockings themselves.',
      },
    },
    {
      type: 'question',
      prompt: 'How much of self-knowledge does this actually threaten?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Reports about causes, much more than reports about current feelings', isCorrect: true },
          { id: 'b', text: 'All of it — introspection is worthless', isCorrect: false },
          { id: 'c', text: 'None of it — the experiment is about shopping', isCorrect: false },
          { id: 'd', text: 'Only beliefs, never desires', isCorrect: false },
        ],
        explanation: 'Being in pain and knowing it is not the sort of thing this touches. What it undermines is the confident story about why you did something — a report about hidden machinery, delivered as if it were a report about a feeling.',
      },
    },
    {
      type: 'summary',
      title: 'The Story You Tell',
      keyPoints: [
        'You have good access to what you feel',
        'You have poor access to what caused it',
        'The gap gets filled with a plausible story',
        'The story arrives feeling exactly like a memory',
      ],
      closingThought: 'The unsettling part is not that people were wrong. It is that being wrong felt precisely like being right, which leaves you no signal to watch for.',
    },
  ],
};

export default lesson;

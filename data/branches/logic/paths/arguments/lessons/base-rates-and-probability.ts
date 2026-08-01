import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'logic-arguments-25',
  slug: 'base-rates-and-probability',
  title: 'The Base-Rate Trap',
  description: 'Why a 99%-accurate test for a rare disease can still mean you\'re probably fine.',
  estimatedMinutes: 6,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'A 99% accurate test says you\'re sick. Don\'t panic yet.',
      subtext: 'If the disease is rare, you are still probably healthy. The rarity changes everything.',
      emoji: '🩺',
    },
    {
      type: 'concept',
      title: 'The Base Rate',
      body: 'The base rate is how common something is to begin with, before any new evidence. Reasoning well means starting from the base rate, then adjusting for the new clue — never the other way round. Ignore the base rate and your probabilities go badly wrong.',
      visual: '📊',
      highlight: 'how common, before evidence',
    },
    {
      type: 'example',
      title: 'The Rare Disease',
      scenario: 'A disease hits 1 in 10,000 people. A test is 99% accurate. You test positive. Out of 10,000 people, 1 is truly sick (likely caught). But 1% of the other 9,999 — about 100 healthy people — also test positive. So among ~101 positives, only 1 is sick. Your real odds of illness: under 1%.',
      emoji: '🧪',
    },
    {
      type: 'concept',
      title: 'The Base-Rate Fallacy',
      body: 'The base-rate fallacy is judging by the vivid new evidence ("99% accurate!") while ignoring how rare the thing was to start with. The flashy number hijacks attention; the quiet background rate, which actually dominates the math, gets forgotten.',
      visual: '🙈',
      highlight: 'ignoring how rare',
    },
    {
      type: 'question',
      prompt: 'Steve is shy, tidy, and loves detail. Is he more likely a librarian or a farmer?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'A farmer — there are vastly more farmers than librarians', isCorrect: true },
          { id: 'b', text: 'A librarian — the description fits the stereotype perfectly', isCorrect: false },
          { id: 'c', text: 'Equally likely either way', isCorrect: false },
          { id: 'd', text: 'Impossible to say without more traits', isCorrect: false },
        ],
        explanation: 'The shy-tidy profile screams "librarian" — that\'s the trap. But farmers outnumber librarians many times over, so even a small fraction of "tidy farmers" dwarfs all librarians. Ignoring that base rate is the base-rate fallacy (Kahneman & Tversky\'s classic case).',
      },
    },
    {
      // Added when this lesson became cinematic: the scene's second graded question
      // is answered on the chart, and E37c requires the data to carry the same two
      // questions, testing the same concepts, with the same correct answers.
      type: 'question',
      prompt: 'Of everyone this test calls positive, how many are actually ill?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'About 1 in 101 — under one percent of them', isCorrect: true },
          { id: 'b', text: '99 in 100, because the test is 99% accurate', isCorrect: false },
          { id: 'c', text: 'About half — the test and the base rate cancel out', isCorrect: false },
          { id: 'd', text: 'All of them; a positive is a positive', isCorrect: false },
        ],
        explanation: 'One true case against a hundred false alarms. The test really is 99% accurate — it is the disease being rare that does this. A very good test aimed at a very rare thing still produces mostly false alarms.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'Earlier: correlation isn\'t causation.',
      body: 'Both errors come from trusting a vivid signal over the boring background. There, an eye-catching link hid a hidden cause. Here, an eye-catching test result hides the base rate. Good reasoning always asks: how common was this to begin with?',
      emoji: '🎯',
    },
    {
      type: 'summary',
      title: 'The Base-Rate Trap',
      keyPoints: [
        'Base rate: how common something is beforehand',
        'Start from the base rate, then adjust for evidence',
        'Rare events stay rare even after a strong signal',
        'The fallacy: vivid evidence drowns the background rate',
      ],
      closingThought: 'Before you trust a striking result, ask the quiet question: how common was this to start with?',
    },
  ],
};

export default lesson;

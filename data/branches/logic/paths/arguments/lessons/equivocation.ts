import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'logic-arguments-14',
  slug: 'equivocation',
  title: 'When a Word Changes Costumes',
  description: "Equivocation slides a word's meaning mid-argument so a false conclusion sneaks through.",
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'A ham sandwich beats eternal happiness?',
      subtext: 'The argument looks airtight. The trick is hiding inside one slippery word.',
      emoji: '🥪',
    },
    {
      type: 'example',
      title: 'The Famous Sandwich Syllogism',
      scenario:
        'Nothing is better than eternal happiness. A ham sandwich is better than nothing. Therefore, a ham sandwich is better than eternal happiness. Each line sounds true. The shape mirrors a valid syllogism you would accept anywhere else. Yet the conclusion is plainly absurd. Something is smuggling false certainty through a form that should have protected us.',
      emoji: '⛓️',
    },
    {
      type: 'concept',
      title: 'One Word, Two Meanings',
      body:
        "Equivocation uses a single word in two different senses inside one argument. The form looks valid because the term seems shared — but its meaning quietly shifts, so the logical link never really holds.",
      highlight: 'equivocation',
      visual: '🎭',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you saw hidden premises.',
      body:
        "Earlier the gap was an unstated assumption. Here the gap is a hidden ambiguity. Validity guarantees nothing if a key term means one thing in the first premise and another in the second.",
      emoji: '🔍',
    },
    {
      type: 'quote',
      id: 'lq-logic-arguments-14',
      quote:
        'Contenting themselves with the same words other people use, as if their very sound necessarily carried with it the same meaning.',
      author: 'John Locke',
      era: '1689',
      work: 'An Essay Concerning Human Understanding',
      philosopherId: 'john-locke',
    },
    {
      // The cinematic scene asks this one on the stage, by tapping the shifting
      // word itself (E37c) — same concept, re-cut for the staging.
      type: 'question',
      prompt: 'In the sandwich argument, which word is doing the damage?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: '"Nothing"', isCorrect: true },
          { id: 'b', text: '"Better"', isCorrect: false },
          { id: 'c', text: '"Happiness"', isCorrect: false },
        ],
        explanation: '"Nothing" is the only term that appears in both premises, which is what lets the two lines join at all — and it carries a different sense in each. In the first it means "no thing is better"; in the second, "better than having nothing". The other two words mean the same thing every time they appear, so neither could be the join that failed.',
      },
    },
    {
      type: 'question',
      prompt: 'In the sandwich argument, what actually broke?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          {
            id: 'a',
            text: 'The logic is valid, so the conclusion holds.',
            isCorrect: false,
          },
          {
            id: 'b',
            text: "'Nothing' shifts meaning, so the shared term is fake.",
            isCorrect: true,
          },
          {
            id: 'c',
            text: 'The first premise is simply false.',
            isCorrect: false,
          },
          {
            id: 'd',
            text: 'Eternal happiness cannot be compared to food.',
            isCorrect: false,
          },
        ],
        explanation:
          "This is equivocation. In premise one, 'nothing' means 'no thing is better' — a universal claim. In premise two, 'better than nothing' means 'better than having nothing at all.' The word wears two costumes, so the middle term is not truly shared and the syllogism only looks valid. Option A is the tempting trap: it mistakes valid form for sound reasoning — but a shifting term means the form was never genuinely valid.",
      },
    },
    {
      type: 'summary',
      title: 'What You Now Know',
      keyPoints: [
        'Equivocation shifts a word’s meaning mid-argument.',
        'A shared-looking term can secretly carry two senses.',
        'Valid form fails when the middle term equivocates.',
      ],
      closingThought:
        'Before trusting an argument, ask: does every key word mean the same thing each time it appears?',
    },
  ],
};

export default lesson;

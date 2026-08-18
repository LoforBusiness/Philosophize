import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'metaphysics-being-37',
  slug: 'is-a-glass-fragile-before-it-breaks',
  title: 'Is a Glass Fragile Before It Breaks?',
  description: 'It never shatters. Was the fragility there the whole time?',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'A glass sits on a shelf for ninety years and never breaks.',
      subtext: 'Was it fragile?',
      emoji: '🥂',
    },
    {
      type: 'concept',
      title: 'Dispositions',
      body: 'Fragile, soluble, magnetic, flammable — these say what a thing WOULD do under conditions that may never arrive. They look like ordinary properties and they point at events that never happen, which is what makes them strange.',
      visual: '⚡',
      highlight: 'what a thing would do',
    },
    {
      type: 'example',
      title: 'The Obvious Answer Fails',
      scenario: 'Try: fragile means "if struck, it breaks". Now imagine a sorcerer watching, ready to toughen the glass the instant anyone swings. The glass is fragile and the conditional is false. Nothing was struck, so nothing was tested.',
      source: 'Martin, "Dispositions and Conditionals" (1994)',
    },
    {
      type: 'quote',
      id: 'lq-metaphysics-being-37',
      quote: 'A disposition is a property whose instances are directed toward manifestations that may never occur.',
      author: 'C.B. Martin',
      era: '1994',
    },
    {
      type: 'question',
      prompt: 'Why does "fragile means it breaks if struck" not work?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Something can block the manifestation while the disposition is still there', isCorrect: true },
          { id: 'b', text: 'Because "struck" is too vague to define precisely', isCorrect: false },
          { id: 'c', text: 'Because glasses break for many different reasons', isCorrect: false },
          { id: 'd', text: 'Because the glass might be struck too gently', isCorrect: false },
        ],
        explanation: 'Vagueness and degree are real problems and both can be patched. What cannot be patched is interference: a fink or an antidote makes the conditional false while the glass stays exactly as fragile as it was.',
      },
    },
    {
      type: 'question',
      prompt: 'What follows if dispositions are real properties?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Some facts about a thing are about events that never occur', isCorrect: true },
          { id: 'b', text: 'That every object secretly contains hidden powers', isCorrect: false },
          { id: 'c', text: 'That the future must already be settled', isCorrect: false },
          { id: 'd', text: 'That science can only describe what happens', isCorrect: false },
        ],
        explanation: 'That is the bite. The glass on the shelf really is fragile, and what makes that true is something it would have done. A world of only what actually happens is missing something the glass truly has.',
      },
    },
    {
      type: 'summary',
      title: 'The Property That Points Elsewhere',
      keyPoints: [
        'A disposition says what would happen, not what does',
        'Simple conditionals fail: interference breaks them',
        'The glass is fragile whether or not it is ever struck',
        'So some truths are about events that never happen',
      ],
      closingThought: 'Half of what you know about any object is what it would do. Almost none of that will ever be put to the test.',
    },
  ],
};

export default lesson;

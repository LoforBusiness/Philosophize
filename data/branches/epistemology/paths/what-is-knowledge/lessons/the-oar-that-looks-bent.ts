import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'epistemology-knowledge-41',
  slug: 'the-oar-that-looks-bent',
  title: 'The Oar That Looks Bent',
  description: 'Half an oar goes under water and the whole thing kinks. Three words of the obvious description turn out to be a theory.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'The oar is straight. It looks bent.',
      subtext: 'One of those is a fact about the oar. Which?',
      emoji: '🚣',
    },
    {
      type: 'concept',
      title: 'A Very Short Argument',
      body: 'It runs in three steps. What you see is bent. The oar is not bent. So what you see is not the oar. Each step sounds harmless, and together they push the world one step away from you and put something else in front of it.',
      visual: '🔍',
      highlight: 'push the world one step away from you',
    },
    {
      type: 'example',
      title: 'What Gets Named',
      scenario: 'Russell drew the conclusion and named the thing you actually see a sense-datum. Austin later objected to the first step. Saying the oar looks bent is not reporting that you are seeing a bent object. It is reporting how a straight oar looks in water.',
      source: 'Russell and Austin on perception',
    },
    {
      type: 'quote',
      id: 'lq-epistemology-knowledge-41',
      quote: 'The real table, if there is one, is not immediately known to us at all, but must be an inference from what is immediately known.',
      author: 'Bertrand Russell',
      era: '1912',
      philosopherId: 'bertrand-russell',
    },
    {
      type: 'question',
      prompt: 'Which claim does a direct realist refuse?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'A bent thing is what you are seeing', isCorrect: true },
          { id: 'b', text: 'The oar looks bent', isCorrect: false },
          { id: 'c', text: 'The oar is straight', isCorrect: false },
          { id: 'd', text: 'Water refracts light', isCorrect: false },
        ],
        explanation: 'The middle step. Nobody disputes the look or the oar — the argument would be pointless if either were in doubt. What gets refused is the slide from something looks bent to a bent something is present, and that slide is doing all the work.',
      },
    },
    {
      type: 'question',
      prompt: 'So what are you directly aware of at the waterline?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'The oar, which merely looks bent from here', isCorrect: true },
          { id: 'b', text: 'A bent sense-datum, standing in for the oar', isCorrect: false },
          { id: 'c', text: 'A state of your own mind, and nothing else', isCorrect: false },
          { id: 'd', text: 'Two oars, one real and one apparent', isCorrect: false },
        ],
        explanation: 'The oar. Things look different from different places, and a straight oar in water looking kinked is one of the ways straight oars look. The sense-datum answer buys a tidy story at a heavy price: once you only ever meet the stand-in, the oar itself becomes a guess.',
      },
    },
    {
      type: 'summary',
      title: 'At the Waterline',
      keyPoints: [
        'The oar looks bent and is not bent',
        'The argument concludes you see something else',
        'Its weak step is the slide from looks to is',
        'Sense-data explain the look and lose the world',
      ],
      closingThought: 'Whichever way you go, notice how much theory was hiding in a sentence that sounded like a plain description of a boat.',
    },
  ],
};

export default lesson;

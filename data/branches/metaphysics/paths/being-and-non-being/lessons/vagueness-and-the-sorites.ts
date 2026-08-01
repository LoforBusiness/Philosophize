import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'metaphysics-being-24',
  slug: 'vagueness-and-the-sorites',
  title: 'When Does a Heap Stop Being a Heap?',
  description: 'Remove one grain at a time and watch logic itself start to wobble.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'One grain is not a heap. Add one more — still no heap.',
      subtext: 'Keep going. Somehow a thousand grains is a heap. Where did it become one?',
      emoji: '🏜️',
    },
    {
      type: 'concept',
      title: 'The Sorites Paradox',
      body: 'Start with a clear heap of sand. Removing a single grain cannot turn a heap into a non-heap — one grain is too small to matter. So remove one. Still a heap. Repeat. By the same step you reach a single grain, which is not a heap. Tiny harmless steps lead to a false conclusion.',
      visual: '⏳',
      highlight: 'sorites paradox',
    },
    {
      type: 'example',
      title: 'Baldness and the Missing Hair',
      scenario: 'A man with a full head of hair is not bald. Pluck one hair — surely still not bald; one hair never makes the difference. Pluck again, and again, by the same reasoning he is never bald. Yet eventually his scalp is bare. No single hair was the one that tipped him into baldness — and that is exactly the trouble.',
      emoji: '👨‍🦲',
    },
    {
      type: 'concept',
      title: 'Where Vagueness Bites',
      body: 'Words like heap, bald, tall, and child have fuzzy boundaries — clear cases at each end, a blurred zone between. The paradox forces a choice: deny there is any sharp cut-off, accept a hidden one we can never find, or say there are truths that are neither true nor false in the grey zone.',
      visual: '🌫️',
      highlight: 'fuzzy boundaries',
    },
    {
      type: 'quote',
      id: 'lq-metaphysics-being-24-1',
      quote: 'Everything is vague to a degree you do not realize till you have tried to make it precise.',
      author: 'Bertrand Russell',
      era: '1918',
      work: 'The Philosophy of Logical Atomism',
      philosopherId: 'bertrand-russell',
    },
    {
      type: 'question',
      prompt: 'A friend says: "Just define a heap as 100+ grains. Problem solved." Why does this dodge the puzzle?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'It is the correct solution — vagueness is just sloppy definition', isCorrect: false },
          { id: 'b', text: 'A precise cut-off is arbitrary and clashes with how the vague word actually works', isCorrect: true },
          { id: 'c', text: 'Because 100 is too small a number for sand', isCorrect: false },
          { id: 'd', text: 'Because heaps are not made of grains', isCorrect: false },
        ],
        explanation: 'This is the false-precision dodge. Picking 100 makes 99 grains a non-heap and 100 a heap, with no real difference between them — that sharp line is arbitrary. Worse, it just renames the word; it does not explain why our ordinary, genuinely vague "heap" resists any such boundary.',
      },
    },
    {
      type: 'dilemma',
      scenario: 'A heap loses grains one at a time. At some point in the blurry middle, someone asks of a borderline pile: "Is this a heap — true or false?"',
      prompt: 'What is the status of "This is a heap" in the grey zone?',
      choices: [
        { id: 'a', label: 'It is true or false — there is a hidden sharp line' },
        { id: 'b', label: 'It is neither true nor false' },
        { id: 'c', label: 'It is true to a degree — partly heap, partly not' },
      ],
      views: [
        {
          thinker: 'Epistemicism',
          stance: 'There is a sharp line; we just cannot know it.',
          why: 'Every claim is true or false. One grain really does make the difference between heap and non-heap — but the boundary is hidden from us. Vagueness is ignorance, not a gap in reality or in logic.',
        },
        {
          thinker: 'Supervaluationism',
          stance: 'Borderline cases are neither true nor false.',
          why: 'There are many equally good ways to sharpen "heap." A claim counts as true only if it holds on every sharpening. In the grey zone it holds on some and fails on others — so it is neither.',
        },
        {
          thinker: 'Degree theory',
          stance: 'Truth comes in degrees.',
          why: 'A borderline pile is a heap to degree 0.5, not flatly true or false. As grains vanish, the truth of "this is a heap" slides continuously toward false, matching how vagueness actually feels.',
        },
      ],
      xpValue: 5,
    },
    {
      type: 'reinforcement',
      callout: 'Vagueness is not just careless speech.',
      body: 'Almost every useful word — adult, near, red, alive — has a blurred edge. The sorites shows that classical logic, which assumes every statement is sharply true or false, struggles at those edges. The blur is a feature of language and maybe of the world itself.',
      emoji: '🔍',
    },
    {
      // Added when this lesson became cinematic: the scene's second graded question
      // is answered on the pile, and E37c requires the data to carry the same two
      // questions with the same correct answers.
      type: 'question',
      prompt: 'Which single grain\'s removal is the one that ends the heap?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'None of them — and that absence is the paradox', isCorrect: true },
          { id: 'b', text: 'The one that takes it below a hundred grains', isCorrect: false },
          { id: 'c', text: 'The very last grain to be removed', isCorrect: false },
          { id: 'd', text: 'It differs per pile, so there is no general answer', isCorrect: false },
        ],
        explanation: 'Every removal is harmless taken alone, so no single one can be blamed. The puzzle is not that the grain is hard to find — it is that harmless steps add up to a conclusion nobody accepts.',
      },
    },
    {
      type: 'summary',
      title: 'Living on the Blurry Edge',
      keyPoints: [
        'Tiny harmless steps reach a false conclusion',
        'Heap, bald, tall: fuzzy boundaries everywhere',
        'Epistemicism: hidden sharp line we cannot know',
        'Other views: truth-gaps or degrees of truth',
      ],
      closingThought: 'You now know why "where exactly?" has no good answer — and why that itself is deep.',
    },
  ],
};

export default lesson;

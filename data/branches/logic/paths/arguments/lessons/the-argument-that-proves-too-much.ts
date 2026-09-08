import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'logic-arguments-38',
  slug: 'the-argument-that-proves-too-much',
  title: 'The Argument That Proves Too Much',
  description: 'A monk answered the most famous proof in philosophy by running it again, unchanged, about an island.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Run the same argument about an island.',
      subtext: 'If it still works, something is wrong with it.',
      emoji: '🏝️',
    },
    {
      type: 'concept',
      title: 'Parity of Reasoning',
      body: 'An argument is a shape, and a shape does not care what you pour into it. So pour something else in. If the same steps deliver a conclusion nobody will accept, the steps were never doing the work you thought.',
      visual: '⚙️',
      highlight: 'a shape does not care what you pour into it',
    },
    {
      type: 'example',
      title: 'Gaunilo\'s Island',
      scenario: 'Anselm argued that God is that than which nothing greater can be conceived; that existing is greater than not existing; and so that God exists. The monk Gaunilo replied by swapping one word. Take the island than which no greater island can be conceived. Same steps, and the island exists too.',
      source: 'Gaunilo, On Behalf of the Fool (c. 1078)',
    },
    {
      type: 'quote',
      id: 'lq-logic-arguments-38',
      quote: 'I know not which I ought to regard as the greater fool: myself, or the man who thinks he has proved it.',
      author: 'Gaunilo of Marmoutiers',
      era: 'c. 1078',
    },
    {
      type: 'question',
      prompt: 'What does the island version actually show?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'That the argument form is faulty, whatever it is run on', isCorrect: true },
          { id: 'b', text: 'That the island exists somewhere undiscovered', isCorrect: false },
          { id: 'c', text: 'That islands and gods cannot be compared', isCorrect: false },
          { id: 'd', text: 'That Anselm made an arithmetic mistake', isCorrect: false },
        ],
        explanation: 'Nothing about the island is special, and that is the point. The two runs are the same three steps, so if one is sound the other is too — and the second conclusion is plainly false. Refusing the comparison is not an answer unless you can say which step it breaks.',
      },
    },
    {
      type: 'question',
      prompt: 'A reply to Gaunilo has to do what?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Name a step that holds for God and fails for the island', isCorrect: true },
          { id: 'b', text: 'Insist the original conclusion is true anyway', isCorrect: false },
          { id: 'c', text: 'Show that Gaunilo was not a philosopher', isCorrect: false },
          { id: 'd', text: 'Prove that no perfect island is possible', isCorrect: false },
        ],
        explanation: 'That is exactly what Anselm tried: he argued that a greatest island is an incoherent idea, because an island has no intrinsic maximum, while a greatest being does. Whether that works is still argued. What it is NOT is a refusal to run the parallel.',
      },
    },
    {
      type: 'summary',
      title: 'Running It Again',
      keyPoints: [
        'An argument form works on anything you feed it',
        'Feed it a parallel case and watch the conclusion',
        'An absurd output convicts the form, not the topic',
        'The only real reply names a step that does not carry over',
      ],
      closingThought: 'It is the cheapest test in philosophy and the hardest to answer. Before defending your conclusion, try your reasoning on something you do not already believe.',
    },
  ],
};

export default lesson;

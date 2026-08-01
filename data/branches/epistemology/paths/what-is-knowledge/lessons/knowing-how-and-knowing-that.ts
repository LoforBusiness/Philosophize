import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'epistemology-knowledge-2',
  slug: 'knowing-how-and-knowing-that',
  title: 'Knowing How and Knowing That',
  description: 'Why memorising every step is not the same as being able to do it.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'You have read every word about swimming. Now get in.',
      subtext: 'Some knowledge lives in facts. Some lives only in hands.',
      emoji: '🏊',
    },
    {
      type: 'concept',
      title: 'Two Kinds of Knowing',
      body: 'Knowing THAT is a fact you can state: water is denser than air. Knowing HOW is a capacity you can show: you float. Gilbert Ryle argued these are different achievements, and neither converts into the other for free.',
      visual: '🧠',
      highlight: 'Stating is not doing',
    },
    {
      type: 'example',
      title: 'The Perfect Recipe',
      scenario: 'A cook writes down every step of a dish: weights, timings, the exact colour to stop at. A reader memorises all of it and cooks the dish. It is edible and it is wrong, and neither of them can say which line of the recipe explains why.',
      source: 'After Ryle, The Concept of Mind',
    },
    {
      type: 'quote',
      id: 'lq-epistemology-knowledge-2',
      quote: 'We learn how by practice, schooled indeed by criticism and example, but often quite unaided by any lesson in the theory.',
      author: 'Gilbert Ryle',
      era: '1949',
      work: 'The Concept of Mind',
    },
    {
      type: 'question',
      prompt: 'You have memorised every step perfectly. What do you now have?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Knowledge that — the doing is a separate achievement', isCorrect: true },
          { id: 'b', text: 'Knowledge how, since the steps are what the skill consists in', isCorrect: false },
          { id: 'c', text: 'Nothing at all until you succeed at the task', isCorrect: false },
          { id: 'd', text: 'A guarantee of success on the first attempt', isCorrect: false },
        ],
        explanation: 'The trap is option B, and it is a serious view — intellectualists argue skill just is knowing facts about how. Ryle\'s reply: the expert cannot state most of what they do, yet does it.',
      },
    },
    {
      type: 'question',
      prompt: 'What can a complete set of instructions never hand you?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'The doing itself, which only practice builds', isCorrect: true },
          { id: 'b', text: 'The rules, which always stay partly secret', isCorrect: false },
          { id: 'c', text: 'The reasons behind the rules', isCorrect: false },
          { id: 'd', text: 'Any useful help at all', isCorrect: false },
        ],
        explanation: 'Instructions carry rules and reasons well. What they cannot transfer is the capacity — the reason coaching involves a pool and not just a book.',
      },
    },
    {
      type: 'summary',
      title: 'Two Achievements, Not One',
      keyPoints: [
        'Knowing that is stated; knowing how is shown',
        'Experts cannot state most of their skill',
        'Instructions carry rules, never capacity',
        'Intellectualists disagree — that is live',
      ],
      closingThought: 'The recipe is not the cooking, and reading faster will never close the gap.',
    },
  ],
};

export default lesson;

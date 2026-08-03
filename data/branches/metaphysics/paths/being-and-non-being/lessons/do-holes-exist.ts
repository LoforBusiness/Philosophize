import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'metaphysics-being-31',
  slug: 'do-holes-exist',
  title: 'Do Holes Exist?',
  description: 'You can count them, measure them and fall down them. They are made of nothing.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'There are three holes in this cheese. Three what?',
      subtext: 'You just counted something that is not there.',
      emoji: '🧀',
    },
    {
      type: 'concept',
      title: 'Absences That Behave Like Objects',
      body: 'Holes can be counted, measured, moved and compared. They have shapes and sizes. A cartoon character can carry one around. Everything we do with holes is what we do with objects — and yet a hole is precisely where the object is not.',
      visual: '⭕',
      highlight: 'Nothing, with a shape',
    },
    {
      type: 'example',
      title: 'Argle and Bargle',
      scenario: 'In a 1970 dialogue, David and Stephanie Lewis had two characters argue it out. Bargle says holes are obviously real — count them. Argle agrees they are real, then says what they are: the cheese itself, bent into a ring.',
      source: 'Lewis & Lewis, "Holes" (1970)',
    },
    {
      type: 'quote',
      id: 'lq-metaphysics-being-31',
      quote: 'Shape clay into a vessel; it is the space within that makes it useful.',
      author: 'Laozi',
      era: 'c. 400 BC',
    },
    {
      type: 'question',
      prompt: 'When you count the holes, what are you counting?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'The rims — the cheese bent into a ring around each gap', isCorrect: true },
          { id: 'b', text: 'The gaps themselves, which are objects made of nothing', isCorrect: false },
          { id: 'c', text: 'The cheese, which is the only thing there is', isCorrect: false },
          { id: 'd', text: 'Nothing at all — the count is a figure of speech', isCorrect: false },
        ],
        explanation: 'Argle\'s answer: a hole just is its lining. Count the linings and you have counted the holes, without adding a single immaterial object to the inventory of the world.',
      },
    },
    {
      type: 'question',
      prompt: 'Why does it matter what a hole is?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Because we count and measure absences, and an inventory of the world must say what they are', isCorrect: true },
          { id: 'b', text: 'It does not — say "perforated" instead and nothing is left to explain', isCorrect: false },
          { id: 'c', text: 'Because absences cause things, which proves they are substances', isCorrect: false },
          { id: 'd', text: 'Because only what can be seen or touched exists, and a hole is neither', isCorrect: false },
        ],
        explanation: 'B is respectable: paraphrase the hole-talk away and the problem dissolves. It only has to work — and "there are as many holes as pegs" has resisted paraphrase for fifty years. That is why the question is still live.',
      },
    },
    {
      type: 'summary',
      title: 'Counting Nothing',
      keyPoints: [
        'We quantify over absences constantly and never notice',
        'A hole can be counted, measured and compared',
        'One tidy answer: a hole is its lining, a material thing',
        'Paraphrasing absences away is harder than it sounds',
      ],
      closingThought: 'Metaphysics is mostly this: taking an ordinary sentence seriously enough to ask what would have to exist for it to be true.',
    },
  ],
};

export default lesson;

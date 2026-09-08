import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'epistemology-knowledge-38',
  slug: 'how-nearly-you-were-wrong',
  title: 'How Nearly You Were Wrong',
  description: 'Being right is not enough, and the reason is what would have happened if the day had gone slightly differently.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'You were right. How nearly were you wrong?',
      subtext: 'That question decides whether it was knowledge.',
      emoji: '🎯',
    },
    {
      type: 'concept',
      title: 'Safety',
      body: 'A belief is safe when it would still have been true in the cases nearest to this one. Not every case — just the ones a small change away. A right answer surrounded by wrong ones is a hit, and a hit is not the same as an aim.',
      visual: '🏹',
      highlight: 'a hit is not the same as an aim',
    },
    {
      type: 'example',
      title: 'The Stopped Clock',
      scenario: 'A clock in the hall stopped at ten past four. You glance at it at ten past four and form a true belief about the time. Nothing about your method was careless. But look a minute earlier or a minute later and you are wrong, and the same is true of almost every moment of the day. Right once, in a crowd of near misses.',
      source: 'Bertrand Russell, Human Knowledge, 1948',
    },
    {
      type: 'quote',
      id: 'lq-epistemology-knowledge-38',
      quote: 'They run away out of the human soul, and so are not of much value until they are fastened.',
      author: 'Plato',
      era: 'c. 380 BC',
      philosopherId: 'plato',
    },
    {
      type: 'question',
      prompt: 'Which of these is a true belief that is not knowledge?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Right this time, wrong in almost every nearby case', isCorrect: true },
          { id: 'b', text: 'Right this time, and right in every nearby case', isCorrect: false },
          { id: 'c', text: 'Wrong this time, and wrong in every nearby case', isCorrect: false },
          { id: 'd', text: 'Right this time, after checking it twice', isCorrect: false },
        ],
        explanation: 'The first. The belief is true, so it clears that bar, and the near cases are what it fails. The third is not knowledge either, but it is not a true belief at all — it is simply a mistake, and mistakes were never the puzzle.',
      },
    },
    {
      type: 'question',
      prompt: 'Why does safety look at cases that never happened?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Because they show whether the method tracked the truth', isCorrect: true },
          { id: 'b', text: 'Because possible worlds are more real than this one', isCorrect: false },
          { id: 'c', text: 'Because you can never be sure of anything', isCorrect: false },
          { id: 'd', text: 'Because guessing is always wrong', isCorrect: false },
        ],
        explanation: 'They are the only way to tell an aim from a hit. In this world both look identical: a true belief, arrived at, sitting there. What separates them is what the same method would have delivered a minute earlier, and you cannot read that off the one case you got.',
      },
    },
    {
      type: 'summary',
      title: 'The Near Misses',
      keyPoints: [
        'A true belief can still be an accident',
        'Safety asks what the nearby cases would have given',
        'A hit surrounded by misses is luck, not knowing',
        'The one case you have cannot tell them apart',
      ],
      closingThought: 'Next time you are right about something, ask how much would have had to change for you to be wrong. If the answer is almost nothing, you got away with it.',
    },
  ],
};

export default lesson;

import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'aesthetics-aesthetics-31',
  slug: 'why-do-we-applaud-difficulty',
  title: 'Why Do We Applaud Difficulty?',
  description: 'The same nine notes, played on one string instead of four. Why does the room stand up?',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Identical sound. One performance gets an ovation.',
      subtext: 'Nothing about the music changed. Something did.',
      emoji: '🎻',
    },
    {
      type: 'concept',
      title: 'Two Values in One Room',
      body: 'Paganini could play a whole piece after three strings had snapped. Audiences went wild. But if difficulty were itself beautiful, a badly played hard piece would beat a perfectly played easy one — and nobody believes that.',
      visual: '👏',
      highlight: 'Difficulty is evidence, not beauty',
    },
    {
      type: 'example',
      title: 'The Splice',
      scenario: 'You love a recording. Then you learn it was assembled from four hundred takes, note by note. Nothing you have ever heard has changed. Most people find the recording has changed anyway — which tells you what they were listening for.',
      source: 'The achievement problem in art',
    },
    {
      type: 'quote',
      id: 'lq-aesthetics-aesthetics-31',
      quote: 'If people knew how hard I had to work to gain my mastery, it would not seem so wonderful at all.',
      author: 'Michelangelo',
      era: 'c. 1540',
    },
    {
      type: 'question',
      prompt: 'The sound was identical. What is the extra applause for?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'The player — for what a person managed to do', isCorrect: true },
          { id: 'b', text: 'The difficulty itself, which is a kind of beauty', isCorrect: false },
          { id: 'c', text: 'The music, which sounds better under constraint', isCorrect: false },
          { id: 'd', text: 'Nothing real — the applause is a social reflex', isCorrect: false },
        ],
        explanation: 'Nobody applauds a hard piece played badly, so difficulty is not the good itself. It is evidence of an achievement, and an achievement belongs to a person rather than to a sound.',
      },
    },
    {
      type: 'question',
      prompt: 'So is the harder performance the better artwork?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Not necessarily — achievement and beauty are two values that often arrive together', isCorrect: true },
          { id: 'b', text: 'Yes — the more skill a work takes, the better it is', isCorrect: false },
          { id: 'c', text: 'No — how a work was made has no bearing on how good it is', isCorrect: false },
          { id: 'd', text: 'Yes, but only when the audience can see the difficulty', isCorrect: false },
        ],
        explanation: 'C is strict formalism, and the splice embarrasses it: if the making truly did not matter, finding out would change nothing, and it changes everything. B goes too far the other way — difficulty with nothing to show for it is only effort.',
      },
    },
    {
      type: 'summary',
      title: 'Two Things at Once',
      keyPoints: [
        'A performance can be admired as sound and as achievement',
        'Difficulty is evidence of skill, not a beauty of its own',
        'The splice case shows how much the making matters to us',
        'Two values can point in different directions',
      ],
      closingThought: 'When you applaud, notice what you are applauding. Half the time it is not the thing you heard.',
    },
  ],
};

export default lesson;

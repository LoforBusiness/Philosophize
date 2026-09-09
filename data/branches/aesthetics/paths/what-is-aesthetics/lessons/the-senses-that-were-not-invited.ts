import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'aesthetics-aesthetics-40',
  slug: 'the-senses-that-were-not-invited',
  title: 'The Senses That Were Not Invited',
  description: 'Painting and music got in. Cooking and perfume were turned away at the door, and the reason given was about the senses themselves.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Nobody hangs a dinner in a gallery.',
      subtext: 'Philosophy has an old reason for that, and it is worth arguing with.',
      emoji: '🍽️',
    },
    {
      type: 'concept',
      title: 'Two Senses at the Top',
      body: 'Hegel divided the senses in two. Sight and hearing hold their object at a distance and leave it standing, so you can dwell on it. Smell, taste and touch take hold of the thing and use it up. On that account only the first pair can carry an art.',
      visual: '👁️',
      highlight: 'take hold of the thing and use it up',
    },
    {
      type: 'example',
      title: 'What a Kitchen Answers',
      scenario: 'A tasting menu is built like a piece of music. It opens somewhere, develops, quotes an older dish, and closes. Diners argue about whether the fifth course earned its place. That is not swallowing a pleasure. That is following a form.',
      source: 'the case for an aesthetics of the table',
    },
    {
      type: 'quote',
      id: 'lq-aesthetics-aesthetics-40',
      quote: 'The sensuous aspect of art is related only to the two theoretical senses of sight and hearing, while smell, taste, and touch remain excluded.',
      author: 'G. W. F. Hegel',
      era: '1835',
      philosopherId: 'georg-hegel',
    },
    {
      type: 'question',
      prompt: 'Why were the lower senses shut out?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Their object is consumed in the enjoying', isCorrect: true },
          { id: 'b', text: 'They give a weaker sensation', isCorrect: false },
          { id: 'c', text: 'Nobody else can share what you taste', isCorrect: false },
          { id: 'd', text: 'They developed later in our history', isCorrect: false },
        ],
        explanation: 'Because the thing goes. A painting survives being looked at, so it can be returned to and argued over. Strength was never the claim — a smell can floor you. Privacy is a better objection than the other two, but two people can taste the same dish and disagree about it, which is all a shared judgement needs.',
      },
    },
    {
      type: 'question',
      prompt: 'How far does a great meal actually reach?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'It is about something, and rewards attention', isCorrect: true },
          { id: 'b', text: 'It is a pleasure, and ends with the plate', isCorrect: false },
          { id: 'c', text: 'It is skilled work about nothing at all', isCorrect: false },
          { id: 'd', text: 'It counts as art only when photographed', isCorrect: false },
        ],
        explanation: 'It reaches all the way, or the exclusion needs a better reason. A composed menu has structure, reference and a point of view, and diners argue about it the way they argue about a film. Calling it mere craft is the interesting objection — and craft is exactly what people once said about the novel.',
      },
    },
    {
      type: 'summary',
      title: 'Above the Line',
      keyPoints: [
        'Hegel let only sight and hearing carry art',
        'The reason was that the other senses consume',
        'A composed meal has form, reference and an argument',
        'A vanishing object is a hard case, not a disqualification',
      ],
      closingThought: 'Live music vanishes too, and nobody rules it out for that. The line was drawn once, and it has been quietly moving ever since.',
    },
  ],
};

export default lesson;

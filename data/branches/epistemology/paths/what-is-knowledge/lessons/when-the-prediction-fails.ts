import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'epistemology-knowledge-40',
  slug: 'when-the-prediction-fails',
  title: 'When the Prediction Fails, What Gives?',
  description: 'A theory never faces the evidence by itself. It brings a crowd, and a failed test convicts the whole crowd at once.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'The test failed. Now blame something.',
      subtext: 'Nothing in logic tells you which thing to blame.',
      emoji: '⚖️',
    },
    {
      type: 'concept',
      title: 'Nothing Stands Alone',
      body: 'To test an idea you need more than the idea. You need instruments that work, sums that are right, and a hundred quiet assumptions about the setup. All of it goes into the prediction, so all of it is on trial when the prediction comes back wrong.',
      visual: '🔗',
      highlight: 'all of it is on trial',
    },
    {
      type: 'example',
      title: 'Two Wobbling Planets',
      scenario: 'Uranus did not move as Newton said it should. Le Verrier kept Newton and blamed a planet nobody had seen, and Neptune was found where he pointed. Mercury wobbled too. He tried the same move, named the new planet Vulcan, and this time there was nothing there.',
      source: 'the discovery of Neptune, 1846',
    },
    {
      type: 'quote',
      id: 'lq-epistemology-knowledge-40',
      quote: 'Our statements about the external world face the tribunal of sense experience not individually but as a corporate body.',
      author: 'W. V. O. Quine',
      era: '1951',
      philosopherId: 'willard-van-orman-quine',
    },
    {
      type: 'question',
      prompt: 'A prediction fails. What has the evidence refuted?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'The whole bundle that made the prediction', isCorrect: true },
          { id: 'b', text: 'The main theory, and only that', isCorrect: false },
          { id: 'c', text: 'Nothing — evidence never refutes anything', isCorrect: false },
          { id: 'd', text: 'The instrument that took the reading', isCorrect: false },
        ],
        explanation: 'The bundle. Blaming the main theory alone is the tidy story and it is not what the logic gives you: the theory only reached the evidence with help. Saying nothing is refuted goes too far the other way, because something in there is certainly wrong.',
      },
    },
    {
      type: 'question',
      prompt: 'Mercury still wobbled. Which part turned out to be at fault?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'The law of gravity itself', isCorrect: true },
          { id: 'b', text: 'A planet nobody had spotted yet', isCorrect: false },
          { id: 'c', text: 'Telescopes that were out of true', isCorrect: false },
          { id: 'd', text: 'Arithmetic errors in the tables', isCorrect: false },
        ],
        explanation: 'The law. Einstein got Mercury right by replacing Newton, not by adding a planet. The trap is that the hidden-planet move had just worked brilliantly for Neptune — the same reasoning, the same confidence, and a different answer. Logic alone will not tell you which case you are in.',
      },
    },
    {
      type: 'summary',
      title: 'On Trial Together',
      keyPoints: [
        'A theory reaches the evidence with help',
        'A failed test convicts the whole bundle',
        'You may always save the theory by blaming the help',
        'Which repair is honest is a judgement, not a proof',
      ],
      closingThought: 'This is not a licence to save any theory you like. It is a warning that the evidence never names the culprit for you.',
    },
  ],
};

export default lesson;

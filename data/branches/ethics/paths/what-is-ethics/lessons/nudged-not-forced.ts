import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'ethics-ethics-41',
  slug: 'nudged-not-forced',
  title: 'Nudged, Not Forced',
  description: 'Nobody made you do it, and nobody gave you a reason either. There is a third thing between an argument and a threat.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'You chose freely. The floor was tilted.',
      subtext: 'Both of those can be true at once, and usually are.',
      emoji: '🚪',
    },
    {
      type: 'concept',
      title: 'Three Ways to Move Somebody',
      body: 'You can give them reasons and let them weigh those reasons. You can take the option away. Or you can leave every option open and arrange the situation so that one of them is what happens by default. The third is the one with no obvious name.',
      visual: '🎚️',
      highlight: 'arrange the situation',
    },
    {
      type: 'example',
      title: 'The Default Box',
      scenario: 'Countries where organ donation is opt-out have far higher donation rates than countries where it is opt-in. Nobody is forced, and the form takes the same ten seconds either way. What changed is which answer you get by doing nothing.',
      source: 'default effects in donor registration',
    },
    {
      type: 'quote',
      id: 'lq-ethics-ethics-41',
      quote: 'The human faculties of perception, judgment, discriminative feeling, mental activity, and even moral preference, are exercised only in making a choice.',
      author: 'John Stuart Mill',
      era: '1859',
      philosopherId: 'john-stuart-mill',
    },
    {
      type: 'question',
      prompt: 'What does a nudge work on?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'The habits you fall into instead of deciding', isCorrect: true },
          { id: 'b', text: 'The reasons you would give for your choice', isCorrect: false },
          { id: 'c', text: 'What the choice costs you in money', isCorrect: false },
          { id: 'd', text: 'The range of options in front of you', isCorrect: false },
        ],
        explanation: 'Your habits. Defaults, framing and inertia decide it before any reasoning starts, which is exactly why nudges are cheap and why they work on people who know about them. If it worked on your reasons it would be an argument, and if it changed the options it would be a rule.',
      },
    },
    {
      type: 'question',
      prompt: 'Where does influence stop treating you as somebody who chooses?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'At the nudge, where the reasoning is bypassed', isCorrect: true },
          { id: 'b', text: 'At force, where the option is taken away', isCorrect: false },
          { id: 'c', text: 'It never does, so long as you can still say no', isCorrect: false },
          { id: 'd', text: 'At persuasion, since all influence is the same', isCorrect: false },
        ],
        explanation: 'At the nudge. Force is the obvious wrong and the less interesting one — it overrules your judgement while leaving it intact, and you know exactly what happened. A nudge goes around your judgement and leaves you certain you decided, which is the harder thing to consent to.',
      },
    },
    {
      type: 'summary',
      title: 'The Tilted Floor',
      keyPoints: [
        'Persuasion works through your reasons',
        'Force works by removing an option',
        'A nudge works around both, on your habits',
        'Its trace is that you still feel you chose',
      ],
      closingThought: 'The test is not whether you could have done otherwise. It is whether you were given anything to think with.',
    },
  ],
};

export default lesson;

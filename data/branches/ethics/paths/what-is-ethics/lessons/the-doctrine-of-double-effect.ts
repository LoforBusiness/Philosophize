import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'ethics-ethics-21',
  slug: 'the-doctrine-of-double-effect',
  title: 'Did You Mean It, Or Just Foresee It?',
  description: 'A harm you aim at and a harm you merely predict may be judged differently.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Two acts, same death. Are they morally equal?',
      subtext: 'One person aims at the harm. The other only sees it coming. Many think that gap matters.',
      emoji: '🎯',
    },
    {
      type: 'concept',
      title: 'Intending vs Foreseeing',
      body: 'The doctrine of double effect says it can be permissible to cause a bad outcome you foresee but do not intend, if you are aiming at a genuine good. What you choose as your goal differs from what you merely expect as a side effect.',
      visual: '🔀',
      highlight: 'intend versus foresee',
    },
    {
      type: 'example',
      title: 'Two Doctors, One Dose',
      scenario: 'A doctor gives a dying patient morphine to ease unbearable pain, knowing it may hasten death. A second doctor gives the same dose precisely in order to kill the patient. The drug and the death are identical. The first aims at relief and foresees death; the second aims at death itself. Double effect treats only the first as defensible.',
      source: 'A standard illustration in medical ethics',
      emoji: '💉',
    },
    {
      type: 'concept',
      title: 'The Four Conditions',
      body: 'Classically, the act passes only if: the act itself is not wrong, you intend the good effect, the bad effect is not your means to the good, and the good outweighs the bad. The harm must be a side effect, never the route you take.',
      visual: '📋',
      highlight: 'not the means',
    },
    {
      type: 'quote',
      id: 'lq-ethics-ethics-21-1',
      quote: 'Nothing hinders one act from having two effects, only one of which is intended, while the other is beside the intention.',
      author: 'Thomas Aquinas',
      era: 'c. 1270',
      work: 'Summa Theologica',
      philosopherId: 'thomas-aquinas',
    },
    {
      type: 'dilemma',
      scenario: 'A runaway trolley will kill five. You can divert it onto a side track where it kills one. In a second case, the only way to stop it is to push a large bystander onto the tracks, using his body to halt it. Both save five and lose one.',
      prompt: 'Is the side-track case different from pushing the man?',
      choices: [
        { id: 'a', label: 'Same: one dies to save five either way' },
        { id: 'b', label: 'Different: pushing uses the man as a means' },
      ],
      views: [
        {
          thinker: 'Double Effect',
          stance: 'Diverting is permissible; pushing is not.',
          why: 'On the track, the one death is a foreseen side effect of saving five. Pushing makes the man’s death your means — you need his body to stop the trolley. Intending harm as a tool crosses the line.',
        },
        {
          thinker: 'Utilitarian',
          stance: 'Both are fine; outcomes are identical.',
          why: 'Five live and one dies in each case. If only results count, the inner aim is irrelevant. The fixation on intention versus foresight looks like squeamishness, not a real moral difference.',
        },
      ],
      xpValue: 5,
    },
    {
      type: 'question',
      prompt: 'A general bombs a weapons factory to win the war, knowing some nearby civilians will die. Does double effect condemn this?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Yes, any act that kills civilians is forbidden no matter what', isCorrect: false },
          { id: 'b', text: 'No, if the deaths are an unintended side effect and the good outweighs them', isCorrect: true },
          { id: 'c', text: 'Yes, because foreseeing the deaths is the same as intending them', isCorrect: false },
          { id: 'd', text: 'No, because winning a war justifies absolutely any means', isCorrect: false },
        ],
        explanation: 'Option C is the tempting trap: it collapses foreseeing into intending, erasing the whole point of the doctrine. Double effect insists they differ. Here the civilian deaths are a foreseen side effect, not the general’s means or goal, so the act can pass — provided the military gain truly outweighs the harm. Targeting civilians to terrorize the enemy would fail.',
      },
    },
    {
      type: 'summary',
      title: 'What You Now Know',
      keyPoints: [
        'Intending a harm differs from merely foreseeing it',
        'The harm must never be your means',
        'The good must outweigh the bad effect',
        'Outcome-only views reject the distinction',
      ],
      closingThought: 'Next time you hear "I didn’t mean for that to happen," ask: was the harm the goal, the tool, or just the cost?',
    },
  ],
};

export default lesson;

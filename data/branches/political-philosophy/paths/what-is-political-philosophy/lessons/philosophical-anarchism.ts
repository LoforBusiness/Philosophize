import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'political-political-21',
  slug: 'philosophical-anarchism',
  title: 'Is Any State Legitimate?',
  description: 'If you are autonomous, can anyone have the right to command you? Wolff says no.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'What gives a stranger the right to tell you what to do?',
      subtext: 'Not the power to make you obey, but the right. Wolff thought no state has it.',
      emoji: '🚫',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you asked why anyone should obey the state at all.',
      body: 'In Why Obey the State you weighed reasons to follow the law. Philosophical anarchism takes the doubt further: maybe no state ever holds genuine authority, even if it sometimes happens to be useful.',
      emoji: '🤔',
    },
    {
      type: 'concept',
      title: 'Authority Is Not Just Power',
      body: 'A mugger has power over you, but no authority. Authority is the claimed right to be obeyed simply because it commands. The state claims you must obey its laws because they are its laws, not because you agree with them.',
      visual: '⚖️',
      highlight: 'right to be obeyed',
    },
    {
      type: 'concept',
      title: 'The Clash With Autonomy',
      body: 'Wolff argues a moral adult is autonomous: responsible for judging right and wrong for himself. But obeying a command just because it is commanded means surrendering that judgment. So genuine authority and moral autonomy, he claims, cannot both stand.',
      visual: '🧠',
      highlight: 'autonomy',
    },
    {
      type: 'quote',
      id: 'lq-political-political-21-1',
      quote: 'The defining mark of the state is authority, the right to rule. The primary obligation of man is autonomy, the refusal to be ruled.',
      author: 'Robert Paul Wolff',
      era: '1970',
      work: 'In Defense of Anarchism',
    },
    {
      type: 'example',
      title: 'The Speed Limit You Agree With',
      scenario: 'You drive 30 on a quiet street near a school. Why? Wolff asks: because the sign commands it, or because you judge slowing down to be right? If it is your own judgment, the law added nothing. If it is mere obedience, you handed your conscience to a signpost.',
      source: 'Robert Paul Wolff, In Defense of Anarchism (1970)',
      emoji: '🛑',
    },
    {
      type: 'question',
      prompt: 'A friend says: "Anarchists just want chaos and no rules." Why does that miss philosophical anarchism?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'It confuses denying the state\'s authority with denying all rules and order', isCorrect: true },
          { id: 'b', text: 'Because anarchists secretly do accept the state\'s authority', isCorrect: false },
          { id: 'c', text: 'Because chaos is impossible in any modern society', isCorrect: false },
          { id: 'd', text: 'Because Wolff defended monarchy, not anarchy', isCorrect: false },
        ],
        explanation: 'This is the strawman fallacy. Philosophical anarchism is not "smash everything"; you can still follow rules you judge to be right. It denies only that the state has a special right to your obedience just because it commands.',
      },
    },
    {
      type: 'dilemma',
      scenario: 'A just, democratic law is passed by a fair vote. You voted against it. Wolff says you may still owe it no obedience as such; you should follow it only if you judge it right on the merits. Critics say that makes shared life impossible.',
      prompt: 'Does even a fair democratic law bind you?',
      choices: [
        { id: 'a', label: 'No, only my own moral judgment can bind me' },
        { id: 'b', label: 'Yes, fair procedures create a real duty to obey' },
        { id: 'c', label: 'Only when obeying does no clear harm' },
      ],
      views: [
        {
          thinker: 'Robert Paul Wolff',
          stance: 'Even majorities cannot manufacture authority',
          why: 'Counting votes does not transfer your moral responsibility to others. You remain the one who must answer for your acts, so you must keep judging for yourself rather than deferring to the tally.',
        },
        {
          thinker: 'Democratic theorists',
          stance: 'Fair procedure grounds a duty to obey',
          why: 'If everyone obeyed only laws they personally endorsed, cooperation collapses. Agreeing to decide together, then honoring the outcome, is what makes shared self-rule possible at all.',
        },
      ],
      xpValue: 5,
    },
    {
      // (E37c) The scene asks two graded questions; the data file has to ask the
      // same two. This mirrors the deck question in components/lesson/cinematic.
      type: 'question',
      prompt: 'What would make staying in a country count as agreeing to its authority?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'A genuine, available option to refuse', isCorrect: true },
          { id: 'b', text: 'Knowing that the laws exist', isCorrect: false },
          { id: 'c', text: 'Having been born there', isCorrect: false },
          { id: 'd', text: 'Voting in an election', isCorrect: false },
        ],
        explanation: 'Consent gets its force from the alternative being open — which is why a signature given under threat binds nobody. Leaving means money, papers, a language and another state at the far end, and every scrap of habitable land is already claimed. Hume’s peasant has no such option. Knowing a demand exists is not agreeing to it.',
      },
    },
    {
      type: 'summary',
      title: 'The Anarchist Challenge',
      keyPoints: [
        'Authority is a claimed right to obedience, not mere power',
        'Wolff says autonomy means judging for yourself',
        'So no state may hold genuine authority',
        'This rejects authority, not all rules',
      ],
      closingThought: 'Next time you obey a law, ask: is it the command, or your own judgment, that moves you?',
    },
  ],
};

export default lesson;

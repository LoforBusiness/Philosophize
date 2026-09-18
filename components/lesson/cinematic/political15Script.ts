import type { BaseBeat } from './cinematicKit';

// Cinematic political-political-15, "Breaking the Law to Be Just".
//
// THE PICTURE: four stages drawn as an ascending stair. King and Rawls both say the
// act only counts if you climb all four. Over the lesson the stair is built, and
// then a protest is laid against it that stops at three — so the reader can see the
// missing tread rather than be told about it.
//
// Q1 is A/B/C/D; Q2 is answered on the stair (E34, H65).

export interface Pol15Beat extends BaseBeat {
  /** Figure gesture (emote code). */ p?: number;
  /** Where the figure stands (stage x). */ x?: number;
  /** How many stages of the stair are drawn: 0…4. */ stages?: number;
  /** 1 = the night-time protest is laid against the stair. */ night?: number;
  /** 1 = the four stages are live targets (Q2). */ pick?: number;
  /** 1 = the lawful-routes stage is ruled through: the appeals have failed. */ failed?: number;
}

export const BEATS: Pol15Beat[] = [
  {
    p: 25, x: 70,
    text: 'Breaking a law can be the most law-respecting thing a person does. Martin Luther King Jr. argued so, but only under strict conditions.',
    dur: 4.6,
  },
  {
    p: 270, x: 168, stages: 2,
    text: 'First, a clear and serious wrong must be found. Second, lawful routes must be tried, such as petitions, courts and elections.',
    cite: 'The first two conditions',
    dur: 2.5,
  },
  {
    p: 270, x: 168, stages: 2,
    failed: 1,
    text: 'John Rawls treats civil disobedience as a last resort, justified only after lawful appeals have failed.',
    dur: 2.3,
  },
  {
    p: 40, x: 168, stages: 4,
    text: 'Third, the law is broken openly and without violence. Fourth, the lawbreaker stays and accepts the legal penalty.',
    cite: 'The last two conditions',
    dur: 4.8,
  },
  {
    p: 128, x: 124, stages: 4,
    quote: {
      id: 'lq-political-political-15-1',
      text: 'One who breaks an unjust law must do it openly, lovingly, and with a willingness to accept the penalty.',
      author: 'Martin Luther King Jr.',
      philosopherId: 'martin-luther-king-jr',
      work: 'Letter from Birmingham Jail',
      era: '1963',
      branchSlugs: ['political-philosophy'],
    },
    dur: 4.0,
  },
  {
    p: 383, x: 124, stages: 4, night: 1,
    text: 'Consider a protest that names the injustice, tries the courts and breaks the law openly, then leaves to avoid arrest. It meets three of the four conditions.',
    cite: 'A protest tested',
    dur: 4.8,
  },
  {
    p: 165, x: 124, stages: 4, night: 1,
    interact: {
      prompt: 'Does a protest that breaks the law openly but evades arrest still count as civil disobedience?',
      poll: {
        options: [
          { id: 'crime', reads: 'yes, accepting punishment isn’t required', holders: ['Ronald Dworkin'] },
          { id: 'open', reads: 'only if it accepts the legal penalty', holders: ['Rawls', 'Martin Luther King Jr.'], correct: true },
          { id: 'riot', reads: 'yes, punishing justified disobedience is itself wrong', holders: ['Howard Zinn'] },
          { id: 'stunt', reads: 'yes, when the penalty would be very severe', holders: ['William Scheuerman'] },
        ],
      },
      explain: 'A civil disobedient must accept the legal penalty. For Rawls and King, staying to be punished shows fidelity to law. It makes the breach an appeal, not an evasion.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 6, x: 124, stages: 4, night: 1, pick: 1,
    interact: {
      prompt: 'Which condition did the protest fail to meet?',
      explain: 'Accept the penalty. By staying to be punished, the protester shows fidelity to law. The breach then works as an appeal to the majority’s sense of justice, not as an escape from the law.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'The Conditions of Civil Disobedience',
      points: [
        'Public, nonviolent, conscientious lawbreaking',
        'Accepting the penalty distinguishes it from crime',
        'Lawful channels come first, and breach is a last resort',
        'It appeals to the majority’s sense of justice',
      ],
      closing: 'Civil disobedience is often remembered for the breach, but accepting the penalty is what shows respect for law.',
    },
    dur: 3.0,
  },
];

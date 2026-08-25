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
}

export const BEATS: Pol15Beat[] = [
  {
    p: 25, x: 70,
    text: 'Breaking a law can be the most law-respecting thing a person does. But the conditions are strict, and most lawbreaking fails them.',
    dur: 4.6,
  },
  {
    p: 41, x: 168, stages: 2,
    text: 'Name the injustice, and try the lawful routes first. Petitions, courts, elections. Skipping this is where most claims to civil disobedience fall over.',
    cite: 'The first two',
    dur: 4.8,
  },
  {
    p: 40, x: 168, stages: 4,
    text: 'Then break the law, in daylight, without violence. And then the one that does the real work: stay, and take the punishment the law hands you.',
    cite: 'All four',
    dur: 4.8,
  },
  {
    p: 128, x: 124, stages: 4,
    quote: {
      id: 'lq-political-political-15-1',
      text: 'One who breaks an unjust law must do it openly, lovingly, and with a willingness to accept the penalty.',
      author: 'Martin Luther King Jr.',
      work: 'Letter from Birmingham Jail',
      era: '1963',
      branchSlugs: ['political-philosophy'],
    },
    dur: 4.0,
  },
  {
    p: 13, x: 124, stages: 4, night: 1,
    text: 'Now a protest that named the injustice, tried the courts, and broke the law — then went home by a back route. Lay it against the stair and count.',
    cite: 'A protest, measured',
    dur: 4.8,
  },
  {
    p: 4, x: 124, stages: 4, night: 1,
    interact: {
      prompt: 'A protester smashes windows by night and hides from the police. Civil disobedience?',
      field: {
        xLo: 'HIDDEN', xHi: 'DONE IN THE OPEN',
        yLo: 'TAKES THE PENALTY', yHi: 'RUNS FROM IT',
        start: [0.24, 0.24],
        quads: [
          { id: 'crime', x: 0, y: 0, reads: 'hidden, and no penalty taken: a crime' },
          { id: 'open', x: 1, y: 0, reads: 'open, and the penalty accepted', correct: true },
          { id: 'riot', x: 0, y: 1, reads: 'hidden, and running: still just a crime' },
          { id: 'stunt', x: 1, y: 1, reads: 'open, but running from the cost' },
        ],
      },
      explain: 'The trap is the other card, which is how the phrase is usually used. King and Rawls set a much narrower bar: public, nonviolent, penalty-accepting. Strip those and what is left is ordinary crime with a motive.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 6, x: 124, stages: 4, night: 1, pick: 1,
    interact: {
      prompt: 'Tap the stage that protest skipped.',
      explain: 'Accepting the penalty. That is the tread carrying the weight: staying to be punished is what turns a breach into an appeal addressed to everyone else\'s sense of justice, rather than an escape.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'What You Now Know',
      points: [
        'Public, nonviolent, conscientious lawbreaking',
        'Accepting the penalty distinguishes it from crime',
        'Try legal channels first; breach as last resort',
        'It appeals to the majority\'s sense of justice',
      ],
      closing: 'The part everybody remembers is the breaking. The part that does the work is the staying.',
    },
    dur: 3.0,
  },
];

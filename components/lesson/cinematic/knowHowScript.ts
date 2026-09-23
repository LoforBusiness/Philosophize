import type { BaseBeat } from './cinematicKit';

// Cinematic epistemology-knowledge-2, "Knowing How and Knowing That".
//
// THE PICTURE: a column of instructions that fills up, and an outcome box beneath
// it that stays empty however full the column gets. Over the lesson the column
// reaches the bottom of the wall and the box is still empty — then the column dims
// and the box fills. The argument is which of the two the box was waiting on.
//
// Q1 is A/B/C/D (intellectualism is a real position and needs reading); Q2 is
// answered on the wall, on the concrete shape the picture already made (H65).
//
// The filename is knowHow* rather than epistemology2*: epistemology2Scene is
// already taken, by the branch's second cinematic lesson, which is a different
// lesson entirely (F45b — the numbering in these filenames is not the lesson id).

export interface KnowHowBeat extends BaseBeat {
  /** Figure gesture (emote code). */ p?: number;
  /** Where the figure stands (stage x). 70 = downstage left, 168 = at the wall. */ x?: number;
  /** How many instruction cards are up: 0…3. */ steps?: number;
  /** 1 = the column has dimmed and the outcome box is filled. */ done?: number;
  /** 1 = the three answer cards are live (Q2). */ pick?: number;
  /** 1 = the three instruction slots outline in, empty — the shape of "all that
   *  reading" before any one instruction has been written into it. */
  slots?: boolean;
  /** 1 = an arrow drops from the one instruction so far down toward the box: it
   *  serves an end beyond itself. */
  lead?: boolean;
  /** 1 = a bar gathers all three instructions and drops toward the box, which
   *  still sits empty underneath them. */
  gather?: boolean;
}

export const BEATS: KnowHowBeat[] = [
  {
    p: 164, x: 70,
    text: 'Suppose you’ve read every word ever written about swimming, its physics, technique and breathing.',
    dur: 3,
  },
  {
    p: 164, x: 70, slots: true,
    text: 'Does all that reading, on its own, make you able to swim?',
    dur: 1.8,
  },
  {
    p: 270, x: 168, steps: 1,
    text: 'Consider the instruction “keep the head low”. It’s precise, true and easy to check.',
    cite: 'One instruction',
    dur: 2.9,
  },
  {
    p: 270, x: 168, steps: 1, lead: true,
    text: 'Every instruction serves an end beyond itself. Here the end is the doing, the act of swimming.',
    dur: 1.8,
  },
  {
    p: 435, x: 168, steps: 3,
    text: 'The full method adds more instructions, and you’ve memorised every one. Gilbert Ryle calls knowledge of such facts knowing that.',
    cite: 'The whole method',
    dur: 2.7,
  },
  {
    p: 399, x: 168, steps: 3, gather: true,
    text: 'Even so, the box underneath stays empty. The ability to swim, which Ryle calls knowing how, hasn’t arrived.',
    dur: 1.9,
  },
  {
    p: 147, x: 124, steps: 3,
    quote: {
      id: 'lq-epistemology-knowledge-2-1',
      text: 'We learn how by practice, schooled indeed by criticism and example, but often quite unaided by any lesson in the theory.',
      author: 'Gilbert Ryle',
      philosopherId: 'gilbert-ryle',
      work: 'The Concept of Mind',
      era: '1949',
      branchSlugs: ['epistemology'],
    },
    dur: 3.8,
  },
  {
    p: 383, x: 168, steps: 3, done: 1,
    text: 'The box fills only through practice. Ryle holds that knowing how is distinct from knowing that.',
    cite: 'The doing',
    dur: 4.6,
  },
  {
    p: 4, x: 124, steps: 3, done: 1,
    interact: {
      prompt: 'Which of these does memorising the manual not give you?',
      odd: {
        axis: 'IT GIVES YOU THREE',
        tiles: [
          { id: 'rules', reads: 'THE RULES' },
          { id: 'words', reads: 'THE TERMS' },
          { id: 'order', reads: 'WHAT TO DO FIRST' },
          { id: 'skill', reads: 'BEING ABLE TO DO IT', correct: true },
        ],
      },
      explain: 'Being able to do it. Every fact about swimming can be recited by someone who sinks, which is Ryle\'s point: knowing how is a capacity displayed in the doing, not a longer list of things known that.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 6, x: 124, steps: 3, done: 1, pick: 1,
    interact: {
      prompt: 'What can a complete and correct set of instructions still not give you?',
      explain: 'The doing. Instructions can state rules and give reasons, but they can’t transfer the ability itself. That ability comes through practice, which is why swimmers are coached in the water.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Two Kinds of Knowing',
      points: [
        'Knowing that is knowledge of facts that can be stated',
        'Knowing how is an ability shown in performance',
        'Skilled people often can’t state the rules they follow',
        'Intellectualists hold that knowing how is a form of knowing that',
      ],
      closing: 'For Ryle, a skill is learned mainly by practice, and knowing more facts about it doesn’t amount to having it.',
    },
    dur: 3.0,
  },
];

import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic history-foundations-1, "What Is History?" — the first lesson on the
// History & Politics road, and a DIALOGUE lesson (LESSON_RULES group AP).
// Theme: A SHOP FRONT AT MORNING, A BROKEN WINDOW, AND A BALL LYING IN THE GLASS.
//
// Three people talk, and nobody narrates. The shopkeeper (the newsboy cap, who thinks
// the best of everyone) finds his window broken and blames the wind; the neighbour (the
// woman with the bun) is only pleased to see her ball again; the historian (the top
// hat) shows how the past is worked out, and where politics takes over.
//
// A FOUNDATION LESSON (AP3): what the subject is and why it is worth the reader's
// time, in three ideas and no more — the past is known from evidence, every source has a point of view, and politics is how a group decides.
//
// Every line is written for the ear (groups AC/AD), from its speaker's character
// (cast.ts, AP14), and read in that speaker's voice. `markup` adds only pauses; the
// screen always shows `text`.
// ─────────────────────────────────────────────────────────────────────────────

export interface Hist1Beat extends BaseBeat {
  /**
   * What happens across this beat's line (the scene choreographs it):
   * find — the shopkeeper arrives at his shop and throws up his hands at the window ·
   * ball — the neighbour walks in and points, delighted, at her ball among the glass ·
   * arrive — the historian walks in, tips his hat and crouches to look at the glass ·
   * alibi — the neighbour mimes one small kick, towards the shop ·
   * source — the historian opens a hand to the neighbour, then to the shopkeeper ·
   * pay — the shopkeeper turns out an empty pocket and looks at the hole ·
   * turn — the historian steps from the window to the notice board by the door ·
   * rule — the neighbour chalks a rule on the board, then sees who it applies to ·
   * rest — everyone at ease under the quotation.
   */
  act?: 'find' | 'ball' | 'arrive' | 'alibi' | 'source' | 'pay' | 'turn' | 'rule' | 'rest';
  /** The historian is on the stage. He walks in on `arrive`. */
  th?: boolean;
  /** Q1 on the stage: the ball in the glass, the twig on the pavement and the shut door are the three things to tap. */
  q1?: boolean;
  /** Q2 on the stage: the notice board by the door shows three rows to tap. */
  q2?: boolean;
  /** The notice board: 0 the shop’s hours · 1 the three questions (Q2) · 2 the new rule. */
  board?: number;
}

export const BEATS: Hist1Beat[] = [
  {
    act: 'find', board: 0,
    speaker: 'cap',
    text: 'My window! It was whole when I locked up, so it must have been the wind.',
    markup: 'My window! [pause short] It was whole when I locked up, so it must have been the wind.',
    dur: 1.8,
  },
  {
    act: 'ball', board: 0,
    speaker: 'bun',
    text: 'Oh, brilliant, you found my ball! It’s right there, in your window.',
    markup: 'Oh, brilliant, you found my ball! [pause short] It’s right there, in your window.',
    dur: 1.8,
  },
  {
    act: 'arrive', th: true, board: 0,
    speaker: 'tophat',
    text: 'Nobody here saw it break, and the past is gone. All it leaves behind is evidence, and that’s where history starts.',
    markup: 'Nobody here saw it break, and the past is gone. [pause short] All it leaves behind is evidence, and that’s where history starts.',
    dur: 2.1,
  },
  {
    act: 'alibi', th: true, board: 0,
    speaker: 'bun',
    text: 'It can’t have been me, I only kicked it once. Quite hard, towards the shop.',
    markup: 'It can’t have been me, I only kicked it once. [pause short] Quite hard, towards the shop.',
    dur: 1.8,
  },
  {
    th: true, q1: true, board: 0,
    interact: {
      prompt: 'Which is the best evidence of what broke the window?',
      explain: 'The ball among the glass. It was left behind by the thing that happened. The wind is only a guess until something backs it up.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    act: 'source', th: true, board: 0,
    speaker: 'tophat',
    text: 'Then ask who’s telling each story. Every source has a point of view, so a historian asks who’s speaking, and why.',
    markup: 'Then ask who’s telling each story. [pause short] Every source has a point of view, so a historian asks who’s speaking, and why.',
    dur: 2.1,
  },
  {
    act: 'pay', th: true, board: 0,
    speaker: 'cap',
    text: 'No harm meant, I’m sure. Still, somebody ought to pay for the glass, and I hate to ask.',
    markup: 'No harm meant, I’m sure. [pause short] Still, somebody ought to pay for the glass, and I hate to ask.',
    dur: 1.8,
  },
  {
    act: 'turn', th: true, board: 0,
    speaker: 'tophat',
    text: 'Now the question isn’t what happened, but who decides what happens next. That’s politics.',
    markup: 'Now the question isn’t what happened, but who decides what happens next. [pause short] That’s politics.',
    dur: 2.1,
  },
  {
    th: true, q2: true, board: 1,
    interact: {
      prompt: 'Which one is a question of politics?',
      explain: 'Who decides who pays. History asks what happened, and answers with evidence. Politics asks how a group makes a choice, and who gets a say in it.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    act: 'rule', th: true, board: 2,
    speaker: 'bun',
    text: 'We could make a rule: whoever kicks the ball pays for the window! Oh, no.',
    markup: 'We could make a rule: whoever kicks the ball pays for the window! [pause short] Oh, no.',
    dur: 1.8,
  },
  {
    act: 'rest', th: true, board: 2,
    quote: {
      id: 'lq-history-foundations-1-1',
      text: 'It is a continuous process of interaction between the historian and his facts, an unending dialogue between the present and the past.',
      author: 'E. H. Carr',
      work: 'What Is History?',
      era: '1961',
      branchSlugs: ['history'],
    },
    dur: 3.0,
  },
  {
    th: true, board: 2,
    summary: {
      title: 'What Is History?',
      points: [
        'History works out the past from evidence',
        'Every source has a point of view',
        'Politics is how a group decides',
      ],
      closing: 'Next time you hear what happened, ask who’s telling the story, and how they found out.',
    },
    dur: 2.8,
  },
];

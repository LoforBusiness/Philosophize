import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic political-political-22, "Freedom As Non-Domination"
// Theme: A SWITCH ON SOMEBODY ELSE'S WALL, AND A DAY THAT NOBODY INTERRUPTS.
//
// Republican liberty is a third concept and it is nearly always taught as a
// definition, which is the one form in which it sounds like a quibble. Drawn as
// a switch, it stops being one: the lever is UP for almost the whole lesson.
// Nothing is being done to her. The switch is still on his wall.
//
// The single flip in the middle is not the argument, it is the demonstration —
// and the scene deliberately returns the lever to rest before asking the first
// question, so the reader answers about the state that actually obtains rather
// than about an interference they just watched.
//
// GAMIFIED SHAPE:
//   · beat 3  SCENE TARGETS — tap what makes her unfree while he leaves her be.
//     The lever is the rival and it is the whole of negative liberty (H66); the
//     lever is up, and she is still not free.
//   · beat 7  a FIELD — interference on one axis, standing power on the other,
//     and the cell that matters is the one where they disagree. A pick would
//     hide that the two questions are independent, which is the lesson.
// ─────────────────────────────────────────────────────────────────────────────

export interface Pol22Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** The housing, the slot and the lever, 0…1. */ switchOn?: number;
  /** Her day, drawn as three things she may do, 0…1. */ tiles?: number;
  /** The caption naming the slot, 0…1. */ reach?: number;
  /** The lever down, and her choices struck out, 0…1. */ flip?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Pol22Beat[] = [
  {
    p: 25, x: 200, switchOn: 1, tiles: 1,
    text: 'A servant with a kind employer. He has never once ordered her about. Her day is her own.',
    dur: 4.4,
  },
  {
    p: 2, x: 200, switchOn: 1, tiles: 1, reach: 1,
    text: 'The switch is on his wall, and only he can reach it. That does not go away while he leaves it alone.',
    cite: 'Domination',
    dur: 4.8,
  },
  {
    p: 45, x: 132, switchOn: 1, tiles: 1, reach: 1, flip: 1,
    text: 'If he ever felt like it, this is what happens, and there is nothing whatever she could do about it.',
    dur: 4.6,
  },
  {
    p: 4, x: 132, switchOn: 1, tiles: 1, reach: 1, live: 1,
    interact: {
      prompt: 'The lever is up. Tap what still makes her unfree.',
      explain: 'His reach. Negative liberty only ever reads the lever, and the lever is up, so it reports her free. What she has to live with is not the flipping but the standing possibility, which is why she flatters him and stays watchful.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 21, x: 132, switchOn: 1, tiles: 1, reach: 1,
    text: 'One question asks whether anyone is interfering now. The other asks whether anyone could, whenever they liked.',
    cite: 'Two questions',
    dur: 4.4,
  },
  {
    p: 137, x: 268, switchOn: 1, tiles: 1, reach: 1,
    quote: {
      id: 'lq-political-political-22-2',
      text: 'Someone dominates another if they have the capacity to interfere on an arbitrary basis in certain choices the other is in a position to make.',
      author: 'Philip Pettit',
      work: 'Republicanism',
      era: '1997',
      branchSlugs: ['political-philosophy'],
    },
    dur: 4.4,
  },
  {
    p: 13, x: 268, switchOn: 1, tiles: 1, reach: 1,
    text: 'So the cure is not better manners from the powerful. It is courts, rights and rules that take the switch off the wall.',
    dur: 4.8,
  },
  {
    p: 41, x: 268, switchOn: 1, tiles: 1, reach: 1,
    interact: {
      prompt: 'Place the servant with the kind employer.',
      field: {
        xLo: 'BEING INTERFERED WITH', xHi: 'LEFT ALONE',
        yLo: 'AT HIS WHIM', yHi: 'NOBODY CAN',
        start: [0.24, 0.24],
        quads: [
          { id: 'bossed', x: 0, y: 0, reads: 'ordered about, by someone who may' },
          { id: 'servant', x: 1, y: 0, reads: 'undisturbed, and still not free', correct: true },
          { id: 'taxed', x: 0, y: 1, reads: 'taxed by a law you can challenge' },
          { id: 'free', x: 1, y: 1, reads: 'free on both counts at once' },
        ],
      },
      explain: 'Left alone, and still at his whim. The sideways axis on its own calls her free, and that is the reading being argued with. Notice the other odd cell: a citizen taxed by a law they can vote on is interfered with and not dominated.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'The Switch On His Wall',
      points: [
        'Interference is being stopped; domination is being liable to it',
        'A kind master leaves you unfree, because he could stop being kind',
        'The two questions can give opposite answers',
        'The cure is rules that remove the power, not restraint in using it',
      ],
      closing: 'Freedom here means standing on your own feet, not merely being left undisturbed.',
    },
    dur: 3.8,
  },
];

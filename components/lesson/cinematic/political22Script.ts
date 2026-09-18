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
  /** 1 = her day is marked free by Berlin's test, while the lever is still up. */ berlin?: number;
  /** 1 = the slot is latched: laws, rights and courts, checking the lever. */ checked?: number;
}

export const BEATS: Pol22Beat[] = [
  {
    p: 164, x: 200, switchOn: 1, tiles: 1,
    text: 'Consider a servant with a kind master. He never interferes with how she works, what she says or where she goes.',
    dur: 3.2,
  },
  {
    p: 164, x: 200, switchOn: 1, tiles: 1,
    berlin: 1,
    text: 'Isaiah Berlin called the absence of interference negative liberty. By that standard, the servant is free.',
    dur: 1.8,
  },
  {
    p: 2, x: 200, switchOn: 1, tiles: 1, reach: 1,
    text: 'Yet he could interfere whenever he chose, and she couldn’t stop him. Philip Pettit calls such arbitrary power domination.',
    cite: 'Domination',
    dur: 4.8,
  },
  {
    p: 45, x: 132, switchOn: 1, tiles: 1, reach: 1, flip: 1,
    text: 'If he chose, he could forbid her to work, speak or go out. She would have no means of stopping him.',
    dur: 4.6,
  },
  {
    p: 165, x: 132, switchOn: 1, tiles: 1, reach: 1, live: 1,
    interact: {
      prompt: 'While he leaves her alone, what still makes her unfree?',
      explain: 'His reach. The lever shows only interference, and while it’s up she counts as free. What makes her unfree is his standing power to interfere at will. So she must defer to him and anticipate his moods.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 380, x: 132, switchOn: 1, tiles: 1, reach: 1,
    text: 'Negative liberty asks whether anyone is interfering with you now. Non-domination asks whether anyone could interfere at will.',
    cite: 'Two tests of freedom',
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
    checked: 1,
    text: 'Kindness from the powerful can’t make her free, since it can be withdrawn. Pettit argues that freedom needs laws, rights and courts that check arbitrary power.',
    dur: 4.8,
  },
  {
    p: 383, x: 268, switchOn: 1, tiles: 1, reach: 1,
    interact: {
      prompt: 'Is the servant of a kind master free?',
      poll: {
        options: [
          { id: 'bossed', reads: 'free, if she wants only what she controls', holders: ['Epictetus'] },
          { id: 'servant', reads: 'unfree, since he could interfere at will', holders: ['Philip Pettit', 'Quentin Skinner'], correct: true },
          { id: 'taxed', reads: 'less free, by how likely interference is', holders: ['Ian Carter', 'Matthew Kramer'] },
          { id: 'free', reads: 'free, since no one interferes with her', holders: ['Thomas Hobbes', 'Isaiah Berlin'] },
        ],
      },
      explain: 'Unfree, since he could interfere at will. Living at the mercy of another’s goodwill is itself unfreedom.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Freedom as Non-Domination',
      points: [
        'Negative liberty is the absence of interference',
        'Domination is the power to interfere at will',
        'A kind master’s servant is dominated, and so unfree',
        'The remedy is laws and institutions that check arbitrary power',
      ],
      closing: 'On the republican view, you’re free only when no one holds arbitrary power over you.',
    },
    dur: 3.8,
  },
];

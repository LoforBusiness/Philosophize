import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic political-political-27, "When Is War Just?"
// Theme: TWO GATES ON ONE ROAD, AND A WAR THAT MUST PASS BOTH.
//
// The whole theory is that two verdicts are handed down rather than one, so the
// stage draws two separate gates on a single road. A war that clears the first
// has done nothing about the second, and a picture with one gate in it could not
// say that at all.
//
// Which gate is OPEN is the only thing that ever changes. The road, the frames
// and the boards over them stand still, because the tests do not move — what
// moves is whether a particular war gets through them.
//
// GAMIFIED SHAPE:
//   · beat 4  SCENE TARGETS — three plates, and the reader taps what the two
//     gates hand down. On the stage because both gates are standing open in
//     front of the reader, and the answer is what having two of them means.
//   · beat 8  a SORT — one firebombing, dropped into the verdict it earns. The
//     gates open and shut as the chip travels, so a wrong bin is a picture of a
//     war walking through a gate it should not have cleared.
// ─────────────────────────────────────────────────────────────────────────────

export interface Political27Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** 1 = the road, the gates and their boards are drawn. */ road?: number;
  /** How far the first gate stands open, 0…1. */ entry?: number;
  /** How far the second gate stands open, 0…1. */ conduct?: number;
  /** 1 = the three plates the reader chooses between are up. */ plates?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Political27Beat[] = [
  {
    p: 428, x: 26, road: 1,
    text: 'Pacifists hold that war is always wrong. Realists hold that moral rules don’t apply between states at war.',
    dur: 4.8,
  },
  {
    p: 173, x: 26, road: 1,
    text: 'Just war theory takes a middle position. It judges a war by two separate sets of tests.',
    dur: 4.4,
  },
  {
    p: 436, x: 26, road: 1, entry: 1,
    text: 'The first, jus ad bellum, asks whether going to war is justified. It requires a just cause, and war must be a last resort.',
    dur: 5.0,
  },
  {
    p: 259, x: 26, road: 1, entry: 1, conduct: 1,
    text: 'The second, jus in bello, governs how war is fought. Combatants must not target civilians, and force must be proportionate to its military aim.',
    dur: 5.0,
  },
  {
    p: 162, x: 26, road: 1, entry: 1, conduct: 1, plates: 1, live: 1,
    interact: {
      prompt: 'What does just war theory deliver when it judges a war?',
      explain: 'Two separate verdicts. A war can be just in its cause and unjust in its conduct. A single verdict would let a just cause excuse any means. Nor are the tests scored, because passing one can’t make up for failing the other.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 452, x: 82, road: 1, entry: 1, conduct: 1,
    text: 'Suppose an invaded country fights back, and then firebombs an enemy city to end the war sooner.',
    dur: 5.0,
  },
  {
    p: 431, x: 82, road: 1, entry: 1, conduct: 1,
    quote: {
      id: 'lq-political-political-27-1',
      text: 'The theory of justice should point us, in the absence of compelling reasons of an entirely different kind, toward the violation of rights as the deepest wrong of war.',
      author: 'Michael Walzer',
      work: 'Just and Unjust Wars',
      era: '1977',
      branchSlugs: ['political-philosophy'],
    },
    dur: 5.0,
  },
  {
    p: 448, x: 82, road: 1, entry: 1, conduct: 1,
    text: 'Augustine argued that a war could be just. Aquinas later named three conditions: rightful authority, a just cause and right intention.',
    dur: 5.0,
  },
  {
    p: 175, x: 82, road: 1,
    interact: {
      prompt: 'How does just war theory judge the firebombing of the enemy city?',
      sort: {
        chip: 'firebombing the city',
        bins: [
          { id: 'both', label: 'passes both tests', reads: 'a just cause justifies the means as well' },
          { id: 'first', label: 'passes the first', reads: 'a just war fought by unjust means', correct: true },
          { id: 'none', label: 'fails both', reads: 'no just cause to fight at all' },
        ],
      },
      explain: 'Passes the first. Self-defence against invasion is a just cause, so the decision to fight passes jus ad bellum. Deliberately killing civilians fails jus in bello, even if it shortens the war.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 324, x: 82, road: 1, entry: 1,
    summary: {
      title: 'Just War Theory',
      points: [
        'A middle position between pacifism and realism',
        'Jus ad bellum asks whether going to war is just',
        'Jus in bello asks whether the war is fought justly',
        'A just cause never licenses killing civilians',
      ],
      closing: 'Judging a war requires two questions: whether it was just to begin, and whether it was justly fought.',
    },
    dur: 5.0,
  },
];

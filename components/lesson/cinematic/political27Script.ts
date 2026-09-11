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
    text: 'Pacifists say war is never right. Realists say the rules stop at the border.',
    dur: 4.8,
  },
  {
    p: 173, x: 26, road: 1,
    text: 'Just war theory sits between them and hangs two gates across one road.',
    dur: 4.4,
  },
  {
    p: 436, x: 26, road: 1, entry: 1,
    text: 'The first gate asks whether going to war is justified. A just cause, a last resort, and no better option.',
    dur: 5.0,
  },
  {
    p: 259, x: 26, road: 1, entry: 1, conduct: 1,
    text: 'The second gate asks how the fighting is done. Spare civilians, and use no more force than the job needs.',
    dur: 5.0,
  },
  {
    p: 162, x: 26, road: 1, entry: 1, conduct: 1, plates: 1, live: 1,
    interact: {
      prompt: 'Tap what the two gates hand down.',
      explain: 'Two separate verdicts. A war can be right to start and wrong in the fighting. That’s why the theory keeps the tests apart. One verdict would let a just cause excuse anything done under it. And the gates are not points to add up.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 452, x: 82, road: 1, entry: 1, conduct: 1,
    text: 'A country is invaded and fights back, then firebombs an enemy city to end the war sooner.',
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
    text: 'Augustine argued a war could be just. Aquinas set out the tests: right authority, right cause, right intention.',
    dur: 5.0,
  },
  {
    p: 175, x: 82, road: 1,
    interact: {
      prompt: 'Where does bombing the city leave the two gates?',
      sort: {
        chip: 'bombing the city',
        bins: [
          { id: 'both', label: 'passes both', reads: 'a just cause carries the means as well' },
          { id: 'first', label: 'passes the first', reads: 'right to fight, wrong in the fighting', correct: true },
          { id: 'none', label: 'fails both', reads: 'no standing to take up arms at all' },
        ],
      },
      explain: 'The first gate, and not the second. Self-defence is a just cause, so going to war clears the first test. Killing civilians on purpose fails the second, however few die in total.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 324, x: 82, road: 1, entry: 1,
    summary: {
      title: 'Rules Even in War',
      points: [
        'A middle path between pacifism and anything goes',
        'The first gate asks whether to fight at all',
        'The second gate asks how the fighting is done',
        'A just cause never licences killing civilians',
      ],
      closing: 'When a war is called justified, ask two questions rather than one: just to start, and justly fought.',
    },
    dur: 5.0,
  },
];

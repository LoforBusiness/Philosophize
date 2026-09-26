import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic epistemology-knowledge-2, "Knowing How vs. Knowing That".
// Theme: A SWIMMING POOL, A PILE OF MANUALS AND A BOX THAT STAYS EMPTY.
//
// He reads every book there is about swimming at the side of a pool. The poolside
// board fills with instructions — true, precise, memorised — and the box under it,
// SWIMMING, stays empty however much he reads. It fills only when he gets in the
// water, flails, and swims.
//
// Redrawn 2026-09-26, one of six second lessons redesigned after the first-lesson
// sets; the owner asked for the stage to keep acting for the whole of every voiced
// line (see pace.ts). The narration is unchanged, word for word and beat for beat;
// both questions are new and are asked on the water.
// ─────────────────────────────────────────────────────────────────────────────

export interface KnowHowBeat extends BaseBeat {
  /** His pose under the act. Bands per N2: <100 rig, 100+ held, 300+ played. */ p?: number;
  /** Where he stands on the deck: 186 by the board and at the pool's edge. */ x?: number;
  /** The act across this beat's line (the scene choreographs it). */
  act?: 'read' | 'edge' | 'demo' | 'mime' | 'recite' | 'toe' | 'swim' | 'back';
  /** How many books are piled on the bench. */ books?: number;
  /** The board's three instruction slots are outlined, still empty. */ slots?: boolean;
  /** How many instructions are written on the board: 0…3. */ steps?: number;
  /** An arrow runs from the instruction down to the box: it serves an end beyond itself. */ lead?: boolean;
  /** The board's instructions are tagged KNOWING THAT. */ that?: boolean;
  /** The box is named: SWIMMING = KNOWING HOW. */ how?: boolean;
  /** The box is ticked: the ability has arrived, through practice. */ done?: boolean;
  /** Q1 on the water: four kickboards. */ boards?: boolean;
  /** Q2 on the water: three buoys on the lane rope. */ buoys?: boolean;
}

export const BEATS: KnowHowBeat[] = [
  {
    p: 164, x: 186, act: 'read', books: 4,
    text: 'Suppose you’ve read every word ever written about swimming, its physics, technique and breathing.',
    dur: 3,
  },
  {
    p: 164, x: 186, act: 'edge', books: 4, slots: true,
    text: 'Does all that reading, on its own, make you able to swim?',
    dur: 1.8,
  },
  {
    p: 270, x: 186, act: 'demo', books: 4, slots: true, steps: 1,
    text: 'Consider the instruction “keep the head low”. It’s precise, true and easy to check.',
    cite: 'One instruction',
    dur: 2.9,
  },
  {
    p: 270, x: 186, act: 'mime', books: 4, slots: true, steps: 1, lead: true,
    text: 'Every instruction serves an end beyond itself. Here the end is the doing, the act of swimming.',
    dur: 1.8,
  },
  {
    p: 435, x: 186, act: 'recite', books: 5, slots: true, steps: 3, lead: true, that: true,
    text: 'The full method adds more instructions, and you’ve memorised every one. Gilbert Ryle calls knowledge of such facts knowing that.',
    cite: 'The whole method',
    dur: 2.7,
  },
  {
    p: 399, x: 186, act: 'toe', books: 5, slots: true, steps: 3, lead: true, that: true, how: true,
    text: 'Even so, the box underneath stays empty. The ability to swim, which Ryle calls knowing how, hasn’t arrived.',
    dur: 1.9,
  },
  {
    p: 147, x: 240, books: 5, slots: true, steps: 3, lead: true, that: true, how: true,
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
    p: 383, x: 370, act: 'swim', books: 5, slots: true, steps: 3, lead: true, that: true, how: true, done: true,
    text: 'The box fills only through practice. Ryle holds that knowing how is distinct from knowing that.',
    cite: 'The doing',
    dur: 4.6,
  },
  {
    p: 4, x: 226, act: 'back', books: 5, slots: true, steps: 3, lead: true, that: true, how: true, done: true, boards: true,
    interact: {
      prompt: 'Which of these kickboards doesn’t come with memorising the manual?',
      explain: 'Being able to do it. Every fact about swimming can be recited by someone who sinks, which is Ryle’s point: knowing how is a capacity shown in the doing, not a longer list of things known that.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 6, x: 226, books: 5, slots: true, steps: 3, lead: true, that: true, how: true, done: true, buoys: true,
    interact: {
      prompt: 'What can a complete and correct set of instructions still not give you?',
      explain: 'The doing. Instructions can state rules and give reasons, but they can’t hand over the ability itself. That comes through practice, which is why swimmers are coached in the water.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    x: 226, books: 5, slots: true, steps: 3, lead: true, that: true, how: true, done: true,
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

import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic philosophy-foundations-5, "What Makes You You?" — the fifth lesson on the
// Philosophy road, and a DIALOGUE lesson (LESSON_RULES group AP).
// Theme: AN ORBITING SPACE LAB, A TELEPORTER POD, AND A SCREEN SHOWING THE MOON BASE.
//
// Three people talk, and nobody narrates. An engineer (the woman with the bun) has warmed
// up the lab's teleporter; a volunteer (the plain mascot) is desperate to be the first man
// to use it, until he hears what happens to the old him; the philosopher (the top hat)
// arrives to ask what makes a person the same person. Then the pod jams, and there are two.
//
// A ROAD THAT RAMPS UP (group AU): the first lesson on this road asked whether a bicycle
// with every part replaced is the same bicycle. This one asks it of a PERSON, gives the
// two answers people actually hold, and then breaks the easier one: three ideas, harder
// than any before it — you might be your body · you might be your memories · a perfect
// duplicate shows memories alone can't settle it.
//
// Every line is written for the ear (groups AC/AD), from its speaker’s character
// (cast.ts, AP14; group AS), and read at the pace its words ask for (AP17, AP21).
// ─────────────────────────────────────────────────────────────────────────────

export interface Phil5Beat extends BaseBeat {
  /**
   * What happens across this beat’s line (the scene choreographs it):
   * warm — the engineer works the console, and the pod’s ring lights up and hums ·
   * volunteer — the volunteer strides up onto the pod’s step and strikes a pose for history, an arm flung up and out ·
   * recycle — the engineer pats the recycling hatch under the pod; it drops open on the glowing grinder and clanks shut, while the volunteer lifts a foot to step in ·
   * hesitate — the volunteer stops dead with one foot in the pod and backs out; the philosopher floats in through the hatch from the corridor ·
   * views — the philosopher holds a hand toward the pod (the body), then turns and raises one to the Moon on the screen (the memories) ·
   * beam — the volunteer steps in, the door slides shut, a flash, and on the screen he steps out on the Moon ·
   * jam — the engineer bangs the console; the pod door opens and the volunteer is still in it, with his double on the screen ·
   * claim — the volunteer points at himself, then at the screen, where his double points back at the same moment ·
   * tie — the philosopher stands between the pod and the screen, a hand toward each ·
   * rest — everyone at ease under the quotation, the Earth turning past the window.
   */
  act?: 'warm' | 'volunteer' | 'recycle' | 'hesitate' | 'views' | 'beam' | 'jam' | 'claim' | 'tie' | 'rest';
  /** The philosopher is on the stage. He floats in on `hesitate`. */
  sage?: boolean;
  /** How many of the volunteer there are: 1 · 2 once the pod has jammed (one here, one on the screen). */
  copies?: number;
  /**
   * First question on the stage — FOLLOW HIM: three places he could be after the trip,
   * the Moon screen, the empty pod and the recycling hatch, are the things to tap.
   */
  where?: boolean;
  /**
   * Second question on the stage — WEIGH THE CLAIMS: the volunteer in the pod, his double
   * on the screen, and the brass balance on the console between them (AN EQUAL CLAIM) are
   * the things to tap.
   */
  claim?: boolean;
}

export const BEATS: Phil5Beat[] = [
  {
    bed: 'spacelab',
    sfx: [{ id: 'boop', at: 0.65, gain: 0.8 }, { id: 'boop', at: 1.46, gain: 0.8 }],
    act: 'warm', copies: 1,
    speaker: 'bun',
    text: 'The pod’s warmed up! It scans every atom of you, beams the plan to the Moon, and builds you there.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'volunteer', copies: 1,
    speaker: 'plain',
    text: 'The first man ever to teleport. They’ll put my face on a stamp.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'crate', at: 2.86, gain: 0.7 }],
    act: 'recycle', copies: 1,
    speaker: 'bun',
    text: 'Oh, and the pod breaks the old you down for parts. We can’t have two of you walking around.',
    pace: ['brisk', 'even'],
    dur: 1.8,
  },
  {
    act: 'hesitate', sage: true, copies: 1,
    speaker: 'tophat',
    text: 'Now he hesitates. Whether the man on the Moon is you depends on what makes you you.',
    pace: 'even',
    dur: 2.1,
  },
  {
    act: 'views', sage: true, copies: 1,
    speaker: 'tophat',
    text: 'If you’re your body, you end here and a copy wakes up. If you’re your memories, you travel to the Moon.',
    pace: 'even',
    dur: 2.1,
  },
  {
    sage: true, copies: 1, where: true,
    interact: {
      prompt: 'On the memory view, where will he be after the trip?',
      explain: 'On the Moon. The man who steps out there remembers everything he does, so on the memory view it’s him. The pod and the hatch only end up with his old body.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    sfx: [{ id: 'slidedoor', at: 2.78, gain: 0.7 }, { id: 'teleport', at: 3.38, gain: 0.8 }],
    act: 'beam', sage: true, copies: 1,
    speaker: 'plain',
    text: 'Fine. My memories are magnificent anyway. Beam them up.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'thud', at: 0.47, gain: 0.7 }, { id: 'slidedoor', at: 1.12, gain: 0.7 }],
    act: 'jam', sage: true, copies: 2,
    speaker: 'bun',
    text: 'Oops, the recycler jammed. Now there’s one of him in here and one on the Moon!',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'claim', sage: true, copies: 2,
    speaker: 'plain',
    text: 'I’m the real one. He’s a very handsome copy, but a copy.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'tie', sage: true, copies: 2,
    speaker: 'tophat',
    text: 'And he’d say the same, with the same memories. One person can’t be two people, so memories alone can’t settle who’s you.',
    pace: ['even', 'weighty'],
    dur: 2.1,
  },
  {
    sage: true, copies: 2, claim: true,
    interact: {
      prompt: 'Both men remember being him. On the memory view, who has the better claim?',
      explain: 'Neither. Each remembers every day of his life, so on the memory view their claims weigh the same. That tie is the puzzle, because one person can’t be two.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    act: 'rest', sage: true, copies: 2,
    quote: {
      id: 'lq-philosophy-foundations-5-1',
      text: 'As far as this consciousness can be extended backwards to any past action or thought, so far reaches the identity of that person.',
      author: 'John Locke',
      work: 'An Essay Concerning Human Understanding',
      era: '1694',
      branchSlugs: ['philosophy'],
    },
    dur: 3.0,
  },
  {
    sage: true, copies: 2,
    summary: {
      title: 'What Makes You You?',
      points: [
        'On one view, you are your body',
        'On another, you are your memories',
        'A duplicate shows memories alone can’t settle who you are',
      ],
      closing: 'Next time you see a photo of yourself as a child, ask what makes that child you.',
    },
    dur: 2.8,
  },
];

import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic psychology-foundations-4, "Why We Follow the Crowd" — the fourth lesson on
// the Psychology road, and a DIALOGUE lesson (LESSON_RULES group AP).
// Theme: A BUS SHELTER, A YELLOW NOTICE ON THE POST, AND A TIMETABLE.
//
// Three people talk, and nobody narrates. A commuter (the woman with the bun) waits at a
// bus stop because it has always been her stop; a passer-by (the newsboy cap) joins her
// because somebody is waiting; the psychologist (the top hat) reads the notice neither
// of them read, and names what they did.
//
// A FOUNDATION LESSON (AP3), three ideas and no more: when unsure, people copy what
// others do · that is often a sensible shortcut · a crowd can be wrong together, so
// check for yourself.
//
// Every line is written for the ear (groups AC/AD), from its speaker’s character
// (cast.ts, AP14; group AS), and read at the pace its words ask for (AP17).
// ─────────────────────────────────────────────────────────────────────────────

export interface Psych4Beat extends BaseBeat {
  /**
   * What happens across this beat’s line (the scene choreographs it):
   * wait — the commuter stands under the shelter, coffee in hand, and leans out to look
   *   down the road for the bus, a hand at her brow ·
   * join — the passer-by walks up from the left, sees her waiting, and stands beside her,
   *   a hand opened to her ·
   * notice — the psychologist walks in from the right, tips his hat at the post and taps
   *   the yellow notice tied round it; the two of them turn to him ·
   * copied — the passer-by puts a hand to his chest, then opens it to the commuter ·
   * proof — the psychologist points from the passer-by to the commuter, then opens a hand ·
   * useful — he turns to the café up the street and opens a hand to it; she lifts her
   *   coffee ·
   * team — the commuter turns, steps up to the passer-by and gives his arm a little
   *   nudge; he rocks back ·
   * wrong — the psychologist taps the notice twice, firmly, then opens a hand to them ·
   * walk — the passer-by turns and points round the corner, walks a few steps toward it
   *   and turns back to wave them on; the commuter follows ·
   * rest — everyone at ease under the quotation; the commuter sips her coffee.
   */
  act?: 'wait' | 'join' | 'notice' | 'copied' | 'proof' | 'useful' | 'team' | 'wrong' | 'walk' | 'rest';
  /** The psychologist is on the stage. He walks in on `notice`. */
  doc?: boolean;
  /** The passer-by is waiting at the stop. He walks up on `join`. */
  pal?: boolean;
  /** First question on the stage: the commuter waiting, the yellow notice and the timetable are the things to tap. */
  copy?: boolean;
  /** Second question on the stage: the yellow notice, the timetable and the advert on the shelter are the things to tap. */
  sure?: boolean;
}

export const BEATS: Psych4Beat[] = [
  {
    bed: 'street',
    act: 'wait',
    speaker: 'bun',
    text: 'The bus stop is very quiet this morning. Everyone must be on holiday.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'join', pal: true,
    speaker: 'cap',
    text: 'Oh good, someone’s waiting. This must be the right stop, then.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'knock', at: 3.71, gain: 0.8 }],
    act: 'notice', pal: true, doc: true,
    speaker: 'tophat',
    text: 'Neither of you has read the notice on this post. The stop has been closed all week.',
    pace: 'even',
    dur: 2.1,
  },
  {
    act: 'copied', pal: true, doc: true,
    speaker: 'cap',
    text: 'Oh, I’m sorry. I only stopped here because I saw her waiting.',
    pace: 'even',
    dur: 1.8,
  },
  {
    act: 'proof', pal: true, doc: true,
    speaker: 'tophat',
    text: 'When people are unsure what to do, they copy what others are doing. Psychologists call it social proof.',
    pace: 'even',
    dur: 2.1,
  },
  {
    pal: true, doc: true, copy: true,
    interact: {
      prompt: 'What made him decide this was the right stop?',
      explain: 'The woman waiting. He saw somebody there and copied her. The notice says the stop is closed, and he never looked at the timetable.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    act: 'useful', pal: true, doc: true,
    speaker: 'tophat',
    text: 'Copying is often sensible. A queue outside a café usually means the coffee is good.',
    pace: 'even',
    dur: 2.1,
  },
  {
    sfx: [{ id: 'whoosh', at: 3.41, gain: 0.8 }],
    act: 'team', pal: true, doc: true,
    speaker: 'bun',
    text: 'So he copied me, and I felt sure because he came. That sounds like teamwork to me.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'knock', at: 2.94, gain: 0.8 }, { id: 'knock', at: 3.72, gain: 0.8 }],
    act: 'wrong', pal: true, doc: true,
    speaker: 'tophat',
    text: 'No. When everybody copies everybody, nobody checks. A crowd can be wrong all together.',
    pace: 'even',
    dur: 2.1,
  },
  {
    pal: true, doc: true, sure: true,
    interact: {
      prompt: 'Where should they look to find out for certain?',
      explain: 'The yellow notice. It says the stop is closed, and where to go instead. The timetable was printed before the change, and the advert is selling shampoo.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    act: 'walk', pal: true, doc: true,
    speaker: 'cap',
    text: 'The new stop is round the corner. Come on, I’ll walk you both there.',
    pace: 'even',
    dur: 1.8,
  },
  {
    act: 'rest', pal: true, doc: true,
    quote: {
      id: 'lq-psychology-foundations-4-1',
      text: 'We view a behavior as more correct in a given situation to the degree that we see others performing it.',
      author: 'Robert Cialdini',
      work: 'Influence',
      era: '1984',
      branchSlugs: ['psychology'],
    },
    dur: 3.0,
  },
  {
    pal: true, doc: true,
    summary: {
      title: 'Why We Follow the Crowd',
      points: [
        'When unsure, people copy what others do',
        'Copying is often a sensible shortcut',
        'A crowd can be wrong, so check for yourself',
      ],
      closing: 'Next time you follow a crowd, ask who in it checked first.',
    },
    dur: 2.8,
  },
];

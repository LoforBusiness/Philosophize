import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic philosophy-foundations-3, "How Do We Decide What’s Right?" — the third
// lesson on the Philosophy road, and a DIALOGUE lesson (LESSON_RULES group AP).
// Theme: A LIBRARY RETURNS DESK, A BORROWED NOVEL, AND A TWENTY-POUND NOTE.
//
// Three people talk, and nobody narrates. A reader (the woman with the bun) finds a
// twenty-pound note inside the novel she is returning and is delighted; the librarian
// (the newsboy cap) is kind and worried for whoever lost it; the philosopher (the top
// hat) shows the two main ways of deciding what is right.
//
// A FOUNDATION LESSON (AP3), three ideas and no more: one way judges an act by its
// consequences, who is helped and who is harmed · another by rules that hold whatever
// happens next · both ask for a reason, and here they agree.
//
// Every line is written for the ear (groups AC/AD), from its speaker’s character
// (cast.ts, AP14), and read at the pace its words ask for (AP17).
// ─────────────────────────────────────────────────────────────────────────────

export interface Phil3Beat extends BaseBeat {
  /**
   * What happens across this beat’s line (the scene choreographs it):
   * find — the reader opens the returned novel on the desk and the note slides out; she
   *   holds it up to the light ·
   * worry — the librarian looks up from stamping books, puts a hand to his chest, then
   *   takes a notice off the desk and pins it to the noticeboard ·
   * arrive — the philosopher walks in from the left, stops by the lost property box and
   *   tips his hat; the reader turns to him ·
   * weigh — he holds out both hands like a pair of scales, one high and one low ·
   * happy — the reader hugs the note to her chest and does a little twirl ·
   * rule — the philosopher points up at the FOUND PROPERTY sign over the desk ·
   * sign — the librarian lifts his date stamp off the books, raises it to the sign over
   *   the desk, then taps the desk with it and sets it back ·
   * agree — the philosopher brings his two hands together, level ·
   * hand — the reader drops the note into the lost property box with a sigh ·
   * rest — everyone at ease under the quotation.
   */
  act?: 'find' | 'worry' | 'arrive' | 'weigh' | 'happy' | 'rule' | 'sign' | 'agree' | 'hand' | 'rest';
  /** The philosopher is on the stage. He walks in on `arrive`. */
  th?: boolean;
  /** The note: 0 inside the novel · 1 in her hand · 2 in the lost property box. */
  note?: number;
  /** The LOST poster on the noticeboard: 0 not yet pinned · 1 up (the librarian pins it on `worry`). */
  poster?: number;
  /** First question on the stage: the LOST poster, the novel and the stamp are the things to tap. */
  harm?: boolean;
  /** Second question on the stage: the FOUND PROPERTY sign, the LOST poster and the box are the things to tap. */
  duty?: boolean;
}

export const BEATS: Phil3Beat[] = [
  {
    bed: 'room',
    sfx: [{ id: 'book', at: 0.32, gain: 0.8 }, { id: 'stamp', at: 0.96, gain: 0.8 }],
    act: 'find', note: 1, poster: 0,
    speaker: 'bun',
    text: 'Look what fell out of my library book! Twenty pounds, and no name on it anywhere.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'paper', at: 1.92, gain: 0.8 }, { id: 'pin', at: 3.32, gain: 0.8 }],
    act: 'worry', note: 1, poster: 1,
    speaker: 'cap',
    text: 'Oh, the poor soul who lost that. I’ll pin a notice up, just in case.',
    pace: 'even',
    dur: 1.8,
  },
  {
    act: 'arrive', th: true, note: 1, poster: 1,
    speaker: 'tophat',
    text: 'Keep it, or hand it in? Philosophers have two main ways of deciding what’s right.',
    pace: 'even',
    dur: 2.1,
  },
  {
    act: 'weigh', th: true, note: 1, poster: 1,
    speaker: 'tophat',
    text: 'The first looks at consequences. You ask who your choice will help, and who it will harm.',
    pace: 'even',
    dur: 2.1,
  },
  {
    th: true, note: 1, poster: 1, harm: true,
    interact: {
      prompt: 'Judging by consequences, what matters most about that note?',
      explain: 'The LOST poster. Somebody is out twenty pounds and worried about it, and keeping the note harms them. The novel and the stamp aren’t hurt either way.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    act: 'happy', th: true, note: 1, poster: 1,
    speaker: 'bun',
    text: 'But if nobody comes back for it, then everybody’s happy. Especially me!',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'rule', th: true, note: 1, poster: 1,
    speaker: 'tophat',
    text: 'The second way looks at rules. Some things are wrong whatever happens next, and taking what isn’t yours is one of them.',
    pace: 'even',
    dur: 2.1,
  },
  {
    sfx: [{ id: 'stamp', at: 3.02, gain: 0.8 }],
    act: 'sign', th: true, note: 1, poster: 1,
    speaker: 'cap',
    text: 'The rule’s on the wall, love. Anything found comes straight to the front desk.',
    pace: 'even',
    dur: 1.8,
  },
  {
    act: 'agree', th: true, note: 1, poster: 1,
    speaker: 'tophat',
    text: 'Here, both ways agree. Each one asks you for a reason, and a good reason still holds when you say it out loud.',
    pace: 'even',
    dur: 2.1,
  },
  {
    th: true, note: 1, poster: 1, duty: true,
    interact: {
      prompt: 'She hands the note in. Which reason is a rule, not a consequence?',
      explain: 'The FOUND PROPERTY sign. It says what to do whatever happens next. The poster is about who gets hurt, which is the consequences way, and the box is only where the note goes.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    sfx: [{ id: 'paper', at: 2.21, gain: 0.8 }],
    act: 'hand', th: true, note: 2, poster: 1,
    speaker: 'bun',
    text: 'Fine, the note goes in the box. Goodbye, twenty pounds, you were lovely!',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'rest', th: true, note: 2, poster: 1,
    quote: {
      id: 'lq-philosophy-foundations-3-1',
      text: 'It is the greatest happiness of the greatest number that is the measure of right and wrong.',
      author: 'Jeremy Bentham',
      work: 'A Fragment on Government',
      era: '1776',
      branchSlugs: ['philosophy'],
    },
    dur: 3.0,
  },
  {
    th: true, note: 2, poster: 1,
    summary: {
      title: 'How Do We Decide What’s Right?',
      points: [
        'One way weighs who an act helps and harms',
        'Another follows rules, whatever happens next',
        'Both ask you for a reason you can say out loud',
      ],
      closing: 'Next time you face a hard choice, ask who it helps, and which rule it keeps.',
    },
    dur: 2.8,
  },
];

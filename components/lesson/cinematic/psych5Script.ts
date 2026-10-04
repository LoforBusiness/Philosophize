import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic psychology-foundations-5, "When the Saucer Doesn’t Come" — the fifth lesson
// on the Psychology road, and a DIALOGUE lesson (LESSON_RULES group AP).
// Theme: A HILLTOP AT MIDNIGHT, A LANTERN-LIT LANDING FIELD, AND THREE PACKED SUITCASES.
//
// Three people talk, and nobody narrates. A self-appointed prophet (the plain mascot)
// has promised that a flying saucer lands on this hill at midnight; a believer (the
// newsboy cap) sold his car to be here and baked the visitors a cake; a psychologist (the
// top hat) has come to watch what they do when midnight passes and nothing lands. A
// homage to the group Leon Festinger's team studied in 1954.
//
// A ROAD THAT RAMPS UP (group AU): this road has shown memory rebuilding the past, people
// seeing what they expect, and crowds copying each other. This lesson puts them under
// pressure at once: three ideas, harder than any before — clashing thoughts cause
// discomfort, called cognitive dissonance · people ease it by changing the story, not the
// belief · the more a belief cost, the harder it is to drop. Its first question is asked
// BEFORE anything is explained: the reader predicts, then finds out.
//
// Every line is written for the ear (groups AC/AD), from its speaker’s character
// (cast.ts, AP14; group AS), and read at the pace its words ask for (AP17, AP21).
// ─────────────────────────────────────────────────────────────────────────────

export interface Psych5Beat extends BaseBeat {
  /**
   * What happens across this beat’s line (the scene choreographs it):
   * proclaim — the prophet stands on a crate between the lanterns, arms wide to the sky ·
   * cake — the believer lifts a lemon cake off his suitcase and holds it up to the stars ·
   * notebook — the psychologist, behind a gorse bush at the edge of the field, writes in his notebook ·
   * saved — the clock on the post reads past midnight; the prophet crouches, snatches up WE SAVED THE WORLD and holds it high ·
   * relief — the believer hugs the cake to his chest ·
   * clash — the psychologist steps out and brings two fingers together until they knock ·
   * story — he taps his notebook, then points at the prophet’s sign ·
   * cost — he points at the believer’s suitcase ·
   * posters — the prophet turns his sign round (its back reads NEXT TUES, the new date) and pastes it up on the clock post over his old TONIGHT poster ·
   * rest — everyone at ease under the quotation, the lanterns burning low.
   */
  act?: 'proclaim' | 'cake' | 'notebook' | 'saved' | 'relief' | 'clash' | 'story' | 'cost' | 'posters' | 'rest';
  /** Midnight has passed: 0 not yet · 1 the clock on the post reads past twelve, and nothing has landed. */
  past?: number;
  /** The psychologist has stepped out from behind the bush (he does on `clash`). */
  seen?: boolean;
  /**
   * First question on the stage — CALL IT BEFORE IT HAPPENS: three signs leaning on the
   * prophet’s crate, WE WERE WRONG, WE SAVED THE WORLD and LET’S GO HOME, are the things
   * to tap. It is asked before anything is explained.
   */
  next?: boolean;
  /**
   * Second question on the stage — READ THE LUGGAGE TAGS: three packed suitcases, each
   * tagged with what its owner gave up (A WEEKEND, A CAR, A HOUSE AND A JOB), are the
   * things to tap.
   */
  luggage?: boolean;
}

export const BEATS: Psych5Beat[] = [
  {
    bed: 'night',
    act: 'proclaim', past: 0,
    speaker: 'plain',
    text: 'At midnight a saucer lands on this hill and takes us away. They told me personally.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'plate', at: 0.75, gain: 0.7 }],
    act: 'cake', past: 0,
    speaker: 'cap',
    text: 'I sold my car to be here, and I baked them a lemon cake. I hope they like lemon.',
    pace: 'even',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'pencil', at: 1.04, gain: 0.8 }],
    act: 'notebook', past: 0,
    speaker: 'tophat',
    text: 'I study how people think. I’m here to see what they do when midnight comes and nothing lands.',
    pace: 'even',
    dur: 2.1,
  },
  {
    sfx: [{ id: 'clockchime', at: 0.4, gain: 0.8 }],
    past: 1, next: true,
    interact: {
      prompt: 'Midnight has passed, and nothing has landed. What will he say next?',
      explain: 'That they saved the world. A group who waited for a saucer in 1954 decided their faith had stopped a flood, and believed more strongly than before. Saying “we were wrong” felt worse.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    sfx: [{ id: 'paper', at: 0.69, gain: 0.8 }],
    act: 'saved', past: 1,
    speaker: 'plain',
    text: 'Our faith was so strong, they called the whole thing off. I’ve saved the world, and you’re welcome.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'relief', past: 1,
    speaker: 'cap',
    text: 'Oh, thank goodness. Then I didn’t sell my car for nothing.',
    pace: 'even',
    dur: 1.8,
  },
  {
    act: 'clash', past: 1, seen: true,
    speaker: 'tophat',
    text: 'Two thoughts are clashing in his head: the saucer was coming, and nothing came. That clash hurts, and it’s called cognitive dissonance.',
    pace: ['even', 'weighty'],
    dur: 2.1,
  },
  {
    act: 'story', past: 1, seen: true,
    speaker: 'tophat',
    text: 'The easy way out isn’t to drop the belief. It’s to change the story, so the belief survives.',
    pace: 'even',
    dur: 2.1,
  },
  {
    act: 'cost', past: 1, seen: true,
    speaker: 'tophat',
    text: 'And the more a belief has cost you, the harder you’ll cling to it. He sold his car for this one.',
    pace: ['weighty', 'even'],
    dur: 2.1,
  },
  {
    past: 1, seen: true, luggage: true,
    interact: {
      prompt: 'Each tag says what its owner gave up. Who will find it hardest to admit they were wrong?',
      explain: 'The one who sold a house and quit a job. The more it cost, the more it hurts to say it was all for nothing, so the story gets changed instead.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    sfx: [{ id: 'pin', at: 2.41, gain: 0.8 }],
    act: 'posters', past: 1, seen: true,
    speaker: 'plain',
    text: 'Right, new date, next Tuesday. I’ll need more posters, and a lot more followers.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'rest', past: 1, seen: true,
    quote: {
      id: 'lq-psychology-foundations-5-1',
      text: 'A man with a conviction is a hard man to change. Tell him you disagree and he turns away.',
      author: 'Leon Festinger',
      work: 'When Prophecy Fails',
      era: '1956',
      branchSlugs: ['psychology'],
    },
    dur: 3.0,
  },
  {
    past: 1, seen: true,
    summary: {
      title: 'When the Saucer Doesn’t Come',
      points: [
        'Clashing thoughts cause discomfort, called cognitive dissonance',
        'People often change the story to keep the belief',
        'The more a belief cost, the harder it is to drop',
      ],
      closing: 'Next time a plan fails, ask what you’d think if it had cost you nothing.',
    },
    dur: 2.8,
  },
];

import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic science-foundations-6, "Did the Cure Work?" — the sixth lesson on the Science
// road, and a DIALOGUE lesson (LESSON_RULES group AP).
// Theme: A SAILING SHIP AT SEA IN 1747, A SICK BAY OF HAMMOCKS, AND A CRATE OF LEMONS.
//
// Three people talk, and nobody narrates. A sailor (the newsboy cap) has scurvy, like
// half the crew; the captain (the plain mascot) is sure his own seawater tonic will cure
// them; the ship's surgeon (the top hat) runs a test, after James Lind's on HMS Salisbury
// in 1747, one of the first controlled trials ever made.
//
// A ROAD THAT RAMPS UP (group AU): this road has taught a fair test (change one thing),
// measuring more than once, and a claim that can fail. This lesson puts them together to
// find out whether a treatment works, and it is harder: three ideas — compare groups
// treated differently · keep everything else the same · hide who gets what, so hope can't
// change the result. Its first question asks the reader to use the fair test they know.
//
// Every line is written for the ear (groups AC/AD), from its speaker’s character
// (cast.ts, AP14; group AS), and read at the pace its words ask for (AP17, AP21).
// ─────────────────────────────────────────────────────────────────────────────

export interface Sci6Beat extends BaseBeat {
  /**
   * What happens across this beat’s line (the scene choreographs it):
   * sick — the sailor lies in his hammock in the sick bay, the ship rolling gently ·
   * tonic — the captain holds up a bottle of seawater tonic and swirls it ·
   * pairs — the surgeon walks along the hammocks, pointing to them two at a time ·
   * remedies — he sets a bottle by each pair: seawater, vinegar, a basket of oranges and lemons ·
   * dance — six days later: the sailor is out of his hammock, dancing a jig with an orange ·
   * lucky — the captain sniffs his bottle and frowns at the hammocks still full ·
   * compare — the surgeon holds his ledger open and runs a finger down two columns ·
   * hope — he taps his chest, then lifts two bottles that look different ·
   * miracle — the captain chalks MIRACLE CURE on his bottle ·
   * rest — everyone at ease under the quotation, the ship under full sail.
   */
  act?: 'sick' | 'tonic' | 'pairs' | 'remedies' | 'dance' | 'lucky' | 'compare' | 'hope' | 'miracle' | 'rest';
  /** Time on the voyage: 0 the day the test begins · 1 six days later. */
  later?: number;
  /**
   * First question on the stage — PULL THE RIGHT NOTE: three notes pinned to the mast,
   * SO ONLY THE REMEDY DIFFERS, TO SAVE MONEY and BECAUSE THE CAPTAIN SAID SO, are the
   * things to tap.
   */
  same?: boolean;
  /**
   * Second question on the stage — LABEL THE BOTTLES: three pairs of bottles on the
   * surgeon’s chest, LABELLED MIRACLE CURE, IDENTICAL WITH NO LABELS and LABELLED POISON,
   * are the things to tap.
   */
  bottles?: boolean;
}

export const BEATS: Sci6Beat[] = [
  {
    bed: 'ship',
    act: 'sick', later: 0,
    speaker: 'cap',
    text: 'My gums are sore and my old cuts have opened up again. Half the crew’s the same.',
    pace: 'even',
    dur: 1.8,
  },
  {
    act: 'tonic', later: 0,
    speaker: 'plain',
    text: 'My own seawater tonic will fix them. I’ve never tested it, because I’ve never needed to.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'pairs', later: 0,
    speaker: 'tophat',
    text: 'Then we’ll test it. Twelve sick men, all on the same food, in pairs, and each pair gets a different remedy.',
    pace: 'even',
    dur: 2.1,
  },
  {
    sfx: [{ id: 'cup', at: 1.04, gain: 0.6 }, { id: 'thud', at: 2.44, gain: 0.6 }],
    act: 'remedies', later: 0,
    speaker: 'tophat',
    text: 'Two get your seawater, two get vinegar, two get oranges and lemons, and so on.',
    pace: 'brisk',
    dur: 2.1,
  },
  {
    later: 0, same: true,
    interact: {
      prompt: 'Why does every sick man get the same food and the same hammock?',
      explain: 'So only the remedy differs. If one pair also ate better or slept warmer, you couldn’t tell what made them well. It’s a fair test: change one thing.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    sfx: [{ id: 'thud', at: 1.62, gain: 0.6 }],
    act: 'dance', later: 1,
    speaker: 'cap',
    text: 'Six days of oranges and lemons, and I’m back on deck dancing!',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'lucky', later: 1,
    speaker: 'plain',
    text: 'Lucky. My seawater men are just as sick, so they weren’t trying hard enough.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'book', at: 1.3, gain: 0.8 }],
    act: 'compare', later: 1,
    speaker: 'tophat',
    text: 'Comparing groups treated differently is how you know it was the lemons, not luck or the weather.',
    pace: 'even',
    dur: 2.1,
  },
  {
    sfx: [{ id: 'cup', at: 2.97, gain: 0.6 }],
    act: 'hope', later: 1,
    speaker: 'tophat',
    text: 'But a man who’s sure his medicine works can feel better from hope alone. That could fool us too.',
    pace: ['weighty', 'even'],
    dur: 2.1,
  },
  {
    later: 1, bottles: true,
    interact: {
      prompt: 'How could he stop hope changing the result?',
      explain: 'Bottles that all look the same, with no labels. Then nobody knows who has which remedy, and hope can’t help one group more than another.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    sfx: [{ id: 'pencil', at: 0.81, gain: 0.8 }],
    act: 'miracle', later: 1,
    speaker: 'plain',
    text: 'Then I’ll write miracle cure on mine. Problem solved.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'rest', later: 1,
    quote: {
      id: 'lq-science-foundations-6-1',
      text: 'The consequence was, that the most sudden and visible good effects were perceived from the use of the oranges and lemons.',
      author: 'James Lind',
      work: 'A Treatise of the Scurvy',
      era: '1753',
      branchSlugs: ['science'],
    },
    dur: 3.0,
  },
  {
    later: 1,
    summary: {
      title: 'Did the Cure Work?',
      points: [
        'Compare groups that are treated differently',
        'Keep everything else the same',
        'Hide who gets what, so hope can’t change the result',
      ],
      closing: 'Next time you hear a cure works, ask what it was compared with.',
    },
    dur: 2.8,
  },
];

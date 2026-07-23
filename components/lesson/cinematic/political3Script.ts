import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic political-political-3, "What Makes a Government Legitimate?".
// A subject offers up a scroll of consent; a crowned ruler receives it and holds
// power in trust — a bond stretches between them. Locke: break the trust and the
// crown forfeits its right. Rousseau: the bond must serve the general will, not a
// mere majority. Distinct from the power-and-people lesson: here it is the CONTRACT
// that carries the drama. Subject left, ruler right, scroll in the gap, crown above.
//
// Graded questions are the two from data/.../what-makes-government-legitimate.ts.
// ─────────────────────────────────────────────────────────────────────────────

export interface Pol3Beat extends BaseBeat {
  /** Subject gesture. */ sub?: number;
  /** Ruler gesture. */ r?: number;
  /** Scroll position: 0 = in the subject's hands, 1 = in the ruler's. */ scroll?: number;
  /** Trust bond between them (0/1). */ bond?: number;
}

export const BEATS: Pol3Beat[] = [
  {
    sub: 2, r: 28, scroll: 0, bond: 0,
    text: 'A gun makes you obey. What makes you owe obedience? Power compels; legitimacy commands. Philosophers fought over the gap.',
    dur: 3.8,
  },
  {
    sub: 30, r: 31, scroll: 1, bond: 1,
    text: 'Imagine no state at all — people free and unruled. Hobbes warned that with no common judge, this "state of nature" slides into war. So people covenant to set up a ruler who keeps the peace.',
    cite: 'The social contract',
    dur: 5.2,
  },
  {
    sub: 0, r: 35, scroll: 1, bond: 1,
    text: 'Locke said we set up government to guard our rights, holding power only in trust. Break that trust and it forfeits its rule. America’s founders drew on these Lockean ideas in 1776.',
    cite: 'Locke, 1689',
    dur: 5.0,
  },
  {
    sub: 0, r: 0, scroll: 1, bond: 1,
    quote: {
      id: 'lq-political-political-3-1',
      text: 'Men being by nature all free, equal and independent, no one can be subjected to the political power of another without his own consent.',
      author: 'John Locke',
      work: 'Two Treatises of Government',
      era: '1689',
      branchSlugs: ['political-philosophy'],
    },
    dur: 3.6,
  },
  {
    sub: 38, r: 38, scroll: 1, bond: 1,
    text: 'Rousseau pushed further. Legitimacy flows from the "general will" — what truly serves the whole people, not the sum of private wants. Real freedom is living under rules you give yourself.',
    cite: 'Rousseau — the general will',
    dur: 5.0,
  },
  {
    sub: 21, r: 0, scroll: 1, bond: 1,
    mc: {
      prompt: 'According to Locke, what causes a government to lose its legitimacy?',
      options: [
        { id: 'a', text: 'When it grows unpopular or makes clumsy decisions', correct: false },
        { id: 'b', text: 'When it tramples the natural rights it was trusted to protect', correct: true },
        { id: 'c', text: 'When it loses a majority at the next election', correct: false },
        { id: 'd', text: 'When a stronger foreign army conquers it', correct: false },
      ],
      explain:
        'For Locke, power is held in trust to guard our lives, liberties, and estates. Turn against that trust and rulers forfeit the right to rule.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    sub: 4, r: 0, scroll: 1, bond: 1,
    mc: {
      prompt: 'Rousseau prized the general will, so a 51% majority vote must always equal it. Correct?',
      options: [
        { id: 'a', text: 'Yes — the general will is simply whatever the majority votes for', correct: false },
        { id: 'b', text: 'No — a majority can chase private interests and miss the common good', correct: true },
        { id: 'c', text: 'Yes — Rousseau equated counting votes with the common good', correct: false },
        { id: 'd', text: 'No — because Rousseau rejected voting entirely', correct: false },
      ],
      explain:
        'The trap: Rousseau split the "will of all" (the sum of private wants) from the "general will" (what serves the whole). Even a majority can be wrong.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'The Right to Rule',
      points: [
        'Hobbes: no common judge means war',
        'Locke: legitimacy rests on consent and trust',
        'Rousseau: law must serve the general will',
        'Democracy fuses rights and popular sovereignty',
      ],
      closing: 'Every election whispers it: rulers answer to the ruled.',
    },
    dur: 2.8,
  },
];

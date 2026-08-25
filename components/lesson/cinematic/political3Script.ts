import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic political-political-3, "What Makes a Government Legitimate?".
//
// The stage is a CIRCUIT between the ruled and the ruler. A scroll of consent
// travels up the top arrow; power flows back down the bottom one as protected
// rights; and on the Locke beat the whole exchange is stamped HELD IN TRUST.
// Above them a two-panel comparison does the conceptual work — first POWER vs
// LEGITIMACY (obey vs owe), then Rousseau's split between the will of all and
// the general will, drawn as scattered arrows against aligned ones.
//
// Distinct from the power-and-people lesson: here it is the CONTRACT that
// carries the drama.
//
// The hook beat shows the OTHER diagram in that same corridor: bare force, drawn
// as a single heavy arrow pushing down on the ruled with a struck-out return arrow
// beneath it — power compels, and nothing is owed back. The consent circuit then
// takes its place, so the swap itself carries the lesson's central distinction.
//
// Prop channels the scene reads: `pair` (which comparison is up: 0 none, 1
// power/legitimacy, 2 will-of-all/general-will), `force` (the bare-power diagram
// on the hook), `flow` (the consent circuit that replaces it), `scroll` (0 = in
// the subject's hands, 1 = in the ruler's) and `seal`.
//
// Graded questions are the two from data/.../what-makes-government-legitimate.ts.
// ─────────────────────────────────────────────────────────────────────────────

export interface Pol3Beat extends BaseBeat {
  /** Subject gesture. */ sub?: number;
  /** Ruler gesture. */ r?: number;
  /** Scroll position: 0 = in the subject's hands, 1 = in the ruler's. */ scroll?: number;
  /** Which comparison panel is up: 0 none, 1 power vs legitimacy, 2 Rousseau's split. */ pair?: number;
  /** Bare power: one heavy arrow down, nothing owed back (0/1). Shares the corridor with `flow`. */ force?: number;
  /** The consent / protection circuit between them (0/1). */ flow?: number;
  /** The HELD IN TRUST stamp struck across the circuit (0/1). */ seal?: number;
}

export const BEATS: Pol3Beat[] = [
  {
    sub: 2, r: 28, scroll: 0, pair: 1, force: 1, flow: 0, seal: 0,
    text: 'A gun makes you obey. What makes you owe obedience? Power compels. Legitimacy is the other thing, and the gap between them is the whole subject.',
    dur: 3.8,
  },
  {
    sub: 30, r: 31, scroll: 1, pair: 0, flow: 1, seal: 0,
    text: 'Imagine no state at all — people free and unruled. Hobbes warned that with no common judge, this "state of nature" slides into war. So people covenant to set up a ruler who keeps the peace.',
    cite: 'The social contract',
    dur: 5.2,
  },
  {
    sub: 0, r: 35, scroll: 1, pair: 0, flow: 1, seal: 1,
    text: 'Locke said we set up a government to guard our rights, and it holds power only in trust. Break the trust and the government forfeits its right to rule. The American founders leaned on Locke in 1776.',
    cite: 'Locke, 1689',
    dur: 5.0,
  },
  {
    sub: 0, r: 0, scroll: 1, pair: 0, flow: 1, seal: 1,
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
    sub: 38, r: 38, scroll: 1, pair: 2, flow: 1, seal: 1,
    text: 'Rousseau pushed further. Legitimacy flows from the "general will" — what truly serves the whole people, not the sum of private wants. Real freedom is living under rules you give yourself.',
    cite: 'Rousseau — the general will',
    dur: 5.0,
  },
  {
    sub: 21, r: 0, scroll: 1, pair: 0, flow: 1, seal: 1,
    interact: {
      prompt: 'On Locke’s account, tap what makes a government forfeit its right to rule.',
      cards: [
        { text: 'It tramples natural rights', correct: true },
        { text: 'It loses an election', correct: false },
      ],
      explain: 'For Locke, power is held in trust to guard our lives, liberties, and estates. Turn against that trust and rulers forfeit the right to rule.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    sub: 4, r: 0, scroll: 1, pair: 2, flow: 1, seal: 1,
    interact: {
      prompt: 'Rousseau prized the general will. Does a bare majority vote always match it?',
      cards: [
        { text: 'No, a majority can err', correct: true },
        { text: 'Yes, the majority decides', correct: false },
      ],
      explain: 'The trap: Rousseau split the "will of all" (the sum of private wants) from the "general will" (what serves the whole). Even a majority can be wrong.',
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
      closing: 'Every election says the same quiet thing. Rulers answer to the ruled.',
    },
    dur: 2.8,
  },
];

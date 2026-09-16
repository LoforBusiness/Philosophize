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
// And, so that every tap of this opener puts on the stage what its sentence names:
// `nat` (the state of nature — no government, a state of war — in the corridor
// between the contract's two halves), `crown` (the sovereign's crown, which lifts
// off in the state of nature and comes back with the covenant), `rights` (the
// return half of the circuit, which is Locke's, not Hobbes's), `decl` (the 1776
// Declaration pinned above them) and `will` (the GENERAL WILL panel struck in ink
// when the citizens are said to obey it).
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
  /** The state of nature in the corridor: two arrows meeting head on (0/1). */ nat?: number;
  /** The crown over the ruler (0 = lifted off: no government). Defaults to 1. */ crown?: number;
  /** The return half of the circuit — RIGHTS PROTECTED (0/1). */ rights?: number;
  /** The Declaration of Independence pinned above the pair (0/1). */ decl?: number;
  /** The GENERAL WILL panel struck in ink (0/1). */ will?: number;
}

export const BEATS: Pol3Beat[] = [
  {
    // The gunman and the one he makes obey: the force diagram alone.
    sub: 2, r: 28, scroll: 0, pair: 0, force: 1, flow: 0, seal: 0,
    text: 'A gunman can make you obey. What, if anything, makes you owe obedience to a government?',
    dur: 1.8,
  },
  {
    // "Power is … Legitimacy is …" — the two are set side by side.
    sub: 266, r: 163, scroll: 0, pair: 1, force: 1, flow: 0, seal: 0,
    text: 'Power is the capacity to compel obedience. Legitimacy is the right to rule, which creates a duty to obey.',
    dur: 2.3,
  },
  {
    // "a condition with no government … a state of war" — the crown lifts off and
    // the corridor holds two arrows meeting head on.
    sub: 30, r: 31, scroll: 0, pair: 0, flow: 0, seal: 0, nat: 1, crown: 0,
    text: 'Social contract theory begins with a state of nature, a condition with no government. Hobbes argued that without a common power, it becomes a state of war.',
    cite: 'The social contract',
    dur: 3.5,
  },
  {
    // "escape the war by covenant … set up a sovereign" — the consent scroll
    // travels up to the ruler and the crown comes back down onto him.
    sub: 266, r: 273, scroll: 1, pair: 0, flow: 1, seal: 0,
    text: 'Hobbes held that people escape the war by covenant, agreeing to set up a sovereign who keeps the peace.',
    dur: 1.8,
  },
  {
    // "to protect their natural rights … holds power in trust" — the return half
    // of the circuit, and the stamp.
    sub: 462, r: 35, scroll: 1, pair: 0, flow: 1, seal: 1, rights: 1,
    text: 'John Locke argued that people consent to government to protect their natural rights. Government holds power in trust, and loses the right to rule by breaking the trust.',
    cite: 'Locke, 1689',
    dur: 3.9,
  },
  {
    // "The American Declaration of Independence, in 1776" — pinned up above them.
    sub: 462, r: 35, scroll: 1, pair: 0, flow: 1, seal: 1, rights: 1, decl: 1,
    text: 'The American Declaration of Independence, in 1776, drew on Locke’s ideas of consent and natural rights.',
    dur: 1.8,
  },
  {
    sub: 460, r: 0, scroll: 1, pair: 0, flow: 1, seal: 1, rights: 1, decl: 1,
    quote: {
      id: 'lq-political-political-3-1',
      text: 'Men being by nature all free, equal and independent, no one can be subjected to the political power of another without his own consent.',
      author: 'John Locke',
      philosopherId: 'john-locke',
      work: 'Two Treatises of Government',
      era: '1689',
      branchSlugs: ['political-philosophy'],
    },
    dur: 3.6,
  },
  {
    sub: 38, r: 38, scroll: 1, pair: 2, flow: 1, seal: 1, rights: 1,
    text: 'Jean-Jacques Rousseau based legitimacy on the general will, which aims at what serves everyone. The will of all is a sum of private wants.',
    cite: 'The Social Contract, 1762',
    dur: 3.5,
  },
  {
    // "Citizens who obey the general will" — that panel is struck in ink.
    sub: 266, r: 266, scroll: 1, pair: 2, flow: 1, seal: 1, rights: 1, will: 1,
    text: 'Citizens who obey the general will obey laws they made themselves. For Rousseau, real freedom is living under rules you give yourself.',
    dur: 1.8,
  },
  {
    sub: 380, r: 0, scroll: 1, pair: 0, flow: 1, seal: 1, rights: 1,
    interact: {
      prompt: 'On Locke’s account, what makes a government forfeit its right to rule?',
      cards: [
        { text: 'Breaching natural rights', correct: true },
        { text: 'Losing an election', correct: false },
      ],
      explain: 'Breaching natural rights costs a government its right to rule, on Locke’s view. Government holds power in trust, to protect life, liberty and property. Breaking that trust costs legitimacy, but losing an election breaks no trust.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    sub: 165, r: 0, scroll: 1, pair: 2, flow: 1, seal: 1, rights: 1,
    interact: {
      prompt: 'For Rousseau, how reliably does a majority vote express the general will?',
      drag: {
        lo: 'ALWAYS EXPRESSES IT',
        hi: 'NEVER EXPRESSES IT',
        start: 0,
        zones: [
          { id: 'same', upto: 0.3, reads: 'a majority vote simply is the general will' },
          { id: 'often', upto: 0.74, reads: 'often, yet a majority can still be mistaken', correct: true },
          { id: 'never', upto: 1, reads: 'a vote can never express it' },
        ],
      },
      explain: 'Often, yet a majority can still be mistaken. Rousseau distinguishes the general will, which aims at the common good, from the will of all. The will of all is a sum of private interests. When factions form, a majority can express the will of all instead.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'The Right to Rule',
      points: [
        'Hobbes: without a common power, life is war',
        'Locke: legitimacy rests on consent and trust',
        'Rousseau: law must serve the general will',
        'Democracy combines rights with popular sovereignty',
      ],
      closing: 'Social contract theories ground the right to rule in the consent or the will of the ruled.',
    },
    dur: 2.8,
  },
];

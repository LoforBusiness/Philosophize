import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic political-political-1, "Why Societies Need Rules"
// Theme: THE WAR OF ALL AGAINST ALL, AND THE SOVEREIGN THEY RAISE.
//
// Strip away every law and ruler and Hobbes's state of nature appears: a brawl of
// all against all, nasty and short. Then the multitude authorizes one sovereign —
// crowned, holding the sword — and the fighting resolves into order. Covenants
// without that sword, Hobbes warns, are but words.
//
// Both graded questions come from data/.../why-societies-need-rules.ts.
// ─────────────────────────────────────────────────────────────────────────────

export interface PoliticalBeat extends BaseBeat {
  /** Authority present this beat: 0 anarchy → 1 the sovereign stands. */
  auth?: number;
  /** This beat's correct answer raises the sovereign (q1) or holds him firm (q2). */
  weigh?: 'q1' | 'q2';
}

export const BEATS: PoliticalBeat[] = [
  {
    auth: 0,
    text: 'Why obey rules you never agreed to? Every state claims authority over you. Where does that power come from?',
    dur: 3.6,
  },
  {
    auth: 0,
    text: 'Hobbes ran a thought experiment. Strip away every law, every court and every ruler. With nobody left to judge between us, fear and rivalry collide, and life turns "nasty, brutish, and short."',
    cite: 'Thomas Hobbes, Leviathan, 1651',
    dur: 4.8,
  },
  {
    auth: 0,
    text: 'Even the weakest can kill the strongest — so each strikes first, from fear. The result is "a war of every man against every man." The only exit: authorize one sovereign to keep the peace.',
    dur: 4.6,
  },
  {
    auth: 0,
    quote: {
      id: 'lq-political-political-1-1',
      text: 'Covenants, without the sword, are but words, and of no strength to secure a man at all.',
      author: 'Thomas Hobbes',
      work: 'Leviathan',
      era: '1651',
      branchSlugs: ['political-philosophy'],
    },
    dur: 3.2,
  },
  {
    auth: 1,
    weigh: 'q1',
    interact: {
      prompt: 'So why would anyone hand that much power to a sovereign?',
      cards: [
        { text: 'Without a sovereign, war', correct: true },
        { text: 'People are naturally cooperative', correct: false },
      ],
      explain: 'The war comes from the situation — no common arbiter — not from people being wicked. Fear of death drives the covenant, since nearly any sovereign beats anarchy.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    auth: 1,
    text: 'No one literally signed it. The contract is a test of legitimacy, not a document. For Hobbes the covenant binds subjects, so there is no right to revolt. Locke disagreed: betray our rights, and the people may resist.',
    dur: 4.8,
  },
  {
    auth: 1,
    weigh: 'q2',
    interact: {
      prompt: 'Drag to how much right to resist Hobbes allows.',
      drag: {
        lo: 'NONE AT ALL',
        hi: 'WHENEVER HE RULES BADLY',
        start: 1,
        zones: [
          { id: 'never', upto: 0.3, reads: 'none; even a harsh sovereign beats the war', correct: true },
          { id: 'life', upto: 0.66, reads: 'only when he comes for your life directly' },
          { id: 'bad', upto: 1, reads: 'whenever the ruler governs badly' },
        ],
      },
      explain: 'The near end, and it is Locke who sits at the other one. Hobbes saw even a cruel sovereign as better than a return to the war of all against all, because the alternative to a bad ruler is not a good ruler. It is no arbiter at all.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Rules Make Society Possible',
      points: [
        'State of nature: life with no common arbiter',
        'Hobbes: a war of every man against every man',
        'The contract authorizes a sovereign for peace',
        'Without the sword, covenants are but words',
      ],
      closing: 'Political philosophy asks who should rule, and why we should obey.',
    },
    dur: 2.8,
  },
];

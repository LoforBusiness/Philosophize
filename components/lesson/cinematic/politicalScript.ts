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
    text: 'Hobbes ran a thought experiment: strip away every law, court, and ruler. With no common power to judge between us, fear and rivalry collide — and life turns "nasty, brutish, and short."',
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
    mc: {
      prompt: 'According to Hobbes, why do people accept rules and government?',
      options: [
        { id: 'a', text: 'Because rulers are wiser and more virtuous than ordinary people', correct: false },
        { id: 'b', text: 'Because life with no sovereign would be a brutal war of all against all', correct: true },
        { id: 'c', text: 'Because humans are naturally peaceful and crave order for its own sake', correct: false },
        { id: 'd', text: 'Because kings rule by divine right, chosen directly by God', correct: false },
      ],
      explain:
        'The war comes from the situation — no common arbiter — not from people being wicked. Fear of death drives the covenant, since nearly any sovereign beats anarchy.',
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
    mc: {
      prompt: 'Hobbes’s sovereign keeps the peace — so surely he wanted citizens free to overthrow a bad one. Right?',
      options: [
        { id: 'a', text: 'Yes, Hobbes built in a clear right to revolt against tyrants', correct: false },
        { id: 'b', text: 'No, Hobbes feared chaos more than tyranny and denied a right to revolt', correct: true },
        { id: 'c', text: 'Yes, Hobbes thought rebellion was a citizen’s highest duty', correct: false },
        { id: 'd', text: 'No, because Hobbes wanted no sovereign at all', correct: false },
      ],
      explain:
        'Tempting, but it was Locke who defended resistance. Hobbes saw even a harsh sovereign as better than a return to the war of all against all.',
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

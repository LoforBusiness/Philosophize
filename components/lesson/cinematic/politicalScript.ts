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
    text: 'Every state claims authority over you, although you never agreed to its rules. Why, then, should you obey?',
    dur: 2.5,
  },
  {
    auth: 0,
    text: 'This is the problem of political authority. What could give a state the right to rule?',
    dur: 1.8,
  },
  {
    auth: 0,
    text: 'Thomas Hobbes asks you to imagine life without any law, court or ruler. This condition is called the state of nature.',
    cite: 'Thomas Hobbes, Leviathan, 1651',
    dur: 2.1,
  },
  {
    auth: 0,
    text: 'With no common power to settle disputes, people compete and distrust one another. Hobbes says such a life is “solitary, poor, nasty, brutish, and short”.',
    dur: 2.7,
  },
  {
    auth: 0,
    text: 'Even the weakest can kill the strongest, so fear gives everyone a reason to strike first. Hobbes calls the result a war “of every man against every man”.',
    dur: 3.3,
  },
  {
    auth: 0,
    text: 'Hobbes argues that the only escape is a covenant. In it, everyone authorises one sovereign to keep the peace.',
    dur: 1.8,
  },
  {
    auth: 0,
    quote: {
      id: 'lq-political-political-1-1',
      text: 'Covenants, without the sword, are but words, and of no strength to secure a man at all.',
      author: 'Thomas Hobbes',
      philosopherId: 'thomas-hobbes',
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
      prompt: 'Why, on Hobbes’s account, do people authorise a sovereign at all?',
      cards: [
        { text: 'To escape the war of all', correct: true },
        { text: 'Humans are political by nature', correct: false },
      ],
      explain: 'To escape the war of all. For Hobbes, war comes wherever no common power settles disputes, even if no one is wicked. Aristotle held that humans are political by nature. Hobbes denies this: without a sovereign, fear and rivalry lead to war.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    auth: 1,
    text: 'No one ever signed such a contract, and no one needs to. The contract is a test of legitimacy, not a document.',
    dur: 1.9,
  },
  {
    auth: 1,
    text: 'For Hobbes, subjects have no right to rebel against the sovereign they authorised. John Locke disagreed: a people may resist rulers who violate their rights.',
    dur: 2.9,
  },
  {
    auth: 1,
    weigh: 'q2',
    interact: {
      prompt: 'On Hobbes’s view, when may subjects rebel against their sovereign?',
      drag: {
        lo: 'NEVER',
        hi: 'WHENEVER HE RULES BADLY',
        start: 1,
        zones: [
          { id: 'never', upto: 0.3, reads: 'never, since a harsh sovereign is better than war', correct: true },
          { id: 'life', upto: 0.66, reads: 'only when the sovereign threatens their lives' },
          { id: 'bad', upto: 1, reads: 'whenever the sovereign governs badly' },
        ],
      },
      explain: 'Never, since a harsh sovereign is better than war. Hobbes does let a subject resist being killed, because no covenant can surrender the right to self-defence. But that right isn’t a right to overthrow the sovereign. Locke, by contrast, let a people resist rulers who violate their rights.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Hobbes and the Social Contract',
      points: [
        'State of nature: life with no common power',
        'Hobbes: a war of every man against every man',
        'The covenant authorises a sovereign to keep peace',
        'Without the sword, covenants are but words',
      ],
      closing: 'For Hobbes, the duty to obey rests on the peace that only a sovereign can secure.',
    },
    dur: 2.8,
  },
];

import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic ethics-ethics-2, "Three Lenses on a Small Choice".
// A found wallet on the pavement; a guide walks in and tries each of the three
// ethical lenses on it — Mill (weigh the outcome), Kant (point to a universal
// law), Aristotle (a hand to the heart) — while the finder deliberates. Every
// beat uses a DIFFERENT gesture so the figures never loop.
//
// Both graded questions come from data/.../everyday-moral-choices.ts.
// ─────────────────────────────────────────────────────────────────────────────

export interface Ethics2Beat extends BaseBeat {
  /** Finder gesture (emote code). */ p?: number;
  /** Guide gesture (emote code), -1 = off stage. */ g?: number;
  /** Guide x (walks between beats). */ gx?: number;
  /** Verdict-board rows carry their lens name + question yet (0/1). */ named?: number;
  /** How many of the three lenses have stamped their verdict, 0→3. */ lens?: number;
}

export const BEATS: Ethics2Beat[] = [
  {
    p: 12, x: 258, g: -1,
    text: 'You find a wallet on the pavement. Now what? One small choice is about to get three different verdicts.',
    dur: 3.4,
  },
  {
    p: 7, x: 262, g: -1, gx: 48, named: 1,
    // Nothing on this stage is labelled "Deontology", and the next three beats show
    // each lens by working the wallet through it. Naming all three first was a
    // vocabulary tax paid before any of them meant anything (J6).
    text: 'Ethics hands you three lenses, not three religions. One asks what happens next. One asks what your duty is. One asks who the act turns you into. Most of us quietly use all three.',
    cite: 'Three lenses',
    dur: 5.0,
  },
  {
    p: 4, x: 262, g: 21, gx: 108, named: 1, lens: 1,
    text: 'Mill points the first lens at the wallet. Did handing it in make anyone’s life go better? For him that is the whole question, and everybody’s happiness counts the same.',
    cite: 'J.S. Mill, Utilitarianism, 1863',
    dur: 4.8,
  },
  {
    p: 0, x: 262, g: 1, gx: 108, named: 1, lens: 1,
    quote: {
      id: 'lq-ethics-ethics-2-1',
      text: 'Actions are right in proportion as they tend to promote happiness, wrong as they tend to produce the reverse of happiness.',
      author: 'John Stuart Mill',
      work: 'Utilitarianism',
      era: '1863',
      branchSlugs: ['ethics'],
    },
    dur: 3.0,
  },
  {
    p: 14, x: 262, g: 6, gx: 108, named: 1, lens: 2,
    text: 'Kant ignores the happy ending. Only act on a rule you could want everyone to follow. Try that with "keep wallets you find" and it eats itself, because nobody would hand anything in.',
    cite: 'Kant, Groundwork, 1785',
    dur: 4.8,
  },
  {
    p: 13, x: 262, g: 22, gx: 108, named: 1, lens: 3,
    text: 'Aristotle asks a third question. Not "what do I do?" but "who am I becoming?" Every honest act makes the next one easier, and that is what he means by a good life.',
    cite: 'Aristotle, Nicomachean Ethics',
    dur: 4.8,
  },
  {
    p: 21, x: 262, g: -1, named: 1, lens: 3,
    interact: {
      // The table on stage calls this lens OUTCOMES, not "consequentialist".
      prompt: 'Tap the question the OUTCOMES lens asks about that wallet.',
      cards: [
        { text: 'Which brings most happiness', correct: true },
        { text: 'Could everyone follow it', correct: false },
      ],
      explain: 'It weighs results, and nothing else — whose life got better, whose got worse. The other card is Kant’s question, and it does not care how the story ends.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 8, x: 262, g: -1, named: 1, lens: 3,
    interact: {
      prompt: 'Set the lever to what most people doing it proves.',
      lever: {
        start: 0,
        stops: [
          { id: 'common', reads: 'most people do it, so it must be fine' },
          { id: 'legal', reads: 'nobody is arrested for it, so it must be fine' },
          { id: 'neither', reads: 'neither one settles whether it is right', correct: true },
        ],
      },
      explain: 'The far setting. This is the gap Hume pointed at in 1739: a description of what people do never turns by itself into a claim about what they ought to do. Both of the other settings quietly cross it and hope nobody notices.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'One Choice, Three Lenses',
      points: [
        'Outcomes: ask what result helps most (Mill)',
        'Duty: ask if your maxim could be universal (Kant)',
        'Character: ask who the act makes you (Aristotle)',
        '"Natural" never proves "right" (the is–ought gap)',
      ],
      closing: 'The lenses rarely agree, and the disagreement is where real thinking starts.',
    },
    dur: 2.8,
  },
];

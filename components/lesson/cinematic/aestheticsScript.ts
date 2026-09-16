import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic aesthetics-aesthetics-1, "Why Things Feel Beautiful"
// Theme: THE GLOW THAT ASKS FOR NOTHING — AND SPEAKS FOR EVERYONE.
//
// A figure before a framed sunset: it glows, and the pleasure it gives wants
// nothing from it (no grabbing hand, unlike the apple he reaches to eat). Then the
// feeling turns outward — "this is beautiful" quietly demanding a whole crowd agree.
//
// THE VOICE (group M). This is the reference lesson for the narrator's manner: he
// is fond of you and quietly exasperated by his subject. Every barb here lands on
// a philosopher or on the human habit under discussion, never on the reader —
// Kant needed a book, Hume's fix is suspiciously tidy, and a private feeling has
// the nerve to summon eight people. Delete every dry aside and the beats still
// teach the same three things, which is the test that keeps it a character rather
// than a comedy act.
//
// Both graded questions come from data/.../why-things-feel-beautiful.ts.
// ─────────────────────────────────────────────────────────────────────────────

export interface AestheticsBeat extends BaseBeat {
  /**
   * Figure pose: 0 stand · 1 emphatic (address the crowd) · 2 behold · 7 reach-for-apple,
   * plus the group-M repertoire from the wide emote library (`SIGH` in cinematicKit):
   * 8 shrug · 9 hand-on-hip · 10 arms-folded · 11 hand-to-the-head.
   *
   * Written as literal digits, not as `SIGH.FOLDED`: `check-smooth` reads this track
   * out of the source with a regex over `hpose:` and would score a named constant as
   * pose 0, quietly measuring a lesson it had not actually replayed.
   */
  hpose?: number;
  /** The sunset glows (disinterested pleasure). */
  glow?: boolean;
  /** The apple of appetite is present (the figure reaches to grab it). */
  apple?: boolean;
  /** A crowd the judgement of taste reaches out to (it arrives on "the agreement of everyone"). */
  crowd?: boolean;
  /** Hume's true critics, converging on a standard of taste. */
  critics?: boolean;
  /** This beat's answer drives the scene. */
  weigh?: 'q1' | 'q2';
  //
  // THE LATCHES BELOW are set on the ONE beat where their thing arrives, and the
  // scene holds it from there to the end — every tap of the opening adds one
  // element to the picture and none of them has to be taken back.
  //
  /** The verdict card's heading turns from YOUR VERDICT to A JUDGEMENT OF TASTE. */
  taste?: boolean;
  /** The verdict card lists the two questions that follow. */
  questions?: boolean;
  /** Kant's chart gains its SUNSET row: it asks for NOTHING. */
  unwanted?: boolean;
  /** Kant's chart writes its foot line: beauty wants nothing (free of desire). */
  desireless?: boolean;
  /** Hume's scattered verdicts slide together into one band. */
  agree?: boolean;
  /** Under Hume's chart, CRITIC and VERDICT point at each other: the circle. */
  circular?: boolean;
  /** The panel turns to WHO MUST AGREE, with “I LIKE IT” and its single pip. */
  assent?: boolean;
  /** “IT IS BEAUTIFUL” is written under it, resting on one feeling: one pip. */
  claim?: boolean;
}

export const BEATS: AestheticsBeat[] = [
  {
    hpose: 2,
    glow: true,
    text: 'Consider a sunset. You judge it beautiful at once, without any training or reasoning.',
    dur: 1.8,
  },
  {
    hpose: 2,
    glow: true,
    taste: true,
    text: 'Such a verdict is called a judgement of taste. Philosophers have asked what grounds these judgements for three hundred years.',
    dur: 2.8,
  },
  {
    hpose: 2,
    glow: true,
    questions: true,
    text: 'Two questions follow. What makes this pleasure distinctive, and for whom does the judgement speak?',
    dur: 1.8,
  },
  {
    hpose: 7,
    glow: true,
    apple: true,
    text: 'Immanuel Kant contrasted beauty with appetite. When you’re hungry, you take an apple because you want to eat it.',
    dur: 1.8,
  },
  {
    hpose: 7,
    glow: true,
    apple: true,
    unwanted: true,
    text: 'The sunset satisfies no appetite. You want nothing from it.',
    dur: 1.8,
  },
  {
    hpose: 7,
    glow: true,
    apple: true,
    desireless: true,
    text: 'Kant calls such pleasure disinterested, meaning free of desire. It doesn’t depend on wanting to use or possess the object.',
    dur: 1.8,
  },
  {
    // Arms folded, watching his own chart prove his point. The pose is the tone.
    hpose: 10,
    glow: true,
    critics: true,
    text: 'David Hume held that beauty is no quality in things, and exists only in the mind. Yet he ranked masters above hacks.',
    cite: 'Of the Standard of Taste',
    dur: 2.2,
  },
  {
    // Arms folded, watching his own chart prove his point. The pose is the tone.
    hpose: 10,
    glow: true,
    critics: true,
    agree: true,
    text: 'Hume placed the standard of taste in the joint verdict of true critics. Practice, comparison and freedom from prejudice make their verdicts converge.',
    dur: 1.9,
  },
  {
    // Arms folded, watching his own chart prove his point. The pose is the tone.
    hpose: 10,
    glow: true,
    critics: true,
    circular: true,
    text: 'The proposal risks circularity. A true critic is recognised by sound verdicts, yet sound verdicts are defined as those of true critics.',
    dur: 1.8,
  },
  {
    // STANDS STILL, and that is a decision. The manner belongs to the app's own
    // sentences, not to Kant's — a quote beat is a primary source presented
    // straight (§13), so the narrator gets out of its way. `SIGH.HIP` was tried
    // here and drawn on a contact sheet: in profile a hand on the hip is a bulge
    // at the waist and reads as the neutral stand, so it cost a re-measure of the
    // must-see box and bought nothing.
    hpose: 0,
    glow: true,
    // Hume's chart, once raised, STAYS raised for the rest of the lesson. It sits
    // in the lower-left quarter, which nothing else ever uses, and leaving it up
    // both keeps the summary's second bullet on screen and stops that quarter of
    // the stage going blank for the last four beats.
    critics: true,
    quote: {
      id: 'lq-aesthetics-aesthetics-1-1',
      text: 'The beautiful is that which pleases universally without a concept.',
      author: 'Immanuel Kant',
      philosopherId: 'immanuel-kant',
      work: 'Critique of the Power of Judgment',
      era: '1790',
      branchSlugs: ['aesthetics'],
    },
    dur: 3.0,
  },
  {
    hpose: 7,
    glow: true,
    apple: true,
    critics: true,
    weigh: 'q1',
    interact: {
      prompt: 'What makes the pleasure of a sunset different from the pleasure of eating an apple?',
      cards: [
        { text: 'The pleasure is disinterested', correct: true },
        { text: 'The pleasure is more intense', correct: false },
      ],
      // M5: the aside is aimed at the losing IDEA, never at the reader who picked
      // it. A toothache is strong too — that teaches why strength is the wrong axis.
      explain: 'The pleasure is disinterested. For Kant, this means free of desire. The apple pleases because it satisfies hunger, but the sunset pleases without satisfying any want. Intensity isn’t the difference, because the pleasure of eating can be just as intense.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    hpose: 1,
    critics: true,
    assent: true,
    text: 'The second question concerns whom a judgement of taste speaks for. You rarely stop at saying “I like it”.',
    dur: 1.8,
  },
  {
    hpose: 1,
    critics: true,
    claim: true,
    text: 'You say “it is beautiful”, as though stating a fact about the object. Yet the judgement rests only on your feeling of pleasure.',
    dur: 2.4,
  },
  {
    hpose: 1,
    crowd: true,
    critics: true,
    text: 'Kant holds that it still speaks with a universal voice, and demands the agreement of everyone.',
    dur: 1.8,
  },
  {
    // The shrug: "well, that is what the man said." It is also the right pose for a
    // beat the reader spends reading rather than watching.
    hpose: 8,
    crowd: true,
    critics: true,
    weigh: 'q2',
    interact: {
      prompt: 'Who does a judgement of taste speak for?',
      split: {
        left: 'EVERYBODY', right: 'ONLY YOURSELF',
        start: 0.04,
        zones: [
          { id: 'you', upto: 0.3, reads: 'it speaks for you alone' },
          { id: 'both', upto: 0.66, reads: 'half about you, half about everyone' },
          { id: 'all', upto: 1, reads: 'felt by you, yet claiming everyone’s agreement', correct: true },
        ],
      },
      explain: 'Felt by you, yet claiming everyone’s agreement. A judgement of taste rests on your own feeling. Yet unlike “I like it”, “it is beautiful” demands that everyone agree.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    // NO POSE. A hand to the head was written here for the sign-off and screenshotted:
    // the summary beat covers the stage completely, so the figure is not on screen at
    // all and the pose drew nothing. A manner pose has to be on a beat the man is
    // visible on (M6).
    //
    // The POINTS stay straight — they are the "what you now know" payoff and one of
    // the three places the reader must be able to trust the app flatly (M5). The
    // closing line is where he gets the last word.
    summary: {
      title: 'Beauty: Personal Yet Universal',
      points: [
        'Kant: aesthetic pleasure is disinterested',
        'Hume: a standard set by true critics',
        'Beauty is felt, yet claims everyone',
      ],
      closing: 'A judgement of taste rests on one person’s feeling, yet claims everyone’s agreement. Philosophers still debate how a private feeling can make that claim.',
    },
    dur: 2.8,
  },
];

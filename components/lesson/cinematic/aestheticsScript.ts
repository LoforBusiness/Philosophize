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
  /** A crowd the judgement of taste reaches out to. */
  crowd?: boolean;
  /** Hume's true critics, converging on a standard of taste. */
  critics?: boolean;
  /** This beat's answer drives the scene. */
  weigh?: 'q1' | 'q2';
}

export const BEATS: AestheticsBeat[] = [
  {
    hpose: 2,
    glow: true,
    text: 'Look at it. Beautiful, obviously. You settled that in a heartbeat, with no training at all. Philosophy has been working on why for three hundred years. No rush.',
    dur: 3.8,
  },
  {
    hpose: 7,
    glow: true,
    apple: true,
    text: 'Kant noticed something. Hungry, your hand goes out and takes the apple. The sunset feeds nothing. You want nothing from it. You just look. He needed a whole book to say that.',
    dur: 4.8,
  },
  {
    // Arms folded, watching his own chart prove his point. The pose is the tone.
    hpose: 10,
    glow: true,
    critics: true,
    text: 'Hume admitted beauty lives only in the mind. Then he ranked masters over hacks anyway. His fix was a panel of trained critics. Watch their verdicts slide together. Convenient, isn’t it.',
    cite: 'Hume, Of the Standard of Taste, 1757',
    dur: 4.6,
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
      prompt: 'A whole book, in one tap. What makes the sunset’s pleasure unlike the apple’s?',
      cards: [
        { text: 'It is disinterested', correct: true },
        { text: 'It is simply stronger', correct: false },
      ],
      // M5: the aside is aimed at the losing IDEA, never at the reader who picked
      // it. A toothache is strong too — that teaches why strength is the wrong axis.
      explain: 'Disinterested means free of wanting. The apple gratifies a need. The sunset asks for nothing, so the reaching hand falls away. Stronger is not the difference. A toothache is strong too.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    hpose: 1,
    crowd: true,
    critics: true,
    text: 'Now the part where you come in. You rarely stop at "I like this." You say "this is beautiful", as though it were a fact. One private feeling, eight people summoned to agree. No pressure.',
    dur: 4.4,
  },
  {
    // The shrug: "well, that is what the man said." It is also the right pose for a
    // beat the reader spends reading rather than watching.
    hpose: 8,
    crowd: true,
    critics: true,
    weigh: 'q2',
    interact: {
      prompt: '"Beauty is just personal taste." Fine. Then calling a sunset beautiful asks nothing of anyone?',
      cards: [
        { text: 'Felt, yet claims everyone agrees', correct: true },
        { text: 'It asks nothing of anyone', correct: false },
      ],
      explain: '"Feeling" sounds like "merely private". That is the slip. A judgment of taste is felt and still claims everyone. Look at the two rows. Liking needs one. Beautiful summons eight.',
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
      closing: 'One feeling, no evidence, speaking for everyone. Three hundred years on, still going.',
    },
    dur: 2.8,
  },
];

import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic aesthetics-aesthetics-1, "Why Things Feel Beautiful"
// Theme: THE GLOW THAT ASKS FOR NOTHING — AND SPEAKS FOR EVERYONE.
//
// A figure before a framed sunset: it glows, and the pleasure it gives wants
// nothing from it (no grabbing hand, unlike the apple he reaches to eat). Then the
// feeling turns outward — "this is beautiful" quietly demanding a whole crowd agree.
//
// Both graded questions come from data/.../why-things-feel-beautiful.ts.
// ─────────────────────────────────────────────────────────────────────────────

export interface AestheticsBeat extends BaseBeat {
  /** Figure pose: 0 stand · 1 emphatic (address the crowd) · 2 behold · 4 reflect · 7 reach-for-apple. */
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
    text: 'Why does a sunset feel beautiful? It strikes in a heartbeat. Explaining it could take a lifetime.',
    dur: 3.4,
  },
  {
    hpose: 7,
    glow: true,
    apple: true,
    text: 'Kant found beauty strange. You crave food from hunger — your hand reaches to take it. But a sunset feeds no need. You want nothing from it. You simply savor its look.',
    dur: 4.8,
  },
  {
    hpose: 4,
    glow: true,
    critics: true,
    text: 'Hume admitted beauty lives "merely in the mind." Yet we still rank a master above a hack and feel right. His fix: a standard set by true critics, refined over time.',
    cite: 'Hume, Of the Standard of Taste, 1757',
    dur: 4.6,
  },
  {
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
      prompt: 'For Kant, what makes aesthetic pleasure differ from the pleasure of eating?',
      cards: [
        { text: 'It is disinterested', correct: true },
        { text: 'It is simply stronger', correct: false },
      ],
      explain: 'Aesthetic pleasure is "disinterested": free of any desire for the object. Eating gratifies a need; beauty asks for nothing — the reaching hand falls away.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    hpose: 1,
    crowd: true,
    critics: true,
    text: 'And you rarely stop at "I like this." You say "this is beautiful" — as if it were a fact about the thing. Kant: a feeling that quietly demands everyone agree.',
    dur: 4.4,
  },
  {
    hpose: 1,
    crowd: true,
    critics: true,
    weigh: 'q2',
    interact: {
      prompt: '"Beauty is just personal taste." So does calling a sunset beautiful ask nothing of anyone?',
      cards: [
        { text: 'Felt, yet claims everyone agrees', correct: true },
        { text: 'It asks nothing of anyone', correct: false },
      ],
      explain: 'The trap: "feeling" sounds like "merely private." For Kant a judgment of taste is felt yet claims universal validity — it reaches out and asks all to agree.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Beauty: Personal Yet Universal',
      points: [
        'Kant: aesthetic pleasure is disinterested',
        'Hume: a standard set by true critics',
        'Beauty is felt, yet claims everyone',
      ],
      closing: 'Aesthetics asks why a mere feeling dares to speak for us all.',
    },
    dur: 2.8,
  },
];

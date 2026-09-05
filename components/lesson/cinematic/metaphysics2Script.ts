import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic metaphysics-being-2, "Something vs. Nothing" — Parmenides' two ways.
//
// ONE PICTURE (H64): a road that forks into two signed ways, and over the lesson
// the second way turns out to have no road under it at all. Everything else on
// the stage serves that or is not there.
//
// ── WHAT THIS REPLACED, AND WHY ─────────────────────────────────────────────
//
// The old version ran a 3×2 comparison matrix across the top third — CAN THINK
// IT / CAN SAY IT / CAN KNOW IT against IT IS / IT IS NOT — above the road. Three
// things were wrong with it and only the third is obvious:
//
//   · TWO PICTURES ARGUING (H64). The road already says "the second way is not
//     there". The matrix said it again in words, in a different visual language,
//     and the reader had to decide which one was the lesson.
//   · IT COST A FIFTH OF THE PICTURE (H59). The matrix pushed the band top to
//     172, so the whole stage drew at 1.90. With it gone the band is 282 tall,
//     which is inside the width-limited ceiling — everything is drawn at 2.31,
//     about 20% bigger, for free.
//   · A1: the old script said "step toward the second and it dissolves" and the
//     traveller's x track stopped at 220, 86 units short of the fork at 306. He
//     never stepped toward anything. He walks onto it now (beat 4, x 292) and
//     recoils with a PLAYED startle rather than holding a pose.
//
// The matrix's teaching is not lost — it is what Q1 now ASKS, on the stage
// (H65). Three posted claims, and the reader taps the one there is nothing to
// picture. That is the same distinction the matrix asserted, except the reader
// draws it instead of reading it.
//
// ── THE VOICE (group M) ─────────────────────────────────────────────────────
//
// It read as an encyclopaedia: "Leibniz gave the riddle its classic form in
// 1714. The case is still open." Dates and surnames in the hook, no manner at
// all. It is dry and faintly put-upon now, one barb a beat at most and most
// beats none, and every barb lands on the subject rather than on the reader
// (M1). The summary points and the explanations stay straight (M5).
// ─────────────────────────────────────────────────────────────────────────────

export interface Meta2Beat extends BaseBeat {
  /** Traveller gesture. Bands per N2: <100 rig, 100+ held action, 300+ played once. */ e?: number;
  /** Traveller x. 92 downstage · 214 at the fork · 292 out on the dashes. */ x?: number;
  /**
   * How dissolved the IT-IS-NOT way is this beat, 0→1.
   *
   * MONOTONIC ON PURPOSE. It ran 0.95 on the recoil and then back to 0.6 for the
   * questions, so the road the lesson had just finished proving was not there
   * quietly came back for the last three beats. A way that is not there does not
   * partially return; H59 is the general form of the same rule.
   */ gone?: number;
  /**
   * Leibniz's principle strip has slid into place (0/1).
   *
   * 1 from beat 1 to the end. It was set on beat 1 alone, so the strip slid in,
   * held for one beat and then vanished for the rest of the lesson — the reader
   * loses the first half of the argument exactly when the second half starts
   * arguing with it. H59: a prop does not leave the room and come back.
   */ pr?: number;
  /** 1 = the three posted claims are live and tappable (Q1). */ pick?: number;
}

export const BEATS: Meta2Beat[] = [
  {
    // 167 = TALKING WITH THE HANDS, the narration loop (N2). The hook is somebody
    // talking to you, and this is what that looks like from the neck down.
    e: 167, x: 92, gone: 0.3,
    text: 'There is a universe. There did not have to be one.',
    dur: 1.8,
  },
  {
    // 167 = TALKING WITH THE HANDS, the narration loop (N2). The hook is somebody
    // talking to you, and this is what that looks like from the neck down.
    e: 167, x: 92, gone: 0.3,
    text: 'That is the whole question, and it has outlasted everyone who has picked it up.',
    dur: 2.1,
  },
  {
    // 168 = COUNTING THE POINTS. He is laying out a principle, so he counts it out.
    e: 168, x: 150, gone: 0.3, pr: 1,
    text: 'Leibniz had a rule. Nothing is ever simply the case — there is always a reason for it.',
    cite: 'Leibniz, sufficient reason',
    dur: 2.1,
  },
  {
    // 168 = COUNTING THE POINTS. He is laying out a principle, so he counts it out.
    e: 168, x: 150, gone: 0.3, pr: 1,
    text: 'Then he aimed the rule at existence itself. Why is there anything?',
    dur: 1.8,
  },
  {
    // 168 = COUNTING THE POINTS. He is laying out a principle, so he counts it out.
    e: 168, x: 150, gone: 0.3, pr: 1,
    text: 'Nothing would have been simpler. He was right about that much.',
    dur: 1.8,
  },
  {
    // 379 = THE IDEA, PLAYED (N2) — it arrives and the finger goes up, once, as he
    // reaches the fork. Held (179) it would just be a man standing with a finger up.
    e: 379, x: 214, gone: 0.35, pr: 1,
    text: 'Parmenides got there first and went the other way. Forget reasons for a moment.',
    cite: 'Parmenides, On Nature',
    dur: 1.8,
  },
  {
    // 379 = THE IDEA, PLAYED (N2) — it arrives and the finger goes up, once, as he
    // reaches the fork. Held (179) it would just be a man standing with a finger up.
    e: 379, x: 214, gone: 0.35, pr: 1,
    text: 'Ask whether nothing was ever an option at all. Here is the fork he left: one way says it is, the other says it is not.',
    dur: 3.1,
  },
  {
    // 161 = ARMS FOLDED, a LIVING hold — it loops and re-settles, so he has small
    // business while the reader reads a quote (H67). A rest beat is the one place
    // a figure is on screen doing nothing, and still is what reads as broken.
    e: 161, x: 214, gone: 0.35, pr: 1,
    quote: {
      id: 'lq-metaphysics-being-2-1',
      text: 'The same thing is there for thinking and for being.',
      author: 'Parmenides',
      philosopherId: 'parmenides',
      work: 'On Nature, fragment 3',
      era: 'c. 475 BCE',
      branchSlugs: ['metaphysics'],
    },
    dur: 3.0,
  },
  {
    // 318 = STARTLE, PLAYED: a sharp recoil and a step back. This beat is the A1
    // fix — the sentence says he steps onto the second way and finds nothing, so
    // he walks out past the fork and recoils, once, on arrival.
    e: 318, x: 292, gone: 0.95, pr: 1,
    text: 'So he tries it. He steps onto the second way — and there is nothing there to step onto.',
    cite: 'The second way',
    dur: 2.3,
  },
  {
    // 318 = STARTLE, PLAYED: a sharp recoil and a step back. This beat is the A1
    // fix — the sentence says he steps onto the second way and finds nothing, so
    // he walks out past the fork and recoils, once, on arrival.
    e: 318, x: 292, gone: 0.95, pr: 1,
    text: 'What is not cannot be walked on, pointed at, or thought about. It does not have the decency to be an option.',
    dur: 2.7,
  },
  {
    // 178 = SHRUG, held. M6: a shrug is the right pose for a question beat — the
    // reader is weighing two things and "well, that is what the man said" is
    // exactly the attitude to hold while they do it.
    e: 178, x: 236, gone: 0.95, pr: 1, pick: 1,
    interact: {
      prompt: 'Two of these you can picture. Tap the one there is nothing to picture.',
      explain: 'A unicorn does not exist, and you pictured it anyway — so not existing was never the problem. "Nothing at all" leaves the thought nothing to be about, and that is Parmenides\u2019 point.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    e: 178, x: 236, gone: 0.95, pr: 1,
    interact: {
      prompt: 'Why is there something rather than nothing?',
      sort: {
        chip: 'nothing at all',
        bins: [
          { id: 'never', label: 'never possible', reads: 'nothing was never possible' },
          { id: 'lost', label: 'possible, and lost', reads: 'nothing was possible, and something won anyway', correct: true },
          { id: 'must', label: 'something had to be', reads: 'something had to exist' },
        ],
      },
      explain: 'Possible, and lost. Leibniz asks why something won, so nothing had to be a real option for it to beat. Parmenides sits at "never possible": nothing was never on the table, so being never had a rival and the question never opens.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'The Riddle of Being',
      points: [
        'Leibniz: why something rather than nothing?',
        'His answer needs a necessary being',
        'Parmenides: what is not cannot be thought',
        'Reason settles this, not measurement',
      ],
      closing: 'If nothing was never available, existence did not beat the alternative. There was not one.',
    },
    dur: 2.8,
  },
];

import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic metaphysics-being-2, "Something vs. Nothing" — Parmenides' two ways.
// A traveller walks a road to a fork: one sign reads IT IS (a solid road), the
// other IT IS NOT (a road that dissolves the moment he steps toward it). Lots of
// LOCOMOTION — he strides to the fork, tries the nothing-road, and recoils.
//
// Both graded questions come from data/.../something-vs-nothing.ts.
// ─────────────────────────────────────────────────────────────────────────────

export interface Meta2Beat extends BaseBeat {
  /** Traveller gesture (emote code). */ e?: number;
  /** Traveller x (walks along the road between beats). */ x?: number;
  /** How dissolved the IT-IS-NOT road is this beat, 0→1. */ gone?: number;
  /** Leibniz's principle strip has slid into place (0/1). */ pr?: number;
  /** How many rows of the two-ways test table are filled in, 0→3. */ mx?: number;
}

export const BEATS: Meta2Beat[] = [
  {
    e: 6, x: 92, gone: 0.35,
    text: 'Why is there something rather than nothing? Leibniz gave the riddle its classic form in 1714. The case is still open.',
    dur: 3.6,
  },
  {
    e: 1, x: 148, gone: 0.35, pr: 1,
    text: 'Leibniz held that nothing is so without a sufficient reason. Turn that on existence itself: why something rather than nothing? Nothing, he noted, would be simpler and easier.',
    cite: 'Leibniz, sufficient reason',
    dur: 4.6,
  },
  {
    e: 13, x: 196, gone: 0.4, pr: 1, mx: 2,
    text: 'Parmenides had struck first, and here is his fork. To speak of "what is not," you must think it — yet you can neither know nor utter what is not. Non-being gives reason nothing to grip.',
    cite: 'Parmenides, On Nature',
    dur: 4.8,
  },
  {
    e: 4, x: 196, gone: 0.4, pr: 1, mx: 3,
    quote: {
      id: 'lq-metaphysics-being-2-1',
      text: 'The same thing is there for thinking and for being.',
      author: 'Parmenides',
      work: 'On Nature, fragment 3',
      era: 'c. 475 BCE',
      branchSlugs: ['metaphysics'],
    },
    dur: 3.0,
  },
  {
    e: 15, x: 220, gone: 0.95, pr: 1, mx: 3,
    text: 'A goddess in his poem sets out two ways: that it is, and that it is not. Step toward the second and it dissolves — what is not can never be grasped. Judge by reason, she says, not by eye and ear.',
    cite: 'Parmenides, On Nature',
    dur: 5.0,
  },
  {
    e: 7, x: 198, gone: 0.5, pr: 1, mx: 3,
    mc: {
      prompt: 'On Parmenides’s view, why can pure nothingness never truly exist?',
      options: [
        { id: 'a', text: 'Physics has not yet discovered it', correct: false },
        { id: 'b', text: 'To think of nothing is to turn it into a something', correct: true },
        { id: 'c', text: 'Nothingness is far too small to detect', correct: false },
        { id: 'd', text: 'The gods forbade it in his poem', correct: false },
      ],
      explain:
        '"What is not" can be neither known nor spoken. Try to think nothing and you treat it as a thing — so genuine non-being slips away.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    e: 9, x: 198, gone: 0.5, pr: 1, mx: 3,
    mc: {
      prompt: 'Leibniz and Parmenides both reasoned about being. So they reached the same conclusion, right?',
      options: [
        { id: 'a', text: 'Yes — both proved a necessary being exists', correct: false },
        { id: 'b', text: 'Yes — both said nothing is unthinkable', correct: false },
        { id: 'c', text: 'No — Leibniz wants a reason for being; Parmenides denies nothing was ever an option', correct: true },
        { id: 'd', text: 'No — Parmenides agreed with science, Leibniz did not', correct: false },
      ],
      explain:
        'Leibniz seeks a sufficient reason (a necessary being); Parmenides argues "nothing" is unthinkable, so being never needed to beat an alternative.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'The Riddle of Being',
      points: [
        'Leibniz: why something rather than nothing?',
        'His ground: a necessary being',
        'Parmenides: what is not cannot be',
        'Reason, not measurement, does the work',
      ],
      closing: 'If non-being truly cannot be thought, perhaps being never needed permission to exist.',
    },
    dur: 2.8,
  },
];

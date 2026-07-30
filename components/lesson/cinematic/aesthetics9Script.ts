import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic aesthetics-aesthetics-9, "Beauty Versus Meaning" — Danto and the
// Brillo boxes. Two identical boxes stand on the stage. One is on a shop shelf and
// one is on a gallery plinth, and the entire lesson is that you cannot tell them
// apart by looking, because what makes the difference is not in the looking.
//
// Both graded questions come from
// data/branches/aesthetics/.../beauty-versus-meaning.ts. Q1 — Danto on beauty — is
// the deck question; Q2, the "not beautiful therefore not art" claim, is answered
// on the stage by hanging one of three labels under the plinth.
// ─────────────────────────────────────────────────────────────────────────────

export interface A9Beat extends BaseBeat {
  /** Narrator gesture (emote code). */ p?: number;
  /** Narrator mark on the ground. */ x?: number;
  /** Both boxes are drawn. */ boxes?: boolean;
  /** The shelf under the left box and the plinth under the right one. */ stands?: boolean;
  /** The crown over the left box — beauty, while it still ruled. */ crown?: boolean;
  /** The three labels for the tap question. */ labels?: boolean;
}

export const BEATS: A9Beat[] = [
  {
    p: 25, x: 80, boxes: true, crown: true,
    text: 'For most of the history of art, one word did the deciding. If it was beautiful it was art, and if it was not, it was something else.',
    dur: 3.8,
  },
  {
    p: 1, x: 80, boxes: true, stands: true,
    text: 'Then in 1964 Andy Warhol stacked plywood boxes painted to look exactly like Brillo cartons. Not a copy of a beautiful thing. A copy of a box.',
    cite: 'Warhol, Brillo Box, 1964',
    dur: 4.4,
  },
  {
    p: 47, x: 144, boxes: true, stands: true,
    text: 'Arthur Danto stood in front of them and asked the question that broke the old rule. These two are identical. One is in a supermarket and one is in a gallery. Nothing you can SEE tells you which is the art.',
    cite: 'The indiscernible pair',
    dur: 5.2,
  },
  {
    p: 44, x: 144, boxes: true, stands: true,
    quote: {
      id: 'lq-aesthetics-aesthetics-9-1',
      text: 'Beauty is an option for art and not a necessary condition. But it is not an option for life.',
      author: 'Arthur Danto',
      work: 'The Abuse of Beauty',
      era: '2003',
      philosopherId: 'danto',
      branchSlugs: ['aesthetics'],
    },
    dur: 3.6,
  },
  {
    p: 5, x: 208, boxes: true, stands: true,
    text: 'So the difference is not in the object. It is in what the object is doing — the argument it is making, the moment it is making it in, the history it answers. Beauty came off the throne and became one option among many.',
    cite: 'Beauty dethroned',
    dur: 5.0,
  },
  {
    p: 3, x: 208, boxes: true, stands: true,
    mc: {
      prompt: 'On Danto’s account, what is the relationship between beauty and art?',
      options: [
        { id: 'a', text: 'Beauty is one option for art, not a requirement', correct: true },
        { id: 'b', text: 'Beauty is the single necessary mark of all art', correct: false },
        { id: 'c', text: 'Beauty and art turn out to be the same thing', correct: false },
        { id: 'd', text: 'Art can no longer be beautiful at all', correct: false },
      ],
      explain:
        'An option, not a condition. The trap is D — hearing "beauty was dethroned" as "beauty was banned." Danto’s claim is smaller and stranger than that: a work can still be beautiful, it just no longer has to be, because what makes it art was never the beauty.',
    },
    dur: 4.6,
  },
  {
    p: 13, x: 208, boxes: true, stands: true, labels: true,
    interact: {
      prompt: 'Someone says: “It isn’t beautiful, so it can’t really be art.” Tap the label that belongs under the plinth.',
      explain:
        'The trap is the first label, and it is the oldest assumption in the subject: art equals beauty. Warhol’s boxes are not beautiful and nobody claims they are — they are art because of what they mean and when they said it. The third label is the opposite mistake, smuggling beauty back in by insisting it must be there somewhere, invisibly.',
    },
    dur: 4.8,
  },
  {
    summary: {
      title: 'Meaning Can Replace Beauty',
      points: [
        'Beauty once decided what counted as art',
        'Danto: beauty is optional, not essential',
        'Two identical boxes, one of them art',
        'The difference is meaning, not appearance',
      ],
      closing: 'Art is allowed to question and unsettle, not only to please the eye.',
    },
    dur: 4.0,
  },
];

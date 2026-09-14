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
    p: 462, x: 80, boxes: true, crown: true,
    text: 'For centuries, philosophers and critics treated beauty as the defining mark of art.',
    dur: 2.9,
  },
  {
    p: 462, x: 80, boxes: true, crown: true,
    text: 'On this view, beauty is a necessary condition, so a work without beauty couldn’t count as art.',
    dur: 1.8,
  },
  {
    p: 459, x: 80, boxes: true, stands: true,
    text: 'In 1964, Andy Warhol exhibited plywood boxes painted to look like Brillo soap-pad cartons.',
    cite: 'Warhol, Brillo Box, 1964',
    dur: 3.6,
  },
  {
    p: 459, x: 80, boxes: true, stands: true,
    text: 'Warhol’s work copied an ordinary commercial package rather than anything beautiful.',
    dur: 1.8,
  },
  {
    p: 47, x: 144, boxes: true, stands: true,
    text: 'Arthur Danto posed the problem of indiscernibles. Two objects can look identical, yet only one is a work of art.',
    cite: 'The indiscernible pair',
    dur: 2.5,
  },
  {
    p: 47, x: 144, boxes: true, stands: true,
    text: 'One box is in a supermarket and one is in a gallery. Perception alone can’t tell you which is the artwork.',
    dur: 2.7,
  },
  {
    p: 139, x: 144, boxes: true, stands: true,
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
    text: 'So the difference is not in the object. For Danto, the difference lies in the work’s meaning and in the art history behind it.',
    cite: 'Meaning, not appearance',
    dur: 3.7,
  },
  {
    p: 5, x: 208, boxes: true, stands: true,
    text: 'Beauty remains possible in art, but it no longer decides what counts as art.',
    dur: 1.8,
  },
  {
    p: 383, x: 208, boxes: true, stands: true,
    interact: {
      prompt: 'After Warhol and Danto, what is the status of beauty in art?',
      sort: {
        chip: 'beauty',
        bins: [
          { id: 'must', label: 'required', reads: 'a work must be beautiful to count' },
          { id: 'may', label: 'optional', reads: 'a work may be beautiful, and need not be', correct: true },
          { id: 'never', label: 'discarded', reads: 'beauty has no place in art' },
        ],
      },
      explain: 'Optional. For Danto, a work may be beautiful and need not be. Beauty wasn’t banished from art. It stopped being a condition, because what makes a work art is its meaning, not its appearance.',
    },
    dur: 4.6,
  },
  {
    p: 434, x: 208, boxes: true, stands: true, labels: true,
    interact: {
      prompt: 'Warhol’s boxes aren’t beautiful. Which verdict belongs under the box in the gallery?',
      explain:
        'Not pretty, still art. The first verdict assumes that art requires beauty, the assumption Brillo Box challenges. The third keeps that assumption by positing a beauty no one can see in the work.',
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
      closing: 'Art can question and unsettle, not only please the eye.',
    },
    dur: 4.0,
  },
];

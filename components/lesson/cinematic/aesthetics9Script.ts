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
    p: 164, x: 80, boxes: true, crown: true,
    text: 'For most of the history of art, one word did the deciding. Beautiful things were art.',
    dur: 2.9,
  },
  {
    p: 164, x: 80, boxes: true, crown: true,
    text: 'Everything else was something else.',
    dur: 1.8,
  },
  {
    p: 167, x: 80, boxes: true, stands: true,
    text: 'Then in 1964 Andy Warhol stacked plywood boxes painted to look exactly like Brillo cartons. Not a copy of a beautiful thing.',
    cite: 'Warhol, Brillo Box, 1964',
    dur: 3.6,
  },
  {
    p: 167, x: 80, boxes: true, stands: true,
    text: 'A copy of a box.',
    dur: 1.8,
  },
  {
    p: 47, x: 144, boxes: true, stands: true,
    text: 'Arthur Danto stood in front of the two boxes and asked the question that broke the old rule. The boxes are identical.',
    cite: 'The indiscernible pair',
    dur: 2.5,
  },
  {
    p: 47, x: 144, boxes: true, stands: true,
    text: 'One is in a supermarket and one is in a gallery. Nothing you can SEE tells you which is the art.',
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
    text: 'So the difference is not in the object. The difference is in what the object does: the argument the work makes, the moment it lands in, the history it answers.',
    cite: 'Beauty dethroned',
    dur: 3.7,
  },
  {
    p: 5, x: 208, boxes: true, stands: true,
    text: 'Beauty came off the throne and became one option among many.',
    dur: 1.8,
  },
  {
    p: 3, x: 208, boxes: true, stands: true,
    interact: {
      prompt: 'So where does beauty stand now?',
      sort: {
        chip: 'beauty',
        bins: [
          { id: 'must', label: 'required', reads: 'a work must be beautiful to count' },
          { id: 'may', label: 'optional', reads: 'a work may be beautiful, and need not be', correct: true },
          { id: 'never', label: 'discarded', reads: 'beauty was thrown out altogether' },
        ],
      },
      explain: 'An option, not a condition. The trap is hearing "dethroned" as "banned." A work can still be beautiful, it just no longer has to be, because what made it art was never the beauty.',
    },
    dur: 4.6,
  },
  {
    p: 13, x: 208, boxes: true, stands: true, labels: true,
    interact: {
      prompt: '“It isn’t beautiful, so it isn’t art.” Tap the label that belongs under the plinth.',
      explain:
        'The trap is the first label — the oldest assumption in the subject: art equals beauty. Warhol’s boxes are not beautiful and nobody says they are. The third smuggles beauty back in by insisting it must be there invisibly.',
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

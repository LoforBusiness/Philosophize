import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic aesthetics-aesthetics-25, "Is Your Taste Really Yours?"
// Theme: TWO VIEWERS, ONE CANVAS, AND THE SHELF EACH ARRIVED CARRYING.
//
// Bourdieu's claim is about the VIEWER and not about the picture, so the scene
// draws the same canvas twice and lets everything else differ. Two frames, drawn
// from one set of styles so they cannot come out different by accident; under
// each, a stack of what a childhood handed over. One stack is six deep and one is
// a single slab.
//
// That is the whole argument in the composition: if the canvases are identical
// and the experience is not, the difference walked in through the door.
//
// GAMIFIED SHAPE:
//   · beat 4  SCENE TARGETS — three plates, and the reader taps the thing that is
//     not the same for both visitors. On the stage because the picture has
//     already shown two of the three answers to be identical.
//   · beat 9  a SORT — where loving difficult films belongs. The reader's own chip
//     draws the arrows into the viewer: one from the heart, one from the shelf,
//     or both at once, which is the answer the lesson argues for.
// ─────────────────────────────────────────────────────────────────────────────

export interface Aesthetics25Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** 1 = the two frames and their visitor names stand. */ frames?: number;
  /** How much of each stack has been laid, 0…1. */ shelves?: number;
  /** 1 = the three plates the reader chooses between are up. */ plates?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
  /** 1 = the single viewer and the two feeds into him are drawn. */ feeds?: number;
}

export const BEATS: Aesthetics25Beat[] = [
  {
    p: 2, x: 40,
    text: 'Taste in art feels personal. Yet the sociologist Pierre Bourdieu found that it closely tracks social class and upbringing.',
    dur: 4.2,
  },
  {
    p: 30, x: 40, frames: 1,
    text: 'Consider two visitors in front of the same canvas.',
    dur: 2.8,
  },
  {
    p: 36, x: 40, frames: 1,
    text: 'One recognises its style and subject at once. The other can’t tell what to look for.',
    dur: 3.6,
  },
  {
    p: 160, x: 40, frames: 1, shelves: 1,
    text: 'Bourdieu locates the difference in what each visitor brings to the canvas.',
    dur: 3.4,
  },
  {
    p: 161, x: 40, frames: 1, shelves: 1, plates: 1, live: 1,
    interact: {
      prompt: 'Which of these differs between the two visitors?',
      explain: 'What they brought. Both visitors face the same canvas, and both look at it for the same length of time. Only the stacks beneath them differ.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 159, x: 40, frames: 1, shelves: 1,
    text: 'Bourdieu called such a background cultural capital. It includes books at home, gallery visits and conversation over meals.',
    dur: 4.4,
  },
  {
    p: 62, x: 96, frames: 1, shelves: 1,
    text: 'Cultural capital is acquired in childhood, so it feels like natural taste rather than training.',
    dur: 3.4,
  },
  {
    p: 433, x: 96, frames: 1, shelves: 1,
    quote: {
      id: 'lq-aesthetics-aesthetics-25-1',
      text: 'Taste classifies, and it classifies the classifier.',
      author: 'Pierre Bourdieu',
      philosopherId: 'pierre-bourdieu',
      work: 'Distinction',
      era: '1979',
      branchSlugs: ['aesthetics'],
    },
    dur: 4.0,
  },
  {
    p: 383, x: 96, frames: 1, shelves: 1,
    text: 'Kant said a judgement of beauty is disinterested. Bourdieu replied that such detachment requires freedom from economic need.',
    dur: 4.6,
  },
  {
    p: 21, x: 96, feeds: 1,
    interact: {
      prompt: 'Suppose you love difficult films. What does Bourdieu’s account make of that preference?',
      sort: {
        chip: 'loving difficult films',
        bins: [
          { id: 'heart', label: 'sincere', reads: 'a sincere response that owes nothing to upbringing' },
          { id: 'shelf', label: 'social signal', reads: 'a display meant to mark you as cultured' },
          { id: 'both', label: 'both', reads: 'sincerely felt, yet shaped by your upbringing', correct: true },
        ],
      },
      explain: 'Sincerely felt, yet shaped by your upbringing. For Bourdieu, the love is sincere, because its training ended long ago. Calling it a pose misreads him. Taste, on his account, is socially formed and still felt.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Where Taste Comes From',
      points: [
        'Preferences track class as well as temperament',
        'Cultural capital is passed on through upbringing',
        'Trained taste feels natural to its owner',
        'Disinterested contemplation presupposes freedom from economic need',
      ],
      closing: 'For Bourdieu, a judgement of taste also reveals the social position of the person making it.',
    },
    dur: 3.6,
  },
];

import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic aesthetics-aesthetics-26, "Loving Things Because They're Awful"
// Theme: ONE LAWN FLAMINGO, AND AN EYE THAT CHANGES WHILE IT DOES NOT.
//
// The lesson's own claim is that the object barely moves and the attitude does,
// so the flamingo is drawn once and never altered — not a line of it responds to
// anything the reader does. What responds is the EYE beside it, which half-closes
// into a wink as the reader hands the difference to the beholder.
//
// That asymmetry is the argument. A scene that made the flamingo tackier as the
// reader slid toward camp would be saying the opposite of the lesson while
// looking like an illustration of it.
//
// GAMIFIED SHAPE:
//   · beat 4  SCENE TARGETS — three plates, and the reader taps what a grin at a
//     tacky thing actually is. On the stage because the bird is in front of them
//     and it is the attitude that is in question.
//   · beat 8  a DRAG — the difference divided between the object and the
//     beholder. The eye winks as it travels; the flamingo does not move.
// ─────────────────────────────────────────────────────────────────────────────

export interface Aesthetics26Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** 1 = the flamingo is on its plinth. */ bird?: number;
  /** 1 = the eye beside it is drawn. */ eye?: number;
  /** How far the difference has been handed to the beholder, 0…1. */ wink?: number;
  /** 1 = the three plates the reader chooses between are up. */ plates?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Aesthetics26Beat[] = [
  {
    p: 423, x: 28, bird: 1,
    text: 'A plastic flamingo on a lawn. Nobody’s calling it great sculpture.',
    dur: 4.2,
  },
  {
    p: 172, x: 28, bird: 1,
    text: 'Kitsch hands you the feeling already chewed. A kitten with enormous wet eyes.',
    dur: 4.6,
  },
  {
    p: 435, x: 28, bird: 1,
    text: 'Milan Kundera called it the second tear. The first is for children on the grass, the second for how nice it feels to be moved.',
    dur: 5.0,
  },
  {
    p: 257, x: 28, bird: 1, eye: 1,
    text: 'Camp is the other thing entirely. Kitsch is sincere, and camp is a wink.',
    dur: 4.4,
  },
  {
    p: 164, x: 28, bird: 1, eye: 1, plates: 1, live: 1,
    interact: {
      prompt: 'Tap what a grin at a tacky bird is.',
      explain: 'Knowing love. Sincerely mistaking this for a masterpiece would be the bad taste your flatmate means. Pretending it secretly is one gives up the joke. Camp sees that the thing is awful and enjoys that, on purpose.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 442, x: 88, bird: 1, eye: 1,
    text: 'Susan Sontag mapped camp: drag, B-movies, a chandelier hung in a diner.',
    dur: 4.6,
  },
  {
    p: 430, x: 88, bird: 1, eye: 1,
    quote: {
      id: 'lq-aesthetics-aesthetics-26-1',
      text: 'The whole point of Camp is to dethrone the serious. Camp is playful, anti-serious.',
      author: 'Susan Sontag',
      work: 'Notes on Camp',
      era: '1964',
      branchSlugs: ['aesthetics'],
    },
    dur: 4.6,
  },
  {
    p: 445, x: 88, bird: 1, eye: 1,
    text: 'The same flamingo can be either. One neighbour finds it lovely, and another finds it gloriously absurd.',
    dur: 5.0,
  },
  {
    p: 177, x: 88, bird: 1, eye: 1,
    interact: {
      prompt: 'What decides which of the two it is?',
      drag: {
        lo: 'THE OBJECT',
        hi: 'THE BEHOLDER',
        start: 0.04,
        zones: [
          { id: 'object', upto: 0.3, reads: 'the object — some things simply are tacky' },
          { id: 'both', upto: 0.62, reads: 'half the bird, half the person looking' },
          { id: 'eye', upto: 1, reads: 'the beholder — the bird never changed', correct: true },
        ],
      },
      explain: 'The beholder, and the picture says so: nothing about the bird moved while you slid. Tackiness is real enough, and tackiness is what BOTH attitudes respond to. So tackiness cannot be the mark that tells the two apart.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 322, x: 88, bird: 1, eye: 1, wink: 1,
    summary: {
      title: 'The Joy of Bad Taste',
      points: [
        'Kitsch is easy, sentimental and completely sincere',
        'Kundera called it being moved by your own feeling',
        'Camp knows the thing is awful and enjoys that',
        'The object hardly changes; the attitude does',
      ],
      closing: 'Bad taste taken up with open eyes turns into a taste of its own. It’s one of the few that has to be held on purpose.',
    },
    dur: 4.8,
  },
];

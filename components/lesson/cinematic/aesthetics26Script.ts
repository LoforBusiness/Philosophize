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
    text: 'Consider a plastic flamingo on a lawn. By any ordinary standard it’s bad art, yet many people love it.',
    dur: 4.2,
  },
  {
    p: 172, x: 28, bird: 1,
    text: 'Kitsch is art that supplies ready-made emotion. A painted kitten with enormous wet eyes is a standard example.',
    dur: 4.6,
  },
  {
    p: 435, x: 28, bird: 1,
    text: 'Milan Kundera wrote that kitsch brings two tears. The first is for children running on grass, the second for the pleasure of being moved.',
    dur: 5.0,
  },
  {
    p: 257, x: 28, bird: 1, eye: 1,
    text: 'Camp is a different attitude. The lover of kitsch is sincere, while camp loves bad taste knowingly.',
    dur: 4.4,
  },
  {
    p: 164, x: 28, bird: 1, eye: 1, plates: 1, live: 1,
    interact: {
      prompt: 'What is the attitude of someone who grins at a tacky flamingo?',
      explain: 'Knowing love. Sincerely admiring the flamingo would be bad taste. Calling it a masterpiece would deny the very awfulness camp enjoys. Camp sees that the thing is awful and loves it for that reason.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 442, x: 88, bird: 1, eye: 1,
    text: 'Susan Sontag defined camp in 1964 as a love of the unnatural. Her examples include Tiffany lamps and Swan Lake.',
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
    text: 'The same flamingo can be either kitsch or camp. One neighbour admires it sincerely, and another enjoys it as absurd.',
    dur: 5.0,
  },
  {
    p: 177, x: 88, bird: 1, eye: 1,
    interact: {
      prompt: 'What decides whether the flamingo is kitsch or camp?',
      drag: {
        lo: 'THE OBJECT',
        hi: 'THE BEHOLDER',
        start: 0.04,
        zones: [
          { id: 'object', upto: 0.3, reads: 'the object: its features settle the matter' },
          { id: 'both', upto: 0.62, reads: 'partly the object, partly the beholder' },
          { id: 'eye', upto: 1, reads: 'the beholder’s attitude, since the object is unchanged', correct: true },
        ],
      },
      explain: 'The beholder’s attitude, since the object is unchanged. Tackiness is a real feature, but both attitudes respond to it. So tackiness can’t be what distinguishes kitsch from camp, and the difference lies in how the beholder takes it.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 322, x: 88, bird: 1, eye: 1, wink: 1,
    summary: {
      title: 'Kitsch and Camp',
      points: [
        'Kitsch offers easy, sincere sentiment',
        'Kundera: kitsch is enjoying your own emotion',
        'Camp knows the thing is awful and enjoys that',
        'The object stays the same, but the attitude differs',
      ],
      closing: 'Enjoyed knowingly, bad taste becomes a distinct taste in its own right. Sontag called this sensibility camp.',
    },
    dur: 4.8,
  },
];

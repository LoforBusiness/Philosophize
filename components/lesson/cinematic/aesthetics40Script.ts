import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic aesthetics-aesthetics-40, "The Senses That Were Not Invited"
// Theme: FIVE PILLARS OF SENSE, AND A LINE ONLY TWO OF THEM CLEAR.
//
// Hegel's division is a RANKING, so the scene draws one and lets the heights do
// the arguing: five columns off one floor, two of them tall, and a ruled line at
// the height where art is said to begin. Nothing is labelled superior. The
// picture simply shows which columns reach.
//
// The line is dashed and the pillars are solid, which is the whole editorial
// position of the lesson: the columns are facts about the senses and the line is
// somebody's decision about them.
//
// GAMIFIED SHAPE:
//   · beat 4  SCENE TARGETS — three plates, and the reader taps the reason the
//     lower three were shut out. On the stage because the drawing has already
//     shown that it is not about strength or about how many there are.
//   · beat 8  a DRAG — the taste column itself, raised toward the line. The
//     reader is not moving a knob beside the argument; they are moving the column
//     the argument is about.
// ─────────────────────────────────────────────────────────────────────────────

export interface Aesthetics40Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** How many of the five sense pillars are standing, 0…1. */ pillars?: number;
  /** 1 = the ruled line where art is said to begin is drawn. */ line?: number;
  /** How far the taste column has been raised toward the tall pair, 0…1. */ raise?: number;
  /** 1 = the three plates the reader chooses between are up. */ plates?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
  /** 1 = five course dots sit over the taste column, the last one a ring. */ course?: number;
}

export const BEATS: Aesthetics40Beat[] = [
  {
    p: 424, x: 32,
    text: 'Galleries hang paintings, not dinners. Philosophers have long given a reason for the difference.',
    dur: 4.2,
  },
  {
    p: 172, x: 32, pillars: 0.4,
    text: 'G. W. F. Hegel divided the senses into two groups. Sight and hearing, he held, can carry art.',
    dur: 4.0,
  },
  {
    p: 435, x: 32, pillars: 1,
    text: 'Smell, taste and touch were excluded, a division already discussed by Plato.',
    dur: 4.4,
  },
  {
    p: 257, x: 32, pillars: 1, line: 1,
    text: 'Looking leaves a painting intact, but eating consumes a dinner. Hegel held that works of art must keep their independence from the viewer.',
    dur: 4.4,
  },
  {
    p: 164, x: 32, pillars: 1, line: 1, plates: 1, live: 1,
    interact: {
      prompt: 'Why are smell, taste and touch excluded from art’s theoretical senses?',
      explain: 'The object is eaten. A painting survives being looked at, so viewers can return to it and dispute it. Weakness was never the claim, since a smell can overwhelm. Privacy fails as a reason, because two people can taste one dish and disagree about it.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 442, x: 92, pillars: 1, line: 1,
    text: 'Consider a tasting menu. It opens, develops a theme, alludes to an older dish and concludes.',
    dur: 4.4,
  },
  {
    p: 428, x: 92, pillars: 1, line: 1,
    quote: {
      id: 'lq-aesthetics-aesthetics-40-1',
      text: 'The sensuous aspect of art is related only to the two theoretical senses of sight and hearing, while smell, taste, and touch remain excluded.',
      author: 'G. W. F. Hegel',
      philosopherId: 'georg-hegel',
      work: 'Lectures on Aesthetics',
      era: '1835',
      branchSlugs: ['aesthetics'],
    },
    dur: 4.8,
  },
  {
    p: 445, x: 92, pillars: 1, line: 1, course: 1,
    text: 'Diners argue about whether the fifth course earned its place. That’s following a form.',
    dur: 4.6,
  },
  {
    p: 177, x: 92, pillars: 1, line: 1,
    interact: {
      prompt: 'How far does a great meal actually reach?',
      drag: {
        lo: 'A PLEASURE',
        hi: 'A WORK',
        start: 0.06,
        zones: [
          { id: 'pleasure', upto: 0.3, reads: 'a pleasure, and it ends with the plate' },
          { id: 'craft', upto: 0.62, reads: 'skilled work, made about nothing' },
          { id: 'work', upto: 1, reads: 'about something, and it repays attention', correct: true },
        ],
      },
      explain: 'All the way, or the exclusion needs a better reason. A composed menu has structure, reference and a view. People argue about it the way they argue about a film. Mere craft is the interesting objection — and craft is what was once said about the novel.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 322, x: 92, pillars: 1, line: 1, raise: 1,
    summary: {
      title: 'Above the Line',
      points: [
        'Hegel let only sight and hearing carry art',
        'The reason was that the others consume the thing',
        'A composed meal has form, reference and an argument',
        'A vanishing object is a hard case, not a bar',
      ],
      closing: 'Live music vanishes too, and nobody bars music for vanishing. The line was drawn once, and has been moving ever since.',
    },
    dur: 4.4,
  },
];

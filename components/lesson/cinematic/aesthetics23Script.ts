import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic aesthetics-aesthetics-23, "Can Music Mean Anything?"
// Theme: A TUNE ON A STAVE, AND AN ARROW LOOKING FOR SOMETHING TO POINT AT.
//
// Expression and representation get run together constantly, and the reason is
// that both get called "meaning". Having a mood and being about a thing are
// different jobs. A painting of an apple points at apples. A sad adagio points
// at nothing whatever, and is still sad.
//
// So the picture gives the stave one arrow and three places to aim it, and moves
// the arrow rather than talking about aiming. The third plate is not a joke: for
// most instrumental music, pointing at nothing outside itself is the answer, and
// it is the answer that sounds like a failure until you notice the music is not
// trying.
//
// GAMIFIED SHAPE:
//   · beat 3  SCENE TARGETS — tap where a fugue with no title points. A MOOD is
//     the rival, and it is a good one: the fugue does have a mood, which is
//     precisely the thing that is not pointing (H66).
//   · beat 7  a LEVER — three settings for what most instrumental music does,
//     and the middle one is the distinction the whole lesson turns on.
// ─────────────────────────────────────────────────────────────────────────────

export interface Aes23Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** The stave and its notes, 0…1. */ stave?: number;
  /** The three candidate plates and the caption, 0…1. */ plates?: number;
  /** The arrow, 0…1. */ point?: number;
  /** Which plate the arrow is over: 0, 1 or 2. */ aim?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
  /** 1 = a dashed boundary frames the tune's own notes — nothing outside itself. */ seal?: number;
  /** 1 = a dark shape sits half behind the aimed plate — the will hidden behind it. */ hidden?: number;
}

export const BEATS: Aes23Beat[] = [
  {
    p: 462, x: 200, stave: 1,
    text: 'A melody of seven notes has no words. Yet it can move a listener to tears.',
    dur: 2.4,
  },
  {
    p: 462, x: 200, stave: 1, point: 1,
    text: 'What, then, is the melody about? Music might mean something in two different ways.',
    dur: 2,
  },
  {
    p: 466, x: 200, stave: 1, plates: 1, point: 1, aim: 0,
    text: 'The first way is expression. Peter Kivy argues that a slow, falling melody sounds sad because it resembles a sad person’s bearing.',
    cite: 'Expression',
    dur: 4.4,
  },
  {
    p: 379, x: 132, stave: 1, plates: 1, point: 1, aim: 1,
    text: 'The second way is representation, which means being about something. Violins can imitate birdsong, but a title usually names the bird.',
    cite: 'Representation',
    dur: 4.8,
  },
  {
    p: 165, x: 132, stave: 1, plates: 1, point: 1, aim: 1, live: 1,
    interact: {
      prompt: 'What is a fugue without a title about?',
      explain: 'Nothing outside itself. A mood is tempting, and the fugue may well express one. But expressing a mood isn’t being about something. Without its title, even the birdsong piece is only a sequence of trills.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 176, x: 132, stave: 1, plates: 1, point: 1, aim: 2,
    text: 'Music that represents nothing is called absolute music. Most instrumental music is absolute in this sense.',
    cite: 'Absolute music',
    dur: 2.6,
  },
  {
    p: 176, x: 132, stave: 1, plates: 1, point: 1, aim: 2, seal: 1,
    text: 'Such music has no subject beyond its own patterns of tones.',
    dur: 1.8,
  },
  {
    p: 465, x: 268, stave: 1, plates: 1, point: 1, aim: 2,
    quote: {
      id: 'lq-aesthetics-aesthetics-23-2',
      text: 'Music is by no means like the other arts the copy of the Ideas, but the copy of the will itself.',
      author: 'Arthur Schopenhauer',
      philosopherId: 'arthur-schopenhauer',
      work: 'The World as Will and Representation',
      era: '1818',
      branchSlugs: ['aesthetics'],
    },
    dur: 4.2,
  },
  {
    p: 399, x: 268, stave: 1, plates: 1, point: 1, aim: 2, hidden: 1,
    text: 'Arthur Schopenhauer held that music does represent. It copies no visible thing, but the will hidden behind all things.',
    dur: 4.6,
  },
  {
    p: 383, x: 268, stave: 1, plates: 1, point: 1, aim: 2,
    interact: {
      prompt: 'Which description fits most instrumental music?',
      sort: {
        chip: 'instrumental music',
        bins: [
          { id: 'nothing', label: 'no mood', reads: 'expresses no mood and represents nothing' },
          { id: 'mood', label: 'mood, no object', reads: 'expresses a mood but represents nothing', correct: true },
          { id: 'objects', label: 'represents things', reads: 'represents things, as words do' },
        ],
      },
      explain: 'Mood, no object. A slow, falling line sounds sorrowful without being about anything. So it expresses a mood but represents nothing. Denying it any mood ignores its sorrow, and representing an object usually needs a title.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Mood Without An Object',
      points: [
        'Expression: music has a character, such as sorrow',
        'Representation: music is about something beyond itself',
        'Most instrumental music does the first and not the second',
        'Where music represents, a title usually supplies the subject',
      ],
      closing: 'Instrumental music can express sorrow without representing anything. Expression and representation are separate kinds of meaning.',
    },
    dur: 3.6,
  },
];

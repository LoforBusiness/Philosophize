import type { BaseBeat } from './cinematicKit';

// Cinematic epistemology-knowledge-12, "Where Does What You Know Come From?" —
// perception, testimony and memory, staged as THREE PIPES FEEDING ONE TANK.
//
// THE ONE PICTURE (H64): a tank labelled WHAT YOU KNOW, stage right, and three
// pipes feeding it. Perception is a stub entering just beside it. Memory is longer
// and bends. Testimony runs the whole width of the stage and out past the edge,
// because it starts with other people. Over the lesson the tank fills in three
// visible bands — and the band that fills almost all of it comes down the pipe
// from furthest away. The picture's change IS the argument.
//
// Q1 is the nuanced one and lives in the deck (which route is least DIRECT). Q2 is
// answered on the stage: a belief-token lands in the tank and the reader taps the
// pipe that delivered it.
//
// AGREEMENT WITH THE DATA FILE (E37c): the same two graded questions, the same two
// concepts, and testimony correct in both. The data's first is a `sort` — order
// three beliefs from most direct to least — which the cinematic deck cannot render,
// so it is re-cut as an `mc` on exactly that concept, keeping the data's three
// example beliefs (rain, toast, the wall) as its flavour. Wording moved for the
// staging; substance did not.

export interface Epistemology12Beat extends BaseBeat {
  /** Figure gesture code (emoteHold). */ p?: number;
  /** Where the figure stands (stage x). 56 = downstage left, 124 = beside the tank. */ x?: number;
  /**
   * How many pipes have been laid, 0..3 — and therefore how far the tank has
   * filled. 1 = perception only · 2 = + memory · 3 = + testimony, the big band.
   * One channel drives the pipe, its plate and its band, so they can never disagree.
   */ pipes?: number;
  /** 1 = the belief-token "THE GREAT WALL OF CHINA EXISTS" is floating in the tank. */ token?: number;
  /** 1 = the three pipe plates are live tap targets (Q2). */ pick?: number;
}

export const BEATS: Epistemology12Beat[] = [
  {
    p: 2, x: 56, pipes: 0,
    text: 'You have never seen an atom, and you were not there for your own birth. You would still bet money on both. So how did they get in?',
    dur: 4.2,
  },
  {
    p: 31, x: 56, pipes: 1,
    text: 'Rain lands on your hand and you believe it is raining before you have thought about it. That pipe is short: the world touches you, and the belief is already in.',
    cite: 'Pipe one · perception',
    dur: 5.0,
  },
  {
    p: 4, x: 124, pipes: 2,
    text: 'You know what you ate this morning, but the toast is long gone. What you are reading is a copy your mind kept. That pipe is longer, and it bends.',
    cite: 'Pipe two · memory',
    dur: 5.0,
  },
  {
    p: 137, x: 124, pipes: 2,
    quote: {
      id: 'lq-epistemology-knowledge-12-1',
      text: 'There is no species of reasoning more common, more useful, and even necessary to human life, than that which is derived from the testimony of men.',
      author: 'David Hume',
      work: 'An Enquiry Concerning Human Understanding',
      era: '1748',
      philosopherId: 'david-hume',
      branchSlugs: ['epistemology'],
    },
    dur: 4.0,
  },
  {
    p: 45, x: 124, pipes: 3,
    text: 'The third pipe does not begin near you at all. It runs in from strangers — teachers, books, mapmakers, people long dead. Now watch what it does to the level.',
    cite: 'Pipe three · testimony',
    dur: 5.2,
  },
  {
    p: 21, x: 124, pipes: 3,
    interact: {
      prompt: 'Rain felt, toast remembered, a wall you were told about. Which route is least direct?',
      lever: {
        start: 0,
        stops: [
          { id: 'senses', reads: 'the world, then you' },
          { id: 'memory', reads: 'the world, then you, then you again' },
          { id: 'told', reads: 'the world, then somebody else, then you', correct: true },
        ],
      },
      explain: 'The trap: swapping DIRECT for RELIABLE. Senses misfire and memory fades, but both run straight from the world to you. Testimony detours through another mind that had to see it, keep it, and choose to pass it on.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 47, x: 124, pipes: 3, token: 1, pick: 1,
    interact: {
      prompt: 'A new belief enters the tank: the Great Wall exists. Tap the pipe that delivered it.',
      explain: 'The trap: it feels seen — films, photographs, a line on a map. Every one of those is a report from somebody else. You have never stood on that wall, and most of the tank is stacked out of beliefs exactly like it.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 33, x: 124, pipes: 3,
    summary: {
      title: 'The Three Pipelines',
      points: [
        'Perception, memory and testimony feed almost everything',
        'Testimony is the longest route and carries the most',
        'Every pipe can deliver something false',
        'Hume called testimony necessary to human life',
      ],
      closing: 'You are not an island of knowledge. You are a node in a web of trust.',
    },
    dur: 3.2,
  },
];

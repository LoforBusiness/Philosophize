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
  /** 1 = a "?" badge hovers over the tank — the question, before any route is
   *  named. */ askRoute?: number;
  /** 1 = a dashed ring marks the memory pipe's whole bent path — the longer
   *  route this beat names. */ memRing?: number;
  /** 1 = a dashed ring marks the testimony band inside the tank — the biggest
   *  share, which this beat names. */ mostRing?: number;
}

export const BEATS: Epistemology12Beat[] = [
  {
    p: 2, x: 56, pipes: 0,
    text: 'You’ve never seen an atom, and you don’t remember being born. Yet you’re confident of both facts.',
    dur: 3.3,
  },
  {
    p: 266, x: 56, pipes: 0, askRoute: 1,
    text: 'By what routes do beliefs like these reach you?',
    dur: 1.8,
  },
  {
    p: 31, x: 56, pipes: 1,
    text: 'The first source is perception, the most direct. Rain lands on your hand, and you believe it’s raining without inferring anything.',
    cite: 'Source one · perception',
    dur: 5.0,
  },
  {
    p: 457, x: 124, pipes: 2,
    text: 'Memory is the second source. You still know what you ate this morning, although the toast is gone, because memory preserves what you perceived.',
    cite: 'Source two · memory',
    dur: 3.8,
  },
  {
    p: 457, x: 124, pipes: 2, memRing: 1,
    text: 'A remembered belief travels a longer route, because it must be stored and later recalled.',
    dur: 1.8,
  },
  {
    p: 128, x: 124, pipes: 2,
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
    p: 463, x: 124, pipes: 3,
    text: 'The third source, testimony, begins with other people. It reaches you from teachers, books, mapmakers and writers long dead.',
    cite: 'Source three · testimony',
    dur: 3.8,
  },
  {
    p: 463, x: 124, pipes: 3, mostRing: 1,
    text: 'Most of what you know reaches you by testimony rather than by your own observation.',
    dur: 1.8,
  },
  {
    p: 453, x: 124, pipes: 3,
    interact: {
      prompt: 'Your belief that a distant wall exists came from reports. What route did that belief take?',
      sort: {
        chip: 'a wall known from reports',
        bins: [
          { id: 'senses', label: 'one step', reads: 'from the world directly to you' },
          { id: 'memory', label: 'two steps', reads: 'from the world to you, then recalled later' },
          { id: 'told', label: 'through another mind', reads: 'from the world to another person, then to you', correct: true },
        ],
      },
      explain: 'Through another mind. Testimony reaches you only after someone else perceived the fact, remembered it and chose to report it. Direct isn’t the same as reliable: perception and memory can err, yet both run from the world to you.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 386, x: 124, pipes: 3, token: 1, pick: 1,
    interact: {
      prompt: 'Through which source did your belief that the Great Wall of China exists arrive?',
      explain: 'Testimony. The belief can feel like something seen, because of films, photographs and maps. Yet each of these comes to you from someone else. Unless you’ve visited the wall, the belief rests on testimony, like most of what you know.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 385, x: 124, pipes: 3,
    summary: {
      title: 'Three Sources of Knowledge',
      points: [
        'Perception, memory and testimony supply almost all knowledge',
        'Testimony is the least direct source, yet supplies the most',
        'Each source can deliver false beliefs',
        'Hume called testimony necessary to human life',
      ],
      closing: 'Because so much of it comes by testimony, your knowledge depends on trusting other people.',
    },
    dur: 3.2,
  },
];

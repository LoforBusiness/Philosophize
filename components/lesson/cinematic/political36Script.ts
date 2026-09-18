import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic political-political-36, "Who Is Watching"
// Theme: A STREET OF LIT WINDOWS, AND HOW MANY STAY LIT.
//
// The chilling effect is a shrinkage, so the picture is a shrinkage. Twenty-four
// windows stand for the ordinary things people do; as the watching rises they go
// dark one by one. Nobody is arrested, nothing is banned, and the street is
// visibly emptier.
//
// Bentham's lamp is the second half. It swings whether or not anyone is behind
// it, and on the beat that says so it keeps swinging with the guard box drawn
// EMPTY — because the design's whole claim is that the guard need not be there.
//
// GAMIFIED SHAPE:
//   · beat 2  a DRAG — turn the watching up. Windows go dark under the thumb and
//     the readout counts what is left, so "chilling effect" stops being a phrase.
//   · beat 6  a SCENE TARGET — tap what actually did the shrinking. Three
//     candidates, and the right one is the least dramatic, which is the point.
// ─────────────────────────────────────────────────────────────────────────────

export interface Political36Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** 1 = the street of windows is drawn. */ street?: number;
  /** How much watching there is, 0…1 — how many windows have gone dark. */ watch?: number;
  /** 1 = the reader's thumb drives the watching. */ live_d?: number;
  /** 1 = the lamp is drawn above, sweeping. */ lamp?: number;
  /** 1 = the guard box is shown EMPTY behind the lamp. */ empty?: number;
  /** 1 = the three candidate causes stand below. */ picks?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
  /** 1 = a dashed line drops from the empty guard box down to the street — the belief doing the work with nobody behind it. */ link?: number;
  /** 1 = a dashed boundary appears inside the block of windows, drawn smaller than the block itself. */ shrink?: number;
}

export const BEATS: Political36Beat[] = [
  {
    p: 462, x: 52, street: 1,
    text: 'Consider a street at night. Behind each lit window, someone is doing something ordinary and lawful.',
    dur: 3.6,
  },
  {
    p: 461, x: 52, street: 1, lamp: 1, live_d: 1, live: 1,
    interact: {
      prompt: 'How much surveillance does it take to make law-abiding people more cautious?',
      drag: {
        lo: 'NOBODY WATCHING',
        hi: 'ALWAYS WATCHED',
        start: 0,
        zones: [
          { id: 'off', upto: 0.24, reads: 'too little to change behaviour' },
          { id: 'some', upto: 0.62, reads: 'enough to make people more careful', correct: true },
          { id: 'all', upto: 1, reads: 'only constant watching changes behaviour' },
        ],
      },
      explain: 'Enough to make people more careful. Nothing is banned and nobody is charged. Yet people drop lawful acts that would be awkward to explain.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 383, x: 52, street: 1, watch: 0.6, lamp: 1,
    text: 'The slogan “nothing to hide, nothing to fear” misses this cost. It falls on people who do nothing wrong.',
    dur: 4.6,
  },
  {
    p: 467, x: 52, street: 1, watch: 0.6, lamp: 1, empty: 1,
    text: 'Jeremy Bentham designed the panopticon, a prison in which prisoners can never tell whether the guard is watching.',
    dur: 4.1,
  },
  {
    p: 467, x: 52, street: 1, watch: 0.6, lamp: 1, empty: 1, link: 1,
    text: 'The watchtower may therefore stand empty. The belief that someone might be watching does the work.',
    dur: 1.8,
  },
  {
    p: 385, x: 52, street: 1, watch: 0.6, lamp: 1, empty: 1,
    quote: {
      id: 'lq-political-political-36-1',
      text: 'Visibility is a trap.',
      author: 'Michel Foucault',
      philosopherId: 'michel-foucault',
      work: 'Discipline and Punish',
      era: '1975',
      branchSlugs: ['political-philosophy'],
    },
    dur: 3.4,
  },
  {
    p: 160, x: 52, street: 1, watch: 0.6, lamp: 1, empty: 1, picks: 1, live: 1,
    interact: {
      prompt: 'What narrowed the range of lawful things people were willing to do?',
      explain: 'Not knowing. A new law can be debated and an arrest is public, but uncertainty needs neither. If people can’t tell whether anyone is watching, they assume someone is. That assumption costs the watcher nothing.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 459, x: 84, street: 1, watch: 0.6, lamp: 1, picks: 1,
    text: 'Nothing here shows up in a statistic. No law is broken and no case is brought.',
    dur: 2.2,
  },
  {
    p: 459, x: 84, street: 1, watch: 0.6, lamp: 1, picks: 1, shrink: 1,
    text: 'This is called a chilling effect: the range of lawful things people are willing to do shrinks.',
    dur: 2.4,
  },
  {
    p: 379, x: 84, street: 1, watch: 0.6, lamp: 1,
    text: 'On this view, privacy isn’t mainly about hiding secrets. It protects the freedom to act without being judged.',
    dur: 4.8,
  },
  {
    summary: {
      title: 'Surveillance and the Chilling Effect',
      points: [
        'The harm falls on lawful, innocent behaviour',
        'Uncertainty about being watched is enough',
        'The panopticon works even with no guard present',
        'What shrinks is what people are willing to try',
      ],
      closing: 'A society can be free in law and narrower in practice. Official statistics won’t record the loss.',
    },
    dur: 3.2,
  },
];

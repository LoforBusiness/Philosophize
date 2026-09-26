import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic aesthetics-aesthetics-2, "How Art Passes On a Feeling".
// Theme: A CAMPFIRE STORY, AN OUTDOOR SCREEN, AND A FEELING CAUGHT LIKE A COLD.
//
// A campsite at night. On the outdoor screen an old portrait moves a listener; a
// glowing spark of feeling passes from one camper to the next — Tolstoy's infection.
// At the fire a boy tells of meeting a wolf; the wolf rises in shadow on the tent,
// the listeners shiver, and so does he. Then he crawls into the tent, and the story
// goes on without him, in other languages and other centuries.
//
// Redrawn 2026-09-26, one of six second lessons redesigned after the first-lesson
// sets; the owner asked for the stage to keep acting for the whole of every voiced
// line (see pace.ts). The narration is unchanged, word for word and beat for beat.
// The first question is new and asked on the stage; the poll stays, set in front
// of a film the campers are crying at.
// ─────────────────────────────────────────────────────────────────────────────

export interface Aes2Beat extends BaseBeat {
  /** The boy's pose under his act. Bands per N2: <100 rig, 100+ held, 300+ played. */ a?: number;
  /** Where the boy stands: 166 by the fire · 76 at the tent's door. */ x?: number;
  /** The act across this beat's line (the scene choreographs it). */
  act?: 'moved' | 'spread' | 'chain' | 'wolf' | 'forms' | 'leave';
  /** What the screen shows: the old portrait, the three forms, the subtitles, a film. */
  screen?: 'portrait' | 'forms' | 'subtitles' | 'film';
  /** The chain is labelled: ARTIST · WORK · AUDIENCE. */ chain?: boolean;
  /** The shadow wolf is up on the tent wall. */ wolf?: boolean;
  /** The boy is inside the tent, its flap closed. */ inTent?: boolean;
  /** Q1 on the stage: three thoughts over the fire. */ thoughts?: boolean;
  /** The campers are crying at the film (Q2). */ crying?: boolean;
}

export const BEATS: Aes2Beat[] = [
  {
    a: 459, x: 166, act: 'moved', screen: 'portrait',
    text: 'A painting can move you centuries after its painter has died. How can one person’s feeling reach another through paint?',
    dur: 3.6,
  },
  {
    a: 167, x: 166, act: 'spread', screen: 'portrait',
    text: 'The expression theory defines art by feeling, not by beauty or skill. Leo Tolstoy compared art to an infection that spreads a feeling to others.',
    cite: 'Expression theory',
    dur: 1.8,
  },
  {
    a: 260, x: 166, act: 'chain', screen: 'portrait', chain: true,
    text: 'The artist feels an emotion, the work carries the emotion, and the audience feels it too. For Collingwood, artists discover their feelings only by expressing them.',
    dur: 3.8,
  },
  {
    a: 387, x: 166, act: 'wolf', screen: 'portrait', chain: true, wolf: true,
    text: 'Tolstoy’s example is a boy who describes meeting a wolf and frightens his listeners. It’s art, provided the boy feels that fear again as he speaks.',
    cite: 'Tolstoy, What Is Art?, 1897',
    dur: 4.8,
  },
  {
    a: 263, x: 166, screen: 'portrait', chain: true, wolf: true,
    quote: {
      id: 'lq-aesthetics-aesthetics-2-1',
      text: 'Art is a human activity consisting in this, that one man hands on to others feelings he has lived through.',
      author: 'Leo Tolstoy',
      work: 'What Is Art?',
      era: '1897',
      branchSlugs: ['aesthetics'],
    },
    dur: 3.2,
  },
  {
    a: 260, x: 166, screen: 'portrait', chain: true, wolf: true, thoughts: true,
    interact: {
      prompt: 'If Tolstoy is right, what must the boy’s story do to count as art?',
      explain: 'Pass on his fear. Tolstoy called this infection: the artist brings back a feeling he has lived through, and the audience comes to share it. Beauty isn’t the test, and neither is truth; a lovely story that passes on nothing doesn’t count.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    a: 278, x: 166, act: 'forms', screen: 'forms', chain: true, wolf: true,
    text: 'If the expression theory is right, a work of art embodies a feeling in lines, sounds or words.',
    cite: 'Feeling made portable',
    dur: 3.4,
  },
  {
    a: 278, x: 76, act: 'leave', screen: 'subtitles', chain: true, wolf: true, inTent: true,
    text: 'The feeling can then outlive its maker, and reach audiences in other languages and centuries.',
    dur: 1.8,
  },
  {
    a: 0, x: 76, screen: 'film', chain: true, inTent: true, crying: true,
    interact: {
      prompt: 'You cry at a film you know is invented. What is the feeling behind your tears?',
      poll: {
        options: [
          { id: 'puzzle', reads: 'real pity for people you know don’t exist', holders: ['Colin Radford', 'Noël Carroll'], correct: true },
          { id: 'tidy', reads: 'make-believe pity, not the real thing', holders: ['Kendall Walton'] },
          { id: 'plain', reads: 'real sorrow that such evils could befall you', holders: ['Samuel Johnson'] },
          { id: 'odd', reads: 'an involuntary stirring, not a true emotion', holders: ['Seneca'] },
        ],
      },
      explain: 'Real pity for people you know don’t exist. The tears and the pity are genuine, which is the puzzle Colin Radford posed in 1975, the paradox of fiction.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    x: 76, screen: 'film', chain: true, inTent: true,
    summary: {
      title: 'Expression and the Paradox of Fiction',
      points: [
        'Tolstoy: art infects an audience with the artist’s feeling',
        'Collingwood: art clarifies a feeling',
        'Paradox of fiction: real emotion for fictional people',
      ],
      closing: 'The expression theory places feeling at the centre of art, whether transmitted or clarified.',
    },
    dur: 2.8,
  },
];

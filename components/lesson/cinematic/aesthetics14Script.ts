import type { BaseBeat } from './cinematicKit';

// Cinematic aesthetics-aesthetics-14, "Is Anyone's Taste Actually Better?"
//
// THE PICTURE: one cask with three verdicts pinned beside it. Over the lesson the
// cask is DRAINED, and what is lying at the bottom decides which of the three
// verdicts was worth more than the others (H64). Nothing about the picture claims
// the two dissenters are right — it simply empties, and then you can see.
//
// That is the argument staged rather than asserted. Hume's whole move is that
// "tastes differ" and "all tastes are equal" are two different sentences, and the
// cask is what stands between them: until it is empty, the room outnumbers the
// palate; once it is empty, the count was never the point.
//
// STAGING: the three verdict cards are the Q1 targets, and one of them is a
// PREFERENCE rather than a detection — the decoy is a real position (H66), and the
// reason it can never be settled is the reason Hume does not count it.

export interface Aes14Beat extends BaseBeat {
  /** Figure gesture (emote code). */ g?: number;
  /** How many verdict cards are pinned up, 0…3. */ board?: number;
  /** How full the cask is, 1 = to the brim · 0 = drained. */ level?: number;
  /** The key on its leather thong at the bottom, 0…1. */ key?: number;
  /** 1 = the three verdicts are live targets (Q1). */ pick?: number;
}

export const BEATS: Aes14Beat[] = [
  {
    g: 25, board: 1, level: 1,
    dur: 2.7,
    text: 'One cask, tasted by a whole room. The verdict comes back unanimous.',
  },
  {
    g: 25, board: 1, level: 1,
    dur: 1.8,
    text: 'There is nothing wrong with this wine.',
  },
  {
    g: 45, board: 3, level: 1,
    dur: 1.8,
    text: 'Then two people disagree. One of them tastes iron.',
    cite: 'Two hold out',
  },
  {
    g: 45, board: 3, level: 1,
    dur: 3,
    text: 'The other just finds it too sweet, which is not the same kind of complaint at all.',
  },
  {
    g: 13, board: 3, level: 1,
    dur: 1.9,
    text: 'Hume begins where most people stop. Taste really does differ, he agrees.',
    cite: 'Hume grants the variety',
  },
  {
    g: 13, board: 3, level: 1,
    dur: 2.9,
    text: 'Hume simply will not go on to say that every verdict is therefore as good as the next.',
  },
  {
    g: 137, board: 3, level: 1,
    dur: 3.8,
    quote: {
      id: 'lq-aesthetics-aesthetics-14-1',
      text: 'Strong sense, united to delicate sentiment, improved by practice, perfected by comparison, and cleared of all prejudice, can alone entitle critics to this valuable character.',
      author: 'David Hume',
      work: 'Of the Standard of Taste',
      era: '1757',
      philosopherId: 'david-hume',
      branchSlugs: ['aesthetics'],
    },
  },
  {
    g: 21, board: 3, level: 0, key: 1,
    dur: 4.8,
    text: 'Cervantes got there first. They drained the cask, and a key was lying at the bottom on a leather thong.',
    cite: 'The bottom of the cask',
  },
  {
    g: 4, board: 3, level: 0, key: 1, pick: 1,
    dur: 1.0,
    interact: {
      prompt: 'Tap the verdict the key settles.',
      explain: 'The iron. One palate found metal that a whole room missed, and the thong is where the leather came from. The sweetness card cannot be settled by anything at the bottom: it reports the taster, not the cask. That is why Hume does not count it.',
      xp: 5,
    },
  },
  {
    g: 41, board: 3, level: 0, key: 1,
    dur: 1.0,
    interact: {
      prompt: 'Tastes differ. Does that make every verdict as good as the next?',
      drag: {
        lo: 'EVERY VERDICT EQUAL',
        hi: 'ONE RIGHT ANSWER',
        start: 0,
        zones: [
          { id: 'flat', upto: 0.3, reads: 'every verdict is worth the same' },
          { id: 'placed', upto: 0.7, reads: 'some judges are better placed than others', correct: true },
          { id: 'fixed', upto: 1, reads: 'one verdict is simply correct' },
        ],
      },
      explain: 'The other card slides from "tastes differ" to "so all tastes are equal", and that one step is doing all the work. Hume grants the first sentence and denies the second. A whole room found nothing in that cask.',
      xp: 5,
    },
  },
  {
    summary: {
      title: 'The Standard of Taste',
      points: [
        'That tastes vary does not make every verdict equal',
        'Hume\'s standard is the agreed verdict of practised judges',
        'Delicacy, practice, comparison, no prejudice, good sense',
        'A preference reports you; a detection reports the thing',
      ],
      closing: 'Nobody had to outvote the room. They just had to be right about the cask.',
    },
    dur: 3.0,
  },
];

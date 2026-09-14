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
    g: 462, board: 1, level: 1,
    dur: 2.7,
    text: 'Suppose everyone in a room tastes the wine from one cask. Their verdict is unanimous.',
  },
  {
    g: 462, board: 1, level: 1,
    dur: 1.8,
    text: 'Every taster reports that there’s nothing wrong with the wine.',
  },
  {
    g: 465, board: 3, level: 1,
    dur: 1.8,
    text: 'Then two tasters dissent. One detects a faint taste of iron.',
    cite: 'Two dissenters',
  },
  {
    g: 465, board: 3, level: 1,
    dur: 3,
    text: 'The other finds the wine too sweet for their liking, a complaint of a different type.',
  },
  {
    g: 13, board: 3, level: 1,
    dur: 1.9,
    text: 'In 1757, David Hume published an essay on the standard of taste. It begins by granting that tastes vary widely.',
    cite: 'The variety of taste',
  },
  {
    g: 13, board: 3, level: 1,
    dur: 2.9,
    text: 'Yet Hume denies that every verdict is equally good. The joint verdict of true judges, he argues, is the standard of taste.',
  },
  {
    g: 139, board: 3, level: 1,
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
    g: 380, board: 3, level: 0, key: 1,
    dur: 4.8,
    text: 'Hume illustrates the point with a story from Cervantes’s Don Quixote. When the cask was emptied, a key on a leather thong lay at the bottom.',
    cite: 'The key in the cask',
  },
  {
    g: 4, board: 3, level: 0, key: 1, pick: 1,
    dur: 1.0,
    interact: {
      prompt: 'Which verdict does the key at the bottom of the cask prove correct?',
      explain: 'A faint taste of iron. One taster detected the metal that the rest of the room missed. “Too sweet for me” can’t be confirmed by anything in the cask. It reports a preference, not a quality of the wine.',
      xp: 5,
    },
  },
  {
    g: 383, board: 3, level: 0, key: 1,
    dur: 1.0,
    interact: {
      prompt: 'If tastes differ, does it follow that every verdict is equally good?',
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
      explain: 'Some judges are better placed than others. Hume grants that tastes differ but denies that all are equal. Practised, delicate judges detect what others miss. Yet he allows blameless differences of preference, which no standard settles.',
      xp: 5,
    },
  },
  {
    summary: {
      title: 'The Standard of Taste',
      points: [
        'That tastes vary does not make every verdict equal',
        'Hume’s standard is the joint verdict of true judges',
        'True judges need delicacy, practice, comparison, sense and no prejudice',
        'A preference describes the taster, a detection the wine',
      ],
      closing: 'On Hume’s view, a lone verdict can be right when it detects a quality the wine has.',
    },
    dur: 3.0,
  },
];

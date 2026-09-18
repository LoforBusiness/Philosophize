import type { BaseBeat } from './cinematicKit';

// Cinematic aesthetics-aesthetics-15, "Kant's Strange Idea Of Beauty"
//
// THE PICTURE: a rose with five things tied to it that a person might say standing
// in front of it. Over the lesson four of them are cut away — every one that wanted
// something FROM the rose — and the rose is still there, and the one remark left
// still says look at this (H64).
//
// That is Kant's test staged rather than asserted. "Disinterested" is a word almost
// everybody hears as "unmoved", and no amount of narration fixes that; watching the
// stakes come off while the delight stays does.
//
// STAGING: the five tags are the Q1 targets. The four decoys are the ordinary
// reasons a person actually likes a rose — wanting it, selling it, furnishing with
// it, being seen with it — so the question is a real sorting rather than a trick
// (H66), and the survivor is the one that addresses somebody else.

export interface Aes15Beat extends BaseBeat {
  /** Figure gesture (emote code). */ g?: number;
  /** The rose on its plinth, 0…1. */ rose?: number;
  /** How many tags are tied on, 0…5. */ tags?: number;
  /** 1 = the four interested tags have been cut away. */ cut?: number;
  /** 1 = the five tags are live targets (Q1). */ pick?: number;
  /** 1 = a dashed boundary is drawn round all five tags — "the five" under test. */ zoneTags?: number;
  /** 1 = an INTEREST plate appears between the rose and the tags, naming the term. */ term?: number;
  /** 1 = a dashed boundary is drawn round the rose alone — what the test leaves. */ zoneRose?: number;
  /** How many of the four "interested" tags carry a small flag, in the order named: pick, sell, room, seen. 0…4. */ flag?: number;
  /** 1 = a dashed line joins the surviving tag to the rose — the remark now read as being about it. */ connect?: number;
}

export const BEATS: Aes15Beat[] = [
  {
    g: 379, rose: 1, tags: 5,
    dur: 4.4,
    text: 'Consider a rose and five sincere remarks a person might make about it. Each expresses a real attitude towards the flower.',
  },
  {
    g: 413, rose: 1, tags: 5, zoneTags: 1,
    dur: 4.8,
    text: 'Immanuel Kant asks which one of the five is a judgement of beauty at all. The question isn’t which remark is true.',
    cite: 'The judgement of taste',
  },
  {
    g: 159, rose: 1, tags: 5, term: 1,
    dur: 2.9,
    text: 'Kant’s test is to set aside every personal stake in the rose. Kant calls such a stake an interest.',
    cite: 'The test of disinterest',
  },
  {
    g: 159, rose: 1, tags: 5, zoneRose: 1,
    dur: 1.8,
    text: 'A judgement of beauty is one whose delight survives when every interest is set aside.',
  },
  {
    g: 456, rose: 1, tags: 5, flag: 1,
    dur: 2.3,
    text: 'An interest is anything you want from the rose, such as owning it.',
  },
  {
    g: 456, rose: 1, tags: 5, flag: 3,
    dur: 1.8,
    text: 'Selling the rose and decorating a room with it are interests too.',
  },
  {
    g: 456, rose: 1, tags: 5, flag: 4,
    dur: 1.8,
    text: 'So is the wish to impress someone by being seen with it.',
  },
  {
    g: 465, rose: 1, tags: 5,
    dur: 3.8,
    quote: {
      id: 'lq-aesthetics-aesthetics-15-1',
      text: 'Taste is the faculty of judging an object by means of a delight apart from any interest. The object of such a delight is called beautiful.',
      author: 'Immanuel Kant',
      work: 'Critique of the Power of Judgment',
      era: '1790',
      philosopherId: 'immanuel-kant',
      branchSlugs: ['aesthetics'],
    },
  },
  {
    g: 165, rose: 1, tags: 5, pick: 1,
    dur: 1.0,
    interact: {
      prompt: 'Which of these remarks expresses no interest in the rose?',
      explain: '“You should see this.” The other four each express a desire: to own, sell, decorate or be admired. This remark asks only that another person share the delight.',
      xp: 5,
    },
  },
  {
    g: 467, rose: 1, tags: 5, cut: 1,
    dur: 3.8,
    text: 'Remove the four remarks with an interest, and the rose is unchanged. The remark left says more than that you like the rose.',
    cite: 'What remains',
  },
  {
    g: 467, rose: 1, tags: 5, cut: 1, connect: 1,
    dur: 1.8,
    text: 'That remark addresses someone else. Kant holds that a judgement of beauty claims everyone’s agreement, as if beauty were in the rose.',
  },
  {
    g: 442, rose: 1, tags: 5, cut: 1,
    dur: 1.0,
    interact: {
      prompt: 'When a judgement is disinterested, what happens to the delight and to your stake?',
      split: {
        left: 'THE DELIGHT', right: 'YOUR STAKE IN IT',
        start: 0.04,
        zones: [
          { id: 'none', upto: 0.3, reads: 'both go, and beauty gives no pleasure' },
          { id: 'half', upto: 0.66, reads: 'part of the pleasure survives' },
          { id: 'keep', upto: 1, reads: 'the delight stays, your stake goes', correct: true },
        ],
      },
      explain: 'The delight stays, your stake goes. “Disinterested” doesn’t mean “uninterested”, and confusing the two makes Kant sound cold. He removes your stake and keeps the pleasure, which is no longer about you.',
      xp: 5,
    },
  },
  {
    summary: {
      title: 'Kant on Disinterested Delight',
      points: [
        'Disinterested means free of stake, not free of pleasure',
        'With every interest set aside, delight in beauty remains',
        'A judgement of taste claims everyone’s agreement, without a rule',
        'Free beauty presupposes no purpose, dependent beauty does',
      ],
      closing: 'Hume grounds the standard of taste in trained critics. Kant grounds beauty in a delight free of interest.',
    },
    dur: 3.0,
  },
];

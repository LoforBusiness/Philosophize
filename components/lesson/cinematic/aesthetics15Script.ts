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
}

export const BEATS: Aes15Beat[] = [
  {
    g: 25, rose: 1, tags: 5,
    dur: 4.4,
    text: 'A rose, and five things a person might say standing in front of it. Every one of them is honest.',
  },
  {
    g: 413, rose: 1, tags: 5,
    dur: 4.8,
    text: 'Kant is not asking which of the five claims is true. He wants to know which one is a judgement of beauty at all.',
    cite: 'Not whether you like it',
  },
  {
    g: 159, rose: 1, tags: 5,
    dur: 2.9,
    text: 'Kant\'s test is odd and very simple. Strip away every stake you have in the rose.',
    cite: 'The test',
  },
  {
    g: 159, rose: 1, tags: 5,
    dur: 1.8,
    text: 'If the delight is still there, that was beauty.',
  },
  {
    g: 168, rose: 1, tags: 5,
    dur: 2.3,
    text: 'A stake is anything you want from the painting. To own the painting.',
  },
  {
    g: 168, rose: 1, tags: 5,
    dur: 1.8,
    text: 'To sell it. To furnish a room.',
  },
  {
    g: 168, rose: 1, tags: 5,
    dur: 1.8,
    text: 'To be seen standing beside it.',
  },
  {
    g: 137, rose: 1, tags: 5,
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
    g: 4, rose: 1, tags: 5, pick: 1,
    dur: 1.0,
    interact: {
      prompt: 'Four of these want something from the rose. Tap the one that does not.',
      explain: 'Telling someone else to look. The other four are appetites wearing different clothes: owning, selling, decorating, being admired. Take the appetite away and the wanting goes too. Take the looking away and nothing is left to take.',
      xp: 5,
    },
  },
  {
    g: 176, rose: 1, tags: 5, cut: 1,
    dur: 3.8,
    text: 'Cut the other four and the rose does not change. Notice what survived is not even "I like it".',
    cite: 'What is left',
  },
  {
    g: 176, rose: 1, tags: 5, cut: 1,
    dur: 1.8,
    text: 'It is aimed at you.',
  },
  {
    g: 41, rose: 1, tags: 5, cut: 1,
    dur: 1.0,
    interact: {
      prompt: 'Slide the seam to what survives being disinterested.',
      split: {
        left: 'THE DELIGHT', right: 'YOUR STAKE IN IT',
        start: 0.04,
        zones: [
          { id: 'none', upto: 0.3, reads: 'both go, and beauty leaves you cold' },
          { id: 'half', upto: 0.66, reads: 'some of the pleasure survives, thinned out' },
          { id: 'keep', upto: 1, reads: 'the delight stays, your stake goes', correct: true },
        ],
      },
      explain: 'All the delight stays. Disinterested and uninterested are two different words, and hearing the first as the second is what makes Kant sound cold. He removes your stake and keeps the pleasure. The pleasure is the whole point; it simply is not about you.',
      xp: 5,
    },
  },
  {
    summary: {
      title: 'Delight That Wants Nothing',
      points: [
        'Disinterested means free of stake, not free of pleasure',
        'Strip away wanting and real beauty is still there',
        'Taste speaks as if you should agree, without a rule',
        'Free beauty needs no purpose; dependent beauty has one',
      ],
      closing: 'Hume put beauty in the trained critic. Kant put it in a delight that wants nothing back.',
    },
    dur: 3.0,
  },
];

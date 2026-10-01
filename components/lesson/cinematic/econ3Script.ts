import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic economics-foundations-3, "What Does It Really Cost?" — the third lesson on
// the Economics road, and a DIALOGUE lesson (LESSON_RULES group AP).
// Theme: A TICKET KIOSK, TWO POSTERS, AND ONE FREE SATURDAY AFTERNOON.
//
// Three people talk, and nobody narrates. A music lover (the plain mascot) can go to a
// concert or a free football match on Saturday, not both; the kiosk seller (the
// newsboy cap) is kind and sure that free is always best; the economist (the top hat)
// shows what a choice really costs.
//
// A FOUNDATION LESSON (AP3), three ideas and no more: choosing one thing means giving up
// the next best · that is the opportunity cost · even something free costs the time you
// could have spent on something else.
//
// Every line is written for the ear (groups AC/AD), from its speaker’s character
// (cast.ts, AP14), and read at the pace its words ask for (AP17).
// ─────────────────────────────────────────────────────────────────────────────

export interface Econ3Beat extends BaseBeat {
  /**
   * What happens across this beat’s line (the scene choreographs it):
   * torn — the music lover points from the concert poster to the football poster and back, then turns to the kiosk ·
   * free — the seller tears a green football ticket off its roll, leans out of the kiosk window, waves it, and lays it on the shelf ·
   * arrive — the economist walks in, stands between the two posters, tips his hat ·
   * giveup — he puts one hand on each poster, then lifts the one on the football poster away ·
   * cost — the music lover folds his arms and looks at the concert poster ·
   * time — the economist points at the kiosk clock while its minute hand runs on to a quarter past ·
   * twenty — the seller tears a pink concert ticket off its roll and holds it up with a twenty-pound note from his cash tin ·
   * weigh — the economist holds his hands out like a pair of scales, tips them each way and levels them ·
   * buy — the music lover walks to the window, pays a twenty and takes the concert ticket ·
   * rest — everyone at ease under the quotation.
   */
  act?: 'torn' | 'free' | 'arrive' | 'giveup' | 'cost' | 'time' | 'twenty' | 'weigh' | 'buy' | 'rest';
  /** The economist is on the stage. He walks in on `arrive`. */
  th?: boolean;
  /** The ticket the music lover holds: 0 none · 1 the concert ticket. */
  ticket?: number;
  /** The kiosk clock’s hands: 0 noon · 1 a quarter past (the afternoon passing, run on as the economist points at it on `time`). */
  clock?: number;
  /** First question on the stage: the concert poster, the football poster and the kiosk clock are the things to tap. */
  lose?: boolean;
  /** Second question on the stage: the concert poster, the football poster and the seller’s cash tin are the things to tap. */
  better?: boolean;
}

export const BEATS: Econ3Beat[] = [
  {
    act: 'torn', ticket: 0, clock: 0,
    speaker: 'plain',
    text: 'The concert or the football. Both on Saturday afternoon, naturally.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'free', ticket: 0, clock: 0,
    speaker: 'cap',
    text: 'The football’s free this week, mate. You can’t beat free!',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'arrive', th: true, ticket: 0, clock: 0,
    speaker: 'tophat',
    text: 'Free costs no money, but it still costs something. Whichever one you choose, you give up the other.',
    pace: 'even',
    dur: 2.1,
  },
  {
    act: 'giveup', th: true, ticket: 0, clock: 0,
    speaker: 'tophat',
    text: 'Economists call what you give up the opportunity cost. It’s the next best thing you could have done instead.',
    pace: 'even',
    dur: 2.1,
  },
  {
    th: true, ticket: 0, clock: 0, lose: true,
    interact: {
      prompt: 'If he picks the free football, what is his opportunity cost?',
      explain: 'The concert. It’s the next best choice, and picking the football means missing it. The match is what he gets, and the clock only shows the time.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    act: 'cost', th: true, ticket: 0, clock: 0,
    speaker: 'plain',
    text: 'So the free match would cost me a concert. How generous of it.',
    pace: 'even',
    dur: 1.8,
  },
  {
    act: 'time', th: true, ticket: 0, clock: 1,
    speaker: 'tophat',
    text: 'Yes. Your time is scarce too, so even a free afternoon has a price: everything else you could do with it.',
    pace: 'even',
    dur: 2.1,
  },
  {
    act: 'twenty', th: true, ticket: 0, clock: 1,
    speaker: 'cap',
    text: 'The concert tickets are twenty pounds, if that helps at all.',
    pace: 'even',
    dur: 1.8,
  },
  {
    act: 'weigh', th: true, ticket: 0, clock: 1,
    speaker: 'tophat',
    text: 'Then weigh each choice against what it makes you give up. Pick the one that’s worth more to you than its cost.',
    pace: 'even',
    dur: 2.1,
  },
  {
    th: true, ticket: 0, clock: 1, better: true,
    interact: {
      prompt: 'He loves music and never watches football. Which choice gives up less?',
      explain: 'The concert. Missing a match he doesn’t care about costs him very little, so twenty pounds and a football game is a small price. Picking the match would cost him the concert he loves.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    act: 'buy', th: true, ticket: 1, clock: 1,
    speaker: 'plain',
    text: 'One concert ticket, please. I’ll try not to enjoy it too much.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'rest', th: true, ticket: 1, clock: 1,
    quote: {
      id: 'lq-economics-foundations-3-1',
      text: 'There’s no such thing as a free lunch.',
      author: 'Milton Friedman',
      work: 'There’s No Such Thing as a Free Lunch',
      era: '1975',
      branchSlugs: ['economics'],
    },
    dur: 3.0,
  },
  {
    th: true, ticket: 1, clock: 1,
    summary: {
      title: 'What Does It Really Cost?',
      points: [
        'Choosing one thing means giving up another',
        'What you give up is the opportunity cost',
        'Even something free costs your time',
      ],
      closing: 'Next time something is free, ask what you’d be giving up to have it.',
    },
    dur: 2.8,
  },
];

import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic logic-arguments-35, "The Third Thing Doing the Work"
// Theme: TWO BARS THAT RISE TOGETHER, AND THE HAND UNDER BOTH OF THEM.
//
// Two columns climb in step while the reader watches, and an arrow is drawn
// between them — the wrong arrow, the one everybody draws. Then the third box
// rises underneath and the arrow between the columns is cut and re-drawn as two
// arrows coming up from below. The correction is a MOVE on the stage, not a
// sentence about a move.
//
// GAMIFIED SHAPE, and no two asks alike:
//   · beat 3  a SCENE TARGET — three candidate boxes; tap the one feeding both.
//     This is a real hunt: two of the three are plausible and wrong for different
//     reasons, which is what makes it worth a tap rather than a read.
//   · beat 6  an UNGRADED tap — cut the false arrow yourself. Nothing scored;
//     it exists so the reader performs the correction instead of watching it.
//   · beat 7  two CARDS — why randomising beats measuring.
// ─────────────────────────────────────────────────────────────────────────────

export interface Logic35Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** How high the two columns stand, 0…1. */ rise?: number;
  /** 1 = the straight arrow between the columns is drawn. */ arrow?: number;
  /** 1 = the three candidate boxes are on stage. */ picks?: number;
  /** 1 = the third cause sits under both, with its two arrows up. */ under?: number;
  /** 1 = the false arrow is shown cut. */ cut?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
  /** 1 = a dashed line levels the tops of the two columns — they move in lockstep. */ level?: number;
  /** 1 = a second, dashed arrow appears alongside the first — the same data fits more than one causal story. */ alt?: number;
  /** 1 = a mark stands where the causal arrow used to be — the link that never existed. */ gone?: number;
  /** 1 = a second pair of names echoes under the third box — the same shape, elsewhere. */ again?: number;
}

export const BEATS: Logic35Beat[] = [
  {
    p: 172, x: 62, rise: 0,
    text: 'Consider two quantities, each recorded every week over one summer.',
    dur: 2.8,
  },
  {
    p: 2, x: 62, rise: 1,
    text: 'Ice cream sales rise, and drownings rise with them, week by week. The two quantities are correlated.',
    dur: 2.2,
  },
  {
    p: 266, x: 62, rise: 1, level: 1,
    text: 'The correlation is real, and it holds too consistently to be a coincidence.',
    dur: 2,
  },
  {
    p: 13, x: 62, rise: 1, arrow: 1,
    text: 'The arrow reads the correlation as causation. It claims that ice cream sales cause drownings.',
    dur: 2.1,
  },
  {
    p: 266, x: 62, rise: 1, arrow: 1, alt: 1,
    text: 'No one believes this causal claim, but the correlation alone can’t refute it. The same data fit more than one causal explanation.',
    dur: 2.5,
  },
  {
    p: 461, x: 62, rise: 1, arrow: 1, picks: 1, live: 1,
    interact: {
      prompt: 'Which factor could cause both the ice cream sales and the drownings?',
      explain: 'Summer heat. Hot weather raises ice cream sales, and it also sends more people into the water, where some drown. Swimming lessons affect drownings, not sales. Holiday pay might raise sales, but it has no clear link to drownings.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 467, x: 62, rise: 1, picks: 1, under: 1,
    text: 'A common cause of two correlated quantities is called a confounder. Once summer heat is held fixed, the link between ice cream and drowning disappears.',
    dur: 3.8,
  },
  {
    p: 467, x: 62, rise: 1, picks: 1, under: 1, gone: 1,
    text: 'The correlation was real, but a causal link between the two never existed.',
    dur: 1.8,
  },
  {
    p: 386, x: 62, rise: 1, under: 1,
    quote: {
      id: 'lq-logic-arguments-35-1',
      text: 'Correlation is not causation, but it sure is a hint.',
      author: 'Edward Tufte',
      work: 'The Cognitive Style of PowerPoint',
      era: '2006',
      branchSlugs: ['logic'],
    },
    dur: 3.4,
  },
  {
    p: 167, x: 130, rise: 1, under: 1, cut: 1,
    text: 'Confounders are rarely this obvious. Children with bigger feet read better, but only because older children have both.',
    dur: 3.2,
  },
  {
    p: 167, x: 130, rise: 1, under: 1, cut: 1, again: 1,
    text: 'Coffee was long linked with a higher risk of death, because coffee drinkers were more likely to smoke.',
    dur: 1.8,
  },
  {
    p: 447, x: 130, rise: 1, under: 1, cut: 1,
    interact: {
      prompt: 'Which of these removes the hidden confounders?',
      odd: {
        axis: 'THREE LEAVE THEM IN',
        tiles: [
          { id: 'big', reads: 'A LARGER SAMPLE' },
          { id: 'known', reads: 'ADJUST FOR KNOWN ONES' },
          { id: 'match', reads: 'MATCH THE GROUPS ON AGE' },
          { id: 'coin', reads: 'ASSIGN BY COIN', correct: true },
        ],
      },
      explain: 'Assigning by coin. The other three deal only with causes somebody has thought of. A bigger sample just measures the same bias more finely. A coin toss spreads every factor evenly, named or not.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Correlation, Causation and Confounders',
      points: [
        'Two correlated quantities may share a common cause',
        'A confounder causes both, without either causing the other',
        'Statistical adjustment handles only the confounders you measure',
        'Random assignment stops any confounder from deciding the groups',
      ],
      closing: 'When two quantities rise together, ask what third factor could be causing both.',
    },
    dur: 3.0,
  },
];

import type { BaseBeat } from './cinematicKit';

// Cinematic metaphysics-being-16, "Free Enough to Be Responsible?"
//
// THE PICTURE: two panels drawn identically — same craving, same act, same chemistry
// — with one arrow above each saying whether the man is behind his own wanting. In
// one panel that arrow points the same way as the craving. In the other it points
// straight back against it (H64).
//
// Frankfurt's move is the hardest in this branch to state without losing people,
// because "second-order desire" arrives as jargon. Drawn as an arrow ABOVE the
// arrow, it is not jargon at all: it is obviously a thing pointing at another thing,
// and obviously capable of pointing the other way.
//
// STAGING: the two panels are the Q1 targets, and everything inside them except
// that one arrow is identical — so the reader answers by finding the difference
// rather than by recalling a term.

export interface Met16Beat extends BaseBeat {
  /** Figure gesture (emote code). */ g?: number;
  /** How many panels are up, 0…2. */ panels?: number;
  /** The first-order craving arrows, 0…1. */ crave?: number;
  /** The second-order arrows above them, 0…1. */ second?: number;
  /** 1 = the two panels are live targets (Q1). */ pick?: number;
}

export const BEATS: Met16Beat[] = [
  {
    g: 25, panels: 2, crave: 1,
    dur: 4.6,
    text: 'Two addicts, and everything about them is the same. Same craving, same dose, same chemistry doing the same thing.',
  },
  {
    g: 159, panels: 2, crave: 1, second: 1,
    dur: 3,
    text: 'Now add what each of them thinks about his own wanting. One is behind it.',
    cite: 'The second arrow',
  },
  {
    g: 159, panels: 2, crave: 1, second: 1,
    dur: 2,
    text: 'The other is dragged along by a craving he hates.',
  },
  {
    g: 13, panels: 2, crave: 1, second: 1,
    dur: 3.3,
    text: 'Frankfurt calls that second arrow a desire about a desire. You do not only want things.',
    cite: 'Wanting to want',
  },
  {
    g: 13, panels: 2, crave: 1, second: 1,
    dur: 1.8,
    text: 'You have views about what you want.',
  },
  {
    g: 137, panels: 2, crave: 1, second: 1,
    dur: 3.8,
    quote: {
      id: 'lq-metaphysics-being-16-1',
      text: 'It is in securing the conformity of his will to his second-order volitions, then, that a person exercises freedom of the will.',
      author: 'Harry Frankfurt',
      work: 'Freedom of the Will and the Concept of a Person',
      era: '1971',
      philosopherId: 'harry-frankfurt',
      branchSlugs: ['metaphysics'],
    },
  },
  {
    g: 399, panels: 2, crave: 1, second: 1,
    dur: 4.8,
    text: 'So freedom is not about where the craving came from. It is about whether the man is standing behind it or being pulled by it.',
    cite: 'Where the freedom is',
  },
  {
    g: 4, panels: 2, crave: 1, second: 1, pick: 1,
    dur: 1.0,
    interact: {
      prompt: 'Tap the addict Frankfurt calls unfree.',
      explain: 'The one whose second arrow points back against his own craving. His body does exactly what the other one\'s body does, and the chemistry is identical, so nothing about the ACT can be what separates them. What he lacks is any endorsement of the will that is moving him.',
      xp: 5,
    },
  },
  {
    g: 41, panels: 2, crave: 1, second: 1,
    dur: 1.0,
    interact: {
      prompt: 'Set the lever to what Frankfurt adds to being free.',
      lever: {
        start: 0,
        stops: [
          { id: 'uncaused', reads: 'free means the choice had no cause at all' },
          { id: 'unforced', reads: 'free means nobody held a gun to your head' },
          { id: 'endorsed', reads: 'free means wanting your own desire', correct: true },
        ],
      },
      explain: 'The far setting. The first swaps Frankfurt for an easier opponent: he is a compatibilist, so every desire here can be fully caused and he does not mind. What he adds is a second question — not where a desire came from, but whether you stand behind it.',
      xp: 5,
    },
  },
  {
    summary: {
      title: 'Whose Will Is It?',
      points: [
        'First-order desires want things; second-order ones judge those wants',
        'You are free when your will matches what you reflectively want',
        'Both addicts are caused; only one is estranged from his craving',
        'Frankfurt keeps determinism and relocates the freedom',
      ],
      closing: 'The question stops being where the wanting came from, and becomes whether it is yours.',
    },
    dur: 3.0,
  },
];

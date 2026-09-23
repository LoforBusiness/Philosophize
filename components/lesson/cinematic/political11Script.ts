import type { BaseBeat } from './cinematicKit';

// Cinematic political-political-11, "Why Leave the State of Nature?" — Hobbes, Locke
// and Rousseau run the same experiment and build three different states.
//
// THE PICTURE: a three-notch DIAL reading FEARFUL · RATIONAL · INNOCENT, wired to
// three empty plots of ground. Whichever way the dial is set, that plot builds — a
// tall tower with everything pressed under it, a small house with the people standing
// outside it still holding their own, a ring with nobody above anybody. Nothing about
// the experiment changes between them. Only the reading of human nature does, and the
// state that follows is whatever that reading needs. That is the lesson's thesis drawn
// rather than asserted: the diagnosis sets the cure.
//
// The plots ACCUMULATE rather than replacing each other, so by the question all three
// stand side by side and the reader has to remember which diagnosis built which.
//
// Q1 is A/B/C/D in the deck — the cause-and-effect trap needs its options read (E34).
// Q2 is answered ON the stage: the dial goes back to FEARFUL, tap the state it demands.

export interface Political11Beat extends BaseBeat {
  /** Figure gesture (emote code). */ p?: number;
  /** Where the figure stands (stage x). 56 = downstage left, 120 = beside the plots. */ x?: number;
  /** 1 = the dial and its three empty plots are on stage. */ dial?: number;
  /** Where the dial points: 0 unset · 1 FEARFUL · 2 RATIONAL · 3 INNOCENT. */ set?: number;
  /** How many plots have been built: 0 none · 1 tower · 2 +house · 3 +ring. */ built?: number;
  /** 1 = the three plots are live answer targets (Q2). */ plates?: number;
  /** 1 = a question mark hangs where the dial will stand, holding the open question the reader has not yet answered. */ ask?: number;
  /** 1 = a bar of weight presses down from the tower's cap onto the crowd beneath it, showing the sovereign's power asserted as absolute. */ press?: number;
  /** 1 = a dashed boundary is drawn around Locke's house, marking the limit of the government's reach — the bystanders standing outside it keep the rights they held before it existed. */ bound?: number;
  /** 1 = three spokes join the ring's three people to a single point at its centre, showing everybody bound to the common good. */ bind?: number;
  /** 1 = a small open ring appears at that centre point — the point everyone answers to is themselves, and it stays open, not solid like Hobbes's tower, because they remain free. */ self?: number;
}

export const BEATS: Political11Beat[] = [
  {
    p: 462, x: 56,
    text: 'Suppose there were no government: no courts, no police and no one in charge. How would people behave?',
    dur: 2.5,
  },
  {
    p: 462, x: 56, ask: 1,
    text: 'Your answer largely determines which state you can justify.',
    dur: 1.8,
  },
  {
    p: 383, x: 56, dial: 1,
    text: 'Political philosophers call this condition the state of nature. Hobbes, Locke and Rousseau each assume a view of human nature and ask what state it requires.',
    cite: 'A thought experiment',
    dur: 4.2,
  },
  {
    p: 167, x: 120, dial: 1, set: 1, built: 1,
    text: 'Thomas Hobbes reads human nature as fearful. People are roughly equal in strength, so anyone can kill anyone, and each has reason to strike first.',
    cite: 'Hobbes’s state of war',
    dur: 2.4,
  },
  {
    p: 167, x: 120, dial: 1, set: 1, built: 1, press: 1,
    text: 'Only a sovereign above every subject can end this war. Hobbes holds that the sovereign’s power must be absolute.',
    dur: 2.6,
  },
  {
    p: 139, x: 120, dial: 1, set: 1, built: 1, press: 1,
    quote: {
      id: 'lq-political-political-11',
      text: 'During the time men live without a common power to keep them all in awe, they are in that condition which is called war.',
      author: 'Thomas Hobbes',
      work: 'Leviathan',
      era: '1651',
      philosopherId: 'thomas-hobbes',
      branchSlugs: ['political-philosophy'],
    },
    dur: 3.6,
  },
  {
    p: 467, x: 120, dial: 1, set: 2, built: 2, press: 1,
    text: 'John Locke reads human nature as rational. People already have duties under natural law, and what they lack is an impartial judge.',
    cite: 'Locke · a limited government',
    dur: 2.7,
  },
  {
    p: 467, x: 120, dial: 1, set: 2, built: 2, bound: 1, press: 1,
    text: 'So Locke’s government is limited, and the people keep the natural rights they held before it existed.',
    dur: 2.1,
  },
  {
    p: 33, x: 120, dial: 1, set: 3, built: 3, bound: 1, press: 1,
    text: 'Rousseau reads human nature as innocent. People lived at peace until property and rank made them compare themselves.',
    cite: 'Rousseau · the general will',
    dur: 2,
  },
  {
    p: 260, x: 120, dial: 1, set: 3, built: 3, bound: 1, bind: 1, press: 1,
    text: 'In Rousseau’s state, no ruler stands above the people. Everybody is bound to the common good, as expressed in the general will.',
    dur: 2,
  },
  {
    p: 260, x: 120, dial: 1, set: 3, built: 3, bound: 1, bind: 1, self: 1, press: 1,
    text: 'Rousseau argues that by obeying the general will, each person obeys only himself and remains free.',
    dur: 1.8,
  },
  {
    p: 461, x: 120, dial: 1, set: 3, built: 3, bound: 1, bind: 1, self: 1, press: 1,
    interact: {
      prompt: 'Put the argument in the order these theorists build it.',
      order: {
        axis: 'FIRST STEP FIRST',
        items: [
          { id: 'nature', reads: 'A VIEW OF HUMAN NATURE' },
          { id: 'without', reads: 'WHAT LIFE WITHOUT A STATE IS LIKE' },
          { id: 'state', reads: 'THE STATE THAT WOULD FIX IT' },
        ],
      },
      explain: 'The view of human nature comes first and carries the rest. Hobbes, Locke and Rousseau all run the same three steps and reach different states because they start from different pictures of what people are like when nothing restrains them.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 384, x: 120, dial: 1, set: 1, built: 3, plates: 1, bound: 1, bind: 1, self: 1, press: 1,
    interact: {
      prompt: 'If human nature is fearful, which state does that diagnosis require?',
      explain: 'One sovereign. If no one can trust anyone, only a power above everyone can keep the peace. So Hobbes gives the sovereign almost unlimited authority. The limited state looks more moderate, but it’s Locke’s, built on a more hopeful view of human nature.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 9, x: 120, dial: 1, set: 1, built: 3, bound: 1, bind: 1, self: 1, press: 1,
    summary: {
      title: 'From Human Nature to the State',
      points: [
        'The state of nature serves as a thought experiment',
        'Hobbes saw fear, Locke insecurity, Rousseau lost innocence',
        'Each reading demands a different contract',
        'To assess a state, first assess its premise about people',
      ],
      closing: 'Every theory of government rests on a claim, often unstated, about what people are like.',
    },
    dur: 3.0,
  },
];

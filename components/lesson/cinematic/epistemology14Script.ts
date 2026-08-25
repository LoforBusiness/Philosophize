import type { BaseBeat } from './cinematicKit';

// Cinematic epistemology-knowledge-14, "How Do You Know the World Is Real?" — a
// CONVERSION of an existing card deck, at the Epistemology frontier (§5).
//
// THE PICTURE: you, a screen, and the world behind it. Halfway through, the world
// swaps for a vat — and THE SCREEN DOES NOT CHANGE. That is the whole argument, and
// the picture makes it by refusing to move (H64).
//
// STAGING: the answer targets are the three parts of that arrangement, so the reader
// answers by pointing at where in their own situation they are standing (E33).

export interface Epis14Beat extends BaseBeat {
  /** Figure gesture (emote code). */ g?: number;
  /** 0 = a real world behind the screen · 1 = a vat. */ vat?: number;
  /** 1 = the leap between them is drawn. */ leap?: number;
  /** 1 = the three parts are live targets (Q1). */ pick?: number;
}

export const BEATS: Epis14Beat[] = [
  {
    g: 5, vat: 0, leap: 0,
    dur: 4.0,
    text: 'Here is your situation, drawn honestly. There is a world, and there is what reaches you of it, and you are on this side of that.',
  },
  {
    g: 2, vat: 0, leap: 0,
    dur: 4.4,
    text: 'Everything you have ever checked, you checked by looking. So every check happened here, on this side of the glass, and never against the world itself.',
    cite: 'What you can check',
  },
  {
    g: 1, vat: 0, leap: 1,
    dur: 4.4,
    text: 'So the world is not something you observe. It is something you infer, across this gap, from what shows up on the screen.',
    cite: 'The leap',
  },
  {
    g: 141, vat: 0, leap: 1,
    dur: 3.6,
    quote: {
      id: 'lq-epistemology-knowledge-14-2',
      text: 'In one sense it must be admitted that we can never prove the existence of things other than ourselves and our experiences.',
      author: 'Bertrand Russell',
      work: 'The Problems of Philosophy',
      era: '1912',
      branchSlugs: ['epistemology'],
    },
  },
  {
    g: 45, vat: 1, leap: 1,
    dur: 4.8,
    text: 'Now swap the world for a tank and a very good computer. Watch the screen while it happens. Nothing on it moved — and nothing on it ever would.',
    cite: 'Swap the world',
  },
  {
    g: 4, vat: 1, leap: 1, pick: 1,
    dur: 1.0,
    interact: {
      prompt: 'Tap the only part of this you can actually inspect.',
      explain: 'The screen. Everything you have ever verified, you verified by looking — which means you verified it here. The world is reached across the gap, and the gap is the part you cannot get behind from inside.',
      xp: 5,
    },
  },
  {
    g: 11, vat: 1, leap: 1,
    dur: 1.0,
    interact: {
      prompt: 'Why is "you might be a brain in a vat" so hard to refute with experience alone?',
      cards: [
        { text: 'The experiences would be identical', correct: true },
        { text: 'Common sense rules it out', correct: false },
      ],
      explain: 'The other card is the tempting appeal to common sense, and it begs the question — a simulation would fake the pinch too. The scenario is built so that every possible piece of evidence is explained equally well by both worlds.',
      xp: 5,
    },
  },
  {
    summary: {
      title: 'The World Beyond the Screen',
      points: [
        'You only ever directly access your own experience',
        'The vat fakes every piece of evidence equally well',
        'Russell: the external world is an inference, not a sighting',
        'Putnam argued the scenario may even be self-refuting',
      ],
      closing: 'You probably cannot prove the world is real. Notice that you cannot prove it is fake either, and you have to live somewhere.',
    },
    dur: 3.0,
  },
];

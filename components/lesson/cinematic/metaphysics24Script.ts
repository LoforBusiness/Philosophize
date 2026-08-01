import type { BaseBeat } from './cinematicKit';

// Cinematic metaphysics-being-24, "When Does a Heap Stop Being a Heap?"
//
// THE PICTURE: a pile of grains and a verdict lamp reading HEAP. Grains come off
// one at a time and the lamp never once goes out — until the pile is a single grain
// and the lamp is still lit, which is absurd. Nothing in the lesson turns the lamp
// off, because there is no grain whose removal does it.
//
// Q1 is A/B/C/D (the false-precision dodge needs its rivals on the page); Q2 is
// answered on the pile (E34, H65).

export interface Meta24Beat extends BaseBeat {
  /** Figure gesture (emote code). */ p?: number;
  /** Where the figure stands (stage x). */ x?: number;
  /** How many grains are left, 0…18. */ grains?: number;
  /** 1 = the HEAP verdict lamp is showing. */ lamp?: number;
  /** 1 = the three answer cards are live (Q2). */ pick?: number;
}

export const BEATS: Meta24Beat[] = [
  {
    p: 25, x: 70,
    text: 'Here is a heap of sand. Take one grain away. Still a heap — obviously, because one grain has never been the difference between a heap and no heap.',
    dur: 4.6,
  },
  {
    p: 41, x: 168, grains: 18, lamp: 1,
    text: 'So the rule is safe: removing a single grain never changes the verdict. Every step you are about to see is an application of a rule you just agreed to.',
    cite: 'The rule',
    dur: 4.8,
  },
  {
    p: 40, x: 168, grains: 9, lamp: 1,
    text: 'Keep applying it. Half of them gone and the lamp has not flickered, because at no point did one grain do anything.',
    cite: 'Halfway',
    dur: 4.2,
  },
  {
    p: 44, x: 124, grains: 9, lamp: 1,
    quote: {
      id: 'lq-metaphysics-being-24-1',
      text: 'Everything is vague to a degree you do not realize till you have tried to make it precise.',
      author: 'Bertrand Russell',
      work: 'The Philosophy of Logical Atomism',
      era: '1918',
      branchSlugs: ['metaphysics'],
    },
    dur: 3.8,
  },
  {
    p: 29, x: 168, grains: 1, lamp: 1,
    text: 'One grain, and the verdict is still HEAP. Every single step was fine and the destination is nonsense — which means something you agreed to is wrong, and it is not obvious which.',
    cite: 'One grain left',
    dur: 5.2,
  },
  {
    p: 4, x: 124, grains: 1, lamp: 1,
    mc: {
      prompt: 'A friend says: "Just define a heap as 100 grains or more. Solved." Why does that dodge it?',
      options: [
        { id: 'a', text: 'A precise cut-off is arbitrary and is not how the word works', correct: true },
        { id: 'b', text: 'It is the correct solution — vagueness is sloppy definition', correct: false },
        { id: 'c', text: 'Because 100 is too small a number for sand', correct: false },
        { id: 'd', text: 'Because heaps are not really made of grains', correct: false },
      ],
      explain: 'The trap is false precision. It makes 99 a non-heap and 100 a heap with no real difference between them, and it quietly replaces our vague word instead of explaining why the vague word resists a line.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 6, x: 124, grains: 1, lamp: 1, pick: 1,
    interact: {
      prompt: 'Tap the grain whose removal ended the heap.',
      explain: 'There is not one, and that is the paradox rather than a failure to find it. Every removal was harmless on its own; the trouble is that the harmless steps add up to a conclusion nobody accepts.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Living on the Blurry Edge',
      points: [
        'Tiny harmless steps reach a false conclusion',
        'Heap, bald, tall: fuzzy boundaries everywhere',
        'Epistemicism: a hidden sharp line we cannot know',
        'Other views: truth-gaps, or degrees of truth',
      ],
      closing: 'Almost every useful word you own has an edge like this. They work anyway, which is the strange part.',
    },
    dur: 3.0,
  },
];

import type { BaseBeat } from './cinematicKit';

// Cinematic aesthetics-aesthetics-11, "Can a Machine Make Art?"
//
// THE PICTURE: two framed canvases hung side by side and drawn from the same style
// object, so they are identical by construction rather than by claim. Over the
// lesson everything that CAN change changes — the plaques underneath, the tag
// across them, the answer cards — and the two pictures never differ by a mark. The
// argument is that the only thing the stage can find to differentiate is the label.
//
// Q1 is answered on the wall (tap what actually differs). Q2 is A/B/C/D, because
// "what could the maker be adding" is the one that needs weighing (E34).

export interface Aes11Beat extends BaseBeat {
  /** Figure gesture (emote code). */ p?: number;
  /** Where the figure stands (stage x). 70 = downstage left, 168 = at the wall. */ x?: number;
  /** Both canvases are hung, 0..1. */ frames?: number;
  /** The two plaques are lettered, 0..1. */ plaques?: number;
  /** 1 = the IDENTICAL tag is drawn across both frames. */ same?: number;
  /** 1 = the three answer cards are live (Q1). */ pick?: number;
}

export const BEATS: Aes11Beat[] = [
  {
    p: 25, x: 70,
    text: 'A gallery hangs two pictures. One was painted by a person over four months. One was generated in about nine seconds.',
    dur: 4.0,
  },
  {
    p: 41, x: 168, frames: 1,
    text: 'Here they are. Not similar — identical. The same marks in the same places, the same size, the same everything you could photograph.',
    cite: 'Both canvases',
    dur: 4.6,
  },
  {
    p: 47, x: 124, frames: 1, plaques: 1,
    text: 'Only the plaques tell the two apart. Cover the plaques and no visitor, curator or critic has ever sorted them reliably.',
    cite: 'The plaques',
    dur: 4.4,
  },
  {
    p: 139, x: 124, frames: 1, plaques: 1,
    quote: {
      id: 'lq-aesthetics-aesthetics-11-1',
      text: 'Art is a human activity having for its purpose the transmission to others of the highest and best feelings to which men have risen.',
      author: 'Leo Tolstoy',
      work: 'What Is Art?',
      era: '1897',
      branchSlugs: ['aesthetics'],
    },
    dur: 3.8,
  },
  {
    p: 29, x: 168, frames: 1, plaques: 1, same: 1,
    text: 'So every visible property is shared. Whatever separates these two is therefore not in the object at all — it is in how the object came to be here.',
    cite: 'Nothing visible left',
    dur: 4.8,
  },
  {
    p: 6, x: 124, frames: 1, plaques: 1, same: 1, pick: 1,
    interact: {
      prompt: 'The canvases match exactly. Tap the only thing that actually differs.',
      explain: 'Nothing on the surface. The premise rules a visible tell out — if one brushstroke differed, the case would be easy and uninteresting. What differs is the history behind the paint.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 4, x: 124, frames: 1, plaques: 1, same: 1,
    interact: {
      prompt: 'Set the lever to what the human maker adds.',
      lever: {
        start: 0,
        stops: [
          { id: 'nothing', reads: 'nothing; identical surfaces, identical works' },
          { id: 'toil', reads: 'the hours it took out of a life' },
          { id: 'feeling', reads: 'a feeling that was had, and then passed on', correct: true },
        ],
      },
      explain: 'The far setting. Identical objects, identical value sounds strict, and it quietly assumes a work is only its surface. Tolstoy asks something else. Was a feeling carried across? Carrying one takes a person who had the feeling first.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'The History Is Part Of It',
      points: [
        'Identical surfaces can still differ in what they are',
        'The difference lives in how it was made',
        'Expression needs someone doing the expressing',
        'Formalists deny this — and that is the debate',
      ],
      closing: 'The question was never whether a machine can make an image. It is whether making needs a maker.',
    },
    dur: 3.0,
  },
];

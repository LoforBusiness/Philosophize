import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic personal-growth-foundations-5, "Practise at the Edge" — the fifth lesson on
// the Personal Growth road, and a DIALOGUE lesson (LESSON_RULES group AP).
// Theme: A CIRCUS BIG TOP, THREE TIGHTROPES AT THREE HEIGHTS, AND A SAFETY NET.
//
// Three people talk, and nobody narrates. An old hand (the newsboy cap) crosses a rope
// that lies on the floor of the ring, perfectly, for the ten-thousandth time; a new
// recruit (the woman with the bun) is already halfway up the ladder to the high wire; the
// ringmaster (the top hat) has no patience with either, and sends them both to the middle
// rope, over the net.
//
// A ROAD THAT RAMPS UP (group AU): this road has taught little-and-often, habits, goals and
// learning from a mistake. This lesson is how practice itself works, which is harder:
// three ideas — easy practice keeps you where you are · too hard, and fear stops you
// learning · you grow at the edge, with fast feedback on one weak spot. It builds straight
// on "a mistake is information": the feedback is the mistake, reported the moment it happens.
//
// Every line is written for the ear (groups AC/AD), from its speaker’s character
// (cast.ts, AP14; group AS), and read at the pace its words ask for (AP17, AP21).
// ─────────────────────────────────────────────────────────────────────────────

export interface Growth5Beat extends BaseBeat {
  /**
   * What happens across this beat’s line (the scene choreographs it):
   * floor — the old hand walks the rope lying on the ring floor, arms out, without a wobble ·
   * scoff — the ringmaster taps the floor rope with his cane ·
   * climb — the recruit climbs the ladder toward the high wire ·
   * down — the ringmaster beckons her down with the cane, and she climbs back down ·
   * edge — he walks to the middle rope, strung at knee height over the safety net, and pats it ·
   * wobble — the recruit steps onto the middle rope, wobbles, and drops into the net, which bounces her ·
   * whistle — the ringmaster points his cane at her lean, then turns and lifts the prop trunk's lid: a
   *   rolled poster and a pair of slippers come up out of it, beside the whistle hanging on its corner ·
   * join — the old hand steps up onto the middle rope behind her, arms out ·
   * cross — the ringmaster takes the whistle off the trunk; the recruit crosses the middle rope, and he
   *   blows it each time she leans ·
   * rest — everyone at ease under the quotation.
   */
  act?: 'floor' | 'scoff' | 'climb' | 'down' | 'edge' | 'wobble' | 'whistle' | 'join' | 'cross' | 'rest';
  /** Where the recruit is: 0 on the ground · 1 on the ladder · 2 on the middle rope. */
  her?: number;
  /**
   * First question on the stage — PICK THE ROPE: the rope on the floor, the middle rope
   * over the net and the high wire under the roof are the things to tap.
   */
  rope?: boolean;
  /**
   * Second question on the stage — RUMMAGE THE PROP TRUNK: three things poking out of the
   * open trunk, the ringmaster’s whistle, a poster of a famous walker and a pair of
   * sparkly shoes, are the things to tap.
   */
  trunk?: boolean;
}

export const BEATS: Growth5Beat[] = [
  {
    bed: 'room',
    act: 'floor', her: 0,
    speaker: 'cap',
    text: 'Ten thousand times across this rope, and I’ve never wobbled once.',
    pace: 'even',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'chalktap', at: 1.91, gain: 0.7 }],
    act: 'scoff', her: 0,
    speaker: 'tophat',
    text: 'That rope’s lying on the floor. You could cross it asleep, and you haven’t learned a thing in years.',
    pace: 'brisk',
    dur: 2.1,
  },
  {
    act: 'climb', her: 1,
    speaker: 'bun',
    text: 'I’m skipping the boring bit. I’ll practise up on the high wire from day one!',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'thud', at: 3.23, gain: 0.6 }],
    act: 'down', her: 0,
    speaker: 'tophat',
    text: 'Down. Up there you’d be too scared to learn a thing, and you’d just cling on.',
    pace: 'brisk',
    dur: 2.1,
  },
  {
    sfx: [{ id: 'plank', at: 4.47, gain: 0.7 }],
    act: 'edge', her: 0,
    speaker: 'tophat',
    text: 'You get better at the edge of what you can do. Hard enough that you wobble, safe enough that you can think.',
    pace: ['weighty', 'even'],
    dur: 2.1,
  },
  {
    her: 0, rope: true,
    interact: {
      prompt: 'Which rope should she practise on tomorrow?',
      explain: 'The middle rope, over the net. It’s hard enough to make her wobble and low enough that she can think. The floor rope is too easy, and the high wire too frightening to learn on.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    sfx: [{ id: 'bounce', at: 1.32, gain: 0.8 }],
    act: 'wobble', her: 2,
    speaker: 'bun',
    text: 'Whoa! I fell off four times, but I think I keep leaning to the left.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'creak', at: 2.94, gain: 0.8 }],
    act: 'whistle', her: 2,
    speaker: 'tophat',
    text: 'Good, that’s the one to fix. Practise just the lean, and get told the moment it goes wrong.',
    pace: 'even',
    dur: 2.1,
  },
  {
    act: 'join', her: 2,
    speaker: 'cap',
    text: 'I’ll come up there too. If I can still wobble, I can still get better.',
    pace: 'even',
    dur: 1.8,
  },
  {
    her: 2, trunk: true,
    interact: {
      prompt: 'What in the trunk will fix her lean fastest?',
      explain: 'The whistle. Each time she leans, a blast tells her at once, so she can fix it on the spot. A poster and new shoes feel nice, but they tell her nothing.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    sfx: [{ id: 'whistle', at: 1.52, gain: 0.7 }, { id: 'whistle', at: 3.04, gain: 0.7 }],
    act: 'cross', her: 2,
    speaker: 'bun',
    text: 'Every time I lean, he blows the whistle. I hate the noise, and I’ve stopped leaning.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'rest', her: 2,
    quote: {
      id: 'lq-personal-growth-foundations-5-1',
      text: 'The right sort of practice carried out over a sufficient period of time leads to improvement. Nothing else.',
      author: 'Anders Ericsson',
      work: 'Peak',
      era: '2016',
      branchSlugs: ['personal-growth'],
    },
    dur: 3.0,
  },
  {
    her: 2,
    summary: {
      title: 'Practise at the Edge',
      points: [
        'Easy practice keeps you where you are',
        'Too hard, and fear stops you learning',
        'Grow at the edge, with fast feedback on one weak spot',
      ],
      closing: 'Next time you practise something, ask whether you wobbled at all.',
    },
    dur: 2.8,
  },
];

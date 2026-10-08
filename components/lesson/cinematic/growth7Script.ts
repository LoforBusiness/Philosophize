import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic personal-growth-foundations-7, "Personal Growth Recap: The Mountain Hut" — the
// RECAP of the Personal Growth road's first six lessons (LESSON_RULES group AV), and a
// DIALOGUE lesson (group AP).
// AV: recap
// Theme: A MOUNTAIN HUT AT DAWN, A TRAIL MAP, BOOTS, A KETTLE ON A STOVE AND A LOGBOOK;
// THEN A SWITCHBACK TRAIL, LOOSE GRAVEL, A SIGNPOST AND A VALLEY BELOW.
//
// Two people talk, and nobody narrates. The mountain guide (the top hat) is alone in a
// timber hut at dawn, planning a climb: a trail map pinned flat on the table, his boots by
// the stove, a kettle coming to the boil, a training logbook on the bench. Through the
// window, the peaks go pink. The woman with the bun, who was the beginner in four of this
// road's lessons (the flowerpot, the running track, the high wire, the Morse code), bursts
// in with an enormous rucksack, meaning to reach the summit today, and gets every lesson a
// little wrong on the way. The guide sets each one straight. They then go out onto the
// switchback trail, with the valleys, a lake and a small lake hut far below.
//
// WHAT IT RECAPS, LESSON BY LESSON (each line is taken from what that lesson said):
//   1 How Do People Change? — change comes from a small step done again and again, not one
//     huge effort (beats 1–2, 5).
//   2 How Habits Work — a habit is a loop of cue, routine and reward; keep the cue and the
//     reward, and swap only the routine (beats 7–8, 11).
//   3 How to Set a Goal That Works — a goal is specific, so you can tell when it's done;
//     start small; write down when and where, and keep it in sight (beats 3–6).
//   4 How to Learn From a Mistake — blaming the tool teaches nothing; a mistake is
//     information; change one thing and try again, and skill grows (beats 12–15).
//   5 Practise at the Edge — too easy keeps you where you are, too hard and fear stops you
//     learning; you grow at the edge (beats 16–18).
//   6 Why Cramming Fades — cramming fills your head for a night, then drains away; practice
//     spread over days lasts, and nearly forgetting makes a memory stronger (beats 9–11).
//
// Every line is written for the ear (groups AC/AD), from its speaker's character (cast.ts,
// AP14; group AS), and spoken in the natural style (AP22).
// ─────────────────────────────────────────────────────────────────────────────

export interface Growth7Beat extends BaseBeat {
  /**
   * What happens across this beat (the scene choreographs it):
   * work — the guide alone in the hut at dawn: marks the trail map with a pencil, laces a
   *   boot, sets the kettle on the stove, glances out of the window at the peaks ·
   * arrive — the bun bursts through the hut door under an enormous rucksack and waves ·
   * map — the guide taps one short step of the trail on the map, then the next ·
   * wish — the bun spreads her arms wide at the window and the whole mountain ·
   * goal — the guide pushes three pins into the map, one far up at the summit ·
   * pin — the guide hands her a card and points at the cork board by the kettle ·
   * kettle — the kettle steams; the bun pins her card by it, then picks up a slice of cake ·
   * loop — the guide points at the kettle, then at the cake, then at the chair ·
   * cram — the bun puts the cake down and flicks to the last page of the logbook ·
   * spread — the guide turns the logbook's pages one at a time, a gap between each ·
   * trail — out on the switchback, the bun has slid back down the loose gravel and sits up ·
   * laces — the guide points at her boot, its laces trailing undone ·
   * retry — the bun stands, ties the laces in a big bow and pats them ·
   * cliff — the bun points straight up a sheer rock face beside the trail ·
   * edge — the guide plants his walking pole and shakes his head at the cliff ·
   * view — on the zigzag above, the bun steadies herself on the rope and points down the
   *   valley at the lake hut ·
   * rest — both at ease on a rock at a bend of the trail under the quotation, the valley
   *   and the lake behind.
   */
  act?: 'work' | 'arrive' | 'map' | 'wish' | 'goal' | 'pin' | 'kettle' | 'loop' | 'cram' | 'spread' | 'trail' | 'laces' | 'retry' | 'cliff' | 'edge' | 'view' | 'rest';
  /** Where they are: 0 the mountain hut · 1 the switchback trail. */
  place?: number;
  /** What the bun holds: 0 nothing · 1 a slice of cake. */
  holds?: number;
  /**
   * First question on the stage — MARK THE MAP: three flagged pins on the trail map on the
   * hut table, THE SUMMIT, SOMEDAY · A PROPER MOUNTAIN PERSON · THE LAKE HUT BY SATURDAY;
   * the pin that is a goal she could check she'd reached is the one to tap.
   */
  map?: boolean;
  /**
   * Second question on the stage — PICK THE PAGE: the training logbook on the bench lies
   * open with three plans, TEN STEP-UPS WHEN THE KETTLE BOILS · ALL THE TRAINING FRIDAY
   * NIGHT · TRAIN WHEN I FEEL LIKE IT; the page that will get her ready is the one to tap.
   */
  page?: boolean;
  /**
   * Third question on the stage — CHOOSE THE ROUTE: a wooden signpost at a fork on the
   * trail with three arms, THE VALLEY PATH (a flat meadow) · THE CLIFF (a sheer rock face)
   * · THE ZIGZAG (a steep switchback with a fixed rope); the arm to climb is the one to tap.
   */
  route?: boolean;
}

export const BEATS: Growth7Beat[] = [
  {
    bed: 'room',
    sfx: [{ id: 'pencil', at: 1.1, gain: 0.7 }, { id: 'paper', at: 2.5, gain: 0.6 }, { id: 'pourcup', at: 3.9, gain: 0.5 }, { id: 'pencil', at: 5.2, gain: 0.7 }],
    voiceAfter: 6.2,
    act: 'work', place: 0, holds: 0,
    speaker: 'tophat',
    text: 'Six rules for the climb, and the kettle’s nearly boiled.',
    pace: 'even',
    dur: 2.0,
  },
  {
    act: 'arrive', place: 0, holds: 0,
    speaker: 'bun',
    text: 'Morning! I’m climbing to the very top today, and I’ve never climbed anything before!',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'pencil', at: 1.3, gain: 0.7 }],
    act: 'map', place: 0, holds: 0,
    speaker: 'tophat',
    text: 'Not today. People change through small steps, done again and again, not one huge leap.',
    pace: 'even',
    dur: 2.1,
  },
  {
    act: 'wish', place: 0, holds: 0,
    speaker: 'bun',
    text: 'Lovely. Then my goal is to become a proper mountain person!',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'pin', at: 1.2, gain: 0.6 }],
    act: 'goal', place: 0, holds: 0,
    speaker: 'tophat',
    text: 'That’s a wish. A goal is specific, so you can tell when it’s done, and its first stage is small.',
    pace: 'even',
    dur: 2.1,
  },
  {
    place: 0, holds: 0, map: true,
    interact: {
      prompt: 'Which pin on the map is a goal she could check she’d reached?',
      explain: 'The lake hut by Saturday. She’ll know the moment she gets there, and it’s a small first stage. The summit someday and a proper mountain person are wishes, with no finish line.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    sfx: [{ id: 'paper', at: 0.8, gain: 0.6 }],
    act: 'pin', place: 0, holds: 0,
    speaker: 'tophat',
    text: 'Now write down when and where, and pin it somewhere you’ll see it every day.',
    pace: 'even',
    dur: 2.1,
  },
  {
    sfx: [{ id: 'pin', at: 0.9, gain: 0.6 }, { id: 'plate', at: 2.4, gain: 0.5 }],
    act: 'kettle', place: 0, holds: 1,
    speaker: 'bun',
    text: 'Saturday at nine, pinned by the kettle. Ooh, it’s boiled, so that means cake!',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'loop', place: 0, holds: 1,
    speaker: 'tophat',
    text: 'Every habit runs on a loop. The kettle’s your cue, the cake’s the routine, and the sit down is the reward.',
    pace: 'even',
    dur: 2.1,
  },
  {
    sfx: [{ id: 'book', at: 1.5, gain: 0.6 }],
    act: 'cram', place: 0, holds: 0,
    speaker: 'bun',
    text: 'Fine, no cake. I’ll just do all my training on Friday night, in one go!',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'paper', at: 1.0, gain: 0.5 }, { id: 'paper', at: 2.6, gain: 0.5 }],
    act: 'spread', place: 0, holds: 0,
    speaker: 'tophat',
    text: 'Cramming fills you up for a night, then drains away. Spread it over days, and each time you nearly forget, it sticks harder.',
    pace: 'even',
    dur: 2.1,
  },
  {
    place: 0, holds: 0, page: true,
    interact: {
      prompt: 'Which page of the logbook will get her ready for Saturday?',
      explain: 'Ten step-ups when the kettle boils. It keeps the kettle as her cue, swaps only the routine, and spreads her training over the days. Friday night is cramming, and training when she feels like it has no cue at all.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    bed: 'river',
    act: 'trail', place: 1, holds: 0,
    speaker: 'bun',
    text: 'These boots are broken! I slid all the way back down the gravel.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'laces', place: 1, holds: 0,
    speaker: 'tophat',
    text: 'Blaming the boots teaches you nothing. A mistake is information, if you look at what went wrong, like your undone laces.',
    pace: 'even',
    dur: 2.1,
  },
  {
    act: 'retry', place: 1, holds: 0,
    speaker: 'bun',
    text: 'Oh, so the boots were never broken. The floppy laces were the trouble.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'retry', place: 1, holds: 0,
    speaker: 'tophat',
    text: 'Tie them, and try again, changing just that one thing. Each mistake you learn from makes the next try a little better.',
    pace: 'even',
    dur: 2.1,
  },
  {
    act: 'cliff', place: 1, holds: 0,
    speaker: 'bun',
    text: 'Right, laces tied. Now I’ll go straight up that cliff, it’s much quicker!',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'edge', place: 1, holds: 0,
    speaker: 'tophat',
    text: 'You’d be too scared up there to learn a thing. You get better at the edge of what you can do.',
    pace: 'even',
    dur: 2.1,
  },
  {
    place: 1, holds: 0, route: true,
    interact: {
      prompt: 'Which way up should she climb to get better at climbing?',
      explain: 'The zigzag with the rope. It’s steep enough to make her wobble and safe enough to think. The valley path is too easy to teach her anything, and the cliff is too frightening to learn on.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    act: 'view', place: 1, holds: 0,
    speaker: 'bun',
    text: 'I wobbled twice on the zigzag, and I kept going. Is that the lake hut down there?',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'rest', place: 1, holds: 0,
    quote: {
      id: 'lq-personal-growth-foundations-7-1',
      text: 'A journey of a thousand miles begins with a single step.',
      author: 'Laozi',
      work: 'Tao Te Ching, chapter 64',
      era: 'c. 400 BC',
      branchSlugs: ['personal-growth'],
    },
    dur: 3.0,
  },
  {
    place: 1, holds: 0,
    summary: {
      title: 'Personal Growth Recap: The Mountain Hut',
      points: [
        'Change comes from small steps, repeated',
        'Set specific goals, and swap a habit’s routine',
        'Practise at the edge, spread out over days',
      ],
      closing: 'Next time you start something new, pick a small first step and a day to take it.',
    },
    dur: 2.8,
  },
];

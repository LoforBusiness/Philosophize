import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic personal-growth-foundations-6, "Why Cramming Fades" — the sixth lesson on
// the Personal Growth road, and a DIALOGUE lesson (LESSON_RULES group AP).
// Theme: A LIGHTHOUSE ON A STORMY ROCK, A SIGNAL LAMP, AND A SHIP IN TROUBLE.
//
// Three people talk, and nobody narrates. A new assistant (the woman with the bun)
// crammed the whole Morse code in one night; the keeper's other helper (the newsboy cap)
// has practised ten minutes a day all week; the lighthouse keeper (the top hat) needs one
// of them to read a ship's signal in a storm, and shows why only one of them can.
//
// A ROAD THAT RAMPS UP (group AU): the last lesson on this road was practising at the edge
// of what you can do. This one is how practice is spread out over time, and it is harder:
// three ideas — cramming fades fast · spacing practice out makes it last · gaps that grow
// make a memory stronger each time you nearly forget. Its first question is a bet placed
// BEFORE the storm shows who was right.
//
// Every line is written for the ear (groups AC/AD), from its speaker’s character
// (cast.ts, AP14; group AS), and read at the pace its words ask for (AP17, AP21).
// ─────────────────────────────────────────────────────────────────────────────

export interface Growth6Beat extends BaseBeat {
  /**
   * What happens across this beat’s line (the scene choreographs it):
   * notes — the assistant, at the desk in the lamp room, holds up her sheet of Morse notes,
   *   waves it twice, and sets a hand on her hip ·
   * daily — the helper presses the Morse key on the desk, a dot and a dash, and its lamp lights ·
   * storm — night and rain roll in; the barometer drops to stormy; out at sea a fishing boat’s
   *   masthead lamp blinks; the keeper peers out, points at it, and waves the two to the window ·
   * forgot — the assistant squints out at the blinking light, looks at her notes as the ink
   *   drains off them, clutches her head, and the blank sheet flutters to the floor ·
   * sos — the helper reads the blinks with a raised finger, then points hard at the boat ·
   * fade — the keeper pushes the great lens round: its beam swings out to the boat, whose lamp
   *   turns steady green; he points at the blank notes on the floor, then along the beam ·
   * gaps — he winds the lamp’s crank twice, at a growing gap: the light sinks, flares when he
   *   winds, sinks more slowly, and flares brighter ·
   * tomorrow — the assistant takes the pencil from the desk, walks to the GAPS GROW calendar
   *   on the wall and circles day one ·
   * rest — everyone at ease under the quotation, the storm passing, the ship safe.
   */
  act?: 'notes' | 'daily' | 'storm' | 'forgot' | 'sos' | 'fade' | 'gaps' | 'tomorrow' | 'rest';
  /** The weather: 0 a calm evening · 1 the storm, a week later. */
  storm?: number;
  /**
   * First question on the stage — PLACE YOUR BET: the assistant, the helper and a brass
   * token marked A DRAW on the desk are the things to tap. It is asked before the storm
   * shows who was right.
   */
  bet?: boolean;
  /**
   * Second question on the stage — PICK THE CALENDAR: three calendars on the wall, ALL OF
   * IT THE NIGHT BEFORE, A LITTLE WITH GROWING GAPS and ONCE ON DAY ONE, are the things to tap.
   */
  calendar?: boolean;
}

export const BEATS: Growth6Beat[] = [
  {
    bed: 'beach',
    sfx: [{ id: 'paper', at: 0.18, gain: 0.7 }],
    act: 'notes', storm: 0,
    speaker: 'bun',
    text: 'I learned the whole Morse alphabet last night, in one go. Ask me anything!',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'chalktap', at: 0.73, gain: 0.7 }, { id: 'chalktap', at: 1.69, gain: 0.7 }],
    act: 'daily', storm: 0,
    speaker: 'cap',
    text: 'I’ve been doing ten minutes a day, all week. I’m still slow, mind.',
    pace: 'even',
    dur: 1.8,
  },
  {
    storm: 0, bet: true,
    interact: {
      prompt: 'A week from now, a ship signals for help. Who will read it best?',
      explain: 'The helper, who practised a little every day. Cramming fills your head for a night, and then most of it drains away. Practice spread over a week stays.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    bed: 'storm',
    act: 'storm', storm: 1,
    speaker: 'tophat',
    text: 'There’s a ship signalling out there. Read it to me, both of you, and be quick.',
    pace: 'brisk',
    dur: 2.1,
  },
  {
    sfx: [{ id: 'paper', at: 3.28, gain: 0.7 }],
    act: 'forgot', storm: 1,
    speaker: 'bun',
    text: 'Dot, dash, dot? I’ve forgotten nearly all of it!',
    pace: ['brisk', 'even'],
    dur: 1.8,
  },
  {
    act: 'sos', storm: 1,
    speaker: 'cap',
    text: 'Three short, three long, three short. That’s S O S, they need help!',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'creak', at: 0.73, gain: 0.8 }],
    act: 'fade', storm: 1,
    speaker: 'tophat',
    text: 'Cramming fills your head for a night, then most of it drains away. Practice spread out over days is what stays.',
    pace: ['weighty', 'even'],
    dur: 2.1,
  },
  {
    sfx: [{ id: 'crank', at: 1.94, gain: 0.8 }, { id: 'crank', at: 4.44, gain: 0.8 }],
    act: 'gaps', storm: 1,
    speaker: 'tophat',
    text: 'And each time you nearly forget and then remember, the memory gets stronger. So let the gaps grow.',
    pace: 'even',
    dur: 2.1,
  },
  {
    sfx: [{ id: 'thunder', at: 0.5, gain: 0.8 }],
    storm: 1, calendar: true,
    interact: {
      prompt: 'She has a test in a month. Which plan will she remember best?',
      explain: 'A little, with growing gaps. Each practice comes just as the code starts to fade, which makes it stick harder. One long night, or one go at the start, fades away.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    sfx: [{ id: 'pencil', at: 2.55, gain: 0.8 }],
    act: 'tomorrow', storm: 1,
    speaker: 'bun',
    text: 'Fine, ten minutes a day. Starting tomorrow, I promise.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'rest', storm: 1,
    quote: {
      id: 'lq-personal-growth-foundations-6-1',
      text: 'With any considerable number of repetitions a suitable distribution of them over a space of time is decidedly more advantageous than the massing of them at a single time.',
      author: 'Hermann Ebbinghaus',
      work: 'Memory: A Contribution to Experimental Psychology',
      era: '1885',
      branchSlugs: ['personal-growth'],
    },
    dur: 3.0,
  },
  {
    storm: 1,
    summary: {
      title: 'Why Cramming Fades',
      points: [
        'Cramming fills your head for a night, then fades',
        'Practice spread over days is what lasts',
        'Growing gaps make a memory stronger each time',
      ],
      closing: 'Next time you learn something, plan when you’ll come back to it.',
    },
    dur: 2.8,
  },
];

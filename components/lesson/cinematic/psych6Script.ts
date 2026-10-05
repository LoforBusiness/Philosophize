import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic psychology-foundations-6, "Why One More Go?" — the sixth lesson on the
// Psychology road, and a DIALOGUE lesson (LESSON_RULES group AP).
// Theme: A NEON ARCADE ON A SEASIDE PIER AT NIGHT, A CLAW MACHINE, AND A PURPLE BEAR.
//
// Three people talk, and nobody narrates. A player (the woman with the bun) cannot stop
// feeding the claw machine; the arcade's owner (the plain mascot) is proud of how well it
// keeps her playing; a psychologist (the top hat) explains why a reward you can't predict
// is the hardest one to walk away from, and where else it hides.
//
// A ROAD THAT RAMPS UP (group AU): this road has shown how people rebuild memories, see
// what they expect, follow crowds and protect their beliefs. This lesson is how rewards
// shape what people do, and it is harder: three ideas — a reward makes a behaviour more
// likely, called reinforcement · rewards that come unpredictably keep people going longest
// · phones and games use the same trick. Its first question is asked before the answer is
// shown.
//
// Every line is written for the ear (groups AC/AD), from its speaker’s character
// (cast.ts, AP14; group AS), and read at the pace its words ask for (AP17, AP21).
// ─────────────────────────────────────────────────────────────────────────────

export interface Psych6Beat extends BaseBeat {
  /**
   * What happens across this beat’s line (the scene choreographs it):
   * miss — the player works the claw machine’s stick; the claw drops, grabs, and the bear slips out ·
   * polish — the owner polishes the machine’s glass with a cloth ·
   * trap — the psychologist leans on the next machine and taps its coin slot, then its prize chute ·
   * reinforce — he holds up one finger, then points at the player’s hand on the stick ·
   * win — the claw drops and lifts the purple bear; it falls down the chute and she holds it up ·
   * smug — the owner folds his arms and nods ·
   * phone — the psychologist takes a phone from his pocket, pulls down on its screen, and holds it up ·
   * onemore — the player looks at her own phone, turns for the door, stops, and turns back to the machine with a coin ·
   * rest — everyone at ease under the quotation, the neon blinking.
   */
  act?: 'miss' | 'polish' | 'trap' | 'reinforce' | 'win' | 'smug' | 'phone' | 'onemore' | 'rest';
  /** The bear: 0 in the machine · 1 won, in her arms. */
  bear?: number;
  /**
   * First question on the stage — PICK THE MACHINE: three claw machines along the wall, each
   * with a lit sign on top (PRIZE EVERY GO, PRIZE EVERY TENTH GO, PRIZE NOW AND THEN), are
   * the things to tap. It is asked before the answer is shown.
   */
  machine?: boolean;
  /**
   * Second question on the stage — FIND IT IN YOUR POCKET: three phone screens held up on a
   * stand, A FEED YOU PULL TO REFRESH, AN ALARM CLOCK and A CALCULATOR, are the things to tap.
   */
  pocket?: boolean;
}

export const BEATS: Psych6Beat[] = [
  {
    bed: 'arcade',
    sfx: [{ id: 'thud', at: 0.6, gain: 0.6 }, { id: 'coinslot', at: 2.16, gain: 0.8 }],
    act: 'miss', bear: 0,
    speaker: 'bun',
    text: 'So close! Again, I’ll win the purple bear this time.',
    pace: ['brisk', 'even'],
    dur: 1.8,
  },
  {
    act: 'polish', bear: 0,
    speaker: 'plain',
    text: 'My finest machine. It lets you win just often enough to keep the coins coming.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'chalktap', at: 1.3, gain: 0.7 }],
    act: 'trap', bear: 0,
    speaker: 'tophat',
    text: 'That’s no accident. When a reward comes matters as much as the reward itself.',
    pace: 'even',
    dur: 2.1,
  },
  {
    bear: 0, machine: true,
    interact: {
      prompt: 'Which of these machines would keep her playing longest?',
      explain: 'The one that pays out now and then. She can’t tell when the next win is coming, so every go might be the one. A prize every go soon gets dull, and a fixed tenth go is easy to stop after.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    sfx: [{ id: 'crank', at: 5.24, gain: 0.7 }, { id: 'thud', at: 8.58, gain: 0.7 }],
    act: 'reinforce', bear: 0,
    speaker: 'tophat',
    text: 'A reward makes you more likely to do a thing again, and psychologists call that reinforcement. It works best when you can’t tell when it’s coming.',
    pace: ['weighty', 'even'],
    dur: 2.1,
  },
  {
    act: 'win', bear: 1,
    speaker: 'bun',
    text: 'I won! Now I just need the green one.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'smug', bear: 1,
    speaker: 'plain',
    text: 'Of course you do, nobody walks out after a win. I designed it that way, beautifully.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'phone', bear: 1,
    speaker: 'tophat',
    text: 'Your phone does the same thing. Pull the screen down, and sometimes there’s something new.',
    pace: 'even',
    dur: 2.1,
  },
  {
    bear: 1, pocket: true,
    interact: {
      prompt: 'Which of these works like the claw machine?',
      explain: 'The feed you pull to refresh. Sometimes there’s something new and sometimes there isn’t, so you keep pulling. An alarm and a calculator do the same thing every time.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    sfx: [{ id: 'coin', at: 3.6, gain: 0.7 }],
    act: 'onemore', bear: 1,
    speaker: 'bun',
    text: 'So my phone’s a claw machine I carry around. Right, I’m going home, straight after one more go.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'coinslot', at: 0.2, gain: 0.8 }],
    act: 'rest', bear: 1,
    quote: {
      id: 'lq-psychology-foundations-6-1',
      text: 'Men act upon the world, and change it, and are changed in turn by the consequences of their action.',
      author: 'B. F. Skinner',
      work: 'Verbal Behavior',
      era: '1957',
      branchSlugs: ['psychology'],
    },
    dur: 3.0,
  },
  {
    bear: 1,
    summary: {
      title: 'Why One More Go?',
      points: [
        'A reward makes a behaviour more likely, called reinforcement',
        'Unpredictable rewards keep people going longest',
        'Phones and games use the same trick',
      ],
      closing: 'Next time you can’t stop, ask what reward might be waiting.',
    },
    dur: 2.8,
  },
];

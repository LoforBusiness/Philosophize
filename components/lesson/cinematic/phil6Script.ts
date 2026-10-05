import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic philosophy-foundations-6, "Could You Have Chosen Otherwise?" — the sixth
// lesson on the Philosophy road, and a DIALOGUE lesson (LESSON_RULES group AP).
// Theme: A VICTORIAN FAIRGROUND AT NIGHT, A BRASS FORTUNE MACHINE, AND THREE SWEET JARS.
//
// Three people talk, and nobody narrates. A fairground attendant (the woman with the
// bun) runs the Mechanical Oracle, a brass fortune machine that prints your choice on a
// card before you make it; a customer (the plain mascot) insists nothing can predict
// him; the philosopher (the top hat) asks what that means for free will.
//
// A ROAD THAT RAMPS UP (group AU): the last lesson asked what makes a person the same
// person. This one asks whether that person is ever free, and it is harder: three ideas —
// every choice has causes that came before it · if so, could you have chosen otherwise? ·
// on one answer, you're free when you act on your own wants and nobody forces you.
//
// Every line is written for the ear (groups AC/AD), from its speaker’s character
// (cast.ts, AP14; group AS), and read at the pace its words ask for (AP17, AP21).
// ─────────────────────────────────────────────────────────────────────────────

export interface Phil6Beat extends BaseBeat {
  /**
   * What happens across this beat’s line (the scene choreographs it):
   * crank — the attendant cranks the brass machine; it hums and drops a card face down into its tray ·
   * pick — the customer strides up to the three jars, wavers, and snatches a fudge ·
   * flip — the attendant turns the card over and holds it up: FUDGE ·
   * causes — the philosopher, by the carousel rail, counts on his fingers ·
   * puzzle — he opens both hands, palms up ·
   * spite — the customer puts the fudge back and grabs a mint, glaring at the machine ·
   * second — the attendant pulls a second card from the tray and reads it, delighted ·
   * free — the philosopher points at the customer, then at the jars ·
   * toffee — the attendant takes the toffee jar into her arms ·
   * rest — everyone at ease under the quotation, the carousel lights turning behind.
   */
  act?: 'crank' | 'pick' | 'flip' | 'causes' | 'puzzle' | 'spite' | 'second' | 'free' | 'toffee' | 'rest';
  /** What the customer holds: 0 nothing · 1 the fudge · 2 the mint. */
  holds?: number;
  /**
   * First question on the stage — TRACE THE CAUSE: three things that could have decided his
   * pick, the oracle’s printed card, a pair of dice on the counter and the customer himself
   * (his own wants), are the things to tap.
   */
  cause?: boolean;
  /**
   * Second question on the stage — PICK A FORTUNE CARD: three cards fanned in the brass
   * hand of the machine, CHOSE FUDGE BECAUSE HE LOVES IT, SNEEZED and PAID UP BECAUSE A
   * BULLY MADE HIM, are the things to tap.
   */
  fortune?: boolean;
}

export const BEATS: Phil6Beat[] = [
  {
    bed: 'fair',
    sfx: [{ id: 'crank', at: 1.34, gain: 0.8 }, { id: 'cardflip', at: 3.28, gain: 0.8 }],
    act: 'crank', holds: 0,
    speaker: 'bun',
    text: 'Step up! The oracle prints your choice before you’ve even made it.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'jarlid', at: 3.35, gain: 0.7 }],
    act: 'pick', holds: 1,
    speaker: 'plain',
    text: 'Nobody predicts me, I’m a mystery even to myself. Fudge!',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'cardflip', at: 1.1, gain: 0.8 }],
    act: 'flip', holds: 1,
    speaker: 'bun',
    text: 'The card says fudge! It always knows.',
    pace: 'even',
    dur: 1.8,
  },
  {
    act: 'causes', holds: 1,
    speaker: 'tophat',
    text: 'Of course it does. You love fudge, you skipped lunch, and you hate being told what to do.',
    pace: 'even',
    dur: 2.1,
  },
  {
    act: 'puzzle', holds: 1,
    speaker: 'tophat',
    text: 'If every choice is caused by what came before it, could you ever have picked differently? That’s the puzzle of free will.',
    pace: ['even', 'weighty'],
    dur: 2.1,
  },
  {
    holds: 1, cause: true,
    interact: {
      prompt: 'The card only guessed. If every choice has a cause, what decided his pick?',
      explain: 'He did: his own wants, his hunger and his habits. The card only predicted the choice, and the dice played no part in it.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    sfx: [{ id: 'jarlid', at: 0.5, gain: 0.7 }, { id: 'crank', at: 1.66, gain: 0.8 }],
    act: 'spite', holds: 2,
    speaker: 'plain',
    text: 'Then I’ll take the mint instead, just to spite it.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'cardflip', at: 1.8, gain: 0.8 }],
    act: 'second', holds: 2,
    speaker: 'bun',
    text: 'Oh, there’s a second card! It says, he’ll take the mint, just to spite me.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'free', holds: 2,
    speaker: 'tophat',
    text: 'Here’s one answer. You’re free when you act on your own wants and nobody forces you, even if those wants have causes.',
    pace: 'even',
    dur: 2.1,
  },
  {
    holds: 2, fortune: true,
    interact: {
      prompt: 'Which card shows a choice made from his own wants, with nobody forcing him?',
      explain: 'Choosing fudge because he loves it. Nobody forced him, and the choice came from his own wants. A sneeze isn’t a choice, and paying a bully is forced.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    sfx: [{ id: 'jar', at: 2.18, gain: 0.7 }],
    act: 'toffee', holds: 2,
    speaker: 'bun',
    text: 'Then I’m free too. I’m freely choosing to eat all the toffee.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'rest', holds: 2,
    quote: {
      id: 'lq-philosophy-foundations-6-1',
      text: 'Man can do what he wills, but he cannot will what he wills.',
      author: 'Arthur Schopenhauer',
      work: 'On the Freedom of the Will',
      era: '1839',
      branchSlugs: ['philosophy'],
    },
    dur: 3.0,
  },
  {
    holds: 2,
    summary: {
      title: 'Could You Have Chosen Otherwise?',
      points: [
        'Every choice has causes that came before it',
        'So could you ever have chosen otherwise?',
        'One answer: you’re free when nobody forces your wants',
      ],
      closing: 'Next time you make a choice, ask what made you want it.',
    },
    dur: 2.8,
  },
];

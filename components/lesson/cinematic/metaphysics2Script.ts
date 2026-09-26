import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic metaphysics-being-2, "Something vs. Nothing".
// Theme: A MAGICIAN'S STAGE, AND A DOOR THAT OPENS ONTO NOTHING.
//
// A conjuror works his act while the lesson is read: a dove out of a hat that
// vanishes again (a contingent thing), the trick's hidden mechanism (a reason for
// everything), a hunt behind the curtain for the reason behind the stage itself.
// Then a painted temple descends for Parmenides, two stage doors roll in — IT IS and
// IT IS NOT — and the second opens onto a void he cannot step on, point into or
// think about.
//
// Redrawn 2026-09-26, one of six second lessons redesigned after the first-lesson
// sets; the owner asked for the stage to keep acting for the whole of every voiced
// line (see pace.ts). The narration is unchanged, word for word and beat for beat;
// both questions are new, and both are asked on the stage.
// ─────────────────────────────────────────────────────────────────────────────

export interface Meta2Beat extends BaseBeat {
  /** The magician's pose under his act. Bands per N2: <100 rig, 100+ held, 300+ played. */ e?: number;
  /** Where he stands: 196 at the table · 330 at the curtain · 236 by the doors · 296 at IT IS NOT. */ x?: number;
  /** The act he performs across this beat's line (the scene choreographs it). */
  act?: 'dove' | 'shake' | 'reveal' | 'search' | 'sweep' | 'bow' | 'doors' | 'step' | 'tries';
  /** The marquee asks WHY SOMETHING RATHER THAN NOTHING? (lit from its first beat on). */ ask?: boolean;
  /** How many of the easel's three cards are up: 1 the principle, 2 applied, 3 simpler. */ cards?: number;
  /** The painted temple has come down for Parmenides. */ temple?: boolean;
  /** The two stage doors, IT IS and IT IS NOT, have rolled in. */ doors?: boolean;
  /** The IT IS NOT door stands open onto the void. */ open?: boolean;
  /** Q1 on the stage: three hats — a horse, a unicorn, nothing at all. */ hats?: boolean;
  /** Q2 on the stage: three cards lowered from the flies. */ flies?: boolean;
}

export const BEATS: Meta2Beat[] = [
  {
    e: 167, x: 196, act: 'dove',
    text: 'A thing is contingent if it could have failed to exist. The universe appears to be contingent.',
    dur: 1.8,
  },
  {
    e: 459, x: 196, act: 'shake', ask: true,
    text: 'This raises the question why there is something rather than nothing. No answer to it is generally accepted.',
    dur: 2.1,
  },
  {
    e: 167, x: 196, act: 'reveal', ask: true, cards: 1,
    text: 'Gottfried Leibniz’s principle of sufficient reason holds that nothing is without a reason.',
    cite: 'The principle of sufficient reason',
    dur: 2.1,
  },
  {
    e: 456, x: 330, act: 'search', ask: true, cards: 2,
    text: 'The principle then applies to existence itself. There must be a reason why anything exists at all.',
    dur: 1.8,
  },
  {
    e: 459, x: 196, act: 'sweep', ask: true, cards: 3,
    text: 'Leibniz held that nothing is simpler and easier than something. So existence, not nothingness, is what requires a reason.',
    dur: 1.8,
  },
  {
    e: 158, x: 200, act: 'bow', ask: true, cards: 3, temple: true,
    text: 'Parmenides, more than two thousand years before Leibniz, asked whether there could be nothing at all.',
    cite: 'Parmenides, On Nature',
    dur: 1.8,
  },
  {
    e: 167, x: 236, act: 'doors', ask: true, cards: 3, temple: true, doors: true,
    text: 'In his poem On Nature, a goddess sets out two ways of inquiry. One says “it is”, and the other says “it is not”.',
    dur: 3.1,
  },
  {
    e: 161, x: 236, ask: true, cards: 3, temple: true, doors: true,
    quote: {
      id: 'lq-metaphysics-being-2-1',
      text: 'The same thing is there for thinking and for being.',
      author: 'Parmenides',
      philosopherId: 'parmenides',
      work: 'On Nature, fragment 3',
      era: 'c. 475 BCE',
      branchSlugs: ['metaphysics'],
    },
    dur: 3.0,
  },
  {
    e: 260, x: 296, act: 'step', ask: true, cards: 3, temple: true, doors: true, open: true,
    text: 'The goddess calls the second way wholly unlearnable. There’s nothing on it to find or follow.',
    cite: 'The second way',
    dur: 2.3,
  },
  {
    e: 260, x: 296, act: 'tries', ask: true, cards: 3, temple: true, doors: true, open: true,
    text: 'What is not cannot be walked on, pointed at, or thought about. It is not a genuine alternative to what is.',
    dur: 2.7,
  },
  {
    e: 178, x: 150, ask: true, cards: 3, temple: true, doors: true, open: true, hats: true,
    interact: {
      prompt: 'Three hats: a horse, a unicorn, nothing at all. Which can’t even be pictured coming out?',
      explain: 'Nothing at all. A unicorn doesn’t exist, yet you can still picture one leaving the hat, so not existing was never the obstacle. Nothing at all gives the mind no content to picture, which is Parmenides’ point.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    e: 178, x: 200, ask: true, cards: 3, temple: true, doors: true, open: true, flies: true,
    interact: {
      prompt: 'For Leibniz’s question to make sense, what must nothingness have been?',
      explain: 'Possible, and lost. Leibniz needs nothing to be a real option that lost to something. Parmenides says nothing was never an option. Then existence had no rival, and the question never comes up.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    x: 200, ask: true, cards: 3, temple: true, doors: true, open: true,
    summary: {
      title: 'The Riddle of Being',
      points: [
        'Leibniz: why something rather than nothing?',
        'His answer needs a necessary being',
        'Parmenides: what is not cannot be thought',
        'Reason settles this, not measurement',
      ],
      closing: 'If nothing was never available, existence didn’t beat the alternative. There was not one.',
    },
    dur: 2.8,
  },
];

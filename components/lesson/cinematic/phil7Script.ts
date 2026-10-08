import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic philosophy-foundations-7, "Philosophy Recap: Back to Athens" — the RECAP of
// the Philosophy road's first six lessons (LESSON_RULES group AV), and a DIALOGUE lesson
// (group AP).
// AV: recap
// Theme: THE ATHENIAN AGORA AT MORNING, A WAX TABLET AND A FOUNTAIN; THEN THE HARBOUR,
// A SUNDIAL AND AN OLD SHIP WITH NEW PLANKS.
//
// Two people talk, and nobody narrates. The philosopher (the top hat) is at his stone
// table in the agora, working through six questions on a wax tablet. The plain one, who
// was at the centre of four of them, arrives sure he remembers them all, and gets them
// wrong in his own grand way. The philosopher sets each one straight.
//
// WHAT IT RECAPS, LESSON BY LESSON (each line is taken from what that lesson said):
//   1 What Is Philosophy? — it asks what facts alone can't settle; its answers are reasons
//     anyone can test, and a vote or a loud voice settles nothing (beats 2–6).
//   2 What Makes an Argument Good? — true reasons, and a conclusion that follows from them;
//     attacking the person doesn't answer the reasons (beats 5–8).
//   3 How Do We Decide What's Right? — weigh who an act helps and harms, or follow a rule
//     whatever happens next (beats 9–11).
//   4 How Do You Know? — knowing needs a true belief and a good reason; a lucky guess isn't
//     knowledge (beats 14–16).
//   5 What Makes You You? — body or memories; a duplicate shows memories alone can't settle
//     who you are (beats 17–20).
//   6 Could You Have Chosen Otherwise? — every choice has causes; on one answer, you're free
//     when you act on your own wants and nobody forces you (beats 12–13).
//
// Every line is written for the ear (groups AC/AD), from its speaker's character (cast.ts,
// AP14; group AS), and spoken in the natural style (AP22).
// ─────────────────────────────────────────────────────────────────────────────

export interface Phil7Beat extends BaseBeat {
  /**
   * What happens across this beat (the scene choreographs it):
   * work — the philosopher alone at his stone table in the stoa: scratches on a wax
   *   tablet with a stylus, rubs out a line, eats a fig, looks up at the Acropolis ·
   * arrive — the plain one strolls in from the market, chin up, and leans on a column ·
   * bike — the philosopher draws a bicycle wheel on the tablet and taps it ·
   * boast — the plain one spreads his hands, very sure of himself ·
   * reasons — the philosopher holds the tablet up ·
   * crowd — the plain one waves at the market crowd behind him ·
   * insult — the plain one peers at the wax tablet and sniffs ·
   * argue — the philosopher writes two short lines on the tablet ·
   * purse — the plain one spots a leather purse on the fountain's rim and picks it up ·
   * weigh — the philosopher holds out both hands like the pans of a scale ·
   * handin — the plain one sets the purse on the official's table at the fountain ·
   * free — the philosopher nods at him, then at the purse ·
   * harbour — both walk down to the harbour; the plain one points at the sky ·
   * know — the philosopher points at the sundial ·
   * ship — the plain one pats the hull of an old ship with mismatched new planks ·
   * self — the philosopher taps the plain one's chest, then his own temple ·
   * copy — the philosopher holds up two fingers side by side: one of you, and a copy ·
   * rest — both at ease on the quay under the quotation, gulls and the sea behind.
   */
  act?: 'work' | 'arrive' | 'bike' | 'boast' | 'reasons' | 'crowd' | 'insult' | 'argue' | 'purse' | 'weigh' | 'handin' | 'free' | 'harbour' | 'know' | 'ship' | 'self' | 'copy' | 'rest';
  /** Where they are: 0 the agora · 1 the harbour. */
  place?: number;
  /** What the plain one holds: 0 nothing · 1 the purse. */
  holds?: number;
  /**
   * First question on the stage — CAST YOUR VOTE: three things on the stoa's table, a heap
   * of clay voting shards, a herald's bronze horn and the wax tablet with a reason on it,
   * are the things to tap.
   */
  vote?: boolean;
  /**
   * Second question on the stage — LOAD THE SCALES: three weights by a merchant's bronze
   * balance, ITS OWNER WILL GO HUNGRY, THE LAW SAYS RETURN IT and IT MATCHES MY SANDALS;
   * the one that belongs on the consequences pan is the one to tap.
   */
  scales?: boolean;
  /**
   * Third question on the stage — READ THE HOUR: three things on the quay, the sundial's
   * shadow, the plain one's hand on his heart (his feeling) and a gull overhead, are the
   * things to tap.
   */
  hour?: boolean;
}

export const BEATS: Phil7Beat[] = [
  {
    bed: 'market',
    sfx: [{ id: 'pencil', at: 1.2, gain: 0.7 }, { id: 'pencil', at: 2.6, gain: 0.7 }, { id: 'paper', at: 4.1, gain: 0.6 }, { id: 'pencil', at: 5.3, gain: 0.7 }],
    voiceAfter: 6.2,
    act: 'work', place: 0, holds: 0,
    speaker: 'tophat',
    text: 'Six questions, and not one of them easy.',
    pace: 'even',
    dur: 2.0,
  },
  {
    act: 'arrive', place: 0, holds: 0,
    speaker: 'plain',
    text: 'Found you. I was the star of most of those questions, you know.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'pencil', at: 1.4, gain: 0.7 }],
    act: 'bike', place: 0, holds: 0,
    speaker: 'tophat',
    text: 'You were in them, which isn’t the same thing. Remember the bicycle with the new frame and the new saddle?',
    pace: 'even',
    dur: 2.1,
  },
  {
    act: 'boast', place: 0, holds: 0,
    speaker: 'plain',
    text: 'Easy. New frame, new saddle, so it’s a new bicycle. Case closed.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'reasons', place: 0, holds: 0,
    speaker: 'tophat',
    text: 'You agreed on every fact and still couldn’t agree on the answer. That’s a philosophy question, and it’s settled by reasons.',
    pace: 'even',
    dur: 2.1,
  },
  {
    act: 'crowd', place: 0, holds: 0,
    speaker: 'plain',
    text: 'Then let’s ask the market. Everyone here agrees with me, so I’m right.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    place: 0, holds: 0, vote: true,
    interact: {
      prompt: 'Which of these could actually settle the bicycle question?',
      explain: 'The reason on the tablet. Anyone can test a reason. A heap of votes shows what’s popular, and a herald’s horn only makes it louder.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    act: 'insult', place: 0, holds: 0,
    speaker: 'plain',
    text: 'Says the man who still writes on wax.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'pencil', at: 1.0, gain: 0.7 }],
    act: 'argue', place: 0, holds: 0,
    speaker: 'tophat',
    text: 'That’s an attack on me, not on my reasons. A good argument needs true reasons, and a conclusion that follows from them.',
    pace: 'even',
    dur: 2.1,
  },
  {
    sfx: [{ id: 'water', at: 0.2, gain: 0.5 }, { id: 'coin', at: 2.1, gain: 0.7 }],
    act: 'purse', place: 0, holds: 1,
    speaker: 'plain',
    text: 'Oh, look, a purse on the fountain. Finders keepers.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'weigh', place: 0, holds: 1,
    speaker: 'tophat',
    text: 'There are two ways to decide what’s right. Ask who your choice helps and harms, or ask which rule it keeps, whatever happens next.',
    pace: 'even',
    dur: 2.1,
  },
  {
    place: 0, holds: 1, scales: true,
    interact: {
      prompt: 'Which weight belongs on the consequences pan?',
      explain: 'Its owner going hungry. That’s about who his choice harms, which is the consequences way. The law is a rule, whatever happens next, and his sandals are no reason at all.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    sfx: [{ id: 'coin', at: 1.6, gain: 0.7 }],
    act: 'handin', place: 0, holds: 0,
    speaker: 'plain',
    text: 'Fine, I’ll hand it in. Nobody’s making me, I just like looking good.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'free', place: 0, holds: 0,
    speaker: 'tophat',
    text: 'Then on one answer, you chose freely. Your wants have causes, but nobody forced them on you.',
    pace: 'even',
    dur: 2.1,
  },
  {
    bed: 'ship',
    act: 'harbour', place: 1, holds: 0,
    speaker: 'plain',
    text: 'My ship sails at noon, and I can feel that it’s noon. I’m never wrong about these things.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'know', place: 1, holds: 0,
    speaker: 'tophat',
    text: 'Even if you’re right, a feeling isn’t a reason. To know something, it has to be true, and you need a good reason for it.',
    pace: 'even',
    dur: 2.1,
  },
  {
    place: 1, holds: 0, hour: true,
    interact: {
      prompt: 'Which of these gives him a good reason to think it’s noon?',
      explain: 'The sundial. Its shadow follows the sun, so it tracks the time. A feeling can be a lucky guess, and a gull tells you nothing.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    sfx: [{ id: 'plank', at: 1.2, gain: 0.7 }],
    act: 'ship', place: 1, holds: 0,
    speaker: 'plain',
    text: 'And there’s my ship. Every plank’s been replaced, but it’s still mine.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'self', place: 1, holds: 0,
    speaker: 'tophat',
    text: 'Same puzzle as the teleporter. Are you your body, or what you remember?',
    pace: 'even',
    dur: 2.1,
  },
  {
    act: 'boast', place: 1, holds: 0,
    speaker: 'plain',
    text: 'What I remember, of course. It’s far too good to lose.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'copy', place: 1, holds: 0,
    speaker: 'tophat',
    text: 'A copy of you’d remember it all too. So memories alone can’t settle which one is you.',
    pace: 'even',
    dur: 2.1,
  },
  {
    act: 'rest', place: 1, holds: 0,
    quote: {
      id: 'lq-philosophy-foundations-7-1',
      text: 'It is not possible to step twice into the same river.',
      author: 'Heraclitus',
      work: 'Fragment 91, as quoted by Plutarch',
      era: 'c. 500 BC',
      branchSlugs: ['philosophy'],
    },
    dur: 3.0,
  },
  {
    place: 1, holds: 0,
    summary: {
      title: 'Philosophy Recap: Back to Athens',
      points: [
        'Philosophy settles questions with reasons, not votes',
        'Good arguments need true reasons that lead somewhere',
        'Knowing needs a true belief and a good reason',
      ],
      closing: 'Next time you’re sure of something, ask what your reason is, and whether it would stand up in the agora.',
    },
    dur: 2.8,
  },
];

import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic psychology-foundations-7, "Psychology Recap: The Old Laboratory" — the RECAP
// of the Psychology road's first six lessons (LESSON_RULES group AV), and a DIALOGUE
// lesson (group AP).
// AV: recap
// Theme: AN EARLY-1900S PSYCHOLOGY LABORATORY, A BRASS REACTION TIMER, A METRONOME, AN
// EYE CHART AND A DESK OF NOTEBOOKS; THEN A BUSY RAILWAY CONCOURSE, A DEPARTURES BOARD
// AND A CHOCOLATE MACHINE.
//
// The places, for the scene builder:
//   0 THE LABORATORY, about 1905, morning light through tall arched windows. Far: a wall of
//     dark wood panelling and glass-fronted cabinets of jars and instruments, a framed eye
//     chart (big E at the top, rows of letters shrinking), a blackboard with a reaction-time
//     graph. Middle: a long oak bench with a brass reaction timer (a round dial in a glass
//     dome, a telegraph key and wires), a wooden metronome, a tray with two white cups and a
//     coffee pot, stacks of leather notebooks, an open logbook, a green-shaded desk lamp.
//     Near: a parquet floor, a bentwood chair, a coat stand with an umbrella.
//   1 THE RAILWAY CONCOURSE, late morning. Far: a great arched iron-and-glass roof, steam,
//     a big hanging station clock, platform gates numbered 2 and 5. Middle: a black
//     split-flap departures board, a crowd of travellers with suitcases bunched at gate 2, a
//     porter's trolley. Near: a stone floor, a red chocolate machine with a coin slot and a
//     tray, a bench.
//
// Two people talk, and nobody narrates. The psychologist (the top hat) is alone at his bench
// at dawn, timing reactions and writing up six findings. The plain one, who was the subject
// of most of them, arrives sure he was the star, and repeats every mistake as he boasts. The
// psychologist sets each one straight, then walks him to his train, where he makes three more.
//
// WHAT IT RECAPS, LESSON BY LESSON (each line is taken from what that lesson said):
//   1 What Is Psychology? — the same coffee tasted different because of the label; the
//     change happened in his head; psychology studies how people think, feel and act;
//     nobody can watch their own mind, so psychologists test and count what people do
//     (beats 2–7).
//   2 Why Memory Gets Things Wrong — a memory isn't a recording, it's rebuilt each time and
//     the gaps are filled; feeling sure isn't being right; trust a record made once
//     (beats 10–12).
//   3 Why We See What We Expect — a label sets what you expect before you look and changes
//     what you see; look again without the hint and check the thing itself (beats 8–10).
//   4 Why We Follow the Crowd — when unsure, people copy others (social proof); often
//     sensible, but if nobody checks a crowd can be wrong together; check for yourself
//     (beats 13–15).
//   5 When the Saucer Doesn’t Come — clashing thoughts cause discomfort (cognitive
//     dissonance); people change the story to keep the belief; the more it cost, the harder
//     they cling (beats 16–17).
//   6 Why One More Go? — a reward makes a behaviour more likely (reinforcement), and a
//     reward you can't predict keeps people going longest (beats 18–19).
//
// Every line is written for the ear (groups AC/AD), from its speaker's character (cast.ts,
// AP14; group AS), and spoken in the natural style (AP22).
// ─────────────────────────────────────────────────────────────────────────────

export interface Psych7Beat extends BaseBeat {
  /**
   * What happens across this beat (the scene choreographs it):
   * work — the psychologist alone at his oak bench: presses the reaction timer's key and
   *   reads the dial, writes in a notebook, sets the metronome ticking, sips from a cup ·
   * arrive — the plain one strolls in through the door, chin up, and leans on a cabinet ·
   * cups — the psychologist lifts the two white cups off the tray, one with a gold label ·
   * boast — the plain one spreads his hands, very sure of himself ·
   * pot — the psychologist taps the one coffee pot both cups came from ·
   * insist — the plain one taps his own chest, then his temple ·
   * tally — the psychologist swaps the two cups' labels and draws a tally card ·
   * admire — the plain one bends over the brass reaction timer and its card, PRICELESS ·
   * card — the psychologist lifts the card off the timer and turns it face down ·
   * sticker — the plain one tips the timer, reads the sticker underneath, then waves at
   *   the floor where he’s sure something once broke ·
   * rebuild — the psychologist opens the logbook on the bench ·
   * concourse — both walk out onto the station concourse; the plain one joins the crowd
   *   at gate 2 ·
   * copy — the psychologist nods at the crowd, all looking at each other ·
   * missed — the plain one turns back from gate 5, ticket in hand, a train pulling out ·
   * story — the psychologist holds up the ticket, FIRST CLASS ·
   * machine — the plain one feeds a coin into the chocolate machine; one bar drops ·
   * reward — the psychologist folds his arms, watching him reach for another coin ·
   * rest — both on the bench under the quotation, the clock and the crowd behind.
   */
  act?: 'work' | 'arrive' | 'cups' | 'boast' | 'pot' | 'insist' | 'tally' | 'admire' | 'card' | 'sticker' | 'rebuild' | 'concourse' | 'copy' | 'missed' | 'story' | 'machine' | 'reward' | 'rest';
  /** Where they are: 0 the laboratory · 1 the railway concourse. */
  place?: number;
  /** What the plain one holds: 0 nothing · 1 his first-class ticket · 2 a chocolate bar. */
  holds?: number;
  /**
   * First question on the stage — RUN THE TEST: three things on the oak bench, the plain
   * one's notebook headed MY HONEST OPINION, the two cups with their labels swapped beside
   * a tally card, and the jar of coffee beans, are the things to tap.
   */
  test?: boolean;
  /**
   * Second question on the stage — FIND THE RECORD: three things in the laboratory, the
   * plain one's hand on his forehead (what he's sure he remembers), the logbook written on
   * the day, and the ticking metronome, are the things to tap.
   */
  record?: boolean;
  /**
   * Third question on the stage — FIND YOUR PLATFORM: three things on the concourse, the
   * crowd bunched at gate 2, the split-flap departures board and the big station clock,
   * are the things to tap.
   */
  platform?: boolean;
}

export const BEATS: Psych7Beat[] = [
  {
    bed: 'room',
    sfx: [{ id: 'stopwatch', at: 1.1, gain: 0.6 }, { id: 'pencil', at: 2.4, gain: 0.7 }, { id: 'stopwatch', at: 3.8, gain: 0.6 }, { id: 'cup', at: 5.1, gain: 0.6 }],
    voiceAfter: 6.2,
    act: 'work', place: 0, holds: 0,
    speaker: 'tophat',
    text: 'Six findings, and in every one, somebody fooled themselves.',
    pace: 'even',
    dur: 2.0,
  },
  {
    act: 'arrive', place: 0, holds: 0,
    speaker: 'plain',
    text: 'Morning. I hear I’m the star of most of your findings.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'cup', at: 1.2, gain: 0.6 }],
    act: 'cups', place: 0, holds: 0,
    speaker: 'tophat',
    text: 'You were the subject, which isn’t the same thing. Remember the two cups of coffee, and the gold label?',
    pace: 'even',
    dur: 2.1,
  },
  {
    act: 'boast', place: 0, holds: 0,
    speaker: 'plain',
    text: 'Of course, the gold one was far smoother. My tongue’s very refined.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'pot', place: 0, holds: 0,
    speaker: 'tophat',
    text: 'Both cups came from one pot, so the change happened in your head. Psychology studies how people think, feel and act.',
    pace: 'even',
    dur: 2.1,
  },
  {
    act: 'insist', place: 0, holds: 0,
    speaker: 'plain',
    text: 'Well, if a label had steered me, I’d have felt it. I know my own mind.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'pencil', at: 1.3, gain: 0.7 }],
    act: 'tally', place: 0, holds: 0,
    speaker: 'tophat',
    text: 'Nobody can watch their own mind at work, so psychologists don’t ask. They test you, and count what you do.',
    pace: 'even',
    dur: 2.1,
  },
  {
    place: 0, holds: 0, test: true,
    interact: {
      prompt: 'Which of these would show whether the gold label changed how the coffee tasted?',
      explain: 'The swapped cups and the tally card. If his favourite follows the label, the label did it. His honest opinion can’t see his own mind at work, and the coffee beans are the same in both cups.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    act: 'admire', place: 0, holds: 0,
    speaker: 'plain',
    text: 'Now this brass machine is magnificent. The card says priceless, and I can see why.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'paper', at: 0.8, gain: 0.6 }],
    act: 'card', place: 0, holds: 0,
    speaker: 'tophat',
    text: 'I wrote that card to catch you, because what you’re told first changes what you see. Look again without it, and check the thing itself.',
    pace: 'even',
    dur: 2.1,
  },
  {
    act: 'sticker', place: 0, holds: 0,
    speaker: 'plain',
    text: 'The sticker says kitchen timer, fine. But I remember every detail of my first visit: you dropped a whole tray of glasses.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'book', at: 0.5, gain: 0.6 }],
    act: 'rebuild', place: 0, holds: 0,
    speaker: 'tophat',
    text: 'It was one spoon. A memory isn’t a recording: your brain builds it again each time, and fills the gaps with whatever fits.',
    pace: 'even',
    dur: 2.1,
  },
  {
    place: 0, holds: 0, record: true,
    interact: {
      prompt: 'He’s sure it was a tray of glasses. Which of these could settle what was dropped that day?',
      explain: 'The logbook. It was written once, on the day, and it doesn’t rebuild itself. Feeling sure isn’t the same as being right, and the metronome only keeps time.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    bed: 'station',
    act: 'concourse', place: 1, holds: 1,
    speaker: 'plain',
    text: 'Right, my train. Everyone’s waiting at gate two, so that must be mine.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'copy', place: 1, holds: 1,
    speaker: 'tophat',
    text: 'When people are unsure, they copy what others do. That’s often sensible, but if nobody checks, a whole crowd can be wrong together.',
    pace: 'even',
    dur: 2.1,
  },
  {
    place: 1, holds: 1, platform: true,
    interact: {
      prompt: 'His ticket says the five past ten. Where should he look to find its platform?',
      explain: 'The departures board. It shows where the five past ten leaves, so he can check for himself. The crowd at gate two only copied each other, and the clock tells the time, not the platform.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    act: 'missed', place: 1, holds: 1,
    speaker: 'plain',
    text: 'Gate five, and the train has left. Well, I meant to miss that train, since first class is wasted this early.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'story', place: 1, holds: 1,
    speaker: 'tophat',
    text: 'Two thoughts just clashed, and that discomfort is called cognitive dissonance. So you changed the story, and the more the ticket cost, the harder you cling.',
    pace: 'even',
    dur: 2.1,
  },
  {
    sfx: [{ id: 'coin', at: 0.6, gain: 0.7 }],
    act: 'machine', place: 1, holds: 2,
    speaker: 'plain',
    text: 'No matter, this machine sometimes drops two bars. One more go, and I’m bound to win.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'reward', place: 1, holds: 2,
    speaker: 'tophat',
    text: 'A reward makes you do a thing again. That’s reinforcement, and it works best when you can’t tell when it’s coming.',
    pace: 'even',
    dur: 2.1,
  },
  {
    act: 'rest', place: 1, holds: 2,
    quote: {
      id: 'lq-psychology-foundations-7-1',
      text: 'Psychology has a long past, but only a short history.',
      author: 'Hermann Ebbinghaus',
      work: 'Psychology: An Elementary Text-Book (Abriss der Psychologie)',
      era: '1908',
      branchSlugs: ['psychology'],
    },
    dur: 3.0,
  },
  {
    place: 1, holds: 2,
    summary: {
      title: 'Psychology Recap: The Old Laboratory',
      points: [
        'Expectations change what you taste, see and remember',
        'People can’t watch their own minds, so test them',
        'Crowds, clashes and rewards steer what people do',
      ],
      closing: 'Next time you’re sure why you did something, ask what a psychologist would test.',
    },
    dur: 2.8,
  },
];

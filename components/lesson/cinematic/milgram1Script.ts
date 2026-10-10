import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic psychology-milgram-1, "The Memory Study That Wasn't" — the first lesson of
// Psychology's second unit, Stanley Milgram's obedience experiment (LESSON_RULES group AW),
// and a DIALOGUE lesson (group AP).
// AW: story
// Theme: A YALE OFFICE, A NEWSPAPER ON THE EICHMANN TRIAL, A CORKBOARD AND AN ADVERT;
// THEN A LABORATORY, A HAT OF PAPER SLIPS, A STRAP CHAIR, A ONE-WAY MIRROR AND A SHOCK GENERATOR.
//
// THE STORY. 1961: Adolf Eichmann is on trial in Jerusalem (April to December), saying he
// only carried out orders. Stanley Milgram, a 27-year-old assistant professor at Yale, asks
// whether ordinary people will hurt a stranger because an authority tells them to. He meant
// New Haven as a first run before testing Germans, and never needed to go. He advertises in
// the New Haven paper for "a study of memory": men aged 20 to 50, $4.00 for an hour plus
// 50 cents carfare, paid on arrival and theirs to keep whatever happens. In the Interaction
// Laboratory at Yale, the EXPERIMENTER is John Williams, a 31-year-old high school biology
// teacher, impassive and stern, in a grey technician's coat. The other "volunteer", known as
// Mr Wallace, is a mild, likeable 47-year-old accountant trained to act the part. A RIGGED
// DRAW: both slips say "Teacher", and Mr Wallace claims his says "Learner". He is strapped
// into a chair in the next room, with paste on his wrist "to avoid blisters and burns", and
// told the shocks can be extremely painful but cause no permanent tissue damage. The teacher
// sits at a SHOCK GENERATOR: 30 switches from 15 to 450 volts in 15-volt steps, labelled in
// groups from Slight Shock to Danger: Severe Shock, the last two marked only XXX. He gets a
// real sample shock of 45 volts. He reads word pairs ("blue box, nice day, wild duck"), then
// tests them ("blue: sky, ink, box, lamp"); the learner answers on a panel of four lights,
// and each wrong answer costs one switch higher, the voltage said out loud first. NOBODY
// ELSE IS SHOCKED: the wires to the learner go nowhere. If the teacher balks, four prods,
// in order: "Please continue", "The experiment requires that you continue", "It is
// absolutely essential that you continue", "You have no other choice, you must go on."
// Later, Milgram described the set-up to 39 psychiatrists, who predicted that only about
// one in a thousand would go to the end. In the first study (1963), 26 of 40 men (65%)
// went to 450 volts; no one stopped before 300, where the learner pounded on the wall.
// This lesson ends on that prediction; the result is lesson 2.
//
// SOURCES: Milgram, "Behavioral Study of Obedience", Journal of Abnormal and Social
// Psychology 67 (1963): the advert, the pay, the draw, the generator and its labels, the
// sample shock, the prods, the 26 of 40. Milgram, Obedience to Authority: An Experimental
// View (1974): Williams and the learner, the "blue" word pairs, the 39 psychiatrists and
// their one in a thousand, the plan to go on to Germany. Thomas Blass, The Man Who Shocked
// the World (2004): Milgram's age, the Eichmann trial running alongside.
//
// THE CAST, IN ROLE (AW2):
//   plain  — STANLEY MILGRAM, charcoal suit, clipboard (garb.ts milgram). He watches from
//            behind a one-way mirror. His vanity (AS3) is about his own clever design.
//   tophat — THE EXPERIMENTER, John Williams, grey lab coat (experimenter). Irritable (AS2)
//            with Milgram in the office; flat and stern on duty in the lab.
//   cap    — THE VOLUNTEER, the teacher, tweed jacket (volunteer). Kind and helpful (AS4):
//            he came to help with science and wants to be good at it.
//   (silent) MR WALLACE, the learner, cardigan (learner): smiles, nods, sits in the chair.
//   No woman's part in the 1961 baseline (women came only in a later variation), so no bun.
//
// UNIT PLAN (psychology-milgram, five lessons):
//   1 The Memory Study That Wasn't — the question, the advert, the rigged draw, the machine,
//     the first switches; ends on the psychiatrists' one-in-a-thousand.
//   2 Please Continue — the switches climb, the pounding at 300 volts, the four prods; 26 of 40.
//   3 Closer and Further — the variations: the learner in the room, the hand on the plate,
//     orders by telephone, a run-down office in Bridgeport, two peers who refuse.
//   4 Was It Fair? — the debriefing, Diana Baumrind's 1964 critique, the ethics codes after.
//   5 What Did It Really Show? — Gina Perry's archive work, the 2009 Burger replication,
//     and what "just following orders" means today.
//
// Every line is written for the ear (groups AC/AD), from its speaker's character (AS),
// and spoken in the natural style (AP22). No one in the story is really hurt, and the
// script says so (AW4).
// ─────────────────────────────────────────────────────────────────────────────

export interface Milgram1Beat extends BaseBeat {
  /**
   * What happens across this beat (the scene choreographs it):
   * paper — Milgram at his desk in a wood-panelled Yale office, autumn light through a tall
   *   window, reading a newspaper whose front page shows the Eichmann trial; he lowers it ·
   * enter — the experimenter comes in with a mug and sets it down on the desk, unimpressed ·
   * question — Milgram stands and writes on a small blackboard: ORDINARY MAN? ORDERS? ·
   * how — the experimenter folds his arms and leans on the filing cabinet ·
   * advert — Milgram pins a newspaper advert to the corkboard (STUDY OF MEMORY · $4.00) and
   *   tosses a grey lab coat onto the experimenter's shoulder ·
   * coat — the experimenter shrugs the coat on and buttons it, scowling ·
   * arrive — the laboratory: a bare room with a table, two chairs, a one-way mirror on the
   *   back wall, a door to a side room; the volunteer comes in turning his hat in his hands ·
   * pay — the experimenter counts four dollar bills and two quarters into the volunteer's
   *   palm and holds out a hat with two folded slips; Mr Wallace nods hello ·
   * slip — the volunteer unfolds his slip, reads it and smiles at Mr Wallace ·
   * strap — through the side-room door: Mr Wallace in a wooden chair, the experimenter
   *   buckling a strap across his forearm and dabbing paste on his wrist for the electrode ·
   * mirror — behind the one-way glass, Milgram taps his clipboard, pleased; a loose wire
   *   from the chair is seen to end in nothing ·
   * machine — the experimenter pulls a cover off the shock generator: a grey panel with a
   *   row of thirty toggle switches and their voltage labels ·
   * labels — the volunteer leans in and runs a finger along the labels to the last ones ·
   * sample — the experimenter straps a small electrode to the volunteer's wrist and presses
   *   one switch; a red lamp blinks; the volunteer jerks his hand ·
   * test — the volunteer, rubbing his wrist, reads from a card into a microphone ·
   * light — on the panel above the switches, one of four answer lamps lights: LAMP ·
   * first — the volunteer says the voltage and flips the first switch down; its lamp glows ·
   * guess — Milgram at the mirror writes on his clipboard: 1 in 1,000 ·
   * rest — the generator in the empty lab, one switch down, under the quotation.
   */
  act?: 'paper' | 'enter' | 'question' | 'how' | 'advert' | 'coat' | 'arrive' | 'pay' | 'slip' | 'strap' | 'mirror' | 'machine' | 'labels' | 'sample' | 'test' | 'light' | 'first' | 'guess' | 'rest';
  /** Where they are: 0 Milgram's office at Yale · 1 the Interaction Laboratory at Yale. */
  place?: number;
  /**
   * First question on the stage — RIG THE HAT: beside the experimenter's hat on the table,
   * three pairs of folded slips, opened to show their words: TEACHER + TEACHER, TEACHER +
   * LEARNER, LEARNER + LEARNER. The pair Milgram puts in the hat is the one to tap; it drops
   * into the hat.
   */
  slips?: boolean;
  /**
   * Second question on the stage — CALL THE SWITCH: before the story shows it, the reader
   * calls where most volunteers will stop. Three switches on the generator glow to be
   * tapped: 150 volts (STRONG SHOCK), 300 volts (INTENSE SHOCK) and 450 volts (XXX). The
   * one most of the forty men reached is the one to tap; the others stay dark.
   */
  call?: boolean;
}

export const BEATS: Milgram1Beat[] = [
  {
    bed: 'office', music: 'mbachebm',
    sfx: [{ id: 'pageturn', at: 1.0, gain: 0.6 }, { id: 'pageturn', at: 3.2, gain: 0.5 }, { id: 'chair', at: 4.6, gain: 0.45 }, { id: 'door', at: 'tail', gain: 0.65 }],
    voiceAfter: 6.0,
    act: 'paper', place: 0,
    speaker: 'plain',
    text: 'Adolf Eichmann’s on trial in Jerusalem. He sent millions to the death camps, and he says he was only following orders.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'mug', at: 3.4, gain: 0.6 }, { id: 'doorshut', at: 'tail', gain: 0.55 }],
    act: 'enter', place: 0,
    speaker: 'tophat',
    text: 'Every man at that trial says the same thing. Did you call me in to read me the newspaper?',
    pace: 'even',
    dur: 2.1,
  },
  {
    sfx: [{ id: 'paper', at: 0.4, gain: 0.5 }, { id: 'chalk', at: 1.95, gain: 0.6 }, { id: 'chalk', at: 3.25, gain: 0.5 }, { id: 'chalk', at: 4.25, gain: 0.55 }],
    act: 'question', place: 0,
    speaker: 'plain',
    text: 'I called you in for my brilliant question. Would an ordinary man hurt a stranger, just because someone in charge told him to?',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'how', place: 0,
    speaker: 'tophat',
    text: 'Lovely. And how do you test that at Yale without hurting anybody?',
    pace: 'even',
    dur: 2.1,
  },
  {
    sfx: [{ id: 'pin', at: 1.7, gain: 0.7 }, { id: 'whoosh', at: 5.2, gain: 0.5 }],
    act: 'advert', place: 0,
    speaker: 'plain',
    text: 'I’ve put an advert in the New Haven paper. A study of memory, four dollars an hour, and you’ll run it in a grey lab coat.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'coat', place: 0,
    speaker: 'tophat',
    text: 'A biology teacher in a lab coat, running a memory study that isn’t one. Wonderful.',
    pace: 'even',
    dur: 2.1,
  },
  {
    bed: 'room',
    sfx: [{ id: 'chair', at: 1.2, gain: 0.5 }, { id: 'doorshut', at: 'tail', gain: 0.55 }],
    act: 'arrive', place: 1,
    speaker: 'cap',
    text: 'Good afternoon, I’m here for the memory study. Do I keep the money, even if my memory’s no good?',
    pace: 'even',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'cardflip', at: 0.45, gain: 0.5 }, { id: 'coin', at: 1.4, gain: 0.6 }, { id: 'coin', at: 1.9, gain: 0.5 }],
    act: 'pay', place: 1,
    speaker: 'tophat',
    text: 'It’s yours just for coming. Now, you and Mr Wallace each draw a slip from this hat.',
    pace: 'even',
    dur: 2.1,
  },
  {
    place: 1, slips: true,
    interact: {
      prompt: 'Milgram needs every real volunteer to be the teacher. Which pair of slips goes in the hat?',
      explain: 'The pair that both say teacher. The volunteer drew first and read teacher, and Mr Wallace just pretended his said learner. The mixed pair could have put the actor at the switches, and two learner slips would have done it every time.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    sfx: [{ id: 'paper', at: 0.45, gain: 0.6 }],
    act: 'slip', place: 1,
    speaker: 'cap',
    text: 'I’m the teacher! Bad luck, Mr Wallace, but I’ll go easy on you.',
    pace: 'even',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'jarlid', at: 0.35, gain: 0.5 }, { id: 'coin', at: 2.75, gain: 0.45 }, { id: 'chair', at: 4.3, gain: 0.4 }],
    act: 'strap', place: 1,
    speaker: 'tophat',
    text: 'This paste stops any burns. The shocks can be very painful, but they cause no permanent tissue damage.',
    pace: 'even',
    dur: 2.1,
  },
  {
    sfx: [{ id: 'knock', at: 0.85, gain: 0.5 }, { id: 'knock', at: 1.25, gain: 0.45 }],
    act: 'mirror', place: 1,
    speaker: 'plain',
    text: 'Mr Wallace is an accountant I hired to act. The wires to his chair go nowhere, so he’ll never feel a thing.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'whoosh', at: 0.65, gain: 0.55 }],
    act: 'machine', place: 1,
    speaker: 'tophat',
    text: 'This is the shock generator. Thirty switches, from fifteen volts up to four hundred and fifty.',
    pace: 'even',
    dur: 2.1,
  },
  {
    act: 'labels', place: 1,
    speaker: 'cap',
    text: 'The labels go from slight shock up to danger, severe shock. The last two just say three X’s.',
    pace: 'even',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'toggle', at: 3.25, gain: 0.7 }],
    act: 'sample', place: 1,
    speaker: 'tophat',
    text: 'Hold out your wrist. Here’s a real shock of forty-five volts, so you know what he’ll feel.',
    pace: 'even',
    dur: 2.1,
  },
  {
    sfx: [{ id: 'paper', at: 1.4, gain: 0.5 }],
    act: 'test', place: 1,
    speaker: 'cap',
    text: 'That stung! Now, Mr Wallace, which goes with blue: sky, ink, box, or lamp?',
    pace: 'even',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'toggle', at: 0.55, gain: 0.4 }],
    act: 'light', place: 1,
    speaker: 'tophat',
    text: 'The learner’s light says lamp, and that’s wrong. Say the voltage, then press the first switch.',
    pace: 'even',
    dur: 2.1,
  },
  {
    sfx: [{ id: 'toggle', at: 1.4, gain: 0.75 }],
    act: 'first', place: 1,
    speaker: 'cap',
    text: 'Fifteen volts. Sorry, Mr Wallace, I’m sure it’s only nerves.',
    pace: 'even',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'scribble', at: 0.7, gain: 0.55 }, { id: 'tear', at: 2.6, gain: 0.55 }],
    act: 'guess', place: 1,
    speaker: 'plain',
    text: 'Later, I’ll describe all this to thirty-nine psychiatrists. They’ll guess that one man in a thousand goes to the very end.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    place: 1, call: true,
    interact: {
      prompt: 'Experts guessed one in a thousand would reach the end. Where did most of the forty men stop?',
      explain: 'The last switch, four hundred and fifty volts. Twenty-six of the forty went all the way. Nobody stopped at the strong shock, and only five stopped at three hundred, the first point where anyone quit.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    sfx: [{ id: 'breaker', at: 0.15, gain: 0.6 }],
    act: 'rest', place: 1,
    quote: {
      id: 'lq-psychology-milgram-1-1',
      text: 'Obedience is as basic an element in the structure of social life as one can point to.',
      author: 'Stanley Milgram',
      work: 'Obedience to Authority: An Experimental View, ch. 1 (1974)',
      era: '1974',
      branchSlugs: ['psychology'],
    },
    dur: 3.0,
  },
  {
    place: 1,
    summary: {
      title: 'The Memory Study That Wasn’t',
      points: [
        'Milgram asked if ordinary people would obey orders to hurt',
        'A rigged draw always made the real volunteer the teacher',
        'The learner was an actor, and his shocks were never real',
      ],
      closing: 'Experts expected almost nobody to reach the last switch. Next, the switches climb, and the experimenter says, please continue.',
    },
    dur: 2.8,
  },
];

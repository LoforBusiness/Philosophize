import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic psychology-foundations-1, "What Is Psychology?" — the first lesson on the
// Psychology road, and a DIALOGUE lesson (LESSON_RULES group AP).
// Theme: A CAFÉ COUNTER, ONE POT OF COFFEE, TWO CUPS AND TWO LABELS.
//
// Three people talk, and nobody narrates. The taster (the plain mascot) is sure he can
// tell cheap coffee from good; the server (the woman with the bun, cheerful and a step
// behind) has poured both cups from one pot without noticing; the psychologist (the
// top hat) turns the mistake into the subject.
//
// A FOUNDATION LESSON (AP3): what the subject is and why it is worth the reader's
// time, in three ideas and no more — the study of mind and behaviour, how poorly we see our own minds, and why psychology tests.
//
// Every line is written for the ear (groups AC/AD), from its speaker's character
// (cast.ts, AP14), and read in that speaker's voice. `markup` adds only pauses; the
// screen always shows `text`.
// ─────────────────────────────────────────────────────────────────────────────

export interface Psych1Beat extends BaseBeat {
  /**
   * What happens across this beat's line (the scene choreographs it):
   * boast — the taster steps up to the counter, sure of himself ·
   * pour — beside the two poured cups the server stands a label by each, from under the
   *        counter: BARGAIN by the left cup, then GOLD by the right ·
   * taste — the taster sips one cup, then the other, and pushes the bargain cup away ·
   * reveal — the server lifts the one coffee pot to show it ·
   * arrive — the psychologist walks in and tips his hat ·
   * define — the psychologist taps his own head, then opens a hand to the taster ·
   * sure — the taster folds his arms ·
   * method — the server swaps the two labels round as the psychologist describes it ·
   * again — the taster sips both again and keeps the cup now labelled GOLD ·
   * rest — everyone at ease under the quotation.
   */
  act?: 'boast' | 'pour' | 'taste' | 'reveal' | 'arrive' | 'define' | 'sure' | 'method' | 'again' | 'rest';
  /** The psychologist is on the stage. He walks in on `arrive`. */
  th?: boolean;
  /** The two labels have changed places (from `method` on). */
  swap?: boolean;
  /** Q1 on the stage: the pot, the cup and the gold label are the three things to tap. */
  q1?: boolean;
  /** Q2 on the stage: the café’s chalk menu board shows three rows to tap. */
  q2?: boolean;
}

export const BEATS: Psych1Beat[] = [
  {
    act: 'boast',
    speaker: 'plain',
    text: 'I can always tell cheap coffee from the good stuff. Always.',
    markup: 'I can always tell cheap coffee from the good stuff. [pause short] Always.',
    dur: 1.8,
  },
  {
    act: 'pour',
    speaker: 'bun',
    text: 'Perfect, two cups! This one’s from the bargain tin, and this one’s the gold label.',
    markup: 'Perfect, two cups! [pause short] This one’s from the bargain tin, and this one’s the gold label.',
    dur: 1.8,
  },
  {
    act: 'taste',
    speaker: 'plain',
    text: 'The gold one, of course, so smooth. The other tastes like a wet sock.',
    markup: 'The gold one, of course, so smooth. [pause short] The other tastes like a wet sock.',
    dur: 1.8,
  },
  {
    act: 'reveal',
    speaker: 'bun',
    text: 'Oh, that’s funny, I only made one pot. They’re both the same coffee.',
    markup: 'Oh, that’s funny, I only made one pot. [pause short] They’re both the same coffee.',
    dur: 1.8,
  },
  {
    act: 'arrive', th: true,
    speaker: 'tophat',
    text: 'Same coffee, and a different taste. The change happened in his head, and that’s where psychology looks.',
    markup: 'Same coffee, and a different taste. [pause short] The change happened in his head, and that’s where psychology looks.',
    dur: 2.1,
  },
  {
    th: true, q1: true,
    interact: {
      prompt: 'What made the gold cup taste better to him?',
      explain: 'The gold label. The coffee was the same, so the difference came from what he expected. Expectation changes what people taste, see and remember.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    act: 'define', th: true,
    speaker: 'tophat',
    text: 'Psychology is the study of how people think, feel and act. Its first lesson is that we’re poor witnesses of our own minds.',
    markup: 'Psychology is the study of how people think, feel and act. [pause short] Its first lesson is that we’re poor witnesses of our own minds.',
    dur: 2.1,
  },
  {
    act: 'sure', th: true,
    speaker: 'plain',
    text: 'I’d have noticed, of course. If anyone had warned me it was a test.',
    markup: 'I’d have noticed, of course. [pause short] If anyone had warned me it was a test.',
    dur: 1.8,
  },
  {
    act: 'method', th: true, swap: true,
    speaker: 'tophat',
    text: 'The taster is still sure, so a psychologist doesn’t ask him. You swap the labels, pour again and count what he does.',
    markup: 'The taster is still sure, so a psychologist doesn’t ask him. [pause short] You swap the labels, pour again and count what he does.',
    dur: 2.1,
  },
  {
    th: true, swap: true, q2: true,
    interact: {
      prompt: 'How do you check that the label did it?',
      explain: 'Swap the labels and test again. If his favourite follows the label, the label did it. Asking him won’t work, because nobody can watch their own mind at work.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    act: 'again', th: true, swap: true,
    speaker: 'bun',
    text: 'The taster picked the gold one again, and that’s the bargain tin! Should I tell him?',
    markup: 'The taster picked the gold one again, and that’s the bargain tin! [pause short] Should I tell him?',
    dur: 1.8,
  },
  {
    act: 'rest', th: true, swap: true,
    quote: {
      id: 'lq-psychology-foundations-1-1',
      text: 'Psychology is the Science of Mental Life, both of its phenomena and of their conditions.',
      author: 'William James',
      work: 'The Principles of Psychology',
      era: '1890',
      branchSlugs: ['psychology'],
    },
    dur: 3.0,
  },
  {
    th: true, swap: true,
    summary: {
      title: 'What Is Psychology?',
      points: [
        'Psychology studies how people think, feel and act',
        'People can’t see their own minds clearly',
        'So psychologists test, and count what people do',
      ],
      closing: 'Next time you’re sure why you like something, wonder what else is steering you. That doubt is where psychology begins.',
    },
    dur: 2.8,
  },
];

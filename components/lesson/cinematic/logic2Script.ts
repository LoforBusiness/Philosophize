import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic logic-arguments-2, "The Parts of an Argument".
// Theme: A STONEMASON'S YARD, AND A CRANE THAT BUILDS AN ARGUMENT OUT OF STONE.
//
// A tower crane lowers two stones for a base and a third across them, and a mason
// guides them in. The stones become the parts of an argument: the base the premises,
// stamped BECAUSE and SINCE; the top the conclusion, stamped THEREFORE. He carves
// Socrates' syllogism into them; the crane cannot pull the conclusion off; and when
// the premises are slid out from under it, it falls.
//
// Redrawn 2026-09-26, one of six second lessons redesigned after the first-lesson
// sets; the owner asked for the stage to keep acting for the whole of every voiced
// line (see pace.ts), and for this lesson to have two questions like the others.
// Every voiced line is unchanged and keeps its index — the voice is keyed by it;
// the third question, which came after the last voiced line, is gone. Both questions
// are new and asked on the stage.
// ─────────────────────────────────────────────────────────────────────────────

export interface Logic2Beat extends BaseBeat {
  /** The mason's pose under his act. Bands per N2: <100 rig, 100+ held, 300+ played. */ g?: number;
  /** Where he stands: 300 by the crane, clear of the right-hand stone. */ x?: number;
  /** The crane's and the mason's act across this beat's line (the scene choreographs it). */
  act?: 'lower1' | 'lower2' | 'lowerKey' | 'trace' | 'stampBase' | 'support' | 'stampTop' | 'carve' | 'tug' | 'pull' | 'rebuild';
  /** How many stones are in place: 1, 2, or 3 with the conclusion on top. */ stones?: number;
  /** The dashed outline of the form is drawn round the three. */ form?: boolean;
  /** The base stones carry PREMISE plates and their BECAUSE / SINCE stamps. */ premises?: boolean;
  /** The top stone carries its CONCLUSION plate. */ conclusion?: boolean;
  /** THEREFORE · SO · THUS are stamped over the conclusion. */ marks?: boolean;
  /** Socrates' syllogism is carved into the three stones. */ carved?: boolean;
  /** The therefore-sign ∴ is struck on the conclusion. */ sign?: boolean;
  /** The premises are slid out and the conclusion lies on the ground. */ fallen?: boolean;
  /** Q1 on the stage: two stamps hanging from the hook. */ stamps?: boolean;
  /** Q2 on the stage: the crane's control box. */ controls?: boolean;
}

export const BEATS: Logic2Beat[] = [
  {
    g: 167, x: 300, act: 'lower1', stones: 1,
    text: 'In logic, an argument is a set of claims, some of which are offered as reasons for another.',
    dur: 2.6,
  },
  {
    g: 459, x: 300, act: 'lower2', stones: 2,
    text: 'Every argument, however long, is built from the same basic parts. Once you can identify them, you can analyse any argument.',
    dur: 3.2,
  },
  {
    g: 167, x: 300, act: 'lowerKey', stones: 3,
    text: 'Two stones form a base, and a third rests on top. The top stone stands only because the two below support it.',
    dur: 1.8,
  },
  {
    g: 459, x: 300, act: 'trace', stones: 3, form: true,
    text: 'This shape is the basic form of an argument: claims below that support a claim above.',
    dur: 1.8,
  },
  {
    g: 167, x: 300, act: 'stampBase', stones: 3, form: true, premises: true,
    text: 'The stones at the base are the premises, the reasons offered for a claim. The words “because” and “since” often introduce a premise.',
    dur: 4.2,
  },
  {
    g: 158, x: 300, act: 'support', stones: 3, form: true, premises: true, conclusion: true,
    text: 'The stone on top is the conclusion, the claim the premises support. In a deduction, Aristotle held, the conclusion follows of necessity.',
    cite: 'Aristotle, Prior Analytics',
    dur: 2.8,
  },
  {
    g: 167, x: 300, act: 'stampTop', stones: 3, form: true, premises: true, conclusion: true, marks: true,
    text: 'The words “therefore”, “so” and “thus” often introduce a conclusion.',
    dur: 1.8,
  },
  {
    g: 260, x: 300, stones: 3, form: true, premises: true, conclusion: true, marks: true, stamps: true,
    interact: {
      prompt: 'Two stamps hang from the hook. Which word would mark the top stone?',
      explain: '“Therefore” marks the conclusion, the claim the reasons support. “Because” marks a premise, one of the reasons given for it.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    g: 459, x: 300, act: 'carve', stones: 3, form: true, premises: true, conclusion: true, marks: true, carved: true,
    text: 'This is the standard example of a syllogism, the form of argument Aristotle first analysed.',
    dur: 4.0,
  },
  {
    g: 167, x: 300, act: 'tug', stones: 3, form: true, premises: true, conclusion: true, marks: true, carved: true, sign: true,
    text: 'If both premises are true, the conclusion can’t be false. That’s what Aristotle meant by a conclusion that follows of necessity.',
    cite: 'Aristotle, Prior Analytics',
    dur: 4.4,
  },
  {
    g: 260, x: 300, stones: 3, form: true, premises: true, conclusion: true, marks: true, carved: true, sign: true, controls: true,
    interact: {
      prompt: 'The crane is about to slide both premises out. What will the top stone have under it?',
      explain: 'Nothing at all. A conclusion is a claim that premises support. Take them away and there’s no inference left, only a bare claim with no reason to believe it.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    g: 178, x: 300, act: 'pull', stones: 3, form: true, premises: true, conclusion: true, marks: true, carved: true, sign: true, fallen: true,
    text: 'Remove the premises and nothing supports the conclusion. The premises are what give anyone a reason to accept it.',
    dur: 3.8,
  },
  {
    g: 260, x: 300, act: 'rebuild', stones: 3, form: true, premises: true, conclusion: true, marks: true, carved: true, sign: true,
    quote: {
      id: 'lq-logic-arguments-2',
      text: 'A deduction is a discourse in which, certain things being stated, something other than what is stated follows of necessity.',
      author: 'Aristotle',
      philosopherId: 'aristotle',
      work: 'Prior Analytics',
      era: 'c. 350 BCE',
    },
    dur: 2.6,
  },
  {
    stones: 3, form: true, premises: true, conclusion: true, marks: true, carved: true, sign: true,
    summary: {
      title: 'The Parts of an Argument',
      points: [
        'Premises are the reasons offered for a conclusion',
        '“Because” and “since” often introduce a premise',
        '“Therefore” and “thus” often introduce a conclusion',
        'Take the premises away and nothing supports the conclusion',
      ],
      closing: 'Identifying the premises and the conclusion is the first step in assessing any argument.',
    },
    dur: 2.8,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// THE COPY THE TWO NEW CONTROLS NEED, AUTHORED RATHER THAN DERIVED.
//
// `convert-controls.mjs` moves the STRUCTURE — `field` → `poll`, `lever` →
// `sort` — carrying every `reads` string across verbatim. It cannot invent the
// rest: a poll needs a question and, where the record supports one, the names of
// people who actually held each position; a sort needs the thing being
// classified and a name for each bin. Those are written here, per question, and a
// question with no entry is left on its old control and reported rather than
// converted half-way.
//
// Keyed on `<lesson>#<first option's reads>` — the QUESTION's own words, the same
// identity `seedFor` uses, so re-cutting the narration around it cannot silently
// re-point an entry at a different question.
//
// ── TWO RULES FOR THE PROMPTS ───────────────────────────────────────────────
//
// A reader said the questions take "a long time to understand what is actually
// being said". Measured, 132 of 368 prompts in the app name the CONTROL rather
// than asking anything — "Set the lever to what the human maker adds", "Place the
// token on the forgery", "Slide the seam to where the meaning lives". A reader
// who has understood the lesson perfectly still has to work out what the sentence
// wants them to do with their thumb.
//
//   1. A prompt is a QUESTION, in words the reader could answer out loud. If it
//      cannot end in a question mark it is probably an instruction.
//   2. It never names the control. The control is on the screen; the reader can
//      see it. Naming it spends the one sentence that could have been the
//      question on describing furniture.
//
// ── AND ONE RULE FOR THE HOLDERS ────────────────────────────────────────────
//
// Named people only, and only where the attribution is uncontroversial and the
// lesson already stands behind it. There is no `share` field anywhere in this
// file or in `PollOption`, because there is no honest source in this app for
// "68% of philosophers say X" and a type that cannot express a number is the only
// reliable guard against one being typed. A position with no entry simply shows
// no names, which is the truth: not recorded here.
// ─────────────────────────────────────────────────────────────────────────────

/** field → poll. `holders` is optional and keyed by option id. */
export const POLL_COPY = {
  'aesthetics13#same to look at, different painters': {
    prompt: 'What makes something a forgery?',
  },
  'aesthetics2#made-up people, and real tears': {
    prompt: 'You cry at a film you know is invented. What is actually happening?',
  },
  'aesthetics31#hard, and it says nothing': {
    prompt: 'Where does sheer difficulty, on its own, land?',
  },
  'aesthetics6#overwhelming, and shot through with terror': {
    prompt: 'Which one of these is the sublime?',
    holders: { sublime: ['Burke', 'Kant'] },
  },
  'epistemology14#two worlds, one experience: nothing can tell them apart': {
    prompt: 'What has to be true for the vat scenario to work at all?',
  },
  'epistemology20#checked it themselves, and unknown': {
    prompt: 'Whose report is actually worth something?',
  },
  'epistemology23#incurious, and easily sold': {
    prompt: 'Which of these is the good thinker?',
  },
  'ethics31#you could not, and you arranged that': {
    prompt: 'When does "ought implies can" stop excusing you?',
  },
  'ethics7#identical choices, opposite verdicts: only luck differed': {
    prompt: 'What happened to the two drivers?',
    holders: { luck: ['Williams', 'Nagel'] },
  },
  'logic16#five times, and still only a pattern': {
    prompt: 'What have five mornings actually established?',
  },
  'logic21#beside the point': {
    prompt: 'For the fire, is a lit match needed, enough, both, or neither?',
  },
  'logic9#bad reasoning, true conclusion: this happens constantly': {
    prompt: 'A terrible argument that the sun will rise. Which is it?',
  },
  'metaphysics14#doubted for centuries, and true in every world': {
    prompt: 'What kind of truth is "water is H₂O"?',
    holders: { water: ['Kripke'] },
  },
  'metaphysics21#presentism: only now': {
    prompt: 'Which one says every moment is equally real?',
    holders: {
      presentism: ['Prior'],
      block: ['Broad'],
      eternal: ['Smart', 'Quine'],
      // `shrink` gets none on purpose. The lesson's own words for it are "almost
      // nobody holds it", and an empty row saying so is the most honest thing on
      // the ballot.
    },
  },
  'metaphysics32#the same, sharing one place': {
    prompt: 'Where do the two spheres actually sit?',
  },
  'metaphysics8#the chain breaks, and freedom lives in the gap': {
    prompt: 'Where does the third camp actually stand?',
    holders: { compat: ['Hume', 'Frankfurt'], hard: ["d'Holbach"], gap: ['Kane'] },
  },
  'political13#nobody agreed to it, and somebody is really harmed': {
    prompt: 'Which of these is harm rather than offence?',
    holders: { harm: ['Mill'] },
  },
  'political15#hidden, and no penalty taken: a crime': {
    prompt: 'Smashing windows by night, then hiding. Is that civil disobedience?',
    holders: { open: ['Rawls', 'King'] },
  },
  'political22#ordered about, by someone who may': {
    prompt: 'A servant with a kind master. Free, or not?',
    holders: { servant: ['Pettit', 'Skinner'] },
  },
  'political32#never decides, still worth doing': {
    prompt: 'Your vote will not decide it. Why is voting still rational?',
  },
  'political8#identical crates, and one person staring at wood': {
    prompt: 'What did the identical crates actually give them?',
  },
  'valid3#broken form, true conclusion': {
    prompt: '"Grass is green, so the sky is blue." What is wrong with it?',
  },
};

/** lever -> sort. Authored in its own file; re-exported so the codemod has one import. */
export { SORT_COPY } from './controlsort.mjs';

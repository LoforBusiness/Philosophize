// ─────────────────────────────────────────────────────────────────────────────
// SIXTY-SIX PROMPTS THAT DESCRIBED A WIDGET INSTEAD OF ASKING A QUESTION.
//
// "Drag to what Plato put first." "Slide the seam to where the meaning lives."
// A reader who has followed the lesson perfectly still has to translate that into
// a question before they can answer it, and the sentence that could have carried
// the question was spent naming a control they can already see.
//
// The rule, and it is the whole of it: **a prompt is a question the reader could
// answer out loud.** Nothing about it names the control.
//
// ── WHAT IS DELIBERATELY NOT IN HERE ────────────────────────────────────────
//
// "Drag the swab across. Stop where you would put it down." and "Slide the
// viewfinder." stay exactly as they are. The swab and the viewfinder are objects
// the SCENE draws, and telling the reader to move one is telling them about the
// lesson — the picture and the sentence agreeing, which is A1. The first version
// of the detector flagged both, and that is the difference between a rule that
// finds a defect and a rule that finds a pattern.
//
// Keyed `<lesson>#<the old prompt>`, so an entry can only ever rewrite the exact
// sentence it was written against.
// ─────────────────────────────────────────────────────────────────────────────

export const PROMPT_COPY = {
  // ── the rail ──────────────────────────────────────────────────────────────
  'aesthetics10#Drag to what Plato put first.': 'What did Plato put first?',
  'aesthetics16#Drag to what learning it actually changed.': 'What did learning it actually change?',
  'aesthetics19#Drag to what Carlson says a marsh needs from you.': 'What does Carlson say a marsh needs from you?',
  'aesthetics3#Drag to what Plato actually did about music.': 'What did Plato actually do about music?',
  'epistemology10#Drag to how firmly a fallibilist actually holds it.': 'How firmly does a fallibilist actually hold it?',
  'epistemology17#Drag to what it takes to end a paradigm.': 'What does it take to end a paradigm?',
  'epistemology21#Drag to how much of what you believe is up to you.': 'How much of what you believe is up to you?',
  'epistemology32#Drag to how much detail a good model keeps.': 'How much detail does a good model keep?',
  'epistemology4#Drag to how much a rationalist says comes before experience.': 'How much does a rationalist say comes before experience?',
  'epistemology7#Drag to what Hume says we should do about induction.': 'What does Hume say we should do about induction?',
  'epistemology#Drag to what turns a true belief into knowledge.': 'What turns a true belief into knowledge?',
  'ethics10#Drag to how much you must accept for the argument to work.': 'How much must you accept for the argument to work?',
  'ethics16#Suppose every choice you make was already fixed by earlier causes. Drag to how much blame survives.': 'Suppose every choice you make was already fixed by earlier causes. How much blame survives?',
  'ethics19#Drag to what the harm principle actually allows here.': 'What does the harm principle actually allow here?',
  'ethics32#Drag to how much weight another person can carry here.': 'How much weight can another person carry here?',
  'ethics4#Drag to what this kind of relativism claims.': 'What does this kind of relativism claim?',
  'ethics8#Drag to what caring actually is here.': 'What does caring actually amount to here?',
  'ethics#Drag to how much of a conscience the apes already have.': 'How much of a conscience do the apes already have?',
  'logic11#Drag to how much support a circle actually gives.': 'How much support does a circle actually give?',
  'logic15#Drag to what would actually fix this argument.': 'What would actually fix this argument?',
  'logic35#Drag to what actually cuts the hidden causes.': 'What actually cuts the hidden causes?',
  // Q2: the first rewrite shared 0.27 of its words with logic7's neighbouring
  // question ('The pavement is dry. What does that tell you about the rain?').
  // Two adjacent lessons asking the same sentence is what check-echo exists for.
  'logic8#Drag to what no rain actually tells you about the streets.': 'Suppose it never rained. What follows about the streets?',
  'metaphysics10#Drag to where Aristotle puts redness.': 'Where does Aristotle put redness?',
  'metaphysics12#Drag to what is left of the self once the owner goes.': 'What is left of the self once the owner goes?',
  'metaphysics15#Drag to how much of the cause you actually see.': 'How much of the cause do you actually see?',
  'metaphysics18#Drag to how much contact a number outside space can make with you.': 'How much contact can a number outside space make with you?',
  'metaphysics20#Drag to the count that stops this argument.': 'What count stops this argument?',
  'metaphysics31#Drag to how often rewording can make a hole go away.': 'How often can rewording make a hole go away?',
  'metaphysics35#Drag to what is actually stopping you.': 'What is actually stopping you?',
  "metaphysics4#Drag to how empty a physicist's vacuum really is.": "How empty is a physicist's vacuum, really?",
  'metaphysics7#Drag to how much change the block leaves standing.': 'How much change does the block leave standing?',
  'metaphysics#Drag to how far back the Big Bang story actually explains.': 'How far back does the Big Bang story actually explain?',
  'political10#Drag to how much Locke lets you take from the common land.': 'How much does Locke let you take from the common land?',
  'political18#Drag to what the same pay has really bought them.': 'What has the same pay really bought them?',
  'political3#Drag to how close a majority vote gets to the general will.': 'How close does a majority vote get to the general will?',
  'political#Drag to how much right to resist Hobbes allows.': 'How much right to resist does Hobbes allow?',

  // ── the seam ──────────────────────────────────────────────────────────────
  'aesthetics12#Slide the seam to where the meaning lives.': 'Where does the meaning live?',
  'aesthetics15#Slide the seam to what survives being disinterested.': 'What survives being disinterested?',
  'aesthetics21#Slide the seam to divide a photograph between the two kinds.': 'How does a photograph divide between the two kinds?',
  'aesthetics22#Slide the seam to the verdict make-believe gives on that heart reading.': 'What verdict does make-believe give on that heart reading?',
  'aesthetics5#Slide the seam to divide who does the unselfing.': 'Who does the unselfing?',
  'aesthetics7#Slide the seam to where Hume leaves beauty.': 'Where does Hume leave beauty?',
  'aesthetics#Slide the seam to divide who a judgement of taste speaks for.': 'Who does a judgement of taste speak for?',
  'epistemology15#Slide the seam to divide where twelve comes from.': 'Where does twelve come from?',
  'epistemology36#Slide the seam to divide what the experiment actually takes.': 'What does the experiment actually take?',
  'epistemology5#Slide the seam to where Aristotle puts the wanting to know.': 'Where does Aristotle put the wanting to know?',
  'ethics14#Slide the seam to where the real disagreement sits.': 'Where does the real disagreement sit?',
  'ethics17#Slide the seam to where Kant puts the death.': 'Where does Kant put the death?',
  'ethics37#Slide the seam to where the wrong actually lands.': 'Where does the wrong actually land?',
  'ethics3#Slide the seam to what a consequentialist actually weighs.': 'What does a consequentialist actually weigh?',
  'ethics6#Slide the seam to what actually changed between the two cases.': 'What actually changed between the two cases?',
  'knowHow#Slide the seam to divide what memorising actually gave you.': 'What did memorising actually give you?',
  'logic14#Slide the seam to divide the blame.': 'How should the blame divide?',
  'logic17#Slide the seam to divide what you are leaning on.': 'What are you leaning on?',
  'logic25#Slide the seam to divide the shy, tidy people between the two jobs.': 'How do the shy, tidy people divide between the two jobs?',
  'logic6#Slide the seam to divide what accepting a conditional commits you to.': 'What does accepting a conditional commit you to?',
  'metaphysics11#Slide the seam to where Locke hangs the person.': 'Where does Locke hang the person?',
  'metaphysics13#Slide the seam to divide you between the two of them.': 'How do you divide between the two of them?',
  'metaphysics17#Slide the seam to divide what there is to know about red.': 'What is there to know about red?',
  'metaphysics3#Slide the seam to where Plato puts the reality.': 'Where does Plato put the reality?',
  'metaphysics6#Slide the seam to divide the claim between the two ships.': 'How does the claim divide between the two ships?',
  'political11#Slide the seam to which one comes first.': 'Which one comes first?',
  'political16#Slide the seam to what alienation is actually about.': 'What is alienation actually about?',
  'political23#Slide the seam to how the situated view splits what you are.': 'How does the situated view split what you are?',
  'political4#Slide the seam to what Berlin actually guards.': 'What does Berlin actually guard?',
  'political6#Slide the seam to how Rawls orders the two.': 'How does Rawls order the two?',
};

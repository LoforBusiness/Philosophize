// ─────────────────────────────────────────────────────────────────────────────
// THE ONE PHRASE PER LESSON WORTH REMEMBERING.
//
// A cinematic lesson hands the reader eleven paragraphs and every word of them
// arrives at the same weight. One of those paragraphs contains the thing they
// are supposed to leave with — the maxim, the punchline, the sentence that would
// go on a flashcard — and until now it looked exactly like the sentence that set
// it up.
//
// ── WHY THIS IS A TABLE AND NOT A FIELD ON THE BEAT ─────────────────────────
//
// It was a field first (`BaseBeat.focus`), which is the obvious home: the phrase
// belongs to the sentence it is cut out of. The obvious home is the wrong one
// here for a reason that has nothing to do with design.
//
// `scripts/lib/muststamp.mjs` hashes each lesson's SCRIPT, so that a scene edited
// without re-measuring its must-see boxes is a build error rather than a silent
// crop (§21). Writing a maxim into 186 scripts would therefore mark all 186
// measurements stale and demand a full `measure:must` sweep — hours of browser
// time — to record something that never touches the stage at all. The stamp is
// right to be conservative and there is no version of weakening it that is worth
// the convenience, so the content moves instead.
//
// The cost of the move is that a rewritten beat can orphan its own maxim, since
// nothing links them but a string. That is exactly the failure J9's stale "the
// trap is B" explanations had, and the answer is the same one: `check:focus`
// re-derives every phrase against the beat it claims to sit in, so an orphan
// fails the build the moment it is created.
//
// ── THE RULES THE CHECK HOLDS ───────────────────────────────────────────────
//
//   ONE PER LESSON. A page with three highlighted phrases has no highlighted
//   phrase. The whole value of the mark is that there is one of it.
//
//   A LITERAL SUBSTRING of that beat's `text`, character for character — it is
//   found by indexOf, not by a fuzzy match. Watch the curly apostrophe: these
//   scripts use ’ and not ', and the two do not compare equal.
//
//   NEVER ON A BEAT THAT CARRIES A QUESTION, A QUOTE OR THE SUMMARY. A quote is
//   already a struck object, a summary is already a list of the points, and a
//   graded beat's text is the prompt — marking part of a question tells the
//   reader which half of it to answer.
//
//   NOT A WHOLE PARAGRAPH. Four to fourteen words. A highlight that covers the
//   beat marks nothing, it just changes the colour of the page.
// ─────────────────────────────────────────────────────────────────────────────

export interface LessonFocus {
  /** Index into that lesson's BEATS. */
  beat: number;
  /** A literal substring of BEATS[beat].text. */
  phrase: string;
}

export const LESSON_FOCUS: Record<string, LessonFocus> = {
  'ethics-ethics-1': { beat: 5, phrase: 'That inward weighing is your conscience' },
  'epistemology-knowledge-1': { beat: 6, phrase: 'Justification ties your belief to the truth on purpose' },
  'metaphysics-being-1': { beat: 7, phrase: 'Science never even tries' },
  'aesthetics-aesthetics-1': { beat: 4, phrase: 'You want nothing from it' },
  'political-political-1': { beat: 8, phrase: 'The contract is a test of legitimacy, not a document' },
  'ethics-ethics-2': { beat: 4, phrase: 'Most of us quietly use all three' },
  'epistemology-knowledge-3': { beat: 1, phrase: 'Feeling certain is something happening in you' },
  'metaphysics-being-2': { beat: 4, phrase: 'Nothing would have been simpler' },
  'aesthetics-aesthetics-2': { beat: 7, phrase: 'Almost nothing else we build does that' },
  'political-political-2': { beat: 5, phrase: 'Both take by threat — only legitimacy tells them apart' },
  'logic-arguments-3': { beat: 5, phrase: 'Valid form, false premises: the argument is valid but not sound' },
  'logic-arguments-4': { beat: 3, phrase: 'An inductive argument only makes its conclusion likely, so grade it strong or weak' },
  'ethics-ethics-3': { beat: 7, phrase: 'the one person has a worth no arithmetic can outweigh' },
  'ethics-ethics-4': { beat: 8, phrase: 'Cultures differing does not make every code equally true' },
  'epistemology-knowledge-4': { beat: 6, phrase: 'That is what a priori means' },
  'epistemology-knowledge-5': { beat: 8, phrase: 'Knowledge is for getting things done, and for making nature do what you want' },
  'metaphysics-being-3': { beat: 7, phrase: 'Everything you can touch is a rough copy of something perfect' },
  'metaphysics-being-4': { beat: 7, phrase: 'motion itself becomes an illusion' },
  'aesthetics-aesthetics-3': { beat: 7, phrase: 'music reaches something underneath all the arguing' },
  'aesthetics-aesthetics-4': { beat: 8, phrase: 'It copies nothing and expresses nothing, and it still will not go away' },
  'political-political-3': { beat: 8, phrase: 'Real freedom is living under rules you give yourself' },
  'political-political-4': { beat: 0, phrase: 'Two ideas of freedom — and two very different politics' },
  'logic-arguments-5': { beat: 0, phrase: 'A proof is a chain: premises that march, step by step, to a conclusion' },
  'ethics-ethics-5': { beat: 5, phrase: 'doing what your place in life actually asks of you' },
  'logic-arguments-6': { beat: 1, phrase: 'P is the antecedent — the condition' },
  'metaphysics-being-6': { beat: 5, phrase: 'Numerical sameness is being the one thing you were yesterday' },
  'aesthetics-aesthetics-6': { beat: 8, phrase: 'The mountain is not the sublime thing' },
  'ethics-ethics-6': { beat: 1, phrase: 'Same numbers, different hands — your gut splits where the math does not' },
  'epistemology-knowledge-6': { beat: 7, phrase: 'total doubt eats itself' },
  'epistemology-knowledge-7': { beat: 8, phrase: 'More of the same is no guarantee of the same' },
  'metaphysics-being-5': { beat: 6, phrase: 'You are a thing that wonders what it is' },
  'aesthetics-aesthetics-5': { beat: 1, phrase: 'Attention is a just and loving look at one real thing' },
  'political-political-6': { beat: 5, phrase: 'The test is the bottom, not the top' },
  'logic-arguments-7': { beat: 0, phrase: 'There are two moves that can never let you down' },
  'logic-arguments-8': { beat: 9, phrase: 'You spot the result, then claim the cause' },
  'ethics-ethics-7': { beat: 7, phrase: 'Nothing inside the drivers is different at all' },
  'ethics-ethics-8': { beat: 16, phrase: 'Care notices the person the rules never mention' },
  'ethics-ethics-9': { beat: 4, phrase: 'there is no scale both of them fit on' },
  'ethics-ethics-31': { beat: 2, phrase: 'Nothing about the duty has changed because nothing needed to' },
  'ethics-ethics-32': { beat: 1, phrase: 'The card is only the last line of it' },
  'logic-arguments-31': { beat: 3, phrase: 'Every part of you is certain the coin owes you one' },
  'logic-arguments-32': { beat: 4, phrase: 'you are cheating right now' },
  'epistemology-knowledge-31': { beat: 7, phrase: 'Every certificate memory can issue is signed by memory' },
  'metaphysics-being-31': { beat: 1, phrase: 'Nothing was added to the cheese' },
  'metaphysics-being-32': { beat: 4, phrase: 'Every description you write of one is a true description of the other' },
  'political-political-33': { beat: 3, phrase: 'Unlimited tolerance can be used to end tolerance' },
  'political-political-34': { beat: 6, phrase: 'That is subsidiarity, and it has two halves' },
  'epistemology-knowledge-35': { beat: 3, phrase: 'Know what the thing rules out' },
  'logic-arguments-35': { beat: 6, phrase: 'A cause under both is called a confounder' },
  'ethics-ethics-35': { beat: 4, phrase: 'Same result: the boy dies either way' },
  'aesthetics-aesthetics-35': { beat: 8, phrase: 'That is what explaining a joke does to it' },
  'political-political-35': { beat: 1, phrase: 'Nine of the chairs belong to people who are not born yet' },
  'metaphysics-being-36': { beat: 4, phrase: 'It works because there is no last room to fall off the end of' },
  'epistemology-knowledge-36': { beat: 11, phrase: 'A reason is built, and it arrives feeling like a memory' },
  'logic-arguments-36': { beat: 6, phrase: 'This is why the famous line is only half true' },
  'ethics-ethics-36': { beat: 7, phrase: 'Forgiveness is a gift, and a gift has an owner' },
  'aesthetics-aesthetics-36': { beat: 6, phrase: 'we say we are seeing the square, not a record of it' },
  'political-political-36': { beat: 7, phrase: 'Nothing here shows up in a statistic' },
  'metaphysics-being-37': { beat: 3, phrase: 'Fragile means: if it is struck, it breaks' },
  'epistemology-knowledge-37': { beat: 9, phrase: 'Both are right about different cases' },
  'logic-arguments-37': { beat: 4, phrase: 'the result bites harder than you would think' },
  'logic-arguments-16': { beat: 4, phrase: 'Order in time is free' },
  'logic-arguments-17': { beat: 2, phrase: 'The right claim rests on nothing but the speaker' },
  'logic-arguments-18': { beat: 3, phrase: 'The needle is whether the water is safe' },
  'ethics-ethics-17': { beat: 4, phrase: 'Write down what you are about to do, and hand a copy to everybody' },
  'ethics-ethics-19': { beat: 7, phrase: 'The rule is easy while the choices are small' },
  'ethics-ethics-20': { beat: 1, phrase: 'Every government discounts the far harms first' },
  'epistemology-knowledge-18': { beat: 6, phrase: 'A new fact moves you in proportion to how loosely you were holding on' },
  'epistemology-knowledge-19': { beat: 1, phrase: 'Standing at the wrong door will open nothing' },
  'epistemology-knowledge-20': { beat: 8, phrase: 'A feed is built to show you what people like you already share' },
  'metaphysics-being-18': { beat: 6, phrase: 'The number exists, and the number does not live here' },
  'metaphysics-being-19': { beat: 0, phrase: 'An apple, written out as everything true of it' },
  'metaphysics-being-20': { beat: 0, phrase: 'Nothing here denies the world exists' },
  'aesthetics-aesthetics-20': { beat: 7, phrase: 'Something can be replaceable and still be worth having' },
  'aesthetics-aesthetics-21': { beat: 3, phrase: 'The painting cannot come back' },
  'political-political-19': { beat: 6, phrase: 'The trouble is where that principle stops' },
  'political-political-21': { beat: 7, phrase: 'The view does not call for a riot' },
  'logic-arguments-19': { beat: 5, phrase: 'Only the card that can say no is really a test' },
  'logic-arguments-20': { beat: 3, phrase: 'A straw man is not usually a lie' },
  'logic-arguments-21': { beat: 1, phrase: 'Two tests, and they ask different questions' },
  'ethics-ethics-21': { beat: 5, phrase: 'You may accept a harm alongside your aim' },
  'ethics-ethics-22': { beat: 7, phrase: 'That refusal is evidence about you' },
  'ethics-ethics-24': { beat: 4, phrase: 'Three of the four pillars have nothing left to hold' },
  'epistemology-knowledge-22': { beat: 8, phrase: 'the extra value is not in today at all' },
  'epistemology-knowledge-23': { beat: 1, phrase: 'Nothing about that decides how much you keep' },
  'metaphysics-being-21': { beat: 2, phrase: 'Presentism says only this instant exists' },
  'metaphysics-being-22': { beat: 5, phrase: 'Compatibilism says the phrase was never about the replay' },
  'metaphysics-being-23': { beat: 8, phrase: 'A pile of planks is not a ship' },
  'aesthetics-aesthetics-22': { beat: 8, phrase: 'Vividly imagining a thing is enough to move you' },
  'aesthetics-aesthetics-23': { beat: 8, phrase: 'it copies the wanting underneath everything' },
  'aesthetics-aesthetics-24': { beat: 6, phrase: 'a work reaches everybody, and it can argue rather than decorate' },
  'political-political-22': { beat: 7, phrase: 'It is courts, rights and rules that take the switch off the wall' },
  'political-political-23': { beat: 7, phrase: 'Morality only makes sense inside a tradition' },
  'political-political-24': { beat: 6, phrase: 'Treat everybody identically, or recognise what makes each way of life its own thing' },
  'aesthetics-aesthetics-37': { beat: 3, phrase: 'you can burn every copy of a symphony and it survives' },
  'aesthetics-aesthetics-34': { beat: 6, phrase: 'convention and context do most of the work' },
  'ethics-ethics-34': { beat: 3, phrase: 'Keep going and you reach a multitude whose lives are only just worth living' },
  'logic-arguments-33': { beat: 9, phrase: 'Every extra part is another thing that can be wrong' },
  'logic-arguments-34': { beat: 5, phrase: 'Error falls with the square root of the count, not in step with it' },
  'epistemology-knowledge-33': { beat: 7, phrase: 'there is no single height that counts as knowing' },
  'epistemology-knowledge-34': { beat: 6, phrase: 'Being well calibrated means those two bars match' },
  'metaphysics-being-33': { beat: 8, phrase: 'Order is rare and mess is common' },
  'metaphysics-being-34': { beat: 9, phrase: 'A level that rests on nothing is what fundamental means' },
  'aesthetics-aesthetics-32': { beat: 5, phrase: 'A ledger cannot tell them apart' },
  'political-political-31': { beat: 2, phrase: 'It is a good trade, and you would be daft not to make it' },
  'political-political-32': { beat: 5, phrase: 'deciding the winner is not the only thing a mark can do' },
  'logic-arguments-22': { beat: 2, phrase: 'A universal claim is a promise about every single member' },
  'metaphysics-being-13': { beat: 6, phrase: 'Identity has to pick one thing, and continuity has just gone two ways' },
  'metaphysics-being-24': { beat: 5, phrase: 'Every single step was fine and the destination is nonsense' },
  'political-political-12': { beat: 2, phrase: 'That is negative liberty, and it is entirely about what other people are doing' },
  'political-political-15': { beat: 0, phrase: 'Breaking a law can be the most law-respecting thing a person does' },
  'ethics-ethics-23': { beat: 6, phrase: 'distance is not a moral property' },
  'logic-arguments-26': { beat: 0, phrase: 'Begin by assuming it is false' },
  'aesthetics-aesthetics-11': { beat: 4, phrase: 'Only the plaques tell the two apart' },
  'aesthetics-aesthetics-16': { beat: 2, phrase: 'Whatever happens next happens to you, not to the canvas' },
  'epistemology-knowledge-2': { beat: 0, phrase: 'You have read every word ever written about swimming' },
  'epistemology-knowledge-13': { beat: 5, phrase: 'The same reasoning covers every ticket, so strike them all' },
  'epistemology-knowledge-21': { beat: 6, phrase: 'The tray fills and the needle does not move' },
  'epistemology-knowledge-8': { beat: 11, phrase: 'The chain of reasons can end in only three ways' },
  'metaphysics-being-7': { beat: 0, phrase: 'You have never once been anywhere but right now' },
  'metaphysics-being-8': { beat: 4, phrase: 'you could not have done otherwise' },
  'aesthetics-aesthetics-7': { beat: 12, phrase: 'practice reshapes perception itself' },
  'aesthetics-aesthetics-8': { beat: 13, phrase: 'The subject is beside the point' },
  'political-political-7': { beat: 12, phrase: 'rights you have just for being human' },
  'political-political-8': { beat: 13, phrase: 'equality is a blank waiting to be filled in' },
  'metaphysics-being-9': { beat: 7, phrase: 'It is something the brain does, the way digestion is something the gut does' },
  'epistemology-knowledge-10': { beat: 6, phrase: 'Science never claims certainty, and it plainly knows a great deal' },
  'ethics-ethics-10': { beat: 1, phrase: 'You do not price the shoes against the child' },
  'aesthetics-aesthetics-9': { beat: 7, phrase: 'the difference is not in the object' },
  'political-political-9': { beat: 4, phrase: 'This is democracy working, not democracy failing' },
  'logic-arguments-10': { beat: 2, phrase: 'An enthymeme: one that runs on a premise nobody says out loud' },
  'logic-arguments-11': { beat: 5, phrase: 'step after step, nothing missing and nothing limping' },
  'ethics-ethics-11': { beat: 9, phrase: 'Two levels now, and the column below can no longer settle it' },
  'ethics-ethics-12': { beat: 2, phrase: 'He asks whether your rule could be a law that everyone follows' },
  'epistemology-knowledge-11': { beat: 1, phrase: 'You have never been more right, or for a worse reason' },
  'epistemology-knowledge-12': { beat: 3, phrase: 'What you are reading is a copy your mind kept' },
  'metaphysics-being-10': { beat: 5, phrase: 'it lives pinned in the things themselves' },
  'metaphysics-being-11': { beat: 4, phrase: 'Overnight the whole thread leaves the prince and settles above the cobbler' },
  'aesthetics-aesthetics-10': { beat: 5, phrase: 'it is part of what the work already is' },
  'political-political-10': { beat: 3, phrase: 'You work a patch, the work is yours, so the patch is yours too' },
  'political-political-11': { beat: 9, phrase: 'Everybody is bound to the common good' },
  'logic-arguments-12': { beat: 2, phrase: 'The trick is the claim that only two doors exist' },
  'ethics-ethics-13': { beat: 2, phrase: 'Same trait, other end, and it is a vice too' },
  'epistemology-knowledge-14': { beat: 2, phrase: 'the world is not something you observe' },
  'metaphysics-being-12': { beat: 2, phrase: 'Doubt everything you like: somebody is doing the doubting' },
  'aesthetics-aesthetics-13': { beat: 3, phrase: 'draw what you cannot see: where each canvas has been' },
  'political-political-14': { beat: 2, phrase: 'Every single transfer is free' },
  'aesthetics-aesthetics-14': { beat: 4, phrase: 'Taste really does differ, he agrees' },
  'aesthetics-aesthetics-15': { beat: 2, phrase: 'Strip away every stake you have in the rose' },
  'aesthetics-aesthetics-17': { beat: 5, phrase: 'The fear is the fee you pay to find out' },
  'ethics-ethics-14': { beat: 3, phrase: 'The case is that everyone else has freedom too' },
  'ethics-ethics-15': { beat: 8, phrase: 'A scale that cannot weigh it is a poor scale' },
  'logic-arguments-13': { beat: 5, phrase: 'A slope can be honest' },
  'logic-arguments-14': { beat: 3, phrase: 'Something is smuggling false certainty through a form you trust every day' },
  'logic-arguments-15': { beat: 5, phrase: 'A sample can carry a conclusion when it is big enough and chosen fairly' },
  'epistemology-knowledge-15': { beat: 4, phrase: 'If you did not have to look, you learned nothing new' },
  'epistemology-knowledge-17': { beat: 3, phrase: 'Most of science is not testing the frame' },
  'metaphysics-being-14': { beat: 3, phrase: 'It could not have been otherwise, however you rearrange things' },
  'metaphysics-being-16': { beat: 4, phrase: 'You have views about what you want' },
  'metaphysics-being-17': { beat: 5, phrase: 'Why any of it is felt at all is a different sort of question' },
  'political-political-16': { beat: 2, phrase: 'The line sets the pace and you cannot stop it' },
  'political-political-17': { beat: 4, phrase: 'fair play stops asking about signatures' },
};

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
// time — to record something that never touches the stage at all.
//
// ── THAT SECOND HALF USED TO SAY "AND THERE IS NO VERSION OF WEAKENING THE
//    STAMP THAT IS WORTH THE CONVENIENCE". IT WAS WRONG, AND THE WRITING PASS
//    PROVED IT ────────────────────────────────────────────────────────────────
//
// The stamp no longer hashes a script's PROSE, only its structure and channels.
// That is not a convenience: a must-box records what is inside `#stage-clip`, and
// every word a script carries is drawn by `CinematicPlayer` in the lower deck,
// outside it. Checked rather than argued — no `*Scene.tsx` reads prose off a beat.
// So the prose could never move a box, and hashing it bought nothing while
// costing a browser sweep per rewritten sentence, which is exactly the trade this
// file already refuses for `Target.tsx`.
//
// THE TABLE STAYS ANYWAY, for the reason underneath the one that has gone: a
// maxim is authored and re-derived by `make:focus` / `check:focus` against the
// whole corpus at once, and a per-lesson field would scatter that. What changed is
// that this is now a choice about where authored content lives, rather than a
// workaround for a hash.
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
  'epistemology-knowledge-1': { beat: 6, phrase: 'Justification is meant to connect a belief to the truth' },
  'metaphysics-being-1': { beat: 8, phrase: 'every scientific explanation presupposes that states and laws already exist' },
  'aesthetics-aesthetics-1': { beat: 4, phrase: 'You want nothing from it' },
  'political-political-1': { beat: 8, phrase: 'The contract is a test of legitimacy, not a document' },
  'ethics-ethics-2': { beat: 4, phrase: 'Most people use all three without noticing' },
  'epistemology-knowledge-3': { beat: 1, phrase: 'Feeling certain is something happening in you' },
  'metaphysics-being-2': { beat: 4, phrase: 'existence, not nothingness, is what requires a reason' },
  'aesthetics-aesthetics-2': { beat: 7, phrase: 'outlive its maker, and reach audiences in other languages and centuries' },
  'political-political-2': { beat: 5, phrase: 'Both take by threat, and only legitimacy tells them apart' },
  'logic-arguments-3': { beat: 5, phrase: 'Valid form, false premises: the argument is valid but not sound' },
  'logic-arguments-4': { beat: 3, phrase: 'An inductive argument aims only to make its conclusion likely' },
  'ethics-ethics-3': { beat: 7, phrase: 'the one person has a worth no arithmetic can outweigh' },
  'ethics-ethics-4': { beat: 8, phrase: 'Cultures differing does not make every code equally true' },
  'epistemology-knowledge-4': { beat: 6, phrase: 'Knowledge that doesn’t rest on experience is called a priori' },
  'epistemology-knowledge-5': { beat: 8, phrase: 'knowledge is worth having for the power it gives over nature' },
  'metaphysics-being-3': { beat: 7, phrase: 'Every physical thing is an imperfect copy of a Form' },
  'metaphysics-being-4': { beat: 7, phrase: 'So motion itself is false, a mere show put on by the senses' },
  'aesthetics-aesthetics-3': { beat: 7, phrase: 'music expresses the will, the blind striving behind everything in nature' },
  'aesthetics-aesthetics-4': { beat: 8, phrase: 'the institutions of the artworld make it art' },
  'political-political-3': { beat: 8, phrase: 'real freedom is living under rules you give yourself' },
  'political-political-4': { beat: 0, phrase: 'two ideas of freedom that support very different politics' },
  'logic-arguments-5': { beat: 0, phrase: 'If any single step fails, the proof fails' },
  'ethics-ethics-5': { beat: 5, phrase: 'the duties that belong to your place in life' },
  'logic-arguments-6': { beat: 2, phrase: 'claims a link between the two, not that either is true' },
  'metaphysics-being-6': { beat: 5, phrase: 'Numerical identity is being one and the same thing over time' },
  'aesthetics-aesthetics-6': { beat: 8, phrase: 'The mountain is not the sublime thing' },
  'ethics-ethics-6': { beat: 1, phrase: 'The numbers can stay fixed while moral intuitions reverse' },
  'epistemology-knowledge-6': { beat: 7, phrase: 'the claim that nothing can be known refutes itself' },
  'epistemology-knowledge-7': { beat: 8, phrase: 'No number of past confirmations can guarantee the next case' },
  'metaphysics-being-5': { beat: 6, phrase: 'a being for whom your own being is an issue' },
  'aesthetics-aesthetics-5': { beat: 1, phrase: 'Attention is a just and loving look at one real thing' },
  'political-political-6': { beat: 5, phrase: 'Justice is judged by how the worst off fare, not the best off' },
  'logic-arguments-7': { beat: 0, phrase: 'true premises guarantee a true conclusion' },
  'logic-arguments-8': { beat: 9, phrase: 'treats a wet street, the consequent, as proof of rain' },
  'ethics-ethics-7': { beat: 7, phrase: 'Nothing inside the drivers is different at all' },
  'ethics-ethics-8': { beat: 16, phrase: 'Care notices the person the rules never mention' },
  'ethics-ethics-9': { beat: 4, phrase: 'No common scale can weigh one claim against the other' },
  'ethics-ethics-31': { beat: 2, phrase: 'The duty is unchanged, because the task is still possible for you' },
  'ethics-ethics-32': { beat: 1, phrase: 'The verdict is only the conclusion of that reasoning' },
  'logic-arguments-31': { beat: 3, phrase: 'the belief that a run makes the opposite outcome more likely' },
  'logic-arguments-32': { beat: 5, phrase: 'it presupposes a claim that any direct answer concedes' },
  'epistemology-knowledge-31': { beat: 7, phrase: 'Any check that memory can provide depends on memory itself' },
  'metaphysics-being-31': { beat: 1, phrase: 'Nothing was added to the cheese' },
  'metaphysics-being-32': { beat: 4, phrase: 'Every description you write of one is a true description of the other' },
  'political-political-33': { beat: 3, phrase: 'Unlimited tolerance can be used to end tolerance' },
  'political-political-34': { beat: 6, phrase: 'That is subsidiarity, and it has two halves' },
  'epistemology-knowledge-35': { beat: 3, phrase: 'If you know a claim and know that it rules out another' },
  'logic-arguments-35': { beat: 6, phrase: 'A common cause of two correlated quantities is called a confounder' },
  'ethics-ethics-35': { beat: 7, phrase: 'Killing and letting die usually differ in other ways too' },
  'aesthetics-aesthetics-35': { beat: 8, phrase: 'Explaining a joke reveals the second reading in advance' },
  'political-political-35': { beat: 1, phrase: 'Nine of the chairs belong to people who are not born yet' },
  'metaphysics-being-36': { beat: 4, phrase: 'The move works only because there’s no last room' },
  'epistemology-knowledge-36': { beat: 11, phrase: 'Because the inference goes unnoticed, it feels like memory' },
  'logic-arguments-36': { beat: 6, phrase: 'applies only to a search that would probably have missed the thing' },
  'ethics-ethics-36': { beat: 8, phrase: 'a gift, which only the wronged person may give or withhold' },
  'aesthetics-aesthetics-36': { beat: 6, phrase: 'through them, you literally see the square itself' },
  'political-political-36': { beat: 7, phrase: 'Nothing here shows up in a statistic' },
  'metaphysics-being-37': { beat: 3, phrase: 'strike the object, and the object breaks' },
  'epistemology-knowledge-37': { beat: 9, phrase: 'Both are right about different cases' },
  'logic-arguments-37': { beat: 4, phrase: 'A description can be well formed and still describe nothing that could exist' },
  'logic-arguments-16': { beat: 5, phrase: 'Every cause comes before its effect, but so does every coincidence' },
  'logic-arguments-17': { beat: 2, phrase: 'The right claim rests on nothing but the speaker' },
  'logic-arguments-18': { beat: 4, phrase: 'Popularity and feeling have no bearing on whether a claim is true' },
  'ethics-ethics-17': { beat: 4, phrase: 'what would follow if everyone adopted your maxim at once' },
  'ethics-ethics-19': { beat: 7, phrase: 'easy to accept while the choices are small' },
  'ethics-ethics-20': { beat: 1, phrase: 'a harm two centuries away counts for almost nothing' },
  'epistemology-knowledge-18': { beat: 6, phrase: 'The same evidence barely moves a belief you’re nearly sure of' },
  'epistemology-knowledge-19': { beat: 1, phrase: 'Expertise is a relation between a person and a subject' },
  'epistemology-knowledge-20': { beat: 8, phrase: 'the agreement in a feed often looks independent when it isn’t' },
  'metaphysics-being-18': { beat: 6, phrase: 'numbers exist as abstract objects outside space and time' },
  'metaphysics-being-19': { beat: 4, phrase: 'a substance underlies the properties and holds the properties together' },
  'metaphysics-being-20': { beat: 3, phrase: 'Simulated minds would then vastly outnumber unsimulated ones' },
  'aesthetics-aesthetics-20': { beat: 7, phrase: 'Something can be replaceable and still be worth having' },
  'aesthetics-aesthetics-21': { beat: 3, phrase: 'The painting cannot come back' },
  'political-political-19': { beat: 6, phrase: 'The trouble is where that principle stops' },
  'political-political-21': { beat: 8, phrase: 'no existing state has earned the authority it claims' },
  'logic-arguments-19': { beat: 5, phrase: 'Only a card that could refute the rule can test it' },
  'logic-arguments-20': { beat: 3, phrase: 'A straw man is not usually a lie' },
  'logic-arguments-21': { beat: 1, phrase: 'Necessity and sufficiency are separate questions' },
  'ethics-ethics-21': { beat: 5, phrase: 'You may accept a harm alongside your aim' },
  'ethics-ethics-22': { beat: 7, phrase: 'refusing is evidence against hedonism' },
  'ethics-ethics-24': { beat: 4, phrase: 'Three of the four justifications no longer apply to him' },
  'epistemology-knowledge-22': { beat: 8, phrase: 'the extra value is not in today at all' },
  'epistemology-knowledge-23': { beat: 1, phrase: 'Nothing about that decides how much you keep' },
  'metaphysics-being-21': { beat: 2, phrase: 'Presentism says only this instant exists' },
  'metaphysics-being-22': { beat: 5, phrase: 'you’d have acted differently had you wanted to' },
  'metaphysics-being-23': { beat: 8, phrase: 'A pile of planks is not a ship' },
  'aesthetics-aesthetics-22': { beat: 8, phrase: 'Vividly imagining a thing is enough to move you' },
  'aesthetics-aesthetics-23': { beat: 8, phrase: 'copies no visible thing, but the will hidden behind all things' },
  'aesthetics-aesthetics-24': { beat: 6, phrase: 'Freed from ritual, a work can reach everybody' },
  'political-political-22': { beat: 7, phrase: 'freedom needs laws, rights and courts that check arbitrary power' },
  'political-political-23': { beat: 7, phrase: 'morality only makes sense inside a tradition' },
  'political-political-24': { beat: 6, phrase: 'treat everyone alike, and the other is to recognise each group’s way of life' },
  'aesthetics-aesthetics-37': { beat: 3, phrase: 'you can burn every copy of a symphony and it survives' },
  'aesthetics-aesthetics-34': { beat: 6, phrase: 'convention and context do most of the work' },
  'ethics-ethics-34': { beat: 3, phrase: 'a vast population whose lives are barely worth living' },
  'logic-arguments-33': { beat: 9, phrase: 'Every extra part is another assumption that could be false' },
  'logic-arguments-34': { beat: 5, phrase: 'Sampling error depends on the square root of the sample size' },
  'epistemology-knowledge-33': { beat: 7, phrase: 'there is no single height that counts as knowing' },
  'epistemology-knowledge-34': { beat: 6, phrase: 'Being well calibrated means those two bars match' },
  'metaphysics-being-33': { beat: 8, phrase: 'Ordered arrangements are rare, and disordered ones are common' },
  'metaphysics-being-34': { beat: 9, phrase: 'A level that rests on nothing is what fundamental means' },
  'aesthetics-aesthetics-32': { beat: 5, phrase: 'Adding up well-being can’t tell the three lives apart' },
  'political-political-31': { beat: 2, phrase: 'the gain outweighs your share of the cost' },
  'political-political-32': { beat: 5, phrase: 'deciding the winner is not the only thing a mark can do' },
  'logic-arguments-22': { beat: 2, phrase: 'A universal claim asserts something of every member of a group' },
  'metaphysics-being-13': { beat: 6, phrase: 'Identity can’t branch, because one person can’t be identical to two different people' },
  'metaphysics-being-24': { beat: 5, phrase: 'the premise seems true, yet the conclusion is false' },
  'political-political-12': { beat: 2, phrase: 'That is negative liberty, and it is entirely about what other people are doing' },
  'political-political-15': { beat: 0, phrase: 'Breaking a law can be the most law-respecting thing a person does' },
  'ethics-ethics-23': { beat: 6, phrase: 'distance is not a moral property' },
  'logic-arguments-26': { beat: 0, phrase: 'Begin by assuming it is false' },
  'aesthetics-aesthetics-11': { beat: 4, phrase: 'Only the plaques tell the two apart' },
  'aesthetics-aesthetics-16': { beat: 2, phrase: 'Whatever happens next happens to you, not to the canvas' },
  'epistemology-knowledge-2': { beat: 7, phrase: 'knowing how is distinct from knowing that' },
  'epistemology-knowledge-13': { beat: 5, phrase: 'The same reasoning applies to every ticket' },
  'epistemology-knowledge-21': { beat: 6, phrase: 'The tray fills and the needle does not move' },
  'epistemology-knowledge-8': { beat: 11, phrase: 'The chain of reasons can end in only three ways' },
  'metaphysics-being-7': { beat: 0, phrase: 'You only ever experience the present moment' },
  'metaphysics-being-8': { beat: 4, phrase: 'you could not have done otherwise' },
  'aesthetics-aesthetics-7': { beat: 12, phrase: 'practice reshapes perception itself' },
  'aesthetics-aesthetics-8': { beat: 13, phrase: 'an arrangement of lines and colours that stirs aesthetic emotion' },
  'political-political-7': { beat: 12, phrase: 'rights you have just for being human' },
  'political-political-8': { beat: 13, phrase: 'a demand for equality is incomplete until it states what should be equal' },
  'metaphysics-being-9': { beat: 7, phrase: 'It is something the brain does, the way digestion is something the gut does' },
  'epistemology-knowledge-10': { beat: 6, phrase: 'Science shows that knowledge and fallibility can coexist' },
  'ethics-ethics-10': { beat: 1, phrase: 'The cost of ruined shoes is trivial beside a child’s life' },
  'aesthetics-aesthetics-9': { beat: 7, phrase: 'the difference is not in the object' },
  'political-political-9': { beat: 4, phrase: 'This is democracy working, not democracy failing' },
  'logic-arguments-10': { beat: 2, phrase: 'An argument that depends on an unstated premise is called an enthymeme' },
  'logic-arguments-11': { beat: 0, phrase: 'A proof must rest on support from outside itself' },
  'ethics-ethics-11': { beat: 9, phrase: 'quantity alone can’t decide which pleasure is better' },
  'ethics-ethics-12': { beat: 2, phrase: 'He asks whether your rule could be a law that everyone follows' },
  'epistemology-knowledge-11': { beat: 9, phrase: 'Nothing connected your reason to the fact that made the belief true' },
  'epistemology-knowledge-12': { beat: 7, phrase: 'Most of what you know reaches you by testimony' },
  'metaphysics-being-10': { beat: 5, phrase: 'exist only in the particular things that have them' },
  'metaphysics-being-11': { beat: 4, phrase: 'consciousness, with all its memories, enters the cobbler’s body overnight' },
  'aesthetics-aesthetics-10': { beat: 5, phrase: 'what a work invites you to feel is part of the work itself' },
  'political-political-10': { beat: 3, phrase: 'land you mix your labour with becomes yours' },
  'political-political-11': { beat: 9, phrase: 'Everybody is bound to the common good' },
  'logic-arguments-12': { beat: 2, phrase: 'The fallacy lies in the unargued claim that no other option exists' },
  'ethics-ethics-13': { beat: 2, phrase: 'Excess, like deficiency, is a vice' },
  'epistemology-knowledge-14': { beat: 2, phrase: 'the world is not something you observe' },
  'metaphysics-being-12': { beat: 5, phrase: 'a self is nothing but a bundle of perceptions' },
  'aesthetics-aesthetics-13': { beat: 3, phrase: 'the history of each canvas from the moment it was made' },
  'political-political-14': { beat: 2, phrase: 'Every single transfer is free' },
  'aesthetics-aesthetics-14': { beat: 5, phrase: 'The joint verdict of true judges, he argues, is the standard of taste' },
  'aesthetics-aesthetics-15': { beat: 2, phrase: 'set aside every personal stake in the rose' },
  'aesthetics-aesthetics-17': { beat: 5, phrase: 'fear is the price paid for the pleasure of discovery' },
  'ethics-ethics-14': { beat: 3, phrase: 'The case is that everyone else has freedom too' },
  'ethics-ethics-15': { beat: 8, phrase: 'a test for observable facts would miss moral facts' },
  'logic-arguments-13': { beat: 5, phrase: 'A slope argument is legitimate when each step has evidence' },
  'logic-arguments-14': { beat: 3, phrase: 'the error must lie in the words, not in the form' },
  'logic-arguments-15': { beat: 5, phrase: 'A sample supports a general conclusion when it’s large enough and fairly chosen' },
  'epistemology-knowledge-15': { beat: 4, phrase: 'If you did not have to look, you learned nothing new' },
  'epistemology-knowledge-17': { beat: 3, phrase: 'Most of science is not testing the frame' },
  'metaphysics-being-14': { beat: 3, phrase: 'A claim true in every possible world is a necessary truth' },
  'metaphysics-being-16': { beat: 4, phrase: 'wanting a particular desire to be the one that moves you' },
  'metaphysics-being-17': { beat: 5, phrase: 'Explaining why any of it is felt is the hard problem' },
  'political-political-16': { beat: 2, phrase: 'The line sets the pace and you cannot stop it' },
  'political-political-17': { beat: 4, phrase: 'fair play stops asking about signatures' },
  'metaphysics-being-40': { beat: 5, phrase: 'Such a claim is neither true nor false yet' },
  'epistemology-knowledge-40': { beat: 1, phrase: 'an idea never reaches the evidence on its own' },
  'logic-arguments-40': { beat: 3, phrase: 'every stone on record is grue as well' },
  'ethics-ethics-40': { beat: 5, phrase: 'An interest is a stake in how things go, not a feeling' },
  'aesthetics-aesthetics-40': { beat: 3, phrase: 'Looking leaves a painting intact, but eating consumes a dinner' },
  'political-political-40': { beat: 3, phrase: 'Some things are changed by being priced' },
  'metaphysics-being-41': { beat: 2, phrase: 'Without things, there would be no space' },
  'epistemology-knowledge-41': { beat: 2, phrase: 'The oar looks bent, but the oar itself is straight' },
  'logic-arguments-41': { beat: 3, phrase: 'the second group is a subset of the first' },
  'ethics-ethics-41': { beat: 7, phrase: 'Only the default has changed, yet the outcomes differ widely' },
  'aesthetics-aesthetics-41': { beat: 1, phrase: 'The frame is the difficult case' },
  'political-political-41': { beat: 3, phrase: 'The power has an owner and a purpose' },
  'metaphysics-being-26': { beat: 1, phrase: 'Wetness is a property of the whole that neither part has' },
  'epistemology-knowledge-26': { beat: 5, phrase: 'The disagreement is itself a piece of evidence' },
  'logic-arguments-24': { beat: 7, phrase: 'The conclusion adds no fact that the premises did not already give' },
  'ethics-ethics-26': { beat: 5, phrase: 'Being a person and being human are different properties' },
  'aesthetics-aesthetics-26': { beat: 3, phrase: 'The lover of kitsch is sincere, while camp loves bad taste knowingly' },
  'political-political-26': { beat: 0, phrase: 'A vote can count millions of opinions without testing their reasons' },
  'metaphysics-being-27': { beat: 0, phrase: 'never failing is different from having to hold' },
  'epistemology-knowledge-27': { beat: 0, phrase: 'You can wrong somebody without telling a single lie' },
  'logic-arguments-27': { beat: 3, phrase: 'An ordinary sentence describes the world, but this one describes itself' },
  'ethics-ethics-27': { beat: 7, phrase: 'Each reading has a cost, which appears when two cultures disagree' },
  'aesthetics-aesthetics-27': { beat: 3, phrase: 'You stop noticing what you see every day' },
  'political-political-27': { beat: 1, phrase: 'It judges a war by two separate sets of tests' },
  'metaphysics-being-28': { beat: 3, phrase: 'Physics describes what matter does, not what matter is in itself' },
  'epistemology-knowledge-28': { beat: 0, phrase: 'a lawyer defending a verdict already chosen' },
  'logic-arguments-28': { beat: 3, phrase: 'A single relevant difference can defeat the whole argument' },
  'ethics-ethics-28': { beat: 7, phrase: 'No belief in the system is a fixed foundation beyond revision' },
  'aesthetics-aesthetics-28': { beat: 2, phrase: 'Most of a life happens elsewhere' },
  'political-political-28': { beat: 1, phrase: 'Punishment does on purpose what the law forbids everyone else' },
  'metaphysics-being-29': { beat: 2, phrase: 'to exist is to be perceived' },
  'epistemology-knowledge-29': { beat: 3, phrase: 'Understanding is knowing why' },
  'logic-arguments-29': { beat: 2, phrase: 'It falls on whoever asserts' },
  'ethics-ethics-29': { beat: 2, phrase: 'A supererogatory act is good and not required' },
  'aesthetics-aesthetics-29': { beat: 3, phrase: 'A novel can show what grief is like from the inside' },
  'political-political-29': { beat: 3, phrase: 'citizenship is an inherited status that shapes a life' },
  'metaphysics-being-30': { beat: 5, phrase: 'Travellers who come later start from your map rather than from nothing' },
  'epistemology-knowledge-30': { beat: 2, phrase: 'Wisdom depends on good intellectual character' },
  'logic-arguments-30': { beat: 7, phrase: 'Construct the strongest version of each objection and answer that' },
  'ethics-ethics-30': { beat: 7, phrase: 'When they conflict, no formula decides between them' },
  'aesthetics-aesthetics-30': { beat: 5, phrase: 'Beauty can affect a person with physical force' },
  'political-political-30': { beat: 3, phrase: 'you do not first need the greatest painting there is' },
};

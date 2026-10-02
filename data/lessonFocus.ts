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
};

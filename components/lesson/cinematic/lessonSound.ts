// ─────────────────────────────────────────────────────────────────────────────
// WHICH LESSONS HAVE A VOICE. All of them, now.
//
// The cinematic cues — the page turn, the answer notes, the clasp on a saved
// quote, the footfalls, the gesture whooshes — all live in the SHARED player, so
// this one function decided whether 1 lesson made a noise or 102. It was held to
// a single lesson (`ethics-ethics-7`, Moral Luck) while the sound design was
// judged, on the reasoning that a set of sounds that turns out to be wrong is
// wrong 102 times.
//
// That trial is over and the set stood up, so this is open. The rollback is the
// same one line it always was: put the Set back and return `TRIAL.has(lessonId)`.
// Deliberately the same shape as removing an entry from the CINEMATIC map (§17)
// — one line, no other file involved, nothing downstream needs to know.
//
// ── WHAT "ALL OF THEM" ACTUALLY MEANS, PER LESSON ───────────────────────────
//
// This gate is necessary but not sufficient, and the difference is the whole
// reason turning it on is safe. The player only sounds what the SCENE hands it:
//
//   · the shell cues (beat, answers, quote, summary) need nothing from the scene
//     and are identical everywhere, so those really are on for all 102
//   · FOOTFALLS need `walk={X}` and GESTURES need `gesture={P}` — an opt-in that
//     asserts the scene drives ONE figure through `travelStance` with the default
//     seed, which is the only case ./footfalls solves for
//
// 44 of the 100 scenes qualify; 52 never walk anyone and 4 walk two figures, and
// all 56 stay silent underfoot by construction rather than by anybody's care.
// `validate-sound` re-derives that split and fails if a scene claims a walk it
// does not have — or has one it never claimed.
//
// ── AND IT CAN NOW BE HEARD ─────────────────────────────────────────────────
//
// This file used to end by warning that none of it reaches a binary from Play,
// because `expo-audio` postdates build 16 and §22's rule is absolute: an OTA
// cannot add a native module to a binary that lacks one. That was true when it
// was written and stopped being true at BUILD 19, which carries `expo-audio`.
// With `MIN_VERSION_CODE` at 20, every reachable reader is on a binary that can
// make a noise, so this ships over the air like anything else.
// ─────────────────────────────────────────────────────────────────────────────

export function lessonHasSound(_lessonId: string): boolean {
  return true;
}

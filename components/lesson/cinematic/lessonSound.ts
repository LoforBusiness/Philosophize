// ─────────────────────────────────────────────────────────────────────────────
// WHICH LESSONS HAVE A VOICE YET.
//
// The cinematic cues — the page turn, the answer notes, the clasp on a saved
// quote, the footfalls — all live in the SHARED player, so wiring them switched
// them on for all 102 lessons at once. This gate holds them to one lesson while
// the sound design is being judged, because a set of sounds that turns out to be
// wrong is wrong 102 times.
//
// ROLL OUT by replacing the body with `return true`. Roll back by putting the set
// back. It is deliberately the same shape as removing an entry from the CINEMATIC
// map (§17): one line, no other file involved, and nothing downstream needs to
// know which way it is set.
//
// TWO THINGS THIS DOES NOT GATE, both already live for everyone:
//   · the button tap (PressableScale) and the stroll on Home
//   · the chime at the end of a lesson
// Those shipped in the previous update and are not part of the trial.
//
// And one thing worth remembering before judging any of it: NONE of it can be
// heard on a binary from Play. `expo-audio` postdates build 16 and §22's rule is
// absolute — an OTA cannot add a native module to a binary that lacks one. Expo
// Go is the only way to hear this until the next build ships.
// ─────────────────────────────────────────────────────────────────────────────

const TRIAL = new Set<string>([
  'ethics-ethics-7',   // Moral Luck — walks the ground line, two graded questions,
                       // a saved quote and a summary, so it exercises every cue
]);

export function lessonHasSound(lessonId: string): boolean {
  return TRIAL.has(lessonId);
}

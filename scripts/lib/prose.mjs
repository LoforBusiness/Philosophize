// THE BEAT FIELDS THAT ARE WORDS, NOT PICTURE.
//
// A beat's keys are either prose the deck reads or channels the scene draws from.
// `check:idle` and `check:still` both ask "did anything on the stage change on this
// tap?", which means setting the prose aside first — and two copies of that list is
// how two checks end up disagreeing about what a picture is. It lived in the pen
// marks' rule file (scripts/lib/marks.mjs) until the marks went with the narrated
// library on 2026-10-02; it is the same set, moved.
export const PROSE = new Set(['text', 'cite', 'say', 'quote', 'tap', 'mc', 'interact', 'summary', 'must', 'dur', 'speaker', 'markup']);

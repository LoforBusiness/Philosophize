// ONE SWITCH, FOR THE MEASURING HARNESSES ONLY.
//
// scripts/measure-must.mjs records what each beat draws and when, and everything in
// group K is derived from that recording. If the recording were taken with tours
// LIVE, it would be measuring a timeline the tours themselves had already shifted:
// the clock is gated while the camera travels (K1), so reveals land later in wall
// time, a sweep reads less content per beat, the boxes come out SMALLER, and smaller
// boxes generate tighter tours on the next run. That is a ratchet, it turns in the
// dangerous direction, and nothing about it is visible in the output — the table
// would simply get more confident every time anyone regenerated it.
//
// So the harnesses ask for the un-toured lesson and measure the scene's own
// timeline, which is the fixed thing all of this is supposed to be derived from.
// scripts/check-frame.mjs sets it for the same reason from the other side: its
// question is "what does the AUTHORED camera crop", and a station deliberately
// framing one cluster at 1.72× would answer it with several hundred false positives.
//
// The tour's own safety is not sampled at all — `checkTour` proves containment per
// station by arithmetic, offline, for every station in the app (K3). That is the
// stronger check of the two, which is what makes turning this off in a harness a
// simplification rather than a blind spot.
//
// It is never set by the app. `app/previewframe.tsx` is written and deleted by the
// harness that uses it.
let off = false;

export function setToursOff(v: boolean) {
  off = v;
}

export function toursOff(): boolean {
  return off;
}

// AND A SECOND SWITCH, FOR THE BUBBLES, FOR THE SAME HARNESS.
//
// The player draws the thought bubble and the answer reply inside the stage, and the
// probe records every worded leaf there — so a lesson re-measured with bubbles live
// records its own bubble as stage text, with the box and the trail as art. Its boxes
// then protect the bubble, the camera frames it, and make:thoughts places the next
// bubble clear of where the last one was: a table that feeds on its own output.
// Five of twelve lessons re-measured on 2026-09-11 came back that way.
//
// It turns off the PEN MARKS too (StageMark.tsx), for the identical reason: a mark is a
// player-drawn stroke inside the stage, and recorded as art it would teach make:marks to
// place the next mark clear of where the last one was.
let quiet = false;

export function setThoughtsOff(v: boolean) {
  quiet = v;
}

export function thoughtsOff(): boolean {
  return quiet;
}

// AND A THIRD SWITCH, FOR THE MOVEMENT LAYER (wander.ts), FOR THE SAME HARNESS.
//
// A must-box is a MOMENT, not a place — the probe reads one instant of a beat, and
// CLAUDE.md records what that already cost once: on a walking beat it caught the
// figure mid-stride, so 113 of 317 beats recorded him 40 units from where the beat
// leaves him, and every bubble anchored on that offset came to rest beside him.
//
// The movement layer walks him about on purpose, so measuring with it live would
// record whichever step he happened to be taking — and the room it is allowed to
// walk him through is derived from those very boxes. That is the bubbles' own
// feedback loop with a longer lever: a box recorded 40 units left narrows the clear
// floor, which moves the next run's plan, which moves the box again.
let rooted = false;

export function setWanderOff(v: boolean) {
  rooted = v;
}

export function wanderOff(): boolean {
  return rooted;
}

// AND A FOURTH, FOR THE VISITOR (Visitor.tsx), FOR THE SAME HARNESS AND THE SAME LOOP.
//
// The player draws him inside the stage, so a live visitor is recorded as a plain
// figure — and make:visitor, which skips only the synthetic boxes make:wardrobe writes
// for him (`v`), then reads his own measured body as an obstacle standing on his own
// spot and refuses him. The next re-measure no longer draws him, so the run after that
// gives him back: the count wandered 36 → 30 → 25 across one day's re-measures
// (2026-09-24). The camera still frames him, through make:wardrobe's synthetic box.
let alone = false;

export function setVisitorOff(v: boolean) {
  alone = v;
}

export function visitorOff(): boolean {
  return alone;
}

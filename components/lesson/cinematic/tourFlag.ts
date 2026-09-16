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

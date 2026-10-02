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

// AND A SECOND SWITCH: "A HARNESS IS MEASURING", FOR THE SAME HARNESSES.
//
// A must-box is a MOMENT, not a place — the probe reads one instant of a beat — so
// anything that only exists to soften a moment has to stand aside while it reads.
// `useLinger` (useLinger.ts) keeps the last beat's things mounted while they fade, and
// under a harness it lets them go at once, because a must-box records what the BEAT
// stages and the probe's first read lands inside the fade.
//
// The name is historical. It began as the switch for the movement layer (wander.ts,
// group AF), which walked the lead about on purpose; that layer, the thought bubble,
// the pen marks and the visitor — each of which had a switch of its own here — went
// with the narrated library on 2026-10-02. This one stayed because useLinger reads
// it, and every dialogue scene uses useLinger.
let rooted = false;

export function setWanderOff(v: boolean) {
  rooted = v;
}

export function wanderOff(): boolean {
  return rooted;
}

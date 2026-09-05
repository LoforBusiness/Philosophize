// HOW OFTEN THE APP MAY ASK FOR A RATING.
//
//   "instead of being very seldom ... I want it to show up once per day. and it
//    will show up the first time the user opens the app each day."
//
// NO IMPORTS IN THIS FILE, deliberately -- the same rule `rig.ts`, `tone.ts` and
// `dialHit.ts` hold. `check-rate.mjs` feeds it dates in plain Node, so the whole
// policy is testable without a store, a clock or a phone.
//
// == IT IS A CALENDAR DAY, AND NOT TWENTY-FOUR HOURS =========================
//
// These are two different rules and only one of them keeps the promise, so the
// choice is not a detail. A rolling 24-hour window asked at 9pm on Monday
// REFUSES the reader's 8am open on Tuesday -- so the sheet does not arrive on
// the first open of the day, it arrives on whichever open happens after 9pm,
// and from there it WALKS LATER through the week until it crosses midnight and
// silently skips a whole day. A calendar day cannot drift: midnight clears it,
// and the next open of any kind is the first open of that day.
//
// LOCAL midnight, not UTC, for the same reason `useTodayKey` reads local dates:
// a reader west of Greenwich would otherwise be handed a new day part-way
// through their evening, and one east of it would lose the early morning.
//
// == WHAT THIS REPLACED, AND THE TWO RULES THAT SURVIVED IT ==================
//
// Sixty days between asks, at most three a year, and five more finished lessons
// each time -- Apple's published ceiling with a wide margin laid on top. That
// whole policy is gone by instruction. The two rules left are the two that were
// never about frequency: somebody who SUBMITTED a rating is never asked again,
// and nobody is asked before onboarding has finished.
//
// == WHY A DAILY CUSTOM SHEET IS A UX DECISION AND NOT A POLICY ONE ==========
//
// Worth stating plainly, because "three a year" reads like a law and is not one
// here. Apple's limit is enforced by the system inside `SKStoreReviewController`
// and binds that API; Google's In-App Review API keeps its own quota. This sheet
// is neither of them -- it is drawn by us, and the only platform call it makes
// is `Linking.openURL` to the Play listing. There is also no iOS build: the
// component returns null on iOS and the update gate skips it.
//
// The rule both stores DO enforce is review GATING -- filtering who gets asked,
// or sending only the happy ones to the listing. Nothing here does that: every
// reader is offered the same door at any star count. So the cadence is the only
// thing that changed, and the cost of pitching it wrong is a rating that drifts
// down, not a listing that gets pulled.
//
// == THE HALF OF THE CADENCE THIS FILE CANNOT ENFORCE ========================
//
// A daily ask is only "once a day" if it is RECORDED WHEN IT IS RAISED. Marking
// it on DISMISSAL was harmless at sixty days and is not harmless here: a reader
// who backgrounds the app or force-quits with the sheet up has nothing written
// down, so the next open the same day raises it again -- and "once per day"
// quietly becomes "every launch until you dismiss it properly", which is the
// one failure this cadence cannot afford. `RatePromptHost` notes the ask at the
// moment it opens, and `check-rate.mjs` reads the source to hold it there.

/** One raise per calendar day, until they answer. */
export const ASKS_PER_DAY = 1;

export interface RateHistory {
  /** They submitted a rating. The question is answered; never ask again. */
  settled: boolean;
  /** When the sheet was last raised. Epoch ms; 0 for never. */
  askedAt: number;
}

/**
 * The same local calendar day? The entire cadence is this comparison, which is
 * why it is a named function rather than an inline subtraction: a subtraction is
 * how you accidentally write the 24-hour rule the header argues against.
 */
export function sameLocalDay(a: number, b: number): boolean {
  const x = new Date(a);
  const y = new Date(b);
  return x.getFullYear() === y.getFullYear()
    && x.getMonth() === y.getMonth()
    && x.getDate() === y.getDate();
}

/**
 * May the app raise the sheet right now?
 *
 * `onboarded` gates the very first ask to the end of onboarding, which is where
 * the brief put it. Everything after that is one a day.
 */
export function mayAsk(h: RateHistory, now: number, onboarded: boolean): boolean {
  if (h.settled) return false;
  if (!onboarded) return false;
  // Never asked. `0` rather than a nullable, so the store field is one number
  // with no second state to handle.
  if (!h.askedAt) return true;
  return !sameLocalDay(h.askedAt, now);
}

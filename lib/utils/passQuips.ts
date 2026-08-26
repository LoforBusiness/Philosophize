// ─────────────────────────────────────────────────────────────────────────────
// THE HERALD — what the stickman says while standing next to the certificate.
//
// ZERO IMPORTS and it never reads the clock, the same rule as rig.ts, tone.ts and
// streakMood.ts, and for the same two reasons: the whole pool can be stepped in
// plain Node, which is how `npm run check:quips` measures every line against the
// bubble it lands in; and a function that consulted `new Date()` itself could
// disagree with the screen that called it.
//
// ── THE CHARACTER, WHICH IS THE SAME ONE ────────────────────────────────────
//
// He is the streak mascot and the reward-screen loafer. Smug, deadpan, faintly
// exasperated, and always at the reader's expense. The hard line carries over
// unchanged and `check:quips` holds it here too: he needles ATTENDANCE and
// CHOICES, never ABILITY. "You have been hovering" is fair. "You are bad at this"
// is the sentence most likely to make a beginner leave.
//
// ── AND ONE NEW RULE, BECAUSE THIS SCREEN TAKES MONEY ───────────────────────
//
// NO LINE MAY CARRY A FIGURE. Not a price, not a lesson count, not the number of
// rest days the Pass holds. Every one of those is derived somewhere — passValue
// counts the library out of the tree, `REST_CAP_PRO` sets the rest days, the
// price comes from the store — and a number typed into a joke is a number that
// goes stale silently. CLAUDE.md was claiming 132 saveable quotes when the real
// figure was 228; a certificate can be re-derived, but nobody re-derives a gag.
// The certificate states the facts. He is only allowed to be rude about them.
//
// ── TWO POOLS, BECAUSE HALF THE READERS HAVE ALREADY PAID ───────────────────
//
// A subscriber who opens this tab and gets sold to has been told the app is not
// keeping track. So `pro` is a wholly separate pool with nothing to sell in it —
// he congratulates, then goes back to being unbearable.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A gesture code from rig.ts's `emoteHold` table.
 *
 * EVERY ONE OF THESE WAS DRAWN BEFORE IT WAS CHOSEN, which streakMood.ts records
 * as the hard-won part: its first set was picked by NAME and three of six came
 * out a solid black blob, because the rig draws in PROFILE with 11-unit limbs
 * against a 12-unit torso, so any pose folding an arm against the body merges
 * into one mass. Nothing numeric catches it — nothing is out of range.
 *
 * Ten poses, contact-sheeted at the size the herald is actually drawn, every one
 * with its gesturing arm clear of the torso. `hand-on-hip` was sheeted alongside
 * as a control and is the blob, exactly as recorded.
 */
export const POSE = {
  point: 13,     // point-forward — a straight arm, aimed at the certificate.
  sweep: 5,      // sweep — presenting the whole thing. "Behold."
  weigh: 21,     // weigh — one hand up, one down. For a line with two sides.
  wide: 7,       // both-wide — arms open and empty. "Well?"
  present: 2,    // present-up — offering it forward.
  reach: 14,     // reach-out — held out to the reader.
  open: 33,      // release-open — both arms low and wide. Resigned.
  shrug: 8,      // shrug — not taking responsibility for your decision.
  wave: 23,      // wave — hello, again, still here.
  proclaim: 35,  // proclaim — arm up. The only triumphant one.
} as const;

export type PoseName = keyof typeof POSE;

export interface Quip {
  /** What he says. One or two short sentences, his voice. */
  line: string;
  /** The pose he holds while saying it — chosen to fit the line, not at random. */
  pose: PoseName;
}

/**
 * TO SOMEBODY WHO HAS NOT SUBSCRIBED.
 *
 * The brief was "something to make the user want to subscribe", and the way this
 * character does that is not enthusiasm — it is pointing out, wearily, that the
 * thing is already built and they are standing outside it. Every line here is
 * about a fence that genuinely exists: the daily limit, the advertisements, not
 * being able to re-read a lesson, not being able to start the unit you want.
 */
export const FREE_QUIPS: readonly Quip[] = [
  { line: 'That one. That is the one you cannot have.', pose: 'point' },
  { line: 'Behold. A door. You are on the wrong side of it.', pose: 'sweep' },
  { line: 'Everything on that card is already built. You cannot open it.', pose: 'point' },
  { line: 'On one hand, a lesson a day. On the other, all of them.', pose: 'weigh' },
  { line: 'Well? The certificate is right there. I am right here.', pose: 'wide' },
  { line: 'Go on. Nobody is watching. Except me. Closely.', pose: 'reach' },
  { line: 'No advertisements. Ever. Imagine the silence.', pose: 'open' },
  { line: 'Up to you. It is only your one finite life.', pose: 'shrug' },
  { line: 'Hello. Yes, again. I live here now.', pose: 'wave' },
  { line: 'One tap and you never see me sell you anything again.', pose: 'proclaim' },
  { line: 'This is the part where you pretend to think about it.', pose: 'point' },
  { line: 'Read it slowly. It will not get any cheaper.', pose: 'present' },
  { line: 'I have nothing else on. Take all the time you need.', pose: 'wide' },
  { line: 'Take it. It is not going to take itself.', pose: 'reach' },
  { line: 'Or stay free. Plenty of people do. I do not know any of them.', pose: 'open' },
  { line: 'I am not going to beg. I am going to stand here and hint.', pose: 'shrug' },
  { line: 'The lessons are written. All of them. Just sitting there.', pose: 'sweep' },
  { line: 'You have been rationed. By a stick figure. Sit with that.', pose: 'point' },
  { line: 'You cannot re-read a lesson you finished. Strange rule, that.', pose: 'weigh' },
  { line: 'Locked units. In a philosophy app. At least the irony is free.', pose: 'shrug' },
  { line: 'Kant never waited for tomorrow. Kant had no daily limit.', pose: 'present' },
  { line: 'I would explain it, but the certificate does it better.', pose: 'point' },
  { line: 'Six branches. You are allowed to walk one of them, slowly.', pose: 'weigh' },
  { line: 'Diogenes owned nothing and still got further than this.', pose: 'open' },
  { line: 'Think of it as tuition. Extremely cheap tuition.', pose: 'present' },
  { line: 'Everything you have stays. This only takes the fences down.', pose: 'sweep' },
  { line: 'I am obliged to mention this exists. Consider it mentioned.', pose: 'wave' },
  { line: 'Some people subscribe immediately. I like those people.', pose: 'shrug' },
  { line: 'It renews monthly. So does your indecision, apparently.', pose: 'weigh' },
  { line: 'Cancel whenever you like. That is not a trick, it is just true.', pose: 'open' },
  { line: 'The free tier is a taster. You have been tasting for a while.', pose: 'point' },
  { line: 'I have seen your streak. Imagine it with rest days spare.', pose: 'present' },
  { line: 'You want to skip to the interesting unit. I know. I watched.', pose: 'point' },
  { line: 'Aristotle taught for nothing. He also had a patron. Be a patron.', pose: 'proclaim' },
  { line: 'Look at it. Properly. That is a very nice certificate.', pose: 'sweep' },
  { line: 'Nothing on that card is invented. I checked every line myself.', pose: 'point' },
  { line: 'You will subscribe eventually. We could skip the middle part.', pose: 'wide' },
  { line: 'I could do this all day. I do, in fact, do this all day.', pose: 'shrug' },
  { line: 'One lesson a day is a diet. That certificate is a meal.', pose: 'weigh' },
  { line: 'Take the Pass or do not. But please stop hovering.', pose: 'wide' },
  { line: 'I am not calling you cheap. I am standing here meaningfully.', pose: 'open' },
  { line: 'Socrates charged nothing. It ended badly. Learn from it.', pose: 'present' },
  { line: 'Your ancestors walked to libraries. You have a button.', pose: 'point' },
  { line: 'It costs less a month than things you buy without thinking.', pose: 'weigh' },
  { line: 'Every branch, open, tonight. Or one lesson. Not my decision.', pose: 'sweep' },
  { line: 'You are hovering again. I can see you hovering.', pose: 'wide' },
  { line: 'The wall is not there because the lessons are not ready.', pose: 'point' },
  { line: 'A philosopher would ask what you are really waiting for.', pose: 'weigh' },
  { line: 'Fine. Stay. But do not complain to me about the pace.', pose: 'shrug' },
  { line: 'I polished that certificate twice. Do read it.', pose: 'sweep' },
];

/**
 * TO SOMEBODY WHO ALREADY PAYS.
 *
 * Nothing to sell, so nothing is sold. The needle turns from "you have not" to
 * "you have, and you are still standing here looking at the card rather than
 * reading anything" — which is the only honest thing left to be rude about.
 */
export const PRO_QUIPS: readonly Quip[] = [
  { line: 'You already own it. Yes, all of it. Stop looking at me.', pose: 'shrug' },
  { line: 'A subscriber. In my presence. I feel quite grand.', pose: 'proclaim' },
  { line: 'Nothing to sell you. It is unsettling. I may need a hobby.', pose: 'open' },
  { line: 'Everything is open. Go and open something.', pose: 'point' },
  { line: 'You pay for this, which makes standing here my actual job.', pose: 'wave' },
  { line: 'No limits, no adverts, and still you came to read the card.', pose: 'wide' },
  { line: 'The Pass is yours. The reading is still on you, though.', pose: 'weigh' },
  { line: 'I have nothing to persuade you of. It is oddly quiet.', pose: 'open' },
  { line: 'Fully unlocked. Now for the difficult part: doing it.', pose: 'point' },
  { line: 'You bought a library. A library is not a personality.', pose: 'weigh' },
  { line: 'Scholar. It suits you. Do not let it go to your head.', pose: 'present' },
  { line: 'The whole library, waiting. No pressure. Some pressure.', pose: 'sweep' },
  { line: 'Thank you, genuinely. Now back to being unbearable.', pose: 'wave' },
  { line: 'You are on the good side of the certificate. Well done.', pose: 'proclaim' },
  { line: 'I used to have a whole speech for you. It is wasted now.', pose: 'shrug' },
  { line: 'Nothing is locked now. The only thing stopping you is you.', pose: 'wide' },
];

/**
 * A stable quip from the day and the tier.
 *
 * THE DAY RATHER THAN THE CLOCK, and the same reasoning streakMood.ts gives: the
 * same day shows the same line all day, so a reader who opens this tab twice is
 * not talking to two different people, and tomorrow it has moved on. Re-rolling
 * per visit would also mean the line changed under a reader who was mid-way
 * through reading it, on the one screen where they are being asked to decide
 * something.
 *
 * The tier is folded into the hash rather than only selecting the pool, so
 * subscribing on a given day visibly changes what he says on that day — which is
 * the whole point of there being two pools.
 */
export function quipFor(isPro: boolean, dayKey: string): Quip {
  const pool = isPro ? PRO_QUIPS : FREE_QUIPS;
  // FNV-1a with a Murmur3 finaliser, the same mixer RewardLoafer uses and for the
  // same measured reason: every seed on a given day ends in the same characters,
  // and a plain `h·31 + c` leaves the low bits dominated by exactly those. Taken
  // mod a pool size that happens to be even, that clusters badly.
  let h = 2166136261;
  const seed = `${isPro ? 'pro' : 'free'}:${dayKey}`;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  h ^= h >>> 16; h = Math.imul(h, 2246822507);
  h ^= h >>> 13; h = Math.imul(h, 3266489909);
  h ^= h >>> 16;
  return pool[(h >>> 0) % pool.length];
}

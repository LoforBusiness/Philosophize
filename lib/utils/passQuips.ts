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

  // ── A SECOND ROUND, because a pool a reader meets DAILY runs out ────────
  //
  // Fifty is a fortnight and a half before he starts repeating himself, which
  // is fine for a tab nobody visits twice — and this is not that tab. Same
  // voice, same rule: he is rude about the fence and about attendance, never
  // about whether the reader is any good at this.
  { line: 'You have opened this tab before. I remember.', pose: 'wave' },
  { line: 'The fence is the only thing here that is not already written.', pose: 'point' },
  { line: 'Marcus Aurelius wrote at night, after work. You have a phone.', pose: 'present' },
  { line: 'It costs less than a coffee you would finish without noticing.', pose: 'weigh' },
  { line: 'I did not write the certificate. I only stand near it.', pose: 'sweep' },
  { line: 'You could be reading. You are watching a man made of lines.', pose: 'wide' },
  { line: 'Nothing in there expires. The evening does, though.', pose: 'point' },
  { line: 'Two taps and I stop selling. That is the entire offer.', pose: 'reach' },
  { line: 'The lock is not a puzzle to solve. It is just a lock.', pose: 'shrug' },
  { line: 'You have scrolled past this before. I keep a tally.', pose: 'wave' },
  { line: 'Say no. I will be standing here again tomorrow.', pose: 'open' },
  { line: 'The pace is set by the fence, not by you. Odd, that.', pose: 'weigh' },
  { line: 'Hume would want evidence. It is ruled and printed below.', pose: 'point' },
  { line: 'One lesson, then the door shuts. Every single evening.', pose: 'point' },
  { line: 'I would sulk, but I am a stick figure. This is my sulking.', pose: 'shrug' },
  { line: 'Somewhere behind that is the unit you actually wanted.', pose: 'sweep' },
  { line: 'Free is a perfectly good price. It is also the slowest.', pose: 'weigh' },
  { line: 'You keep coming back to look at the fence. Interesting.', pose: 'wide' },
  { line: 'Nothing I say will move you. The card underneath might.', pose: 'present' },
  { line: 'Spinoza paid for his evenings in lens dust. Yours cost less.', pose: 'weigh' },
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

  // ── AND THE POOL THAT MATTERS MOST WAS THE SMALLEST ─────────────────────
  //
  // CLAUDE.md's own rule: the pool size that counts is the one a reader
  // actually draws from. A subscriber never sees a single FREE line, so their
  // whole experience of this character was sixteen lines against the free
  // tier's fifty — the people who have paid were the ones hearing him repeat
  // himself inside a fortnight.
  { line: 'Still here. Still paid up. Still not reading anything.', pose: 'wide' },
  { line: 'The gate is open. It has been open for some time now.', pose: 'sweep' },
  { line: 'You have all of it. Nothing left to threaten you with.', pose: 'open' },
  { line: 'A Scholar, admiring the paperwork. Very on brand.', pose: 'point' },
  { line: 'I could recommend a branch. You would not take it.', pose: 'shrug' },
  { line: 'No fences, no adverts, no excuses. Especially the last one.', pose: 'weigh' },
  { line: 'You are paying me to stand here. Sit with that a moment.', pose: 'wave' },
  { line: 'Every unit unlocked and waiting. Waiting rather a long time.', pose: 'sweep' },
  { line: 'I have been demoted from salesman to decoration. I cope.', pose: 'open' },
  { line: 'The certificate is settled. The reading list is not.', pose: 'weigh' },
  { line: 'Your name is on it. Now go and earn the rest of it.', pose: 'present' },
  { line: 'You could open any lesson in the library. Right now. Any one.', pose: 'point' },
  { line: 'Rest days in the bank and nowhere you need to spend them.', pose: 'wide' },
  { line: 'Subscribed and idle is an expensive way to be idle.', pose: 'shrug' },
  { line: 'Aristotle had a patron too. His did the reading, mind you.', pose: 'weigh' },
  { line: 'The hard part was never the payment. Sorry to be the one.', pose: 'weigh' },
  { line: 'Good. Now do the thing you bought it for.', pose: 'proclaim' },
  { line: 'You are inside the fence now. It is quieter in here.', pose: 'sweep' },
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

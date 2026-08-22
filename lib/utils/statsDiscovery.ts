// ─────────────────────────────────────────────────────────────────────────────
// WHAT A TAP ON A GRAPH SHOULD TELL YOU — AND IT IS NOT ARITHMETIC.
//
// ZERO IMPORTS, the same rule as `statsMilestone.ts` beside it: every candidate
// is passed IN, so the whole rule runs in plain Node and `check-stats.mjs` runs
// it across hundreds of synthetic readers.
//
// ── THE COMPLAINT ───────────────────────────────────────────────────────────
//
//   > "I dont like the obvious information that is presented when you click on
//   > any of the graphs, like '5 more lessons and your at 20 lessons done' this
//   > is obvious and isnt informative and makes the user actually want to learn
//   > more."
//
// Right. "You have 15, five more is 20" is a sentence that tells a reader
// something they can see, in a place where the app knows a great deal they
// cannot. It is the shape of a progress bar wearing words.
//
// ── WHAT THE APP ACTUALLY KNOWS ─────────────────────────────────────────────
//
// 322 thinkers, each with a ONE-LINER (their core idea in ten words), a symbol,
// a lifespan, and exactly three "Did you know?" facts. The reader has met some
// small number of them. So the interesting thing to say when someone taps
// Metaphysics is not how many lessons are left in it — it is:
//
//     SOMEONE YOU HAVE NOT MET
//     Parmenides · 515–450 BCE
//     "Nothing comes from nothing; change is an illusion."
//
// That is specific, it is genuinely new, and it points at a door. And for a
// thinker the reader HAS read, the equivalent is one of their facts, which is
// the same trick the philosopher sheet already uses to make a profile worth
// opening.
//
// ── WHY IT IS DETERMINISTIC, AND WHY IT STILL MOVES ─────────────────────────
//
// No `Math.random`. A discovery that re-rolled on every render would flicker
// while the reader was looking at it, and one that re-rolled on every tap would
// make the tap feel like a slot machine rather than a fact about their reading.
// The pick is a hash of the row's key and HOW MUCH THE READER HAS DONE THERE —
// so it is stable while they look at it, and turns over as they progress.
//
// ── NOTHING HERE IS A CEILING ───────────────────────────────────────────────
//
// "A thinker you have not met" gets MORE interesting as the app grows, which is
// the opposite of the failure `statsMilestone.ts` documents. It never counts
// down to a total and never says how many are left.
// ─────────────────────────────────────────────────────────────────────────────

export interface Candidate {
  id: string;
  name: string;
  /** One emoji that evokes them. */
  symbol: string;
  /** Their core idea in ten words or fewer. */
  oneLiner: string;
  lifespan: string;
  /** Era group key — used when the row being tapped is an era. */
  group: string;
  branchSlugs: string[];
  /** Has the reader opened their page? */
  met: boolean;
  /** How many of the reader's lessons were about them. */
  lessons: number;
}

export type DiscoveryKind = 'meet' | 'fact' | 'nudge';

export interface Discovery {
  kind: DiscoveryKind;
  /** The small caps line above — what KIND of thing this is. */
  kicker: string;
  /** The name, when there is one. */
  name?: string;
  /** Lifespan or era, set beside the name. */
  meta?: string;
  symbol?: string;
  /** The one line worth reading. */
  body: string;
  /** Set when tapping through to a thinker makes sense. */
  philosopherId?: string;
}

/**
 * A small, stable, non-cryptographic string hash.
 *
 * FNV-1a. It exists so a pick can be reproducible in a test and in the app at
 * once — `Math.random` would make both impossible and would also re-roll the
 * card while the reader was reading it.
 */
export function hash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Ends a sentence, unless whatever it ends with already did. */
function sentence(s: string): string {
  const t = s.trim();
  return /[.!?"'’”]$/.test(t) ? t : `${t}.`;
}

/**
 * SOMEONE IN THIS PART OF THE LIBRARY THE READER HAS NEVER OPENED.
 *
 * `pool` is already narrowed to the row that was tapped — a branch's thinkers,
 * or an era's. `seed` distinguishes rows and turns the pick over as the reader
 * progresses.
 *
 * Unmet thinkers are preferred, and among them the ones who turn up in the most
 * branches: those are the thinkers a reader will keep bumping into, so meeting
 * them pays off across the whole app rather than in one corner of it.
 */
export function discoverIn(pool: Candidate[], seed: string): Discovery | null {
  if (pool.length === 0) return null;

  const unmet = pool.filter((p) => !p.met);
  if (unmet.length > 0) {
    // Sorted before picking, because a pool arriving in a different order would
    // otherwise hand the same reader a different card for the same tap.
    const ranked = [...unmet].sort(
      (a, b) => (b.branchSlugs.length - a.branchSlugs.length) || (a.id < b.id ? -1 : 1),
    );
    // From the most-connected third, so the card is worth reading, but not
    // always the single top one, or it would never change.
    const span = Math.max(1, Math.ceil(ranked.length / 3));
    const pick = ranked[hash(seed) % span];
    return {
      kind: 'meet',
      kicker: 'SOMEONE YOU HAVE NOT MET',
      name: pick.name,
      meta: pick.lifespan,
      symbol: pick.symbol,
      body: sentence(pick.oneLiner),
      philosopherId: pick.id,
    };
  }

  // Everyone here has been met — say something about the one they have read
  // most instead. This is the good problem, and it should not read as an error.
  const best = [...pool].sort((a, b) => (b.lessons - a.lessons) || (a.id < b.id ? -1 : 1))[0];
  return {
    kind: 'nudge',
    kicker: 'YOU HAVE MET EVERYONE HERE',
    name: best.name,
    meta: best.lifespan,
    symbol: best.symbol,
    body: sentence(best.oneLiner),
    philosopherId: best.id,
  };
}

/**
 * ONE OF A THINKER'S THREE FACTS — for a row that IS a thinker.
 *
 * The reader has read them, so "you have not met them" is the wrong card. What
 * they almost certainly do not know is the fact, which is the same material the
 * philosopher sheet uses to make a profile worth opening.
 */
export function discoverFact(
  name: string, id: string, facts: string[], seed: string, symbol?: string, meta?: string,
): Discovery | null {
  if (!facts || facts.length === 0) return null;
  return {
    kind: 'fact',
    kicker: 'DID YOU KNOW',
    name,
    meta,
    symbol,
    body: sentence(facts[hash(seed) % facts.length]),
    philosopherId: id,
  };
}

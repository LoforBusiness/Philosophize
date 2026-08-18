// ─────────────────────────────────────────────────────────────────────────────
// THE NUMBERS BEHIND A THINKER'S PROFILE.
//
// Everything here is DERIVED from records that already exist — a lifespan
// string, a branch list, a quote array, the views the store already keeps. None
// of it is a new field somebody has to remember to fill in, which is the only
// reason a stat can be promised for all 322 rather than for the ones somebody
// got round to.
//
// The arithmetic that does not need the philosopher list lives in
// `lifespan.ts`, which has no imports and is checked in plain Node. This file is
// the part that has to see everybody.
// ─────────────────────────────────────────────────────────────────────────────
import { ALL_PHILOSOPHERS, eraGroupOf, type Philosopher, type EraGroup } from '@/data/philosophers';
import { parseLifespan, overlaps, type Lifespan } from './lifespan';

/** Parsed once for the whole app. 322 regexes is nothing, but it is not nothing per render. */
const SPANS: Record<string, Lifespan> = {};
for (const p of ALL_PHILOSOPHERS) SPANS[p.id] = parseLifespan(p.lifespan);

export function lifespanOf(id: string): Lifespan {
  return SPANS[id] ?? parseLifespan('');
}

export interface Contemporaries {
  /** Everyone whose life overlapped theirs. The median thinker has 33. */
  count: number;
  /** Three of them, worth tapping through to. */
  notable: Philosopher[];
}

/**
 * Who else was alive.
 *
 * THE HARD PART IS NOT THE OVERLAP, IT IS WHICH THREE TO NAME. The median
 * thinker overlaps 33 others and the busiest overlaps 143, so a list is out and
 * a choice has to be made. There is no notability field and inventing one for
 * 322 records would be a month of judgement calls nobody could check.
 *
 * QUOTE COUNT IS THE PROXY. It runs 2–21 and it is not arbitrary: a thinker
 * accumulates quotable lines in this app roughly in proportion to how much of
 * them a general reader is expected to recognise. It is imperfect — it rewards
 * the aphorists — but it is a real signal already in the data, it is stable
 * across runs, and it never leaves the slot empty. Ties break on name so the
 * same three come back every visit; a profile that shuffles its contemporaries
 * each time you open it reads as broken rather than as varied.
 */
export function contemporariesOf(p: Philosopher): Contemporaries {
  const mine = lifespanOf(p.id);
  const all = ALL_PHILOSOPHERS.filter(
    (o) => o.id !== p.id && overlaps(mine, lifespanOf(o.id)),
  );
  const notable = [...all]
    .sort((a, b) => b.quotes.length - a.quotes.length || a.name.localeCompare(b.name))
    .slice(0, 3);
  return { count: all.length, notable };
}

export interface Collection {
  met: number;
  total: number;
  /** Per era, so the tab can show which shelf is nearly full. */
  byEra: Record<EraGroup, { met: number; total: number }>;
}

/**
 * How much of the 322 the reader has actually opened.
 *
 * `philosopherViews` is a count per id and has been recorded since long before
 * anything displayed it, so this lights up with real history rather than
 * starting everybody at zero.
 */
export function collectionOf(views: Record<string, number>): Collection {
  const byEra = {
    ANCIENT: { met: 0, total: 0 }, MEDIEVAL: { met: 0, total: 0 },
    MODERN: { met: 0, total: 0 }, CONTEMPORARY: { met: 0, total: 0 },
    EASTERN: { met: 0, total: 0 },
  } as Record<EraGroup, { met: number; total: number }>;
  let met = 0;
  for (const p of ALL_PHILOSOPHERS) {
    const era = eraGroupOf(p);
    byEra[era].total += 1;
    if (views[p.id]) { byEra[era].met += 1; met += 1; }
  }
  return { met, total: ALL_PHILOSOPHERS.length, byEra };
}

/** Has this thinker been opened before? Drives the collection card's two states. */
export function isMet(views: Record<string, number>, id: string): boolean {
  return Boolean(views[id]);
}

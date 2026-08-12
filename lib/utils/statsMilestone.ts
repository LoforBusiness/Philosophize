// ─────────────────────────────────────────────────────────────────────────────
// WHAT ONE MORE LESSON WOULD DO TO A CHART, AS PURE MATHS.
//
// ZERO IMPORTS, for the same reason `rig.ts` and `worldPath.ts` have none: this
// is the whole substance of the Insights tab's tap interaction, and a rule that
// can only be judged by tapping a phone is a rule nobody checks. Everything here
// runs in plain Node, and `scripts/check-stats.mjs` runs it.
//
// ── WHY THE TARGET IS NOT SIMPLY "+1 LESSON" ────────────────────────────────
//
// The obvious design is a ghost exactly one lesson wide. It is honest, it is
// always achievable, and it is invisible: a slice's interest is
// `lessons×3 + quotes×2 + views`, so against a filled-in profile one more lesson
// moves it about a point and a half — a FOUR DEGREE arc. That is not an
// animation, it is a rendering artifact, and the entire point of the interaction
// is that the reader sees the gap and wants to close it.
//
// So the ghost aims at whichever real milestone is CHEAPEST in actions the
// reader can actually take, and a candidate whose ghost would be too small to
// read is discarded in favour of a further one that can be seen. A target three
// lessons away that is visible beats one lesson away that is not.
//
// ── THE COST IS IN THE ACTION, NOT IN POINTS ────────────────────────────────
//
// "You need 7 more interest" is not a thing anyone can go and do. Every cost
// here comes back as a whole number of LESSONS or SAVED QUOTES, because those
// are the two things the app asks of a reader, and the copy names which.
// ─────────────────────────────────────────────────────────────────────────────

export type ActionKind = 'lesson' | 'quote';

/** One tappable thing on a chart: a pie slice or a bar. */
export interface StatElement {
  key: string;
  label: string;
  /** What the chart draws today. */
  value: number;
  /** How much ONE action adds to `value`. Must be > 0 or the element is inert. */
  perAction: number;
  action: ActionKind;
  /**
   * The largest `value` can ever become — a branch with every lesson done.
   * Omitted where there is no ceiling (a thinker can always be read more).
   */
  ceiling?: number;
  /** Lessons left in the unit currently in progress. Omitted if none is. */
  unitRemaining?: number;
  unitLabel?: string;
}

export type MilestoneKind = 'overtake' | 'round' | 'unit' | 'branch';

export interface Milestone {
  kind: MilestoneKind | 'complete';
  /** Whole actions needed. 0 only when `kind` is 'complete'. */
  cost: number;
  action: ActionKind;
  /** `value` once the cost is paid. Equals `value` when 'complete'. */
  projected: number;
  /**
   * How much bigger the ghost draws, 0–1, in the caller's own geometry:
   * pie → the added FRACTION OF THE CIRCLE, bar → the added fraction of the
   * tallest bar. 0 when 'complete'. The caller supplies `minGhost` in the same
   * units, so the floor is enforced here rather than trusted to each chart.
   */
  ghost: number;
  copy: string;
}

export interface MilestoneOpts {
  mode: 'pie' | 'bar';
  /** Smallest ghost that still reads. Below this a candidate is discarded. */
  minGhost: number;
}

function plural(cost: number, action: ActionKind): string {
  if (action === 'quote') return cost === 1 ? '1 more saved quote' : `${cost} more saved quotes`;
  return cost === 1 ? '1 more lesson' : `${cost} more lessons`;
}

/**
 * Ends a sentence, unless the thing it ends with already did.
 *
 * Lesson and unit titles are written as titles, and plenty of them are
 * questions: the first unit of Ethics is "What Is Ethics?", so the obvious
 * `…finishes ${label}.` renders as "finishes What Is Ethics?." — which no
 * arithmetic can catch and which showed up the moment the real screen was
 * loaded in a browser.
 */
function sentence(s: string): string {
  return /[.!?]$/.test(s.trim()) ? s.trim() : `${s.trim()}.`;
}

/** Whole actions to move `from` to at least `to`, never less than one. */
function actionsTo(from: number, to: number, perAction: number): number {
  if (perAction <= 0) return Infinity;
  const need = Math.ceil((to - from) / perAction);
  return need < 1 ? 1 : need;
}

/**
 * The nearest thing worth reaching for this element, or that there is none.
 *
 * `elements` is every tappable thing on the SAME chart — the ranking, the total
 * and the tallest bar all come from it, so a caller cannot pass a slice without
 * its siblings and get a silently wrong percentage.
 */
export function milestoneFor(
  elements: StatElement[], index: number, opts: MilestoneOpts
): Milestone {
  const me = elements[index];
  const none = (copy: string): Milestone => ({
    kind: 'complete', cost: 0, action: me.action, projected: me.value, ghost: 0, copy,
  });
  if (!me || me.perAction <= 0) return none(sentence(`${me?.label ?? ''} is complete`));

  const total = elements.reduce((a, e) => a + e.value, 0);
  const tallest = elements.reduce((a, e) => (e.value > a ? e.value : a), 0);
  const capped = (v: number) => (me.ceiling != null && v > me.ceiling ? me.ceiling : v);

  // The ghost, in the caller's units. A pie slice grows the WHOLE pie as it
  // grows, so the new fraction is over the new total — the naive
  // `added / total` overstates every ghost and would sail past `minGhost`.
  const ghostOf = (projected: number): number => {
    if (opts.mode === 'bar') {
      const scale = tallest > 0 ? tallest : 1;
      return (projected - me.value) / scale;
    }
    const newTotal = total + (projected - me.value);
    if (newTotal <= 0) return 0;
    return projected / newTotal - (total > 0 ? me.value / total : 0);
  };

  const pctAt = (projected: number): number => {
    const newTotal = total + (projected - me.value);
    return newTotal > 0 ? Math.round((projected / newTotal) * 100) : 0;
  };

  const cands: Milestone[] = [];

  // ── pass the one above ──────────────────────────────────────────────────
  // The nearest element ranked ABOVE me — not the overall leader, which on a
  // filled profile is usually unreachable and reads as a taunt rather than a nudge.
  let above: StatElement | null = null;
  for (const e of elements) {
    if (e.key === me.key || e.value <= me.value) continue;
    if (!above || e.value < above.value) above = e;
  }
  if (above) {
    const cost = actionsTo(me.value, above.value + 1, me.perAction);
    const projected = capped(me.value + cost * me.perAction);
    if (projected > me.value) {
      cands.push({
        kind: 'overtake', cost, action: me.action, projected, ghost: ghostOf(projected),
        copy: sentence(`${plural(cost, me.action)} and ${me.label} passes ${above.label}`),
      });
    }
  }

  // ── finish the unit you are in ──────────────────────────────────────────
  if (me.unitRemaining != null && me.unitRemaining > 0 && me.unitLabel) {
    const cost = me.unitRemaining;
    const projected = capped(me.value + cost * me.perAction);
    if (projected > me.value) {
      cands.push({
        kind: 'unit', cost, action: 'lesson', projected, ghost: ghostOf(projected),
        copy: sentence(`${plural(cost, 'lesson')} finishes ${me.unitLabel}`),
      });
    }
  }

  // ── the next round ten per cent ─────────────────────────────────────────
  // Pies only: a bar has no share of anything, so a percentage on one is a
  // number about a chart the reader is not looking at.
  if (opts.mode === 'pie' && total > 0) {
    const frac = me.value / total;
    const target = (Math.floor(frac * 10) + 1) / 10;
    if (target < 1) {
      // Solving v + c·p ≥ t·(T + c·p) for c, since my own gain lifts the total too.
      const denom = me.perAction * (1 - target);
      if (denom > 0) {
        const raw = (target * total - me.value) / denom;
        const cost = Math.max(1, Math.ceil(raw));
        const projected = capped(me.value + cost * me.perAction);
        if (projected > me.value) {
          cands.push({
            kind: 'round', cost, action: me.action, projected, ghost: ghostOf(projected),
            copy: sentence(`${plural(cost, me.action)} and ${me.label} reaches ${Math.round(target * 100)}%`),
          });
        }
      }
    }
  }

  // ── finish the branch ───────────────────────────────────────────────────
  // Always the largest ghost available, which is why it doubles as the fallback
  // when everything nearer is too small to see.
  let branch: Milestone | null = null;
  if (me.ceiling != null && me.ceiling > me.value) {
    const cost = actionsTo(me.value, me.ceiling, me.perAction);
    const projected = me.ceiling;
    branch = {
      kind: 'branch', cost, action: me.action, projected, ghost: ghostOf(projected),
      copy: opts.mode === 'pie'
        ? sentence(`Finish ${me.label} and it reaches ${pctAt(projected)}%`)
        : sentence(`${plural(cost, me.action)} finishes ${me.label}`),
    };
    cands.push(branch);
  }

  // Cheapest first; on a tie the more concrete target wins — passing a thing
  // that is drawn beside you reads better than an abstract percentage.
  const RANK: Record<string, number> = { overtake: 0, unit: 1, round: 2, branch: 3 };
  const visible = cands
    .filter((c) => c.ghost >= opts.minGhost)
    .sort((a, b) => (a.cost - b.cost) || (RANK[a.kind] - RANK[b.kind]));

  if (visible.length > 0) return visible[0];
  // Nothing near enough to see: take the branch even if it too is small, because
  // a truthful far target beats no interaction at all.
  if (branch) return branch;
  if (me.ceiling != null && me.value >= me.ceiling) return none(sentence(`${me.label} is complete`));
  return none(sentence(`${me.label} leads them all`));
}

// ─────────────────────────────────────────────────────────────────────────────
// HAS ANYTHING CHANGED SINCE THEY LAST LOOKED?
//
// The entrance animation fires ONLY when it has, so that movement on this tab
// MEANS something happened rather than decorating every visit. That makes this
// function load-bearing in a way it does not look: if it folds in a value that
// moves on its own — a timestamp, a streak that rolls at midnight, anything
// derived from the clock — the animation fires every time and the meaning is
// quietly gone, while everything still LOOKS like it is working.
//
// So it takes exactly the numbers the three charts draw, and nothing else.
// `check-stats.mjs` sweeps unrelated store fields past it and fails if any of
// them move it.
// ─────────────────────────────────────────────────────────────────────────────

export interface FingerprintInput {
  /** Per branch, exactly what the Areas pie and the Activity bars draw. */
  branches: { slug: string; interest: number; interactions: number }[];
  /** The Top Philosophers pie, in the order it is drawn. */
  philosophers: { id: string; score: number }[];
}

export function statsFingerprint(input: FingerprintInput): string {
  const b = input.branches
    .map((x) => `${x.slug}:${x.interest}:${x.interactions}`)
    .sort()
    .join('|');
  // NOT sorted: the reader sees this pie ranked, so a re-ordering IS a change
  // worth animating even when the same five names are present.
  const p = input.philosophers.map((x) => `${x.id}:${x.score}`).join('|');
  return `1;${b};;${p}`;
}

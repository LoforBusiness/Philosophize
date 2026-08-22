// ─────────────────────────────────────────────────────────────────────────────
// WHAT ONE MORE LESSON WOULD DO TO A CHART, AS PURE MATHS.
//
// ZERO IMPORTS, for the same reason `rig.ts` and `worldPath.ts` have none: this
// is the whole substance of the Insights tab's tap interaction, and a rule that
// can only be judged by tapping a phone is a rule nobody checks. Everything here
// runs in plain Node, and `scripts/check-stats.mjs` runs it.
//
// ── NO TARGET MAY DEPEND ON HOW BIG THE CURRICULUM IS ───────────────────────
//
// This file used to aim at CEILINGS: "4 more lessons finishes Logic", "finish
// Ethics and it reaches 31%", "3 more lessons finishes What Is Ethics?". Every
// one of those is a fraction of a total, and the reader said what is wrong with
// it:
//
//   > "I dont want ... '4 more lessons to complete Logic', things like that
//   > because since I will be continuing adding lessons that doesnt make sense."
//
// They are right, and it is worse than untidy. The curriculum has gone 60 → 192
// → 222 lessons and is still growing, so a ceiling-based target MOVES AWAY FROM
// THE READER whenever content ships. Someone four lessons from finishing Logic
// opens the app after an update and is now eleven away, having done nothing
// wrong. That is the exact opposite of a progress system: effort is supposed to
// be permanent.
//
// So every target here is now one of two shapes, and both are immune:
//
//   · OVERTAKE — pass the next thing above you. Measured against the reader's
//     OWN other numbers, so adding lessons to the app moves neither side.
//   · MARK — the next round number of a thing you have actually done. 15
//     lessons is 15 lessons whether the app holds 222 or 900.
//
// `scripts/check-stats.mjs` enforces it directly: it runs every profile twice
// with wildly different curriculum sizes and fails if any milestone differs.
//
// ── THE VALUE IS A COUNT, NOT A SCORE ───────────────────────────────────────
//
// The charts used to draw `interest = lessons×3 + quotes×2 + views`, and a round
// number of that is meaningless — nobody has "40 interest". Rounds only work on
// things a reader can name, so the elements passed in here carry COUNTS, and the
// copy names the action that moves them.
//
// ── WHY THE TARGET IS NOT SIMPLY "+1 LESSON" ────────────────────────────────
//
// The obvious design is a ghost exactly one lesson wide, and against a filled-in
// profile it is invisible — a few pixels, which is a rendering artifact rather
// than an animation, and the entire point is that the reader sees the gap and
// wants to close it. So a candidate whose ghost would be too small to read is
// discarded in favour of a further one that can be seen.
// ─────────────────────────────────────────────────────────────────────────────

export type ActionKind = 'lesson' | 'quote';

/** One tappable thing on a chart: a bar or a league row. */
export interface StatElement {
  key: string;
  label: string;
  /** What the chart draws — a COUNT of things done, never a composite score. */
  value: number;
  /** How much ONE action adds to `value`. Must be > 0 or the element is inert. */
  perAction: number;
  action: ActionKind;
}

export type MilestoneKind = 'overtake' | 'mark';

export interface Milestone {
  kind: MilestoneKind | 'none';
  /** Whole actions needed. 0 only when `kind` is 'none'. */
  cost: number;
  action: ActionKind;
  /** `value` once the cost is paid. Equals `value` when 'none'. */
  projected: number;
  /**
   * How much bigger the ghost draws, 0–1, as a fraction of the tallest element.
   * 0 when 'none'. The caller supplies `minGhost` in the same units, so the
   * floor is enforced here rather than trusted to each chart.
   */
  ghost: number;
  copy: string;
}

export interface MilestoneOpts {
  /** Smallest ghost that still reads. Below this a candidate is discarded. */
  minGhost: number;
}

function plural(cost: number, action: ActionKind): string {
  if (action === 'quote') return cost === 1 ? '1 more saved quote' : `${cost} more saved quotes`;
  return cost === 1 ? '1 more lesson' : `${cost} more lessons`;
}

/**
 * The next round number above `n`.
 *
 * The step grows with the number so the target stays a few actions away at every
 * scale: five apart early, where every lesson is a visible jump, and fifty apart
 * at 300, where being told to do five more would be no target at all. A reader at
 * exactly a round number gets the NEXT one, never the one they are standing on.
 */
export function nextMark(n: number): number {
  const step = n < 20 ? 5 : n < 100 ? 10 : n < 250 ? 25 : 50;
  return Math.floor(n / step) * step + step;
}

/** Whole actions to move `from` to at least `to`, never less than one. */
function actionsTo(from: number, to: number, perAction: number): number {
  if (perAction <= 0) return Infinity;
  const need = Math.ceil((to - from) / perAction);
  return need < 1 ? 1 : need;
}

/**
 * The nearest thing worth reaching for this element.
 *
 * `elements` is every tappable thing on the SAME chart — the ranking and the
 * tallest come from it, so a caller cannot pass one without its siblings and get
 * a silently wrong comparison.
 */
export function milestoneFor(
  elements: StatElement[], index: number, opts: MilestoneOpts
): Milestone {
  const me = elements[index];
  const none = (copy: string): Milestone => ({
    kind: 'none', cost: 0, action: me?.action ?? 'lesson', projected: me?.value ?? 0, ghost: 0, copy,
  });
  if (!me || me.perAction <= 0) return none(`${me?.label ?? ''} is not counting yet.`);

  const tallest = elements.reduce((a, e) => (e.value > a ? e.value : a), 0);
  const scale = tallest > 0 ? tallest : 1;
  const ghostOf = (projected: number) => (projected - me.value) / scale;

  const cands: Milestone[] = [];

  // ── pass the one above ──────────────────────────────────────────────────
  // The nearest element ranked ABOVE me — not the overall leader, which on a
  // filled profile is usually unreachable and reads as a taunt rather than a
  // nudge. Entirely self-relative: both sides are the reader's own numbers.
  let above: StatElement | null = null;
  for (const e of elements) {
    if (e.key === me.key || e.value <= me.value) continue;
    if (!above || e.value < above.value) above = e;
  }
  if (above) {
    const cost = actionsTo(me.value, above.value + 1, me.perAction);
    const projected = me.value + cost * me.perAction;
    cands.push({
      kind: 'overtake', cost, action: me.action, projected, ghost: ghostOf(projected),
      copy: `${plural(cost, me.action)} and ${me.label} passes ${above.label}.`,
    });
  }

  // ── the next round number, and the ones after it ────────────────────────
  //
  // An absolute count, so it means the same thing forever. More than one is
  // generated because the NEAREST mark is often invisible: a reader at 99 with
  // the tallest bar at 99 is one lesson from 100, and one ninety-ninth of a plot
  // is not an animation. The old file put this well and it is still true — a
  // target three lessons away that can be SEEN beats one lesson away that
  // cannot — so the chain walks outward until a mark clears the floor.
  //
  // Six is not a magic number, it is a bound: the step grows with the value, so
  // the ghost grows too, and the chain has always cleared the floor long before
  // it runs out. It exists so a pathological element cannot spin here.
  let mark = me.value;
  for (let step = 0; step < 6; step++) {
    mark = nextMark(mark);
    const markCost = actionsTo(me.value, mark, me.perAction);
    const projected = me.value + markCost * me.perAction;
    cands.push({
      kind: 'mark', cost: markCost, action: me.action, projected, ghost: ghostOf(projected),
      copy: me.action === 'quote'
        ? `${plural(markCost, 'quote')} and ${me.label} reaches ${mark}.`
        : `${plural(markCost, 'lesson')} takes ${me.label} to ${mark}.`,
    });
    if (ghostOf(projected) >= opts.minGhost) break;
  }

  // Cheapest first; on a tie, overtaking wins — passing a thing drawn right
  // beside you reads better than an abstract number.
  const RANK: Record<string, number> = { overtake: 0, mark: 1 };
  const visible = cands
    .filter((c) => c.ghost >= opts.minGhost)
    .sort((a, b) => (a.cost - b.cost) || (RANK[a.kind] - RANK[b.kind]));

  if (visible.length > 0) return visible[0];

  // Nothing near enough to SEE — only reachable if the chain above ran out.
  // Take the BIGGEST ghost rather than the last one generated: a truthful far
  // target beats no interaction at all, and the most visible of them is the one
  // worth drawing.
  if (cands.length === 0) return none(`${me.label} leads them all.`);
  return cands.reduce((a, c) => (c.ghost > a.ghost ? c : a));
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
// So it takes exactly the numbers the charts draw, and nothing else.
// `check-stats.mjs` sweeps unrelated store fields past it and fails if any of
// them move it.
// ─────────────────────────────────────────────────────────────────────────────

export interface FingerprintInput {
  /** Per branch, exactly what the area bars draw. */
  branches: { slug: string; lessons: number; quotes: number; thinkers: number }[];
  /** The thinker league, in the order it is drawn. */
  philosophers: { id: string; score: number }[];
  /** Per era, what the era bars draw. */
  eras: { key: string; value: number }[];
}

export function statsFingerprint(input: FingerprintInput): string {
  const b = input.branches
    .map((x) => `${x.slug}:${x.lessons}:${x.quotes}:${x.thinkers}`)
    .sort()
    .join('|');
  // NOT sorted: the reader sees the league ranked, so a re-ordering IS a change
  // worth animating even when the same five names are present.
  const p = input.philosophers.map((x) => `${x.id}:${x.score}`).join('|');
  const e = input.eras.map((x) => `${x.key}:${x.value}`).sort().join('|');
  return `2;${b};;${p};;${e}`;
}

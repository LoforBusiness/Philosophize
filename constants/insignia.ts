// ─────────────────────────────────────────────────────────────────────────────
// THE ORDERS — what a rank is STRUCK IN, and the third place colour is licensed.
//
// A reader on the rank screen: "it is not very different between rank icons. The
// more you rank up, it's usually that just silver and sometimes gold look. Right
// now, it's pretty boring."
//
// They were right, and the old system was honest about why: `rankBand` gave
// twenty-five ranks THREE materials — bronze, silver, gold, in blocks of eight —
// so eight consecutive promotions were the same pin with a different doodle in
// it. Three steps cannot carry a ladder; a ladder needs a rung you can see.
//
// ── WHY COLOUR IS ALLOWED HERE ──────────────────────────────────────────────
//
// §19 keeps this app ink on paper, and it bends only where a colour CARRIES
// INFORMATION: `ERA` (which of five eras a thinker belongs to) and `BRANCH`
// (which of six subjects a bar is about). A rank order is exactly that kind of
// fact — how far up the ladder somebody is, readable at a glance, from across a
// room, without reading a number. That is the whole job of an insignia.
//
// A SEPARATE SCALE, NOT PART OF `C`, for the reason ERA and BRANCH are separate:
// scripts/check-ui.mjs caps the general palette at 14 and these are not
// general-purpose colours. Nothing here may be used to mean anything except
// "this is what that rank is made of".
//
// ── THE PROGRESSION, AND WHY IT IS NOT A RAINBOW ────────────────────────────
//
// The reader asked for "brown being the worst" and then "a beautiful green with
// white, red with white, blue with white", each colour held for about five ranks
// before the next. So the ladder is EIGHT ORDERS OF FIVE, and the sequence is
// not arbitrary — it is the oldest status ladder there is, materials in the
// order a culture learns to work them:
//
//   CLAY    fired earth. Dull on purpose; it is the floor.
//   IRON    cold, grey, harder-won than clay and still not precious.
//   BRONZE  the first alloy, the first thing worth polishing.
//   JADE    the first PRECIOUS order — where the ladder turns colour.
//   LAPIS   ground stone, the most expensive blue in the world for 4,000 years.
//   CRIMSON kermes and cochineal: the dye a city went bankrupt over.
//   AMETHYST the last stone before metal, and the imperial colour.
//   AURUM   gold and white. There is nowhere above it, which is the point.
//
// So the ladder reads dull → hard → warm → precious → rare → costly → imperial →
// absolute, and every reader already knows that order without being taught it.
//
// ── THREE THINGS THAT MAKE THEM BEAUTIFUL RATHER THAN COLOURED ──────────────
//
// 1. EVERY ORDER IS A MATERIAL, NOT A HUE. Five values each — a lit corner, a
//    base, a shade, a rim darker than all of them, and the tone a mark sits in.
//    tone.ts learned this the hard way for silver: "a metal is not a flat colour
//    with a name; it is a face that runs lit→base→shade along the same diagonal
//    every other struck thing in this app uses". Same light, top-left, always.
//
// 2. CHROMA IS WHAT ESCALATES — not lightness, and NOT the tonal swing, which
//    is what this comment claimed until it was measured. Every order swings
//    24–29 L* and that is deliberate rather than a shortfall: the swing is what
//    makes a face read as struck metal at all (tone.ts: "a 7% tonal range is
//    invisible"), so every order needs it and none can have much more of it
//    without the white mark falling off the lit corner. What separates clay from
//    amethyst is COLOURFULNESS: 17 → 62 in CIELAB chroma.
//
// 3. THE HIGH ORDERS ARE PAIRED WITH WHITE, exactly as asked. From JADE up, the
//    inner rule is drawn in a near-white tint of the order rather than a warm
//    grey — so a high pin has a bright line running inside its edge that the low
//    orders simply do not have, and AURUM's is white outright.
//
// NO REACT AND NO IMPORTS IN THIS FILE, so scripts can render a contact sheet of
// all forty pins in plain Node and someone can LOOK at them (§21). That is how
// this was tuned, and it is how the first two palettes were caught.
// ─────────────────────────────────────────────────────────────────────────────

export type OrderName =
  | 'CLAY' | 'IRON' | 'BRONZE' | 'JADE'
  | 'LAPIS' | 'CRIMSON' | 'AMETHYST' | 'AURUM';

export interface Insignia {
  /** The lit corner, top-left along `LIGHT`. */
  lit: string;
  /** The body of the material. */
  base: string;
  /** The shaded corner, bottom-right. */
  shade: string;
  /** The turned edge — darker than any face value, or it stops reading as an edge. */
  rim: string;
  /** What a mark drawn ON this material is coloured. */
  on: string;
  /** The inner hairline. Warm grey low down, the order's own light high up. */
  rule: string;
}

// ── THE ONE CONSTRAINT EVERY VALUE BELOW WAS FITTED TO ──────────────────────
//
// EVERY MARK IS WHITE. A search that let each order choose its own mark colour
// came back white / ink / ink / ink / ink / white / ink — which is not a set,
// it is eight separate decisions, and a reader would see the mark flip colour
// between two consecutive promotions for no reason they could name.
//
// One mark colour buys consistency and costs a ceiling: white needs 3:1 against
// the LIT corner, so no `lit` may go far past L* 60. That ceiling is the reason
// these are jewels rather than pastels — the first hand-picked set had a mint
// #B7E7CB and a powder #B3CEF3, both of which are what "a beautiful green" and
// "a beautiful blue" turn into when nothing stops them getting lighter.
//
// Measured, bottom to top: white on the lit corner reads 4.43 / 3.22 / 4.23 /
// 3.32 / 4.49 / 4.83 / 4.88 / 3.29 : 1, every tonal swing is 24–29 L* (tone.ts:
// "a 7% tonal range is invisible"), every rim sits 10–14 L* below its own shade,
// and the closest any two orders come is ΔE 23.9 — CLAY against IRON, which are
// the two that are meant to be drab.
//
// Chroma is what actually escalates: 17 · 6 · 41 · 39 · 46 · 56 · 62 · 52. Iron
// dips on purpose, because iron is not a colour; it is the absence of one, and
// coming after clay it should read as a step sideways into something harder
// before the ladder turns precious at bronze.
export const ORDER: Record<OrderName, Insignia> = {
  // ── the base orders: drab, low chroma, unfinished on purpose ──────────────
  CLAY: {
    lit: '#8E7358', base: '#6B5440', shade: '#48372A', rim: '#2C2119',
    on: '#FFFFFF', rule: '#A0866B',
  },
  IRON: {
    lit: '#8A9099', base: '#666D76', shade: '#434950', rim: '#282C31',
    on: '#FFFFFF', rule: '#A7AEB6',
  },
  // ── the worked order: the first thing worth polishing. Pushed toward copper
  //    rather than gold, because at ΔE 21 the two warm metals were one order
  //    wearing two names. ───────────────────────────────────────────────────
  BRONZE: {
    lit: '#AE6B3C', base: '#874B21', shade: '#5A3014', rim: '#371C0B',
    on: '#FFFFFF', rule: '#D09A6A',
  },
  // ── the precious orders. From here the inner rule is drawn in the order's
  //    own near-white rather than a warm grey — this is the "green with white,
  //    red with white" the ladder was asked for, and it is a line a low order
  //    simply does not have. ────────────────────────────────────────────────
  JADE: {
    lit: '#3E9E70', base: '#1F7A52', shade: '#125338', rim: '#0A3524',
    on: '#FFFFFF', rule: '#DCF3E7',
  },
  LAPIS: {
    lit: '#4477C4', base: '#24559E', shade: '#16386B', rim: '#0D2244',
    on: '#FFFFFF', rule: '#DEE9FA',
  },
  CRIMSON: {
    lit: '#C24A40', base: '#9E2C25', shade: '#6B1B16', rim: '#43100D',
    on: '#FFFFFF', rule: '#FBE4E1',
  },
  AMETHYST: {
    lit: '#9455BE', base: '#6E3396', shade: '#4A2065', rim: '#2C1240',
    on: '#FFFFFF', rule: '#EFE0F8',
  },
  // ── and the top, which is gold AND white rather than gold alone. Deeper than
  //    a gold instinctively wants to be: at #C79A2E the white mark measured
  //    2.60:1 and disappeared into its own highlight. ───────────────────────
  AURUM: {
    lit: '#B2871A', base: '#916D0F', shade: '#614807', rim: '#3A2B04',
    on: '#FFFFFF', rule: '#FFFFFF',
  },
};

/** The ladder, bottom to top. Index is the order number. */
export const ORDERS: OrderName[] = [
  'CLAY', 'IRON', 'BRONZE', 'JADE', 'LAPIS', 'CRIMSON', 'AMETHYST', 'AURUM',
];

/** How many ranks share one order. Eight orders of five is the forty-rank ladder. */
export const ORDER_SIZE = 5;

/**
 * The human name of an order, for the ranks sheet. Not the enum: a reader should
 * be told they are "of the Lapis order", not `LAPIS`.
 */
export const ORDER_LABEL: Record<OrderName, string> = {
  CLAY: 'Clay', IRON: 'Iron', BRONZE: 'Bronze', JADE: 'Jade',
  LAPIS: 'Lapis', CRIMSON: 'Crimson', AMETHYST: 'Amethyst', AURUM: 'Aurum',
};

/**
 * WHAT ESCALATES INSIDE AN ORDER.
 *
 * Colour alone would make five consecutive ranks identical again, one order
 * lower — the exact complaint this file exists to answer. So each order runs
 * through five DEGREES of finish, and the mark of the fifth is that it is the
 * last before the material changes.
 *
 * This is ornament, and RankSeal's own header records that escalating ornament
 * was tried once and rejected as "so busy at 54px that it fought the glyph it
 * framed". The difference is that THAT version escalated across all twenty-five
 * ranks, so by the top the pin was carrying twenty-five steps of decoration.
 * Here it resets every five, so no pin is ever more than four steps ornamented,
 * and the steps are studs on the hexagon's own vertices rather than new shapes:
 *
 *   0  plain. The pin, the rim, the mark.
 *   1  + the inner rule
 *   2  + two studs, on the left and right vertices
 *   3  + four studs
 *   4  + all six, and a ring of rays outside the edge
 *
 * Degree 4 is the capstone of its order and is meant to look like one.
 */
export const DEGREES = 5;

export interface Finish {
  /** Draw the hairline inside the edge. */
  rule: boolean;
  /** How many of the hexagon's six vertices carry a stud. */
  studs: number;
  /** The capstone's ring of rays. */
  rays: boolean;
}

export function finishFor(degree: number): Finish {
  const d = Math.max(0, Math.min(DEGREES - 1, Math.floor(degree) || 0));
  return {
    rule: d >= 1,
    studs: d >= 4 ? 6 : d >= 3 ? 4 : d >= 2 ? 2 : 0,
    rays: d >= 4,
  };
}

/** The order a rank index (0-based) belongs to. */
export function orderOf(index: number): OrderName {
  const i = Math.max(0, Math.floor(index) || 0);
  return ORDERS[Math.min(ORDERS.length - 1, Math.floor(i / ORDER_SIZE))];
}

/** How far through its order a rank is, 0..4. */
export function degreeOf(index: number): number {
  const i = Math.max(0, Math.floor(index) || 0);
  // The top order is the last one there is, so anything past the end of the
  // ladder stays at its capstone rather than wrapping back to a plain pin.
  if (i >= ORDERS.length * ORDER_SIZE) return DEGREES - 1;
  return i % ORDER_SIZE;
}

// ─────────────────────────────────────────────────────────────────────────────
// BADGES ARE STRUCK FROM THE SAME BAR.
//
// The badge case had three tiers — bronze, silver, gold — and the reader asked
// for the same thing they asked of the ranks: "not just silver and gold, but a
// red that's really beautiful, a blue that's really beautiful, a green".
//
// Five tiers, and they deliberately borrow FOUR OF THE RANK ORDERS rather than
// inventing a second palette. A reader who has learned that jade sits above
// bronze on the rank ladder should not have to learn a different order for
// badges; one language, used twice, is what makes a set look like a set.
//
// AURUM is reserved for the very top of both ladders, so a gold badge means the
// same thing a gold pin does.
// ─────────────────────────────────────────────────────────────────────────────

export const TIER_ORDER: OrderName[] = ['IRON', 'BRONZE', 'JADE', 'CRIMSON', 'AURUM'];

/** 1..5 → the material that tier is struck in. */
export function tierInsignia(tier: number): Insignia {
  const t = Math.max(1, Math.min(TIER_ORDER.length, Math.floor(tier) || 1));
  return ORDER[TIER_ORDER[t - 1]];
}

// ─────────────────────────────────────────────────────────────────────────────
// THE GRADIENT STOPS, so a renderer never assembles them itself.
//
// Same three-stop shape and the same 52% midpoint as `metalFace` in
// components/shared/tone.ts, deliberately: a rank pin and a rank-up medal drawn
// from two different curves would light differently, and the one thing that has
// to be identical across every struck thing in this app is the light. These are
// declared here rather than imported from tone.ts only so this file keeps its
// zero imports and can be rendered in plain Node.
// ─────────────────────────────────────────────────────────────────────────────

/** `[offset, colour, opacity]`, the shape react-native-svg's Stop wants. */
export type InsigniaStops = [string, string, number][];

export const insigniaFace = (m: Insignia): InsigniaStops => [
  ['0%', m.lit, 1],
  ['52%', m.base, 1],
  ['100%', m.shade, 1],
];

/** Dark on the shaded side, so the edge turns away from the light. */
export const insigniaRim = (m: Insignia): InsigniaStops => [
  ['0%', m.shade, 1],
  ['45%', m.rim, 1],
  ['100%', m.rim, 1],
];

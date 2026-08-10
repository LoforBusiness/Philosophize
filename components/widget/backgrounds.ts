// The home-screen widget's backdrops.
//
// ZERO IMPORTS, like rig.ts and tone.ts and for the same reason: every scene in
// here can be rendered and MEASURED in plain Node, so "is the quote still
// readable on this one" is arithmetic rather than an opinion.
// `npm run check:widget` does exactly that, over every scene, every text run.
//
// ── HOW BOLD THE ART MAY BE, AS A NUMBER ────────────────────────────────────
//
// §19 says never take text contrast from the artwork. That is usually read as
// "keep the art faint", and the first version of this file did, and the scenes
// were invisible. The rule does not actually say faint — it says CONSTRUCTED,
// and the construction has a lot more room in it than it looks:
//
//   ink   #1A1A1A (L 0.010) needs whatever is under it ABOVE L 0.221 for 4.5:1
//   cream #F4F1EA (L 0.881) needs whatever is under it BELOW L 0.157
//
// A mid grey — #ADA595, L 0.380 — still clears 7.1:1 against ink. So a stroke
// crossing the quote can be a real mark rather than a rumour. What it may not be
// is DARK: #6E675A is only 3.1:1 and fails. Hence the ramp below, and the rule
// that NEAR is for the bottom band and the margins, never under type.
//
// ── THE TWO PARTS OF A SCENE ────────────────────────────────────────────────
//
//   1. ART, full-bleed, heaviest in the bottom band and the outer margins.
//   2. A VEIL of the card's own paper (ink, when dark), deepest across the type.
//
// The veil is now light, because the tone ramp does most of the work. A heavy
// veil is what erased the branch mastheads at 0.62–0.86 (§19) and it erased
// these too on the first pass.
//
// ── WHY DARK SCENES EXIST ───────────────────────────────────────────────────
//
// A light card can only ever carry mid-tone art, because ink type needs pale
// paper under it. Invert it and that reverses: cream on near-black is legible
// against marks far brighter than any light scene could risk, so the night
// scenes are the ones that read from across the room. Each scene declares its
// own type colours; `dark` is a fact about the scene, not a theme setting.
//
// ── DRAWING CONSTRAINTS ─────────────────────────────────────────────────────
//
// Rendered by AndroidSVG 1.4 (react-native-android-widget's SvgWidget), which is
// SVG 1.1: shapes, paths, linearGradient, opacity are safe. NO filters, NO masks
// — a crescent is cut with an overlapping disc in the backdrop colour instead.
//
// Gradient ids are per-scene (`v-night`, not `v`). Two of these can end up in one
// document — the settings picker draws all five at once, and a contact sheet
// does too — and duplicate ids mean every `url(#v)` resolves to whichever scene
// happened to render first. That is not hypothetical: it silently gave both dark
// scenes the light scene's paper veil, and the sheet showed two grey smears.
//
// The widget is resizable (180–360dp wide, 110–300dp tall), so each scene is
// drawn to one 400x176 box and SLICED to cover. Nothing that matters goes near
// an edge, because slicing crops them.

/**
 * react-native-android-widget types its colours as a hex template literal rather
 * than `string`, so matching it here keeps the scenes assignable straight into
 * the widget's styles — and stops a stray `rgba(...)` reaching a RemoteViews
 * attribute that cannot take one.
 */
type Hex = `#${string}`;

export interface WidgetBackground {
  /** Stable id — persisted in userDataStore, so never rename one. */
  id: string;
  name: string;
  /** True when the card is ink and the type is cream. */
  dark: boolean;
  paper: Hex;
  ink: Hex;
  inkSoft: Hex;
  hairline: Hex;
  svg: string;
}

const VB = 'viewBox="0 0 400 176" preserveAspectRatio="xMidYMid slice"';

// A tiny deterministic generator. A star field wants dozens of marks, a hand
// -typed list of them is unreadable, and Math.random would make the contrast
// measurement meaningless because the picture would differ every run.
function prng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const r2 = (n: number) => Math.round(n * 100) / 100;

// ── the ramp ────────────────────────────────────────────────────────────────
// LIGHT scenes. FAR and MID may cross type; NEAR may not (3.1:1).
const FAR = '#CFC8B8';
const MID = '#ADA595';
const NEAR = '#8E8677';

// DARK scenes, mirrored: DIM and GLOW may cross type, BRIGHT may not.
const DIM = '#2E2B23';
const GLOW = '#5A5446';
const BRIGHT = '#EDE8DC';

// A moon is the one shape a blur cannot rescue. Stars are 2px and dissolve into
// the tone around them; a 27-unit disc under the date is simply a pale field
// behind small type, and it measured 1.45:1. So the discs are drawn at a tone
// that clears the floor on their own, and read perfectly well against near-black.
const MOON = '#6E6858';

const PAPER = '#FAF7F0';
const INK = '#1A1A1A';
// Darker than the #6B6B6B the flat card used. That grey manages only 5.0:1 even
// on bare paper, so it had almost no headroom left for a drawing underneath it —
// the date and the attribution were the first things to fail, on every scene.
const INK_SOFT = '#4A4638';
const HAIRLINE = '#D9D5CB';

const NIGHT_PAPER = '#14130F';
const NIGHT_INK = '#F4F1EA';
// Mirror of the light-scene move: pushed up toward cream so the date and the
// attribution keep their headroom over the hills and the water.
const NIGHT_SOFT = '#E4DFD2';
const NIGHT_HAIR = '#3A382F';

/** Paper veil for a light scene. Light — the ramp already limits the art. */
function paperVeil(id: string, paper: string): string {
  return (
    `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">` +
    `<stop offset="0" stop-color="${paper}" stop-opacity="0.30"/>` +
    `<stop offset="0.34" stop-color="${paper}" stop-opacity="0.52"/>` +
    `<stop offset="0.78" stop-color="${paper}" stop-opacity="0.44"/>` +
    `<stop offset="1" stop-color="${paper}" stop-opacity="0.12"/>` +
    `</linearGradient>`
  );
}

/** Ink veil for a dark scene. Cream on ink wants the field DARK, not pale. */
function inkVeil(id: string, paper: string): string {
  return (
    `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">` +
    `<stop offset="0" stop-color="${paper}" stop-opacity="0.20"/>` +
    `<stop offset="0.34" stop-color="${paper}" stop-opacity="0.56"/>` +
    `<stop offset="0.78" stop-color="${paper}" stop-opacity="0.48"/>` +
    `<stop offset="1" stop-color="${paper}" stop-opacity="0.14"/>` +
    `</linearGradient>`
  );
}

// ── scene parts ─────────────────────────────────────────────────────────────

/** A bare tree: trunk, then branch pairs thinning as they rise. */
function tree(x: number, base: number, h: number, w: number, c: string, sw = 1): string {
  const s = (h / 70) * sw;
  return (
    `<path d="M${x} ${base} L${x} ${r2(base - h)}" stroke="${c}" stroke-width="${r2(3.6 * s)}" stroke-linecap="round" fill="none"/>` +
    `<path d="M${x} ${r2(base - h * 0.6)} L${r2(x - w)} ${r2(base - h * 0.85)}` +
    `M${x} ${r2(base - h * 0.42)} L${r2(x + w * 0.9)} ${r2(base - h * 0.7)}` +
    `M${x} ${r2(base - h * 0.78)} L${r2(x + w * 0.6)} ${r2(base - h * 0.97)}` +
    `M${x} ${r2(base - h * 0.24)} L${r2(x - w * 0.72)} ${r2(base - h * 0.48)}` +
    `M${r2(x - w * 0.55)} ${r2(base - h * 0.73)} L${r2(x - w * 0.78)} ${r2(base - h * 0.9)}" ` +
    `stroke="${c}" stroke-width="${r2(2.5 * s)}" stroke-linecap="round" fill="none"/>`
  );
}

/** A ridge: one cubic run of hills, filled to the floor. */
function ridge(y: number, amp: number, phase: number, fill: string, op = 1): string {
  let d = `M-10 ${y}`;
  for (let i = 0; i < 5; i++) {
    const x0 = -10 + i * 84;
    const dip = amp * (0.55 + 0.45 * Math.sin(phase + i * 1.7));
    d += ` C${r2(x0 + 28)} ${r2(y - dip)} ${r2(x0 + 56)} ${r2(y - dip * 0.5)} ${r2(x0 + 84)} ${r2(y - dip * 0.15)}`;
  }
  return `<path d="${d} L410 200 L-10 200 Z" fill="${fill}" opacity="${op}"/>`;
}

/** Woodcut hatching inside a band. */
function hatch(x0: number, x1: number, y0: number, y1: number, step: number, c: string, w: number, op: number): string {
  let d = '';
  for (let x = x0; x < x1; x += step) d += `M${r2(x)} ${y1} L${r2(x + (y1 - y0) * 0.55)} ${y0} `;
  return `<path d="${d}" stroke="${c}" stroke-width="${w}" opacity="${op}" fill="none" stroke-linecap="round"/>`;
}

/** A bird: two strokes, the oldest shorthand there is. */
const bird = (x: number, y: number, s: number, c: string, w: number) =>
  `<path d="M${x} ${y} C${r2(x + s * 0.3)} ${r2(y - s * 0.4)} ${r2(x + s * 0.7)} ${r2(y - s * 0.4)} ${r2(x + s)} ${y}` +
  ` M${r2(x + s)} ${y} C${r2(x + s * 1.3)} ${r2(y - s * 0.4)} ${r2(x + s * 1.7)} ${r2(y - s * 0.4)} ${r2(x + s * 2)} ${y}" ` +
  `stroke="${c}" stroke-width="${w}" fill="none" stroke-linecap="round"/>`;

// ═══════════════════════════════════════════════════════════════════════════
// THE SCENES
//
// ── WHERE THE TYPE IS, AND WHY THAT DECIDES EVERYTHING ──────────────────────
//
// The card is ~110dp tall and this box is 176 units, so 1dp is about 1.6 units.
// Laying the content out through that map puts the type at:
//
//   header   y  18 …  37
//   rule     y  45
//   QUOTE    y  53 … 137   ← the middle half of the picture
//   footer   y 145 … 163
//
// The previous scenes drew across all of it — a tree trunk straight through
// "worth living", arcade columns behind the quote, a sun directly under the date
// — and then tried to rescue the type with a veil. That is the wrong order. Line
// art at the same tone as the letterforms does not stop competing with them
// because something translucent was laid over both.
//
// So every scene here is built in BANDS, and the quote's band is left as field:
//
//   y   0 … 45   sky. Quiet — the header sits in it.
//   y  45 … 137  THE QUOTE'S BAND. Gradient only. No object, no stroke, ever.
//   y 137 … 176  the ground. Where the drawing lives, and where it can be bold,
//                because only 9sp footer type crosses it and the tone ramp says
//                how dark that is allowed to be.
//
// The hero — a sun, a moon — SETS INTO the horizon at the right, so it is a
// composed picture rather than a texture, without ever entering the quote.
//
// ── AND IT SURVIVES BEING CROPPED ───────────────────────────────────────────
//
// The widget resizes from 180x110 to 360x300, so this 400x176 box is sliced to
// cover anything from 3.3:1 to 1.2:1. Horizontal bands are exactly the
// composition that survives that: `xMidYMid` keeps the middle in the middle, so
// the quote's clean band stays behind the quote at every size, and cropping only
// ever takes width off the ends of a horizon that runs past both edges anyway.
// ═══════════════════════════════════════════════════════════════════════════

/** The sky: one wash down the whole box. Every scene starts here. */
function sky(id: string, top: string, bottom: string): string {
  return (
    `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">` +
    `<stop offset="0" stop-color="${top}"/>` +
    `<stop offset="0.62" stop-color="${bottom}"/>` +
    `</linearGradient>`
  );
}

/** The hero disc, low and right, half-set behind the ground that follows it. */
const disc = (cx: number, cy: number, r: number, c: string, op = 1) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${c}" opacity="${op}"/>`;

/**
 * A horizon: one filled run of hills from off-frame left to off-frame right.
 *
 * `y` is where it crosses the middle of the card, and it is never above 134 —
 * that is the floor of the quote's band, and this is the file's one hard rule.
 */
function land(y: number, amp: number, phase: number, fill: string, op = 1): string {
  let d = `M-10 ${r2(y)}`;
  for (let i = 0; i < 5; i++) {
    const x0 = -10 + i * 84;
    const dip = amp * (0.5 + 0.5 * Math.sin(phase + i * 1.9));
    d += ` C${r2(x0 + 30)} ${r2(y - dip)} ${r2(x0 + 54)} ${r2(y + dip * 0.35)} ${r2(x0 + 84)} ${r2(y - dip * 0.2)}`;
  }
  return `<path d="${d} L410 190 L-10 190 Z" fill="${fill}" opacity="${op}"/>`;
}

/** Conifers along a horizon — solid masses, never line art. */
function pines(base: number, xs: number[], h: number, c: string, op = 1): string {
  let d = '';
  for (const x of xs) {
    const w = h * 0.34;
    d += `M${r2(x - w)} ${r2(base)} L${r2(x)} ${r2(base - h)} L${r2(x + w)} ${r2(base)} Z `;
  }
  return `<path d="${d}" fill="${c}" opacity="${op}"/>`;
}

/**
 * An ARCADE: piers joined by round arches, drawn as one filled mass.
 *
 * Piers alone read as a fence at this size — which is exactly what they did, and
 * a fence is not what a philosophy widget wants on its horizon. The arch is the
 * whole signal, so it is drawn as solid stone with the OPENINGS punched back out
 * in the sky's own colour: AndroidSVG has no masks, and a fill-rule hole would
 * need the sub-paths wound opposite, which is more fragile than painting the gap.
 */
function arcade(base: number, x0: number, bays: number, bw: number, h: number, c: string, sky: string, op = 1): string {
  const w = bw * bays;
  const r = bw * 0.36;
  let holes = '';
  for (let i = 0; i < bays; i++) {
    const cx = x0 + bw * (i + 0.5);
    const top = base - h + r + 4;
    holes += `M${r2(cx - r)} ${r2(base)} L${r2(cx - r)} ${r2(top)} `
      + `A${r2(r)} ${r2(r)} 0 0 1 ${r2(cx + r)} ${r2(top)} L${r2(cx + r)} ${r2(base)} Z `;
  }
  return `<path d="M${r2(x0)} ${r2(base)} L${r2(x0)} ${r2(base - h)} L${r2(x0 + w)} ${r2(base - h)} L${r2(x0 + w)} ${r2(base)} Z" fill="${c}" opacity="${op}"/>`
    + `<path d="${holes}" fill="${sky}" opacity="${op}"/>`;
}

/** 1 — GROVE. Pines on a low ridge, sun setting behind them. */
function grove(): string {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" ${VB}>` +
    `<defs>${sky('s-grove', PAPER, '#EFE9DA')}</defs>` +
    `<rect x="-10" y="-10" width="420" height="196" fill="url(#s-grove)"/>` +
    disc(298, 132, 36, FAR, 0.9) +
    land(134, 10, 0.6, FAR, 0.9) +
    pines(140, [232, 268, 306, 344, 378], 46, MID, 0.9) +
    land(150, 9, 2.4, MID, 0.75) +
    land(164, 7, 4.1, NEAR, 0.5) +
    `</svg>`
  );
}

/** 2 — RIDGES. Nothing but land, receding. */
function ridges(): string {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" ${VB}>` +
    `<defs>${sky('s-ridges', PAPER, '#EEE7D6')}</defs>` +
    `<rect x="-10" y="-10" width="420" height="196" fill="url(#s-ridges)"/>` +
    disc(288, 128, 42, FAR, 0.8) +
    land(132, 13, 0.2, FAR, 0.85) +
    land(147, 12, 2.2, MID, 0.75) +
    land(161, 9, 3.9, NEAR, 0.5) +
    `</svg>`
  );
}

/** 3 — COLONNADE. A ruin on the skyline. */
function colonnade(): string {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" ${VB}>` +
    `<defs>${sky('s-colonnade', PAPER, '#EFEADC')}</defs>` +
    `<rect x="-10" y="-10" width="420" height="196" fill="url(#s-colonnade)"/>` +
    disc(92, 134, 30, FAR, 0.75) +
    land(138, 8, 1.1, FAR, 0.85) +
    arcade(152, 236, 4, 36, 40, MID, '#EFEADC', 0.9) +
    `<rect x="228" y="110" width="160" height="7" rx="1.5" fill="${MID}" opacity="0.9"/>` +
    land(162, 7, 3.2, NEAR, 0.5) +
    `</svg>`
  );
}

/** 4 — NIGHT. Stars over hills, a moon going down behind them. */
function night(): string {
  const rnd = prng(11);
  let stars = '';
  // STRATIFIED, not scattered. Forty independent draws across 400 units clump —
  // they came out as one diagonal smear across the top middle, which reads as a
  // smudge on the glass rather than as a sky. One star per column, jittered
  // inside it, spreads them without making them a grid.
  const COLS = 26;
  for (let i = 0; i < COLS * 2; i++) {
    const col = i % COLS;
    const x = -6 + (col + rnd()) * (412 / COLS);
    // ONLY in the sky band. A star inside the quote is a speck on a letter.
    const y = 3 + rnd() * 40;
    stars += `<circle cx="${r2(x)}" cy="${r2(y)}" r="${r2(0.7 + rnd() * 1.5)}" fill="${BRIGHT}" opacity="${r2(0.25 + rnd() * 0.5)}"/>`;
  }
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" ${VB}>` +
    `<defs>${sky('s-night', '#0E0D0A', NIGHT_PAPER)}</defs>` +
    `<rect x="-10" y="-10" width="420" height="196" fill="url(#s-night)"/>` +
    stars +
    disc(302, 130, 32, MOON, 0.95) +
    land(134, 12, 0.9, DIM) +
    land(150, 10, 2.7, '#211F19') +
    land(165, 7, 4.4, '#0C0B08') +
    `</svg>`
  );
}

/** 5 — TIDE. A moon over water, its road running to the shore. */
function tide(): string {
  let road = '';
  for (let i = 0; i < 7; i++) {
    const y = 142 + i * 4.8;
    const w = 16 + i * 13;
    road += `<rect x="${r2(300 - w / 2)}" y="${r2(y)}" width="${r2(w)}" height="1.8" rx="0.9" fill="${GLOW}" opacity="${r2(0.5 - i * 0.05)}"/>`;
  }
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" ${VB}>` +
    `<defs>${sky('s-tide', '#100F0C', NIGHT_PAPER)}</defs>` +
    `<rect x="-10" y="-10" width="420" height="196" fill="url(#s-tide)"/>` +
    disc(298, 130, 30, MOON, 0.9) +
    land(136, 6, 1.4, '#1B1A15') +
    `<rect x="-10" y="140" width="420" height="50" fill="#0D0C09"/>` +
    road +
    `</svg>`
  );
}

export const WIDGET_BACKGROUNDS: readonly WidgetBackground[] = [
  { id: 'grove', name: 'Grove', dark: false, paper: PAPER, ink: INK, inkSoft: INK_SOFT, hairline: HAIRLINE, svg: grove() },
  { id: 'ridges', name: 'Ridges', dark: false, paper: PAPER, ink: INK, inkSoft: INK_SOFT, hairline: HAIRLINE, svg: ridges() },
  { id: 'colonnade', name: 'Colonnade', dark: false, paper: PAPER, ink: INK, inkSoft: INK_SOFT, hairline: HAIRLINE, svg: colonnade() },
  { id: 'night', name: 'Night', dark: true, paper: NIGHT_PAPER, ink: NIGHT_INK, inkSoft: NIGHT_SOFT, hairline: NIGHT_HAIR, svg: night() },
  { id: 'tide', name: 'Tide', dark: true, paper: NIGHT_PAPER, ink: NIGHT_INK, inkSoft: NIGHT_SOFT, hairline: NIGHT_HAIR, svg: tide() },
];

export const DEFAULT_WIDGET_BACKGROUND = 'grove';

export function backgroundById(id: string | undefined | null): WidgetBackground {
  return WIDGET_BACKGROUNDS.find((b) => b.id === id) ?? WIDGET_BACKGROUNDS[0];
}

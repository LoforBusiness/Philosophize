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
// ═══════════════════════════════════════════════════════════════════════════

/** 1 — GROVE. A stand of trees at dusk, not two sticks in a field. */
function grove(): string {
  const rnd = prng(7);
  let grass = '';
  for (let i = 0; i < 34; i++) {
    const x = 4 + rnd() * 392;
    const h = 5 + rnd() * 11;
    grass += `M${r2(x)} 172 L${r2(x + (rnd() - 0.5) * 5)} ${r2(172 - h)} `;
  }
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" ${VB}>` +
    `<defs>${paperVeil('v-grove', PAPER)}</defs>` +
    `<rect x="-10" y="-10" width="420" height="196" fill="${PAPER}"/>` +
    `<circle cx="60" cy="44" r="24" fill="${FAR}" opacity="0.55"/>` +
    `<path d="M-10 168 C90 162 150 172 220 167 C290 162 350 170 410 165" stroke="${MID}" stroke-width="2.6" fill="none" stroke-linecap="round"/>` +
    tree(300, 170, 104, 30, MID) +
    tree(352, 170, 74, 21, MID) +
    tree(246, 170, 56, 16, FAR) +
    tree(52, 170, 66, 19, MID) +
    tree(100, 170, 46, 13, FAR) +
    tree(168, 170, 34, 10, FAR) +
    `<path d="${grass}" stroke="${NEAR}" stroke-width="1.9" fill="none" stroke-linecap="round" opacity="0.85"/>` +
    bird(322, 40, 11, MID, 2) +
    bird(292, 58, 8, MID, 1.7) +
    bird(348, 62, 7, FAR, 1.5) +
    `<rect x="-10" y="-10" width="420" height="196" fill="url(#v-grove)"/>` +
    `</svg>`
  );
}

/** 2 — RIDGES. Layered hills under a low sun. */
function ridges(): string {
  let rays = '';
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    rays += `M${r2(330 + Math.cos(a) * 40)} ${r2(50 + Math.sin(a) * 40)} L${r2(330 + Math.cos(a) * 54)} ${r2(50 + Math.sin(a) * 54)} `;
  }
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" ${VB}>` +
    `<defs>${paperVeil('v-ridges', PAPER)}</defs>` +
    `<rect x="-10" y="-10" width="420" height="196" fill="${PAPER}"/>` +
    `<circle cx="330" cy="50" r="33" fill="${FAR}" opacity="0.8"/>` +
    `<path d="${rays}" stroke="${FAR}" stroke-width="2.4" fill="none" stroke-linecap="round"/>` +
    ridge(138, 40, 0.4, FAR, 0.9) +
    ridge(152, 30, 2.1, MID, 0.85) +
    hatch(-10, 410, 150, 178, 12, NEAR, 1.7, 0.5) +
    ridge(168, 16, 3.4, NEAR, 0.65) +
    `<rect x="-10" y="-10" width="420" height="196" fill="url(#v-ridges)"/>` +
    `</svg>`
  );
}

/** 3 — COLONNADE. Three arches and a step: the oldest room in philosophy. */
function colonnade(): string {
  const col = (x: number, w: number, c: string) =>
    `<path d="M${x} 154 L${x} 72 C${x} 50 ${r2(x + w)} 50 ${r2(x + w)} 72 L${r2(x + w)} 154" ` +
    `stroke="${c}" stroke-width="3.2" fill="none" stroke-linejoin="round"/>` +
    hatch(x + 3, x + w - 3, 88, 152, 8, c, 1.4, 0.5) +
    `<path d="M${r2(x - 6)} 154 L${r2(x + w + 6)} 154" stroke="${c}" stroke-width="3.6" stroke-linecap="round"/>`;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" ${VB}>` +
    `<defs>${paperVeil('v-colonnade', PAPER)}</defs>` +
    `<rect x="-10" y="-10" width="420" height="196" fill="${PAPER}"/>` +
    col(228, 46, MID) +
    col(290, 46, MID) +
    col(352, 46, FAR) +
    col(40, 46, FAR) +
    `<path d="M28 62 L410 62 M32 53 L410 53" stroke="${MID}" stroke-width="2.6" fill="none" stroke-linecap="round"/>` +
    `<path d="M-10 162 L410 162" stroke="${NEAR}" stroke-width="2.6" fill="none"/>` +
    `<path d="M-10 172 L410 172" stroke="${NEAR}" stroke-width="3.4" fill="none"/>` +
    `<rect x="-10" y="-10" width="420" height="196" fill="url(#v-colonnade)"/>` +
    `</svg>`
  );
}

/** 4 — NIGHT. The one that reads from across the room. */
function night(): string {
  const rnd = prng(19);
  let stars = '';
  for (let i = 0; i < 64; i++) {
    const x = 4 + rnd() * 392;
    const y = 4 + rnd() * 126;
    const r = 0.7 + rnd() * 1.9;
    stars += `<circle cx="${r2(x)}" cy="${r2(y)}" r="${r2(r)}" fill="${BRIGHT}" opacity="${r2(0.3 + rnd() * 0.65)}"/>`;
  }
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" ${VB}>` +
    `<defs>${inkVeil('v-night', NIGHT_PAPER)}</defs>` +
    `<rect x="-10" y="-10" width="420" height="196" fill="${NIGHT_PAPER}"/>` +
    stars +
    // a falling star, because one asymmetry stops a star field being wallpaper
    `<path d="M96 34 L132 56" stroke="${BRIGHT}" stroke-width="1.7" opacity="0.5" stroke-linecap="round"/>` +
    // crescent: a disc, then the backdrop disc offset across it (no masks in 1.1)
    `<circle cx="338" cy="44" r="27" fill="${MOON}"/>` +
    `<circle cx="325" cy="36" r="25" fill="${NIGHT_PAPER}"/>` +
    ridge(148, 34, 1.2, DIM) +
    ridge(164, 24, 3.0, GLOW, 0.55) +
    `<rect x="-10" y="-10" width="420" height="196" fill="url(#v-night)"/>` +
    `</svg>`
  );
}

/** 5 — TIDE. Ink water under a ringed moon; the one scene that is all curve. */
function tide(): string {
  let waves = '';
  for (let i = 0; i < 8; i++) {
    const y = 92 + i * 12;
    const a = 6 + i * 1.8;
    waves +=
      `<path d="M-10 ${r2(y)} C56 ${r2(y - a)} 108 ${r2(y + a)} 176 ${r2(y)} ` +
      `C244 ${r2(y - a)} 316 ${r2(y + a)} 410 ${r2(y - a * 0.4)}" ` +
      `stroke="${i < 4 ? DIM : GLOW}" stroke-width="${r2(1.5 + i * 0.3)}" ` +
      `opacity="${r2(0.4 + i * 0.07)}" fill="none" stroke-linecap="round"/>`;
  }
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" ${VB}>` +
    `<defs>${inkVeil('v-tide', NIGHT_PAPER)}</defs>` +
    `<rect x="-10" y="-10" width="420" height="196" fill="${NIGHT_PAPER}"/>` +
    `<circle cx="332" cy="42" r="22" fill="${MOON}"/>` +
    `<circle cx="332" cy="42" r="32" fill="none" stroke="${GLOW}" stroke-width="1.5"/>` +
    `<circle cx="332" cy="42" r="42" fill="none" stroke="${GLOW}" stroke-width="1.2" opacity="0.7"/>` +
    waves +
    `<rect x="-10" y="-10" width="420" height="196" fill="url(#v-tide)"/>` +
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

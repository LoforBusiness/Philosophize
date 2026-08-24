// ─────────────────────────────────────────────────────────────────────────────
// THE TONAL SYSTEM FOR STRUCK THINGS — rank pins and badges.
//
// ZERO IMPORTS, the same rule as badgeShapes.ts and cinematic/rig.ts: a file with
// no React in it can be required by plain Node, so a contact sheet of all
// seventy-five marks can be generated and measured without Metro or a device.
//
// ── WHY THERE IS NO COLOUR HERE ─────────────────────────────────────────────
//
// The app is hand-drawn black and white, and §19 says photographs are the ONE
// place that bends. This does not add a second place. Every value below is ink,
// grey, or the warm paper the app is already printed on — what changes is that a
// pin now has a LIT SIDE AND A SHADED SIDE, which is what makes a flat outline
// read as an object you could pick up.
//
// ── ONE LIGHT, AND IT NEVER MOVES ───────────────────────────────────────────
//
// Everything is lit from the TOP LEFT. That is the whole discipline: the face
// gradient runs light→dark down-right, the rim highlight sits top-left, the drop
// shadow falls bottom-right. Seventy-five marks lit from one direction read as a
// set; seventy-five lit from wherever suited each one reads as clip art.
//
// The angles are expressed as gradient endpoints in the unit square, so they are
// resolution-independent and identical on every shape.
// ─────────────────────────────────────────────────────────────────────────────

/** The ink the app is drawn in. */
export const INK = '#1A1A1A';
/** One step off ink — the rim's dark side, so the outline still reads as darkest. */
export const RIM_DARK = '#3A3A37';
/** Mid grey: secondary rules, the shaded half of a face. */
export const MID = '#6B6B6B';
/** The warm paper the app is printed on. */
export const PAPER = '#FAFAF7';
/** Paper, one step down — the shaded end of a face gradient. */
export const PAPER_SHADE = '#C6C0B2';
/** Paper, one step up — the lit corner. */
export const PAPER_LIT = '#FFFFFF';
/** The faint rule used for a tier's inner line. */
export const FAINT = '#C9C5BA';

/**
 * Locked linework: a cool slate, deliberately OFF the warm paper ramp above.
 *
 * A locked pin must not read as "the same pin, dimmer" — at a glance that is
 * indistinguishable from a rendering fault. Cool against the warm set reads as
 * unlit, which is the thing being said. It is also drawn FLAT, with no gradient
 * at all, so the lit/shaded contrast is itself the reward for earning it.
 */
export const GHOST = '#AAB1BC';

/** The unit-square endpoints of the one light direction: top-left to bottom-right. */
export const LIGHT = { x1: '15%', y1: '0%', x2: '85%', y2: '100%' } as const;

/** A gradient's stops, as [offset, colour, opacity] — fed straight to <Stop>. */
export type Stops = [string, string, number][];

/**
 * The face of a struck thing: lit at the top-left corner, shaded at the bottom
 * right, with the turn placed just past the middle so the lit half dominates.
 */
export const FACE: Stops = [
  ['0%', PAPER_LIT, 1],
  ['46%', PAPER, 1],
  ['100%', PAPER_SHADE, 1],
];

/**
 * The rim: ink where the light does not reach, lifting toward mid-grey where it
 * does. Drawn as a stroke, so this is what gives the outline its turned edge.
 */
export const RIM: Stops = [
  ['0%', MID, 1],
  ['40%', INK, 1],
  ['100%', RIM_DARK, 1],
];

/**
 * The recess a mark sits in — the same light, inverted. A dish is dark where a
 * dome is bright, and that inversion is the only thing that says "cut in" rather
 * than "raised". Kept shallow (a 0.09 delta) so it never competes with the mark.
 */
export const RECESS: Stops = [
  ['0%', '#00000000', 0],
  ['0%', INK, 0.09],
  ['100%', INK, 0],
];

/** Flat slate for everything locked — no gradient, by the rule above. */
export const LOCKED_FACE: Stops = [
  ['0%', '#F2F3F5', 1],
  ['100%', '#E4E7EB', 1],
];

/**
 * How far the drop shadow is offset, in the 100-unit design box.
 *
 * Down and to the right, because the light is up and to the left. Small on
 * purpose: at the 28px a badge is drawn in a grid, anything past about 1.5 units
 * stops reading as depth and starts reading as a misregistered second copy.
 */
export const SHADOW = { dx: 1.2, dy: 1.4, opacity: 0.16 } as const;

// ─────────────────────────────────────────────────────────────────────────────
// THE METALS — and yes, this file used to say they would never be used.
//
// `BadgeMedal.tsx` carried the line "Bronze / silver / gold is still not
// available and still would not be used", on the reasoning that tier belongs in
// the FLOURISH where it can be read rather than compared. That reasoning is
// still right about the flourish, which is why the flourish stays: ribbon at II,
// laurel at III, exactly as before. What changed is the answer to a different
// question — whether a trophy shelf may look like one — and the answer is now
// yes, so tier is said TWICE, in shape and in metal, which is what every set of
// struck things has always done.
//
// STILL ONE LIGHT, STILL TOP-LEFT. A metal is not a flat colour with a name; it
// is a face that runs lit→base→shade along the same diagonal every other struck
// thing in this app uses, over a rim darker than any of them. That is the whole
// reason these read as metal rather than as three coloured circles, and it is
// why they belong in this file rather than in the palette.
//
// WHY SILVER IS A WARM PEWTER, AND THE WRONG REASON IT WAS FIRST.
//
// Silver is the difficult one on a page printed in warm near-white, and it took
// two tries because the first try measured the wrong pair. The worry was that a
// cool silver would collide with `GHOST`, the slate a LOCKED medal is drawn in —
// so silver was pushed light and warm until that gap opened, landing at #DCD8CD.
// It cleared the check and looked wrong on sight: a silver badge in the grid read
// as a blank sheet of paper with an outline, indistinguishable from the paper
// medals the set used to be struck in.
//
// The measurement said why. #DCD8CD sits ΔE 12.6 from `PAPER` — it was not near
// the locked slate, it WAS the page. And `GHOST` was never the right comparison
// in the first place: it is the RIM of a locked medal, not its face, and the
// face is `LOCKED_FACE`. A silver medal already differs from a locked one in
// four ways at once (a lit face, a dark rim, a shadow, and its flourish), which
// is the "unlit against lit" argument this file makes above.
//
// So the floor that matters is distance from the PAPER the app is printed on: a
// metal that reads as the page is not a metal. #BFB9AA is ΔE 24 from paper and
// 21 from the locked face, and it reads as pewter. check-ui measures all three.
export type MetalName = 'BRONZE' | 'SILVER' | 'GOLD';

export interface Metal {
  /** The lit corner, top-left. */ lit: string;
  /** The body of the metal — what it is called when named. */ base: string;
  /** The shaded corner, bottom-right. */ shade: string;
  /** The turned edge: darker than the shade, so the object has a boundary. */ rim: string;
  /** Ink or paper, whichever reads on `base`. Never guessed — see check-ui. */ on: string;
}

// Both of the values below that look arbitrary were solved for, not chosen, and
// the checker is what found them:
//
// · BRONZE sat at #A66C38 and landed in the dead zone where NEITHER paper nor
//   ink clears 4.5:1 on it — white measured 4.35 and ink 4.16. A mid-tone that
//   nothing can be printed on is not a usable metal, so it darkened until paper
//   cleared with margin.
// · SILVER went the wrong way twice — see the note above. It is a mid pewter,
//   not a light one, because the thing it has to stand clear of is the paper.
export const METAL: Record<MetalName, Metal> = {
  BRONZE: { lit: '#E0B183', base: '#9F6634', shade: '#6B4120', rim: '#4A2B14', on: '#FFFFFF' },
  // The LIT end matters as much as the base, and silver got caught by that too:
  // at #F7F4EC the highlight was ΔE 3 from `PAPER`, so on a 66px badge — where
  // the lit corner covers a third of the face — the medal read as a blank page
  // again even with a pewter base underneath it.
  SILVER: { lit: '#E4DFD2', base: '#BFB9AA', shade: '#847E72', rim: '#524D45', on: '#1A1A1A' },
  GOLD:   { lit: '#F6E4A4', base: '#C09B37', shade: '#7C601A', rim: '#54400E', on: '#1A1A1A' },
};

/** Badge tier 1/2/3 and rank band 1/2/3 both read as bronze → silver → gold. */
export const TIER_METAL: MetalName[] = ['BRONZE', 'SILVER', 'GOLD'];

/** A metal's face, as gradient stops along the one light direction. */
export const metalFace = (m: Metal): Stops => [
  ['0%', m.lit, 1],
  ['52%', m.base, 1],
  ['100%', m.shade, 1],
];

/** A metal's rim, dark on the shaded side so the edge turns away from the light. */
export const metalRim = (m: Metal): Stops => [
  ['0%', m.shade, 1],
  ['45%', m.rim, 1],
  ['100%', m.rim, 1],
];

// ── deriving a ramp from any single colour ───────────────────────────────────
//
// The six branch hues are declared as ONE hex each, not as three. A hand-written
// lit/base/shade per branch is eighteen values to keep consistent by eye, and the
// first thing to drift would be the light direction — which is the one thing that
// has to be identical everywhere for the set to read as a set. So the lit and
// shaded ends are DERIVED, by the same two mixes for every colour.

const clamp255 = (n: number) => (n < 0 ? 0 : n > 255 ? 255 : Math.round(n));
const parse = (h: string): [number, number, number] =>
  [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
const toHex = (r: number, g: number, b: number) =>
  '#' + [r, g, b].map((v) => clamp255(v).toString(16).padStart(2, '0').toUpperCase()).join('');

/** Mix two hexes. `t` 0 → a, 1 → b. */
export function mix(a: string, b: string, t: number): string {
  const [r1, g1, b1] = parse(a);
  const [r2, g2, b2] = parse(b);
  return toHex(r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t);
}

export interface Ramp { lit: string; base: string; shade: string; rim: string; track: string; }

/**
 * A struck ramp for any base colour — the branch hues use this.
 *
 * Toward PAPER for the lit end rather than toward pure white, because the app is
 * printed on warm paper and a highlight that goes cold reads as a specular
 * reflection off glass. Toward INK for the shade, not toward black, for the same
 * reason in reverse.
 *
 * `track` is the empty part of a progress bar in that colour — the hue at a
 * tenth strength, so an unfilled bar still says which branch it belongs to
 * instead of six identical grey gutters.
 */
export function ramp(base: string): Ramp {
  return {
    lit: mix(base, PAPER, 0.34),
    base,
    shade: mix(base, INK, 0.36),
    rim: mix(base, INK, 0.58),
    track: mix(base, PAPER, 0.86),
  };
}

/** The face of a struck thing in an arbitrary colour, along the one light. */
export const rampFace = (r: Ramp): Stops => [
  ['0%', r.lit, 1],
  ['52%', r.base, 1],
  ['100%', r.shade, 1],
];

// ─────────────────────────────────────────────────────────────────────────────
// A QUOTE IS A STRUCK THING TOO.
//
// Quotes were the flattest surface in the app and the reason was structural
// rather than lazy: four screens each drew their own rectangle — a hairline
// border, italic Playfair, two greys — so a quotation carried no information
// about WHO said it, WHEN, or whether you had kept it. Twenty saved quotes were
// twenty identical grey boxes.
//
// Every one of those facts already exists. `ERA` in constants/design.ts is the
// app's licensed "colour that means something", keyed on the five era groups
// data/philosophers.ts already sorts 322 thinkers by. So a quote plate takes its
// MATERIAL from the era it was written in, and is lit by the same one light
// every pin and badge in this file uses.
//
// WHY THE VALUES ARE DERIVED AND NOT WRITTEN DOWN. Five eras × five roles is
// twenty-five hexes to keep in agreement by eye, and the first thing to drift
// would be the light direction — the one thing that has to be identical for the
// set to read as a set. Same argument as `ramp()` above, same two mixes.
//
// THE FACE IS ALMOST PAPER, ON PURPOSE. The tint is a seventh of the way to the
// hue at the SHADED corner only, which is enough to say "this plate is oxblood"
// and nowhere near enough to be a coloured card. The app is still ink on paper;
// what changed is that the paper now turns toward the light. scripts/check-ui.mjs
// re-derives all five and measures every pair — the era label must still clear
// 4.5:1 on the tinted corner it sits in, and the printer's mark must stay UNDER
// 2.2:1 so a decorative glyph can never be mistaken for a word (D31).
// ─────────────────────────────────────────────────────────────────────────────

export interface Plate {
  /** The face, along `LIGHT`: lit corner → paper → a breath of the hue. */
  face: [string, string, string];
  /** The spine down the left edge — the era, said as a turned edge. */
  spine: Ramp;
  /** The big opening mark, set behind the first line. Faint by measurement. */
  mark: string;
  /** The era's name, as text. Must be readable on `face[2]`. */
  label: string;
  /** The plate's own outline. */
  rim: string;
  /** The ledge the plate sits on, and drops onto when pressed. */
  lip: string;
  /** The hairline rule between the quotation and its byline. */
  rule: string;
}

export function plate(hue: string): Plate {
  const r = ramp(hue);
  return {
    face: [PAPER_LIT, PAPER, mix(PAPER, hue, 0.07)],
    spine: r,
    // 0.22 was solved for, not chosen: at 0.30 the mark measured 2.6:1 on its
    // own face and started reading as a character someone forgot to delete;
    // under 0.15 it vanished on paper and the plate lost its printer's mark.
    mark: mix(PAPER, hue, 0.22),
    // TEXT GETS ITS OWN TONE, for the reason `paperSoft` exists in design.ts:
    // a colour measured on one ground does not survive another. All five ERA
    // hues clear 4.5:1 on `paper` by construction, but the label sits in the
    // footer — the SHADED corner — and jade measured 4.20:1 there, under the
    // floor. A sixteenth of the way to ink puts the worst case at 5.20:1 and
    // costs the hue nothing: #3B7D76 → #366D67 is still plainly jade.
    label: mix(hue, INK, 0.16),
    rim: r.rim,
    lip: r.shade,
    rule: mix(PAPER, hue, 0.30),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// THE INSTRUMENT: COLOUR THAT HAS TO SURVIVE A DARK GROUND.
//
// Insights was rebuilt around a dark panel, and the reader's brief for it was
// exact and, on the face of it, contradictory:
//
//   > "I need more premium feel and vibrent colors, not just a bunch of colors
//   > that make the app feel cheep."
//
// Both halves are real, and the two obvious moves each fail one of them. Mixing
// the branch hues toward PAPER to lift them off the dark — what `ramp().lit`
// does — DESATURATES: the six came out #8E768E, #5A93A1, #7C96BC, a pastel set
// that reads washed rather than rich. Pushing saturation up in HSL instead runs
// straight to #C651CD electric magenta and #41DCA5 neon mint, which is the exact
// corner `constants/design.ts` already records its own colour search falling
// into, and it is the cheapest a palette can look.
//
// The band between them is a JEWEL TONE: the branch's own hue, its chroma lifted
// by a quarter rather than doubled, and lightness at the midpoint. Amethyst,
// teal, sapphire, emerald, garnet, amber — the same six branches, recognisably
// the same colours as on paper, but cut rather than printed.
//
// ── AND THE VIBRANCY IS IN THE GROUND, NOT THE PIGMENT ──────────────────────
//
// This is the part that actually answers the brief. A colour on near-black looks
// far richer than the same colour on paper, so the six do not need to shout —
// what makes the old ring look like a toy is not its hue, it is that 26px of it
// was painted at once. On the instrument the same tones appear as a THIN arc and
// a 8px swatch, and everything else is cream. Small area, dark ground, restraint.
//
// TYPE ON THE PANEL IS NEVER A BRANCH COLOUR. Measured on `PANEL_BASE`, the six
// run 3.8:1 to 9.1:1 — comfortably past the 3:1 a non-text mark is held to, and
// three of them under the 4.5:1 that text needs. So the hues encode and the
// words stay cream. scripts/check-ui.mjs re-derives both floors.
// ─────────────────────────────────────────────────────────────────────────────

/** The instrument's ground: ink taken down toward black, and its lit top edge. */
export const PANEL_BASE = '#0E0E0E';
export const PANEL_LIP = '#232220';
/** The hairline that separates blocks on the panel. */
export const PANEL_RULE = '#2E2C29';

function toHsl(hex: string): [number, number, number] {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const mx = Math.max(r, g, b);
  const mn = Math.min(r, g, b);
  const l = (mx + mn) / 2;
  const d = mx - mn;
  if (d === 0) return [0, 0, l];
  const s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
  let h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h /= 6;
  return [h * 360, s, l];
}

function fromHsl(h: number, s: number, l: number): string {
  const hh = h / 360;
  const f = (p: number, q: number, t0: number) => {
    let t = t0;
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  if (s === 0) return toHex(l * 255, l * 255, l * 255);
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return toHex(f(p, q, hh + 1 / 3) * 255, f(p, q, hh) * 255, f(p, q, hh - 1 / 3) * 255);
}

export interface Glow { mark: string; deep: string; wash: string; }

/**
 * A branch or era hue, cut for the dark panel. MARKS ONLY — never type.
 *
 * `mark` is the jewel tone itself. `deep` is the same stone in shadow, for the
 * far end of an arc so it still turns away from the one light. `wash` is it at a
 * whisper, for a groove or an area fill that must not become a second surface.
 */
export function glow(hue: string): Glow {
  const [h, s] = toHsl(hue);
  const mark = fromHsl(h, Math.min(0.52, s * 1.25), 0.5);
  return {
    mark,
    deep: fromHsl(h, Math.min(0.52, s * 1.25), 0.34),
    wash: mix(PANEL_BASE, mark, 0.16),
  };
}

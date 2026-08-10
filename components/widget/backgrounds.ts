// The home-screen widget's backdrops.
//
// ZERO IMPORTS, like rig.ts and tone.ts and for the same reason: every scene in
// here can be rendered and MEASURED in plain Node, so "is the quote still
// readable on this one" is arithmetic rather than an opinion.
// `npm run check:widget` does exactly that, over every scene, every text run.
//
// ═════════════════════════════════════════════════════════════════════════════
// A SCENE IS DRAWN TO THE WIDGET'S OWN SIZE. IT IS NOT SLICED.
//
// This file used to draw every scene into one 400×176 box and set
// `preserveAspectRatio="xMidYMid slice"`, on the reasoning that the box would
// then be cropped to cover whatever the widget happened to be. That is exactly
// how SVG behaves in a browser, and it is why the contact sheet and the settings
// picker both looked right. It is NOT what the widget does.
//
// The device path is `SvgWidget` → androidsvg:
//
//     SVG svg = getSvg();
//     PictureDrawable pd = new PictureDrawable(svg.renderToPicture());
//     view.setImageDrawable(pd);
//
// `renderToPicture()` with no arguments renders at the document's own intrinsic
// size — the 400×176 viewBox — so `slice` has no differing viewport to act on and
// does nothing at all. The Picture is then handed to an ImageView, and the
// library never sets a scaleType, so Android's default FIT_CENTER applies: the
// whole picture is fitted INSIDE the widget, letterboxed, with bare card showing
// wherever the aspect ratios disagree. The widget is resizable from 180×110 to
// 360×300 — 1.6:1 to 3.3:1 — so they almost always disagree.
//
// A scaleType would fix it in one line and cannot be shipped: it is native, and
// an OTA cannot change the APK. So the fix is on this side. Every scene is a
// FUNCTION OF THE WIDGET'S SIZE and its viewBox is that size in dp, which makes
// fit-center exact — same aspect in, same aspect out, no bars at any size.
//
// Working in dp also makes the layout legible, because the type is specified in
// dp: the header really is 11dp from the top, the hatching pitch really is 3dp,
// and neither drifts when the widget is resized.
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
// is DARK: #6E675A is only 3.1:1 and fails.
//
// ── AND THE MIDDLE OF THE CARD IS NO LONGER EMPTY ───────────────────────────
//
// The previous scenes reserved the quote's whole band as bare field — nothing
// above the horizon but a gradient — which is a defensible way to protect type
// and the reason the card read as a footer illustration under a blank sheet
// rather than as a picture. The ramp above is what makes that unnecessary: cloud
// and hatching at FAR and MID clear 7:1 under ink, provably, so the sky can carry
// real drawing. NEAR still never crosses type; it is for the ground band.
//
// ── DRAWING CONSTRAINTS ─────────────────────────────────────────────────────
//
// Rendered by AndroidSVG 1.4, which is SVG 1.1: shapes, paths, linearGradient,
// opacity, groups. NO filters, NO masks — a crescent is cut with an overlapping
// disc in the backdrop colour instead.
//
// GROUP OPACITY IS THE ONE TRICK WORTH KNOWING HERE. A cumulus is a union of
// overlapping discs, and overlapping translucent discs show every seam. Put them
// in a `<g opacity="…">` and the group is flattened before the opacity applies,
// so the union reads as one mass. That is what lets these clouds be lobed rather
// than being one smooth blob.
//
// Gradient ids are per-scene (`v-night`, not `v`). Two of these can end up in one
// document — the settings picker draws all five at once, and a contact sheet
// does too — and duplicate ids mean every `url(#v)` resolves to whichever scene
// happened to render first. That is not hypothetical: it silently gave both dark
// scenes the light scene's paper veil, and the sheet showed two grey smears.
// ═════════════════════════════════════════════════════════════════════════════

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
  /**
   * The scene, drawn to fill a card of exactly `w` × `h` DP.
   *
   * A function rather than a string because the viewBox has to be the widget's
   * own aspect — see the header. Callers that genuinely have no size (a swatch,
   * a test) should pass `TARGET_W`/`TARGET_H`.
   */
  svg: (w: number, h: number) => string;
}

/** The 4×2 cell the widget targets, in dp. The default when no size is known. */
export const TARGET_W = 250;
export const TARGET_H = 110;

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
// LIGHT scenes. FAR and MID may cross type; NEAR may not.
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

// ── scene parts, all in DP and all sized from the box ───────────────────────

/** The sky: one wash down the whole card. Every scene starts here. */
function sky(id: string, top: string, bottom: string): string {
  return (
    `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">` +
    `<stop offset="0" stop-color="${top}"/>` +
    `<stop offset="1" stop-color="${bottom}"/>` +
    `</linearGradient>`
  );
}

/**
 * RULED SKY — fine horizontal lines, thinning as they rise.
 *
 * The oldest way to make a sky out of nothing but a pen, and the single cheapest
 * mark in this file that says "cut by hand" rather than "filled by a computer".
 * Lengths and gaps are irregular; an even pitch would be a hatch swatch.
 */
function ruled(seed: number, w: number, y0: number, y1: number, c: string, op: number): string {
  const R = prng(seed);
  let d = '';
  for (let y = y1; y > y0; y -= 2.6) {
    // sparser toward the top, so the sky opens out instead of ending at a line
    const f = (y - y0) / Math.max(1, y1 - y0);
    if (R() > 0.26 + f * 0.7) continue;
    let x = -R() * 30;
    while (x < w) {
      const len = 10 + R() * 46 * (0.4 + f);
      const x1 = Math.min(w + 2, x + len);
      if (x1 > 0) d += `M${r2(Math.max(-2, x))} ${r2(y)} L${r2(x1)} ${r2(y)} `;
      x += len + 6 + R() * 26;
    }
  }
  return `<path d="${d}" stroke="${c}" stroke-width="0.7" opacity="${op}" fill="none"/>`;
}

/**
 * A CUMULUS, as the discs it is made of.
 *
 * Wrapped in one `<g>` so the overlaps flatten before the opacity is applied —
 * otherwise every disc boundary shows as a seam and the cloud reads as a pile of
 * bubbles. Lobes are placed on an uneven walk with a tapering stack on top, which
 * is what makes it lumpy in the particular way a cloud is lumpy.
 */
function cloud(
  seed: number, cx: number, cy: number, s: number,
  body: string, lit: string, op: number
): string {
  const R = prng(seed);
  const discs: [number, number, number][] = [];
  // the base run, left to right, never evenly spaced
  let x = cx - s * 1.5;
  while (x < cx + s * 1.5) {
    const r = s * (0.30 + R() * 0.26);
    discs.push([x, cy - r * 0.25, r]);
    x += r * (0.9 + R() * 0.7);
  }
  // one or two heaped shoulders, off centre on purpose
  const towers = 1 + Math.floor(R() * 2);
  for (let t = 0; t < towers; t++) {
    const tx = cx + (R() - 0.5) * s * 1.7;
    let ty = cy - s * 0.34;
    let r = s * 0.42;
    for (let k = 0; k < 3; k++) {
      discs.push([tx + (R() - 0.5) * s * 0.3, ty, r]);
      ty -= r * 0.72;
      r *= 0.68;
    }
  }
  const of = (ds: [number, number, number][], fill: string, o: number) =>
    `<g fill="${fill}" opacity="${o}">`
    + ds.map(([x2, y2, r]) => `<circle cx="${r2(x2)}" cy="${r2(y2)}" r="${r2(r)}"/>`).join('')
    + `</g>`;
  // TWO TONES, and it is the whole difference between a cloud and a blob. The
  // body is the darker tone at the true silhouette; the lit crown is each lobe
  // pulled in by a tenth of its own radius and moved up-left by the same, so the
  // top edge stays on the silhouette and the crevices between lobes open up.
  // One light, top-left, as everywhere else in this app.
  const crown = discs.map(([x2, y2, r]) =>
    [x2 - r * 0.1, y2 - r * 0.1, r * 0.9] as [number, number, number]);
  return of(discs, body, op) + of(crown, lit, op);
}

/**
 * A FACETED RIDGE — planes meeting at edges, closed to the floor.
 *
 * Straight segments with a shoulder below each summit. The cubic-curve version
 * this replaces gave every scene the same soft scalloped horizon, which is the
 * shape a generator reaches for first and reads as one.
 */
function crag(seed: number, w: number, h: number, base: number, amp: number, c: string, op: number): string {
  const R = prng(seed);
  const step = w / 4.5;
  let d = `M-2 ${r2(base)}`;
  let x = -2;
  let i = 0;
  while (x < w + step) {
    const tall = i % 2 === 0 ? 0.55 + R() * 0.45 : 0.16 + R() * 0.3;
    const peak = base - amp * tall;
    const sx = x + step * (0.3 + R() * 0.25);
    d += ` L${r2(sx)} ${r2(base - amp * tall * (0.4 + R() * 0.3))}`;
    d += ` L${r2(sx + step * 0.22)} ${r2(peak)}`;
    x = sx + step * (0.5 + R() * 0.5);
    d += ` L${r2(x)} ${r2(peak + amp * tall * (0.25 + R() * 0.25))}`;
    i++;
  }
  return `<path d="${d} L${r2(w + 2)} ${r2(h + 2)} L-2 ${r2(h + 2)} Z" fill="${c}" opacity="${op}"/>`;
}

/**
 * A TREELINE — conifers, two to four times taller than they are wide, in tiers.
 *
 * The proportion is the whole thing. The row this replaces was five identical
 * isoceles triangles on an even 36-unit pitch; at that width a triangle is a
 * tent, and five of them evenly spaced is a pattern swatch. Heights vary by a
 * factor of three here, the gaps are uneven, and roughly one in seven is a bare
 * snag, which is what stops a wood reading as a crop.
 */
function conifers(seed: number, w: number, base: number, h: number, c: string, op: number): string {
  const R = prng(seed);
  let d = '';
  let x = -4;
  while (x < w + 6) {
    const th = h * (0.5 + R() * 0.95);
    // Aspect is the whole thing: at 0.13 these came out as spikes on the sheet.
    const halfW = th * (0.22 + R() * 0.16);
    const tip = x + (R() - 0.5) * halfW;
    if (R() < 0.09) {
      // A BROKEN STUMP, not a spike. At 0.18 of an already-narrow tree this came
      // out as a hair with an arm on it — an aerial rather than a dead tree, and
      // the one shape on the sheet that read as a glitch.
      const tw = Math.max(0.9, halfW * 0.34);
      d += `M${r2(x - tw * 2)} ${r2(base)} L${r2(tip - tw)} ${r2(base - th * 0.85)}`
        + ` L${r2(tip + tw + halfW * 0.5)} ${r2(base - th * 0.6)} L${r2(tip + tw)} ${r2(base - th * 0.72)}`
        + ` L${r2(x + tw * 2)} ${r2(base)} Z `;
    } else {
      const tiers = 3 + Math.floor(R() * 2);
      d += `M${r2(x - halfW)} ${r2(base)}`;
      for (let s = 1; s <= tiers; s++) {
        const f = s / tiers;
        const out = halfW * (1 - f) * (0.9 + R() * 0.5);
        d += ` L${r2(x - out)} ${r2(base - th * (f - 1 / tiers) - th * 0.05)}`;
        d += ` L${r2(x - out * 0.55)} ${r2(base - th * f)}`;
      }
      d += ` L${r2(tip)} ${r2(base - th)}`;
      for (let s = tiers; s >= 1; s--) {
        const f = s / tiers;
        const out = halfW * (1 - f) * (0.85 + R() * 0.55);
        d += ` L${r2(x + out * 0.5)} ${r2(base - th * f)}`;
        d += ` L${r2(x + out)} ${r2(base - th * (f - 1 / tiers) - th * 0.04)}`;
      }
      d += ` L${r2(x + halfW)} ${r2(base)} Z `;
    }
    x += halfW * (1.5 + R() * 2.6);
  }
  return `<path d="${d}" fill="${c}" opacity="${op}"/>`;
}

/** A disc — sun or moon. The one shape allowed to be perfect. */
const disc = (cx: number, cy: number, r: number, c: string, op = 1) =>
  `<circle cx="${r2(cx)}" cy="${r2(cy)}" r="${r2(r)}" fill="${c}" opacity="${op}"/>`;

/** A bird: two strokes, the oldest shorthand there is. */
const bird = (x: number, y: number, s: number, c: string, wgt: number) =>
  `<path d="M${r2(x)} ${r2(y)} C${r2(x + s * 0.3)} ${r2(y - s * 0.4)} ${r2(x + s * 0.7)} ${r2(y - s * 0.4)} ${r2(x + s)} ${r2(y)}` +
  ` M${r2(x + s)} ${r2(y)} C${r2(x + s * 1.3)} ${r2(y - s * 0.4)} ${r2(x + s * 1.7)} ${r2(y - s * 0.4)} ${r2(x + s * 2)} ${r2(y)}" ` +
  `stroke="${c}" stroke-width="${wgt}" fill="none" stroke-linecap="round"/>`;

/** A colonnade: uneven bays, two of them broken. A ruin is not an arcade. */
function ruin(seed: number, x0: number, base: number, h: number, bays: number, c: string, op: number): string {
  const R = prng(seed);
  let d = '';
  let x = x0;
  for (let i = 0; i < bays; i++) {
    const bw = h * (0.30 + R() * 0.14);
    const standing = R() > 0.22;
    const ht = standing ? h : h * (0.35 + R() * 0.35);
    d += `M${r2(x)} ${r2(base)} L${r2(x)} ${r2(base - ht)} L${r2(x + bw * 0.34)} ${r2(base - ht)}`
      + ` L${r2(x + bw * 0.34)} ${r2(base)} Z `;
    // the lintel only survives where both its columns do
    if (standing && i > 0 && R() > 0.35) {
      d += `M${r2(x - bw * 0.86)} ${r2(base - h)} L${r2(x + bw * 0.34)} ${r2(base - h)}`
        + ` L${r2(x + bw * 0.34)} ${r2(base - h * 0.9)} L${r2(x - bw * 0.86)} ${r2(base - h * 0.9)} Z `;
    }
    x += bw * (1.05 + R() * 0.5);
  }
  return `<path d="${d}" fill="${c}" opacity="${op}"/>`;
}

// ═══════════════════════════════════════════════════════════════════════════
// THE SCENES
//
// Laid out in DP against the card's real geometry, which is fixed by
// QuoteWidget: 11dp of vertical padding, a 12dp header row, a rule at ~28dp, the
// quote taking everything the card can spare, and a 12dp footer row.
//
//   y  0  … 26      sky. The header sits in it, so FAR only.
//   y 26  … h−26    the quote. FAR and MID are provably fine here (7:1); this is
//                   where the cloud and the ruled sky go, and it is the change
//                   that makes the card a picture rather than a footer.
//   y h−26 … h      the ground. NEAR lives here and nowhere else.
//
// The horizon is placed as a FRACTION of the card, so a tall widget gets more
// sky rather than a stretched hill — and every scene fills the box exactly,
// because the box is the widget.
// ═══════════════════════════════════════════════════════════════════════════

function frame(id: string, w: number, h: number, top: string, bottom: string, dark: boolean, body: string): string {
  const veil = dark ? inkVeil(`v-${id}`, NIGHT_PAPER) : paperVeil(`v-${id}`, PAPER);
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${r2(w)} ${r2(h)}" width="${r2(w)}" height="${r2(h)}">` +
    `<defs>${sky(`s-${id}`, top, bottom)}${veil}</defs>` +
    `<rect x="0" y="0" width="${r2(w)}" height="${r2(h)}" fill="url(#s-${id})"/>` +
    body +
    `<rect x="0" y="0" width="${r2(w)}" height="${r2(h)}" fill="url(#v-${id})"/>` +
    `</svg>`
  );
}

/** 1 — GROVE. A stand of pines on a low ridge under a heaped sky. */
function grove(w: number, h: number): string {
  const horizon = h * 0.74;
  return frame('grove', w, h, PAPER, '#EFE9DA', false,
    ruled(11, w, h * 0.06, horizon - h * 0.08, MID, 0.5) +
    cloud(23, w * 0.30, h * 0.30, h * 0.20, MID, FAR, 0.85) +
    cloud(47, w * 0.78, h * 0.20, h * 0.14, MID, FAR, 0.7) +
    disc(w * 0.80, horizon - h * 0.06, h * 0.13, MID, 0.55) +
    crag(59, w, h, horizon, h * 0.16, MID, 0.8) +
    conifers(71, w, horizon + h * 0.04, h * 0.22, NEAR, 0.75) +
    crag(83, w, h, horizon + h * 0.12, h * 0.09, NEAR, 0.72));
}

/** 2 — RIDGES. Nothing but land, receding, and a great deal of weather. */
function ridges(w: number, h: number): string {
  const horizon = h * 0.70;
  return frame('ridges', w, h, PAPER, '#EEE7D6', false,
    ruled(101, w, h * 0.05, horizon - h * 0.1, MID, 0.45) +
    cloud(113, w * 0.22, h * 0.26, h * 0.22, MID, FAR, 0.9) +
    cloud(127, w * 0.62, h * 0.17, h * 0.17, MID, FAR, 0.8) +
    cloud(131, w * 0.93, h * 0.30, h * 0.13, MID, FAR, 0.65) +
    disc(w * 0.44, horizon - h * 0.03, h * 0.15, MID, 0.5) +
    crag(139, w, h, horizon, h * 0.2, FAR, 1) +
    crag(149, w, h, horizon + h * 0.1, h * 0.15, MID, 0.85) +
    crag(151, w, h, horizon + h * 0.2, h * 0.09, NEAR, 0.72));
}

/** 3 — COLONNADE. A ruin on the skyline, half of it fallen. */
function colonnade(w: number, h: number): string {
  const horizon = h * 0.78;
  return frame('colonnade', w, h, PAPER, '#EFEADC', false,
    ruled(163, w, h * 0.06, horizon - h * 0.1, MID, 0.45) +
    cloud(173, w * 0.18, h * 0.24, h * 0.19, MID, FAR, 0.82) +
    cloud(181, w * 0.70, h * 0.30, h * 0.15, MID, FAR, 0.7) +
    disc(w * 0.24, horizon - h * 0.1, h * 0.12, MID, 0.5) +
    crag(191, w, h, horizon, h * 0.1, FAR, 1) +
    ruin(193, w * 0.52, horizon + h * 0.02, h * 0.30, 6, NEAR, 0.8) +
    crag(197, w, h, horizon + h * 0.13, h * 0.07, NEAR, 0.72));
}

/** 4 — NIGHT. Stars, a moon low behind the hills, and one ragged treeline. */
function night(w: number, h: number): string {
  const horizon = h * 0.76;
  const R = prng(211);
  let stars = '';
  for (let i = 0; i < 46; i++) {
    const x = R() * w;
    const y = R() * horizon * 0.92;
    const r = 0.35 + R() * 0.85;
    stars += `<circle cx="${r2(x)}" cy="${r2(y)}" r="${r2(r)}" fill="${BRIGHT}" opacity="${r2(0.24 + R() * 0.5)}"/>`;
  }
  // The horizon is LIGHTER than the top. A night scene whose sky is as dark as
  // its land has no silhouette in it, which is what made this read as an empty
  // black card with a smudge on it. Cream type wants a dark FIELD, and the check
  // says there is ten to one of room here, so the glow can be a real glow.
  return frame('night', w, h, '#100F0B', '#4A4335', true,
    stars +
    cloud(223, w * 0.66, h * 0.24, h * 0.18, DIM, GLOW, 0.85) +
    disc(w * 0.30, horizon - h * 0.08, h * 0.14, '#8A8370', 1) +
    crag(227, w, h, horizon, h * 0.14, '#0C0B08', 1) +
    conifers(229, w, horizon + h * 0.05, h * 0.2, '#0B0A07', 1));
}

/** 5 — TIDE. A moon over water, and the long light lying across it. */
function tide(w: number, h: number): string {
  const horizon = h * 0.62;
  const R = prng(233);
  let glints = '';
  // the moon's path on the water: short broken rules, longest under the moon
  for (let i = 0; i < 16; i++) {
    const y = horizon + (i + 1) * ((h - horizon) / 17);
    const spread = (i / 16) * w * 0.30 + w * 0.03;
    const cx = w * 0.68;
    const n = 1 + Math.floor(R() * 2);
    for (let k = 0; k < n; k++) {
      const x0 = cx - spread + R() * spread * 2;
      const len = (0.1 + R() * 0.5) * spread;
      glints += `<rect x="${r2(x0)}" y="${r2(y)}" width="${r2(len)}" height="${r2(0.6 + R() * 0.7)}"`
        + ` fill="${BRIGHT}" opacity="${r2(0.16 + R() * 0.3)}"/>`;
    }
  }
  return frame('tide', w, h, '#100F0B', '#443E31', true,
    cloud(239, w * 0.24, h * 0.2, h * 0.16, DIM, GLOW, 0.8) +
    disc(w * 0.68, horizon - h * 0.16, h * 0.13, '#8A8370', 1) +
    crag(241, w, h, horizon, h * 0.08, '#0C0B08', 1) +
    `<rect x="0" y="${r2(horizon)}" width="${r2(w)}" height="${r2(h - horizon)}" fill="#0B0A07" opacity="0.9"/>` +
    glints);
}

export const WIDGET_BACKGROUNDS: readonly WidgetBackground[] = [
  { id: 'grove', name: 'Grove', dark: false, paper: PAPER, ink: INK, inkSoft: INK_SOFT, hairline: HAIRLINE, svg: grove },
  { id: 'ridges', name: 'Ridges', dark: false, paper: PAPER, ink: INK, inkSoft: INK_SOFT, hairline: HAIRLINE, svg: ridges },
  { id: 'colonnade', name: 'Colonnade', dark: false, paper: PAPER, ink: INK, inkSoft: INK_SOFT, hairline: HAIRLINE, svg: colonnade },
  { id: 'night', name: 'Night', dark: true, paper: NIGHT_PAPER, ink: NIGHT_INK, inkSoft: NIGHT_SOFT, hairline: NIGHT_HAIR, svg: night },
  { id: 'tide', name: 'Tide', dark: true, paper: NIGHT_PAPER, ink: NIGHT_INK, inkSoft: NIGHT_SOFT, hairline: NIGHT_HAIR, svg: tide },
];

export const DEFAULT_WIDGET_BACKGROUND = 'grove';

export function backgroundById(id: string | undefined | null): WidgetBackground {
  return WIDGET_BACKGROUNDS.find((b) => b.id === id) ?? WIDGET_BACKGROUNDS[0];
}

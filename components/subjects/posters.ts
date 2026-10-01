// ─────────────────────────────────────────────────────────────────────────────
// THE SUBJECT POSTERS — seven subjects and philosophy's six branches (2026-09-29).
//
//   posterXml('science', hue, 169, 120)  → an <svg> string sized for that box
//
// The owner asked for the subject cards to be "more appealing … better gamification
// look", with references. What the references agreed on (Imprint's course covers,
// Brilliant's course art, Headway's and Deepstash's shelves) is that the ART FILLS
// THE CARD: a saturated ground in the course's own colour with one lit object on it,
// not a small drawing sat on a pale panel. The owner picked this "poster" style from
// a sheet of all seven on 2026-09-29.
//
// ── EVERY POSTER IS A PLACE (the second pass, same day) ─────────────────────
//
// The first pass stood every object on one shared backdrop — a lit disc, sparkles and
// a floor — and the owner saw what that is: "the background of these cards look all
// the same and kind of look AI with the star look. And also the round circle in the
// background." Imprint's own covers answer it: its philosophy course is an arched
// niche in a wall with steps up to it, a few large flat shapes and nothing floating.
// So each poster now stands in its OWN setting, drawn from a reference: an alcove, a
// room with an inkblot on the wall, hills, an office window, market awnings, a tiled
// lab, a desert, space, a library, a blueprint, a panelled court, a gallery, a square.
//
// The setting is built in tints and shades of the poster's own hue and carries NO ink
// outline, so it stays behind; the object is paper with one ink outline, so it stands
// in front. Nothing floats: no sparkles, no glow disc, no loose ember diamond — the
// ember appears only as part of a thing (a clasp, a flag, a wax seal, a heart).
//
// Three objects were also re-proportioned against references the same day — the head
// was 1.3× wider than tall where a profile is about square, the briefcase 2:1 where one
// is about 1.4:1, and the hourglass's glass a narrow tube in a tall frame where real
// bulbs fill the space between the posts.
//
// ── THE BOX DECIDES THE VIEWBOX, NOT THE OTHER WAY ROUND ────────────────────
//
// The drawing is authored in a 200×150 frame, and a card can be any shape: the Home
// card is wide, a Learn tile nearly square, the masthead very wide. Slicing would crop
// the object's head off and meeting would leave bars, so the viewBox GROWS to the box's
// aspect instead — sideways about the centre, or upward from the floor — and every
// setting is drawn far past the frame so the extra room is simply more of the same
// place. The object is never cut and never stretched. A box TALLER than the frame first
// trims the frame's empty sides to CORE, so a narrow branch card is not a tall sky over
// a small drawing.
//
// ── ZERO RUNTIME IMPORTS BUT tone.ts, WHICH HAS NONE ─────────────────────────
//
// So `npm run sheet:subjects` renders every poster in a plain browser page, and
// check:subjects can build each string in Node and look at it.
//
// ── EACH DRAWING STATES ITS REFERENCE ───────────────────────────────────────
//
// Fetched with `npm run ref` before drawing, as the lesson objects are (group AM).
// ─────────────────────────────────────────────────────────────────────────────
import { mix, INK, EMBER, PAPER, PAPER_LIT } from '@/components/shared/tone';
import { SCENES, SCENE_GROUND } from './subjectScenes';

export type PosterKey =
  | 'philosophy' | 'psychology' | 'personal-growth' | 'business' | 'economics' | 'science' | 'history'
  | 'metaphysics' | 'epistemology' | 'logic' | 'ethics' | 'aesthetics' | 'political-philosophy';

/** The authored frame. */
export const FRAME = { w: 200, h: 150 } as const;
/**
 * The band every OBJECT stays inside, sideways. The frame's outer 22 units each side
 * are only setting, so a box taller than the frame may trim them rather than grow so
 * tall that the drawing shrinks to its foot — a branch card is 80 wide and 128 tall on
 * a narrow phone.
 */
export const CORE = { x0: 22, x1: 178 } as const;
/** The outline weight, in frame units. */
export const LINE = 3;
/** Where the floor meets the wall in every setting. */
const FLOOR = 116;
/** How far past the frame a setting is drawn, so any box is filled. */
const L0 = -400;
const LW = 1000;

const tint = (h: string, t: number) => mix(h, PAPER_LIT, t);
const shade = (h: string, t: number) => mix(h, INK, t * 1.1);
const LIT = PAPER;
const S = `stroke="${INK}" stroke-width="${LINE}" stroke-linejoin="round" stroke-linecap="round"`;

/** A cast shadow: a pill, never an oval (group AG). */
function pill(x: number, y: number, w: number, hue: string) {
  return `<rect x="${x - w / 2}" y="${y - 4}" width="${w}" height="8" rx="4" fill="${shade(hue, 0.35)}" opacity="0.55"/>`;
}
/** A band across the whole setting, from `y` for `h`. */
function band(y: number, h: number, fill: string, extra = '') {
  return `<rect x="${L0}" y="${y}" width="${LW}" height="${h}" fill="${fill}"${extra}/>`;
}
/** The floor: everything below the wall line, in `fill`, with a pale lip on its edge. */
function floor(hue: string, fill = shade(hue, 0.22), lip = tint(hue, 0.1)) {
  return band(FLOOR, 400, fill) + band(FLOOR, 2, lip);
}

const mid = (hue: string) => tint(hue, 0.58);
const recess = (hue: string) => shade(hue, 0.12);

/**
 * A gear as ONE outline — the rim and its teeth traced as a single path — so it is
 * outlined once. Teeth drawn as separate outlined blocks read as a dashed ring.
 */
function gear(
  x: number, y: number, r: number, teeth: number, fill: string, hue: string, rot = 0,
  // A SMALL gear needs fewer, fatter teeth, a lighter line and no inner ring, or the
  // outline eats the teeth and the fill shows only as spokes between them.
  opt: { tooth?: number; w?: number; ring?: boolean } = {},
) {
  const out = r + Math.max(4, r * 0.22);
  const t = opt.tooth ?? 0.4;
  const sw = opt.w ?? LINE;
  const step = (Math.PI * 2) / teeth;
  const pts: string[] = [];
  const at = (rad: number, a: number) => `${(x + rad * Math.cos(a)).toFixed(2)} ${(y + rad * Math.sin(a)).toFixed(2)}`;
  for (let i = 0; i < teeth; i++) {
    const a = (rot * Math.PI) / 180 + i * step;
    // root, flank up, tooth top, flank down — the tooth takes 45% of each step
    pts.push(at(r, a - step * 0.5), at(r, a - step * (t / 2 + 0.1)), at(out, a - step * (t / 2)), at(out, a + step * (t / 2)), at(r, a + step * (t / 2 + 0.1)));
  }
  return `<path d="M${pts.join('L')}Z" fill="${fill}" stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"/>`
    + (opt.ring === false ? '' : `<circle cx="${x}" cy="${y}" r="${r * 0.62}" fill="none" stroke="${mid(hue)}" stroke-width="2"/>`)
    + `<circle cx="${x}" cy="${y}" r="${r * 0.3}" fill="${recess(hue)}" ${S} stroke-width="2.4"/>`;
}
function coin(x: number, y: number, hue: string, rx = 14) {
  return `<ellipse cx="${x}" cy="${y + 3.5}" rx="${rx}" ry="5.5" fill="${mid(hue)}" ${S} stroke-width="2.4"/><ellipse cx="${x}" cy="${y}" rx="${rx}" ry="5.5" fill="${LIT}" ${S} stroke-width="2.4"/>`;
}
/**
 * A stack of `n` coins as ONE cylinder — a lit body with its shaded right side, the
 * coin seams as hairlines in the mid tone, and the top face — so it reads as a stack
 * of coins and not as a ribbed barrel (which is what n outlined coins came out as).
 */
function coinStack(x: number, base: number, n: number, hue: string, rx = 15) {
  const M = mid(hue);
  const ry = 5.5;
  const top = base - n * 6;
  let seams = '';
  for (let i = 1; i < n; i++) {
    const y = base - i * 6;
    seams += `<path d="M${x - rx} ${y}A${rx} ${ry} 0 0 0 ${x + rx} ${y}" fill="none" stroke="${M}" stroke-width="1.6"/>`;
  }
  return `<path d="M${x - rx} ${top}L${x - rx} ${base}A${rx} ${ry} 0 0 0 ${x + rx} ${base}L${x + rx} ${top}Z" fill="${LIT}"/>`
    + `<path d="M${x + rx * 0.35} ${top + ry * 0.94}L${x + rx * 0.35} ${base + ry * 0.94}A${rx} ${ry} 0 0 0 ${x + rx} ${base}L${x + rx} ${top}Z" fill="${M}" opacity="0.7"/>`
    + seams
    + `<path d="M${x - rx} ${top}L${x - rx} ${base}A${rx} ${ry} 0 0 0 ${x + rx} ${base}L${x + rx} ${top}" fill="none" ${S}/>`
    + `<ellipse cx="${x}" cy="${top}" rx="${rx}" ry="${ry}" fill="${LIT}" ${S}/>`
    + `<ellipse cx="${x}" cy="${top}" rx="${rx * 0.55}" ry="${ry * 0.5}" fill="none" stroke="${M}" stroke-width="1.6"/>`;
}
/** A flat cloud — a row of lobes on a flat base, one fill, no outline. */
function cloud(x: number, y: number, w: number, fill: string) {
  const r = w / 5;
  return `<g fill="${fill}"><rect x="${x}" y="${y - r * 0.9}" width="${w}" height="${r * 0.9}" rx="${r * 0.45}"/>`
    + `<circle cx="${x + w * 0.3}" cy="${y - r * 0.9}" r="${r}"/><circle cx="${x + w * 0.58}" cy="${y - r * 1.2}" r="${r * 1.25}"/>`
    + `<circle cx="${x + w * 0.8}" cy="${y - r * 0.7}" r="${r * 0.8}"/></g>`;
}
/** A deterministic sequence in [0, 1) — the same books on the same shelf every render. */
function seq(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (Math.imul(a, 1664525) + 1013904223) >>> 0;
    return a / 4294967296;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// THE SETTINGS — one per poster, no ink outline, in the poster's own hue.
// ─────────────────────────────────────────────────────────────────────────────

type Setting = (hue: string) => string;

/** REFERENCE: a museum niche — a round-headed recess in a wall, a moulding round its
 *  arch, a plinth at its foot; Imprint's philosophy cover is the same idea. Marble floor. */
const alcove: Setting = (hue) => {
  const edge = shade(hue, 0.1);
  let tiles = '';
  for (let x = -300; x <= 500; x += 26) tiles += `<path d="M${x} ${FLOOR}L${100 + (x - 100) * 1.5} 150" stroke="${shade(hue, 0.32)}" stroke-width="1.2" opacity="0.6"/>`;
  return band(-300, 600, hue)
    + `<path d="M40 ${FLOOR}L40 60A60 60 0 0 1 160 60L160 ${FLOOR}Z" fill="${tint(hue, 0.16)}"/>`
    + `<path d="M40 60A60 60 0 0 1 160 60" fill="none" stroke="${edge}" stroke-width="4"/>`
    + `<path d="M48 ${FLOOR}L48 62A52 52 0 0 1 64 25" fill="none" stroke="${tint(hue, 0.08)}" stroke-width="7"/>`
    + `<rect x="36" y="108" width="128" height="8" fill="${tint(hue, 0.26)}"/>`
    + floor(hue) + band(128, 1.4, shade(hue, 0.32)) + band(140, 1.4, shade(hue, 0.32)) + tiles;
};

/** REFERENCE: a consulting room — a papered wall, a framed Rorschach card (one blot,
 *  mirrored down its middle), a skirting board and a rug. */
const inkblotRoom: Setting = (hue) => {
  let stripes = '';
  for (let x = -300; x <= 500; x += 16) stripes += `<rect x="${x}" y="-300" width="5" height="${300 + 108}" fill="${tint(hue, 0.05)}"/>`;
  const blot = 'M30 34C24 36 20 40 22 46C15 48 16 57 23 57C21 63 27 66 30 61C33 66 39 63 37 57C44 57 45 48 38 46C40 40 36 36 30 34Z';
  return band(-300, 600, hue) + stripes
    + `<rect x="10" y="22" width="40" height="50" fill="${shade(hue, 0.3)}"/>`
    + `<rect x="14" y="26" width="32" height="42" fill="${tint(hue, 0.55)}"/>`
    + `<path d="${blot}" fill="${shade(hue, 0.15)}"/>`
    + band(106, 10, shade(hue, 0.1))
    + floor(hue)
    + `<rect x="36" y="119" width="128" height="16" rx="8" fill="${tint(hue, 0.12)}"/>`
    + `<rect x="44" y="124" width="112" height="6" rx="3" fill="none" stroke="${shade(hue, 0.08)}" stroke-width="1.4"/>`;
};

/** REFERENCE: a morning landscape — flat banks of cloud, a far ridge, near grass with
 *  a path winding up toward the summit. */
const hills: Setting = (hue) =>
  band(-300, 600, hue)
  + cloud(8, 40, 44, tint(hue, 0.2)) + cloud(150, 30, 38, tint(hue, 0.16)) + cloud(-60, 22, 40, tint(hue, 0.16)) + cloud(220, 44, 40, tint(hue, 0.18))
  + `<path d="M${L0} 98Q-100 82 0 92Q40 80 80 90Q130 76 180 88Q220 80 ${L0 + LW} 92L${L0 + LW} ${FLOOR}L${L0} ${FLOOR}Z" fill="${tint(hue, 0.22)}"/>`
  + floor(hue, shade(hue, 0.16), tint(hue, 0.14))
  + `<path d="M40 150Q56 136 44 126Q36 120 50 116L62 116Q50 121 58 127Q70 138 58 150Z" fill="${tint(hue, 0.14)}"/>`;

/** REFERENCE: an office — a big window of three panes on a city skyline, a sill. */
const officeWindow: Setting = (hue) => {
  const towers: [number, number, number][] = [
    [-30, 22, 50], [-6, 16, 34], [14, 18, 46], [34, 14, 64], [50, 22, 38], [74, 16, 70], [92, 20, 52],
    [114, 14, 60], [130, 24, 44], [156, 16, 58], [174, 18, 36], [194, 20, 54], [216, 16, 40],
  ];
  let city = '';
  for (const [x, w, h] of towers) {
    city += `<rect x="${x}" y="${100 - h}" width="${w}" height="${h}" fill="${tint(hue, 0.13)}"/>`;
    for (let wy = 100 - h + 6; wy < 94; wy += 9) city += `<rect x="${x + 4}" y="${wy}" width="${w - 8}" height="2.4" fill="${tint(hue, 0.24)}"/>`;
  }
  return band(-300, 600, hue)
    + `<rect x="-60" y="8" width="320" height="94" fill="${tint(hue, 0.32)}"/>`
    + city
    + `<rect x="-60" y="8" width="320" height="94" fill="none" stroke="${shade(hue, 0.25)}" stroke-width="6"/>`
    + `<rect x="68" y="8" width="5" height="94" fill="${shade(hue, 0.25)}"/><rect x="128" y="8" width="5" height="94" fill="${shade(hue, 0.25)}"/>`
    + band(100, 6, tint(hue, 0.1))
    + floor(hue);
};

/** REFERENCE: a street market — a row of stalls under striped awnings with scalloped
 *  edges, dark stall mouths, posts, a counter; cobbles underfoot. */
const market: Setting = (hue) => {
  let stalls = '';
  for (let i = -8; i <= 12; i++) {
    const x = -22 + i * 44;
    for (let s = 0; s < 4; s++) stalls += `<rect x="${x + s * 11}" y="6" width="11" height="22" fill="${s % 2 ? tint(hue, 0.08) : tint(hue, 0.32)}"/>`;
    for (let s = 0; s < 4; s++) stalls += `<circle cx="${x + s * 11 + 5.5}" cy="28" r="5.5" fill="${s % 2 ? tint(hue, 0.08) : tint(hue, 0.32)}"/>`;
    stalls += `<rect x="${x + 2}" y="34" width="40" height="52" fill="${shade(hue, 0.1)}"/>`;
    stalls += `<rect x="${x - 1.5}" y="28" width="3" height="${FLOOR - 28}" fill="${shade(hue, 0.28)}"/>`;
  }
  let cobbles = '';
  for (let y = 124; y < 150; y += 9) cobbles += band(y, 1.2, shade(hue, 0.3), ' opacity="0.6"');
  return band(-300, 600, hue) + stalls + band(86, 12, tint(hue, 0.14)) + band(98, 18, shade(hue, 0.06)) + floor(hue) + cobbles;
};

/** REFERENCE: a teaching laboratory — a tiled wall, shelves of stoppered bottles, a
 *  bench whose top is the floor the glassware stands on. */
const lab: Setting = (hue) => {
  let tiles = '';
  for (let x = -304; x <= 500; x += 16) tiles += `<rect x="${x}" y="-300" width="1.2" height="${300 + FLOOR}" fill="${tint(hue, 0.08)}"/>`;
  for (let y = 4; y < FLOOR; y += 16) tiles += band(y, 1.2, tint(hue, 0.08));
  const B = tint(hue, 0.26);
  const bottles = (x0: number, y: number) =>
    `<rect x="${x0}" y="${y - 20}" width="10" height="20" rx="2" fill="${B}"/><rect x="${x0 + 3}" y="${y - 25}" width="4" height="6" fill="${B}"/>`
    + `<circle cx="${x0 + 22}" cy="${y - 8}" r="8" fill="${B}"/><rect x="${x0 + 20}" y="${y - 22}" width="4" height="8" fill="${B}"/>`
    + `<rect x="${x0 + 34}" y="${y - 26}" width="8" height="26" rx="2" fill="${B}"/>`;
  return band(-300, 600, hue) + tiles
    + `<rect x="-40" y="40" width="96" height="4" fill="${shade(hue, 0.22)}"/>` + bottles(-2, 40) + bottles(-60, 40)
    + `<rect x="150" y="32" width="120" height="4" fill="${shade(hue, 0.22)}"/>` + bottles(156, 32)
    + band(FLOOR - 4, 10, tint(hue, 0.18)) + band(FLOOR + 6, 400, shade(hue, 0.24));
};

/** REFERENCE: the Giza plateau — low dunes, pyramids with one lit face and one in
 *  shade, sand underfoot with wind ripples. */
const desert: Setting = (hue) => {
  const pyramid = (x0: number, x1: number, apex: number, base: number) => {
    const cx = (x0 + x1) / 2;
    return `<path d="M${x0} ${base}L${cx} ${apex}L${cx + (x1 - x0) * 0.08} ${base}Z" fill="${tint(hue, 0.34)}"/>`
      + `<path d="M${cx} ${apex}L${x1} ${base}L${cx + (x1 - x0) * 0.08} ${base}Z" fill="${tint(hue, 0.14)}"/>`;
  };
  let ripples = '';
  for (let y = 124; y < 150; y += 8) ripples += `<path d="M${L0} ${y}Q-100 ${y - 3} 0 ${y}Q60 ${y + 3} 120 ${y}Q180 ${y - 3} 240 ${y}L${L0 + LW} ${y}" fill="none" stroke="${tint(hue, 0.05)}" stroke-width="1.4"/>`;
  return band(-300, 600, hue)
    + pyramid(140, 204, 56, 100) + pyramid(12, 52, 76, 100) + pyramid(-80, -20, 64, 100)
    + `<path d="M${L0} 104Q-120 90 20 100Q90 88 170 98Q260 90 ${L0 + LW} 100L${L0 + LW} ${FLOOR}L${L0} ${FLOOR}Z" fill="${tint(hue, 0.2)}"/>`
    + floor(hue, shade(hue, 0.14), tint(hue, 0.16)) + ripples;
};

/** REFERENCE: a night sky — the Milky Way as a pale diagonal band, stars as points of
 *  several sizes (not sparkles), and the curve of a planet's horizon at the foot. */
const space: Setting = (hue) => {
  const r = seq(11);
  let stars = '';
  for (let i = 0; i < 60; i++) {
    const x = -120 + r() * 440;
    const y = -120 + r() * 250;
    stars += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(0.6 + r() * 1.1).toFixed(2)}" fill="${tint(hue, 0.6)}" opacity="${(0.5 + r() * 0.5).toFixed(2)}"/>`;
  }
  return band(-300, 600, shade(hue, 0.25))
    + `<path d="M${L0} 70L${L0 + LW} -110L${L0 + LW} -50L${L0} 130Z" fill="${shade(hue, 0.12)}"/>`
    + `<path d="M${L0} 88L${L0 + LW} -92L${L0 + LW} -72L${L0} 108Z" fill="${hue}"/>`
    + stars
    + `<circle cx="100" cy="400" r="270" fill="${tint(hue, 0.08)}"/>`
    + `<ellipse cx="44" cy="140" rx="10" ry="3" fill="${shade(hue, 0.05)}"/><ellipse cx="150" cy="143" rx="14" ry="3.5" fill="${shade(hue, 0.05)}"/>`;
};

/** REFERENCE: a library — shelf boards across the wall, spines of every height and
 *  colour standing between them, the odd one leaning. */
const library: Setting = (hue) => {
  const r = seq(7);
  const tones = [tint(hue, 0.1), tint(hue, 0.22), shade(hue, 0.1), tint(hue, 0.3), tint(hue, 0.16), hue];
  const boards = [20, 58, 96];
  let out = band(-300, 600, shade(hue, 0.14));
  for (let row = 0; row < boards.length; row++) {
    const top = row === 0 ? -20 : boards[row - 1] + 4;
    const bottom = boards[row];
    let x = -120;
    let n = 0;
    while (x < 320) {
      const w = 5 + Math.floor(r() * 5);
      const h = (bottom - top) * (0.62 + r() * 0.34);
      const fill = row === 1 && n === 17 ? EMBER : tones[Math.floor(r() * tones.length)];
      out += `<rect x="${x}" y="${(bottom - h).toFixed(1)}" width="${w}" height="${h.toFixed(1)}" fill="${fill}"/>`;
      x += w + 0.8;
      n++;
    }
    out += `<rect x="${L0}" y="${bottom}" width="${LW}" height="4" fill="${shade(hue, 0.3)}"/>`;
  }
  return out + floor(hue);
};

/** REFERENCE: a drafting sheet — a fine grid with a heavier grid every five, and a
 *  geometric construction drawn on it: a triangle, its altitude, a compass arc. */
const blueprint: Setting = (hue) => {
  let grid = '';
  for (let x = -300; x <= 500; x += 10) grid += `<rect x="${x}" y="-300" width="${x % 50 === 0 ? 1.4 : 0.7}" height="${300 + FLOOR}" fill="${tint(hue, x % 50 === 0 ? 0.12 : 0.07)}"/>`;
  for (let y = -300; y < FLOOR; y += 10) grid += band(y, (y % 50 === 0 ? 1.4 : 0.7), tint(hue, y % 50 === 0 ? 0.12 : 0.07));
  const pen = `fill="none" stroke="${tint(hue, 0.28)}" stroke-width="1.8" stroke-linecap="round"`;
  return band(-300, 600, hue) + grid
    + `<path d="M8 96L40 22L72 96Z" ${pen}/><path d="M40 22L40 96" ${pen} stroke-dasharray="3 4"/>`
    + `<path d="M40 88L48 88L48 96" ${pen}/>`
    + `<path d="M150 20A40 40 0 0 1 188 60" ${pen}/><path d="M150 20L188 60M150 20L150 70" ${pen}/>`
    + floor(hue);
};

/** REFERENCE: a courtroom — the wall panelled in raised wood panels above a rail,
 *  heavy drapes at each side, carpet underfoot. */
const court: Setting = (hue) => {
  let panels = '';
  for (let x = -320; x <= 500; x += 40) {
    panels += `<rect x="${x + 4}" y="14" width="32" height="84" fill="${tint(hue, 0.07)}"/>`;
    panels += `<rect x="${x + 9}" y="19" width="22" height="74" fill="none" stroke="${shade(hue, 0.1)}" stroke-width="1.6"/>`;
  }
  const drape = (x: number, dir: 1 | -1) => {
    let folds = '';
    for (let i = 0; i < 4; i++) folds += `<rect x="${x + dir * (4 + i * 9) - (dir < 0 ? 3 : 0)}" y="-300" width="3" height="${300 + FLOOR}" fill="${shade(hue, 0.28)}"/>`;
    return `<rect x="${dir > 0 ? x : x - 40}" y="-300" width="40" height="${300 + FLOOR}" fill="${shade(hue, 0.18)}"/>` + folds;
  };
  return band(-300, 600, hue) + panels + band(98, 8, shade(hue, 0.12))
    + drape(-18, 1) + drape(218, -1)
    + floor(hue, shade(hue, 0.3), shade(hue, 0.16));
};

/** REFERENCE: a gallery wall — framed pictures hung at eye level, a picture light over
 *  each, a skirting board and a planked floor. */
const gallery: Setting = (hue) => {
  const frame = (x: number, y: number, w: number, h: number, art: string) =>
    `<rect x="${x}" y="${y - 7}" width="${w * 0.5}" height="3" rx="1.5" transform="translate(${w * 0.25} 0)" fill="${shade(hue, 0.3)}"/>`
    + `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${shade(hue, 0.22)}"/>`
    + `<rect x="${x + 3}" y="${y + 3}" width="${w - 6}" height="${h - 6}" fill="${tint(hue, 0.5)}"/>`
    // A group scaled from a 100-box, not a nested <svg>: react-native-svg's parser
    // is not a browser, and a transform is the one construct both draw alike.
    + `<g transform="translate(${x + 7} ${y + 7}) scale(${((w - 14) / 100).toFixed(3)} ${((h - 14) / 100).toFixed(3)})">${art}</g>`;
  const landscape = `<rect width="100" height="100" fill="${tint(hue, 0.25)}"/><path d="M0 70Q30 40 55 62Q75 48 100 60L100 100L0 100Z" fill="${shade(hue, 0.05)}"/><path d="M0 84Q50 70 100 84L100 100L0 100Z" fill="${tint(hue, 0.12)}"/>`;
  const figure = `<rect width="100" height="100" fill="${tint(hue, 0.18)}"/><path d="M50 18Q64 18 64 34Q64 48 50 48Q36 48 36 34Q36 18 50 18Z" fill="${shade(hue, 0.08)}"/><path d="M22 100Q24 58 50 56Q76 58 78 100Z" fill="${shade(hue, 0.08)}"/>`;
  let planks = '';
  for (let y = 124; y < 150; y += 7) planks += band(y, 1.2, shade(hue, 0.3), ' opacity="0.55"');
  return band(-300, 600, hue)
    + frame(8, 24, 48, 38, landscape) + frame(152, 18, 40, 54, figure) + frame(-70, 30, 44, 34, landscape)
    + band(108, 8, tint(hue, 0.08)) + floor(hue, shade(hue, 0.18)) + planks;
};

/** REFERENCE: a capitol square — a domed hall across the back (a colonnaded front under
 *  a pediment, a drum, a dome, a lantern), low wings each side, paving underfoot. */
const capitol: Setting = (hue) => {
  const B = tint(hue, 0.16);
  const C = tint(hue, 0.26);
  let cols = '';
  for (let x = 42; x <= 156; x += 9) cols += `<rect x="${x}" y="84" width="3.4" height="26" fill="${C}"/>`;
  let paving = '';
  for (let x = -300; x <= 500; x += 24) paving += `<path d="M${x} ${FLOOR}L${100 + (x - 100) * 1.6} 150" stroke="${shade(hue, 0.3)}" stroke-width="1.1" opacity="0.5"/>`;
  return band(-300, 600, hue)
    + `<rect x="-10" y="92" width="50" height="24" fill="${B}"/><rect x="160" y="92" width="50" height="24" fill="${B}"/>`
    + `<rect x="34" y="78" width="132" height="38" fill="${B}"/>` + cols
    + `<path d="M76 78L100 64L124 78Z" fill="${C}"/>`
    + `<rect x="80" y="48" width="40" height="16" fill="${B}"/>`
    + `<path d="M78 50Q78 22 100 20Q122 22 122 50Z" fill="${C}"/>`
    + `<rect x="96" y="10" width="8" height="12" fill="${B}"/><rect x="99" y="2" width="2" height="8" fill="${B}"/>`
    + floor(hue) + paving;
};

// ─────────────────────────────────────────────────────────────────────────────
// THE OBJECTS — paper, one ink outline, shaded plane in the hue's mid tone.
// ─────────────────────────────────────────────────────────────────────────────

type Draw = (hue: string) => { back: string; body: string };

const DRAW: Record<PosterKey, Draw> = {
  // REFERENCE: a classical marble bust — a turned socle, a truncated chest wider than
  // the head, a short neck, a head of curls — beside an Ionic column (volutes each side
  // of the capital, a fluted shaft, a plinth). A red-bound book lies on the floor.
  philosophy: (hue) => {
    const M = mid(hue);
    return { back: alcove(hue), body: `
      ${pill(146, 118, 44, hue)}
      <rect x="126" y="112" width="40" height="8" rx="2" fill="${LIT}" ${S}/>
      <rect x="131" y="46" width="30" height="66" fill="${LIT}" ${S}/>
      <path d="M146 48L146 110" stroke="${M}" stroke-width="4"/>
      <path d="M138 48L138 110M154 48L154 110" stroke="${M}" stroke-width="2.5"/>
      <rect x="124" y="36" width="44" height="10" rx="3" fill="${LIT}" ${S}/>
      <circle cx="126" cy="42" r="7" fill="${LIT}" ${S}/><circle cx="126" cy="42" r="2.5" fill="${INK}"/>
      <circle cx="166" cy="42" r="7" fill="${LIT}" ${S}/><circle cx="166" cy="42" r="2.5" fill="${INK}"/>
      <rect x="122" y="28" width="48" height="8" rx="2" fill="${LIT}" ${S}/>
      ${pill(84, 120, 58, hue)}
      <rect x="64" y="112" width="40" height="9" rx="3" fill="${LIT}" ${S}/>
      <path d="M74 112L76 102L92 102L94 112Z" fill="${M}" ${S}/>
      <rect x="66" y="96" width="36" height="7" rx="3" fill="${LIT}" ${S}/>
      <path d="M52 96Q50 74 70 70L98 70Q118 74 116 96Z" fill="${LIT}"/>
      <path d="M98 70Q118 74 116 96L100 96Q104 80 96 71Z" fill="${M}"/>
      <path d="M52 96Q50 74 70 70L98 70Q118 74 116 96Z" fill="none" ${S}/>
      <path d="M77 58L77 72L91 72L91 58Z" fill="${M}" ${S}/>
      <path d="M68 44Q68 22 86 22Q104 22 104 42Q104 48 108 54L102 56Q103 62 98 64Q92 67 86 64Q70 62 68 44Z" fill="${LIT}" ${S}/>
      <path d="M67 42Q64 22 84 18Q100 16 104 30Q98 26 92 30Q86 26 80 32Q76 30 74 38Q70 38 67 42Z" fill="${M}" ${S}/>
      <path d="M92 44Q95 42 98 44" stroke="${INK}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      <path d="M58 88Q70 80 80 86M86 84Q98 80 110 88" stroke="${M}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      ${pill(38, 128, 34, hue)}
      <rect x="22" y="118" width="32" height="9" rx="1.5" fill="${EMBER}" ${S} stroke-width="2.4"/>
      <path d="M26 122.5L50 122.5" stroke="${LIT}" stroke-width="2"/>` };
  },

  // REFERENCE: the "head with gears" icon (a bald profile bust, the skull a near
  // circle with the brain window in its upper half) checked against real profile
  // silhouettes. What makes a profile read as a HEAD rather than a blob: the eye line
  // sits halfway between crown and chin; the skull bulges BEHIND the neck (occiput);
  // the face is a stack of small, distinct events — brow, nose, lips, chin — under a
  // forehead that leans back; and the neck is set behind the jaw. Crown to chin is
  // about the same as occiput to nose tip, and the shoulders give the bust a base so
  // it does not stand up like a column.
  psychology: (hue) => {
    const M = mid(hue);
    const head = 'M48 118C50 108 60 103 71 100C75 98 77 94 76 89'
      + 'C63 82 56 69 57 55C58 33 74 20 93 20C110 20 121 30 122 43'
      + 'C122 48 121 51 123 55C123 57 121 58 121 60L129 70'
      + 'C129 72 126 73 123 73C124 75 125 76 124 78C123 79 122 79 122 80'
      + 'C124 81 124 83 122 84C121 85 120 85 120 86C122 88 122 91 119 93'
      + 'C115 95 108 95 104 94C103 97 103 100 105 103C113 106 128 108 132 118Z';
    return { back: inkblotRoom(hue), body: `
      ${pill(90, 120, 88, hue)}
      <path d="${head}" fill="${LIT}"/>
      <path d="M76 89C86 93 96 94 104 94C103 97 103 100 105 103C95 103 84 99 76 92Z" fill="${M}"/>
      <path d="${head}" fill="none" ${S}/>
      <path d="M65 49C63 36 76 29 89 29C104 29 114 37 113 49C113 61 102 66 89 66C76 66 66 61 65 49Z" fill="${recess(hue)}" ${S}/>
      ${gear(81, 47, 9, 8, M, hue)}${gear(99, 52, 8, 6, EMBER, hue, 15, { tooth: 0.5, w: 2.4, ring: false })}
      <circle cx="156" cy="40" r="16" fill="${LIT}" ${S}/>
      <circle cx="138" cy="58" r="4.5" fill="${LIT}" ${S} stroke-width="2.4"/>
      <path d="M151 35Q151 29 157 29Q163 29 163 35Q163 39 157 41L157 45" fill="none" stroke="${INK}" stroke-width="3.2" stroke-linecap="round"/>
      <circle cx="157" cy="51" r="2.2" fill="${INK}"/>` };
  },


  // REFERENCE: a summit with a snow cap and a flag planted at the top, a second lower
  // peak behind, and a dotted trail climbing the lit face.
  'personal-growth': (hue) => {
    const M = mid(hue);
    return { back: hills(hue), body: `
      <path d="M118 116L150 70L184 116Z" fill="${tint(hue, 0.34)}" ${S}/>
      ${pill(100, 118, 130, hue)}
      <path d="M34 116L96 40L160 116Z" fill="${LIT}"/>
      <path d="M96 40L160 116L112 116Z" fill="${M}"/>
      <path d="M34 116L96 40L160 116Z" fill="none" ${S}/>
      <path d="M80 60L96 40L112 60L104 56L96 64L88 56Z" fill="${PAPER_LIT}" ${S} stroke-width="2.4"/>
      <path d="M60 116Q70 100 84 96Q98 92 96 80" fill="none" stroke="${shade(hue, 0.15)}" stroke-width="3" stroke-dasharray="1 7" stroke-linecap="round"/>
      <path d="M96 40L96 14" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
      <path d="M97 15L118 21L97 27Z" fill="${EMBER}" ${S} stroke-width="2.4"/>` };
  },

  // REFERENCE: a briefcase — a body about 1.4 times as wide as it is tall, rounded
  // corners, a flap across its upper third, a clasp on the seam, an arched handle —
  // before a bar chart rising right.
  business: (hue) => {
    const M = mid(hue);
    const bar = (x: number, h: number, w = 16) =>
      `<rect x="${x}" y="${108 - h}" width="${w}" height="${h}" fill="${LIT}"/><rect x="${x + w - 6}" y="${108 - h + 1.5}" width="4.5" height="${h - 3}" fill="${M}"/><rect x="${x}" y="${108 - h}" width="${w}" height="${h}" fill="none" ${S}/>`;
    return { back: officeWindow(hue), body: `
      ${pill(150, 110, 70, hue)}
      <rect x="112" y="106" width="80" height="6" rx="2" fill="${recess(hue)}" ${S}/>
      ${bar(128, 26)}${bar(150, 40)}${bar(172, 54)}
      <path d="M122 70L144 56L158 60L176 40" fill="none" stroke="${INK}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M166 36L181 34L180 49Z" fill="${INK}" ${S} stroke-width="2"/>
      ${pill(78, 124, 76, hue)}
      <path d="M66 70Q66 58 74 58L84 58Q92 58 92 70" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>
      <path d="M66 70Q66 58 74 58L84 58Q92 58 92 70" fill="none" stroke="${M}" stroke-width="2.6" stroke-linecap="round"/>
      <rect x="44" y="70" width="70" height="50" rx="7" fill="${LIT}" ${S}/>
      <rect x="44" y="70" width="70" height="18" rx="7" fill="${M}" ${S}/>
      <rect x="72" y="81" width="14" height="12" rx="2.5" fill="${EMBER}" ${S} stroke-width="2.4"/>
      <path d="M50 110L108 110" stroke="${M}" stroke-width="2.5"/>` };
  },

  // REFERENCE: the supply-and-demand diagram every economics text opens with — two
  // lines crossing on a pair of axes — on a board on legs; and stacks of coins, each
  // coin an elliptical top over a band of edge.
  economics: (hue) => {
    const M = mid(hue);
    const stack = coinStack(66, 114, 7, hue, 16);
    const small = coinStack(32, 118, 3, hue, 13);
    return { back: market(hue), body: `
      ${pill(140, 118, 72, hue)}
      <path d="M112 100L110 118M168 100L170 118" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
      <path d="M112 100L110 118M168 100L170 118" stroke="${M}" stroke-width="1.6" stroke-linecap="round"/>
      <rect x="98" y="38" width="84" height="62" rx="5" fill="${LIT}" ${S}/>
      <path d="M110 46L110 90L172 90" fill="none" stroke="${M}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M116 50Q138 70 168 84" fill="none" stroke="${INK}" stroke-width="3.2" stroke-linecap="round"/>
      <path d="M116 86Q140 68 166 48" fill="none" stroke="${shade(hue, 0.05)}" stroke-width="3.2" stroke-linecap="round"/>
      <circle cx="140.5" cy="68.5" r="4.5" fill="${EMBER}" ${S} stroke-width="2.2"/>
      ${pill(52, 122, 80, hue)}
      ${small}${stack}` };
  },

  // REFERENCE: an Erlenmeyer flask — a narrow neck with a lip, a conical body, a wide
  // flat base, liquid in the lower part with bubbles — and a rack of test tubes.
  science: (hue) => {
    const M = mid(hue);
    const tube = (x: number, liquid: string, level: number) =>
      `<rect x="${x}" y="74" width="9" height="38" rx="4.5" fill="${LIT}"/>`
      + `<path d="M${x} ${level}L${x + 9} ${level}L${x + 9} 107.5A4.5 4.5 0 0 1 ${x} 107.5Z" fill="${liquid}"/>`
      + `<rect x="${x}" y="74" width="9" height="38" rx="4.5" fill="none" ${S} stroke-width="2.4"/>`;
    return { back: lab(hue), body: `
      ${pill(160, 118, 50, hue)}
      <rect x="138" y="88" width="46" height="5" rx="1.5" fill="${M}" ${S} stroke-width="2.4"/>
      ${tube(144, EMBER, 92)}${tube(157, tint(hue, 0.4), 86)}${tube(170, M, 98)}
      <rect x="136" y="108" width="50" height="8" rx="2" fill="${LIT}" ${S}/>
      ${pill(98, 120, 76, hue)}
      <path d="M86 32L86 62L58 116Q56 122 64 122L132 122Q140 122 138 116L110 62L110 32Z" fill="${LIT}"/>
      <path d="M71 92L125 92L138 116Q140 122 132 122L64 122Q56 122 58 116Z" fill="${tint(hue, 0.42)}"/>
      <path d="M110 62L138 116Q140 122 132 122L120 122L100 64Z" fill="${M}" opacity="0.55"/>
      <path d="M86 32L86 62L58 116Q56 122 64 122L132 122Q140 122 138 116L110 62L110 32Z" fill="none" ${S}/>
      <rect x="80" y="26" width="36" height="8" rx="3" fill="${LIT}" ${S}/>
      <path d="M100 74L106 74M100 82L108 82" stroke="${M}" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="88" cy="104" r="4" fill="${LIT}" ${S} stroke-width="2"/>
      <circle cx="104" cy="110" r="3" fill="${LIT}" ${S} stroke-width="2"/>
      <circle cx="96" cy="18" r="4" fill="${LIT}" ${S} stroke-width="2"/>
      <circle cx="108" cy="10" r="2.6" fill="${LIT}" ${S} stroke-width="2"/>` };
  },

  // REFERENCE: a wooden hourglass — two round glass bulbs that fill the space between
  // the posts, pinched at the waist, between a top and a bottom disc; sand in both
  // halves. Beside it, a scroll on its rollers, sealed in red wax.
  history: (hue) => {
    const M = mid(hue);
    const glass = 'M84 42C84 60 96 68 103 74C96 80 84 88 84 106L128 106C128 88 116 80 109 74C116 68 128 60 128 42Z';
    return { back: desert(hue), body: `
      ${pill(106, 120, 78, hue)}
      <rect x="72" y="106" width="68" height="10" rx="3" fill="${M}" ${S}/>
      <rect x="72" y="32" width="68" height="10" rx="3" fill="${M}" ${S}/>
      <path d="${glass}" fill="${LIT}"/>
      <path d="M89 54L123 54C121 63 113 69 106 73C99 69 91 63 89 54Z" fill="${tint(hue, 0.4)}"/>
      <path d="M88 106Q96 90 106 88Q116 90 124 106Z" fill="${tint(hue, 0.4)}"/>
      <path d="M106 74L106 88" stroke="${tint(hue, 0.4)}" stroke-width="2"/>
      <path d="M118 48C120 56 116 62 112 66" fill="none" stroke="${PAPER_LIT}" stroke-width="2.6" stroke-linecap="round"/>
      <path d="${glass}" fill="none" ${S}/>
      <rect x="75" y="42" width="5" height="64" rx="2" fill="${M}" ${S} stroke-width="2.4"/>
      <rect x="132" y="42" width="5" height="64" rx="2" fill="${M}" ${S} stroke-width="2.4"/>
      ${pill(42, 126, 54, hue)}
      <rect x="24" y="106" width="38" height="16" rx="3" fill="${LIT}" ${S}/>
      <path d="M30 111L54 111M30 116L48 116" stroke="${M}" stroke-width="2.2" stroke-linecap="round"/>
      <rect x="17" y="102" width="9" height="24" rx="4.5" fill="${M}" ${S}/>
      <rect x="60" y="102" width="9" height="24" rx="4.5" fill="${M}" ${S}/>
      <circle cx="54" cy="120" r="5" fill="${EMBER}" ${S} stroke-width="2.2"/>` };
  },

  // ── THE SIX BRANCHES ──────────────────────────────────────────────────────

  // REFERENCE: a ringed planet — the ring passes BEHIND the sphere above and IN FRONT
  // below, which is what makes it read as a ring — with a small moon and, far off, a
  // small red world. Set in space: nothing stands, so nothing casts a pill.
  metaphysics: (hue) => {
    const M = mid(hue);
    // The ring: an ellipse rx 58 ry 13 about (100, 70), tilted -14°. Its ends are
    // (100 ∓ 56.3, 70 ± 14.0); the front half is the lower arc between them.
    const ringBack = `<ellipse cx="100" cy="70" rx="58" ry="13" transform="rotate(-14 100 70)" fill="none" stroke="${INK}" stroke-width="9"/><ellipse cx="100" cy="70" rx="58" ry="13" transform="rotate(-14 100 70)" fill="none" stroke="${M}" stroke-width="3.4"/>`;
    const front = 'M43.7 84 A58 13 -14 0 0 156.3 56';
    const ringFront = `<path d="${front}" fill="none" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><path d="${front}" fill="none" stroke="${LIT}" stroke-width="3.4" stroke-linecap="round"/>`;
    return { back: space(hue), body: `
      ${ringBack}
      <circle cx="100" cy="70" r="32" fill="${LIT}"/>
      <path d="M118 44Q136 70 116 98Q134 92 132 70Q132 52 118 44Z" fill="${M}"/>
      <path d="M72 58Q100 52 128 60M70 76Q100 70 130 78" fill="none" stroke="${M}" stroke-width="3" stroke-linecap="round"/>
      <circle cx="100" cy="70" r="32" fill="none" ${S}/>
      ${ringFront}
      <circle cx="44" cy="36" r="9" fill="${LIT}" ${S}/><circle cx="47" cy="34" r="2.5" fill="${M}"/>
      <circle cx="160" cy="112" r="5" fill="${EMBER}" ${S} stroke-width="2.2"/>` };
  },

  // REFERENCE: a magnifying glass — a thick rimmed lens on an angled handle — held over
  // an open book whose two pages rise from a gutter. A library behind.
  epistemology: (hue) => {
    const M = mid(hue);
    return { back: library(hue), body: `
      ${pill(98, 120, 116, hue)}
      <path d="M40 104L98 98L98 118L40 122Z" fill="${LIT}" ${S}/>
      <path d="M98 98L156 104L156 122L98 118Z" fill="${M}" ${S}/>
      <path d="M48 108L88 104M48 113L80 110M108 104L146 108M108 109L138 112" stroke="${shade(hue, 0.05)}" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
      <path d="M136 74L162 102" stroke="${INK}" stroke-width="13" stroke-linecap="round"/>
      <path d="M136 74L162 102" stroke="${shade(hue, 0.2)}" stroke-width="7" stroke-linecap="round"/>
      <circle cx="116" cy="54" r="30" fill="${tint(hue, 0.5)}" stroke="${INK}" stroke-width="12"/>
      <circle cx="116" cy="54" r="30" fill="none" stroke="${LIT}" stroke-width="5"/>
      <path d="M100 48L130 48M100 56L124 56M100 64L128 64" stroke="${INK}" stroke-width="2.6" stroke-linecap="round" opacity="0.55"/>
      <path d="M100 38Q106 32 114 32" fill="none" stroke="${PAPER_LIT}" stroke-width="3.5" stroke-linecap="round"/>` };
  },

  // REFERENCE: meshed gears of different sizes, the teeth of one sitting in the gaps of
  // the other; a drafting sheet behind.
  logic: (hue) => {
    const M = mid(hue);
    return { back: blueprint(hue), body: `
      ${pill(100, 120, 110, hue)}
      ${gear(136, 48, 17, 9, M, hue, 10)}
      ${gear(84, 78, 28, 12, LIT, hue)}
      ${gear(150, 98, 11, 7, EMBER, hue, 8)}` };
  },

  // REFERENCE: a balance — a stepped base, a central post with a finial, a beam, and a
  // pan hung from each end on converging cords. A heart weighed against a coin.
  ethics: (hue) => {
    const M = mid(hue);
    return { back: court(hue), body: `
      ${pill(100, 120, 60, hue)}
      <path d="M78 120L84 108L116 108L122 120Z" fill="${M}" ${S}/>
      <rect x="95" y="38" width="10" height="72" fill="${LIT}" ${S}/>
      <circle cx="100" cy="33" r="7" fill="${LIT}" ${S} stroke-width="2.4"/>
      <path d="M52 44L148 44" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
      <path d="M52 44L148 44" stroke="${LIT}" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M52 44L36 84M52 44L68 84M148 44L132 84M148 44L164 84" stroke="${INK}" stroke-width="2" fill="none"/>
      <path d="M42 76Q42 68 50 70Q52 72 52 74Q52 72 54 70Q62 68 62 76Q62 82 52 88Q42 82 42 76Z" fill="${EMBER}" ${S} stroke-width="2.4"/>
      <path d="M30 84L74 84Q72 98 52 98Q32 98 30 84Z" fill="${LIT}" ${S}/>
      ${coin(148, 76, hue, 12)}
      <path d="M126 84L170 84Q168 98 148 98Q128 98 126 84Z" fill="${LIT}" ${S}/>` };
  },

  // REFERENCE: a studio easel — two raked front legs, a back leg, a ledge — holding a
  // canvas with a landscape on it; a kidney-shaped palette with a thumb hole. A gallery.
  aesthetics: (hue) => {
    const M = mid(hue);
    return { back: gallery(hue), body: `
      ${pill(112, 120, 80, hue)}
      <path d="M112 30L112 118" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>
      <path d="M112 30L112 118" stroke="${M}" stroke-width="2" stroke-linecap="round"/>
      <path d="M104 30L84 120M120 30L140 120" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>
      <path d="M104 30L84 120M120 30L140 120" stroke="${LIT}" stroke-width="2" stroke-linecap="round"/>
      <rect x="78" y="22" width="68" height="54" rx="2" fill="${LIT}" ${S}/>
      <circle cx="126" cy="38" r="7" fill="${EMBER}"/>
      <path d="M81 66Q96 48 110 60Q122 50 143 64L143 73L81 73Z" fill="${M}"/>
      <path d="M81 70Q104 60 143 70L143 73L81 73Z" fill="${tint(hue, 0.3)}"/>
      <rect x="78" y="22" width="68" height="54" rx="2" fill="none" ${S}/>
      <rect x="84" y="76" width="56" height="7" rx="2" fill="${M}" ${S}/>
      ${pill(48, 122, 60, hue)}
      <path d="M22 108Q22 94 44 94Q70 94 72 106Q72 116 58 116Q50 116 48 120Q44 124 34 122Q22 120 22 108Z" fill="${LIT}" ${S}/>
      <circle cx="36" cy="104" r="3.5" fill="${EMBER}" ${S} stroke-width="1.8"/>
      <circle cx="48" cy="100" r="3.5" fill="${tint(hue, 0.3)}" ${S} stroke-width="1.8"/>
      <circle cx="60" cy="104" r="3.5" fill="${shade(hue, 0.25)}" ${S} stroke-width="1.8"/>
      <circle cx="56" cy="110" r="3" fill="${hue}" ${S} stroke-width="1.8"/>` };
  },

  // REFERENCE: a ballot box — a box with a slot in its lid, a card going in — and a
  // flag on a pole beside it; a domed capitol across the square behind.
  'political-philosophy': (hue) => {
    const M = mid(hue);
    return { back: capitol(hue), body: `
      ${pill(100, 120, 90, hue)}
      <path d="M144 118L144 30" stroke="${INK}" stroke-width="3.4" stroke-linecap="round"/>
      <path d="M145 31Q158 26 170 32Q180 38 177 50Q166 44 156 48Q150 50 145 50Z" fill="${EMBER}" ${S} stroke-width="2.4"/>
      <rect x="72" y="40" width="30" height="36" rx="2" fill="${PAPER_LIT}" ${S} transform="rotate(-8 87 58)"/>
      <path d="M79 52L94 50M80 58L92 56" stroke="${M}" stroke-width="2.2" stroke-linecap="round" transform="rotate(-8 87 58)"/>
      <path d="M58 70L78 58L140 58L120 70Z" fill="${M}" ${S}/>
      <rect x="74" y="61.5" width="40" height="4" rx="2" fill="${INK}"/>
      <rect x="58" y="70" width="62" height="48" fill="${LIT}" ${S}/>
      <path d="M120 70L140 58L140 106L120 118Z" fill="${M}" ${S}/>
      <path d="M89 84L92 91L99 91L93 95L96 102L89 98L82 102L85 95L79 91L86 91Z" fill="${hue}" ${S} stroke-width="1.8"/>` };
  },
};

export const POSTER_KEYS = Object.keys(DRAW) as PosterKey[];

/**
 * The viewBox for a box of w×h: the 200×150 frame, grown to the box's aspect —
 * sideways about the centre when the box is wider; when it is taller, the empty sides
 * are trimmed to CORE and then it grows upward from the floor — so no object is cut
 * and nothing is stretched.
 */
export function posterViewBox(w: number, h: number): [number, number, number, number] {
  const aspect = w / h;
  const frame = FRAME.w / FRAME.h;
  if (aspect >= frame) {
    const vw = FRAME.h * aspect;
    return [(FRAME.w - vw) / 2, 0, vw, FRAME.h];
  }
  // Taller than the frame: trim the empty sides down to CORE first, and only then grow
  // upward from the floor.
  const vw = Math.max(CORE.x1 - CORE.x0, Math.min(FRAME.w, FRAME.h * aspect));
  const vh = vw / aspect;
  return [(FRAME.w - vw) / 2, FRAME.h - vh, vw, vh];
}

/**
 * The poster as an SVG document for a box of w×h. The seven SUBJECTS are drawn in the
 * colours of the things in them (subjectScenes.ts, 2026-09-30); the six retired
 * philosophy branches keep their drawings in their hue.
 */
export function posterXml(key: PosterKey, hue: string, w: number, h: number): string {
  const [x, y, vw, vh] = posterViewBox(w, h);
  const r = (n: number) => Math.round(n * 100) / 100;
  const scene = (SCENES as Record<string, (() => string) | undefined>)[key];
  const inner = scene ? scene() : (() => { const d = DRAW[key](hue); return d.back + d.body; })();
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${r(x)} ${r(y)} ${r(vw)} ${r(vh)}" width="${w}" height="${h}">${inner}</svg>`;
}

/** The colour behind a poster before it draws: a subject's scene ground, or the hue. */
export function posterGround(key: PosterKey, hue: string): string {
  return (SCENE_GROUND as Record<string, string | undefined>)[key] ?? hue;
}

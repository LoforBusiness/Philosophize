// ─────────────────────────────────────────────────────────────────────────────
// THE QUICK START PICTURES — three scenes for every subject (2026-09-29).
//
// The card was five engraved photographs, black and white, that said nothing about
// the lesson under them: a mountain for an economics lesson, a library for logic.
// Once Home became a doodle wallpaper and a shelf of drawn subject posters, the
// photograph was the one thing on the screen from the old app. The owner asked for
// pictures that point at WHERE THE CARD GOES — economics things for an economics
// lesson — on a rotation, "very clean, professional, not AI looking", after
// Imprint. Imprint's own lesson art (its Allegory of the Cave frame) and Nibble's
// tiles were read before a line was drawn, three directions were mocked in the real
// card, and the owner picked the Imprint editorial one.
//
// ── THE STYLE, WHICH IS WHAT MAKES 21 PICTURES ONE SET ──────────────────────
//
//   · FLAT FILLS, NO OUTLINES. An object's form is two tones: its body and its
//     shaded side, and the light is always from the top left.
//   · A SMALL PALETTE PER SCENE — a sky, one or two distance tones, the objects,
//     one warm spark — in the spirit of Imprint's (cream, terracotta, mustard,
//     charcoal, a dusty blue). The owner allowed colours outside the app palette
//     here, and each subject leans on its own hue family so a reader can tell an
//     economics morning from a philosophy one.
//   · DEPTH BY LAYERS: far hills, near hills, then the ground, each a flat shape.
//   · EVERY SCENE STANDS ON A HORIZON, and below it is a DARK GROUND. That ground is
//     where the card's title and button sit, so the words never need a scrim and
//     never land on an object.
//
// ── THE GEOMETRY THE CARD HOLDS IT TO ───────────────────────────────────────
//
// A scene is a 1080 × 1080 canvas with its horizon at y = HORIZON. The card lays
// the picture at its own width and slides it so the horizon lands just above the
// title (QuickStartCard), so what a phone shows depends on the card's height:
//
//   · on the shortest card (272 × 320) only about y 380…760 of the canvas is above
//     the title, so EVERY OBJECT THAT MATTERS STANDS IN THAT BAND;
//   · the "QUICK START" tab covers the top-left there, so nothing that matters goes
//     in x < 500, y < 480 (TAB_ZONE);
//   · a taller card shows more of the canvas above y 380, which is only ever sky —
//     a sun, a cloud, a star — and loses nothing if it is cropped.
//
// ZERO IMPORTS, like rig.ts and tone.ts: `npm run make:quickstart` loads this file
// in plain Node, draws every scene in headless Chrome and writes the PNGs the card
// shows, and `npm run check:quickstart` measures the ground under the words.
// ─────────────────────────────────────────────────────────────────────────────

/** The canvas is square; the card draws it at the card's own width. */
export const QS_CANVAS = 1080;
/** Where every scene's ground begins. */
export const HORIZON = 760;
/** Nothing that matters may stand above this on the shortest card. */
export const SAFE_TOP = 380;
/** The corner the tab covers on the shortest card: nothing important in here. */
export const TAB_ZONE = { x: 500, y: 480 };
/**
 * The side margins a taller card may crop. A card with room to spare scales the
 * picture UP to fill its height rather than to its width, so objects read larger on
 * an ordinary phone — and that crops the sides, never past these, so every object
 * that matters stands between x = SIDE and x = 1080 − SIDE.
 */
export const SIDE = 100;

/**
 * How the card lays a scene: its scale and its offset, for a card W × H whose
 * words start `body` dp above the bottom. The horizon lands `gap` dp above the
 * title; the band SAFE_TOP…HORIZON fills the height above it, but never at a scale
 * that would crop more than SIDE off either edge, and never smaller than the width.
 */
export function qsLayout(W: number, H: number, body: number, gap = 16, top = 14) {
  const horizonAt = H - body - gap;
  const byHeight = (horizonAt - top) / (HORIZON - SAFE_TOP);
  const byWidth = W / QS_CANVAS;
  const maxCrop = W / (QS_CANVAS - 2 * SIDE);
  const s = Math.max(byWidth, Math.min(byHeight, maxCrop));
  return { s, left: (W - QS_CANVAS * s) / 2, top: horizonAt - HORIZON * s };
}

export type QsSubject =
  | 'philosophy' | 'psychology' | 'personal-growth' | 'business'
  | 'economics' | 'science' | 'history';

export interface QsScene {
  /** Stable id: `<subject>-<n>`. It is the PNG's file name. */
  id: string;
  subject: QsSubject;
  /** What it shows, for the sheet and for anyone choosing between them. */
  name: string;
  /** Fills the card above the picture on a card tall enough to show past its top. */
  sky: string;
  /** The ground's colour: the card's own face below the picture, under the words. */
  ground: string;
  /** The picture, as the inside of a 1080 × 1080 <svg>. */
  svg: string;
}

// ── THE KIT ─────────────────────────────────────────────────────────────────

const f = (n: number) => Math.round(n * 10) / 10;
const rect = (x: number, y: number, w: number, h: number, fill: string, rx = 0) =>
  `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}"${rx ? ` rx="${f(rx)}"` : ''} fill="${fill}"/>`;
const circle = (x: number, y: number, r: number, fill: string, op = 1) =>
  `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${fill}"${op < 1 ? ` opacity="${op}"` : ''}/>`;
const ellipse = (x: number, y: number, rx: number, ry: number, fill: string, op = 1) =>
  `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(ry)}" fill="${fill}"${op < 1 ? ` opacity="${op}"` : ''}/>`;
const path = (d: string, fill: string, op = 1) => `<path d="${d}" fill="${fill}"${op < 1 ? ` opacity="${op}"` : ''}/>`;
const poly = (pts: number[], fill: string) => {
  let d = '';
  for (let i = 0; i < pts.length; i += 2) d += `${i ? 'L' : 'M'}${f(pts[i])} ${f(pts[i + 1])} `;
  return path(`${d}Z`, fill);
};
const group = (tr: string, inner: string) => `<g transform="${tr}">${inner}</g>`;

/** The whole canvas in one colour. */
const fill = (c: string) => rect(0, 0, QS_CANVAS, QS_CANVAS, c);

/**
 * A rolling ridge across the full width, closed to the bottom of the canvas.
 * `pts` are the crest's y at evenly spaced x, joined with smooth quadratics.
 */
function ridge(pts: number[], color: string): string {
  const n = pts.length - 1;
  const dx = QS_CANVAS / n;
  let d = `M0 ${f(pts[0])}`;
  for (let i = 0; i < n; i++) {
    const x0 = i * dx, x1 = (i + 1) * dx;
    const mx = (x0 + x1) / 2;
    d += ` Q${f(mx)} ${f((pts[i] + pts[i + 1]) / 2 + (i % 2 ? 8 : -8))} ${f(x1)} ${f(pts[i + 1])}`;
  }
  return path(`${d} V${QS_CANVAS} H0 Z`, color);
}

/** The dark ground the card's words sit on, with a soft crest at the horizon. */
const ground = (color: string, lift = [0, -14, -4, -18]) =>
  ridge(lift.map((l) => HORIZON + l), color);

/** A flat cloud: a rounded base with three lobes, Imprint's shape. */
function cloud(x: number, y: number, s: number, color: string): string {
  return group(`translate(${f(x)} ${f(y)}) scale(${s})`,
    rect(-100, 0, 200, 36, color, 18) + circle(-44, 6, 38, color) + circle(12, -8, 52, color) + circle(64, 10, 30, color));
}

/** A small bird in flight, a flat chevron. */
const bird = (x: number, y: number, s: number, color: string) =>
  path(`M${f(x - 16 * s)} ${f(y)} Q${f(x - 8 * s)} ${f(y - 8 * s)} ${f(x)} ${f(y + 2 * s)} Q${f(x + 8 * s)} ${f(y - 8 * s)} ${f(x + 16 * s)} ${f(y)} Q${f(x + 8 * s)} ${f(y - 3 * s)} ${f(x)} ${f(y + 6 * s)} Q${f(x - 8 * s)} ${f(y - 3 * s)} ${f(x - 16 * s)} ${f(y)} Z`, color);

/** An Italian cypress: tall, narrow, pointed. */
const cypress = (x: number, base: number, h: number, color: string, shade: string) =>
  path(`M${f(x)} ${f(base - h)} Q${f(x - h * 0.16)} ${f(base - h * 0.45)} ${f(x - h * 0.1)} ${f(base)} H${f(x + h * 0.1)} Q${f(x + h * 0.16)} ${f(base - h * 0.45)} ${f(x)} ${f(base - h)} Z`, color)
  + path(`M${f(x)} ${f(base - h)} Q${f(x + h * 0.16)} ${f(base - h * 0.45)} ${f(x + h * 0.1)} ${f(base)} H${f(x + h * 0.02)} Q${f(x + h * 0.06)} ${f(base - h * 0.5)} ${f(x)} ${f(base - h)} Z`, shade);

/** A round-crowned tree on a trunk. */
function tree(x: number, base: number, h: number, crown: string, shade: string, trunk: string): string {
  const r = h * 0.34;
  return rect(x - h * 0.04, base - h * 0.42, h * 0.08, h * 0.42, trunk)
    + circle(x, base - h + r, r, crown)
    + path(`M${f(x + r * 0.2)} ${f(base - h + r * 0.1)} A${f(r)} ${f(r)} 0 0 1 ${f(x + r * 0.35)} ${f(base - h + r * 1.94)} A${f(r * 1.1)} ${f(r * 1.1)} 0 0 0 ${f(x + r * 0.2)} ${f(base - h + r * 0.1)} Z`, shade);
}

/** A field of small stars, placed deterministically. */
function stars(n: number, seed: number, x0: number, y0: number, x1: number, y1: number, color: string): string {
  let s = seed, out = '';
  const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  for (let i = 0; i < n; i++) {
    const x = x0 + rnd() * (x1 - x0), y = y0 + rnd() * (y1 - y0), r = 2 + rnd() * 3.5;
    out += circle(x, y, r, color, 0.55 + rnd() * 0.45);
  }
  return out;
}

// NO GLOWS. A soft round glow behind a lamp or a fire was the first draft, and it is
// the "round circle" the owner called AI on the subject cards. Light is a flat shape
// here, as it is in Imprint's frames: a lit patch of wall, a beam, a paler floor.

// ── PHILOSOPHY ──────────────────────────────────────────────────────────────

/** Athens at sunset: the Parthenon on its hill, and the owl of Athena on a column. */
function philosophyAcropolis(): QsScene {
  const C = { sky: '#EFE3CB', sun: '#E6AC45', far: '#E7AE84', hill: '#CF673C', near: '#B4532F', ink: '#26282C',
    stone: '#F5EEDF', stoneSh: '#A9B8BE', flute: '#E2D7C2', owl: '#7C5236', owlL: '#BC8A5A', eye: '#F7EFDF', tree: '#3E4A3B', treeSh: '#2E382C' };
  // The Parthenon: eight columns on a stepped base under a pediment (Ictinus's plan,
  // read off an annotated section), silhouetted against the sun.
  const tx = 330, tb = 612;
  let cols = '';
  for (let i = 0; i < 8; i++) cols += rect(tx + 12 + i * 34, tb - 74, 15, 74, C.ink);
  const temple = rect(tx - 12, tb, 298, 10, C.ink) + rect(tx - 22, tb + 10, 318, 10, C.ink)
    + cols + rect(tx - 2, tb - 94, 278, 20, C.ink) + poly([tx - 10, tb - 94, tx + 137, tb - 136, tx + 284, tb - 94], C.ink);
  // An Ionic column, broken off, with the little owl of Athena on it: upright, a
  // round head with no ear tufts, and the big pale eyes of the coin.
  const cx = 842, cap = 580, base = HORIZON + 4;
  const column = rect(cx - 58, cap + 52, 116, base - cap - 76, C.stone)
    + rect(cx + 18, cap + 52, 40, base - cap - 76, C.stoneSh)
    + [-34, -11, 12].map((d) => rect(cx + d - 2, cap + 62, 4, base - cap - 98, C.flute)).join('')
    + rect(cx - 86, cap, 172, 18, C.stone, 3)
    + path(`M${cx - 78} ${cap + 18} H${cx + 78} Q${cx + 66} ${cap + 50} ${cx} ${cap + 54} Q${cx - 66} ${cap + 50} ${cx - 78} ${cap + 18} Z`, C.stone)
    + [-1, 1].map((sg) => circle(cx + sg * 70, cap + 36, 23, C.stone) + circle(cx + sg * 70, cap + 36, 12, C.stoneSh) + circle(cx + sg * 70, cap + 36, 5, C.stone)).join('')
    + rect(cx - 72, base - 26, 144, 15, C.stone, 7) + rect(cx - 86, base - 13, 172, 17, C.stone) + rect(cx + 28, base - 13, 58, 17, C.stoneSh);
  const ox = cx - 6, oy = cap - 2;
  const owl = ellipse(ox, oy - 56, 44, 60, C.owl) + ellipse(ox + 3, oy - 42, 28, 40, C.owlL)
    + path(`M${ox + 20} ${oy - 100} Q${ox + 50} ${oy - 60} ${ox + 34} ${oy - 12} Q${ox + 22} ${oy - 50} ${ox + 20} ${oy - 100} Z`, C.ink, 0.35)
    + circle(ox, oy - 114, 42, C.owl)
    + circle(ox - 17, oy - 116, 15, C.eye) + circle(ox + 17, oy - 116, 15, C.eye)
    + circle(ox - 15, oy - 115, 6.5, C.ink) + circle(ox + 19, oy - 115, 6.5, C.ink)
    + poly([ox - 5, oy - 103, ox + 5, oy - 103, ox + 1, oy - 91], C.sun)
    + rect(ox - 18, oy - 5, 10, 8, C.sun, 3) + rect(ox + 8, oy - 5, 10, 8, C.sun, 3);
  const svg = fill(C.sky)
    + circle(520, 500, 196, C.sun)
    + bird(640, 300, 1.1, C.ink) + bird(690, 330, 0.8, C.ink)
    + ridge([690, 640, 660, 630, 648, 610, 604], C.far)
    + temple
    + cypress(250, 690, 150, C.tree, C.treeSh) + cypress(292, 684, 110, C.tree, C.treeSh)
    + ridge([740, 690, 672, 684, 700, 716, 722], C.hill)
    + ridge([770, 744, 736, 746, 752, 748, 742], C.near)
    + ground(C.ink)
    + column + owl;
  return { id: 'philosophy-1', subject: 'philosophy', name: 'The Acropolis at sunset', sky: C.sky, ground: C.ink, svg };
}

/** Plato's cave: prisoners before a wall of shadows, the fire behind them, daylight far off. */
function philosophyCave(): QsScene {
  const C = { rock: '#2B2E33', rockL: '#363A40', wall: '#CF683C', wallL: '#E0875A', wallD: '#B25533', shadow: '#5E3223',
    light: '#F2E5C8', sun: '#E8B048', fire: '#EDB54B', fireD: '#D95E2F', log: '#5B3A28', ink: '#1B1D20', ground: '#1E2024' };
  // The back wall, lit by the fire from the right: a lit face, and a darker band
  // where the rock curves away on the left.
  const wall = path('M130 780 Q118 560 220 450 Q340 350 560 346 Q790 344 900 450 Q990 560 980 780 Z', C.wall)
    + path('M130 780 Q118 560 220 450 Q290 392 380 368 Q280 470 262 780 Z', C.wallD)
    + path('M760 400 Q880 440 930 540 Q960 640 950 780 H820 Q840 600 760 400 Z', C.wallL);
  // The shadows the prisoners take for the world: a man carrying a jar, and a horse,
  // passing along the wall. Everything they know is these two shapes.
  // The bearer walks left with an amphora on his shoulder, one arm up to steady it.
  const bearer = circle(420, 488, 19, C.shadow)
    + path('M398 512 Q420 504 442 512 L452 600 H392 Z', C.shadow)
    + poly([396, 598, 412, 598, 404, 664, 390, 664], C.shadow) + poly([428, 598, 446, 598, 458, 664, 444, 664], C.shadow)
    + poly([436, 516, 448, 510, 470, 470, 460, 464], C.shadow)
    + ellipse(470, 446, 22, 32, C.shadow) + rect(462, 400, 16, 20, C.shadow) + rect(454, 396, 32, 8, C.shadow, 3)
    + path('M448 432 Q436 424 444 410 L452 414 Q446 422 454 428 Z', C.shadow) + path('M492 432 Q504 424 496 410 L488 414 Q494 422 486 428 Z', C.shadow);
  // A horse walking left: a long body, a neck rising to a narrow head, four long legs.
  const horse = ellipse(676, 590, 76, 30, C.shadow)
    + poly([606, 584, 628, 566, 604, 506, 580, 514], C.shadow)
    + poly([580, 506, 606, 500, 612, 516, 566, 552, 552, 544], C.shadow)
    + poly([598, 504, 604, 486, 610, 504], C.shadow)
    + path('M604 506 Q628 520 636 566 L624 570 Q616 530 598 516 Z', C.shadow)
    + poly([616, 604, 630, 604, 626, 676, 614, 676], C.shadow) + poly([638, 606, 652, 606, 650, 676, 638, 676], C.shadow)
    + poly([698, 606, 712, 606, 716, 676, 704, 676], C.shadow) + poly([722, 600, 736, 600, 744, 676, 732, 676], C.shadow)
    + path('M746 580 Q772 588 770 646 Q760 648 756 640 Q758 604 740 596 Z', C.shadow);
  // The mouth of the cave, high on the right: a ragged gap onto real daylight.
  const mouth = poly([868, 392, 912, 372, 958, 386, 970, 424, 944, 458, 900, 462, 872, 438], C.light) + circle(924, 414, 20, C.sun);
  // The fire, behind the prisoners on the right, and its logs.
  const fire = path('M836 776 Q824 716 858 680 Q858 716 878 694 Q880 644 916 616 Q908 676 930 700 Q954 676 948 640 Q992 700 968 776 Z', C.fireD)
    + path('M860 776 Q856 736 880 712 Q884 738 902 720 Q904 690 924 678 Q920 722 938 738 Q946 758 934 776 Z', C.fire)
    + rect(820, 770, 160, 16, C.log, 7) + rect(846, 760, 110, 12, C.log, 6);
  // Three prisoners, seated in a row facing the wall, backs to us: all we are shown of
  // them is their silhouettes against the firelight.
  const prisoner = (x: number, h: number) => circle(x, 700 - h, 30, C.ink)
    + path(`M${x - 46} 800 Q${x - 50} ${744 - h} ${x} ${732 - h} Q${x + 50} ${744 - h} ${x + 46} 800 Z`, C.ink);
  const svg = fill(C.rock)
    + path('M0 0 H1080 V320 Q880 270 720 306 Q540 344 380 314 Q200 284 0 344 Z', C.rockL)
    + wall + bearer + horse + mouth
    + ground(C.ground, [0, -10, -6, -12])
    + fire
    + prisoner(250, 0) + prisoner(372, 6) + prisoner(494, 0);
  return { id: 'philosophy-2', subject: 'philosophy', name: "Plato's cave", sky: C.rock, ground: C.ground, svg };
}

/** A philosopher's study at night: the lamp lit, a book open, the moon in the window. */
function philosophyStudy(): QsScene {
  const C = { wall: '#3A3950', glow: '#4E4A62', night: '#1E2A44', moon: '#F2E3C0', star: '#F2E3C0', frame: '#2A293B',
    wood: '#8A5A3B', woodL: '#A87048', woodD: '#5E3C28', page: '#F4ECDC', pageSh: '#D8CDB6', brass: '#CC9A45', brassD: '#9A6F2E',
    flame: '#F2B24A', flameD: '#E0662F', ink: '#1F1C28', laurel: '#7F9A6A', bust: '#E9E4DA', bustSh: '#B7B3C2' };
  const T = HORIZON - 12; // the desk top
  // The arched window, set right of the tab, with the moon and a few stars. THE VIEW
  // ENDS AT THE SILL (2026-09-30): the frame was a pill — round at the bottom as well
  // as the top — and the square-cornered night inside it ran out below its curve, so the
  // sky seemed to carry on down the wall: *"the outside isn't properly framed to be
  // outside the window."* The frame is an arch on a flat bottom now, the night stops at
  // its bottom rail, and a sill sits under it.
  const win = path('M560 640 V410 Q560 260 710 260 Q860 260 860 410 V640 Z', C.frame)
    + path('M580 620 V410 Q580 280 710 280 Q840 280 840 410 V620 Z', C.night)
    + circle(778, 360, 34, C.moon) + circle(794, 350, 30, C.night)
    + stars(9, 7, 600, 300, 830, 600, C.star) + rect(704, 280, 12, 340, C.frame) + rect(580, 452, 260, 12, C.frame)
    + rect(540, 628, 340, 18, C.woodL) + rect(548, 646, 324, 8, C.woodD);
  // The desk and what is on it.
  const desk = rect(0, T, QS_CANVAS, 22, C.woodL) + rect(0, T + 22, QS_CANVAS, 14, C.woodD);
  // An open book, pages falling from the gutter.
  const bx = 360;
  const book = path(`M${bx - 150} ${T} L${bx - 140} ${T - 40} Q${bx - 70} ${T - 58} ${bx} ${T - 34} Q${bx + 70} ${T - 58} ${bx + 140} ${T - 40} L${bx + 150} ${T} Z`, C.woodD)
    + path(`M${bx - 136} ${T - 8} L${bx - 128} ${T - 46} Q${bx - 64} ${T - 62} ${bx} ${T - 38} L${bx} ${T - 4} Q${bx - 64} ${T - 24} ${bx - 136} ${T - 8} Z`, C.page)
    + path(`M${bx + 136} ${T - 8} L${bx + 128} ${T - 46} Q${bx + 64} ${T - 62} ${bx} ${T - 38} L${bx} ${T - 4} Q${bx + 64} ${T - 24} ${bx + 136} ${T - 8} Z`, C.pageSh)
    + [0, 1, 2, 3].map((i) => rect(bx - 116, T - 40 + i * 8, 90, 2.5, C.pageSh)).join('');
  // An oil lamp in brass, lit — the one warm light in the room.
  const lx = 690;
  const lamp = ellipse(lx, T - 26, 78, 26, C.brass) + ellipse(lx, T - 34, 58, 12, C.brassD)
    + path(`M${lx + 50} ${T - 34} Q${lx + 96} ${T - 46} ${lx + 104} ${T - 28} Q${lx + 90} ${T - 16} ${lx + 58} ${T - 16} Z`, C.brass)
    + path(`M${lx - 74} ${T - 30} Q${lx - 108} ${T - 52} ${lx - 92} ${T - 76} Q${lx - 80} ${T - 50} ${lx - 58} ${T - 42} Z`, C.brassD)
    + path(`M${lx + 100} ${T - 34} Q${lx + 80} ${T - 66} ${lx + 100} ${T - 112} Q${lx + 120} ${T - 66} ${lx + 100} ${T - 34} Z`, C.flame)
    + path(`M${lx + 100} ${T - 36} Q${lx + 90} ${T - 54} ${lx + 100} ${T - 80} Q${lx + 110} ${T - 54} ${lx + 100} ${T - 36} Z`, C.flameD);
  // A small marble bust on the right end of the desk, and a quill in its pot.
  const qx = 930;
  const bust = rect(qx - 40, T - 34, 80, 34, C.bust, 3) + rect(qx + 12, T - 34, 28, 34, C.bustSh)
    + path(`M${qx - 62} ${T - 36} Q${qx - 58} ${T - 92} ${qx} ${T - 96} Q${qx + 58} ${T - 92} ${qx + 62} ${T - 36} Z`, C.bust)
    + path(`M${qx + 16} ${T - 95} Q${qx + 58} ${T - 90} ${qx + 62} ${T - 36} H${qx + 24} Z`, C.bustSh)
    + rect(qx - 12, T - 116, 24, 24, C.bust) + ellipse(qx, T - 150, 36, 42, C.bust)
    + path(`M${qx + 10} ${T - 190} Q${qx + 42} ${T - 172} ${qx + 34} ${T - 132} Q${qx + 24} ${T - 112} ${qx + 8} ${T - 110} Z`, C.bustSh)
    + [-1, 1].map((sg) => ellipse(qx + sg * 30, T - 176, 13, 7, C.laurel)).join('');
  const quill = rect(548, T - 44, 44, 44, C.ink, 8) + path(`M572 ${T - 40} Q600 ${T - 150} 640 ${T - 190} Q612 ${T - 120} 580 ${T - 40} Z`, C.page)
    + path(`M578 ${T - 42} Q604 ${T - 140} 640 ${T - 190} Q600 ${T - 128} 574 ${T - 44} Z`, C.pageSh);
  // The lamp's light on the wall: one flat, paler fan behind it, not a glow.
  const fan = path(`M${lx + 100} ${T - 90} L${lx - 140} ${T} H${lx + 360} Z`, C.glow, 0.7);
  const svg = fill(C.wall) + fan + win + desk + book + quill + lamp + bust
    + rect(0, T + 36, QS_CANVAS, QS_CANVAS - T, C.ink);
  return { id: 'philosophy-3', subject: 'philosophy', name: "The philosopher's study", sky: C.wall, ground: C.ink, svg };
}

// ── ECONOMICS ───────────────────────────────────────────────────────────────

/** A container port at dawn: a loaded ship at the quay and a crane reaching over it. */
function economicsHarbour(): QsScene {
  const C = { sky: '#EEE4CF', sun: '#EFB54E', far: '#C6D0CB', far2: '#AEBFBD', sea: '#6F9AA9', seaL: '#8FB3BE',
    hull: '#243343', red: '#B5503C', bridge: '#F3EEE3', bridgeSh: '#C3CBCD', crane: '#E3813F', craneSh: '#B65F2B',
    white: '#F3EEE3', gull: '#3A4652', quay: '#1F2A33' };
  const BOX = ['#C8603F', '#3F7A8C', '#E2A845', '#5C6F8A', '#8E4E3E', '#6E9A7E', '#D98B55'];
  // A far city across the water, in two distance tones.
  let city = '';
  const hs = [40, 64, 30, 88, 52, 26, 70, 44, 96, 36, 58, 30, 74, 48, 34, 62, 40, 84, 50, 30];
  hs.forEach((h, i) => { city += rect(i * 54, 652 - h, 50, h + 4, i % 3 ? C.far : C.far2); });
  const sea = rect(0, 650, QS_CANVAS, 120, C.sea)
    + [[120, 676, 90], [520, 690, 140], [930, 672, 70], [300, 728, 120], [760, 736, 110]].map(([x, y, w]) => rect(x, y, w, 4, C.seaL, 2)).join('');
  // The ship: a long low hull with a red boot-top, three tiers of containers, and
  // the white bridge at the stern with its funnel.
  const hull = poly([150, 650, 902, 650, 944, 638, 906, 714, 172, 714, 150, 688], C.hull)
    + poly([166, 700, 912, 700, 906, 714, 172, 714], C.red);
  let boxes = '', k = 3;
  for (let tier = 0; tier < 3; tier++) {
    for (let i = 0; i < 13; i++) {
      if (tier === 2 && (i === 4 || i === 10)) continue;
      k = (k * 5 + i * 3 + tier + 2) % BOX.length;
      const x = 268 + i * 46, y = 626 - tier * 25;
      boxes += rect(x, y, 44, 23, BOX[k]) + rect(x + 36, y, 8, 23, C.hull, 1).replace('/>', ' opacity="0.22"/>');
    }
  }
  const bridge = rect(174, 520, 74, 130, C.bridge) + rect(226, 520, 22, 130, C.bridgeSh)
    + rect(164, 518, 94, 14, C.hull) + [548, 578, 608].map((y) => rect(184, y, 44, 8, C.hull, 2)).join('')
    + rect(196, 484, 30, 36, C.red) + rect(196, 484, 30, 8, C.hull);
  // A ship-to-shore crane on the quay: a portal on two legs, a tower above it, and a
  // long boom reaching left over the stacks, stayed from the tower's peak.
  const L1 = 836, L2 = 952, TOP = 540, BOOM = 470;
  const crane = rect(L1 - 12, TOP, 24, HORIZON - TOP + 20, C.crane) + rect(L2 - 12, TOP, 24, HORIZON - TOP + 20, C.craneSh)
    + rect(L1 - 12, TOP - 6, L2 - L1 + 24, 22, C.crane) + rect(L1, 640, L2 - L1, 12, C.craneSh)
    + poly([L1 + 8, TOP, L1 + 30, TOP, 910, BOOM + 20, 890, BOOM + 20], C.craneSh)
    + rect(600, BOOM, 420, 20, C.crane) + rect(600, BOOM + 14, 420, 6, C.craneSh)
    + poly([890, BOOM, 904, 392, 918, 392, 932, BOOM], C.crane)
    + rect(898, 392, 26, 10, C.red) + rect(898, 412, 26, 10, C.white) + rect(898, 432, 26, 10, C.red)
    + path(`M904 398 L604 ${BOOM + 2} L608 ${BOOM + 6} L906 404 Z`, C.craneSh)
    + path(`M918 398 L1016 ${BOOM + 2} L1012 ${BOOM + 6} L916 404 Z`, C.craneSh)
    + rect(680, BOOM + 18, 40, 18, C.hull) + rect(692, BOOM + 36, 3, 44, C.hull) + rect(705, BOOM + 36, 3, 44, C.hull)
    + rect(670, BOOM + 80, 60, 26, BOX[0]) + rect(718, BOOM + 80, 12, 26, C.hull).replace('/>', ' opacity="0.22"/>');
  const svg = fill(C.sky)
    + circle(330, 612, 76, C.sun)
    + bird(560, 520, 1.2, C.gull) + bird(610, 548, 0.9, C.gull) + bird(430, 560, 0.8, C.gull)
    + city + sea + hull + boxes + bridge + crane
    + ground(C.quay, [0, -6, -2, -8]);
  return { id: 'economics-1', subject: 'economics', name: 'The container port', sky: C.sky, ground: C.quay, svg };
}

/** A market stall under a striped awning: crates of fruit, and the price on a chalk board. */
function economicsMarket(): QsScene {
  const C = { sky: '#F2E6CF', house: '#A9BDC0', houseB: '#D8C3A3', houseC: '#8FA8AE', win: '#5E7680', roof: '#B86A48',
    teal: '#3A6E86', cream: '#F4EDDF', wood: '#9A6440', woodD: '#6E4730', apple: '#C8483A', appleL: '#DE6A52', orange: '#E8943A',
    pear: '#B6B45A', lemon: '#EBC24D', leaf: '#5E7E4E', board: '#2E3B3C', chalk: '#EDE7DA', cobble: '#252A2D' };
  // A row of townhouses behind, in three quiet tones.
  const houses = [[0, 470, 150, C.house], [150, 440, 170, C.houseB], [320, 490, 150, C.houseC], [470, 430, 180, C.house],
    [650, 470, 160, C.houseB], [810, 450, 150, C.houseC], [960, 480, 120, C.house]] as const;
  let town = '';
  for (const [x, top, w, c] of houses) {
    town += rect(x, top, w, HORIZON - top, c) + rect(x - 4, top - 10, w + 8, 12, C.roof);
    for (let r = 0; top + 30 + r * 70 < 700; r++) for (let q = 0; q < Math.floor(w / 60); q++) town += rect(x + 22 + q * 60, top + 30 + r * 70, 24, 38, C.win, 12);
  }
  // The stall: two poles, a sloping striped awning with a scalloped edge, a counter.
  const X0 = 430, X1 = 900, AW = 470;
  let stripes = '', scallops = '';
  for (let i = 0; i < 8; i++) {
    const x = X0 - 20 + i * 64;
    stripes += poly([x + 14, 404, x + 78, 404, x + 64, AW, x, AW], i % 2 ? C.cream : C.teal);
    scallops += path(`M${x} ${AW - 1} H${x + 64} A32 22 0 0 1 ${x} ${AW - 1} Z`, i % 2 ? C.cream : C.teal);
  }
  const stall = rect(X0 + 6, AW, 14, HORIZON - AW, C.woodD) + rect(X1 - 20, AW, 14, HORIZON - AW, C.woodD)
    + stripes + scallops + rect(X0 - 8, 398, 516, 8, C.woodD)
    + rect(X0 - 10, 640, X1 - X0 + 20, 16, C.wood) + rect(X0, 656, X1 - X0, HORIZON - 656, C.woodD)
    + [0, 1, 2].map((i) => rect(X0 + 16, 676 + i * 26, X1 - X0 - 32, 4, C.wood)).join('');
  // Three crates of fruit on the counter, a mound in each, and a price card.
  const fruit = [[C.apple, C.appleL], [C.orange, C.lemon], [C.pear, C.lemon]];
  let crates = '';
  [455, 605, 755].forEach((x, i) => {
    const [a, b] = fruit[i];
    let mound = '';
    for (let r = 0; r < 3; r++) for (let q = 0; q < 6 - r * 2; q++) {
      const fx = x + 20 + r * 22 + q * 22, fy = 594 - r * 18;
      mound += circle(fx, fy, 16, a) + circle(fx - 5, fy - 5, 5, b);
    }
    if (i === 0) mound += ellipse(x + 64, 548, 9, 4, C.leaf);
    crates += mound + rect(x, 598, 130, 42, C.wood) + rect(x, 598, 130, 8, C.woodD) + rect(x + 106, 598, 24, 42, C.woodD)
      + rect(x + 40, 610, 50, 22, C.cream, 3) + rect(x + 48, 618, 22, 4, C.teal) + circle(x + 80, 620, 5, C.orange);
  });
  // A chalk A-board on the pavement: an apple drawn on it and the prices under it.
  const bx = 250;
  const board = poly([bx - 64, HORIZON + 10, bx - 40, 560, bx + 40, 560, bx + 64, HORIZON + 10], C.woodD)
    + poly([bx - 50, 740, bx - 32, 578, bx + 32, 578, bx + 50, 740], C.board)
    + circle(bx, 616, 16, 'none').replace('fill="none"', `fill="none" stroke="${C.chalk}" stroke-width="4"`)
    + rect(bx - 2, 594, 4, 8, C.chalk) + [654, 680, 706].map((y, i) => rect(bx - 30 + i * 2, y, 34 - i * 6, 5, C.chalk, 2) + rect(bx + 14, y, 14, 5, C.chalk, 2)).join('');
  const svg = fill(C.sky) + town + stall + crates + board + ground(C.cobble, [0, -4, -2, -6]);
  return { id: 'economics-2', subject: 'economics', name: 'The market stall', sky: C.sky, ground: C.cobble, svg };
}

/** The exchange at blue hour: a columned front among lit towers, and the coins that trade in it. */
function economicsExchange(): QsScene {
  const C = { sky: '#34506A', moon: '#F2E3C0', tower: '#46627C', tower2: '#56718B', lit: '#F0C46A', stone: '#EAE2D1', stoneSh: '#B8B6AE',
    frieze: '#2A3A4A', up: '#7FC0A6', down: '#D9694A', flag: '#D9694A', gold: '#E2A845', goldD: '#B07D2A', goldL: '#F2CB72', ground: '#1C2733' };
  // Lit towers behind: each a flat block with a grid of warm windows, some dark.
  let towers = '', n = 11;
  const T = [[330, 520, 90], [420, 430, 110], [540, 400, 90], [640, 450, 120], [770, 410, 100], [880, 490, 110], [990, 540, 90]];
  T.forEach(([x, top, w], i) => {
    towers += rect(x, top, w, HORIZON - top, i % 2 ? C.tower : C.tower2);
    for (let y = top + 22; y < 520; y += 30) for (let q = 12; q + 14 < w; q += 26) {
      n = (n * 13 + 5) % 17;
      if (n < 7) towers += rect(x + q, y, 14, 16, C.lit);
    }
  });
  // The exchange: steps, six columns, a frieze carrying a ticker of rises and falls,
  // a pediment, and a flag on its peak.
  const X0 = 420, X1 = 820, CX = 620;
  let cols = '';
  for (let i = 0; i < 6; i++) { const x = X0 + 30 + i * 64; cols += rect(x, 578, 26, 146, C.stone) + rect(x + 17, 578, 9, 146, C.stoneSh); }
  let tick = '';
  for (let i = 0; i < 16; i++) { const h = 4 + ((i * 7) % 11); tick += rect(X0 + 28 + i * 22, 560 - h, 10, h, i % 3 === 1 ? C.down : C.up); }
  const exchange = rect(X0 + 10, 568, X1 - X0 - 20, 160, C.stoneSh) + cols
    + rect(X0 - 6, 532, X1 - X0 + 12, 40, C.stone) + rect(X0 + 10, 540, X1 - X0 - 20, 24, C.frieze) + tick
    + poly([X0 - 16, 532, CX, 468, X1 + 16, 532], C.stone) + poly([CX, 468, X1 + 16, 532, CX, 532], C.stoneSh)
    + rect(X0 - 20, 724, X1 - X0 + 40, 14, C.stone) + rect(X0 - 36, 738, X1 - X0 + 72, 14, C.stone) + rect(X0 - 52, 752, X1 - X0 + 104, 14, C.stoneSh)
    + rect(CX - 3, 392, 6, 78, C.stone) + path(`M${CX + 3} 396 H${CX + 58} L${CX + 46} 412 L${CX + 58} 428 H${CX + 3} Z`, C.flag);
  // Coin stacks in the foreground: an edge band and a lit face, ridged on the edge.
  const stack = (x: number, count: number) => {
    let s = '';
    for (let i = 0; i < count; i++) {
      const y = HORIZON + 4 - i * 15;
      s += rect(x - 52, y - 8, 104, 15, C.goldD, 3) + ellipse(x, y - 8, 52, 14, C.gold);
      for (let r = -40; r <= 40; r += 16) s += rect(x + r, y - 2, 3, 8, C.gold);
    }
    const top = HORIZON + 4 - (count - 1) * 15 - 8;
    return s + ellipse(x, top, 36, 9, C.goldL);
  };
  const svg = fill(C.sky)
    + path('M880 330 A40 40 0 1 1 880 330.1 Z', C.sky) + circle(860, 330, 34, C.moon) + circle(876, 320, 30, C.sky)
    + stars(10, 3, 560, 290, 1060, 400, C.moon)
    + towers + exchange
    + ground(C.ground, [0, -6, -2, -8])
    + stack(210, 5) + stack(310, 8) + stack(920, 4);
  return { id: 'economics-3', subject: 'economics', name: 'The exchange at blue hour', sky: C.sky, ground: C.ground, svg };
}

// ── PSYCHOLOGY ──────────────────────────────────────────────────────────────

/** A head in profile holding a night sky, and a small figure looking up at it. */
function psychologyMind(): QsScene {
  const C = { sky: '#DCD5E7', cloud: '#EEEAF4', far: '#BDB2D0', near: '#9D93B5', head: '#2E3358', star: '#F4E6C4', moon: '#F4E6C4',
    cloudIn: '#474C78', ink: '#23243A', lamp: '#EDB54B', tree: '#6B6690', treeSh: '#58537C' };
  // The profile follows a photographed silhouette: a vertical forehead, the nose as
  // the furthest point forward, the jaw stepping back to a neck half the head's width.
  const HEAD = 'M520 776 Q600 766 628 712 Q640 680 630 640 Q600 600 606 520 Q616 400 722 388 Q812 384 828 452 L834 500 Q836 520 844 530 L868 574 Q864 585 848 587 L852 600 Q848 607 843 609 L849 621 Q842 635 833 637 Q842 661 820 669 Q790 677 760 668 L766 706 Q782 742 920 776 Z';
  const inside = stars(26, 19, 600, 400, 860, 700, C.star)
    + circle(726, 478, 30, C.moon) + circle(742, 468, 26, C.head)
    + cloud(700, 600, 0.55, C.cloudIn) + cloud(800, 520, 0.35, C.cloudIn);
  const head = `<defs><clipPath id="qs-psy-head"><path d="${HEAD}"/></clipPath></defs>`
    + path(HEAD, C.head) + `<g clip-path="url(#qs-psy-head)">${inside}</g>`;
  // A small figure on the hill, looking up at it, lantern in hand.
  const px = 360, pb = HORIZON - 8;
  const person = circle(px, pb - 88, 15, C.ink) + path(`M${px - 16} ${pb - 70} H${px + 16} L${px + 20} ${pb - 24} H${px - 20} Z`, C.ink)
    + rect(px - 14, pb - 26, 10, 26, C.ink) + rect(px + 4, pb - 26, 10, 26, C.ink)
    + poly([px + 14, pb - 66, px + 22, pb - 70, px + 40, pb - 40, px + 32, pb - 36], C.ink) + rect(px + 30, pb - 38, 14, 18, C.lamp, 3);
  const svg = fill(C.sky)
    + cloud(250, 440, 0.8, C.cloud) + cloud(960, 400, 0.6, C.cloud)
    + ridge([700, 660, 690, 650, 700, 670, 690], C.far)
    + tree(190, 730, 150, C.tree, C.treeSh, C.ink) + tree(240, 740, 100, C.tree, C.treeSh, C.ink)
    + ridge([760, 736, 742, 750, 760, 752, 748], C.near)
    + head + person
    + ground(C.ink, [0, -8, -4, -10]);
  return { id: 'psychology-1', subject: 'psychology', name: 'The mind at night', sky: C.sky, ground: C.ink, svg };
}

/** The consulting room: the couch under its rug and cushions, the chair behind it. */
function psychologyCouch(): QsScene {
  const C = { wall: '#D6CEDD', wallD: '#C4BACF', frame: '#4B4466', pic: '#9D93B5', picL: '#E9C98A', rug: '#9E4A3E', rugD: '#7E3A33',
    band: '#C98A5A', band2: '#3E3A5C', wood: '#5B3A2A', cush1: '#B8453B', cush2: '#D9A24A', cush3: '#4F7A7A', chair: '#5E7E6A', chairD: '#48624F',
    lampShade: '#E9C98A', lampShadeD: '#C9A460', pole: '#2D2A3C', leaf: '#5E7E4E', leafD: '#48633C', pot: '#B86A48', floor: '#24233A' };
  // The wall, with a dado and two framed pictures.
  const wall = fill(C.wall) + rect(0, 640, QS_CANVAS, HORIZON - 640, C.wallD) + rect(0, 636, QS_CANVAS, 8, C.frame)
    + rect(560, 420, 120, 96, C.frame) + rect(570, 430, 100, 76, C.pic) + circle(640, 452, 12, C.picL) + poly([570, 506, 610, 466, 640, 490, 670, 470, 670, 506], C.frame)
    + rect(700, 440, 76, 76, C.frame) + rect(710, 450, 56, 56, C.picL) + rect(726, 466, 24, 24, C.cush1);
  // The couch: a long daybed raised at its head, a rug laid over it to the floor,
  // banded like the one in Berggasse 19, and cushions piled at the head end.
  const cx0 = 300, cx1 = 800;
  const couch = rect(cx0 + 10, 730, 16, 30, C.wood) + rect(cx1 - 26, 730, 16, 30, C.wood)
    + path(`M${cx0} 736 V620 Q${cx0} 578 ${cx0 + 40} 578 L${cx0 + 110} 620 H${cx1} V736 Z`, C.rug)
    + rect(cx0, 700, cx1 - cx0, 36, C.rugD)
    + [640, 664, 688].map((y, i) => rect(cx0 + 110, y, cx1 - cx0 - 110, 6, i === 1 ? C.band2 : C.band)).join('')
    + [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((i) => rect(cx0 + 8 + i * 35, 736, 4, 12, C.band)).join('')
    + ellipse(cx0 + 56, 590, 50, 30, C.cush1) + ellipse(cx0 + 106, 604, 44, 26, C.cush2) + ellipse(cx0 + 150, 612, 38, 20, C.cush3);
  // The analyst's green armchair behind the head end, as Freud sat.
  const ax = 170;
  const chair = rect(ax - 60, 720, 12, 40, C.wood) + rect(ax + 48, 720, 12, 40, C.wood)
    + path(`M${ax - 70} 724 V560 Q${ax - 70} 520 ${ax - 30} 520 H${ax + 30} Q${ax + 70} 520 ${ax + 70} 560 V724 Z`, C.chair)
    + rect(ax - 80, 630, 30, 96, C.chairD, 12) + rect(ax + 50, 630, 30, 96, C.chairD, 12) + rect(ax - 60, 660, 120, 60, C.chairD, 8);
  // A floor lamp and a potted plant at the foot of the couch.
  const lx = 900;
  const lamp = rect(lx - 3, 480, 6, 280, C.pole) + rect(lx - 30, 752, 60, 8, C.pole, 4)
    + poly([lx - 44, 530, lx - 26, 470, lx + 26, 470, lx + 44, 530], C.lampShade) + poly([lx + 8, 470, lx + 26, 470, lx + 44, 530, lx + 16, 530], C.lampShadeD);
  const px = 990;
  const plant = poly([px - 34, 690, px + 34, 690, px + 26, 760, px - 26, 760], C.pot)
    + [[-40, 610, -20], [0, 590, 0], [36, 620, 24], [-16, 640, -30], [22, 650, 30]].map(([dx, y, rot]) =>
      group(`rotate(${rot} ${px + dx} ${y})`, ellipse(px + dx, y, 16, 44, C.leaf) + ellipse(px + dx + 6, y, 8, 40, C.leafD))).join('');
  const svg = wall + chair + couch + lamp + plant + rect(0, HORIZON, QS_CANVAS, QS_CANVAS - HORIZON, C.floor);
  return { id: 'psychology-2', subject: 'psychology', name: 'The consulting room', sky: C.wall, ground: C.floor, svg };
}

/** A hall of closed doors, and one standing open onto light. */
function psychologyDoors(): QsScene {
  const C = { wall: '#3F4466', wallL: '#4A5075', rail: '#343857', doors: ['#4F7A7A', '#B06A4E', '#8C86AE', '#C99A4A'], dark: '#23243A',
    light: '#F4D48A', lightL: '#F9E7B8', knob: '#E9C98A', ink: '#1C1D30', floor: '#1F2035' };
  const wall = fill(C.wall) + rect(0, 620, QS_CANVAS, 140, C.wallL) + rect(0, 616, QS_CANVAS, 8, C.rail);
  // Five doors: panelled, each its own colour; the fourth is open.
  let doors = '';
  const xs = [150, 330, 510, 690, 870];
  xs.forEach((x, i) => {
    doors += rect(x - 70, 500, 140, 262, C.rail);
    if (i === 3) {
      // Open: a lit doorway, the leaf swung in, and the light laid on the floor.
      doors += rect(x - 60, 510, 120, 252, C.light) + rect(x - 60, 510, 120, 40, C.lightL)
        + poly([x - 60, 510, x - 30, 526, x - 30, 746, x - 60, 762], C.doors[1])
        + poly([x - 60, 762, x + 60, 762, x + 96, 778, x - 64, 778], C.lightL);
    } else {
      const c = C.doors[i % 4];
      doors += rect(x - 60, 510, 120, 252, c) + rect(x - 44, 528, 88, 90, C.dark).replace('/>', ' opacity="0.18"/>')
        + rect(x - 44, 638, 88, 104, C.dark).replace('/>', ' opacity="0.18"/>') + circle(x + 42, 640, 7, C.knob);
    }
  });
  // A small figure walking toward the open door.
  const px = 590, pb = HORIZON;
  const person = circle(px, pb - 94, 15, C.ink) + path(`M${px - 16} ${pb - 76} H${px + 16} L${px + 18} ${pb - 30} H${px - 18} Z`, C.ink)
    + poly([px - 12, pb - 32, px - 2, pb - 32, px - 16, pb, px - 28, pb], C.ink) + poly([px + 2, pb - 32, px + 12, pb - 32, px + 26, pb, px + 14, pb], C.ink);
  const svg = wall + doors + rect(0, 762, QS_CANVAS, QS_CANVAS - 762, C.floor)
    + person;
  return { id: 'psychology-3', subject: 'psychology', name: 'The open door', sky: C.wall, ground: C.floor, svg };
}

// ── PERSONAL GROWTH ─────────────────────────────────────────────────────────

/** Sunrise over the range, a path climbing to a flag on the summit. */
function growthSummit(): QsScene {
  const C = { sky: '#F4E2BF', sun: '#EFA24A', far: '#C4C49A', mid: '#94A06A', near: '#6E7A4A', nearD: '#5A653B', snow: '#F6EFDF', snowSh: '#D8D6C4',
    path: '#EADBB8', flag: '#D0573A', pole: '#3A3B2C', ink: '#262B1F', bird: '#5A653B' };
  const peak = 700;
  const svg = fill(C.sky)
    + circle(430, 560, 110, C.sun)
    + bird(560, 450, 1, C.bird) + bird(600, 474, 0.7, C.bird)
    + ridge([620, 560, 600, 540, 610, 580, 600], C.far)
    // The main peak, lit on its left face.
    + poly([380, 760, peak, 408, 1000, 760], C.mid) + poly([peak, 408, 1000, 760, 760, 760, 730, 600], C.near)
    + poly([peak, 408, 650, 470, 676, 462, 692, 488, 712, 460, 744, 478], C.snow) + poly([peak, 408, 744, 478, 722, 470, 708, 452], C.snowSh)
    + rect(peak - 2, 330, 5, 82, C.pole) + path(`M${peak + 3} 334 H${peak + 64} L${peak + 50} 352 L${peak + 64} 370 H${peak + 3} Z`, C.flag)
    + ridge([740, 690, 700, 720, 740, 760, 740], C.nearD)
    // The path, zig-zagging up the near hill, in pale switchbacks.
    + path('M300 790 Q420 752 520 740 Q420 728 460 706 Q560 692 610 676 Q540 664 600 650 Q650 640 668 610', 'none').replace('fill="none"', `fill="none" stroke="${C.path}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"`)
    + circle(604, 640, 9, C.ink) + rect(598, 648, 12, 22, C.ink, 4)
    + ground(C.ink, [0, -10, -4, -12]);
  return { id: 'personal-growth-1', subject: 'personal-growth', name: 'The summit at sunrise', sky: C.sky, ground: C.ink, svg };
}

/** A morning desk by the window: the journal open, the coffee poured, the clock set. */
function growthMorning(): QsScene {
  const C = { wall: '#E7E0CC', frame: '#8E9670', sky: '#CFE0DC', sun: '#F2C66D', hill: '#A7B489', hill2: '#8C9A6C', wood: '#A87048', woodD: '#7A5033',
    page: '#F7F1E3', pageSh: '#DDD3BD', line: '#C8BFA9', tick: '#6E7A4A', mug: '#D0573A', mugD: '#A8432D', steam: '#FFFFFF', clock: '#6E7A4A', clockD: '#58623A',
    face: '#F7F1E3', ink: '#2A2A24', leaf: '#6E8A4E', leafD: '#557040', pot: '#E8DCC2', potD: '#C9BC9E' };
  const T = HORIZON - 16;
  const win = rect(470, 380, 440, 300, C.frame, 8) + rect(486, 396, 408, 268, C.sky)
    + circle(760, 520, 44, C.sun)
    + `<defs><clipPath id="qs-grow-win"><rect x="486" y="396" width="408" height="268"/></clipPath></defs>`
    + `<g clip-path="url(#qs-grow-win)">${ridge([600, 570, 590, 566, 596, 580, 590], C.hill)}${ridge([640, 620, 634, 612, 640, 626, 640], C.hill2)}</g>`
    + rect(684, 396, 12, 268, C.frame) + rect(486, 524, 408, 12, C.frame) + rect(456, 676, 468, 18, C.frame);
  const desk = rect(0, T, QS_CANVAS, 20, C.wood) + rect(0, T + 20, QS_CANVAS, 14, C.woodD);
  // The journal, open, with the day's three lines ticked.
  const jx = 400;
  const journal = poly([jx - 176, T, jx - 150, T - 96, jx, T - 84, jx, T], C.page) + poly([jx + 176, T, jx + 150, T - 96, jx, T - 84, jx, T], C.pageSh)
    + rect(jx - 4, T - 86, 8, 86, C.tick)
    + [0, 1, 2].map((i) => rect(jx - 118 + i * 6, T - 76 + i * 22, 96 - i * 4, 6, C.line, 3)
      + path(`M${jx - 146 + i * 6} ${T - 74 + i * 22} l7 7 l13 -13`, 'none').replace('fill="none"', `fill="none" stroke="${C.tick}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"`)).join('')
    + rect(jx + 30, T - 70, 100, 6, C.line, 3) + rect(jx + 32, T - 50, 84, 6, C.line, 3) + rect(jx + 34, T - 30, 60, 6, C.line, 3)
    + poly([jx + 150, T - 8, jx + 250, T - 44, jx + 256, T - 34, jx + 156, T], C.ink);
  // A mug of coffee with two wisps of steam.
  const mx = 720;
  const mug = rect(mx - 40, T - 92, 80, 92, C.mug, 10) + rect(mx + 14, T - 92, 26, 92, C.mugD, 0) + rect(mx - 40, T - 92, 80, 14, C.mugD, 6)
    + path(`M${mx + 40} ${T - 72} q34 0 34 30 q0 30 -34 30 v-14 q20 0 20 -16 q0 -16 -20 -16 Z`, C.mug)
    + [-14, 10].map((d) => path(`M${mx + d} ${T - 104} q-14 -20 0 -40 q14 -20 0 -40 l6 0 q14 20 0 40 q-14 20 0 40 Z`, C.steam)).join('');
  // An alarm clock with two bells, and a small plant.
  const cx = 880;
  const clock = circle(cx - 36, T - 104, 20, C.clockD) + circle(cx + 36, T - 104, 20, C.clockD)
    + rect(cx - 40, T - 18, 10, 18, C.ink) + rect(cx + 30, T - 18, 10, 18, C.ink)
    + circle(cx, T - 64, 54, C.clock) + circle(cx, T - 64, 40, C.face)
    + rect(cx - 2, T - 94, 5, 32, C.ink) + rect(cx - 2, T - 66, 26, 5, C.ink) + circle(cx, T - 64, 5, C.mug);
  const px = 150;
  const plant = poly([px - 40, T - 70, px + 40, T - 70, px + 30, T, px - 30, T], C.pot) + poly([px + 10, T - 70, px + 40, T - 70, px + 30, T, px + 8, T], C.potD)
    + [[-30, -130, -30], [0, -150, 0], [30, -126, 30], [-14, -104, -50], [18, -100, 50]].map(([dx, dy, r]) =>
      group(`rotate(${r} ${px + dx} ${T + dy + 40})`, ellipse(px + dx, T + dy, 16, 40, C.leaf) + ellipse(px + dx + 5, T + dy, 7, 36, C.leafD))).join('');
  const svg = fill(C.wall) + win + desk + journal + mug + clock + plant + rect(0, T + 34, QS_CANVAS, QS_CANVAS, C.ink);
  return { id: 'personal-growth-2', subject: 'personal-growth', name: 'The morning desk', sky: C.wall, ground: C.ink, svg };
}

/** Three pots on a sill: a seedling, a sapling and a small tree, and the can that grew them. */
function growthPots(): QsScene {
  const C = { wall: '#DCE0C6', wallD: '#C8CEAE', sill: '#F2EDE0', sillD: '#CFC7B2', pot: '#C8704A', potD: '#A0583A', rim: '#D98A5E',
    soil: '#4A3A2C', leaf: '#6E8A4E', leafD: '#557040', leafL: '#8FA868', trunk: '#6B4A33', can: '#4F7A7A', canD: '#3D6262', ink: '#262B1F' };
  const S = HORIZON - 20;
  const pot = (x: number, w: number, h: number) => poly([x - w / 2, S - h, x + w / 2, S - h, x + w * 0.38, S, x - w * 0.38, S], C.pot)
    + poly([x + w * 0.12, S - h, x + w / 2, S - h, x + w * 0.38, S, x + w * 0.08, S], C.potD)
    + rect(x - w / 2 - 8, S - h - 18, w + 16, 24, C.rim, 4) + rect(x + w * 0.14, S - h - 18, w * 0.36 + 8, 24, C.potD, 4);
  const leafAt = (x: number, y: number, r: number, s = 1) => group(`rotate(${r} ${x} ${y})`,
    ellipse(x, y - 22 * s, 13 * s, 26 * s, C.leaf) + ellipse(x + 4 * s, y - 22 * s, 6 * s, 22 * s, C.leafD));
  // 1 — a seedling: a stem and two leaves.
  const a = 380;
  const seedling = pot(a, 110, 90) + rect(a - 3, S - 160, 6, 56, C.leafD) + leafAt(a, S - 156, -60, 0.9) + leafAt(a, S - 156, 60, 0.9);
  // 2 — a sapling: a taller stem with leaves up it.
  const b = 610;
  const sapling = pot(b, 130, 110) + rect(b - 4, S - 290, 8, 164, C.trunk)
    + leafAt(b, S - 180, -64) + leafAt(b, S - 214, 60) + leafAt(b, S - 250, -54) + leafAt(b, S - 284, 20);
  // 3 — a small tree: a trunk and a full crown.
  const c = 850;
  const treeP = pot(c, 160, 130) + rect(c - 8, S - 290, 16, 144, C.trunk)
    + circle(c, S - 330, 96, C.leaf) + circle(c - 60, S - 300, 58, C.leaf) + circle(c + 60, S - 292, 60, C.leafD) + circle(c + 30, S - 370, 56, C.leafL);
  // A watering can on the left.
  const w = 180;
  const can = rect(w - 50, S - 110, 100, 110, C.can, 10) + rect(w + 20, S - 110, 30, 110, C.canD)
    + path(`M${w + 50} ${S - 80} L${w + 120} ${S - 150} L${w + 108} ${S - 160} L${w + 50} ${S - 104} Z`, C.can)
    + group(`rotate(-40 ${w + 124} ${S - 162})`, rect(w + 106, S - 172, 36, 18, C.canD, 4))
    + path(`M${w - 30} ${S - 110} Q${w} ${S - 170} ${w + 40} ${S - 110} H${w + 24} Q${w} ${S - 148} ${w - 14} ${S - 110} Z`, C.canD);
  const svg = fill(C.wall) + rect(0, 520, QS_CANVAS, 60, C.wallD).replace('/>', ' opacity="0.6"/>')
    + seedling + sapling + treeP + can
    + rect(0, S, QS_CANVAS, 20, C.sill) + rect(0, S + 16, QS_CANVAS, 8, C.sillD) + rect(0, S + 24, QS_CANVAS, QS_CANVAS, C.ink);
  return { id: 'personal-growth-3', subject: 'personal-growth', name: 'Three pots on the sill', sky: C.wall, ground: C.ink, svg };
}

// ── BUSINESS ────────────────────────────────────────────────────────────────

/** A desk above the city at dusk: the laptop open on a chart, the lamp on. */
function businessOffice(): QsScene {
  const C = { sky: '#F0CFA8', sun: '#E99A57', far: '#C9A8A0', far2: '#A98C8E', frame: '#3B3430', lit: '#F6D38C', wood: '#7A5A2E', woodL: '#94703F',
    laptop: '#C9CDD0', laptopD: '#9EA4A9', screen: '#243238', up: '#7FC0A6', bar: '#E2A845', lamp: '#2E4A45', lampL: '#3E625B', shade: '#E2A845',
    cup: '#F4EDE0', cupD: '#D2C8B4', coffee: '#5B3A28', ink: '#221E1B' };
  const T = HORIZON - 14;
  // The city through the glass: towers in two distance tones, a few windows lit.
  let city = '', n = 5;
  const tw = [[80, 520, 90], [180, 460, 70], [260, 540, 110], [380, 420, 80], [470, 500, 100], [580, 440, 90], [680, 520, 70], [760, 470, 110], [880, 540, 90], [960, 480, 100]];
  tw.forEach(([x, top, w], i) => {
    city += rect(x, top, w, T - top, i % 2 ? C.far : C.far2);
    for (let y = top + 20; y < T - 20; y += 28) for (let q = 12; q + 12 < w; q += 24) { n = (n * 11 + 7) % 19; if (n < 4) city += rect(x + q, y, 10, 14, C.lit); }
  });
  const glass = fill(C.sky) + circle(640, 520, 80, C.sun) + city
    + rect(0, 380, QS_CANVAS, 14, C.frame) + [360, 720].map((x) => rect(x - 7, 380, 14, T - 380, C.frame)).join('');
  const desk = rect(0, T, QS_CANVAS, 18, C.woodL) + rect(0, T + 18, QS_CANVAS, 14, C.wood);
  // The laptop, open, a small chart on its screen.
  const lx = 520;
  const laptop = poly([lx - 150, T - 190, lx + 150, T - 190, lx + 140, T - 16, lx - 140, T - 16], C.laptopD)
    + poly([lx - 136, T - 178, lx + 136, T - 178, lx + 128, T - 28, lx - 128, T - 28], C.screen)
    + [0, 1, 2, 3, 4].map((i) => rect(lx - 100 + i * 42, T - 60 - [24, 42, 34, 64, 86][i], 26, [24, 42, 34, 64, 86][i], i === 4 ? C.up : C.bar)).join('')
    + poly([lx - 176, T, lx + 176, T, lx + 150, T - 16, lx - 150, T - 16], C.laptop) + rect(lx - 176, T - 4, 352, 4, C.laptopD);
  // A desk lamp, arm angled, shade over the laptop.
  const bx = 820;
  const lamp = rect(bx - 50, T - 14, 100, 14, C.lamp, 6)
    + poly([bx - 6, T - 14, bx + 6, T - 14, bx + 66, T - 150, bx + 54, T - 156], C.lamp)
    + poly([bx + 54, T - 156, bx + 66, T - 150, bx - 2, T - 250, bx - 14, T - 244], C.lampL)
    + group(`rotate(-28 ${bx - 8} ${T - 247})`, path(`M${bx - 40} ${T - 262} H${bx + 24} L${bx + 48} ${T - 206} H${bx - 64} Z`, C.lamp) + rect(bx - 60, T - 208, 104, 8, C.shade, 3));
  // A cup of coffee.
  const cx = 250;
  const cup = path(`M${cx - 44} ${T - 84} H${cx + 44} L${cx + 36} ${T - 6} H${cx - 36} Z`, C.cup) + path(`M${cx + 10} ${T - 84} H${cx + 44} L${cx + 36} ${T - 6} H${cx + 8} Z`, C.cupD)
    + ellipse(cx, T - 84, 44, 9, C.coffee) + path(`M${cx + 40} ${T - 66} q30 0 28 24 q-2 22 -34 22 v-12 q20 0 20 -10 q0 -12 -16 -12 Z`, C.cup)
    + ellipse(cx, T - 4, 56, 7, C.cupD);
  const svg = glass + desk + laptop + lamp + cup + rect(0, T + 32, QS_CANVAS, QS_CANVAS, C.ink);
  return { id: 'business-1', subject: 'business', name: 'The desk above the city', sky: C.sky, ground: C.ink, svg };
}

/** A shop front on opening day: the awning out, the window dressed, the door open. */
function businessShop(): QsScene {
  const C = { sky: '#E7DDCB', brick: '#9C5A40', brickD: '#84493A', mortar: '#B06C50', sill: '#EDE4D2', awning: '#2E5A4E', awningL: '#F4EDDF',
    glass: '#D9E4E2', glassD: '#BCCDCB', shelf: '#7A5A2E', goods: ['#E2A845', '#D0573A', '#4F7A7A', '#EDE4D2'], door: '#2E5A4E', doorD: '#224740',
    sign: '#F4EDDF', signInk: '#2E5A4E', win: '#4A3A34', plant: '#5E7E4E', pot: '#3B3430', ink: '#23201D' };
  const X0 = 150, X1 = 930, TOP = 380;
  // The building: brick, a band of upper windows, a cornice.
  let bricks = '';
  for (let y = TOP + 12; y < 520; y += 22) for (let x = X0 + ((y / 22) % 2 ? 0 : 30); x < X1 - 40; x += 60) bricks += rect(x, y, 46, 4, C.mortar);
  const building = rect(X0, TOP, X1 - X0, HORIZON - TOP, C.brick) + rect(X1 - 90, TOP, 90, HORIZON - TOP, C.brickD) + bricks
    + rect(X0 - 12, TOP - 6, X1 - X0 + 24, 18, C.sill)
    + [260, 440, 620, 800].map((x) => rect(x - 36, 420, 72, 80, C.win) + rect(x - 42, 498, 84, 10, C.sill)).join('');
  // The shop: a deep green fascia, the awning pulled out, a dressed window, a door.
  let stripes = '';
  for (let i = 0; i < 12; i++) stripes += poly([X0 + i * 65, 536, X0 + (i + 1) * 65, 536, X0 + (i + 1) * 65 + 6, 590, X0 + i * 65 + 6, 590], i % 2 ? C.awningL : C.awning);
  let goods = '';
  for (let r = 0; r < 2; r++) for (let i = 0; i < 7; i++) {
    const g = C.goods[(i + r * 2) % 4], x = 214 + i * 58, y = 648 + r * 50;
    goods += (i + r) % 3 === 0 ? circle(x + 18, y - 14, 18, g) : rect(x, y - 36, 38, 36, g, 4);
  }
  const shop = rect(X0 + 20, 520, X1 - X0 - 40, 24, C.awning) + stripes
    + rect(190, 600, 470, HORIZON - 600, C.glass) + poly([190, 600, 300, 600, 190, 720], C.glassD).replace('/>', ' opacity="0.5"/>')
    + rect(200, 650, 450, 8, C.shelf) + rect(200, 700, 450, 8, C.shelf) + goods
    + rect(700, 600, 170, HORIZON - 600, C.doorD) + poly([700, 600, 790, 616, 790, HORIZON, 700, HORIZON], C.door) + circle(778, 690, 6, C.sign)
    + rect(760, 610, 3, 30, C.signInk) + rect(812, 610, 3, 30, C.signInk) + rect(736, 636, 106, 44, C.sign, 5)
    + `<text x="789" y="667" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="26" letter-spacing="3" text-anchor="middle" fill="${C.signInk}">OPEN</text>`;
  // A clipped shrub in a pot at the door.
  const plant = rect(910, 700, 70, 60, C.pot, 4) + circle(945, 660, 48, C.plant) + circle(925, 640, 26, '#6E8A4E');
  const svg = fill(C.sky) + building + shop + plant + ground(C.ink, [0, -2, 0, -4]);
  return { id: 'business-2', subject: 'business', name: 'The shop on opening day', sky: C.sky, ground: C.ink, svg };
}

/** The meeting room: a whiteboard with the plan and the chart, the table set for it. */
function businessBoardroom(): QsScene {
  const C = { wall: '#D8CDBB', wallL: '#E4DACA', board: '#F8F6F0', frame: '#A9A39A', pen: '#2E4A45', red: '#D0573A', notes: ['#F2C66D', '#E9A37E', '#9CC3B4'],
    table: '#7A5A2E', tableL: '#94703F', chair: '#2E4A45', chairD: '#243B37', lampC: '#2E4A45', shade: '#E2A845', ink: '#221E1B' };
  const board = rect(420, 400, 480, 250, C.frame, 6) + rect(430, 410, 460, 230, C.board) + rect(440, 640, 440, 10, C.frame, 3)
    + [0, 1, 2, 3].map((i) => rect(600 + i * 60, 600 - [40, 70, 100, 150][i], 36, [40, 70, 100, 150][i], i === 3 ? C.red : C.pen)).join('')
    + path('M600 560 Q650 540 690 520 T800 440', 'none').replace('fill="none"', `fill="none" stroke="${C.red}" stroke-width="6" stroke-linecap="round"`)
    + poly([800, 430, 812, 452, 788, 448], C.red)
    + [[450, 430], [510, 440], [455, 500], [515, 508]].map(([x, y], i) => rect(x, y, 50, 50, C.notes[i % 3], 2) + rect(x + 8, y + 14, 30, 4, C.pen) + rect(x + 8, y + 26, 22, 4, C.pen)).join('');
  // Two pendant lamps over the table.
  const lampAt = (x: number) => rect(x - 2, 0, 4, 450, C.lampC) + path(`M${x - 44} 470 Q${x} 420 ${x + 44} 470 Z`, C.lampC) + rect(x - 44, 468, 88, 6, C.shade, 3);
  // The table, seen side on, with four chair backs behind it.
  const chairs = [300, 460, 620, 780].map((x) => rect(x - 50, 620, 100, 110, C.chair, 18) + rect(x + 20, 620, 30, 110, C.chairD, 12)).join('');
  const table = rect(200, 700, 700, 22, C.tableL) + rect(200, 722, 700, 14, C.table) + rect(240, 736, 24, 30, C.table) + rect(836, 736, 24, 30, C.table)
    + rect(340, 680, 120, 20, C.board, 2) + rect(620, 686, 70, 14, C.pen, 3) + ellipse(760, 696, 22, 6, C.board);
  const svg = fill(C.wall) + rect(0, 380, QS_CANVAS, 30, C.wallL) + board + lampAt(260) + lampAt(1000) + chairs + table
    + rect(0, HORIZON, QS_CANVAS, QS_CANVAS, C.ink);
  return { id: 'business-3', subject: 'business', name: 'The meeting room', sky: C.wall, ground: C.ink, svg };
}

// ── SCIENCE ─────────────────────────────────────────────────────────────────

/** An observatory on a hill at night, its telescope out, and Saturn over the ridge. */
function scienceObservatory(): QsScene {
  const C = { sky: '#1F3F4A', star: '#EAF0E4', planet: '#E9C98A', planetD: '#C9A460', ring: '#D8B878', hill: '#2B5157', hill2: '#24464B', wall: '#E9E4D8', wallSh: '#B9BDB6',
    dome: '#C9D4D2', domeSh: '#98A8A8', slit: '#15292F', scope: '#E2A845', scopeD: '#B07D2A', win: '#F2C66D', tree: '#2F5F63', treeL: '#3E7474', ground: '#132A30' };
  const cx = 600, base = 700;
  const obs = rect(cx - 120, base - 150, 240, 150, C.wall) + rect(cx + 50, base - 150, 70, 150, C.wallSh)
    + rect(cx - 30, base - 90, 50, 90, C.slit, 25) + rect(cx - 90, base - 120, 34, 34, C.win, 17)
    + path(`M${cx - 136} ${base - 150} A136 130 0 0 1 ${cx + 136} ${base - 150} Z`, C.dome)
    + path(`M${cx + 30} ${base - 276} A136 130 0 0 1 ${cx + 136} ${base - 150} H${cx + 60} Z`, C.domeSh)
    + poly([cx - 18, base - 280, cx + 22, base - 280, cx + 30, base - 152, cx - 26, base - 152], C.slit)
    + group(`rotate(-38 ${cx} ${base - 200})`, rect(cx - 16, base - 330, 32, 150, C.scope, 6) + rect(cx + 4, base - 330, 12, 150, C.scopeD) + rect(cx - 22, base - 340, 44, 22, C.scopeD, 4))
    + rect(cx - 144, base - 156, 288, 10, C.wallSh, 3);
  const saturn = circle(850, 450, 46, C.planet) + path('M806 460 A46 46 0 0 0 894 460 Z', C.planetD)
    + `<ellipse cx="850" cy="452" rx="92" ry="20" fill="none" stroke="${C.ring}" stroke-width="10" transform="rotate(-14 850 452)"/>`
    + path('M806 442 A46 46 0 0 1 894 442 L894 446 A46 46 0 0 0 806 446 Z', C.planet);
  const svg = fill(C.sky) + stars(60, 23, 20, 20, 1060, 640, C.star) + saturn
    + ridge([720, 680, 700, 660, 690, 700, 680], C.hill)
    + obs
    + cypress(360, 720, 130, C.treeL, C.tree) + cypress(400, 724, 90, C.treeL, C.tree) + cypress(840, 720, 110, C.treeL, C.tree)
    + ridge([750, 720, 730, 712, 730, 740, 734], C.hill2)
    + ground(C.ground, [0, -8, -4, -10]);
  return { id: 'science-1', subject: 'science', name: 'The observatory', sky: C.sky, ground: C.ground, svg };
}

/** The laboratory bench: flasks, a rack of tubes, and the microscope. */
function scienceLab(): QsScene {
  const C = { wall: '#DCE7E3', tile: '#CAD9D4', shelf: '#8FA9A5', bottle: ['#4F7A7A', '#B06A4E', '#C99A4A'], glass: '#EEF4F2', glassD: '#C7D8D4',
    teal: '#3E9C92', amber: '#E2A845', coral: '#D9694A', scope: '#2B3A40', scopeL: '#40555D', stage: '#1C262A', bench: '#2F6F73', benchD: '#245659', ink: '#162226' };
  const T = HORIZON - 10;
  let tiles = '';
  for (let y = 400; y < T; y += 46) for (let x = 0; x < QS_CANVAS; x += 64) tiles += rect(x + 2, y + 2, 60, 42, C.tile, 3);
  const shelf = rect(560, 470, 440, 12, C.shelf)
    + [600, 660, 720, 800, 880, 950].map((x, i) => rect(x, 470 - [60, 44, 70, 52, 64, 40][i], 36, [60, 44, 70, 52, 64, 40][i], C.bottle[i % 3], 5)).join('');
  // An Erlenmeyer flask of teal liquid, a round-bottom flask on its ring stand.
  const ex = 240;
  const erl = poly([ex - 14, T - 170, ex + 14, T - 170, ex + 14, T - 120, ex + 74, T, ex - 74, T, ex - 14, T - 120], C.glass)
    + poly([ex - 44, T - 62, ex + 44, T - 62, ex + 74, T, ex - 74, T], C.teal) + rect(ex - 20, T - 178, 40, 12, C.glassD, 3)
    + poly([ex + 4, T - 166, ex + 12, T - 166, ex + 12, T - 118, ex + 4, T - 110], C.glassD);
  const rx = 400;
  const rbf = rect(rx + 60, T - 250, 8, 250, C.scope) + rect(rx + 30, T - 12, 70, 12, C.scope, 3) + rect(rx - 10, T - 156, 80, 6, C.scope)
    + circle(rx, T - 110, 50, C.glass) + path(`M${rx - 46} ${T - 96} A50 50 0 0 0 ${rx + 46} ${T - 96} Z`, C.amber)
    + rect(rx - 12, T - 200, 24, 50, C.glass) + rect(rx - 16, T - 206, 32, 10, C.glassD, 3);
  // A rack of test tubes.
  const tx = 540;
  const rack = [0, 1, 2, 3].map((i) => rect(tx + i * 30, T - 120, 18, 110, C.glass, 9) + rect(tx + i * 30, T - 60 + i * 8, 18, 50 - i * 8, [C.coral, C.teal, C.amber, C.coral][i], 9)).join('')
    + rect(tx - 14, T - 80, 136, 12, C.scopeL, 3) + rect(tx - 14, T - 12, 136, 12, C.scopeL, 3) + rect(tx - 14, T - 80, 8, 80, C.scopeL) + rect(tx + 114, T - 80, 8, 80, C.scopeL);
  // The microscope: a horseshoe foot, a C-arm, the stage, the turret and the tube.
  const mx = 820;
  const scope = path(`M${mx - 90} ${T} Q${mx - 90} ${T - 34} ${mx - 40} ${T - 34} H${mx + 60} Q${mx + 96} ${T - 34} ${mx + 96} ${T} Z`, C.scope)
    + path(`M${mx + 40} ${T - 34} Q${mx + 110} ${T - 120} ${mx + 40} ${T - 250} L${mx + 10} ${T - 234} Q${mx + 66} ${T - 130} ${mx + 10} ${T - 40} Z`, C.scopeL)
    + rect(mx - 70, T - 120, 130, 14, C.stage, 3) + rect(mx - 20, T - 126, 50, 6, C.glass)
    + circle(mx + 60, T - 150, 20, C.stage) + circle(mx + 60, T - 150, 8, C.scopeL)
    + group(`rotate(22 ${mx - 6} ${T - 190})`, rect(mx - 24, T - 290, 38, 110, C.scope, 4) + rect(mx - 30, T - 304, 50, 20, C.stage, 4) + rect(mx - 18, T - 184, 26, 40, C.stage, 3));
  const svg = fill(C.wall) + tiles + shelf + erl + rbf + rack + scope
    + rect(0, T, QS_CANVAS, 20, C.bench) + rect(0, T + 20, QS_CANVAS, QS_CANVAS, C.ink);
  return { id: 'science-2', subject: 'science', name: 'The laboratory bench', sky: C.wall, ground: C.ink, svg };
}

/** A satellite over the curve of the Earth, the moon beyond. */
function scienceOrbit(): QsScene {
  const C = { space: '#12222E', star: '#EAF0E4', moon: '#D9D6CC', moonD: '#B7B3A8', air: '#5FA8A8', sea: '#1F4A5C', land: '#3E7358', cloud: '#DDE9E6',
    foil: '#E2A845', foilD: '#B07D2A', panel: '#2C4F7A', panelL: '#3E6699', grid: '#1C3656', boom: '#C9CDD0', dish: '#EDEFEA', ground: '#18394A' };
  const R = 1500, CY = HORIZON - 70 + R;
  const earth = circle(540, CY, R + 14, C.air) + circle(540, CY, R, C.sea)
    + `<defs><clipPath id="qs-sci-earth"><circle cx="540" cy="${CY}" r="${R}"/></clipPath></defs>`
    + `<g clip-path="url(#qs-sci-earth)">${ellipse(230, 736, 210, 40, C.land)}${ellipse(400, 712, 70, 14, C.land)}${ellipse(860, 732, 200, 38, C.land)}`
    + `${cloud(300, 712, 0.4, C.cloud)}${cloud(800, 716, 0.3, C.cloud)}${rect(0, HORIZON - 4, QS_CANVAS, 400, C.ground)}</g>`;
  const moon = circle(260, 470, 44, C.moon) + path('M260 426 A44 44 0 0 1 260 514 A30 44 0 0 0 260 426 Z', C.moonD);
  // The satellite: a gold-foil body, a dish, and two panel wings on a boom.
  const sx = 660, sy = 540;
  const wing = (x0: number) => {
    let s = rect(x0, sy - 40, 150, 80, C.panel);
    for (let i = 1; i < 5; i++) s += rect(x0 + i * 30 - 2, sy - 40, 4, 80, C.grid);
    return s + rect(x0, sy - 2, 150, 4, C.grid) + rect(x0, sy - 40, 150, 12, C.panelL);
  };
  const sat = rect(sx - 230, sy - 3, 460, 6, C.boom) + wing(sx - 220) + wing(sx + 70)
    + rect(sx - 44, sy - 56, 88, 112, C.foil, 6) + rect(sx + 10, sy - 56, 34, 112, C.foilD, 4)
    + rect(sx - 3, sy - 96, 6, 42, C.boom) + path(`M${sx - 38} ${sy - 96} Q${sx} ${sy - 70} ${sx + 38} ${sy - 96} Z`, C.dish);
  // The night side is the card's ground: it runs flat under the words, across the
  // limb's own curve, so nothing of the atmosphere reaches the type.
  const svg = fill(C.space) + stars(70, 41, 10, 10, 1070, 680, C.star) + moon + earth + sat + rect(0, HORIZON - 4, QS_CANVAS, QS_CANVAS, C.ground);
  return { id: 'science-3', subject: 'science', name: 'A satellite over the Earth', sky: C.space, ground: C.ground, svg };
}

// ── HISTORY ─────────────────────────────────────────────────────────────────

/** The pyramids at Giza in the afternoon, a palm, and a camel crossing the sand. */
function historyPyramids(): QsScene {
  const C = { sky: '#F3DEB6', sun: '#EFA24A', far: '#E6C28A', lit: '#E8C58E', shade: '#B98450', dune: '#D9A868', dune2: '#C68E52',
    palm: '#5E6E3E', palmD: '#4A5831', trunk: '#7A5A3A', camel: '#8E5646', camelD: '#74443A', ink: '#2B2320', bird: '#74443A' };
  const pyr = (x: number, b: number, h: number) => poly([x - h * 0.95, b, x, b - h, x + h * 0.95, b], C.lit) + poly([x, b - h, x + h * 0.95, b, x + h * 0.25, b], C.shade);
  // The dromedary, after a photograph: legs longer than the body is deep, one hump,
  // the neck dipping forward and rising to a head held level.
  const cx = 800, cb = HORIZON - 4;
  const camel = ellipse(cx, cb - 120, 70, 34, C.camel) + path(`M${cx - 44} ${cb - 138} Q${cx} ${cb - 214} ${cx + 44} ${cb - 138} Z`, C.camel)
    + path(`M${cx + 56} ${cb - 140} Q${cx + 96} ${cb - 110} ${cx + 110} ${cb - 150} Q${cx + 116} ${cb - 186} ${cx + 124} ${cb - 204} L${cx + 142} ${cb - 198} Q${cx + 132} ${cb - 170} ${cx + 128} ${cb - 140} Q${cx + 112} ${cb - 90} ${cx + 60} ${cb - 104} Z`, C.camel)
    + path(`M${cx + 116} ${cb - 206} Q${cx + 136} ${cb - 216} ${cx + 160} ${cb - 204} L${cx + 158} ${cb - 192} L${cx + 124} ${cb - 188} Z`, C.camel)
    + [[-52, 1], [-30, 0], [34, 1], [54, 0]].map(([dx, d]) => poly([cx + dx - 6, cb - 100, cx + dx + 6, cb - 100, cx + dx + 5 + (dx < 0 ? -4 : 4), cb, cx + dx - 5 + (dx < 0 ? -4 : 4), cb], d ? C.camel : C.camelD)).join('')
    + path(`M${cx - 68} ${cb - 126} Q${cx - 84} ${cb - 110} ${cx - 80} ${cb - 86} L${cx - 74} ${cb - 88} Q${cx - 76} ${cb - 108} ${cx - 64} ${cb - 118} Z`, C.camelD);
  // A date palm on the left.
  const px = 230, pb = HORIZON - 10;
  const palm = path(`M${px - 8} ${pb} Q${px - 20} ${pb - 120} ${px + 14} ${pb - 230} L${px + 26} ${pb - 226} Q${px + 2} ${pb - 120} ${px + 12} ${pb} Z`, C.trunk)
    + [[-70, 20], [-40, -30], [0, -40], [40, -24], [72, 24], [-10, 30]].map(([dx, dy], i) =>
      path(`M${px + 20} ${pb - 228} Q${px + 20 + dx * 0.6} ${pb - 270 + dy} ${px + 20 + dx * 1.4} ${pb - 220 + dy + 30} Q${px + 20 + dx * 0.7} ${pb - 244 + dy} ${px + 20} ${pb - 222} Z`, i % 2 ? C.palm : C.palmD)).join('');
  const svg = fill(C.sky) + circle(360, 480, 70, C.sun) + bird(600, 440, 1, C.bird) + bird(640, 466, 0.7, C.bird)
    + ridge([700, 690, 700, 680, 696, 690, 700], C.far)
    + pyr(520, 704, 250) + pyr(740, 708, 190) + pyr(900, 712, 110)
    + ridge([730, 716, 724, 740, 720, 712, 730], C.dune)
    + palm + camel
    + ridge([770, 750, 756, 748, 758, 752, 748], C.dune2)
    + ground(C.ink, [0, -6, -2, -8]);
  return { id: 'history-1', subject: 'history', name: 'The pyramids at Giza', sky: C.sky, ground: C.ink, svg };
}

/** A castle on its hill in the late afternoon, banners out. */
function historyCastle(): QsScene {
  const C = { sky: '#E8DCC6', cloud: '#F4EEE2', far: '#B8BFA0', hill: '#8C9870', hill2: '#6E7A52', stone: '#C9B79E', stoneSh: '#9C8A74', dark: '#4A3E36',
    roof: '#8E5646', roofD: '#72443A', flag: '#C9543E', gate: '#3A2F29', ink: '#28231F' };
  const cren = (x: number, y: number, w: number) => { let s = ''; for (let i = 0; i < w / 20; i += 2) s += rect(x + i * 20, y - 16, 20, 16, C.stone); return s; };
  const tower = (x: number, top: number, w: number, roof: boolean) => rect(x - w / 2, top, w, 700 - top, C.stone) + rect(x + w * 0.2, top, w * 0.3, 700 - top, C.stoneSh)
    + (roof ? poly([x - w / 2 - 8, top, x, top - w * 1.2, x + w / 2 + 8, top], C.roof) + poly([x, top - w * 1.2, x + w / 2 + 8, top, x + 6, top], C.roofD)
      + rect(x - 2, top - w * 1.2 - 44, 4, 44, C.dark) + path(`M${x + 2} ${top - w * 1.2 - 42} h40 l-10 12 l10 12 h-40 Z`, C.flag)
      : cren(x - w / 2, top, w + 20))
    + rect(x - 8, top + 30, 16, 30, C.dark, 8);
  const castle = rect(430, 560, 420, 140, C.stone) + cren(430, 560, 420) + rect(780, 560, 70, 140, C.stoneSh)
    + path('M605 700 V640 Q640 604 675 640 V700 Z', C.gate)
    + tower(430, 470, 90, true) + tower(640, 420, 100, true) + tower(850, 480, 90, true) + tower(540, 520, 60, false) + tower(750, 520, 60, false);
  const svg = fill(C.sky) + cloud(240, 430, 0.9, C.cloud) + cloud(930, 400, 0.6, C.cloud)
    + ridge([660, 620, 640, 610, 630, 650, 640], C.far)
    + path('M300 780 Q420 690 640 690 Q860 690 980 780 Z', C.hill) + group('translate(640 700) scale(0.84) translate(-640 -700)', castle)
    + path('M300 780 Q420 700 520 700 L620 700 Q470 720 380 780 Z', C.hill2)
    + ridge([760, 730, 744, 752, 740, 728, 746], C.hill2)
    + ground(C.ink, [0, -8, -2, -10]);
  return { id: 'history-2', subject: 'history', name: 'The castle on the hill', sky: C.sky, ground: C.ink, svg };
}

/** An old chart on the table, seen from above: the coast, the route, a compass and a quill. */
function historyMap(): QsScene {
  const C = { table: '#5A3A2A', tableD: '#4A2F22', grain: '#654434', paper: '#EAD9B6', paperD: '#D6C096', sea: '#A9C3C0', land: '#D8C08E', coast: '#7A5A3A',
    route: '#B8453B', rose: '#8E5646', brass: '#D9A441', brassD: '#A87A2E', needle: '#B8453B', quill: '#F4EEE2', quillD: '#CFC6B4', ink: '#241A15' };
  let grain = '';
  for (let y = 400; y < 780; y += 34) grain += rect(0, y, QS_CANVAS, 3, C.grain);
  // The map, turned a few degrees, its corners curling.
  const map = group('rotate(-4 560 580)',
    rect(210, 400, 700, 340, C.paperD, 4) + rect(210, 400, 700, 330, C.paper, 4) + rect(236, 424, 648, 282, C.sea)
    + path('M236 470 Q300 440 360 480 Q420 520 400 580 Q380 640 440 706 H236 Z', C.land)
    + path('M620 424 Q600 480 660 520 Q720 560 700 620 Q690 670 760 706 H884 V424 Z', C.land)
    + path('M520 600 Q550 580 580 604 Q560 630 528 620 Z', C.land)
    + path('M330 560 Q420 500 520 560 T700 520 T820 460', 'none').replace('fill="none"', `fill="none" stroke="${C.route}" stroke-width="5" stroke-dasharray="14 10" stroke-linecap="round"`)
    + path('M810 450 l18 -8 l-6 18 Z', C.route)
    + group('translate(470 470)', poly([0, -44, 8, -8, 0, 0, -8, -8], C.rose) + poly([0, 44, 8, 8, 0, 0, -8, 8], C.coast) + poly([-44, 0, -8, -8, 0, 0, -8, 8], C.coast) + poly([44, 0, 8, -8, 0, 0, 8, 8], C.coast) + circle(0, 0, 5, C.paper)));
  // A brass compass on the map's right, a quill across the left, a candle stub.
  const compass = circle(860, 650, 64, C.brassD) + circle(856, 646, 60, C.brass) + circle(856, 646, 46, C.paper)
    + poly([856, 606, 864, 646, 856, 686, 848, 646], C.coast) + poly([856, 606, 864, 646, 848, 646], C.needle) + circle(856, 646, 5, C.brassD) + rect(848, 574, 16, 14, C.brassD, 3);
  const quill = group('rotate(-32 300 690)', path('M150 690 Q260 650 460 686 Q260 706 150 690 Z', C.quill) + path('M150 690 Q260 690 460 686 Q260 706 150 690 Z', C.quillD) + rect(440, 684, 60, 4, C.ink, 2));
  const svg = fill(C.table) + grain + map + compass + quill + rect(0, HORIZON + 6, QS_CANVAS, QS_CANVAS, C.tableD);
  return { id: 'history-3', subject: 'history', name: 'The old chart', sky: C.table, ground: C.tableD, svg };
}

/** Every scene, in rotation order within its subject. */
export const QS_SCENES: readonly QsScene[] = [
  philosophyAcropolis(),
  philosophyCave(),
  philosophyStudy(),
  economicsHarbour(),
  economicsMarket(),
  economicsExchange(),
  psychologyMind(),
  psychologyCouch(),
  psychologyDoors(),
  growthSummit(),
  growthMorning(),
  growthPots(),
  businessOffice(),
  businessShop(),
  businessBoardroom(),
  scienceObservatory(),
  scienceLab(),
  scienceOrbit(),
  historyPyramids(),
  historyCastle(),
  historyMap(),
];

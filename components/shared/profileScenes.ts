// ─────────────────────────────────────────────────────────────────────────────
// THE PROFILE PICTURES — ten drawn places (2026-10-01).
//
// The reader's picture fills the top of Profile, the circle of their avatar and
// the masthead on Home. It used to be ten engravings and photographs, the last
// photographs left in the app once Quick Start and the subject cards were drawn.
// The owner: "I no longer want that background image or those background images.
// I want created ones that resemble the art style of the app … the biggest
// priority is that images do not look AI created, so always look for references."
//
// So these are drawn in the Quick Start's editorial style (quickStartScenes.ts),
// each place built from a photograph looked at first (`npm run ref`): the
// lighthouse's white tapered tower under a dark lantern room and a red cap, the
// bridge's semicircular arch whose reflection closes the circle, the cottage's
// chimneys standing on its GABLE ends, a horn peak that is lopsided rather than a
// cone, ranges that pale with distance.
//
//   · FLAT FILLS, NO OUTLINES; two tones an object, the light from the top left.
//   · DEPTH BY LAYERS — far, middle, near — and a small palette a place.
//   · NO ROUND GLOWS, no sparkles: a star is a dot, a light beam a flat wedge.
//   · EVERY PLACE STANDS ON A HORIZON AT y = HORIZON, and below it a DARK GROUND.
//     The reader's name, the Home wordmark and the picker's label sit on that
//     ground, so no word needs a scrim and none lands on an object.
//
// ── THE GEOMETRY ─────────────────────────────────────────────────────────────
//
// A place is a 1200 × 720 canvas: sky and objects down to the horizon at 600,
// then 120 units of ground for the crest and an edge rock or two. Below that the
// screen paints the scene's `ground` colour, so a box of any height is filled.
// `sceneLayout` scales a place to a box's WIDTH (or more, if the horizon must sit
// lower than the width allows), so every box shows the full height down from the
// horizon it can, and:
//
//   · Home's masthead shows only about y 290…600, so EVERYTHING THAT MATTERS
//     stands in that band (SAFE_TOP); higher is sky that loses nothing cropped;
//   · the Profile header crops up to SIDE off each edge;
//   · nothing stands on the ground in the middle third, where the words go.
//
// ONE IMPORT, the geometry beside it, which has none: `npm run make:profile-art` loads
// both in plain Node and draws every place to a PNG.
// ─────────────────────────────────────────────────────────────────────────────

import { PS_W, PS_H, PS_HORIZON } from './profileSceneGeometry';

export { PS_W, PS_H, PS_HORIZON };

export interface ProfileScene {
  /** The id stored on the reader (`profileBackground`). Frozen: a renamed id resets every reader. */
  id: string;
  /** Shown under the swatch in the picker. */
  name: string;
  /** The top of the sky, for a box that shows past the picture's top. */
  sky: string;
  /** The dark ground the words stand on, and the colour under the picture. */
  ground: string;
  /** What the avatar circle is centred on, in canvas units. */
  focus: { x: number; y: number };
  /** The picture, as the inside of a 1200 × 720 <svg>. */
  svg: string;
}

// ── THE KIT ─────────────────────────────────────────────────────────────────

const f = (n: number) => Math.round(n * 10) / 10;
const op_ = (op: number) => (op < 1 ? ` opacity="${op}"` : '');
const rect = (x: number, y: number, w: number, h: number, fill: string, rx = 0, op = 1) =>
  `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}"${rx ? ` rx="${f(rx)}"` : ''} fill="${fill}"${op_(op)}/>`;
const circle = (x: number, y: number, r: number, fill: string, op = 1) =>
  `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${fill}"${op_(op)}/>`;
const ellipse = (x: number, y: number, rx: number, ry: number, fill: string, op = 1) =>
  `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(ry)}" fill="${fill}"${op_(op)}/>`;
const path = (d: string, fill: string, op = 1) => `<path d="${d}" fill="${fill}"${op_(op)}/>`;
const line = (x1: number, y1: number, x2: number, y2: number, stroke: string, w: number, op = 1) =>
  `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round"${op_(op)}/>`;
function poly(pts: number[], fill: string, op = 1) {
  let d = '';
  for (let i = 0; i < pts.length; i += 2) d += `${i ? 'L' : 'M'}${f(pts[i])} ${f(pts[i + 1])} `;
  return path(`${d}Z`, fill, op);
}
const group = (tr: string, inner: string) => `<g transform="${tr}">${inner}</g>`;
const sky = (c: string) => rect(0, 0, PS_W, PS_H, c);
/** A flat band of sky from y0 to y1: the poster's way of shading a sky. */
const band = (y0: number, y1: number, c: string) => rect(0, y0, PS_W, y1 - y0, c);

/** A rolling ridge across the width, closed to the bottom: crest heights at even x. */
function ridge(pts: number[], color: string): string {
  const n = pts.length - 1;
  const dx = PS_W / n;
  let d = `M0 ${f(pts[0])}`;
  for (let i = 0; i < n; i++) {
    const x0 = i * dx, x1 = (i + 1) * dx;
    d += ` Q${f((x0 + x1) / 2)} ${f((pts[i] + pts[i + 1]) / 2 + (i % 2 ? 7 : -7))} ${f(x1)} ${f(pts[i + 1])}`;
  }
  return path(`${d} V${PS_H} H0 Z`, color);
}

/** A jagged ridge of straight segments, for a mountain line: [x, y, x, y, …]. */
function jag(pts: number[], color: string): string {
  let d = `M0 ${PS_H} L${f(pts[0])} ${f(pts[1])}`;
  for (let i = 2; i < pts.length; i += 2) d += ` L${f(pts[i])} ${f(pts[i + 1])}`;
  return path(`${d} L${PS_W} ${PS_H} Z`, color);
}

/** The dark ground the words stand on, with a soft crest at the horizon. */
const ground = (color: string, lift = [0, -10, -3, -12, -2, -8, 0]) =>
  ridge(lift.map((l) => PS_HORIZON + l), color);

/** A flat cloud: a rounded base with three lobes. */
const cloud = (x: number, y: number, s: number, color: string) =>
  group(`translate(${f(x)} ${f(y)}) scale(${s})`,
    rect(-100, 0, 200, 36, color, 18) + circle(-44, 6, 38, color) + circle(12, -8, 52, color) + circle(64, 10, 30, color));

/** A conifer: three stacked tiers, its right half in shade. */
function pine(x: number, base: number, h: number, color: string, shade: string): string {
  const w = h * 0.42;
  let s = rect(x - h * 0.025, base - h * 0.12, h * 0.05, h * 0.12, shade);
  for (let i = 0; i < 3; i++) {
    const top = base - h + i * h * 0.24;
    const bot = base - h * 0.1 - (2 - i) * h * 0.2;
    const hw = w * (0.55 + i * 0.22);
    s += poly([x, top, x - hw, bot, x + hw, bot], color);
    s += poly([x, top, x, bot, x + hw, bot], shade);
  }
  return s;
}

/** A broadleaf tree: ONE scalloped mass on a trunk a quarter of its height, shade low right. */
function tree(x: number, base: number, r: number, leaf: string, shade: string, trunk: string): string {
  const lobes = [[-0.55, 0.15, 0.6], [0.5, 0.18, 0.62], [0, -0.35, 0.72], [-0.2, 0.3, 0.7], [0.25, 0.32, 0.66]];
  const cy = base - r * 1.45;
  let s = rect(x - r * 0.09, cy + r * 0.3, r * 0.18, base - cy - r * 0.3, trunk);
  for (const [dx, dy, k] of lobes) s += circle(x + dx * r + r * 0.12, cy + dy * r + r * 0.12, k * r, shade);
  for (const [dx, dy, k] of lobes) s += circle(x + dx * r - r * 0.04, cy + dy * r - r * 0.05, k * r * 0.94, leaf);
  return s;
}

/** A distant bird: two shallow wing curves. */
const bird = (x: number, y: number, s: number, c: string) =>
  path(`M${f(x - 16 * s)} ${f(y)} Q${f(x - 8 * s)} ${f(y - 8 * s)} ${f(x)} ${f(y + 2 * s)} Q${f(x + 8 * s)} ${f(y - 8 * s)} ${f(x + 16 * s)} ${f(y)} Q${f(x + 8 * s)} ${f(y - 3 * s)} ${f(x)} ${f(y + 6 * s)} Q${f(x - 8 * s)} ${f(y - 3 * s)} ${f(x - 16 * s)} ${f(y)} Z`, c);

/** Short horizontal glints on water. */
function glints(list: number[][], c: string, op = 1): string {
  return list.map(([x, y, w]) => rect(x - w / 2, y, w, 3.5, c, 1.75, op)).join('');
}

/** Stars as dots of a few sizes, from a fixed list so every render is the same. */
function stars(list: number[][], c: string): string {
  return list.map(([x, y, r]) => circle(x, y, r, c, r > 2.6 ? 0.95 : 0.7)).join('');
}

// ── THE PLACES ──────────────────────────────────────────────────────────────

/** OPEN SEA — the default: a sailboat off a wooded island on a calm afternoon. */
function openSea(): string {
  let s = sky('#BBD6D3') + band(250, 440, '#CDE2DD');
  s += circle(905, 330, 62, '#F7F0DE');
  s += cloud(260, 210, 1.15, '#EAF2EE') + cloud(1010, 150, 0.85, '#DDEAE6') + cloud(640, 330, 0.62, '#EAF2EE');
  s += bird(520, 250, 1.1, '#3C5D63') + bird(570, 272, 0.8, '#3C5D63');
  // The sea, its far edge a paler band where it meets the sky.
  s += rect(0, 440, PS_W, 160, '#3D7C86') + rect(0, 440, PS_W, 16, '#5E98A0');
  // The sun's road on the water, narrowing as it nears.
  s += glints([[905, 462, 110], [905, 478, 86], [900, 496, 70], [910, 516, 52], [902, 538, 40], [906, 562, 30]], '#F2EAD5', 0.75);
  s += glints([[160, 500, 60], [300, 532, 44], [470, 566, 70], [640, 488, 40], [1080, 520, 56], [1130, 572, 40]], '#79B0B4');
  // The island: one long wooded hill, its far side in shade.
  s += path('M70 452 Q150 384 250 372 Q330 360 410 398 Q450 418 480 452 Z', '#56735B');
  s += path('M300 366 Q360 372 410 398 Q450 418 480 452 L330 452 Z', '#46604C');
  for (const [x, h] of [[170, 52], [205, 70], [240, 62], [276, 78], [312, 58]]) s += pine(x, 392 + (x - 240) * 0.04 + (x > 290 ? 8 : 0), h, '#355040', '#2B4334');
  s += rect(70, 452, 410, 6, '#2E5A62', 0, 0.5);
  // The boat: the rig taller than the hull is long, as every plan draws it.
  const bx = 760, wl = 524;
  s += rect(bx + 12, wl - 214, 6, 216, '#2B3A44');
  s += poly([bx + 20, wl - 204, bx + 20, wl - 14, bx + 112, wl - 14], '#F4EFE3');
  s += poly([bx + 20, wl - 204, bx + 20, wl - 14, bx + 46, wl - 14], '#DCD5C6');
  s += poly([bx + 10, wl - 196, bx + 10, wl - 18, bx - 62, wl - 18], '#E6E0D2');
  s += poly([bx - 86, wl - 8, bx + 128, wl - 8, bx + 104, wl + 22, bx - 64, wl + 22], '#2B3A44');
  s += rect(bx - 80, wl - 8, 204, 6, '#B5473C');
  s += rect(bx - 64, wl + 26, 168, 5, '#24515A', 2.5, 0.6) + rect(bx - 30, wl + 40, 110, 4, '#24515A', 2, 0.45);
  // The ground: a dark shore, and a rock at each edge.
  s += ground('#1E2F35');
  s += path('M0 560 Q60 548 120 566 L150 610 L0 610 Z', '#2A4047') + path('M1200 548 Q1130 540 1080 566 L1050 612 L1200 612 Z', '#2A4047');
  return s;
}

/** MOONLIT LAKE — a crescent moon over still water, a lit cabin, the pines. */
function moonlitLake(): string {
  let s = sky('#1B2741') + band(300, 470, '#22324F');
  s += stars([[90, 70, 3], [210, 140, 2], [330, 60, 2.4], [470, 120, 3.2], [560, 40, 2], [690, 160, 2.2], [760, 70, 3], [990, 60, 2.2],
    [1080, 150, 3], [1150, 50, 2], [400, 230, 2], [140, 250, 2.6], [620, 260, 2], [1110, 260, 2.2], [880, 200, 2]], '#E9E4D3');
  // The crescent: the lit disc with a second disc of sky across it.
  s += '<mask id="crescent"><rect width="1200" height="720" fill="#fff"/><circle cx="856" cy="344" r="48" fill="#000"/></mask>';
  s += '<circle cx="830" cy="360" r="54" fill="#F1E9D2" mask="url(#crescent)"/>';
  // Far mountains, then the far shore.
  s += jag([0, 430, 120, 392, 230, 418, 360, 360, 470, 404, 560, 378, 700, 420, 820, 386, 930, 410, 1050, 372, 1200, 410], '#33466B');
  s += jag([0, 452, 140, 436, 260, 448, 420, 430, 600, 452, 760, 440, 900, 450, 1060, 432, 1200, 448], '#273858');
  s += rect(0, 466, PS_W, 134, '#2A3D61') + rect(0, 462, PS_W, 6, '#1B273F');
  // The moon's road on the water.
  s += glints([[832, 482, 70], [828, 500, 56], [836, 520, 46], [830, 542, 36], [834, 566, 28], [830, 588, 20]], '#F1E9D2', 0.6);
  // The cabin on the far shore, and its window in the water.
  s += rect(560, 432, 70, 32, '#3A4A6C') + poly([552, 434, 595, 410, 638, 434], '#1A243A') + rect(580, 442, 16, 14, '#F4B95A');
  s += glints([[588, 474, 18], [588, 484, 12]], '#F4B95A', 0.6);
  // The near pines, a dark wall on the left.
  for (const [x, h] of [[30, 230], [96, 190], [150, 250], [214, 170], [262, 136]]) s += pine(x, 612, h, '#131C30', '#0E1525');
  s += pine(1160, 612, 180, '#131C30', '#0E1525') + pine(1110, 612, 120, '#131C30', '#0E1525');
  s += ground('#101827');
  return s;
}

/** BREAK IN THE CLOUDS — the sun behind a cloud bank, its rays on the fields. */
function breakInClouds(): string {
  let s = sky('#93ABBC') + band(330, 470, '#A9BDC9');
  // The rays: flat wedges fanning down from the sun to the fields.
  for (const [a, b] of [[300, 380], [450, 520], [610, 690], [780, 860], [940, 1010]]) s += poly([620, 260, a, 600, b, 600], '#FFF3DD', 0.2);
  s += circle(620, 260, 58, '#FFF1D6');
  // The cloud bank, darker below and lit along the top where the sun is behind it.
  s += cloud(260, 150, 1.5, '#7E93A3') + cloud(1000, 120, 1.35, '#7A8FA0');
  s += cloud(470, 268, 1.25, '#71879A') + cloud(800, 262, 1.3, '#6E8497');
  s += cloud(640, 306, 0.85, '#8A9EAD');
  // The fields: far, middle and near, each a flat layer.
  s += ridge([470, 458, 466, 452, 460, 468, 456, 462, 470], '#8FA778');
  s += ridge([505, 498, 508, 494, 502, 510, 500, 506, 512], '#749258');
  for (const [x, y, w] of [[140, 520, 180], [460, 524, 140], [760, 520, 200], [1040, 526, 150]]) s += rect(x, y, w, 5, '#4E6B3D', 2.5);
  s += ridge([548, 542, 552, 540, 548, 556, 544, 550, 556], '#5C7A47');
  // The farmhouse and its barn roof.
  s += rect(300, 470, 92, 42, '#ECE5D5') + rect(362, 470, 30, 42, '#D0C6B2');
  s += poly([290, 474, 346, 440, 402, 474], '#8A3F33') + poly([346, 440, 402, 474, 346, 474], '#73342A');
  s += rect(316, 484, 14, 14, '#4B4237') + rect(340, 490, 16, 22, '#4B4237');
  s += tree(880, 512, 44, '#4F6E3E', '#3E5831', '#3B3128');
  s += tree(196, 506, 26, '#56763F', '#435E33', '#3B3128');
  s += ground('#21301E');
  return s;
}

/** THE PEAK — one lopsided horn of rock and snow at dawn, the pines below it. */
function thePeak(): string {
  let s = sky('#C6B4CE') + band(260, 420, '#DCC2CB') + band(420, 600, '#EFD3C8');
  s += circle(930, 420, 66, '#F7E3CF');
  s += bird(250, 210, 1, '#5D5875') + bird(296, 232, 0.75, '#5D5875');
  // Two lower peaks behind.
  s += jag([0, 520, 120, 430, 210, 470, 300, 380, 420, 500, 760, 520, 880, 400, 960, 440, 1060, 360, 1200, 470], '#8A84A0');
  // The horn: steep on its left, a long shoulder on its right — never a cone.
  s += poly([180, 560, 380, 410, 470, 362, 548, 292, 600, 228, 640, 268, 700, 318, 800, 380, 900, 452, 1040, 560], '#5B5673');
  // The lit face, west of the summit ridge.
  s += poly([600, 228, 548, 292, 470, 362, 380, 410, 180, 560, 560, 560, 590, 410], '#8C86A4');
  // Snow on the upper faces, and in two gullies.
  s += poly([600, 228, 556, 284, 578, 296, 596, 278, 610, 300, 632, 286, 650, 300, 640, 268], '#F6F2F4');
  s += poly([600, 228, 640, 268, 650, 300, 632, 286, 612, 300, 604, 270], '#D7D1E1');
  s += poly([520, 318, 470, 366, 500, 372, 512, 346, 532, 358], '#F6F2F4');
  s += poly([700, 318, 760, 360, 742, 370, 716, 346, 700, 352], '#D7D1E1');
  s += poly([430, 388, 404, 408, 422, 414, 436, 400], '#F6F2F4');
  // Foothills, then a forest edge.
  s += ridge([548, 532, 544, 528, 540, 552, 536, 544, 550], '#424C66');
  for (let i = 0; i < 26; i++) {
    const x = 10 + i * 47 + ((i * 37) % 19);
    if (x > 430 && x < 770) continue;
    s += pine(x, 612, 70 + ((i * 53) % 60), '#223039', '#19242C');
  }
  s += ground('#151C23');
  return s;
}

/** THE RANGE — ridge after ridge, paler as they go, and a fire lookout on the near one. */
function theRange(): string {
  let s = sky('#DDE5EA') + band(380, 600, '#E8ECEC');
  s += circle(790, 360, 60, '#F8F3E8');
  s += bird(380, 250, 1.1, '#6A7F96') + bird(426, 274, 0.8, '#6A7F96') + bird(460, 236, 0.7, '#6A7F96');
  s += jag([0, 404, 110, 370, 200, 392, 330, 340, 450, 384, 560, 356, 690, 396, 820, 352, 950, 388, 1080, 346, 1200, 380], '#C2CDD7');
  s += jag([0, 440, 140, 404, 250, 430, 390, 392, 520, 438, 660, 400, 780, 432, 930, 398, 1050, 430, 1200, 404], '#A1B2C3');
  s += jag([0, 482, 160, 446, 300, 474, 430, 440, 580, 478, 720, 446, 860, 472, 1000, 442, 1120, 470, 1200, 458], '#7F94AA');
  s += ridge([520, 508, 524, 500, 516, 530, 506, 518, 512], '#5E748F');
  // The lookout: four legs and a cab, its window lit.
  const lx = 300, lb = 512;
  s += line(lx - 18, lb, lx - 8, lb - 70, '#2E3E52', 4) + line(lx + 18, lb, lx + 8, lb - 70, '#2E3E52', 4);
  s += line(lx - 14, lb - 20, lx + 14, lb - 46, '#2E3E52', 2.5) + line(lx + 14, lb - 20, lx - 14, lb - 46, '#2E3E52', 2.5);
  s += rect(lx - 20, lb - 98, 40, 28, '#3B4D63') + poly([lx - 26, lb - 96, lx, lb - 114, lx + 26, lb - 96], '#24323F');
  s += rect(lx - 12, lb - 90, 24, 11, '#F2B45E');
  s += ridge([566, 556, 562, 550, 558, 566, 552, 560, 558], '#41586F');
  for (const [x, h] of [[60, 80], [104, 104], [148, 70], [1060, 96], [1110, 76], [1150, 112]]) s += pine(x, 600, h, '#2E4256', '#243548');
  s += ground('#1C2937');
  return s;
}

/** WEATHER — rain sweeping a field of round bales, light breaking far off. */
function weather(): string {
  let s = sky('#A7B6AE') + band(360, 600, '#B8C5BC');
  // The light breaking through on the right: one flat wedge.
  s += poly([1040, 220, 860, 600, 1200, 600, 1200, 300], '#F4F2DF', 0.28);
  // Rain: slanted strokes under each cloud.
  for (let i = 0; i < 22; i++) {
    const x = 120 + i * 30 + ((i * 17) % 13);
    s += line(x, 250 + ((i * 29) % 40), x - 46, 470, '#E6EDE8', 3, 0.5);
  }
  for (let i = 0; i < 10; i++) {
    const x = 760 + i * 30;
    s += line(x, 230 + ((i * 23) % 30), x - 40, 430, '#E6EDE8', 3, 0.45);
  }
  s += cloud(280, 210, 1.9, '#788A80') + cloud(560, 250, 1.3, '#6E8077') + cloud(860, 170, 1.5, '#7D8F85');
  // The fields, the far one lit where the light lands.
  s += ridge([468, 460, 466, 456, 462, 470, 458, 464, 466], '#8C9F68');
  s += path('M860 600 L960 440 Q1080 452 1200 446 V600 Z', '#B6C37C', 0.55);
  s += ridge([512, 504, 514, 500, 510, 518, 506, 512, 516], '#6E874D');
  // Round bales, face on.
  for (const [x, y, r] of [[300, 520, 26], [370, 526, 22], [700, 518, 28], [1000, 512, 20]]) {
    s += rect(x - r * 1.5, y - r, r * 1.5, r * 2, '#B8975A', 4);
    s += circle(x, y, r, '#D2B579') + circle(x, y, r * 0.62, '#C4A466') + circle(x, y, r * 0.26, '#B39257');
  }
  // A tree bent by the wind.
  s += path('M906 520 Q900 470 930 430 L942 434 Q918 474 920 520 Z', '#3B3428');
  s += circle(960, 418, 40, '#465E36') + circle(1000, 430, 30, '#465E36') + circle(940, 424, 32, '#55703F') + circle(976, 406, 34, '#55703F');
  s += ridge([556, 548, 556, 544, 552, 560, 548, 556, 560], '#56703F');
  s += ground('#222A1F');
  return s;
}

/** THE SMALL HOUSE — a long white cottage on a hill at dusk, smoke from one chimney. */
function smallHouse(): string {
  let s = sky('#2D4560') + band(210, 320, '#465D7B') + band(320, 410, '#857F9C') + band(410, 600, '#D6A48E');
  s += stars([[100, 60, 2.6], [240, 120, 2], [420, 50, 2.2], [600, 100, 2.8], [880, 70, 2], [1010, 140, 2.4], [1140, 60, 2]], '#E9E4D3');
  s += ridge([500, 470, 480, 460, 476, 490, 470, 486, 500], '#6B6E86');
  // The hill the house stands on, rising to the right.
  s += path('M0 570 Q300 540 500 470 Q680 410 880 424 Q1060 438 1200 488 V720 H0 Z', '#3C5345');
  s += path('M880 424 Q1060 438 1200 488 V720 H980 Z', '#33483C');
  // The cottage: long and low, chimneys on the GABLE ends, as the photographs have it.
  const x = 600, b = 448;
  s += rect(x + 18, b - 132, 22, 48, '#E9E2D4') + rect(x + 214, b - 132, 22, 48, '#C9BFAD');
  s += rect(x + 14, b - 136, 30, 8, '#4A4E58') + rect(x + 210, b - 136, 30, 8, '#4A4E58');
  s += poly([x - 14, b - 72, x + 268, b - 72, x + 240, b - 118, x + 14, b - 118], '#393E49');
  s += rect(x - 14, b - 76, 282, 6, '#2C3039');
  s += rect(x, b - 70, 254, 70, '#EEE7D9') + rect(x + 214, b - 70, 40, 70, '#CFC5B2');
  s += rect(x + 30, b - 52, 28, 24, '#F4B95A') + rect(x + 150, b - 52, 28, 24, '#F4B95A');
  s += rect(x + 43, b - 52, 2, 24, '#C98A3A') + rect(x + 163, b - 52, 2, 24, '#C98A3A');
  s += rect(x + 96, b - 44, 30, 44, '#4A3B33');
  // Smoke drifting off the left chimney.
  s += circle(x + 30, b - 150, 12, '#C9CCD6', 0.55) + circle(x + 14, b - 176, 16, '#C9CCD6', 0.45) + circle(x - 12, b - 206, 20, '#C9CCD6', 0.35);
  // A fence down the slope and a tree beside the house.
  for (let i = 0; i < 7; i++) {
    const fx = 220 + i * 46;
    const fy = 545 - i * 13;
    s += rect(fx, fy - 30, 6, 32, '#2A3A31');
  }
  s += line(220, 527, 502, 449, '#2A3A31', 4) + line(220, 539, 502, 461, '#2A3A31', 3);
  s += tree(940, 430, 44, '#2E4337', '#24362C', '#21271F');
  s += ground('#1A2621');
  return s;
}

/** THE LIGHTHOUSE — a white tower on a cliff at sunset, its beam across the sea. */
function lighthouse(): string {
  let s = sky('#5B6286') + band(200, 330, '#957B95') + band(330, 420, '#D2998E') + band(420, 480, '#EEB792');
  s += circle(930, 486, 72, '#FADBA8');
  s += bird(620, 230, 1.1, '#3B3550') + bird(668, 256, 0.8, '#3B3550');
  s += rect(0, 480, PS_W, 120, '#4C5A7B');
  s += glints([[930, 492, 130], [924, 508, 104], [936, 526, 80], [928, 548, 62], [934, 572, 44]], '#F4BC98', 0.85);
  s += glints([[600, 520, 50], [700, 560, 40], [1120, 540, 50]], '#7383A2');
  // The cliff, the keeper's house and the tower, set low enough that the lantern
  // stands inside the band Home shows (PS_SAFE_TOP), the tower a touch shorter.
  let c = '';
  // The cliff: a dark face, a lit top, grass along the edge.
  c += path('M0 410 L250 402 Q330 400 390 420 L452 468 Q486 520 500 600 L0 600 Z', '#3A3341');
  c += path('M390 420 L452 468 Q486 520 500 600 L420 600 Q430 520 380 470 Z', '#2B2632');
  c += path('M0 402 L250 394 Q330 392 392 414 L388 424 Q330 406 250 410 L0 416 Z', '#55684F');
  for (const [x, y, h] of [[120, 430, 120], [220, 440, 100], [330, 452, 90]]) c += rect(x, y, 5, h, '#463E4D');
  // The keeper's house.
  c += rect(334, 362, 64, 34, '#E9E2DA') + rect(378, 362, 20, 34, '#CBC3BC') + poly([326, 364, 366, 342, 406, 364], '#A9443A');
  // The tower: tapered, white, its lantern room dark-framed with a red cap.
  let t = '';
  const tx = 290, tb = 400;
  t += poly([tx - 32, tb, tx + 32, tb, tx + 22, tb - 150, tx - 22, tb - 150], '#F2EDE7');
  t += poly([tx + 2, tb, tx + 32, tb, tx + 22, tb - 150, tx + 2, tb - 150], '#D4CBC5');
  t += rect(tx - 32, tb - 106, 62, 12, '#A9443A', 0, 0.9) + rect(tx - 30, tb - 54, 60, 12, '#A9443A', 0, 0.9);
  t += rect(tx - 30, tb - 160, 60, 10, '#2D2A33');
  t += rect(tx - 18, tb - 194, 36, 34, '#FFE2A8') + rect(tx - 2, tb - 194, 4, 34, '#2D2A33');
  t += rect(tx - 19, tb - 194, 3, 34, '#2D2A33') + rect(tx + 16, tb - 194, 3, 34, '#2D2A33');
  t += path(`M${tx - 22} ${tb - 192} Q${tx} ${tb - 226} ${tx + 22} ${tb - 192} Z`, '#B5473C');
  t += circle(tx, tb - 220, 5, '#2D2A33');
  c += group(`translate(${tx} ${tb}) scale(0.86) translate(${-tx} ${-tb})`, t);
  s += group('translate(0 72)', c);
  s += ground('#1C1923', [0, -6, -2, -4, 0, -10, -2]);
  s += path('M1200 560 Q1130 552 1090 574 L1060 612 L1200 612 Z', '#2A2533');
  return s;
}

/** THE CROSSING — a stone arch over a river, its reflection closing the circle. */
function crossing(): string {
  let s = sky('#C8DCD3') + band(330, 600, '#D6E4DC');
  s += cloud(250, 170, 1.1, '#EEF4F0') + cloud(930, 120, 0.95, '#E6EFEA');
  s += ridge([396, 378, 392, 370, 386, 398, 382, 390, 394], '#A8C1AB');
  s += ridge([440, 428, 442, 424, 436, 446, 430, 438, 444], '#83A487');
  for (const [x, r] of [[90, 30], [150, 38], [230, 28], [880, 36], [960, 30], [1040, 40], [1120, 32]]) s += tree(x, 470, r, '#5B7D55', '#4A6845', '#3E3A2E');
  // The river, coming out of the valley and widening toward us.
  s += path('M548 460 Q600 452 652 460 L800 600 L400 600 Z', '#6F9DAA');
  // The banks either side of it.
  s += path('M0 470 Q300 462 548 460 L400 600 L0 600 Z', '#6A8E5C') + path('M652 460 Q900 462 1200 470 V600 L800 600 Z', '#5F8453');
  // The bridge: deck, parapet, and one semicircular arch springing at the water.
  const cx = 600, sp = 532, r = 86;
  // Under the arch: the vault's underside in shadow, then the river beyond.
  s += path(`M${cx - r} ${sp} A${r} ${r} 0 0 1 ${cx + r} ${sp} Z`, '#56706A');
  s += path(`M${cx - r + 14} ${sp} A${r - 14} ${r - 30} 0 0 1 ${cx + r - 14} ${sp} Z`, '#6F9DAA');
  s += path(`M370 446 L830 446 L830 ${sp} L${cx + r} ${sp} A${r} ${r} 0 0 0 ${cx - r} ${sp} L370 ${sp} Z`, '#BCB19E');
  s += path(`M720 446 L830 446 L830 ${sp} L${cx + r} ${sp} A${r} ${r} 0 0 0 ${cx + 52} ${sp - 68} Z`, '#A29783');
  // The voussoirs: a ring of wedge stones round the arch, parted by radial joints.
  s += `<path d="M${cx - r - 10} ${sp} A${r + 10} ${r + 10} 0 0 1 ${cx + r + 10} ${sp}" fill="none" stroke="#A39882" stroke-width="20"/>`;
  for (let i = 1; i < 12; i++) {
    const a = Math.PI - (i * Math.PI) / 12;
    s += line(cx + Math.cos(a) * (r - 1), sp - Math.sin(a) * (r - 1), cx + Math.cos(a) * (r + 21), sp - Math.sin(a) * (r + 21), '#867B67', 2.5);
  }
  s += rect(362, 432, 476, 16, '#A89D88') + rect(362, 430, 476, 4, '#CFC5B3');
  for (let i = 0; i < 9; i++) if (i < 3 || i > 5) s += rect(392 + i * 50, 466 + ((i * 7) % 3) * 16, 26, 4, '#A69B87');
  // Its reflection: the stone and the ring upside down and darker, closing the circle.
  s += `<path d="M${cx - r - 10} ${sp} A${r + 10} ${(r + 10) * 0.5} 0 0 0 ${cx + r + 10} ${sp}" fill="none" stroke="#7E8E86" stroke-width="14" opacity="0.5"/>`;
  s += glints([[600, 572, 60], [560, 590, 40], [660, 556, 30]], '#B9D6DB', 0.8);
  s += ground('#1E2A21');
  return s;
}

/** THE RUINS — a temple's last columns on their steps at dusk, cypresses either side. */
function ruins(): string {
  let s = sky('#B5A3C0') + band(250, 400, '#D3B3C0') + band(400, 520, '#ECC8B6');
  s += circle(880, 420, 58, '#F8E1CA');
  s += bird(560, 220, 1, '#5E4F66') + bird(600, 244, 0.75, '#5E4F66');
  s += ridge([470, 452, 466, 444, 460, 474, 450, 462, 468], '#9D8AA2');
  s += ridge([524, 516, 522, 512, 520, 528, 516, 522, 526], '#7B6A7E');
  // The steps the temple stood on.
  s += rect(300, 512, 600, 16, '#CDBFAB') + rect(320, 498, 560, 16, '#E4D8C6') + rect(336, 486, 528, 14, '#EDE4D5');
  s += rect(800, 498, 80, 16, '#CDBFAB');
  // The columns: shaft, shade, flutes, a capital — one broken short.
  const col = (x: number, h: number, broken = false) => {
    const top = 486 - h;
    let c = rect(x - 18, top, 36, h, '#EEE5D7') + rect(x + 6, top, 12, h, '#CABCA9');
    c += rect(x - 9, top + 14, 2.5, h - 18, '#DCCFBC') + rect(x - 1, top + 14, 2.5, h - 18, '#DCCFBC');
    if (broken) c += poly([x - 18, top, x - 6, top - 14, x + 4, top - 2, x + 12, top - 18, x + 18, top], '#EEE5D7');
    else c += rect(x - 26, top - 16, 52, 16, '#E4D9C8') + rect(x - 22, top - 4, 44, 6, '#D8CBB7');
    return c;
  };
  s += col(390, 196) + col(476, 196) + col(562, 118, true) + col(660, 196) + col(746, 150, true);
  // A piece of the beam still resting on the first two, broken off at the end.
  s += poly([354, 274, 520, 274, 512, 290, 524, 302, 354, 302], '#E6DCCB') + rect(354, 296, 166, 6, '#CDBFAB');
  // Fallen drums on the ground.
  s += ellipse(840, 520, 24, 15, '#E4D8C6') + rect(816, 505, 52, 30, '#E9DFCF', 6) + ellipse(868, 520, 15, 15, '#D6C8B3');
  // Cypresses: narrow flames.
  const cyp = (x: number, h: number) =>
    path(`M${x} ${560 - h} Q${x + 30} ${560 - h * 0.45} ${x + 16} 560 L${x - 16} 560 Q${x - 30} ${560 - h * 0.45} ${x} ${560 - h} Z`, '#3E5245')
    + path(`M${x} ${560 - h} Q${x + 30} ${560 - h * 0.45} ${x + 16} 560 L${x + 2} 560 Z`, '#30403A');
  s += cyp(200, 250) + cyp(250, 180) + cyp(1000, 230) + cyp(1046, 160);
  s += ground('#29212F');
  return s;
}

/**
 * THE READING ROOM — the Pass tab's own place, not a profile picture: two tall
 * cases of books either side of an arched window at night, a library ladder, a
 * pendant lamp and a globe. The Pass card is laid in front of it on the floor.
 * Built from photographs of college libraries: the cases run floor to cornice, the
 * books lean where a gap opens, the ladder hooks to a rail along the case top.
 */
function readingRoom(): string {
  let s = sky('#1F3536') + band(0, 86, '#182B2C') + rect(0, 82, PS_W, 8, '#2A4446');
  // The window: an arch of night sky in a wooden frame, its glazing bars, the sill.
  const wx = 600, wr = 132, wt = 168, wb = 556;
  const arch = (r: number, y0: number) => `M${wx - r} ${y0} L${wx - r} ${wt + wr} A${r} ${r} 0 0 1 ${wx + r} ${wt + wr} L${wx + r} ${y0} Z`;
  s += path(arch(wr + 18, wb + 4), '#5B3F2E');
  s += path(arch(wr, wb), '#1B2843');
  s += stars([[520, 250, 2.6], [560, 330, 2], [640, 210, 2.2], [700, 300, 2.8], [540, 430, 2], [690, 460, 2.2], [610, 380, 2]], '#E9E4D3');
  s += '<mask id="room-moon"><rect width="1200" height="720" fill="#fff"/><circle cx="686" cy="226" r="30" fill="#000"/></mask>';
  s += '<circle cx="668" cy="236" r="34" fill="#F1E9D2" mask="url(#room-moon)"/>';
  s += rect(wx - 4, wt, 8, wb - wt, '#5B3F2E') + rect(wx - wr, wt + wr - 4, wr * 2, 8, '#5B3F2E')
    + rect(wx - wr, 392, wr * 2, 7, '#5B3F2E') + rect(wx - wr, 476, wr * 2, 7, '#5B3F2E');
  s += rect(wx - wr - 34, wb, wr * 2 + 68, 14, '#7A5640') + rect(wx - wr - 34, wb + 14, wr * 2 + 68, 5, '#4A3326');
  // A plant and a small stack of books on the sill.
  s += rect(wx - 110, wb - 28, 30, 28, '#B5473C') + rect(wx - 84, wb - 28, 4, 28, '#8E362D');
  s += circle(wx - 104, wb - 40, 14, '#56763F') + circle(wx - 88, wb - 46, 12, '#4A6837') + circle(wx - 96, wb - 56, 11, '#5E8146');
  s += rect(wx + 70, wb - 12, 60, 12, '#416B66') + rect(wx + 76, wb - 22, 50, 10, '#D35E36') + rect(wx + 72, wb - 30, 54, 8, '#E8DFCC');
  // The pendant lamp, hanging in front of the arch.
  s += rect(wx - 1.5, 0, 3, 96, '#11201F');
  s += poly([wx - 34, 128, wx + 34, 128, wx + 16, 96, wx - 16, 96], '#C0563A') + poly([wx, 96, wx + 16, 96, wx + 34, 128, wx, 128], '#9E4430');
  s += rect(wx - 34, 126, 68, 5, '#7E3626') + ellipse(wx, 134, 12, 7, '#FFE2A8');
  s += poly([wx - 30, 134, wx + 30, 134, wx + 120, 600, wx - 120, 600], '#FFE8BA', 0.07);
  // The two cases of books.
  const BOOK = ['#B5473C', '#416B66', '#646756', '#2E4A6B', '#D35E36', '#8A6E9C', '#E8DFCC', '#7E3B2E', '#C9A35A', '#3E5A4F', '#A8B59A', '#5A4A7A'];
  const shelfCase = (x0: number, x1: number, seed: number) => {
    let c = rect(x0 - 14, 100, x1 - x0 + 28, 500, '#4A3326') + rect(x0 - 14, 100, 10, 500, '#5E4231');
    c += rect(x0, 118, x1 - x0, 482, '#2A1E18');
    c += rect(x0 - 22, 96, x1 - x0 + 44, 14, '#5E4231');
    const shelves = [222, 330, 438, 546];
    let k = seed;
    for (const sy of shelves) {
      let x = x0 + 6;
      while (x < x1 - 16) {
        k = (k * 9301 + 49297) % 233280;
        const w = 13 + (k % 14);
        const h = 66 + (k % 26);
        if (k % 11 === 0) { x += 18; continue; }
        const col = BOOK[k % BOOK.length];
        if (k % 13 === 0 && x + h < x1) {
          // A book lying flat, where the row has a gap.
          c += rect(x, sy - 14, h * 0.9, 14, col) + rect(x, sy - 14, h * 0.9, 3, '#000', 0, 0.18);
          x += h * 0.9 + 2;
          continue;
        }
        c += rect(x, sy - h, w, h, col) + rect(x + w - 4, sy - h, 4, h, '#000', 0, 0.18);
        if (w > 18) c += rect(x + 3, sy - h + 12, w - 10, 3, '#F1E9D2', 0, 0.55) + rect(x + 3, sy - 16, w - 10, 3, '#F1E9D2', 0, 0.55);
        x += w + 1;
      }
      c += rect(x0, sy, x1 - x0, 10, '#5E4231') + rect(x0, sy + 10, x1 - x0, 3, '#2A1E18');
    }
    return c;
  };
  s += shelfCase(48, 388, 7) + shelfCase(812, 1152, 31);
  // The library ladder, hooked to a rail along the right-hand case.
  s += rect(800, 112, 364, 5, '#8C6A4E');
  s += line(866, 600, 900, 118, '#8C6A4E', 9) + line(926, 600, 950, 118, '#7A5A41', 9);
  for (let i = 1; i < 9; i++) {
    const t = i / 9;
    s += line(866 + 34 * t, 600 - 482 * t, 926 + 24 * t, 600 - 482 * t, '#8C6A4E', 6);
  }
  // The floor: dark boards, a skirting, a globe at the left.
  s += rect(0, 590, PS_W, 12, '#2B1F18');
  s += ground('#132120', [0, 0, 0, 0, 0, 0, 0]);
  s += line(96, 700, 110, 654, '#4A3326', 6) + line(124, 700, 110, 654, '#4A3326', 6) + rect(104, 646, 12, 12, '#5E4231');
  s += `<path d="M66 600 A52 52 0 1 1 154 600" fill="none" stroke="#9E7A54" stroke-width="5"/>`;
  s += circle(110, 598, 44, '#416B66') + path('M86 570 Q104 560 118 572 Q126 590 110 598 Q92 600 86 584 Z', '#A8B59A')
    + path('M118 610 Q134 604 142 616 Q132 634 120 628 Z', '#A8B59A') + path('M110 554 A44 44 0 0 1 154 598 L140 598 A30 30 0 0 0 110 568 Z', '#000', 0.15);
  return s;
}

/** The Pass tab's reading room, drawn by `make:profile-art` beside the profile places. */
export const READING_ROOM = { id: 'reading-room', sky: '#182B2C', ground: '#132120', svg: readingRoom() };

export const PROFILE_SCENES: readonly ProfileScene[] = [
  { id: 'woodcut-sky', name: 'Open Sea', sky: '#BBD6D3', ground: '#1E2F35', focus: { x: 790, y: 430 }, svg: openSea() },
  { id: 'night-spiral', name: 'Moonlit Lake', sky: '#1B2741', ground: '#101827', focus: { x: 780, y: 420 }, svg: moonlitLake() },
  { id: 'sunburst', name: 'Break in the Clouds', sky: '#93ABBC', ground: '#21301E', focus: { x: 620, y: 330 }, svg: breakInClouds() },
  { id: 'the-peak', name: 'The Peak', sky: '#C6B4CE', ground: '#151C23', focus: { x: 610, y: 360 }, svg: thePeak() },
  { id: 'the-range', name: 'The Range', sky: '#DDE5EA', ground: '#1C2937', focus: { x: 380, y: 440 }, svg: theRange() },
  { id: 'rain-field', name: 'Weather', sky: '#A7B6AE', ground: '#222A1F', focus: { x: 520, y: 420 }, svg: weather() },
  { id: 'small-house', name: 'The Small House', sky: '#2D4560', ground: '#1A2621', focus: { x: 730, y: 400 }, svg: smallHouse() },
  { id: 'the-tower', name: 'The Lighthouse', sky: '#5B6286', ground: '#1C1923', focus: { x: 320, y: 400 }, svg: lighthouse() },
  { id: 'stone-bridge', name: 'The Crossing', sky: '#C8DCD3', ground: '#1E2A21', focus: { x: 600, y: 470 }, svg: crossing() },
  { id: 'the-ruins', name: 'The Ruins', sky: '#B5A3C0', ground: '#29212F', focus: { x: 540, y: 380 }, svg: ruins() },
];

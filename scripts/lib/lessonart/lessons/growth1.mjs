// personal-growth-foundations-1, "How Do People Change?" — the front-garden pictures
// (LESSON_RULES AM13). Each replaces a shape-built object of growth1Scene and takes its
// box exactly, so nothing on the stage moves. Flat fills lit from the top left, a shaded
// side, one dark outline, and the colours the things are (NATURAL in objects.ts).
// Zero imports.

const INK = '#2B2420';
const n2 = (v) => (Math.round(v * 100) / 100).toString();
/** A filled shape with the house outline. */
const fill = (d, c, w = '0.9') => `<path d="${d}" fill="${c}" stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
/** A shade or highlight laid inside a shape, with no outline. */
const tone = (d, c, o = 1) => `<path d="${d}" fill="${c}"${o < 1 ? ` opacity="${o}"` : ''}/>`;
/** A drawn line. */
const line = (d, c, w) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const R = (x, y, w, h) => `M${n2(x)},${n2(y)} h${n2(w)} v${n2(h)} h${n2(-w)} Z`;
/** A rounded rectangle as a path. */
const RR = (x, y, w, h, r) => `M${n2(x + r)},${n2(y)} H${n2(x + w - r)} Q${n2(x + w)},${n2(y)} ${n2(x + w)},${n2(y + r)} V${n2(y + h - r)} Q${n2(x + w)},${n2(y + h)} ${n2(x + w - r)},${n2(y + h)} H${n2(x + r)} Q${n2(x)},${n2(y + h)} ${n2(x)},${n2(y + h - r)} V${n2(y + r)} Q${n2(x)},${n2(y)} ${n2(x + r)},${n2(y)} Z`;
const circle = (cx, cy, r, c, w = '0.6') => `<circle cx="${n2(cx)}" cy="${n2(cy)}" r="${n2(r)}" fill="${c}" stroke="${INK}" stroke-width="${w}"/>`;

/**
 * A soft, lumpy outline round an ellipse — the edge of a tree's crown or a clump of
 * leaves: `k` bumps, each pushed out by `bump`, with a fixed jitter so it never reads as
 * a regular cog. Flatter underneath (`under`), as a crown is.
 */
function scallop(cx, cy, rx, ry, k, bump, seed, under = 0.8) {
  const pts = [];
  for (let i = 0; i < k; i += 1) {
    const a = (i / k) * Math.PI * 2 - Math.PI / 2;
    const j = 1 + 0.09 * Math.sin(seed * 7.3 + i * 2.17) + 0.05 * Math.cos(seed * 3.1 + i * 4.9);
    const sy = Math.sin(a) > 0 ? under : 1;
    pts.push([cx + Math.cos(a) * rx * j, cy + Math.sin(a) * ry * j * sy]);
  }
  let d = `M${n2(pts[0][0])},${n2(pts[0][1])}`;
  for (let i = 0; i < k; i += 1) {
    const p = pts[i], q = pts[(i + 1) % k];
    const mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2;
    const ox = mx - cx, oy = my - cy;
    const L = Math.hypot(ox, oy) || 1;
    const b = bump * (0.8 + 0.4 * Math.abs(Math.sin(seed + i * 1.7)));
    d += ` Q${n2(mx + (ox / L) * b)},${n2(my + (oy / L) * b)} ${n2(q[0])},${n2(q[1])}`;
  }
  return d + ' Z';
}

// ── colours (NATURAL in objects.ts, and their lit and shaded turns) ──────────
const RENDER = '#BCD2CC', RENDER_S = '#97B0A9', RENDER_L = '#CFE0DB';
const SASH = '#F3F2EC', SASH_S = '#CFCDC2';
const GLASS = '#4E6470', GLASS_L = '#8FA9B6';
const COPING = '#C2BBAB', COPING_S = '#9E9888', COPING_L = '#D9D3C5';
const DOOR = '#2F5D7C', DOOR_S = '#234862', DOOR_L = '#4C7C9C';
const BRASS = '#C9A13B';
const WOOD = '#8E5F37', WOOD_S = '#6B4829', WOOD_L = '#A97646';
const FELT = '#4A4D52', FELT_S = '#35383C';
const BARK = '#7A5A40', BARK_S = '#58402D';
const LEAF_L = '#86B04E', LEAF = '#5F8D36', LEAF_S = '#466E28';
const SILVER = '#C4C8CC', SILVER_S = '#9CA2A8', SILVER_L = '#E6E9EC';

// ── HER HOUSE FRONT, with its door (growth1: houseFront(30, 407, 60, 186) and door(30, 452, 38, 96)) ──
// REFERENCE: Victorian terraced houses (geograph 6516974, 4361171, 6437588): a painted
// render front with a stucco string course; a white SASH window of two sashes, each of
// two panes, under a stone lintel with a keystone and over a projecting sill; the front
// door in a white doorcase — pilasters and a hood — with a fanlight of radiating glazing
// bars over a four-panelled door, a brass letterbox, a stone step and a darker plinth.
export function house() {
  const out = [];
  out.push(fill(R(-1, 313, 61, 188), RENDER, '1.1'));
  out.push(tone(R(55.5, 313, 4, 187), RENDER_S, 0.55));                    // the wall's edge, turned from the lamp
  out.push(fill(R(-1, 318, 61, 4.2), COPING, '0.8'));                        // the string course
  out.push(tone(R(0, 322.2, 59.5, 1.4), RENDER_S));
  out.push(fill(R(-1, 486, 61, 14), RENDER_S, '0.9'));                       // the plinth band
  // the window: lintel and keystone, the white sash, four panes, the sill
  out.push(fill(R(12, 326.5, 36, 5), COPING, '0.8'));
  out.push(fill('M27.6,325.6 L32.4,325.6 L31.6,332.4 L28.4,332.4 Z', COPING_L, '0.7'));
  out.push(fill(R(14, 331.5, 32, 50), SASH, '0.9'));
  out.push(tone(R(14.5, 332, 31, 2), SASH_S));
  for (const [x, y] of [[17, 335], [31, 335], [17, 358.5], [31, 358.5]]) {
    out.push(fill(R(x, y, 12, 20), GLASS, '0.6'));
    out.push(tone(`M${x + 1},${y + 1} L${x + 7},${y + 1} L${x + 1},${y + 9} Z`, GLASS_L, 0.75));  // the sky caught in it
  }
  out.push(line('M15,356.8 L45,356.8', SASH_S, '0.7'));                     // the meeting rail's shadow
  out.push(fill(R(10.5, 381, 39, 4), COPING, '0.8'));                       // the sill, proud of the wall
  out.push(tone(R(12.5, 385, 35, 2.2), RENDER_S));
  // the doorcase: a hood on brackets and two pilasters, and the fanlight over the door
  out.push(fill(R(6.5, 391, 4.6, 104), SASH, '0.8'));
  out.push(fill(R(48.9, 391, 4.6, 104), SASH, '0.8'));
  out.push(tone(R(51, 391.5, 2.2, 103), SASH_S));
  out.push(fill('M4.5,391.5 L55.5,391.5 L54,386.5 L6,386.5 Z', SASH, '0.8'));
  out.push(tone(R(11, 391.6, 38, 1.6), SASH_S));
  out.push(fill(R(11, 392.5, 38, 11.5), SASH, '0.7'));
  out.push(fill('M13.5,403.6 C13.5,394.2 46.5,394.2 46.5,403.6 Z', GLASS, '0.6'));
  for (const a of [0.18, 0.34, 0.5, 0.66, 0.82]) {
    const ang = Math.PI * (1 - a);
    out.push(line(`M30,403.6 L${n2(30 + Math.cos(ang) * 16)},${n2(403.6 - Math.sin(ang) * 8.6)}`, SASH, '0.7'));
  }
  // the door: four raised panels, a letterbox, a knob, the edge turned from the lamp
  out.push(fill(R(11, 404, 38, 91), DOOR, '0.9'));
  out.push(tone(R(44.5, 404.5, 4, 90), DOOR_S));
  for (const [x, y, h] of [[15, 409, 26], [31.5, 409, 26], [15, 446, 43], [31.5, 446, 43]]) {
    out.push(fill(R(x, y, 13.5, h), DOOR, '0.55'));
    out.push(line(`M${x + 1},${y + h - 1} L${x + 1},${y + 1} L${x + 12.5},${y + 1}`, DOOR_L, '0.8'));
    out.push(line(`M${x + 12.5},${y + 1.5} L${x + 12.5},${y + h - 1} L${x + 1.5},${y + h - 1}`, DOOR_S, '0.8'));
  }
  out.push(fill(R(22.5, 438.5, 15, 3.4), BRASS, '0.5'));                     // the letterbox
  out.push(circle(44, 452, 1.5, BRASS, '0.45'));                              // the knob
  // the stone step
  out.push(fill(R(4.5, 494.5, 51, 6), COPING, '0.8'));
  out.push(tone(R(5, 498.5, 50, 1.5), COPING_S));
  out.push(line('M5.5,495.6 L54.5,495.6', COPING_L, '0.6'));
  return out.join('');
}

// ── THE TREE AT THE BACK OF THE GARDEN (growth1: gardenTree(318, 426, 150, 160)) ──
// REFERENCE: oak trees in a field (geograph 6141856, 6689516; dllu, Sunol 2023): ONE broad
// crown wider than it is tall, its edge lumpy with clumps of leaves, its underside flatter
// and in shade; a short thick trunk that forks into two or three limbs which disappear up
// into the crown. The clumps catch the light on their upper-left sides. Drawn a lighter
// green than the old broccoli, so the teacher's black hat stands clear of it.
export function tree() {
  const out = [];
  // the trunk, flaring at the foot, forking into limbs
  out.push(fill('M300,506 C306,500 309,486 310,470 C310,458 304,450 293,438 L298,434 C307,442 313,447 316,452'
    + ' C317,440 315,428 312,418 L318,416 C322,428 323,440 322,451 C327,442 334,434 345,428 L348,433'
    + ' C337,440 330,452 328,468 C328,486 331,500 338,506 Z', BARK, '1.1'));
  out.push(tone('M322,458 C322,474 324,492 331,505 L338,506 C331,500 328,486 328,468 C328,462 329,457 330,452 Z', BARK_S));
  out.push(line('M314,472 C313,484 314,494 312,502', BARK_S, '0.9'));
  // the crown: one mass, then its clumps
  const crown = scallop(318, 398, 72, 47, 17, 7, 1.3, 0.78);
  out.push(fill(crown, LEAF, '1.2'));
  // everything inside the crown is clipped to it, so no clump or shade hangs past its edge
  out.push(`<clipPath id="g1-crown"><path d="${crown}"/></clipPath><g clip-path="url(#g1-crown)">`);
  // the underside, in shade, with the limbs going up into it
  out.push(tone(scallop(322, 424, 60, 16, 11, 4, 2.2, 1), LEAF_S, 0.9));
  out.push(line('M300,437 C303,432 305,428 307,425 M318,417 C318,412 318,409 319,405 M345,429 C349,425 352,422 356,420', BARK_S, '2.2'));
  // clumps lit on their upper-left side, shaded on the lower-right
  for (const [cx, cy, rx, ry, s] of [[280, 392, 26, 17, 3.1], [312, 377, 30, 18, 4.2], [350, 386, 27, 17, 5.7], [298, 410, 20, 11, 6.4], [338, 409, 22, 11, 7.9], [366, 404, 15, 11, 8.6]]) {
    out.push(tone(scallop(cx + 3, cy + 3, rx, ry, 9, 3, s, 0.9), LEAF_S, 0.65));
    out.push(tone(scallop(cx, cy, rx * 0.92, ry * 0.88, 9, 3, s, 0.9), LEAF));
    out.push(tone(scallop(cx - rx * 0.25, cy - ry * 0.3, rx * 0.58, ry * 0.5, 7, 2, s + 1, 1), LEAF_L, 0.9));
  }
  out.push('</g>');
  out.push(`<path d="${crown}" fill="none" stroke="${INK}" stroke-width="1.2" stroke-linejoin="round"/>`);
  return out.join('');
}

// ── THE SHED (growth1: shed(365, 450, 66, 100)) ──────────────────────────────
// REFERENCE: a potting shed in a walled garden (Copped Hall, Essex) and allotment sheds
// (Probus, Cornwall; Dalskogen): seen from the gable end, horizontal SHIPLAP boards with a
// shadow under each, corner boards, an APEX roof of felt whose bargeboards overhang both
// walls, a small window in the gable, a door casing round a dark doorway, a low plinth.
// The doorway (350.5–379.5 × 434–498) is left open and dark: the scene hangs the bicycle,
// the hook and the can inside it and swings its own door leaf over it.
export function shed() {
  const out = [];
  const half = (y) => 1 + ((y - 405) * 29) / 22;       // the gable wall's half-width at y
  out.push(fill('M336,427 L365,405 L394,427 L394,497 L336,497 Z', WOOD, '0.9'));
  for (let y = 410; y <= 494; y += 5.6) {
    const w = y < 427 ? half(y) : 29;
    out.push(line(`M${n2(365 - w + 0.5)},${n2(y)} L${n2(365 + w - 0.5)},${n2(y)}`, WOOD_S, '0.75'));
    out.push(line(`M${n2(365 - w + 0.8)},${n2(y + 0.9)} L${n2(365 + w - 0.8)},${n2(y + 0.9)}`, WOOD_L, '0.45'));
  }
  out.push(tone('M386,427 L394,427 L394,497 L386,497 Z', WOOD_S, 0.45));         // the side turned from the lamp
  out.push(fill(R(336, 426.5, 3.6, 70.5), WOOD_L, '0.6'));                         // the corner boards
  out.push(fill(R(390.4, 426.5, 3.6, 70.5), WOOD_S, '0.6'));
  // the gable window, four small panes
  out.push(fill(R(359.5, 412, 11, 9), SASH, '0.6'));
  out.push(fill(R(361, 413.4, 3.6, 2.8), GLASS, '0.3'));
  out.push(fill(R(365.4, 413.4, 3.6, 2.8), GLASS, '0.3'));
  out.push(fill(R(361, 416.8, 3.6, 2.8), GLASS, '0.3'));
  out.push(fill(R(365.4, 416.8, 3.6, 2.8), GLASS, '0.3'));
  // the door casing and the dark doorway
  out.push(fill(R(347.5, 431.5, 35, 66), WOOD_L, '0.8'));
  out.push(fill(R(350.5, 434, 29, 64), '#3B3E43', '0.7'));
  out.push(tone(R(351, 434.5, 28, 4), '#2C2E32'));
  out.push(tone(R(351, 489, 28, 8.6), '#46494E'));                                 // the shed's floor inside
  // the roof: felt over the bargeboards, overhanging both walls
  out.push(fill('M331.5,429 L365,401.2 L398.5,429 L395.4,430.6 L365,405.6 L334.6,430.6 Z', FELT, '0.9'));
  out.push(tone('M365,402.6 L396.6,428.6 L395.4,429.4 L365,404.4 Z', FELT_S));
  out.push(line('M335.6,428.8 L365,404.4 L394.4,428.8', WOOD_S, '0.8'));          // the bargeboard under the felt
  out.push(circle(365, 405.2, 1.2, WOOD_L, '0.5'));                                // the finial's foot
  // the plinth
  out.push(fill(R(334, 496.2, 62, 3.8), '#6E6A63', '0.7'));
  return out.join('');
}

// ── THE SHED DOOR (growth1: shedDoor, a leaf hinged on its right edge) ────────
// REFERENCE: ledged-and-braced shed doors (the same sheds): vertical boards, three ledges
// across them, and between the ledges two braces rising FROM the hinge side, so the Z
// leans toward the hinges; black T-hinges on the ledges and a thumb latch on the
// opening edge.
const LEAF_BOX = { x: -29.04, y: 0, w: 29.04, h: 64 };
export function shedLeaf() {
  const out = [];
  const L = LEAF_BOX.x, W = LEAF_BOX.w;
  out.push(fill(R(L + 0.4, 0.4, W - 0.8, 63.2), WOOD, '0.8'));
  for (let k = 1; k < 4; k += 1) out.push(line(`M${n2(L + (W * k) / 4)},1 L${n2(L + (W * k) / 4)},63`, WOOD_S, '0.6'));
  out.push(tone(R(L + W - 3.4, 0.8, 2.8, 62.4), WOOD_S, 0.5));
  for (const y of [5, 29.5, 54]) {
    out.push(fill(R(L + 1.5, y, W - 3, 5), WOOD_L, '0.6'));
    out.push(tone(R(L + 1.8, y + 3.6, W - 3.6, 1.2), WOOD_S));
  }
  // the braces, up from the hinge side
  out.push(fill(`M${n2(L + W - 3)},53.4 L${n2(L + W - 6.6)},53.4 L${n2(L + 2)},35.2 L${n2(L + 5.6)},35.2 Z`, WOOD_L, '0.6'));
  out.push(fill(`M${n2(L + W - 3)},29 L${n2(L + W - 6.6)},29 L${n2(L + 2)},10.6 L${n2(L + 5.6)},10.6 Z`, WOOD_L, '0.6'));
  // T-hinges and the thumb latch
  for (const y of [7.5, 56.5]) out.push(fill(`M${n2(L + W - 0.6)},${y - 1} L${n2(L + W - 11)},${y - 0.5} L${n2(L + W - 11)},${y + 0.5} L${n2(L + W - 0.6)},${y + 1} Z`, '#2F3236', '0.35'));
  out.push(fill(R(L + 2.2, 30.6, 2.2, 6), '#2F3236', '0.35'));
  out.push(circle(L + 4.4, 35.6, 0.9, '#565B61', '0.3'));
  return out.join('');
}

// ── THE BICYCLE IN THE SHED (inside the doorway, 29 × 64) ─────────────────────
// REFERENCE: bicycles side on (Kellner and sporting bicycles; a safety bicycle of 1890):
// a spoked wheel with a black tyre on a steel rim, a mudguard following the tyre, the
// seat stays and chain stay meeting at the hub, the seat tube up to a saddle. Only the
// back half shows in the doorway: the rest is behind the door frame.
export function bike() {
  const out = [];
  const hx = 16.5, hy = 50.5, r = 11.6;
  // the spokes, lit against the dark
  for (let k = 0; k < 16; k += 1) {
    const a = (k / 16) * Math.PI * 2 + 0.2;
    out.push(line(`M${n2(hx + Math.cos(a) * 1.6)},${n2(hy + Math.sin(a) * 1.6)} L${n2(hx + Math.cos(a) * (r - 1.6))},${n2(hy + Math.sin(a) * (r - 1.6))}`, '#B9BEC3', '0.35'));
  }
  out.push(`<circle cx="${hx}" cy="${hy}" r="${n2(r - 1.3)}" fill="none" stroke="${SILVER}" stroke-width="0.9"/>`);
  out.push(`<circle cx="${hx}" cy="${hy}" r="${n2(r)}" fill="none" stroke="#141414" stroke-width="2.2"/>`);
  out.push(line(`M${n2(hx - r - 1.8)},${n2(hy - 2)} C${n2(hx - r)},${n2(hy - r - 3)} ${n2(hx + r)},${n2(hy - r - 3)} ${n2(hx + r + 1.6)},${n2(hy - 1)}`, SILVER_S, '1'));  // the mudguard
  // the frame: chain stay, seat stays, seat tube, and the saddle
  const FR = '#2E6A8E', FRL = '#5A93B5';
  out.push(line(`M${hx},${hy} L1.5,${hy + 2}`, INK, '2.2'));
  out.push(line(`M${hx},${hy} L1.5,${hy + 2}`, FR, '1.3'));
  out.push(line(`M${hx},${hy} L7.5,27.5`, INK, '2.2'));
  out.push(line(`M${hx},${hy} L7.5,27.5`, FR, '1.3'));
  out.push(line('M1.5,52.5 L6.2,24', INK, '2.4'));
  out.push(line('M1.5,52.5 L6.2,24', FR, '1.5'));
  out.push(line('M2.4,49 L5.6,29', FRL, '0.45'));
  out.push(line('M6.2,24 L5.6,20.5', SILVER_S, '1.1'));
  out.push(fill('M0.8,19.6 C3,18.2 9,18.4 12.6,19.8 C11.4,21.8 6,21.6 1.2,21.4 Z', '#2A2522', '0.5'));
  out.push(circle(hx, hy, 1.7, SILVER, '0.4'));
  return out.join('');
}

// ── THE WATERING CAN (growth1: wateringCan, held by the top of its arch) ──────
// REFERENCE: galvanised garden watering cans (the Haws pattern; the Commons silhouettes
// "Watering-can.svg" and Delapouite's): a DRUM of a body, slightly bellied, with two raised
// bands; an arched carrying handle from the back of the top over to the front; a second
// handle at the back for pouring; a long SPOUT rising from the FOOT of the body at about
// forty-five degrees, ending in a flared ROSE. Drawn in its own 28 × 24 box with the
// grip at (10.64, 3.36), the rose's face at (26.32, 7.92) and the foot at 20.88 — the
// points the scene pours and sets down by.
export function can() {
  const out = [];
  // the carrying handle and the pouring handle, as tubes
  for (const d of ['M4.2,10 C3.6,4.6 6.8,3.3 10.64,3.36 C14.2,3.4 16.2,4.8 15.8,10', 'M3,12 C0.5,12.6 0.4,17.8 3,18.6']) {
    out.push(line(d, INK, '2.1'));
    out.push(line(d, SILVER, '1.2'));
  }
  out.push(line('M5,6.6 C6.4,4.6 8.4,4.1 10.6,4.1', SILVER_L, '0.45'));
  // the spout, from the foot to the rose
  out.push(fill('M16.2,16.4 L24.2,8.4 L25.4,9.6 L17.4,20.2 Z', SILVER, '0.6'));
  out.push(tone('M17.2,19 L24.9,9.1 L25.4,9.6 L17.4,20.2 Z', SILVER_S));
  // the rose, flared across the end of the spout
  out.push(fill('M24.1,8.6 L26.2,4.9 C27.3,5.1 28,6.6 27.9,8.4 C27.8,10 27.2,11 26.4,11.2 Z', SILVER, '0.6'));
  out.push(tone('M26.2,5.5 C27.1,5.9 27.5,7.2 27.4,8.6 C27.3,9.8 26.9,10.5 26.5,10.6 Z', SILVER_S));
  for (const [x, y] of [[26.8, 6.6], [27, 8.2], [26.8, 9.7]]) out.push(`<circle cx="${x}" cy="${y}" r="0.3" fill="${INK}"/>`);
  // the body, a drum, bellied, its top and its open filler
  out.push(fill('M3.4,10 C2.4,13.6 2.4,17.6 3.2,20.88 L17.2,20.88 C18,17.6 18,13.6 17,10 Z', SILVER, '0.7'));
  out.push(tone('M13.6,10.3 L17,10.3 C17.9,13.6 17.9,17.6 17.1,20.6 L13.9,20.6 C14.4,17.6 14.4,13.6 13.6,10.3 Z', SILVER_S));
  out.push(line('M5,12.4 C4.6,14.8 4.6,17 5,19', SILVER_L, '0.7'));
  out.push(fill('M3.4,10 C3.4,8.9 17,8.9 17,10 C17,11 3.4,11 3.4,10 Z', SILVER_L, '0.55'));
  out.push(fill('M4.6,9.95 C4.6,9.4 9.2,9.4 9.2,9.95 C9.2,10.45 4.6,10.45 4.6,9.95 Z', '#5E646A', '0.3'));
  // the two raised bands
  out.push(line('M2.9,13.4 L17.6,13.4', '#80878D', '0.55'));
  out.push(line('M2.8,18.6 L17.7,18.6', '#80878D', '0.55'));
  return out.join('');
}

// ── A SPROUT (the reader's right answer to Q1: his pot comes up green) ────────
// REFERENCE: a sunflower seedling: a pale stalk with its two seed leaves (cotyledons),
// long and rounded, opening either side of the tip. Drawn about its foot at (0, 0),
// which the scene puts in the mouth of his pot.
export function sprout() {
  const out = [];
  out.push(line('M0,0 C0.4,-3 -0.2,-6 0.2,-8.6', INK, '1.7'));
  out.push(line('M0,0 C0.4,-3 -0.2,-6 0.2,-8.6', '#8DB55A', '0.9'));
  out.push(fill('M0.2,-8.4 C-1.6,-11.6 -5.6,-11.4 -6.2,-9.2 C-4.6,-7.6 -1.6,-7.6 0.2,-8.4 Z', LEAF, '0.55'));
  out.push(fill('M0.2,-8.4 C1.8,-11.8 5.8,-11.8 6.2,-9.6 C4.8,-7.8 1.8,-7.6 0.2,-8.4 Z', LEAF_L, '0.55'));
  out.push(tone('M0.2,-8.4 C-1.6,-9 -4.2,-9.1 -5.6,-9.3 C-4.2,-8 -1.6,-7.8 0.2,-8.4 Z', LEAF_S));
  return out.join('');
}

const same = (v) => ({ view: v, box: v });
export const ART = [
  { name: 'growth1-house', svg: house, ...same({ x: 0, y: 314, w: 60, h: 186 }) },
  { name: 'growth1-tree', svg: tree, ...same({ x: 243, y: 346, w: 150, h: 160 }) },
  { name: 'growth1-shed', svg: shed, ...same({ x: 332, y: 400, w: 66, h: 100 }) },
  { name: 'growth1-shedleaf', svg: shedLeaf, ...same(LEAF_BOX) },
  { name: 'growth1-bike', svg: bike, ...same({ x: 0, y: 0, w: 29.04, h: 64 }) },
  { name: 'growth1-can', svg: can, view: { x: 0, y: 0, w: 28, h: 24 }, box: { x: -10.64, y: -3.36, w: 28, h: 24 } },
  { name: 'growth1-sprout', svg: sprout, ...same({ x: -7, y: -12.4, w: 14, h: 12.8 }) },
];

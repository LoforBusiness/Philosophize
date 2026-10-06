// business-foundations-4, "What Is Profit?" — the food truck and the bakery across the road,
// drawn as pictures (LESSON_RULES AM13). Each takes the box of the shape-built object it
// replaces, so the hatch, the counter, the board and the people stay where they were.
// Flat fills lit from the top left, a shaded side, one dark outline. Zero imports.

const INK = '#2B2420';
const f = (n) => (+n).toFixed(2);
/** A filled shape with the house outline. */
const fill = (d, c, w = 1.6) => `<path d="${d}" fill="${c}" stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
/** A shade or highlight laid inside a shape, with no outline. */
const tone = (d, c, o = 1) => `<path d="${d}" fill="${c}"${o < 1 ? ` opacity="${o}"` : ''}/>`;
/** A drawn line. */
const line = (d, c, w) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const rect = (x, y, w, h, r = 0) => `M${f(x + r)},${f(y)} L${f(x + w - r)},${f(y)} Q${f(x + w)},${f(y)} ${f(x + w)},${f(y + r)} L${f(x + w)},${f(y + h - r)} Q${f(x + w)},${f(y + h)} ${f(x + w - r)},${f(y + h)} L${f(x + r)},${f(y + h)} Q${f(x)},${f(y + h)} ${f(x)},${f(y + h - r)} L${f(x)},${f(y + r)} Q${f(x)},${f(y)} ${f(x + r)},${f(y)} Z`;
const circ = (cx, cy, r) => `M${f(cx - r)},${f(cy)} A${f(r)},${f(r)} 0 1 0 ${f(cx + r)},${f(cy)} A${f(r)},${f(r)} 0 1 0 ${f(cx - r)},${f(cy)} Z`;
const ell = (cx, cy, rx, ry) => `M${f(cx - rx)},${f(cy)} A${f(rx)},${f(ry)} 0 1 0 ${f(cx + rx)},${f(cy)} A${f(rx)},${f(ry)} 0 1 0 ${f(cx - rx)},${f(cy)} Z`;

// ── THE FOOD TRUCK, 300 × 166, facing left ─────────────────────────────────
// REFERENCES: "Taco Truck St Louis MO" and "Taco Truck at the Orleans Jefferson Parish
// Line" (Wikimedia Commons, CC BY 2.0 / CC BY-SA 4.0), and "Austin Texas food truck 2/3"
// (CC0). A step van: a tall BOX body with a rounded roof and a cap that overhangs the
// short CAB; a near-upright windscreen over a stubby bonnet and a bumper; the wheels in
// ARCHES cut into the body, each with its trim lip, the rear one well forward of the back;
// a painted stripe along the body; the serving HATCH cut in the side with a striped
// awning propped out over it and a festoon under it; a menu slate screwed above; a roof
// extractor. In the old frame's units: the box 56–298 × 6–150, the cab 6–58, the hatch
// 138–286 × 70–132, the awning 132–292 × 56–72, the menu 158–266 × 18–50, wheels on y 152.
const CREAM = '#F1E8D4', CREAM_S = '#DCCFB2', CREAM_L = '#FFFBF1';
const RED = '#B5392F', RED_S = '#8A2B23';
const TYRE = '#33363A', TYRE_D = '#222427', SILVER = '#C4C8CC', SILVER_S = '#9CA2A8';
const GLASS = '#DCE6EA', GLASS_S = '#AFC1C9', STEEL = '#D8DBDC', STEEL_S = '#BEC3C5';
const WOOD = '#8E5F37', WOOD_L = '#A97646', SLATE = '#3C4347', CHALK = '#EDEBE4';

const BODY = 'M10,150 L5,126 Q5,112 14,109 L19,106 L27,50 Q28,43 36,43 L56,43 L56,18 Q56,6 68,6 L288,6 Q298,6 298,16 L298,150 Z';
const WHEELS = [38, 264];

function wheel(cx) {
  const cy = 152;
  const out = [];
  out.push(fill(circ(cx, cy, 14.5), TYRE, 1.4));
  out.push(tone(circ(cx, cy, 10.6), TYRE_D));
  out.push(fill(circ(cx, cy, 7), SILVER, 0.9));
  out.push(tone(`M${f(cx + 7)},${cy} A7,7 0 0 1 ${f(cx - 4.9)},${f(cy + 5)} A7,7 0 0 0 ${f(cx + 7)},${cy} Z`, SILVER_S));
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * Math.PI * 2 - Math.PI / 2;
    out.push(tone(circ(cx + Math.cos(a) * 4.2, cy + Math.sin(a) * 4.2, 0.9), '#6C7076'));
  }
  out.push(fill(circ(cx, cy, 2), SILVER_S, 0.6));
  // the tyre's lit shoulder, top left
  out.push(line(`M${f(cx - 11.5)},${f(cy - 5)} A12.4,12.4 0 0 1 ${f(cx - 4)},${f(cy - 11.8)}`, '#55595E', 1.2));
  return out.join('');
}

// tiny colour-chalk drawings on the menu slate: a burger, a hot dog, a cup
function burger(cx, cy) {
  return [
    fill(`M${cx - 6},${cy - 0.6} Q${cx - 6},${cy - 6.4} ${cx},${cy - 6.4} Q${cx + 6},${cy - 6.4} ${cx + 6},${cy - 0.6} Z`, '#E2B66A', 0.5),
    tone(`M${cx - 6.6},${cy - 0.4} Q${cx - 3},${cy + 1.6} ${cx},${cy - 0.2} Q${cx + 3},${cy + 1.6} ${cx + 6.6},${cy - 0.4} L${cx + 6.6},${cy + 0.6} L${cx - 6.6},${cy + 0.6} Z`, '#8DBF6A'),
    fill(rect(cx - 6.3, cy + 0.6, 12.6, 2.4, 1.2), '#8A5A2E', 0.5),
    fill(`M${cx - 6},${cy + 3.2} L${cx + 6},${cy + 3.2} Q${cx + 6},${cy + 5.6} ${cx + 3},${cy + 5.6} L${cx - 3},${cy + 5.6} Q${cx - 6},${cy + 5.6} ${cx - 6},${cy + 3.2} Z`, '#E2B66A', 0.5),
    tone(circ(cx - 2, cy - 4, 0.45), CHALK), tone(circ(cx + 1.5, cy - 4.6, 0.45), CHALK), tone(circ(cx + 3, cy - 3, 0.45), CHALK),
  ].join('');
}
function hotdog(cx, cy) {
  return [
    fill(rect(cx - 8, cy - 2.8, 16, 5.6, 2.8), '#C0563A', 0.5),
    fill(`M${cx - 7},${cy - 0.4} Q${cx},${cy + 1.2} ${cx + 7},${cy - 0.4} L${cx + 7},${cy + 1.2} Q${cx + 7},${cy + 4.4} ${cx + 3},${cy + 4.4} L${cx - 3},${cy + 4.4} Q${cx - 7},${cy + 4.4} ${cx - 7},${cy + 1.2} Z`, '#E2B66A', 0.5),
    line(`M${cx - 5.5},${cy - 1.4} Q${cx - 4},${cy - 2.6} ${cx - 2.5},${cy - 1.4} Q${cx - 1},${cy - 0.2} ${cx + 0.5},${cy - 1.4} Q${cx + 2},${cy - 2.6} ${cx + 3.5},${cy - 1.4} Q${cx + 5},${cy - 0.2} ${cx + 6},${cy - 1.4}`, '#F2D04B', 0.7),
  ].join('');
}
function cup(cx, cy) {
  return [
    line(`M${cx + 0.6},${cy - 4} L${cx + 2.6},${cy - 8.2} L${cx + 4.4},${cy - 8.2}`, CHALK, 0.8),
    fill(`M${cx - 4},${cy - 4.2} L${cx + 4},${cy - 4.2} L${cx + 3},${cy + 5.4} L${cx - 3},${cy + 5.4} Z`, '#D9574A', 0.5),
    fill(rect(cx - 4.6, cy - 5.4, 9.2, 1.6, 0.6), CHALK, 0.4),
    line(`M${cx - 3.2},${cy - 0.8} L${cx + 3.2},${cy - 0.8}`, CHALK, 0.6),
  ].join('');
}

export function foodTruck() {
  const o = '2';
  const out = [];
  out.push('<defs><clipPath id="b4tb"><path d="' + BODY + '"/></clipPath>'
    + '<clipPath id="b4aw"><path d="M132,57 L292,57 L290,70 L134,70 Z"/></clipPath></defs>');
  // the roof extractor, behind the roof line
  out.push(fill('M232,7 L234,1.6 Q234.6,0.6 236,0.6 L266,0.6 Q267.4,0.6 268,1.6 L270,7 Z', SILVER, 1.2));
  out.push(line('M240,3 L240,6 M246,3 L246,6 M252,3 L252,6 M258,3 L258,6 M264,3 L264,6', SILVER_S, 0.8));
  // the body, one silhouette, cab and box
  out.push(fill(BODY, CREAM, o));
  out.push('<g clip-path="url(#b4tb)">');
  // its shaded skirt and back end, away from the lamp
  out.push(tone('M0,124 L300,124 L300,152 L0,152 Z', CREAM_S, 0.55));
  out.push(tone('M291,0 L300,0 L300,152 L291,152 Z', CREAM_S, 0.7));
  // the cab's front, turned a little from the lamp
  out.push(tone('M0,104 L22,104 L18,152 L0,152 Z', CREAM_S, 0.5));
  // the painted stripe, a broad one and a pin line under it
  out.push(tone('M0,128 L300,128 L300,137 L0,137 Z', RED));
  out.push(tone('M0,135.4 L300,135.4 L300,137 L0,137 Z', RED_S));
  out.push(tone('M0,140 L300,140 L300,142.2 L0,142.2 Z', RED));
  // the rocker under it
  out.push(tone('M0,146.4 L300,146.4 L300,152 L0,152 Z', '#BFB193'));
  out.push('</g>');
  // the roof's lit edge and the cap's
  out.push(line('M68,8.6 L288,8.6', CREAM_L, 1.3));
  out.push(line('M58.6,40 L58.6,19 Q58.6,8.8 68,8.8', CREAM_L, 1.1));
  out.push(line('M30,45.6 L54,45.6', CREAM_L, 1));
  // the wheel arches: a dark well cut in the body, a trim lip round it
  for (const cx of WHEELS) {
    out.push(fill(`M${cx - 19},150.6 L${cx - 19},148 A19,19 0 0 1 ${cx + 19},148 L${cx + 19},150.6 Z`, '#1E1F22', 1.6));
    out.push(line(`M${cx - 20.4},149 A20.4,20.4 0 0 1 ${cx + 20.4},149`, SILVER_S, 1.6));
    out.push(line(`M${cx - 18},146 A18,18 0 0 1 ${cx - 4},130.6`, '#3A3C40', 1));
    out.push(wheel(cx));
  }
  // the cab: windscreen, door, its window, handle, mirror
  out.push(fill('M21.2,102 L29,50 L33.6,50 L26,102 Z', GLASS_S, 0.9));
  out.push(line('M24,92 L29.4,56', '#F4F8FA', 0.9));
  out.push(line('M58,43 L58,146', INK, 1));
  out.push(fill(rect(33, 47, 21, 33, 2), GLASS, 1));
  out.push(tone('M35,78 L46,49 L50,49 L39,78 Z', '#F6FAFB', 0.8));
  out.push(line('M31,140 L31,49 Q31,46 34,46 L57,46', INK, 0.8));
  out.push(fill(rect(46, 92, 7, 2.2, 1), SILVER, 0.6));
  out.push(line('M27.6,58 L19,61.5', INK, 1));
  out.push(fill(rect(12.2, 55, 5.4, 13, 1.6), '#4A5157', 0.9));
  out.push(line('M13.8,57.4 L13.8,65.6', '#7A848B', 0.7));
  // the nose: grille slats, a headlamp, an indicator, the bumper
  out.push(line('M8,124 L16,124 M7.6,127.4 L16,127.4 M7.6,130.8 L16,130.8', '#8C836F', 0.9));
  out.push(fill(circ(12.2, 115.6, 3.6), '#FFF3C4', 1));
  out.push(tone(circ(11.2, 114.6, 1.2), '#FFFFFF'));
  out.push(fill(rect(6, 120, 4.4, 2.6, 0.8), '#E59A2B', 0.6));
  out.push(fill(rect(1.5, 142.5, 25, 7.5, 3), SILVER, 1.2));
  out.push(tone(rect(3, 146.6, 22, 2.4, 1.2), SILVER_S));
  // the back: the door's seam, its hinges, a tail light
  out.push(line('M290.6,12 L290.6,146', INK, 0.9));
  out.push(line('M290.6,30 L294,30 M290.6,110 L294,110', INK, 1.2));
  out.push(fill(rect(295.2, 108, 3.2, 12, 1), RED, 0.7));
  out.push(line('M58,42 L58,20', INK, 0.8));
  // the painted badge on the box: a red roundel with a burger on it
  out.push(fill(circ(102, 35, 14), RED, 1.4));
  out.push(fill(circ(102, 35, 10.4), CREAM, 0.8));
  out.push(burger(102, 35.6));
  out.push(line('M92,24 A14.6,14.6 0 0 1 106,20.6', '#D9574A', 1.1));
  // the menu slate, in its frame, screwed on above the hatch
  out.push(fill(rect(158, 18, 108, 32, 2.6), WOOD, 1.3));
  out.push(line('M160.4,19.4 L263.6,19.4', WOOD_L, 1));
  out.push(fill(rect(162.4, 21.6, 99.2, 24.8, 1.2), SLATE, 0.8));
  out.push(line('M164,23 L259,23', '#565F64', 0.8));
  out.push(burger(179, 31.6));
  out.push(hotdog(212, 32));
  out.push(cup(245, 32.6));
  for (const x of [179, 212, 245]) out.push(line(`M${x - 6},41.6 L${x + 2},41.6 M${x + 4.6},41.6 L${x + 7},41.6`, CHALK, 0.9));
  for (const [x, y] of [[160.6, 20.4], [263.4, 20.4], [160.6, 47.6], [263.4, 47.6]]) out.push(tone(circ(x, y, 0.8), '#5E3B1C'));
  // the hatch: the kitchen through it, steel, an extractor hood, two little shelves
  out.push(fill('M138,70 L286,70 L286,133 L138,133 Z', STEEL, 1.4));
  for (const x of [175, 212, 249]) out.push(line(`M${x},76 L${x},132`, STEEL_S, 0.7));
  out.push(tone('M138,70 L286,70 L286,77 L138,77 Z', SILVER_S));
  out.push(line('M138,77 L286,77', '#7E858C', 0.8));
  out.push(tone('M138,126 L286,126 L286,133 L138,133 Z', STEEL_S));
  // left shelf: a jar of pickles and a bottle of ketchup; right: mustard and a pepper mill
  out.push(line('M140,96 L157,96', '#7E858C', 1.4));
  out.push(fill(rect(142, 88, 6, 8, 1.2), '#7FA35A', 0.6));
  out.push(fill('M151.6,96 L151.6,88.6 Q151.6,87 153.4,86.4 L153.4,84.6 L155,84.6 L155,86.4 Q156.8,87 156.8,88.6 L156.8,96 Z', '#C2392C', 0.6));
  out.push(line('M267,96 L284,96', '#7E858C', 1.4));
  out.push(fill('M269,96 L269,88.6 Q269,87 270.8,86.4 L270.8,84.6 L272.4,84.6 L272.4,86.4 Q274.2,87 274.2,88.6 L274.2,96 Z', '#E8B930', 0.6));
  out.push(fill('M277.6,96 L278.2,88 Q278.6,86 280,86 Q281.4,86 281.8,88 L282.4,96 Z', '#6B4829', 0.6));
  // its frame
  out.push(line('M138,70 L138,133 L286,133 L286,70', SILVER_S, 1.2));
  // the awning, propped out over the hatch: striped canvas, a scalloped valance
  out.push(fill('M132,57 L292,57 L290,70 L134,70 Z', CREAM_L, 1.3));
  out.push('<g clip-path="url(#b4aw)">');
  for (let x = 134; x < 292; x += 16) out.push(tone(`M${x},56 L${x + 8},56 L${x + 8},71 L${x},71 Z`, RED));
  out.push(tone('M132,66.6 L292,66.6 L292,71 L132,71 Z', '#000000', 0.16));
  out.push('</g>');
  out.push(line('M133.6,58.4 L290.4,58.4', '#FFFFFF', 0.9));
  for (let x = 134, k = 0; x < 290; x += 8, k++) {
    out.push(fill(`M${x},70 L${x + 8},70 Q${x + 8},73.6 ${x + 4},73.6 Q${x},73.6 ${x},70 Z`, k % 2 ? CREAM_L : RED, 0.7));
  }
  // its struts
  out.push(line('M140.6,78 L145,60.4 M283.4,78 L279,60.4', '#5B5F64', 1.1));
  return out.join('');
}

// ── THE BAKERY ACROSS THE ROAD, 90 × 148 ───────────────────────────────────
// REFERENCES: "Scott's Bakeries 633 Roman Road E3 1978" (Wikimedia Commons, CC BY-SA 2.0)
// for the build — a sash window upstairs, a FASCIA board across the whole front, a big
// shop window over a tiled stall riser and a glazed door set to one side — and "Bread on
// display in Belfast" (CC BY-SA 4.0) for the window: loaves and rolls on trays behind the
// glass. A striped awning out over the window, a hanging sign with a wheat sheaf. The
// fascia is 53–67 (the scene letters it), the window 4–56 × 79–129, the door 65–83.
const WALL = '#CDBFA6', WALL_S = '#AE9F85', WALL_L = '#E0D4BE';
const BLUE = '#A9C6D6', BLUE_S = '#86A6B8', BLUE_D = '#2F5D7C';
const GLOW = '#F7E3B0', GLOW_S = '#EDD08A', CRUST = '#B9783A', CRUST_S = '#8E5A28', CRUST_L = '#D79A55';

function loaf(cx, cy) {   // a round cob with a cross scored in it
  return fill(ell(cx, cy, 4.6, 3.2), CRUST, 0.6)
    + tone(`M${cx - 4},${cy + 0.8} Q${cx},${cy + 3.6} ${cx + 4},${cy + 0.8} Q${cx},${cy + 2.4} ${cx - 4},${cy + 0.8} Z`, CRUST_S)
    + line(`M${cx - 1.8},${cy - 1.8} L${cx + 1.4},${cy + 0.4} M${cx + 1.4},${cy - 1.8} L${cx - 1.8},${cy + 0.4}`, CRUST_L, 0.6);
}
function baguette(x0, y0, x1, y1) {
  const len = Math.hypot(x1 - x0, y1 - y0), a = (Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI;
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const cuts = [-0.28, 0, 0.28].map((u) => `M${f(u * len - 1.6)},1 L${f(u * len + 1.6)},-1`).join(' ');
  return `<g transform="translate(${f(cx)},${f(cy)}) rotate(${f(a)})">`
    + fill(rect(-len / 2, -1.9, len, 3.8, 1.9), CRUST, 0.6)
    + tone(rect(-len / 2 + 1, 0.6, len - 2, 1.2, 0.6), CRUST_S)
    + line(cuts, CRUST_L, 0.6) + '</g>';
}
function croissant(cx, cy) {
  return fill(`M${cx - 5},${cy + 1.4} Q${cx - 4},${cy - 3.4} ${cx},${cy - 3.4} Q${cx + 4},${cy - 3.4} ${cx + 5},${cy + 1.4} Q${cx + 2.4},${cy} ${cx},${cy + 0.4} Q${cx - 2.4},${cy} ${cx - 5},${cy + 1.4} Z`, CRUST_L, 0.6)
    + line(`M${cx - 2},${cy - 3} L${cx - 1.4},${cy} M${cx + 2},${cy - 3} L${cx + 1.4},${cy}`, CRUST_S, 0.5);
}

export function bakery() {
  const out = [];
  out.push('<defs><clipPath id="b4bw"><path d="M4,79 L56,79 L56,129 L4,129 Z"/></clipPath></defs>');
  // the stone front, coursed, with its shaded right side
  out.push(fill('M0,4 L90,4 L90,148 L0,148 Z', WALL, 1.2));
  for (let y = 12; y < 53; y += 8) out.push(line(`M1,${y} L89,${y}`, WALL_S, 0.45));
  for (let r = 0, y = 4; y < 52; y += 8, r++) {
    for (let x = r % 2 ? 9 : 18; x < 90; x += 18) out.push(line(`M${x},${y} L${x},${Math.min(y + 8, 53)}`, WALL_S, 0.45));
  }
  out.push(tone('M84,4 L90,4 L90,53 L84,53 Z', WALL_S, 0.6));
  // the cornice
  out.push(fill('M-1,0.5 L91,0.5 L91,5.5 L-1,5.5 Z', WALL_L, 1));
  out.push(tone('M-0.5,4 L90.5,4 L90.5,5.5 L-0.5,5.5 Z', WALL_S));
  // the sash window upstairs, a flower box on its sill
  out.push(fill(rect(26, 11, 38, 29, 0.8), '#F3F2EC', 1));
  out.push(fill('M29,14 L61,14 L61,37 L29,37 Z', '#4E6470', 0.7));
  out.push(tone('M29,14 L44,14 L29,30 Z', '#6B828E'));
  out.push(line('M29,25.4 L61,25.4 M45,14 L45,37', '#F3F2EC', 1.6));
  out.push(tone('M30,15 L38,15 L38,24.4 L30,24.4 Z', '#E9E6DB', 0.35));
  out.push(tone('M52,15 L60,15 L60,24.4 L52,24.4 Z', '#E9E6DB', 0.35));
  for (const [x, c] of [[29, '#C2392C'], [34, '#E8B930'], [39, '#C2392C'], [44, '#E07A9C'], [49, '#C2392C'], [54, '#E8B930'], [59, '#C2392C']]) {
    out.push(fill(circ(x + 1, 37.6, 2.1), '#4F7A30', 0.4));
    out.push(fill(circ(x + 1.2, 36.6, 1.3), c, 0.4));
  }
  out.push(fill(rect(25, 38.6, 40, 5, 0.8), '#7A5232', 1));
  out.push(fill(rect(23, 43.4, 44, 2.2, 0.6), '#F3F2EC', 0.8));
  // the hanging sign on its bracket, a wheat sheaf on it
  out.push(line('M84,30 L74,30 M84,26 L79,30', INK, 0.9));
  out.push(line('M76,30 L76,32.4', INK, 0.6));
  out.push(fill(circ(76, 39, 6.4), BLUE_D, 1));
  out.push(line('M76,44 L76,36 M76,40 L73.2,35.4 M76,40 L78.8,35.4 M76,42 L72.6,38.6 M76,42 L79.4,38.6', '#F2D04B', 0.9));
  out.push(tone(ell(76, 35, 0.9, 1.6), '#F2D04B'));
  // the fascia board (the scene letters it) and its moulding
  out.push(fill('M-0.5,53 L90.5,53 L90.5,67.4 L-0.5,67.4 Z', BLUE, 1.2));
  out.push(line('M0.5,54.3 L89.5,54.3', '#D3E4EC', 0.9));
  out.push(tone('M-0.5,65.6 L90.5,65.6 L90.5,67.4 L-0.5,67.4 Z', BLUE_S));
  // the shop front: painted pilasters, a tiled stall riser under the window
  out.push(fill('M0,67.4 L90,67.4 L90,145 L0,145 Z', BLUE, 1.2));
  out.push(tone('M84,67.4 L90,67.4 L90,145 L84,145 Z', BLUE_S, 0.7));
  out.push(fill('M3,131 L57,131 L57,145 L3,145 Z', '#E9E4D6', 0.8));
  for (const x of [12, 21, 30, 39, 48]) out.push(line(`M${x},131.6 L${x},144.4`, '#C9C2B0', 0.5));
  out.push(line('M3.6,138 L56.4,138', '#C9C2B0', 0.5));
  // the window, lit: two shelves of bread
  out.push(fill('M4,79 L56,79 L56,129 L4,129 Z', GLOW, 1.1));
  out.push('<g clip-path="url(#b4bw)">');
  out.push(tone('M4,79 L56,79 L56,85 L4,85 Z', GLOW_S, 0.7));
  out.push(line('M4,104 L56,104 M4,124 L56,124', '#B98E52', 1.3));
  out.push(baguette(7, 101.5, 27, 96));
  out.push(baguette(10, 102.6, 30, 98.6));
  out.push(loaf(37, 100.6));
  out.push(loaf(47, 100.6));
  out.push(loaf(42, 97.6));
  out.push(croissant(10, 121.4));
  out.push(croissant(20, 121.4));
  out.push(loaf(31, 120.8));
  out.push(croissant(41, 121.4));
  out.push(croissant(51, 121.4));
  // the glass's reflection, two streaks
  out.push(tone('M36,79 L44,79 L22,129 L14,129 Z', '#FFFFFF', 0.28));
  out.push(tone('M47,79 L50,79 L28,129 L25,129 Z', '#FFFFFF', 0.22));
  out.push('</g>');
  out.push(line('M30,79 L30,129', BLUE_S, 1.4));
  out.push(line('M4,79 L56,79 L56,129 L4,129 Z', INK, 0.9));
  // the awning out over the window: blue and white stripes, scalloped
  out.push(fill('M1,68 L59,68 L61,77 L-1,77 Z', '#FAFAF7', 1));
  for (let x = 1; x < 60; x += 8) out.push(tone(`M${x},68.6 L${x + 4},68.6 L${x + 4.4},76.6 L${x + 0.4},76.6 Z`, BLUE_D));
  for (let x = -1, k = 0; x < 61; x += 6.2, k++) {
    out.push(fill(`M${f(x)},77 L${f(x + 6.2)},77 Q${f(x + 6.2)},80.2 ${f(x + 3.1)},80.2 Q${f(x)},80.2 ${f(x)},77 Z`, k % 2 ? '#FAFAF7' : BLUE_D, 0.6));
  }
  // the door, glazed, with its step
  out.push(fill('M65,74 L83,74 L83,145 L65,145 Z', BLUE_D, 1.1));
  out.push(fill('M67.6,77 L80.4,77 L80.4,108 L67.6,108 Z', GLOW, 0.8));
  out.push(tone('M74,77 L78,77 L71,108 L67.6,108 L67.6,104 Z', '#FFFFFF', 0.3));
  out.push(fill(rect(67.6, 112, 12.8, 13, 0.6), '#264E69', 0.6));
  out.push(fill(rect(67.6, 128, 12.8, 13, 0.6), '#264E69', 0.6));
  out.push(fill(circ(68.6, 110, 1), '#E8B930', 0.5));
  out.push(fill('M63,145 L85,145 L85,148 L63,148 Z', '#A4A69F', 0.8));
  // the plinth
  out.push(fill('M0,145 L63,145 L63,148 L0,148 Z', WALL_S, 0.8));
  out.push(fill('M85,145 L90,145 L90,148 L85,148 Z', WALL_S, 0.8));
  return out.join('');
}

export const ART = [
  // foodTruck(152, 417, 300, 166) in biz4Scene: 2–302 × 334–500
  { name: 'biz4-truck', svg: foodTruck, view: { x: 0, y: 0, w: 300, h: 166 }, box: { x: 2, y: 334, w: 300, h: 166 } },
  // bakeryFront(353, 392, 90, 148): 308–398 × 318–466
  { name: 'biz4-bakery', svg: bakery, view: { x: 0, y: 0, w: 90, h: 148 }, box: { x: 308, y: 318, w: 90, h: 148 } },
];

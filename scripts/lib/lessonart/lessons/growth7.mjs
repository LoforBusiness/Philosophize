// personal-growth-foundations-7 — the recap: a timber mountain hut at dawn, then the
// switchback trail high above a valley (LESSON_RULES AM13; the recap's full settings, built
// in layers, group AV).
//
// Every picture is in SCENE units with the band [214, 514], 400 × 300. Flat fills lit from
// the top left, a darker shaded side, one dark outline; real colours, no gradients, no glows.
//
// REFERENCES (npm run ref, scratchpad/ref/g7*):
//   g7hut-1   "Interior, 1915 Settler's Log Cabin, Tower, MN": walls of round logs laid
//             horizontally, each a band lit on its upper curve with a dark seam under it,
//             the corner where the log ends stack up as rounded butts, a pale plank floor in
//             long boards, heavy round beams across the ceiling.
//   g7stove-2 "Classic wood-burning stove in a cozy cabin": a box range in white enamel, a
//             black iron hob slab on top, a chrome rail along the front edge, two small doors
//             with knobs (the firebox and the ash pan) and an oven door, the stove pipe rising
//             straight up from the back, an enamel kettle standing on the hob.
//   g7alpen-1 "Blanca Peak Alpenglow": at dawn the peaks are rose-pink on their lit faces,
//             the snow gullies paler, the base of the range in a cold blue shadow, the sky
//             peach to apricot.
//   g7ruck-1  "Hiking Equipment in Alpines Museum Munich": leather boots laced up through
//             hooks, a coil of rope, a canvas rucksack with a lid and straps, a guidebook.
//   g7boot-2  "Hiking shoes Lowa": a high ankle, a thick dark sole, laces criss-crossing up
//             to the top hooks.
//   g7lake-2  "Lac des Laures": a turquoise lake in a bowl of grey-brown slopes, a small hut
//             with a red roof on the grassy shore, the peaks above.
//   g7scree-2 "Paths to The Raise and Red Screes": a pale dirt path across grass, scattered
//             grey stones, loose gravel in fans where the path is steep.
//   g7rope-1  "Via ferrata Strobel": pale grey limestone in blocky ledges, dwarf pines in
//             dark green mounds, a steel cable run along the rock on posts.
//   g7sign-3  "Schilder Wanderweg": signboards with a pointed end on a single round pole.

const OUT = '#33261C';
const f2 = (n) => Number(n.toFixed(2));
const P = (pts) => 'M' + pts.map(([x, y]) => `${f2(x)},${f2(y)}`).join(' L') + ' Z';
const fill = (d, c, w = 1) => `<path d="${d}" fill="${c}" stroke="${OUT}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
const flat = (d, c, o = 1) => `<path d="${d}" fill="${c}"${o < 1 ? ` opacity="${o}"` : ''}/>`;
const rect = (x, y, w, h, c, lw = 1, r = 0) => `<rect x="${f2(x)}" y="${f2(y)}" width="${f2(w)}" height="${f2(h)}" rx="${r}" fill="${c}" stroke="${OUT}" stroke-width="${lw}" stroke-linejoin="round"/>`;
const box = (x, y, w, h, c, o = 1) => `<rect x="${f2(x)}" y="${f2(y)}" width="${f2(w)}" height="${f2(h)}" fill="${c}"${o < 1 ? ` opacity="${o}"` : ''}/>`;
const line = (d, c, w) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const circ = (x, y, r, c, lw = 0.8) => `<circle cx="${f2(x)}" cy="${f2(y)}" r="${f2(r)}" fill="${c}" stroke="${OUT}" stroke-width="${lw}"/>`;
const ell = (x, y, rx, ry, c, lw = 0.8) => `<ellipse cx="${f2(x)}" cy="${f2(y)}" rx="${f2(rx)}" ry="${f2(ry)}" fill="${c}" stroke="${OUT}" stroke-width="${lw}"/>`;
const dot = (x, y, r, c, o = 1) => `<circle cx="${f2(x)}" cy="${f2(y)}" r="${f2(r)}" fill="${c}"${o < 1 ? ` opacity="${o}"` : ''}/>`;

let seed = 11;
const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };

// ── palette ──────────────────────────────────────────────────────────────────
const LOG = '#C08A55', LOG_L = '#D9A770', LOG_D = '#9A673A', SEAM = '#5E3B1E';
const CEIL = '#8C5B33', CEIL_D = '#714627', BEAM = '#7A4D2A', BEAM_L = '#9A6638';
const FLOOR = '#B27E49', FLOOR_D = '#93643A', FLOOR_L = '#C8955E', FLOOR_LINE = '#6E4724';
const PINE = '#D7AA6E', PINE_D = '#B88A52', PINE_L = '#E8C38C';
const ENAMEL = '#ECEBE5', ENAMEL_D = '#CAC9C1', IRON = '#2E2C2A', IRON_L = '#4A4744', CHROME = '#B7BCC1';
const CORK = '#C99B63', CORK_D = '#A97D49';
const CURTAIN = '#C4483B', CURTAIN_D = '#9E3429', CHECK = '#F2E7D8';
const SNOW = '#F4F1EC';

// dawn, through the window and the door
const DAWN = ['#E79C86', '#EFB08F', '#F5C79E', '#F9DDB4'];
const PEAK = '#F2A79F', PEAK_D = '#C47F92', PEAK_SNOW = '#FBD9D2', PEAK_ROCK = '#9A6E8A', PEAK_BASE = '#5C6C94', PEAK_BASE_D = '#4A5A82';
const RIDGE = '#334D58', RIDGE_D = '#273D47', FIR = '#22383F';

// the trail, mid-morning
const SKY = ['#79B4E2', '#8FC2E8', '#A8D0ED', '#C2DFF0'];
const RANGE = '#E9EEF2', RANGE_D = '#B4C3D3', RANGE_ROCK = '#8C9AAB';
const HILL_FAR = '#86A0A4', HILL_FAR_D = '#6F8B90';
const FOREST = '#3F6B4A', FOREST_D = '#2F5539', MEADOW = '#9DBC5E', MEADOW_D = '#83A24A';
const LAKE = '#3EA2B1', LAKE_L = '#6CC0CB', LAKE_D = '#2C8796';
const GRASS = '#8FAE4E', GRASS_D = '#738F3C', GRASS_L = '#A8C665';
const ROCK = '#B8B4AA', ROCK_D = '#8F8B82', ROCK_DD = '#6E6A63', ROCK_L = '#D3D0C7';
const DIRT = '#C9A77A', DIRT_D = '#AF8C5E', DIRT_L = '#DCBE93';
const SCREE = '#BFB6A4', SCREE_D = '#A0977F';
const DWARF = '#4E7041', DWARF_D = '#3B5832';
const POST = '#7A5432', POST_D = '#5C3E22', ROPE = '#D9B66A';
const HUTRED = '#B8432F', HUTWALL = '#F0E6D2';

// ══════════════════════════════════════════════════════════════════════════════
// THE HUT
// ══════════════════════════════════════════════════════════════════════════════

/** FAR: dawn over the peaks, seen through the window (x 290–384) and the open door. */
export function hutFar() {
  const o = [];
  const bands = [214, 300, 340, 370, 404];
  for (let k = 0; k < 4; k++) o.push(box(0, bands[k], 400, bands[k + 1] - bands[k] + 0.3, DAWN[k]));
  // the range: pink lit faces, purple shade, pale snow gullies, the blue shadow at its foot
  const ridge = 'M240,372 L262,338 L276,348 L298,312 L312,326 L330,300 L346,318 L362,308 L380,330 L400,322 L400,400 L240,400 Z';
  o.push(fill(ridge, PEAK, 0.8));
  o.push(flat('M298,312 L306,346 L294,372 L312,372 L316,330 Z M330,300 L338,340 L326,372 L350,372 L346,318 Z M362,308 L366,344 L360,372 L380,372 L380,330 Z', PEAK_D));
  o.push(flat('M330,300 L324,314 L330,312 L334,322 L338,312 Z M298,312 L294,322 L299,320 L302,328 L306,320 Z M362,308 L359,317 L363,316 L366,322 Z', PEAK_SNOW));
  o.push(line('M318,322 L322,342 M352,322 L356,346 M284,340 L288,356', PEAK_ROCK, 0.6));
  o.push(flat('M240,372 L400,368 L400,400 L240,400 Z', PEAK_BASE));
  o.push(flat('M330,370 L400,368 L400,400 L320,400 Z', PEAK_BASE_D));
  // the near ridge with firs, dark in the shade
  o.push(fill('M240,388 C270,378 300,374 330,380 C356,374 380,378 400,376 L400,404 L240,404 Z', RIDGE, 0.7));
  for (const x of [252, 262, 274, 300, 312, 344, 356, 368, 386]) {
    const h = 9 + (x % 5);
    o.push(flat(`M${x},${382 - h} L${x + 4},${384} L${x - 4},${384} Z`, FIR));
  }
  o.push(flat('M330,380 C356,374 380,378 400,376 L400,404 L330,404 Z', RIDGE_D));
  // the snow outside the door, the step and a fir beside it
  o.push(box(0, 404, 120, 110, SNOW));
  o.push(flat('M0,420 C20,414 40,416 60,418 L60,470 L0,470 Z', '#E2DCD6'));
  o.push(flat('M0,360 L40,350 L60,356 L60,404 L0,404 Z', PEAK_BASE));
  o.push(flat('M26,412 L36,380 L46,412 Z', FIR));
  o.push(flat('M22,428 L36,392 L50,428 Z', FIR));
  return o.join('');
}

/** A horizontal log in the wall, lit on its top curve, a dark seam beneath. */
function log(x0, x1, y, h) {
  return box(x0, y, x1 - x0, h, LOG)
    + box(x0, y + 1, x1 - x0, h * 0.28, LOG_L)
    + box(x0, y + h * 0.66, x1 - x0, h * 0.34, LOG_D)
    + box(x0, y + h - 1.1, x1 - x0, 1.4, SEAM);
}
/** A pine board seen front on: lit top edge, shaded bottom. */
function board(x, y, w, h, c = PINE, cd = PINE_D) {
  return rect(x, y, w, h, c, 0.8) + box(x + 0.5, y + h * 0.62, w - 1, h * 0.36, cd);
}

/** MID: the room — ceiling and beams, the log walls, the floor and rug, the door frame,
 *  the chair, the hooks, the bench and cork board, the stove, the window (its panes cut
 *  through to the dawn), a shelf, a lantern hook. The table is its own (near) picture. */
export function hutRoom() {
  const o = [];
  const WIN = { x0: 290, x1: 384, y0: 290, y1: 376 };
  const DOOR = { x0: 8, x1: 56, y0: 362, y1: 472 };
  // ── the back wall: logs from the beam down to the floor, with holes for the window and door ──
  const LOGH = 14.6;
  for (let y = 250; y < 472; y += LOGH) {
    const h = Math.min(LOGH, 472 - y);
    const segs = [];
    let xs = [[0, 400]];
    if (y + h > WIN.y0 && y < WIN.y1) xs = xs.flatMap(([a, b]) => [[a, WIN.x0], [WIN.x1, b]]);
    if (y + h > DOOR.y0) xs = xs.flatMap(([a, b]) => (b <= DOOR.x0 || a >= DOOR.x1 ? [[a, b]] : [[a, DOOR.x0], [DOOR.x1, b]]));
    for (const [a, b] of xs) if (b - a > 0.5) segs.push(log(a, b, y, h));
    o.push(...segs);
    // a knot here and there
    if (rnd() > 0.4) {
      const kx = 70 + rnd() * 200;
      if (!(kx > WIN.x0 - 6 && kx < WIN.x1 + 6 && y + h > WIN.y0 && y < WIN.y1)) o.push(ell(kx, y + h * 0.45, 2.2, 1.3, LOG_D, 0.4));
    }
  }
  // the corner on the right, where the log ends stack up as round butts
  for (let y = 250; y < 472; y += LOGH) {
    o.push(ell(397, y + LOGH / 2, 6.4, LOGH / 2 - 0.4, LOG_L, 0.6));
    o.push(ell(397.6, y + LOGH / 2, 4.2, LOGH / 2 - 2.6, LOG, 0.3));
    o.push(dot(398, y + LOGH / 2, 0.9, LOG_D));
  }
  // ── the ceiling: dark planks, then a great round beam ──
  o.push(box(0, 214, 400, 26, CEIL));
  for (let x = 0; x < 400; x += 26) o.push(line(`M${x},214 L${x + 3},240`, CEIL_D, 0.8));
  o.push(box(0, 234, 400, 6, CEIL_D));
  o.push(rect(-2, 238, 404, 13, BEAM, 0.9));
  o.push(box(0, 240, 400, 3.5, BEAM_L));
  o.push(box(0, 247, 400, 3, '#5E3B1E', 0.6));
  // the lantern's hook on the beam
  o.push(line('M160,251 L160,262', OUT, 0.9));
  // ── the floor: long boards running back, a baseboard ──
  o.push(box(0, 470, 400, 44, FLOOR));
  o.push(rect(-2, 468, 404, 4, FLOOR_D, 0.7));
  for (let k = -8; k <= 8; k++) {
    const xb = 200 + k * 34;
    const xf = 200 + k * 52;
    o.push(line(`M${xb},472 L${xf},514`, FLOOR_LINE, 0.6));
  }
  for (const [y, w] of [[480, 30], [492, 42], [504, 54]]) {
    for (let x = (y % 3) * 11; x < 400; x += w * 2.6) o.push(box(x, y, w * 0.6, 1.4, FLOOR_L, 0.8));
  }
  // the rag rug between the bench and the table
  o.push(ell(186, 496, 70, 9, '#B9473A', 0.8));
  o.push(ell(186, 496, 60, 6.6, '#E4C27A', 0));
  o.push(ell(186, 496, 48, 4.6, '#3D6A8E', 0));
  o.push(ell(186, 496, 34, 2.8, '#E4C27A', 0));
  o.push(flat('M120,499 C150,505 222,505 252,499 C226,503 146,503 120,499 Z', '#8E3027'));

  // ── the door: frame, and the doorway that shows the snow and dawn outside ──
  o.push(rect(DOOR.x0 - 4, DOOR.y0 - 5, DOOR.x1 - DOOR.x0 + 8, 6, '#6E4524', 0.8));
  o.push(rect(DOOR.x0 - 4, DOOR.y0, 4, DOOR.y1 - DOOR.y0, '#7A4D2A', 0.7));
  o.push(rect(DOOR.x1, DOOR.y0, 4, DOOR.y1 - DOOR.y0, '#7A4D2A', 0.7));
  o.push(rect(DOOR.x0 - 6, DOOR.y1 - 1, DOOR.x1 - DOOR.x0 + 12, 4, '#6E4524', 0.7));   // the sill

  // ── the hooks over the chair: a coiled rope and an ice axe ──
  o.push(rect(62, 366, 38, 4, PINE_D, 0.6));
  for (const x of [70, 92]) o.push(line(`M${x},370 L${x},376 L${x + 3},374`, OUT, 0.9));
  o.push(ell(70, 388, 7, 11, '#D9B66A', 0.9));
  o.push(ell(70, 388, 4.4, 8, '#C29A4E', 0.5));
  o.push(line('M66,378 C64,390 66,398 70,399 M74,378 C76,390 74,398 70,399', '#A9833E', 0.6));
  o.push(line('M92,374 L95,412', '#6E5434', 2.2));
  o.push(fill('M86,376 C90,371 97,371 100,375 L97,377 C95,375 91,375 88,378 Z', '#9AA3AA', 0.6));
  o.push(fill('M93.5,410 L96.5,410 L95.6,416 Z', '#9AA3AA', 0.5));

  // ── crossed snowshoes hung on the wall, and a framed photograph of the summit ──
  for (const [cx, rot] of [[112, -16], [130, 16]]) {
    o.push(`<g transform="translate(${cx},322) rotate(${rot})">`
      + ell(0, 0, 8, 19, '#B98451', 1.1) + ell(0, 0, 6, 17, 'none', 0)
      + line('M-6,-8 L6,-8 M-6,-2 L6,-2 M-6,4 L6,4 M-4,10 L4,10 M0,-16 L0,16', '#E6D3A8', 0.5)
      + rect(-3, -4, 6, 4, '#7A4D2A', 0.4) + '</g>');
  }
  o.push(rect(240, 296, 34, 26, '#6E4524', 1));
  o.push(rect(243, 299, 28, 20, '#A8D0ED', 0.4));
  o.push(flat('M243,319 L252,306 L258,312 L264,302 L271,312 L271,319 Z', '#E9EEF2'));
  o.push(flat('M258,312 L264,302 L266,319 L258,319 Z', '#B4C3D3'));
  o.push(flat('M243,319 L271,319 L271,316 C262,313 252,314 243,316 Z', '#4F7A4E'));
  o.push(line('M257,293 L248,296 M257,293 L266,296', OUT, 0.6));

  // ── the chair by the door: a pine ladder-back ──
  o.push(rect(64, 418, 4, 66, PINE_D, 0.7));                                // back post
  o.push(rect(88, 418, 4, 66, PINE_D, 0.7));
  for (const y of [424, 434, 444]) o.push(rect(66, y, 24, 3.4, PINE, 0.6));
  o.push(fill('M60,462 L96,462 L98,468 L58,468 Z', PINE, 0.8));            // the seat
  o.push(box(59, 466, 39, 2, PINE_D));
  o.push(rect(60, 468, 4, 18, PINE_D, 0.6));
  o.push(rect(92, 468, 4, 18, PINE_D, 0.6));
  o.push(line('M62,478 L94,478', PINE_D, 1.2));

  // ── the cork board on the wall above the bench, with what is already pinned ──
  o.push(rect(102, 402, 50, 42, '#7A4D2A', 0.9));
  o.push(box(105, 405, 44, 36, CORK));
  for (let k = 0; k < 40; k++) o.push(dot(106 + rnd() * 42, 406 + rnd() * 34, 0.4, CORK_D));
  o.push(rect(132, 408, 14, 10, '#7DB7D6', 0.5));                          // a postcard of a lake
  o.push(flat('M132,415 L137,411 L141,414 L146,410 L146,418 L132,418 Z', '#5C8A4A'));
  o.push(dot(139, 408.6, 0.9, '#C4483B'));
  o.push(rect(132, 422, 13, 16, '#F6F1E6', 0.5));                          // a list
  for (const y of [426, 429, 432, 435]) o.push(line(`M134,${y} L${143 - (y % 5)},${y}`, '#8A8A8A', 0.5));
  o.push(dot(138.5, 422.8, 0.9, '#3D6EA8'));

  // ── the bench under it: pine, a plain plank on four legs ──
  o.push(board(98, 464, 94, 6));
  for (const x of [102, 184]) o.push(rect(x, 470, 4, 16, PINE_D, 0.7));
  o.push(line('M106,478 L184,478', PINE_D, 1.2));

  // ── the stove: a white enamel range with a black iron hob, the pipe going up ──
  o.push(rect(201, 238, 9, 202, IRON, 0.9));                               // the stove pipe
  o.push(box(203.5, 239, 2.2, 200, IRON_L));
  for (const y of [300, 360, 416]) o.push(rect(199.5, y, 12, 3, IRON, 0.6));
  o.push(rect(196, 446, 50, 34, ENAMEL, 1));                                // the body
  o.push(box(226, 447, 19, 32, ENAMEL_D));
  o.push(rect(193, 439.5, 56, 7, IRON, 0.9));                              // the hob slab
  o.push(box(195, 440.6, 52, 1.6, IRON_L));
  o.push(line('M194,449.5 L248,449.5', CHROME, 1.6));                       // the chrome rail
  for (const x of [196, 246]) o.push(circ(x, 449.5, 1.1, CHROME, 0.4));
  o.push(rect(200, 452, 18, 14, ENAMEL, 0.7));                              // the firebox door (its window is live)
  o.push(rect(203, 455, 12, 7, '#3A2A22', 0.5));
  o.push(rect(200, 468, 18, 9, ENAMEL, 0.6));                               // the ash pan
  o.push(rect(222, 452, 21, 25, ENAMEL, 0.7));                              // the oven door
  o.push(line('M225,456 L240,456', CHROME, 1.2));
  for (const [x, y] of [[214, 459], [214, 472.5]]) o.push(circ(x, y, 1.3, IRON_L, 0.4));
  o.push(rect(195, 480, 52, 4, IRON, 0.8));                                 // the plinth
  o.push(rect(197, 484, 4, 3, IRON, 0.5));
  o.push(rect(241, 484, 4, 3, IRON, 0.5));
  // a basket of split logs beside it
  o.push(fill('M250,470 L274,470 L271,486 L253,486 Z', '#B48A52', 0.8));
  o.push(line('M251,476 L273,476 M252,481 L272,481', '#94693A', 0.6));
  for (const [x, y] of [[255, 467], [262, 466], [269, 467.5]]) o.push(ell(x, y, 3.4, 3, '#C8955E', 0.6));
  for (const [x, y] of [[255, 467], [262, 466], [269, 467.5]]) o.push(dot(x, y, 1.2, '#E2B67E'));

  // ── a shelf on the wall behind the stove: tins, a jar, a folded map, a clock ──
  o.push(rect(214, 392, 70, 3.6, PINE_D, 0.7));
  o.push(line('M218,395.6 L222,401 M280,395.6 L276,401', PINE_D, 1.1));
  o.push(rect(218, 380, 9, 12, '#3D6EA8', 0.6));
  o.push(rect(229, 382, 8, 10, '#C4483B', 0.6));
  o.push(rect(239, 378, 8, 14, '#E8E2D2', 0.6));
  o.push(box(240, 381, 6, 2, '#B48A52'));
  o.push(fill('M252,384 C252,380 262,380 262,384 L262,392 L252,392 Z', '#9FC4C8', 0.6));
  o.push(rect(266, 384, 14, 8, '#E9D9A9', 0.6));
  o.push(line('M269,384 L269,392 M273,384 L273,392 M277,384 L277,392', '#B89C5A', 0.4));

  // ── the window: a deep pine frame, four panes cut through, gingham curtains, a sill ──
  const { x0, x1, y0, y1 } = WIN;
  const fr = 5;
  o.push(rect(x0 - fr, y0 - fr, x1 - x0 + fr * 2, fr, PINE_D, 0.8));
  o.push(rect(x0 - fr, y1, x1 - x0 + fr * 2, fr, PINE_D, 0.8));
  o.push(rect(x0 - fr, y0, fr, y1 - y0, PINE, 0.8));
  o.push(rect(x1, y0, fr, y1 - y0, PINE_D, 0.8));
  o.push(rect((x0 + x1) / 2 - 1.6, y0, 3.2, y1 - y0, PINE, 0.6));
  o.push(rect(x0, (y0 + y1) / 2 - 1.6, x1 - x0, 3.2, PINE, 0.6));
  o.push(rect(x0 - 9, y1 + fr, x1 - x0 + 18, 4, PINE, 0.8));                  // the sill
  o.push(box(x0 - 8, y1 + fr + 2.4, x1 - x0 + 16, 1.4, PINE_D));
  // a pot of edelweiss on the sill
  o.push(fill(`M${x0 + 4},${y1 - 1} L${x0 + 14},${y1 - 1} L${x0 + 12.5},${y1 + fr} L${x0 + 5.5},${y1 + fr} Z`, '#B8643A', 0.6));
  for (const [dx, dy] of [[0, -5], [-3.4, -3], [3.6, -3.4]]) {
    o.push(line(`M${x0 + 9},${y1 - 1} L${x0 + 9 + dx * 0.5},${y1 - 1 + dy}`, '#6E8A4A', 0.6));
    o.push(dot(x0 + 9 + dx, y1 - 2 + dy, 1.6, '#F1EFE6'));
    o.push(dot(x0 + 9 + dx, y1 - 2 + dy, 0.5, '#D8B23C'));
  }
  // gingham curtains tied back on each side
  const curtain = (xa, xb, side) => {
    const out = [];
    const d = side < 0
      ? `M${xa},${y0 - 8} L${xb},${y0 - 8} C${xb - 2},${y0 + 20} ${xa + 10},${y0 + 36} ${xa + 6},${y0 + 52} C${xa + 10},${y0 + 66} ${xa + 6},${y1} ${xa + 2},${y1 + 4} L${xa},${y1 + 4} Z`
      : `M${xb},${y0 - 8} L${xa},${y0 - 8} C${xa + 2},${y0 + 20} ${xb - 10},${y0 + 36} ${xb - 6},${y0 + 52} C${xb - 10},${y0 + 66} ${xb - 6},${y1} ${xb - 2},${y1 + 4} L${xb},${y1 + 4} Z`;
    out.push(fill(d, CURTAIN, 0.8));
    for (let k = 0; k < 7; k++) out.push(box(Math.min(xa, xb) + 1, y0 - 6 + k * 13, Math.abs(xb - xa) - 2, 2.2, CHECK, 0.65));
    out.push(fill(`M${side < 0 ? xa + 3 : xb - 9},${y0 + 49} l6,0 l0,5 l-6,0 Z`, CURTAIN_D, 0.5));
    return out.join('');
  };
  o.push(curtain(x0 - 12, x0 + 8, -1));
  o.push(curtain(x1 - 8, x1 + 12, 1));
  o.push(rect(x0 - 16, y0 - 12, x1 - x0 + 32, 3.4, IRON, 0.6));               // the curtain rail

  // ── cut the panes and the doorway out: the dawn shows through ──
  return `<defs><mask id="g7hole"><rect x="0" y="214" width="400" height="300" fill="#fff"/>`
    + `<rect x="${x0}" y="${y0}" width="${(x1 - x0) / 2 - 1.6}" height="${(y1 - y0) / 2 - 1.6}" fill="#000"/>`
    + `<rect x="${(x0 + x1) / 2 + 1.6}" y="${y0}" width="${(x1 - x0) / 2 - 1.6}" height="${(y1 - y0) / 2 - 1.6}" fill="#000"/>`
    + `<rect x="${x0}" y="${(y0 + y1) / 2 + 1.6}" width="${(x1 - x0) / 2 - 1.6}" height="${(y1 - y0) / 2 - 1.6}" fill="#000"/>`
    + `<rect x="${(x0 + x1) / 2 + 1.6}" y="${(y0 + y1) / 2 + 1.6}" width="${(x1 - x0) / 2 - 1.6}" height="${(y1 - y0) / 2 - 1.6}" fill="#000"/>`
    + `<rect x="${DOOR.x0}" y="${DOOR.y0}" width="${DOOR.x1 - DOOR.x0}" height="${DOOR.y1 - DOOR.y0}" fill="#000"/>`
    + `</mask></defs><g mask="url(#g7hole)">${o.join('')}</g>`
    // the window glass's faint sheen
    + flat(`M${x0 + 3},${y0 + 3} L${x0 + 16},${y0 + 3} L${x0 + 3},${y0 + 18} Z`, '#FFFFFF', 0.25)
    + flat(`M${(x0 + x1) / 2 + 5},${(y0 + y1) / 2 + 5} L${(x0 + x1) / 2 + 16},${(y0 + y1) / 2 + 5} L${(x0 + x1) / 2 + 5},${(y0 + y1) / 2 + 18} Z`, '#FFFFFF', 0.25);
}

/** The door leaf: planks, two cross braces, an iron latch. Hinged on its LEFT edge (x 0). */
export function hutDoor() {
  const o = [];
  o.push(rect(0, 0, 48, 110, '#A06A3A', 1));
  for (const x of [12, 24, 36]) o.push(line(`M${x},1 L${x},109`, '#7E5129', 0.7));
  o.push(box(36.5, 1, 11, 108, '#8A5A2F'));
  for (const y of [16, 90]) o.push(rect(2, y, 44, 6, '#8A5A2F', 0.7));
  o.push(line('M6,22 L42,88', '#7E5129', 3.4));
  o.push(rect(39, 52, 5, 10, IRON, 0.6));
  o.push(circ(41.5, 64, 1.4, IRON, 0.4));
  return o.join('');
}

/** NEAR: the table on the right, in three-quarter view, in front of everyone. */
export function hutTable() {
  const o = [];
  // back legs (partly hidden), then the top's front edge, apron and front legs
  o.push(rect(276, 466, 6, 22, '#7E5129', 0.8));
  o.push(rect(382, 466, 6, 22, '#7E5129', 0.8));
  // the top, seen from above: its far edge set back a little to the right
  o.push(fill('M258,462 L264,448 L400,448 L400,462 Z', '#B98451', 1));
  for (const y of [452.6, 457.2]) o.push(line(`M${262 - (y - 452) * 0.4},${y} L400,${y}`, '#9A6638', 0.5));
  o.push(rect(256, 462, 146, 6, '#9A6638', 0.9));
  o.push(box(258, 466, 142, 1.6, '#7E5129'));
  o.push(rect(262, 468, 138, 6, '#8A5A2F', 0.7));
  o.push(rect(262, 468, 8, 30, '#9A6638', 0.9));
  o.push(box(266.5, 469, 3, 28, '#7E5129'));
  o.push(rect(390, 468, 8, 30, '#9A6638', 0.9));
  return o.join('');
}

/** The trail map, pinned flat on the table: paper, green valleys, contour lines, a blue
 *  lake with its hut at the front, the dotted trail climbing to the summit at the back. */
export function trailMap() {
  const o = [];
  // drawn in its own frame, 46 × 15: the top face of the table is a slanted plane
  o.push(fill('M1,14 L6,1 L45,1 L43,14 Z', '#F1E6C8', 0.6));
  o.push(flat('M2,13 L6,3.6 L22,3.6 L18,13 Z', '#BFD69A', 0.9));
  o.push(flat('M22,7 L27,2 L43,2 L41,8 Z', '#D9C6A6', 0.9));
  o.push(line('M7,11 C13,8.6 19,9 24,6.4 M10,12.6 C18,10.4 26,10 32,7.4 M27,4.6 C32,3.4 37,3.2 42,2.6', '#A99268', 0.4));
  // the lake and the hut by it (front left)
  o.push(ell(8, 11.2, 4, 1.5, '#7DB7D6', 0.35));
  o.push(rect(11.4, 8.6, 2.4, 1.6, '#B8432F', 0.22));
  // the summit, a little triangle at the back
  o.push(fill('M29.6,3.6 L32,1.2 L34.4,3.6 Z', '#8C7A66', 0.25));
  // the trail: a red dotted line zigzagging up from the hut to the summit
  o.push(line('M13,9.6 L19,8.4 L17,6.6 L25,5.4 L23.6,4.2 L31.6,3', '#B8432F', 0.5));
  return o.join('');
}

/** The guide's boots, standing together by the stove. */
export function boots() {
  const one = (x) => fill(`M${x},2 L${x + 7},2 L${x + 7},10 C${x + 9},10.6 ${x + 13},11 ${x + 13.4},13 L${x + 13.4},15 L${x - 0.6},15 Z`, '#6A4A30', 0.6)
    + rect(x - 0.8, 14.4, 14.4, 2.4, '#2B2420', 0.4, 0.8)
    + line(`M${x + 1.5},4 L${x + 5.5},5 M${x + 1.5},6.6 L${x + 6},7.6 M${x + 2},9.2 L${x + 7.5},10`, '#D8C08A', 0.5)
    + box(x + 0.6, 2.6, 2, 8, '#80593A');
  return one(1) + one(10);
}

/** The bun's enormous rucksack: a red canvas body, a lid with a buckle, side pockets, a
 *  rolled mat strapped under it, a top loop. Drawn upright, 34 × 42, its centre at 0,0. */
export function rucksack() {
  const o = [];
  o.push(fill('M-15,-14 C-16,-20 -10,-21 0,-21 C10,-21 16,-20 15,-14 L16,15 C16,19 12,20 0,20 C-12,20 -16,19 -16,15 Z', '#C84B36', 0.9));
  o.push(flat('M6,-20 C12,-19.6 15,-18 15,-14 L16,15 C16,18.6 13,19.6 8,20 Z', '#A63A28'));
  o.push(fill('M-15,-14 C-15,-22 15,-22 15,-14 L14,-6 C8,-4 -8,-4 -14,-6 Z', '#9E3624', 0.8));          // the lid
  o.push(rect(-2.4, -7, 4.8, 5, '#2B2420', 0.4));                                                         // the buckle
  o.push(line('M0,-4.6 L0,12', '#2B2420', 1.1));
  o.push(fill('M-17,0 L-11,0 L-11,13 L-17,13 C-18.4,13 -18.4,0 -17,0 Z', '#B84330', 0.6));               // side pockets
  o.push(fill('M17,0 L11,0 L11,13 L17,13 C18.4,13 18.4,0 17,0 Z', '#9E3624', 0.6));
  o.push(line('M-12,-21 C-8,-26 8,-26 12,-21', '#2B2420', 1.2));                                         // the top loop
  o.push(rect(-15, 16, 30, 7, '#4E7A8E', 0.7, 3.5));                                                      // a rolled mat
  o.push(line('M-8,16 L-8,23 M8,16 L8,23', '#2B2420', 0.7));
  return o.join('');
}

// ══════════════════════════════════════════════════════════════════════════════
// THE TRAIL — drawn in its own frame (x 0–400), laid at world x 400.
// ══════════════════════════════════════════════════════════════════════════════

/** FAR: the morning sky, the snowy range, the valley far below with its turquoise lake and
 *  the little lake hut, the forest on the valley sides. */
export function trailFar() {
  const o = [];
  const bands = [214, 262, 300, 334, 372];
  for (let k = 0; k < 4; k++) o.push(box(0, bands[k], 400, bands[k + 1] - bands[k] + 0.3, SKY[k]));
  // the snowy range across the back, lit on the left of each peak
  const peaks = [[-10, 330], [34, 286], [64, 304], [100, 272], [140, 300], [176, 280], [214, 312], [250, 290], [292, 318], [330, 296], [370, 316], [410, 300]];
  const top = 'M' + peaks.map(([x, y]) => `${x},${y}`).join(' L') + ' L410,372 L-10,372 Z';
  o.push(fill(top, RANGE, 0.8));
  for (let k = 0; k < peaks.length - 1; k += 1) {
    const [ax, ay] = peaks[k], [bx, by] = peaks[k + 1];
    if (ay < by) o.push(flat(`M${ax},${ay} L${bx},${by} L${bx - 6},${by + 34} L${ax + 4},${ay + 40} Z`, RANGE_D));
  }
  o.push(line('M100,272 L94,300 M176,280 L170,310 M34,286 L30,312 M250,290 L246,316', RANGE_ROCK, 0.7));
  o.push(flat('M-10,352 C60,344 140,348 210,342 C280,338 350,346 410,342 L410,372 L-10,372 Z', RANGE_D));
  // under it all, the valley's own green, so nothing shows through between the layers
  o.push(box(-10, 360, 420, 160, FOREST_D));
  o.push(flat('M-10,374 C60,366 140,370 210,366 C280,362 350,368 410,364 L410,390 L-10,390 Z', HILL_FAR_D));
  // the valley sides: blue-green hills stepping down to the lake
  o.push(fill('M-10,356 C30,350 70,356 110,370 C140,382 160,398 170,410 L-10,410 Z', HILL_FAR, 0.7));
  o.push(fill('M410,350 C350,354 290,362 250,378 C220,390 200,402 190,412 L410,412 Z', HILL_FAR, 0.7));
  o.push(flat('M300,360 C270,368 240,384 210,404 L250,404 C280,384 320,370 410,358 L410,352 Z', HILL_FAR_D));
  // forest on both sides of the valley floor
  o.push(fill('M-10,380 C40,378 90,386 130,398 C150,404 166,412 176,420 L-10,422 Z', FOREST, 0.7));
  o.push(fill('M410,378 C340,382 280,392 230,404 C214,408 202,414 194,420 L410,424 Z', FOREST, 0.7));
  for (let k = 0; k < 26; k++) {
    const x = rnd() * 400;
    const yb = x < 190 ? 396 + (x / 190) * 18 : 412 - ((x - 190) / 210) * 22;
    o.push(flat(`M${f2(x)},${f2(yb - 7)} L${f2(x + 3)},${f2(yb + 1)} L${f2(x - 3)},${f2(yb + 1)} Z`, FOREST_D));
  }
  // the valley floor: a meadow round the lake
  o.push(flat('M-10,424 C40,416 110,412 170,410 C220,412 270,418 320,420 C360,421 390,420 410,418 L410,440 L-10,440 Z', MEADOW));
  o.push(flat('M-10,432 C140,426 260,428 410,428 L410,440 L-10,440 Z', MEADOW_D));
  // the lake, turquoise, with its paler rim and a darker deep
  o.push(fill('M92,420 C112,412 168,410 202,414 C226,417 232,424 214,428 C180,434 120,434 98,428 C88,426 86,422 92,420 Z', LAKE, 0.7));
  o.push(flat('M120,420 C140,416 180,416 200,419 C190,424 150,426 120,424 Z', LAKE_D));
  o.push(line('M100,421 C120,416 160,414 196,416', LAKE_L, 0.8));
  // the little lake hut on its shore: white walls, a red roof
  o.push(rect(222, 412, 12, 7, HUTWALL, 0.5));
  o.push(fill('M220.4,412.4 L228,406.6 L235.6,412.4 Z', HUTRED, 0.5));
  o.push(box(225, 414.4, 2, 4.6, '#7A5A3E'));
  o.push(line('M234,418.6 L240,420', '#8A7A5E', 0.4));
  // the near hillside below the trail, falling away into the valley: forest, a meadow strip
  o.push(fill('M-10,434 C40,428 90,432 140,438 C190,444 240,440 300,432 C340,428 380,430 410,428 L410,520 L-10,520 Z', FOREST, 0.7));
  o.push(flat('M-10,446 C60,440 140,448 220,452 C280,454 340,448 410,446 L410,520 L-10,520 Z', FOREST_D));
  for (let k = 0; k < 30; k++) {
    const x = rnd() * 400;
    const yb = 440 + rnd() * 20;
    o.push(flat(`M${f2(x)},${f2(yb - 9)} L${f2(x + 4)},${f2(yb + 1)} L${f2(x - 4)},${f2(yb + 1)} Z`, k % 3 ? FOREST_D : '#355E40'));
  }
  return o.join('');
}

/** A dwarf pine: a low dark mound in three lobes, lit on its left. */
function dwarf(x, yb, s) {
  return fill(`M${x - s},${yb} C${x - s * 1.1},${yb - s * 0.6} ${x - s * 0.5},${yb - s * 0.9} ${x - s * 0.1},${yb - s * 0.7} C${x + s * 0.2},${yb - s * 1.05} ${x + s * 0.9},${yb - s * 0.9} ${x + s},${yb - s * 0.4} C${x + s * 1.2},${yb - s * 0.2} ${x + s},${yb} ${x + s * 0.8},${yb} Z`, DWARF, 0.7)
    + flat(`M${x + s * 0.1},${yb - s * 0.3} C${x + s * 0.5},${yb - s * 0.7} ${x + s * 0.9},${yb - s * 0.6} ${x + s},${yb - s * 0.35} C${x + s * 1.1},${yb - s * 0.15} ${x + s * 0.95},${yb} ${x + s * 0.8},${yb} L${x},${yb} Z`, DWARF_D);
}
/** A boulder: a lumpy grey stone, lit on its top left, a dark crack. */
function boulder(x, yb, w, h) {
  return fill(`M${x - w / 2},${yb} C${x - w / 2 - 1},${yb - h * 0.6} ${x - w * 0.3},${yb - h} ${x - w * 0.05},${yb - h} C${x + w * 0.3},${yb - h * 1.04} ${x + w / 2},${yb - h * 0.6} ${x + w / 2 + 1},${yb} Z`, ROCK, 0.9)
    + flat(`M${x + w * 0.05},${yb - h * 0.96} C${x + w * 0.3},${yb - h} ${x + w / 2},${yb - h * 0.6} ${x + w / 2 + 1},${yb} L${x + w * 0.1},${yb} C${x + w * 0.2},${yb - h * 0.4} ${x + w * 0.1},${yb - h * 0.7} ${x + w * 0.05},${yb - h * 0.96} Z`, ROCK_D)
    + flat(`M${x - w * 0.36},${yb - h * 0.72} C${x - w * 0.24},${yb - h * 0.92} ${x - w * 0.05},${yb - h * 0.95} ${x + w * 0.02},${yb - h * 0.9} C${x - w * 0.12},${yb - h * 0.82} ${x - w * 0.26},${yb - h * 0.7} ${x - w * 0.36},${yb - h * 0.72} Z`, ROCK_L);
}

/** MID + NEAR: the mountainside — the drop to the valley and the valley path on the left,
 *  the trail running across the front, the scree slope with the zigzag path and its fixed
 *  rope, the sheer cliff on the right, the rocks they rest on, the signpost's pole. */
export function trailMid() {
  const o = [];
  // ── the cliff on the right: sheer grey rock in blocky ledges, to the top of the frame ──
  o.push(fill('M300,520 L296,470 L304,430 L298,392 L310,350 L304,310 L318,268 L314,226 L330,206 L420,206 L420,520 Z', ROCK, 1));
  o.push(flat('M350,206 L420,206 L420,520 L360,520 L366,470 L356,430 L364,392 L352,350 L362,310 L350,268 Z', ROCK_D));
  for (const [x, y, w] of [[318, 252, 40], [306, 296, 52], [312, 338, 46], [302, 378, 60], [306, 418, 56], [300, 456, 64]]) {
    o.push(line(`M${x},${y} L${x + w},${y - 3}`, ROCK_DD, 1));
    o.push(box(x + 2, y + 1, w * 0.5, 1.4, ROCK_L, 0.9));
  }
  o.push(line('M334,226 L330,262 L338,300 L332,344 L340,390 L334,440 M372,240 L378,288 L370,330 L380,380 L372,430', ROCK_DD, 0.8));
  o.push(dwarf(346, 300, 9));
  o.push(dwarf(382, 360, 11));
  o.push(dwarf(324, 412, 7));
  // ── the scree slope between the trail and the cliff, falling from the cliff's foot ──
  o.push(fill('M216,500 C236,470 262,440 300,402 L306,404 L304,500 Z', SCREE, 0.9));
  o.push(flat('M262,470 C276,452 290,430 302,412 L304,500 L280,500 Z', SCREE_D));
  for (let k = 0; k < 70; k++) {
    const t = rnd();
    const x = 222 + t * 80 + rnd() * 8;
    const yTop = 500 - t * 96;
    const y = yTop + rnd() * (500 - yTop) * 0.9;
    if (y > 498) continue;
    o.push(ell(x, y, 1.2 + rnd() * 1.3, 0.8 + rnd() * 0.6, rnd() > 0.5 ? ROCK_L : ROCK_D, 0.3));
  }
  // the zigzag path across the scree: a first leg up to a landing at the bend, then on up
  o.push(fill('M242,501 L292,467 L326,467 L326,474 L300,474 L254,504 Z', DIRT, 0.8));          // first leg and landing
  o.push(flat('M254,504 L300,474 L326,474 L326,471 L298,471 L250,502 Z', DIRT_D));
  o.push(fill('M326,464 L284,442 L289,438 L328,458 Z', DIRT, 0.7));                              // second leg
  o.push(flat('M284,442 L326,464 L327,462 L286,440 Z', DIRT_D));
  o.push(fill('M286,440 L310,424 L314,427 L292,443 Z', DIRT, 0.6));                              // third leg
  o.push(fill('M310,424 L300,414 L304,411 L315,421 Z', DIRT_D, 0.5));
  // the fixed rope on its posts, along the first leg and round the bend
  for (const [x, yb, h] of [[262, 493, 22], [296, 469, 24], [288, 442, 18], [306, 426, 14]]) {
    o.push(rect(x - 1.4, yb - h, 2.8, h, POST, 0.6));
    o.push(box(x - 0.2, yb - h + 1, 1.2, h - 2, POST_D));
  }
  o.push(line('M262,473 C274,474 286,456 296,447', ROPE, 1.3));
  o.push(line('M296,447 C294,436 292,428 288,425', ROPE, 1.1));
  o.push(line('M288,425 C296,420 302,414 306,413', ROPE, 0.9));
  // ── the drop on the left: the edge of the trail, grass, rocks, the valley path going down ──
  o.push(fill('M-10,520 L-10,454 C20,450 50,452 80,458 C110,462 140,464 160,470 C190,474 220,476 250,482 L262,520 Z', GRASS, 0.9));
  o.push(flat('M-10,454 C20,450 50,452 80,458 C110,462 140,464 160,470 L120,470 C90,466 50,462 -10,462 Z', GRASS_L));
  o.push(fill('M-10,470 C30,464 70,470 110,478 L140,484 L140,490 L104,486 C70,480 30,478 -10,482 Z', DIRT, 0.7));   // the valley path
  o.push(flat('M-10,476 C30,472 70,476 110,482 L140,488 L140,490 L104,486 C70,480 30,478 -10,482 Z', DIRT_D));
  // ── the trail across the front ──
  o.push(fill('M-10,490 C60,486 140,488 216,494 C250,496 290,498 420,496 L420,520 L-10,520 Z', DIRT, 1));
  o.push(flat('M-10,504 C80,500 200,504 420,508 L420,520 L-10,520 Z', DIRT_D));
  for (let k = 0; k < 60; k++) {
    const x = rnd() * 400;
    const y = 494 + rnd() * 18;
    o.push(ell(x, y, 0.9 + rnd() * 1.4, 0.6 + rnd() * 0.5, rnd() > 0.55 ? DIRT_L : ROCK_D, 0.25));
  }
  // grass tufts along its edge
  for (const x of [8, 26, 52, 88, 120, 150, 176, 206]) {
    o.push(line(`M${x},${490 - (x % 4)} l-2,-6 M${x + 2},${490 - (x % 4)} l0,-8 M${x + 4},${490 - (x % 4)} l2,-6`, GRASS_D, 0.8));
  }
  // dwarf pines and stones at the edge of the drop
  o.push(dwarf(24, 462, 12));
  o.push(dwarf(104, 470, 9));
  o.push(boulder(140, 478, 22, 12));
  o.push(boulder(60, 470, 14, 8));
  // the rocks they rest on: a seat at the foot of the zigzag and a boulder at the bend
  o.push(boulder(226, 497, 28, 15));
  o.push(boulder(306, 470, 24, 19));
  // the signpost's pole: a round grey pole, its cap
  o.push(rect(194.2, 324, 3.6, 172, '#A7AEB4', 0.7));
  o.push(box(196.4, 325, 1, 170, '#8A9197'));
  o.push(rect(193, 322, 6, 3, '#7E858B', 0.5));
  return o.join('');
}

/** A soaring alpine chough: black, yellow bill, wings fingered. Facing right. */
export function chough() {
  return fill('M-12,0 C-8,-4 -4,-4 0,0.4 C4,-4 8,-4 12,0 L10.6,0.4 L11.4,1.4 L9.6,1 L10,2 C6,0 3,1.2 1,2.4 L-1,2.4 C-3,1.2 -6,0 -10,2 L-9.6,1 L-11.4,1.4 L-10.6,0.4 Z', '#1F1D1C', 0.4)
    + ell(1.6, 1.8, 2.8, 1.5, '#1F1D1C', 0.3)
    + fill('M4.2,1.2 L6.6,1.8 L4.2,2.4 Z', '#E2B33A', 0.2);
}

const SAME = (v) => ({ view: v, box: v });
const BAND = { x: 0, y: 214, w: 400, h: 300 };

export const ART = [
  { name: 'growth7-hut-far', svg: hutFar, ...SAME(BAND) },
  { name: 'growth7-hut-room', svg: hutRoom, ...SAME(BAND) },
  { name: 'growth7-hut-door', svg: hutDoor, view: { x: -0.6, y: -0.6, w: 49.2, h: 111.2 }, box: { x: 7.4, y: 361.4, w: 49.2, h: 111.2 } },
  { name: 'growth7-hut-table', svg: hutTable, view: { x: 254, y: 446, w: 148, h: 66 }, box: { x: 254, y: 446, w: 148, h: 66 } },
  { name: 'growth7-map', svg: trailMap, view: { x: 0, y: 0, w: 46, h: 15 }, box: { x: 258, y: 447, w: 46, h: 15 } },
  { name: 'growth7-boots', svg: boots, view: { x: -0.6, y: 1, w: 25, h: 17 }, box: { x: 225.4, y: 471, w: 25, h: 17 } },
  { name: 'growth7-rucksack', svg: rucksack, view: { x: -19, y: -27, w: 38, h: 51 }, box: { x: -19, y: -27, w: 38, h: 51 } },
  { name: 'growth7-trail-far', svg: trailFar, view: BAND, box: { x: 400, y: 214, w: 400, h: 300 } },
  { name: 'growth7-trail-mid', svg: trailMid, view: BAND, box: { x: 400, y: 214, w: 400, h: 300 } },
  { name: 'growth7-chough', svg: chough, ...SAME({ x: -13, y: -5, w: 26, h: 9 }) },
];

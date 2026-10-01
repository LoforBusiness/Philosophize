// ─────────────────────────────────────────────────────────────────────────────
// THE SEVEN SUBJECT PICTURES, IN THE COLOURS OF THE THINGS IN THEM (2026-09-30).
//
// The owner, on the subject cards: "they only follow the color scheme, which honestly
// isn't as important anymore … if there is brick in the background, you can use proper
// colors for that. Or if there's a fence … the quick start cards look better than the
// subject cards." The first posters (posters.ts) built every setting in tints of the
// subject's own hue and every object in paper with an ink outline, so a market, a lab
// and a desert were seven shades of one colour each. These are drawn the way the Quick
// Start pictures are (quickStartScenes.ts, the Imprint editorial direction the owner
// chose): flat fills and NO outline, two tones an object with the light from the top
// left, depth in layers, a pill of shadow under whatever stands, and every material
// its own colour — brick is brick, marble is marble, a pine is green.
//
// ── THE SAME FRAME AS THE POSTERS ───────────────────────────────────────────
//
// 200×150 units, the floor at y 116, every object between x 22 and 178 (posters.ts
// CORE), and every setting drawn far past the frame so that posterViewBox can grow the
// picture sideways to any card's shape and find more of the same place there.
//
// ZERO IMPORTS, so `npm run sheet:subjects` and `make:posters` build it in plain Node.
// The colours are written here and nowhere else in components/subjects: a material's
// colour is a fact about the material, not a subject's colour (check:subjects §7).
// ─────────────────────────────────────────────────────────────────────────────

export type SceneKey = 'philosophy' | 'psychology' | 'personal-growth' | 'business' | 'economics' | 'science' | 'history';

const FLOOR = 116;
const L0 = -420;
const LW = 1040;

const n = (v: number) => Math.round(v * 100) / 100;
const rect = (x: number, y: number, w: number, h: number, fill: string, rx = 0, op = 1) =>
  `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}"${rx ? ` rx="${n(rx)}"` : ''} fill="${fill}"${op < 1 ? ` opacity="${op}"` : ''}/>`;
const circle = (x: number, y: number, r: number, fill: string, op = 1) =>
  `<circle cx="${n(x)}" cy="${n(y)}" r="${n(r)}" fill="${fill}"${op < 1 ? ` opacity="${op}"` : ''}/>`;
const ellipse = (x: number, y: number, rx: number, ry: number, fill: string, op = 1) =>
  `<ellipse cx="${n(x)}" cy="${n(y)}" rx="${n(rx)}" ry="${n(ry)}" fill="${fill}"${op < 1 ? ` opacity="${op}"` : ''}/>`;
const path = (d: string, fill: string, op = 1) => `<path d="${d}" fill="${fill}"${op < 1 ? ` opacity="${op}"` : ''}/>`;
const line = (d: string, stroke: string, w: number, op = 1) =>
  `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${op < 1 ? ` opacity="${op}"` : ''}/>`;
const poly = (pts: number[], fill: string, op = 1) => {
  let d = '';
  for (let i = 0; i < pts.length; i += 2) d += `${i ? 'L' : 'M'}${n(pts[i])} ${n(pts[i + 1])}`;
  return path(`${d}Z`, fill, op);
};
/** A band across the whole setting. */
const band = (y: number, h: number, fill: string, op = 1) => rect(L0, y, LW, h, fill, 0, op);
/** A cast shadow: a pill, never an oval (group AG). */
const pill = (x: number, y: number, w: number, op = 0.22) => rect(x - w / 2, y - 3.5, w, 7, '#1E1712', 3.5, op);
/** A deterministic sequence in [0, 1). */
function seq(seed: number) {
  let a = seed >>> 0;
  return () => { a = (Math.imul(a, 1664525) + 1013904223) >>> 0; return a / 4294967296; };
}
/** A flat cloud: a rounded base and three lobes. */
function cloud(x: number, y: number, w: number, fill: string, op = 1) {
  const r = w / 5;
  return `<g fill="${fill}"${op < 1 ? ` opacity="${op}"` : ''}><rect x="${n(x)}" y="${n(y - r * 0.9)}" width="${n(w)}" height="${n(r * 0.9)}" rx="${n(r * 0.45)}"/>`
    + `<circle cx="${n(x + w * 0.3)}" cy="${n(y - r * 0.9)}" r="${n(r)}"/><circle cx="${n(x + w * 0.58)}" cy="${n(y - r * 1.2)}" r="${n(r * 1.25)}"/>`
    + `<circle cx="${n(x + w * 0.8)}" cy="${n(y - r * 0.7)}" r="${n(r * 0.8)}"/></g>`;
}

// ── PHILOSOPHY ──────────────────────────────────────────────────────────────
// REFERENCE: a sculpture gallery — a Pompeian-red wall with a round-headed niche, a
// marble bust on a grey socle before it, an Ionic column (volutes, fluting, plinth),
// a cream marble floor. A green-bound book lies on the floor.
function philosophy(): string {
  const C = {
    wall: '#A4483A', wallLit: '#B4574A', frieze: '#7E332A', cream: '#EADFC8', creamSh: '#CDBFA2',
    niche: '#6E2C24', nicheLit: '#86372D', skirting: '#5C2620',
    floor: '#E3D9C5', floorSh: '#C9BCA3', floorLine: '#D2C6AE',
    marble: '#F3EEE4', marbleSh: '#D3CBBC', marbleDeep: '#B9B0A0', socle: '#9EA19E', socleSh: '#7F8380',
    curls: '#E0D8C9', book: '#3E5B45', bookSh: '#2E4434', pages: '#F1E8D2', gilt: '#C9A24A',
  };
  // The wall, a wash of light falling from the left, a frieze along its top.
  let s = band(-320, FLOOR + 320, C.wall)
    + path('M-420 -320L120 -320L-40 116L-420 116Z', C.wallLit, 0.55)
    + band(8, 6, C.frieze) + band(14, 2, C.cream);
  // The niche: a dark recess with a lit inner edge, a cream moulding and a ledge.
  s += path('M50 108L50 52A34 34 0 0 1 118 52L118 108Z', C.niche)
    + path('M50 108L50 52A34 34 0 0 1 72 21L72 24A31 31 0 0 0 54 52L54 108Z', C.nicheLit)
    + line('M48 108L48 52A36 36 0 0 1 120 52L120 108', C.cream, 3.4)
    + rect(42, 104, 84, 5, C.cream) + rect(42, 109, 84, 2.5, C.creamSh);
  // Skirting, then the floor with its tile joints running back to the wall.
  s += band(110, 6, C.skirting) + band(FLOOR, 400, C.floor) + band(FLOOR, 2, C.floorSh);
  for (let x = -420; x <= 620; x += 28) s += line(`M${x} ${FLOOR}L${100 + (x - 100) * 1.7} 152`, C.floorLine, 1.2);
  s += band(130, 1.2, C.floorLine) + band(143, 1.2, C.floorLine);
  // The column on the right.
  s += pill(146, 118, 48)
    + rect(124, 108, 44, 9, C.marble, 1.5) + rect(152, 108, 16, 9, C.marbleSh)
    + rect(130, 46, 32, 62, C.marble) + rect(150, 46, 12, 62, C.marbleSh)
    + [136, 142, 148].map((x) => rect(x, 48, 1.6, 58, C.marbleSh)).join('') + [154, 158].map((x) => rect(x, 48, 1.4, 58, C.marbleDeep, 0, 0.6)).join('')
    + rect(127, 38, 38, 8, C.marble, 3) + rect(150, 38, 15, 8, C.marbleSh, 2)
    + circle(127, 41, 7, C.marble) + circle(127, 41, 3.8, C.marbleSh) + circle(127, 41, 1.6, C.marbleDeep)
    + circle(165, 41, 7, C.marbleSh) + circle(165, 41, 3.8, C.marbleDeep) + circle(165, 41, 1.6, C.marble)
    + rect(121, 29, 50, 8, C.marble, 2) + rect(152, 29, 19, 8, C.marbleSh, 1);
  // The bust, in the niche: a grey socle, a truncated chest, a neck and a head of curls.
  s += pill(84, 118, 56)
    + rect(66, 107, 36, 10, C.socle, 2) + rect(88, 107, 14, 10, C.socleSh, 1)
    + path('M74 107L76 98L92 98L94 107Z', C.socle) + path('M86 98L92 98L94 107L87 107Z', C.socleSh)
    + rect(68, 92, 32, 7, C.marbleSh, 3)
    + path('M52 94Q50 72 70 68L98 68Q118 72 116 94Z', C.marble)
    + path('M98 68Q118 72 116 94L102 94Q105 78 96 69Z', C.marbleSh)
    + line('M60 86Q70 79 80 84M88 82Q100 78 110 86', C.marbleSh, 2)
    + path('M77 56L77 70L91 70L91 56Z', C.marbleSh)
    + path('M68 42Q68 20 86 20Q104 20 104 40Q104 46 108 52L102 54Q103 60 98 62Q92 65 86 62Q70 60 68 42Z', C.marble)
    + path('M96 56Q103 54 104 46Q104 40 108 52L102 54Q103 60 98 62Q92 65 86 62Z', C.marbleSh, 0.8)
    + path('M67 40Q64 20 84 16Q100 14 104 28Q98 24 92 28Q86 24 80 30Q76 28 74 36Q70 36 67 40Z', C.curls)
    + [[72, 26], [80, 22], [89, 21], [97, 22]].map(([x, y]) => circle(x, y, 3, C.marbleSh, 0.7)).join('')
    + line('M92 42Q95 40 98 42', C.marbleDeep, 1.8);
  // The book on the floor, front left.
  s += pill(39, 128, 38)
    + rect(22, 120, 34, 6, C.pages, 1) + rect(22, 116, 34, 5, C.book, 1.5) + rect(22, 125, 34, 2.4, C.bookSh, 1)
    + rect(30, 116, 3, 5, C.gilt) + rect(46, 116, 3, 5, C.gilt);
  return s;
}

// ── PSYCHOLOGY ──────────────────────────────────────────────────────────────
// REFERENCE: a phrenology bust (white glazed ceramic, a bald head in profile on
// shoulders) in a consulting room — a sage papered wall, a gilt-framed Rorschach card,
// walnut panelling under a dado rail, a red patterned rug on a planked floor.
function psychology(): string {
  const C = {
    wall: '#8EA38C', stripe: '#86998A', dado: '#6D4A33', dadoLit: '#80583D', rail: '#5A3A28',
    gilt: '#B98B3F', giltSh: '#946D2C', card: '#F1E8D4', blot: '#2B2B33',
    floor: '#8A5B3B', floorLine: '#744A30', rug: '#8E3B3B', rugEdge: '#6F2C2C', rugPat: '#D9B98A',
    head: '#F2ECE1', headSh: '#D3CABA', window: '#26304A', brass: '#C9993F', brassSh: '#A07726', copper: '#B76137',
    bubble: '#FBF8F2', bubbleSh: '#E3DCCF', ink: '#2E2B33', plant: '#4E7A4A', plantSh: '#3B5E39', pot: '#B5653F',
  };
  let s = band(-320, 420, C.wall);
  for (let x = -420; x <= 620; x += 16) s += rect(x, -320, 6, 420, C.stripe, 0, 0.8);
  // The framed card: gilt frame, cream card, one blot mirrored down its middle.
  const blot = 'M30 34C24 36 20 40 22 46C15 48 16 57 23 57C21 63 27 66 30 61C33 66 39 63 37 57C44 57 45 48 38 46C40 40 36 36 30 34Z';
  s += rect(8, 20, 44, 54, C.giltSh, 1) + rect(8, 20, 40, 50, C.gilt, 1) + rect(13, 25, 34, 44, C.card)
    + path(blot, C.blot);
  // Panelling under a rail.
  s += band(92, 24, C.dado) + band(90, 4, C.rail);
  for (let x = -420; x <= 620; x += 34) s += rect(x + 4, 96, 26, 16, C.dadoLit, 1.5, 0.6);
  // The floor and the rug.
  s += band(FLOOR, 400, C.floor);
  for (let y = 124; y < 152; y += 8) s += band(y, 1, C.floorLine);
  s += rect(30, 119, 140, 18, C.rugEdge, 4) + rect(32, 119, 136, 15, C.rug, 4)
    + line('M40 126.5L160 126.5', C.rugPat, 1.4, 0.8) + [52, 76, 100, 124, 148].map((x) => poly([x, 123, x + 4, 126.5, x, 130, x - 4, 126.5], C.rugPat, 0.85)).join('');
  // A plant on the right, behind the head.
  s += pill(172, 117, 24) + path('M162 116L164 102L180 102L182 116Z', C.pot)
    + [[-26, 66], [-8, 60], [12, 64], [26, 72]].map(([r, y], i) =>
      `<g transform="rotate(${r} 172 102)">${ellipse(172, y + 14, 5.5, 20, i % 2 ? C.plantSh : C.plant)}</g>`).join('');
  // The phrenology head: shoulders, neck, a bald profile facing right, the brain window
  // with two gears in it.
  const head = 'M48 118C50 108 60 103 71 100C75 98 77 94 76 89'
    + 'C63 82 56 69 57 55C58 33 74 20 93 20C110 20 121 30 122 43'
    + 'C122 48 121 51 123 55C123 57 121 58 121 60L129 70'
    + 'C129 72 126 73 123 73C124 75 125 76 124 78C123 79 122 79 122 80'
    + 'C124 81 124 83 122 84C121 85 120 85 120 86C122 88 122 91 119 93'
    + 'C115 95 108 95 104 94C103 97 103 100 105 103C113 106 128 108 132 118Z';
  s += pill(90, 120, 92) + path(head, C.head)
    + path('M76 89C86 93 96 94 104 94C103 97 103 100 105 103C95 103 84 99 76 92Z', C.headSh)
    + path('M48 118C50 108 60 103 71 100C68 104 62 110 60 118Z', C.headSh, 0.7)
    + path('M65 49C63 36 76 29 89 29C104 29 114 37 113 49C113 61 102 66 89 66C76 66 66 61 65 49Z', C.window);
  const gear = (x: number, y: number, r: number, teeth: number, fill: string, hub: string, rot = 0) => {
    const out = r + Math.max(3, r * 0.26);
    const step = (Math.PI * 2) / teeth;
    const pts: string[] = [];
    const at = (rad: number, a: number) => `${n(x + rad * Math.cos(a))} ${n(y + rad * Math.sin(a))}`;
    for (let i = 0; i < teeth; i++) {
      const a = (rot * Math.PI) / 180 + i * step;
      pts.push(at(r, a - step * 0.5), at(r, a - step * 0.3), at(out, a - step * 0.2), at(out, a + step * 0.2), at(r, a + step * 0.3));
    }
    return path(`M${pts.join('L')}Z`, fill) + circle(x, y, r * 0.38, hub);
  };
  s += gear(82, 47, 9, 8, C.brass, C.brassSh) + gear(99, 53, 7, 7, C.copper, '#8E4626', 14);
  // The question in a thought bubble.
  s += circle(138, 58, 4.5, C.bubble) + circle(156, 40, 17, C.bubbleSh) + circle(155, 39, 16, C.bubble)
    + line('M150 34Q150 28 156 28Q162 28 162 34Q162 38 156 40L156 44', C.ink, 3) + circle(156, 50, 2, C.ink);
  return s;
}

// ── PERSONAL GROWTH ─────────────────────────────────────────────────────────
// REFERENCE: a mountain at sunrise — a grey rock peak with a snow cap, its lit face and
// its shaded face, a lower peak behind, green foothills with pines, a dirt path climbing
// past a split-rail fence, a red flag on the summit.
function growth(): string {
  const C = {
    sky: '#F4D7AE', skyHi: '#EAC79A', sun: '#F3A64A', cloud: '#FBEBD3',
    far: '#B9A9B6', farSh: '#A797A6', peakBack: '#8E8C9C', peakBackSh: '#787688',
    rock: '#8D8F9B', rockSh: '#696B79', snow: '#F8F6F1', snowSh: '#D7DCE6',
    hill: '#86A85E', hillSh: '#6E9149', hillDeep: '#57773A', pine: '#3D6A47', pineSh: '#2F5537',
    path: '#D2B07E', pathSh: '#BB9867', fence: '#8A5B39', fenceSh: '#6E4529', flag: '#D2483A', pole: '#3A3634',
  };
  let s = band(-320, 600, C.sky) + band(-320, 330, C.skyHi, 0.6)
    + circle(46, 64, 22, C.sun)
    + cloud(-70, 30, 50, C.cloud) + cloud(150, 24, 44, C.cloud) + cloud(240, 40, 46, C.cloud, 0.8);
  // A far range in haze.
  s += path(`M${L0} 96L-120 70L-60 86L0 64L40 82L80 72L120 84L170 60L230 80L290 66L360 86L${L0 + LW} 76L${L0 + LW} 120L${L0} 120Z`, C.far);
  // The lower peak behind, then the summit.
  s += poly([112, 112, 148, 58, 190, 112], C.peakBack) + poly([148, 58, 190, 112, 158, 112], C.peakBackSh);
  s += poly([30, 116, 96, 34, 164, 116], C.rock) + poly([96, 34, 164, 116, 112, 116, 104, 70], C.rockSh)
    + poly([82, 52, 96, 34, 110, 52, 103, 49, 97, 57, 90, 49], C.snow) + poly([96, 34, 110, 52, 103, 49, 99, 52], C.snowSh)
    + line('M64 86L74 78M120 80L128 92M84 100L92 94', C.rockSh, 1.6, 0.7);
  // The flag.
  s += rect(95, 10, 2.4, 26, C.pole) + path('M97 11L118 16L97 22Z', C.flag);
  // Foothills, pines, the path and the fence.
  s += path(`M${L0} 112Q-140 92 -20 100Q30 92 70 104Q130 94 180 102Q260 92 ${L0 + LW} 104L${L0 + LW} 152L${L0} 152Z`, C.hill)
    + path(`M${L0} 124Q-100 108 0 114Q60 104 110 116Q170 108 240 114Q320 106 ${L0 + LW} 116L${L0 + LW} 152L${L0} 152Z`, C.hillSh);
  const pine = (x: number, base: number, h: number) =>
    rect(x - 1.2, base - h * 0.2, 2.4, h * 0.2, C.fenceSh) + poly([x, base - h, x - h * 0.28, base - h * 0.18, x + h * 0.28, base - h * 0.18], C.pine)
    + poly([x, base - h, x + h * 0.28, base - h * 0.18, x + 1, base - h * 0.18], C.pineSh);
  s += pine(20, 112, 30) + pine(32, 114, 22) + pine(174, 110, 28) + pine(186, 112, 20) + pine(-20, 112, 26) + pine(230, 112, 30);
  s += path('M58 152Q72 134 62 126Q54 120 70 114L80 114Q66 120 74 127Q88 138 76 152Z', C.path)
    + path('M70 114L80 114Q66 120 74 127L70 127Q62 121 70 114Z', C.pathSh, 0.6);
  // A split-rail fence along the path.
  for (const x of [96, 118, 140, 162]) s += rect(x, 116, 3.4, 18, C.fence) + rect(x + 2, 116, 1.4, 18, C.fenceSh);
  s += rect(94, 120, 74, 2.6, C.fence, 1) + rect(94, 127, 74, 2.6, C.fence, 1);
  return s;
}

// ── BUSINESS ────────────────────────────────────────────────────────────────
// REFERENCE: a loft office — an exposed red-brick wall with a big steel-framed window
// onto a city at golden hour, a walnut desk, a tan leather briefcase with a brass
// clasp, a framed chart on a stand, a potted plant.
function business(): string {
  const C = {
    brick: '#A65640', brickSh: '#8F4836', mortar: '#C9A48E', sky: '#F2C28A', skyHi: '#E8A970', sun: '#F7DA9C',
    cityFar: '#B78A86', city: '#7E6A86', cityNear: '#5E5470', lit: '#F6D27A', steel: '#2F3238', steelHi: '#45484F',
    desk: '#8A5634', deskTop: '#A3693F', deskSh: '#6F4128',
    leather: '#A8683A', leatherSh: '#8A5230', leatherDark: '#6E3F24', brass: '#D9A441',
    board: '#F7F4EC', boardSh: '#DCD6C8', bar1: '#3B6E8F', bar2: '#E0A43B', bar3: '#C7533F', up: '#2F7A5A',
    pot: '#D8D2C6', potSh: '#BDB6A8', leaf: '#4E8250', leafSh: '#3A6640',
  };
  // Brick, laid in stretcher bond.
  let s = band(-320, FLOOR + 320, C.mortar);
  for (let row = 0, y = -320; y < FLOOR; row++, y += 9) {
    for (let x = -420 + (row % 2 ? 11 : 0); x < 620; x += 22) s += rect(x, y + 0.8, 20.4, 7.6, row % 3 === 0 ? C.brickSh : C.brick, 0.6);
  }
  // The window: a golden sky, a sun, the city in three layers, a steel frame.
  const wx = 8, wy = 8, ww = 184, wh = 86;
  s += rect(wx, wy, ww, wh, C.sky) + rect(wx, wy, ww, 30, C.skyHi, 0, 0.6) + circle(150, 66, 14, C.sun);
  const towers = (pts: number[][], fill: string, lit?: string) => pts.map(([x, w, h]) => {
    let t = rect(x, wy + wh - h, w, h, fill);
    if (lit) for (let yy = wy + wh - h + 5; yy < wy + wh - 4; yy += 7) for (let xx = x + 3; xx < x + w - 3; xx += 6) if ((xx * 7 + yy * 3) % 5 < 2) t += rect(xx, yy, 2.6, 3, lit);
    return t;
  }).join('');
  s += towers([[12, 14, 46], [30, 12, 34], [56, 16, 52], [96, 12, 40], [128, 14, 48], [168, 18, 38]], C.cityFar)
    + towers([[18, 16, 30], [44, 14, 42], [76, 18, 58], [110, 14, 34], [146, 16, 46], [176, 14, 28]], C.city, C.lit)
    + towers([[8, 22, 18], [62, 20, 22], [118, 26, 16], [160, 24, 20]], C.cityNear);
  s += `<rect x="${wx}" y="${wy}" width="${ww}" height="${wh}" fill="none" stroke="${C.steel}" stroke-width="5"/>`
    + rect(wx + ww / 3 - 1.5, wy, 3, wh, C.steel) + rect(wx + (2 * ww) / 3 - 1.5, wy, 3, wh, C.steel) + rect(wx, wy + 40, ww, 3, C.steel)
    + rect(wx - 4, wy + wh, ww + 8, 5, C.steelHi);
  // The desk is the floor here: its top edge at FLOOR, its front below.
  s += band(FLOOR - 4, 6, C.deskTop) + band(FLOOR + 2, 400, C.desk) + band(FLOOR + 2, 3, C.deskSh);
  // The chart on its stand, right.
  s += pill(150, 112, 56) + path('M132 112L142 98L158 98L168 112Z', C.steel)
    + rect(124, 52, 52, 46, C.boardSh, 2) + rect(124, 52, 50, 44, C.board, 2)
    + rect(132, 78, 8, 14, C.bar1) + rect(144, 70, 8, 22, C.bar2) + rect(156, 60, 8, 32, C.bar3)
    + line('M130 72L144 62L154 64L168 52', C.up, 2.6) + poly([163, 50, 170, 50, 169, 57], C.up);
  // The briefcase, front left.
  s += pill(70, 117, 74)
    + line('M58 74Q58 64 66 64L76 64Q84 64 84 74', C.leatherDark, 4.6)
    + rect(34, 74, 72, 42, C.leather, 6) + rect(88, 74, 18, 42, C.leatherSh, 0)
    + path('M34 80Q34 74 40 74L100 74Q106 74 106 80L106 90L34 90Z', C.leatherDark)
    + rect(64, 86, 12, 9, C.brass, 2) + rect(66, 89, 8, 2, '#B07F2A')
    + line('M40 108L100 108', C.leatherSh, 1.6) + rect(100, 74, 6, 42, C.leatherDark, 0, 0.5);
  // A potted plant at the far right.
  s += pill(188, 113, 22) + path('M180 112L178 100L198 100L196 112Z', C.pot) + path('M190 100L198 100L196 112L190 112Z', C.potSh)
    + [[-30, 0], [-10, 1], [14, 0], [32, 1]].map(([r, i]) => `<g transform="rotate(${r} 188 100)">${ellipse(188, 84, 4.5, 15, i ? C.leafSh : C.leaf)}</g>`).join('');
  return s;
}

// ── ECONOMICS ───────────────────────────────────────────────────────────────
// REFERENCE: a street market — striped awnings (red and white, green and white) with
// scalloped edges over wooden stalls of fruit, cobbles underfoot, a chalkboard on legs
// with the supply and demand lines on it, and stacks of gold coins.
function economics(): string {
  const C = {
    sky: '#CFE2EA', wall: '#E3D3B8', wallSh: '#D2BF9F', red: '#C8463D', white: '#F4EEE3', green: '#3F7B5A',
    post: '#7A5233', postSh: '#5E3E26', mouth: '#4C3A30', counter: '#9A6A42', counterSh: '#7A5233',
    orange: '#E8923A', apple: '#C9443A', lime: '#8AB34A', crate: '#B78755',
    cobble: '#A39E94', cobbleSh: '#8A857B', cobbleLine: '#8F8A80',
    board: '#2E3B35', frame: '#8A5A36', chalk: '#ECEDE6', chalkY: '#F2D06B', dot: '#E0563F',
    gold: '#E3AE45', goldLit: '#F3CF78', goldSh: '#B9852C', goldSeam: '#C99A3A',
  };
  let s = band(-320, 340, C.sky) + band(20, 100, C.wall) + band(20, 4, C.wallSh);
  // A row of stalls, the awnings alternating red and green.
  for (let i = -9; i <= 13; i++) {
    const x = -24 + i * 48;
    const col = i % 2 === 0 ? C.red : C.green;
    for (let st = 0; st < 4; st++) {
      const f = st % 2 ? C.white : col;
      s += rect(x + st * 12, 22, 12, 18, f) + circle(x + st * 12 + 6, 40, 6, f);
    }
    s += rect(x + 2, 46, 44, 40, C.mouth)
      + [0, 1, 2, 3, 4].map((k) => circle(x + 8 + k * 8, 82, 4.2, k % 3 === 0 ? C.orange : k % 3 === 1 ? C.apple : C.lime)).join('')
      + rect(x + 1, 84, 46, 14, C.crate) + rect(x + 1, 84, 46, 2.4, C.counterSh)
      + rect(x - 1.5, 22, 3, FLOOR - 22, C.post) + rect(x + 0.5, 22, 1, FLOOR - 22, C.postSh);
  }
  s += band(98, 18, C.counter) + band(98, 3, C.counterSh, 0.8);
  // Cobbles.
  s += band(FLOOR, 400, C.cobble) + band(FLOOR, 2, C.cobbleSh);
  const r = seq(5);
  for (let y = 120; y < 152; y += 7) {
    s += band(y, 1, C.cobbleLine, 0.7);
    for (let x = -420 + (y % 14 ? 0 : 6); x < 620; x += 12) s += rect(x, y, 1, 7, C.cobbleLine, 0, 0.5 + r() * 0.3);
  }
  // The chalkboard on its legs, right.
  s += pill(140, 118, 72)
    + line('M112 100L110 118M168 100L170 118', C.postSh, 4.4)
    + rect(96, 36, 88, 66, C.frame, 4) + rect(101, 41, 78, 56, C.board, 1.5)
    + line('M110 48L110 90L172 90', C.chalk, 2.2, 0.85)
    + line('M116 52Q138 70 168 84', C.chalk, 2.6)
    + line('M116 86Q140 68 166 50', C.chalkY, 2.6)
    + circle(140.5, 68.5, 3.6, C.dot);
  // Coins: one tall stack and one short, each a lit cylinder with seams.
  const stack = (x: number, base: number, k: number, rx: number) => {
    const ry = 5.2, top = base - k * 6;
    let t = path(`M${x - rx} ${top}L${x - rx} ${base}A${rx} ${ry} 0 0 0 ${x + rx} ${base}L${x + rx} ${top}Z`, C.gold)
      + path(`M${x + rx * 0.3} ${top + ry * 0.95}L${x + rx * 0.3} ${base + ry * 0.95}A${rx} ${ry} 0 0 0 ${x + rx} ${base}L${x + rx} ${top}Z`, C.goldSh);
    for (let i = 1; i < k; i++) t += line(`M${x - rx} ${base - i * 6}A${rx} ${ry} 0 0 0 ${x + rx} ${base - i * 6}`, C.goldSeam, 1.2);
    return t + ellipse(x, top, rx, ry, C.goldLit) + ellipse(x, top, rx * 0.55, ry * 0.45, C.gold);
  };
  s += pill(54, 121, 80) + stack(32, 118, 3, 13) + stack(66, 114, 7, 16);
  return s;
}

// ── SCIENCE ─────────────────────────────────────────────────────────────────
// REFERENCE: a teaching laboratory — white subway tiles, a wooden shelf of stoppered
// bottles (amber, cobalt, green), a black bench top, an Erlenmeyer flask of green
// liquid with bubbles, a wooden rack of test tubes.
function science(): string {
  const C = {
    tile: '#E4ECEA', grout: '#C9D5D2', shelf: '#8A6A4A', shelfSh: '#6E5238',
    amber: '#C07A2E', cobalt: '#2F4F8F', bottleG: '#4E8A5A', stopper: '#3A2F2A',
    bench: '#2B2F35', benchEdge: '#41464E', benchFront: '#20242A',
    glass: '#E8F4F5', glassSh: '#C7E1E4', rim: '#B9D6DA', liquid: '#3BAA8E', liquidSh: '#2E8C74', bubble: '#F4FBF9',
    rack: '#A87A4E', rackSh: '#86603C', red: '#D24A3E', yellow: '#E8A23A', blue: '#3E7FC9',
  };
  let s = band(-320, FLOOR + 320, C.tile);
  for (let row = 0, y = -320; y < FLOOR; row++, y += 10) {
    s += band(y, 1, C.grout);
    for (let x = -420 + (row % 2 ? 10 : 0); x < 620; x += 20) s += rect(x, y, 1, 10, C.grout);
  }
  // Shelves of bottles.
  const bottles = (x0: number, y: number, set: string[]) => set.map((c, i) => {
    const x = x0 + i * 14;
    return i % 2
      ? circle(x + 5, y - 7, 6.5, c) + rect(x + 3.5, y - 18, 3, 6, c) + rect(x + 3, y - 20, 4, 3, C.stopper)
      : rect(x, y - 20, 10, 20, c, 2) + rect(x + 3, y - 25, 4, 5, c) + rect(x + 2.5, y - 27, 5, 3, C.stopper);
  }).join('');
  s += rect(-60, 38, 130, 4, C.shelf) + rect(-60, 42, 130, 2.4, C.shelfSh)
    + bottles(-40, 38, [C.amber, C.cobalt, C.bottleG, C.amber, C.cobalt, C.bottleG, C.amber])
    + rect(140, 30, 160, 4, C.shelf) + rect(140, 34, 160, 2.4, C.shelfSh)
    + bottles(150, 30, [C.cobalt, C.amber, C.bottleG, C.cobalt, C.amber]);
  // The bench is the floor.
  s += band(FLOOR - 4, 6, C.benchEdge) + band(FLOOR + 2, 400, C.bench) + band(FLOOR + 2, 3, C.benchFront);
  // The rack of tubes, right.
  const tube = (x: number, c: string, level: number) =>
    rect(x, 72, 9, 40, C.glass, 4.5) + path(`M${x} ${level}L${x + 9} ${level}L${x + 9} 107.5A4.5 4.5 0 0 1 ${x} 107.5Z`, c)
    + rect(x + 1.5, 76, 2, 26, '#FFFFFF', 1, 0.7);
  s += pill(160, 114, 54)
    + tube(143, C.red, 92) + tube(156, C.yellow, 86) + tube(169, C.blue, 98)
    + rect(137, 88, 48, 5, C.rack, 1) + rect(137, 104, 48, 8, C.rack, 1.5) + rect(137, 109, 48, 3, C.rackSh)
    + rect(137, 88, 4, 24, C.rackSh) + rect(181, 88, 4, 24, C.rackSh);
  // The flask.
  s += pill(98, 116, 80)
    + path('M86 30L86 60L58 112Q56 118 64 118L132 118Q140 118 138 112L110 60L110 30Z', C.glass)
    + path('M71 88L125 88L138 112Q140 118 132 118L64 118Q56 118 58 112Z', C.liquid)
    + path('M110 60L138 112Q140 118 132 118L122 118L102 62Z', C.glassSh, 0.55)
    + path('M114 88L125 88L138 112Q140 118 132 118L126 118Z', C.liquidSh, 0.8)
    + rect(82, 24, 32, 7, C.rim, 3)
    + line('M90 36L90 58L68 100', '#FFFFFF', 2.6, 0.8)
    + circle(84, 104, 3.5, C.bubble, 0.85) + circle(100, 110, 2.6, C.bubble, 0.85) + circle(110, 98, 2, C.bubble, 0.85)
    + circle(96, 16, 3.4, C.glassSh) + circle(106, 8, 2.4, C.glassSh);
  return s;
}

// ── HISTORY ─────────────────────────────────────────────────────────────────
// REFERENCE: the Giza plateau in the afternoon — sandstone pyramids with a lit face and
// a shaded one, dunes with wind ripples, two date palms; a wooden hourglass (round
// glass bulbs between turned posts) and a scroll sealed in red wax on the sand.
function history(): string {
  const C = {
    sky: '#F2D4A2', skyHi: '#EBC48C', sun: '#F8E7BE',
    pyrFarLit: '#E6C696', pyrFarSh: '#CFAA77', pyrLit: '#E2B678', pyrSh: '#B98752',
    dune: '#E3B877', duneSh: '#D2A262', ripple: '#C8935A', sand: '#DDAE6C',
    palm: '#5E7A3E', palmSh: '#4A6332', trunk: '#8A6340',
    wood: '#6E4429', woodLit: '#8A5A38', glass: '#EAF2F1', glassSh: '#CFE0DF', grain: '#D9A75C',
    parch: '#EDDDB4', parchSh: '#CFB98B', roller: '#7A4E2E', wax: '#B23A2F', ink: '#7A6040',
  };
  let s = band(-320, 600, C.sky) + band(-320, 340, C.skyHi, 0.5) + circle(30, 40, 16, C.sun);
  const pyr = (x0: number, x1: number, apex: number, base: number, lit: string, sh: string) => {
    const cx = (x0 + x1) / 2;
    return poly([x0, base, cx, apex, cx + (x1 - x0) * 0.1, base], lit) + poly([cx, apex, x1, base, cx + (x1 - x0) * 0.1, base], sh);
  };
  s += pyr(-150, -60, 60, 100, C.pyrFarLit, C.pyrFarSh) + pyr(200, 270, 66, 100, C.pyrFarLit, C.pyrFarSh)
    + pyr(116, 196, 40, 100, C.pyrLit, C.pyrSh) + pyr(6, 60, 64, 100, C.pyrLit, C.pyrSh);
  s += path(`M${L0} 104Q-120 90 20 98Q90 88 170 98Q260 90 ${L0 + LW} 100L${L0 + LW} 152L${L0} 152Z`, C.dune)
    + path(`M${L0} 118Q-80 108 40 114Q120 106 200 116Q300 108 ${L0 + LW} 114L${L0 + LW} 152L${L0} 152Z`, C.sand);
  for (let y = 124; y < 152; y += 7) s += line(`M${L0} ${y}Q-100 ${y - 3} 0 ${y}Q60 ${y + 3} 120 ${y}Q180 ${y - 3} 240 ${y}L${L0 + LW} ${y}`, C.ripple, 1.1, 0.6);
  // Two date palms.
  const palm = (x: number, base: number, h: number) => {
    let t = path(`M${x - 2} ${base}Q${x - 6} ${base - h * 0.5} ${x + 2} ${base - h}L${x + 5} ${base - h}Q${x - 1} ${base - h * 0.5} ${x + 3} ${base}Z`, C.trunk);
    const top = [x + 3.5, base - h];
    for (const [dx, dy, i] of [[-18, 6, 0], [-12, -6, 1], [0, -10, 0], [13, -6, 1], [19, 6, 0], [6, 9, 1]]) {
      t += path(`M${top[0]} ${top[1]}Q${top[0] + dx * 0.5} ${top[1] + dy - 6} ${top[0] + dx} ${top[1] + dy}Q${top[0] + dx * 0.6} ${top[1] + dy - 2} ${top[0]} ${top[1] + 2}Z`, i ? C.palmSh : C.palm);
    }
    return t;
  };
  s += palm(176, 110, 40) + palm(190, 112, 30);
  // The hourglass.
  const glass = 'M84 42C84 60 96 68 103 74C96 80 84 88 84 106L128 106C128 88 116 80 109 74C116 68 128 60 128 42Z';
  s += pill(106, 118, 76)
    + path(glass, C.glass)
    + path('M89 54L123 54C121 63 113 69 106 73C99 69 91 63 89 54Z', C.grain)
    + path('M88 106Q96 90 106 88Q116 90 124 106Z', C.grain)
    + rect(105.2, 74, 1.6, 14, C.grain)
    + path('M109 74C116 68 128 60 128 42L120 42C120 58 112 66 106 72Z', C.glassSh, 0.6)
    + line('M90 50C92 58 96 63 100 66', '#FFFFFF', 2.2, 0.8)
    + rect(72, 104, 68, 10, C.wood, 3) + rect(72, 104, 68, 3, C.woodLit, 2)
    + rect(72, 32, 68, 10, C.wood, 3) + rect(72, 32, 68, 3, C.woodLit, 2)
    + rect(75, 42, 5, 62, C.woodLit, 2) + rect(132, 42, 5, 62, C.wood, 2);
  // The scroll, sealed.
  s += pill(42, 126, 54)
    + rect(22, 108, 40, 16, C.parch, 2) + rect(22, 119, 40, 5, C.parchSh)
    + line('M28 112.5L54 112.5M28 116.5L48 116.5', C.ink, 1.4, 0.7)
    + rect(16, 104, 9, 24, C.roller, 4.5) + rect(59, 104, 9, 24, C.roller, 4.5)
    + rect(18, 106, 2.4, 20, C.woodLit, 1.2) + rect(61, 106, 2.4, 20, C.woodLit, 1.2)
    + circle(52, 121, 5, C.wax) + circle(52, 121, 2.4, '#8E2B22');
  return s;
}

export const SCENES: Record<SceneKey, () => string> = {
  philosophy, psychology, 'personal-growth': growth, business, economics, science, history,
};

/**
 * The colour of a card's FOOT, under its picture: the deepest colour IN that picture,
 * so the words sit on the place rather than on a white slip cut out of it (the Quick
 * Start cards' construction, which the owner holds up as the better card). Each is dark
 * enough for FOOT_TEXT at 7:1 and FOOT_SOFT at 4.5:1, which check:subjects measures.
 */
export const SCENE_FOOT: Record<SceneKey, string> = {
  philosophy: '#5A2721',        // the niche's oxblood
  psychology: '#2F4A3E',        // the wallpaper's green, deepened
  'personal-growth': '#35532F', // the foothills in shade
  business: '#3A3550',          // the city at dusk
  economics: '#253A55',         // a market awning's navy
  science: '#1F3B42',           // the bench's slate, toward the flask's teal
  history: '#5E3B1D',           // the hourglass's walnut
};
/** The name on a foot. */
export const FOOT_TEXT = '#FBF4E8';
/** The blurb and kicker on a foot. */
export const FOOT_SOFT = '#E2D3BF';

/** The colour a scene's card is laid on before its picture draws (and what shows if a
 *  box ever grows past what a setting covers): the scene's own sky or wall. */
export const SCENE_GROUND: Record<SceneKey, string> = {
  philosophy: '#A4483A', psychology: '#8EA38C', 'personal-growth': '#F4D7AE', business: '#A65640',
  economics: '#CFE2EA', science: '#E4ECEA', history: '#F2D4A2',
};

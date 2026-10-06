// history-foundations-4, "What Changed, and What Stayed?" — the town square, drawn
// (LESSON_RULES AM13). Every curve is drawn here against fetched references; nothing is
// traced. Zero imports.
//
// REFERENCES (npm run ref, scratchpad/ref/g2*):
//   g2trough-1   a former horse trough on Bath Road, Stonehouse, planted with sedum: a
//                long stone box under a heavy rounded lip, set on a narrower plinth, the
//                planting mounding up over the rim.
//   g2trough2-1  the Metropolitan Drinking Fountain and Cattle Trough Association trough
//                at Horsham: the same bullnose rim, a bead along the foot of the box, a
//                recessed plinth under it.
//   g2square-1   the Clock Tower in Thirsk market square: two- and three-storey houses
//                round the square, stucco and brick side by side, slate roofs, chimney
//                stacks, sash windows in rows, shop fronts at street level.
//   g2square-2   Morpeth Market Place: red-brick terraces with stone dressings, dormers
//                in grey slate, a clock tower among them.

const INK = '#2B2420';
const f2 = (n) => Number(n.toFixed(2));
const P = (pts) => `M${pts.map(([x, y]) => `${f2(x)},${f2(y)}`).join(' L')} Z`;
/** A filled shape with an outline. */
const fill = (d, c, w = 0.9, s = INK) => `<path d="${d}" fill="${c}" stroke="${s}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
/** A shade or light laid inside a shape, no outline. */
const tone = (d, c, o = 1) => `<path d="${d}" fill="${c}"${o < 1 ? ` opacity="${o}"` : ''}/>`;
const line = (d, c, w) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const rect = (x, y, w, h, c, o = 1) => `<rect x="${f2(x)}" y="${f2(y)}" width="${f2(w)}" height="${f2(h)}" fill="${c}"${o < 1 ? ` opacity="${o}"` : ''}/>`;
const orect = (x, y, w, h, c, lw, s, r = 0) => `<rect x="${f2(x)}" y="${f2(y)}" width="${f2(w)}" height="${f2(h)}" rx="${r}" fill="${c}" stroke="${s}" stroke-width="${lw}"/>`;

// ── the horse trough, planted with flowers ──────────────────────────────────
// Drawn in its own 56 × 48 frame, which lands on the scene box 208–264 × 452–500: the
// plinth stands on the ground line, the box sits on it under its rounded lip, and the
// planting mounds up over the rim to y 452. The geranium she touches is at the left end
// (scene 213, 461 → frame 5, 9).
export function trough() {
  const G = '#A2A39D', GS = '#7B7C76', GL = '#C6C7C1', GD = '#5F605B';
  const LEAF = '#4E7A3A', LEAFL = '#6F9A4E', LEAFD = '#365A28';
  const RED = '#C9333B', REDL = '#E25A5E', PINK = '#DA74A2', PINKD = '#B1557F', WHITE = '#F4EEE6';
  const out = [];
  // the plinth, set in under the box, shaded on its right
  out.push(fill('M7,39 L49,39 L49,47.6 L7,47.6 Z', GS, 0.9));
  out.push(tone('M7,39 L49,39 L49,40.6 L7,40.6 Z', GD, 0.5));
  out.push(tone('M43,40.6 L49,40.6 L49,47.6 L43,47.6 Z', GD, 0.45));
  // the planting, behind the rim: one leafy mound with a scalloped top
  const mound = 'M3.5,17.5 C2.5,13 5.5,10 8.5,10.6 C9.5,6.4 14,5 16.8,7.4 C18.6,3.6 24.4,3 26.6,6.4 '
    + 'C29.4,2.6 35,3.2 36.4,7 C39.4,4.6 44.2,5.8 45,9.6 C48.6,8.8 52.6,11.6 52.4,15.6 L52.6,17.5 Z';
  out.push(fill(mound, LEAF, 0.9));
  out.push(tone('M9,11.6 C10.6,8.6 14.4,8 16.4,9.6 C18.6,6.2 23.6,5.8 25.6,8.6 C22,8.2 19.4,9.6 18,11.4 C15.4,10.2 11.6,10.6 9,11.6 Z', LEAFL));
  out.push(tone('M28,7.6 C30.6,5.2 34.6,5.6 35.8,8.4 C33.4,7.8 30.4,8 28,7.6 Z', LEAFL));
  out.push(tone('M38,9.4 C40.6,7.6 43.6,8.4 44.6,10.8 C42.4,10.2 40,10 38,9.4 Z', LEAFL));
  out.push(tone('M44,17.5 C45.6,14 49.4,12.8 52.4,15.6 L52.6,17.5 Z', LEAFD, 0.8));
  out.push(tone('M28,17.5 C30,14.6 34,14 36.4,16 L36.6,17.5 Z', LEAFD, 0.6));
  // leaves: a few pointed blades breaking the top edge
  for (const [x, y, a] of [[12, 9.4, -30], [21.6, 5.4, 10], [33, 5, -15], [42, 7.6, 25], [49, 11.4, 40]]) {
    out.push(`<path d="M0,0 C1.6,-1.8 1.4,-4 0,-5.4 C-1.4,-4 -1.6,-1.8 0,0 Z" transform="translate(${x} ${y}) rotate(${a})" fill="${LEAFL}" stroke="${INK}" stroke-width="0.5" stroke-linejoin="round"/>`);
  }
  // geraniums: a domed head of small florets on each stem (an umbel), lit top-left
  const geranium = (x, y, r) => {
    const g = [line(`M${x},${f2(y + r * 0.6)} L${f2(x + 0.4)},${f2(y + r + 3)}`, LEAFD, 0.7)];
    // the ball's outline is scalloped: a ring of florets, each its own bump
    const ring = 8;
    let d = '';
    for (let k = 0; k <= ring; k++) {
      const a = (k / ring) * Math.PI * 2;
      const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r * 0.92;
      if (k === 0) { d = `M${f2(px)},${f2(py)}`; continue; }
      const am = ((k - 0.5) / ring) * Math.PI * 2;
      d += ` Q${f2(x + Math.cos(am) * r * 1.32)},${f2(y + Math.sin(am) * r * 1.22)} ${f2(px)},${f2(py)}`;
    }
    g.push(`<path d="${d} Z" fill="${RED}" stroke="${INK}" stroke-width="0.55" stroke-linejoin="round"/>`);
    // shade low and right, the lit florets top-left, the pale eyes of a few flowers
    g.push(`<circle cx="${f2(x + r * 0.3)}" cy="${f2(y + r * 0.32)}" r="${f2(r * 0.62)}" fill="#9A262D" opacity="0.75"/>`);
    for (const [dx, dy] of [[-0.42, -0.34], [0.06, -0.56], [-0.6, 0.12], [-0.12, -0.02]]) {
      g.push(`<circle cx="${f2(x + dx * r)}" cy="${f2(y + dy * r)}" r="${f2(r * 0.3)}" fill="${REDL}"/>`);
    }
    for (const [dx, dy] of [[-0.4, -0.36], [0.1, -0.5], [-0.12, 0]]) {
      g.push(`<circle cx="${f2(x + dx * r)}" cy="${f2(y + dy * r)}" r="${f2(r * 0.09)}" fill="#F7C9C4"/>`);
    }
    return g.join('');
  };
  out.push(geranium(6.2, 8.6, 2.8));
  out.push(geranium(17.4, 6.2, 3.1));
  out.push(geranium(30.2, 4.6, 3));
  out.push(geranium(41.6, 7.2, 2.8));
  out.push(geranium(24, 11.4, 2.2));
  // white alyssum dots low in the green
  for (const [x, y] of [[11, 14.2], [14, 15.4], [35, 13.6], [38.4, 15], [47, 14.4]]) out.push(`<circle cx="${x}" cy="${y}" r="0.9" fill="${WHITE}"/>`);
  // the box under its rim: lit face, shaded right end, a recessed panel
  out.push(fill('M3,19 L53,19 L52,37.6 L4,37.6 Z', G, 0.9));
  out.push(tone('M46,19 L53,19 L52,37.6 L46,37.6 Z', GS, 0.7));
  out.push(orect(9, 23.2, 30, 10.4, GS, 0.5, GD, 1.2));
  out.push(tone('M9.4,23.6 L38.6,23.6 L38.6,25 L9.4,25 Z', GD, 0.35));
  out.push(line('M12,28.6 L35,28.6 M14,31 L33,31', GD, 0.45));
  // the bead along the foot of the box
  out.push(fill('M2.6,36.8 L53.4,36.8 C54.4,36.8 54.6,39.4 53.4,39.4 L2.6,39.4 C1.6,39.4 1.6,36.8 2.6,36.8 Z', G, 0.8));
  // the heavy rounded lip over the front, its top catching the light
  out.push(fill('M2,15.6 L54,15.6 C56,15.6 56,20.4 54,20.4 L2,20.4 C0,20.4 0,15.6 2,15.6 Z', G, 0.9));
  out.push(tone('M2.4,16.2 L50,16.2 L50,17.2 L2.4,17.2 Z', GL));
  out.push(tone('M2,19.2 L54,19.2 C55,19.2 55.2,20.2 54,20.4 L2,20.4 C1,20.4 1,19.4 2,19.2 Z', GS, 0.8));
  // pink petunias trailing over the rim at the right, and a little at the left
  const trail = (x, y, len, side) => {
    const pts = [];
    for (let k = 0; k <= 3; k++) pts.push([x + side * k * 0.7, y + k * (len / 3)]);
    return line(`M${pts.map(([a, b]) => `${f2(a)},${f2(b)}`).join(' L')}`, LEAFD, 0.8)
      + pts.slice(1).map(([a, b], k) => `<circle cx="${f2(a + side * 0.9)}" cy="${f2(b)}" r="${1.25 - k * 0.15}" fill="${k === 1 ? PINKD : PINK}" stroke="${INK}" stroke-width="0.4"/>`).join('');
  };
  out.push(trail(46, 15.2, 7.4, 1));
  out.push(trail(50.6, 15.4, 9.2, 1));
  out.push(trail(37, 15.6, 5.6, -1));
  out.push(trail(8.6, 15.4, 5.4, -1));
  return out.join('');
}

// ── the far side of the square: the houses, the paving, the sky ─────────────
// Drawn in scene units for the band 300–500 across the whole stage. It sits BEHIND the
// clock tower (46–94) and the phone shop (300–400), so only 90–304 of the houses shows,
// and BEHIND the three people, whose ink must read against it: nothing at their height
// (y 422–500) is darker than a mid tone, the windows down there are pale glass, and the
// outlines are a soft brown rather than ink, so the houses sit back.
export function street() {
  const SKY = '#E3ECF1', CLOUD = '#F6F9FA';
  const LINE = '#7A6F64';
  const STUCCO = '#EDE4D2', STUCCOS = '#D7CBB4', CREAM = '#F1E7C9', CREAMS = '#DCCFA9';
  const BRICK = '#C98E72', BRICKS = '#AE7559', SLATE = '#9AA0A8', SLATES = '#7F868F';
  const GLASS = '#C4D4DC', GLASSS = '#A9BCC6', SILL = '#F6F2E8', DOOR = '#6C8A86';
  const FLAG = '#DCD8CF', FLAGS = '#C6C1B6', KERB = '#B9B4A9';
  const out = [];
  out.push(rect(0, 300, 400, 172, SKY));
  // two flat clouds, high and quiet
  out.push(tone('M112,322 C114,315 124,314 128,318 C131,312 142,312 145,318 C150,317 154,320 153,324 L112,324 Z', CLOUD));
  out.push(tone('M206,312 C208,307 215,306 218,309 C221,305 229,306 231,310 C235,309 238,312 237,314 L206,314 Z', CLOUD));
  const W = 0.6;
  // a house: [x0, x1, top of wall, roof height, wall colour, its shade, roof, storeys, windows a row]
  const house = (x0, x1, top, rh, wall, wallS, kind, rows, per, chim) => {
    const s = [];
    // chimney stacks behind the roof
    for (const cx of chim) {
      s.push(fill(P([[cx - 3.4, top - rh - 7], [cx + 3.4, top - rh - 7], [cx + 3.4, top - rh + 2], [cx - 3.4, top - rh + 2]]), BRICK, W, LINE));
      s.push(rect(cx - 4, top - rh - 8.6, 8, 2, BRICKS));
      s.push(`<rect x="${cx - 2.4}" y="${top - rh - 11}" width="1.8" height="2.6" fill="${BRICKS}"/><rect x="${cx + 0.6}" y="${top - rh - 10.6}" width="1.8" height="2.2" fill="${BRICKS}"/>`);
    }
    // the roof: a slate slope seen from the square, or a gable end
    if (kind === 'gable') {
      const mx = (x0 + x1) / 2;
      s.push(fill(P([[x0 - 2, top], [mx, top - rh], [x1 + 2, top]]), wall, W, LINE));
      s.push(tone(P([[mx, top - rh], [x1 + 2, top], [mx + 4, top]]), wallS, 0.8));
      s.push(line(`M${x0 - 3},${top + 0.6} L${mx},${top - rh - 1.2} L${x1 + 3},${top + 0.6}`, SILL, 1.6));
      s.push(`<circle cx="${mx}" cy="${top - rh * 0.45}" r="2.6" fill="${GLASS}" stroke="${LINE}" stroke-width="${W}"/>`);
    } else {
      s.push(fill(P([[x0 - 1.5, top], [x0 + 5, top - rh], [x1 - 5, top - rh], [x1 + 1.5, top]]), SLATE, W, LINE));
      s.push(tone(P([[x0 + 5, top - rh], [x1 - 5, top - rh], [x1 - 4, top - rh + 2], [x0 + 4.4, top - rh + 2]]), SLATES, 0.9));
      if (kind === 'dormer') {
        const dx = (x0 + x1) / 2;
        s.push(fill(P([[dx - 6, top], [dx - 6, top - rh + 5], [dx, top - rh], [dx + 6, top - rh + 5], [dx + 6, top]]), STUCCO, W, LINE));
        s.push(orect(dx - 3.4, top - rh + 6, 6.8, 6, GLASS, 0.5, LINE));
      }
    }
    // the wall, its right-hand strip in shade
    s.push(fill(P([[x0, top], [x1, top], [x1, 470], [x0, 470]]), wall, W, LINE));
    s.push(rect(x1 - 4, top, 4, 470 - top, wallS, 0.75));
    // a stone string course under the eaves
    s.push(rect(x0, top, x1 - x0, 2.2, SILL, 0.9));
    // the windows, a row a storey; the ground floor is a shop front of pale glass
    const sh = (470 - top - 30) / rows;
    for (let r = 0; r < rows; r++) {
      const wy = top + 5 + r * sh;
      const span = (x1 - x0) / per;
      for (let k = 0; k < per; k++) {
        const wx = x0 + span * k + span / 2 - 3.6;
        s.push(orect(wx, wy, 7.2, sh * 0.62, GLASS, W, LINE, 0.4));
        s.push(rect(wx + 0.5, wy + 0.5, 6.2, sh * 0.62 * 0.45, GLASSS, 0.7));
        s.push(line(`M${f2(wx)},${f2(wy + sh * 0.31)} L${f2(wx + 7.2)},${f2(wy + sh * 0.31)}`, SILL, 0.7));
        s.push(rect(wx - 0.8, wy + sh * 0.62, 8.8, 1.4, SILL));
      }
    }
    // the shop front: a fascia, a window and a door
    s.push(fill(P([[x0 + 2, 446], [x1 - 2, 446], [x1 - 2, 451], [x0 + 2, 451]]), wallS, W, LINE));
    s.push(orect(x0 + 4, 452, (x1 - x0) * 0.58, 16, GLASS, W, LINE, 0.4));
    s.push(rect(x0 + 4.4, 452.4, (x1 - x0) * 0.58 - 0.8, 5, GLASSS, 0.7));
    s.push(orect(x1 - (x1 - x0) * 0.28 - 2, 451.5, (x1 - x0) * 0.22, 18.5, DOOR, W, LINE, 0.4));
    return s.join('');
  };
  out.push(house(90, 140, 382, 16, STUCCO, STUCCOS, 'slate', 2, 3, [100, 130]));
  out.push(house(140, 196, 368, 22, BRICK, BRICKS, 'gable', 2, 3, []));
  out.push(house(196, 252, 386, 14, CREAM, CREAMS, 'dormer', 2, 3, [204, 244]));
  out.push(house(252, 306, 374, 16, STUCCO, STUCCOS, 'slate', 2, 3, [262]));
  // the square's paving, between the far kerb and the near ground line
  out.push(rect(0, 470, 400, 30, FLAG));
  out.push(rect(0, 470, 400, 2.2, KERB));
  for (const y of [478, 488]) out.push(rect(0, y, 400, 0.7, FLAGS));
  for (let k = 0; k < 16; k++) {
    const x = k * 26 + (k % 2) * 6;
    out.push(rect(x, 472, 0.7, 6, FLAGS));
    out.push(rect(x + 13, 478.7, 0.7, 9.3, FLAGS));
    out.push(rect(x + 4, 488.7, 0.7, 11.3, FLAGS));
  }
  return out.join('');
}

export const ART = [
  { name: 'hist4-street', svg: street, view: { x: 0, y: 300, w: 400, h: 200 }, box: { x: 0, y: 300, w: 400, h: 200 } },
  // replaces horseTrough(236, 476, 56, 48): the box 208–264 × 452–500
  { name: 'hist4-trough', svg: trough, view: { x: 0, y: 0, w: 56, h: 48 }, box: { x: 208, y: 452, w: 56, h: 48 } },
];

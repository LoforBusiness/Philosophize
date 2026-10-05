// SMALL PROPS drawn as pictures (LESSON_RULES AM13), each against a fetched reference,
// each replacing a shape-built object of the same box so the scene's layout, must-boxes
// and motion are unchanged. Every drawing is flat fills lit from the top left, a shaded
// side, and one dark outline — the house look of objects.ts, with real curves.
// Zero imports.

const INK = '#2B2420';
const lineW = (unit) => (0.9 * unit).toFixed(2);

/** A filled shape with the house outline. */
const fill = (d, c, w) => `<path d="${d}" fill="${c}" stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
/** A shade or highlight laid inside a shape, with no outline. */
const tone = (d, c, o = 1) => `<path d="${d}" fill="${c}" opacity="${o}"/>`;
/** A drawn line. */
const line = (d, c, w) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;

/** A tube along a centre line, tapering, with the house outline (a leg, a tail). */
function tube(pts, w0, w1, c, ow) {
  const L = [], R = [];
  for (let k = 0; k < pts.length; k++) {
    const [x, y] = pts[k];
    const [ax, ay] = pts[Math.max(0, k - 1)];
    const [bx, by] = pts[Math.min(pts.length - 1, k + 1)];
    let dx = bx - ax, dy = by - ay;
    const n = Math.hypot(dx, dy) || 1; dx /= n; dy /= n;
    const w = (w0 + (w1 - w0) * (k / (pts.length - 1))) / 2;
    L.push([x - dy * w, y + dx * w]); R.push([x + dy * w, y - dx * w]);
  }
  const all = [...L, ...R.reverse()];
  return fill(`M${all.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' L')} Z`, c, ow);
}

// ── the carousel horse (phil6), 34 × 30, facing right ──────────────────────
// REFERENCE: John W. Kelleher, "Carousel Horse" (1940, NGA, CC0): a white horse in the
// prancing pose — fore legs folded up, hind legs reaching back — its head raised, a gold
// mane and tail, a red saddle on a blue cloth, a blue bridle.
export function carouselHorse() {
  const o = '0.55';
  const WHITE = '#F6F1E6', SHADE = '#D8CFBD', GOLD = '#D6A12C', GOLDS = '#B07F18', RED = '#C2392C', BLUE = '#2E5C9C';
  return [
    tube([[-6, 4], [-10, 8.5], [-14.5, 10.5]], 3.2, 1.7, SHADE, o),
    tube([[5, 3], [9, 6], [7.4, 9.6]], 3, 1.7, SHADE, o),
    // tail, streaming
    fill('M-10.6,-1.8 C-13.5,-3 -16.4,-0.4 -16.6,4.2 C-15.4,2.4 -13.6,1.2 -11.2,1.4 Z', GOLD, o),
    // body, neck and head as one silhouette
    fill('M-11,-0.6 C-11,-4.6 -5,-4.8 1.6,-4.2 C4.6,-4 6.4,-5 7.6,-6.4 L10.2,-11.2 C11.2,-13.2 13.8,-12.8 15.2,-10.2 '
      + 'L16.8,-7.2 C17.2,-6 16.4,-5 15.2,-5.6 L12.4,-6.6 C11.6,-4.4 10.2,-1.4 8.2,1.6 C6.2,4.6 2.4,5.8 -2.2,5.8 C-7.2,5.8 -11,3.8 -11,-0.6 Z', WHITE, o),
    // the belly's shade and the neck's
    tone('M-10.4,1.6 C-8,4.8 0,5.6 6,3.4 C3,5.6 -6,5.6 -10.4,1.6 Z', SHADE),
    // near legs: the fore leg folded up, the hind leg reaching back
    tube([[-7.2, 3.6], [-11.6, 8], [-16, 10.8]], 3.4, 1.8, WHITE, o),
    `<rect x="-16.9" y="9.6" width="2" height="2.2" rx="0.4" fill="${GOLDS}" stroke="${INK}" stroke-width="0.4"/>`,
    tube([[6.4, 2.6], [10.6, 5], [8.6, 9.2]], 3.2, 1.8, WHITE, o),
    `<rect x="7.4" y="8.8" width="2.2" height="1.8" rx="0.4" fill="${GOLDS}" stroke="${INK}" stroke-width="0.4"/>`,
    // gold mane along the neck, an ear
    fill('M7.6,-6.4 C6.8,-9.2 8.4,-12.2 10.6,-12.6 L11.6,-10.6 C9.8,-9.6 8.8,-8 8.6,-5.8 Z', GOLD, o),
    fill('M11.2,-12.4 L11.4,-15 L13,-12.6 Z', WHITE, o),
    // the saddle cloth and saddle
    fill('M-4.4,-4.6 L4.2,-4.4 L4.8,0.6 L-4.8,0.6 Z', BLUE, o),
    fill('M-3.2,-5.8 C-1,-4.6 1,-4.6 3.2,-5.8 L3.4,-3.4 L-3.4,-3.4 Z', RED, o),
    line('M-4.2,0.2 L4.6,0.2', GOLD, '0.6'),
    // bridle and reins, eye, nostril
    line('M12.4,-10.4 L16.4,-6.8 M12,-7.4 L8.8,-4.4', BLUE, '0.7'),
    `<circle cx="13.3" cy="-9.4" r="0.7" fill="${INK}"/>`,
    `<circle cx="16" cy="-6.4" r="0.35" fill="${INK}"/>`,
  ].join('');
}

// ── a ship's hammock (sci6), 46 × 62, slung from the beam ──────────────────
// REFERENCE: a sailmaker ticketing hammocks on HMS Pallas (public domain), and the
// standard naval hammock: a canvas sling whose two ends are gathered by a fan of cords
// (the clews) to a ring, each ring on a hook in the deck beam above. Slung, it sags in a
// long curve; with a man in it the canvas bulges and a blanket shows over the edge.
function hammock(full) {
  const o = '0.7';
  const CANVAS = '#ECE2C9', CANVASD = '#CDBF9C', CORD = '#6D5A40', BLANKET = '#5E6E86', BLANKETD = '#48556A';
  const fans = [];
  for (const [hx, ex, sign] of [[-20.5, -18.6, 1], [20.5, 18.6, -1]]) {
    fans.push(`<circle cx="${hx}" cy="2" r="1.4" fill="none" stroke="${INK}" stroke-width="0.6"/>`);
    for (let k = 0; k < 5; k++) fans.push(line(`M${hx},3.4 L${(ex + sign * k * 1.3).toFixed(1)},${(39.6 + k * 0.6).toFixed(1)}`, CORD, '0.45'));
  }
  const sag = full ? 13 : 9;
  const top = `M-18.6,40 C-10,${40 + sag} 10,${40 + sag} 18.6,40`;
  const bot = `L18.4,43 C10,${43 + sag + 4} -10,${43 + sag + 4} -18.4,43 Z`;
  const out = [...fans, fill(`${top} ${bot}`, CANVAS, o)];
  out.push(tone(`M-18.4,43 C-10,${43 + sag + 4} 10,${43 + sag + 4} 18.4,43 C10,${43 + sag + 1.5} -10,${43 + sag + 1.5} -18.4,43 Z`, CANVASD));
  if (full) {
    out.push(fill(`M-14,${42 + sag * 0.4} C-10,${33 + sag * 0.4} 9,${33 + sag * 0.4} 14,${41 + sag * 0.4} C6,${44 + sag * 0.6} -6,${44 + sag * 0.6} -14,${42 + sag * 0.4} Z`, BLANKET, o));
    out.push(tone(`M-12,${43 + sag * 0.45} C-4,${45 + sag * 0.55} 6,${45 + sag * 0.55} 13,${42 + sag * 0.45} C6,${46 + sag * 0.6} -6,${46 + sag * 0.6} -12,${43 + sag * 0.45} Z`, BLANKETD));
  }
  // the canvas's hemmed edge
  out.push(line(top, CANVASD, '0.5'));
  return out.join('');
}
export const hammockFull = () => hammock(true);
export const hammockEmpty = () => hammock(false);

// ── the wreck on the rocks (econ6), 120 × 70 ───────────────────────────────
// REFERENCE: beached and wrecked wooden ships — a hull lying canted on rocks, its planking
// stripped away amidships so the curved RIBS show, the stump of a mast snapped part way
// up with a rag of sail, the bow lifted.
export function wreck() {
  const o = '1.1';
  const ROCK = '#8E8A82', ROCKD = '#6C6862', WOOD = '#8A5A2E', WOODD = '#5E3B1C', WOODL = '#A97646', SAIL = '#E8DEC4';
  const ribs = [];
  for (let k = 0; k < 6; k++) {
    const x = -22 + k * 8.4;
    ribs.push(line(`M${x},${17 - k * 1.2} C${x + 2},${8 - k * 1.4} ${x + 2},${0 - k * 1.2} ${x - 1},${-6 - k * 1.3}`, WOODD, '2.2'));
    ribs.push(line(`M${x - 0.5},${16 - k * 1.2} C${x + 1.4},${8 - k * 1.4} ${x + 1.4},${0 - k * 1.2} ${x - 1.4},${-6 - k * 1.3}`, WOODL, '0.7'));
  }
  return [
    // the snapped mast, leaning back, with a rag of sail on its yard
    tube([[2, 2], [-8, -16], [-13, -28]], 3.2, 2.4, WOOD, o),
    fill('M-13,-28 L-11.6,-31 L-10.2,-28.4 L-9,-31.6 L-8.4,-26 Z', WOODL, '0.6'),
    line('M-20,-20 L2,-24', WOODD, '1.6'),
    fill('M-18,-20.6 C-14,-14 -10,-10 -6,-6 L-2,-12 C-4,-16 -2,-20 0,-23.4 Z', SAIL, '0.7'),
    tone('M-6,-6 L-2,-12 L-4,-9 L-8,-8 Z', '#C9BC9A'),
    // the far side of the hull, dark, seen through the missing planks
    fill('M-34,18 C-24,4 10,-2 50,-10 C52,-6 50,0 44,4 C14,12 -14,18 -34,18 Z', WOODD, o),
    // the ribs
    ...ribs,
    // the near planking that is left: the stern section and the bow section
    fill('M-50,22 C-46,10 -36,4 -26,2 L-24,20 C-34,24 -44,26 -50,22 Z', WOOD, o),
    line('M-48,16 C-42,10 -34,7 -26,6 M-49,20 C-42,15 -34,12 -25,12', WOODD, '0.7'),
    fill('M20,12 C30,8 42,2 52,-8 L58,-14 L60,-10 C56,-2 50,6 42,12 C34,16 26,18 20,18 Z', WOOD, o),
    line('M22,14 C32,11 42,5 54,-6 M24,17 C34,14 44,9 56,-2', WOODD, '0.7'),
    tone('M20,12 C30,8 42,2 52,-8 L53,-6 C43,4 31,10 21,14 Z', WOODL, 0.7),
    // the gunwale running the length of her
    line('M-50,22 C-36,6 10,-2 58,-14', WOODD, '1.8'),
    line('M-50,21 C-36,5 10,-3 58,-15', WOODL, '0.6'),
    // the rocks she lies on
    fill('M-60,35 C-56,24 -46,20 -38,25 C-32,18 -18,19 -12,26 C-4,20 10,21 18,27 C26,21 40,22 48,28 C54,25 58,29 60,35 Z', ROCK, o),
    tone('M-60,35 C-50,30 -40,31 -30,33 C-16,30 0,31 14,33 C30,30 46,31 60,35 Z', ROCKD),
    line('M-38,25 C-37,29 -35,31 -33,33 M18,27 C19,30 21,32 24,33', ROCKD, '0.8'),
  ].join('');
}

// ── a sailing ship coming in (econ6), 40 × 34 ──────────────────────────────
// REFERENCE: an 18th-century merchant ship seen side-on at a distance: a dark hull with a
// raised stern, two masts with stacked square sails filled by the wind, a pennant.
export function ship() {
  const o = '0.55';
  const HULL = '#5A3A22', HULLD = '#3E2716', SAIL = '#F1E8D2', SAILD = '#D6C9A6', RED = '#B53A2C';
  const sail = (x, y, w, h) => [
    fill(`M${x - w / 2},${y} C${x - w / 2 + 1.2},${y + h * 0.5} ${x - w / 2 + 1.2},${y + h * 0.5} ${x - w / 2},${y + h} L${x + w / 2},${y + h} C${x + w / 2 + 1.6},${y + h * 0.5} ${x + w / 2 + 1.6},${y + h * 0.5} ${x + w / 2},${y} Z`, SAIL, o),
    tone(`M${x + w / 2 - 1.4},${y + 0.6} C${x + w / 2},${y + h * 0.5} ${x + w / 2},${y + h * 0.5} ${x + w / 2 - 1.4},${y + h - 0.6} L${x + w / 2},${y + h} C${x + w / 2 + 1.6},${y + h * 0.5} ${x + w / 2 + 1.6},${y + h * 0.5} ${x + w / 2},${y} Z`, SAILD),
  ].join('');
  return [
    line('M-5,9 L-5,-15 M6,9 L6,-13', HULLD, '0.9'),
    line('M-14,6 L-19,1', HULLD, '0.7'),
    sail(-5, -13, 9, 7), sail(-5, -5, 11, 8), sail(6, -11, 8, 6), sail(6, -4, 10, 8),
    fill('M-5,-15 L-1,-14 L-5,-13 Z', RED, '0.4'),
    fill('M-18,7 L16,7 L18,3 L15,3 L14,6 L-12,6 C-14,6 -16,5 -17,3 L-19,3 Z', HULL, o),
    fill('M-18,7 L16,7 C15,11 12,14 8,15 L-12,15 C-15,14 -17,11 -18,7 Z', HULL, o),
    line('M-16,10 L14,10', '#C6993F', '0.6'),
    tone('M-17,11 L15,11 C13,13 11,14.4 8,15 L-12,15 C-14,14 -16,12.6 -17,11 Z', HULLD),
  ].join('');
}

// ── the fishing boat out at sea (growth6), drawn in the old 40 × 24 frame ───
// REFERENCE: a trawler side-on (Freeport, NY, "Sturgeon"): a high white wheelhouse aft, a
// dark hull with a red stripe at the waterline, a tall mast forward with its stays and a
// boom, the bow lifting to the LEFT. The masthead stays at (13, 1), where the lamp hangs.
export function fishingBoat() {
  const o = '0.5';
  const HULL = '#2F4E68', HULLD = '#213A4F', WHITE = '#F2F0EA', WHITED = '#CFCBC0', RED = '#B8382A', WIN = '#24323E';
  return [
    // mast, stays and boom
    line('M13,1.6 L13,15', '#3A3A3A', '0.75'),
    line('M13,2 L3,14 M13,2 L22,13 M13,8 L30,6', '#555', '0.35'),
    line('M13,10 L4,12.6', '#3A3A3A', '0.55'),
    // hull: the bow rising to the left, the stern square at the right
    fill('M2,13.6 C4,13.4 8,14.4 12,14.8 L38,14.8 L37.6,19.6 C30,21 14,21 6,19.6 C4,18 2.6,16 2,13.6 Z', HULL, o),
    tone('M6,19.6 C14,21 30,21 37.6,19.6 L37.8,18 C30,19.4 14,19.4 5,17.6 Z', HULLD),
    line('M4.2,17.4 C12,19 30,19 37.8,17.6', RED, '0.9'),
    line('M2.4,14 C6,14.4 9,14.8 12,15 L38,15', WHITE, '0.5'),
    // the wheelhouse aft, with its windows and a short stack
    fill('M23,14.8 L23,8.4 C23,7.6 23.6,7 24.4,7 L34,7 L35.6,14.8 Z', WHITE, o),
    tone('M33,7.4 L34,7 L35.6,14.8 L34.4,14.8 Z', WHITED),
    fill('M24.6,8.6 L33,8.6 L33.4,10.6 L24.6,10.6 Z', WIN, '0.25'),
    line('M27.4,8.6 L27.4,10.6 M30.2,8.6 L30.2,10.6', WHITE, '0.35'),
    fill('M29,7 L29,4.4 L31,4.4 L31,7 Z', RED, '0.35'),
  ].join('');
}

// ── the brown rat (econ5): running, two strides, in the old 38 × 13 frame ───
// REFERENCE: "Brown rat illustration" (public domain): long and low, the haunch the
// highest point, a tapering head, a round ear set high and back, a bead eye, pink feet and
// a bare tail as long again as the body. Running LEFT, its feet on y 12.6.
function ratRun(stride) {
  const o = '0.45';
  const FUR = '#7A6250', FURD = '#5C4838', FURL = '#9B8270', PINK = '#E2A7A0';
  const f = stride ? 1 : -1;
  return [
    tube([[20, 8], [27, 9.6], [32.4, 9.4], [37.2, 8]], 1.7, 0.6, PINK, '0.35'),
    tube([[18.6, 9.6], [18.2 - f * 2.4, 11.4], [17.8 - f * 3.4, 12.5]], 2.1, 1.2, FURD, o),
    tube([[8, 9], [7.4 + f * 1.4, 11.4], [6.8 + f * 2.6, 12.5]], 1.6, 1, FURD, o),
    fill('M2,8.2 C2.2,6.8 3.6,5.8 5.4,5.2 C7.4,4 9.6,2.8 13,2.8 C17.4,2.6 21.6,3 23.6,5.6 C25,7.8 24,10.6 20.6,11 '
      + 'C16,11.6 11.4,11.4 8.6,10.4 C6.6,9.8 4.6,9.6 3,9.4 C2.2,9.2 1.8,8.8 2,8.2 Z', FUR, o),
    tone('M6,9.6 C10,11 16,11.4 20.6,11 C22.6,10.8 23.8,9.6 24,8.4 C20,10 12,10 6,9.6 Z', FURD),
    tone('M9,3.6 C13,3 19,3.2 22,4.8 C18,4.2 13,4 9,4.6 Z', FURL),
    tube([[19, 9.4], [18.6 + f * 2.2, 11.4], [18.4 + f * 3.4, 12.5]], 2.2, 1.2, FUR, o),
    tube([[7.6, 8.8], [7.4 - f * 1.6, 11.2], [6.8 - f * 2.4, 12.5]], 1.7, 1, FUR, o),
    `<ellipse cx="${(18.4 + f * 3.4).toFixed(1)}" cy="12.6" rx="1.3" ry="0.5" fill="${PINK}"/>`,
    `<ellipse cx="${(6.8 - f * 2.4).toFixed(1)}" cy="12.6" rx="1.1" ry="0.45" fill="${PINK}"/>`,
    fill('M7.2,3.4 C7.2,1.6 9.4,1.2 10,2.8 C10.4,4 9,4.8 7.8,4.4 Z', FUR, o),
    tone('M7.9,3.2 C8,2.2 9.2,2 9.4,3 C9.4,3.6 8.6,4 8.1,3.8 Z', PINK),
    `<circle cx="5.4" cy="6" r="0.65" fill="#120E0B"/>`,
    `<circle cx="1.6" cy="8" r="0.7" fill="${PINK}" stroke="${INK}" stroke-width="0.3"/>`,
    line('M3,8.2 L-0.6,7 M3,8.6 L-0.6,9.2', '#3A2E25', '0.2'),
  ].join('');
}
export const ratRunA = () => ratRun(0);
export const ratRunB = () => ratRun(1);

/** A rat looking up out of a hole, face on, its paws on the rim, in the old 16 × 13. */
export function ratPeek() {
  const o = '0.4';
  const FUR = '#7A6250', FURD = '#5C4838', PINK = '#E2A7A0';
  return [
    fill('M1.4,3.4 C1.2,1 4.4,0.4 5.6,2.4 C5.4,4.4 3,5.4 1.4,3.4 Z', FUR, o),
    fill('M14.6,3.4 C14.8,1 11.6,0.4 10.4,2.4 C10.6,4.4 13,5.4 14.6,3.4 Z', FUR, o),
    tone('M2.4,3.2 C2.4,1.8 4.2,1.6 4.8,2.6 C4.6,3.6 3.2,4 2.4,3.2 Z', PINK),
    tone('M13.6,3.2 C13.6,1.8 11.8,1.6 11.2,2.6 C11.4,3.6 12.8,4 13.6,3.2 Z', PINK),
    fill('M3.4,6.6 C3.4,3.6 5.6,2.6 8,2.6 C10.4,2.6 12.6,3.6 12.6,6.6 C12.6,8.8 10.6,11.6 8,11.8 C5.4,11.6 3.4,8.8 3.4,6.6 Z', FUR, o),
    tone('M8,11.8 C10.6,11.6 12.6,8.8 12.6,6.6 C12.6,5.6 12.2,4.6 11.6,4 C11.8,7.6 10.4,10.6 8,11.8 Z', FURD),
    `<circle cx="5.9" cy="6.6" r="0.85" fill="#120E0B"/><circle cx="10.1" cy="6.6" r="0.85" fill="#120E0B"/>`,
    `<circle cx="6.2" cy="6.3" r="0.25" fill="#fff"/><circle cx="10.4" cy="6.3" r="0.25" fill="#fff"/>`,
    `<ellipse cx="8" cy="10.2" rx="1.1" ry="0.8" fill="${PINK}" stroke="${INK}" stroke-width="0.25"/>`,
    line('M7,10.4 L3.4,9.8 M7,10.8 L3.6,11.4 M9,10.4 L12.6,9.8 M9,10.8 L12.4,11.4', '#3A2E25', '0.18'),
    `<ellipse cx="4.6" cy="12.3" rx="1.8" ry="0.9" fill="${PINK}" stroke="${INK}" stroke-width="0.3"/>`,
    `<ellipse cx="11.4" cy="12.3" rx="1.8" ry="0.9" fill="${PINK}" stroke="${INK}" stroke-width="0.3"/>`,
  ].join('');
}

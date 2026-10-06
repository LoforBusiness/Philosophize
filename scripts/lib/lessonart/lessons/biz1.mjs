// business-foundations-1's detailed art, drawn as curves (LESSON_RULES AM13), each against
// a fetched reference and each taking the box of the shape-built object it replaces, so
// the scene's layout and motion are unchanged. The house look: flat fills lit from the
// top left, a shaded side, one dark outline. Zero imports.

const INK = '#2B2420';
const fill = (d, c, w) => `<path d="${d}" fill="${c}" stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
const tone = (d, c, o = 1) => `<path d="${d}" fill="${c}" opacity="${o}"/>`;
const line = (d, c, w) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;

// ── the wooden reamer, 22 × 8, lying handle LEFT, point RIGHT ───────────────
// REFERENCE: "Wooden lemon squeezer" (Wikimedia Commons, CC BY 2.5): turned beech — a
// round BULB of a handle, a slim NECK, a COLLAR ring, then a long OGIVE cone drawn out
// to a point, cut with deep straight ridges that all run to the point. The cone is
// longer than the handle and about as fat as the bulb. Held by the end of its handle,
// so it is drawn in reamer(9, 0, 22, 8)'s box: x -2…20, y -4…4.
function reamer() {
  const o = '0.5';
  const BEECH = '#DDBE8E', BEECHD = '#B9996A', BEECHL = '#EFD9B4', GROOVE = '#8F6E45';
  return [
    // the handle: a bulb, waisting into the neck
    fill('M-1.6,0 C-1.6,-2.4 0.4,-3 2.2,-2.6 C3.8,-2.2 4.6,-1.4 6,-1.1 L8,-1.1 L8,1.1 L6,1.1 C4.6,1.4 3.8,2.2 2.2,2.6 C0.4,3 -1.6,2.4 -1.6,0 Z', BEECH, o),
    tone('M-1.2,0.9 C-0.6,2.4 1.4,2.7 2.6,2.4 C3.8,2 4.8,1.3 6,1.05 L8,1.05 L8,0.4 L6,0.5 C4.4,0.8 3,1.5 1.6,1.6 C0.4,1.7 -0.6,1.4 -1.2,0.9 Z', BEECHD),
    tone('M-0.4,-1.4 C0.4,-2.2 1.8,-2.2 2.8,-1.8 C1.8,-1.5 0.6,-1.2 -0.4,-1.4 Z', BEECHL),
    // the collar ring
    fill('M7.6,-1.9 C8.4,-2 9.2,-2 9.6,-1.8 L9.6,1.8 C9.2,2 8.4,2 7.6,1.9 Z', BEECH, o),
    tone('M7.7,0.8 L9.5,0.8 L9.6,1.8 C9.2,2 8.4,2 7.7,1.9 Z', BEECHD),
    // the cone: an ogive drawn out to its point
    fill('M9.4,-2.9 C13,-3.2 17,-2 20,0 C17,2 13,3.2 9.4,2.9 C9,1 9,-1 9.4,-2.9 Z', BEECH, o),
    tone('M9.4,1.2 C13,1.6 16.6,1.1 19.6,0.2 C16.8,2 13,3.1 9.4,2.9 Z', BEECHD),
    // the ridges, every one running to the point
    line('M10.2,-1.9 C13.4,-1.9 16.8,-1 19.6,0', GROOVE, '0.38'),
    line('M10.4,-0.6 C13.6,-0.5 16.8,-0.3 19.6,0', GROOVE, '0.38'),
    line('M10.4,0.7 C13.6,0.7 16.8,0.4 19.6,0', GROOVE, '0.38'),
    line('M10.2,2 C13.4,2 16.8,1.1 19.6,0', GROOVE, '0.38'),
    line('M10.4,-1.3 C13.6,-1.2 16.6,-0.6 19,-0.1', BEECHL, '0.28'),
  ].join('');
}

// ── the stand's frame and sign, at its scene box 190–362 × 316–500 ─────────
// REFERENCES: "Lemonade Stand - panoramio" (Commons, CC BY-SA 3.0) — a child's stand in
// plain sawn wood: a SIGN BOARD on two square posts, a chalkboard let into the front, a
// counter box between the posts; "Lemonade Stand (6664771423)" (CC BY 2.0) — a striped,
// SCALLOPED canvas valance hanging under the name; "Lemonade Stand clipart icon" (CC BY-SA
// 4.0) — the sign overhanging its posts. Drawn in scene units, so nothing is converted:
// the slate is exactly where the scene writes on it (196–356 × 323.4–378.6) and the posts
// are where the shape-built stand had them (x 203.8 and 348.2, down to the ground).
function stand() {
  const o = '1.2';
  const WOOD = '#8E5F37', WOODD = '#6B4829', WOODL = '#AE7E4F', SLATE = '#3C4347', SLATED = '#2B3134';
  const LEMON = '#F2CF2E', LEMOND = '#C9A51C', LEAF = '#4F7A30', LEAFD = '#3B5C24', CANVAS = '#FBF6E6', CANVASD = '#E3D9BE';
  const out = [];
  // the two square posts, sawn, each with its shaded right side and a knot
  for (const cx of [203.8, 348.2]) {
    out.push(fill(`M${cx - 3.8},378 L${cx + 3.8},378 L${cx + 3.8},500 L${cx - 3.8},500 Z`, WOOD, o));
    out.push(tone(`M${cx + 1.2},379 L${cx + 3.2},379 L${cx + 3.2},499.4 L${cx + 1.2},499.4 Z`, WOODD));
    out.push(line(`M${cx - 2.2},381 L${cx - 2.2},498`, WOODL, '0.8'));
    out.push(`<ellipse cx="${cx - 0.6}" cy="438" rx="1.1" ry="2" fill="${WOODD}"/>`);
  }
  // the scalloped canvas valance hanging under the sign, lemon and white stripes
  const x0 = 197, x1 = 355, top = 380, drop = 8.5, n = 10, sw = (x1 - x0) / n;
  let edge = `M${x0},${top} L${x1},${top} L${x1},${top + drop - 2.4}`;
  for (let k = n - 1; k >= 0; k--) {
    const a = x0 + (k + 1) * sw, b = x0 + k * sw;
    edge += ` Q${((a + b) / 2).toFixed(2)},${top + drop + 3.6} ${b.toFixed(2)},${top + drop - 2.4}`;
  }
  edge += ' Z';
  out.push(`<clipPath id="biz1val"><path d="${edge}"/></clipPath>`);
  out.push(`<path d="${edge}" fill="${CANVAS}"/>`);
  const stripes = [];
  for (let k = 0; k < n; k++) if (k % 2 === 0) stripes.push(`<rect x="${(x0 + k * sw).toFixed(2)}" y="${top}" width="${sw.toFixed(2)}" height="${drop + 4}" fill="${LEMON}"/>`);
  out.push(`<g clip-path="url(#biz1val)">${stripes.join('')}<rect x="${x0}" y="${top + drop - 3.2}" width="${x1 - x0}" height="6" fill="${LEMOND}" opacity="0.45"/><rect x="${x0}" y="${top}" width="${x1 - x0}" height="2" fill="${CANVASD}" opacity="0.8"/></g>`);
  out.push(`<path d="${edge}" fill="none" stroke="${INK}" stroke-width="${o}" stroke-linejoin="round"/>`);
  // the sign board: a planked frame round the slate, overhanging the posts
  out.push(fill('M192.5,316.4 L359.5,316.4 C361,316.4 361.8,317.2 361.8,318.6 L361.8,380 C361.8,381.4 361,382.2 359.5,382.2 L192.5,382.2 C191,382.2 190.2,381.4 190.2,380 L190.2,318.6 C190.2,317.2 191,316.4 192.5,316.4 Z', WOOD, o));
  out.push(tone('M191,378.6 L361,378.6 L361,380.4 C361,381.4 360.4,381.6 359.4,381.6 L192.6,381.6 C191.6,381.6 191,381.2 191,380.4 Z', WOODD));
  out.push(tone('M357.4,317.2 L361,317.2 L361,381 L357.4,381 Z', WOODD, 0.7));
  out.push(line('M192,318.4 L360,318.4', WOODL, '1'));
  out.push(line('M192,319 L192,380', WOODL, '0.8'));
  // the slate let into it, recessed: the shadow falls on its top and left inside edge
  out.push(fill('M196,323.4 L356,323.4 L356,378.6 L196,378.6 Z', SLATE, '0.9'));
  out.push(tone('M196.4,323.8 L355.6,323.8 L355.6,325.6 L198.2,325.6 L198.2,378.2 L196.4,378.2 Z', SLATED));
  // old chalk wiped across it, very faint, so it is a real slate and not a screen
  out.push(`<g opacity="0.07">${line('M206,368 C236,360 268,371 300,362 C320,357 338,365 348,360', '#FFFFFF', '5')}${line('M210,334 C244,330 286,338 340,331', '#FFFFFF', '4')}</g>`);
  // nails at the frame's corners
  for (const [x, y] of [[193.4, 320], [358.6, 320], [193.4, 379], [358.6, 379]]) out.push(`<circle cx="${x}" cy="${y}" r="0.75" fill="${INK}"/>`);
  // a painted lemon with a leaf on each top corner
  for (const [cx, sgn] of [[198, 1], [354, -1]]) {
    out.push(fill(`M${cx + sgn * 2},${314.6} C${cx + sgn * 7},${309.6} ${cx + sgn * 10},${311.4} ${cx + sgn * 9.6},${314.4} C${cx + sgn * 7},${316.8} ${cx + sgn * 4},${316.6} ${cx + sgn * 2},${314.6} Z`, LEAF, '0.6'));
    out.push(tone(`M${cx + sgn * 2.6},${314.8} C${cx + sgn * 5},${315.8} ${cx + sgn * 7.6},${315.6} ${cx + sgn * 9.4},${314.6} C${cx + sgn * 7},${316.6} ${cx + sgn * 4},${316.4} ${cx + sgn * 2.6},${314.8} Z`, LEAFD));
    out.push(fill(`M${cx - 6.4},319.6 C${cx - 6.4},316.2 ${cx - 3.4},314.4 ${cx},314.4 C${cx + 3.4},314.4 ${cx + 6.4},316.2 ${cx + 6.4},319.6 C${cx + 6.4},323 ${cx + 3.4},324.8 ${cx},324.8 C${cx - 3.4},324.8 ${cx - 6.4},323 ${cx - 6.4},319.6 Z M${cx - 6.2},319.2 L${cx - 7.6},319.6 L${cx - 6.2},320.2 M${cx + 6.2},319.2 L${cx + 7.6},319.6 L${cx + 6.2},320.2`, LEMON, '0.7'));
    out.push(tone(`M${cx - 4.6},322.6 C${cx - 2},324.6 ${cx + 3.4},324.6 ${cx + 5.6},321.6 C${cx + 4.6},324.2 ${cx + 1.6},325 ${cx - 1},324.8 C${cx - 2.6},324.4 ${cx - 3.8},323.6 ${cx - 4.6},322.6 Z`, LEMOND));
    out.push(`<ellipse cx="${cx - 2.4}" cy="317.4" rx="1.8" ry="1" fill="#FFF6C8" transform="rotate(-20 ${cx - 2.4} 317.4)"/>`);
  }
  return out.join('');
}

export const ART = [
  // biz1's stand (lemonStand at 276, 408, 172, 184): the frame, the slate and the valance
  { name: 'biz1-stand', svg: stand, view: { x: 190, y: 308, w: 172, h: 192 }, box: { x: 190, y: 308, w: 172, h: 192 } },
  // biz1's reamer: reamer(9, 0, 22, 8) in its rider's own frame
  { name: 'biz1-reamer', svg: reamer, view: { x: -2, y: -4, w: 22, h: 8 }, box: { x: -2, y: -4, w: 22, h: 8 } },
];

// history-foundations-3, "Why Did It Happen?" — the village bank, drawn (LESSON_RULES AM13).
// REFERENCES (npm run ref, scratchpad/ref): barn-1 (Pinhead barn icon: the GAMBREL gable, a
// loft window over wide double doors on two piers) and treeil-1 (CC0 park tree: ONE lumpy
// canopy mass over a short, flared trunk, a branch fork showing in a gap). The barn is red
// with white trim and a stone sill; the tree takes the canopy's lit top-left and shaded
// lower-right. Flat fills, ONE dark outline, no gradients. Zero imports.
const INK = '#2B2420';
const fill = (d, c, w = 1) => `<path d="${d}" fill="${c}" stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
const tone = (d, c, o = 1) => `<path d="${d}" fill="${c}"${o < 1 ? ` opacity="${o}"` : ''}/>`;
const line = (d, c, w, o = 1) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${o < 1 ? ` opacity="${o}"` : ''}/>`;

// the barn, 92 x 140, standing on y 140
function barnArt() {
  const o = [];
  const RED = '#B5412F', REDS = '#8F3022', TRIM = '#F2EBDD', DARK = '#3A2A22';
  o.push(fill('M6,138 L6,62 L13,36 L46,8 L79,36 L86,62 L86,138 Z', RED, 1.2));
  o.push(tone('M70,138 L70,45 L79,36 L86,62 L86,138 Z', REDS, 0.9));
  // plank lines
  for (let x = 12; x < 86; x += 7) o.push(line(`M${x},64 L${x},130`, REDS, 0.5, 0.55));
  // roof trim along the gambrel edge
  o.push(line('M6,62 L13,36 L46,8 L79,36 L86,62', TRIM, 2.6));
  o.push(line('M6,62 L13,36 L46,8 L79,36 L86,62', INK, 0.5, 0.6));
  // stone sill
  o.push(fill('M4,138 L4,128 L88,128 L88,138 Z', '#9C9488', 1));
  o.push(tone('M4,128 L40,128 L40,130 L4,130 Z', '#B9B2A6'));
  for (const x of [20, 38, 56, 74]) o.push(line(`M${x},128 L${x},138`, INK, 0.5, 0.5));
  // double doors with the white X braces
  o.push(fill('M24,128 L24,76 L68,76 L68,128 Z', REDS, 1.1));
  o.push(line('M46,76 L46,128', INK, 1));
  for (const [x0, x1] of [[26, 44], [48, 66]]) {
    o.push(`<rect x="${x0}" y="78.5" width="${x1 - x0}" height="47.5" fill="none" stroke="${TRIM}" stroke-width="1.8"/>`);
    o.push(line(`M${x0},78.5 L${x1},126`, TRIM, 1.6));
    o.push(line(`M${x1},78.5 L${x0},126`, TRIM, 1.6));
  }
  o.push(`<rect x="22.5" y="74.5" width="47" height="3" fill="${TRIM}" stroke="${INK}" stroke-width="0.7"/>`);
  // loft door with hay
  o.push(fill('M35,62 L35,38 L57,38 L57,62 Z', DARK, 1));
  o.push(tone('M36,62 L36,55 Q41,51 46,55 Q51,51 56,55 L56,62 Z', '#D7A94A'));
  o.push(`<rect x="33.5" y="36.5" width="25" height="27" fill="none" stroke="${TRIM}" stroke-width="2"/>`);
  o.push(line('M46,38 L46,52', TRIM, 1.3));
  return o.join('');
}

// the oak, 64 x 108, standing on y 108
function treeArt() {
  const o = [];
  const BARK = '#8B5A2B', BARKS = '#6B4220', LEAF = '#6FA34B', LEAFS = '#4F8238', LEAFL = '#8DC060';
  // trunk, flared at the foot, with the fork rising into the crown
  o.push(fill('M20,108 Q27,100 27,88 L27,58 L38,58 L38,88 Q38,100 46,108 Z', BARK, 1.2));
  o.push(tone('M33,60 L38,60 L38,88 Q38,100 46,107 L36,107 Q33,98 33,88 Z', BARKS));
  o.push(line('M30,70 L30,82', BARKS, 0.7, 0.8));
  o.push(line('M31,92 L31,100', BARKS, 0.7, 0.8));
  // one lumpy canopy, a scalloped edge
  const crown = 'M6,52 Q0,40 8,32 Q4,20 15,15 Q18,3 31,5 Q42,1 49,11 Q60,13 59,26 Q66,36 58,46 Q60,58 48,60 Q40,68 31,64 Q20,70 14,60 Q6,62 6,52 Z';
  o.push(fill(crown, LEAF, 1.3));
  o.push(tone('M48,60 Q60,58 58,46 Q66,36 59,26 Q58,40 52,48 Q50,56 40,60 Q40,68 31,64 Q38,64 48,60 Z', LEAFS));
  o.push(tone('M9,34 Q6,22 16,17 Q20,8 30,8 Q22,12 20,22 Q12,24 9,34 Z', LEAFL));
  o.push(tone('M16,50 Q10,42 15,36 Q20,40 18,48 Z', LEAFL, 0.7));
  // a gap showing the fork, and leaf-clump creases
  o.push(tone('M28,60 L36,60 L34,66 L30,66 Z', BARK));
  o.push(line('M30,30 Q36,36 44,33', LEAFS, 0.9, 0.9));
  o.push(line('M16,44 Q22,50 30,48', LEAFS, 0.9, 0.9));
  o.push(line('M40,46 Q46,50 52,45', LEAFS, 0.9, 0.9));
  return o.join('');
}

export const ART = [
  { name: 'hist3-barn', svg: barnArt, view: { x: 0, y: 0, w: 92, h: 140 }, box: { x: 330, y: 360, w: 92, h: 140 } },
  { name: 'hist3-tree', svg: treeArt, view: { x: 0, y: 0, w: 64, h: 108 }, box: { x: -6, y: 392, w: 64, h: 108 } },
];

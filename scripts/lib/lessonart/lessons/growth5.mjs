// growth5 — personal-growth-foundations-5, "Practise at the Edge": A CIRCUS BIG TOP.
// Zero imports. REFERENCE looked at (scratchpad/ref/g5-fish-3): "Fishing-net" (Lorc, CC BY 3.0):
// a net is a SQUARE MESH whose knots follow the bowl's curve, held by a THICK BORDER ROPE
// and laced to its posts at the corners. Seen from the side the near lip is the front curve
// and the mesh shows through between it and the far lip.
const INK = '#1A1A1A', ROPE = '#3B4656', ROPEL = '#6F7F96', ROPED = '#27303D';
const x0 = 0, x1 = 88, top = 4, low = 14;
// the bowl: far lip is the straight cord, near lip sags to `low`
const sag = (x, d) => top + d * Math.sin(Math.PI * (x - x0) / (x1 - x0));
function mesh() {
  let s = '';
  s += `<path d="M${x0},${top} Q44,${top + 2 * (low - top)} ${x1},${top} Z" fill="#9AA6B8" opacity="0.28"/>`;
  // mesh: threads running down the bowl, and cross rows that follow its curve
  for (let k = 1; k < 16; k += 1) {
    const x = x0 + (k * (x1 - x0)) / 16;
    s += `<path d="M${x},${top + 0.4} L${x},${sag(x, low - top - 1)}" stroke="${ROPE}" stroke-width="0.55" stroke-linecap="round"/>`;
  }
  for (let r = 1; r < 4; r += 1) {
    const d = ((low - top - 1) * r) / 4;
    let p = `M${x0 + 1},${top}`;
    for (let x = x0 + 1; x <= x1 - 1; x += 4) p += ` L${x},${sag(x, d)}`;
    s += `<path d="${p}" fill="none" stroke="${ROPE}" stroke-width="0.55" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
  // thick border rope round the near lip, dark under, lit on top (flat, lit from the top left)
  let lip = `M${x0},${top}`;
  for (let x = x0; x <= x1; x += 2) lip += ` L${x},${sag(x, low - top)}`;
  s += `<path d="${lip}" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += `<path d="${lip}" fill="none" stroke="${ROPEL}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += `<path d="M${x0},${top} L${x1},${top}" stroke="${INK}" stroke-width="2.3" stroke-linecap="round"/>`;
  s += `<path d="M${x0},${top} L${x1},${top}" stroke="${ROPED}" stroke-width="1.3" stroke-linecap="round"/>`;
  // lacing knots at the corners
  for (const x of [x0, x1]) s += `<circle cx="${x}" cy="${top}" r="2" fill="${ROPEL}" stroke="${INK}" stroke-width="0.8"/>`;
  return s;
}
export const ART = [
  { name: 'growth5-net', svg: () => mesh(), view: { x: -3, y: 0, w: 94, h: 22 }, box: { x: 173, y: 470, w: 94, h: 22 } },
];

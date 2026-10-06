// history-foundations-2, "How Historians Know" - the attic, drawn (LESSON_RULES AM13).
// Each picture replaces a shape-built object of the same box, so nothing on the stage
// moves. Flat fills lit from the top left, a shaded side, ONE dark outline, no gradients.
// REFERENCES: Wikimedia Commons search returned only diagrams for trunk / hatbox / suitcase
// (npm run ref, slugs hist2*, h2*), so the construction follows the app's own reference
// notes in objects.ts (domed steamer lid on slatted wood and brass bands, a round
// hatbox with a rolled lip and ribbon, an oval-framed portrait). Zero imports.

const INK = '#2B2420';
const P = (n) => +n.toFixed(2);
const fill = (d, c, w = 0.9) => `<path d="${d}" fill="${c}" stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
const tone = (d, c, o = 1) => `<path d="${d}" fill="${c}"${o < 1 ? ` opacity="${o}"` : ''}/>`;
const line = (d, c, w, o = 1) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${o < 1 ? ` opacity="${o}"` : ''}/>`;
const rect = (x, y, w, h, c, sw = 0.9, r = 0.6) => `<rect x="${P(x)}" y="${P(y)}" width="${P(w)}" height="${P(h)}" rx="${r}" fill="${c}" stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round"/>`;
const ell = (cx, cy, rx, ry, c, sw = 0.9) => `<ellipse cx="${P(cx)}" cy="${P(cy)}" rx="${P(rx)}" ry="${P(ry)}" fill="${c}" stroke="${INK}" stroke-width="${sw}"/>`;

// the steamer trunk (90 x 30): a domed lid on a canvas-and-slat body
function trunk() {
  const o = [];
  o.push(rect(1.5, 11.5, 87, 17.5, '#41604B', 1));
  o.push(tone('M80,12 L88,12 L88,28.4 L80,28.4 Z', '#2E4637'));
  o.push(tone('M2,12 L40,12 L40,14.2 L2,14.2 Z', '#5C7E66'));
  o.push(fill('M1.5,12 L1.5,9.5 Q2,2.6 12,1.6 L78,1.6 Q88,2.6 88.5,9.5 L88.5,12 Z', '#4C6E58', 1));
  o.push(tone('M5,9 Q6,4.4 13,3.4 L44,3.4 L44,5.4 L12,5.6 Q8,6.2 7,9 Z', '#6E9279'));
  o.push(tone('M78,3.4 Q86,4 87,9.5 L87,11.5 L80,11.5 Z', '#38543F'));
  for (const x of [14, 26, 63, 75]) {
    o.push(rect(x, 2, 5, 26.6, '#B47A3C', 0.8, 0.4));
    o.push(tone(`M${x + 0.6},2.6 L${x + 1.8},2.6 L${x + 1.8},28 L${x + 0.6},28 Z`, '#D39C58'));
    o.push(tone(`M${x + 3.8},2.6 L${x + 4.5},2.6 L${x + 4.5},28 L${x + 3.8},28 Z`, '#8D5A28'));
  }
  o.push(rect(0.8, 10.6, 88.4, 2.8, '#C9A23A', 0.8, 0.5));
  o.push(tone('M1.5,11 L88,11 L88,11.8 L1.5,11.8 Z', '#EBCB6A'));
  for (const [x, f] of [[0.8, 1], [89.2, -1]]) {
    o.push(fill(`M${x},19 L${x + 6 * f},19 L${x + 6 * f},21 L${x + 2 * f},21 L${x + 2 * f},28.6 L${x},28.6 Z`, '#C9A23A', 0.7));
  }
  o.push(rect(41, 10.6, 8, 8.6, '#D9B445', 0.9, 1));
  o.push(tone('M41.8,11.4 L48,11.4 L48,12.8 L41.8,12.8 Z', '#F1D77C'));
  o.push(`<circle cx="45" cy="14.6" r="1.1" fill="${INK}"/>`);
  o.push(`<path d="M44.4,14.8 L45.6,14.8 L45.9,17.4 L44.1,17.4 Z" fill="${INK}"/>`);
  o.push(rect(4, 28.4, 7, 1.5, '#6B4423', 0.7, 0.4));
  o.push(rect(79, 28.4, 7, 1.5, '#6B4423', 0.7, 0.4));
  return o.join('');
}

// the hatbox (26 wide): the dark inside, then the body with its rolled front lip
function hatBack() {
  return `${ell(13, 4, 12.4, 3.6, '#4A3A44', 0.9)}${ell(13, 4.6, 10.8, 2.6, '#2C2229', 0)}`;
}
function hatFront() {
  const o = [];
  o.push(fill('M0.6,3.8 Q13,8.4 25.4,3.8 L25.4,21 Q13,25.4 0.6,21 Z', '#D98FA3', 1));
  o.push(tone('M0.6,4.4 Q13,8.8 25.4,4.4 L25.4,6.6 Q13,11 0.6,6.6 Z', '#F2B8C6'));
  o.push(tone('M18.4,7.6 Q22,6.8 25.4,5.2 L25.4,21 Q22,22.6 18.4,23 Z', '#B56D83'));
  o.push(tone('M0.6,12 Q13,16.4 25.4,12 L25.4,15 Q13,19.4 0.6,15 Z', '#F4E6C8'));
  o.push(line('M0.6,12 Q13,16.4 25.4,12', '#8C5565', 0.5));
  o.push(line('M0.6,15 Q13,19.4 25.4,15', '#8C5565', 0.5));
  o.push(fill('M11.2,16.4 L8,14.4 L8.2,18.8 Z M14.8,16.4 L18,14.4 L17.8,18.8 Z', '#6F2C45', 0.6));
  o.push(`<circle cx="13" cy="16.5" r="1.3" fill="#8F3B59" stroke="${INK}" stroke-width="0.6"/>`);
  return o.join('');
}
// the lid leaning on the box (8 x 26): a round lid seen from the side
function hatLid() {
  const o = [];
  o.push(fill('M1,2 Q4,0.4 7,2 L7,24 Q4,26 1,24 Z', '#D98FA3', 0.9));
  o.push(tone('M1.4,2.2 Q3,1.2 4,1.6 L4,24.4 Q2.6,24.4 1.4,23.8 Z', '#F2B8C6'));
  o.push(tone('M5.4,1.8 Q6.4,2 6.8,2.4 L6.8,23.6 Q6.2,24.4 5.4,24.6 Z', '#B56D83'));
  o.push(line('M1.2,8 Q4,9.2 6.8,8', '#8C5565', 0.5));
  return o.join('');
}

// the letters tied in a bundle (20 x 20) and a newspaper's corner (12 x 12)
function bundle() {
  const o = [];
  o.push(fill('M1,17 L2,6 L16,3 L19,14 Z', '#E8D6A8', 0.8));
  o.push(fill('M2,17 L3,8 L17,5.4 L18.4,15 Z', '#F3E6BE', 0.8));
  o.push(tone('M14,6 L17,5.4 L18.4,15 L15,15.6 Z', '#CDB783'));
  o.push(line('M6,7.6 L6.8,16.8', '#9B4A3C', 0.8));
  o.push(line('M12,6.4 L12.6,15.8', '#9B4A3C', 0.8));
  o.push(line('M5.4,11.6 L13,10.6', '#7A4B32', 0.9));
  return o.join('');
}
function corner() {
  return fill('M1,11 L2,3 L8,1 L11,6 L10,11 Z', '#E9DEC4', 0.8)
    + tone('M7,1.6 L11,6 L8.4,5.6 Z', '#C9BC9C')
    + line('M3.4,5 L8.6,3.4', '#8C8470', 0.5) + line('M3.4,7.2 L9.4,6', '#8C8470', 0.5) + line('M3.4,9.2 L9,8.4', '#8C8470', 0.5);
}

// the leaflet standing on the trunk (12 x 16): a glossy three-fold
function leaflet() {
  const o = [];
  o.push(fill('M1,15.4 L2,3 L10,3 L11,15.4 Z', '#F6F4EC', 0.8));
  o.push(tone('M2,3 L10,3 L10,7 L2,7 Z', '#3F6EA8'));
  o.push(line('M6,3 L6,15.4', '#C9C7BC', 0.5));
  o.push(tone('M3,8.6 L5.2,8.6 L5.2,11 L3,11 Z', '#D7B46A'));
  o.push(line('M7,9 L9.4,9', '#8C8A80', 0.5));
  o.push(line('M7,10.8 L9.4,10.8', '#8C8A80', 0.5));
  o.push(line('M3,13 L9.4,13', '#8C8A80', 0.5));
  o.push(line('M3.2,5 L8.6,5', '#EAF1FA', 0.7));
  return o.join('');
}

// the shelf with its row of books (64 x 38)
const SPINES = ['#7C2D3A', '#2F5B7A', '#C69A3A', '#4E7A4A', '#6A3C7A', '#9B5A2D'];
function shelf() {
  const o = [];
  let x = 4;
  [[5, 22, 0], [4, 25, 0], [6, 20, 0.14], [5, 23, 0], [4, 21, 0], [6, 24, 0]].forEach(([w, h, lean], k) => {
    const c = SPINES[k];
    const rot = lean ? ` transform="rotate(${P(lean * 57)} ${P(x + w / 2)} 27)"` : '';
    o.push(`<g${rot}>${rect(x, 27 - h, w, h, c, 0.8, 0.5)}${tone(`M${x + 0.6},${27 - h + 0.6} L${x + 1.6},${27 - h + 0.6} L${x + 1.6},26.4 L${x + 0.6},26.4 Z`, '#FFFFFF', 0.28)}${line(`M${x + 1},${27 - h + 3} L${x + w - 1},${27 - h + 3}`, '#E8D9A4', 0.6)}</g>`);
    x += w + 0.4;
  });
  o.push(rect(0, 27, 64, 4.6, '#A9743F', 1, 0.6));
  o.push(tone('M0.6,27.6 L63.4,27.6 L63.4,28.8 L0.6,28.8 Z', '#D09C5E'));
  o.push(tone('M0.6,30.4 L63.4,30.4 L63.4,31.2 L0.6,31.2 Z', '#7A4E26'));
  for (const bx of [6, 54]) o.push(fill(`M${bx},31.6 L${bx + 4},31.6 L${bx},37 Z`, '#6B4423', 0.7));
  return o.join('');
}
// the history book: maroon cloth, a gilt plate with a castle, shaded spine edge
function bookCover(w, h) {
  const o = [];
  o.push(rect(0.6, 0.6, w - 1.2, h - 1.2, '#7B2634', 0.9, 0.8));
  o.push(tone(`M${w - 3.4},0.8 L${w - 0.8},0.8 L${w - 0.8},${h - 0.8} L${w - 3.4},${h - 0.8} Z`, '#5A1A26'));
  o.push(tone(`M1,0.8 L${P(w * 0.45)},0.8 L${P(w * 0.45)},${P(h * 0.35)} L1,${P(h * 0.35)} Z`, '#9E3E4D', 0.7));
  o.push(rect(w * 0.18, h * 0.16, w * 0.54, h * 0.4, '#E8C86A', 0.5, 0.4));
  const cx = w * 0.45, by = h * 0.5, cw = w * 0.34;
  const l = cx - cw / 2, r = cx + cw / 2;
  o.push(`<path d="M${P(l)},${P(by)} L${P(l)},${P(by - h * 0.14)} L${P(l + 1)},${P(by - h * 0.14)} L${P(l + 1)},${P(by - h * 0.18)} L${P(r - 1)},${P(by - h * 0.18)} L${P(r - 1)},${P(by - h * 0.14)} L${P(r)},${P(by - h * 0.14)} L${P(r)},${P(by)} Z" fill="#8A6A2A"/>`);
  o.push(line(`M${P(w * 0.18 + 1)},${P(h * 0.7)} L${P(w * 0.72 - 1)},${P(h * 0.7)}`, '#E8C86A', 0.8));
  o.push(line(`M${P(w * 0.26)},${P(h * 0.8)} L${P(w * 0.64)},${P(h * 0.8)}`, '#E8C86A', 0.6));
  return o.join('');
}
const copy = () => bookCover(16, 20);
const bookShut = () => bookCover(16, 20);

// the book open (20 x 13): a picture of a castle on the left, lines on the right
function bookOpen() {
  const o = [];
  o.push(fill('M0.6,1.6 L10,2.8 L19.4,1.6 L19.4,12 L10,12.8 L0.6,12 Z', '#7B2634', 0.9));
  o.push(fill('M1.6,1.6 L9.8,2.6 L9.8,12 L1.6,11 Z', '#F4EBD0', 0.7));
  o.push(fill('M18.4,1.6 L10.2,2.6 L10.2,12 L18.4,11 Z', '#EFE4C4', 0.7));
  o.push(tone('M8.4,2.5 L9.8,2.6 L9.8,12 L8.4,11.8 Z', '#CDBF98'));
  o.push(tone('M2.8,3.4 L8.2,4 L8.2,8.6 L2.8,8 Z', '#9CC0DE'));
  o.push(tone('M2.8,6.8 L8.2,7.2 L8.2,8.6 L2.8,8 Z', '#6E9A5C'));
  o.push(tone('M4.2,7.4 L4.2,5.2 L4.8,5.2 L4.8,5.6 L6.2,5.6 L6.2,5.2 L6.8,5.2 L6.8,7.5 Z', '#8A8A94'));
  for (const y of [3.8, 5.4, 7, 8.6, 10]) o.push(line(`M11.4,${y} L17.2,${y - 0.2}`, '#7C7466', 0.5));
  return o.join('');
}

// the letter (14 x 18): ruled paper, yellowed, with a folded corner
function letter() {
  const o = [];
  o.push(fill('M1,1 L10.4,1 L13,3.6 L13,17 L1,17 Z', '#F0E1B2', 0.8));
  o.push(tone('M10.4,1 L13,3.6 L10.4,3.6 Z', '#CDB57A'));
  [4, 6, 8, 10, 12, 14].forEach((y, k) => o.push(line(`M2.8,${y} L${k === 5 ? 7 : 11},${y}`, '#4A3A30', 0.6, 0.85)));
  return o.join('');
}

// the old newspaper (30 x 26): folded broadsheet, a photo, columns; the top is left clear for the year
function news() {
  const o = [];
  o.push(fill('M1,25 L2,1 L28,1 L29,25 Z', '#E7DDC2', 0.9));
  o.push(tone('M23,1 L28,1 L29,25 L24,25 Z', '#CFC4A6'));
  o.push(line('M15,13 L15,25', '#B0A586', 0.5));
  o.push(line('M3,12 L27,12', '#4A4238', 0.7));
  o.push(tone('M3.4,14 L13.6,14 L13.6,20.4 L3.4,20.4 Z', '#8E8A80'));
  o.push(tone('M5,19.4 L8,16.2 L10,18 L11.6,16.6 L13,19.4 Z', '#B8B4A8'));
  for (const y of [14.6, 16.4, 18.2, 20, 21.8, 23.4]) o.push(line(`M16.4,${y} L26,${y}`, '#7E7664', 0.5));
  for (const y of [22, 23.6]) o.push(line(`M3.6,${y} L13.4,${y}`, '#7E7664', 0.5));
  return o.join('');
}

// great-grandad's portrait (30 x 38): an oval in a dark wood frame
function portrait() {
  const o = [];
  o.push(fill('M1,36.6 L1.6,4 Q15,0.4 28.4,4 L29,36.6 Z', '#5A3A22', 1));
  o.push(tone('M1.6,5 Q8,2.6 15,2.4 L15,4 Q8,4.4 2.6,6.4 Z', '#8A603A'));
  o.push(fill('M4.2,33.6 L4.6,6.6 Q15,4.2 25.4,6.6 L25.8,33.6 Z', '#D8CBA4', 0.7));
  o.push(ell(15, 19.6, 9.4, 12.6, '#7E8C8A', 0.8));
  o.push(`<path d="M7,31.6 Q7.4,25.4 15,24.4 Q22.6,25.4 23,31.6 Q15,33.6 7,31.6 Z" fill="#3E4A3A" stroke="${INK}" stroke-width="0.6"/>`);
  o.push(`<ellipse cx="15" cy="17.6" rx="4" ry="5" fill="#D9A987" stroke="${INK}" stroke-width="0.6"/>`);
  o.push(`<path d="M10.8,14.4 Q15,8.2 19.2,14.4 L19.2,12.4 Q15,7.4 10.8,12.4 Z" fill="#3E4A3A" stroke="${INK}" stroke-width="0.6"/>`);
  o.push(line('M12.6,20.2 Q15,21.6 17.4,20.2', '#4A3226', 0.9));
  o.push(`<circle cx="13.4" cy="17" r="0.5" fill="${INK}"/><circle cx="16.6" cy="17" r="0.5" fill="${INK}"/>`);
  o.push(line('M7,31 Q15,29.2 23,31', '#C9A23A', 0.7));
  return o.join('');
}

export const ART = [
  // steamerTrunk(190, 485, 90, 30)
  { name: 'hist2-trunk', svg: trunk, view: { x: 0, y: 0, w: 90, h: 30 }, box: { x: 145, y: 470, w: 90, h: 30 } },
  // hatboxBack(297, 478, 26, 7) and hatboxFront(297, 489, 26, 22)
  { name: 'hist2-hatback', svg: hatBack, view: { x: 0, y: 0, w: 26, h: 8 }, box: { x: 284, y: 474, w: 26, h: 8 } },
  { name: 'hist2-hatfront', svg: hatFront, view: { x: 0, y: 0, w: 26, h: 26 }, box: { x: 284, y: 475, w: 26, h: 26 } },
  // hatboxLid(320, 487, 8, 26)
  { name: 'hist2-hatlid', svg: hatLid, view: { x: 0, y: 0, w: 8, h: 26 }, box: { x: 316, y: 474, w: 8, h: 26 } },
  // letterBundle(292, 472, 20, 20)
  { name: 'hist2-bundle', svg: bundle, view: { x: 0, y: 0, w: 20, h: 20 }, box: { x: 282, y: 462, w: 20, h: 20 } },
  // newsCorner(306, 476, 12, 12)
  { name: 'hist2-corner', svg: corner, view: { x: 0, y: 0, w: 12, h: 12 }, box: { x: 300, y: 470, w: 12, h: 12 } },
  // museumLeaflet(190, 462, 12, 16)
  { name: 'hist2-leaflet', svg: leaflet, view: { x: 0, y: 0, w: 12, h: 16 }, box: { x: 184, y: 454, w: 12, h: 16 } },
  // wallShelf(332, 418, 64, 10.4) with its row of books (shelfBooks 316, 400): one picture
  { name: 'hist2-shelf', svg: shelf, view: { x: 0, y: 0, w: 64, h: 38 }, box: { x: 300, y: 386, w: 64, h: 38 } },
  // historyBook(348, 403, 16, 20): the second copy
  { name: 'hist2-copy', svg: copy, view: { x: 0, y: 0, w: 16, h: 20 }, box: { x: 340, y: 393, w: 16, h: 20 } },
  // portraitFrame(375, 481, 30, 38)
  { name: 'hist2-portrait', svg: portrait, view: { x: 0, y: 0, w: 30, h: 38 }, box: { x: 360, y: 462, w: 30, h: 38 } },
  // riders: drawn about their own centre
  { name: 'hist2-book', svg: bookShut, view: { x: 0, y: 0, w: 16, h: 20 }, box: { x: -8, y: -10, w: 16, h: 20 } },
  { name: 'hist2-bookopen', svg: bookOpen, view: { x: 0, y: 0, w: 20, h: 13 }, box: { x: -10, y: -6.5, w: 20, h: 13 } },
  { name: 'hist2-letter', svg: letter, view: { x: 0, y: 0, w: 14, h: 18 }, box: { x: -7, y: -9, w: 14, h: 18 } },
  { name: 'hist2-news', svg: news, view: { x: 0, y: 0, w: 30, h: 26 }, box: { x: -15, y: -13, w: 30, h: 26 } },
];

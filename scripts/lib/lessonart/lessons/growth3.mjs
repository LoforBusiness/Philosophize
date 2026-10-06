// growth3 — personal-growth-foundations-3, "How to Set a Goal That Works": A PARK RUNNING TRACK.
// Drawn pictures (LESSON_RULES AM13), view = box in SCENE units. Zero imports.
//
// REFERENCES looked at (scratchpad/ref/):
//   g3bench-1  "Old friends" (CC BY-SA 4.0): a painted park bench is a SEAT of several flat
//              slats, a BACK of slats between two arm-high end frames, deep ARMRESTS that run
//              forward over their posts, and a front rail under the seat on stout square legs.
//   g3b-1      "Bulletin board Pinhead icon" (CC0): a notice board is a wide rounded panel
//              with paper sheets pinned at slight angles, each by one pin.
//   (a cork board has a darker wooden frame; a park board adds a gabled cap on two posts.)

const INK = '#2B2420';
const fill = (d, c, w) => `<path d="${d}" fill="${c}" stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
const tone = (d, c, o = 1) => `<path d="${d}" fill="${c}" opacity="${o}"/>`;
const line = (d, c, w) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
const rect = (x, y, w, h, r, c, sw) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${c}" stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round"/>`;

const WOOD = '#A9764A', WOODL = '#C79563', WOODD = '#7F5434';
const CORK = '#C9955A', CORKD = '#B4804A', CORKL = '#DDAE76';

// ── the notice board: box 136..252 × 412..500 ───────────────────────────────
export function board() {
  const o = '1';
  const dots = [];
  // cork grain: small flecks, deterministic
  for (let k = 0; k < 46; k++) {
    const x = 146 + ((k * 37) % 96) + (k % 3) * 0.7;
    const y = 433 + ((k * 23) % 44);
    dots.push(`<ellipse cx="${x}" cy="${y}" rx="${0.9 + (k % 3) * 0.3}" ry="0.55" fill="${k % 2 ? CORKD : CORKL}" opacity="0.7"/>`);
  }
  return [
    // posts, shaded on the right
    rect(144, 478, 6, 22, 1, WOOD, o), rect(240, 478, 6, 22, 1, WOOD, o),
    tone('M148,479 L149.2,479 L149.2,499 L148,499 Z', WOODD, 0.7), tone('M244,479 L245.2,479 L245.2,499 L244,499 Z', WOODD, 0.7),
    // the frame, a deep wooden moulding
    rect(139, 427, 110, 56, 3, WOOD, '1.4'),
    tone('M141,429 L247,429 L247,431 L141,431 Z', WOODL, 0.8),
    tone('M141,481 L247,481 L247,482 L141,482 Z', WOODD, 0.8),
    // the cork, cut in
    rect(143, 431, 102, 48, 1.5, CORK, '0.8'),
    tone('M143.4,431.4 L244.6,431.4 L244.6,433.6 L143.4,433.6 Z', CORKD, 0.7),
    dots.join(''),
    // the gabled cap
    fill('M134,429 L194,411 L254,429 Z', '#8C4E3B', '1.4'),
    tone('M194,411 L254,429 L194,429 Z', '#6F3B2C', 0.7),
    line('M140,427.4 L194,412.4', '#B8705A', '0.9'),
    rect(136, 427, 116, 4, 1, WOODD, '1'),
  ].join('');
}

// ── the bench: box 10..82 × 460..500 (front view) ───────────────────────────
export function bench() {
  const o = '1.2';
  return [
    // legs and arm posts
    rect(14, 484, 6, 16, 1, WOOD, o), rect(72, 484, 6, 16, 1, WOOD, o),
    tone('M18,485 L19.2,485 L19.2,499 L18,499 Z', WOODD, 0.7), tone('M76,485 L77.2,485 L77.2,499 L76,499 Z', WOODD, 0.7),
    // back slats between the end frames
    rect(14, 462, 64, 5, 1.2, WOOD, o), rect(14, 468.6, 64, 5, 1.2, WOOD, o), rect(14, 475.2, 64, 5, 1.2, WOOD, o),
    tone('M15,463 L77,463 L77,464.4 L15,464.4 Z', WOODL, 0.8), tone('M15,469.6 L77,469.6 L77,471 L15,471 Z', WOODL, 0.8),
    tone('M15,476.2 L77,476.2 L77,477.6 L15,477.6 Z', WOODL, 0.8),
    // end frames of the back, rising above the seat
    rect(11, 460, 6, 28, 2, WOOD, o), rect(75, 460, 6, 28, 2, WOOD, o),
    tone('M12,461.4 L13.4,461.4 L13.4,486 L12,486 Z', WOODL, 0.7),
    // the seat: two slats and a front rail
    rect(10, 482, 72, 5.4, 1.6, WOOD, o), rect(10, 487, 72, 4.4, 1.4, WOODD, o),
    tone('M11,483 L81,483 L81,484.4 L11,484.4 Z', WOODL, 0.8),
    // armrests over the end frames
    rect(8, 478.6, 12, 3.4, 1.6, WOODL, o), rect(72, 478.6, 12, 3.4, 1.6, WOODL, o),
  ].join('');
}

const box = (x, y, w, h) => ({ x, y, w, h });
const same = (b) => ({ view: b, box: b });

export const ART = [
  { name: 'growth3-board', svg: board, ...same(box(132, 408, 126, 94)) },
  { name: 'growth3-bench', svg: bench, ...same(box(4, 456, 84, 46)) },
];

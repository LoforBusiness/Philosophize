// CLOTHES ON THE BODY — the second unit's costumes. ZERO IMPORTS.
//
// The owner, 2026-10-08, opening unit 2: *"if the plain stickman is Julius Caesar, he
// will dress up like Julius Caesar … I want the stickman to have a nice white robe on,
// and it must look very good for whatever outfit the stickman is having on."*
//
// That reverses wardrobe.ts's rule — "NOTHING IS DRAWN ON THE BODY" — and the reason the
// rule existed is worth keeping in view, because it is what this file has to beat. Every
// torso piece tried before (a blazer, a pencil skirt, a waistcoat) was a SMALL shape laid
// INSIDE an ink silhouette, so it was ink on ink and read as nothing, or as a lump. A
// garment here is the opposite: a LIGHT, FILLED shape, larger than the bones it covers,
// with an ink outline of its own. It changes the silhouette (rule one of wardrobe.ts) and
// it carries its own colour, so it can never vanish into the figure.
//
// ── HOW A GARMENT IS BUILT ──────────────────────────────────────────────────
//
// A garment is a list of BANDS. A band runs from one point on the body to another, with
// a width and rounded ends, so it follows the figure through every pose for free: a
// skirt is three bands from the hips to the knees, and when he strides it flares with
// him. Points are joints of the rig, optionally offset in the TORSO's own frame (+dx is
// the way he faces, +dy is down the spine), so a toga's diagonal stays diagonal when he
// leans.
//
// Every band in a LAYER is drawn twice — once in ink, grown by the outline, then once
// in its fill — so bands that overlap share ONE outline instead of each ruling a seam
// across the cloth (the trick Silhouette.tsx uses for animals). Layer 0 is the body of
// the garment; layer 1 is drawn over it with its own outline — the drape, the fold, the
// sash — which is what makes a robe read as cloth rather than as a white bag.
//
// The painter is Stickman.tsx (as Views, never SVG — §17 rule 7); the contact sheet is
// scripts/sheet-garb.mjs, which draws through the same geometry in plain Node.

export type GJoint =
  | 'head' | 'shB' | 'pel' | 'shL' | 'shR' | 'elL' | 'elR' | 'wrL' | 'wrR'
  | 'hipL' | 'hipR' | 'kneeL' | 'kneeR' | 'ankL' | 'ankR' | 'kneeMid' | 'ankMid';

/** A point on the body: a joint, optionally offset in the torso's frame (rig units). */
export interface GPoint { j: GJoint; dx?: number; dy?: number }

export interface Band {
  a: GPoint;
  b: GPoint;
  /** Width across the band, rig units. */
  w: number;
  /** Fill colour. */
  fill: string;
  /** Corner radius; defaults to half the width (a capsule). */
  r?: number;
  /** How far the band runs past each end, rig units. */
  extA?: number;
  extB?: number;
  /**
   * 0: the garment's body (trunk, skirt, the NEAR leg's trouser). 1: drawn over it with its
   * own outline (a drape, a sash, a lapel). −1: on the FAR limbs, drawn with them, behind the
   * trunk (the far sleeve, the far trouser leg). 2: on the NEAR arm, drawn after it (the near
   * sleeve). Layers −1, 0 and 2 each share one outline among their bands.
   */
  layer?: -1 | 0 | 1 | 2;
  /** Drawn without an outline (a stripe printed on the cloth). */
  flat?: boolean;
}

/** Outline weight, rig units. The limbs are 11, so 2 reads as a drawn edge, not a stroke. */
export const GARB_LINE = 2;

/** As many bands as any garment may have — Stickman mounts a fixed number of slots (§17 rule 1). */
export const GARB_SLOTS = 16;

// ── the joints, off a Bundle ────────────────────────────────────────────────

type XF = any;
interface BundleLike {
  dir: number;
  pel: XF; shB: XF; head: XF; shLd: XF; shRd: XF;
  elL: XF; elR: XF; wrL: XF; wrR: XF;
  thighL: XF; thighR: XF; kneeL: XF; kneeR: XF; ankL: XF; ankR: XF;
}

function px(xf: XF): number { 'worklet'; return xf[0].translateX; }
function py(xf: XF): number { 'worklet'; return xf[1].translateY; }

function jointXY(B: BundleLike, j: GJoint): [number, number] {
  'worklet';
  switch (j) {
    case 'head': return [px(B.head), py(B.head)];
    case 'shB': return [px(B.shB), py(B.shB)];
    case 'pel': return [px(B.pel), py(B.pel)];
    case 'shL': return [px(B.shLd), py(B.shLd)];
    case 'shR': return [px(B.shRd), py(B.shRd)];
    case 'elL': return [px(B.elL), py(B.elL)];
    case 'elR': return [px(B.elR), py(B.elR)];
    case 'wrL': return [px(B.wrL), py(B.wrL)];
    case 'wrR': return [px(B.wrR), py(B.wrR)];
    case 'hipL': return [px(B.thighL), py(B.thighL)];
    case 'hipR': return [px(B.thighR), py(B.thighR)];
    case 'kneeL': return [px(B.kneeL), py(B.kneeL)];
    case 'kneeR': return [px(B.kneeR), py(B.kneeR)];
    case 'ankL': return [px(B.ankL), py(B.ankL)];
    case 'ankR': return [px(B.ankR), py(B.ankR)];
    case 'kneeMid': return [(px(B.kneeL) + px(B.kneeR)) / 2, (py(B.kneeL) + py(B.kneeR)) / 2];
    default: return [(px(B.ankL) + px(B.ankR)) / 2, (py(B.ankL) + py(B.ankR)) / 2];
  }
}

/**
 * Where a band sits this frame: centre, angle (radians) and its drawn length and width,
 * all in stage units. `grow` adds the outline (0 for the fill pass).
 */
export function bandAt(B: BundleLike, k: number, band: Band, grow: number):
  { cx: number; cy: number; ang: number; len: number; w: number } {
  'worklet';
  const [sx, sy] = jointXY(B, 'shB');
  const [qx, qy] = jointXY(B, 'pel');
  let vx = qx - sx; let vy = qy - sy;
  const vl = Math.hypot(vx, vy) || 1;
  vx /= vl; vy /= vl;                      // down the spine
  const dir = B.dir < 0 ? -1 : 1;
  const ux = vy * dir; const uy = -vx * dir; // the way he faces, across the spine

  const [ax0, ay0] = jointXY(B, band.a.j);
  const [bx0, by0] = jointXY(B, band.b.j);
  const adx = (band.a.dx || 0) * k; const ady = (band.a.dy || 0) * k;
  const bdx = (band.b.dx || 0) * k; const bdy = (band.b.dy || 0) * k;
  const ax = ax0 + adx * ux + ady * vx; const ay = ay0 + adx * uy + ady * vy;
  const bx = bx0 + bdx * ux + bdy * vx; const by = by0 + bdx * uy + bdy * vy;

  let dx = bx - ax; let dy = by - ay;
  const d = Math.hypot(dx, dy);
  if (d < 1e-6) { dx = 0; dy = 1; } else { dx /= d; dy /= d; }
  const eA = (band.extA || 0) * k + grow;
  const eB = (band.extB || 0) * k + grow;
  const len = d + eA + eB;
  // The centre of the extended band.
  const cx = ax - dx * eA + dx * len / 2;
  const cy = ay - dy * eA + dy * len / 2;
  return { cx, cy, ang: Math.atan2(dy, dx), len, w: band.w * k + 2 * grow };
}

// ── the garments ────────────────────────────────────────────────────────────
//
// Colours are the cloth's own (AR1: things are their own colours). Off-white rather
// than paper white, so a robe is a garment on the stage and not a hole in it.

export const CLOTH = {
  toga: '#F2EEE3',         // wool, bleached — the toga of a citizen
  togaShade: '#DCD5C3',    // the same cloth in a fold
  purple: '#5E2B6E',       // Tyrian purple: the stripe of a senator's son
  laurel: '#5F7F38',
  laurelLit: '#86A44C',
  tunicBrown: '#8B5E3C',   // undyed wool, worn
  tunicBrownShade: '#6E4A2F',
  sashRed: '#A8392C',
  wrapRed: '#B5402F',
  wrapOchre: '#C7943A',
  gold: '#C9A23A',
  steel: '#A7A9A6',
  leather: '#6A4426',
} as const;

/**
 * THE TOGA — Caesar's, and the robe the owner asked for by name.
 *
 * Built against references (Commons: the Augustus of Prima Porta's under-tunic, the
 * Ara Pacis togate men, the Arringatore): a long tunic to mid-calf, and over it the
 * toga — a great swag of wool that comes over the LEFT shoulder, falls in a curve
 * across the chest (the sinus) to the RIGHT hip, and hangs from the left arm in a
 * straight fall (the umbo and the lacinia). The right arm is free. The border of a
 * young noble's toga carries a purple stripe.
 */
const TOGA: Band[] = [
  // the body: chest, shoulders, skirt to mid-shin
  { a: { j: 'shB', dy: -2 }, b: { j: 'pel' }, w: 27, fill: CLOTH.toga, r: 10 },
  { a: { j: 'shL' }, b: { j: 'shR' }, w: 15, fill: CLOTH.toga, extA: 6, extB: 6 },
  { a: { j: 'pel', dy: -4 }, b: { j: 'kneeL' }, w: 22, fill: CLOTH.toga, extB: 12, r: 5 },
  { a: { j: 'pel', dy: -4 }, b: { j: 'kneeR' }, w: 22, fill: CLOTH.toga, extB: 12, r: 5 },
  { a: { j: 'pel', dy: -4 }, b: { j: 'kneeMid' }, w: 27, fill: CLOTH.toga, extB: 12, r: 5 },
  // the swag: over the back shoulder, across the chest, to the front hip
  { a: { j: 'shB', dx: -11, dy: -3 }, b: { j: 'pel', dx: 12, dy: 5 }, w: 12, fill: CLOTH.togaShade, layer: 1, extA: 2, extB: 3, r: 6 },
  // its purple border, along the lower edge of the swag
  { a: { j: 'shB', dx: -12, dy: 3 }, b: { j: 'pel', dx: 9, dy: 10 }, w: 2.6, fill: CLOTH.purple, layer: 1, flat: true },
  // one fold down the skirt, so it is wool and not a bag
  { a: { j: 'pel', dx: -4, dy: 8 }, b: { j: 'kneeMid', dx: -6, dy: 8 }, w: 2, fill: CLOTH.togaShade, layer: 1, flat: true },
];

/** A working tunic, belted: the pirates, the sailors, the soldiers in the ranks. */
export function tunic(fill: string, shade: string, belt: string): Band[] {
  return [
    { a: { j: 'shB', dy: -2 }, b: { j: 'pel' }, w: 24, fill, r: 8 },
    { a: { j: 'shL' }, b: { j: 'shR' }, w: 12, fill, extA: 5, extB: 5 },
    { a: { j: 'pel', dy: -3 }, b: { j: 'kneeL' }, w: 18, fill, extB: -4, r: 4 },
    { a: { j: 'pel', dy: -3 }, b: { j: 'kneeR' }, w: 18, fill, extB: -4, r: 4 },
    { a: { j: 'pel', dy: -3 }, b: { j: 'kneeMid' }, w: 22, fill, extB: -3, r: 4 },
    // the belt — a sash knotted at the hip, its end hanging
    { a: { j: 'pel', dx: -12, dy: -4 }, b: { j: 'pel', dx: 12, dy: -4 }, w: 5, fill: belt, layer: 1, r: 2 },
    { a: { j: 'pel', dx: 9, dy: -3 }, b: { j: 'pel', dx: 12, dy: 10 }, w: 4, fill: belt, layer: 1 },
    // one fold, so it is cloth
    { a: { j: 'pel', dx: -3, dy: 2 }, b: { j: 'kneeMid', dx: -3, dy: -6 }, w: 2.2, fill: shade, layer: 1, flat: true },
  ];
}

export interface Garb {
  id: string;
  label: string;
  /** On the body. */
  bands: Band[];
}

export const GARBS: Record<string, Garb> = {
  toga: { id: 'toga', label: 'toga with the purple stripe', bands: TOGA },
  pirateCaptain: { id: 'pirateCaptain', label: 'pirate captain: red sash on brown', bands: tunic(CLOTH.tunicBrown, CLOTH.tunicBrownShade, CLOTH.sashRed) },
  pirate: { id: 'pirate', label: 'pirate: ochre sash on brown', bands: tunic(CLOTH.tunicBrownShade, CLOTH.leather, CLOTH.wrapOchre) },
};

// ── what goes on the head and in the hand, in colour ─────────────────────────
//
// The same shape as wardrobe.ts's Piece (and Stickman paints it the same way), with a
// `fill`: a coloured piece is drawn with an ink edge, so it reads on paper and on the
// black head alike.

export interface HeadPiece {
  at: 'head' | 'neck' | 'pelvis' | 'handR' | 'handL';
  x: number; y: number; w: number; h: number;
  r?: number; rot?: number; ring?: number; paper?: boolean;
  fill?: string;
}

/**
 * A LAUREL WREATH, as the coins and busts draw it from the side: a branch crossing the
 * head from the brow to the back, just above where the ear would be, its leaves
 * standing up and forward along it. Two staggered rows in two greens, so it reads as a
 * branch and not a comb; the purple tie hangs at the back. Leaves carry an ink edge, so
 * they read on the black head and on the paper alike.
 */
export function laurel(): HeadPiece[] {
  const out: HeadPiece[] = [];
  const n = 7;
  for (let i = 0; i < n; i += 1) {
    const t = i / (n - 1);
    const x = 21 - t * 43; const y = 1 - t * 8;
    out.push({ at: 'head', x, y: y - 3, w: 11, h: 4.6, r: 2.3, rot: -38 - t * 10, fill: CLOTH.laurel });
    if (i < n - 1) out.push({ at: 'head', x: x - 3, y: y + 1, w: 10, h: 4.2, r: 2.1, rot: 28 - t * 6, fill: CLOTH.laurelLit });
  }
  out.push({ at: 'head', x: -22, y: -6, w: 3, h: 13, r: 1.5, rot: 20, fill: CLOTH.purple });
  return out;
}

/** A cloth wrap knotted at the back of the head, its tails hanging, and a gold hoop. */
export function headWrap(fill: string, earring: boolean): HeadPiece[] {
  const p: HeadPiece[] = [
    { at: 'head', x: -1, y: -11, w: 43, h: 20, r: 10, fill },
    { at: 'head', x: -22, y: -7, w: 9, h: 9, r: 4.5, fill },
    { at: 'head', x: -26, y: 4, w: 5, h: 15, r: 2.5, rot: 22, fill },
    { at: 'head', x: -22, y: 5, w: 5, h: 13, r: 2.5, rot: -6, fill },
  ];
  if (earring) p.push({ at: 'head', x: 8, y: 21, w: 9, h: 9, ring: 1.8, fill: CLOTH.gold });
  return p;
}

/** A curved Cilician blade, held point-up. */
const SICA: HeadPiece[] = [
  { at: 'handR', x: 3, y: -16, w: 4, h: 28, r: 2, rot: 12, fill: CLOTH.steel },
  { at: 'handR', x: 0, y: -2, w: 12, h: 3.5, r: 1.5, fill: CLOTH.leather },
];

export interface Outfit {
  id: string;
  label: string;
  garb: Garb | null;
  head: HeadPiece[];
}

export const OUTFITS: Record<string, Outfit> = {
  caesar: { id: 'caesar', label: 'Caesar — toga and laurel', garb: GARBS.toga, head: laurel() },
  caesarYoung: { id: 'caesarYoung', label: 'young Caesar — toga, bare head', garb: GARBS.toga, head: [] },
  pirateCaptain: { id: 'pirateCaptain', label: 'pirate captain', garb: GARBS.pirateCaptain, head: [...headWrap(CLOTH.wrapRed, true), ...SICA] },
  pirate: { id: 'pirate', label: 'pirate', garb: GARBS.pirate, head: headWrap(CLOTH.wrapOchre, false) },
};

// ── UNIT 2, THE OTHER SIX STORIES (2026-10-09) ──────────────────────────────
//
// Built from PARTS, so a cast reads at a glance and a new role is a line, not a drawing:
// trousers on both legs (the far leg behind the trunk, layer −1), a coat or jacket on the
// trunk with its skirt cut to the hip or the knee, sleeves on both arms (the near one over
// the arm, layer 2), and a stripe or two on top (a shirt front, a tie, a sash).

export const WEAR = {
  labCoat: '#F3F2EC', labCoatShade: '#DAD8CF',
  greyCoat: '#9EA3A3',
  suitCharcoal: '#5C6168', suitNavy: '#3D4D6E', tweed: '#7A6247',
  trouserGrey: '#55595C', trouserDark: '#4A4D52', khaki: '#BFA77A', denim: '#4A6283',
  shirtWhite: '#F4F4F0', shirtBlue: '#9DB6D3', tieRed: '#8E2F2B', tieBlue: '#2F4A73',
  cardigan: '#8C7A5B', sweaterGreen: '#5C7A5A', tshirt: '#C9553E',
  buff: '#C49A62', buffShade: '#A07C4C', sashRed: '#A33A30', breeches: '#5A4632',
  doubletBlack: '#4A4650', ruff: '#F5F3EC', capotain: '#252428',
  smock: '#C8B98F', smockShade: '#A89A72', knitNavy: '#2F3D57', knitRed: '#9C3B32', knitCream: '#E7DFCB',
  plume: '#F2EFE6', hatBrown: '#5B4330', peak: '#1E1F22', glass: '#D9ECEF', agar: '#E8D9A0',
} as const;

export function trousers(fill: string): Band[] {
  return [
    { a: { j: 'hipL' }, b: { j: 'kneeL' }, w: 14, fill, layer: -1, extA: 2, r: 5 },
    { a: { j: 'kneeL' }, b: { j: 'ankL' }, w: 12.5, fill, layer: -1, extB: -2, r: 5 },
    { a: { j: 'pel', dy: -3 }, b: { j: 'pel', dy: 6 }, w: 22, fill, r: 7 },
    { a: { j: 'hipR' }, b: { j: 'kneeR' }, w: 14, fill, extA: 2, r: 5 },
    { a: { j: 'kneeR' }, b: { j: 'ankR' }, w: 12.5, fill, extB: -2, r: 5 },
  ];
}
/** Knee breeches: to the knee only, the stockinged shin left bare. */
export function breeches(fill: string): Band[] {
  return [
    { a: { j: 'hipL' }, b: { j: 'kneeL' }, w: 15, fill, layer: -1, extA: 2, extB: 2, r: 5 },
    { a: { j: 'pel', dy: -3 }, b: { j: 'pel', dy: 6 }, w: 23, fill, r: 7 },
    { a: { j: 'hipR' }, b: { j: 'kneeR' }, w: 15, fill, extA: 2, extB: 2, r: 5 },
  ];
}
export function sleeves(fill: string, long = true): Band[] {
  const s: Band[] = [
    { a: { j: 'shL' }, b: { j: 'elL' }, w: 12.5, fill, layer: -1, extA: 3, r: 5 },
    { a: { j: 'shR' }, b: { j: 'elR' }, w: 12.5, fill, layer: 2, extA: 3, r: 5 },
  ];
  if (long) s.push(
    { a: { j: 'elL' }, b: { j: 'wrL' }, w: 11.5, fill, layer: -1, extB: -3, r: 5 },
    { a: { j: 'elR' }, b: { j: 'wrR' }, w: 11.5, fill, layer: 2, extB: -3, r: 5 },
  );
  return s;
}
/** A coat on the trunk; its skirt stops at the belt, the hip, mid-thigh or the knee. */
export function coat(fill: string, skirt: 'none' | 'hip' | 'thigh' | 'knee'): Band[] {
  const b: Band[] = [
    { a: { j: 'shB', dy: -2 }, b: { j: 'pel', dy: 2 }, w: 25, fill, r: 9 },
    { a: { j: 'shL' }, b: { j: 'shR' }, w: 13, fill, extA: 5, extB: 5 },
  ];
  if (skirt === 'hip') b.push({ a: { j: 'pel', dy: -4 }, b: { j: 'pel', dy: 9 }, w: 26, fill, r: 6 });
  if (skirt === 'thigh' || skirt === 'knee') {
    const e = skirt === 'knee' ? 3 : -7;
    b.push(
      { a: { j: 'pel', dy: -4 }, b: { j: 'kneeL' }, w: 19, fill, extB: e, r: 4 },
      { a: { j: 'pel', dy: -4 }, b: { j: 'kneeR' }, w: 19, fill, extB: e, r: 4 },
      { a: { j: 'pel', dy: -4 }, b: { j: 'kneeMid' }, w: 24, fill, extB: e, r: 4 },
    );
  }
  return b;
}
/** A stripe printed down the front of the trunk: a shirt front, a tie, a placket. */
export function front(fill: string, w: number, dx = 8, flat = true): Band {
  return { a: { j: 'shB', dx, dy: 1 }, b: { j: 'pel', dx, dy: -3 }, w, fill, layer: 1, flat };
}
/** The shirt and tie showing down the front of a jacket. */
export function shirtAndTie(shirt: string, tie: string): Band[] {
  return [front(shirt, 6, 8.5), front(tie, 2.4, 9)];
}

// head and hand pieces
const PETRI: HeadPiece[] = [
  { at: 'handR', x: 5, y: -3, w: 15, h: 4, r: 1.5, fill: WEAR.glass },
  { at: 'handR', x: 5, y: -6, w: 11, h: 2.5, r: 1, fill: WEAR.agar },
];
const CLIPBOARD: HeadPiece[] = [
  { at: 'handL', x: 4, y: -5, w: 13, h: 17, r: 1.5, fill: '#B98B55' },
  { at: 'handL', x: 4, y: -4, w: 10, h: 12, r: 1, fill: '#F4F2EA' },
];
/** A tall black hat of the Dutch Republic (a capotain), with a band. */
const CAPOTAIN: HeadPiece[] = [
  { at: 'head', x: 0, y: -14, w: 50, h: 4.5, r: 2, fill: WEAR.capotain },
  { at: 'head', x: 0, y: -28, w: 28, h: 24, r: 5, fill: WEAR.capotain },
  { at: 'head', x: 0, y: -19, w: 29, h: 3.5, r: 1, fill: '#6B5A3A' },
];
/**
 * A white ruff. There is no neck (the head overlaps the shoulders), so it is cloth on the
 * BODY, drawn before the head: the head covers its middle and it shows as white wings either
 * side of the chin, which is how a ruff reads from the side.
 */
const RUFF: Band[] = [{ a: { j: 'shB', dx: -17, dy: -3 }, b: { j: 'shB', dx: 17, dy: -3 }, w: 10, fill: WEAR.ruff, r: 5 }];
/** A broad soldier's hat with a white plume, 1619. */
const PLUMED: HeadPiece[] = [
  { at: 'head', x: 0, y: -14, w: 62, h: 5, r: 2.5, rot: -6, fill: WEAR.hatBrown },
  { at: 'head', x: 0, y: -23, w: 28, h: 14, r: 5, fill: WEAR.hatBrown },
  { at: 'head', x: -13, y: -24, w: 22, h: 7, r: 3.5, rot: -18, fill: WEAR.plume },
];
/** A knitted cap pulled over the skull, rolled at the brim. */
export function knitCap(fill: string): HeadPiece[] {
  return [
    { at: 'head', x: 0, y: -13, w: 41, h: 18, r: 9, fill },
    { at: 'head', x: 0, y: -7, w: 42, h: 5, r: 2.5, fill },
    { at: 'head', x: 0, y: -24, w: 8, h: 7, r: 3.5, fill },
  ];
}
/** A ship's officer's peaked cap. */
const PEAKED: HeadPiece[] = [
  { at: 'head', x: 0, y: -18, w: 36, h: 11, r: 4, fill: WEAR.suitNavy },
  { at: 'head', x: 15, y: -12, w: 16, h: 3.5, r: 1.6, rot: 8, fill: WEAR.peak },
  { at: 'head', x: 0, y: -13.5, w: 34, h: 2.5, r: 1, fill: CLOTH.gold },
];

export function dressed(id: string, label: string, bands: Band[], head: HeadPiece[] = []): Outfit {
  return { id, label, garb: { id, label, bands }, head };
}

export const UNIT2_OUTFITS: Record<string, Outfit> = {
  // SCIENCE — Fleming, St Mary's Hospital, London, 1928
  fleming: dressed('fleming', 'Fleming: white lab coat, a Petri dish', [...trousers(WEAR.trouserGrey), ...coat(WEAR.labCoat, 'knee'), ...sleeves(WEAR.labCoat), ...shirtAndTie(WEAR.shirtWhite, WEAR.tieRed)], PETRI),
  labColleague: dressed('labColleague', 'a lab colleague: lab coat', [...trousers(WEAR.trouserDark), ...coat(WEAR.labCoat, 'knee'), ...sleeves(WEAR.labCoat), ...shirtAndTie(WEAR.shirtWhite, WEAR.tieBlue)]),
  // PSYCHOLOGY — Milgram, Yale, 1961
  milgram: dressed('milgram', 'Milgram: charcoal suit, clipboard', [...trousers(WEAR.suitCharcoal), ...coat(WEAR.suitCharcoal, 'hip'), ...sleeves(WEAR.suitCharcoal), ...shirtAndTie(WEAR.shirtWhite, WEAR.tieBlue)], CLIPBOARD),
  experimenter: dressed('experimenter', 'the experimenter: grey lab coat', [...trousers(WEAR.trouserDark), ...coat(WEAR.greyCoat, 'knee'), ...sleeves(WEAR.greyCoat), ...shirtAndTie(WEAR.shirtWhite, WEAR.peak)]),
  volunteer: dressed('volunteer', 'a volunteer: tweed jacket', [...trousers(WEAR.trouserGrey), ...coat(WEAR.tweed, 'hip'), ...sleeves(WEAR.tweed), ...shirtAndTie(WEAR.shirtBlue, WEAR.tieRed)]),
  learner: dressed('learner', 'the learner: cardigan', [...trousers(WEAR.khaki), ...coat(WEAR.cardigan, 'hip'), ...sleeves(WEAR.cardigan), front(WEAR.shirtWhite, 5)]),
  // PHILOSOPHY — Descartes, Bavaria, 1619
  descartes: dressed('descartes', 'Descartes: buff soldier coat, red sash, plumed hat', [...breeches(WEAR.breeches), ...coat(WEAR.buff, 'thigh'), ...sleeves(WEAR.buff), { a: { j: 'shB', dx: 9, dy: -2 }, b: { j: 'pel', dx: -10, dy: 4 }, w: 5, fill: WEAR.sashRed, layer: 1, r: 2 }], PLUMED),
  soldier: dressed('soldier', 'a fellow soldier: dark buff coat', [...breeches(WEAR.breeches), ...coat(WEAR.buffShade, 'thigh'), ...sleeves(WEAR.buffShade)]),
  // ECONOMICS — Haarlem, 1636
  burgher: dressed('burgher', 'a Dutch burgher: black doublet, ruff, tall hat', [...breeches(WEAR.doubletBlack), ...coat(WEAR.doubletBlack, 'hip'), ...sleeves(WEAR.doubletBlack), front('#5A5560', 2, 9), ...RUFF], CAPOTAIN),
  burgherBare: dressed('burgherBare', 'a Dutch burgher: plum doublet and ruff', [...breeches('#3C3550'), ...coat('#3C3550', 'hip'), ...sleeves('#3C3550'), ...RUFF]),
  // PERSONAL GROWTH — the Endurance, 1914–16
  shackleton: dressed('shackleton', 'Shackleton: gabardine smock, navy knitted cap', [...trousers(WEAR.trouserDark), ...coat(WEAR.smock, 'thigh'), ...sleeves(WEAR.smock), front(WEAR.smockShade, 3, 8)], knitCap(WEAR.knitNavy)),
  explorer: dressed('explorer', 'a crewman: cream jumper, red cap', [...trousers(WEAR.trouserGrey), ...coat(WEAR.knitCream, 'hip'), ...sleeves(WEAR.knitCream)], knitCap(WEAR.knitRed)),
  captain: dressed('captain', 'the ship captain: navy jacket, peaked cap', [...trousers(WEAR.suitNavy), ...coat(WEAR.suitNavy, 'hip'), ...sleeves(WEAR.suitNavy), ...shirtAndTie(WEAR.shirtWhite, WEAR.peak)], PEAKED),
  // BUSINESS — Amazon, 1994
  bezos: dressed('bezos', 'Bezos, 1994: blue oxford shirt, khakis', [...trousers(WEAR.khaki), ...coat(WEAR.shirtBlue, 'none'), ...sleeves(WEAR.shirtBlue), front('#86A0BF', 1.6, 9)]),
  bossSuit: dressed('bossSuit', 'a Wall Street boss: navy suit', [...trousers(WEAR.suitNavy), ...coat(WEAR.suitNavy, 'hip'), ...sleeves(WEAR.suitNavy), ...shirtAndTie(WEAR.shirtWhite, WEAR.tieRed)]),
  sweater: dressed('sweater', 'green sweater and jeans', [...trousers(WEAR.denim), ...coat(WEAR.sweaterGreen, 'hip'), ...sleeves(WEAR.sweaterGreen)]),
  tshirt: dressed('tshirt', 't-shirt and jeans', [...trousers(WEAR.denim), ...coat(WEAR.tshirt, 'hip'), ...sleeves(WEAR.tshirt, false)]),
};

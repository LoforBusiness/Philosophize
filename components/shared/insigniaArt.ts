// ─────────────────────────────────────────────────────────────────────────────
// THE CREST — what every rank pin and every badge is drawn as.
//
// The owner, on the versions before this one: "really flat, really boring, and
// you can just tell it's all AI drawn … it looks very dull, not gamified … it
// needs to look like real good designs, like from other education apps that
// have badges." Research first (179 reference images, from Duolingo's leagues
// and achievements, Brilliant, Khan Academy, Valorant, League of Legends, Clash,
// Hearthstone, Rocket League and PlayStation), then three directions drawn with
// the app's real marks, and the owner picked the GAME CREST: the Duolingo /
// Brilliant / Clash construction.
//
// ── WHAT MADE THE OLD ONES FLAT, IN ONE SENTENCE EACH ───────────────────────
//
// One gradient across a shape reads as a sticker; a professional badge is FLAT
// TONES arranged as an object. A hairline edge reads as a diagram; a badge has a
// thick rim a step off its face. Nothing had thickness; a badge has a LIP, the
// same shape one shade darker sitting just below it. The mark was a 1.7px line
// icon, which is the single loudest "generic icon set" tell there is; a badge's
// emblem is about half its width and heavy.
//
// ── THE CONSTRUCTION, BOTTOM TO TOP ─────────────────────────────────────────
//
//   shadow   the whole object, offset down-right, ink at 12% — no blur (§19: an
//            <Svg> is a bitmap the size of its box, and blur is the costly part)
//   outline  one steady dark line round the lip and the rim together — the
//            order's own rim tone pushed toward black, never a flat grey
//   lip      the silhouette again, 4.4 units lower, in the order's rim tone:
//            the object's thickness (Duolingo's is 4 of 90)
//   rim      the silhouette in the lifted tone, its lower-right half one step
//            down — the lamp is top-left and never moves (§19)
//   face     inset 8, in the shaded tone, with the face again 2.6 lower in the
//            body tone over it: a recess whose top edge is in shadow
//   glare    two stripes at 45° across the face, white at 13% and 10%
//   mark     white, heavy, with the rim tone as its shadow down-right
//
// Every tone is FLAT. There is no gradient anywhere in this file, which is the
// point, and it is also why nothing here can light differently on a phone than
// on the contact sheet.
//
// ── ZERO IMPORTS, for the reason rig.ts and tone.ts have zero imports ───────
//
// scripts/sheet-ranks.mjs and scripts/sheet-badges.mjs draw all 118 in plain
// Node through the same functions RankSeal and BadgeMedal call, and
// scripts/check-ui.mjs and scripts/validate-badges.mjs measure the same
// geometry. A material is passed IN (constants/insignia.ts), never imported.
//
// Geometry is a 100×100 box, y down. Output is absolute M / L / Z only.
// ─────────────────────────────────────────────────────────────────────────────

export type Pt = [number, number];

/** One thing to draw. `clip` draws its children inside `d`. */
export type Node =
  | { k: 'fill'; d: string; c: string; o?: number }
  | { k: 'line'; d: string; c: string; w: number; o?: number }
  | { k: 'clip'; d: string; kids: Node[] };

/** A material, exactly the shape constants/insignia.ts declares. */
export interface Material {
  lit: string; base: string; shade: string; rim: string; on: string; rule: string;
}

/** The flat tones a crest is painted in, derived from one material. */
export interface Tones {
  glow: string; hi: string; lit: string; base: string; shade: string; rim: string;
  line: string; mark: string; markShadow: string;
  /** false for a locked insignia: no glare, no sparkle, no shadow. */
  struck: boolean;
}

/** Where the emblem goes, in box units. */
export interface Mark {
  cx: number; cy: number; size: number;
  /** stroke width inside the glyph's own 32-unit box */
  weight: number;
  color: string; shadow: string;
  /** shadow offset, in box units */
  dx: number; dy: number;
}

// ── colour ────────────────────────────────────────────────────────────────

const hexIn = (h: string): number[] => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const hexOut = (c: number[]) =>
  '#' + c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('').toUpperCase();

export function mix(a: string, b: string, t: number): string {
  const x = hexIn(a), y = hexIn(b);
  return hexOut(x.map((v, i) => v + (y[i] - v) * t));
}

function toHsl(c: number[]): number[] {
  const [r, g, b] = c.map((v) => v / 255);
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  const l = (mx + mn) / 2;
  if (mx === mn) return [0, 0, l];
  const d = mx - mn;
  const s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
  const h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h / 6, s, l];
}
function fromHsl([h, s, l]: number[]): number[] {
  if (s === 0) return [l * 255, l * 255, l * 255];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const f = (t: number) => {
    const u = (t + 1) % 1;
    if (u < 1 / 6) return p + (q - p) * 6 * u;
    if (u < 1 / 2) return q;
    if (u < 2 / 3) return p + (q - p) * (2 / 3 - u) * 6;
    return p;
  };
  return [f(h + 1 / 3) * 255, f(h) * 255, f(h - 1 / 3) * 255];
}

/**
 * LIGHTER, KEEPING THE HUE. Mixing toward white is the obvious way to get a
 * lit tone and it WASHES a colour out — CLAUDE.md records jade going mint and
 * crimson going pink that way. Raising HSL lightness keeps the colour a colour.
 */
export function lift(h: string, dl: number, ds = 0): string {
  const [a, s, l] = toHsl(hexIn(h));
  return hexOut(fromHsl([a, Math.max(0, Math.min(1, s + ds)), Math.max(0, Math.min(1, l + dl))]));
}

export function tonesOf(m: Material): Tones {
  return {
    glow: lift(m.lit, 0.30, -0.05),
    hi: lift(m.lit, 0.16, 0.02),
    lit: m.lit,
    base: m.base,
    shade: m.shade,
    rim: m.rim,
    // The outline is the order's own rim pushed toward black — never a flat grey,
    // which the research names as the cheapest-looking outline there is.
    line: mix(m.rim, '#0B0B0B', 0.45),
    mark: m.on,
    markShadow: m.rim,
    struck: true,
  };
}

/**
 * LOCKED KEEPS ITS SHAPE AND LOSES ITS MATERIAL — the rule RankSeal has always
 * followed. A cool slate off the warm paper ramp (tone.ts `GHOST`), flat, with
 * no glare, no sparkle and no shadow: "the same thing, dimmer" reads as a
 * rendering fault, where unlit against lit reads as the reward.
 */
export const LOCKED: Tones = {
  glow: '#F7F8FA', hi: '#F2F3F5', lit: '#EBEDF0', base: '#E4E7EB', shade: '#D6DAE0', rim: '#C9CED6',
  line: '#AAB1BC', mark: '#AAB1BC', markShadow: '#E4E7EB', struck: false,
};

/**
 * NO ORDER AT ALL — a pin with no rank behind it. Printed on the app's own
 * paper with an ink edge and an ink mark, the way every unstruck thing here is.
 */
export const PLAIN: Tones = {
  glow: '#FFFFFF', hi: '#FFFFFF', lit: '#F2EFE8', base: '#FAFAF7', shade: '#E4DFD4', rim: '#C6C0B2',
  line: '#1A1A1A', mark: '#1A1A1A', markShadow: '#E4DFD4', struck: true,
};

// ── geometry ──────────────────────────────────────────────────────────────

const r2 = (v: number) => Math.round(v * 100) / 100;

export function pathOf(pts: Pt[]): string {
  return 'M' + pts.map(([x, y]) => `${r2(x)} ${r2(y)}`).join(' L') + ' Z';
}

export function circle(r: number, cx = 50, cy = 50, n = 48): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return out;
}

export function poly(r: number, sides: number, rot: number, cx = 50, cy = 50): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < sides; i++) {
    const a = rot + (i * 2 * Math.PI) / sides;
    out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return out;
}

/** Every corner rounded by a quadratic that starts `k` along each edge. */
export function rounded(pts: Pt[], k: number, steps = 6): Pt[] {
  const out: Pt[] = [];
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const a = pts[(i - 1 + n) % n], v = pts[i], b = pts[(i + 1) % n];
    const la = Math.hypot(v[0] - a[0], v[1] - a[1]) || 1;
    const lb = Math.hypot(b[0] - v[0], b[1] - v[1]) || 1;
    const ka = Math.min(k, la * 0.45), kb = Math.min(k, lb * 0.45);
    const p0: Pt = [v[0] + ((a[0] - v[0]) * ka) / la, v[1] + ((a[1] - v[1]) * ka) / la];
    const p2: Pt = [v[0] + ((b[0] - v[0]) * kb) / lb, v[1] + ((b[1] - v[1]) * kb) / lb];
    for (let s = 0; s <= steps; s++) {
      const t = s / steps, u = 1 - t;
      out.push([
        u * u * p0[0] + 2 * u * t * v[0] + t * t * p2[0],
        u * u * p0[1] + 2 * u * t * v[1] + t * t * p2[1],
      ]);
    }
  }
  return out;
}

function cubicTo(out: Pt[], p0: Pt, p1: Pt, p2: Pt, p3: Pt, n: number) {
  for (let i = 1; i <= n; i++) {
    const t = i / n, u = 1 - t;
    out.push([
      u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
      u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
    ]);
  }
}

/** A heater shield: flat top with rounded corners, sides curving to a point. */
export function shield(w: number, top: number, bot: number, cx = 50): Pt[] {
  const x0 = cx - w / 2, x1 = cx + w / 2, sh = top + (bot - top) * 0.42, k = 9, steps = 6;
  const out: Pt[] = [[x0, sh]];
  const corner = (p0: Pt, v: Pt, p2: Pt) => {
    for (let s = 0; s <= steps; s++) {
      const t = s / steps, u = 1 - t;
      out.push([u * u * p0[0] + 2 * u * t * v[0] + t * t * p2[0], u * u * p0[1] + 2 * u * t * v[1] + t * t * p2[1]]);
    }
  };
  corner([x0, top + k], [x0, top], [x0 + k, top]);
  corner([x1 - k, top], [x1, top], [x1, top + k]);
  out.push([x1, sh]);
  cubicTo(out, [x1, sh], [x1, sh + (bot - sh) * 0.55], [cx + w * 0.18, bot - 6], [cx, bot], 14);
  cubicTo(out, [cx, bot], [cx - w * 0.18, bot - 6], [x0, sh + (bot - sh) * 0.55], [x0, sh], 14);
  out.pop();
  return out;
}

/** A standing stone: a round arch on a block with rounded feet. */
export function stele(w: number, top: number, bot: number, cx = 50): Pt[] {
  const x0 = cx - w / 2, x1 = cx + w / 2, rr = w / 2, cy = top + rr;
  const out: Pt[] = [];
  for (let i = 0; i <= 24; i++) {
    const a = Math.PI + (i / 24) * Math.PI;
    out.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]);
  }
  const foot = rounded([[x1, cy], [x1, bot], [x0, bot], [x0, cy]], 7, 5);
  // the two bottom corners only (indices 7..20 of a 4-corner rounded run)
  for (const p of foot.slice(7, 21)) out.push(p);
  return out;
}

/** A swallow-tailed flag. */
export function pennant(w: number, top: number, bot: number, notch: number, cx = 50): Pt[] {
  const x0 = cx - w / 2, x1 = cx + w / 2;
  return rounded([[x0, top], [x1, top], [x1, bot], [cx, bot - notch], [x0, bot]], 5, 4);
}

/** A book label with its lower corners cut. */
export function exlibris(w: number, top: number, bot: number, cut: number, cx = 50): Pt[] {
  const x0 = cx - w / 2, x1 = cx + w / 2;
  return rounded([[x0, top], [x1, top], [x1, bot - cut], [x1 - cut, bot], [x0 + cut, bot], [x0, bot - cut]], 4, 3);
}

/** An n-point star with `inner` as the valley radius. */
export function star(cx: number, cy: number, r: number, inner: number, n: number, rot = -Math.PI / 2): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < n * 2; i++) {
    const a = rot + (i * Math.PI) / n;
    const rr = i % 2 ? inner : r;
    out.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]);
  }
  return out;
}

export function ellipse(cx: number, cy: number, rx: number, ry: number, rotDeg: number, n = 20): Pt[] {
  const c = Math.cos((rotDeg * Math.PI) / 180), s = Math.sin((rotDeg * Math.PI) / 180);
  const out: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i * 2 * Math.PI) / n;
    const x = rx * Math.cos(a), y = ry * Math.sin(a);
    out.push([cx + x * c - y * s, cy + x * s + y * c]);
  }
  return out;
}

const signedArea = (pts: Pt[]) => {
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i], q = pts[(i + 1) % pts.length];
    a += p[0] * q[1] - q[0] * p[1];
  }
  return a / 2;
};

/**
 * Every vertex moved `d` inward along its miter (a negative `d` grows it). The
 * miter is capped so a sharp corner cannot shoot a spike across the shape.
 */
export function inset(pts: Pt[], d: number): Pt[] {
  const n = pts.length, sgn = signedArea(pts) > 0 ? 1 : -1;
  const out: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = pts[(i - 1 + n) % n], v = pts[i], b = pts[(i + 1) % n];
    const e1 = [v[0] - a[0], v[1] - a[1]], e2 = [b[0] - v[0], b[1] - v[1]];
    const l1 = Math.hypot(e1[0], e1[1]) || 1, l2 = Math.hypot(e2[0], e2[1]) || 1;
    const n1 = [(-e1[1] / l1) * sgn, (e1[0] / l1) * sgn];
    const n2 = [(-e2[1] / l2) * sgn, (e2[0] / l2) * sgn];
    let mx = n1[0] + n2[0], my = n1[1] + n2[1];
    const ml = Math.hypot(mx, my) || 1;
    mx /= ml; my /= ml;
    const cos = Math.max(0.35, mx * n1[0] + my * n1[1]);
    out.push([v[0] + (mx * d) / cos, v[1] + (my * d) / cos]);
  }
  return out;
}

export const shift = (pts: Pt[], dx: number, dy: number): Pt[] => pts.map(([x, y]) => [x + dx, y + dy]);
export const scaleAbout = (pts: Pt[], k: number, cx = 50, cy = 50): Pt[] =>
  pts.map(([x, y]) => [cx + (x - cx) * k, cy + (y - cy) * k]);

export function perimeterOf(pts: Pt[]): number {
  let p = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    p += Math.hypot(b[0] - a[0], b[1] - a[1]);
  }
  return p;
}

/** The farthest any point gets from (cx, cy). */
export function reachOf(pts: Pt[], cx = 50, cy = 50): number {
  return pts.reduce((m, [x, y]) => Math.max(m, Math.hypot(x - cx, y - cy)), 0);
}

export function insidePoly(pts: Pt[], x: number, y: number): boolean {
  let hit = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i], [xj, yj] = pts[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

export function edgeDistance(pts: Pt[], x: number, y: number): number {
  let best = Infinity;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [x1, y1] = pts[j], [x2, y2] = pts[i];
    const dx = x2 - x1, dy = y2 - y1;
    const t = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy || 1)));
    best = Math.min(best, Math.hypot(x - (x1 + t * dx), y - (y1 + t * dy)));
  }
  return best;
}

/** Rotate a ring so it starts at its topmost point — where a progress arc opens. */
export function fromTop(pts: Pt[], cx = 50): Pt[] {
  let best = 0, score = Infinity;
  pts.forEach(([x, y], i) => {
    const s = y * 3 + Math.abs(x - cx);
    if (s < score) { score = s; best = i; }
  });
  return pts.slice(best).concat(pts.slice(0, best));
}

// ── the crest itself ──────────────────────────────────────────────────────

/** How far the face sits inside the rim, and how deep the lip is. */
export const RIM = 8;
export const LIP = 4.4;
export const OUTLINE = 3.6;

/** Everything below the upper-left of the line x + y = cx + cy. */
const lowerRight = (cx: number, cy: number) => {
  const c = cx + cy;
  return `M${c + 60} -60 L${c + 60} ${c + 60} L-60 ${c + 60} Z`;
};

/** Two stripes at 45° across the upper-left of whatever they are clipped to. */
function glare(cx: number, cy: number): Node[] {
  const c = cx + cy;
  const band = (a: number, b: number) => `M-60 ${c + a + 60} L${c + a + 60} -60 L${c + b + 60} -60 L-60 ${c + b + 60} Z`;
  return [
    { k: 'fill', d: band(-42, -30), c: '#FFFFFF', o: 0.13 },
    { k: 'fill', d: band(-22, -18), c: '#FFFFFF', o: 0.10 },
  ];
}

/**
 * The crest body: outline, lip, rim, recessed face, glare. `cx, cy` is the
 * object's own centre, which the lamp's split and the glare are measured from.
 */
export function crest(sil: Pt[], t: Tones, cx: number, cy: number, rim = RIM, lip = LIP): Node[] {
  const face = inset(sil, rim);
  const under = shift(sil, 0, lip);
  const out: Node[] = [];
  if (t.struck) out.push({ k: 'fill', d: pathOf(shift(sil, 2, 6.5)), c: '#1A1A1A', o: 0.12 });
  out.push({ k: 'line', d: pathOf(under), c: t.line, w: OUTLINE });
  out.push({ k: 'line', d: pathOf(sil), c: t.line, w: OUTLINE });
  out.push({ k: 'fill', d: pathOf(under), c: t.rim });
  out.push({ k: 'fill', d: pathOf(sil), c: t.hi });
  out.push({ k: 'clip', d: pathOf(sil), kids: [{ k: 'fill', d: lowerRight(cx, cy), c: t.lit }] });
  out.push({ k: 'fill', d: pathOf(face), c: t.shade });
  out.push({
    k: 'clip', d: pathOf(face), kids: [
      { k: 'fill', d: pathOf(shift(face, 0, 2.6)), c: t.base },
      ...(t.struck ? glare(cx, cy) : []),
    ],
  });
  return out;
}

/** A thin light line inside the face — the first thing a rung adds. */
export function innerRule(sil: Pt[], t: Tones, at: number): Node {
  return { k: 'line', d: pathOf(inset(sil, at)), c: t.struck ? t.glow : t.line, w: 1.2, o: t.struck ? 0.75 : 0.6 };
}

/**
 * A four-point glint, white inside the order's own dark line. The line is not
 * decoration: a glint drawn past the object's edge is sitting on PAPER, and a
 * bare white star on cream is the trap this app has walked into three times
 * (check-ui §4d). Outlined, it reads on the metal and on the page alike.
 */
export function sparkle(cx: number, cy: number, r: number, t: Tones): Node[] {
  const p = pathOf(star(cx, cy, r, r * 0.22, 4));
  return [{ k: 'line', d: p, c: t.line, w: 1.6 }, { k: 'fill', d: p, c: '#FFFFFF' }];
}

/** A small cut stone: lit and shaded facets, a bright table. */
export function gem(cx: number, cy: number, r: number, t: Tones): Node[] {
  const o = poly(r, 4, -Math.PI / 2, cx, cy);
  const tri = (a: Pt, b: Pt): string => pathOf([[cx, cy], a, b]);
  const N: Pt = [cx, cy - r], E: Pt = [cx + r, cy], S: Pt = [cx, cy + r], W: Pt = [cx - r, cy];
  return [
    { k: 'line', d: pathOf(o), c: t.line, w: 2.2 },
    { k: 'fill', d: pathOf(o), c: t.shade },
    { k: 'fill', d: tri(W, N), c: t.glow },
    { k: 'fill', d: tri(N, E), c: t.lit },
    { k: 'fill', d: tri(S, W), c: t.base },
    ...(t.struck ? [{ k: 'fill', d: pathOf(poly(r * 0.3, 4, -Math.PI / 2, cx - r * 0.2, cy - r * 0.22)), c: '#FFFFFF', o: 0.9 } as Node] : []),
  ];
}

/** Every node of `nodes`, shifted — for building a part once and placing it. */
export function nudge(nodes: Node[], dx: number, dy: number): Node[] {
  const move = (d: string) => d.replace(/(-?\d*\.?\d+) (-?\d*\.?\d+)/g, (_, x, y) => `${r2(+x + dx)} ${r2(+y + dy)}`);
  return nodes.map((n) => (n.k === 'clip' ? { ...n, d: move(n.d), kids: nudge(n.kids, dx, dy) } : { ...n, d: move(n.d) }));
}

// ── RANKS: eight orders of six ────────────────────────────────────────────
//
// THE ORDER PICKS THE SHAPE, THE DEGREE ADDS PARTS TO IT: the two-axis ladder
// every reference that climbs well uses (Valorant, Rocket League, Duolingo's
// leagues), and the one rankShapes.ts was already built on. What changed is how
// the parts look, and which parts they are:
//
//   degree 0   the crest
//   degree 1   + an inner rule, and one stone set in its foot
//   degree 2   + two more stones: three, countable, like a game's division
//   degree 3   FRAMED: the crest set inside a larger crest OF ITS OWN SHAPE.
//              The stones go; the frame is the bigger object that replaces them.
//   degree 4   + a stone at each side of the frame, and a glint
//   degree 5   + a crest stone above and one below, and a second glint
//
// THE FRAME IS THE ORDER'S OWN SHAPE, NOT A MEDALLION. The first draft mounted
// every framed rung on one round medallion, and from degree 3 up all eight
// colours became the same round button — the exact complaint an earlier ladder
// drew: "especially for the more complex ones for each colour, they are all the
// same, I want uniqueness." A shield in a shield, a gem in a gem.
//
// EVERYTHING GROWS OUTWARD AND NOTHING IS A LIMB. The reader ruled on wings and
// horns ("looks like horns and then looks as if it gains wings. I don't want
// this design at all") and on flowers after that; the research names both as
// the commonest template moves in the genre. A frame, a stone and a glint have
// no direction, so none of them can become either.
//
// AND THE CEILING CLIMBS ACROSS THE ORDERS. A capstone's frame is a little
// larger at every order, with more rivets as the ladder climbs (six, then eight
// from bronze, ten, twelve, sixteen at the top), and ruled twice from lapis, so the top of every colour is a richer object than the
// top of the colour below it: the sawtooth rankShapes.ts described, and what the
// reader asked for: "for the really far ranks they must be extremely complex and
// look very good."

export interface OrderShape {
  label: string;
  /** The crest silhouette, centred on (50, 50), about 45 units in reach. */
  core: () => Pt[];
  /** Rivets round the frame from degree 3. */
  rivets: number;
  /** A second rule inside the frame from degree 3. */
  doubleRule: boolean;
}

export const ORDER_SHAPES: OrderShape[] = [
  // CLAY: a coin. The floor, and the only round one.
  { label: 'coin', core: () => circle(44), rivets: 6, doubleRule: false },
  // IRON: the edge is cut for the first time. A hexagon, flat on top.
  { label: 'hex', core: () => rounded(poly(47, 6, 0), 8), rivets: 6, doubleRule: false },
  // BRONZE: a heater shield, the first thing that looks like an honour.
  { label: 'shield', core: () => shield(78, 5, 96), rivets: 8, doubleRule: false },
  // JADE: a cut stone, eight flats.
  { label: 'octagon', core: () => rounded(poly(47, 8, -Math.PI / 8), 6), rivets: 8, doubleRule: false },
  // LAPIS: a crest, wide shoulders and a point below.
  { label: 'crest', core: () => rounded([[12, 8], [88, 8], [94, 45], [50, 96], [6, 45]], 7), rivets: 10, doubleRule: true },
  // CRIMSON: a tall gem, pointed top and bottom.
  { label: 'gem', core: () => rounded(poly(48, 6, -Math.PI / 2).map(([x, y]) => [50 + (x - 50) * 0.92, y] as Pt), 6), rivets: 12, doubleRule: true },
  // AMETHYST: a brilliant, eight facets, long on the vertical.
  { label: 'brilliant', core: () => rounded([[50, 2], [82, 18], [95, 50], [82, 82], [50, 98], [18, 82], [5, 50], [18, 18]], 4), rivets: 12, doubleRule: true },
  // AURUM: the eight-pointed star of an order, two squares laid across each
  // other. Pointed rather than lobed, which is the difference the research
  // draws between an honour and a bottle cap, and its heart is the widest of
  // the eight, so the mark keeps the room it has everywhere else.
  { label: 'star', core: () => rounded(star(50, 50, 49, 49 * 0.765, 8, -Math.PI / 2), 3.5), rivets: 16, doubleRule: true },
];

export interface RankBuild {
  rule: boolean;
  /** stones on the crest itself (degrees 1 and 2) */
  stones: number;
  framed: boolean;
  sideStones: boolean;
  capstone: boolean;
}

export function rankBuild(degree: number): RankBuild {
  const d = Math.max(0, Math.min(5, Math.floor(degree) || 0));
  return {
    rule: d >= 1,
    stones: d === 1 ? 1 : d === 2 ? 3 : 0,
    framed: d >= 3,
    sideStones: d >= 4,
    capstone: d >= 5,
  };
}

export interface RankArt {
  nodes: Node[];
  mark: Mark;
  /** How far the whole thing reaches from (50, 50), outline included. */
  reach: number;
  label: string;
  build: RankBuild;
  /**
   * How much the rung draws, for the "every rung adds" check. A crest counts
   * three (it is an outline, a lip and a face) and so does a frame, which is a
   * second crest; a rule, a stone, a ring of rivets or a glint counts one.
   */
  parts: number;
  /** The crest silhouette as drawn, for measuring. */
  body: Pt[];
  /** The frame as drawn, from degree 3; null below it. */
  frame: Pt[] | null;
}

/** Where a ray from (cx, cy) at angle `a` last crosses an outline. */
export function rayHit(pts: Pt[], a: number, cx = 50, cy = 50): Pt {
  const dx = Math.cos(a), dy = Math.sin(a);
  let far = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[(i + 1) % pts.length];
    const ex = x2 - x1, ey = y2 - y1;
    const den = dx * ey - dy * ex;
    if (Math.abs(den) < 1e-9) continue;
    const tt = ((x1 - cx) * ey - (y1 - cy) * ex) / den;
    const u = ((x1 - cx) * dy - (y1 - cy) * dx) / den;
    if (tt > 0 && u >= 0 && u <= 1 && tt > far) far = tt;
  }
  return [cx + far * dx, cy + far * dy];
}

/** Points spaced evenly by arc length round a closed outline. */
export function alongOutline(pts: Pt[], n: number, offset = 0.5): Pt[] {
  const ring = fromTop(pts);
  const per = perimeterOf(ring);
  const out: Pt[] = [];
  let seg = 0, run = 0;
  for (let k = 0; k < n; k++) {
    const want = ((k + offset) / n) * per;
    while (seg < ring.length) {
      const a = ring[seg], b = ring[(seg + 1) % ring.length];
      const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (run + l >= want) {
        const f = l ? (want - run) / l : 0;
        out.push([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]);
        break;
      }
      run += l;
      seg++;
    }
  }
  return out;
}

/** The centre every rank is drawn about: a little high, so the lip has room. */
export const RANK_CY = 48;
/** How big the crest is drawn on its own, and inside its frame. */
export const CREST_K = 0.88;
export const FRAMED_K = 0.62;
/** The frame's size, a little larger at every order. */
export const frameK = (orderIndex: number) => 0.86 + Math.min(7, Math.max(0, orderIndex)) * 0.01;

const place = (pts: Pt[], k: number): Pt[] => scaleAbout(pts, k, 50, 50).map(([x, y]) => [x, y - 50 + RANK_CY] as Pt);

export function rankArt(orderIndex: number, degree: number, t: Tones): RankArt {
  const oi = Math.max(0, Math.min(ORDER_SHAPES.length - 1, Math.floor(orderIndex) || 0));
  const shape = ORDER_SHAPES[oi];
  const b = rankBuild(degree);
  const nodes: Node[] = [];
  let parts = 3;

  // Framed, the crest shrinks into the frame, so the whole object stays about
  // the same size in its box. The frame is what gets bigger, not the pin.
  const k = b.framed ? FRAMED_K : CREST_K;
  const body = place(shape.core(), k);
  const frame = b.framed ? place(shape.core(), frameK(oi)) : null;

  if (frame) {
    nodes.push(...crest(frame, t, 50, RANK_CY, 5.5, 3.8));
    parts += 3;
    if (shape.doubleRule) {
      nodes.push({ k: 'line', d: pathOf(inset(frame, 8.2)), c: t.struck ? t.glow : t.line, w: 1.1, o: 0.7 });
      parts++;
    }
    if (shape.rivets) {
      for (const [x, y] of alongOutline(inset(frame, 2.75), shape.rivets)) {
        nodes.push({ k: 'fill', d: pathOf(circle(1.6, x + 0.4, y + 0.5, 10)), c: t.rim, o: 0.9 });
        nodes.push({ k: 'fill', d: pathOf(circle(1.25, x, y, 10)), c: t.struck ? t.glow : t.line });
      }
      parts++;
    }
  }

  nodes.push(...crest(body, t, 50, RANK_CY, b.framed ? 6 : RIM, b.framed ? 3.2 : LIP));
  if (b.rule) { nodes.push(innerRule(body, t, b.framed ? 9 : 11.5)); parts++; }

  // Stones set in the crest's foot: one, then three. Countable at 50px because
  // they sit on the outline, where the contrast is highest.
  const foot = rayHit(body, Math.PI / 2, 50, RANK_CY);
  if (b.stones === 1) nodes.push(...gem(50, foot[1] - 1, 5.8, t));
  if (b.stones === 3) {
    const side = (s: number) => rayHit(body, Math.PI / 2 - s * 0.42, 50, RANK_CY);
    for (const s of [-1, 1]) { const p = side(s); nodes.push(...gem(p[0], p[1] - 1.5, 4.9, t)); }
    nodes.push(...gem(50, foot[1] - 1, 5.8, t));
  }
  parts += b.stones;

  let reach = reachOf(frame ?? body) + OUTLINE / 2;
  if (frame && b.sideStones) {
    // Set ON the frame's rim, not hung off it: a stone centred on a pointed
    // edge pokes past the box, and a phone clips it without a word.
    for (const [a, s] of [[Math.PI, -1], [0, 1]] as const) {
      const p = rayHit(frame, a, 50, RANK_CY);
      const x = p[0] - s * 3.2;
      nodes.push(...gem(x, p[1], 6.2, t));
      reach = Math.max(reach, Math.abs(x - 50) + 7.3);
    }
    parts += 2;
    if (t.struck) nodes.push(...sparkle(14, 12, 6, t));
    parts++;
  }
  if (frame && b.capstone) {
    const top = rayHit(frame, -Math.PI / 2, 50, RANK_CY);
    const bot = rayHit(frame, Math.PI / 2, 50, RANK_CY);
    const ty = Math.max(top[1] + 3.2, 8.6), by = Math.min(bot[1] - 0.5, 92);
    nodes.push(...gem(top[0], ty, 7.2, t));
    nodes.push(...gem(bot[0], by, 5.2, t));
    reach = Math.max(reach, 50 - (ty - 7.2) + 1.1, by + 5.2 + 1.1 - 50);
    parts += 2;
    if (t.struck) nodes.push(...sparkle(87, 84, 4.8, t));
    parts++;
  }

  const heavyTop = shape.label === 'shield' || shape.label === 'crest';
  return {
    nodes,
    mark: {
      cx: 50,
      // A shield and a crest narrow to a point below, so their marks sit higher
      // and a little smaller than the rest: the room is in their shoulders.
      cy: RANK_CY - (shape.label === 'crest' ? 9 * k : heavyTop ? 7 * k : 0),
      size: (b.framed ? 30 : 38) * (shape.label === 'star' ? 0.9 : shape.label === 'crest' ? 0.85 : heavyTop ? 0.88 : 1),
      weight: 3.2, color: t.mark, shadow: t.markShadow, dx: 0.9, dy: 1.3,
    },
    reach,
    label: shape.label,
    build: b,
    parts,
    body,
    frame,
  };
}

// ── BADGES: six families, five tiers ──────────────────────────────────────
//
// THE SIX SILHOUETTES STAY, because they are what a badge grid says at a glance
// ("strong on reading, thin on thinkers"), and the research names "every badge
// the same circle with a different glyph" as the most generic look there is.
//
// FIVE TIERS, FIVE OBJECTS, and every addition is OUTSIDE the medal — the rule
// the crossed swords and then the closed wreath each broke (BadgeMedal's header
// has both stories; scripts/validate-badges.mjs §4 measures it):
//
//   I    the medal alone
//   II   + a ribbon banner across its foot
//   III  + a laurel, open
//   IV   + the laurel grown, and three stars over the crown
//   V    + a fanned glory of light behind everything, and two glints

export type Family = 'lessons' | 'streak' | 'thinkers' | 'quotes' | 'xp' | 'mastery';

/** Each family's medal, at full size, centred on (50, 50). */
export const FAMILY_SHAPES: Record<Family, () => Pt[]> = {
  lessons: () => stele(69, 6, 92),
  streak: () => pennant(64, 6, 94, 17),
  thinkers: () => circle(43),
  quotes: () => exlibris(74, 9, 91, 13),
  xp: () => rounded(poly(45, 8, -Math.PI / 8), 5),
  mastery: () => shield(74, 6, 95),
};

/** The mark's side as a fraction of the medal's own box, and its nudge. */
export const FAMILY_MARK: Record<Family, { size: number; dy: number }> = {
  // the stele is the narrowest face once dressed, so its mark is the smallest
  lessons: { size: 0.36, dy: 5 },
  streak: { size: 0.38, dy: -4 },
  thinkers: { size: 0.42, dy: 0 },
  quotes: { size: 0.41, dy: -1 },
  xp: { size: 0.41, dy: 0 },
  mastery: { size: 0.36, dy: -6 },
};

/** How big the medal is drawn, and where, once it has furniture to make room for. */
export const MEDAL = { alone: { k: 0.9, cy: 49 }, dressed: { k: 0.69, cy: 46 } };
/** A dressed medal is smaller, so its mark takes a larger share of it. */
const DRESSED_MARK = 1.14;

export interface Leaf { cx: number; cy: number; rx: number; ry: number; rot: number }

export interface BadgeArt {
  /** drawn before the medal */
  back: Node[];
  medal: Node[];
  /** drawn after the medal */
  front: Node[];
  mark: Mark;
  /** the medal's outline as drawn, for measuring */
  body: Pt[];
  /** the medal's face as drawn — the room the mark has */
  face: Pt[];
  /** the laurel's leaves, for measuring (empty below tier III) */
  leaves: Leaf[];
  /** how far everything reaches from (50, 50) */
  reach: number;
  /** the highest point any furniture reaches */
  top: number;
}

const RIBBON_Y = 84;

function ribbon(t: Tones): Node[] {
  const y = RIBBON_Y, h = 12, x0 = 11, x1 = 89, n = 5;
  const band: Pt[] = [[x0, y - h / 2], [x1, y - h / 2], [x1 - n, y], [x1, y + h / 2], [x0, y + h / 2], [x0 + n, y]];
  const tabL: Pt[] = [[x0 + 7, y - h / 2], [x0 - 2, y - h / 2 + 5], [x0 - 2, y + h / 2 + 5], [x0 + 7, y + h / 2]];
  const tabR: Pt[] = tabL.map(([x, yy]) => [100 - x, yy] as Pt);
  const edge = (p: Pt[]) => pathOf(p);
  return [
    { k: 'line', d: edge(tabL), c: t.line, w: 2.6 },
    { k: 'line', d: edge(tabR), c: t.line, w: 2.6 },
    { k: 'fill', d: edge(tabL), c: t.rim },
    { k: 'fill', d: edge(tabR), c: t.rim },
    { k: 'line', d: edge(band), c: t.line, w: 2.6 },
    { k: 'fill', d: edge(band), c: t.base },
    // one lit edge along the top and one shaded along the bottom: the band is a
    // strip of metal that curves, not a flat label
    { k: 'fill', d: pathOf([[x0 + 5, y - h / 2 + 0.8], [x1 - 5, y - h / 2 + 0.8], [x1 - 5.6, y - h / 2 + 3.2], [x0 + 5.6, y - h / 2 + 3.2]]), c: t.hi },
    { k: 'fill', d: pathOf([[x0 + 5.6, y + h / 2 - 2.6], [x1 - 5.6, y + h / 2 - 2.6], [x1 - 5, y + h / 2 - 0.8], [x0 + 5, y + h / 2 - 0.8]]), c: t.shade },
  ];
}

interface SprigSpec { x0: number; y0: number; cx: number; cy: number; x1: number; y1: number; n: number; rx: number; ry: number }
const SPRIG: Record<'open' | 'full', SprigSpec> = {
  open: { x0: 15, y0: 92, cx: 53, cy: 60, x1: 29, y1: 17, n: 6, rx: 7.4, ry: 3.4 },
  full: { x0: 15, y0: 93, cx: 56, cy: 56, x1: 28, y1: 11, n: 8, rx: 7.8, ry: 3.8 },
};

/** Both sprigs' leaves, placed along the same curve their stems are drawn on. */
export function laurelLeaves(kind: 'open' | 'full'): { stems: string[]; leaves: Leaf[] } {
  const s = SPRIG[kind];
  const stems: string[] = [];
  const leaves: Leaf[] = [];
  for (const side of [-1, 1]) {
    const x0 = 50 + side * s.x0, cx = 50 + side * s.cx, x1 = 50 + side * s.x1;
    const at = (t: number) => {
      const u = 1 - t;
      return {
        x: u * u * x0 + 2 * u * t * cx + t * t * x1,
        y: u * u * s.y0 + 2 * u * t * s.cy + t * t * s.y1,
        dx: 2 * u * (cx - x0) + 2 * t * (x1 - cx),
        dy: 2 * u * (s.cy - s.y0) + 2 * t * (s.y1 - s.cy),
      };
    };
    const stem: Pt[] = [];
    for (let i = 0; i <= 16; i++) { const p = at(i / 16); stem.push([p.x, p.y]); }
    stems.push('M' + stem.map(([x, y]) => `${r2(x)} ${r2(y)}`).join(' L'));
    for (let i = 0; i < s.n; i++) {
      const t = 0.1 + (i / (s.n - 1)) * 0.82;
      const p = at(t);
      const kk = 1 - 0.3 * (i / (s.n - 1));
      leaves.push({
        cx: p.x + side * 4.2 * kk, cy: p.y,
        rx: s.rx * kk, ry: s.ry * kk,
        rot: (Math.atan2(p.dy, p.dx) * 180) / Math.PI + side * 38,
      });
    }
  }
  return { stems, leaves };
}

function laurel(t: Tones, kind: 'open' | 'full'): Node[] {
  const { stems, leaves } = laurelLeaves(kind);
  const out: Node[] = [];
  for (const d of stems) out.push({ k: 'line', d, c: t.line, w: 3.2 });
  for (const l of leaves) out.push({ k: 'line', d: pathOf(ellipse(l.cx, l.cy, l.rx, l.ry, l.rot)), c: t.line, w: 1.8 });
  for (const l of leaves) {
    out.push({ k: 'fill', d: pathOf(ellipse(l.cx, l.cy, l.rx, l.ry, l.rot)), c: t.lit });
    // the lit half of every leaf, up and to the left of its own midrib
    out.push({ k: 'fill', d: pathOf(ellipse(l.cx - 0.7, l.cy - 0.9, l.rx * 0.55, l.ry * 0.36, l.rot)), c: t.glow, o: 0.9 });
  }
  return out;
}

function stars(t: Tones): Node[] {
  const out: Node[] = [];
  for (const [x, r, dy] of [[36, 4.0, 1], [50, 5.2, -0.6], [64, 4.0, 1]]) {
    const p = star(x, 7 + dy, r, r * 0.46, 5);
    out.push({ k: 'line', d: pathOf(p), c: t.line, w: 2.2 });
    out.push({ k: 'fill', d: pathOf(p), c: t.hi });
    out.push({ k: 'fill', d: pathOf([[x, 7 + dy], ...p.slice(0, 3)] as Pt[]), c: t.glow, o: 0.8 });
  }
  return out;
}

/**
 * THE GLORY — tier V's addition, and it is light rather than a limb: long thin
 * wedges fanned behind the medal, the PlayStation level-999 move the research
 * singled out as "a late-tier addition that is not a wing". Faint on purpose —
 * it is atmosphere behind the object, not a second object.
 */
function glory(t: Tones): Node[] {
  const out: Node[] = [];
  const n = 16, cx = 50, cy = 44;
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    const w = 0.09, len = i % 2 ? 37 : 42;
    out.push({
      k: 'fill',
      d: pathOf([[cx, cy], [cx + len * Math.cos(a - w), cy + len * Math.sin(a - w)], [cx + len * Math.cos(a + w), cy + len * Math.sin(a + w)]]),
      c: t.lit, o: 0.34,
    });
  }
  return out;
}

export function badgeArt(family: Family, tier: number, t: Tones): BadgeArt {
  const tr = Math.max(1, Math.min(5, Math.floor(tier) || 1));
  // A locked badge carries no furniture: the ornament arrives when it is won.
  const dressed = tr >= 2;
  const furnished = t.struck;
  const place = dressed ? MEDAL.dressed : MEDAL.alone;
  const body = scaleAbout(FAMILY_SHAPES[family](), place.k).map(([x, y]) => [x, y - 50 + place.cy] as Pt);
  const face = inset(body, RIM);
  const back: Node[] = [];
  const front: Node[] = [];
  let leaves: Leaf[] = [];
  if (furnished && tr >= 5) back.push(...glory(t));
  if (furnished && tr >= 3) {
    const kind = tr >= 4 ? 'full' : 'open';
    back.push(...laurel(t, kind));
    leaves = laurelLeaves(kind).leaves;
  }
  const medal = crest(body, t, 50, place.cy);
  if (dressed) medal.push(innerRule(body, t, 11));
  if (furnished && tr >= 2) front.push(...ribbon(t));
  if (furnished && tr >= 4) front.push(...stars(t));
  if (furnished && tr >= 5) { front.push(...sparkle(14, 30, 5.6, t), ...sparkle(87, 21, 4.2, t)); }

  const fm = FAMILY_MARK[family];
  const leafReach = leaves.reduce((m, l) => {
    const a = (l.rot * Math.PI) / 180;
    return Math.max(m, Math.abs(l.cx - 50) + Math.hypot(l.rx * Math.cos(a), l.ry * Math.sin(a)) + 0.9);
  }, 0);
  const leafTop = leaves.reduce((m, l) => {
    const a = (l.rot * Math.PI) / 180;
    return Math.min(m, l.cy - Math.hypot(l.rx * Math.sin(a), l.ry * Math.cos(a)) - 0.9);
  }, 100);
  return {
    back, medal, front,
    mark: {
      cx: 50, cy: place.cy + fm.dy * place.k,
      size: 100 * fm.size * place.k * (dressed ? DRESSED_MARK : 1), weight: 3.2, color: t.mark, shadow: t.markShadow, dx: 0.8, dy: 1.2,
    },
    body, face, leaves,
    reach: Math.max(reachOf(body) + OUTLINE / 2, leafReach, dressed && furnished ? Math.hypot(41, 37.5) : 0),
    top: leafTop,
  };
}

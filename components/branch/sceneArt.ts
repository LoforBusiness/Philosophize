// ─────────────────────────────────────────────────────────────────────────────
// THE SCENERY, AS DRAWN SHAPES.
//
// ZERO IMPORTS, so every path can be rendered and looked at in plain Node before
// it reaches a device — `scripts/sheet-scene.mjs` draws all six places at every
// weather onto one contact sheet, which is the only way this file has ever been
// judged honestly.
//
// ── WHAT THIS IS COPYING ────────────────────────────────────────────────────
//
// The six photographs in assets/images/branches — the ones already sitting at
// the top of this very screen, so the drawn world and its reference are three
// hundred pixels apart and get compared whether we like it or not.
//
// The version before this was five grey stripes: a quadratic-dome hill line, a
// row of symmetrical fir zigzags, and a cabin. Evenly spaced, evenly toned,
// bilaterally symmetrical, and made of the three shapes a generator reaches for
// first. Which is exactly what "it looks AI generated" means, and it was right.
//
// Counting what the references are ACTUALLY made of:
//
//   1. ENORMOUS STACKED CLOUD. Four of the six are more cloud than anything
//      else, and it is the one shape the old file did not have at all. A cumulus
//      is a UNION OF SPHERES — that is what makes it lumpy in the particular way
//      it is lumpy — so that is how `cumulus` builds one, and the silhouette is
//      sampled off the union rather than drawn as a row of domes.
//   2. LIGHT FROM ONE SIDE. Every cloud in every reference has a lit face and a
//      shaded one. Same rule as tone.ts: ONE light, top-left, and it never moves.
//      Done by drawing the mass twice — see `cloudSpec`, which took three tries
//      and is commented with why the first two were invisible.
//   3. FACETS, NOT CURVES. The mountains are planes meeting at edges, with a
//      shoulder below each summit. Quadratic saddles gave us pudding.
//   4. PROPORTION IN EVERY TREE. A conifer is two to four times taller than it is
//      wide and its outline is a stack of skirts. Drawn as wide as it is tall it
//      is a tent, and drawn as a symmetrical zigzag it is a Christmas decoration;
//      both have been in this file and both were obvious on the sheet.
//   5. HATCHING AND MIST — the two textures. Both are cheap, both are the
//      difference between "engraved" and "filled".
//
// ── NOTHING DARK MAY STAND AT HIS HEIGHT ────────────────────────────────────
//
// The reader's figure is solid ink, head included, and he walks in FRONT of every
// layer in this file. A near mass at #1A1A1A behind him does not read as a
// dramatic silhouette, it reads as the man disappearing — which is what ethics
// and political philosophy did, and it went unseen for two rounds of contact
// sheet because the sheet did not draw him. It does now.
//
// The first fix was to lighten every dark tone, and that was the wrong one: it
// took the punch out of all six places and left a wash of mid greys. The tones
// were never the problem. HEIGHT was. He is only 43 units tall, so:
//
//   · anything DARKER than `mid` must top out below `NEAR_TOP` — scrub and
//     stones at his shins, which is where a dark band belongs anyway.
//   · anything standing at his height is `mid` or lighter, and `mid` is kept
//     light enough to carry an ink figure against it (about 3.4:1).
//
// So the darkest things in the picture are the ground he walks on, the low scrub
// at his feet, and the man — which is the right way round when he is the subject.
// `npm run check:walk` measures it rather than trusting this paragraph.
//
/** No layer darker than `mid` may rise above this line. The figure's knee. */
export const NEAR_TOP = 286;
//
// ── EVERY LAYER IS A BAND, AND THAT IS A PERFORMANCE RULE ───────────────────
//
// §17 rule 6: an animated full-screen <Svg> is worth about ten frames a second
// on an S24, and what costs is the AREA being repainted. So a layer's <Svg> is
// only as tall as its own art. Two numbers make that computable:
//
//   · the TOP is MEASURED off the finished path, not declared. Declaring it by
//     hand is how art ends up clipped: someone adds a taller peak and forgets to
//     move the number. `measureTop` reads every y in the path string, so the band
//     cannot disagree with what is in it.
//   · the BOTTOM is declared, because it is a judgement: everything behind the
//     next mass only has to be filled down to where that mass starts.
//
// Coordinates are in a 1000-wide × 360-tall tile that repeats seamlessly. The
// ground line is at y 300, so anything below that is buried.
// ─────────────────────────────────────────────────────────────────────────────

export const TILE_W = 1000;
export const TILE_H = 360;
/** Where the road runs. Scenery below this is covered by the ground band. */
const GROUND = 300;

function rnd(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/** Circle as four cubics. No `A` commands anywhere — see `measureTop`. */
const KAPPA = 0.5522847498;
function disc(cx: number, cy: number, r: number): string {
  const o = r * KAPPA;
  const f = (v: number) => v.toFixed(1);
  return `M${f(cx - r)} ${f(cy)}`
    + ` C${f(cx - r)} ${f(cy - o)} ${f(cx - o)} ${f(cy - r)} ${f(cx)} ${f(cy - r)}`
    + ` C${f(cx + o)} ${f(cy - r)} ${f(cx + r)} ${f(cy - o)} ${f(cx + r)} ${f(cy)}`
    + ` C${f(cx + r)} ${f(cy + o)} ${f(cx + o)} ${f(cy + r)} ${f(cx)} ${f(cy + r)}`
    + ` C${f(cx - o)} ${f(cy + r)} ${f(cx - r)} ${f(cy + o)} ${f(cx - r)} ${f(cy)} Z`;
}

/**
 * The highest point anything in this path reaches.
 *
 * Every command emitted by this file takes its arguments as (x, y) pairs — M, L,
 * Q, C all do, and `A` is the one that does not, which is why there are no arcs
 * in here and circles are cubics. So every second number is a y, and the band can
 * be measured off the art instead of promised alongside it.
 */
function measureTop(d: string): number {
  const nums = d.match(/-?\d+(?:\.\d+)?/g);
  if (!nums) return 0;
  let min = Infinity;
  for (let i = 1; i < nums.length; i += 2) {
    const v = parseFloat(nums[i]);
    if (v < min) min = v;
  }
  return min === Infinity ? 0 : min;
}

// ── CLOUD ────────────────────────────────────────────────────────────────────

interface Ball { x: number; y: number; r: number }

/**
 * A cumulus bank, as the spheres it is made of.
 *
 * A low run right across the tile so there is always weather on the horizon,
 * plus two or three TOWERS that stack upward in tiers, each tier narrower than
 * the one under it and each with a shoulder lobe either side. Even spacing and
 * equal heights are what made the old scenery read as wallpaper, so the towers
 * are placed off-centre and given different heights on purpose.
 */
function cumulus(seed: number, base: number, h: number, amount: number): Ball[] {
  const out: Ball[] = [];
  const A = 0.55 + amount * 0.45;
  const n = 9;
  for (let i = 0; i < n; i++) {
    const x = (i + 0.5) * (TILE_W / n) + (rnd(seed + i) - 0.5) * 78;
    const r = h * (0.15 + rnd(seed + i * 3) * 0.11) * A;
    out.push({ x, y: base - r * 0.52, r });
  }
  const towers = 2 + Math.floor(rnd(seed + 91) * 2);
  for (let t = 0; t < towers; t++) {
    const cx = (t + 0.5) * (TILE_W / towers) + (rnd(seed + t * 7) - 0.5) * 190;
    const th = h * (0.52 + rnd(seed + t * 11) * 0.48) * A;
    for (let s = 0; s < 4; s++) {
      const f = s / 3;                             // 0 at the foot, 1 at the crown
      const r = h * (0.20 - f * 0.105) * A;
      const lift = th * f;
      const wob = (rnd(seed + t * 13 + s) - 0.5) * h * 0.26;
      out.push({ x: cx + wob, y: base - lift - r * 0.42, r });
      out.push({ x: cx + wob - r * 0.94, y: base - lift * 0.92 - r * 0.18, r: r * 0.74 });
      out.push({ x: cx + wob + r * 1.02, y: base - lift * 0.86 - r * 0.12, r: r * 0.66 });
    }
  }
  return out;
}

/**
 * The silhouette of a union of spheres, sampled across the tile.
 *
 * Copies of every ball are considered one tile left and one tile right, so the
 * edge at x = 0 and x = TILE_W are the same number by construction and the two
 * drawn tiles butt with no seam.
 */
function ballMass(balls: Ball[], base: number, bottom: number, step = 5): string {
  const edge = (x: number) => {
    let y = base;
    for (let i = 0; i < balls.length; i++) {
      const b = balls[i];
      for (let o = -1; o <= 1; o++) {
        const dx = x - (b.x + o * TILE_W);
        if (dx <= -b.r || dx >= b.r) continue;
        const t = b.y - Math.sqrt(b.r * b.r - dx * dx);
        if (t < y) y = t;
      }
    }
    return y;
  };
  let d = `M0 ${bottom} L0 ${edge(0).toFixed(1)}`;
  for (let x = step; x < TILE_W; x += step) d += ` L${x} ${edge(x).toFixed(1)}`;
  return `${d} L${TILE_W} ${edge(TILE_W).toFixed(1)} L${TILE_W} ${bottom} Z`;
}

/** The same mass shifted down-right — what shows of it is the shaded underside. */
function shifted(balls: Ball[], dx: number, dy: number): Ball[] {
  return balls.map((b) => ({ x: b.x + dx, y: b.y + dy, r: b.r }));
}

// ── LAND ─────────────────────────────────────────────────────────────────────

/**
 * A FACETED RANGE — planes meeting at edges, which is what a mountain is.
 *
 * Every summit gets a shoulder a little below and to one side of it, so the face
 * breaks instead of running straight from base to peak, and the two flanks are
 * different lengths. Straight segments throughout: the quadratic saddles this
 * replaces gave every range the same soft scalloped edge.
 */
function crags(seed: number, base: number, amp: number, n: number, bottom: number): string {
  const step = TILE_W / n;
  const pts: [number, number][] = [[0, base - amp * 0.34]];
  for (let i = 1; i < n; i++) {
    const x = step * i + (rnd(seed + i) - 0.5) * step * 0.5;
    const tall = i % 2 === 0 ? 0.64 + rnd(seed + i * 3) * 0.36 : 0.26 + rnd(seed + i * 5) * 0.32;
    const peak = base - amp * tall;
    // a shoulder on the windward side, and a notch on the lee
    pts.push([x - step * (0.20 + rnd(seed + i * 7) * 0.14), base - amp * tall * (0.48 + rnd(seed + i * 9) * 0.22)]);
    pts.push([x, peak]);
    pts.push([x + step * (0.13 + rnd(seed + i * 11) * 0.10), peak + amp * tall * (0.22 + rnd(seed + i * 13) * 0.18)]);
  }
  pts.push([TILE_W, base - amp * 0.34]);
  let d = `M0 ${bottom} L0 ${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) d += ` L${pts[i][0].toFixed(1)} ${pts[i][1].toFixed(1)}`;
  return `${d} L${TILE_W} ${bottom} Z`;
}

/** The lit faces of a range: a few triangles hung off its summits. */
function cragLight(seed: number, base: number, amp: number, n: number): string {
  const step = TILE_W / n;
  let d = '';
  for (let i = 1; i < n; i++) {
    if (i % 2 !== 0) continue;
    const x = step * i + (rnd(seed + i) - 0.5) * step * 0.5;
    const tall = 0.64 + rnd(seed + i * 3) * 0.36;
    const peak = base - amp * tall;
    const w = step * (0.20 + rnd(seed + i * 7) * 0.14);
    // Down-LEFT from the summit: one light, top-left, and it never moves.
    d += ` M${x.toFixed(1)} ${peak.toFixed(1)}`
      + ` L${(x - w).toFixed(1)} ${(peak + amp * tall * 0.52).toFixed(1)}`
      + ` L${(x - w * 0.34).toFixed(1)} ${(peak + amp * tall * 0.60).toFixed(1)}`
      + ` L${(x + w * 0.16).toFixed(1)} ${(peak + amp * tall * 0.24).toFixed(1)} Z`;
  }
  return d;
}

/** ROLLING GROUND — the quietest layer, for a place that needs air rather than mass. */
function downs(seed: number, base: number, amp: number, n: number, bottom: number): string {
  let d = `M0 ${bottom} L0 ${base.toFixed(1)}`;
  const step = TILE_W / n;
  for (let i = 0; i < n; i++) {
    const x = i * step;
    const top = base - amp * (0.4 + rnd(seed + i * 11) * 0.6);
    d += ` Q${(x + step * 0.5).toFixed(1)} ${top.toFixed(1)} ${(x + step).toFixed(1)} ${base.toFixed(1)}`;
  }
  return `${d} L${TILE_W} ${bottom} Z`;
}

/**
 * A TREELINE — a wood seen from outside it, as ONE mass with a broken top.
 *
 * Rebuilt, because the version before this came out as a bandsaw blade and that
 * was visible on the contact sheet from across a room. What made it a saw was not
 * the heights, which already varied: it was that every tree was a TRIANGLE on an
 * EVEN PITCH, so the eye locked onto the repeat and stopped seeing trees at all.
 *
 * Three changes, and they are the difference:
 *
 *   · trees are placed by walking a variable gap along the line, not by dividing
 *     the tile into n slots. Clumps and clearings happen on their own.
 *   · each side of a tree is built from four steps of DIFFERENT depth, and the
 *     two sides are generated separately, so no tree is symmetrical.
 *   · about one in seven is a bare snag — a spike with two stubs — which is what
 *     stops a wood reading as a crop.
 */
function treemass(seed: number, base: number, h: number, n: number, bottom: number): string {
  let d = `M0 ${bottom} L0 ${base.toFixed(1)}`;
  const pitch = TILE_W / n;
  let x = -pitch * 0.5;
  let i = 0;
  while (x < TILE_W + pitch) {
    const r = (m: number) => rnd(seed + i * 7.3 + m);
    const th = h * (0.48 + r(1) * 1.15);
    // ── ASPECT IS THE WHOLE THING ────────────────────────────────────────────
    //
    // The pass before this made trees as wide as they were tall, and a shape
    // that wide narrowing smoothly to a point is not a conifer, it is a TENT —
    // which is exactly what the contact sheet showed, a row of grey tepees. A
    // spruce seen from a distance is between two and four times taller than it is
    // broad, and half the reason it reads as a tree at all is that proportion.
    const w = th * (0.13 + r(2) * 0.14);
    const lean = (r(3) - 0.5) * w * 0.9;
    const tip = x + lean;
    if (r(9) < 0.13) {
      // a dead one: bare, thin, and taller than its neighbours
      const tw = Math.max(1.1, w * 0.16);
      d += ` L${(x - tw * 2.2).toFixed(1)} ${base.toFixed(1)}`
        + ` L${(tip - tw).toFixed(1)} ${(base - th * 1.2).toFixed(1)}`
        + ` L${(tip + tw * 0.5 + w * 0.8).toFixed(1)} ${(base - th * 0.74).toFixed(1)}`
        + ` L${(tip + tw).toFixed(1)} ${(base - th * 0.88).toFixed(1)}`
        + ` L${(x + tw * 2.2).toFixed(1)} ${base.toFixed(1)}`;
    } else {
      // TIERS, and they jut OUT before stepping back in. A conifer's outline is
      // a stack of skirts, not a taper — the little overhang at the foot of each
      // skirt is what tells it apart from a cone at any size.
      const tiers = 3 + Math.floor(r(4) * 2);
      d += ` L${(x - w).toFixed(1)} ${base.toFixed(1)}`;
      for (let s = 1; s <= tiers; s++) {
        const f = s / tiers;
        const out = w * (1 - f) * (0.9 + r(10 + s) * 0.5);
        const inn = out * (0.52 + r(30 + s) * 0.22);
        d += ` L${(x - out).toFixed(1)} ${(base - th * (f - 1 / tiers) - th * 0.06).toFixed(1)}`;
        d += ` L${(x - inn).toFixed(1)} ${(base - th * f).toFixed(1)}`;
      }
      d += ` L${tip.toFixed(1)} ${(base - th).toFixed(1)}`;
      for (let s = tiers; s >= 1; s--) {
        const f = s / tiers;
        const out = w * (1 - f) * (0.85 + r(20 + s) * 0.55);
        const inn = out * (0.50 + r(40 + s) * 0.25);
        d += ` L${(x + inn).toFixed(1)} ${(base - th * f).toFixed(1)}`;
        d += ` L${(x + out).toFixed(1)} ${(base - th * (f - 1 / tiers) - th * 0.05).toFixed(1)}`;
      }
      d += ` L${(x + w * 0.94).toFixed(1)} ${base.toFixed(1)}`;
    }
    // Overlapping as often as open — a wood is not a hedge.
    x += pitch * (0.34 + rnd(seed + i * 3.1) * 0.95);
    i++;
  }
  return `${d} L${TILE_W} ${base.toFixed(1)} L${TILE_W} ${bottom} Z`;
}

// ── THINGS THAT STAND ON THEIR OWN ───────────────────────────────────────────

/** One tapered limb, as a quad. Shared by both trees. */
function limb(x: number, y: number, ang: number, len: number, w: number): [string, number, number] {
  const ex = x + Math.cos(ang) * len;
  const ey = y + Math.sin(ang) * len;
  const nx = -Math.sin(ang), ny = Math.cos(ang);
  const w2 = w * 0.58;
  const f = (v: number) => v.toFixed(1);
  const d = ` M${f(x + nx * w)} ${f(y + ny * w)} L${f(ex + nx * w2)} ${f(ey + ny * w2)}`
    + ` L${f(ex - nx * w2)} ${f(ey - ny * w2)} L${f(x - nx * w)} ${f(y - ny * w)} Z`;
  return [d, ex, ey];
}

/**
 * A GNARLED PINE — the tree in the metaphysics and epistemology references.
 *
 * A leaning trunk that forks at uneven heights, more often to one side than the
 * other, ending in FLAT HORIZONTAL SPRAYS rather than blobs. The sprays are what
 * make it that tree and not a generic one: a wind-shaped pine carries its needles
 * in shelves.
 */
function pine(x: number, base: number, h: number, seed: number, dir = 1): string {
  let d = '';
  /**
   * A SHELF of needles: wide, flat, and thickest where it meets the branch.
   *
   * The first version made these little round blobs a seventh of the tree's
   * height, hung on the end of thin limbs — which is not a pine, it is a
   * television aerial, and that is exactly what it looked like on the sheet. A
   * wind-shaped pine carries its needles in horizontal SHELVES three times wider
   * than they are deep, and the silhouette is nearly all shelf and hardly any
   * branch.
   */
  const shelf = (px: number, py: number, w: number, side: number) => {
    const t = w * 0.30;
    const tipX = px + w * side;
    return ` M${(px - w * 0.30 * side).toFixed(1)} ${(py + t * 0.5).toFixed(1)}`
      + ` Q${(px + w * 0.30 * side).toFixed(1)} ${(py - t * 1.15).toFixed(1)} ${(px + w * 0.68 * side).toFixed(1)} ${(py - t * 0.55).toFixed(1)}`
      + ` Q${(px + w * 0.86 * side).toFixed(1)} ${(py - t * 0.9).toFixed(1)} ${tipX.toFixed(1)} ${(py - t * 0.15).toFixed(1)}`
      + ` Q${(px + w * 0.6 * side).toFixed(1)} ${(py + t * 0.62).toFixed(1)} ${(px + w * 0.2 * side).toFixed(1)} ${(py + t * 0.5).toFixed(1)} Z`;
  };

  // the trunk, in three leaning sections so it is never a straight pole
  let cx = x, cy = base, ang = -Math.PI / 2 + dir * 0.07;
  for (let s = 0; s < 3; s++) {
    const len = h * (0.38 - s * 0.06);
    const w = h * (0.050 - s * 0.012);
    const [seg, ex, ey] = limb(cx, cy, ang, len, w);
    d += seg;
    // Shelves off BOTH sides of each section, at different reaches, and lower
    // ones longer than higher ones — the taper is what makes it read as a tree
    // rather than as a mast with things on it.
    const drop = 1 - s * 0.26;
    for (const side of [1, -1]) {
      const at = 0.30 + rnd(seed + s * 5 + side) * 0.45;
      const px = cx + Math.cos(ang) * len * at;
      const py = cy + Math.sin(ang) * len * at;
      const reach = h * (0.26 + rnd(seed + s * 9 + side) * 0.16) * drop;
      const [br] = limb(px, py, ang + side * dir * (1.15 + rnd(seed + s * 7) * 0.30), reach * 0.55, w * 0.5);
      d += br + shelf(px, py + h * 0.02, reach, side * dir);
    }
    cx = ex; cy = ey;
    ang += dir * (rnd(seed + s * 13) - 0.34) * 0.30;
  }
  // the crown: two short shelves and nothing above them
  return d + shelf(cx, cy + h * 0.01, h * 0.15, dir) + shelf(cx, cy - h * 0.03, h * 0.11, -dir);
}

/**
 * A BROADLEAF — the single oak standing against the great cloud in the logic
 * reference, and the only round thing in that picture.
 *
 * The crown is overlapping circles as one fill, which is how a mass of foliage
 * actually silhouettes: lobed all the way round, and lumpier on top than below.
 */
function oak(x: number, base: number, h: number, seed: number): string {
  const th = h * 0.34;
  let d = ` M${(x - h * 0.045).toFixed(1)} ${base.toFixed(1)}`
    + ` L${(x - h * 0.022).toFixed(1)} ${(base - th).toFixed(1)}`
    + ` L${(x + h * 0.026).toFixed(1)} ${(base - th).toFixed(1)}`
    + ` L${(x + h * 0.052).toFixed(1)} ${base.toFixed(1)} Z`;
  // two roots flaring out, so it grows from the ground rather than being stuck in it
  d += ` M${(x - h * 0.12).toFixed(1)} ${base.toFixed(1)} L${(x - h * 0.03).toFixed(1)} ${(base - h * 0.08).toFixed(1)}`
    + ` L${(x + h * 0.03).toFixed(1)} ${(base - h * 0.08).toFixed(1)} L${(x + h * 0.13).toFixed(1)} ${base.toFixed(1)} Z`;
  const cy = base - h * 0.66;
  const cr = h * 0.34;
  d += disc(x, cy, cr);
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + rnd(seed + i) * 0.5;
    const rr = cr * (0.40 + rnd(seed + i * 3) * 0.30);
    const dd = cr * (0.62 + rnd(seed + i * 5) * 0.34);
    // squashed vertically, because a crown spreads wider than it is tall
    d += disc(x + Math.cos(a) * dd * 1.15, cy + Math.sin(a) * dd * 0.72, rr);
  }
  return d;
}

/**
 * A ROCK SPIRE — epistemology's pinnacle rising out of the mist.
 *
 * Wider at the foot, stepped in on one side only, with a couple of ledges cut
 * across it. Never a cone: the reference's rock is a stack of blocks.
 */
function spire(x: number, base: number, w: number, h: number, seed: number): string {
  const f = (v: number) => v.toFixed(1);
  // SLANTED FACES, not steps. The first version stepped each side out and then
  // up at right angles, which draws a literal staircase — and read as one. Rock
  // breaks along angled planes: every face here leans, and the two sides lean
  // different ways, with only the odd horizontal LEDGE where a bed has weathered
  // out. It is also asymmetric on purpose, wider and blunter on the windward left.
  const n = 7;
  const pts: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const half = w * (1 - t * 0.66) * (0.80 + rnd(seed + i) * 0.40);
    pts.push([x - half, base - h * t]);
  }
  let d = ` M${f(pts[0][0])} ${f(base)}`;
  for (let i = 1; i <= n; i++) {
    if (rnd(seed + i * 11) < 0.34) d += ` L${f(pts[i][0] - w * 0.16)} ${f(pts[i][1] + h * 0.03)}`;  // a ledge
    d += ` L${f(pts[i][0])} ${f(pts[i][1])}`;
  }
  d += ` L${f(x + w * 0.16)} ${f(base - h * (0.94 + rnd(seed + 3) * 0.06))}`;
  for (let i = n; i >= 1; i--) {
    const t = i / n;
    const half = w * (1 - t * 0.74) * (0.52 + rnd(seed + i * 5) * 0.42);
    if (rnd(seed + i * 17) < 0.30) d += ` L${f(x + half + w * 0.2)} ${f(base - h * t + h * 0.04)}`;
    d += ` L${f(x + half)} ${f(base - h * t)}`;
  }
  return `${d} L${f(x + w * 0.86)} ${f(base)} Z`;
}

/**
 * ROOFTOPS — the one thing in the political-philosophy reference that is not
 * landscape: a town in the fold of the valley.
 *
 * Pitched roofs at different heights and depths, overlapping, a few with a
 * chimney. Buildings sharing one eaves line is what reads as a rendering; a town
 * on a slope steps.
 */
function roofs(seed: number, base: number, h: number, n: number, bottom: number): string {
  let d = `M0 ${bottom} L0 ${base.toFixed(1)}`;
  const step = TILE_W / n;
  for (let i = 0; i < n; i++) {
    const x = i * step + (rnd(seed + i * 3) - 0.5) * step * 0.3;
    const bh = h * (0.42 + rnd(seed + i) * 0.9);
    const bw = step * (0.30 + rnd(seed + i * 5) * 0.30);
    const rh = bh * (0.28 + rnd(seed + i * 7) * 0.20);
    d += ` L${(x - bw).toFixed(1)} ${base.toFixed(1)} L${(x - bw).toFixed(1)} ${(base - bh).toFixed(1)}`
      + ` L${(x - bw * 1.22).toFixed(1)} ${(base - bh).toFixed(1)}`
      + ` L${x.toFixed(1)} ${(base - bh - rh).toFixed(1)}`
      + ` L${(x + bw * 1.22).toFixed(1)} ${(base - bh).toFixed(1)}`
      + ` L${(x + bw).toFixed(1)} ${(base - bh).toFixed(1)} L${(x + bw).toFixed(1)} ${base.toFixed(1)}`;
    if (rnd(seed + i * 11) < 0.4) {
      const cx = x + bw * 0.55;
      d += ` L${cx.toFixed(1)} ${base.toFixed(1)} L${cx.toFixed(1)} ${(base - bh - rh * 1.5).toFixed(1)}`
        + ` L${(cx + bw * 0.2).toFixed(1)} ${(base - bh - rh * 1.5).toFixed(1)}`
        + ` L${(cx + bw * 0.2).toFixed(1)} ${base.toFixed(1)}`;
    }
  }
  return `${d} L${TILE_W} ${base.toFixed(1)} L${TILE_W} ${bottom} Z`;
}

/**
 * MIST lying in the low ground — long flat lozenges, overlapping.
 *
 * The one thing in the epistemology reference doing the most work: it is what
 * turns a stack of grey shapes into distance.
 */
function mist(seed: number, y: number, h: number, n: number): string {
  let d = '';
  for (let i = 0; i < n; i++) {
    const cx = ((i + 0.5) / n) * TILE_W + (rnd(seed + i) - 0.5) * 180;
    const w = 90 + rnd(seed + i * 3) * 170;
    const t = h * (0.5 + rnd(seed + i * 5) * 0.8);
    const cy = y + (rnd(seed + i * 7) - 0.5) * h * 1.6;
    d += ` M${(cx - w).toFixed(1)} ${cy.toFixed(1)}`
      + ` Q${(cx - w * 0.45).toFixed(1)} ${(cy - t).toFixed(1)} ${(cx + w * 0.1).toFixed(1)} ${(cy - t * 0.7).toFixed(1)}`
      + ` Q${(cx + w * 0.62).toFixed(1)} ${(cy - t * 0.45).toFixed(1)} ${(cx + w).toFixed(1)} ${cy.toFixed(1)}`
      + ` Q${(cx + w * 0.4).toFixed(1)} ${(cy + t * 0.42).toFixed(1)} ${(cx - w * 0.35).toFixed(1)} ${(cy + t * 0.32).toFixed(1)} Z`;
  }
  return d;
}

/**
 * SKY HATCHING — fine horizontal rules behind the cloud, thinning as they rise.
 *
 * Straight off the logic reference, where the sky is not a tone at all but a
 * field of ruled lines. It is the single cheapest thing in this file that says
 * "cut by hand" rather than "filled by a computer".
 */
function hatch(seed: number, top: number, bottom: number, gap: number): string {
  let d = '';
  let row = 0;
  for (let y = bottom; y > top; y -= gap, row++) {
    // shorter and sparser toward the top, so the sky opens out
    const f = (y - top) / (bottom - top);
    if (rnd(seed + row * 3.1) > 0.30 + f * 0.68) continue;
    let x = -rnd(seed + row) * 160;
    while (x < TILE_W) {
      const len = 60 + rnd(seed + row * 5 + x) * 300 * f;
      const t = 0.9 + rnd(seed + row * 7) * 0.5;
      const x1 = Math.min(TILE_W, x + len);
      if (x1 > 0) {
        d += ` M${Math.max(0, x).toFixed(1)} ${y.toFixed(1)} L${x1.toFixed(1)} ${y.toFixed(1)}`
          + ` L${x1.toFixed(1)} ${(y + t).toFixed(1)} L${Math.max(0, x).toFixed(1)} ${(y + t).toFixed(1)} Z`;
      }
      x += len + 30 + rnd(seed + row * 11 + x) * 190;
    }
  }
  return d;
}

/**
 * BIRDS — the one thing up there that is neither land nor sky.
 *
 * Each is one closed shape: two arcs up for the wings and one back under, which
 * is the whole of a bird at this size.
 */
function birds(seed: number, y: number, n: number): string {
  let d = '';
  for (let i = 0; i < n; i++) {
    const x = ((i + 0.5) / n) * TILE_W + (rnd(seed + i) - 0.5) * 140;
    const by = y + (rnd(seed + i * 3) - 0.5) * 44;
    const s = 4.5 + rnd(seed + i * 7) * 4;
    d += ` M${(x - s).toFixed(1)} ${by.toFixed(1)}`
      + ` Q${(x - s * 0.5).toFixed(1)} ${(by - s * 0.75).toFixed(1)} ${x.toFixed(1)} ${by.toFixed(1)}`
      + ` Q${(x + s * 0.5).toFixed(1)} ${(by - s * 0.75).toFixed(1)} ${(x + s).toFixed(1)} ${by.toFixed(1)}`
      + ` Q${(x + s * 0.5).toFixed(1)} ${(by - s * 0.30).toFixed(1)} ${x.toFixed(1)} ${(by + s * 0.24).toFixed(1)}`
      + ` Q${(x - s * 0.5).toFixed(1)} ${(by - s * 0.30).toFixed(1)} ${(x - s).toFixed(1)} ${by.toFixed(1)} Z`;
  }
  return d;
}

/** STILL WATER — a flat band with a few darker streaks lying across it. */
function ripples(seed: number, y: number, h: number, n: number): string {
  let d = '';
  for (let i = 0; i < n; i++) {
    const cy = y + ((i + 0.5) / n) * h;
    const cx = rnd(seed + i) * TILE_W;
    const w = 40 + rnd(seed + i * 3) * 150;
    const t = 1.2 + rnd(seed + i * 5) * 1.6;
    d += ` M${(cx - w).toFixed(1)} ${cy.toFixed(1)} L${(cx + w).toFixed(1)} ${cy.toFixed(1)}`
      + ` L${(cx + w * 0.86).toFixed(1)} ${(cy + t).toFixed(1)} L${(cx - w * 0.9).toFixed(1)} ${(cy + t).toFixed(1)} Z`;
  }
  return d;
}

// ── PALETTES ─────────────────────────────────────────────────────────────────
//
// Per PLACE, not one global ramp. The references are not equally contrasty:
// epistemology is nearly white with one dark rock in it, logic is white cloud on
// a ruled grey sky, ethics is the starkest of the six. A single five-step ramp
// for all of them is why they used to look like the same picture six times.
//
// Every value is a warm grey off the paper-to-ink ramp the app is already printed
// on — no hue anywhere, per §19.

export interface Palette {
  sky: string;
  cloud: string;
  cloudShade: string;
  far: string;
  mid: string;
  near: string;
  ink: string;
}

// A cloud's SHADE has to be darker than the sky, not merely darker than the
// cloud. It was set a step lighter than the sky on the reasoning that a cloud is
// a bright thing — and the shaded crescent, which by construction lies along the
// silhouette's lower edge where it meets the sky, vanished into that sky
// completely. Two rounds of the contact sheet showed clouds with no volume at all
// before this was spotted. Every `cloudShade` below is now at least a step darker
// than its own `sky`, and the difference is the whole shape.
const PALETTES: Record<string, Palette> = {
  // The great cloud, a ruled sky, one oak on a plain.
  logic: {
    sky: '#CFCABD', cloud: '#FAF8F2', cloudShade: '#B4AE9F',
    far: '#B0AA9C', mid: '#6B6558', near: '#2E2A24', ink: '#1A1A1A',
  },
  // The cloud front over a bare summit. The starkest of the six.
  ethics: {
    sky: '#CBC5B7', cloud: '#F6F3EB', cloudShade: '#A9A394',
    far: '#948E7F', mid: '#6B6558', near: '#1A1A1A', ink: '#1A1A1A',
  },
  // Mist, a pinnacle, a wind-shaped tree. Pale, and almost all air.
  epistemology: {
    sky: '#E9E5DC', cloud: '#FAF8F2', cloudShade: '#C8C2B3',
    far: '#CAC5B8', mid: '#A29C8E', near: '#6B6558', ink: '#4A453C',
  },
  // Moon over a cliff of layered rock, pines on the edge of it.
  metaphysics: {
    sky: '#D4CFC2', cloud: '#F2EEE5', cloudShade: '#ADA798',
    far: '#9A9487', mid: '#6B6558', near: '#1A1A1A', ink: '#1A1A1A',
  },
  // Faceted peaks with lit faces, and water lying under them.
  aesthetics: {
    sky: '#D8D3C8', cloud: '#F7F4EC', cloudShade: '#B5AFA0',
    far: '#B4AEA0', mid: '#7A7466', near: '#22201B', ink: '#1A1A1A',
  },
  // A valley in layers, with a town in the fold of it.
  'political-philosophy': {
    sky: '#CFCABD', cloud: '#F2EFE7', cloudShade: '#B1AB9C',
    far: '#A8A294', mid: '#6B6558', near: '#33302A', ink: '#1A1A1A',
  },
};

export const PLACES = Object.keys(PALETTES);

/**
 * Where an unrecognised slug lands.
 *
 * ONE constant, read by both `paletteFor` and `sceneLayers`, because they used to
 * disagree: the palette fell back to logic while the layer switch's `default:`
 * arm was political philosophy's recipe. An unknown place therefore got logic's
 * sky over political's land — a combination no branch has and nobody would ever
 * have looked at on purpose.
 */
export const FALLBACK_PLACE = 'logic';

export function paletteFor(place: string): Palette {
  return PALETTES[place] ?? PALETTES[FALLBACK_PLACE];
}

/** The slug's own place, or the fallback — the single normalisation both use. */
function placeKey(place: string): string {
  return PALETTES[place] ? place : FALLBACK_PLACE;
}

/** The sky this place is under. Read by BranchWorld for the strip's background. */
export function skyFor(place: string): string {
  return paletteFor(place).sky;
}

// ── WEATHER ──────────────────────────────────────────────────────────────────
//
// The BRANCH decides where you are; the UNIT decides the conditions. Six places
// × five units, from six recipes and five numbers, so a reader walking a whole
// branch is somewhere recognisable that keeps changing — rather than six generic
// scenes that were identical in every branch.

export interface Weather {
  /** How much cloud, as a multiplier on the bank's height and spread. */
  cloud: number;
  mist: boolean;
  birds: boolean;
  disc: { x: number; y: number; r: number };
}

export function weatherFor(unit: number): Weather {
  const u = ((unit % 5) + 5) % 5;
  return {
    cloud: [0.50, 0.86, 1.20, 0.68, 1.02][u],
    mist: u === 2 || u === 4,
    birds: u === 0 || u === 3,
    disc: [
      { x: 0.26, y: 0.17, r: 54 },
      { x: 0.68, y: 0.24, r: 38 },
      { x: 0.40, y: 0.13, r: 64 },
      { x: 0.76, y: 0.30, r: 32 },
      { x: 0.52, y: 0.20, r: 46 },
    ][u],
  };
}

/** The moon or the low sun, if this place has one at all. Behind everything. */
export function discFor(
  place: string, unit: number
): { x: number; y: number; r: number; tone: string; opacity: number } | null {
  // Two of the references are broad daylight and have no disc in them; putting
  // one there anyway is exactly the kind of default that made this look generated.
  if (place === 'logic' || place === 'ethics') return null;
  const w = weatherFor(unit);
  const p = paletteFor(place);
  return { ...w.disc, tone: p.cloud, opacity: place === 'epistemology' ? 0.98 : 0.92 };
}

// ── ASSEMBLY ─────────────────────────────────────────────────────────────────

/** A layer, ready to draw: up to two paths, a parallax rate, and its band. */
export type LayerArt = {
  d: string; tone: string; k: number; top: number; h: number;
  /** The highest point the ART reaches, as opposed to `top`, which is the band
   *  and sits four units above it. The two are easy to confuse and the check for
   *  "nothing dark at his height" confused them, reporting every scrub band four
   *  units too tall. Anything reasoning about where a shape actually is wants
   *  this one. */
  artTop: number;
  /** Drawn first, beneath `d` in the same surface — a shaded face or a lit one. */
  under?: string; underTone?: string;
};

interface Spec {
  tone: string;
  k: number;
  /** Where its mass sits — layers behind it need only be filled to here. */
  baseY: number;
  /** A single object rather than a mass: it covers nothing, and is its own band. */
  solo?: boolean;
  under?: (bottom: number) => string;
  underTone?: string;
  make: (bottom: number) => string;
}

/** Turn declared specs into measured bands. See the header for why. */
function bands(specs: Spec[]): LayerArt[] {
  return specs.map((s, i) => {
    let bottom = TILE_H;
    if (s.solo) {
      bottom = Math.min(TILE_H, s.baseY + 2);
    } else {
      for (let j = i + 1; j < specs.length; j++) {
        if (!specs[j].solo) { bottom = Math.min(TILE_H, specs[j].baseY + 8); break; }
      }
    }
    const d = s.make(bottom);
    const under = s.under ? s.under(bottom) : undefined;
    // MEASURED off the art, both paths, so nothing can be drawn outside its band.
    const artTop = Math.min(measureTop(d), under ? measureTop(under) : Infinity);
    const top = Math.max(0, Math.floor(artTop - 4));
    return {
      d, tone: s.tone, k: s.k, top, artTop, h: Math.max(10, Math.ceil(bottom - top)),
      under, underTone: s.underTone,
    };
  });
}

/**
 * A cloud bank: the shaded mass, with the lit one laid over it OFFSET UP-LEFT.
 *
 * That order is the fix, and the first attempt had it backwards. Drawing the
 * shade offset DOWN-RIGHT puts it outside the cloud's own outline, where it is a
 * drop shadow against the sky rather than a shaded face — so it had to be kept
 * pale enough not to read as one, which made it invisible. Put the shade at the
 * TRUE silhouette and shift the lit mass off it instead, and every grey the shade
 * takes stays inside the cloud. It can then be a real tone, which is the only way
 * a cumulus reads as a solid rather than a cut-out.
 *
 * One light, top-left, and it never moves — the same rule as tone.ts.
 */
function cloudSpec(seed: number, base: number, h: number, w: Weather, p: Palette, k: number): Spec {
  const balls = cumulus(seed, base, h, w.cloud);
  // ── AND THE LIT MASS IS SMALLER, NOT HIGHER ────────────────────────────────
  //
  // Two rounds of contact sheet went by with no visible shading, and the reason
  // is that this mass is FILLED DOWNWARD to the layer in front of it — a cloud
  // here has a top edge and no underside. So a lit copy shifted bodily up-left
  // covers the shade completely, everywhere, by construction: its edge is above
  // the shade's edge at every x, and everything below an edge is filled.
  //
  // What is visible of a downward-filled mass is its top edge and the VALLEYS
  // between its lobes. So each lit ball is pulled in by 12% of its own radius and
  // its centre moved up-left by the same, which leaves the top-left of every lobe
  // exactly on the silhouette — lit — and opens the crevices between them by a
  // quarter of a radius, where the shade shows. That is where a cumulus is dark
  // in every one of the reference engravings.
  const lit = balls.map((b) => ({ x: b.x - b.r * 0.12, y: b.y - b.r * 0.12, r: b.r * 0.88 }));
  return {
    tone: p.cloud, k, baseY: base,
    underTone: p.cloudShade,
    under: (b) => ballMass(balls, base, b),
    make: (b) => ballMass(lit, base, b),
  };
}

/**
 * The six places, at whatever the weather is doing in this unit.
 *
 * Each has its OWN HORIZON and its own layer count. A moor is mostly sky above a
 * low line; a forest closes over you. That difference lives in where each layer's
 * base sits, not only in what stands on it.
 *
 * Nothing is drawn below y 300 that needs to be seen: the ground band covers it.
 */
export function sceneLayers(place: string, unit: number): LayerArt[] {
  const p = paletteFor(place);
  const w = weatherFor(unit);
  const s = (place.length * 17 + unit * 7) % 500;

  switch (placeKey(place)) {
    // -- LOGIC: the great cloud, a ruled sky, one oak on a plain -------------
    case 'logic':
      return bands([
        { tone: p.far, k: 0.03, baseY: 250, solo: true, make: () => hatch(s + 31, 22, 236, 9) },
        cloudSpec(s, 262, 210, w, p, 0.07),
        { tone: p.far, k: 0.16, baseY: 282, make: (b) => downs(s + 5, 282, 20, 5, b) },
        { tone: p.mid, k: 0.30, baseY: 294, make: (b) => treemass(s + 9, 294, 26, 30, b) },
        // The oak is `mid`, not `near`, because it is the one thing on this plain
        // tall enough to stand behind the reader's head.
        { tone: p.mid, k: 0.50, baseY: 300, solo: true, make: () => oak(620, 300, 132, s + 17) },
        { tone: p.near, k: 0.56, baseY: 302, make: (b) => scrub(s + 19, 302, b) },
      ]);

    // -- ETHICS: a cloud front, and a bare summit standing in front of it -----
    case 'ethics':
      return bands([
        ...(w.birds ? [{ tone: p.far, k: 0.05, baseY: 150, solo: true, make: () => birds(s + 21, 118, 3) }] : []),
        cloudSpec(s + 3, 274, 172, w, p, 0.09),
        { tone: p.far, k: 0.18, baseY: 288, make: (b) => crags(s + 7, 288, 54, 5, b) },
        // THE SUMMIT, and it is rock rather than a hill. This was `downs` with two
        // lobes -- one enormous smooth dome filling the bottom third, which is the
        // single most vector-clip-art shape in the whole file. The reference is a
        // broken crag with a figure standing on it.
        { tone: p.mid, k: 0.44, baseY: 302, make: (b) => crags(s + 13, 302, 78, 3, b) },
        { tone: p.far, k: 0.44, baseY: 302, solo: true, make: () => cragLight(s + 13, 302, 78, 3) },
        { tone: p.near, k: 0.56, baseY: 302, make: (b) => scrub(s + 23, 302, b) },
      ]);

    // -- EPISTEMOLOGY: a pinnacle in the mist, and one tree holding on to it --
    case 'epistemology':
      return bands([
        ...(w.birds ? [{ tone: p.mid, k: 0.05, baseY: 150, solo: true, make: () => birds(s + 17, 116, 5) }] : []),
        cloudSpec(s + 5, 250, 128, w, p, 0.08),
        { tone: p.far, k: 0.14, baseY: 286, make: (b) => crags(s + 11, 286, 96, 4, b) },
        {
          tone: p.mid, k: 0.42, baseY: 300, solo: true,
          make: () => spire(430, 300, 46, 118, s + 23) + pine(430, 190, 74, s + 29, 1) + pine(462, 208, 52, s + 31, -1),
        },
        ...(w.mist ? [{ tone: p.cloud, k: 0.26, baseY: 268, solo: true, make: () => mist(s + 37, 252, 15, 5) }] : []),
        { tone: p.near, k: 0.56, baseY: 302, make: (b) => scrub(s + 41, 302, b) },
      ]);

    // -- METAPHYSICS: the moon, a cliff of layered rock, pines on the edge ----
    case 'metaphysics':
      return bands([
        cloudSpec(s + 7, 236, 116, w, p, 0.06),
        { tone: p.far, k: 0.13, baseY: 280, make: (b) => crags(s + 13, 280, 82, 5, b) },
        ...(w.mist ? [{ tone: p.cloud, k: 0.24, baseY: 276, solo: true, make: () => mist(s + 19, 264, 12, 4) }] : []),
        {
          tone: p.mid, k: 0.34, baseY: 302, solo: true,
          // The clifftop, and what is growing out of it -- one shape, so the trees
          // are ON the rock rather than floating near it (rule A1).
          make: () => cliff(700, 302, 210, 64, s + 29)
            + pine(636, 240, 96, s + 31, -1) + pine(712, 244, 72, s + 37, 1) + pine(776, 250, 58, s + 41, 1),
        },
        { tone: p.mid, k: 0.42, baseY: 296, make: (b) => treemass(s + 23, 296, 34, 22, b) },
        { tone: p.near, k: 0.56, baseY: 302, make: (b) => scrub(s + 43, 302, b) },
      ]);

    // -- AESTHETICS: faceted peaks with lit faces, and water under them -------
    case 'aesthetics':
      return bands([
        cloudSpec(s + 11, 226, 104, w, p, 0.07),
        { tone: p.far, k: 0.12, baseY: 274, make: (b) => crags(s + 17, 274, 138, 5, b) },
        { tone: p.cloud, k: 0.12, baseY: 274, solo: true, make: () => cragLight(s + 17, 274, 138, 5) },
        { tone: p.mid, k: 0.30, baseY: 292, make: (b) => treemass(s + 23, 292, 44, 24, b) },
        {
          tone: p.far, k: 0.46, baseY: 306, solo: true,
          // The lake: a light band the near scrub stands in front of, with the
          // peaks' own reflection broken across it.
          make: () => 'M0 292 L' + TILE_W + ' 292 L' + TILE_W + ' 306 L0 306 Z',
          underTone: p.mid,
          under: () => ripples(s + 29, 292, 14, 9),
        },
        { tone: p.near, k: 0.56, baseY: 304, make: (b) => scrub(s + 31, 304, b) },
      ]);

    // -- POLITICAL PHILOSOPHY: a valley in layers, with a town in the fold ----
    case 'political-philosophy':
      return bands([
        ...(w.birds ? [{ tone: p.mid, k: 0.05, baseY: 150, solo: true, make: () => birds(s + 13, 124, 4) }] : []),
        cloudSpec(s + 19, 240, 120, w, p, 0.07),
        { tone: p.far, k: 0.13, baseY: 278, make: (b) => crags(s + 23, 278, 92, 4, b) },
        ...(w.mist ? [{ tone: p.cloud, k: 0.22, baseY: 276, solo: true, make: () => mist(s + 29, 266, 11, 5) }] : []),
        { tone: p.mid, k: 0.28, baseY: 292, make: (b) => treemass(s + 31, 292, 38, 20, b) },
        // The town is `mid` for the same reason the oak is: a roofline stands
        // head-high on someone 43 units tall.
        { tone: p.mid, k: 0.46, baseY: 302, make: (b) => roofs(s + 37, 302, 40, 9, b) },
        { tone: p.near, k: 0.56, baseY: 302, make: (b) => scrub(s + 47, 302, b) },
      ]);

    // Unreachable: `placeKey` has already mapped anything unknown to
    // FALLBACK_PLACE. Present because a switch over a string needs a default,
    // and it returns the fallback's own recipe rather than a different one.
    default:
      return sceneLayers(FALLBACK_PLACE, unit);
  }
}

/**
 * SCRUB -- the dark band at the reader's feet, and the only near-black in any of
 * the six places.
 *
 * LOW BY CONTRACT: nothing here rises above `NEAR_TOP`, the figure's knee, so the
 * darkest tone in the scenery can never be behind his head. What that buys is the
 * thing lightening every layer had thrown away -- a real bottom to the tonal
 * range, so the picture has a floor as well as a sky.
 *
 * Clumps and low rock with gaps between them, not a continuous hedge: a solid
 * band down here would only be a second ground line.
 */
function scrub(seed: number, base: number, bottom: number): string {
  const tall = Math.max(4, base - NEAR_TOP);
  let d = 'M0 ' + bottom + ' L0 ' + base.toFixed(1);
  let x = -20;
  let i = 0;
  while (x < TILE_W + 40) {
    const r = (m: number) => rnd(seed + i * 5.7 + m);
    const w = 12 + r(1) * 30;
    const h = 5 + r(2) * (tall - 5);
    if (r(7) < 0.72) {
      // a clump: three or four rounded masses of different heights, overlapping
      const lobes = 2 + Math.floor(r(3) * 3);
      for (let n = 0; n <= lobes; n++) {
        const lx = x - w + (n / lobes) * w * 2;
        const lh = Math.min(tall, h * (0.45 + r(10 + n) * 0.75));
        const lw = w * (0.30 + r(20 + n) * 0.30);
        d += ' M' + (lx - lw).toFixed(1) + ' ' + (base + 2).toFixed(1)
          + ' Q' + (lx - lw * 0.7).toFixed(1) + ' ' + (base - lh).toFixed(1)
          + ' ' + (lx - lw * 0.1).toFixed(1) + ' ' + (base - lh * 0.94).toFixed(1)
          + ' Q' + (lx + lw * 0.6).toFixed(1) + ' ' + (base - lh).toFixed(1)
          + ' ' + (lx + lw).toFixed(1) + ' ' + (base + 2).toFixed(1) + ' Z';
      }
    } else {
      // or a low broken rock, flat-bottomed and lopsided
      const rh = h * (0.4 + r(4) * 0.4);
      d += ' M' + (x - w * 0.7).toFixed(1) + ' ' + (base + 2).toFixed(1)
        + ' L' + (x - w * 0.4).toFixed(1) + ' ' + (base - rh).toFixed(1)
        + ' L' + (x + w * 0.2).toFixed(1) + ' ' + (base - rh * 0.8).toFixed(1)
        + ' L' + (x + w * 0.6).toFixed(1) + ' ' + (base + 2).toFixed(1) + ' Z';
    }
    x += w * 2 + 24 + rnd(seed + i * 2.9) * 90;
    i++;
  }
  return d + ' L' + TILE_W + ' ' + base.toFixed(1) + ' L' + TILE_W + ' ' + bottom + ' Z';
}

/**
 * A CLIFF — a flat top with a sheer face, cut across by strata.
 *
 * The metaphysics reference is a shelf of rock seen edge-on: level along the top,
 * vertical down the front, with horizontal beds showing in the face. It is the
 * only landform in the six that is mostly straight lines.
 */
function cliff(x: number, base: number, w: number, h: number, seed: number): string {
  const f = (v: number) => v.toFixed(1);
  const top = base - h;
  let d = ` M${f(x - w * 0.5)} ${f(base)}`;
  // the top, stepping down to the left in ledges
  const steps = 4;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const px = x - w * 0.5 + w * t;
    const py = top + (1 - t) * h * 0.30 + (rnd(seed + i) - 0.5) * h * 0.10;
    d += ` L${f(px)} ${f(py)}`;
    if (i < steps) d += ` L${f(px + w / steps * 0.55)} ${f(py)}`;
  }
  d += ` L${f(x + w * 0.5)} ${f(base)} Z`;
  return d;
}

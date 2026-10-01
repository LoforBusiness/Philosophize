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

// ── THE SEVEN SUBJECT ROADS' LANDMARKS (2026-10-01) ─────────────────────────
//
// The owner: "give each road its own scenery, matching what the subject is about.
// Get reference photos." Every shape below was drawn after looking at a photograph
// (`npm run ref`), and each note says what the photograph settled.
//
// All of them are clockwise rectangles, discs and polygons, so a union of them under
// the nonzero rule never cancels into a hole by accident; and none uses an `A` arc,
// for `measureTop`'s sake — an arch is two cubics.

const fx = (v: number) => v.toFixed(1);
/** A clockwise rectangle. */
function box(x: number, y: number, w: number, h: number): string {
  return ` M${fx(x)} ${fx(y)} L${fx(x + w)} ${fx(y)} L${fx(x + w)} ${fx(y + h)} L${fx(x)} ${fx(y + h)} Z`;
}
/** A thin bar from one point to another — a stay, a strut, a strand. */
function bar(x1: number, y1: number, x2: number, y2: number, w: number, w2 = w): string {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const nx = -Math.sin(a), ny = Math.cos(a);
  return ` M${fx(x1 + nx * w / 2)} ${fx(y1 + ny * w / 2)} L${fx(x1 - nx * w / 2)} ${fx(y1 - ny * w / 2)}`
    + ` L${fx(x2 - nx * w2 / 2)} ${fx(y2 - ny * w2 / 2)} L${fx(x2 + nx * w2 / 2)} ${fx(y2 + ny * w2 / 2)} Z`;
}
/** Over the top of a semicircle, from its RIGHT foot to its LEFT one, as two cubics. */
function archOver(cx: number, ys: number, r: number): string {
  const o = r * KAPPA;
  return ` C${fx(cx + r)} ${fx(ys - o)} ${fx(cx + o)} ${fx(ys - r)} ${fx(cx)} ${fx(ys - r)}`
    + ` C${fx(cx - o)} ${fx(ys - r)} ${fx(cx - r)} ${fx(ys - o)} ${fx(cx - r)} ${fx(ys)}`;
}

/**
 * A CYPRESS — the tree of a Greek or Roman hillside: a narrow flame, never a cone.
 * Five or six times taller than it is wide, broadest a third of the way up, and a
 * little lopsided.
 */
function cypress(x: number, base: number, h: number, seed: number): string {
  const w = h * (0.13 + rnd(seed) * 0.04);
  const lean = (rnd(seed + 3) - 0.5) * w * 0.5;
  return ` M${fx(x - w * 0.32)} ${fx(base)}`
    + ` Q${fx(x - w * 1.1)} ${fx(base - h * 0.38)} ${fx(x + lean)} ${fx(base - h)}`
    + ` Q${fx(x + w * 1.0)} ${fx(base - h * 0.42)} ${fx(x + w * 0.34)} ${fx(base)} Z`;
}

/**
 * THE ACROPOLIS. The photographs (from the Philopappos hill) agree: a FLAT-TOPPED
 * rock with sheer walls — the fortification wall is a straight line along its brow
 * — and the Parthenon standing on it as a long low colonnade under a SHALLOW
 * pediment. The rock is returned as `rock`, the temple as `temple`, so the two can
 * be struck in different tones.
 */
function acropolis(x: number, base: number, w: number, h: number): { rock: string; temple: string } {
  const top = base - h;
  const rock = ` M${fx(x - w * 0.62)} ${fx(base)}`
    + ` L${fx(x - w * 0.46)} ${fx(base - h * 0.42)} L${fx(x - w * 0.42)} ${fx(top + 4)}`
    + ` L${fx(x - w * 0.40)} ${fx(top)} L${fx(x + w * 0.38)} ${fx(top - 2)}`
    + ` L${fx(x + w * 0.42)} ${fx(top + 6)} L${fx(x + w * 0.47)} ${fx(base - h * 0.48)}`
    + ` L${fx(x + w * 0.66)} ${fx(base)} Z`;
  // The Parthenon: steps, eight columns showing at this distance, the beam, the gable.
  const tw = w * 0.42, tx = x + w * 0.02, tb = top - 1;
  let temple = box(tx - tw / 2 - 4, tb - 3, tw + 8, 3) + box(tx - tw / 2 - 2, tb - 6, tw + 4, 3);
  const cols = 8, ch = h * 0.42, cw = tw / (cols * 1.9);
  for (let i = 0; i < cols; i++) {
    const cx = tx - tw / 2 + cw / 2 + (i * (tw - cw)) / (cols - 1);
    temple += box(cx - cw / 2, tb - 6 - ch, cw, ch);
  }
  const ent = tb - 6 - ch;
  temple += box(tx - tw / 2 - 2, ent - 5, tw + 4, 5);
  temple += ` M${fx(tx - tw / 2 - 3)} ${fx(ent - 5)} L${fx(tx)} ${fx(ent - 5 - h * 0.11)} L${fx(tx + tw / 2 + 3)} ${fx(ent - 5)} Z`;
  // A second, smaller building further along the brow (the Erechtheion's side).
  temple += box(x - w * 0.30, tb - 10, w * 0.12, 10) + box(x - w * 0.31, tb - 13, w * 0.14, 3);
  return { rock, temple };
}

/** AN OLIVE GROVE — low, round, grey-green crowns on short crooked trunks, in rows. */
function olives(seed: number, base: number, h: number, n: number, bottom: number): string {
  let d = box(0, base, TILE_W, bottom - base);
  const pitch = TILE_W / n;
  for (let i = 0; i < n; i++) {
    const r = (m: number) => rnd(seed + i * 4.7 + m);
    const x = i * pitch + (r(1) - 0.5) * pitch * 0.5;
    const th = h * (0.6 + r(2) * 0.6);
    d += bar(x, base, x + (r(3) - 0.5) * 6, base - th * 0.45, th * 0.10, th * 0.06);
    const cy = base - th * 0.68;
    for (let k = 0; k < 4; k++) d += disc(x + (k - 1.5) * th * 0.24 + (r(5 + k) - 0.5) * 4, cy + (r(9 + k) - 0.5) * th * 0.2, th * (0.22 + r(13 + k) * 0.12));
  }
  return d;
}

/**
 * A WEEPING WILLOW. What every photograph shows and a generic tree never has: the
 * crown is a dome, and from its whole rim the branches HANG in a curtain nearly to
 * the ground, with gaps between the strands that the sky shows through.
 */
function willow(x: number, base: number, h: number, seed: number): string {
  const lean = (rnd(seed) - 0.5) * h * 0.08;
  let d = bar(x, base, x + lean, base - h * 0.52, h * 0.07, h * 0.045);
  d += bar(x + lean, base - h * 0.48, x + lean - h * 0.16, base - h * 0.66, h * 0.03, h * 0.02);
  d += bar(x + lean, base - h * 0.5, x + lean + h * 0.18, base - h * 0.68, h * 0.03, h * 0.02);
  const cx = x + lean, cy = base - h * 0.72, cr = h * 0.25;
  for (let k = 0; k < 5; k++) d += disc(cx + (k - 2) * cr * 0.42, cy - Math.sin((k / 4) * Math.PI) * cr * 0.42, cr * 0.62);
  const n = 15;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const sx = cx - cr * 1.25 + t * cr * 2.5;
    const sy = cy - Math.sin(t * Math.PI) * cr * 0.22 + cr * 0.15;
    const end = base - h * (0.05 + rnd(seed + i * 3) * 0.20) - Math.sin(t * Math.PI) * h * 0.02;
    const sway = (t - 0.5) * cr * 0.5 + (rnd(seed + i * 7) - 0.5) * 4;
    d += bar(sx, sy, sx + sway, end, 5.5, 1.4);
  }
  return d;
}

/** A LOMBARDY POPLAR — the tall narrow tree the lake photographs keep beside the willows. */
function poplar(x: number, base: number, h: number, seed: number): string {
  const w = h * 0.12;
  return bar(x, base, x, base - h * 0.2, w * 0.25, w * 0.2)
    + ` M${fx(x - w * 0.5)} ${fx(base - h * 0.12)} Q${fx(x - w * 1.05)} ${fx(base - h * 0.62)} ${fx(x + (rnd(seed) - 0.5) * w * 0.4)} ${fx(base - h)}`
    + ` Q${fx(x + w * 1.05)} ${fx(base - h * 0.6)} ${fx(x + w * 0.5)} ${fx(base - h * 0.12)} Z`;
}

/**
 * THE CLIMB — one big mountain, its trail cut across the face in switchbacks, and a
 * flag on the summit. The switchback photographs show the trail as a pale scar
 * zig-zagging up a slope at a shallow angle, each leg overlapping the one below.
 * Returned as the mountain, and the lighter marks on it (trail, snow, flag).
 */
function climb(x: number, base: number, w: number, h: number, seed: number): { peak: string; marks: string } {
  const top = base - h;
  const pts: [number, number][] = [
    [x - w * 0.62, base], [x - w * 0.40, base - h * 0.38], [x - w * 0.30, base - h * 0.44],
    [x - w * 0.14, base - h * 0.76], [x - w * 0.06, base - h * 0.80], [x, top],
    [x + w * 0.08, base - h * 0.88], [x + w * 0.22, base - h * 0.62], [x + w * 0.30, base - h * 0.60],
    [x + w * 0.62, base],
  ];
  let peak = ` M${fx(pts[0][0])} ${fx(pts[0][1])}`;
  for (const [px, py] of pts.slice(1)) peak += ` L${fx(px)} ${fx(py)}`;
  peak += ' Z';
  // Snow on the summit, lit side only.
  let marks = ` M${fx(x)} ${fx(top)} L${fx(x + w * 0.045)} ${fx(top + h * 0.066)} L${fx(x + w * 0.03)} ${fx(top + h * 0.10)}`
    + ` L${fx(x + w * 0.012)} ${fx(top + h * 0.075)} L${fx(x - w * 0.004)} ${fx(top + h * 0.12)} L${fx(x - w * 0.02)} ${fx(top + h * 0.085)}`
    + ` L${fx(x - w * 0.036)} ${fx(top + h * 0.13)} L${fx(x - w * 0.048)} ${fx(top + h * 0.15)} Z`;
  // The switchbacks. Each turn is placed INSIDE the mountain at its own height —
  // read off the outline — so a leg can never run out past the slope into the sky.
  const edgeAt = (y: number, side: 1 | -1) => {
    const run = side < 0 ? pts.slice(0, 6) : pts.slice(5).reverse();
    for (let k = 0; k < run.length - 1; k++) {
      const [ax, ay] = run[k], [bx, by] = run[k + 1];
      if ((y <= ay && y >= by) || (y >= ay && y <= by)) return ax + ((y - ay) / (by - ay || 1)) * (bx - ax);
    }
    return x;
  };
  const legs = 6;
  let py = base - h * 0.05;
  let px = x + (edgeAt(py, -1) - x) * 0.55;
  for (let i = 0; i < legs; i++) {
    const ny = base - h * ((i + 1) / (legs + 1)) * 0.80 - h * 0.05;
    const side = i % 2 === 0 ? 1 : -1;
    const nx = x + (edgeAt(ny, side) - x) * 0.62;
    marks += bar(px, py, nx, ny, 2.2);
    px = nx; py = ny;
  }
  // The flag: a pole and a pennant, just off the summit.
  marks += bar(x + 3, top + 2, x + 3, top - 18, 1.8) + ` M${fx(x + 4)} ${fx(top - 18)} L${fx(x + 17)} ${fx(top - 14)} L${fx(x + 4)} ${fx(top - 10)} Z`;
  void seed;
  return { peak, marks };
}

/**
 * MAIN STREET — two- and three-storey shopfronts. From the downtown photographs:
 * every frontage is its own height and its own roofline (a flat parapet with a
 * cornice, a stepped false front, a little pediment), each has an AWNING over the
 * shop window at the same height, and one in a few hangs a sign out sideways.
 * Returned as the buildings and their windows, struck lighter.
 */
function mainStreet(seed: number, base: number, h: number, bottom: number): { fronts: string; windows: string } {
  let fronts = box(0, base, TILE_W, bottom - base);
  let windows = '';
  let x = -20;
  let i = 0;
  while (x < TILE_W + 20) {
    const r = (m: number) => rnd(seed + i * 6.1 + m);
    const bw = 64 + r(1) * 56;
    const bh = h * (0.62 + r(2) * 0.55);
    const top = base - bh;
    fronts += box(x, top, bw, bh);
    const kind = Math.floor(r(3) * 3);
    if (kind === 0) fronts += box(x - 3, top - 5, bw + 6, 5);                                   // a cornice
    else if (kind === 1) fronts += box(x + bw * 0.2, top - 9, bw * 0.6, 9) + box(x + bw * 0.38, top - 15, bw * 0.24, 6); // stepped
    else fronts += ` M${fx(x + bw * 0.25)} ${fx(top)} L${fx(x + bw * 0.5)} ${fx(top - 12)} L${fx(x + bw * 0.75)} ${fx(top)} Z`; // pediment
    // The awning: out past the facade, its front edge scalloped.
    const ay = base - 26;
    let aw = ` M${fx(x + 3)} ${fx(ay - 7)} L${fx(x + bw - 3)} ${fx(ay - 7)} L${fx(x + bw + 4)} ${fx(ay + 3)}`;
    const sc = 5;
    for (let k = sc; k > 0; k--) {
      const ax1 = x - 4 + ((bw + 8) * k) / sc, ax0 = x - 4 + ((bw + 8) * (k - 1)) / sc;
      aw += ` Q${fx((ax0 + ax1) / 2)} ${fx(ay + 9)} ${fx(ax0)} ${fx(ay + 3)}`;
    }
    fronts += aw + ' Z';
    // The shop window under the awning, and the upper floors' tall windows.
    windows += box(x + bw * 0.12, ay + 6, bw * 0.48, base - ay - 9) + box(x + bw * 0.68, ay + 6, bw * 0.16, base - ay - 6);
    const floors = bh > h * 0.95 ? 2 : 1;
    const cols = bw > 90 ? 4 : 3;
    for (let fl = 0; fl < floors; fl++) {
      const wy = ay - 22 - fl * 24;
      if (wy < top + 6) break;
      for (let c = 0; c < cols; c++) windows += box(x + bw * (0.12 + (c * 0.76) / cols) + 2, wy, bw * 0.76 / cols - 6, 14);
    }
    // A sign hung out sideways from one front in three.
    if (r(7) < 0.34) fronts += box(x + bw - 2, ay - 40, 4, 6) + box(x + bw + 2, ay - 46, 10, 30);
    x += bw + 2 + r(8) * 6;
    i++;
  }
  return { fronts, windows };
}

/** A FAR SKYLINE — towers of different heights, a few with a stepped crown or a mast. */
function skyline(seed: number, base: number, h: number, bottom: number): string {
  let d = box(0, base, TILE_W, bottom - base);
  let x = -10, i = 0;
  while (x < TILE_W + 10) {
    const r = (m: number) => rnd(seed + i * 3.3 + m);
    const w = 22 + r(1) * 36;
    const th = h * (0.25 + r(2) * 0.75);
    d += box(x, base - th, w, th);
    if (r(3) < 0.3) d += box(x + w * 0.2, base - th - 10, w * 0.6, 10);
    if (r(4) < 0.2) d += box(x + w * 0.48, base - th - 26, 2, 26);
    x += w + r(5) * 14;
    i++;
  }
  return d;
}

/**
 * A SHIP-TO-SHORE CRANE, seen side on. The port photographs: two legs and a portal
 * beam, an A-frame rising above them, and the long BOOM run out horizontally over
 * the water with stays from the apex to its tip — the shape that says harbour from
 * a mile off. `out` is which way the boom points (−1 left, over the water).
 */
function gantry(x: number, base: number, h: number, out: number): string {
  const legs = h * 0.22, beam = base - h * 0.52, boomY = base - h * 0.64, apex = base - h;
  let d = bar(x - legs, base, x - legs, beam, 4) + bar(x + legs, base, x + legs, beam, 4);
  d += bar(x - legs * 1.05, base, x + legs * 0.1, beam, 2.5) + bar(x + legs * 1.05, base, x - legs * 0.1, beam, 2.5);
  d += box(x - legs - 4, beam - 6, legs * 2 + 8, 7);
  d += bar(x - legs * 0.7, beam, x, apex, 3.5) + bar(x + legs * 0.7, beam, x, apex, 3.5);
  const tip = x + out * h * 1.05, back = x - out * h * 0.38;
  d += box(Math.min(tip, back), boomY - 3, Math.abs(tip - back), 6);
  d += bar(x, apex, tip, boomY - 2, 1.6) + bar(x, apex, back, boomY - 2, 1.6) + bar(x, apex, x + out * h * 0.5, boomY - 2, 1.4);
  d += box(x + out * h * 0.18 - 9, boomY - 14, 18, 11);       // the trolley's cab
  return d;
}

/** A CONTAINER SHIP — a long low hull, the bow raised, containers stacked, the bridge aft. */
function ship(x: number, water: number, len: number): { hull: string; gaps: string } {
  const hh = len * 0.07;
  let hull = ` M${fx(x - len / 2)} ${fx(water - hh)} L${fx(x + len / 2 - len * 0.06)} ${fx(water - hh)}`
    + ` L${fx(x + len / 2)} ${fx(water - hh * 1.5)} L${fx(x + len / 2 - len * 0.04)} ${fx(water + 2)}`
    + ` L${fx(x - len / 2 + len * 0.03)} ${fx(water + 2)} Z`;
  // The bridge, aft, and a funnel.
  hull += box(x - len / 2 + len * 0.04, water - hh - len * 0.13, len * 0.07, len * 0.13);
  hull += box(x - len / 2 + len * 0.025, water - hh - len * 0.15, len * 0.10, len * 0.03);
  let gaps = '';
  const cw = len * 0.055, chh = len * 0.032;
  for (let c = 0; c < 12; c++) {
    const cx = x - len / 2 + len * 0.14 + c * (cw + 1.2);
    const tiers = 2 + ((c * 7) % 3);
    hull += box(cx, water - hh - chh * tiers, cw, chh * tiers);
    for (let t = 1; t < tiers; t++) gaps += box(cx, water - hh - chh * t - 0.6, cw, 1.2);
  }
  gaps += box(x - len / 2 + len * 0.05, water - hh - len * 0.12, len * 0.05, 3);
  return { hull, gaps };
}

/**
 * AN OBSERVATORY — the dome on a drum, from the mountain-observatory photographs:
 * a hemisphere a little wider than the drum it sits on, with the SLIT running up
 * over the top. Returned as the building and the slit (drawn lighter).
 */
function observatory(x: number, base: number, r: number): { body: string; slit: string } {
  const drum = r * 0.9;
  let body = box(x - r * 0.9, base - drum, r * 1.8, drum) + box(x + r * 0.7, base - drum * 0.6, r * 1.3, drum * 0.6);
  const o = r * KAPPA, cy = base - drum;
  body += ` M${fx(x - r)} ${fx(cy)} C${fx(x - r)} ${fx(cy - o)} ${fx(x - o)} ${fx(cy - r)} ${fx(x)} ${fx(cy - r)}`
    + ` C${fx(x + o)} ${fx(cy - r)} ${fx(x + r)} ${fx(cy - o)} ${fx(x + r)} ${fx(cy)} Z`;
  const slit = ` M${fx(x - r * 0.08)} ${fx(cy - r * 0.99)} L${fx(x + r * 0.10)} ${fx(cy - r * 0.99)} L${fx(x + r * 0.14)} ${fx(cy - r * 0.2)} L${fx(x - r * 0.12)} ${fx(cy - r * 0.2)} Z`
    + ` M${fx(x - r * 0.9)} ${fx(cy - r * 0.08)} L${fx(x + r * 0.9)} ${fx(cy - r * 0.08)} L${fx(x + r * 0.9)} ${fx(cy)} L${fx(x - r * 0.9)} ${fx(cy)} Z`;
  return { body, slit };
}

/**
 * A RADIO TELESCOPE — "The Dish": a shallow bowl tipped up toward the sky on an
 * A-frame of lattice, with a tripod holding the feed out in front of it.
 */
function radioDish(x: number, base: number, s: number): { frame: string; face: string } {
  let d = bar(x - s * 0.55, base, x - s * 0.05, base - s * 0.62, 4) + bar(x + s * 0.55, base, x + s * 0.05, base - s * 0.62, 4);
  d += bar(x - s * 0.36, base - s * 0.22, x + s * 0.36, base - s * 0.22, 2.5);
  d += bar(x - s * 0.5, base - s * 0.08, x + s * 0.14, base - s * 0.5, 1.8) + bar(x + s * 0.5, base - s * 0.08, x - s * 0.14, base - s * 0.5, 1.8);
  // The bowl, tipped back toward the sky. Seen from the side a dish is an ELLIPSE —
  // its rim — and the near half of the concave face catches the light, which is
  // the whole difference between a dish and a fin.
  const cx = x - s * 0.04, cy = base - s * 0.80, R = s * 0.50, a = -0.62;
  d += ellipseAt(cx, cy, R, R * 0.36, a);
  const fx0 = cx + Math.sin(-a) * R * 0.62, fy0 = cy - Math.cos(-a) * R * 0.62;
  d += bar(cx - Math.cos(a) * R * 0.7, cy - Math.sin(a) * R * 0.7, fx0, fy0, 1.4)
    + bar(cx + Math.cos(a) * R * 0.7, cy + Math.sin(a) * R * 0.7, fx0, fy0, 1.4) + disc(fx0, fy0, 3);
  return { frame: d, face: ellipseAt(cx + 1.5, cy + 1.5, R * 0.84, R * 0.24, a) };
}

/** An ellipse turned by `a` radians, as four cubics, clockwise. */
function ellipseAt(cx: number, cy: number, rx: number, ry: number, a: number): string {
  const ca = Math.cos(a), sa = Math.sin(a);
  const P = (u: number, v: number) => `${fx(cx + u * ca - v * sa)} ${fx(cy + u * sa + v * ca)}`;
  const ox = rx * KAPPA, oy = ry * KAPPA;
  return ` M${P(-rx, 0)} C${P(-rx, -oy)} ${P(-ox, -ry)} ${P(0, -ry)} C${P(ox, -ry)} ${P(rx, -oy)} ${P(rx, 0)}`
    + ` C${P(rx, oy)} ${P(ox, ry)} ${P(0, ry)} C${P(-ox, ry)} ${P(-rx, oy)} ${P(-rx, 0)} Z`;
}


/** A WIND TURBINE — a tapering tower, a nacelle, three long thin blades. */
function turbine(x: number, base: number, h: number, turn: number): string {
  let d = bar(x, base, x, base - h, h * 0.045, h * 0.022);
  d += box(x - h * 0.03, base - h - h * 0.025, h * 0.08, h * 0.05);
  for (let k = 0; k < 3; k++) {
    const a = turn + (k * Math.PI * 2) / 3;
    d += bar(x, base - h, x + Math.cos(a) * h * 0.46, base - h + Math.sin(a) * h * 0.46, h * 0.035, h * 0.008);
  }
  return d + disc(x, base - h, h * 0.03);
}

/**
 * THE AQUEDUCT — the Pont du Gard, which every photograph agrees on: THREE TIERS,
 * the lower two of big round arches stacked pier on pier, the top one a long row
 * of small arches carrying the channel. Each tier is one outline whose lower edge
 * dips down every pier and up over every arch, so the sky shows through them.
 */
function aqueduct(x0: number, x1: number, base: number): string {
  const tier = (y0: number, y1: number, n: number, pier: number) => {
    const bay = (x1 - x0) / n;
    let d = ` M${fx(x0)} ${fx(y0)} L${fx(x1)} ${fx(y0)} L${fx(x1)} ${fx(y1)}`;
    for (let k = n - 1; k >= 0; k--) {
      const l = x0 + k * bay, r = l + bay;
      const half = (bay - pier) / 2, cx = (l + r) / 2;
      const spring = y0 + (y1 - y0) * 0.32 + half;
      d += ` L${fx(r - pier / 2)} ${fx(y1)} L${fx(cx + half)} ${fx(spring)}` + archOver(cx, spring, half) + ` L${fx(l + pier / 2)} ${fx(y1)}`;
    }
    return d + ` L${fx(x0)} ${fx(y1)} Z`;
  };
  const span = x1 - x0;
  const big = Math.max(3, Math.round(span / 70));
  return tier(base - 54, base, big, 12)
    + tier(base - 100, base - 54, big, 10)
    + tier(base - 116, base - 100, big * 3, 4);
}

/**
 * A CASTLE RUIN on its hill — from the Castle Roche photograph: a ragged curtain
 * wall along the crest with a gap broken in it, and one square keep standing taller
 * with its crenellations half gone.
 */
function castleRuin(x: number, base: number, w: number, h: number): string {
  let d = ` M${fx(x - w)} ${fx(base)} Q${fx(x - w * 0.4)} ${fx(base - h * 0.55)} ${fx(x)} ${fx(base - h * 0.6)} Q${fx(x + w * 0.45)} ${fx(base - h * 0.55)} ${fx(x + w)} ${fx(base)} Z`;
  const crest = base - h * 0.58;
  // the curtain wall, broken in the middle
  d += box(x - w * 0.42, crest - h * 0.22, w * 0.30, h * 0.22) + box(x + w * 0.05, crest - h * 0.16, w * 0.30, h * 0.16);
  for (let k = 0; k < 5; k++) d += box(x - w * 0.42 + k * w * 0.065, crest - h * 0.28, w * 0.035, h * 0.06);
  // the keep
  d += box(x + w * 0.16, crest - h * 0.52, w * 0.16, h * 0.52);
  for (let k = 0; k < 3; k++) if (k !== 1) d += box(x + w * 0.16 + k * w * 0.06, crest - h * 0.60, w * 0.04, h * 0.08);
  return d;
}

// ── PALETTES ─────────────────────────────────────────────────────────────────
//
// Per PLACE, not one global ramp. The references are not equally contrasty:
// epistemology is nearly white with one dark rock in it, logic is white cloud on
// a ruled grey sky, ethics is the starkest of the six. A single five-step ramp
// for all of them is why they used to look like the same picture six times.
//
// ── AND EVERY PLACE IS IN THE OWNER'S PALETTE NOW (2026-09-26) ─────────────
//
// Every value used to be a warm grey off the paper-to-ink ramp, "no hue
// anywhere, per §19". That was the rule while the whole app was black ink on
// warm paper; it stopped being the app's rule when the owner chose six swatches
// (§7) and asked for the beige-and-gold look to go from every surface. A road
// of warm greys under a teal tab bar was the last big sheet of it.
//
// So each place is its BRANCH's hue (constants/design.ts BRANCH), walked toward
// paper for the sky and the far hills and toward ink for the near scrub:
//   sky  = hue 16% into paper      cloudShade = 34%     far = 42%     mid = 66%
//   near = hue 42% into ink        cloud = paper lifted toward white
//   earth = the hue itself, the ground band under the ink turf
// — except aesthetics, whose branch hue is a bronze and would come back as the
// exact gold wash being removed. It is a sunset instead, as its first lesson is:
// a blush of the palette's ember in the sky (the spark, kept to the lightest
// tint, never a mass), olive hills, a teal middle distance and a deep floor.
//
// AND ONLY ONE SKY IS BLUE. The owner asked for the pale blues to be seen less
// (2026-09-26): three pale blue-green skies in a row read as one colour used
// everywhere. Logic keeps its pale slate sky; epistemology's mist and
// metaphysics' dusk are warm-grey tints of the palette's sage and olive instead,
// and their hills keep the branch hue lower down, where it is smaller.
//
// This file keeps its ZERO imports (§17), so the values are literals, derived
// once from tone.ts's `mix` rather than typed by eye. Everything that stands above
// his knee still clears 5:1 against the ink figure — check:walk §9 measures it —
// and the old personalities survive in the contrast: ethics keeps the darkest
// floor of the six.

export interface Palette {
  sky: string;
  cloud: string;
  cloudShade: string;
  far: string;
  mid: string;
  near: string;
  ink: string;
  /** The body of the ground under the ink turf — the branch hue at full depth. */
  earth: string;
}

// A cloud's SHADE has to be darker than the sky, not merely darker than the
// cloud. It was set a step lighter than the sky on the reasoning that a cloud is
// a bright thing — and the shaded crescent, which by construction lies along the
// silhouette's lower edge where it meets the sky, vanished into that sky
// completely. Two rounds of the contact sheet showed clouds with no volume at all
// before this was spotted. Every `cloudShade` below is now at least a step darker
// than its own `sky`, and the difference is the whole shape.
const PALETTES: Record<string, Palette> = {
  // The great cloud, a ruled sky, one oak on a plain. Slate blue.
  logic: {
    sky: '#DAE2E3', cloud: '#FDFDFC', cloudShade: '#B6C7CD',
    far: '#A6BBC3', mid: '#7797A5', near: '#294552', ink: '#1A1A1A', earth: '#33647B',
  },
  // The cloud front over a bare summit. The starkest of the six. Olive.
  ethics: {
    sky: '#E2E4DC', cloud: '#FDFDFC', cloudShade: '#C7CABE',
    far: '#BBBFB1', mid: '#989E89', near: '#1F2319', ink: '#1A1A1A', earth: '#656E50',
  },
  // Mist, a pinnacle, a wind-shaped tree. Pale, and almost all air. Teal.
  epistemology: {
    sky: '#EBECE6', cloud: '#FDFDFC', cloudShade: '#CDD0C4',
    far: '#B4BCB3', mid: '#819F99', near: '#314C48', ink: '#1A1A1A', earth: '#427069',
  },
  // Moon over a cliff of layered rock, pines on the edge of it. Deep teal.
  metaphysics: {
    sky: '#E3E3DA', cloud: '#FDFDFC', cloudShade: '#C3C5B6',
    far: '#A9B1A6', mid: '#739194', near: '#264043', ink: '#1A1A1A', earth: '#2E5B61',
  },
  // Faceted peaks with lit faces, and water lying under them. A sunset.
  aesthetics: {
    sky: '#F6EAE4', cloud: '#FDFDFC', cloudShade: '#F1D5C9',
    far: '#B7B8AF', mid: '#849E9A', near: '#273B3B', ink: '#1A1A1A', earth: '#5E6352',
  },
  // A valley in layers, with a town in the fold of it. Sienna.
  'political-philosophy': {
    sky: '#EAE1DC', cloud: '#FDFDFC', cloudShade: '#D7C5BD',
    far: '#CFB8B0', mid: '#B69287', near: '#604138', ink: '#1A1A1A', earth: '#8A5A4B',
  },

  // ── THE SEVEN SUBJECT ROADS (2026-10-01) ─────────────────────────────────
  //
  // Each from its road's hue (constants/design.ts BRANCH) by the same walk as the
  // six above — far 40% into paper, mid 62%, near 42% into ink — every mid clearing
  // 5:1 against the ink figure. The SKIES are tinted apart on purpose, so seven
  // roads are not seven pale blues: a blush over Greece, lilac over the lake, a
  // green morning on the climb, a warm street, harbour blue, mint over the
  // observatory and a rose-stone afternoon over the aqueduct.
  //
  // Philosophy: the Acropolis on its rock, olive groves and cypresses. Slate teal.
  philosophy: {
    sky: '#F1E7E0', cloud: '#FDFDFC', cloudShade: '#DCCFC6',
    far: '#ACB6B9', mid: '#809198', near: '#2A3A41', ink: '#1A1A1A', earth: '#36515D',
  },
  // Psychology: a still lake at dusk, willows and poplars along it. Dusk slate.
  psychology: {
    sky: '#E5E1EA', cloud: '#FDFDFC', cloudShade: '#CBC6D6',
    far: '#BABAC7', mid: '#9797AC', near: '#3F3F54', ink: '#1A1A1A', earth: '#5A5A7E',
  },
  // Personal growth: a mountain climbed by switchbacks, and trees growing up beside the road. Moss.
  'personal-growth': {
    sky: '#E7EADC', cloud: '#FDFDFC', cloudShade: '#CDD1BC',
    far: '#BEC1AC', mid: '#9CA283', near: '#444A2E', ink: '#1A1A1A', earth: '#636C3C',
  },
  // Business: main street, shopfronts with awnings, a skyline behind. Bronze.
  business: {
    sky: '#E9E3D8', cloud: '#FDFDFC', cloudShade: '#D3CABB',
    far: '#C6BAA7', mid: '#A9977C', near: '#513F27', ink: '#1A1A1A', earth: '#785A30',
  },
  // Economics: a container port — gantry cranes, a ship, the quay. Navy.
  economics: {
    sky: '#DCE3E8', cloud: '#FDFDFC', cloudShade: '#BDC8D2',
    far: '#AAB6C2', mid: '#7F91A5', near: '#293A4D', ink: '#1A1A1A', earth: '#335172',
  },
  // Science: an observatory on its hill, a radio dish, wind turbines. Lab teal.
  science: {
    sky: '#E0E9E3', cloud: '#FDFDFC', cloudShade: '#BFD2CC',
    far: '#A9C2C2', mid: '#7DA4A5', near: '#274B4D', ink: '#1A1A1A', earth: '#306F72',
  },
  // History: an aqueduct across the valley, a castle ruin on the hill. Brick.
  history: {
    sky: '#EBE3DF', cloud: '#FDFDFC', cloudShade: '#DAC9C3',
    far: '#D0B9B1', mid: '#B8958B', near: '#5E3D35', ink: '#1A1A1A', earth: '#905748',
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

/**
 * Which place a unit belongs to, read off its own id.
 *
 * Unit ids are branch-prefixed — `metaphysics-being-and-non-being` — so the road
 * can work out what country it is in without being told. That matters because
 * the alternative is a prop threaded from the branch screen, and a prop that is
 * merely FORGOTTEN gives every branch the same scenery, silently and everywhere.
 * A screen may still pass `place` and it wins; this is the floor under it.
 *
 * Longest match, because `political-philosophy` is itself hyphenated and a
 * shortest-match scan would stop at `political`.
 */
export function placeFromUnitId(unitId: string): string {
  let best = '';
  for (const p of PLACES) {
    if (unitId.startsWith(p + '-') && p.length > best.length) best = p;
  }
  return best;
}

/** The earth this place's road is cut through. Read by BranchWorld's ground band. */
export function earthFor(place: string): string {
  return paletteFor(place).earth;
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

const SUBJECT_LIGHT: Record<string, { x: number; y: number; r: number } | null> = {
  philosophy: { x: 0.80, y: 0.30, r: 46 },
  psychology: { x: 0.70, y: 0.18, r: 22 },
  'personal-growth': { x: 0.86, y: 0.36, r: 40 },
  business: null,
  economics: { x: 0.18, y: 0.16, r: 34 },
  science: { x: 0.80, y: 0.14, r: 20 },
  history: { x: 0.74, y: 0.22, r: 50 },
};

/** The moon or the low sun, if this place has one at all. Behind everything. */
export function discFor(
  place: string, unit: number
): { x: number; y: number; r: number; tone: string; opacity: number } | null {
  // Two of the references are broad daylight and have no disc in them; putting
  // one there anyway is exactly the kind of default that made this look generated.
  if (place === 'logic' || place === 'ethics') return null;
  const w = weatherFor(unit);
  const p = paletteFor(place);
  // THE SEVEN SUBJECT ROADS each have their own light, so seven roads are not one
  // white sun in one corner: a low sun beside the Acropolis, a small moon over the
  // lake, the sun behind the climb, the harbour's high hazy one, a moon over the
  // observatory, an afternoon sun over the aqueduct. Main Street is noon, and has none.
  const own = SUBJECT_LIGHT[place];
  if (own !== undefined) return own && { ...own, tone: p.cloud, opacity: 0.92 };
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

    // -- PHILOSOPHY: the Acropolis on its rock, olive groves, cypresses ---------
    case 'philosophy': {
      const a = acropolis(170, 282, 250, 78);
      return bands([
        ...(w.birds ? [{ tone: p.far, k: 0.05, baseY: 150, solo: true, make: () => birds(s + 3, 110, 3) }] : []),
        cloudSpec(s + 5, 276, 118, w, p, 0.05),
        { tone: p.far, k: 0.08, baseY: 286, make: (b) => downs(s + 7, 286, 30, 4, b) },
        { tone: p.cloud, k: 0.10, baseY: 282, solo: true, underTone: p.far, under: () => a.rock, make: () => a.temple },
        { tone: p.mid, k: 0.30, baseY: 294, make: (b) => olives(s + 11, 294, 30, 16, b) },
        {
          tone: p.mid, k: 0.46, baseY: 300, solo: true,
          make: () => cypress(110, 300, 118, s + 13) + cypress(142, 300, 86, s + 17) + cypress(470, 300, 104, s + 19)
            + cypress(500, 300, 70, s + 21) + cypress(800, 300, 122, s + 25) + cypress(836, 300, 92, s + 27),
        },
        { tone: p.near, k: 0.56, baseY: 302, make: (b) => scrub(s + 23, 302, b) },
      ]);
    }

    // -- PSYCHOLOGY: a still lake at dusk, willows and poplars on its bank ----
    case 'psychology':
      return bands([
        cloudSpec(s + 3, 266, 104, w, p, 0.05),
        { tone: p.far, k: 0.12, baseY: 270, make: (b) => downs(s + 5, 270, 26, 3, b) },
        { tone: p.far, k: 0.16, baseY: 274, make: (b) => treemass(s + 9, 274, 20, 34, b) },
        {
          // The lake: still water the whole width, the far bank's line broken across it.
          tone: p.cloud, k: 0.20, baseY: 296, solo: true,
          make: () => 'M0 264 L' + TILE_W + ' 264 L' + TILE_W + ' 268 L0 268 Z' + ripples(s + 13, 272, 22, 14),
          underTone: p.far, under: () => 'M0 264 L' + TILE_W + ' 264 L' + TILE_W + ' 296 L0 296 Z',
        },
        ...(w.mist ? [{ tone: p.cloud, k: 0.22, baseY: 280, solo: true, make: () => mist(s + 17, 276, 9, 4) }] : []),
        {
          tone: p.mid, k: 0.42, baseY: 300, solo: true,
          make: () => willow(96, 300, 130, s + 19) + poplar(292, 300, 128, s + 23) + poplar(318, 300, 96, s + 29)
            + willow(470, 300, 112, s + 31) + willow(800, 300, 124, s + 33) + poplar(660, 300, 110, s + 37),
        },
        { tone: p.near, k: 0.56, baseY: 302, make: (b) => scrub(s + 37, 302, b) },
      ]);

    // -- PERSONAL GROWTH: the climb, and trees growing up beside the road -----
    case 'personal-growth': {
      const c = climb(300, 284, 420, 196, s + 3);
      return bands([
        ...(w.birds ? [{ tone: p.mid, k: 0.05, baseY: 150, solo: true, make: () => birds(s + 7, 70, 3) }] : []),
        cloudSpec(s + 9, 274, 90, w, p, 0.04),
        { tone: p.far, k: 0.06, baseY: 284, make: (b) => crags(s + 11, 284, 70, 6, b) },
        { tone: p.cloud, k: 0.09, baseY: 284, solo: true, underTone: p.mid, under: () => c.peak, make: () => c.marks },
        { tone: p.far, k: 0.26, baseY: 294, make: (b) => downs(s + 13, 294, 16, 5, b) },
        {
          // Growth, said once along the road: a seedling, a sapling, a young tree, a grown one.
          tone: p.mid, k: 0.44, baseY: 300, solo: true,
          make: () => oak(120, 300, 24, s + 17) + oak(330, 300, 52, s + 19) + oak(560, 300, 84, s + 23) + oak(820, 300, 128, s + 29),
        },
        { tone: p.near, k: 0.56, baseY: 302, make: (b) => scrub(s + 31, 302, b) },
      ]);
    }

    // -- BUSINESS: main street, its shopfronts and awnings, a skyline behind --
    case 'business': {
      const m = mainStreet(s + 7, 298, 96, TILE_H);
      return bands([
        cloudSpec(s + 3, 262, 110, w, p, 0.05),
        { tone: p.far, k: 0.12, baseY: 270, make: (b) => skyline(s + 5, 270, 120, b) },
        { tone: p.far, k: 0.32, baseY: 298, underTone: p.mid, under: () => m.fronts, make: () => m.windows },
        { tone: p.near, k: 0.56, baseY: 302, make: (b) => scrub(s + 11, 302, b) },
      ]);
    }

    // -- ECONOMICS: the container port — cranes over the water, a ship, the quay
    case 'economics': {
      const sh = ship(260, 288, 280);
      return bands([
        ...(w.birds ? [{ tone: p.mid, k: 0.05, baseY: 150, solo: true, make: () => birds(s + 3, 96, 4) }] : []),
        cloudSpec(s + 5, 256, 100, w, p, 0.05),
        { tone: p.far, k: 0.10, baseY: 262, make: (b) => skyline(s + 7, 262, 54, b) },
        {
          tone: p.sky, k: 0.18, baseY: 292, solo: true,
          make: () => 'M0 262 L' + TILE_W + ' 262 L' + TILE_W + ' 292 L0 292 Z',
          underTone: p.far, under: () => ripples(s + 9, 266, 22, 12),
        },
        { tone: p.far, k: 0.22, baseY: 292, solo: true, underTone: p.mid, under: () => sh.hull, make: () => sh.gaps },
        {
          tone: p.mid, k: 0.40, baseY: 300, solo: true,
          make: () => box(0, 292, TILE_W, 8) + gantry(240, 296, 150, -1) + gantry(560, 296, 132, -1) + gantry(880, 296, 144, -1),
        },
        { tone: p.near, k: 0.56, baseY: 302, make: (b) => scrub(s + 13, 302, b) },
      ]);
    }

    // -- SCIENCE: an observatory on its hill, a radio dish, wind turbines -----
    case 'science': {
      const o1 = observatory(78, 268, 30), o2 = observatory(150, 270, 20);
      const dishA = radioDish(430, 300, 96), dishB = radioDish(760, 300, 80);
      return bands([
        ...(w.birds ? [{ tone: p.mid, k: 0.05, baseY: 150, solo: true, make: () => birds(s + 3, 92, 3) }] : []),
        cloudSpec(s + 5, 264, 100, w, p, 0.05),
        {
          tone: p.far, k: 0.10, baseY: 272,
          make: (b) => downs(s + 7, 272, 34, 3, b) + turbine(60, 254, 92, 0.3) + turbine(420, 258, 74, 1.4) + turbine(520, 252, 86, 2.2) + turbine(860, 256, 80, 0.9),
        },
        {
          // The observatory's hill: one long rise, the domes along its crest.
          tone: p.cloud, k: 0.12, baseY: 290, solo: true, underTone: p.mid,
          under: () => ` M0 290 L0 272 Q80 262 160 266 Q260 270 330 290 Z` + o1.body + o2.body,
          make: () => o1.slit + o2.slit,
        },
        { tone: p.far, k: 0.30, baseY: 300, solo: true, underTone: p.mid, under: () => dishA.frame + dishB.frame, make: () => dishA.face + dishB.face },
        { tone: p.near, k: 0.56, baseY: 302, make: (b) => scrub(s + 11, 302, b) },
      ]);
    }

    // -- HISTORY: an aqueduct across the valley, a castle ruin on the hill ----
    case 'history':
      return bands([
        ...(w.birds ? [{ tone: p.mid, k: 0.05, baseY: 150, solo: true, make: () => birds(s + 3, 100, 3) }] : []),
        cloudSpec(s + 5, 272, 112, w, p, 0.05),
        { tone: p.far, k: 0.06, baseY: 280, make: (b) => downs(s + 7, 280, 26, 4, b) },
        { tone: p.far, k: 0.09, baseY: 278, solo: true, make: () => castleRuin(150, 278, 130, 150) },
        { tone: p.mid, k: 0.26, baseY: 296, solo: true, make: () => aqueduct(40, 960, 296) },
        { tone: p.mid, k: 0.46, baseY: 300, solo: true, make: () => cypress(60, 300, 112, s + 11) + cypress(92, 300, 80, s + 13) + cypress(560, 300, 120, s + 15) + cypress(900, 300, 96, s + 17) },
        { tone: p.near, k: 0.56, baseY: 302, make: (b) => scrub(s + 17, 302, b) },
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

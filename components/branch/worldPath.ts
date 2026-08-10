// ─────────────────────────────────────────────────────────────────────────────
// THE BRANCH AS A PLACE YOU WALK — the layout, and nothing that draws.
//
// ZERO IMPORTS, the fourth file in the app to hold that rule (rig.ts, camera.ts,
// tone.ts, critters.ts). The whole world can be laid out and measured in plain
// Node: where every lesson marker stands, how fast the figure is going at any
// instant, what is lying in the road, and where the camera has to be for the
// figure to be on screen. None of that needs Metro, a device, or a screenshot.
//
// ── THE SHAPE OF IT ─────────────────────────────────────────────────────────
//
// A branch is 32 lessons in teaching order. They become 32 MARKERS on a single
// horizontal ground line, left to right, and the reader's figure stands at the
// last one they finished. Walking to the next marker takes WALK_SECONDS, which is
// what sets the spacing: distance = speed × time, so the gap is derived from the
// walk rather than picked and then fought with.
//
// ── THE GROUND IS FLAT, AND THAT IS A DECISION ──────────────────────────────
//
// It used to be a continuous curve — two incommensurable sines and a drift — on
// the reasoning that "a world that is one straight rule is a progress bar with a
// man on it". That reasoning was answered by looking at it: the figure spent the
// whole branch trudging up and down knolls it had no reason to climb, and every
// one of them tilted him, because `onTerrain` leans into the slope. Thirty-two
// lessons of seesaw.
//
// A road is level. What stops it being a progress bar is what GROWS on it and
// what LIES ACROSS it — grass, stones, low bushes, and every so often a fallen
// log worth hopping. That is scenery, which is interesting, rather than terrain,
// which was merely uneven.
//
// `groundAt` is kept as a function, and everything still asks it rather than
// assuming. It is the ONE place that decides flat or not.
// ─────────────────────────────────────────────────────────────────────────────

/** How long a PLAIN WALK takes from one lesson to the next. Other gaits differ —
 *  see `spanSeconds`. This one still sets the spacing, so the world is laid out
 *  against the ordinary case rather than against the fastest or the slowest. */
export const WALK_SECONDS = 7;
/** Stage units per second at a walk — matches rig.ts's gait so feet do not slide. */
export const WALK_SPEED = 46;
/** Therefore the gap between two markers. Derived, never typed in twice. */
export const SPAN = WALK_SECONDS * WALK_SPEED;   // 322 at 7s

/** Where the ground sits, in stage units from the top. */
export const BASE_Y = 300;

/**
 * How far RIGHT of the figure a lesson's sign stands.
 *
 * The figure and the sign used to share an x, so the reader stood inside their
 * own signpost. Standing to the LEFT of the words is the reading order — you, then
 * where you are going — and it is far enough out (the figure is ~22 units wide at
 * FIG_K, the card 148 wide) that the two never touch.
 */
export const SIGN_DX = 112;

export interface Marker {
  /** Index within the branch, 0-based. */
  i: number;
  lessonId: string;
  unitId: string;
  /** First marker of its unit — where the scenery changes. */
  unitStart: boolean;
  x: number;
  y: number;
}

/**
 * The ground height at any x. Level — see the header.
 *
 * MARKED, because the figure reads it on the UI thread every frame. An unmarked
 * function called from a worklet is a synchronous cross-thread call and throws.
 */
export function groundAt(x: number): number {
  'worklet';
  return BASE_Y;
}

/** Nothing rises or falls, so these are all the same line. */
export const GROUND_MIN = BASE_Y;
export const GROUND_MAX = BASE_Y;
/** Top of the band the ground art occupies: the tallest thing standing on it. */
export const GROUND_TOP = BASE_Y - 26;

/** Lay a branch out as a world. `lessons` is in teaching order. */
export function layout(lessons: { id: string; unitId: string }[]): Marker[] {
  let lastUnit = '';
  return lessons.map((l, i) => {
    const x = SPAN * (i + 1);
    const unitStart = l.unitId !== lastUnit;
    lastUnit = l.unitId;
    return { i, lessonId: l.id, unitId: l.unitId, unitStart, x, y: groundAt(x) };
  });
}

/**
 * Where the camera sits so the figure reads well while walking right.
 *
 * The figure is kept LEFT OF CENTRE, because the interesting thing is what is
 * coming, not what has gone. A camera centred on a walking figure gives half the
 * screen to ground already covered.
 */
export const LEAD = 0.38;

export function cameraFor(figureX: number, screenW: number): number {
  return figureX - screenW * LEAD;
}

/** Stable pseudo-random in [0,1) from a number. No state, no seed to thread. */
export function hash(n: number): number {
  'worklet';
  let x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  x -= Math.floor(x);
  return x;
}

// ─────────────────────────────────────────────────────────────────────────────
// HOW FAST HE IS GOING — and this is the fix for "he gets faster and faster".
//
// The traverse used to run on `Easing.inOut(Easing.quad)`. That is not a walk,
// it is a launch: a quadratic ease-in-out reaches TWICE the average speed at the
// half-way point, so a seven-second span accelerated from a standstill to 92
// units a second over three and a half seconds and then braked for three and a
// half more. The stride is driven by distance, so the legs faithfully doubled
// their cadence along with it. Nobody walks like that. Nobody walks like that
// even when they are late.
//
// What a person actually does is get up to speed in about a step and then hold
// it. So the profile is a TRAPEZOID in velocity: ramp up over `RAMP` of the
// journey, cruise flat, ramp down at the end. Written as a position curve so it
// can be handed straight to `withTiming` as an easing.
//
// The ramps are SMOOTHSTEPPED rather than linear, so the acceleration itself
// starts and ends at zero and there is no corner to feel at the top of the ramp.
//
// Peak speed is `1/(1-RAMP)` × the average — at RAMP 0.10 that is eleven per
// cent, against the hundred per cent it was, and all of it inside the first and
// last seven-tenths of a second.
// ─────────────────────────────────────────────────────────────────────────────

/** Fraction of the journey spent getting up to speed — and slowing down again. */
export const RAMP = 0.10;

/** Position at time `t`, both normalised 0→1. A flat cruise between two ramps. */
export function travelEase(t: number): number {
  'worklet';
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  const v = 1 / (1 - RAMP);                      // cruise speed, spans per unit time
  // ∫smoothstep over [0,u] = u³ − u⁴/2, and it reaches ½ at u = 1 — so a
  // smoothstepped ramp covers exactly half of what cruising for the same time
  // would, which is what makes the three pieces meet without a jump.
  if (t < RAMP) { const u = t / RAMP; return v * RAMP * (u * u * u - u * u * u * u * 0.5); }
  if (t > 1 - RAMP) { const u = (1 - t) / RAMP; return 1 - v * RAMP * (u * u * u - u * u * u * u * 0.5); }
  return v * (t - RAMP * 0.5);
}

/** Speed at time `t`, as a multiple of the average. Only the checks use it. */
export function travelSpeed(t: number): number {
  'worklet';
  const v = 1 / (1 - RAMP);
  const ss = (u: number) => u * u * (3 - 2 * u);
  if (t < RAMP) return v * ss(t / RAMP);
  if (t > 1 - RAMP) return v * ss((1 - t) / RAMP);
  return v;
}

/**
 * How far he has gone by the time he is up to speed.
 *
 * The departure blend in walkFigure is measured against THIS, so the pose finishes
 * arriving at the stride exactly when the body finishes arriving at cruise. When
 * those two disagree the figure is travelling while still half-standing — which is
 * the whole of "the ground starts moving before he starts walking".
 */
export const RAMP_DIST = SPAN * RAMP * 0.5 / (1 - RAMP);   // 17.9 at RAMP 0.10

// ─────────────────────────────────────────────────────────────────────────────
// WHAT IS LYING IN THE ROAD.
//
// A jump needs something to jump over. When the ground was a curve the figure
// leapt at a rise in the hill, which at least existed; on a level road there is
// nothing there at all, and a man hopping over a patch of flat grass is rule A1
// broken in the plainest possible way — the picture doing something the world
// does not contain.
//
// So the road carries obstacles, and they are DRAWN (see `groundArt`) before they
// are jumped. About a third of spans have one. Deterministic from the span index,
// so the same log is in the same place every time the branch is opened.
//
// They sit at 0.64–0.80 of the span, which is the only stretch that is clear:
// a sign occupies 38→186 from each marker, and the next marker's own figure
// stands at 322.
// ─────────────────────────────────────────────────────────────────────────────

export interface Obstacle {
  /** World x of its centre. */
  x: number;
  /** Half-width and height above the ground line. */
  w: number;
  h: number;
  /** A fallen log, or a boulder. */
  log: boolean;
}

/** What lies in span `i` — the stretch from marker i to marker i+1 — or nothing. */
export function obstacleAt(i: number): Obstacle | null {
  'worklet';
  if (i < 0) return null;
  if (hash(i * 19.3 + 2.1) > 0.34) return null;         // about one span in three
  const from = SPAN * (i + 1);
  const log = hash(i * 13.9 + 0.7) < 0.62;
  return {
    x: from + SPAN * (0.64 + hash(i * 7.7 + 1.3) * 0.16),
    // Knee-high at most. The figure is ~43 world units tall, so a 9-unit log is
    // a fifth of him — enough to be worth clearing, low enough that clearing it
    // is a stride rather than a vault.
    w: log ? 15 : 8,
    h: log ? 8 : 9.5,
    log,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// THE JUMP.
//
// The first one was a half-sine on the figure's y over ±0.16 of the journey —
// two and a quarter seconds in the air with the walk cycle still running
// underneath it. That was replaced by a distance-measured parabola, which was
// right in shape and wrong in size: it peaked at up to 52 units, and the figure
// is 43 units tall. He was clearing his own head, every time, over a bump.
//
// What a jump is, in order: a gather, a shove, a ballistic arc with the legs
// folded, and a landing that is absorbed rather than arrived at. So:
//
//   · It is measured in DISTANCE, not in a fraction of the journey, so it lasts
//     the same however long the span is.
//   · The arc is a PARABOLA. A sine hump has its weight in the wrong place —
//     gravity is constant, so the figure must hang at the top and fall fastest at
//     the bottom, and that difference is most of what makes an arc read as real.
//   · The apex CLEARS THE OBSTACLE AND NOTHING MORE. `h` is the log's height plus
//     seven units, which comes out at a third of his own height — a hurdling
//     stride, which is what the picture shows.
//   · The legs stop walking. They tuck.
// ─────────────────────────────────────────────────────────────────────────────

/** World units covered while airborne — about six-tenths of a second at a walk. */
export const JUMP_RUN = 32;
/** Units of gather before the foot leaves the ground. */
export const JUMP_GATHER = 16;
/** Units of absorb after it lands. */
export const JUMP_ABSORB = 18;
/** How far above an obstacle the feet pass. */
export const JUMP_CLEAR = 7;

/** Position within the jump for a distance travelled: 0 at takeoff, 1 at landing. */
export function jumpPhase(trav: number, takeoff: number): number {
  'worklet';
  return (trav - takeoff) / JUMP_RUN;
}

/** Height above the ground line at jump phase `u`. Zero outside the flight. */
export function jumpLift(u: number, h: number): number {
  'worklet';
  if (u <= 0 || u >= 1) return 0;
  return 4 * h * u * (1 - u);
}

/**
 * How much the figure is compressed at this moment — the gather before the leap
 * and the absorb after it. 0 while walking or flying, 1 at the deepest crouch.
 */
export function jumpCrouch(trav: number, takeoff: number): number {
  'worklet';
  const pre = (trav - (takeoff - JUMP_GATHER)) / JUMP_GATHER;
  if (pre > 0 && pre < 1) return Math.sin(pre * Math.PI * 0.5);   // deepest AT takeoff
  const post = (trav - (takeoff + JUMP_RUN)) / JUMP_ABSORB;
  if (post > 0 && post < 1) return Math.cos(post * Math.PI * 0.5); // deepest ON landing
  return 0;
}

/**
 * Where in span `i` the figure jumps, and how high — null for spans it walks.
 *
 * Placed on the obstacle rather than picked: the takeoff is half a flight before
 * the log, so the APEX sits over it. There is no jump on a span with nothing in
 * the road, which is the only honest arrangement (rule A1).
 */
export function jumpForSpan(i: number): { at: number; h: number } | null {
  const ob = obstacleAt(i);
  if (!ob) return null;
  const from = SPAN * (i + 1);
  const at = ob.x - from - JUMP_RUN * 0.5;
  // Never so early that the gather would start before the span does.
  if (at < JUMP_GATHER + 4) return null;
  return { at, h: ob.h + JUMP_CLEAR };
}

/**
 * How the figure travels this span — deterministic from the lesson index, so the
 * same hop is always the same journey.
 *
 * Codes are `moves.gaitFor`: 0 walk · 1 stroll · 2 hurry · 3 run · 4 trudge. A
 * run every time would be exhausting and a walk every time is what this was
 * complained about for; varying it by index means the road has moods without
 * anything being random.
 */
export function gaitForSpan(i: number): number {
  const r = hash(i * 31 + 5);
  if (r < 0.16) return 27;       // a run
  if (r < 0.34) return 26;       // a hurry
  if (r < 0.52) return 25;       // a stroll
  if (r < 0.62) return 28;       // a trudge
  return 24;                     // a plain walk
}

/**
 * HOW LONG THIS GAIT TAKES TO CROSS A SPAN, in seconds.
 *
 * The span is a fixed 322 units, so this is the gait's SPEED — and it has to
 * vary, because pinning distance and duration together pins speed, and a gait
 * whose speed is dictated cannot also choose its cadence. Foot phase is driven
 * by distance (that is what stops the feet skating), so `cadence = speed /
 * stride`: hold the speed and the gait with the shortest steps is forced to
 * take the most of them. Every gait sharing 7 seconds is what made the trudge
 * churn at 6.2 steps a second while the run ambled at 2.65 — the ordering
 * exactly backwards. See the road shelf in moves.ts for the measurements.
 *
 * With these, and the road strides, the cadences come out
 *
 *     trudge 1.99 · stroll 2.11 · walk 2.36 · hurry 2.55 · run 2.89
 *
 * which is the right order, and inside the band a person actually moves in.
 *
 * THE MODE NUMBERS ARE REPEATED HERE rather than imported, because this file
 * has no imports on purpose — it is what lets the whole world be laid out and
 * measured in plain Node. `check:walk` re-derives every one of these cadences
 * from moves.ts's real gaits and fails if this table and that shelf drift
 * apart, so the duplication is checked rather than trusted.
 */
export function spanSeconds(mode: number): number {
  if (mode === 25) return 8.2;   // stroll
  if (mode === 26) return 6.0;   // hurry
  if (mode === 27) return 4.8;   // run
  if (mode === 28) return 9.0;   // trudge
  return WALK_SECONDS;           // 24, a plain walk
}

/** Every complaint a laid-out world can have. Empty means it is sound. */
export function checkWorld(markers: Marker[], screenW = 390): string[] {
  const out: string[] = [];
  if (!markers.length) return ['no markers'];
  markers.forEach((m, i) => {
    if (Math.abs(m.y - groundAt(m.x)) > 0.01) out.push(`marker ${i} is off the ground`);
    if (i > 0) {
      const d = m.x - markers[i - 1].x;
      if (Math.abs(d - SPAN) > 0.01) out.push(`marker ${i} is ${d.toFixed(0)} from the last, not ${SPAN}`);
    }
    // Nothing may lie where a sign stands or where the reader stops.
    const ob = obstacleAt(i);
    if (ob) {
      const rel = ob.x - m.x;
      if (rel - ob.w < SIGN_DX + 74) out.push(`the obstacle in span ${i} is under this lesson's sign`);
      if (rel + ob.w > SPAN - 30) out.push(`the obstacle in span ${i} is on top of the next marker`);
    }
  });
  // The next marker must be visible, or the reader is walking toward nothing.
  const cam = cameraFor(markers[0].x, screenW);
  if (markers[1] && markers[1].x - cam > screenW * 1.6) {
    out.push('the next marker is more than a screen and a half away — the walk has no destination in view');
  }
  // The figure must not stand on its own signpost.
  if (SIGN_DX < 60) out.push('the sign is close enough to the figure to overlap it');
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// THE GROUND, DRAWN.
//
// In CHUNKS, because one path across 11,000 units would be a single enormous
// surface to rasterise and only ~400 units of it are ever on screen. A chunk is
// 900 units — wider than a phone, so at most two are ever needed — and the screen
// mounts the one the camera is in plus its neighbours. Walking a whole branch
// therefore costs three chunks at a time instead of 320 views, and the chunk
// index changes about once a lesson rather than once a frame.
//
// TWO TONES, and that is what stopped it reading as a black bar with a man on
// it. The earth is a dark warm grey; the TURF — a shallow band along the top —
// and everything growing out of it are ink. An engraving cuts the lit face away
// from the mass beneath it, and the reference images all do exactly this: a hard
// dark line where the ground meets the sky, and a softer body below.
//
// DETERMINISTIC FROM x. A tuft at x=1840 is the same tuft every time the screen
// is opened, so walking back past it does not find a different meadow.
// ─────────────────────────────────────────────────────────────────────────────

/** World units in one drawn chunk of ground. */
export const CHUNK = 900;
/**
 * How far past its own edge a chunk draws, in world units.
 *
 * Two chunks that butt exactly are not seamless: each anti-aliases its own edge,
 * so the join shows as a hairline lighter than the fill either side of it — and a
 * bush standing on the boundary is sliced down the middle by the clip. Chunks
 * therefore OVERLAP by this much and redraw each other's edge. The geometry is
 * deterministic from world x, so the two copies land on exactly the same pixels.
 */
export const CHUNK_PAD = 26;

/** The drawn width of a chunk, and where its left edge sits in the world. */
export const CHUNK_W = CHUNK + CHUNK_PAD * 2;
export function chunkLeft(chunk: number): number { return chunk * CHUNK - CHUNK_PAD; }

/** How deep the ink turf band runs before the earth takes over. */
export const TURF_H = 5;

/** The body of the ground: everything below the turf. */
export function earthPath(w = CHUNK_W, bottom = 380): string {
  const y = (BASE_Y + TURF_H).toFixed(1);
  return `M0 ${y} L${w} ${y} L${w} ${bottom} L0 ${bottom} Z`;
}

/**
 * WHAT GROWS ON IT — the turf line, tufts, stones, low bushes and the occasional
 * fallen log, all in ink and all as subpaths of one fill.
 *
 * They cost nothing extra to draw and cannot drift out of register with the
 * ground they stand on: every item is placed at `groundAt(x)` exactly, so it is
 * planted rather than floating (rule A1).
 *
 * The grass FRINGE is the reason a level road does not read as a ruled line. It
 * only ever grows UPWARD from the ground — never down — so the line the feet
 * land on stays exactly where `groundAt` says it is however ragged the silhouette
 * above it looks.
 */
export function inkPath(x0: number, w = CHUNK_W): string {
  const g = BASE_Y;
  let d = `M0 ${g.toFixed(1)} L${w} ${g.toFixed(1)} L${w} ${(g + TURF_H).toFixed(1)} L0 ${(g + TURF_H).toFixed(1)} Z`;

  // A fine fringe of grass along the whole length, close-pitched, so the top edge
  // of the turf is broken everywhere rather than only where a tuft happens to be.
  const FRINGE = 5.5;
  const f0 = Math.floor(x0 / FRINGE);
  const f1 = Math.ceil((x0 + w) / FRINGE);
  for (let i = f0; i <= f1; i++) {
    const wx = i * FRINGE + (hash(i * 2.3) - 0.5) * FRINGE;
    const x = wx - x0;
    const h = 1.6 + hash(i * 4.1) * 3.4;
    const lean = (hash(i * 6.7) - 0.5) * 2.6;
    d += ` M${(x - 0.9).toFixed(1)} ${(g + 1).toFixed(1)}`
      + ` L${(x + lean).toFixed(1)} ${(g - h).toFixed(1)}`
      + ` L${(x + 0.9).toFixed(1)} ${(g + 1).toFixed(1)} Z`;
  }

  // And the bigger things, spaced far enough apart to read as individuals.
  const PITCH = 23;
  const i0 = Math.floor(x0 / PITCH);
  const i1 = Math.ceil((x0 + w) / PITCH);
  for (let i = i0; i <= i1; i++) {
    const wx = i * PITCH + (hash(i * 7.7) - 0.5) * PITCH * 0.85;
    const x = wx - x0;
    const r = hash(i * 3.1);
    if (r < 0.46) {
      // A TUFT: three blades of different lengths leaning different ways. One
      // blade reads as a hair; three read as grass.
      const n = 2 + Math.floor(hash(i * 5.3) * 2);
      for (let b = 0; b <= n; b++) {
        const bx = x + (b - n / 2) * 2.6;
        const h = 4.5 + hash(i * 11.3 + b) * 6.5;
        const lean = (hash(i * 17.9 + b) - 0.5) * 5.5;
        d += ` M${(bx - 1.1).toFixed(1)} ${(g + 1).toFixed(1)}`
          + ` L${(bx + lean).toFixed(1)} ${(g - h).toFixed(1)}`
          + ` L${(bx + 1.1).toFixed(1)} ${(g + 1).toFixed(1)} Z`;
      }
    } else if (r < 0.68) {
      // A STONE. Flat-bottomed and lopsided; a circle would read as a ball.
      const rw = 2.6 + hash(i * 23.1) * 3.4;
      const rh = rw * (0.55 + hash(i * 29.3) * 0.4);
      d += ` M${(x - rw).toFixed(1)} ${(g + 1).toFixed(1)}`
        + ` L${(x - rw * 0.55).toFixed(1)} ${(g - rh).toFixed(1)}`
        + ` L${(x + rw * 0.35).toFixed(1)} ${(g - rh * 0.82).toFixed(1)}`
        + ` L${(x + rw).toFixed(1)} ${(g + 1).toFixed(1)} Z`;
    } else if (r < 0.79) {
      // A BUSH — a low rounded clump, the only rounded thing down here.
      const bw = 6 + hash(i * 31.7) * 6;
      const bh = 6 + hash(i * 37.1) * 7;
      d += ` M${(x - bw).toFixed(1)} ${(g + 1).toFixed(1)}`
        + ` Q${(x - bw * 0.8).toFixed(1)} ${(g - bh).toFixed(1)} ${(x - bw * 0.15).toFixed(1)} ${(g - bh * 0.86).toFixed(1)}`
        + ` Q${(x + bw * 0.5).toFixed(1)} ${(g - bh * 1.16).toFixed(1)} ${(x + bw).toFixed(1)} ${(g + 1).toFixed(1)} Z`;
    }
  }

  // The things he jumps. Drawn from the same `obstacleAt` the jump is aimed at,
  // so the picture and the leap cannot come apart.
  const s0 = Math.floor(x0 / SPAN) - 2;
  const s1 = Math.floor((x0 + w) / SPAN) + 1;
  for (let i = s0; i <= s1; i++) {
    const ob = obstacleAt(i);
    if (!ob) continue;
    const x = ob.x - x0;
    if (x < -40 || x > w + 40) continue;
    d += ob.log ? logShape(x, g, ob.w, ob.h) : boulderShape(x, g, ob.w, ob.h, i);
  }

  // ── AND THE EARTH ITSELF, MARKED ──────────────────────────────────────────
  //
  // Without this the bottom sixth of the strip is a plain rectangle of one
  // colour with a straight line along the top, which on the contact sheet read
  // as a bar rather than as ground — the same complaint the scenery got, at the
  // reader's own feet. Every reference engraving works its foreground: strata,
  // clods, pebbles, the cut edge of turf.
  //
  // Short strokes, denser just under the turf line and thinning downward, so the
  // ground has a surface and then a depth. Ink on earth, which is a real tonal
  // step rather than a wash.
  const M_PITCH = 17;
  const m0 = Math.floor(x0 / M_PITCH);
  const m1 = Math.ceil((x0 + w) / M_PITCH);
  for (let i = m0; i <= m1; i++) {
    const x = i * M_PITCH + (hash(i * 5.9) - 0.5) * M_PITCH - x0;
    // deeper marks are rarer: 1 − depth² weighting, evaluated as a rejection
    const dep = hash(i * 8.3);
    const y = g + TURF_H + 2 + dep * dep * 46;
    if (y > g + 62) continue;
    const r = hash(i * 12.7);
    if (r < 0.62) {
      // a stroke lying along the bedding, tapering at both ends
      const len = 3 + hash(i * 15.1) * 11 * (1 - dep * 0.5);
      const t = 0.8 + hash(i * 19.3) * 1.1;
      const tip = (hash(i * 21.7) - 0.5) * 2.2;
      d += ` M${(x - len).toFixed(1)} ${y.toFixed(1)}`
        + ` L${(x + len).toFixed(1)} ${(y + tip).toFixed(1)}`
        + ` L${(x + len * 0.86).toFixed(1)} ${(y + tip + t).toFixed(1)}`
        + ` L${(x - len * 0.9).toFixed(1)} ${(y + t).toFixed(1)} Z`;
    } else if (r < 0.86) {
      // a pebble turned up in the soil
      const pr = 1 + hash(i * 23.9) * 2.2;
      d += ` M${(x - pr).toFixed(1)} ${(y + pr * 0.5).toFixed(1)}`
        + ` L${(x - pr * 0.4).toFixed(1)} ${(y - pr * 0.7).toFixed(1)}`
        + ` L${(x + pr * 0.7).toFixed(1)} ${(y - pr * 0.4).toFixed(1)}`
        + ` L${(x + pr).toFixed(1)} ${(y + pr * 0.6).toFixed(1)} Z`;
    }
  }
  return d;
}

/** A fallen trunk lying across the road: a barrel, a snapped end, one stub branch. */
function logShape(x: number, g: number, w: number, h: number): string {
  const t = h * 0.5;
  return `M${(x - w).toFixed(1)} ${(g + 1).toFixed(1)}`
    + ` Q${(x - w - 1.6).toFixed(1)} ${(g - t).toFixed(1)} ${(x - w * 0.86).toFixed(1)} ${(g - h).toFixed(1)}`
    + ` L${(x + w * 0.78).toFixed(1)} ${(g - h * 0.92).toFixed(1)}`
    + ` Q${(x + w + 2.2).toFixed(1)} ${(g - t).toFixed(1)} ${(x + w * 0.9).toFixed(1)} ${(g + 1).toFixed(1)} Z`
    // the stub of a broken branch, angled up off the far end
    + ` M${(x + w * 0.36).toFixed(1)} ${(g - h * 0.9).toFixed(1)}`
    + ` L${(x + w * 0.86).toFixed(1)} ${(g - h * 1.9).toFixed(1)}`
    + ` L${(x + w * 1.02).toFixed(1)} ${(g - h * 1.72).toFixed(1)}`
    + ` L${(x + w * 0.62).toFixed(1)} ${(g - h * 0.82).toFixed(1)} Z`;
}

/** A boulder: faceted, never round, and wider at the foot than the top. */
function boulderShape(x: number, g: number, w: number, h: number, seed: number): string {
  const j = (n: number) => (hash(seed * 3.3 + n) - 0.5) * w * 0.3;
  return `M${(x - w).toFixed(1)} ${(g + 1).toFixed(1)}`
    + ` L${(x - w * 0.82 + j(1)).toFixed(1)} ${(g - h * 0.52).toFixed(1)}`
    + ` L${(x - w * 0.30 + j(2)).toFixed(1)} ${(g - h).toFixed(1)}`
    + ` L${(x + w * 0.42 + j(3)).toFixed(1)} ${(g - h * 0.86).toFixed(1)}`
    + ` L${(x + w * 0.92).toFixed(1)} ${(g - h * 0.34).toFixed(1)}`
    + ` L${(x + w).toFixed(1)} ${(g + 1).toFixed(1)} Z`;
}

/** Ground and everything on it, in coordinates local to `chunkLeft`. */
export function groundArt(chunk: number): { earth: string; ink: string } {
  const x0 = chunkLeft(chunk);
  return { earth: earthPath(CHUNK_W), ink: inkPath(x0, CHUNK_W) };
}

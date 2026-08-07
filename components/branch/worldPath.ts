// ─────────────────────────────────────────────────────────────────────────────
// THE BRANCH AS A PLACE YOU WALK — the layout, and nothing that draws.
//
// ZERO IMPORTS, the fourth file in the app to hold that rule (rig.ts, camera.ts,
// tone.ts, critters.ts). The whole world can be laid out and measured in plain
// Node: where every lesson marker stands, how the ground rises and falls between
// them, where a unit begins, and where the camera has to be for the figure to be
// on screen. None of that needs Metro, a device, or a screenshot to check.
//
// ── THE SHAPE OF IT ─────────────────────────────────────────────────────────
//
// A branch is 32 lessons in teaching order. They become 32 MARKERS on a single
// horizontal ground line, left to right, and the reader's figure stands at the
// last one they finished. Walking to the next marker takes WALK_SECONDS, which is
// what sets the spacing: distance = speed × time, so the gap is derived from the
// walk rather than picked and then fought with.
//
// The ground is NOT flat. A world that is one straight rule is a progress bar
// with a man on it. `groundAt` is a continuous curve and the markers always sit
// ON it, which is what stops the figure hovering or sinking (rule A1: the picture
// must be true).
//
// ── THE GROUND IS A CURVE, AND IT IS DRAWN AS ONE ───────────────────────────
//
// It used to be drawn as one static View per 40 units — 320 rectangles of
// different heights standing side by side. That is a staircase, and it looked
// like one: every step had a visible corner, and the figure walked up a flight of
// stairs rather than over a hill. It was also 320 native views under a moving
// transform, on a screen that already carries a figure and five backdrop layers.
//
// So the ground is now a PATH, built here and filled by one <Path> per chunk. The
// curve was always smooth; only the drawing of it was not.
// ─────────────────────────────────────────────────────────────────────────────

/** How long the figure takes to walk one lesson to the next. */
export const WALK_SECONDS = 7;
/** Stage units per second at a walk — matches rig.ts's gait so feet do not slide. */
export const WALK_SPEED = 46;
/** Therefore the gap between two markers. Derived, never typed in twice. */
export const SPAN = WALK_SECONDS * WALK_SPEED;   // 322 at 7s

/** Where the ground sits when the terrain is level, in stage units from the top. */
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
 * The ground height at any x — one continuous curve, so the figure never steps
 * off a seam. Two incommensurable waves plus a slow drift, the same trick rig.ts
 * uses for idle: a repeating hill every span would read as wallpaper.
 */
export function groundAt(x: number): number {
  // MARKED, because the figure reads it on the UI thread every frame. An unmarked
  // function called from a worklet is a synchronous cross-thread call and throws.
  'worklet';
  const a = Math.sin(x / 197) * 26;
  const b = Math.sin(x / 71 + 1.7) * 9;
  const drift = Math.sin(x / 883) * 14;
  return BASE_Y + a + b + drift;
}

/** The highest and lowest the ground ever reaches — 26 + 9 + 14 either side. */
export const GROUND_MIN = BASE_Y - 49;
export const GROUND_MAX = BASE_Y + 49;
/** Top of the band the ground art occupies: the crest, plus room for a bush. */
export const GROUND_TOP = GROUND_MIN - 22;

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

/** Every complaint a laid-out world can have. Empty means it is sound. */
export function checkWorld(markers: Marker[], screenW = 390): string[] {
  const out: string[] = [];
  if (!markers.length) return ['no markers'];
  markers.forEach((m, i) => {
    if (Math.abs(m.y - groundAt(m.x)) > 0.01) out.push(`marker ${i} is off the ground`);
    if (i > 0) {
      const d = m.x - markers[i - 1].x;
      if (Math.abs(d - SPAN) > 0.01) out.push(`marker ${i} is ${d.toFixed(0)} from the last, not ${SPAN}`);
      const climb = Math.abs(m.y - markers[i - 1].y);
      // A span the figure cannot walk up without looking like it is climbing a wall.
      if (climb > SPAN * 0.42) out.push(`marker ${i} climbs ${climb.toFixed(0)} over ${SPAN} — too steep to walk`);
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

/** Stable pseudo-random in [0,1) from a number. No state, no seed to thread. */
export function hash(n: number): number {
  'worklet';
  let x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  x -= Math.floor(x);
  return x;
}

// ─────────────────────────────────────────────────────────────────────────────
// THE GROUND, DRAWN.
//
// In CHUNKS, because one path across 11,000 units would be a single enormous
// surface to rasterise and only ~400 units of it are ever on screen. A chunk is
// 900 units — wider than a phone, so at most two are ever needed — and the screen
// mounts the one the camera is in plus its neighbours. Walking a whole branch
// therefore costs three <Path>s at a time instead of 320 views, and the chunk
// index changes about once a lesson rather than once a frame.
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

/**
 * The ground line for one chunk, as a filled path in the 360-tall design space.
 *
 * Sampled every `step` units and joined with straight segments. That is not a
 * compromise: the tightest wave in `groundAt` has a wavelength of 446, so at a
 * step of 18 the deepest a chord can sag below the true curve is under a fifth of
 * a unit — a tenth of a hairline. What made the old ground look stepped was 40-wide
 * FLAT-TOPPED rectangles, not the sampling.
 */
export function groundPath(x0: number, w = CHUNK, bottom = 380, step = 18): string {
  let d = `M0 ${groundAt(x0).toFixed(1)}`;
  for (let x = step; x < w; x += step) d += ` L${x} ${groundAt(x0 + x).toFixed(1)}`;
  d += ` L${w} ${groundAt(x0 + w).toFixed(1)} L${w} ${bottom} L0 ${bottom} Z`;
  return d;
}

/**
 * WHAT GROWS ON IT — tufts, stones and low bushes standing on the ground line.
 *
 * Same ink as the ground and returned as more subpaths of the same fill, so it
 * costs nothing extra to draw and cannot drift out of register with the hill it
 * stands on: every item is placed at `groundAt(x)` exactly, so it is planted
 * rather than floating (rule A1).
 *
 * They only read where they break the silhouette against the sky, which is the
 * whole reason they are here — a bare curve says "graph", a curve with things
 * growing out of it says "outside".
 */
export function groundDeco(x0: number, w = CHUNK): string {
  const PITCH = 23;
  const i0 = Math.floor(x0 / PITCH);
  const i1 = Math.ceil((x0 + w) / PITCH);
  let d = '';
  for (let i = i0; i <= i1; i++) {
    const wx = i * PITCH + (hash(i * 7.7) - 0.5) * PITCH * 0.85;
    const x = wx - x0;
    const y = groundAt(wx);
    const r = hash(i * 3.1);
    if (r < 0.52) {
      // A TUFT: three blades of different lengths leaning different ways. One
      // blade reads as a hair; three read as grass.
      const n = 2 + Math.floor(hash(i * 5.3) * 2);
      for (let b = 0; b <= n; b++) {
        const bx = x + (b - n / 2) * 2.6;
        const h = 4.5 + hash(i * 11.3 + b) * 6.5;
        const lean = (hash(i * 17.9 + b) - 0.5) * 5.5;
        d += ` M${(bx - 1.1).toFixed(1)} ${(y + 1).toFixed(1)}`
          + ` L${(bx + lean).toFixed(1)} ${(y - h).toFixed(1)}`
          + ` L${(bx + 1.1).toFixed(1)} ${(y + 1).toFixed(1)} Z`;
      }
    } else if (r < 0.72) {
      // A STONE. Flat-bottomed and lopsided; a circle would read as a ball.
      const rw = 2.6 + hash(i * 23.1) * 3.4;
      const rh = rw * (0.55 + hash(i * 29.3) * 0.4);
      d += ` M${(x - rw).toFixed(1)} ${(y + 1).toFixed(1)}`
        + ` L${(x - rw * 0.55).toFixed(1)} ${(y - rh).toFixed(1)}`
        + ` L${(x + rw * 0.35).toFixed(1)} ${(y - rh * 0.82).toFixed(1)}`
        + ` L${(x + rw).toFixed(1)} ${(y + 1).toFixed(1)} Z`;
    } else if (r < 0.82) {
      // A BUSH — a low rounded clump, the only rounded thing down here.
      const bw = 6 + hash(i * 31.7) * 6;
      const bh = 6 + hash(i * 37.1) * 7;
      d += ` M${(x - bw).toFixed(1)} ${(y + 1).toFixed(1)}`
        + ` Q${(x - bw * 0.8).toFixed(1)} ${(y - bh).toFixed(1)} ${(x - bw * 0.15).toFixed(1)} ${(y - bh * 0.86).toFixed(1)}`
        + ` Q${(x + bw * 0.5).toFixed(1)} ${(y - bh * 1.16).toFixed(1)} ${(x + bw).toFixed(1)} ${(y + 1).toFixed(1)} Z`;
    }
  }
  return d;
}

/** The drawn width of a chunk, and where its left edge sits in the world. */
export const CHUNK_W = CHUNK + CHUNK_PAD * 2;
export function chunkLeft(chunk: number): number { return chunk * CHUNK - CHUNK_PAD; }

/** Ground and everything on it, as ONE fill, in coordinates local to `chunkLeft`. */
export function groundArt(chunk: number): string {
  const x0 = chunkLeft(chunk);
  return groundPath(x0, CHUNK_W) + groundDeco(x0, CHUNK_W);
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
  if (r < 0.16) return 3;        // a run
  if (r < 0.34) return 2;        // a hurry
  if (r < 0.52) return 1;        // a stroll
  if (r < 0.62) return 4;        // a trudge
  return 0;                      // a plain walk
}

/**
 * Where in a traverse the figure JUMPS, and how high — 0 for spans it walks.
 *
 * Only where the ground actually rises into an obstacle, so the jump is a
 * response to the terrain rather than a trick performed at nothing (rule A1:
 * what the picture does must be true of the world).
 */
export function jumpForSpan(fromX: number, toX: number): { at: number; h: number } | null {
  const mid = (fromX + toX) / 2;
  const rise = groundAt(mid) - groundAt(fromX);      // negative y is up
  if (rise > -14) return null;                        // nothing worth leaving the ground for
  return { at: 0.5, h: Math.min(64, 22 - rise * 1.6) };
}

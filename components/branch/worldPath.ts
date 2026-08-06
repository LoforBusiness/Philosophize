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
// last one they finished. Walking to the next marker takes ~5s (WALK_SECONDS),
// which is what sets the spacing: distance = speed × time, so the gap is derived
// from the walk rather than picked and then fought with.
//
// The ground is NOT flat. A world that is one straight rule is a progress bar
// with a man on it. Each span between markers gets a gentle profile — a rise, a
// dip, a step — so the walk has somewhere to go and the parallax has something to
// move against. `groundAt` is continuous and the markers always sit ON it, which
// is what stops the figure hovering or sinking (rule A1: the picture must be true).
//
// ── DEPTH WITHOUT COLOUR ────────────────────────────────────────────────────
//
// §19 stays: this is ink. Depth comes from PARALLAX and tone, not hue — far hills
// pale and slow, mid ground darker and quicker, foreground near-black and fastest.
// `LAYERS` is that ramp, and it is the whole of the INSIDE feeling that survives
// being black and white.
// ─────────────────────────────────────────────────────────────────────────────

/** How long the figure takes to walk one lesson to the next. */
export const WALK_SECONDS = 7;
/** Stage units per second at a walk — matches rig.ts's gait so feet do not slide. */
export const WALK_SPEED = 46;
/** Therefore the gap between two markers. Derived, never typed in twice. */
export const SPAN = WALK_SECONDS * WALK_SPEED;   // 322 at 7s

/** Where the ground sits when the terrain is level, in stage units from the top. */
export const BASE_Y = 300;

export interface Marker {
  /** Index within the branch, 0-based. */
  i: number;
  lessonId: string;
  unitId: string;
  /** First marker of its unit — where the jump-bar lands. */
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
 * Parallax layers, far to near. `k` is how fast a layer moves against the camera:
 * 0 is painted on the sky and never moves, 1 travels with the ground.
 *
 * The tones are the paper ramp from tone.ts, restated here rather than imported
 * because this file holds the zero-import rule — and because a layer's tone and
 * its speed have to be chosen together. A pale layer moving fast reads as a
 * mistake; the two are one decision.
 */
export const LAYERS = [
  { k: 0.10, tone: '#E6E2D8', name: 'far hills' },
  { k: 0.28, tone: '#CFC9BC', name: 'hills' },
  { k: 0.55, tone: '#9A968B', name: 'mid ridge' },
  { k: 1.00, tone: '#1A1A1A', name: 'ground' },
  { k: 1.45, tone: '#1A1A1A', name: 'foreground grass' },
] as const;

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
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// THE SCENERY — silhouettes, layered by depth.
//
// The reference is Alto's Odyssey and the flat-vector forest painters: almost
// none of what makes those images is DETAIL. It is (1) big simple silhouettes,
// (2) stacked at three or four depths, (3) each depth a flat tone, getting paler
// with distance. That reads in ink exactly as well as it reads in teal, which is
// why §19 does not have to bend for it.
//
// DETERMINISTIC FROM x. There is no random anywhere: a tree at x=1840 is the same
// tree every time the screen is opened, so walking back past it does not find a
// different forest. `hash` is the whole of that.
// ─────────────────────────────────────────────────────────────────────────────

/** Stable pseudo-random in [0,1) from an integer. No state, no seed to thread. */
export function hash(n: number): number {
  'worklet';
  let x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  x -= Math.floor(x);
  return x;
}

export type SceneryKind = 'tree' | 'pine' | 'rock' | 'peak';
export interface Prop {
  kind: SceneryKind;
  x: number;
  /** Ground y at its foot — props stand ON the terrain, never float (rule A1). */
  y: number;
  /** Height in stage units. */
  h: number;
  /** Which parallax layer it belongs to: 0 far … 3 foreground. */
  depth: number;
}

/**
 * Everything standing between two x positions, for one depth.
 *
 * Spacing is jittered around a pitch rather than being even, because a row of
 * evenly-spaced trees reads as a fence. The jitter is from `hash`, so it is the
 * same forest every time.
 */
export function propsBetween(x0: number, x1: number, depth: number): Prop[] {
  const pitch = [420, 260, 190, 300][depth];
  const out: Prop[] = [];
  const start = Math.floor(x0 / pitch) - 1;
  const end = Math.ceil(x1 / pitch) + 1;
  for (let i = start; i <= end; i++) {
    const r = hash(i * 7 + depth * 131);
    const r2 = hash(i * 13 + depth * 57);
    const x = i * pitch + (r - 0.5) * pitch * 0.55;
    // The far depths are ridgelines and pines; near depths are trees and rocks.
    const kind: SceneryKind = depth === 0 ? 'peak' : depth === 1 ? 'pine' : r2 > 0.72 ? 'rock' : 'tree';
    const base = [150, 74, 96, 120][depth];
    const h = base * (0.7 + r2 * 0.6);
    out.push({ kind, x, y: groundAt(x), h, depth });
  }
  return out;
}

/** The moon: one per branch, high and far, and it never moves with the camera. */
export const MOON = { x: 0.22, y: 0.24, r: 54 };

import { STAGE_W, STAGE_H } from '@/components/lesson/cinematic/rig';

// ─────────────────────────────────────────────────────────────────────────────
// The launch screen's landscape, as pure data and path strings.
//
// NO REACT IN THIS FILE. That is what lets scripts/sheet-launch.mjs draw every
// scene to a PNG and scripts/check-launch.mjs measure it, both in plain Node —
// the fastest loop in the repo for anything shape-shaped. Importing rig.ts is
// fine: it is pure maths too, and the checker transpiles both.
//
// PATH DATA ONLY. No arcs, no circles. rasterpath.mjs flattens path commands
// assuming every argument is an (x, y) pair, so an `A` command is silently
// mis-drawn rather than rejected. Discs are polygons; see `discPath`.
// ─────────────────────────────────────────────────────────────────────────────

export const INK = '#1A1A1A';
export const CREAM = '#F4F1EA';

/** The frame everything here is authored in. Same stage as the figure. */
export const ART_W = STAGE_W;   // 400
export const ART_H = STAGE_H;   // 800

export type SceneKey = 'walk' | 'sip' | 'read' | 'thinker' | 'stargazer' | 'lookout';

export const SCENE_KEYS: readonly SceneKey[] = [
  'walk', 'sip', 'read', 'thinker', 'stargazer', 'lookout',
];

export interface Palette {
  /** Six tonal steps of ONE hue family, index 0 darkest → 5 lightest. */
  steps: readonly [string, string, string, string, string, string];
  /** The celestial anchor's fill. May sit a touch warmer than the family. */
  disc: string;
  /** Which steps the sky occupies, top → horizon. Drives chromeOn(). */
  sky: readonly [number, number];
}

export const PALETTES: Record<SceneKey, Palette> = {
  // amber dusk — low sun behind a long ridge
  walk: {
    steps: ['#3A2A26', '#5E4038', '#8A5E45', '#B98A5E', '#DFB98A', '#F2DCBC'],
    disc: '#FFE0A8',
    sky: [5, 3],
  },
  // pale gold morning — high hazy sun over a grass crest
  sip: {
    steps: ['#2E2B25', '#55503F', '#837A5F', '#B0A585', '#D8CFB4', '#F1EBDA'],
    disc: '#FFF4D2',
    sky: [5, 3],
  },
  // cool slate — a pale disc through winter mist
  read: {
    steps: ['#1E232A', '#3A424B', '#5A6773', '#8794A0', '#B4BFC8', '#DEE5EA'],
    disc: '#F2F6F8',
    sky: [5, 3],
  },
  // forest teal — deep canopy, a cliff edge, a valley below
  thinker: {
    steps: ['#122A25', '#24473F', '#3A6357', '#5C8779', '#8FB3A4', '#C4D8CE'],
    disc: '#DCEFE4',
    sky: [4, 3],
  },
  // dusk blue — THE NIGHT SCENE. Sky is the DARK end, so chrome comes out cream.
  // This is the case a fixed "the sky is always light" rule would have banned.
  stargazer: {
    steps: ['#12161F', '#2C3849', '#465468', '#6B7A8E', '#9BA7B6', '#D3DAE2'],
    disc: '#E8EDF4',
    sky: [0, 2],
  },
  // muted rose dusk — receding ridges to a far spire
  lookout: {
    steps: ['#2A1E28', '#503A48', '#785764', '#A67F85', '#CDAAA8', '#EFDCD4'],
    disc: '#FFDCC0',
    sky: [5, 3],
  },
};

/** The tone the top band (y 0–300) averages to — what chrome sits on. */
export function skyBandTone(key: SceneKey): string {
  return PALETTES[key].steps[PALETTES[key].sky[0]];
}

/**
 * Ink or cream, DERIVED — never hand-picked per scene.
 *
 * The old file fixed the dark zone to the top third so chrome could always be
 * light. That worked, and it also banned every night sky. Reading the sky band's
 * own luminance keeps the guarantee (nothing lands on a background it cannot be
 * read against) without the ban.
 */
export function chromeOn(key: SceneKey): string {
  const l = (hex: string) => {
    const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
    const f = (v: number) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
    return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
  };
  const r = (a: number, b: number) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  const sky = l(skyBandTone(key));
  return r(l(INK), sky) >= r(l(CREAM), sky) ? INK : CREAM;
}

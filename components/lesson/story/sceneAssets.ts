import type { ImageSourcePropType } from 'react-native';

/* -------------------------------------------------------------------------- *
 *  ASSET MANIFEST for the "Arguments Are Not Fights" painted story scene.
 *
 *  HOW TO ADD THE PAINTED ART (see assets/story/snowwalk/README.md for the
 *  exact image spec + the AI prompts that produce this style):
 *
 *    1. Drop the PNG into  assets/story/snowwalk/  with the EXACT filename
 *       listed in each entry's comment (e.g. sky.png, fox.png, man1.png).
 *    2. Replace that entry's `source: null` with the matching `require(...)`
 *       line shown right beside it (just delete `null,` and uncomment).
 *    3. Save. The engine swaps the painted layer in automatically — every
 *       null entry falls back to the hand-drawn procedural placeholder, so you
 *       can add the art one layer at a time and watch it come to life.
 *
 *  Until then everything renders as the procedural ink-&-wash placeholder.
 * -------------------------------------------------------------------------- */

/** A horizontally-seamless background plane that scrolls forever (parallax). */
export interface ScrollLayer {
  key: 'sky' | 'mountains' | 'treelineFar' | 'treesMid' | 'ground' | 'foreground';
  source: ImageSourcePropType | null;
  /** 0 = infinitely far (still), 1 = right at the camera (fastest). */
  depth: number;
  /** Bottom edge of the art as a fraction of screen height (0 top, 1 bottom). */
  yBottomFrac: number;
  /** Art height as a fraction of screen height. */
  heightFrac: number;
  opacity?: number;
}

/** A single drifting element (bird, fox, lamp, near tree) for scene variety. */
export interface PropDef {
  key: 'crows' | 'fox' | 'lamp' | 'treeFg';
  source: ImageSourcePropType | null;
}

/** A walking character. `frameB` is an optional 2nd stride frame for a real
 *  walk cycle; if absent the engine animates a single frame with bob + sway. */
export interface CharacterDef {
  key: 'man1' | 'man2';
  frameA: ImageSourcePropType | null;
  frameB: ImageSourcePropType | null;
}

// Back-to-front. depth drives parallax speed; far layers barely move.
export const SCROLL_LAYERS: ScrollLayer[] = [
  // sky.png — full-bleed, OPAQUE, no transparency (this is the whole backdrop)
  { key: 'sky',         source: null /* require('../../../assets/story/snowwalk/sky.png') */,         depth: 0.0,  yBottomFrac: 1.0,  heightFrac: 1.0 },
  // mountains.png — distant hazy hills, transparent above the ridge, seamless L↔R
  { key: 'mountains',   source: null /* require('../../../assets/story/snowwalk/mountains.png') */,   depth: 0.06, yBottomFrac: 0.66, heightFrac: 0.30 },
  // treeline-far.png — far row of bare trees, transparent, seamless L↔R
  { key: 'treelineFar', source: null /* require('../../../assets/story/snowwalk/treeline-far.png') */, depth: 0.16, yBottomFrac: 0.70, heightFrac: 0.26 },
  // trees-mid.png — mid bare trees/shrubs, transparent, seamless L↔R
  { key: 'treesMid',    source: null /* require('../../../assets/story/snowwalk/trees-mid.png') */,    depth: 0.36, yBottomFrac: 0.80, heightFrac: 0.34 },
  // ground.png — snowy field plane the men walk on, transparent top, seamless L↔R
  { key: 'ground',      source: null /* require('../../../assets/story/snowwalk/ground.png') */,       depth: 0.7,  yBottomFrac: 1.0,  heightFrac: 0.40 },
  // foreground.png — nearest snow tufts / drift edge, transparent, seamless L↔R
  { key: 'foreground',  source: null /* require('../../../assets/story/snowwalk/foreground.png') */,   depth: 1.0,  yBottomFrac: 1.0,  heightFrac: 0.20 },
];

export const PROPS: PropDef[] = [
  // crows.png — 2–3 small dark birds, transparent (drifts slowly across the sky)
  { key: 'crows',  source: null /* require('../../../assets/story/snowwalk/crows.png') */ },
  // fox.png — small fox in side profile, transparent (trots across the far field)
  { key: 'fox',    source: null /* require('../../../assets/story/snowwalk/fox.png') */ },
  // lamp.png — old iron lamppost with a warm glow, transparent (passes mid-scene)
  { key: 'lamp',   source: null /* require('../../../assets/story/snowwalk/lamp.png') */ },
  // tree-fg.png — one large bare foreground tree, transparent (sweeps past close)
  { key: 'treeFg', source: null /* require('../../../assets/story/snowwalk/tree-fg.png') */ },
];

export const CHARACTERS: CharacterDef[] = [
  // man1.png  (+ optional man1-b.png for a 2-frame walk) — eager traveller, faces RIGHT
  { key: 'man1', frameA: null /* require('../../../assets/story/snowwalk/man1.png') */, frameB: null /* require('../../../assets/story/snowwalk/man1-b.png') */ },
  // man2.png  (+ optional man2-b.png) — calm traveller w/ scarf, faces RIGHT
  { key: 'man2', frameA: null /* require('../../../assets/story/snowwalk/man2.png') */, frameB: null /* require('../../../assets/story/snowwalk/man2-b.png') */ },
];

export const layerOf = (k: ScrollLayer['key']) => SCROLL_LAYERS.find((l) => l.key === k)!;
export const propOf = (k: PropDef['key']) => PROPS.find((p) => p.key === k)!;
export const charOf = (k: CharacterDef['key']) => CHARACTERS.find((c) => c.key === k)!;

/** True once at least one painted layer has been wired in. */
export const ART_PRESENT =
  SCROLL_LAYERS.some((l) => l.source) ||
  PROPS.some((p) => p.source) ||
  CHARACTERS.some((c) => c.frameA);

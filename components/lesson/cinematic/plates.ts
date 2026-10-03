// ─────────────────────────────────────────────────────────────────────────────
// SET PLATES — a large set's STILL scenery, drawn once into a picture.
//
// A set built from SetArt is drawn from Views: every polygon is several triangles of
// two Views each, plus an outline. history-foundations-5's court came to about 2,800
// of them, all under the scene's own camera transform, so every frame the camera or a
// figure moved Android replayed all 2,800 (CLAUDE.md §17 rule 7: hundreds of Views
// under one transform is the bill an animated full-screen Svg is). The scenery that
// never moves is therefore drawn ONCE, by `npm run make:plates`, which renders these
// very layers through the real SetArt/ObjectArt in a browser and saves them as PNGs.
// The scene draws the PNG where the layers stood (PlateArt.tsx); only what moves stays
// live.
//
// A plate is a box in the scene's own world units, the resolution it is baked at
// (pixels per world unit: enough for the closest shot that shows it), and the layers
// in paint order. `check:plates` holds that every PNG was made from the layers as
// they are now, so a set edited without re-making its plates fails the build.
// ─────────────────────────────────────────────────────────────────────────────
import type { ObjPart, ObjTone } from './objects';
import type { SetPart } from './SetArt';
import { HIST5_PLATES } from './hist5Plates';

export interface PlateLayer {
  /** SetArt parts (polygons allowed), drawn with outline cap `line`. */
  set?: readonly SetPart[];
  /** ObjectArt parts. */
  obj?: readonly ObjPart[];
  line?: number;
}

export interface Plate {
  /** The plate's box in the scene's world units. */
  box: { x: number; y: number; w: number; h: number };
  /** Pixels per world unit it is baked at. */
  scale: number;
  tone: ObjTone;
  layers: readonly PlateLayer[];
}

export const PLATES: Record<string, Plate> = {
  ...HIST5_PLATES,
};

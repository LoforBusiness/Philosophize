// THE GEOMETRY OF THE PROFILE PICTURES, apart from their drawings so the app can lay a
// picture without loading ten SVG strings. Zero imports. See profileScenes.ts.

export const PS_W = 1200;
export const PS_H = 720;
/** Where every place's ground begins. */
export const PS_HORIZON = 600;
/** Everything that matters stands below this; Home's band shows little more. */
export const PS_SAFE_TOP = 290;
/** What a box may crop off either side. */
export const PS_SIDE = 90;

/**
 * How a box W × H lays a place so its horizon lands at `horizonAt` dp: the scale,
 * the picture's size and its offset. Never narrower than the box (plus `overscan`
 * a side, for a box that slides the picture), never with sky running out above.
 */
export function sceneLayout(W: number, horizonAt: number, overscan = 0) {
  const s = Math.max((W + 2 * overscan) / PS_W, horizonAt / PS_HORIZON);
  return { s, w: PS_W * s, h: PS_H * s, left: (W - PS_W * s) / 2, top: horizonAt - PS_HORIZON * s };
}

/** A circle of diameter D centred on a place's focus, showing about `span` units of it. */
export function avatarLayout(D: number, focus: { x: number; y: number }, span = 430) {
  const s = D / span;
  return { s, w: PS_W * s, h: PS_H * s, left: D / 2 - focus.x * s, top: D / 2 - focus.y * s };
}

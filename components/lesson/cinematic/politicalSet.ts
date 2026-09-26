import { oEll, oRect, oBar, type ObjPart } from './objects';

// ─────────────────────────────────────────────────────────────────────────────
// THE SET OF political-political-1 — A TOWN CROSSROADS WHOSE LIGHTS HAVE DIED. The
// owner approved it on 2026-09-25, one of five first lessons redesigned after the
// logic debate studio, each in a setting of its own.
//
//   the shops       two shopfronts either side of the street, each with an awning;
//                   their shutters are drawn by the scene, because they come down.
//   the light pole  a traffic light on the left corner, with a street-name plate and
//                   room for a posted notice; its lamps are drawn by the scene.
//   the soapbox     a crate in the middle of the crossroads.
//   the newsboard   an A-frame board on the right pavement.
//
// STAGE UNITS, GROUND at 500. Zero imports beyond ./objects.
// ─────────────────────────────────────────────────────────────────────────────

const GROUND = 500;

/** The two shopfronts: left edge, right edge, the awning's foot, the shutter's floor. */
export const SHOPS = [
  { x0: 44, x1: 150 },
  { x0: 250, x1: 392 },
];
export const AWNING_Y = 330;
export const SHUTTER = { top: 338, bottom: 440 };

/** The traffic light: its pole, and the head carrying three lamps. */
export const LIGHT = { x: 24, headTop: 320, headH: 50, headW: 20 };
export const LAMP_R = 6;

/** The soapbox in the middle of the crossroads. */
export const BOX = { cx: 200, w: 40, h: 22 };

/** The newsboard on the right pavement. */
export const NEWS = { x: 336, y: 432, w: 62 };

/** A shopfront: the wall, its window and door, and a striped awning over it. */
export function shop(k: number): ObjPart[] {
  const { x0, x1 } = SHOPS[k];
  const cx = (x0 + x1) / 2;
  const w = x1 - x0;
  const stripes: ObjPart[] = [];
  for (let s = 0; s < Math.floor(w / 16); s += 2) {
    stripes.push(oRect('face', x0 + 8 + s * 16, AWNING_Y - 6, 16, 12, 0, 0));
  }
  return [
    oRect('face', cx, (AWNING_Y + GROUND) / 2, w, GROUND - AWNING_Y, 0, 1),
    oRect('lit', cx - w * 0.14, (SHUTTER.top + SHUTTER.bottom) / 2 + 6, w * 0.52, SHUTTER.bottom - SHUTTER.top - 20, 0, 1),
    oRect('dark', x1 - w * 0.17, (SHUTTER.top + SHUTTER.bottom) / 2 + 8, w * 0.2, SHUTTER.bottom - SHUTTER.top - 16, 0, 1),
    oRect('mass', cx, AWNING_Y - 6, w + 8, 12, 0, 2),
    ...stripes,
    oRect('mass', cx, AWNING_Y + 1, w + 8, 3, 0, 1),
  ];
}

/** The light pole and the head's housing; the lamps are the scene's. */
export function lightPole(): ObjPart[] {
  const { x, headTop, headH, headW } = LIGHT;
  return [
    oRect('mass', x, (headTop + headH + GROUND) / 2, 5, GROUND - headTop - headH, 0, 1),
    oRect('mass', x, headTop + headH / 2, headW, headH, 0, 4),
    oRect('dark', x, headTop - 3, headW - 6, 4, 0, 1),
  ];
}

/** The soapbox: a crate with two slats. */
export function soapbox(): ObjPart[] {
  const { cx, w, h } = BOX;
  const top = GROUND - h;
  return [
    oRect('mass', cx, top + h / 2, w, h, 0, 1.5),
    oBar('dark', cx - w / 2 + 4, top + h / 3, cx + w / 2 - 4, top + h / 3, 2),
    oBar('dark', cx - w / 2 + 4, top + (2 * h) / 3, cx + w / 2 - 4, top + (2 * h) / 3, 2),
  ];
}

/** The newsboard's A-frame: two legs splayed under the board. */
export function newsLegs(): ObjPart[] {
  const { x, y, w } = NEWS;
  return [
    oBar('mass', x + 8, y + 50, x + 2, GROUND, 4),
    oBar('mass', x + w - 8, y + 50, x + w - 2, GROUND, 4),
    oEll('dark', x + w / 2, y - 2, 6, 4),
  ];
}

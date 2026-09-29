import { oEll, oRect, oBar, oTri, type ObjPart } from './objects';
import { oPoly, type PolyPart } from './setShapes';

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

/**
 * The soapbox: a wooden crate. REFERENCE: a fruit crate seen side-on is three
 * horizontal planks with dark gaps between them, held by a batten at each end, and a
 * lid plank that overhangs a little — the gaps are what say "crate" rather than "block".
 */
export function soapbox(): ObjPart[] {
  const { cx, w, h } = BOX;
  const top = GROUND - h;
  const x0 = cx - w / 2;
  const x1 = cx + w / 2;
  return [
    oRect('mass', cx, top + h / 2 + 1, w, h - 2, 0, 1),
    oRect('mass', cx, top + 1.5, w + 4, 3.5, 0, 1),
    oBar('dark', x0 + 5, top + 8.5, x1 - 5, top + 8.5, 1.8),
    oBar('dark', x0 + 5, top + 15, x1 - 5, top + 15, 1.8),
    oRect('face', x0 + 3, top + h / 2 + 2, 5, h - 4, 0, 0.5),
    oRect('face', x1 - 3, top + h / 2 + 2, 5, h - 4, 0, 0.5),
    oBar('line', x0 + 3, top + 7, x0 + 3, top + 7, 1.6),
    oBar('line', x1 - 3, top + 7, x1 - 3, top + 7, 1.6),
    oBar('line', x0 + 3, GROUND - 5, x0 + 3, GROUND - 5, 1.6),
    oBar('line', x1 - 3, GROUND - 5, x1 - 3, GROUND - 5, 1.6),
  ];
}

// ── the street, receding between the shops ──────────────────────────────────
//
// REFERENCE: a town street photographed down its length. What makes it a ROAD and
// not a band of colour is perspective — the carriageway narrows to a point on the
// horizon, a pale kerb runs along each edge, the pavement is a wedge between the kerb
// and the shopfront, and the centre line breaks into dashes that shrink as they go.
// Far off, the street is closed by a row of rooftops.

/** The street's vanishing point and near edge. */
export const STREET = { x0: 150, x1: 250, far: 432, vx: 200, farW: 16 };

/** The rooftops closing the far end of the street. */
export function farHouses(): PolyPart[] {
  const { far, vx } = STREET;
  return [
    oPoly('mass', [vx - 34, far, vx - 34, far - 16, vx - 26, far - 24, vx - 18, far - 16, vx - 18, far - 20, vx - 6, far - 20, vx - 6, far]),
    oPoly('mass', [vx + 4, far, vx + 4, far - 22, vx + 14, far - 30, vx + 24, far - 22, vx + 24, far - 14, vx + 36, far - 14, vx + 36, far]),
    oPoly('dark', [vx - 31, far - 12, vx - 27, far - 12, vx - 27, far - 7, vx - 31, far - 7]),
    oPoly('dark', [vx + 12, far - 16, vx + 16, far - 16, vx + 16, far - 11, vx + 12, far - 11]),
    oPoly('dark', [vx + 27, far - 10, vx + 31, far - 10, vx + 31, far - 5, vx + 27, far - 5]),
  ];
}

/** The pavements either side: a wedge from the shopfront to the kerb. */
export function pavements(): (ObjPart | PolyPart)[] {
  const { x0, x1, far, vx, farW } = STREET;
  const kl = vx - farW / 2;
  const kr = vx + farW / 2;
  const parts: (ObjPart | PolyPart)[] = [
    oPoly('mass', [x0, far, kl, far, x0 + 12, GROUND, x0, GROUND]),
    oPoly('mass', [kr, far, x1, far, x1, GROUND, x1 - 12, GROUND]),
  ];
  // the joints between paving slabs, closer together as they recede
  for (const f of [0.18, 0.4, 0.66]) {
    const y = far + (GROUND - far) * f;
    const l = kl + (x0 + 12 - kl) * f;
    const r = kr + (x1 - 12 - kr) * f;
    parts.push(oBar('line', x0 + 1, y, l, y, 0.8));
    parts.push(oBar('line', r, y, x1 - 1, y, 0.8));
  }
  return parts;
}

/** The carriageway, its two kerbs, and the dashed centre line. */
export function road(): (ObjPart | PolyPart)[] {
  const { x0, x1, far, vx, farW } = STREET;
  const kl = vx - farW / 2;
  const kr = vx + farW / 2;
  const parts: (ObjPart | PolyPart)[] = [
    oPoly('face', [kl, far, kr, far, x1 - 12, GROUND, x0 + 12, GROUND]),
    oPoly('lit', [kl, far, kl + 1, far, x0 + 16, GROUND, x0 + 12, GROUND]),
    oPoly('lit', [kr - 1, far, kr, far, x1 - 12, GROUND, x1 - 16, GROUND]),
  ];
  // dashes: each twice as long and wide as the one beyond it
  const at = [0.08, 0.2, 0.4, 0.72];
  for (let k = 0; k + 1 < at.length; k++) {
    const ya = far + (GROUND - far) * at[k];
    const yb = far + (GROUND - far) * (at[k] + (at[k + 1] - at[k]) * 0.55);
    const wa = 0.6 + 3 * at[k];
    const wb = 0.6 + 3 * (at[k] + (at[k + 1] - at[k]) * 0.55);
    parts.push(oPoly('lit', [vx - wa / 2, ya, vx + wa / 2, ya, vx + wb / 2, yb, vx - wb / 2, yb]));
  }
  return parts;
}

/** The hoods over the three lamps, drawn over them. */
export function lampHoods(): ObjPart[] {
  const { x, headTop } = LIGHT;
  const out: ObjPart[] = [];
  for (let k = 0; k < 3; k++) {
    // the hood is a half-tube over the top of the lamp: seen from the front, a cap
    // across its top that hangs down either side
    const y = headTop + 6 + k * 14;
    out.push(oBar('mass', x - LAMP_R - 1, y + 0.5, x + LAMP_R + 1, y + 0.5, 2.6));
    out.push(oBar('mass', x - LAMP_R - 1, y + 0.5, x - LAMP_R - 1, y + 5, 2.2));
    out.push(oBar('mass', x + LAMP_R + 1, y + 0.5, x + LAMP_R + 1, y + 5, 2.2));
  }
  return out;
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

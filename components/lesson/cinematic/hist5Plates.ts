// The still scenery of history-foundations-5, as plates (plates.ts). Each layer keeps
// the outline cap and paint order it had when hist5Scene drew it live, so a plate is
// the same picture, drawn once.
//
//   hist5-far   the hills, the city and the Acropolis, seen between the columns.
//               Behind them the sky stays live, so the plate is transparent above.
//   hist5-floor the paving, with the columns' shadows lying on it. It is drawn
//               before the mid plate, so the columns stand on it.
//   hist5-mid   the colonnade, the roof, the dais, the magistrate's chair and the two
//               stands. The jurors are drawn after it (they sit on its benches).
//   hist5-room  the bedroom's walls, its poster and its lamp. The furniture stays
//               live, because the door's light falls between the walls and the bed.
//
// The boxes reach as far as any shot looks: RIGHTJ sees to x 1368, BACK from x 228.
// The scale is pixels per world unit, set from the closest shot each plate is seen
// in (CLOSE, z 1.25, on a 1080px phone is about 3.4): the mid plate at 3, the far one
// at 2.6 (it is distance, a little softness reads as air), the room at 3.6 (ROOM is
// z 1.3 and the room fills the frame).
import { stageTone } from './stageTones';
import { roomPoster, pendant } from './objects';
import {
  HILLS, CITY, ACROPOLIS, FLOOR_PAVING, COLONNADE, ENTABLATURE, DAIS, ARCHON_CHAIR, LEFT_STAND, RIGHT_STAND, BEDROOM,
} from './hist5Set';
import type { Plate } from './plates';

const TONE = stageTone('history');

/** Placed exactly as hist5Scene places them. */
export const POSTER_ART = roomPoster(272, 290, 40, 54);
export const PENDANT_ART = pendant(262, 250, 22, 40);

export const HIST5_PLATES: Record<string, Plate> = {
  'hist5-far': {
    box: { x: 220, y: 168, w: 1160, h: 224 },
    scale: 2.6,
    tone: TONE,
    layers: [{ set: HILLS, line: 0 }, { set: CITY, line: 0.5 }, { set: ACROPOLIS, line: 0.6 }],
  },
  'hist5-floor': {
    // down to y 590: the wide shot sees to 574
    box: { x: 100, y: 462, w: 1280, h: 128 },
    scale: 3,
    tone: TONE,
    layers: [{ set: FLOOR_PAVING, line: 0 }],
  },
  'hist5-mid': {
    box: { x: 220, y: 30, w: 1160, h: 450 },
    scale: 3,
    tone: TONE,
    layers: [
      { set: COLONNADE, line: 1.2 }, { set: ENTABLATURE, line: 1.2 },
      { set: DAIS, line: 1 }, { set: ARCHON_CHAIR, line: 0.8 },
      { set: LEFT_STAND, line: 1 }, { set: RIGHT_STAND, line: 1 },
    ],
  },
  'hist5-room': {
    box: { x: 104, y: 212, w: 312, h: 270 },
    scale: 3.6,
    tone: TONE,
    layers: [{ set: BEDROOM, line: 1 }, { obj: POSTER_ART }, { obj: PENDANT_ART }],
  },
};

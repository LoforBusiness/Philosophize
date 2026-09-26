import { oEll, oRect, oBar, plinth, type ObjPart } from './objects';

// ─────────────────────────────────────────────────────────────────────────────
// THE SET OF logic-arguments-1 — a TV debate studio, and the things the thinkers
// bring into it. The owner chose the studio (2026-09-25) from three settings, after
// the professor's lecture room made the case for real objects over labelled boxes.
//
// Every prop is drawn in the object library's own vocabulary (./objects: ellipses,
// rounded rectangles and bars, each with a ROLE that picks its tone), and every one
// was drawn against a reference picture (`npm run ref`), the rule group AM of the
// rule book records:
//
//   the lectern     a sloped top on a tapered body, a recessed front panel, a
//                   plinth underfoot, and a gooseneck microphone rising from the
//                   top toward the speaker's mouth.
//   the bust        head, neck and a chest cut straight across, on a plinth with a
//                   projecting cap and base (Aristotle, Altemps inv. 8575).
//   the water clock the Athenian klepsydra that timed a speech in court: an upper
//                   pot draining through a spout into a lower one.
//
// STAGE UNITS, GROUND at 500 (./cinematicKit). Zero imports beyond ./objects, which
// has none, so the set can be drawn in plain Node.
// ─────────────────────────────────────────────────────────────────────────────

const GROUND = 500;

/** Where the two lecterns stand: in front of each speaker's mark, toward the middle. */
export const LECTERN_OFF = 27;

/**
 * A debate lectern, seen from the side. `cx` is its centre; `speaker` is −1 when the
 * speaker stands to its LEFT (the mic leans that way) and +1 when to its right.
 */
export function lectern(cx: number, speaker: -1 | 1): ObjPart[] {
  const top = GROUND - 56;
  const s = speaker;
  return [
    // the plinth underfoot
    oRect('face', cx, GROUND - 3, 46, 6, 0, 1.5),
    // the body, and its recessed front panel
    oRect('mass', cx, top + 30, 34, 50, 0, 2),
    oRect('dark', cx, top + 30, 22, 32, 0, 2),
    // a small seal on the panel — the studio's mark
    oEll('lit', cx, top + 22, 9, 9),
    oEll('line', cx, top + 22, 4, 4),
    // the sloped top, falling toward the speaker
    oRect('mass', cx, top + 2, 44, 7, s * -7, 2),
    // the gooseneck: up from the back of the top, bending toward his mouth
    oBar('line', cx + s * 12, top, cx + s * 15, top - 10, 2),
    oBar('line', cx + s * 15, top - 10, cx + s * 21, top - 18, 2),
    oEll('line', cx + s * 23, top - 21, 7, 10, s * 35),
  ];
}

/**
 * A sheet of notes on the lectern top, and the little chart on it: `kind` 'rise' is
 * the rents line climbing past a flat wages line; 'built' is two skylines, the
 * taller one with its arrow pointing down.
 */
export function notes(cx: number, speaker: -1 | 1, kind: 'rise' | 'built'): ObjPart[] {
  const y = GROUND - 62;
  const x0 = cx - 11, x1 = cx + 11;
  const tilt = speaker * -7;
  const parts: ObjPart[] = [oRect('lit', cx, y + 3, 26, 17, tilt, 1)];
  if (kind === 'rise') {
    parts.push(
      oBar('line', x0 + 2, y + 8, x1 - 2, y + 8, 1.2),              // wages: flat
      oBar('line', x0 + 2, y + 9, cx, y + 3, 1.4),                 // rents: climbing
      oBar('line', cx, y + 3, x1 - 2, y - 3, 1.4),
    );
  } else {
    parts.push(
      oRect('line', x0 + 4, y + 6, 4, 6, 0, 0.5),                  // few buildings
      oRect('line', x0 + 9, y + 5, 3, 8, 0, 0.5),
      oRect('line', cx + 3, y + 3, 3, 11, 0, 0.5),                 // more built
      oRect('line', cx + 7, y + 1, 3, 14, 0, 0.5),
      oBar('line', x1 - 1, y - 4, x1 - 1, y + 4, 1.2),             // rent: down
      oBar('line', x1 - 3, y + 2, x1 - 1, y + 4, 1.2),
      oBar('line', x1 + 1, y + 2, x1 - 1, y + 4, 1.2),
    );
  }
  return parts;
}

/** Aristotle's bust on its plinth, facing left — toward the narrator and the board. */
export function bust(cx: number): ObjPart[] {
  const top = GROUND - 62;
  return [
    ...plinth(cx, top + 31, 46, 62),
    // the chest, cut straight across, and the neck
    oRect('mass', cx, top - 10, 40, 18, 0, 6),
    oRect('mass', cx - 1, top - 22, 12, 12, 0, 2),
    // the head, the hair a shade darker, and the beard falling forward
    oEll('mass', cx - 2, top - 40, 26, 30),
    oEll('dark', cx + 2, top - 49, 22, 14, 10),
    oEll('face', cx - 8, top - 28, 13, 15, -15),
  ];
}

/**
 * The klepsydra: a stool, an upper pot with a spout, and the pot it drains into. The
 * drops and the rising water are the film's — they move — so this returns where the
 * spout and the lower pot's mouth are, for it to draw between.
 */
export function klepsydra(cx: number): { parts: ObjPart[]; spout: [number, number]; mouth: [number, number]; lowerCx: number } {
  const seat = GROUND - 52;
  const lowerCx = cx + 26;
  const parts: ObjPart[] = [
    // the stool
    oBar('face', cx - 12, GROUND, cx - 9, seat + 3, 3),
    oBar('face', cx + 12, GROUND, cx + 9, seat + 3, 3),
    oRect('mass', cx, seat, 36, 5, 0, 1.5),
    // the upper pot: a round body, a neck and a lip
    oEll('mass', cx, seat - 14, 30, 24),
    oRect('mass', cx, seat - 28, 12, 8, 0, 1),
    oRect('mass', cx, seat - 32, 18, 4, 0, 1.5),
    oBar('line', cx - 10, seat - 12, cx + 10, seat - 12, 1.2),      // a painted band
    // the spout, low on the side facing the lower pot
    oBar('line', cx + 13, seat - 8, cx + 21, seat - 5, 3),
    // the lower pot on the floor
    oEll('mass', lowerCx, GROUND - 13, 30, 26),
    oRect('mass', lowerCx, GROUND - 27, 16, 6, 0, 1),
    oBar('line', lowerCx - 11, GROUND - 13, lowerCx + 11, GROUND - 13, 1.2),
  ];
  return { parts, spout: [cx + 22, seat - 4], mouth: [lowerCx, GROUND - 30], lowerCx };
}

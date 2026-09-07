// WHAT THE FIGURE IS WEARING — geometry only, ZERO IMPORTS.
//
// A reader asked for the mascot to stop looking identical in all 186 lessons:
// *"sometimes maybe wearing a top hat with a cane and a eyeglass … or have a
// second stickman walk in … dressed funny or dressed differently … I still want
// the core stickman to be the main mascot."*
//
// Zero imports for the same reason `rig.ts`, `tone.ts` and `worldPath.ts` have
// none: the whole wardrobe can then be drawn and measured in plain Node
// (`npm run sheet:wardrobe`), which is the only instrument this project has for
// "does it look good" and the only one that catches the failure below.
//
// ── THE ONE RULE, AND IT DISQUALIFIES HALF THE OBVIOUS IDEAS ────────────────
//
// EVERY PIECE MUST CHANGE THE FIGURE'S OUTLINE. He is solid ink with no face, no
// shading and no colour, drawn about a hundred units tall — so anything laid
// INSIDE his silhouette is not subtle, it is absent. §19 records the same finding
// twice from the other end: `seated()`'s note that "a fist near the body buries
// the whole forearm inside the torso silhouette and the figure loses an arm",
// and the two launch poses a reader rejected because leg, torso and both arms
// merged into one mass.
//
// So, deliberately NOT in this file:
//
//   · SUNGLASSES and a MOUSTACHE. Both are marks on a face, and the head is a
//     plain disc. They would be a smudge inside a circle at any size.
//   · A SHIRT, a WAISTCOAT, a BELT. All of them paint the torso bone, which is
//     already solid ink of the same colour.
//
// The MONOCLE is the interesting case, because the reader asked for it by name
// and the naive version fails: a ring drawn on the head is inside the disc. It
// earns its place by OVERHANGING the head's edge and dangling a chain below it,
// so it breaks the outline twice. That is why its ring sits at x 16 with a
// radius of 8 against a head radius of 20 — four units proud — rather than
// centred on a face that does not exist.
//
// ── COORDINATES ─────────────────────────────────────────────────────────────
//
// Rig units, relative to the anchor JOINT, in the figure's own frame: +x is the
// way he faces, −y is up. `Stickman` applies the figure's `k` and mirrors x by
// the facing, so a piece written once is correct in both directions.
//
// The head is a disc of radius STR.headR = 20 about `head`, so its crown is at
// y −20 and a hat brim belongs at about −21. The figure is ~103 units tall
// (`FIG_H`), which is what makes a 27-unit hat a quarter again as tall a person
// and therefore unmissable — and is also why `check:wardrobe` measures every
// costume against its lesson's own BAND before letting it ship (rule 5: the band
// must contain every pixel a beat can draw).

/** A drawn part. Rectangles and discs only — what the rest of the app draws. */
export interface Piece {
  /** Which joint it hangs off. */
  at: 'head' | 'neck' | 'pelvis' | 'handR' | 'handL';
  /** Centre, relative to the joint, in rig units. */
  x: number;
  y: number;
  w: number;
  h: number;
  /** Corner radius in rig units. `w / 2` on a square box gives a disc. */
  r?: number;
  /** Degrees, clockwise, about the piece's own centre. */
  rot?: number;
  /** Ring rather than a fill — the border is `t` units thick. */
  ring?: number;
  /**
   * Drawn in PAPER rather than ink — a separating line, not an object.
   *
   * This is the drawing guides' "erase the parts of the head that should be
   * hidden" translated into a medium where everything is one colour. A cap that
   * hugs the skull is ink on ink: it has no edge, so it merges with the head into
   * one amorphous mass and stops being a hat at all. A hairline of paper along
   * the seat is the whole difference — and it is exactly the line a cartoonist
   * leaves when they rub out the skull behind a brim.
   *
   * Drawn LAST, over the ink it separates.
   */
  paper?: boolean;
}

/** A named set of pieces. */
export interface Costume {
  id: string;
  /** For the contact sheet and for `check:wardrobe`'s report. */
  label: string;
  pieces: Piece[];
}

// ── THE PIECES ──────────────────────────────────────────────────────────────
//
// EVERY ONE OF THESE WAS DRAWN, LOOKED AT, AND SEVERAL WERE CUT. What the first
// contact sheet said, and none of it is visible in the numbers:
//
//   · THERE IS NO NECK. The head has radius 20 and the neck is 16 long, so the
//     head's bottom edge sits BELOW the shoulder base — they overlap. A bow tie
//     and a collar are therefore not "small", they are impossible, and both are
//     gone. Anything anchored between the head and the shoulders is inside solid
//     ink.
//   · A HELD ITEM ONLY READS IF THE POSE HOLDS THE HAND CLEAR. The cane survives
//     because it is long and reaches the GROUND, so it breaks the outline below
//     the figure whatever the arm is doing. A book is small and sits wherever the
//     hand happens to be — tucked against the ribs in most lesson poses — so it
//     was cut. Reach is not the test; reach BEYOND THE BODY at every pose is.
//   · THE MONOCLE HAD TO GROW. At radius 8 it was a bump on the head's edge. At
//     11, sitting 11 units proud of a head of 20, it is a monocle.
//
// The five hats are chosen to differ in SILHOUETTE rather than in detail — tall
// cylinder, dome, wide flat board, low cap with a peak, enormous brim. Two hats
// that differ only in trim are one hat.

/**
 * WHERE A HAT'S BAND SITS ON A ROUND HEAD — derived, not chosen.
 *
 * A reader said the top hat "is above his head, so it looks like it's floating",
 * and they were describing exact geometry. The head is a CIRCLE of radius 20. A
 * brim whose bottom edge sits at y −20 is TANGENT to it: they touch at a single
 * point, and on either side of that point there is a wedge of blank paper. A hat
 * resting on a sphere at one point is a hat in mid-air.
 *
 * Every drawing guide says the same thing in words — "the hat should overlap and
 * interact naturally with the head, rather than appearing as a separate element
 * placed on top", and "erase the parts of the head that should be hidden". The
 * arithmetic version: a hat descends until its CROWN WALLS touch the skull, so a
 * crown of width w meets a head of radius R at
 *
 *     y = −√(R² − (w/2)²)
 *
 * For a 30-wide crown that is −13.2, not −20. Every hat in this file was seven to
 * thirteen units too high, and the mortarboard's board floated three units clear
 * of the head with nothing between them at all.
 *
 * Use this for the BAND of any new headwear. The half-unit clamp keeps a crown
 * wider than the head from asking for the square root of a negative number.
 */
export function seatY(crownW: number, headR = 20): number {
  const c = Math.min(crownW / 2, headR - 0.5);
  return -Math.sqrt(headR * headR - c * c);
}

/** A proper stovepipe. The loudest thing in the wardrobe, and the reader's own suggestion. */
const TOP_HAT: Piece[] = [
  { at: 'head', x: 0, y: -13, w: 56, h: 4 },          // the brim, ON the skull
  { at: 'head', x: 0, y: -26, w: 30, h: 26 },         // the crown, rising from it
];

/**
 * Dome. The same family, half the shout.
 *
 * A BRIM IS ONLY THE PART THAT CLEARS THE SKULL. At 46 across a head of 40 this
 * one stood 3 units proud a side — about three pixels at the size a lesson draws
 * him — so seven eighths of it was ruled INSIDE the silhouette, where ink on ink
 * shows nothing. What was left read as two small tabs, and with no seam under
 * them the crown merged into the head as well: rendered large, a gourd with a
 * stick through it rather than a man in a hat. Both halves of that are the same
 * rule the flat cap is built on, arriving on the costume next door.
 *
 * 50 gives it 5 units a side — visible, and still plainly not the top hat's 56
 * nor the aesthete's 60, so the five silhouettes stay distinct.
 */
const BOWLER: Piece[] = [
  { at: 'head', x: 0, y: -13, w: 50, h: 4 },
  { at: 'head', x: 0, y: -21, w: 30, h: 16, r: 8 },
  { at: 'head', x: 0, y: -10.2, w: 34, h: 1.4, paper: true },   // the skull, under the brim
];

/**
 * The scholar.
 *
 * The reference is unambiguous about the two things the first version got wrong:
 * "from the side, it's essentially a HORIZONTAL line sitting atop a rounded base
 * that hugs the head", and the board is about 24cm across a head of roughly 22 —
 * so a little wider than the skull, not half again.
 *
 * Mine was TILTED and 60 wide, which is why it read as a plank driven through his
 * head rather than as a cap. Level, 52, on a rounded base that actually touches.
 */
const MORTARBOARD: Piece[] = [
  { at: 'head', x: 0, y: -17, w: 27, h: 9, r: 4 },    // the rounded base, seated
  { at: 'head', x: 0, y: -23, w: 52, h: 5 },          // the board, level
  { at: 'head', x: 23, y: -15, w: 2, h: 14 },         // the tassel, clear of the head
  { at: 'head', x: 23, y: -7, w: 5, h: 5, r: 2.5 },   // its bob — without it, an antenna
];

/**
 * A NEWSBOY, not a flat cap — and the reference is why.
 *
 * A flat cap "skims the skull in a low, shallow profile", which is a perfect
 * description of something invisible on this figure: it stays inside the head's
 * own outline and adds nothing but a bump. Its cousin is defined by the opposite
 * — "a visibly puffed, rounded crown that BILLOWS ABOVE THE PEAK", with the body
 * "overhanging the brim more dramatically".
 *
 * THE SEAT LINE IS WHAT MAKES IT A HAT. Drawn without it the crown and the head
 * are one ink mass with no edge between them, and the figure reads as wearing a
 * helmet — or as nothing at all, which is what a reader saw: "one that I saw was
 * really bad, I don't even know what it was."
 *
 * AND THE SEAT LINE ALONE WAS HALF A FIX, WHICH IS WHY THIS IS THE SECOND PASS.
 * The crown was 44 wide with its bottom edge at y −11, and `seatY(44)` is −4.4 —
 * so it was perched 6.6 units high on a skull 5 units narrower than itself, with
 * a full-width seam ruled under it. The eye reads everything above that seam as
 * one object: a 44×18 slab, larger than the head, with a clean white slot beneath
 * it. Rendered large it is a brick balanced on his crown, and the peak — which
 * the seam CUT — floats free inside the slot. It is the reader's own "his hat is
 * above his head, so it looks like it's floating", in the costume the seat line
 * was added to rescue.
 *
 * THE WIDTH AND THE SEAT ARE ONE DECISION, NOT TWO. `seatY` inverts exactly:
 * a crown whose bottom is to rest at −12 must be 2·√(20² − 12²) = 32 across, and
 * at that width the bottom edge lies ALONG the skull instead of bridging it, so
 * there is no wedge of paper under the corners and nothing to read as a gap. The
 * billow the reference asks for then comes from HEIGHT rather than from overhang
 * — the crown still rises 5 units clear of the head and 9 above the peak.
 *
 * The peak sits wholly ABOVE the seam. A `paper` piece is drawn last, so any ink
 * crossing it is severed: the old peak ran from y −14 to −10 through a seam at
 * −11, and lost its base.
 *
 * AND A CORNER RADIUS MOVES THE EDGE THE PEAK HAS TO MEET. The peak's root is at
 * x 12 rather than at the crown's nominal 16, because `r` rounds the crown's
 * bottom corner: at the peak's own lower edge the crown has already curved in to
 * x 13.4, so a peak starting at 15 hangs 1.6 units clear of it with paper
 * between. Rendered, that reads as a bar floating beside the cap — the same fault
 * as the hat, one part smaller. Butt a joined piece against the edge where the
 * two actually meet, not against the box's nominal side.
 */
const FLAT_CAP: Piece[] = [
  { at: 'head', x: 0, y: -18.5, w: 32, h: 13, r: 5 },        // the crown — bottom at −12 = seatY(32)
  { at: 'head', x: 21.5, y: -14.4, w: 19, h: 3.6, r: 1.8 },  // the peak, clear of the seam
  { at: 'head', x: 0, y: -11.3, w: 33, h: 1.4, paper: true },
];

/** All brim. Reads at any size and cannot be mistaken for the other four. */
const WIDE_BRIM: Piece[] = [
  { at: 'head', x: 0, y: -14, w: 60, h: 5, r: 2 },
  { at: 'head', x: 0, y: -22, w: 28, h: 15, r: 3 },
];

/**
 * The eyeglass, and the reason it is drawn where it is.
 *
 * A monocle centred on the head is inside the disc and invisible. This one sits
 * ELEVEN units proud of a head of twenty and dangles a chain clear below it, so
 * it breaks the outline twice. It is the piece most likely to be "tidied" back
 * onto the face by somebody who has not read the note at the top of this file —
 * and the first draft, at radius 8, was exactly that mistake.
 */
// AND IT MUST NOT TOUCH THE HAT. The ring's top edge was at y −12.5, which is
// inside the top hat's brim band (−15..−11) and inside the wide brim's
// (−16.5..−11.5) — so on BOTH costumes that wear it, the lens fused with the brim
// above it. A closed loop joined to a bar at its top is not an eyeglass, it is a
// HANDLE: rendered large, the aesthete was carrying a teacup on the side of his
// head. Dropped to y 0 it hangs 1.5 units clear of the stovepipe and 2.0 clear of
// the wide brim, and reads as a lens on a cord again.
const MONOCLE: Piece[] = [
  { at: 'head', x: 19, y: 0, w: 19, h: 19, r: 9.5, ring: 2.2 },
  { at: 'head', x: 16, y: 12, w: 1.5, h: 24, rot: 12 },
];

/**
 * A SATCHEL, and the scarf it replaces is why.
 *
 * The scarf was tried twice and cut. Version one was a rounded blob beside the
 * head and read as a thumb; version two held it off the body with a gap of paper
 * and read as a stick floating in mid-air. The rule at the top of this file
 * already predicted both — a scarf lives on a NECK, and this figure's head
 * overlaps its own shoulders, so there is no neck to hang one from. Exactly the
 * bow tie's problem, arrived at from the other direction.
 *
 * A bag hangs from the HIP, where there is empty paper on both sides of the leg,
 * and it is a shape a traveller carries. It attaches and it reads.
 */
const SATCHEL: Piece[] = [
  { at: 'pelvis', x: -17, y: 3, w: 17, h: 15, r: 3 },
  { at: 'pelvis', x: -9, y: 0, w: 2, h: 12, rot: 18, paper: true },
];

/**
 * Hangs BELOW the pelvis and BEHIND the legs, where there is empty paper.
 *
 * Moved back from −14 to −17 after looking: at −14 it overlapped the swinging
 * thigh and the two ink shapes read as one thickened leg. A garment has to clear
 * the limb it hangs beside, because ink over ink has no edge.
 */
const COAT_TAILS: Piece[] = [
  { at: 'pelvis', x: -17, y: 17, w: 14, h: 34, r: 3, rot: 9 },
];

/**
 * Long enough to reach the ground from a hanging hand.
 *
 * A standing figure's wrist sits about 34 units above the ground, so a 34-unit
 * shaft reaches it from a hanging arm and rides up with a raised one. Anchored to the HAND rather
 * than to the ground on purpose — he is holding it, so when he raises his arm
 * the cane comes with it, which is the whole difference between a prop and a
 * painted-on decoration. It is also the only HELD piece that survived, because
 * it is the only one long enough to clear the body from any pose.
 */
const CANE: Piece[] = [
  { at: 'handR', x: 3, y: 17, w: 2.5, h: 34, rot: -4 },
  { at: 'handR', x: -1, y: -1, w: 11, h: 3, r: 1.5 },
];

// ── THE COSTUMES ────────────────────────────────────────────────────────────
//
// Kept deliberately small. Ten looks that each read at a hundred pixels beat
// thirty that need to be squinted at, and a wardrobe is only variety if a reader
// can tell two of them apart from across a room.

export const COSTUMES: Costume[] = [
  { id: 'plain', label: 'the mascot, undressed', pieces: [] },
  { id: 'dandy', label: 'top hat · monocle · cane', pieces: [...TOP_HAT, ...MONOCLE, ...CANE] },
  { id: 'gent', label: 'bowler · cane', pieces: [...BOWLER, ...CANE] },
  { id: 'scholar', label: 'mortarboard', pieces: [...MORTARBOARD] },
  { id: 'magistrate', label: 'top hat · coat tails', pieces: [...TOP_HAT, ...COAT_TAILS] },
  { id: 'traveller', label: 'newsboy cap · satchel', pieces: [...FLAT_CAP, ...SATCHEL] },
  { id: 'aesthete', label: 'wide brim · monocle', pieces: [...WIDE_BRIM, ...MONOCLE] },
  { id: 'lecturer', label: 'mortarboard · cane', pieces: [...MORTARBOARD, ...CANE] },
  { id: 'stroller', label: 'newsboy cap · coat tails', pieces: [...FLAT_CAP, ...COAT_TAILS] },
  { id: 'ringmaster', label: 'wide brim · coat tails · cane', pieces: [...WIDE_BRIM, ...COAT_TAILS, ...CANE] },
];

export const BY_ID: Record<string, Costume> =
  COSTUMES.reduce((m, c) => { m[c.id] = c; return m; }, {} as Record<string, Costume>);

/**
 * How far a costume reaches beyond the bare figure, in rig units.
 *
 * This is the number that decides whether a costume can ship in a given lesson,
 * because the figure is inside EVERY must-see box (`mustrule`: "the whole man,
 * arms included") and inside the lesson's declared BAND. A hat that pushes past
 * the band is clipped, and one that pushes past the stored must-box is cropped
 * by a camera that was told the figure ended at his crown.
 */
export function reachOf(c: Costume): { up: number; down: number; side: number } {
  let up = 0; let down = 0; let side = 0;
  for (const p of c.pieces) {
    // A rotated box reaches its half-diagonal in the worst case. Cheap and safe:
    // over-estimating costs a few units of band, under-estimating ships a crop.
    const rad = ((p.rot || 0) * Math.PI) / 180;
    const hw = (Math.abs(Math.cos(rad)) * p.w + Math.abs(Math.sin(rad)) * p.h) / 2;
    const hh = (Math.abs(Math.sin(rad)) * p.w + Math.abs(Math.cos(rad)) * p.h) / 2;
    // Anchors, as offsets from the figure's own extremes. The head disc already
    // reaches 20 above its centre, so only what goes ABOVE that is new.
    const HEAD_R = 20;
    if (p.at === 'head') {
      up = Math.max(up, -(p.y - hh) - HEAD_R);
      side = Math.max(side, Math.abs(p.x) + hw - HEAD_R);
    } else if (p.at === 'neck') {
      side = Math.max(side, Math.abs(p.x) + hw - 6);
    } else if (p.at === 'pelvis') {
      down = Math.max(down, 0);                     // tails stop above the ankles
      side = Math.max(side, Math.abs(p.x) + hw - 6);
    } else {
      side = Math.max(side, Math.abs(p.x) + hw);    // held things, off a hand
    }
  }
  return { up: Math.max(0, up), down: Math.max(0, down), side: Math.max(0, side) };
}

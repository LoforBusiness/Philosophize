// ─────────────────────────────────────────────────────────────────────────────
// THE OBJECTS — drawn once, against a reference, and used by every scene.
//
// A reader, on the corpus as it stands: *"a table that doesn't really look like a
// table, like a tree that doesn't really look like a tree, a platform that is pretty
// boring … I want actual looking [objects], referenced online … and then implement
// that really nice design into the lessons."*
//
// They were right, and it is countable. Of 312 named objects across 154 scenes, 94
// are ONE square-cornered rectangle. Theseus's ship was a rounded box with a 3-unit
// rule for a mast; the tree was a 4×30 stick under a 24-unit circle; the table was a
// 92×7 bar on two legs. Each is recognisable as what its caption says and none of
// them is a drawing of the thing.
//
// ── ZERO IMPORTS, LIKE rig.ts AND critters.ts ───────────────────────────────
//
// So `node scripts/sheet-objects.mjs ship` draws it in plain Node and "does that
// look like a ship?" is answered in seconds. That loop is the whole reason this is
// affordable: the first hull here was built from the reference's own words — *"the
// bottom is a smooth U"* — and came out a BOWL. Two iterations at thirty seconds
// each fixed it. The same correction found in a browser costs a page load apiece,
// and found on a phone costs a publish.
//
// ── A PART CARRIES A ROLE, NOT A COLOUR ─────────────────────────────────────
//
// `mass` is the body of the thing and `dark` is a plane turned away from the lamp,
// which is top-left and never moves (§19). `paint()` turns those into the lesson's
// own branch tones, so an object is struck the same way in all six branches without
// a hex literal in any scene — the trap §19 records the welcome screen falling into,
// where a palette the app had twice replaced survived in one file as literals.
//
// The shapes are `Silhouette.tsx`'s four primitives and nothing else, so everything
// here renders as native Views. A path would draw a smoother ship and the must-box
// probe cannot see inside an <Svg> (§17 rule 7), which would hide the object from
// the camera framing it and the thought bubble keeping off it.
//
// ── AND THE DRAWING IS THE REFERENCE, NOT AN IMPRESSION ─────────────────────
//
// Each object states, above it, the construction its reference actually specifies.
// That is what makes a correction arguable: a hull is wrong because the sheer does
// not drop amidships, not because it "looks off".
// ─────────────────────────────────────────────────────────────────────────────

/** What a part is FOR, which is what decides its tone. */
export type Role =
  /** The body of the object — the lit face. */ 'mass'
  /** A body plane in shade — part of the silhouette, so it is OUTLINED with the
   *  body. A box's front, a hull below the waterline. It must obey the lamp. */ | 'face'
  /** A RECESS painted on top of an outlined mass: a sunken panel, a coin's field,
   *  the underside of a canopy. Shaded because it is sunk, so it may sit anywhere. */ | 'dark'
  /** A detail in ink: a rim, a band, a hole, a bracket. */ | 'line'
  /** A highlight or a piece of paper the object carries. */ | 'lit';

/**
 * One shape. The four kinds are `Silhouette.tsx`'s, and the geometry is identical —
 * this file declares the shape structurally rather than importing it, because
 * importing from a .tsx would cost the zero-import rule and with it the plain-Node
 * sheet. TypeScript is structural, so `paint()`'s result is a `Part[]`.
 */
export type ObjPart =
  | { k: 'ell'; role: Role; x: number; y: number; w: number; h: number; rot: number }
  | { k: 'rect'; role: Role; x: number; y: number; w: number; h: number; rot: number; rad: number }
  | { k: 'bar'; role: Role; x1: number; y1: number; x2: number; y2: number; t: number }
  | { k: 'tri'; role: Role; x: number; y: number; w: number; h: number; dir: 'up' | 'down' | 'left' | 'right'; rot: number };

/** An ellipse centred on (x, y). A CIRCLE SCALED — never a box with a big radius. */
export const oEll = (role: Role, x: number, y: number, w: number, h: number, rot = 0): ObjPart => ({ k: 'ell', role, x, y, w, h, rot });
/** A rounded rectangle centred on (x, y). */
export const oRect = (role: Role, x: number, y: number, w: number, h: number, rot = 0, rad = 0): ObjPart => ({ k: 'rect', role, x, y, w, h, rot, rad });
/** A capsule of thickness `t` from (x1, y1) to (x2, y2) — a limb, a spar, a rail. */
export const oBar = (role: Role, x1: number, y1: number, x2: number, y2: number, t: number): ObjPart => ({ k: 'bar', role, x1, y1, x2, y2, t });
/** A triangle filling a w×h box centred on (x, y), pointing `dir`, then rotated. */
export const oTri = (role: Role, x: number, y: number, w: number, h: number, dir: 'up' | 'down' | 'left' | 'right', rot = 0): ObjPart => ({ k: 'tri', role, x, y, w, h, dir, rot });

/** The four tones a stage is struck in (./stageTones). */
export interface ObjTone { RULE: string; STONE: string; SHADE: string; EDGE: string }

/** Ink and paper, which are the two tones that are not the branch's. */
const INK = '#1A1A1A';
const PAPER = '#FAFAF7';

/**
 * Role → fill, in one place. A scene passes its own `stageTone(branch)`, so the same
 * drawing is struck in ethics olive and in logic blue without a hex anywhere but here.
 */
export function paint(parts: readonly ObjPart[], tone: ObjTone, ink: string = INK, paper: string = PAPER) {
  return parts.map((p) => {
    const fill = p.role === 'mass' ? tone.STONE
      : p.role === 'face' || p.role === 'dark' ? tone.SHADE
        : p.role === 'lit' ? paper
          : ink;
    return { ...p, fill };
  });
}

/**
 * The parts of one object that are its BODY — what an outline goes round. `line` and
 * `lit` parts are details drawn ON the body and must not be grown into the outline,
 * or a rim becomes a black band and a porthole becomes a blot.
 */
export const bodyOf = (parts: readonly ObjPart[]) => parts.filter((p) => p.role === 'mass' || p.role === 'face');
/** The parts drawn ON the body, in paint order after it. */
export const marksOf = (parts: readonly ObjPart[]) => parts.filter((p) => p.role !== 'mass' && p.role !== 'face');

// ─────────────────────────────────────────────────────────────────────────────
// Every object is a function of its own size, so one drawing serves a 40-unit
// thumbnail and a 160-unit subject. The arguments are the box it is to fill; the
// drawing is laid out in a 100×100 unit square and scaled, which is what keeps the
// proportions the reference gives.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A TRAPEZOID, which none of the four primitives is and three of these objects need:
 * a lamp shade, a cup that tapers to its foot, a hull whose sides fall inward.
 *
 * It is a rectangle of the NARROW width with an isoceles triangle buried at each
 * side, half of each hidden behind the rectangle so only the sloped flank shows.
 * `Outlined` grows the union, so the three come out as one clean four-sided shape
 * rather than three outlined pieces — which is the same property that lets a zebra's
 * neck meet its body without a seam.
 *
 * The first draft of the lamp and the cup used a bare `tri`, and both rendered as
 * what an isoceles triangle actually is: the lamp became a road sign with its point
 * out of the top of its own shade, and the cup grew a spike under its foot.
 */
function trapezoid(role: Role, x: number, y: number, wTop: number, wBot: number, h: number): ObjPart[] {
  const narrow = Math.min(wTop, wBot);
  const flank = Math.abs(wBot - wTop) / 2;
  if (flank < 0.01) return [oRect(role, x, y, narrow, h)];
  const up = wTop < wBot;                       // narrow end at the top
  return [
    oRect(role, x, y, narrow, h),
    oTri(role, x - narrow / 2, y, flank * 2, h, up ? 'up' : 'down'),
    oTri(role, x + narrow / 2, y, flank * 2, h, up ? 'up' : 'down'),
  ];
}

/** Lay a drawing authored in a 100×100 square into a w×h box centred on (x, y). */
function fit(parts: readonly ObjPart[], x: number, y: number, w: number, h: number): ObjPart[] {
  const sx = w / 100;
  const sy = h / 100;
  const px = (v: number) => x + (v - 50) * sx;
  const py = (v: number) => y + (v - 50) * sy;
  const s = Math.min(sx, sy);
  return parts.map((p) => {
    if (p.k === 'bar') return { ...p, x1: px(p.x1), y1: py(p.y1), x2: px(p.x2), y2: py(p.y2), t: p.t * s };
    return { ...p, x: px(p.x), y: py(p.y), w: p.w * sx, h: p.h * sy, ...(p.k === 'rect' ? { rad: p.rad * s } : null) } as ObjPart;
  });
}

// ── TREE ─────────────────────────────────────────────────────────────────────
//
// REFERENCE. A broadleaf in flat illustration is three things a lollipop has none
// of: a trunk that TAPERS and flares into a root base; boughs that FORK out of it
// and carry the canopy's weight; and a canopy of several OVERLAPPING LOBES, wider
// than it is tall, whose mass sits off-centre. One disc on one stick is the shape
// every drawing guide names as the beginner's tree, and it is what aesthetics33 and
// epistemology14 both draw.
const TREE: ObjPart[] = [
  // THE TRUNK, short and thick. Every reference puts the canopy's mass low and the
  // trunk at about a quarter of the height; a tall thin trunk is a lollipop stick.
  ...trapezoid('mass', 50, 80, 14, 26, 32),                     // one flare, not two bars: two
                                                                // angled bars leave a notch
                                                                // between them and the tree
                                                                // stands on a pair of feet
  // THE CANOPY IS ONE MASS WITH A SCALLOPED EDGE, which is the whole correction.
  // Five separate lobes of similar size read as broccoli — the parts stay parts. A
  // big central ellipse with SMALL lobes set on its perimeter, each bumping out only
  // six or eight units, unions into one blob with a bumpy outline, which is what
  // every reference draws.
  oEll('mass', 50, 38, 78, 58),
  oEll('mass', 22, 34, 30, 30),
  oEll('mass', 31, 16, 30, 28),
  oEll('mass', 50, 10, 32, 28),
  oEll('mass', 69, 16, 30, 28),
  oEll('mass', 78, 34, 30, 30),
  oEll('mass', 74, 54, 26, 24),
  oEll('mass', 26, 54, 26, 24),
  // and the underside, where the lamp does not reach
  oEll('dark', 50, 62, 66, 13),
];
export const tree = (x: number, y: number, w: number, h: number) => fit(TREE, x, y, w, h);

// ── SHIP ─────────────────────────────────────────────────────────────────────
//
// REFERENCE. "The sheerline is the sweeping longitudinal curve of the hull at the
// gunwale, highest at the bow and dropping to its low point amidships. The bottom is
// a smooth U (a V for a sailing yacht); the bow rises forward and the stern is cut
// more vertically." Plus, from the rig: a mast stepped FORWARD of amidships, a boom
// running AFT, and a mainsail whose leech BELLIES rather than ruling straight.
//
// TAKING "U" LITERALLY DRAWS A BOWL. A hull is SHALLOW — depth about a quarter of
// its length — and it is the shallowness together with the raked stem that reads as
// a boat rather than a bathtub. The first draft here was half as deep again and came
// back a soup bowl with a flag in it.
//
// An ellipse cut by the gunwale is what gives the sheer without a path: the hull is
// a wide, shallow ellipse whose top is covered by the deck bar, so what shows is the
// lower arc — which is exactly a sheer dropping amidships and rising at both ends.
const SHIP: ObjPart[] = [
  // THE RIG IS THE SUBJECT, NOT THE HULL. Every reference draws the sails far larger
  // than the hull — the plan has a mast taller than the boat is long. The first
  // drawing here had two short triangles on a deep trapezoid, which is a paper boat.
  oTri('mass', 32, 37, 32, 54, 'up'),                           // the mainsail, aft of the mast
  oTri('dark', 65, 44, 26, 42, 'up'),                           // the jib, forward and shaded
  ...trapezoid('mass', 50, 79, 88, 58, 22),                     // the hull, SHALLOW
  oRect('dark', 50, 85, 62, 9),                                 // below the waterline
  oBar('line', 6, 67, 94, 67, 5),                               // the deck
  oBar('line', 48, 68, 48, 8, 3),                               // the mast, drawn over the sails
];                                                              // so the luff hugs it
export const ship = (x: number, y: number, w: number, h: number) => fit(SHIP, x, y, w, h);

// ── TABLE ────────────────────────────────────────────────────────────────────
//
// REFERENCE. A table reads from three things a capital Π has none of: the top has
// THICKNESS, so a lit surface sits over a shaded edge; the legs are INSET from the
// corners and taper toward the floor; and an APRON runs under the top between them.
// A stretcher near the floor is what says furniture rather than trestle.
const TABLE: ObjPart[] = [
  // SEEN FROM THREE QUARTERS, which is what the references draw and what a flat side
  // view cannot be: a table drawn edge-on is a trestle. The top is a TRAPEZOID —
  // wider at the front than the back — and FOUR legs show, the back pair shorter and
  // higher up the picture. That one change is the difference between a table and a Π.
  oBar('mass', 25, 44, 27, 82, 7),                              // the back legs, behind the top
  oBar('mass', 75, 44, 73, 82, 7),
  ...trapezoid('mass', 50, 30, 64, 92, 18),                     // the top, in perspective
  oRect('mass', 50, 43, 92, 8, 0, 1.5),                         // its front edge — the thickness
  oBar('mass', 10, 47, 13, 96, 8),                              // the front legs, at the corners
  oBar('mass', 90, 47, 87, 96, 8),
  oRect('dark', 50, 52, 78, 7, 0, 1.5),                         // the apron, reaching the legs
];
export const table = (x: number, y: number, w: number, h: number) => fit(TABLE, x, y, w, h);

// ── BOOK ─────────────────────────────────────────────────────────────────────
//
// REFERENCE. A closed book is not a rectangle: the BLOCK of pages is inset from the
// board on three sides, so the cover overhangs as a square-cut edge; the SPINE is a
// rounded band at one end, wider than the board is thick; and the page block shows
// its fore-edge as a lit face under the board's shadow. Standing open, the two
// leaves fall away from a V at the gutter and the outer edges lift.
const BOOK: ObjPart[] = [
  // AN OPEN BOOK, which is what every reference draws and what the first version was
  // not. A closed book seen flat-on is a card with a stripe down one side — nothing
  // in the silhouette says book. Open, the shape is unmistakable: two leaves falling
  // away from a V at the gutter, their OUTER edges lifted higher than the middle.
  oTri('mass', 26, 40, 12, 22, 'up'),                           // the left leaf's lift
  oTri('mass', 74, 40, 12, 22, 'up'),                           // and the right's
  oRect('mass', 27, 56, 46, 40, 0, 2),                          // the two leaves
  oRect('mass', 73, 56, 46, 40, 0, 2),
  oRect('dark', 50, 58, 10, 44, 0, 2),                          // the gutter, in shadow
  oBar('line', 12, 78, 45, 78, 3),                              // the covers showing beneath
  oBar('line', 55, 78, 88, 78, 3),
  oBar('line', 14, 48, 40, 48, 2.4),                            // and the lines of type
  oBar('line', 14, 58, 40, 58, 2.4),
  oBar('line', 14, 68, 36, 68, 2.4),
  oBar('line', 60, 48, 86, 48, 2.4),
  oBar('line', 60, 58, 86, 58, 2.4),
  oBar('line', 60, 68, 82, 68, 2.4),
];
export const book = (x: number, y: number, w: number, h: number) => fit(BOOK, x, y, w, h);

// ── LAMP ─────────────────────────────────────────────────────────────────────
//
// REFERENCE. A table lamp is a TRUNCATED CONE shade over a narrow stem on a weighted
// base, and the proportion is the recognition: the shade's bottom is about twice its
// top and it is wider than the base. A rectangle on a stick is a sign, not a lamp.
const LAMP: ObjPart[] = [
  ...trapezoid('mass', 50, 30, 32, 66, 40),                     // the shade: bottom twice the top
  oRect('dark', 50, 47, 66, 6, 0, 1.5),                         // its lower rim
  oBar('line', 50, 50, 50, 84, 5),                              // the stem
  ...trapezoid('mass', 50, 88, 26, 50, 14),                     // the weighted foot, FLARED —
  oEll('dark', 50, 94, 50, 7),                                  // a flat saucer reads as a plate
];
export const lamp = (x: number, y: number, w: number, h: number) => fit(LAMP, x, y, w, h);

// ── CUP ──────────────────────────────────────────────────────────────────────
//
// REFERENCE. A cup TAPERS toward its foot, the rim is an ellipse seen from slightly
// above (so the vessel reads as open rather than solid), and the handle is a ring
// standing clear of the wall — not a square bracket. The foot is a narrower ellipse.
const CUP: ObjPart[] = [
  oBar('line', 70, 38, 90, 38, 7),                              // the handle: a C standing clear
  oBar('line', 90, 38, 90, 70, 7),                              // of the wall, never a pointed V
  oBar('line', 90, 70, 70, 70, 7),                              // (two bars meeting at a point
  ...trapezoid('mass', 44, 58, 58, 52, 58),                     //  fill into a solid wedge)
  oEll('lit', 44, 30, 60, 15),                                  // the rim, open from above
  oEll('dark', 44, 31, 48, 10),                                 // and what is inside it
  oEll('dark', 44, 86, 42, 8),                                  // the foot
];
export const cup = (x: number, y: number, w: number, h: number) => fit(CUP, x, y, w, h);

// ── CRATE ────────────────────────────────────────────────────────────────────
//
// REFERENCE. A packing crate is a box seen in three-quarter: a front face, a SIDE
// face darker than it, and a lid face lighter, with battens across the front and a
// diagonal brace. The diagonal is the field mark — it is what every drawing of a
// crate has and no drawing of a carton does.
const CRATE: ObjPart[] = [
  // A FRONT FACE AND A TOP, seen slightly from above. The reference draws a crate
  // isometrically, with front, side and top each a parallelogram — and a parallelogram
  // is the one quadrilateral these primitives cannot make, because `trapezoid` is
  // symmetric by construction. Trying anyway produced a side face floating off to the
  // right of its own box. A SYMMETRIC trapezoid is a box seen straight on and tipped
  // slightly down, which is a true view and one the primitives can draw.
  //
  // THE TOP CATCHES THE LAMP AND THE FRONT DOES NOT. Drawn the other way round it is
  // a box lit from underneath, which `check:objects` says out loud (AM6).
  ...trapezoid('mass', 50, 30, 62, 84, 18),                     // the top, receding, lit
  oRect('face', 50, 66, 84, 54, 0, 2),                          // the front, in shade
  oBar('line', 12, 46, 88, 46, 4),                              // battens across it
  oBar('line', 12, 88, 88, 88, 4),
  oBar('line', 14, 86, 86, 48, 3.4),                            // and the brace, corner to corner
];
export const crate = (x: number, y: number, w: number, h: number) => fit(CRATE, x, y, w, h);

// ── HAMMER ───────────────────────────────────────────────────────────────────
//
// REFERENCE. A claw hammer's head is not symmetric: the FACE is a short cylinder on
// one side of the eye and the CLAW curves back and down on the other, forking. The
// handle swells toward its end. Symmetry is what makes a drawn hammer read as a
// mallet or a gavel.
const HAMMER: ObjPart[] = [
  // THE CLAW IS THE FIELD MARK and it has to READ as a hook: a bar curving back and
  // down with a NOTCH cut into its tip. The first version was one fat capsule, which
  // came out a blob — the reference's claw is slender, strongly curved, and forked.
  oRect('mass', 62, 24, 36, 20, 0, 3),                          // the head, about the eye
  oRect('dark', 77, 24, 10, 20, 0, 3),                          // the face, a short cylinder
  oBar('mass', 46, 20, 30, 22, 8),                              // the claw, curving back
  oBar('mass', 32, 21, 22, 34, 7),                              // and down
  oTri('lit', 21, 36, 8, 12, 'up'),                             // the notch in its tip
  oBar('mass', 60, 34, 52, 94, 9),                              // the handle, swelling to its end
];
export const hammer = (x: number, y: number, w: number, h: number) => fit(HAMMER, x, y, w, h);

// ── FLUTE ────────────────────────────────────────────────────────────────────
//
// REFERENCE. A transverse flute is a TUBE with three joints of slightly different
// diameter, a stopped head with the embouchure hole near its end, and a row of keys
// along the body. ethics5 draws it as `width: 1.5` — a hairline, which is a line in
// the place where an instrument should be.
const FLUTE: ObjPart[] = [
  oBar('mass', 6, 50, 94, 50, 13),                              // the tube
  oRect('dark', 12, 50, 14, 13, 0, 3),                          // the stopped head joint
  oEll('line', 20, 50, 7, 7),                                   // the embouchure hole
  oEll('line', 42, 50, 6, 6),                                   // and the keys along the body
  oEll('line', 52, 50, 6, 6),
  oEll('line', 62, 50, 6, 6),
  oEll('line', 72, 50, 6, 6),
  oBar('line', 84, 50, 92, 50, 15),                             // the foot joint
];
export const flute = (x: number, y: number, w: number, h: number) => fit(FLUTE, x, y, w, h);

// ── BENCH ────────────────────────────────────────────────────────────────────
//
// REFERENCE. A park bench is SLATTED — the gaps between the boards are what say
// bench rather than plinth — with a back that rakes away from the seat and arms or
// legs that splay. A single bar is a ledge.
const BENCH: ObjPart[] = [
  // THE SLATS SHARE THEIR STILES, which is the fit the first drawing did not have:
  // three boards raked four degrees against upright posts read as loose parts lying
  // near each other. The stiles run the full height BEHIND the boards and every board
  // starts and ends on them.
  oBar('mass', 17, 6, 17, 70, 9),                               // the back stiles, full height
  oBar('mass', 83, 6, 83, 70, 9),
  oRect('mass', 50, 14, 76, 9, 0, 2),                           // the back boards
  oRect('mass', 50, 28, 76, 9, 0, 2),
  oRect('mass', 50, 42, 76, 9, 0, 2),
  oRect('mass', 50, 60, 92, 10, 0, 2),                          // the seat
  oRect('dark', 50, 68, 92, 6, 0, 1.5),                         // and its front edge
  oBar('mass', 17, 66, 14, 96, 8),                              // legs, under the stiles
  oBar('mass', 83, 66, 86, 96, 8),
];
export const bench = (x: number, y: number, w: number, h: number) => fit(BENCH, x, y, w, h);

// ── DRUM ─────────────────────────────────────────────────────────────────────
//
// REFERENCE. A drum is a cylinder seen from slightly above: an elliptical HEAD on
// top, a shell below it, a hoop round the head and TENSION RODS running down the
// shell in a V — the zig-zag of the ropes or rods is the field mark that separates a
// drum from a tin.
const DRUM: ObjPart[] = [
  oRect('mass', 50, 58, 76, 46),                                // the shell
  oEll('dark', 50, 81, 76, 18),                                 // its bottom, turned away
  oEll('mass', 50, 35, 76, 20),                                 // the head, seen from above
  oEll('lit', 50, 35, 64, 14),
  oBar('line', 14, 38, 14, 78, 4),                              // the hoops, top and bottom
  oBar('line', 86, 38, 86, 78, 4),
  oBar('line', 30, 44, 30, 74, 3.4),                            // and the tension rods, SHORT
  oBar('line', 50, 46, 50, 76, 3.4),                            // and on the shell — run across
  oBar('line', 70, 44, 70, 74, 3.4),                            // the head they draw a letter W
];
export const drum = (x: number, y: number, w: number, h: number) => fit(DRUM, x, y, w, h);

// ── DOOR ─────────────────────────────────────────────────────────────────────
//
// REFERENCE. A door is a LEAF inside a FRAME, and the leaf is panelled: a pair of
// recessed panels with a rail between them, a stile down each side, and the handle at
// about three fifths of the height on the opening edge. A plain rectangle with a dot
// on it is a diagram of a door; the panels are what make it one.
const DOOR: ObjPart[] = [
  oRect('mass', 50, 54, 80, 92, 0, 2),                          // the leaf
  oRect('dark', 48, 33, 50, 32, 0, 1.5),                        // the upper panel, recessed
  oRect('dark', 48, 74, 50, 32, 0, 1.5),                        // and the lower
  oBar('line', 10, 8, 90, 8, 5),                                // the frame: head and jambs
  oBar('line', 11, 8, 11, 100, 5),
  oBar('line', 89, 8, 89, 100, 5),
  oEll('line', 80, 56, 7, 7),                                   // the handle, on the opening edge
];
export const door = (x: number, y: number, w: number, h: number) => fit(DOOR, x, y, w, h);

// ── SHELF ────────────────────────────────────────────────────────────────────
//
// REFERENCE. What reads as a shelf is not the board, it is the BOOKS: upright blocks
// of DIFFERENT heights and widths, one of them leaning against its neighbours. A row
// of identical bars is a fence. The board itself is a plank with a shadow under it.
const SHELF: ObjPart[] = [
  oRect('mass', 22, 52, 14, 54, 0, 1),                          // the books, no two alike
  oRect('mass', 35, 46, 10, 66, 0, 1),
  oRect('mass', 46, 55, 13, 48, 0, 1),
  oRect('mass', 58, 49, 11, 60, 0, 1),
  oRect('mass', 70, 57, 15, 44, 0, 1),
  oRect('mass', 82, 60, 12, 38, 6, 1),                          // and one leaning on the rest
  oBar('line', 29, 26, 29, 78, 2.4),                            // the gaps between the spines
  oBar('line', 40, 14, 40, 78, 2.4),
  oBar('line', 52, 32, 52, 78, 2.4),
  oBar('line', 64, 20, 64, 78, 2.4),
  oBar('line', 76, 36, 76, 78, 2.4),
  oRect('mass', 50, 84, 96, 9, 0, 1.5),                         // the board
  oRect('dark', 50, 91, 96, 6, 0, 1.5),                         // and its shadowed edge
];
export const shelf = (x: number, y: number, w: number, h: number) => fit(SHELF, x, y, w, h);

// ── FLAG ─────────────────────────────────────────────────────────────────────
//
// REFERENCE. A flag is not a rectangle on a stick — every drawing of one puts a WAVE
// in it, and the wave is what says cloth. Flat illustration makes that wave with two
// TONES rather than with a curve: the near face of the fold lit, the far face shaded.
// The fly end is shorter than the hoist, because the cloth is turning away.
const FLAG: ObjPart[] = [
  oBar('line', 13, 4, 13, 100, 6),                              // the pole
  oRect('mass', 46, 30, 62, 38, 0, 1.5),                        // the flag at the hoist
  ...trapezoid('dark', 63, 32, 30, 38, 34),                     // and the fold turning away
  oEll('line', 13, 6, 10, 10),                                  // the finial
];
export const flag = (x: number, y: number, w: number, h: number) => fit(FLAG, x, y, w, h);

// ── BRIDGE ───────────────────────────────────────────────────────────────────
//
// REFERENCE. A stone arch bridge is a DECK carried on an ARCH, and the arch is the
// whole recognition — a flat span on two piers is a table. The opening is drawn as a
// shadow rather than cut out, because nothing here can punch a hole, and a dark half
// ellipse under a deck reads as exactly what it is.
const BRIDGE: ObjPart[] = [
  oRect('mass', 50, 70, 96, 60),                                // the body of the bridge
  oEll('dark', 50, 78, 52, 40),                                 // the arch: a rounded head
  oRect('dark', 50, 89, 52, 22),                                // on straight jambs, to the ground
  oRect('mass', 50, 34, 100, 14, 0, 1.5),                       // the deck, overlapping the body
  oBar('line', 2, 26, 98, 26, 4),                               // the parapet
  oBar('line', 26, 60, 21, 50, 3),                              // voussoirs round the arch head
  oBar('line', 50, 54, 50, 43, 3),
  oBar('line', 74, 60, 79, 50, 3),
];
export const bridge = (x: number, y: number, w: number, h: number) => fit(BRIDGE, x, y, w, h);

// ── WINDOW ───────────────────────────────────────────────────────────────────
//
// REFERENCE. A frame, FOUR panes divided by a mullion and a transom, and a SILL that
// projects past the frame on both sides. The projecting sill is the field mark: it is
// what separates a window from a picture frame, which is otherwise the same drawing.
const WINDOW: ObjPart[] = [
  oRect('mass', 50, 46, 78, 84, 0, 2),                          // the frame
  oRect('lit', 31, 28, 28, 30, 0, 1),                           // four panes
  oRect('lit', 69, 28, 28, 30, 0, 1),
  oRect('lit', 31, 64, 28, 30, 0, 1),
  oRect('lit', 69, 64, 28, 30, 0, 1),
  oBar('line', 50, 8, 50, 84, 5),                               // the mullion
  oBar('line', 14, 46, 86, 46, 5),                              // and the transom
  oRect('mass', 50, 92, 96, 8, 0, 1.5),                         // the sill, proud of the frame
  oRect('dark', 50, 98, 96, 5, 0, 1.5),
];
export const window = (x: number, y: number, w: number, h: number) => fit(WINDOW, x, y, w, h);

// ── WHEEL ────────────────────────────────────────────────────────────────────
//
// REFERENCE. A cart wheel is three things: a thick outer FELLOE, a HUB at the centre,
// and SPOKES radiating between them. The felloe has to read as a band — a plain disc
// with lines across it is a pie chart.
const WHEEL: ObjPart[] = [
  oEll('mass', 50, 50, 96, 96),                                 // the felloe
  oEll('dark', 50, 50, 74, 74),                                 // its inner edge
  ...[0, 45, 90, 135].map((a) => {                              // the spokes, as four pairs
    const r = (a * Math.PI) / 180;
    return oBar('line', 50 - Math.cos(r) * 36, 50 - Math.sin(r) * 36, 50 + Math.cos(r) * 36, 50 + Math.sin(r) * 36, 5);
  }),
  oEll('mass', 50, 50, 26, 26),                                 // the hub
  oEll('dark', 50, 50, 10, 10),                                 // and the axle
];
export const wheel = (x: number, y: number, w: number, h: number) => fit(WHEEL, x, y, w, h);

// ── COIN ─────────────────────────────────────────────────────────────────────
//
// REFERENCE. A struck coin is a disc with a RAISED RIM round a sunken field, and the
// device stamped in the middle. Seen very slightly from the edge it also has
// THICKNESS, which is the difference between a coin and a full stop.
const COIN: ObjPart[] = [
  oEll('dark', 50, 58, 84, 84),                                 // the coin's edge, below
  oEll('mass', 50, 50, 84, 84),                                 // the face
  oEll('dark', 50, 50, 64, 64),                                 // the sunken field inside the rim
  oEll('line', 50, 50, 30, 30),                                 // the device: a ring and a boss,
  oEll('mass', 50, 50, 20, 20),                                 // never two crossed bars
  oEll('line', 50, 50, 8, 8),
];
export const coin = (x: number, y: number, w: number, h: number) => fit(COIN, x, y, w, h);

// ── LEAF ─────────────────────────────────────────────────────────────────────
//
// REFERENCE. A leaf is an OVATE blade with a POINT at its tip, a MIDRIB running its
// length and veins branching off it, on a stalk. An ellipse alone is a seed.
const LEAF: ObjPart[] = [
  oEll('mass', 50, 56, 66, 62),                                 // the blade, wider than tall-ish
  oTri('mass', 50, 30, 62, 22, 'up'),                           // with a SHORT point at the tip
  oBar('line', 50, 92, 50, 22, 4),                              // the midrib, through the stalk
  oBar('line', 48, 50, 26, 44, 2.6),                            // veins, rising shallowly
  oBar('line', 52, 50, 74, 44, 2.6),
  oBar('line', 48, 68, 28, 60, 2.6),
  oBar('line', 52, 68, 72, 60, 2.6),
];
export const leaf = (x: number, y: number, w: number, h: number) => fit(LEAF, x, y, w, h);

// ── PLINTH ───────────────────────────────────────────────────────────────────
//
// REFERENCE. A photographed plinth labels its own three parts, and there are exactly
// three: the base course, wider than everything above it; the DIE, the plain block
// that carries the statue; and the CAP, which projects past the die again. A single
// box is the die with both mouldings left off — which is twelve scenes of this corpus.
const PLINTH: ObjPart[] = [
  oRect('mass', 50, 14, 92, 14, 0, 1),                          // the cap, projecting
  oRect('dark', 50, 22, 92, 5),                                 // its underside
  oRect('mass', 50, 54, 70, 56),                                // the die
  oRect('dark', 50, 82, 100, 5),                                // the base's own shadow line
  oRect('mass', 50, 90, 100, 18, 0, 1),                         // the base course, wider still
];
export const plinth = (x: number, y: number, w: number, h: number) => fit(PLINTH, x, y, w, h);

// ── COLUMN ───────────────────────────────────────────────────────────────────
//
// REFERENCE. A classical column is a BASE, a shaft that TAPERS as it rises, and a
// CAPITAL that flares out again under a square abacus. The taper is called entasis
// and it is the reason a drawn column with parallel sides reads as a pipe.
const COLUMN: ObjPart[] = [
  oRect('mass', 50, 9, 80, 12, 0, 1),                           // the abacus
  ...trapezoid('mass', 50, 21, 76, 44, 14),                     // the capital, flaring UP to it
  ...trapezoid('mass', 50, 56, 42, 52, 58),                     // the shaft, tapering as it rises
  oBar('dark', 40, 30, 39, 84, 3.5),                            // the flutes
  oBar('dark', 50, 29, 50, 85, 3.5),
  oBar('dark', 60, 30, 61, 84, 3.5),
  oRect('mass', 50, 92, 66, 14, 0, 1),                          // the base
];
export const column = (x: number, y: number, w: number, h: number) => fit(COLUMN, x, y, w, h);

// ── CAVE ─────────────────────────────────────────────────────────────────────
//
// REFERENCE. Photographs and the icon agree on two things and only two: an outer ROCK
// MASS that is a dome wider than it is tall, and a MOUTH inside it that is dark, arched
// at the top and FLAT ALONG THE FLOOR. A bordered rectangle has neither — it is a
// doorway at best, and in the lesson it stands for it is Plato's cave.
//
// The mouth is drawn as a shadow rather than cut out, because nothing in these
// primitives can punch a hole: a rounded head on straight jambs, both inside the rock.
const CAVE: ObjPart[] = [
  oEll('mass', 50, 72, 98, 56),                                 // the rock, a broad dome
  oEll('mass', 21, 65, 42, 34),                                 // with an irregular skyline —
  oEll('mass', 78, 67, 44, 32),                                 // a smooth dome is an igloo
  oEll('mass', 46, 53, 50, 30),
  oEll('dark', 50, 72, 48, 40),                                 // the mouth: a rounded head
  oRect('dark', 50, 87, 48, 26),                                // on jambs, down to the floor
  oBar('line', 26, 98, 74, 98, 3),                              // and the floor it stands on
];
export const cave = (x: number, y: number, w: number, h: number) => fit(CAVE, x, y, w, h);

/** Every object, by name — what `sheet-objects` and `check:objects` walk. */
export const OBJECTS = {
  tree, ship, table, book, lamp, cup, crate, hammer, flute, bench, drum,
  door, shelf, flag, bridge, window, wheel, coin, leaf, plinth, column, cave,
} as const;
export type ObjectName = keyof typeof OBJECTS;

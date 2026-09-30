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
export type ObjPart = (
  | { k: 'ell'; role: Role; x: number; y: number; w: number; h: number; rot: number }
  | { k: 'rect'; role: Role; x: number; y: number; w: number; h: number; rot: number; rad: number }
  | { k: 'bar'; role: Role; x1: number; y1: number; x2: number; y2: number; t: number }
  | { k: 'tri'; role: Role; x: number; y: number; w: number; h: number; dir: 'up' | 'down' | 'left' | 'right'; rot: number }
) & { /** A real-world colour for this part (NATURAL) in place of the branch's tone. */ nat?: NaturalKey };

// ─────────────────────────────────────────────────────────────────────────────
// THE COLOURS THINGS ACTUALLY ARE (2026-09-30, LESSON_RULES AP11).
//
// The owner, on the first economics lesson: *"if an apple is red, use red. If a loaf
// of bread is a certain color, use that color … It's okay to use other colors in the
// lessons."* The branch tones are the stage's GROUND and its diagrams; an object a
// reader knows by its colour may wear that colour instead. A red apple drawn in the
// branch's blue-grey is a drawing of an apple-shaped stone.
//
// They live HERE, in one table, rather than as hex in a scene, for the reason H60
// exists: a colour typed into a scene can never be repainted, and one table can.
// Each entry is a pair so the one-light rule holds — `base` for a lit body, `shade`
// for its plane in shadow — and names the ink a word needs to be read on it
// (`label`). `check:objects` re-derives both: shade darker than base, and the label
// at 4.5:1 on the BASE — a word sits on the lit face, never across the shaded plane,
// because no mid tone can hold one ink at 4.5:1 on both halves of itself. Add an entry for the object you are drawing, with what it
// is, rather than bending an existing one.
// ─────────────────────────────────────────────────────────────────────────────
export const NATURAL = {
  apple:      { base: '#B8322A', shade: '#8C2520', label: '#FAFAF7', what: 'a red eating apple' },
  appleGreen: { base: '#7FA83A', shade: '#5F7F2A', label: '#1A1A1A', what: 'a green apple, a pear' },
  leaf:       { base: '#4F7A30', shade: '#3B5C24', label: '#FAFAF7', what: 'a leaf, grass, a stalk' },
  crust:      { base: '#B9783A', shade: '#8E5A28', label: '#1A1A1A', what: 'a baked crust — bread, pie, pastry' },
  crumb:      { base: '#EFD7A2', shade: '#D9BB7C', label: '#1A1A1A', what: 'the inside of a loaf, cut' },
  wood:       { base: '#8E5F37', shade: '#6B4829', label: '#FAFAF7', what: 'planks, a crate, a table, a handle' },
  brass:      { base: '#C9A13B', shade: '#9C7B2A', label: '#1A1A1A', what: 'a gold coin, brass, a trumpet' },
  copper:     { base: '#A35C31', shade: '#7C4524', label: '#FAFAF7', what: 'a copper coin, a pan' },
  silver:     { base: '#C4C8CC', shade: '#9CA2A8', label: '#1A1A1A', what: 'a silver coin, steel, a spoon' },
  cheese:     { base: '#E8C04E', shade: '#C29B32', label: '#1A1A1A', what: 'a hard yellow cheese' },
  orange:     { base: '#E58A2C', shade: '#B86A1E', label: '#1A1A1A', what: 'an orange, a carrot, a pumpkin' },
  water:      { base: '#4F8DB8', shade: '#3B6D8F', label: '#1A1A1A', what: 'water, a pond, the sea' },
  brick:      { base: '#A8553A', shade: '#80402B', label: '#FAFAF7', what: 'brick, terracotta, a clay pot' },
  // phil1 colours:
  enamel:     { base: '#B03A2E', shade: '#852A21', label: '#FAFAF7', what: 'a bicycle frame, new, in red enamel' },
  rust:       { base: '#94583A', shade: '#6E412B', label: '#FAFAF7', what: 'old rusted steel — a worn-out part' },
  paper:      { base: '#F2EEE3', shade: '#D8D0BE', label: '#1A1A1A', what: 'paper — a bill, a receipt, a ticket' },
  // psych1 colours:
  coffee:     { base: '#5A3620', shade: '#3E2415', label: '#FAFAF7', what: 'brewed coffee, in a pot or a cup' },
  porcelain:  { base: '#F4F1EA', shade: '#D6D0C3', label: '#1A1A1A', what: 'a white china cup and saucer' },
  glass:      { base: '#DCE6EA', shade: '#B6C6CD', label: '#1A1A1A', what: 'clear glass, a coffee pot' },
  // growth1 colours:
  petal:      { base: '#F2B32C', shade: '#C98A1A', label: '#1A1A1A', what: 'a sunflower\'s petals, a buttercup' },
  seedhead:   { base: '#6A4024', shade: '#4A2C18', label: '#FAFAF7', what: 'a sunflower\'s seed disc, dark seeds' },
  soil:       { base: '#5B4130', shade: '#3E2C20', label: '#FAFAF7', what: 'damp potting soil, garden earth' },
  drySoil:    { base: '#CDB38A', shade: '#A98F66', label: '#1A1A1A', what: 'dry, pale, unwatered soil' },
  doorPaint:  { base: '#2F5D7C', shade: '#234862', label: '#FAFAF7', what: 'a front door painted blue' },
  coping:     { base: '#C2BBAB', shade: '#9E9888', label: '#1A1A1A', what: 'a wall\'s stone coping, a stone step' },
  felt:       { base: '#4A4D52', shade: '#35383C', label: '#FAFAF7', what: 'roofing felt, a slate roof, a shed\'s dark inside' },
  // biz1 colours:
  lemon:      { base: '#F2CF2E', shade: '#C9A51C', label: '#1A1A1A', what: 'a lemon\'s rind' },
  lemonade:   { base: '#F4E9A6', shade: '#D9CB7E', label: '#1A1A1A', what: 'cloudy lemonade in a jug or a cup' },
  beech:      { base: '#DDBE8E', shade: '#B9996A', label: '#1A1A1A', what: 'pale turned beech — a wooden lemon squeezer' },
  tinPaint:   { base: '#3F7258', shade: '#2D5540', label: '#FAFAF7', what: 'a cash tin in green enamelled steel' },
  // sci1 colours:
  iron:       { base: '#565B61', shade: '#393D42', label: '#FAFAF7', what: 'cast iron — a shot put, a cannonball, a heavy weight' },
  tennis:     { base: '#D3DE45', shade: '#A9B42C', label: '#1A1A1A', what: 'a tennis ball\'s optic-yellow felt' },
  slate:      { base: '#3C4347', shade: '#2B3134', label: '#FAFAF7', what: 'a writing slate, a slate chalkboard' },
  flagstone:  { base: '#A4A69F', shade: '#82847D', label: '#1A1A1A', what: 'grey paving flags, a patio' },
  // hist1 colours:
  shopPaint:  { base: '#2E5B4A', shade: '#22453A', label: '#FAFAF7', what: 'a shop front in Victorian green paint' },
  shopGlass:  { base: '#5E7581', shade: '#34444C', label: '#FAFAF7', what: 'a shop window\'s plate glass, dark inside' },
  football:   { base: '#F3F3EF', shade: '#C9CAC3', label: '#1A1A1A', what: 'a football\'s white panels' },
  bark:       { base: '#7A5A40', shade: '#58402D', label: '#FAFAF7', what: 'a twig\'s bark, a fallen stick' },
  cork:       { base: '#C69A62', shade: '#A57A43', label: '#1A1A1A', what: 'a cork notice board' },
  gloom:      { base: '#1F2A30', shade: '#141B1F', label: '#FAFAF7', what: 'the dark inside a shut shop, seen through a hole' },
} as const;
export type NaturalKey = keyof typeof NATURAL;

/**
 * An object drawn in a real colour: its BODY parts (mass, face, dark) take the natural
 * pair, its ink lines and paper highlights stay as they are — so the outline, the rim
 * and the shine are still this app's, and only the thing itself changes colour.
 */
export function tint(parts: readonly ObjPart[], key: NaturalKey): ObjPart[] {
  return parts.map((p) => (p.role === 'line' || p.role === 'lit' ? p : { ...p, nat: key }));
}

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
    const nat = p.nat ? NATURAL[p.nat] : null;
    const fill = nat && p.role === 'mass' ? nat.base
      : nat && (p.role === 'face' || p.role === 'dark') ? nat.shade
      : p.role === 'mass' ? tone.STONE
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
/**
 * HOW HEAVY AN OBJECT'S OUTLINE IS: the edge of the object, never a backing behind it
 * (LESSON_RULES AM11).
 *
 * The outline used to be one weight, 2.2 stage units, on everything — right on a
 * 150-unit menu board and wrong on a 22-unit café cup, where the ring round each part
 * was nearly half of all the ink drawn: the owner saw *"a black outline that goes
 * further outside of the mugs … a background of black."* So the weight is a share of
 * the object's own size (the square root of its body's width × height), capped at the
 * stage weight a large object is drawn at and floored where an edge still reads at
 * phone size. A caller's own `line` is a CAP on this, never a floor under it.
 */
export const OUTLINE = { max: 2.2, min: 0.7, share: 0.045 } as const;

/** The body parts' extent on the stage: x0, y0, x1, y1. */
export function bodyBox(parts: readonly { k: string; role?: string }[]): [number, number, number, number] | null {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const raw of parts) {
    if (raw.role !== 'mass' && raw.role !== 'face') continue;
    const p = raw as Record<string, any>;
    if (p.k === 'bar') {
      const t = p.t / 2;
      x0 = Math.min(x0, p.x1 - t, p.x2 - t); x1 = Math.max(x1, p.x1 + t, p.x2 + t);
      y0 = Math.min(y0, p.y1 - t, p.y2 - t); y1 = Math.max(y1, p.y1 + t, p.y2 + t);
    } else if (p.k === 'poly') {
      for (let i = 0; i + 1 < p.pts.length; i += 2) {
        x0 = Math.min(x0, p.pts[i]); x1 = Math.max(x1, p.pts[i]);
        y0 = Math.min(y0, p.pts[i + 1]); y1 = Math.max(y1, p.pts[i + 1]);
      }
    } else {
      x0 = Math.min(x0, p.x - p.w / 2); x1 = Math.max(x1, p.x + p.w / 2);
      y0 = Math.min(y0, p.y - p.h / 2); y1 = Math.max(y1, p.y + p.h / 2);
    }
  }
  return isFinite(x0) ? [x0, y0, x1, y1] : null;
}

/** The outline weight one drawing is struck at — see `OUTLINE`. */
export function outlineFor(parts: readonly { k: string; role?: string }[], cap: number = OUTLINE.max): number {
  const b = bodyBox(parts);
  if (!b) return Math.min(cap, OUTLINE.min);
  const size = Math.sqrt(Math.max(0, b[2] - b[0]) * Math.max(0, b[3] - b[1]));
  return Math.min(cap, OUTLINE.max, Math.max(OUTLINE.min, OUTLINE.share * size));
}

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

// ─────────────────────────────────────────────────────────────────────────────
// THE MARKET, for Economics lesson 1 (2026-09-29). Every one drawn against pictures
// fetched with `npm run ref` (scratchpad/ref/econ-*): Shepherd's Bush Market's striped
// canopies, a lattice apple pie, a scored bakery loaf, a Bank of England note, a
// framed chalk A-board, and apples in a crate.
// ─────────────────────────────────────────────────────────────────────────────

// ── STALL ────────────────────────────────────────────────────────────────────
//
// REFERENCE. A market stall is three things and the canopy is the one that names it:
// a STRIPED awning that slopes down toward the shopper and ends in a SCALLOPED
// valance, two thin posts holding it up, and a counter under it whose FRONT is a
// plain board. The stripes run front to back, so from the front they are vertical
// bands; the scallops are half-discs hanging off the valance's lower edge.
const STALL: ObjPart[] = [
  oBar('mass', 8, 16, 8, 100, 3),                               // the two posts, down to the ground
  oBar('mass', 92, 16, 92, 100, 3),
  ...trapezoid('mass', 50, 13, 84, 100, 18),                    // the canopy, sloping to the front
  oRect('lit', 22, 13, 9, 16, 0, 0),                            // its stripes: paper and the
  oRect('lit', 41, 13, 9, 16, 0, 0),                            // branch's own tone, as every
  oRect('lit', 59, 13, 9, 16, 0, 0),                            // market canopy is two colours
  oRect('lit', 78, 13, 9, 16, 0, 0),
  oRect('mass', 50, 25, 100, 6),                                // the valance's band
  oEll('mass', 6, 28, 12, 10), oEll('mass', 18.5, 28, 12, 10), // and its scallops
  oEll('mass', 31, 28, 12, 10), oEll('mass', 43.5, 28, 12, 10),
  oEll('mass', 56, 28, 12, 10), oEll('mass', 68.5, 28, 12, 10),
  oEll('mass', 81, 28, 12, 10), oEll('mass', 93.5, 28, 12, 10),
];
export const stall = (x: number, y: number, w: number, h: number) => fit(STALL, x, y, w, h);

// ── COUNTER ──────────────────────────────────────────────────────────────────
//
// REFERENCE. The stall's counter is its own object because the stall-holder stands
// BETWEEN the two: the canopy and its posts behind him, the counter in front of him,
// waist-high — a counter any higher hides the person selling. A lit top edge with
// thickness, a boarded front in shade, and the boards' seams.
const COUNTER: ObjPart[] = [
  oRect('mass', 50, 8, 100, 14, 0, 1.5),                        // the top, lit, with its thickness
  oRect('face', 50, 58, 96, 84, 0, 2),                          // the boarded front, in shade
  oBar('line', 4, 40, 96, 40, 2.4),                             // the seams between the boards
  oBar('line', 4, 70, 96, 70, 2.4),
];
export const counter = (x: number, y: number, w: number, h: number) => fit(COUNTER, x, y, w, h);

// ── PIE ──────────────────────────────────────────────────────────────────────
//
// REFERENCE. Seen from the side and a little above, a pie is a TIN that tapers to
// its foot, a thick crust RIM round the top, and a LATTICE of pastry strips over a
// darker filling. The lattice is the field mark: without it the same shape is a
// cake, a tart or a hat. Drawn in the LIT role, the pale of baked pastry, because
// a strip in the body's own role is painted under the filling and vanishes.
const PIE: ObjPart[] = [
  ...trapezoid('face', 50, 70, 74, 96, 26),                     // the tin, tapering to its foot
  oEll('mass', 50, 52, 98, 42),                                 // the crust rim, seen from above
  oEll('dark', 50, 52, 80, 30),                                 // the filling inside it
  oBar('lit', 26, 46, 48, 61, 5),                               // the lattice, one way —
  oBar('lit', 40, 41, 66, 59, 5),
  oBar('lit', 58, 40, 76, 53, 5),
  oBar('lit', 74, 46, 52, 61, 5),                               // — and across it
  oBar('lit', 60, 41, 34, 59, 5),
  oBar('lit', 42, 40, 24, 53, 5),
];
export const pie = (x: number, y: number, w: number, h: number) => fit(PIE, x, y, w, h);

// ── LOAF ─────────────────────────────────────────────────────────────────────
//
// REFERENCE. A bakery loaf is a DOME much wider than it is tall, sitting on a flat
// base, with SCORES slashed across the top at a slant — the scores are what say
// bread rather than stone.
const LOAF: ObjPart[] = [
  oEll('mass', 50, 62, 96, 62),                                 // the dome
  oRect('face', 50, 88, 80, 10, 0, 5),                          // the flat, darker base
  oBar('dark', 26, 52, 36, 38, 4.5),                            // three scores, slanting
  oBar('dark', 44, 50, 54, 36, 4.5),
  oBar('dark', 62, 52, 72, 38, 4.5),
  oEll('lit', 34, 48, 12, 6, -20),                              // the lamp's sheen on the crust
];
export const loaf = (x: number, y: number, w: number, h: number) => fit(LOAF, x, y, w, h);

// ── NOTE ─────────────────────────────────────────────────────────────────────
//
// REFERENCE. Every banknote shares one layout: a ruled BORDER, a PORTRAIT in an
// oval on one side, a large VALUE numeral on the other. The portrait and the numeral
// are what turn a paper rectangle into money.
const NOTE: ObjPart[] = [
  oRect('mass', 50, 50, 100, 56, 0, 4),                         // the note
  oRect('lit', 50, 50, 88, 44, 0, 2),                           // its field inside the border
  oEll('mass', 28, 50, 26, 34),                                 // the portrait's oval
  oEll('line', 28, 44, 10, 12),                                 // the head and shoulders in it
  oEll('line', 28, 60, 18, 10),
  oBar('line', 62, 38, 62, 62, 4),                              // the value: a 1 …
  oEll('line', 78, 50, 16, 24),                                 // … and a 0
  oEll('lit', 78, 50, 8, 16),
];
export const note = (x: number, y: number, w: number, h: number) => fit(NOTE, x, y, w, h);

// ── CHALKBOARD ───────────────────────────────────────────────────────────────
//
// REFERENCE. A shop's A-board is a slate panel in a WOODEN FRAME standing on two
// splayed legs, with chalk writing on the slate. The frame and the splay are the
// field marks: a dark rectangle alone is a screen.
const CHALKBOARD: ObjPart[] = [
  oBar('mass', 20, 70, 10, 100, 6),                             // the legs, splayed
  oBar('mass', 80, 70, 90, 100, 6),
  oRect('mass', 50, 40, 86, 76, 0, 3),                          // the wooden frame
  oRect('dark', 50, 40, 70, 60, 0, 1.5),                        // the slate in it
  oBar('lit', 26, 24, 52, 24, 3),                               // chalk: a heading line
  oBar('lit', 26, 42, 70, 42, 2.4),                             // and two prices
  oBar('lit', 26, 56, 62, 56, 2.4),
];
export const chalkboard = (x: number, y: number, w: number, h: number) => fit(CHALKBOARD, x, y, w, h);

// ── APPLE ────────────────────────────────────────────────────────────────────
//
// REFERENCE. An apple is round but NOT a circle: it is a little wider than tall with
// a DIMPLE at the top where the STALK comes out, often with a leaf. The dimple and
// the stalk are what separate it from a ball or a tomato.
const APPLE: ObjPart[] = [
  oEll('mass', 36, 60, 56, 70),                                 // two lobes make the shoulders
  oEll('mass', 64, 60, 56, 70),                                 // and the dimple between them
  oEll('mass', 50, 66, 70, 62),
  oBar('line', 50, 34, 55, 14, 3.5),                            // the stalk
  oEll('face', 67, 18, 22, 11, -25),                            // a leaf
  oEll('lit', 34, 52, 10, 18, -15),                             // the shine
];
export const apple = (x: number, y: number, w: number, h: number) => fit(APPLE, x, y, w, h);

// ─────────────────────────────────────────────────────────────────────────────
// THE BICYCLE WORKSHOP, for Philosophy lesson 1 (2026-09-30). Drawn against pictures
// fetched with `npm run ref` (scratchpad/ref/phil1-*): a labelled bicycle diagram, a
// bare frame held in a Park Tool stand, a shop till receipt, a chalk board hung on a
// wall, and slatted fruit crates.
// ─────────────────────────────────────────────────────────────────────────────

/** Bars laid round a circle: a hollow RING, which none of the primitives is. */
function phil1Ring(role: Role, cx: number, cy: number, r: number, t: number, n = 28): ObjPart[] {
  const out: ObjPart[] = [];
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2;
    const a1 = ((i + 1) / n) * Math.PI * 2;
    out.push(oBar(role, cx + Math.cos(a0) * r, cy + Math.sin(a0) * r, cx + Math.cos(a1) * r, cy + Math.sin(a1) * r, t));
  }
  return out;
}

// ── BICYCLE WHEEL ────────────────────────────────────────────────────────────
//
// REFERENCE. A bicycle wheel is OPEN — a dark tyre round a thin rim, a small hub, and
// wire spokes between them with daylight showing through. That is the whole
// difference from the cart wheel above, which is a solid felloe on four fat spokes:
// drawn solid, a bicycle's wheel reads as a disc brake or a plate. So the tyre is a
// ring of ink and there is nothing behind the spokes at all.
const BICYCLE_WHEEL: ObjPart[] = [
  oEll('mass', 50, 50, 16, 16),                                 // the hub
  ...Array.from({ length: 12 }, (_, i) => {                     // twelve spokes, hub to rim
    const a = ((i * 30 + 15) * Math.PI) / 180;
    return oBar('line', 50 + Math.cos(a) * 7, 50 + Math.sin(a) * 7, 50 + Math.cos(a) * 40, 50 + Math.sin(a) * 40, 2.4);
  }),
  ...phil1Ring('line', 50, 50, 44, 9),                          // the tyre, black rubber
  oEll('line', 50, 50, 5, 5),                                   // and the axle nut
];
export const bicycleWheel = (x: number, y: number, w: number, h: number) => fit(BICYCLE_WHEEL, x, y, w, h);

// ── BICYCLE FRAME ────────────────────────────────────────────────────────────
//
// REFERENCE. The diagram names it: a DIAMOND frame of top tube, down tube and seat
// tube, and behind it a rear triangle of seat stays and chain stays meeting at the
// rear axle. The head tube leans back, the fork carries its line down to the front
// axle, and the saddle and the bars stand at about the same height, a little above
// the top tube. Drawn FRONT TO THE LEFT, with no wheels: the wheels are their own
// object, laid first, so the frame and the chain sit in front of the spokes as they
// do on a real bicycle. Author in a square and lay it square — the wheels are circles.
const BICYCLE_FRAME: ObjPart[] = [
  oBar('mass', 31.5, 59, 56.5, 83.6, 6),                        // the down tube
  oBar('mass', 56.5, 83.6, 63.5, 60.5, 5.5),                    // the seat tube
  oBar('mass', 34, 55, 63.5, 61.5, 5),                          // the top tube, sloping back
  oBar('mass', 63.5, 61.5, 80, 81, 3.8),                        // the seat stays
  oBar('mass', 56.5, 83.6, 80, 81, 3.8),                        // and the chain stays
  oBar('mass', 34.2, 52.5, 30.4, 62, 7),                        // the head tube, leaning back
  oBar('mass', 30.6, 61, 20, 81, 4.5),                          // and the fork on its line
  oBar('lit', 38, 55.8, 58, 60.3, 1.3),                         // the enamel's shine
  oBar('line', 63.5, 60, 66.5, 48, 3.2),                        // the seat post
  oBar('line', 59.5, 47, 71, 46, 4.2),                          // the saddle: a narrow nose …
  oEll('line', 71.5, 46, 8, 6),                                 // … and a broad back
  oBar('line', 34.2, 53, 33.5, 47.5, 3.4),                      // the stem
  oBar('line', 33.5, 47.5, 39.5, 44, 3.2),                      // the bars, swept back
  oBar('line', 39.5, 44, 43, 44.5, 4.6),                        // and the grip
  oBar('line', 56.5, 76.6, 80, 78.2, 1.4),                      // the chain, top run …
  oBar('line', 56.5, 90.6, 80, 83.8, 1.4),                      // … and bottom
  oEll('line', 80, 81, 7, 7),                                   // the rear sprocket
  oEll('line', 56.5, 83.6, 14, 14),                             // the chainring
  oEll('lit', 56.5, 83.6, 7, 7),
  oBar('line', 56.5, 83.6, 49, 91, 3.2),                        // the crank
  oRect('line', 48.5, 92, 8, 2.8, 0, 1),                        // and its pedal
];
export const bicycleFrame = (x: number, y: number, w: number, h: number) => fit(BICYCLE_FRAME, x, y, w, h);
/** Points on the frame, in its own 100-unit square: what a hand can hold. */
export const BIKE_AT = {
  frontAxle: { x: 20, y: 81 }, rearAxle: { x: 80, y: 81 }, wheelR: 17,
  grip: { x: 41, y: 44.3 }, saddle: { x: 68, y: 45.5 }, seatPost: { x: 65, y: 54 },
  topTube: { x: 50, y: 58.6 },
} as const;

// ── REPAIR STAND ─────────────────────────────────────────────────────────────
//
// REFERENCE. A workshop repair stand is a POST on a splayed foot with a CLAMP on an
// arm at the top, and the clamp's jaws close round the bicycle's seat post so the
// wheels hang clear of the floor. The post has a collar where it telescopes. The
// clamp is what makes it a repair stand rather than a lamp or a microphone.
const REPAIR_STAND: ObjPart[] = [
  oBar('mass', 62, 86, 28, 98, 4.5),                            // the feet, splayed
  oBar('mass', 62, 86, 96, 98, 4.5),
  oBar('face', 62, 86, 72, 95, 4),                              // and the one turned away
  oBar('mass', 62, 88, 62, 48, 6.5),                            // the post …
  oBar('mass', 62, 48, 62, 16, 4.6),                            // … telescoping
  oRect('dark', 62, 48, 10, 5, 0, 1.5),                         // at its collar
  oRect('mass', 62, 15, 9, 8, 0, 2),                            // the head
  oBar('mass', 62, 16, 40, 22, 4.6),                            // the arm
  oRect('mass', 36, 23, 8, 12, 0, 2),                           // the jaws …
  oRect('dark', 36, 23, 2.4, 12, 0, 1),                         // … parted round the seat post
  oBar('line', 42, 20, 50, 11, 2.4),                            // and the clamp's lever
];
export const repairStand = (x: number, y: number, w: number, h: number) => fit(REPAIR_STAND, x, y, w, h);
/** Where the jaws are, in the stand's own square. */
export const STAND_JAWS = { x: 36, y: 23 } as const;

// ── PARTS CRATE ──────────────────────────────────────────────────────────────
//
// REFERENCE. A fruit crate is SLATTED: boards across the front with dark gaps
// between them, and square corner posts the boards are nailed to. Open-topped and
// seen from a little above, the inside of the back wall shows over the front board.
// It is TWO objects because what is in it must sit BETWEEN them: the back and the
// inside, then the old wheel, then the front, so the wheel is in the crate rather
// than laid on top of it. Both are asked for at the same box. The bent frame tube
// is drawn into the back, in rust — the old parts are the colour of old steel.
const CRATE_BACK_WOOD: ObjPart[] = [
  oRect('mass', 50, 42, 100, 16, 0, 1),                         // the back boards, over the front
  oRect('dark', 50, 45.5, 90, 9),                               // and the inside of the crate
  oBar('lit', 3, 35.5, 97, 35.5, 2),                            // their top edge, lit
];
const CRATE_BACK_TUBE: ObjPart[] = [
  oBar('mass', 70, 50, 78, 22, 6.5),                            // an old frame tube, bent …
  oBar('mass', 78, 22, 93, 10, 6.5),                            // … at a crack
  oEll('dark', 94, 9.5, 4.5, 4.5),                              // its sawn-off end
];
export const partsCrateBack = (x: number, y: number, w: number, h: number) =>
  fit([...tint(CRATE_BACK_WOOD, 'wood'), ...tint(CRATE_BACK_TUBE, 'rust')], x, y, w, h);
const CRATE_FRONT: ObjPart[] = [
  oRect('mass', 50, 75, 100, 50, 0, 1.5),                       // the front boards
  oBar('dark', 9, 66.5, 91, 66.5, 2.4),                         // the gaps between the slats
  oBar('dark', 9, 83.5, 91, 83.5, 2.4),
  oRect('face', 5, 75, 10, 50, 0, 1),                           // the corner posts
  oRect('face', 95, 75, 10, 50, 0, 1),
  oBar('lit', 11, 51.8, 89, 51.8, 1.8),                         // the front board's top edge
  oEll('line', 5, 58, 2.4, 2.4), oEll('line', 95, 58, 2.4, 2.4), // and its nails
  oEll('line', 5, 92, 2.4, 2.4), oEll('line', 95, 92, 2.4, 2.4),
];
export const partsCrateFront = (x: number, y: number, w: number, h: number) => fit(tint(CRATE_FRONT, 'wood'), x, y, w, h);

// ── REPAIR BILL ──────────────────────────────────────────────────────────────
//
// REFERENCE. A shop receipt is a narrow strip of paper: the shop's name printed BOLD
// across the top, the items in a column down the left with their prices ranged
// right, a rule, and the TOTAL set larger — and it is TORN off the roll, so its foot
// is a zig-zag rather than a straight edge. The torn foot is what says receipt rather
// than card.
const REPAIR_BILL: ObjPart[] = [
  oRect('mass', 50, 46, 64, 84, 0, 1),                          // the strip of paper
  ...[22, 30, 38, 46, 54, 62, 70, 78].map((x) => oTri('mass', x, 90, 8, 6, 'down')), // torn off the roll
  oRect('dark', 79, 47, 5, 80),                                 // the curl along its edge
  oBar('line', 30, 15, 70, 15, 5),                              // the shop's name
  oBar('line', 27, 30, 55, 30, 2.6), oBar('line', 63, 30, 72, 30, 2.6), // three items, priced
  oBar('line', 27, 40, 52, 40, 2.6), oBar('line', 63, 40, 72, 40, 2.6),
  oBar('line', 27, 50, 57, 50, 2.6), oBar('line', 63, 50, 72, 50, 2.6),
  oBar('line', 26, 59, 74, 59, 1.4),                            // a rule
  oBar('line', 27, 70, 48, 70, 4.4),                            // and the TOTAL: nothing
  oEll('line', 66, 70, 10, 13), oEll('lit', 66, 70, 4.5, 7.5),
];
export const repairBill = (x: number, y: number, w: number, h: number) => fit(tint(REPAIR_BILL, 'paper'), x, y, w, h);

// ── WALL BOARD ───────────────────────────────────────────────────────────────
//
// REFERENCE. A chalk board hung in a shop is a dark slate in a plain WOODEN FRAME,
// hung from a single nail on a cord that makes a triangle over it, with a ledge under
// it for the chalk. The cord and the nail are what say it hangs on a wall rather than
// standing on legs like the pavement A-board. The slate's face is the scene's to
// draw, because the writing on it changes.
const WALL_BOARD: ObjPart[] = [
  oRect('mass', 50, 58, 100, 80, 0, 2),                         // the frame
  oRect('dark', 50, 58, 88, 68, 0, 1),                          // the slate
  oRect('face', 50, 99.5, 72, 4, 0, 1),                         // the chalk ledge under it
  oBar('line', 50, 2, 12, 18, 1.8),                             // the cord, from the nail …
  oBar('line', 50, 2, 88, 18, 1.8),                             // … to both corners
  oEll('line', 50, 2, 4, 4),                                    // and the nail
];
export const wallBoard = (x: number, y: number, w: number, h: number) => fit(tint(WALL_BOARD, 'wood'), x, y, w, h);
/** The slate inside the frame, in the board's own square. */
export const WALL_SLATE = { x: 50, y: 58, w: 88, h: 68 } as const;

// ── WORKBENCH ────────────────────────────────────────────────────────────────
//
// REFERENCE. A workshop bench is a THICK top on square legs braced by a low shelf,
// with a VICE bolted to one end — the vice is its field mark, the thing a table does
// not have. A receipt spike stands on it: a nail on a round foot, bills pushed down
// over the point. Seen side on, at the HIP of the man working at it (AP10).
const WORKBENCH: ObjPart[] = [
  oBar('mass', 8, 58, 8, 100, 6),                               // the legs
  oBar('mass', 92, 58, 92, 100, 6),
  oRect('mass', 50, 86, 88, 5, 0, 1),                           // the low shelf
  oRect('mass', 50, 53, 100, 8, 0, 1.5),                        // the top, thick
  oRect('face', 50, 61, 92, 8, 0, 1),                           // its apron, in shade
  oRect('mass', 84, 43, 14, 11, 0, 1.5),                        // the vice, on the top's end
  oRect('dark', 84, 43, 2.4, 11, 0, 1),                         // its jaws
  oBar('line', 77, 46, 70, 46, 2.4),                            // and its screw handle
  oEll('line', 7, 48.2, 10, 3),                                 // the spike's round foot
  oBar('line', 7, 48, 7, 12, 2.4),                              // and its nail
];
export const workbench = (x: number, y: number, w: number, h: number) => fit(WORKBENCH, x, y, w, h);
/** The spike's point, in the bench's own square. */
export const BENCH_SPIKE = { x: 7, y: 12 } as const;

// ── PEGBOARD ─────────────────────────────────────────────────────────────────
//
// REFERENCE. The wall of a bicycle workshop is hung with what it runs on: spare
// TYRES looped over pegs and SPANNERS in a row, on a board punched with a grid of
// holes. The grid is the field mark of a pegboard; the tyres are what make it a
// bicycle shop's. Tools and tyres are ink — rubber and dark steel against the board.
const PEGBOARD: ObjPart[] = [
  oRect('mass', 50, 50, 100, 96, 0, 2),                         // the board
  oRect('face', 50, 97.5, 100, 5, 0, 1),                        // its lower edge, in shade
  ...[14, 30, 46, 62, 78].flatMap((y) => [12, 28, 44, 60, 76, 92].map((x) => oEll('dark', x, y, 2.4, 2.4))), // the holes
  oBar('line', 70, 14, 70, 22, 3),                              // a peg …
  ...phil1Ring('line', 70, 44, 20, 6.5),                        // … with a spare tyre on it
  oBar('line', 20, 16, 20, 20, 3),                              // two more pegs …
  oBar('line', 36, 16, 36, 20, 3),
  oBar('line', 20, 22, 20, 56, 4.4), oEll('line', 20, 60, 9, 8), oEll('lit', 20, 62, 4, 4), // … and two spanners
  oBar('line', 36, 22, 36, 48, 4), oEll('line', 36, 52, 8, 7), oEll('lit', 36, 54, 3.6, 3.6),
];
export const pegboard = (x: number, y: number, w: number, h: number) => fit(PEGBOARD, x, y, w, h);

// ── phil1: objects for this lesson go ABOVE this line ──

// ─────────────────────────────────────────────────────────────────────────────
// THE CAFÉ COUNTER, for Psychology lesson 1 (2026-09-30). Drawn against pictures
// fetched with `node scripts/get-reference.mjs` (scratchpad/ref/psych-*): a drip
// machine's glass carafe half full of coffee, a china coffee cup on its saucer, a
// café's hung chalk menu, a counter with a fluted front, and folded table tents.
// ─────────────────────────────────────────────────────────────────────────────

/** Give parts a real colour (AP11) without `tint`'s all-or-nothing. */
const psychNat = (k: NaturalKey, ...ps: ObjPart[]): ObjPart[] => ps.map((p) => ({ ...p, nat: k }));

// ── CARAFE ───────────────────────────────────────────────────────────────────
//
// REFERENCE. A drip machine's coffee pot is a GLASS BULB, widest low down and flat
// on its foot, narrowing to a neck that a black plastic COLLAR rings; a black LID
// with a knob sits in the collar, and the black HANDLE hangs off the collar down the
// side of the bulb. The coffee is the recognition: a dark liquid filling the bulb to
// a FLAT level line, with the glass showing clear above it and one bright streak of
// reflection down the lit side. Handle on the LEFT here, spout lip on the right.
const CARAFE: ObjPart[] = [
  oBar('line', 30, 24, 12, 32, 6),                               // the handle, off the collar
  oBar('line', 12, 32, 12, 58, 6),                               // down the side of the bulb
  oBar('line', 12, 58, 24, 66, 6),
  ...psychNat('glass',
    oEll('mass', 56, 64, 72, 58),                                // the bulb
    oRect('mass', 56, 32, 52, 24, 0, 4),                         // the neck
    oRect('mass', 56, 90, 54, 10, 0, 3),                         // and its flat foot
    oTri('mass', 85, 27, 10, 8, 'right'),                        // the pouring lip
  ),
  ...psychNat('coffee',
    oRect('mass', 56, 62, 66, 20),                               // the coffee, to a FLAT line
    oEll('mass', 56, 75, 70, 38),                                // following the bulb down
    oRect('mass', 56, 88, 52, 10, 0, 3),
    oEll('dark', 78, 74, 12, 28),                                // its side turned from the lamp
  ),
  oBar('lit', 32, 46, 30, 60, 4),                                // the glass's reflection, lit side
  oRect('line', 56, 22, 58, 7, 0, 2),                            // the black collar
  oEll('line', 56, 16, 46, 9),                                   // the lid
  oEll('line', 56, 10, 14, 9),                                   // and its knob
];
export const carafe = (x: number, y: number, w: number, h: number) => fit(CARAFE, x, y, w, h);

// ── COFFEE CUP ───────────────────────────────────────────────────────────────
//
// REFERENCE. A café cup is WHITE CHINA on a SAUCER: a bowl a little wider at the rim
// than at its foot, a ring HANDLE standing clear of the wall, and the saucer a flat
// ellipse wider than the cup. Seen slightly from above the rim is an ellipse — and in
// it the COFFEE, which is what says a full cup rather than a pot or a vase.
const COFFEE_CUP: ObjPart[] = [
  oBar('line', 76, 44, 92, 44, 7),                               // the handle, a ring standing
  oBar('line', 92, 44, 92, 64, 7),                               // clear of the wall
  oBar('line', 92, 64, 74, 68, 7),
  ...psychNat('porcelain',
    oEll('mass', 50, 88, 98, 18),                                // the saucer
    ...trapezoid('mass', 46, 60, 66, 48, 46),                    // the cup, narrowing to its foot
    oEll('mass', 46, 37, 66, 16),                                // its rim, seen from above
    oEll('dark', 68, 60, 8, 34),                                 // the wall turned from the lamp
    oEll('dark', 50, 93, 70, 6),                                 // the saucer's own shadow
  ),
  ...psychNat('coffee', oEll('mass', 46, 38, 54, 10)),           // and the coffee in it
];
export const coffeeCup = (x: number, y: number, w: number, h: number) => fit(COFFEE_CUP, x, y, w, h);

// ── TABLE TENT ───────────────────────────────────────────────────────────────
//
// REFERENCE. A table tent is a card FOLDED into an A, stood on a counter: seen from
// the front and a little to one side it is a panel carrying its word, a ridge along
// the top where it folds, and a sliver of the back panel showing beside it in shade.
// A bare card is a sign; the fold and the far panel are what make it stand.
const TENT_CARD: ObjPart[] = [
  oTri('face', 84, 54, 30, 88, 'up'),                            // the back panel, its edge in shade
  ...trapezoid('mass', 44, 54, 80, 88, 88),                      // the front panel, leaning back
  oRect('lit', 44, 58, 78, 58, 0, 2),                            // the paper the word is on
];
export const tentCard = (x: number, y: number, w: number, h: number) => fit(TENT_CARD, x, y, w, h);

// ── MENU BOARD ───────────────────────────────────────────────────────────────
//
// REFERENCE. A café's menu is a SLATE in a WOODEN FRAME hung on the back wall above
// the counter, on a wire from one hook, with a chalk ledge along its foot. The wire
// and the ledge are what say "hung on a wall", where the pavement board stands on legs.
const MENU_BOARD: ObjPart[] = [
  oBar('line', 26, 12, 50, 1, 1.6),                              // the wire, up to its hook
  oBar('line', 74, 12, 50, 1, 1.6),
  oEll('line', 50, 1.5, 4, 3),
  ...psychNat('wood', oRect('mass', 50, 52, 100, 84, 0, 3)),     // the frame
  oRect('dark', 50, 52, 88, 72, 0, 1.5),                         // the slate inside it
  ...psychNat('wood', oRect('mass', 50, 96, 92, 7, 0, 2)),       // and the chalk ledge under it
];
export const menuBoard = (x: number, y: number, w: number, h: number) => fit(MENU_BOARD, x, y, w, h);

// ── CAFÉ COUNTER ─────────────────────────────────────────────────────────────
//
// REFERENCE. A café counter is a thick WOODEN TOP over a FLUTED front — narrow
// vertical boards or reeds, which is what separates it from a market stall's plain
// planks — standing on a dark KICK PLATE at the floor.
const CAFE_COUNTER: ObjPart[] = [
  ...psychNat('wood', oRect('mass', 50, 9, 100, 18, 0, 1.5)),    // the wooden top, lit
  oRect('mass', 50, 58, 96, 80, 0, 1),                           // the front
  ...psychNat('wood', oRect('dark', 50, 20, 100, 5)),            // the top's underside
  ...[8, 16, 24, 32, 40, 48, 56, 64, 72, 80, 88].map((x) => oBar('dark', x, 28, x, 86, 4)),   // the flutes
  oRect('dark', 50, 94, 96, 10),                                 // the kick plate
];
export const cafeCounter = (x: number, y: number, w: number, h: number) => fit(CAFE_COUNTER, x, y, w, h);

// ── psych1: objects for this lesson go ABOVE this line ──

// ─────────────────────────────────────────────────────────────────────────────
// THE FRONT GARDEN, for Personal Growth lesson 1 (2026-09-30). Every one drawn
// against pictures fetched with `node scripts/get-reference.mjs` (scratchpad/ref/g1-*):
// a stack of terracotta pots, two watering-can drawings, two sunflower drawings, a
// row of apex garden sheds by a canal and a Hove front garden's brick wall and piers.
// ─────────────────────────────────────────────────────────────────────────────

/** One part in a named real colour, where an object is more than one material. */
const g1 = (p: ObjPart, key: NaturalKey): ObjPart => ({ ...p, nat: key });

// ── FLOWERPOT ────────────────────────────────────────────────────────────────
//
// REFERENCE. A terracotta pot is a TRUNCATED CONE about as tall as its mouth is wide,
// the foot about three quarters of the mouth, under a thick ROLLED RIM — a straight
// band a quarter of the height, standing proud of the body on both sides. The band is
// the field mark: without it the same cone is a bucket or a lampshade. Seen a little
// from above, the mouth is an ellipse with the soil dark inside it.
function flowerpotParts(fill: NaturalKey): ObjPart[] {
  return [
    ...tint(trapezoid('mass', 50, 64, 78, 58, 64), 'brick'),      // the body, tapering to its foot
    g1(oRect('mass', 50, 24, 94, 22, 0, 2), 'brick'),              // the rolled rim, proud of it
    g1(oEll('mass', 50, 13, 94, 14), 'brick'),                     // the rim's top, seen from above
    g1(oEll('dark', 50, 13, 80, 9), fill),                         // and what is in the mouth
    g1(oRect('dark', 50, 37, 76, 4), 'brick'),                     // the rim's shadow on the body
    g1(oBar('dark', 81, 40, 73, 92, 8), 'brick'),                  // the flank turned from the lamp
    oBar('lit', 24, 42, 28, 84, 3),                                // the lamp's sheen on the clay
  ];
}
export const flowerpot = (x: number, y: number, w: number, h: number, fill: NaturalKey = 'soil') =>
  fit(flowerpotParts(fill), x, y, w, h);

// ── PUDDLE ───────────────────────────────────────────────────────────────────
//
// REFERENCE. Water lying on a path is a FLAT ellipse far wider than it is deep, with
// an irregular edge where it has run, and the sky's light caught in it as short pale
// streaks. A single disc is a coin lying down.
const PUDDLE: ObjPart[] = [
  g1(oEll('mass', 50, 58, 96, 60), 'water'),
  g1(oEll('mass', 24, 44, 40, 40), 'water'),                      // where it has run
  g1(oEll('mass', 78, 66, 38, 40), 'water'),
  g1(oEll('dark', 60, 68, 60, 22), 'water'),                      // the deeper middle
  oBar('lit', 30, 48, 46, 46, 5),                                 // the light caught in it
  oBar('lit', 62, 56, 72, 55, 4),
];
export const puddle = (x: number, y: number, w: number, h: number) => fit(PUDDLE, x, y, w, h);

// ── WATERING CAN ─────────────────────────────────────────────────────────────
//
// REFERENCE. A garden watering can is a DRUM of a body with raised bands round it, an
// ARCHED carrying handle over the top from the filler at the back to the front, a
// second handle at the back for pouring, and a long SPOUT rising from the FOOT of the
// body at about forty-five degrees to end in a flared ROSE. The low-set spout and the
// rose are the field marks — a spout from the shoulder is a kettle.
//
// Drawn with the spout to the right. A scene holds it by the top of the arch, which is
// at (38, 14) in this square, so it can turn the can about the hand.
const WATERING_CAN: ObjPart[] = [
  oBar('mass', 22, 40, 24, 17, 5.5),                             // the arched handle, from the
  oBar('mass', 24, 17, 50, 13, 5.5),                             // filler at the back …
  oBar('mass', 50, 13, 58, 38, 5.5),                             // … over to the front
  oBar('mass', 19, 46, 7, 56, 5.5),                              // the pouring handle at the back
  oBar('mass', 7, 56, 9, 72, 5.5),
  oBar('mass', 9, 72, 19, 78, 5.5),
  oBar('mass', 58, 80, 86, 42, 6.5),                             // the spout, from the foot
  oEll('mass', 90, 37, 18, 12, -38),                             // the rose, flared across it
  oRect('mass', 40, 62, 44, 50, 0, 6),                           // the body
  oEll('mass', 40, 38, 44, 10),                                  // its top
  oEll('dark', 32, 38, 20, 5),                                   // the filler's mouth
  oRect('dark', 56, 63, 11, 44, 0, 4),                           // the side turned from the lamp
  oBar('line', 18, 50, 62, 50, 2.2),                             // the raised bands
  oBar('line', 18, 76, 62, 76, 2.2),
  oEll('dark', 92, 35, 9, 7, -38),                               // the rose's face, pierced
  oBar('lit', 24, 54, 24, 72, 3),                                // the sheen of galvanised zinc
];
export const wateringCan = (x: number, y: number, w: number, h: number) => fit(tint(WATERING_CAN, 'silver'), x, y, w, h);
/** Where the hand holds the can, in its authoring square — the top of the arch. */
export const CAN_GRIP = { x: 38, y: 14 } as const;
/** The rose's face, where the water leaves it, in the same square. */
export const CAN_ROSE = { x: 94, y: 33 } as const;

// ── SUNFLOWER ────────────────────────────────────────────────────────────────
//
// REFERENCE. A sunflower is a single THICK stalk, taller than a person, carrying big
// alternate HEART-SHAPED leaves on short stalks and one heavy HEAD: a ring of pointed
// yellow ray petals round a broad dark disc of seeds, the disc nearly half the head's
// width. The broad disc is what separates it from a daisy; the one head on one tall
// stalk is what separates it from a bunch. Drawn in a SQUARE because the head is round
// and `fit` scales x and y apart: a scene asks for it at w = h and the drawing stays
// narrow inside that box. The base of the stalk is at (50, 100).
function sunflowerStemParts(): ObjPart[] {
  return [
    g1(oBar('mass', 50, 100, 48, 30, 4.5), 'leaf'),              // the stalk
    g1(oEll('mass', 36, 72, 26, 13, -28), 'leaf'),                // the leaves, alternate
    g1(oTri('mass', 24, 78, 8, 8, 'left', -28), 'leaf'),          // each with its point
    g1(oEll('mass', 63, 56, 26, 13, 28), 'leaf'),
    g1(oTri('mass', 76, 63, 8, 8, 'right', 28), 'leaf'),
    g1(oEll('mass', 38, 44, 20, 10, -26), 'leaf'),
    g1(oTri('mass', 28, 49, 7, 7, 'left', -26), 'leaf'),
    oBar('line', 48, 76, 28, 80, 1.6),                            // and their midribs
    oBar('line', 49, 52, 72, 61, 1.6),
    oBar('line', 48, 41, 32, 48, 1.6),
  ];
}
function sunflowerHeadParts(): ObjPart[] {
  const cx = 48;
  const cy = 18;
  const petals: ObjPart[] = [];
  for (let k = 0; k < 16; k += 1) {
    const a = (k / 16) * Math.PI * 2;
    const px = cx + Math.cos(a) * 11;
    const py = cy + Math.sin(a) * 11;
    // The petals on the side turned from the lamp (down and to the right) are in shade.
    const away = Math.cos(a) > 0.35 && Math.sin(a) > -0.3;
    petals.push(g1(oEll(away ? 'face' : 'mass', px, py, 7, 13, (a * 180) / Math.PI + 90), 'petal'));
  }
  return [
    ...petals,
    g1(oEll('mass', cx, cy, 15, 15), 'seedhead'),                 // the broad disc of seeds
    g1(oEll('dark', cx + 1, cy + 1, 9, 9), 'seedhead'),           // its darker heart
    oEll('lit', cx - 3, cy - 3, 3, 3),                            // a glint on the seeds
  ];
}
export const sunflowerStem = (x: number, y: number, w: number, h: number) => fit(sunflowerStemParts(), x, y, w, h);
export const sunflowerHead = (x: number, y: number, w: number, h: number) => fit(sunflowerHeadParts(), x, y, w, h);
export const sunflower = (x: number, y: number, w: number, h: number) =>
  fit([...sunflowerStemParts(), ...sunflowerHeadParts()], x, y, w, h);

// ── SHED ─────────────────────────────────────────────────────────────────────
//
// REFERENCE. A small garden shed seen from its GABLE end is a box of horizontal
// shiplap boards under an APEX roof whose bargeboards overhang the walls on both
// sides, with a plain boarded door in the gable wall and a low plinth under it. The
// run of horizontal boards is what says shed rather than hut; the overhanging apex is
// what says shed rather than crate. The doorway is drawn open and dark: a scene hangs
// its door leaf (`shedDoor`) over it, so the leaf can swing.
const SHED: ObjPart[] = [
  g1(oRect('mass', 50, 64, 88, 72), 'wood'),                     // the walls
  g1(oTri('mass', 50, 18, 88, 24, 'up'), 'wood'),                 // and the gable
  g1(oBar('mass', 3, 34, 50, 6, 7), 'felt'),                      // the bargeboards, overhanging
  g1(oBar('mass', 50, 6, 97, 34, 7), 'felt'),
  ...[40, 50, 60, 70, 80, 90].map((y) => oBar('line', 8, y, 92, y, 1.4)), // the shiplap boards
  g1(oRect('dark', 50, 66, 44, 64, 0, 1), 'felt'),                // the doorway, dark inside
  g1(oRect('dark', 50, 99, 88, 4), 'wood'),                       // the plinth's shadow
  g1(oRect('dark', 87, 64, 12, 72), 'wood'),                      // the corner turned from the lamp
];
export const shed = (x: number, y: number, w: number, h: number) => fit(SHED, x, y, w, h);
/** The doorway, in the shed's authoring square: centre x, top, width, height. */
export const SHED_DOORWAY = { x: 50, y: 34, w: 44, h: 64 } as const;

// ── SHED DOOR ────────────────────────────────────────────────────────────────
//
// REFERENCE. A shed door is LEDGED AND BRACED: vertical boards held by three
// horizontal ledges, with diagonal braces between them running up from the hinge side.
// The Z is the field mark — every shed door in the reference has one and no house door
// does. A thumb latch on the opening edge.
const SHED_DOOR: ObjPart[] = [
  g1(oRect('mass', 50, 50, 96, 100, 0, 1.5), 'wood'),             // the boards
  ...[26, 50, 74].map((x) => oBar('line', x, 3, x, 97, 1.6)),     // and the joints between them
  g1(oRect('dark', 50, 12, 92, 9), 'wood'),                       // the three ledges
  g1(oRect('dark', 50, 50, 92, 9), 'wood'),
  g1(oRect('dark', 50, 88, 92, 9), 'wood'),
  g1(oBar('dark', 88, 84, 12, 54, 8), 'wood'),                    // the braces, the Z
  g1(oBar('dark', 88, 46, 12, 16, 8), 'wood'),
  oEll('line', 12, 60, 8, 12),                                    // the latch
];
export const shedDoor = (x: number, y: number, w: number, h: number) => fit(SHED_DOOR, x, y, w, h);

// ── GARDEN WALL ──────────────────────────────────────────────────────────────
//
// REFERENCE. A low front-garden wall is BRICK laid in courses with the vertical joints
// staggered course to course, under a stone COPING that projects past both faces and
// throws a shadow line under itself. The coping is the field mark: a brick block
// without one is a planter or a step.
const GARDEN_WALL: ObjPart[] = [
  g1(oRect('mass', 50, 58, 92, 84), 'brick'),                     // the brickwork
  g1(oRect('mass', 50, 9, 100, 16, 0, 1.5), 'coping'),            // the coping, proud of it
  g1(oRect('dark', 50, 20, 90, 5), 'brick'),                      // its shadow on the bricks
  ...[34, 50, 66, 82].map((y) => oBar('lit', 6, y, 94, y, 1.8)),  // the bed joints
  ...[[24, 18], [48, 18], [72, 18], [36, 34], [60, 34], [84, 34], [24, 50], [48, 50], [72, 50], [36, 66], [60, 66], [84, 66], [24, 82], [48, 82], [72, 82]]
    .map(([x, y]) => oBar('lit', x, y + 3, x, y + 13, 1.8)),       // and the staggered perpends
];
export const gardenWall = (x: number, y: number, w: number, h: number) => fit(GARDEN_WALL, x, y, w, h);

// ── HOUSE FRONT ──────────────────────────────────────────────────────────────
//
// REFERENCE. A terraced house front at street level is a RENDERED wall with a sash
// WINDOW above the door, the window with a projecting sill, a darker PLINTH band where
// the wall meets the ground, and a stone STEP at the door. The door itself is the
// library's `door`, hung by the scene in the opening at (50, 72). The step and the
// plinth are what put the wall on the ground rather than floating as a card.
const HOUSE_FRONT: ObjPart[] = [
  oRect('mass', 50, 50, 100, 100),                                // the rendered wall
  oRect('dark', 50, 96, 100, 8),                                  // the plinth band
  oRect('dark', 50, 24, 50, 30, 0, 1),                            // the window's frame, set in
  oRect('lit', 38, 17, 18, 11, 0, 0.5),                           // its four panes
  oRect('lit', 62, 17, 18, 11, 0, 0.5),
  oRect('lit', 38, 31, 18, 11, 0, 0.5),
  oRect('lit', 62, 31, 18, 11, 0, 0.5),
  oRect('line', 50, 40.5, 58, 2.4, 0, 0.5),                      // and its sill, proud of it
  g1(oRect('mass', 50, 98, 74, 4, 0, 1), 'coping'),               // the stone step
];
export const houseFront = (x: number, y: number, w: number, h: number) => fit(HOUSE_FRONT, x, y, w, h);

// ── growth1: objects for this lesson go ABOVE this line ──

// ─────────────────────────────────────────────────────────────────────────────
// THE LEMONADE STAND, for Business lesson 1 (2026-09-30). Drawn against pictures
// fetched with `node scripts/get-reference.mjs` (scratchpad/ref/biz1-*): a child's
// home-made lemonade stand (two uprights, a painted board across the top, a counter
// at the middle with stacked cups and a jug), a clip-art stand, a glass pitcher of
// cloudy lemonade, whole and cut lemons, a turned wooden reamer, a pressed-glass
// juicer, paper cups in a stack, and a German Geldkassette with its bail handle.
// ─────────────────────────────────────────────────────────────────────────────

/** One part in a named real colour. */
const biz1Nat = (k: NaturalKey, ...ps: ObjPart[]): ObjPart[] => ps.map((p) => ({ ...p, nat: k }));

// ── LEMONADE STAND ───────────────────────────────────────────────────────────
//
// REFERENCE. A pavement lemonade stand is a home-made frame: two plain UPRIGHTS
// standing on the ground, a BOARD nailed across their tops to carry the name, and a
// counter between them at the middle. The board overhangs the uprights and the
// uprights run down behind the counter to the ground. The counter is its own object
// (`standCounter`), because the people selling stand BETWEEN the two. The slate in
// the board is the scene's to write on; two painted lemons sit on the board's top
// corners, which is what says lemonade before a word is read.
const LEMON_STAND: ObjPart[] = [
  ...biz1Nat('wood',
    oBar('mass', 8, 30, 8, 100, 4.2),                           // the two uprights, to the ground
    oBar('mass', 92, 30, 92, 100, 4.2),
    oRect('mass', 50, 19, 100, 36, 0, 2),                        // the name board, overhanging them
    oRect('dark', 50, 37.6, 96, 1.6),                            // its shadow on the uprights
  ),
  oRect('dark', 50, 19, 93, 30, 0, 1),                           // the slate let into it
  ...biz1Nat('lemon',
    oEll('mass', 4, 2.5, 7, 5.5), oEll('mass', 96, 2.5, 7, 5.5), // painted lemons on its corners
  ),
  oEll('line', 0.6, 2.5, 1.6, 1.6), oEll('line', 99.4, 2.5, 1.6, 1.6),
];
export const lemonStand = (x: number, y: number, w: number, h: number) => fit(LEMON_STAND, x, y, w, h);
/** The slate in the name board, in the stand's own square: centre and size. */
export const STAND_SLATE = { x: 50, y: 19, w: 93, h: 30 } as const;

// ── STAND COUNTER ────────────────────────────────────────────────────────────
//
// REFERENCE. The counter of a home-made stand is a PLANK laid across the frame, lit
// along its top and showing its thickness, over a front of UPRIGHT boards — a child
// nails planks on end, which is what separates it from the market stall's
// horizontal boards. Seen square on, at the hip of the person selling (AP10).
const STAND_COUNTER: ObjPart[] = [
  ...biz1Nat('wood',
    oRect('face', 50, 60, 96, 80, 0, 1.5),                       // the boarded front, in shade
    oRect('mass', 50, 9, 100, 18, 0, 1.5),                       // the plank on top, lit
  ),
  ...[14, 26, 38, 50, 62, 74, 86].map((x) => oBar('line', x, 22, x, 98, 1.4)), // the boards on end
  oBar('lit', 2, 3, 98, 3, 1.6),                                 // the plank's lit edge
];
export const standCounter = (x: number, y: number, w: number, h: number) => fit(STAND_COUNTER, x, y, w, h);

// ── LEMON ────────────────────────────────────────────────────────────────────
//
// REFERENCE. A lemon is an OVAL, longer than it is round, with a small NIPPLE at
// each end — the stem end blunt, the blossom end pointed — in a waxy yellow that
// catches one bright highlight. The two nubs are what separate it from an orange,
// an egg or a ball.
const LEMON: ObjPart[] = biz1Nat('lemon',
  oEll('mass', 50, 52, 80, 74),                                   // the body
  oEll('mass', 10, 52, 16, 16),                                   // the stem end
  oEll('mass', 91, 50, 14, 12),                                   // the blossom end, pointed
  oTri('mass', 98, 50, 6, 8, 'right'),
  oEll('dark', 62, 72, 44, 18),                                   // the side turned from the lamp
);
LEMON.push(oEll('lit', 34, 34, 20, 12, -20));                    // the wax catching the light
export const lemon = (x: number, y: number, w: number, h: number) => fit(LEMON, x, y, w, h);

// ── LEMONADE JUG ─────────────────────────────────────────────────────────────
//
// REFERENCE. A lemonade pitcher is a tall GLASS body with nearly straight sides, a
// pouring LIP pinched out of the rim, and a D-shaped HANDLE standing clear of the
// wall. The lemonade is the recognition: a pale, cloudy yellow filling the glass to a
// FLAT line, with clear glass above it and a streak of reflection down the lit side.
// Drawn with the lip to the LEFT and the handle to the RIGHT.
const LEMONADE_JUG: ObjPart[] = [
  oBar('line', 76, 30, 94, 34, 7),                                // the handle, a D clear of the wall
  oBar('line', 94, 34, 94, 70, 7),
  oBar('line', 94, 70, 76, 76, 7),
  ...biz1Nat('glass',
    oRect('mass', 50, 57, 64, 82, 0, 4),                         // the glass body, near straight
    oTri('mass', 16, 21, 10, 8, 'left'),                         // the pouring lip
  ),
  ...biz1Nat('lemonade',
    oRect('mass', 50, 64, 62, 60, 0, 2),                         // the lemonade, to a FLAT line
    oRect('dark', 74, 64, 8, 58, 0, 2),                          // its side turned from the lamp
  ),
  oEll('lit', 50, 17, 62, 7),                                     // the rim, open from above
  oBar('lit', 30, 26, 30, 86, 4),                                 // the glass's reflection
];
export const lemonadeJug = (x: number, y: number, w: number, h: number) => fit(LEMONADE_JUG, x, y, w, h);
/** Where a hand holds the jug (the handle) and where it pours from, in its square. */
export const JUG_AT = { grip: { x: 94, y: 52 }, lip: { x: 12, y: 20 } } as const;

// ── REAMER ───────────────────────────────────────────────────────────────────
//
// REFERENCE. A hand lemon squeezer is TURNED WOOD: a round-ended HANDLE, a waist with
// a collar, and a pointed, RIDGED cone that is twisted into a cut lemon. The ridges
// running down the cone to its point are the field mark — without them it is a
// pestle or a spoon. Drawn lying down, handle to the LEFT.
const REAMER: ObjPart[] = [
  ...biz1Nat('beech',
    oEll('mass', 10, 50, 18, 50),                                // the handle's round end
    oBar('mass', 10, 50, 42, 50, 30),                            // the handle, slim
    oEll('mass', 45, 50, 7, 56),                                 // the collar at the waist
    oEll('mass', 62, 50, 34, 76),                                // the cone's shoulder …
    oTri('mass', 86, 50, 30, 60, 'right'),                       // … drawn out to its point
  ),
  oBar('line', 52, 26, 99, 50, 3),                                // the ridges, down to the point
  oBar('line', 50, 50, 99, 50, 3),
  oBar('line', 52, 74, 99, 50, 3),
];
export const reamer = (x: number, y: number, w: number, h: number) => fit(REAMER, x, y, w, h);

// ── PAPER CUP ────────────────────────────────────────────────────────────────
//
// REFERENCE. A paper cup TAPERS to its foot, its ROLLED RIM seen as an ellipse from a
// little above, with a printed band round it. Full, the lemonade shows as a pale disc
// inside the rim — which is what says a drink rather than an empty cup.
const PAPER_CUP: ObjPart[] = [
  ...biz1Nat('paper', ...trapezoid('mass', 50, 58, 90, 64, 78)),  // the cup, tapering to its foot
  oBar('line', 12, 44, 88, 44, 5),                                // the printed band
  ...biz1Nat('paper', oEll('mass', 50, 18, 96, 16)),              // the rolled rim
  ...biz1Nat('lemonade', oEll('dark', 50, 19, 78, 9)),            // and the lemonade in it
];
export const paperCup = (x: number, y: number, w: number, h: number) => fit(PAPER_CUP, x, y, w, h);

// ── CUP STACK ────────────────────────────────────────────────────────────────
//
// REFERENCE. Paper cups come NESTED: a tall column tapering to the bottom cup's foot,
// every cup's rim showing as a ridge where it sits in the one below. The run of rims
// is the field mark — a plain tapered column is a vase.
const CUP_STACK: ObjPart[] = [
  ...biz1Nat('paper',
    ...trapezoid('mass', 50, 56, 94, 72, 88),                    // the nest, tapering down
    oEll('mass', 50, 12, 98, 10),                                 // the top cup's rim
  ),
  ...biz1Nat('paper', oEll('dark', 50, 12, 80, 6)),               // and its empty mouth
  ...[30, 48, 66, 84].flatMap((y) => {                            // the rims below, proud of the nest
    const e = 3 + (y - 12) * 0.12;                                // at each side
    return [oBar('line', e - 3, y, e + 12, y, 3), oBar('line', 100 - e - 12, y, 103 - e, y, 3)];
  }),
];
export const cupStack = (x: number, y: number, w: number, h: number) => fit(CUP_STACK, x, y, w, h);

// ── CASH TIN ─────────────────────────────────────────────────────────────────
//
// REFERENCE. A cash tin is a small ENAMELLED STEEL box, wider than it is tall, with a
// KEYHOLE in an escutcheon on the front, a folding HANDLE on the lid, and a lid hinged
// along the back. Seen from a little above, so the OPEN top shows as a dark well behind
// its lit front rim; the lid (`tinLid`) is laid over it by the scene, so it can be lifted.
const CASH_TIN: ObjPart[] = [
  ...biz1Nat('tinPaint',
    oRect('mass', 50, 28, 96, 30, 0, 2),                         // the top edges round the opening
    oRect('mass', 50, 66, 100, 68, 0, 2),                        // the box's front
    oRect('face', 94, 66, 12, 68, 0, 2),                          // its end, turned from the lamp
  ),
  ...biz1Nat('felt', oRect('dark', 50, 27, 84, 20, 0, 1.5)),     // the inside, a dark well
  oBar('lit', 4, 33, 96, 33, 2.4),                                // the front rim's lit edge
  oRect('lit', 50, 66, 16, 22, 0, 2),                             // the escutcheon
  oEll('line', 50, 62, 5, 6), oBar('line', 50, 64, 50, 72, 3),    // and its keyhole
];
export const cashTin = (x: number, y: number, w: number, h: number) => fit(CASH_TIN, x, y, w, h);
const TIN_LID: ObjPart[] = [
  ...biz1Nat('tinPaint', oRect('mass', 50, 60, 100, 76, 0, 2)),   // the lid
  ...biz1Nat('felt', oRect('dark', 50, 60, 84, 58, 0, 1.5)),      // its underside, in shadow
  oBar('line', 30, 30, 30, 12, 3), oBar('line', 30, 12, 70, 12, 3), oBar('line', 70, 12, 70, 30, 3), // the bail handle
];
export const tinLid = (x: number, y: number, w: number, h: number) => fit(TIN_LID, x, y, w, h);

// ── LEMON CRATE ──────────────────────────────────────────────────────────────
//
// REFERENCE. A fruit crate is open-topped and SLATTED, its boards nailed to square
// corner posts, and seen from a little above the inside of its back wall shows over
// the front board. Two objects, asked for at one box, so what is IN it — lemons, a
// coin — sits between them rather than on top.
const LEMON_CRATE_BACK: ObjPart[] = [
  ...biz1Nat('wood', oRect('mass', 50, 34, 100, 20, 0, 1)),       // the back boards, over the front
  ...biz1Nat('wood', oRect('dark', 50, 40, 90, 12)),              // and the inside of the crate
  oBar('lit', 3, 25.5, 97, 25.5, 2),                              // their top edge, lit
];
export const lemonCrateBack = (x: number, y: number, w: number, h: number) => fit(LEMON_CRATE_BACK, x, y, w, h);
const LEMON_CRATE_FRONT: ObjPart[] = [
  ...biz1Nat('wood',
    oRect('mass', 50, 72, 100, 56, 0, 1.5),                      // the front boards
    oRect('face', 5, 72, 10, 56, 0, 1),                          // the corner posts
    oRect('face', 95, 72, 10, 56, 0, 1),
  ),
  oBar('dark', 10, 62, 90, 62, 2.6),                              // the gaps between the slats
  oBar('dark', 10, 80, 90, 80, 2.6),
  oBar('lit', 11, 46.5, 89, 46.5, 1.8),                           // the front board's top edge
  oEll('line', 5, 52, 2.6, 2.6), oEll('line', 95, 52, 2.6, 2.6), // and its nails
];
export const lemonCrateFront = (x: number, y: number, w: number, h: number) => fit(LEMON_CRATE_FRONT, x, y, w, h);

// ── QUEUE SIGN ───────────────────────────────────────────────────────────────
//
// REFERENCE. The home-made signs round a lemonade stand are CARDBOARD, lettered by
// hand and stapled to a garden STAKE pushed into the ground. The stake, the staples
// and the hand lettering are what say home-made rather than printed. The lettering is
// the scene's.
const QUEUE_SIGN: ObjPart[] = [
  ...biz1Nat('wood', oBar('mass', 50, 30, 50, 100, 7)),           // the stake
  ...biz1Nat('paper', oRect('mass', 50, 22, 100, 42, 0, 2)),      // the card
  oEll('line', 36, 6, 3, 3), oEll('line', 64, 5, 3, 3),           // and its staples
];
export const queueSign = (x: number, y: number, w: number, h: number) => fit(QUEUE_SIGN, x, y, w, h);

// ── CUP BIN ──────────────────────────────────────────────────────────────────
//
// REFERENCE. A pavement litter bin is a wire BASKET, wider at its mouth, with a rim
// and upright wires — and full of used paper cups, crooked, sticking out of the top.
// The spilling cups are what say a long queue has been served here.
const CUP_BIN: ObjPart[] = [
  ...biz1Nat('paper',
    oRect('mass', 28, 22, 18, 26, -20, 2), oEll('mass', 24, 10, 22, 8, -20),  // three used cups,
    oRect('mass', 50, 18, 18, 26, 6, 2), oEll('mass', 51, 6, 22, 8, 6),       // crooked, rims up
    oRect('mass', 73, 22, 18, 26, 24, 2), oEll('mass', 78, 11, 22, 8, 24),
  ),
  ...trapezoid('mass', 50, 64, 96, 76, 72),                       // the basket
  oBar('line', 2, 29, 98, 29, 4),                                 // its rim
  ...[18, 34, 50, 66, 82].map((x) => oBar('line', x, 32, 50 + (x - 50) * 0.8, 98, 2)), // and its wires
];
export const cupBin = (x: number, y: number, w: number, h: number) => fit(CUP_BIN, x, y, w, h);

// ── biz1: objects for this lesson go ABOVE this line ──

// ─────────────────────────────────────────────────────────────────────────────
// THE BACK YARD, for Science lesson 1 (2026-09-30). Drawn against pictures fetched
// with `node scripts/get-reference.mjs` (scratchpad/ref/sci1-*): a wooden stepladder
// seen three-quarter on and a stepladder icon, a cast-iron shot put lying on gravel,
// tennis balls on a table, and a weathered brick garden wall with a pier.
// ─────────────────────────────────────────────────────────────────────────────

/** Parts in a named real colour (AP11), where an object is more than one material. */
const sci1N = (k: NaturalKey, ...ps: ObjPart[]): ObjPart[] => ps.map((p) => ({ ...p, nat: k }));

// ── STEPLADDER ───────────────────────────────────────────────────────────────
//
// REFERENCE. A wooden stepladder seen three-quarter on is an A: two front STILES that
// splay wider at the foot, flat TREADS between them — a lit top face and a front edge
// in shade, which is what says step rather than rung — a wide TOP CAP board over them,
// and the REAR legs splaying back behind, seen only at one side. The flat treads and
// the cap are the field marks: without them the same A is an easel or a trestle.
// Authored to be laid about 42 wide by 76 tall; its treads' tops are at 31.6, 55.3 and
// 79 of the square (`LADDER_TREADS`), which is where a foot stands.
const LADDER_TREADS = [31.6, 55.3, 79] as const;
const ladderX = (y: number) => 28 - (14 * (y - 4)) / 94;         // the left stile's centre at y
const STEP_LADDER: ObjPart[] = [
  oBar('face', 66, 8, 94, 97.6, 7),                               // the rear leg, splayed back
  ...LADDER_TREADS.flatMap((ty) => {
    const w = 100 - 2 * ladderX(ty) + 2;
    return [
      oRect('mass', 50, ty + 1.8, w, 3.6, 0, 0.6),               // the tread's top, lit
      oRect('face', 50, ty + 5.2, w - 2, 3.2),                   // and its front edge, in shade
    ];
  }),
  oBar('mass', 28, 4, 14.1, 97.8, 8),                             // the front stiles, splaying
  oBar('mass', 72, 4, 85.9, 97.8, 8),
  oRect('mass', 50, 4.4, 66, 7, 0, 1.5),                          // the top cap, over the stiles
  oRect('face', 50, 9.4, 62, 3),                                  // its front edge
  oBar('lit', 26.4, 14, 16, 88, 1.4),                             // the lamp along the left stile
];
export const stepLadder = (x: number, y: number, w: number, h: number) => fit(tint(STEP_LADDER, 'wood'), x, y, w, h);
export { LADDER_TREADS };

// ── IRON BALL ────────────────────────────────────────────────────────────────
//
// REFERENCE. A shot put is a plain SPHERE of dark cast iron: no seam, no holes, a
// pitted surface, one bright spot where the lamp catches it high on the lit side and
// a crescent of shade on the far side. What says heavy is the dark metal and the hard
// highlight — a matte grey disc is a stone.
const IRON_BALL: ObjPart[] = [
  oEll('face', 50, 50, 100, 100),                                 // the ball, its far side in shade
  oEll('mass', 45, 44, 86, 86),                                   // the lit face
  oEll('dark', 63, 66, 7, 6), oEll('dark', 38, 70, 5, 5),         // pits in the casting
  oEll('dark', 70, 44, 5, 4),
  oEll('lit', 31, 29, 24, 15, -35),                               // the lamp's hard highlight
];
export const ironBall = (x: number, y: number, w: number, h: number) => fit(sci1N('iron', ...IRON_BALL.slice(0, 5)).concat(IRON_BALL.slice(5)), x, y, w, h);

// ── TENNIS BALL ──────────────────────────────────────────────────────────────
//
// REFERENCE. A tennis ball is optic-yellow FELT with a white SEAM that runs round it as
// two facing curves — seen from the side, a pair of arcs bowing toward each other. The
// colour carries it at any size; the seam is what separates it from a lemon or a pea.
function tennisSeam(cx: number, bow: 1 | -1): ObjPart[] {
  const out: ObjPart[] = [];
  const pts: [number, number][] = [];
  for (let i = 0; i <= 6; i += 1) {
    const a = ((-52 + (104 * i) / 6) * Math.PI) / 180;
    pts.push([cx + bow * 44 * Math.cos(a), 50 + 44 * Math.sin(a)]);
  }
  for (let i = 0; i < pts.length - 1; i += 1) out.push(oBar('lit', pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], 8));
  return out;
}
const TENNIS_BALL: ObjPart[] = [
  ...sci1N('tennis',
    oEll('face', 50, 50, 100, 100),                               // the felt, its far side in shade
    oEll('mass', 46, 45, 88, 88),                                 // and the lit face
  ),
  ...tennisSeam(-4, 1),                                           // the seam, two facing curves
  ...tennisSeam(104, -1),
];
export const tennisBall = (x: number, y: number, w: number, h: number) => fit(TENNIS_BALL, x, y, w, h);

// ── YARD WALL ────────────────────────────────────────────────────────────────
//
// REFERENCE. An old back-garden wall is BRICK in courses with the vertical joints
// staggered course to course, a stone COPING along the top that throws a shadow line on
// the bricks under it, a darker damp band at the foot, and a PIER — a column of brick
// standing proud of the wall under its own cap — to break the run. The staggered joints
// and the coping say wall; the pier says a real garden's wall rather than a pattern.
// Authored to be laid 400 wide by 104 tall: the pier's cap is the top 6 of the square,
// the wall's coping 8–16, the brickwork below it.
const SCI1_COURSE = 10.5;
const YARD_WALL: ObjPart[] = [
  ...sci1N('brick',
    oRect('mass', 50, 58, 100, 84),                               // the brickwork
    oRect('mass', 88, 50, 11, 100),                               // the pier, standing proud
  ),
  ...sci1N('coping',
    oRect('mass', 50, 12, 100, 8, 0, 0.5),                        // the wall's coping
    oRect('mass', 88, 3, 13, 6, 0, 0.8),                          // and the pier's cap
  ),
  ...sci1N('brick',
    oRect('dark', 41.2, 17.8, 82.4, 3.4),                         // the coping's shadow on the bricks
    oRect('dark', 96.8, 17.8, 6.4, 3.4),
    oRect('dark', 88, 7.4, 11, 2.4),                              // and the cap's on the pier
    oRect('dark', 50, 97.2, 100, 5.6),                            // the damp band at the foot
    oRect('dark', 92.9, 52, 1.2, 90),                             // the pier's side, from the lamp
  ),
  oBar('line', 82.5, 6.2, 82.5, 99.4, 1.5),                       // the pier's edges, where it
  oBar('line', 93.5, 6.2, 93.5, 99.4, 1.5),                       // stands proud of the wall
  ...sci1N('coping',
    ...[12.5, 25, 37.5, 50, 62.5, 75, 97].map((x) => oBar('dark', x, 8.9, x, 15.1, 0.9)), // the coping's joints
  ),
  // the bed joints, every course, and the perpends staggered half a brick course to course
  ...Array.from({ length: 7 }, (_, c) => 16 + SCI1_COURSE * (c + 1)).flatMap((y) => [
    oBar('lit', 0.6, y, 82, y, 1.1),
    oBar('lit', 94, y, 99.4, y, 1.1),
    oBar('lit', 83.6, y - SCI1_COURSE / 2, 92, y - SCI1_COURSE / 2, 1.1),
  ]),
  ...Array.from({ length: 8 }, (_, c) => c).flatMap((c) => {
    const y0 = 16 + SCI1_COURSE * c + 1.4;
    const y1 = y0 + SCI1_COURSE - 2.8;
    const xs: number[] = [];
    for (let x = c % 2 ? 5 : 10; x < 100; x += 10) if (x < 81.5 || x > 95) xs.push(x);
    return [...xs.map((x) => oBar('lit', x, y0, x, y1, 1.0)), oBar('lit', c % 2 ? 86 : 90, y0 - 3, c % 2 ? 86 : 90, y1 - 3, 1.0)];
  }),
];
export const yardWall = (x: number, y: number, w: number, h: number) => fit(YARD_WALL, x, y, w, h);

// ── SCHOOL SLATE ─────────────────────────────────────────────────────────────
//
// REFERENCE. A writing slate — or a small chalkboard — is a panel of dark grey slate in
// a plain WOODEN FRAME, the frame as wide on every side. Stood on the ground and leant
// back against a wall, the board's own EDGE shows along one side in shade. The frame is
// the field mark: a bare dark panel is a screen. The slate's face is the scene's to
// write on (`SLATE_FACE`, in the square).
const SCHOOL_SLATE: ObjPart[] = [
  ...sci1N('wood',
    oRect('face', 96.5, 52, 6, 94, 0, 1),                         // the board's edge, leaning back
    oRect('mass', 48, 50, 96, 100, 0, 2.5),                       // the frame
  ),
  ...sci1N('slate', oRect('dark', 48, 50, 84, 82, 0, 1)),        // the slate in it
  oBar('lit', 8, 8, 8, 92, 1.4),                                  // the frame's lit inner edge
];
export const schoolSlate = (x: number, y: number, w: number, h: number) => fit(SCHOOL_SLATE, x, y, w, h);
/** The slate inside the frame, in the board's own square. */
export const SLATE_FACE = { x: 48, y: 50, w: 84, h: 82 } as const;

// ── PATIO ────────────────────────────────────────────────────────────────────
//
// REFERENCE. A back yard's paving is square grey FLAGS laid in a row, the joints
// between them narrowing as they recede, and the front edge of the paving in shade
// where it steps down to the soil. Seen low and from the front it is a shallow band.
// Authored to be laid about 400 wide by 16 tall.
const PATIO: ObjPart[] = [
  ...sci1N('flagstone',
    oRect('mass', 50, 50, 100, 100),                              // the flags, lit from above
    oRect('face', 50, 88, 100, 24),                               // their front edge, in shade
  ),
  ...sci1N('flagstone',
    ...[8, 24, 40, 56, 72, 88].map((x) => oBar('dark', x, 6, x + (x - 50) * 0.02, 74, 7)), // the joints
  ),
];
export const patio = (x: number, y: number, w: number, h: number) => fit(PATIO, x, y, w, h);

// ── sci1: objects for this lesson go ABOVE this line ──

// ─────────────────────────────────────────────────────────────────────────────
// THE BROKEN SHOP WINDOW, for History lesson 1 (2026-09-30). Drawn against pictures
// fetched with `node scripts/get-reference.mjs` (scratchpad/ref/hist1-*): painted
// timber shop fronts in Cork and on an English high street, a smashed pane lying on
// gravel and two cracked-glass icons, a flat soccer-ball icon, and a village notice
// board of pinned papers in a wooden frame.
// ─────────────────────────────────────────────────────────────────────────────

/** Parts in a named real colour (AP11), where an object is more than one material. */
const hist1N = (k: NaturalKey, ...ps: ObjPart[]): ObjPart[] => ps.map((p) => ({ ...p, nat: k }));

// The street front is authored in the units of the box it is laid in — 400 wide by 182
// tall, a stage's width from the cornice to the pavement — so its parts are written at
// the places they stand. Laid in any other box it scales like every other object.
const H1_W = 400;
const H1_H = 182;
const h1x = (x: number) => (x / H1_W) * 100;
const h1y = (y: number) => (y / H1_H) * 100;
/** A rectangle from its corners, in the nominal box. */
const h1R = (role: Role, x0: number, y0: number, x1: number, y1: number, rad = 0) =>
  oRect(role, h1x((x0 + x1) / 2), h1y((y0 + y1) / 2), h1x(x1 - x0), h1y(y1 - y0), 0, h1y(rad));
/** A bar between two points, in the nominal box; its thickness in the same units. */
const h1B = (role: Role, x0: number, y0: number, x1: number, y1: number, t: number) =>
  oBar(role, h1x(x0), h1y(y0), h1x(x1), h1y(y1), h1y(t));

// ── SHOP FRONT ───────────────────────────────────────────────────────────────
//
// REFERENCE. A traditional painted shop front is one joinery frame: a CORNICE along the
// top, the FASCIA board under it in a moulding (where the name goes), a CONSOLE bracket
// at each end, PILASTERS down the sides, a big display WINDOW over a panelled
// STALLRISER, with a sill between them and a row of small TRANSOM LIGHTS over the
// main pane, and the door set back in its own reveal. The fascia-and-consoles and the
// stallriser are the field marks: without them a window in a wall is a house. The
// neighbour's brick wall stands to its left. The door leaf (`shopDoor`) and the glass
// break (`glassBreak`) are the scene's to hang, because the lesson looks at both.
const H1_BRICK_ROWS = Array.from({ length: 17 }, (_, c) => c);
const SHOP_FRONT: ObjPart[] = [
  // the neighbour's brick wall, in courses, the perpends staggered course to course
  ...hist1N('brick', h1R('mass', 0, 0, 97, 182)),
  ...hist1N('brick', h1R('dark', 0, 175, 97, 182)),                 // the damp band at its foot
  ...H1_BRICK_ROWS.map((c) => h1B('lit', 1, 10 + c * 10, 95, 10 + c * 10, 1.1)),
  ...H1_BRICK_ROWS.flatMap((c) => [0, 1, 2, 3]
    .map((k) => (c % 2 ? 12 : 24) + k * 24)
    .filter((x) => x < 94)
    .map((x) => h1B('lit', x, c * 10 + 1.8, x, c * 10 + 8.2, 1.1))),
  // the shop front, painted
  ...hist1N('shopPaint',
    h1R('mass', 97, 6, 400, 182),                                    // the frame, one piece of joinery
    h1R('mass', 94, 0, 400, 7, 1),                                   // the cornice, proud of it
    h1R('mass', 97, 10, 104, 40, 1),                                 // a console at each end
    h1R('mass', 393, 10, 400, 40, 1),
  ),
  ...hist1N('shopPaint', h1R('dark', 102, 12, 104, 38), h1R('dark', 398, 12, 400, 38)), // their shaded sides
  ...hist1N('shopPaint',
    h1R('dark', 97, 7, 400, 10),                                     // the cornice's shadow
    h1R('dark', 106, 13, 390, 34, 1),                                // the fascia, sunk in its moulding
    h1R('dark', 190, 40, 194, 182),                                  // the pilasters' shaded sides
    h1R('dark', 240, 40, 244, 182),
    h1R('dark', 194, 64, 237, 182),                                  // the door's reveal
    h1R('dark', 252, 150, 384, 172, 1),                              // the stallriser's sunk panel
    h1R('dark', 97, 178, 400, 182),                                  // the plinth
  ),
  ...hist1N('brass', h1R('dark', 108, 15, 388, 16.4), h1R('dark', 108, 30.6, 388, 32)), // gilt rules
  // the fanlight over the door, and the window: four transom lights over the main pane
  ...hist1N('shopGlass',
    h1R('dark', 198, 67, 233, 79, 1),
    h1R('dark', 246, 38, 279, 52, 0.5), h1R('dark', 283, 38, 316, 52, 0.5),
    h1R('dark', 320, 38, 353, 52, 0.5), h1R('dark', 357, 38, 390, 52, 0.5),
    h1R('dark', 246, 56, 390, 138, 0.5),
  ),
  ...hist1N('wood', h1R('dark', 246, 131, 390, 138)),               // the display bed inside it
  h1B('lit', 252, 76, 268, 60, 1.6),                                 // the pane catching the sky
  h1B('lit', 256, 86, 280, 62, 0.9),
  h1B('lit', 372, 72, 386, 60, 1.4),
  // the sill, stone, and the shadow line under it; the door step
  ...hist1N('coping', h1R('mass', 240, 138, 396, 143, 0.5), h1R('mass', 192, 176, 239, 182, 0.5)),
  h1B('line', 240, 144, 396, 144, 1.2),
  h1B('line', 97, 7, 97, 182, 1.2),                                  // where the shop meets the brick
];
export const shopFront = (x: number, y: number, w: number, h: number) => fit(SHOP_FRONT, x, y, w, h);

// ── SHOP DOOR ────────────────────────────────────────────────────────────────
//
// REFERENCE. A shop door is GLAZED: a tall pane in its upper half so a customer can see
// in, a sunk panel below it, a brass letter plate across the middle rail and a brass
// knob on the opening edge. The glass is what separates it from a house door.
const SHOP_DOOR: ObjPart[] = [
  ...hist1N('shopPaint', oRect('mass', 50, 50, 100, 100, 0, 1.5)),  // the leaf
  ...hist1N('shopGlass', oRect('dark', 50, 27, 70, 40, 0, 1)),      // the glazed upper half
  oBar('lit', 26, 36, 40, 14, 3),                                     // the glass catching the sky
  ...hist1N('shopPaint', oRect('dark', 50, 76, 70, 30, 0, 1)),      // the sunk panel below
  ...hist1N('brass', oRect('mass', 50, 54, 40, 4, 0, 1)),           // the letter plate
  ...hist1N('brass', oEll('mass', 86, 56, 10, 4)),                   // and the knob
];
export const shopDoor = (x: number, y: number, w: number, h: number) => fit(SHOP_DOOR, x, y, w, h);

// ── GLASS BREAK ──────────────────────────────────────────────────────────────
//
// REFERENCE. A pane broken by a thrown thing has a HOLE with a jagged star-shaped edge —
// spikes of the dark behind it running out between the pieces still in the frame — and
// CRACKS radiating from it to the edges of the pane, each one kinking where it crosses a
// ring of shorter cracks round the hole. The spikes are the field mark: a round hole is
// a porthole. Drawn as marks only, laid over the pane: the hole is the dark of the shop
// behind the glass, the cracks are the light catching the broken edges.
const H1_SPIKES = [[14, 17], [72, 11], [128, 15], [186, 13], [244, 19], [302, 12]];
const H1_CRACKS = [0, 48, 96, 150, 206, 258, 316];
const h1Polar = (a: number, r: number): [number, number] => {
  const t = (a * Math.PI) / 180;
  return [50 + Math.sin(t) * r, 50 - Math.cos(t) * r];
};
const GLASS_BREAK: ObjPart[] = [
  ...hist1N('gloom',
    oEll('mass', 50, 50, 22, 18),                                    // the hole, the shop's dark behind it
    ...H1_SPIKES.map(([a, h]) => {                                   // and its star of spikes
      const [x, y] = h1Polar(a, 8 + h / 2);
      return oTri('mass', x, y, 9, h, 'up', a);
    }),
  ),
  ...H1_CRACKS.flatMap((a, k) => {                                   // the cracks: each kinks, and
    const [x0, y0] = h1Polar(a, 11);                                 // every other one forks
    const [x1, y1] = h1Polar(a + (k % 2 ? -5 : 5), 26 + (k % 3) * 3);
    const [x2, y2] = h1Polar(a + (k % 2 ? 9 : -9), 48);
    const fork = h1Polar(a + (k % 2 ? -22 : 22), 40);
    return [
      oBar('lit', x0, y0, x1, y1, 2.4), oBar('lit', x1, y1, x2, y2, 1.8),
      ...(k % 2 ? [] : [oBar('lit', x1, y1, fork[0], fork[1], 1.3)]),
    ];
  }),
];
export const glassBreak = (x: number, y: number, w: number, h: number) => fit(GLASS_BREAK, x, y, w, h);

// ── GLASS SHARDS ─────────────────────────────────────────────────────────────
//
// REFERENCE. Broken plate glass lies as flat SLIVERS — long thin triangles and narrow
// strips, every one a different size and at a different angle, each with one bright
// edge where it catches the light. Authored to be laid SQUARE; the shards lie along the
// foot of the square, which is the ground they fell on.
const GLASS_SHARDS: ObjPart[] = [
  ...hist1N('glass',
    oTri('mass', 10, 92, 16, 9, 'up', -12),
    oTri('mass', 27, 95, 12, 6, 'right', 18),
    oRect('mass', 43, 95, 14, 3.4, -14, 0.5),
    oTri('mass', 60, 91, 14, 11, 'up', 24),
    oTri('mass', 77, 94, 12, 7, 'left', -6),
    oRect('mass', 91, 96, 9, 2.8, 20, 0.5),
  ),
  oBar('lit', 6, 94, 12, 88, 1.4),                                   // a bright edge on the biggest
  oBar('lit', 57, 94, 62, 87, 1.4),
];
export const glassShards = (x: number, y: number, w: number, h: number) => fit(GLASS_SHARDS, x, y, w, h);

// ── FOOTBALL ─────────────────────────────────────────────────────────────────
//
// REFERENCE. A football is a WHITE ball stitched from panels, with a black PENTAGON in
// the middle of the face and the edges of five more cut off by the rim, the seams
// running from the pentagon's corners out to them. The black patches are the field
// mark: a plain white disc is a cue ball, a white disc with lines is a volleyball.
const FOOTBALL: ObjPart[] = [
  ...hist1N('football',
    oEll('face', 50, 50, 100, 100),                                  // the ball, its far side in shade
    oEll('mass', 46, 45, 88, 88),                                    // and the lit face
  ),
  oRect('line', 50, 60, 30, 16, 0, 3), oTri('line', 50, 45, 38, 16, 'up'), // the middle pentagon
  oEll('line', 50, 10, 30, 14),                                      // five more, cut by the rim
  oEll('line', 11, 45, 13, 30),
  oEll('line', 89, 45, 13, 30),
  oEll('line', 26, 86, 26, 13, -36),
  oEll('line', 74, 86, 26, 13, 36),
  oBar('line', 50, 37, 50, 16, 2.4),                                 // the seams between them
  oBar('line', 33, 50, 17, 46, 2.4),
  oBar('line', 67, 50, 83, 46, 2.4),
  oBar('line', 38, 67, 30, 79, 2.4),
  oBar('line', 62, 67, 70, 79, 2.4),
];
export const football = (x: number, y: number, w: number, h: number) => fit(FOOTBALL, x, y, w, h);

// ── TWIG ─────────────────────────────────────────────────────────────────────
//
// REFERENCE. A fallen twig is a thin, crooked STICK of bark that FORKS — a side shoot
// leaving it at a sharp angle and kinking again — with a leaf or two still on it. The
// fork and the leaves are what make it a twig rather than a pencil. Authored to be laid
// SQUARE; it lies along the foot of the square, on the pavement.
const TWIG: ObjPart[] = [
  ...hist1N('bark',
    oBar('mass', 4, 90, 50, 84, 6),                                  // the stick, lying down, crooked
    oBar('mass', 50, 84, 96, 88, 5),
    oBar('mass', 38, 86, 56, 70, 4),                                 // a side shoot, forking up
    oBar('mass', 56, 70, 70, 68, 3),
    oBar('mass', 76, 86, 86, 76, 3),
  ),
  ...hist1N('leaf',
    oEll('mass', 78, 66, 15, 8, -12),
    oEll('mass', 90, 72, 12, 7, 34),
  ),
];
export const twig = (x: number, y: number, w: number, h: number) => fit(TWIG, x, y, w, h);

// ── NOTICE BOARD ─────────────────────────────────────────────────────────────
//
// REFERENCE. A notice board is a panel of CORK in a plain WOODEN FRAME, screwed to the
// wall at its corners, with papers pinned to it. The cork's speckled tan and the frame
// are the field marks: a framed dark panel is a chalkboard, a framed white one is a
// whiteboard. What is pinned to it is the scene's to draw, because it changes
// (`BOARD_CORK`, in the square).
const H1_SPECKS = [[16, 20], [34, 14], [72, 22], [88, 30], [22, 46], [60, 40], [82, 58], [14, 70], [40, 78], [66, 86], [86, 88], [28, 60], [52, 66], [46, 24]];
const NOTICE_BOARD: ObjPart[] = [
  ...hist1N('wood', oRect('mass', 50, 50, 100, 100, 0, 2)),          // the frame
  ...hist1N('cork', oRect('mass', 50, 51, 88, 86, 0, 1)),            // the cork in it
  ...hist1N('wood', oRect('dark', 50, 9.5, 88, 3), oRect('dark', 7.5, 51, 3, 86)), // the frame's shadow on it
  ...hist1N('cork', ...H1_SPECKS.map(([x, y]) => oEll('dark', x, y, 2.6, 2.6))),
  ...[[3.5, 3.5], [96.5, 3.5], [3.5, 96.5], [96.5, 96.5]].map(([x, y]) => oEll('line', x, y, 2.6, 2.6)), // the screws
  oBar('lit', 3, 2.5, 97, 2.5, 1.2),                                 // the lamp along its top
];
export const noticeBoard = (x: number, y: number, w: number, h: number) => fit(NOTICE_BOARD, x, y, w, h);
/** The cork inside the frame, in the board's own square. */
export const BOARD_CORK = { x: 50, y: 51, w: 88, h: 86 } as const;

// ── hist1: objects for this lesson go ABOVE this line ──

/** Every object, by name — what `sheet-objects` and `check:objects` walk. */
export const OBJECTS = {
  tree, ship, table, book, lamp, cup, crate, hammer, flute, bench, drum,
  door, shelf, flag, bridge, window, wheel, coin, leaf, plinth, column, cave,
  stall, counter, pie, loaf, note, chalkboard, apple,
  // phil1:
  bicycleWheel, bicycleFrame, repairStand, partsCrateBack, partsCrateFront, repairBill, wallBoard, workbench, pegboard,
  // psych1:
  carafe, coffeeCup, tentCard, menuBoard, cafeCounter,
  // growth1:
  flowerpot, puddle, wateringCan, sunflower, shed, shedDoor, gardenWall, houseFront,
  // biz1:
  lemonStand, standCounter, lemon, lemonadeJug, reamer, paperCup, cupStack, cashTin, tinLid, lemonCrateBack, lemonCrateFront, queueSign, cupBin,
  // sci1:
  stepLadder, ironBall, tennisBall, yardWall, schoolSlate, patio,
  // hist1:
  shopFront, shopDoor, glassBreak, glassShards, football, twig, noticeBoard,
} as const;
export type ObjectName = keyof typeof OBJECTS;

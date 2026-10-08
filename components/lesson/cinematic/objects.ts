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
// So `node scripts/sheet-lesson-objects.mjs ship` draws it in plain Node and "does that
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
  hardboard:  { base: '#BC9468', shade: '#94704A', label: '#1A1A1A', what: 'a workshop pegboard in brown hardboard' },
  // psych1 colours:
  coffee:     { base: '#5A3620', shade: '#3E2415', label: '#FAFAF7', what: 'brewed coffee, in a pot or a cup' },
  porcelain:  { base: '#F4F1EA', shade: '#D6D0C3', label: '#1A1A1A', what: 'a white china cup and saucer' },
  glass:      { base: '#DCE6EA', shade: '#B6C6CD', label: '#1A1A1A', what: 'clear glass, a coffee pot' },
  counterPaint: { base: '#3F6B5C', shade: '#2E5145', label: '#FAFAF7', what: 'a café counter\'s fluted front, painted deep green' },
  cafeWall:   { base: '#DCE4DE', shade: '#BCC9C0', label: '#1A1A1A', what: 'a café\'s back wall, painted pale green-grey' },
  // growth1 colours:
  petal:      { base: '#F2B32C', shade: '#C98A1A', label: '#1A1A1A', what: 'a sunflower\'s petals, a buttercup' },
  seedhead:   { base: '#6A4024', shade: '#4A2C18', label: '#FAFAF7', what: 'a sunflower\'s seed disc, dark seeds' },
  soil:       { base: '#5B4130', shade: '#3E2C20', label: '#FAFAF7', what: 'damp potting soil, garden earth' },
  drySoil:    { base: '#CDB38A', shade: '#A98F66', label: '#1A1A1A', what: 'dry, pale, unwatered soil' },
  doorPaint:  { base: '#2F5D7C', shade: '#234862', label: '#FAFAF7', what: 'a front door painted blue' },
  coping:     { base: '#C2BBAB', shade: '#9E9888', label: '#1A1A1A', what: 'a wall\'s stone coping, a stone step' },
  felt:       { base: '#4A4D52', shade: '#35383C', label: '#FAFAF7', what: 'roofing felt, a slate roof, a shed\'s dark inside' },
  render:     { base: '#BCD2CC', shade: '#97B0A9', label: '#1A1A1A', what: 'a terraced house\'s painted render, pale sea-green' },
  sashWhite:  { base: '#F3F2EC', shade: '#CFCDC2', label: '#1A1A1A', what: 'a sash window\'s white-painted frame' },
  houseGlass: { base: '#4E6470', shade: '#3A4B55', label: '#FAFAF7', what: 'a house window\'s glass, the room dark behind it' },
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
  // phil2 colours:
  sponge:     { base: '#9A6036', shade: '#764728', label: '#FAFAF7', what: 'carrot cake\'s spiced sponge' },
  frosting:   { base: '#F4E8C8', shade: '#D9C79C', label: '#1A1A1A', what: 'cream-cheese frosting, icing' },
  marble:     { base: '#ECEAE4', shade: '#C8C5BC', label: '#1A1A1A', what: 'a white marble café table top' },
  awning:     { base: '#A12E36', shade: '#7B2229', label: '#FAFAF7', what: 'a café awning\'s red canvas stripe' },
  shopfront:  { base: '#2F5E52', shade: '#234840', label: '#FAFAF7', what: 'a pavement café\'s front, painted deep green' },
  // psych2 colours:
  jam:        { base: '#9E2633', shade: '#741A24', label: '#FAFAF7', what: 'strawberry jam, dark red, in a jar or spilt' },
  marmalade:  { base: '#D9822B', shade: '#AD6420', label: '#1A1A1A', what: 'orange marmalade in a jar' },
  blackcurrant: { base: '#5B2A55', shade: '#3F1C3B', label: '#FAFAF7', what: 'blackcurrant jam, dark purple' },
  trolleyRed: { base: '#C2352B', shade: '#932820', label: '#FAFAF7', what: 'a shopping trolley\'s red plastic handle and bumpers' },
  castor:     { base: '#45484C', shade: '#2F3134', label: '#FAFAF7', what: 'a castor wheel\'s grey rubber tyre' },
  casing:     { base: '#E4E5E1', shade: '#C1C3BD', label: '#1A1A1A', what: 'white powder-coated steel or plastic — shelving, a camera housing' },
  signBoard:  { base: '#34393D', shade: '#25292C', label: '#FAFAF7', what: 'a hung supermarket aisle sign\'s charcoal board, a monitor bezel' },
  signRed:    { base: '#B7372F', shade: '#8E2A24', label: '#FAFAF7', what: 'the red aisle-number panel on a supermarket sign' },
  screenOff:  { base: '#2B3236', shade: '#1D2225', label: '#FAFAF7', what: 'a monitor\'s dark screen, switched off' },
  screenOn:   { base: '#A9BFB6', shade: '#86A096', label: '#1A1A1A', what: 'a CCTV monitor\'s lit grey-green picture' },
  // growth2 colours:
  tile:       { base: '#EEF1EE', shade: '#C9D0CB', label: '#1A1A1A', what: 'white glazed wall tiles, a kitchen splashback' },
  tea:        { base: '#B98552', shade: '#8E6038', label: '#1A1A1A', what: 'tea with milk, in a mug' },
  mugGlaze:   { base: '#3D6E99', shade: '#2C5273', label: '#FAFAF7', what: 'a mug glazed blue' },
  biscuit:    { base: '#D9A85E', shade: '#B5854A', label: '#1A1A1A', what: 'a baked biscuit, a digestive' },
  wrapper:    { base: '#5B2A6E', shade: '#43204F', label: '#FAFAF7', what: 'a chocolate bar\'s purple wrapper' },
  cupboard:   { base: '#A9BCC6', shade: '#879BA6', label: '#1A1A1A', what: 'kitchen cupboards painted a pale blue-grey' },
  clockRed:   { base: '#B8423A', shade: '#8E3029', label: '#FAFAF7', what: 'a kitchen wall clock\'s red rim, its red second hand' },
  bowlGlaze:  { base: '#3F6F98', shade: '#2F5577', label: '#FAFAF7', what: 'a fruit bowl glazed blue' },
  padBack:    { base: '#8F8578', shade: '#706757', label: '#1A1A1A', what: 'a notepad\'s grey board back' },
  skyPane:    { base: '#CFE3EE', shade: '#B5D1E1', label: '#1A1A1A', what: 'an afternoon sky seen through a window\'s glass' },
  // biz2 colours:
  macaron:    { base: '#F3B5C7', shade: '#D88FA6', label: '#1A1A1A', what: 'pastel-pink macaron shells, pink cake icing' },
  pastryRaw:  { base: '#EFDDB2', shade: '#D2BC8A', label: '#1A1A1A', what: 'raw, unbaked puff pastry' },
  sausage:    { base: '#9C5B42', shade: '#74412F', label: '#FAFAF7', what: 'cooked sausage meat, seen at a roll\'s end' },
  teapotGlaze: { base: '#8A4E25', shade: '#653819', label: '#FAFAF7', what: 'a brown betty teapot\'s treacle glaze' },
  bookCloth:  { base: '#7C2F3B', shade: '#5B212A', label: '#FAFAF7', what: 'a recipe book\'s burgundy cloth cover' },
  crystal:    { base: '#CFCBEA', shade: '#A8A2D3', label: '#1A1A1A', what: 'a crystal ball\'s glass, faintly violet' },
  dawnSky:    { base: '#F2C2A0', shade: '#E8A27E', label: '#1A1A1A', what: 'the sky at dawn, high up' },
  dawnGlow:   { base: '#FAE3B4', shade: '#F6D49E', label: '#1A1A1A', what: 'the sky at dawn, low at the horizon' },
  rooftops:   { base: '#5A6470', shade: '#46505B', label: '#FAFAF7', what: 'buildings and a crane against a dawn sky' },
  duckEgg:    { base: '#B4D6CD', shade: '#8EB5AB', label: '#1A1A1A', what: 'a bakery counter painted duck-egg blue' },
  ovenGlow:   { base: '#F5A447', shade: '#D9822B', label: '#1A1A1A', what: 'the glow inside a hot oven' },
  ovenGlass:  { base: '#5A4636', shade: '#3D2F24', label: '#FAFAF7', what: 'an oven door\'s smoked-glass window' },
  // econ1 colours:
  cherry:     { base: '#9B2335', shade: '#6F1925', label: '#FAFAF7', what: 'a cherry pie\'s red filling, showing through its lattice' },
  pastry:     { base: '#E2B46C', shade: '#BE8E47', label: '#1A1A1A', what: 'a pie\'s golden glazed pastry — its lattice and its crimped rim' },
  marketCanvas: { base: '#2E7D4F', shade: '#225E3B', label: '#FAFAF7', what: 'a market stall\'s green-and-white striped canopy, its green' },
  paperback:  { base: '#D9732A', shade: '#AE5A1D', label: '#1A1A1A', what: 'a paperback book\'s orange cover' },
  // econ2 colours:
  stucco:     { base: '#E6D9BF', shade: '#C9B999', label: '#1A1A1A', what: 'a corner shop\'s cream rendered wall' },
  umbRed:    { base: '#B3343A', shade: '#87272C', label: '#FAFAF7', what: 'a red umbrella\'s nylon canopy' },
  umbNavy:    { base: '#2E4A72', shade: '#213656', label: '#FAFAF7', what: 'a navy umbrella\'s nylon canopy' },
  umbYellow:  { base: '#E9B826', shade: '#BE931A', label: '#1A1A1A', what: 'a yellow umbrella\'s nylon canopy' },
  umbBlack:   { base: '#34383D', shade: '#22252A', label: '#FAFAF7', what: 'a black umbrella\'s nylon canopy' },
  umbGreen:   { base: '#3E7A5A', shade: '#2D5B43', label: '#FAFAF7', what: 'a green umbrella\'s nylon canopy' },
  canvasTeal: { base: '#2F6B63', shade: '#22504A', label: '#FAFAF7', what: 'a shop awning\'s dark teal canvas' },
  clearSky:   { base: '#CDE3EE', shade: '#AFCBDA', label: '#1A1A1A', what: 'a clear daytime sky' },
  greySky:    { base: '#A3AEB5', shade: '#8A959C', label: '#1A1A1A', what: 'an overcast sky, about to rain' },
  rainCloud:  { base: '#7D878F', shade: '#5F686F', label: '#1A1A1A', what: 'a grey rain cloud' },
  sunshine:   { base: '#F4C430', shade: '#D6A41A', label: '#1A1A1A', what: 'the sun, a flat yellow disc' },
  vanWhite:   { base: '#EEEFEB', shade: '#C9CBC5', label: '#1A1A1A', what: 'a white delivery van\'s panels' },
  tyre:       { base: '#33363A', shade: '#222427', label: '#FAFAF7', what: 'a van\'s black rubber tyre' },
  cargoDark:  { base: '#3A3F44', shade: '#272B2F', label: '#FAFAF7', what: 'the dark load space inside a van' },
  cardboard:  { base: '#C49A62', shade: '#A27B47', label: '#1A1A1A', what: 'a brown cardboard box' },
  // sci2 colours:
  pinkPaper:  { base: '#F2A7C3', shade: '#D4849F', label: '#1A1A1A', what: 'pink paper, folded into a paper plane' },
  tapeCase:   { base: '#2F5FA8', shade: '#234A84', label: '#FAFAF7', what: 'a tape measure\'s blue plastic case' },
  tapeBlade:  { base: '#F0CB2E', shade: '#C9A51C', label: '#1A1A1A', what: 'a tape measure\'s yellow steel blade' },
  stepStone:  { base: '#B6B7AB', shade: '#7C7D72', label: '#1A1A1A', what: 'weathered grey park stone — steps, a pier, a finial' },
  meadow:     { base: '#8DB25A', shade: '#6F9142', label: '#1A1A1A', what: 'a grassy bank in a park, sunlit, seen a little way off' },
  // hist2 colours:
  gloom:      { base: '#1F2A30', shade: '#141B1F', label: '#FAFAF7', what: 'the dark inside a shut shop, seen through a hole' },
  yellowed:   { base: '#EAD9A4', shade: '#CDB97F', label: '#1A1A1A', what: 'an old letter\'s paper, yellowed with a century' },
  newsprint:  { base: '#DCD6C3', shade: '#BCB49C', label: '#1A1A1A', what: 'old newsprint, gone grey-cream' },
  hatbox:     { base: '#C98C84', shade: '#A46A64', label: '#1A1A1A', what: 'a faded rose cardboard hatbox' },
  trunk:      { base: '#4D5A3C', shade: '#39432C', label: '#FAFAF7', what: 'a steamer trunk\'s dark green canvas' },
  bookBlue:   { base: '#2F4D7C', shade: '#22385B', label: '#FAFAF7', what: 'a glossy history book\'s blue cover' },
  sepia:      { base: '#BCA27C', shade: '#8F7656', label: '#1A1A1A', what: 'an old sepia photograph' },
  khaki:      { base: '#766C40', shade: '#574F2C', label: '#FAFAF7', what: 'a 1916 soldier\'s khaki tunic and cap' },
  potato:     { base: '#C9A266', shade: '#A07D47', label: '#1A1A1A', what: 'potatoes in their skins' },
  roofBoard:  { base: '#5C3F27', shade: '#43301E', label: '#FAFAF7', what: 'an attic\'s roof boards, old and dark' },
  whitewash:  { base: '#E3E2DC', shade: '#C2C0B6', label: '#1A1A1A', what: 'an attic\'s whitewashed board wall' },
  // phil3 colours:
  oak:        { base: '#B98B57', shade: '#94693F', label: '#1A1A1A', what: 'a library desk in light oak' },
  twenty:     { base: '#7B5C9F', shade: '#5D4480', label: '#FAFAF7', what: 'a twenty-pound note\'s purple' },
  stampGrip:  { base: '#E7DDC5', shade: '#C5B998', label: '#1A1A1A', what: 'a date stamp\'s cream plastic handle' },
  stampBand:  { base: '#6E9A4C', shade: '#527538', label: '#1A1A1A', what: 'a date stamp\'s green cap and rubber bands' },
  novel:      { base: '#2E7686', shade: '#225966', label: '#FAFAF7', what: 'a paperback novel\'s teal cover' },
  // psych3 colours:
  mugBrown:   { base: '#7E4524', shade: '#5C311A', label: '#FAFAF7', what: 'a brown-glazed stoneware mug, its glaze' },
  clay:       { base: '#E2C99B', shade: '#C4A976', label: '#1A1A1A', what: 'bare stoneware — the pale body at a chip or a foot ring' },
  plinthWhite: { base: '#F1F0EB', shade: '#CFCDC4', label: '#1A1A1A', what: 'a museum plinth, a window frame, painted white' },
  // growth3 colours:
  tartan:     { base: '#B4553F', shade: '#8C412F', label: '#FAFAF7', what: 'a running track\'s red rubber surface' },
  calRed:     { base: '#C0392B', shade: '#932C21', label: '#FAFAF7', what: 'a wall calendar\'s red month band' },
  bottleBlue: { base: '#2A6A9E', shade: '#1F5079', label: '#FAFAF7', what: 'an aluminium sports bottle in blue' },
  capBlack:   { base: '#2E3134', shade: '#1E2023', label: '#FAFAF7', what: 'a black plastic bottle cap, a pen\'s end cap' },
  binGreen:   { base: '#2F5E3E', shade: '#22462E', label: '#FAFAF7', what: 'a park litter bin in dark green metal' },
  penBlue:    { base: '#2F4FA0', shade: '#233C7A', label: '#FAFAF7', what: 'a ballpoint pen\'s blue barrel' },
  // biz3 colours:
  gazebo:     { base: '#2F4A6B', shade: '#233852', label: '#FAFAF7', what: 'a craft-fair gazebo\'s navy canvas' },
  gazeboSage: { base: '#7D9A78', shade: '#5F7A5B', label: '#1A1A1A', what: 'the next stall\'s sage-green gazebo canvas' },
  linen:      { base: '#EDE4CF', shade: '#CFC3A6', label: '#1A1A1A', what: 'a cream linen tablecloth' },
  soyWax:     { base: '#F3EBD3', shade: '#D6C9A3', label: '#1A1A1A', what: 'a block of soy candle wax, creamy white' },
  waxLavender: { base: '#B9A6D6', shade: '#9783B8', label: '#1A1A1A', what: 'lavender candle wax, seen through its jar' },
  waxRose:    { base: '#E9A3B3', shade: '#C98191', label: '#1A1A1A', what: 'rose-pink candle wax, seen through its jar' },
  waxSage:    { base: '#AFC59A', shade: '#8DA477', label: '#1A1A1A', what: 'sage-green candle wax, seen through its jar' },
  waxCranberry: { base: '#A8283A', shade: '#7F1D2B', label: '#FAFAF7', what: 'a Christmas candle\'s cranberry-red wax' },
  satin:      { base: '#2E6B45', shade: '#214F33', label: '#FAFAF7', what: 'green satin ribbon, on a spool or tied in a bow' },
  tote:       { base: '#EFE7D4', shade: '#D2C6AA', label: '#1A1A1A', what: 'a natural canvas tote bag' },
  pennantRed: { base: '#C8453A', shade: '#9C342B', label: '#FAFAF7', what: 'a red cotton bunting pennant' },
  pennantMustard: { base: '#E1B23A', shade: '#B88E27', label: '#1A1A1A', what: 'a mustard cotton bunting pennant' },
  pennantTeal: { base: '#2F7570', shade: '#225753', label: '#FAFAF7', what: 'a teal cotton bunting pennant' },
  // econ3 colours:
  gigRed:     { base: '#B83A2E', shade: '#8C2B22', label: '#FAFAF7', what: 'a gig poster\'s printed red' },
  gigNight:   { base: '#2B3550', shade: '#1E2538', label: '#FAFAF7', what: 'a concert poster\'s night-blue stage' },
  spotBeam:   { base: '#5C6788', shade: '#47506B', label: '#FAFAF7', what: 'a spotlight\'s beam on a night-blue poster' },
  pitch:      { base: '#2F7A3E', shade: '#235C2E', label: '#FAFAF7', what: 'a football pitch\'s deep green, printed' },
  pitchLight: { base: '#4C9A55', shade: '#3A7A42', label: '#1A1A1A', what: 'the paler mown stripe of a football pitch' },
  ticketPink: { base: '#E86F8E', shade: '#C2546F', label: '#1A1A1A', what: 'a concert ticket printed pink' },
  ticketGreen: { base: '#7CC36A', shade: '#5C9F4D', label: '#1A1A1A', what: 'a football ticket printed green' },
  note20:     { base: '#A386C6', shade: '#7E62A3', label: '#1A1A1A', what: 'a twenty-pound note\'s lilac purple' },
  note10:     { base: '#C98A52', shade: '#A36A38', label: '#1A1A1A', what: 'a ten-pound note\'s orange-brown' },
  note5:      { base: '#5FA3A8', shade: '#447F84', label: '#1A1A1A', what: 'a five-pound note\'s teal' },
  // sci3 colours:
  sand:       { base: '#E8D3A2', shade: '#C9B07A', label: '#1A1A1A', what: 'dry beach sand in the sun' },
  railGreen:  { base: '#5E9E92', shade: '#467A70', label: '#1A1A1A', what: 'seaside promenade railings in pale sea-green paint' },
  kioskBlue:  { base: '#8EC3DD', shade: '#6DA2BC', label: '#1A1A1A', what: 'a seaside kiosk painted sky blue' },
  stripeRed:  { base: '#C8373B', shade: '#9A2A2D', label: '#FAFAF7', what: 'the red stripe of a kiosk awning; a sunburn line on a chart' },
  canvasWhite: { base: '#F6F3EC', shade: '#D9D3C6', label: '#1A1A1A', what: 'white canvas — an awning stripe, a parasol panel' },
  umbOrange:  { base: '#EE8A2E', shade: '#C46C1C', label: '#1A1A1A', what: 'a beach parasol\'s orange canvas panels' },
  wafer:      { base: '#D7A75F', shade: '#B0833F', label: '#1A1A1A', what: 'an ice cream cornet\'s baked wafer' },
  scoopPink:  { base: '#F2A2B5', shade: '#D57F94', label: '#1A1A1A', what: 'a scoop of strawberry ice cream' },
  vanilla:    { base: '#F5E7BF', shade: '#DCC994', label: '#1A1A1A', what: 'a scoop of vanilla ice cream' },
  ropeRed:    { base: '#A6282E', shade: '#7E1E23', label: '#FAFAF7', what: 'a queue barrier\'s red rope' },
  creamTube:  { base: '#F0B53A', shade: '#C99120', label: '#1A1A1A', what: 'a squeezy bottle of sun cream' },
  cloudWhite: { base: '#FCFDFE', shade: '#D6E2EA', label: '#1A1A1A', what: 'a white fair-weather cloud' },
  // hist3 colours:
  hay:        { base: '#D9B45C', shade: '#AF8C3C', label: '#1A1A1A', what: 'dry hay loaded on a cart, straw' },
  oldWood:    { base: '#9C9384', shade: '#766E62', label: '#1A1A1A', what: 'weathered silver-grey timber — an old footbridge, a fence' },
  rotWood:    { base: '#4C3828', shade: '#33261B', label: '#FAFAF7', what: 'wood gone dark and soft with rot' },
  newWood:    { base: '#DEBC88', shade: '#BA9863', label: '#1A1A1A', what: 'a new plank of fresh-sawn pine' },
  barnBoard:  { base: '#8E3B2B', shade: '#6A2B1F', label: '#FAFAF7', what: 'a barn\'s weatherboards in faded red paint' },
  // phil4 colours:
  clockMaroon: { base: '#7A2632', shade: '#581B24', label: '#FAFAF7', what: 'a station pillar clock\'s cast iron, painted maroon' },
  dialCream:  { base: '#F8F2E2', shade: '#EFE6CC', label: '#1A1A1A', what: 'a station clock\'s cream enamel dial (drawn as a laid-on plane, so in its shade)' },
  screenCase: { base: '#4A4E52', shade: '#33373A', label: '#FAFAF7', what: 'a platform departure screen\'s grey steel casing and post' },
  ledBlack:   { base: '#1C1F21', shade: '#121415', label: '#F2A33A', what: 'a departure screen\'s black display, behind its amber letters' },
  ledAmber:   { base: '#F2A33A', shade: '#C9822A', label: '#1A1A1A', what: 'the amber LED letters of a departure screen' },
  railBlue:   { base: '#24487A', shade: '#1A365C', label: '#FAFAF7', what: 'a platform sign in railway blue, white letters on it' },
  benchGreen: { base: '#2E5A40', shade: '#21432F', label: '#FAFAF7', what: 'a platform bench\'s cast-iron ends, painted dark green' },
  ticketOrange: { base: '#E9772D', shade: '#BF5C1D', label: '#1A1A1A', what: 'a railway ticket\'s orange bands' },
  lampGlow:   { base: '#FFF2C4', shade: '#F6D47E', label: '#1A1A1A', what: 'a train\'s headlamp, lit, coming out of a dark tunnel' },
  safetyLine: { base: '#F0C92E', shade: '#C9A41C', label: '#1A1A1A', what: 'the yellow safety line painted along a platform\'s edge' },
  // psych4 colours:
  shelterSteel: { base: '#5E656B', shade: '#464C51', label: '#FAFAF7', what: 'a bus shelter\'s grey powder-coated steel roof, posts and advert case' },
  noticeYellow: { base: '#F2D31C', shade: '#CBAE12', label: '#1A1A1A', what: 'a bright yellow "bus stop closed" notice; a timetable\'s yellow rows' },
  stopRed:    { base: '#D2392F', shade: '#B52E26', label: '#FAFAF7', what: 'the red band on a bus stop flag and across a closure notice' },
  posterMint: { base: '#C4E8E0', shade: '#A8DACF', label: '#1A1A1A', what: 'a lit shampoo advert\'s pale mint ground' },
  shampoo:    { base: '#E27FA2', shade: '#C9628A', label: '#1A1A1A', what: 'a pink shampoo bottle on an advert' },
  // growth4 colours:
  wetClay:    { base: '#93857A', shade: '#706458', label: '#1A1A1A', what: 'wet grey stoneware clay on the wheel, and the slip in its splash pan' },
  wheelCream: { base: '#E9E7DF', shade: '#C6C3B8', label: '#1A1A1A', what: 'a potter wheel splash pan and body, in cream plastic' },
  celadon:    { base: '#8FB8A2', shade: '#6F9883', label: '#1A1A1A', what: 'a pale green celadon glaze on a finished pot' },
  tenmoku:    { base: '#4E3426', shade: '#36231A', label: '#FAFAF7', what: 'a dark brown-black tenmoku glaze on a finished pot' },
  cobaltGlaze: { base: '#2F5590', shade: '#223F6C', label: '#FAFAF7', what: 'a deep cobalt-blue glaze on a finished pot' },
  oatmeal:    { base: '#E2D6BC', shade: '#C2B497', label: '#1A1A1A', what: 'a speckled oatmeal glaze, cream, on a finished pot' },
  // biz4 colours:
  truckCream: { base: '#F1E8D4', shade: '#D3C6A8', label: '#1A1A1A', what: 'a food truck\'s cream-painted body' },
  truckRed:   { base: '#B5392F', shade: '#8A2B23', label: '#FAFAF7', what: 'a food truck\'s red stripe and serving-hatch flap' },
  steelInside: { base: '#D8DBDC', shade: '#BEC3C5', label: '#1A1A1A', what: 'a food truck\'s stainless-steel kitchen wall, seen through its hatch' },
  truckGlow:  { base: '#F7E3B0', shade: '#EDD08A', label: '#1A1A1A', what: 'the warm light of the lamp inside a food truck, and a bakery\'s lit window' },
  cashSteel:  { base: '#56708A', shade: '#405568', label: '#FAFAF7', what: 'a cash box in blue-grey enamelled steel' },
  calcBody:   { base: '#3C4043', shade: '#2A2D30', label: '#FAFAF7', what: 'a pocket calculator\'s dark grey plastic' },
  calcLcd:    { base: '#B9C4A6', shade: '#98A487', label: '#1A1A1A', what: 'a calculator\'s grey-green LCD display' },
  asphalt:    { base: '#8D9090', shade: '#6F7272', label: '#1A1A1A', what: 'a road\'s grey asphalt' },
  bakeryBlue: { base: '#A9C6D6', shade: '#86A6B8', label: '#1A1A1A', what: 'a bakery shop front and fascia painted pale blue' },
  bakeryWall: { base: '#CDBFA6', shade: '#AE9F85', label: '#1A1A1A', what: 'an old stone building\'s front, warm grey' },
  bulbLit:    { base: '#F6D36A', shade: '#E0B443', label: '#1A1A1A', what: 'a festoon bulb, lit warm' },
  bulbOff:    { base: '#C9CCC8', shade: '#A7AAA6', label: '#1A1A1A', what: 'a festoon bulb, switched off' },
  // econ4 colours:
  tomato:     { base: '#D23A2A', shade: '#A32B1F', label: '#FAFAF7', what: 'a ripe tomato, red' },
  cane:       { base: '#C8AC6E', shade: '#A58A50', label: '#1A1A1A', what: 'a bamboo garden cane' },
  henRusset:  { base: '#A0522D', shade: '#7A3D20', label: '#FAFAF7', what: 'a brown hen\'s russet feathers' },
  henWhite:   { base: '#F3EFE4', shade: '#D2CBB8', label: '#1A1A1A', what: 'a white hen\'s feathers' },
  henBlack:   { base: '#33363B', shade: '#212327', label: '#FAFAF7', what: 'a black hen\'s feathers' },
  henComb:    { base: '#C9302C', shade: '#9C2421', label: '#FAFAF7', what: 'a hen\'s red comb and wattles' },
  henLeg:     { base: '#E3B341', shade: '#B98D2A', label: '#1A1A1A', what: 'a hen\'s yellow legs and beak' },
  eggShell:   { base: '#D29A66', shade: '#AD7A4B', label: '#1A1A1A', what: 'a brown hen\'s egg' },
  eggCarton:  { base: '#C9C4B6', shade: '#A6A193', label: '#1A1A1A', what: 'a grey moulded-pulp egg box' },
  wicker:     { base: '#B8894C', shade: '#91693A', label: '#1A1A1A', what: 'a wicker garden basket' },
  coopSage:   { base: '#8FA27E', shade: '#6F8160', label: '#1A1A1A', what: 'a garden hen house painted sage green' },
  picket:     { base: '#F4F2EC', shade: '#CFCBC0', label: '#1A1A1A', what: 'a garden picket fence, painted white' },
  hedge:      { base: '#9DBB72', shade: '#7E9C56', label: '#1A1A1A', what: 'a clipped privet hedge at the back of a garden' },
  // sci4 colours:
  swingBlue:  { base: '#33689F', shade: '#264F7A', label: '#FAFAF7', what: 'a playground swing frame\'s blue-painted steel tubes' },
  swingChain: { base: '#8A8F94', shade: '#6B7075', label: '#1A1A1A', what: 'a swing\'s galvanised steel chains and their shackles' },
  rubberMat:  { base: '#4A4D51', shade: '#36393C', label: '#FAFAF7', what: 'the dark rubber safety surface poured under a playground swing' },
  // hist4 colours:
  towerStone: { base: '#BDB29B', shade: '#958A74', label: '#1A1A1A', what: 'a clock tower\'s buff sandstone ashlar' },
  dialWhite:  { base: '#F4F2EA', shade: '#D3CFC2', label: '#1A1A1A', what: 'a tower clock\'s white enamelled dial' },
  belfry:     { base: '#3B3631', shade: '#28241F', label: '#FAFAF7', what: 'the dark inside a belfry\'s arched opening' },
  bellBronze: { base: '#B07C34', shade: '#835A24', label: '#1A1A1A', what: 'a tower bell\'s bronze' },
  granite:    { base: '#A2A39D', shade: '#7B7C76', label: '#1A1A1A', what: 'a grey granite horse trough' },
  geranium:   { base: '#C9333B', shade: '#9A262D', label: '#FAFAF7', what: 'red geraniums planted in a trough' },
  petunia:    { base: '#DA74A2', shade: '#B1557F', label: '#1A1A1A', what: 'pink petunias trailing over a planter\'s edge' },
  fascia:     { base: '#2D73B3', shade: '#215789', label: '#FAFAF7', what: 'a phone shop\'s fascia sign, in bright blue' },
  litGlass:   { base: '#DDEAF0', shade: '#B9CFD9', label: '#1A1A1A', what: 'a phone shop\'s plate glass, the bright inside showing' },
  phoneBody:  { base: '#2A2D31', shade: '#1B1D20', label: '#FAFAF7', what: 'a smartphone\'s black body, on a display stand' },
  phoneLit:   { base: '#4C97D9', shade: '#3474AD', label: '#1A1A1A', what: 'a display smartphone\'s lit screen' },
  sepiaDark:  { base: '#6F5537', shade: '#523E28', label: '#FAFAF7', what: 'the dark tones in an old sepia photograph' },
  // hist5 colours: an Athenian stoa, its water clock and ballot urns; and a bedroom of today
  stoaStone:  { base: '#E2D6BE', shade: '#BFB090', label: '#1A1A1A', what: 'a stoa\'s pale limestone columns, in the light' },
  stoaShade:  { base: '#A69779', shade: '#857860', label: '#1A1A1A', what: 'a stoa\'s stone walls and steps, in shadow' },
  stoaBeam:   { base: '#6A4428', shade: '#4C301B', label: '#FAFAF7', what: 'a stoa\'s dark timber ceiling beams' },
  stoaFloor:  { base: '#E6DCC6', shade: '#C7BA9D', label: '#1A1A1A', what: 'a stoa\'s marble floor, in a bar of sunlight' },
  floorShade: { base: '#B3A58A', shade: '#938770', label: '#1A1A1A', what: 'a stoa\'s marble floor in a column\'s shadow' },
  skyGlow:    { base: '#F6EED6', shade: '#E1D3AE', label: '#1A1A1A', what: 'sunlight beyond the far end of a colonnade' },
  clayPot:    { base: '#D9C4A2', shade: '#B39C78', label: '#1A1A1A', what: 'a water clock\'s cream terracotta bowl' },
  potRim:     { base: '#2E2A2D', shade: '#1D1A1C', label: '#FAFAF7', what: 'the black-painted rim of a terracotta bowl' },
  urnBronze:  { base: '#7C5229', shade: '#5A3B1C', label: '#FAFAF7', what: 'an Athenian ballot urn\'s dark bronze' },
  bedWall:    { base: '#CCD5E3', shade: '#AAB5C8', label: '#1A1A1A', what: 'a bedroom wall painted pale blue-grey' },
  duvet:      { base: '#4E6C98', shade: '#3A5276', label: '#FAFAF7', what: 'a navy-blue duvet cover' },
  lampShade:  { base: '#EDCC84', shade: '#C9A662', label: '#1A1A1A', what: 'a bedside lamp\'s warm fabric shade, lit' },
  posterRed:  { base: '#C24A3A', shade: '#963629', label: '#FAFAF7', what: 'a poster\'s red print' },
  posterTeal: { base: '#2E6E77', shade: '#215258', label: '#FAFAF7', what: 'a poster\'s teal print' },
  // Athens, seen beyond the court (hist5Set.ts)
  terracotta: { base: '#A85A3A', shade: '#84452C', label: '#FAFAF7', what: 'Greek terracotta roof tiles' },
  oliveLeaf:  { base: '#8A9566', shade: '#6C764E', label: '#1A1A1A', what: 'an olive tree\'s silvery-green leaves' },
  cypressGreen: { base: '#3F5B3B', shade: '#2E4430', label: '#FAFAF7', what: 'a cypress tree, dark green' },
  atticRock:  { base: '#D2BE9E', shade: '#B09A78', label: '#1A1A1A', what: 'the Acropolis rock, pale limestone in the sun' },
  atticHill:  { base: '#A7A887', shade: '#8A8B6B', label: '#1A1A1A', what: 'the dry hills round Athens, seen far off' },
  // phil5 colours: an orbiting space lab, its teleporter pod and console, the Earth through a porthole and the Moon base on a screen
  p5Wall:     { base: '#E6E9E7', shade: '#C6CBC8', label: '#1A1A1A', what: 'a space station module\'s off-white padded wall panels' },
  p5Trim:     { base: '#A3ACB3', shade: '#7F8991', label: '#1A1A1A', what: 'a space lab\'s grey-blue trim, ceiling panel and hatch frame' },
  p5Rail:     { base: '#2F6FB5', shade: '#245690', label: '#FAFAF7', what: 'a space station\'s blue handrails along its walls' },
  p5Shell:    { base: '#F3F5F6', shade: '#CDD4D9', label: '#1A1A1A', what: 'a teleporter pod\'s white composite shell, pillars and pad' },
  p5Inside:   { base: '#26324C', shade: '#19223A', label: '#FAFAF7', what: 'the dark navy of a hatch\'s opening and a machine\'s mouth' },
  p5Chamber:  { base: '#D3EAF1', shade: '#AFD3DF', label: '#1A1A1A', what: 'the pale lit inside of a teleporter pod\'s chamber' },
  p5Glow:     { base: '#86E4F0', shade: '#55C6D8', label: '#1A1A1A', what: 'a teleporter pod\'s cyan light ring and glowing floor plate' },
  p5Hazard:   { base: '#F2C12E', shade: '#C99B1C', label: '#1A1A1A', what: 'the yellow of a recycling hatch\'s hazard stripes' },
  p5Grinder:  { base: '#F07A2A', shade: '#C45A18', label: '#1A1A1A', what: 'the orange glow of the recycler working inside its hatch' },
  p5Console:  { base: '#3E454C', shade: '#2B3036', label: '#FAFAF7', what: 'a lab control console\'s graphite body' },
  p5Phosphor: { base: '#62D492', shade: '#3FA86A', label: '#1A1A1A', what: 'a console\'s green screen and its green button' },
  p5Red:      { base: '#C23A30', shade: '#992C24', label: '#FAFAF7', what: 'a console\'s red button, and a screen\'s red LIVE light' },
  p5Bezel:    { base: '#2E3236', shade: '#1F2225', label: '#FAFAF7', what: 'a wall monitor\'s black bezel, and a porthole\'s dark frame' },
  p5Space:    { base: '#101B35', shade: '#0A1226', label: '#FAFAF7', what: 'the black-navy of space, seen through a window or on a screen' },
  p5Sea:      { base: '#2E66AB', shade: '#234E86', label: '#FAFAF7', what: 'the Earth\'s blue oceans, seen from orbit' },
  p5Land:     { base: '#7C9A4C', shade: '#5E7838', label: '#1A1A1A', what: 'the Earth\'s green-brown land, seen from orbit' },
  p5Air:      { base: '#A4D3F2', shade: '#82B8DE', label: '#1A1A1A', what: 'the thin pale-blue glow of the Earth\'s atmosphere at its edge' },
  p5Dust:     { base: '#ABA69D', shade: '#87827A', label: '#1A1A1A', what: 'the grey dust of the Moon\'s surface' },
  p5Dome:     { base: '#EEF0F0', shade: '#C9CED0', label: '#1A1A1A', what: 'a Moon base\'s white habitat dome and module' },
  p5Lamp:     { base: '#FFF5D6', shade: '#EEDCA6', label: '#1A1A1A', what: 'the warm light at the far end of a station corridor' },
  // psych5 colours: a hilltop at midnight, under a moon — the sky, the hills, the lanterns, the luggage
  ps5Sky:     { base: '#1D2846', shade: '#141C33', label: '#FAFAF7', what: 'a clear night sky at midnight, deep navy, overhead' },
  ps5SkyMid:  { base: '#3C4F7C', shade: '#304168', label: '#FAFAF7', what: 'the night sky halfway down, lit by the moon' },
  ps5SkyLow:  { base: '#7A8BB2', shade: '#6A7BA2', label: '#1A1A1A', what: 'the moonlit haze low over the horizon, where a town glows' },
  ps5FarHill: { base: '#556894', shade: '#475985', label: '#FAFAF7', what: 'far hills at night, blue under the moon' },
  ps5Grass:   { base: '#6A8C69', shade: '#58785A', label: '#1A1A1A', what: 'a grassy hilltop at night, green under the moon and the lanterns' },
  ps5Strip:   { base: '#7C9C74', shade: '#6A8C69', label: '#1A1A1A', what: 'a strip of mown grass lit by lanterns at night' },
  ps5Moon:    { base: '#F2EACB', shade: '#D9CDA2', label: '#1A1A1A', what: 'the moon, a pale cream crescent' },
  ps5Star:    { base: '#FFF4D2', shade: '#E8D9A8', label: '#1A1A1A', what: 'a star, warm white' },
  ps5Flame:   { base: '#FFB23E', shade: '#E58A1F', label: '#1A1A1A', what: 'a lantern\'s paraffin flame, amber' },
  ps5Glow:    { base: '#FFD991', shade: '#F2C366', label: '#1A1A1A', what: 'lamplight — a lantern\'s glow, a far town\'s windows' },
  ps5Lantern: { base: '#2E5266', shade: '#223D4C', label: '#FAFAF7', what: 'a hurricane lantern in blue-green enamelled tin' },
  ps5Iron:    { base: '#2E3431', shade: '#1D2220', label: '#FAFAF7', what: 'a street clock\'s cast-iron post and case, painted black-green' },
  ps5Gorse:   { base: '#3A5A2C', shade: '#2B4521', label: '#FAFAF7', what: 'a gorse bush\'s dark, spiny green' },
  ps5GorseFlower: { base: '#F0C419', shade: '#C99D10', label: '#1A1A1A', what: 'gorse flowers, bright yellow' },
  ps5Manila:  { base: '#E6D19C', shade: '#C8B277', label: '#1A1A1A', what: 'a manila luggage tag' },
  ps5CaseTan: { base: '#9C5E2D', shade: '#7A4822', label: '#FAFAF7', what: 'a suitcase in tan leather' },
  ps5CaseRed: { base: '#9B3328', shade: '#77261E', label: '#FAFAF7', what: 'a suitcase in oxblood-red leather' },
  ps5CaseGreen: { base: '#355E4C', shade: '#27473A', label: '#FAFAF7', what: 'a suitcase in bottle-green canvas' },
  ps5Sponge:  { base: '#E8C266', shade: '#C9A04A', label: '#1A1A1A', what: 'a lemon sponge cake\'s golden side' },
  ps5Mist:    { base: '#C3CCE0', shade: '#A9B4CC', label: '#1A1A1A', what: 'night mist drifting over a valley, pale in the moonlight' },
  ps5Card:    { base: '#F4F1E8', shade: '#D8D2C2', label: '#1A1A1A', what: 'a hand-painted placard on white card' },
  // growth5 colours: a circus big top, its ring, three ropes, a safety net and a prop trunk
  g5TentRed:   { base: '#B5303A', shade: '#8A232C', label: '#FAFAF7', what: 'a big top\'s red canvas stripe' },
  g5TentCream: { base: '#F1E7D2', shade: '#D1C3A4', label: '#1A1A1A', what: 'a big top\'s cream canvas stripe' },
  g5Stands:    { base: '#4A3F57', shade: '#352D40', label: '#FAFAF7', what: 'empty tiered seats in the shadow behind the ring' },
  g5Curb:      { base: '#C9332B', shade: '#9C2620', label: '#FAFAF7', what: 'a circus ring\'s red padded curb' },
  g5Gold:      { base: '#E5B53C', shade: '#BC8F25', label: '#1A1A1A', what: 'gold paint: a ring curb\'s cap, a prop\'s trim' },
  g5Sawdust:   { base: '#D8BB84', shade: '#B89A60', label: '#1A1A1A', what: 'the sawdust floor of a circus ring' },
  g5Hemp:      { base: '#C7A468', shade: '#9F7F48', label: '#1A1A1A', what: 'a manila hemp rope' },
  g5Net:       { base: '#3B4656', shade: '#2A3240', label: '#FAFAF7', what: 'a safety net\'s dark cord mesh' },
  g5Trunk:     { base: '#7D2836', shade: '#5C1C27', label: '#FAFAF7', what: 'a circus prop trunk\'s deep red paint' },
  g5Lining:    { base: '#2F4E86', shade: '#233B66', label: '#FAFAF7', what: 'a prop trunk lid\'s blue lining' },
  g5Block:     { base: '#2D5BA3', shade: '#21447B', label: '#FAFAF7', what: 'a circus mounting block\'s royal-blue paint' },
  g5Bill:      { base: '#F2D06B', shade: '#D3AE47', label: '#1A1A1A', what: 'an old circus bill\'s yellow paper' },
  g5Sequin:    { base: '#C22A4E', shade: '#931D3A', label: '#FAFAF7', what: 'ruby sequin slippers and their satin ribbons' },
  g5Baton:     { base: '#F3EFE6', shade: '#D2CABA', label: '#1A1A1A', what: 'a ringmaster\'s white lacquered cane' },
  // biz5 colours:
  b5Red:      { base: '#C93A32', shade: '#9D2C26', label: '#FAFAF7', what: 'a hot-air balloon\'s red gores' },
  b5Gold:     { base: '#F2B631', shade: '#C98F1F', label: '#1A1A1A', what: 'a hot-air balloon\'s yellow gores' },
  b5Blue:     { base: '#2C64A8', shade: '#214C80', label: '#FAFAF7', what: 'a hot-air balloon\'s blue gores' },
  b5Skirt:    { base: '#343B4C', shade: '#232836', label: '#FAFAF7', what: 'a hot-air balloon\'s dark scoop, round its mouth' },
  b5Saddle:   { base: '#4A3022', shade: '#33211A', label: '#FAFAF7', what: 'a balloon basket\'s padded dark-brown leather rim and upright covers' },
  b5Suede:    { base: '#ECE6D8', shade: '#CBC2AE', label: '#1A1A1A', what: 'the white suede band round a balloon basket\'s foot' },
  b5Flame:    { base: '#F3962B', shade: '#DB711D', label: '#1A1A1A', what: 'a propane burner\'s flame, orange' },
  b5FlameCore: { base: '#FFE38F', shade: '#F7C95A', label: '#1A1A1A', what: 'the bright yellow heart of a burner flame' },
  b5Gas:      { base: '#C23B30', shade: '#962D25', label: '#FAFAF7', what: 'a propane gas cylinder\'s red paint' },
  b5Truck:    { base: '#3576A8', shade: '#285A81', label: '#FAFAF7', what: 'a sack truck\'s blue steel frame' },
  b5Hub:      { base: '#E08A3A', shade: '#B56C27', label: '#1A1A1A', what: 'a sack truck wheel\'s orange hub' },
  b5Tin:      { base: '#2F4E78', shade: '#22395A', label: '#FAFAF7', what: 'a cash tin in navy enamelled steel' },
  b5Button:   { base: '#7A5236', shade: '#5A3C27', label: '#FAFAF7', what: 'a brown coat button' },
  b5Haze:     { base: '#A9BBB4', shade: '#8FA29A', label: '#1A1A1A', what: 'far hills at dawn, blue-green in the haze' },
  b5High:     { base: '#CBD2E8', shade: '#B2BAD8', label: '#1A1A1A', what: 'the high sky at dawn, pale lilac-blue' },
  b5Sun:      { base: '#F7AA57', shade: '#E88D3B', label: '#1A1A1A', what: 'the low sun at dawn, orange' },
  b5Rose:     { base: '#E8BDBA', shade: '#D9A3A2', label: '#1A1A1A', what: 'the sky at dawn, between the lilac and the peach, rose' },
  // econ5 colours: a medieval town hall at dusk, a cellar full of rats, a bakery and a well across the street
  e5Stone:    { base: '#C9BA9B', shade: '#A69676', label: '#1A1A1A', what: 'a town hall\'s dressed limestone walls, warm in torchlight' },
  e5Floor:    { base: '#8E8676', shade: '#6F685B', label: '#1A1A1A', what: 'a town hall\'s worn grey flagstone floor' },
  e5Red:      { base: '#9E2B2F', shade: '#78201F', label: '#FAFAF7', what: 'a town\'s heraldic red — a hanging banner, a decree\'s ribbon' },
  e5Flame:    { base: '#F7B538', shade: '#E07A24', label: '#1A1A1A', what: 'a torch\'s or a candle\'s flame' },
  e5Tallow:   { base: '#EFE4C2', shade: '#D2C49C', label: '#1A1A1A', what: 'a tallow candle, creamy white' },
  e5Wax:      { base: '#9C1F24', shade: '#741619', label: '#FAFAF7', what: 'red sealing wax, pressed with a seal' },
  e5Parch:    { base: '#EDDDB3', shade: '#D3BF8E', label: '#1A1A1A', what: 'a decree\'s parchment, cream' },
  e5Hessian:  { base: '#B99A68', shade: '#94794D', label: '#1A1A1A', what: 'a hessian sack, coarse tan cloth' },
  e5Rat:      { base: '#7A6A5A', shade: '#5A4D41', label: '#FAFAF7', what: 'a brown rat\'s grey-brown fur' },
  e5RatPink:  { base: '#E2A29C', shade: '#C27F79', label: '#1A1A1A', what: 'a rat\'s bare pink tail, ears, nose and paws' },
  e5Cabbage:  { base: '#B5D08C', shade: '#8FB06A', label: '#1A1A1A', what: 'a savoy cabbage\'s pale green heart' },
  e5Dusk:     { base: '#3C4775', shade: '#2C3459', label: '#FAFAF7', what: 'the sky at dusk, high up, deep blue' },
  e5Glow:     { base: '#E8A266', shade: '#C9824B', label: '#1A1A1A', what: 'the last of the sunset, low over the rooftops' },
  e5Cobble:   { base: '#746D61', shade: '#5E584E', label: '#FAFAF7', what: 'a street\'s worn cobbles' },
  // sci5 colours: a Scottish loch at night and then at dawn, a rowing boat, a jetty, a storm lantern, bottles, a flask
  s5Sky:      { base: '#3B5079', shade: '#2C3D63', label: '#FAFAF7', what: 'a Highland night sky, high up, moonlit navy' },
  s5SkyLow:   { base: '#5A7299', shade: '#4E6890', label: '#FAFAF7', what: 'a moonlit night sky low over the hills, misty blue' },
  s5Haze:     { base: '#7089AD', shade: '#627CA2', label: '#1A1A1A', what: 'the mist-lit sky just above a loch\'s far shore at night' },
  s5Hill:     { base: '#56698A', shade: '#4A5C7C', label: '#FAFAF7', what: 'Highland hills across a loch at night, blue in the mist' },
  s5HillNear: { base: '#4C5E7E', shade: '#405170', label: '#FAFAF7', what: 'the nearer hills on a loch\'s far shore at night' },
  s5Far:      { base: '#5C7596', shade: '#506888', label: '#FAFAF7', what: 'a loch\'s far water at night, holding the sky\'s light' },
  s5Deep:     { base: '#34506F', shade: '#28405A', label: '#FAFAF7', what: 'a loch\'s near water at night, dark peaty blue' },
  s5Moon:     { base: '#EEF0E2', shade: '#D6D9C8', label: '#1A1A1A', what: 'the moon, pale, and its light on water' },
  s5DawnHigh: { base: '#A9BCD6', shade: '#8FA5C4', label: '#1A1A1A', what: 'the sky high up at dawn, pale blue' },
  s5DawnHill: { base: '#8E8AA6', shade: '#77738F', label: '#1A1A1A', what: 'Highland hills at dawn, lilac-grey' },
  s5DawnLoch: { base: '#B7B2C8', shade: '#9C97B0', label: '#1A1A1A', what: 'a loch\'s far water at dawn, holding a pink-lilac sky' },
  s5DawnDeep: { base: '#6B84A6', shade: '#5A7294', label: '#1A1A1A', what: 'a loch\'s near water at dawn, steel blue' },
  s5Castle:   { base: '#3E4C66', shade: '#323E55', label: '#FAFAF7', what: 'a ruined castle tower on a far headland, in shadow' },
  s5BoatWhite: { base: '#EDEAE0', shade: '#C9C4B5', label: '#1A1A1A', what: 'a rowing boat\'s white-painted clinker hull' },
  s5BoatStripe: { base: '#2E4E6E', shade: '#223B54', label: '#FAFAF7', what: 'a rowing boat\'s navy-painted sheer strake' },
  s5Antifoul: { base: '#A8402F', shade: '#80301F', label: '#FAFAF7', what: 'a boat\'s red antifouling paint below the waterline' },
  s5Lantern:  { base: '#B8352B', shade: '#8C2820', label: '#FAFAF7', what: 'a hurricane lantern\'s red-painted tin' },
  s5Flame:    { base: '#F7B23A', shade: '#E08E1E', label: '#1A1A1A', what: 'a paraffin flame, and the lamplight it throws' },
  s5CamBlack: { base: '#2B2D30', shade: '#1C1D1F', label: '#FAFAF7', what: 'a camera body\'s black grip and a lens\'s black rings' },
  s5Lens:     { base: '#ECEBE6', shade: '#C9C8C0', label: '#1A1A1A', what: 'a long telephoto lens\'s off-white barrel' },
  s5Tartan:   { base: '#B22F2A', shade: '#86221E', label: '#FAFAF7', what: 'a vacuum flask\'s red tartan cover' },
  s5TartanBar: { base: '#3D6B4C', shade: '#2F5A3E', label: '#FAFAF7', what: 'the dark green bars of a red tartan' },
  s5SeaGlass: { base: '#8FBF99', shade: '#6E9C79', label: '#1A1A1A', what: 'a bottle\'s pale green glass' },
  s5Amber:    { base: '#C08A52', shade: '#9A6A3B', label: '#1A1A1A', what: 'a bottle\'s amber-brown glass' },
  s5BlueGlass: { base: '#93B9D3', shade: '#7298B2', label: '#1A1A1A', what: 'a bottle\'s pale blue glass' },
  s5Screen:   { base: '#123527', shade: '#0B2219', label: '#FAFAF7', what: 'a fish-finder sonar\'s dark green screen' },
  s5Trace:    { base: '#6EE59A', shade: '#4CC07A', label: '#1A1A1A', what: 'a sonar screen\'s bright green trace and sweep' },
  s5Rope:     { base: '#BFA273', shade: '#9C8257', label: '#1A1A1A', what: 'a hemp mooring rope' },
  s5Photo:    { base: '#6C727E', shade: '#555B66', label: '#FAFAF7', what: 'a dark, blurry night photograph of water' },
  // phil6 colours:
  ph6Night:   { base: '#232B55', shade: '#181E40', label: '#FAFAF7', what: 'a night sky over a fairground, deep navy overhead' },
  ph6Dusk:    { base: '#4C4180', shade: '#3D336A', label: '#FAFAF7', what: 'the night sky lower down, indigo, warmed by the fair' },
  ph6Haze:    { base: '#C9AFCB', shade: '#B397B7', label: '#1A1A1A', what: 'the pink-lilac glow a fairground\'s lights throw on the night air' },
  ph6Turf:    { base: '#97A27C', shade: '#808C66', label: '#1A1A1A', what: 'trodden fairground grass, lit by the stalls\' lamps' },
  ph6Lacquer: { base: '#9C2D2B', shade: '#74201F', label: '#FAFAF7', what: 'a fortune machine\'s red lacquered cabinet' },
  ph6Walnut:  { base: '#5E3B25', shade: '#45291A', label: '#FAFAF7', what: 'a cabinet\'s dark walnut plinth' },
  ph6Velvet:  { base: '#33418A', shade: '#26326C', label: '#FAFAF7', what: 'the royal-blue velvet lining a fortune machine\'s glass case' },
  ph6Satin:   { base: '#E8C150', shade: '#C69C33', label: '#1A1A1A', what: 'an automaton\'s gold satin turban and shirt' },
  ph6Robe:    { base: '#6E3797', shade: '#542878', label: '#FAFAF7', what: 'an automaton\'s purple velvet waistcoat' },
  ph6Skin:    { base: '#C48D5E', shade: '#A06E44', label: '#1A1A1A', what: 'an automaton\'s painted wooden face and hands' },
  ph6Beard:   { base: '#2C2521', shade: '#1D1815', label: '#FAFAF7', what: 'an automaton\'s black moustache and pointed beard' },
  ph6Ball:    { base: '#DCD5F6', shade: '#B6ABE6', label: '#1A1A1A', what: 'a crystal ball, lit lilac from inside' },
  ph6CardRed: { base: '#B5352F', shade: '#8E2723', label: '#FAFAF7', what: 'a printed fortune card\'s red border and red back' },
  ph6Fudge:   { base: '#BC8656', shade: '#97683D', label: '#1A1A1A', what: 'squares of vanilla fudge' },
  ph6Mint:    { base: '#F4F7F2', shade: '#D5DED4', label: '#1A1A1A', what: 'a white mint humbug' },
  ph6MintStripe: { base: '#3E9C65', shade: '#2E7C4E', label: '#1A1A1A', what: 'a mint humbug\'s green stripes' },
  ph6Toffee:  { base: '#E2A33A', shade: '#BB8024', label: '#1A1A1A', what: 'toffees twisted in gold wrappers' },
  ph6Ivory:   { base: '#F3EEE0', shade: '#D4CDB9', label: '#1A1A1A', what: 'a pair of ivory dice' },
  ph6Glow:    { base: '#F8E3A8', shade: '#ECCC80', label: '#1A1A1A', what: 'the warm lit inside of a carousel at night' },
  ph6Canopy:  { base: '#CF3F38', shade: '#B5342E', label: '#FAFAF7', what: 'a carousel canopy\'s and a stall awning\'s red stripes' },
  ph6Cream:   { base: '#F4E8CB', shade: '#DFCDA5', label: '#1A1A1A', what: 'a carousel\'s and an awning\'s cream stripes and rounding boards' },
  ph6Horse:   { base: '#F5F0E7', shade: '#D9D0C1', label: '#1A1A1A', what: 'a painted white carousel galloper' },
  ph6Saddle:  { base: '#3263AD', shade: '#264E8A', label: '#FAFAF7', what: 'a carousel horse\'s blue painted saddle' },
  ph6Bulb:    { base: '#FFF2BE', shade: '#FFDF80', label: '#1A1A1A', what: 'a lit festoon bulb, warm white' },
  ph6FlagRed: { base: '#C93A31', shade: '#B0322A', label: '#FAFAF7', what: 'a red bunting flag' },
  ph6FlagYellow: { base: '#F7CD48', shade: '#E2B42E', label: '#1A1A1A', what: 'a yellow bunting flag' },
  ph6FlagBlue: { base: '#386BBA', shade: '#2E5C9F', label: '#FAFAF7', what: 'a blue bunting flag' },
  ph6FlagGreen: { base: '#4FAA68', shade: '#3C8F54', label: '#1A1A1A', what: 'a green bunting flag' },
  ph6Heart:   { base: '#C9303A', shade: '#B22B33', label: '#FAFAF7', what: 'a red heart printed on a card' },
  ph6Puff:    { base: '#E6EEF4', shade: '#BBCBDA', label: '#1A1A1A', what: 'the white puff of a sneeze' },
  // psych6 colours: a neon arcade on a seaside pier at night, claw machines, plush bears, phones
  py6Sky:     { base: '#161D3D', shade: '#10162F', label: '#FAFAF7', what: 'the night sky over the sea, high up, deep navy' },
  py6SkyLow:  { base: '#26315E', shade: '#1E2850', label: '#FAFAF7', what: 'the night sky low over the sea, lit by the town' },
  py6Haze:    { base: '#3D3F72', shade: '#333566', label: '#FAFAF7', what: 'the purple glow on the horizon over a lit pier' },
  py6Sea:     { base: '#1C3156', shade: '#152645', label: '#FAFAF7', what: 'the sea at night, near, dark blue' },
  py6SeaFar:  { base: '#2A4572', shade: '#223B63', label: '#FAFAF7', what: 'the sea at night, far out, holding the sky' },
  py6Moon:    { base: '#F3EFD8', shade: '#DAD4B6', label: '#1A1A1A', what: 'the full moon, and its path on the water' },
  py6Deck:    { base: '#7C5839', shade: '#5E422A', label: '#FAFAF7', what: 'a pier\'s wooden deck boards under arcade light' },
  py6Rail:    { base: '#E6E2D6', shade: '#BCB6A6', label: '#1A1A1A', what: 'a pier\'s railings, painted white' },
  py6Fascia:  { base: '#2E2046', shade: '#221735', label: '#FAFAF7', what: 'an arcade\'s painted fascia board, deep purple' },
  py6Neon:    { base: '#FF5AA8', shade: '#E03C8A', label: '#1A1A1A', what: 'a pink neon tube, lit' },
  py6NeonCyan: { base: '#4BE4F0', shade: '#25C2D0', label: '#1A1A1A', what: 'a cyan neon tube, lit' },
  py6NeonGold: { base: '#FFE260', shade: '#F2C83A', label: '#1A1A1A', what: 'a yellow neon tube, and a warm bulb' },
  py6Topper:  { base: '#1B1E3B', shade: '#14162E', label: '#FFE260', what: 'a claw machine\'s topper sign, its dark face' },
  py6CabPink: { base: '#C8337E', shade: '#9E2462', label: '#FAFAF7', what: 'a claw machine\'s cabinet, magenta' },
  py6CabRed:  { base: '#CF3A2E', shade: '#A22B21', label: '#FAFAF7', what: 'a claw machine\'s cabinet, red' },
  py6CabTeal: { base: '#22948F', shade: '#19726E', label: '#1A1A1A', what: 'a claw machine\'s cabinet, teal' },
  py6InPink:  { base: '#FBDDEA', shade: '#F5C2D8', label: '#1A1A1A', what: 'a claw machine\'s lit inside, pink' },
  py6InGold:  { base: '#FCEBB8', shade: '#F7DC94', label: '#1A1A1A', what: 'a claw machine\'s lit inside, warm yellow' },
  py6InMint:  { base: '#D3F1EC', shade: '#B6E6DE', label: '#1A1A1A', what: 'a claw machine\'s lit inside, mint' },
  py6Panel:   { base: '#363A44', shade: '#262930', label: '#FAFAF7', what: 'a claw machine\'s black control panel, its coin door' },
  py6Flap:    { base: '#5B6A80', shade: '#3F4B5D', label: '#FAFAF7', what: 'a prize chute\'s smoked perspex flap' },
  py6Bear:    { base: '#8256BA', shade: '#653F96', label: '#FAFAF7', what: 'a purple plush teddy bear' },
  py6BearGreen: { base: '#62B25A', shade: '#4A8E43', label: '#1A1A1A', what: 'a green plush teddy bear' },
  py6Muzzle:  { base: '#EFE3CF', shade: '#D8C8AE', label: '#1A1A1A', what: 'a plush bear\'s pale muzzle and paw pads' },
  py6PlushPink: { base: '#F38DB9', shade: '#D96E9D', label: '#1A1A1A', what: 'a pink plush toy in a heap of prizes' },
  py6PlushBlue: { base: '#72A9DE', shade: '#5589BD', label: '#1A1A1A', what: 'a blue plush toy in a heap of prizes' },
  py6PlushYellow: { base: '#F4D452', shade: '#D6B33A', label: '#1A1A1A', what: 'a yellow plush toy in a heap of prizes' },
  py6Acrylic: { base: '#D7E4EC', shade: '#B4C6D2', label: '#1A1A1A', what: 'a clear acrylic display stand, catching the light' },
  py6Kiosk:   { base: '#2F6DA6', shade: '#235482', label: '#FAFAF7', what: 'a phone kiosk\'s blue-painted stand' },
  py6ScreenOff: { base: '#2A3140', shade: '#1D232F', label: '#FAFAF7', what: 'a phone\'s screen, asleep' },
  py6Screen:  { base: '#F3F6FA', shade: '#DCE4EE', label: '#1A1A1A', what: 'a phone\'s lit screen, an app open on it' },
  py6Duster:  { base: '#F1C232', shade: '#CF9F1E', label: '#1A1A1A', what: 'a yellow polishing duster' },
  // growth6 colours: a lighthouse lamp room, its lens, a Morse desk, a calm evening and a storm at sea
  gr6Glass:    { base: '#B4D3CA', shade: '#8AAFA4', label: '#1A1A1A', what: 'a lighthouse lens\'s pale green glass prisms' },
  gr6GlassHi:  { base: '#E6F2EE', shade: '#D2E7E0', label: '#1A1A1A', what: 'the bright ring of a lens\'s bullseye catching the lamp' },
  gr6Iron:     { base: '#63917A', shade: '#4A735E', label: '#1A1A1A', what: 'a lens pedestal\'s green-painted cast iron' },
  gr6Frame:    { base: '#2A3A35', shade: '#1D2925', label: '#FAFAF7', what: 'a lantern\'s dark-painted glazing bars' },
  gr6Ceiling:  { base: '#6A2E28', shade: '#4E211D', label: '#FAFAF7', what: 'the red-painted iron underside of a lantern roof' },
  gr6Wall:     { base: '#E9E3D4', shade: '#CDC5B1', label: '#1A1A1A', what: 'a lamp room\'s cream-painted iron wall panels' },
  gr6Dado:     { base: '#355E4D', shade: '#27473A', label: '#FAFAF7', what: 'a lamp room\'s green-painted lower panels' },
  gr6Mahogany: { base: '#7C4027', shade: '#5B2E1C', label: '#FAFAF7', what: 'polished mahogany: a barometer case, a key\'s base' },
  gr6Ebonite:  { base: '#2A2B2E', shade: '#1B1C1E', label: '#FAFAF7', what: 'a Morse key\'s black ebonite knob' },
  gr6Dial:     { base: '#EFE6CB', shade: '#D2C6A3', label: '#1A1A1A', what: 'a barometer\'s silvered dial, an old paper page' },
  gr6ShipWhite: { base: '#ECE9DF', shade: '#C9C4B4', label: '#1A1A1A', what: 'a fishing boat\'s white-painted hull and wheelhouse' },
  gr6ShipRed:  { base: '#A3372B', shade: '#7C2920', label: '#FAFAF7', what: 'a fishing boat\'s red antifouling below the waterline' },
  gr6ShipWin:  { base: '#33404B', shade: '#242E36', label: '#FAFAF7', what: 'a wheelhouse\'s dark windows' },
  gr6SkyTop:   { base: '#2E4A7C', shade: '#243B63', label: '#FAFAF7', what: 'an evening sky high up, deep blue' },
  gr6SkyMid:   { base: '#84648D', shade: '#6C5476', label: '#FAFAF7', what: 'an evening sky\'s dusky violet band' },
  gr6SkyLow:   { base: '#F2A86C', shade: '#E08F52', label: '#1A1A1A', what: 'an evening sky low over the sea, peach' },
  gr6Sun:      { base: '#FFD27C', shade: '#F5B455', label: '#1A1A1A', what: 'a setting sun, and its glitter on the water' },
  gr6Sea:      { base: '#357298', shade: '#2A5B7A', label: '#FAFAF7', what: 'a calm evening sea' },
  gr6StormSky: { base: '#3B4759', shade: '#2F3A4A', label: '#FAFAF7', what: 'a storm sky at night' },
  gr6StormLow: { base: '#58687C', shade: '#4A596C', label: '#FAFAF7', what: 'a storm sky low over the horizon' },
  gr6StormSea: { base: '#4A5F72', shade: '#3D5063', label: '#FAFAF7', what: 'a dark sea in a storm' },
  gr6Foam:     { base: '#DCE7EC', shade: '#B8C9D1', label: '#1A1A1A', what: 'white foam on a breaking wave, rain' },
  gr6Signal:   { base: '#FFE9A6', shade: '#F7CF63', label: '#1A1A1A', what: 'a ship\'s signal lamp, lit' },
  gr6Green:    { base: '#7FE3A2', shade: '#55C47F', label: '#1A1A1A', what: 'a ship\'s green running light' },
  // biz6 colours: a haunted castle attraction on opening night — moonlit stone, a torchlit gateway, a purple ticket booth
  bz6Sky:       { base: '#25294A', shade: '#1C2039', label: '#FAFAF7', what: 'a night sky high up, deep blue-violet' },
  bz6SkyLow:    { base: '#3D3F68', shade: '#33355A', label: '#FAFAF7', what: 'a night sky low down, lit by the moon' },
  bz6Moon:      { base: '#F4EBC6', shade: '#E2D6A8', label: '#1A1A1A', what: 'a full moon, pale cream' },
  bz6Keep:      { base: '#2E3150', shade: '#252842', label: '#FAFAF7', what: 'a castle keep against the night sky, in shadow' },
  bz6KeepLit:   { base: '#F2B451', shade: '#D9953A', label: '#1A1A1A', what: 'a castle window lit from inside by torchlight' },
  bz6Stone:     { base: '#9C98AC', shade: '#7E7A90', label: '#1A1A1A', what: 'a gatehouse\'s dressed stone in moonlight, lilac-grey' },
  bz6StoneFar:  { base: '#5E5B78', shade: '#4C4A65', label: '#FAFAF7', what: 'castle stone set back in the shadow' },
  bz6Passage:   { base: '#C9783E', shade: '#A55F2F', label: '#1A1A1A', what: 'a gateway passage lit orange by torches inside' },
  bz6Iron:      { base: '#2F3138', shade: '#202227', label: '#FAFAF7', what: 'black wrought iron — a gate, a turnstile, a bracket' },
  bz6Booth:     { base: '#5B3474', shade: '#46275A', label: '#FAFAF7', what: 'a ticket booth painted spooky purple' },
  bz6Lime:      { base: '#9BD14A', shade: '#78AD32', label: '#1A1A1A', what: 'a ticket booth\'s lime-green trim and sign' },
  bz6Roof:      { base: '#3B3550', shade: '#2C273E', label: '#FAFAF7', what: 'a booth\'s dark slate-shingled roof' },
  bz6BoothIn:   { base: '#EDC98A', shade: '#D6AE6C', label: '#1A1A1A', what: 'the inside of a ticket booth, warm under its lamp' },
  bz6PopRed:    { base: '#D33A30', shade: '#BF3229', label: '#FAFAF7', what: 'a popcorn tub\'s red stripes' },
  bz6PopWhite:  { base: '#F6F1E6', shade: '#DCD3C2', label: '#1A1A1A', what: 'a popcorn tub\'s white card' },
  bz6Kernel:    { base: '#F7E3A2', shade: '#E6C877', label: '#1A1A1A', what: 'buttered popcorn, puffed and pale gold' },
  bz6Glow:      { base: '#8EF06A', shade: '#62CF46', label: '#1A1A1A', what: 'a snapped glow stick, bright green' },
  bz6CounterRed: { base: '#7D2229', shade: '#5E191F', label: '#FAFAF7', what: 'a mechanical counter\'s oxblood-painted iron case' },
  bz6Pumpkin:   { base: '#E8812C', shade: '#C2661E', label: '#1A1A1A', what: 'a carved pumpkin\'s orange skin' },
  bz6Carve:     { base: '#FFD36B', shade: '#FFC94F', label: '#1A1A1A', what: 'candlelight through a jack-o\'-lantern\'s carved face' },
  bz6Bat:       { base: '#26222E', shade: '#17151C', label: '#FAFAF7', what: 'a bat\'s dark wings against the moon' },
  bz6Fog:       { base: '#B9BCD6', shade: '#A2A6C4', label: '#1A1A1A', what: 'ground fog drifting in the moonlight' },
  bz6Web:       { base: '#E3E5EE', shade: '#C8CBD8', label: '#1A1A1A', what: 'a cobweb\'s silvery threads' },
  bz6LampGlass: { base: '#FBCB62', shade: '#F0B043', label: '#1A1A1A', what: 'a wall lantern\'s glass, glowing with its flame' },
  bz6Chalk:     { base: '#F2A7B8', shade: '#DE8C9F', label: '#1A1A1A', what: 'pink chalk on a blackboard' },
  // econ6 colours: a pirate island at golden hour — sky, sea, sand, a palm, a wreck, a chest of gold, a coconut stall
  ec6SkyHigh: { base: '#9AB4D2', shade: '#8199B8', label: '#1A1A1A', what: 'the high sky at golden hour, a soft warm blue' },
  ec6SkyMid:  { base: '#F3C894', shade: '#E4B07B', label: '#1A1A1A', what: 'the sky at golden hour, peach, halfway down' },
  ec6SkyLow:  { base: '#F8DC8E', shade: '#EFC66C', label: '#1A1A1A', what: 'the sky at golden hour, gold just over the sea' },
  ec6Sun:     { base: '#FFF2C4', shade: '#F9CC5E', label: '#1A1A1A', what: 'a low sun at golden hour, pale gold' },
  ec6Sea:     { base: '#387496', shade: '#2B5E7C', label: '#FAFAF7', what: 'a tropical sea in the evening, deep blue' },
  ec6SeaFar:  { base: '#86A9B2', shade: '#6F939D', label: '#1A1A1A', what: 'the sea near the horizon, silvered by a low sun' },
  ec6Glint:   { base: '#FFE6A0', shade: '#F5CF6E', label: '#1A1A1A', what: 'the sun\'s glitter on the water' },
  ec6Foam:    { base: '#F6F3E8', shade: '#DCD8C8', label: '#1A1A1A', what: 'the white foam of a wave on the sand' },
  ec6WetSand: { base: '#CDB283', shade: '#B0966A', label: '#1A1A1A', what: 'wet sand where the waves run up' },
  ec6Trunk:   { base: '#80664A', shade: '#624E38', label: '#FAFAF7', what: 'a coconut palm\'s ringed grey-brown trunk' },
  ec6Frond:   { base: '#4C7A32', shade: '#375C23', label: '#FAFAF7', what: 'a coconut palm\'s fronds, deep green against the sky' },
  ec6Coco:    { base: '#7DA845', shade: '#5B8130', label: '#1A1A1A', what: 'a young drinking coconut\'s green husk' },
  ec6CocoTop: { base: '#F1E9CF', shade: '#D8CCA4', label: '#1A1A1A', what: 'a drinking coconut\'s trimmed top, the white husk' },
  ec6CocoRipe: { base: '#8F6236', shade: '#6C4A28', label: '#FAFAF7', what: 'ripe coconuts hanging in the palm\'s crown, brown' },
  ec6Rock:    { base: '#5F5A54', shade: '#45413C', label: '#FAFAF7', what: 'dark wet rock on the shore' },
  ec6Hull:    { base: '#6E4C31', shade: '#513723', label: '#FAFAF7', what: 'a wrecked ship\'s old dark timbers' },
  ec6Sail:    { base: '#E6D9BA', shade: '#C9B892', label: '#1A1A1A', what: 'a torn old canvas sail' },
  ec6Gold:    { base: '#E6B83E', shade: '#B88A22', label: '#1A1A1A', what: 'gold — doubloons, a heap of treasure' },
  ec6Ruby:    { base: '#B3243A', shade: '#86182A', label: '#FAFAF7', what: 'a ruby among the treasure' },
  ec6Chest:   { base: '#8A4E2B', shade: '#673A20', label: '#FAFAF7', what: 'a treasure chest\'s reddish-brown planks' },
  ec6Iron:    { base: '#4C4F52', shade: '#34373A', label: '#FAFAF7', what: 'a chest\'s black iron straps and hinges' },
  ec6Stall:   { base: '#357398', shade: '#295B79', label: '#FAFAF7', what: 'a coconut stall\'s front, painted sea blue' },
  ec6Crate:   { base: '#C7A06A', shade: '#A27D4B', label: '#1A1A1A', what: 'a pine cargo crate, weathered' },
  ec6Fish:    { base: '#D8695E', shade: '#B24E45', label: '#1A1A1A', what: 'a red snapper\'s pink-red scales' },
  ec6ShipHull: { base: '#5A3F2C', shade: '#422E20', label: '#FAFAF7', what: 'a far ship\'s dark hull, against the sunset' },
  ec6Smoke:   { base: '#D8D6D0', shade: '#B9B6AE', label: '#1A1A1A', what: 'a puff of cannon smoke' },
  // sci6 colours: below decks on a ship of 1747 — whitewashed planking, dark timbers, canvas hammocks, a tin lantern, bottles, a sea chest
  sc6Lime:      { base: '#E9E3D0', shade: '#CDC4AA', label: '#1A1A1A', what: 'a ship\'s whitewashed inside planking, below decks' },
  sc6Timber:    { base: '#5E4532', shade: '#47331F', label: '#FAFAF7', what: 'a ship\'s dark oak beams, frames and knees' },
  sc6Deck:      { base: '#B08A5C', shade: '#8F6F47', label: '#1A1A1A', what: 'a ship\'s scrubbed oak deck planks' },
  sc6Canvas:    { base: '#E2D5B3', shade: '#C3B48D', label: '#1A1A1A', what: 'a sailor\'s hammock canvas, unbleached' },
  sc6Blanket:   { base: '#5E6B7A', shade: '#4A5562', label: '#FAFAF7', what: 'a sailor\'s grey-blue wool blanket' },
  sc6Tin:       { base: '#47423C', shade: '#302C28', label: '#FAFAF7', what: 'a ship\'s lantern\'s dark pierced tin' },
  sc6Glow:      { base: '#FFD27A', shade: '#F2B24A', label: '#1A1A1A', what: 'candlelight through a lantern\'s horn panes, amber' },
  sc6Pine:      { base: '#B5804F', shade: '#8F6338', label: '#1A1A1A', what: 'a mast\'s varnished pine' },
  sc6ChestBlue: { base: '#3F6672', shade: '#2F4F59', label: '#FAFAF7', what: 'a surgeon\'s sea chest, painted blue-green' },
  sc6Bottle:    { base: '#3F6B45', shade: '#2E5234', label: '#FAFAF7', what: 'a dark green glass bottle of the 1740s' },
  sc6Brine:     { base: '#7DB5AF', shade: '#5E9690', label: '#1A1A1A', what: 'seawater seen through glass' },
  sc6Stone:     { base: '#A98759', shade: '#86693F', label: '#1A1A1A', what: 'a brown salt-glazed stoneware bottle' },
  sc6Glaze:     { base: '#E3D3AE', shade: '#C6B486', label: '#1A1A1A', what: 'a stoneware bottle\'s cream-glazed shoulder' },
  sc6Wicker:    { base: '#C29A5B', shade: '#9E7A41', label: '#1A1A1A', what: 'a wicker basket' },
  sc6Leather:   { base: '#7A3B26', shade: '#5C2B1B', label: '#FAFAF7', what: 'a ledger\'s brown calf binding' },
  sc6PhialBlue: { base: '#3E6EA8', shade: '#2F5684', label: '#FAFAF7', what: 'a cobalt-blue glass medicine bottle' },
  sc6PhialClear: { base: '#BFD6CA', shade: '#9DB8AB', label: '#1A1A1A', what: 'a plain pale-green glass medicine bottle' },
  sc6PhialBrown: { base: '#7A4521', shade: '#5B3218', label: '#FAFAF7', what: 'a dark amber glass medicine bottle' },
  sc6SeaDusk:   { base: '#4B7486', shade: '#3B5E6E', label: '#FAFAF7', what: 'the open sea at dusk, seen through a gun port' },
  sc6SkyDusk:   { base: '#B4C1C9', shade: '#97A6B0', label: '#1A1A1A', what: 'a grey evening sky at sea' },
  sc6SeaDay:    { base: '#2F7399', shade: '#245C7C', label: '#FAFAF7', what: 'the open sea on a bright morning' },
  sc6SkyDay:    { base: '#CDE6F2', shade: '#AFD2E4', label: '#1A1A1A', what: 'a clear morning sky at sea' },
  sc6Sun:       { base: '#FFE9A8', shade: '#F5D47E', label: '#1A1A1A', what: 'morning sunlight falling through a port' },
  // hist6 colours:
  hi6Wall:      { base: '#D3A16F', shade: '#B4824F', label: '#1A1A1A', what: 'Abu Simbel\'s sandstone wall, warm in torchlight' },
  hi6Recess:    { base: '#E3B988', shade: '#D3A16F', label: '#1A1A1A', what: 'the sunk ground of a carving, the wall seen through a wheel' },
  hi6Carve:     { base: '#E9C596', shade: '#C99C69', label: '#1A1A1A', what: 'a carved figure in the sandstone, catching the light' },
  hi6Panel:     { base: '#DEB27F', shade: '#BE8F5E', label: '#1A1A1A', what: 'a smoothed panel of sandstone carved with signs' },
  hi6Inset:     { base: '#EBC79B', shade: '#DEB27F', label: '#1A1A1A', what: 'the panel seen through the loop of a carved sign' },
  hi6Glyph:     { base: '#C08E5C', shade: '#6F4728', label: '#1A1A1A', what: 'a hieroglyph cut into sandstone, its shadow dark' },
  hi6Skin:      { base: '#B4572F', shade: '#8C4022', label: '#FAFAF7', what: 'the red ochre paint of a pharaoh\'s skin' },
  hi6Blue:      { base: '#3667A7', shade: '#274E86', label: '#FAFAF7', what: 'Egyptian blue paint — a khepresh crown, a cartouche' },
  hi6Gold:      { base: '#D9A93C', shade: '#B0852A', label: '#1A1A1A', what: 'gilding on a chariot, a collar, a flail' },
  hi6Linen:     { base: '#F0E6CF', shade: '#CFC2A3', label: '#1A1A1A', what: 'white linen, a white crown painted on stone' },
  hi6Plume:     { base: '#B53B2E', shade: '#8C2C22', label: '#FAFAF7', what: 'red paint — a horse\'s plume, a sun disc' },
  hi6Green:     { base: '#3F7F62', shade: '#2E604A', label: '#FAFAF7', what: 'the green blocks of a painted temple frieze' },
  hi6Ceiling:   { base: '#22304F', shade: '#172138', label: '#FAFAF7', what: 'a temple ceiling painted night blue' },
  hi6Star:      { base: '#E9C55C', shade: '#C9A33F', label: '#1A1A1A', what: 'the yellow stars painted on a temple ceiling' },
  hi6Floor:     { base: '#B7895B', shade: '#946B44', label: '#1A1A1A', what: 'a sandstone floor in a torch-lit hall' },
  hi6Clay:      { base: '#C67C45', shade: '#9E5F33', label: '#1A1A1A', what: 'a Hittite clay tablet, orange-buff' },
  hi6Treaty:    { base: '#CDA290', shade: '#A97F6D', label: '#1A1A1A', what: 'the Kadesh treaty tablet\'s pink-buff clay' },
  hi6Wrap:      { base: '#6A4A30', shade: '#4C3522', label: '#FAFAF7', what: 'a torch head\'s pitch-soaked cloth' },
  hi6Flame:     { base: '#FAC54A', shade: '#EB862B', label: '#1A1A1A', what: 'a torch flame, and the light it throws' },
  hi6Bristle:   { base: '#3E3229', shade: '#2B221C', label: '#FAFAF7', what: 'an archaeologist\'s soft brush, its dark bristles' },
  hi6Sand:      { base: '#E2C79A', shade: '#C6A979', label: '#1A1A1A', what: 'sieved sand in a finds tray' },
  hi6Sky:       { base: '#A9D3EE', shade: '#72AAD6', label: '#1A1A1A', what: 'a postcard\'s printed blue sky' },
  // phil7 colours:
  ph7Water: { base: '#6FB1CF', shade: '#4F92B4', label: '#1A1A1A', what: 'fountain water and the harbour sea' },
  ph7Foam: { base: '#E8F6FB', shade: '#BFE2EF', label: '#1A1A1A', what: 'white water where a spout splashes, glints on the sea' },
  ph7Wax: { base: '#4A3A2C', shade: '#382B20', label: '#FAFAF7', what: 'the dark wax in a writing tablet' },
  ph7Frame: { base: '#BC8A52', shade: '#94683A', label: '#1A1A1A', what: 'a wax tablet’s boxwood frame' },
  ph7Scratch: { base: '#EAD9B0', shade: '#CDB98C', label: '#1A1A1A', what: 'a line scratched into wax, showing the pale wood' },
  ph7Bronze: { base: '#C08A3E', shade: '#94672A', label: '#1A1A1A', what: 'a herald’s bronze horn, bronze weights and a balance' },
  ph7Clay: { base: '#CB7E4C', shade: '#A3603A', label: '#1A1A1A', what: 'broken terracotta voting shards' },
  ph7Leather: { base: '#8C5C34', shade: '#6A4326', label: '#FAFAF7', what: 'a leather purse' },
  ph7Fig: { base: '#7A4462', shade: '#5A3048', label: '#FAFAF7', what: 'a ripe purple fig' },
  ph7Gull: { base: '#F6F4EF', shade: '#D3CFC6', label: '#1A1A1A', what: 'a herring gull’s white body' },
  ph7GullTip: { base: '#4B4B4B', shade: '#333333', label: '#FAFAF7', what: 'a gull’s dark wing tips' },
  ph7Heart: { base: '#B93B33', shade: '#962C25', label: '#FAFAF7', what: 'a red heart' },
  ph7Shadow: { base: '#5C5243', shade: '#463E33', label: '#FAFAF7', what: 'the gnomon’s shadow on a marble sundial' },
  ph7Stylus: { base: '#C9A86A', shade: '#9E8148', label: '#1A1A1A', what: 'a bone stylus' },
  ph7Chain: { base: '#7E6440', shade: '#5E4A2E', label: '#FAFAF7', what: 'a balance’s bronze chains' },
  hi7Rope: { base: '#A88A5E', shade: '#866B44', label: '#1A1A1A', what: 'a well rope, garden string' },
  hi7Water: { base: '#7DB9D6', shade: '#5A9ABB', label: '#1A1A1A', what: 'water splashing from a well bucket' },
  hi7Dust: { base: '#D9C9A2', shade: '#BFAD82', label: '#1A1A1A', what: 'dry dust on carved stone, a puff of it' },
  hi7Ink: { base: '#C0392B', shade: '#962A1F', label: '#FAFAF7', what: 'red stamp ink, a red map pin, red thread' },
  hi7Smudge: { base: '#8E8A84', shade: '#6E6A64', label: '#1A1A1A', what: 'a grey smudge of spoilt ink' },
  hi7Pencil: { base: '#2F2A26', shade: '#1E1A17', label: '#FAFAF7', what: 'a black-lacquered pencil, a clock hand' },
  hi7Mote: { base: '#FFF4D6', shade: '#E9DAB2', label: '#1A1A1A', what: 'a dust mote in a beam of sunlight' },
  hi7Swallow: { base: '#2E3540', shade: '#1E242C', label: '#FAFAF7', what: 'a swallow’s dark back' },
  hi7Back: { base: '#F4EEE2', shade: '#DCD3C2', label: '#1A1A1A', what: 'the cream back cover of a booklet' },
  hi7Pin: { base: '#9CA3A8', shade: '#7A8186', label: '#1A1A1A', what: 'a steel drawing pin' },
  ps7Gold: { base: '#D9AE3E', shade: '#B48A22', label: '#1A1A1A', what: 'a gold paper label on a coffee cup' },
  ps7Card: { base: '#FBF8EF', shade: '#E2DCCB', label: '#1A1A1A', what: 'a white tally card, a ticket, a card on a machine' },
  ps7Pencil: { base: '#E0B23C', shade: '#B68A22', label: '#1A1A1A', what: 'a yellow pencil' },
  ps7Brass: { base: '#CDA54C', shade: '#A27F2E', label: '#1A1A1A', what: 'a brass telegraph key, a brass coin' },
  ps7Steel: { base: '#8E989E', shade: '#6C757A', label: '#1A1A1A', what: 'a steel metronome rod and its weight' },
  ps7Choc: { base: '#5A2E1E', shade: '#42200F', label: '#FAFAF7', what: 'a bar of chocolate in its brown wrapper' },
  ps7Foil: { base: '#C9CCCE', shade: '#9EA2A6', label: '#1A1A1A', what: 'the silver foil at a chocolate bar’s end' },
  ps7Steam: { base: '#F4F2EC', shade: '#DCD8CE', label: '#1A1A1A', what: 'a puff of white steam' },
  ps7Amber: { base: '#E8C060', shade: '#C79A34', label: '#1A1A1A', what: 'the amber letters on a departures board' },
  ps7Glass: { base: '#DDEFF4', shade: '#B4D2DC', label: '#1A1A1A', what: 'a drinking glass on a tray' },
  ps7Ink: { base: '#2B2622', shade: '#1A1714', label: '#FAFAF7', what: 'pencil marks, a clock’s hands' },
  ps7Red: { base: '#B23A2E', shade: '#8E2A20', label: '#FAFAF7', what: 'a red dial needle, a clock’s centre pin' },
  ps7Walnut: { base: '#5E3A2A', shade: '#3A3222', label: '#FAFAF7', what: 'a telegraph key’s walnut base, the lit row of a departures board' },
  // sci7 colours:
  sc7Blue: { base: '#4C8EDA', shade: '#2C63A8', label: '#1A1A1A', what: 'a blue solution in a flask' },
  sc7Water: { base: '#A9D5E4', shade: '#84BBCF', label: '#1A1A1A', what: 'clear water seen through a beaker' },
  sc7Glass: { base: '#E2F1F4', shade: '#B9D6DD', label: '#1A1A1A', what: 'laboratory glass, a beaker, a jar' },
  sc7Flame: { base: '#6FB4F2', shade: '#3C86D2', label: '#1A1A1A', what: 'a Bunsen burner’s blue flame' },
  sc7Roar: { base: '#F6B648', shade: '#E07E2C', label: '#1A1A1A', what: 'a Bunsen burner roaring yellow, its collar shut' },
  sc7Brass: { base: '#C9A043', shade: '#9E7A2A', label: '#1A1A1A', what: 'brass: a gas tap, a stopwatch, a dropper’s collar' },
  sc7Chalk: { base: '#F4F1E6', shade: '#D8D2C0', label: '#1A1A1A', what: 'white chalk' },
  sc7Mercury: { base: '#C8372E', shade: '#9C2820', label: '#FAFAF7', what: 'the red spirit in a thermometer' },
  sc7Tonic: { base: '#4C9C5A', shade: '#2D6B39', label: '#1A1A1A', what: 'a green glass tonic bottle' },
  sc7Cork: { base: '#C29464', shade: '#9C7044', label: '#1A1A1A', what: 'a bottle’s cork' },
  sc7Label: { base: '#F3ECD6', shade: '#D9CDAC', label: '#1A1A1A', what: 'a paper label, a notebook’s page' },
  sc7Steel: { base: '#B9C0C6', shade: '#8E979F', label: '#1A1A1A', what: 'a stopwatch’s nickel case' },
  sc7Pencil: { base: '#E0B23E', shade: '#B88A22', label: '#1A1A1A', what: 'a yellow pencil' },
  sc7Mars: { base: '#D9603E', shade: '#AE4529', label: '#1A1A1A', what: 'the planet Mars, red' },
  sc7Night: { base: '#1F2A4E', shade: '#151D38', label: '#FAFAF7', what: 'the night sky in a telescope’s view' },
  sc7Star: { base: '#FFF3C4', shade: '#E8D58E', label: '#1A1A1A', what: 'a star, a street lamp' },
  sc7Diary: { base: '#8A3E57', shade: '#682C40', label: '#FAFAF7', what: 'a diary’s plum cloth cover' },
  sc7Iron: { base: '#4A5157', shade: '#33393E', label: '#FAFAF7', what: 'a dropper’s rubber bulb, dark iron' },
  // biz7 colours:
  bz7Brass: { base: '#CFA54A', shade: '#A27E2E', label: '#1A1A1A', what: 'a brass cash register drawer front, brass coins' },
  bz7Drawer: { base: '#7E4A2A', shade: '#5E341C', label: '#FAFAF7', what: 'a wooden cash drawer' },
  bz7Copper: { base: '#B8743E', shade: '#8E5528', label: '#1A1A1A', what: 'copper pennies' },
  bz7BeadRed: { base: '#B8443A', shade: '#8E3028', label: '#FAFAF7', what: 'red-painted abacus beads' },
  bz7BeadOchre: { base: '#D49A3E', shade: '#AA7826', label: '#1A1A1A', what: 'ochre-painted abacus beads' },
  bz7BeadGreen: { base: '#4E7E50', shade: '#365C38', label: '#FAFAF7', what: 'green-painted abacus beads' },
  bz7Paper: { base: '#F5EFDC', shade: '#DCD2B4', label: '#1A1A1A', what: 'a paper receipt, a hotel’s note' },
  bz7Pencil: { base: '#2F6E5A', shade: '#20503F', label: '#FAFAF7', what: 'a green-lacquered pencil' },
  bz7Tin: { base: '#B5372C', shade: '#8E2820', label: '#FAFAF7', what: 'a red biscuit tin' },
  bz7Rain: { base: '#9DB4C6', shade: '#7E98AC', label: '#1A1A1A', what: 'rain streaks on a dark window' },
  bz7Bag: { base: '#C99B62', shade: '#A57B46', label: '#1A1A1A', what: 'a brown paper bag of chestnuts' },
  bz7Slate: { base: '#3A4146', shade: '#2A2F33', label: '#FAFAF7', what: 'a chalk slate in its wooden frame' },
  bz7SlateFrame: { base: '#A57B4A', shade: '#80592F', label: '#1A1A1A', what: 'a slate’s wooden frame' },
  bz7Chalk: { base: '#F4F1E6', shade: '#D8D2C0', label: '#1A1A1A', what: 'white chalk' },
  bz7Ember: { base: '#E8662A', shade: '#C2421A', label: '#1A1A1A', what: 'glowing coals through a brazier’s door' },
  bz7Smoke: { base: '#E4E2DE', shade: '#C8C5BF', label: '#1A1A1A', what: 'a wisp of grey smoke' },
  bz7Glove: { base: '#C98A3A', shade: '#A06A24', label: '#1A1A1A', what: 'a builder’s leather work glove' },
  bz7Sleeve: { base: '#5E6870', shade: '#465058', label: '#FAFAF7', what: 'a builder’s grey jumper sleeve' },
  // econ7 colours:
  ec7Chalk: { base: '#EEF0E6', shade: '#D2D4C8', label: '#1A1A1A', what: 'white chalk, a chalk mark on slate' },
  ec7Slate: { base: '#38423F', shade: '#2C3432', label: '#FAFAF7', what: 'a small slate tablet' },
  ec7Frame: { base: '#B4825A', shade: '#8A5A33', label: '#1A1A1A', what: 'a slate tablet’s wooden frame' },
  ec7Coffee: { base: '#6B3E22', shade: '#4E2A14', label: '#FAFAF7', what: 'black coffee pouring from an urn' },
  ec7China: { base: '#F7F5EE', shade: '#D9D5C8', label: '#1A1A1A', what: 'a white china coffee cup' },
  ec7Tape: { base: '#F4ECD2', shade: '#DCD0AE', label: '#1A1A1A', what: 'a ticker’s paper tape' },
  ec7Brass: { base: '#CFA349', shade: '#A57E2E', label: '#1A1A1A', what: 'a brass ticker wheel, a brass coin' },
  ec7Ledger: { base: '#7A2E2A', shade: '#5A201C', label: '#FAFAF7', what: 'a pocket ledger’s red cloth cover' },
  ec7Page: { base: '#F5EFDC', shade: '#DCD2B4', label: '#1A1A1A', what: 'a ledger’s page' },
  ec7Steam: { base: '#F4F2EC', shade: '#DCD8CE', label: '#1A1A1A', what: 'steam rising from a coffee urn' },
  ec7Rope: { base: '#A88A5E', shade: '#866B44', label: '#1A1A1A', what: 'a rope, a clothes line' },
  ec7Pin: { base: '#C0392B', shade: '#962A1F', label: '#FAFAF7', what: 'a red drawing pin' },
  ec7Peg: { base: '#B98451', shade: '#946436', label: '#1A1A1A', what: 'a wooden clothes peg' },
  ec7Cloud: { base: '#FCFDFE', shade: '#D6E2EA', label: '#1A1A1A', what: 'a white fair-weather cloud' },
  ec7Glint: { base: '#E8F6FB', shade: '#BFE2EF', label: '#1A1A1A', what: 'sunlight glinting on the sea' },
  ec7Clock: { base: '#2E2622', shade: '#1E1814', label: '#FAFAF7', what: 'a clock’s black hands' },
  // growth7 colours:
  gr7Steam: { base: '#F6F4EF', shade: '#DCD8CF', label: '#1A1A1A', what: 'steam puffing from a kettle' },
  gr7Fire: { base: '#F29B38', shade: '#D4701E', label: '#1A1A1A', what: 'the fire seen through a stove’s little window' },
  gr7Enamel: { base: '#EEF0F1', shade: '#CDD3D8', label: '#1A1A1A', what: 'a white enamel water jug' },
  gr7EnamelBlue: { base: '#3D6EA8', shade: '#2C5385', label: '#FAFAF7', what: 'the blue rim of an enamel jug' },
  gr7Kettle: { base: '#C2412F', shade: '#9C3121', label: '#FAFAF7', what: 'a red enamel kettle' },
  gr7Pencil: { base: '#E2B23A', shade: '#BA8C22', label: '#1A1A1A', what: 'a yellow pencil' },
  gr7Card: { base: '#FBF7EC', shade: '#E3DCC8', label: '#1A1A1A', what: 'a white card with a plan written on it' },
  gr7Sponge: { base: '#E9C47C', shade: '#C9A158', label: '#1A1A1A', what: 'a slice of sponge cake' },
  gr7Cream: { base: '#FBF5E8', shade: '#E7DCC6', label: '#1A1A1A', what: 'the cream in a cake' },
  gr7Berry: { base: '#C7363C', shade: '#9C252B', label: '#FAFAF7', what: 'a strawberry on a cake' },
  gr7Plate: { base: '#F1F3F2', shade: '#D2D7D6', label: '#1A1A1A', what: 'a white china plate' },
  gr7Cover: { base: '#3E6B4E', shade: '#2D5139', label: '#FAFAF7', what: 'a logbook’s green cloth cover' },
  gr7Page: { base: '#F6F0DF', shade: '#DDD3BA', label: '#1A1A1A', what: 'a logbook’s cream pages' },
  gr7PinHead: { base: '#D23A32', shade: '#A82A23', label: '#FAFAF7', what: 'the red head of a map pin' },
  gr7Steel: { base: '#A9B0B6', shade: '#858C92', label: '#1A1A1A', what: 'a steel pin, a walking pole' },
  gr7Graphite: { base: '#4A4744', shade: '#2E2C2A', label: '#FAFAF7', what: 'pencil lines on a map' },
  gr7Lace: { base: '#D8C08A', shade: '#B89C5E', label: '#1A1A1A', what: 'a boot’s tan laces' },
  gr7Wood: { base: '#8E5E36', shade: '#6E4524', label: '#FAFAF7', what: 'a wooden signpost arm' },
  gr7Cloud: { base: '#FFFFFF', shade: '#E3ECF3', label: '#1A1A1A', what: 'a white cloud' },
  gr7Glint: { base: '#E8F8FA', shade: '#BFE6EC', label: '#1A1A1A', what: 'sun glinting on a lake' },
  gr7Rock: { base: '#A9A59C', shade: '#88847C', label: '#1A1A1A', what: 'a grey stone falling from a cliff' },
  gr7Dash: { base: '#F2C230', shade: '#C99A12', label: '#1A1A1A', what: 'yellow trail waymarks' },
  gr7Lamp: { base: '#F6CF6A', shade: '#D9A93A', label: '#1A1A1A', what: 'a lit lantern’s glass' },
  gr7Brass: { base: '#B8893A', shade: '#94692A', label: '#1A1A1A', what: 'a brass lantern' },
  gr7Water: { base: '#8CC7E0', shade: '#5FA6C6', label: '#1A1A1A', what: 'water pouring from a jug' },
  gr7Pebble: { base: '#BDB4A2', shade: '#9A917F', label: '#1A1A1A', what: 'loose gravel pebbles' },
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
  { ...oEll('mass', 50, 50, 16, 16), nat: 'silver' },           // the hub, bright steel
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
  { ...oRect('dark', 50, 58, 88, 68, 0, 1), nat: 'slate' },     // the slate, dark grey stone
  oRect('face', 50, 99.5, 72, 4, 0, 1),                         // the chalk ledge under it
  oBar('line', 50, 2, 12, 18, 1.8),                             // the cord, from the nail …
  oBar('line', 50, 2, 88, 18, 1.8),                             // … to both corners
  oEll('line', 50, 2, 4, 4),                                    // and the nail
];
export const wallBoard = (x: number, y: number, w: number, h: number) =>
  fit(WALL_BOARD.map((p) => (p.nat || p.role === 'line' || p.role === 'lit' ? p : { ...p, nat: 'wood' as NaturalKey })), x, y, w, h);
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
  { ...oRect('mass', 84, 43, 14, 11, 0, 1.5), nat: 'iron' },    // the vice, cast iron, on the top's end
  { ...oRect('dark', 84, 43, 2.4, 11, 0, 1), nat: 'iron' },     // its jaws
  oBar('line', 77, 46, 70, 46, 2.4),                            // and its screw handle
  oEll('line', 7, 48.2, 10, 3),                                 // the spike's round foot
  oBar('line', 7, 48, 7, 12, 2.4),                              // and its nail
];
export const workbench = (x: number, y: number, w: number, h: number) =>
  fit(WORKBENCH.map((p) => (p.nat || p.role === 'line' || p.role === 'lit' ? p : { ...p, nat: 'wood' as NaturalKey })), x, y, w, h);
/** The spike's point, in the bench's own square. */
export const BENCH_SPIKE = { x: 7, y: 12 } as const;

// ── PEGBOARD ─────────────────────────────────────────────────────────────────
//
// REFERENCE. The wall of a bicycle workshop is hung with what it runs on: spare
// TYRES looped over pegs and SPANNERS in a row, on a board punched with a grid of
// holes. The grid is the field mark of a pegboard; the tyres are what make it a
// bicycle shop's. The board is brown HARDBOARD (photographs of workshop walls: the
// common one is the colour of a cardboard box, punched with dark holes); the tyre is
// black rubber, in ink, and the spanners are bright steel.
const PEGBOARD: ObjPart[] = [
  { ...oRect('mass', 50, 50, 100, 96, 0, 2), nat: 'hardboard' }, // the board
  { ...oRect('face', 50, 97.5, 100, 5, 0, 1), nat: 'hardboard' }, // its lower edge, in shade
  ...[14, 30, 46, 62, 78].flatMap((y) => [12, 28, 44, 60, 76, 92].map((x) => ({ ...oEll('dark', x, y, 2.4, 2.4), nat: 'felt' as NaturalKey }))), // the holes
  oBar('line', 70, 14, 70, 22, 3),                              // a peg …
  ...phil1Ring('line', 70, 44, 20, 6.5),                        // … with a spare tyre on it
  oBar('line', 20, 16, 20, 20, 3),                              // two more pegs …
  oBar('line', 36, 16, 36, 20, 3),
  ...[oBar('mass', 20, 22, 20, 56, 4.4), oEll('mass', 20, 60, 9, 8)].map((p) => ({ ...p, nat: 'silver' as NaturalKey })), // … and two spanners
  oEll('lit', 20, 62, 4, 4),
  ...[oBar('mass', 36, 22, 36, 48, 4), oEll('mass', 36, 52, 8, 7)].map((p) => ({ ...p, nat: 'silver' as NaturalKey })),
  oEll('lit', 36, 54, 3.6, 3.6),
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
  ...psychNat('slate', oRect('dark', 50, 52, 88, 72, 0, 1.5)),   // the slate inside it
  ...psychNat('wood', oRect('mass', 50, 96, 92, 7, 0, 2)),       // and the chalk ledge under it
];
export const menuBoard = (x: number, y: number, w: number, h: number) => fit(MENU_BOARD, x, y, w, h);

// ── CAFÉ COUNTER ─────────────────────────────────────────────────────────────
//
// REFERENCE. A café counter is a thick WOODEN TOP over a FLUTED front — narrow
// vertical boards or reeds, which is what separates it from a market stall's plain
// planks — standing on a dark KICK PLATE at the floor.
// (2026-10-01, AR1) The front is PAINTED — a deep café green, the colour a fluted
// counter front most often wears — and each flute is a groove in that paint, in its
// own shade; the kick plate is dark wood.
const CAFE_COUNTER: ObjPart[] = [
  ...psychNat('wood', oRect('mass', 50, 9, 100, 18, 0, 1.5)),    // the wooden top, lit
  ...psychNat('counterPaint', oRect('mass', 50, 58, 96, 80, 0, 1)), // the painted front
  ...psychNat('wood', oRect('dark', 50, 20, 100, 5)),            // the top's underside
  ...psychNat('counterPaint',                                    // the flutes, grooves in the paint
    ...[8, 16, 24, 32, 40, 48, 56, 64, 72, 80, 88].map((x) => oBar('dark', x, 28, x, 86, 4))),
  ...psychNat('wood', oRect('dark', 50, 94, 96, 10)),            // the kick plate
];
export const cafeCounter = (x: number, y: number, w: number, h: number) => fit(CAFE_COUNTER, x, y, w, h);

// ── THE CUP AND ITS SAUCER, APART (2026-10-01, LESSON_RULES AR3) ─────────────
//
// The owner: *"if there's a saucer, then they grab the saucer and the cup, but then
// when they drink it, it looks like they actually drink it. Off the saucer."* So the
// café cup is two drawings, not one: the SAUCER, which a hand lifts from the counter
// and holds flat at the chest, and the CUP, which the other hand takes off it by the
// handle and carries to the lips. REFERENCE (scratchpad/ref/psy1cup2-*, an espresso
// cup on its saucer): a white china bowl a little wider at the rim than at its foot,
// on a low FOOT RING; a ring handle standing clear of the wall, about half the cup's
// height; the coffee's surface seen in the rim; the saucer a flat dish wider than the
// cup with a shallow WELL where the foot sits. Real units, so a cup is about half a
// head wide (the head is 30 at a lesson's K 0.76).
const p1In = (ax: number, ay: number, parts: readonly ObjPart[]): ObjPart[] => {
  const sx = 100 / ax;
  const sy = 100 / ay;
  const s = 100 / Math.min(ax, ay);
  return parts.map((p) => {
    if (p.k === 'bar') return { ...p, x1: p.x1 * sx, y1: p.y1 * sy, x2: p.x2 * sx, y2: p.y2 * sy, t: p.t * s };
    return { ...p, x: p.x * sx, y: p.y * sy, w: p.w * sx, h: p.h * sy, ...(p.k === 'rect' ? { rad: p.rad * s } : null) } as ObjPart;
  });
};
/** The cup alone, 16 × 11.4: its body centred at x 6.6, its handle on the RIGHT. */
const CAFE_CUP: ObjPart[] = p1In(16, 10.6, [
  ...psychNat('porcelain',
    oBar('mass', 11.8, 3.2, 14.8, 3.2, 1.5),                     // the handle, a ring standing
    oBar('mass', 14.8, 3.2, 14.8, 6.6, 1.5),                     // clear of the wall
    oBar('mass', 14.8, 6.6, 11.2, 7.8, 1.5),
    ...trapezoid('mass', 6.6, 4.9, 13, 9.8, 7.2),                // the bowl, narrowing …
    oEll('mass', 6.6, 8.2, 9.8, 2.8),                            // … and rounding into its foot
    oRect('mass', 6.6, 9.9, 6, 1.2, 0, 0.3),                     // the foot ring
    oEll('mass', 6.6, 1.3, 13, 2.4),                             // the rim, from a little above
    oRect('dark', 10.4, 5.4, 2, 6.4, 0, 0.6),                    // the wall turned from the lamp
  ),
  ...psychNat('coffee', oEll('mass', 6.6, 1.35, 10.6, 1.5)),      // and the coffee in it
  oBar('lit', 2.7, 3.4, 3.3, 7.8, 0.7),                          // the glaze's shine
]);
/** The handle, where a hand holds it, in the cup's 16 × 10.6 box (from its top-left). */
export const CAFE_CUP_GRIP = { x: 14.8, y: 4.9, w: 16, h: 10.6, foot: 10.5, body: 6.6 } as const;
/** The cup, centred on (x, y). A scene draws it about its handle by centring it at (w/2 − grip.x, h/2 − grip.y). */
export const cafeCup = (x: number, y: number, w: number = CAFE_CUP_GRIP.w, h: number = CAFE_CUP_GRIP.h) => fit(CAFE_CUP, x, y, w, h);
/** The saucer, 18 × 3.4, drawn about its centre. Its top, where the cup's foot sits, is 1 above it. */
const SAUCER: ObjPart[] = p1In(18, 3.4, [
  ...psychNat('porcelain',
    oEll('mass', 9, 1.9, 18, 3),                                 // the dish
    oRect('face', 9, 2.9, 9, 1, 0, 0.4),                         // its foot, under it
    oEll('dark', 9, 1.4, 10, 1.3),                               // the well the cup sits in
  ),
  oBar('lit', 2.4, 1.6, 6, 1.1, 0.5),                            // the glaze on the near rim
]);
export const SAUCER_SIZE = { w: 18, h: 3.4, top: 1 } as const;
export const saucer = (x: number, y: number, w: number = SAUCER_SIZE.w, h: number = SAUCER_SIZE.h) => fit(SAUCER, x, y, w, h);

// ── CAFÉ WINDOW ──────────────────────────────────────────────────────────────
//
// REFERENCE: a café's back window is a sash in a WHITE-PAINTED frame, four panes of
// glass that show the pale daylight outside, glazing bars between them, and a wooden
// SILL proud of the wall. The shared `window` paints its panes paper and its frame in
// the lesson's stage tone (AR1): this one is the colours a window is.
const CAFE_WINDOW: ObjPart[] = [
  ...psychNat('plinthWhite', oRect('mass', 50, 46, 78, 84, 0, 2)), // the painted frame
  ...psychNat('clearSky',                                         // four panes of daylight
    oRect('dark', 31, 28, 28, 30, 0, 1), oRect('dark', 69, 28, 28, 30, 0, 1),
    oRect('dark', 31, 64, 28, 30, 0, 1), oRect('dark', 69, 64, 28, 30, 0, 1),
  ),
  oBar('lit', 22, 40, 34, 18, 3), oBar('lit', 60, 76, 72, 54, 3), // a glint on the glass
  oBar('line', 50, 8, 50, 84, 4),                                // the glazing bars
  oBar('line', 14, 46, 86, 46, 4),
  ...psychNat('wood', oRect('mass', 50, 92, 96, 8, 0, 1.5)),     // the sill, proud of the frame
  ...psychNat('wood', oRect('dark', 50, 98, 96, 5, 0, 1.5)),
];
export const cafeWindow = (x: number, y: number, w: number, h: number) => fit(CAFE_WINDOW, x, y, w, h);

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
// In its own colours (AR1): a pale sea-green painted render, a white sash, dark glass
// with the sky caught in its top panes, and a darker plinth band of the same render.
const HOUSE_FRONT: ObjPart[] = [
  g1(oRect('mass', 50, 50, 100, 100), 'render'),                  // the rendered wall
  g1(oRect('dark', 50, 96, 100, 8), 'render'),                    // the plinth band
  g1(oRect('dark', 50, 24, 50, 30, 0, 1), 'sashWhite'),           // the window's frame, set in
  g1(oRect('dark', 38, 17, 18, 11, 0, 0.5), 'houseGlass'),        // its four panes
  g1(oRect('dark', 62, 17, 18, 11, 0, 0.5), 'houseGlass'),
  g1(oRect('dark', 38, 31, 18, 11, 0, 0.5), 'houseGlass'),
  g1(oRect('dark', 62, 31, 18, 11, 0, 0.5), 'houseGlass'),
  oBar('lit', 31, 14, 37, 14, 1.4),                               // the sky caught in the glass
  oBar('lit', 55, 14, 61, 14, 1.4),
  oRect('line', 50, 40.5, 58, 2.4, 0, 0.5),                      // and its sill, proud of it
  g1(oRect('mass', 50, 98, 74, 4, 0, 1), 'coping'),               // the stone step
];
export const houseFront = (x: number, y: number, w: number, h: number) => fit(HOUSE_FRONT, x, y, w, h);

// ── GARDEN TREE ──────────────────────────────────────────────────────────────
//
// The library's `tree` (reference above it: a short flared trunk, one scalloped canopy
// low on it), in the colours it is (AR1): a bark-brown trunk under a green canopy whose
// underside is the leaf's own shade.
const GARDEN_TREE: ObjPart[] = TREE.map((p, i) => ({ ...p, nat: i < 3 ? 'bark' : 'leaf' } as ObjPart));
export const gardenTree = (x: number, y: number, w: number, h: number) => fit(GARDEN_TREE, x, y, w, h);

// ── BICYCLE IN THE SHED ──────────────────────────────────────────────────────
//
// phil1's `bicycleWheel` (reference: an OPEN wheel — tyre, thin rim, wire spokes with
// daylight between them), seen in the DARK of a shed doorway, where its ink spokes and
// ink tyre vanish. So the spokes catch the light, the hub is bright steel, and the tyre
// is black rubber against the shed's dark inside.
const SHED_WHEEL: ObjPart[] = [
  ...Array.from({ length: 12 }, (_, i) => {
    const a = ((i * 30 + 15) * Math.PI) / 180;
    return oBar('lit', 50 + Math.cos(a) * 7, 50 + Math.sin(a) * 7, 50 + Math.cos(a) * 40, 50 + Math.sin(a) * 40, 1.8);
  }),
  ...phil1Ring('lit', 50, 50, 39, 2.4),                           // the steel rim inside the tyre
  ...phil1Ring('line', 50, 50, 44, 8),                            // the tyre, black rubber
  g1(oEll('mass', 50, 50, 16, 16), 'silver'),                     // the hub
  oEll('line', 50, 50, 5, 5),                                     // and the axle nut
];
export const shedWheel = (x: number, y: number, w: number, h: number) => fit(SHED_WHEEL, x, y, w, h);

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
  ...biz1Nat('slate', oRect('dark', 50, 19, 93, 30, 0, 1)),       // the slate let into it
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
  ...biz1Nat('lemon', oBar('dark', 12, 44, 88, 44, 7)),           // the printed band, lemon yellow
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
  ...biz1Nat('silver', ...trapezoid('mass', 50, 64, 96, 76, 72)), // the basket, galvanised wire
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

// ─────────────────────────────────────────────────────────────────────────────
// THE PAVEMENT CAFÉ, for Philosophy lesson 2 (2026-09-30). Drawn against pictures
// fetched with `node scripts/get-reference.mjs` (scratchpad/ref/phil2-*): two slices of
// carrot cake on café plates, a Thonet No. 14 bistro chair, a terrace of café tables
// under striped awnings at Margate, a specials board on a wooden easel, and a shop's
// awning with its scalloped valance.
// ─────────────────────────────────────────────────────────────────────────────

/** Give parts a real colour (AP11), part by part. */
const phil2N = (k: NaturalKey, ...ps: ObjPart[]): ObjPart[] => ps.map((p) => ({ ...p, nat: k }));

// ── CAKE SLICE ───────────────────────────────────────────────────────────────
//
// REFERENCE. A slice of carrot cake seen from the side is LAYERS: a brown spiced sponge
// flecked with orange carrot, a stripe of cream-cheese frosting through the middle, a
// second layer of sponge, and a THICK cap of frosting on top — piped into a swirl and
// finished with a little marzipan carrot. The stripes are the field mark (the plain
// man counts them): without them it is a brown brick. The outer edge, the side that
// was the outside of the whole cake, is frosted too; the tip, cut, is bare sponge.
const CAKE_SLICE: ObjPart[] = [
  ...phil2N('sponge',
    oRect('mass', 52, 82, 92, 30, 0, 2),                           // the bottom layer of sponge
    oRect('mass', 52, 48, 92, 24),                                 // the top layer
    oRect('face', 52, 96, 90, 6, 0, 2),                            // its foot, turned from the lamp
  ),
  ...phil2N('frosting',
    oRect('mass', 52, 63, 92, 8),                                  // the frosting through the middle
    oRect('mass', 52, 28, 94, 18, 0, 4),                           // the thick cap on top
    oRect('mass', 8, 60, 10, 78, 0, 3),                            // the frosted outer edge
    oEll('mass', 34, 16, 22, 14),                                  // a piped swirl
  ),
  ...phil2N('orange',
    oEll('dark', 30, 46, 4, 3.5), oEll('dark', 62, 52, 4, 3.5), oEll('dark', 82, 44, 4, 3.5),   // carrot in the sponge
    oEll('dark', 44, 84, 4, 3.5), oEll('dark', 72, 80, 4, 3.5), oEll('dark', 24, 88, 4, 3.5),
    oTri('mass', 62, 14, 8, 18, 'right', 18),                      // the marzipan carrot on top
  ),
  ...phil2N('leaf', oTri('mass', 54, 10, 6, 7, 'left', 18)),       // its green top
  oBar('line', 12, 27, 96, 27, 0.8),                               // the swirl's own line in the cap
];
export const cakeSlice = (x: number, y: number, w: number, h: number) => fit(CAKE_SLICE, x, y, w, h);

// ── CAKE PLATE ───────────────────────────────────────────────────────────────
//
// REFERENCE. A café side plate is WHITE CHINA with a broad flat rim round a shallow
// well, on a low foot ring. Seen from the side and a little above, the rim is a long
// flat ellipse and the well a darker one inside it; the foot is a short band under it.
const CAKE_PLATE: ObjPart[] = [
  ...phil2N('porcelain',
    oRect('face', 50, 70, 40, 14, 0, 3),                           // the low foot ring, in shade
    oEll('mass', 50, 50, 100, 36),                                 // the rim, seen from above
    oEll('dark', 50, 50, 64, 18),                                  // the well inside it
  ),
  oBar('lit', 14, 48, 30, 40, 3),                                  // the lamp on the glaze
];
export const cakePlate = (x: number, y: number, w: number, h: number) => fit(CAKE_PLATE, x, y, w, h);

// ── FORK, TEASPOON ───────────────────────────────────────────────────────────
//
// REFERENCE. A cake fork is a flat steel HANDLE widening to a head of four TINES; a
// teaspoon is the same handle ending in an oval BOWL. At the size a hand holds them
// on the stage the tines close up, so the head is drawn broad with two slits in it —
// the slits are what say fork rather than spatula. Both are drawn upright, held by the
// foot of the handle at the bottom of the square.
const FORK: ObjPart[] = [
  ...phil2N('silver',
    oBar('mass', 50, 96, 50, 42, 10),                              // the handle
    oRect('mass', 50, 24, 30, 40, 0, 4),                           // the head
    oRect('face', 50, 44, 14, 8, 0, 2),                            // the neck, in shade
  ),
  oBar('line', 44, 6, 44, 30, 3),                                  // the slits between the tines
  oBar('line', 56, 6, 56, 30, 3),
];
export const fork = (x: number, y: number, w: number, h: number) => fit(FORK, x, y, w, h);

const TEASPOON: ObjPart[] = [
  ...phil2N('silver',
    oBar('mass', 50, 96, 50, 40, 10),                              // the handle
    oEll('mass', 50, 22, 36, 44),                                  // the bowl
    oEll('dark', 54, 24, 20, 30),                                  // its hollow, in shade
  ),
  oEll('lit', 44, 18, 8, 14),                                      // the lamp in the bowl
];
export const teaspoon = (x: number, y: number, w: number, h: number) => fit(TEASPOON, x, y, w, h);

// ── BISTRO TABLE ─────────────────────────────────────────────────────────────
//
// REFERENCE. A café's standing table is a ROUND MARBLE TOP on one cast-iron PEDESTAL:
// a slim column with a collar under the top, flaring at the floor into a heavy foot.
// Seen from the side and a little above, the top is a flat ellipse over a thin edge.
// One column under a disc is the field mark — four legs make it a dining table.
const BISTRO_TABLE: ObjPart[] = [
  ...phil2N('iron',
    ...trapezoid('mass', 50, 92, 18, 62, 12),                      // the foot, flaring to the floor
    oRect('mass', 50, 56, 8, 74),                                  // the column
    oRect('mass', 50, 21, 18, 6, 0, 1.5),                          // the collar under the top
    oEll('face', 50, 98, 64, 5),                                   // the foot's edge on the ground
  ),
  ...phil2N('marble',
    oRect('face', 50, 13, 98, 8, 0, 2.5),                          // the top's edge, in shade
    oEll('mass', 50, 9, 100, 16),                                  // the round top, from above
  ),
  oBar('lit', 18, 7, 46, 5, 2),                                    // the lamp on the marble
];
export const bistroTable = (x: number, y: number, w: number, h: number) => fit(BISTRO_TABLE, x, y, w, h);

// ── SPECIALS EASEL ───────────────────────────────────────────────────────────
//
// REFERENCE. A café's specials board stands on a wooden EASEL: two front legs splayed
// from a peg above the board, a third leg behind, and the board — a SLATE in a wooden
// frame — resting on a LEDGE pegged across the legs, with a stub of chalk on it. The
// legs rising above the board and the ledge under it are the field marks: a framed
// slate on a wall is a menu, on two short splayed legs an A-board. The writing is the
// scene's to draw, because it changes (`EASEL_SLATE`, in the square).
const SPECIALS_EASEL: ObjPart[] = [
  ...phil2N('wood',
    oBar('face', 50, 4, 50, 99, 3.4),                              // the back leg, behind the board
    oBar('mass', 45, 1, 6, 99, 3.6),                               // the front legs, splayed
    oBar('mass', 55, 1, 94, 99, 3.6),
    oRect('mass', 50, 3, 16, 5, 0, 1.5),                           // the peg where they meet
    oRect('mass', 50, 50, 96, 68, 0, 2),                           // the board's frame
    oRect('mass', 50, 88, 92, 5, 0, 1.5),                          // the ledge it rests on
  ),
  ...phil2N('slate', oRect('dark', 50, 50, 88, 58, 0, 1)),         // the slate in it
  oBar('lit', 18, 85.6, 26, 85.6, 2),                              // a stub of chalk on the ledge
];
export const specialsEasel = (x: number, y: number, w: number, h: number) => fit(SPECIALS_EASEL, x, y, w, h);
/** The slate inside the frame, in the easel's own square. */
export const EASEL_SLATE = { x: 50, y: 50, w: 88, h: 58 } as const;

// ── CAFÉ FRONT ───────────────────────────────────────────────────────────────
//
// REFERENCE. A pavement café's front is a WALL with an AWNING over it — canvas in
// broad STRIPES, ending in a SCALLOPED valance — and, under it, a serving HATCH: an
// opening onto a lit room with a shelf of cups, a NAME BOARD over it, and a wooden
// LEDGE along its sill for what is handed out. The stripes and the scallops are what
// say café rather than shop; the ledge is what the customer takes her plate from.
// (`CAFE_HATCH` and `CAFE_LEDGE`, in the square.)
const AWN_X = [6, 18, 30, 42, 54, 66, 78, 90];
const CAFE_FRONT: ObjPart[] = [
  ...phil2N('shopfront',                                           // painted deep green, as the
    oRect('mass', 56, 58, 88, 84),                                 // Margate terrace's fronts are
    oRect('face', 56, 99, 88, 2),                                  // its foot, in shade
  ),
  ...phil2N('awning',
    oRect('mass', 50, 10, 100, 14, 0, 1),                          // the awning's canvas
    ...AWN_X.map((x) => oEll('mass', x, 18.5, 12, 6)),             // its scalloped valance
  ),
  ...AWN_X.filter((_, i) => i % 2 === 1).map((x) => oRect('lit', x, 10, 6, 13)),   // the pale stripes
  ...AWN_X.filter((_, i) => i % 2 === 1).map((x) => oEll('lit', x, 18.5, 9, 4)),
  oBar('line', 1, 3.3, 99, 3.3, 1.2),                              // the awning's rail
  oRect('lit', 61, 30, 44, 7, 0, 1),                               // the name board
  oRect('lit', 61, 67, 62, 30, 0, 1),                              // the hatch, onto a lit room
  oBar('line', 34, 61, 88, 61, 1),                                 // the shelf in it
  ...phil2N('mugGlaze', oEll('dark', 42, 58.5, 6, 4), oEll('dark', 52, 58.5, 6, 4), oEll('dark', 74, 58.5, 6, 4)),   // blue cups on the shelf
  oBar('line', 30, 52, 30, 82, 1.4), oBar('line', 92, 52, 92, 82, 1.4), oBar('line', 30, 52, 92, 52, 1.4),   // its frame
  ...phil2N('wood',
    oRect('mass', 61, 83, 70, 3.4, 0, 1),                          // the ledge along the sill
  ),
];
export const cafeFront = (x: number, y: number, w: number, h: number) => fit(CAFE_FRONT, x, y, w, h);
/** The name board over the hatch, and the ledge along its sill, in the front's own square. */
export const CAFE_SIGN = { x: 61, y: 30, w: 44, h: 7 } as const;
export const CAFE_LEDGE = { x: 61, y: 83, w: 70, h: 3.4 } as const;

// ── phil2: objects for this lesson go ABOVE this line ──

// ─────────────────────────────────────────────────────────────────────────────
// THE SUPERMARKET AISLE, for Psychology lesson 2 (2026-09-30). Every one drawn against
// pictures fetched with `node scripts/get-reference.mjs` (scratchpad/ref/p2-*): a row of
// trolleys and two cart icons, a jar of raspberry jam and two lidded jars, a shelf of
// jams, a ceiling CCTV camera beside a hung monitor, and a Calgary aisle sign.
// ─────────────────────────────────────────────────────────────────────────────

/** Give parts a real colour (AP11). */
const p2N = (k: NaturalKey, ...ps: ObjPart[]): ObjPart[] => ps.map((p) => ({ ...p, nat: k }));

// ── TROLLEY ──────────────────────────────────────────────────────────────────
//
// REFERENCE. A supermarket trolley seen side-on is a WIRE BASKET shaped like a
// trapezoid — its back edge leaning back under the handle, its front edge leaning
// forward, so the top is longer than the floor — on a low CHASSIS with a wire tray
// under the basket and four CASTORS. The push handle is a plastic grip above the back
// edge. You see THROUGH it: the rim and the struts are tube, the sides are a grid of
// thin wires, and that see-through grid is the field mark — a filled trapezoid is a
// pram or a skip. Nose to the right; the grip at (6, 13) of the square.
const TROLLEY_MESH_X = [32, 44, 56, 68, 80, 92];
const TROLLEY: ObjPart[] = [
  ...p2N('silver',
    oBar('mass', 10, 15, 24, 62, 3.8),                           // the back strut, down from the grip
    oBar('mass', 24, 62, 23, 87, 3.8),
    oBar('mass', 16, 20, 99, 20, 3.8),                           // the basket's rim
    oBar('mass', 99, 20, 88, 60, 3.8),                           // its front, leaning forward
    oBar('mass', 25, 60, 88, 60, 3.8),                           // its floor
    oBar('mass', 16, 20, 25, 60, 3.4),                           // its back, under the grip
    oBar('mass', 88, 60, 89, 87, 3.8),                           // the front leg
    oBar('mass', 24, 79, 88, 79, 3),                             // the tray under the basket
    oBar('mass', 18, 87, 94, 87, 4.4),                           // the chassis
  ),
  ...p2N('trolleyRed',
    oBar('mass', 1, 13, 13, 13, 8),                              // the plastic grip
    oRect('mass', 97, 21, 7, 10, 0, 2),                          // and the nose bumper
  ),
  ...p2N('castor',
    oEll('mass', 24, 93, 13, 14),                                // the castors
    oEll('mass', 88, 93, 13, 14),
  ),
  // the wire grid of the side: uprights, clipped to the leaning front, and two rails
  ...TROLLEY_MESH_X.map((x) => oBar('line', x, 22, x, x > 87 ? 20 + (99 - x) * (40 / 11) : 58, 1)),
  oBar('line', 19.5, 33, 96, 33, 1),
  oBar('line', 22.5, 46, 93, 46, 1),
  ...[34, 46, 58, 70, 82].map((x) => oBar('line', x, 80, x, 86, 1)),   // the tray's wires
  oEll('lit', 24, 93, 4, 4),                                     // the castors' hubs
  oEll('lit', 88, 93, 4, 4),
];
export const trolley = (x: number, y: number, w: number, h: number) => fit(TROLLEY, x, y, w, h);
/** The trolley's grip, in its own square — where a hand pushing it goes. */
export const TROLLEY_GRIP = { x: 6, y: 13 } as const;

// ── JAM JAR ──────────────────────────────────────────────────────────────────
//
// REFERENCE. A jar of jam is SQUAT — about as tall as it is wide — with rounded
// shoulders up to a short neck, a metal SCREW LID with a ribbed band, and a paper
// LABEL round its middle. The jam is the recognition: a dark fruit colour right to the
// shoulders, with one bright streak of glass reflection down the lit side.
function jamJarParts(fill: NaturalKey): ObjPart[] {
  return [
    ...p2N(fill,
      oRect('mass', 50, 60, 88, 76, 0, 18),                      // the jar, full of jam
      oRect('mass', 50, 23, 66, 10, 0, 2),                       // its neck
      oBar('dark', 82, 36, 82, 88, 9),                           // the side turned from the lamp
    ),
    ...p2N('brass',
      oRect('mass', 50, 11, 80, 16, 0, 3),                       // the screw lid
      oRect('dark', 50, 16, 80, 4),                              // its lower band, in shade
    ),
    oRect('lit', 50, 62, 88, 30, 0, 1),                          // the label round its middle
    ...p2N(fill, oEll('dark', 50, 62, 18, 18)),                  // the fruit printed on it
    oBar('lit', 17, 34, 17, 46, 6),                              // the glass's shine
  ];
}
export const jamJar = (x: number, y: number, w: number, h: number, fill: NaturalKey = 'jam') =>
  fit(jamJarParts(fill), x, y, w, h);

// ── JAM SPLAT ────────────────────────────────────────────────────────────────
//
// REFERENCE. A dropped jar of jam is a STAIN on the floor — far wider than it is deep,
// with lobes where it ran — with the jar's thick glass BASE still standing in it, its
// top jagged, and slivers of glass lying round it catching the light. The standing
// base is what says jar; a red pool on its own is paint. The floor is the square's
// middle line (y 50): the base stands on it and the pool lies below it, on the floor.
const JAM_SPLAT: ObjPart[] = [
  ...p2N('jam',
    oEll('mass', 50, 70, 92, 32),                                // the pool, on the floor
    oEll('mass', 18, 66, 30, 18),                                // where it ran
    oEll('mass', 80, 76, 34, 20),
    oEll('mass', 60, 86, 26, 14),
    oEll('dark', 56, 74, 52, 14),                                // its deeper middle
  ),
  ...p2N('glass',
    oRect('mass', 44, 47, 30, 20, 0, 4),                         // the jar's base, still standing
    oTri('mass', 34, 34, 9, 10, 'up', -8),                       // its broken, jagged top
    oTri('mass', 45, 33, 8, 13, 'up', 6),
    oTri('mass', 55, 35, 8, 9, 'up', -4),
    oTri('mass', 78, 62, 12, 6, 'right', 14),                    // slivers on the floor
    oTri('mass', 20, 80, 11, 6, 'left', -10),
    oRect('mass', 88, 86, 10, 3, 18, 0.5),
  ),
  ...p2N('jam', oRect('dark', 44, 50, 26, 12, 0, 2)),            // the jam still in the base
  oBar('lit', 33, 42, 33, 54, 2.2),                              // the base's shine
  oBar('lit', 74, 61, 81, 63, 1.4),                              // a glint on a sliver
];
export const jamSplat = (x: number, y: number, w: number, h: number) => fit(JAM_SPLAT, x, y, w, h);

// ── JAM LID ──────────────────────────────────────────────────────────────────
//
// REFERENCE. A screw lid off its jar, seen on its face: a gold DISC with a raised rim
// round a flat top, the ridges of the thread showing at the edge. A plain disc is a
// coin; the inner ring is what makes it a lid.
const JAM_LID: ObjPart[] = [
  ...p2N('brass',
    oEll('mass', 50, 50, 100, 100),
    oEll('dark', 56, 56, 64, 64),                                // the flat top, sunk inside the rim
  ),
  oBar('lit', 26, 34, 34, 22, 7),                                // the lamp on the rim
];
export const jamLid = (x: number, y: number, w: number, h: number) => fit(JAM_LID, x, y, w, h);

// ── AISLE SIGN ───────────────────────────────────────────────────────────────
//
// REFERENCE. A supermarket aisle sign HANGS from the ceiling on two thin wires: a long
// charcoal board with the aisle NUMBER on a red panel at its left end and the aisle's
// contents on SLATS, one category to a slat, in white capitals. The slats are the
// field mark, and the scene writes on them (`SIGN_SLATS`, in the square).
const AISLE_SIGN: ObjPart[] = [
  oBar('line', 12, 0, 12, 15, 2),                                // the hanging wires
  oBar('line', 88, 0, 88, 15, 2),
  ...p2N('signBoard', oRect('mass', 50, 57, 100, 86, 0, 3)),     // the board
  ...p2N('signRed', oRect('mass', 9, 57, 18, 86, 0, 3)),         // the number panel
  ...p2N('signBoard',
    oBar('dark', 21, 42.9, 99, 42.9, 2),                         // the grooves between the slats
    oBar('dark', 21, 71.4, 99, 71.4, 2),
  ),
  oBar('lit', 18.6, 15, 18.6, 99, 1.2),                          // the white rule by the number
];
export const aisleSign = (x: number, y: number, w: number, h: number) => fit(AISLE_SIGN, x, y, w, h);
/** The slats' writing area, in the sign's own square: three rows between y 14 and 100. */
export const SIGN_SLATS = { x0: 21, x1: 99, y0: 14, y1: 100 } as const;

// ── CCTV CAMERA ──────────────────────────────────────────────────────────────
//
// REFERENCE. A shop's ceiling camera hangs from a short white POLE off a ceiling
// plate, and the camera itself is a white HOUSING — a long box — under a SUN HOOD that
// overhangs its front, with a dark LENS in the front face. Mount and camera are two
// drawings so the scene can turn the camera on its joint. The camera points right,
// its joint at the square's left middle.
const CCTV_MOUNT: ObjPart[] = [
  ...p2N('casing',
    oRect('mass', 50, 8, 100, 16, 0, 2),                         // the ceiling plate
    oBar('mass', 50, 12, 50, 74, 28),                            // the pole
    oEll('mass', 50, 82, 52, 36),                                // the joint
    oBar('dark', 62, 18, 62, 70, 8),                             // the pole's shaded side
  ),
];
export const cctvMount = (x: number, y: number, w: number, h: number) => fit(CCTV_MOUNT, x, y, w, h);
const CCTV_CAMERA: ObjPart[] = [
  ...p2N('casing',
    oBar('mass', 11, 56, 24, 56, 20),                            // the bracket from the joint
    oRect('mass', 56, 60, 80, 48, 0, 10),                        // the housing
    oRect('mass', 60, 30, 80, 16, 0, 4),                         // the sun hood, overhanging
    oRect('dark', 56, 76, 76, 12, 0, 4),                         // the housing's underside
  ),
  ...p2N('castor', oRect('mass', 96, 60, 8, 40, 0, 3)),          // the lens's black front
  oEll('lit', 96, 52, 4, 10),                                    // a glint in the glass
];
export const cctvCamera = (x: number, y: number, w: number, h: number) => fit(CCTV_CAMERA, x, y, w, h);

// ── CCTV SCREEN ──────────────────────────────────────────────────────────────
//
// REFERENCE. Beside the camera, the public monitor that shows shoppers what it sees:
// a flat SCREEN in a dark BEZEL, hung from the ceiling on a pole like the camera, with
// a small power light on its bottom edge. What it shows is the scene's to draw
// (`SCREEN_FACE`, in the square).
const CCTV_SCREEN: ObjPart[] = [
  ...p2N('casing', oBar('mass', 50, 0, 50, 30, 10)),             // the pole
  ...p2N('signBoard', oRect('mass', 50, 64, 100, 72, 0, 5)),     // the bezel
  ...p2N('screenOff', oRect('dark', 50, 62, 86, 56, 0, 2)),      // the screen, off
  oEll('lit', 86, 95, 4, 4),                                     // the power light
];
export const cctvScreen = (x: number, y: number, w: number, h: number) => fit(CCTV_SCREEN, x, y, w, h);
export const SCREEN_FACE = { x: 50, y: 62, w: 86, h: 56 } as const;

// ── SHELF END ────────────────────────────────────────────────────────────────
//
// REFERENCE. The end of a run of supermarket shelving: two white UPRIGHTS, a back
// panel in shade, a header along the top, four SHELVES each with a white PRICE STRIP
// clipped to its front edge, and a kick plate at the floor. The jars on it are the
// scene's to place, so one can be missing and one put back.
const SHELF_LEVELS = [20.3, 42.2, 62.5, 82.8];
const SHELF_END: ObjPart[] = [
  ...p2N('casing',
    oRect('mass', 5, 50, 10, 100, 0, 1),                         // the uprights
    oRect('mass', 95, 50, 10, 100, 0, 1),
    oRect('mass', 50, 4, 100, 8, 0, 1),                          // the header
    oRect('mass', 50, 95.5, 100, 9, 0, 1),                       // the kick plate
    oRect('dark', 50, 50, 80, 82),                               // the back panel, in shade
    ...SHELF_LEVELS.map((y) => oRect('mass', 50, y, 82, 2.4)),   // the shelves
    oBar('dark', 97, 9, 97, 91, 4),                              // the far upright's shaded edge
  ),
  ...SHELF_LEVELS.map((y) => oRect('lit', 50, y + 2.6, 80, 2.4)),  // the price strips
  ...SHELF_LEVELS.flatMap((y) => [26, 58, 82].map((x) => oRect('line', x, y + 2.6, 6, 1.2))), // prices on them
];
export const shelfEnd = (x: number, y: number, w: number, h: number) => fit(SHELF_END, x, y, w, h);

// ── SHOPPING LIST ────────────────────────────────────────────────────────────
//
// REFERENCE. A shopping list is a slip torn off a notepad, a little taller than wide,
// with a few short handwritten lines and items crossed off. The lines of different
// lengths are the field mark; a blank slip is a ticket.
const SHOPPING_LIST: ObjPart[] = [
  ...p2N('paper', oRect('mass', 48, 52, 90, 92, 0, 3)),
  ...p2N('paper', oBar('dark', 92, 10, 92, 96, 6)),              // its curled edge, in shade
  ...[[22, 70], [36, 54], [50, 74], [64, 46], [78, 62]].map(([y, w]) => oBar('line', 14, y, 14 + w, y, 4)),
  oBar('line', 12, 50, 60, 50, 3),                               // an item crossed off
];
export const shoppingList = (x: number, y: number, w: number, h: number) => fit(SHOPPING_LIST, x, y, w, h);

// ── psych2: objects for this lesson go ABOVE this line ──

// ─────────────────────────────────────────────────────────────────────────────
// THE KITCHEN AT THREE O'CLOCK, for Personal Growth lesson 2 (2026-09-30). Drawn
// against pictures fetched with `node scripts/get-reference.mjs` (scratchpad/ref/g2-*):
// a white jug kettle on a worktop, a kitchen wall clock, a glass biscuit jar of
// shortbread, a fitted kitchen of base units under a tiled splashback, a turned
// wooden kitchen chair, a mug of tea beside a plate, a bowl of apples and pears, and a
// chocolate bar in its wrapper.
// ─────────────────────────────────────────────────────────────────────────────

/** Parts in one named real colour, where an object is more than one material. */
const g2 = (k: NaturalKey, ...ps: ObjPart[]): ObjPart[] => ps.map((p) => ({ ...p, nat: k }));

// ── KITCHEN UNIT ─────────────────────────────────────────────────────────────
//
// REFERENCE. A fitted kitchen's base run is a thick WORKTOP that overhangs the units
// at the front, a row of DRAWERS under it, DOORS below the drawers, each with a bar
// HANDLE, and a recessed KICKBOARD at the floor. The worktop's overhang and the
// drawer-over-door rhythm are what say kitchen rather than sideboard. Worktop in pale
// beech; the doors and drawers painted a pale blue-grey (AR1), the kickboard their shade.
const KITCHEN_UNIT: ObjPart[] = [
  ...g2('cupboard', oRect('mass', 50, 56, 96, 80, 0, 1)),          // the carcass
  ...g2('cupboard', oRect('face', 95, 56, 6, 80, 0, 1)),           // its end, turned from the lamp
  ...g2('cupboard', oRect('dark', 50, 96.5, 90, 7)),               // the kickboard, set back
  ...g2('beech', oRect('mass', 50, 7, 100, 14, 0, 1.5)),           // the worktop, proud of the front
  ...g2('beech', oRect('dark', 50, 15.5, 96, 3)),                  // and its shadow on the units
  oBar('line', 4, 36, 96, 36, 1.4),                                // the drawers over the doors
  oBar('line', 34, 17, 34, 92, 1.4),                               // the gaps between the units
  oBar('line', 66, 17, 66, 92, 1.4),
  oBar('line', 11, 26, 23, 26, 2.6), oBar('line', 44, 26, 56, 26, 2.6), oBar('line', 77, 26, 89, 26, 2.6), // drawer handles
  oBar('line', 28, 46, 28, 58, 2.6), oBar('line', 40, 46, 40, 58, 2.6), oBar('line', 72, 46, 72, 58, 2.6), // door handles
  oBar('lit', 3, 1.5, 97, 1.5, 1.2),                               // the lamp along the worktop's edge
];
export const kitchenUnit = (x: number, y: number, w: number, h: number) => fit(KITCHEN_UNIT, x, y, w, h);

// ── SPLASHBACK ───────────────────────────────────────────────────────────────
//
// REFERENCE. The wall over a worktop is TILED: rows of oblong glazed tiles laid like
// bricks, each row's joints staggered half a tile from the last, the grout a shade
// darker than the glaze. The stagger is the field mark — a square grid is a bathroom
// or graph paper.
const SPLASHBACK: ObjPart[] = [
  ...g2('tile', oRect('mass', 50, 50, 100, 100)),
  ...g2('tile', ...[25, 50, 75].map((y) => oBar('dark', 1, y, 99, y, 1.6))),
  ...g2('tile', ...[0, 1, 2, 3].flatMap((r) => (r % 2 ? [12.5, 37.5, 62.5, 87.5] : [25, 50, 75])
    .map((x) => oBar('dark', x, r * 25 + 1.5, x, r * 25 + 23.5, 1.6)))),
  ...g2('tile', oRect('dark', 97.5, 50, 5, 100)),                  // the end turned from the lamp
];
export const splashback = (x: number, y: number, w: number, h: number) => fit(SPLASHBACK, x, y, w, h);

// ── WALL CLOCK ───────────────────────────────────────────────────────────────
//
// REFERENCE. A kitchen wall clock is a round white DIAL in a raised RIM, marked with
// twelve hour TICKS, the four quarters heavier than the rest. The hands are the
// scene's to draw, because they move. Drawn in a square: a clock is a circle. Its rim
// painted red (AR1), as a kitchen clock's often is.
const WALL_CLOCK: ObjPart[] = [
  ...g2('clockRed', oEll('mass', 50, 50, 98, 98)),                 // the rim
  ...g2('clockRed', oEll('dark', 54, 54, 90, 90)),                 // its inner edge, in shade
  oEll('lit', 50, 50, 82, 82),                                     // the dial
  ...Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2;
    const r0 = i % 3 === 0 ? 27 : 31;
    return oBar('line', 50 + Math.sin(a) * r0, 50 - Math.cos(a) * r0, 50 + Math.sin(a) * 36, 50 - Math.cos(a) * 36, i % 3 === 0 ? 5 : 2.6);
  }),
];
export const wallClock = (x: number, y: number, w: number, h: number) => fit(WALL_CLOCK, x, y, w, h);

// ── KETTLE ───────────────────────────────────────────────────────────────────
//
// REFERENCE. A jug kettle is a tall body that FLARES toward its foot, a domed LID on
// top, a pointed POURING LIP at the front of the rim, and a big loop HANDLE at the
// back with the switch under its top; a WATER WINDOW down the side and a power base
// under it. The lip and the loop are the field marks — without them it is a jug or a
// vase. Spout to the left, handle to the right; brushed steel.
const KETTLE: ObjPart[] = [
  oBar('mass', 70, 30, 90, 34, 8),                                 // the loop handle, at the back
  oBar('mass', 90, 34, 90, 70, 8),
  oBar('mass', 90, 70, 72, 80, 8),
  ...trapezoid('mass', 44, 58, 60, 74, 66),                        // the body, flaring to its foot
  oEll('mass', 44, 25, 60, 16),                                    // the domed lid
  oTri('mass', 11, 28, 18, 14, 'left'),                            // the pouring lip
  oRect('face', 44, 95, 80, 8, 0, 2),                              // the power base, in shade
  oBar('dark', 70, 32, 77, 88, 7),                                 // the flank turned from the lamp
  oEll('dark', 36, 60, 10, 32),                                    // the water window
  oRect('line', 84, 31, 9, 5, 0, 1),                               // the switch under the handle
  oBar('lit', 22, 40, 20, 84, 3),                                  // the lamp's sheen on the steel
];
export const kettle = (x: number, y: number, w: number, h: number) => fit(tint(KETTLE, 'silver'), x, y, w, h);

// ── MUG ──────────────────────────────────────────────────────────────────────
//
// REFERENCE. A mug is a straight-sided CYLINDER, not the tapered cup on a saucer: a
// thick rim seen as an ellipse from a little above with the TEA in it, a heavy
// D-shaped handle standing clear of the side, and a flat foot. The straight sides
// and the handle's size are what separate it from a teacup.
const MUG: ObjPart[] = [
  ...g2('mugGlaze',
    oBar('mass', 70, 34, 90, 36, 8),                               // the handle, a D standing clear
    oBar('mass', 90, 36, 90, 66, 8),
    oBar('mass', 90, 66, 70, 72, 8),
    oRect('mass', 42, 58, 64, 78, 0, 5),                           // the body, straight-sided
    oEll('mass', 42, 20, 64, 14),                                  // its rim, from a little above
    oRect('dark', 66, 60, 10, 72, 0, 3),                           // the side turned from the lamp
  ),
  ...g2('tea', oEll('mass', 42, 21, 52, 9)),                       // the tea in it
  oBar('lit', 20, 32, 20, 82, 4),                                  // the glaze's shine
];
export const mug = (x: number, y: number, w: number, h: number) => fit(MUG, x, y, w, h);

// ── BISCUIT JAR ──────────────────────────────────────────────────────────────
//
// REFERENCE. A biscuit jar is a squat GLASS drum with a wide NECK at its shoulder,
// and the biscuits show THROUGH it, stacked on edge in rows, each a pale disc with a
// darker rim. Seeing them is the point — a jar you cannot see into is a tin. Its LID
// is its own object (`jarLid`), because it lifts. Glass, holding golden biscuits.
const BISCUIT_JAR: ObjPart[] = [
  ...g2('glass',
    oRect('mass', 50, 60, 92, 76, 0, 9),                           // the jar
    oRect('mass', 50, 20, 74, 10, 0, 2),                           // its neck at the shoulder
    oRect('dark', 89, 60, 10, 68, 0, 4),                           // the glass turned from the lamp
  ),
  ...g2('biscuit', ...[[24, 86], [50, 86], [76, 86], [37, 68], [63, 68], [26, 50], [52, 50], [75, 52], [42, 34]]
    .flatMap(([x, y]) => [oEll('mass', x, y, 24, 18), oEll('dark', x + 3, y + 2, 10, 6)])),
  oBar('lit', 13, 32, 13, 88, 4),                                  // the glass catching the lamp
];
export const biscuitJar = (x: number, y: number, w: number, h: number) => fit(BISCUIT_JAR, x, y, w, h);

// ── JAR LID ──────────────────────────────────────────────────────────────────
//
// REFERENCE. A clip-top jar's lid is a thick glass DISC with a KNOB on top, hinged at
// the back on a wire clip, so it swings up and stays open rather than being lifted
// off. The HINGE is at (96, 70) in this square, the point a scene turns it about.
const JAR_LID: ObjPart[] = [
  ...g2('glass',
    oRect('mass', 50, 70, 96, 30, 0, 6),                           // the glass disc
    oEll('mass', 50, 34, 28, 28),                                  // its knob
    oRect('dark', 50, 82, 90, 6, 0, 2),                            // its underside
  ),
  oBar('line', 96, 56, 96, 92, 4),                                 // the wire of the clip
  oBar('lit', 12, 64, 50, 64, 3),                                  // the lamp along its top
];
export const jarLid = (x: number, y: number, w: number, h: number) => fit(JAR_LID, x, y, w, h);
/** The lid's hinge, in its authoring square. */
export const LID_HINGE = { x: 96, y: 70 } as const;

// ── BISCUIT ──────────────────────────────────────────────────────────────────
//
// REFERENCE. A digestive biscuit is a round, flat, golden disc with a slightly darker
// baked RIM and a pattern of DOCKING HOLES pricked across its face. The holes are
// what make it a biscuit rather than a coin.
const BISCUIT: ObjPart[] = [
  ...g2('biscuit', oEll('mass', 50, 50, 96, 96), oEll('dark', 54, 54, 80, 80), oEll('mass', 47, 47, 76, 76)),
  ...[[36, 38], [58, 34], [44, 58], [66, 56], [52, 74]].map(([x, y]) => oEll('line', x, y, 7, 7)),
];
export const biscuit = (x: number, y: number, w: number, h: number) => fit(BISCUIT, x, y, w, h);

// ── KITCHEN CHAIR ────────────────────────────────────────────────────────────
//
// REFERENCE. A turned kitchen chair seen from the SIDE is an h: the back legs run on
// up past the seat as the back POSTS, raked back a little and capped with a FINIAL;
// the SEAT is a thick slab; the front leg is a separate turned leg; a STRETCHER
// braces the legs low down. A slatted back panel shows between the posts in a
// three-quarter view. The posts rising past the seat are the field mark — without
// them it is a stool. Back to the LEFT; `back: 'right'` mirrors it.
const KITCHEN_CHAIR: ObjPart[] = [
  oBar('mass', 22, 62, 14, 100, 6),                                // the back leg …
  oBar('mass', 22, 62, 16, 6, 6),                                  // … running up into the back post
  oEll('mass', 16, 4, 9, 8),                                       // and its finial
  oRect('mass', 24, 30, 14, 34, -6, 2),                            // the back panel, a little turned
  oBar('dark', 21, 20, 23, 42, 2), oBar('dark', 27, 19, 29, 41, 2), // its slats
  oBar('mass', 80, 68, 84, 100, 6),                                // the front leg
  oRect('mass', 50, 63, 84, 8, 0, 2),                              // the seat
  oRect('face', 52, 69, 80, 4, 0, 1),                              // its edge, under the lamp
  oBar('mass', 18, 86, 82, 86, 3.6),                               // the stretcher
  oBar('lit', 12, 60, 86, 60, 1.6),                                // the seat's lit top
];
function mirrorX(parts: readonly ObjPart[]): ObjPart[] {
  return parts.map((p) => {
    if (p.k === 'bar') return { ...p, x1: 100 - p.x1, x2: 100 - p.x2 };
    if (p.k === 'tri') return { ...p, x: 100 - p.x, rot: -p.rot, dir: p.dir === 'left' ? 'right' : p.dir === 'right' ? 'left' : p.dir };
    return { ...p, x: 100 - p.x, rot: -p.rot } as ObjPart;
  });
}
export const kitchenChair = (x: number, y: number, w: number, h: number, back: 'left' | 'right' = 'left') =>
  fit(tint(back === 'left' ? KITCHEN_CHAIR : mirrorX(KITCHEN_CHAIR), 'wood'), x, y, w, h);
/** The seat's top, in the chair's authoring square. */
export const CHAIR_SEAT_Y = 59;

// ── FRUIT BOWL ───────────────────────────────────────────────────────────────
//
// REFERENCE. A fruit bowl is a deep round BOWL on a low FOOT, its rim seen as an
// ellipse from above with the inside in shadow, and the fruit sitting IN it — piled
// above the rim, their lower halves hidden by the bowl's front wall. So it is two
// objects: `fruitBowl` (the whole bowl, inside included) drawn under the fruit, and
// `fruitBowlFront` (its front wall) drawn over them. Glazed blue (AR1), like the mug.
const BOWL_FRONT: ObjPart[] = [
  ...g2('bowlGlaze', ...trapezoid('mass', 50, 52, 96, 60, 36)),    // the bowl's wall, narrowing down
  ...g2('bowlGlaze', oRect('mass', 50, 78, 40, 14, 0, 2)),         // its foot
  ...g2('bowlGlaze', oRect('dark', 50, 70, 54, 6)),                // the shadow under its belly
  ...g2('bowlGlaze', oBar('dark', 82, 40, 70, 66, 7)),             // the side turned from the lamp
  oBar('lit', 4, 35, 96, 35, 2.2),                                 // its rim, catching the lamp
];
const BOWL: ObjPart[] = [
  ...g2('bowlGlaze', oEll('mass', 50, 34, 98, 20)),                // the rim, from above
  ...g2('bowlGlaze', oEll('dark', 50, 33, 86, 14)),                // and the inside, in shadow
  ...BOWL_FRONT,
];
export const fruitBowl = (x: number, y: number, w: number, h: number) => fit(BOWL, x, y, w, h);
export const fruitBowlFront = (x: number, y: number, w: number, h: number) => fit(BOWL_FRONT, x, y, w, h);

// ── CHOCOLATE BAR ────────────────────────────────────────────────────────────
//
// REFERENCE. A chocolate bar is a long flat bar in a coloured WRAPPER, its two ends
// crimped shut in FOIL with the pleats of the crimp across them, and a band of print
// across the middle. The crimped ends are the field mark: a plain oblong is a box or
// a brick. Purple, in silver foil.
const CHOCOLATE_BAR: ObjPart[] = [
  ...g2('silver', oRect('mass', 8, 50, 16, 64, 0, 2), oRect('mass', 92, 50, 16, 64, 0, 2)),
  ...g2('wrapper', oRect('mass', 50, 50, 72, 76, 0, 3), oRect('dark', 50, 80, 70, 14)),
  ...[3, 8, 13].map((x) => oBar('line', x, 22, x, 78, 1.8)),       // the crimp's pleats
  ...[87, 92, 97].map((x) => oBar('line', x, 22, x, 78, 1.8)),
  oRect('lit', 50, 44, 34, 26, 0, 3),                              // the label printed across it
];
export const chocolateBar = (x: number, y: number, w: number, h: number) => fit(CHOCOLATE_BAR, x, y, w, h);

// ── NOTEPAD ──────────────────────────────────────────────────────────────────
//
// REFERENCE. A reporter's notepad is a stack of ruled PAPER bound along the top by a
// SPIRAL of wire, the loops standing proud of the top edge, with a card back showing
// as an edge under the pages. The spiral is what says notepad rather than a sheet. The
// tally marks on it are the scene's, because one is added.
const NOTEPAD: ObjPart[] = [
  ...g2('padBack', oRect('face', 52, 54, 96, 88, 0, 2)),           // the card back, edged in shade
  ...g2('paper', oRect('mass', 48, 52, 92, 88, 0, 2)),             // the pages
  ...[30, 44, 58, 72, 86].map((y) => g2('paper', oBar('dark', 8, y, 88, y, 1.2))[0]), // ruled lines
  ...[16, 32, 48, 64, 80].map((x) => oEll('line', x, 9, 7, 12)),   // the spiral's loops
];
export const notepad = (x: number, y: number, w: number, h: number) => fit(NOTEPAD, x, y, w, h);

// ── PENCIL ───────────────────────────────────────────────────────────────────
//
// REFERENCE. A pencil is a long yellow HEXAGONAL shaft (its facets show as stripes
// along it), sharpened at one end to a cone of bare WOOD with the dark LEAD at its
// point. Drawn lying, point to the left.
const PENCIL: ObjPart[] = [
  ...g2('lemon', oRect('mass', 60, 50, 76, 44, 0, 2), oBar('dark', 24, 64, 96, 64, 9)),
  ...g2('beech', oTri('mass', 13, 50, 22, 44, 'left')),
  oTri('line', 4, 50, 8, 16, 'left'),                              // the lead at the point
  oRect('line', 98, 50, 4, 44),                                    // the ferrule's edge
];
export const pencil = (x: number, y: number, w: number, h: number) => fit(PENCIL, x, y, w, h);

// ── KITCHEN WINDOW ───────────────────────────────────────────────────────────
//
// The library's `window` (reference above it: a frame, four panes on a mullion and a
// transom, a projecting sill), in the colours it is (AR1): a white-painted frame and
// sill, and the afternoon sky in the glass.
const KITCHEN_WINDOW: ObjPart[] = WINDOW.map((p) => (
  p.role === 'lit' ? { ...p, role: 'dark', nat: 'skyPane' } as ObjPart
    : p.role === 'mass' || p.role === 'dark' ? { ...p, nat: 'sashWhite' } as ObjPart : p
));
export const kitchenWindow = (x: number, y: number, w: number, h: number) => fit(KITCHEN_WINDOW, x, y, w, h);

// ── growth2: objects for this lesson go ABOVE this line ──

// ─────────────────────────────────────────────────────────────────────────────
// THE BAKERY AT DAWN, for Business lesson 2 (2026-09-30). Drawn against pictures
// fetched with `node scripts/get-reference.mjs` (scratchpad/ref/b2-*): pink macarons on
// a white plate, bakery sausage rolls (a British puff-pastry roll and a tray of them), a
// stainless modular deck oven, a Brown Betty teapot, a crystal ball on its turned stand,
// a Victoria sponge on a pedestal stand, a tower crane against the sky, and a bakery's
// panelled serving counter.
// ─────────────────────────────────────────────────────────────────────────────

/** Parts in one named real colour (AP11). */
const b2N = (k: NaturalKey, ...ps: ObjPart[]): ObjPart[] => ps.map((p) => ({ ...p, nat: k }));
/**
 * Author a drawing in its OWN proportions — an ax × ay box in real units — and hand it
 * to `fit` as the 100-square. Laid into a box of the same shape it comes out uniform, so
 * a macaron 7 wide stays a macaron rather than a stretched lozenge.
 */
function b2In(ax: number, ay: number, parts: readonly ObjPart[]): ObjPart[] {
  const sx = 100 / ax;
  const sy = 100 / ay;
  const s = 100 / Math.min(ax, ay);
  return parts.map((p) => {
    if (p.k === 'bar') return { ...p, x1: p.x1 * sx, y1: p.y1 * sy, x2: p.x2 * sx, y2: p.y2 * sy, t: p.t * s };
    return { ...p, x: p.x * sx, y: p.y * sy, w: p.w * sx, h: p.h * sy, ...(p.k === 'rect' ? { rad: p.rad * s } : null) } as ObjPart;
  });
}

// ── DECK OVEN ────────────────────────────────────────────────────────────────
//
// REFERENCE. A baker's deck oven is a stainless BOX with a hood along its top, one or
// more wide low DECKS stacked in it, each closed by a door with a smoked-glass WINDOW
// and a bar HANDLE along its top, and a CONTROL column down one side with dials. The
// wide low door with a window and the bar handle are the field marks: a tall door is a
// fridge. In real units, 62 × 88; the upper deck's door is its own object (`ovenDoor`),
// because it opens, and the deck's mouth under it is at `OVEN_MOUTH`.
const DECK_OVEN: ObjPart[] = b2In(62, 88, [
  ...b2N('silver',
    oRect('mass', 31, 47, 60, 82, 0, 1.5),                         // the body
    oRect('mass', 31, 4, 62, 8, 0, 1.5),                           // the hood along its top
    oRect('face', 31, 9, 58, 2.5),                                 // the hood's underside, in shade
    oRect('dark', 7.5, 48, 9, 74, 0, 1),                           // the control column, set in
    oRect('face', 58.8, 48, 3, 78),                                // the side turned from the lamp
  ),
  ...b2N('felt', oRect('dark', 37, 32, 42, 30, 0, 1)),             // the upper deck's mouth
  ...b2N('silver',
    oRect('mass', 37, 70, 42, 30, 0, 1.5),                         // the lower deck's door
  ),
  ...b2N('ovenGlass', oRect('dark', 37, 72, 32, 18, 0, 1)),        // and its window
  oBar('line', 21, 59, 53, 59, 2),                                 // its handle
  oEll('lit', 7.5, 22, 5, 5), oEll('lit', 7.5, 33, 5, 5), oEll('lit', 7.5, 62, 5, 5),   // the dials
  oBar('line', 7.5, 22, 9.1, 20.4, 1), oBar('line', 7.5, 33, 5.9, 31.4, 1), oBar('line', 7.5, 62, 9.1, 60.4, 1),
  oBar('lit', 14, 14, 14, 84, 1.2),                                // the lamp down the steel
]);
export const deckOven = (x: number, y: number, w: number, h: number) => fit(DECK_OVEN, x, y, w, h);
/** The upper deck's mouth, in the oven's real units (62 × 88): centre and size. */
export const OVEN_MOUTH = { x: 37, y: 32, w: 42, h: 30 } as const;

// ── OVEN DOOR ────────────────────────────────────────────────────────────────
//
// REFERENCE. The deck door is a steel FRAME round a smoked-glass WINDOW, with a bar
// HANDLE standing off its top edge. It drops open on a hinge along its foot.
const OVEN_DOOR: ObjPart[] = b2In(42, 30, [
  ...b2N('silver', oRect('mass', 21, 16, 42, 28, 0, 1.5)),
  ...b2N('ovenGlass', oRect('dark', 21, 17.5, 32, 16, 0, 1)),
  oBar('line', 5, 4, 37, 4, 2),                                    // the handle
  oBar('lit', 8, 12, 14, 12, 1.2),                                 // the lamp on the glass
]);
export const ovenDoor = (x: number, y: number, w: number, h: number) => fit(OVEN_DOOR, x, y, w, h);

// ── MACARONS ─────────────────────────────────────────────────────────────────
//
// REFERENCE. A macaron seen from the side is two smooth domed SHELLS, flat side in,
// with a band of FILLING between them and a ruffled foot at each shell's rim. The cream
// stripe across the middle is the field mark: without it the same shape is a bun. Laid
// out for sale they sit in ROWS on a white plate, the back row higher than the front.
function b2Macaron(cx: number, cy: number): ObjPart[] {
  return [
    ...b2N('macaron',
      oEll('mass', cx, cy - 1.45, 7, 3.1),                         // the top shell
      oEll('mass', cx, cy + 1.45, 7, 2.9),                         // the bottom shell
      oEll('dark', cx + 1.4, cy + 2.1, 3.6, 1.1),                  // its underside, from the lamp
    ),
    oRect('lit', cx, cy + 0.1, 6.2, 1.15, 0, 0.5),                 // the cream between them
  ];
}
const MACARON_TRAY: ObjPart[] = b2In(40, 13, [
  ...[9.75, 17.25, 24.75, 32.25].flatMap((x) => b2Macaron(x, 4.6)),   // the back row
  ...[6, 13.5, 21, 28.5].flatMap((x) => b2Macaron(x, 7.4)),           // the front row, one gap left
  ...b2N('porcelain',
    oRect('mass', 20, 11.2, 40, 2.8, 0, 1.2),                      // the white plate's rim
    oRect('face', 20, 12.4, 37, 1.2),                              // and its edge in shade
  ),
]);
export const macaronTray = (x: number, y: number, w: number, h: number) => fit(MACARON_TRAY, x, y, w, h);
/** The gap left in the front row, in the tray's real units (40 × 13). */
export const MACARON_GAP = { x: 36, y: 7.4 } as const;
const MACARON: ObjPart[] = b2In(7, 6, b2Macaron(3.5, 3));
export const macaron = (x: number, y: number, w: number, h: number) => fit(MACARON, x, y, w, h);

// ── SAUSAGE ROLLS ON A BAKING SHEET ──────────────────────────────────────────
//
// REFERENCE. A British sausage roll is a LOG of puff pastry, rolled round the meat and
// sealed underneath, its top SCORED with slanting cuts and glazed gold, and at each cut
// end the sausage meat shows as a round brown face. The scores and the meat at the end
// are the field marks: without them it is a bread roll. They come out of the oven in a
// row on a steel baking sheet with a turned-up rim. Unbaked, the pastry is pale.
function b2Rolls(crust: NaturalKey): ObjPart[] {
  return [
    ...[7.5, 19, 30.5].flatMap((cx) => [
      ...b2N(crust,
        oRect('mass', cx, 5.2, 10.4, 5.2, 0, 2.4),                 // the log of pastry
        oRect('dark', cx + 0.4, 7.2, 9.4, 1.2, 0, 0.6),            // its sealed underside
      ),
      ...b2N('sausage', oEll('mass', cx + 4.7, 5.3, 1.8, 3.2)),    // the meat at the cut end
      ...b2N(crust,
        oBar('dark', cx - 3, 6.2, cx - 1.8, 3.4, 0.7),             // the slanting scores
        oBar('dark', cx - 0.4, 6.2, cx + 0.8, 3.4, 0.7),
        oBar('dark', cx + 2.2, 6.2, cx + 3.4, 3.4, 0.7),
      ),
      oBar('lit', cx - 3.6, 3.4, cx - 1.6, 2.9, 0.7),              // the glaze catching the lamp
    ]),
    ...b2N('iron',
      oRect('mass', 19, 9.3, 38, 1.8, 0, 0.6),                     // the baking sheet
      oRect('mass', 0.8, 8.4, 1.6, 3.4, 0, 0.6),                   // its turned-up rim
      oRect('mass', 37.2, 8.4, 1.6, 3.4, 0, 0.6),
    ),
  ];
}
export const rollTray = (x: number, y: number, w: number, h: number) => fit(b2In(38, 10.5, b2Rolls('crust')), x, y, w, h);
export const rollTrayRaw = (x: number, y: number, w: number, h: number) => fit(b2In(38, 10.5, b2Rolls('pastryRaw')), x, y, w, h);
/** One roll, on its own, for the one handed over the counter. */
export const sausageRoll = (x: number, y: number, w: number, h: number) =>
  fit(b2In(12, 6, b2Rolls('crust').slice(0, 7).map((p) => {
    if (p.k === 'bar') return { ...p, x1: p.x1 - 1.5, y1: p.y1 - 2.2, x2: p.x2 - 1.5, y2: p.y2 - 2.2 };
    return { ...p, x: p.x - 1.5, y: p.y - 2.2 } as ObjPart;
  })), x, y, w, h);

// ── CAKE ON A STAND ──────────────────────────────────────────────────────────
//
// REFERENCE. A sponge on a cake stand is a round PLATE on a single turned COLUMN that
// flares to a round FOOT, and on it the cake in LAYERS — sponge, a stripe of jam and
// cream, sponge — under a cap of icing, with a cherry on top. The stand lifting it off
// the counter and the stripe through the middle are what say cake rather than a hat box.
// Iced in the same pastel pink as the macarons, because it is what the baker likes.
const CAKE_STAND: ObjPart[] = b2In(26, 28, [
  ...b2N('silver',
    ...trapezoid('mass', 13, 26.5, 7, 14, 3),                      // the foot, flaring
    oRect('mass', 13, 21.6, 3, 7),                                 // the column
    oRect('mass', 13, 17.2, 26, 2.2, 0, 1),                        // the plate
    oRect('face', 13, 18.6, 22, 1),                                // its underside
  ),
  ...b2N('biscuit',
    oRect('mass', 13, 13.8, 21, 4.6, 0, 1),                        // the bottom sponge
    oRect('mass', 13, 8.6, 21, 3.8, 0, 1),                         // the top sponge
    oRect('dark', 21.8, 11.4, 3, 9),                               // the side turned from the lamp
  ),
  ...b2N('jam', oRect('mass', 13, 11.1, 21, 1.3)),                 // the jam
  oRect('lit', 13, 10.3, 21, 0.8),                                 // and the cream on it
  ...b2N('macaron',
    oRect('mass', 13, 5.4, 22.4, 3.4, 0, 1.6),                     // the icing cap
    oEll('mass', 5.5, 7.4, 2.2, 2.8), oEll('mass', 11, 7.6, 2.2, 3.2), oEll('mass', 17.5, 7.3, 2.2, 2.6),   // its drips
  ),
  ...b2N('apple', oEll('mass', 13, 2.4, 3.6, 3.4)),               // the cherry
  oBar('line', 13.4, 1, 14.8, -1.2, 0.6),                          // and its stalk
  oBar('lit', 4, 4.6, 9, 4.2, 0.8),                                // the icing catching the lamp
]);
export const cakeStand = (x: number, y: number, w: number, h: number) => fit(CAKE_STAND, x, y, w, h);

// ── TEAPOT ───────────────────────────────────────────────────────────────────
//
// REFERENCE. A Brown Betty is a round-bellied pot in a dark treacle GLAZE, a short LID
// with a KNOB, a SPOUT rising from low on one side and a loop HANDLE on the other. The
// spout and the loop either side of a round belly are the field marks: a belly alone is
// a jar. Spout to the left, handle to the right — it is held by the handle (`TEAPOT_GRIP`).
const TEAPOT: ObjPart[] = b2In(20, 14, [
  ...b2N('teapotGlaze',
    oBar('mass', 15.6, 5.2, 18.4, 6.2, 1.5),                       // the loop handle
    oBar('mass', 18.4, 6.2, 18.2, 10, 1.5),
    oBar('mass', 18.2, 10, 15.4, 11.2, 1.5),
    oBar('mass', 5, 9.6, 1, 4.6, 2.2),                             // the spout, rising
    oEll('mass', 10, 8.6, 13, 10.6),                               // the round belly
    oEll('mass', 10, 3.6, 8.4, 2.6),                               // the lid
    oEll('mass', 10, 1.9, 2.4, 2),                                 // its knob
    oEll('dark', 13.2, 10.2, 5, 5.4),                              // the belly turned from the lamp
  ),
  oBar('lit', 4.2, 7.2, 15.8, 7.2, 0.7),                           // the cream band round it
  oBar('lit', 6.4, 5.4, 8.4, 4.9, 0.8),                            // the glaze catching the lamp
]);
export const teapot = (x: number, y: number, w: number, h: number) => fit(TEAPOT, x, y, w, h);
/** Where a hand holds it (the handle) and where tea leaves it (the spout's tip), in real units (20 × 14). */
export const TEAPOT_GRIP = { x: 18.2, y: 8 } as const;
export const TEAPOT_SPOUT = { x: 1, y: 4.6 } as const;

// ── TEACUP ───────────────────────────────────────────────────────────────────
//
// REFERENCE. A teacup is white china on a SAUCER: a bowl wider at the rim than at its
// foot, a ring handle, and the TEA showing in the rim from a little above. Smaller and
// shallower than a mug, which is the whole joke of the lesson's second half.
const TEACUP: ObjPart[] = b2In(12, 8, [
  oBar('line', 9.2, 3, 11, 3.4, 1), oBar('line', 11, 3.4, 10.6, 5.2, 1), oBar('line', 10.6, 5.2, 8.8, 5.6, 1),
  ...b2N('porcelain',
    oEll('mass', 6, 7, 12, 2),                                     // the saucer
    ...trapezoid('mass', 5.6, 4.4, 7.6, 5, 4.2),                   // the cup, narrowing to its foot
    oEll('mass', 5.6, 2.3, 7.6, 1.8),                              // its rim
  ),
  ...b2N('tea', oEll('mass', 5.6, 2.4, 6, 1.1)),                   // and the tea in it
]);
export const teacup = (x: number, y: number, w: number, h: number) => fit(TEACUP, x, y, w, h);

// ── RECIPE BOOK ──────────────────────────────────────────────────────────────
//
// REFERENCE. A cookery book stood on a shelf face-out is a hardback in a cloth COVER,
// a rounded SPINE down its left edge, the PAGE BLOCK showing as a pale band down its
// right, and a printed LABEL on the cover with the title. The page edge is what says
// book rather than box.
const RECIPE_BOOK: ObjPart[] = b2In(18, 24, [
  ...b2N('paper', oRect('mass', 15.8, 12.6, 3.4, 21.6, 0, 0.6)),   // the page block, at the fore-edge
  ...b2N('bookCloth',
    oRect('mass', 8.6, 12, 16, 24, 0, 1.2),                        // the cover
    oRect('dark', 1.6, 12, 2.6, 23.4, 0, 1),                       // the spine, rounded away
  ),
  oRect('lit', 9.4, 9.4, 10.4, 7.4, 0, 0.8),                       // the label
  oBar('line', 6.2, 8.2, 12.6, 8.2, 1.1),                          // its title
  oBar('line', 6.8, 10.8, 12, 10.8, 0.8),
  oBar('lit', 3.6, 18.6, 13.6, 18.6, 0.8),                         // a band blocked on the cloth
]);
export const recipeBook = (x: number, y: number, w: number, h: number) => fit(RECIPE_BOOK, x, y, w, h);

// ── CRYSTAL BALL ─────────────────────────────────────────────────────────────
//
// REFERENCE. A fortune-teller's crystal ball is a clear glass SPHERE sitting in a
// cup-shaped COLLAR on a turned STAND. The sphere shows a bright window-shaped
// HIGHLIGHT and a cloud of mist inside. The highlight is what says glass rather than a
// ball; the collar and stand are what say crystal ball rather than a bauble.
const CRYSTAL_BALL: ObjPart[] = b2In(18, 24, [
  ...b2N('wood',
    ...trapezoid('mass', 9, 21.6, 8, 15, 4.4),                     // the turned stand
    oRect('face', 9, 23.4, 15, 1.2),
    oEll('mass', 9, 17.6, 10.6, 3.4),                              // the collar the ball sits in
  ),
  ...b2N('crystal',
    oEll('mass', 9, 9.4, 16.4, 16.4),                              // the glass sphere
    oEll('dark', 11.2, 11.6, 8.6, 6.4, -20),                       // the mist inside it
  ),
  oEll('lit', 5.6, 5.8, 3, 4.6, 30),                               // the window caught in the glass
  oEll('lit', 8.6, 3.6, 1.4, 1.4),
]);
export const crystalBall = (x: number, y: number, w: number, h: number) => fit(CRYSTAL_BALL, x, y, w, h);

// ── WALL SHELF ───────────────────────────────────────────────────────────────
//
// REFERENCE. A shop's wall shelf is a thick PLANK on two iron BRACKETS — an upright
// against the wall and a brace up to the plank's underside. The brace is what holds it
// up, so without it a plank on a wall is floating.
const WALL_SHELF: ObjPart[] = b2In(74, 12, [
  ...b2N('iron',
    oBar('mass', 10, 4, 10, 11.4, 1.4),                            // the brackets' uprights
    oBar('mass', 10, 10.6, 16, 4, 1.2),                            // and their braces
    oBar('mass', 64, 4, 64, 11.4, 1.4),
    oBar('mass', 64, 10.6, 58, 4, 1.2),
  ),
  ...b2N('wood',
    oRect('mass', 37, 2.2, 74, 3.6, 0, 0.8),                       // the plank
    oRect('face', 37, 4.4, 72, 1),                                 // its edge, in shade
  ),
]);
export const wallShelf = (x: number, y: number, w: number, h: number) => fit(WALL_SHELF, x, y, w, h);

// ── SHOP WINDOW AT DAWN, AND THE SITE NEXT DOOR ──────────────────────────────
//
// REFERENCE. A shop window is a painted FRAME split by a MULLION and a TRANSOM, with a
// projecting SILL. Through it, at dawn, the sky is pale and gold low down and warmer
// higher up, the sun is a half disc on the skyline, and the building site next door is
// told by its TOWER CRANE: a lattice MAST, a long horizontal JIB, a short counter-jib
// with its weights, a peak with tie lines, and a hook hanging on its cable. The crane
// is drawn in silhouette, as a crane at dawn is.
const DAWN_WINDOW: ObjPart[] = b2In(86, 82, [
  ...b2N('duckEgg', oRect('mass', 43, 38, 86, 76, 0, 1.5)),        // the frame
  ...b2N('dawnSky', oRect('dark', 43, 30, 74, 46, 0, 1)),          // the sky, high up
  ...b2N('dawnGlow', oRect('dark', 43, 59, 74, 20, 0, 1)),         // and low at the horizon
  oEll('lit', 60, 63, 14, 14),                                     // the sun on the skyline
  ...b2N('rooftops',
    oRect('dark', 16, 64.6, 18, 9), oRect('dark', 70, 66, 22, 6),  // the roofs across the way
    oRect('dark', 33, 62.2, 14, 14),                               // the half-built block
  ),
  oBar('line', 28, 62, 28, 13, 2.2),                               // the crane's mast,
  oBar('line', 31.4, 62, 31.4, 13, 1),
  ...[18, 26, 34, 42, 50, 58].map((y) => oBar('line', 28, y, 31.4, y - 4, 0.7)),   // its lattice
  oBar('line', 11, 15, 78, 15, 1.8),                               // its jib, along the sky
  oRect('line', 14, 17.2, 5, 3.4),                                 // the counterweights
  oBar('line', 29.7, 15, 29.7, 7, 1.3),                            // the peak
  oBar('line', 29.7, 7, 64, 15, 0.7), oBar('line', 29.7, 7, 13, 15, 0.7),   // and its ties
  oBar('line', 56, 15, 56, 33, 0.6),                               // the hook's cable
  oRect('line', 56, 34.4, 3, 2.6),                                 // and the hook
  ...b2N('duckEgg',
    oBar('mass', 43, 5, 43, 71, 2.6),                              // the mullion
    oRect('mass', 43, 79, 92, 4, 0, 1),                            // the sill, proud of the frame
  ),
  ...b2N('duckEgg', oRect('dark', 43, 81.4, 90, 1.4)),             // its underside
  oBar('lit', 9, 46, 17, 36, 1.2),                                 // the glass catching the light
]);
export const dawnWindow = (x: number, y: number, w: number, h: number) => fit(DAWN_WINDOW, x, y, w, h);

// ── BAKERY COUNTER ───────────────────────────────────────────────────────────
//
// REFERENCE. A bakery's serving counter is a long cabinet at the hip with a pale
// MARBLE TOP that overhangs it, a painted FRONT in raised PANELS, and a recessed
// KICKBOARD at the floor. The overhanging top and the panelled front are what say
// shop counter rather than a box; painted pastel, it is a cake shop's. 180 × 24.
const BAKERY_COUNTER: ObjPart[] = b2In(180, 24, [
  ...b2N('duckEgg',
    oRect('face', 90, 14, 176, 20, 0, 1),                          // the front, in shade
    ...[31, 90, 149].map((x) => oRect('mass', x, 13, 50, 11, 0, 1)),   // its raised panels
  ),
  ...b2N('iron', oRect('dark', 90, 22.6, 168, 2.8)),               // the kickboard, set back
  ...b2N('marble',
    oRect('mass', 90, 2.2, 180, 4.4, 0, 1),                        // the marble top
    oRect('dark', 90, 4.8, 176, 1),                                // its edge, in shade
  ),
  oBar('lit', 4, 1, 176, 1, 0.8),                                  // the lamp along it
]);
export const bakeryCounter = (x: number, y: number, w: number, h: number) => fit(BAKERY_COUNTER, x, y, w, h);

// ── biz2: objects for this lesson go ABOVE this line ──

// ─────────────────────────────────────────────────────────────────────────────
// THE UMBRELLA CORNER, for Economics lesson 2 (2026-09-30). Drawn against pictures
// fetched with `npm run ref` (scratchpad/ref/econ2-*): a convenience store's chrome
// umbrella rail with its price card on top, a French shop's carousel of crook-handled
// umbrellas, a flat furled-umbrella icon, a rain-cloud icon, retractable shop awnings
// in Chester, and a small panel van in side view.
// ─────────────────────────────────────────────────────────────────────────────
const econ2N = (k: NaturalKey, ...ps: ObjPart[]): ObjPart[] => ps.map((p) => ({ ...p, nat: k }));

// ── FURLED UMBRELLA ──────────────────────────────────────────────────────────
//
// REFERENCE. A furled umbrella hung on a rail is four things top to bottom: a wooden
// CROOK — a J that curls over the rail — a short shaft, the CANOPY rolled into a
// long spindle whose top end is RUFFLED where the cloth bunches and whose foot
// tapers to nothing, a STRAP buttoned round its middle, and a metal FERRULE tip.
// The crook and the ruffle are the field marks: without them it is a carrot or a
// rolled newspaper. Drawn true to its own proportion inside the square, so a scene
// asks for a SQUARE box and the umbrella stands 0.24 as wide as it is tall.
const umbrellaParts = (fill: NaturalKey): ObjPart[] => [
  ...econ2N('wood',
    oBar('mass', 50, 18, 50, 8, 3.6),                              // the shaft into the crook
    oBar('mass', 50, 8, 48.4, 4.2, 3.6),                           // the crook, curling over
    oBar('mass', 48.4, 4.2, 45.4, 2.4, 3.6),
    oBar('mass', 45.4, 2.4, 42.2, 3.1, 3.6),
    oBar('mass', 42.2, 3.1, 40.4, 5.8, 3.6),
    oBar('mass', 40.4, 5.8, 40.6, 9.4, 3.6),
  ),
  ...econ2N(fill,
    ...trapezoid('mass', 50, 52, 15, 4, 64),                       // the rolled canopy, tapering
    oEll('mass', 44.6, 21, 7, 5.4),                                // its ruffled top edge
    oEll('mass', 50, 19.6, 8, 5.4),
    oEll('mass', 55.4, 21, 7, 5.4),
    oRect('dark', 50, 45, 13.2, 3.4, 0, 1.2),                      // the strap round it
  ),
  oBar('line', 50, 84, 50, 97, 2.6),                               // the ferrule
  oEll('line', 50, 45, 2.2, 2.2),                                  // the strap's button
  oBar('lit', 46.6, 27, 48.4, 74, 1.4),                            // the sheen down its lit side
];
export const furledUmbrella = (x: number, y: number, w: number, h: number, fill: NaturalKey = 'umbNavy') =>
  fit(umbrellaParts(fill), x, y, w, h);
/** Where the crook rests on a rail or in a hand, in the umbrella's own square. */
export const UMB_HOOK = { x: 45.4, y: 5.2 } as const;

// ── UMBRELLA RACK ────────────────────────────────────────────────────────────
//
// REFERENCE. A shop's umbrella rail (the FamilyMart one) is CHROME TUBE: two uprights
// on splayed feet with CASTORS, one horizontal RAIL between them that the crooks hang
// on, and an ARM off one upright that a price card hangs from. The rail at a little
// over hip height is what lets the umbrellas hang clear of the floor.
const UMBRELLA_RACK: ObjPart[] = [
  ...econ2N('silver',
    oBar('mass', 21.4, 27, 21.4, 95, 3.4),                         // the two uprights
    oBar('mass', 78.6, 27, 78.6, 95, 3.4),
    oBar('mass', 16, 37.1, 84, 37.1, 3),                           // the rail the crooks hang on
    oBar('mass', 21.4, 31.4, 13.7, 31.4, 2.6),                     // the arm the price tag hangs from
    oBar('mass', 13.7, 31.4, 13.7, 34.2, 2.2),                     // and its hook
    oBar('mass', 8, 95.5, 34, 95.5, 3),                            // the feet
    oBar('mass', 66, 95.5, 92, 95.5, 3),
    oEll('mass', 21.4, 26, 5, 5),                                  // the finials
    oEll('mass', 78.6, 26, 5, 5),
  ),
  ...econ2N('castor',
    oEll('face', 10.5, 98.2, 4.4, 4.4),                            // the castors
    oEll('face', 31.5, 98.2, 4.4, 4.4),
    oEll('face', 68.5, 98.2, 4.4, 4.4),
    oEll('face', 89.5, 98.2, 4.4, 4.4),
  ),
  oBar('lit', 20.4, 40, 20.4, 90, 0.9),                            // the chrome's shine
  oBar('lit', 77.6, 40, 77.6, 90, 0.9),
];
export const umbrellaRack = (x: number, y: number, w: number, h: number) => fit(UMBRELLA_RACK, x, y, w, h);
/** The rail the crooks hang on, and the hook the tag hangs from, in the rack's square. */
export const RACK_RAIL = { y: 36.2, x0: 16, x1: 84 } as const;
export const RACK_TAG_HOOK = { x: 13.7, y: 35 } as const;

// ── PRICE TAG ────────────────────────────────────────────────────────────────
//
// REFERENCE. A chalk price tag is a small SLATE with rounded corners and a wooden
// edge, hung by a STRING looped through two holes into a triangle. The string's
// triangle is what makes it a tag that hangs, rather than a sign that stands.
const PRICE_TAG: ObjPart[] = [
  ...econ2N('wood', oRect('mass', 50, 66, 100, 68, 0, 7)),         // the wooden edge
  ...econ2N('slate', oRect('dark', 50, 67, 86, 54, 0, 5)),          // the slate in it
  oBar('line', 50, 2, 16, 36, 3),                                  // the string, looped
  oBar('line', 50, 2, 84, 36, 3),
  oEll('lit', 16, 38, 5, 5),                                       // the two holes it runs through
  oEll('lit', 84, 38, 5, 5),
];
export const priceTag = (x: number, y: number, w: number, h: number) => fit(PRICE_TAG, x, y, w, h);
/** The slate's face, in the tag's own square: the price is chalked here. */
export const TAG_FACE = { x: 50, y: 67, w: 86, h: 54 } as const;

// ── HANGING SIGN ─────────────────────────────────────────────────────────────
//
// REFERENCE. A shop's hanging board is a SLATE in a wooden frame, hung from the
// awning's front bar on two CHAINS. The chains are what put it under the awning
// rather than on the wall.
const HANGING_SIGN: ObjPart[] = [
  ...econ2N('wood', oRect('mass', 50, 70, 100, 60, 0, 3)),          // the frame
  ...econ2N('slate', oRect('dark', 50, 70, 93, 44, 0, 2)),          // the slate
  oBar('line', 10, 0, 10, 40, 2.6),                                // the chains
  oBar('line', 90, 0, 90, 40, 2.6),
  oEll('lit', 10, 20, 2.4, 6), oEll('lit', 90, 20, 2.4, 6),        // a link in each
];
export const hangingSign = (x: number, y: number, w: number, h: number) => fit(HANGING_SIGN, x, y, w, h);
/** The slate inside the frame, in the sign's own square. */
export const SIGN_FACE = { x: 50, y: 70, w: 93, h: 44 } as const;

// ── SHOP AWNING ──────────────────────────────────────────────────────────────
//
// REFERENCE. A retractable shop awning (the Chester references) seen from the street is
// three bands: the CANVAS sloping down from the wall, foreshortened into a band and
// sewn in widths, the metal FRONT BAR it is rolled out on, and a VALANCE hanging
// straight from the bar with a pale trim along its hem. No scallops: a straight
// valance is what separates a shop's awning from a market stall's canopy.
const AWN_SEAMS = [12.5, 25, 37.5, 50, 62.5, 75, 87.5];
const SHOP_AWNING: ObjPart[] = [
  ...econ2N('canvasTeal',
    oRect('mass', 50, 35.7, 100, 71.4, 0, 1),                      // the canvas, sloping to the front
    ...AWN_SEAMS.map((x) => oBar('dark', x, 3, x, 70, 4)),         // the widths it is sewn in
    oRect('face', 50, 89.3, 100, 21.4, 0, 1),                      // the valance, hanging straight
  ),
  ...econ2N('silver', oRect('face', 50, 75, 101, 7.2, 0, 2)),       // the front bar
  oRect('lit', 50, 95, 100, 3.2),                                  // the valance's pale trim
];
export const shopAwning = (x: number, y: number, w: number, h: number) => fit(SHOP_AWNING, x, y, w, h);

// ── CORNER SHOP ──────────────────────────────────────────────────────────────
//
// REFERENCE. The shop on a street corner (the Chester row) is a rendered WALL with a
// SHOP WINDOW in a painted frame, a DOOR with a glazed top panel, two sash WINDOWS
// upstairs over the awning, a darker PLINTH along its foot, and pale QUOINS — the
// corner stones laid long and short — down the corner it turns. The quoins are what
// say this is the END of the building, where the street goes round the corner.
const QUOIN_Y = [5, 13, 21, 29, 37, 45, 53, 61, 69, 77, 85];
const CORNER_SHOP: ObjPart[] = [
  ...econ2N('stucco', oRect('mass', 50, 50, 100, 100)),            // the wall, cream render
  ...econ2N('coping', oRect('face', 50, 98, 100, 4)),              // its stone plinth
  ...econ2N('doorPaint',
    oRect('face', 12.3, 75, 17, 51),                               // the door's frame
    oRect('mass', 12.3, 75.5, 14, 49, 0, 0.6),                     // the door
    oRect('dark', 12.3, 87, 9.6, 14, 0, 0.6),                      // its lower panel
  ),
  ...econ2N('glass', oRect('dark', 12.3, 64, 9.6, 15, 0, 0.6)),     // its glazed top panel
  oEll('line', 17.4, 77, 1.2, 2.4),                                // its knob
  ...econ2N('doorPaint', oRect('face', 70.8, 71.4, 45.6, 44.6, 0, 0.6)), // the shop window's frame, painted as the door
  ...econ2N('glass', oRect('mass', 70.8, 71.2, 42.4, 41.2, 0, 0.4)),
  oBar('line', 70.8, 51, 70.8, 91.6, 1),                           // its mullion
  oBar('lit', 55, 58, 52, 66, 1.4), oBar('lit', 59, 58, 54.5, 70, 1.4),   // the light on the glass
  oRect('lit', 70.8, 94.2, 47, 2.2),                               // its sill
  ...[34, 71.7].flatMap((x) => [
    oRect('lit', x, 12.4, 21, 20.6, 0, 0.6),                       // an upstairs window's frame
    ...econ2N('glass', oRect('dark', x, 12.2, 18, 17.8, 0, 0.4)),  // its panes
    oBar('line', x - 9, 12.2, x + 9, 12.2, 1.2),                   // the sashes' meeting rail
    oBar('line', x, 3.3, x, 21.1, 0.9),
    oRect('lit', x, 23.4, 23, 1.6),                                // its sill
  ]),
  ...QUOIN_Y.map((y, i) => oRect('lit', i % 2 ? 97.6 : 96.6, y, i % 2 ? 4.6 : 6.6, 3.6)),
];
export const cornerShop = (x: number, y: number, w: number, h: number) => fit(CORNER_SHOP, x, y, w, h);

// ── RAIN CLOUD ───────────────────────────────────────────────────────────────
//
// REFERENCE. Every rain-cloud icon draws the same thing: a FLAT BOTTOM and a top of
// three overlapping domes, the middle one tallest and set a little right of centre,
// so the cloud leans into the wind. The underside is in shade, where the rain comes
// from. Drawn inside the square at its own proportion, about two and a half to one.
const RAIN_CLOUD: ObjPart[] = econ2N('rainCloud',
  oEll('mass', 31, 54, 34, 28),                                    // the left dome
  oEll('mass', 54, 46, 42, 40),                                    // the tallest, right of centre
  oEll('mass', 74, 54, 32, 28),                                    // the right dome
  oRect('mass', 50, 62, 82, 18, 0, 9),                             // the flat bottom
  oRect('face', 52, 69, 72, 5, 0, 2.5),                            // its underside, in shade
);
export const rainCloud = (x: number, y: number, w: number, h: number) => fit(RAIN_CLOUD, x, y, w, h);

// ── SUN ──────────────────────────────────────────────────────────────────────
//
// REFERENCE. The flat-illustration sun: a DISC with a ring of short RAYS clear of it,
// eight of them, square-ended. A disc alone is a coin or a ball.
const SUN_RAYS = [0, 45, 90, 135, 180, 225, 270, 315].map((d) => (d * Math.PI) / 180);
const SUN: ObjPart[] = econ2N('sunshine',
  oEll('mass', 50, 50, 54, 54),                                    // the disc
  ...SUN_RAYS.map((a) => oBar('mass', 50 + 34 * Math.cos(a), 50 + 34 * Math.sin(a), 50 + 46 * Math.cos(a), 50 + 46 * Math.sin(a), 6)),
  oEll('face', 58, 58, 30, 30),                                    // its far side, a shade deeper
);
export const sun = (x: number, y: number, w: number, h: number) => fit(SUN, x, y, w, h);

// ── PANEL VAN ────────────────────────────────────────────────────────────────
//
// REFERENCE. A small panel van in side view (the ProMaster City): a short BONNET, a
// steeply raked WINDSCREEN, a cab with one side window, then a long windowless CARGO
// box with a SLIDING SIDE DOOR on a track, two wheels in arches, and a bumper. Drawn
// facing LEFT, as it pulls in from the right; laid out for a box twice as long as it
// is tall, so a scene asks for w = 2.27 h. The door is its own object (`vanDoor`) so it
// can slide back along the body and show the load (`VAN_DOORWAY`).
const PANEL_VAN: ObjPart[] = [
  ...econ2N('vanWhite',
    oRect('mass', 60.5, 45, 79, 84, 0, 3),                         // the cargo box
    oRect('mass', 15.5, 49, 14, 76, 0, 3),                         // the cab
    oTri('mass', 7, 34, 10, 48, 'left'),                           // the raked front
    oRect('mass', 7.6, 66, 15.2, 30, 0, 3),                        // the bonnet
    oRect('mass', 8, 30, 3, 6, 0, 1),                              // the mirror
    oEll('face', 13, 86, 15, 32),                                  // the wheel arches
    oEll('face', 80, 86, 15, 32),
    oRect('face', 8.4, 83, 16.8, 7, 0, 2),                         // the bumper
  ),
  ...econ2N('tyre', oEll('mass', 13, 88, 11, 25), oEll('mass', 80, 88, 11, 25)),   // the tyres
  ...econ2N('silver', oEll('dark', 13, 88, 5, 11.4), oEll('dark', 80, 88, 5, 11.4)), // their hubs
  ...econ2N('glass',
    oBar('dark', 11.2, 13, 3.4, 31, 3.2),                          // the windscreen
    oRect('dark', 16.4, 25, 9, 19, 0, 1.5),                        // the cab's side window
  ),
  ...econ2N('cargoDark', oRect('dark', 52, 46, 26, 68, 0, 1)),      // the doorway onto the load
  oRect('lit', 2.6, 57, 3, 7, 0, 1),                               // the headlamp
  oBar('line', 22.6, 12, 22.6, 80, 0.8),                           // the cab door's seam
  oRect('line', 19.6, 46, 2.4, 1.6),                               // and its handle
  oBar('line', 23, 11.5, 99, 11.5, 1),                             // the sliding door's track
  oBar('lit', 26, 7, 98, 7, 1.6),                                  // the light along the roof
];
export const panelVan = (x: number, y: number, w: number, h: number) => fit(PANEL_VAN, x, y, w, h);
/** The doorway in the van's side, in its own square, and how far the door slides back. */
export const VAN_DOORWAY = { x: 52, y: 46, w: 26, h: 68 } as const;
const VAN_DOOR: ObjPart[] = [
  ...econ2N('vanWhite', oRect('mass', 52, 46, 27, 70, 0, 1.5)),    // the sliding door
  oRect('line', 41, 46, 1.6, 7, 0, 0.8),                           // its pull
  oBar('line', 40, 18, 64, 18, 0.7),                               // its pressed panel
  oBar('line', 40, 74, 64, 74, 0.7),
];
export const vanDoor = (x: number, y: number, w: number, h: number) => fit(VAN_DOOR, x, y, w, h);

// ── CARDBOARD BOX ────────────────────────────────────────────────────────────
//
// REFERENCE. A delivery carton seen front-on: a brown box, its two top FLAPS folded
// back, a strip of TAPE down the middle and a printed panel. The open flaps are what
// say it is being unpacked.
const CARTON: ObjPart[] = econ2N('cardboard',
  oTri('mass', 18, 14, 30, 14, 'up', -12),                         // the flaps, folded back
  oTri('mass', 82, 14, 30, 14, 'up', 12),
  oRect('mass', 50, 60, 96, 80, 0, 1.5),                           // the box
  oRect('face', 50, 22, 96, 6),                                    // the shadowed lip under the flaps
  oRect('dark', 50, 60, 10, 76),                                   // the tape
);
export const carton = (x: number, y: number, w: number, h: number) => fit(CARTON, x, y, w, h);

// ─────────────────────────────────────────────────────────────────────────────
// THE MARKET STALL IN ITS OWN COLOURS, for Economics lesson 1 (2026-10-01, AR1).
// The shared `pie`, `loaf` and `stall` above are struck in a branch's tones, and in the
// lesson they came out as grey-green discs under a blue-grey canopy. These are drawn
// against references fetched with `node scripts/get-reference.mjs` (scratchpad/ref/
// econ1-*): a cherry pie with a lattice top in its glass dish, a peach pie cooling in
// its tin, bloomer loaves stacked on a market stall in Epping, and Shepherd's Bush
// Market's striped canopies. Each is drawn true to its own proportion inside the
// square, so a scene asks for a SQUARE box.
// ─────────────────────────────────────────────────────────────────────────────
const econ1N = (k: NaturalKey, ...ps: ObjPart[]): ObjPart[] => ps.map((p) => ({ ...p, nat: k }));

// ── PIE ──────────────────────────────────────────────────────────────────────
//
// REFERENCE (the cherry pie with a lattice top, 2006; the peach pie on its rack): seen
// a little from above, a pie is a DISH that tapers to its foot with a lip round its
// top; a golden CRUST rim, CRIMPED into a fluted edge all the way round; and inside it
// the FILLING, dark red, showing in squares between a LATTICE of pastry strips. The
// crimped rim and the red squares in the lattice are the field marks: a smooth golden
// ellipse is a cake, and a grey one is a stone. Content: x 2–98, y 22–80.
const PIE_CRIMPS = Array.from({ length: 16 }, (_, i) => (i / 16) * Math.PI * 2);
const ECON1_PIE: ObjPart[] = [
  ...econ1N('porcelain', ...trapezoid('face', 50, 71, 88, 68, 16)),  // the dish, tapering to its foot
  ...econ1N('porcelain', oRect('mass', 50, 61.5, 98, 6, 0, 3)),      // its lip
  ...econ1N('pastry',
    oEll('mass', 50, 45, 94, 34),                                    // the crust round the top
    ...PIE_CRIMPS.map((a) => oEll('mass', 50 + 46 * Math.cos(a), 45 + 16.5 * Math.sin(a), 9, 7)), // its crimped edge
  ),
  ...econ1N('cherry', oEll('mass', 50, 44, 82, 25)),                  // the filling inside the rim
  ...econ1N('pastry',                                                // the lattice: two strips one way …
    oBar('mass', 13, 40, 87, 40, 4.2),
    oBar('mass', 13, 49, 87, 49, 4.2),
    oBar('mass', 32, 32.5, 30, 55.5, 4.6),                           // … and three across, leaning with the dish
    oBar('mass', 50, 31.5, 50, 56.5, 4.6),
    oBar('mass', 68, 32.5, 70, 55.5, 4.6),
  ),
  oEll('lit', 30, 31.5, 12, 2.4, -6),                                // the glaze catching the lamp
];
export const econ1Pie = (x: number, y: number, w: number, h: number) => fit(ECON1_PIE, x, y, w, h);
/** The pie's foot, in its own square: where it stands on a counter or rests on a palm. */
export const ECON1_PIE_FOOT = 79 as const;

// ── LOAF ─────────────────────────────────────────────────────────────────────
//
// REFERENCE (bloomer loaves for sale at Copped Hall, Epping): a bloomer is a long
// DOME, rounded at both ends, on a FLAT base, its top baked a deeper brown than its
// sides, with SCORES slashed across it at a slant that open to the pale crumb. The
// pale slashes on a brown dome are what say bread. Content: x 2–98, y 34–78.
const ECON1_LOAF: ObjPart[] = [
  ...econ1N('crust',
    oEll('mass', 50, 54, 96, 42),                                    // the dome
    oRect('mass', 50, 66, 94, 18, 0, 9),                             // rounding down to a flat base
    oEll('dark', 50, 47, 78, 20),                                    // the top, baked darker
  ),
  ...econ1N('crumb',                                                 // four scores, open to the crumb
    oBar('dark', 21, 55, 30, 40, 4.6),
    oBar('dark', 37, 53, 46, 37, 4.6),
    oBar('dark', 53, 53, 62, 37, 4.6),
    oBar('dark', 69, 55, 78, 40, 4.6),
  ),
  oEll('lit', 34, 39.5, 13, 2.6, -10),                               // a dusting of flour
];
export const econ1Loaf = (x: number, y: number, w: number, h: number) => fit(ECON1_LOAF, x, y, w, h);
/** The loaf's base, in its own square. */
export const ECON1_LOAF_FOOT = 75 as const;

// ── PAPERBACK ────────────────────────────────────────────────────────────────
//
// REFERENCE (any paperback lying on a table): seen from the front and a little above,
// a book lying flat is its FRONT COVER, a band of PAGE EDGES under it, ruled with the
// leaves, and the back cover's edge at the foot. The pale band of pages between two
// covers is what says book rather than tile. Content: x 2–98, y 30–71.
const ECON1_BOOK: ObjPart[] = [
  ...econ1N('paperback', oRect('mass', 50, 44, 96, 28, 0, 2)),       // the front cover
  ...econ1N('paper', oRect('face', 51, 63, 92, 10, 0, 1)),           // the page edges under it
  ...econ1N('paperback', oRect('face', 50, 69.2, 96, 3.2, 0, 1)),    // the back cover at the foot
  ...econ1N('paperback', oRect('dark', 8, 44, 6, 28)),               // the spine's fold
  oRect('lit', 56, 39, 56, 7, 0, 1),                                 // the white title panel
  oBar('line', 36, 50.5, 76, 50.5, 1.4),                             // the author's name
  oBar('line', 7, 61.5, 95, 61.5, 0.6), oBar('line', 7, 65, 95, 65, 0.6), // the leaves
];
export const econ1Book = (x: number, y: number, w: number, h: number) => fit(ECON1_BOOK, x, y, w, h);
/** The book's foot, in its own square: the edge it lies on, and the edge a hand takes. */
export const ECON1_BOOK_FOOT = 70.8 as const;

// ── STALL ────────────────────────────────────────────────────────────────────
//
// REFERENCE (Shepherd's Bush Market): the same stall as `stall` above, in its own
// colours — two WOODEN posts, a canopy of GREEN-AND-WHITE striped canvas, and a
// scalloped valance whose scallops alternate the two.
const ECON1_STALL: ObjPart[] = [
  ...econ1N('wood',
    oBar('mass', 8, 16, 8, 100, 3),                                  // the two posts, down to the ground
    oBar('mass', 92, 16, 92, 100, 3),
  ),
  ...econ1N('marketCanvas',
    ...trapezoid('mass', 50, 13, 84, 100, 18),                       // the canopy, sloping to the front
    oRect('mass', 50, 25, 100, 6),                                   // the valance's band
  ),
  oRect('lit', 22, 13, 9, 16, 0, 0),                                 // its white stripes
  oRect('lit', 41, 13, 9, 16, 0, 0),
  oRect('lit', 59, 13, 9, 16, 0, 0),
  oRect('lit', 78, 13, 9, 16, 0, 0),
  ...[6, 18.5, 31, 43.5, 56, 68.5, 81, 93.5].map((x, k) =>          // the scallops, green and white by turns
    ({ ...oEll('mass', x, 28, 12, 10), nat: (k % 2 ? 'canvasWhite' : 'marketCanvas') as NaturalKey })),
];
export const econ1Stall = (x: number, y: number, w: number, h: number) => fit(ECON1_STALL, x, y, w, h);

// ── econ2: objects for this lesson go ABOVE this line ──

// ─────────────────────────────────────────────────────────────────────────────
// THE PARK, for Science lesson 2 (2026-09-30). Drawn against pictures fetched with
// `node scripts/get-reference.mjs` (scratchpad/ref/sci2-*): stone steps up a grassy
// bank in a botanic garden, flanked by piers with ball finials; a white dart paper
// plane photographed from above and to one side; a tape measure's D-shaped case with
// its yellow blade running out of the slot at its foot.
// ─────────────────────────────────────────────────────────────────────────────

const sci2N = (k: NaturalKey, ...ps: ObjPart[]): ObjPart[] => ps.map((p) => ({ ...p, nat: k }));
/** Author in real units (an ax × ay box) and hand it to `fit` as the 100-square. */
function sci2In(ax: number, ay: number, parts: readonly ObjPart[]): ObjPart[] {
  const sx = 100 / ax;
  const sy = 100 / ay;
  const s = 100 / Math.min(ax, ay);
  return parts.map((p) => {
    if (p.k === 'bar') return { ...p, x1: p.x1 * sx, y1: p.y1 * sy, x2: p.x2 * sx, y2: p.y2 * sy, t: p.t * s };
    return { ...p, x: p.x * sx, y: p.y * sy, w: p.w * sx, h: p.h * sy, ...(p.k === 'rect' ? { rad: p.rad * s } : null) } as ObjPart;
  });
}

// ── PARK STEPS ───────────────────────────────────────────────────────────────
//
// REFERENCE. A flight of stone steps up a park bank, seen from the front, is a stack of
// RISERS — the upright faces, in shade — each capped by a TREAD whose top catches the
// light, the stone laid in slabs whose joints stagger riser to riser. A PIER stands at
// each side, a square shaft under a projecting cap with a BALL FINIAL on a short neck.
// The lit treads over shaded risers are what say steps; the piers say a park's steps
// rather than a doorstep. Garden flights FLARE — each step below a little wider than the
// one above — which is what makes a flight read as stairs from straight in front and not
// as a striped wall. In real units, 178 × 70: piers 0–18 and 160–178 at the bottom
// step's ends, the steps centred between them (`STEP_WIDTHS`, top to bottom), their
// treads' tops at 19, 36 and 53 (`STEP_TREADS`), each tread 5 deep in the light and the
// riser 12 tall under it (`STEP_RISERS`) — wide enough to chalk words on.
const STEP_TREADS = [19, 36, 53] as const;
const STEP_RISERS = [24, 41, 58] as const;
const STEP_WIDTHS = [110, 126, 142] as const;
const sci2Pier = (cx: number): ObjPart[] => [
  ...sci2N('stepStone',
    oRect('mass', cx, 45.25, 16, 49.5),                           // the shaft
    oRect('mass', cx, 18, 20, 5, 0, 0.8),                         // the cap, projecting
    oRect('mass', cx, 14.2, 6, 3),                                // the neck
    oEll('mass', cx, 8, 11, 11),                                  // the ball
    oEll('dark', cx + 1.6, 9.6, 6.2, 6.2),                        // its far side, turned from the lamp
    oEll('mass', cx - 0.9, 7.2, 8.4, 8.4),                        // and its lit face
    oRect('dark', cx + 6, 45.6, 4, 48.8),                         // the shaft's side, from the lamp
    oRect('dark', cx, 21.1, 15, 1.3),                             // the cap's shadow on the shaft
    ...[34, 47, 60].map((y) => oBar('dark', cx - 7.4, y, cx + 7.4, y, 0.7)), // the courses
  ),
  oEll('lit', cx - 2.6, 5.2, 3.2, 2.2, -30),                      // the lamp on the ball
];
const PARK_STEPS: ObjPart[] = sci2In(178, 70, [
  ...STEP_TREADS.flatMap((ty, k) => sci2N('stepStone',
    oRect('mass', 89, ty + 8.5, STEP_WIDTHS[k], 17),              // the step, one block of stone
    oRect('dark', 89, STEP_RISERS[k] + 6, STEP_WIDTHS[k] - 1, 12), // its riser, in shade under the lit tread
    oRect('dark', 89, STEP_RISERS[k] + 0.8, STEP_WIDTHS[k], 1.6), // the nosing's shadow on it
    // the slab joints, staggered riser to riser
    ...(k === 1 ? [40, 82, 124] : k === 0 ? [62, 116] : [52, 110, 140]).map((x) => oBar('dark', x, STEP_RISERS[k] + 2, x, STEP_RISERS[k] + 11.4, 0.8)),
  )),
  ...STEP_TREADS.map((ty, k) => oBar('lit', 89 - STEP_WIDTHS[k] / 2 + 1.4, ty + 0.5, 89 + STEP_WIDTHS[k] / 2 - 1.4, ty + 0.5, 0.6)), // the light along each nosing
  ...sci2Pier(9),
  ...sci2Pier(169),
]);
export const parkSteps = (x: number, y: number, w: number, h: number) => fit(PARK_STEPS, x, y, w, h);
export { STEP_TREADS, STEP_RISERS, STEP_WIDTHS };

// ── GRASS BANK ───────────────────────────────────────────────────────────────
//
// REFERENCE. Either side of the steps the ground rises as a turfed BANK: its top a
// level lawn in the light, its face falling to the lower lawn in shade, and at its end
// it rounds off and slopes down into the grass. In real units, 400 × 58; the top is
// level with the steps' top tread. Real units, 400 × 63: the top 4–12, the face below.
const GRASS_BANK: ObjPart[] = sci2In(400, 63, sci2N('meadow',
  oRect('face', 165, 37.5, 330, 51),                              // the bank's face, in shade
  oTri('face', 330, 37.5, 112, 51, 'up'),                         // its end, sloping down to the grass
  oRect('mass', 165, 8, 330, 8),                                  // the lawn on top, lit
  oEll('mass', 330, 8, 26, 8),                                    // rounding over the end
  ...[22, 70, 128, 214, 262, 300].map((x, k) => oTri('dark', x, 15 + (k % 2) * 9, 4, 4, 'up')), // tufts in the turf
));
export const grassBank = (x: number, y: number, w: number, h: number) => fit(GRASS_BANK, x, y, w, h);

// ── PARK LAWN ────────────────────────────────────────────────────────────────
//
// REFERENCE. Mown park grass seen low from the front is a band of green, a little
// darker at the near edge, with the odd tuft standing above the mown line.
const PARK_LAWN: ObjPart[] = sci2In(400, 18, [
  ...sci2N('leaf',
    oRect('mass', 200, 9, 400, 18),
    oRect('face', 200, 15.5, 400, 5),
    ...Array.from({ length: 13 }, (_, k) => oTri('dark', 14 + k * 31 + (k % 3) * 4, 2.4 + (k % 2) * 4, 3.4, 3.6, 'up')),
  ),
]);
export const parkLawn = (x: number, y: number, w: number, h: number) => fit(PARK_LAWN, x, y, w, h);

// ── PARK TREE ────────────────────────────────────────────────────────────────
//
// REFERENCE. The broadleaves in the garden: a trunk a quarter of the height, flaring
// at its foot, under ONE canopy with a scalloped edge, darker underneath. Bark brown,
// leaves green — the tree drawn in the branch's tone is a cloud on a post.
const PARK_TREE: ObjPart[] = [
  ...sci2N('bark',
    oRect('mass', 50, 82, 12, 36),
    oTri('mass', 41, 96, 10, 8, 'up'), oTri('mass', 59, 96, 10, 8, 'up'), // the flare at the foot
  ),
  ...sci2N('leaf',
    oEll('mass', 50, 42, 84, 56),
    oEll('mass', 20, 40, 30, 30), oEll('mass', 30, 20, 30, 28), oEll('mass', 50, 13, 32, 26),
    oEll('mass', 70, 20, 30, 28), oEll('mass', 80, 40, 30, 30), oEll('mass', 74, 58, 26, 22),
    oEll('mass', 26, 58, 26, 22),
    oEll('dark', 50, 64, 64, 12),                                  // the underside, out of the light
  ),
];
export const parkTree = (x: number, y: number, w: number, h: number) => fit(PARK_TREE, x, y, w, h);

// ── PAPER PLANE ──────────────────────────────────────────────────────────────
//
// REFERENCE. A dart folded from a sheet, from above and to one side: a long WING
// triangle running to the nose, the centre crease down it, and the KEEL — the folded
// body — hanging under the wings as a narrower triangle. A dart's nose is a point; the
// classic glider's is folded back BLUNT. Real units, 24 × 9, nose to the right, drawn
// about its middle so a hand can hold it there.
const PAPER_PLANE_POINTY: ObjPart[] = sci2In(24, 9, [
  oTri('face', 13, 6.7, 20, 4.4, 'right'),                        // the keel, under the wings
  oTri('mass', 12, 3.6, 24, 7.2, 'right'),                        // the wings, to a point
  oBar('line', 0.8, 3.6, 22.6, 3.6, 0.45),                        // the centre crease
  oBar('line', 2, 1.3, 21.4, 3.3, 0.35),                          // the near wing's fold
]);
const PAPER_PLANE_BLUNT: ObjPart[] = sci2In(24, 9, [
  oTri('face', 12, 6.7, 17, 4.4, 'right'),                        // the keel
  oTri('mass', 10.5, 3.6, 21, 7.2, 'right'),                      // the wings…
  oRect('mass', 19.8, 3.6, 3.6, 3.4, 0, 0.5),                     // …and the nose folded back blunt
  oBar('line', 0.8, 3.6, 21.2, 3.6, 0.45),
  oBar('line', 2, 1.3, 18.6, 3.0, 0.35),
]);
export const paperPlane = (x: number, y: number, w: number, h: number, nose: 'pointy' | 'blunt' = 'pointy', paper: NaturalKey = 'paper') =>
  fit(tint(nose === 'pointy' ? PAPER_PLANE_POINTY : PAPER_PLANE_BLUNT, paper), x, y, w, h);

// ── TAPE MEASURE ─────────────────────────────────────────────────────────────
//
// REFERENCE. A pocket tape measure's case is a D: round at the back, square at the
// front where the blade comes out of a SLOT at its foot, with a round LABEL on its side
// and a LOCK button on top. The yellow blade itself the scene draws, because it runs
// out to any length. Real units, 12 × 11.
const TAPE_CASE: ObjPart[] = sci2In(12, 11, [
  ...sci2N('tapeCase',
    oEll('mass', 5.5, 5.6, 11, 11),                               // the round back
    oRect('mass', 8.6, 5.6, 6.6, 11, 0, 1.2),                     // the square front
    oRect('face', 6.2, 10.4, 10.6, 1.4),                          // its foot, in shade
  ),
  oEll('lit', 5.4, 5.6, 6.6, 6.6),                                // the label
  oRect('line', 9.6, 0.9, 2.6, 1.6, 0, 0.5),                      // the lock
  oRect('line', 11.4, 9.4, 1.4, 1.6),                             // the slot the blade runs from
]);
export const tapeCase = (x: number, y: number, w: number, h: number) => fit(TAPE_CASE, x, y, w, h);

// ── sci2: objects for this lesson go ABOVE this line ──

// ─────────────────────────────────────────────────────────────────────────────
// history-foundations-2 — AN ATTIC UNDER THE ROOF. Its set (the roof, the gable wall,
// the beams, the little window, the door down to the stairs), a steamer trunk, a
// hatbox of old letters with a newspaper at the bottom, the book with a castle in it,
// a museum leaflet, the letter, the newspaper, a portrait and a shelf of books.
// ─────────────────────────────────────────────────────────────────────────────

/** Parts in a named real colour (AP11). */
const h2N = (k: NaturalKey, ...ps: ObjPart[]): ObjPart[] => ps.map((p) => ({ ...p, nat: k }));
/** Move parts down by `dy` — to set a short drawing in the foot of a square box. */
const h2Dy = (dy: number, ps: readonly ObjPart[]): ObjPart[] =>
  ps.map((p) => (p.k === 'bar' ? { ...p, y1: p.y1 + dy, y2: p.y2 + dy } : { ...p, y: p.y + dy }));
/** Author in real units (an ax × ay box) and hand it to `fit` as the 100-square. */
function h2In(ax: number, ay: number, parts: readonly ObjPart[]): ObjPart[] {
  const sx = 100 / ax;
  const sy = 100 / ay;
  const s = 100 / Math.min(ax, ay);
  return parts.map((p) => {
    if (p.k === 'bar') return { ...p, x1: p.x1 * sx, y1: p.y1 * sy, x2: p.x2 * sx, y2: p.y2 * sy, t: p.t * s };
    return { ...p, x: p.x * sx, y: p.y * sy, w: p.w * sx, h: p.h * sy, ...(p.k === 'rect' ? { rad: p.rad * s } : null) } as ObjPart;
  });
}

// ── THE ATTIC: ROOF, GABLE, BEAMS ────────────────────────────────────────────
//
// REFERENCE (Commons, an attic under a pitched roof, photographed down its length).
// What says ATTIC is the A: two rafters climbing to a ridge, a COLLAR beam tying them
// across above head height, and a small window in the gable end letting in the only
// light. The roof boards between the rafters are the dark planes; the gable end wall
// is the lit one. Seen end-on, the room is a pentagon: walls to the eaves, then the
// two slopes meeting at the ridge.
//
// Authored in the box it is laid in — 400 wide by 210 tall, the stage's width from
// the ridge (290) down to the floor (500) — so a part is written where it stands.
// Each slope falls 0.525 a unit, ridge to eaves: 290 at x 200, 395 at the walls.
const AT_W = 400;
const AT_H = 210;
const slopeY = (x: number) => (x <= 200 ? 105 - 0.525 * x : 0.525 * (x - 200));
/** The roof boards, between and above the rafters: dark wood, laid in battens. */
const ATTIC_ROOF: ObjPart[] = h2In(AT_W, AT_H, [
  ...h2N('roofBoard', oRect('mass', 200, 105, 400, 210)),
  ...[16, 32, 48, 64, 80, 96].flatMap((k) => {
    const y0 = 105 - k;
    const xe = y0 / 0.525;
    return [oBar('line', 0, y0, xe, 0, 0.9), oBar('line', 400 - xe, 0, 400, y0, 0.9)];
  }),
]);
export const atticRoof = (x: number, y: number, w: number, h: number) => fit(ATTIC_ROOF, x, y, w, h);
/** The gable end wall, lit: whitewashed boards, upright. */
const ATTIC_GABLE: ObjPart[] = h2In(AT_W, AT_H, h2N('whitewash',
  oRect('mass', 200, 157.5, 400, 105),                           // the walls up to the eaves
  oTri('mass', 200, 52.5, 400, 105, 'up'),                       // and the gable to the ridge
  ...[34, 68, 102, 136, 170, 230, 264, 298, 332, 366].map((x) => {
    const top = slopeY(x) + 3;
    return oRect('dark', x, (top + 210) / 2, 1, 210 - top);      // the seams between planks
  }),
));
export const atticGable = (x: number, y: number, w: number, h: number) => fit(ATTIC_GABLE, x, y, w, h);
/** The two rafters, the collar beam that ties them above head height, and the king post. */
const ATTIC_BEAMS: ObjPart[] = h2In(AT_W, AT_H, h2N('wood',
  oBar('mass', 4, 102.9, 200, 0, 10),
  oBar('mass', 200, 0, 396, 102.9, 10),
  oBar('mass', 84, 58, 316, 58, 8),
  oBar('mass', 200, 0, 200, 58, 7),
));
export const atticBeams = (x: number, y: number, w: number, h: number) => fit(ATTIC_BEAMS, x, y, w, h);

// ── THE GABLE WINDOW ─────────────────────────────────────────────────────────
//
// REFERENCE (the same photograph): a small square window, four panes in a wooden
// frame, set high in the gable end, with a sill. Real units, 30 × 26.
const ATTIC_WINDOW: ObjPart[] = h2In(30, 26, [
  ...h2N('wood',
    oRect('mass', 15, 12, 30, 24, 0, 1),                         // the frame
    oRect('mass', 15, 24.6, 32, 2.8, 0, 0.8),                    // the sill
  ),
  ...h2N('clearSky',
    oRect('dark', 8.6, 6.8, 10.4, 8.4),                          // four panes of sky
    oRect('dark', 21.4, 6.8, 10.4, 8.4),
    oRect('dark', 8.6, 17.2, 10.4, 9.2),
    oRect('dark', 21.4, 17.2, 10.4, 9.2),
  ),
  oBar('lit', 5, 9, 9, 4.4, 1),                                  // the light on the glass
  oBar('lit', 18, 19.6, 21.6, 15.4, 1),
]);
export const atticWindow = (x: number, y: number, w: number, h: number) => fit(ATTIC_WINDOW, x, y, w, h);

// ── THE DOOR DOWN TO THE STAIRS ──────────────────────────────────────────────
//
// REFERENCE: an attic reached by a stair has a low plank door in the end wall. Open,
// it shows the dark of the stairwell, the top of the handrail and its newel post;
// the door itself stands ajar into the room, a narrow leaf of boards with a knob.
// Real units, 48 × 84.
const ATTIC_DOORWAY: ObjPart[] = h2In(48, 84, [
  ...h2N('wood', oRect('mass', 18, 42, 34, 84, 0, 1)),           // the frame
  ...h2N('wood', oRect('mass', 41.5, 44, 9, 80, 0, 0.8)),        // the leaf, standing open
  ...h2N('gloom', oRect('dark', 18, 45, 26, 78)),                // the dark of the stairwell
  ...h2N('wood',
    oBar('dark', 26, 52, 26, 84, 2.6),                           // the newel post
    oBar('dark', 26, 53, 6, 72, 2),                              // the handrail going down
    oRect('dark', 39.4, 44, 0.8, 76),                            // the leaf's boards
    oRect('dark', 43.6, 44, 0.8, 76),
  ),
  ...h2N('brass', oEll('dark', 38.6, 47, 2.6, 2.6)),             // its knob
]);
export const atticDoorway = (x: number, y: number, w: number, h: number) => fit(ATTIC_DOORWAY, x, y, w, h);

// ── STEAMER TRUNK ────────────────────────────────────────────────────────────
//
// REFERENCE (Commons, a Louis Vuitton steamer trunk, front on; a line drawing of a
// domed one). A FLAT-TOPPED trunk is canvas over a box, bound in WOOD SLATS round its
// edges and across its face, with BRASS corner caps, a brass LOCK plate at the middle
// of the lid seam, and leather STRAPS over the lid. The lid is its own shallow box
// whose seam runs right round. Real units, 66 × 30.
const STEAMER_TRUNK: ObjPart[] = h2In(66, 30, [
  ...h2N('trunk',
    oRect('mass', 33, 18.4, 66, 23.2, 0, 1.4),                   // the body
    oRect('mass', 33, 3.8, 66, 7.6, 0, 1.6),                     // the lid
  ),
  oBar('line', 1, 7, 65, 7, 0.9),                                // the lid's seam
  ...h2N('wood',
    oRect('dark', 3.2, 18.4, 3.6, 22),                           // slats at the ends,
    oRect('dark', 62.8, 18.4, 3.6, 22),
    oRect('dark', 33, 14.6, 58, 2.6),                            // and across the face
    oRect('dark', 33, 24.6, 58, 2.6),
    oRect('dark', 3.2, 3.8, 3.6, 5.6),
    oRect('dark', 62.8, 3.8, 3.6, 5.6),
  ),
  ...h2N('copper',
    oRect('dark', 17, 15, 4, 28),                                // two leather straps
    oRect('dark', 49, 15, 4, 28),
  ),
  ...h2N('brass',
    oRect('dark', 17, 10.4, 5.6, 3.6, 0, 0.6),                   // their buckles
    oRect('dark', 49, 10.4, 5.6, 3.6, 0, 0.6),
    oRect('dark', 33, 8, 7.4, 7.4, 0, 1),                        // the lock plate
    oRect('dark', 2.6, 27.6, 5.2, 4.8, 0, 1),                    // the corner caps
    oRect('dark', 63.4, 27.6, 5.2, 4.8, 0, 1),
    oRect('dark', 2.6, 2.2, 5.2, 4.4, 0, 1),
    oRect('dark', 63.4, 2.2, 5.2, 4.4, 0, 1),
  ),
  oEll('line', 33, 8.8, 1.4, 2.2),                               // the keyhole
  oBar('lit', 8, 1.8, 26, 1.8, 0.8),                             // the light along the lid
]);
export const steamerTrunk = (x: number, y: number, w: number, h: number) => fit(STEAMER_TRUNK, x, y, w, h);

// ── HATBOX ───────────────────────────────────────────────────────────────────
//
// REFERENCE (Commons, an old hat tin open beside its lid). A hatbox is a deep DRUM,
// its top an ellipse seen from a little above, so the far half of the rim shows as the
// dark of the inside over the near edge; a RIBBON BAND runs round it below the rim;
// the LID is a shallow drum of its own, here leaning against the side. Drawn in two
// pieces so what is IN it — letters on end, a folded newspaper — sits between the far
// rim and the near wall. Real units: the box 26 × 22, its far rim 26 × 7.
const HATBOX_BACK: ObjPart[] = h2In(26, 7, [
  ...h2N('hatbox', oEll('mass', 13, 3.5, 26, 7)),                // the far half of the rim
  ...h2N('gloom', oEll('dark', 13, 3.9, 22.6, 5.2)),             // the dark inside
  oBar('lit', 8, 0.9, 18, 0.9, 0.6),                             // the light on the far rim
]);
export const hatboxBack = (x: number, y: number, w: number, h: number) => fit(HATBOX_BACK, x, y, w, h);
const HATBOX_FRONT: ObjPart[] = h2In(26, 22, [
  ...h2N('hatbox',
    oRect('mass', 13, 10.2, 26, 18.4, 0, 0.8),                   // the drum
    oEll('mass', 13, 19.4, 26, 5.2),                             // its round foot
  ),
  ...h2N('hatbox', oRect('dark', 21.6, 10.4, 7.6, 16.4, 0, 0.8)), // the side turned from the lamp
  oRect('lit', 13, 4.6, 25.4, 2),                                // the ribbon band
  oEll('lit', 10, 12.4, 9, 5.6),                                 // the maker's label
  oBar('line', 7.4, 12.4, 12.6, 12.4, 0.6),
]);
export const hatboxFront = (x: number, y: number, w: number, h: number) => fit(HATBOX_FRONT, x, y, w, h);
const HATBOX_LID: ObjPart[] = h2In(8, 26, [
  ...h2N('hatbox', oEll('mass', 4, 13, 8, 26)),                  // the lid, on its edge
  ...h2N('hatbox', oEll('dark', 4.6, 13, 4.4, 21.6)),            // its inside, toward us
  oRect('lit', 1.9, 13, 1.2, 17),                                // its band, edge on
]);
export const hatboxLid = (x: number, y: number, w: number, h: number) => fit(HATBOX_LID, x, y, w, h);

// ── LETTERS ON END, AND THE NEWSPAPER UNDER THEM ─────────────────────────────
//
// REFERENCE (Commons, a First World War letter): old letters are kept in their
// ENVELOPES, on end, tied with a string; the paper has gone yellow. The newspaper at
// the bottom of the box shows only a folded CORNER of grey newsprint and a column rule
// — nothing of what it says (the second question asks about it unread).
const LETTER_BUNDLE: ObjPart[] = h2In(20, 20, h2Dy(8, [
  ...h2N('yellowed',
    oRect('mass', 5.2, 6.8, 8.4, 10.4, 0, 0.4),                  // three envelopes on end,
    oRect('mass', 10.2, 5.6, 8.4, 12.8, 0, 0.4),                 // at three heights
    oRect('mass', 15, 7.6, 8, 8.8, 0, 0.4),
  ),
  oBar('line', 6.5, 1, 5.6, 11, 0.5),                            // the envelopes' edges
  oBar('line', 11, 0.6, 10.6, 11, 0.5),
  oBar('line', 2, 7.6, 18.6, 8.4, 0.6),                          // the string round them
  oBar('line', 7.6, 2.2, 13, 2.6, 0.5),                          // a flap's edge
]));
export const letterBundle = (x: number, y: number, w: number, h: number) => fit(LETTER_BUNDLE, x, y, w, h);
const NEWS_CORNER: ObjPart[] = h2In(12, 12, h2Dy(1, [
  ...h2N('newsprint', oTri('mass', 6, 5, 11, 10, 'up')),         // a folded corner, standing up
  oBar('line', 4.8, 5.2, 4.8, 9.4, 0.5),                         // and its column rules
  oBar('line', 7.2, 5.2, 7.2, 9.4, 0.5),
]));
export const newsCorner = (x: number, y: number, w: number, h: number) => fit(NEWS_CORNER, x, y, w, h);

// ── THE LETTER, OPEN ─────────────────────────────────────────────────────────
//
// REFERENCE (the same): one sheet, folded in three, so two CREASES cross it; the
// writing runs in lines with the DATE at the top right and a signature at the foot.
// Real units, 14 × 18.
const OLD_LETTER: ObjPart[] = h2In(14, 18, [
  ...h2N('yellowed', oRect('mass', 7, 9, 14, 18, 0, 0.5)),
  ...h2N('yellowed', oRect('dark', 7, 6.1, 13.4, 0.5), oRect('dark', 7, 12.1, 13.4, 0.5)),
  oBar('line', 8.6, 2.6, 12.2, 2.6, 0.6),                        // the date
  ...[4.6, 7.6, 9.2, 10.8, 13.6, 15.2].map((y, i) => oBar('line', 2, y, i % 3 === 2 ? 8.4 : 12, y, 0.5)),
  oBar('line', 7.6, 16.8, 11.6, 16.4, 0.6),                      // his name
]);
export const oldLetter = (x: number, y: number, w: number, h: number) => fit(OLD_LETTER, x, y, w, h);

// ── THE HISTORY BOOK ─────────────────────────────────────────────────────────
//
// REFERENCE (Commons, illustrated history books): a hardback with a GLOSSY printed
// cover — a picture panel (here, a castle) under a title strip — its rounded SPINE
// down the left and the PAGE BLOCK showing pale at the fore-edge. Open, the two
// leaves fall from the gutter, a full-page colour plate on the left and type on the
// right. Real units: closed 16 × 20, open 20 × 13.
const castleParts = (cx: number, base: number, s: number): ObjPart[] => [
  ...h2N('stepStone',
    oRect('dark', cx - 3.2 * s, base - 2.8 * s, 2.4 * s, 5.6 * s),          // the towers
    oRect('dark', cx + 3.2 * s, base - 2.8 * s, 2.4 * s, 5.6 * s),
    oRect('dark', cx, base - 1.7 * s, 5 * s, 3.4 * s),                       // the curtain wall
    ...[-3.8, -2.6, 2.6, 3.8].map((d) => oRect('dark', cx + d * s, base - 6 * s, 0.9 * s, 1.2 * s)),
    ...[-1.6, 0, 1.6].map((d) => oRect('dark', cx + d * s, base - 3.8 * s, 0.9 * s, 1 * s)),
  ),
  oRect('line', cx, base - 0.9 * s, 1.4 * s, 1.8 * s, 0, 0.6 * s),          // the gate
  oBar('line', cx + 3.2 * s, base - 5.6 * s, cx + 3.2 * s, base - 8.4 * s, 0.5 * s), // its flag
  ...h2N('awning', oTri('dark', cx + 4.1 * s, base - 7.9 * s, 1.8 * s, 1.2 * s, 'right')),
];
const HISTORY_BOOK: ObjPart[] = h2In(16, 20, [
  ...h2N('paper', oRect('mass', 14.4, 10.2, 3, 18.8, 0, 0.5)),   // the page block
  ...h2N('bookBlue',
    oRect('mass', 7.6, 10, 15.2, 20, 0, 1),                      // the cover
    oRect('dark', 1, 10, 2, 19.6, 0, 1),                         // the spine
  ),
  oRect('lit', 8.4, 4, 10.6, 3.4, 0, 0.4),                       // the title strip
  oBar('line', 5.2, 4, 11.6, 4, 0.7),
  oRect('lit', 8.4, 12.8, 10.6, 10, 0, 0.6),                     // the picture panel
  ...castleParts(8.4, 17, 0.95),
]);
export const historyBook = (x: number, y: number, w: number, h: number) => fit(HISTORY_BOOK, x, y, w, h);
const HISTORY_BOOK_OPEN: ObjPart[] = h2In(20, 13, [
  ...h2N('bookBlue', oRect('mass', 10, 7.8, 20, 10.4, 0, 1)),    // the covers, beneath
  ...h2N('paper',
    oRect('mass', 5.3, 6.4, 9.8, 11.2, 0, 0.5),                  // the two leaves
    oRect('mass', 14.7, 6.4, 9.8, 11.2, 0, 0.5),
    oRect('dark', 10, 6.4, 1.2, 11),                             // the gutter
  ),
  ...h2N('clearSky', oRect('dark', 5.2, 6, 7.4, 8.4)),           // the plate's sky
  ...castleParts(5.2, 9.6, 0.62),
  ...[2.8, 4.4, 6, 7.6, 9.2].map((y, i) => oBar('line', 11.8, y, i === 4 ? 15.6 : 18.2, y, 0.45)),
]);
export const historyBookOpen = (x: number, y: number, w: number, h: number) => fit(HISTORY_BOOK_OPEN, x, y, w, h);

// ── MUSEUM LEAFLET ───────────────────────────────────────────────────────────
//
// REFERENCE: a museum's tri-fold leaflet stood on its end — a glossy cover panel with
// the museum's FRONT on it (a pediment on columns), the next panel folding away in
// shade, a few lines of type below. Real units, 12 × 16.
const MUSEUM_LEAFLET: ObjPart[] = h2In(12, 16, [
  ...h2N('paper',
    oRect('mass', 5.4, 8, 10.8, 16, 0, 0.4),
    oRect('face', 11.2, 8.4, 1.8, 15, 0, 0.3),                   // the next panel, folding away
  ),
  ...h2N('canvasTeal', oRect('dark', 5.4, 5.2, 9.2, 8.6, 0, 0.4)),
  oTri('lit', 5.4, 2.6, 7.2, 1.9, 'up'),                         // the museum: pediment,
  oRect('lit', 5.4, 3.9, 7.2, 0.7),
  ...[2.8, 4.5, 6.3, 8].map((x) => oRect('lit', x, 6, 0.9, 3.4)),  // columns,
  oRect('lit', 5.4, 8.1, 7.8, 0.8),                              // steps
  ...[11.4, 12.8, 14.2].map((y, i) => oBar('line', 1.8, y, i === 2 ? 6.4 : 9, y, 0.45)),
]);
export const museumLeaflet = (x: number, y: number, w: number, h: number) => fit(MUSEUM_LEAFLET, x, y, w, h);

// ── THE NEWSPAPER, OPEN ──────────────────────────────────────────────────────
//
// REFERENCE (Commons, The New Orleans Item, front page, March 1916): a masthead
// between two RULES, a big headline across the top, then COLUMNS of type and a
// PICTURE. Here the picture is the story: a heap of potatoes. The scene sets the date
// in the masthead as a word. Real units, 30 × 26.
const OLD_NEWSPAPER: ObjPart[] = h2In(30, 26, [
  ...h2N('newsprint', oRect('mass', 15, 13, 30, 26, 0, 0.4)),
  ...h2N('newsprint', oRect('dark', 15, 13, 0.6, 25.4)),         // the fold
  oBar('line', 1.4, 1.6, 28.6, 1.6, 0.6),                        // the masthead's rules
  oBar('line', 1.4, 10.4, 28.6, 10.4, 0.6),
  ...h2N('newsprint', oRect('dark', 8.6, 18.4, 14.6, 12)),       // the picture's ground
  ...([[4, 21.6], [8.4, 22], [12.8, 21.6], [6.2, 18.8], [10.8, 19], [8.6, 16.2], [4.4, 18.6], [12.8, 18.4]] as const)
    .flatMap(([x, y]) => [oEll('line', x, y, 5.4, 3.8), ...h2N('potato', oEll('dark', x, y, 4.4, 2.9))]),
  ...[13.4, 15, 16.6, 18.2, 19.8, 21.4, 23].flatMap((y) => [oBar('line', 17.6, y, 22.4, y, 0.45), oBar('line', 23.8, y, 28.4, y, 0.45)]),
]);
export const oldNewspaper = (x: number, y: number, w: number, h: number) => fit(OLD_NEWSPAPER, x, y, w, h);

// ── THE PORTRAIT OF GREAT-GRANDAD ────────────────────────────────────────────
//
// REFERENCE (Commons, an ancestral gallery of framed portraits): a GILT FRAME round a
// dark old picture, the sitter head-and-shoulders. Here he is in a 1916 soldier's
// TUNIC and PEAKED CAP, a medal on his chest — and, being family, a stickman. Real
// units, 30 × 38.
const PORTRAIT_FRAME: ObjPart[] = h2In(30, 38, [
  ...h2N('sepia', oRect('mass', 15, 19, 24, 32)),                // the picture
  ...h2N('brass',
    oRect('mass', 15, 2, 30, 4.4),                               // the frame
    oRect('mass', 15, 36, 30, 4.4),
    oRect('mass', 2, 19, 4.4, 38),
    oRect('mass', 28, 19, 4.4, 38),
  ),
  ...h2N('brass', ...[[2, 2], [28, 2], [2, 36], [28, 36]].map(([x, y]) => oEll('dark', x, y, 3.4, 3.4))),
  ...h2N('khaki', oRect('dark', 15, 31.4, 18, 9.4, 0, 3.6)),     // his tunic
  oBar('line', 15, 23, 15, 27.4, 2.4),                           // his neck
  oEll('line', 15, 19.4, 9, 9),                                  // his head
  ...h2N('khaki', oRect('dark', 15, 13.4, 11, 5, 0, 1.6)),       // his cap's crown,
  oBar('line', 9.4, 15.9, 20.6, 15.9, 1),                        // its band
  oBar('line', 15, 16.6, 22, 17.6, 1.4),                         // and its peak
  ...h2N('brass', oEll('dark', 12.2, 30.4, 2.2, 2.2)),           // his medal
]);
export const portraitFrame = (x: number, y: number, w: number, h: number) => fit(PORTRAIT_FRAME, x, y, w, h);

// ── BOOKS ON A SHELF ─────────────────────────────────────────────────────────
//
// REFERENCE: hardbacks stood spine-out are tall thin slabs of different heights and
// cloths, each with bands blocked across the spine.
// Real units, 26 × 22, set in the foot of a 26-unit square.
const SHELF_BOOKS: ObjPart[] = h2In(26, 26, h2Dy(4, [
  ...h2N('bookCloth', oRect('mass', 2.3, 12, 4.4, 20, 0, 0.5)),
  ...h2N('trunk', oRect('mass', 6.9, 11, 4.6, 22, 0, 0.5)),
  ...h2N('wood', oRect('mass', 11.6, 13.2, 4.6, 17.6, 0, 0.5)),
  ...h2N('khaki', oRect('mass', 16.2, 12.2, 4.6, 19.6, 0, 0.5)),
  ...h2N('bookBlue', oRect('mass', 20.8, 13.6, 4.4, 17.6, 0, 0.5)),
  ...[4.6, 9.2, 13.9].map((x) => oBar('line', x, 3, x, 22, 0.6)),
  ...[[2.3, 5], [6.9, 3.4], [11.6, 7], [16.2, 5.6], [2.3, 18.6], [6.9, 19], [11.6, 19], [16.2, 19]]
    .map(([x, y]) => oBar('lit', x - 1.4, y, x + 1.4, y, 0.7)),
]));
export const shelfBooks = (x: number, y: number, w: number, h: number) => fit(SHELF_BOOKS, x, y, w, h);

// ── hist2: objects for this lesson go ABOVE this line ──

// ─────────────────────────────────────────────────────────────────────────────
// philosophy-foundations-3 — A LIBRARY RETURNS DESK. The desk in light oak, a tall
// bookcase, the FOUND PROPERTY sign hung over the desk on two chains, a library date
// stamp, a stack of returned books, the novel open in a reader's hands and the leaf
// she turns, a LOST poster with tear-off tabs and its pushpin, two flyers, and the
// lost property box with its flaps folded open (drawn back and front, so a note can
// drop in between).
// ─────────────────────────────────────────────────────────────────────────────

/** Parts in a named real colour (AP11). */
const p3N = (k: NaturalKey, ...ps: ObjPart[]): ObjPart[] => ps.map((p) => ({ ...p, nat: k }));
/** Author in real units (an ax × ay box) and hand it to `fit` as the 100-square. */
function p3In(ax: number, ay: number, parts: readonly ObjPart[]): ObjPart[] {
  const sx = 100 / ax;
  const sy = 100 / ay;
  const s = 100 / Math.min(ax, ay);
  return parts.map((p) => {
    if (p.k === 'bar') return { ...p, x1: p.x1 * sx, y1: p.y1 * sy, x2: p.x2 * sx, y2: p.y2 * sy, t: p.t * s };
    return { ...p, x: p.x * sx, y: p.y * sy, w: p.w * sx, h: p.h * sy, ...(p.k === 'rect' ? { rad: p.rad * s } : null) } as ObjPart;
  });
}

// ── THE RETURNS DESK ─────────────────────────────────────────────────────────
//
// REFERENCE (Commons, library circulation desks): a long counter at a standing
// person's hip, its TOP overhanging the front by a lip and casting a shadow on it,
// the front in SUNK PANELS, a dark kick plinth at the floor. Real units, 124 × 24.
const LIB_DESK: ObjPart[] = p3In(124, 24, [
  ...p3N('oak',
    oRect('mass', 62, 14.1, 120, 19.8),                            // the front, under the top
    oRect('mass', 62, 2.2, 124, 4.4, 0, 1),                        // the top, overhanging it
    oRect('dark', 62, 5.1, 118, 1.4),                              // the shadow the top casts
    ...[22, 62, 102].map((x) => oRect('dark', x, 13.2, 32, 10.6, 0, 0.8)), // three sunk panels
  ),
  ...[22, 62, 102].map((x) => oBar('lit', x - 15, 18.6, x + 15, 18.6, 0.7)), // each panel's lit lower lip
  ...p3N('wood', oRect('dark', 62, 22.4, 120, 3.2)),               // the kick plinth
  oBar('lit', 1.6, 0.9, 122.4, 0.9, 0.8),                          // the lamp along the top's edge
]);
export const libDesk = (x: number, y: number, w: number, h: number) => fit(LIB_DESK, x, y, w, h);

// ── THE BOOKCASE ─────────────────────────────────────────────────────────────
//
// REFERENCE (Commons, wooden bookcases full of books): a tall carcass with a
// cornice, the inside in shadow, shelves across it, and on each shelf a row of
// SPINES of different heights, widths and cloths, each with bands blocked near its
// head and foot; a row rarely fills its shelf, and the last book LEANS. Real units,
// 56 × 140. The books sit 0.7 apart so the dark of the case shows between spines.
const P3_CLOTHS: NaturalKey[] = ['bookCloth', 'bookBlue', 'trunk', 'khaki', 'brick', 'umbNavy', 'tinPaint', 'novel', 'teapotGlaze', 'mugGlaze'];
const P3_ROWS: { floor: number; books: [number, number][] }[] = [
  { floor: 39.5, books: [[4.4, 24], [3.6, 21], [5, 26], [4, 23], [3.4, 20], [4.6, 25], [4, 22], [4.4, 24]] },
  { floor: 69.5, books: [[5, 25], [4, 22], [3.6, 24], [4.6, 26], [4.2, 21], [3.8, 23], [5, 25]] },
  { floor: 99.5, books: [[3.8, 22], [4.6, 26], [4.2, 24], [5, 23], [3.6, 21], [4.4, 25], [4, 24], [3.6, 22]] },
  { floor: 130, books: [[5, 26], [4.4, 24], [3.8, 22], [4.6, 25], [4, 23], [5, 26]] },
];
function p3Shelf(): ObjPart[] {
  const out: ObjPart[] = [];
  const bands: ObjPart[] = [];
  let k = 0;
  for (const row of P3_ROWS) {
    let x = 6.6;
    for (const [w, h] of row.books) {
      const cx = x + w / 2;
      const top = row.floor - h;
      out.push(...p3N(P3_CLOTHS[k % P3_CLOTHS.length], oRect('mass', cx, row.floor - h / 2, w, h, 0, 0.4)));
      bands.push(oBar('lit', cx - w / 2 + 0.9, top + 3, cx + w / 2 - 0.9, top + 3, 0.6));
      bands.push(oBar('lit', cx - w / 2 + 0.9, row.floor - 3, cx + w / 2 - 0.9, row.floor - 3, 0.6));
      x += w + 0.7;
      k += 3;
    }
    // the last book leans on its neighbour
    const lw = 3.8;
    const lh = 22;
    out.push(...p3N(P3_CLOTHS[(k + 1) % P3_CLOTHS.length], oRect('mass', x + 3.4, row.floor - 10.8, lw, lh, 14, 0.4)));
    k += 2;
  }
  return [...out, ...bands];
}
const BOOKCASE: ObjPart[] = p3In(56, 140, [
  ...p3N('wood',
    oRect('mass', 28, 72, 54, 136, 0, 0.6),                        // the sides, top and base
    oRect('mass', 28, 4, 58, 8, 0, 1),                             // the cornice
    oRect('face', 28, 71, 44, 118),                                // the inside, in shadow
    ...[41, 71, 101].map((y) => oRect('mass', 28, y, 44, 3)),      // the shelves
  ),
  ...p3Shelf(),
  ...p3N('wood', oRect('dark', 28, 135.4, 46, 5)),                 // the kick under the last shelf
  oBar('lit', 0.8, 0.9, 55.2, 0.9, 0.8),                           // the lamp along the cornice
]);
export const libBookcase = (x: number, y: number, w: number, h: number) => fit(BOOKCASE, x, y, w, h);

// ── THE FOUND PROPERTY SIGN ──────────────────────────────────────────────────
//
// REFERENCE: a library's hanging sign is a framed board on two CHAINS from the
// ceiling, its words on a pale face inside a coloured frame. A chain is a row of
// links, not a rod. Real units, 60 × 100: chains 0–70, the board 70–100; the face
// the scene writes on is FOUND_FACE.
const FOUND_SIGN: ObjPart[] = p3In(60, 100, [
  ...p3N('tinPaint', oRect('mass', 30, 85, 60, 30, 0, 2.5)),       // the board, in library green
  oRect('lit', 30, 85.6, 52, 21.6, 0, 1.2),                        // the pale face the words are on
  oBar('lit', 3, 70.9, 57, 70.9, 0.8),                             // the lamp along its top
  ...[12, 48].flatMap((x) => Array.from({ length: 23 }, (_, i) => oEll('line', x, 1.6 + i * 3, 1.5, 2.8))), // the chains
  oEll('line', 12, 71.6, 3, 3),                                    // the eyes they hang from
  oEll('line', 48, 71.6, 3, 3),
]);
export const foundSign = (x: number, y: number, w: number, h: number) => fit(FOUND_SIGN, x, y, w, h);
/** The face the words go on, in the sign's own 60 × 100 units. */
export const FOUND_FACE = { x: 30, y: 85.6, w: 52, h: 21.6 } as const;

// ── THE DATE STAMP ───────────────────────────────────────────────────────────
//
// REFERENCE (Commons, "Date stamp 2025-04-17", a library band dater): a cream
// handle with a green CAP on top, a CHROME FRAME below it, and in the frame the
// rubber date BANDS whose foot prints the date. Real units, 10 × 20, standing on its
// bands; it is held by the handle (STAMP_GRIP).
const DATE_STAMP: ObjPart[] = p3In(10, 20, [
  ...p3N('stampBand', oRect('mass', 5, 1.8, 7.4, 3.6, 0, 1.4)),    // the cap
  ...p3N('stampGrip', oRect('mass', 5, 6.6, 4.6, 6.6, 0, 0.8)),    // the handle
  ...p3N('silver', oRect('mass', 5, 13.6, 10, 7.6, 0, 0.8)),       // the chrome frame
  ...p3N('stampBand', oRect('mass', 5, 18.6, 8.4, 2.8, 0, 0.5)),   // the rubber at its foot
  ...p3N('stampBand', oRect('dark', 5, 14.4, 6, 5)),               // the date bands, in the frame
  oBar('line', 3.6, 12.4, 3.6, 16.6, 0.5),                         // between the bands
  oBar('line', 6.4, 12.4, 6.4, 16.6, 0.5),
  oBar('lit', 1.3, 10.6, 1.3, 16.4, 0.8),                          // the light on the chrome
]);
export const dateStamp = (x: number, y: number, w: number, h: number) => fit(DATE_STAMP, x, y, w, h);
/** Where the stamp is held, in its own 10 × 20 units. */
export const STAMP_GRIP = { x: 5, y: 6.6 } as const;

// ── A STACK OF RETURNED BOOKS ────────────────────────────────────────────────
//
// REFERENCE: books lying flat show their FORE-EDGES — a pale block of pages between
// two cover boards — and no two are the same size, so the stack steps. Real units,
// 30 × 14.
const BOOK_STACK: ObjPart[] = p3In(30, 14, [
  ...p3N('bookBlue', oRect('mass', 15, 11.4, 29, 5, 0, 0.8)),
  ...p3N('khaki', oRect('mass', 13.8, 6.8, 25, 4.4, 0, 0.8)),
  ...p3N('bookCloth', oRect('mass', 15.6, 2.4, 22, 4.4, 0, 0.8)),
  oRect('lit', 16.4, 11.4, 23, 2.4),                               // the page edges between the boards
  oRect('lit', 15, 6.8, 19, 2),
  oRect('lit', 16.8, 2.4, 16, 2),
]);
export const bookStack = (x: number, y: number, w: number, h: number) => fit(BOOK_STACK, x, y, w, h);

// ── THE NOVEL, OPEN, AND THE LEAF SHE TURNS ──────────────────────────────────
//
// REFERENCE (BOOK above, and a paperback held open): two pale LEAVES meeting at a
// shaded gutter, lines of type across both, and the coloured COVER showing round
// them at the sides and foot. Real units, 26 × 16. The leaf is its own drawing,
// 12 × 12.4, so the scene can turn it over about the gutter.
const NOVEL_OPEN: ObjPart[] = p3In(26, 16, [
  ...p3N('novel', oRect('mass', 13, 9.6, 26, 12.8, 0, 1)),          // the covers, round the pages
  ...p3N('paper',
    oRect('mass', 7, 8.2, 11.6, 12.4, 0, 1),                       // the left leaf
    oRect('mass', 19, 8.2, 11.6, 12.4, 0, 1),                      // the right
    oRect('dark', 13, 8.4, 1.6, 12.2),                             // the gutter, in shadow
  ),
  ...[4.4, 6.6, 8.8, 11].flatMap((y) => [oBar('line', 2.6, y, 11, y, 0.45), oBar('line', 15, y, 23.4, y, 0.45)]),
]);
export const novelOpen = (x: number, y: number, w: number, h: number) => fit(NOVEL_OPEN, x, y, w, h);
const NOVEL_LEAF: ObjPart[] = p3In(12, 12.4, [
  ...p3N('paper', oRect('mass', 6, 6.2, 11.6, 12.4, 0, 1)),
  ...p3N('paper', oRect('dark', 1, 6.2, 1.4, 12)),                  // its gutter edge, in shadow
  ...[2.2, 4.4, 6.6, 8.8].map((y) => oBar('line', 2.4, y, 10.4, y, 0.45)),
]);
export const novelLeaf = (x: number, y: number, w: number, h: number) => fit(NOVEL_LEAF, x, y, w, h);

// ── THE LOST POSTER, ITS PIN, AND THE FLYERS ─────────────────────────────────
//
// REFERENCE: a lost-property notice on a cork board is a sheet of paper with a
// heading in big letters and a row of TEAR-OFF TABS cut along its foot, pinned by
// one coloured pushpin; its corner curls. Real units, 28 × 34; the words are the
// scene's (y 2–27). A flyer is smaller, with a coloured band for its heading.
const LOST_POSTER: ObjPart[] = p3In(28, 34, [
  ...p3N('paper', oRect('mass', 14, 17, 28, 34, 0, 0.6)),
  ...p3N('paper', oTri('dark', 26, 32, 4, 4, 'left')),             // the corner curling up
  ...[5.6, 10.2, 14.8, 19.4].map((x) => oBar('line', x, 28.6, x, 33.4, 0.4)), // the tear-off tabs
  oBar('line', 1.6, 28.4, 26.4, 28.4, 0.4),
]);
export const lostPoster = (x: number, y: number, w: number, h: number) => fit(LOST_POSTER, x, y, w, h);
const PUSHPIN: ObjPart[] = p3In(6, 6, [
  ...p3N('apple', oEll('mass', 3, 3, 6, 6)),
  ...p3N('apple', oEll('dark', 3.6, 3.7, 3.4, 3.2)),
  oEll('lit', 2.1, 2, 1.6, 1.6),
]);
export const pushpin = (x: number, y: number, w: number, h: number) => fit(PUSHPIN, x, y, w, h);
const FLYER: ObjPart[] = p3In(16, 20, [
  ...p3N('paper', oRect('mass', 8, 10, 16, 20, 0, 0.5)),
  ...p3N('water', oRect('dark', 8, 4.6, 13, 5)),                   // its coloured heading band
  ...[10, 12.6, 15.2, 17.6].map((y, i) => oBar('line', 2.4, y, i === 3 ? 9.6 : 13.6, y, 0.55)),
]);
export const flyer = (x: number, y: number, w: number, h: number) => fit(FLYER, x, y, w, h);

// ── THE LOST PROPERTY BOX ────────────────────────────────────────────────────
//
// REFERENCE (Commons, open cardboard boxes): a brown box whose four FLAPS stand
// folded out — the back one up behind the mouth, the two side ones splayed outward —
// the inside dark, a pale crease of light along the front's top edge, and the right
// SIDE showing in shade. Drawn in two halves, back and front, in one 64 × 38 box, so
// a thing dropped in falls between them: front 2–56 × 12–38, side 56–62.
const BOX_BACK: ObjPart[] = p3In(64, 38, [
  ...p3N('cardboard',
    oRect('mass', 30, 5.6, 48, 9, 0, 0.5),                         // the back flap, folded up
    oBar('mass', 5, 13, 1.9, 2.4, 3.4),                            // the left flap, folded out
    oBar('mass', 57.4, 11.4, 61.2, 2, 3.4),                        // the right
    oRect('face', 30, 22.5, 52, 31),                               // the inside and back wall, in shadow
  ),
]);
export const boxBack = (x: number, y: number, w: number, h: number) => fit(BOX_BACK, x, y, w, h);
const BOX_FRONT: ObjPart[] = p3In(64, 38, [
  ...p3N('cardboard',
    oRect('mass', 29, 25, 54, 26, 0, 0.5),                         // the front
    oRect('face', 59, 23.6, 6, 28.8),                              // the right side, in shade
    oRect('dark', 29, 36.7, 52, 2.2),                              // its foot, in its own shadow
  ),
  oBar('lit', 2.6, 12.5, 55.4, 12.5, 0.8),                         // the light along the front's top
]);
export const boxFront = (x: number, y: number, w: number, h: number) => fit(BOX_FRONT, x, y, w, h);

// ── phil3: objects for this lesson go ABOVE this line ──

// ─────────────────────────────────────────────────────────────────────────────
// THE GALLERY, for Psychology lesson 3 (2026-10-01). Drawn against pictures fetched
// with `node scripts/get-reference.mjs` (scratchpad/ref/p3-*): a gallery of portraits
// in GILT frames on white walls with a bust on a plain WHITE PLINTH and a small label on
// it (p3-room); a museum showcase of cups behind glass on a long low plinth (p3-case); a
// brown-glazed stoneware mug with a CHIP out of its rim showing the pale body under the
// glaze, its handle a squared loop (p3-chipped); and a wooden stool, a thick seat on an
// apron over four SPLAYED legs (p3-stool).
// ─────────────────────────────────────────────────────────────────────────────

/** Parts in a named real colour (AP11). */
const ps3N = (k: NaturalKey, ...ps: ObjPart[]): ObjPart[] => ps.map((p) => ({ ...p, nat: k }));
/** Author in real units (an ax × ay box) and hand it to `fit` as the 100-square. */
function ps3In(ax: number, ay: number, parts: readonly ObjPart[]): ObjPart[] {
  const sx = 100 / ax;
  const sy = 100 / ay;
  const s = 100 / Math.min(ax, ay);
  return parts.map((p) => {
    if (p.k === 'bar') return { ...p, x1: p.x1 * sx, y1: p.y1 * sy, x2: p.x2 * sx, y2: p.y2 * sy, t: p.t * s };
    return { ...p, x: p.x * sx, y: p.y * sy, w: p.w * sx, h: p.h * sy, ...(p.k === 'rect' ? { rad: p.rad * s } : null) } as ObjPart;
  });
}

// ── THE PLINTH ───────────────────────────────────────────────────────────────
//
// REFERENCE (p3-room, p3-case): a gallery plinth is a plain WHITE box — no mouldings, no
// cap — with a shadowed toe recess at its foot, and seen a little from the side, its
// right-hand side plane in shade. Long and low under a showcase. Real units, 100 × 26.
const GALLERY_PLINTH: ObjPart[] = ps3In(100, 26, [
  ...ps3N('plinthWhite',
    oRect('mass', 47, 13, 94, 26),                                // the front face
    oRect('face', 97, 13.4, 6, 25.2),                             // the side, turned from the lamp
    oRect('dark', 47, 24.2, 88, 2.6),                             // the toe recess
  ),
  oBar('lit', 1.4, 1, 92.6, 1, 0.8),                              // the lit top edge
]);
export const galleryPlinth = (x: number, y: number, w: number, h: number) => fit(GALLERY_PLINTH, x, y, w, h);

// ── THE SHOWCASE: ITS GLASS, AND ITS FRAME ───────────────────────────────────
//
// REFERENCE (p3-case): a museum showcase is a GLASS BOX on a dark base rail with a
// slim top rail; what says glass is a pale cool tint, the frame's edges, and long
// diagonal GLINTS across the front pane. Two drawings so the scene can put the mug
// between them: the glass body behind it, the frame and the glints in front. Real units,
// 42 × 28 each, drawn in the same box.
const CASE_GLASS: ObjPart[] = ps3In(42, 28, [
  ...ps3N('glass',
    oRect('mass', 21, 14.4, 40, 25.2),                             // the glass body
    oRect('dark', 21, 3.4, 38, 2.4),                               // the shadow under the lid
    oRect('dark', 21, 24.4, 38, 2.2),                              // the case's floor, seen through
  ),
]);
export const caseGlass = (x: number, y: number, w: number, h: number) => fit(CASE_GLASS, x, y, w, h);
const CASE_FRAME: ObjPart[] = ps3In(42, 28, [
  ...ps3N('wood',
    oRect('mass', 21, 26.2, 42, 3.6, 0, 0.5),                      // the base rail
    oRect('mass', 21, 1.4, 42, 2.8, 0, 0.5),                       // the top rail
  ),
  oBar('line', 1.2, 2.4, 1.2, 24.6, 0.9),                          // the corner posts
  oBar('line', 40.8, 2.4, 40.8, 24.6, 0.9),
  oBar('lit', 5, 22, 12, 6, 1.4),                                  // glints on the front pane
  oBar('lit', 8.4, 22.4, 13.6, 11, 0.7),
  oBar('lit', 31, 21, 36, 9, 1),
  oBar('lit', 1.6, 3.6, 40.4, 3.6, 0.5),                           // the top rail's lit edge
]);
export const caseFrame = (x: number, y: number, w: number, h: number) => fit(CASE_FRAME, x, y, w, h);

// ── THE CHIPPED MUG, FROM THE SIDE ───────────────────────────────────────────
//
// REFERENCE (p3-chipped): a stoneware mug glazed treacle brown, a little WIDER at the
// foot than the rim, its handle a SQUARED loop standing clear of the side, the rim seen
// from a little above with the pale glaze inside, and a CHIP out of the rim where the
// bare buff body shows. Real units, 16 × 14.
const CHIPPED_MUG: ObjPart[] = ps3In(16, 14, [
  ...ps3N('mugBrown',
    oBar('mass', 10.6, 4.4, 14.6, 4.4, 1.8),                       // the handle, a squared loop
    oBar('mass', 14.6, 4.4, 14.6, 10.6, 1.8),
    oBar('mass', 14.6, 10.6, 10.6, 10.6, 1.8),
    ...trapezoid('mass', 6, 8.2, 10.4, 11.4, 10.8),                // the body, wider at the foot
    oEll('mass', 6, 2.8, 10.4, 2.8),                               // the rim, from a little above
    oRect('dark', 9.6, 8.6, 2.2, 9.4, 0, 0.6),                     // the side turned from the lamp
  ),
  ...ps3N('clay',
    oEll('dark', 6, 3, 8.4, 1.7),                                  // the pale glaze inside
    oEll('dark', 3, 3.6, 2.6, 2),                                  // and THE CHIP, bare body
  ),
  oBar('lit', 2.2, 5.4, 2.4, 11.8, 0.8),                           // the glaze's shine
]);
export const chippedMug = (x: number, y: number, w: number, h: number) => fit(CHIPPED_MUG, x, y, w, h);
/** The handle, where a hand holds it, in the mug's 16 × 14 box (from its top-left). */
export const MUG3_GRIP = { x: 14.6, y: 7.5 } as const;

// ── THE MUG, TURNED OVER ─────────────────────────────────────────────────────
//
// REFERENCE (p3-chipped, a mug's underside): seen from below a mug is its FOOT — a ring
// of bare unglazed body round a glazed recess — with the handle standing off one side.
// The STICKER sits in the recess: a white label with two lines of small print. Real
// units, 18 × 14.
const MUG3_BASE: ObjPart[] = ps3In(18, 14, [
  ...ps3N('mugBrown',
    oBar('mass', 13, 7, 17, 7, 2.6),                               // the handle, end-on
    oEll('mass', 7, 7, 14, 14),                                    // the glazed outside
  ),
  ...ps3N('clay', oEll('dark', 7, 7, 11.4, 11.4)),                  // the bare foot ring
  ...ps3N('mugBrown', oEll('dark', 7, 7, 8.6, 8.6)),                // the glazed recess
  oRect('lit', 7, 7, 8.2, 5, 0, 0.6),                              // THE STICKER
  oBar('line', 4.2, 6, 9.8, 6, 0.45),                              // its small print
  oBar('line', 4.2, 7.8, 8.6, 7.8, 0.45),
]);
export const mugBase = (x: number, y: number, w: number, h: number) => fit(MUG3_BASE, x, y, w, h);

// ── THE LABEL'S STAND ────────────────────────────────────────────────────────
//
// REFERENCE (p3-room): a gallery label on a plinth stands on a small brass foot, propped
// by a strut behind. The plaque itself is lettering, so the scene draws it as a plate;
// this is the foot and the strut under it. Real units, 46 × 6.
const LABEL_STAND: ObjPart[] = ps3In(46, 6, [
  ...ps3N('brass',
    oBar('face', 38, 0.6, 43, 5, 1.6),                             // the strut behind
    oRect('mass', 23, 4.6, 42, 2.6, 0, 0.6),                       // the foot
  ),
  oBar('lit', 3, 3.6, 43, 3.6, 0.4),
]);
export const labelStand = (x: number, y: number, w: number, h: number) => fit(LABEL_STAND, x, y, w, h);

// ── THE BLANK CARD ───────────────────────────────────────────────────────────
//
// An index card: white board, its corners just rounded, a hint of thickness along the
// edge away from the lamp. Real units, 48 × 26.
const BLANK_CARD: ObjPart[] = ps3In(48, 26, [
  ...ps3N('paper',
    oRect('mass', 23.6, 12.6, 47.2, 25.2, 0, 1),
    oRect('face', 24.4, 25.3, 47.2, 1.4, 0, 0.6),                  // its edge, in shade
  ),
  oBar('lit', 2, 1.4, 45, 1.4, 0.8),                               // its lit top edge
]);
export const blankCard = (x: number, y: number, w: number, h: number) => fit(BLANK_CARD, x, y, w, h);

// ── THE ATTENDANT'S STOOL ────────────────────────────────────────────────────
//
// REFERENCE (p3-stool): a plain wooden stool — a thick SEAT slab, an APRON under it,
// four legs that SPLAY outward to the floor; the two at the back show between the front
// pair, in shade. Real units, 26 × 14.
const GALLERY_STOOL: ObjPart[] = ps3In(26, 14, [
  ...ps3N('wood',
    oBar('face', 9, 4, 7.6, 13, 1.8),                              // the back legs
    oBar('face', 17, 4, 18.4, 13, 1.8),
    oBar('mass', 5, 4, 2, 13.6, 2.2),                              // the front legs, splayed
    oBar('mass', 21, 4, 24, 13.6, 2.2),
    oRect('mass', 13, 5, 19, 2.6),                                 // the apron
    oRect('mass', 13, 1.8, 26, 3.6, 0, 0.6),                       // the seat
  ),
  oBar('lit', 1, 0.5, 25, 0.5, 0.6),
]);
export const galleryStool = (x: number, y: number, w: number, h: number) => fit(GALLERY_STOOL, x, y, w, h);

// ── THE GALLERY WINDOW ───────────────────────────────────────────────────────
//
// REFERENCE (p3-gallery-2, a gallery's round-headed windows): a tall window with a
// ROUND HEAD, a white frame, glazing bars dividing the sky into panes, and a deep sill.
// Real units, 64 × 88.
const GALLERY_WINDOW: ObjPart[] = ps3In(64, 88, [
  ...ps3N('plinthWhite',
    oRect('mass', 32, 50, 58, 64),                                 // the frame,
    oEll('mass', 32, 22, 58, 40),                                  // round-headed
  ),
  ...ps3N('clearSky',
    oRect('mass', 32, 51, 46, 58),                                 // the sky through it
    oEll('mass', 32, 24, 46, 32),
  ),
  oBar('lit', 14, 76, 22, 60, 1.6),                                // light on the glass
  oBar('lit', 40, 50, 46, 38, 1.2),
  oBar('line', 32, 8, 32, 80, 1.6),                                // the glazing bars
  oBar('line', 9, 44, 55, 44, 1.6),
  oBar('line', 9, 62, 55, 62, 1.2),
  ...ps3N('plinthWhite',
    oRect('mass', 32, 84, 64, 5, 0, 1),                            // the sill, proud of the frame
    oRect('face', 32, 87.2, 62, 1.6),
  ),
]);
export const galleryWindow = (x: number, y: number, w: number, h: number) => fit(GALLERY_WINDOW, x, y, w, h);

// ── A PAINTING IN A GILT FRAME ───────────────────────────────────────────────
//
// REFERENCE (p3-room): a gallery hangs its pictures in broad GILT frames — a bright
// outer moulding, a shaded inner step, then the canvas. This one is a landscape: hills
// under a sky. Real units, 64 × 50.
const GILT_PAINTING: ObjPart[] = ps3In(64, 50, [
  ...ps3N('brass', oRect('mass', 32, 25, 64, 50, 0, 1)),            // the gilt moulding
  ...ps3N('brass', oRect('dark', 32, 25, 54, 40)),                  // its inner step, in shade
  ...ps3N('clearSky', oRect('dark', 32, 25, 48, 34)),               // the canvas: sky
  ...ps3N('meadow',
    oTri('dark', 22, 33, 30, 16, 'up'),                            // two hills
    oTri('dark', 43, 35, 30, 12, 'up'),
    oRect('dark', 32, 39.5, 48, 5),                                // and the field in front
  ),
  ...ps3N('sunshine', oEll('dark', 47, 15, 6, 6)),
  oBar('lit', 2, 2, 62, 2, 0.8),                                   // the moulding's lit edge
]);
export const giltPainting = (x: number, y: number, w: number, h: number) => fit(GILT_PAINTING, x, y, w, h);

// ── psych3: objects for this lesson go ABOVE this line ──

// ─────────────────────────────────────────────────────────────────────────────
// THE PARK RUNNING TRACK, for Personal Growth lesson 3 (2026-10-01). Drawn against
// pictures fetched with `node scripts/get-reference.mjs` (scratchpad/ref/growth3-*):
// village notice boards on two posts under a gabled cap (Burstall, Great Finborough),
// a mechanical stopwatch with its crown and bow (Hanhart), a litter bin standing by the
// athletics track at Medway Park, an aluminium sports bottle with a black cap.
// ─────────────────────────────────────────────────────────────────────────────

/** Parts in one named real colour. */
const g3 = (k: NaturalKey, ...ps: ObjPart[]): ObjPart[] => ps.map((p) => ({ ...p, nat: k }));
/** Author in real units (an ax × ay box) and hand it to `fit` as the 100-square. */
function g3In(ax: number, ay: number, parts: readonly ObjPart[]): ObjPart[] {
  const sx = 100 / ax;
  const sy = 100 / ay;
  const s = 100 / Math.min(ax, ay);
  return parts.map((p) => {
    if (p.k === 'bar') return { ...p, x1: p.x1 * sx, y1: p.y1 * sy, x2: p.x2 * sx, y2: p.y2 * sy, t: p.t * s };
    return { ...p, x: p.x * sx, y: p.y * sy, w: p.w * sx, h: p.h * sy, ...(p.k === 'rect' ? { rad: p.rad * s } : null) } as ObjPart;
  });
}

// ── RUNNING TRACK ────────────────────────────────────────────────────────────
//
// REFERENCE. An athletics track is red rubber ruled into LANES by white lines, the
// lanes running away along the straight; a START LINE crosses a lane at a slant when
// it is seen from the side. The white lines on red are the field mark — a red floor
// is a carpet. Real units, 400 × 16: the kerb line at the top, one lane line below.
const RUNNING_TRACK: ObjPart[] = g3In(400, 16, [
  ...g3('tartan', oRect('mass', 200, 8, 400, 16)),
  ...g3('tartan', oRect('face', 200, 14.6, 400, 2.8)),            // the near edge, out of the lamp
  oBar('lit', 0, 1.2, 400, 1.2, 1.0),                             // the kerb line
  oBar('lit', 0, 8.4, 400, 8.4, 0.9),                             // a lane line
  oBar('lit', 318, 1.6, 312, 8.0, 0.9),                           // a start line, across lane one
  oBar('lit', 330, 8.8, 324, 13.4, 0.9),                          // and staggered across lane two
]);
export const runningTrack = (x: number, y: number, w: number, h: number) => fit(RUNNING_TRACK, x, y, w, h);

// ── TRACK VERGE ──────────────────────────────────────────────────────────────
//
// REFERENCE. Beside the track the park is mown grass, sunlit, with the odd tuft
// standing proud of the cut. Real units, 400 × 10.
const TRACK_VERGE: ObjPart[] = g3In(400, 10, [
  ...g3('meadow',
    oRect('mass', 200, 5, 400, 10),
    oRect('face', 200, 9, 400, 2),
    ...Array.from({ length: 14 }, (_, k) => oTri('dark', 12 + k * 28 + (k % 3) * 5, 3.4 + (k % 2) * 2, 3, 3.6, 'up')),
  ),
]);
export const trackVerge = (x: number, y: number, w: number, h: number) => fit(TRACK_VERGE, x, y, w, h);

// ── PARK NOTICE BOARD ────────────────────────────────────────────────────────
//
// REFERENCE. A park or village notice board is a CORK panel in a wooden FRAME, raised
// on two POSTS sunk in the grass, under a gabled CAP that throws the rain off — the cap
// with its set-back gable is what says notice board rather than picture frame. Real
// units, 116 × 88: the cap 0–17, the frame 16–70, the cork in it 19–67, the posts to the
// ground. What is pinned to it is the scene's, because it changes.
const G3_SPECKS = [[16, 26], [30, 40], [52, 23], [70, 34], [88, 25], [100, 44], [20, 58], [44, 54], [64, 62], [84, 57], [98, 63], [38, 30]];
const PARK_NOTICE_BOARD: ObjPart[] = g3In(116, 88, [
  ...g3('wood',
    oRect('mass', 10, 78.5, 6, 19), oRect('mass', 106, 78.5, 6, 19), // the posts
    oRect('face', 12.2, 79, 1.8, 18), oRect('face', 108.2, 79, 1.8, 18), // their sides, from the lamp
    oTri('mass', 58, 8, 116, 14, 'up'),                          // the gabled cap
    oRect('mass', 58, 16, 116, 3.2, 0, 0.6),                     // its eaves board
    oRect('mass', 58, 43, 108, 54, 0, 1.2),                      // the frame
    oTri('dark', 58, 10.4, 80, 8, 'up'),                         // the gable, set back
    oRect('dark', 58, 18.4, 112, 1.2),                           // the eaves' shadow on the frame
  ),
  ...g3('cork',
    oRect('mass', 58, 43, 102, 48, 0, 0.6),                      // the cork
    oRect('dark', 58, 20.1, 102, 2.2), oRect('dark', 8.1, 43, 2.2, 48), // the frame's shadow on it
    ...G3_SPECKS.map(([x, y]) => oEll('dark', x, y, 1.6, 1.6)),
  ),
  oBar('lit', 3, 14.8, 113, 14.8, 0.8),                            // the lamp along the eaves
]);
export const parkNoticeBoard = (x: number, y: number, w: number, h: number) => fit(PARK_NOTICE_BOARD, x, y, w, h);

// ── GOAL CARD ────────────────────────────────────────────────────────────────
//
// REFERENCE. A card on a notice board is an oblong of stiff paper held by one PUSH
// PIN at the top, its lower edge lifting a little off the cork. The words are the
// scene's. Real units, 44 × 16.
const goalCardParts = (paper: NaturalKey, pin: NaturalKey): ObjPart[] => g3In(44, 16, [
  ...g3(paper, oRect('mass', 22, 8, 44, 16, 0, 0.6)),
  ...g3(paper, oRect('dark', 22, 15.1, 43, 1.4)),                  // its lower edge, lifting off the cork
  ...g3(pin, oEll('mass', 22, 1.7, 3.2, 3.2)),                      // the push pin
  oEll('lit', 21.4, 1.2, 1.1, 1.1),                                 // its shine
]);
export const goalCard = (x: number, y: number, w: number, h: number, paper: NaturalKey = 'paper', pin: NaturalKey = 'enamel') =>
  fit(goalCardParts(paper, pin), x, y, w, h);

// ── WALL CALENDAR ────────────────────────────────────────────────────────────
//
// REFERENCE. A month calendar is a sheet with the MONTH across the top in a coloured
// band and the days in a GRID of seven columns under it, a number in the corner of
// each square. The grid of seven is the field mark — ruled lines alone are a notepad.
// Real units, 42 × 22: the band 0–5.2, four weeks of 4.2 under it, each day six wide.
const CAL_ROW = 4.2;
const CAL_COL = 6;
const WALL_CALENDAR: ObjPart[] = g3In(42, 22, [
  ...g3('paper', oRect('mass', 21, 11, 42, 22, 0, 0.6)),
  ...g3('calRed', oRect('mass', 21, 2.6, 42, 5.2, 0, 0.6)),        // the month band
  ...g3('paper', oRect('dark', 41.1, 13.6, 1.4, 16.6)),             // its right edge, curling from the lamp
  ...g3('paper', ...[1, 2, 3, 4, 5, 6].map((c) => oBar('dark', c * CAL_COL, 5.4, c * CAL_COL, 21.8, 0.45))),
  ...g3('paper', ...[1, 2, 3].map((r) => oBar('dark', 0.4, 5.2 + r * CAL_ROW, 41.6, 5.2 + r * CAL_ROW, 0.45))),
  ...Array.from({ length: 28 }, (_, k) => oEll('line', (k % 7) * CAL_COL + 1.7, 5.2 + Math.floor(k / 7) * CAL_ROW + 1.3, 1.3, 0.9)),
  ...g3('enamel', oEll('mass', 21, 1.2, 2.4, 2.4)),                 // the pin it hangs from
]);
export const wallCalendar = (x: number, y: number, w: number, h: number) => fit(WALL_CALENDAR, x, y, w, h);
/** A day's square on the calendar, in its own 42 × 22: Tuesday of the second week. */
export const CAL_TUESDAY = { x: 1.5 * CAL_COL, y: 5.2 + 1.5 * CAL_ROW, w: CAL_COL, h: CAL_ROW, of: { w: 42, h: 22 } } as const;

// ── STOPWATCH ────────────────────────────────────────────────────────────────
//
// REFERENCE. A mechanical stopwatch is a round steel CASE with a white DIAL ruled in
// ticks, the CROWN on top as a red push button on a short stem, and a BOW — a ring —
// over the crown that the cord runs through. Drawn hanging from its cord, so the top
// of the cord is the point a hand holds it by. The hand on the dial is the scene's,
// because it runs. Real units, 14 × 26: the dial's centre at (7, 19.6).
const STOPWATCH: ObjPart[] = g3In(14, 26, [
  oBar('line', 6.2, 0.6, 6.4, 7.4, 0.7), oBar('line', 7.8, 0.6, 7.6, 7.4, 0.7), // the cord's loop
  ...g3('silver',
    oEll('mass', 7, 8.6, 3.8, 3.8),                                 // the bow
    oRect('mass', 7, 12.8, 1.8, 1.8),                               // the crown's stem
    oEll('mass', 7, 19.6, 13, 13),                                  // the case
    oEll('face', 8.1, 20.7, 11, 11),                                // its far side, from the lamp
  ),
  ...g3('enamel', oRect('mass', 7, 11.2, 3.2, 2.4, 0, 0.6)),        // the crown, a red button
  oEll('lit', 7, 19.6, 10, 10),                                     // the dial
  ...Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2;
    const r0 = i % 3 === 0 ? 3.4 : 4.0;
    return oBar('line', 7 + Math.sin(a) * r0, 19.6 - Math.cos(a) * r0, 7 + Math.sin(a) * 4.6, 19.6 - Math.cos(a) * 4.6, i % 3 === 0 ? 0.7 : 0.4);
  }),
]);
export const stopwatch = (x: number, y: number, w: number, h: number) => fit(STOPWATCH, x, y, w, h);
/** The dial's centre and radius, in the stopwatch's own 14 × 26. */
export const WATCH_DIAL = { x: 7, y: 19.6, r: 5, of: { w: 14, h: 26 } } as const;

// ── SPORTS BOTTLE ────────────────────────────────────────────────────────────
//
// REFERENCE. An aluminium sports bottle is a tall straight CYLINDER that narrows at
// a rounded SHOULDER to a black screw CAP with a pop-up SPOUT, a printed label round
// its middle and a long sheen down the lit side. The shoulder and the cap are what
// separate it from a can or a flask. Real units, 9 × 24.
const SPORTS_BOTTLE: ObjPart[] = g3In(9, 24, [
  ...g3('capBlack', oRect('mass', 4.5, 2.6, 4.2, 4.6, 0, 0.8), oRect('mass', 4.5, 0.9, 2, 1.8, 0, 0.6)),
  ...g3('bottleBlue', ...trapezoid('mass', 4.5, 6.6, 4.6, 9, 3.4)),
  ...g3('bottleBlue', oRect('mass', 4.5, 15.9, 9, 16.2, 0, 1.4)),
  ...g3('bottleBlue', oRect('face', 7.7, 15.9, 2.4, 15.6, 0, 1)),
  oRect('lit', 4.3, 15.6, 5.8, 4.6, 0, 0.4),                         // the label
  oBar('lit', 1.6, 9.4, 1.6, 12.4, 0.7), oBar('lit', 1.6, 18.6, 1.6, 22.4, 0.7), // the sheen
]);
export const sportsBottle = (x: number, y: number, w: number, h: number) => fit(SPORTS_BOTTLE, x, y, w, h);

// ── LITTER BIN ───────────────────────────────────────────────────────────────
//
// REFERENCE. A park litter bin is a metal DRUM under a domed LID, with a posting SLOT
// cut in the drum just below the lid, standing on a heavy dark BASE ring. The slot
// under the dome is the field mark — a plain drum is a barrel or a post. Dark green
// steel. Real units, 20 × 32.
const LITTER_BIN: ObjPart[] = g3In(20, 32, [
  ...g3('binGreen',
    oRect('mass', 10, 17, 18, 22, 0, 1.4),                          // the drum
    oEll('mass', 10, 4.4, 18.4, 5.6),                               // the domed lid
    oRect('mass', 10, 6.6, 19, 3, 0, 0.8),                          // its rim
    oRect('face', 16.4, 17.4, 5.2, 21),                             // the drum's side, from the lamp
  ),
  ...g3('gloom', oRect('dark', 7.6, 11.6, 10, 5, 0, 1)),            // the slot, dark inside
  ...g3('iron', oRect('mass', 10, 29.4, 20, 4.6, 0, 1), oRect('face', 10, 31.2, 20, 1.6)), // the base
  oBar('lit', 3, 15, 3, 26, 0.9),                                   // the lamp on the drum
]);
export const litterBin = (x: number, y: number, w: number, h: number) => fit(LITTER_BIN, x, y, w, h);

// ── NEWSPAPER ────────────────────────────────────────────────────────────────
//
// REFERENCE. A newspaper held open to read is two tall PAGES either side of a FOLD,
// each set in narrow COLUMNS of grey text under a few black HEADLINES, a photograph
// boxed among them. The columns and the fold are what say newspaper rather than a map
// or a sheet of paper. Real units, 30 × 21.
const NEWSPAPER: ObjPart[] = g3In(30, 21, [
  ...g3('newsprint', oRect('mass', 7.6, 10.5, 15, 21, 0, 0.5), oRect('mass', 22.4, 10.5, 15, 21, 0, 0.5)),
  ...g3('newsprint', oRect('face', 26, 10.5, 8, 21)),               // the far page, turned from the lamp
  oBar('line', 15, 0.4, 15, 20.6, 0.5),                             // the fold
  oRect('line', 7.6, 2.4, 11, 2, 0, 0.3), oRect('line', 21, 2.4, 9, 1.4, 0, 0.3), // the headlines
  ...g3('newsprint', ...[2.6, 7.6, 12.6, 18.4, 23.4].flatMap((x) => [6, 9, 12, 15, 18].map((y) => oBar('dark', x - 1.8, y, x + 1.8, y, 0.6)))),
  ...g3('newsprint', oRect('dark', 25.6, 7.6, 6.4, 5.2)),           // a photograph
]);
export const newspaper = (x: number, y: number, w: number, h: number) => fit(NEWSPAPER, x, y, w, h);

// ── BALLPOINT PEN ────────────────────────────────────────────────────────────
//
// REFERENCE. A ballpoint is a slim BARREL with a black end CAP and a CLIP at one end
// and a steel cone to the TIP at the other. Drawn tip down, about its cap end, where a
// string on a notice board is tied. Real units, 3 × 14.
const BALLPOINT: ObjPart[] = g3In(3, 14, [
  ...g3('penBlue', oRect('mass', 1.5, 6.2, 2.6, 9.6, 0, 1), oRect('face', 2.3, 6.2, 1, 9.2)),
  ...g3('silver', oTri('mass', 1.5, 12.4, 2.4, 3.2, 'down')),
  ...g3('capBlack', oRect('mass', 1.5, 1.4, 2.6, 2.8, 0, 0.8)),
  oBar('line', 2.5, 1.2, 2.5, 5.2, 0.5),                            // the clip
]);
export const ballpoint = (x: number, y: number, w: number, h: number) => fit(BALLPOINT, x, y, w, h);

// ── FLOODLIGHT ───────────────────────────────────────────────────────────────
//
// REFERENCE. A floodlight at a park track is a tall galvanised MAST with a rectangular
// FRAME of lamps at its head, two rows of them, angled down over the track. The frame of
// lamps on a bare pole is the field mark — a single lamp on a pole is a street light.
// Real units, 40 × 182.
const FLOODLIGHT: ObjPart[] = g3In(40, 182, [
  ...g3('silver',
    oRect('mass', 20, 101, 3.6, 162),                               // the mast
    oRect('face', 21.3, 101, 1.0, 162),
    oRect('mass', 20, 18.5, 2.6, 6),                                // its neck to the frame
    oRect('mass', 20, 180, 10, 4, 0, 1),                            // the base plate
  ),
  ...g3('iron', oRect('mass', 20, 9, 40, 16, 0, 1), oRect('face', 20, 15.8, 40, 2.4)),
  ...[0, 1].flatMap((r) => [0, 1, 2, 3].map((c) => oRect('lit', 6.5 + c * 9, 5 + r * 7, 7, 5, 0, 0.8))),
]);
export const floodlight = (x: number, y: number, w: number, h: number) => fit(FLOODLIGHT, x, y, w, h);

// ── growth3: objects for this lesson go ABOVE this line ──

// ─────────────────────────────────────────────────────────────────────────────
// business-foundations-3 — A CRAFT FAIR STALL. A pop-up gazebo over a trestle table
// under a linen cloth, handmade candles in glass jars, a chalk tent tag, a block of soy
// wax and two empty jars, a spool of green satin ribbon, bunting, and the
// customer's canvas tote. Drawn against Commons photographs (scratchpad/ref/biz3-*):
// a Jedburgh craft stall under its gazebo with a chalk price slate, three poured
// candles in squat glass tumblers, and a canvas tote bag with a printed circle.
// ─────────────────────────────────────────────────────────────────────────────

/** Parts in a named real colour (AP11). */
const b3N = (k: NaturalKey, ...ps: ObjPart[]): ObjPart[] => ps.map((p) => ({ ...p, nat: k }));
/** Author in real units (an ax × ay box) and hand it to `fit` as the 100-square. */
function b3In(ax: number, ay: number, parts: readonly ObjPart[]): ObjPart[] {
  const sx = 100 / ax;
  const sy = 100 / ay;
  const s = 100 / Math.min(ax, ay);
  return parts.map((p) => {
    if (p.k === 'bar') return { ...p, x1: p.x1 * sx, y1: p.y1 * sy, x2: p.x2 * sx, y2: p.y2 * sy, t: p.t * s };
    return { ...p, x: p.x * sx, y: p.y * sy, w: p.w * sx, h: p.h * sy, ...(p.k === 'rect' ? { rad: p.rad * s } : null) } as ObjPart;
  });
}

// ── THE GAZEBO ───────────────────────────────────────────────────────────────
//
// REFERENCE (the Jedburgh craft stall). A fair's pop-up gazebo is four thin METAL LEGS
// on foot plates, a canvas roof that rises to a small VENT CAP at its peak, and a deep
// straight VALANCE round the eaves — the band a stall-holder's name is printed on. Seen
// from the front the roof is a trapezoid narrowing to the cap. Real units, 208 × 182:
// the roof 4–26, the valance 26–40, the legs down to the ground.
function gazeboParts(key: NaturalKey): ObjPart[] {
  return b3In(208, 182, [
    ...b3N('silver',
      oBar('mass', 6, 36, 6, 180, 2.4),                          // the legs
      oBar('mass', 202, 36, 202, 180, 2.4),
      oRect('mass', 6, 180.8, 8, 2.2, 0, 0.8),                   // their foot plates
      oRect('mass', 202, 180.8, 8, 2.2, 0, 0.8),
    ),
    ...b3N(key,
      ...trapezoid('mass', 104, 15, 64, 208, 22),                // the roof, rising to the cap
      oRect('mass', 104, 3.6, 22, 4.4, 0, 1.2),                  // the vent cap at its peak
      oRect('mass', 104, 33, 208, 14, 0, 0.8),                   // the valance
      oRect('dark', 104, 26.8, 200, 1.6),                        // the eave's shadow on it
    ),
    oBar('lit', 3, 38.4, 205, 38.4, 0.9),                        // the valance's hem, stitched white
    oBar('line', 104, 5.8, 104, 26, 0.5),                        // the roof's front seam
  ]);
}
export const fairGazebo = (x: number, y: number, w: number, h: number, key: NaturalKey = 'gazebo') =>
  fit(gazeboParts(key), x, y, w, h);
/** The valance, in the gazebo's own 100-square: the stall's name is printed here. */
export const GAZEBO_VALANCE = { y: (33 / 182) * 100, h: (14 / 182) * 100 } as const;

// ── THE TABLE UNDER ITS CLOTH ────────────────────────────────────────────────
//
// REFERENCE (the same stall). A craft-fair trestle is never seen: a cloth goes over it
// and falls to the ground, so what reads is a lit TOP EDGE with a little thickness, the
// cloth's FRONT hanging in soft vertical FOLDS that catch the light, and a stitched hem.
// Real units, 196 × 24.
const FAIR_CLOTH: ObjPart[] = b3In(196, 24, [
  ...b3N('linen',
    oRect('mass', 98, 2.2, 196, 4.4, 0, 1),                      // the top, lit, with its edge
    oRect('face', 98, 13.8, 194, 20.4, 0, 1),                    // the cloth falling, in shade
  ),
  ...[20, 58, 98, 138, 176].map((x) => oBar('lit', x, 6.6, x + (x - 98) * 0.02, 21.6, 0.8)),  // its folds
  oBar('line', 2, 21, 194, 21, 0.5),                             // the hem's stitching
]);
export const fairCloth = (x: number, y: number, w: number, h: number) => fit(FAIR_CLOTH, x, y, w, h);

// ── A CANDLE IN A JAR ────────────────────────────────────────────────────────
//
// REFERENCE (three poured candles). A container candle is a SQUAT glass tumbler — about
// as wide as it is tall — with the coloured WAX visible through the glass to a little
// below the rim, a short WICK standing out of the wax, and a band of empty glass above
// it. A handmade one wears a small paper LABEL round its middle. Real units, 12 × 13.
function candleParts(wax: NaturalKey): ObjPart[] {
  return b3In(12, 13, [
    ...b3N('glass', oRect('mass', 6, 7, 12, 12, 0, 2.2)),          // the glass tumbler
    ...b3N(wax,
      oRect('mass', 6, 8.4, 10, 8.8, 0, 1.6),                    // the wax inside it
      oRect('dark', 9.6, 8.4, 2.4, 8.8, 0, 0.8),                 // its side turned from the lamp
    ),
    oRect('lit', 6, 8.8, 6.4, 3.4, 0, 0.4),                      // the maker's paper label
    oBar('line', 4.2, 8.8, 7.8, 8.8, 0.45),                      // and its printed line
    oBar('line', 6, 4.2, 6, 1.8, 0.7),                           // the wick
    oBar('line', 1.2, 1.4, 10.8, 1.4, 0.6),                      // the jar's rim
    oBar('lit', 2.1, 4.6, 2.1, 7, 0.9),                          // the glass's shine
  ]);
}
export const candleJar = (x: number, y: number, w: number, h: number, wax: NaturalKey = 'waxCranberry') =>
  fit(candleParts(wax), x, y, w, h);

// ── AN EMPTY JAR ─────────────────────────────────────────────────────────────
//
// The same tumbler before it is poured: clear glass, its FAR WALL seen through the near
// one, a screw THREAD under the rim and the shine. No colour inside is what says empty.
const EMPTY_JAR: ObjPart[] = b3In(12, 13, [
  ...b3N('glass',
    oRect('mass', 6, 7, 12, 12, 0, 2.2),
    oRect('dark', 6.6, 8.2, 8.4, 9, 0, 1.6),                     // its far wall, through the glass
  ),
  oBar('line', 1.2, 1.4, 10.8, 1.4, 0.6),                        // the rim
  oBar('line', 1.4, 3.2, 10.6, 3.2, 0.45),                       // the screw thread under it
  oBar('lit', 2.1, 4.6, 2.1, 10.4, 0.9),                         // the shine
]);
export const emptyJar = (x: number, y: number, w: number, h: number) => fit(EMPTY_JAR, x, y, w, h);

// ── A BLOCK OF WAX ───────────────────────────────────────────────────────────
//
// Candle-makers buy soy wax as creamy SLABS scored into pieces to be broken off and
// melted. Seen from the front and a little above: a lit top receding, a front in
// shade, and the score lines down it. Real units, 16 × 9.
const WAX_BLOCK: ObjPart[] = b3In(16, 9, [
  ...b3N('soyWax',
    ...trapezoid('mass', 8, 2.2, 13, 16, 4.4),                   // the top, receding, lit
    oRect('face', 8, 6.6, 16, 4.8, 0, 0.6),                      // the front, in shade
  ),
  oBar('line', 5.4, 4.8, 5.4, 8.6, 0.4),                         // where it breaks into pieces
  oBar('line', 10.6, 4.8, 10.6, 8.6, 0.4),
]);
export const waxBlock = (x: number, y: number, w: number, h: number) => fit(WAX_BLOCK, x, y, w, h);

// ── A SPOOL OF RIBBON ────────────────────────────────────────────────────────
//
// A reel of satin ribbon stood on the table, seen from the side: two wooden FLANGES,
// top and bottom, with the ribbon WOUND between them, its sheen along the top of the
// wind, the underside in shade, and a free TAIL hanging over the table's edge — the
// end a customer pulls. Real units, 12 × 16; the reel is the top 12, the tail falls
// below it.
const RIBBON_SPOOL: ObjPart[] = b3In(12, 16, [
  ...b3N('wood',
    oRect('mass', 6, 1.2, 12, 2.4, 0, 0.8),                      // the flanges
    oRect('mass', 6, 10.8, 12, 2.4, 0, 0.8),
  ),
  ...b3N('satin',
    oRect('mass', 6, 6, 10, 7.2, 0, 0.4),                        // the ribbon wound on it
    oRect('dark', 6, 8.6, 10, 2),                                // its underside, in shade
    oBar('mass', 10.2, 7, 11.2, 15.2, 1.6),                      // the free end, hanging
  ),
  oBar('lit', 2.6, 3.6, 8, 3.6, 0.8),                            // the satin's sheen
]);
export const ribbonSpool = (x: number, y: number, w: number, h: number) => fit(RIBBON_SPOOL, x, y, w, h);

// ── A LENGTH OF RIBBON ───────────────────────────────────────────────────────
//
// Cut from the spool and held up by one end: a satin strip with a gentle twist in it
// and its end cut into a V, which is how ribbon is cut so it will not fray.
// Real units, 5 × 18, hanging from the top, set in the middle of an 18-unit square.
const RIBBON_LENGTH: ObjPart[] = b3In(18, 18, [
  ...b3N('satin',
    oBar('mass', 9, 0.9, 9.7, 8.5, 1.8),
    oBar('mass', 9.7, 8.5, 8.8, 16.6, 1.8),
  ),
  oBar('lit', 9.1, 2.2, 9.5, 6.6, 0.5),                          // the sheen
  oTri('lit', 8.8, 17.1, 1.2, 1.6, 'up'),                        // the end, cut in a V
]);
export const ribbonLength = (x: number, y: number, w: number, h: number) => fit(RIBBON_LENGTH, x, y, w, h);

// ── A RIBBON BOW ─────────────────────────────────────────────────────────────
//
// Tied round a jar: two LOOPS either side of a KNOT, two tails falling from it, and
// the inside of each loop in shadow. Real units, 12 × 8, in the top of a 12-unit square.
const RIBBON_BOW: ObjPart[] = b3In(12, 12, [
  ...b3N('satin',
    oEll('mass', 3.4, 3, 5.2, 4.2, -18),                         // the loops
    oEll('mass', 8.6, 3, 5.2, 4.2, 18),
    oBar('mass', 5.4, 4.2, 3.4, 7.2, 1.5),                       // the tails
    oBar('mass', 6.6, 4.2, 8.6, 7.2, 1.5),
    oEll('dark', 3.4, 3.2, 2.2, 1.4, -18),                       // inside each loop
    oEll('dark', 8.6, 3.2, 2.2, 1.4, 18),
    oEll('dark', 6, 3.8, 2.4, 2.6),                              // the knot
  ),
]);
export const ribbonBow = (x: number, y: number, w: number, h: number) => fit(RIBBON_BOW, x, y, w, h);

// ── A CANVAS TOTE ────────────────────────────────────────────────────────────
//
// REFERENCE (a bookshop's canvas tote). A tote is a plain canvas SACK, a little taller
// than wide, with two long STRAP handles rising in arches from its mouth, a stitched hem
// along the mouth, and a big printed CIRCLE on its face. Real units, 24 × 32.
const TOTE_BAG: ObjPart[] = b3In(24, 32, [
  ...b3N('tote',
    oBar('mass', 6, 12, 6.8, 4.4, 1.8), oBar('mass', 6.8, 4.4, 10.4, 3.6, 1.8),    // the straps, each a
    oBar('mass', 10.4, 3.6, 11, 12, 1.8),                                          // soft loop of webbing
    oBar('mass', 13, 12, 13.6, 3.6, 1.8), oBar('mass', 13.6, 3.6, 17.2, 4.4, 1.8),
    oBar('mass', 17.2, 4.4, 18, 12, 1.8),
    ...trapezoid('mass', 12, 21.6, 21, 24, 20.8),                // the sack
    oRect('face', 21.4, 21.8, 2.2, 19.2),                        // its side, in shade
  ),
  ...b3N('pennantMustard', oEll('mass', 11.4, 22.4, 11, 11)),    // the printed circle
  oBar('line', 1.8, 12.8, 22.2, 12.8, 0.5),                      // the hem round its mouth
  oBar('lit', 3.4, 15.4, 3.4, 28.6, 0.9),                        // the canvas's light side
]);
export const toteBag = (x: number, y: number, w: number, h: number) => fit(TOTE_BAG, x, y, w, h);

// ── A CHALK TENT TAG ─────────────────────────────────────────────────────────
//
// REFERENCE (the Jedburgh stall's slate, chalked "£18"). A table-top price sign is a
// small SLATE in a WOODEN FRAME standing on splayed legs at the back, so it leans like
// a tent. The price is chalked on the slate by the scene. Real units, 28 × 22.
const TENT_SLATE: ObjPart[] = b3In(28, 22, [
  ...b3N('wood',
    oBar('mass', 5, 15.6, 2.6, 21.2, 1.8),                       // the legs behind, splayed
    oBar('mass', 23, 15.6, 25.4, 21.2, 1.8),
    oRect('mass', 14, 9, 28, 17, 0, 1.6),                        // the frame
  ),
  ...b3N('slate', oRect('dark', 14, 9, 23, 12.4, 0, 0.8)),       // the slate let into it
  oBar('lit', 3.4, 1.6, 10, 1.6, 0.6),                           // the frame's lit top edge
]);
export const tentSlate = (x: number, y: number, w: number, h: number) => fit(TENT_SLATE, x, y, w, h);
/** The slate's face, as fractions of the tag's box: the price is chalked here. */
export const TENT_FACE = { x: 14 / 28, y: 9 / 22, w: 23 / 28, h: 12.4 / 22 } as const;

// ── A BUNTING PENNANT ────────────────────────────────────────────────────────
//
// One cotton PENNANT of a string of bunting: a triangle, point down, its top edge
// folded over the string. The scene hangs a row of them, red, mustard and teal in turn,
// along a sagging string. Real units, 12 × 12.
const pennantParts = (key: NaturalKey): ObjPart[] => b3In(12, 12, [
  ...b3N(key, oTri('mass', 6, 6.6, 11, 10.8, 'down')),
  ...b3N(key, oRect('dark', 6, 2.2, 10.4, 1.4)),                 // the fold over the string
  oBar('lit', 3.2, 4.2, 5.4, 9, 0.6),                            // the cotton catching the light
]);
export const pennant = (x: number, y: number, w: number, h: number, key: NaturalKey = 'pennantRed') =>
  fit(pennantParts(key), x, y, w, h);

// ── biz3: objects for this lesson go ABOVE this line ──

// ── econ3: a ticket kiosk, two posters on a brick wall, tickets and money ────
const e3N = (k: NaturalKey, ...ps: ObjPart[]): ObjPart[] => ps.map((p) => ({ ...p, nat: k }));

// ── POSTER WALL ──────────────────────────────────────────────────────────────
//
// REFERENCE (Commons, a 1970s gig poster on a pub wall in Peckham; fly-posted brick
// walls): bills are pasted on BRICK in stretcher bond — long courses, each joint over
// the middle of the brick below — under a stone COPING with a shaded front lip. The
// staggered joints are what say brick rather than tiles or a grid.
const POSTER_WALL: ObjPart[] = [
  ...e3N('brick', oRect('mass', 50, 54.5, 100, 91)),            // the brickwork
  ...e3N('coping', oRect('mass', 50, 4.5, 101, 9, 0, 0.6)),     // the stone coping
  ...e3N('coping', oRect('face', 50, 9.6, 101, 2)),             // its lip, in shade
  ...e3N('brick', oRect('face', 99, 54.5, 2, 91)),              // the wall's end
  // the courses, and the joints staggered half a brick from row to row
  ...Array.from({ length: 10 }, (_, i) => e3N('brick', oBar('dark', 1, 19 + i * 8.6, 97.5, 19 + i * 8.6, 0.9))).flat(),
  ...Array.from({ length: 11 }, (_, r) => {
    const y0 = 10.6 + r * 8.6;
    const y1 = Math.min(99.4, y0 + 8.6);
    return Array.from({ length: 9 }, (_, k) => 3 + (r % 2 ? 6 : 0) + k * 12)
      .filter((x) => x < 97)
      .flatMap((x) => e3N('brick', oBar('dark', x, y0 + 0.9, x, y1 - 0.9, 0.9)));
  }).flat(),
];
export const posterWall = (x: number, y: number, w: number, h: number) => fit(POSTER_WALL, x, y, w, h);

// ── GIG POSTER ───────────────────────────────────────────────────────────────
//
// REFERENCE (the Dr Feelgood bill at the Ivy House, Peckham): a letterpress gig poster
// is BANDS — a red band for the headline, a picture, a red band of small print — on
// cream paper with a cream border all round. This one's picture is a guitar under a
// spotlight on a night-blue stage: an electric guitar is two bouts (the lower one the
// bigger), a long neck and a headstock, held on a diagonal. Laid out for a box about
// 60 × 72; the headline word is the scene's, set on the top band.
const GIG_POSTER: ObjPart[] = [
  ...e3N('paper', oRect('mass', 50, 50, 100, 100, 0, 1)),        // the bill
  ...e3N('gigRed', oRect('mass', 50, 14, 90, 20)),               // the headline band
  ...e3N('gigNight', oRect('mass', 50, 53.5, 90, 51)),           // the stage
  ...e3N('spotBeam', oTri('mass', 50, 53.5, 62, 51, 'up')),       // the spotlight's beam
  ...e3N('gigRed', oRect('mass', 50, 88.5, 90, 13)),             // the small-print band
  // the guitar, inked round and then filled
  oEll('line', 41.7, 65.3, 27, 18.5, -40), oEll('line', 50.2, 56.8, 20, 14, -40),
  oBar('line', 52.5, 54.2, 73.3, 33.3, 6.5), oRect('line', 76.7, 29.9, 9.5, 12.5, 40, 1),
  ...e3N('orange', oEll('dark', 41.7, 65.3, 23.5, 15.3, -40), oEll('dark', 50.2, 56.8, 16.7, 11.1, -40)),
  ...e3N('wood', oBar('dark', 52.5, 54.2, 73.3, 33.3, 4), oRect('dark', 76.7, 29.9, 6.7, 9.7, 40, 1)),
  oEll('line', 43.2, 63.6, 6, 5),                                // the pickup
  oBar('lit', 39, 68, 72, 35, 0.9),                              // the strings
  oBar('lit', 18, 86, 82, 86, 2.2), oBar('lit', 28, 91, 72, 91, 2.2),  // the small print
];
export const gigPoster = (x: number, y: number, w: number, h: number) => fit(GIG_POSTER, x, y, w, h);

// ── MATCH POSTER ─────────────────────────────────────────────────────────────
//
// REFERENCE (Commons, a 1951 Szeged–Dorog match bill; a 19th-century Scotland v
// England bill): a football bill is the BALL and the PITCH — a white ball with black
// patches over mown green stripes and the halfway line — under a band naming the game,
// with a starburst flash for the offer. Laid out for a box about 60 × 72; the band's
// word and the flash's word are the scene's.
const MATCH_POSTER: ObjPart[] = [
  ...e3N('paper', oRect('mass', 50, 50, 100, 100, 0, 1)),        // the bill
  ...e3N('pitch', oRect('mass', 50, 14, 90, 20)),                // the headline band
  ...[0, 1, 2, 3, 4, 5].flatMap((i) =>                           // the pitch, mown in stripes
    e3N(i % 2 ? 'pitch' : 'pitchLight', oRect('mass', 12.5 + i * 15, 53.5, 15, 51))),
  ...e3N('pitch', oRect('mass', 50, 88.5, 90, 13)),              // the small-print band
  oBar('lit', 64, 29.5, 64, 77.5, 1.4),                          // the halfway line
  oEll('lit', 64, 53.5, 6, 5),                                   // and its spot
  // the ball: inked round, white, and patched
  oEll('line', 38, 57, 35, 29), oEll('lit', 38, 57, 31.5, 26),
  oEll('line', 38, 57, 10, 8.5),
  oEll('line', 27, 51, 6, 5), oEll('line', 49, 51, 6, 5), oEll('line', 29, 65, 6, 5), oEll('line', 47, 65, 6, 5),
  ...e3N('lemon', oRect('dark', 75, 71, 42, 16, 0, 2)),          // the flash for the offer
  oBar('lit', 18, 86, 82, 86, 2.2), oBar('lit', 28, 91, 72, 91, 2.2),  // the small print
];
export const matchPoster = (x: number, y: number, w: number, h: number) => fit(MATCH_POSTER, x, y, w, h);

// ── TICKET KIOSK ─────────────────────────────────────────────────────────────
//
// REFERENCE (Commons, a tiny ticket-sale kiosk on Seurasaari, Helsinki; ferry ticket
// booths at Brixham): a ticket kiosk is a small timber hut with its GABLE to the
// street — a pitched roof with deep bargeboards, a sign board under the gable — and a
// wide SERVICE WINDOW at chest height, trimmed in white, with a counter shelf under it
// and boarded panelling below. The seller stands inside, behind the shelf, seen through
// the window. Split in two so the seller can stand between: this is everything BEHIND
// him; `kioskFront` is the shelf and the panelling in front. Laid out for a box about
// 152 × 184, with the clock and the sign's word the scene's.
const TICKET_KIOSK: ObjPart[] = [
  ...e3N('whitewash',
    oTri('mass', 50, 14.7, 94.7, 22.8, 'up'),                    // the gable
    oRect('mass', 50, 67.4, 94.7, 65.2),                         // the walls, painted white
    oRect('face', 95.4, 67.4, 3.9, 65.2),                        // the end wall, turned from the lamp
  ),
  ...e3N('signBoard', oRect('mass', 50, 31, 89.5, 8.7, 0, 0.6)), // the sign board
  ...e3N('felt', oBar('mass', 0, 26.1, 50, 1.1, 4.6), oBar('mass', 50, 1.1, 100, 26.1, 4.6)), // the roof's edge
  oBar('lit', 2.6, 27.4, 50, 4.6, 1.45), oBar('lit', 50, 4.6, 97.4, 27.4, 1.45), // the bargeboards' white trim
  ...e3N('newWood', oRect('dark', 50, 62, 84.2, 45.7)),         // the window: the booth's inside, lined in pine
  oBar('lit', 7.9, 39.1, 92.1, 39.1, 1.3),                       // the window's white frame
  oBar('lit', 7.9, 39.1, 7.9, 84.8, 1.3), oBar('lit', 92.1, 39.1, 92.1, 84.8, 1.3),
  oBar('line', 9.2, 60.9, 19.7, 60.9, 1.05), oBar('line', 40.8, 60.9, 51.3, 60.9, 1.05), // the ticket-roll rails
  oBar('line', 69.7, 39.1, 69.7, 45.4, 0.7),                     // a lamp on its flex,
  oTri('line', 69.7, 47.3, 7.9, 3.8, 'up'), oEll('lit', 69.7, 49.7, 2.6, 1.6), // its shade and bulb
];
export const ticketKiosk = (x: number, y: number, w: number, h: number) => fit(TICKET_KIOSK, x, y, w, h);
const KIOSK_FRONT: ObjPart[] = [
  ...e3N('wood', oRect('mass', 50, 7.8, 103.9, 15.6, 0, 1)),     // the counter shelf
  ...e3N('wood', oRect('face', 50, 20.3, 101.3, 9.4)),           // its front edge, in shade
  ...e3N('whitewash',
    oRect('mass', 50, 62.5, 94.7, 75),                           // the boarded panelling
    oRect('face', 95.4, 62.5, 3.9, 75),                          // its end, turned from the lamp
  ),
  oBar('line', 2.6, 50, 92.1, 50, 2.5), oBar('line', 2.6, 75, 92.1, 75, 2.5), // the boards
];
export const kioskFront = (x: number, y: number, w: number, h: number) => fit(KIOSK_FRONT, x, y, w, h);

// ── TICKET ROLL ──────────────────────────────────────────────────────────────
//
// REFERENCE (Commons, cloakroom and raffle "admit one" rolls): tickets come wound on a
// card CORE, a roll seen end-on as a disc of paper turns round a pale core on its
// spindle, with the STRIP hanging off it, perforated between tickets. Laid out for a
// box about 12 × 26: the roll above, one ticket's length of strip below; the next
// ticket to tear off is the scene's, hung under the strip.
const TICKET_ROLL: ObjPart[] = [
  oEll('mass', 50, 23, 100, 46),                                 // the roll, end-on
  oRect('mass', 50, 74, 62, 52, 0, 2),                           // the strip hanging off it
  oEll('dark', 56, 26, 66, 30),                                  // the turns of paper, in shade
  oEll('lit', 50, 23, 30, 13.8),                                 // the card core
  oEll('line', 50, 23, 12, 5.5),                                 // the spindle
  oBar('lit', 22, 74, 78, 74, 3),                                // a perforation across the strip
];
export const ticketRoll = (x: number, y: number, w: number, h: number) => fit(tint(TICKET_ROLL, 'ticketPink'), x, y, w, h);

// ── TICKET ───────────────────────────────────────────────────────────────────
//
// REFERENCE (Commons, a 1956 general-admission ticket): a ticket is a printed SLIP about
// two and a half times as long as it is tall, with a STUB at one end beyond a
// perforated line. The stub is what says ticket rather than label. Pink by default; a
// scene re-tints it.
const TICKET: ObjPart[] = [
  oRect('mass', 50, 50, 100, 100, 0, 6),                         // the slip
  oRect('face', 87, 50, 26, 100, 0, 3),                          // the stub
  oBar('lit', 73, 10, 73, 90, 5),                                // the perforation
  oBar('line', 12, 34, 60, 34, 9), oBar('line', 12, 64, 46, 64, 8), // the print
];
export const ticket = (x: number, y: number, w: number, h: number) => fit(tint(TICKET, 'ticketPink'), x, y, w, h);

// ── TWENTY-POUND NOTE ────────────────────────────────────────────────────────
//
// REFERENCE (the Bank of England's £20): a lilac note with a pale FIELD, a portrait in
// an oval, and the large value — a 2 and a 0 — across from it. As `note`, in its own
// colour and with its own figure.
const NOTE_20: ObjPart[] = [
  ...e3N('note20', oRect('mass', 50, 50, 100, 56, 0, 4)),        // the note
  oRect('lit', 50, 50, 88, 44, 0, 2),                            // its field
  ...e3N('note20', oEll('dark', 28, 50, 26, 34)),                // the portrait's oval
  oEll('lit', 28, 45, 9, 11), oEll('lit', 28, 59, 15, 8),       // the head and shoulders in it
  oBar('line', 55, 40, 63, 40, 3.5), oBar('line', 63, 40, 63, 49, 3.5), // the value: a 2 …
  oBar('line', 63, 49, 55, 60, 3.5), oBar('line', 55, 60, 64, 60, 3.5),
  oEll('line', 77, 50, 14, 22), oEll('lit', 77, 50, 6.5, 14),   // … and a 0
];
export const note20 = (x: number, y: number, w: number, h: number) => fit(NOTE_20, x, y, w, h);

// ── TAKINGS ──────────────────────────────────────────────────────────────────
//
// REFERENCE (any market cash tin): notes stand on their edges in an open tin, their
// tops showing over the rim in their own colours — a twenty, a ten and a five. Drawn
// behind `cashTin`, which covers their lower part.
const TIN_TAKINGS: ObjPart[] = [
  ...e3N('note20', oRect('mass', 22, 56, 30, 84, 0, 3)),
  ...e3N('note10', oRect('mass', 50, 52, 30, 90, 0, 3)),
  ...e3N('note5', oRect('mass', 78, 58, 30, 80, 0, 3)),
  oBar('lit', 14, 26, 30, 26, 7), oBar('lit', 42, 22, 58, 22, 7), oBar('lit', 70, 30, 86, 30, 7), // their fields
];
export const tinTakings = (x: number, y: number, w: number, h: number) => fit(TIN_TAKINGS, x, y, w, h);

// ── econ3: objects for this lesson go ABOVE this line ──

// ─────────────────────────────────────────────────────────────────────────────
// THE SEASIDE, for Science lesson 3 (2026-10-01). Drawn against pictures fetched with
// `node scripts/get-reference.mjs` (scratchpad/ref/sci3-*): the ice cream kiosk on
// Brighton beach and the kiosk row at Skegness, beach parasols on Miami Beach and a
// parasol's canopy from beneath, Brighton's sea-green promenade railings, a flipchart
// on its tripod, and a cornet icon. Each is authored in REAL STAGE UNITS (the scene
// places it at that size), so a point named here is a point on the stage.
// ─────────────────────────────────────────────────────────────────────────────

const sci3N = (k: NaturalKey, ...ps: ObjPart[]): ObjPart[] => ps.map((p) => ({ ...p, nat: k }));
/** Author in real units (an ax × ay box) and hand it to `fit` as the 100-square. */
function sci3In(ax: number, ay: number, parts: readonly ObjPart[]): ObjPart[] {
  const sx = 100 / ax;
  const sy = 100 / ay;
  const s = 100 / Math.min(ax, ay);
  return parts.map((p) => {
    if (p.k === 'bar') return { ...p, x1: p.x1 * sx, y1: p.y1 * sy, x2: p.x2 * sx, y2: p.y2 * sy, t: p.t * s };
    return { ...p, x: p.x * sx, y: p.y * sy, w: p.w * sx, h: p.h * sy, ...(p.k === 'rect' ? { rad: p.rad * s } : null) } as ObjPart;
  });
}

// ── PROMENADE RAILING ────────────────────────────────────────────────────────
//
// REFERENCE. A seaside promenade's railing (Brighton's, painted sea-green) is cast
// POSTS with a ball on top, a heavy TOP RAIL, a lighter middle rail, and close-set
// BALUSTERS between the two — the run of thin uprights is what makes it a railing and
// not a fence. Real units, 66 × 32.
const PROM_RAILING: ObjPart[] = sci3In(66, 32, [
  ...sci3N('railGreen',
    ...[2, 33, 64].map((x) => oBar('mass', x, 3, x, 31.5, 2.6)),            // the posts
    ...[2, 33, 64].map((x) => oEll('mass', x, 2, 4.4, 4.4)),                 // their balls
    oBar('mass', 0.5, 5, 65.5, 5, 2.4),                                      // the top rail
    oBar('mass', 0.5, 19, 65.5, 19, 1.6),                                    // the middle rail
    oBar('mass', 0.5, 29, 65.5, 29, 1.3),                                    // the foot rail
    ...[6, 10, 14, 18, 22, 26, 29.5, 36.5, 40, 44, 48, 52, 56, 60].map((x) => oBar('mass', x, 5, x, 19, 0.9)), // balusters
  ),
  oBar('lit', 1, 4.2, 65, 4.2, 0.6),                                         // the light along the top rail
]);
export const promRailing = (x: number, y: number, w: number, h: number) => fit(PROM_RAILING, x, y, w, h);

// ── BEACH PARASOL ────────────────────────────────────────────────────────────
//
// REFERENCE. A beach parasol seen from the side (the Miami Beach row) is a WIDE, LOW
// canopy — a shallow cone well over twice as wide as it is tall — its panels in
// alternate colours running from a point at the top to the rib tips along a nearly
// straight hem, on a single POLE driven into the sand by a SPIKE. Furled, the canopy
// hangs down the pole from the top as a long bunched teardrop with a strap round it.
// Three pieces, so a scene can carry it furled and open it: the pole, the furled canopy
// (real 7 × 46, hung from the pole's top) and the open canopy. The pole and the open
// canopy are authored in SQUARES — the pole down the middle of a 104 square, its top at
// (52, 0); the canopy across the top of a 76 square, its apex at (38, 1) — so neither
// thickens nor skews when it is drawn in a box of another shape.
const PARASOL_POLE: ObjPart[] = sci3In(104, 104, [
  ...sci3N('wood', oBar('mass', 52, 1.5, 52, 98, 1.8), oEll('mass', 52, 1.4, 3.4, 3)),
  ...sci3N('silver', oBar('mass', 52, 97, 52, 103.4, 1.2)),                 // the spike
]);
export const parasolPole = (x: number, y: number, w: number, h: number) => fit(PARASOL_POLE, x, y, w, h);
const PARASOL_FURLED: ObjPart[] = sci3In(7, 46, [
  ...sci3N('umbOrange',
    oEll('mass', 3.5, 17, 7, 28),                                            // the bunched canopy
    ...trapezoid('mass', 3.5, 36, 5.2, 1.4, 18),                             // tapering to the rib tips
  ),
  ...sci3N('canvasWhite',
    oRect('mass', 3.5, 9, 5.6, 3.2, 0, 1),                                   // its white panels, rolled
    oRect('mass', 3.5, 22, 6.6, 3.2, 0, 1),
    oRect('mass', 3.5, 35, 4.4, 3, 0, 1),
  ),
  ...sci3N('wood', oRect('dark', 3.5, 28.5, 5.6, 2, 0, 0.8)),               // the strap round it
  oBar('lit', 1.6, 6, 1.4, 30, 0.7),                                         // the light down its side
]);
export const parasolFurled = (x: number, y: number, w: number, h: number) => fit(PARASOL_FURLED, x, y, w, h);
/** One panel of a canopy, apex at (ax, ay), running to the hem between two rib tips. */
function sci3Gore(role: Role, ax: number, ay: number, p1: [number, number], p2: [number, number]): ObjPart {
  const mx = (p1[0] + p2[0]) / 2;
  const my = (p1[1] + p2[1]) / 2;
  const dx = mx - ax;
  const dy = my - ay;
  const h = Math.hypot(dx, dy);
  const w = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
  return oTri(role, (ax + mx) / 2, (ay + my) / 2, w, h, 'up', (Math.atan2(-dx, dy) * 180) / Math.PI);
}
const PARASOL_TIPS: [number, number][] = [[1, 21], [16, 23.5], [30.5, 24.5], [45.5, 24.5], [60, 23.5], [75, 21]];
const PARASOL_CANOPY: ObjPart[] = sci3In(76, 76, [
  ...sci3N('umbOrange',
    oTri('mass', 38, 11.5, 76, 20, 'up'),                                    // the canopy's cone
    oEll('mass', 38, 20.5, 74, 7.5),                                         // swelling down to its hem
  ),
  ...sci3N('canvasWhite',
    sci3Gore('mass', 38, 1.5, [17, 23], [29.5, 24]),                         // the white panels, alternate
    sci3Gore('mass', 38, 1.5, [46.5, 24], [59, 23]),
  ),
  ...PARASOL_TIPS.map(([x, y]) => oBar('line', 38, 1.6, x, y, 0.55)),       // the ribs
  ...sci3N('umbOrange', ...PARASOL_TIPS.slice(1, 5).map(([x, y]) => oTri('mass', x, y + 0.6, 2.6, 2.4, 'down'))), // the valance points
  ...sci3N('wood', oEll('mass', 38, 1, 3.6, 3)),                             // the finial
  oBar('lit', 30, 5.6, 14, 15.5, 0.9),                                       // the lamp on the near slope
]);
export const parasolCanopy = (x: number, y: number, w: number, h: number) => fit(PARASOL_CANOPY, x, y, w, h);

// ── ICE CREAM KIOSK ──────────────────────────────────────────────────────────
//
// REFERENCE. A beach ice cream kiosk (Brighton's, and the Skegness row) is a small
// painted BOX with a SIGN BOARD along its front, a striped AWNING jutting over a wide
// serving HATCH, a COUNTER ledge at the hatch's foot with the freezer's tubs of ice
// cream showing inside, and a big model CORNET on the roof. The awning and the cornet
// on the roof are the field marks: without them it is a shed with a window. Real units,
// 66 × 124; the counter's top is at y 100, the sign board's face at `KIOSK_SIGN`.
const ICE_KIOSK: ObjPart[] = sci3In(66, 124, [
  ...sci3N('kioskBlue',
    oRect('mass', 33, 79, 62, 90),                                           // the walls
    oRect('face', 61.5, 79, 5, 90),                                          // the side, away from the lamp
  ),
  ...sci3N('canvasWhite',
    oRect('mass', 33, 33, 68, 5, 0, 1.2),                                    // the roof's edge
    oRect('mass', 33, 44, 54, 12, 0, 1.2),                                   // the sign board
    oRect('mass', 33, 102, 60, 4, 0, 1),                                     // the counter ledge
    oRect('mass', 33, 59, 68, 9),                                            // the awning's white stripes
  ),
  ...sci3N('stripeRed', ...[3.5, 15.5, 27.5, 39.5, 51.5, 63.5].map((x) => oRect('mass', x, 59, 6, 9))),
  ...[3.5, 9.5, 15.5, 21.5, 27.5, 33.5, 39.5, 45.5, 51.5, 57.5, 63.5].map((x, k) =>
    ({ ...oEll('mass', x, 64, 6, 4.4), nat: (k % 2 ? 'canvasWhite' : 'stripeRed') as NaturalKey })), // the scalloped valance
  ...sci3N('gloom', oRect('dark', 33, 84, 50, 31)),                         // the hatch, dark inside
  ...sci3N('kioskBlue', oRect('dark', 33, 69.5, 50, 2)),                     // the awning's shadow on the wall
  ...sci3N('scoopPink', oRect('mass', 17, 97, 8, 4.4, 0, 1)),               // the tubs in the freezer
  ...sci3N('vanilla', oRect('mass', 27, 97, 8, 4.4, 0, 1)),
  ...sci3N('coffee', oRect('mass', 37, 97, 8, 4.4, 0, 1)),
  ...sci3N('appleGreen', oRect('mass', 47, 97, 8, 4.4, 0, 1)),
  ...sci3N('kioskBlue', oRect('dark', 33, 121, 62, 4)),                      // the plinth
  // the model cornet on the roof
  ...sci3N('wafer', oTri('mass', 33, 21, 14, 18, 'down')),
  oBar('line', 28, 16, 36.5, 24, 0.6), oBar('line', 38, 16, 29.5, 24, 0.6),
  ...sci3N('scoopPink', oEll('mass', 33, 9, 17, 12), oRect('mass', 33, 13, 16, 3.2, 0, 1.6)),
  oEll('lit', 29.5, 6.5, 4, 2.6),
  oBar('lit', 1.6, 36, 1.6, 120, 0.8),                                       // the lamp down the wall's edge
]);
export const iceKiosk = (x: number, y: number, w: number, h: number) => fit(ICE_KIOSK, x, y, w, h);
/** The kiosk's sign board and its counter ledge, in the kiosk's real units. */
export const KIOSK_SIGN = { x: 33, y: 44, w: 54, h: 12 } as const;
export const KIOSK_COUNTER = { x0: 3, x1: 63, y: 100 } as const;

// ── QUEUE STAND ──────────────────────────────────────────────────────────────
//
// REFERENCE. A kiosk's queue is marked by a chrome STANCHION on a round foot with a
// red ROPE hooked from its top to the kiosk, sagging between. Real units, 36 × 44: the
// post at x 2, the rope's far end at (35, 6).
const QUEUE_STAND: ObjPart[] = sci3In(36, 44, [
  ...sci3N('silver',
    oBar('mass', 2, 4, 2, 42, 2),                                            // the post
    oEll('mass', 2, 42.6, 9, 2.8),                                           // its foot
    oEll('mass', 2, 3, 3.8, 3.8),                                            // its knob
  ),
  ...sci3N('ropeRed', oBar('mass', 2.5, 6, 18, 11.5, 2), oBar('mass', 18, 11.5, 34.5, 6, 2)), // the rope
  oEll('line', 35, 6, 2.4, 2.4),                                             // its hook
]);
export const queueStand = (x: number, y: number, w: number, h: number) => fit(QUEUE_STAND, x, y, w, h);

// ── FLIPCHART ────────────────────────────────────────────────────────────────
//
// REFERENCE. A flipchart (the workshop one) is a pale BOARD with a dark CLAMP BAR along
// its top holding a pad of PAPER, a TRAY along its foot for the pens, on a TRIPOD: a
// short post under the board and three legs splayed to the floor, the third behind.
// The clamp bar and the tray are the field marks; without them it is a whiteboard.
// Real units, 80 × 118; the paper's face, where the scene draws the chart, is
// `FLIP_PAPER`.
const FLIP_CHART: ObjPart[] = sci3In(80, 118, [
  ...sci3N('silver',
    oBar('face', 40, 76, 40, 116, 2),                                        // the back leg
    oBar('mass', 40, 62, 40, 77, 3),                                         // the post
    oBar('mass', 40, 76, 9, 117, 2.4),                                       // the front legs
    oBar('mass', 40, 76, 71, 117, 2.4),
  ),
  ...sci3N('casing',
    oRect('mass', 40, 33, 78, 62, 0, 2),                                     // the board
    oRect('mass', 40, 65.5, 80, 3.6, 0, 1.2),                                // the pen tray
  ),
  ...sci3N('signBoard', oRect('mass', 40, 5, 80, 5, 0, 1.6)),                 // the clamp bar
  ...sci3N('paper', oRect('mass', 40, 36, 70, 50)),                          // the pad of paper
  oBar('line', 20, 65.5, 27, 65.5, 1.2),                                     // a pen in the tray
]);
export const flipChart = (x: number, y: number, w: number, h: number) => fit(FLIP_CHART, x, y, w, h);
export const FLIP_PAPER = { x: 40, y: 36, w: 70, h: 50 } as const;

// ── CORNET ───────────────────────────────────────────────────────────────────
//
// REFERENCE. An ice cream cornet is a WAFER CONE, its criss-cross pattern pressed into
// it, under a round SCOOP that sits just proud of the cone's rim with a lip where it
// meets it. Real units, 9 × 17, the scoop's top at y 0.
const cornetParts = (scoop: NaturalKey): ObjPart[] => sci3In(9, 17, [
  ...sci3N('wafer', oTri('mass', 4.5, 11.6, 7.6, 10.8, 'down')),            // the cone
  ...sci3N('wafer',
    oBar('dark', 2, 8, 5.6, 14.6, 0.5), oBar('dark', 7, 8, 3.4, 14.6, 0.5), // its pattern
    oBar('dark', 3.8, 7.4, 6.4, 11.8, 0.5), oBar('dark', 5.2, 7.4, 2.6, 11.8, 0.5),
  ),
  ...sci3N(scoop,
    oEll('mass', 4.5, 4.2, 8.6, 7.6),                                        // the scoop
    oRect('mass', 4.5, 6.6, 8.4, 2.2, 0, 1.1),                               // its lip on the rim
  ),
  oEll('lit', 3, 2.8, 2.4, 1.7),
]);
export const iceCornet = (x: number, y: number, w: number, h: number, scoop: NaturalKey = 'scoopPink') =>
  fit(cornetParts(scoop), x, y, w, h);

// ── SUN CREAM ────────────────────────────────────────────────────────────────
//
// REFERENCE. A bottle of sun cream is a squat SQUEEZY BOTTLE stood on its white FLIP
// CAP, with a pale LABEL on its front. Real units, 5 × 11, cap up.
const SUN_CREAM: ObjPart[] = sci3In(5, 11, [
  ...sci3N('creamTube', oRect('mass', 2.5, 6.6, 5, 8.8, 0, 1.6)),
  ...sci3N('canvasWhite', oRect('mass', 2.5, 1.5, 3.4, 3, 0, 0.7)),
  oRect('lit', 2.5, 7, 3.4, 3.6, 0, 0.6),
]);
export const sunCream = (x: number, y: number, w: number, h: number) => fit(SUN_CREAM, x, y, w, h);

// ── FAIR-WEATHER CLOUD ───────────────────────────────────────────────────────
//
// REFERENCE. A fair-weather cloud icon is three white DOMES, the middle one tallest,
// on a FLAT BOTTOM that is faintly shaded underneath. White, not the rain cloud's grey:
// this one passes in front of the sun on a fine day. Real units, 60 × 22.
const FAIR_CLOUD: ObjPart[] = sci3In(60, 22, sci3N('cloudWhite',
  oEll('mass', 16, 13.5, 22, 15),
  oEll('mass', 31, 9, 26, 18),
  oEll('mass', 45, 13, 22, 15),
  oRect('mass', 30.5, 16.5, 54, 10, 0, 5),
  oRect('face', 31, 20.2, 46, 2.2, 0, 1.1),
));
export const fairCloud = (x: number, y: number, w: number, h: number) => fit(FAIR_CLOUD, x, y, w, h);

// ── sci3: objects for this lesson go ABOVE this line ──

// ─────────────────────────────────────────────────────────────────────────────
// history-foundations-3 — A VILLAGE FOOTBRIDGE OVER A STREAM. A plank footbridge on
// timber trestles with a handrail along its far side, the stream under it, a hay cart
// whose wheel has gone through a rotten plank, the broken plank and the new one that
// mends it, reeds on the banks, and a timber barn with a weather vane on its ridge.
// ─────────────────────────────────────────────────────────────────────────────

/** Parts in a named real colour (AP11). */
const h3N = (k: NaturalKey, ...ps: ObjPart[]): ObjPart[] => ps.map((p) => ({ ...p, nat: k }));
/** Author in real units (an ax × ay box) and hand it to `fit` as the 100-square. */
function h3In(ax: number, ay: number, parts: readonly ObjPart[]): ObjPart[] {
  const sx = 100 / ax;
  const sy = 100 / ay;
  const s = 100 / Math.min(ax, ay);
  return parts.map((p) => {
    if (p.k === 'bar') return { ...p, x1: p.x1 * sx, y1: p.y1 * sy, x2: p.x2 * sx, y2: p.y2 * sy, t: p.t * s };
    return { ...p, x: p.x * sx, y: p.y * sy, w: p.w * sx, h: p.h * sy, ...(p.k === 'rect' ? { rad: p.rad * s } : null) } as ObjPart;
  });
}

// ── THE FOOTBRIDGE: DECK, HANDRAIL, STREAM ───────────────────────────────────
//
// REFERENCE (Commons: "Plank footbridge, Westwick, Norfolk"; "Wooden footbridge,
// Suffield"). A village footbridge over a stream is long PLANKS laid lengthwise and
// butted end to end over cross BEARERS, each bearer on a pair of timber posts driven
// into the bed, with a stone or earth ABUTMENT at each bank. The handrail is posts with
// a TOP RAIL and a MIDDLE RAIL, and every piece of it is weathered to a silver grey.
// Seen from the side, the deck is a line of plank ends at the bank's own level and the
// water shows in the shade under it.
//
// The deck is authored in the 180 × 18 box it is laid in (x 0 at the left abutment, y 0
// at the deck's top). The planks butt at 46, 86 and 134; the one from 86 to 134 is the
// rotten one, and it is NOT in this drawing — the scene draws it broken, and later new.
const FB_JOINTS = [46, 86, 134] as const;
const FB_PLANKS = [[26, 40], [66, 40], [154, 40]] as const;
const FOOTBRIDGE_DECK: ObjPart[] = h3In(180, 18, [
  // the stone abutments at each bank
  ...h3N('coping',
    oRect('mass', 6, 10.5, 12, 15, 0, 1),
    oRect('mass', 174, 10.5, 12, 15, 0, 1),
    ...[6, 174].flatMap((x) => [
      oBar('dark', x - 5.4, 8, x + 5.4, 8, 0.7),
      oBar('dark', x - 5.4, 13.4, x + 5.4, 13.4, 0.7),
      oBar('dark', x - 1, 8, x - 1, 13.4, 0.7),
      oBar('dark', x + 2.5, 13.4, x + 2.5, 18, 0.7),
    ]),
  ),
  // the trestle posts under each joint, and the bearers they carry, seen end on
  ...h3N('oldWood',
    ...FB_JOINTS.map((x) => oRect('mass', x, 11.4, 4, 13.2)),
    ...FB_JOINTS.map((x) => oRect('mass', x, 5.4, 8, 2.8, 0, 0.6)),
    ...FB_JOINTS.map((x) => oRect('dark', x + 1.1, 12, 1.4, 11.4)),
  ),
  // the planks, laid lengthwise and butted over the bearers
  ...h3N('oldWood',
    ...FB_PLANKS.map(([x, l]) => oRect('mass', x, 2, l, 4, 0, 0.6)),
    ...FB_PLANKS.map(([x, l]) => oBar('dark', x - l / 2 + 1, 3.4, x + l / 2 - 1, 3.4, 0.9)),
    oEll('dark', 58, 2, 2.2, 1.2), oEll('dark', 147, 2.2, 2, 1.1), oBar('dark', 12, 1.8, 22, 2.2, 0.35),
  ),
  // the two planks either side of the gap end where the rotten one broke off them: in
  // jagged, dark splinters, which is what says a plank is MISSING rather than unlaid
  ...h3N('rotWood',
    oRect('mass', 84.6, 2, 3, 4), oTri('mass', 87.4, 1.3, 3, 2.2, 'right'), oTri('mass', 87, 3.2, 2.4, 1.8, 'right'),
    oRect('mass', 135.4, 2, 3, 4), oTri('mass', 132.6, 1.4, 2.6, 2.2, 'left'), oTri('mass', 132.8, 3.2, 3, 1.8, 'left'),
  ),
  ...FB_PLANKS.map(([x, l]) => oBar('lit', x - l / 2 + 1.4, 0.6, x + l / 2 - 1.4, 0.6, 0.55)),
]);
export const footbridgeDeck = (x: number, y: number, w: number, h: number) => fit(FOOTBRIDGE_DECK, x, y, w, h);
export { FB_JOINTS };

/** The handrail along the far side: five posts, a top rail and a middle rail. 220 × 48. */
const FB_POSTS = [4, 60, 116, 172, 216] as const;
const FOOTBRIDGE_RAIL: ObjPart[] = h3In(220, 48, [
  ...h3N('oldWood',
    ...FB_POSTS.map((x) => oRect('mass', x, 25.6, 4.2, 44.8)),
    ...FB_POSTS.map((x) => oRect('mass', x, 2.6, 6, 3, 0, 0.8)),
    oRect('mass', 110, 5.8, 218, 3.6, 0, 1),
    oRect('mass', 110, 24.5, 218, 3, 0, 1),
    ...FB_POSTS.map((x) => oRect('dark', x + 1.1, 27, 1.4, 40)),
    oBar('dark', 2, 7.2, 218, 7.2, 0.7),
    oBar('dark', 2, 25.6, 218, 25.6, 0.6),
  ),
  oBar('lit', 2, 4.5, 218, 4.5, 0.5),
]);
export const footbridgeRail = (x: number, y: number, w: number, h: number) => fit(FOOTBRIDGE_RAIL, x, y, w, h);
export { FB_POSTS };

/**
 * The stream under the bridge: water in the shade of the deck, its surface catching the
 * light, the muddy banks running down into it at both ends. 172 × 18, its top at the
 * deck's own top, so the shade under the deck is what shows through a gap in it.
 */
const STREAM_BED: ObjPart[] = h3In(172, 18, [
  ...h3N('water', oRect('mass', 86, 9.5, 158, 17)),
  ...h3N('soil', oEll('mass', 6, 11, 14, 14), oEll('mass', 166, 11, 14, 14)),
  ...h3N('water', oRect('dark', 86, 3.2, 156, 4.4), oRect('dark', 86, 16.4, 156, 2.8)),
  oBar('lit', 14, 9.2, 40, 9.2, 0.6), oBar('lit', 60, 11.2, 82, 11.2, 0.6), oBar('lit', 104, 9.6, 132, 9.6, 0.6),
]);
export const streamBed = (x: number, y: number, w: number, h: number) => fit(STREAM_BED, x, y, w, h);

// ── THE HAY CART ─────────────────────────────────────────────────────────────
//
// REFERENCE (Commons: "Mr. Simpson standing in a horse-drawn hay cart, Nova Scotia";
// "Loading hay onto the wagon, Kingsthorpe"). A two-wheeled farm cart is a flat BED on
// one axle, a LADDER of staves and rails along each side to hold the load in, and two
// SHAFTS running forward from the front of the bed. The wheel is TALL — its top stands
// well above the bed — so seen from the side it covers the bed's middle. The hay is a
// mound with a rounded, lumpy top, overhanging the ladder a little and shaded low in
// the bed.
//
// Two drawings in one 128 × 60 box, so the scene can lay the ladder OVER the hay and
// outline each: the axle is at (42, 54), the bed 2–82 × 42–50, the shafts' tips at
// (126, 59) — the cart stands on its wheel and the tips of its shafts. The wheel is the
// library's `wheel`, turned by the scene.
export const CART_AXLE = { x: 42, y: 54, w: 128, h: 60 } as const;
const CART_HAY: ObjPart[] = h3In(128, 60, [
  ...h3N('hay',
    oRect('mass', 42, 30, 80, 24, 0, 3),
    oEll('mass', 42, 21, 86, 28),
    oEll('mass', 14, 18, 28, 20),
    oEll('mass', 30, 12, 30, 20),
    oEll('mass', 51, 10, 32, 18),
    oEll('mass', 70, 15, 30, 20),
    oRect('face', 42, 39.5, 80, 5),
    oBar('dark', 8, 27, 16, 24, 0.8), oBar('dark', 28, 21, 38, 19, 0.8), oBar('dark', 54, 24, 63, 21, 0.8),
    oBar('dark', 20, 34, 30, 32, 0.8), oBar('dark', 64, 31, 74, 33, 0.8), oBar('dark', 42, 14, 50, 12, 0.7),
    oBar('mass', 36, 3, 33, 0.5, 0.9), oBar('mass', 58, 2.5, 62, 0.6, 0.9), oBar('mass', 3, 16, 0.6, 13, 0.9),
  ),
]);
export const cartHay = (x: number, y: number, w: number, h: number) => fit(CART_HAY, x, y, w, h);
const CART_BODY: ObjPart[] = h3In(128, 60, [
  ...h3N('wood',
    oRect('mass', 42, 46, 80, 8, 0, 1),
    ...[3, 22, 42, 62, 81].map((x) => oBar('mass', x, 43, x, 21, 2.6)),
    oBar('mass', 1.5, 21.5, 82.5, 21.5, 2.8),
    oBar('mass', 2, 32, 82, 32, 2),
    oBar('mass', 78, 46, 125, 58.5, 3.2),
    oBar('face', 80, 43.6, 123, 55.4, 2.4),
    oBar('dark', 3, 49, 81, 49, 1.4),
    oRect('dark', 42, 51.5, 16, 3),
  ),
  oBar('lit', 4, 42.8, 80, 42.8, 0.6),
  oRect('line', 124.6, 58.2, 3.4, 2.6, -15, 0.6),
]);
export const cartBody = (x: number, y: number, w: number, h: number) => fit(CART_BODY, x, y, w, h);

// ── THE PLANKS ───────────────────────────────────────────────────────────────
//
// REFERENCE (Commons: decay in timber, from the USDA's forest-pathology bulletins). Rot
// in a plank is DARK and SOFT where it has got in: the sound wood stays grey to the
// break, and the broken end is brown-black, splintered into jagged fibres and pitted.
// The rotten piece is 28 × 6, its broken end on the right; the new plank is the length
// of the one that rotted, 48 × 4.5, in pale fresh-sawn pine with its grain.
const BROKEN_PLANK: ObjPart[] = h3In(28, 6, [
  ...h3N('oldWood', oRect('mass', 11, 3, 22, 4, 0, 0.6)),
  ...h3N('rotWood',
    oRect('mass', 23.4, 3, 5.2, 4),
    oTri('mass', 26.8, 1.8, 2.8, 1.8, 'right'),
    oTri('mass', 27, 3.3, 2.6, 1.4, 'right'),
    oTri('mass', 26.4, 4.6, 2.2, 1.4, 'right'),
    oEll('dark', 22.4, 2.4, 1.8, 1.2), oEll('dark', 24.8, 4, 1.6, 1.1), oBar('dark', 14, 3.1, 21, 2.5, 0.5),
    oEll('mass', 18.6, 3.6, 3.4, 2.4),
  ),
  ...h3N('oldWood', oBar('dark', 1, 4.4, 17, 4.4, 0.8)),
  oBar('lit', 1.2, 1.5, 16, 1.5, 0.5),
]);
export const brokenPlank = (x: number, y: number, w: number, h: number) => fit(BROKEN_PLANK, x, y, w, h);
const NEW_PLANK: ObjPart[] = h3In(48, 4.5, [
  ...h3N('newWood',
    oRect('mass', 24, 2.25, 48, 4.5, 0, 0.5),
    oRect('dark', 24, 3.75, 46.4, 0.8),
    oRect('dark', 14, 2.15, 10, 0.35), oRect('dark', 33, 2.0, 12, 0.35), oEll('dark', 33, 2.6, 1.4, 1),
  ),
  oRect('lit', 24, 0.8, 46, 0.5),
]);
export const newPlank = (x: number, y: number, w: number, h: number) => fit(NEW_PLANK, x, y, w, h);

// ── REEDS ────────────────────────────────────────────────────────────────────
//
// REFERENCE (any stream bank): a clump of long BLADES fanning from one root, and among
// them a bulrush or two — a brown velvet head on its own stalk. 22 × 28.
const REEDS: ObjPart[] = h3In(22, 28, [
  ...h3N('leaf',
    oBar('mass', 10, 27.5, 3.5, 5, 1.6),
    oBar('mass', 11, 27.5, 11, 1.5, 1.6),
    oBar('mass', 12, 27.5, 19, 7, 1.6),
    oBar('mass', 9.5, 27.5, 1, 14, 1.4),
    oBar('mass', 12.5, 27.5, 21, 15, 1.4),
    oBar('dark', 11, 27, 11, 12, 0.6),
  ),
  ...h3N('seedhead', oRect('mass', 7, 9, 3, 8, -16, 1.5), oRect('mass', 16, 11, 3, 8, 14, 1.5)),
]);
export const reeds = (x: number, y: number, w: number, h: number) => fit(REEDS, x, y, w, h);

// ── THE BARN, AND ITS WEATHER VANE ───────────────────────────────────────────
//
// REFERENCE (a village timber barn, gable end on): a tall gable of horizontal
// WEATHERBOARDS under BARGE BOARDS standing proud of the roof's edge, a hay LOFT door
// high in the gable, and wide double DOORS braced in a Z. 92 × 140, the apex at (46, 1).
//
// REFERENCE (Commons: the Smithsonian's rooster weathervanes). A weather vane is a
// SPINDLE on the ridge carrying the four ARMS of the compass, and above them a pointer
// with a broad TAIL that the wind pushes round — here a cockerel standing on an arrow,
// his tail feathers sweeping up behind him. Cut from black iron, so it reads as a
// silhouette against the sky. 44 × 46, the spindle's foot at (22, 46).
const BARN: ObjPart[] = h3In(92, 140, [
  ...h3N('barnBoard',
    oRect('mass', 46, 95, 84, 90),
    oTri('mass', 46, 26, 84, 50, 'up'),
    ...[58, 66, 74, 82, 90, 98, 106, 114, 122, 130].map((y) => oBar('dark', 6, y, 86, y, 0.8)),
    ...[18, 26, 34, 42].map((y) => {
      const half = ((y - 1) / 50) * 42 - 3;
      return oBar('dark', 46 - half, y, 46 + half, y, 0.8);
    }),
    oRect('dark', 46, 138.6, 84, 2.8),
  ),
  ...h3N('roofBoard',
    oBar('mass', -0.5, 53.5, 46, 1.5, 4.4),
    oBar('mass', 46, 1.5, 92.5, 53.5, 4.4),
    oRect('dark', 46, 35, 15, 17, 0, 1),
  ),
  ...h3N('wood',
    oRect('dark', 46, 108.5, 46, 63, 0, 1),
    oBar('dark', 46, 78, 46, 139, 0.9),
  ),
  oBar('line', 26, 82, 26, 135, 0.9), oBar('line', 66, 82, 66, 135, 0.9),
  oBar('line', 26, 84, 43, 134, 0.9), oBar('line', 66, 84, 49, 134, 0.9),
  oBar('line', 24, 108, 44, 108, 0.9), oBar('line', 48, 108, 68, 108, 0.9),
  oBar('line', 23, 76.5, 69, 76.5, 1.2),
]);
export const barn = (x: number, y: number, w: number, h: number) => fit(BARN, x, y, w, h);
const WEATHER_VANE: ObjPart[] = h3In(44, 46, [
  ...h3N('iron',
    oBar('mass', 22, 45, 22, 15, 1.6),
    oRect('mass', 22, 44, 5, 3, 0, 0.8),
    oBar('mass', 3, 34, 41, 34, 1.3),
    oBar('mass', 15.5, 38, 28.5, 30, 1.1),
    oEll('mass', 3, 34, 2.8, 2.8), oEll('mass', 41, 34, 2.8, 2.8),
    oBar('mass', 6, 21, 38, 21, 1.4),
    oTri('mass', 40, 21, 5, 5, 'right'),
    oRect('mass', 5, 21, 5, 6, 0, 0.5),
    oEll('mass', 12, 6.5, 12, 4.4, -55),
    oEll('mass', 10.5, 10.5, 12, 4.2, -30),
    oEll('mass', 12.5, 14, 10, 3.6, -8),
    oEll('mass', 21, 12.5, 14, 8),
    oEll('mass', 28.5, 7, 6, 7.5),
    oTri('mass', 33, 6.6, 3, 2, 'right'),
    oTri('mass', 26.8, 2.6, 2.6, 3, 'up'), oTri('mass', 29.2, 2.4, 2.6, 3, 'up'),
    oBar('mass', 21, 16, 21, 20.5, 1), oBar('mass', 24, 16, 25, 20.5, 1),
    oEll('dark', 22, 15, 10, 3),
  ),
  oEll('lit', 18, 10.4, 5, 1.6, -10),
  oEll('lit', 29.6, 6, 1.2, 1.2),
]);
export const weatherVane = (x: number, y: number, w: number, h: number) => fit(WEATHER_VANE, x, y, w, h);

// ── hist3: objects for this lesson go ABOVE this line ──

// ─────────────────────────────────────────────────────────────────────────────
// phil4 — A RAILWAY PLATFORM (philosophy-foundations-4, "How Do You Know?"). A
// station's pillar clock that stopped last night, a departure screen on its post, the
// platform's name sign on two posts, a slatted bench, a brick tunnel portal at the end
// of the line, and a railway ticket. Each in its own colours (AR1).
// ─────────────────────────────────────────────────────────────────────────────

/** Parts in a named real colour (AP11). */
const p4N = (k: NaturalKey, ...ps: ObjPart[]): ObjPart[] => ps.map((p) => ({ ...p, nat: k }));
/** Author in real units (an ax × ay box) and hand it to `fit` as the 100-square. */
function p4In(ax: number, ay: number, parts: readonly ObjPart[]): ObjPart[] {
  const sx = 100 / ax;
  const sy = 100 / ay;
  const s = 100 / Math.min(ax, ay);
  return parts.map((p) => {
    if (p.k === 'bar') return { ...p, x1: p.x1 * sx, y1: p.y1 * sy, x2: p.x2 * sx, y2: p.y2 * sy, t: p.t * s };
    return { ...p, x: p.x * sx, y: p.y * sy, w: p.w * sx, h: p.h * sy, ...(p.k === 'rect' ? { rad: p.rad * s } : null) } as ObjPart;
  });
}
/** A clock hand from the dial's centre (cx, cy), `deg` clockwise from twelve. */
function p4Hand(role: Role, cx: number, cy: number, deg: number, len: number, tail: number, t: number): ObjPart {
  const a = (deg * Math.PI) / 180;
  const sx = Math.sin(a);
  const sy = -Math.cos(a);
  return oBar(role, cx - sx * tail, cy - sy * tail, cx + sx * len, cy + sy * len, t);
}

// ── THE STATION'S PILLAR CLOCK ───────────────────────────────────────────────
//
// REFERENCE (Commons, "Platform clock, Keighley station"; the clocks at Butterley and
// Wellington): a round clock high on a cast-iron POST, the post standing on a square
// PEDESTAL with a sunk panel and a moulded plinth, a ball FINIAL over the case; a
// cream DIAL in a deep painted RIM, the hours marked by bars, the quarters heavier.
// Its hands are drawn in, because this one STOPPED at a quarter past nine last night:
// the hour hand a quarter of the way from nine to ten, the minute hand on the three,
// and the red second hand stopped at forty. Real units, 40 × 150; the dial's centre
// is CLOCK_DIAL.
const STATION_CLOCK: ObjPart[] = p4In(40, 150, [
  ...p4N('clockMaroon',
    oEll('mass', 20, 4, 5, 5),                                     // the finial's ball
    oRect('mass', 20, 8.5, 3.4, 5, 0, 0.6),                        // and its neck
    oEll('mass', 20, 29, 38, 38),                                  // the case, round the dial
    oRect('mass', 20, 50, 12, 5, 0, 1),                            // the collar under the case
    oRect('mass', 20, 90, 7, 78),                                  // the post
    oRect('mass', 20, 128.5, 13, 4, 0, 1),                         // its foot, flared
    oRect('mass', 20, 138, 26, 18, 0, 1),                          // the pedestal
    oRect('mass', 20, 147.5, 32, 5, 0, 1),                         // its plinth
    oRect('face', 34.5, 138, 3, 18),                               // the pedestal's side, in shade
    oRect('face', 24.2, 90, 1.6, 76),                              // the post's far side
    oEll('dark', 21, 30, 33, 33),                                  // the rim's inner edge
    oRect('dark', 18.5, 137.5, 16, 11, 0, 1),                      // the pedestal's sunk panel
  ),
  ...p4N('dialCream', oEll('dark', 20, 29, 30, 30)),               // the dial: a plane laid over the rim's
                                                                   // inner edge, so it is painted after it
  ...Array.from({ length: 12 }, (_, i) => p4Hand('line', 20, 29, i * 30, 13.6, i % 3 === 0 ? -9.8 : -11.4, i % 3 === 0 ? 2 : 1)),
  p4Hand('line', 20, 29, 277.5, 7.2, 1.6, 1.9),                    // the hour hand, a quarter past nine
  p4Hand('line', 20, 29, 90, 10.8, 1.8, 1.3),                      // the minute hand, on the three
  ...p4N('clockRed', p4Hand('dark', 20, 29, 240, 12, 3, 0.7)),     // the second hand, stopped at forty
  oEll('line', 20, 29, 2.2, 2.2),                                  // the boss the hands turn on
  oBar('lit', 17.8, 54, 17.8, 124, 0.9),                           // the lamp down the post
  oBar('lit', 8, 129.6, 32, 129.6, 0.8),                           // and along the pedestal's top
  oBar('lit', 11, 142.6, 26, 142.6, 0.6),                          // the panel's lit lower lip
]);
export const stationClock = (x: number, y: number, w: number, h: number) => fit(STATION_CLOCK, x, y, w, h);
/** The dial's centre and the case's radius, in the clock's own 40 × 150 units. */
export const CLOCK_DIAL = { x: 20, y: 29, r: 19 } as const;

// ── THE DEPARTURE SCREEN ON ITS POST ─────────────────────────────────────────
//
// REFERENCE (Commons, departure boards at Brighton and Glasgow Central): a BLACK
// display in a grey steel CASING, its lines in AMBER letters, held up on a single
// steel POST with a base plate bolted to the platform. The words are the scene's —
// the display is DEP_SCREEN. Real units, 84 × 124.
const DEPARTURE_SCREEN: ObjPart[] = p4In(84, 124, [
  ...p4N('screenCase',
    oRect('mass', 42, 82, 6, 86),                                  // the post
    oRect('mass', 42, 121.5, 16, 5, 0, 1),                         // its base plate
    oRect('mass', 42, 41, 12, 6, 0, 1),                            // the bracket the casing hangs on
    oRect('mass', 42, 19, 84, 38, 0, 2),                           // the casing
    oRect('face', 82.5, 19, 3, 36),                                // its end, in shade
    oRect('face', 44.4, 82, 1.6, 84),                              // the post's far side
  ),
  ...p4N('ledBlack', oRect('dark', 41, 19, 76, 30, 0, 1)),         // the display
  oBar('lit', 2.5, 1.2, 80, 1.2, 0.8),                             // the lamp along the casing's top
  oBar('lit', 40.2, 46, 40.2, 118, 0.7),                           // and down the post
]);
export const departureScreen = (x: number, y: number, w: number, h: number) => fit(DEPARTURE_SCREEN, x, y, w, h);
/** The display the words are on, in the screen's own 84 × 124 units. */
export const DEP_SCREEN = { x: 41, y: 19, w: 76, h: 30 } as const;

// ── THE PLATFORM SIGN ────────────────────────────────────────────────────────
//
// REFERENCE (Network Rail's platform signs, and the running-in boards in the Keighley
// photograph): a long BOARD in the railway's colour, its words in white across it,
// framed by a thin white rule, on TWO POSTS standing on the platform. The words are
// the scene's — the board's face is PLATFORM_FACE. Real units, 76 × 104.
const PLATFORM_SIGN: ObjPart[] = p4In(76, 104, [
  ...p4N('iron',
    oRect('mass', 10, 62, 4, 84),                                  // the posts
    oRect('mass', 66, 62, 4, 84),
    oRect('face', 11.4, 62, 1.2, 82),                              // their far sides
    oRect('face', 67.4, 62, 1.2, 82),
  ),
  ...p4N('railBlue',
    oRect('mass', 38, 11.5, 76, 23, 0, 1.6),                       // the board
    oRect('face', 75, 11.5, 2, 21),                                // its end, in shade
  ),
  oRect('lit', 38, 2.6, 70, 0.8),                                  // the white rule round its face
  oRect('lit', 38, 20.4, 70, 0.8),
  oRect('lit', 3.4, 11.5, 0.8, 18.6),
  oRect('lit', 72.6, 11.5, 0.8, 18.6),
]);
export const platformSign = (x: number, y: number, w: number, h: number) => fit(PLATFORM_SIGN, x, y, w, h);
/** The board's face inside its white rule, in the sign's own 76 × 104 units. */
export const PLATFORM_FACE = { x: 38, y: 11.5, w: 68, h: 17 } as const;

// ── THE PLATFORM BENCH ───────────────────────────────────────────────────────
//
// REFERENCE (Commons, the GWR benches at Hall Green, Castle Cary and Newton Abbot):
// a bench of timber SLATS — two along the back, two in the seat — between cast-iron
// ENDS painted dark green, each end one piece: a back post, a scrolled arm, a front
// leg, a foot. Seen from the front, the slats run the length and the ends stand at
// either side. Real units, 56 × 28; the seat is at about a third of a person's height.
const PLATFORM_BENCH: ObjPart[] = p4In(56, 28, [
  ...p4N('benchGreen',
    oBar('mass', 5, 1.5, 5, 27, 3.2),                              // the ends: a back post …
    oBar('mass', 51, 1.5, 51, 27, 3.2),
    oBar('mass', 2.2, 13, 9.6, 13, 2.6),                           // … an arm …
    oBar('mass', 46.4, 13, 53.8, 13, 2.6),
    oEll('mass', 2.6, 13.6, 3.6, 3.6),                             // … scrolled at its end …
    oEll('mass', 53.4, 13.6, 3.6, 3.6),
    oRect('mass', 5, 26.8, 6, 2.4, 0, 0.8),                        // … and a foot
    oRect('mass', 51, 26.8, 6, 2.4, 0, 0.8),
  ),
  ...p4N('wood',
    oRect('mass', 28, 3.8, 48, 3.6, 0, 0.8),                       // the back slats
    oRect('mass', 28, 8.6, 48, 3.6, 0, 0.8),
    oRect('mass', 28, 17, 52, 3.6, 0, 0.8),                        // the seat slats
    oRect('face', 28, 19.8, 52, 2),                                // the seat's front edge, in shade
  ),
  oBar('lit', 5, 2.6, 51, 2.6, 0.5),                               // the lamp along the top slat
  oBar('lit', 3, 15.6, 53, 15.6, 0.5),                             // and the seat
]);
export const platformBench = (x: number, y: number, w: number, h: number) => fit(PLATFORM_BENCH, x, y, w, h);

// ── THE TUNNEL AT THE END OF THE LINE ────────────────────────────────────────
//
// REFERENCE (Commons, brick tunnel portals at Redcliffe, Fernleigh and Driving Creek):
// a brick WALL faced into the hillside with a stone COPING along its top, the grassy
// BANK rising over it, and the MOUTH an arch whose ring of brick headers stands
// proud of the wall; inside, nothing but dark. Real units, 64 × 72; the mouth's dark
// is TUNNEL_MOUTH, where the scene puts a train's lamp.
const TUNNEL_PORTAL: ObjPart[] = p4In(64, 72, [
  ...p4N('meadow', oEll('mass', 32, 20, 64, 36)),                  // the bank over it
  ...p4N('brick',
    oRect('mass', 32, 47, 60, 50, 0, 1),                           // the portal's wall
    oRect('face', 62, 47, 4, 48),                                  // its wing, turned from the lamp
    ...[30, 38, 46, 54, 62].map((y) => oBar('dark', 3, y, 60, y, 0.6)), // the courses
    oEll('dark', 30, 46, 36, 34),                                  // the ring of headers round the arch
    oRect('dark', 30, 61, 36, 22),
  ),
  ...p4N('coping', oRect('mass', 32, 22, 64, 4.4, 0, 0.8)),        // the coping stone along its top
  ...p4N('gloom',
    oEll('dark', 30, 47, 28, 26),                                  // the mouth: an arch …
    oRect('dark', 30, 61.5, 28, 21),                               // … running down to the rails
  ),
  oBar('lit', 1, 20.6, 63, 20.6, 0.8),                             // the lamp along the coping
  oBar('line', 18, 71.2, 42, 71.2, 0.8),                           // the rails, going in
]);
export const tunnelPortal = (x: number, y: number, w: number, h: number) => fit(TUNNEL_PORTAL, x, y, w, h);
/** The mouth's dark, in the portal's own 64 × 72 units. */
export const TUNNEL_MOUTH = { x: 30, y: 56, w: 28, h: 30 } as const;

// ── A RAILWAY TICKET ─────────────────────────────────────────────────────────
//
// REFERENCE (Commons, "National Rail Ticket New Layout", and a machine-issued ticket
// from Glasgow Queen Street): a card about one and a half times as long as it is tall,
// a cream FIELD of print between two ORANGE BANDS across its top and foot, the
// railway's double-arrow in a white disc on the foot band. Real units, 16 × 10; it is
// held between the fingers by one end (TICKET_GRIP).
const RAIL_TICKET: ObjPart[] = p4In(16, 10, [
  ...p4N('paper', oRect('mass', 8, 5, 16, 10, 0, 1)),              // the card
  ...p4N('ticketOrange',
    oRect('mass', 8, 1.5, 16, 3, 0, 1),                            // the orange band across its top
    oRect('mass', 8, 8.6, 16, 2.8, 0, 1),                          // and its foot
  ),
  oBar('line', 2.4, 4.4, 10.5, 4.4, 0.55),                         // the print
  oBar('line', 2.4, 6, 8.5, 6, 0.55),
  oEll('lit', 3, 8.6, 2.2, 2.2),                                   // the white disc on the foot band
]);
export const railTicket = (x: number, y: number, w: number, h: number) => fit(RAIL_TICKET, x, y, w, h);
/** Where the ticket is held: by its near end, in its own 16 × 10 units. */
export const TICKET_GRIP = { x: 1.5, y: 5 } as const;

// ── phil4: objects for this lesson go ABOVE this line ──

// ─────────────────────────────────────────────────────────────────────────────
// psych4 — A BUS STOP ON A HIGH STREET (psychology-foundations-4, "Why We Follow the
// Crowd"). Drawn against pictures fetched with `node scripts/get-reference.mjs`
// (scratchpad/ref/p4-*): a glass shelter in grey steel with a flat roof slab, posts
// at every bay and a timetable frame in a back panel at eye level (Oxgangs,
// Edinburgh); a lit advert case at the shelter's end, a tall product bottle on a
// pale ground (Princes Street); a stop pole with its flag held out to one side and a
// yellow "bus stop closed" notice tied round it (Tower Bridge Approach; Merrill
// Street); a café in a white-rendered terrace with a red awning over its window
// (Hythe Road); and a takeaway cup with a card sleeve and a black lid.
// ─────────────────────────────────────────────────────────────────────────────

/** Parts in a named real colour (AP11). */
const ps4N = (k: NaturalKey, ...ps: ObjPart[]): ObjPart[] => ps.map((p) => ({ ...p, nat: k }));
/** Author in real units (an ax × ay box) and hand it to `fit` as the 100-square. */
function ps4In(ax: number, ay: number, parts: readonly ObjPart[]): ObjPart[] {
  const sx = 100 / ax;
  const sy = 100 / ay;
  const s = 100 / Math.min(ax, ay);
  return parts.map((p) => {
    if (p.k === 'bar') return { ...p, x1: p.x1 * sx, y1: p.y1 * sy, x2: p.x2 * sx, y2: p.y2 * sy, t: p.t * s };
    return { ...p, x: p.x * sx, y: p.y * sy, w: p.w * sx, h: p.h * sy, ...(p.k === 'rect' ? { rad: p.rad * s } : null) } as ObjPart;
  });
}

// ── THE SHELTER'S STEEL ──────────────────────────────────────────────────────
//
// REFERENCE (p4-shelterad-2, -4): a flat ROOF SLAB with a deeper fascia, square POSTS
// at each bay, a rail under the roof and a rail a hand above the pavement, the glass
// held between them. Seen face-on from the road. Real units, 240 × 134: four bays of
// 60, posts 4 wide at 2 · 62 · 122 · 182 · 238.
const SHELTER_POSTS = [2, 62, 122, 182, 238];
const SHELTER_FRAME: ObjPart[] = ps4In(240, 134, [
  ...ps4N('shelterSteel',
    oRect('mass', 120, 6, 240, 12, 0, 1.5),                        // the roof slab
    ...SHELTER_POSTS.map((x) => oRect('mass', x, 73, 4, 122)),      // the posts
    oRect('mass', 120, 16.5, 236, 3),                               // the rail under the roof
    oRect('mass', 120, 121.5, 236, 2.4),                            // and the low rail
    ...SHELTER_POSTS.map((x) => oRect('face', x + 1.2, 74, 1.6, 120)), // each post's shaded side
    oRect('dark', 120, 10.6, 236, 2.6),                             // the slab's underside
  ),
  oBar('lit', 3, 2.2, 237, 2.2, 0.9),                               // light along the fascia
]);
export const shelterFrame = (x: number, y: number, w: number, h: number) => fit(SHELTER_FRAME, x, y, w, h);

// ── THE SHELTER'S GLASS ──────────────────────────────────────────────────────
//
// REFERENCE (p4-shelterad-2): toughened glass fills each bay between the rails, clear
// enough to see the street through, with a long streak of light across each pane. The
// scene draws it see-through; the first bay is the advert case, so three panes.
const SHELTER_GLASS: ObjPart[] = ps4In(240, 134, [
  ...[64, 124, 184].map((x) => ps4N('glass', oRect('mass', x + 28, 69, 56, 102))).flat(),
  ...[64, 124, 184].map((x) => oBar('lit', x + 8, 108, x + 30, 36, 2)),
  ...[64, 124, 184].map((x) => oBar('lit', x + 20, 112, x + 40, 46, 1)),
]);
export const shelterGlass = (x: number, y: number, w: number, h: number) => fit(SHELTER_GLASS, x, y, w, h);

// ── THE ADVERT ───────────────────────────────────────────────────────────────
//
// REFERENCE (p4-shelterad-4): an advert at a shelter is a POSTER LIT FROM BEHIND in a
// deep steel case, and what it sells is one big product on a plain pale ground. Here a
// pink shampoo bottle with a flip cap, a few bubbles and the brand's band along the
// foot. Real units, 56 × 104.
const ADVERT_CASE: ObjPart[] = ps4In(56, 104, [
  ...ps4N('shelterSteel', oRect('mass', 28, 52, 56, 104, 0, 1.5)),  // the case
  ...ps4N('posterMint', oRect('dark', 28, 50, 46, 90)),             // the lit poster
  ...ps4N('shampoo',
    oRect('dark', 28, 58, 18, 40, 0, 5),                            // the bottle
    oEll('dark', 28, 38, 18, 10),                                   // its shoulders
    oRect('dark', 28, 88, 46, 6),                                   // the brand's band
  ),
  ...ps4N('porcelain', oRect('dark', 28, 30, 10, 7, 0, 1.5)),        // the flip cap
  oRect('lit', 28, 60, 12, 10, 0, 1),                               // the bottle's label
  oBar('lit', 22, 44, 22, 74, 1.4),                                 // light down its side
  oEll('lit', 13, 24, 6, 6), oEll('lit', 42, 18, 4, 4), oEll('lit', 44, 40, 5, 5),  // bubbles
  oEll('lit', 12, 46, 3, 3),
  oBar('lit', 6, 98, 50, 98, 0.8),                                  // the case's lit sill
]);
export const advertCase = (x: number, y: number, w: number, h: number) => fit(ADVERT_CASE, x, y, w, h);

// ── THE TIMETABLE ────────────────────────────────────────────────────────────
//
// REFERENCE (p4-shelterad-2): a portrait frame in brushed steel, the sheet behind its
// glass a dark header over rows of times printed in two columns on alternating yellow
// and pale-blue bands. Real units, 38 × 48.
const TIMETABLE: ObjPart[] = ps4In(38, 48, [
  ...ps4N('silver', oRect('mass', 19, 24, 38, 48, 0, 1)),           // the frame
  oRect('lit', 19, 24, 32, 42),                                     // the sheet
  ...ps4N('bookBlue', oRect('dark', 19, 7, 32, 6)),                 // its header
  ...[14, 21, 28, 35].flatMap((y, i) => [
    ...ps4N(i % 2 ? 'skyPane' : 'noticeYellow', oRect('dark', 11.5, y, 15, 5)),
    ...ps4N(i % 2 ? 'noticeYellow' : 'skyPane', oRect('dark', 26.5, y, 15, 5)),
  ]),
  ...[14, 21, 28, 35].flatMap((y) => [oBar('line', 6, y, 15, y, 0.6), oBar('line', 21, y, 30, y, 0.6)]),
  oBar('line', 6, 41.5, 22, 41.5, 0.6),                             // the small print at its foot
]);
export const timetable = (x: number, y: number, w: number, h: number) => fit(TIMETABLE, x, y, w, h);

// ── THE STOP POLE ────────────────────────────────────────────────────────────
//
// REFERENCE (p4-stopclosed-2): a steel pole on a concrete foot, its FLAG held out to
// one side at the top on two brackets — a white plate with a red band and the bus
// pictogram. Real units, 40 × 148: the pole at x 4, the flag out to the right.
const STOP_POLE: ObjPart[] = ps4In(40, 148, [
  ...ps4N('silver',
    oRect('mass', 4, 76, 4, 144),                                   // the pole
    oRect('mass', 4, 2.5, 5.4, 4, 0, 1.2),                          // its cap
    oRect('face', 5.3, 77, 1.4, 140),                               // its shaded side
  ),
  ...ps4N('stepStone', oRect('mass', 4, 145, 10, 6, 0, 1.5)),        // the concrete foot
  ...ps4N('casing', oRect('mass', 23, 14, 32, 24, 0, 1.5)),          // the flag's white plate
  oBar('line', 5, 6, 8, 6, 1.4), oBar('line', 5, 22, 8, 22, 1.4),   // its two brackets
  ...ps4N('stopRed', oRect('dark', 23, 5, 30, 4)),                  // its red band
  oRect('line', 23, 16, 18, 9, 0, 2),                               // the bus: its body,
  oRect('lit', 19, 14.5, 4, 3), oRect('lit', 24, 14.5, 4, 3), oRect('lit', 29, 14.5, 3, 3), // windows
  oEll('line', 18, 21, 4, 4), oEll('line', 28, 21, 4, 4),          // and its wheels
]);
export const stopPole = (x: number, y: number, w: number, h: number) => fit(STOP_POLE, x, y, w, h);

// ── THE NOTICE ───────────────────────────────────────────────────────────────
//
// REFERENCE (p4-stopclosed-1, -2): a closure notice is a sheet of BRIGHT YELLOW with a
// red band across its head, cable-tied round the pole. The word is drawn by the scene
// on its yellow face. Real units, 44 × 28.
const STOP_NOTICE: ObjPart[] = ps4In(44, 28, [
  ...ps4N('noticeYellow', oRect('mass', 22, 14, 44, 28, 0, 1)),     // the sheet
  ...ps4N('stopRed', oRect('dark', 22, 3.2, 42, 3.6)),              // its red band
  oRect('line', 22, 0.8, 7, 1.6, 0, 0.6),                           // the cable ties
  oRect('line', 22, 27.2, 7, 1.6, 0, 0.6),
]);
export const stopNotice = (x: number, y: number, w: number, h: number) => fit(STOP_NOTICE, x, y, w, h);

// ── THE CAFÉ ─────────────────────────────────────────────────────────────────
//
// REFERENCE (p4-cafe-1): a café in a terrace — a white-rendered front, a sash window
// above, a red fascia over a RED AWNING that shades the shop window, and a red-painted
// stall riser under the window. Its name is drawn by the scene on the fascia. Real
// units, 70 × 170; the terrace runs on past the stage's edge.
const CAFE_TERRACE: ObjPart[] = ps4In(70, 170, [
  ...ps4N('whitewash', oRect('mass', 35, 85, 70, 170)),              // the rendered front
  ...ps4N('houseGlass', oRect('dark', 30, 30, 26, 32)),              // the sash window upstairs
  oBar('lit', 30, 14, 30, 46, 1.4), oBar('lit', 17, 30, 43, 30, 1.6), // its glazing bars
  ...ps4N('awning',
    oRect('dark', 35, 63, 70, 13),                                  // the fascia
    oRect('mass', 35, 79, 70, 12),                                  // the awning
    ...[5, 15, 25, 35, 45, 55, 65].map((x) => oEll('mass', x, 85, 10, 6)), // its scalloped edge
    oRect('dark', 35, 159, 70, 22),                                 // the stall riser
  ),
  ...[10, 30, 50].map((x) => oRect('lit', x, 79, 6, 12)),           // the awning's stripes
  ...ps4N('shopGlass', oRect('dark', 32, 120, 52, 50)),              // the shop window
  oBar('lit', 32, 96, 32, 144, 1.4),                                // its mullion
  oBar('lit', 12, 136, 24, 104, 1.6),                               // light on the glass
  ...ps4N('whitewash', oRect('dark', 32, 147, 58, 3)),               // the sill
]);
export const cafeTerrace = (x: number, y: number, w: number, h: number) => fit(CAFE_TERRACE, x, y, w, h);

// ── THE TAKEAWAY CUP ─────────────────────────────────────────────────────────
//
// REFERENCE (p4-cup-1): a paper cup that WIDENS to its rim, a black lid with a raised
// sip dome, and a card sleeve round its middle where the hand holds it. Real units,
// 10 × 14, held round its body at `TAKEAWAY_GRIP` (AR2: a cup with no handle).
const TAKEAWAY_CUP: ObjPart[] = ps4In(10, 14, [
  ...ps4N('paper', ...trapezoid('mass', 5, 8.6, 8.6, 6.4, 10.4)),    // the cup
  ...ps4N('capBlack',
    oRect('mass', 5, 3, 10, 2.2, 0, 0.8),                           // the lid's rim
    oRect('mass', 5, 1.4, 7, 1.8, 0, 0.8),                          // and its dome
  ),
  ...ps4N('cardboard', ...trapezoid('dark', 5, 9, 7.9, 7, 4.6)),     // the sleeve
  oBar('lit', 2.9, 5.6, 3.3, 12.6, 0.7),                            // light down its side
]);
export const takeawayCup = (x: number, y: number, w: number, h: number) => fit(TAKEAWAY_CUP, x, y, w, h);
/** Where the cup is held: round its sleeve, in its own 10 × 14 units. */
export const TAKEAWAY_GRIP = { x: 5, y: 9, w: 10, h: 14 } as const;

// ── psych4: objects for this lesson go ABOVE this line ──

// ── growth4 objects BEGIN ──
// personal-growth-foundations-4, "How to Learn From a Mistake": A POTTERY STUDIO.
// References looked at (scratchpad/ref/g4*): an electric potter's wheel (a cream splash
// pan round a steel wheel head, the body on its stand), a potter throwing (wet grey
// clay, throwing rings round the wall, the head a wide flat disc), a galvanised bucket
// (a tapering drum, two raised ribs, a rolled rim, a wire bail on two ears), a pair of
// top-loading kilns (a steel drum in bands under a lid, a red control box on its side,
// a small-paned white window over them) and glazed stoneware (the glaze over the top,
// the bare clay foot under it). Every drawing is in real units, laid out at 1:1.

// ── POTTER'S WHEEL (its stand, body and splash pan) ─────────────────────────
//
// REFERENCE. An electric wheel is a cream plastic SPLASH PAN — a shallow tub with a
// rolled rim — round the steel wheel head, over a squat motor BODY. This one stands on
// steel legs, raised to a standing potter's hip. The pan's inside is grey with slip.
// The wheel head is its own drawing (`wheelHead`), so it sits ON the slip, not under it.
// Real units, 40 × 32: the rim at y 4.8, the ground at y 32.
const POT_WHEEL: ObjPart[] = g3In(40, 32, [
  ...g3('iron',
    oBar('mass', 11, 20.4, 6, 31.2, 1.6), oBar('mass', 29, 20.4, 34, 31.2, 1.6),
    oBar('face', 16, 20.4, 15, 31.2, 1.3), oBar('face', 24, 20.4, 25, 31.2, 1.3),
    oEll('mass', 6, 31.4, 3.4, 1.2), oEll('mass', 34, 31.4, 3.4, 1.2),
  ),
  ...g3('wheelCream',
    oRect('mass', 20, 16.6, 22, 8.4, 0, 1.6),                     // the motor body
    oRect('face', 27.4, 16.6, 7, 8, 0, 1.2),                      // its side, from the lamp
    ...trapezoid('mass', 20, 8.6, 37, 30, 7.6),                   // the splash pan's wall
    oEll('mass', 20, 12.2, 30, 3.2),                              // its rounded foot
    oEll('face', 22, 11.9, 25, 2.4),                              // the foot, out of the lamp
    oEll('mass', 20, 4.8, 38.4, 4.4),                             // the rolled rim
  ),
  ...g3('wetClay', oEll('dark', 20, 4.8, 33.4, 2.6)),             // the slip inside the pan
  oBar('lit', 4.6, 7, 7.4, 11, 0.8),                              // the lamp on the pan
  oBar('lit', 11, 15, 11, 18.6, 0.7),                             // and on the body
]);
export const potWheel = (x: number, y: number, w: number, h: number) => fit(POT_WHEEL, x, y, w, h);
/** The wheel head's seat on the pan, in the wheel's own 40 × 32 units. */
export const WHEEL_SEAT = { x: 20, y: 4.4, of: { w: 40, h: 32 } } as const;

// ── WHEEL HEAD ───────────────────────────────────────────────────────────────
//
// REFERENCE. The head is a flat steel DISC, seen nearly edge-on: a thin band with its
// top face showing as a sliver. Real units, 26 × 4; its top face at y 0.6.
const WHEEL_HEAD: ObjPart[] = g3In(26, 4, [
  ...g3('silver', oRect('mass', 13, 2.2, 26, 3.4, 0, 1), oRect('face', 13, 3.3, 25, 1.2, 0, 0.6)),
  oBar('lit', 2.4, 1.1, 10, 1.1, 0.5),
]);
export const wheelHead = (x: number, y: number, w: number, h: number) => fit(WHEEL_HEAD, x, y, w, h);

// ── THE POT ON THE WHEEL, IN TWO PIECES ──────────────────────────────────────
//
// REFERENCE. A thrown pot, wet, is a CYLINDER of grey clay with THROWING RINGS round
// its wall and a lip at the top; a pot that has taken too much water SLUMPS — its upper
// wall gives way and folds over the side. So it is drawn as two pieces: the lower wall
// (`potLow`, 13 × 11, base at its foot) and the upper wall with the lip (`potTop`,
// 14 × 10), which hinges at its lower corner on the side it falls to (POT_HINGE).
const POT_LOW: ObjPart[] = g3In(13, 11, [
  ...g3('wetClay', ...trapezoid('mass', 6.5, 5.5, 12.4, 13, 11)),
  ...g3('wetClay', oRect('face', 10.9, 5.6, 2.8, 10.6)),
  ...g3('wetClay', oBar('dark', 0.7, 3.4, 12.3, 3.4, 0.55), oBar('dark', 0.4, 7.6, 12.6, 7.6, 0.55)),
  oBar('lit', 2.4, 1.6, 2.2, 9.4, 0.7),                           // wet: the lamp in a streak
]);
export const potLow = (x: number, y: number, w: number, h: number) => fit(POT_LOW, x, y, w, h);
const POT_TOP: ObjPart[] = g3In(14, 10, [
  ...g3('wetClay',
    oRect('mass', 7, 6, 12.4, 8),                                 // the upper wall
    oEll('mass', 7, 1.7, 14, 3.2),                                // the lip
    oRect('face', 11.4, 6.2, 2.8, 7.6),
  ),
  ...g3('wetClay', oEll('dark', 7, 1.6, 10.4, 1.7)),              // the mouth
  ...g3('wetClay', oBar('dark', 1, 5.8, 13, 5.8, 0.55)),          // a throwing ring
  oBar('lit', 2.6, 3.6, 2.6, 8.8, 0.7),
]);
export const potTop = (x: number, y: number, w: number, h: number) => fit(POT_TOP, x, y, w, h);
/** Where the upper wall hinges onto the lower one: its lower right corner, in its 14 × 10. */
export const POT_HINGE = { x: 13.2, y: 10, of: { w: 14, h: 10 } } as const;

// ── LUMP AND BALL OF CLAY ────────────────────────────────────────────────────
//
// REFERENCE. Clay centred on a wheel is a smooth DOME, wider than tall; a wedged ball
// waiting to be thrown is round, a little flattened where it sits. Both wet grey.
const CLAY_LUMP: ObjPart[] = g3In(17, 11, [
  ...g3('wetClay', oEll('mass', 8.5, 6.4, 17, 10), oEll('face', 10.6, 8, 11, 5.4)),
  oEll('lit', 5, 3.8, 4.4, 1.6, -14),
]);
export const clayLump = (x: number, y: number, w: number, h: number) => fit(CLAY_LUMP, x, y, w, h);
const CLAY_BALL: ObjPart[] = g3In(10, 9, [
  ...g3('wetClay', oEll('mass', 5, 4.6, 10, 8.8), oEll('face', 6.2, 5.6, 7, 6.2)),
  oEll('lit', 3.4, 2.8, 2.6, 1.3, -14),
]);
export const clayBall = (x: number, y: number, w: number, h: number) => fit(CLAY_BALL, x, y, w, h);

// ── WATER BUCKET ─────────────────────────────────────────────────────────────
//
// REFERENCE. A galvanised bucket is a DRUM that tapers to its foot, two raised RIBS
// round it and a rolled RIM, carried by a wire BAIL hooked into two ears. Drawn about
// the top of the bail (BUCKET_GRIP), which is where a hand carries it. Real units,
// 16 × 23: the bail's crown at y 0.8, the rim at y 7.6, the foot at y 23.
const WATER_BUCKET: ObjPart[] = g3In(16, 23, [
  oBar('line', 1, 8.4, 2.2, 3.4, 0.7), oBar('line', 2.2, 3.4, 5.2, 0.9, 0.7),
  oBar('line', 5.2, 0.9, 10.8, 0.9, 0.7), oBar('line', 10.8, 0.9, 13.8, 3.4, 0.7),
  oBar('line', 13.8, 3.4, 15, 8.4, 0.7),                          // the wire bail
  ...g3('silver',
    ...trapezoid('mass', 8, 15.3, 16, 13, 15.4),                  // the drum
    oEll('mass', 8, 7.6, 16.8, 2.8),                              // the rolled rim
    oRect('face', 12.4, 15.6, 2.4, 14.2),
  ),
  ...g3('silver', oBar('dark', 0.8, 12, 15.2, 12, 0.7), oBar('dark', 1.6, 19.6, 14.4, 19.6, 0.7)), // the ribs
  ...g3('water', oEll('dark', 8, 7.8, 14, 1.7)),                  // the water in it
  oEll('line', 1, 8.6, 1.5, 1.5), oEll('line', 15, 8.6, 1.5, 1.5), // the ears
  oBar('lit', 3.4, 10, 3.9, 21, 0.8),
]);
export const waterBucket = (x: number, y: number, w: number, h: number) => fit(WATER_BUCKET, x, y, w, h);
/** Where a hand holds the bucket: the crown of its bail, in its own 16 × 23. */
export const BUCKET_GRIP = { x: 8, y: 0.9, of: { w: 16, h: 23 } } as const;

// ── TALL STOOL ───────────────────────────────────────────────────────────────
//
// REFERENCE. A wooden workshop stool: a thick square SEAT on four legs that SPLAY out
// to the floor, the back pair seen between the front ones, a RUNG across low down.
// Real units, 22 × 26: the seat's top at y 0.
const TALL_STOOL: ObjPart[] = g3In(22, 26, [
  ...g3('wood',
    oBar('face', 7.5, 3, 7, 25.6, 1.3), oBar('face', 14.5, 3, 15, 25.6, 1.3), // the back legs
    oBar('mass', 3.6, 3, 1.6, 25.6, 1.8), oBar('mass', 18.4, 3, 20.4, 25.6, 1.8),
    oBar('mass', 2.6, 16, 19.4, 16, 1.2),                         // the rung
    oRect('mass', 11, 1.6, 22, 3.2, 0, 0.8),                      // the seat
    oRect('face', 11, 2.8, 21.4, 0.9),
  ),
  oBar('lit', 2, 0.8, 9, 0.8, 0.5),
]);
export const tallStool = (x: number, y: number, w: number, h: number) => fit(TALL_STOOL, x, y, w, h);

// ── POT RACK ─────────────────────────────────────────────────────────────────
//
// REFERENCE. A studio's open rack: two upright POSTS and three deep BOARDS across them,
// dark with use, finished pots standing in a row on each. Real units, 70 × 96: the
// boards' tops at y 16, 42 and 68, the floor at y 96.
const POT_RACK: ObjPart[] = g3In(70, 96, [
  ...g3('wood',
    oRect('mass', 2, 48, 3.4, 96), oRect('mass', 68, 48, 3.4, 96),
    ...[16, 42, 68].flatMap((y) => [oRect('mass', 35, y + 1.6, 70, 3.2), oRect('face', 35, y + 2.8, 69, 0.9)]),
    oRect('mass', 35, 92.4, 70, 2.6),                            // the foot rail
  ),
  oBar('lit', 1, 2, 1, 94, 0.6),
]);
export const potRack = (x: number, y: number, w: number, h: number) => fit(POT_RACK, x, y, w, h);

// ── FINISHED POTS: a vase, a bowl, a jug and a lidded jar ────────────────────
//
// REFERENCE. Glazed stoneware: the GLAZE runs over the top of the pot and stops above
// a band of BARE CLAY at the foot, which is how a finished pot is told from a wet one.
// Each takes its glaze's colour; the foot is the pale fired body ('clay').
const glazedVaseParts = (glaze: NaturalKey): ObjPart[] => g3In(12, 18, [
  ...g3('clay', oRect('mass', 6, 16.6, 7.4, 2.8, 0, 0.6)),
  ...g3(glaze,
    oEll('mass', 6, 10.8, 12, 10.6),                              // the belly
    oRect('mass', 6, 4.4, 4.4, 5.6),                              // the neck
    oEll('mass', 6, 1.7, 6.6, 2.4),                               // the lip
    oEll('face', 7.8, 12, 7, 7.2),
  ),
  oEll('line', 6, 1.5, 3.6, 0.9),
  oEll('lit', 3.4, 8.6, 1.8, 3.2, 12),
]);
export const glazedVase = (x: number, y: number, w: number, h: number, glaze: NaturalKey = 'celadon') => fit(glazedVaseParts(glaze), x, y, w, h);
const glazedBowlParts = (glaze: NaturalKey): ObjPart[] => g3In(16, 8, [
  ...g3('clay', oRect('mass', 8, 7.3, 6.2, 1.4, 0, 0.4)),
  ...g3(glaze,
    ...trapezoid('mass', 8, 3.8, 16, 9.4, 4.2),
    oEll('mass', 8, 5.8, 9.4, 2.4),
    oEll('mass', 8, 1.7, 16.2, 2.6),                              // the rim
    oEll('face', 10, 4.6, 8, 3),
  ),
  ...g3(glaze, oEll('dark', 8, 1.7, 13.6, 1.5)),                  // looking into it
  oBar('lit', 3, 3.2, 5, 5, 0.6),
]);
export const glazedBowl = (x: number, y: number, w: number, h: number, glaze: NaturalKey = 'cobaltGlaze') => fit(glazedBowlParts(glaze), x, y, w, h);
const glazedJugParts = (glaze: NaturalKey): ObjPart[] => g3In(14, 16, [
  oBar('line', 10.4, 4.4, 13.2, 6, 1.1), oBar('line', 13.2, 6, 12.8, 11, 1.1), oBar('line', 12.8, 11, 10.2, 12.2, 1.1), // the handle
  ...g3('clay', oRect('mass', 6, 14.8, 8.4, 2.4, 0, 0.6)),
  ...g3(glaze,
    oEll('mass', 6, 9.4, 10.4, 10),                               // the body
    oRect('mass', 6, 4, 7.4, 4.6),                                // the neck
    oTri('mass', 1.6, 2.6, 3.2, 2.6, 'left'),                     // the spout
    oEll('mass', 6, 1.9, 8, 2.2),
    oEll('face', 7.8, 10.4, 6, 7),
  ),
  oEll('line', 6, 1.8, 5.4, 0.8),
  oEll('lit', 3.6, 8, 1.6, 3, 10),
]);
export const glazedJug = (x: number, y: number, w: number, h: number, glaze: NaturalKey = 'oatmeal') => fit(glazedJugParts(glaze), x, y, w, h);
const glazedJarParts = (glaze: NaturalKey): ObjPart[] => g3In(11, 15, [
  ...g3('clay', oRect('mass', 5.5, 13.8, 9.4, 2.4, 0, 0.6)),
  ...g3(glaze,
    oRect('mass', 5.5, 8.2, 11, 9.6, 0, 2.2),                     // the body
    oRect('mass', 5.5, 2.6, 9.4, 1.8, 0, 0.6),                    // the lid
    oEll('mass', 5.5, 1, 2.6, 1.6),                               // its knob
    oRect('face', 8.8, 8.4, 3.2, 9, 0, 1),
  ),
  oBar('line', 1, 3.6, 10, 3.6, 0.4),                             // the lid's seat
  oBar('lit', 2.2, 5.4, 2.2, 11, 0.7),
]);
export const glazedJar = (x: number, y: number, w: number, h: number, glaze: NaturalKey = 'tenmoku') => fit(glazedJarParts(glaze), x, y, w, h);

// ── SIDE TABLE ───────────────────────────────────────────────────────────────
//
// REFERENCE. A potter's side bench: a heavy wooden frame with a CANVAS top that clay
// does not stick to, square legs, a stretcher low down. Real units, 52 × 26: the
// canvas at y 0.
const SIDE_TABLE: ObjPart[] = g3In(52, 26, [
  ...g3('wood',
    oBar('face', 8, 6, 8, 25.6, 2), oBar('face', 44, 6, 44, 25.6, 2), // the back legs
    oBar('mass', 3, 6, 3, 25.6, 2.6), oBar('mass', 49, 6, 49, 25.6, 2.6),
    oBar('mass', 3, 20, 49, 20, 1.4),                             // the stretcher
    oRect('mass', 26, 5.6, 51, 3.4),                              // the apron
  ),
  ...g3('linen', oRect('mass', 26, 2, 52, 4, 0, 0.6), oRect('face', 26, 3.6, 52, 0.9)),
  oBar('lit', 2, 0.8, 18, 0.8, 0.5),
]);
export const sideTable = (x: number, y: number, w: number, h: number) => fit(SIDE_TABLE, x, y, w, h);

// ── WARE BOARD ───────────────────────────────────────────────────────────────
//
// REFERENCE. A ware board is a long wooden PLANK on two iron BRACKETS on the studio
// wall, where wedged balls of clay wait to be thrown. Real units, 56 × 9: the plank's
// top at y 0.
const WARE_BOARD: ObjPart[] = g3In(56, 9, [
  ...g3('iron',
    oBar('mass', 7, 2.6, 7, 8.6, 1.1), oBar('mass', 7, 8.6, 12.4, 2.8, 0.9),
    oBar('mass', 49, 2.6, 49, 8.6, 1.1), oBar('mass', 49, 8.6, 43.6, 2.8, 0.9),
  ),
  ...g3('wood', oRect('mass', 28, 1.3, 56, 2.6), oRect('face', 28, 2.3, 56, 0.7)),
]);
export const wareBoard = (x: number, y: number, w: number, h: number) => fit(WARE_BOARD, x, y, w, h);

// ── TOP-LOADING KILN ─────────────────────────────────────────────────────────
//
// REFERENCE. An electric kiln is a steel DRUM of flat panels held in steel BANDS, a
// heavy LID on top with a handle, a peephole in its side, a red CONTROL BOX bolted
// to it, and a low iron STAND under it. Real units, 54 × 42: the lid at y 2.6, the
// floor at y 42.
const KILN: ObjPart[] = g3In(54, 42, [
  ...g3('iron',
    oBar('mass', 8, 37, 6, 41.6, 1.6), oBar('mass', 42, 37, 44, 41.6, 1.6),
    oRect('mass', 25, 37.6, 44, 2.4),                             // the stand
  ),
  ...g3('silver',
    oRect('mass', 25, 21.4, 46, 30.4, 0, 1.4),                    // the drum
    oRect('face', 44.4, 21.4, 7.2, 29.6, 0, 1),
    oRect('mass', 25, 4.4, 49, 4.2, 0, 1.2),                      // the lid
  ),
  ...g3('silver', oRect('dark', 25, 6, 48, 1)),                  // the lid's lower edge
  ...g3('silver', oBar('dark', 9.5, 7, 9.5, 36.4, 0.5), oBar('dark', 25, 7, 25, 36.4, 0.5), oBar('dark', 40.5, 7, 40.5, 36.4, 0.5)),
  ...g3('iron', oBar('mass', 2.4, 13, 47.6, 13, 1.2), oBar('mass', 2.4, 29, 47.6, 29, 1.2)), // the bands
  oBar('line', 20, 1.2, 30, 1.2, 1.2), oBar('line', 20.6, 1.2, 20.6, 2.6, 0.8), oBar('line', 29.4, 1.2, 29.4, 2.6, 0.8), // the handle
  oEll('line', 16, 21, 2.2, 2.2),                                  // the peephole
  ...g3('signRed', oRect('mass', 50.2, 20, 7.2, 12.4, 0, 0.8), oRect('face', 52.6, 20, 2.4, 12)),
  oEll('lit', 49.6, 17, 3, 3), oBar('line', 47.8, 23.6, 52, 23.6, 0.6),
  oBar('lit', 4, 9, 4, 34, 0.8),
]);
export const topKiln = (x: number, y: number, w: number, h: number) => fit(KILN, x, y, w, h);

// ── STUDIO WINDOW ────────────────────────────────────────────────────────────
//
// REFERENCE. The window over the kilns: a white-painted FRAME of small PANES, two
// across and three down, on a deep SILL. Real units, 56 × 48.
const STUDIO_WINDOW: ObjPart[] = g3In(56, 48, [
  ...g3('plinthWhite', oRect('mass', 28, 23, 52, 46, 0, 0.8), oRect('mass', 28, 46.4, 58, 3.2, 0, 0.6), oRect('face', 28, 47.6, 58, 0.9)),
  ...g3('skyPane', ...[0, 1].flatMap((c) => [0, 1, 2].map((r) => oRect('dark', 15.5 + c * 25, 9.4 + r * 13.4, 21, 11.4, 0, 0.4)))),
  oBar('lit', 7, 5, 13, 5, 0.6), oBar('lit', 32, 5, 38, 5, 0.6),
]);
export const studioWindow = (x: number, y: number, w: number, h: number) => fit(STUDIO_WINDOW, x, y, w, h);

// ── growth4: objects for this lesson go ABOVE this line ──

// ─────────────────────────────────────────────────────────────────────────────
// business-foundations-4 — A FOOD TRUCK AT CLOSING TIME. A step van with its serving
// hatch propped open over a fold-down steel counter, a menu board above the hatch, a
// small chalk board hung on its side, a blue-grey cash box, a spike of receipts and a
// pocket calculator; across the road, a bakery with bread in its lit window. Drawn
// against Commons photographs (scratchpad/ref/biz4-*): a St Louis taco truck in side
// view (the hatch over a shelf on brackets, the cab with its raked windscreen, a
// painted stripe along the body), an Austin truck's hatch with its flap propped up on
// a strut and a chalk board beside it, a café's receipt spike (a steel rod on a round
// weighted foot, slips pushed down over the point), and a Cornish bakery's shop front
// (a pale-blue fascia over a big window and a glazed door).
// ─────────────────────────────────────────────────────────────────────────────

/** Parts in a named real colour (AP11). */
const b4N = (k: NaturalKey, ...ps: ObjPart[]): ObjPart[] => ps.map((p) => ({ ...p, nat: k }));
/** Author in real units (an ax × ay box) and hand it to `fit` as the 100-square. */
function b4In(ax: number, ay: number, parts: readonly ObjPart[]): ObjPart[] {
  const sx = 100 / ax;
  const sy = 100 / ay;
  const s = 100 / Math.min(ax, ay);
  return parts.map((p) => {
    if (p.k === 'bar') return { ...p, x1: p.x1 * sx, y1: p.y1 * sy, x2: p.x2 * sx, y2: p.y2 * sy, t: p.t * s };
    return { ...p, x: p.x * sx, y: p.y * sy, w: p.w * sx, h: p.h * sy, ...(p.k === 'rect' ? { rad: p.rad * s } : null) } as ObjPart;
  });
}

// ── THE FOOD TRUCK ───────────────────────────────────────────────────────────
//
// REFERENCE (the St Louis taco truck). A step van in side view: a tall BOX body with
// rounded top corners, a short CAB at its front with a raked windscreen over a stubby
// bonnet, two wheels in arches, a painted STRIPE along the body, and in the box's side
// the serving HATCH — a wide opening onto the kitchen, its FLAP propped up and out over
// it on two struts (the Austin truck), a shelf under it. Drawn facing LEFT. Real units
// 300 × 166: the box 56–300 × 6–158, the cab 12–60, the hatch 138–286 × 70–132, the flap
// 133–291 × 58–70, the wheels on y 152. The shelf is its own object (`truckCounter`), so
// the people inside can be drawn between the two.
const FOOD_TRUCK: ObjPart[] = b4In(300, 166, [
  ...b4N('truckCream',
    oRect('mass', 178, 82, 244, 152, 0, 8),                  // the box body
    oRect('mass', 36, 99, 48, 118, 0, 6),                    // the cab
    oBar('mass', 17, 44, 8, 106, 9),                         // its raked front, roof to bonnet
    oRect('mass', 10, 133, 16, 50, 0, 4),                    // the bonnet
  ),
  ...b4N('truckRed',
    oRect('mass', 178, 144, 244, 8),                         // the painted stripe along the body
    oRect('mass', 34, 144, 44, 8),                           // and along the cab
  ),
  ...b4N('silver', oRect('mass', 252, 3.5, 32, 7, 0, 2)),     // the extractor on the roof
  ...b4N('tyre',
    oEll('face', 38, 150, 32, 30), oEll('face', 268, 150, 32, 30),   // the wheel arches
    oEll('mass', 38, 152, 24, 24), oEll('mass', 268, 152, 24, 24),   // the tyres
  ),
  ...b4N('silver',
    oEll('dark', 38, 152, 11, 11), oEll('dark', 268, 152, 11, 11),   // their hubs
    oRect('face', 9, 154, 18, 6, 0, 2),                              // the front bumper
  ),
  ...b4N('glass',
    oBar('dark', 19, 50, 12, 100, 4),                        // the windscreen
    oRect('dark', 38, 66, 26, 30, 0, 2),                     // the cab's side window
  ),
  ...b4N('steelInside', oRect('dark', 212, 101, 148, 62, 0, 1)),  // the kitchen, seen through the hatch
  ...b4N('silver', oRect('dark', 212, 71.6, 148, 3.2)),      // its extractor hood
  ...b4N('truckRed', oRect('face', 212, 64, 158, 12, 0, 1.5)),     // the flap, propped up: its underside
  oBar('lit', 135, 58.7, 289, 58.7, 1.2),                    // the flap's front edge, catching the light
  oBar('line', 133, 70, 291, 70, 0.8),                       // its hinge along the top of the hatch
  oBar('line', 141, 72, 146, 60, 1.1),                       // the struts holding it up
  oBar('line', 283, 72, 278, 60, 1.1),
  oBar('line', 138, 70, 138, 132, 0.7), oBar('line', 286, 70, 286, 132, 0.7),   // the hatch's jambs
  oBar('lit', 64, 9.5, 292, 9.5, 1.2),                       // the light along the roof
  oBar('line', 58, 42, 58, 136, 0.9),                        // the cab door's seam
  oRect('line', 50, 100, 5, 1.6, 0, 0.6),                    // and its handle
  oBar('line', 291, 14, 291, 136, 0.8),                      // the back door's seam
  ...b4N('truckRed', oRect('dark', 297, 120, 3, 10, 0, 1)),  // the tail light
  oRect('lit', 4, 122, 4, 9, 0, 1.6),                        // the headlamp
]);
export const foodTruck = (x: number, y: number, w: number, h: number) => fit(FOOD_TRUCK, x, y, w, h);

// ── THE HATCH'S COUNTER ──────────────────────────────────────────────────────
//
// REFERENCE (the same truck). Under the hatch a narrow stainless SHELF folds down on
// two angled BRACKETS: the counter the food is handed over. Real units 160 × 20.
const TRUCK_COUNTER: ObjPart[] = b4In(160, 20, [
  ...b4N('silver',
    oRect('mass', 80, 2.6, 160, 5.2, 0, 1),                  // the shelf
    oBar('mass', 12, 5, 20, 17, 2),                          // its brackets, under it
    oBar('mass', 148, 5, 140, 17, 2),
  ),
  oBar('lit', 2, 1.1, 158, 1.1, 0.9),                        // its lit front edge
]);
export const truckCounter = (x: number, y: number, w: number, h: number) => fit(TRUCK_COUNTER, x, y, w, h);

// ── THE MENU BOARD ───────────────────────────────────────────────────────────
//
// REFERENCE (the Austin truck). A food truck's menu is a SLATE in a wooden frame
// screwed to the van above or beside the hatch, chalked with a heading and the dishes
// in columns, each with its price ranged right. Real units 108 × 32.
const TRUCK_MENU: ObjPart[] = b4In(108, 32, [
  ...b4N('wood', oRect('mass', 54, 16, 108, 32, 0, 2)),      // the frame
  ...b4N('slate', oRect('dark', 54, 16, 100, 25, 0, 1)),     // the slate
  oBar('lit', 38, 8.2, 70, 8.2, 2.4),                        // the heading, chalked large
  ...[14.4, 19.8, 25.2].flatMap((y) => [
    oBar('lit', 8, y, 38, y, 1.1), oBar('lit', 43, y, 49, y, 1.1),   // a dish and its price
    oBar('lit', 59, y, 89, y, 1.1), oBar('lit', 94, y, 100, y, 1.1),
  ]),
  oEll('line', 2.4, 2.4, 1.6, 1.6), oEll('line', 105.6, 2.4, 1.6, 1.6),   // its screws
]);
export const truckMenu = (x: number, y: number, w: number, h: number) => fit(TRUCK_MENU, x, y, w, h);

// ── THE CASH BOX ─────────────────────────────────────────────────────────────
//
// REFERENCE. A petty-cash box is a small box of ENAMELLED STEEL with a LOCK in the
// middle of its front and a lid hinged along the back, which lifts to stand up behind
// it and show its inside face. Three objects so the notes can sit between the back and
// the front and the lid can swing: the back rim and its dark inside (22 × 4), the front
// (22 × 14) and the lid (22 × 16).
const CASH_BOX_BACK: ObjPart[] = b4In(22, 4, [
  ...b4N('cashSteel', oRect('mass', 11, 2, 22, 4, 0, 1)),    // the back rim
  ...b4N('tyre', oRect('dark', 11, 2.4, 19, 2.6, 0, 0.6)),   // and the dark inside
  oBar('lit', 2, 0.6, 20, 0.6, 0.5),                         // its lit top edge
]);
export const cashBoxBack = (x: number, y: number, w: number, h: number) => fit(CASH_BOX_BACK, x, y, w, h);
const CASH_BOX_FRONT: ObjPart[] = b4In(22, 14, [
  ...b4N('cashSteel',
    oRect('mass', 11, 7, 22, 14, 0, 1.5),                    // the front
    oRect('face', 20.4, 7, 3.2, 14, 0, 1),                   // its end, turned from the lamp
  ),
  oBar('lit', 1.6, 1, 18.5, 1, 0.8),                         // the rim's lit edge
  oRect('lit', 11, 6, 5, 5.6, 0, 1),                         // the lock's escutcheon
  oEll('line', 11, 5.4, 1.5, 1.6), oBar('line', 11, 6, 11, 7.8, 0.8),   // and its keyhole
]);
export const cashBoxFront = (x: number, y: number, w: number, h: number) => fit(CASH_BOX_FRONT, x, y, w, h);
const CASH_BOX_LID: ObjPart[] = b4In(22, 16, [
  ...b4N('cashSteel', oRect('mass', 11, 8, 22, 16, 0, 1.5)), // the lid
  ...b4N('cashSteel', oRect('dark', 11, 8.6, 17, 11.5, 0, 1)),   // its inside face, in shade
  oBar('line', 7, 1.6, 15, 1.6, 1),                          // the handle folded flat along its edge
]);
export const cashBoxLid = (x: number, y: number, w: number, h: number) => fit(CASH_BOX_LID, x, y, w, h);

// ── A BANKNOTE ───────────────────────────────────────────────────────────────
//
// REFERENCE (the Bank of England's notes, as econ3 drew them): a note in its own
// colour with a pale FIELD, a portrait in an oval and the value at one end. Stood on
// end, so three of them fan in a hand. Real units 8 × 15.
function b4NoteParts(k: NaturalKey): ObjPart[] {
  return b4In(8, 15, [
    ...b4N(k, oRect('mass', 4, 7.5, 8, 15, 0, 0.8)),         // the note
    oRect('lit', 4, 7.5, 6, 12.6, 0, 0.5),                   // its field
    ...b4N(k, oEll('dark', 4, 10, 4.4, 5.2)),                // the portrait's oval
    ...b4N(k, oRect('dark', 4, 3.4, 4.4, 2, 0, 0.4)),        // and the value
  ]);
}
export const b4Note = (x: number, y: number, w: number, h: number, k: NaturalKey = 'note20') => fit(b4NoteParts(k), x, y, w, h);

// ── A RECEIPT ────────────────────────────────────────────────────────────────
//
// REFERENCE (the café's spike). A till receipt is a narrow slip of white paper with
// the shop's name printed across its head, the items and their prices in two columns,
// a rule, the TOTAL in heavier print, and a foot TORN off the roll in a zig-zag. The
// head is printed in the shop's own colour: the baker's, the petrol station's, the
// council's. Real units 10 × 14.
function receiptParts(head: NaturalKey): ObjPart[] {
  return b4In(10, 14, [
    ...b4N('paper',
      oRect('mass', 5, 6.4, 10, 12.8, 0, 0.5),               // the slip
      ...[1.25, 3.75, 6.25, 8.75].map((x) => oTri('mass', x, 13.3, 2.5, 1.4, 'down')),   // torn off the roll
    ),
    ...b4N(head, oRect('dark', 5, 2, 7.6, 2, 0, 0.4)),       // the shop's name, in its colour
    oBar('line', 1.6, 5, 5.8, 5, 0.4), oBar('line', 7, 5, 8.4, 5, 0.4),     // the items, priced
    oBar('line', 1.6, 6.8, 5, 6.8, 0.4), oBar('line', 7, 6.8, 8.4, 6.8, 0.4),
    oBar('line', 1.6, 8.8, 8.4, 8.8, 0.25),                  // a rule
    oBar('line', 1.6, 10.6, 4.4, 10.6, 0.8), oBar('line', 6.2, 10.6, 8.4, 10.6, 0.8),   // and the total
  ]);
}
export const receiptSlip = (x: number, y: number, w: number, h: number, head: NaturalKey = 'crust') =>
  fit(receiptParts(head), x, y, w, h);

// ── THE RECEIPT SPIKE ────────────────────────────────────────────────────────
//
// REFERENCE (the café's spike). A bill spike is one steel ROD, pointed, standing up
// out of a round weighted FOOT; slips are pushed down over the point and pile at its
// base. Real units 12 × 30.
const RECEIPT_SPIKE: ObjPart[] = b4In(12, 30, [
  ...b4N('silver',
    oBar('mass', 6, 3, 6, 27, 1.3),                          // the rod
    oTri('mass', 6, 1.6, 1.3, 2.8, 'up'),                    // its point
  ),
  ...b4N('iron', oEll('mass', 6, 27.6, 12, 4.4)),            // its weighted foot
  oBar('lit', 3, 26.8, 7, 26.8, 0.6),
]);
export const receiptSpike = (x: number, y: number, w: number, h: number) => fit(RECEIPT_SPIKE, x, y, w, h);

// ── A POCKET CALCULATOR ──────────────────────────────────────────────────────
//
// REFERENCE. A pocket calculator is a dark plastic slab, its grey-green LCD across the
// top and a grid of keys under it — four rows of three. Real units 9 × 13.
const POCKET_CALC: ObjPart[] = b4In(9, 13, [
  ...b4N('calcBody', oRect('mass', 4.5, 6.5, 9, 13, 0, 1.2)),   // the case
  ...b4N('calcLcd', oRect('dark', 4.5, 2.9, 7, 2.9, 0, 0.4)),   // the display
  ...[5.8, 7.6, 9.4, 11.2].flatMap((y) => [2.2, 4.5, 6.8].map((x) => oRect('lit', x, y, 1.5, 1.1, 0, 0.3))),   // the keys
]);
export const pocketCalc = (x: number, y: number, w: number, h: number) => fit(POCKET_CALC, x, y, w, h);

// ── THE VAN'S LITTLE BOARD ───────────────────────────────────────────────────
//
// REFERENCE (the Austin truck's board beside its hatch). A small slate in a wooden
// frame hung on the van's side from one nail on a cord, with a ledge under it for the
// chalk. Its face is the scene's to write on. Real units 44 × 73: the cord to y 10,
// the frame 10–70, the ledge 70–73.
const VAN_BOARD: ObjPart[] = b4In(44, 73, [
  oBar('line', 22, 1.2, 3, 10.5, 0.8), oBar('line', 22, 1.2, 41, 10.5, 0.8),   // the cord …
  oEll('line', 22, 1.2, 2.4, 2.4),                           // … from its nail
  ...b4N('wood',
    oRect('mass', 22, 40, 44, 60, 0, 1.5),                   // the frame
    oRect('mass', 22, 71.5, 42, 3, 0, 1),                    // the chalk ledge under it
  ),
  ...b4N('slate', oRect('dark', 22, 40, 38, 54, 0, 0.8)),    // the slate
]);
export const vanBoard = (x: number, y: number, w: number, h: number) => fit(VAN_BOARD, x, y, w, h);

// ── THE BAKERY ACROSS THE ROAD ───────────────────────────────────────────────
//
// REFERENCE (the Cornish bakery). An old stone building with a sash window upstairs,
// and at street level a shop front painted pale blue: a FASCIA board across the top
// for the name, a big window with bread on its shelves, a glazed door to one side.
// Seen across the road, so drawn smaller than the truck. Real units 90 × 148: the
// fascia 53–67, the shop front 69–148, the window 5–55 × 79–129.
const BAKERY_FRONT: ObjPart[] = b4In(90, 148, [
  ...b4N('bakeryWall',
    oRect('mass', 45, 74, 90, 148, 0, 1),                    // the stone front
    oRect('face', 45, 2, 92, 4, 0, 1),                       // its cornice
    oRect('face', 45, 146.5, 90, 3),                         // and its plinth
  ),
  ...b4N('sashWhite',
    oRect('mass', 45, 25, 36, 28, 0, 1),                     // the sash window upstairs
    oRect('mass', 45, 41, 42, 3, 0, 0.6),                    // and its sill
  ),
  ...b4N('houseGlass', oRect('dark', 45, 25, 30, 22, 0, 0.5)),
  oBar('line', 45, 14, 45, 36, 0.8), oBar('line', 30, 25, 60, 25, 0.8),   // its glazing bars
  ...b4N('bakeryBlue',
    oRect('mass', 45, 60, 90, 14, 0, 1),                     // the fascia
    oRect('mass', 45, 108.5, 90, 79, 0, 1),                  // the shop front
  ),
  oBar('lit', 1, 53.6, 89, 53.6, 0.8),                       // the fascia's lit top edge
  oBar('line', 1, 67.6, 89, 67.6, 0.8),                      // and its shadow under
  ...b4N('truckGlow', oRect('dark', 30, 104, 50, 50, 0, 0.6)),     // the window, lit inside
  oBar('line', 30, 79, 30, 129, 0.9),                        // its mullion
  oBar('line', 6, 100, 54, 100, 0.7), oBar('line', 6, 118, 54, 118, 0.7),   // the shelves in it
  ...b4N('crust', ...[12, 22, 38, 48].flatMap((x) => [oEll('dark', x, 96.6, 9, 5), oEll('dark', x, 114.6, 9, 5)])),   // and the loaves
  ...b4N('doorPaint', oRect('dark', 74, 108.5, 18, 77, 0, 0.6)),   // the door
  ...b4N('truckGlow', oRect('dark', 74, 92, 10, 24, 0, 0.5)),      // its glass, lit
  oEll('line', 68.5, 112, 1.6, 1.6),                         // and its handle
]);
export const bakeryFront = (x: number, y: number, w: number, h: number) => fit(BAKERY_FRONT, x, y, w, h);

// ── THE ROAD ─────────────────────────────────────────────────────────────────
//
// REFERENCE (both trucks, parked at the kerb). Grey asphalt with a broken white line
// down its middle, and the far pavement's kerb beyond it. Real units 420 × 34, so its
// ends run off the stage.
const ROADWAY: ObjPart[] = b4In(420, 34, [
  ...b4N('asphalt', oRect('mass', 210, 19, 420, 30)),        // the road
  ...b4N('flagstone', oRect('mass', 210, 2, 420, 4)),        // the far kerb
  ...[324, 358, 392].map((x) => oBar('lit', x, 18, x + 16, 18, 1.2)),   // the broken white line
]);
export const roadway = (x: number, y: number, w: number, h: number) => fit(ROADWAY, x, y, w, h);

// ── biz4: objects for this lesson go ABOVE this line ──

// ─────────────────────────────────────────────────────────────────────────────
// economics-foundations-4 — TWO BACK GARDENS OVER A LOW PICKET FENCE. Her raised bed
// of staked tomato plants, her one brown hen; over the fence his hen house on its legs
// with its ramp and nest box, his hens; a box of eggs, a wicker basket of tomatoes, and
// a slate hung on a fence post. Drawn against pictures fetched with
// `node scripts/get-reference.mjs` (scratchpad/ref/econ4-*): a brown hen and a Brown
// Leghorn hen, tomatoes ripening on a staked vine, a garden picket fence, an open egg
// box of brown eggs, and two chicken arks. Each is authored in REAL STAGE UNITS.
// ─────────────────────────────────────────────────────────────────────────────

/** Parts in a named real colour (AP11). */
const e4N = (k: NaturalKey, ...ps: ObjPart[]): ObjPart[] => ps.map((p) => ({ ...p, nat: k }));
/** Author in real units (an ax × ay box) and hand it to `fit` as the 100-square. */
function e4In(ax: number, ay: number, parts: readonly ObjPart[]): ObjPart[] {
  const sx = 100 / ax;
  const sy = 100 / ay;
  const s = 100 / Math.min(ax, ay);
  return parts.map((p) => {
    if (p.k === 'bar') return { ...p, x1: p.x1 * sx, y1: p.y1 * sy, x2: p.x2 * sx, y2: p.y2 * sy, t: p.t * s };
    return { ...p, x: p.x * sx, y: p.y * sy, w: p.w * sx, h: p.h * sy, ...(p.k === 'rect' ? { rad: p.rad * s } : null) } as ObjPart;
  });
}

// ── THE HEN ──────────────────────────────────────────────────────────────────
//
// REFERENCE (Commons: "Brown hen", "Brown Leghorn hen, Ohio"). A hen side-on is an EGG
// on its side — full in the BREAST, the back sloping UP to a short TAIL cocked high
// behind — on an upright NECK, a small head with a serrated red COMB along its crown, a
// red WATTLE hanging under a short yellow BEAK, and yellow LEGS set under the middle of
// the body. The folded wing is a darker oval on the flank. Real units 26 × 22, facing
// right, the feet at `HEN_FOOT`; `HEN_BREAST` is where a hand goes under her to lift her.
export const HEN_FOOT = { x: 13, y: 22, w: 26, h: 22 } as const;
export const HEN_BREAST = { x: 18, y: 15 } as const;
/** The hen's legs and toes alone, so a scene can tip her body about her hip (`HEN_HIP`) to peck. */
const henLegParts = (): ObjPart[] => e4In(26, 22, e4N('henLeg',
  oBar('mass', 11.6, 16.6, 11.2, 21.3, 1.15), oBar('mass', 14.6, 16.6, 15.4, 21.3, 1.15),
  oBar('mass', 9.6, 21.4, 12.8, 21.4, 0.85), oBar('mass', 13.9, 21.4, 17.4, 21.4, 0.85),
));
export const HEN_HIP = { x: 13, y: 16 } as const;
const henParts = (col: NaturalKey, legs = true): ObjPart[] => e4In(26, 22, [
  ...e4N(col,
    oTri('mass', 4.4, 7.4, 5.6, 10, 'up'),                                    // the tail, cocked up
    oTri('mass', 7.2, 7, 6, 9.4, 'up'),
    oEll('mass', 12.4, 13.2, 18.5, 10.6),                                     // the body
    oEll('mass', 8, 11, 10, 7.4),                                             // the back, rising to the tail
    oEll('mass', 17.8, 12.8, 9.6, 9.6),                                       // the full breast
    oBar('mass', 18.4, 11.2, 20.8, 5.8, 5.4),                                 // the neck
    oEll('mass', 21.2, 4.8, 6, 5.2),                                          // the head
    oEll('face', 11.8, 16.4, 12.5, 3.4),                                      // the underside, in shade
  ),
  ...(legs ? e4N('henLeg',
    oBar('mass', 11.6, 17.4, 11.2, 21.3, 1.15), oBar('mass', 14.6, 17.4, 15.4, 21.3, 1.15), // the legs
    oBar('mass', 9.6, 21.4, 12.8, 21.4, 0.85), oBar('mass', 13.9, 21.4, 17.4, 21.4, 0.85),  // the toes
  ) : []),
  ...e4N('henLeg', oTri('mass', 24.4, 5.1, 2.8, 1.9, 'right')),               // the beak
  ...e4N('henComb',
    oEll('mass', 19.5, 2.2, 2.1, 2.4), oEll('mass', 21.2, 1.4, 2.3, 2.7), oEll('mass', 22.8, 2.1, 2, 2.3), // the comb
    oEll('mass', 23.5, 7.8, 1.9, 2.9),                                        // the wattle
  ),
  ...e4N(col, oEll('dark', 11, 12.2, 10.5, 5.4)),                            // the folded wing
  ...e4N(col, oBar('dark', 6.8, 11.2, 13.6, 14.2, 0.6), oBar('dark', 4.6, 4.6, 6.6, 11, 0.5)), // primaries, a tail feather
  ...e4N('henComb', oEll('mass', 21.8, 5.6, 2.6, 2.4)),                    // the bare red face
  oEll('line', 22.4, 4.5, 1, 1),                                            // the eye
  oBar('lit', 12.6, 8.1, 18.2, 8.8, 0.6),                                   // the lamp along her back
]);
export const henBird = (x: number, y: number, w: number, h: number, col: NaturalKey = 'henRusset', part: 'all' | 'body' | 'legs' = 'all') =>
  fit(part === 'legs' ? henLegParts() : henParts(col, part === 'all'), x, y, w, h);

/** A hen's head and neck looking out of a window, facing left. Real 9 × 10, the neck's foot at (6, 10). */
const henPeekParts = (col: NaturalKey): ObjPart[] => e4In(9, 10, [
  ...e4N(col, oEll('mass', 5.4, 7.4, 4.4, 6), oEll('mass', 4.4, 4.2, 5.4, 4.8), oEll('mass', 6.2, 9, 5.6, 2)),
  ...e4N('henLeg', oTri('mass', 1, 4.4, 2.6, 1.8, 'left')),
  ...e4N('henComb', oEll('mass', 5.6, 1.5, 1.9, 2.2), oEll('mass', 4, 1, 2.1, 2.4), oEll('mass', 2.6, 1.7, 1.8, 2), oEll('mass', 2.2, 6.8, 1.7, 2.6)),
  ...e4N('henComb', oEll('mass', 3.6, 5, 2.4, 2.2)),
  oEll('line', 3.2, 3.8, 0.9, 0.9),
]);
export const henPeek = (x: number, y: number, w: number, h: number, col: NaturalKey = 'henBlack') => fit(henPeekParts(col), x, y, w, h);

// ── THE TOMATO PLANT ─────────────────────────────────────────────────────────
//
// REFERENCE (Commons: "Several green unripe and red ripe tomatoes growing on the vine").
// A staked tomato is a MAIN STEM climbing a CANE it is tied to, SIDE BRANCHES reaching
// out and drooping at their ends under COMPOUND LEAVES — ragged clusters of serrated
// leaflets, not one round leaf — and TRUSSES of fruit hanging off short stalks, ripe red
// beside hard green. Real units 44 × 82, the soil at y 82, the cane at x 22. Variant
// `pick` leaves out the two ripe tomatoes on its right (`TOMATO_PICK`), which a scene
// draws as things a hand takes off it.
export const TOMATO_PICK = [{ x: 34, y: 44 }, { x: 36.5, y: 57 }] as const;
/** A compound leaf: a tip leaflet and pairs of narrow pointed leaflets fanning off it. */
const leafCluster = (x: number, y: number, s = 1): ObjPart[] => [
  oEll('mass', x, y, 9 * s, 3.4 * s, -12),
  oEll('mass', x - 4.2 * s, y + 2 * s, 6.4 * s, 2.7 * s, 38),
  oEll('mass', x + 4 * s, y + 1.6 * s, 6.4 * s, 2.7 * s, -48),
  oEll('mass', x - 2.8 * s, y - 2.6 * s, 5.6 * s, 2.5 * s, -42),
  oEll('mass', x + 3 * s, y - 2.6 * s, 5.6 * s, 2.5 * s, 34),
  oEll('mass', x + 5.6 * s, y - 0.6 * s, 4 * s, 2.2 * s, 6),
  oEll('mass', x - 5.6 * s, y - 0.2 * s, 4 * s, 2.2 * s, -8),
];
/** The same drawing seen from the other side, so two plants in a bed are not twins. */
const e4Mirror = (parts: readonly ObjPart[]): ObjPart[] => parts.map((p) => {
  if (p.k === 'bar') return { ...p, x1: 100 - p.x1, x2: 100 - p.x2 };
  if (p.k === 'tri') return { ...p, x: 100 - p.x, rot: -p.rot, dir: p.dir === 'left' ? 'right' : p.dir === 'right' ? 'left' : p.dir };
  return { ...p, x: 100 - p.x, rot: -p.rot } as ObjPart;
});
const fruit = (x: number, y: number, ripe: boolean): ObjPart[] => [
  ...e4N(ripe ? 'tomato' : 'appleGreen', oEll('mass', x, y, 5.6, 5)),
  ...e4N('leaf', oTri('mass', x, y - 2.6, 3.4, 1.6, 'down')),
];
const tomatoPlantParts = (pick: boolean): ObjPart[] => e4In(44, 82, [
  ...e4N('cane', oBar('mass', 22, 1.5, 22, 82, 1.7)),
  ...e4N('leaf',
    oBar('mass', 23.6, 82, 22.6, 62, 1.7), oBar('mass', 22.6, 62, 24.2, 40, 1.5),
    oBar('mass', 24.2, 40, 22.4, 18, 1.4), oBar('mass', 22.4, 18, 23.4, 4, 1.2),
    oBar('mass', 23, 68, 9, 71, 1.1), oBar('mass', 23.4, 52, 37, 55, 1.1),
    oBar('mass', 24, 40, 10, 42, 1), oBar('mass', 23.4, 28, 36, 30, 1), oBar('mass', 22.8, 17, 12, 17, 0.9),
    ...leafCluster(7, 70), ...leafCluster(38, 55), ...leafCluster(9, 41), ...leafCluster(36, 29),
    ...leafCluster(12, 16, 0.9), ...leafCluster(31, 10, 0.9), ...leafCluster(20, 4, 0.8),
  ),
  ...e4N('leaf', ...[[7, 72], [38, 57], [9, 43], [36, 31]].map(([x, y]) => oBar('dark', x - 3, y, x + 3, y - 1, 0.5))),
  // the trusses: stalks, then the fruit hanging off them
  oBar('line', 23, 46, 17, 50, 0.5), oBar('line', 23, 72, 16, 75, 0.5), oBar('line', 23.6, 24, 29, 27, 0.5),
  ...fruit(16, 52, true), ...fruit(20.5, 55, false), ...fruit(15, 77, true), ...fruit(19.5, 78.5, true),
  ...fruit(29.5, 29, false), ...fruit(33, 32, false),
  ...(pick ? [] : TOMATO_PICK.flatMap((p) => fruit(p.x, p.y, true))),
  // the twine tying the stem to the cane
  ...e4N('cane', oBar('dark', 20.6, 34, 24.6, 35, 0.6), oBar('dark', 20.6, 58, 24.6, 59, 0.6)),
  oEll('lit', 14.8, 50.6, 1.6, 1.1), oEll('lit', 13.8, 75.6, 1.6, 1.1),
]);
export const tomatoPlant = (x: number, y: number, w: number, h: number, pick = false, flip = false) =>
  fit(flip ? e4Mirror(tomatoPlantParts(pick)) : tomatoPlantParts(pick), x, y, w, h);

/** One ripe tomato with its green calyx. Real 6 × 6, its middle at (3, 3.4). */
const TOMATO_FRUIT: ObjPart[] = e4In(6, 6, [
  ...e4N('tomato', oEll('mass', 3, 3.5, 6, 5.2)),
  ...e4N('leaf', oTri('mass', 3, 0.9, 3.8, 1.8, 'down')),
  oEll('lit', 1.8, 2.6, 1.5, 1),
]);
export const tomatoFruit = (x: number, y: number, w: number, h: number) => fit(TOMATO_FRUIT, x, y, w, h);

// ── THE RAISED BED ───────────────────────────────────────────────────────────
//
// REFERENCE (any allotment): a raised bed is two BOARDS on edge, one above the other,
// nailed to square CORNER POSTS, the SOIL heaped just over the top board. Real 96 × 18,
// its top board's top at y 0.
const RAISED_BED: ObjPart[] = e4In(96, 18, [
  ...e4N('soil', oEll('mass', 48, 1, 88, 4.4)),
  ...e4N('wood',
    oRect('mass', 48, 5, 92, 8.2, 0, 0.6), oRect('mass', 48, 13.6, 92, 8.4, 0, 0.6),
    oRect('mass', 2.6, 9.2, 5.2, 17.6, 0, 0.6), oRect('mass', 93.4, 9.2, 5.2, 17.6, 0, 0.6),
    oBar('dark', 6, 9.2, 90, 9.2, 0.8),
    oBar('dark', 14, 5.6, 34, 5.2, 0.35), oBar('dark', 52, 13.4, 80, 13.9, 0.35), oBar('dark', 60, 4.8, 74, 5.2, 0.35),
    oRect('dark', 93.4, 16.6, 5.2, 2), oRect('dark', 2.6, 16.6, 5.2, 2),
  ),
  oBar('lit', 6, 1.4, 90, 1.4, 0.5),
]);
export const raisedBed = (x: number, y: number, w: number, h: number) => fit(RAISED_BED, x, y, w, h);

// ── THE HEN HOUSE ────────────────────────────────────────────────────────────
//
// REFERENCE (Commons: "Chicken ark", "A-frame chicken coop, Portland OR"; and the
// garden hen house every British pet-hen keeper buys): a small timber HOUSE on four
// LEGS, a pitched ROOF in felt with BARGE BOARDS standing proud of it, its walls of
// horizontal WEATHERBOARD, a POP-HOLE low in one end with a SLIDE DOOR in runners above
// it and a RAMP down to the run, a little WINDOW, and a NEST BOX bolted to the side
// under its own lid. Real 84 × 104: the roof's apex at (36, 1), the walls 8–64 × 24–66,
// the pop-hole's sill at `COOP_SILL`, the window at `COOP_WINDOW`, the nest box's lid
// top at `COOP_NEST_LID`.
export const COOP_SILL = { x: 16, y: 64 } as const;
export const COOP_WINDOW = { x: 42, y: 38, w: 14, h: 10 } as const;
export const COOP_NEST_LID = { x: 72.5, y: 39.5 } as const;
const HEN_HOUSE: ObjPart[] = e4In(84, 104, [
  ...e4N('wood', oBar('mass', 14, 66, 14, 103.5, 3.2), oBar('mass', 58, 66, 58, 103.5, 3.2)),
  ...e4N('coopSage',
    oRect('mass', 36, 45, 56, 42),
    oRect('face', 62, 45, 4, 42),
    oRect('mass', 72, 52, 16, 20),
    oRect('face', 78.6, 52, 2.8, 20),
  ),
  ...e4N('felt',
    oTri('mass', 36, 13, 70, 24, 'up'),
    oRect('mass', 72.5, 41, 19.4, 3, 0, 0.8),
  ),
  ...e4N('wood', oBar('mass', 0.8, 25.6, 36, 1.4, 2.3), oBar('mass', 36, 1.4, 71.2, 25.6, 2.3), oRect('mass', 36, 67.2, 60, 3, 0, 0.8)),
  ...e4N('coopSage', ...[32, 40, 48, 56].map((y) => oBar('dark', 9, y, 60, y, 0.6))),
  ...e4N('coopSage', oBar('dark', 66, 47, 78, 47, 0.5), oBar('dark', 66, 54, 78, 54, 0.5)),
  ...e4N('gloom', oRect('dark', 16, 57.5, 9, 13, 0, 1.6)),
  ...e4N('wood', oRect('dark', 16, 47.4, 11.4, 6, 0, 0.6), oBar('dark', 10, 44, 10, 64, 0.9), oBar('dark', 22, 44, 22, 64, 0.9)),
  ...e4N('gloom', oRect('dark', COOP_WINDOW.x, COOP_WINDOW.y, COOP_WINDOW.w, COOP_WINDOW.h, 0, 1)),
  ...e4N('wood', oBar('dark', 34.4, 43.8, 49.6, 43.8, 1)),
  oBar('lit', 4, 24, 35, 3, 0.7),
  oBar('lit', 9.5, 25.6, 9.5, 64, 0.5),
]);
export const henHouse = (x: number, y: number, w: number, h: number) => fit(HEN_HOUSE, x, y, w, h);

/**
 * The ramp from the pop-hole down to the run: one plank with CLEATS across it for the
 * hens' feet. Drawn along its box's diagonal, from top right (the sill) to bottom left
 * (the ground). Real 24 × 42.
 */
const COOP_RAMP: ObjPart[] = e4In(24, 42, [
  ...e4N('wood', oBar('mass', 22, 2.2, 2, 39.8, 3)),
  ...e4N('wood', ...[0.2, 0.4, 0.6, 0.8].map((u) => {
    const x = 22 + (2 - 22) * u;
    const y = 2.2 + 37.6 * u;
    return oBar('dark', x - 1.4, y - 0.8, x + 1.4, y + 0.8, 0.9);
  })),
]);
export const coopRamp = (x: number, y: number, w: number, h: number) => fit(COOP_RAMP, x, y, w, h);

// ── THE PICKET FENCE ─────────────────────────────────────────────────────────
//
// REFERENCE (Commons: the picket fence at The Cock Inn, Henham; Blake Hall's gate and
// picket fence). A garden picket fence is narrow upright PICKETS with POINTED tops,
// evenly gapped, nailed to two horizontal RAILS that show between them, the ends on
// square POSTS standing a little taller under a flat CAP, all painted white. Real
// 250 × 30, its picket tips at y 0.
const PICKET_X = Array.from({ length: 27 }, (_, k) => 9 + k * 9);
const PICKET_FENCE: ObjPart[] = e4In(250, 30, [
  ...e4N('picket',
    oRect('mass', 125, 9.6, 246, 3.2, 0, 0.6), oRect('mass', 125, 23.6, 246, 3.2, 0, 0.6),
    ...PICKET_X.flatMap((x) => [oRect('mass', x, 17.6, 5.2, 24.8), oRect('mass', x, 4.6, 3.7, 3.7, 45, 0.3)]),
    oRect('mass', 2.4, 16, 4.8, 28), oRect('mass', 2.4, 1.6, 6, 2.2, 0, 0.6),
    oRect('mass', 247.6, 16, 4.8, 28), oRect('mass', 247.6, 1.6, 6, 2.2, 0, 0.6),
  ),
  ...e4N('picket', ...PICKET_X.map((x) => oRect('dark', x + 1.8, 18, 1.4, 23.6))),
  ...e4N('picket', oRect('dark', 125, 11, 246, 0.8), oRect('dark', 125, 25, 246, 0.8)),
]);
export const picketFence = (x: number, y: number, w: number, h: number) => fit(PICKET_FENCE, x, y, w, h);

/** A fence post taller than the pickets, under a flat cap, with a nail near its top. Real 10 × 84. */
const SLATE_POST: ObjPart[] = e4In(10, 84, [
  ...e4N('picket', oRect('mass', 5, 43, 6, 82), oRect('mass', 5, 2, 9, 3, 0, 0.8), oRect('face', 7.2, 43, 1.6, 82)),
  oEll('line', 5, 6, 1.4, 1.4),
]);
export const slatePost = (x: number, y: number, w: number, h: number) => fit(SLATE_POST, x, y, w, h);

/**
 * A writing slate in its wooden FRAME, hung from the post's nail by a STRING looped
 * over it. Real 34 × 58, the nail at (17, 0), the slate's face `GARDEN_SLATE_FACE`.
 */
export const GARDEN_SLATE_FACE = { x: 17, y: 32.5, w: 29, h: 45 } as const;
const GARDEN_SLATE: ObjPart[] = e4In(34, 58, [
  oBar('line', 17, 0.4, 4, 8, 0.6), oBar('line', 17, 0.4, 30, 8, 0.6),
  ...e4N('wood', oRect('mass', 17, 32.5, 34, 51, 0, 1.4), oRect('face', 17, 57.2, 32, 1.6)),
  ...e4N('slate', oRect('mass', GARDEN_SLATE_FACE.x, GARDEN_SLATE_FACE.y, GARDEN_SLATE_FACE.w, GARDEN_SLATE_FACE.h, 0, 0.6)),
  oBar('lit', 1.6, 8.2, 32.4, 8.2, 0.5),
]);
export const gardenSlate = (x: number, y: number, w: number, h: number) => fit(GARDEN_SLATE, x, y, w, h);

// ── THE BOX OF EGGS ──────────────────────────────────────────────────────────
//
// REFERENCE (Commons: "Bio Eier unsortiert"). An egg box open is a grey moulded-pulp
// TRAY of cups with the brown EGGS standing in them, their tops showing, and the LID
// hinged up behind them. Real 16 × 13; held flat on the palm, so its grip is the tray's
// bottom middle, (8, 13).
const EGG_BOX: ObjPart[] = e4In(16, 13, [
  ...e4N('eggCarton', oRect('mass', 8, 3.6, 15, 6.6, 0, 1.2)),
  ...e4N('eggShell', oEll('mass', 3.6, 6.8, 4.6, 4.8), oEll('mass', 8, 6.5, 4.6, 5), oEll('mass', 12.4, 6.8, 4.6, 4.8)),
  ...e4N('eggCarton', oRect('mass', 8, 10.4, 16, 5.2, 0, 1), oRect('face', 8, 12.4, 15, 1.2)),
  ...e4N('eggCarton', oBar('dark', 5.8, 8.8, 5.8, 12.2, 0.6), oBar('dark', 10.2, 8.8, 10.2, 12.2, 0.6)),
  oEll('lit', 2.8, 5.6, 1.4, 1), oEll('lit', 7.2, 5.2, 1.4, 1), oEll('lit', 11.6, 5.6, 1.4, 1),
]);
export const eggBox = (x: number, y: number, w: number, h: number) => fit(EGG_BOX, x, y, w, h);

// ── THE BASKET ───────────────────────────────────────────────────────────────
//
// REFERENCE (a garden harvest basket): a woven wicker BODY, wider at the rim than the
// foot, under a tall arched HANDLE, its WEAVE in rows round it. Two drawings, so the
// tomatoes can lie between them: the back (the handle and the dark inside) and the
// front (the body and its rim). Real 18 × 19, held by the top of the handle at (9, 0.8).
const TRUG_BACK: ObjPart[] = e4In(18, 19, [
  ...e4N('wicker',
    oBar('mass', 2.6, 11.4, 3.4, 5, 1.6), oBar('mass', 3.4, 5, 6, 1.4, 1.6), oBar('mass', 6, 1.4, 12, 1.4, 1.6),
    oBar('mass', 12, 1.4, 14.6, 5, 1.6), oBar('mass', 14.6, 5, 15.4, 11.4, 1.6),
    oEll('dark', 9, 11.6, 15.4, 3.2),
  ),
]);
const TRUG_FRONT: ObjPart[] = e4In(18, 19, [
  ...e4N('wicker', ...trapezoid('mass', 9, 14.6, 18, 13, 8), oRect('mass', 9, 11, 18.6, 2, 0, 1)),
  ...e4N('wicker', oBar('dark', 1.6, 14, 16.4, 14, 0.5), oBar('dark', 2.6, 16.6, 15.4, 16.6, 0.5),
    ...[4, 7, 10, 13].map((x) => oBar('dark', x, 12, x + (x - 9) * 0.06, 18.4, 0.45))),
  ...e4N('wicker', oRect('face', 9, 18.2, 12.6, 1.2)),
  oBar('lit', 1.4, 10.4, 16.6, 10.4, 0.5),
]);
export const trugBack = (x: number, y: number, w: number, h: number) => fit(TRUG_BACK, x, y, w, h);
export const trugFront = (x: number, y: number, w: number, h: number) => fit(TRUG_FRONT, x, y, w, h);


// ── THE BACK HEDGE ───────────────────────────────────────────────────────────
//
// REFERENCE (any terrace of back gardens): the gardens end at a clipped privet HEDGE
// taller than a person, its top rounded into soft BUMPS where it has grown out since
// the last clip, darker LOW where the light does not reach in. Real 400 × 100, its
// highest bump at y 0.
const HEDGE_BUMPS = Array.from({ length: 17 }, (_, k) => 12 + k * 23.5);
const GARDEN_HEDGE: ObjPart[] = e4In(400, 100, [
  ...e4N('hedge',
    oRect('mass', 200, 56, 400, 88),
    ...HEDGE_BUMPS.map((x, k) => oEll('mass', x, 12 + (k % 3) * 1.6, 30, 22)),
    oRect('face', 200, 94, 400, 12),
    ...HEDGE_BUMPS.map((x, k) => oBar('dark', x - 6 + (k % 2) * 4, 36 + (k % 3) * 9, x + 2 + (k % 2) * 4, 34 + (k % 3) * 9, 1.2)),
  ),
  ...HEDGE_BUMPS.map((x) => oBar('lit', x - 8, 6.4, x - 2, 3.4, 0.9)),
]);
export const gardenHedge = (x: number, y: number, w: number, h: number) => fit(GARDEN_HEDGE, x, y, w, h);
// ── econ4: objects for this lesson go ABOVE this line ──

// ─────────────────────────────────────────────────────────────────────────────
// science-foundations-4 — A PLAYGROUND SWING. Drawn against Commons photographs
// (scratchpad/ref/sci4-*): a park swing set in blue-painted steel tube, an A-frame of two
// splayed legs at each end under one top bar, the seats on galvanised chains (sci4-swing-2,
// sci4-aframe-1, sci4-swing-1); and a hardboard clipboard with its steel clip and a sheet
// of paper (sci4-clipboard-1, -2). The stopwatch and the pencil are the library's.
// ─────────────────────────────────────────────────────────────────────────────

/** Parts in one named real colour. */
const s4N = (k: NaturalKey, ...ps: ObjPart[]): ObjPart[] => ps.map((p) => ({ ...p, nat: k }));
/** Author in real units (an ax × ay box) and hand it to `fit` as the 100-square. */
function sci4In(ax: number, ay: number, parts: readonly ObjPart[]): ObjPart[] {
  const sx = 100 / ax;
  const sy = 100 / ay;
  const s = 100 / Math.min(ax, ay);
  return parts.map((p) => {
    if (p.k === 'bar') return { ...p, x1: p.x1 * sx, y1: p.y1 * sy, x2: p.x2 * sx, y2: p.y2 * sy, t: p.t * s };
    return { ...p, x: p.x * sx, y: p.y * sy, w: p.w * sx, h: p.h * sy, ...(p.k === 'rect' ? { rad: p.rad * s } : null) } as ObjPart;
  });
}

// ── SWING FRAME ──────────────────────────────────────────────────────────────
//
// REFERENCE. A playground swing frame, seen from the end, is an A: two steel tubes
// splayed from an apex to the ground, the swing's direction of travel, so the seat swings
// INSIDE the A. Turned a little, the second A shows behind and up, and the TOP BAR runs
// back between the two apexes: that bar going away, with the chains hanging from it, is
// what says swing rather than easel. Drawn in two halves so the seat can pass between
// them: the far A and the top bar behind it, the near A in front. Real units, 142 × 138:
// the near apex at (56, 16), the far apex at (86, 2), the near feet on the ground at 138
// and the far feet at 124, further off. The chains hang from the bar at 35% and 65% of
// its length (SWING_PIVOTS).
const SWING_FRAME_BACK: ObjPart[] = sci4In(142, 138, [
  ...s4N('swingBlue',
    oBar('face', 86, 2, 30, 124, 3.4),                               // the far A's legs
    oBar('face', 86, 2, 142, 124, 3.4),
    oRect('face', 30, 124, 7, 2.2, 0, 0.8),                           // their foot plates
    oRect('face', 140.5, 124, 7, 2.2, 0, 0.8),
    oBar('mass', 56, 16, 86, 2, 4.6),                                 // the top bar, running back
    oEll('mass', 86, 2.6, 5.2, 5.2),                                  // its far end cap
  ),
  ...s4N('swingChain',
    oEll('mass', 66.5, 11.6, 3, 3),                                   // the two shackles on the bar
    oEll('mass', 75.5, 7.4, 3, 3),
  ),
  oBar('lit', 59, 13.2, 84, 1.6, 0.8),                                // the lamp along the bar's top
]);
export const swingFrameBack = (x: number, y: number, w: number, h: number) => fit(SWING_FRAME_BACK, x, y, w, h);

const SWING_FRAME_FRONT: ObjPart[] = sci4In(142, 138, [
  ...s4N('swingBlue',
    oBar('mass', 56, 16, 0, 138, 4),                                  // the near A's two legs
    oBar('mass', 56, 16, 112, 138, 4),
    oRect('face', 2, 137, 9, 2.4, 0, 0.8),                            // their foot plates, bolted down
    oRect('face', 110, 137, 9, 2.4, 0, 0.8),
    oEll('mass', 56, 16, 7.4, 7.4),                                   // the apex clamp
  ),
  oBar('lit', 53, 22, 4, 129, 0.8),                                   // the lamp down the left leg
  oEll('line', 56, 16, 2, 2),                                         // the clamp's bolt
]);
export const swingFrameFront = (x: number, y: number, w: number, h: number) => fit(SWING_FRAME_FRONT, x, y, w, h);
/** Where the two chains hang from the top bar, in the frame's own 142 × 138 units. */
export const SWING_PIVOTS = { near: { x: 66.5, y: 11.6 }, far: { x: 75.5, y: 7.4 }, of: { w: 142, h: 138 } } as const;

// ── SWING SEAT ───────────────────────────────────────────────────────────────
//
// REFERENCE. A park swing's seat is a STRAP of black rubber, hung by a steel clamp at each
// end from its two chains; turned the way the frame is, the strap runs back along the top
// bar's direction, so it is drawn slanting up and away with a clamp at either end. Drawn
// about its middle, which hangs half-way between the two chains. Real units, 16 × 16, the
// strap across the middle of it.
const SWING_SEAT: ObjPart[] = sci4In(16, 16, [
  ...s4N('tyre',
    oBar('mass', 1.6, 10.6, 14.4, 5.4, 4),                            // the strap
    oBar('face', 2.4, 11.4, 14.4, 6.6, 1.6),                          // its underside, out of the lamp
  ),
  ...s4N('swingChain',
    oEll('mass', 3.5, 10.1, 2.6, 2.6),                                // the clamp on the near chain
    oEll('mass', 12.5, 5.9, 2.6, 2.6),                                // and on the far one
  ),
  oBar('lit', 3.6, 9, 11, 5.8, 0.6),                                  // the lamp along its top
]);
export const swingSeat = (x: number, y: number, w: number, h: number) => fit(SWING_SEAT, x, y, w, h);

// ── CLIPBOARD ────────────────────────────────────────────────────────────────
//
// REFERENCE. A clipboard is a board of brown HARDBOARD with rounded corners and a steel
// CLIP across its top — a flat plate with a hooped lever over it, a hole through the hoop
// — and a sheet of white PAPER held under the clip with a margin of board showing round
// it. The clip at the top centre is the field mark: without it, it is a sheet of card.
// Real units, 32 × 66 (drawn large on the stage so what is written on it can be read and
// tapped): the board 2–66, the paper 8.6–64.6, tucked under the clip. What is written
// on it is the scene's, because she writes it.
const CLIPBOARD: ObjPart[] = sci4In(32, 66, [
  ...s4N('hardboard',
    oRect('mass', 16, 34, 32, 64, 0, 2.4),                          // the board
    oRect('face', 30.8, 35, 2.4, 61, 0, 1),                         // its right edge, out of the lamp
  ),
  ...s4N('paper',
    oRect('mass', 15.9, 36.6, 27.4, 56, 0, 0.5),                      // the sheet
    oRect('dark', 16, 11.2, 13, 1.4),                                 // the clip's shadow on it
  ),
  ...s4N('silver',
    oRect('mass', 16, 7.6, 15, 4.6, 0, 1.4),                          // the clip's plate
    oEll('mass', 16, 3.4, 8.4, 6.4),                                  // its hooped lever
    oRect('face', 16, 9.4, 15, 1.2),                                  // the plate's lower lip
  ),
  oEll('line', 16, 3.2, 3.2, 2.4),                                    // the hole through the hoop
  oBar('lit', 3, 3.2, 10, 3.2, 0.7),                                  // the lamp along the board's top
]);
export const clipboard = (x: number, y: number, w: number, h: number) => fit(CLIPBOARD, x, y, w, h);
/** The sheet on the clipboard, and where a hand grips the board's right edge, in its own 32 × 66. */
export const CLIPBOARD_SHEET = { x0: 2.2, y0: 8.6, x1: 29.6, y1: 64.6, grip: { x: 30.6, y: 42 }, of: { w: 32, h: 66 } } as const;

// ── sci4: objects for this lesson go ABOVE this line ──

// ─────────────────────────────────────────────────────────────────────────────
// history-foundations-4 — A TOWN SQUARE. A sandstone clock tower with a bell in its
// belfry, an old brick building whose ground floor was a bakery and is now a phone
// shop, a granite horse trough planted with flowers, a pair of Sheffield cycle stands,
// and a hundred-year-old sepia photograph of the same square.
// ─────────────────────────────────────────────────────────────────────────────

/** Parts in a named real colour (AP11). */
const h4N = (k: NaturalKey, ...ps: ObjPart[]): ObjPart[] => ps.map((p) => ({ ...p, nat: k }));
/** Author in real units (an ax × ay box) and hand it to `fit` as the 100-square. */
function h4In(ax: number, ay: number, parts: readonly ObjPart[]): ObjPart[] {
  const sx = 100 / ax;
  const sy = 100 / ay;
  const s = 100 / Math.min(ax, ay);
  return parts.map((p) => {
    if (p.k === 'bar') return { ...p, x1: p.x1 * sx, y1: p.y1 * sy, x2: p.x2 * sx, y2: p.y2 * sy, t: p.t * s };
    return { ...p, x: p.x * sx, y: p.y * sy, w: p.w * sx, h: p.h * sy, ...(p.k === 'rect' ? { rad: p.rad * s } : null) } as ObjPart;
  });
}
/** An arc of a tube, as short bars: centre (cx, cy), radius r, from angle a0 to a1. */
function h4Arc(role: Role, cx: number, cy: number, r: number, a0: number, a1: number, t: number, n = 8): ObjPart[] {
  const out: ObjPart[] = [];
  for (let i = 0; i < n; i += 1) {
    const u0 = a0 + ((a1 - a0) * i) / n;
    const u1 = a0 + ((a1 - a0) * (i + 1)) / n;
    out.push(oBar(role, cx + Math.cos(u0) * r, cy + Math.sin(u0) * r, cx + Math.cos(u1) * r, cy + Math.sin(u1) * r, t));
  }
  return out;
}

// ── THE CLOCK TOWER ──────────────────────────────────────────────────────────
//
// REFERENCE (Commons: "Erastus Corning clock tower, Centerway Square, Corning, New
// York"; the town hall tower in Ząbkowice Śląskie's market square). A market-square
// clock tower is a SQUARE SHAFT of coursed stone on a wider PLINTH, the plinth carrying a
// round-arched niche; a projecting STRING COURSE; a CLOCK STAGE with a white dial in a
// dark bezel, the hands black; above it a BELFRY with a tall round-arched opening and the
// bell hanging in its dark; a cornice; and a pyramid of slate on top, with a finial. Lit
// from the top left: its right-hand face is in shade. 48 × 200; the bell is the scene's
// (it swings), hung at (24, 30).
export const TOWER_BELL_AT = { x: 24, y: 30, w: 48, h: 200 } as const;
const CLOCK_TOWER: ObjPart[] = h4In(48, 200, [
  ...h4N('felt',
    oTri('mass', 24, 12, 40, 17, 'up'),
  ),
  oBar('line', 24, 0.5, 24, 5, 1.2),
  oEll('line', 24, 4.4, 2.4, 2.4),
  ...h4N('towerStone',
    // the cornice under the slate, the belfry stage, its sill
    oRect('mass', 24, 21.5, 44, 4, 0, 0.6),
    oRect('mass', 24, 37, 34, 30),
    oRect('face', 39, 37, 4, 30),
    oRect('mass', 24, 53.5, 42, 3.5, 0, 0.6),
    // the clock stage, a string course, the shaft, its shaded face
    oRect('mass', 24, 72.5, 36, 35),
    oRect('face', 40, 72.5, 4, 35),
    oRect('mass', 24, 92, 44, 4.2, 0, 0.6),
    oRect('mass', 24, 128, 36, 68),
    oRect('face', 40.5, 128, 5, 68),
    // the coursed ashlar: bed joints, and the vertical joints broken course by course
    ...[103, 112, 121, 130, 139, 148, 157].map((y) => oBar('dark', 7, y, 41, y, 0.6)),
    ...[98, 116, 134, 152].map((y) => oBar('dark', 16, y - 4, 16, y + 4, 0.6)),
    ...[107, 125, 143, 160].map((y) => oBar('dark', 30, y - 4, 30, y + 2, 0.6)),
    // the plinth and its cap moulding, the niche in it, the base course
    oRect('mass', 24, 164, 48, 4.4, 0, 0.8),
    oRect('mass', 24, 182, 44, 32),
    oRect('face', 44, 182, 4, 32),
    oRect('dark', 24, 189, 14, 18),
    oEll('dark', 24, 180, 14, 12),
    oRect('mass', 24, 198.5, 48, 3),
    ...[172, 184].map((y) => oBar('dark', 3, y, 15, y, 0.6)),
    ...[172, 184].map((y) => oBar('dark', 33, y, 45, y, 0.6)),
  ),
  // the belfry's arched opening, and the shaft's slit window, in their dark
  ...h4N('belfry',
    oRect('mass', 24, 41, 14, 18),
    oEll('mass', 24, 32, 14, 12),
    oRect('mass', 24, 122, 4, 12),
    oEll('mass', 24, 116, 4, 4),
  ),
  // the dial: a dark bezel, the white face, twelve marks, the hands at ten past ten
  ...h4N('felt', oEll('mass', 24, 72, 27, 27)),
  ...h4N('dialWhite', oEll('mass', 24, 72, 22, 22)),
  ...Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2;
    const r0 = i % 3 === 0 ? 7.6 : 8.8;
    return oBar('line', 24 + Math.sin(a) * r0, 72 - Math.cos(a) * r0, 24 + Math.sin(a) * 10.2, 72 - Math.cos(a) * 10.2, i % 3 === 0 ? 1.3 : 0.8);
  }),
  oBar('line', 24, 72, 24 + Math.sin(-Math.PI / 3) * 5.4, 72 - Math.cos(-Math.PI / 3) * 5.4, 1.5),
  oBar('line', 24, 72, 24 + Math.sin((2 * Math.PI) / 12 * 2) * 8, 72 - Math.cos((2 * Math.PI) / 12 * 2) * 8, 1.1),
  oEll('line', 24, 72, 2, 2),
  // the lamp catches the upper-left edges
  oBar('lit', 7, 96, 7, 160, 0.8),
  oBar('lit', 8, 57, 8, 88, 0.8),
  oBar('lit', 2, 162.4, 44, 162.4, 0.6),
]);
export const clockTower = (x: number, y: number, w: number, h: number) => fit(CLOCK_TOWER, x, y, w, h);

// ── THE BELL ─────────────────────────────────────────────────────────────────
//
// REFERENCE (any church or tower bell): a CANON to hang it by, a rounded SHOULDER, a
// WAIST that flares to a thick LIP, and the clapper's ball showing under the mouth. In
// bronze. 12 × 12, hung from the top centre, so the scene swings it about (0, 0) by
// drawing it at towerBell(0, h / 2, w, h).
const TOWER_BELL: ObjPart[] = h4In(12, 12, [
  ...h4N('bellBronze',
    oRect('mass', 6, 1.4, 3, 2.8, 0, 0.6),
    oEll('mass', 6, 4.6, 7.4, 6),
    ...trapezoid('mass', 6, 7.4, 7.2, 10.6, 5),
    oEll('mass', 6, 10, 12, 2.8),
    oRect('face', 9.4, 7.6, 1.6, 4.4),
  ),
  oEll('line', 6, 11.4, 2.4, 2.4),
  oBar('lit', 3.6, 4.4, 3.1, 8.6, 0.7),
]);
export const towerBell = (x: number, y: number, w: number, h: number) => fit(TOWER_BELL, x, y, w, h);

// ── THE PHONE SHOP, WHICH WAS A BAKERY ───────────────────────────────────────
//
// REFERENCE (Commons: "T Mobile shop London"; a mobile-phone shop's window display). An
// old two-storey building in BRICK, a stone coping on its parapet, two white SASH
// WINDOWS upstairs on stone sills, a stone band — and at street level a new shop front:
// a bright plastic FASCIA sign, aluminium frames, plate glass to the floor with the white
// inside showing, a glass DOOR with a bar handle, and the phones stood up on a display
// shelf behind the glass, their screens lit. The ground floor has changed; the floor
// above it has not. 100 × 194; the fascia is 2–98 × 99–113, where the scene letters it.
export const SHOP_FASCIA = { x: 2, y: 99, w: 96, h: 14 } as const;
const PHONE_SHOP: ObjPart[] = h4In(100, 194, [
  ...h4N('brick',
    oRect('mass', 50, 52, 96, 92),
    oRect('face', 97, 52, 6, 92),
    ...[14, 22, 30, 38, 46, 54, 62, 70, 78, 86].map((y) => oBar('dark', 3, y, 94, y, 0.5)),
    oRect('mass', 3, 154, 6, 80),
    oRect('mass', 97, 154, 6, 80),
    oRect('face', 98.5, 154, 3, 80),
    oRect('mass', 61, 192.5, 64, 3),
  ),
  ...h4N('coping',
    oRect('mass', 50, 3, 100, 6, 0, 0.6),
    oRect('mass', 27, 18, 28, 4),
    oRect('mass', 73, 18, 28, 4),
    oRect('mass', 27, 62, 28, 3),
    oRect('mass', 73, 62, 28, 3),
    oRect('mass', 50, 97, 100, 4),
  ),
  // the two sash windows upstairs, as they have always been
  ...[27, 73].flatMap((x) => [
    ...h4N('sashWhite', oRect('mass', x, 40, 22, 40)),
    ...h4N('houseGlass', oRect('mass', x, 30.6, 17.6, 16.4), oRect('mass', x, 49.4, 17.6, 16.4)),
    ...h4N('sashWhite', oRect('mass', x, 40, 22, 2.4), oRect('mass', x, 30.6, 1.2, 16.4), oRect('mass', x, 49.4, 1.2, 16.4)),
  ]),
  // the new shop front: the fascia, the frames, the glass, the door
  ...h4N('fascia', oRect('mass', 50, 106, 96, 14, 0, 0.6), oRect('dark', 50, 112.2, 96, 1.6)),
  ...h4N('litGlass', oRect('mass', 17, 156, 18, 74), oRect('mass', 61.5, 153.5, 63, 69)),
  // the display shelf and the phones on it, screens lit
  ...h4N('silver', oRect('mass', 61.5, 150.5, 60, 2)),
  ...[38, 50, 73, 85].flatMap((x) => [
    ...h4N('phoneBody', oRect('mass', x, 140, 7.4, 13.6, 0, 1.4), oRect('mass', x, 148, 3, 3)),
    ...h4N('phoneLit', oRect('mass', x, 139.6, 5.6, 10.6, 0, 0.6)),
  ]),
  ...h4N('silver',
    oRect('mass', 50, 117, 92, 3),
    oRect('mass', 7.4, 156, 1.6, 75), oRect('mass', 26.6, 156, 1.6, 75), oRect('mass', 17, 193, 20, 1.6),
    oRect('mass', 29.2, 154, 1.6, 72), oRect('mass', 93.8, 154, 1.6, 72), oRect('mass', 61.5, 154, 1.6, 72),
    oRect('mass', 61.5, 189.6, 66, 1.8),
    oBar('mass', 22.6, 142, 22.6, 168, 1.6),
  ),
  // light on the glass, and on the coping and the fascia's top edge
  oBar('lit', 33, 186, 44, 122, 1),
  oBar('lit', 66, 186, 77, 122, 1),
  oBar('lit', 12, 186, 17, 124, 0.8),
  oBar('lit', 3, 99.8, 96, 99.8, 0.6),
  oBar('lit', 1, 0.8, 98, 0.8, 0.6),
]);
export const phoneShop = (x: number, y: number, w: number, h: number) => fit(PHONE_SHOP, x, y, w, h);

// ── THE HORSE TROUGH, NOW A PLANTER ──────────────────────────────────────────
//
// REFERENCE (Commons: "Summit NJ horse trough"; the troughs the London cattle-trough
// association put in every town square). A horse trough is one long BASIN of granite,
// its RIM thick and a little proud of the body, the body narrowing to a FOOT on a low
// PLINTH, and often a sunk PANEL on its long face. Planted, its top is a MOUND of foliage
// with flowers held above it and petunias trailing over the rim. 56 × 48: flowers 0–17,
// the rim at 16.
const HORSE_TROUGH: ObjPart[] = h4In(56, 48, [
  // the foliage mound behind the rim
  ...h4N('leaf',
    oEll('mass', 28, 13, 50, 10),
    oEll('mass', 11, 10, 16, 11),
    oEll('mass', 24, 7, 20, 12),
    oEll('mass', 40, 8, 20, 12),
    oEll('mass', 50, 12, 10, 8),
    oEll('dark', 28, 15, 46, 3.4),
  ),
  // the geraniums, red, held above the leaves, and a few yellow ones
  ...h4N('geranium', oEll('mass', 13, 5, 7, 6), oEll('mass', 30, 3.4, 8, 6.4), oEll('mass', 44, 5, 7, 6)),
  ...h4N('petal', oEll('mass', 21.5, 8.6, 4.4, 4), oEll('mass', 37.5, 9.4, 4.4, 4), oEll('mass', 6, 11, 3.6, 3.4)),
  // the granite trough: the rim, the basin, its foot and plinth, the panel
  ...h4N('granite',
    oRect('mass', 28, 29.5, 52, 21),
    ...trapezoid('mass', 28, 41.4, 52, 44, 4),
    oRect('mass', 28, 45.6, 56, 4.8, 0, 0.6),
    oRect('face', 52, 30, 3, 22),
    oRect('mass', 28, 18.5, 56, 5, 0, 1.2),
    oRect('dark', 28, 30, 36, 11, 0, 1),
    oBar('dark', 4, 39.2, 52, 39.2, 0.6),
  ),
  // petunias trailing over the front of the rim
  ...h4N('petunia', oEll('mass', 8, 19.6, 6, 5), oEll('mass', 45, 20, 6.4, 5.4), oEll('mass', 26, 20.6, 4.4, 3.8)),
  ...h4N('leaf', oEll('mass', 12, 21.4, 4, 3), oEll('mass', 40.4, 21.6, 4, 3)),
  oBar('lit', 2, 16.6, 48, 16.6, 0.7),
  oBar('lit', 11, 25.4, 11, 34.6, 0.5),
]);
export const horseTrough = (x: number, y: number, w: number, h: number) => fit(HORSE_TROUGH, x, y, w, h);

// ── SHEFFIELD CYCLE STANDS ───────────────────────────────────────────────────
//
// REFERENCE (Commons: "Sheffield stands"; "Bicycle rack, Dalhousie University"). The
// stand every British town square has: one steel TUBE bent into an upside-down U, its
// two legs set into the paving, galvanised to a dull silver. A rack is a row of them,
// about a bicycle's width apart. One stand is 26 × 34; the rack is two of them, 64 × 34.
const STAND_PARTS = (cx: number): ObjPart[] => h4N('silver',
  ...h4Arc('mass', cx, 12, 10, Math.PI, Math.PI * 2, 2.6),
  oBar('mass', cx - 10, 12, cx - 10, 33.4, 2.6),
  oBar('mass', cx + 10, 12, cx + 10, 33.4, 2.6),
  oRect('face', cx + 10, 33.2, 4, 1.4),
  oRect('face', cx - 10, 33.2, 4, 1.4),
);
const CYCLE_STAND: ObjPart[] = h4In(26, 34, [...STAND_PARTS(13), oBar('lit', 2.4, 13, 2.4, 31, 0.6)]);
export const cycleStand = (x: number, y: number, w: number, h: number) => fit(CYCLE_STAND, x, y, w, h);
const CYCLE_RACK: ObjPart[] = h4In(64, 34, [
  ...STAND_PARTS(13), ...STAND_PARTS(51),
  oBar('lit', 2.4, 13, 2.4, 31, 0.6), oBar('lit', 40.4, 13, 40.4, 31, 0.6),
]);
export const cycleRack = (x: number, y: number, w: number, h: number) => fit(CYCLE_RACK, x, y, w, h);

// ── THE OLD PHOTOGRAPH ───────────────────────────────────────────────────────
//
// REFERENCE (Commons: "Postcard of Town Square in Ljubljana 1910"). A print from about
// 1920: brown and cream sepia, a white card border wider at the foot, and in it the
// same square — the tower on the left with its clock, a shop with an awning on the
// right, and a horse drinking at the trough between them. 20 × 14, held by its bottom
// edge: a scene draws it at oldPhoto(0, -h / 2, w, h) so that edge is at (0, 0).
const OLD_PHOTO: ObjPart[] = h4In(20, 14, [
  ...h4N('paper', oRect('mass', 10, 7, 20, 14, 0, 0.6)),
  ...h4N('sepia', oRect('mass', 10, 6.4, 17.4, 11), oRect('dark', 10, 10.6, 17.4, 2.6)),
  ...h4N('sepiaDark',
    oRect('mass', 5, 6.2, 2.6, 7.6), oTri('mass', 5, 1.7, 3.2, 1.8, 'up'),
    oRect('mass', 15.8, 6.4, 5.6, 6.4), oTri('mass', 15.8, 8.2, 6.4, 1.4, 'down'),
    oEll('mass', 10.2, 8, 3.6, 1.8),
    oBar('mass', 11.6, 7.6, 12.6, 6.4, 0.8), oEll('mass', 12.9, 6.6, 1.5, 1),
    oBar('mass', 9, 8.4, 9, 10.2, 0.5), oBar('mass', 11.4, 8.4, 11.4, 10.2, 0.5),
    oRect('mass', 13.8, 9.6, 2.6, 1.2),
  ),
  oEll('lit', 5, 4.2, 1.2, 1.2),
  oRect('lit', 15.8, 5, 2, 1.6),
]);
export const oldPhoto = (x: number, y: number, w: number, h: number) => fit(OLD_PHOTO, x, y, w, h);

// ── hist4: objects for this lesson go ABOVE this line ──

// ── phil5 OBJECTS BEGIN ──
// ─────────────────────────────────────────────────────────────────────────────
// philosophy-foundations-5 — AN ORBITING SPACE LAB, A TELEPORTER POD, THE MOON BASE.
//
// REFERENCES (npm run ref): the ISS's Destiny laboratory and Harmony node — off-white
// padded wall panels, blue HANDRAILS, a square HATCH with rounded corners in a grey frame
// with a latch; the Cupola — a ring of DARK window frames with the Earth's blue and white
// below; a NASA lunar base concept — grey regolith under a black, starry sky, white
// cylindrical habitat modules; a balance scale — a pillar on a stepped base, a beam on a
// pivot and two pans hung on chains. The TELEPORTER POD is the lesson's own machine, built
// the way the references build their kit: a white composite shell (a domed cap with a
// light ring, two pillars, a base rim) round a dark lit interior, on a raised pad whose
// front holds the RECYCLER hatch, yellow and black like every hatch that eats things.
// ─────────────────────────────────────────────────────────────────────────────

/** Parts in a named real colour (AP11). */
function ph5N(k: NaturalKey, ...ps: ObjPart[]): ObjPart[] {
  return ps.map((p) => ({ ...p, nat: k }));
}
/** Author in real units (an ax × ay box) and hand it to `fit` as the 100-square. */
function ph5In(ax: number, ay: number, parts: readonly ObjPart[]): ObjPart[] {
  const sx = 100 / ax;
  const sy = 100 / ay;
  const s = 100 / Math.min(ax, ay);
  return parts.map((p) => {
    if (p.k === 'bar') return { ...p, x1: p.x1 * sx, y1: p.y1 * sy, x2: p.x2 * sx, y2: p.y2 * sy, t: p.t * s };
    return { ...p, x: p.x * sx, y: p.y * sy, w: p.w * sx, h: p.h * sy, ...(p.k === 'rect' ? { rad: p.rad * s } : null) } as ObjPart;
  });
}

/** The pod's BACK: its domed cap and the dark lit chamber a figure stands in. 82 × 104. */
const TELEPOD_BACK: ObjPart[] = ph5In(82, 104, [
  ...ph5N('p5Shell',
    oEll('mass', 41, 13, 80, 26),                                  // the domed cap
    oRect('mass', 41, 19, 82, 10, 0, 2),                           // its skirt
  ),
  ...ph5N('p5Chamber', oRect('mass', 41, 64, 66, 80)),             // the chamber, lit pale inside
  ...ph5N('p5Glow', oEll('dark', 41, 100, 60, 6)),                 // the glowing floor plate
  ...ph5N('p5Glow', oBar('dark', 14, 34, 14, 94, 2.4), oBar('dark', 68, 34, 68, 94, 2.4)), // light strips down its sides
  ...ph5N('p5Chamber', oRect('dark', 41, 28, 66, 6)),              // the shadow under the cap
  oBar('lit', 22, 6, 34, 3, 0.9),                                  // the lamp on the dome
]);
export const telePodBack = (x: number, y: number, w: number, h: number) => fit(TELEPOD_BACK, x, y, w, h);

/** The pod's FRONT, drawn over whoever is inside: two pillars, the rims, the glass's glints. 82 × 104. */
const TELEPOD_FRONT: ObjPart[] = ph5In(82, 104, [
  ...ph5N('p5Shell',
    oRect('mass', 4.5, 63, 9, 82, 0, 2),                           // the pillars
    oRect('mass', 77.5, 63, 9, 82, 0, 2),
    oRect('mass', 41, 22, 82, 7, 0, 2),                            // the cap's rim
    oRect('mass', 41, 101, 82, 6, 0, 2),                           // and the base's
    oRect('face', 80.2, 63, 3.6, 80),                              // the right pillar, turned from the lamp
  ),
  ...ph5N('p5Inside', oRect('dark', 41, 22, 70, 3, 0, 1.5)),       // the ring light, unlit
  oBar('lit', 13, 94, 20, 84, 1.1),                                // glints low on the glass, clear of
  oBar('lit', 13, 86, 17, 80, 0.7),                                // whoever stands in it
]);
export const telePodFront = (x: number, y: number, w: number, h: number) => fit(TELEPOD_FRONT, x, y, w, h);

/**
 * The raised PAD the pod stands on, with its step at the left and, in its front, the
 * RECYCLER's opening (its lid is `recycleLid`, which the scene swings). 128 × 34.
 */
const TELEPOD_PAD: ObjPart[] = ph5In(128, 34, [
  ...ph5N('p5Shell',
    oRect('mass', 10.5, 25.5, 21, 17, 0, 1.5),                     // the step
    oRect('mass', 74.5, 17, 107, 34, 0, 2.5),                      // the pad
    oRect('face', 126, 17, 4, 32, 0, 1.5),                         // its end, turned from the lamp
  ),
  ...ph5N('p5Inside', oRect('dark', 97, 17, 56, 28, 0, 2)),        // the recycler's mouth
  ...ph5N('p5Grinder', oRect('dark', 97, 12, 50, 8, 0, 2)),        // and the glow of it working
  ...[77, 85, 93, 101, 109, 117].map((x) => oTri('line', x, 19, 6, 6, 'up')), // its teeth
  oBar('lit', 23, 1.4, 125, 1.4, 0.8),                             // the lamp along the pad's top
  oBar('lit', 1.5, 18.4, 19.5, 18.4, 0.7),                         // and the step's
  oEll('line', 27, 8, 1.6, 1.6), oEll('line', 27, 27, 1.6, 1.6),   // bolts
  oEll('line', 60, 8, 1.6, 1.6), oEll('line', 60, 27, 1.6, 1.6),
]);
export const telePodPad = (x: number, y: number, w: number, h: number) => fit(TELEPOD_PAD, x, y, w, h);

/** The recycler's LID: hazard-striped, a steel plate in its middle for its word. 56 × 28. */
const RECYCLE_LID: ObjPart[] = ph5In(56, 28, [
  ...ph5N('p5Hazard', oRect('mass', 28, 14, 56, 28, 0, 2)),
  ...ph5N('p5Trim', oRect('mass', 28, 14, 50, 13, 0, 1)),         // the plate the word is on
  ...[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => oBar('line', 2.5 + i * 6, 6.6, 6.5 + i * 6, 1.4, 2)),
  ...[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => oBar('line', 2.5 + i * 6, 26.6, 6.5 + i * 6, 21.4, 2)),
]);
export const recycleLid = (x: number, y: number, w: number, h: number) => fit(RECYCLE_LID, x, y, w, h);
/** The plate on the lid, in its own 56 × 28 units. */
export const RECYCLE_PLATE = { x: 28, y: 14, w: 50, h: 13 } as const;

/** The control CONSOLE: a graphite desk at the hip, a grey top, a dark front panel. 60 × 44. */
const LAB_CONSOLE: ObjPart[] = ph5In(60, 44, [
  ...ph5N('p5Console',
    oRect('mass', 30, 24, 56, 40, 0, 2),                           // the body
    oRect('face', 55.5, 24, 5, 38, 0, 1.5),                        // its end, turned from the lamp
    oRect('dark', 28, 25, 42, 28, 0, 2),                           // the front panel, sunk
  ),
  ...ph5N('p5Trim', oRect('mass', 30, 2.5, 60, 5, 0, 1.5)),        // the desk top
  ...ph5N('p5Phosphor', oEll('mass', 12, 15, 3, 3)),               // its status lights
  ...ph5N('p5Red', oEll('mass', 18, 15, 3, 3)),
  oBar('lit', 2, 1.2, 56, 1.2, 0.7),
]);
export const labConsole = (x: number, y: number, w: number, h: number) => fit(LAB_CONSOLE, x, y, w, h);

/** The console's raised CONTROL PANEL: a green screen with a trace, a red and a green button. 30 × 16. */
const CONSOLE_DESK: ObjPart[] = ph5In(30, 16, [
  ...ph5N('p5Console', oRect('mass', 15, 9, 30, 14, 0, 2)),
  ...ph5N('p5Phosphor', oRect('dark', 19, 8.5, 16, 9, 0, 1)),     // the screen
  ...ph5N('p5Red', oEll('mass', 6, 6, 4, 4)),                      // the buttons, at the near end
  ...ph5N('p5Phosphor', oEll('mass', 6, 12, 4, 4)),
  oBar('lit', 12.5, 9, 15.5, 6.5, 0.6), oBar('lit', 15.5, 6.5, 18.5, 11, 0.6), // the trace on the screen
  oBar('lit', 18.5, 11, 21.5, 7, 0.6), oBar('lit', 21.5, 7, 25, 9, 0.6),
]);
/** Where the two buttons are, in the panel's own 30 × 16 units. */
export const DESK_BUTTONS = { x: 6, red: 6, green: 12 } as const;
export const consoleDesk = (x: number, y: number, w: number, h: number) => fit(CONSOLE_DESK, x, y, w, h);

/** The brass BALANCE's stand: a stepped base, a pillar, a finial over the pivot. 30 × 36. */
const BALANCE_STAND: ObjPart[] = ph5In(30, 36, [
  ...ph5N('brass',
    oRect('mass', 15, 33.5, 30, 5, 0, 2),                          // the base
    oRect('mass', 15, 29.5, 14, 4, 0, 1.2),                        // its step
    oRect('mass', 15, 16, 3.6, 28),                                // the pillar
    oEll('mass', 15, 2.5, 6, 6),                                   // the finial
    oRect('face', 16.3, 16, 1.2, 26),                              // the pillar's far side
  ),
  oBar('lit', 2, 31.8, 26, 31.8, 0.6),
]);
export const balanceStand = (x: number, y: number, w: number, h: number) => fit(BALANCE_STAND, x, y, w, h);
/** Where the beam turns, in the stand's own 30 × 36 units. */
export const BALANCE_PIVOT = { x: 15, y: 3.4 } as const;

/** The balance's BEAM, drawn about its pivot (its centre). 44 × 6. */
const BALANCE_BEAM: ObjPart[] = ph5In(44, 6, [
  ...ph5N('brass',
    oRect('mass', 22, 3, 42, 3, 0, 1.5),
    oEll('mass', 22, 3, 6, 6),                                     // the boss on the pivot
    oEll('mass', 1.8, 3, 3.6, 3.6),                                // the ends the pans hang from
    oEll('mass', 42.2, 3, 3.6, 3.6),
  ),
  oBar('lit', 4, 2.2, 40, 2.2, 0.5),
]);
export const balanceBeam = (x: number, y: number, w: number, h: number) => fit(BALANCE_BEAM, x, y, w, h);

/** One PAN on its chains, drawn about the hook it hangs from (its top middle). 18 × 16. */
const BALANCE_PAN: ObjPart[] = ph5In(18, 16, [
  oBar('line', 9, 0.6, 1.6, 11, 0.6),                              // the chains
  oBar('line', 9, 0.6, 16.4, 11, 0.6),
  ...ph5N('brass',
    ...trapezoid('mass', 9, 13.2, 18, 9, 5.6),                     // the dish
    oEll('mass', 9, 0.9, 2.2, 2.2),                                // the hook
    oEll('dark', 9, 10.6, 17, 2),                                  // the dish's rim
  ),
]);
export const balancePan = (x: number, y: number, w: number, h: number) => fit(BALANCE_PAN, x, y, w, h);

/** A PORTHOLE's frame, the Cupola's way: a dark ring, a grey lip, bolts. 88 × 88. */
const PORTHOLE: ObjPart[] = ph5In(88, 88, [
  ...ph5N('p5Bezel', oEll('mass', 44, 44, 88, 88)),
  ...ph5N('p5Trim', oEll('dark', 44, 44, 76, 76)),
  ...[0, 1, 2, 3, 4, 5, 6, 7].map((k) => oEll('lit', 44 + 40.6 * Math.cos((k * Math.PI) / 4 + 0.39), 44 + 40.6 * Math.sin((k * Math.PI) / 4 + 0.39), 2.2, 2.2)),
]);
export const porthole = (x: number, y: number, w: number, h: number) => fit(PORTHOLE, x, y, w, h);

/** A wall MONITOR: a black bezel, the display (the scene draws the Moon on it), a strip below. 124 × 96. */
const LAB_MONITOR: ObjPart[] = ph5In(124, 96, [
  ...ph5N('p5Bezel', oRect('mass', 62, 48, 124, 96, 0, 5)),
  ...ph5N('p5Space', oRect('dark', 62, 41, 114, 74, 0, 2)),
  oBar('lit', 5, 1.6, 119, 1.6, 0.7),
]);
export const labMonitor = (x: number, y: number, w: number, h: number) => fit(LAB_MONITOR, x, y, w, h);
/** The display, and the strip under it, in the monitor's own 124 × 96 units. */
export const MONITOR_DISPLAY = { x: 62, y: 41, w: 114, h: 74 } as const;
export const MONITOR_STRIP = { x: 62, y: 87, w: 114, h: 14 } as const;

/** A station HATCH in the wall, open onto a lit corridor: grey frame, latch, the tube beyond. 54 × 108. */
const CORRIDOR_HATCH: ObjPart[] = ph5In(54, 108, [
  ...ph5N('p5Trim', oRect('mass', 27, 54, 54, 108, 0, 12)),
  ...ph5N('p5Rail', oRect('mass', 4, 54, 4, 18, 0, 1.5)),         // the latch handle
  ...ph5N('p5Inside', oRect('dark', 27, 54, 40, 94, 0, 9)),        // the opening
  ...ph5N('p5Wall', oRect('dark', 27, 54, 26, 70, 0, 6)),          // the corridor running away
  ...ph5N('p5Lamp', oRect('dark', 27, 54, 12, 34, 0, 4)),          // its far end, lit
  oBar('line', 15, 30, 15, 78, 0.8),                               // its handrails
  oBar('line', 39, 30, 39, 78, 0.8),
]);
export const corridorHatch = (x: number, y: number, w: number, h: number) => fit(CORRIDOR_HATCH, x, y, w, h);

/**
 * The Moon base's DOME: a whole white sphere drawn about its middle, so the scene sets its
 * lower half down behind the dust and a half-dome stands on the ground; a row of lit
 * windows round its shoulder, an aerial on top. 36 × 36.
 */
const MOON_DOME: ObjPart[] = ph5In(36, 36, [
  ...ph5N('p5Dome', oEll('mass', 18, 20, 34, 32), oRect('face', 18, 3, 1.6, 6), oEll('mass', 18, 1.6, 3, 3)),
  ...ph5N('p5Glow', oRect('dark', 9, 13, 4, 3, 0, 1), oRect('dark', 15.5, 11.5, 4, 3, 0, 1), oRect('dark', 22, 11.5, 4, 3, 0, 1), oRect('dark', 28, 13, 4, 3, 0, 1)),
  oBar('lit', 7, 10, 11, 6.5, 1),
]);
export const moonDome = (x: number, y: number, w: number, h: number) => fit(MOON_DOME, x, y, w, h);

/** A Moon base MODULE: a white cylinder on its side, two bands round it. 30 × 12. */
const MOON_MODULE: ObjPart[] = ph5In(30, 12, [
  ...ph5N('p5Dome', oRect('mass', 15, 6, 30, 12, 0, 6)),
  oBar('line', 9, 1, 9, 11, 0.6), oBar('line', 21, 1, 21, 11, 0.6),
  oBar('lit', 3, 3, 27, 3, 0.6),
]);
export const moonModule = (x: number, y: number, w: number, h: number) => fit(MOON_MODULE, x, y, w, h);
// ── phil5 OBJECTS END ──

// ── phil5: objects for this lesson go ABOVE this line ──

// ── psych5 OBJECTS START ──
// ─────────────────────────────────────────────────────────────────────────────
// psych5 — A HILLTOP AT MIDNIGHT (psychology-foundations-5, "When the Saucer Doesn't
// Come"). Drawn against pictures fetched with `node scripts/get-reference.mjs`
// (scratchpad/ref/ps5-*): a cast-iron street clock on a post, its round case on a
// collar over a long post and a stepped base (Flatbush Avenue); a hurricane lantern
// — a domed cap with a ring, a glass globe between two side tubes, a fuel tank and a
// wire bail (Kerosene lamp, Commons); a slatted wooden fruit crate, corner posts and
// three boards with gaps between (Wooden crate drawers); a leather suitcase with a
// handle on its top edge, a lid seam, two latches and capped corners (Belber
// suitcase; AM 2001.25.1142); a gorse bush, a dark spiny mound starred all over with
// yellow (Bucksburn, Aberdeen); and a lemon drizzle cake, golden sponge with white
// icing run over its edge (Gibberd Garden; Natural History Museum café).
// ─────────────────────────────────────────────────────────────────────────────

/** Parts in a named real colour (AP11). */
const ps5N = (k: NaturalKey, ...ps: ObjPart[]): ObjPart[] => ps.map((p) => ({ ...p, nat: k }));
/** Author in real units (an ax × ay box) and hand it to `fit` as the 100-square. */
function ps5In(ax: number, ay: number, parts: readonly ObjPart[]): ObjPart[] {
  const sx = 100 / ax;
  const sy = 100 / ay;
  const s = 100 / Math.min(ax, ay);
  return parts.map((p) => {
    if (p.k === 'bar') return { ...p, x1: p.x1 * sx, y1: p.y1 * sy, x2: p.x2 * sx, y2: p.y2 * sy, t: p.t * s };
    return { ...p, x: p.x * sx, y: p.y * sy, w: p.w * sx, h: p.h * sy, ...(p.k === 'rect' ? { rad: p.rad * s } : null) } as ObjPart;
  });
}

// ── THE FRUIT CRATE THE PROPHET STANDS ON ────────────────────────────────────
//
// REFERENCE (ps5-crate-1): a crate's front is three BOARDS laid across two square
// CORNER POSTS, with dark gaps between the boards where the inside shows, and the
// wood lighter along each board's top edge. Real units, 92 × 26.
const PS5_CRATE: ObjPart[] = ps5In(92, 26, [
  ...ps5N('wood',
    oRect('mass', 46, 13, 92, 26, 0, 1.2),                          // the crate's front
    oRect('face', 89, 13, 6, 26, 0, 1),                             // the right corner post, in shade
  ),
  ...ps5N('seedhead',
    oRect('dark', 46, 9.6, 78, 2.2),                                // the gaps between the boards
    oRect('dark', 46, 17.6, 78, 2.2),
  ),
  oBar('line', 7.6, 1.5, 7.6, 24.5, 0.5),                           // where the posts meet the boards
  oBar('line', 84.4, 1.5, 84.4, 24.5, 0.5),
  oBar('lit', 10, 1.8, 82, 1.8, 0.8),                               // light along each board's top
  oBar('lit', 10, 11.4, 82, 11.4, 0.6),
  oBar('lit', 10, 19.4, 82, 19.4, 0.6),
  oBar('line', 30, 5.5, 44, 6.2, 0.35), oBar('line', 52, 14.6, 70, 14, 0.35), // grain
  oBar('line', 20, 22.6, 36, 22.2, 0.35),
]);
export const ps5Crate = (x: number, y: number, w: number, h: number) => fit(PS5_CRATE, x, y, w, h);

// ── A PACKED SUITCASE ────────────────────────────────────────────────────────
//
// REFERENCE (ps5-case-2, ps5-case2-1): wider than it is tall, a leather HANDLE on its
// top edge between two metal LATCHES, a stitched LID SEAM a third of the way down,
// darker leather CAPS on its corners and its right side in shade. Real units, 54 × 46:
// the handle 0–7, the case 6–46. The scene hangs its tag from the handle.
function ps5CaseParts(k: NaturalKey): ObjPart[] {
  return ps5In(54, 46, [
    ...ps5N(k,
      oRect('mass', 27, 4.4, 18, 7.6, 0, 3.4),                      // the handle
      oRect('mass', 27, 26, 54, 40, 0, 4),                          // the case
      oRect('face', 51.4, 26, 5.2, 39, 0, 2),                       // its right side, in shade
    ),
    ...ps5N('ps5Sky', oRect('dark', 27, 5.4, 11, 3, 0, 1.4)),        // the gap under the handle
    ...ps5N('coffee',
      oRect('dark', 4.5, 10.5, 7, 7, 0, 2.5), oRect('dark', 47.5, 10.5, 6, 7, 0, 2.5), // the corner caps
      oRect('dark', 4.5, 41.5, 7, 7, 0, 2.5), oRect('dark', 47.5, 41.5, 6, 7, 0, 2.5),
    ),
    oBar('line', 3, 17, 51, 17, 0.7),                               // the lid seam
    ...ps5N('silver',
      oRect('dark', 13, 17, 4.6, 4.4, 0, 0.8), oRect('dark', 41, 17, 4.6, 4.4, 0, 0.8), // the latches
    ),
    oBar('lit', 6, 7.4, 46, 7.4, 1),                                // light along the lid's top
    oBar('lit', 3.4, 12, 3.4, 40, 0.8),                             // and down its lit end
  ]);
}
const PS5_CASE_TAN = ps5CaseParts('ps5CaseTan');
const PS5_CASE_RED = ps5CaseParts('ps5CaseRed');
const PS5_CASE_GREEN = ps5CaseParts('ps5CaseGreen');
export const ps5CaseTan = (x: number, y: number, w: number, h: number) => fit(PS5_CASE_TAN, x, y, w, h);
export const ps5CaseRed = (x: number, y: number, w: number, h: number) => fit(PS5_CASE_RED, x, y, w, h);
export const ps5CaseGreen = (x: number, y: number, w: number, h: number) => fit(PS5_CASE_GREEN, x, y, w, h);
/** Where a case's tag hangs from: the middle of its handle, in its own 54 × 46 units. */
export const PS5_CASE_HANDLE = { x: 27, y: 6.4, w: 54, h: 46 } as const;

// ── A LANTERN ON A SHEPHERD'S HOOK ───────────────────────────────────────────
//
// REFERENCE (ps5-lantern-3): a hurricane lantern is a DOMED CAP with a ring on top,
// a GLASS GLOBE held between two SIDE TUBES, a round fuel TANK under it, and a wire
// BAIL to carry it by. Here it hangs by its bail from an iron pole bent over into a
// hook. The flame and its glow are the scene's, at `PS5_GLOBE`. Real units, 34 × 88.
const PS5_LANTERN: ObjPart[] = ps5In(34, 88, [
  ...ps5N('ps5Iron',
    oBar('mass', 6, 87, 6, 5, 2.4),                                 // the pole
    oBar('mass', 6, 5, 18, 3, 2.2),                                 // bent over
    oBar('mass', 18, 3, 24, 7, 2),                                  // into the hook
  ),
  ...ps5N('ps5Lantern',
    oEll('mass', 24, 18, 15, 5),                                    // the domed cap
    oRect('mass', 24, 21.4, 9, 3, 0, 1),                            // the chimney collar
    oBar('mass', 16.6, 22, 16.6, 41, 1.8),                          // the side tubes
    oBar('mass', 31.4, 22, 31.4, 41, 1.8),
    oRect('mass', 24, 43.2, 17, 6, 0, 2),                           // the fuel tank
  ),
  ...ps5N('ps5Glow', oEll('dark', 24, 31.6, 12, 15)),                // the globe, lit from inside
  oBar('line', 24, 8, 16.6, 21, 0.6),                               // the wire bail, from the hook
  oBar('line', 24, 8, 31.4, 21, 0.6),
  oEll('line', 24, 14.6, 3, 2.4),                                   // the ring on the cap
  oBar('lit', 20.4, 26, 20.4, 36, 0.9),                             // a glint down the glass
  oBar('lit', 4.8, 12, 4.8, 84, 0.6),                               // light down the pole
]);
export const ps5Lantern = (x: number, y: number, w: number, h: number) => fit(PS5_LANTERN, x, y, w, h);
/** The middle of the lantern's globe, where its flame burns, in its own 34 × 88 units. */
export const PS5_GLOBE = { x: 24, y: 32, w: 34, h: 88 } as const;

// ── THE STREET CLOCK ON ITS POST ─────────────────────────────────────────────
//
// REFERENCE (ps5-clock-1): a cast-iron street clock — a CREST over a round CASE, a
// cream DIAL in a deep rim with the hours marked, a COLLAR under the case, a long
// POST with a ring a third of the way down, and a stepped BASE. Its hands are the
// scene's, because they move. Real units, 44 × 170; the dial's centre is PS5_DIAL.
const PS5_CLOCK: ObjPart[] = ps5In(44, 170, [
  ...ps5N('ps5Iron',
    oTri('mass', 22, 6, 12, 9, 'up'),                               // the crest
    oEll('mass', 22, 11.4, 7, 5),                                   // its scroll
    oEll('mass', 22, 31, 40, 40),                                   // the case round the dial
    oRect('mass', 22, 54, 14, 7, 0, 1.4),                           // the collar under it
    oRect('mass', 22, 110, 7, 106),                                 // the post
    oRect('mass', 22, 96, 11, 4, 0, 1),                             // the ring on the post
    oRect('mass', 22, 160, 15, 10, 0, 1.2),                         // the base
    oRect('mass', 22, 167, 22, 6, 0, 1.2),                          // its foot
    oRect('face', 24.8, 110, 1.6, 104),                             // the post's far side
    oRect('face', 27.6, 160, 2.4, 10),                              // the base's side
    oEll('dark', 22.6, 31.6, 34, 34),                               // the rim's inner edge
  ),
  ...ps5N('dialCream', oEll('dark', 22, 31, 29, 29)),               // the dial
  ...Array.from({ length: 12 }, (_, i) => {
    const a = (i * Math.PI) / 6;
    const r0 = i % 3 === 0 ? 10 : 11.4;
    return oBar('line', 22 + Math.sin(a) * r0, 31 - Math.cos(a) * r0, 22 + Math.sin(a) * 13.4, 31 - Math.cos(a) * 13.4, i % 3 === 0 ? 1.5 : 0.8);
  }),
  oBar('lit', 20.4, 60, 20.4, 152, 0.8),                            // light down the post
  oBar('lit', 8, 18, 12, 13, 1),                                    // and on the case's lit shoulder
]);
export const ps5Clock = (x: number, y: number, w: number, h: number) => fit(PS5_CLOCK, x, y, w, h);
/** The dial's centre and radius, in the clock's own 44 × 170 units. */
export const PS5_DIAL = { x: 22, y: 31, r: 14.5, w: 44, h: 170 } as const;

// ── THE GORSE BUSH ───────────────────────────────────────────────────────────
//
// REFERENCE (ps5-gorse-3, -1): gorse is a dense, dark, SPINY mound, wider than it is
// tall, its top broken into rounded clumps, and starred all over the upper side with
// small YELLOW flowers in clusters. Real units, 84 × 58.
const PS5_GORSE_FLOWERS: [number, number][] = [
  [10, 30], [14, 25], [19, 21], [24, 17], [28, 22], [33, 12], [38, 15], [42, 10],
  [47, 13], [52, 9], [57, 14], [61, 11], [66, 17], [70, 22], [74, 26], [78, 31],
  [22, 29], [36, 24], [49, 21], [63, 25], [44, 30], [30, 33], [56, 31], [72, 34],
];
const PS5_GORSE: ObjPart[] = ps5In(84, 58, [
  ...ps5N('ps5Gorse',
    oEll('mass', 42, 40, 84, 36),                                   // the mound
    oEll('mass', 18, 30, 32, 28),                                   // its clumps
    oEll('mass', 34, 19, 30, 26),
    oEll('mass', 54, 16, 32, 26),
    oEll('mass', 71, 26, 26, 26),
    oEll('face', 46, 48, 74, 18),                                   // its shaded underside
  ),
  ...PS5_GORSE_FLOWERS.map(([x, y], i) => ps5N('ps5GorseFlower', oEll('dark', x, y, i % 3 ? 3.4 : 4.4, i % 3 ? 3 : 3.8))[0]),
  oBar('line', 6, 26, 2, 22, 0.6), oBar('line', 20, 15, 18, 10, 0.6), // spines out of its edge
  oBar('line', 40, 6, 41, 1.5, 0.6), oBar('line', 62, 6, 65, 2, 0.6),
  oBar('line', 80, 20, 84, 16, 0.6), oBar('line', 30, 8, 27, 4, 0.6),
]);
export const ps5Gorse = (x: number, y: number, w: number, h: number) => fit(PS5_GORSE, x, y, w, h);

// ── THE LEMON CAKE ───────────────────────────────────────────────────────────
//
// REFERENCE (ps5-cake-2): a lemon drizzle cake is a GOLDEN sponge with white ICING
// poured over its top and run down its sides in drips, a few slices of LEMON on top;
// here a round one on a white plate. Real units, 22 × 14, held by its plate at
// `PS5_CAKE_GRIP` (AR2: a cake is carried on its plate).
const PS5_CAKE: ObjPart[] = ps5In(22, 14, [
  ...ps5N('porcelain', oEll('mass', 11, 12.6, 22, 3)),              // the plate
  ...ps5N('ps5Sponge',
    oRect('mass', 11, 8, 18, 8),                                    // the sponge's side
    oEll('mass', 11, 11.6, 18, 3),                                  // its round foot
  ),
  ...ps5N('frosting', oEll('mass', 11, 4.2, 18, 4.4)),              // the iced top
  oRect('lit', 4, 6.6, 2, 3.2, 0, 1), oRect('lit', 8.4, 7, 2, 4.2, 0, 1), // the icing run down
  oRect('lit', 13.6, 6.6, 2, 3, 0, 1), oRect('lit', 17.6, 7, 1.8, 3.8, 0, 0.9),
  ...ps5N('lemon', oEll('dark', 8, 3.6, 4.4, 1.8), oEll('dark', 13.6, 3.4, 4.4, 1.8)), // lemon slices
]);
export const ps5Cake = (x: number, y: number, w: number, h: number) => fit(PS5_CAKE, x, y, w, h);
/** Where the cake is held: under the middle of its plate, in its own 22 × 14 units. */
export const PS5_CAKE_GRIP = { x: 11, y: 14, w: 22, h: 14 } as const;
// ── psych5 OBJECTS END ──

// ── psych5: objects for this lesson go ABOVE this line ──

// ─────────────────────────────────────────────────────────────────────────────
// THE BIG TOP, for Personal Growth lesson 5 (2026-10-03). Drawn against pictures
// fetched with `node scripts/get-reference.mjs` (scratchpad/ref/growth5-*): the Great
// Moscow Circus's low wire at Alstonville (a wire between two chrome stands with disc
// tops and splayed feet, over a ring with a red padded curb and a gold cap), the Circus
// Juventas big top from inside (striped canvas, rigging masts up to the roof, a lamp
// hung over the ring), a referee's whistle (a flat mouthpiece on a round barrel, a ring
// at its end for the cord), gold sequin slippers with their ribbon bow.
// ─────────────────────────────────────────────────────────────────────────────

// ── RING CURB ────────────────────────────────────────────────────────────────
//
// REFERENCE. A circus ring is fenced by a low PADDED CURB in segments, red, with a
// rounded GOLD CAP along its top that riders step over. Real units 400 × 22: the cap's
// top at y 0, the floor at y 22.
const G5_RING_CURB: ObjPart[] = g3In(400, 22, [
  ...g3('g5Curb', oRect('mass', 200, 12.5, 400, 19, 0, 1.5), oRect('face', 200, 19.6, 400, 4.8, 0, 1)),
  ...g3('g5Gold', oRect('mass', 200, 3.2, 400, 6.4, 0, 3)),
  ...[34, 100, 166, 232, 298, 364].map((x) => oBar('line', x, 7, x, 21, 0.8)),
  oBar('lit', 4, 1.6, 396, 1.6, 0.9),
]);
export const g5RingCurb = (x: number, y: number, w: number, h: number) => fit(G5_RING_CURB, x, y, w, h);

// ── RIGGING MAST ─────────────────────────────────────────────────────────────
//
// REFERENCE. A high wire is strung between two MASTS: a chrome pole on a steel foot
// plate, braced under a small wooden PEDESTAL BOARD at the top where the walker stands
// before stepping out. Real units 48 × 250: the board's top at y 0, the floor at y 250.
const G5_MAST: ObjPart[] = g3In(48, 250, [
  ...g3('silver', oBar('mass', 24, 7, 24, 246, 3.6), oBar('mass', 23, 34, 7, 7.5, 1.6), oBar('mass', 25, 34, 41, 7.5, 1.6)),
  ...g3('iron', oRect('mass', 24, 247, 22, 6, 0, 1.2)),
  ...g3('wood', oRect('mass', 24, 3.5, 48, 7, 0, 1), oRect('face', 24, 6.4, 48, 1.4)),
  oBar('lit', 23, 12, 23, 238, 0.8),
]);
export const g5Mast = (x: number, y: number, w: number, h: number) => fit(G5_MAST, x, y, w, h);

// ── RIGGING LADDER ───────────────────────────────────────────────────────────
//
// REFERENCE. The ladder up to a pedestal is straight and narrow — two rails a forearm
// apart, a rung a short step apart all the way up. Real units 16 × 238, laid in the
// middle of a 238-square box so the drawing keeps its proportions at any size (AM5).
const G5_LADDER: ObjPart[] = g3In(238, 238, [
  ...g3('wood',
    oBar('mass', 113, 0.5, 113, 237.5, 2.4), oBar('mass', 125, 0.5, 125, 237.5, 2.4),
    ...Array.from({ length: 16 }, (_, k) => oBar('mass', 113, 10 + k * 14.4, 125, 10 + k * 14.4, 1.8)),
  ),
  oBar('lit', 112.4, 4, 112.4, 234, 0.6),
]);
export const g5Ladder = (x: number, y: number, w: number, h: number) => fit(G5_LADDER, x, y, w, h);

// ── LOW-WIRE STAND ───────────────────────────────────────────────────────────
//
// REFERENCE. The low wire's end stand: a chrome post with a DISC on top where the line
// is made fast, on splayed iron FEET. Real units 14 × 30: the disc at y 2, the floor 30.
const G5_STAND: ObjPart[] = g3In(14, 30, [
  ...g3('silver', oBar('mass', 7, 3, 7, 27, 2.2), oEll('mass', 7, 2.4, 11, 3.2)),
  ...g3('iron', oBar('mass', 7, 25.5, 1.4, 29.4, 1.6), oBar('mass', 7, 25.5, 12.6, 29.4, 1.6)),
  oBar('lit', 6.4, 6, 6.4, 24, 0.5),
]);
export const g5Stand = (x: number, y: number, w: number, h: number) => fit(G5_STAND, x, y, w, h);

// ── MOUNTING BLOCK ───────────────────────────────────────────────────────────
//
// REFERENCE. At the other end of a practice line is a painted MOUNTING BLOCK: two treads,
// gold nosing, a stencilled star, and the line's post at its top corner, so a walker
// steps up, up, and out. Real units 32 × 32: the post's top at y 0, the floor at y 32.
const G5_BLOCK: ObjPart[] = g3In(32, 32, [
  ...g3('g5Block', oRect('mass', 15, 25, 30, 14, 0, 1), oRect('mass', 22, 18, 16, 28, 0, 1), oRect('face', 28.6, 18, 2.8, 28, 0, 0.6)),
  ...g3('g5Gold', oRect('mass', 15, 18.9, 30, 1.8, 0, 0.6), oRect('mass', 22, 4.9, 16, 1.8, 0, 0.6)),
  ...g3('silver', oBar('mass', 30, 1.5, 30, 6, 2), oEll('mass', 30, 1.2, 6.4, 2.4)),
  ...g3('g5Gold', oTri('dark', 7, 24.4, 7, 6.2, 'up'), oTri('dark', 7, 26.4, 7, 6.2, 'down')),
  oBar('lit', 1.4, 20.5, 1.4, 30.5, 0.5),
]);
export const g5Block = (x: number, y: number, w: number, h: number) => fit(G5_BLOCK, x, y, w, h);

// ── PROP TRUNK ───────────────────────────────────────────────────────────────
//
// REFERENCE. A touring prop trunk is a painted plywood box held together by wooden
// BATTENS top and bottom, brass CORNER CAPS, a brass HASP in the middle of the lid's
// edge, a HANDLE on each end, and the show's star stencilled on the front. Real units
// 80 × 44: the front, its top edge at y 0. The lid is drawn on its own: shut, a rounded
// band across the top; open, its blue-lined inside standing up behind the box.
const G5_TRUNK: ObjPart[] = g3In(80, 44, [
  ...g3('g5Trunk', oRect('mass', 40, 22, 80, 44, 0, 2), oRect('face', 74.5, 22, 11, 44, 0, 1.6)),
  ...g3('wood', oRect('mass', 40, 6.5, 80, 4), oRect('mass', 40, 37.5, 80, 4)),
  ...g3('brass',
    oRect('mass', 4.5, 4.5, 9, 9, 0, 1.5), oRect('mass', 75.5, 4.5, 9, 9, 0, 1.5),
    oRect('mass', 4.5, 39.5, 9, 9, 0, 1.5), oRect('mass', 75.5, 39.5, 9, 9, 0, 1.5),
    oRect('mass', 40, 7, 8, 10, 0, 1.2),
  ),
  ...g3('brass', oTri('dark', 24, 21, 10, 9, 'up'), oTri('dark', 24, 24, 10, 9, 'down'),
    oTri('dark', 56, 21, 10, 9, 'up'), oTri('dark', 56, 24, 10, 9, 'down')),
  oEll('line', 40, 8.6, 1.6, 2.4),
  oBar('line', 77, 18, 77, 27, 1.2),
  oBar('lit', 3.2, 12, 3.2, 33, 0.8),
]);
export const g5Trunk = (x: number, y: number, w: number, h: number) => fit(G5_TRUNK, x, y, w, h);
const G5_LID_OPEN: ObjPart[] = g3In(80, 40, [
  ...g3('g5Trunk', oRect('mass', 40, 20, 80, 40, 0, 2.4)),
  ...g3('brass', oRect('mass', 4.5, 4.5, 9, 9, 0, 1.5), oRect('mass', 75.5, 4.5, 9, 9, 0, 1.5)),
  ...g3('g5Lining', oRect('dark', 40, 23, 68, 30, 0, 1)),
  ...[22, 40, 58].map((x) => oBar('lit', x, 10, x, 36, 0.5)),
]);
export const g5LidOpen = (x: number, y: number, w: number, h: number) => fit(G5_LID_OPEN, x, y, w, h);
const G5_LID_SHUT: ObjPart[] = g3In(84, 9, [
  ...g3('g5Trunk', oRect('mass', 42, 4.5, 84, 9, 0, 3.5), oRect('face', 42, 7.6, 82, 2.6, 0, 1)),
  ...g3('brass', oRect('mass', 5, 4.5, 8, 9, 0, 1.5), oRect('mass', 79, 4.5, 8, 9, 0, 1.5), oRect('mass', 42, 6, 8, 6, 0, 1)),
  oBar('lit', 10, 1.6, 74, 1.6, 0.7),
]);
export const g5LidShut = (x: number, y: number, w: number, h: number) => fit(G5_LID_SHUT, x, y, w, h);

// ── ROLLED POSTER, AND THE BILL ON IT ────────────────────────────────────────
//
// REFERENCE. A circus bill comes ROLLED: a long yellow paper tube with a band round it,
// and when it is unrolled a red title band, a star, and the artiste — a tiny figure,
// arms out, on a line. Real units: the tube 10 × 100, the bill 26 × 34.
const G5_POSTER_ROLL: ObjPart[] = g3In(10, 100, [
  ...g3('g5Bill', oRect('mass', 5, 52, 8, 96, 0, 3.5), oRect('face', 7.6, 52, 2.8, 94, 0, 1.2), oEll('mass', 5, 4.4, 8, 3.4)),
  oEll('line', 5, 4.4, 4.6, 1.8),
  oBar('line', 1.4, 62, 8.6, 62, 1),
  oBar('lit', 2.6, 10, 2.6, 92, 0.8),
]);
export const g5PosterRoll = (x: number, y: number, w: number, h: number) => fit(G5_POSTER_ROLL, x, y, w, h);
const G5_POSTER_BILL: ObjPart[] = g3In(26, 34, [
  ...g3('g5Bill', oRect('mass', 13, 17, 26, 34, 0, 0.8)),
  ...g3('posterRed', oRect('mass', 13, 5, 22, 6, 0, 0.6)),
  ...g3('posterRed', oTri('dark', 13, 12.2, 5, 4.4, 'up'), oTri('dark', 13, 13.6, 5, 4.4, 'down')),
  oBar('line', 3, 29, 23, 29, 0.7),                              // the wire
  oEll('line', 13, 18.6, 3.4, 3.4),                              // the walker: a head,
  oBar('line', 13, 20, 13, 25, 1.1),                             // a body,
  oBar('line', 7, 21.6, 19, 21.6, 0.9),                          // arms out,
  oBar('line', 13, 25, 11.4, 29, 0.9), oBar('line', 13, 25, 14.6, 29, 0.9),
]);
export const g5PosterBill = (x: number, y: number, w: number, h: number) => fit(G5_POSTER_BILL, x, y, w, h);

// ── SEQUIN SLIPPERS ──────────────────────────────────────────────────────────
//
// REFERENCE. A walker's soft slippers, covered in SEQUINS that catch the light in
// discs, with a satin bow at the instep; hung up, a pair dangles toe-down by its
// ribbons. Real units 26 × 32: the ribbons' knot at y 1.
const G5_SHOES: ObjPart[] = g3In(26, 32, [
  ...g3('g5Sequin',
    oBar('mass', 13, 1.5, 8, 13, 1.2), oBar('mass', 13, 1.5, 18.4, 15, 1.2),
    oEll('mass', 8, 21, 7, 16, -8), oEll('mass', 18.4, 23, 7, 16, 8),
    oEll('face', 9.6, 22.6, 3.6, 12, -8), oEll('face', 20, 24.6, 3.6, 12, 8),
  ),
  oEll('line', 7.4, 15.4, 4.2, 2.4, -8), oEll('line', 17.8, 17.4, 4.2, 2.4, 8),
  ...[[6.4, 20], [8, 25], [17, 22], [18.6, 27.4]].map(([x, y]) => oEll('lit', x, y, 1.6, 1.6)),
  oEll('lit', 13, 1.8, 2.4, 2),
]);
export const g5Shoes = (x: number, y: number, w: number, h: number) => fit(G5_SHOES, x, y, w, h);

// ── REFEREE'S WHISTLE ────────────────────────────────────────────────────────
//
// REFERENCE. A metal whistle: a flat MOUTHPIECE tube running into a round BARREL with
// the slot cut in its top, and a RING at the barrel's end for the cord. Held by the
// barrel, between the fingers (AR2). Real units 16 × 9; the grip is G5_WHISTLE_GRIP.
const G5_WHISTLE: ObjPart[] = g3In(16, 9, [
  ...g3('silver', oEll('mass', 11, 5, 9, 8), oRect('mass', 4, 3.6, 8, 3.6, 0, 0.8), oEll('face', 12.6, 6, 5, 5.4)),
  oRect('line', 8.4, 2, 2.6, 1.6),
  oEll('line', 14.4, 2.6, 2, 2),
  oEll('lit', 9, 3.4, 1.8, 1.4),
]);
export const g5Whistle = (x: number, y: number, w: number, h: number) => fit(G5_WHISTLE, x, y, w, h);
/** Where the whistle is held: its barrel, in its own 16 × 9 units. The mouthpiece's end is at x 0. */
export const G5_WHISTLE_GRIP = { x: 11, y: 5, w: 16, h: 9 } as const;

// ── RINGMASTER'S CANE ────────────────────────────────────────────────────────
//
// REFERENCE. A ringmaster's cane is a straight WHITE lacquered stick with a gold KNOB for
// the hand and a gold FERRULE at the tip — white so it reads against his black coat.
// Held at the knob (AR2), hanging tip-down. Real units 4 × 28, in the middle of a
// 28-square box so it keeps its proportions (AM5); the grip is G5_CANE_GRIP.
const G5_CANE: ObjPart[] = g3In(28, 28, [
  ...g3('g5Baton', oBar('mass', 14, 3, 14, 26.6, 2.2)),
  ...g3('g5Gold', oEll('mass', 14, 1.8, 4, 4), oBar('mass', 14, 25.8, 14, 27.6, 2.4)),
  oEll('lit', 13.2, 1.1, 1.3, 1.3),
]);
export const g5Cane = (x: number, y: number, w: number, h: number) => fit(G5_CANE, x, y, w, h);
/** Where the cane is held: under its knob, in its own 28-square box. */
export const G5_CANE_GRIP = { x: 14, y: 3, w: 28, h: 28 } as const;

// ── ROPE COIL ────────────────────────────────────────────────────────────────
//
// REFERENCE. The end of a rope laid on a floor is FLAKED into a flat coil: rings of rope
// lying on each other, the hole in the middle showing. Real units 16 × 7.
const G5_COIL: ObjPart[] = g3In(16, 7, [
  ...g3('g5Hemp', oEll('mass', 8, 4.2, 16, 5.6), oEll('face', 9, 5.2, 13, 2.8)),
  ...g3('g5Hemp', oEll('dark', 8, 3.6, 10, 3)),
  ...g3('g5Hemp', oEll('mass', 8, 3.4, 6, 1.6)),
]);
export const g5Coil = (x: number, y: number, w: number, h: number) => fit(G5_COIL, x, y, w, h);

// ── STAGE LAMP ───────────────────────────────────────────────────────────────
//
// REFERENCE. Over the ring hangs a FOLLOWSPOT: a black can on a yoke, its round lens
// pointing down at the sawdust. Real units 18 × 16: the yoke's top at y 0.
const G5_LAMP: ObjPart[] = g3In(18, 16, [
  ...g3('iron', oBar('mass', 9, 0.5, 9, 4.5, 1.6), oRect('mass', 9, 8.4, 11, 9, 0, 2), oRect('face', 12.6, 8.4, 3.8, 9, 0, 1)),
  ...g3('bulbLit', oEll('mass', 9, 13.4, 12, 4)),
  oEll('lit', 7, 13, 4, 1.4),
]);
export const g5Lamp = (x: number, y: number, w: number, h: number) => fit(G5_LAMP, x, y, w, h);

// ── growth5: objects for this lesson go ABOVE this line ──

// ═══ biz5 BEGIN ═══
// biz5 — A BALLOON FIELD AT DAWN (business-foundations-5, "Profit Isn't Cash").
// Every drawing below is authored in REAL stage units (`b5In`) so a scene can lay it
// 1:1, and each part carries the colour the thing really is (AR1).
const b5N = (k: NaturalKey, ...ps: ObjPart[]): ObjPart[] => ps.map((p) => ({ ...p, nat: k }));
/** Author in real units (an ax × ay box) and hand it to `fit` as the 100-square. */
function b5In(ax: number, ay: number, parts: readonly ObjPart[]): ObjPart[] {
  const sx = 100 / ax;
  const sy = 100 / ay;
  const s = 100 / Math.min(ax, ay);
  return parts.map((p) => {
    if (p.k === 'bar') return { ...p, x1: p.x1 * sx, y1: p.y1 * sy, x2: p.x2 * sx, y2: p.y2 * sy, t: p.t * s };
    return { ...p, x: p.x * sx, y: p.y * sy, w: p.w * sx, h: p.h * sy, ...(p.k === 'rect' ? { rad: p.rad * s } : null) } as ObjPart;
  });
}

// ── A HOT-AIR BALLOON'S ENVELOPE, ONE BAND OF GORES AT A TIME ───────────────
//
// REFERENCE (Commons: "Cappadocia Balloon Inflating", "Leon hot air balloon festival
// 2010"). An envelope is an inverted teardrop: a sphere on top and, below its widest
// point, a CONE whose sides run TANGENT to the sphere down to a narrow mouth, about a
// quarter of the width across. It is sewn from vertical GORES, and seen side-on the
// gores at the edge are foreshortened — the bands get NARROWER toward the outline.
//
// So the envelope is drawn as nested bands, each the same sphere-and-cone squeezed
// sideways by `f` (about the cosine of a gore's angle from the viewer: 1, 0.9, 0.7,
// 0.38), each in its own colour. A scene lays them as separate drawings, the inner ones
// with a thin outline, and those outlines are the seams (the load tapes) between gores.
//
// The cone is TANGENT, not guessed: from a mouth 44 wide at y 152 to a sphere 170 × 132
// centred at y 66, the tangent points fall at y 106.3, ±67.3 — so the union has no
// kink where the cone meets the sphere. Real units 170 × 152; the mouth is the bottom.
export const B5_ENV = { w: 170, h: 152 } as const;
function b5BandParts(f: number, k: NaturalKey): ObjPart[] {
  return b5In(B5_ENV.w, B5_ENV.h, b5N(k,
    oEll('mass', 85, 66, 170 * f, 132),
    ...trapezoid('mass', 85, 129.15, 134.6 * f, 44 * f, 45.7),
  ));
}
export const b5Envelope = (x: number, y: number, w: number, h: number, f = 1, k: NaturalKey = 'b5Red') =>
  fit(b5BandParts(f, k), x, y, w, h);

// ── THE SCOOP AND ITS CABLES ────────────────────────────────────────────────
//
// REFERENCE (the same, and "Top.view.of.basket.bath.arp", a basket laid on its side
// with its burner frame). Below the mouth hangs a short dark SKIRT of fabric, and from
// it steel cables run down to the corners of the burner frame. Real units 70 × 52:
// the skirt is the top 12, the cables the rest, ending on the frame's two corners.
const B5_SKIRT: ObjPart[] = b5In(70, 52, [
  ...b5N('b5Skirt', ...trapezoid('mass', 35, 6, 38, 33, 12)),
  ...b5N('b5Skirt', oEll('dark', 35, 11, 28, 2.2)),            // the mouth, open, in shadow
  oBar('line', 17.5, 11.5, 2, 51.5, 0.9),                       // the cables, to the frame's
  oBar('line', 52.5, 11.5, 68, 51.5, 0.9),                      // two corners
  oBar('line', 26, 12, 22, 51.5, 0.7),                          // and the two behind them
  oBar('line', 44, 12, 48, 51.5, 0.7),
]);
export const b5Skirt = (x: number, y: number, w: number, h: number) => fit(B5_SKIRT, x, y, w, h);

// ── THE BASKET ──────────────────────────────────────────────────────────────
//
// REFERENCE ("Basket with burner (1)"). Woven rattan, tan, in horizontal ROWS of weave;
// a fat padded RIM in dark leather along the top; a band of white SUEDE round the foot
// with rope handles looped over it; and square STEP HOLES in the side, each with a grey
// bar across, which is how people climb in. A big passenger basket is about three metres
// long and waist-high, which at this figure's scale is 150 × 32.
const B5_BASKET: ObjPart[] = b5In(150, 32, [
  ...b5N('wicker',
    oRect('mass', 75, 17, 150, 30, 0, 3),                        // the woven body
    oRect('face', 144.5, 18, 11, 26, 0, 2),                      // its end, turned from the lamp
    oBar('dark', 4, 11.5, 139, 11.5, 1.1),                       // the rows of weave
    oBar('dark', 4, 17, 139, 17, 1.1),
    oBar('dark', 4, 22.5, 139, 22.5, 1.1),
  ),
  ...b5N('b5Suede', oRect('mass', 75, 28.6, 149, 6.4, 0, 2.4)),  // the suede band at the foot
  ...b5N('b5Saddle', oRect('mass', 75, 3.4, 150, 6.8, 0, 3.2)),  // the padded leather rim
  ...b5N('felt', oRect('dark', 20, 15.5, 10, 7, 0, 1)),          // a step hole
  ...b5N('castor', oBar('dark', 16.4, 18.2, 23.6, 18.2, 1.6)),   // and its bar
  ...[24, 62, 100].flatMap((x) => [                              // rope handles over the suede
    oBar('line', x, 26.4, x + 4, 29.4, 0.8), oBar('line', x + 4, 29.4, x + 8, 26.4, 0.8),
  ]),
]);
export const b5Basket = (x: number, y: number, w: number, h: number) => fit(B5_BASKET, x, y, w, h);
/**
 * The basket's FAR side, seen over the near rim from a little above: its padded back
 * rim, and the shaded wicker of the inside wall below it. Real units 150 × 14, drawn
 * behind the near wall so the basket reads as a box with an inside, not a slab.
 */
const B5_BASKET_BACK: ObjPart[] = b5In(150, 14, [
  ...b5N('b5Saddle', oRect('mass', 75, 3, 140, 5.6, 0, 2.6)),   // the far rim
  ...b5N('wicker', oRect('face', 75, 9.5, 136, 9, 0, 1)),        // the inside of the far wall
  ...b5N('wicker', oBar('dark', 9, 10, 141, 10, 0.9)),           // a row of its weave
]);
export const b5BasketBack = (x: number, y: number, w: number, h: number) => fit(B5_BASKET_BACK, x, y, w, h);

// ── THE BURNER AND ITS FRAME ────────────────────────────────────────────────
//
// REFERENCE (the same). Padded UPRIGHTS lean in from the basket's corners to a
// stainless FRAME over the middle; on the frame sits the BURNER, a drum of coiled steel
// tube, and under the frame hangs the blast valve's lever, which the pilot pulls.
// Real units 150 × 76: the rim is the bottom edge, the frame bar at y 20.
const B5_FRAME: ObjPart[] = b5In(150, 76, [
  ...b5N('b5Saddle',
    oBar('face', 18, 66, 46, 20, 2.6),                            // the far uprights, behind
    oBar('face', 132, 66, 104, 20, 2.6),
  ),
  ...b5N('b5Saddle',
    oBar('mass', 6, 75, 44, 20, 3.6),                             // the near uprights
    oBar('mass', 144, 75, 106, 20, 3.6),
  ),
  ...b5N('silver',
    oBar('mass', 42, 20, 108, 20, 3),                             // the frame
    oRect('mass', 75, 10.5, 30, 17, 0, 3),                        // the burner's coil drum
    oRect('mass', 75, 2.2, 14, 4, 0, 1.2),                        // its jet cap
    oBar('dark', 62, 6.5, 88, 6.5, 1.1),                          // the coils
    oBar('dark', 62, 10.5, 88, 10.5, 1.1),
    oBar('dark', 62, 14.5, 88, 14.5, 1.1),
  ),
  oBar('line', 68, 21.5, 63, 40, 1.4),                            // the blast valve's lever
]);
export const b5Frame = (x: number, y: number, w: number, h: number) => fit(B5_FRAME, x, y, w, h);

// ── A PROPANE CYLINDER ──────────────────────────────────────────────────────
//
// REFERENCE (the delivered kind: a tall steel bottle in red paint). A straight body with
// a DOMED shoulder, a steel GUARD COLLAR on top with a hand-hole in it (which is where it
// is lifted), the valve inside the collar, a paper label and a foot ring. Real units
// 12 × 40.
const b5CylParts = (k: NaturalKey): ObjPart[] => b5In(12, 40, [
  ...b5N(k,
    oRect('mass', 6, 23, 12, 34, 0, 3),                           // the body
    oEll('mass', 6, 8.5, 12, 8),                                  // the domed shoulder
    oRect('face', 10.3, 24, 3.4, 30, 0, 1.4),                     // its side, from the lamp
    oRect('dark', 6, 38.8, 12, 2.4, 0, 0.8),                      // the foot ring
  ),
  ...b5N('silver',
    oRect('mass', 6, 3.2, 8, 6.4, 0, 1.5),                        // the guard collar
    oRect('dark', 6, 3, 4.4, 2.6, 0, 1),                          // its hand-hole
  ),
  oRect('lit', 5.4, 22, 8, 6, 0, 0.6),                            // the label
]);
/** `k` the cylinder's paint: the delivered ones red, the balloon's own in bare steel. */
export const b5Cylinder = (x: number, y: number, w: number, h: number, k: NaturalKey = 'b5Gas') => fit(b5CylParts(k), x, y, w, h);

// ── A SACK TRUCK ────────────────────────────────────────────────────────────
//
// REFERENCE ("Hand-truck"). Two steel rails in one piece with the handle, rubber GRIPS
// at the top, a flat NOSE PLATE at the foot that the load stands on, and two pneumatic
// WHEELS behind the rails with coloured hubs. Side-on, upright, the nose to the left.
// Real units 26 × 52; the axle at (20, 44.5).
const B5_TRUCK: ObjPart[] = b5In(26, 52, [
  ...b5N('b5Truck',
    oBar('mass', 16.5, 6, 14.6, 49, 2.6),                         // the rail
    oBar('mass', 14.6, 50.4, 1.2, 50.4, 2.2),                     // the nose plate
    oBar('mass', 15, 33, 20, 43, 1.6),                            // the axle strut
  ),
  ...b5N('tyre', oBar('mass', 16.6, 6.5, 19.6, 1.4, 3)),         // the grip
  ...b5N('tyre', oEll('mass', 20, 44.5, 13, 13)),                // the wheel
  ...b5N('b5Hub', oEll('mass', 20, 44.5, 6, 6)),                 // its hub
  oEll('line', 20, 44.5, 1.8, 1.8),
]);
export const b5Trolley = (x: number, y: number, w: number, h: number) => fit(B5_TRUCK, x, y, w, h);
/** The axle and the grip, in the truck's own units. */
export const B5_AXLE = { x: 20, y: 44.5 } as const;
export const B5_GRIP = { x: 18.2, y: 3.6 } as const;

// ── A CHALKBOARD ON AN EASEL ────────────────────────────────────────────────
//
// REFERENCE (a sign easel, as at a field's gate). Two front legs splay from an apex and
// a third leg props it from behind; the board, a slate in a wooden frame, rests on a
// TRAY across the legs, which is also where the chalk lies. Real units 88 × 96.
const B5_EASEL: ObjPart[] = b5In(88, 96, [
  ...b5N('oak',
    oBar('face', 46, 6, 46, 93, 3),                               // the back leg
    oBar('mass', 38, 2, 8, 95, 3.4),                              // the front legs
    oBar('mass', 50, 2, 80, 95, 3.4),
    oRect('mass', 44, 37, 80, 60, 0, 2),                          // the board's frame
  ),
  ...b5N('slate', oRect('mass', 44, 37, 74, 54, 0, 1)),          // the slate
  ...b5N('oak', oRect('mass', 44, 69.5, 86, 5, 0, 1.5)),         // the tray
]);
export const b5Easel = (x: number, y: number, w: number, h: number) => fit(B5_EASEL, x, y, w, h);

// ── A CASH TIN, AND ITS LID ─────────────────────────────────────────────────
//
// REFERENCE (a cash box: enamelled steel, wider than tall, a KEYHOLE in a bright
// escutcheon, a lid hinged at the back with a folding bail HANDLE). Real units 24 × 14,
// the lid 24 × 12, drawn about its hinge so a scene can stand it up.
const B5_TIN: ObjPart[] = b5In(24, 14, [
  ...b5N('b5Tin',
    oRect('mass', 12, 8.6, 24, 10.8, 0, 1.6),                     // the box's front
    oRect('mass', 12, 3.4, 23, 4, 0, 1.2),                        // its top edges
    oRect('face', 22.6, 8.8, 2.8, 9.6, 0, 1),                     // its end, from the lamp
  ),
  ...b5N('felt', oRect('dark', 12, 3.2, 20, 2.2, 0, 0.8)),       // the dark well inside
  oBar('lit', 1.6, 4.9, 22.4, 4.9, 0.8),                          // the lit front rim
  oRect('lit', 12, 9.2, 5, 5.2, 0, 1),                            // the escutcheon
  oEll('line', 12, 8.5, 1.6, 1.6), oBar('line', 12, 9, 12, 10.8, 0.9), // and its keyhole
]);
export const b5Tin = (x: number, y: number, w: number, h: number) => fit(B5_TIN, x, y, w, h);
const B5_TIN_LID: ObjPart[] = b5In(24, 12, [
  ...b5N('b5Tin', oRect('mass', 12, 7.6, 24, 8.8, 0, 1.4)),      // the lid
  ...b5N('felt', oRect('dark', 12, 8, 19, 5.2, 0, 1)),           // its underside, in shadow
  oBar('line', 7.5, 3.6, 7.5, 1, 0.9), oBar('line', 7.5, 1, 16.5, 1, 0.9), oBar('line', 16.5, 1, 16.5, 3.6, 0.9),
]);
export const b5TinLid = (x: number, y: number, w: number, h: number) => fit(B5_TIN_LID, x, y, w, h);

// ── AN UMBRELLA: ITS CANOPY, AND ITS SHAFT AND CROOK ────────────────────────
//
// REFERENCE (a gentleman's umbrella, open, in navy). Side-on the open canopy is a shallow
// DOME, rounded at the top, whose lower edge is SCALLOPED where the cloth sags between
// the rib tips; a ferrule pokes through at the apex. The shaft runs down to a wooden
// CROOK. Drawn in two pieces so a scene can furl the canopy round the shaft.
// Canopy real units 46 × 18 (apex at the top centre); shaft 10 × 50 (apex at the top).
const B5_CANOPY: ObjPart[] = b5In(46, 18, [
  ...b5N('umbNavy',
    oTri('mass', 23, 11, 46, 14, 'up'),                           // the dome's flanks
    oEll('mass', 23, 7, 30, 12),                                  // rounded over the top
    oEll('mass', 5.75, 16.4, 11.5, 3), oEll('mass', 17.25, 16.4, 11.5, 3),
    oEll('mass', 28.75, 16.4, 11.5, 3), oEll('mass', 40.25, 16.4, 11.5, 3),
    oBar('dark', 23, 3, 11.5, 16, 0.7),                           // two ribs
    oBar('dark', 23, 3, 34.5, 16, 0.7),
  ),
  oBar('line', 23, 0.4, 23, 2.4, 1),                              // the ferrule
]);
export const b5Canopy = (x: number, y: number, w: number, h: number) => fit(B5_CANOPY, x, y, w, h);
// (Authored in a 50-square, the shaft down its middle, so a bar keeps its weight in any box.)
const B5_UMB_SHAFT: ObjPart[] = b5In(50, 50, [
  ...b5N('silver', oBar('mass', 25, 0.8, 25, 43, 1.4)),          // the shaft
  ...b5N('wood',
    oBar('mass', 25, 42, 25, 46.8, 2.4),                          // the crook, curling up
    oBar('mass', 25, 46.8, 26.8, 48.8, 2.4),
    oBar('mass', 26.8, 48.8, 28.8, 48.2, 2.4),
    oBar('mass', 28.8, 48.2, 29, 45.8, 2.4),
  ),
]);
export const b5UmbShaft = (x: number, y: number, w: number, h: number) => fit(B5_UMB_SHAFT, x, y, w, h);
/** Where the hand holds the shaft, in its own units: just above the crook. */
export const B5_UMB_GRIP = { x: 25, y: 43.4 } as const;

// ── A COAT BUTTON ───────────────────────────────────────────────────────────
// REFERENCE: a round button with a raised rim and FOUR holes. Real units 6 × 6.
const B5_BUTTON: ObjPart[] = b5In(6, 6, [
  ...b5N('b5Button', oEll('mass', 3, 3, 6, 6), oEll('dark', 3, 3, 4, 4)),
  oEll('line', 2.3, 2.3, 0.9, 0.9), oEll('line', 3.7, 2.3, 0.9, 0.9),
  oEll('line', 2.3, 3.7, 0.9, 0.9), oEll('line', 3.7, 3.7, 0.9, 0.9),
]);
export const b5Button = (x: number, y: number, w: number, h: number) => fit(B5_BUTTON, x, y, w, h);

// ── biz5: objects for this lesson go ABOVE this line ──

// ── econ5 objects (begin) ──
// ─────────────────────────────────────────────────────────────────────────────
// economics-foundations-5 — A MEDIEVAL TOWN HALL AT DUSK, AND A CELLAR FULL OF RATS.
//
// Drawn against pictures fetched with `npm run ref` (scratchpad/ref/econ5-*): a brown rat
// side-on and close up (Rattus norvegicus — a long low body, a blunt pointed snout, small
// round pink-lined ears, a bead eye, and a bare pinkish tail as long as the body); a
// trapdoor in a floor, its lid standing up on its back hinge over the dark hole; a Russian
// money cover's red wax seal (an uneven blob with a raised ring and an emblem in it);
// Lavenham's half-timbered houses (cream plaster between close-set dark studs, a tiled
// roof, a brick chimney); a village well; a savoy cabbage. Each is authored in REAL STAGE
// UNITS and laid into its box by `fit`, like econ4's.
// ─────────────────────────────────────────────────────────────────────────────

/** Parts in a named real colour (AP11). */
const e5N = (k: NaturalKey, ...ps: ObjPart[]): ObjPart[] => ps.map((p) => ({ ...p, nat: k }));
/** Author in real units (an ax × ay box) and hand it to `fit` as the 100-square. */
function e5In(ax: number, ay: number, parts: readonly ObjPart[]): ObjPart[] {
  const sx = 100 / ax;
  const sy = 100 / ay;
  const s = 100 / Math.min(ax, ay);
  return parts.map((p) => {
    if (p.k === 'bar') return { ...p, x1: p.x1 * sx, y1: p.y1 * sy, x2: p.x2 * sx, y2: p.y2 * sy, t: p.t * s };
    return { ...p, x: p.x * sx, y: p.y * sy, w: p.w * sx, h: p.h * sy, ...(p.k === 'rect' ? { rad: p.rad * s } : null) } as ObjPart;
  });
}
/**
 * The same for a LONG thing (a rat, a tail): authored in its real ax × ay and centred in a
 * square of its longer side, so a stroke's weight scales the same way along and across it
 * at any box — a scene asks for it in a square, the thing's middle at the square's middle.
 */
function e5Sq(ax: number, ay: number, parts: readonly ObjPart[]): ObjPart[] {
  const S = Math.max(ax, ay);
  const ox = (S - ax) / 2;
  const oy = (S - ay) / 2;
  return e5In(S, S, parts.map((p) => (p.k === 'bar'
    ? { ...p, x1: p.x1 + ox, y1: p.y1 + oy, x2: p.x2 + ox, y2: p.y2 + oy }
    : { ...p, x: p.x + ox, y: p.y + oy }) as ObjPart));
}

// ── THE RATS ─────────────────────────────────────────────────────────────────
//
// REFERENCE (Commons: "Brown rat (Rattus norvegicus) Drenthe"). Side-on a brown rat is
// LONG AND LOW — a body twice as long as it is deep, the haunch the highest point — with
// a head that tapers to a blunt snout, a small ROUND ear set high and back, a black bead
// eye, pink feet, and a bare scaly TAIL as long again as the body, thick at the root.
// Real 38 × 13, running LEFT, its feet on y 12.6; `stride` swaps the legs.
const ratRunParts = (stride: number): ObjPart[] => {
  const f = stride ? 1 : -1;
  return e5Sq(38, 13, [
    ...e5N('e5RatPink',
      oBar('mass', 21, 7.8, 27, 9.6, 1.6), oBar('mass', 27, 9.6, 32.6, 9.7, 1.15), oBar('mass', 32.6, 9.7, 37.2, 8.3, 0.75),
      oBar('mass', 7.4 + f * 1.8, 11.4, 6.6 + f * 3, 12.5, 1), oBar('mass', 18.6 - f * 2.4, 11.6, 18.2 - f * 3.6, 12.6, 1.2),
    ),
    ...e5N('e5Rat',
      oEll('mass', 14, 6.8, 16, 8.4),
      oEll('mass', 19.4, 6.8, 10, 8.6),
      oEll('mass', 6.4, 6.6, 8.8, 6.8, -10),
      oEll('mass', 2.8, 7.8, 5.6, 3.8, -8),
      oEll('mass', 8.4, 3, 3.8, 4),
      oBar('mass', 7.6, 9, 7.4 + f * 1.8, 11.6, 1.5),
      oBar('mass', 19, 9.4, 18.6 - f * 2.4, 11.8, 1.9),
      oEll('face', 14.4, 9.8, 14, 2.6),
    ),
    ...e5N('e5RatPink', oEll('mass', 0.9, 8, 1.8, 1.6), oEll('dark', 8.4, 3.2, 2, 2.3)),
    oEll('line', 5.4, 5.8, 1.4, 1.4),
    oBar('line', 3.4, 7.6, 0.4, 6.2, 0.3), oBar('line', 3.4, 8.1, 0.4, 9.4, 0.3),
    oBar('lit', 9.4, 3.6, 18, 2.9, 0.7),
  ]);
};
export const ratRun = (x: number, y: number, w: number, h: number, stride = 0) => fit(ratRunParts(stride), x, y, w, h);

/**
 * A rat looking up out of a hole, face on: two round ears with pink insides, a head
 * narrowing to the muzzle, a pink nose, bead eyes, whiskers, and its two pink front paws
 * on the rim. Real 16 × 13.
 */
const RAT_PEEK: ObjPart[] = e5In(16, 13, [
  ...e5N('e5Rat',
    oEll('mass', 3.4, 3.2, 5, 5), oEll('mass', 12.6, 3.2, 5, 5),
    oEll('mass', 8, 7, 11, 9),
    oEll('mass', 8, 9.8, 6.4, 4.2),
    oEll('face', 10.8, 8.6, 5, 6.6),
  ),
  ...e5N('e5RatPink',
    oEll('mass', 4, 12, 3.6, 1.8), oEll('mass', 12, 12, 3.6, 1.8),
    oEll('dark', 3.4, 3.4, 2.8, 3), oEll('dark', 12.6, 3.4, 2.8, 3),
    oEll('mass', 8, 11, 2.4, 1.7),
  ),
  oEll('line', 5.7, 6.8, 1.6, 1.8), oEll('line', 10.3, 6.8, 1.6, 1.8),
  oBar('line', 6, 10.6, 1.2, 10, 0.3),
  oBar('line', 10, 10.6, 14.8, 10, 0.3),
  oEll('lit', 6, 4.6, 2.2, 1.2),
]);
export const ratPeek = (x: number, y: number, w: number, h: number) => fit(RAT_PEEK, x, y, w, h);

/** One rat's tail, held up by its root: real 5 × 22, the root at (2.4, 0.8). */
const RAT_TAIL: ObjPart[] = e5Sq(5, 22, e5N('e5RatPink',
  oBar('mass', 2.4, 1, 2.8, 8, 1.6), oBar('mass', 2.8, 8, 1.8, 14, 1.2),
  oBar('mass', 1.8, 14, 2.6, 19, 0.9), oBar('mass', 2.6, 19, 4, 21.2, 0.6),
  oBar('dark', 1.8, 4.2, 3.4, 4.4, 0.4), oBar('dark', 1.6, 10.2, 3, 10.6, 0.35), oBar('dark', 1.6, 16, 2.8, 16.4, 0.3),
));
export const ratTail = (x: number, y: number, w: number, h: number) => fit(RAT_TAIL, x, y, w, h);

// ── THE CATCHER'S BASKET, THE MAYOR'S SACK, A COIN ──────────────────────────
//
// A wicker basket with an arched handle (econ4's trug, taller), the day's tails poking
// up out of it and hanging over its rim: real 20 × 18, held by the top of its handle at
// (10, 2). A hessian sack of silver coins, gathered and tied at the neck with its mouth
// pulled open on the coins: real 22 × 24, held by the neck at (11, 5).
const TAIL_BASKET: ObjPart[] = e5In(20, 18, [
  ...e5N('wicker',
    // the handle, a round hoop of cane (six short bars round a semicircle)
    oBar('mass', 3, 9, 3.94, 5.5, 1.3), oBar('mass', 3.94, 5.5, 6.5, 2.94, 1.3), oBar('mass', 6.5, 2.94, 10, 2, 1.3),
    oBar('mass', 10, 2, 13.5, 2.94, 1.3), oBar('mass', 13.5, 2.94, 16.06, 5.5, 1.3), oBar('mass', 16.06, 5.5, 17, 9, 1.3),
    oRect('mass', 10, 13.4, 17, 9.2, 0, 1.6),
    oRect('mass', 10, 9, 19.6, 2.2, 0, 1),
    oRect('face', 15.4, 13.6, 4, 8.4),
    oBar('dark', 3, 12, 17, 12, 0.5), oBar('dark', 3.6, 15, 16.4, 15, 0.5),
    oBar('dark', 7, 10.4, 7.4, 17.4, 0.4), oBar('dark', 12.4, 10.4, 12, 17.4, 0.4),
  ),
  ...e5N('e5RatPink',
    oBar('mass', 6.2, 8.4, 5.2, 4.8, 0.9), oBar('mass', 5.2, 4.8, 6.6, 3.2, 0.7),
    oBar('mass', 13.6, 8.4, 14.8, 5, 0.9), oBar('mass', 14.8, 5, 13.4, 3.6, 0.7),

  ),
]);
export const tailBasket = (x: number, y: number, w: number, h: number) => fit(TAIL_BASKET, x, y, w, h);

const COIN_SACK: ObjPart[] = e5In(22, 24, [
  ...e5N('e5Hessian',
    oEll('mass', 11, 16.6, 21.4, 14.6),
    oRect('mass', 11, 10, 12, 6, 0, 2),
    oRect('mass', 11, 6, 8.4, 3.4, 0, 1.2),
    oEll('mass', 11, 3.6, 13, 3.6),
    oEll('face', 16.2, 18, 8.4, 10.6),
    oBar('dark', 6.4, 14, 8, 21, 0.5), oBar('dark', 13.4, 12.8, 12.6, 21, 0.5),
  ),
  ...e5N('silver', oEll('mass', 8.2, 2.9, 4.2, 2.4), oEll('mass', 12.8, 2.5, 4.2, 2.4), oEll('mass', 10.6, 1.6, 4, 2.2)),
  oBar('line', 6.6, 7.2, 15.4, 7.2, 0.8),
  oEll('lit', 6.6, 13.6, 3.2, 4.4),
]);
export const coinSack = (x: number, y: number, w: number, h: number) => fit(COIN_SACK, x, y, w, h);

/** A silver penny: real 6 × 6. */
const SILVER_COIN: ObjPart[] = e5In(6, 6, [
  ...e5N('silver', oEll('mass', 3, 3, 6, 6), oEll('dark', 3, 3, 3.8, 3.8)),
  oEll('lit', 2.1, 2.1, 1.6, 1.1),
]);
export const silverCoin = (x: number, y: number, w: number, h: number) => fit(SILVER_COIN, x, y, w, h);

// ── THE ECONOMIST'S LANTERN, THE MAYOR'S CANDLE AND SEAL ────────────────────
//
// A brass hand lantern: a ring to carry it by, a cap, glass panes between four posts with
// the flame inside, a base. Real 12 × 20, held by the ring's top at (6, 0.8). A brass
// candlestick with its tallow candle (the flame is the scene's, so it can flicker): real
// 10 × 26. The mayor's seal: a brass matrix on a turned wooden handle, held by the knob
// at (4, 0.8): real 8 × 15. And the wax a seal leaves: an uneven blob of red with a raised
// ring and a little tower in relief, real 12 × 12.
const HAND_LANTERN: ObjPart[] = e5In(12, 20, [
  ...e5N('brass',
    oBar('mass', 4.2, 3.4, 6, 0.9, 0.9), oBar('mass', 6, 0.9, 7.8, 3.4, 0.9),
    oRect('mass', 6, 4.6, 9.6, 2.6, 0, 1.2),
    oRect('mass', 6, 18, 11, 2.6, 0, 0.8),
  ),
  ...e5N('lampGlow', oRect('mass', 6, 11.4, 8.4, 10.4), oRect('face', 8.9, 11.4, 2.6, 10.4)),
  ...e5N('e5Flame', oEll('mass', 6, 12.2, 3.2, 5.4)),
  ...e5N('brass', oBar('mass', 1.6, 5.8, 1.6, 16.8, 1.2), oBar('mass', 10.4, 5.8, 10.4, 16.8, 1.2)),
  oEll('lit', 5.7, 12.6, 1.2, 2.4),
]);
export const handLantern = (x: number, y: number, w: number, h: number) => fit(HAND_LANTERN, x, y, w, h);

const CANDLESTICK: ObjPart[] = e5In(10, 26, [
  ...e5N('brass', oEll('mass', 5, 24.4, 10, 3), oBar('mass', 5, 24, 5, 18.6, 2.2), oEll('mass', 5, 18, 7.6, 2.4), oEll('face', 7.2, 24.8, 4, 2)),
  ...e5N('e5Tallow', oRect('mass', 5, 11.4, 4.4, 12.4, 0, 0.6), oRect('face', 6.5, 11.4, 1.4, 12.4), oEll('mass', 3.2, 8, 1.4, 3)),
  oBar('line', 5, 5.2, 5, 3.4, 0.5),
]);
export const candlestick = (x: number, y: number, w: number, h: number) => fit(CANDLESTICK, x, y, w, h);

const SEAL_MATRIX: ObjPart[] = e5In(8, 15, [
  ...e5N('wood', oEll('mass', 4, 2.4, 5, 4.4), oBar('mass', 4, 4, 4, 10, 2.4)),
  ...e5N('brass', oRect('mass', 4, 10.6, 6, 1.6, 0, 0.6), oRect('mass', 4, 13, 8, 3.4, 0, 1), oRect('face', 6.4, 13, 3.2, 3.4)),
  oEll('lit', 3, 1.8, 1.4, 1.2),
]);
export const sealMatrix = (x: number, y: number, w: number, h: number) => fit(SEAL_MATRIX, x, y, w, h);

const WAX_SEAL: ObjPart[] = e5In(12, 12, [
  ...e5N('e5Wax',
    oEll('mass', 6, 6.2, 10.6, 10), oEll('mass', 2.2, 7.4, 3.6, 3.4), oEll('mass', 9.8, 4.6, 3.4, 3.6), oEll('mass', 7.2, 10.4, 3.6, 2.8),
    oEll('dark', 6, 6.2, 7, 7),
  ),
  // the tower the town's seal is cut with, pressed into the wax
  oRect('line', 6, 6.9, 2.6, 3.2), oRect('line', 5, 4.9, 0.9, 1.2), oRect('line', 7, 4.9, 0.9, 1.2),
  oBar('lit', 3.2, 3.8, 5.4, 2.4, 0.6),
]);
export const waxSeal = (x: number, y: number, w: number, h: number) => fit(WAX_SEAL, x, y, w, h);

/** A sealed decree's ribbon and seal, pinned to the foot of a proclamation: real 16 × 18. */
const DECREE_SEAL: ObjPart[] = e5In(16, 18, [
  ...e5N('e5Red', oBar('mass', 7, 5, 4.4, 16.6, 2.2), oBar('mass', 9, 5, 11.6, 16.6, 2.2)),
  ...e5N('e5Wax', oEll('mass', 8, 6.4, 11, 10.2), oEll('dark', 8, 6.4, 6.6, 6.6)),
  oRect('line', 8, 6.8, 2.4, 3),
  oBar('lit', 4.6, 3.6, 6.8, 2.2, 0.6),
]);
export const decreeSeal = (x: number, y: number, w: number, h: number) => fit(DECREE_SEAL, x, y, w, h);

// ── THE DRAFT DECREES ────────────────────────────────────────────────────────
//
// A scroll ROLLED, lying on the table's edge: parchment wound round, a wooden knob at
// each end, a red ribbon round the middle — real 48 × 6. And the ROLLER it hangs from
// once it is let fall over the edge — a turned rod with a knob each end, real 52 × 5.
const ROLLED_DRAFT: ObjPart[] = e5In(48, 6, [
  ...e5N('e5Parch', oRect('mass', 24, 3, 41, 5.2, 0, 2.4), oRect('face', 24, 4.7, 41, 1.6)),
  ...e5N('wood', oEll('mass', 2.2, 3, 4.2, 5.8), oEll('mass', 45.8, 3, 4.2, 5.8)),
  ...e5N('e5Red', oRect('mass', 24, 3, 2.6, 6)),
  oBar('line', 6, 1.4, 6, 4.6, 0.3), oBar('line', 42, 1.4, 42, 4.6, 0.3),
]);
export const rolledDraft = (x: number, y: number, w: number, h: number) => fit(ROLLED_DRAFT, x, y, w, h);

const DRAFT_ROLLER: ObjPart[] = e5In(52, 5, [
  ...e5N('wood', oRect('mass', 26, 2.5, 46, 3.2, 0, 1.4), oEll('mass', 2.6, 2.5, 5, 5), oEll('mass', 49.4, 2.5, 5, 5), oRect('face', 26, 3.6, 46, 1)),
  oBar('lit', 6, 1.6, 46, 1.6, 0.5),
]);
export const draftRoller = (x: number, y: number, w: number, h: number) => fit(DRAFT_ROLLER, x, y, w, h);

// ── CABBAGES AND THEIR CRATE ─────────────────────────────────────────────────
//
// REFERENCE (Commons: "Savoy cabbage, Bijuesca"): a savoy is a pale, crinkled HEART cupped
// in darker wrapper leaves that open out round its foot, ribbed from the stalk. Real
// 14 × 13. Its crate: a slatted box of fresh pine with corner posts, real 36 × 22.
const CABBAGE_HEAD: ObjPart[] = e5In(14, 13, [
  ...e5N('leaf', oEll('mass', 3.8, 8.8, 7, 7.4), oEll('mass', 10.2, 8.8, 7, 7.4)),
  ...e5N('e5Cabbage', oEll('mass', 7, 6.4, 10.6, 9.6), oEll('face', 9.6, 7.8, 5.2, 6.8)),
  ...e5N('e5Cabbage', oBar('dark', 7, 11, 5.4, 3.2, 0.45), oBar('dark', 7, 11, 9.2, 3.4, 0.45)),

  oEll('lit', 5, 3.6, 2.6, 1.6),
]);
export const cabbageHead = (x: number, y: number, w: number, h: number) => fit(CABBAGE_HEAD, x, y, w, h);

const VEG_CRATE: ObjPart[] = e5In(36, 22, [
  ...e5N('newWood', oRect('mass', 18, 11, 36, 22, 0, 0.6), oRect('face', 33.4, 11, 5.2, 22)),
  ...e5N('wood', oRect('mass', 2.4, 11, 4.8, 22), oRect('mass', 28.6, 11, 4.4, 22)),
  ...e5N('newWood', oBar('dark', 5, 7.4, 26.4, 7.4, 0.9), oBar('dark', 5, 14.6, 26.4, 14.6, 0.9)),
  oBar('lit', 1, 1, 30, 1, 0.6),
]);
export const vegCrate = (x: number, y: number, w: number, h: number) => fit(VEG_CRATE, x, y, w, h);

// ── THE HALL ─────────────────────────────────────────────────────────────────
//
// REFERENCE (Commons: "Hôtel de ville de Bruxelles, Salle Gothique", and the timber roofs
// of English guildhalls): a great hall's walls of DRESSED STONE under a dark oak TIE BEAM
// that rests on carved stone CORBELS; a town's BANNER hanging from a rod, red with a
// golden tower; iron TORCH SCONCES on the wall; the mayor's table up on a stone DAIS with
// boards laid on top. The tie beam: real 400 × 30, its corbels at x 52 and 348.
const HALL_BEAM: ObjPart[] = e5In(400, 30, [
  ...e5N('stoaBeam', oRect('mass', 200, 7, 400, 12), oRect('face', 200, 12.4, 400, 3)),
  ...e5N('e5Stone',
    oRect('mass', 52, 18.6, 16, 9, 0, 1), oEll('mass', 52, 24, 12, 8),
    oRect('mass', 348, 18.6, 16, 9, 0, 1), oEll('mass', 348, 24, 12, 8),
  ),
  ...e5N('stoaBeam', oBar('dark', 20, 5.6, 120, 5, 0.6), oBar('dark', 160, 8.4, 290, 8, 0.6), oBar('dark', 312, 5.4, 392, 5.8, 0.6)),
  ...e5N('e5Stone', oBar('dark', 46, 26, 58, 26, 0.6), oBar('dark', 342, 26, 354, 26, 0.6)),
  oEll('line', 52, 7, 2.2, 2.2), oEll('line', 348, 7, 2.2, 2.2),
  oBar('lit', 4, 2, 396, 2, 0.8),
]);
export const hallBeam = (x: number, y: number, w: number, h: number) => fit(HALL_BEAM, x, y, w, h);

/** The town's banner: red with a golden tower, a swallowtail foot, on a rod. Real 44 × 84. */
const TOWN_BANNER: ObjPart[] = e5In(44, 84, [
  ...e5N('e5Red',
    oRect('mass', 22, 36, 34, 62),
    oTri('mass', 13.5, 72, 17, 10, 'down'), oTri('mass', 30.5, 72, 17, 10, 'down'),
    oRect('face', 36, 38, 6, 66),
  ),
  ...e5N('brass',
    oRect('mass', 22, 41, 12, 16), oRect('mass', 22, 32.6, 15, 2.6),
    oRect('mass', 16.6, 30, 3, 3.4), oRect('mass', 22, 30, 3, 3.4), oRect('mass', 27.4, 30, 3, 3.4),
    oRect('mass', 22, 61, 34, 2.4),
  ),
  oRect('line', 22, 46, 3.6, 6.4, 0, 1.6), oRect('line', 18.6, 38.6, 1.6, 2.6), oRect('line', 25.4, 38.6, 1.6, 2.6),
  ...e5N('wood', oBar('mass', 2, 4, 42, 4, 2.6)),
  ...e5N('brass', oEll('mass', 1.8, 4, 3.6, 3.6), oEll('mass', 42.2, 4, 3.6, 3.6)),
  oBar('line', 8, 3, 12, 0.4, 0.5), oBar('line', 36, 3, 32, 0.4, 0.5),
]);
export const townBanner = (x: number, y: number, w: number, h: number) => fit(TOWN_BANNER, x, y, w, h);

/**
 * An iron torch sconce: a backplate nailed to the wall, an arm out to a ring, a torch in
 * the ring with its pitch-soaked head at (10.6, 7) (the flame is the scene's). Real 16 × 42.
 */
const WALL_TORCH: ObjPart[] = e5In(16, 42, [
  ...e5N('iron', oRect('mass', 3, 30, 4.4, 14, 0, 1), oBar('mass', 4, 28, 10, 22, 1.6)),
  ...e5N('stoaBeam', oBar('mass', 9.6, 36, 10.6, 9, 2.6)),
  ...e5N('felt', oEll('mass', 10.6, 7.6, 6.2, 5.6)),
  ...e5N('iron', oRect('mass', 10, 21.8, 6.4, 2, 0, 0.8)),
  oEll('line', 3, 26, 1.2, 1.2), oEll('line', 3, 34, 1.2, 1.2),
  oBar('lit', 1.6, 24, 1.6, 36, 0.5),
]);
export const wallTorch = (x: number, y: number, w: number, h: number) => fit(WALL_TORCH, x, y, w, h);

/** The mayor's dais: boards laid on a stone step, real 168 × 22. */
const MAYOR_DAIS: ObjPart[] = e5In(168, 22, [
  ...e5N('coping', oRect('mass', 84, 13, 168, 18, 0, 0.6), oRect('face', 165.6, 13, 4.8, 18)),
  ...e5N('oak', oRect('mass', 84, 2.4, 168, 4.8, 0, 0.8)),
  ...e5N('coping',
    oBar('dark', 2, 13.2, 163, 13.2, 0.6),
    oBar('dark', 34, 5, 34, 13.2, 0.6), oBar('dark', 78, 5, 78, 13.2, 0.6), oBar('dark', 122, 5, 122, 13.2, 0.6),
    oBar('dark', 56, 13.2, 56, 21.6, 0.6), oBar('dark', 100, 13.2, 100, 21.6, 0.6), oBar('dark', 144, 13.2, 144, 21.6, 0.6),
  ),
  ...e5N('oak', oBar('dark', 50, 0.8, 50, 4.4, 0.4), oBar('dark', 112, 0.8, 112, 4.4, 0.4)),
  oBar('lit', 2, 5.8, 160, 5.8, 0.6),
]);
export const mayorDais = (x: number, y: number, w: number, h: number) => fit(MAYOR_DAIS, x, y, w, h);

/**
 * The mayor's heavy oak table: a thick top, an apron with a moulding, turned front legs
 * and a stretcher low between them. Real 154 × 30, its top's top at y 0.
 */
const MAYOR_TABLE: ObjPart[] = e5In(154, 30, [
  ...e5N('wood',
    oRect('mass', 77, 3, 154, 6, 0, 1),
    oRect('mass', 77, 9.4, 140, 7),
    oBar('mass', 9, 12, 9, 29.6, 4.6), oBar('mass', 145, 12, 145, 29.6, 4.6),
    oEll('mass', 9, 20, 7, 5), oEll('mass', 145, 20, 7, 5),
    oBar('mass', 9, 26, 145, 26, 2.4),
    oRect('face', 77, 5.4, 154, 1.4),
    oBar('dark', 20, 9.6, 134, 9.6, 0.6),
  ),
  oBar('lit', 3, 1.2, 150, 1.2, 0.6),
]);
export const mayorTable = (x: number, y: number, w: number, h: number) => fit(MAYOR_TABLE, x, y, w, h);

/**
 * The great doorway's arch, in dressed stone paler than the walls: nine voussoirs round a
 * semicircle (inner radius 50, centre (64, 64)), a keystone, and a jamb each side down to
 * the floor. Real 128 × 128 — the opening is x 14–114, y 14 to the foot.
 */
const ARCH_STONES: ObjPart[] = (() => {
  const ps: ObjPart[] = [];
  for (let k = 0; k < 9; k += 1) {
    const a = (Math.PI * (k + 0.5)) / 9;
    const deg = (-a * 180) / Math.PI;
    ps.push(oRect('mass', 64 + 57 * Math.cos(a), 64 - 57 * Math.sin(a), k === 4 ? 16 : 14, 21, deg, 0.6));
  }
  ps.push(oRect('mass', 7, 96, 14, 64), oRect('mass', 121, 96, 14, 64), oRect('face', 117, 96, 6, 64));
  const joints: ObjPart[] = [];
  for (let k = 1; k < 9; k += 1) {
    const a = (Math.PI * k) / 9;
    joints.push(oBar('dark', 64 + 50.6 * Math.cos(a), 64 - 50.6 * Math.sin(a), 64 + 63.4 * Math.cos(a), 64 - 63.4 * Math.sin(a), 0.7));
  }
  return e5In(128, 128, [
    ...e5N('stoaStone', ...ps),
    ...e5N('stoaStone', ...joints, oBar('dark', 0.6, 86, 13.4, 86, 0.7), oBar('dark', 0.6, 106, 13.4, 106, 0.7),
      oBar('dark', 114.6, 86, 127.4, 86, 0.7), oBar('dark', 114.6, 106, 127.4, 106, 0.7)),
  ]);
})();
export const stoneArch = (x: number, y: number, w: number, h: number) => fit(ARCH_STONES, x, y, w, h);

// ── ACROSS THE STREET ────────────────────────────────────────────────────────
//
// REFERENCE (Commons: "Lavenham — Medieval Half-Timbered Houses"): a jettied house of
// cream plaster between close-set dark oak STUDS, a sill beam and a rail, a clay-tiled
// ROOF in courses, a brick CHIMNEY; here a bakery, its arched door on the left and its
// lit shop window on the right with loaves on the sill. Real 100 × 104: the roof's ridge
// at y 32, the eaves at 50, the door's opening x 12–40 from y 60 to the foot.
const BAKE_HOUSE: ObjPart[] = e5In(100, 104, [
  ...e5N('brick', oRect('mass', 30, 28, 9, 16), oRect('dark', 33, 28, 3, 16)),
  ...e5N('brick', oRect('mass', 30, 20.6, 11.4, 2.6, 0, 0.6)),
  ...e5N('terracotta', oRect('mass', 50, 41, 104, 18), oRect('face', 50, 48.6, 104, 3)),
  ...e5N('stucco', oRect('mass', 50, 77, 100, 54), oRect('face', 50, 51.6, 100, 3.4)),
  ...e5N('terracotta', oBar('dark', 0, 36, 100, 36, 0.6), oBar('dark', 0, 41.4, 100, 41.4, 0.6), oBar('dark', 0, 46, 100, 46, 0.6)),
  ...e5N('brick', oBar('dark', 26, 24, 34, 24, 0.4), oBar('dark', 26, 28.4, 34, 28.4, 0.4), oBar('dark', 26, 32.6, 34, 32.6, 0.4)),
  ...e5N('roofBoard',
    oBar('dark', 0, 54.4, 100, 54.4, 2.4), oBar('dark', 0, 102.4, 100, 102.4, 2.6), oBar('dark', 42, 74, 100, 74, 1.8),
    oBar('dark', 3, 55, 3, 102, 2.2), oBar('dark', 46, 55, 46, 102, 2.2), oBar('dark', 56, 55, 56, 74, 1.8),
    oBar('dark', 68, 55, 68, 74, 1.8), oBar('dark', 80, 55, 80, 74, 1.8), oBar('dark', 92, 55, 92, 74, 1.8),
    oBar('dark', 96.4, 74, 96.4, 102, 2.2), oBar('dark', 50, 74, 62, 55, 1.4),
  ),
  ...e5N('gloom', oRect('mass', 26, 83, 30, 40), oEll('mass', 26, 64, 30, 12)),
  ...e5N('truckGlow', oRect('mass', 74, 87, 32, 18), oRect('face', 74, 94.6, 32, 2.6)),
  ...e5N('crust', oEll('mass', 66, 93.4, 9, 4.6), oEll('mass', 76, 93.2, 9, 5), oEll('mass', 85, 93.6, 7, 4)),
  ...e5N('wood', oRect('mass', 74, 97.6, 36, 2.6, 0, 0.6)),
  oBar('line', 74, 78, 74, 92, 0.6), oBar('line', 58, 85, 90, 85, 0.6),
]);
export const bakeHouse = (x: number, y: number, w: number, h: number) => fit(BAKE_HOUSE, x, y, w, h);

/** The bakery's door: planked, arched, two iron strap hinges and a ring. Real 28 × 42. */
const BAKE_DOOR: ObjPart[] = e5In(28, 42, [
  ...e5N('wood', oRect('mass', 14, 26.5, 28, 31), oEll('mass', 14, 12.4, 28, 24), oRect('face', 24.6, 26.5, 6.8, 31)),
  ...e5N('wood', oBar('dark', 7, 4, 7, 41.4, 0.6), oBar('dark', 14, 1.2, 14, 41.4, 0.6), oBar('dark', 21, 4, 21, 41.4, 0.6)),
  oBar('line', 2, 15, 22, 15, 1.4), oBar('line', 2, 33, 22, 33, 1.4),
  oEll('line', 22.4, 25, 2.6, 2.6), oEll('lit', 22.4, 25, 1.2, 1.2),
]);
export const bakeDoor = (x: number, y: number, w: number, h: number) => fit(BAKE_DOOR, x, y, w, h);

/**
 * REFERENCE (Commons: "Village well, Ford"; and every storybook well): a round DRUM of
 * stone with a capping course, two timber POSTS carrying a WINDLASS with its crank, a
 * little tiled ROOF over it, and a wooden bucket wound up under the roof. Real 48 × 64;
 * the capping's top at y 44.8, where the scene sets the lid (`wellLid`).
 */
const TOWN_WELL: ObjPart[] = e5In(48, 64, [
  ...e5N('wood', oBar('mass', 6, 8, 6, 46, 3.2), oBar('mass', 42, 8, 42, 46, 3.2), oBar('mass', 6, 22, 42, 22, 2.4), oBar('mass', 42, 22, 46.4, 27, 1.4)),
  ...e5N('terracotta', oRect('mass', 24, 5, 48, 8, 0, 1), oRect('face', 24, 8.2, 48, 1.8)),
  ...e5N('terracotta', oBar('dark', 2, 3.4, 46, 3.4, 0.6)),
  ...e5N('wood', ...trapezoid('mass', 24, 31, 8, 6, 6)),
  ...e5N('stepStone', oRect('mass', 24, 55.4, 44, 17.2, 0, 1.6), oRect('mass', 24, 46.6, 47, 3.6, 0, 1.2), oRect('face', 41, 55.4, 6, 17.2)),
  ...e5N('stepStone',
    oBar('dark', 3, 52, 44, 52, 0.6), oBar('dark', 3, 58.4, 44, 58.4, 0.6),
    oBar('dark', 14, 48.4, 14, 52, 0.6), oBar('dark', 30, 48.4, 30, 52, 0.6), oBar('dark', 22, 52, 22, 58.4, 0.6), oBar('dark', 38, 52, 38, 58.4, 0.6),
    oBar('dark', 12, 58.4, 12, 63.6, 0.6), oBar('dark', 30, 58.4, 30, 63.6, 0.6),
  ),
  oBar('line', 24, 22, 24, 28, 0.5), oBar('line', 20.2, 30.2, 27.8, 30.2, 0.6),
  oEll('line', 24, 22, 6, 3.2), oEll('lit', 24, 21.6, 3.4, 1.2),
]);
export const townWell = (x: number, y: number, w: number, h: number) => fit(TOWN_WELL, x, y, w, h);

/** The well's lid: weathered planks with a batten and an iron ring. Real 46 × 6. */
const WELL_LID: ObjPart[] = e5In(46, 6, [
  ...e5N('oldWood', oRect('mass', 23, 3.4, 46, 4.4, 0, 1), oRect('face', 23, 5, 46, 1.4)),
  ...e5N('oldWood', oBar('dark', 12, 1.4, 12, 5.4, 0.5), oBar('dark', 23, 1.4, 23, 5.4, 0.5), oBar('dark', 34, 1.4, 34, 5.4, 0.5)),
  oEll('line', 23, 1.2, 4.4, 2.4), oEll('lit', 23, 1.3, 2.2, 0.9),
]);
export const wellLid = (x: number, y: number, w: number, h: number) => fit(WELL_LID, x, y, w, h);

// ── THE CELLAR HATCH ─────────────────────────────────────────────────────────
//
// REFERENCE (Commons: "Trapdoor"): a square of planks let into the floor, hinged along
// its FAR edge, so it opens by its NEAR edge and stands up on the hinge, showing its
// underside — battens and a brace across the planks — over a dark hole with a ladder
// going down. Seen from where the reader stands the lid lying shut is foreshortened: real
// 50 × 15, narrower at the far edge (46), a ring at its near edge; standing up it shows
// its true height, real 50 × 34. The hole under it is the same 50 × 15.
const HATCH_TOP: ObjPart[] = e5In(50, 15, [
  ...e5N('oak', ...trapezoid('mass', 25, 7.5, 46, 50, 15)),
  ...e5N('oak', oBar('dark', 12.6, 0.6, 11.8, 14.4, 0.5), oBar('dark', 25, 0.6, 25, 14.4, 0.5), oBar('dark', 37.4, 0.6, 38.2, 14.4, 0.5)),
  oBar('line', 4, 4, 46, 4, 1.3), oBar('line', 2.6, 11, 47.4, 11, 1.3),
  oEll('line', 42, 13.2, 4.8, 2.6), ...e5N('oak', oEll('dark', 42, 13.2, 2.8, 1.1)),
  oBar('lit', 3, 1, 47, 1, 0.5),
]);
export const hatchTop = (x: number, y: number, w: number, h: number) => fit(HATCH_TOP, x, y, w, h);

const HATCH_UNDER: ObjPart[] = e5In(50, 34, [
  ...e5N('wood', oRect('mass', 25, 17, 50, 34, 0, 0.6), oRect('face', 46.6, 17, 6.8, 34)),
  ...e5N('wood', oBar('dark', 12.5, 1, 12.5, 33, 0.5), oBar('dark', 25, 1, 25, 33, 0.5), oBar('dark', 37.5, 1, 37.5, 33, 0.5)),
  ...e5N('oak', oBar('mass', 4, 7.4, 44, 7.4, 3.4), oBar('mass', 4, 26.6, 44, 26.6, 3.4), oBar('mass', 7, 25, 41, 9, 2.8)),
  oBar('line', 2.4, 3.2, 2.4, 31, 1.2),
  oBar('lit', 2, 1.4, 44, 1.4, 0.5),
]);
export const hatchUnder = (x: number, y: number, w: number, h: number) => fit(HATCH_UNDER, x, y, w, h);

const CELLAR_HOLE: ObjPart[] = e5In(50, 15, [
  ...e5N('gloom', ...trapezoid('mass', 25, 7.5, 46, 50, 15)),
  ...e5N('e5Stone', oRect('face', 25, 2.4, 45, 4.6)),
  ...e5N('wood', oBar('dark', 18.4, 4, 17.4, 15, 1.2), oBar('dark', 31.6, 4, 32.6, 15, 1.2), oBar('dark', 17.8, 8.6, 32.2, 8.6, 0.9), oBar('dark', 17.4, 12.8, 32.6, 12.8, 0.9)),
]);
export const cellarHole = (x: number, y: number, w: number, h: number) => fit(CELLAR_HOLE, x, y, w, h);

// ── econ5: objects for this lesson go ABOVE this line ──

// ── sci5 BEGIN ──
// ─────────────────────────────────────────────────────────────────────────────
// science-foundations-5 — A SCOTTISH LOCH AT NIGHT. Drawn against Commons photographs
// (scratchpad/ref/sci5-*): a clinker rowing boat, white-painted with a varnished gunwale,
// its sheer rising to a raked stem and its stern cut square (sci5-rowboat2-1, -2); a small
// wooden jetty on a loch, planked deck on round piles, a mooring post at its end
// (sci5-jetty-1); a hurricane lantern — wire bail, vented top, side guard tubes, glass
// globe, fuel tank (sci5-lantern-2); a camera with a long white telephoto lens and black
// rings (sci5-camera-2); a vacuum flask whose cap is its own cup (sci5-flask-2); green
// glass bottles (sci5-bottle2-1). The far shore is Loch Ness from the water (sci5-loch-1).
// ─────────────────────────────────────────────────────────────────────────────

/** Parts in one named real colour. */
const s5N = (k: NaturalKey, ...ps: ObjPart[]): ObjPart[] => ps.map((p) => ({ ...p, nat: k }));
/** Author in real units (an ax × ay box) and hand it to `fit` as the 100-square. */
function sci5In(ax: number, ay: number, parts: readonly ObjPart[]): ObjPart[] {
  const sx = 100 / ax;
  const sy = 100 / ay;
  const s = 100 / Math.min(ax, ay);
  return parts.map((p) => {
    if (p.k === 'bar') return { ...p, x1: p.x1 * sx, y1: p.y1 * sy, x2: p.x2 * sx, y2: p.y2 * sy, t: p.t * s };
    return { ...p, x: p.x * sx, y: p.y * sy, w: p.w * sx, h: p.h * sy, ...(p.k === 'rect' ? { rad: p.rad * s } : null) } as ObjPart;
  });
}

// ── ROWING BOAT ──────────────────────────────────────────────────────────────
//
// REFERENCE. A loch rowing boat, side on, is SHALLOW: its depth is a fifth of its length.
// The sheer (the line of the gunwale) dips amidships and rises at both ends, most at the
// raked stem; the stern is a square transom. Clinker planks overlap, so the side carries
// two or three lap lines that follow the sheer and sweep up into the bow. Painted white
// above the waterline with a dark top strake under a varnished gunwale rail, and red
// antifouling below. Drawn in two halves so the people sit INSIDE it: the far gunwale
// and the varnished inside behind them, the near side in front. Real units, 176 × 34:
// the near gunwale at y 7 amidships, the waterline at 24, the keel at 33.
const S5_BOAT_BACK: ObjPart[] = sci5In(176, 34, [
  ...s5N('wood',
    oRect('face', 88, 6.4, 160, 8, 0, 2),                             // the varnished inside, in shade
    oBar('mass', 8, 2.8, 88, 3.4, 2.4),                               // the far gunwale rail
    oBar('mass', 88, 3.4, 168, 1.2, 2.4),
  ),
]);
export const s5BoatBack = (x: number, y: number, w: number, h: number) => fit(S5_BOAT_BACK, x, y, w, h);

const S5_BOAT_FRONT: ObjPart[] = sci5In(176, 34, [
  ...s5N('s5BoatWhite',
    oRect('mass', 82, 17, 152, 20, 0, 2),                             // the topsides
    oEll('mass', 84, 22, 160, 22),                                    // the round of the bilge
    oTri('mass', 162, 14, 24, 22, 'right'),                          // the bow, pointed
  ),
  ...s5N('s5Antifoul', oEll('face', 84, 29.5, 150, 7)),               // below the waterline
  ...s5N('s5BoatStripe',
    oBar('mass', 5, 6.6, 62, 8.8, 3),                                 // the dark top strake, along the sheer
    oBar('mass', 62, 8.8, 124, 8.8, 3),
    oBar('mass', 124, 8.8, 168, 4.4, 3),
  ),
  ...s5N('wood',
    oBar('mass', 4, 5, 62, 7.2, 1.7),                                 // the varnished gunwale rail
    oBar('mass', 62, 7.2, 124, 7.2, 1.7),
    oBar('mass', 124, 7.2, 170, 2.6, 1.7),
    oBar('mass', 168.5, 3, 173.5, 1.8, 1.8),                          // the stem head
  ),
  ...s5N('brass', oRect('mass', 86, 5.4, 3.4, 3.4, 0, 1)),            // the rowlock
  oBar('line', 7, 15, 130, 15.4, 0.6),                                // the clinker laps, sweeping up
  oBar('line', 130, 15.4, 164, 11, 0.6),                              // into the bow
  oBar('line', 7, 20.6, 136, 21, 0.6),
  oBar('line', 136, 21, 160, 18, 0.6),
  oBar('lit', 14, 11.4, 120, 11.6, 0.8),                              // the lamp along the topsides
]);
export const s5BoatFront = (x: number, y: number, w: number, h: number) => fit(S5_BOAT_FRONT, x, y, w, h);
/** The boat's measures, in its own 176 × 34: gunwale, waterline, the rowlock's x. */
export const S5_BOAT = { gunwale: 7, waterline: 24, keel: 33, rowlock: 86, of: { w: 176, h: 34 } } as const;

// ── JETTY ────────────────────────────────────────────────────────────────────
//
// REFERENCE. A small loch jetty is a planked deck on round timber piles driven into the
// bed, cross-braced under the deck, with a taller post at the end to tie a boat to and a
// rope round it. Weathered silver-grey. Real units, 138 × 96: the post from 0, the deck's
// top at 14, the piles down to 96.
const S5_JETTY: ObjPart[] = sci5In(138, 96, [
  ...s5N('oldWood',
    oRect('face', 20, 58, 5, 76),                                     // the piles
    oRect('face', 64, 58, 5, 76),
    oRect('face', 108, 58, 5, 76),
    oBar('mass', 20, 24, 64, 50, 2.2),                                // the cross braces
    oBar('mass', 64, 24, 108, 50, 2.2),
    oRect('mass', 64, 17, 128, 6, 0, 1),                              // the deck
    oRect('mass', 131, 40, 7, 80, 0, 1.6),                            // the mooring post
  ),
  ...s5N('s5Rope', oEll('mass', 131, 10, 10, 4.4), oEll('mass', 131, 13.4, 10, 4.4)),
  oBar('line', 12, 15, 12, 20, 0.5),                                  // the plank ends
  oBar('line', 34, 15, 34, 20, 0.5),
  oBar('line', 56, 15, 56, 20, 0.5),
  oBar('line', 78, 15, 78, 20, 0.5),
  oBar('line', 100, 15, 100, 20, 0.5),
  oBar('lit', 2, 14.6, 122, 14.6, 0.7),                               // the lamp along the deck's edge
]);
export const s5Jetty = (x: number, y: number, w: number, h: number) => fit(S5_JETTY, x, y, w, h);

// ── HURRICANE LANTERN ────────────────────────────────────────────────────────
//
// REFERENCE. A wire BAIL over a vented top cap; two side TUBES running down to the fuel
// tank, which is also the base; a glass GLOBE between them with a guard wire round it.
// The bail is the field mark — it is how it is carried, hanging. Real units 18 × 32,
// drawn hanging from the top of its bail at (9, 1); the flame sits at the globe's middle.
const S5_LANTERN: ObjPart[] = sci5In(18, 32, [
  ...s5N('s5Lantern',
    oBar('mass', 2.5, 11, 2.5, 27, 1.8),                              // the side tubes
    oBar('mass', 15.5, 11, 15.5, 27, 1.8),
    oEll('mass', 9, 9.6, 15, 4.4),                                    // the top cap
    oRect('mass', 9, 12, 8, 3, 0, 1),
    oEll('mass', 9, 28, 17, 7),                                       // the tank, its base
    oRect('face', 9, 30.4, 16, 3, 0, 1.2),
  ),
  ...s5N('glass', oEll('mass', 9, 19.5, 10, 12)),                     // the globe
  oBar('line', 9, 1, 2.6, 9, 0.8),                                    // the wire bail
  oBar('line', 9, 1, 15.4, 9, 0.8),
  oBar('line', 4, 19.5, 14, 19.5, 0.5),                               // the guard wire
  oBar('lit', 6.4, 16, 6.4, 22, 0.9),
]);
export const s5Lantern = (x: number, y: number, w: number, h: number) => fit(S5_LANTERN, x, y, w, h);
/** Where the lantern hangs from (the top of its bail) and where its flame burns, in its 18 × 32. */
export const S5_LANTERN_AT = { grip: { x: 9, y: 1 }, flame: { x: 9, y: 19.5 }, of: { w: 18, h: 32 } } as const;

// ── CAMERA ───────────────────────────────────────────────────────────────────
//
// REFERENCE. A camera body with its prism hump and grip, and a long telephoto lens in
// off-white with black rubber rings and a wide hood at the front (sci5-camera-2): the
// pale lens is what reads at night. Real units 40 × 16, held at the body (7, 9).
const S5_CAMERA: ObjPart[] = sci5In(40, 16, [
  ...s5N('s5CamBlack',
    oRect('mass', 7, 9.5, 13, 11, 0, 2),                              // the body
    oRect('mass', 6.5, 3.6, 6, 3.4, 0, 1),                            // the prism hump
  ),
  ...s5N('s5Lens',
    oRect('mass', 24, 9, 24, 9, 0, 2),                                // the lens barrel
    oRect('mass', 36.5, 9, 6, 12.5, 0, 2),                            // its hood
  ),
  ...s5N('s5CamBlack',
    oRect('dark', 19, 9, 2.4, 9.4),                                   // the rubber rings
    oRect('dark', 29, 9, 2, 9.4),
  ),
  oEll('line', 39.4, 9, 1.4, 9),                                      // the front glass, edge on
  oBar('lit', 14, 5.6, 33, 5.6, 0.7),
]);
export const s5Camera = (x: number, y: number, w: number, h: number) => fit(S5_CAMERA, x, y, w, h);
export const S5_CAMERA_GRIP = { x: 7, y: 9, of: { w: 40, h: 16 } } as const;

// ── VACUUM FLASK AND ITS CUP ─────────────────────────────────────────────────
//
// REFERENCE. A tall flask whose cap unscrews to be its own cup (sci5-flask-2), in a red
// tartan cover — red with dark green bars both ways. Real units 12 × 32 for the flask,
// held round its middle (6, 19); its stopper's top at (6, 1.5). The cup, 10 × 8, held
// round its body (5, 4.5).
const S5_FLASK: ObjPart[] = sci5In(12, 32, [
  ...s5N('s5Tartan', oRect('mass', 6, 19.5, 11, 25, 0, 2.6)),         // the body, in its cover
  ...s5N('s5TartanBar',
    oRect('dark', 6, 13, 11, 1.8),                                    // the tartan's bars across
    oRect('dark', 6, 20.5, 11, 1.8),
    oRect('dark', 6, 28, 11, 1.8),
    oRect('dark', 3.4, 19.5, 1.5, 24),                                // and down
    oRect('dark', 8.6, 19.5, 1.5, 24),
  ),
  ...s5N('silver', oRect('mass', 6, 5.6, 9.4, 3.2, 0, 1)),            // the shoulder
  ...s5N('s5CamBlack', oRect('mass', 6, 2.6, 6, 3, 0, 0.8)),          // the stopper
  oBar('lit', 2.4, 9, 2.4, 30, 0.7),
]);
export const s5Flask = (x: number, y: number, w: number, h: number) => fit(S5_FLASK, x, y, w, h);
export const S5_FLASK_AT = { grip: { x: 6, y: 19 }, top: { x: 6, y: 1.5 }, of: { w: 12, h: 32 } } as const;

const S5_FLASK_CUP: ObjPart[] = sci5In(10, 8, [
  ...s5N('silver', ...trapezoid('mass', 5, 4.4, 9.4, 7.4, 6.6)),     // the cup, wider at its rim
  ...s5N('silver', oRect('face', 5, 7.2, 7.4, 1.4, 0, 0.5)),
  oEll('lit', 5, 1.2, 9.4, 1.8),                                      // the rim
  oBar('lit', 2.4, 3, 2.8, 6.4, 0.6),
]);
export const s5FlaskCup = (x: number, y: number, w: number, h: number) => fit(S5_FLASK_CUP, x, y, w, h);
export const S5_CUP_AT = { grip: { x: 5, y: 4.5 }, of: { w: 10, h: 8 } } as const;

// ── BOTTLE, ADRIFT ───────────────────────────────────────────────────────────
//
// REFERENCE. A wine bottle lying on its side: a long straight BODY with rounded ends, a
// SHOULDER that swells and narrows, a NECK with a lip ring at its mouth, and a CORK
// standing proud (sci5-bottle2-1). Glass shows its colour on the body and a long highlight
// along the top. Real units 100 × 30, the neck to the right; a rolled message lies along
// the inside of the body (S5_BOTTLE_SCROLL), which the scene writes on.
const s5BottleParts = (k: NaturalKey): ObjPart[] => sci5In(100, 30, [
  ...s5N(k,
    oRect('mass', 39, 15, 74, 28, 0, 10),                             // the body
    oEll('mass', 77, 15, 16, 22),                                     // the shoulder
    oRect('mass', 88, 15, 12, 10, 0, 2),                              // the neck
    oRect('face', 93.6, 15, 3, 12, 0, 1),                             // the lip ring
    oRect('dark', 39, 26.4, 64, 3.2, 0, 1.6),                         // the glass's underside, in shade
  ),
  ...s5N('cork', oRect('mass', 97.3, 15, 5, 8, 0, 1.2)),              // the cork
  oBar('lit', 10, 4.2, 64, 4.2, 1.1),                                 // the long highlight
  oBar('lit', 79, 8.6, 86, 9.8, 0.7),
]);
export const s5Bottle = (x: number, y: number, w: number, h: number, k: NaturalKey = 's5SeaGlass') => fit(s5BottleParts(k), x, y, w, h);
/** The rolled message inside the body, in the bottle's own 100 × 30. */
export const S5_BOTTLE_SCROLL = { x0: 6, y0: 4.6, x1: 72, y1: 25.6, of: { w: 100, h: 30 } } as const;

// ── SONAR ────────────────────────────────────────────────────────────────────
//
// REFERENCE. A fish-finder: a small black case with a dark screen set in it, a row of
// buttons under the screen, on a short swivel stalk and a bracket clamped to the gunwale.
// Its back is a plain ribbed case with the transducer cable coming out. Real units 24 × 24;
// the screen 2.5–21.5 × 2–15, which the scene draws on.
const S5_SONAR: ObjPart[] = sci5In(24, 24, [
  ...s5N('s5CamBlack',
    oRect('mass', 12, 9, 24, 18, 0, 2.6),                             // the case
    oRect('mass', 12, 20, 4, 4),                                      // the swivel stalk
    oRect('face', 12, 22.6, 12, 2.4, 0, 0.8),                         // the bracket
  ),
  ...s5N('s5Screen', oRect('dark', 12, 8.5, 19, 13, 0, 1)),           // the screen, set in
  oEll('lit', 7, 16.4, 1.6, 1.6),                                     // the buttons
  oEll('lit', 12, 16.4, 1.6, 1.6),
  oEll('lit', 17, 16.4, 1.6, 1.6),
]);
export const s5Sonar = (x: number, y: number, w: number, h: number) => fit(S5_SONAR, x, y, w, h);
const S5_SONAR_BACK: ObjPart[] = sci5In(24, 24, [
  ...s5N('s5CamBlack',
    oRect('mass', 12, 9, 24, 18, 0, 2.6),
    oRect('mass', 12, 20, 4, 4),
    oRect('face', 12, 22.6, 12, 2.4, 0, 0.8),
    oRect('dark', 12, 5, 18, 1.4),                                    // the ribs on its back
    oRect('dark', 12, 8.5, 18, 1.4),
    oRect('dark', 12, 12, 18, 1.4),
  ),
  oBar('line', 18, 16, 23, 22, 0.9),                                  // the cable
]);
export const s5SonarBack = (x: number, y: number, w: number, h: number) => fit(S5_SONAR_BACK, x, y, w, h);
export const S5_SONAR_SCREEN = { x0: 2.5, y0: 2, x1: 21.5, y1: 15, of: { w: 24, h: 24 } } as const;

// ── sci5: objects for this lesson go ABOVE this line ──

// ── phil6 OBJECTS BEGIN ──
// ─────────────────────────────────────────────────────────────────────────────
// philosophy-foundations-6 — A VICTORIAN FAIRGROUND AT NIGHT: THE MECHANICAL ORACLE.
//
// REFERENCES (npm run ref): Zoltar fortune machines on the Santa Monica pier and in an
// arcade — a tall wooden cabinet, a GLASS CASE on top holding a turbaned bust with a
// crystal ball before it, a CREST with the machine's name over the glass, gilt-studded
// pillars and mouldings, and a lower cabinet carrying the coin plate and the card slot;
// an old penny fortune machine's lacquered box; steam GALLOPERS at Beamish — white
// painted horses with open mouths, ears up, a carved saddle and a twisted brass pole
// through each; carousels at night (Paris, Columbia) — a striped tent roof, rounding
// boards ringed with bulbs, a scalloped valance, and an inside so lit it glows; apothecary
// sweet jars with a rim and a glint down the glass; humbugs, striped. The fair's own
// colours: lacquer red, gilt, royal-blue velvet, a lit cream, striped canopy red.
// ─────────────────────────────────────────────────────────────────────────────

/** Parts in a named real colour (AP11). */
function ph6N(k: NaturalKey, ...ps: ObjPart[]): ObjPart[] {
  return ps.map((p) => ({ ...p, nat: k }));
}
/** Author in real units (an ax × ay box) and hand it to `fit` as the 100-square. */
function ph6In(ax: number, ay: number, parts: readonly ObjPart[]): ObjPart[] {
  const sx = 100 / ax;
  const sy = 100 / ay;
  const s = 100 / Math.min(ax, ay);
  return parts.map((p) => {
    if (p.k === 'bar') return { ...p, x1: p.x1 * sx, y1: p.y1 * sy, x2: p.x2 * sx, y2: p.y2 * sy, t: p.t * s };
    return { ...p, x: p.x * sx, y: p.y * sy, w: p.w * sx, h: p.h * sy, ...(p.k === 'rect' ? { rad: p.rad * s } : null) } as ObjPart;
  });
}

/**
 * THE MECHANICAL ORACLE's cabinet, the Zoltar way, without the figure in its glass: a
 * gilt finial over an arched pediment, a cornice and a crest panel (the scene sets the
 * name plate on it), the glass case lined in blue velvet under red swags and a gold
 * fringe, gilt pillars either side, a waist moulding, the lower cabinet with a sunk
 * panel, its coin plate and its card slot, the crank's boss on its side, a walnut plinth
 * on brass feet. 88 × 160.
 */
const PH6_CABINET: ObjPart[] = ph6In(88, 160, [
  ...ph6N('brass',
    oEll('mass', 44, 4.5, 7, 7),                                      // the finial
    oRect('mass', 44, 9.5, 2.4, 5),                                   // its stem
  ),
  ...ph6N('ph6Lacquer', oEll('mass', 44, 20, 64, 28)),                // the arched pediment
  ...ph6N('ph6Lacquer',
    oRect('mass', 44, 19.5, 88, 4, 0, 1),                             // the cornice
    oRect('mass', 44, 28.5, 82, 16, 0, 1),                            // the crest panel
    oRect('mass', 44, 68, 80, 62, 0, 1.5),                            // the glass case's frame
    oRect('mass', 44, 124, 80, 42, 0, 1.5),                           // the lower cabinet
    oRect('face', 82, 124, 4, 40),                                    // its side, turned from the lamp
  ),
  ...ph6N('brass',
    oRect('mass', 3.5, 68, 5, 62, 0, 1),                              // gilt pillars either side of the glass
    oRect('mass', 84.5, 68, 5, 62, 0, 1),
    oRect('face', 85.6, 68, 2.8, 60),
    oRect('mass', 44, 101, 88, 4, 0, 1),                              // the waist moulding
    oEll('mass', 86.5, 110, 6, 6),                                    // the crank's boss, on the side
  ),
  ...ph6N('ph6Walnut', oRect('mass', 44, 152.5, 88, 15, 0, 2)),       // the plinth
  ...ph6N('brass', oEll('dark', 44, 21, 52, 20)),                     // the pediment's gilt fan
  ...ph6N('brass', oRect('dark', 44, 28.5, 72, 14, 0, 1)),            // the crest's gilt frame
  ...ph6N('ph6Velvet', oRect('dark', 44, 68, 70, 56, 0, 1)),          // the velvet inside the glass
  ...ph6N('ph6Lacquer', oEll('dark', 20, 41.5, 26, 9), oEll('dark', 44, 40.5, 26, 9), oEll('dark', 68, 41.5, 26, 9)), // red swags
  ...ph6N('brass', oBar('dark', 10, 46, 78, 46, 1.2)),                // and their gold fringe
  ...ph6N('ph6Lacquer', oRect('dark', 42, 124, 66, 32, 0, 2)),        // the sunk front panel
  ...ph6N('brass', oBar('dark', 12, 110.5, 72, 110.5, 0.9), oBar('dark', 12, 137.5, 72, 137.5, 0.9)), // its gilt lining
  ...ph6N('brass', oRect('dark', 22, 118, 13, 13, 0, 1.5)),           // the coin plate
  oRect('line', 22, 118, 1.4, 7, 0, 0.7),                             // its slot
  ...ph6N('brass', oRect('dark', 62, 121, 26, 7, 0, 1.5)),            // the card slot's plate
  oRect('line', 62, 121, 20, 1.8, 0, 0.9),                            // the card slot
  ...ph6N('brass', oRect('dark', 9, 157.5, 10, 4, 0, 1), oRect('dark', 79, 157.5, 10, 4, 0, 1)), // brass feet
  oBar('lit', 3, 17.9, 85, 17.9, 0.7),                                // the lamp along the cornice
  oBar('lit', 6, 99.4, 82, 99.4, 0.6),                                // and the moulding
]);
export const ph6Cabinet = (x: number, y: number, w: number, h: number) => fit(PH6_CABINET, x, y, w, h);
/** Where things are on the cabinet, in its own 88 × 160 units. */
export const PH6_CAB = {
  crest: { x: 44, y: 28.5, w: 66, h: 12 },
  slot: { x: 62, y: 121 },
  boss: { x: 86.5, y: 110 },
  case: { x: 44, y: 68, w: 70, h: 56 },
} as const;

/**
 * The ORACLE himself, from the waist up: a gold satin shirt under a purple waistcoat, a
 * gilt collar and brooch, his painted hands held either side of the crystal ball. 56 × 24.
 */
const PH6_ORACLE: ObjPart[] = ph6In(56, 24, [
  ...ph6N('ph6Satin', ...trapezoid('mass', 28, 14, 36, 54, 20)),      // shoulders sloping out
  ...ph6N('ph6Skin', oEll('mass', 15, 16, 8, 6, -15), oEll('mass', 41, 16, 8, 6, 15)), // his hands
  ...ph6N('ph6Robe', ...trapezoid('dark', 14, 15, 9, 15, 18), ...trapezoid('dark', 42, 15, 9, 15, 18)), // the waistcoat
  ...ph6N('brass', oEll('dark', 28, 6, 13, 5), oEll('dark', 28, 11, 3.4, 3.4)), // collar and brooch
]);
export const ph6Oracle = (x: number, y: number, w: number, h: number) => fit(PH6_ORACLE, x, y, w, h);

/**
 * The Oracle's HEAD, drawn about his neck (bottom middle) so the scene can nod it: a
 * gold turban with a ruby, a painted face, a black moustache and a pointed beard. 22 × 28.
 */
const PH6_HEAD: ObjPart[] = ph6In(22, 28, [
  ...ph6N('ph6Skin', oRect('mass', 11, 25, 6, 6, 0, 2)),              // the neck
  ...ph6N('ph6Skin', oEll('mass', 11, 17, 14, 16)),                   // the face
  ...ph6N('ph6Satin', oEll('mass', 11, 8.5, 21, 12), oEll('mass', 11, 5, 11, 8)), // the turban, and its crown
  ...ph6N('ph6Beard', oEll('mass', 8, 20.6, 6.5, 2.6, -14), oEll('mass', 14, 20.6, 6.5, 2.6, 14)), // the moustache
  ...ph6N('ph6Beard', ...trapezoid('mass', 11, 25, 5, 1.4, 6)),       // the pointed beard
  ...ph6N('ph6Satin', oBar('dark', 3.5, 10.5, 18.5, 6.5, 1.1), oBar('dark', 4.5, 13, 17.5, 9.5, 0.9)), // the turban's folds
  ...ph6N('ph6Heart', oEll('dark', 11, 8.2, 4, 5)),                   // the ruby
  oEll('line', 8.4, 16.2, 1.7, 1.7), oEll('line', 13.6, 16.2, 1.7, 1.7), // eyes
]);
export const ph6OracleHead = (x: number, y: number, w: number, h: number) => fit(PH6_HEAD, x, y, w, h);

/** The CRYSTAL BALL on its brass stand. 20 × 26. */
const PH6_BALL: ObjPart[] = ph6In(20, 26, [
  ...ph6N('brass', ...trapezoid('mass', 10, 22.5, 9, 15, 7)),         // the stand
  ...ph6N('brass', oRect('mass', 10, 18.6, 11, 2.4, 0, 1)),           // its cup
  ...ph6N('ph6Ball', oEll('mass', 10, 9.5, 17, 17)),                  // the ball
  ...ph6N('ph6Ball', oEll('dark', 11.5, 12, 9, 6)),                   // the mist inside it
  oEll('lit', 6.4, 5.8, 4, 2.6, -30),                                 // its highlight
]);
export const ph6Ball = (x: number, y: number, w: number, h: number) => fit(PH6_BALL, x, y, w, h);

/** The brass CARD TRAY under the slot, with its lip. 30 × 8. */
const PH6_TRAY: ObjPart[] = ph6In(30, 8, [
  ...ph6N('brass', ...trapezoid('mass', 15, 5.2, 30, 22, 5.6)),
  ...ph6N('brass', oRect('mass', 15, 2, 30, 2.2, 0, 1)),
  oBar('lit', 2, 1.4, 28, 1.4, 0.6),
]);
export const ph6Tray = (x: number, y: number, w: number, h: number) => fit(PH6_TRAY, x, y, w, h);

/** A printed fortune CARD's face: a red border round a white face with red corner dots; the scene prints it. 52 × 30. */
const PH6_CARD_FACE: ObjPart[] = ph6In(52, 30, [
  ...ph6N('ph6CardRed', oRect('mass', 26, 15, 52, 30, 0, 2.5)),
  oRect('lit', 26, 15, 47, 25, 0, 1.5),
  ...ph6N('ph6CardRed', oEll('dark', 5, 5, 2.2, 2.2), oEll('dark', 47, 5, 2.2, 2.2), oEll('dark', 5, 25, 2.2, 2.2), oEll('dark', 47, 25, 2.2, 2.2)),
]);
export const ph6CardFace = (x: number, y: number, w: number, h: number) => fit(PH6_CARD_FACE, x, y, w, h);
/** The card's red BACK, with a gilt frame and a lozenge. 52 × 30. */
const PH6_CARD_BACK: ObjPart[] = ph6In(52, 30, [
  ...ph6N('ph6CardRed', oRect('mass', 26, 15, 52, 30, 0, 2.5)),
  ...ph6N('brass', oRect('dark', 26, 15, 46, 24, 0, 1.5)),
  ...ph6N('ph6CardRed', oRect('dark', 26, 15, 42, 20, 0, 1)),
  ...ph6N('brass', oRect('dark', 26, 15, 9, 9, 45, 1), oRect('dark', 13, 15, 5, 5, 45, 0.6), oRect('dark', 39, 15, 5, 5, 45, 0.6)),
]);
export const ph6CardBack = (x: number, y: number, w: number, h: number) => fit(PH6_CARD_BACK, x, y, w, h);

/** A FORTUNE card for the fan: a red border, a white face, a picture up top, a rule, room for words below. 47 × 58. */
function ph6Fortune(pic: ObjPart[]): ObjPart[] {
  return ph6In(47, 58, [
    ...ph6N('ph6CardRed', oRect('mass', 23.5, 29, 47, 58, 0, 3)),
    oRect('lit', 23.5, 29, 42, 53, 0, 2),
    ...ph6N('ph6CardRed', oBar('dark', 7, 32, 40, 32, 0.8)),
    ...pic,
  ]);
}
/** LOVES FUDGE: a heart, and a square of fudge beside it. */
const PH6_FORT_LOVES = ph6Fortune([
  ...ph6N('ph6Heart', oEll('dark', 15.5, 12.5, 9, 9), oEll('dark', 22.5, 12.5, 9, 9), oTri('dark', 19, 20.2, 16, 10, 'down')),
  ...ph6N('ph6Fudge', oRect('dark', 32.5, 19.5, 9, 9, 0, 1.4)),
  oBar('lit', 29.6, 16.6, 34.6, 16.6, 0.6),
]);
export const ph6FortuneLoves = (x: number, y: number, w: number, h: number) => fit(PH6_FORT_LOVES, x, y, w, h);
/** ACHOO!: the puff of a sneeze, and what flies out of it. */
const PH6_FORT_SNEEZE = ph6Fortune([
  ...ph6N('ph6Puff', oEll('dark', 17, 18, 15, 11), oEll('dark', 25, 13.5, 15, 12), oEll('dark', 31, 20, 13, 10)),
  oBar('line', 14, 17.5, 21, 15.5, 0.7), oBar('line', 24, 20.5, 31, 18.5, 0.7),
  oEll('line', 9, 9, 2, 2), oEll('line', 37, 8.5, 1.7, 1.7), oEll('line', 40, 25, 1.8, 1.8), oEll('line', 8, 25, 1.6, 1.6),
]);
export const ph6FortuneSneeze = (x: number, y: number, w: number, h: number) => fit(PH6_FORT_SNEEZE, x, y, w, h);
/** PAID A BULLY: a clenched fist, and the coins it took. */
const PH6_FORT_BULLY = ph6Fortune([
  ...ph6N('ph6Skin', oRect('dark', 18, 17, 16, 13, 0, 4), oRect('dark', 11.5, 20, 6, 9, -20, 2.5)),
  oBar('line', 15, 11.5, 15, 16, 0.6), oBar('line', 19, 11.5, 19, 16, 0.6), oBar('line', 23, 11.5, 23, 16, 0.6),
  ...ph6N('brass', oEll('dark', 34, 13, 9, 9), oEll('dark', 36, 22, 9, 9)),
  oEll('line', 34, 13, 3, 3), oEll('line', 36, 22, 3, 3),
]);
export const ph6FortuneBully = (x: number, y: number, w: number, h: number) => fit(PH6_FORT_BULLY, x, y, w, h);

/** The machine's BRASS HAND that holds the fan up, drawn about its cuff (bottom middle). 22 × 16. */
const PH6_HAND: ObjPart[] = ph6In(22, 16, [
  ...ph6N('brass',
    oRect('mass', 11, 13.4, 6, 5, 0, 1.5),                            // the cuff
    oEll('mass', 11, 9.4, 13, 8),                                     // the palm
    oEll('mass', 5.2, 5.6, 3.6, 6, -22), oEll('mass', 9, 4, 3.6, 6.6, -7), // the fingers, spread
    oEll('mass', 13, 4, 3.6, 6.6, 7), oEll('mass', 16.8, 5.6, 3.6, 6, 22),
  ),
  oBar('lit', 6.5, 8.5, 10, 6.5, 0.6),
]);
export const ph6BrassHand = (x: number, y: number, w: number, h: number) => fit(PH6_HAND, x, y, w, h);

/** The SWEET STALL's counter: a wooden top over a cream-painted front lined in red and gilt. 162 × 40. */
const PH6_COUNTER: ObjPart[] = ph6In(162, 40, [
  ...ph6N('ph6Cream', oRect('mass', 81, 22.5, 154, 35, 0, 1.5), oRect('face', 156, 22.5, 4, 33)),
  ...ph6N('wood', oRect('mass', 81, 3, 162, 6, 0, 1.5)),
  ...ph6N('ph6Canopy', oBar('dark', 7, 10, 153, 10, 1.4), oBar('dark', 7, 35.5, 153, 35.5, 1.4)),
  ...ph6N('brass', oBar('dark', 7, 13, 153, 13, 0.8), oBar('dark', 7, 32.5, 153, 32.5, 0.8)),
  ...ph6N('ph6Canopy', oRect('dark', 81, 23, 22, 10, 45, 1)),
  oBar('lit', 2, 0.9, 160, 0.9, 0.7),
]);
export const ph6Counter = (x: number, y: number, w: number, h: number) => fit(PH6_COUNTER, x, y, w, h);

/** The stall's striped AWNING: red and cream stripes, each ending in a scallop, on two brass poles down to the counter. 176 × 110. */
const PH6_AWNING: ObjPart[] = ph6In(176, 110, [
  ...ph6N('brass', oBar('mass', 4, 10, 4, 110, 2.4), oBar('mass', 172, 10, 172, 110, 2.4)),
  ...[0, 1, 2, 3, 4, 5].flatMap((k) => ph6N(k % 2 ? 'ph6Cream' : 'ph6Canopy',
    oRect('mass', 14.67 + k * 29.33, 6, 29.33, 12), oEll('mass', 14.67 + k * 29.33, 12, 29.33, 12))),
  oBar('lit', 1, 1, 175, 1, 0.7),
]);
export const ph6Awning = (x: number, y: number, w: number, h: number) => fit(PH6_AWNING, x, y, w, h);

/** A glass SWEET JAR on a counter: a rimmed neck, round shoulders, a glint down its side; filled by the caller. 26 × 30. */
function ph6Jar(fill: ObjPart[]): ObjPart[] {
  return ph6In(26, 30, [
    ...ph6N('glass', oRect('mass', 13, 17.5, 26, 25, 0, 5), oRect('mass', 13, 3.4, 20, 5, 0, 1.6)),
    ...fill,
    oBar('lit', 4, 10, 4, 25, 1.2),
    oBar('lit', 6, 2.2, 20, 2.2, 0.6),
  ]);
}
const PH6_JAR_FUDGE = ph6Jar(ph6N('ph6Fudge',
  oRect('dark', 7, 26, 7, 6, 0, 1), oRect('dark', 14, 26, 7, 6, 0, 1), oRect('dark', 21, 26, 6, 6, 0, 1),
  oRect('dark', 9.5, 19.5, 7, 6, 0, 1), oRect('dark', 17, 19.5, 7, 6, 0, 1),
  oRect('dark', 13, 13, 7, 6, 0, 1),
));
export const ph6JarFudge = (x: number, y: number, w: number, h: number) => fit(PH6_JAR_FUDGE, x, y, w, h);
const PH6_JAR_MINT = ph6Jar([
  ...ph6N('ph6MintStripe', oEll('dark', 7.5, 26, 8, 7), oEll('dark', 18, 26, 8, 7), oEll('dark', 12.5, 20, 8, 7), oEll('dark', 20.5, 19, 7, 6), oEll('dark', 8, 14, 7, 6)),
  oBar('lit', 4.5, 27.6, 10.5, 24.4, 1.1), oBar('lit', 15, 27.6, 21, 24.4, 1.1), oBar('lit', 9.5, 21.6, 15.5, 18.4, 1.1),
  oBar('lit', 18, 20.4, 23, 17.6, 1), oBar('lit', 5.5, 15.4, 10.5, 12.6, 1),
]);
export const ph6JarMint = (x: number, y: number, w: number, h: number) => fit(PH6_JAR_MINT, x, y, w, h);
const PH6_JAR_TOFFEE = ph6Jar([
  ...ph6N('ph6Toffee', oEll('dark', 8, 26, 9, 5.5), oEll('dark', 18.5, 26.5, 9, 5.5), oEll('dark', 13, 21, 9, 5.5, -12), oEll('dark', 20, 18, 8, 5, 20), oEll('dark', 8, 16.5, 8, 5, -20)),
  oBar('lit', 6, 24.6, 9, 24.6, 0.6), oBar('lit', 11.5, 19.8, 14.5, 19.2, 0.6),
]);
export const ph6JarToffee = (x: number, y: number, w: number, h: number) => fit(PH6_JAR_TOFFEE, x, y, w, h);

/** One square of FUDGE, held between finger and thumb. 7 × 6. */
const PH6_FUDGE_BIT: ObjPart[] = ph6In(7, 6, [
  ...ph6N('ph6Fudge', oRect('mass', 3.5, 3, 7, 6, 0, 1), oRect('face', 6.2, 3.4, 1.6, 5)),
  oBar('lit', 1, 1.1, 5, 1.1, 0.5),
]);
export const ph6FudgeBit = (x: number, y: number, w: number, h: number) => fit(PH6_FUDGE_BIT, x, y, w, h);
/** One MINT HUMBUG, white with green stripes. 7 × 6. */
const PH6_MINT_BIT: ObjPart[] = ph6In(7, 6, [
  ...ph6N('ph6Mint', oEll('mass', 3.5, 3, 7, 6)),
  ...ph6N('ph6MintStripe', oBar('dark', 1.4, 4.4, 3.6, 0.8, 1.2), oBar('dark', 3.6, 5.2, 5.8, 1.6, 1.2)),
]);
export const ph6MintBit = (x: number, y: number, w: number, h: number) => fit(PH6_MINT_BIT, x, y, w, h);

/** An ivory DIE, its top edge catching the lamp, showing `pips` (each a point in its 10-square). */
function ph6Die(pips: readonly (readonly [number, number])[]): ObjPart[] {
  return ph6In(10, 10, [
    ...ph6N('ph6Ivory', oRect('mass', 5, 5, 10, 10, 0, 2.2), oRect('face', 9.2, 5.6, 1.6, 8)),
    ...pips.map(([x, y]) => oEll('line', x, y, 1.9, 1.9)),
    oBar('lit', 1.6, 1.2, 7.6, 1.2, 0.6),
  ]);
}
const PH6_DIE5 = ph6Die([[2.8, 2.8], [7.2, 2.8], [5, 5], [2.8, 7.2], [7.2, 7.2]]);
const PH6_DIE2 = ph6Die([[2.8, 2.8], [7.2, 7.2]]);
const PH6_DIE6 = ph6Die([[2.8, 2.6], [7.2, 2.6], [2.8, 5], [7.2, 5], [2.8, 7.4], [7.2, 7.4]]);
const PH6_DIE3 = ph6Die([[2.6, 2.6], [5, 5], [7.4, 7.4]]);
export const ph6DieFive = (x: number, y: number, w: number, h: number) => fit(PH6_DIE5, x, y, w, h);
export const ph6DieTwo = (x: number, y: number, w: number, h: number) => fit(PH6_DIE2, x, y, w, h);
export const ph6DieSix = (x: number, y: number, w: number, h: number) => fit(PH6_DIE6, x, y, w, h);
export const ph6DieThree = (x: number, y: number, w: number, h: number) => fit(PH6_DIE3, x, y, w, h);

/**
 * The CAROUSEL behind the stall, lit from inside: a pennant on a striped tent roof, the
 * rounding boards with their red panels, a scalloped valance, the glowing inside round a
 * mirrored centre column, the turning platform on its red skirt. Its horses and their
 * poles are the scene's, because they turn. 184 × 216.
 */
const PH6_CAROUSEL: ObjPart[] = ph6In(184, 216, [
  ...ph6N('brass', oRect('mass', 92, 10, 2, 18)),                       // the pennant's pole
  ...ph6N('ph6FlagRed', oTri('mass', 98, 4.5, 11, 7, 'right')),          // and its pennant
  ...ph6N('ph6Cream', ...trapezoid('mass', 92, 37, 18, 172, 38)),        // the tent roof
  ...ph6N('ph6Canopy',
    oBar('mass', 92, 20, 16, 55, 9), oBar('mass', 92, 20, 54, 56, 10), oBar('mass', 92, 20, 92, 56, 10),
    oBar('mass', 92, 20, 130, 56, 10), oBar('mass', 92, 20, 168, 55, 9),
  ),
  ...ph6N('ph6Glow', oRect('mass', 92, 141, 172, 120)),                 // the lit inside
  ...ph6N('ph6Cream', oRect('mass', 92, 66, 184, 20, 0, 1.5)),           // the rounding boards
  ...[0, 1, 2, 3, 4, 5, 6].flatMap((k) => ph6N(k % 2 ? 'ph6Cream' : 'ph6Canopy', oEll('mass', 13.1 + k * 26.3, 79, 26.3, 11))), // the valance
  ...ph6N('brass', oRect('mass', 92, 141, 26, 118, 0, 2)),               // the centre column
  ...ph6N('wood', oRect('mass', 92, 205, 184, 12, 0, 2)),                // the platform
  ...ph6N('ph6Canopy', oRect('mass', 92, 213.5, 176, 5, 0, 1)),          // its skirt
  ...ph6N('ph6Glow', oRect('dark', 92, 87.5, 172, 9)),                   // shadow under the valance
  ...[0, 1, 2, 3].flatMap((k) => ph6N('ph6Canopy', oRect('dark', 23 + k * 46, 66, 30, 12, 0, 2))), // the boards' red panels
  ...ph6N('brass', oBar('dark', 2, 74.5, 182, 74.5, 1)),                 // their gilt edge
  ...ph6N('ph6Velvet', oRect('dark', 92, 113, 16, 24, 0, 2), oRect('dark', 92, 165, 16, 24, 0, 2)), // the column's mirrors
  oBar('lit', 4, 199.6, 180, 199.6, 0.7),
]);
export const ph6Carousel = (x: number, y: number, w: number, h: number) => fit(PH6_CAROUSEL, x, y, w, h);

/**
 * A GALLOPER, the Beamish way, drawn about the pole through its saddle: a white body in
 * full stretch, the neck up, a long head with an open mouth and ears up, the forelegs
 * tucked and the hind legs flung back, a carved tail, a blue saddle and a red bridle. 34 × 30.
 */
const PH6_HORSE: ObjPart[] = ph6In(34, 30, [
  ...ph6N('ph6Horse',
    oEll('mass', 16, 15, 22, 10),                                     // the body
    oBar('mass', 23, 13, 28, 5, 6),                                   // the neck
    oEll('mass', 30.5, 6, 9, 5, 28),                                  // the head
    oEll('mass', 27.4, 1.6, 2.6, 5, -12),                             // an ear
    oBar('mass', 23, 18, 29, 22, 2.6), oBar('mass', 29, 22, 26, 26.5, 2.2), // a foreleg, tucked
    oBar('mass', 10, 18, 3, 24, 2.6), oBar('mass', 13, 19, 8, 26, 2.4),     // the hind legs, flung back
  ),
  ...ph6N('ph6Canopy', oBar('dark', 6, 12, 1, 18, 2.4)),             // the carved tail
  ...ph6N('ph6Saddle', oRect('dark', 15.5, 10.6, 9, 4.4, 0, 1.5)),   // the saddle
  ...ph6N('ph6Canopy', oBar('dark', 27.5, 6, 32.5, 9, 0.9)),         // the bridle
  oEll('line', 30, 4.4, 1.2, 1.2),                                    // the eye
]);
export const ph6Horse = (x: number, y: number, w: number, h: number) => fit(PH6_HORSE, x, y, w, h);

/** A brass RAIL round the carousel: two rails on three posts with ball finials. 64 × 30. */
const PH6_RAIL: ObjPart[] = ph6In(64, 30, [
  ...ph6N('brass',
    oBar('mass', 2, 3.5, 62, 3.5, 2.6), oBar('mass', 2, 16, 62, 16, 2),
    oBar('mass', 6, 2, 6, 30, 2.4), oBar('mass', 32, 2, 32, 30, 2.4), oBar('mass', 58, 2, 58, 30, 2.4),
    oEll('mass', 6, 1.6, 4.6, 4.6), oEll('mass', 32, 1.6, 4.6, 4.6), oEll('mass', 58, 1.6, 4.6, 4.6),
  ),
  oBar('lit', 4, 2.4, 60, 2.4, 0.6),
]);
export const ph6Rail = (x: number, y: number, w: number, h: number) => fit(PH6_RAIL, x, y, w, h);

// ── phil6 OBJECTS END ──

// ── phil6: objects for this lesson go ABOVE this line ──

// ── psych6 OBJECTS START ──
// ─────────────────────────────────────────────────────────────────────────────
// psych6 — A NEON ARCADE ON A SEASIDE PIER AT NIGHT (psychology-foundations-6, "Why One
// More Go?"). Drawn against pictures fetched with `node scripts/get-reference.mjs`
// (scratchpad/ref/py6-*): a pier arcade's claw cranes in a row (Clacton Pier, claw
// crane; "Toy Taxi" crane game; Claw crane in Ustroń) — a lit TOPPER sign over a glass
// box, the claw hanging from a gantry under its roof, a heap of plush on the floor of the
// box, a clear perspex prize chute in one front corner, a control panel ledge at waist
// height with a ball-top joystick, and a base cabinet with a smoked prize flap; a teddy
// bear (Old Teddy Bear) — a round head with two round ears and a pale muzzle, a pear
// body, stubby arms, legs with pale paw pads; and smartphones on a shop's acrylic display
// shelves (Wan Chai shop window display), each a black slab with its screen lit.
// ─────────────────────────────────────────────────────────────────────────────

/** Parts in a named real colour (AP11). */
const py6N = (k: NaturalKey, ...ps: ObjPart[]): ObjPart[] => ps.map((p) => ({ ...p, nat: k }));
/** Author in real units (an ax × ay box) and hand it to `fit` as the 100-square. */
function py6In(ax: number, ay: number, parts: readonly ObjPart[]): ObjPart[] {
  const sx = 100 / ax;
  const sy = 100 / ay;
  const s = 100 / Math.min(ax, ay);
  return parts.map((p) => {
    if (p.k === 'bar') return { ...p, x1: p.x1 * sx, y1: p.y1 * sy, x2: p.x2 * sx, y2: p.y2 * sy, t: p.t * s };
    return { ...p, x: p.x * sx, y: p.y * sy, w: p.w * sx, h: p.h * sy, ...(p.k === 'rect' ? { rad: p.rad * s } : null) } as ObjPart;
  });
}

// ── A CLAW MACHINE ───────────────────────────────────────────────────────────
//
// REFERENCE (py6-claw-3, py6-claw-4, py6-grab-3): a tall cabinet in one bright paint, a
// TOPPER box wider than the body with its sign's dark face set in it (the scene writes
// the words and strings the bulbs round its rim), a CAP over a glass box framed by two
// thin POSTS, the lit inside of the box, a dark control-panel LEDGE that juts out at
// waist height, and a BASE cabinet with a smoked perspex PRIZE FLAP under the chute in
// its right front corner. Real units, 70 × 120: the topper 0–26, the glass 32–82, the
// ledge 82.5–89.5, the base 89–119. The inside the scene draws on is `PY6_CAB.glass`.
function py6CabParts(k: NaturalKey, ki: NaturalKey): ObjPart[] {
  return py6In(70, 120, [
    ...py6N(k,
      oRect('mass', 35, 13, 70, 26, 0, 3.5),                          // the topper box
      oRect('mass', 35, 29, 64, 6, 0, 1),                             // the cap over the glass
      oRect('mass', 7, 57, 4, 52),                                    // the left post
      oRect('mass', 63, 57, 4, 52),                                   // the right post
      oRect('mass', 35, 104, 60, 30, 0, 1.6),                         // the base cabinet
      oRect('face', 62.4, 104, 5.2, 30, 0, 1),                        // its right end, in shade
    ),
    ...py6N('py6Panel',
      oRect('mass', 35, 86, 68, 7, 0, 1.4),                           // the control-panel ledge
      oRect('mass', 12, 119.4, 7, 1.6, 0, 0.6),                       // the feet
      oRect('mass', 58, 119.4, 7, 1.6, 0, 0.6),
    ),
    ...py6N('py6Topper', oRect('dark', 35, 13, 62, 19, 0, 1.6)),     // the sign's face
    ...py6N(ki, oRect('dark', 35, 57.3, 47.4, 46)),                   // the lit inside of the box
    ...py6N('py6Flap', oRect('dark', 50, 105, 18, 16, 0, 1.6)),      // the prize flap, under the chute
    ...py6N(k, oRect('dark', 20, 104, 22, 16, 0, 2)),                 // a recessed panel on the base
    oBar('line', 64, 84.4, 64, 87.6, 1),                              // the coin slot, on the ledge
    oBar('line', 41.5, 104, 58.5, 104, 0.5),                          // the flap's hinge
    oBar('lit', 6.5, 27, 63.5, 27, 0.8),                              // light along the cap's top
    oBar('lit', 5.8, 34, 5.8, 80, 0.7),                               // and down the left post
    oBar('lit', 3, 83.2, 67, 83.2, 0.6),                              // and the ledge's front edge
    oBar('lit', 8, 90.6, 60, 90.6, 0.7),                              // and the base's top
    oBar('lit', 44, 99, 47, 110, 0.6),                                // a glint on the flap
  ]);
}
const PY6_CAB_PINK = py6CabParts('py6CabPink', 'py6InPink');
const PY6_CAB_RED = py6CabParts('py6CabRed', 'py6InGold');
const PY6_CAB_TEAL = py6CabParts('py6CabTeal', 'py6InMint');
export const py6CabPink = (x: number, y: number, w: number, h: number) => fit(PY6_CAB_PINK, x, y, w, h);
export const py6CabRed = (x: number, y: number, w: number, h: number) => fit(PY6_CAB_RED, x, y, w, h);
export const py6CabTeal = (x: number, y: number, w: number, h: number) => fit(PY6_CAB_TEAL, x, y, w, h);
/**
 * Where things are on a cabinet, in its own 70 × 120 units: the sign's face, the inside
 * of the glass box, the joystick's base on the ledge, the coin slot, the chute (inside,
 * over the flap) and the prize flap.
 */
export const PY6_CAB = {
  w: 70, h: 120,
  sign: { x0: 4, y0: 3.5, x1: 66, y1: 22.5 },
  glass: { x0: 11.3, y0: 34.3, x1: 58.7, y1: 80.3 },
  stick: { x: 52, y: 82.5 },
  slot: { x: 64, y: 86 },
  chute: { x0: 46, x1: 58.7, y0: 64 },
  flap: { x: 50, y: 105 },
} as const;

// ── A HEAP OF PLUSH ON THE FLOOR OF THE BOX ─────────────────────────────────
//
// REFERENCE (py6-claw-1, py6-grab-4): the prizes lie heaped and squashed together, round
// heads and ears showing, a few colours side by side, filling the floor of the glass box
// edge to edge. Real units, 48 × 14; it sits on the box's floor.
const PY6_PILE: ObjPart[] = py6In(48, 14, [
  ...py6N('py6PlushPink', oEll('mass', 6, 9.5, 12, 10), oEll('mass', 2.6, 4.2, 3.6, 3.6), oEll('mass', 9.2, 4, 3.6, 3.6)),
  ...py6N('py6PlushBlue', oEll('mass', 17, 10, 13, 9)),
  ...py6N('py6PlushYellow', oEll('mass', 27.5, 9, 12, 11), oBar('mass', 24.6, 4.5, 23.8, 0.8, 2.4), oBar('mass', 30, 4.5, 31.2, 0.8, 2.4)),
  ...py6N('py6PlushPink', oEll('mass', 38, 10.5, 11, 8)),
  ...py6N('py6PlushBlue', oEll('mass', 45, 9.5, 8, 10)),
  ...py6N('py6Muzzle', oEll('mass', 6, 10.6, 4.2, 3), oEll('mass', 27.5, 10.2, 4.2, 3)),
  oEll('line', 4.6, 8.2, 1, 1), oEll('line', 7.4, 8.2, 1, 1),             // two faces looking out
  oEll('line', 26.1, 7.8, 1, 1), oEll('line', 28.9, 7.8, 1, 1),
  oBar('lit', 13, 6.6, 19, 6, 0.7), oBar('lit', 35, 7.4, 39, 7, 0.6),     // the light on their tops
]);
export const py6Pile = (x: number, y: number, w: number, h: number) => fit(PY6_PILE, x, y, w, h);

// ── A PLUSH TEDDY BEAR ───────────────────────────────────────────────────────
//
// REFERENCE (py6-bear-2): a ROUND HEAD as wide as the body with two round EARS set high
// on it, a pale MUZZLE with a dark nose, two bead eyes; a pear-shaped BODY; stubby ARMS
// angled down and out; short LEGS sat forward with pale PADS on their soles. Real units,
// 20 × 24; held by its middle (`PY6_BEAR_GRIP`), grabbed by the claw round its head.
function py6BearParts(k: NaturalKey): ObjPart[] {
  return py6In(20, 24, [
    ...py6N(k,
      oEll('mass', 10, 16.6, 12.4, 12),                               // the body
      oBar('mass', 5.4, 13.6, 2.6, 18.4, 3.6),                        // the arms
      oBar('mass', 14.6, 13.6, 17.4, 18.4, 3.6),
      oEll('mass', 6, 21.6, 6, 5),                                    // the legs
      oEll('mass', 14, 21.6, 6, 5),
      oEll('mass', 4.4, 2.9, 5, 5),                                   // the ears
      oEll('mass', 15.6, 2.9, 5, 5),
      oEll('mass', 10, 7.6, 13, 11.6),                                // the head
    ),
    ...py6N('py6Muzzle',
      oEll('mass', 4.4, 2.9, 2.4, 2.4), oEll('mass', 15.6, 2.9, 2.4, 2.4), // inside the ears
      oEll('mass', 10, 10.2, 6, 4.4),                                 // the muzzle
      oEll('mass', 10, 17.4, 6, 6),                                   // the tummy
      oEll('mass', 6, 22.6, 3.4, 2.6), oEll('mass', 14, 22.6, 3.4, 2.6), // the paw pads
    ),
    oEll('line', 10, 9.1, 2.4, 1.6),                                  // the nose
    oEll('line', 7.2, 6.6, 1.5, 1.5),                                 // the eyes
    oEll('line', 12.8, 6.6, 1.5, 1.5),
    oBar('lit', 6, 3.6, 9, 2.6, 0.6),                                 // the light on its crown
  ]);
}
const PY6_BEAR_PURPLE = py6BearParts('py6Bear');
const PY6_BEAR_GREEN = py6BearParts('py6BearGreen');
export const py6BearPurple = (x: number, y: number, w: number, h: number) => fit(PY6_BEAR_PURPLE, x, y, w, h);
export const py6BearGreen = (x: number, y: number, w: number, h: number) => fit(PY6_BEAR_GREEN, x, y, w, h);
/** Where a bear is held (its middle) and where the claw takes it (round its head), in its 20 × 24. */
export const PY6_BEAR_GRIP = { x: 10, y: 15, w: 20, h: 24 } as const;
export const PY6_BEAR_HEAD = { x: 10, y: 3, w: 20, h: 24 } as const;

// ── A SMARTPHONE, IN A HAND ──────────────────────────────────────────────────
//
// REFERENCE (py6-phone-1): a black slab with rounded corners, its screen lit nearly
// edge to edge, held upright by its lower half with the screen to whoever looks.
// Real units, 8 × 15; held by its bottom (`PY6_PHONE_GRIP`).
const PY6_PHONE: ObjPart[] = py6In(8, 15, [
  ...py6N('phoneBody', oRect('mass', 4, 7.5, 8, 15, 0, 1.6)),
  ...py6N('py6Screen', oRect('dark', 4, 7.3, 6.4, 12.4, 0, 0.8)),
  ...py6N('py6Bear', oRect('dark', 4, 5.2, 5, 3, 0, 0.5)),            // a post on the feed
  oBar('line', 1.8, 9.4, 6.2, 9.4, 0.5),                              // and its lines
  oBar('line', 1.8, 11, 5, 11, 0.5),
]);
export const py6Phone = (x: number, y: number, w: number, h: number) => fit(PY6_PHONE, x, y, w, h);
export const PY6_PHONE_GRIP = { x: 4, y: 12.5, w: 8, h: 15 } as const;

// ── A DISPLAY PHONE, LYING ON ITS SIDE ON A SHELF ───────────────────────────
//
// REFERENCE (py6-phone2-1): a shop's demo phones stand on clear shelves with their
// screens on. Real units, 74 × 34: the screen 8–71 × 3–31, which the scene lights and
// draws an app on (`PY6_HANDSET_SCREEN`).
function py6HandsetParts(k: NaturalKey): ObjPart[] {
  return py6In(74, 34, [
    ...py6N(k, oRect('mass', 37, 17, 74, 34, 0, 5)),                  // the case
    ...py6N('phoneBody', oRect('dark', 39.5, 17, 66, 31, 0, 3.4)),    // the phone's black face in it
    ...py6N('py6ScreenOff', oRect('dark', 39.5, 17, 63, 28, 0, 2.4)),
    oEll('line', 4.4, 17, 2, 2),                                      // the camera
    oBar('lit', 6, 2.2, 68, 2.2, 0.7),                                // light along its top edge
  ]);
}
const PY6_HANDSET = py6HandsetParts('phoneBody');
const PY6_HANDSET_PINK = py6HandsetParts('py6PlushPink');
const PY6_HANDSET_BLUE = py6HandsetParts('py6PlushBlue');
const PY6_HANDSET_GOLD = py6HandsetParts('py6PlushYellow');
export const py6Handset = (x: number, y: number, w: number, h: number) => fit(PY6_HANDSET, x, y, w, h);
export const py6HandsetPink = (x: number, y: number, w: number, h: number) => fit(PY6_HANDSET_PINK, x, y, w, h);
export const py6HandsetBlue = (x: number, y: number, w: number, h: number) => fit(PY6_HANDSET_BLUE, x, y, w, h);
export const py6HandsetGold = (x: number, y: number, w: number, h: number) => fit(PY6_HANDSET_GOLD, x, y, w, h);
export const PY6_HANDSET_SCREEN = { x0: 8, y0: 3, x1: 71, y1: 31, w: 74, h: 34 } as const;

// ── THE PHONE KIOSK'S DISPLAY STAND ─────────────────────────────────────────
//
// REFERENCE (py6-phone2-1, py6-phone2-3): clear acrylic SHELVES between two clear
// UPRIGHTS, a painted PLINTH under them and a lit HEADER board over them carrying the
// kiosk's name. Real units, 84 × 152: the header 0–16, shelves at 54–57 and 96–99, the
// plinth 138–152. Three phones stand on it (`PY6_STAND_SHELVES`).
const PY6_STAND: ObjPart[] = py6In(84, 152, [
  ...py6N('py6Acrylic',
    oRect('mass', 5, 77, 4, 122),                                     // the uprights
    oRect('mass', 79, 77, 4, 122),
    oRect('mass', 42, 55.5, 82, 3, 0, 1),                             // the shelves
    oRect('mass', 42, 97.5, 82, 3, 0, 1),
  ),
  ...py6N('py6Kiosk',
    oRect('mass', 42, 8, 84, 16, 0, 3),                               // the header board
    oRect('mass', 42, 145, 84, 14, 0, 2),                             // the plinth
    oRect('face', 81, 145, 6, 14, 0, 1.4),
  ),
  ...py6N('py6Topper', oRect('dark', 42, 8, 76, 11, 0, 1.6)),        // the header's lit face
  oBar('lit', 4, 140.2, 78, 140.2, 0.8),                              // light along the plinth
  oBar('lit', 3.8, 18, 3.8, 136, 0.6),                                // and down the near upright
]);
export const py6Stand = (x: number, y: number, w: number, h: number) => fit(PY6_STAND, x, y, w, h);
/** The stand's header face and where each phone's bottom rests, in its own 84 × 152. */
export const PY6_STAND_SHELVES = { w: 84, h: 152, header: { x0: 4, y0: 2.5, x1: 80, y1: 13.5 }, rests: [54, 96, 138] } as const;

// ── A YELLOW DUSTER ──────────────────────────────────────────────────────────
//
// A square of soft yellow cloth, bunched where it is held (`PY6_DUSTER_GRIP`), with a
// stitched hem. Real units, 12 × 10.
const PY6_DUSTER: ObjPart[] = py6In(12, 10, [
  ...py6N('py6Duster', oRect('mass', 6.6, 5.6, 8.6, 6.4, -6, 1.6), oEll('mass', 3.6, 3, 4, 3.6)),
  oBar('line', 3.4, 7.8, 9.8, 7.1, 0.45),                             // the stitched hem
  oBar('lit', 4.8, 3.6, 9, 3, 0.5),
]);
export const py6Duster = (x: number, y: number, w: number, h: number) => fit(PY6_DUSTER, x, y, w, h);
export const PY6_DUSTER_GRIP = { x: 3, y: 2.4, w: 12, h: 10 } as const;
// ── psych6 OBJECTS END ──

// ── psych6: objects for this lesson go ABOVE this line ──

// ── LIGHTHOUSE LENS (growth6) ───────────────────────────────────────────────
//
// REFERENCE (Point Reyes and Elizabeth Donkin first-order lenses, photographed). A
// Fresnel lens is a BEEHIVE of glass: a stack of prism rings narrowing to a brass cap
// at the top and again at the foot, and a fat central drum with the BULLSEYE — rings
// of glass round a bright centre where the lamp is. Brass frame bars run up it. Real
// units 76 × 120: the cap at y 0, the foot ring at y 120.
const GR6_LENS: ObjPart[] = g3In(76, 120, [
  ...g3('brass', oEll('mass', 38, 4, 18, 8), oRect('mass', 38, 9, 34, 4, 0, 1.5)),
  ...g3('gr6Glass',
    oRect('mass', 38, 14, 42, 6, 0, 2), oRect('mass', 38, 20, 52, 6, 0, 2), oRect('mass', 38, 26, 60, 6, 0, 2),
    oRect('mass', 38, 32, 66, 6, 0, 2), oRect('mass', 38, 38, 70, 6, 0, 2),
  ),
  ...g3('brass', oRect('mass', 38, 42.5, 74, 3, 0, 1)),
  ...g3('gr6Glass', oRect('mass', 38, 61, 76, 34, 0, 3)),
  ...g3('brass', oRect('mass', 38, 79.5, 74, 3, 0, 1)),
  ...g3('gr6Glass',
    oRect('mass', 38, 84, 70, 6, 0, 2), oRect('mass', 38, 90, 64, 6, 0, 2), oRect('mass', 38, 96, 56, 6, 0, 2),
    oRect('mass', 38, 102, 46, 6, 0, 2), oRect('mass', 38, 108, 34, 6, 0, 2),
  ),
  ...g3('brass', oRect('mass', 38, 114, 40, 5, 0, 1.5), oRect('face', 38, 118, 44, 4, 0, 1)),
  // the prisms' edges, catching the light: one rule between each pair of rings
  ...g3('gr6Glass', ...([[17, 46], [23, 56], [29, 63], [35, 68], [87, 67], [93, 60], [99, 51], [105, 40]] as const)
    .map(([y, w]) => oBar('dark', 38 - w / 2, y, 38 + w / 2, y, 0.6))),
  // the bullseye: rings of glass round the lamp
  ...g3('gr6Glass', oEll('dark', 38, 61, 30, 30)),
  ...g3('gr6GlassHi', oEll('dark', 38, 61, 24, 24)),
  ...g3('gr6Glass', oEll('dark', 38, 61, 17, 17)),
  ...g3('gr6GlassHi', oEll('dark', 38, 61, 10, 10)),
  oEll('lit', 38, 61, 4.5, 4.5),
  oBar('lit', 5, 47, 5, 75, 1.2),
]);
export const gr6Lens = (x: number, y: number, w: number, h: number) => fit(GR6_LENS, x, y, w, h);
/** Where the bullseye's centre is, in the lens's own 76 × 120. */
export const GR6_LENS_EYE = { x: 38, y: 61, w: 76, h: 120 } as const;

// ── LENS PEDESTAL ────────────────────────────────────────────────────────────
//
// REFERENCE (Portland Bill's lantern room). The lens stands on a cast-iron PEDESTAL
// painted green: a wide stepped base, a fluted column, a capital spreading to the round
// table the lens sits on, and the clockwork's winding hub on its side. Real units
// 46 × 50: the table at y 0, the floor at y 50.
const GR6_PEDESTAL: ObjPart[] = g3In(46, 50, [
  ...g3('gr6Iron',
    oRect('mass', 23, 2.5, 46, 5, 0, 1.5), oRect('mass', 23, 8, 30, 6, 0, 1), oRect('mass', 23, 28, 20, 34, 0, 1),
    oRect('mass', 23, 44, 36, 6, 0, 1), oRect('mass', 23, 48, 44, 4, 0, 1),
    oRect('face', 30.5, 28, 5, 34, 0, 0.8),
  ),
  ...g3('gr6Iron', oBar('dark', 17, 14, 17, 41, 1), oBar('dark', 21.5, 14, 21.5, 41, 1)),
  ...g3('brass', oEll('mass', 35, 24, 6, 6)),
  oEll('line', 35, 24, 2, 2),
  oBar('lit', 14.6, 13, 14.6, 42, 0.7),
]);
export const gr6Pedestal = (x: number, y: number, w: number, h: number) => fit(GR6_PEDESTAL, x, y, w, h);
/** The winding hub on the pedestal's side, in its own 46 × 50. */
export const GR6_HUB = { x: 35, y: 24, w: 46, h: 50 } as const;

// ── KEEPER'S DESK ────────────────────────────────────────────────────────────
//
// REFERENCE. A plain writing desk side-on: a top with a moulded lip, a frieze holding
// two DRAWERS with round knobs, and four square legs, the far pair hidden. Real units
// 132 × 36: the top at y 0, the floor at y 36.
const GR6_DESK: ObjPart[] = g3In(132, 36, [
  ...g3('wood',
    oRect('mass', 66, 2.4, 132, 4.8, 0, 1), oRect('face', 66, 5.6, 128, 1.8),
    oRect('mass', 66, 12, 122, 11, 0, 0.6),
    oRect('mass', 8, 24, 5, 24), oRect('mass', 124, 24, 5, 24),
    oRect('face', 9.6, 24, 1.8, 24), oRect('face', 125.6, 24, 1.8, 24),
  ),
  ...g3('wood', oRect('dark', 36, 12, 50, 7, 0, 0.6), oRect('dark', 96, 12, 50, 7, 0, 0.6)),
  ...g3('brass', oEll('dark', 36, 12, 3, 3), oEll('dark', 96, 12, 3, 3)),
  oBar('lit', 2, 1.4, 130, 1.4, 0.6),
]);
export const gr6Desk = (x: number, y: number, w: number, h: number) => fit(GR6_DESK, x, y, w, h);

// ── MORSE KEY ────────────────────────────────────────────────────────────────
//
// REFERENCE (a CNAM telegraph key, photographed). A straight key is a polished wooden
// BASE with a moulded edge, a brass LEVER rocking on a pivot block in the middle, a black
// ebonite KNOB on a brass collar at the operator's end, and brass binding posts at the
// far end. Drawn in two: the base (32 × 8, its top at y 0) and the lever with its knob
// (32 × 10, the pivot at x 14, y 7), which the scene rocks when it is pressed.
const GR6_KEY_BASE: ObjPart[] = g3In(32, 8, [
  ...g3('gr6Mahogany', oRect('mass', 16, 4.8, 32, 6.4, 0, 1), oRect('face', 16, 7.2, 30, 1.6)),
  ...g3('brass',
    oRect('mass', 14, 1.4, 7, 2.6, 0, 0.8),
    oRect('mass', 3, 1.4, 2.6, 2.6, 0, 0.6), oRect('mass', 8, 1.4, 2.6, 2.6, 0, 0.6),
  ),
  oBar('lit', 1.4, 2.4, 30.6, 2.4, 0.5),
]);
export const gr6KeyBase = (x: number, y: number, w: number, h: number) => fit(GR6_KEY_BASE, x, y, w, h);
const GR6_KEY_LEVER: ObjPart[] = g3In(32, 10, [
  ...g3('brass', oBar('mass', 6, 6.8, 26, 6.8, 1.8), oEll('mass', 14, 7, 4, 4), oRect('mass', 26.5, 5.6, 3, 3, 0, 0.6)),
  ...g3('gr6Ebonite', oEll('mass', 26.5, 2.4, 7.4, 4)),
  oEll('lit', 25, 1.6, 2.4, 1),
]);
export const gr6KeyLever = (x: number, y: number, w: number, h: number) => fit(GR6_KEY_LEVER, x, y, w, h);
/** The lever's pivot, in its own 32 × 10. */
export const GR6_KEY_PIVOT = { x: 14, y: 7, w: 32, h: 10 } as const;

// ── BRASS TOKEN ──────────────────────────────────────────────────────────────
//
// REFERENCE. A brass token is a thick coin with a raised RIM and a stamped centre; one
// kept for show stands on its edge in a little wooden STAND. Real units 14 × 17: the
// coin above, the stand's foot on y 17. The loose coin is drawn on its own, 12 × 12.
const GR6_TOKEN: ObjPart[] = g3In(14, 17, [
  ...g3('wood', oRect('mass', 7, 15, 12, 4, 0, 1)),
  ...g3('brass', oEll('mass', 7, 7, 13, 13)),
  ...g3('brass', oEll('dark', 7, 7, 9.4, 9.4)),
  ...g3('gr6Sun', oTri('dark', 7, 6.2, 5, 4.4, 'up'), oTri('dark', 7, 7.8, 5, 4.4, 'down')),
  oEll('lit', 4.4, 4.2, 2.4, 1.6),
]);
export const gr6Token = (x: number, y: number, w: number, h: number) => fit(GR6_TOKEN, x, y, w, h);
const GR6_COIN: ObjPart[] = g3In(12, 12, [
  ...g3('brass', oEll('mass', 6, 6, 12, 12)),
  ...g3('brass', oEll('dark', 6, 6, 8.4, 8.4)),
  ...g3('gr6Sun', oTri('dark', 6, 5.3, 4.4, 3.8, 'up'), oTri('dark', 6, 6.7, 4.4, 3.8, 'down')),
  oEll('lit', 3.6, 3.4, 2.2, 1.4),
]);
export const gr6Coin = (x: number, y: number, w: number, h: number) => fit(GR6_COIN, x, y, w, h);

// ── BANJO BAROMETER ──────────────────────────────────────────────────────────
//
// REFERENCE (Barnasconi, Leeds, c. 1810). A wheel barometer is a mahogany case shaped
// like a BANJO: a broken pediment on top, a narrow neck holding the thermometer, then a
// big round head with a brass BEZEL round a silvered dial (RAIN, CHANGE, FAIR, STORMY
// round its rim), and a small round foot. Real units 22 × 62; the dial's centre is
// GR6_BARO_DIAL. Its needle is the scene's, because it swings when the storm comes.
const GR6_BAROMETER: ObjPart[] = g3In(22, 62, [
  ...g3('gr6Mahogany',
    oEll('mass', 11, 2.2, 5, 4.4), oRect('mass', 11, 5.6, 18, 3.6, 0, 1), oRect('mass', 11, 10.5, 14, 8, 0, 1), oRect('mass', 11, 24, 8, 22, 0, 1),
    oEll('mass', 11, 45, 22, 22), oEll('mass', 11, 58.5, 9, 7),
  ),
  ...g3('gr6Dial', oRect('dark', 11, 23, 3.4, 16, 0, 1.2)),
  oBar('line', 11, 17, 11, 30, 0.6), oEll('line', 11, 30.4, 1.8, 1.8),
  ...g3('brass', oEll('dark', 11, 45, 18.6, 18.6)),
  ...g3('gr6GlassHi', oEll('dark', 11, 45, 15.4, 15.4)),
  oBar('line', 4.2, 41, 5.6, 42, 0.5), oBar('line', 11, 38.2, 11, 39.8, 0.5), oBar('line', 17.8, 41, 16.4, 42, 0.5),
  oEll('line', 11, 45, 1.6, 1.6),
]);
export const gr6Barometer = (x: number, y: number, w: number, h: number) => fit(GR6_BAROMETER, x, y, w, h);
export const GR6_BARO_DIAL = { x: 11, y: 45, w: 22, h: 62 } as const;

// ── FISHING BOAT AT SEA ──────────────────────────────────────────────────────
//
// REFERENCE (trawlers in Salmon Harbor). A small fishing boat side-on: a white HULL with
// its sheer rising to the bow, red antifouling below the waterline, a white WHEELHOUSE
// aft with a band of dark windows, and a MAST forward with a boom slung off it. Real
// units 40 × 24: the masthead at y 0, the waterline at y 21. The masthead lamp is the
// scene's, because it signals.
const GR6_BOAT: ObjPart[] = g3In(40, 24, [
  ...g3('gr6ShipWhite', oRect('mass', 21, 17, 34, 7, 0, 1.5), oTri('mass', 4.2, 15.5, 7, 7, 'left'), oRect('mass', 28.5, 10.5, 11, 8, 0, 1)),
  ...g3('gr6ShipRed', oRect('mass', 21, 21.6, 32, 3.6, 0, 1.2)),
  ...g3('gr6ShipWin', oRect('dark', 28.5, 9.4, 9, 2.4, 0, 0.5)),
  ...g3('gr6ShipWhite', oRect('dark', 21, 19.2, 32, 1.2)),
  oBar('line', 13, 13.6, 13, 0.6, 1),
  oBar('line', 13, 3, 4, 12, 0.6),
  oBar('line', 13, 1.5, 33, 7, 0.4),
]);
export const gr6Boat = (x: number, y: number, w: number, h: number) => fit(GR6_BOAT, x, y, w, h);
/** The masthead, where the signal lamp hangs, in the boat's own 40 × 24. */
export const GR6_MASTHEAD = { x: 13, y: 1, w: 40, h: 24 } as const;

// ── HANGING CALENDAR ─────────────────────────────────────────────────────────
//
// REFERENCE. A hanging month calendar: a sheet on a hook, a coloured HEADER at the top
// (where the plan's name goes), and under it the days in a grid of SEVEN columns. The
// grid of seven is the field mark. Real units 44 × 64: the hook at y 0; the header 4–25;
// five weeks of 7.4 from y 26.4. The plan's marks are the scene's, because they answer.
const GR6_CAL: ObjPart[] = g3In(44, 64, [
  ...g3('paper', oRect('mass', 22, 34.5, 44, 59, 0, 1)),
  ...g3('calRed', oRect('mass', 22, 14.5, 44, 21, 0, 1)),
  ...g3('paper', ...[1, 2, 3, 4, 5, 6].map((c) => oBar('dark', 1 + c * 6, 26.6, 1 + c * 6, 63, 0.45))),
  ...g3('paper', ...[1, 2, 3, 4].map((r) => oBar('dark', 1, 26.4 + r * 7.4, 43, 26.4 + r * 7.4, 0.45))),
  oEll('line', 22, 2.2, 3.4, 3.4),
  oBar('line', 22, 3.6, 22, 4.8, 0.8),
]);
export const gr6Calendar = (x: number, y: number, w: number, h: number) => fit(GR6_CAL, x, y, w, h);
/** Where day `d` (1–35) sits on the calendar, in its own 44 × 64: the centre of its square. */
export const gr6CalDay = (d: number) => ({ x: 1 + ((d - 1) % 7) * 6 + 3, y: 26.4 + Math.floor((d - 1) / 7) * 7.4 + 3.7 });

// ── MORSE NOTES ──────────────────────────────────────────────────────────────
//
// REFERENCE. A crib sheet of the code: a sheet of paper, each LINE a letter and its
// dots and dashes. Real units 18 × 24. The sheet is drawn here and its INK separately,
// because the ink drains off it.
const GR6_NOTES: ObjPart[] = g3In(18, 24, [
  ...g3('paper', oRect('mass', 9, 12, 18, 24, 0, 0.8)),
  ...g3('paper', oRect('dark', 17.2, 12, 1.4, 22)),
  ...g3('paper', oBar('dark', 1.5, 1.6, 15.5, 1.6, 0.5)),
]);
export const gr6Notes = (x: number, y: number, w: number, h: number) => fit(GR6_NOTES, x, y, w, h);
const GR6_NOTES_INK: ObjPart[] = g3In(18, 24, [
  // A ·–   B –···   E ·   O –––   S ···
  oEll('line', 3, 4, 1.6, 1.6), oBar('line', 5, 4, 9, 4, 1),
  oBar('line', 3, 8.5, 7, 8.5, 1), oEll('line', 9, 8.5, 1.6, 1.6), oEll('line', 11.5, 8.5, 1.6, 1.6), oEll('line', 14, 8.5, 1.6, 1.6),
  oEll('line', 3, 13, 1.6, 1.6),
  oBar('line', 3, 17.5, 6, 17.5, 1), oBar('line', 7.5, 17.5, 10.5, 17.5, 1), oBar('line', 12, 17.5, 15, 17.5, 1),
  oEll('line', 3, 21.5, 1.6, 1.6), oEll('line', 5.5, 21.5, 1.6, 1.6), oEll('line', 8, 21.5, 1.6, 1.6),
]);
export const gr6NotesInk = (x: number, y: number, w: number, h: number) => fit(GR6_NOTES_INK, x, y, w, h);

// ── PENCIL ───────────────────────────────────────────────────────────────────
//
// REFERENCE. A pencil: a yellow hexagonal shaft, a cone of bare wood, the dark lead at
// its point. Real units 18 × 3.6, point at x 0; held near its end (AR2), GR6_PENCIL_GRIP.
const GR6_PENCIL: ObjPart[] = g3In(18, 3.6, [
  ...g3('lemon', oRect('mass', 10.6, 1.8, 14.8, 3.6, 0, 0.6), oRect('face', 10.6, 2.9, 14.8, 1.2)),
  ...g3('beech', oEll('mass', 3.2, 1.8, 6, 3.2)),
  oEll('line', 0.9, 1.8, 1.6, 1.2),
]);
export const gr6Pencil = (x: number, y: number, w: number, h: number) => fit(GR6_PENCIL, x, y, w, h);
export const GR6_PENCIL_GRIP = { x: 13, y: 1.8, w: 18, h: 3.6 } as const;

// ── growth6: objects for this lesson go ABOVE this line ──

// ═══ biz6 BEGIN ═══
// biz6 — A HAUNTED CASTLE ATTRACTION ON OPENING NIGHT (business-foundations-6, "When Do You
// Break Even?"). Every drawing is authored in REAL stage units (`bz6In`) so the scene lays
// it 1:1, and each part carries the colour the thing really is (AR1).
const bz6N = (k: NaturalKey, ...ps: ObjPart[]): ObjPart[] => ps.map((p) => ({ ...p, nat: k }));
/** Author in real units (an ax × ay box) and hand it to `fit` as the 100-square. */
function bz6In(ax: number, ay: number, parts: readonly ObjPart[]): ObjPart[] {
  const sx = 100 / ax;
  const sy = 100 / ay;
  const s = 100 / Math.min(ax, ay);
  return parts.map((p) => {
    if (p.k === 'bar') return { ...p, x1: p.x1 * sx, y1: p.y1 * sy, x2: p.x2 * sx, y2: p.y2 * sy, t: p.t * s };
    return { ...p, x: p.x * sx, y: p.y * sy, w: p.w * sx, h: p.h * sy, ...(p.k === 'rect' ? { rad: p.rad * s } : null) } as ObjPart;
  });
}
/** A drawing turned to face the other way, in its own real units (`w` wide). */
function bz6Mirror(w: number, parts: readonly ObjPart[]): ObjPart[] {
  return parts.map((p) => {
    if (p.k === 'bar') return { ...p, x1: w - p.x1, x2: w - p.x2 };
    if (p.k === 'tri') return { ...p, x: w - p.x, rot: -p.rot, dir: p.dir === 'left' ? 'right' : p.dir === 'right' ? 'left' : p.dir };
    return { ...p, x: w - p.x, rot: -p.rot } as ObjPart;
  });
}

// ── THE TICKET BOOTH ────────────────────────────────────────────────────────
//
// REFERENCE (Commons: "Fantasyland ticket booth, Disneyland, 1960s"). A fairground ticket
// booth is a small kiosk: a solid LOWER PANEL to the hip with a painted emblem on it, a
// wooden LEDGE across its top where the money and tickets change hands, a glazed WINDOW
// band above it, a scalloped VALANCE hanging under the eaves, and a peaked ROOF with a sign
// and a finial. Here it is painted for a haunted castle — purple and lime, a moon and a bat.
// Drawn in two layers so the seller stands INSIDE it: the back (posts, the lamplit inside,
// the valance and the roof) behind him, the front (the ledge and the lower panel) before
// him. Back real units 112 × 148, the ledge's top at y 110; front 116 × 38.
const BZ6_BOOTH_BACK: ObjPart[] = bz6In(112, 148, [
  ...bz6N('bz6Booth', oRect('mass', 5, 94, 10, 108, 0, 1.5), oRect('mass', 107, 94, 10, 108, 0, 1.5)), // the corner posts
  ...bz6N('bz6BoothIn', oRect('mass', 56, 81, 94, 62)),                // the inside, warm under its lamp
  ...bz6N('bz6Roof', oTri('mass', 56, 28, 104, 30, 'up')),             // the peaked roof
  ...bz6N('bz6Booth', oRect('mass', 56, 43.5, 116, 5, 0, 1.5)),        // the eave board
  ...bz6N('bz6Lime', oRect('mass', 56, 48.5, 108, 5)),                 // the valance's band
  ...Array.from({ length: 5 }, (_, k): ObjPart => ({                   // and its scallops
    ...oTri('mass', 10.8 + 21.6 * k, 54.5, 21.6, 8, 'down'), nat: k % 2 ? 'bz6Lime' : 'bz6Booth',
  })),
  ...bz6N('bz6Iron', oBar('mass', 56, 3, 56, 13, 2)),                  // the finial
  ...bz6N('bz6Lime', oEll('mass', 56, 4, 5, 5)),
]);
export const bz6BoothBack = (x: number, y: number, w: number, h: number) => fit(BZ6_BOOTH_BACK, x, y, w, h);
const BZ6_BOOTH_FRONT: ObjPart[] = bz6In(116, 38, [
  ...bz6N('bz6Booth', oRect('mass', 58, 22, 108, 32, 0, 1)),           // the lower panel
  ...bz6N('bz6Booth', oRect('face', 58, 35.6, 108, 5, 0, 1)),          // its kick plate, in shade
  ...bz6N('bz6Lime', oRect('mass', 58, 9, 108, 3)),                    // the trim under the ledge
  ...bz6N('oak', oRect('mass', 58, 3, 116, 6, 0, 1.2)),            // the ledge
  ...bz6N('bz6Moon', oEll('dark', 58, 22.5, 15, 15)),                  // the painted moon
  oTri('line', 53.2, 21.8, 7.5, 4.4, 'left'),                          // and a bat across it
  oTri('line', 62.8, 21.8, 7.5, 4.4, 'right'),
  oEll('line', 58, 22.4, 2.8, 4.4),
]);
export const bz6BoothFront = (x: number, y: number, w: number, h: number) => fit(BZ6_BOOTH_FRONT, x, y, w, h);

// ── THE TURNSTILE ───────────────────────────────────────────────────────────
//
// REFERENCE ("Interior of Piggly Wiggly store … entrance turnstile", 1917). An old turnstile
// is a short iron POST on a foot plate with a HUB at hip height, and from the hub the ARMS
// turn flat, in a horizontal plane (the scene draws and turns them). This one is a pay
// turnstile: a COIN BOX rides on top of the hub with a slot in its lid, and a brass CLICK
// LEVER with a red knob sticks out toward the booth, for the seller to count a guest in by
// hand. Real units 46 × 56; the hub's centre at (26, 11).
const BZ6_TURNSTILE: ObjPart[] = bz6In(46, 56, [
  ...bz6N('bz6Iron', oRect('mass', 26, 33, 8, 38, 0, 1.5)),            // the post
  ...bz6N('bz6Iron', oRect('mass', 26, 53.5, 22, 5, 0, 1.5)),          // the foot plate
  ...bz6N('g5Gold', oRect('mass', 26, 16, 10, 3, 0, 1)),               // the collar
  ...bz6N('g5Gold', oRect('mass', 26, 11, 13, 6, 0, 2.5)),             // the hub, brass
  ...bz6N('bz6CounterRed', oRect('mass', 26, 4.5, 15, 9, 0, 1.5)),     // the coin box
  oBar('line', 22, 1.6, 30, 1.6, 1.1),                                 // its slot
  ...bz6N('g5Gold', oBar('mass', 21, 9.5, 4.5, 3.5, 1.8)),             // the click lever
  ...bz6N('bz6PopRed', oEll('mass', 3.5, 3, 5, 5)),                    // and its red knob
]);
export const bz6Turnstile = (x: number, y: number, w: number, h: number) => fit(BZ6_TURNSTILE, x, y, w, h);
export const BZ6_HUB = { x: 26, y: 11 } as const;
export const BZ6_SLOT = { x: 26, y: 1.6 } as const;
export const BZ6_KNOB = { x: 3.5, y: 3 } as const;

// ── A POPCORN TUB ───────────────────────────────────────────────────────────
//
// REFERENCE (a carnival popcorn box: white card with red STRIPES that run down the
// tapering sides, a rolled RIM, and the popcorn heaped ABOVE the rim in puffy lumps). Real
// units 20 × 28, the foot at the bottom.
const BZ6_POPCORN: ObjPart[] = bz6In(20, 28, [
  ...bz6N('bz6Kernel', oEll('mass', 5.6, 8, 9, 8), oEll('mass', 10.5, 5, 10, 9), oEll('mass', 15, 7.6, 9, 8)),
  ...bz6N('bz6PopWhite', ...trapezoid('mass', 10, 18.5, 18, 13, 19)),  // the tub, tapering
  ...bz6N('bz6PopRed',
    oBar('dark', 4.2, 10.5, 5.6, 27, 2.6),                              // its stripes
    oBar('dark', 10, 10.5, 10, 27, 2.6),
    oBar('dark', 15.8, 10.5, 14.4, 27, 2.6),
  ),
  ...bz6N('bz6PopWhite', oRect('mass', 10, 10, 19, 2.6, 0, 1.2)),       // the rolled rim
]);
export const bz6Popcorn = (x: number, y: number, w: number, h: number) => fit(BZ6_POPCORN, x, y, w, h);

// ── A GLOW STICK IN A TIN CUP ───────────────────────────────────────────────
//
// REFERENCE ("Green glowstick on black background"). A glow stick is a thin translucent
// TUBE, rounded at both ends, lit evenly along its length in a hard bright green with a
// paler core. It stands here in a little tin CUP on the ledge. Real units 12 × 34.
const BZ6_GLOW: ObjPart[] = bz6In(12, 34, [
  ...bz6N('bz6Glow', oBar('mass', 6, 4, 6.4, 25, 3.6)),                // the stick
  oBar('lit', 5.4, 6.5, 5.7, 22, 1),                                   // its bright core
  ...bz6N('silver', ...trapezoid('mass', 6, 28.5, 11, 9, 11)),         // the tin cup
  ...bz6N('silver', oRect('face', 9.4, 29, 2.6, 9, 0, 0.8)),           // its side, from the lamp
  oBar('line', 1, 23.3, 11, 23.3, 0.7),                                // its rim
]);
export const bz6Glow = (x: number, y: number, w: number, h: number) => fit(BZ6_GLOW, x, y, w, h);

// ── A BARREL ────────────────────────────────────────────────────────────────
//
// REFERENCE (a wine cask stood on end). STAVES that bulge a little at the middle, two iron
// HOOPS, and a round head seen from a little above. Real units 20 × 32.
const BZ6_BARREL: ObjPart[] = bz6In(20, 32, [
  ...bz6N('bark', oRect('mass', 10, 17, 20, 30, 0, 6)),             // the bulging body
  ...bz6N('bark', oRect('face', 16.6, 17.5, 6, 27, 0, 3)),          // its side, from the lamp
  ...bz6N('bark', oBar('dark', 5, 5, 4.5, 29, 0.6), oBar('dark', 10, 5, 10, 30.5, 0.6), oBar('dark', 15, 5, 15.5, 29, 0.6)),
  ...bz6N('bz6Iron', oBar('mass', 0.6, 9, 19.4, 9, 2), oBar('mass', 0.6, 25, 19.4, 25, 2)), // the hoops
  ...bz6N('oak', oEll('mass', 10, 2.6, 18, 5)),                       // the head, lit
]);
export const bz6Barrel = (x: number, y: number, w: number, h: number) => fit(BZ6_BARREL, x, y, w, h);

// ── A WALL LANTERN ──────────────────────────────────────────────────────────
//
// REFERENCE ("Exterior wall lantern in the Castle of Onet-le-Château"). An iron WALL PLATE,
// an ARM standing out from it with a BRACE under it, and the lantern standing ON the end of
// the arm: a tapering GLASS body in an iron frame, a pyramid CAP and a finial, a squat
// BASE. Real units 22 × 33, the wall on the left; `bz6LanternR` faces the other way.
const BZ6_LANTERN_PARTS: ObjPart[] = [
  ...bz6N('bz6Iron',
    oRect('mass', 1.5, 25, 3, 15, 0, 0.8),                             // the wall plate
    oBar('mass', 2, 27, 17, 27, 1.6),                                  // the arm
    oTri('mass', 16, 5.5, 13, 6, 'up'),                                // the pyramid cap
    oRect('mass', 16, 24, 9, 3, 0, 1),                                 // the base
  ),
  ...bz6N('bz6LampGlass', oRect('mass', 16, 15.5, 10, 14, 0, 1)),      // the glass, glowing
  oBar('line', 16, 9, 16, 22, 0.6),                                    // the frame's corner
  oBar('line', 15.4, 0.8, 15.4, 3, 0.9),                               // the finial
];
const BZ6_LANTERN: ObjPart[] = bz6In(22, 33, BZ6_LANTERN_PARTS);
const BZ6_LANTERN_R: ObjPart[] = bz6In(22, 33, bz6Mirror(22, BZ6_LANTERN_PARTS));
export const bz6Lantern = (x: number, y: number, w: number, h: number) => fit(BZ6_LANTERN, x, y, w, h);
export const bz6LanternR = (x: number, y: number, w: number, h: number) => fit(BZ6_LANTERN_R, x, y, w, h);
/** The glass's middle, where the flame burns, in the lantern's own units (wall on the left). */
export const BZ6_LAMP_FLAME = { x: 16, y: 16 } as const;

// ── A WALL TORCH, AND ITS BRACKET ───────────────────────────────────────────
//
// REFERENCE (a castle's iron torch sconce). An iron PLATE on the wall with a RING standing
// out from it, and the torch held in the ring: a wooden SHAFT with an iron CUP of pitch at
// the top. In a haunted castle the torch is also a lever: pull it down and a wall turns.
// The torch is drawn about its pivot, the ring, at (6, 18); the plate is separate and
// stays put. Real units 12 × 30 and 6 × 14.
const BZ6_TORCH: ObjPart[] = bz6In(12, 30, [
  ...bz6N('bark', oBar('mass', 6, 27, 6, 7, 2.6)),                   // the shaft
  ...bz6N('bz6Iron', oRect('mass', 6, 18, 7.5, 2.6, 0, 1)),            // the ring that holds it
  ...bz6N('bz6Iron', ...trapezoid('mass', 6, 5, 8, 5, 5)),             // the cup of pitch
  oBar('line', 2.4, 3, 9.6, 3, 0.8),                                   // its rolled lip
]);
export const bz6Torch = (x: number, y: number, w: number, h: number) => fit(BZ6_TORCH, x, y, w, h);
export const BZ6_TORCH_PIVOT = { x: 6, y: 18 } as const;
const BZ6_TORCH_PLATE: ObjPart[] = bz6In(6, 14, [
  ...bz6N('bz6Iron', oRect('mass', 3, 7, 5, 14, 0, 1)),
  oEll('lit', 3, 2.5, 1.4, 1.4), oEll('lit', 3, 11.5, 1.4, 1.4),       // its rivets
  ...bz6N('bz6Iron', oRect('face', 4.6, 7, 1.6, 12, 0, 0.5)),
]);
export const bz6TorchPlate = (x: number, y: number, w: number, h: number) => fit(BZ6_TORCH_PLATE, x, y, w, h);

// ── A BRASS BELL ────────────────────────────────────────────────────────────
// REFERENCE (a counter's ring bell on a bracket). A flared brass BODY, a rolled LIP, the
// CLAPPER under it. Real units 10 × 13, drawn about its hanger at the top (5, 0).
const BZ6_BELL: ObjPart[] = bz6In(10, 13, [
  oBar('line', 5, 0.4, 5, 3, 0.9),                                     // the hanger
  ...bz6N('g5Gold', oEll('mass', 5, 7, 7, 9)),                         // the body
  ...bz6N('g5Gold', oRect('mass', 5, 10.3, 10, 2.2, 0, 1)),            // the lip
  ...bz6N('g5Gold', oRect('face', 7.2, 7.4, 2, 4.6, 0, 1)),            // its side, from the lamp
  oEll('line', 5, 12, 2.2, 2.2),                                       // the clapper
]);
export const bz6Bell = (x: number, y: number, w: number, h: number) => fit(BZ6_BELL, x, y, w, h);

// ── THE BIG MECHANICAL COUNTER ──────────────────────────────────────────────
//
// REFERENCE ("Mechanical Tally Counter"; "Technics RS-M270x mechanical counter"). A counter
// is a row of DRUMS, each printed 0–9 in white on black, seen through WINDOWS in a case;
// the drums roll, and the next number shows creeping in above the one in the window. This
// one is built big, to hang over a gate where every guest sees it: an oxblood iron CASE
// with gilt edging and four corner RIVETS, the drums behind a dark recessed STRIP (the
// scene draws the drums). Real units 146 × 40; the strip spans 29–117 × 15.5–37.5.
const BZ6_COUNTER: ObjPart[] = bz6In(146, 40, [
  ...bz6N('g5Gold', oRect('mass', 73, 20, 146, 40, 0, 5)),             // the gilt edging
  ...bz6N('bz6CounterRed', oRect('mass', 73, 20, 140, 34, 0, 4)),      // the case
  ...bz6N('bz6Iron', oRect('dark', 73, 26.5, 88, 22, 0, 2)),           // the recessed strip
  oEll('lit', 6, 6, 2.2, 2.2), oEll('lit', 140, 6, 2.2, 2.2),          // the rivets
  oEll('lit', 6, 34, 2.2, 2.2), oEll('lit', 140, 34, 2.2, 2.2),
]);
export const bz6Counter = (x: number, y: number, w: number, h: number) => fit(BZ6_COUNTER, x, y, w, h);

// ── A CHALKBOARD (THE BACK OF A SECRET PANEL) ───────────────────────────────
// REFERENCE (a schoolroom slate in an oak frame, with a chalk TRAY along its foot). Real
// units 60 × 82: the slate spans 4–56 × 4–70, the tray's top at 74.
const BZ6_BOARD: ObjPart[] = bz6In(60, 82, [
  ...bz6N('oak', oRect('mass', 30, 38, 60, 76, 0, 2)),                 // the frame
  ...bz6N('slate', oRect('mass', 30, 37, 52, 66, 0, 1)),               // the slate
  ...bz6N('oak', oRect('mass', 30, 77, 58, 5, 0, 1.5)),                // the tray
]);
export const bz6Board = (x: number, y: number, w: number, h: number) => fit(BZ6_BOARD, x, y, w, h);

// ── A JACK-O'-LANTERN ───────────────────────────────────────────────────────
// REFERENCE (a carved pumpkin: a squat orange body of RIBBED lobes, a short green STEM,
// triangle eyes and a grin with the candlelight showing through). Real units 20 × 16.
const BZ6_PUMPKIN: ObjPart[] = bz6In(20, 16, [
  ...bz6N('bz6Pumpkin', oEll('mass', 5.5, 10, 10, 11), oEll('mass', 14.5, 10, 10, 11), oEll('mass', 10, 10, 12, 12)),
  ...bz6N('marketCanvas', oBar('mass', 10, 4.6, 11.4, 1.2, 1.8)),      // the stem
  ...bz6N('bz6Carve', oTri('dark', 7.4, 8.6, 3, 2.6, 'up'), oTri('dark', 12.6, 8.6, 3, 2.6, 'up')), // the eyes
  ...bz6N('bz6Carve', oRect('dark', 10, 12, 7, 2, 0, 1)),              // the grin
]);
export const bz6Pumpkin = (x: number, y: number, w: number, h: number) => fit(BZ6_PUMPKIN, x, y, w, h);
// ═══ biz6 END ═══

// ── biz6: objects for this lesson go ABOVE this line ──

// ── econ6 objects (begin) ──
// ─────────────────────────────────────────────────────────────────────────────
// economics-foundations-6 — A PIRATE ISLAND BEACH AT GOLDEN HOUR.
//
// Drawn against pictures fetched with `npm run ref` (scratchpad/ref/ec6*): coconut palms
// on a Thai beach and one against a Fijian sunset (a tall ringed trunk that LEANS and
// curves, a crown of long arching fronds whose leaflets hang down in a comb, ripe
// coconuts bunched under the crown); a nineteenth-century domed chest (a curved lid over a
// box, iron straps and corner bands, a lock plate in the middle) and a heap of Whydah
// coins; Kota Kinabalu's drinking-coconut stall (young GREEN coconuts with their tops
// trimmed to a white cone, heaped on a counter); beached wrecks at Terschelling and
// Squirrel Cove (a tipped hull of dark planks, the bow gone to ribs); a timber jetty on
// posts; a wicker basket with a hooped handle; a red snapper. Each is authored in REAL
// STAGE UNITS and laid into its box by `fit`, like econ5's.
// ─────────────────────────────────────────────────────────────────────────────

/** Parts in a named real colour (AP11). */
const ec6N = (k: NaturalKey, ...ps: ObjPart[]): ObjPart[] => ps.map((p) => ({ ...p, nat: k }));
/** Author in real units (an ax × ay box) and hand it to `fit` as the 100-square. */
function ec6In(ax: number, ay: number, parts: readonly ObjPart[]): ObjPart[] {
  const sx = 100 / ax;
  const sy = 100 / ay;
  const s = 100 / Math.min(ax, ay);
  return parts.map((p) => {
    if (p.k === 'bar') return { ...p, x1: p.x1 * sx, y1: p.y1 * sy, x2: p.x2 * sx, y2: p.y2 * sy, t: p.t * s };
    return { ...p, x: p.x * sx, y: p.y * sy, w: p.w * sx, h: p.h * sy, ...(p.k === 'rect' ? { rad: p.rad * s } : null) } as ObjPart;
  });
}
/**
 * The same for a LONG thing (a cannon's barrel): authored in its real ax × ay and centred
 * in a square of its longer side, so a stroke's weight scales the same along and across.
 */
function ec6Sq(ax: number, ay: number, parts: readonly ObjPart[]): ObjPart[] {
  const S = Math.max(ax, ay);
  return ec6In(S, S, ec6Move((S - ax) / 2, (S - ay) / 2, parts));
}
/** Move parts by (dx, dy), in real units. */
function ec6Move(dx: number, dy: number, parts: readonly ObjPart[]): ObjPart[] {
  return parts.map((p) => (p.k === 'bar'
    ? { ...p, x1: p.x1 + dx, y1: p.y1 + dy, x2: p.x2 + dx, y2: p.y2 + dy }
    : { ...p, x: p.x + dx, y: p.y + dy }) as ObjPart);
}
/** A short stroke from (x, y), `len` long at `deg` degrees (0 is right, 90 is down). */
function ec6Ray(role: Role, x: number, y: number, len: number, deg: number, t: number): ObjPart {
  const r = (deg * Math.PI) / 180;
  return oBar(role, x, y, x + Math.cos(r) * len, y + Math.sin(r) * len, t);
}

// ── THE TREASURE CHEST ───────────────────────────────────────────────────────
//
// REFERENCE (Commons: "19th-century chests"): a box with a DOMED lid as wide as itself,
// the dome a quarter of the height; iron bands round the top and foot and two straps
// down the front; a lock plate in the middle under the lid's edge. Seen three-quarter,
// its right end shows as a narrower face in shade. Real 52 × 24 (front 44, end 8). The
// lid is drawn apart in two states — shut (the dome) and flung open (its inside, standing
// up behind the box) — so the scene can turn one into the other about the hinge.
const EC6_CHEST: ObjPart[] = ec6In(52, 24, [
  ...ec6N('ec6Chest', oRect('mass', 22, 12.5, 44, 23, 0, 0.8), oRect('face', 48, 12.4, 8, 21.6, 0, 0.6)),
  ...ec6N('ec6Iron',
    oRect('mass', 22, 2.2, 44, 2.6), oRect('mass', 48, 2.4, 8, 2.4),
    oRect('mass', 22, 22.8, 44, 2.4), oRect('mass', 48, 22.6, 8, 2.2),
    oRect('mass', 7.5, 12.5, 3.2, 23), oRect('mass', 36.5, 12.5, 3.2, 23), oRect('mass', 1.4, 12.5, 2.4, 23),
  ),
  ...ec6N('ec6Gold', oRect('mass', 22, 8.4, 6.6, 7.6, 0, 1.4)),
  ...ec6N('ec6Chest',
    oBar('dark', 10.4, 10, 18.2, 10, 0.6), oBar('dark', 25.8, 10, 33.6, 10, 0.6), oBar('dark', 38.6, 10, 42.6, 10, 0.6),
    oBar('dark', 10.4, 16.4, 33.6, 16.4, 0.6), oBar('dark', 3.4, 16.4, 5.4, 16.4, 0.6), oBar('dark', 38.6, 16.4, 42.6, 16.4, 0.6),
  ),
  oEll('line', 22, 7.8, 1.6, 1.8), oBar('line', 22, 8.4, 22, 10.2, 0.8),
  oEll('line', 48, 11.4, 4.2, 4.4), ...ec6N('ec6Chest', oEll('dark', 48, 11.4, 2.4, 2.6)),
  oEll('lit', 7.5, 5.4, 1, 1), oEll('lit', 36.5, 5.4, 1, 1), oEll('lit', 7.5, 19.6, 1, 1), oEll('lit', 36.5, 19.6, 1, 1),
]);
export const ec6Chest = (x: number, y: number, w: number, h: number) => fit(EC6_CHEST, x, y, w, h);

/** The lid, shut: the dome over the box. Real 52 × 12; its lower half tucks behind the box. */
const EC6_LID: ObjPart[] = ec6In(52, 23, [
  ...ec6N('ec6Chest', oEll('mass', 22, 12, 44, 22), oEll('face', 48, 12.4, 8, 20)),
  ...ec6N('ec6Iron', oRect('mass', 7.5, 8.4, 3.2, 8), oRect('mass', 36.5, 8.4, 3.2, 8), oRect('mass', 22, 11, 44, 2.4), oRect('mass', 48, 11, 8, 2.2)),
  ...ec6N('ec6Chest', oBar('dark', 12, 5.6, 32, 5.6, 0.6)),
  oBar('lit', 13, 2.6, 30, 2.6, 0.7),
]);
export const ec6Lid = (x: number, y: number, w: number, h: number) => fit(EC6_LID, x, y, w, h);

/** The lid flung open: its inside, standing up on the hinge behind the box. Real 52 × 14. */
const EC6_LID_IN: ObjPart[] = ec6In(52, 14, [
  ...ec6N('ec6Chest', oRect('face', 22, 7.6, 44, 13, 0, 1), oRect('face', 48, 7.6, 8, 12, 0, 0.8)),
  ...ec6N('ec6Iron', oRect('mass', 22, 1.5, 44.4, 2.8, 0, 1.2), oRect('mass', 48, 2, 8, 2.4)),
  ...ec6N('ec6Iron', oBar('dark', 7.5, 3, 7.5, 13.6, 3), oBar('dark', 36.5, 3, 36.5, 13.6, 3)),
  ...ec6N('ec6Hull', oBar('dark', 10.4, 7.8, 33.6, 7.8, 0.6)),
]);
export const ec6LidIn = (x: number, y: number, w: number, h: number) => fit(EC6_LID_IN, x, y, w, h);

/**
 * The gold in the chest's mouth: a heap of doubloons proud of the rim (REFERENCE, the
 * Whydah coins: a mound of flat discs lying every way, edges catching the light), with a
 * ruby and a string of pearls. Real 44 × 12; its foot tucks behind the box's front.
 */
const EC6_HEAP: ObjPart[] = ec6In(44, 20, [
  ...ec6N('ec6Gold', oEll('mass', 22, 12, 42, 16), oEll('mass', 12, 8.6, 14, 8), oEll('mass', 29, 7, 18, 10), oEll('mass', 38, 9.6, 10, 6)),
  ...ec6N('ec6Ruby', oEll('mass', 17, 6.4, 3.8, 3.6)),
  ...ec6N('ec6Gold',
    oEll('dark', 7, 9.6, 5, 2), oEll('dark', 22, 9, 5, 2), oEll('dark', 30, 4.4, 5, 2.2), oEll('dark', 36, 8.6, 4.4, 2),
    oEll('dark', 13, 5.6, 4.4, 2), oEll('dark', 26, 10.6, 5, 2),
  ),
  oEll('lit', 27, 5.8, 1.6, 1.6), oEll('lit', 30.4, 6.6, 1.6, 1.6), oEll('lit', 33.8, 7.8, 1.6, 1.6), oEll('lit', 16.4, 5.6, 1.2, 0.8),
  oEll('lit', 10, 7.4, 2, 0.7), oEll('lit', 37, 7.2, 1.6, 0.6),
]);
export const ec6Heap = (x: number, y: number, w: number, h: number) => fit(EC6_HEAP, x, y, w, h);

/** A gold doubloon, face on. Real 6 × 6. */
const EC6_COIN: ObjPart[] = ec6In(6, 6, [
  ...ec6N('ec6Gold', oEll('mass', 3, 3, 6, 6), oEll('dark', 3, 3, 3.8, 3.8)),
  oEll('lit', 2, 1.9, 1.4, 0.9),
]);
export const ec6Coin = (x: number, y: number, w: number, h: number) => fit(EC6_COIN, x, y, w, h);

// ── THE COCONUTS ─────────────────────────────────────────────────────────────
//
// REFERENCE (Commons: "Coconut Drink Stall KK"): a drinking coconut is a YOUNG green one
// with its top trimmed down to a white cone, so a heap of them reads as green balls each
// wearing a pale cap. The shade on each is its lower right (a body plane, so it is drawn
// in turn and a nut in front covers the one behind). Real 12 × 13.
const ec6Nut = (dx: number, dy: number): ObjPart[] => ec6Move(dx, dy, [
  ...ec6N('ec6Coco', oEll('mass', 6, 8, 12, 10), oEll('face', 7.6, 9.6, 7.4, 6)),
  ...ec6N('ec6CocoTop', oEll('mass', 6, 3.2, 6.4, 4.4)),
]);
const EC6_NUT: ObjPart[] = ec6In(12, 13, [...ec6Nut(0, 0), oEll('lit', 3.4, 6.6, 1.8, 1), ...ec6N('ec6CocoTop', oEll('dark', 6, 2.2, 3, 1.2))]);
export const ec6Coconut = (x: number, y: number, w: number, h: number) => fit(EC6_NUT, x, y, w, h);

/**
 * Eleven of the twelve, heaped on the counter: five, four, and two on top (the twelfth
 * sits on top too, drawn apart so it can be taken). Drawn from the back row forward, so
 * each nut's shaded lower right is covered by the nuts in front of it. Real 62 × 31.
 */
const EC6_NUTS: ObjPart[] = ec6In(62, 31, [
  ...ec6Nut(25, 0), ...ec6Nut(37, 0),
  ...ec6Nut(7, 9), ...ec6Nut(19, 9), ...ec6Nut(31, 9), ...ec6Nut(43, 9),
  ...ec6Nut(1, 18), ...ec6Nut(13, 18), ...ec6Nut(25, 18), ...ec6Nut(37, 18), ...ec6Nut(49, 18),
]);
export const ec6Nuts = (x: number, y: number, w: number, h: number) => fit(EC6_NUTS, x, y, w, h);

// ── THE STALL ────────────────────────────────────────────────────────────────
//
// A counter knocked up from planks and painted sea blue, a top board of plain wood, and
// the seller's chalk SLATE in a wooden frame fixed along its front (the words on it are
// the scene's, in Views). Real 156 × 36; the right end recedes in shade.
const EC6_STALL: ObjPart[] = ec6In(156, 36, [
  ...ec6N('ec6Stall', oRect('mass', 73, 19.4, 146, 30), oRect('face', 150, 19, 8, 29)),
  ...ec6N('wood', oRect('mass', 75, 2.2, 152, 4.4, 0, 1), oRect('mass', 4, 35, 6, 2.4), oRect('mass', 142, 35, 6, 2.4), oRect('mass', 151, 34.6, 4, 2.2)),
  ...ec6N('wood', oRect('mass', 73, 19.8, 140, 26, 0, 1)),
  ...ec6N('slate', oRect('mass', 73, 19.8, 135, 21.4, 0, 0.6)),
  ...ec6N('ec6Stall', oBar('dark', 152, 8, 152, 31, 0.5)),
  oBar('lit', 4, 0.9, 146, 0.9, 0.6),
]);
export const ec6Stall = (x: number, y: number, w: number, h: number) => fit(EC6_STALL, x, y, w, h);

// ── THE COCONUT PALM ─────────────────────────────────────────────────────────
//
// REFERENCE (Commons: "Sunset with coconut palm tree, Fiji"; "Koh Mak … palm trees"): the
// trunk is TALL, thin for its height, a little swollen at the foot and ringed all the way
// up; it LEANS and bows toward the light. The crown is a spray of long fronds, each an
// arching midrib with its leaflets hanging below it like the teeth of a comb, and the
// coconuts bunch under the crown where the fronds spring. Real 60 × 214: the foot at
// (10, 212), the crown at (52, 6).
const ec6Bow = (u: number) => {
  const v = 1 - u;
  return { x: v * v * 10 + 2 * v * u * 6 + u * u * 52, y: v * v * 209 + 2 * v * u * 96 + u * u * 6 };
};
const EC6_TRUNK: ObjPart[] = ec6In(60, 214, [
  ...ec6N('ec6Trunk', ...trapezoid('mass', 10, 207, 9, 16, 10)),
  ...ec6N('ec6Trunk', ...[0, 1, 2, 3, 4, 5].map((k) => {
    const p = ec6Bow(k / 6);
    const q = ec6Bow((k + 1) / 6);
    return oBar('mass', p.x, p.y, q.x, q.y, 9.4 - k * 0.7);
  })),
  ...ec6N('ec6Trunk', ...[0.08, 0.2, 0.32, 0.44, 0.56, 0.68, 0.8].map((u) => {
    const p = ec6Bow(u);
    const q = ec6Bow(u + 0.01);
    const len = Math.hypot(q.x - p.x, q.y - p.y);
    const nx = -(q.y - p.y) / len;
    const ny = (q.x - p.x) / len;
    const h = (9 - u * 4.2) / 2;
    return oBar('dark', p.x - nx * h, p.y - ny * h, p.x + nx * h * 0.4, p.y + ny * h * 0.4, 0.9);
  })),
]);
export const ec6Trunk = (x: number, y: number, w: number, h: number) => fit(EC6_TRUNK, x, y, w, h);

/**
 * One frond, springing from the crown at its LEFT end and arching out to the right: a
 * midrib that rises and then droops, and a comb of leaflets hanging from it, longest at
 * the middle. Real 74 × 34, the crown at (2, 8). The scene turns and mirrors it.
 */
const EC6_FROND: ObjPart[] = ec6In(74, 38, ec6Move(0, 4, [
  ...ec6N('ec6Frond', oBar('mass', 2, 8, 22, 3.6, 2.8), oBar('mass', 22, 3.6, 44, 5, 2.2), oBar('mass', 44, 5, 62, 13, 1.6), oBar('mass', 62, 13, 72, 22, 1)),
  ...ec6N('ec6Frond', ...[
    [11, 6.2, 14, 70], [20, 4.6, 18, 75], [29, 4.2, 20, 78], [38, 5, 19, 79], [47, 6.6, 17, 76], [56, 10, 14, 72], [64, 14.6, 10, 66],
  ].map(([x, y, len, deg]) => ec6Ray('dark', x, y, len, deg, 1.8))),
  ...ec6N('ec6Frond', ...[[22, 4.2, 8, -56], [38, 4.4, 8, -44]].map(([x, y, len, deg]) => ec6Ray('dark', x, y, len, deg, 1.5))),
]));
export const ec6Frond = (x: number, y: number, w: number, h: number) => fit(EC6_FROND, x, y, w, h);

/** Ripe coconuts bunched under the crown. Real 20 × 12. */
const EC6_BUNCH: ObjPart[] = ec6In(20, 12, [
  ...ec6N('ec6CocoRipe', oEll('mass', 5, 5, 8, 8), oEll('mass', 14, 4.6, 8, 8), oEll('mass', 9.6, 8, 8, 8), oEll('face', 11.4, 9.6, 4.4, 3.6)),
  oEll('lit', 3.6, 3.4, 1.6, 1), oEll('lit', 12.6, 3, 1.6, 1),
]);
export const ec6Bunch = (x: number, y: number, w: number, h: number) => fit(EC6_BUNCH, x, y, w, h);

// ── THE WRECK ────────────────────────────────────────────────────────────────
//
// REFERENCE (Commons: "Shipwreck terschelling", "Shipwreck on Squirrel Cove Beach"): a hull
// lying TIPPED among rocks, dark wet planks running its length, the bow end broken open
// so its ribs stand up bare like a comb, and here the stump of a mast with a spar still
// across it and a rag of sail. Real 120 × 70; the rocks along the foot.
const EC6_WRECK: ObjPart[] = ec6In(120, 70, [
  // the bow is gone to its ribs: bare frames curving up off the keel, sea between them
  ...ec6N('ec6Hull',
    oBar('mass', 13, 52, 6, 31, 2.6), oBar('mass', 21, 51, 16, 28, 2.6), oBar('mass', 29, 50, 26, 26, 2.6), oBar('mass', 37, 49, 36, 25, 2.6),
    oBar('mass', 8, 53, 66, 50, 4),
  ),
  // the stern half still planked, tipped and settled on the rocks, its cabin standing up
  ...ec6N('ec6Hull', oEll('mass', 78, 46, 78, 24, -10), oRect('mass', 80, 37, 70, 12, -10, 2), oRect('mass', 108, 27, 18, 18, -10, 1.6)),
  // the mast snapped off short and leaning, a broken spar across it and a rag of sail
  ...ec6N('ec6Hull', oBar('mass', 82, 33, 73, 9, 3.4), oBar('mass', 73, 9, 71.4, 5.6, 1.8), oBar('mass', 64, 17, 86, 13.4, 1.6)),
  ...ec6N('ec6Sail', oTri('mass', 72, 21, 13, 12, 'down')),
  ...ec6N('ec6Rock', oEll('mass', 18, 62, 36, 16), oEll('mass', 54, 64, 50, 13), oEll('mass', 96, 61, 42, 18), oEll('face', 102, 64, 26, 10)),
  ...ec6N('ec6Hull', oBar('dark', 52, 44, 112, 33, 0.8), oBar('dark', 50, 50, 114, 39, 0.8), oBar('dark', 56, 55, 108, 46, 0.8)),
  ...ec6N('gloom', oEll('dark', 47, 46, 9, 8, -10)),
  ...ec6N('ec6Hull', oRect('dark', 108, 26, 8, 6, -10, 1)),
  ...ec6N('ec6Sail', oBar('dark', 70, 16, 74, 26, 0.6)),
  ...ec6N('leaf', oEll('dark', 30, 56.6, 18, 3), oEll('dark', 74, 57.6, 22, 3)),
  ...ec6N('ec6Rock', oEll('dark', 16, 66, 30, 6), oEll('dark', 56, 67, 34, 5)),
]);
export const ec6Wreck = (x: number, y: number, w: number, h: number) => fit(EC6_WRECK, x, y, w, h);

// ── THE JETTY ────────────────────────────────────────────────────────────────
//
// REFERENCE (Commons: "Shorncliffe Jetty"; "Wooden pier"): a plank deck on a row of round
// posts standing in the water, braced, the deck's edge a darker strip below it. Real
// 170 × 32, the deck's top at y 0.6.
const EC6_JETTY: ObjPart[] = ec6In(170, 32, [
  ...ec6N('oldWood', ...[8, 48, 88, 128, 164].map((x) => oBar('mass', x, 4, x, 32, 4.2))),
  ...ec6N('oldWood', oRect('mass', 85, 3, 170, 5), oRect('face', 85, 6.5, 170, 2.2)),
  ...ec6N('oldWood', oBar('dark', 10, 10, 46, 24, 1.2), oBar('dark', 50, 10, 86, 24, 1.2), oBar('dark', 90, 10, 126, 24, 1.2), oBar('dark', 130, 10, 162, 24, 1.2)),
  ...ec6N('oldWood', ...[28, 68, 108, 148].map((x) => oBar('dark', x, 1.2, x, 5, 0.5))),
  oBar('lit', 1, 1, 169, 1, 0.6),
]);
export const ec6Jetty = (x: number, y: number, w: number, h: number) => fit(EC6_JETTY, x, y, w, h);

// ── THE CARGO ────────────────────────────────────────────────────────────────
//
// A pine crate of slats, battens at its corners and a brace across, its lid a separate
// board so it can pop. Real 46 × 38 (front 42, end 4); the lid 46 × 5.
const EC6_CRATE: ObjPart[] = ec6In(46, 38, [
  ...ec6N('ec6Crate', oRect('mass', 21, 19.4, 42, 37, 0, 0.6), oRect('face', 44, 19, 4, 35)),
  ...ec6N('ec6Crate', oBar('dark', 3, 2, 3, 37, 2.6), oBar('dark', 39, 2, 39, 37, 2.6), oBar('dark', 4, 34, 38, 4, 2.2)),
  ...ec6N('ec6Crate', oBar('dark', 4.6, 13, 37.4, 13, 0.5), oBar('dark', 4.6, 25.6, 37.4, 25.6, 0.5)),
]);
export const ec6Crate = (x: number, y: number, w: number, h: number) => fit(EC6_CRATE, x, y, w, h);
const EC6_CRATE_LID: ObjPart[] = ec6In(46, 5, [
  ...ec6N('ec6Crate', oRect('mass', 21.5, 2.5, 45, 4.4, 0, 0.6), oRect('face', 44.5, 3, 3, 4)),
  oBar('lit', 1.4, 1, 41.6, 1, 0.5),
]);
export const ec6CrateLid = (x: number, y: number, w: number, h: number) => fit(EC6_CRATE_LID, x, y, w, h);

/** A red snapper (REFERENCE, Lutjanus campechanus): deep body, spiny dorsal fin, forked tail. Real 22 × 10. */
const EC6_FISH: ObjPart[] = ec6In(22, 10, [
  ...ec6N('ec6Fish', oEll('mass', 9.4, 5.2, 16, 8), oTri('mass', 18.6, 5.2, 6, 8, 'left'), oTri('mass', 9, 1.2, 9, 3, 'up'), oEll('face', 10, 7.4, 12, 3.2)),
  oEll('line', 4, 4.2, 1.8, 1.8), oEll('lit', 3.8, 4, 0.7, 0.7),
  ...ec6N('ec6Fish', oBar('dark', 6.6, 2.8, 6.2, 7.4, 0.6)),
]);
export const ec6Fish = (x: number, y: number, w: number, h: number) => fit(EC6_FISH, x, y, w, h);

/** A cannon's barrel poking from its crate: a tapering iron tube with a muzzle ring. Real 26 × 9, centred in a 26-square. */
const EC6_CANNON: ObjPart[] = ec6Sq(26, 9, [
  ...ec6N('ec6Iron', oBar('mass', 5, 4.5, 21.6, 4.5, 6.4), oEll('mass', 3.4, 4.5, 6.4, 8.4), oRect('mass', 23.4, 4.5, 3.6, 7.6, 0, 0.8)),
  ...ec6N('ec6Iron', oEll('dark', 24.4, 4.5, 1.6, 4.2), oBar('dark', 9, 1.6, 9, 7.4, 0.6)),
  oBar('lit', 6, 2.6, 20, 2.6, 0.6),
]);
export const ec6Cannon = (x: number, y: number, w: number, h: number) => fit(EC6_CANNON, x, y, w, h);

/** A ship far out, sails set: two masts, square sails, a dark hull, a pennant. Real 40 × 34. */
const EC6_SHIP: ObjPart[] = ec6In(40, 34, [
  ...ec6N('ec6Sail', oRect('mass', 14, 13, 12, 14, 0, 1.4), oRect('mass', 28, 11.4, 13, 17, 0, 1.4), oTri('mass', 37, 18, 7, 12, 'right')),
  ...ec6N('ec6ShipHull', ...trapezoid('mass', 20, 28.6, 38, 28, 6.4), oRect('mass', 8, 23.6, 9, 4.4)),
  ...ec6N('ec6Ruby', oTri('mass', 30.6, 1.6, 5, 2.6, 'right')),
  oBar('line', 14, 4, 14, 26, 0.8), oBar('line', 28, 1.4, 28, 26, 0.8),
  ...ec6N('ec6Sail', oBar('dark', 9, 13, 19, 13, 0.6), oBar('dark', 22.4, 11, 33.6, 11, 0.6)),
]);
export const ec6Ship = (x: number, y: number, w: number, h: number) => fit(EC6_SHIP, x, y, w, h);

/**
 * A wicker basket with a hooped handle (REFERENCE, "Eggs in basket": a round body wider
 * at the rim, a rolled rim, a high hoop). Drawn about its GRIP, the top of the hoop, at
 * (9, 1.4). Real 18 × 18.
 */
const EC6_BASKET: ObjPart[] = ec6In(18, 18, [
  ...ec6N('wicker', oBar('mass', 2.6, 9, 4.4, 2.4, 1.4), oBar('mass', 4.4, 2.4, 13.6, 2.4, 1.4), oBar('mass', 13.6, 2.4, 15.4, 9, 1.4)),
  ...ec6N('wicker', ...trapezoid('mass', 9, 13.4, 16, 11.4, 8.4), oRect('mass', 9, 9.4, 17.4, 2.6, 0, 1.2)),
  ...ec6N('wicker', oBar('dark', 3.6, 12.4, 14.4, 12.4, 0.5), oBar('dark', 4.4, 15, 13.6, 15, 0.5), oBar('dark', 9, 10.8, 9, 17.4, 0.5), oBar('dark', 6, 10.8, 6.6, 17.4, 0.5), oBar('dark', 12, 10.8, 11.4, 17.4, 0.5)),
]);
export const ec6Basket = (x: number, y: number, w: number, h: number) => fit(EC6_BASKET, x, y, w, h);
// ── econ6 objects (end) ──

// ── econ6: objects for this lesson go ABOVE this line ──

// ── sci6 objects (begin) ──
// ─────────────────────────────────────────────────────────────────────────────
// science-foundations-6 — BELOW DECKS ON A SHIP OF 1747, the sick bay. Drawn against
// Commons pictures (scratchpad/ref/sc6-*): sailors' hammocks slung from the beams, each
// a canvas sling sagging between two fans of clew lines gathered at a ring on its hook,
// a man's head showing at one end (sc6hammock-3); Robert Thom's "James Lind — Conqueror
// of Scurvy": whitewashed planking, dark beams and knees, square tin lanterns with glowing
// panes and a pyramid cap, a basket of oranges and lemons (sc6lind-1); the Vasa's lower
// gun deck, its round mast standing through the deck in a collar (sc6gundeck-1); an
// onion bottle of about 1700, a squat green globe on a short neck (sc6onion-3); glass
// medicine bottles with corks, tall, with a shoulder (sc6med-2); a log book (sc6chest2-1).
// ─────────────────────────────────────────────────────────────────────────────

/** Parts in one named real colour. */
const sc6N = (k: NaturalKey, ...ps: ObjPart[]): ObjPart[] => ps.map((p) => ({ ...p, nat: k }));
/** Author in real units (an ax × ay box) and hand it to `fit` as the 100-square. */
function sc6In(ax: number, ay: number, parts: readonly ObjPart[]): ObjPart[] {
  const sx = 100 / ax;
  const sy = 100 / ay;
  const s = 100 / Math.min(ax, ay);
  return parts.map((p) => {
    if (p.k === 'bar') return { ...p, x1: p.x1 * sx, y1: p.y1 * sy, x2: p.x2 * sx, y2: p.y2 * sy, t: p.t * s };
    return { ...p, x: p.x * sx, y: p.y * sy, w: p.w * sx, h: p.h * sy, ...(p.k === 'rect' ? { rad: p.rad * s } : null) } as ObjPart;
  });
}

// ── A HAMMOCK, SLUNG FROM THE BEAMS ─────────────────────────────────────────
//
// REFERENCE (sc6hammock-3). A ship's hammock seen along its length is a canvas sling
// that sags between its two ends; each end is gathered into a fan of thin clew lines
// that meet at a ring on a hook in the beam above. A man asleep in it is a long lump
// under his blanket, the canvas closing up round him so it reads as a cocoon. Real units
// 44 × 60: the hooks at the top, the ends of the canvas at 36, the sag at 52.
function sc6Clews(x0: number, y0: number, ends: [number, number][]): ObjPart[] {
  return [oEll('line', x0, y0, 2.6, 2.6), ...ends.map(([x, y]) => oBar('line', x0, y0 + 1, x, y, 0.45))];
}
const SC6_HAMMOCK_FULL: ObjPart[] = sc6In(44, 60, [
  ...sc6Clews(3, 1.6, [[5, 34], [7.4, 37], [9.6, 39]]),
  ...sc6Clews(41, 1.6, [[39, 34], [36.6, 37], [34.4, 39]]),
  ...sc6N('sc6Blanket', oEll('mass', 22, 41, 24, 11)),                // the sleeper, under his blanket
  ...sc6N('sc6Canvas',
    oEll('mass', 11.4, 42.4, 17, 10, 28),                             // the sling sags to the middle and
    oEll('mass', 32.6, 42.4, 17, 10, -28),                            // rises to both ends: a banana
    oEll('mass', 22, 48.4, 22, 11),                                   // closing round him
    oEll('mass', 5.2, 38, 6.4, 7.6),                                  // the ends, gathered
    oEll('mass', 38.8, 38, 6.4, 7.6),
    oEll('face', 24, 51, 16, 5),                                      // its under-side, in shade
  ),
  oBar('lit', 11, 45.2, 33, 45.2, 0.6),                               // the lamp along its rim
]);
export const sc6HammockFull = (x: number, y: number, w: number, h: number) => fit(SC6_HAMMOCK_FULL, x, y, w, h);

/** The same hammock with nobody in it: the canvas hangs limp and lower, its blanket folded in it. */
const SC6_HAMMOCK_EMPTY: ObjPart[] = sc6In(44, 60, [
  ...sc6Clews(3, 1.6, [[5, 38], [7.4, 41], [9.6, 43]]),
  ...sc6Clews(41, 1.6, [[39, 38], [36.6, 41], [34.4, 43]]),
  ...sc6N('sc6Canvas',
    oEll('mass', 11.4, 46.4, 17, 6, 30),
    oEll('mass', 32.6, 46.4, 17, 6, -30),
    oEll('mass', 22, 51, 18, 6),
    oEll('mass', 5.2, 42, 6, 7),
    oEll('mass', 38.8, 42, 6, 7),
    oEll('face', 23, 52.4, 12, 2.6),
  ),
  ...sc6N('sc6Blanket', oRect('dark', 20, 47.4, 12, 2.6, 0, 1)),      // the blanket, folded in it
]);
export const sc6HammockEmpty = (x: number, y: number, w: number, h: number) => fit(SC6_HAMMOCK_EMPTY, x, y, w, h);

// ── THE SICK MAN'S HAMMOCK, SLUNG LOW ───────────────────────────────────────
//
// The sick were slung low, at a cot's height, so the surgeon could reach them. Drawn
// behind the man who lies in it: the two fans of clews from their hooks under the beam,
// the far side of the canvas behind his body and its near rim below it, and a pillow at
// the head end (the right). Real units 104 × 186: the hooks at 0, the canvas's ends at
// 160, the bed he lies on at 172, the sag at 182.
const SC6_COT: ObjPart[] = sc6In(104, 186, [
  ...sc6Clews(3, 1.6, [[6, 160], [9, 164], [12, 167]]),
  ...sc6Clews(101, 1.6, [[98, 160], [95, 164], [92, 167]]),
  ...sc6N('sc6Canvas',
    oEll('mass', 52, 170, 98, 24),                                    // the sling
    oEll('mass', 5.6, 162, 8, 11),                                    // the ends, gathered
    oEll('mass', 98.4, 162, 8, 11),
    oEll('face', 52, 166, 82, 10),                                    // its far side, inside, in shade
    oEll('face', 56, 178, 70, 6),                                     // its under-side
  ),
  ...sc6N('paper', oEll('mass', 88, 164, 16, 7)),                     // the pillow, at the head end
  oBar('lit', 12, 173, 92, 173, 0.7),                                 // the near rim, catching the lamp
]);
export const sc6Cot = (x: number, y: number, w: number, h: number) => fit(SC6_COT, x, y, w, h);
/** The cot's measures, in its own 104 × 186: the bed he lies on and the hooks. */
export const SC6_COT_AT = { bed: 172, end: 160, of: { w: 104, h: 186 } } as const;

/** His blanket, over him while he lies sick; thrown off to the foot when he gets up. Real 60 × 12. */
const SC6_BLANKET: ObjPart[] = sc6In(60, 12, [
  ...sc6N('sc6Blanket',
    oEll('mass', 30, 6, 60, 11),
    oEll('face', 34, 8.4, 46, 4.6),
  ),
  oBar('lit', 8, 3, 50, 3, 0.6),
  oBar('line', 14, 2, 14, 10, 0.5),                                   // the woven stripe at its end
]);
export const sc6Blanket = (x: number, y: number, w: number, h: number) => fit(SC6_BLANKET, x, y, w, h);

// ── A SHIP'S LANTERN ─────────────────────────────────────────────────────────
//
// REFERENCE (sc6lind-1). A square lantern of dark pierced tin: a ring at the top, a
// pyramid cap, a band, glowing panes of horn between the corner posts, and a base. Real
// 16 × 30, hung by its ring.
const SC6_LANTERN: ObjPart[] = sc6In(16, 30, [
  oEll('line', 8, 1.6, 3.2, 3.2),
  ...sc6N('sc6Tin',
    oTri('mass', 8, 7.4, 14, 7, 'up'),                                // the pyramid cap
    oRect('mass', 8, 11.6, 15, 2.4, 0, 0.6),                          // its band
    oRect('mass', 8, 19.4, 13.6, 14),                                 // the frame
    oRect('mass', 8, 27.6, 15, 3.2, 0, 0.8),                          // the base
    oRect('face', 13.2, 19.4, 3.2, 13.6),                             // the side turned from the lamp
  ),
  ...sc6N('sc6Glow',
    oRect('dark', 4.9, 19.4, 3.6, 11), oRect('dark', 9.9, 19.4, 3.6, 11),  // the horn panes, lit from inside
  ),
  oBar('line', 2, 8.6, 14, 8.6, 0.4),                                 // the cap's vents
]);
export const sc6Lantern = (x: number, y: number, w: number, h: number) => fit(SC6_LANTERN, x, y, w, h);

// ── THE MAST, STANDING THROUGH THE DECK ─────────────────────────────────────
//
// REFERENCE (sc6gundeck-1). Below decks the mast is a great round column of pine that
// comes down through the deck above and goes on down through the deck below, wedged in
// a wooden collar (the partners) at each, and bound with iron hoops. Real 34 × 230.
const SC6_MAST: ObjPart[] = sc6In(34, 230, [
  ...sc6N('sc6Pine',
    oRect('mass', 17, 115, 20, 230, 0, 1.4),
    oRect('face', 23.4, 115, 7, 228),                                 // the round of it, turned from the lamp
  ),
  ...sc6N('sc6Timber',
    oRect('mass', 17, 4.4, 34, 8.8, 0, 1.4),                          // the partners, at the deckhead
    oRect('mass', 17, 223, 32, 14, 0, 2.4),                           // and on the deck
  ),
  ...sc6N('iron',
    oRect('dark', 17, 40, 20, 3), oRect('dark', 17, 47, 20, 3),       // iron hoops
    oRect('dark', 17, 176, 20, 3), oRect('dark', 17, 183, 20, 3),
  ),
  oBar('lit', 10, 14, 10, 212, 1.2),                                  // the lamp down its rounded face
]);
export const sc6Mast = (x: number, y: number, w: number, h: number) => fit(SC6_MAST, x, y, w, h);

// ── THE SURGEON'S SEA CHEST ─────────────────────────────────────────────────
//
// A long sea chest, painted, its lid a separate board, rope beckets at the ends for
// carrying, iron corners and a hasp. Real 144 × 28: the lid's top at 0, the foot at 28.
const SC6_CHEST: ObjPart[] = sc6In(144, 28, [
  ...sc6N('sc6ChestBlue',
    oRect('mass', 72, 16.4, 140, 23.2, 0, 1.2),
    oRect('face', 72, 25.4, 140, 5),                                  // the plinth, in shade
  ),
  ...sc6N('sc6Timber', oRect('mass', 72, 3, 144, 6, 0, 1.2)),         // the lid
  ...sc6N('iron',
    oRect('dark', 5, 9, 6, 4), oRect('dark', 139, 9, 6, 4),           // iron corners
    oRect('dark', 72, 8.4, 5, 6, 0, 0.8),                             // the hasp
  ),
  ...sc6N('s5Rope', oEll('mass', 3, 15, 5, 9), oEll('mass', 141, 15, 5, 9)), // rope beckets
  oBar('line', 48, 7, 48, 23, 0.5), oBar('line', 96, 7, 96, 23, 0.5),       // its panels
  oBar('lit', 3, 1.4, 141, 1.4, 0.7),                                 // the lamp along the lid
]);
export const sc6Chest = (x: number, y: number, w: number, h: number) => fit(SC6_CHEST, x, y, w, h);

/** A small shelf on the planking under the port, on two brackets. Real 48 × 10. */
const SC6_SHELF: ObjPart[] = sc6In(48, 10, [
  ...sc6N('sc6Timber',
    oRect('mass', 24, 2, 48, 4, 0, 0.6),
    oBar('mass', 8, 3, 8, 9.2, 1.6), oBar('mass', 40, 3, 40, 9.2, 1.6),   // the brackets' uprights
    oBar('mass', 8, 9, 14, 3.4, 1.2), oBar('mass', 40, 9, 34, 3.4, 1.2),  // and their braces
  ),
  oBar('lit', 1, 0.6, 47, 0.6, 0.5),
]);
export const sc6Shelf = (x: number, y: number, w: number, h: number) => fit(SC6_SHELF, x, y, w, h);

// ── BOTTLES ──────────────────────────────────────────────────────────────────
//
// THE CAPTAIN'S TONIC (sc6onion-3): an onion bottle, a squat green globe on a short neck
// with a string rim and a cork, seawater showing in it. Real 18 × 28, held by its neck.
function onionParts(glass: NaturalKey, fill: NaturalKey | null): ObjPart[] {
  return sc6In(18, 28, [
    ...sc6N(glass,
      oEll('mass', 9, 19.6, 18, 16.4),
      oRect('mass', 9, 8.4, 6, 10, 0, 1.2),
      oRect('mass', 9, 3.4, 8.2, 2.4, 0, 1),                          // the string rim
      oEll('face', 12.6, 21, 8, 11),
    ),
    ...(fill ? sc6N(fill, oEll('dark', 8.6, 22.6, 13.4, 8.6)) : []),  // what is in it
    ...sc6N('cork', oRect('mass', 9, 1.2, 4.6, 2.4, 0, 0.6)),
    oEll('lit', 5, 16, 2.4, 5),
  ]);
}
const SC6_TONIC = onionParts('sc6Bottle', 'sc6Brine');
export const sc6Tonic = (x: number, y: number, w: number, h: number) => fit(SC6_TONIC, x, y, w, h);
/** Where the hand holds it: the neck, in its own 18 × 28. */
export const SC6_TONIC_GRIP = { x: 9, y: 9, of: { w: 18, h: 28 } } as const;
const SC6_ONION_BROWN = onionParts('sc6PhialBrown', null);
export const sc6OnionBrown = (x: number, y: number, w: number, h: number) => fit(SC6_ONION_BROWN, x, y, w, h);

/** The seawater for the trial, in a square green case bottle. Real 10 × 24. */
const SC6_CASE: ObjPart[] = sc6In(10, 24, [
  ...sc6N('sc6Bottle',
    oRect('mass', 5, 15.4, 10, 17, 0, 1.2),
    oRect('mass', 5, 5.4, 4.4, 6, 0, 0.8),
    ...trapezoid('mass', 5, 7.6, 4.4, 10, 2.6),                       // the shoulder
    oRect('face', 8.4, 15.4, 3, 16),
  ),
  ...sc6N('sc6Brine', oRect('dark', 4.4, 18.4, 6.4, 9.6, 0, 0.8)),
  ...sc6N('cork', oRect('mass', 5, 1.8, 3.4, 3, 0, 0.6)),
  oBar('lit', 2.6, 9.6, 2.6, 21.6, 0.8),
]);
export const sc6CaseBottle = (x: number, y: number, w: number, h: number) => fit(SC6_CASE, x, y, w, h);

/** The vinegar, in a brown stoneware bottle with a cream-glazed shoulder. Real 10 × 24. */
const SC6_VINEGAR: ObjPart[] = sc6In(10, 24, [
  ...sc6N('sc6Stone',
    oRect('mass', 5, 16.4, 10, 15, 0, 2),
    oRect('face', 8.3, 16.4, 3.2, 14),
  ),
  ...sc6N('sc6Glaze',
    oEll('mass', 5, 9.6, 10, 7),                                      // the glazed shoulder
    oRect('mass', 5, 4.6, 4, 5.4, 0, 0.8),                            // the neck
  ),
  ...sc6N('cork', oRect('mass', 5, 1.6, 3.2, 2.6, 0, 0.6)),
  oBar('line', 0.6, 12.4, 9.4, 12.4, 0.5),                           // where the glaze stops
  oBar('lit', 2.4, 14, 2.4, 22, 0.8),
]);
export const sc6Vinegar = (x: number, y: number, w: number, h: number) => fit(SC6_VINEGAR, x, y, w, h);

/**
 * A MEDICINE BOTTLE (sc6med-2): tall, round-shouldered, a short neck with a lip and a
 * cork. Real 16 × 40. The colour is the bottle's own glass.
 */
function phialParts(glass: NaturalKey): ObjPart[] {
  return sc6In(16, 40, [
    ...sc6N(glass,
      oRect('mass', 8, 26.6, 16, 26.8, 0, 2.6),
      oEll('mass', 8, 13.6, 16, 8),                                   // the shoulder
      oRect('mass', 8, 7.6, 6, 7.4, 0, 0.8),                          // the neck
      oRect('mass', 8, 3.8, 8, 2.2, 0, 0.8),                          // the lip
      oRect('face', 12.6, 27, 4.4, 25),
    ),
    ...sc6N('cork', oRect('mass', 8, 1.4, 5, 2.8, 0, 0.6)),
    oBar('lit', 3.6, 16, 3.6, 36, 1.3),
  ]);
}
const SC6_PHIALS = {
  blue: phialParts('sc6PhialBlue'),
  clear: phialParts('sc6PhialClear'),
  brown: phialParts('sc6PhialBrown'),
};
export const sc6Phial = (x: number, y: number, w: number, h: number, glass: keyof typeof SC6_PHIALS = 'clear') => fit(SC6_PHIALS[glass], x, y, w, h);

// ── A BASKET OF ORANGES AND LEMONS (sc6lind-1) ──────────────────────────────
//
// A round wicker basket with a high arched handle, heaped with oranges and lemons. Real
// 32 × 28, held by the top of its handle.
const SC6_BASKET: ObjPart[] = sc6In(32, 28, [
  ...sc6N('sc6Wicker',
    oBar('mass', 5.6, 15, 8.4, 6, 1.8), oBar('mass', 8.4, 6, 16, 1.6, 1.8),
    oBar('mass', 16, 1.6, 23.6, 6, 1.8), oBar('mass', 23.6, 6, 26.4, 15, 1.8),
  ),
  ...sc6N('orange', oEll('mass', 10.6, 14.6, 8, 8), oEll('mass', 22.4, 15, 7.6, 7.6)),
  ...sc6N('lemon', oEll('mass', 16.4, 13.4, 8.6, 6.4, -12)),
  ...sc6N('sc6Wicker',
    ...trapezoid('mass', 16, 21.8, 31, 24, 12.4),
    oRect('face', 25.6, 22, 5, 11.4),
  ),
  oBar('line', 1.4, 19.4, 30.6, 19.4, 0.5), oBar('line', 3.4, 23.6, 28.6, 23.6, 0.5),   // the weave
  oEll('lit', 9, 13, 2, 1.6), oEll('lit', 20.6, 13.4, 2, 1.6),
]);
export const sc6Basket = (x: number, y: number, w: number, h: number) => fit(SC6_BASKET, x, y, w, h);
/** Where the hand holds it: the top of the handle, in its own 32 × 28. */
export const SC6_BASKET_GRIP = { x: 16, y: 1.6, of: { w: 32, h: 28 } } as const;

/** One orange, with its leaf. Real 8 × 8. */
const SC6_ORANGE: ObjPart[] = sc6In(8, 8, [
  ...sc6N('orange', oEll('mass', 4, 4.6, 7.6, 6.8), oEll('face', 5, 5.6, 4.6, 3.6)),
  ...sc6N('leaf', oEll('mass', 5.4, 1.3, 3.2, 1.6)),
  oEll('lit', 2.6, 3.4, 1.8, 1.4),
]);
export const sc6Orange = (x: number, y: number, w: number, h: number) => fit(SC6_ORANGE, x, y, w, h);

// ── THE SURGEON'S LEDGER (sc6chest2-1) ──────────────────────────────────────
//
// Closed, it is a calf-bound book lying on its side on the shelf, the page block showing
// at its fore-edge. Open, two ruled pages in a brown binding, each page one column. Real
// 20 × 6 closed, 36 × 24 open.
const SC6_LEDGER_SHUT: ObjPart[] = sc6In(20, 6, [
  ...sc6N('sc6Leather', oRect('mass', 10, 3, 20, 6, 0, 0.8), oRect('face', 10, 5.2, 20, 1.6)),
  ...sc6N('paper', oRect('mass', 10.6, 3, 17, 2.2)),
  oBar('line', 1.4, 0.8, 1.4, 5.2, 0.6),
]);
export const sc6LedgerShut = (x: number, y: number, w: number, h: number) => fit(SC6_LEDGER_SHUT, x, y, w, h);
const SC6_LEDGER_OPEN: ObjPart[] = sc6In(36, 24, [
  ...sc6N('sc6Leather', oRect('mass', 18, 12.6, 36, 22.6, 0, 1.2)),
  ...sc6N('paper',
    oRect('mass', 9.6, 11.4, 16.4, 20, 0, 0.8),
    oRect('mass', 26.4, 11.4, 16.4, 20, 0, 0.8),
    oRect('face', 18, 11.4, 2, 20),                                   // the gutter
  ),
  oBar('line', 3, 5.4, 16.6, 5.4, 0.5), oBar('line', 19.6, 5.4, 33, 5.4, 0.5),   // the column heads
  oBar('line', 3, 9, 16.6, 9, 0.2), oBar('line', 3, 12.6, 16.6, 12.6, 0.2), oBar('line', 3, 16.2, 16.6, 16.2, 0.2),
  oBar('line', 19.6, 9, 33, 9, 0.2), oBar('line', 19.6, 12.6, 33, 12.6, 0.2), oBar('line', 19.6, 16.2, 33, 16.2, 0.2),
]);
export const sc6LedgerOpen = (x: number, y: number, w: number, h: number) => fit(SC6_LEDGER_OPEN, x, y, w, h);
// ── sci6 objects (end) ──

// ── sci6: objects for this lesson go ABOVE this line ──

// ── hist6 objects (begin) ──
// ─────────────────────────────────────────────────────────────────────────────
// history-foundations-6 — A TORCH-LIT HALL AT ABU SIMBEL, A CARVING OF KADESH, A DIG TRAY.
//
// Drawn against pictures fetched with `npm run ref` (scratchpad/ref/hi6-*): the Great
// Temple's Kadesh relief (Ramesses in his chariot facing right, the six-spoked wheel under
// the car's open side, a quiver slung across it, the horse prancing with a tall plume, the
// enemy small and tumbling under the hooves, columns of hieroglyphs between ruled lines and
// a cartouche, the stone warm orange in the light); the king smiting (the blue khepresh
// crown, a broad collar, a kilt with a pleated apron); the great hall's Osiride pillars (a
// mummiform king with crossed arms holding crook and flail, a tall white crown, carved out
// of the front of a square pier); the Kadesh treaty in Istanbul (pink-buff clay, rounded
// corners, close rows of cuneiform, cracked across); a Hittite tablet (orange clay, ruled
// rows of wedges); an archaeologist's soft brush. Each is authored in REAL STAGE UNITS and
// laid into its box by `fit`.
// ─────────────────────────────────────────────────────────────────────────────

/** Parts in a named real colour (AP11). */
const hi6N = (k: NaturalKey, ...ps: ObjPart[]): ObjPart[] => ps.map((p) => ({ ...p, nat: k }));
/** Author in real units (an ax × ay box) and hand it to `fit` as the 100-square. */
function hi6In(ax: number, ay: number, parts: readonly ObjPart[]): ObjPart[] {
  const sx = 100 / ax;
  const sy = 100 / ay;
  const s = 100 / Math.min(ax, ay);
  return parts.map((p) => {
    if (p.k === 'bar') return { ...p, x1: p.x1 * sx, y1: p.y1 * sy, x2: p.x2 * sx, y2: p.y2 * sy, t: p.t * s };
    return { ...p, x: p.x * sx, y: p.y * sy, w: p.w * sx, h: p.h * sy, ...(p.k === 'rect' ? { rad: p.rad * s } : null) } as ObjPart;
  });
}
/**
 * The same for a LONG thing (a torch, a brush, a trestle): authored in its real ax × ay
 * and centred in a square of its longer side, so a stroke's weight scales the same way
 * along and across it at any box. A scene asks for it in a square, its middle there.
 */
function hi6Sq(ax: number, ay: number, parts: readonly ObjPart[]): ObjPart[] {
  const S = Math.max(ax, ay);
  const ox = (S - ax) / 2;
  const oy = (S - ay) / 2;
  return hi6In(S, S, parts.map((p) => (p.k === 'bar'
    ? { ...p, x1: p.x1 + ox, y1: p.y1 + oy, x2: p.x2 + ox, y2: p.y2 + oy }
    : { ...p, x: p.x + ox, y: p.y + oy }) as ObjPart));
}

// ── THE KING, IN HIS CHARIOT ─────────────────────────────────────────────────
//
// REFERENCE: the relief draws him FAR larger than anyone near him, striding on the car's
// floor, shoulders square to us and the rest in profile: a red-ochre body, a white kilt with
// a pleated apron falling to a point, a broad collar, the blue khepresh crown rounded at the
// back with a gold cobra at the brow. He shoots: the bow arm straight out to a tall bow, the
// drawing hand back at the chin. Real 84 × 120, his feet on y 118 (the car's floor).
const HI6_KING: ObjPart[] = hi6In(84, 120, [
  ...hi6N('hi6Skin',
    oBar('mass', 31, 116, 34, 82, 5.4), oBar('mass', 45, 116, 41, 82, 5.4),       // the legs, striding
    oEll('mass', 29, 117.4, 8, 3), oEll('mass', 47.5, 117.4, 8, 3),               // the feet
    ...trapezoid('mass', 37, 54, 27, 13, 36),                                     // the torso
    oBar('mass', 38, 37, 40, 28, 6.4),                                            // the neck
    oEll('mass', 41, 20, 14, 16),                                                 // the head
    oEll('mass', 47.4, 22.4, 4.4, 4.6),                                           // the nose and lips
    oBar('mass', 47, 38, 62, 37, 4.6), oBar('mass', 62, 37, 74, 36, 4.2), oEll('mass', 75, 36, 5, 5),   // the bow arm
    oBar('mass', 29, 38, 17, 33, 4.6), oBar('mass', 17, 33, 42, 30, 4.2), oEll('mass', 43, 30, 5, 5),   // the drawing arm
  ),
  ...hi6N('hi6Linen', ...trapezoid('mass', 38, 82, 14, 25, 20), oTri('face', 43.5, 91, 9, 15, 'down')),
  ...hi6N('hi6Blue', oEll('mass', 37.5, 12.5, 18, 16), oEll('mass', 31, 15.5, 11, 12)),         // the khepresh crown
  ...hi6N('wood',                                                                                 // the bow
    oBar('mass', 74, 2, 79, 12, 2.2), oBar('mass', 79, 12, 81, 26, 2.2), oBar('mass', 81, 26, 81, 46, 2.2),
    oBar('mass', 81, 46, 79, 60, 2.2), oBar('mass', 79, 60, 74, 70, 2.2),
  ),
  ...hi6N('hi6Blue', oEll('dark', 38, 39.5, 23, 7)),                                    // the broad collar
  ...hi6N('hi6Gold',
    oEll('dark', 38, 38.6, 16, 3.6),
    oRect('dark', 37, 72.5, 15, 3, 0, 1),                                                // the belt
    oBar('dark', 45.5, 9.5, 48.5, 6.5, 1.8),                                             // the cobra at the brow
    oEll('dark', 33, 10.5, 2.6, 2.6),                                                     // a disc on the crown
    oBar('dark', 42, 30, 84, 30, 1.1),                                                   // the arrow
  ),
  ...hi6N('hi6Linen', oBar('dark', 41, 75, 42, 92, 0.7)),                                           // the apron's pleat
  oBar('line', 74, 2, 43, 30, 0.45), oBar('line', 43, 30, 74, 70, 0.45),                    // the bowstring, drawn
  oEll('line', 44.6, 18.6, 3, 1.6),                                                        // the eye
  oBar('line', 42, 26, 44, 34, 0.6),                                                       // the false beard
]);
export const hi6King = (x: number, y: number, w: number, h: number) => fit(HI6_KING, x, y, w, h);

/**
 * The chariot's wheel: six spokes, a hub, a gilded rim, and the wall seen through it (so
 * the wheel is drawn first and the car's side panel over its top). Real 40 × 40.
 */
const HI6_WHEEL: ObjPart[] = hi6In(40, 40, [
  ...hi6N('hi6Gold', oEll('mass', 20, 20, 40, 40)),
  ...hi6N('hi6Recess', oEll('dark', 20, 20, 31, 31)),
  ...hi6N('hi6Gold',
    oBar('dark', 20, 5, 20, 35, 2.2), oBar('dark', 7, 12.5, 33, 27.5, 2.2), oBar('dark', 7, 27.5, 33, 12.5, 2.2),
    oEll('dark', 20, 20, 8, 8),
  ),
  oEll('line', 20, 20, 3, 3),
]);
export const hi6Wheel = (x: number, y: number, w: number, h: number) => fit(HI6_WHEEL, x, y, w, h);

/**
 * The car: an open side panel, gilded, curving up at the front, a red-leather facing, the
 * quiver slung across it and the pole running out to the yoke. Real 52 × 32, its floor on
 * y 30.
 */
const HI6_CAR: ObjPart[] = hi6In(52, 32, [
  ...hi6N('hi6Gold',
    oRect('mass', 24, 19, 40, 22, 0, 2),                                                 // the side panel
    oEll('mass', 37, 13, 16, 16),                                                        // its curved front
    oBar('mass', 44, 29, 52, 23, 3),                                                     // the pole
    oRect('face', 25, 30.2, 42, 2.4, 0, 1),                                              // the floor's edge
  ),
  ...hi6N('hi6Plume', oRect('dark', 24, 21, 30, 13, 0, 2)),                             // the red leather facing
  ...hi6N('hi6Blue', oBar('dark', 9, 28, 30, 6, 6)),                                     // the quiver
  ...hi6N('hi6Gold', oEll('dark', 30, 6, 7, 7), oBar('dark', 6, 21, 42, 21, 1)),
  oEll('lit', 10, 12, 6, 1.6),
]);
export const hi6Car = (x: number, y: number, w: number, h: number) => fit(HI6_CAR, x, y, w, h);

// ── THE HORSE ────────────────────────────────────────────────────────────────
//
// REFERENCE: the relief's horse PRANCES — hind legs planted, forelegs lifted and folded at
// the knee, neck arched high, head tucked down toward the chest, a tall red plume on the
// poll, a saddle-pad and a breast strap. Uncoloured stone, like the carving round it. Real
// 112 × 140, its hooves on y 139.
const HI6_HORSE: ObjPart[] = hi6In(112, 140, [
  ...hi6N('hi6Carve',
    oBar('mass', 8, 72, 3, 106, 4.6),                                                  // the tail
    oBar('mass', 16, 92, 12, 116, 6.2), oBar('mass', 12, 116, 18, 137, 4.2),   // a hind leg
    oBar('mass', 28, 94, 30, 116, 6.2), oBar('mass', 30, 116, 36, 137, 4.2),   // the other
    oEll('mass', 46, 76, 64, 28, -14),                                                   // the body
    oEll('mass', 20, 82, 24, 26),                                                        // the rump
    oEll('mass', 72, 66, 26, 28),                                                        // the chest
    oBar('mass', 74, 76, 92, 84, 6), oBar('mass', 92, 84, 88, 100, 4.4),         // a foreleg, lifted
    oBar('mass', 66, 80, 80, 96, 6), oBar('mass', 80, 96, 93, 104, 4.4),       // the other
    oBar('mass', 74, 62, 88, 30, 16),                                                    // the neck, arched high
    oBar('mass', 88, 26, 101, 43, 11), oEll('mass', 102, 46, 11, 9),                    // the head, tucked
    oTri('mass', 85, 17, 5, 9, 'up'),                                                    // the ear
    oEll('face', 60, 88, 30, 7, -10),                                                    // the belly in shade
  ),
  ...hi6N('hi6Plume', oEll('mass', 84, 9, 7, 16), oRect('dark', 50, 65, 16, 7, -14, 1.5)),   // the plume; the saddle-pad
  ...hi6N('hi6Blue', oEll('mass', 90, 11, 5, 12)),
  ...hi6N('hi6Carve', oBar('dark', 70, 56, 83, 25, 3)),                                // the mane
  ...hi6N('hi6Gold',
    oBar('dark', 54, 62, 58, 86, 2), oBar('dark', 66, 74, 80, 52, 2.2),                 // the girth, the breast strap
    oBar('dark', 89, 28, 100, 43, 1.2), oBar('dark', 92, 38, 103, 44, 1),              // the bridle
  ),
  oEll('line', 94, 31, 2.6, 2.6),                                                       // the eye
  oEll('lit', 40, 68, 22, 4, -14),
]);
export const hi6Horse = (x: number, y: number, w: number, h: number) => fit(HI6_HORSE, x, y, w, h);

// ── THE ENEMY, SMALL ─────────────────────────────────────────────────────────
//
// REFERENCE: under the hooves the Hittites are drawn tiny and tumbling — falling backward,
// trampled flat, down on one knee behind a shield, running. Long hair. Real 16 × 14 each.
const hi6FoeParts = (pose: number): ObjPart[] => hi6In(16, 14, pose === 1 ? [
  ...hi6N('hi6Carve',
    oBar('mass', 4, 10.5, 11, 10.5, 2.6), oBar('mass', 11, 10.5, 15.5, 9, 1.6), oBar('mass', 11, 10.8, 15.2, 12.8, 1.6),
    oBar('mass', 6, 10, 5, 5, 1.2), oBar('mass', 8, 10, 10, 5.5, 1.2), oEll('mass', 2.6, 10.4, 4.2, 4.2),
  ),
  ...hi6N('hi6Glyph', oBar('dark', 1.4, 9, 0.8, 12.6, 1.2)),
] : pose === 2 ? [
  ...hi6N('hi6Carve',
    oBar('mass', 7, 5.5, 7, 9.5, 2.6), oBar('mass', 7, 9.5, 3.6, 12, 1.8), oBar('mass', 3.6, 12, 7.6, 13, 1.6),
    oBar('mass', 7, 9.5, 10, 13, 1.6), oEll('mass', 7.4, 3, 4.2, 4.4),
  ),
  ...hi6N('hi6Plume', oEll('mass', 11, 8, 5, 6.4)),                                     // the shield
  ...hi6N('hi6Glyph', oBar('dark', 5.8, 2.2, 5.4, 6, 1.2)),
] : pose === 3 ? [
  ...hi6N('hi6Carve',
    oBar('mass', 9, 5.5, 7.4, 9.5, 2.6), oBar('mass', 7.4, 9.5, 3.4, 13, 1.6), oBar('mass', 7.4, 9.5, 11.4, 13, 1.6),
    oBar('mass', 8.6, 6.4, 4, 6, 1.2), oBar('mass', 8.6, 6.4, 13, 4, 1.2), oEll('mass', 10.4, 3, 4.2, 4.4),
  ),
  ...hi6N('hi6Glyph', oBar('dark', 12, 2, 12.8, 5.6, 1.2)),
] : [
  ...hi6N('hi6Carve',
    oBar('mass', 5, 6, 9, 10.5, 2.6), oBar('mass', 9, 10.5, 14.5, 9, 1.6), oBar('mass', 9, 10.5, 13, 13.2, 1.6),
    oBar('mass', 6, 7, 1.6, 9.4, 1.2), oBar('mass', 6, 7, 9.6, 3, 1.2), oEll('mass', 4, 4, 4.2, 4.4),
  ),
  ...hi6N('hi6Glyph', oBar('dark', 2.6, 2.8, 1.8, 6.2, 1.2)),
]);
export const hi6Foe = (x: number, y: number, w: number, h: number, pose = 0) => fit(hi6FoeParts(pose), x, y, w, h);


// ── THE INSCRIPTION ──────────────────────────────────────────────────────────
//
// REFERENCE: columns of signs between ruled lines, read top to bottom, under the king's name
// in a cartouche (an oval loop with a bar at its foot). The signs are the commonest ones:
// an owl, water ripples, a reed leaf, a loaf, the ankh, an eye, a quail chick, a mouth, a sun
// disc painted red; the cartouche field painted blue. Real 68 × 146.
const hi6Sign = (kind: string, x: number, y: number): ObjPart[] => {
  switch (kind) {
    case 'owl': return hi6N('hi6Glyph', oEll('dark', x, y + 1, 7, 9), oEll('dark', x + 1.6, y - 4.6, 5.4, 4.4), oTri('dark', x - 2.6, y + 5.6, 3, 3, 'down'));
    case 'water': return hi6N('hi6Glyph', oBar('dark', x - 6, y - 1.4, x + 6, y - 1.4, 1.4), oBar('dark', x - 6, y + 1.8, x + 6, y + 1.8, 1.4));
    case 'reed': return hi6N('hi6Glyph', oBar('dark', x, y - 6, x, y + 6, 1.6), oEll('dark', x + 2.2, y - 3.4, 3.4, 7, 20));
    case 'loaf': return hi6N('hi6Glyph', oEll('dark', x, y + 1.6, 10, 5.4), oRect('dark', x, y + 3.6, 10, 1.6));
    case 'ankh': return [
      ...hi6N('hi6Glyph', oEll('dark', x, y - 3.6, 5.4, 6)),
      ...hi6N('hi6Inset', oEll('dark', x, y - 3.8, 2.4, 3.2)),
      ...hi6N('hi6Glyph', oBar('dark', x - 4, y, x + 4, y, 1.6), oBar('dark', x, y - 0.6, x, y + 6.4, 1.6)),
    ];
    case 'eye': return [
      ...hi6N('hi6Glyph', oEll('dark', x, y, 10, 4.6), oBar('dark', x - 1, y + 2, x - 3, y + 5.6, 1)),
      oEll('line', x + 0.6, y, 2.6, 2.6),
    ];
    case 'chick': return hi6N('hi6Glyph', oEll('dark', x, y + 0.6, 6.4, 7), oEll('dark', x + 2.4, y - 3.6, 4, 3.8), oBar('dark', x - 1, y + 4, x - 1.6, y + 6.6, 0.9), oBar('dark', x + 1.4, y + 4, x + 2, y + 6.6, 0.9));
    case 'mouth': return hi6N('hi6Glyph', oEll('dark', x, y, 10, 4.2));
    case 'sun': return hi6N('hi6Plume', oEll('dark', x, y, 7.4, 7.4));
    default: return hi6N('hi6Blue', oEll('dark', x, y, 6, 6));
  }
};
const HI6_GLYPHS: ObjPart[] = hi6In(68, 146, [
  ...hi6N('hi6Panel', oRect('mass', 33, 73, 66, 146, 0, 1), oRect('face', 66.5, 73, 3, 146)),
  oBar('line', 22.7, 46, 22.7, 143, 0.7), oBar('line', 45.3, 46, 45.3, 143, 0.7), oBar('line', 2, 44, 64, 44, 0.7),
  // the cartouche: an ink loop, its field painted blue, the king's name in gold and red
  oRect('line', 34, 22, 22, 38, 0, 10),
  ...hi6N('hi6Blue', oRect('dark', 34, 22, 18.6, 34.6, 0, 8.6)),
  ...hi6N('hi6Plume', oEll('dark', 34, 11, 7, 7)),
  ...hi6N('hi6Gold', oEll('dark', 34, 20.4, 5.2, 6), oBar('dark', 30.4, 24.6, 37.6, 24.6, 1.6), oBar('dark', 34, 23.6, 34, 32, 1.6)),
  ...hi6N('hi6Blue', oEll('dark', 34, 20.2, 2.2, 2.8)),
  oBar('line', 28, 42.4, 40, 42.4, 1.6),
  // a falcon beside it, and a reed
  ...hi6N('hi6Glyph', oEll('dark', 11, 27, 8, 11), oEll('dark', 13.4, 19, 5, 5), oTri('dark', 9.4, 35.4, 5, 5, 'down')),
  ...hi6Sign('reed', 56.7, 26),
  // the three columns
  ...hi6Sign('owl', 11.3, 60), ...hi6Sign('water', 11.3, 82), ...hi6Sign('reed', 11.3, 104), ...hi6Sign('ankh', 11.3, 127),
  ...hi6Sign('eye', 34, 60), ...hi6Sign('ankh', 34, 82), ...hi6Sign('chick', 34, 104), ...hi6Sign('sun', 34, 127),
  ...hi6Sign('reed', 56.7, 60), ...hi6Sign('loaf', 56.7, 82), ...hi6Sign('owl', 56.7, 104), ...hi6Sign('mouth', 56.7, 127),
]);
export const hi6Glyphs = (x: number, y: number, w: number, h: number) => fit(HI6_GLYPHS, x, y, w, h);

// ── THE OSIRIDE PILLAR ───────────────────────────────────────────────────────
//
// REFERENCE: the great hall's square piers each carry a standing king as Osiris, carved
// from the pier's front: wrapped like a mummy, arms crossed on the chest holding the crook
// and the flail, a long false beard, a tall white crown; hieroglyphs on the pier's side.
// Real 76 × 214.
const HI6_OSIRIS: ObjPart[] = hi6In(76, 214, [
  ...hi6N('hi6Wall', oRect('mass', 37, 107, 70, 214, 0, 1), oRect('face', 71, 107, 6, 214)),   // the pier
  ...hi6N('hi6Panel', oRect('mass', 37, 207, 54, 13, 0, 1.5)),                                    // the base
  ...hi6N('hi6Carve',
    ...trapezoid('mass', 37, 130, 38, 26, 136),                                                   // the wrapped body
    oEll('mass', 37, 67, 40, 14),                                                                 // the shoulders
    oEll('mass', 37, 199, 28, 7),                                                                 // the feet
    oEll('mass', 37, 51, 18, 20),                                                                 // the head
  ),
  ...hi6N('hi6Linen', ...trapezoid('mass', 37, 31, 11, 19, 22), oEll('mass', 37, 17, 12, 13)),   // the white crown
  ...hi6N('hi6Carve',
    oBar('dark', 37, 61, 37, 71, 4.4),                                                            // the false beard
    oBar('dark', 21, 85, 50, 99, 7), oBar('dark', 53, 85, 24, 99, 7),                              // the crossed arms
    oBar('dark', 26, 150, 48, 150, 0.8), oBar('dark', 27, 172, 47, 172, 0.8),
  ),
  ...hi6N('hi6Blue', oEll('dark', 37, 67, 30, 8), oBar('dark', 22, 79, 29, 108, 2.6), oBar('dark', 22, 79, 18, 75, 2.4)),  // collar; crook
  ...hi6N('hi6Gold', oEll('dark', 37, 66.4, 20, 3.4), oBar('dark', 52, 80, 46, 106, 2.4),
    oBar('dark', 52, 80, 59, 95, 1.3), oBar('dark', 52, 80, 62, 92, 1.3)),                        // the flail
  oEll('line', 33.5, 49, 3.6, 1.6), oEll('line', 40.5, 49, 3.6, 1.6),
]);
export const hi6Osiris = (x: number, y: number, w: number, h: number) => fit(HI6_OSIRIS, x, y, w, h);

// ── TORCHES ──────────────────────────────────────────────────────────────────
//
// A wall torch in an iron bracket (a plate on the wall, an arm, a ring the shaft goes
// through) and a hand torch (a wooden shaft with a head of pitch-soaked cloth bound round
// it). The flames are the scene's, so they can flicker. Wall: real 16 × 36, its flame at
// (10, 1). Hand: real 7 × 30 in a 30-square (hi6Sq), held at (3.5, 23), its flame at (3.5, 0).
const HI6_WALL_TORCH: ObjPart[] = hi6In(16, 36, [
  ...hi6N('iron', oRect('mass', 3, 27, 5, 10, 0, 1), oBar('mass', 4, 25, 10, 19, 2.2)),
  ...hi6N('wood', oBar('mass', 10, 33, 10, 10, 3)),
  ...hi6N('iron', oEll('mass', 10, 18, 9, 4)),
  ...hi6N('hi6Wrap', oRect('mass', 10, 7, 6, 10, 0, 1.6), oBar('dark', 7, 5, 13, 6.6, 0.8), oBar('dark', 7, 8.6, 13, 10.2, 0.8)),
  ...hi6N('hi6Flame', oEll('dark', 10, 2.6, 5, 2.4)),
]);
export const hi6WallTorch = (x: number, y: number, w: number, h: number) => fit(HI6_WALL_TORCH, x, y, w, h);
const HI6_TORCH: ObjPart[] = hi6Sq(7, 30, [
  ...hi6N('wood', oBar('mass', 3.5, 29, 3.5, 9, 2.6)),
  ...hi6N('hi6Wrap', oRect('mass', 3.5, 6, 5.8, 10, 0, 1.8), oBar('dark', 0.9, 4, 6.1, 5.6, 0.8), oBar('dark', 0.9, 7.6, 6.1, 9.2, 0.8)),
  ...hi6N('hi6Flame', oEll('dark', 3.5, 1.8, 4.4, 2.2)),
]);
export const hi6Torch = (x: number, y: number, w: number, h: number) => fit(HI6_TORCH, x, y, w, h);
export const HI6_TORCH_AT = { grip: { x: 3.5, y: 23 }, flame: { x: 3.5, y: 0 }, of: { w: 7, h: 30 } } as const;

// ── THE ARCHAEOLOGIST'S THINGS ───────────────────────────────────────────────
//
// A Hittite tablet: orange clay with rounded corners, rows of wedges, a crack; held by its
// bottom edge (AR2), real 16 × 12, the grip at (7.4, 11.9). A soft brush: dark bristles, a
// steel ferrule, a wooden handle, real 4 × 16 in a 16-square, held at (2, 12.5).
const HI6_TABLET: ObjPart[] = hi6In(16, 12, [
  ...hi6N('hi6Clay', oRect('mass', 7.4, 6.2, 14.6, 11.4, 0, 2.6), oRect('face', 15, 6.4, 2, 10.4, 0, 0.8)),
  ...[3, 5.4, 7.8, 10.2].flatMap((y) => hi6N('hi6Clay', oBar('dark', 2.2, y, 6.6, y, 0.75), oBar('dark', 7.6, y, 12.6, y, 0.75))),
  oBar('line', 9.6, 0.9, 8.4, 5, 0.4), oBar('line', 8.4, 5, 10.4, 8.2, 0.4),
  oEll('lit', 3.2, 2.2, 2.4, 0.9),
]);
export const hi6Tablet = (x: number, y: number, w: number, h: number) => fit(HI6_TABLET, x, y, w, h);
export const HI6_TABLET_GRIP = { x: 7.4, y: 11.9, of: { w: 16, h: 12 } } as const;
const HI6_BRUSH: ObjPart[] = hi6Sq(4, 16, [
  ...hi6N('hi6Bristle', oRect('mass', 2, 2.6, 3.6, 5, 0, 1.2)),
  ...hi6N('silver', oRect('mass', 2, 5.9, 2.8, 1.6, 0, 0.4)),
  ...hi6N('wood', oBar('mass', 2, 7, 2, 15.4, 1.8)),
  oBar('lit', 1.4, 9, 1.4, 14, 0.4),
]);
export const hi6Brush = (x: number, y: number, w: number, h: number) => fit(HI6_BRUSH, x, y, w, h);

// ── THE FINDS TRAY ON ITS TRESTLE ────────────────────────────────────────────
//
// A shallow wooden finds tray, sand in it, on two A-frame trestles with a brace between.
// The finds stand in the sand at the tray's back, so the tray is drawn in two: its back and
// its sand behind them, its front board in front. Trestle real 194 × 24 in a 194-square; back 194 × 12;
// front 194 × 14.
const HI6_TRESTLE: ObjPart[] = hi6Sq(194, 24, hi6N('wood',
  oBar('mass', 10, 1, 3, 23.4, 3), oBar('mass', 10, 1, 17, 23.4, 3),
  oBar('mass', 184, 1, 177, 23.4, 3), oBar('mass', 184, 1, 191, 23.4, 3),
  oBar('mass', 10, 12, 184, 12, 2.2),
  oBar('face', 12, 13.4, 182, 13.4, 1),
));
export const hi6Trestle = (x: number, y: number, w: number, h: number) => fit(HI6_TRESTLE, x, y, w, h);
const HI6_TRAY_BACK: ObjPart[] = hi6In(194, 12, [
  ...hi6N('oak', oRect('mass', 97, 3, 194, 5, 0, 1)),
  ...hi6N('hi6Sand', oRect('mass', 97, 8.6, 190, 6.4, 0, 0.6), oBar('dark', 20, 9.6, 60, 9.6, 0.6), oBar('dark', 120, 10.2, 170, 10.2, 0.6)),
]);
export const hi6TrayBack = (x: number, y: number, w: number, h: number) => fit(HI6_TRAY_BACK, x, y, w, h);
const HI6_TRAY_FRONT: ObjPart[] = hi6In(194, 14, [
  ...hi6N('oak', oRect('mass', 96, 7, 192, 14, 0, 1.4), oRect('face', 192.4, 7, 3.2, 14, 0, 0.6),
    oBar('dark', 4, 4.4, 188, 4.4, 0.5), oBar('dark', 4, 10.6, 188, 10.6, 0.5)),
  oBar('lit', 2, 1, 188, 1, 0.6),
]);
export const hi6TrayFront = (x: number, y: number, w: number, h: number) => fit(HI6_TRAY_FRONT, x, y, w, h);

// ── THE THREE FINDS ──────────────────────────────────────────────────────────
//
// ANOTHER CARVING OF RAMESSES: a broken block of the same sandstone, his crowned head and
// shoulder in relief, a column of signs; real 44 × 36. THE TREATY: the Istanbul tablet's
// pink-buff clay, its rounded shoulders, close rows of cuneiform and the cracks across it;
// real 40 × 36. A GIFT-SHOP POSTCARD: a white-bordered card printed with the temple's front
// — four seated colossi in a cliff of sandstone under a blue sky; real 34 × 26. And the
// chip that breaks off the carving. Each stands in the sand on its lowest edge.
const HI6_FRAGMENT: ObjPart[] = hi6In(44, 36, [
  ...hi6N('hi6Panel',
    oRect('mass', 21, 22, 38, 28, 0, 1),
    oRect('mass', 14, 6.6, 20, 4, 0, 0.6), oTri('mass', 30, 6.8, 12, 4.4, 'up'),
    oRect('face', 41.6, 22.6, 5, 26.6, 0, 0.6),
  ),
  ...hi6N('hi6Blue', oEll('dark', 19.6, 15, 11, 10)),
  ...hi6N('hi6Skin', oEll('dark', 23, 20, 8, 10), oRect('dark', 23, 31, 20, 6, 0, 2)),
  ...hi6N('hi6Gold', oEll('dark', 22, 27, 14, 3)),
  oEll('line', 25, 18.6, 2, 1.2),
  ...hi6Sign('reed', 6.4, 16), ...hi6Sign('water', 6.4, 28),
]);
export const hi6Fragment = (x: number, y: number, w: number, h: number) => fit(HI6_FRAGMENT, x, y, w, h);
const HI6_TREATY: ObjPart[] = hi6In(40, 36, [
  ...hi6N('hi6Treaty', oRect('mass', 19, 19, 36, 32, 0, 5), oRect('face', 37.6, 19.6, 3.6, 29, 0, 1)),
  ...[8, 12.5, 17, 21.5, 26, 30.5].flatMap((y) => hi6N('hi6Treaty', oBar('dark', 5, y, 33, y, 0.8))),
  oBar('line', 12, 3.4, 16, 14, 0.6), oBar('line', 16, 14, 10, 24, 0.6), oBar('line', 25, 34.6, 27, 22, 0.6),
  oEll('lit', 9, 5.6, 7, 1.6),
]);
export const hi6Treaty = (x: number, y: number, w: number, h: number) => fit(HI6_TREATY, x, y, w, h);
const HI6_POSTCARD: ObjPart[] = hi6In(34, 26, [
  ...hi6N('paper', oRect('mass', 17, 13, 34, 26, 0, 1.2), oRect('face', 33, 13.4, 2, 24, 0, 0.6)),
  ...hi6N('hi6Sky', oRect('dark', 16.4, 10.4, 29, 16.8, 0, 0.6)),
  ...hi6N('hi6Star', oEll('dark', 26, 6, 4.2, 4.2)),
  ...hi6N('hi6Recess', oRect('dark', 16.4, 18.6, 29, 8.4, 0, 0.6)),
  ...[7, 13, 20, 26].flatMap((x) => hi6N('hi6Glyph', oRect('dark', x, 19.4, 4.6, 6.8, 0, 1), oEll('dark', x, 15, 3.4, 3.6))),
  oRect('line', 16.6, 20.8, 2.2, 4, 0, 0.4),
]);
export const hi6Postcard = (x: number, y: number, w: number, h: number) => fit(HI6_POSTCARD, x, y, w, h);
const HI6_CHIP: ObjPart[] = hi6In(8, 6, hi6N('hi6Panel',
  oTri('mass', 4, 2, 8, 4, 'up'), oRect('mass', 3.6, 4.4, 7, 3, 0, 0.4), oRect('face', 7.2, 4.6, 1.6, 2.8),
));
export const hi6Chip = (x: number, y: number, w: number, h: number) => fit(HI6_CHIP, x, y, w, h);

// ── hist6: objects for this lesson go ABOVE this line ──

/** Every object, by name — what `sheet-lesson-objects` and `check:objects` walk. */
// ─────────────────────────────────────────────────────────────────────────────
// history-foundations-5 — AN ATHENIAN LAW COURT, AND A BEDROOM OF TODAY.
//
// REFERENCES (npm run ref): the Agora Museum's clay KLEPSYDRA — a cream terracotta bowl
// wider at the mouth than the foot, a black-painted rim, a loop handle each side, and a
// little spout at the foot the water ran out of into a second bowl below; the Stoa of
// Attalos — fluted limestone columns under a dark timber ceiling. The BALLOT URN is a
// bronze jar with a neck and two side handles; the second urn, for the unused discs, is
// wood. The bedroom pieces are a bedside lamp, a framed poster and a ceiling pendant.
// ─────────────────────────────────────────────────────────────────────────────

/** The water clock's bowl: drawn 60 × 44, its mouth at the top, the spout low left. */
const KLEPSYDRA: ObjPart[] = h4In(60, 44, [
  ...h4N('clayPot',
    oBar('mass', 6, 10, 3, 18, 3.4), oBar('mass', 3, 18, 10, 22, 3.4),
    oBar('mass', 54, 10, 57, 18, 3.4), oBar('mass', 57, 18, 50, 22, 3.4),
    ...trapezoid('mass', 30, 22, 46, 26, 34),
    oRect('mass', 30, 41, 22, 5, 0, 1.2),
    ...trapezoid('face', 42, 22, 12, 7, 34),
    oRect('mass', 19, 41.6, 4, 4, 0, 1.4),
  ),
  ...h4N('potRim', oRect('mass', 30, 5.6, 48, 3.6, 0, 1.6)),
  oBar('line', 14, 14, 46, 14, 0.5),
]);
export const klepsydraPot = (x: number, y: number, w: number, h: number) => fit(KLEPSYDRA, x, y, w, h);

/** The stone block the upper bowl stands on: drawn 40 × 26. */
const CLOCK_BLOCK: ObjPart[] = h4In(40, 26, [
  ...h4N('stoaStone', oRect('mass', 20, 13, 40, 26, 0, 0.8)),
  ...h4N('stoaShade', oRect('face', 34, 13, 12, 26, 0, 0.8)),
  oBar('line', 2, 4, 38, 4, 0.5),
]);
export const clockBlock = (x: number, y: number, w: number, h: number) => fit(CLOCK_BLOCK, x, y, w, h);

/** The bronze ballot urn: drawn 40 × 56 — a jar with a neck, a lip and two handles. */
const BALLOT_URN: ObjPart[] = h4In(40, 56, [
  ...h4N('urnBronze',
    oBar('mass', 9, 16, 5, 24, 3), oBar('mass', 5, 24, 9, 30, 3),
    oBar('mass', 31, 16, 35, 24, 3), oBar('mass', 35, 24, 31, 30, 3),
    oEll('mass', 20, 33, 32, 34),
    oRect('mass', 20, 13, 14, 12, 0, 1),
    oRect('mass', 20, 6, 22, 4.4, 0, 1.6),
    oRect('mass', 20, 52, 18, 6, 0, 1.4),
    oEll('face', 27, 35, 12, 28),
  ),
  ...h4N('potRim', oEll('dark', 20, 5.2, 16, 2.2)),
  oEll('lit', 12, 28, 3, 9),
  oBar('line', 6, 42, 34, 42, 0.5),
]);
export const ballotUrn = (x: number, y: number, w: number, h: number) => fit(BALLOT_URN, x, y, w, h);

/** The wooden urn for the unused discs: drawn 34 × 42, a staved tub with two bands. */
const WOOD_URN: ObjPart[] = h4In(34, 42, [
  ...h4N('wood', ...trapezoid('mass', 17, 22, 30, 24, 38), oRect('face', 25, 22, 7, 36)),
  ...h4N('stoaBeam', oEll('dark', 17, 3.6, 26, 3)),
  oBar('line', 4, 11, 30, 11, 1.2), oBar('line', 5, 33, 29, 33, 1.2),
  oBar('line', 12, 4, 13, 40, 0.4), oBar('line', 21, 4, 21, 40, 0.4),
]);
export const woodUrn = (x: number, y: number, w: number, h: number) => fit(WOOD_URN, x, y, w, h);

/** One bronze ballot disc with its axle, held side-on: drawn 10 × 10. */
const BALLOT_DISC: ObjPart[] = h4In(10, 10, [
  ...h4N('bellBronze', oEll('mass', 5, 5, 8, 8), oBar('mass', 5, 0.5, 5, 9.5, 1.6)),
  oEll('lit', 3.6, 3.6, 1.6, 1.6),
]);
export const ballotDisc = (x: number, y: number, w: number, h: number) => fit(BALLOT_DISC, x, y, w, h);

/** A bedside lamp: drawn 30 × 44 — a drum shade over a turned base. */
const BEDSIDE_LAMP: ObjPart[] = h4In(30, 44, [
  ...h4N('porcelain', oEll('mass', 15, 32, 14, 14), oRect('mass', 15, 41, 16, 4, 0, 1.2), oBar('mass', 15, 18, 15, 26, 2.4)),
  ...h4N('lampShade', ...trapezoid('mass', 15, 10, 18, 28, 18)),
  oEll('lit', 11, 30, 3, 5),
]);
export const bedsideLamp = (x: number, y: number, w: number, h: number) => fit(BEDSIDE_LAMP, x, y, w, h);

/** A framed travel poster: drawn 40 × 54 — a sun over mountains, in two inks. */
const ROOM_POSTER: ObjPart[] = h4In(40, 54, [
  ...h4N('wood', oRect('mass', 20, 27, 40, 54, 0, 0.6)),
  ...h4N('paper', oRect('mass', 20, 27, 34, 48)),
  ...h4N('posterRed', oEll('mass', 26, 17, 10, 10)),
  ...h4N('posterTeal', oTri('mass', 14, 36, 22, 22, 'up'), oTri('mass', 27, 38, 18, 18, 'up'), oRect('mass', 20, 46, 34, 6)),
]);
export const roomPoster = (x: number, y: number, w: number, h: number) => fit(ROOM_POSTER, x, y, w, h);

/** The ceiling pendant over the bed: drawn 24 × 40 — a cord and a dome shade. */
const PENDANT: ObjPart[] = h4In(24, 40, [
  oBar('line', 12, 0, 12, 26, 1),
  ...h4N('sashWhite', oEll('mass', 12, 31, 22, 14), oRect('mass', 12, 35, 22, 6)),
  ...h4N('lampShade', oEll('dark', 12, 38, 16, 2.4)),
]);
export const pendant = (x: number, y: number, w: number, h: number) => fit(PENDANT, x, y, w, h);

export const OBJECTS = {
  tree, ship, table, book, lamp, cup, crate, hammer, flute, bench, drum,
  door, shelf, flag, bridge, window, wheel, coin, leaf, plinth, column, cave,
  stall, counter, pie, loaf, note, chalkboard, apple,
  // phil1:
  bicycleWheel, bicycleFrame, repairStand, partsCrateBack, partsCrateFront, repairBill, wallBoard, workbench, pegboard,
  // psych1:
  carafe, coffeeCup, tentCard, menuBoard, cafeCounter, cafeCup, saucer, cafeWindow,
  // growth1:
  flowerpot, puddle, wateringCan, sunflower, shed, shedDoor, gardenWall, houseFront, gardenTree, shedWheel,
  // biz1:
  lemonStand, standCounter, lemon, lemonadeJug, reamer, paperCup, cupStack, cashTin, tinLid, lemonCrateBack, lemonCrateFront, queueSign, cupBin,
  // sci1:
  stepLadder, ironBall, tennisBall, yardWall, schoolSlate, patio,
  // hist1:
  shopFront, shopDoor, glassBreak, glassShards, football, twig, noticeBoard,
  // phil2:
  cakeSlice, cakePlate, fork, teaspoon, bistroTable, specialsEasel, cafeFront,
  // psych2:
  trolley, jamJar, jamSplat, jamLid, aisleSign, cctvMount, cctvCamera, cctvScreen, shelfEnd, shoppingList,
  // growth2:
  kitchenUnit, splashback, wallClock, kettle, mug, biscuitJar, jarLid, biscuit, kitchenChair, fruitBowl, fruitBowlFront,
  chocolateBar, notepad, pencil, kitchenWindow,
  // biz2:
  deckOven, ovenDoor, macaronTray, macaron, rollTray, rollTrayRaw, sausageRoll, cakeStand, teapot, teacup, recipeBook, crystalBall, wallShelf, dawnWindow, bakeryCounter,
  // econ1:
  econ1Pie, econ1Loaf, econ1Book, econ1Stall,
  // econ2:
  furledUmbrella, umbrellaRack, priceTag, hangingSign, shopAwning, cornerShop, rainCloud, sun, panelVan, vanDoor, carton,
  // sci2:
  parkSteps, grassBank, parkLawn, parkTree, paperPlane, tapeCase,
  // hist2:
  atticRoof, atticGable, atticBeams, atticWindow, atticDoorway, steamerTrunk, hatboxBack, hatboxFront, hatboxLid,
  letterBundle, newsCorner, oldLetter, historyBook, historyBookOpen, museumLeaflet, oldNewspaper, portraitFrame, shelfBooks,
  // phil3:
  libDesk, libBookcase, foundSign, dateStamp, bookStack, novelOpen, novelLeaf, lostPoster, pushpin, flyer, boxBack, boxFront,
  // psych3:
  galleryPlinth, caseGlass, caseFrame, chippedMug, mugBase, labelStand, blankCard, galleryStool, galleryWindow, giltPainting,
  // growth3:
  runningTrack, trackVerge, parkNoticeBoard, goalCard, wallCalendar, stopwatch, sportsBottle, litterBin, newspaper, ballpoint, floodlight,
  // biz3:
  fairGazebo, fairCloth, candleJar, emptyJar, waxBlock, ribbonSpool, ribbonLength, ribbonBow, toteBag, tentSlate, pennant,
  // econ3:
  posterWall, gigPoster, matchPoster, ticketKiosk, kioskFront, ticketRoll, ticket, note20, tinTakings,
  // sci3:
  promRailing, parasolPole, parasolFurled, parasolCanopy, iceKiosk, queueStand, flipChart, iceCornet, sunCream, fairCloud,
  // hist3:
  footbridgeDeck, footbridgeRail, streamBed, cartHay, cartBody, brokenPlank, newPlank, reeds, barn, weatherVane,
  // phil4:
  stationClock, departureScreen, platformSign, platformBench, tunnelPortal, railTicket,
  // psych4:
  shelterFrame, shelterGlass, advertCase, timetable, stopPole, stopNotice, cafeTerrace, takeawayCup,
  // growth4:
  potWheel, wheelHead, potLow, potTop, clayLump, clayBall, waterBucket, tallStool, potRack, glazedVase, glazedBowl, glazedJug,
  glazedJar, sideTable, wareBoard, topKiln, studioWindow,
  // biz4:
  foodTruck, truckCounter, truckMenu, cashBoxBack, cashBoxFront, cashBoxLid, b4Note, receiptSlip, receiptSpike, pocketCalc,
  vanBoard, bakeryFront, roadway,
  // econ4:
  raisedBed, tomatoPlant, tomatoFruit, henBird, henPeek, henHouse, coopRamp, picketFence, slatePost, gardenSlate, eggBox, trugBack, trugFront, gardenHedge,
  // sci4:
  swingFrameBack, swingFrameFront, swingSeat, clipboard,
  // hist4:
  clockTower, towerBell, phoneShop, cycleRack, cycleStand, horseTrough, oldPhoto,
  // hist5:
  klepsydraPot, clockBlock, ballotUrn, woodUrn, ballotDisc, bedsideLamp, roomPoster, pendant,
  // phil5:
  telePodBack, telePodFront, telePodPad, recycleLid, labConsole, consoleDesk, balanceStand, balanceBeam, balancePan, porthole, labMonitor, corridorHatch, moonDome, moonModule,
  // psych5:
  ps5Crate, ps5CaseTan, ps5CaseRed, ps5CaseGreen, ps5Lantern, ps5Clock, ps5Gorse, ps5Cake,
  // growth5:
  g5RingCurb, g5Mast, g5Ladder, g5Stand, g5Block, g5Trunk, g5LidOpen, g5LidShut, g5PosterRoll, g5PosterBill, g5Shoes,
  g5Whistle, g5Cane, g5Coil, g5Lamp,
  // biz5:
  b5Envelope, b5Skirt, b5Basket, b5BasketBack, b5Frame, b5Cylinder, b5Trolley, b5Easel, b5Tin, b5TinLid, b5Canopy, b5UmbShaft, b5Button,
  // econ5:
  ratRun, ratPeek, ratTail, tailBasket, coinSack, silverCoin, handLantern, candlestick, sealMatrix, waxSeal, decreeSeal, rolledDraft, draftRoller, cabbageHead, vegCrate, hallBeam, townBanner, wallTorch, mayorDais, mayorTable, stoneArch, bakeHouse, bakeDoor, townWell, wellLid, hatchTop, hatchUnder, cellarHole,
  // sci5:
  s5BoatBack, s5BoatFront, s5Jetty, s5Lantern, s5Camera, s5Flask, s5FlaskCup, s5Bottle, s5Sonar, s5SonarBack,
  // phil6:
  ph6Cabinet, ph6Oracle, ph6OracleHead, ph6Ball, ph6Tray, ph6CardFace, ph6CardBack, ph6FortuneLoves, ph6FortuneSneeze, ph6FortuneBully,
  ph6BrassHand, ph6Counter, ph6Awning, ph6JarFudge, ph6JarMint, ph6JarToffee, ph6FudgeBit, ph6MintBit, ph6DieFive, ph6DieTwo, ph6DieSix, ph6DieThree,
  ph6Carousel, ph6Horse, ph6Rail,
  // psych6:
  py6CabPink, py6CabRed, py6CabTeal, py6Pile, py6BearPurple, py6BearGreen, py6Phone, py6Handset, py6HandsetPink, py6HandsetBlue, py6HandsetGold,
  py6Stand, py6Duster,
  // growth6:
  gr6Lens, gr6Pedestal, gr6Desk, gr6KeyBase, gr6KeyLever, gr6Token, gr6Coin, gr6Barometer, gr6Boat, gr6Calendar,
  gr6Notes, gr6Pencil,
  // biz6:
  bz6BoothBack, bz6BoothFront, bz6Turnstile, bz6Popcorn, bz6Glow, bz6Barrel, bz6Lantern, bz6LanternR, bz6Torch, bz6TorchPlate,
  bz6Bell, bz6Counter, bz6Board, bz6Pumpkin,
  // econ6:
  ec6Chest, ec6Lid, ec6LidIn, ec6Heap, ec6Coin, ec6Coconut, ec6Nuts, ec6Stall, ec6Trunk, ec6Frond, ec6Bunch, ec6Wreck, ec6Jetty, ec6Crate, ec6CrateLid, ec6Fish, ec6Cannon, ec6Ship, ec6Basket,
  // sci6:
  sc6HammockFull, sc6HammockEmpty, sc6Cot, sc6Blanket, sc6Lantern, sc6Mast, sc6Chest, sc6Shelf, sc6Tonic, sc6OnionBrown,
  sc6CaseBottle, sc6Vinegar, sc6Phial, sc6Basket, sc6Orange, sc6LedgerShut, sc6LedgerOpen,
  // hist6:
  hi6King, hi6Wheel, hi6Car, hi6Horse, hi6Foe, hi6Glyphs, hi6Osiris, hi6WallTorch, hi6Torch, hi6Tablet, hi6Brush, hi6Trestle, hi6TrayBack, hi6TrayFront, hi6Fragment, hi6Treaty, hi6Postcard, hi6Chip,
} as const;
export type ObjectName = keyof typeof OBJECTS;

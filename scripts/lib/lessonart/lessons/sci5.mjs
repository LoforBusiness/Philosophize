// science-foundations-5, "Could It Be Wrong?" — the monster she describes (b6).
// Reference (Wikimedia Commons, `npm run ref nessie`, "Loch Ness monster views.svg"): the
// classic sighting profile is a small head and a thick neck on one end and a train of low,
// rounded humps behind it that shrink toward the tail, all riding the waterline. Drawn head
// to the right, in moon-pale scale colours: flat fill lit from the top left, a darker belly
// side, ONE dark outline, no gradient, no glow.
const INK = '#1F2A2E';
const BODY = 'M0,40 C6,36 10,33 16,33 C22,33 24,37 30,37 C36,37 38,29 46,29 C54,29 56,36 64,36 C72,36 74,24 84,24 C94,24 98,35 108,35 C118,35 124,19 138,19 C150,19 158,30 168,33 L186,33 C192,26 200,13 210,9 L222,6 C226,2 235,0 242,2 C249,3 254,6 253,10 C252,13 246,13 242,13 C238,13 235,15 235,19 C235,27 235,34 237,40 Z';
const SHADE = 'M0,40 C6,38 12,37 16,37 C26,38 34,39 44,38 C60,39 80,38 108,39 C124,38 150,38 168,38 L186,37 C196,35 214,26 224,17 C230,15 238,13 242,13 C238,13 235,15 235,19 C235,27 235,34 237,40 Z';
const monsterSvg = () =>
  `<path d="${BODY}" fill="#8FB3AA" stroke="${INK}" stroke-width="1.1" stroke-linejoin="round"/>`
  + `<path d="${SHADE}" fill="#5F8680"/>`
  + `<path d="M24,32 C30,31 34,35 40,33 M50,28 C58,27 60,33 66,31 M86,23 C94,22 98,29 106,28 M142,18 C152,17 158,25 164,27" fill="none" stroke="#C9E0DA" stroke-width="1.4" stroke-linecap="round"/>`
  + `<circle cx="244" cy="6.2" r="1.3" fill="${INK}"/>`
  + `<path d="${BODY}" fill="none" stroke="${INK}" stroke-width="1.1" stroke-linejoin="round"/>`;
export const ART = [
  { name: 'sci5-monster', svg: monsterSvg, view: { x: -1, y: -1, w: 256, h: 42 }, box: { x: 59, y: 0, w: 256, h: 42 } },
];

// science-foundations-6, "Did the Cure Work?" — the sick bay's fixtures.
// References (scratchpad/ref): sc6gundeck-1 (Vasa's gun deck: the mast is a thick ROUND
// pine column with vertical seams, standing in a round wooden step on the deck; the planks
// run grey-brown), sc6seachest (a long painted sea chest: hinged lid, iron straps, rope
// beckets, a hasp). Flat fills lit from the top left, a darker shaded side, ONE dark
// outline, real colours, no gradient.
const INK = '#2A1D14';
const sw = (w) => `stroke="${INK}" stroke-width="${w}" stroke-linejoin="round"`;

// the mast, 34 × 230, centred (40, 393)
const mast = () =>
  `<rect x="8" y="0" width="18" height="226" fill="#B5804F" ${sw(1.2)}/>`
  + `<rect x="19" y="0" width="7" height="226" fill="#8F6338"/>`
  + `<path d="M12,10 L12,214 M16,4 L16,222" stroke="#8F6338" stroke-width="0.6" fill="none"/>`
  + `<rect x="9.4" y="14" width="2.2" height="198" rx="1.1" fill="#D2A06C"/>`
  + `<rect x="1" y="0" width="32" height="8" rx="1.5" fill="#5E4532" ${sw(1.2)}/>`
  + `<rect x="1" y="6" width="32" height="2" fill="#47331F"/>`
  + [38, 45, 176, 183].map((y) => `<rect x="7.6" y="${y}" width="18.8" height="3.4" fill="#565B61" ${sw(0.7)}/><rect x="8" y="${y + 0.4}" width="5" height="1" fill="#80868D"/>`).join('')
  + `<ellipse cx="17" cy="221" rx="16.5" ry="5.4" fill="#5E4532" ${sw(1.2)}/>`
  + `<ellipse cx="17" cy="219.6" rx="14" ry="3.4" fill="#7A5A41"/>`
  + `<path d="M8,214 L26,214 L26,222 L8,222 Z" fill="#B5804F"/>`
  + `<path d="M8,214 L8,222 M26,214 L26,222" stroke="${INK}" stroke-width="1.2"/>`
  + `<rect x="19" y="214" width="7" height="8" fill="#8F6338"/>`;

// the sea chest, 144 × 28, centred (192, 466)
const chest = () =>
  `<rect x="4" y="24" width="8" height="4" rx="1" fill="#47331F" ${sw(1)}/><rect x="132" y="24" width="8" height="4" rx="1" fill="#47331F" ${sw(1)}/>`
  + `<rect x="2" y="9" width="140" height="16" rx="1.6" fill="#3F6672" ${sw(1.2)}/>`
  + `<rect x="2" y="20" width="140" height="5" rx="1.2" fill="#2F4F59"/>`
  + `<rect x="2" y="9" width="140" height="16" rx="1.6" fill="none" ${sw(1.2)}/>`
  + `<path d="M3,3 C3,1 5,0.6 8,0.6 L136,0.6 C139,0.6 141,1 141,3 L142,9 L2,9 Z" fill="#6E4F34" ${sw(1.2)}/>`
  + `<path d="M4,2.2 L138,2.2" stroke="#9A7650" stroke-width="1" stroke-linecap="round"/>`
  + `<path d="M2,7 L142,7" stroke="#47331F" stroke-width="2"/>`
  + [10, 42, 102, 134].map((x) => `<rect x="${x}" y="1" width="4.4" height="24" fill="#565B61" ${sw(0.8)}/><rect x="${x + 0.5}" y="1.4" width="1.3" height="23" fill="#80868D"/>`).join('')
  + `<rect x="68" y="6" width="8" height="9" rx="1.2" fill="#393D42" ${sw(0.9)}/><circle cx="72" cy="12.4" r="1.2" fill="#B7BCC2"/>`
  + `<path d="M0.4,11 C-1.4,12 -1.4,18 0.4,19 M143.6,11 C145.4,12 145.4,18 143.6,19" fill="none" stroke="#BFA273" stroke-width="2.4" stroke-linecap="round"/>`
  + `<path d="M6,12 L38,12 M106,12 L138,12" stroke="#5B8794" stroke-width="1" stroke-linecap="round" opacity="0.8"/>`;

// the shelf, 48 × 10 (brackets reach the foot), centred (240, 441)
const shelf = () =>
  `<path d="M7,5 L7,9.4 L12,9.4 L16,5 Z M41,5 L41,9.4 L36,9.4 L32,5 Z" fill="#47331F" ${sw(0.8)}/>`
  + `<rect x="0.6" y="1" width="46.8" height="4.4" rx="0.9" fill="#5E4532" ${sw(1)}/>`
  + `<rect x="1.4" y="1.5" width="45" height="1" fill="#8A6A4D"/>`;

// the gun port: a round brass-bound opening, the hole left clear for the animated sea
const port = () =>
  `<path fill-rule="evenodd" fill="#7A5A41" ${sw(1.1)} d="M0,0 H40 V40 H0 Z M20,6 a14,14 0 1,0 0.01,0 Z"/>`
  + `<circle cx="20" cy="20" r="14" fill="none" stroke="#B88F3E" stroke-width="2.2"/>`
  + `<circle cx="20" cy="20" r="15.2" fill="none" stroke="${INK}" stroke-width="0.9"/>`
  + `<circle cx="20" cy="20" r="12.8" fill="none" stroke="${INK}" stroke-width="0.8"/>`
  + [[5, 5], [35, 5], [5, 35], [35, 35]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.4" fill="#565B61" ${sw(0.5)}/>`).join('');

export const ART = [
  { name: 'sci6-mast', svg: mast, view: { x: 0, y: 0, w: 34, h: 230 }, box: { x: 23, y: 278, w: 34, h: 230 } },
  { name: 'sci6-chest', svg: chest, view: { x: -2, y: 0, w: 148, h: 28 }, box: { x: 118, y: 452, w: 148, h: 28 } },
  { name: 'sci6-shelf', svg: shelf, view: { x: 0, y: 0, w: 48, h: 10 }, box: { x: 216, y: 436, w: 48, h: 10 } },
  { name: 'sci6-port', svg: port, view: { x: 0, y: 0, w: 40, h: 40 }, box: { x: 220, y: 362, w: 40, h: 40 } },
];

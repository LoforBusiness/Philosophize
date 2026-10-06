// business-foundations-6, "When Do You Break Even?" — the castle's gatehouse as one picture
// (LESSON_RULES AM13). It replaces the Views that stacked grey rectangles for the towers and
// the walls. Form from how a medieval gatehouse is built (twin drum towers with a corbelled
// parapet over the wall between, curtain walls running off each side, ashlar in staggered
// courses, a cross-shaped arrow loop); the Commons search returned only heraldry for every
// castle query, so no photograph was available and the masonry is kept to the simple
// regular coursing every such wall shares. Moonlit lilac-grey, lit from the top left.
// Zero imports. The arch, gate, lamps and counter are still drawn by the scene over it.

const OUT = '#2B2A3A';
const STONE = '#9C98AC', SHADE = '#7E7A90', LIT = '#B4B1C4', MORTAR = '#6F6B83';
const f = (n) => (+n).toFixed(2);
const fill = (d, c, w = 1.2) => `<path d="${d}" fill="${c}" stroke="${OUT}" stroke-width="${w}" stroke-linejoin="round"/>`;
const tone = (d, c, o = 1) => `<path d="${d}" fill="${c}"${o < 1 ? ` opacity="${o}"` : ''}/>`;
const line = (d, c, w, o = 1) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round"${o < 1 ? ` opacity="${o}"` : ''}/>`;
const rect = (x, y, w, h) => `M${f(x)},${f(y)} h${f(w)} v${f(h)} h${f(-w)} Z`;

/** Staggered courses inside a wall block: horizontal joints and offset vertical ones. */
function masonry(x, y, w, h, row = 13, blk = 19) {
  let d = '';
  let r = 0;
  for (let yy = y + row; yy < y + h - 2; yy += row, r++) {
    d += `M${f(x + 0.6)},${f(yy)} h${f(w - 1.2)} `;
  }
  r = 0;
  for (let yy = y; yy < y + h - 2; yy += row, r++) {
    const y2 = Math.min(yy + row, y + h);
    for (let xx = x + (r % 2 ? blk / 2 : blk); xx < x + w - 2; xx += blk) d += `M${f(xx)},${f(yy + 0.6)} V${f(y2)} `;
  }
  return line(d, MORTAR, 0.7, 0.55);
}
/** A merlon with its lit top edge and shaded foot. */
function merlon(x, top) {
  return fill(rect(x, top, 9, 10), STONE, 1)
    + tone(rect(x + 0.6, top + 0.6, 8.8, 1.8), LIT)
    + tone(rect(x + 5.6, top + 2.6, 3.4, 7), SHADE, 0.6);
}
const loop = (cx, y) => fill(`M${cx - 2},${y} h4 v16 h-4 Z`, '#1C1B28', 0.8) + fill(`M${cx - 6},${y + 6} h12 v3.4 h-12 Z`, '#1C1B28', 0.8);

function wall(x, top, w, bottom = 500) {
  const h = bottom - top;
  let s = fill(rect(x, top, w, h), STONE);
  s += tone(rect(x + 1, top + 1, w - 2, 3), LIT);
  s += masonry(x, top + 2, w, h - 2);
  return s;
}
function tower(x, w) {
  const top = 312;
  let s = fill(rect(x, top, w, 500 - top), STONE);
  s += tone(rect(x + w * 0.62, top + 1, w * 0.38 - 1, 500 - top - 1), SHADE, 0.62); // the shaded drum side
  s += tone(rect(x + 1.5, top + 1, 4, 500 - top - 1), LIT, 0.7);                       // the lit edge
  s += masonry(x, top + 2, w, 500 - top - 2, 13, 14);
  // the corbelled parapet: a wider lip, shadow under it, then the merlons
  s += fill(rect(x - 3, top - 4, w + 6, 8), SHADE, 1.1);
  s += tone(rect(x - 2, top - 3.4, w + 4, 2), LIT, 0.8);
  s += tone(rect(x - 1, top + 4, w + 2, 3), '#1C1B28', 0.28);
  const n = Math.round((w + 6) / 14);
  for (let k = 0; k < n; k++) s += merlon(x - 3 + k * ((w + 6 - 9) / (n - 1)), top - 14);
  s += loop(x + w * 0.42, 346);
  return s;
}

export const ART = [{
  name: 'biz6-gatehouse',
  svg: () => {
    let s = '';
    // the curtain walls running off each side
    s += wall(0, 386, 152);
    for (let x = 4; x < 150; x += 17) s += merlon(x, 376);
    s += wall(324, 380, 76);
    for (const x of [330, 347, 364, 381]) s += merlon(x, 370);
    // the wall over the arch
    s += wall(188, 330, 94);
    for (const x of [196, 214, 232, 250, 268]) s += merlon(x, 320);
    // the two drum towers stand in front
    s += tower(150, 40);
    s += tower(280, 46);
    return s;
  },
  view: { x: 0, y: 292, w: 400, h: 208 },
  box: { x: 0, y: 292, w: 400, h: 208 },
}];

// ── the pay turnstile and the barrel (drawn from curves; the scene still turns the arms) ──
// REFERENCE: Commons "Interior of Piggly Wiggly store … entrance turnstile" (1917): an iron post on a
// foot plate, a brass hub, a coin box on top. Barrel: a wine cask on end, staves bulging at the
// middle, two iron hoops, an oak head seen from a little above. Flat fills lit from the top left.
const IRONC = '#2F3138', IRON_L = '#4A4D58', IRON_D = '#202227', BRASS = '#E5B53C', BRASS_D = '#BC8F25';
const RED = '#7D2229', RED_L = '#9A323A', KNOB = '#C8312B';
const WOOD = '#8A5A33', WOOD_L = '#A8744A', WOOD_D = '#68421F', OAK = '#C79A62';
const turnstile = () => {
  let s = '';
  s += fill('M4,55.4 L6,51 H46 L48,55.4 Z', IRONC, 1);                             // foot plate
  s += fill('M22,51 V16 H30 V51 Z', IRONC, 1);                                     // the post
  s += tone('M22.8,50 V17 H25 V50 Z', IRON_L);
  s += tone('M28,17 H29.4 V50 H28 Z', IRON_D);
  s += fill('M19.5,17.5 H32.5 V14.5 H19.5 Z', BRASS, 1);                           // the collar
  s += fill('M18.5,14.5 H33.5 V8 Q33.5,6.5 32,6.5 H20 Q18.5,6.5 18.5,8 Z', BRASS, 1); // the hub
  s += tone('M19.3,8.2 H25 V13.8 H19.3 Z', '#F4D26A', 0.8);
  s += tone('M29.5,8 H33 V14 H29.5 Z', BRASS_D, 0.7);
  s += fill('M18.5,6.8 V1.4 Q18.5,0.4 19.5,0.4 H32.5 Q33.5,0.4 33.5,1.4 V6.8 Z', RED, 1); // coin box
  s += tone('M19.2,1 H25 V6.2 H19.2 Z', RED_L, 0.8);
  s += line('M22,2.9 H30', '#101010', 1.3);                                        // slot
  s += line('M21,10 L7,4.4', IRONC, 3.4);                                          // click lever
  s += line('M21,10 L7,4.4', BRASS, 2);
  s += fill('M0.3,3 a3.2,3.2 0 1,0 6.4,0 a3.2,3.2 0 1,0 -6.4,0', KNOB, 1);         // red knob
  s += tone('M1.4,1.8 a1,1 0 1,0 2,0 a1,1 0 1,0 -2,0', '#F08A80', 0.9);
  return s;
};
const barrel = () => {
  let s = '';
  s += fill('M1.2,6 Q-0.6,17.5 1.4,29 Q10,31.2 18.6,29 Q20.6,17.5 18.8,6 Q10,4 1.2,6 Z', WOOD, 1);
  s += tone('M2,7 Q0.4,17.5 2.2,28.4 Q4.6,29 7,29.3 Q5.4,17.5 6.4,6.4 Z', WOOD_L, 0.85);
  s += tone('M14,5.8 Q15.6,17.5 14.4,29.6 Q16.6,29.4 18.6,29 Q20.4,17.5 18.8,6 Z', WOOD_D, 0.75);
  s += line('M7,5.2 Q6,17.5 7.2,29.8 M13,5.2 Q14,17.5 12.8,29.8', WOOD_D, 0.6);
  s += fill('M0.4,9.5 Q10,12 19.6,9.5 V12.6 Q10,15 0.4,12.6 Z', IRONC, 0.9);
  s += fill('M0.6,23.6 Q10,26 19.4,23.6 V26.6 Q10,29 0.6,26.6 Z', IRONC, 0.9);
  s += tone('M1,10 Q6,11.4 8,11.2 V11.6 Q4,12.2 1,11.6 Z', IRON_L, 0.8);
  s += fill('M1.2,6 Q1.2,2.4 10,2.2 Q18.8,2.4 18.8,6 Q10,8.4 1.2,6 Z', OAK, 1);
  s += tone('M3,5.6 Q5,3.6 9,3.4 Q5,4.6 4,6 Z', '#E4C089', 0.8);
  return s;
};
ART.push(
  { name: 'biz6-turnstile', svg: turnstile, view: { x: 0, y: 0, w: 48, h: 56 }, box: { x: 120, y: 444, w: 48, h: 56 } },
  { name: 'biz6-barrel', svg: barrel, view: { x: -1, y: 1, w: 22, h: 31 }, box: { x: 285, y: 469, w: 22, h: 31 } },
);

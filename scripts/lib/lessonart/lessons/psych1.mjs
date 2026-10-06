// psychology-foundations-1, "What Is Psychology?" — the café taste test's detailed art,
// drawn as curves (LESSON_RULES AM13) and baked by make-lesson-art.mjs. Every drawing takes
// the box of the shape-built object it replaces, so nothing on the stage moves. Flat fills
// lit from the top left, a shaded side, one dark outline. Zero imports.
//
// REFERENCES (npm run ref, scratchpad/ref/b1-*): b1-carafe-1, a Black & Decker filter
// coffee decanter (CC BY-SA 3.0) — a squat round glass bowl wider than it is tall, a black
// plastic collar and flat lid with a domed knob, a black loop handle off the collar, a
// pinched pouring lip, the coffee a dark band through the lower glass; b1-cupsaucer-3, a
// coffee cup on its saucer (CC BY-SA 4.0) — a wide china bowl curving down to a small foot,
// a loop handle standing clear of the wall at the rim's height, the saucer a shallow dish
// with a raised rim and a well; b1-cupsaucer-1/2 (MET, CC0), the same in profile.

const INK = '#2B2420';
const fill = (d, c, w) => `<path d="${d}" fill="${c}" stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
const tone = (d, c, o = 1) => `<path d="${d}" fill="${c}" opacity="${o}"/>`;
const line = (d, c, w) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;

const GLASS = '#E4EDF0', GLASS_D = '#C3D3D9', COFFEE = '#4A2A17', COFFEE_D = '#33190C', COFFEE_L = '#7A4A2C';
const PLASTIC = '#2F2C2A', PLASTIC_L = '#5C5753';
const CHINA = '#F7F3EA', CHINA_D = '#D8D1C2', CHINA_L = '#FFFFFF';

// ── the coffee pot, 26 × 30 about its centre, handle on the LEFT ───────────
// The hand holds it at (−10, −2): on the handle's grip.
export function pot() {
  const o = '0.8';
  const BODY = 'M-7,-6.2 C-10.8,-3.6 -11.2,4 -9.8,8.6 C-8.6,12.6 -5,14.2 0.8,14.2 C6.6,14.2 10.4,12.6 11.6,8.6 C13,4 12.4,-3.6 8.6,-6.2 Z';
  return [
    `<defs><clipPath id="p1body"><path d="${BODY}"/></clipPath></defs>`,
    // the handle: a black loop off the collar, down the pot's left side and back in
    line('M-6.6,-8.4 C-11.6,-8.9 -12.5,-6.6 -12.3,-3 L-12.1,2.6 C-12,5 -11,6.1 -9.2,5.9', INK, '3.1'),
    line('M-6.6,-8.4 C-11.6,-8.9 -12.5,-6.6 -12.3,-3 L-12.1,2.6 C-12,5 -11,6.1 -9.2,5.9', PLASTIC, '1.6'),
    line('M-9.6,-8.6 C-11.2,-8.4 -11.8,-6.4 -11.7,-3.6', PLASTIC_L, '0.5'),
    // the glass bowl
    fill(BODY, GLASS, o),
    // the coffee: a dark band through the lower glass, its surface a flat line
    `<g clip-path="url(#p1body)">`,
    tone('M-14,1.6 C-6,0.6 6,0.6 14,1.6 L14,16 L-14,16 Z', COFFEE),
    tone('M5,1.4 C9,2 11,4 11,8 C10,12 7,13.6 2,14.2 L14,16 L14,1.4 Z', COFFEE_D),
    tone('M-11,1.8 C-5,0.9 5,0.9 11,1.8 C5,2.7 -5,2.7 -11,1.8 Z', COFFEE_L, 0.7),
    // the glass's far side, in shade, above the coffee
    tone('M6,-5 C10,-3 11.4,-1 11.6,1.4 L13,1.4 L13,-6 Z', GLASS_D),
    `</g>`,
    // the highlight down the left of the glass
    line('M-7.4,-2.6 C-8.8,1 -8.6,5.6 -6.8,9', '#FFFFFF', '1.1'),
    line('M-5.6,10.6 C-4.4,11.4 -3.2,11.8 -1.8,11.9', '#FFFFFF', '0.6'),
    // the pouring lip, pinched out on the right under the collar
    fill('M8,-6.4 L11.6,-7.6 C11.6,-6.6 10.6,-5.6 8.8,-5.2 Z', GLASS_D, '0.6'),
    // the black collar, a little wider at its top
    fill('M-7.8,-9.2 L9.4,-9.2 L8.8,-5.8 L-7.2,-5.8 Z', PLASTIC, o),
    line('M-7.2,-8.4 L8,-8.4', PLASTIC_L, '0.6'),
    // the flat lid and its domed knob
    fill('M-6.8,-9.2 C-5,-11.2 7,-11.2 8.6,-9.2 Z', PLASTIC, o),
    fill('M-1.8,-10.6 C-1.8,-14.2 3.4,-14.2 3.4,-10.6 Z', PLASTIC, o),
    line('M-0.6,-12.6 C-0.2,-13.3 0.6,-13.5 1.2,-13.4', PLASTIC_L, '0.5'),
  ].join('');
}

// ── the café cup, 16 × 10.6, handle on the RIGHT ────────────────────────────
// Its box's origin is the handle's grip at (14.8, 4.9), as CAFE_CUP_GRIP says; its bowl
// is centred at x 6.6 and its foot stands at 10.5.
export function cup() {
  const o = '0.45';
  return [
    // the handle: a loop standing clear of the wall, its top at the rim's height
    line('M12.2,2.6 C15.6,2.1 15.8,7.4 11.0,7.6', INK, '2.1'),
    line('M12.2,2.6 C15.6,2.1 15.8,7.4 11.0,7.6', CHINA, '1.2'),
    // the bowl: wide at the rim, curving down to a small foot
    fill('M0.3,1.5 C0.5,6.8 2.8,9.5 6.6,9.6 C10.4,9.5 12.7,6.8 12.9,1.5 Z', CHINA, o),
    tone('M9.4,2 L12.6,2 C12.4,6.4 11,8.9 8.4,9.4 C10.2,7.6 10.2,4.8 9.4,2 Z', CHINA_D),
    // the foot ring
    fill('M4.2,9.3 L9,9.3 L9.5,10.4 L3.7,10.4 Z', CHINA, '0.4'),
    // the rim, seen from a little above, and the coffee in it
    fill('M0.2,1.5 C0.2,0.3 13,0.3 13,1.5 C13,2.6 0.2,2.6 0.2,1.5 Z', CHINA_L, o),
    tone('M1.4,1.55 C1.4,0.8 11.8,0.8 11.8,1.55 C11.8,2.25 1.4,2.25 1.4,1.55 Z', COFFEE),
    tone('M2.4,1.3 C4,0.95 7,0.95 8.4,1.15', COFFEE_L, 0.8),
    // the glaze's shine
    line('M2.3,3.6 C2.5,5.8 3.2,7.2 4.2,8', '#FFFFFF', '0.7'),
  ].join('');
}

// ── the saucer, 18 × 3.4, seen nearly edge-on ───────────────────────────────
// Its top, where the cup's foot stands, is 1 below its box's top.
export function saucer() {
  const o = '0.4';
  return [
    // the dish: a flat lens with a raised rim, on a low foot
    fill('M0.3,1.3 C1.2,2.6 5,2.7 6.2,2.8 L6.7,3.25 L11.3,3.25 L11.8,2.8 C13,2.7 16.8,2.6 17.7,1.3 C14.6,0.3 3.4,0.3 0.3,1.3 Z', CHINA, o),
    // its underside, turned from the lamp
    tone('M1.6,1.9 C4,2.5 14,2.5 16.4,1.9 C15.6,2.5 13,2.7 11.8,2.8 L6.2,2.8 C5,2.7 2.4,2.5 1.6,1.9 Z', CHINA_D),
    // the well the cup's foot sits in
    tone('M5.4,1.05 C7,0.75 11,0.75 12.6,1.05 C11,1.35 7,1.35 5.4,1.05 Z', CHINA_D),
    // the glaze along the near rim
    line('M2,1.25 C3.4,0.9 4.8,0.8 6,0.75', '#FFFFFF', '0.4'),
  ].join('');
}

export const ART = [
  // POT_ART = carafe(0, 0, 26, 30), drawn about its centre
  // (a unit wider on the left, for the handle standing clear of the glass)
  { name: 'psych1-pot', svg: pot, view: { x: -14, y: -15, w: 27, h: 30 }, box: { x: -14, y: -15, w: 27, h: 30 } },
  // CUP_ART = cafeCup(w/2 − grip.x, h/2 − grip.y, 16, 10.6): drawn about its handle's grip
  { name: 'psych1-cup', svg: cup, view: { x: 0, y: 0, w: 16, h: 10.6 }, box: { x: -14.8, y: -4.9, w: 16, h: 10.6 } },
  // SAUCER_ART = saucer(0, 0): 18 × 3.4 about its centre
  { name: 'psych1-saucer', svg: saucer, view: { x: 0, y: 0, w: 18, h: 3.4 }, box: { x: -9, y: -1.7, w: 18, h: 3.4 } },
];

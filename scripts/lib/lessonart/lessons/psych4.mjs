// psych4 — A BUS STOP ON A HIGH STREET (psychology-foundations-4). The things on the
// stage that were stacks of boxes and are drawn here as curves (LESSON_RULES AM13), each
// in SCENE units with view = box, so a picture lands exactly where the shapes were.
// Flat fills lit from the top left, a shaded side, one dark outline. Zero imports.

const INK = '#2B2420';
const f = (d, c, w = '0.8') => `<path d="${d}" fill="${c}" stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
const t = (d, c, o = 1) => `<path d="${d}" fill="${c}"${o < 1 ? ` opacity="${o}"` : ''}/>`;
const ln = (d, c, w) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const rr = (x, y, w, h, r, c, sw = '0.8') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${c}" stroke="${INK}" stroke-width="${sw}"/>`;
const box = (x, y, w, h, r, c, o = 1) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${c}"${o < 1 ? ` opacity="${o}"` : ''}/>`;
const dot = (x, y, r, c, o = 1) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"${o < 1 ? ` opacity="${o}"` : ''}/>`;

// ── THE ADVERT IN ITS LIT CASE, 14–70 × 384–488 ─────────────────────────────
// REFERENCE: rb2-shampoo-2 ("Shampoo Bottle made of PLA-Blend", Commons) and -3 (a
// Dove bottle): a squeeze bottle is a TEARDROP — narrow sloped shoulders under a round
// flip cap with its hinge notch, swelling to its widest low down and standing on a
// flattened foot. And p4-shelterad-4 (Princes Street): a shelter advert is one big
// product lit from behind on a pale ground, in a deep steel case.
export function advert() {
  const STEEL = '#5E656B', STEELD = '#464C51', STEELL = '#8A9196';
  const MINT = '#C4E8E0', MINTL = '#DDF3EE', MINTD = '#A8DACF';
  const PINK = '#E27FA2', PINKD = '#C9628A', PINKL = '#F4B6CB';
  const CAP = '#F4F1EA', CAPD = '#D6D0C3';
  const bubble = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#FFFFFF" fill-opacity="0.55" stroke="#7FB6AA" stroke-width="0.45"/>`
    + dot(x - r * 0.38, y - r * 0.38, r * 0.28, '#FFFFFF');
  return [
    // the case: a deep steel box, its right side in shade, a lit rim along its top
    rr(14.5, 384.5, 55, 103, 2.6, STEEL, '0.9'),
    box(65.5, 386, 3.4, 100, 1.4, STEELD),
    ln('M16.4,386.2 L67,386.2', STEELL, '0.9'),
    // the lit poster, set INTO the case: a dark rebate along its top and left edge
    rr(19, 389, 46, 90, 0.8, MINT, '0.7'),
    ln('M19.6,389.8 L64.4,389.8 M19.8,390 L19.8,478.2', '#6E8F88', '0.8'),
    // the glow behind the bottle
    `<ellipse cx="42" cy="430" rx="18" ry="27" fill="${MINTL}"/>`,
    // the lather piled round its foot
    ...[[30, 467, 4.2], [36, 469, 3.6], [49, 468.5, 4], [55, 466.5, 3.2], [42, 470.5, 3.2]].map(([x, y, r]) =>
      `<circle cx="${x}" cy="${y}" r="${r}" fill="#FFFFFF" stroke="#7FB6AA" stroke-width="0.45"/>`),
    // the bottle: a teardrop on a flat foot
    f('M37.2,406 C33.4,409 30.6,419 30.4,433 C30.2,449 30.8,461 33.6,466.4 L50.4,466.4 C53.2,461 53.8,449 53.6,433 '
      + 'C53.4,419 50.6,409 46.8,406 Z', PINK, '0.85'),
    // its shaded side and its lit side
    t('M47.6,407.4 C51,411 53,420 53.1,433 C53.3,449 52.8,460.6 50.2,465.6 L46.4,465.6 C48.6,459 49.2,447 48.8,432 C48.6,420 48.2,412 47.6,407.4 Z', PINKD),
    t('M34.2,414 C32.6,420 32.3,430 32.6,446 C32.8,452 33.3,457 34.2,460 C34.8,452 34.6,432 35.4,418 Z', PINKL),
    // the label, wrapped round its belly, with a leaf and two lines of small print
    f('M35.6,428 C39.6,427 44.4,427 48.4,428 L48.4,450 C44.4,451 39.6,451 35.6,450 Z', '#FFFFFF', '0.55'),
    f('M42,432 C45.2,434.4 45.2,439.6 42,442.4 C38.8,439.6 38.8,434.4 42,432 Z', '#7CC4B0', '0.45'),
    ln('M42,433.6 L42,441.4', '#4E9A86', '0.4'),
    ln('M38.4,445.4 L45.6,445.4 M39.6,447.6 L44.4,447.6', PINKD, '0.6'),
    // the neck collar and the flip cap with its hinge notch
    f('M37,403.4 L47,403.4 L47.4,406.8 L36.6,406.8 Z', CAPD, '0.6'),
    f('M37.2,396.4 C37.2,394.6 38.6,393.8 42,393.8 C45.4,393.8 46.8,394.6 46.8,396.4 L46.8,403.6 L37.2,403.6 Z', CAP, '0.7'),
    t('M44.4,394.4 C46,394.8 46.6,395.6 46.6,396.6 L46.6,403.4 L44.4,403.4 Z', CAPD),
    ln('M38.2,399.4 L41.2,399.4', CAPD, '0.7'),
    // bubbles rising past it
    bubble(25, 401, 3.2), bubble(59.4, 397, 2.2), bubble(59, 418, 3.4),
    bubble(24.4, 424, 2), bubble(26.6, 448, 2.4), bubble(58.6, 445, 1.8),
    // the brand's band along the foot, a white droplet on it
    box(19.4, 472, 45.2, 6.6, 0.4, PINKD),
    f('M42,472.8 C43.8,475 43.8,476.8 42,477.6 C40.2,476.8 40.2,475 42,472.8 Z', '#FFFFFF', '0.35'),
    ln('M16.6,485.6 L67.2,485.6', STEELL, '0.8'),
  ].join('');
}

// ── THE CAFÉ ON THE CORNER, 344–402 × 330–500 ───────────────────────────────
// REFERENCE: rb2-shopfront3-1 (a shop front on Division Street, DuQuoin): a traditional
// shopfront is a FRAME — a pilaster each side topped by a console bracket, a fascia board
// across the top, transom lights over the glass, and a panelled stall riser under it; and
// rb2-shopfront3-4 (Regent Street): a canvas awning slopes out from under the fascia over
// the window, ending in a valance, and shades the glass under it. p4-cafe-1 (Hythe Road):
// a white-rendered terrace with a sash window upstairs. The scene writes CAFÉ on the
// fascia (386.5–399.5), so the board is left plain.
export function cafe() {
  const WALL = '#ECE9E1', WALLD = '#D5D1C6', STONE = '#D9D4C7';
  const RED = '#A12E36', REDD = '#7B2229', CREAM = '#F1E7D3', CREAMD = '#D9CBAE';
  const GREEN = '#2F4A3C', GREEND = '#22372C', GREENL = '#4A6A58';
  const GLASS = '#4E6470', SHOP = '#5E7581', SHOPD = '#3E5059', WARM = '#FFD991';
  const stripes = [];
  for (let x = 344, k = 0; x < 403; x += 6.5, k++) {
    stripes.push(t(`M${x},401.5 L${x + 6.5},401.5 L${x + 6.5},416 L${x},416 Z`, k % 2 ? CREAM : RED));
  }
  const valance = [];
  for (let x = 344, k = 0; x < 403; x += 6.5, k++) {
    valance.push(f(`M${x},416 L${x + 6.5},416 L${x + 6.5},418.6 C${x + 6.5},421.4 ${x},421.4 ${x},418.6 Z`, k % 2 ? CREAM : RED, '0.6'));
  }
  return [
    // the rendered front, and the cornice moulding over the shop
    f('M344,330 L402,330 L402,386 L344,386 Z', WALL, '0.9'),
    t('M344.4,330.4 L347,330.4 L347,385.6 L344.4,385.6 Z', '#F7F5F0'),
    f('M343.4,380.6 L402,380.6 L402,385.8 L343.4,385.8 Z', STONE, '0.7'),
    t('M343.8,383.6 L402,383.6 L402,385.4 L343.8,385.4 Z', WALLD),
    // the sash window upstairs: stone surround, dark glass, curtains, glazing bars, sill
    f('M350.6,335.4 L387.4,335.4 L387.4,373.6 L350.6,373.6 Z', STONE, '0.7'),
    f('M353.4,338.2 L384.6,338.2 L384.6,371.2 L353.4,371.2 Z', GLASS, '0.6'),
    t('M353.8,338.6 C356,346 357.8,356 355.6,370.8 L353.8,370.8 Z', '#EFE3C8'),
    t('M384.2,338.6 C382,346 380.2,356 382.4,370.8 L384.2,370.8 Z', '#E2D3B2'),
    ln('M356.4,354.6 L381.6,354.6', '#F7F5F0', '1.4'),
    ln('M369,338.6 L369,370.8', '#F7F5F0', '1'),
    ln('M359,350 L364,341 M372,366 L377,357', '#7C93A0', '0.9'),
    f('M349,372.8 L389,372.8 L389,376 L349,376 Z', STONE, '0.6'),
    // a window box of geraniums on the sill
    f('M352.6,376 L385.4,376 L384.4,380.4 L353.6,380.4 Z', '#6B4A2E', '0.5'),
    ...[355.6, 359.8, 364.2, 368.6, 373, 377.4, 381.8].map((x, k) => dot(x, 374.6 - (k % 2) * 1.2, 1.5, k % 3 === 1 ? '#F4F1EA' : '#D2392F')),
    ...[357.8, 366.4, 375.2, 383].map((x) => dot(x, 375.8, 1.3, '#4F7A3E')),
    // the fascia board, with a cream moulding top and bottom
    f('M344,385.4 L402,385.4 L402,401.6 L344,401.6 Z', '#8E2830', '0.9'),
    ln('M344.6,386.7 L402,386.7 M344.6,400.3 L402,400.3', '#E9DCC0', '0.7'),
    // the awning: striped canvas sloping out from under the fascia, its valance below
    ...stripes,
    t('M344,401.6 L402,401.6 L402,404.8 L344,404.8 Z', '#000000', 0.16),
    t('M344,412.4 L402,412.4 L402,416 L344,416 Z', '#000000', 0.08),
    ln('M344,401.6 L402,401.6 L402,416 L344,416 Z', INK, '0.8'),
    ...valance,
    // the shop window, in shadow under the awning
    f('M350.4,421 L402,421 L402,473 L350.4,473 Z', SHOP, '0.7'),
    t('M350.8,421.4 L402,421.4 L402,428 L350.8,428 Z', SHOPD),
    // inside: a pendant lamp lit warm, a shelf of cups, a cake on a stand
    ln('M362,421.4 L362,429.6', '#2B2420', '0.6'),
    f('M358.6,432.4 C358.6,429.6 365.4,429.6 365.4,432.4 Z', '#2E3134', '0.5'),
    `<ellipse cx="362" cy="434.4" rx="5" ry="2.6" fill="${WARM}" opacity="0.55"/>`,
    ln('M378,437 L400,437', '#C49A62', '1.2'),
    ...[381.6, 388.4, 395.2].map((x) => f(`M${x - 2.4},432.2 L${x + 2.4},432.2 L${x + 1.9},436.4 L${x - 1.9},436.4 Z`, '#F4F1EA', '0.4')),
    f('M357.4,462 L368.6,462 L367,463.8 L359,463.8 Z', '#F4F1EA', '0.45'),
    ln('M363,456 L363,462', '#F4F1EA', '1'),
    f('M356.6,456.2 L369.4,456.2 L369,453.8 L357,453.8 Z', '#F4F1EA', '0.45'),
    f('M357.6,453.8 C357.6,446.6 368.4,446.6 368.4,453.8 Z', '#E9B4C4', '0.55'),
    t('M357.8,450.8 C358.4,448.8 360.6,447.6 363,447.6 L363,449.8 C361,449.8 359.4,450.4 358.2,451.6 Z', '#FFFFFF', 0.85),
    dot(363, 446.6, 1.1, '#D2392F'),
    // a chalk menu board propped in the window
    f('M380,444.4 L398.6,444.4 L398.6,466.6 L380,466.6 Z', '#2E3134', '0.6'),
    ln('M382.6,448.4 L392,448.4 M382.6,452.6 L395.4,452.6 M382.6,456.8 L390.6,456.8 M382.6,461 L394.2,461', '#E9E6DD', '0.7'),
    ln('M376,466.8 L402,466.8', '#C49A62', '1.4'),
    // the glazing: a mullion, a transom, and light across the glass
    ln('M375.6,421.4 L375.6,472.6', GREEN, '1.6'),
    ln('M350.8,430 L402,430', GREEN, '1.2'),
    ln('M353,468 L364,440 M356,470 L366.6,443', '#9FB4BF', '0.9'),
    // the pilaster at the corner, topped by its console bracket
    f('M343.4,401.6 L350.4,401.6 L350.4,500 L343.4,500 Z', GREEN, '0.8'),
    t('M343.8,402 L345.6,402 L345.6,499.6 L343.8,499.6 Z', GREENL),
    f('M343,387.6 L351,387.6 L351,392 C351,395.6 348.4,396.8 347.6,401.6 L346.2,401.6 C345.4,396.8 343,395.6 343,392 Z', GREEN, '0.7'),
    ln('M344.6,389.6 L349.4,389.6', GREENL, '0.7'),
    // the sill and the panelled stall riser
    f('M349.6,472.6 L402,472.6 L402,476.2 L349.6,476.2 Z', '#E4E5E1', '0.6'),
    f('M350.4,476.2 L402,476.2 L402,500 L350.4,500 Z', GREEN, '0.7'),
    f('M354.6,480 L398,480 L398,496 L354.6,496 Z', GREEND, '0.5'),
    ln('M355.2,495.6 L397.6,495.6 M397.6,480.4 L397.6,495.6', GREENL, '0.7'),
  ].join('');
}

// ── THE STOP POLE AND ITS FLAG, 280–320 × 352–500 ───────────────────────────
// REFERENCE: rb2-busflag-2 (Southampton Town Quay, Commons): the flag is a white plate
// held off the pole by BAND CLAMPS top and bottom, a coloured band across its head and a
// side-on bus pictogram — a long box with a row of windows, its front rounded, a door and
// two wheels. p4-stopclosed-2: a steel pole on a concrete foot. The pole stands at 284.
export function pole() {
  const STEEL = '#8C9298', STEELD = '#6E747A', STEELL = '#C4C8CC';
  const RED = '#D2392F', WHITE = '#F7F7F3', WHITED = '#DCDDD7';
  return [
    // the concrete foot, the pole and its cap
    f('M279.4,494.4 L288.6,494.4 L289.2,500 L278.8,500 Z', '#B6B7AB', '0.7'),
    f('M282,355.6 L286,355.6 L286,494.6 L282,494.6 Z', STEEL, '0.7'),
    t('M284.4,356 L285.6,356 L285.6,494.2 L284.4,494.2 Z', STEELD),
    t('M282.4,356 L283.2,356 L283.2,494.2 L282.4,494.2 Z', STEELL),
    f('M281.2,353 C281.2,352.2 286.8,352.2 286.8,353 L286.8,356 L281.2,356 Z', STEELD, '0.6'),
    // the band clamps that hold the flag off the pole
    ...[357.4, 375.2].map((y) => f(`M281.6,${y - 1.3} L289.4,${y - 1.3} L289.4,${y + 1.3} L281.6,${y + 1.3} Z`, '#3E4448', '0.5')),
    // the flag: a white plate with a darker edge, a red band at its head
    f('M288.6,353.8 L319.4,353.8 L319.4,378.6 L288.6,378.6 Z', WHITE, '0.8'),
    t('M317.4,354.4 L318.8,354.4 L318.8,378 L317.4,378 Z', WHITED),
    t('M289.2,377 L318.8,377 L318.8,378 L289.2,378 Z', WHITED),
    f('M289.2,354.4 L318.8,354.4 L318.8,358.4 L289.2,358.4 Z', RED, '0.4'),
    // the bus, side on: a long body with a rounded front, its windows, a door, two wheels
    f('M292,363 L312.4,363 C314.4,363 315.2,364 315.4,366.4 L315.6,371 L292,371 Z', RED, '0.6'),
    ...[293.6, 297.4, 301.2, 305].map((x) => box(x, 364.4, 3, 2.8, 0.4, '#CFE3EE')),
    box(309.2, 364.4, 2.4, 5.4, 0.4, '#CFE3EE'),
    f('M312.4,364.6 L314.2,364.6 C314.8,365 315,366 315,367.6 L312.4,367.6 Z', '#CFE3EE', '0.3'),
    ln('M292.4,368.4 L315.4,368.4', '#F7F7F3', '0.6'),
    dot(296.4, 371.2, 2.1, '#2E3134'), dot(296.4, 371.2, 0.8, STEELL),
    dot(310.4, 371.2, 2.1, '#2E3134'), dot(310.4, 371.2, 0.8, STEELL),
  ].join('');
}

export const ART = [
  // advertCase(42, 436, 56, 104)
  { name: 'psych4-advert', svg: advert, view: { x: 14, y: 384, w: 56, h: 104 }, box: { x: 14, y: 384, w: 56, h: 104 } },
  // cafeTerrace(372, 415, 56, 170), drawn 2 units past the stage's edge
  { name: 'psych4-cafe', svg: cafe, view: { x: 343, y: 330, w: 59, h: 170 }, box: { x: 343, y: 330, w: 59, h: 170 } },
  // stopPole(300, 426, 40, 148)
  { name: 'psych4-pole', svg: pole, view: { x: 278, y: 352, w: 42, h: 148 }, box: { x: 278, y: 352, w: 42, h: 148 } },
];

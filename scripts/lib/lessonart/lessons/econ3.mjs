// economics-foundations-3, "What Does It Really Cost?" — the two bills pasted on the brick
// wall (LESSON_RULES AM13): the CONCERT bill and the FOOTBALL bill, drawn as pictures.
// REFERENCE (Commons "Acoustic guitar numbered.svg", "Soccer ball Pinhead icon.svg"): a
// classical guitar is a waisted figure-eight body with a small upper bout, a round sound
// hole above a bridge, a long dark fingerboard and a headstock turned back at the top; a
// football is a ring of white hexagon-like panels round a dark pentagon, seams running out
// to the rim. The printed words (CONCERT, FOOTBALL, FREE) stay live Text in the scene, so
// each poster leaves its headline band and the flash empty. Each takes the box of the
// poster it replaces (60 × 72 centred at 48,432 and 146,432), nothing else moves.
// Flat fills lit from the top left, a darker side, ONE dark outline, no gradients.

const INK = '#2B2420';
const P = (d, f, s, w) => `<path d="${d}" fill="${f}"${s ? ` stroke="${s}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"` : ''}/>`;
const f1 = (v) => v.toFixed(2);

const frame = (inner, band) => `
  <rect x="0.6" y="0.6" width="58.8" height="70.8" rx="3" fill="#FFFDF6" stroke="${INK}" stroke-width="1.2"/>
  <clipPath id="pc"><rect x="3" y="3" width="54" height="66" rx="1.6"/></clipPath>
  <g clip-path="url(#pc)">${inner}</g>
  <rect x="3" y="3" width="54" height="14.4" rx="1.6" fill="${band}"/>
  <path d="M3,17.4 H57" stroke="${INK}" stroke-width="0.8"/>`;

function guitar() {
  const body = 'M-8,-2 C-8,-9 8,-9 8,-2 C8,3 6,4 6.5,7 C7,10 12,11 12,17 C12,24 5,27 0,27 C-5,27 -12,24 -12,17 C-12,11 -7,10 -6.5,7 C-6,4 -8,3 -8,-2 Z';
  const lit = 'M-6.4,-2 C-6.4,-7 6,-7 6,-2.4 C5,-5.5 -4,-6 -6.4,-2 Z M-10.2,16 C-10.2,12 -7,11 -5.6,8.6 C-8,12 -9,14 -9,19 Z';
  return `<g transform="translate(31 47.5) scale(0.7) rotate(-26)">
    ${P('M-1.9,-29 L1.9,-29 L2.2,-3 L-2.2,-3 Z', '#2A2220', INK, 1.1)}
    ${P('M-3.3,-37 L3.3,-37 L2.6,-28 L-2.6,-28 Z', '#3A2E28', INK, 1.1)}
    <rect x="-4.4" y="-35" width="1.9" height="2.4" rx="0.8" fill="#F1DFA5"/><rect x="2.5" y="-35" width="1.9" height="2.4" rx="0.8" fill="#F1DFA5"/>
    <rect x="-4.4" y="-31.4" width="1.9" height="2.4" rx="0.8" fill="#F1DFA5"/><rect x="2.5" y="-31.4" width="1.9" height="2.4" rx="0.8" fill="#F1DFA5"/>
    <g transform="translate(1.4 1.2)">${P(body, '#7C4624', null)}</g>
    ${P(body, '#C07A3C', INK, 1.3)}
    ${P(lit, '#DB9A55', null)}
    <circle cx="0" cy="10" r="3.7" fill="#4A2B18" stroke="${INK}" stroke-width="0.9"/>
    <circle cx="0" cy="10" r="4.9" fill="none" stroke="#7C4624" stroke-width="0.8"/>
    <rect x="-5" y="19.4" width="10" height="2.3" rx="0.8" fill="#3A2218" stroke="${INK}" stroke-width="0.7"/>
    <path d="M-0.8,-3 L-0.7,19.6 M0.8,-3 L0.7,19.6" stroke="#EDE7D6" stroke-width="0.35" fill="none"/>
  </g>`;
}

function concert() {
  const beams = P('M10,3 L-4,69 L22,69 Z', '#3B4F7A', null) + P('M50,3 L38,69 L66,69 Z', '#3B4F7A', null);
  const inner = `<rect x="3" y="3" width="54" height="66" fill="#1F2A48"/>${beams}
    <ellipse cx="30" cy="66" rx="22" ry="4.5" fill="#141C34"/>${guitar()}
    <rect x="9" y="62.4" width="42" height="1.6" rx="0.8" fill="#EFE7D2"/>
    <rect x="16" y="65.4" width="28" height="1.3" rx="0.6" fill="#8895B8"/>`;
  return frame(inner, '#C0392B');
}

function ball(cx, cy, r) {
  const pent = (px, py, pr, rot) => {
    let d = '';
    for (let k = 0; k < 5; k++) {
      const a = rot + (k / 5) * Math.PI * 2 - Math.PI / 2;
      d += `${k ? 'L' : 'M'}${f1(px + Math.cos(a) * pr)},${f1(py + Math.sin(a) * pr)}`;
    }
    return `${d}Z`;
  };
  let seams = '';
  let rim = '';
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * Math.PI * 2 - Math.PI / 2;
    const ax = cx + Math.cos(a) * r * 0.36, ay = cy + Math.sin(a) * r * 0.36;
    const bx = cx + Math.cos(a) * r * 0.72, by = cy + Math.sin(a) * r * 0.72;
    seams += `<path d="M${f1(ax)},${f1(ay)} L${f1(bx)},${f1(by)}" stroke="${INK}" stroke-width="0.9" stroke-linecap="round"/>`;
    const a2 = a + Math.PI / 5;
    rim += P(pent(cx + Math.cos(a2) * r * 1.0, cy + Math.sin(a2) * r * 1.0, r * 0.4, a2 + Math.PI / 2 + Math.PI), '#2B2420', null);
  }
  return `<clipPath id="bc"><circle cx="${cx}" cy="${cy}" r="${r}"/></clipPath>
    <circle cx="${cx + 1}" cy="${cy + 1.2}" r="${r}" fill="#0E3B1E" opacity="0.5"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="#FAF8F2"/>
    <g clip-path="url(#bc)"><path d="M${cx + r * 0.2},${cy + r} A${r},${r} 0 0 0 ${cx + r},${cy - r * 0.3} A${r * 1.15},${r * 1.15} 0 0 1 ${cx + r * 0.2},${cy + r} Z" fill="#D8D4C8"/>${rim}</g>
    ${seams}${P(pent(cx, cy, r * 0.3, 0), '#2B2420', null)}
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${INK}" stroke-width="1.3"/>`;
}

function football() {
  let stripes = '';
  for (let k = 0; k < 6; k++) stripes += `<rect x="3" y="${17.4 + k * 8.8}" width="54" height="4.4" fill="#3E9A52"/>`;
  const inner = `<rect x="3" y="3" width="54" height="66" fill="#2F8043"/>${stripes}
    <rect x="9" y="22" width="42" height="38" fill="none" stroke="#EAF3E4" stroke-width="0.9"/>
    <path d="M9,41 H51" stroke="#EAF3E4" stroke-width="0.9"/><circle cx="30" cy="41" r="8" fill="none" stroke="#EAF3E4" stroke-width="0.9"/>
    <ellipse cx="25" cy="48.5" rx="9.5" ry="2" fill="#0E3B1E" opacity="0.35"/>${ball(24.5, 38.5, 9.5)}`;
  return frame(inner, '#1E6B33');
}

export const ART = [
  { name: 'econ3-concert', svg: concert, view: { x: 0, y: 0, w: 60, h: 72 }, box: { x: 18, y: 396, w: 60, h: 72 } },
  { name: 'econ3-football', svg: football, view: { x: 0, y: 0, w: 60, h: 72 }, box: { x: 116, y: 396, w: 60, h: 72 } },
];

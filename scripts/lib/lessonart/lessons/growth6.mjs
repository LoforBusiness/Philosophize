// growth6 — personal-growth-foundations-6, "Why Cramming Fades": A LIGHTHOUSE LAMP ROOM.
// REFERENCE (scratchpad/ref/g6-lens-2, "Fresnel lens parts", CC BY-SA 3.0): a Fresnel lens is
// the thick lens CUT INTO STEPPED CONCENTRIC RINGS, each ring a saw-tooth prism, round a thin
// bullseye. A first-order lens is a beehive of them: curved horizontal prism bands above and
// below a bullseye of concentric rings, held in brass bands and a brass cap and foot.
// Zero imports.
const INK = '#2B2420';
const fill = (d, c, w) => `<path d="${d}" fill="${c}" stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
const tone = (d, c, o = 1) => `<path d="${d}" fill="${c}" opacity="${o}"/>`;
const line = (d, c, w) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
const GL = '#BFE0DA', GLD = '#8DB9B4', GLH = '#E8F6F3', BR = '#C99A2C', BRD = '#946C14', BRH = '#EBC863';

function lens() {
  const o = '0.9';
  const body = 'M19,13 C9,24 0,42 0,61 C0,80 9,98 21,108 L55,108 C67,98 76,80 76,61 C76,42 67,24 57,13 Z';
  const out = [];
  out.push(fill(body, GL, o));
  // the side away from the lamp
  out.push(tone('M57,13 C67,24 76,42 76,61 C76,80 67,98 55,108 L46,108 C58,96 66,80 66,61 C66,42 58,26 50,13 Z', GLD, 0.8));
  // upper prism bands: each a curved step, saw-tooth edge catching light
  for (const [y, hw] of [[21, 20], [29, 27], [37, 33], [45, 36]]) {
    out.push(line(`M${38 - hw},${y} Q38,${y + 4.2} ${38 + hw},${y}`, GLD, 0.9));
    out.push(line(`M${38 - hw + 1.2},${y - 1.4} Q38,${y + 2.6} ${38 + hw - 1.2},${y - 1.4}`, GLH, 0.7));
  }
  for (const [y, hw] of [[78, 36], [86, 33], [94, 28], [101, 22]]) {
    out.push(line(`M${38 - hw},${y} Q38,${y + 4.2} ${38 + hw},${y}`, GLD, 0.9));
    out.push(line(`M${38 - hw + 1.2},${y - 1.4} Q38,${y + 2.6} ${38 + hw - 1.2},${y - 1.4}`, GLH, 0.7));
  }
  // the bullseye: stepped rings round a bright centre
  out.push(fill('M38,43 C58,43 70,50 70,61 C70,72 58,79 38,79 C18,79 6,72 6,61 C6,50 18,43 38,43 Z', GLH, 0.7));
  for (const [rx, ry, c] of [[27, 15, GLD], [21, 11.6, GLH], [15, 8.4, GLD], [9.5, 5.4, GLH]]) {
    out.push(`<ellipse cx="38" cy="61" rx="${rx}" ry="${ry}" fill="${c}" stroke="${INK}" stroke-width="0.45"/>`);
  }
  out.push(`<ellipse cx="38" cy="61" rx="4.6" ry="3.2" fill="#FFF6C8" stroke="${INK}" stroke-width="0.4"/>`);
  out.push(line('M10,52 C11,47 16,45 22,44', '#FFFFFF', 1.1));
  // brass bands round the barrel
  out.push(fill('M1.6,43 Q38,50 74.4,43 L75.4,47.4 Q38,54.6 0.6,47.4 Z', BR, o));
  out.push(tone('M1.6,43 Q38,50 74.4,43 L74.6,44.4 Q38,51.4 1.4,44.4 Z', BRH, 0.8));
  out.push(fill('M0.6,74.6 Q38,81.8 75.4,74.6 L74.4,79 Q38,86.4 1.6,79 Z', BR, o));
  out.push(tone('M0.6,74.6 Q38,81.8 75.4,74.6 L75.2,76 Q38,83.2 0.8,76 Z', BRH, 0.8));
  // cap: a brass dome and collar on the top ring
  out.push(fill('M18,13 L58,13 L56,9 L20,9 Z', BR, o));
  out.push(fill('M24,9 C24,2 52,2 52,9 Z', BR, o));
  out.push(tone('M27,8 C28,4.4 36,3.2 38,3.6 C34,4 30,5.4 29,8 Z', BRH, 0.9));
  out.push(`<circle cx="38" cy="2.6" r="1.8" fill="${BR}" stroke="${INK}" stroke-width="0.6"/>`);
  // foot ring
  out.push(fill('M21,108 L55,108 L58,113 L18,113 Z', BR, o));
  out.push(fill('M16,113 L60,113 L61,118 L15,118 Z', BRD, o));
  out.push(tone('M16,113 L60,113 L60.4,114.4 L15.6,114.4 Z', BRH, 0.7));
  return out.join('');
}

export const ART = [
  { name: 'growth6-lens', svg: lens, view: { x: 0, y: 0, w: 76, h: 120 }, box: { x: 280, y: 330, w: 76, h: 120 } },
];

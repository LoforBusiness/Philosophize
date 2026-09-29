// ─────────────────────────────────────────────────────────────────────────────
// THE SUBJECT POSTERS — seven subjects and philosophy's six branches (2026-09-29).
//
//   posterXml('science', hue, 169, 120)  → an <svg> string sized for that box
//
// The owner asked for the subject cards to be "more appealing … better gamification
// look", with references. What the references agreed on (Imprint's course covers,
// Brilliant's course art, Headway's and Deepstash's shelves) is that the ART FILLS
// THE CARD: a saturated ground in the course's own colour with one lit object on it,
// not a small drawing sat on a pale panel. The owner picked this "poster" style from
// a sheet of all seven on 2026-09-29.
//
// ── ONE CONSTRUCTION FOR ALL THIRTEEN ───────────────────────────────────────
//
// A hue field; a lit disc behind the subject (two rings of the hue toward paper); a
// floor a step darker, with a pale lip; three sparkles and two dots; the object in
// PAPER with its shaded plane in the hue's mid tone and one INK outline weight; a PILL
// shadow under anything that stands (never an oval — §17 group AG); and one EMBER
// spark, the tab icons' own mark. The light is from the top left, as everywhere.
//
// ── THE BOX DECIDES THE VIEWBOX, NOT THE OTHER WAY ROUND ────────────────────
//
// The drawing is authored in a 200×150 frame, and a card can be any shape: the Home
// card is wide, a Learn tile nearly square, the masthead very wide. Slicing would crop
// the object's head off and meeting would leave bars, so the viewBox GROWS to the box's
// aspect instead — sideways about the centre, or upward from the floor — and the
// ground, floor and disc are drawn far past the frame so the extra room is simply
// more of the same world. The object is never cut and never stretched. A box TALLER
// than the frame first trims the frame's empty sides to CORE, so a narrow branch card
// is not a tall sky over a small drawing.
//
// ── ZERO RUNTIME IMPORTS BUT tone.ts, WHICH HAS NONE ─────────────────────────
//
// So `npm run sheet:subjects` renders every poster in a plain browser page, and
// check:subjects can build each string in Node and look at it.
//
// ── EACH DRAWING STATES ITS REFERENCE ───────────────────────────────────────
//
// Fetched with `npm run ref` before drawing, as the lesson objects are (group AM).
// ─────────────────────────────────────────────────────────────────────────────
import { mix, INK, EMBER, PAPER, PAPER_LIT } from '@/components/shared/tone';

export type PosterKey =
  | 'philosophy' | 'psychology' | 'personal-growth' | 'business' | 'economics' | 'science' | 'history'
  | 'metaphysics' | 'epistemology' | 'logic' | 'ethics' | 'aesthetics' | 'political-philosophy';

/** The authored frame. */
export const FRAME = { w: 200, h: 150 } as const;
/**
 * The band every OBJECT stays inside, sideways. The frame's outer 22 units each side
 * are only sky and floor, so a box taller than the frame may trim them rather than
 * grow so tall that the drawing shrinks to its foot — a branch card is 80 wide and
 * 128 tall on a narrow phone.
 */
export const CORE = { x0: 22, x1: 178 } as const;
/** The outline weight, in frame units. */
export const LINE = 3;

const tint = (h: string, t: number) => mix(h, PAPER_LIT, t);
const shade = (h: string, t: number) => mix(h, INK, t * 1.1);
const LIT = PAPER;
const S = `stroke="${INK}" stroke-width="${LINE}" stroke-linejoin="round" stroke-linecap="round"`;

function star(x: number, y: number, r: number, fill: string) {
  const k = r * 0.28;
  return `<path d="M${x} ${y - r}Q${x + k} ${y - k} ${x + r} ${y}Q${x + k} ${y + k} ${x} ${y + r}Q${x - k} ${y + k} ${x - r} ${y}Q${x - k} ${y - k} ${x} ${y - r}Z" fill="${fill}"/>`;
}
/** The ember spark — the one small warm mark every drawing carries. */
function spark(x: number, y: number, s = 9) {
  return `<rect x="${x - s / 2}" y="${y - s / 2}" width="${s}" height="${s}" rx="1.6" transform="rotate(45 ${x} ${y})" fill="${EMBER}" ${S} stroke-width="2.4"/>`;
}
/** A cast shadow: a pill, never an oval (group AG). */
function pill(x: number, y: number, w: number, hue: string) {
  return `<rect x="${x - w / 2}" y="${y - 4}" width="${w}" height="8" rx="4" fill="${shade(hue, 0.35)}" opacity="0.55"/>`;
}

interface Stage { disc?: [number, number, number]; floor?: number | null }

/** The world every poster stands in, drawn far past the frame so any box is filled. */
function world(hue: string, { disc = [104, 66, 54], floor = 116 }: Stage) {
  const [cx, cy, r] = disc;
  const ground = `<rect x="-600" y="-600" width="1400" height="1400" fill="${hue}"/>`;
  const glow = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${tint(hue, 0.16)}"/><circle cx="${cx}" cy="${cy}" r="${r - 12}" fill="${tint(hue, 0.24)}"/>`;
  const fl = floor == null ? '' :
    `<rect x="-600" y="${floor}" width="1400" height="700" fill="${shade(hue, 0.22)}"/><rect x="-600" y="${floor}" width="1400" height="2" fill="${tint(hue, 0.12)}"/>`;
  const sky = star(28, 30, 6, tint(hue, 0.5)) + star(176, 104, 4.5, tint(hue, 0.45)) + star(40, 96, 3.5, tint(hue, 0.4))
    + star(-30, 50, 5, tint(hue, 0.4)) + star(232, 40, 5, tint(hue, 0.4))
    + `<circle cx="170" cy="30" r="2.4" fill="${tint(hue, 0.45)}"/><circle cx="18" cy="70" r="2" fill="${tint(hue, 0.4)}"/>`
    + `<circle cx="-12" cy="10" r="2.2" fill="${tint(hue, 0.4)}"/><circle cx="214" cy="84" r="2.2" fill="${tint(hue, 0.4)}"/>`;
  return ground + glow + fl + sky;
}

const mid = (hue: string) => tint(hue, 0.58);
const recess = (hue: string) => shade(hue, 0.12);

/**
 * A gear as ONE outline — the rim and its teeth traced as a single path — so it is
 * outlined once. Teeth drawn as separate outlined blocks read as a dashed ring.
 */
function gear(x: number, y: number, r: number, teeth: number, fill: string, hue: string, rot = 0) {
  const out = r + Math.max(4, r * 0.22);
  const step = (Math.PI * 2) / teeth;
  const pts: string[] = [];
  const at = (rad: number, a: number) => `${(x + rad * Math.cos(a)).toFixed(2)} ${(y + rad * Math.sin(a)).toFixed(2)}`;
  for (let i = 0; i < teeth; i++) {
    const a = (rot * Math.PI) / 180 + i * step;
    // root, flank up, tooth top, flank down — the tooth takes 45% of each step
    pts.push(at(r, a - step * 0.5), at(r, a - step * 0.3), at(out, a - step * 0.2), at(out, a + step * 0.2), at(r, a + step * 0.3));
  }
  return `<path d="M${pts.join('L')}Z" fill="${fill}" ${S}/>`
    + `<circle cx="${x}" cy="${y}" r="${r * 0.62}" fill="none" stroke="${mid(hue)}" stroke-width="2"/>`
    + `<circle cx="${x}" cy="${y}" r="${r * 0.3}" fill="${recess(hue)}" ${S} stroke-width="2.4"/>`;
}
function coin(x: number, y: number, hue: string, rx = 14) {
  return `<ellipse cx="${x}" cy="${y + 3.5}" rx="${rx}" ry="5.5" fill="${mid(hue)}" ${S} stroke-width="2.4"/><ellipse cx="${x}" cy="${y}" rx="${rx}" ry="5.5" fill="${LIT}" ${S} stroke-width="2.4"/>`;
}
/**
 * A stack of `n` coins as ONE cylinder — a lit body with its shaded right side, the
 * coin seams as hairlines in the mid tone, and the top face — so it reads as a stack
 * of coins and not as a ribbed barrel (which is what n outlined coins came out as).
 */
function coinStack(x: number, base: number, n: number, hue: string, rx = 15) {
  const M = mid(hue);
  const ry = 5.5;
  const top = base - n * 6;
  let seams = '';
  for (let i = 1; i < n; i++) {
    const y = base - i * 6;
    seams += `<path d="M${x - rx} ${y}A${rx} ${ry} 0 0 0 ${x + rx} ${y}" fill="none" stroke="${M}" stroke-width="1.6"/>`;
  }
  return `<path d="M${x - rx} ${top}L${x - rx} ${base}A${rx} ${ry} 0 0 0 ${x + rx} ${base}L${x + rx} ${top}Z" fill="${LIT}"/>`
    + `<path d="M${x + rx * 0.35} ${top + ry * 0.94}L${x + rx * 0.35} ${base + ry * 0.94}A${rx} ${ry} 0 0 0 ${x + rx} ${base}L${x + rx} ${top}Z" fill="${M}" opacity="0.7"/>`
    + seams
    + `<path d="M${x - rx} ${top}L${x - rx} ${base}A${rx} ${ry} 0 0 0 ${x + rx} ${base}L${x + rx} ${top}" fill="none" ${S}/>`
    + `<ellipse cx="${x}" cy="${top}" rx="${rx}" ry="${ry}" fill="${LIT}" ${S}/>`
    + `<ellipse cx="${x}" cy="${top}" rx="${rx * 0.55}" ry="${ry * 0.5}" fill="none" stroke="${M}" stroke-width="1.6"/>`;
}

type Draw = (hue: string) => { stage?: Stage; body: string };

const DRAW: Record<PosterKey, Draw> = {
  // REFERENCE: a classical marble bust — a turned socle, a truncated chest wider than
  // the head, a short neck, a head of curls — beside an Ionic column (volutes each side
  // of the capital, a fluted shaft, a plinth).
  philosophy: (hue) => {
    const M = mid(hue);
    return { body: `
      ${pill(146, 118, 44, hue)}
      <rect x="126" y="112" width="40" height="8" rx="2" fill="${LIT}" ${S}/>
      <rect x="131" y="46" width="30" height="66" fill="${LIT}" ${S}/>
      <path d="M146 48L146 110" stroke="${M}" stroke-width="4"/>
      <path d="M138 48L138 110M154 48L154 110" stroke="${M}" stroke-width="2.5"/>
      <rect x="124" y="36" width="44" height="10" rx="3" fill="${LIT}" ${S}/>
      <circle cx="126" cy="42" r="7" fill="${LIT}" ${S}/><circle cx="126" cy="42" r="2.5" fill="${INK}"/>
      <circle cx="166" cy="42" r="7" fill="${LIT}" ${S}/><circle cx="166" cy="42" r="2.5" fill="${INK}"/>
      <rect x="122" y="28" width="48" height="8" rx="2" fill="${LIT}" ${S}/>
      ${pill(84, 120, 58, hue)}
      <rect x="64" y="112" width="40" height="9" rx="3" fill="${LIT}" ${S}/>
      <path d="M74 112L76 102L92 102L94 112Z" fill="${M}" ${S}/>
      <rect x="66" y="96" width="36" height="7" rx="3" fill="${LIT}" ${S}/>
      <path d="M52 96Q50 74 70 70L98 70Q118 74 116 96Z" fill="${LIT}"/>
      <path d="M98 70Q118 74 116 96L100 96Q104 80 96 71Z" fill="${M}"/>
      <path d="M52 96Q50 74 70 70L98 70Q118 74 116 96Z" fill="none" ${S}/>
      <path d="M77 58L77 72L91 72L91 58Z" fill="${M}" ${S}/>
      <path d="M68 44Q68 22 86 22Q104 22 104 42Q104 48 108 54L102 56Q103 62 98 64Q92 67 86 64Q70 62 68 44Z" fill="${LIT}" ${S}/>
      <path d="M67 42Q64 22 84 18Q100 16 104 30Q98 26 92 30Q86 26 80 32Q76 30 74 38Q70 38 67 42Z" fill="${M}" ${S}/>
      <path d="M92 44Q95 42 98 44" stroke="${INK}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      <path d="M58 88Q70 80 80 86M86 84Q98 80 110 88" stroke="${M}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      ${spark(118, 18)}` };
  },

  // REFERENCE: a head in profile — the skull's round back, forehead, nose, chin — on
  // a neck; the skull opened to show meshed gears; a thought bubble with its trail.
  psychology: (hue) => {
    const M = mid(hue);
    return { body: `
      ${pill(92, 120, 70, hue)}
      <path d="M66 118L66 100Q48 92 48 70Q48 32 90 30Q128 30 132 62L142 80L133 83Q136 94 128 98Q120 102 112 100L112 118Z" fill="${LIT}"/>
      <path d="M66 118L66 100Q60 97 57 93Q70 104 88 104L88 118Z" fill="${M}"/>
      <path d="M66 118L66 100Q48 92 48 70Q48 32 90 30Q128 30 132 62L142 80L133 83Q136 94 128 98Q120 102 112 100L112 118Z" fill="none" ${S}/>
      <path d="M58 64Q58 40 88 40Q114 42 116 62Q116 82 92 84Q62 86 58 64Z" fill="${recess(hue)}" ${S}/>
      ${gear(78, 60, 10, 8, M, hue)}${gear(100, 70, 7, 8, LIT, hue, 20)}
      <circle cx="160" cy="52" r="16" fill="${LIT}" ${S}/>
      <circle cx="144" cy="70" r="4.5" fill="${LIT}" ${S} stroke-width="2.4"/>
      <path d="M155 47Q155 41 161 41Q167 41 167 47Q167 51 161 53L161 57" fill="none" stroke="${INK}" stroke-width="3.2" stroke-linecap="round"/>
      <circle cx="161" cy="63" r="2.2" fill="${INK}"/>
      ${spark(34, 44)}` };
  },

  // REFERENCE: a summit with a snow cap and a flag planted at the top, a second lower
  // peak behind, and a dotted trail climbing the lit face.
  'personal-growth': (hue) => {
    const M = mid(hue);
    return { body: `
      <path d="M118 116L150 70L184 116Z" fill="${tint(hue, 0.34)}" ${S}/>
      ${pill(100, 118, 130, hue)}
      <path d="M34 116L96 40L160 116Z" fill="${LIT}"/>
      <path d="M96 40L160 116L112 116Z" fill="${M}"/>
      <path d="M34 116L96 40L160 116Z" fill="none" ${S}/>
      <path d="M80 60L96 40L112 60L104 56L96 64L88 56Z" fill="${PAPER_LIT}" ${S} stroke-width="2.4"/>
      <path d="M60 116Q70 100 84 96Q98 92 96 80" fill="none" stroke="${shade(hue, 0.15)}" stroke-width="3" stroke-dasharray="1 7" stroke-linecap="round"/>
      <path d="M96 40L96 14" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
      <path d="M97 15L118 21L97 27Z" fill="${EMBER}" ${S} stroke-width="2.4"/>` };
  },

  // REFERENCE: a briefcase — a wide body with rounded corners, a flap across its upper
  // third, a clasp on the seam, an arched handle — before a bar chart rising right.
  business: (hue) => {
    const M = mid(hue);
    const bar = (x: number, h: number, w = 16) =>
      `<rect x="${x}" y="${108 - h}" width="${w}" height="${h}" fill="${LIT}"/><rect x="${x + w - 6}" y="${108 - h + 1.5}" width="4.5" height="${h - 3}" fill="${M}"/><rect x="${x}" y="${108 - h}" width="${w}" height="${h}" fill="none" ${S}/>`;
    return { body: `
      ${pill(150, 110, 70, hue)}
      <rect x="112" y="106" width="80" height="6" rx="2" fill="${recess(hue)}" ${S}/>
      ${bar(128, 26)}${bar(150, 40)}${bar(172, 54)}
      <path d="M122 70L144 56L158 60L176 40" fill="none" stroke="${INK}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M166 36L181 34L180 49Z" fill="${INK}" ${S} stroke-width="2"/>
      ${pill(74, 122, 84, hue)}
      <path d="M62 78Q62 68 72 68L86 68Q96 68 96 78" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>
      <path d="M62 78Q62 68 72 68L86 68Q96 68 96 78" fill="none" stroke="${M}" stroke-width="2.6" stroke-linecap="round"/>
      <rect x="34" y="78" width="90" height="44" rx="7" fill="${LIT}" ${S}/>
      <rect x="34" y="78" width="90" height="16" rx="7" fill="${M}" ${S}/>
      <rect x="72" y="88" width="14" height="12" rx="2.5" fill="${EMBER}" ${S} stroke-width="2.4"/>
      <path d="M40 112L118 112" stroke="${M}" stroke-width="2.5"/>` };
  },

  // REFERENCE: the supply-and-demand diagram every economics text opens with — two
  // lines crossing on a pair of axes — on a board on legs; and stacks of coins, each
  // coin an elliptical top over a band of edge.
  economics: (hue) => {
    const M = mid(hue);
    const stack = coinStack(66, 114, 7, hue, 16);
    const small = coinStack(32, 118, 3, hue, 13);
    return { body: `
      ${pill(140, 118, 72, hue)}
      <path d="M112 100L110 118M168 100L170 118" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
      <path d="M112 100L110 118M168 100L170 118" stroke="${M}" stroke-width="1.6" stroke-linecap="round"/>
      <rect x="98" y="38" width="84" height="62" rx="5" fill="${LIT}" ${S}/>
      <path d="M110 46L110 90L172 90" fill="none" stroke="${M}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M116 50Q138 70 168 84" fill="none" stroke="${INK}" stroke-width="3.2" stroke-linecap="round"/>
      <path d="M116 86Q140 68 166 48" fill="none" stroke="${shade(hue, 0.05)}" stroke-width="3.2" stroke-linecap="round"/>
      ${spark(140.5, 68.5, 8)}
      ${pill(52, 122, 80, hue)}
      ${small}${stack}` };
  },

  // REFERENCE: an Erlenmeyer flask — a narrow neck with a lip, a conical body, a wide
  // flat base, liquid in the lower part with bubbles — and a ringed planet above.
  science: (hue) => {
    const M = mid(hue);
    return { body: `
      <circle cx="152" cy="42" r="14" fill="${tint(hue, 0.5)}" ${S}/>
      <path d="M130 50Q152 34 176 34" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
      <path d="M128 48Q150 58 178 36" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
      ${pill(98, 120, 76, hue)}
      <path d="M86 32L86 62L58 116Q56 122 64 122L132 122Q140 122 138 116L110 62L110 32Z" fill="${LIT}"/>
      <path d="M71 92L125 92L138 116Q140 122 132 122L64 122Q56 122 58 116Z" fill="${tint(hue, 0.42)}"/>
      <path d="M110 62L138 116Q140 122 132 122L120 122L100 64Z" fill="${M}" opacity="0.55"/>
      <path d="M86 32L86 62L58 116Q56 122 64 122L132 122Q140 122 138 116L110 62L110 32Z" fill="none" ${S}/>
      <rect x="80" y="26" width="36" height="8" rx="3" fill="${LIT}" ${S}/>
      <path d="M100 74L106 74M100 82L108 82" stroke="${M}" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="88" cy="104" r="4" fill="${LIT}" ${S} stroke-width="2"/>
      <circle cx="104" cy="110" r="3" fill="${LIT}" ${S} stroke-width="2"/>
      <circle cx="96" cy="18" r="4" fill="${LIT}" ${S} stroke-width="2"/>
      <circle cx="108" cy="10" r="2.6" fill="${LIT}" ${S} stroke-width="2"/>
      ${spark(40, 40)}` };
  },

  // REFERENCE: an hourglass — two glass bulbs pinched at the waist, between a top and
  // a bottom disc, held by turned posts — sand in both halves; a scroll on its rollers.
  history: (hue) => {
    const M = mid(hue);
    return { body: `
      <path d="M140 116L166 76L192 116Z" fill="${tint(hue, 0.3)}"/>
      ${pill(106, 120, 70, hue)}
      <rect x="76" y="112" width="60" height="9" rx="3" fill="${M}" ${S}/>
      <rect x="76" y="26" width="60" height="9" rx="3" fill="${M}" ${S}/>
      <path d="M90 35Q90 60 104 72Q90 84 90 112L122 112Q122 84 108 72Q122 60 122 35Z" fill="${LIT}"/>
      <path d="M96 50L116 50Q114 62 106 70Q98 62 96 50Z" fill="${tint(hue, 0.4)}"/>
      <path d="M92 112Q96 94 106 90Q116 94 120 112Z" fill="${tint(hue, 0.4)}"/>
      <path d="M106 72L106 92" stroke="${tint(hue, 0.4)}" stroke-width="2"/>
      <path d="M90 35Q90 60 104 72Q90 84 90 112L122 112Q122 84 108 72Q122 60 122 35Z" fill="none" ${S}/>
      <rect x="80" y="35" width="5" height="77" fill="${M}" ${S} stroke-width="2.4"/>
      <rect x="127" y="35" width="5" height="77" fill="${M}" ${S} stroke-width="2.4"/>
      ${pill(52, 124, 60, hue)}
      <rect x="28" y="104" width="50" height="18" rx="3" fill="${LIT}" ${S}/>
      <path d="M36 110L66 110M36 115L58 115" stroke="${M}" stroke-width="2.4" stroke-linecap="round"/>
      <rect x="22" y="100" width="10" height="26" rx="5" fill="${M}" ${S}/>
      <rect x="74" y="100" width="10" height="26" rx="5" fill="${M}" ${S}/>
      ${spark(150, 26)}` };
  },

  // ── THE SIX BRANCHES ──────────────────────────────────────────────────────

  // REFERENCE: a ringed planet — the ring passes BEHIND the sphere above and IN FRONT
  // below, which is what makes it read as a ring — with a small moon. No floor: space.
  metaphysics: (hue) => {
    const M = mid(hue);
    // The ring: an ellipse rx 58 ry 13 about (100, 70), tilted -14°. Its ends are
    // (100 ∓ 56.3, 70 ± 14.0); the front half is the lower arc between them.
    const ringBack = `<ellipse cx="100" cy="70" rx="58" ry="13" transform="rotate(-14 100 70)" fill="none" stroke="${INK}" stroke-width="9"/><ellipse cx="100" cy="70" rx="58" ry="13" transform="rotate(-14 100 70)" fill="none" stroke="${M}" stroke-width="3.4"/>`;
    const front = 'M43.7 84 A58 13 -14 0 0 156.3 56';
    const ringFront = `<path d="${front}" fill="none" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><path d="${front}" fill="none" stroke="${LIT}" stroke-width="3.4" stroke-linecap="round"/>`;
    return { stage: { floor: null, disc: [100, 70, 60] }, body: `
      ${ringBack}
      <circle cx="100" cy="70" r="32" fill="${LIT}"/>
      <path d="M118 44Q136 70 116 98Q134 92 132 70Q132 52 118 44Z" fill="${M}"/>
      <path d="M72 58Q100 52 128 60M70 76Q100 70 130 78" fill="none" stroke="${M}" stroke-width="3" stroke-linecap="round"/>
      <circle cx="100" cy="70" r="32" fill="none" ${S}/>
      ${ringFront}
      <circle cx="44" cy="36" r="9" fill="${LIT}" ${S}/><circle cx="47" cy="34" r="2.5" fill="${M}"/>
      ${spark(160, 112)}` };
  },

  // REFERENCE: a magnifying glass — a thick rimmed lens on an angled handle — held over
  // an open book whose two pages rise from a gutter.
  epistemology: (hue) => {
    const M = mid(hue);
    return { body: `
      ${pill(98, 120, 116, hue)}
      <path d="M40 104L98 98L98 118L40 122Z" fill="${LIT}" ${S}/>
      <path d="M98 98L156 104L156 122L98 118Z" fill="${M}" ${S}/>
      <path d="M48 108L88 104M48 113L80 110M108 104L146 108M108 109L138 112" stroke="${shade(hue, 0.05)}" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
      <path d="M136 74L162 102" stroke="${INK}" stroke-width="13" stroke-linecap="round"/>
      <path d="M136 74L162 102" stroke="${shade(hue, 0.2)}" stroke-width="7" stroke-linecap="round"/>
      <circle cx="116" cy="54" r="30" fill="${tint(hue, 0.5)}" stroke="${INK}" stroke-width="12"/>
      <circle cx="116" cy="54" r="30" fill="none" stroke="${LIT}" stroke-width="5"/>
      <path d="M100 48L130 48M100 56L124 56M100 64L128 64" stroke="${INK}" stroke-width="2.6" stroke-linecap="round" opacity="0.55"/>
      <path d="M100 38Q106 32 114 32" fill="none" stroke="${PAPER_LIT}" stroke-width="3.5" stroke-linecap="round"/>
      ${spark(38, 44)}` };
  },

  // REFERENCE: meshed gears of different sizes, the teeth of one sitting in the gaps of
  // the other.
  logic: (hue) => {
    const M = mid(hue);
    return { body: `
      ${pill(100, 120, 110, hue)}
      ${gear(136, 48, 17, 9, M, hue, 10)}
      ${gear(84, 78, 28, 12, LIT, hue)}
      ${gear(150, 98, 11, 7, LIT, hue, 8)}
      ${spark(40, 34)}` };
  },

  // REFERENCE: a balance — a stepped base, a central post with a finial, a beam, and a
  // pan hung from each end on converging cords. A heart weighed against a coin.
  ethics: (hue) => {
    const M = mid(hue);
    return { body: `
      ${pill(100, 120, 60, hue)}
      <path d="M78 120L84 108L116 108L122 120Z" fill="${M}" ${S}/>
      <rect x="95" y="38" width="10" height="72" fill="${LIT}" ${S}/>
      <circle cx="100" cy="33" r="7" fill="${LIT}" ${S} stroke-width="2.4"/>
      <path d="M52 44L148 44" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
      <path d="M52 44L148 44" stroke="${LIT}" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M52 44L36 84M52 44L68 84M148 44L132 84M148 44L164 84" stroke="${INK}" stroke-width="2" fill="none"/>
      <path d="M42 76Q42 68 50 70Q52 72 52 74Q52 72 54 70Q62 68 62 76Q62 82 52 88Q42 82 42 76Z" fill="${EMBER}" ${S} stroke-width="2.4"/>
      <path d="M30 84L74 84Q72 98 52 98Q32 98 30 84Z" fill="${LIT}" ${S}/>
      ${coin(148, 76, hue, 12)}
      <path d="M126 84L170 84Q168 98 148 98Q128 98 126 84Z" fill="${LIT}" ${S}/>` };
  },

  // REFERENCE: a studio easel — two raked front legs, a back leg, a ledge — holding a
  // canvas with a landscape on it; a kidney-shaped palette with a thumb hole.
  aesthetics: (hue) => {
    const M = mid(hue);
    return { body: `
      ${pill(112, 120, 80, hue)}
      <path d="M112 30L112 118" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>
      <path d="M112 30L112 118" stroke="${M}" stroke-width="2" stroke-linecap="round"/>
      <path d="M104 30L84 120M120 30L140 120" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>
      <path d="M104 30L84 120M120 30L140 120" stroke="${LIT}" stroke-width="2" stroke-linecap="round"/>
      <rect x="78" y="22" width="68" height="54" rx="2" fill="${LIT}" ${S}/>
      <circle cx="126" cy="38" r="7" fill="${EMBER}"/>
      <path d="M81 66Q96 48 110 60Q122 50 143 64L143 73L81 73Z" fill="${M}"/>
      <path d="M81 70Q104 60 143 70L143 73L81 73Z" fill="${tint(hue, 0.3)}"/>
      <rect x="78" y="22" width="68" height="54" rx="2" fill="none" ${S}/>
      <rect x="84" y="76" width="56" height="7" rx="2" fill="${M}" ${S}/>
      ${pill(48, 122, 60, hue)}
      <path d="M22 108Q22 94 44 94Q70 94 72 106Q72 116 58 116Q50 116 48 120Q44 124 34 122Q22 120 22 108Z" fill="${LIT}" ${S}/>
      <circle cx="36" cy="104" r="3.5" fill="${EMBER}" ${S} stroke-width="1.8"/>
      <circle cx="48" cy="100" r="3.5" fill="${tint(hue, 0.3)}" ${S} stroke-width="1.8"/>
      <circle cx="60" cy="104" r="3.5" fill="${shade(hue, 0.25)}" ${S} stroke-width="1.8"/>
      <circle cx="56" cy="110" r="3" fill="${hue}" ${S} stroke-width="1.8"/>` };
  },

  // REFERENCE: a ballot box — a box with a slot in its lid, a card going in — and a
  // flag on a pole beside it.
  'political-philosophy': (hue) => {
    const M = mid(hue);
    return { body: `
      ${pill(100, 120, 90, hue)}
      <path d="M144 118L144 30" stroke="${INK}" stroke-width="3.4" stroke-linecap="round"/>
      <path d="M145 31Q158 26 170 32Q180 38 177 50Q166 44 156 48Q150 50 145 50Z" fill="${EMBER}" ${S} stroke-width="2.4"/>
      <rect x="72" y="40" width="30" height="36" rx="2" fill="${PAPER_LIT}" ${S} transform="rotate(-8 87 58)"/>
      <path d="M79 52L94 50M80 58L92 56" stroke="${M}" stroke-width="2.2" stroke-linecap="round" transform="rotate(-8 87 58)"/>
      <path d="M58 70L78 58L140 58L120 70Z" fill="${M}" ${S}/>
      <rect x="74" y="61.5" width="40" height="4" rx="2" fill="${INK}"/>
      <rect x="58" y="70" width="62" height="48" fill="${LIT}" ${S}/>
      <path d="M120 70L140 58L140 106L120 118Z" fill="${M}" ${S}/>
      <path d="M89 84L92 91L99 91L93 95L96 102L89 98L82 102L85 95L79 91L86 91Z" fill="${hue}" ${S} stroke-width="1.8"/>` };
  },
};

export const POSTER_KEYS = Object.keys(DRAW) as PosterKey[];

/**
 * The viewBox for a box of w×h: the 200×150 frame, grown to the box's aspect —
 * sideways about the centre when the box is wider; when it is taller, the empty sides
 * are trimmed to CORE and then it grows upward from the floor — so no object is cut
 * and nothing is stretched.
 */
export function posterViewBox(w: number, h: number): [number, number, number, number] {
  const aspect = w / h;
  const frame = FRAME.w / FRAME.h;
  if (aspect >= frame) {
    const vw = FRAME.h * aspect;
    return [(FRAME.w - vw) / 2, 0, vw, FRAME.h];
  }
  // Taller than the frame: trim the empty sides down to CORE first, and only then grow
  // upward from the floor.
  const vw = Math.max(CORE.x1 - CORE.x0, Math.min(FRAME.w, FRAME.h * aspect));
  const vh = vw / aspect;
  return [(FRAME.w - vw) / 2, FRAME.h - vh, vw, vh];
}

/** The poster as an SVG document for a box of w×h, in the given hue. */
export function posterXml(key: PosterKey, hue: string, w: number, h: number): string {
  const d = DRAW[key](hue);
  const [x, y, vw, vh] = posterViewBox(w, h);
  const r = (n: number) => Math.round(n * 100) / 100;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${r(x)} ${r(y)} ${r(vw)} ${r(vh)}" width="${w}" height="${h}">${world(hue, d.stage ?? {})}${d.body}</svg>`;
}

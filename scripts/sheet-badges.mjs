// LOOK AT THE WHOLE BADGE CASE, without a phone.
//
//   node scripts/sheet-badges.mjs          six families × five tiers, plus locked,
//                                          then every badge on the roll at grid size
//   PIN=140 node scripts/sheet-badges.mjs  the top half drawn large
//
// WHY THIS EXISTS, and it is the same argument scripts/sheet-ranks.mjs makes.
// scripts/validate-badges.mjs measures the badges — the mark clears the face, no
// two share a glyph, the furniture is outside the medal, the roll has not moved
// — and every one of those numbers can be green while the medals are unreadable
// or identical. It paid for itself on its first run, years of redesigns ago:
// tiers IV and V had no furniture of their own, so thirty-three badges were the
// tier-III object in a different metal, obvious in a grid and invisible in a
// checklist.
//
// It draws through the SAME code the app does (components/shared/insigniaArt.ts)
// with the REAL marks, in headless Chrome — scripts/lib/insigniasheet.mjs.
import os from 'node:os';
import path from 'node:path';
import { Art, Ins, PAGE_CSS, markSvg, nodesSvg, roll, shoot, svg } from './lib/insigniasheet.mjs';

const BOX = Number(process.env.PIN) || 100;
const GRID = 52; // the size the badge case draws them at
const FAMILIES = ['lessons', 'streak', 'thinkers', 'quotes', 'mastery', 'xp'];
const { badges } = roll();

function medal(family, tier, glyph, size, earned = true) {
  const t = earned ? Art.tonesOf(Ins.ORDER[Ins.TIER_ORDER[tier - 1]]) : Art.LOCKED;
  const a = Art.badgeArt(family, tier, t);
  return svg(nodesSvg(a.back) + nodesSvg(a.medal) + nodesSvg(a.front) + markSvg(a.mark, glyph), size);
}

let body = `<div class="h">6 FAMILIES DOWN × 5 TIERS ACROSS (${Ins.TIER_ORDER.join(' · ')}) · LAST COLUMN LOCKED</div>`;
body += `<div class="g" style="grid-template-columns:repeat(6,${BOX + 6}px)">`;
for (const f of FAMILIES) {
  const mine = badges.filter((b) => b.family === f);
  for (let tier = 1; tier <= 5; tier++) {
    const b = mine.find((x) => x.tier === tier) ?? mine[0];
    body += `<div class="c">${medal(f, tier, b.glyph, BOX)}${f.toUpperCase()} ${'I II III IV V'.split(' ')[tier - 1]}</div>`;
  }
  body += `<div class="c">${medal(f, 3, mine[0].glyph, BOX, false)}LOCKED</div>`;
}
body += '</div>';
body += `<div class="h">ALL ${badges.length} ON THE ROLL, AT ${GRID}px</div>`;
body += `<div class="g" style="grid-template-columns:repeat(12,${GRID + 4}px)">`;
for (const b of badges) body += medal(b.family, b.tier, b.glyph, GRID);
body += '</div>';

const dest = path.join(os.tmpdir(), 'badge-sheet.png');
const width = Math.max(28 + 6 * (BOX + 12), 28 + 12 * (GRID + 10));
const height = 70 + FAMILIES.length * (BOX + 20) + Math.ceil(badges.length / 12) * (GRID + 6);
shoot(`<html><head><style>${PAGE_CSS}</style></head><body>${body}</body></html>`, dest, width, height);
console.log(`6 families x 5 tiers + ${badges.length} badges -> ${dest}  (${width}x${height})`);

// LOOK AT ALL FORTY-EIGHT PINS, without a phone.
//
//   node scripts/sheet-ranks.mjs            every order × every degree, plus locked
//   node scripts/sheet-ranks.mjs jade       one order, drawn large
//   PIN=50 node scripts/sheet-ranks.mjs     at the size the ladder draws them
//
// WHY THIS EXISTS. The rank ladder is the one part of this app whose whole job
// is to be looked at. scripts/check-ui.mjs measures the palette and the build —
// contrast, tonal swing, that every rung adds something, that no two pins are
// the same drawing — and every one of those numbers can be green while the pins
// are ugly. Numbers cannot see a shape; this is what does.
//
// It draws through the SAME code the app does (components/shared/insigniaArt.ts)
// with the REAL marks (components/shared/Glyph.tsx), in headless Chrome —
// scripts/lib/insigniasheet.mjs has the plumbing and says why.
//
// HOW TO READ IT. Across is the build (the degree); down is the order, which is
// both the material and the silhouette. The two questions are "is every step
// across visibly more than the last" and "does every order look like itself all
// the way along". The last column is the capstone as a LOCKED pin, which keeps
// its shape and loses its material.
import os from 'node:os';
import path from 'node:path';
import { Art, Ins, PAGE_CSS, markSvg, nodesSvg, roll, shoot, svg } from './lib/insigniasheet.mjs';

const only = process.argv[2]?.toUpperCase() ?? null;
if (only && !Ins.ORDERS.includes(only)) throw new Error(`no order ${only}; one of ${Ins.ORDERS.join(' ')}`);
const orders = only ? [only] : Ins.ORDERS;
const PIN = Number(process.env.PIN) || (only ? 180 : 100);
const { ranks } = roll();

function pin(oi, d, size, locked) {
  const t = locked ? Art.LOCKED : Art.tonesOf(Ins.ORDER[Ins.ORDERS[oi]]);
  const a = Art.rankArt(oi, d, t);
  return svg(nodesSvg(a.nodes) + markSvg(a.mark, ranks[oi * 6 + d] ?? 'candle'), size);
}

let body = `<div class="h">${orders.length} ORDER(S) DOWN × 6 DEGREES ACROSS · LAST COLUMN LOCKED · `
  + `${Art.ORDER_SHAPES.map((s) => s.label).join(' ').toUpperCase()}</div>`;
body += `<div class="g" style="grid-template-columns:repeat(7,${PIN + 6}px)">`;
for (const order of orders) {
  const oi = Ins.ORDERS.indexOf(order);
  for (let d = 0; d < 6; d++) {
    body += `<div class="c">${pin(oi, d, PIN, false)}${oi * 6 + d + 1} ${Ins.ORDER_LABEL[order].toUpperCase()} ${d + 1}</div>`;
  }
  body += `<div class="c">${pin(oi, 5, PIN, true)}LOCKED</div>`;
}
body += '</div>';

const dest = path.join(os.tmpdir(), `rank-sheet${only ? '-' + only.toLowerCase() : ''}.png`);
const width = 28 + 7 * (PIN + 12);
const height = 40 + orders.length * (PIN + 20);
shoot(`<html><head><style>${PAGE_CSS}</style></head><body>${body}</body></html>`, dest, width, height);
console.log(`${orders.length} order(s) x 6 degrees -> ${dest}  (${width}x${height})`);

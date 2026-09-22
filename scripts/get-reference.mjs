// LOOK AT A REAL PICTURE OF THE THING BEFORE DRAWING IT.
//
//   node scripts/get-reference.mjs <slug> "<search>" [count]
//   node scripts/get-reference.mjs ship "sailing boat" 3
//   KIND=filetype:bitmap node scripts/get-reference.mjs oak "oak tree" 2   (photographs)
//
// A reader, on objects drawn from memory: *"I want you to find a way to be able to
// see pictures online so you actually have a reference to follow instead of what is
// created right now."* This is that way. Wikimedia Commons has a search API that
// returns direct thumbnail URLs for freely-licensed files, so a picture can be pulled
// to disk and then actually LOOKED AT rather than described from memory.
//
// ── IT CHANGED THE DRAWINGS, MEASURABLY ─────────────────────────────────────
//
// Every object in objects.ts drawn before this existed had something structurally
// wrong that one glance at a reference settled:
//
//   the tree    five equal lobes read as BROCCOLI. Every reference draws the canopy
//               as ONE mass with a scalloped edge, over a trunk a quarter of the
//               height — not half.
//   the boat    the rig is TALLER THAN THE HULL IS LONG in the plans. Two short
//               triangles on a deep hull is a paper boat.
//   the table   every reference is in THREE-QUARTER view, with four legs. Flat
//               side-on, a table is a trestle.
//   the book    the icon is an OPEN book. Closed and flat-on it is a card.
//   the plinth  a photograph of one LABELS its three parts — base, die, cap. A
//               single box is the die with both mouldings left off.
//
// ── WHAT IT IS AND IS NOT FOR ───────────────────────────────────────────────
//
// Reference only: proportion and construction, which are facts about the world and
// nobody's copyright. Nothing here is traced, embedded or shipped. The files land in
// scratchpad/ref/, which is untracked.
//
// TWO THINGS THE SEARCH GETS WRONG WITHOUT HELP. Commons ranks SCANNED BOOKS highly
// for any text query, so the first run returned .pdf files whose first page was a
// title page — hence the `filetype:drawing` term and the extension penalty. (That
// line itself was eaten once: a backtick inside a shell heredoc closes the string,
// which is the trap CLAUDE.md §21 records. Write this file with an editor.) A bare noun
// pulls diagrams: "plinth" returned a neural-network figure and "column" a bacterial
// flagellum. Search for the OBJECT IN ITS OWN WORLD ("statue pedestal", "doric
// column order") and look at what came back before trusting it.
import fs from 'node:fs';
import path from 'node:path';

const [slug, query, nRaw] = process.argv.slice(2);
if (!slug || !query) {
  console.log('usage: node scripts/get-reference.mjs <slug> "<search>" [count]');
  process.exit(1);
}
const N = Math.min(8, +(nRaw || 4));
const KIND = process.env.KIND || 'filetype:drawing';
const OUT = 'scratchpad/ref';
fs.mkdirSync(OUT, { recursive: true });

const api = 'https://commons.wikimedia.org/w/api.php'
  + '?action=query&format=json&generator=search&gsrnamespace=6'
  // `filetype:drawing` is Commons' own term for a vector or line file. Without it the
  // search returns SCANNED BOOKS — every early result was a .pdf whose first page had
  // nothing to do with the query.
  + `&gsrlimit=${N * 4}&gsrsearch=${encodeURIComponent(`${query} ${KIND}`)}`
  + '&prop=imageinfo&iiprop=url|mime|extmetadata&iiurlwidth=760';

const res = await fetch(api, { headers: { 'User-Agent': 'AshmereRefLookup/1.0 (offline art reference)' } });
if (!res.ok) { console.log(`search failed: HTTP ${res.status}`); process.exit(1); }
const json = await res.json();
const pages = Object.values(json?.query?.pages ?? {});
if (!pages.length) { console.log('no results'); process.exit(1); }

// A drawing is worth more than a photograph here, and an SVG thumbnail is a
// rasterised FLAT illustration — which is the register these lessons are drawn in.
const score = (p) => {
  const t = (p.title || '').toLowerCase();
  let s = 0;
  if (/\.svg$/.test(t)) s += 3;
  if (/silhouette|icon|vector|flat|drawing|diagram|illustration/.test(t)) s += 2;
  if (/logo|map|coat of arms|heraldi|flag of/.test(t)) s -= 4;
  // A scanned book is not a reference for a drawing, and its first page is usually a
  // title page. Commons ranks them highly for any text query.
  if (/\.(pdf|djvu|tif|tiff|webm|ogv)$/.test(t)) s -= 20;
  return s;
};
pages.sort((a, b) => score(b) - score(a) || (a.index ?? 0) - (b.index ?? 0));

let got = 0;
for (const p of pages) {
  if (got >= N) break;
  const info = p.imageinfo?.[0];
  const url = info?.thumburl;
  if (!url) continue;
  if (/\.(pdf|djvu|tif|tiff|webm|ogv)$/i.test(p.title || '')) continue;
  const file = path.join(OUT, `${slug}-${got + 1}.png`);
  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'AshmereRefLookup/1.0 (offline art reference)' } });
    if (!r.ok) continue;
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length < 3000) continue;                       // an error page, not a picture
    fs.writeFileSync(file, buf);
    const lic = info?.extmetadata?.LicenseShortName?.value ?? '?';
    console.log(`${file}   ${(buf.length / 1024).toFixed(0)}KB   ${lic}   ${p.title}`);
    got += 1;
  } catch { /* next */ }
}
if (!got) console.log('nothing downloaded');

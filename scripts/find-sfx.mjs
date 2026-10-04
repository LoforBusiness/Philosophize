// ─────────────────────────────────────────────────────────────────────────────
// FIND A SOUND FOR A LESSON (LESSON_RULES AT9): search Freesound for CC0 recordings
// and pull their previews to look at, with the licence read off each sound's own page.
//
//   npm run find:sfx -- <slot> "<query>" [n=6] [maxSeconds]
//
// Writes scratchpad/sfx/cand/<slot>/<id>.mp3 and scratchpad/sfx/cand/<slot>/meta.json
// (user, title, duration, downloads, preview url, cc0). Nothing here enters the app:
// a chosen sound is copied to assets/sfx/src/<id>.mp3 and given a SOURCES entry in
// scripts/lib/sfxcuts.mjs by hand, and `npm run make:sfx` cuts it.
//
// Two things learned finding the first seventy (2026-10-03):
//   · Freesound throttles: run one search at a time. Five at once came back empty.
//   · A short plain query beats a precise one ("chalk writing", not "chalk writing
//     blackboard"), and the most-downloaded results are listed first.
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import path from 'node:path';

const [slot, q, nArg, maxArg] = process.argv.slice(2);
if (!slot || !q) { console.error('npm run find:sfx -- <slot> "<query>" [n] [maxSeconds]'); process.exit(2); }
const N = Number(nArg || 6);
const MAXD = Number(maxArg || 999);
const UA = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 Chrome/120 Safari/537.36' };
const url = `https://freesound.org/search/?q=${encodeURIComponent(q)}&f=license%3A%22Creative+Commons+0%22&s=Downloads+%28most+first%29`;
const html = await (await fetch(url, { headers: UA })).text();
const attr = (blk, k) => (blk.match(new RegExp(`data-${k}="([^"]*)"`)) || [])[1];
const blocks = html.split('class="bw-player"').slice(1);
if (!blocks.length) console.log('  no results (or Freesound is throttling: wait a minute and run it alone)');
const found = [];
for (const b of blocks) {
  const id = attr(b, 'sound-id');
  if (!id || found.some((f) => f.id === id)) continue;
  const d = Number(attr(b, 'duration'));
  if (d > MAXD) continue;
  found.push({ id, user: attr(b, 'username'), title: attr(b, 'title'), dur: d, dl: Number(attr(b, 'num-downloads')), mp3: attr(b, 'mp3').replace('-lq.mp3', '-hq.mp3') });
  if (found.length >= N) break;
}
const dir = path.join('scratchpad/sfx/cand', slot);
fs.mkdirSync(dir, { recursive: true });
const dbFile = path.join(dir, 'meta.json');
const db = fs.existsSync(dbFile) ? JSON.parse(fs.readFileSync(dbFile, 'utf8')) : {};
for (const f of found) {
  // the licence, read off the sound's own page rather than trusted from the filter
  const page = await (await fetch(`https://freesound.org/people/${f.user}/sounds/${f.id}/`, { headers: UA })).text();
  f.cc0 = /publicdomain\/zero\/1\.0/.test(page);
  if (!f.cc0) { console.log('  not CC0, skipped', f.id, f.title); continue; }
  const r = await fetch(f.mp3, { headers: UA });
  fs.writeFileSync(path.join(dir, `${f.id}.mp3`), Buffer.from(await r.arrayBuffer()));
  db[`${slot}/${f.id}`] = { slot, q, ...f };
  console.log(`  ${slot} ${f.id}  ${f.dur.toFixed(1)}s  ${f.dl} dl  ${f.title} — ${f.user}  https://freesound.org/people/${f.user}/sounds/${f.id}/`);
}
fs.writeFileSync(dbFile, JSON.stringify(db, null, 1));

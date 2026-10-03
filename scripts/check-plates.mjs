// check:plates — every set plate's PNG was made from the plate as it is now.
//
// A plate (components/lesson/cinematic/plates.ts) is a set's still scenery drawn once
// into a picture by `npm run make:plates`. Edit the set, or the code that draws it,
// and the picture on the stage is no longer the drawing in the source; nothing else
// would notice, because the app draws the picture. This re-derives each stamp and
// fails on a plate that is missing or stale. A plate with no picture falls back to its
// live layers in the app, which is correct but slow, so it is a failure too.
//
//   npm run check:plates
import fs from 'node:fs';
import path from 'node:path';
import { loadPlates, plateStamp } from './lib/platestamp.mjs';

const REPO = process.cwd();
const art = fs.readFileSync(path.join(REPO, 'components/lesson/cinematic/platesArt.ts'), 'utf8');
const PLATES = await loadPlates();
const bad = [];
for (const [id, p] of Object.entries(PLATES)) {
  const want = plateStamp(p);
  const m = art.match(new RegExp(`'${id}': '([0-9a-f]+)'`));
  const file = path.join(REPO, 'assets/images/sets', `${id}.png`);
  if (!m || !fs.existsSync(file)) bad.push(`${id}: never made`);
  else if (m[1] !== want) bad.push(`${id}: stale (made from ${m[1]}, the plate is now ${want})`);
}
// …and the roads' scenery layers (make:road-art): the same promise, for BranchWorld.
const { roadStamp, PLACES } = await import('./make-road-art.mjs');
const roadArt = fs.readFileSync(path.join(REPO, 'components/branch/roadArt.ts'), 'utf8');
for (const place of PLACES) {
  const key = `${place}:0`;
  const m = roadArt.match(new RegExp(`'${key}': '([0-9a-f]+)'`));
  const want = roadStamp(place, 0);
  if (!m) bad.push(`road ${key}: never baked (npm run make:road-art)`);
  else if (m[1] !== want) bad.push(`road ${key}: stale (baked from ${m[1]}, the scenery is now ${want}) — npm run make:road-art`);
}
console.log(`\ncheck:plates — ${Object.keys(PLATES).length} set plate(s), ${PLACES.length} road(s)`);
if (bad.length) {
  for (const b of bad) console.log(`  FAIL  ${b}`);
  console.log('\n  Re-make set plates with Metro running (npm run make:plates); roads in plain Node (npm run make:road-art)\n');
  process.exit(1);
}
console.log('  ok    every plate and every road was baked from the drawing as it is now.\n');

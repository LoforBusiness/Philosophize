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
console.log(`\ncheck:plates — ${Object.keys(PLATES).length} set plate(s)`);
if (bad.length) {
  for (const b of bad) console.log(`  FAIL  ${b}`);
  console.log('\n  Re-make them with Metro running: npm run make:plates\n');
  process.exit(1);
}
console.log('  ok    every plate was baked from the set as it is now.\n');

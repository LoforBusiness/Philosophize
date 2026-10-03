// The stamp of a set plate (components/lesson/cinematic/plates.ts): what its PNG was
// made from. It hashes the plate's data (box, scale, tone, every part of every layer)
// and the source of the components that draw it, so editing the set or the drawing
// code makes the picture stale and `check:plates` says so.
//
// Load with the TS loader: node --import ./scripts/lib/register.mjs …
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const REPO = process.cwd();
const DIR = path.join(REPO, 'components/lesson/cinematic');
/** The code a plate is drawn through. */
export const DRAWN_BY = ['SetArt.tsx', 'ObjectArt.tsx', 'Silhouette.tsx', 'setShapes.ts', 'PlateArt.tsx'];

export async function loadPlates() {
  const m = await import(pathToFileURL(path.join(DIR, 'plates.ts')).href);
  return m.PLATES;
}

export function plateStamp(plate) {
  const h = crypto.createHash('sha1');
  h.update(JSON.stringify(plate));
  for (const f of DRAWN_BY) h.update(fs.readFileSync(path.join(DIR, f), 'utf8').replace(/\r\n/g, '\n'));
  return h.digest('hex').slice(0, 16);
}

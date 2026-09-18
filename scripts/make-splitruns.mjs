// WHICH BEATS ARE PIECES OF ONE SENTENCE — frozen, because it can no longer be read
// off the scripts.
//
// J12 (`split-beats.mjs`) cut over-long beats into pieces and copied every channel
// value to each piece verbatim, so that the picture held still and only the words
// advanced. For as long as that was true, a RUN was recognisable in the source: a
// beat that declared exactly the channels, to the same values, as the beat before
// it was a continuation. `check-life` (N6, N7) and the liven codemods all read runs
// that way.
//
// Group AH then gave every piece its OWN scene event, which is exactly what the
// pieces of a split sentence now differ by — and an event that arrives on the
// second piece and stays is indistinguishable, by any count of channels, from a
// genuinely new beat. The run structure itself did not change: AH added no beat
// and split nothing. So it is read ONCE from a revision before AH and kept here.
//
// A lesson whose beat count no longer matches its entry has been re-cut since, and
// the checker falls back to reading its runs from the source.
//
//   node scripts/make-splitruns.mjs            # writes scripts/lib/splitruns.json
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { corpus } from './lib/gestures.mjs';
import { channels } from './lib/liveliness.mjs';
import { decomment } from './lib/gestures.mjs';

/** The last commit before group AH — its scripts still carry J12's verbatim copies. */
const REV = 'a68624b5';

const out = {};
let lessons = 0, runs = 0;
for (const l of corpus()) {
  const rel = l.file.replace(/\\/g, '/');
  let raw;
  try {
    raw = execFileSync('git', ['show', `${REV}:${rel}`], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch { continue; }
  const m = raw.match(/BEATS[^=]*=\s*\[([\s\S]*)\n\];/);
  if (!m) continue;
  const parts = m[1].split(/(\n\s{2}\},?\s*\n?)/);
  const chunks = [];
  for (let i = 0; i < parts.length; i += 2) if (/\S/.test(parts[i])) chunks.push(parts[i]);
  const cont = [];
  for (let i = 1; i < chunks.length; i++) {
    const a = channels(decomment(chunks[i - 1]));
    const b = channels(decomment(chunks[i]));
    if (a && a === b) cont.push(i);
  }
  out[rel.split('/').pop()] = { beats: chunks.length, cont };
  lessons += 1; runs += cont.length;
}
fs.writeFileSync('scripts/lib/splitruns.json', JSON.stringify(out, null, 1) + '\n');
console.log(`${lessons} lessons, ${runs} continuation beats, read at ${REV}`);

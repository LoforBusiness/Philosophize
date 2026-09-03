// Print every gag the corpus now carries, with the sentence it lands on, so a
// person can read them. `check-life` can tell you a cue matched; only reading the
// pair tells you the joke is about the thing the cue thought it was.
import { corpus } from './lib/gestures.mjs';
import { COMIC_CODES, comicName, reachesCatalogue, branchOf } from './lib/liveliness.mjs';

const lessons = corpus().filter((l) => l.key && reachesCatalogue(l.comp));
const want = process.argv[2];
let n = 0;
for (const l of lessons) {
  if (want && branchOf(l.id) !== want) continue;
  for (const b of l.beats) {
    if (b.declared === null || !COMIC_CODES.has(b.declared)) continue;
    n++;
    console.log(`${String(n).padStart(3)}  ${l.id} b${b.i}  ${comicName(b.declared)}`);
    console.log(`     "${b.text}"`);
  }
}
console.log(`\n${n} gags\n`);

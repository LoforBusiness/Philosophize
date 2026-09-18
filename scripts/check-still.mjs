// EVERY TAP CHANGES THE PICTURE (group AH).
//
// A reader asked for *"a different animation for every time the user taps the
// screen in every lesson"*. Counted before the pass, 607 taps across 212 lessons
// changed nothing in the scene's own art — the figure moved, a pen mark or a
// thought could appear, and the drawing held. Group AH gave every one of them an
// event written from its own sentence, and this is what keeps it that way: a
// lesson that adds a beat whose channels are all the same as the beat before it
// fails here, rather than shipping a tap that only advances the words.
//
// A tap is STILL when no channel the script declares changes between the beat and
// the one before it — prose, the figure's own pose track, and the beats that carry
// their own event (a question, a quote, the summary) are set aside, exactly as
// `still-worklist.mjs` sets them aside. That script is where to look when this
// fails: it prints, per still beat, the sentence and what the stage draws.
//
// Offline and fast: it reads the scripts, never the stored must-boxes.
import fs from 'node:fs';
import { LESSONS, beatsOf } from './lib/narration.mjs';
import { poseTrack, poseTracks } from './lib/posetrack.mjs';
import { PROSE } from './lib/marks.mjs';

const DIR = 'components/lesson/cinematic';

/** High-water mark. It may only go down, and it is at the floor. */
const STILL_BUDGET = 0;

const found = [];
for (const [id, file] of Object.entries(LESSONS)) {
  const stem = file.replace(/Script\.ts$/, '');
  if (!fs.existsSync(`${DIR}/${stem}Scene.tsx`)) continue;
  const one = poseTrack(DIR, stem);
  const pose = new Set((one ? [one] : poseTracks(DIR, stem)).map((t) => t.field));
  const beats = beatsOf(file);
  for (let i = 1; i < beats.length; i += 1) {
    const a = beats[i - 1];
    const b = beats[i];
    if (b.interact || b.mc || b.tap || b.quote || b.summary) continue;
    const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])]
      .filter((k) => !PROSE.has(k) && !pose.has(k));
    if (!keys.some((k) => JSON.stringify(a[k] ?? null) !== JSON.stringify(b[k] ?? null))) {
      found.push(`${id} beat ${i}`);
    }
  }
}

console.log('\nEVERY TAP CHANGES THE PICTURE (group AH)\n');
if (found.length <= STILL_BUDGET) {
  console.log(`  ok    no tap leaves the scene's own art as it was  ${found.length}, budget ${STILL_BUDGET}`);
  console.log('\nevery tap in every lesson has its own event.\n');
  process.exit(0);
}
console.log(`  FAIL  ${found.length} tap(s) leave the scene's own art as it was  budget ${STILL_BUDGET}`);
for (const f of found.slice(0, 12)) console.log(`        ${f}`);
console.log('\n  node scripts/still-worklist.mjs <lesson-id> prints each beat\'s sentence and what the stage');
console.log('  draws; the rules for writing its event are group AH of docs/LESSON_RULES.md.\n');
process.exit(1);

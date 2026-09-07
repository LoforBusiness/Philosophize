// ─────────────────────────────────────────────────────────────────────────────
// TWO LESSONS IN A ROW MUST NOT SAY THE SAME THING WITH THE SAME BODY (N13)
//
//   node scripts/spread-lessons.mjs --dry     report, change nothing
//   node scripts/spread-lessons.mjs           write
//
// `liven-lessons` pass 1 asks whether a LESSON repeats itself, and it has done
// its job: run against the table it was written for it now finds ZERO repeated
// poses left to vary. Nobody was asking whether the CORPUS repeats itself, and
// the corpus is what a reader meets — one lesson, then the next one, then the
// next, thirty-one of them down a branch.
//
// Measured the day this was written:
//
//     1,993 gesture calls · 101 distinct codes
//     169 acts in the catalogue · 52 reached · 117 NEVER REACHED
//     the ten commonest poses: 53% of every gesture call
//
// Every one of the forty-eight actions added to `moves.ts` that week was cold,
// and pass 1 could not warm a single one of them, because pass 1 only fires on a
// pose a lesson strikes TWICE. A shelf nothing takes down is not a library, and
// this is the third time that finding has been written in this repo: group N
// found 96 actions and 21 postures reached by eight codes; group Y found a
// thousand lines of `interact.ts` called three times. A catalogue is not a
// vocabulary until something puts it into the scripts.
//
// ── WHAT IT DOES ────────────────────────────────────────────────────────────
//
// For each beat whose pose has a `VARIANTS` row, the choice is made from
// `[the authored code, ...its variants]` at an index derived from WHERE THE
// LESSON SITS IN ITS BRANCH. So the first lesson's `think` is the chin in hand
// the author wrote, the second's is `thinking it over`, the third's is `weighing
// endlessly`, the fourth's is `pacing on the spot` — and a reader working down a
// branch is never shown the same body for the same meaning twice running.
//
// THE AUTHORED CODE STAYS IN THE ROTATION, at slot 0. That is not timidity: it
// keeps one in every n + 1 of these beats exactly as staged, so whatever reason
// an author had for that pose survives somewhere, and the corpus does not become
// a thing only a codemod has ever chosen.
//
// ── WHY IT IS SAFE TO RUN IN BULK ───────────────────────────────────────────
//
// The same argument `liven-lessons` makes for its passes 1 and 2, and it is the
// only argument that matters here: a `VARIANTS` row is ONE MEANING with several
// bodies for it. `think` is a hand at the chin; `thinking it over` is a hand at
// the chin that shifts its weight. A script that said "he considers" still says
// it, so there is no sentence anywhere in the corpus that a swap can falsify
// (A1). Nothing in this file reads a beat's prose, and nothing in it needs to.
//
// ── AND FOURTEEN OF THE NEW ACTIONS ARE DELIBERATELY NOT REACHED FROM HERE ──
//
// PAT THE POCKETS · LOOK UNDER · FOUND IT · LEAF THROUGH · MARK THE PLACE · TURN
// THE PAGE · CLOSE THE BOOK · SET IT DOWN · TAKE IT UP · READ ALOUD · PUT IT
// ASIDE · THE ASIDE · LOOK CLOSER · READ. Every one of them is ABOUT something —
// a search, a book, a confidence — and a variant table is applied without asking
// what the beat says. Putting `pat the pockets` on a beat about distributive
// justice is N9's exact failure (a gag about nothing) wearing a different hat,
// and N9 cost this repo a pratfall on a sentence about a key at the bottom of a
// cask. Those fourteen are for an AUTHOR to place, which is the whole point of
// having them: the library exists so that a lesson being written can reach for
// the right thing, not so that a codemod can spend all of it.
//
// ── WHAT IT WILL NOT TOUCH ──────────────────────────────────────────────────
//
//   · a beat inside a J12 split run. `liven-lessons` pass 0 owns those, and half
//     a run converted is a figure that changes what it is doing in the middle of
//     one sentence.
//   · a beat carrying a gag. The joke pass checked fit, gravity and rotation to
//     put that there; this pass checks none of them and must not overwrite it.
//   · anything whose current code has no row — which is every played code, every
//     prop code and every hold the table does not name. Rotating a code with no
//     stated alternative would mean inventing one, and an invented alternative is
//     how `VARIANTS` shipped six off-by-one rows the first time it was typed.
//
// ── AND IT COSTS A RE-MEASURE, WHICH IS NOT OPTIONAL ────────────────────────
//
// A must-see box contains the whole man, arms included, and it is measured from
// the render — so a different pose really is a different box, and `muststamp`
// hashes every channel value for exactly that reason. Counter-tested here before
// a line of this was written: changing one `p:` in one script takes
// `check:cinematic` from green to `1 lesson(s) changed since their boxes were
// measured`. So the run order is
//
//     node scripts/spread-lessons.mjs
//     node scripts/measure-must.mjs <the ids this printed> && npm run make:tours
//
// and this script writes that id list out for you.
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import { corpus, decomment, readScript } from './lib/gestures.mjs';
import {
  VARIANTS, RUN_VARIANTS, COMIC_CODES, channels, branchOf, reachesCatalogue, play,
} from './lib/liveliness.mjs';

// ── A MARK IS AN ANSWER, SO IT MAY NOT LAND ON A QUESTION (O, R15) ──────────
//
// CIRCLE IT, CROSS IT OUT and TICK IT are the three actions in the library
// that EVALUATE something rather than point at it, and the first run of this
// put `tick it` on `ethics21`'s graded beat — the figure ticking away while the
// reader is being asked to split the morphine case between two readings. It is
// not a spoiler in group O's sense, because nothing legible is revealed; it is
// worse in one way, because a reader who takes the hint and is wrong has been
// misled by the app rather than by the question.
//
// Everywhere else they are exactly right, which is why they stay in the table:
// a figure who circles the thing he has just named is the whole reason the
// board family was written.
const MARKING = new Set([play(136), play(137), play(138)]);

// ── AND THE PASS HAS TO BE A FIXED POINT, WHICH THE FIRST DRAFT WAS NOT ──────
//
// Five codes in `VARIANTS` are both a KEY and a VALUE — 159, 160, 164, 167 and
// 176 are the living holds that the previous round of `liven-lessons` swapped
// INTO, and they are in the table twice because they then became the corpus's own
// most-repeated poses and needed rows of their own. So the first draft wrote 167
// into a beat, and the next run read 167, found its row, and moved it again: a
// second dry run wanted 73 more lessons and 107 more beats, with nothing having
// changed but the clock.
//
// That matters more here than anywhere else in the repo, because every run of
// this costs a must-box re-measure. A codemod that drifts is a codemod that
// charges an hour of browser time for the privilege of running it twice — and it
// is the identical defect this session had just fixed in `liven-lessons`' joke
// pass, arriving from the other direction: that one could not see what it had
// PLACED, this one could not see what it had WRITTEN.
//
// The cure is to make the pass unable to write anything it would later re-read as
// a starting point. An option that is itself a row key is dropped, so every beat
// either keeps its authored code (slot 0, stable) or moves to a code with no row
// at all (skipped for ever after). Two runs, one result.
const KEYS = new Set(Object.keys(VARIANTS).map(Number));

const DRY = process.argv.includes('--dry');
const IDS_OUT = 'scripts/.spread-ids.json';

// SPREAD_SKIP takes a comma-separated list of script basenames to leave alone —
// the same escape `liven-lessons` carries, for the same reason: two sessions work
// in this tree and a file with somebody else's uncommitted edit in it should not
// also collect a codemod's.
const SKIP = new Set((process.env.SPREAD_SKIP || '').split(',').filter(Boolean));
const lessons = corpus().filter((l) => l.key && reachesCatalogue(l.comp)
  && !SKIP.has(l.file.split(/[\\/]/).pop()));

const byBranch = new Map();
for (const l of lessons) {
  const b = branchOf(l.id);
  if (!byBranch.has(b)) byBranch.set(b, []);
  byBranch.get(b).push(l);
}

let touched = 0; let moves = 0; let runBeats = 0;
const reached = new Set();
const changedIds = [];
const report = [];

for (const [, list] of byBranch) {
  for (const [rank, lesson] of list.entries()) {
    const raw = readScript(lesson.file);
    const bodyMatch = raw.match(/BEATS[^=]*=\s*\[([\s\S]*)\n\];/);
    if (!bodyMatch) continue;
    const body = bodyMatch[1];
    const bodyStart = raw.indexOf(body, raw.indexOf('BEATS'));

    // A CAPTURING SPLIT, so the delimiters come back and the file rejoins byte
    // for byte — `liven-lessons`' own note, and the reason a diff of this run is
    // readable at all.
    const parts = body.split(/(\n\s{2}\},?\s*\n?)/);
    const beatIdx = [];
    let n = 0;
    for (let i = 0; i < parts.length; i += 2) {
      if (/\S/.test(parts[i])) { beatIdx.push([i, n]); n++; }
    }
    if (n !== lesson.beats.length) {
      report.push(`  SKIP ${lesson.id}: ${n} chunks vs ${lesson.beats.length} beats`);
      continue;
    }

    const key = lesson.key;
    const rx = new RegExp(`((?:^|[\\s{,])${key}\\s*:\\s*)(-?\\d+)`);
    const chunkOf = new Map(beatIdx.map(([pi, bn]) => [bn, pi]));
    const chunkText = new Map(beatIdx.map(([pi, bn]) => [bn, parts[pi]]));

    // A beat declaring exactly the channels the beat before it declared is a J12
    // continuation. Pass 0 of `liven-lessons` owns the whole run it belongs to.
    const cont = new Set();
    for (let i = 1; i < n; i++) {
      const a = channels(decomment(chunkText.get(i - 1)));
      const b = channels(decomment(chunkText.get(i)));
      if (a && a === b) cont.add(i);
    }
    const inRun = new Set();
    const runOf = new Map();                   // beat index → the head it belongs to
    for (let i = 0; i < n; i++) {
      if (!cont.has(i)) continue;
      let head = i; while (cont.has(head)) head--;
      inRun.add(i); inRun.add(head);
      runOf.set(i, head); runOf.set(head, head);
    }
    const runs = new Map();                    // head → every member, head first
    for (const [member, head] of runOf) {
      if (!runs.has(head)) runs.set(head, []);
      runs.get(head).push(member);
    }
    for (const members of runs.values()) members.sort((a, b) => a - b);

    const used = new Set(lesson.beats.map((b) => b.declared).filter((c) => c !== null));
    const occ = new Map();
    let changed = false;

    // ── THE RUNS FIRST: 445 BEATS THAT WERE ALL ONE MOVEMENT ────────────────
    //
    // `LIVING_RUN` gives each frozen pose ONE living twin, so every split run in
    // the corpus that began as `think` became `chin in hand`. That is right about
    // the run — N7 says a sentence is one movement — and it left the largest block
    // of repetition in the app: codes 164 and 167 stayed at the top of the table
    // when everything around them came down, because they are where the runs live.
    //
    // A run is rewritten ALL OR NOTHING, head included, and only when every member
    // already carries the same code. Half a run converted is a figure that changes
    // what it is doing in the middle of one sentence, which is worse than the
    // repetition it would be fixing.
    for (const members of runs.values()) {
      const codes = new Set(members.map((m) => lesson.beats[m].declared));
      if (codes.size !== 1) continue;                 // not uniform — leave it alone
      const c = [...codes][0];
      if (c === null || COMIC_CODES.has(c)) continue;
      const opts = RUN_VARIANTS[c];
      if (!opts) continue;
      const wheel = [c, ...opts];
      const to = wheel[(rank + members[0]) % wheel.length];
      if (to === c || used.has(to)) continue;
      const writes = members.map((m) => chunkOf.get(m));
      if (!writes.every((pi) => rx.test(parts[pi]))) continue;
      for (const pi of writes) parts[pi] = parts[pi].replace(rx, `$1${to}`);
      used.add(to);
      changed = true; moves += members.length; runBeats += members.length;
      reached.add(to);
      report.push(`  ${lesson.id} run ${members.join(',')}: ${c} → ${to}`);
    }

    for (const beat of lesson.beats) {
      const c = beat.declared;
      if (c === null) continue;
      const hit = occ.get(c) || 0;
      occ.set(c, hit + 1);
      if (inRun.has(beat.i)) continue;
      if (COMIC_CODES.has(c)) continue;
      const opts = VARIANTS[c];
      if (!opts) continue;

      // The authored pose at slot 0, then its bodies. The lesson's place in its
      // branch turns the wheel; the occurrence index inside the lesson turns it
      // again, so a lesson that says one thing three times still says it three
      // ways — which is what pass 1 was doing and must keep being true (N6).
      const wheel = [c, ...opts];
      const start = (rank + hit) % wheel.length;
      let to = null;
      for (let s = 0; s < wheel.length; s++) {
        const cand = wheel[(start + s) % wheel.length];
        if (cand === c) { to = c; break; }          // the authored slot always wins its turn
        if (KEYS.has(cand)) continue;               // would be re-read on the next run
        if (used.has(cand)) continue;               // never make a NEW repeat (N6)
        if (beat.graded && MARKING.has(cand)) continue;
        to = cand; break;
      }
      if (to === null || to === c) continue;

      const before = parts[chunkOf.get(beat.i)];
      if (!rx.test(before)) continue;
      parts[chunkOf.get(beat.i)] = before.replace(rx, `$1${to}`);
      used.add(to);
      changed = true; moves++;
      reached.add(to);
      report.push(`  ${lesson.id} beat ${beat.i}: ${c} → ${to}`);
    }

    if (!changed) continue;
    touched++; changedIds.push(lesson.id);
    if (!DRY) {
      const next = raw.slice(0, bodyStart) + parts.join('') + raw.slice(bodyStart + body.length);
      // Explicit LF. `git restore` and every Windows helper in this repo will
      // re-materialise CRLF, and `validate-cinematic` splits beats on '\n  {\n' —
      // so a CRLF file reports ZERO beats and every finding inside it vanishes
      // while the suite gets quieter.
      fs.writeFileSync(lesson.file, next.replace(/\r\n/g, '\n'));
    }
  }
}

for (const line of report.slice(0, 60)) console.log(line);
if (report.length > 60) console.log(`  … ${report.length - 60} more`);

console.log(`\n${touched} lesson(s) ${DRY ? 'would change' : 'changed'}`);
console.log(`  ${moves} beat(s) given another body for the same meaning`);
console.log(`  ${runBeats} of them are split-run beats moved as whole sentences`);
console.log(`  ${reached.size} distinct code(s) written: ${[...reached].sort((a, b) => a - b).join(' ')}`);

if (!DRY && changedIds.length) {
  fs.writeFileSync(IDS_OUT, JSON.stringify(changedIds, null, 1));
  console.log(`\nwrote ${IDS_OUT} — the must-see boxes of these lessons are now STALE.`);
  console.log('  node scripts/measure-must.mjs scripts/.spread-ids.json');
  console.log('  npm run make:tours && npm run make:gaze');
}

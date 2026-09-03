// ─────────────────────────────────────────────────────────────────────────────
// MAKE THE FIGURE LOOK ALIVE
//
//   node scripts/liven-lessons.mjs --dry     report, change nothing
//   node scripts/liven-lessons.mjs           write
//
// Three passes, in this order, over every wired lesson whose scene can reach the
// movement catalogue:
//
//   1. NO POSE TWICE (M2). The first time a lesson strikes a pose it keeps the
//      one the author wrote. Every LATER use of that same pose becomes a
//      different body for the same meaning, out of `VARIANTS` — a living hold
//      that loops on `t`, or an action played once as the beat opens. This is
//      the pass that answers the complaint directly: a quarter of all beats were
//      holding the pose the beat before them already held.
//
//   2. ONE THING PERFORMED (M3). A lesson that never leaves the 0–99 band is a
//      lesson of held poses with a small overlay — which is 170 of 174 of them.
//      If pass 1 has not already given the lesson something in the played band,
//      one beat gets one.
//
//   3. ONE JOKE (M4), and never the same joke twice in a branch.
//
// WHAT MAKES THIS SAFE TO RUN IN BULK is that passes 1 and 2 do not change what
// any script CLAIMS — a variant is another body for the same meaning, so there
// is no sentence anywhere that the swap can falsify (A1). Pass 3 can, which is
// why it is the one hedged about with the gravity rule, and why it only ever
// touches a beat that is not graded, not a quote, not the summary, and not a
// continuation of the beat before it.
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import { corpus, decomment, readScript } from './lib/gestures.mjs';
import {
  VARIANTS, LIVING_RUN, COMIC, play, grave, channels, reachesCatalogue, branchOf, cueHits,
} from './lib/liveliness.mjs';

const DRY = process.argv.includes('--dry');

/**
 * A deterministic 0..1 from a string. Murmur's finaliser on the tail, for the
 * reason `check-answers` records: a bare `h * 31 + c` leaves the low bits
 * dominated by the characters every seed shares, and every seed here shares its
 * branch name.
 */
function hash01(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) >>> 0;
  h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b) >>> 0;
  h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35) >>> 0;
  h ^= h >>> 16;
  return h / 4294967296;
}

/** A branch's own order for the comic shelf: every branch meets them differently. */
function shelfFor(branch) {
  const deck = COMIC.map((c, i) => ({ c, k: hash01(`${branch}#${c.act}#${i}`) }));
  deck.sort((a, b) => a.k - b.k);
  return deck.map((d) => d.c);
}

// LIVEN_SKIP takes a comma-separated list of script basenames to leave alone.
// Two sessions work in this tree, and a file with somebody else's uncommitted
// edit in it should not also collect a codemod's — §18 records what happens when
// a publish bundles work that was only ever half-finished.
const SKIP = new Set((process.env.LIVEN_SKIP || '').split(',').filter(Boolean));
const lessons = corpus().filter((l) => l.key && reachesCatalogue(l.comp)
  // BOTH SEPARATORS. `path.join` gives backslashes on Windows, so a class of
  // `[\/]` alone never splits and the skip list silently does nothing — which is
  // exactly the failure it exists to prevent.
  && !SKIP.has(l.file.split(/[\\/]/).pop()));

// Reading order per branch, so "the next lesson in this branch" means what a
// reader means by it. The route declares lessons in reading order already.
const byBranch = new Map();
for (const l of lessons) {
  const b = branchOf(l.id);
  if (!byBranch.has(b)) byBranch.set(b, []);
  byBranch.get(b).push(l);
}

let touched = 0, runs = 0, swaps = 0, performed = 0, jokes = 0;
const report = [];
const unfitted = [];

for (const [branch, list] of byBranch) {
  const shelf = shelfFor(branch);
  // NO BRANCH TELLS THE SAME JOKE TWICE. A reader works through one branch at a
  // time, so this is the scope that is actually felt — and the shelf holds 32
  // against a busiest branch of 30, so it is always satisfiable.
  const used = new Set();
  const pending = [];

  for (const lesson of list) {
    const raw = readScript(lesson.file);
    const bodyMatch = raw.match(/BEATS[^=]*=\s*\[([\s\S]*)\n\];/);
    if (!bodyMatch) continue;
    const body = bodyMatch[1];
    const bodyStart = raw.indexOf(body, raw.indexOf('BEATS'));

    // A CAPTURING SPLIT, so the delimiters come back and the file rejoins byte
    // for byte. Splitting without capture and rejoining with a guessed separator
    // reformats 174 files and buries the real change in the diff.
    const parts = body.split(/(\n\s{2}\},?\s*\n?)/);
    const beatIdx = [];                       // parts index → beat number
    let n = 0;
    for (let i = 0; i < parts.length; i += 2) {
      if (/\S/.test(parts[i])) { beatIdx.push([i, n]); n++; }
    }
    // The chunker and the corpus reader must agree about how many beats there
    // are, or every index below is off and the swaps land on the wrong lines.
    if (n !== lesson.beats.length) {
      report.push(`  SKIP ${lesson.id}: ${n} chunks vs ${lesson.beats.length} beats`);
      continue;
    }

    const key = lesson.key;
    const rx = new RegExp(`((?:^|[\\s{,])${key}\\s*:\\s*)(-?\\d+)`);
    const setCode = (pi, code) => {
      const before = parts[pi];
      if (!rx.test(before)) return false;
      parts[pi] = before.replace(rx, `$1${code}`);
      return parts[pi] !== before;
    };

    const isGrave = grave(lesson.beats.map((b) => b.text).join(' '));
    const chunkOf = new Map(beatIdx.map(([pi, bn]) => [bn, pi]));
    const chunkText = new Map(beatIdx.map(([pi, bn]) => [bn, parts[pi]]));

    // A beat that declares exactly the channels the beat before it declared is a
    // J12 continuation: the picture is meant to hold still while the words
    // advance. Nothing below may move the figure on one of those.
    const cont = new Set();
    for (let i = 1; i < n; i++) {
      const a = channels(decomment(chunkText.get(i - 1)));
      const b = channels(decomment(chunkText.get(i)));
      if (a && a === b) cont.add(i);
    }

    let changed = false;
    let hasPlayed = lesson.beats.some((b) => b.declared !== null && b.declared >= 300);
    const effective = lesson.beats.map((b) => b.declared);

    // ── pass 0 · a run of pieces is one sentence, so make it one movement ────
    // Runs are found from their HEAD: beat i is a head when i+1 continues it. The
    // whole run — head included — goes to the living twin, because a run's first
    // piece is exactly as frozen as the rest of it.
    const runOf = new Map();                   // beat index → the head it belongs to
    for (let i = 0; i < n; i++) {
      if (!cont.has(i)) continue;
      let head = i; while (cont.has(head)) head--;
      runOf.set(i, head);
      runOf.set(head, head);
    }
    const heads = [...new Set(runOf.values())];
    for (const head of heads) {
      const to = LIVING_RUN[lesson.beats[head].declared ?? 0];
      if (to === undefined) continue;
      const members = [head, ...[...runOf.keys()].filter((k) => runOf.get(k) === head && k !== head)];
      // A run is rewritten ALL OR NOTHING. Half a run converted is a figure that
      // changes what it is doing in the middle of one sentence, which is worse
      // than the frozen pose this is replacing.
      const writable = members.filter((m) => lesson.beats[m].declared !== null);
      if (writable.length !== members.length) continue;
      let all = true;
      for (const m of members) if (!setCode(chunkOf.get(m), to)) all = false;
      if (all) { changed = true; runs += members.length; for (const m of members) effective[m] = to; }
    }

    // ── pass 1 · no pose struck twice ────────────────────────────────────────
    const seen = new Map();
    for (const beat of lesson.beats) {
      const c = effective[beat.i];
      if (c === null) continue;
      const hit = (seen.get(c) || 0);
      seen.set(c, hit + 1);
      if (hit === 0) continue;                 // the first strike keeps the author's pose
      if (runOf.has(beat.i)) continue;         // pass 0 owns these
      const opts = VARIANTS[c];
      if (!opts) continue;
      const to = opts[(hit - 1) % opts.length];
      if (setCode(chunkOf.get(beat.i), to)) {
        changed = true; swaps++; effective[beat.i] = to;
        if (to >= 300) hasPlayed = true;
      }
    }

    // ── pass 2 · one thing actually performed ────────────────────────────────
    if (!hasPlayed) {
      // The last beat that is safe to move: late enough to be a payoff, never
      // the summary, never a question, never a continuation.
      // NEVER INSIDE A RUN, head included. A played action restarts on `bt`, so
      // on a run it replays once per piece; and changing only the head leaves the
      // rest of the sentence showing the pose the head no longer holds.
      const cand = lesson.beats.filter((b) => b.declared !== null
        && b.i > 0 && b.i < n - 1 && !b.graded && !b.quote && !runOf.has(b.i));
      // SEARCH EVERY CANDIDATE, NOT JUST ONE. Taking the beat at 60% through and
      // giving up if its pose had no played variant left 39 lessons holding
      // photographs for a reason that was about which beat got picked rather than
      // about the lesson. Preference is still for the later half — an action is a
      // payoff — so the search starts there and wraps.
      const start = Math.floor(cand.length * 0.6);
      const order = [...cand.slice(start), ...cand.slice(0, start).reverse()];
      for (const pick of order) {
        const opts = VARIANTS[effective[pick.i]] || VARIANTS[pick.declared];
        const played = (opts || []).filter((o) => o >= 300);
        if (!played.length) continue;
        if (setCode(chunkOf.get(pick.i), played[0])) {
          changed = true; performed++; hasPlayed = true; effective[pick.i] = played[0];
          break;
        }
      }
    }

    // ── pass 3 · collect the joke candidates; the branch settles them ───────
    const cands = [];
    if (!isGrave) {
      const free = (b) => b.declared !== null
        && b.i > 0 && b.i < n - 1 && !b.graded && !b.quote && !grave(b.text);
      // Outside a run first; the LAST PIECE of a run as a fallback. Some lessons
      // have no beat at all outside a split run, and pass 0 has already made the
      // whole run one continuous living movement — so a reaction on its final
      // piece reads as hold, hold, hold, REACT, which is better comedy than the
      // slot it stands in for. What it must never be is a run's MIDDLE: a played
      // action restarts on `bt`, so there it would replay once per piece.
      const loose = lesson.beats.filter((b) => free(b) && !runOf.has(b.i));
      const tails = lesson.beats.filter((b) => free(b) && runOf.has(b.i) && !runOf.has(b.i + 1));
      for (const b of [...loose, ...tails]) {
        for (const gag of shelf) {
          // `cueHits`, not a bare match: a cue sitting inside a negation means the
          // opposite of what it selects for, and putting a smug shoulder-brush on
          // "None of that makes forgiveness easy" is A1 broken by a regex.
          const vocab = cueHits(gag, b.text);
          // A STRUCTURAL CUE IS WORTH HALF A WORD. Six of the gags are about the
          // SHAPE of a sentence rather than its vocabulary — a double take on a
          // beat that opens "But", a shrug on one that ends in a question mark, a
          // thumb jerked over the shoulder at "Hume said". Those are reliable and
          // they reach beats no word list would; they score below any real
          // vocabulary hit so they are only ever the fallback.
          const turn = gag.turn && gag.turn.test(b.text.trim()) ? 1 : 0;
          if (!vocab && !turn) continue;
          const score = (vocab || 0.5) * 100
            + (runOf.has(b.i) ? 0 : 40)
            + Math.min(b.text.split(/\s+/).length, 20)
            + hash01(`${lesson.id}#${b.i}#${gag.act}`);
          cands.push({ beat: b, gag, score });
        }
      }
    }

    pending.push({ lesson, raw, body, bodyStart, parts, setCode, chunkOf, changed, cands, isGrave });
  }

  // ── settle the branch's jokes: best fit first, one gag each, one per lesson ─
  // A greedy pass down the scores. Deciding lesson by lesson meant the FIRST
  // lesson in the branch that fitted a gag took it, and a later lesson the gag
  // was plainly more about could then never have it — a first-come shelf rather
  // than a best-fit one.
  // MOST CONSTRAINED FIRST, then best fit. Straight greedy-by-score actually
  // LOWERS coverage: a high-scoring pair can consume the one gag that was the
  // only thing fitting some other lesson, and that lesson then gets nothing.
  // Taking the lessons with the fewest options first is the standard escape, and
  // it moved this from 69 lessons to a number the shelf can actually support.
  const done = new Set();
  const at = new Map();          // gag act → the reading positions it has been told at
  const order = new Map(list.map((l, i) => [l.id, i]));

  // A GAG MAY COME BACK ONCE, AND ONLY FAR AWAY. "Do not keep reusing the exact
  // same funny things because then it will no longer be funny" is the rule, and
  // the honest reading of it is about what a READER meets, not about a global
  // tally: twice in thirty-seven lessons, never inside eight of each other, is
  // not a running gag — it is a thing they will have forgotten. Round one gives
  // every gag out once so the variety is spent before anything repeats.
  const REPEATS = 2, APART = 8;
  const canUse = (act, pos, cap) => {
    const seen = at.get(act) || [];
    if (seen.length >= cap) return false;
    return seen.every((q) => Math.abs(q - pos) >= APART);
  };
  const assign = (cap) => {
    const queue = pending.filter((p) => p.cands.length && !done.has(p.lesson.id))
      .map((p) => ({ p, opts: new Set(p.cands.map((c) => c.gag.act)).size }))
      .sort((a, b) => a.opts - b.opts);
    for (const { p } of queue) {
      const pos = order.get(p.lesson.id);
      const best = p.cands
        .filter((c) => canUse(c.gag.act, pos, cap))
        .sort((a, b) => b.score - a.score)[0];
      if (!best) continue;
      if (!p.setCode(p.chunkOf.get(best.beat.i), play(best.gag.act))) continue;
      at.set(best.gag.act, [...(at.get(best.gag.act) || []), pos]);
      done.add(p.lesson.id); p.changed = true; jokes++;
      report.push(`  ${p.lesson.id} beat ${best.beat.i}: ${best.gag.name}\n      "${best.beat.text}"`);
    }
  };
  assign(1);
  assign(REPEATS);

  for (const p of pending) {
    if (!p.isGrave && !done.has(p.lesson.id)) unfitted.push(p.lesson.id);
    if (!p.changed) continue;
    touched++;
    const next = p.raw.slice(0, p.bodyStart) + p.parts.join('') + p.raw.slice(p.bodyStart + p.body.length);
    // LF explicitly. `validate-cinematic` splits beats on a literal '\n  {\n',
    // so a file that picks up CRLF reports ZERO beats and every finding inside
    // it vanishes while the suite gets quieter (§21).
    if (!DRY) fs.writeFileSync(p.lesson.file, next.replace(/\r\n/g, '\n'), 'utf8');
  }
  pending.length = 0;
}

console.log(report.join('\n'));
console.log(`\n${touched} lesson(s) ${DRY ? 'would change' : 'changed'}`);
console.log(`  ${runs} beats in split runs made one continuous living movement`);
console.log(`  ${swaps} repeated poses given another body`);
console.log(`  ${performed} lessons gained something PERFORMED`);
console.log(`  ${jokes} jokes placed`);
console.log(`  ${unfitted.length} eligible lesson(s) got none — nothing in them a gag was about`);
if (process.env.LIVEN_UNFITTED) console.log('   ', unfitted.join(' '));
console.log('');

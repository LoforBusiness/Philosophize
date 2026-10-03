// ─────────────────────────────────────────────────────────────────────────────
// check:sfx — A LESSON'S SOUND EFFECTS (LESSON_RULES AT6).
//
//   node --import ./scripts/lib/register.mjs scripts/check-sfx.mjs
//
// The owner's two conditions for sound in a lesson, in their order (2026-10-03): it is
// completely free to use, and it is never heard over a voice. Quality came third, and
// that is what a listening pass is for; the first two can be counted, so they are:
//
//   1. FREE. Every clip comes from a source in scripts/lib/sfxcuts.mjs whose licence is
//      CC0 1.0, read off the sound's own Freesound page, and the source file and the
//      cut are both in the repo. lib/sfx/clips.ts lists exactly the cuts, and nothing
//      else.
//   2. NEVER OVER A VOICE. A `lead` cue on a voiced beat has gone quiet (its `audible`
//      length, measured by make-sfx) before the line comes in at `voiceAfter`; a cue at
//      a number of seconds lands wholly before the line or after it; a `tail` is after
//      it by construction. The bed is never a cue and a cue is never the bed. A
//      `voiceAfter` with no sound starting inside the wait is a silence with nothing in it.
//
// What it cannot see — a reader tapping on while the crowd is still laughing — the
// player handles: every effect is hushed when a beat changes (lib/sfx `hush`).
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { SOURCES, CUTS } from './lib/sfxcuts.mjs';

const ROOT = process.cwd();
const errs = [];
const fail = (s) => errs.push(s);

// ── 1. free, and all there ──────────────────────────────────────────────────
for (const [key, s] of Object.entries(SOURCES)) {
  if (s.licence !== 'CC0 1.0') fail(`source ${key} (Freesound ${s.id}) is licensed "${s.licence}", not CC0 1.0`);
  if (!/^https:\/\/freesound\.org\//.test(s.url ?? '')) fail(`source ${key} has no Freesound page to show its licence`);
  if (!fs.existsSync(path.join(ROOT, 'assets', 'sfx', 'src', `${s.id}.mp3`))) fail(`source ${key}: assets/sfx/src/${s.id}.mp3 is missing`);
}
const clipsSrc = fs.readFileSync(path.join(ROOT, 'lib', 'sfx', 'clips.ts'), 'utf8');
const table = new Map([...clipsSrc.matchAll(/^\s{2}(\w+): \{ clip: require\('\.\.\/\.\.\/assets\/sfx\/(\w+)\.mp3'\), bed: (true|false), audible: ([\d.]+) \},$/gm)]
  .map((m) => [m[1], { file: m[2], bed: m[3] === 'true', audible: Number(m[4]) }]));
for (const c of CUTS) {
  if (!SOURCES[c.src]) fail(`cut ${c.id} is cut from "${c.src}", which is not in SOURCES`);
  if (!fs.existsSync(path.join(ROOT, 'assets', 'sfx', `${c.id}.mp3`))) fail(`cut ${c.id}: assets/sfx/${c.id}.mp3 is missing — run make-sfx`);
  const t = table.get(c.id);
  if (!t) fail(`cut ${c.id} is not in lib/sfx/clips.ts — run make-sfx`);
  else if (t.bed !== !!c.bed) fail(`lib/sfx/clips.ts says ${c.id} is${t.bed ? '' : ' not'} a bed, and sfxcuts says otherwise — run make-sfx`);
}
for (const id of table.keys()) if (!CUTS.some((c) => c.id === id)) fail(`lib/sfx/clips.ts lists ${id}, which no cut makes`);
for (const f of fs.readdirSync(path.join(ROOT, 'assets', 'sfx')).filter((n) => n.endsWith('.mp3'))) {
  if (!table.has(f.replace('.mp3', ''))) fail(`assets/sfx/${f} is shipped and nothing plays it`);
}

// ── 2. never over a voice ───────────────────────────────────────────────────
const manifest = fs.readFileSync(path.join(ROOT, 'lib', 'narration', 'manifest.ts'), 'utf8');
const durOf = (id, i) => {
  const at = manifest.indexOf(`"${id}": {`);
  if (at < 0) return 0;
  const block = manifest.slice(at, manifest.indexOf('\n  },', at));
  const m = block.match(new RegExp(`\\n {4}${i}: \\{[\\s\\S]*?dur: ([\\d.]+),`));
  return m ? Number(m[1]) : 0;
};
const DIR = path.join(ROOT, 'components', 'lesson', 'cinematic');
const LESSONS = (await import('./lib/narration.mjs')).LESSONS;
let cues = 0;
let lessons = 0;
for (const [id, file] of Object.entries(LESSONS)) {
  const src = fs.readFileSync(path.join(DIR, file), 'utf8');
  if (!/\bsfx:|\bbed:/.test(src)) continue;
  lessons += 1;
  const { BEATS } = await import(pathToFileURL(path.join(DIR, file)).href);
  BEATS.forEach((b, i) => {
    const said = b.text && b.speaker ? durOf(id, i) : 0;
    const wait = b.voiceAfter ?? 0;
    if (b.bed !== undefined && b.bed !== null) {
      if (!table.has(b.bed)) fail(`${id} beat ${i}: bed "${b.bed}" is not a clip`);
      else if (!table.get(b.bed).bed) fail(`${id} beat ${i}: "${b.bed}" is an effect, not a loop, and cannot be a bed`);
    }
    // a wait is filled by a sound that starts inside it: a `lead` cue, or one at a
    // number of seconds (a scene can spend the start of a beat on action, as getting
    // out of bed does, and its sound comes when the walk does)
    if (wait > 0 && !(b.sfx ?? []).some((c) => c.at === 'lead' || (typeof c.at === 'number' && c.at < wait))) fail(`${id} beat ${i}: the line waits ${wait}s for a sound that is not there (voiceAfter with no cue inside the wait)`);
    for (const c of b.sfx ?? []) {
      cues += 1;
      const t = table.get(c.id);
      if (!t) { fail(`${id} beat ${i}: cue "${c.id}" is not a clip`); continue; }
      if (t.bed) { fail(`${id} beat ${i}: "${c.id}" is a loop; a loop is a bed, never a cue`); continue; }
      if (!said) continue;
      if (c.at === 'lead' && t.audible > wait) fail(`${id} beat ${i}: "${c.id}" is heard for ${t.audible}s and the line comes in at ${wait}s — raise voiceAfter`);
      if (typeof c.at === 'number' && c.at < wait + said && c.at + t.audible > wait) {
        fail(`${id} beat ${i}: "${c.id}" at ${c.at}s is heard over the line (${wait}–${(wait + said).toFixed(2)}s)`);
      }
      if (c.gain !== undefined && !(c.gain > 0 && c.gain <= 1)) fail(`${id} beat ${i}: "${c.id}" has gain ${c.gain}; a gain is 0–1`);
    }
  });
}

if (errs.length) {
  console.log('\ncheck:sfx — FAIL\n');
  for (const e of errs) console.log('  ' + e);
  process.exit(1);
}
console.log(`check:sfx — ${CUTS.length} clips from ${Object.keys(SOURCES).length} CC0 sources; ${cues} cues in ${lessons} lesson(s), none over a voice`);

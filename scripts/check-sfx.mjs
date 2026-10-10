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
/** Foley (a cut marked `foley`) may sound under a line: this quiet, this short, this soft. */
const FOLEY_LOUD = -27;
const FOLEY_MAX_S = 3.5;
const FOLEY_GAIN = 0.85;
/** How far into a foley clip its hit may come (a pour or an engine builds a little). */
const FOLEY_MAX_HIT = 0.15;
const errs = [];
const fail = (s) => errs.push(s);

// ── 1. free, and all there ──────────────────────────────────────────────────
for (const [key, s] of Object.entries(SOURCES)) {
  // MUSIC (AT10) may also be a public-domain recording, and comes from Wikimedia Commons,
  // where each file's page states its licence; every other sound is CC0 from Freesound
  if (s.music) {
    if (s.licence !== 'CC0 1.0' && s.licence !== 'Public domain') fail(`music source ${key} is licensed "${s.licence}", not public domain or CC0 1.0`);
    if (!/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/.test(s.url ?? '')) fail(`music source ${key} has no Commons page to show its licence`);
  } else {
    if (s.licence !== 'CC0 1.0') fail(`source ${key} (Freesound ${s.id}) is licensed "${s.licence}", not CC0 1.0`);
    if (!/^https:\/\/freesound\.org\//.test(s.url ?? '')) fail(`source ${key} has no Freesound page to show its licence`);
  }
  if (!fs.existsSync(path.join(ROOT, 'assets', 'sfx', 'src', `${s.id}.mp3`))) fail(`source ${key}: assets/sfx/src/${s.id}.mp3 is missing`);
}
const clipsSrc = fs.readFileSync(path.join(ROOT, 'lib', 'sfx', 'clips.ts'), 'utf8');
const table = new Map([...clipsSrc.matchAll(/^\s{2}(\w+): \{ clip: require\('\.\.\/\.\.\/assets\/sfx\/(\w+)\.mp3'\), bed: (true|false), audible: ([\d.]+), hit: ([\d.]+), top: (-?[\d.]+) \},$/gm)]
  .map((m) => [m[1], { file: m[2], bed: m[3] === 'true', audible: Number(m[4]), hit: Number(m[5]), top: Number(m[6]) }]));
// NEVER LOUDER THAN THE VOICE (2026-10-07): a clip's loudest tenth of a second, measured
// off the file by make-sfx. Levelled by its mean, a short hit ran 12 dB over the voices
// (the cash register at -4.5 under a line); foley stays 8 dB under the quietest voice,
// any other effect no louder than the voices (make-sfx FOLEY_TOP, EVENT_TOP).
const { FOLEY_TOP, EVENT_TOP } = { FOLEY_TOP: -26, EVENT_TOP: -20 };
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
const cutOf = new Map(CUTS.map((c) => [c.id, c]));
for (const c of CUTS) {
  // A TIMED CUE LANDS ITS CLIP'S START ON THE ACTION (AT8), so the clip's hit has to be
  // its start: a coin whose clink came 0.45s into the file was heard 0.45s after it fell.
  const t = table.get(c.id);
  if (c.foley && t && t.hit > FOLEY_MAX_HIT) fail(`cut ${c.id}: its hit comes ${t.hit}s into the clip; a foley clip starts on its hit (${FOLEY_MAX_HIT}s at most) — give it onset/onsetDb, or a window`);
  if (c.foley && c.bed) fail(`cut ${c.id} cannot be both foley and a bed`);
  if (c.foley && c.loud > FOLEY_LOUD) fail(`cut ${c.id} is foley and set to ${c.loud} LUFS; foley is ${FOLEY_LOUD} or quieter`);
  if (t && !t.bed) {
    const cap = c.foley ? FOLEY_TOP : EVENT_TOP;
    if (t.top > cap + 0.5) fail(`cut ${c.id}: its loudest tenth of a second is ${t.top} dBFS, over ${cap} for ${c.foley ? 'foley' : 'an effect'} — run make-sfx`);
  }
}
// the answer sounds the player plays on a stage tap (PICK_SFX in CinematicPlayer)
const player = fs.readFileSync(path.join(DIR, 'CinematicPlayer.tsx'), 'utf8');
for (const m of player.matchAll(/(right|wrong): \{ id: '(\w+)', at: ([\d.]+)/g)) {
  if (!table.has(m[2])) fail(`PICK_SFX.${m[1]} plays "${m[2]}", which is not a clip`);
}
for (const [id, file] of Object.entries(LESSONS)) {
  const src = fs.readFileSync(path.join(DIR, file), 'utf8');
  // EVERY LESSON IS HEARD (2026-10-03): "I want sound effects in all of the lessons."
  if (!/\bsfx:|\bbed:/.test(src)) { fail(`${id} has no sound: give its place a bed and its actions their cues`); continue; }
  lessons += 1;
  // the scene's own line lengths, which its actions are timed against: a cue past the
  // end of its beat's action is one left behind when the line was re-voiced
  const sceneFile = path.join(DIR, file.replace(/Script\.ts$/, 'Scene.tsx'));
  const lm = fs.existsSync(sceneFile) ? fs.readFileSync(sceneFile, 'utf8').match(/\nconst LINES = \[([^\]]*)\]/) : null;
  const LINES = lm ? lm[1].split(',').map(Number) : [];
  const { BEATS } = await import(pathToFileURL(path.join(DIR, file)).href);
  BEATS.forEach((b, i) => {
    for (const c of b.sfx ?? []) {
      if (typeof c.at !== 'number') continue;
      const span = (LINES[i] ?? 0) > 0 ? LINES[i] + 1.5 : 4;
      if (c.at < 0 || c.at > span) fail(`${id} beat ${i}: "${c.id}" at ${c.at}s is outside its beat (the scene's line there runs ${LINES[i] ?? 0}s)`);
    }
    const said = b.text && b.speaker ? durOf(id, i) : 0;
    const wait = b.voiceAfter ?? 0;
    if (b.bed !== undefined && b.bed !== null) {
      if (!table.has(b.bed)) fail(`${id} beat ${i}: bed "${b.bed}" is not a clip`);
      else if (!table.get(b.bed).bed) fail(`${id} beat ${i}: "${b.bed}" is an effect, not a loop, and cannot be a bed`);
      else if (cutOf.get(b.bed)?.music) fail(`${id} beat ${i}: "${b.bed}" is music; music goes in \`music\`, never the bed (AT10)`);
    }
    // MUSIC (AT10): its own layer, one of the music loops, never a bed or a cue
    if (b.music !== undefined && b.music !== null && !cutOf.get(b.music)?.music) fail(`${id} beat ${i}: music "${b.music}" is not one of the music loops`);
    for (const c of b.sfx ?? []) if (cutOf.get(c.id)?.music) fail(`${id} beat ${i}: "${c.id}" is music and cannot be a cue`);
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
      // UNDER A LINE, ONLY FOLEY: the small real sound of what a hand or a foot is doing at
      // that instant, cut quiet (FOLEY_LOUD) and short, and played no louder than
      // FOLEY_GAIN. A crowd, a cheer, a bell is never under a voice.
      if (typeof c.at === 'number' && c.at < wait + said && c.at + t.audible > wait) {
        const cut = cutOf.get(c.id);
        if (!cut?.foley) fail(`${id} beat ${i}: "${c.id}" at ${c.at}s is heard over the line (${wait}–${(wait + said).toFixed(2)}s), and only foley may sound under a voice`);
        else if ((c.gain ?? 1) > FOLEY_GAIN) fail(`${id} beat ${i}: "${c.id}" is under the line at gain ${c.gain ?? 1}; foley under a voice plays at ${FOLEY_GAIN} or less`);
        else if (t.audible > FOLEY_MAX_S) fail(`${id} beat ${i}: "${c.id}" is heard for ${t.audible}s under the line; foley under a voice is at most ${FOLEY_MAX_S}s`);
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
console.log(`check:sfx — ${CUTS.length} clips from ${Object.keys(SOURCES).length} CC0 sources; ${cues} cues in ${lessons} lesson(s); only quiet foley under a voice`);

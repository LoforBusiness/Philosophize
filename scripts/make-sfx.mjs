// ─────────────────────────────────────────────────────────────────────────────
// THE SOUND EFFECTS, MADE FROM THEIR SOURCES (LESSON_RULES AT6).
//
//   FFMPEG=<path> node scripts/make-sfx.mjs
//
// Every effect is a CC0 recording from Freesound (public domain: free, commercial use,
// no credit owed), kept as its downloaded preview in assets/sfx/src/ with its page and
// licence in SOURCES below, and cut here into what the app plays: trimmed, faded, set
// to one loudness per kind, and a background bed made into a seamless loop. Nothing
// is synthesised: the owner's rule since 2026-10-03 is real recordings or nothing.
//
// It writes assets/sfx/<id>.mp3 and lib/sfx/clips.ts. Run it again after changing a
// source or a cut; check:sfx re-derives the table against the files.
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const FF = process.env.FFMPEG;
if (!FF) { console.error('FFMPEG=<path to ffmpeg with libmp3lame> node scripts/make-sfx.mjs'); process.exit(2); }

import { SOURCES, CUTS } from './lib/sfxcuts.mjs';

const ROOT = process.cwd();
/**
 * THE LOUDEST MOMENT A CLIP MAY HAVE (2026-10-07), its loudest tenth of a second in dBFS.
 * Levelling by the clip's MEAN (below) let a short hit run hot: a cash register cut to
 * "-28" is a tenth of a second of bell in a second of silence, the silence pulls the mean
 * down, and the gain that lifts the mean to -28 put the bell at -4.5, twelve dB over the
 * voices it plays under. The voices sit at -19.3 to -17.9 LUFS. So a FOLEY clip, which may
 * sound under a line, tops out 8 dB under the quietest voice at its largest gain (0.85);
 * any other effect, heard between lines, no louder than the voices.
 */
export const FOLEY_TOP = -26;
export const EVENT_TOP = -20;
const SRC_DIR = path.join(ROOT, 'assets', 'sfx', 'src');
const OUT_DIR = path.join(ROOT, 'assets', 'sfx');
const run = (args) => {
  const r = spawnSync(FF, ['-hide_banner', '-loglevel', 'error', '-y', ...args], { encoding: 'utf8' });
  if (r.status !== 0) throw new Error(r.stderr);
};

/** Loudness every twentieth (or hundredth) of a second over a stretch of a file, in dB. */
function levels(file, from, len, win = 0.05) {
  const n = Math.round(44100 * win);
  const r = spawnSync(FF, ['-hide_banner', ...(from !== undefined ? ['-ss', String(from), '-t', String(len)] : []), '-i', file, '-af',
    `aresample=44100,asetnsamples=n=${n},astats=metadata=1:reset=1,ametadata=print:key=lavfi.astats.Overall.RMS_level`, '-f', 'null', '-'], { encoding: 'utf8' });
  return [...(r.stderr || '').matchAll(/RMS_level=(-?[\d.]+|-inf)/g)].map((m) => (m[1] === '-inf' ? -200 : Number(m[1])));
}

for (const c of CUTS) {
  const s = SOURCES[c.src];
  const src = path.join(SRC_DIR, `${s.id}.mp3`);
  if (!fs.existsSync(src)) throw new Error(`missing source ${src}`);
  const out = path.join(OUT_DIR, `${c.id}.mp3`);
  // THE HIT AT THE START (foley): a cue is timed to the instant the hand lands, so the
  // clip must make its sound at its own first moment, not after the recording's lead-in.
  // The cut starts 10ms before the first hundredth of a second within 24dB of its loudest.
  // A recording with noise BEFORE its hit (a hand reaching before the coin drops, a
  // trolley rolling before it bumps) is cut at the HIT: `onsetDb` is how far under the
  // loudest moment the cut may start, with a few milliseconds of fade so the cut does
  // not click (AT8).
  if (c.onset) {
    // `search` is how much of the recording the hit is looked for in, when the clip is
    // cut shorter than that to end before a second, louder event
    const lv = levels(src, c.from, c.search ?? c.len, 0.01);
    const top = Math.max(...lv);
    const k = lv.findIndex((v) => v >= top - (c.onsetDb ?? 24));
    c.from = Math.max(0, Math.round((c.from + Math.max(0, k * 0.01 - 0.01)) * 1000) / 1000);
    if (c.onsetDb !== undefined && !c.fadeIn) c.fadeIn = 0.006;
  }
  const pre = [c.filter, `loudnorm=I=${c.loud}:TP=-2:LRA=11`].filter(Boolean).join(',');
  if (c.bed) {
    // A LOOP WITH NO SEAM: the cut's last `loop` seconds are crossfaded into its first,
    // so where the file ends is where it began.
    // Two passes: the cut, levelled, to a WAV; then that WAV read twice, its tail laid
    // over its own head (one filter graph reading one input twice starves acrossfade).
    const x = c.loop;
    const tmp = path.join(OUT_DIR, `.${c.id}.wav`);
    run(['-ss', String(c.from), '-t', String(c.len), '-i', src, '-af', `${pre},aresample=44100`, '-ac', '2', tmp]);
    run(['-i', tmp, '-i', tmp, '-filter_complex',
      `[0:a]atrim=start=${x},asetpts=PTS-STARTPTS[body];[1:a]atrim=end=${x},asetpts=PTS-STARTPTS[head];[body][head]acrossfade=d=${x}:c1=tri:c2=tri[o]`,
      '-map', '[o]', '-ar', '44100', '-ac', '2', '-b:a', `${c.kbps ?? 128}k`, out]);
    fs.unlinkSync(tmp);
  } else {
    const fades = [
      c.fadeIn ? `afade=t=in:st=0:d=${c.fadeIn}` : null,
      c.fadeOut ? `afade=t=out:st=${Math.max(0, c.len - c.fadeOut)}:d=${c.fadeOut}` : null,
    ].filter(Boolean);
    // ONE GAIN FOR THE WHOLE CLIP, not loudnorm's dynamic levelling: on a clip of a
    // second it rides the gain up through the quiet lead-in and down through the hit, so
    // the room tone before a coin dropped came out nearly as loud as the coin, and the
    // sound seemed to start late. Measured once, set once, and held under a −1dB peak.
    const probe = spawnSync(FF, ['-hide_banner', '-ss', String(c.from), '-t', String(c.len), '-i', src,
      '-af', [c.filter, 'volumedetect'].filter(Boolean).join(','), '-f', 'null', '-'], { encoding: 'utf8' }).stderr || '';
    const mean = Number((probe.match(/mean_volume: (-?[\d.]+) dB/) || [])[1]);
    const peak = Number((probe.match(/max_volume: (-?[\d.]+) dB/) || [])[1]);
    const topRms = Math.max(...levels(src, c.from, c.len, 0.1));
    c.top = c.foley ? FOLEY_TOP : EVENT_TOP;
    const gain = Math.min(c.loud - mean, -1 - peak, c.top - topRms);
    const level = [c.filter, `volume=${gain.toFixed(2)}dB`].filter(Boolean).join(',');
    run(['-ss', String(c.from), '-t', String(c.len), '-i', src, '-af', [level, ...fades].join(','), '-ar', '44100', '-ac', '2', '-b:a', `${c.kbps ?? 160}k`, out]);
  }
  // WHERE IT GOES QUIET: the end of the last twentieth of a second above −45 dB. A cue
  // that opens a beat must have gone quiet before the line comes in (check:sfx).
  const r = spawnSync(FF, ['-hide_banner', '-i', out, '-af',
    'asetnsamples=n=2205,astats=metadata=1:reset=1,ametadata=print:key=lavfi.astats.Overall.RMS_level', '-f', 'null', '-'], { encoding: 'utf8' });
  const lv = [...(r.stderr || '').matchAll(/RMS_level=(-?[\d.]+|-inf)/g)].map((m) => (m[1] === '-inf' ? -200 : Number(m[1])));
  let last = -1;
  lv.forEach((v, k) => { if (v > -45) last = k; });
  c.audible = Math.round((last + 1) * 0.05 * 100) / 100;
  // WHERE ITS HIT IS: the first hundredth of a second within 10dB of its loudest in its
  // first second. A timed cue lands its clip's START on the action, so a hit that comes
  // later in the file is heard late by exactly that much (check:sfx holds foley to it).
  if (!c.bed) {
    const fine = levels(out, undefined, undefined, 0.01).slice(0, 100);
    const top = Math.max(...fine);
    c.hit = Math.round(fine.findIndex((v) => v >= top - 10) * 0.01 * 100) / 100;
  } else c.hit = 0;
  if (!c.bed) c.topOut = Math.round(Math.max(...levels(out, undefined, undefined, 0.1)) * 10) / 10;
  console.log(`  ${c.id.padEnd(8)} ← ${s.title} (${s.music ? 'Commons' : 'Freesound'} ${s.id}, ${s.licence}) · from ${c.from}s · hit at ${c.hit}s · heard for ${c.audible}s`);
}

const ids = CUTS.map((c) => c.id);
const ts = `// GENERATED by scripts/make-sfx.mjs — do not edit. Every clip is a CC0 recording from
// Freesound, or (music) a public-domain or CC0 recording from Wikimedia Commons
// (scripts/lib/sfxcuts.mjs SOURCES), cut and levelled there (LESSON_RULES AT6, AT10).

export type SfxId = ${ids.map((i) => `'${i}'`).join(' | ')};

/** The clips, which are background loops, how long each is heard (seconds), and its loudest tenth of a second (dBFS; 0 for a bed). */
export const SFX: Record<SfxId, { clip: number; bed: boolean; audible: number; hit: number; top: number }> = {
${CUTS.map((c) => `  ${c.id}: { clip: require('../../assets/sfx/${c.id}.mp3'), bed: ${!!c.bed}, audible: ${c.audible}, hit: ${c.hit}, top: ${c.bed ? 0 : c.topOut} },`).join('\n')}
};

/** The MUSIC loops: a layer of their own beside the bed, held far down under every line (AT10). */
export const MUSIC: readonly SfxId[] = [${CUTS.filter((c) => c.music).map((c) => `'${c.id}'`).join(', ')}];
`;
fs.writeFileSync(path.join(ROOT, 'lib', 'sfx', 'clips.ts'), ts);
console.log(`\n${CUTS.length} clips written; lib/sfx/clips.ts`);

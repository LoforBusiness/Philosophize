// ─────────────────────────────────────────────────────────────────────────────
// CUT A SOURCE RECORDING INTO A SHIPPED CUE.
//
// The sampled half of the sound set. scripts/make-sounds.mjs synthesises the
// pitched cues from nothing; this one takes a real recording and reduces it to the
// small, dry, close clip the app plays. Both write into assets/sound/ and both are
// re-runnable, so the shipped set is always the output of a script rather than a
// file somebody once dragged in.
//
//   node scripts/cut-sounds.mjs          every entry whose source is present
//   node scripts/cut-sounds.mjs keep     one entry
//   node scripts/cut-sounds.mjs --dry    say what would happen, write nothing
//
// It shares scripts/lib/dsp.mjs with the synthesiser and the lab, so the filters
// here are the same filters heard there — a second implementation of a highpass
// would drift from the first within two edits and then the sound approved in the
// lab would not be the sound installed.
//
// WHAT IT DELIBERATELY DOES NOT DO: replace the recording's envelope. A sample
// arrives with its own attack and decay and that is most of why it sounds real.
// The default treatment is trim, filter, fade the edges, set the level — see the
// note on `env` in sound-cuts.mjs.
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readWav, resample, highpass, lowpass, wav, env as envelopeOf, HI } from './lib/dsp.mjs';
import { CUTS, DEFAULT_FADE } from './sound-cuts.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'assets', 'sound-src');
const OUT = path.join(ROOT, 'assets', 'sound');

/**
 * Apply one cut. Pure: buffer in, buffer out, so it can be called by the lab to
 * render a candidate without writing anything to disk.
 */
export function applyCut(sourceBuf, cut) {
  const { data, rate } = readWav(sourceBuf);
  const target = cut.rate ?? HI;

  // TRIM FIRST, then resample. The other order resamples material that is about to
  // be thrown away, which on a 30-second source is most of the work.
  const a = Math.max(0, Math.round((cut.in ?? 0) * rate));
  const b = Math.min(data.length, Math.round((cut.out ?? data.length / rate) * rate));
  if (b <= a) throw new Error(`empty cut: in ${cut.in} >= out ${cut.out}`);
  let x = resample(data.slice(a, b), rate, target);

  if (cut.hp) x = highpass(x, cut.hp / target);
  if (cut.lp) x = lowpass(x, cut.lp / target);

  // Optional re-shaping. Rarely right for a sample; see sound-cuts.mjs.
  if (cut.env) {
    const e = envelopeOf(x.length, cut.env.attack ?? 0.002, cut.env.decay ?? 0.2);
    for (let i = 0; i < x.length; i++) x[i] *= e[i];
  }

  // EDGE FADES, AND THEY DEFAULT ON. A cut through a non-zero sample is a step
  // discontinuity — a click — and that is the first thing validate-sound looks for.
  const fin = Math.max(1, Math.round((cut.fade?.in ?? DEFAULT_FADE) * target));
  const fout = Math.max(1, Math.round((cut.fade?.out ?? DEFAULT_FADE) * target));
  for (let i = 0; i < Math.min(fin, x.length); i++) x[i] *= i / fin;
  for (let i = 0; i < Math.min(fout, x.length); i++) x[x.length - 1 - i] *= i / fout;

  // Peak-normalise to the requested level. The MIX lives here: the balance between
  // a footstep that fires ten times a minute and a fanfare that fires once a lesson
  // is these numbers, and validate-sound checks the result.
  let peak = 0;
  for (let i = 0; i < x.length; i++) peak = Math.max(peak, Math.abs(x[i]));
  if (peak > 0) {
    const g = (cut.gain ?? 0.72) / peak;
    for (let i = 0; i < x.length; i++) x[i] *= g;
  }
  return { samples: x, rate: target };
}

// ── CLI below; the module above is importable ────────────────────────────────
//
// Guarded because the LAB imports applyCut to render candidates, and a module whose
// top level runs a CLI would render the whole sound set — and print a report — every
// time somebody asked it to cut one buffer.
const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {

  const only = process.argv.find((a) => !a.startsWith('-') && !a.endsWith('.mjs') && !a.includes('node'));
  const dry = process.argv.includes('--dry');

  const names = Object.keys(CUTS).filter((n) => !only || n === only);
  if (only && !names.length) {
    console.error(`no cut named "${only}". Known: ${Object.keys(CUTS).join(', ') || '(none yet)'}`);
    process.exit(1);
  }

  if (!names.length) {
    console.log('\nNo cuts defined yet.\n');
    console.log('  Every cue is still the synthesised clip from make-sounds.mjs, which is');
    console.log('  what ships today. To sample one:');
    console.log('');
    console.log('    1. put a trimmed CC0 excerpt in assets/sound-src/');
    console.log('    2. record its origin and licence in assets/sound-src/SOURCES.md');
    console.log('    3. add an entry to scripts/sound-cuts.mjs');
    console.log('    4. node scripts/cut-sounds.mjs && npm run check:sound');
    console.log('');
    process.exit(0);
  }

  let wrote = 0;
  const missing = [];
  for (const name of names) {
    const cut = CUTS[name];
    const srcPath = path.join(SRC, cut.src);
    if (!fs.existsSync(srcPath)) { missing.push(`${name} -> ${cut.src}`); continue; }
    const { samples, rate } = applyCut(fs.readFileSync(srcPath), cut);
    const dest = path.join(OUT, `${name}.wav`);
    const ms = (samples.length / rate) * 1000;
    if (!dry) fs.writeFileSync(dest, wav(samples, rate));
    wrote++;
    console.log(`  ${dry ? 'would cut' : 'cut'}  ${name.padEnd(10)} ${cut.src.padEnd(22)} ${ms.toFixed(0)}ms @ ${rate}Hz`);
  }

  if (missing.length) {
    console.log(`\n  ${missing.length} cut(s) have no source file in assets/sound-src/:`);
    for (const m of missing) console.log(`    ${m}`);
    console.log('  Those cues keep the synthesised clip they ship with today.');
  }
  console.log(`\n${dry ? 0 : wrote} clip(s) written to assets/sound/\n`);
}

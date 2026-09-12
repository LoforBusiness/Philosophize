// ─────────────────────────────────────────────────────────────────────────────
// NARRATION: THE CLIPS THE APP SHIPS, ENCODED FROM THE WAVS THEY WERE MEASURED ON.
//
//   FFMPEG=<path to an ffmpeg with libmp3lame> node scripts/encode-narration.mjs [--force]
//
// Chirp 3 HD renders each line as a 24 kHz WAV, and scripts/make-narration.mjs times
// every word from that WAV. Shipped as it is, a WAV costs 48 KB a second, and every
// reader downloads every clip with the update that brings it. A second render as MP3
// would not fit the times: Chirp never renders a line the same way twice. So the MP3
// a beat ships is encoded HERE, from the exact WAV its times came from.
//
// Each MP3 carries the SHA-256 of its WAV in its ID3 comment, and make-narration refuses
// an MP3 whose WAV has changed since, so a re-rendered line can never play old audio
// under new word times. A WAV whose MP3 already carries its hash is skipped; --force
// encodes every one again. Nothing here calls Google.
//
// ffmpeg is not a dependency of the app. The WAVs stay in the repo as the masters the
// times are measured on; nothing requires them, so they are not bundled.
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { ASSETS as DIR, tagOf } from './lib/narration.mjs';

const FFMPEG = process.env.FFMPEG || 'ffmpeg';
const FORCE = process.argv.includes('--force');
/** Mono speech at 24 kHz: 64 kbps keeps the voice, at a sixth of the WAV's size. */
const BITRATE = '64k';

let encoded = 0, skipped = 0, failed = 0, wavBytes = 0, mp3Bytes = 0;
for (const lesson of fs.readdirSync(DIR).sort()) {
  const dir = path.join(DIR, lesson);
  if (!fs.statSync(dir).isDirectory()) continue;
  for (const name of fs.readdirSync(dir).filter((f) => f.endsWith('.wav')).sort()) {
    const wavPath = path.join(dir, name);
    const mp3Path = wavPath.replace(/\.wav$/, '.mp3');
    const wav = fs.readFileSync(wavPath);
    const tag = tagOf(wav);
    wavBytes += wav.length;
    if (!FORCE && fs.existsSync(mp3Path) && fs.readFileSync(mp3Path).includes(tag)) {
      skipped += 1;
      mp3Bytes += fs.statSync(mp3Path).size;
      continue;
    }
    const r = spawnSync(FFMPEG, [
      '-hide_banner', '-loglevel', 'error', '-y',
      '-i', wavPath,
      '-map_metadata', '-1',
      '-c:a', 'libmp3lame', '-b:a', BITRATE, '-ac', '1',
      '-metadata', `comment=${tag}`,
      mp3Path,
    ], { encoding: 'utf8' });
    const ok = r.status === 0 && fs.existsSync(mp3Path) && fs.readFileSync(mp3Path).includes(tag);
    if (!ok) {
      failed += 1;
      console.log(`  FAILED ${lesson}/${name}: ${r.error ? r.error.message : (r.stderr || `exit ${r.status}`).trim()}`);
      continue;
    }
    encoded += 1;
    mp3Bytes += fs.statSync(mp3Path).size;
  }
}
const mb = (n) => `${(n / 1048576).toFixed(1)} MB`;
console.log(`${encoded} encoded · ${skipped} already current · ${failed} failed · WAV ${mb(wavBytes)} → MP3 ${mb(mp3Bytes)}`);
process.exit(failed ? 1 : 0);

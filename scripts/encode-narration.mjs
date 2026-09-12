// ─────────────────────────────────────────────────────────────────────────────
// NARRATION: THE AUDIO THE APP SHIPS, ONE MP3 A LESSON, BUILT FROM THE WAVS ITS WORD
// TIMES WERE MEASURED ON.
//
//   FFMPEG=<path to an ffmpeg with libmp3lame> node scripts/encode-narration.mjs [--force]
//
// Chirp 3 HD renders each line as a 24 kHz WAV, and scripts/make-narration.mjs times
// every word from that WAV. Shipped as it is, a WAV costs 48 KB a second. A second render
// as MP3 would not fit the times: Chirp never renders a line the same way twice. So the
// audio a lesson ships is encoded HERE, from the exact WAVs its times came from.
//
// ONE FILE A LESSON, NOT ONE A LINE. EAS Update takes at most 1,000 assets in an update,
// and a clip a line had put 710 of them into an update of 809 with 85 lessons voiced;
// the whole library is 1,718 lines. So a lesson's spoken lines are laid end to end in
// beat order with GAP_S of silence between them (layoutOf in scripts/lib/narration.mjs)
// and encoded once, as assets/narration/<lesson id>/lesson.mp3. The player seeks to a
// line and pauses at its end.
//
// Each MP3 carries, in its ID3 comment, every line's beat, the SHA-256 of its WAV and
// where it starts. make-narration and check:narration refuse a line its lesson's MP3 does
// not list at the offset the layout gives it, so a re-rendered line can never play old
// audio under new word times, and a line can never be sought to the wrong place. A
// lesson whose MP3 already carries its exact tag is skipped; --force encodes every one
// again. A one-line clip left from before is deleted once its lesson's file is current.
// A lesson with a spoken beat missing its WAV is refused whole. Nothing here calls Google.
//
// ffmpeg is not a dependency of the app. The WAVs stay in the repo as the masters the
// times are measured on; nothing requires them, so they are not bundled.
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import {
  ASSETS as DIR, LESSONS, LESSON_CLIP, WAV_RATE, GAP_SAMPLES, lessonLines, parseWav, headerFaults, entryOf, lessonTagOf,
  sha256hex,
} from './lib/narration.mjs';

const FFMPEG = process.env.FFMPEG || 'ffmpeg';
const FORCE = process.argv.includes('--force');
/** Mono speech at 24 kHz: 64 kbps keeps the voice, at a sixth of the WAV's size. */
const BITRATE = '64k';
const TMP = path.join(os.tmpdir(), 'philosophize-encode-narration');

/** A 16-bit mono WAV at WAV_RATE around the given samples. */
function wavOf(pcm) {
  const data = Buffer.from(pcm.buffer, pcm.byteOffset, pcm.byteLength);
  const h = Buffer.alloc(44);
  h.write('RIFF', 0, 'ascii');
  h.writeUInt32LE(36 + data.length, 4);
  h.write('WAVE', 8, 'ascii');
  h.write('fmt ', 12, 'ascii');
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20);
  h.writeUInt16LE(1, 22);
  h.writeUInt32LE(WAV_RATE, 24);
  h.writeUInt32LE(WAV_RATE * 2, 28);
  h.writeUInt16LE(2, 32);
  h.writeUInt16LE(16, 34);
  h.write('data', 36, 'ascii');
  h.writeUInt32LE(data.length, 40);
  return Buffer.concat([h, data]);
}

function removeOneLineClips(lessonId) {
  let n = 0;
  for (const f of fs.readdirSync(path.join(DIR, lessonId))) {
    if (/^beat-\d{2}\.mp3$/.test(f)) { fs.rmSync(path.join(DIR, lessonId, f)); n += 1; }
  }
  return n;
}

fs.mkdirSync(TMP, { recursive: true });
let encoded = 0, skipped = 0, failed = 0, removed = 0, lines = 0, mp3Bytes = 0;
for (const lessonId of Object.keys(LESSONS)) {
  const { lines: ls, missing } = lessonLines(lessonId);
  const out = path.join(DIR, lessonId, LESSON_CLIP);
  if (missing.length || !ls.length) {
    failed += 1;
    console.log(`  FAILED ${lessonId}: ${missing.length ? `no WAV for spoken beat(s) ${missing.join(', ')}` : 'no spoken lines'}`);
    continue;
  }
  const bad = ls.flatMap((l) => headerFaults(parseWav(l.wav)).map((f) => `${l.key}.wav: ${f}`));
  if (bad.length) { failed += 1; console.log(`  FAILED ${lessonId}: ${bad.join('; ')}`); continue; }
  const tag = lessonTagOf(ls.map((l) => entryOf(l.beat, sha256hex(l.wav), l.at)));
  lines += ls.length;

  if (!FORCE && fs.existsSync(out) && fs.readFileSync(out).includes(tag)) {
    skipped += 1;
    mp3Bytes += fs.statSync(out).size;
    removed += removeOneLineClips(lessonId);
    continue;
  }
  const last = ls[ls.length - 1];
  const pcm = new Int16Array(last.start + last.samples);
  for (const l of ls) pcm.set(parseWav(l.wav).pcm, l.start);
  const tmp = path.join(TMP, `${lessonId}.wav`);
  fs.writeFileSync(tmp, wavOf(pcm));
  const r = spawnSync(FFMPEG, [
    '-hide_banner', '-loglevel', 'error', '-y',
    '-i', tmp,
    '-map_metadata', '-1',
    '-c:a', 'libmp3lame', '-b:a', BITRATE, '-ac', '1',
    '-metadata', `comment=${tag}`,
    out,
  ], { encoding: 'utf8' });
  fs.rmSync(tmp, { force: true });
  const ok = r.status === 0 && fs.existsSync(out) && fs.readFileSync(out).includes(tag);
  if (!ok) {
    failed += 1;
    console.log(`  FAILED ${lessonId}: ${r.error ? r.error.message : (r.stderr || `exit ${r.status}`).trim()}`);
    continue;
  }
  encoded += 1;
  mp3Bytes += fs.statSync(out).size;
  removed += removeOneLineClips(lessonId);
}
const mb = (n) => `${(n / 1048576).toFixed(1)} MB`;
console.log(`${encoded} lesson(s) encoded · ${skipped} already current · ${failed} failed · ${lines} line(s) in ${encoded + skipped} file(s), ${mb(mp3Bytes)} · ${removed} one-line clip(s) removed`);
process.exit(failed ? 1 : 0);

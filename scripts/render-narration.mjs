// RENDER A LESSON'S SPOKEN LINES — each in the voice its beat is spoken in.
//
//   node scripts/render-narration.mjs <lesson-id> <out dir> [beat[@rate] …]
//   node scripts/render-narration.mjs economics-foundations-1 ../takes        every line
//   node scripts/render-narration.mjs economics-foundations-1 ../takes 3@0.98 a retake
//
// Writes <out>/<lesson>/beat-NN.wav and <out>/job.json, which is exactly what
// scripts/install-narration.mjs takes next. Nothing here installs anything.
//
// ── THE VOICE COMES FROM THE CAST, NEVER FROM THE LINE ──────────────────────
//
// A narrated lesson is read in NARRATOR_VOICE; a dialogue lesson's beat names its
// `speaker`, and cast.ts says what that speaker sounds like. The job records the voice
// each take was made in, and install-narration refuses a take whose voice is not its
// beat's (LESSON_RULES AP2).
//
// ── EVERY REQUEST GOES THROUGH THE CHARACTER LEDGER ─────────────────────────
//
// scripts/lib/ttsledger.mjs records each request BEFORE it is sent and refuses one
// that would take the month past 900,000 characters or a run past 200,000. The owner's
// rule is never to be charged; Google's own budgets only alert, in dollars, hours late.
// `node scripts/tts-ledger.mjs` prints where the month stands.
//
// ── THE WORDS AND THE PAUSES ────────────────────────────────────────────────
//
// What is sent is the beat's `markup` when it has one, else its `text`. Markup may add
// Chirp 3 HD pause tags ([pause short], [pause], [pause long]) and nothing else: with
// the tags taken out it must be the on-screen text exactly, or the voice would say
// words the reader cannot see (AC rules).
//
// A RETAKE MUST BE A DIFFERENT REQUEST. Google returns the same bytes for the same
// request, broken ones included, so `3@0.98` re-renders beat 3 at a nudged rate.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { LESSONS, beatsOf, spoken, keyOf, voiceFor, endingMarkup, trimTail } from './lib/narration.mjs';
import { wiredLessons } from './lib/dialogue.mjs';
import { openLedger } from './lib/ttsledger.mjs';

const [lessonId, outDir, ...picks] = process.argv.slice(2);
if (!lessonId || !outDir) {
  console.error('usage: node scripts/render-narration.mjs <lesson-id> <out dir> [beat[@rate] …]');
  process.exit(2);
}

const scriptFile = LESSONS[lessonId]
  ?? wiredLessons().find((l) => l.id === lessonId)?.scriptFile;
if (!scriptFile) { console.error(`${lessonId}: not in LESSONS and not wired in the lesson route`); process.exit(1); }
const beats = beatsOf(path.basename(scriptFile));

const only = new Map(picks.map((p) => { const [b, r] = p.split('@'); return [Number(b), r ? Number(r) : null]; }));
const PAUSE_TAG = /\s*\[pause(?: short| long)?\]\s*/g;
const plain = (s) => s.replace(PAUSE_TAG, ' ').replace(/\s+/g, ' ').trim();

const lines = [];
beats.forEach((b, i) => {
  if (!spoken(b)) return;
  if (only.size && !only.has(i)) return;
  const markup = b.markup ?? b.text;
  if (plain(markup) !== plain(b.text)) {
    console.error(`beat ${i}: its markup says "${plain(markup)}" but the screen shows "${b.text}"`);
    process.exit(1);
  }
  const v = voiceFor(b.speaker);
  // A dialogue line is asked for with a long pause after it, so the voice finishes its
  // last word instead of being trimmed into it (AP16).
  lines.push({ i, key: keyOf(lessonId, i), text: b.text, markup: b.speaker ? endingMarkup(markup) : markup, dialogue: !!b.speaker, voice: v, rate: only.get(i) ?? v.rate });
});
if (!lines.length) { console.error('no spoken beats to render'); process.exit(1); }

const GCLOUD = path.join(process.env.LOCALAPPDATA ?? '', 'Google/Cloud SDK/google-cloud-sdk/bin/gcloud.cmd');
const token = execFileSync('cmd.exe', ['/d', '/s', '/c', `""${GCLOUD}" auth application-default print-access-token"`],
  { encoding: 'utf8', windowsVerbatimArguments: true }).trim();

const items = [];
const ledger = openLedger();
try {
  for (const l of lines) {
    const request = {
      input: { markup: l.markup },
      voice: { languageCode: l.voice.languageCode, name: l.voice.name },
      audioConfig: { audioEncoding: 'LINEAR16', sampleRateHertz: 24000, speakingRate: l.rate },
    };
    const res = await ledger.spend(request, () => fetch('https://texttospeech.googleapis.com/v1/text:synthesize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'x-goog-user-project': 'app-narration',
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(request),
    }), `${l.key} ${l.voice.name}@${l.rate}`);
    if (!res.ok) { console.log(`${l.key}: HTTP ${res.status} ${(await res.text()).slice(0, 300)}`); continue; }
    const j = await res.json();
    const dest = path.join(outDir, `${l.key}.wav`);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    const audio = Buffer.from(j.audioContent, 'base64');
    // …and the silence that pause bought is cut back, so the line does not end in dead air.
    fs.writeFileSync(dest, l.dialogue ? trimTail(audio) : audio);
    items.push({ key: l.key, text: l.text, voice: l.voice.name, encodings: ['LINEAR16'] });
    console.log(`${l.key}  ${l.voice.name} @${l.rate}  ${fs.statSync(dest).size} bytes`);
  }
} finally {
  ledger.close();
}
const jobFile = path.join(outDir, 'job.json');
const prior = fs.existsSync(jobFile) ? JSON.parse(fs.readFileSync(jobFile, 'utf8')).items ?? [] : [];
const byKey = new Map(prior.map((it) => [it.key, it]));
for (const it of items) byKey.set(it.key, it);
fs.writeFileSync(jobFile, `${JSON.stringify({ items: [...byKey.values()].sort((a, b) => a.key.localeCompare(b.key)) }, null, 2)}\n`);
console.log(`\n${items.length} take(s) written; job: ${jobFile}\nnext: node scripts/install-narration.mjs ${jobFile} ${outDir}`);

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
// request, broken ones included, so `3@0.98` re-renders beat 3 at a nudged rate (for a
// paced line, `3@0.98` scales the rate its pace starts from).
//
// ── A PACED LINE (LESSON_RULES AP17) ─────────────────────────────────────────
//
// A dialogue beat that states its `pace` is rendered from its PUNCTUATION, never from a
// hand-written markup: a pause tag after every mark (prosody.markupOf). The WHOLE line
// is asked for at each pace it uses, at the voice's rate scaled for that pace; a take
// whose sentences at that pace are outside its band, cut off, or run through a mark is
// asked for again at a rate nudged toward the band's aim (up to TRIES times, keeping the
// best). Each sentence is then taken from its own pace's take, cut inside the silence at
// a sentence end (prosody.spliceSentences), and every pause is SET to a person's length
// in the audio (prosody.shapePauses), so what is installed has about a sixth of a second at a
// comma and twice that at a stop, whatever the take did.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { LESSONS, beatsOf, spoken, keyOf, voiceFor, endingMarkup, trimTail, parseWav } from './lib/narration.mjs';
import { wiredLessons } from './lib/dialogue.mjs';
import { openLedger } from './lib/ttsledger.mjs';
import { PACES, aimOf, AIM_TOLERANCE, requestOf, cutTail, sentencesOf, readTake, prosodyFaults, shapePauses, spliceSentences, wavOf, trimLead, paceFault, paceRates, END_DROP_DB, MIN_SYLLABLES, SENTENCE_SLACK } from './lib/prosody.mjs';

// ── ONE GO (2026-10-01) ─────────────────────────────────────────────────────
// The owner: *"I don't want to have to keep going back and back to keep reiterating the
// narration … if creating the narration voices can be done in one go by following the
// rules … that will be very good."* Re-voicing all fourteen dialogue lessons cost 64,000
// characters, and the requests broke down as: half the first takes missed their band
// (the voice scatters about 8% either way at one rate), and earlier rounds re-voiced
// lines because a word changed AFTER they were voiced. So: a line gets at most three
// tries; each voice's first take is AIMED, from what it measured per unit of rate on
// those 226 requests (SPEED_PER_RATE); and nothing is rendered until the lesson's words
// pass the prose checks, so a voiced word never has to change.
const TRIES = 3;
/**
 * Syllables a second a voice gives per unit of speaking rate, per pace: the medians of 226
 * dialogue requests on 2026-10-01 (pause tags and short sentences make brisk lines read
 * slower per unit, so the two paces are kept apart). A first take is asked for at
 * aim / this.
 */
const SPEED_PER_RATE = {
  'en-GB-Chirp3-HD-Algieba|even': 4.80, 'en-GB-Chirp3-HD-Algieba|brisk': 4.6,
  'en-AU-Chirp3-HD-Zubenelgenubi|even': 4.66, 'en-AU-Chirp3-HD-Zubenelgenubi|brisk': 4.30,
  'en-GB-Chirp3-HD-Sadachbia|even': 4.88, 'en-GB-Chirp3-HD-Sadachbia|brisk': 4.97,
  'en-US-Chirp3-HD-Kore|even': 5.07, 'en-US-Chirp3-HD-Kore|brisk': 4.35,
};

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
  const v = voiceFor(b.speaker);
  if (b.speaker && b.pace !== undefined) {
    const pf = paceFault(b.text, b.pace);
    if (pf) { console.error(`beat ${i} ${pf}`); process.exit(1); }
    if (b.markup) { console.error(`beat ${i}: a paced line takes its pauses from its punctuation; remove its markup`); process.exit(1); }
    lines.push({ i, key: keyOf(lessonId, i), text: b.text, pace: b.pace, voice: v, nudge: only.get(i) ?? 1 });
    return;
  }
  const markup = b.markup ?? b.text;
  if (plain(markup) !== plain(b.text)) {
    console.error(`beat ${i}: its markup says "${plain(markup)}" but the screen shows "${b.text}"`);
    process.exit(1);
  }
  // A dialogue line is asked for with a long pause after it, so the voice finishes its
  // last word instead of being trimmed into it (AP16).
  lines.push({ i, key: keyOf(lessonId, i), text: b.text, markup: b.speaker ? endingMarkup(markup) : markup, dialogue: !!b.speaker, voice: v, rate: only.get(i) ?? v.rate });
});
if (!lines.length) { console.error('no spoken beats to render'); process.exit(1); }

// THE WORDS ARE FINAL BEFORE THE VOICE IS ASKED. A dialogue lesson's prose checks run
// first; a failure here costs nothing, where the same failure after rendering costs a
// re-voice. RENDER_FORCE=1 skips it, for a retake of words already checked.
if (beats.some((b) => b.speaker) && !process.env.RENDER_FORCE) {
  for (const c of ['check-dialogue', 'check-splits', 'check-words', 'check-ear', 'check-voice', 'check-plainwords']) {
    const r = spawnSync(process.execPath, ['--disable-warning=MODULE_TYPELESS_PACKAGE_JSON', path.join('scripts', `${c}.mjs`)], { encoding: 'utf8', env: { ...process.env, DIALOGUE_TEXT_ONLY: '1' } });
    if (r.status) {
      const mine = (r.stdout + r.stderr).split('\n').filter((x) => x.includes(lessonId)).slice(0, 8).join('\n');
      console.error(`${c} fails, so nothing was rendered: fix the words first, then voice them once.\n${mine}`);
      process.exit(1);
    }
  }
}

const GCLOUD = path.join(process.env.LOCALAPPDATA ?? '', 'Google/Cloud SDK/google-cloud-sdk/bin/gcloud.cmd');
const token = execFileSync('cmd.exe', ['/d', '/s', '/c', `""${GCLOUD}" auth application-default print-access-token"`],
  { encoding: 'utf8', windowsVerbatimArguments: true }).trim();

const ledger = openLedger();
async function synth(markup, voice, rate, label) {
  const request = {
    input: { markup },
    voice: { languageCode: voice.languageCode, name: voice.name },
    audioConfig: { audioEncoding: 'LINEAR16', sampleRateHertz: 24000, speakingRate: Number(rate.toFixed(3)) },
  };
  const res = await ledger.spend(request, () => fetch('https://texttospeech.googleapis.com/v1/text:synthesize', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'x-goog-user-project': 'app-narration',
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(request),
  }), label);
  if (!res.ok) { console.log(`${label}: HTTP ${res.status} ${(await res.text()).slice(0, 300)}`); return null; }
  return Buffer.from((await res.json()).audioContent, 'base64');
}

/**
 * What is wrong with a take FOR THE SENTENCES SAID AT `p`: their speed, a mark inside
 * them or at either end of them that the voice ran through, and the ending if the last
 * sentence is one of them. The other sentences come from another take.
 */
function faultsAt(take, text, p) {
  const sents = take.sentences;
  const words = String(text).match(/\S+/g) || [];
  const mine = new Set(sents.map((s, k) => (s.pace === p ? k : -1)).filter((k) => k >= 0));
  const out = [];
  const through = new Set();
  if (mine.has(sents.length - 1) && take.endDb > -END_DROP_DB) out.push('CUT OFF');
  for (const m of take.marks) {
    const k = sents.findIndex((s) => m.word >= s.from && m.word <= s.to);
    const bounds = mine.has(k) || (m.word === sents[k].to && mine.has(k + 1));
    if (bounds && m.gap < 0) { out.push(`NO PAUSE after "${words[m.word]}"`); through.add(m.word); }
  }
  for (const k of mine) {
    const s = sents[k];
    if (!s.rate || s.syllables < MIN_SYLLABLES) continue;
    if (s.rate > PACES[p].max + SENTENCE_SLACK) out.push('ONE TOO FAST');
    if (s.rate < PACES[p].min - SENTENCE_SLACK) out.push('ONE TOO SLOW');
  }
  const together = paceRates(take).get(p);
  const said = together?.rate ?? null;
  if (said && said > PACES[p].max) out.push('TOO FAST');
  if (said && said < PACES[p].min) out.push('TOO SLOW');
  return { faults: out, rate: said, through };
}

/**
 * Where each voice's rate for each pace ended up, as a share of where it started. Pause
 * tags slow a voice down (it lengthens the word before every pause), and by how much
 * differs by voice, so the next line starts where the last one landed: fewer retakes,
 * fewer characters.
 */
const learned = new Map();

/**
 * The whole line asked for at pace `p`, retaken toward p's band; the best take. Each
 * request carries a throwaway word after the line (prosody.requestOf), and the audio is
 * cut in the silence before it (prosody.cutTail), so the last word always finishes.
 */
async function renderAt(l, p) {
  const band = PACES[p];
  // the aim for what this line says at p, set by how long its sentences are (AP21)
  const mine = sentencesOf(l.text, l.pace ?? p).filter((s) => s.pace === p);
  const syl = mine.length ? mine.reduce((a, s) => a + s.syllables, 0) / mine.length : 12;
  const aim = aimOf(p, syl);
  const near = (said) => said && Math.abs(said - aim) / aim <= AIM_TOLERANCE;
  const spr = SPEED_PER_RATE[`${l.voice.name}|${p}`];
  const base = (spr ? aim / spr : l.voice.rate * band.factor) * l.nudge;
  const lk = `${l.voice.name}|${p}`;
  let rate = base * (learned.get(lk) ?? 1);
  let best = null;
  const strong = new Set();
  for (let t = 0; t < TRIES; t += 1) {
    const buf = await synth(requestOf(l.text, strong), l.voice, rate, `${l.key} ${p}@${rate.toFixed(3)}`);
    if (!buf) break;
    if (process.env.RENDER_DUMP) fs.writeFileSync(path.join(process.env.RENDER_DUMP, `${l.key.replace(/\W+/g, '_')}-${p}-${t}.wav`), buf);
    const w = parseWav(buf);
    const pcm = cutTail(w.pcm, w.rate, l.text);
    if (!pcm) {
      console.log(`    ${l.key} ${p} try ${t + 1} @${rate.toFixed(3)}: no silence after the last word to cut in`);
      rate *= t % 2 ? 0.985 : 1.015;
      continue;
    }
    const take = readTake(pcm, w.rate, l.text, l.pace);
    const { faults, rate: said, through } = faultsAt(take, l.text, p);
    const score = faults.length + (said ? Math.abs(said - aim) / 10 : 0);
    console.log(`    ${l.key} ${p} try ${t + 1} @${rate.toFixed(3)}: ${said ? said.toFixed(2) : '—'} syl/s (aim ${aim.toFixed(2)}, band ${band.min}–${band.max})${faults.length ? `  ${faults.join(', ')}` : ''}`);
    if (!best || score < best.score) best = { pcm, rate: w.rate, take, score, faults };
    if (said && said <= band.max && said >= band.min) learned.set(lk, rate / base);
    // kept only once it is clean AND within AIM_TOLERANCE of its aim (AP21)
    if (!faults.length && near(said)) break;
    for (const k of through) strong.add(k);
    // a different request every time: toward the band's aim if the speed is off, else a nudge
    const off = said && !near(said);
    rate = off ? rate * Math.min(1.15, Math.max(0.87, aim / said)) : rate * (t % 2 ? 0.985 : 1.015);
  }
  return best;
}

const items = [];
try {
  for (const l of lines) {
    const dest = path.join(outDir, `${l.key}.wav`);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    if (l.pace !== undefined) {
      // A PACED line: the whole line at each pace it uses, each sentence from its own
      // pace's take, and then every pause set to a person's length.
      const paces = [...new Set(sentencesOf(l.text, l.pace).map((s) => s.pace))];
      const takes = {};
      for (const p of paces) takes[p] = await renderAt(l, p);
      if (paces.some((p) => !takes[p])) continue;
      const rate = takes[paces[0]].rate;
      const joined = paces.length === 1 ? takes[paces[0]].pcm : spliceSentences(takes, l.text, l.pace, rate);
      if (!joined) { console.log(`${l.key}: a sentence end has no pause to cut in, in one of its takes — render it again`); continue; }
      // the line starts a tenth of a second before its first sound, like every other take
      const pcm = trimLead(shapePauses(joined, rate, l.text, l.pace), rate, 0.1);
      const faults = prosodyFaults(readTake(pcm, rate, l.text, l.pace), l.text);
      fs.writeFileSync(dest, wavOf(pcm, rate));
      items.push({ key: l.key, text: l.text, voice: l.voice.name, encodings: ['LINEAR16'] });
      console.log(`${l.key}  ${l.voice.name}  ${(pcm.length / rate).toFixed(2)}s${faults.length ? `  STILL: ${faults.map((f) => `${f.kind} ${f.say}`).join(' | ')}` : '  ok'}`);
      continue;
    }
    const audio = await synth(l.markup, l.voice, l.rate, `${l.key} ${l.voice.name}@${l.rate}`);
    if (!audio) continue;
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

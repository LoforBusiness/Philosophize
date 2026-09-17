// THE CHARACTER LEDGER — what keeps narration under 900,000 characters a month.
//
// Narration is rendered by Google Cloud Text-to-Speech (Chirp 3 HD), which gives
// 1,000,000 characters a month free and bills $30 a million after that. The rule
// is that it never bills, and nothing on Google's side can hold that line: a
// budget is an email, in dollars, hours late; a quota counts requests a minute,
// not characters a month; and the kill switch fires off that same late email,
// which Google's own tutorial says does not guarantee staying under budget. So the
// cap lives on the machine that sends the requests, and it refuses BEFORE anything
// is sent.
//
// Each rule below is a way the obvious version lets characters through:
//
// - RECORD, THEN SEND. The entry is appended and fsynced first. A request that
//   times out may still have been synthesized and billed, so a send that fails
//   stays counted. Counting too much is the safe direction; counting too little is
//   the one failure this file exists to prevent.
// - BYTES, NOT CHARACTERS. A UTF-8 byte count is never smaller than a character
//   count — "It’s" is four characters and six bytes — and it is the unit Google's
//   5,000 request limit is measured in. EVERY string inside `input` counts,
//   pronunciations included, so a field Google adds later is counted, not missed.
// - THE MONTH IS PACIFIC, AND THE LAST DAY OF ONE COUNTS TOWARD THE NEXT. Cloud
//   Billing keeps its months in Pacific time. The 24-hour overlap means a clock
//   that is a little wrong, a meter that stamps a request later than this file
//   did, or a month Google turns out to keep in UTC cannot open a second
//   allowance.
// - FAIL CLOSED. A missing ledger, a line that will not parse, a last line never
//   finished, a clock gone backwards, a file that changed under a running render,
//   a second render at the same time: each one refuses. There is no reset, and
//   nothing outside this file can point the real ledger anywhere else.
// - A RUN HAS ITS OWN CAP. 200,000 is about one whole render, so a script stuck in
//   a loop stops after a render's worth rather than at the month's end.
//
// The ledger lives OUTSIDE the repo, in %APPDATA%\Ashmere\tts. A `git clean`, a
// `git restore` or another session rebuilding a file from HEAD can roll back
// anything in the working tree, and a ledger that can be rolled back can forget.
// It is append-only JSON lines, so a crash can tear at most the line being
// written — and a torn line refuses.
//
//   node scripts/tts-ledger.mjs                 where the month stands
//   node scripts/countertest-ttsledger.mjs      every refusal, put in front of it
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export const MONTH_CAP = 900_000;
export const RUN_CAP = 200_000;
export const REQUEST_MAX_BYTES = 5_000;
const OVERLAP_MS = 24 * 60 * 60 * 1000;
// A clock correction moves a clock by seconds. Past this it is a wrong clock, and
// a wrong clock can file a spend under a month it does not belong to.
const CLOCK_SLACK_MS = 5 * 60 * 1000;

export const LEDGER_DIR = path.join(process.env.APPDATA ?? path.join(os.homedir(), '.config'), 'Ashmere', 'tts');
const FILE = 'ledger.jsonl';
const LOCK = 'ledger.lock';
const HEADER = 'ashmere-tts';

export class LedgerRefusal extends Error {
  constructor(message) {
    super(message);
    this.name = 'LedgerRefusal';
  }
}
const refuse = (message) => { throw new LedgerRefusal(message); };
const fmt = (n) => n.toLocaleString('en-US');

// ─── the month ──────────────────────────────────────────────────────────────

const PACIFIC = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/Los_Angeles', hourCycle: 'h23',
  year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric',
});
const wall = (ms) => {
  const o = {};
  for (const p of PACIFIC.formatToParts(ms)) if (p.type !== 'literal') o[p.type] = Number(p.value);
  return o;
};
const ymd = (ms) => {
  const w = wall(ms);
  return `${w.year}-${String(w.month).padStart(2, '0')}-${String(w.day).padStart(2, '0')}`;
};

/** "2026-09" — the Pacific month an instant falls in. */
export function pacificMonth(ms) {
  return ymd(ms).slice(0, 7);
}

/** The instant it turns midnight in Pacific time on the 1st of the month `ms` is in. */
export function pacificMonthStart(ms) {
  const { year, month } = wall(ms);
  const utc = Date.UTC(year, month - 1, 1);
  // A Pacific clock reads the afternoon before at that instant, and US clocks only
  // change at 2am, so the offset it shows is the offset at the midnight as well.
  const w = wall(utc);
  return utc - (Date.UTC(w.year, w.month - 1, w.day, w.hour, w.minute, w.second) - utc);
}

const countedFrom = (now) => pacificMonthStart(now) - OVERLAP_MS;

/** Everything that counts against the month `now` is in: from the day before it began. */
export function usedThisMonth(entries, now) {
  const from = countedFrom(now);
  let n = 0;
  for (const e of entries) if (e.t >= from) n += e.n;
  return n;
}

// ─── what a request costs ───────────────────────────────────────────────────

/** What Google can bill a request for, as UTF-8 bytes: every string in `input`. */
export function billableBytes(request) {
  const input = request?.input;
  if (![input?.text, input?.markup, input?.ssml].some((s) => typeof s === 'string' && s.length > 0)) {
    refuse('the request has no input.text, input.markup or input.ssml to count');
  }
  let n = 0;
  const walk = (v) => {
    if (typeof v === 'string') n += Buffer.byteLength(v, 'utf8');
    else if (v && typeof v === 'object') for (const x of Object.values(v)) walk(x);
  };
  walk(input);
  return n;
}

// ─── the file ───────────────────────────────────────────────────────────────

function parse(line, file, no) {
  try {
    return JSON.parse(line);
  } catch {
    return refuse(`${file} line ${no} will not parse, so this month's total cannot be known. Nothing was sent.`);
  }
}

function readLedger(file) {
  let buf;
  try {
    buf = fs.readFileSync(file);
  } catch (e) {
    if (e.code !== 'ENOENT') refuse(`the ledger at ${file} cannot be read (${e.code}). Nothing was sent.`);
    refuse(
      `there is no ledger at ${file}.\n` +
      'If narration has never been rendered, create it with\n' +
      '  node scripts/tts-ledger.mjs init --already-used 0\n' +
      'If there was one and it is gone, this month\'s usage is unknown: create it with\n' +
      `  --already-used ${MONTH_CAP}, which closes the rest of this month.`,
    );
  }
  const lines = buf.toString('utf8').split('\n');
  if (lines.pop() !== '') refuse(`the last line of ${file} was never finished — a write was interrupted. Read the file before doing anything else.`);
  const head = parse(lines[0], file, 1);
  if (head?.ledger !== HEADER || head.v !== 1) refuse(`${file} does not begin with an ${HEADER} header`);
  const entries = lines.slice(1).map((line, i) => {
    const e = parse(line, file, i + 2);
    const t = typeof e?.t === 'string' ? Date.parse(e.t) : NaN;
    if (!Number.isFinite(t) || !Number.isSafeInteger(e.n) || e.n < 0) refuse(`${file} line ${i + 2} is not an entry this ledger wrote`);
    return { t, n: e.n };
  });
  return { entries, size: buf.length };
}

function writeAll(fd, text) {
  const buf = Buffer.from(text, 'utf8');
  if (fs.writeSync(fd, buf, 0, buf.length) !== buf.length) refuse('a write to the ledger came up short. Read the file before doing anything else.');
}

function appendDurably(file, line) {
  const fd = fs.openSync(file, 'a');
  try {
    writeAll(fd, line);
    fs.fsyncSync(fd);
  } finally {
    fs.closeSync(fd);
  }
}

function checkClock(entries, now) {
  const last = entries.reduce((m, e) => Math.max(m, e.t), -Infinity);
  if (last > now + CLOCK_SLACK_MS) refuse(
    `this computer's clock reads ${new Date(now).toISOString()}, before the ledger's last entry at ` +
    `${new Date(last).toISOString()}. A clock that has gone backwards can file a spend under the wrong month, so nothing is sent until it is right.`,
  );
}

// ─── the lock ───────────────────────────────────────────────────────────────

const alive = (pid) => {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try { process.kill(pid, 0); return true; } catch (e) { return e.code === 'EPERM'; }
};
const readLock = (lockFile) => {
  try { return JSON.parse(fs.readFileSync(lockFile, 'utf8')); } catch { return {}; }
};

// Two renders at once could both read the same total and both spend the room left
// in it. `wx` is the one atomic create-if-absent there is. A lock whose owner has
// died is taken over, because everything that owner sent was recorded first.
function takeLock(lockFile, token) {
  const body = JSON.stringify({ pid: process.pid, token, since: new Date().toISOString() });
  const take = () => {
    try {
      fs.writeFileSync(lockFile, body, { flag: 'wx' });
      return true;
    } catch (e) {
      if (e.code === 'EEXIST') return false;
      throw e;
    }
  };
  if (take()) return;
  const held = readLock(lockFile);
  if (alive(held.pid)) refuse(`another render is using the ledger (pid ${held.pid}, since ${held.since}). Wait for it to finish.`);
  try { fs.unlinkSync(lockFile); } catch { /* raced with another taker */ }
  if (!take()) refuse('lost a race for the ledger lock. Try again.');
}

// ─── opening it ─────────────────────────────────────────────────────────────

/** Open the ledger for a render. Close it when the render ends. */
export function openLedger() {
  return open(LEDGER_DIR, Date.now);
}

/** The countertest's door: the same ledger, in a directory and on a clock of its choosing. */
export function _openLedgerAt(dir, now) {
  return open(dir, now);
}

function open(dir, now) {
  const file = path.join(dir, FILE);
  const lockFile = path.join(dir, LOCK);
  if (!fs.existsSync(file)) readLedger(file); // refuses, and says what to do
  const token = crypto.randomUUID();
  takeLock(lockFile, token);

  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    process.off('exit', close);
    if (readLock(lockFile).token === token) {
      try { fs.unlinkSync(lockFile); } catch { /* already gone */ }
    }
  };
  process.on('exit', close);

  let ledger;
  try {
    ledger = readLedger(file);
    checkClock(ledger.entries, now());
  } catch (e) {
    close();
    throw e;
  }
  let size = ledger.size;
  let runUsed = 0;
  const run = token.slice(0, 8);

  return {
    file,
    get runUsed() { return runUsed; },
    usedThisMonth: () => usedThisMonth(ledger.entries, now()),

    /**
     * Count `request`, record it, then call `send()` and return what it returns.
     * Refuses — recording nothing and calling nothing — if the request would take
     * the month past MONTH_CAP or this run past RUN_CAP. A `send` that throws stays
     * counted, because Google may have billed it anyway.
     */
    async spend(request, send, note = '') {
      if (closed) refuse('this ledger session is closed');
      if (typeof send !== 'function') refuse('spend() needs the function that sends the request');
      const n = billableBytes(request);
      if (n > REQUEST_MAX_BYTES) refuse(`one request is ${fmt(n)} bytes and Google takes at most ${fmt(REQUEST_MAX_BYTES)}. Nothing was sent.`);
      if (readLock(lockFile).token !== token) refuse('this render no longer holds the ledger lock, so something else may be spending. Nothing was sent.');
      if (fs.statSync(file).size !== size) refuse('the ledger changed while this render was running. Nothing was sent; start the render again.');
      const t = now();
      checkClock(ledger.entries, t);
      const used = usedThisMonth(ledger.entries, t);
      if (used + n > MONTH_CAP) refuse(
        `${fmt(used)} of ${fmt(MONTH_CAP)} are used for ${pacificMonth(t)} (Pacific), and this request is ${fmt(n)} more. Nothing was sent.`,
      );
      if (runUsed + n > RUN_CAP) refuse(
        `this run has used ${fmt(runUsed)} of its ${fmt(RUN_CAP)}, and this request is ${fmt(n)} more. Nothing was sent.`,
      );
      const line = JSON.stringify({ t: new Date(t).toISOString(), n, run, ...(note ? { note: String(note).slice(0, 200) } : {}) }) + '\n';
      appendDurably(file, line);
      size += Buffer.byteLength(line, 'utf8');
      ledger.entries.push({ t, n });
      runUsed += n;
      return send();
    },

    close,
  };
}

// ─── creating it, and reading it ────────────────────────────────────────────

/** Create the ledger, once. `alreadyUsed` is what this month has used so far. */
export function initLedger(alreadyUsed) {
  return init(LEDGER_DIR, alreadyUsed, Date.now());
}

/** The countertest's door. */
export function _initLedgerAt(dir, alreadyUsed, now) {
  return init(dir, alreadyUsed, now);
}

function init(dir, alreadyUsed, now) {
  if (!Number.isSafeInteger(alreadyUsed) || alreadyUsed < 0 || alreadyUsed > MONTH_CAP) refuse(
    `say how many characters this month has already used, as a whole number from 0 to ${fmt(MONTH_CAP)}. If nobody knows, the answer is ${MONTH_CAP}.`,
  );
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, FILE);
  let fd;
  try {
    fd = fs.openSync(file, 'wx');
  } catch (e) {
    if (e.code === 'EEXIST') refuse(`a ledger already exists at ${file}, and there is no creating it again: that is how a month's usage gets forgotten.`);
    throw e;
  }
  try {
    const at = new Date(now).toISOString();
    writeAll(fd,
      JSON.stringify({ ledger: HEADER, v: 1, created: at }) + '\n' +
      JSON.stringify({ t: at, n: alreadyUsed, run: 'init', note: 'already used this month, as declared when the ledger was created' }) + '\n');
    fs.fsyncSync(fd);
  } finally {
    fs.closeSync(fd);
  }
  return file;
}

/** Where the month stands. Reads only, so it works while a render is running. */
export function ledgerStatus(dir = LEDGER_DIR, now = Date.now()) {
  const file = path.join(dir, FILE);
  const { entries } = readLedger(file);
  const used = usedThisMonth(entries, now);
  return {
    file,
    month: pacificMonth(now),
    used,
    remaining: Math.max(0, MONTH_CAP - used),
    countedFrom: ymd(countedFrom(now)),
    lastAt: entries.length ? new Date(entries.at(-1).t).toISOString() : null,
    renderRunning: alive(readLock(path.join(dir, LOCK)).pid),
  };
}

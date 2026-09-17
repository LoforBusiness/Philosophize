// Every refusal the narration ledger makes, put in front of it — and the things it
// must ALLOW, because a ledger that refuses everything passes any test that only
// checks refusals.
//
//   node scripts/countertest-ttsledger.mjs
//
// Nothing here touches the real ledger or the network. Each case gets its own
// directory under the system temp folder, and its own clock.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  LedgerRefusal, MONTH_CAP, REQUEST_MAX_BYTES, RUN_CAP,
  _initLedgerAt, _openLedgerAt, billableBytes, ledgerStatus, pacificMonth, pacificMonthStart,
} from './lib/ttsledger.mjs';

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ttsledger-'));
let made = 0;
const freshDir = () => path.join(root, String(made++));
const fileOf = (dir) => path.join(dir, 'ledger.jsonl');
const lockOf = (dir) => path.join(dir, 'ledger.lock');
const at = (iso) => Date.parse(iso);
const clock = (ms) => () => ms;
const HOUR = 60 * 60 * 1000;
const NOW = at('2026-09-15T12:00:00-07:00');

/** A request whose input is `bytes` long. The voice must not count. */
const say = (bytes) => ({ input: { text: 'x'.repeat(bytes) }, voice: { languageCode: 'en-GB', name: 'en-GB-Chirp3-HD-Algieba' } });

function ledger(alreadyUsed = 0, when = NOW) {
  const dir = freshDir();
  _initLedgerAt(dir, alreadyUsed, when);
  return dir;
}
async function withOpen(dir, now, fn) {
  const l = _openLedgerAt(dir, clock(now));
  try {
    return await fn(l);
  } finally {
    l.close();
  }
}
const refuses = (fn) => assert.throws(fn, LedgerRefusal);
const rejects = (promise) => assert.rejects(promise, LedgerRefusal);

const cases = [];
const test = (name, fn) => cases.push([name, fn]);

test('a ledger that was never created refuses to open', () => {
  const dir = freshDir();
  fs.mkdirSync(dir);
  refuses(() => _openLedgerAt(dir, clock(NOW)));
});

test('init needs a stated whole number, and cannot be run twice', () => {
  for (const bad of [undefined, NaN, -1, 1.5, MONTH_CAP + 1]) refuses(() => _initLedgerAt(freshDir(), bad, NOW));
  const dir = ledger(0);
  refuses(() => _initLedgerAt(dir, 0, NOW));
});

test('UTF-8 bytes are counted, across everything in input and nothing outside it', () => {
  assert.equal(billableBytes({ input: { text: 'It’s' } }), 6);
  assert.equal(billableBytes({
    input: {
      markup: 'Kant [pause] argues',
      customPronunciations: { pronunciations: [{ phrase: 'Kant', phoneticEncoding: 'PHONETIC_ENCODING_IPA', pronunciation: 'kænt' }] },
    },
    voice: { name: 'a long voice name that must not be counted' },
    audioConfig: { audioEncoding: 'MP3' },
  }), 19 + 4 + 21 + 5);
  refuses(() => billableBytes({ input: {} }));
  refuses(() => billableBytes({}));
});

test('an allowed request is sent once, and what it returns comes back', async () => {
  const dir = ledger(0);
  let calls = 0;
  await withOpen(dir, NOW, async (l) => {
    assert.equal(await l.spend(say(10), async () => { calls++; return 'audio'; }), 'audio');
  });
  assert.equal(calls, 1);
});

test('a request is recorded before it is sent, so one that fails stays counted', async () => {
  const dir = ledger(0);
  await withOpen(dir, NOW, (l) => assert.rejects(l.spend(say(1234), () => { throw new Error('network down'); }), /network down/));
  await withOpen(dir, NOW, (l) => assert.equal(l.usedThisMonth(), 1234));
});

test('the month cap: exactly 900,000 is allowed, one more is refused, written nowhere and never sent', async () => {
  const dir = ledger(MONTH_CAP - 10);
  await withOpen(dir, NOW, async (l) => {
    await l.spend(say(10), () => 'ok');
    const before = fs.statSync(fileOf(dir)).size;
    let sent = false;
    await rejects(l.spend(say(1), () => { sent = true; }));
    assert.equal(sent, false);
    assert.equal(fs.statSync(fileOf(dir)).size, before);
  });
});

test('one run stops at 200,000, and the next run carries on', async () => {
  const dir = ledger(0);
  await withOpen(dir, NOW, async (l) => {
    for (let i = 0; i < RUN_CAP / REQUEST_MAX_BYTES; i++) await l.spend(say(REQUEST_MAX_BYTES), () => null);
    assert.equal(l.runUsed, RUN_CAP);
    await rejects(l.spend(say(1), () => null));
  });
  await withOpen(dir, NOW, (l) => l.spend(say(1), () => null));
});

test('a request over 5,000 bytes is refused; one of exactly 5,000 is not', async () => {
  const dir = ledger(0);
  await withOpen(dir, NOW, async (l) => {
    await rejects(l.spend(say(REQUEST_MAX_BYTES + 1), () => null));
    await l.spend(say(REQUEST_MAX_BYTES), () => null);
  });
});

test('the month is Pacific, through both daylight-saving offsets and a new year', () => {
  assert.equal(pacificMonth(at('2026-10-01T06:59:59Z')), '2026-09');
  assert.equal(pacificMonth(at('2026-10-01T07:00:00Z')), '2026-10');
  assert.equal(pacificMonth(at('2026-12-01T07:59:59Z')), '2026-11');
  assert.equal(pacificMonth(at('2026-12-01T08:00:00Z')), '2026-12');
  assert.equal(pacificMonth(at('2027-01-01T07:59:59Z')), '2026-12');
  assert.equal(pacificMonthStart(at('2026-11-15T12:00:00Z')), at('2026-11-01T07:00:00Z'));
  assert.equal(pacificMonthStart(at('2027-03-20T12:00:00Z')), at('2027-03-01T08:00:00Z'));
});

test('the last day of a month also counts toward the next; the day before it does not', async () => {
  const dir = freshDir();
  _initLedgerAt(dir, 0, at('2026-09-29T23:00:00-07:00'));
  const plant = (iso, n) => fs.appendFileSync(fileOf(dir), JSON.stringify({ t: new Date(at(iso)).toISOString(), n }) + '\n');
  plant('2026-09-29T23:30:00-07:00', 100);   // September only
  plant('2026-09-30T00:30:00-07:00', 2000);  // September, and October too
  await withOpen(dir, at('2026-09-30T12:00:00-07:00'), (l) => assert.equal(l.usedThisMonth(), 2100));
  await withOpen(dir, at('2026-10-20T12:00:00-07:00'), (l) => assert.equal(l.usedThisMonth(), 2000));
});

test('a line that will not parse refuses, and so does a last line never finished', () => {
  const garbled = ledger(0);
  fs.appendFileSync(fileOf(garbled), 'not json\n');
  refuses(() => _openLedgerAt(garbled, clock(NOW)));
  const torn = ledger(0);
  fs.appendFileSync(fileOf(torn), `{"t":"${new Date(NOW).toISOString()}","n":5`);
  refuses(() => _openLedgerAt(torn, clock(NOW)));
});

test('a clock gone backwards refuses, a minute of drift does not, and a refused open leaves no lock', async () => {
  const dir = ledger(0, NOW);
  refuses(() => _openLedgerAt(dir, clock(NOW - HOUR)));
  await withOpen(dir, NOW - 60 * 1000, (l) => l.spend(say(1), () => null));
});

test('two renders at once: the second refuses until the first closes', () => {
  const dir = ledger(0);
  const first = _openLedgerAt(dir, clock(NOW));
  try {
    refuses(() => _openLedgerAt(dir, clock(NOW)));
  } finally {
    first.close();
  }
  _openLedgerAt(dir, clock(NOW)).close();
});

test('a lock left by a render that died is taken over', () => {
  const dir = ledger(0);
  const dead = spawnSync(process.execPath, ['-e', '']).pid;
  fs.writeFileSync(lockOf(dir), JSON.stringify({ pid: dead, token: 'gone', since: 'earlier' }));
  _openLedgerAt(dir, clock(NOW)).close();
});

test('a lock taken from under a running render stops it', async () => {
  const dir = ledger(0);
  await withOpen(dir, NOW, async (l) => {
    fs.writeFileSync(lockOf(dir), JSON.stringify({ pid: process.pid, token: 'someone else' }));
    await rejects(l.spend(say(1), () => null));
  });
});

test('a ledger that changes under a running render refuses, and sends nothing', async () => {
  const dir = ledger(0);
  await withOpen(dir, NOW, async (l) => {
    fs.appendFileSync(fileOf(dir), JSON.stringify({ t: new Date(NOW).toISOString(), n: 1 }) + '\n');
    let sent = false;
    await rejects(l.spend(say(1), () => { sent = true; }));
    assert.equal(sent, false);
  });
});

test('a closed session cannot spend', async () => {
  const l = _openLedgerAt(ledger(0), clock(NOW));
  l.close();
  await rejects(l.spend(say(1), () => null));
});

test('status reads while a render holds the lock', async () => {
  const dir = ledger(123);
  await withOpen(dir, NOW, () => {
    const s = ledgerStatus(dir, NOW);
    assert.equal(s.used, 123);
    assert.equal(s.remaining, MONTH_CAP - 123);
    assert.equal(s.renderRunning, true);
  });
});

test('the caps are the ones the user set, and the real ledger takes no directory', () => {
  assert.equal(MONTH_CAP, 900_000);
  assert.equal(RUN_CAP, 200_000);
  assert.ok(RUN_CAP <= MONTH_CAP);
  const src = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), 'lib', 'ttsledger.mjs'), 'utf8');
  assert.match(src, /export function openLedger\(\) \{/);
  assert.match(src, /export function initLedger\(alreadyUsed\) \{/);
});

let failed = 0;
for (const [name, fn] of cases) {
  try {
    await fn();
    console.log(`  ok    ${name}`);
  } catch (e) {
    failed++;
    console.log(`  FAIL  ${name}\n        ${String(e.message).split('\n')[0]}`);
  }
}
fs.rmSync(root, { recursive: true, force: true });
console.log(failed ? `\n${failed} of ${cases.length} failed` : `\nall ${cases.length} held`);
process.exit(failed ? 1 : 0);

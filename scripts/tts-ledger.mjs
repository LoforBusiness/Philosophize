// Where the narration character ledger stands, and how it is created.
//
//   node scripts/tts-ledger.mjs                         this month, in Pacific time
//   node scripts/tts-ledger.mjs init --already-used 0   create it — once, ever
//
// There is no reset and no edit. scripts/lib/ttsledger.mjs says why.
import { LedgerRefusal, MONTH_CAP, RUN_CAP, initLedger, ledgerStatus } from './lib/ttsledger.mjs';

const fmt = (n) => n.toLocaleString('en-US');
const [cmd = 'status', ...args] = process.argv.slice(2);

function print() {
  const s = ledgerStatus();
  console.log([
    '',
    'Narration character ledger',
    `  file        ${s.file}`,
    `  month       ${s.month} (Pacific time)`,
    `  used        ${fmt(s.used)} of ${fmt(MONTH_CAP)}, counted from ${s.countedFrom} 00:00 Pacific — the day before the month began counts too`,
    `  remaining   ${fmt(s.remaining)}`,
    `  one run     at most ${fmt(RUN_CAP)}`,
    `  last entry  ${s.lastAt}`,
    ...(s.renderRunning ? ['  a render is running right now'] : []),
    '',
    'Google gives 1,000,000 a month free. The 100,000 between that and the cap is for',
    'what this ledger cannot see, such as trying voices in the Cloud console.',
    '',
  ].join('\n'));
}

try {
  if (cmd === 'status') {
    print();
  } else if (cmd === 'init') {
    const i = args.indexOf('--already-used');
    const raw = i < 0 ? '' : String(args[i + 1] ?? '');
    const file = initLedger(/^\d+$/.test(raw) ? Number(raw) : NaN);
    console.log(`\nCreated ${file}`);
    print();
  } else {
    console.error('usage: node scripts/tts-ledger.mjs [status | init --already-used <n>]');
    process.exit(2);
  }
} catch (e) {
  if (!(e instanceof LedgerRefusal)) throw e;
  console.error(`\nREFUSED: ${e.message}\n`);
  process.exit(1);
}

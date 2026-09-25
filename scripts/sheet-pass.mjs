// LOOK AT THE THREE PASS SCREENS, AND MEASURE THEM.
//
// §21's rule: a contact sheet cannot catch a module-load or React fault, because
// it never imports the component. These three screens pull in the rank seal, the
// struck tiles, the metal plates, a gradient column and a ticking clock — so they
// get loaded for real, in a browser, exactly as the app draws them.
//
// It reports three things no screenshot answers by itself:
//   · did React actually mount, or is this a blank page that photographs well;
//   · is any element wider than the viewport (the page must never scroll
//     sideways) or clipped inside its own box;
//   · did every part that is supposed to be on the screen actually paint.
//
// And it writes a PNG per screen so the thing can be looked at.
//
// USAGE — ports default away from every other harness (8847/9382, 8852/9392) so
// this can run beside them:
//   npx expo start --web --port 8853 --clear
//   curl -s -o /dev/null "http://localhost:8853/index.bundle?platform=web&dev=true"
//   chrome --headless=new --remote-debugging-port=9393 --user-data-dir=<tmp>
//   node scripts/sheet-pass.mjs
//
// It writes app/previewpass.tsx on the way in and DELETES it on the way out —
// any file in app/ is a real route and would ship if left behind (§21).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { claimRoute } from './lib/previewroute.mjs';

const CDP = +(process.env.CDP_PORT || 9393);
const WEB = +(process.env.WEB_PORT || 8853);
const OUT = process.env.OUT_DIR || 'scripts/.pass-shots';
/** Quarter-second polls waiting for the screen to appear. 80 = 20s. */
const MOUNT_TRIES = +(process.env.MOUNT_TRIES || 240);
/** The phone width to render at. 320 is the narrowest the app supports. */
const DEVICE_W = +(process.env.DEVICE_W || 390);

const ROUTE = 'app/previewpass.tsx';
const SRC = fs.readFileSync(path.join(process.cwd(), 'scripts/lib/previewpass.txt'), 'utf8');

const put = (p) => new Promise((res, rej) => {
  const r = http.request({ host: '127.0.0.1', port: CDP, path: p, method: 'PUT' }, (x) => {
    let d = ''; x.on('data', (c) => (d += c)); x.on('end', () => res(JSON.parse(d)));
  });
  r.on('error', rej); r.end();
});
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// ── the probe ────────────────────────────────────────────────────────────────
//
// Runs in the page. Everything it asks is something arithmetic cannot answer:
// whether React committed, and what the layout engine actually did with the text.
const PROBE = `(() => {
  const root = document.getElementById('pass-root');
  if (!root) return JSON.stringify({ mounted: false });
  // THE WHOLE BODY, NOT THE ROOT. The trial offer is a Modal, which
  // react-native-web portals outside the preview root; measuring only the root
  // photographs it and then reports none of its words.
  const scope = document.body;

  const vw = document.documentElement.clientWidth;
  const seen = new Set();
  const overflow = [];
  const clipped = [];
  const truncated = [];

  for (const el of scope.querySelectorAll('*')) {
    const s = getComputedStyle(el);
    if (s.display === 'none' || s.visibility === 'hidden') continue;
    const r = el.getBoundingClientRect();
    if (r.width < 0.5 || r.height < 0.5) continue;

    const id = el.getAttribute('data-testid');
    if (id) { seen.add(id); }

    // THE PAGE MUST NEVER SCROLL SIDEWAYS. A struck panel pinned to the right,
    // or a run of ticks that is meant to overflow its own clipped box, are both
    // one mistake away from widening the document instead.
    if (r.right > vw + 1 || r.left < -1) {
      // ...unless an ancestor clips it, which is exactly what the tick run does.
      let n = el.parentElement, clippedBy = null;
      while (n && n !== document.body) {
        const ps = getComputedStyle(n);
        if (ps.overflow === 'hidden' || ps.overflowX === 'hidden') { clippedBy = n; break; }
        n = n.parentElement;
      }
      if (!clippedBy) {
        overflow.push({ tag: el.tagName, cls: (el.className || '').toString().slice(0, 40),
                        left: Math.round(r.left), right: Math.round(r.right), vw,
                        text: (el.textContent || '').trim().slice(0, 40) });
      }
    }

    // A <Text> whose content does not fit the box it was given. A horizontal
    // overflow of a single line is a lost word.
    if (el.childElementCount === 0 && (el.textContent || '').trim()) {
      const over = el.scrollWidth - el.clientWidth;
      if (over > 1 && s.overflow !== 'hidden' && s.textOverflow !== 'ellipsis') {
        clipped.push({ text: el.textContent.trim().slice(0, 40), over: Math.round(over) });
      }

      // —— AND A LINE CLAMP THAT ACTUALLY BITES ———————————————————————
      //
      // This used to say "numberOfLines truncates with an ellipsis, which is
      // deliberate" and skip it, and that is only half true. Declaring a clamp
      // IS deliberate; running out of lines inside one is a word the reader
      // does not get. At 320dp the settings certificate rendered "Replay what
      // you …" and "Rest days for your …" and this probe called the screen
      // clean — the same distinction check-readable draws with SPILL (§21).
      //
      // A clamp that is NOT biting measures scrollHeight === clientHeight, so
      // the deliberate case still costs nothing.
      const clamp = +s.webkitLineClamp || 0;
      if (clamp > 0 && el.scrollHeight > el.clientHeight + 1) {
        truncated.push({
          text: el.textContent.trim().slice(0, 40),
          lines: clamp,
          over: Math.round(el.scrollHeight - el.clientHeight),
        });
      }
      // AND THE ONE-LINE CLAMP, which react-native-web draws as nowrap plus an
      // ellipsis rather than as a line clamp, so the rule above never saw it. At
      // 320dp the free tiles printed "1,…" for 1,856 quotes and this probe called
      // the paywall clean.
      if (clamp === 0 && s.textOverflow === 'ellipsis' && over > 1) {
        truncated.push({ text: el.textContent.trim().slice(0, 40), lines: 1, over: Math.round(over) });
      }
    }
  }

  // Words actually on the page, for "did the part I expect exist".
  const text = scope.innerText.replace(/\\s+/g, ' ').trim();

  return JSON.stringify({
    mounted: true,
    docWider: document.documentElement.scrollWidth > vw + 1,
    scrollW: document.documentElement.scrollWidth, vw,
    height: Math.round(root.getBoundingClientRect().height),
    // flex:1 makes the root exactly viewport-tall, so the CONTENT height is the
    // scroll extent of whatever inside it actually scrolls. Without this the
    // screenshot below silently photographs one screenful and looks complete.
    content: Math.max(...[...scope.querySelectorAll('*')]
      .map((e) => (e.scrollHeight > e.clientHeight + 1 ? e.scrollHeight : 0)), 0),
    marks: [...seen],
    overflow, clipped, truncated,
    text: text.slice(0, 6000),
  });
})()`;

// ── screens to visit ─────────────────────────────────────────────────────────
const SCREENS = [
  // Each `want` names a part that has to have PAINTED, not a phrase that happens
  // to be in the file — the point of loading the real screen is that a component
  // can be imported, typechecked and still render nothing.
  // ── THE PASS TAB ─────────────────────────────────────────────────────────
  //
  // A Free-against-Pass chart whose columns are panels laid UNDER rows of
  // measured height. That is why this screen has to be LOADED rather than
  // reasoned about: a label that wraps on a narrow phone makes its row taller,
  // and only a real layout says whether the purple column still runs the whole way
  // down and every cell still sits inside it.
  // -- THE PROFILE, WHICH ABSORBED THE STATISTICS TAB ------------------------
  //
  // Four things must be true after the rebuild: the condensed card is there, the
  // sections the owner removed are NOT, the streak comes first, and nothing in
  // the new card overflows its box on the narrow phone.
  { key: 'profile', q: 's=profile',
    want: ['DAILY STREAK', 'YOUR PROGRESS', 'LESSONS', 'THINKERS', 'QUOTES', 'DAYS',
           'WHERE YOUR READING GOES', 'XP', 'LAST 30 DAYS',
           'PROGRESS TO NEXT RANK', 'SAVED QUOTES', 'BADGES EARNED'],
    notWant: ['AT A GLANCE', 'FROM YOUR INSIGHTS', 'THINKERS YOU KEEP RETURNING TO',
              'BRANCH MASTERY', 'LESSONS DONE', 'TOTAL XP'] },
  { key: 'pass-tab', q: 's=tab',
    want: ['Every lesson, every day', 'with the Scholar’s', 'Benefits', 'Free', 'Pass',
           'lessons', 'Narrated and animated', 'Unit reviews', 'Start any unit',
           'FREE FOR EVERYONE', 'thinkers', 'quizzes', 'badges', 'DAYS FREE', 'Start your',
           'We’ll remind you a day before your free trial ends.',
           'it automatically becomes a Scholar’s Pass', 'Cancel any time before then',
           // THE SECOND DOOR, under the trial: pay today, no free days. Asserted
           // here because the harness seeds `basePlan` itself — without a rule
           // naming these words, removing the box would photograph a clean screen
           // and this sweep would say nothing.
           'Don’t want the free days?', 'Subscribe now instead', 'today and'],
    // The on-device trial's old words, which Google's trial would make untrue.
    notWant: ['Get the Scholar’s Pass', 'No card and no charge', 'Or subscribe now for',
              'Lessons a day', 'Unlimited', 'Replay lessons', 'In order', 'EVERY PLAN INCLUDES'] },
  // AND THE OTHER HALF OF THAT DECISION: the store named no option that charges
  // today, so the box must not be drawn at all. A charge-now button that fell
  // back to starting a trial is the §14 lie in its most expensive form, so the
  // absence is worth a case of its own rather than trusting the render.
  { key: 'pass-tab-nobase', q: 's=tab&base=none',
    want: ['DAYS FREE', 'Start your', 'We’ll remind you a day before your free trial ends.'],
    notWant: ['Don’t want the free days?', 'Subscribe now instead'] },
  { key: 'pass-tab-new', q: 's=tab&seed=new',
    want: ['Benefits', 'FREE FOR EVERYONE', 'Start your', 'We’ll remind you'] },
  // GOOGLE'S TRIAL RUNNING: the end, what it becomes and Cancel, above the chart.
  { key: 'pass-tab-trial', q: 's=tab&trial=on',
    want: ['You hold the', 'DAYS LEFT', 'Your free trial ends',
           'If you do nothing, it automatically becomes a Scholar’s Pass',
           'Cancel free trial', 'Cancelling happens in Google Play'],
    notWant: ['ACTIVE', 'Start your', 'nothing is charged'] },
  // ON A PHONE THAT ALLOWED NOTIFICATIONS the panel says when the reminder comes.
  { key: 'pass-tab-trial-granted', q: 's=tab&trial=on&notify=granted',
    want: ['Reminder set for', 'Cancel free trial'], notWant: ['Turn on reminders'] },
  // The Cancel button's one step before Google Play opens.
  { key: 'pass-tab-cancel', q: 's=tab&trial=on', click: 'Cancel free trial',
    want: ['Cancel your free trial', 'Tap Cancel subscription there', 'Go to Google Play', 'Keep my trial'] },
  // CANCELLED: no charge is coming, and the panel says so without being asked.
  { key: 'pass-tab-cancelled', q: 's=tab&trial=cancelled',
    want: ['FREE TRIAL CANCELLED', 'You won’t be charged', 'stays open until', 'Keep it'],
    notWant: ['Cancel free trial', 'ACTIVE', 'If you do nothing'] },
  // Google no longer offers this reader a trial: no free days, the plain door.
  { key: 'pass-tab-used', q: 's=tab&trial=used',
    want: ['Every lesson, every day', 'Get the Scholar’s Pass', 'Cancel any time'],
    notWant: ['Start your', 'DAYS FREE', 'We’ll remind you'] },
  // THE RETIRED ON-DEVICE TRIAL, still running for somebody who took it before.
  { key: 'pass-tab-device', q: 's=tab&trial=device',
    want: ['DAYS LEFT', 'It ends by itself, and nothing is charged.', 'Keep the Scholar’s Pass'],
    notWant: ['Cancel free trial', 'ACTIVE'] },
  { key: 'pass-tab-pro', q: 's=tab&pro=1',
    want: ['You hold the', 'ACTIVE', 'Benefits'],
    notWant: ['Get the Scholar’s Pass', 'Start your', 'Cancel free trial'] },
  // THE CEREMONY, for a trial that has just started: its terms say the charge.
  { key: 'conferral-trial', q: 's=conferral&trial=on',
    want: ['CONFERRED', 'Free until', 'it automatically becomes a Scholar’s Pass', 'Begin'],
    notWant: ['no card on file', 'nothing to cancel'] },
  // AND THE ASK, on a phone that has not been asked yet: the moment a trial starts.
  { key: 'conferral-trial-ask', q: 's=conferral&trial=on&notify=ask',
    want: ['Get a reminder the day before it ends', 'It would arrive on', 'Turn on reminders', 'Not now', 'Begin'] },
  // THE ONE PAYWALL (2026-09-25): the tab's chart and door, what stays free, and
  // a way to restore — a hard paywall must never trap somebody who reinstalled.
  { key: 'paywall', q: 's=paywall',
    want: ['Unlock every lesson', 'Everything else in Ashmere stays free', 'Benefits',
           'Unit reviews', 'DAYS FREE', 'Start your',
           'We’ll remind you a day before your free trial ends.',
           'it automatically becomes a Scholar’s Pass', 'Restore purchase',
           'FREE FOR EVERYONE', 'quizzes'],
    notWant: ['AT 1 LESSON A DAY', 'Stop waiting', 'FREE AGAINST THE PASS', 'advertisement'] },
  // No trial on offer: the door charges today, and says so.
  { key: 'paywall-used', q: 's=paywall&trial=used',
    want: ['Get the Scholar’s Pass', 'Cancel any time', 'Restore purchase'],
    notWant: ['DAYS FREE', 'We’ll remind you'] },
  { key: 'paywall-new', q: 's=paywall&seed=new',
    want: ['Unlock every lesson', 'Start your', 'FREE FOR EVERYONE'] },
  { key: 'paywall-pro', q: 's=paywall&pro=1', want: ['You hold the', 'ACTIVE', 'Done'],
    notWant: ['Cancel free trial', 'Restore purchase', 'Start your'] },
  // On the trial, the paywall shows the trial's own panel where a subscriber sees ACTIVE.
  { key: 'paywall-trial', q: 's=paywall&trial=on',
    want: ['Your free trial ends', 'Cancel free trial', 'automatically becomes a Scholar’s Pass'],
    notWant: ['You’re a Scholar', 'ACTIVE'] },
  // The one lock money cannot open: no paywall, and the lesson they should open named.
  { key: 'locked-unreached', q: 's=locked&k=unreached',
    want: ['Not yet', 'OPEN THIS ONE INSTEAD'], notWant: ['WHAT THE PASS OPENS', 'Scholar’s Pass'] },

  // ── SETTINGS › SUBSCRIPTION ────────────────────────────────────
  //
  // The sixth member of the family, and the one that was NOT part of it: two
  // hand-written pricing cards claiming fifty badges against a case of seventy,
  // and missing two of the five things the Pass adds. It is the compact
  // certificate now, and it is here for the same reason the tab is — the frame
  // is an SVG sized from onLayout, so a mistake in it renders wrong rather than
  // failing a type check.
  //
  // `click` names a section on the settings rail, because the section is reached
  // by pressing it rather than by a prop.
  { key: 'settings-sub', q: 's=settings', click: 'Subscription',
    want: ['You are on the Free plan', 'Benefits', 'Unit reviews', 'Start any unit',
           'DAYS FREE', 'Start the free trial', 'We’ll remind you a day before your free trial ends.',
           'it automatically becomes a Scholar’s Pass', 'See everything it includes',
           // The charge-today door reaches Settings from the same component, so
           // the owner's "I also want this in settings too" is satisfied by
           // construction rather than by a second implementation — and this is
           // what proves it arrived. The label is the COMPACT one here.
           'Don’t want the free days?', 'Subscribe now'],
    // "All 50 badges" was the old card's own claim against a case of seventy.
    // The PRICE is not tested here and must not be: `$6.99` is FALLBACK_PRICE,
    // which is correct on web and before RevenueCat answers. Whether a price is
    // TYPED is a question about the source, and check-pass §7 asks it there.
    notWant: ['All 50 badges', 'THE DAY PASS', 'No card and no charge'] },
  // GOOGLE'S TRIAL RUNNING: Settings says it converts and carries the trial's own
  // Cancel button, not the paid Pass's.
  { key: 'settings-sub-trial', q: 's=settings&trial=on', click: 'Subscription',
    want: ['on the free trial of Scholar’s Pass', 'DAYS LEFT', 'Cancel free trial',
           'automatically becomes a Scholar’s Pass', 'Cancelling happens in Google Play'],
    notWant: ['Cancel subscription', 'Start the free trial'] },
  { key: 'settings-sub-cancelled', q: 's=settings&trial=cancelled', click: 'Subscription',
    want: ['Your free trial of Scholar’s Pass is cancelled.', 'You won’t be charged'],
    notWant: ['Cancel free trial', 'Cancel subscription'] },
  { key: 'settings-sub-pro', q: 's=settings&pro=1', click: 'Subscription',
    want: ['You have Scholar’s Pass', 'Benefits', 'Cancel subscription'],
    notWant: ['Start the free trial', 'Get the Pass', 'Cancel free trial'] },
];

const { release } = claimRoute({ route: ROUTE, src: SRC, owner: 'sheet-pass', keep: !!process.env.PASS_KEEP });

let bad = 0;
const ok = (cond, label, detail = '') => {
  if (!cond) bad++;
  console.log(`  ${cond ? 'ok  ' : 'FAIL'}  ${label}${detail ? '  — ' + detail : ''}`);
};

try {
  fs.mkdirSync(OUT, { recursive: true });
  // A tab this script made, not /json/list[0] — attaching to the wrong target
  // makes Page.navigate a silent no-op (§19).
  const tab = await put('/json/new?about:blank');
  const sock = new WebSocket(tab.webSocketDebuggerUrl);
  let id = 0;
  const pending = new Map();
  const send = (method, params = {}) => new Promise((res) => {
    const n = ++id; pending.set(n, res);
    sock.send(JSON.stringify({ id: n, method, params }));
  });
  await new Promise((r) => { sock.onopen = r; });
  sock.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); }
  };

  await send('Page.enable');
  await send('Runtime.enable');
  // Only the front tab of a headless window is laid out; a background one never
  // fires its ResizeObserver, so every rect comes back zero (measure-must).
  await send('Emulation.setFocusEmulationEnabled', { enabled: true });
  await send('Page.setWebLifecycleState', { state: 'active' }).catch(() => {});
  // 390 IS THE REFERENCE, NOT THE ONLY ONE THAT MATTERS. The certificate's title
  // has broken on the NARROW phone twice — measured fine at 390 and truncated at
  // 320/360 both times (§14, and §19 for "PER ACTIVE DAY" before it). check-pass
  // does the arithmetic at every width; this is how the render gets looked at.
  //   DEVICE_W=320 node scripts/sheet-pass.mjs
  await send('Emulation.setDeviceMetricsOverride', {
    width: DEVICE_W, height: 844, deviceScaleFactor: 2, mobile: true,
  });

  // ONE SCREEN AT A TIME WHILE ITERATING, and it is not just convenience: a
  // second session on this machine can have two Metros of its own up, and a
  // third takes a page load from ~13s to ~160s (SS21). Nine screens at that rate
  // does not finish; two does.
  //   ONLY=settings-sub node scripts/sheet-pass.mjs
  const only = (process.env.ONLY || '').split(',').filter(Boolean);
  const list = only.length ? SCREENS.filter((s) => only.includes(s.key)) : SCREENS;
  if (only.length && list.length !== only.length) {
    console.log(`unknown screen(s): ${only.filter((k) => !SCREENS.some((s) => s.key === k)).join(" ")}`);
    process.exit(1);
  }

  for (const sc of list) {
    console.log(`\n${sc.key}`);
    await send('Page.navigate', { url: `http://localhost:${WEB}/previewpass?${sc.q}` });

    // POLL FOR THE MOUNT, DO NOT SLEEP AT IT. A fixed wait raced the bundle:
    // the same seven screens came back four mounted and three "module or render
    // fault" on one run and the reverse on the next, which reads exactly like a
    // real intermittent bug and is not one. Metro compiles the first navigation
    // to a route variant, so the honest condition is "is it on the page yet".
    let up = false;
    // …AND HOW LONG TO POLL IS NOT A CONSTANT, because it is not about this
    // app. A second session on this machine can have two Metros of its own up,
    // and a third takes a page load from ~13s to ~160s (§21) — at which point a
    // fixed 20s gives up and prints "no #pass-root — a module or render fault",
    // which is indistinguishable from a broken screen and was exactly wrong
    // about a screen that had just been watched rendering. Raise it before
    // concluding anything.
    // AND A NOT-FOUND PAGE IS RELOADED, not waited on. The route file is written
    // on the way in and Metro registers it a moment later, so the first
    // navigation of a run could land on "This screen doesn't exist" and poll it
    // for a minute — the first case failed on every narrow-phone run while the
    // same screen rendered fine one case later. check:readable learned this
    // first (§21); every twentieth poll, about five seconds, a not-found page is
    // asked again.
    for (let i = 0; i < MOUNT_TRIES && !up; i++) {
      const probe = await send('Runtime.evaluate', {
        expression: `(() => { const e = document.getElementById('pass-root');
          if (e) return e.getBoundingClientRect().height;
          return /doesn.t exist/.test(document.body ? document.body.innerText : '') ? -1 : 0; })()`,
        returnByValue: true,
      });
      const v = probe?.result?.value ?? 0;
      up = v > 100;
      if (!up && v === -1 && i % 20 === 19) await send('Page.reload', {});
      if (!up) await wait(250);
    }
    // Fonts, and Moti's enter animations, once it is actually there.
    await wait(1200);

    // ── A SECTION THAT HAS TO BE PRESSED ────────────────────────────────
    //
    // Settings picks its section from a rail, so the subscription certificate is
    // not on the page until something taps 'Subscription'. Two things about that
    // tap, both learned by other harnesses in this repo (§21):
    //
    //   · A SYNTHETIC `click` IS THE ONLY THING A Pressable HEARS on
    //     react-native-web. CDP's Input.dispatchMouseEvent does nothing at all.
    //   · The rail's items are bare Pressables, so they carry a tabindex and no
    //     role — selecting on [role="button"] finds half the buttons in this app.
    //     Matched on the label's text instead, walked up to the pressable.
    if (sc.click) {
      const hit = await send('Runtime.evaluate', {
        expression: `(() => {
          const want = ${JSON.stringify(sc.click)};
          for (const el of document.querySelectorAll('div,span')) {
            if (el.children.length || (el.textContent || '').trim() !== want) continue;
            let n = el;
            for (let i = 0; i < 6 && n; i++, n = n.parentElement) {
              if (n.tabIndex >= 0 || n.getAttribute('role') === 'button') {
                n.click();
                return 'clicked';
              }
            }
          }
          return 'not found';
        })()`,
        returnByValue: true,
      });
      ok(hit?.result?.value === 'clicked', `it can open the ${sc.click} section`,
        String(hit?.result?.value));
      await wait(900);
    }

    const { result } = await send('Runtime.evaluate', { expression: PROBE, returnByValue: true });
    let r;
    try { r = JSON.parse(result.value); } catch { r = { mounted: false, raw: result.value }; }

    // WHAT THE PAGE SAYS INSTEAD, when it is not the screen. A blank body is a
    // load still running; an error overlay or "doesn't exist" is something else,
    // and without this the three read identically.
    let instead = '';
    if (!r.mounted) {
      const t = await send('Runtime.evaluate', {
        expression: `(document.body && document.body.innerText || '').replace(/\\s+/g, ' ').trim().slice(0, 220)`,
        returnByValue: true,
      });
      instead = ` — the page says: ${JSON.stringify(t?.result?.value ?? '')}`;
    }
    ok(r.mounted, 'React mounted and the screen drew itself',
      r.mounted ? `${r.height}px viewport · ${r.content || r.height}px of content` : `no #pass-root — a module or render fault${instead}`);
    if (!r.mounted) continue;

    ok(!r.docWider, 'the page does not scroll sideways', `doc ${r.scrollW} vs viewport ${r.vw}`);
    ok(r.overflow.length === 0, 'nothing sticks out past the viewport unclipped',
      r.overflow.slice(0, 3).map((o) => `${o.tag} "${o.text}" ${o.left}–${o.right}`).join(' · ') || 'clear');
    ok(r.clipped.length === 0, 'no line of text is cut off inside its own box',
      r.clipped.slice(0, 3).map((c) => `"${c.text}" +${c.over}px`).join(' · ') || 'clear');
    ok((r.truncated ?? []).length === 0, 'and nothing runs out of the lines it was allowed',
      (r.truncated ?? []).slice(0, 3).map((c) => `"${c.text}" clamped at ${c.lines}, +${c.over}px`).join(' · ') || 'clear');

    for (const w of sc.want) {
      ok(r.text.includes(w), `it says "${w}"`,
        r.text.includes(w) ? '' : `not on the page. It says: ${r.text.slice(0, 220)}…`);
    }
    for (const w of sc.notWant ?? []) {
      ok(!r.text.includes(w), `it does NOT say "${w}"`,
        r.text.includes(w) ? 'a paywall in front of something money cannot buy' : '');
    }

    // MEASURED AT PHONE HEIGHT, PHOTOGRAPHED TALL. `captureBeyondViewport` is
    // the obvious way to get a whole scrolling page and it HANGS in
    // --headless=new when paired with a clip (§19); growing the viewport for the
    // shot and putting it back is the same picture with no trap in it. The
    // measurements above were all taken at 844, which is the height that matters.
    await send('Emulation.setDeviceMetricsOverride', {
      width: DEVICE_W, height: Math.min(6000, Math.max(900, (r.content || r.height) + 120)),
      deviceScaleFactor: 2, mobile: true,
    });
    await wait(700);
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    if (shot?.data) {
      fs.writeFileSync(path.join(OUT, `${sc.key}.png`), Buffer.from(shot.data, 'base64'));
      console.log(`        → ${OUT}/${sc.key}.png`);
    }
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390, height: 844, deviceScaleFactor: 2, mobile: true,
    });
  }
  sock.close();
} finally {
  release();
}

console.log(bad === 0 ? '\nPASS — all three screens render and fit.\n' : `\nFAILED — ${bad} problem(s).\n`);
process.exit(bad === 0 ? 0 : 1);

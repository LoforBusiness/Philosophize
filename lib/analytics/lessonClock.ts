import { track } from '@/lib/posthog';

// ─────────────────────────────────────────────────────────────────────────────
// HOW LONG A LESSON TOOK, AND WHETHER IT WAS FINISHED.
//
// ── TWO THINGS THE APP HAS NEVER KNOWN ABOUT ITS OWN CORE LOOP ──────────────
//
// `lesson_started` and `lesson_completed` both fire, so the completion RATE has
// always been available. What has not is either of the two questions that
// actually change what you would build next:
//
//   HOW LONG does a lesson take? §22 records that "nothing in this app has ever
//   recorded a duration" — which was a fair decision when the only consumer was
//   a daily goal, and is a hole once anyone asks whether the cinematic format is
//   slower than the deck it replaced, or whether the lessons people abandon are
//   the long ones.
//
//   WHERE do they leave? A missing `lesson_completed` says somebody left. It does
//   not say whether they left at the hook or at the last question, and those are
//   different products with different fixes.
//
// ── WHY IT IS A MODULE AND NOT A HOOK ──────────────────────────────────────
//
// The clock has to be started by the ROUTE (which knows the branch, the unit and
// the format) and read by `LessonReward` (which is mounted at the ROOT, over
// everything, and knows only the lesson id). There is no component that contains
// both, so a prop cannot carry it and context would have to wrap the whole app to
// serve one number.
//
// One lesson is open at a time by construction — the route is a single screen —
// so this is one slot rather than a map, and a second `open` simply replaces the
// first.
//
// ── THE ORDER THESE FIRE IN, WHICH IS THE WHOLE CORRECTNESS ARGUMENT ───────
//
// The reward is a global overlay, not part of the route: the runner calls
// `showReward`, the overlay mounts ON TOP of a route that is still there, banks
// the XP, and only when the reader taps Continue does anything navigate. So
// `banked()` always runs before `closed()`, and `closed()` can trust the flag.
//
// If that ever inverts — a runner that navigates before the reward commits —
// every finished lesson would also report as abandoned, and the tell is that the
// two events arrive as a pair with the same id rather than one or the other.
// ─────────────────────────────────────────────────────────────────────────────

interface OpenLesson {
  lesson_id: string;
  branch_slug: string;
  unit_id: string;
  format: 'cinematic' | 'cards';
  at: number;
}

let open: OpenLesson | null = null;
let banked = false;

const since = (at: number) => Math.round((Date.now() - at) / 1000);

/** The route has put a lesson on screen. */
export function openedLesson(meta: Omit<OpenLesson, 'at'>) {
  open = { ...meta, at: Date.now() };
  banked = false;
}

/**
 * The reward screen has committed the XP. Returns what the completion event
 * should carry that only this module knows — the seconds, and the format, which
 * `LessonReward` cannot derive: the cinematic map lives in the route, and
 * importing it from a component the route renders would close a cycle.
 */
export function bankedLesson(lessonId: string) {
  banked = true;
  if (!open || open.lesson_id !== lessonId) return { seconds: null, format: null };
  return { seconds: since(open.at), format: open.format };
}

/** The route has gone. Anything not banked by now was walked away from. */
export function closedLesson() {
  const it = open;
  open = null;
  if (!it || banked) return;
  track('lesson_abandoned', {
    lesson_id: it.lesson_id,
    branch_slug: it.branch_slug,
    unit_id: it.unit_id,
    format: it.format,
    seconds: since(it.at),
  });
}

/** What is on screen, for anything that wants to stamp an event with it. */
export function openLessonMeta(): Readonly<OpenLesson> | null {
  return open;
}

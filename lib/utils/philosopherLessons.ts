import { ALL_BRANCHES } from '@/data';

// ─────────────────────────────────────────────────────────────────────────────
// WHICH LESSONS FEATURE A GIVEN THINKER.
//
// 88 quote cards across the curriculum already carry a `philosopherId`, which
// made the link from a profile back into the lessons a lookup rather than new
// content. It is the one thing a profile can offer that the Thinkers tab cannot:
// a reason to leave the sheet and go and learn something.
//
// BUILT ONCE, LAZILY. Walking 6 branches × 28 units × 192 lessons × their cards
// is cheap once and wasteful on every sheet open — and the sheet opens on every
// tap of every card in a 322-item grid. The index is keyed by philosopher id and
// held for the life of the process; the curriculum is static, so it can never go
// stale.
// ─────────────────────────────────────────────────────────────────────────────

export interface FeaturedLesson {
  lessonId: string;
  title: string;
  branchSlug: string;
  branchName: string;
  pathSlug: string;
  pathId: string;
}

let INDEX: Record<string, FeaturedLesson[]> | null = null;

function build(): Record<string, FeaturedLesson[]> {
  const out: Record<string, FeaturedLesson[]> = {};
  for (const branch of ALL_BRANCHES) {
    for (const path of branch.paths) {
      for (const lesson of path.lessons) {
        // A lesson can quote the same thinker twice (Hume's standard of taste
        // does). Dedupe per lesson, or the profile claims two lessons where
        // there is one.
        const ids = new Set<string>();
        for (const card of lesson.cards) {
          if (card.type === 'quote' && card.philosopherId) ids.add(card.philosopherId);
        }
        for (const pid of ids) {
          (out[pid] ??= []).push({
            lessonId: lesson.id,
            title: lesson.title,
            branchSlug: branch.slug,
            branchName: branch.name,
            pathSlug: path.slug,
            pathId: path.id,
          });
        }
      }
    }
  }
  return out;
}

/** Every lesson that quotes this thinker, in curriculum order. Never null. */
export function lessonsFeaturing(philosopherId: string): FeaturedLesson[] {
  INDEX ??= build();
  return INDEX[philosopherId] ?? [];
}

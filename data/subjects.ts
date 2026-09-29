// ─────────────────────────────────────────────────────────────────────────────
// THE SUBJECTS — what Ashmere teaches, in one list (2026-09-29).
//
// The owner took the app from philosophy alone to seven subjects, Brilliant's shape:
// swipe through them on Home, browse them as tiles on Learn, open one to reach its
// courses. Philosophy is the only one with courses today — its six branches, each a
// walked road — and the other six open onto a road that ends at a Coming-soon sign.
//
// Home's carousel, the Learn grid and every subject page read THIS list, so they
// cannot disagree about what a subject is called, what colour it is or whether it
// is open. Adding a subject is one entry here. `npm run check:subjects` holds it.
//
// ── THE COLOURS ─────────────────────────────────────────────────────────────
//
// Each hue is struck the way the branch hues are: tame (C* ≤ 38 — "the more Tame
// colors, not as strong"), clear of the green wedge (hue 130–175) that `correct`
// owns, and no two closer than ΔE 11.4, the floor design.ts holds the branches to.
// Philosophy's is the palette's own DEEP. Measured (L* · C* · hue):
//
//   philosophy       #2A4343   26.5 · 10.0 · 198   the owner's DEEP
//   psychology       #4E5578   36.9 · 21.7 · 287   dusk slate
//   personal-growth  #6E7A4A   49.2 · 28.0 · 118   moss
//   business         #7A5A2E   40.6 · 31.2 ·  75   bronze
//   economics        #3A6E86   43.9 · 21.1 · 242   harbour blue
//   science          #2F6F73   43.1 · 20.8 · 204   lab teal
//   history          #8E5646   42.5 · 28.7 ·  42   brick
//
// Tightest pair: economics and science, ΔE 13.6.
// ─────────────────────────────────────────────────────────────────────────────
import type { BranchKey } from '@/constants/design';

export type SubjectSlug =
  | 'philosophy' | 'psychology' | 'personal-growth' | 'business'
  | 'economics' | 'science' | 'history';

export interface Subject {
  slug: SubjectSlug;
  /** Its full name, as a heading shows it. */
  name: string;
  /** The name a narrow tile or card shows. The same as `name` unless that is too long. */
  short: string;
  /** One line about it. */
  blurb: string;
  /** Its colour. The only place a subject hue is declared. */
  hue: string;
  /** `live` has courses a reader can open; `soon` is announced and empty. */
  status: 'live' | 'soon';
  /** The branches this subject's courses are, in display order. Empty until it has any. */
  courses: readonly BranchKey[];
}

export const SUBJECTS: readonly Subject[] = [
  {
    slug: 'philosophy', name: 'Philosophy', short: 'Philosophy',
    blurb: 'Reality, knowledge, right and wrong',
    hue: '#2A4343', status: 'live',
    courses: ['metaphysics', 'epistemology', 'logic', 'ethics', 'aesthetics', 'political-philosophy'],
  },
  {
    slug: 'psychology', name: 'Psychology', short: 'Psychology',
    blurb: 'How minds think, feel and decide',
    hue: '#4E5578', status: 'soon', courses: [],
  },
  {
    // U+2060 WORD JOINER after the hyphen: the name wrapped as 'Self-' / 'Help' on
    // the carousel card. The font has no non-breaking hyphen (U+2011 draws tofu), and
    // a joiner is default-ignorable, so it draws nothing and only forbids the break.
    slug: 'personal-growth', name: 'Personal Growth & Self-\u2060Help', short: 'Personal Growth',
    blurb: 'Habits, focus and a better you',
    hue: '#6E7A4A', status: 'soon', courses: [],
  },
  {
    slug: 'business', name: 'Business & Leadership', short: 'Business',
    blurb: 'Leading people and building things',
    hue: '#7A5A2E', status: 'soon', courses: [],
  },
  {
    slug: 'economics', name: 'Economics & Finance', short: 'Economics',
    blurb: 'Money, markets and why prices move',
    hue: '#3A6E86', status: 'soon', courses: [],
  },
  {
    slug: 'science', name: 'Science & Technology', short: 'Science & Tech',
    blurb: 'How the world works, and what we built',
    hue: '#2F6F73', status: 'soon', courses: [],
  },
  {
    slug: 'history', name: 'History & Politics', short: 'History',
    blurb: 'Power, people and how we got here',
    hue: '#8E5646', status: 'soon', courses: [],
  },
];

/**
 * The line under each course's name on a subject page. Measured by check:subjects at
 * two lines on a 320dp phone — the ethics line was cut there as "…how humans shoul…",
 * which is a clamp running out rather than a clamp chosen.
 */
export const COURSE_LINE: Record<BranchKey, string> = {
  metaphysics: 'Reality, existence & the nature of being',
  epistemology: 'Knowledge, belief, truth & justification',
  logic: 'Reasoning, arguments & valid thinking',
  ethics: 'Morality, right action & how to live',
  aesthetics: 'Beauty, art, creativity & aesthetic experience',
  'political-philosophy': 'Society, power, justice & political systems',
};

export function getSubject(slug: string): Subject | undefined {
  return SUBJECTS.find((s) => s.slug === slug);
}

/** The subject a branch belongs to — where its road goes back to. */
export function subjectOfBranch(branchSlug: string): Subject | undefined {
  return SUBJECTS.find((s) => (s.courses as readonly string[]).includes(branchSlug));
}

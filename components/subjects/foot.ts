// What a subject card and a subject tile say and wear under their picture (2026-09-30).
//
// The foot is the deepest colour IN the picture (subjectScenes SCENE_FOOT), so the
// words sit on the place rather than on a white slip cut out of it — the Quick Start
// card's construction, which the owner holds up as the better card. The ledge under
// the card is that colour taken further toward ink, so the card stands on its own
// shadow the way every pressable thing in the app does.
import { mix, INK } from '@/components/shared/tone';
import { SUBJECTS, roadOf, type Subject } from '@/data/subjects';
import { getBranchBySlug } from '@/data';
import { SCENE_FOOT, FOOT_TEXT, FOOT_SOFT } from './subjectScenes';

export { FOOT_TEXT, FOOT_SOFT };

/** The foot's colour, and the ledge under it. */
export function footOf(subject: Subject): { foot: string; ledge: string } {
  const foot = (SCENE_FOOT as Record<string, string | undefined>)[subject.slug] ?? mix(subject.hue, INK, 0.45);
  return { foot, ledge: mix(foot, INK, 0.55) };
}

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

/** How many lessons the subject's road holds — a count, never "N of M" (§19). */
export function lessonsIn(subject: Subject): number {
  const road = getBranchBySlug(roadOf(subject));
  return road ? road.paths.reduce((n, p) => n + p.lessons.length, 0) : 0;
}

/** The small line over a card's name: "SUBJECT III · 1 LESSON" — the road's masthead
 *  reads SUBJECT I…VII, so the card and the road it opens agree. */
export function kickerOf(subject: Subject): string {
  const i = SUBJECTS.findIndex((s) => s.slug === subject.slug);
  const n = lessonsIn(subject);
  const num = ROMAN[i] ?? String(i + 1);
  return n > 0 ? `SUBJECT ${num} · ${n} ${n === 1 ? 'LESSON' : 'LESSONS'}` : `SUBJECT ${num}`;
}

import type { Branch } from './types';
import logicBranch from './branches/logic';
import ethicsBranch from './branches/ethics';
import epistemologyBranch from './branches/epistemology';
import metaphysicsBranch from './branches/metaphysics';
import aestheticsBranch from './branches/aesthetics';
import politicalBranch from './branches/political-philosophy';

export const ALL_BRANCHES: Branch[] = [
  logicBranch,
  ethicsBranch,
  epistemologyBranch,
  metaphysicsBranch,
  aestheticsBranch,
  politicalBranch,
];

export function getBranchBySlug(slug: string): Branch | undefined {
  return ALL_BRANCHES.find((b) => b.slug === slug);
}

export function getLessonById(lessonId: string) {
  for (const branch of ALL_BRANCHES) {
    for (const path of branch.paths) {
      for (const lesson of path.lessons) {
        if (lesson.id === lessonId) return { branch, path, lesson };
      }
    }
  }
  return null;
}

export function isLessonUnlocked(lessonIndex: number, completedCount: number): boolean {
  if (lessonIndex === 0) return true;
  return completedCount >= lessonIndex;
}

export function isPathUnlocked(pathIndex: number, prevPathCompletionPct: number): boolean {
  if (pathIndex === 0) return true;
  return prevPathCompletionPct >= 60;
}

export function calculateStars(scorePercent: number): number {
  if (scorePercent === 100) return 3;
  if (scorePercent >= 70) return 2;
  if (scorePercent > 0) return 1;
  return 0;
}

export function calculateScore(correctAnswers: number, totalQuestions: number): number {
  if (totalQuestions === 0) return 100;
  return Math.round((correctAnswers / totalQuestions) * 100);
}

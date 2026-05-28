export const XP_PER_CORRECT_ANSWER = 5;
export const XP_PER_LESSON_COMPLETION = 25;
export const XP_PER_PERFECT_LESSON = 50;
export const XP_PER_PATH_MASTERY = 100;

// Level n requires Math.floor(50 * n * Math.sqrt(n)) XP total
export function getLevelFromXP(totalXP: number): number {
  let level = 1;
  while (getXPForLevel(level + 1) <= totalXP) level++;
  return level;
}

export function getXPForLevel(level: number): number {
  return Math.floor(50 * level * Math.sqrt(level));
}

export function getXPProgressInLevel(totalXP: number): { current: number; needed: number; percent: number } {
  const level = getLevelFromXP(totalXP);
  const currentLevelXP = getXPForLevel(level);
  const nextLevelXP = getXPForLevel(level + 1);
  const current = totalXP - currentLevelXP;
  const needed = nextLevelXP - currentLevelXP;
  return { current, needed, percent: Math.min(current / needed, 1) };
}

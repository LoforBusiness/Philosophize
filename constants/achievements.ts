export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpBonus: number;
  category: 'milestone' | 'streak' | 'mastery' | 'exploration';
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first-lesson', name: 'First Step', description: 'Complete your first lesson', icon: '🎯', xpBonus: 25, category: 'milestone' },
  { id: 'first-branch', name: 'Branch Explorer', description: 'Start your first philosophy branch', icon: '🌿', xpBonus: 25, category: 'milestone' },
  { id: 'logic-initiate', name: 'Logic Initiate', description: 'Complete the first Logic lesson', icon: '⚙️', xpBonus: 50, category: 'milestone' },
  { id: 'ethics-initiate', name: 'Ethics Initiate', description: 'Complete the first Ethics lesson', icon: '⚖️', xpBonus: 50, category: 'milestone' },
  { id: 'five-lessons', name: 'On a Roll', description: 'Complete 5 lessons', icon: '🔥', xpBonus: 50, category: 'milestone' },
  { id: 'twenty-lessons', name: 'Deep Thinker', description: 'Complete 20 lessons', icon: '🧠', xpBonus: 100, category: 'milestone' },
  { id: 'streak-3', name: '3-Day Streak', description: 'Learn 3 days in a row', icon: '🔥', xpBonus: 30, category: 'streak' },
  { id: 'streak-7', name: 'Weekly Philosopher', description: 'Learn 7 days in a row', icon: '🌟', xpBonus: 75, category: 'streak' },
  { id: 'streak-30', name: 'Devoted Thinker', description: 'Learn 30 days in a row', icon: '💎', xpBonus: 250, category: 'streak' },
  { id: 'level-5', name: 'Apprentice', description: 'Reach Level 5', icon: '🏅', xpBonus: 100, category: 'milestone' },
  { id: 'level-10', name: 'Philosopher', description: 'Reach Level 10', icon: '🏆', xpBonus: 200, category: 'milestone' },
  { id: 'perfect-lesson', name: 'Perfectionist', description: 'Complete a lesson with a perfect score', icon: '⭐', xpBonus: 50, category: 'mastery' },
  { id: 'five-perfect', name: 'Flawless Mind', description: 'Get 5 perfect lesson scores', icon: '✨', xpBonus: 100, category: 'mastery' },
  { id: 'first-path', name: 'Path Finder', description: 'Complete your first learning path', icon: '🗺️', xpBonus: 75, category: 'milestone' },
  { id: 'three-branches', name: 'Renaissance Mind', description: 'Start 3 different branches', icon: '🌐', xpBonus: 100, category: 'exploration' },
  { id: 'all-branches', name: 'Grand Philosopher', description: 'Start all 6 branches', icon: '👑', xpBonus: 300, category: 'exploration' },
  { id: 'night-owl', name: 'Night Owl', description: 'Complete a lesson after 10pm', icon: '🦉', xpBonus: 20, category: 'milestone' },
  { id: 'early-bird', name: 'Early Bird', description: 'Complete a lesson before 8am', icon: '🌅', xpBonus: 20, category: 'milestone' },
  { id: 'fallacy-buster', name: 'Fallacy Buster', description: 'Complete the Logical Fallacies path', icon: '🚫', xpBonus: 100, category: 'mastery' },
  { id: 'ethicist', name: 'Ethicist', description: 'Complete 5 Ethics lessons', icon: '🕊️', xpBonus: 75, category: 'exploration' },
];

import { supabase } from './client';
import { calculateStars, calculateScore } from '@/lib/utils/progress';
import { calculateNewStreak } from '@/lib/utils/streak';
import type { AnswerResult } from '@/data/types';

export interface CompleteLessonPayload {
  userId: string;
  lessonId: string;
  pathId: string;
  answers: AnswerResult[];
  totalQuestions: number;
  timeSpentSeconds: number;
  xpEarned: number;
}

export async function completeLesson(payload: CompleteLessonPayload) {
  const correctAnswers = payload.answers.filter((a) => a.correct).length;
  const score = calculateScore(correctAnswers, payload.totalQuestions);
  const stars = calculateStars(score);

  // Upsert lesson progress
  await supabase.from('user_lesson_progress').insert({
    user_id: payload.userId,
    lesson_id: payload.lessonId,
    score,
    stars,
    xp_earned: payload.xpEarned,
    time_spent_secs: payload.timeSpentSeconds,
  });

  // Update XP
  const { data: xpRow } = await supabase
    .from('user_xp')
    .select('total_xp')
    .eq('user_id', payload.userId)
    .single();

  const newXP = (xpRow?.total_xp ?? 0) + payload.xpEarned;
  await supabase.from('user_xp').upsert({ user_id: payload.userId, total_xp: newXP });

  // Update streak
  const { data: streakRow } = await supabase
    .from('user_streaks')
    .select('current_streak, last_activity_date, longest_streak')
    .eq('user_id', payload.userId)
    .single();

  const lastDate = streakRow?.last_activity_date ? new Date(streakRow.last_activity_date) : null;
  const newStreak = calculateNewStreak(streakRow?.current_streak ?? 0, lastDate);
  const longestStreak = Math.max(newStreak, streakRow?.longest_streak ?? 0);

  await supabase.from('user_streaks').upsert({
    user_id: payload.userId,
    current_streak: newStreak,
    longest_streak: longestStreak,
    last_activity_date: new Date().toISOString().split('T')[0],
  });

  return { score, stars, newXP, newStreak };
}

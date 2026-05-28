import { create } from 'zustand';
import type { LessonSession, Lesson, AnswerResult } from '@/data/types';

interface LessonStore {
  session: LessonSession | null;
  startSession: (lesson: Lesson) => void;
  advance: () => void;
  goBack: () => void;
  recordAnswer: (result: AnswerResult) => void;
  endSession: () => void;
}

export const useLessonStore = create<LessonStore>((set, get) => ({
  session: null,

  startSession: (lesson) =>
    set({
      session: {
        lesson,
        currentIndex: 0,
        direction: 1,
        answers: [],
        sessionXP: 0,
        startedAt: Date.now(),
      },
    }),

  advance: () =>
    set((state) => {
      if (!state.session) return state;
      const next = Math.min(state.session.currentIndex + 1, state.session.lesson.cards.length - 1);
      return { session: { ...state.session, currentIndex: next, direction: 1 } };
    }),

  goBack: () =>
    set((state) => {
      if (!state.session) return state;
      const prev = Math.max(state.session.currentIndex - 1, 0);
      return { session: { ...state.session, currentIndex: prev, direction: -1 } };
    }),

  recordAnswer: (result) =>
    set((state) => {
      if (!state.session) return state;
      const answers = [...state.session.answers, result];
      const sessionXP = state.session.sessionXP + result.xpEarned;
      return { session: { ...state.session, answers, sessionXP } };
    }),

  endSession: () => set({ session: null }),
}));

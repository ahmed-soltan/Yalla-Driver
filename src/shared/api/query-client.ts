import { QueryClient } from '@tanstack/react-query';

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: 2,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

/**
 * Central query-key registry so entity slices don't invent ad-hoc key
 * shapes. Extend per-entity, e.g. queryKeys.courses.detail(id).
 */
export const queryKeys = {
  captain: {
    profile: ['captain', 'profile'] as const,
    verification: ['captain', 'verification'] as const,
    vehicle: ['captain', 'vehicle'] as const,
  },
  courses: {
    all: ['courses'] as const,
    list: () => [...queryKeys.courses.all, 'list'] as const,
    detail: (courseId: number) => [...queryKeys.courses.all, 'detail', courseId] as const,
  },
  lessons: {
    all: ['lessons'] as const,
    byCourse: (courseId: number) => [...queryKeys.lessons.all, 'byCourse', courseId] as const,
    detail: (lessonId: number) => [...queryKeys.lessons.all, 'detail', lessonId] as const,
    aiAssistantMessages: (lessonId: number) => [...queryKeys.lessons.all, 'ai-assistant-messages', lessonId] as const,
  },
  quizzes: {
    all: ['quizzes'] as const,
    detail: (quizId: number) => [...queryKeys.quizzes.all, 'detail', quizId] as const,
  },
  missions: {
    all: ['missions'] as const,
  },
  notifications: {
    all: ['notifications'] as const,
  },
  profile: {
    me: ['profile', 'me'] as const,
  },
} as const;

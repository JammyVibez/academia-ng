import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import type {
  AcademicLevel,
  CoursePage,
  Dashboard,
  DepartmentSummary,
  FacultySummary,
  UniversitySummary,
} from './types';

export interface CourseFilters {
  search?: string;
  academicLevel?: AcademicLevel | '';
  semester?: number | '';
}

export const queryKeys = {
  universities: ['universities'] as const,
  faculties: (universityId: string) => ['faculties', universityId] as const,
  departments: (facultyId: string) => ['departments', facultyId] as const,
  dashboard: ['dashboard'] as const,
  courses: (filters: CourseFilters) => ['courses', filters] as const,
};

export function useUniversities() {
  return useQuery({
    queryKey: queryKeys.universities,
    queryFn: () => api<UniversitySummary[]>('/auth/universities', { auth: false }),
    staleTime: 5 * 60_000,
  });
}

export function useFaculties(universityId: string) {
  return useQuery({
    queryKey: queryKeys.faculties(universityId),
    queryFn: () =>
      api<FacultySummary[]>(`/auth/universities/${encodeURIComponent(universityId)}/faculties`, { auth: false }),
    enabled: Boolean(universityId),
  });
}

export function useDepartments(facultyId: string) {
  return useQuery({
    queryKey: queryKeys.departments(facultyId),
    queryFn: () => api<DepartmentSummary[]>(`/auth/faculties/${encodeURIComponent(facultyId)}/departments`, {
      auth: false,
    }),
    enabled: Boolean(facultyId),
  });
}

export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: () => api<Dashboard>('/courses/me/dashboard'),
  });
}

export function useCourses(filters: CourseFilters) {
  return useInfiniteQuery({
    queryKey: queryKeys.courses(filters),
    initialPageParam: 1,
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.academicLevel) params.set('academicLevel', filters.academicLevel);
      if (filters.semester) params.set('semester', String(filters.semester));
      params.set('page', String(pageParam));
      params.set('limit', '20');
      return api<CoursePage>(`/courses?${params.toString()}`);
    },
    getNextPageParam: (lastPage) =>
      lastPage.pagination.page < lastPage.pagination.totalPages ? lastPage.pagination.page + 1 : undefined,
  });
}

export function useEnrolment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, enrolled }: { courseId: string; enrolled: boolean }) =>
      enrolled
        ? api<{ success?: boolean }>(`/courses/enroll/${encodeURIComponent(courseId)}`, { method: 'DELETE' })
        : api<unknown>('/courses/enroll', { method: 'POST', body: { courseId } }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard }),
        queryClient.invalidateQueries({ queryKey: ['courses'] }),
      ]);
    },
  });
}

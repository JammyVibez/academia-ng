export type AcademicLevel =
  | 'YEAR_1'
  | 'YEAR_2'
  | 'YEAR_3'
  | 'YEAR_4'
  | 'YEAR_5'
  | 'YEAR_6'
  | 'POSTGRADUATE';

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface UniversitySummary {
  id: string;
  name: string;
  shortName?: string | null;
  logoUrl?: string | null;
  state?: string | null;
}

export interface FacultySummary {
  id: string;
  name: string;
}

export interface DepartmentSummary {
  id: string;
  name: string;
}

export interface Profile {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
  role?: string;
  academicLevel?: AcademicLevel | null;
  currentSemester?: number | null;
  university?: UniversitySummary | null;
  faculty?: FacultySummary | null;
  department?: DepartmentSummary | null;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  units: number;
  academicLevel?: AcademicLevel | null;
  semester?: number | null;
  department?: { id?: string; name: string } | null;
  university?: { id: string; name?: string; shortName?: string | null } | null;
}

export interface EnrolledCourse extends Course {
  enrollmentId: string;
  session?: string | null;
  enrolledAt?: string;
}

export interface Dashboard {
  profile: Profile;
  registeredCourses: EnrolledCourse[];
  continueLearning: Course[];
  recommendedCourses: Course[];
  stats: {
    enrolledCount: number;
    recommendedCount: number;
  };
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CoursePage {
  items: Course[];
  pagination: Pagination;
}

export interface AuthResult {
  user: Profile;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
  universityId: string;
  facultyId?: string;
  departmentId?: string;
  academicLevel: AcademicLevel;
}

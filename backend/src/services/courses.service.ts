import { AcademicLevel, Prisma } from '@prisma/client';
import { prisma } from '../utils/prisma';
import { AppError } from '../utils/AppError';

export interface CourseFilters {
  universityId?: string;
  departmentId?: string;
  facultyId?: string;
  academicLevel?: AcademicLevel;
  semester?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export async function listCourses(filters: CourseFilters) {
  const page = Math.max(1, filters.page || 1);
  const limit = Math.min(50, Math.max(1, filters.limit || 20));
  const skip = (page - 1) * limit;

  const where: Prisma.CourseWhereInput = {
    isActive: true,
    ...(filters.universityId && { universityId: filters.universityId }),
    ...(filters.departmentId && { departmentId: filters.departmentId }),
    ...(filters.academicLevel && { academicLevel: filters.academicLevel }),
    ...(filters.semester && { semester: filters.semester }),
    ...(filters.search && {
      OR: [
        { code: { contains: filters.search, mode: 'insensitive' } },
        { title: { contains: filters.search, mode: 'insensitive' } },
      ],
    }),
    ...(filters.facultyId && { department: { facultyId: filters.facultyId } }),
  };

  const [items, total] = await Promise.all([
    prisma.course.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ code: 'asc' }],
      include: {
        department: { select: { id: true, name: true } },
        university: { select: { id: true, shortName: true, name: true } },
        _count: { select: { enrollments: true } },
      },
    }),
    prisma.course.count({ where }),
  ]);

  return {
    items,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getCourseById(id: string) {
  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      department: { select: { id: true, name: true, facultyId: true } },
      university: { select: { id: true, shortName: true, name: true } },
      _count: { select: { enrollments: true } },
    },
  });
  if (!course || !course.isActive) throw new AppError('Course not found', 404);
  return course;
}

export async function enroll(userId: string, courseId: string, session?: string, semester?: number) {
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course || !course.isActive) throw new AppError('Course not found', 404);

  const existing = await prisma.courseEnrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });
  if (existing) throw new AppError('Already enrolled in this course', 409);

  return prisma.courseEnrollment.create({
    data: {
      userId,
      courseId,
      session: session || null,
      semester: semester ?? course.semester ?? null,
    },
    include: {
      course: {
        select: { id: true, code: true, title: true, units: true, academicLevel: true, semester: true },
      },
    },
  });
}

export async function unenroll(userId: string, courseId: string) {
  const existing = await prisma.courseEnrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });
  if (!existing) throw new AppError('Not enrolled in this course', 404);
  await prisma.courseEnrollment.delete({ where: { id: existing.id } });
  return { success: true };
}

export async function listMyCourses(userId: string) {
  const enrollments = await prisma.courseEnrollment.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      course: {
        include: {
          department: { select: { id: true, name: true } },
          university: { select: { id: true, shortName: true } },
          _count: { select: { enrollments: true } },
        },
      },
    },
  });
  return enrollments.map((e) => ({
    enrollmentId: e.id,
    session: e.session,
    semester: e.semester,
    enrolledAt: e.createdAt,
    ...e.course,
  }));
}

export async function getDashboard(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      university: { select: { id: true, name: true, shortName: true, logoUrl: true } },
      faculty: { select: { id: true, name: true } },
      department: { select: { id: true, name: true } },
    },
  });
  if (!user) throw new AppError('User not found', 404);

  const enrollments = await prisma.courseEnrollment.findMany({
    where: { userId },
    take: 8,
    orderBy: { createdAt: 'desc' },
    include: {
      course: {
        select: {
          id: true,
          code: true,
          title: true,
          units: true,
          academicLevel: true,
          semester: true,
        },
      },
    },
  });

  const enrolledIds = enrollments.map((e) => e.courseId);
  const recommended = user.universityId
    ? await prisma.course.findMany({
        where: {
          isActive: true,
          universityId: user.universityId,
          ...(user.academicLevel && { academicLevel: user.academicLevel }),
          id: { notIn: enrolledIds.length ? enrolledIds : ['__none__'] },
        },
        take: 6,
        orderBy: { code: 'asc' },
        select: {
          id: true,
          code: true,
          title: true,
          units: true,
          academicLevel: true,
          semester: true,
          department: { select: { name: true } },
        },
      })
    : [];

  return {
    profile: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      avatarUrl: user.avatarUrl,
      academicLevel: user.academicLevel,
      currentSemester: user.currentSemester,
      university: user.university,
      faculty: user.faculty,
      department: user.department,
    },
    registeredCourses: enrollments.map((e) => ({ enrollmentId: e.id, ...e.course })),
    continueLearning: enrollments.slice(0, 4).map((e) => e.course),
    recommendedCourses: recommended,
    stats: { enrolledCount: enrollments.length, recommendedCount: recommended.length },
  };
}

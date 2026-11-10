import { z } from 'zod';

export const registerSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email().toLowerCase(),
  password: z.string().min(8).regex(/[A-Za-z]/).regex(/[0-9]/),
  universityId: z.string().min(1),
  facultyId: z.string().optional(),
  departmentId: z.string().optional(),
  academicLevel: z
    .enum(['YEAR_1', 'YEAR_2', 'YEAR_3', 'YEAR_4', 'YEAR_5', 'YEAR_6', 'POSTGRADUATE'])
    .optional(),
});

export const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email().toLowerCase(),
});

export const updateProfileSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  universityId: z.string().nullable().optional(),
  facultyId: z.string().nullable().optional(),
  departmentId: z.string().nullable().optional(),
  academicLevel: z
    .enum(['YEAR_1', 'YEAR_2', 'YEAR_3', 'YEAR_4', 'YEAR_5', 'YEAR_6', 'POSTGRADUATE'])
    .nullable()
    .optional(),
  currentSemester: z.number().int().min(1).max(3).nullable().optional(),
  avatarUrl: z.string().url().nullable().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

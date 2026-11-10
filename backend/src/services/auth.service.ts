import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';
import { AppError } from '../utils/AppError';
import { config } from '../config';
import { RegisterInput, LoginInput, UpdateProfileInput } from '../validators/auth';
import { Role } from '@prisma/client';

const SALT_ROUNDS = 12;

function signAccessToken(userId: string, role: Role) {
  return jwt.sign({ userId, role }, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn as string | number,
  } as jwt.SignOptions);
}

function signRefreshToken(userId: string) {
  return jwt.sign({ userId }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn as string | number,
  } as jwt.SignOptions);
}

function sanitizeUser(user: any) {
  const { passwordHash, ...safe } = user;
  return safe;
}

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw new AppError('An account with this email already exists', 409);

  if (input.universityId) {
    const uni = await prisma.university.findUnique({ where: { id: input.universityId } });
    if (!uni) throw new AppError('Invalid university', 400);
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      fullName: input.fullName,
      universityId: input.universityId || null,
      facultyId: input.facultyId || null,
      departmentId: input.departmentId || null,
      academicLevel: input.academicLevel as any,
      role: Role.STUDENT,
    },
  });

  const accessToken = signAccessToken(user.id, user.role);
  const refreshToken = signRefreshToken(user.id);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  await prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id, expiresAt } });

  return { user: sanitizeUser(user), accessToken, refreshToken };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) throw new AppError('Invalid email or password', 401);
  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) throw new AppError('Invalid email or password', 401);

  const accessToken = signAccessToken(user.id, user.role);
  const refreshToken = signRefreshToken(user.id);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  await prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id, expiresAt } });

  return { user: sanitizeUser(user), accessToken, refreshToken };
}

export async function refresh(refreshToken: string) {
  let payload: { userId: string };
  try {
    payload = jwt.verify(refreshToken, config.jwt.refreshSecret) as { userId: string };
  } catch {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
  if (!stored || stored.revoked || stored.expiresAt < new Date()) {
    throw new AppError('Refresh token revoked or expired', 401);
  }

  await prisma.refreshToken.update({ where: { id: stored.id }, data: { revoked: true } });

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user) throw new AppError('User not found', 401);

  const accessToken = signAccessToken(user.id, user.role);
  const newRefresh = signRefreshToken(user.id);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  await prisma.refreshToken.create({ data: { token: newRefresh, userId: user.id, expiresAt } });

  return { user: sanitizeUser(user), accessToken, refreshToken: newRefresh };
}

export async function logout(refreshToken: string) {
  const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
  if (stored) {
    await prisma.refreshToken.update({ where: { id: stored.id }, data: { revoked: true } });
  }
}

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      university: { select: { id: true, name: true, shortName: true, logoUrl: true } },
      faculty: { select: { id: true, name: true } },
      department: { select: { id: true, name: true } },
    },
  });
  if (!user) throw new AppError('User not found', 404);
  return sanitizeUser(user);
}

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(input.fullName !== undefined && { fullName: input.fullName }),
      ...(input.universityId !== undefined && { universityId: input.universityId }),
      ...(input.facultyId !== undefined && { facultyId: input.facultyId }),
      ...(input.departmentId !== undefined && { departmentId: input.departmentId }),
      ...(input.academicLevel !== undefined && { academicLevel: input.academicLevel as any }),
      ...(input.currentSemester !== undefined && { currentSemester: input.currentSemester }),
      ...(input.avatarUrl !== undefined && { avatarUrl: input.avatarUrl }),
    },
    include: {
      university: { select: { id: true, name: true, shortName: true, logoUrl: true } },
      faculty: { select: { id: true, name: true } },
      department: { select: { id: true, name: true } },
    },
  });
  return sanitizeUser(user);
}

export async function listUniversities() {
  return prisma.university.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, shortName: true, logoUrl: true, state: true },
  });
}

export async function listFaculties(universityId: string) {
  return prisma.faculty.findMany({
    where: { universityId },
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  });
}

export async function listDepartments(facultyId: string) {
  return prisma.department.findMany({
    where: { facultyId },
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  });
}

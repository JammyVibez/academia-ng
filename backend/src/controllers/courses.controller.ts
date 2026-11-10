import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AcademicLevel } from '@prisma/client';
import * as coursesService from '../services/courses.service';
import { AppError } from '../utils/AppError';

const listSchema = z.object({
  universityId: z.string().optional(),
  departmentId: z.string().optional(),
  facultyId: z.string().optional(),
  academicLevel: z.nativeEnum(AcademicLevel).optional(),
  semester: z.coerce.number().int().min(1).max(3).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

const enrollSchema = z.object({
  courseId: z.string().min(1),
  session: z.string().optional(),
  semester: z.number().int().min(1).max(3).optional(),
});

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const filters = listSchema.parse(req.query);
    const data = await coursesService.listCourses(filters);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getOne(req: Request, res: Response, next: NextFunction) {
  try {
    const course = await coursesService.getCourseById(req.params.id);
    res.json({ success: true, data: course });
  } catch (err) {
    next(err);
  }
}

export async function enroll(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const input = enrollSchema.parse(req.body);
    const data = await coursesService.enroll(
      req.user.userId,
      input.courseId,
      input.session,
      input.semester
    );
    res.status(201).json({ success: true, message: 'Enrolled successfully', data });
  } catch (err) {
    next(err);
  }
}

export async function unenroll(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    await coursesService.unenroll(req.user.userId, req.params.courseId);
    res.json({ success: true, message: 'Unenrolled successfully' });
  } catch (err) {
    next(err);
  }
}

export async function myCourses(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const data = await coursesService.listMyCourses(req.user.userId);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function dashboard(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const data = await coursesService.getDashboard(req.user.userId);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

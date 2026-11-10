import { Request, Response, NextFunction } from 'express';
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  updateProfileSchema,
  forgotPasswordSchema,
} from '../validators/auth';
import * as authService from '../services/auth.service';
import { AppError } from '../utils/AppError';

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const input = registerSchema.parse(req.body);
    const result = await authService.register(input);
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const input = loginSchema.parse(req.body);
    const result = await authService.login(input);
    res.json({
      success: true,
      message: 'Logged in successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = refreshSchema.parse(req.body);
    const result = await authService.refresh(refreshToken);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = refreshSchema.parse(req.body);
    await authService.logout(refreshToken);
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const profile = await authService.getProfile(req.user.userId);
    res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const input = updateProfileSchema.parse(req.body);
    const profile = await authService.updateProfile(req.user.userId, input);
    res.json({ success: true, message: 'Profile updated', data: profile });
  } catch (err) {
    next(err);
  }
}

export async function listUniversities(_req: Request, res: Response, next: NextFunction) {
  try {
    const universities = await authService.listUniversities();
    res.json({ success: true, data: universities });
  } catch (err) {
    next(err);
  }
}

export async function listFaculties(req: Request, res: Response, next: NextFunction) {
  try {
    const { universityId } = req.params;
    const faculties = await authService.listFaculties(universityId);
    res.json({ success: true, data: faculties });
  } catch (err) {
    next(err);
  }
}

export async function listDepartments(req: Request, res: Response, next: NextFunction) {
  try {
    const { facultyId } = req.params;
    const departments = await authService.listDepartments(facultyId);
    res.json({ success: true, data: departments });
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req: Request, res: Response, next: NextFunction) {
  try {
    forgotPasswordSchema.parse(req.body);
    res.json({
      success: true,
      message: 'If an account exists with that email, a reset link has been sent.',
    });
  } catch (err) {
    next(err);
  }
}

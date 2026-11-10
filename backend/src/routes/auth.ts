import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';

export const authRouter = Router();

authRouter.post('/register', authController.register);
authRouter.post('/login', authController.login);
authRouter.post('/refresh', authController.refresh);
authRouter.post('/logout', authController.logout);
authRouter.post('/forgot-password', authController.forgotPassword);

authRouter.get('/universities', authController.listUniversities);
authRouter.get('/universities/:universityId/faculties', authController.listFaculties);
authRouter.get('/faculties/:facultyId/departments', authController.listDepartments);

authRouter.get('/me', authenticate, authController.me);
authRouter.patch('/me', authenticate, authController.updateProfile);

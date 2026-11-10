import { Router } from 'express';
import * as coursesController from '../controllers/courses.controller';
import { authenticate } from '../middleware/auth';

export const coursesRouter = Router();

coursesRouter.get('/me/enrolled', authenticate, coursesController.myCourses);
coursesRouter.get('/me/dashboard', authenticate, coursesController.dashboard);
coursesRouter.post('/enroll', authenticate, coursesController.enroll);
coursesRouter.delete('/enroll/:courseId', authenticate, coursesController.unenroll);

coursesRouter.get('/', coursesController.list);
coursesRouter.get('/:id', coursesController.getOne);

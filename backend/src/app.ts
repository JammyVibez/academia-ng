import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { healthRouter } from './routes/health';
import { authRouter } from './routes/auth';
import { coursesRouter } from './routes/courses';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  })
);
app.use(morgan(config.isDev ? 'dev' : 'combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/', (_req, res) => {
  res.json({
    success: true,
    name: 'Academia NG API',
    version: '0.3.0',
    message: 'API is running. Use the paths below (all under /api).',
    endpoints: {
      health: 'GET /api/health',
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      me: 'GET /api/auth/me (Bearer token)',
      universities: 'GET /api/auth/universities',
      courses: 'GET /api/courses',
      dashboard: 'GET /api/courses/me/dashboard (Bearer token)',
      enrolled: 'GET /api/courses/me/enrolled (Bearer token)',
      enroll: 'POST /api/courses/enroll (Bearer token)',
    },
  });
});

app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/courses', coursesRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;

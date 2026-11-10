import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { healthRouter } from './routes/health';
import { authRouter } from './routes/auth';

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

app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;

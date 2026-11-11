import app from './app';
import { config } from './config';

const server = app.listen(config.port, () => {
  console.log(`Academia NG API listening on http://localhost:${config.port} (${config.env})`);
});

function shutdown(signal: string) {
  console.log(`${signal} received — shutting down`);
  server.close(() => process.exit(0));
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

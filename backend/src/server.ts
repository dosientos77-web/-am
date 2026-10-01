import app from './app';
import { env, validateEnv } from './config/env';
import { connectDatabase } from './config/database';

async function bootstrap(): Promise<void> {
  validateEnv();
  await connectDatabase();

  app.listen(env.port, () => {
    console.log(`[SERVER] ÑamFod API running on port ${env.port} in ${env.nodeEnv} mode`);
  });
}

bootstrap().catch((err) => {
  console.error('[FATAL] Failed to start server:', err);
  process.exit(1);
});

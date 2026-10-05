import bcrypt from 'bcryptjs';
import { connectDatabase, disconnectDatabase } from '../config/database';
import { env } from '../config/env';
import { User } from '../models/User';
import { UserRole, UserStatus } from '../types';

const TEST_USERS = [
  { name: 'Administrador ÑamFod', email: 'admin@namfod.test', role: UserRole.ADMIN },
  { name: 'Restaurante Demo', email: 'restaurant@namfod.test', role: UserRole.RESTAURANT },
  { name: 'Repartidor Demo', email: 'delivery@namfod.test', role: UserRole.DELIVERY },
];

async function seedDevelopmentUsers(): Promise<void> {
  if (env.nodeEnv === 'production') {
    throw new Error('Development seed cannot run in production');
  }

  const password = process.env.SEED_PASSWORD;
  if (!password || password.length < 8) {
    throw new Error('Set SEED_PASSWORD with at least 8 characters before running the seed');
  }

  await connectDatabase();
  const passwordHash = await bcrypt.hash(password, env.bcryptRounds);

  for (const testUser of TEST_USERS) {
    const existing = await User.findOne({ email: testUser.email });

    if (existing) {
      console.log(`[SEED] Skipped existing user: ${testUser.email}`);
      continue;
    }

    await User.create({
      ...testUser,
      passwordHash,
      status: UserStatus.ACTIVE,
    });

    console.log(`[SEED] Created ${testUser.role}: ${testUser.email}`);
  }
}

seedDevelopmentUsers()
  .then(async () => {
    await disconnectDatabase();
    console.log('[SEED] Development users ready');
  })
  .catch(async (error) => {
    console.error('[SEED] Failed:', error instanceof Error ? error.message : error);
    await disconnectDatabase().catch(() => undefined);
    process.exit(1);
  });

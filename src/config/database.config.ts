import { registerAs } from '@nestjs/config';
import { join } from 'path';

export default registerAs('database', () => {
  const databaseUrl = process.env.DATABASE_URL;

  // Production: PostgreSQL via DATABASE_URL (Neon, Supabase, etc.)
  if (databaseUrl) {
    return {
      type: 'postgres',
      url: databaseUrl,
      autoLoadEntities: true,
      synchronize: true, // Auto-create tables (disable in production if using migrations)
      ssl: { rejectUnauthorized: false },
      logging: process.env.NODE_ENV === 'development',
    };
  }

  // Development: SQLite (zero config)
  return {
    type: 'better-sqlite3',
    database: join(process.cwd(), 'data', 'finance.db'),
    autoLoadEntities: true,
    synchronize: true,
    logging: process.env.NODE_ENV === 'development',
  };
});


import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const dbPath = process.env.DB_FILE_NAME || 'sqlite.db';
const sqlite = new Database(dbPath);

export const db = drizzle(sqlite, { schema });

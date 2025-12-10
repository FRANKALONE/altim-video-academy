
import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

export default {
    schema: './src/db/schema.ts',
    out: './drizzle',
    dialect: 'sqlite',
    dbCredentials: {
        url: process.env.DB_FILE_NAME || 'sqlite.db',
    },
} satisfies Config;

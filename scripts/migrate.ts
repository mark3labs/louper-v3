import { drizzle } from 'drizzle-orm/bun-sqlite';
import { migrate } from 'drizzle-orm/bun-sqlite/migrator';
import { Database } from 'bun:sqlite';

const sqlite = new Database('./data/louper.db');
const db = drizzle(sqlite);

migrate(db, { migrationsFolder: './drizzle' });

console.info('Migration complete');
process.exit(0);
